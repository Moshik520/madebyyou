import { config } from './platform/config.js';
import { createApp } from './app.js';


const app = createApp();

app.listen(config.PORT, () => {
  console.log(`API listening on http://localhost:${config.PORT}`);
});
