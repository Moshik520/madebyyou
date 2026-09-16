import type { ErrorRequestHandler, RequestHandler } from 'express';
import { z, ZodError } from 'zod';
import { MulterError } from 'multer';
import { AppError } from '../errors.js';
import { config } from '../config.js';
import { logger } from '../logger.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' },
    });
    return;
  }

  // Upload limits are the user's problem, not a server fault.
  if (err instanceof MulterError) {
    res.status(400).json({
      error: {
        code: 'UPLOAD_REJECTED',
        message:
          err.code === 'LIMIT_FILE_SIZE'
            ? 'הקובץ גדול מדי (מקסימום 8MB)'
            : 'העלאת הקובץ נכשלה',
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: z.treeifyError(err),
      },
    });
    return;
  }

  logger.error({ err }, 'unhandled error');


  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message:
        config.NODE_ENV === 'production'
          ? 'Internal server error'
          : err instanceof Error
            ? err.message
            : String(err),
    },
  });
};
