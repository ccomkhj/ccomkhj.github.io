---

layout: single  
author: Huijo  
date: 2025-07-18
tags:  
   - Math
   - Machine Learning
classes: wide  
title: "Hilbert Spaces in Time Series"  

---

> **Note:** This post is mainly written with deep research.

### 1. Introduction: The Theoretical Bedrock of Forecasting
In time series analysis, a fundamental goal is to produce the best possible forecast given a set of historical data. The concept of "best" is formally defined as the forecast that minimizes the mean square error (MSE). The theoretical framework that provides the rigorous foundation for this minimization problem, particularly for linear models, is rooted in the geometry of **Hilbert spaces** and the powerful Projection Theorem.

This writing explains this theoretical foundation, details its application in creating the best linear predictor, and, crucially, clarifies its relevance—and limitations—when comparing classical statistical models like ARIMA with modern machine learning methods like Gradient Boosting Decision Trees (GBDT).

### 2. The Foundation: Hilbert Spaces and the Projection Theorem
A solid understanding of forecasting begins with the mathematical space in which time series data **live**.

#### Hilbert Space of Random Variables
In time series analysis, we often work with the space of random variables that have a finite second moment ($$E[X^2] < \infty$$). This set forms a Hilbert space, which is a complete vector space equipped with an inner product. This space is often denoted as $$L^2$$.

The inner product between two random variables $$X$$ and $$Y$$ in this space is defined as their expected product:

$$\langle X, Y \rangle = E[XY]$$

This inner product induces a norm (or "length") for a random variable, which corresponds to the square root of its mean square value:

$$|X| = \sqrt{\langle X, X \rangle} = \sqrt{E[X^2]}$$

The distance between two random variables is then$$|X - Y| = \sqrt{E[(X - Y)^2]}$$
which is precisely the root mean square error (RMSE).
Therefore, minimizing the MSE is equivalent to minimizing the squared distance in this Hilbert space.

#### The Projection Theorem
The Projection Theorem is the cornerstone that connects Hilbert space geometry to optimal forecasting. As detailed in texts like Shumway & Stoffer's *Time Series Analysis and Its Applications*, the theorem states:

> For any closed subspace $$\mathcal{M}$$ of a Hilbert space $$\mathcal{H}$$ and any vector $$Y \in \mathcal{H}$$, there exists a unique vector $$\hat{Y} \in \mathcal{M}$$ that is closest to $$Y$$. This $$\hat{Y}$$ is the **orthogonal projection** of $$Y$$ onto $$\mathcal{M}$$ and satisfies:
> 
> $$|Y - \hat{Y}| \le |Y - Z| \quad \text{for all } Z \in \mathcal{M}.$$
>
> Furthermore, the vector $$\hat{Y}$$ is the orthogonal projection if and only if the error vector, $$(Y - \hat{Y})$$, is orthogonal to every vector in the subspace $$\mathcal{M}$$. That is:
> 
> $$\langle Y - \hat{Y}, Z \rangle = 0 \quad \text{for all } Z \in \mathcal{M}.$$

In forecasting terms, this means:

- **$$Y$$**: The future value we want to predict (e.g., $$Y_{t+h}$$).
- **$$\mathcal{M}$$**: The subspace representing all available information, typically spanned by linear combinations of past observations (e.g., $$Y_t, Y_{t-1}, \dots$$).
- **$$\hat{Y}$$**: The forecast, which is the Best Linear Predictor (BLP). It is the vector within our information space $$\mathcal{M}$$ that minimizes the MSE to the true value $$Y$$.
- **Orthogonality Condition**: The forecast error $$(Y - \hat{Y})$$ must be uncorrelated with all the information used to make the forecast. This is a critical property for model diagnostics.

### 3. Use Case Analysis: Datasets and Model Implications
The relevance of this framework becomes clear when we examine what kinds of data and models it applies to.

#### Use Case 1: What Kind of Dataset is Best Suited?
The Hilbert space framework is most directly applicable to stationary or trend-stationary time series where the underlying dependency structure is assumed to be linear.

- **Stationary Time Series**: For a series where the mean, variance, and autocorrelation are constant over time, we can model a future value as a fixed linear combination of past values. The Projection Theorem guarantees that an optimal set of linear coefficients exists. This is the classic setting for ARMA models.
- **Non-Stationary Series with Differencing**: For integrated series like random walks (e.g., stock prices, economic aggregates), we first apply differencing to achieve stationarity. The Hilbert space framework then applies to the resulting stationary series ($$\nabla Y_t = Y_t - Y_{t-1}$$).
- **State-Space Models and Kalman Filtering**: The Kalman filter, used extensively in dynamic linear models, is a recursive algorithm that is fundamentally a sequential application of the Projection Theorem. At each time step, it updates the forecast by projecting the new state onto the subspace expanded by a new observation.
- **Series with Long-Range Dependence**: Even when dependencies are complex and long-lasting, as long as they are linear, the Projection Theorem provides the theoretical justification for finding the BLP.

#### Use Case 2: Implications for Different Forecasting Models
The connection between theory and practice varies dramatically across different model families.

###### A. Linear Regression and ARIMA Models
These models are direct applications of the Projection Theorem.

- **Linear Models**: Finding the ordinary least squares (OLS) coefficients in a linear regression is geometrically equivalent to finding the orthogonal projection of the dependent variable onto the subspace spanned by the independent variables. The Hilbert space framework proves that OLS provides the best linear unbiased estimator under its standard assumptions.
- **ARIMA Models**: An autoregressive (AR) model, $$Y_t = \sum_{j=1}^p \phi_j Y_{t-j} + e_t$$, explicitly seeks the BLP of $$Y_t$$ within the subspace spanned by $$Y_{t-1}, \dots, Y_{t-p}$$. The orthogonality condition, $$E[(Y_t - \hat{Y}_t) Y_{t-k}] = 0$$, leads directly to the Yule-Walker equations, which are used to solve for the optimal AR coefficients ($$\phi_j$$). The Hilbert space theory guarantees that for a stationary process, this predictor is unique and optimal in the MSE sense.

In summary, for linear models and ARIMA, the Hilbert space framework is not just relevant—it is the fundamental theory that justifies their entire existence and methodology.

###### B. Gradient Boosting Decision Trees (GBDT) - e.g., LightGBM
GBDT models operate on a completely different paradigm. They are not based on the Hilbert space Projection Theorem.

- **Mechanism**: GBDTs are non-linear, data-adaptive ensemble models. They work by iteratively building a series of simple decision trees, where each new tree is trained to correct the errors (specifically, the negative gradient of the loss function) of the previous ones.
- **Linearity**: They are inherently non-linear. Decision trees capture interactions, threshold effects, and non-linear patterns that linear models cannot. A GBDT does not create a single linear projection; it builds a complex, additive function.
- **Optimization**: While the goal is often to minimize MSE, the method is not an orthogonal projection. It is a form of functional gradient descent—a greedy, iterative search for a function that minimizes the loss.

**When is the Hilbert Space Framework Still Relevant for GBDT?**
While GBDT does not use the framework, the concepts remain useful for context:

- **Shared Goal**: Understanding MSE minimization as finding the closest point in a space helps contextualize what GBDT is attempting to do, even if its **space** of possible functions is much larger and its search method is different.
- **Hybrid Models**: In an ARIMA + GBDT hybrid model, the ARIMA component is first fit to capture the linear structure (relying on projection theory). The GBDT is then trained on the residuals (the part of the series that the linear model couldn't explain) to capture the remaining non-linear patterns.

### 4. Conclusion: A Tale of Two Paradigms

| Aspect                  | ARIMA / Linear Models                          | LightGBM (GBDT)                                |
|-------------------------|-----------------------------------------------|-----------------------------------------------|
| Theoretical Basis       | Hilbert Space, Projection Theorem             | Gradient Boosting, Decision Trees, Statistical Learning |
| Linearity               | Strictly Linear                               | Inherently Non-Linear                         |
| Method                  | Solves for optimal coefficients via orthogonal projection | Iteratively minimizes loss with an ensemble of trees |
| Best For                | Stationary data with clear linear dependencies | Complex, non-linear patterns and feature interactions |
| Interpretability        | High (coefficients have direct meaning)       | Low ("black-box," though SHAP values can provide insight) |

In conclusion:

- The Hilbert space framework is essential for a deep, theoretical understanding of linear forecasting methods like ARIMA. It provides the mathematical guarantee that the Best Linear Predictor exists, is unique, and can be found by satisfying the orthogonality condition.
- GBDT and other advanced ML models do not use this framework. They rely on iterative optimization and function approximation to tackle forecasting problems, often outperforming linear models when the underlying data-generating process is non-linear.

For a practitioner, the choice depends on the data and the goal. For a series that is largely linear and requires interpretability, ARIMA is a theoretically sound choice. For a complex series where predictive accuracy is paramount, GBDT is a powerful tool. The Hilbert space framework provides the clear, theoretical line that separates these two powerful, but fundamentally different, approaches to forecasting.

Check out the [GitHub repository](https://github.com/ccomkhj/ScienceNote/blob/main/math_hilbert_space.ipynb) for the code and examples for better understanding.