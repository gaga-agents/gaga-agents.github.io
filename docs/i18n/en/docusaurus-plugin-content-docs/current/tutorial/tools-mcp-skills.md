---
title: Tools, MCP, and Skills
description: Distinguish built-in tools, reusable tool packages, external Skills, and protocol adapters.
---

# Tools, MCP, and Skills

The platform exposes built-in workspace tools, reusable packages managed by Tool Management, and external Skills. MCP is a way to connect an external capability; it is not the same thing as the business capability itself.

| Type | Best for | Configuration | Key concern |
| --- | --- | --- | --- |
| Built-in tools | Files, text, PDF, spreadsheets, workspace | `enable_builtin_tools` | Restrict file scope |
| Individual tool | One precise operation | `individual_tools` | Stable parameter schema |
| Tool library | Related tools reused together | `tool_libraries` | Avoid exposing unrelated tools |
| External Skill | Cross-project higher-level capability | `external_skills` | Pin a version snapshot |
| MCP adapter | Connecting an MCP server | Protocol or gateway layer | Validate permissions and timeouts |

Every tool needs a name, description, input schema, success result, and failure categories. High-impact operations should require confirmation; the backend emits confirmation events for the console.

Test a tool directly, then test agent selection, then test negative selection with several tools enabled. Add one capability at a time.
