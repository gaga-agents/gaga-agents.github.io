---
title: Conversation workflow
description: Follow a request from session creation to streaming execution.
---

# Conversation workflow

The synchronous endpoint is convenient for short calls. The SSE endpoint exposes progress for debugging and long-running tasks while using the same agent and session model.

```text
Create or resume Session
        ↓
Submit input + context + files
        ↓
AgentRunFactory assembles runtime
        ↓
Prompt → LLM → Tool/Knowledge → next step
        ↓
Persist Execution / Timeline / Message
```

Typical SSE events include `execution_start`, `step_start`, `llm_call_start`, `llm_response`, `tool_call_start`, `tool_call_complete`, `step_complete`, and `execution_complete`. Failures use `*_error` events. Aggregate by `execution_id` and `step_id`, not by arrival count.

| Mode | Benefit | Cost | Use |
| --- | --- | --- | --- |
| Synchronous `/chat` | Simple client | No progress during long work | API smoke tests |
| SSE `/chat/stream` | Live steps, tools, and timing | Client must handle disconnects | Console and debugging |

Persist the execution identifier. After a disconnect, query history instead of blindly resubmitting a side-effecting request.
