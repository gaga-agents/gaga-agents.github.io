---
title: File workspace
description: Understand Session file upload, references, tool access, isolation, persistence, security limits, and cleanup.
---

# File workspace

The file workspace gives every Session an independent directory for uploaded attachments and Agent-generated output. It supports image input, code execution, document processing, mechanism-model file arguments, and result delivery.

## Workspace boundaries

A stateful Session uses this layout:

```text
WORKSPACE_BASE_DIR/
  {agent_id}/
    {session_id}/
      conversation.md
      memory/
      workspace/
        uploaded and generated files
```

- Agent is the first directory boundary; different Agents do not share files.
- Session is the working boundary; Sessions of the same Agent remain separate.
- Messages persist references while bytes remain under the Session's `workspace/`.
- Tools receive only the workspace bound to the current run.
- Stateless execution uses a `TemporaryDirectory` that is removed after the request and cannot preserve files across requests.

Isolation depends on the server constructing paths from the authorized Agent and Session. Clients must not submit absolute paths from another Session.

## Upload, download, and delete

Agent Debug can upload files from chat and display them in the File Workspace tab. Users can upload, browse generated subdirectories, download, delete, and reference files.

Upload preserves the display name but creates a storage name with an eight-character random suffix:

```text
report.pdf → report-646b2cc2.pdf
```

This prevents an upload with the same name from overwriting an existing file. Generated subdirectories retain their relative paths. Download and delete use `unique_filename`, which can be either a root filename or a path such as `results/report.pdf`.

Reading and downloading require Session ownership or the applicable project access. The current delete endpoint is restricted to the Session owner.

## `@file` references

Enter `/` in the input to search the current workspace. Selecting a file inserts a reference such as:

```text
[File: results/report.pdf]
```

The current UI uses the localized `[文件: path]` marker internally. A reference does not copy bytes into the message; it identifies a workspace file for this Turn. The frontend prefers a full relative path and also recognizes filenames and earlier marker formats.

A normal attachment becomes an available path that file tools can read. An image also receives a structured image reference. Some debug flows may expose the current workspace index even when the input does not mention one file explicitly, so use a complete path when similar names exist.

## Images versus ordinary attachments

Both use the same storage and APIs, but enter the model differently:

| Type | Message representation | Model input |
| --- | --- | --- |
| Image | Text reference plus structured `image` block | Read immediately before the model call and converted temporarily to an OpenAI-compatible Data URL |
| Ordinary attachment | File path reference | Not injected automatically; a file tool, Skill, or external executor reads it when needed |

Base64 image data is not persisted in messages or execution records. If an image has been deleted, is outside the workspace, or cannot be read, Runtime drops that image block. The selected model must also support Vision.

PDF, Word, Excel, CSV, TXT, and Markdown files are normally read or generated through built-in file tools. A successful upload does not mean the model has read the file.

## Tool access and generated files

When built-in tools are enabled, Runtime injects the current `workspace_dir` into file tools and external Skills:

1. The workspace file index enters runtime context.
2. The model uses relative paths with listing, information, reading, or document tools.
3. The tool resolves and confines each path to the current workspace.
4. Generated output is written back to that workspace.
5. Refreshing the file list makes output available for download or another reference.

Code and Skill processes also run with the Session workspace as their working directory and receive `WORKSPACE_DIR`. External Skill scripts currently do not run in a sandbox, so load only trusted Skills and use manual confirmation for calls with side effects.

For a mechanism-model file parameter, Runtime reads a workspace-relative path, uploads the bytes to Scheduler temporary storage, and replaces the argument with an `_file_id` reference. MCP and ordinary external APIs follow their own file protocols and do not automatically receive local bytes.

## Persistence across container restarts

Files live on the filesystem selected by `WORKSPACE_BASE_DIR`. Survival across a restart depends on mounting that exact directory on persistent storage:

- Local development needs a persistent host path.
- Docker needs a volume mounted at the effective directory.
- Kubernetes needs a PVC mounted at the same path.
- Without a mount, files remain in the container writable layer and may disappear when a Pod is recreated.

:::warning Keep paths aligned

Code defaults to `/app/workspaces`, while the current Kubernetes manifest mounts its PVC at `/workspace`. Deployment must explicitly set `WORKSPACE_BASE_DIR=/workspace` or mount the volume at `/app/workspaces`; otherwise files are still written to the unpersisted default directory.
:::

Session and message records in MongoDB do not contain file bodies. Restoring MongoDB without the workspace volume leaves broken references.

## Multiple replicas

Every agents-management replica must see the same `WORKSPACE_BASE_DIR`. Otherwise an upload can reach one replica and execution can reach another that reports the file as missing.

Use a shared filesystem with `ReadWriteMany`, move workspace objects behind a shared object-storage adapter, or remain single-replica as a temporary limitation. The current Kubernetes manifest uses a `ReadWriteOnce` PVC and `replicas: 1`; it provides single-replica persistence, not shared multi-replica access.

Do not increase replicas until concurrent writes, immediate visibility, and consistent deletion have been verified with the selected storage.

## Path security

Download, delete, image resolution, and file tools normalize a path and verify that its resolved destination remains under the current Session workspace. Absolute paths, drive-letter paths, and `..` traversal must be rejected.

Deployments and tool implementations should also:

- expose only workspace-relative paths, not real server paths;
- prevent the model from inventing absolute paths or internal file IDs;
- treat filenames as display data and use server-resolved paths for access;
- prevent Zip Slip and limit extracted file count and total size;
- apply the same root check when creating subdirectories;
- hide dot-prefixed internal directories from user attachment lists.

## Size, type, and quota

The current upload endpoint reads the entire file into memory and does not enforce a common file-size, type, Session-capacity, or file-count limit. Production deployments must add controls at both gateway and application layers:

- request-body and per-file size limits;
- allowed or denied MIME types and extensions;
- per-user, project, Agent, and Session quotas;
- image dimension, archive expansion, and document page limits;
- malware scanning and tighter authorization for executable scripts.

An extension check alone cannot establish the real file type. Validate MIME, signatures, and actual parser results, and return an explicit `4xx` response when a limit is exceeded.

See [Multimodal Agent input](./multimodal-input.md) for images, [Tool calls and safety confirmation](./tool-calls-confirmation.md) for file arguments, and [Agent debugging and session execution](./debugging.md) for Session lifecycle.
