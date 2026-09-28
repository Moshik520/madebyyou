import { prisma } from '../../platform/prisma.js';
import { BadRequestError, NotFoundError } from '../../platform/errors.js';
import { buildCartResponse, buildLineKey } from './cart.pricing.js';
import type { AddCartItemInput } from './cart.schema.js';

const cartItemSelect = {
  id: true,
  quantity: true,
  product: {
    select: {
      id: true,
      slug: true,
      name: true,
      imageUrl: true,
      basePrice: true,
    },
  },
  designVersion: {
    select: {
      id: true,
      versionNumber: true,
      mockup: { select: { storageKey: true } },
    },
  },
} as const;

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    select: cartItemSelect,
    orderBy: { createdAt: 'asc' },
  });

  return buildCartResponse(cart.id, items);
}

export async function addCartItem(userId: string, input: AddCartItemInput) {
  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ id: input.productId }, { slug: input.productId }],
    },
    select: { id: true },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // A design may only be added by the user who owns the project it belongs to,
  // and only onto the product it was designed for.
  if (input.designVersionId) {
    const version = await prisma.designVersion.findFirst({
      where: {
        id: input.designVersionId,
        project: { userId },
      },
      select: { id: true, project: { select: { productId: true } } },
    });

    if (!version) {
      throw new NotFoundError('Design not found');
    }

    if (version.project.productId !== product.id) {
      throw new BadRequestError('This design belongs to a different product');
    }
  }

  const cart = await getOrCreateCart(userId);
  const designVersionId = input.designVersionId ?? null;

  await prisma.cartItem.upsert({
    where: {
      cartId_lineKey: {
        cartId: cart.id,
        lineKey: buildLineKey(product.id, designVersionId),
      },
    },
    update: { quantity: { increment: input.quantity } },
    create: {
      cartId: cart.id,
      productId: product.id,
      designVersionId,
      lineKey: buildLineKey(product.id, designVersionId),
      quantity: input.quantity,
    },
  });

  return getCart(userId);
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number,
) {
  const cart = await getOrCreateCart(userId);

  const result = await prisma.cartItem.updateMany({
    where: { id: itemId, cartId: cart.id },
    data: { quantity },
  });

  if (result.count === 0) {
    throw new NotFoundError('Cart item not found');
  }

  return getCart(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await getOrCreateCart(userId);

  const result = await prisma.cartItem.deleteMany({
    where: { id: itemId, cartId: cart.id },
  });

  if (result.count === 0) {
    throw new NotFoundError('Cart item not found');
  }

  return getCart(userId);
}
