---
title: Tool calls and safety confirmation
description: Understand tool modes, model selection, parameter schemas, approval, retries, file parameters, and audit records.
---

# Tool calls and safety confirmation

Tool calls extend an Agent from generating text to reading files, querying knowledge, calling MCP, or executing mechanism models. The platform separates discovery, model decision, approval, execution, and observation so a model-generated call does not immediately create an uncontrolled side effect.

## Execution path

```text
Load available tools
  ↓ Build name / description / parameter Schema
Model chooses a tool and generates arguments
  ↓
Parse tool_call and assign tool_call_id
  ↓ manual mode enters pending_confirmation
Execute Builtin / KB / Skill / MCP / Scheduler target
  ↓
Emit ToolCallComplete or ToolCallError
  ↓
Return the result to the model as an observation
  ↓
Call another tool or produce the final answer
```

Whether a call occurs depends on both Agent configuration and the selected model's ability to produce the platform's tool-call structure reliably.

## Tool modes

`tool_config.mode` supports:

| Mode | Behavior | Best fit |
| --- | --- | --- |
| `none` | Load no tool definitions; answer directly | Plain Q&A, prompt tests, no side effects |
| `auto` | The model decides whether to call and execution starts immediately | Low-risk, retryable, permission-bounded tools |
| `manual` | The model still chooses, but every call waits for user approval | Writes, deletes, external requests, cost, or other high-impact actions |

`manual` does not ask the user to choose the tool. The model proposes a call and the user approves its side effect. Built-in, knowledge, external Skill, MCP, and mechanism-model tools all pass through the same confirmation boundary.

With `none`, configured libraries, Skills, and MCP references may remain saved but are not loaded at runtime. Context explicitly tells the model that no tools are available.

## Tool sources

Runtime can combine individual tools, tool libraries, built-in file and Web Search tools, knowledge tools, external Skill execution, and tools discovered from MCP Servers.

Each source becomes a normalized function definition and execution mapping. MCP tools receive stable local aliases to prevent collisions across Servers, while execution still uses the remote original name.

## How the model selects a tool

Each tool shown to the model includes a name, description, and parameter Schema:

```json
{
  "name": "search_documents",
  "description": "Search project documents by keyword",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {"type": "string", "description": "Search terms"},
      "limit": {"type": "integer", "default": 5}
    },
    "required": ["query"]
  }
}
```

The name identifies the target, the description explains when to use it, and Schema plus examples guide argument generation. Describe use cases and limits instead of merely repeating the name.

To avoid placing every tool in context, the platform can select relevant capability sources:

- with no more than 25 tools, all enabled tools are normally loaded;
- with a larger set from multiple libraries, relevant libraries can be selected from user input;
- configuring MCP also enables dynamic capability-source selection;
- file tasks use built-in file metadata during selection.

Selection reduces context noise but can omit a needed tool. When a model cannot see a tool, verify its presence in this Turn's definitions rather than checking only the saved configuration.

## Parameter Schema

Schema provides field names, `type`, `required`, `enum`, and `default`. `format: binary`, `contentMediaType`, or `x-type: file` identifies a file parameter.

When `example_input` exists, the platform includes it as strong guidance. It can also infer basic Schema from an example when a library omitted one. Examples help generation but do not replace a formal Schema.

:::warning Schema is not the only security boundary

Models can still produce missing fields, wrong types, or invalid business values. Tool implementations must validate input, authorization, resource ownership, and business constraints again instead of trusting model arguments.
:::

## Confirmation state machine

In `manual` mode, every call creates a persisted confirmation record:

```text
pending
  ├─ approve → approved → applied → execute
  ├─ reject → rejected → skip
  ├─ no decision for 300 seconds → expired
  └─ execution cancellation → cancelled
```

The record stores `confirmation_id`, `execution_id`, `session_id`, `turn_id`, `step_id`, `tool_call_id`, and `user_id`. The tool name and arguments travel in `tool_call_pending_confirmation` SSE.

Runtime creates the record and emits the event; Agent Debug displays approve/reject controls; the user submits the event's `confirmation_id`; the execution instance polls MongoDB and atomically consumes the decision. Only approval produces `tool_call_start`. Rejection, timeout, and cancellation never execute the tool.

The default timeout is 300 seconds. While confirmation is pending, the Turn remains active and ordinary new inputs join the Session queue.

## Approval, rejection, timeout, and duplicates

| Case | Result |
| --- | --- |
| Approve | Persist and consume approval, then execute |
| Reject | Emit rejection, add a Tool Message, and let the model continue with available information |
| Timeout | Mark `expired`, emit an error, and cancel the call |
| Execution cancelled | Mark `cancelled` and stop accepting a decision |
| Repeat the same decision | Idempotently return the existing result |
| Submit the opposite decision | Return `409 Conflict` |
| Missing, expired, or wrong-user record | Return `404` |

The frontend must follow the server response and subsequent SSE. A successful button action means the decision is stored; actual execution begins only after an execution instance consumes it.

## Failure, retry, and continuation

Tools use `execution_config.max_retries`, for a total of one initial attempt plus that many retries. MCP `is_error`, Scheduler failure, missing files or targets, and other exceptions enter this loop.

After retries are exhausted, Runtime records a failed `ToolCallRecord`, emits `tool_call_error`, adds a structured failure observation, and lets the strategy decide whether to change arguments, use another tool, answer with limitations, or finish.

A normal tool error therefore does not necessarily terminate the Turn immediately. Even with `error_handling=stop`, the tool executor first returns an observable failure to AgenticLoop; do not interpret it as “the first tool error always stops execution.”

Global handling also declares `continue` and `fallback`. `fallback` returns `fallback_response` for an unhandled error before the loop completes. Continuation still depends on strategy, total timeout, maximum Steps, and tool-iteration limits.

Runtime examines the eight most recent tool records and blocks identical tool/argument calls. It reuses a recent successful observation or returns a repeated-failure observation to prevent unchanged retry loops.

## File parameters

Mechanism-model file arguments should use a relative path from the current Session workspace:

```json
{"input_file": "reports/input.csv"}
```

File-marked Schema adds a workspace-path hint. Runtime can also recognize common file parameter names and extensions. Before Scheduler execution it constrains resolution to the workspace, locates uploaded unique filenames, uploads bytes to Scheduler temporary storage, and replaces the argument with `_file_id`, filename, size, and SHA-256 metadata.

Do not let the model invent `_file_id` or absolute paths. A missing-file error includes available workspace paths so the model can list or inspect files before retrying.

This automatic upload applies primarily to mechanism models executed through Scheduler. Built-in tools access the workspace directly. MCP and external APIs follow their own file protocols and do not automatically receive local bytes.

## Audit records

Correlate three record types:

| Record | Contents |
| --- | --- |
| SSE events | pending, start, complete, error, and rejected transitions |
| Execution record | Tool ID/name, arguments, result, state, error, timestamps, and duration |
| Tool Message | Success summary, failure observation, rejection, or timeout shown to the model |

Use `session_id`, `execution_id`, `turn_id`, `step_id`, and `tool_call_id`; confirmation also adds `confirmation_id`, deciding user, state, and timestamps.

Never log passwords, API keys, authorization headers, complete Base64 files, or unnecessary sensitive results. Write/delete/payment/notification tools should also record the business object, authorized principal, and idempotency key in their owning system.

## Recommended policy

| Risk | Mode | Additional controls |
| --- | --- | --- |
| Read-only lookup and retrieval | `auto` | Project authorization, timeout, result-size limits |
| Workspace writes | Start with `manual` | Path isolation and file limits |
| Delete, release, payment, notification | `manual` | Business revalidation, idempotency, detailed audit |
| No external actions allowed | `none` | Disable unnecessary knowledge and file capabilities too |

Before release, test valid and invalid arguments, unauthorized resources, approval, rejection, timeout, duplicate decisions, tool timeout, retry exhaustion, repeated calls, and missing files.

## Troubleshooting

### A configured tool is not called

Verify mode is not `none`, the tool is enabled, its source loaded successfully, and dynamic selection included it. Then improve the description so the model knows when to use it.

### Arguments are consistently wrong

Align field names, types, `required`, `enum`, and examples. Do not use different names in descriptions and Schema; mark file fields explicitly.

### Approval succeeds but execution does not start

The decision may be stored but not yet consumed, or Session SSE may be disconnected. Trace `confirmation_id`, `execution_id`, and `tool_call_id` through confirmation state and later events.

### The Agent continues after tool failure

This is the observable-failure behavior: the error becomes a Tool Observation, and strategy may degrade or switch tools. Verify that the final answer discloses the failure.

### An identical tool call is no longer executed

Runtime blocks a recent identical call. Change arguments, file paths, or execution conditions instead of repeating it unchanged.

See [File workspace](./file-workspace.md) for upload, paths, and persistence; [Agent debugging and session execution](./debugging.md) for live presentation; [Tools, MCP, and Skills](../tutorial/tools-mcp-skills.md) for the capability relationship; and [Runtime contracts](../reference/contracts.md) for event coordinates.
