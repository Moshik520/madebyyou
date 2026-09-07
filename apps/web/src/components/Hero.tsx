import './Hero.css';

export function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero__inner container">
        <div className="hero__text">
          <span className="hero__badge">מעוצב על ידך, בעזרת AI</span>

          <h1 className="hero__title">
            ברוכים הבאים ל־<span dir="ltr">MadeByYou</span>
          </h1>

          <p className="hero__lead">
            בעזרת צ'אט מבוסס בינה מלאכותית תוכלו ליצור עיצובים ייחודיים ולהוסיף
            טאץ' אישי למוצרים כמו חולצות, קפוצ'ונים, ספלים ופוסטרים — בקלות,
            במהירות, ובדיוק כמו שדמיינתם.
          </p>

          <div className="hero__actions">
            <button className="btn btn--primary" type="button">
              התחילו לעצב
            </button>
            <button className="btn btn--ghost" type="button">
              לקטלוג המוצרים
            </button>
          </div>
        </div>

        <div className="hero__art" aria-hidden="true">
          <div className="hero__shirt">
            <div className="hero__print">
              <span>העיצוב שלך</span>
            </div>
          </div>
          <div className="hero__bubble hero__bubble--user">
            זאב גיאומטרי בכחול וסגול
          </div>
          <div className="hero__bubble hero__bubble--bot">מכין לך סקיצה…</div>
        </div>
      </div>
    </section>
  );
}
