---
title: Configure an agent
description: Define purpose, instructions, resources, runtime settings, and release identity.
---

# Configure an agent

An agent configuration is an executable product definition. It should be specific enough to test and stable enough to version.

## Configuration layers

| Layer | Questions to answer |
| --- | --- |
| Identity | What is the agent responsible for? |
| Instruction | How should it reason, respond, and handle uncertainty? |
| Model | Which model and generation settings fit the task? |
| Capabilities | Which tools and skills may it invoke, and when? |
| Knowledge | Which evidence sources may ground its answer? |
| Runtime | What limits, context, and memory behavior apply? |

## Build from a minimal baseline

First validate identity, instruction, and model. Add one capability at a time and retest the same scenarios. This produces a causal record of why behavior changed.

## Versioning

Treat instruction, model assignment, capability set, and runtime parameters as one release unit. Before building, capture representative tests and expected behavior. A version number is useful only when the associated configuration and test evidence can be recovered.
