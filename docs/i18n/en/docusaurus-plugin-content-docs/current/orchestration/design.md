---
title: Design multi-agent orchestration
description: Decompose work, assign responsibilities, and define observable collaboration flows.
---

# Design multi-agent orchestration

![Orchestration flow](/img/diagrams/orchestration-flow.svg)

![Task orchestration](/img/diagrams/task-orchestration.svg)

Use multiple agents when a task contains responsibilities that benefit from different instructions, resources, or evaluation criteria. Do not split a workflow only to increase the number of agents.

## Design process

1. Define the final output and acceptance criteria.
2. Decompose the work into responsibilities with explicit inputs and outputs.
3. Assign each responsibility to an agent with the required model, tools, and knowledge.
4. Choose sequential, parallel, conditional, or iterative execution.
5. Define how intermediate results are validated and merged.
6. Add timeout, retry, and failure-handling rules.

## Data contracts

Every edge in the flow should state what is passed, which fields are required, and what happens when the producer returns incomplete data. Structured handoffs reduce the chance that one agent must infer another agent's intent from prose.

## Observability

Track the parent task, child task, active node, input summary, output reference, duration, and error for each step. A complex flow is only maintainable when an operator can reconstruct why it chose a branch and where it stopped.
