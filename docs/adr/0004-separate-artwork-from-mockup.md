# 4. Artwork and mockup are separate artefacts

Status: accepted · 2026-09-11

## Context

Every design produces something the customer looks at and something the printer
needs. Storing only "the picture of the shirt with the logo on it" would satisfy
the first and lose the second.

## Decision

Each `DesignVersion` points at two assets:

- **`artwork`** — a transparent PNG at print resolution, with no product in it.
- **`mockup`** — the artwork composited into the product's print area.

The artwork is product-independent. The mockup is derived and disposable.

## Consequences

- **Repositioning is free.** Moving or resizing a logo re-renders the mockup
  from the existing artwork: no model call, no cost, milliseconds.
- **Matching products are nearly free.** The same artwork composited against a
  different product's print area produces a coordinated set.
- **Print files exist from day one**, rather than being reconstructed later.
- Two files are stored per version instead of one, and the mockup must be
  regenerated whenever the product photo or print area changes.
