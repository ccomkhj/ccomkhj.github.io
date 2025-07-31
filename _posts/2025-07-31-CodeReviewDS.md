---

layout: single  
author: Huijo  
date: 2025-07-31
tags:  
   - Programming
classes: wide  
title: "How to review code in data science"  

---

Code review in software engineering is an essential part of the development process. It helps ensure code quality, facilitates knowledge sharing, and promotes best practices among team members.

Through my experience and perspective, data science requires a unique approach to code reviews compared to software engineering, given its characteristics such as exploratory nature, reliance on data, and importance behind the mathematics.

As a reviewer and contributor, I have found that the following aspects are crucial when reviewing code in data science:

1. **Understand the Problem Domain**: Before diving into the code, ensure you have a clear understanding of the problem being solved. This includes the business context, data sources, and expected outcomes. A solid grasp of the domain helps you evaluate whether the code effectively addresses the problem.
2. **Focus on Data Handling**: Data is at the core of data science. Review how the code handles data loading, cleaning, and preprocessing. Ensure that the data is appropriately transformed and that any assumptions made about the data are clearly documented. 
   - Check for potential data leakage, missing values, and outliers.
   - Ensure that the data is being used ethically and responsibly. It is tempting to use production data for testing, but this can a) slow down the process and b) lead to overload the system. Instead, use a subset of the data or synthetic data for testing purposes.
3. **Clarify the Code's Purpose**: Data science code often involves complex algorithms and mathematical operations. Ensure that the code is well-commented and that the purpose of each function or block of code is clear especially for algorithm and mathematical components. This helps others understand the logic and reasoning behind the implementation.

Unlike software engineering, it updates the same functionality over time due to constant evolution of algorithms and models. Moreover, data drift can force to update the existing code base. Therefore, it is essential to document the changes made to the code, including the rationale behind them.