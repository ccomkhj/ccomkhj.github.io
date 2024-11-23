---
layout: single
author: Huijo
date: 2024-11-10
tags:
   - Study
classes: wide
mathjax: true
title: Understanding Strawberry Yields with Statistical Distributions
---
### Introducing Statistical Distributions in Agriculture

In data analysis, understanding the patterns of crop yields is essential for efficient planning and decision-making. Two important statistical tools often employed are the **Poisson distribution** and **Gaussian distribution**. Each serves unique purposes in modeling crop yield data, providing insights that are integral to optimizing agricultural practices.

### The Poisson Distribution

The Poisson distribution is utilized to model the number of events that occur within a fixed interval of time or space, especially suitable for rare or sporadic events. In the context of strawberry cultivation, this distribution effectively models the frequency of bee visits to flowers, an essential component of the pollination process.

#### Application in Bee Pollination

- **Event Modeling:** Bee visitation to strawberry flowers is a rare, time-bound event well-modeled by the Poisson distribution, making it useful for predicting pollination success and subsequent fruit development.

- **Example:** When the number of bees matches the number of strawberry plants in a greenhouse, the average visitation frequency, λ, is approximately 4.5 times per day, modeled as Poisson \(X_n \sim P(λ)\), capturing the independent and seemingly random nature of these visits.

### Multimodal Gaussian Distribution

In agricultural yield prediction, the **Gaussian distribution** (or normal distribution) serves as a crucial tool. A **multimodal Gaussian distribution** is indicative of data exhibiting multiple peaks, signaling the presence of distinct sub-groups or cycles in yield patterns.

#### Why Use Multimodal Gaussian Distribution?

- **Complex Patterns:** Captures the complexity of strawberry yield waves, with multiple peaks reflecting different growth phases throughout the season.
- **Wave Modeling:** Effectively models yield variations, essential for understanding seasonal production dynamics.

### Strawberry Yield Waves: A Gaussian Analysis

Researchers have utilized multimodal Gaussian distributions to model strawberry yields, particularly in regions like Florida, which have distinct yield waves during the winter season. This modeling provides insights into both the timing and duration of fruit production peaks, allowing for improved agricultural decision-making.

#### Table: Marketable Yield Across Different Cultivars

| Cultivar           | Early Yield (g/plant) | Late Yield (g/plant) | Total Yield (g/plant) |
| ------------------ | --------------------- | -------------------- | --------------------- |
| Florida Radiance   | 74                    | 572                  | 646                   |
| Florida Brilliance | 131                   | 583                  | 714                   |
| Florida Beauty     | 93                    | 486                  | 579                   |

> **Note:** Yield disparities highlight the utility of Gaussian models in differentiating between cultivar performance, providing a framework for strategic selection and crop management.

### Modeling Yield with Bimodal Gaussian Distribution

In this study, researchers applied a bimodal Gaussian model to understand and describe the yield waves, each representing a distinct growth phase in the strawberry production cycle. Transforming this complex bimodal model into individual unimodal models offered detailed insights into specific wave characteristics such as timing (µ) and production intensity (amplitude).
### Challenges and Outlook

While the Gaussian model effectively captures initial yield waves, extending this approach to later waves is challenging due to data limitations. At hexafarms, computer vision (fruit counts, stages, health and so on) and environmental values (temperature, DLI, CO2 and so on) are reflected on top of statistical approach in (time-) sequential analysis.

### Conclusion

Employing statistical models such as Poisson and multimodal Gaussian distributions enriches our understanding of strawberry yields. These tools not only refine yield predictions but also bolster strategic agricultural decision-making, ultimately leading to optimized crop management and increased profitability. By accurately modeling pollination processes and yield distributions, these approaches provide a robust framework for enhancing productivity and ensuring sustainable agricultural practices.