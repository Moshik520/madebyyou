const TOKEN_KEY = 'apd.token';

/**
 * The JWT lives in localStorage so a page refresh keeps the user signed in.
 * Trade-off: readable by any script on the page (XSS). An httpOnly cookie
 * would be safer but requires CSRF protection and same-site cookie plumbing.
 * See docs/adr when written.
 *
 * Every access is wrapped in try/catch: private mode and blocked site data
 * make localStorage throw rather than return null.
 */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable — the session simply won't survive a refresh */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nothing to do */
  }
}
