---
layout: single  
author: Huijo  
date: 2025-8-18
tags:
   - Machine Learning
   - Mathematics
classes: wide  
title: "Statistical Modeling and Objective function"

---

Through my forecasting journey, I’ve had the chance to work on a fascinating range of industrial forecasting problems—from predicting strawberry yields for agricultural firms and forecasting inventory demand for spare parts, to modeling energy consumption for utility grids. Through these projects, I've learned a crucial lesson that's often overlooked in introductory courses: your model is only as good as its loss function, and the default choice is often the wrong one.

We all start by learning to use Mean Squared Error (MSE) for our regression tasks. It's simple, intuitive, and the default in most libraries. But blindly applying it to every problem is like trying to use a hammer for every job in a toolbox. For many real-world industrial cases, it's a critical mistake. Let's explore why.

***

## The Default: MSE and its Hidden Assumption

When you train a Gradient Boosting model (or almost any regression model) using **Mean Squared Error (MSE)** as the loss function, you're doing more than just penalizing large errors. You are implicitly making a powerful statistical assumption: **that the errors of your model will follow a Normal (or Gaussian) distribution**.



![Normal Distribution Bell Curve](https://www.simplypsychology.org/wp-content/uploads/normal-distribution.jpg "Normal Distribution Bell Curve")


This assumption works perfectly fine for certain problems. In my work with **energy demand forecasting**, the target variable (megawatt-hours) is continuous and typically high-volume. The demand curve is smooth, and the errors tend to cluster symmetrically around zero. In this scenario, the Normal distribution is a reasonable approximation of reality, and MSE is an excellent choice. It aggressively penalizes large deviations, pushing the model to be accurate for this high-stakes task.

But what happens when the data doesn't look like a nice, continuous bell curve?

***

## When the Default Fails: The World of Count Data

Now, let's consider my projects on **inventory demand** and **strawberry yield forecasting**. Here, the target variable is fundamentally different.
* You can't sell 2.43 spare parts.
* A farmer counts 5 ripe strawberries, not 5.7.

This is **count data**. It's discrete, non-negative, and often full of zeros. This is especially true for intermittent demand in inventory management, where a specific part might not be sold for days or weeks, followed by a sudden sale.

If you use MSE on this type of data, you're asking your model to play by the wrong rules. The model might predict negative sales (-0.5 units) or fractional demand (1.25 units), which is nonsensical in the real world. This mismatch between the model's assumption (Normal distribution) and the data's reality (a discrete count process) leads to poor performance and unreliable forecasts.

***

## The Right Tools for the Job: Poisson & Negative Binomial

To correctly model count data, we need loss functions derived from distributions designed for counts. This is where the **Poisson** and **Negative Binomial** distributions come in.

### Poisson: The Go-To for Simple Counts

The **Poisson distribution** models the probability of a number of events happening in a fixed interval. It's perfect for data that consists of non-negative integer counts.

By setting the objective function in my GBDT to `poisson`, I'm no longer just predicting a value; I'm telling the model to predict the *rate* ($\lambda$) of an event. I'm aligning the model's objective with the data's true nature. This immediately prevents predictions of negative values and grounds the model in the reality of a counting process.

### Negative Binomial: For Messy, Real-World Counts

The Poisson distribution has one strict limitation: it assumes the **mean and the variance of the data are equal**. In my experience, real-world data is rarely this well-behaved.

Take **inventory demand**, for example. The average demand for a part might be 0.2 units per day, but when a sale occurs, it could be for 5 units. This "lumpy" demand is highly variable. This phenomenon, where the variance is much larger than the mean, is called **over-dispersion**.

This is where the **Negative Binomial distribution** shines. It's a count data distribution like Poisson, but it has an extra parameter that allows the variance to be greater than the mean. Using a Negative Binomial loss function (or a `tweedie` objective in many libraries) gives the model the flexibility to handle this spiky, over-dispersed data, leading to far more accurate and stable forecasts for lumpy demand patterns.

***

## Come on, what the relation between objective function and statistcal modeling?

*The Connection Between Statistical Distributions and Loss Functions via MLE*

Maximum Likelihood Estimation (MLE) is a foundational principle that bridges the gap between a statistical assumption and a practical optimization problem. It allows us to define an objective function for a machine learning model by determining the parameters that make the observed data most probable under a given statistical distribution.

## 1. The Core Idea of MLE

At its heart, MLE seeks to find the set of model parameters ($$\theta$$) that maximizes the likelihood of observing the data ($$X$$) we have. The likelihood function, $$L(\theta|X)$$, is defined as the probability of the data given the parameters:

$$
L(\theta|X) = P(X|\theta)
$$

For independent and identically distributed (i.i.d) data points ($$x_1, x_2, ..., x_n$$), the joint probability is the product of the individual probabilities:

$$
L(\theta|X) = \prod_{i=1}^n P(x_i|\theta)
$$

Maximizing this likelihood function is the goal of MLE.

## 2. The Practical Step: From Likelihood to Loss

Working with products can be computationally unstable and difficult to optimize. For this reason, we take two crucial steps:

1. **Log-Likelihood**: We take the natural logarithm of the likelihood function. The logarithm is a monotonically increasing function, so maximizing the log-likelihood is equivalent to maximizing the likelihood. This step turns the product into a sum, which is much easier to work with.

$$
\log L(\theta|X) = \sum_{i=1}^n \log P(x_i|\theta)
$$

2. **Negative Log-Likelihood**: Most optimization algorithms are built to find a minimum, not a maximum. By taking the negative of the log-likelihood, we transform our maximization problem into a minimization problem. Minimizing the negative log-likelihood is the core objective.

$$
\text{Minimize } -\log L(\theta|X) = -\sum_{i=1}^n \log P(x_i|\theta)
$$

The final expression derived from the negative log-likelihood becomes the model's objective function or loss function.

## 3. A Concrete Example: Normal Distribution and MSE

Let's assume our data's errors follow a Normal (Gaussian) distribution with a mean of zero and some standard deviation ($$\sigma$$). The probability density function (PDF) of a single data point ($$x_i$$) is:

$$
P(x_i|\theta) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(y_i - \hat{y}_i)^2}{2\sigma^2}}
$$

Where $$y_i$$ is the actual value and $$\hat{y}_i$$ is the model's prediction. The difference ($$y_i - \hat{y}_i$$) represents the error.

Now, let's apply the two practical steps to find the loss function:

1. **Log-Likelihood**:

$$
\log P(x_i|\theta) = \log\left(\frac{1}{\sqrt{2\pi\sigma^2}}\right) - \frac{(y_i - \hat{y}_i)^2}{2\sigma^2}
$$

For the entire dataset, the log-likelihood is a sum of these terms.

2. **Negative Log-Likelihood**:

$$
-\sum_{i=1}^n \log P(x_i|\theta) = -\sum_{i=1}^n \left[\log\left(\frac{1}{\sqrt{2\pi\sigma^2}}\right) - \frac{(y_i - \hat{y}_i)^2}{2\sigma^2}\right]
$$

$$
= \sum_{i=1}^n \frac{(y_i - \hat{y}_i)^2}{2\sigma^2} + \text{constant}
$$

Since $$\sigma^2$$ is a constant, minimizing this expression is equivalent to minimizing the first term, which is the sum of squared errors. When we average this sum, we get the Mean Squared Error (MSE).

$$
\text{MSE} = \frac{1}{n} \sum_{i=1}^n (y_i - \hat{y}_i)^2
$$

This shows that by assuming a Normal distribution for the errors, the principle of MLE leads directly to the MSE loss function. The same logic applies to other distributions and their corresponding loss functions.