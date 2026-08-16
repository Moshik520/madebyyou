import { config } from './platform/config.js';
import { logger } from './platform/logger.js';
import { createApp } from './app.js';

const app = createApp();

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'server started');
});
