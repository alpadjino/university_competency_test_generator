import { DataTypes } from "sequelize";

export enum DocumentAuthor {
  CLIENT = 'client',
  SERVER = 'server',
};

export const DocumentAuthorEnum = {
  type: DataTypes.ENUM,
  values: [DocumentAuthor.CLIENT, DocumentAuthor.SERVER],
  name: 'documents_author_role',
};

