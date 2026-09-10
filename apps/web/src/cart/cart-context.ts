import { createContext } from 'react';
import type { Cart } from '../lib/api';

export type CartState = {
  cart: Cart | null;
  /** true while any cart request is in flight */
  busy: boolean;
  error: string | null;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearLocal: () => void;
};

export const CartContext = createContext<CartState | null>(null);
