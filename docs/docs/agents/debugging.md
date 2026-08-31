---
title: 智能体调试与会话执行
description: 使用 Session、消息队列、执行中插话、取消、SSE 事件和执行轨迹调试配置式智能体。
---

# 智能体调试与会话执行

智能体调试页用于在真实 Session 中验证 Prompt、模型、记忆、知识库、工具、文件和多模态输入。一次调试不只有最终回答，页面还会展示执行步骤、模型输出、工具调用、错误和运行状态。

## 调试前提

开始前确认：

1. 智能体已经保存，并配置了可用的模型；
2. 当前用户至少具有智能体所属项目的查看权限；
3. 模型、知识库、工具、Skill 和 MCP 等依赖可从运行环境访问；
4. 需要文件或图片时，当前 Session 的工作区存储可写；
5. 需要手动确认工具时，工具模式和确认策略已经配置。

建议先用一个明确、可验证的短问题完成最小执行，再逐步加入知识、工具、图片和长对话，便于定位问题属于哪一层。

## Session 是什么

Session 是连续对话和运行状态的边界，关联：

- 一个配置式智能体；
- 创建该会话的用户；
- 用户、助手和工具消息；
- 多轮执行记录与 Token 统计；
- 待处理消息队列；
- 当前 Session 的文件工作区；
- 记忆策略产生的会话状态。

同一个 Session 中的后续消息可以读取被记忆策略选入上下文的历史内容。不同 Session 的消息、排队输入和工作区文件不会自动合并。

## 创建与切换 Session

进入智能体调试页后，可以直接输入第一条消息。若当前没有会话，前端会先创建 Session，再打开该 Session 的事件流并提交消息。

也可以通过会话历史完成以下操作：

- **创建**：开始一个独立的对话上下文；
- **切换/继续**：选择历史 Session，加载规范化时间线、运行态和工作区文件，然后继续发送消息；
- **删除**：删除单个 Session；
- **批量删除**：选择多个 Session 后统一删除；
- **搜索和分页**：按名称筛选并分批加载会话。

切换会话时，页面会关闭上一条 Session 事件流并订阅新的 Session。切换不会把上一段对话复制到新会话。

删除 Session 属于数据删除操作。执行前应确认其中的消息、执行记录和文件是否仍需要保留；业务上重要的结果应先导出或写入正式数据源。

## 一条消息如何执行

Agent Debug 当前采用“Session 级事件流 + Inbox 入队”的方式：

```text
打开 Session
  ↓ GET /config-sessions/{session_id}/events
收到 runtime_snapshot
  ↓
提交消息到 /config-agents/{agent_id}/chat/admit
  ↓ 写入 MongoDB Inbox
消息进入 queue 或 steer
  ↓ 执行实例领取
Turn / Step / LLM / Tool 事件持续写入 Session SSE
  ↓
前端合并事件并更新同一条时间线
```

消息提交成功只表示已经进入 Inbox，不表示模型已经回答。服务端返回 `item_id` 后，页面根据 SSE 中的领取、步骤和终态事件更新该消息。

请求中的 `client_message_id` 用于重试幂等。同一个 Session 内重复提交相同 ID 时，后端返回已有消息，避免网络重试产生两条相同输入。

## 普通排队 `queue`

`queue` 表示“下一轮处理”。当 Session 空闲时，消息会被领取并开始新的 Turn；当已有 Turn 正在运行时，新消息保存在待处理队列中，等待当前 Turn 结束后按顺序执行。

适合使用 `queue` 的场景：

- 连续提交多个相互独立的问题；
- 希望当前任务完整结束后再开始下一个任务；
- 不希望新输入改变当前推理过程。

页面会显示待处理消息数量和文本预览。仍处于 `queued` 状态的消息可以删除；被执行实例领取后便不能再从队列删除。

取消当前执行不会自动删除普通排队消息。当前 Turn 进入取消终态后，队列中的下一条输入仍可以继续被处理。

## 执行中插话 `steer`

`steer` 表示“在当前执行的下一个安全 Step 边界加入引导”。它适合补充约束、纠正方向或追加当前任务需要的信息，例如：

```text
不要继续查询外部接口，改用当前工作区中的 report.csv。
```

插话流程为：

1. 当前 Session 已有 active Turn；
2. 用户点击插话按钮发送消息，或把一条普通排队消息提升为插话；
3. 消息绑定当前 `execution_id` 和 `turn_id`，位置标记为 `next-step`；
4. Runtime 在 Step 边界消费消息，并把它加入当前 Turn 的后续上下文；
5. SSE 事件把插话消息和后续步骤关联到同一 Turn。

如果发送 `steer` 时已经没有 active Turn，后端会把新提交的消息归类为普通 `queue`；将已有排队消息提升为插话时若没有 active Turn，则返回冲突。插话不是立即中断正在进行的单次模型或工具网络调用，它在可控边界生效。

## 取消、暂停与恢复

当前配置式智能体调试页支持**取消当前 active Turn**：

- 点击取消后，后端写入持久化 `cancel` 命令；
- 若执行位于当前进程，会同时尝试快速取消；
- 即使快速路径失败，AgenticLoop 仍会在安全边界读取命令；
- 最终通过 `execution_cancelled` 或相关终态事件更新页面；
- 已排队的普通消息继续保留。

重复取消或在没有 active Turn 时取消不会创建新的执行，接口会返回当前没有正在执行的 Turn。

:::note 当前不支持暂停与恢复

配置式智能体的 Session API 和 Agent Debug 当前没有 `pause`、`resume` 操作。需要临时改变当前任务时使用 `steer`；需要终止时使用取消。编排运行中的 `paused`、`resuming` 状态不等于单智能体调试页已经提供暂停/恢复能力。
:::

## SSE 如何驱动页面

前端为当前 Session 打开一个长连接：

```http
GET /api/v1/agents/config-sessions/{session_id}/events
Accept: text/event-stream
```

建立连接后，服务端先发送 `runtime_snapshot`，其中包含当前 active Turn 和 Inbox 队列。随后持续发送规范事件；空闲约 15 秒时发送注释心跳，避免中间代理误判连接空闲。

主要事件分组如下：

| 阶段 | 主要事件 | 页面行为 |
| --- | --- | --- |
| Session 同步 | `runtime_snapshot` | 恢复 active 执行和队列视图 |
| 消息入队与领取 | `message_queued`、`message_claimed` | 更新排队状态并把消息放入时间线 |
| Turn | `turn_start`、`turn_closing`、`turn_end` | 创建和结束一轮对话 |
| Step | `step_start`、`step_complete`、`step_error` | 展示步骤名称、类型、状态和错误 |
| 模型 | `llm_call_start`、流式增量、`llm_response` | 逐步显示模型输出 |
| 工具 | `tool_call_start`、`tool_call_complete`、`tool_call_error` | 展示工具名称、参数、结果和状态 |
| 工具确认 | `tool_call_pending_confirmation`、确认拒绝事件 | 显示批准或拒绝操作 |
| 执行终态 | `execution_complete`、`execution_error`、`execution_interrupted`、`execution_cancelled` | 收敛回答、错误和最终状态 |

事件通过 `execution_id`、`turn_id`、`step_id`、`tool_call_id` 和 `timeline_seq` 关联。客户端不应依赖事件到达顺序或文本内容猜测归属；网络抖动、流式刷新和跨实例执行可能使局部事件交错。

当前前端不会自动重连 Session SSE。连接失败或中断时，重新打开或切换该 Session，前端会重新加载服务端时间线与运行态；不要仅凭页面上最后一个动画状态判断后端是否仍在执行。

## 工具调用如何展示

工具调用会附着在对应 Turn 和 Step 下，页面展示：

- 工具名称与 `tool_call_id`；
- 模型生成的参数；
- `running`、`completed`、`failed`、等待确认或拒绝状态；
- 工具返回结果或错误；
- 与该工具调用关联的 Step。

手动确认模式下，工具先进入 `pending_confirmation`。用户批准后继续执行，拒绝后生成拒绝事件并跳过调用。提交确认时应使用事件中的 `confirmation_id`，而不是工具名称推测待确认记录。

调试工具问题时按以下顺序检查：模型是否选择了预期工具、参数是否符合 Schema、是否等待人工确认、执行器是否返回成功，以及最终回答是否正确使用了工具结果。

## 查看 Step、Token、错误和终态

### Step

每个 Step 由 `step_id` 标识，可能代表规划、模型生成、工具执行、反思或其他策略阶段。页面按 Turn 将 Step 合并到助手过程区，显示运行、完成或失败状态。一个 Turn 可以包含多个 Step 和多次工具调用。

### Token 与耗时

执行记录汇总 `prompt_tokens`、`completion_tokens`、`total_tokens`、`duration_ms`，以及模型调用次数、步骤和完成原因等运行数据。会话历史可以展示累计 Token，执行详情用于定位单次请求。

供应商没有返回 Usage 时，部分值可能为 `0`；图片 Token 的平台预算估算也不等于供应商最终计费。

### 错误

优先寻找最早出现的失败事件，而不是只看最终错误文本：

1. `step_error`：某个执行步骤失败；
2. `tool_call_error`：工具本身失败；
3. `execution_error`：执行无法继续；
4. `execution_interrupted`：执行被插话切换或其他控制边界打断；
5. `execution_cancelled`：用户取消。

记录 `session_id`、`execution_id`、`turn_id` 和 `step_id` 后，再对照 Agent Management、LLM、Tool、Knowledge 和 Scheduler 服务日志排查。

### 最终状态

一次执行应收敛到完成、失败、中断或取消等终态。`turn_end` 表示当前 Turn 已结束；`execution_complete` 携带完整执行报告。前端会把最终回答、步骤、工具状态和错误合并到同一条助手消息中。

## Session 与 Stateless 执行

| 维度 | Session 执行 | Stateless 执行 |
| --- | --- | --- |
| `session_id` | 必填并指向已有 Session | 不传 |
| 历史消息 | 按记忆策略加载 | 固定为空 |
| 跨请求记忆 | 可以 | 不可以 |
| 消息队列 | 支持 `queue` | 不支持 |
| 执行中插话 | 支持 `steer` | 不支持 |
| SSE | Session 快照和连续事件 | 单次请求自己的 SSE |
| 工作区 | Session 持久工作区 | 单次临时工作区 |
| 取消 | 可以按 Session 控制 active Turn | 没有 Session 控制接口 |
| 适合场景 | 多轮调试、文件任务、交互控制 | 单次 API 调用、健康验证、无状态集成 |

Stateless 请求即使选择 `summary` 或 `hierarchical_file` 等记忆策略，也以 `session_transcript=[]`、`session_id=None` 执行，不能获得跨请求记忆。需要连续对话时必须显式创建并复用 Session。

## 推荐调试流程

1. 新建 Session，用纯文本验证模型连通和 Prompt。
2. 检查 Turn、Step、流式输出和 Token 是否正常。
3. 加入一个工具，检查选择、参数、确认和结果。
4. 再接入知识库、Skill、MCP、文件或图片。
5. 在 active Turn 中分别测试普通排队、插话和取消。
6. 切换出去再返回该 Session，确认时间线和队列能从服务端恢复。
7. 保存失败输入及其 `execution_id`，修改一个变量后复测。
8. 使用同一组样例完成回归，再进入[智能体构建](../delivery/agent-build.md)。

## 常见问题

### 消息一直显示排队

检查 Session 是否已有长时间运行的 active Turn、是否有等待确认的工具，以及事件流是否仍连接。Runtime 快照可以区分“后端仍在排队”和“前端没有收到更新”。

### 插话变成了下一轮消息

提交时当前 Turn 已经结束，因此后端把它归类为 `queue`。只有存在 active 执行时，新的 `steer` 才会绑定当前 Turn。

### 取消后下一条消息又开始执行

这是当前语义：取消只终止 active Turn，不清空普通队列。若不希望继续执行，应在消息被领取前从队列逐条删除。

### 页面停止更新，但后端仍在运行

可能是 Session SSE 已断开。重新进入 Session，加载时间线和 `runtime_snapshot`，再根据 `execution_id` 查看服务端状态。

### 最终回答正常，但中间出现失败 Step

部分策略允许工具失败后重试或降级。检查 `step_error` 后是否有新的成功 Step，并结合执行配置判断这是预期恢复还是被掩盖的问题。

文件上传、引用与存储见[文件工作区](./file-workspace.md)；工具模式、确认状态和文件参数详见[工具调用与安全确认](./tool-calls-confirmation.md)；事件字段和状态约定见[运行时契约](../reference/contracts.md)；记忆行为见[运行时与记忆](./runtime-memory.md)；图片调试见[智能体多模态输入](./multimodal-input.md)；系统化回归方法见[评测、追踪与回归](../features/evaluation-tracing.md)。
