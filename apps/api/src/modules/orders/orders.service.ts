import { Decimal } from 'decimal.js';
import { prisma } from '../../platform/prisma.js';
import { BadRequestError, NotFoundError } from '../../platform/errors.js';

const orderSelect = {
  id: true,
  status: true,
  currency: true,
  subtotal: true,
  total: true,
  paymentRef: true,
  createdAt: true,
  items: {
    select: {
      id: true,
      productId: true,
      productName: true,
      productSlug: true,
      imageUrl: true,
      unitPrice: true,
      quantity: true,
      lineTotal: true,
    },
  },
} as const;

type DecimalLike = { toFixed(digits: number): string };

type OrderRow = {
  id: string;
  status: string;
  currency: string;
  subtotal: DecimalLike;
  total: DecimalLike;
  paymentRef: string | null;
  createdAt: Date;
  items: {
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    imageUrl: string;
    unitPrice: DecimalLike;
    quantity: number;
    lineTotal: DecimalLike;
  }[];
};

function toOrderDto(order: OrderRow) {
  return {
    ...order,
    subtotal: order.subtotal.toFixed(2),
    total: order.total.toFixed(2),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toFixed(2),
      lineTotal: item.lineTotal.toFixed(2),
    })),
  };
}

export async function createOrderFromCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: {
      id: true,
      items: {
        select: {
          quantity: true,
          designVersionId: true,
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              imageUrl: true,
              basePrice: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError('Cart is empty');
  }

  const unavailable = cart.items.find((item) => !item.product.isActive);

  if (unavailable) {
    throw new BadRequestError(
      `"${unavailable.product.name}" is no longer available`,
    );
  }

  let subtotal = new Decimal(0);

  const itemsData = cart.items.map((item) => {
    const unitPrice = new Decimal(item.product.basePrice.toString());
    const lineTotal = unitPrice.mul(item.quantity);

    subtotal = subtotal.add(lineTotal);

    return {
      productId: item.product.id,
      designVersionId: item.designVersionId,
      productName: item.product.name,
      productSlug: item.product.slug,
      imageUrl: item.product.imageUrl,
      unitPrice: unitPrice.toFixed(2),
      quantity: item.quantity,
      lineTotal: lineTotal.toFixed(2),
    };
  });

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        subtotal: subtotal.toFixed(2),
        total: subtotal.toFixed(2),
        items: { create: itemsData },
      },
      select: orderSelect,
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  return toOrderDto(order);
}

export async function listOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    select: orderSelect,
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(toOrderDto);
}

export async function getOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: orderSelect,
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return toOrderDto(order);
}
