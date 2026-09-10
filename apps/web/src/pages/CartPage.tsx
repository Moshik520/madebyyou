import { Link } from 'react-router-dom';
import { useCart } from '../cart/useCart';
import { useAuth } from '../auth/useAuth';
import './CartPage.css';

const priceFormatter = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
});

function formatPrice(value: string) {
  return priceFormatter.format(Number(value));
}

export function CartPage() {
  const { user, loading } = useAuth();
  const { cart, busy, error, setQuantity, removeItem } = useCart();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <section className="section">
        <div className="container cart__empty">
          <h1 className="section__title">העגלה שלך</h1>
          <p className="section__subtitle">כדי לראות את העגלה צריך להתחבר.</p>
          <Link className="btn btn--primary" to="/login">
            להתחברות
          </Link>
        </div>
      </section>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <section className="section cart">
      <div className="container">
        <h1 className="section__title">העגלה שלך</h1>

        {error && <div className="cart__error">{error}</div>}

        {isEmpty ? (
          <div className="cart__empty">
            <p className="section__subtitle">העגלה ריקה כרגע.</p>
            <Link className="btn btn--primary" to="/">
              לקטלוג המוצרים
            </Link>
          </div>
        ) : (
          <div className="cart__layout">
            <ul className="cart__items">
              {cart.items.map((item) => (
                <li className="cart-row" key={item.id}>
                  <Link
                    className="cart-row__media"
                    to={`/products/${item.product.slug}`}
                  >
                    <img src={item.product.imageUrl} alt={item.product.name} />
                  </Link>

                  <div className="cart-row__info">
                    <h2 className="cart-row__name">
                      <Link to={`/products/${item.product.slug}`}>
                        {item.product.name}
                      </Link>
                    </h2>
                    <span className="cart-row__unit">
                      {formatPrice(item.unitPrice)} ליחידה
                    </span>
                  </div>

                  <div className="cart-row__qty">
                    <button
                      type="button"
                      aria-label="הפחתת כמות"
                      disabled={busy || item.quantity <= 1}
                      onClick={() => void setQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="הוספת כמות"
                      disabled={busy || item.quantity >= 99}
                      onClick={() => void setQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-row__total">
                    {formatPrice(item.lineTotal)}
                  </div>

                  <button
                    className="cart-row__remove"
                    type="button"
                    aria-label={`הסרת ${item.product.name}`}
                    disabled={busy}
                    onClick={() => void removeItem(item.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <aside className="cart__summary">
              <h2 className="cart__summary-title">סיכום הזמנה</h2>

              <div className="cart__summary-row">
                <span>פריטים</span>
                <span>{cart.itemCount}</span>
              </div>

              <div className="cart__summary-row cart__summary-row--total">
                <span>סה״כ</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>

              <button
                className="btn btn--primary cart__checkout"
                type="button"
                disabled={busy}
              >
                למעבר לתשלום
              </button>

              <p className="cart__note">התשלום עדיין לא מחובר — הצעד הבא.</p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
