---

layout: single  
author: Huijo  
date: 2025-8-2
tags:  
   - Math
   - Machine Learning
classes: wide  
title: "Forecasting Accuracy Metrics"

---

> **Note:** This post is initially composed with deep research and finalized by me.

## Beyond MAPE & RMSE: A Strategic Guide to Forecasting Metrics

### Why Forecast Accuracy Matters More Than Ever

**From Strawberry Fields to Energy Grids:** My journey through agricultural yield forecasting at [hexafarms](http://hexafarms.com/) (predicting strawberry and tomato yields 1-4 weeks ahead) and now demand forecasting in e-commerce and energy has taught me this: forecasting isn't about crystal balls—it's about quantifying uncertainty to drive better decisions. Whether it's a farmer deciding harvest schedules, an e-commerce manager allocating inventory, or an energy trader balancing grids, the stakes of forecast accuracy are always tangible.

**The Core Challenge:** In agriculture, a 10% overforecast could mean rotting strawberries. In energy, it could mean emergency gas purchases at peak prices. Actual results *will* deviate—our job is to answer three questions:
1. Are deviations within expected bounds?
2. What do they reveal about our models?
3. How do we communicate uncertainty to decision-makers?

**The Stakes Are Always Concrete:**
- **Agricultural Forecasting:** 1kg overprediction → €4 wasted strawberries; underprediction → missed €8/kg market premiums
- **E-Commerce:** 10% demand misforecast → 15% excess inventory costs or 20% stockout losses
- **Energy:** 5% load forecast error → €200k imbalance penalties per trading period

**The Evolution I've Lived:** Early in my career, we obsessed over single-point accuracy (MAPE for yields). Today, I advocate for **probabilistic thinking**—whether predicting the 90th percentile of tomato harvests or the distribution of next week's EV charging demand. The breakthrough moment? When our team replaced "We'll harvest 12 tons" with "80% chance of 10-14 tons" and reduced food waste by 23%.

### Demystifying Point Forecast Metrics: A Taxonomy

No single metric fits all scenarios. Understanding their construction and properties is key to strategic selection. Metrics are built from three core components:

1.  **Point Distance (D):** How is the error (`Actual - Forecast`) measured? (e.g., raw error, absolute error, squared error, log ratio).
2.  **Normalization (N):** How is the error scaled? (e.g., not scaled, divided by actual, scaled by benchmark error).
3.  **Aggregation (G):** How are individual errors combined? (e.g., mean, median, geometric mean, sum).

This framework explains *why* metrics behave as they do. Below is a comparative analysis of common metrics:

<table>
  <thead>
    <tr>
      <th>Metric (Abbrev)</th>
      <th>Formula (Simplified)</th>
      <th>Distance (D)</th>
      <th>Normalization (N)</th>
      <th>Aggregation (G)</th>
      <th>Key Properties</th>
      <th>Strengths</th>
      <th>Weaknesses</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Mean Abs Error (MAE)</strong></td>
      <td><code>MAE = (1/n) * Σ |Actual - Forecast|</code></td>
      <td>Absolute (D2)</td>
      <td>Unitary (N1)</td>
      <td>Mean (G1)</td>
      <td>Scale-dependent, preserves units, equal weighting.</td>
      <td>Intuitive, easy to compute & interpret (avg error magnitude).</td>
      <td>Not comparable across series; non-differentiable.</td>
    </tr>
    <tr>
      <td><strong>Mean Sq Error (MSE)</strong></td>
      <td><code>MSE = (1/n) * Σ (Actual - Forecast)²</code></td>
      <td>Squared (D3)</td>
      <td>Unitary (N1)</td>
      <td>Mean (G1)</td>
      <td>Scale-dependent (squared units), emphasizes large errors.</td>
      <td>Differentiable; penalizes large errors; good for model discrimination.</td>
      <td>Highly sensitive to outliers; not comparable; units unintuitive.</td>
    </tr>
    <tr>
      <td><strong>Root MSE (RMSE)</strong></td>
      <td><code>RMSE = √MSE</code></td>
      <td>Squared (D3)</td>
      <td>Unitary (N1)</td>
      <td>Mean (G1)</td>
      <td>Scale-dependent (original units).</td>
      <td>Brings MSE back to data scale; interpretable.</td>
      <td>Highly sensitive to outliers; not comparable; criticized for cross-series use.</td>
    </tr>
    <tr>
      <td><strong>Mean Abs % Error (MAPE)</strong></td>
      <td><code>MAPE = (100/n) * Σ |(Actual - Forecast)/Actual|</code></td>
      <td>Absolute (D2)</td>
      <td>By Actuals (N2)</td>
      <td>Mean (G1)</td>
      <td>Scale-independent.</td>
      <td>Popular; easy to interpret as % error.</td>
      <td><strong>Undefined if Actual=0</strong>; skewed near zero; penalizes over-forecasts more; asymmetric.</td>
    </tr>
    <tr>
      <td><strong>sMAPE</strong></td>
      <td><code>sMAPE = (100/n) * Σ (2*|e|)/(|Actual|+|Forecast|)</code></td>
      <td>Absolute (D2)</td>
      <td>Sum Actual+Pred (N4)</td>
      <td>Mean (G1)</td>
      <td>Scale-independent.</td>
      <td>Attempts symmetry.</td>
      <td><strong>Problematic near zero</strong>; can be negative; still asymmetric in practice.</td>
    </tr>
    <tr>
      <td><strong>Median Abs % Error (MdAPE)</strong></td>
      <td><code>MdAPE = Median( |(Actual - Forecast)/Actual| * 100 )</code></td>
      <td>Absolute (D2)</td>
      <td>By Actuals (N2)</td>
      <td>Median (G2)</td>
      <td>Scale-independent, median-based.</td>
      <td>Robust to large outliers; isolates accuracy from bias; easy to calculate.</td>
      <td>Less sensitive than mean; handling of zeros not always explicit.</td>
    </tr>
    <tr>
      <td><strong>Mean Abs Scaled Error (MASE)</strong></td>
      <td><code>MASE = mean( |e_t| / Q )</code><br><em>Q = MAE of in-sample naïve forecast</em></td>
      <td>Absolute (D2)</td>
      <td>Variability (N3)</td>
      <td>Mean (G1)</td>
      <td><strong>Scale-free, robust denominator.</strong></td>
      <td><strong>Never undefined</strong>; handles intermittent data; comparable across series; handles trend/seasonality.</td>
      <td>Requires historical data for benchmark; interpretation needs context (Q).</td>
    </tr>
  </tbody>
</table>
###### Understanding the Categories

*   **Scale-Dependent Metrics (MAE, MSE, RMSE):** Error is in the original data units. **Pro:** Intuitive magnitude. **Con:** Useless for comparing series on different scales (e.g., sales of pencils vs. trucks).
*   **Percentage-Error Metrics (MAPE, sMAPE, MdAPE):** Error expressed as a percentage of actuals. **Pro:** Scale-independent, good for cross-series comparison. **Con:** **Catastrophic failure with zero actual values (MAPE/sMAPE)**. MAPE biased, sMAPE ambiguous.
*   **Relative-Error Metrics (MdRAE, GMRAE):** Error relative to a benchmark (e.g., naïve forecast). **Pro:** Scale-independent. **Con:** **Undefined if benchmark error is zero** (common with intermittent data).
*   **Scale-Free Metrics (MASE):** Error scaled by in-sample benchmark error. **Pro:** Universally applicable, robust to zeros/intermittency, comparable. **Gold standard for intermittent demand.**

#### The Intermittent Demand Challenge

Sales of slow-moving items (e.g., specific lubricants) are characterized by many zeros and sporadic spikes. This wreaks havoc on traditional metrics:

*   **MAPE/sMAPE:** Explode (`Actual = 0`).
*   **GMAE:** Becomes zero (`Error = 0` anywhere).
*   **Relative Metrics:** Explode (`Benchmark Error = 0`).
*   **MASE:** Thrives. Its denominator (in-sample naïve MAE) is always available and non-zero (unless *all* historical data is identical, which is rare).

**MASE is the unequivocal champion for intermittent demand forecasting evaluation.**

#### The Myth of the "Best" Metric

The quest for a single, universally "best" metric is futile. Here's why:

1.  **Different Goals:** Minimizing average error (MAE) vs. avoiding large errors (RMSE) require different metrics.
2.  **Different Data:** Continuous sales vs. intermittent demand demand different metrics (MASE over MAPE).
3.  **Different Perspectives:** Metrics offer distinct "projections" of error characteristics (bias, variance, outliers).
4.  **Evolving Understanding:** Dominant metrics have shifted over decades (MSE -> MAPE -> MASE).
5.  **Criticism Abounds:** Even popular metrics (RMSE, MAPE) have well-documented flaws.
6.  **Error is Random:** A single number cannot fully describe a random variable's distribution.

**Selection is strategic:** Choose metrics based on **business objective**, **data characteristics**, and **interpretability needs**.

#### Handling Outliers & Distribution

*   **Squared Errors (MSE/RMSE):** Highly sensitive. Amplify large errors. Use if large errors are exceptionally costly.
*   **Absolute Errors (MAE):** Less sensitive. Equal weight to all errors.
*   **Median-Based (MdAPE, MdAE):** Most robust. Reflect typical performance, ignoring extremes.
*   **Percentage Metrics (MAPE):** Can be extremely skewed if actuals are near zero.

#### Leveling Up: Advanced Evaluation Techniques

#### Time Series Cross-Validation (Rolling Forecast Origin)

Forget simple train/test splits. Time series data demands chronological preservation:

1.  Start with initial training window (e.g., first `k` observations).
2.  Forecast next `h` periods.
3.  Move origin forward by one period, add new observation to training set.
4.  Repeat steps 2 & 3.
5.  Aggregate *out-of-sample* errors across all origins.

**Why it's critical:** Simulates real-world forecasting. Prevents overfitting to historical patterns. Provides reliable estimate of future performance. (Minimizing Gaussian AIC ≈ Minimizing 1-step MSE via this method).

#### Evaluating Probabilistic Forecasts

Assessing a full distribution against a single observation (e.g., seasonal peak demand) is hard. Key qualities:

1.  **Calibration (Reliability):** Does the forecast distribution match reality? (e.g., 90% prediction intervals *should* contain the actual ~90% of the time). Tested via uniformity of PIT (Probability Integral Transform) histograms.
2.  **Sharpness:** How narrow are the prediction intervals? Tighter intervals indicate more confident/useful forecasts (if calibrated!).

**Scoring Rules (Combine Calibration & Sharpness):** Numerical measures rewarding accurate distributions. "Proper" scoring rules incentivize truthful forecasts.

*   **Continuous Ranked Probability Score (CRPS):** Generalizes MAE. Integral of squared difference between forecast CDF and step function at observation. Lower = Better.
*   **Dawid-Sebastiani Score (DSS):** Generalizes MSE. Assumes normality.
*   **Energy Score (ES), Log Score:** Other proper scores.
*   **Empirical Fit Metrics (for multiple observations):**
    *   **Mean Absolute Excess Probability (MAEP):** Avg. absolute diff between proportion of obs exceeding a percentile and that percentile. → 0 for perfect fit.
    *   **Kolmogorov-Smirnov (KS) Statistic:** Max absolute diff between empirical and forecast CDF. → 0 for perfect fit. Scale-independent.

#### Residual Analysis: The Diagnostic Powerhouse

Residuals (`Observed - Fitted`) are gold for model improvement. A good model's residuals should be:

1.  **Uncorrelated:** No lingering patterns (check ACF/PACF).
2.  **Zero Mean:** No systematic bias.
3.  **Constant Variance (Homoscedasticity):** Spread doesn't change with level.
4.  **(Ideally) Normally Distributed:** For reliable prediction intervals.

**Practical Use (e.g., AEMO):**
*   Analyze residuals near forecast extremes (min/max demand).
*   Compare residuals generating *simulated* extremes vs. residuals from *actual* extremes.
*   Reveals where distributional assumptions break or model fails critically.

### Lessons from the Trenches: AEMO & KPMG

#### Australian Energy Market Operator (AEMO)

AEMO forecasts critical energy metrics, facing intense scrutiny. Their practices highlight context-driven assessment:

*   **Annual Consumption (Point Forecast):** Uses **Percentage Error (PE)** for simplicity. Enhances communication via:
    *   Waterfall plots showing contribution of input errors (GSP, weather).
    *   Context on input error impact.
*   **Min/Max Probabilistic Demand:** Employs a multi-pronged approach:
    *   **Qualitative Comparison (FAR):** Reports where observed demand fell in forecast distribution + context. Vital for stakeholders.
    *   **Probabilistic Drivers (FAR):** Reports *ranges* of key drivers (temp, time) at simulated extremes. **Recommendation:** Visualize distributions overlaid with actuals.
    *   **MAEP & KS (Internal PD):** Core technical metrics for distribution fit.
    *   **Pinball Loss (Relative Score - Internal):** For comparing probabilistic models. **Recommendation:** Normalize by *observed* value, not forecast quantile.
    *   **Discontinued:** Backcasting (didn't assess forecast accuracy).
    *   **Recommended:** Full-Season Hindcasting (compare forecast using *actual* historical inputs vs. historical forecast) & Simulated History (apply current model to past data).
    *   **Residual Analysis (Internal PD):** Formalize near extremes and simulated vs. actual extremes. Critical for diagnosing regression-simulation framework.
    *   **Adaptability:** Re-evaluate metrics if forecasting methodology changes.

**Key Takeaway:** Rigorous internal diagnostics (PD) differ from clear, contextual stakeholder reporting (FAR).

#### KPMG (Financial Forecasting)

Focuses on Prospective Financial Information (PFI) accuracy. Highlights benchmarking nuances:

*   **Preferred Metric: Median Absolute Percentage Error (MdAPE).** Robust to outliers, isolates accuracy from bias. (e.g., A large actual change might double MAPE but leave MdAPE stable).
*   **Power of Benchmarking:** Compare company MdAPE against peers.
    *   *Hypothetical:* Company MdAPE=7.5% vs. S&P 500 Median=4.0%, Lower Quartile=8.8% → Accuracy is below median but not in the worst quartile.
*   **Benchmarking Caveats:**
    *   **Industry Specificity:** S&P 500 too broad. Use industry-specific peers.
    *   **Statistical Significance:** Beware outliers in benchmarks.
    *   **Temporal Context:** Accuracy varies over time (e.g., COVID-19 massively increased MdAPE in 2020). Compare relevant periods.

**Key Takeaway:** A "good" MdAPE is relative to your industry and the economic climate.

### Strategic Recommendations & Conclusion

#### Choosing Your Metrics Wisely

Select metrics strategically, considering:

| Factor                     | Considerations                                                                                                 | Metric Examples                                                                              |
| :------------------------- | :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **Cross-Series Comparison** | Essential?                                                                                                     | **Scale-Independent:** MASE, MAPE (if no zeros), sMAPE (cautiously), MdAPE, Relative Metrics |
| **Zero Values / Intermittency** | Present?                                                                                                       | **Robust:** MASE (Champion)                                                                  |
| **Outlier Sensitivity**      | Are large errors catastrophic?                                                                                 | **Penalize Large Errors:** MSE, RMSE                                                         |
|                            | Should typical performance be assessed?                                                                        | **Robust to Outliers:** MAE, MdAPE, MdAE                                                     |
| **Detecting Bias**           | Is systematic over/under-forecasting a concern?                                                                | **Bias Metrics:** Mean Error (ME), Mean Percentage Error (MPE)                               |
| **Stakeholder Interpretability** | Need simple communication?                                                                                     | **Intuitive:** MAE, MAPE (if applicable), PE, MdAPE                                          |

#### Embrace Hybrid Metric Sets

No single metric tells the whole story. Combine complementary metrics to get a comprehensive view:

*   **Example 1:** MAE (Accuracy) + ME (Bias).
*   **Example 2:** MASE (Overall Robust Accuracy) + MdAPE (Robust Typical % Error).
*   **Example 3 (Probabilistic):** CRPS (Overall Prob. Score) + Calibration Plot + Sharpness Measure.

Research opportunities exist in identifying non-redundant, maximally informative hybrid sets.

#### Conclusion: A Framework for Confidence

Effective forecast evaluation is not about finding a magic number. It's a strategic discipline requiring:

1.  **Understanding Metric Properties:** Know how they are built (D, N, G) and how they behave.
2.  **Knowing Your Data:** Is it intermittent? Prone to outliers? Seasonal? This dictates valid metrics.
3.  **Aligning with Business Goals:** What type of error is most costly? What do stakeholders need to understand?
4.  **Leveraging Advanced Techniques:** Use Time Series CV for reliable out-of-sample estimates. Employ scoring rules and calibration/sharpness checks for probabilistic forecasts. Harness residual analysis for diagnostics.
5.  **Learning from Practice:** Adapt approaches like AEMO's context-driven reporting or KPMG's benchmarked MdAPE.
6.  **Using Hybrid Sets:** Gain a multi-dimensional view of performance.

By adopting this rigorous, context-aware, and multi-faceted framework, organizations can move beyond simplistic accuracy measures, build genuine confidence in their forecasts, and make significantly better decisions in an uncertain world. Continuous evaluation drives continuous improvement.