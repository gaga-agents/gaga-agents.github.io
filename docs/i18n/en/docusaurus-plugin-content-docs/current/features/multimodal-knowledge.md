---
title: Multimodal knowledge design
description: Define the extension path from text retrieval to image and vision-backed knowledge.
---

# Multimodal knowledge design

The current Knowledge Base UI mainly uploads PDF, DOCX, DOC, TXT, and MD. The message protocol already accepts image blocks and agent LLM configuration includes `supports_vision`. This is an extension boundary, not a claim that image embedding is already enabled end to end.

```text
Image or PDF page
      ↓ visual reader: OCR, layout, charts, descriptions
Document: text + image_ref + metadata
      ↓ multimodal embedding
Milvus vectors + MongoDB metadata
      ↓
Vision-capable model reads evidence and answers
```

| Stage | Text knowledge | Multimodal knowledge |
| --- | --- | --- |
| Reader | Text extraction and chunking | OCR, layout, image references, tables |
| Embedding | Text vector | Shared image-text vector or separate indexes |
| Storage | Chunks and source | Page, region, image reference, permissions |
| Prompt | Text evidence | Text plus visual content blocks |
| Evaluation | Semantic recall and citations | Chart understanding and cross-modal recall |

Keep permissioned image references, source pages, and crop regions. Implement the reader and Document schema first, then validate embedding dimensions against the Milvus collection, and only then connect a vision-capable model.
