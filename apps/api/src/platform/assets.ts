import { resolve } from 'node:path';

/** Source images that ship with the repo (product photos) — not generated. */
export const ASSETS_ROOT = resolve(process.cwd(), 'assets');

export const ASSETS_URL_PREFIX = '/assets/';
