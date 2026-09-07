import type { Request, Response } from 'express';
import { getProduct, listProducts } from './products.service.js';
import { BadRequestError } from '../../platform/errors.js';

export async function list(_req: Request, res: Response): Promise<void> {
  const products = await listProducts();

  res.status(200).json({ products });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const identifier = req.params.id;

  if (typeof identifier !== 'string' || identifier.length === 0) {
    throw new BadRequestError('Product identifier is required');
  }

  const product = await getProduct(identifier);

  res.status(200).json({ product });
}

