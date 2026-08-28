---
title: Observability and continuous governance
description: Use health, logs, traces, task state, and evaluation results to operate the platform.
---

# Observability and continuous governance

![Governance loop](/img/diagrams/governance-loop.svg)

Agent operations require both conventional service telemetry and semantic evidence about what the agent decided.

## Observation layers

| Layer | Signals |
| --- | --- |
| Infrastructure | Pod status, resource pressure, storage, network |
| Service | Health, registration, latency, error rate, dependencies |
| Task | Queue state, active step, retry, timeout, failure reason |
| Agent | Model choice, retrieved evidence, capability call, response |
| Release | Configuration version, build artifact, deployment result |

## Incident workflow

Start from the user-visible failure and capture its task or trace identifier. Follow it through Gateway, business services, schedulers, and sandboxes. Compare the failing run with a successful run from the same release before changing configuration.

## Governance loop

Aggregate recurring failures and evaluation results, assign them to the responsible layer, test a controlled change, release a new version, and continue monitoring. Service uptime alone does not prove agent quality; semantic evaluation and operational telemetry must be reviewed together.
