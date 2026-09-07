import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { create, list, getOne } from './design-projects.controller.js';

export const designProjectsRouter = Router();

designProjectsRouter.use(authenticate);

designProjectsRouter.post('/', create);
designProjectsRouter.get('/', list);
designProjectsRouter.get('/:id', getOne);

