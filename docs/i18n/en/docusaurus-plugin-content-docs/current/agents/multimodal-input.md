---
title: Multimodal Agent input
description: Configure a vision model, send text and images in debug sessions, and understand the path from workspace files to the model.
---

# Multimodal Agent input

Multimodal Agent input means sending text and images in one user message so a vision-capable model can understand screenshots, photographs, diagrams, or scanned pages. This page covers direct image input to an Agent.

See [File workspace](./file-workspace.md) for image upload, references, persistence, and cleanup.

## Prerequisites

Before testing, confirm that:

1. Model Management contains a model that actually supports vision input;
2. “Supports multimodal (Vision)” is enabled on that model resource;
3. the Agent selects that model and its configuration has been saved.

After changing the model resource, reload Agent Debug and confirm that the image button appears beside the composer.

## Send an image in Agent Debug

1. Open the Agent's Debug page and create or select a session.
2. Select the image button beside the composer.
3. Choose a local image. The frontend accepts files recognized as `image/*`, and each image must be smaller than 10 MB.
4. Repeat to add more images. Preview or remove them before sending.
5. Enter a task such as “Compare the differences between these screenshots.”
6. Send the message. The frontend uploads pending images to the current Session workspace before admitting the structured message.
7. Inspect the message timeline, model-call events, and final answer.

The frontend currently sets no explicit image-count limit. Providers commonly limit image count, request size, and vision tokens, so production deployments should add consistent server-side limits instead of relying only on the browser's 10 MB check.

## Message structure

Agent Debug does not persist Base64 image data in the conversation. After upload, `message_content` contains workspace references:

```json
{
  "input": "Explain this architecture diagram",
  "session_id": "<session-id>",
  "message_content": [
    {
      "type": "text",
      "text": "Explain this architecture diagram"
    },
    {
      "type": "image",
      "attachment": {
        "unique_filename": "architecture-a1b2c3d4.png",
        "filename": "architecture.png",
        "mime_type": "image/png",
        "file_size": 245760
      }
    }
  ]
}
```

## How the image reaches the model

```text
Select an image
  ↓ Browser checks image/* and < 10 MB per file
Upload to the current Session workspace
  ↓ Receive unique_filename, mime_type, and file_size
Persist type=image + attachment reference
  ↓ Assemble the current context
Runtime reads the workspace image
  ↓ Convert to an image_url Data URL
LLM Service
  ├─ OpenAI-compatible: preserve text/image content blocks
  └─ Ollama: split into content + images
```

This avoids writing large Base64 values into MongoDB messages, execution records, and event streams. Image bytes are read and encoded only for the provider call; persisted records retain file references.

The runtime constrains paths to the current Agent and Session workspace, rejects absolute or escaping paths, and confirms that the resolved MIME type is under `image/*`.

## Sessions, context, and memory

Image references enter the Session timeline as part of the user message. Whether a later turn sends the image again depends on memory selection and context budget:

- `full`, `sliding_window`, and `buffer` retain structured image blocks while the message remains selected;
- `summary` extracts only text when compacting old messages, so an old image is not included in the summary;
- `none` must not be expected to remember an image across turns;
- context budgeting currently estimates about 512 tokens per image, which is not the provider's final billing value;
- even when the message record remains, deleting the workspace file or losing storage access makes the runtime drop that image block.

For facts from an image that must survive a long conversation, have the Agent produce a textual conclusion and refer to that conclusion later. Do not rely on the old image remaining inside the active context window. See [Models, context, and memory](../tutorial/model-context-memory.md) for strategy details.

## Images and tool calls

A vision model can understand an image and then decide whether to call a tool. However, routing, planning, and some memory paths are text-only control paths: they extract `text` blocks and do not inspect image pixels directly.

Include an explicit instruction with every image, for example:

```text
Read the error shown in this screenshot and identify the likely cause. If needed, query the runtime logs with the logging tool.
```

An image-only message may still produce an answer, but tool selection and planning intent are less predictable without text.

## Troubleshooting

### The image button is missing

Check whether the Agent's model resource has `supports_vision` enabled and whether the saved Agent configuration has been reloaded. Agent Debug hides the image entry when the value is false.

### An old image stops working in later turns

Check whether the workspace file was deleted, whether the message fell outside the window or token budget.

### Image requests are slow or unexpectedly expensive

Reduce image count and resolution, send only relevant crops, and inspect the provider's Usage result. The platform's context estimate is not the provider's vision-token formula.

### The image button works, but the provider returns an error

`supports_vision` does not validate model capability. Check the model name, API compatibility, permitted MIME types, image limits, and Base64/Data URL support against the provider requirements.
