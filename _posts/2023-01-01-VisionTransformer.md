---
layout: single
classes: wide
title:  "Don't follow the metric in research papers: Vision Transformer"
---

Every year, plenty of research papers are released, boasting their metric (IoU, Precision, recall, ...) which beats the last state-of-the-art.
When I jumped into research and AI domains a few years ago, I believed the model architectures of recent papers should be better.
I reasoned that they are newer so that it could be released. 
Also, it's very common to provide the experiment result in the table comparing "ours" to another famous model.
As the one who has been through tons of trial-and-error in field-level AI application, I want to share my insights to newbies in AI domain or researchers. 

1. Unless you works in Google, Meta, Amazon (giants), your (annotated) dataset is limited. 
    - it means you should focus on model architectures with fewer parameters.
    - Cut to the chase. Skip transformer. (It underperforms than CNN with ImageNet because it has less image. Come on, ImageNet has 1 Million+ images.)
    - (Side Note) transformer lack some inductive biases (translation, equivariance and locality). It only overcomes with excessive number of training samples.

2. Don't spend too much time for better model architecture.
    - In AI research, 1% matters but in the application, users don't care about single digit performance. 
    - More factors are weighing to customers rather than improving single digit accuracy.

3. Don't be a pure AI specialist.
    - Knowledge in the backend, database, linux, docker and devops brings bigger values to the "integratable" AI model.
    - You can build your business with your AI model. Just one model can't do anything. It has to be deployed, maintained, and communicating with other services.
