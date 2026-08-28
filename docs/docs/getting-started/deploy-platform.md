---
title: Kubernetes 部署
description: 从 kubernetes-all-in-one 目录选择当前清单，部署并验证完整平台。
---

# Kubernetes 部署

平台的 Kubernetes 部署入口是仓库中的整个目录：

```text
gagaduck-agents-platform-backend/
└─ docker-all-in-one/
   └─ kubernetes-all-in-one/
      ├─ gagaduck-agents-platform-v2.yaml
      ├─ gagaduck-agents-platform.yaml
      └─ nginx.yaml
```

当前 V2 主清单包含 13 个 Deployment、13 个 Service 和 6 个 PVC，覆盖 Gateway、前端、用户、项目、LLM、工具、知识库、智能体、编排、构建、算法调度和两个沙箱服务。

## 目录中的清单

| 文件 | 作用 | 使用方式 |
| --- | --- | --- |
| `gagaduck-agents-platform-v2.yaml` | 当前平台工作负载 | V2 部署主入口 |
| `gagaduck-agents-platform.yaml` | 较早的平台基线 | 仅在维护对应环境时使用 |
| `nginx.yaml` | Agent 反向代理 ConfigMap、Deployment 与 Service | 需要统一 Agent 代理入口时追加 |

`gagaduck-agents-platform.yaml` 与 V2 清单包含同名资源，不能在同一环境中当成两个独立平台重复安装。新环境从 V2 主清单开始。

## 1. 进入部署目录

```powershell
cd E:\gagaduck-agent-platform\gagaduck-agents-platform-backend\docker-all-in-one\kubernetes-all-in-one
kubectl config current-context
kubectl get nodes
```

主清单使用命名空间 `gagaduck-cloud`，并引用 `microservice-common-env`。应用清单前，确认当前集群已有对应命名空间、公共配置和平台依赖服务。

## 2. 检查工作负载配置

部署前逐项确认：

- 平台镜像地址与标签可以从集群节点拉取；
- Nacos、MongoDB、Milvus、Neo4j、Kafka 的服务名与端口匹配；
- PVC 能使用集群现有 StorageClass 绑定；
- Gateway 的 NodePort `36666` 与前端的 NodePort `36667` 可用；
- 健康检查、日志和 SkyWalking 配置与当前镜像一致。

可以先让 Kubernetes 解析清单而不创建资源：

```powershell
kubectl apply --dry-run=client -f .\gagaduck-agents-platform-v2.yaml
```

## 3. 应用当前平台清单

```powershell
kubectl apply -f .\gagaduck-agents-platform-v2.yaml
```

如果当前环境需要 Agent Nginx 代理，再执行：

```powershell
kubectl apply -f .\nginx.yaml
```

## 4. 观察启动顺序

```powershell
kubectl -n gagaduck-cloud get pods -o wide
kubectl -n gagaduck-cloud get deployments
kubectl -n gagaduck-cloud get services
kubectl -n gagaduck-cloud get pvc
```

推荐按以下顺序定位问题：

1. PVC 是否绑定；
2. 镜像是否成功拉取；
3. 公共配置是否加载；
4. 各服务能否连接基础设施；
5. Python/Java 服务是否注册到 Nacos；
6. Gateway 是否发现并路由业务服务；
7. 前端是否把 `/api/v1` 请求发送到 Gateway。

查看单个服务时使用：

```powershell
kubectl -n gagaduck-cloud describe pod <pod-name>
kubectl -n gagaduck-cloud logs deployment/<deployment-name> --tail=200
```

## 5. 访问平台

V2 清单默认暴露：

- Web 控制台：`http://<node-ip>:36667`
- API Gateway：`http://<node-ip>:36666`

如果部署了 `nginx.yaml`，同时检查 `gagaduck-agents-proxy` Service 的实际端口和访问方式。

## 6. 端到端验证

部署完成后依次验证：

1. Web 控制台可以加载；
2. 用户可以注册或登录；
3. 可以创建并切换项目；
4. LLM 连接测试成功；
5. 能创建一个最小智能体并完成调试；
6. 构建记录和运行日志可以查询。

完成后继续[创建首个项目](./first-project.md)。需要逐个调试后端服务时，使用[Python 本地启动](./python-local.md)。
