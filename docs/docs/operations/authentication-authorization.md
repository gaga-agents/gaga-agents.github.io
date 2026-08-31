---
title: 身份认证与权限控制
description: 说明平台用户、项目角色与打包 Agent 的身份链路、授权模型和生产安全边界。
---

# 身份认证与权限控制

平台采用“统一入口认证、项目级授权、服务侧强制校验”的分层模型。身份认证回答“调用方是谁”，权限控制回答“该身份能否访问这个项目及其资源”。前端的按钮隐藏和路由守卫只改善交互，不能代替后端校验。

## 设计范围

当前实现包含三类调用身份：

| 身份 | 凭证 | 主要用途 | 权限来源 |
| --- | --- | --- | --- |
| 平台用户 | Access Token / Refresh Token | 控制台和开放 API | 用户状态、平台角色、项目成员关系 |
| 平台管理员 | 带 `admin` 角色的用户 Token | 平台治理和跨项目管理 | 用户服务中的平台角色 |
| 打包 Agent | `gda_pkg_` 前缀的部署令牌 | 已发布 Agent 调用平台内部资源 | 令牌绑定的 `agent_id` 与 `project_id` |

平台角色与项目角色是两个不同维度。平台角色当前包括 `user`、`developer` 和 `admin`；项目角色包括 `owner`、`editor` 和 `viewer`。`admin` 具有跨项目管理能力，`developer` 当前不自动获得项目外权限，仍需成为项目成员。

## 用户认证链路

```text
Browser / API client
  │  POST /api/v1/auth/login
  ▼
User Management Service
  │  校验密码哈希与账号状态
  │  签发 Access Token + Refresh Token
  ▼
Browser / API client
  │  Authorization: Bearer <access-token>
  ▼
Gateway
  │  校验 JWT 签名与过期时间
  │  写入 X-User-Id、X-Username
  ▼
Business Service
  │  根据 project_id 请求项目权限校验
  ▼
Project Service
```

用户可以使用用户名或邮箱登录。密码由用户服务使用 bcrypt 哈希保存，登录和注册成功后同时签发两类 JWT：

| Token | 当前默认有效期 | 关键 Claims | 用途 |
| --- | --- | --- | --- |
| Access Token | 24 小时 | `sub`、`username`、`email`、`role`、`type=access`、`exp` | 访问受保护 API |
| Refresh Token | 7 天 | `sub`、`type=refresh`、`exp` | 换取一组新的 Token |

有效期由用户服务配置决定，不应由调用方写死。刷新时，用户服务会重新读取用户记录并检查 `is_active`，因此禁用账号无法继续刷新。前端在并发请求同时收到 `401` 时只发起一次刷新，其余请求排队等待；刷新失败后清理本地认证信息并返回登录页。

网关当前放行注册、登录、刷新、健康检查和站点图标路径，其他路由要求 `Authorization: Bearer <token>`。缺少凭证或验证失败返回 `401 Unauthorized`。

## 项目授权模型

项目服务保存 `owner_id` 和成员列表，是项目权限的事实来源。角色满足以下层级：

```text
owner > editor > viewer
```

| 能力 | viewer | editor | owner | 平台 admin |
| --- | :---: | :---: | :---: | :---: |
| 查看项目与资源 | ✓ | ✓ | ✓ | ✓ |
| 运行可调用的项目资源 | ✓ | ✓ | ✓ | ✓ |
| 创建或修改项目资源 |  | ✓ | ✓ | ✓ |
| 修改项目基本信息 |  | ✓ | ✓ | ✓ |
| 添加项目成员 |  | ✓ | ✓ | ✓ |
| 修改成员角色 |  |  | ✓ | ✓ |
| 移除成员、删除项目、停止构建等所有者操作 |  |  | ✓ | ✓ |

上表是统一语义；具体接口可能要求更高等级。例如构建、部署和删除等高影响操作应以接口声明的 `required_role` 为准。

资源服务处理请求时，应先取得资源所属的 `project_id`，再要求 `viewer`、`editor` 或 `owner` 权限。当前服务通过项目服务的单项目或批量校验接口完成这一判断，部分服务会读取项目成员关系后执行相同的等级比较。批量校验以有限批次读取项目，避免列表接口逐项产生无界请求。

授权失败时使用一致的状态码：

- `401`：没有有效身份，或部署令牌无效、已撤销；
- `403`：身份有效，但项目角色不足或试图跨项目访问；
- `404`：目标资源不存在。对外接口如需降低资源枚举风险，也可以在权限策略中统一返回 `404`。

## 打包 Agent 的部署身份

构建服务为每个已打包 Agent 签发独立部署令牌。令牌只在创建时返回明文，数据库仅保存 SHA-256 摘要，并同时绑定 `deployment_id`、`build_id`、`agent_id` 和 `project_id`。

```text
Packaged Agent
  │  Authorization: Bearer gda_pkg_...
  ▼
Resource Service → Project Service
                        │
                        └─ Builder internal introspection
                           检查摘要、active 状态和构建状态
```

项目服务识别部署令牌后会调用构建服务内省。只有令牌有效且请求的 `project_id` 与令牌绑定项目一致时才授权；打包 Agent 不能借此访问其他项目。停止构建或显式撤销令牌后，内省失败，后续请求返回 `401`。
