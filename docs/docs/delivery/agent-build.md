---
title: 智能体构建
description: 了解 Builder 如何冻结智能体配置、生成独立仓库、构建镜像并部署微服务或单体 Agent。
---

# 智能体构建

智能体构建模块将平台内的配置式智能体生成可部署的 Docker 镜像。

本页讨论配置式智能体的 Builder。多智能体编排使用独立的编排构建模型与接口，不应与本页的单智能体构建记录混用。

## 构建对象

构建配置引用一个源智能体 `agent_id`，并记录其所属 `project_id`。触发构建时，Builder 重新读取源智能体的当前配置，包括：

- Prompt、模型参数与视觉能力标记；
- 工具、内置工具、Skill 和 MCP 配置；
- 知识库引用；
- 记忆、规划和执行策略；
- 构建名称、版本、运行模式、服务端口和目标 Docker 节点。

构建时取得的配置形成该次产物的快照。源智能体后续发生变化时，已有产物不会自动更新；平台会把相关构建标记为 `stale`，需要重新触发构建才能生成新版本。

:::warning 构建产物可能包含敏感配置

生成仓库、构建日志和镜像可能包含模型连接配置、MCP 请求头、外部 Skill 资产或其他运行资源。它们必须按敏感交付物管理，不应使用公开仓库，也不要在日志和版本说明中输出 Token、API Key 或完整认证 Header。
:::

## 两种运行模式

| 维度 | Microservice | Standalone |
| --- | --- | --- |
| 枚举值 | `microservice` | `standalone` |
| LLM | 通过平台 LLM Service 调用 | 由生成服务直接调用 Provider |
| 工具与机理模型 | 依赖平台 Tool、Scheduler、Sandbox 等服务 | 将选中资源写入本地清单并使用本地执行器 |
| 服务发现 | 通过 Nacos 发现平台服务 | 默认可脱离平台能力服务运行；Nacos 注册可选 |
| 项目身份 | 构建时签发部署令牌，用于访问绑定项目资源 | 不使用微服务部署令牌访问平台资源 |
| 适合场景 | 依赖平台治理和共享资源的在线 Agent | 需要自包含交付或隔离部署的 Agent |

两种模式共享同一套会话协议、文件工作区、HTTP/SSE API 和 React 前端。模式目录只覆盖远程客户端、本地客户端、根配置与部署差异。因此，记忆、图片输入、工具确认和会话控制等公共能力应在两个构建模式中保持一致。

Standalone 并不表示“完全没有外部依赖”。生成服务仍需要自己的 MongoDB、模型 Provider 和运行存储；MCP Server、外部 API 或知识能力是否需要网络访问，取决于被固化的配置。

## 完整构建流程

```text
创建 Build 配置
  ↓ draft
触发构建并创建 BuildHistory
  ↓ building
读取源 Agent 与依赖资源
  ↓
生成完整后端、前端和配置文件
  ↓
创建或复用 GitLab 仓库并提交代码
  ↓
Jenkins 构建多阶段 Docker 镜像并部署
  ↓
持续写入构建日志和 Git/Jenkins 元数据
  ↓ deployed / build_failed
```

当前主构建链路由 Jenkins 自动部署，成功后构建直接进入 `deployed`，而不是停留在 `build_success`。服务同时保留手动部署接口，以兼容已成功构建或已停止的产物。

构建任务在 Builder 后台执行，触发接口立即返回 `build_id`、`build_number` 和 `history_id`。调用方应轮询构建详情或历史记录查看最终状态，不要把“触发成功”理解为“镜像已经可用”。

## 创建构建配置

创建时主要填写：

| 字段 | 作用 |
| --- | --- |
| `project_id` | 构建所属项目 |
| `agent_id` | 源配置式智能体 |
| `build_name` | 用户可读名称；系统追加 8 位 UUID 保证唯一 |
| `run_mode` | `microservice` 或 `standalone` |
| `service_port` | 服务端口；不填写时从配置范围自动分配 |
| `docker_image_tag` | 镜像标签 |
| `docker_cloud` | Jenkins 部署的目标 Docker 节点 |
| `env_variables` | 运行环境变量 |

系统还会生成 `service_name` 和镜像名称。构建配置与构建历史是两个对象：前者描述当前交付目标，后者记录每次触发的编号、版本、日志、提交哈希、Jenkins 信息、耗时和失败原因。

## 代码生成方式

Builder 先复制共享模板，再叠加运行模式模板：

```text
common-agent
├─ agent_runtime/      # AgentRun、AgenticLoop、记忆、模型与工具运行时
├─ api/                # Chat、SSE、Session、文件和控制接口
├─ repository/         # MongoDB 持久化
├─ services/           # 应用服务与运行协调
└─ agent-frontend/     # React 会话、调试、工作区和 A2A 页面

        + micro-agent/ 或 single-agent/
        ↓
完整生成仓库
```

每次重新生成前都会清理该构建名称对应的临时输出目录，避免上一版本已删除的文件残留。生成完成后，Builder 把代码提交到 GitLab；Jenkins 构建结束后，本地临时目录会被清理，Git 提交和镜像成为可追踪产物。

前端也属于构建产物。多阶段 Dockerfile 先构建 `agent-frontend`，再把静态资源与 FastAPI 服务放入最终镜像；生成服务通过自己的端口同时提供 API 和前端页面。

## Standalone 的资源固化

Standalone 会生成 `resources/registry.json`，其中保存构建所需的本地资源清单：

- 选中的工具包和工具 Schema；
- 机理模型定义、代码、API 配置、二进制和依赖；
- 外部 Skill 及其 ZIP 资产；
- MCP Server 地址、请求头和工具配置。

本地工具和机理模型运行时不再回调平台 Tool Service、Scheduler 或 Sandbox。不同语言或资源类型由生成镜像中的本地执行器处理。MCP 工具仍按清单中的地址访问外部 MCP Server，因此“固化配置”不等于“离线复制第三方服务”。

模型 Provider 的地址、模型名称和凭据由构建时运行配置与部署环境共同提供。生产部署应使用环境变量或 Secret 覆盖敏感值，并确保生成仓库和镜像的访问权限受控。

## Microservice 的部署身份

Microservice 构建开始时，Builder 会签发以 `gda_pkg_` 开头的部署令牌，并把它注入生成服务。数据库只保存令牌摘要，令牌绑定 `deployment_id`、构建、源 Agent 和项目。

生成 Agent 调用平台项目资源时携带该令牌。项目服务通过 Builder 内省令牌，并只允许访问令牌绑定的 `project_id`。构建失败时本次令牌会撤销；停止服务或删除构建时，也会撤销相应令牌。详细身份边界见[身份认证与权限控制](../operations/authentication-authorization.md)。

## 构建状态与同步状态

构建生命周期状态包括：

| 状态 | 含义 |
| --- | --- |
| `draft` | 已创建配置，尚未触发 |
| `building` | 正在生成代码、提交仓库或运行 Jenkins |
| `build_success` | 镜像已成功构建，可进入部署；当前自动链路通常直接越过该停留状态 |
| `build_failed` | 代码生成、GitLab、Jenkins 或镜像阶段失败 |
| `deploying` | 正在部署 |
| `deployed` | 服务已部署 |
| `deploy_failed` | 镜像已构建但部署失败 |
| `stopped` | 已停止运行 |

`sync_status` 与运行状态不同：

- `synced`：构建对应的源配置未被标记变更；
- `stale`：源 Agent 已修改，当前产物仍可运行，但已不是最新配置；
- `broken`：构建与源资源的关联已经不可继续使用。

`stale` 不会自动重建或替换线上容器。应先检查源配置变化，创建新的构建历史，完成验证后再切换流量。

## 构建前检查

触发前至少确认：

1. 源智能体已经保存，并在平台调试页通过代表性会话；
2. Prompt、模型、记忆、工具、Skill、MCP 与知识库配置均为预期版本；
3. 目标模式与外部依赖相符，特别是 Standalone 是否真的具备所需的本地资源；
4. Docker 节点端口可用，GitLab 和 Jenkins 健康且 Builder 凭据有效；
5. 模型、MCP 和外部 API 从目标运行网络可访问；
6. MongoDB、工作区目录和其他状态存储已规划持久化；
7. 环境变量中没有把生产 Secret 写入普通日志或公开源码。

## 部署后验证

构建状态变成 `deployed` 后依次验证：

1. `service_url` 和 `frontend_url` 可访问；
2. 健康检查、MongoDB 和必要的 Nacos 注册正常；
3. 可以创建 Session，并完成一次文本对话；
4. 文件上传、工作区读写和 SSE 流式事件正常；
5. 模型、工具、Skill、MCP 和知识库调用符合构建模式。

生成服务的工作区默认位于容器内目录。若部署需要保留会话文件，应挂载持久卷；多副本部署还需要共享工作区或保证上传和执行落到同一存储，否则数据库中的文件引用可能存在而实际图片或附件不可读。

## 停止、重新构建与删除

- **停止**：触发 Jenkins undeploy，将状态更新为 `stopped`，并撤销构建使用的部署令牌；
- **重新构建**：再次读取源智能体当前配置，生成新提交和镜像，并新增一条 BuildHistory；
- **删除**：先尽力停止已部署服务，然后删除构建配置和历史，同时撤销该构建的全部部署令牌；
- **回滚**：选择已验证的 Git 提交、镜像标签和依赖组合重新部署，而不是编辑原构建记录假装恢复旧行为。

删除构建记录不等于自动清理所有外部 Git 仓库、镜像、卷和第三方资源。生产运维需要为这些产物制定独立的保留与清理策略。

## 构建失败排查

| 阶段 | 常见问题 | 优先检查 |
| --- | --- | --- |
| 读取配置 | Agent 不存在或服务不可达 | `agent_id`、服务发现、项目权限 |
| 资源收集 | 工具、模型、Skill 或 MCP 引用失效 | 构建日志中的第一个资源错误、`sync_status` |
| 代码生成 | 模板缺失或配置无法序列化 | Builder 模板、Jinja 渲染异常、临时目录权限 |
| GitLab | 仓库创建或提交失败 | GitLab 地址、Token、项目权限和网络 |
| Jenkins | 健康检查或 Job 失败 | Jenkins Job、凭据、构建 URL 和控制台日志 |
| Docker | 依赖安装、前端编译或镜像构建失败 | Dockerfile 阶段、依赖源、磁盘与网络 |
| 部署 | 端口冲突或容器无法启动 | Docker 节点、端口、环境变量、MongoDB 和健康日志 |
| 运行验证 | 模型或工具调用失败 | 构建模式、Provider/Nacos、部署令牌和目标网络 |

排障时从 BuildHistory 的第一条失败日志开始，同时记录 `build_number`、Git Commit、Jenkins Build URL 和镜像标签。不要只根据最终的 `build_failed` 状态猜测原因。

整体发布、验证与回滚原则见[构建、发布与回滚](./build-deploy.md)。
