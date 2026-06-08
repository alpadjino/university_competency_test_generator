import { Model, Optional, DataTypes } from 'sequelize';
import { db } from '../config/db';
import {
  ClosedQuestionSubtype,
  OpenQuestionSubtype,
  QuestionCategory,
  QuestionCategoryEnumModel,
  QuestionType,
  QuestionTypeEnumModel,
} from './enums/Question';
import { GenerationStatus, GenerationStatusEnumModel } from './enums/GenerationStatus';

export type ChoiceOptionsDb = Array<{ text: string; isTrue: boolean }>;
export type MatchingOptionsDb = {
  left: Array<{ id: string; text: string }>;
  right: Array<{ id: string; text: string }>;
};
export type SequenceOptionsDb = Array<{ id: string; text: string }>;
export type QuestionOptionsDb =
  | ChoiceOptionsDb
  | MatchingOptionsDb
  | SequenceOptionsDb
  | null;

interface QuestionAttributes {
  id: number;
  testId: number;
  text: string;
  question: string;
  category: QuestionCategory;
  type: QuestionType;
  subtype: ClosedQuestionSubtype | OpenQuestionSubtype;
  options: QuestionOptionsDb;
  standardAnswer: string | null;
  order: number;
  generationStatus: GenerationStatus | null;
}

interface QuestionCreationAttributes extends Optional<QuestionAttributes, 'id' | 'generationStatus'> {}

export class Question extends Model<QuestionAttributes, QuestionCreationAttributes>
  implements QuestionAttributes {
  declare id: number;
  declare testId: number;
  declare text: string;
  declare question: string;
  declare category: QuestionCategory;
  declare type: QuestionType;
  declare subtype: ClosedQuestionSubtype | OpenQuestionSubtype;
  declare options: QuestionOptionsDb;
  declare standardAnswer: string | null;
  declare order: number;
  declare generationStatus: GenerationStatus | null;
}

Question.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    testId: {
      type: DataTypes.INTEGER,
      field: 'test_id',
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: QuestionCategoryEnumModel,
    type: QuestionTypeEnumModel,
    subtype: {
      type: DataTypes.ENUM,
      values: [
        ...Object.values(ClosedQuestionSubtype),
        ...Object.values(OpenQuestionSubtype),
      ],
      allowNull: false,
    },
    options: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    standardAnswer: {
      field: 'standard_answer',
      type: DataTypes.TEXT,
      allowNull: true,
    },
    order: {
      field: 'order',
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    generationStatus: {
      ...GenerationStatusEnumModel,
      field: 'generation_status',
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: 'questions',
    timestamps: false,
  }
);
