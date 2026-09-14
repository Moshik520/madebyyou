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

/* ---------- Cart ---------- */

export type CartItem = {
  id: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  product: {
    id: string;
    slug: string;
    name: string;
    imageUrl: string;
  };
};

export type Cart = {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: string;
};

export function fetchCart(): Promise<{ cart: Cart }> {
  return request('/cart');
}

export function addToCart(
  productId: string,
  quantity = 1,
): Promise<{ cart: Cart }> {
  return request('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export function updateCartItem(
  itemId: string,
  quantity: number,
): Promise<{ cart: Cart }> {
  return request(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(itemId: string): Promise<{ cart: Cart }> {
  return request(`/cart/items/${itemId}`, { method: 'DELETE' });
}

/* ---------- Orders ---------- */

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
};

export type Order = {
  id: string;
  status: OrderStatus;
  currency: string;
  subtotal: string;
  total: string;
  paymentRef: string | null;
  createdAt: string;
  items: OrderItem[];
};

export function createOrder(): Promise<{ order: Order }> {
  return request('/orders', { method: 'POST' });
}

export function fetchOrders(): Promise<{ orders: Order[] }> {
  return request('/orders');
}

export function fetchOrder(orderId: string): Promise<{ order: Order }> {
  return request(`/orders/${orderId}`);
}

export function payOrder(
  orderId: string,
  cardToken: string,
): Promise<{ order: Order }> {
  return request(`/orders/${orderId}/pay`, {
    method: 'POST',
    body: JSON.stringify({ cardToken }),
  });
}
