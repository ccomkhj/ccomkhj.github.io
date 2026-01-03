---
layout: single
author: Huijo
date: 2024-12-31
tags:
   - Machine Learning
classes: wide
title: Conformal Prediction
---

## The Concept of Conformal Prediction

**Conformal Prediction** is a technique used to create prediction intervals that are statistically valid, providing rigorous uncertainty quantification beyond heuristic methods. It presents distribution-free, non-asymptotic guarantees of interval validity, usable with any machine learning model.

## What is Conformalized Quantile Regression?

**Conformalized Quantile Regression** improves traditional quantile regression by combining it with conformal prediction to produce prediction intervals with guaranteed coverage. This is especially useful in regression with continuous outputs where uncertainty quantification matters.

## Fundamentals of Quantile Regression

Quantile regression estimates conditional quantiles of a response variable (e.g., the median or the 90th percentile) given predictors. Unlike mean regression, it characterizes the entire distribution of possible outcomes.

### The Pinball Loss Function

The central tool for this estimation is the **pinball loss**. For a quantile level $\gamma$ where $0 < \gamma < 1$, the loss is defined as:

$$
L_{\gamma}(\hat{t}_{\gamma}, y) = (\gamma - \mathbf{1}_{\{y < \hat{t}_{\gamma}\}})(y - \hat{t}_{\gamma})
$$

where $y$ is the observed target and $\hat{t}_{\gamma}$ is the predicted $\gamma$-quantile.

---

> ### 💡 Understanding the Intuition
> 
> The indicator term $$\mathbf{1}_{\{y < \hat{t}_{\gamma}\}}$$ splits the loss into two distinct cases, creating an asymmetric penalty:
>
> #### Case 1: Underprediction ($y \ge \hat{t}_{\gamma}$)
> In this case, $$\mathbf{1}_{\{y < \hat{t}_{\gamma}\}} = 0$$. The loss simplifies to:
> $$L_{\gamma}(\hat{t}_{\gamma}, y) = \gamma (y - \hat{t}_{\gamma})$$
> *The error is weighted by $\gamma$.*
>
> #### Case 2: Overprediction ($y < \hat{t}_{\gamma}$)
> In this case, $$\mathbf{1}_{\{y < \hat{t}_{\gamma}\}} = 1$$. The loss simplifies to:
> $$L_{\gamma}(\hat{t}_{\gamma}, y) = (1-\gamma)(\hat{t}_{\gamma} - y)$$
> *The error is weighted by $$(1-\gamma)$$.*
>
> #### Summary: Why This Produces Quantiles
> By minimizing the expected pinball loss, the model is forced to find the point where the probability of being below the prediction is exactly $$\gamma$$:
> - **High $$\gamma$$ (e.g., 0.9):** Underprediction is very expensive, so the model predicts a high value.
> - **Low $$\gamma$$ (e.g., 0.1):** Overprediction is expensive, so the model predicts a low value.
> - **$$\gamma = 0.5$$:** Becomes proportional to absolute error, yielding the **median**.

---

## Conformalized Quantile Regression (CQR)

The innovation of CQR lies in adjusting the raw quantile estimates to incorporate conformal prediction guarantees. 

### The CQR Adjustment
First, we calculate the scores on a **calibration set**:
$$
s(x,y) = \max \{ \hat{t}_{\alpha/2}(x) - y, y - \hat{t}_{1-\alpha/2}(x) \}
$$

Then, we find the conformal quantile:
$$
\hat{q} = \text{Quantile} \left( s_1, \dots, s_n; \frac{\lceil (n+1)(1-\alpha) \rceil}{n} \right)
$$

Finally, the **statistically valid prediction interval** is formed:
$$
C(x) = [\hat{t}_{\alpha/2}(x) - \hat{q}, \hat{t}_{1-\alpha/2}(x) + \hat{q}]
$$

## Conformal Prediction in Time-Series

Time-series data consist of sequential observations recorded over time. Unlike independent and identically distributed (i.i.d.) data, time-series datasets exhibit dependencies and correlations between observations due to their sequential nature. This intrinsic characteristic makes them particularly challenging for prediction tasks, as traditional models often assume i.i.d. data.

#### Managing Uncertainty in Time-Series Data

Because time-series data are not i.i.d., traditional predictive models can struggle to maintain accuracy over time, especially in the presence of distribution drift or autocorrelation. The dependence structure in time-series data means that past observations can heavily influence future ones, complicating the modeling process.

Conformal prediction addresses this challenge by adjusting prediction intervals to account for such dependencies. By incorporating weights to emphasize more recent observations, conformal prediction ensures statistically valid and reliable intervals, adapting to changes in data distribution over time. This method offers robust predictive capabilities despite the non-i.i.d. nature of time-series data, guaranteeing accurate interval validity under challenging conditions.

### Example: Time-Series Temperature Prediction

Let's introduce the temperature prediction of various locations on Earth using covariates like latitude, longitude, altitude, and atmospheric pressure. These predictions are made sequentially over time. The dependencies between nearby data points, caused by local and global weather changes, violate the standard exchangeability assumption.

Consider a time-series dataset denoted as $$\{(X_t, Y_t)\}_{t=1}^{T}$$, where $$X_t$$ are tabular covariates and $$Y_t \in \mathbb{R}$$ are temperatures in degrees Celsius. It is critical to note that these data points are neither exchangeable nor i.i.d.; they exhibit correlation among adjacent data points.

We begin with a pretrained model $$\hat{f}$$ that takes features and predicts temperature, and an uncertainty model $$\hat{u}$$ that also takes features and outputs a scalar measure of uncertainty. Following the conformal scores:

$$
s_t = \frac{|Y_t - \hat{f}(X_t)|}{\hat{u}(X_t)}.
$$

As we observe data points sequentially, we observe the scores sequentially as well. Thus, a different conformal quantile must be selected for each incoming data point. Mathematically, to predict the temperature at time $t \leq T$, we employ the weighted conformal technique with a fixed window size $$K$$, where $$w_{t'} = 1\{t' \geq t-K\}$$ for all $$t' < t$$. This yields the quantiles:

$$
\hat{q}_t = \inf \left\{ q : \frac{1}{\min(K, t' - 1) + 1} \sum_{t'=1}^{t-1} s_{t'} 1\{t' \geq t-K\} \geq 1 - \alpha \right\}.
$$

With these adjusted quantiles, prediction sets at each time step are formed as:

$$
C(X_t) = \left[ \hat{f}(X_t) - \hat{q}_t \hat{u}(X_t), \hat{f}(X_t) + \hat{q}_t \hat{u}(X_t) \right].
$$

This approach to managing uncertainty leverages the adaptability of conformal predictions, ensuring accuracy and reliability in interval predictions despite the complex, dependent nature of time-series data. As an AI researcher focusing on time series, this methodology exemplifies how to deal with non-i.i.d. challenges effectively.

## Distinguishing From Confidence Intervals

While **confidence intervals** provide estimates of parameter uncertainty from samples assuming certain statistical properties, conformal prediction intervals focus on the accuracy of individual predictions without such assumptions. Unlike confidence intervals, which concern parameter estimation, conformal intervals adjust dynamically to include the true outcome given any set of features, thereby offering more flexible and broader applicability.

## Conclusion

Conformalized Quantile Regression and its applications in time-series datasets serve as powerful tools for managing uncertainty in prediction intervals. With the growing emphasis on data-driven decision making, employing such advanced statistical techniques ensures more credible and resilient predictions.

Through effective integration of conformal prediction, analysts and data scientists can achieve more reliable outcomes when dealing with the complexities of real-world data scenarios.

### Sample code to start with
```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor

# Set the random seed for reproducibility
np.random.seed(42)

# Generate a more controlled nonlinear dataset with varying noise
X = np.random.uniform(-3, 3, size=(300, 1)).flatten()
y = np.sin(1.5 * X) + 0.5 * X

# Introduce heteroscedasticity: noise depends on the range of X
noise = np.where(X < 0, np.random.normal(0, 0.1, size=300), np.random.normal(0, 0.3, size=300))
y += noise

# Split data into training, calibration, and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
X_calib, X_test, y_calib, y_test = train_test_split(X_test, y_test, test_size=0.5, random_state=42)

# Quantile regression setup for quantiles using GradientBoostingRegressor
quantiles = [0.1, 0.5, 0.9]
models = {}

# Fit gradient boosting quantile regression models
for q in quantiles:
    gbr = GradientBoostingRegressor(loss='quantile', alpha=q, n_estimators=100, max_depth=3, random_state=42)
    gbr.fit(X_train.reshape(-1, 1), y_train)
    models[q] = gbr

# Get predictions for the test set
predictions = {q: models[q].predict(X_test.reshape(-1, 1)) for q in quantiles}

# Calculate conformal quantile adjustment for 90% coverage
residuals = np.abs(y_calib - models[0.5].predict(X_calib.reshape(-1, 1)))
q_hat = np.quantile(residuals, 0.9)

# Create conformal prediction intervals
y_lower = predictions[0.1] - q_hat
y_upper = predictions[0.9] + q_hat

# Sort X_test and corresponding predictions for plotting
sorted_indices = np.argsort(X_test)
X_test_sorted = X_test[sorted_indices]
y_test_sorted = y_test[sorted_indices]
predictions_sorted = {q: predictions[q][sorted_indices] for q in quantiles}
y_lower_sorted = y_lower[sorted_indices]
y_upper_sorted = y_upper[sorted_indices]

# Plotting results
plt.scatter(X_test_sorted, y_test_sorted, color='black', label='True Values', alpha=0.6)
plt.plot(X_test_sorted, predictions_sorted[0.5], color='blue', label='Median Prediction')
plt.fill_between(X_test_sorted, y_lower_sorted, y_upper_sorted, color='orange', alpha=0.4, label='90% Prediction Interval')
plt.xlabel('X')
plt.ylabel('y')
plt.title('Conformalized Quantile Regression with Decision Trees')
plt.legend()
plt.show()

# Evaluate the prediction interval
coverage = np.mean((y_test >= y_lower) & (y_test <= y_upper))
print(f"Coverage of the prediction interval: {coverage * 100:.2f}%")
```