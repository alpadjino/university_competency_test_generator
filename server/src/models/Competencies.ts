import { DataTypes, Model, Optional } from "sequelize";
import { db } from '../config/db';

interface CompetenciesAttributes {
  id: number;
  name: string;
  description: string;
}

interface CompetenciesCreationAttributes extends Optional<CompetenciesAttributes, 'id'> { }

export class Competencies extends Model<CompetenciesAttributes, CompetenciesCreationAttributes> implements CompetenciesAttributes {
  declare id: number;
  declare name: string;
  declare description: string;
}

Competencies.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize: db, tableName: 'competencies', timestamps: false, }
);
