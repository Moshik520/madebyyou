import type { Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from '../../platform/errors.js';
import {createOrderFromCart, getOrder, listOrders, payOrder } from './orders.service.js';
import { payOrderSchema } from './orders.schema.js';

function requireUserId(req: Request): string {
  if (!req.userId) throw new UnauthorizedError();
  return req.userId;
}

export async function checkout(req: Request, res: Response): Promise<void> {
  const order = await createOrderFromCart(requireUserId(req));

  res.status(201).json({ order });
}

export async function list(req: Request, res: Response): Promise<void> {
  const orders = await listOrders(requireUserId(req));

  res.status(200).json({ orders });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const orderId = req.params.orderId;

  if (typeof orderId !== 'string' || orderId.length === 0) {
    throw new BadRequestError('Order id is required');
  }

  const order = await getOrder(requireUserId(req), orderId);

  res.status(200).json({ order });
}

export async function pay(req: Request, res: Response): Promise<void> {
  const orderId = req.params.orderId;

  if (typeof orderId !== 'string' || orderId.length === 0) {
    throw new BadRequestError('Order id is required');
  }

  const input = payOrderSchema.parse(req.body);
  const order = await payOrder(requireUserId(req), orderId, input.cardToken);

  res.status(200).json({ order });
}