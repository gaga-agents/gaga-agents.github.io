---
title: Skills and tools
description: Package reusable capabilities and connect them to agents with explicit contracts.
---

# Skills and tools

![Tool execution](/img/diagrams/tool-execution.svg)

Skills and tools extend an agent beyond text generation. A well-defined capability has a narrow purpose, explicit inputs, predictable outputs, and observable failure behavior.

## Capability lifecycle

1. Define the business operation and input schema.
2. Implement or register the callable package.
3. Test it independently from an agent.
4. Attach it to an agent with a clear usage description.
5. Observe calls, latency, errors, and returned data.

## Design rules

- Prefer several small, composable tools to one interface that performs unrelated operations.
- Use stable field names and validate inputs at the boundary.
- Return structured results when downstream reasoning depends on specific fields.
- Make timeout, retry, and idempotency behavior explicit.
- Keep side effects visible to the user or workflow that triggered them.

Tool availability alone does not guarantee correct selection. The agent instruction should explain when the capability applies, and debugging should confirm both invocation and non-invocation cases.
