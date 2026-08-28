---
title: Model resources
description: Register and validate model endpoints before assigning them to agents.
---

# Model resources

An LLM resource describes how the platform reaches a model and how an agent may use it. Central registration separates connection settings from agent behavior and allows several agents to reuse a tested endpoint.

## Registration workflow

1. Choose the provider or compatible API type.
2. Enter the endpoint, model identifier, and required connection fields.
3. Set default generation parameters such as temperature and token limits.
4. Run a connectivity test from the platform.
5. Assign the validated resource to an agent.

## Parameter discipline

Treat defaults as a baseline, not a universal optimum. Lower randomness is usually easier to evaluate for extraction, planning, and tool decisions; more open-ended generation may need different settings. Change one dimension at a time and preserve test inputs for comparison.

## Failure isolation

When a model call fails, distinguish authentication, endpoint reachability, provider limits, request compatibility, and output parsing. A successful platform connection test proves transport and basic API compatibility, but agent-level tests must still verify context length, structured output, and tool-call behavior.
