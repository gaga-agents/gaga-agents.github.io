---
title: Deploy with Kubernetes
description: Select the current manifest from kubernetes-all-in-one, deploy V2, and verify the platform.
---

# Deploy with Kubernetes

The Kubernetes deployment entry is the following repository directory:

```text
gagaduck-agents-platform-backend/
└─ docker-all-in-one/
   └─ kubernetes-all-in-one/
      ├─ gagaduck-agents-platform-v2.yaml
      ├─ gagaduck-agents-platform.yaml
      └─ nginx.yaml
```

The current V2 manifest defines 13 Deployments, 13 Services, and 6 PVCs. It covers Gateway, the frontend, management services, orchestration, building, scheduling, and both sandboxes.

## Choose the correct manifest

| File | Role | When to use it |
| --- | --- | --- |
| `gagaduck-agents-platform-v2.yaml` | Current V2 workloads | Default for a new V2 environment |
| `gagaduck-agents-platform.yaml` | Earlier platform baseline | Only when maintaining that baseline |
| `nginx.yaml` | Optional agent reverse proxy | Apply after V2 when a unified agent proxy is required |

The two platform manifests contain resources with the same names. Do not install them as two independent platform instances in one namespace.

## 1. Select the cluster

```powershell
cd E:\gagaduck-agent-platform\gagaduck-agents-platform-backend\docker-all-in-one\kubernetes-all-in-one
kubectl config current-context
kubectl get nodes
```

The manifest uses namespace `gagaduck-cloud` and references `microservice-common-env`. Confirm that the namespace, shared configuration, storage, infrastructure endpoints, and image access are ready for this cluster.

## 2. Validate the manifest

Check image tags, Nacos/MongoDB/Milvus/Neo4j/Kafka addresses, StorageClass behavior, and the availability of NodePorts `36666` and `36667`.

```powershell
kubectl apply --dry-run=client -f .\gagaduck-agents-platform-v2.yaml
```

## 3. Deploy V2

```powershell
kubectl apply -f .\gagaduck-agents-platform-v2.yaml
```

Add the optional reverse proxy only when it is part of your topology:

```powershell
kubectl apply -f .\nginx.yaml
```

## 4. Observe startup

```powershell
kubectl -n gagaduck-cloud get pods -o wide
kubectl -n gagaduck-cloud get deployments
kubectl -n gagaduck-cloud get services
kubectl -n gagaduck-cloud get pvc
```

Diagnose in this order: PVC binding, image pull, common configuration, infrastructure connectivity, Nacos registration, Gateway discovery, and finally frontend-to-Gateway routing.

```powershell
kubectl -n gagaduck-cloud describe pod <pod-name>
kubectl -n gagaduck-cloud logs deployment/<deployment-name> --tail=200
```

## 5. Access and verify

- Web console: `http://<node-ip>:36667`
- API Gateway: `http://<node-ip>:36666`

Verify login, project creation, LLM connectivity, a minimal agent run, build history, and runtime logs before considering the deployment ready.
