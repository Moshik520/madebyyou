import type { Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from '../../platform/errors.js';
import { storeUpload } from './uploads.service.js';

export async function upload(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new UnauthorizedError();

  if (!req.file) {
    throw new BadRequestError('לא צורף קובץ');
  }

  const asset = await storeUpload(req.userId, req.file.buffer);

  res.status(201).json({ asset });
}
