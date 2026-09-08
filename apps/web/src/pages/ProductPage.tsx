import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, fetchProduct, type Product } from '../lib/api';
import './ProductPage.css';

const priceFormatter = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
});

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();

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
              {priceFormatter.format(Number(product.basePrice))}
            </div>

            <ul className="product-page__features">
              <li>עיצוב אישי בעזרת סוכן AI</li>
              <li>תצוגה מקדימה לפני ההזמנה</li>
              <li>שמירת כל גרסאות העיצוב</li>
            </ul>

            <div className="product-page__actions">
              <button className="btn btn--primary" type="button">
                התחילו לעצב
              </button>
              <button className="btn btn--ghost" type="button">
                הוספה לעגלה
              </button>
            </div>

            <p className="product-page__note">
              הכפתורים עדיין לא מחוברים — נחבר אותם בצעדים הבאים.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
