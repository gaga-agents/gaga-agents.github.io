---
title: Debugging and evaluation
description: Turn observed agent behavior into reproducible tests and actionable fixes.
---

# Debugging and evaluation

Debugging starts with a repeatable input and a precise failure statement. “The answer is bad” is not enough; identify whether the failure is model output, retrieval, tool selection, orchestration, service connectivity, or presentation.

## Evaluation set

Keep a compact set covering normal requests, ambiguous inputs, boundary conditions, capability failures, and unsafe or unsupported requests. Record expected properties rather than forcing one exact sentence when several answers are valid.

## Evidence to inspect

- Agent configuration and release version
- Model request parameters and response metadata
- Retrieved knowledge units
- Tool calls, arguments, outputs, and duration
- Runtime state transitions and service logs
- Distributed trace across Gateway and backend services

## Fix loop

Reproduce the failure, locate the responsible layer, change one variable, rerun the same case, and check regression cases. Promote a fix only after it improves the targeted behavior without breaking established scenarios.

See [Runtime contracts](../reference/contracts.md) for event coordinates, tool confirmation, and execution states, and [Evaluation, tracing, and regression](../features/evaluation-tracing.md) for the full quality loop.
