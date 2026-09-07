import { prisma } from '../../platform/prisma.js';
import { NotFoundError } from '../../platform/errors.js';
import type { CreateDesignProjectInput } from './design-projects.schema.js';

const projectSelect = {
  id: true,
  title: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  product: {
    select: { id: true, slug: true, name: true, imageUrl: true },
  },
} as const;

export async function createDesignProject(
  userId: string,
  input: CreateDesignProjectInput,
) {
  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ id: input.productId }, { slug: input.productId }],
    },
    select: { id: true, name: true },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return prisma.designProject.create({
    data: {
      userId,
      productId: product.id,
      title: input.title ?? `New ${product.name} design`,
    },
    select: projectSelect,
  });
}

export async function listDesignProjects(userId: string) {
  return prisma.designProject.findMany({
    where: { userId },
    select: projectSelect,
    orderBy: { updatedAt: 'desc' },
  });
}
