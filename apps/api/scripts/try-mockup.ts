import { prisma } from '../src/platform/prisma.js';
import { parsePrintArea, renderMockup } from '../src/platform/compositor.js';
import { imageGenProvider } from '../src/providers/image/index.js';
import { buildImagePrompt } from '../src/providers/image/prompt-builder.js';
import { localStorageProvider } from '../src/providers/storage/local.provider.js';
import type { DesignBrief } from '../src/providers/llm/types.js';

const slug = process.argv[2] ?? 'classic-tee';

const product = await prisma.product.findUnique({
  where: { slug },
  select: { name: true, imageUrl: true, printArea: true },
});

if (!product) throw new Error(`No product with slug "${slug}"`);

const brief: DesignBrief = {
  artworkSource: 'GENERATE',
  subject: 'anthropomorphic wolf',
  style: 'realistic painting',
  colorPalette: ['blue', 'gray'],
  mood: null,
  negative: null,
  textOverlay: null,
};

const prompt = buildImagePrompt(brief);
console.log('product :', product.name);
console.log('prompt  :', prompt);

const artwork = await imageGenProvider.generate({
  prompt,
  width: 1024,
  height: 1024,
});
console.log('artwork :', artwork.length, 'bytes');

const response = await fetch(product.imageUrl);
const productImage = Buffer.from(await response.arrayBuffer());

const printArea = parsePrintArea(product.printArea);
const mockup = await renderMockup({ productImage, artwork, printArea });
console.log('mockup  :', mockup.length, 'bytes');

await localStorageProvider.put('artwork/demo.png', artwork, 'image/png');
await localStorageProvider.put('mockup/demo.png', mockup, 'image/png');

console.log('');
console.log('open these while the API is running:');
console.log('  http://localhost:3000' + localStorageProvider.publicUrl('artwork/demo.png'));
console.log('  http://localhost:3000' + localStorageProvider.publicUrl('mockup/demo.png'));

await prisma.$disconnect();
