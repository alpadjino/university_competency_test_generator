import { DataTypes, Model, Optional } from "sequelize";
import { db } from '../config/db';
import { UserRoleEnum, UserRolesEnum } from "./enums/UserRoles";

interface UserAttributes {
  id: number;
  username: string;
  password_hash: string;
  role: UserRolesEnum;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare username: string;
  declare password_hash: string;
  declare role: UserRolesEnum;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    ...UserRoleEnum,
    allowNull: false,
    defaultValue: UserRolesEnum.VIEWER,
  },
},
{ sequelize: db, tableName: 'users', timestamps: false, });
