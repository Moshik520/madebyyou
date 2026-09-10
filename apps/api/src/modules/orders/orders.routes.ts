import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { checkout, getOne, list } from './orders.controller.js';

export const ordersRouter = Router();

ordersRouter.use(authenticate);

ordersRouter.post('/', checkout);
ordersRouter.get('/', list);
ordersRouter.get('/:orderId', getOne);
