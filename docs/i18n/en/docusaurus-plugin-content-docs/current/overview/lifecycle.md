---
title: Product lifecycle
description: Follow an agent from resource preparation to continuous governance.
---

# Product lifecycle

![Product lifecycle](/img/diagrams/platform-lifecycle.svg)

The platform workflow has five connected stages:

1. **Prepare resources.** Register models, tool packages, skills, and knowledge bases.
2. **Develop.** Create a project, configure an agent, select capabilities, and tune runtime behavior.
3. **Orchestrate.** Compose specialized agents into a task flow when one agent is not enough.
4. **Build and deploy.** Produce a versioned artifact and publish the corresponding runtime service.
5. **Observe and govern.** Use state, logs, traces, and evaluation results to improve the next version.

This is a loop rather than a one-way release pipeline. Runtime evidence should feed back into prompts, resource selection, knowledge quality, orchestration topology, and release policy.

## Ownership boundaries

- Platform administrators maintain shared infrastructure and service configuration.
- Resource owners maintain models, tools, and knowledge sources.
- Agent developers define behavior and collaboration.
- Operators validate deployments and production health.

Clear ownership helps teams diagnose whether a problem belongs to data, a capability resource, agent logic, orchestration, or the runtime environment.
