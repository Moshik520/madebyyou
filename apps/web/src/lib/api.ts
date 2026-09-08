import { getToken } from './token';

const API_BASE = '/api';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = body as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      parsed?.error?.code ?? 'UNKNOWN',
      parsed?.error?.message ?? 'הבקשה נכשלה',
    );
  }

  return body as T;
}

/* ---------- Products ---------- */

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Decimal string, e.g. "24.90" — never a JS number. */
  basePrice: string;
  imageUrl: string;
};

export function fetchProducts(): Promise<{ products: Product[] }> {
  return request('/products');
}

export function fetchProduct(idOrSlug: string): Promise<{ product: Product }> {
  return request(`/products/${encodeURIComponent(idOrSlug)}`);
}

/* ---------- Auth ---------- */

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

export function login(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  email: string,
  password: string,
  name?: string,
): Promise<{ user: AuthUser }> {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(name ? { email, password, name } : { email, password }),
  });
}

export function fetchMe(): Promise<{ user: AuthUser }> {
  return request('/auth/me');
}
