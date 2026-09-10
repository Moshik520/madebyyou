import { use } from 'react';
import { CartContext, type CartState } from './cart-context';

export function useCart(): CartState {
  const context = use(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside <CartProvider>');
  }

  return context;
}
