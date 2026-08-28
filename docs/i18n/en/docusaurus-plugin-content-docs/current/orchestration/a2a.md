---
title: A2A collaboration
description: Define communication contracts between independently configured agents.
---

# A2A collaboration

A2A collaboration lets one agent delegate a bounded task to another agent that owns different capabilities or knowledge. The contract should be explicit even when both sides use natural language internally.

## Contract elements

- Caller and callee identities
- Task purpose and correlation identifier
- Input schema and required context
- Expected result or status schema
- Timeout, cancellation, retry, and idempotency rules
- Error categories and fallback behavior

## Collaboration pattern

The coordinator decides what to delegate, sends the smallest sufficient context, tracks task state, validates the returned result, and then integrates it into the parent task. The specialist should not need unrestricted access to the coordinator's entire history.

## Operational guidance

Propagate trace and task identifiers across the boundary. Avoid automatic retry for operations with irreversible side effects unless the callee supports idempotency. When several specialists can satisfy the request, make routing criteria observable so that selection can be evaluated.
