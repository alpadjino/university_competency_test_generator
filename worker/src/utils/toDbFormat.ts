import {
  ClosedQuestionSubtype,
  OpenQuestionSubtype,
  QuestionSubtype,
} from '../models/enums/Question';
import {
  AiAdditionQuestion,
  AiCorrectSequenceQuestion,
  AiMatchingQuestion,
  AiMultipleQuestion,
  AiOneQuestion,
  AiQuestionItem,
} from '../types/ai';
import { QuestionOptionsDb } from '../models/Question';

export function toDbFormat(
  aiItem: AiQuestionItem,
  subType: QuestionSubtype
): { options: QuestionOptionsDb; standardAnswer: string | null } {
  switch (subType) {
    case ClosedQuestionSubtype.ONE: {
      const item = aiItem as AiOneQuestion;
      return {
        options: item.options?.map((opt) => ({
          text: opt,
          isTrue: opt === item.correct_answer,
        })) || [],
        standardAnswer: item.correct_answer || null,
      };
    }

    case ClosedQuestionSubtype.MULTIPLE: {
      const item = aiItem as AiMultipleQuestion;
      return {
        options: item.options?.map((opt) => ({
          text: opt,
          isTrue: item.correct_answers?.includes(opt) || false,
        })) || [],
        standardAnswer: item.correct_answers ? JSON.stringify(item.correct_answers) : null,
      };
    }

    case ClosedQuestionSubtype.MATCHING: {
      const item = aiItem as AiMatchingQuestion;
      return {
        options: {
          left: item.left_column || [],
          right: item.right_column || [],
        },
        standardAnswer: item.correct_mapping ? JSON.stringify(item.correct_mapping) : null,
      };
    }

    case ClosedQuestionSubtype.CORRECT_SEQUENCE: {
      const item = aiItem as AiCorrectSequenceQuestion;
      return {
        options: item.items || [],
        standardAnswer: item.correct_sequence ? JSON.stringify(item.correct_sequence) : null,
      };
    }

    case OpenQuestionSubtype.ADDITION: {
      const item = aiItem as AiAdditionQuestion;
      return {
        options: null,
        standardAnswer: item.correct_answer || null,
      };
    }

    case OpenQuestionSubtype.DETAILED_ANSWER:
    default: {
      return {
        options: null,
        standardAnswer: null,
      };
    }
  }
}
