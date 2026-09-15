import { prisma } from '../src/platform/prisma.js';

const products = [
    {
    slug: 'classic-tee',
    name: 'Classic T-Shirt',
    description: '100% combed cotton, unisex fit. Soft, durable, everyday wear.',
    basePrice: '24.90',
    imageUrl: '/assets/products/classic-tee.png',
    printArea: { x: 338, y: 510, width: 340, height: 420, shape: 'rect' },
    isActive: false,
  },
  {
    slug: 'steel-bottle',
    name: 'Steel Bottle 500ml',
    description:
      'Matte black insulated stainless steel bottle. Keeps drinks cold for 24 hours.',
    basePrice: '39.00',
    imageUrl: '/assets/products/steel-bottle.png',
    printArea: { x: 500, y: 670, width: 150, height: 250, shape: 'wrap' },
    isActive: true,
  },
  {
    slug: 'premium-hoodie',
    name: 'Premium Hoodie',
    description: 'Heavyweight fleece hoodie with kangaroo pocket and lined hood.',
    basePrice: '54.00',
    imageUrl: 'https://placehold.co/800x800/374151/ffffff?text=Hoodie',
    printArea: { x: 260, y: 260, width: 280, height: 300, shape: 'rect' },
    isActive: false,
  },
  {
    slug: 'ceramic-mug',
    name: 'Ceramic Mug 11oz',
    description: 'Dishwasher-safe ceramic mug with a glossy finish.',
    basePrice: '14.50',
    imageUrl: 'https://placehold.co/800x800/7c2d12/ffffff?text=Mug',
    printArea: { x: 180, y: 240, width: 440, height: 300, shape: 'wrap' },
    isActive: false,
  },
  {
    slug: 'art-poster-a2',
    name: 'Art Poster A2',
    description: 'Matte 200gsm poster print, 420 x 594 mm.',
    basePrice: '19.00',
    imageUrl: 'https://placehold.co/800x800/1e3a5f/ffffff?text=Poster',
    printArea: { x: 40, y: 40, width: 720, height: 720, shape: 'rect' },
    isActive: false,
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log(`Seeded ${products.length} products`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
