import { Router } from 'express';
import { login, me, register } from './auth.controller.js';
import { authenticate } from './auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', authenticate, me);
