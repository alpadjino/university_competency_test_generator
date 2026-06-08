import { DataTypes } from 'sequelize';

export enum QuestionCategory {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum QuestionType {
  CLOSED = 'Closed',
  OPEN = 'Open',
}

export enum ClosedQuestionSubtype {
  ONE = 'One',
  MULTIPLE = 'Multiple',
  MATCHING = 'Matching',
  CORRECT_SEQUENCE = 'CorrectSequence',
}

export enum OpenQuestionSubtype {
  DETAILED_ANSWER = 'DetailedAnswer',
  ADDITION = 'Addition',
}

export const QuestionCategoryEnumModel = {
  type: DataTypes.ENUM,
  values: [QuestionCategory.A, QuestionCategory.B, QuestionCategory.C],
  name: 'question_category',
};

export const QuestionTypeEnumModel = {
  type: DataTypes.ENUM,
  values: [QuestionType.CLOSED, QuestionType.OPEN],
  name: 'question_type',
};

export type QuestionSubtype = ClosedQuestionSubtype | OpenQuestionSubtype;
