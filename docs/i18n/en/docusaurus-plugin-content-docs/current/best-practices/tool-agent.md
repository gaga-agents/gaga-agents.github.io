---
title: Tool-agent practice
description: Add external actions to an agent through small, testable capability contracts.
---

# Tool-agent practice

Choose one low-risk operation for the first tool-enabled agent. Test the tool directly, then test whether the agent selects it with valid arguments.

## Checklist

- The tool name and description express one responsibility.
- Inputs are validated before the external operation begins.
- Results distinguish success, business rejection, timeout, and system failure.
- Repeated requests have a documented idempotency strategy.
- The agent confirms or exposes material side effects.
- Logs include correlation information without depending on the natural-language answer.

Evaluate both positive and negative selection cases. A tool agent is not correct if it can call a tool only when explicitly commanded; it must also avoid the tool when the request does not require that action.
