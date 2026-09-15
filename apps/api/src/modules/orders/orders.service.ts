import { Decimal } from 'decimal.js';
import { prisma } from '../../platform/prisma.js';
import { BadRequestError, NotFoundError, PaymentRequiredError } from '../../platform/errors.js';
import { logger } from '../../platform/logger.js';
import { paymentProvider } from '../../providers/payment/index.js';
import { localStorageProvider } from '../../providers/storage/local.provider.js';

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
          designVersion: {
            select: {
              versionNumber: true,
              mockup: { select: { storageKey: true } },
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

    const design = item.designVersion;

    return {
      productId: item.product.id,
      designVersionId: item.designVersionId,
      // The mockup is what the customer actually bought — snapshot that,
      // falling back to the catalogue photo for a plain product.
      productName: design
        ? `${item.product.name} — עיצוב ${design.versionNumber}`
        : item.product.name,
      productSlug: item.product.slug,
      imageUrl:
        design?.mockup
          ? localStorageProvider.publicUrl(design.mockup.storageKey)
          : item.product.imageUrl,
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

export async function payOrder(
  userId: string,
  orderId: string,
  cardToken: string,
) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { id: true, status: true, total: true, currency: true },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Idempotent: paying an already-paid order is a no-op, not an error.
  if (order.status === 'PAID') {
    return getOrder(userId, orderId);
  }

  if (order.status !== 'PENDING' && order.status !== 'FAILED') {
    throw new BadRequestError(
      `Order cannot be paid while it is ${order.status}`,
    );
  }

  const result = await paymentProvider.charge({
    orderId: order.id,
    amount: order.total.toFixed(2),
    currency: order.currency,
    cardToken,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: result.status === 'succeeded' ? 'PAID' : 'FAILED',
      paymentRef: result.reference,
    },
  });

  logger.info(
    {
      orderId: order.id,
      provider: paymentProvider.name,
      reference: result.reference,
      result: result.status,
    },
    'payment attempt',
  );

  if (result.status === 'failed') {
    throw new PaymentRequiredError(result.failureReason);
  }

  return getOrder(userId, orderId);
}
