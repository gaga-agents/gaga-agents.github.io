---
title: Runtime, context and memory
description: Understand how task state, conversation context, and persistent memory differ.
---

# Runtime, context and memory

![Runtime state](/img/diagrams/runtime-state.svg)

These concepts solve different problems:

- **Runtime state** records the current execution: status, step, intermediate result, and error.
- **Conversation context** is the bounded information supplied to the model for the current interaction.
- **Persistent memory** stores selected facts or summaries for reuse across interactions.

## Context management

More context is not automatically better. Preserve the goal, constraints, recent decisions, and required evidence while removing redundant or stale material. Monitor token growth and make truncation or summarization behavior explicit.

## Memory policy

Define what may be stored, when it is updated, and how it is retrieved. Separate user-provided facts from model inferences and allow obsolete entries to be corrected. A memory feature without lifecycle rules can amplify old errors.

## Diagnosing runtime failures

Inspect the state transition that stopped, the input received by that step, the selected capability, and the stored error. This is more reliable than judging only the final response shown in the console.
