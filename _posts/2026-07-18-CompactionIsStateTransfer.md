---
layout: single
author: Huijo
date: 2026-07-18
tags:
  - Agents
classes: wide
title: "What Claude Code taught me about compaction"
excerpt: "Claude Code clears old tool output, summarizes the decisions that remain, and reloads working state. That suggests a practical compact strategy for long coding sessions."
---

During a technical discussion, someone asked me:

> What is a good compact strategy for a long coding session?

I answered quickly. Keep the objective, decisions, changed files, test state, unresolved problems, and next action. Do not spend summary tokens copying a file that the agent can read again.

Afterwards, I wondered how close that answer was to what an actual coding agent does. I had seen a reconstructed Claude Code repository, so I went through its compaction code.

The repository was widely called a source leak. More precisely, people reconstructed it from a sourcemap published in an npm package. I do not treat it as an official API or as documentation of the current release. Some paths depend on feature flags, and parts have already changed. For example, the snapshot disabled thinking in one fallback summarization path. The current [Claude Code context documentation](https://code.claude.com/docs/en/context-window) says that v2.1.198 inherits the session's extended thinking setting during compaction.

Still, the snapshot answered my question. Claude Code does not rely on one perfect summary. It removes context that is cheap to recover, summarizes the remaining conversation, and then reloads selected state.

```text
context after compaction =
    persistent instructions
  + summary of decisions and progress
  + state reloaded from source
  + sometimes a recent verbatim tail
```

The summary is only one part of the new context. That was the part I had missed.

---

## What the source snapshot shows

The traditional path looks like this:

```text
Structured conversation
        ↓
Keep messages after the latest compact boundary
        ↓
Optionally clear old tool results
        ↓
Append a summarization request
        ↓
Run one model turn with tools blocked
        ↓
Keep the summary and reload selected context
```

Claude Code starts after the latest compact boundary. It does not summarize raw history that was already compacted. Otherwise each new compact would process both the old conversation and the summary made from it.

Text after `/compact` becomes a custom focus:

```text
/compact focus on database decisions and exact test failures
```

This tells the summarizer which details matter most. Current documentation also supports persistent [compact instructions in `CLAUDE.md`](https://code.claude.com/docs/en/how-claude-code-works).

### Old tool results go first

Before full summarization, Claude Code can perform micro-compaction. It looks for large, old results from file reads, shell commands, search tools, web tools, and file edits. Those results can be replaced with a short cleared-content marker.

Parts of this behavior are feature-gated in the snapshot, so installations may differ. The general order is also documented officially: Claude Code clears older tool output first and summarizes the conversation when it needs more room.

That order makes sense. A file can be read again. A test can be rerun. A decision made after reading the file and discussing the failed test may exist only in the conversation.

I classify context by how I would recover it:

| Type | Example | What to preserve |
| --- | --- | --- |
| Reconstructible | File contents, current diff, branch state | A path or pointer |
| Reproducible | Test output, search results | The command and important result |
| Irreplaceable | User corrections, decisions, rejected approaches | The meaning itself |

The third row needs most of the summary budget. Copying the first two rows in full usually wastes it.

### The summarizer sees structured messages

I had assumed that compacting meant rendering the session as one long transcript and asking for a shorter string. The snapshot normally keeps the Claude API message structure. User messages, assistant messages, `tool_use` blocks, and `tool_result` blocks remain distinct. Claude Code appends a new user message that asks for the summary.

This distinction helps. A failed test returned by a tool is evidence. A user message that changes the requirement is an instruction. An assistant suggestion that the user rejected should not become the final decision.

The preferred implementation forks the existing conversation so it can reuse the prompt cache. If that path fails, Claude Code sends the active messages explicitly. The summarizer gets one turn and cannot call tools. In the inspected snapshot, compact output is capped at 20,000 tokens.

The compact prompt asks for a structured handoff. It covers the user's intent, technical concepts, files, errors, corrections, pending tasks, current work, and the next step. It also asks for filenames, signatures, relevant code, and direct quotes when they constrain what should happen next.

The model temporarily produces an analysis and a summary. Claude Code discards the analysis and keeps the summary. It then wraps that summary in a synthetic user message explaining that the session is continuing from an earlier conversation.

### Claude Code reloads state afterwards

The next context contains more than that synthetic summary. Claude Code can restore recent files, project instructions, memory, invoked skills, attachments, and context produced by hooks. The current documentation confirms that the system prompt remains loaded and that project-root `CLAUDE.md` and auto memory are re-injected.

Suppose Claude turns 150,000 tokens of conversation into a 6,000-token summary. The next request may still contain 40,000 or 60,000 tokens after the system prompt, project instructions, skills, and restored files return. These numbers are only illustrative. The point is that post-compact context is not measured by summary length alone.

A summary may record that `src/auth/session.ts` changed and explain why. The file system provides its exact current contents. It may record that one test failed on a race-condition assertion. The next turn can rerun the test if it needs the complete trace.

The full transcript also remains on disk as JSONL under `~/.claude/projects/`. It is available for inspection and recovery without occupying the active context on every request. The [session documentation](https://code.claude.com/docs/en/sessions) warns that this file format is internal and may change.

### An experimental memory path

The snapshot contains another feature-gated path. If `/compact` has no custom instruction, Claude Code may reuse a structured session-memory file instead of requesting a fresh summary at compact time.

That memory tracks current state, task details, files, errors, decisions, results, and a worklog. The snapshot aims to keep it around 12,000 tokens, then combines it with a recent verbatim tail. This spreads summarization across the session rather than making every retention decision when the context is already full.

In this version, adding custom compact instructions skips that initial shortcut and favors a fresh focused summary. The exact branch may change, but it gives me another reason to add a focus when continuity matters.

---

## How I compact now

Before reading the implementation, I concentrated on writing a better summary prompt. Now I pay more attention to what enters the session and where durable information lives.

Large research reads can happen in a separate agent context. A command that produces 20,000 lines can save the complete output to a file and return only the error or statistic I care about. Test commands, repository conventions, and architecture constraints belong in project instructions, skills, or hooks.

For important decisions, I want four pieces of information:

```text
Decision: what we chose
Reason: why we chose it
Evidence: the relevant file, command, test, issue, or URL
Status: accepted, provisional, or rejected
```

Failed approaches belong in the summary too. Otherwise the next context can repeat an attractive dead end. I keep user corrections, newly discovered constraints, and unresolved contradictions.

I also prefer to compact between phases. Once exploration has produced a decision and evidence, I can compact before implementation starts. Compacting in the middle of debugging is riskier because observations are still changing and a recent tool result may contain a clue I have not understood yet.

After compaction, I read the generated summary once. I check that modified files are named, rejected ideas are not presented as decisions, removed evidence still has a path or reproduction command, and the next action is concrete.

## The instruction I would use

For a long implementation task, I would run:

```text
/compact preserve:
- the exact objective and acceptance criteria
- user corrections and non-negotiable constraints
- decisions with their rationale
- modified files and important symbols
- reproduction commands and exact failing tests
- failed approaches and why they failed
- unresolved risks and the immediate next action

Prefer paths and commands over copied files or long logs that can
be recovered from the repository.
```

If this applies to every session, I would put a shorter version under `# Compact instructions` in `CLAUDE.md`.

Before reading the source, I thought a good compact strategy mostly meant asking for a better summary. My practice now starts earlier. I keep durable rules in files, avoid filling the main session with complete logs, and compact between phases when I can.

The summary still matters. I ask it to preserve why the work reached its current state and what should happen next. Files and commands can supply the exact details they already store better.

## References

- Anthropic, [*How Claude Code works*](https://code.claude.com/docs/en/how-claude-code-works).
- Anthropic, [*Explore the context window*](https://code.claude.com/docs/en/context-window).
- Anthropic, [*Manage sessions*](https://code.claude.com/docs/en/sessions).
- Reconstructed source mirror, [`src/services/compact`](https://gitlawb.com/node/repos/z6MkgKkb/instructkr-claude-code?path=src%2Fservices%2Fcompact&tab=code). I used it as a historical snapshot, not as an official interface.
