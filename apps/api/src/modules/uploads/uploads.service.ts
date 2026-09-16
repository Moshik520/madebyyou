import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { BadRequestError } from '../../platform/errors.js';
import { prisma } from '../../platform/prisma.js';
import { localStorageProvider } from '../../providers/storage/local.provider.js';

const MAX_DIMENSION = 2048;
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'heif', 'avif']);

export async function storeUpload(userId: string, data: Buffer) {
  let metadata;

  try {
    metadata = await sharp(data).metadata();
  } catch {
    throw new BadRequestError('הקובץ אינו תמונה תקינה');
  }

  // Trust the decoded content, never the filename or the declared mime type.
  if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
    throw new BadRequestError('אפשר להעלות רק תמונות (JPG, PNG, WEBP)');
  }

  if (!metadata.width || !metadata.height) {
    throw new BadRequestError('לא הצלחנו לקרוא את מידות התמונה');
  }

  // Re-encoding is the security boundary: what lands on disk is bytes sharp
  // produced, not bytes the user sent. `.rotate()` with no argument applies the
  // EXIF orientation and drops the rest of the metadata — including GPS.
  const normalised = await sharp(data)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  const normalisedMeta = await sharp(normalised).metadata();
  const storageKey = `upload/${userId}/${randomUUID()}.png`;

  await localStorageProvider.put(storageKey, normalised, 'image/png');

  const asset = await prisma.asset.create({
    data: {
      userId,
      kind: 'UPLOAD',
      mimeType: 'image/png',
      width: normalisedMeta.width ?? 0,
      height: normalisedMeta.height ?? 0,
      bytes: normalised.length,
      storageKey,
    },
    select: { id: true, width: true, height: true, storageKey: true },
  });

  return {
    id: asset.id,
    width: asset.width,
    height: asset.height,
    url: localStorageProvider.publicUrl(asset.storageKey),
  };
}
