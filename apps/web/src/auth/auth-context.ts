import { createContext } from 'react';
import type { AuthUser } from '../lib/api';

export type AuthState = {
  user: AuthUser | null;
  /** true until the stored token has been checked against the API */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => void;
};

export const AuthContext = createContext<AuthState | null>(null);
