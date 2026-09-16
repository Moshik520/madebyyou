import type { Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from '../../platform/errors.js';
import { placeVersionSchema, sendMessageSchema } from './agent.schema.js';
import { getConversation, sendMessage } from './agent.service.js';
import { repositionDesignVersion } from './design-pipeline.js';

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
    input.assetId,
  );

  res.status(201).json(result);
}

export async function placeVersion(req: Request, res: Response): Promise<void> {
  const versionId = req.params.versionId;

  if (typeof versionId !== 'string' || versionId.length === 0) {
    throw new BadRequestError('Version id is required');
  }

  const placement = placeVersionSchema.parse(req.body);

  const version = await repositionDesignVersion({
    userId: requireUserId(req),
    projectId: requireProjectId(req),
    versionId,
    placement,
  });

  res.status(201).json({ version });
}
