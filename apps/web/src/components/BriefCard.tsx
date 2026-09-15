import type { DesignBrief } from '../lib/api';
import './BriefCard.css';

const sourceLabels: Record<string, string> = {
  GENERATE: 'יצירה מאפס',
  UPLOAD: 'תמונה שלך',
  UPLOAD_TRANSFORM: 'שינוי תמונה שלך',
};

const placementLabels: Record<string, string> = {
  ABOVE: 'מעל',
  BELOW: 'מתחת',
  CENTER: 'במרכז',
};

type Row = { label: string; value: string | null; swatches?: string[] };

function buildRows(brief: DesignBrief): Row[] {
  const rows: Row[] = [
    {
      label: 'מקור',
      value: brief.artworkSource ? sourceLabels[brief.artworkSource] ?? null : null,
    },
    { label: 'נושא', value: brief.subject },
    { label: 'סגנון', value: brief.style },
    {
      label: 'צבעים',
      value: brief.colorPalette.length > 0 ? brief.colorPalette.join(', ') : null,
      swatches: brief.colorPalette,
    },
    { label: 'אווירה', value: brief.mood },
  ];

  if (brief.textOverlay) {
    rows.push({
      label: 'טקסט',
      value: brief.textOverlay.content
        ? `"${brief.textOverlay.content}" — ${placementLabels[brief.textOverlay.placement] ?? ''}`
        : `${placementLabels[brief.textOverlay.placement] ?? ''} (עוד לא נקבע)`,
    });
  }

  return rows;
}

export function BriefCard({ brief }: { brief: DesignBrief }) {
  const rows = buildRows(brief);
  const filled = rows.filter((r) => r.value !== null).length;

  return (
    <aside className="brief">
      <div className="brief__head">
        <h2 className="brief__title">מה הבנו עד כה</h2>
        <span className="brief__count">
          {filled}/{rows.length}
        </span>
      </div>

      <ul className="brief__rows">
        {rows.map((row) => (
          <li
            className={row.value ? 'brief__row is-filled' : 'brief__row'}
            key={row.label}
          >
            <span className="brief__label">{row.label}</span>

            {row.value ? (
              <span className="brief__value">
                {row.swatches && row.swatches.length > 0 && (
                  <span className="brief__swatches">
                    {row.swatches.map((c) => (
                      <i key={c} style={{ background: c }} title={c} />
                    ))}
                  </span>
                )}
                {row.value}
              </span>
            ) : (
              <span className="brief__pending">—</span>
            )}
          </li>
        ))}
      </ul>

      <p className="brief__note">
        זה ה-brief המובנה שהסוכן מתחזק. הוא מתעדכן בכל הודעה.
      </p>
    </aside>
  );
}
