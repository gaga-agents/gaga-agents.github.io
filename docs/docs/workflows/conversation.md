---
title: 对话工作流
description: 从会话创建到流式执行，理解一次智能体请求的完整链路。
---

# 对话工作流

平台的同步接口适合简单调用，流式 SSE 接口适合调试和长任务。两者使用相同的智能体配置和会话模型，差别主要在结果返回方式。

## 请求链路

```text
创建/恢复 Session
      ↓
提交 input + context + files
      ↓
AgentRunFactory 组装运行时
      ↓
Prompt → LLM → Tool/Knowledge → 下一步
      ↓
Execution / Timeline / Message 持久化
```

## SSE 事件

典型事件包括 `execution_start`、`step_start`、`llm_call_start`、`llm_response`、`tool_call_start`、`tool_call_complete`、`step_complete` 和 `execution_complete`；失败时会出现 `*_error` 事件。客户端应按 `execution_id` 和 `step_id` 聚合事件，而不是依赖事件到达次数。

## 同步与流式比较

| 模式 | 优点 | 代价 | 建议 |
| --- | --- | --- | --- |
| 同步 `/chat` | 调用简单，适合短任务 | 长任务期间无法逐步展示进度 | API 集成和冒烟测试 |
| SSE `/chat/stream` | 实时展示步骤、工具和耗时 | 客户端需要处理断线和事件重放 | 调试、长任务和控制台 |

## 断线处理

客户端应保存 `execution_id`，断线后查询执行历史和会话消息，而不是盲目重新提交请求。对有副作用的工具，重试前必须确认幂等性。
