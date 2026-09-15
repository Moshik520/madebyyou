import express from 'express';
import type { Express, Request, Response } from 'express';
import { prisma } from './platform/prisma.js';
import { errorHandler, notFoundHandler } from './platform/middleware/errorHandler.js';
import { pinoHttp } from 'pino-http';  
import { logger } from './platform/logger.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { productsRouter } from './modules/products/products.routes.js';
import { designProjectsRouter } from './modules/design-projects/design-projects.routes.js';
import { cartRouter } from './modules/cart/cart.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { designAgentRouter } from './modules/design-agent/agent.routes.js';
import { STORAGE_ROOT } from './providers/storage/local.provider.js';







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
  app.use('/static', express.static(STORAGE_ROOT, { index: false }));

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
  app.use('/api/products', productsRouter); 
  app.use('/api/design-projects', designProjectsRouter);
  app.use('/api/design-projects', designAgentRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/orders', ordersRouter);


  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;


}

