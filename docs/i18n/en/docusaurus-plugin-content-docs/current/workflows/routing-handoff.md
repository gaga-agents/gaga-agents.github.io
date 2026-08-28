---
title: Routing, parallelism, and handoffs
description: Route work to the right agent and pass context through explicit workflow contracts.
---

# Routing, parallelism, and handoffs

The orchestration service includes `condition`, `switch`, `parallel`, `join`, `iteration`, `loop`, `subflow`, `approval`, `transform`, and `agent_task` nodes. Use their control-flow semantics instead of simulating everything in a Prompt.

| Pattern | Use when | Required design |
| --- | --- | --- |
| Conditional route | A result chooses one path | Condition fields and default branch |
| Parallel + Join | Independent work can run together | Aggregation and partial-failure policy |
| Iteration/loop | Process a collection or repeat until a condition | Maximum count and termination condition |
| Subflow | Reuse a process | Stable input/output contract |
| Approval | A human must authorize risk | Waiting state and resume path |

An A2A handoff should include a correlation ID, caller, target, goal, input schema, timeout, cancellation, retry, and error categories. Send only the context the recipient needs.

Parallel execution may be limited by downstream rate limits, shared locks, or Join waiting. Record every branch and define whether one failure cancels the others.
