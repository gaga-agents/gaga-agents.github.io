---
title: Knowledge-agent practice
description: Build a retrieval-backed agent whose answers can be traced to evidence.
---

# Knowledge-agent practice

Begin with a narrow question domain and a curated source set. Validate document parsing and retrieval before evaluating the final answer.

## Recommended sequence

1. Define which questions the source set should answer.
2. Ingest a small representative collection.
3. Inspect segmentation and metadata.
4. Test retrieval with known-answer questions.
5. Attach the knowledge base to a minimal agent.
6. Require the agent to distinguish evidence from inference.
7. Add unanswered and adversarial cases to the evaluation set.

When an answer is unsupported, inspect the retrieved units first. Prompt changes cannot repair content that was never indexed or retrieved. Keep source revisions and index updates aligned so that operators know which corpus produced an answer.
