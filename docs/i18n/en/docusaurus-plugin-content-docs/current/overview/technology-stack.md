---
title: Technology stack
description: The principal implementation and infrastructure technologies used by V2.
---

# Technology stack

![Technology stack](/img/diagrams/technology-stack.svg)

| Layer | Current technology | Responsibility |
| --- | --- | --- |
| Web console | React, Ant Design | Resource, agent, build, and operations interfaces |
| API entry | Java Gateway | Unified routing and service discovery |
| Business services | Python 3.12, FastAPI | Domain APIs and agent workflows |
| Discovery and configuration | Nacos | Service names and shared runtime configuration |
| Primary data | MongoDB | Projects, resources, agent definitions, and task records |
| Retrieval | Milvus, Neo4j | Vector search and graph relations |
| Asynchronous execution | Kafka | Scheduler and sandbox work queues |
| Runtime isolation | Code and execution sandboxes | Controlled code/tool execution |
| Deployment | Docker, Kubernetes | Images, workloads, services, and storage |

The repository is organized as independently deployable services. Consult [Service reference](../reference/services.md) before changing ports or service names, because Gateway routes and service-to-service calls depend on those contracts.
