---
title: Service reference
description: Current V2 backend responsibilities and default local ports.
---

# Service reference

| Service | Default port | Responsibility |
| --- | ---: | --- |
| Algorithm Scheduler | 8000 | Model and asynchronous scheduling |
| Code Sandbox | 8001 | Isolated code execution workflow |
| Execution Sandbox | 8002 | Isolated task execution workflow |
| Project | 8100 | Project lifecycle and ownership |
| Tool Management | 8101 | Tool packages and capability metadata |
| LLM Management | 8102 | Model resources and connectivity |
| Agent Management | 8103 | Agent definitions and runtime APIs |
| User Management | 8104 | Users and authentication-related management |
| Builder | 8108 | Agent build workflow |
| Orchestration | 8110 | Multi-agent flow and task coordination |
| Knowledge Base | 8112 | Ingestion, retrieval, and knowledge relations |
| API Gateway | 36666 | Unified Web/API entry |
| Web console | 36667 in Kubernetes | Product user interface |

Local ports are defaults from the current repository and may be overridden by environment configuration. Service-to-service communication should use the configured Nacos service names rather than assuming localhost ports in a distributed environment.

See [Run services with Python](../getting-started/python-local.md) for health paths and development commands.
