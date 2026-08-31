---
title: Messages, context, and multimodal input
description: Understand message blocks, context variables, tool results, and the current multimodal boundary.
---

# Messages, context, and multimodal input

The message model accepts a plain string or structured content blocks. The backend currently recognizes `text`, `image`, `image_url`, `input_image`, `document`, `tool_use`, and `tool_result`.

```json
{
  "role": "user",
  "content": [
    {"type": "text", "text": "Summarize this image"},
    {"type": "image_url", "image_url": {"url": "https://example.invalid/image.png"}}
  ]
}
```

The URL above only documents the field shape. A caller must provide an authorized, reachable file reference.

## Context variables

Prompt configuration supports templates such as `{{input}}` and `{{context}}`. Put stable business rules in the system prompt and request-specific data in the user prompt or context. Do not hard-code changing user data into the system prompt.

## Tool messages

A tool execution usually contains user message → assistant `tool_use` → tool `tool_result` → final assistant answer. Inspect the name, arguments, result, and final answer together.

## Current boundary

The message model is ready for image and document blocks, but the Knowledge Base upload page currently accepts PDF, DOCX, DOC, TXT, and MD and primarily processes text, vector retrieval, and graph retrieval. A production multimodal knowledge base still needs a visual reader, multimodal embedding, storage, and a vision-capable model. See [Multimodal knowledge design](../features/multimodal-knowledge.md).

To send screenshots, photographs, or diagrams directly to an Agent in a debug session, see [Multimodal Agent input](../agents/multimodal-input.md) for configuration, upload flow, memory behavior, and troubleshooting.
