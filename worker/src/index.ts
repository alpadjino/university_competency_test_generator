import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { QuestionGenerationProcessor } from './services/QuestionGenerationProcessor';

import './models/index';

dotenv.config();

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 3000);

async function startWorker() {
  await connectDB();

  console.log(`🔧 Task runner запущен (модель: ${process.env.OLLAMA_MODEL ?? 'qwen2.5:1.5b'}, интервал ${POLL_INTERVAL_MS} мс)`);

  const tick = async () => {
    try {
      await QuestionGenerationProcessor.processQueue();
    } catch (error) {
      console.error('Task runner error:', error);
    }
  };

  await tick();
  setInterval(tick, POLL_INTERVAL_MS);
}

startWorker().catch((error) => {
  console.error('Worker failed to start:', error);
  process.exit(1);
});
