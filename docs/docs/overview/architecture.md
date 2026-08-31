---
title: 平台架构
description: gagaduck-agents-platform 的分层架构、请求链路与关键基础设施。
---

# 平台架构

gagaduck-agents-platform 采用前后端分离和微服务架构。平台按职责分为应用接入、治理、核心执行、能力支撑、数据底座与运行管理六个区域。

![嘎嘎鸭智能体快速开发部署平台架构](/img/diagrams/platform-architecture.svg)

## 分层职责

| 层级 | 主要职责 | 关键对象 |
| --- | --- | --- |
| 应用接入层 | 对浏览器、API 客户端和第三方应用提供统一入口 | Web、API Gateway、认证鉴权 |
| 平台治理层 | 管理用户、项目、权限与构建交付 | 用户、项目、构建记录 |
| 核心执行层 | 配置、调试并运行单智能体和多智能体任务 | Agent、Runtime、Orchestration、Builder |
| 能力支撑层 | 提供模型、知识、Skills 与沙箱执行能力 | LLM、KB、Tools、Model、Sandbox |
| 数据底座层 | 保存配置、向量索引、图数据和任务消息 | MongoDB、Milvus、Neo4j、Kafka |
| 运行管理层 | 服务发现、动态配置、健康检查、日志和调用链 | Nacos、Kubernetes、ELK、SkyWalking |

## 一次请求如何流动

1. Web 或第三方客户端向 API Gateway 发起请求。
2. Gateway 完成统一路由与认证上下文传递，通过 Nacos 发现目标服务。
3. 智能体管理或编排服务加载项目内的配置、会话和依赖资源。
4. Runtime 调用 LLM，并按规划策略访问知识库、Skills 或沙箱。
5. 各步骤将状态、执行结果和日志写入对应数据与观测系统。
6. 响应回到客户端；调试页可以查看执行过程，而不仅是最终文本。

## 数据与执行边界

- **MongoDB** 保存业务配置、运行元数据和部分文件对象。
- **Milvus** 承担知识向量索引与相似度召回。
- **Neo4j** 保存实体关系，为 GraphRAG 等路径提供图数据。
- **Kafka** 解耦算法调度和沙箱等异步执行任务。
- **代码/执行沙箱** 隔离不可信或资源敏感的执行过程。

## 扩展原则

新增能力时优先通过明确的服务或 Skills 契约接入，并保持项目归属、超时、错误结构、执行记录和权限检查一致。直接在前端拼接内部服务地址会绕过网关和治理边界，不应作为正式集成方式。

这些边界在[平台设计亮点](./design-principles.md)中展开；对接前端或第三方服务时，请同时参考[身份认证与权限控制](../operations/authentication-authorization.md)和[运行时契约](../reference/contracts.md)。
