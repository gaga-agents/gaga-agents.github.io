---
title: Agent debugging and session execution
description: Debug configured Agents with Sessions, queued messages, in-flight steering, cancellation, SSE events, and execution traces.
---

# Agent debugging and session execution

Agent Debug validates prompts, models, memory, knowledge, tools, files, and multimodal input in a real Session. The result is more than a final answer: the page also shows steps, model output, tool calls, errors, and runtime state.

## Prerequisites

Before debugging, confirm that:

1. the Agent is saved and selects a working model;
2. the current user can view the Agent's project;
3. model, knowledge, tool, Skill, and MCP dependencies are reachable;
4. Session workspace storage is writable when files or images are required;
5. tool mode and confirmation policy are configured for manual approval tests.

Start with one short, verifiable prompt. Add knowledge, tools, images, and long conversations incrementally so a failure can be assigned to the correct layer.

## What a Session contains

A Session is the boundary for continuous conversation and runtime state. It associates:

- one configured Agent;
- the user who created the Session;
- user, assistant, and tool messages;
- multi-turn execution records and token totals;
- the pending-message queue;
- the Session file workspace;
- state produced by the selected memory strategy.

Later messages in the same Session can read history selected by the memory strategy. Messages, queued inputs, and workspace files from different Sessions are not merged automatically.

## Create and switch Sessions

You can enter the first message directly after opening Agent Debug. If no Session is selected, the frontend creates one, opens its event stream, and then submits the message.

Session History also supports:

- **Create:** begin an independent conversation context;
- **Switch/continue:** select a Session, load its normalized timeline, runtime state, and workspace, then send more messages;
- **Delete:** remove one Session;
- **Batch delete:** select and remove several Sessions;
- **Search and pagination:** filter by name and load Sessions in bounded pages.

Switching closes the previous Session event stream and subscribes to the new one. It does not copy the previous conversation into the selected Session.

Session deletion is a data-deletion operation. Export important results or write them to a durable business system before removing a Session and its associated data.

## How one message executes

Agent Debug uses a Session-level event stream plus Inbox admission:

```text
Open Session
  ↓ GET /config-sessions/{session_id}/events
Receive runtime_snapshot
  ↓
Admit a message at /config-agents/{agent_id}/chat/admit
  ↓ Persist in the MongoDB Inbox
Message becomes queue or steer
  ↓ Claimed by an execution instance
Turn / Step / LLM / Tool events flow through Session SSE
  ↓
The frontend merges events into one timeline
```

Successful admission means the message is in the Inbox, not that the model has answered. After receiving `item_id`, the page uses claim, step, and terminal events to update that message.

`client_message_id` makes retries idempotent. Reusing an ID in the same Session returns the existing message instead of creating a duplicate after a network retry.

## Normal queue mode

`queue` means “process in a later Turn.” An idle Session claims the message and starts a new Turn. If a Turn is active, the message remains pending until the current Turn ends, then runs in order.

Use `queue` when:

- submitting independent questions in sequence;
- the current task should finish before the next starts;
- new input must not redirect current reasoning.

The page displays pending count and message previews. A message can be removed while its state remains `queued`; after an execution instance claims it, it can no longer be removed from the queue.

Cancelling the active execution does not delete normal queued messages. Once the active Turn reaches a cancelled terminal state, the next queued input may still run.

## In-flight steering

`steer` means “inject guidance at the next safe Step boundary of the current execution.” Use it to add a constraint, correct direction, or provide missing information, for example:

```text
Do not call the external API again. Use report.csv from the current workspace.
```

The flow is:

1. the Session has an active Turn;
2. the user sends with the steer action or promotes a queued message;
3. the message binds to the active `execution_id` and `turn_id` with `next-step` placement;
4. Runtime consumes it at a Step boundary and includes it in the remaining Turn context;
5. SSE associates the steering message and later steps with the same Turn.

If a newly submitted `steer` finds no active Turn, the backend normalizes it to `queue`. Promoting an existing queued message without an active Turn returns a conflict. Steering does not immediately interrupt an in-progress provider or tool network call; it takes effect at a controlled boundary.

## Cancel, pause, and resume

Configured-Agent debugging currently supports **cancelling the active Turn**:

- the backend persists a `cancel` command;
- it also attempts a fast local cancellation when the execution is in the same process;
- if that path fails, AgenticLoop still consumes the command at a safe boundary;
- `execution_cancelled` or another terminal event updates the page;
- ordinary queued messages remain pending.

Cancelling when no Turn is active does not create a new execution and returns that there is no active Turn.

:::note Pause and resume are not currently supported

The configured-Agent Session API and Agent Debug page do not expose `pause` or `resume`. Use `steer` to redirect an active task or cancel to terminate it. Orchestration states such as `paused` and `resuming` do not mean that single-Agent debugging implements these controls.
:::

## How SSE drives the page

The frontend opens one long-lived connection for the selected Session:

```http
GET /api/v1/agents/config-sessions/{session_id}/events
Accept: text/event-stream
```

The server first sends `runtime_snapshot` with the active Turn and Inbox queue. It then emits normalized events, plus a comment heartbeat after about 15 idle seconds so intermediaries do not treat the connection as idle.

Important event groups are:

| Phase | Events | UI behavior |
| --- | --- | --- |
| Session sync | `runtime_snapshot` | Restore active execution and queue views |
| Admission and claim | `message_queued`, `message_claimed` | Update queue state and place messages on the timeline |
| Turn | `turn_start`, `turn_closing`, `turn_end` | Open and close one conversation Turn |
| Step | `step_start`, `step_complete`, `step_error` | Show step name, type, state, and error |
| Model | `llm_call_start`, streaming deltas, `llm_response` | Render model output incrementally |
| Tool | `tool_call_start`, `tool_call_complete`, `tool_call_error` | Show tool name, arguments, output, and state |
| Confirmation | `tool_call_pending_confirmation` and rejection events | Offer approval or rejection |
| Terminal | `execution_complete`, `execution_error`, `execution_interrupted`, `execution_cancelled` | Settle answer, error, and final state |

Events are correlated by `execution_id`, `turn_id`, `step_id`, `tool_call_id`, and `timeline_seq`. Clients must not infer ownership from arrival order or text. Streaming updates, network jitter, and cross-instance execution can interleave local event order.

The current frontend does not reconnect Session SSE automatically. If the connection fails, reopen or switch back to the Session to reload the server timeline and runtime state. Do not use the last visible animation as proof of backend state.

## Tool-call presentation

Tool calls appear under their Turn and Step with:

- tool name and `tool_call_id`;
- model-generated arguments;
- running, completed, failed, confirmation-pending, or rejected state;
- tool result or error;
- the Step associated with that call.

In manual-confirmation mode, the tool first enters `pending_confirmation`. Approval continues execution, while rejection emits a rejection event and skips the call. Submit the event's `confirmation_id`; do not infer the pending record from the tool name.

Debug a tool in this order: model selection, schema-valid arguments, confirmation state, executor result, and whether the final answer used the result correctly.

## Inspect steps, tokens, errors, and terminal state

### Steps

Each Step has a `step_id` and may represent planning, model generation, tool execution, reflection, or another strategy stage. The page groups Steps by Turn and shows running, completed, or failed state. One Turn may contain several Steps and tool calls.

### Tokens and duration

Execution records aggregate `prompt_tokens`, `completion_tokens`, `total_tokens`, `duration_ms`, model-call count, steps, and completion reason. Session History can show cumulative tokens, while execution details isolate a single request.

Usage may be `0` when a provider does not return it. Platform image budgeting is also not the provider's final billing formula.

### Errors

Find the earliest failure event instead of reading only the final message:

1. `step_error`: a runtime step failed;
2. `tool_call_error`: the tool itself failed;
3. `execution_error`: execution cannot continue;
4. `execution_interrupted`: steering or another control boundary interrupted the current path;
5. `execution_cancelled`: user cancellation.

Record `session_id`, `execution_id`, `turn_id`, and `step_id`, then correlate Agent Management, LLM, Tool, Knowledge, and Scheduler logs.

### Terminal state

Execution must settle to completed, failed, interrupted, or cancelled. `turn_end` closes the current Turn; `execution_complete` carries the complete report. The frontend merges final output, Steps, tool state, and errors into the corresponding assistant message.

## Session versus Stateless execution

| Dimension | Session | Stateless |
| --- | --- | --- |
| `session_id` | Required and references an existing Session | Omitted |
| History | Loaded through the memory strategy | Always empty |
| Cross-request memory | Available | Unavailable |
| Queue | Supports `queue` | Unsupported |
| In-flight guidance | Supports `steer` | Unsupported |
| SSE | Session snapshot and continuous events | One request's SSE only |
| Workspace | Persistent Session workspace | Temporary per-request workspace |
| Cancellation | Control the active Turn by Session | No Session control endpoint |
| Best fit | Multi-turn debugging, files, interactive control | One-shot API calls and stateless integrations |

Even when the Agent selects `summary` or `hierarchical_file`, a Stateless request executes with `session_transcript=[]` and `session_id=None`, so it cannot remember across requests. Create and reuse a Session for continuous conversation.

## Recommended workflow

1. Create a Session and verify model connectivity with plain text.
2. Inspect Turn, Step, streaming output, and tokens.
3. Add one tool and validate selection, arguments, confirmation, and result.
4. Add knowledge, Skills, MCP, files, or images incrementally.
5. Test normal queueing, steering, and cancellation during an active Turn.
6. Switch away and return to confirm that timeline and queue restore from the server.
7. Save failing input and `execution_id`, change one variable, and rerun.
8. Complete regression with the same cases before moving to [Agent builds](../delivery/agent-build.md).

## Troubleshooting

### A message stays queued

Check for a long-running active Turn, a tool waiting for confirmation, and a healthy event connection. The Runtime snapshot distinguishes a real backend queue from a stale frontend view.

### Steering becomes the next Turn

The active Turn ended before admission, so the backend normalized the message to `queue`. A new `steer` binds only when an active execution exists.

### Another message starts after cancellation

This is expected: cancellation terminates only the active Turn and does not clear the normal queue. Remove queued messages before they are claimed if they must not run.

### The page stops updating while the backend still runs

Session SSE may have disconnected. Reopen the Session, load timeline and `runtime_snapshot`, and inspect server state by `execution_id`.

### The final answer succeeds after a failed Step

Some strategies retry or degrade after a tool failure. Check whether a later Step succeeded and compare the behavior with execution error-handling configuration.

See [File workspace](./file-workspace.md) for upload, references, and storage; [Tool calls and safety confirmation](./tool-calls-confirmation.md) for modes, confirmation states, and file arguments; [Runtime contracts](../reference/contracts.md) for event fields; [Runtime and memory](./runtime-memory.md) for memory behavior; [Multimodal Agent input](./multimodal-input.md) for image debugging; and [Evaluation, tracing, and regression](../features/evaluation-tracing.md) for systematic regression.
