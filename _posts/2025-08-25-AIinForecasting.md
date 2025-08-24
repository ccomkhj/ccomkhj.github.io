---
layout: single  
author: Huijo  
date: 2025-8-25
tags:
   - Machine Learning
   - Philosophy
classes: wide  
title: "Rold of AI&ML in forecasting"

---


When it comes to predicting or forecasting something, folks—including marketers, customers, and especially investors—really like to hear that a product is using **Artificial Intelligence (AI)**. It’s well-proven that in many problem domains like image classification, detection, and language processing, AI, and especially deep learning, has outperformed many statistical models. However, when it comes to predicting the future (or time-series forecasting), that’s mostly not the case. 
This isn't just from my own experience, but also from stories coming from multiple industries and companies, as I’ve exchanged insights with various engineers.

Through my startup journey with successful (but very tough) fundraising rounds, I had to cope with multiple investor talks and Due Diligence prepration and it was my dilema if I had to lie our technology for the sake of money raising, because investors want to hear about deep learning. 

## The Reality of AI/ML in Forecasting

While AI/ML models can be incredibly powerful, they're not always a magical solution for forecasting. The reality is more nuanced, and often, their use comes with significant trade-offs compared to traditional statistical methods.

One of the primary challenges is the "black box" nature of many advanced AI models. It can be difficult to understand why a particular forecast was made, which can be a major issue when a business needs to justify a decision to stakeholders. Traditional models, on the other hand, are often more interpretable and transparent.

Another key issue is the resource intensiveness of AI/ML models. They are notoriously data-hungry, requiring vast amounts of historical data to train effectively. This can be a major barrier for businesses with limited data. Additionally, the computational power required to train these complex models is significantly higher, leading to increased costs and energy consumption.

Finally, while AI models can capture incredibly complex, non-linear relationships, this flexibility comes with a risk: overfitting. This occurs when the model learns from the random noise in the data rather than the true underlying patterns, leading to poor performance on new, unseen data.
### The Power of Gradient Boosted Trees

It's also crucial to mention another major player in the ML forecasting world that isn't Deep Learning: **Gradient Boosted Trees**. Models like **XGBoost** and **LightGBM** are frequently the winning solutions in data science competitions and are widely used in practical industry applications. These models are a type of ensemble learning that builds a strong predictive model by combining many "weak" decision trees. They are often more interpretable than neural networks, require less data and tuning, and can be incredibly powerful and robust.

So I can introduce this approach not only as a middle ground between shallow and deep, but also, more importantly, as a go-to solution as long as you have a minimum quantity of data, as it has the potential to capture most of the advantages—trend and seasonality—of statistical modeling (i.e., ARIMA, exponential smoothing) with the correct feature engineering. (It approaches the problem in a completely different way mathematically, but it has the potential to offer similar results.) Plus, it captures non-linearity in the data (and also handles non-stationarity).

## A Prudent Approach to Forecasting

This isn't to say that AI/ML has no place in forecasting. It's an incredibly useful tool when applied to the right problem, especially in situations with complex, high-dimensional data or when forecasting a large number of related time series. In lots of business cases, data is often insufficient as they barely started to collect data and start project, or some data is either corrupted or intermittent.

Overall tip from me: the key is to view AI/ML not as a universal solution but as one option among many. For many forecasting challenges, a classic statistical model might be more cost-effective, easier to interpret, and just as accurate as a complex AI model. The most successful approach often involves a combination of techniques, using the strengths of each to build a robust and reliable forecasting system. The goal isn't to use AI just for the sake of it, but to find the best tool for the job. Investigate and experiment with different level of aggregation and models.

