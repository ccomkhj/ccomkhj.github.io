---
layout: single
author: Huijo
date: 2024-07-17
permalink: /blog
tags:
   - Study
classes: wide
title:  Statistics 1
---

### State Population and Murder Rates

Here's a look at the population and murder rates for some US states:

| State       | Population | Murder Rate |
| ----------- | ---------- | ----------- |
| Alabama     | 4,779,736  | 5.7         |
| Alaska      | 710,231    | 5.6         |
| Arizona     | 6,392,017  | 4.7         |
| Arkansas    | 2,915,918  | 5.6         |
| California  | 37,253,956 | 4.4         |
| Colorado    | 5,029,196  | 2.8         |
| Connecticut | 3,574,097  | 2.4         |
| Delaware    | 897,934    | 5.8         |

### Variability Estimates of State Population Data

Using R’s built-in functions, we can compute estimates of variability for the state population data:

```r
> sd(state[["Population"]])
[1] 6848235
> IQR(state[["Population"]])
[1] 4847308
> mad(state[["Population"]])
[1] 3849870
```

The standard deviation is almost twice as large as the MAD (in R, by default, the scale of the MAD is adjusted to be on the same scale as the mean). This is not surprising since the standard deviation is sensitive to outliers.

### Self-Selection Sampling Bias

The reviews of restaurants, hotels, cafes, and so on that you read on social media sites like Yelp are prone to bias because the people submitting them are not randomly selected; rather, they themselves have taken the initiative to write. This leads to self-selection bias — the people motivated to write reviews may be those who had poor experiences, may have an association with the establishment, or may simply be a different type of person from those who do not write reviews. 

> **Note:** while self-selection samples can be unreliable indicators of the true state of affairs, they may be more reliable in simply comparing one establishment to a similar one; the same self-selection bias might apply to each.

### Size versus Quality: When Does Size Matter?

In the era of big data, it is sometimes surprising that smaller is better. Time and effort spent on random sampling not only reduce bias, but also allow greater attention to data exploration and data quality. For example, missing data and outliers may contain useful information. It might be prohibitively expensive to track down missing values or evaluate outliers in millions of records, but doing so in a sample of several thousand records may be feasible. Data plotting and manual inspection bog down if there is too much data.

So when are massive amounts of data needed? The classic scenario for the value of big data is when the data is not only big but sparse as well.

## Sampling Distribution of a Statistic

Typically, a sample is drawn to measure something (using a sample statistic) or to model something (via a statistical or machine learning model). Since our estimate or model is derived from a sample, there is potential for error; different samples might yield different results. This leads us to be concerned with sampling variability. If we had a large amount of data, we could draw multiple samples and directly observe the distribution of a sample statistic. Usually, we calculate our estimate or model using the maximum data available, hence drawing additional samples from the population is often not feasible.

> **Note:** It is crucial to distinguish between the data distribution (distribution of individual data points) and the sampling distribution (distribution of a sample statistic).

## Standard Error

The standard error succinctly summarizes the variability within the sampling distribution of a statistic. It can be estimated using the sample's standard deviation \(s\) and the sample size \(n\). As the sample size increases, the standard error decreases, following the square-root of \(n\) rule: reducing the standard error by a factor of 2 requires increasing the sample size by a factor of 4.

> **Note:** Do not confuse standard deviation (which measures the variability of individual data points) with standard error (which measures the variability of a sample metric).

## The Bootstrap

A straightforward and effective method for estimating the sampling distribution of a statistic or model parameters is to draw additional samples, with replacement, from the sample itself and recalculate the statistic or model for each resample. This method, known as the bootstrap, does not necessarily assume that the data or sample statistic follows a normal distribution.

> **Warning:** The bootstrap does not make up for a small sample size; it neither creates new data nor fills gaps in existing data. It merely shows how additional samples would behave when drawn from a population like the original sample.

## Confidence Intervals

Frequency tables, histograms, boxplots, and standard errors are tools to understand potential errors in a sample estimate. Confidence intervals provide another method for this.

Confidence intervals come with a coverage level, expressed as a high percentage, such as 90% or 95%. A 90% confidence interval, for instance, encloses the central 90% of the bootstrap sampling distribution of a sample statistic.

Given a sample of size \(n\) and a sample statistic of interest, the algorithm for a bootstrap confidence interval is as follows:
1. Draw a random sample of size \(n\) with replacement from the data (a resample).
2. Record the statistic of interest for the resample.
3. Repeat steps 1–2 multiple (R) times.
4. For an \(x\%\) confidence interval, trim \(\left[\left(1 - \frac{x}{100}\right) / 2\right]\%\) of the \(R\) resample results from both ends of the distribution.
5. The trim points are the endpoints of an \(x\%\) bootstrap confidence interval.

> **Note:** While the desired question when obtaining a sample result is often “What is the probability that the true value lies within a certain interval?”, a confidence interval does not directly answer this. Instead, it answers a related probability question framed in terms of the sampling procedure and population.

## Student’s t-Distribution

The t-distribution is a normal-like distribution with thicker and longer tails. It is widely used in depicting distributions of sample statistics. Sample means typically follow a t-distribution, with the distribution shape becoming more normal as the sample size increases, leading to a family of t-distributions.

## Poisson Distribution

Many processes randomly produce events at a given overall rate—such as visitors arriving at a website or typos per 100 lines of code. From past data, we can estimate the average number of events per unit time or space, but we might also want to understand the variability from one unit to another. The Poisson distribution provides the distribution of events per unit time/space when sampling many such units, useful in queuing problems like determining capacity needs to confidently handle internet traffic over a specific period.

The key parameter in a Poisson distribution is \(\lambda\) (lambda), representing the mean number of events per specified interval. The variance of a Poisson distribution is also \(\lambda\).

- **Lambda (\(\lambda\)):** The rate (per unit of time or space) at which events occur.
- **Poisson distribution:** The frequency distribution of the number of events in sampled units of time or space.
- **Exponential distribution:** The frequency distribution of the time or distance from one event to the next event.
- **Weibull distribution:** A generalized version of the exponential, where the event rate may shift over time.

## Estimating the Failure Rate

In many applications, the event rate \(\lambda\) is either known or can be estimated from prior data. However, for rare events like aircraft engine failure, there might be insufficient data for precise estimates. Without data, estimating an event rate is challenging, but assumptions can be made: for instance, if no failures are observed over 20 hours, the failure rate is unlikely to be 1 per hour. Through simulation or probability calculations, hypothetical event rates can be assessed to estimate threshold values. When some data exists but isn't enough for a reliable rate estimate, a goodness-of-fit test (e.g., Chi-Square Test) can be used to evaluate how well various rates fit the observed data.