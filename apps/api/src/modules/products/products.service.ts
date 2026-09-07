import { prisma } from '../../platform/prisma.js';
import { NotFoundError } from '../../platform/errors.js';

const productSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  basePrice: true,
  imageUrl: true,
  printArea: true,
} as const;

function toProductDto<T extends { basePrice: { toFixed(digits: number): string } }>(
  product: T,
) {
  return { ...product, basePrice: product.basePrice.toFixed(2) };
}


export async function listProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: productSelect,
    orderBy: { name: 'asc' },
  });

  return products.map(toProductDto);
}

export async function getProduct(identifier: string) {
  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ id: identifier }, { slug: identifier }],
    },
    select: productSelect,
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return toProductDto(product);
}
