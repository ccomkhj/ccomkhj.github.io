---
layout: single  
author: Huijo  
date: 2025-11-11
tags:
   - Machine Learning
classes: wide  
title: "Causal Inference in Plants"
---

I have built a yield forecasting model using LightGBM.
It was working surprisingly well, way more accurate than agriculture experts who are physically in the farm.

It predicts strawberry and tomato yields based on growing conditions like temperature, light, CO₂, and humidity.  
The model performs well in forecasting, but I realized it only learns **correlations**, not **causal relationships**.  
So even if it predicts yield accurately, it can not explain what will actually happen **if the farm operator changes** temperature or light in a real greenhouse for the period of time.

To go beyond prediction, I started building a **simulation system** that recommends growing conditions due to customer demands.
As the farm can truly reduce the energy cost per kg of production by knowing the impact of the grow condition.
For that, I needed **causal inference** — a way to estimate how much yield changes when I intervene on variables (like raising temperature by +2°C).
Imagine how much heating 2°C more for 10 ha facility will cost.

### 1. Setting up causal modeling

I began by drawing a simple **causal graph (DAG)** that represents how different factors affect yield:
- Temperature and light directly influence yield.
- CO₂, humidity (VPD), irrigation, temperature, and cultivar affect yield (so they’re confounders).
- Some variables, like energy usage, are side effects and should not be adjusted for.

This step helped me define what needs to be controlled to get valid causal effects.

### 2. Integrating with DoWhy

I used **DoWhy**, a causal inference library, to wrap around my LightGBM model.  
DoWhy helps connect the model to causal concepts:

1. **Model** — define the DAG fully based on plant science. This is where I had to be an plant scientist.
2. **Identify** — find which variables to adjust for (backdoor criterion).  
3. **Estimate** — use LightGBM as the outcome and treatment model.  
4. **Refute** — test how stable and believable the effect is.

My LightGBM still does the heavy lifting for nonlinear relationships, while DoWhy handles the logic of “*what if*” changes.

### 3. Checking trustworthiness

A big question was: can I trust these causal effects?

I tested this with:
- **Placebo refuters** — replace temperature with random noise.  
  → The estimated effect disappeared (good sign).  
- **Subset refuters** — re-run the model on random data splits.  
  → Results stayed consistent.  
- **Sensitivity tests** — check how strong a hidden confounder must be to change conclusions.  
  → Effects were robust unless confounding was extreme.  

These tests gave me confidence that the model captures real causal influence, not just correlation noise.

### 4. Results and next steps

Now, the system can simulate different environmental settings and show **expected yield changes** under those interventions.  
For example, “if I increase PAR by 15% by turning on LED while keeping CO₂ constant, yield increases by ~6%.”  
This gives a foundation for **growing condition recommendations**.

Next step would be:
- Combine multiple cultivars to learn condition-specific responses.
- Validate the system with controlled greenhouse trials.

### 5. Reflection

This process taught me that causal inference is not just a statistical trick — it’s a framework for thinking.  
The key was translating plant science knowledge into a graph of cause and effect, then testing those assumptions systematically.  
Thanks to this work, farmers can not only predict yield, but also simulate **what happens if we change the environment** — a step closer to autonomous, data-driven cultivation.
