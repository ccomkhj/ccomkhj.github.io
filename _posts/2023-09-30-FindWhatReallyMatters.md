---
layout: single
author: Huijo
date: 2023-09-17
permalink: /blog
taxonomy: [AI, Work Life]
classes: wide
title:  Find out What really matters
---

In business, life, and friendships, we often look at what causes good and bad outcomes. When I was researching ways to make model performance better, I tried to understand the key features that help improve the model. Some people refer to this as Explainable AI (EXA), but I think of it as a basic approach in life.

I got this idea from a [paper](https://ojs.aaai.org/index.php/AAAI/article/view/26317) that questioned why transformers aren't the best choice for time-series datasets. I used to believe that XGBoost was the best for tabular datasets, but after doing lots of tests, I found that transformers work better for time-series problems. However, there are some conditions to this finding. One thing I can publicly say is: the dataset should have many features (I found that more than 20, but ideally 50; and all features should relate to or ideally cause the target).

When I use AI to solve real-world problems, it's important to understand what causes what. Mixing domain knowledge and creativity is key, but finding what causes what really makes a difference.