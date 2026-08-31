---
title: MCP Servers
description: Register MCP servers, discover tools, bind them to agents, and understand platform and standalone runtime boundaries.
---

# MCP Servers

MCP (Model Context Protocol) lets agents discover and invoke external tools through a common protocol. The platform manages MCP servers as project-scoped resources: Tool Management owns connection and authentication settings, while an agent stores only the server reference and runtime policy.

## Supported scope

| Capability | Platform runtime | Standalone agent |
| --- | --- | --- |
| Streamable HTTP | Supported and exposed in the console | Supported through direct connection |
| Tool discovery | Paginated discovery with a cached catalog | Direct discovery from build-time configuration |
| Custom headers | Supported | Supported and embedded at build time |
| Project permissions | Viewers can inspect and run; editors can manage | The delivery environment owns access control |

## Prerequisites

Before connecting a server, verify that:

- you selected the correct project and have at least Editor access;
- Tool Management can reach the server over the network;
- the server implements `tools/list` and `tools/call`;
- you have the URL and any required authentication headers;
- tool names, descriptions, and input schemas clearly explain when each tool should be used.

A successful integration ends with a `connected` server, a visible discovered-tool catalog, and MCP calls in the agent debug trace.

## Register and discover tools

1. Open **Skills & Tool Packages** in the current project.
2. Select the **MCP Servers** tab and choose **Add MCP Server**.
3. Enter an identifier, display name, description, and server URL.
4. Add authentication under **Request Headers JSON** when required.
5. Save the server, then choose **Test/Refresh**.
6. When the status becomes `connected`, open **Tools** and inspect the discovered names and descriptions.

The following is a typical header configuration. Never place real credentials in documentation, prompts, or source repositories.

```json
{
  "Authorization": "Bearer <token>",
  "X-Organization-Id": "<organization-id>"
}
```

A newly created server has the `unknown` status. **Test/Refresh** connects to the server, reads server metadata, capabilities, protocol version, and all tools, then caches the discovery result. Editing connection settings resets the status to `unknown` and requires another test.

## Bind a server to an agent

1. Open a configuration-based agent and go to **Tool Configuration**.
2. Make sure tool mode is not disabled.
3. Under **MCP Servers**, choose **Add MCP Server**.
4. Select a server registered in the current project and save the agent.
5. Decide whether **Stop agent execution when connection fails** should be enabled.
6. Use a task that clearly needs the server in the debug console.

The console currently binds all tools exposed by a server. In the configuration contract, an empty `tools` array also means all tools; API and build configurations may provide remote tool names to expose only a subset.

```json
{
  "tool_config": {
    "mode": "auto",
    "mcp_servers": [
      {
        "server_id": "<mcp-server-id>",
        "server_identifier": "business_data",
        "server_name": "Business Data MCP",
        "tools": [],
        "required": false
      }
    ]
  }
}
```

Field meanings:

| Field | Meaning |
| --- | --- |
| `server_id` | MCP server ID in Tool Management |
| `server_identifier` | Stable identifier used in model-facing function aliases |
| `server_name` | Display name |
| `tools` | Allowed remote tool names; empty means all |
| `required` | Whether tool-catalog loading failure stops the agent run |

## Runtime flow

```text
User message
  → Agent Management reads mcp_servers
  → Tool Management returns discovered tools
  → capability selection chooses relevant servers
  → remote tools become model-callable function definitions
  → the model selects a function and arguments
  → Agent Management routes the call through Tool Management
  → Tool Management invokes tools/call on the MCP server
  → normalized MCP output returns to the Agentic Loop
```

The platform avoids collisions between tools with the same remote name by generating a stable internal alias:

```text
mcp_<server_identifier>_<tool_name>_<hash>
```

The debug console maps this alias back to a readable “Server / Tool” label when possible. Results prefer MCP `structuredContent`; otherwise text blocks are combined into the platform `output_data`, while the original `content` remains available.

When an agent has MCP servers, capability-source selection runs before tool definitions are added to the model context. Servers irrelevant to the current request can be omitted, reducing tool noise.

## Permissions and credentials

- MCP servers are project resources. Viewers can inspect, discover, and invoke; editors can create, update, refresh, and delete.
- Standalone builds embed the MCP URL, headers, and tool catalog. Treat generated repositories and images as sensitive build artifacts.
- For tools that write, delete, pay, or send external messages, enforce least privilege, idempotency, confirmation, and auditing on both sides.

## Platform versus standalone delivery

In platform mode, Tool Management proxies MCP calls and centrally enforces project access, discovery caching, and connection configuration.

Standalone builds accept Streamable HTTP servers only. Builder copies the direct URL, headers, and tool configuration into the build artifact; the deployed agent calls the MCP server directly and no longer depends on platform Tool Management. The build environment must be allowed to read runtime configuration, and the final deployment must be able to reach the server.

## Common issues

### Status remains `unknown`

Discovery has not run since the server was created or edited. Choose **Test/Refresh** and inspect the URL, network path, certificates, and authentication headers if it fails.

### Connected, but no tools are shown

Confirm that the server implements `tools/list` and returns non-empty tool names. Refresh discovery and inspect the Tools drawer again.

### The agent does not call MCP

Verify that the server was saved on the agent, tool mode is enabled, the task clearly needs the capability, and the server and tool descriptions give the selector enough information.

### The agent still sees an old tool catalog

Discovery is cached. Return to MCP management, choose **Test/Refresh**, and run the agent again.

### The API returns 403

Check whether the current user belongs to the project that owns the server and whether the operation requires Viewer, Editor, or platform-administrator access. stdio configuration is restricted to platform administrators.
