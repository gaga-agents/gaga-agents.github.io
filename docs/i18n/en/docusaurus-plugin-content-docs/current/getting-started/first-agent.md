---
title: "Quickstart: build your first agent"
description: Configure, debug, build, and verify a minimal agent.
---

# Quickstart: build your first agent

Start with the smallest useful configuration: one project, one tested model, a clear instruction, and no optional capability until the basic conversation succeeds.

## 1. Create the agent

Open **Agents**, create an agent in the current project, and define its name, purpose, and operating instruction. A good instruction states the role, accepted inputs, expected output, and boundaries.

## 2. Select a model

Attach a model resource whose connectivity has already been tested. Set generation parameters conservatively; change one parameter at a time so that behavior remains explainable.

## 3. Add capabilities incrementally

Run a plain conversation first. Then add one tool, skill, or knowledge base and verify that the agent invokes it only when appropriate. Incremental assembly makes failures attributable to a specific resource.

## 4. Debug representative tasks

Test a normal request, an ambiguous request, and a request outside the agent's scope. Inspect the answer, capability calls, runtime state, and error logs. Update the instruction or resource configuration based on evidence rather than a single successful demo.

## 5. Build and verify

Create a versioned build, follow its status, and validate the resulting runtime endpoint. Record the configuration and test cases that define the release so that later changes can be compared and rolled back.

For deeper tuning, continue with [Agent configuration](../agents/configuration.md) and [Debugging and evaluation](../agents/debugging.md).
