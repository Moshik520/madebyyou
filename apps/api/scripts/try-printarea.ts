import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { localStorageProvider } from '../src/providers/storage/local.provider.js';

/**
 * Dev tool: draw a print-area rectangle on a product image so it can be
 * eyeballed and tuned before it goes into the seed.
 *
 *   npx tsx scripts/try-printarea.ts classic-tee 375 470 360 450
 */
const [slug = 'classic-tee', xs, ys, ws, hs] = process.argv.slice(2);

const x = Number(xs ?? 375);
const y = Number(ys ?? 470);
const width = Number(ws ?? 360);
const height = Number(hs ?? 450);

const file = resolve(process.cwd(), 'assets', 'products', `${slug}.png`);
const productImage = await readFile(file);
const meta = await sharp(productImage).metadata();

const overlay = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">
     <rect x="${x}" y="${y}" width="${width}" height="${height}"
           fill="rgba(247,201,72,0.28)" stroke="#f7c948" stroke-width="4" stroke-dasharray="14 10"/>
     <text x="${x + width / 2}" y="${y - 14}" text-anchor="middle"
           font-family="sans-serif" font-size="26" font-weight="700" fill="#f7c948">
       ${width}x${height} @ ${x},${y}
     </text>
   </svg>`,
);

const preview = await sharp(productImage)
  .composite([{ input: overlay, left: 0, top: 0 }])
  .png()
  .toBuffer();

await localStorageProvider.put('debug/printarea.png', preview, 'image/png');

console.log(`image  : ${meta.width}x${meta.height}`);
console.log(`area   : ${width}x${height} at ${x},${y}`);
console.log('preview: http://localhost:3000/static/debug/printarea.png');
