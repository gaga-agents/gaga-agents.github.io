---
title: Runtime contracts
description: Stable contracts for config agents, SSE events, tool confirmation, and orchestration states.
---

# Runtime contracts

This page is for frontend, Gateway, and service-integration developers. New fields should remain backward compatible; state changes must be reflected in the console and documentation.

## Config agent

The core `ConfigAgent` shape is:

```json
{
  "template": "react",
  "llm_config": {"model_id": "<llm-id>", "temperature": 0.7, "stream": true},
  "tool_config": {"mode": "auto", "max_iterations": 10},
  "memory_config": {"strategy": "sliding_window", "window_size": 10},
  "planning_config": {"strategy": "react", "max_steps": 10},
  "prompt_config": {"system_prompt": "...", "user_prompt_template": "{{input}}"},
  "execution_config": {"timeout": 300, "max_retries": 3, "error_handling": "stop"}
}
```

Real requests should reference resources registered in the platform. Placeholders above are not credentials or usable addresses.

## SSE events

Clients should handle `turn_start`, `step_start`, `llm_call_start`, `llm_response`, `tool_call_start`, `tool_call_complete`, `step_complete`, `step_error`, `turn_end`, and terminal execution events. Correlate with `execution_id`, `turn_id`, and `step_id` rather than guessing order from text.

## Tool confirmation

A confirmation record contains `confirmation_id`, `execution_id`, `turn_id`, `step_id`, `tool_call_id`, `user_id`, and decision state. Repeating the same decision is idempotent; a conflicting decision is a conflict; an expired request must not execute.

## Orchestration state

Execution states include `pending`, `running`, `waiting`, `resuming`, `paused`, `cancel_requested`, `success`, `failed`, and `cancelled`. Node states also distinguish `ready` and `skipped` to explain branches and joins.

## Compatibility rules

- New event fields should be safely ignored by old clients.
- A terminal execution cannot be resumed or cancelled.
- Side-effecting retries require a declared idempotency strategy.
- Gateway exposes the public API; internal service addresses are not frontend contracts.
