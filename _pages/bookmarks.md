---
layout: bookmarks
class: wide
permalink: /bookmarks/
author_profile: true
---

_Collection of worthwhile readinglist._

## Engineering

**Forecasting**
- [Hyndsight](https://robjhyndman.com/hyndsight/): Blog by Rob Hyndman, a leading expert in time series analysis.
  - [Optimally Reconciling Forecasts in a Hierarchy](https://robjhyndman.com/papers/Foresight-hts-final.pdf)
- [Time Series Analysis and Its Applications](http://www.stat.ucla.edu/~frederic/415/S23/tsa4.pdf): A comprehensive book for time series analysis.
- [Demand Forecasting for Executives and Professionals](https://dfep.netlify.app/): A compact book focused on demand forecasting.
- [Forecasting: Principles and Practice (3rd ed)](https://otexts.com/fpp3/): A compact book for time series forecasting.
  - Great content for hierarchical or grouped time series.
  - [Python edition](https://otexts.com/fpppy/nbs/11-hierarchical-forecasting.html)
- [To Explain or to Predict?](https://projecteuclid.org/journals/statistical-science/volume-25/issue-3/To-Explain-or-to-Predict/10.1214/10-STS330.full): Clear distinction between Explanatory and Predictive modeling.
  - [My summary](../_posts/2025-07-16-ExplanatoryvsPredictiveModeling.md)
- [Ranking a Random Feature for Variable and Feature Selection](https://jmlr.org/papers/volume3/stoppiglia03a/stoppiglia03a.pdf): Probes—random variables added to compare feature importance—offer an intuitive feature selection method, but their effectiveness depends on handling correlations and cardinality, making them more common in competitions like Kaggle than in industry for simplicity.
- [A Note on the Validity of Cross-Validation for Evaluating Time Series Prediction](https://www.monash.edu/business/econometrics-and-business-statistics/research/publications/ebs/wp10-15.pdf): if the lag structure of the models is correctly set up (in autoregression models), or, the lag features are created correctly, then **normal k-fold crossvalidation can be used to evaluate** your forecasting models.
- [On Hyperparameter Optimization of Machine Learning Algorithms: Theory and Practice](https://arxiv.org/pdf/2007.15745): Great summary of how best to optimize hyperparameters based on dataset size and algorithm complexity.


**Machine Learning**
- [Interpretable Machine Learning](https://originalstatic.aminer.cn/misc/pdf/Molnar-interpretable-machine-learning_compressed.pdf): the Bible of interpretability. It’s been cited everywhere, even in scikit-learn’s docs.
- [Mathematics for Machine Learning](https://mml-book.github.io/book/mml-book.pdf): Essential math (linear algebra, calculus, probability) for ML in an accessible format.
- [The Elements of Statistical Learning: Data Mining, Inference, and Prediction](https://www.sas.upenn.edu/~fdiebold/NoHesitations/BookAdvanced.pdf): Foundational statistical learning theory and methods, rigorous but dense.
- [Building ML Powered Applications](https://github.com/hundredblocks/ml-powered-applications?tab=readme-ov-file)
- [VN2 Challenges](https://www.youtube.com/watch?v=pypzcvwmApA): VN2 Inventory Planning Competition

**Data Engineering**

* [Designing Data-Intensive Applications (DDIA)](https://github.com/letthedataconfess/Data-Engineering-Books/blob/main/Book-2Designing-data-intensive-applications.pdf): The definitive foundation for modern data systems—storage, replication, partitioning, consistency, and stream/batch architectures.
* [Fundamentals of Data Engineering](https://soclibrary.futa.edu.ng/books/Fundamentals%20of%20Data%20Engineering%20(Reis,%20JoeHousley,%20Matt)%20(Z-Library).pdf): Practical end-to-end view of data engineering: lifecycle, architecture, governance, and how to evaluate tools and build reliable systems.
* [Streaming Systems](https://www.oreilly.com/library/view/streaming-systems/9781491983867/): The best conceptual treatment of real-time data processing—event time, watermarks, correctness, and design patterns that prevent subtle failures.
* [Data Engineering Zoomcamp (DataTalksClub)](https://github.com/DataTalksClub/data-engineering-zoomcamp): Best free, end-to-end hands-on curriculum to build real pipelines (orchestration, warehousing, analytics engineering, batch + streaming).


## Ideas & Essays

- [Samaltman](https://blog.samaltman.com/reflections): Founder of OpenAI.
- [Hacker News](https://news.ycombinator.com/): The pulse of the tech world.
- [Aeon](https://aeon.co/): Profound and provocative essays on philosophy, science, and culture.
- [Brain Pickings (The Marginalian)](https://www.themarginalian.org/): Maria Popova's exploration of what it means to live a good life.

## Strategy & Growth

- [Stratechery by Ben Thompson](https://stratechery.com/): Deep analysis of tech and business strategy.
- [First Round Review](https://review.firstround.com/): Actionable insights for building great companies.
- [Farnam Street (FS.blog)](https://fs.blog/): Mastering the best of what other people have already figured out.
- [Radical Candor](https://radicalcandor.com/): Psychology of decision making building trust and respect in the workplace.
- [Lenny's Newsletter](https://www.lennysnewsletter.com/): Lenny Rachitsky's insights on product management and growth.
- [The Generalist](https://www.generalist.com/): In-depth analysis of startups and tech trends.
- [Andrew Chen's Newsletter](https://andrewchen.substack.com/): Andrew Chen's insights on startups, growth, and technology.

## Finance

**Macro Investing (Foundations)**
- [How the Economic Machine Works](https://www.youtube.com/watch?v=PHe0bXAIuk0): Ray Dalio’s clear intro to credit, debt cycles, and policy transmission.
- [Expected Returns](https://www.wiley.com/en-us/Expected+Returns%3A+An+Investor%27s+Guide+to+Harvesting+Market+Rewards%2C+3rd+Edition-p-9781119997617): Antti Ilmanen’s institutional-grade reference on macro risk premia and long-run returns.
- [Mastering the Market Cycle](https://www.amazon.com/Mastering-Market-Cycle-Getting-Odds/dp/1328479255): Howard Marks on cycles, risk appetite, and avoiding pro-cyclical mistakes.

**Monetary Policy, Liquidity, and Financial Plumbing**
- [The New Lombard Street](https://press.princeton.edu/books/hardcover/9780691168927/the-new-lombard-street): Perry Mehrling’s best-in-class explanation of money markets, liquidity, and central bank backstops.
- [Federal Reserve: Monetary Policy](https://www.federalreserve.gov/monetarypolicy.htm): Primary-source reference for policy tools, minutes, and explanations.
- [Bank for International Settlements (BIS) Publications](https://www.bis.org/publ/index.htm): High-signal work on global liquidity, credit cycles, banking stability, and FX.

**Bonds & Rates (Macro’s Backbone)**
- [Bond Markets, Analysis, and Strategies](https://www.amazon.com/Bond-Markets-Analysis-Strategies-9th/dp/0133796770): Fabozzi’s classic reference on yield curves, duration, and fixed income mechanics.
- [FRED (St. Louis Fed)](https://fred.stlouisfed.org/): Best free source for macro time series (rates, CPI, unemployment, growth, credit spreads).
  - Useful: yield curve, inflation expectations (breakevens), unemployment, credit spreads.

**Crises, Regimes, and History**
- [This Time Is Different](https://press.princeton.edu/books/paperback/9780691152643/this-time-is-different): Reinhart & Rogoff’s empirical history of leverage, banking crises, and sovereign defaults.
- [The Changing World Order](https://www.amazon.com/Changing-World-Order-Nations-Succeed/dp/1982160276): Dalio’s macro-historical view of reserve currencies and geopolitical cycles.
- [Irrational Exuberance](https://press.princeton.edu/books/paperback/9780691173129/irrational-exuberance): Shiller on valuation regimes, bubbles, and long-cycle market behavior.

**Practical Macro Strategy (Turning Views Into Trades/Portfolios)**
- [Global Macro Trading](https://www.amazon.com/Global-Macro-Trading-Profit-Second/dp/1118996365): Professional overview of cross-asset macro thinking and implementation.
- [Geopolitical Alpha](https://www.amazon.com/Geopolitical-Alpha-Investment-Strategy-Economics/dp/1119740211): Marko Papic’s structured way to convert macro/geopolitics into investable scenarios.
- [Systematic Trading](https://www.amazon.com/Systematic-Trading-Designing-Trading-Investing/dp/0857194453): Risk-managed and process-driven approach (valuable antidote to narrative macro).

**Asset Allocation**
- [Dynamic Asset Allocation](https://www.amazon.com/Dynamic-Asset-Allocation-Modern-Investors/dp/0071622723): A practical framework for building macro-aware portfolios over time.
- [IMF World Economic Outlook](https://www.imf.org/en/Publications/WEO): High-quality baseline for macro projections, risks, and global conditions.
