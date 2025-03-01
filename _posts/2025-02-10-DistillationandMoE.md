---
layout: single
author: Huijo
date: 2025-02-09
tags:
   - Machine Learning
classes: wide
title: "Knowledge Distillation: A Comparative Exploration and the Role of Soft Targets"
---

Knowledge Distillation is a process that refines large, complex models into smaller, efficient ones without losing much of the original performance. The concept of knowledge distillation is based on the observation that a complex neural network not only learns to make accurate predictions but also learns to capture meaningful and useful representations of the data. I have developed predictive regression models and computer vision solutions for agricultural applications. In my experience, high-scoring models often become too complicated for production and ML-Ops, making it important to simplify them for real-world use.

Leverage Distillation for:
- Reducing large models into smaller, deployable versions while keeping good performance.
- Streamlining implementations when computational resources are limited.

Use Soft Targets for:
- Smoothing the training process and keeping important model features that simple 0 or 1 labels might miss.
- Providing a deeper level of guidance during training through probability distributions rather than just hard labels.

### The Distillation Process: A Comparative Perspective

#### 1. The Value of Knowledge Distillation

Simplifying Complexity:
Think of a team of experts discussing a difficult problem. Their detailed discussion is complex, but a clear summary can capture the main ideas in a simpler form. Distillation does the same by compressing the knowledge of a group of strong models into one smaller model.

Training Efficiency:
By using soft targets, the model learns not only the final answer but also the **confidence behind** it. This extra information helps the smaller model perform better, even when the training data is limited. In my work, this method can help the model understand subtle differences that can be processed to be interpretable to end users.

#### 2. Understanding Soft Targets

Detailed Guidance:
Imagine comparing a complete recipe with a simple photo of a dish. The recipe gives you the detailed steps, while the photo only shows the final result. Soft targets work like the recipe by offering more information than a simple correct/incorrect label, guiding the model’s training process more effectively.

Regularization and Overfitting:
Using soft targets can also help prevent overfitting—a problem where a model performs well on training data but fails in real-world situations. Soft targets smooth out the training process, similar to how a GPS might suggest a small detour to avoid traffic, resulting in a more stable and generalizable model.

### Distillation: A Practical Tool for Real-World Deployments

#### When to Use Distillation:
For high-computation scenarios, distillation can transform large models into compact versions suitable for real-world applications. This is very important, for example, when deploying computer vision algorithms for monitoring crops, where quick and efficient responses are needed.

#### Soft Targets in Action:
In situations with limited data, the richer information from soft targets can help models learn better. This is useful in farming applications where collecting large amounts of labeled data can be challenging. (we have to wait till plants grow.)

### Looking Ahead: Generalizing the Best Methods

To truly understand relativity, I wrote a demo script:  
🔗 [GitHub: Knowledge Distillation](https://github.com/ccomkhj/ScienceNote/blob/main/ml_knowledge_distillation.ipynb)

In computer vision field, distillation is regarded as a performance bonus, as well.
[CrossKD: Cross-Head Knowledge Distillation for Object Detection](https://cvpr.thecvf.com/virtual/2024/poster/31390) also proved that average precision using `GFL ResNet-50` improved from 40.2 to 43.7 on MS COCO. 
One simple example is: Teacher detectors use ResNet-101 as the backbone, while the students use ResNet-50 as the backbone.
Besides performing CrossKD on GFL, RetinaNet, FCOS, and ATSS are effective on CrossKD.

| Student Methods | AP   | AP50 | AP75 | APS  | APM  | APL  |
|-----------------|------|------|------|------|------|------|
| **RetinaNet** |      |      |      |      |      |      |
| R101           | 38.9 | 58.0 | 41.5 | 21.0 | 32.8 | 52.4 |
| R50            | 37.4 | 56.7 | 39.6 | 20.0 | 40.7 | 49.7 |
| CrossKD        | 39.7 | 58.9 | 42.5 | 22.4 | 43.6 | 52.8 |
| **FCOS**      |      |      |      |      |      |      |
| R101           | 40.8 | 60.0 | 44.0 | 24.2 | 44.3 | 52.4 |
| R50            | 38.5 | 57.7 | 41.0 | 21.9 | 42.8 | 48.6 |
| CrossKD        | 41.3 | 60.6 | 44.2 | 25.1 | 45.5 | 52.4 |
| **ATSS**      |      |      |      |      |      |      |
| R101           | 41.5 | 59.9 | 45.2 | 24.2 | 45.9 | 53.3 |
| R50            | 39.4 | 57.6 | 42.8 | 23.6 | 42.9 | 50.3 |
| CrossKD        | 41.8 | 60.1 | 45.4 | 24.9 | 45.9 | 54.2 |


I plan to research beyond a toy demo and share my experience in determining when different approaches work best. There are times when a Mixture of Experts (MoE) model may be the best choice, while in other cases, using distillation or even a big model might be more effective. My goal is to outline the conditions under which each method works best, based on examples from both regression models and various computer vision tasks in agriculture. 


#### Reference
[Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531)
[Task Integration Distillation for Object Detectors](https://www.semanticscholar.org/paper/Task-Integration-Distillation-for-Object-Detectors-Su-Jian/8044925f55263df7de1db0c3cab15f4df487bdb7)
[D
3ETR: Decoder Distillation for Detection Transformer](https://arxiv.org/pdf/2211.09768)
[Relation Knowledge Distillation by Auxiliary Learning for Object Detection](https://www.semanticscholar.org/paper/Relation-Knowledge-Distillation-by-Auxiliary-for-Wang-Jia/088a2413c8ac62952b1bee6a7caaa4e1a9288b0d)