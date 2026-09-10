import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { addItem, get, removeItem, updateItem } from './cart.controller.js';

export const cartRouter = Router();

cartRouter.use(authenticate);

cartRouter.get('/', get);
cartRouter.post('/items', addItem);
cartRouter.patch('/items/:itemId', updateItem);
cartRouter.delete('/items/:itemId', removeItem);
