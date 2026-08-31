---
title: Authentication and authorization
description: Understand user, project-role, and packaged-Agent identity flows, authorization rules, and production trust boundaries.
---

# Authentication and authorization

The platform uses layered controls: authenticate at the shared ingress, authorize against the project, and enforce the decision in backend services. Authentication answers who the caller is; authorization determines whether that identity may access a project and its resources. Frontend route guards and hidden buttons improve the experience but are not security controls.

## Identities in scope

The current implementation has three caller identities:

| Identity | Credential | Primary use | Source of authority |
| --- | --- | --- | --- |
| Platform user | Access Token / Refresh Token | Console and public APIs | User status, platform role, and project membership |
| Platform administrator | User token with the `admin` role | Governance and cross-project administration | Platform role stored by User Management |
| Packaged Agent | Deployment token prefixed with `gda_pkg_` | A deployed Agent calling internal platform resources | The token-bound `agent_id` and `project_id` |

Platform roles and project roles are separate dimensions. Platform roles are currently `user`, `developer`, and `admin`; project roles are `owner`, `editor`, and `viewer`. An `admin` can manage projects across the platform. A `developer` receives no automatic cross-project access and must still be a project member.

## User authentication flow

```text
Browser / API client
  │  POST /api/v1/auth/login
  ▼
User Management Service
  │  Verify password hash and account status
  │  Issue Access Token + Refresh Token
  ▼
Browser / API client
  │  Authorization: Bearer <access-token>
  ▼
Gateway
  │  Verify JWT signature and expiry
  │  Set X-User-Id and X-Username
  ▼
Business Service
  │  Check the required role for project_id
  ▼
Project Service
```

Users can sign in with either a username or an email address. User Management stores bcrypt password hashes and issues two JWTs after registration or login:

| Token | Current default lifetime | Important claims | Purpose |
| --- | --- | --- | --- |
| Access Token | 24 hours | `sub`, `username`, `email`, `role`, `type=access`, `exp` | Access protected APIs |
| Refresh Token | 7 days | `sub`, `type=refresh`, `exp` | Obtain a new token pair |

Lifetimes are service configuration and clients should not hard-code them. During refresh, User Management reloads the user and checks `is_active`, so a disabled account cannot continue refreshing. When concurrent frontend requests receive `401`, one refresh is made and the remaining requests wait in a queue. A failed refresh clears local authentication data and returns the user to sign-in.

The Gateway currently permits registration, login, refresh, health-check, and favicon paths without authentication. Other routes require `Authorization: Bearer <token>`. A missing or invalid credential results in `401 Unauthorized`.

## Project authorization model

Project Service stores `owner_id` and the member list and is the source of truth for project permissions. Roles form this hierarchy:

```text
owner > editor > viewer
```

| Capability | viewer | editor | owner | Platform admin |
| --- | :---: | :---: | :---: | :---: |
| View a project and its resources | ✓ | ✓ | ✓ | ✓ |
| Run callable project resources | ✓ | ✓ | ✓ | ✓ |
| Create or modify project resources |  | ✓ | ✓ | ✓ |
| Change project metadata |  | ✓ | ✓ | ✓ |
| Add project members |  | ✓ | ✓ | ✓ |
| Change member roles |  |  | ✓ | ✓ |
| Remove members, delete projects, stop builds, and other owner operations |  |  | ✓ | ✓ |

This table defines the common semantics. Individual high-impact endpoints, including build, deployment, and deletion operations, may require the higher `required_role` declared by that endpoint.

For a resource request, a service should first resolve the resource's trusted `project_id`, then require `viewer`, `editor`, or `owner`. Current services use Project Service's single-project or batch permission endpoint; some read project membership and apply the same hierarchy locally. Batch checks read a bounded number of projects at a time so list endpoints do not create unbounded fan-out.

Use status codes consistently:

- `401`: no valid identity, or an invalid or revoked deployment token;
- `403`: a valid identity lacks the required role or attempts cross-project access;
- `404`: the target does not exist. Public APIs may consistently return `404` instead when their policy must reduce resource enumeration.

## Packaged-Agent deployment identity

Builder issues a dedicated deployment token for each packaged Agent. Plaintext is returned only at creation time; the database stores only its SHA-256 digest together with `deployment_id`, `build_id`, `agent_id`, and `project_id`.

```text
Packaged Agent
  │  Authorization: Bearer gda_pkg_...
  ▼
Resource Service → Project Service
                        │
                        └─ Builder internal introspection
                           Check digest, active state, and build state
```

Project Service recognizes the deployment credential and asks Builder to introspect it. Authorization succeeds only when the token is active and the requested `project_id` matches its bound project. A packaged Agent cannot use this credential to access another project. Stopping the build or explicitly revoking the token makes introspection fail and subsequent requests return `401`.
