---
title: Choices and trade-offs
description: Compare local development, Kubernetes, single-agent, and multi-agent workflows.
---

# Choices and trade-offs

Choose an implementation path by observability, dependency complexity, and recovery behavior—not by feature count alone.

| Deployment | Benefit | Cost | Recommendation |
| --- | --- | --- | --- |
| One Python service locally | Fast startup and Swagger debugging | Does not represent full Gateway routing | Develop one service |
| Several services locally | Fast contract feedback | Many dependencies and ports | Backend integration |
| Kubernetes V2 | Delivery-like discovery, storage, and topology | Requires images, PVCs, Nacos, and infrastructure | Integration and deployment |

| Agent shape | Best for | Main risk |
| --- | --- | --- |
| Single agent + tools | Short, clear responsibilities | Too many tools reduce selection stability |
| Plan and execute | Multi-step goals needing decomposition | Plan becomes stale |
| Multi-agent orchestration | Specialist roles and parallel work | Handoffs, joins, retries, and cost |

Build a single-agent regression baseline first. Add tools, knowledge, and orchestration incrementally, retaining evidence from the previous version.
