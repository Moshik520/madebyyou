import { use } from 'react';
import { AuthContext, type AuthState } from './auth-context';

export function useAuth(): AuthState {
  const context = use(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }

  return context;
}
