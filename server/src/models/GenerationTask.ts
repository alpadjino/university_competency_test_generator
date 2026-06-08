import { DataTypes, Model, Optional } from 'sequelize';
import { db } from '../config/db';
import { GenerationStatus, GenerationStatusEnumModel } from './enums/GenerationStatus';

interface GenerationTaskAttributes {
  id: number;
  questionId: number;
  testId: number;
  promptText: string;
  status: GenerationStatus;
  errorMessage: string | null;
}

interface GenerationTaskCreationAttributes
  extends Optional<GenerationTaskAttributes, 'id' | 'status' | 'errorMessage'> {}

export class GenerationTask extends Model<GenerationTaskAttributes, GenerationTaskCreationAttributes>
  implements GenerationTaskAttributes {
  declare id: number;
  declare questionId: number;
  declare testId: number;
  declare promptText: string;
  declare status: GenerationStatus;
  declare errorMessage: string | null;
}

GenerationTask.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    questionId: {
      type: DataTypes.INTEGER,
      field: 'question_id',
      allowNull: false,
      unique: true,
    },
    testId: {
      type: DataTypes.INTEGER,
      field: 'test_id',
      allowNull: false,
    },
    promptText: {
      type: DataTypes.TEXT,
      field: 'prompt_text',
      allowNull: false,
    },
    status: {
      ...GenerationStatusEnumModel,
      allowNull: false,
      defaultValue: GenerationStatus.QUEUED,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      field: 'error_message',
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: 'generation_tasks',
    timestamps: true,
    underscored: true,
  }
);
