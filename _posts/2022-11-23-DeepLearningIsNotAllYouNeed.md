---
layout: single
classes: wide
title:  "Paper Review - Deep Learning is Not All You Need"
date: 2022-11-23
tags:
    - Machine Learning
---

There is one rule of thumb in Deep Learning research.
The deep the model is, the better it performs.
This is generally correct if it doesn't overfit too much. 
As a field machine learning engineer, I had to compromise between performance and computation (cost).
When I dealt with the structured dataset, I had a gut feeling that I don't need to use a complicated deep-learning model. (LSTM and transformer is one example.)
A recent paper has proved my "feeling" as a scientific researcher. One side, I'm so happy that my "feeling" is proven, on the other hand, I regret that I didn't start this research a few years ago. Since I just made zero to one, there's not enough energy to spend on the research. 
Cut to the chase, if you should make a machine learning model with the tabular dataset, then start with XGboost. (conventional tree-base model.)
If you have enough resources (time and computation power), then make 4 models including XGboost, and ensemble it.
Mathematically, ensemble won't worse your prediction and variation is also equal in the worst case. (However, the pain of training multiple model and tuning the hyperparameter is something you need to tolerate. astronomical AWS bill is plus.)
