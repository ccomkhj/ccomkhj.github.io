---
layout: single
author: Huijo
date: 2026-09-12
tags:
  - Engineering
classes: wide
title: "Keycloak Components: Roles, Scopes, Client Scopes, and Audience"
excerpt: "A simple explanation of how Keycloak controls access from an app to an SSH MCP server."
---

An app wants to call an MCP server that provides SSH tools. For example, a user asks the app to read a log file on a remote machine.

Before running the tool, the MCP server needs two answers:

1. **Who is asking?** This is authentication.
2. **Are they allowed to do this?** This is authorization.

**Keycloak handles sign-in and issues an access token. The app sends that token to the MCP server. The MCP server checks it and decides whether to run the tool.** A token is signed data: it lets the server check that the information came from the trusted issuer and was not changed.

In this example, the app connects to the MCP server over HTTPS. The MCP server then uses SSH to reach the remote machine. These are two separate connections, with separate authentication.

## The whole flow

<div style="max-width: 620px; margin: 1.5em auto; text-align: center; color: #172b4d;">
  <div style="padding: 18px; border: 2px solid #437bc0; border-radius: 12px; background: #eaf3ff;"><strong>app</strong><br />The user asks: “Read the server log.”</div>
  <div style="padding: 8px;">↓ User signs in through Keycloak</div>
  <div style="padding: 18px; border: 2px solid #8862b4; border-radius: 12px; background: #f3ecff;"><strong>Keycloak</strong><br />Checks the user and issues an access token.</div>
  <div style="padding: 8px;">↓ Token returns to the app</div>
  <div style="padding: 18px; border: 2px solid #437bc0; border-radius: 12px; background: #eaf3ff;"><strong>app → mcp_server</strong><br />Sends the tool request with the access token.</div>
  <div style="padding: 8px;">↓ MCP server checks the token and permissions</div>
  <div style="padding: 18px; border: 2px solid #39805a; border-radius: 12px; background: #e7f6ed;"><strong>mcp_server → remote machine</strong><br />If allowed, uses its configured SSH credentials<br />to read the requested log.</div>
</div>

This diagram focuses on the token's journey; discovery and the login redirect steps are omitted. For HTTP MCP requests, the app sends the token in the `Authorization` header:

```http
Authorization: Bearer <access-token>
```

The MCP server must validate the token and check that it was issued for that server. See the [MCP authorization specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2025-11-25/basic/authorization.mdx).

## What do we create in Keycloak?

A **user** is the account signing in. A **client** is an application registered in Keycloak. A **realm** holds a set of users, clients, and roles.

For our example, we use two client registrations:

| Name | Purpose |
|---|---|
| `app` | The application that obtains a token for the signed-in user |
| `mcp_server` | The server whose tools we want to protect; its registration holds the server's roles |

Keycloak creates the token. `app` requests it. `mcp_server` receives and checks it.

The names below are example configuration, not built-in Keycloak or MCP permissions.

## Four concepts, four questions

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin: 1.5em 0; color: #172b4d;">
  <div style="background: #eaf3ff; border: 2px solid #437bc0; border-radius: 14px; padding: 20px;">
    <strong style="font-size: 1.25em;">ROLE</strong><br /><br />
    <strong>What is the user allowed to do?</strong><br />Example: <code>ssh_reader</code>
  </div>
  <div style="background: #fff5d9; border: 2px solid #ac7b10; border-radius: 14px; padding: 20px;">
    <strong style="font-size: 1.25em;">SCOPE</strong><br /><br />
    <strong>What access is the app asking for?</strong><br />Example: <code>ssh:read</code>
  </div>
  <div style="background: #f3ecff; border: 2px solid #8862b4; border-radius: 14px; padding: 20px;">
    <strong style="font-size: 1.25em;">CLIENT SCOPE</strong><br /><br />
    <strong>What should Keycloak put in the token?</strong><br />The settings behind <code>ssh:read</code>
  </div>
  <div style="background: #e7f6ed; border: 2px solid #39805a; border-radius: 14px; padding: 20px;">
    <strong style="font-size: 1.25em;">AUDIENCE</strong><br /><br />
    <strong>Which server is the token for?</strong><br />Our SSH MCP server
  </div>
</div>

## Role: what is the user allowed to do?

Suppose Alice should be able to read logs, but should not be able to restart a service.

We create two roles under the `mcp_server` client:

| Role | What our MCP server allows |
|---|---|
| `ssh_reader` | Use the tool that reads approved log files |
| `ssh_operator` | Use the tool that restarts approved services |

We assign Alice `ssh_reader`. We do not assign her `ssh_operator`.

**A role is a label on an account. The MCP server's code gives that label meaning.** Creating the role in Keycloak does not automatically restrict SSH commands. Our server must check the role before running the relevant tool.

These are **client roles**, because they belong to `mcp_server`. A **realm role** is defined at the realm level instead, such as `employee`.

With the usual Keycloak role mappers, Alice's client role appears here in the access token:

```json
{
  "resource_access": {
    "mcp_server": {
      "roles": ["ssh_reader"]
    }
  }
}
```

A role called `ssh_reader` under `app` is a different role. If the server checks `mcp_server`'s roles, putting the same name under `app` does not satisfy that check. [Keycloak's token role mappings](https://github.com/keycloak/keycloak/blob/main/docs/documentation/server_admin/topics/clients/oidc/con-token-role-mappings.adoc).

## Scope: what access is the app asking for?

The app wants to read logs. It requests a scope named `ssh:read` when obtaining the token.

For a sign-in using OpenID Connect, the scope part of the request could be:

```text
scope=openid ssh:read
```

`openid` requests an OpenID Connect login. `ssh:read` is our custom name for the access needed to read logs.

**Requesting access does not grant it.** Alice still needs the required role. The server still checks whether the requested tool is allowed.

The distinction is small but useful:

| Role | Scope |
|---|---|
| Alice has `ssh_reader`. | The app requests `ssh:read`. |
| Assigned to the account. | Requested for this access. |

Even if Alice can both read logs and restart services, an app that only needs to read logs can request narrower access. Our MCP server must enforce that limit using the granted scopes and its tool rules.

## Client scope: what should Keycloak put in the token?

How does Keycloak know what to do with the name `ssh:read`?

We create a **client scope** with that name. It is a saved group of settings in Keycloak. We then link it to `app`.

A client scope can contain:

- **Protocol mappers:** settings that add information to a token, such as the intended audience.
- **Role scope mappings:** settings that limit which of the user's roles may enter the token.

Think of the difference this way: **`scope=ssh:read` is the request. The `ssh:read` client scope is the configuration Keycloak applies.** The configuration itself is not sent to the MCP server; the resulting token is.

A linked client scope can be **default**, so it applies without an explicit request, or **optional**, so the app must request it. User role restrictions can still prevent it from applying. Its **Include in token scope** setting controls whether its name appears in the token's `scope` field. [Keycloak's client scopes](https://github.com/keycloak/keycloak/blob/main/docs/documentation/server_admin/topics/clients/con-client-scopes.adoc).

### A concrete setup for reading logs

For this example, configure:

1. Alice has the `mcp_server` client role `ssh_reader`.
2. `app` has **Full Scope Allowed** disabled.
3. The `ssh:read` client scope allows the `mcp_server` role `ssh_reader` through its role scope mappings.
4. That client scope has an Audience mapper adding `https://ssh-mcp.example.com/mcp`, our MCP server's resource identifier.
5. Link `ssh:read` to `app` as **optional**, with **Include in token scope** enabled. Keep the usual role mappers available to `app` so eligible roles are written to the access token.

The example assumes no other role scope mappings allow extra roles. Here is the role filtering step:

```text
Alice's roles                  Roles allowed for this token
┌────────────────────┐         ┌────────────────────┐
│ ssh_reader         │         │ ssh_reader         │
│ ssh_operator       │         │                    │
└──────────┬─────────┘         └──────────┬─────────┘
           └──────────────┬──────────────┘
                          ▼
                  Role in the token
                 ┌────────────────────┐
                 │ ssh_reader         │
                 └────────────────────┘
```

In this diagram, Alice has both roles to show the filter at work. Only `ssh_reader` passes through. A role scope mapping never gives Alice a role she does not already have. With Full Scope Allowed enabled, that role filter does not limit her roles. [Keycloak's role scope mappings](https://www.keycloak.org/docs/latest/server_admin/#_role_scope_mappings).

## Audience: which server is this token for?

The app may talk to several servers. A token intended for another API should not work at the SSH MCP server just because both trust Keycloak.

The **audience** names the intended receiver. It appears in the token's `aud` field:

```json
{
  "aud": ["https://ssh-mcp.example.com/mcp"]
}
```

Our MCP server checks for that audience. Here we use its resource URL as the identifier. The Keycloak client registration is still named `mcp_server`; the Audience mapper connects our configuration to the audience value we want.

**Audience answers “Is this token for me?” A role answers “What may this user do?”** The server needs both checks.

Keycloak can set an audience explicitly with an Audience mapper or derive client audiences from eligible client roles using Audience Resolve. A scope name does not automatically become an audience. [Keycloak's audience documentation](https://github.com/keycloak/keycloak/blob/main/docs/documentation/server_admin/topics/clients/oidc/con-audience.adoc).

## Put it together: app → mcp_server

With the example configuration, Alice signs in and the app requests `ssh:read` for the SSH MCP resource. A simplified access-token payload could look like this:

```json
{
  "iss": "https://auth.example.com/realms/team",
  "sub": "alice-user-id",
  "azp": "app",
  "aud": ["https://ssh-mcp.example.com/mcp"],
  "scope": "openid ssh:read",
  "resource_access": {
    "mcp_server": {
      "roles": ["ssh_reader"]
    }
  }
}
```

This shows selected fields, not a complete usable token. Expiry and signature details are omitted.

| Field | Simple meaning |
|---|---|
| `iss` | Keycloak realm that issued the token |
| `sub` | User this token represents |
| `azp` | App that obtained it in this flow |
| `aud` | Server it is intended for |
| `scope` | Granted scope names included in the token |
| `resource_access.mcp_server.roles` | User roles included for the MCP server |

Before reading the log, our MCP server checks:

1. The token's signature, trusted issuer, and expiry are valid.
2. `aud` includes its expected resource identifier.
3. `scope` includes `ssh:read`.
4. `resource_access.mcp_server.roles` includes `ssh_reader`.
5. The requested host and log file are allowed by the tool's own rules.

| Request | Result in our example |
|---|---|
| Read an approved log with all checks passing | Allowed |
| Read a log with a token intended for a different API | Rejected |
| Read a log with `ssh:read` but no `ssh_reader` role | Rejected |
| Restart a service with this read-only token | Rejected |

After authorization, the MCP server uses its configured SSH credentials. **The Keycloak token controls access to the MCP tool. SSH authentication controls access to the remote machine.** The token is not an SSH key.

To inspect what Keycloak actually produces, use **Client scopes → Evaluate** for `app`, select the user and scopes, and look at the generated access token. Check its audience, scopes, and roles against what your MCP server expects. [Keycloak's client scope evaluation](https://www.keycloak.org/docs/latest/server_admin/#_client_scopes_evaluate).
