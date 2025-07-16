---

layout: single  
author: Huijo  
date: 2025-07-16
tags:  
   - Math
   - Machine Learning
classes: wide  
title: "Explanatory vs. Predictive Modeling: A Guide for the Machine Learning Engineer"  

---


As machine learning engineers focused on forecasting, we often live in a world of predictive accuracy. Our goal is to build models that generate the best possible predictions for future outcomes. However, to be well-rounded data scientists, it's vital to understand that prediction is just one facet of statistical modeling. In my work, I find it crucial to distinguish between **predictive modeling** and its counterpart, **explanatory modeling**, a distinction brilliantly detailed in Galit Shmueli's paper, "To Explain or to Predict?". This paper actively informs my approach to modeling.

This writing breaks down the fundamental differences between these two paradigms and clarifies the role of statistical tools, like p-values, within each.

***

### Explanatory vs. Predictive Modeling

The core difference lies in the **goal**. Explanatory modeling seeks to test causal theories and understand the *why*, while predictive modeling aims to accurately forecast *what* will happen, regardless of the underlying causal story. This fundamental difference in purpose creates a fork in the road that impacts every step of the modeling process.

---

#### **Theory & Causation vs. Data & Association**

In **explanatory modeling**, we start with a strong causal theory. Let's say a theory postulates that a theoretical construct $$\mathcal{Y}$$ is caused by a construct $$\mathcal{X}$$, which we can represent as:

$$\mathcal{Y} = \mathcal{F}(\mathcal{X})$$

Here, $$\mathcal{F}$$ represents the true, underlying causal relationship. Our job is to operationalize these abstract constructs into measurable variables, $$Y$$ and $$X$$, and then find a statistical model, $$f$$, that is the best possible representation of $$\mathcal{F}$$. The entire exercise is about using data to test hypotheses about $$\mathcal{F}$$. The focus is on **causation**.

In **predictive modeling**, the focus shifts dramatically. We are primarily interested in the measurable variables $$Y$$ and $$X$$ themselves, not necessarily the abstract constructs they might represent. Our goal is to find a function $$f$$ that produces the most accurate predictions of new $$Y$$ values, given new $$X$$ values. This function $$f$$ only needs to capture the **association** between $$X$$ and $$Y$$; it doesn't need to be an interpretable or causal model. This is why algorithmic "black box" methods, like neural networks, are perfectly acceptable and often superior in a predictive context.

---

#### **The Bias-Variance Trade-off**

This conceptual split has profound mathematical consequences, most clearly seen in the bias-variance trade-off. The expected prediction error (EPE) for a new observation, using a squared error loss, can be decomposed as follows:

$$EPE = E\{(Y - \hat{f}(x))^2\} = \underbrace{Var(Y)}_{\text{Irreducible Error}} + \underbrace{Bias(\hat{f}(x))^2}_{\text{Bias}} + \underbrace{Var(\hat{f}(x))}_{\text{Variance}}$$



* In **explanatory modeling**, the absolute priority is to minimize **bias**. We need our estimated model, $$\hat{f}(x)$$, to be the most accurate possible representation of the true underlying function, $$f(x)$$. We are willing to accept higher variance to get an unbiased estimate of the causal parameters.

* In **predictive modeling**, our goal is to minimize the total **EPE** (the combination of bias and variance). We are often willing to introduce some bias into our model if it leads to a larger reduction in variance, thereby improving overall predictive accuracy. This is precisely what regularization techniques do. As Shmueli's paper shows, a misspecified or "wrong" model can sometimes predict better than the "true" one if the data is noisy or the sample size is small.

---

### The Role of P-values in Our Forecasting Work

Given this distinction, where do familiar statistical tools like the **p-value** fit in? In explanatory modeling, p-values are essential for hypothesis testing—for example, determining if a variable has a statistically significant causal effect.

But in our work in forecasting, their role is highly questionable. As Rob Hyndman points out, using p-values for forecasting is generally not a good practice. While we could try to frame a null hypothesis, such as:

$$H_0: \text{The future observation } y_{T+h} \text{ is drawn from the forecast distribution } F_{T+h}$$

This approach is fraught with problems for several reasons:

* **Forecasting Isn't Hypothesis Testing:** Our primary goal is not to test a hypothesis but to fit a model that generates accurate predictions.
* **Unreliable Intervals:** Prediction intervals from forecasting models are often too narrow, as they fail to account for all sources of uncertainty (like model specification error). A test based on these intervals would not be well-calibrated.

* **Dependence:** Forecast errors are correlated over time, which violates the independence assumptions required for many statistical tests.

When a stakeholder asks us for p-values, it often indicates a background in inferential statistics rather than predictive modeling. It's our job to gently explain this distinction and steer the conversation toward more appropriate predictive metrics like Mean Absolute Error (MAE) or Root Mean Squared Error (RMSE) on a holdout set.

### Two Paths, Two Different Models: Real-World Examples

Shmueli's paper provides powerful examples that make these abstract distinctions concrete.

The **Netflix Prize** is a classic case of a purely predictive goal. The task was simple: predict user movie ratings with the highest accuracy possible. The winning teams didn't build elaborate causal models of movie preference. Instead, they used methods that are hallmarks of predictive modeling:
* **Non-interpretable data reduction**: Methods like Singular Value Decomposition (SVD) were key to success, even though the resulting components have no clear theoretical meaning.
* **Ensemble methods**: The best results came from blending multiple simpler models, a technique that prioritizes predictive power over interpretability.
* **Data over theory**: Interestingly, adding theoretically relevant data, like movie attributes (actors, director), often *decreased* the accuracy of a well-tuned predictive model. The association in the ratings data itself was more powerful.

Contrast this with typical **online auction research**, which has been dominated by explanatory modeling. An explanatory study trying to determine the factors affecting an auction's final price would be deeply concerned with theory. It might exclude the number of bidders as a predictor due to **endogeneity**—the idea that the number of bidders is itself determined by the auction's characteristics, creating a messy causal loop.

A predictive model, however, would have no such qualms. If my goal is simply to forecast the final price, and I know the number of bidders at a given time, I would absolutely use it as a predictor! It's a powerful signal, and in a predictive context, I don't need to worry about its causal interpretation. These two scenarios lead to completely different models built from the same data.

### Implications for Our Work

The failure to distinguish between explaining and predicting has real consequences. I see it as my responsibility to be aware of these pitfalls.

#### The Danger of Confusing R² with Predictive Power

A common mistake is to infer predictive power from a high R² or other in-sample goodness-of-fit measures. Shmueli points to numerous studies in fields from ecology to economics where researchers claim predictive power based on a high R² from a regression model, without performing any out-of-sample validation. This is a critical error. An explanatory model can fit the existing data perfectly but fail miserably at predicting new data. **True predictive power can only be assessed on a holdout set**.

#### Two Dimensions, Not a Single Spectrum

It's tempting to think of explanation and prediction as a simple trade-off, but Shmueli suggests a more nuanced view: they are **two separate dimensions**. Any given model has some level of explanatory power and some level of predictive accuracy.


The goal of a study should be determined upfront so the model can be optimized for the desired dimension. However, we should always evaluate and report on *both*. An explanatory model should still be tested for its predictive accuracy to check its real-world relevance, and a predictive model's relationship to theory should be discussed to help generate new hypotheses.

#### Our Responsibility as Practitioners

Ultimately, as statisticians and machine learning engineers, we have a responsibility to use our tools correctly and to advocate for their proper use. By clearly distinguishing between explaining and predicting, we can bridge the gap between academic research and practice, prevent the misuse of statistical methods, and contribute more effectively to both scientific knowledge and practical results.

### Reference
- [P-values for prediction intervals](https://robjhyndman.com/hyndsight/forecasting-pvalues.html)
- [To Explain or to Predict?](https://projecteuclid.org/journals/statistical-science/volume-25/issue-3/To-Explain-or-to-Predict/10.1214/10-STS330.full)