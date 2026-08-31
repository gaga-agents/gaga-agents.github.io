---
title: Build, release and roll back
description: Convert a tested agent configuration into a traceable runtime release.
---

# Build, release and roll back

A release should connect four things: source configuration, build artifact, deployed runtime, and verification evidence. If any link is missing, a team cannot reliably reproduce or roll back the behavior.

This page covers the general delivery workflow. See [Agent builds](./agent-build.md) for Builder run modes, resource packaging, code generation, states, and troubleshooting.

## Before building

- Confirm the selected agent version and project.
- Run representative conversation, tool, and knowledge tests.
- Verify referenced resources are available in the target environment.
- Record runtime limits and external service dependencies.

## Build and deploy

Create a build from the validated configuration and follow its status through the Builder service. After the artifact is available, deploy it to the selected environment and verify service discovery, health, logs, and a complete business request.

## Release record

Keep the agent version, resource versions, artifact identifier, deployment environment, operator, timestamp, and verification result together. This turns a successful deployment into an auditable release.

## Rollback

Rollback means restoring a previously verified combination, not merely changing an image tag. Confirm that dependent model, tool, and knowledge resources remain compatible, then repeat the same health and business checks used for release.
