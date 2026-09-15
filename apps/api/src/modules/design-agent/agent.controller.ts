import type { Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from '../../platform/errors.js';
import { sendMessageSchema } from './agent.schema.js';
import { getConversation, sendMessage } from './agent.service.js';

function requireUserId(req: Request): string {
  if (!req.userId) throw new UnauthorizedError();
  return req.userId;
}

function requireProjectId(req: Request): string {
  const projectId = req.params.projectId;

  if (typeof projectId !== 'string' || projectId.length === 0) {
    throw new BadRequestError('Project id is required');
  }

  return projectId;
}

export async function getChat(req: Request, res: Response): Promise<void> {
  const conversation = await getConversation(
    requireUserId(req),
    requireProjectId(req),
  );

  res.status(200).json(conversation);
}

export async function postMessage(req: Request, res: Response): Promise<void> {
  const input = sendMessageSchema.parse(req.body);

  const result = await sendMessage(
    requireUserId(req),
    requireProjectId(req),
    input.content,
  );

  res.status(201).json(result);
}
