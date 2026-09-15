import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { BadRequestError, NotFoundError } from '../../platform/errors.js';
import { parsePrintArea, renderMockup } from '../../platform/compositor.js';
import { prisma } from '../../platform/prisma.js';
import { imageGenProvider } from '../../providers/image/index.js';
import { buildImagePrompt } from '../../providers/image/prompt-builder.js';
import { localStorageProvider } from '../../providers/storage/local.provider.js';
import type { DesignBrief } from '../../providers/llm/types.js';

const ARTWORK_SIZE = 1024;

export const versionSelect = {
  id: true,
  versionNumber: true,
  imagePrompt: true,
  provider: true,
  createdAt: true,
  artwork: { select: { storageKey: true } },
  mockup: { select: { storageKey: true } },
} as const;

type VersionRow = {
  id: string;
  versionNumber: number;
  imagePrompt: string | null;
  provider: string;
  createdAt: Date;
  artwork: { storageKey: string } | null;
  mockup: { storageKey: string } | null;
};

export function toVersionDto(version: VersionRow) {
  return {
    id: version.id,
    versionNumber: version.versionNumber,
    imagePrompt: version.imagePrompt,
    provider: version.provider,
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
function assertGeneratable(brief: DesignBrief): void {
  if (!brief.artworkSource) {
    throw new BadRequestError('עוד לא ברור אם לייצר עיצוב או להשתמש בתמונה שלך');
  }

  if (brief.artworkSource !== 'GENERATE') {
    throw new BadRequestError('העלאת תמונות עדיין לא נתמכת');
  }

  if (!brief.subject) {
    throw new BadRequestError('חסר תיאור של מה שיופיע בעיצוב');
  }
}

async function fetchProductImage(url: string): Promise<Buffer> {
  const response = await fetch(url);

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

  assertGeneratable(brief);

  const project = await prisma.designProject.findFirst({
    where: { id: projectId, userId },
    select: { product: { select: { imageUrl: true, printArea: true } } },
  });

  if (!project) {
    throw new NotFoundError('Design project not found');
  }

  // ---- produce the images (slow; no database locks held here) ----
  const prompt = buildImagePrompt(brief);

  const artwork = await imageGenProvider.generate({
    prompt,
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
  });

  const productImage = await fetchProductImage(project.product.imageUrl);

  const mockup = await renderMockup({
    productImage,
    artwork,
    printArea: parsePrintArea(project.product.printArea),
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
        width: ARTWORK_SIZE,
        height: ARTWORK_SIZE,
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
        provider: imageGenProvider.name,
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
