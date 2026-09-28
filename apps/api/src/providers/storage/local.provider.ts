import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { StorageProvider } from './types.js';

/** Everything lives under apps/api/storage — gitignored, created on demand. */
export const STORAGE_ROOT = resolve(process.cwd(), 'storage');

/**
 * Keys are built by us, never by users — but a path that reaches the
 * filesystem gets checked anyway. "../../.env" must not resolve outside root.
 */
export function safePath(key: string): string {
  const target = resolve(STORAGE_ROOT, key);

  if (!target.startsWith(STORAGE_ROOT)) {
    throw new Error(`Refusing to write outside the storage root: ${key}`);
  }

  return target;
}

export const localStorageProvider: StorageProvider = {
  name: 'local',

  async put(key: string, data: Buffer): Promise<void> {
    const target = safePath(key);

    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, data);
  },

  async read(key: string): Promise<Buffer> {
    return readFile(safePath(key));
  },

  publicUrl(key: string): string {
    return `/static/${key}`;
  },
};
