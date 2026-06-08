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
import { reconcileMultipleChoice, reconcileOneChoice } from './reconcileAnswer';

export function toDbFormat(
  aiItem: AiQuestionItem,
  subType: QuestionSubtype
): { options: QuestionOptionsDb; standardAnswer: string | null } {
  switch (subType) {
    case ClosedQuestionSubtype.ONE: {
      const item = aiItem as AiOneQuestion;
      const { options, correctIndex, standardAnswer } = reconcileOneChoice(
        item.options ?? [],
        item.correct_answer
      );

      return {
        options: options.map((text, index) => ({
          text,
          isTrue: index === correctIndex,
        })),
        standardAnswer,
      };
    }

    case ClosedQuestionSubtype.MULTIPLE: {
      const item = aiItem as AiMultipleQuestion;
      const { options, correctIndices, standardAnswer } = reconcileMultipleChoice(
        item.options ?? [],
        item.correct_answers
      );

      return {
        options: options.map((text, index) => ({
          text,
          isTrue: correctIndices.has(index),
        })),
        standardAnswer,
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
