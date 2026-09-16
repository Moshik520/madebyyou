# Architecture Decision Records

One file per decision: the context that forced it, the decision itself, and
what it costs. Written when the decision is made, not reconstructed afterwards.

| # | Decision |
|---|---|
| [1](./0001-money-as-decimal.md) | Money is Decimal, never a floating point number |
| [2](./0002-agent-returns-structured-output.md) | The agent returns structured output, not tool calls |
| [3](./0003-agent-picks-capability-not-provider.md) | The agent picks a capability; a registry picks the provider |
| [4](./0004-separate-artwork-from-mockup.md) | Artwork and mockup are separate artefacts |
| [5](./0005-cart-line-key.md) | Cart lines are keyed by a computed lineKey |
| [6](./0006-validate-model-output-with-zod.md) | Model output is validated like any other untrusted input |
