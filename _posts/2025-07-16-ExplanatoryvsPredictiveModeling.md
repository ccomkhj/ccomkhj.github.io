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

### Conclusion

Embracing the distinction between explaining and predicting has made my work more rigorous. It clarifies why we choose certain algorithms, how we evaluate them, and what conclusions we can legitimately draw. While our main job as forecasting engineers is **prediction**, understanding the principles of **explanation** gives us a more complete picture of the data science landscape and helps us use our tools more effectively.

### Reference
- [P-values for prediction intervals](https://robjhyndman.com/hyndsight/forecasting-pvalues.html)
- [To Explain or to Predict?](https://projecteuclid.org/journals/statistical-science/volume-25/issue-3/To-Explain-or-to-Predict/10.1214/10-STS330.full)