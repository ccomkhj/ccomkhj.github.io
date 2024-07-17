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
```markdown
# State Population and Murder Rates

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

## Variability Estimates of State Population Data

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

## Self-Selection Sampling Bias

The reviews of restaurants, hotels, cafes, and so on that you read on social media sites like Yelp are prone to bias because the people submitting them are not randomly selected; rather, they themselves have taken the initiative to write. This leads to self-selection bias — the people motivated to write reviews may be those who had poor experiences, may have an association with the establishment, or may simply be a different type of person from those who do not write reviews. 

Note that while self-selection samples can be unreliable indicators of the true state of affairs, they may be more reliable in simply comparing one establishment to a similar one; the same self-selection bias might apply to each.

## Size versus Quality: When Does Size Matter?

In the era of big data, it is sometimes surprising that smaller is better. Time and effort spent on random sampling not only reduce bias, but also allow greater attention to data exploration and data quality. For example, missing data and outliers may contain useful information. It might be prohibitively expensive to track down missing values or evaluate outliers in millions of records, but doing so in a sample of several thousand records may be feasible. Data plotting and manual inspection bog down if there is too much data.

So when are massive amounts of data needed? The classic scenario for the value of big data is when the data is not only big but sparse as well.
```