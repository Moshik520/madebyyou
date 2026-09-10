import { Decimal } from 'decimal.js';
import { prisma } from '../../platform/prisma.js';
import { NotFoundError } from '../../platform/errors.js';
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
} as const;

type CartItemRow = {
  id: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    imageUrl: string;
    basePrice: { toString(): string };
  };
};

function buildCartResponse(cartId: string, items: CartItemRow[]) {
  let subtotal = new Decimal(0);

  const mapped = items.map((item) => {
    const unitPrice = new Decimal(item.product.basePrice.toString());
    const lineTotal = unitPrice.mul(item.quantity);

    subtotal = subtotal.add(lineTotal);

    return {
      id: item.id,
      quantity: item.quantity,
      unitPrice: unitPrice.toFixed(2),
      lineTotal: lineTotal.toFixed(2),
      product: {
        id: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        imageUrl: item.product.imageUrl,
      },
    };
  });

  return {
    id: cartId,
    items: mapped,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: subtotal.toFixed(2),
  };
}

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

  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId: cart.id, productId: product.id },
    },
    update: { quantity: { increment: input.quantity } },
    create: {
      cartId: cart.id,
      productId: product.id,
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
