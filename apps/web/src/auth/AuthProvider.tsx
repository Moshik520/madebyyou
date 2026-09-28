import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  fetchMe,
  login as loginRequest,
  register as registerRequest,
  type AuthUser,
} from '../lib/api';
import { clearToken, getToken, setToken } from '../lib/token';
import { AuthContext, type AuthState } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load: if a token is stored, ask the API who it belongs to.
  // The token may be expired or the account deleted — the server decides.
  useEffect(() => {
    let cancelled = false;

    // Both branches settle asynchronously, so loading is never flipped during
    // the effect body itself — which would cause a cascading render.
    const check = getToken()
      ? fetchMe()
          .then((data) => {
            if (!cancelled) setUser(data.user);
          })
          .catch(() => {
            clearToken();
          })
      : Promise.resolve();

    void check.finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      await registerRequest(email, password, name);
      // Registration does not return a token, so sign in right after.
      const data = await loginRequest(email, password);
      setToken(data.token);
      setUser(data.user);
    },
    [],
  );

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
