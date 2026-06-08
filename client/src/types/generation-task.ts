import type { GenerationStatus } from './question';

export interface GenerationTask {
  id: number;
  questionId: number;
  testId: number;
  promptText: string;
  status: GenerationStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export const isTaskPending = (task: GenerationTask) =>
  task.status === 'queued' || task.status === 'generating';

export const isTaskFailed = (task: GenerationTask) => task.status === 'failed';
