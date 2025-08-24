---
layout: single
author: Huijo
date: 2025-07-07
tags:
  - Machine Learning
classes: wide
title: "A Guide to Hierarchical Forecasting"
---

In many real-world scenarios, time series data follows a hierarchical or grouped structure where individual series must sum up to form aggregate series. For example:

- **E-commerce Demand:** Total demand for a product category (e.g., electronics) is the sum of demand for all products within it (e.g., laptops, smartphones, headphones).
- **Retail Sales:** National sales data aggregates from regional sales, which in turn sums up store-level sales.
- **Energy Consumption:** A country's total energy consumption is the sum of consumption across states, cities, and individual households.

When forecasting such collections, it is crucial that the forecasts are **coherent**—meaning the forecasts of the disaggregated components add up exactly to the forecasts of the aggregated series.

### Example: E-commerce Product Hierarchy

To make this more concrete, consider a company that sells electronics. Its sales data can be structured graphically as follows:

<div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; font-family: monospace;">
  <p style="margin: 0 0 10px 0;"><strong>Total Sales</strong></p>
  <div style="margin-left: 20px; padding-left: 15px; border-left: 1px solid #aaa;">
    <p style="margin: 0 0 10px 0;"><strong>Computers</strong></p>
    <div style="margin-left: 20px; padding-left: 15px; border-left: 1px solid #aaa;">
      <p style="margin: 0;">Laptop</p>
      <p style="margin: 5px 0 0 0;">Desktop</p>
    </div>
  </div>
  <div style="margin-left: 20px; padding-left: 15px; border-left: 1px solid #aaa; margin-top: 10px;">
    <p style="margin: 0 0 10px 0;"><strong>Smartphones</strong></p>
    <div style="margin-left: 20px; padding-left: 15px; border-left: 1px solid #aaa;">
      <p style="margin: 0;">Brand A</p>
      <p style="margin: 5px 0 0 0;">Brand B</p>
    </div>
  </div>
</div>
<br>

In this hierarchy, the following relationships must hold for the forecasts to be coherent:
- `Forecast(Laptop) + Forecast(Desktop) = Forecast(Computers)`
- `Forecast(Brand A) + Forecast(Brand B) = Forecast(Smartphones)`
- `Forecast(Computers) + Forecast(Smartphones) = Forecast(Total)`

This structure ensures that forecasts are consistent and can be meaningfully aggregated or disaggregated across the business.

Let's explore the primary methods for achieving coherent forecasts.

## 1. The Bottom-Up Approach

This is the simplest method. We first generate forecasts for each series at the very bottom level of the hierarchy. Then, we aggregate these forecasts upwards to produce forecasts for all other series in the structure.

The coherent forecasts, denoted by $$\tilde{\boldsymbol{y}}_{h}$$, are calculated as:

$$
  \tilde{\boldsymbol{y}}_{h} = \boldsymbol{S} \hat{\boldsymbol{b}}_{h}
$$ 

where $$\hat{\boldsymbol{b}}_{h}$$ is the vector of $$h$$-step-ahead forecasts for the bottom-level series, and $$\boldsymbol{S}$$ is the **summing matrix** that aggregates the bottom-level forecasts.

- **Pros:** No information is lost from the bottom-level series.
- **Cons:** Bottom-level data can be noisy, and this method ignores potentially valuable patterns at higher levels of aggregation.

## 2. Top-Down Approaches

Top-down methods involve forecasting the top-level series first and then disaggregating this forecast downwards. The disaggregation is done using a set of proportions $$\boldsymbol{p}$$ that distribute the total forecast among the bottom-level series. It's important to note that all top-down methods produce biased coherent forecasts.

Coherent forecasts are generated as:

$$  \tilde{\boldsymbol{y}}_h = \boldsymbol{S} \boldsymbol{p} \hat{y}_h $$

where $$\hat{y}_h$$ is the forecast for the top-level series. The proportions $$\boldsymbol{p}$$ determine how the top-level forecast is distributed. While historical proportions are common, a more dynamic method uses **forecast proportions**.

Here’s a breakdown of the different ways to calculate these proportions:

- **Average Historical Proportions:** Proportions are based on the average of historical percentages.
  $$  p_j = \frac{1}{T} \sum_{t=1}^{T} \frac{y_{j,t}}{y_t} $$

- **Proportions of Historical Averages:** Proportions are based on the ratio of historical averages.
  $$  p_j = {\sum_{t=1}^{T} \frac{y_{j,t}}{T}} \Big/ {\sum_{t=1}^{T} \frac{y_t}{T}} $$

- **Forecast Proportions:** This method addresses a key weakness of historical proportions: they don't account for how proportions might change in the future. The idea is to use forecasts of the series themselves to determine the proportions.

  The process is as follows:
  1. Generate independent, "initial" forecasts for all series in the hierarchy for a future time $$h$$.
  2. Calculate proportions by taking the forecast of each series and dividing it by the sum of forecasts at that same level.
  3. Use these proportions to disaggregate the top-level forecast downwards.

  For a bottom-level series $$j$$, the forecast proportion $$p_j$$ is calculated from the initial forecasts (denoted with a hat, $$\hat{y}$$):

  $$  p_j = \frac{\hat{y}_{j,h}}{\sum_{i} \hat{y}_{i,h}} $$

  This approach allows the disaggregation to adapt to expected future trends, often leading to more accurate forecasts at lower levels.

- **Pros:** Top-down methods are simple and reliable for aggregate levels. Using forecast proportions can improve accuracy at lower levels compared to historical proportions.
- **Cons:** These methods can still misrepresent complex dynamics at lower levels, and forecast accuracy is highly dependent on the accuracy of the top-level forecast.

## 3. The Middle-Out Approach

This hybrid approach combines the bottom-up and top-down methods. We first select a "middle level" in the hierarchy and generate forecasts for all series at this level.

- For series **above** the middle level, we aggregate the forecasts upwards (a bottom-up approach).
- For series **below** the middle level, we disaggregate the forecasts downwards (a top-down approach).

- **Pros:** Offers a balance between the top-down and bottom-up approaches.
- **Cons:** The choice of the optimal middle level can be challenging.

## 4. Optimal Reconciliation

Optimal reconciliation offers a more sophisticated approach. Instead of restricting how we forecast, we first generate independent "base" forecasts for every series in the hierarchy. These forecasts, $$\boldsymbol{y}_h$$, are typically incoherent. We then use a mathematical process to adjust them so that they become coherent and the overall forecast error is minimized.

### The Reconciliation Framework

All reconciliation methods can be described by a single equation:

$$  \tilde{\boldsymbol{y}}_h = \boldsymbol{S} \boldsymbol{G} \hat{\boldsymbol{y}}_h $$

Where:

- $$\tilde{\boldsymbol{y}}_h$$ is the final vector of coherent forecasts.
- $$\boldsymbol{y}_h$$ is the vector of initial, incoherent base forecasts.
- $$\boldsymbol{S}$$ is the **summing matrix**, which defines the aggregation structure of the hierarchy.
- $$\boldsymbol{G}$$ is a **mapping matrix** that dictates how the base forecasts are adjusted and combined. The choice of $$\boldsymbol{G}$$ defines the reconciliation method (bottom-up, top-down, etc.).

### Finding the Optimal Solution

The goal of optimal reconciliation is to find the matrix $$\boldsymbol{G}$$ that makes the coherent forecasts as close as possible to the true (unknown) future values. This is achieved by minimizing the total variance of the reconciled forecast errors. This method is called **Minimum Trace (MinT) Reconciliation**.

The optimal solution for the reconciled forecasts is given by:

$$  \tilde{\boldsymbol{y}}_h = \boldsymbol{S} (\boldsymbol{S}' \boldsymbol{W}_h^{-1} \boldsymbol{S})^{-1} \boldsymbol{S}' \boldsymbol{W}_h^{-1} \hat{\boldsymbol{y}}_h $$

Here, $$\boldsymbol{W}_h$$ is the covariance matrix of the base forecast errors. It captures the uncertainty of and relationships between the independent forecasts.

Since $$\boldsymbol{W}_h$$ is unknown, it must be estimated. Common approaches include:

1. **OLS (Ordinary Least Squares):** Assumes the errors are uncorrelated and have equal variance. This is the simplest but often unrealistic. This approach is equivalent to fitting a linear regression model of the base forecasts on the summing matrix.
2. **WLS (Weighted Least Squares):** Accounts for differences in error variance between the series, typically by using the variance of the historical model residuals.
3. **Full Covariance (MinT):** Estimates the full covariance matrix $$\boldsymbol{W}_h$$, often using a shrinkage estimator to stabilize the result. This is the most comprehensive but also the most complex method.

- **Pros:** Statistically optimal and produces unbiased forecasts (unlike top-down methods). It effectively uses information from all levels of the hierarchy.
- **Cons:** Can be significantly more complex and computationally intensive, especially for very large hierarchies.

## Final remark

A proper understanding of customer needs is absolutely critical to construct an accurate **hierarchical forecast**. This is one of the challenges I faced.

**every department needs the same data, but aggregated in a completely different way**: Reconciling these conflicting views into one coherent system is incredibly complex.

For example:
*   The **manufacturing team** needs a **granular, SKU-level** forecast to schedule production lines.
*   A **salesperson** needs a **customer-centric** forecast for their key accounts.
*   The **marketing team** requests a **brand-level** forecast to measure campaign impact.
*   The **distribution center (warehouse)** requires a **location-specific** forecast for all SKUs to manage capacity and staffing.
*   The **finance department** only cares about the **top-level, aggregated** forecast for revenue planning.

The biggest technical struggle is ensuring **consistency**. The sum of all the store-level forecasts must match the warehouse forecast, and the sum of all brand forecasts must match the company total that finance uses. If they don't, the entire plan falls apart, leading to mistrust in the data.

In short, the main challenge is never just about predicting demand. It was about building a single, unified forecast that could be accurately broken down and rolled up across every **product, customer, and geographical hierarchy**—all while keeping every stakeholder happy.

## Reference

- [Forecasting: Principles and Practice (3rd ed), Rob J Hyndman and George Athanasopoulos](https://otexts.com/fpp3/hierarchical.html)
- [Huijo's Hierarchical Forecast Notebook](https://github.com/ccomkhj/ScienceNote/blob/main/ml_hierarchical_forecast.ipynb)
- [Optimally Reconciling Forecasts in a Hierarchy](https://robjhyndman.com/papers/Foresight-hts-final.pdf)
