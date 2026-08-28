---
title: Knowledge base
description: Build, retrieve, and govern private knowledge used by agents.
---

# Knowledge base

![Knowledge enhancement](/img/diagrams/knowledge-enhancement.svg)

A knowledge base turns external documents and structured relationships into a reusable retrieval resource. In V2, knowledge processing can combine MongoDB metadata, Milvus vector search, and Neo4j graph relations.

## Processing pipeline

1. Create a knowledge resource with a clear domain and ownership.
2. Ingest source content and inspect parsing results.
3. Split content into retrievable units and generate embeddings.
4. Store vectors and relevant relations.
5. Test retrieval with representative questions.
6. Attach the knowledge base to an agent and evaluate grounded answers.

## Quality controls

Retrieval quality depends on source quality, segmentation, metadata, embedding selection, query formulation, and result limits. Evaluate the retrieved evidence separately from the final answer; otherwise a fluent answer can hide weak retrieval.

Track source updates and re-index affected content deliberately. When a knowledge response is wrong, determine whether the source is missing, parsing failed, the relevant chunk was not retrieved, or the agent ignored the evidence.

See [RAG integration patterns](../features/rag-patterns.md) for the decision matrix and [Multimodal knowledge design](../features/multimodal-knowledge.md) before adding images, charts, or vision-based answers.
