---
title: Core concepts
description: Understand projects, resources, agents, sessions, executions, and events.
---

# Core concepts

The platform models an agent request as a set of manageable objects. Understanding these boundaries makes both development and incident diagnosis faster.

```text
User → Project → Agent configuration → Session → Execution
                    ├─ LLM / tools / Skills / knowledge
                    └─ memory / planning / Prompt / execution policy
```

| Object | Responsibility | Typical lifecycle |
| --- | --- | --- |
| Project | Ownership boundary for resources, agents, builds, and permissions | create → use → archive |
| Resource | Reusable model, tool, Skill, or knowledge base | register → validate → version |
| Agent configuration | Executable behavior and dependency declaration | draft → debug → active → archive |
| Session | Context container for one user and one agent | create → interact → close |
| Execution | Steps, calls, and result of one request | pending → running → success/failed |
| Event | Observable fact emitted during a run | start → step/tool → complete/error |

## Configuration layers

The backend `ConfigAgent` separates LLM, tools, memory, planning, Prompt, and execution policy, with optional knowledge-base configuration. Change one layer at a time and rerun the same tests so behavior remains attributable.

## Which object should you use?

- Reuse a model connection: create an LLM resource instead of copying fields into agents.
- Preserve conversation context: create a session and select a memory strategy.
- Analyze one failure: inspect execution history and the event timeline.
- Reuse a process: create an orchestration definition or subflow instead of encoding every step in a Prompt.
