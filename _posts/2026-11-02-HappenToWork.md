---
layout: single
author: Huijo
date: 2026-11-02
tags:
  - Engineering
  - Agents
  - Reading
classes: wide
title: "AI Coding: Programming by Coincidence at Scale"
excerpt: "AI lets us pile up code we don't understand faster than ever. Working code is not correct code."
ai_researched: false
---

In *The Pragmatic Programmer*, the authors describe **Programming by Coincidence**: writing code that appears to work without understanding why.

I think AI-assisted coding makes this problem even more relevant.

![An AI rapidly stacks misaligned "??" code blocks; tests pass, then an edge case knocks the tower over. A second tower built deliberately from SPEC, failure tests, small tickets, asking why, and readable code withstands the same edge case.]({{ '/assets/images/programming-by-coincidence.gif' | relative_url }})

With AI, we can generate hundreds of lines of code in seconds. We run it, see the expected output, and move on. But **do we actually understand why it works?**

The danger is that AI allows us to accumulate code we don't understand much faster than before. When something eventually breaks, we're left debugging a system whose assumptions and behavior we never fully understood.

**The problem isn't that AI writes code. It's that we mistake working code for correct code.**

So how do we avoid this?

- **Define expected behavior first.** Know what the code should do before asking AI to implement it. (Start with SPEC.md)
- **Understand the reasoning.** Question important design decisions and assumptions. (When AI generates lots of code, you should ask AI's reasoning.)
- **Test failure cases.** Don't just verify the happy path. (Start with TDD)
- **Keep changes small.** Review and validate incrementally. (Break SPEC.md into smaller tickets)
- **Own the result.** Don't ship critical code you can't explain or maintain. (For business critical part of code, If the AI generated code is not readible by you, then rewrite to be understandable by YOU. Asking for diagram & flow chart isn't sufficient. Longer + Understandable code is better than Concise + hard-to-follow code.)

AI can accelerate implementation, but it doesn't replace engineering judgment.

**If we don't change how we verify and understand code, we're just programming by coincidence, faster.**
