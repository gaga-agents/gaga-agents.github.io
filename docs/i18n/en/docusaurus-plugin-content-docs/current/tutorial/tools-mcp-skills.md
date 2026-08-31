---
title: Tools, MCP, and Skills
description: Distinguish built-in tools, reusable tool packages, external Skills, and protocol adapters.
---

# Tools, MCP, and Skills

This page explains how the capability types relate. For selection, arguments, approval, retry, and auditing at runtime, see [Tool calls and safety confirmation](../agents/tool-calls-confirmation.md).

The platform exposes built-in workspace tools, reusable packages managed by Tool Management, and external Skills. MCP is a way to connect an external capability; it is not the same thing as the business capability itself.

| Type | Best for | Configuration | Key concern |
| --- | --- | --- | --- |
| Built-in tools | Files, text, PDF, spreadsheets, workspace | `enable_builtin_tools` | Restrict file scope |
| Individual tool | One precise operation | `individual_tools` | Stable parameter schema |
| Tool library | Related tools reused together | `tool_libraries` | Avoid exposing unrelated tools |
| External Skill | Cross-project higher-level capability | `external_skills` | Pin a version snapshot |
| MCP server | Connecting an external MCP tool service | **Skills & Tool Packages → MCP Servers** | Validate permissions, timeouts, and result shapes |

The platform provides MCP server registration, tool discovery, agent binding, and runtime invocation. See [MCP Servers](../resources/mcp.md) for the complete workflow, configuration contract, and troubleshooting guide.

Every tool needs a name, description, input schema, success result, and failure categories. High-impact operations should require confirmation; the backend emits confirmation events for the console.

Test a tool directly, then test agent selection, then test negative selection with several tools enabled. Add one capability at a time.
