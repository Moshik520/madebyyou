# 1. Money is Decimal, never a floating point number

Status: accepted · 2026-09-08

## Context

Prices, line totals and order totals move through the database, the API and the
browser. JavaScript numbers are IEEE-754 binary floats, which cannot represent
most decimal fractions exactly:

```js
0.1 + 0.2 === 0.3   // false
```

Three items at 19.99 can total 59.970000000000006. At scale that becomes a
real accounting discrepancy, and it is close to impossible to reconcile after
the fact.

## Decision

- Store money as `Decimal @db.Decimal(10, 2)` in Postgres.
- Compute with `decimal.js` on the server; never with `Number`.
- Serialise money to JSON as a **string** with exactly two decimals
  (`"24.90"`), produced with `toFixed(2)`.
- The browser may parse that string for display only. All arithmetic stays on
  the server.

## Consequences

- Every money value needs an explicit conversion at the edge, which is a little
  more code than using numbers.
- `toString()` on a Decimal drops trailing zeros (`"24.9"`), so `toFixed(2)` is
  mandatory — this was found by manual testing, not by the type checker.
- Totals are exact and reproducible, and the API contract is unambiguous about
  precision.
