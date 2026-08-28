---
title: V2 implementation status
description: Read the documentation with a clear distinction between implemented behavior and extension design.
---

# V2 implementation status

This documentation targets **gagaduck-agents-platform V2** and follows the current repository structure.

## Implemented foundation

- React management console and Java Gateway
- Python/FastAPI domain services for projects, users, models, tools, knowledge, agents, orchestration, building, scheduling, and sandboxes
- Nacos-based discovery and configuration
- MongoDB-backed management data
- Milvus and Neo4j integration for knowledge processing
- Kafka-based asynchronous work paths
- Kubernetes all-in-one manifests for the platform workload

## How to interpret design pages

Architecture and best-practice pages explain both existing boundaries and the intended way to use them. When a behavior depends on environment configuration or an optional component, the page states that dependency instead of presenting it as universally enabled.

Use the service code, manifest, and current configuration as the final source of truth for ports, service names, and deployable resources. Update the corresponding reference page whenever those contracts change.
