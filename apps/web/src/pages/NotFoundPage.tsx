import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center' }}>
        <h1 className="section__title">הדף לא נמצא</h1>
        <p className="section__subtitle" style={{ marginInline: 'auto' }}>
          הכתובת שחיפשתם לא קיימת באתר.
        </p>
        <p style={{ marginTop: 28 }}>
          <Link className="btn btn--primary" to="/">
            חזרה לדף הבית
          </Link>
        </p>
      </div>
    </section>
  );
}
