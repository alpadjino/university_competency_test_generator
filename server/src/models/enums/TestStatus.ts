import { DataTypes } from "sequelize"; 

export enum TestStatusEnum {
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export const TestStatusEnumModel = {
  type: DataTypes.ENUM,
  values: [TestStatusEnum.IN_PROGRESS, TestStatusEnum.DONE],
  name: 'test_status',
};
