---
title: MCP Server
description: 注册 MCP Server、发现工具、绑定智能体，并理解平台运行时与单体交付的调用边界。
---

# MCP Server

MCP（Model Context Protocol）让智能体通过统一协议发现和调用外部工具。平台将 MCP Server 作为项目级能力资源管理：连接信息和鉴权配置保存在工具管理服务中，智能体只保存 Server 引用和运行策略，不直接保存连接凭据。

## 当前支持范围

| 能力 | 平台运行时 | 单体 Agent |
| --- | --- | --- |
| Streamable HTTP | 支持，管理页面默认方式 | 支持，构建后由 Agent 直连 |
| 工具发现 | 支持分页发现并缓存工具清单 | 启动或运行时从固化配置直连发现 |
| 自定义 Headers | 支持 | 支持，构建时固化到资源清单 |
| 项目权限 | Viewer 可查看和运行，Editor 可维护 | 构建后由交付环境负责访问控制 |

## 接入前提

接入前确认：

- 已选择正确项目，并至少拥有 Editor 权限；
- MCP Server 可从工具管理服务所在网络访问；
- Server 支持 `tools/list` 和 `tools/call`；
- 已准备 URL，以及必要的鉴权 Header；
- 工具名称、描述和 Input Schema 足够清晰，模型能够判断何时调用。

完成后应得到以下结果：MCP Server 状态为 `connected`，页面能够查看已发现工具，智能体调试轨迹中能够看到对应 MCP 工具调用。

## 注册并发现工具

1. 进入当前项目的 **Skills 工具包**。
2. 切换到 **MCP Servers** 页签，选择 **添加 MCP Server**。
3. 填写标识名、显示名称、说明和 Server URL。
4. 如需鉴权，在 **请求 Headers JSON** 中填写 JSON 对象。
5. 保存后选择 **测试/刷新**。
6. 状态变为 `connected` 后，打开 **工具** 抽屉检查工具名称和说明。

一个典型的 Header 配置如下。不要把真实凭据写入文档、Prompt 或代码仓库。

```json
{
  "Authorization": "Bearer <token>",
  "X-Organization-Id": "<organization-id>"
}
```

Server 刚创建时状态为 `unknown`。**测试/刷新**会建立连接，读取 Server 信息、协议版本、Capabilities 和完整工具清单，并将发现结果缓存。修改连接配置后，状态会重新变为 `unknown`，需要再次测试。

## 绑定智能体

1. 打开一个配置式智能体并进入 **工具配置**。
2. 确认工具模式不是“禁用”。
3. 在 **MCP Servers** 区域选择 **添加 MCP Server**。
4. 从当前项目已经注册的 Server 中选择一个并保存智能体。
5. 根据依赖强度决定是否开启 **连接失败时中止 Agent 执行**。
6. 在调试页使用一个明确需要该能力的问题验证调用。

当前管理页面绑定 Server 时默认加载它提供的全部工具。配置模型中的 `tools` 字段为空也表示加载全部工具；通过 API 或构建配置填入工具名称列表时，可以只开放指定工具。

```json
{
  "tool_config": {
    "mode": "auto",
    "mcp_servers": [
      {
        "server_id": "<mcp-server-id>",
        "server_identifier": "business_data",
        "server_name": "业务数据 MCP",
        "tools": [],
        "required": false
      }
    ]
  }
}
```

字段含义：

| 字段 | 说明 |
| --- | --- |
| `server_id` | 工具管理服务中的 MCP Server ID |
| `server_identifier` | 稳定标识名，用于生成模型可见的内部函数别名 |
| `server_name` | 展示名称 |
| `tools` | 允许的远端工具名；空数组表示全部 |
| `required` | 加载 Server 工具失败时，是否中止本次 Agent 执行 |

## 运行时调用链路

```text
用户消息
  → Agent Management 读取智能体的 mcp_servers
  → Tool Management 返回已发现的工具清单
  → 能力源选择器判断当前任务是否需要该 Server
  → 远端工具转换为模型可调用的函数定义
  → 模型选择工具并生成参数
  → Agent Management 将调用路由到 Tool Management
  → Tool Management 连接 MCP Server 并执行 tools/call
  → MCP 结果规范化为工具观察，返回 Agentic Loop
```

为了避免不同 Server 的同名工具冲突，平台会生成稳定的内部调用别名，形如：

```text
mcp_<server_identifier>_<tool_name>_<hash>
```

调试页面会尽量将该内部名称还原为“Server / Tool”的可读名称。工具结果优先使用 MCP `structuredContent`；没有结构化内容时，纯文本块会合并到平台通用的 `output_data`，原始 `content` 仍会保留。

当智能体配置了 MCP Server 时，运行时会先进行能力源选择。没有被选中的 Server 不会把全部工具描述塞入本轮模型上下文，从而减少无关工具干扰。

## 权限与凭据

- MCP Server 属于项目资源；Viewer 可以查看、发现和调用，Editor 可以创建、修改、刷新和删除。
- 单体构建会把 MCP URL、Headers 和工具清单写入构建资源，生成仓库和镜像应按敏感产物管理。
- 对写入、删除、支付或外发消息类工具，应在 MCP Server 和平台两侧共同实施最小权限、幂等和审计。

## 平台运行与单体交付

平台运行时通过 Tool Management 代理 MCP 调用，项目权限、发现缓存和连接配置都在平台内统一管理。

单体 Agent 构建时只接受 Streamable HTTP Server。Builder 会取得直连 URL、Headers 和工具配置，写入构建产物；部署后的 Agent 直接连接 MCP Server，不再回调平台 Tool Management。构建环境因此必须能够读取配置，运行环境必须能够访问远端 Server。

## 常见问题

### 状态一直是 `unknown`

新建或修改配置后尚未执行工具发现。选择 **测试/刷新**；如果失败，检查 URL、网络、证书和鉴权 Header。

### 状态为 `connected`，但没有工具

确认 Server 实现并开放 `tools/list`，且返回的工具具有非空 `name`。刷新发现缓存后再次查看工具抽屉。

### 调试时没有调用 MCP

检查智能体是否保存了该 Server、工具模式是否启用、问题是否明确需要该能力，以及 Server 和工具描述是否足以让能力源选择器与模型正确判断。

### 修改 Server 后仍看到旧工具

工具清单使用发现缓存。回到 MCP 管理页执行 **测试/刷新**，再重新运行智能体。

### 返回 403

检查当前用户是否属于 Server 所在项目，以及操作需要 Viewer、Editor 还是平台管理员权限。stdio 配置只能由平台管理员完成。
