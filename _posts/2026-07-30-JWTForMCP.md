---
layout: single
author: Huijo
date: 2026-07-30
tags:
  - Engineering
  - Agents
classes: wide
title: "What's inside that token? JWT explained with a boarding pass"
excerpt: "I built an OAuth 2.0 server with Keycloak for our MCP setup. Here is what a JWT actually carries — issuer, audience, roles — and how we pack our own facts into it: environment, customer, and fine-grained permissions."
---

I recently built an OAuth 2.0 server using [Keycloak](https://www.keycloak.org/) so that our MCP (Model Context Protocol) tools can check *who* is calling them and *what* that caller is allowed to do. The heart of that system is a small piece of text called a **JWT** (JSON Web Token, pronounced "jot").

This post explains what a JWT is, what it carries, and how you can put your own information inside it — like which environment (prod or dev), which customer, and which exact permissions a caller has. No security background needed.

## The boarding pass analogy

A JWT is a boarding pass for software.

When you fly, you first go to the check-in counter, prove who you are with your passport, and receive a boarding pass. From then on, nobody at the gate calls the check-in counter to ask "is this person really allowed on this flight?" They just look at the pass. It says who you are, which flight you may board, which seat class you get, and it has security features so nobody can forge it.

The same flow happens in our system:

```
 You (or an AI agent)          Keycloak                 MCP server
        |                  (check-in counter)         (boarding gate)
        |                          |                        |
        |--- 1. "Here is my  ----->|                        |
        |     username/password"   |                        |
        |                          |                        |
        |<-- 2. Boarding pass -----|                        |
        |     (the JWT)            |                        |
        |                          |                        |
        |--- 3. "I want to read the database. Here is ----->|
        |        my JWT."                                   |
        |                                                   |
        |<-- 4. Gate checks the pass. Valid? Come in. ------|
```

Keycloak is the check-in counter: it verifies your identity once and hands you a signed pass. The MCP server is the gate: it never needs to see your password. It only reads the pass and checks the security seal.

## A JWT has three parts

If you look at a raw JWT it seems like gibberish:

```
eyJhbGciOi...  .  eyJpc3MiOi...  .  SflKxwRJSM...
   HEADER            PAYLOAD          SIGNATURE
```

Three chunks of text separated by dots. Each has one job:

```
+----------------------------------------------------------+
|  HEADER      "What kind of pass is this?"                 |
|              e.g. { "alg": "RS256", "typ": "JWT" }        |
|              (which sealing method was used)              |
+----------------------------------------------------------+
|  PAYLOAD     "The actual facts" (called *claims*)         |
|              who you are, who issued it, what you may do  |
+----------------------------------------------------------+
|  SIGNATURE   "The tamper-proof seal"                      |
|              proves Keycloak wrote it and nobody          |
|              changed a single letter afterwards           |
+----------------------------------------------------------+
```

One thing surprises everyone: **the payload is not encrypted.** Anyone who holds the token can read it, just like anyone who picks up your boarding pass can read your name and seat. What they *cannot* do is change it — if even one letter of the payload is altered, the signature no longer matches and the gate rejects the pass. So the rule is simple:

> Put facts in a JWT, never secrets. Names, roles, permissions: yes. Passwords, API keys: never.

## The facts inside: claims

Each fact in the payload is called a **claim**. Some claims are standard — every JWT system in the world understands them:

| Claim | Boarding pass equivalent | What it means |
|-------|--------------------------|---------------|
| `iss` (issuer) | The airline that printed the pass | Which server created this token — e.g. your Keycloak URL. The gate only trusts passes from airlines it knows. |
| `aud` (audience) | The flight number | Who this token is *for* — e.g. `mcp-server`. A pass for flight LH123 doesn't get you onto LH456, and a token issued for one API shouldn't work on another. |
| `sub` (subject) | The passenger name | Who the token is about — the user or service ID. |
| `exp` (expiry) | The departure time | When the pass stops working. JWTs are short-lived on purpose: a stolen pass is only useful for minutes, not forever. |
| `roles` | Economy / Business class | Broad groups the user belongs to, like `admin` or `analyst`. |

A minimal payload from Keycloak looks like this:

```json
{
  "iss": "https://auth.example.com/realms/mcp",
  "aud": "mcp-server",
  "sub": "user-42",
  "exp": 1767100000,
  "realm_access": { "roles": ["analyst"] }
}
```

## Adding your own facts: custom claims

Standard claims answer "who are you and who issued this?" But real systems need more context. In our case the MCP server needs to know three extra things before it does anything:

1. **Which environment** is this token for — production or development?
2. **Which customer's data** may this caller touch — customer A or B?
3. **Exactly which actions** are allowed — read the database? read a sheet? write to it?

All three fit naturally into the payload as **custom claims**:

```json
{
  "iss": "https://auth.example.com/realms/mcp",
  "aud": "mcp-server",
  "sub": "user-42",
  "exp": 1767100000,
  "realm_access": { "roles": ["analyst"] },

  "env": "prod",
  "customer": "A",
  "permissions": ["db:read", "sheet:read", "sheet:write"]
}
```

Think of these as extra stamps on the boarding pass: "Lounge access: yes. Priority boarding: no."

### Why the `resource:action` pattern is worth copying

Notice the shape of the permissions: `db:read`, `sheet:write`. That's *thing colon verb*. It stays readable as the system grows, and the check on the server side becomes one line of logic:

```
Request: "write row 5 to the sheet"
Check:   does the token's permissions list contain "sheet:write"?
         yes -> do it
         no  -> refuse (403 Forbidden)
```

Roles and permissions work together but answer different questions. A **role** is a job title ("analyst"); a **permission** is a concrete allowance ("may write to sheets"). In Keycloak you define roles, attach permissions to them, and Keycloak expands everything into the token automatically. Users are managed by role; the MCP server only ever checks permissions.

### How to add custom claims in Keycloak

Keycloak calls this feature **protocol mappers** (in newer versions you'll find it under **client scopes**). No code required:

1. Store the fact on the user or client — e.g. a user attribute `customer = A` (Users → your user → Attributes).
2. Create a mapper that copies the attribute into the token (Clients → your client → Client scopes → Add mapper → *User Attribute*, set the claim name to `customer`).
3. That's it. Every new token for that user now contains `"customer": "A"`.

The `env` claim is often simplest to handle differently: run one Keycloak realm (or client) per environment, and hard-code the claim with a *hardcoded claim* mapper — `env: prod` in the prod realm, `env: dev` in the dev realm. Then a dev token can *never* claim to be a prod token, because the prod issuer never signed it.

## The full journey of one request

Here is everything together — what happens when an AI agent asks our MCP server to write to a spreadsheet:

```
 AI agent                                        MCP server
    |                                                |
    |  "Append this row to the sheet."               |
    |  + JWT                                         |
    |----------------------------------------------->|
    |                                                |
    |                     The gatekeeper checklist:  |
    |                                                |
    |          1. Signature valid?  (not forged)     |
    |          2. iss = our Keycloak?  (right issuer)|
    |          3. aud = mcp-server?  (meant for us)  |
    |          4. exp in the future?  (not expired)  |
    |          5. env = prod?  (right environment)   |
    |          6. customer = A?  (right data scope)  |
    |          7. "sheet:write" in permissions?      |
    |                                                |
    |     ALL seven pass -> row is written           |
    |     ANY one fails  -> request refused          |
    |<-----------------------------------------------|
```

Steps 1–4 are the standard checks every JWT system does. Steps 5–7 are ours — and they only exist because we put `env`, `customer`, and `permissions` into the token as custom claims.

The elegant part: the MCP server made all seven decisions **without contacting Keycloak** and **without storing any user data**. Everything it needed was on the pass. That's why JWTs are the default choice for connecting many small services — each gate can verify passes on its own, as long as it knows the issuer's public key.

## Takeaways

- A **JWT** is a signed, readable, short-lived boarding pass: header (seal type), payload (facts), signature (the seal).
- **Readable ≠ forgeable.** Anyone can read it; nobody can change it. So: facts in, secrets out.
- **`iss`** says who printed the pass, **`aud`** says which gate it's for, **`exp`** says when it dies. Check all three, always.
- **Custom claims** let you carry your own facts — `env`, `customer`, `permissions` — and Keycloak adds them with mappers, no code.
- The **`resource:action`** permission format (`db:read`, `sheet:write`) keeps authorization checks one line long, forever.
