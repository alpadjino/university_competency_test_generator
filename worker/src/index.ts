import './config/loadEnv.js';

import { connectDB } from './config/db';
import { startBossWorker } from './queue/boss';

import './models/index';

async function startWorker() {
  await connectDB();
  await startBossWorker();

  console.log(`🔧 Worker запущен (модель: ${process.env.OLLAMA_MODEL ?? 'hodza/cotype-nano-1.5-unofficial'})`);
}

startWorker().catch((error) => {
  console.error('Worker failed to start:', error);
  process.exit(1);
});
