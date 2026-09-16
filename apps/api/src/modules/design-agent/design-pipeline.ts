import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { BadRequestError, NotFoundError } from '../../platform/errors.js';
import { parsePrintArea, renderMockup } from '../../platform/compositor.js';
import { prisma } from '../../platform/prisma.js';
import {
  imageEditProvider,
  imageGenProvider,
} from '../../providers/image/index.js';
import {
  buildEditPrompt,
  buildImagePrompt,
} from '../../providers/image/prompt-builder.js';
import { localStorageProvider } from '../../providers/storage/local.provider.js';
import {
  defaultPlacement,
  placementSchema,
  type DesignBrief,
  type Placement,
} from '../../providers/llm/types.js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ASSETS_ROOT, ASSETS_URL_PREFIX } from '../../platform/assets.js';

const ARTWORK_SIZE = 1024;

export const versionSelect = {
  id: true,
  versionNumber: true,
  imagePrompt: true,
  provider: true,
  brief: true,
  derivedFromVersionId: true,
  createdAt: true,
  artwork: { select: { storageKey: true } },
  mockup: { select: { storageKey: true } },
} as const;

type VersionRow = {
  id: string;
  versionNumber: number;
  imagePrompt: string | null;
  provider: string;
  brief: unknown;
  derivedFromVersionId: string | null;
  createdAt: Date;
  artwork: { storageKey: string } | null;
  mockup: { storageKey: string } | null;
};

export function toVersionDto(version: VersionRow) {
  const parsed = placementSchema.safeParse(
    (version.brief as { placement?: unknown } | null)?.placement,
  );

  return {
    id: version.id,
    versionNumber: version.versionNumber,
    imagePrompt: version.imagePrompt,
    provider: version.provider,
    placement: parsed.success ? parsed.data : defaultPlacement,
    derivedFromVersionId: version.derivedFromVersionId,
    createdAt: version.createdAt,
    artworkUrl: version.artwork
      ? localStorageProvider.publicUrl(version.artwork.storageKey)
      : null,
    mockupUrl: version.mockup
      ? localStorageProvider.publicUrl(version.mockup.storageKey)
      : null,
  };
}

/** The agent can declare READY too early. The server decides for itself. */
function assertGeneratable(
  brief: DesignBrief,
  hasSourceImage: boolean,
): void {
  if (!brief.artworkSource) {
    throw new BadRequestError('עוד לא ברור אם לייצר עיצוב או להשתמש בתמונה שלך');
  }

  if (brief.artworkSource === 'GENERATE' && !brief.subject) {
    throw new BadRequestError('חסר תיאור של מה שיופיע בעיצוב');
  }

  if (brief.artworkSource !== 'GENERATE' && !hasSourceImage) {
    throw new BadRequestError('צריך להעלות תמונה כדי להמשיך');
  }
}

async function loadProductImage(imageUrl: string): Promise<Buffer> {
  // Our own product photos live on disk — no network round-trip needed.
  if (imageUrl.startsWith(ASSETS_URL_PREFIX)) {
    const file = resolve(ASSETS_ROOT, imageUrl.slice(ASSETS_URL_PREFIX.length));

    if (!file.startsWith(ASSETS_ROOT)) {
      throw new Error(`Refusing to read outside the assets root: ${imageUrl}`);
    }

    return readFile(file);
  }

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Product image fetch failed with ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}


export async function createDesignVersion(input: {
  userId: string;
  projectId: string;
  brief: DesignBrief;
}) {
  const { userId, projectId, brief } = input;

  const project = await prisma.designProject.findFirst({
    where: { id: projectId, userId },
    select: {
      sourceAsset: { select: { storageKey: true } },
      product: { select: { imageUrl: true, printArea: true } },
    },
  });

  if (!project) {
    throw new NotFoundError('Design project not found');
  }

  assertGeneratable(brief, Boolean(project.sourceAsset));

  // ---- produce the artwork (slow; no database locks held here) ----
  // Generation and transformation need different instructions, so the prompt
  // is built per path rather than once.
  const prompt =
    brief.artworkSource === 'UPLOAD_TRANSFORM'
      ? buildEditPrompt(brief)
      : buildImagePrompt(brief);

  // The router: artworkSource decides which capability runs — or whether any
  // external model runs at all.
  let raw: Buffer;
  let providerName: string;

  if (brief.artworkSource === 'GENERATE') {
    raw = await imageGenProvider.generate({
      prompt,
      width: ARTWORK_SIZE,
      height: ARTWORK_SIZE,
    });
    providerName = imageGenProvider.name;
  } else {
    const source = await localStorageProvider.read(
      project.sourceAsset!.storageKey,
    );

    if (brief.artworkSource === 'UPLOAD_TRANSFORM') {
      raw = await imageEditProvider.edit({
        image: source,
        prompt,
        width: ARTWORK_SIZE,
        height: ARTWORK_SIZE,
      });
      providerName = imageEditProvider.name;
    } else {
      // UPLOAD — the user's own picture, used as-is. No model, no cost.
      raw = source;
      providerName = 'none';
    }
  }

  // Generated art sits on a large transparent canvas, so a big part of the file
  // is empty margin. Trimming makes the artwork's bounds equal the design's —
  // what the mockup needs to fill the print area, and what a printer needs to
  // size the output. It is harmless on a photo, which has nothing to trim.
  const artwork = await sharp(raw).trim().png().toBuffer();
  const artworkMeta = await sharp(artwork).metadata();

  const productImage = await loadProductImage(project.product.imageUrl);


  const mockup = await renderMockup({
    productImage,
    artwork,
    printArea: parsePrintArea(project.product.printArea),
    placement: brief.placement,
  });

  const mockupMeta = await sharp(mockup).metadata();

  const artworkKey = `artwork/${projectId}/${randomUUID()}.png`;
  const mockupKey = `mockup/${projectId}/${randomUUID()}.png`;

  await localStorageProvider.put(artworkKey, artwork, 'image/png');
  await localStorageProvider.put(mockupKey, mockup, 'image/png');

  const last = await prisma.designVersion.findFirst({
    where: { projectId },
    orderBy: { versionNumber: 'desc' },
    select: { versionNumber: true },
  });

  // ---- record it, all or nothing ----
  const version = await prisma.$transaction(async (tx) => {
    const artworkAsset = await tx.asset.create({
      data: {
        userId,
        kind: 'ARTWORK',
        mimeType: 'image/png',
        width: artworkMeta.width ?? ARTWORK_SIZE,
        height: artworkMeta.height ?? ARTWORK_SIZE,
        bytes: artwork.length,
        storageKey: artworkKey,
      },
      select: { id: true },
    });

    const mockupAsset = await tx.asset.create({
      data: {
        userId,
        kind: 'MOCKUP',
        mimeType: 'image/png',
        width: mockupMeta.width ?? 0,
        height: mockupMeta.height ?? 0,
        bytes: mockup.length,
        storageKey: mockupKey,
      },
      select: { id: true },
    });

    const created = await tx.designVersion.create({
      data: {
        projectId,
        versionNumber: (last?.versionNumber ?? 0) + 1,
        brief,
        imagePrompt: prompt,
        artworkAssetId: artworkAsset.id,
        mockupAssetId: mockupAsset.id,
        provider: providerName,
      },
      select: versionSelect,
    });

    await tx.designProject.update({
      where: { id: projectId },
      data: { currentVersionId: created.id, status: 'READY' },
    });

    return created;
  });

  return toVersionDto(version);
}


/**
 * Move or resize the artwork of an existing version.
 *
 * The artwork asset is reused as-is — only the mockup is re-rendered — so this
 * costs nothing and takes milliseconds. The result is a new version rather than
 * an edit, keeping every version immutable and giving the user an undo trail.
 */
export async function repositionDesignVersion(input: {
  userId: string;
  projectId: string;
  versionId: string;
  placement: Placement;
}) {
  const { userId, projectId, versionId, placement } = input;

  const source = await prisma.designVersion.findFirst({
    where: { id: versionId, projectId, project: { userId } },
    select: {
      id: true,
      brief: true,
      imagePrompt: true,
      provider: true,
      artworkAssetId: true,
      artwork: { select: { storageKey: true, width: true, height: true } },
      project: {
        select: { product: { select: { imageUrl: true, printArea: true } } },
      },
    },
  });

  if (!source?.artwork || !source.artworkAssetId) {
    throw new NotFoundError('Design version not found');
  }

  const artwork = await localStorageProvider.read(source.artwork.storageKey);
  const productImage = await loadProductImage(source.project.product.imageUrl);

  const mockup = await renderMockup({
    productImage,
    artwork,
    printArea: parsePrintArea(source.project.product.printArea),
    placement,
  });

  const mockupMeta = await sharp(mockup).metadata();
  const mockupKey = `mockup/${projectId}/${randomUUID()}.png`;

  await localStorageProvider.put(mockupKey, mockup, 'image/png');

  const last = await prisma.designVersion.findFirst({
    where: { projectId },
    orderBy: { versionNumber: 'desc' },
    select: { versionNumber: true },
  });

  const briefWithPlacement = {
    ...(source.brief as Record<string, unknown>),
    placement,
  };

  const version = await prisma.$transaction(async (tx) => {
    const mockupAsset = await tx.asset.create({
      data: {
        userId,
        kind: 'MOCKUP',
        mimeType: 'image/png',
        width: mockupMeta.width ?? 0,
        height: mockupMeta.height ?? 0,
        bytes: mockup.length,
        storageKey: mockupKey,
      },
      select: { id: true },
    });

    const created = await tx.designVersion.create({
      data: {
        projectId,
        versionNumber: (last?.versionNumber ?? 0) + 1,
        brief: briefWithPlacement,
        imagePrompt: source.imagePrompt,
        artworkAssetId: source.artworkAssetId,
        mockupAssetId: mockupAsset.id,
        provider: source.provider,
        derivedFromVersionId: source.id,
      },
      select: versionSelect,
    });

    await tx.designProject.update({
      where: { id: projectId },
      data: { currentVersionId: created.id, brief: briefWithPlacement },
    });

    return created;
  });

  return toVersionDto(version);
}
