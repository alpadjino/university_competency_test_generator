import PgBoss from 'pg-boss';
import { GENERATE_QUESTIONS_QUEUE } from './jobs';

let boss: PgBoss | null = null;

async function ensureGenerateQuestionsQueue(instance: PgBoss): Promise<void> {
  const existing = await instance.getQueue(GENERATE_QUESTIONS_QUEUE);
  if (existing) {
    return;
  }

  await instance.createQueue(GENERATE_QUESTIONS_QUEUE, {
    retryLimit: 3,
    retryDelay: 30,
    retryBackoff: true,
    expireInSeconds: 600,
  });
  console.log(`📋 Очередь «${GENERATE_QUESTIONS_QUEUE}» создана`);
}

export async function startBoss(): Promise<PgBoss> {
  if (boss) {
    return boss;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  boss = new PgBoss(connectionString);
  boss.on('error', (error) => console.error('pg-boss error:', error));
  await boss.start();
  await ensureGenerateQuestionsQueue(boss);
  console.log('📬 pg-boss подключён (publisher)');

  return boss;
}

export async function getBoss(): Promise<PgBoss> {
  return boss ?? startBoss();
}
