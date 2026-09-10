import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  addToCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
  type Cart,
} from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { CartContext, type CartState } from './cart-context';

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [cart, setCart] = useState<Cart | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The cart belongs to a user. Load it on sign-in, drop it on sign-out.
  useEffect(() => {
    if (!user) {
      setCart(null);
      return;
    }

    let cancelled = false;

    fetchCart()
      .then((data) => {
        if (!cancelled) setCart(data.cart);
      })
      .catch(() => {
        /* an empty cart is not an error worth showing on load */
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const run = useCallback(async (action: () => Promise<{ cart: Cart }>) => {
    setBusy(true);
    setError(null);

    try {
      const data = await action();
      setCart(data.cart);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'הפעולה נכשלה');
      throw err;
    } finally {
      setBusy(false);
    }
  }, []);

  const value = useMemo<CartState>(
    () => ({
      cart,
      busy,
      error,
      addItem: (productId, quantity = 1) =>
        run(() => addToCart(productId, quantity)),
      setQuantity: (itemId, quantity) =>
        run(() => updateCartItem(itemId, quantity)),
      removeItem: (itemId) => run(() => removeCartItem(itemId)),
      refresh: () => run(fetchCart),
      clearLocal: () => setCart(null),
    }),
    [cart, busy, error, run],
  );

  return <CartContext value={value}>{children}</CartContext>;
}
