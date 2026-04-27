import type { User } from '@/types/auth';
import { createContext } from 'react';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
