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
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

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
