import { BelongsToManyAddAssociationMixin, BelongsToManyRemoveAssociationMixin, BelongsToManySetAssociationsMixin, DataTypes, Model, Optional } from "sequelize";
import { db } from "../config/db";
import { TestStatusEnum, TestStatusEnumModel } from "./enums/TestStatus";
import { Competencies } from "./Competencies";

interface TestAttributes {
  id: number;
  name: string;
  description: string;
  status: string;
  files: string[];
}

interface TestCreationAttributes extends Optional<TestAttributes, 'id'> { }

export class Test extends Model<TestAttributes, TestCreationAttributes> implements TestAttributes {
  declare id: number;
  declare name: string;
  declare description: string;
  declare status: string;
  declare files: string[];

  declare addCompetency: BelongsToManyAddAssociationMixin<Competencies, number>;
  declare removeCompetency: BelongsToManyRemoveAssociationMixin<Competencies, number>;
  declare setCompetencies: BelongsToManySetAssociationsMixin<Competencies, number>;
}

Test.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      ...TestStatusEnumModel,
      allowNull: false,
      defaultValue: TestStatusEnum.IN_PROGRESS
    },
    files: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    }
  },
  { sequelize: db, tableName: 'tests', timestamps: true, underscored: true, }
);
