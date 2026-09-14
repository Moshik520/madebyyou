import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrder, payOrder, type Order } from '../lib/api';
import { formatDate, formatPrice, orderStatusLabels } from '../lib/format';
import './OrdersPage.css';

export function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cardToken, setCardToken] = useState('tok_visa_4242');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  async function handlePay() {
    if (!order) return;

    setPaying(true);
    setPayError(null);

    try {
      const data = await payOrder(order.id, cardToken);
      setOrder(data.order);
    } catch (err: unknown) {
      setPayError(err instanceof Error ? err.message : 'התשלום נכשל');
      // Refresh so the page shows the FAILED status the server recorded.
      void fetchOrder(order.id).then((data) => setOrder(data.order));
    } finally {
      setPaying(false);
    }
  }

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

        {(order.status === 'PENDING' || order.status === 'FAILED') && (
          <div className="pay">
            <h2 className="pay__title">תשלום</h2>
            <p className="pay__hint">
              סביבת בדיקות — לא מתבצע חיוב אמיתי. בחרו כרטיס כדי לבדוק את שני
              המסלולים.
            </p>

            {payError && <div className="pay__error">{payError}</div>}

            <div className="pay__cards">
              <label className="pay__card">
                <input
                  type="radio"
                  name="card"
                  value="tok_visa_4242"
                  checked={cardToken === 'tok_visa_4242'}
                  onChange={(e) => setCardToken(e.target.value)}
                />
                <span>
                  <strong>כרטיס תקין</strong>
                  <small>VISA •••• 4242 — התשלום יאושר</small>
                </span>
              </label>

              <label className="pay__card">
                <input
                  type="radio"
                  name="card"
                  value="tok_decline"
                  checked={cardToken === 'tok_decline'}
                  onChange={(e) => setCardToken(e.target.value)}
                />
                <span>
                  <strong>כרטיס שנדחה</strong>
                  <small>VISA •••• 0002 — התשלום ייכשל</small>
                </span>
              </label>
            </div>

            <button
              className="btn btn--primary pay__submit"
              type="button"
              disabled={paying}
              onClick={() => void handlePay()}
            >
              {paying ? 'מעבד תשלום…' : `לתשלום ${formatPrice(order.total)}`}
            </button>
          </div>
        )}

        {order.status === 'PAID' && (
          <div className="pay pay--done">
            <span className="pay__check" aria-hidden="true">✓</span>
            <div>
              <strong>ההזמנה שולמה</strong>
              <small>אסמכתא: {order.paymentRef}</small>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
