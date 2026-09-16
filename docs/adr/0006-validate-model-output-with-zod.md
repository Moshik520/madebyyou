# 6. Model output is validated like any other untrusted input

Status: accepted · 2026-09-14

## Context

The agent runs through `@anthropic-ai/claude-agent-sdk`, which returns free
text. There is no server-side schema enforcement, so the model may return prose
around the JSON, a lower-case enum value, a missing field, or no JSON at all.

The project already validates two other untrusted sources with Zod: HTTP request
bodies and environment variables. Model output is a third.

## Decision

Parse, then validate, then retry once:

```
extract JSON from the text
  → JSON.parse
  → agentTurnSchema.safeParse
  → on failure: retry once with the error appended to the prompt
  → on second failure: throw
```

Failures are logged separately for "not JSON at all" and "JSON but wrong
shape", because they point at different fixes — the first at the output-format
instructions, the second at how a field is described.

## Consequences

- Downstream code receives a fully typed `AgentTurn`; no `any` escapes the
  provider.
- The same Zod schema is the single source of both the runtime check and the
  TypeScript type.
- Validation caught a genuine modelling error rather than a model error:
  `textOverlay.content` was required, but the agent legitimately needed to say
  "there will be text, below the logo, and I do not know the wording yet".
  The schema was wrong, not the model.
- If the Messages API is used later, the same schema drives native structured
  output and the retry becomes a second line of defence rather than the only one.
