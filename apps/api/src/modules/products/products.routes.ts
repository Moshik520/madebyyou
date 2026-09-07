import { Router } from 'express';
import { getOne, list } from './products.controller.js';

export const productsRouter = Router();

productsRouter.get('/', list);
productsRouter.get('/:id', getOne);
