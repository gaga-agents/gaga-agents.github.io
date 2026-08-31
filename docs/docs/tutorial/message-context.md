---
title: 消息、上下文与多模态输入
description: 了解平台消息结构、上下文变量、工具结果和当前多模态边界。
---

# 消息、上下文与多模态输入

平台消息的 `content` 既兼容纯字符串，也兼容结构化内容块。后端当前识别的内容类型包括 `text`、`image`、`image_url`、`input_image`、`document`、`tool_use` 和 `tool_result`。

## 消息最小结构

```json
{
  "role": "user",
  "content": [
    {"type": "text", "text": "请总结这张图片"},
    {"type": "image_url", "image_url": {"url": "https://example.invalid/image.png"}}
  ]
}
```

示例中的 URL 只是字段格式说明，不代表平台会替你托管图片。实际使用时应由调用方提供可访问的地址或经过授权的文件引用。

## 上下文变量

Prompt 配置支持 `{{input}}`、`{{context}}` 等模板变量。建议把稳定的业务约束放在 system prompt，把本次请求和短期数据放在 user prompt 或 context 中；不要把会变化的用户数据硬编码进 system prompt。

## 工具消息

一次带工具的执行通常包含：用户消息 → 助手 `tool_use` → 工具 `tool_result` → 助手最终答复。调试时应同时检查工具名称、参数、结果和最终答复，避免只凭最终文本判断工具是否执行正确。

## 当前边界

后端消息模型已经为图片和文档内容块保留兼容结构，但知识库上传页面当前主要接收 PDF、DOCX、DOC、TXT、MD，知识库处理器以文本抽取、向量检索和图谱检索为主。要做真正的图片向量化或视觉问答，还需要配置支持视觉输入的模型，并接入相应的解析、Embedding 与存储链路；见[多模态知识库设计](../features/multimodal-knowledge.md)。

如果目标是在调试会话中直接向智能体发送截图、照片或图表，请参阅[智能体多模态输入](../agents/multimodal-input.md)，其中包含配置、上传、执行链路、记忆行为和排障说明。
