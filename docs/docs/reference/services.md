---
title: 服务目录
description: gagaduck-agents-platform 当前后端服务目录、职责与部署入口。
---

# 服务目录

本页按当前仓库后端目录整理。端口可以由环境变量和 Kubernetes 配置覆盖，因此职责和服务名称比开发默认端口更稳定。

| 服务目录 | 职责 |
| --- | --- |
| `gagaduck-agents-gateway-service` | API 网关、统一入口、认证上下文与动态路由 |
| `gagaduck-agents-user-management-service` | 注册、登录、令牌、用户与管理员操作 |
| `gagaduck-agents-project-service` | 项目、成员与项目权限 |
| `gagaduck-agents-management-service` | 智能体配置、会话、消息、执行、上下文与记忆 |
| `gagaduck-agents-orchestration-service` | 流程模型、编译、调度、执行、审批与恢复 |
| `gagaduck-agents-builder-service` | 单智能体/编排构建、部署、历史与日志 |
| `gagaduck-agents-optimization-service` | 智能体优化相关能力 |
| `gagaduck-agents-workflow-service` | 工作流相关服务边界 |
| `gagaduck-llm-management-service` | LLM 提供方、模型连接测试与调用 |
| `gagaduck-knowledgebase-management-service` | 文档处理、向量检索、知识图谱与 RAG |
| `gagaduck-tool-management-service` | 工具包、工具版本、导入导出与外部 Skills |
| `gagaduck-code-sandbox-service` | 多语言代码执行隔离 |
| `gagaduck-exec-sandbox-service` | 命令、文件和工作区执行隔离 |
| `gagaduck-algo-scheduler-service` | 模型/算法资源、异步执行与文件调度 |
| `web-search-plugin` | Web 搜索扩展 |

## 本地默认端口

| 服务 | 默认端口 |
| --- | ---: |
| 算法调度 | 8000 |
| 代码沙箱 | 8001 |
| 执行沙箱 | 8002 |
| 项目服务 | 8100 |
| 工具管理 | 8101 |
| LLM 管理 | 8102 |
| 智能体管理 | 8103 |
| 用户管理 | 8104 |
| Builder | 8108 |
| 编排服务 | 8110 |
| 知识库 | 8112 |
| API Gateway | 36666 |
| Kubernetes Web 控制台 | 36667 |

端口来自当前仓库的本地配置和 V2 Kubernetes 清单；可以通过环境变量或部署配置覆盖。

## 默认对外入口

仓库 V2 Kubernetes 清单将 Gateway 暴露为 NodePort `36666`，前端暴露为 NodePort `36667`。内部业务服务应通过 Gateway 或服务发现访问，不应全部暴露到公网。

## API 约定

前端当前以 `/api/v1` 为统一 API 前缀，并由 Gateway 路由到后端服务。多数 FastAPI 服务在启用文档端点时可提供 OpenAPI/Swagger UI；实际地址取决于服务配置和网络策略。

## 维护原则

- 新增服务时同步更新架构、部署清单和本页。
- 路由和 Schema 应从服务代码或 OpenAPI 生成/校验，避免手写副本漂移。
- 端口、数据库地址和凭据属于部署配置，不应作为跨版本稳定契约。
- 服务间调用应携带项目、用户、任务和追踪上下文。
