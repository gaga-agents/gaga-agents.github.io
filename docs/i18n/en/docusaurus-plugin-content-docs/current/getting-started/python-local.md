---
title: Run services with Python
description: Create isolated environments, configure dependencies, and start FastAPI services from run.py.
---

# Run services with Python

Most business backends are Python 3.12 and FastAPI services. Each runnable service provides `requirements.txt` and `run.py`. This workflow is intended for service development and API debugging; the complete Web console also requires the React frontend and Java Gateway.

## Services and default ports

| Service directory | Port | Main dependencies |
| --- | ---: | --- |
| `gagaduck-algo-scheduler-service` | 8000 | MongoDB, Kafka, Nacos |
| `gagaduck-code-sandbox-service` | 8001 | MongoDB, Kafka, Nacos |
| `gagaduck-exec-sandbox-service` | 8002 | MongoDB, Kafka, Nacos |
| `gagaduck-agents-project-service` | 8100 | MongoDB, Nacos |
| `gagaduck-tool-management-service` | 8101 | MongoDB, Nacos |
| `gagaduck-llm-management-service` | 8102 | MongoDB, Nacos |
| `gagaduck-agents-management-service` | 8103 | MongoDB, Nacos, capability services |
| `gagaduck-agents-user-management-service` | 8104 | MongoDB, Nacos |
| `gagaduck-agents-builder-service` | 8108 | MongoDB, Nacos, build system |
| `gagaduck-agents-orchestration-service` | 8110 | MongoDB, Nacos, agent service |
| `gagaduck-knowledgebase-management-service` | 8112 | MongoDB, Milvus, Neo4j, Nacos |

Ports come from the current `app/config.py` or `run.py` files and can be overridden through `.env`.

## 1. Create an isolated environment

This example starts the LLM management service.

```powershell
cd E:\gagaduck-agent-platform\gagaduck-agents-platform-backend\gagaduck-llm-management-service
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r .\requirements.txt
```

Linux or macOS:

```bash
python3.12 -m venv .venv
./.venv/bin/python -m pip install --upgrade pip
./.venv/bin/python -m pip install -r requirements.txt
```

Use one `.venv` per service to avoid version conflicts between knowledge processing, sandboxes, and regular management APIs.

## 2. Configure the service

If the directory contains `.env.example`, copy it to `.env` and update the port, MongoDB, Nacos, and service-specific dependency addresses.

```powershell
Copy-Item .\.env.example .\.env
```

Knowledge Base additionally requires Milvus and Neo4j. Scheduler and sandbox services require Kafka. Builder, Agent, and Orchestration depend on the registered names of other services.

## 3. Start and inspect

```powershell
.\.venv\Scripts\python.exe .\run.py
```

On Linux or macOS:

```bash
./.venv/bin/python run.py
```

Open `http://localhost:<port>/docs` for the FastAPI interface. Health paths are not identical across services:

| Service | Health path |
| --- | --- |
| User, Builder, Orchestration, Knowledge Base, Code/Exec Sandbox | `/health` |
| Project | `/api/v1/projects/health` |
| Tool | `/api/v1/packages/health` |
| LLM | `/api/v1/llms/health` |
| Agent Management | `/api/v1/agents/health` |
| Algorithm Scheduler | `/api/v1/models/health` |

```powershell
Invoke-RestMethod http://localhost:8102/api/v1/llms/health
```

## 4. Start a development group

Use separate terminals and start foundational services first: Project, User, LLM, and Tool; then Agent Management and Orchestration; then schedulers, sandboxes, Knowledge Base, and Builder.

To use the full console, start the frontend and make sure Gateway is reachable at its configured address (repository default `http://localhost:36666`). A direct Python service port is suitable for Swagger debugging, but it does not replace Gateway routing.
