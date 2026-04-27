import { DataTypes, InferAttributes, Model } from "sequelize"; 

export enum UserRolesEnum {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  VIEWER = 'viewer',
}

export const UserRoleEnum = {
  type: DataTypes.ENUM,
  values: [UserRolesEnum.ADMIN, UserRolesEnum.MODERATOR, UserRolesEnum.VIEWER],
  name: 'user_role',
};
