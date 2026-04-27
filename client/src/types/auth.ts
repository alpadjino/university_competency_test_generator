export type Role = 'admin' | 'moderator' | 'viewer';

export interface User {
  id: string;
  username: string;
  role: Role;
}
