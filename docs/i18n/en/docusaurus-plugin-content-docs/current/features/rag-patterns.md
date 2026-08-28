---
title: RAG integration patterns
description: Compare agent-controlled retrieval, fixed retrieval, VectorRAG, and GraphRAG.
---

# RAG integration patterns

RAG is a chain of reading, chunking, embedding, storage, retrieval, reranking, and answer constraints. The current Knowledge Base service provides VectorRAG and GraphRAG types; agent configuration can also expose retrieval as a tool for the Agentic Loop.

| Pattern | Description | Benefits | Trade-offs | Best for |
| --- | --- | --- | --- | --- |
| Agent-controlled | The agent decides whether to query and how to rewrite the query | Flexible, supports multi-hop work, avoids needless retrieval | Depends on tool use and query rewriting; variable cost | Open-ended questions |
| Fixed retrieval | Query at the start of every reply and inject results into the Prompt | Simple, predictable, lower model requirement | Queries every time; more latency and irrelevant context | FAQ and stable domains |
| VectorRAG | Retrieve text chunks by embedding similarity, optionally rerank | Direct semantic matching | Weaker for exact relations and cross-document reasoning | Manuals and policies |
| GraphRAG | Extract entities and relations, then search local/global graph context | Strong for relations and cross-document structure | Graph construction and extraction quality cost more | Topologies and domain graphs |

Start with a VectorRAG baseline, add GraphRAG for relationship-heavy questions, and give retrieval to the agent only when fixed retrieval cannot cover the task.

Evaluate recall, evidence relevance, citation correctness, retrieval latency, token increase, and irrelevant-query rate separately from answer fluency.
