import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { Placement, PrintArea } from '../lib/api';
import './PlacementEditor.css';

type PlacementEditorProps = {
  productImageUrl: string;
  printArea: PrintArea;
  artworkUrl: string;
  initial: Placement;
  busy: boolean;
  onCancel: () => void;
  onSave: (placement: Placement) => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function PlacementEditor({
  productImageUrl,
  printArea,
  artworkUrl,
  initial,
  busy,
  onCancel,
  onSave,
}: PlacementEditorProps) {
  const [placement, setPlacement] = useState<Placement>(initial);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  /**
   * printArea is in the product image's own pixels. Converting to percentages
   * lets the preview scale with whatever size the stage happens to be — and
   * keeps the browser's maths identical to the server's.
   */
  const pct = natural
    ? {
        left: (printArea.x / natural.w) * 100,
        top: (printArea.y / natural.h) * 100,
        width: (printArea.width / natural.w) * 100,
        height: (printArea.height / natural.h) * 100,
      }
    : null;

  function pointToPlacement(clientX: number, clientY: number) {
    const stage = stageRef.current;
    if (!stage || !natural) return;

    const rect = stage.getBoundingClientRect();
    const scale = rect.width / natural.w;

    const areaLeft = rect.left + printArea.x * scale;
    const areaTop = rect.top + printArea.y * scale;
    const areaWidth = printArea.width * scale;
    const areaHeight = printArea.height * scale;

    setPlacement((prev) => ({
      ...prev,
      x: clamp((clientX - areaLeft) / areaWidth, 0, 1),
      y: clamp((clientY - areaTop) / areaHeight, 0, 1),
    }));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (busy) return;

    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointToPlacement(event.clientX, event.clientY);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    pointToPlacement(event.clientX, event.clientY);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className="placer" role="dialog" aria-label="מיקום העיצוב">
      <div className="placer__panel">
        <header className="placer__head">
          <h2 className="placer__title">מיקום וגודל</h2>
          <button
            className="placer__close"
            type="button"
            onClick={onCancel}
            aria-label="סגירה"
          >
            ✕
          </button>
        </header>

        <p className="placer__hint">
          גררו את העיצוב למקום הרצוי, ושנו את הגודל עם המחוון.
        </p>

        <div
          className="placer__stage"
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <img
            className="placer__product"
            src={productImageUrl}
            alt=""
            draggable={false}
            onLoad={(e) =>
              setNatural({
                w: e.currentTarget.naturalWidth,
                h: e.currentTarget.naturalHeight,
              })
            }
          />

          {pct && (
            <>
              <div
                className="placer__area"
                style={{
                  left: `${pct.left}%`,
                  top: `${pct.top}%`,
                  width: `${pct.width}%`,
                  height: `${pct.height}%`,
                }}
              />

              <img
                className="placer__artwork"
                src={artworkUrl}
                alt=""
                draggable={false}
                style={{
                  width: `${pct.width * placement.scale}%`,
                  height: `${pct.height * placement.scale}%`,
                  left: `${pct.left + pct.width * placement.x}%`,
                  top: `${pct.top + pct.height * placement.y}%`,
                }}
              />
            </>
          )}
        </div>

        <label className="placer__slider">
          <span>גודל</span>
          <input
            type="range"
            min={10}
            max={100}
            value={Math.round(placement.scale * 100)}
            disabled={busy}
            onChange={(e) =>
              setPlacement((prev) => ({
                ...prev,
                scale: Number(e.target.value) / 100,
              }))
            }
          />
          <span className="placer__value">
            {Math.round(placement.scale * 100)}%
          </span>
        </label>

        <div className="placer__actions">
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => setPlacement({ x: 0.5, y: 0.5, scale: 1 })}
            disabled={busy}
          >
            איפוס
          </button>
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => onSave(placement)}
            disabled={busy || !natural}
          >
            {busy ? 'שומר…' : 'שמירת מיקום'}
          </button>
        </div>
      </div>
    </div>
  );
}
