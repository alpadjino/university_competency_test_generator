import { DataTypes } from 'sequelize';

export enum GenerationStatus {
  QUEUED = 'queued',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export const GenerationStatusEnumModel = {
  type: DataTypes.ENUM,
  values: Object.values(GenerationStatus),
  name: 'generation_status',
};
