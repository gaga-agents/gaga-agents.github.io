---
title: 运行时契约
description: 记录配置式智能体、SSE 事件、工具确认和编排状态的稳定契约。
---

# 运行时契约

本页面向前端、Gateway 和服务集成开发者。字段以当前服务模型为准；新增字段应保持向后兼容，状态值变更必须同步更新调试页和文档。

## 配置式智能体

`ConfigAgent` 的核心配置包括：

```json
{
  "template": "react",
  "llm_config": {"model_id": "<llm-id>", "temperature": 0.7, "stream": true},
  "tool_config": {"mode": "auto", "max_iterations": 10},
  "memory_config": {"strategy": "sliding_window", "window_size": 10},
  "planning_config": {"strategy": "react", "max_steps": 10},
  "prompt_config": {"system_prompt": "...", "user_prompt_template": "{{input}}"},
  "execution_config": {"timeout": 300, "max_retries": 3, "error_handling": "stop"}
}
```

真实请求应使用平台中已注册的资源 ID；示例中的占位符不是可用凭据或地址。

## SSE 事件契约

客户端至少应处理 `turn_start`、`step_start`、`llm_call_start`、`llm_response`、`tool_call_start`、`tool_call_complete`、`step_complete`、`step_error`、`turn_end` 和执行终态事件。事件坐标以 `execution_id` + `turn_id` + `step_id` 关联，不要依赖文本内容猜测顺序。

## 工具确认契约

确认记录包含 `confirmation_id`、`execution_id`、`turn_id`、`step_id`、`tool_call_id`、`user_id` 和决策状态。用户重复提交相同决策应幂等返回；提交相反决策应返回冲突；超时后不能继续执行原调用。

## 编排状态

编排执行状态包括 `pending`、`running`、`waiting`、`resuming`、`paused`、`cancel_requested`、`success`、`failed` 和 `cancelled`。节点状态还会区分 `ready`、`skipped`，便于解释条件分支和并行 Join。

## 兼容原则

- 新事件字段应允许旧客户端忽略。
- 终态一旦写入，不再接受恢复或取消。
- 带副作用的重试必须由工具声明幂等策略。
- Gateway 对外暴露统一 API，服务内部地址不属于前端契约。
