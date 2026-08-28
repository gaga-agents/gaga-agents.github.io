---
title: Models, context, and memory
description: Select a model and choose a memory strategy for conversations of different lengths.
---

# Models, context, and memory

The model generates or decides; context controls what it sees now; memory controls what survives across turns. Keeping these concepts separate prevents token overflow and stale facts.

| Strategy | Good for | Benefit | Trade-off |
| --- | --- | --- | --- |
| `none` | Single-turn requests | Lowest cost and highest control | No history |
| `full` | Short conversations and debugging | Complete context | Grows linearly |
| `sliding_window` | Stable multi-turn assistants | Bounded recent history | Early facts disappear |
| `summary` | Long conversations | Compresses old history | Details can be lost |
| `buffer` | Token-bounded context | Explicit and predictable budget | Must be tuned to the model window |
| `hierarchical_file` | Cross-session work | Working/session/agent layers | Requires promotion and cleanup policy |

Tune window size, summary thresholds, and token budgets against the model context window and real request lengths. A turn includes the user request, assistant responses, tool calls, and tool results.

## Model checklist

1. Validate connectivity and model identifier.
2. Test context length, structured output, and tool calls.
3. Confirm vision support and provider formatting for images.
4. Record temperature, token limits, and reasoning settings for reproducibility.
