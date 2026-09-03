import express from 'express';
import type { Express, Request, Response } from 'express';
import { prisma } from './platform/prisma.js';
import { errorHandler, notFoundHandler } from './platform/middleware/errorHandler.js';
import { pinoHttp } from 'pino-http';  
import { logger } from './platform/logger.js';
import { authRouter } from './modules/auth/auth.routes.js';


export function createApp(): Express {
  const app = express();

  app.use(
  pinoHttp({
    logger,
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
);


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

  app.use('/api/auth', authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;


}

