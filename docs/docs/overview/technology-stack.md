---
title: 技术栈与工程边界
description: 平台当前代码所采用的前端、后端、数据、运行与观测技术。
---

# 技术栈与工程边界

平台同时包含 Python、Java 与 React 服务。具体版本以各服务的依赖文件、容器镜像和构建配置为准，PPT 中的技术栈用于解释总体方向。

![平台技术栈](/img/diagrams/technology-stack.svg)

## 主要技术

| 区域 | 技术 | 用途 |
| --- | --- | --- |
| 前端 | React、Ant Design、React Flow | 管理控制台、智能体配置与流程画布 |
| Python 服务 | Python 3.12、FastAPI、Pydantic、asyncio/httpx | 智能体、知识、工具、算法与沙箱服务 |
| Java 服务 | Java 17、Spring Boot、Spring Cloud | 网关及部分治理服务 |
| 业务数据 | MongoDB | 配置、元数据、会话和文件记录 |
| 检索与图谱 | Milvus、Neo4j | 向量检索与图关系查询 |
| 消息系统 | Kafka | 异步任务和执行结果传递 |
| 服务治理 | Nacos | 服务注册、发现与动态配置 |
| 运行环境 | Docker/containerd、Kubernetes | 镜像构建、编排、健康检查和扩缩容 |
| 可观测性 | ELK、Prometheus、SkyWalking | 日志、指标与调用链 |

## 为什么采用微服务

知识处理、沙箱执行和智能体运行的资源特征明显不同。拆分服务可以独立扩缩容、隔离失败并按能力演进；代价是必须认真处理服务发现、配置、调用超时、日志关联和版本兼容。平台架构已经选择了这一工程取舍，部署时不能把它当作一个无外部依赖的单体应用。
