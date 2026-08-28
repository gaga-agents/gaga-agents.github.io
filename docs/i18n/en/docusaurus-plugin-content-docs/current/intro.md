---
title: What is gagaduck-agents-platform?
description: An engineering platform for building, orchestrating, releasing, and governing AI agents.
---

# gagaduck-agents-platform

**gagaduck-agents-platform** (嘎嘎鸭智能体快速开发部署平台) is an engineering platform for taking an agent from an idea to a managed service. It brings model access, tools, knowledge, agent configuration, multi-agent orchestration, build and deployment, and runtime observability into one workflow.

![Platform lifecycle](/img/diagrams/platform-lifecycle.svg)

## What the platform solves

Agent applications are more than a prompt and a model. A production system must manage model credentials and routing, reusable tools, retrieval pipelines, execution sandboxes, collaboration between agents, releases, logs, and runtime state. The platform gives those concerns explicit resources and lifecycle controls instead of leaving every team to assemble them independently.

## Core capabilities

- **Resource management:** register LLM endpoints, tools, skills, and knowledge bases.
- **Agent development:** configure instructions, capabilities, runtime parameters, and memory.
- **Orchestration:** define sequential, parallel, conditional, and A2A collaboration flows.
- **Build and delivery:** turn a configuration into a versioned, deployable workload.
- **Operations:** inspect logs, traces, task state, and service health.

## Recommended reading path

1. Read [Why an agent platform](./overview/why-platform.md) and [Platform architecture](./overview/architecture.md).
2. [Prepare the environment](./getting-started/prerequisites.md).
3. Choose [Kubernetes deployment](./getting-started/deploy-platform.md) or [Python local startup](./getting-started/python-local.md).
4. Create a project and build your first agent.

The documentation describes the **V2 product and repository as it exists today**. Pages distinguish implemented behavior from extension points so that architecture plans are not mistaken for runnable features.
