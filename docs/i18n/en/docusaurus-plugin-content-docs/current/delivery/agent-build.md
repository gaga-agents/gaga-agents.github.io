---
title: Agent builds
description: Understand how Builder freezes Agent configuration, generates a repository, builds an image, and deploys microservice or standalone Agents.
---

# Agent builds

Agent Builder turns a configured Agent into a deployable Docker image.

This page covers configured single-Agent builds. Multi-Agent orchestration has separate build models and endpoints and should not be mixed with these records.

## Build input

A build configuration references a source `agent_id` and its `project_id`. When triggered, Builder reloads the current Agent configuration, including:

- prompts, model parameters, and the vision-capability flag;
- tools, built-in tools, Skills, and MCP configuration;
- knowledge-base references;
- memory, planning, and execution strategies;
- build name, version, run mode, service port, and target Docker node.

The values read during the build form the artifact snapshot. Later source-Agent changes do not update an existing artifact automatically. Related builds are marked `stale` and must be triggered again to produce a new version.

:::warning Build artifacts can contain sensitive configuration

Generated repositories, build logs, and images may contain model connection data, MCP request headers, external Skill assets, or other runtime resources. Treat them as sensitive delivery artifacts. Do not use public repositories or expose tokens, API keys, or complete authorization headers in logs and release notes.
:::

## Run modes

| Dimension | Microservice | Standalone |
| --- | --- | --- |
| Enum value | `microservice` | `standalone` |
| LLM | Call the platform LLM Service | Call the provider directly from the generated service |
| Tools and mechanism models | Depend on platform Tool, Scheduler, Sandbox, and related services | Write selected resources into a local registry and use local executors |
| Discovery | Discover platform services through Nacos | Platform capability services are optional; Nacos registration is optional |
| Project identity | Receive a deployment token for bound-project access | Do not use the microservice deployment token for platform resources |
| Best fit | Online Agents that depend on shared platform governance | Self-contained or isolated delivery |

Both modes share the same session protocol, file workspace, HTTP/SSE APIs, and React frontend. Mode directories override only remote or local clients, root configuration, and deployment differences. Shared features such as memory, image input, tool confirmation, and session control should therefore behave consistently.

Standalone does not mean “no external dependencies.” The generated service still requires its own MongoDB, model provider, and runtime storage. MCP servers, external APIs, and knowledge capabilities may still require network access according to the frozen configuration.

## End-to-end build flow

```text
Create Build configuration
  ↓ draft
Trigger build and create BuildHistory
  ↓ building
Load the source Agent and dependent resources
  ↓
Generate backend, frontend, and configuration
  ↓
Create or reuse a GitLab repository and commit source
  ↓
Jenkins builds a multi-stage Docker image and deploys it
  ↓
Append logs and Git/Jenkins metadata
  ↓ deployed / build_failed
```

The current main pipeline deploys automatically through Jenkins, so success moves directly to `deployed` instead of remaining at `build_success`. A manual deployment endpoint is also retained for artifacts that have been built successfully or stopped.

The build runs in the Builder background after the trigger endpoint returns `build_id`, `build_number`, and `history_id`. Clients must inspect build details or history for the terminal result. An accepted trigger does not mean the image is ready.

## Create a build configuration

Important fields are:

| Field | Purpose |
| --- | --- |
| `project_id` | Project that owns the build |
| `agent_id` | Source configured Agent |
| `build_name` | Human-facing name; the system appends an eight-character UUID |
| `run_mode` | `microservice` or `standalone` |
| `service_port` | Service port; allocated from the configured range when omitted |
| `docker_image_tag` | Image tag |
| `docker_cloud` | Target Docker node used by Jenkins deployment |
| `env_variables` | Runtime environment variables |

The system also generates the service name and image name. Build configuration and BuildHistory are different objects: configuration describes the current delivery target, while each history entry records its number, version, logs, commit, Jenkins metadata, duration, and failure reason.

## Code generation

Builder copies the shared template and overlays the selected mode:

```text
common-agent
├─ agent_runtime/      # AgentRun, AgenticLoop, memory, model, and tool runtime
├─ api/                # Chat, SSE, Session, file, and control APIs
├─ repository/         # MongoDB persistence
├─ services/           # Application services and runtime coordination
└─ agent-frontend/     # React sessions, debugging, workspace, and A2A

        + micro-agent/ or single-agent/
        ↓
complete generated repository
```

Before regeneration, Builder clears the temporary output for that build name so deleted files from the previous version cannot remain. It commits the result to GitLab. After Jenkins succeeds, the temporary local directory is removed, leaving the Git commit and image as traceable artifacts.

The frontend is part of the artifact. The multi-stage Dockerfile builds `agent-frontend` and places its static output alongside the FastAPI service; the generated service exposes both its APIs and frontend from its assigned port.

## Standalone resource packaging

Standalone generates `resources/registry.json` with local resource definitions for:

- selected tool packages and schemas;
- mechanism-model definitions, code, API settings, binaries, and dependencies;
- external Skills and ZIP assets;
- MCP Server addresses, request headers, and tool configuration.

Local tools and mechanism models no longer call the platform Tool Service, Scheduler, or Sandbox at runtime. Generated executors handle supported languages and resource types inside the image. MCP tools still call their configured external MCP servers, so freezing configuration does not copy a third-party service offline.

The provider endpoint, model name, and credentials come from build-time runtime configuration and the deployment environment. Production should override secrets through environment variables or a Secret and restrict access to repositories and images.

## Microservice deployment identity

At the start of a Microservice build, Builder issues a deployment token prefixed with `gda_pkg_` and injects it into the generated service. The database retains only its digest and binds it to the deployment, build, source Agent, and project.

The generated Agent presents this token when calling platform project resources. Project Service introspects it through Builder and permits only its bound `project_id`. A failed build revokes the newly issued token; stopping or deleting the build also revokes related tokens. See [Authentication and authorization](../operations/authentication-authorization.md) for the trust boundary.

## Runtime state and synchronization state

Build lifecycle states are:

| State | Meaning |
| --- | --- |
| `draft` | Configuration exists but has not been triggered |
| `building` | Generating source, committing, or running Jenkins |
| `build_success` | Image built and ready for deployment; the automatic path normally does not remain here |
| `build_failed` | Source generation, GitLab, Jenkins, or image build failed |
| `deploying` | Deployment in progress |
| `deployed` | Service deployed |
| `deploy_failed` | Image exists but deployment failed |
| `stopped` | Runtime stopped |

`sync_status` is independent of runtime state:

- `synced`: the source configuration has not been marked changed;
- `stale`: the source Agent changed, while this artifact may still run with its old snapshot;
- `broken`: the source relationship can no longer be used safely.

`stale` never rebuilds or replaces a live container automatically. Review the source change, create a new build history entry, verify the artifact, and then switch traffic.

## Pre-build checks

Before triggering a build:

1. save the source Agent and pass representative conversations in platform debugging;
2. verify the intended versions of prompts, models, memory, tools, Skills, MCP, and knowledge bases;
3. ensure the selected run mode matches external dependencies, especially whether Standalone has every required local resource;
4. confirm the Docker node port, GitLab, Jenkins, Builder credentials, and network are ready;
5. confirm the target network can reach the model provider, MCP servers, and external APIs;
6. plan persistent MongoDB, workspace, and other state storage;
7. ensure production secrets cannot leak into ordinary logs or public source.

## Post-deployment verification

After the state becomes `deployed`, verify in order:

1. `service_url` and `frontend_url` are reachable;
2. health, MongoDB, and required Nacos registration are healthy;
3. a Session can be created and a text conversation completes;
4. uploads, workspace I/O, and SSE streaming work;
5. model, tool, Skill, MCP, and knowledge calls match the selected mode.

The generated service uses a container workspace directory by default. Mount persistent storage when session files must survive. Multiple replicas need a shared workspace or equivalent routing/storage guarantees; otherwise a database reference can exist while the actual image or attachment is unavailable to the execution replica.

## Stop, rebuild, and delete

- **Stop:** trigger Jenkins undeploy, move to `stopped`, and revoke deployment credentials;
- **Rebuild:** reload current source configuration, produce a new commit and image, and append BuildHistory;
- **Delete:** make a best-effort stop, delete configuration and history, and revoke every deployment token for the build;
- **Rollback:** restore a verified combination of Git commit, image tag, and dependencies instead of editing a record to resemble an old release.

Deleting the build record does not necessarily remove every external Git repository, image, volume, or third-party resource. Production operations need explicit retention and cleanup policies for those artifacts.

## Troubleshooting

| Stage | Common failure | Check first |
| --- | --- | --- |
| Load configuration | Agent missing or service unreachable | `agent_id`, discovery, project access |
| Collect resources | Broken tool, model, Skill, or MCP reference | First resource error in logs and `sync_status` |
| Generate source | Missing template or unserializable configuration | Template projection, Jinja error, temporary-directory permissions |
| GitLab | Repository creation or commit fails | URL, token, project permission, network |
| Jenkins | Health check or job fails | Job, credentials, build URL, console log |
| Docker | Dependency, frontend, or image build fails | Dockerfile stage, package sources, disk, network |
| Deploy | Port conflict or container startup failure | Target node, port, environment, MongoDB, health logs |
| Runtime | Model or tool call fails | Run mode, provider/Nacos, deployment token, target network |

Start with the first failing BuildHistory line and record the `build_number`, Git commit, Jenkins Build URL, and image tag. The final `build_failed` state alone does not identify the failed stage.

See [Build, release and roll back](./build-deploy.md) for the wider release, verification, and rollback process.
