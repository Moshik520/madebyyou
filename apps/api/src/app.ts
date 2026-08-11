import express from 'express';
import type { Express, Request, Response } from 'express';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
    });
  });

  return app;
}
