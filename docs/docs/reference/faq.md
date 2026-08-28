---
title: 常见问题
description: 解决启动、路由、模型、知识库和编排中最常见的问题。
---

# 常见问题

## 为什么 Python 服务启动了，前端仍然不可用？

前端默认通过 Java Gateway 的统一 `/api/v1` 入口访问服务。单独启动 Python 服务只能验证该服务自己的 Swagger 和健康接口，还需要 Gateway、Nacos 与前端运行时配置正确才能完成页面操作。

## 为什么知识库上传成功但检索为空？

检查文档处理状态、Embedding 模型是否已下载、向量维度是否一致、Milvus 是否可用，以及查询的 `top_k` 和阈值。GraphRAG 还要检查实体抽取和 Neo4j 写入。

## VectorRAG 和 GraphRAG 怎么选？

段落语义匹配先选 VectorRAG；实体关系、跨文档结构和社区摘要再考虑 GraphRAG。参见[RAG 集成方式比较](../features/rag-patterns.md)。

## 工具为什么没有被调用？

确认工具已启用、模式不是 `none`、描述清楚了调用条件、参数 Schema 可生成，并检查执行事件中是否出现 `tool_call_start`。如果模型不支持工具调用，应改用固定流程或更换模型。

## Kubernetes Pod 一直 Pending 怎么办？

先检查 PVC 和 StorageClass，再检查节点资源、镜像拉取和 ConfigMap。不要同时应用旧版与 V2 清单，因为它们包含重名资源。

## 如何处理执行超时？

沿事件时间线区分 LLM、工具、队列和下游服务耗时。调大 `timeout` 之前先确认是否存在死循环、重试放大或外部服务未返回。
