---
title: Why an agent platform
description: Understand the engineering problems addressed by gagaduck-agents-platform.
---

# Why an agent platform

A prototype agent can call one model from a short script. A platform becomes necessary when several teams need repeatable development, shared resources, controlled releases, and observable production behavior.

![Five problem domains](/img/diagrams/five-problem-domains.svg)

## From isolated scripts to governed assets

Without a common platform, model configuration, prompts, tools, retrieval code, and deployment scripts are duplicated across applications. Changes become difficult to audit and runtime failures are hard to reproduce. gagaduck-agents-platform turns these parts into managed resources that can be combined by projects and agents.

## Five engineering concerns

| Concern | Platform response |
| --- | --- |
| Heterogeneous models | Centralized LLM resources and consistent calling conventions |
| Capability reuse | Tool packages and skills with explicit metadata |
| Private knowledge | Knowledge ingestion, vector retrieval, and graph-backed relations |
| Complex collaboration | Orchestration and A2A communication between specialized agents |
| Production governance | Versioned builds, service discovery, sandboxes, logs, and tracing |

The goal is not to hide engineering complexity. It is to place complexity behind clear boundaries so that a developer can see which resource is responsible for each behavior.
