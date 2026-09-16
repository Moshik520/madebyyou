# 2. The agent returns structured output, not tool calls

Status: accepted · 2026-09-11

## Context

Each user message in the designer must produce four things: a reply for the
chat, an updated `DesignBrief`, a decision about whether there is enough
information to generate, and — when there is — which external capability is
needed.

Two shapes were available:

1. **Tool use** — let the model call a `generate_design` tool.
2. **Structured output** — have the model return one JSON object that the
   server acts on.

## Decision

Structured output. Every turn returns:

```ts
{ reply, brief, status, quickReplies, needsUpload, capability }
```

`status: 'READY'` is a *declaration*. The server validates the brief itself and
then runs the pipeline.

## Consequences

- **One model call per generation instead of two.** Tool use needs a second
  round trip so the model can react to the tool result.
- **Cost and behaviour are predictable.** The server, not the model, decides
  whether a side effect happens.
- The model can declare `READY` too early, so the server re-validates
  (`assertGeneratable`) and turns a premature declaration into a question
  rather than a bad image.
- The response is only as reliable as the schema enforcing it — see ADR 6.
