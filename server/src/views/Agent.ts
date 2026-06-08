import { QuestionSubtypeEnum } from "../dto/Agent";

export type QuestionCategory = "A" | "B" | "C";
export type QuestionType = "Closed" | "Open";
export type ClosedQuestionSubtype = "One" | "Multiple" | "Matching" | "CorrectSequence";
export type OpenQuestionSubtype = "DetailedAnswer" | "Addition";

export interface GenerateQuestionsRequest {
  questionsCount: number;
  testId: number;
  questionsType: QuestionType;
  questionsSubType: ClosedQuestionSubtype | OpenQuestionSubtype;
  promptText: string;
}

export interface GenerateQuestionsEnqueueResponse {
  questionIds: number[];
  message: string;
}

export type GenerationStatus = 'queued' | 'generating' | 'completed' | 'failed';

export type GenerateQuestionsResponse = Array<{
  testId: number;
  category: QuestionCategory;
  type: QuestionType;
  subtype: QuestionSubtypeEnum;
  text: string;
  question: string;
  options: {
    text: string;
    isTrue: boolean;
  }[] | null;
  standardAnswer: string | null;
}>;

// Общий интерфейс для всех вопросов от AI
export interface AiQuestionResponse {
  questions: AiQuestionItem[];
}

export interface AiDetailedQuestion {
  question: string;
};

export interface AiAdditionQuestion {
  question: string;
  correct_answer: string;
};

export interface AiOneQuestion {
  question: string;
  options: string[];
  correct_answer: string;
};

export interface AiMultipleQuestion {
  question: string;
  options: string[];
  correct_answers: string[];
};

export interface AiMatchingQuestion {
  question: string;
  left_column: Array<{ id: string, text: string }>;
  right_column: Array<{ id: string, text: string }>;
  correct_mapping: Record<string, string>;
};

export interface AiCorrectSequenceQuestion {
  question: string;
  items: Array<{ id: string, text: string }>;
  correct_sequence: string[];
};

export type AiQuestionItem =
  | AiDetailedQuestion
  | AiAdditionQuestion
  | AiOneQuestion
  | AiMultipleQuestion
  | AiMatchingQuestion
  | AiCorrectSequenceQuestion;

export interface IChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  },
  done: boolean;
  done_reason: string,
  total_duration: number,
  load_duration: number,
  prompt_eval_count: number,
  prompt_eval_duration: number,
  eval_count: number,
  eval_duration: number,
};
