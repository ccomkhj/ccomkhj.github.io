---
layout: single  
author: Huijo  
date: 2025-12-22
tags:
   - Machine Learning
classes: wide  
title: "Evaluate agents"
excerpt: "Notes on the parts of an agent worth evaluating — routers, skills, and paths — and the methods (LLM-as-judge, code checks, human feedback) that scale to each."
---

Parts of an Agent You need to Evaluate

- Routers: Function choice and parameter extraction
   - Did it call the right skills based on the scenario?
- Skills: Can use standard LLM evaluations
   - Embed input query
   - Vector DB lookup
   - LLM call with retrieved context
- Path: The most challenging to evaluate at scale


How to evaluate these components

- LLM as a Judge: Using other LLMs to evaluate
   - It will never e a 100% correct
   - Tuning your LLM judge prompt can help close this gap
   - Always use discrete classification labels (incorrect vs correct, not 1-100% accuracy)
   - Foolow from 13:45 (https://www.youtube.com/watch?v=LpbGpJhndQ0)
- Code-based Evals: Using traditional code checks
- Human Feedback: Using end-user or human labeler feedback