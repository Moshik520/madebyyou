import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrder, type Order } from '../lib/api';
import { formatDate, formatPrice, orderStatusLabels } from '../lib/format';
import './OrdersPage.css';

export function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    fetchOrder(orderId)
      .then((data) => {
        if (!cancelled) setOrder(data.order);
      })
      .catch(() => {
        if (!cancelled) setError('ההזמנה לא נמצאה');
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (error) {
    return (
      <section className="section">
        <div className="container orders__empty">
          <h1 className="section__title">{error}</h1>
          <Link className="btn btn--primary" to="/orders">
            לכל ההזמנות
          </Link>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="section">
        <div className="container">
          <p className="section__subtitle">טוען…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <nav className="product-page__crumbs" aria-label="ניווט משני">
          <Link to="/orders">ההזמנות שלי</Link>
          <span aria-hidden="true">›</span>
          <span>#{order.id.slice(0, 8)}</span>
        </nav>

        <div className="order-detail__head">
          <h1 className="section__title">הזמנה #{order.id.slice(0, 8)}</h1>
          <span
            className={`order-badge order-badge--${order.status.toLowerCase()}`}
          >
            {orderStatusLabels[order.status] ?? order.status}
          </span>
        </div>

        <p className="section__subtitle">{formatDate(order.createdAt)}</p>

        <ul className="order-detail__items">
          {order.items.map((item) => (
            <li className="order-line" key={item.id}>
              <img src={item.imageUrl} alt={item.productName} />

              <div className="order-line__info">
                <span className="order-line__name">{item.productName}</span>
                <span className="order-line__unit">
                  {formatPrice(item.unitPrice)} × {item.quantity}
                </span>
              </div>

              <span className="order-line__total">
                {formatPrice(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="order-detail__summary">
          <div className="cart__summary-row">
            <span>סכום ביניים</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="cart__summary-row cart__summary-row--total">
            <span>סה״כ</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {order.status === 'PENDING' && (
          <p className="orders__note">
            התשלום עדיין לא מחובר — נוסיף אותו בצעד הבא.
          </p>
        )}
      </div>
    </section>
  );
}
