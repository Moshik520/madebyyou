import './HowItWorks.css';

const steps = [
  {
    number: '1',
    title: 'בוחרים מוצר',
    text: 'חולצה, קפוצ׳ון, ספל או פוסטר — כל מה שתרצו לעצב.',
  },
  {
    number: '2',
    title: 'מבקשים עיצוב מהצ׳אט',
    text: 'לוגו ייחודי, טקסט אישי או רעיון יצירתי — פשוט מתארים במילים.',
  },
  {
    number: '3',
    title: 'מקבלים סקיצה חיה',
    text: 'הדמיה מיידית של המוצר עם העיצוב שביקשתם, וגרסאות לבחירה.',
  },
  {
    number: '4',
    title: 'מאשרים ומזמינים',
    text: 'בקליק אחד הרעיון שלכם הופך למוצר אמיתי בעיצוב אישי.',
  },
];

export function HowItWorks() {
  return (
    <section className="how section" id="how">
      <div className="container">
        <h2 className="section__title">איך זה עובד?</h2>
        <p className="section__subtitle">
          ארבעה צעדים מהרעיון שבראש למוצר שמגיע אליכם הביתה.
        </p>

        <ol className="how__grid">
          {steps.map((step) => (
            <li className="how__card" key={step.number}>
              <span className="how__number">{step.number}</span>
              <h3 className="how__title">{step.title}</h3>
              <p className="how__text">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
