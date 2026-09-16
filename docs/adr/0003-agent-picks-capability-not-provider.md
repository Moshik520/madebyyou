# 3. The agent picks a capability; a registry picks the provider

Status: accepted · 2026-09-11

## Context

Different requests need different external services — or none at all:

| Request | Needs |
|---|---|
| "draw me a wolf logo" | text-to-image model |
| "make a caricature from this photo" | image-to-image model |
| "put my logo on the shirt with my name under it" | **nothing but local compositing** |

The agent has to express which of these applies. The obvious approach — let it
name the provider — puts a free-text vendor name into a model's output.

## Decision

The agent returns a closed enum:

```ts
capability: 'NONE' | 'TEXT_TO_IMAGE' | 'IMAGE_TO_IMAGE'
```

A registry on the server maps a capability to a concrete provider.

## Consequences

- The value is validated by Zod, so an invented provider name is impossible.
- Swapping vendors never touches the agent or its prompt.
- `NONE` is a first-class outcome: those requests cost nothing and finish in
  milliseconds, because they never reach a model.
- A new capability means a new enum value and a new registry entry — the agent
  only learns about it through its instructions.
