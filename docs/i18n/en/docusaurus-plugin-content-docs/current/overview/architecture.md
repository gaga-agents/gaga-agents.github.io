---
title: Platform architecture
description: Understand the V2 layers, service boundaries, and request path.
---

# Platform architecture

![Platform architecture](/img/diagrams/platform-architecture.svg)

## Layered view

The React console provides project and resource management. Browser requests enter the Java Gateway, which exposes the unified `/api/v1` boundary and discovers backend services through Nacos. Python/FastAPI services implement users, projects, models, tools, knowledge bases, agents, orchestration, building, scheduling, and sandbox execution.

State is distributed by responsibility:

- **MongoDB** stores management and runtime records.
- **Milvus** supports vector retrieval for knowledge resources.
- **Neo4j** represents graph relationships used by knowledge processing.
- **Kafka** carries asynchronous scheduling and sandbox work.
- **Nacos** provides service discovery and shared configuration.
- **SkyWalking-compatible telemetry** supports distributed observation.

## Typical request path

1. A user performs an operation in the Web console.
2. The request reaches Gateway at the unified API boundary.
3. Gateway resolves the target microservice through Nacos.
4. The service reads its data and may call other capability services.
5. Long-running or isolated work is delegated through Kafka to schedulers or sandboxes.
6. Result state and logs return to the platform for inspection.

This boundary matters during local development: starting a Python microservice makes its own API available, but the complete Web workflow still requires Gateway routing.

See [Design advantages](./design-principles.md) for the execution boundaries, then review [Authentication and authorization](../operations/authentication-authorization.md) and [Runtime contracts](../reference/contracts.md) before integrating a client or service.
