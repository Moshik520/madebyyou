import type { Request, Response } from 'express';
import { UnauthorizedError, BadRequestError } from '../../platform/errors.js';
import { createDesignProjectSchema } from './design-projects.schema.js';
import { createDesignProject, listDesignProjects, getDesignProject } from './design-projects.service.js';

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new UnauthorizedError();

  const input = createDesignProjectSchema.parse(req.body);
  const project = await createDesignProject(req.userId, input);

  res.status(201).json({ project });
}

export async function list(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new UnauthorizedError();

  const projects = await listDesignProjects(req.userId);

  res.status(200).json({ projects });
}


export async function getOne(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new UnauthorizedError();

  const projectId = req.params.id;

  if (typeof projectId !== 'string' || projectId.length === 0) {
    throw new BadRequestError('Project id is required');
  }

  const project = await getDesignProject(req.userId, projectId);

  res.status(200).json({ project });
}
