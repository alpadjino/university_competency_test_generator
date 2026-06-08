import { GenerationTask } from '../models/GenerationTask';
import { Question } from '../models/Question';
import { GenerationStatus } from '../models/enums/GenerationStatus';
import { GENERATE_QUESTIONS_QUEUE, type GenerateQuestionsJobData } from './jobs';
import type PgBoss from 'pg-boss';

const BATCH_GAP_MS = 1000;

function groupTasksByEnqueueBatch(tasks: GenerationTask[]): GenerationTask[][] {
  if (tasks.length === 0) {
    return [];
  }

  const groups: GenerationTask[][] = [[tasks[0]]];

  for (let i = 1; i < tasks.length; i++) {
    const prev = tasks[i - 1];
    const curr = tasks[i];
    const gap = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();

    if (gap <= BATCH_GAP_MS) {
      groups[groups.length - 1].push(curr);
    } else {
      groups.push([curr]);
    }
  }

  return groups;
}

export async function recoverQueuedTasks(boss: PgBoss): Promise<void> {
  const queueSize = await boss.getQueueSize(GENERATE_QUESTIONS_QUEUE);
  if (queueSize > 0) {
    console.log(`♻️ В очереди уже ${queueSize} job(s), восстановление пропущено`);
    return;
  }

  const tasks = await GenerationTask.findAll({
    where: { status: GenerationStatus.QUEUED },
    order: [['createdAt', 'ASC']],
  }).catch((error: unknown) => {
    if ((error as { parent?: { code?: string } })?.parent?.code === '42P01') {
      console.warn('Таблица generation_tasks не найдена, восстановление пропущено');
      return [];
    }
    throw error;
  });

  if (tasks.length === 0) {
    return;
  }

  const groups = groupTasksByEnqueueBatch(tasks);

  for (const group of groups) {
    const question = await Question.findByPk(group[0].questionId);
    if (!question) {
      continue;
    }

    const jobData: GenerateQuestionsJobData = {
      taskIds: group.map((task) => task.id),
      promptText: group[0].promptText,
      questionType: question.type,
      subtype: question.subtype,
    };

    await boss.send(GENERATE_QUESTIONS_QUEUE, jobData);
  }

  console.log(`♻️ В очередь возвращено ${groups.length} пакет(ов) (${tasks.length} задач)`);
}
