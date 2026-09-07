import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../platform/errors.js';
import { createDesignProjectSchema } from './design-projects.schema.js';
import { createDesignProject, listDesignProjects } from './design-projects.service.js';

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
