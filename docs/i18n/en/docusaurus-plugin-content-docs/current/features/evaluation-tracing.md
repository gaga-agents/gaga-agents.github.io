---
title: Evaluation, tracing, and regression
description: Connect execution events, distributed traces, and evaluation cases into a quality loop.
---

# Evaluation, tracing, and regression

Agent quality requires both “is the answer correct?” and “how did the system produce it?”. Execution records, SSE events, service logs, and SkyWalking traces answer different questions.

| Layer | Question | Signals |
| --- | --- | --- |
| Outcome evaluation | Does the result meet the business standard? | correctness, groundedness, format |
| Execution trace | Which step, tool, or model caused the behavior? | execution ID, step ID, tool, duration |
| System telemetry | Is a service, queue, or resource the bottleneck? | health, latency, errors, queue |

Keep cases for normal, ambiguous, unauthorized, empty-retrieval, tool-failure, timeout, long-context, and multimodal-boundary inputs. Record expected properties instead of one exact sentence when several answers are valid.

Track model calls, tokens, tool calls, retrieval time, total time, and retries. Promote a change only after replaying the full regression set and preserving the release evidence.
