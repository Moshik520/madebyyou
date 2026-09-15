import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { getChat, postMessage } from './agent.controller.js';

export const designAgentRouter = Router();

designAgentRouter.use(authenticate);

designAgentRouter.get('/:projectId/conversation', getChat);
designAgentRouter.post('/:projectId/messages', postMessage);
