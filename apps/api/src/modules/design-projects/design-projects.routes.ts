import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { create, list } from './design-projects.controller.js';

export const designProjectsRouter = Router();

designProjectsRouter.use(authenticate);

designProjectsRouter.post('/', create);
designProjectsRouter.get('/', list);
