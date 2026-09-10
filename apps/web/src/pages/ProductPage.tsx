import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useCart } from '../cart/useCart';
import { ApiError, fetchProduct, type Product } from '../lib/api';
import './ProductPage.css';
import { formatPrice } from '../lib/format';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, busy } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    setProduct(null);
    setError(null);

    fetchProduct(slug)
      .then((data) => {
        if (!cancelled) setProduct(data.product);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError && err.status === 404
            ? 'המוצר לא נמצא'
            : 'לא הצלחנו לטעון את המוצר',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleAddToCart() {
    if (!product) return;

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addItem(product.slug, 1);
      navigate('/cart');
    } catch {
      /* the cart provider already surfaced the error */
    }
  }

  if (error) {
    return (
      <section className="section">
        <div className="container product-page__error">
          <h1 className="section__title">{error}</h1>
          <Link className="btn btn--primary" to="/">
            חזרה לקטלוג
          </Link>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="section">
        <div className="container">
          <div className="product-page__skeleton" />
        </div>
      </section>
    );
  }

  return (
    <section className="section product-page">
      <div className="container">
        <nav className="product-page__crumbs" aria-label="ניווט משני">
          <Link to="/">דף הבית</Link>
          <span aria-hidden="true">›</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-page__grid">
          <div className="product-page__media">
            <img src={product.imageUrl} alt={product.name} />
          </div>

          <div className="product-page__info">
            <h1 className="product-page__name">{product.name}</h1>
            <p className="product-page__desc">{product.description}</p>

            <div className="product-page__price">
              {formatPrice(product.basePrice)}
            </div>

            <ul className="product-page__features">
              <li>עיצוב אישי בעזרת סוכן AI</li>
              <li>תצוגה מקדימה לפני ההזמנה</li>
              <li>שמירת כל גרסאות העיצוב</li>
            </ul>

            <div className="product-page__actions">
              <button
                className="btn btn--primary"
                type="button"
                disabled={busy}
                onClick={handleAddToCart}
              >
                {busy ? 'מוסיף…' : 'הוספה לעגלה'}
              </button>
              <button className="btn btn--ghost" type="button" disabled>
                התחילו לעצב
              </button>
            </div>

            <p className="product-page__note">
              עיצוב אישי עם הסוכן יתווסף בשלב מאוחר יותר.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
