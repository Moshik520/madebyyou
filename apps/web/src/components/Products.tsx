import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, type Product } from '../lib/api';
import './Products.css';

const priceFormatter = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
});

export function Products() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchProducts()
      .then((data) => {
        if (!cancelled) setProducts(data.products);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'שגיאה לא ידועה');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="products section" id="products">
      <div className="container">
        <h2 className="section__title">המוצרים שלנו</h2>
        <p className="section__subtitle">
          בחרו מוצר, ותנו לסוכן העיצוב להפוך את הרעיון שלכם למשהו אמיתי.
        </p>

        {error && (
          <div className="products__state products__state--error">
            לא הצלחנו לטעון את הקטלוג: {error}
          </div>
        )}

        {!error && products === null && (
          <div className="products__grid">
            {[0, 1, 2, 4].map((n) => (
              <div className="product-card product-card--skeleton" key={n} />
            ))}
          </div>
        )}

        {products?.length === 0 && (
          <div className="products__state">אין מוצרים להצגה כרגע.</div>
        )}

        {products && products.length > 0 && (
          <div className="products__grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <Link className="product-card__media" to={`/products/${product.slug}`}>
                  <img src={product.imageUrl} alt={product.name} loading="lazy" />
                </Link>

                <div className="product-card__body">
                  <h3 className="product-card__name">
                    <Link to={`/products/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <p className="product-card__desc">{product.description}</p>

                  <div className="product-card__footer">
                    <span className="product-card__price">
                      {priceFormatter.format(Number(product.basePrice))}
                    </span>
                    <Link
                      className="product-card__cta"
                      to={`/products/${product.slug}`}
                    >
                      עיצוב אישי
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
