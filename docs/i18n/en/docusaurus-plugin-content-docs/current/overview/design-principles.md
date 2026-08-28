---
title: Design advantages
description: Understand the execution ledger, context budgets, recovery controls, and safety confirmation that shape the platform.
---

# Design advantages

The platform's value is not only that an agent can be configured in a page. A run is modeled as something that can be observed, recovered, and audited, with each design point represented in the current backend.

## 1. A three-level Turn / Step / Execution ledger

`AgenticLoop` drives one user turn, each model or tool progression is a step, and the execution records the complete run. Events carry `execution_id`, `turn_id`, `step_id`, and `segment_id`, allowing the console to correlate streaming events, messages, tool calls, and final output.

## 2. Strategies are separated from executors

Strategies propose a `StepPlan` and `StepRequest`; `StepDispatcher` and runtime components perform model, tool, and message work. ReAct, plan-and-execute, and custom strategies can share state, events, retries, and persistence without copying the whole loop.

## 3. Context is a composed budget

`ContextAssembler` budgets Prompt text, tool descriptions, Few-shot examples, runtime state, external Skills, and individual messages separately before assembling the request. Tool-library selection narrows the capability set and can add file tools for file-related tasks.

## 4. Controls take effect at step boundaries

Cancel, pause, resume, and user steering are not implemented as an arbitrary process kill. The loop polls durable commands at step boundaries, puts steering messages into an Inbox, and releases unconsumed input back to the queue. Ordering is therefore explicit across background execution and streaming clients.

## 5. High-impact tools have an explicit confirmation state

A tool call can enter `pending_confirmation` while the user approves or rejects it. Mongo conditional updates coordinate timeout, cancellation, conflicting decisions, and idempotent submission. Safety is part of execution state, not merely a frontend dialog.

## 6. Recovery is preferred to blind replay

Orchestration states distinguish `waiting`, `paused`, `resuming`, and `cancel_requested` from terminal `success`, `failed`, and `cancelled`. Recovery should continue from persisted execution state and node results instead of replaying every side effect.

| Dimension | Script-based agent | gagaduck-agents-platform |
| --- | --- | --- |
| Debugging | Prints a final result | Events, steps, tools, tokens, and state ledger |
| Extension | Copies the loop for each strategy | Layered strategy, dispatcher, and runtimes |
| Context | Appends strings indefinitely | Component budgets, truncation, workspace index |
| Control | Kills or resubmits a process | Boundary-aware cancel, pause, steering, resume |
| Safety | Caller decides ad hoc | Confirmation, timeout, conflict handling, audit record |
