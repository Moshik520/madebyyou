# 5. Cart lines are keyed by a computed lineKey

Status: accepted · 2026-09-15

## Context

A cart line is unique per *product and design*. A customer may order the same
shirt with two different designs, and each must be its own line with its own
quantity.

The natural constraint does not work:

```prisma
@@unique([cartId, productId, designVersionId])
```

In Postgres every `NULL` is distinct from every other `NULL` in a unique index.
Two plain-product lines — both with `designVersionId = NULL` — would both be
accepted, and the atomic "increment if present" upsert would silently create
duplicates instead.

## Decision

Store a deterministic, never-null key on the row:

```ts
lineKey = `${productId}:${designVersionId ?? 'none'}`
```

with `@@unique([cartId, lineKey])`.

## Consequences

- `prisma.cartItem.upsert` stays atomic for both designed and plain lines, so
  concurrent "add to cart" clicks cannot duplicate a row.
- The column is redundant data derived from two others, and must be written
  wherever a cart item is created — it is produced by one helper to keep that
  in a single place.
- The alternative, `NULLS NOT DISTINCT`, is available in Postgres 15+ but is
  not expressible through Prisma's schema today.
