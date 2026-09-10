import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { fetchOrders, type Order } from '../lib/api';
import { formatDate, formatPrice, orderStatusLabels } from '../lib/format';
import './OrdersPage.css';

export function OrdersPage() {
  const { user, loading } = useAuth();

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    fetchOrders()
      .then((data) => {
        if (!cancelled) setOrders(data.orders);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'שגיאה בטעינת ההזמנות');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <section className="section">
        <div className="container orders__empty">
          <h1 className="section__title">ההזמנות שלי</h1>
          <p className="section__subtitle">כדי לראות הזמנות צריך להתחבר.</p>
          <Link className="btn btn--primary" to="/login">
            להתחברות
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">ההזמנות שלי</h1>

        {error && <div className="orders__error">{error}</div>}

        {!error && orders === null && <p className="section__subtitle">טוען…</p>}

        {orders?.length === 0 && (
          <div className="orders__empty">
            <p className="section__subtitle">עדיין לא ביצעת הזמנות.</p>
            <Link className="btn btn--primary" to="/">
              לקטלוג המוצרים
            </Link>
          </div>
        )}

        {orders && orders.length > 0 && (
          <ul className="orders__list">
            {orders.map((order) => (
              <li key={order.id}>
                <Link className="order-card" to={`/orders/${order.id}`}>
                  <div className="order-card__head">
                    <span className="order-card__number">
                      הזמנה #{order.id.slice(0, 8)}
                    </span>
                    <span
                      className={`order-badge order-badge--${order.status.toLowerCase()}`}
                    >
                      {orderStatusLabels[order.status] ?? order.status}
                    </span>
                  </div>

                  <div className="order-card__meta">
                    <span>{formatDate(order.createdAt)}</span>
                    <span>
                      {order.items.length} פריטים · {formatPrice(order.total)}
                    </span>
                  </div>

                  <div className="order-card__thumbs">
                    {order.items.slice(0, 4).map((item) => (
                      <img
                        key={item.id}
                        src={item.imageUrl}
                        alt={item.productName}
                      />
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
