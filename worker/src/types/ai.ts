export interface AiQuestionResponse {
  questions: AiQuestionItem[];
}

export interface AiDetailedQuestion {
  question: string;
}

export interface AiAdditionQuestion {
  question: string;
  correct_answer: string;
}

export interface AiOneQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

export interface AiMultipleQuestion {
  question: string;
  options: string[];
  correct_answers: string[];
}

export interface AiMatchingQuestion {
  question: string;
  left_column: Array<{ id: string; text: string }>;
  right_column: Array<{ id: string; text: string }>;
  correct_mapping: Record<string, string>;
}

export interface AiCorrectSequenceQuestion {
  question: string;
  items: Array<{ id: string; text: string }>;
  correct_sequence: string[];
}

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
  };
  done: boolean;
}
