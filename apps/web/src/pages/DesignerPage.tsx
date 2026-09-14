import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProduct, type Product } from '../lib/api';
import './DesignerPage.css';

/**
 * The intake decides which pipeline runs later — and whether an AI model is
 * needed at all. Two independent axes, not a list of modes:
 *   artworkSource : where the image comes from
 *   withText      : whether we composite text on top (always local, never AI)
 */
type ArtworkSource = 'UPLOAD' | 'GENERATE';

type ChoiceCardProps = {
  icon: string;
  title: string;
  description: string;
  badge?: string;
  selected?: boolean;
  onClick: () => void;
};

function ChoiceCard({
  icon,
  title,
  description,
  badge,
  onClick,
}: ChoiceCardProps) {
  return (
    <button className="choice" type="button" onClick={onClick}>
      <span className="choice__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="choice__body">
        <span className="choice__title">{title}</span>
        <span className="choice__desc">{description}</span>
      </span>
      {badge && <span className="choice__badge">{badge}</span>}
    </button>
  );
}

export function DesignerPage() {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);

  const [source, setSource] = useState<ArtworkSource | null>(null);
  const [withText, setWithText] = useState<boolean | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    fetchProduct(slug)
      .then((data) => {
        if (!cancelled) setProduct(data.product);
      })
      .catch(() => {
        /* the product header is decoration here — the flow works without it */
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // The current step is derived from the answers, not stored separately.
  // One source of truth — the step can never disagree with the data.
  const step =
    source === null
      ? 'source'
      : source === 'UPLOAD' && withText === null
        ? 'upload-mode'
        : 'summary';

  function goBack() {
    if (step === 'summary' && source === 'UPLOAD') {
      setWithText(null);
    } else {
      setSource(null);
      setWithText(null);
    }
  }

  return (
    <section className="designer section">
      <div className="container">
        <nav className="product-page__crumbs" aria-label="ניווט משני">
          <Link to="/">דף הבית</Link>
          <span aria-hidden="true">›</span>
          {product ? (
            <Link to={`/products/${product.slug}`}>{product.name}</Link>
          ) : (
            <span>מוצר</span>
          )}
          <span aria-hidden="true">›</span>
          <span>עיצוב</span>
        </nav>

        <header className="designer__head">
          {product && (
            <img
              className="designer__thumb"
              src={product.imageUrl}
              alt={product.name}
            />
          )}
          <div>
            <h1 className="designer__title">
              עיצוב {product ? product.name : 'המוצר'}
            </h1>
            <p className="designer__subtitle">
              כמה שאלות קצרות, ואז נתחיל לעבוד על העיצוב שלכם.
            </p>
          </div>
        </header>

        <ol className="steps" aria-label="שלבי העיצוב">
          <li className={step === 'source' ? 'steps__item is-active' : 'steps__item is-done'}>
            מקור העיצוב
          </li>
          <li
            className={
              step === 'upload-mode'
                ? 'steps__item is-active'
                : step === 'summary' && source === 'UPLOAD'
                  ? 'steps__item is-done'
                  : 'steps__item'
            }
          >
            טקסט
          </li>
          <li className={step === 'summary' ? 'steps__item is-active' : 'steps__item'}>
            סיכום
          </li>
        </ol>

        {step === 'source' && (
          <div className="question">
            <h2 className="question__title">מה תרצו לעשות?</h2>
            <p className="question__hint">
              אפשר להעלות תמונה קיימת, או לתת לנו ליצור עיצוב מאפס.
            </p>

            <div className="question__choices">
              <ChoiceCard
                icon="🖼️"
                title="יש לי תמונה"
                description="לוגו, צילום או איור שכבר קיימים אצלכם."
                onClick={() => setSource('UPLOAD')}
              />
              <ChoiceCard
                icon="✨"
                title="ליצור עיצוב מאפס"
                description="תארו במילים מה תרצו, ואנחנו נייצר את זה."
                badge="AI"
                onClick={() => setSource('GENERATE')}
              />
            </div>
          </div>
        )}

        {step === 'upload-mode' && (
          <div className="question">
            <h2 className="question__title">מה לעשות עם התמונה?</h2>
            <p className="question__hint">
              אפשר להשתמש בה כמו שהיא, או להוסיף עליה טקסט.
            </p>

            <div className="question__choices">
              <ChoiceCard
                icon="📌"
                title="להשתמש בה כמו שהיא"
                description="נמקם את התמונה על המוצר, בלי שינויים."
                onClick={() => setWithText(false)}
              />
              <ChoiceCard
                icon="🔤"
                title="להוסיף טקסט"
                description="נוסיף כיתוב מעל או מתחת לתמונה."
                onClick={() => setWithText(true)}
              />
            </div>

            <button className="link-button" type="button" onClick={goBack}>
              ← חזרה
            </button>
          </div>
        )}

        {step === 'summary' && (
          <div className="question">
            <h2 className="question__title">המסלול שנבחר</h2>

            <ul className="summary">
              <li className="summary__row">
                <span className="summary__label">מקור העיצוב</span>
                <span className="summary__value">
                  {source === 'UPLOAD' ? 'תמונה שלכם' : 'יצירה מאפס'}
                </span>
              </li>

              {source === 'UPLOAD' && (
                <li className="summary__row">
                  <span className="summary__label">טקסט</span>
                  <span className="summary__value">
                    {withText ? 'כן — נוסיף כיתוב' : 'לא — התמונה בלבד'}
                  </span>
                </li>
              )}

              <li className="summary__row">
                <span className="summary__label">שימוש במודל AI</span>
                <span className="summary__value">
                  {source === 'GENERATE' ? (
                    <span className="summary__tag summary__tag--ai">נדרש</span>
                  ) : (
                    <span className="summary__tag summary__tag--local">
                      לא נדרש
                    </span>
                  )}
                </span>
              </li>
            </ul>

            <p className="designer__note">
              {source === 'GENERATE'
                ? 'המסלול הזה משתמש במודל יצירת תמונות. השלב הבא בבנייה.'
                : 'המסלול הזה לא דורש AI כלל — רק עיבוד תמונה מקומי. השלב הבא בבנייה.'}
            </p>

            <div className="designer__actions">
              <button className="btn btn--ghost" type="button" onClick={goBack}>
                ← שינוי הבחירה
              </button>
              <button className="btn btn--primary" type="button" disabled>
                המשך
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
