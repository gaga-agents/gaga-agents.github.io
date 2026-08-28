---
title: Python 本地启动
description: 在 Windows 或 Linux 上为后端微服务创建独立环境、配置依赖并运行 run.py。
---

# Python 本地启动

平台的大多数业务后端是 Python 3.12 + FastAPI 服务，每个可运行服务目录都提供 `requirements.txt` 和 `run.py`。本地启动适合单服务开发、接口联调和问题定位；完整 Web 控制台仍需启动 React 前端和 Java Gateway。

## Python 服务与默认端口

| 服务 | 默认端口 | 主要依赖 |
| --- | ---: | --- |
| `gagaduck-algo-scheduler-service` | 8000 | MongoDB、Kafka、Nacos |
| `gagaduck-code-sandbox-service` | 8001 | MongoDB、Kafka、Nacos |
| `gagaduck-exec-sandbox-service` | 8002 | MongoDB、Kafka、Nacos |
| `gagaduck-agents-project-service` | 8100 | MongoDB、Nacos |
| `gagaduck-tool-management-service` | 8101 | MongoDB、Nacos |
| `gagaduck-llm-management-service` | 8102 | MongoDB、Nacos |
| `gagaduck-agents-management-service` | 8103 | MongoDB、Nacos、其他能力服务 |
| `gagaduck-agents-user-management-service` | 8104 | MongoDB、Nacos |
| `gagaduck-agents-builder-service` | 8108 | MongoDB、Nacos、构建系统 |
| `gagaduck-agents-orchestration-service` | 8110 | MongoDB、Nacos、Agent 服务 |
| `gagaduck-knowledgebase-management-service` | 8112 | MongoDB、Milvus、Neo4j、Nacos |

端口来自各服务当前 `app/config.py` 或 `run.py`，可以通过 `.env` 覆盖。

## 1. 选择一个服务

初次验证建议从依赖较少的 LLM、工具、项目或用户服务开始。下面以 LLM 管理服务为例：

```powershell
cd E:\gagaduck-agent-platform\gagaduck-agents-platform-backend\gagaduck-llm-management-service
```

## 2. 创建独立虚拟环境

Windows PowerShell：

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r .\requirements.txt
```

Linux/macOS：

```bash
python3.12 -m venv .venv
./.venv/bin/python -m pip install --upgrade pip
./.venv/bin/python -m pip install -r requirements.txt
```

每个微服务使用自己的 `.venv`，可以避免知识处理、沙箱和普通管理服务之间的依赖版本互相影响。

## 3. 准备 `.env`

存在 `.env.example` 时复制为 `.env`：

```powershell
Copy-Item .\.env.example .\.env
```

根据本机环境修改服务端口、MongoDB、Nacos 以及该服务需要的其他依赖地址。配置类使用 Pydantic Settings 读取 `.env`，字段名不区分大小写。

不同服务需要关注的扩展项：

- 知识库服务：Milvus、Neo4j、模型缓存与工作空间；
- 算法调度和沙箱：Kafka Broker、Topic、执行工作目录；
- Builder：Agent/LLM/Tool/Project/Orchestration 服务名及构建系统地址；
- Agent 与编排服务：被调用服务在 Nacos 中的服务名。

## 4. 启动服务

Windows：

```powershell
.\.venv\Scripts\python.exe .\run.py
```

Linux/macOS：

```bash
./.venv/bin/python run.py
```

看到监听地址和服务注册日志后，保持终端运行。FastAPI 服务默认支持自动生成的接口页，通常可以访问：

```text
http://localhost:<port>/docs
```

## 5. 验证健康接口

各服务健康路径不完全相同。常用路径如下：

| 服务 | 健康检查 |
| --- | --- |
| User、Builder、Orchestration、Knowledge Base、Code/Exec Sandbox | `/health` |
| Project | `/api/v1/projects/health` |
| Tool | `/api/v1/packages/health` |
| LLM | `/api/v1/llms/health` |
| Agent Management | `/api/v1/agents/health` |
| Algorithm Scheduler | `/api/v1/models/health` |

例如：

```powershell
Invoke-RestMethod http://localhost:8102/api/v1/llms/health
```

## 6. 多服务联调顺序

建议使用多个终端依次启动：

1. Project、User、LLM、Tool；
2. Agent Management；
3. Orchestration；
4. Algorithm Scheduler、Code Sandbox、Exec Sandbox；
5. Knowledge Base；
6. Builder。

顺序不是硬性启动依赖，但先启动被调用服务可以减少 Nacos 发现失败和重试日志。

## 7. 启动前端

```powershell
cd E:\gagaduck-agent-platform\gagaduck-agents-platform-frontend
npm install
npm start
```

前端通过统一的 `/api/v1` 路径访问 Gateway，默认 Gateway 地址为 `http://localhost:36666`。只启动某个 Python 服务时，可以直接使用该服务的 Swagger 页面联调；需要完整页面功能时，再启动 Java Gateway 并确保 Nacos 路由可用。

## 常见问题

### 服务启动后立即退出

从异常堆栈的第一处连接错误开始检查，通常是 `.env` 路径、MongoDB/Nacos 地址或依赖未安装。

### 服务能启动但无法被其他服务发现

对比 `NACOS_SERVER_ADDR`、命名空间、Group 和 `NACOS_SERVICE_NAME`，并确认调用方使用的服务名与注册名一致。

### Swagger 可用但前端请求失败

先确认 Gateway 运行在 `36666`，再检查 Gateway 路由、前端运行时配置与浏览器 Network 请求。Python 业务端口不应直接替代 Gateway 地址。

