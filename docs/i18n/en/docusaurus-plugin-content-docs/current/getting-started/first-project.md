---
title: Create your first project
description: Establish the workspace that owns resources, agents, builds, and runtime records.
---

# Create your first project

A project is the ownership boundary for agents and their related resources. Create one before configuring an agent so that builds, runtime records, and permissions remain attributable.

## Create the workspace

1. Sign in to the Web console.
2. Open **Projects** and choose **Create project**.
3. Enter a stable name, identifier, and description.
4. Confirm the project and switch into it.

Use a name that describes the business domain rather than one temporary experiment. Keep the identifier stable because automation and service records may refer to it.

## Prepare project resources

Within the project, confirm at least one available LLM resource. Add tools or a knowledge base only when the first use case needs them; a minimal agent is easier to validate than an agent with every capability enabled at once.

## Validate the boundary

Before continuing, verify that the current project is visible in the navigation and that newly created resources are associated with it. Then proceed to [Build your first agent](./first-agent.md).
