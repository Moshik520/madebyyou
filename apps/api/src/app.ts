import express from 'express';
import type { Express, Request, Response } from 'express';
import { prisma } from './platform/prisma.js';
import { errorHandler, notFoundHandler } from './platform/middleware/errorHandler.js';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
    });
  });

  app.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', database: 'up' });
  } catch {
    res.status(503).json({ status: 'not_ready', database: 'down' });
  }
});


  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;


}

