---

layout: single  
author: Huijo  
date: 2025-07-07
tags:  
   - Machine Learning
classes: wide  
title: "Hierarchical Forecasting"
---


## Forecasting Large Collections of Time Series with Aggregation Constraints
In many real-world scenarios, time series data follows a hierarchical or grouped structure where individual series must sum up to form aggregate series. For example:

- Retail Sales: Store-level sales sum to regional sales, which in turn sum to national sales.

- Energy Demand: Household electricity consumption aggregates to city-level, then state-level, and finally country-level demand.

- Transportation: Passenger counts on individual routes aggregate to total passengers per airline or airport.

When forecasting such collections, we want the forecasts to be coherent—meaning that the forecasts of the disaggregated components add up exactly to the forecasts of the aggregated series.


## The Challenge of Coherent Forecasting
If we forecast each series independently (called "bottom-up" or "unconstrained" forecasting), the forecasts may not satisfy the aggregation constraints. For example:

Suppose Store A’s forecast is 100 units and Store B’s forecast is 150 units.

If we independently forecast the Region (A + B) as 260 units, we have an incoherence (100 + 150 ≠ 260).

This leads to impractical or illogical forecasts for decision-making.


## Approaches to Ensure Coherence

1. Bottom-Up Forecasting
Forecast only the most disaggregated series (e.g., individual stores).

Aggregate these forecasts to get higher-level forecasts.

Pros: Simple, no reconciliation needed.

Cons: Ignores patterns at higher levels, which may be more stable.

2. Top-Down Forecasting
Forecast the top-level series (e.g., total national sales).

Disaggregate using historical proportions (e.g., if Store A was 40% of sales last year, assign 40% of the forecast).

Pros: Captures top-level trends well.

Cons: May misrepresent lower-level dynamics.

3. Middle-Out Forecasting
Forecast at an intermediate level (e.g., regional sales).

Aggregate upwards and disaggregate downwards.

Balances top-down and bottom-up approaches.

4. Optimal Reconciliation (MinT, OLS, etc.)
Forecast all series independently (possibly using machine learning or statistical models).

Use a **reconciliation method** to adjust forecasts so they satisfy aggregation constraints.

Techniques include:

OLS Reconciliation: Minimizes squared errors while enforcing constraints.

Minimum Trace (MinT) Reconciliation: Accounts for forecast error covariance.

Pros: Flexible, can leverage information at all levels.

Cons: Computationally intensive for large hierarchies.