---
title: Frequently asked questions
description: Troubleshoot startup, routing, models, knowledge bases, and orchestration.
---

# Frequently asked questions

## Why is the frontend unavailable when a Python service is running?

The console calls the Java Gateway through the unified `/api/v1` boundary. A Python service port is useful for Swagger and health checks, but it does not replace Gateway, Nacos discovery, or frontend runtime configuration.

## Why is a knowledge base empty after upload?

Check document processing status, downloaded embedding models, vector dimensions, Milvus availability, `top_k`, and score threshold. GraphRAG additionally needs entity extraction and Neo4j writes.

## Should I choose VectorRAG or GraphRAG?

Start with VectorRAG for semantic paragraph matching. Consider GraphRAG for entities, relations, and cross-document structure. See [RAG integration patterns](../features/rag-patterns.md).

## Why was a tool not called?

Confirm that it is enabled, tool mode is not `none`, the description states when to call it, and its parameter schema is valid. Inspect `tool_call_start` events and verify model tool-call support.

## Why is a Kubernetes Pod Pending?

Check PVC and StorageClass first, then node capacity, image pull, and shared configuration. Do not apply the old and V2 manifests as two platforms in one namespace.

## How should I investigate a timeout?

Use the event timeline to separate LLM, tool, queue, and downstream latency. Increase the timeout only after ruling out loops, retry amplification, or an unavailable dependency.
