---
title: Prepare the environment
description: Choose a deployment mode and prepare the required tools and infrastructure.
---

# Prepare the environment

Choose the workflow that matches your goal before installing dependencies.

| Goal | Recommended workflow |
| --- | --- |
| Deploy and test the complete platform | Kubernetes V2 manifest |
| Develop or debug one backend service | Python local startup |
| Modify the management console | Frontend development server plus a reachable Gateway |

## Kubernetes workflow

Prepare a cluster and a configured `kubectl` client. The current manifests expect the `gagaduck-cloud` namespace, shared configuration named `microservice-common-env`, pullable platform images, persistent storage, and reachable infrastructure services.

The deployment entry is:

```text
gagaduck-agents-platform-backend/docker-all-in-one/kubernetes-all-in-one/
```

Do not apply every YAML file in that directory as one bundle. The base manifest and V2 manifest contain overlapping resource names; use the V2 file for a new V2 environment.

## Python workflow

Install Python 3.12 and create an independent virtual environment inside each service directory. Depending on the service, you also need MongoDB, Nacos, Kafka, Milvus, or Neo4j. Start with a management service that has fewer dependencies before moving to the knowledge and sandbox services.

## Frontend workflow

Install a current Node.js LTS release and npm. The console uses the Gateway endpoint rather than replacing it with an arbitrary Python service port. The repository default is `http://localhost:36666` for Gateway.

Continue with [Kubernetes deployment](./deploy-platform.md) or [Python local startup](./python-local.md).
