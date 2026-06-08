export const GENERATE_QUESTIONS_QUEUE = 'generate-questions';

export interface GenerateQuestionsJobData {
  taskIds: number[];
  promptText: string;
  questionType: string;
  subtype: string;
}
