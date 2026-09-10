import type { Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from '../../platform/errors.js';
import { addCartItemSchema, updateCartItemSchema } from './cart.schema.js';
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from './cart.service.js';

function requireUserId(req: Request): string {
  if (!req.userId) throw new UnauthorizedError();
  return req.userId;
}

function requireItemId(req: Request): string {
  const itemId = req.params.itemId;

  if (typeof itemId !== 'string' || itemId.length === 0) {
    throw new BadRequestError('Cart item id is required');
  }

  return itemId;
}

export async function get(req: Request, res: Response): Promise<void> {
  const cart = await getCart(requireUserId(req));

  res.status(200).json({ cart });
}

export async function addItem(req: Request, res: Response): Promise<void> {
  const input = addCartItemSchema.parse(req.body);
  const cart = await addCartItem(requireUserId(req), input);

  res.status(201).json({ cart });
}

export async function updateItem(req: Request, res: Response): Promise<void> {
  const input = updateCartItemSchema.parse(req.body);
  const cart = await updateCartItem(
    requireUserId(req),
    requireItemId(req),
    input.quantity,
  );

  res.status(200).json({ cart });
}

export async function removeItem(req: Request, res: Response): Promise<void> {
  const cart = await removeCartItem(requireUserId(req), requireItemId(req));

  res.status(200).json({ cart });
}
