import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../auth/auth.middleware.js';
import { upload } from './uploads.controller.js';

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Files are kept in memory rather than written to a temp directory: they are
 * re-encoded immediately and the originals are never persisted anywhere.
 * The size limit is what makes holding them in memory safe.
 */
const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
});

export const uploadsRouter = Router();

uploadsRouter.use(authenticate);

uploadsRouter.post('/', uploadMiddleware.single('file'), upload);
