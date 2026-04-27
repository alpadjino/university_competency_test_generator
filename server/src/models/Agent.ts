import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import {
  ClosedQuestionSubtype,
  OpenQuestionSubtype,
  QuestionCategory,
  QuestionCategoryEnumModel,
  QuestionType,
  QuestionTypeEnumModel
} from './enums/Agent';
import { db } from '../config/db';

export type ChoiceOptionsDb = Array<{
  text: string;
  isTrue: boolean;
}>;

export type MatchingOptionsDb = {
  left: Array<{ id: string, text: string }>;
  right: Array<{ id: string, text: string }>;
};

export type SequenceOptionsDb = Array<{ id: string, text: string }>;

export type QuestionOptionsDb =
  | ChoiceOptionsDb
  | MatchingOptionsDb
  | SequenceOptionsDb
  | null; // для открытых вопросов

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
}

interface QuestionCreationAttributes extends Optional<QuestionAttributes, 'id'> { }

export class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes {
  declare id: number;
  declare question: string;
  declare testId: number;
  declare text: string;
  declare category: QuestionCategory;
  declare type: QuestionType;
  declare subtype: ClosedQuestionSubtype | OpenQuestionSubtype;
  declare options: QuestionOptionsDb;
  declare standardAnswer: string | null;
  declare order: number;
};

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
      references: {
        model: 'tests',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    }
  },
  {
    sequelize: db,
    tableName: 'questions',
    timestamps: false,
  }
);