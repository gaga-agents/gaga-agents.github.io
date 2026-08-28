---
title: 准备运行环境
description: 部署 gagaduck-agents-platform 前需要确认的集群、存储、镜像与模型条件。
---

# 准备运行环境

本页用于平台部署者。如果你使用的是已经部署好的环境，可直接进入[创建首个项目](./first-project.md)。当前仓库提供两种开发路径：以 Kubernetes 运行完整平台，或用 Python 在本地逐个启动后端服务。

## 部署前检查

Kubernetes 清单集中在 `gagaduck-agents-platform-backend/docker-all-in-one/kubernetes-all-in-one/`。Python 服务各自拥有 `requirements.txt`、`run.py` 和配置类，默认面向 Python 3.12。

至少准备以下条件：

| 条件 | 用途 | 验证重点 |
| --- | --- | --- |
| Kubernetes 集群与 `kubectl` | 运行平台服务 | 当前上下文、节点可调度、Ingress/NodePort 策略 |
| 可访问的镜像仓库 | 存储平台镜像 | 集群节点可拉取，必要时配置 `imagePullSecrets` |
| Nacos | 服务发现和配置 | 地址、命名空间、鉴权与 Gateway 路由配置 |
| MongoDB | 业务数据和文件 | 账号、认证库、持久化和备份策略 |
| Milvus | 向量检索 | Collection 权限、索引资源与持久化 |
| Neo4j | 知识图谱 | Bolt 地址、账号和卷 |
| Kafka | 异步执行 | Broker 地址、Topic、消费组与网络连通性 |
| StorageClass/PV | 模型、工作区和日志 | ReadWriteOnce/ReadWriteMany 能力与容量 |
| LLM/API 凭据 | 智能体推理 | 端点、模型名、配额、网络和密钥管理 |

如果选择 Python 本地启动，还需要 Python 3.12、可创建虚拟环境的 PowerShell/终端，以及本机可访问的 Nacos 和 MongoDB；知识库、算法调度与沙箱服务还会分别使用 Milvus、Neo4j 和 Kafka。

## 建议的配置分层

- **ConfigMap**：非敏感的服务地址、端口、日志级别和功能开关。
- **Secret**：数据库密码、模型 API Key、令牌和镜像仓库凭据。
- **PVC**：知识模型缓存、知识库工作空间、智能体生成产物和沙箱工作目录。
- **Nacos 配置**：需要动态下发或被多个服务共享的路由与运行配置。

## 完成标准

继续部署前，确认所选运行方式的依赖均可访问。Kubernetes 路径需要镜像、命名空间、ConfigMap 和 PVC；Python 路径需要为每个服务准备独立虚拟环境与 `.env`。完整 Web 控制台还需要前端和 Java Gateway。
