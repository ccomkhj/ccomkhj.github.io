---

layout: single  
author: Huijo  
date: 2025-8-6
tags:
   - Machine Learning
   - Math
classes: wide  
title: "Understanding XGBoost: A Deep Dive into the Mathematics and From-Scratch Implementation"

---

> **Note:** This post is initially composed with deep research and finalized by me.

Not only from my own experience in forecasting and predictive modeling in agriculture, automotive, and e-commerce industries, *XGBoost* (Extreme Gradient Boosting) is one of the go-to algorithms in many production-grade solutions, renowned for its performance in structured data tasks and competition-winning results. While widely used, its inner mechanics—especially the interplay between second-order optimization, regularization, and tree construction—are often treated as a black box for many ML peers.

In this post, I deconstruct XGBoost from first principles, deriving its core objective function, explaining its structural and weight-based regularization, and implementing a simplified version of the **exact greedy algorithm** in pure Python using only the standard library. This is intended for readers with a strong mathematical background who seek **not just intuition**, but **rigorous understanding**.

---

## **1. What Is XGBoost? The Additive Model Framework**

XGBoost builds predictions using an ensemble of $$  K $$  regression trees $$  f_k $$ , combined additively:

$$
\hat{y}_i = \sum_{k=1}^K f_k(x_i),
$$

where:
- $$  x_i \in \mathbb{R}^m $$  is the $$  i $$ -th **input instance** (a data point, like a customer record or house listing),
- $$  \hat{y}_i $$  is the predicted output (e.g., price, probability),
- Each $$  f_k $$  is a **decision tree** that maps inputs to real-valued scores.

At each boosting round $$  t $$ , the model updates its prediction:

$$
\hat{y}_i^{(t)} = \hat{y}_i^{(t-1)} + f_t(x_i).
$$

The new tree $$  f_t $$  is trained to correct the errors (residuals) of the previous model.

---

### 🔍 What Is an *Instance*?

An **instance** is simply a single row in your dataset—a specific example.

For example, if you're predicting house prices:
- Instance 1: `[bedrooms=3, sqft=2000, year=2005]` → price = $400,000
- Instance 2: `[bedrooms=2, sqft=1200, year=1998]` → price = $250,000

So if you have $$  n $$  rows, you have $$  n $$  **instances**: $$  x_1, x_2, ..., x_n $$ . Each $$  x_i \in \mathbb{R}^m $$  is a vector of $$  m $$  numerical or encoded features.

---

### 🔍 What Is a *Leaf* in a Decision Tree?

A **decision tree** works like a flowchart. It asks a series of yes/no questions (e.g., "Is size > 1500?") and routes each instance down a path until it reaches a **terminal node**, called a **leaf**.

Each **leaf** acts like a "bucket" that collects similar instances and assigns them a prediction value—called the **leaf weight**, $$  w_j $$ .

If a tree has $$  T $$  leaves, then every instance ends up in exactly **one** leaf.

👉 So the tree doesn’t give a unique output for every instance—it **groups** similar instances and gives them the same score.

This is why decision trees are **piecewise constant functions**: they partition the input space and assign a constant value to each region.

---

## **2. The XGBoost Objective: Balancing Fit and Complexity**

The goal at step $$  t $$  is to learn $$  f_t $$  that minimizes the total objective:

$$
\text{obj}^{(t)} = \sum_{i=1}^n l(y_i, \hat{y}_i^{(t-1)} + f_t(x_i)) + \Omega(f_t),
$$

where:
- $$  l(\cdot) $$ : differentiable convex loss (e.g., squared error, logistic loss),
- $$  \Omega(f_t) $$ : regularization term penalizing tree complexity.

XGBoost uses:

$$
\Omega(f_t) = \gamma T + \frac{1}{2} \lambda \sum_{j=1}^T w_j^2,
$$

with:
- $$  T $$ : number of leaves,
- $$  w_j $$ : score (leaf weight) at leaf $$  j $$ ,
- $$  \gamma \geq 0 $$ : penalty per leaf (controls tree depth),
- $$  \lambda \geq 0 $$ : L2 penalty on leaf weights (controls overfitting).

This dual penalty discourages both deep trees (via $$  \gamma $$ ) and large leaf outputs (via $$  \lambda $$ ).

---

## **3. Second-Order Taylor Expansion: Making the Objective Tractable**

Since $$  f_t(x_i) $$  is piecewise constant and non-differentiable, we can’t directly optimize the objective. Instead, XGBoost uses a **second-order Taylor expansion** of the loss $$  l $$  around the current prediction $$  \hat{y}_i^{(t-1)} $$ :

$$
l(y_i, \hat{y}_i^{(t-1)} + f_t(x_i)) \approx l(y_i, \hat{y}_i^{(t-1)}) + g_i f_t(x_i) + \frac{1}{2} h_i f_t(x_i)^2,
$$

where:
- $$  g_i = \partial_{\hat{y}} l(y_i, \hat{y}_i^{(t-1)}) $$ : first derivative (gradient),
- $$  h_i = \partial^2_{\hat{y}} l(y_i, \hat{y}_i^{(t-1)}) $$ : second derivative (Hessian).

Dropping constants, the working objective becomes:

$$
\text{obj}^{(t)} \approx \sum_{i=1}^n \left[ g_i f_t(x_i) + \frac{1}{2} h_i f_t(x_i)^2 \right] + \Omega(f_t).
$$

This is now a **quadratic function** in $$  f_t(x_i) $$ , which we can optimize efficiently.

---

## **4. Tree Structure and Leaf-Wise Optimization**

Let’s define:
- $$  q: \mathbb{R}^m \to \{1,\dots,T\} $$ : the **tree structure**, a function that assigns each input $$  x_i $$  to a leaf $$  j $$ .
- $$  I_j = \{ i \mid q(x_i) = j \} $$ : the **set of instances** that fall into leaf $$  j $$ .

Then, by definition:
$$
f_t(x_i) = w_j \quad \text{for all } i \in I_j.
$$

That is, **all instances in the same leaf get the same prediction** from this tree: $$  w_j $$ .

---

### 🧮 Rewriting the Objective by Leaves

Instead of summing over instances one by one, we can group them by leaf:

$$
\sum_{i=1}^n g_i f_t(x_i) = \sum_{j=1}^T \sum_{i \in I_j} g_i w_j = \sum_{j=1}^T \left( \sum_{i \in I_j} g_i \right) w_j
$$

$$
\sum_{i=1}^n \frac{1}{2} h_i f_t(x_i)^2 = \sum_{j=1}^T \sum_{i \in I_j} \frac{1}{2} h_i w_j^2 = \sum_{j=1}^T \frac{1}{2} \left( \sum_{i \in I_j} h_i \right) w_j^2
$$

Now include the regularization $$  \Omega(f_t) = \gamma T + \frac{1}{2} \lambda \sum_{j=1}^T w_j^2 $$ , and combine:

$$
\text{obj}^{(t)} = \sum_{j=1}^T \left[ \left( \sum_{i \in I_j} g_i \right) w_j + \frac{1}{2} \left( \sum_{i \in I_j} h_i + \lambda \right) w_j^2 \right] + \gamma T
$$

Let:
- $$  G_j = \sum_{i \in I_j} g_i $$ : total gradient in leaf $$  j $$ ,
- $$  H_j = \sum_{i \in I_j} h_i $$ : total Hessian in leaf $$  j $$ .

Then:
$$
\text{obj}^{(t)} = \sum_{j=1}^T \left[ G_j w_j + \frac{1}{2} (H_j + \lambda) w_j^2 \right] + \gamma T
$$

---

### ✅ Optimal Leaf Weight

This expression is a **sum of independent quadratics** in $$  w_j $$ , so we can minimize each term separately.

Take derivative w.r.t. $$  w_j $$ , set to zero:

$$
G_j + (H_j + \lambda) w_j = 0 \quad \Rightarrow \quad w_j^* = -\frac{G_j}{H_j + \lambda}
$$

This is the **best possible value** for the leaf score $$  w_j $$ , given which instances are in that leaf.

---

### 📉 Optimal Objective Value

Substitute $$  w_j^* $$  back in:

$$
\text{obj}^* = -\frac{1}{2} \sum_{j=1}^T \frac{G_j^2}{H_j + \lambda} + \gamma T
$$

This value depends only on how the tree partitions the data (i.e., which $$  I_j $$  sets are formed). It serves as a **score** for evaluating tree quality: lower is better.

---

## **5. Split Evaluation: The Gain Formula**

To grow the tree, we ask: *"Should we split this node?"* and *"How?"*

Suppose a node contains instance set $$  I $$ , and we consider splitting it into left ($$ I_L $$ ) and right ($$ I_R $$ ) children.

Let:
- $$  G = \sum_{i \in I} g_i $$ , $$  H = \sum_{i \in I} h_i $$ ,
- $$  G_L = \sum_{i \in I_L} g_i $$ , $$  H_L = \sum_{i \in I_L} h_i $$ ,
- $$  G_R = G - G_L $$ , $$  H_R = H - H_L $$ .

The **gain** from this split is the reduction in objective:

$$
\text{Gain} = \underbrace{\left[ -\frac{1}{2} \frac{G_L^2}{H_L + \lambda} -\frac{1}{2} \frac{G_R^2}{H_R + \lambda} \right]}_{\text{after split}} - \underbrace{\left[ -\frac{1}{2} \frac{G^2}{H + \lambda} \right]}_{\text{before split}} - \gamma
$$

Simplifying:

$$
\text{Gain} = \frac{1}{2} \left[ \frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{G^2}{H + \lambda} \right] - \gamma
$$

### 🧠 Interpretation
- The first two terms: improvement from having two specialized leaves.
- The third term: loss from the original (unsplit) leaf.
- $$  -\gamma $$ : penalty for adding a new leaf.

✅ **A split is accepted only if $$  \text{Gain} > 0 $$ .** This acts as **pre-pruning**: only splits that improve the regularized objective are made.

> 🔥 **Note**: The original paper uses $$  -\gamma $$ , not $$  -\gamma/2 $$ . Some implementations mistakenly halve the penalty, weakening regularization.

---

## **6. The Exact Greedy Algorithm: How Splits Are Found**

The **exact greedy algorithm** finds the best split by:
1. For each feature, sort instances by feature value.
2. For each adjacent pair $$  (x_i, x_{i+1}) $$ , consider a candidate split at $$  \frac{x_i + x_{i+1}}{2} $$ .
3. For each candidate, compute the gain.
4. Choose the split with maximum gain (if positive).

This ensures all possible binary splits are evaluated.

### 🌲 Handling Ordinal Features
XGBoost treats integer-encoded ordinal features (e.g., education level 1–8) as continuous. It generates splits at midpoints like 1.5, 2.5, etc., enforcing **monotonic partitions**. This is efficient but assumes monotonicity—non-monotonic relationships may be missed.

### ⏱️ Computational Complexity
Per node: $$  O(d \cdot n \log n) $$ , due to sorting $$  d $$  features. This is expensive for large datasets, motivating approximate methods (e.g., quantile sketching).

### 🛑 Split Validity: `min_child_weight`
A split is invalid if:
$$
H_L < \text{min\_child\_weight} \quad \text{or} \quad H_R < \text{min\_child\_weight}.
$$

This ensures sufficient data and curvature in each child. In classification, $$  h_i = p_i(1 - p_i) \to 0 $$  near decision boundaries, so this prevents overconfident splits on small or certain groups.

---

## **7. From-Scratch Python Implementation (Standard Library Only)**

Here's a minimal, pure-Python implementation of the exact greedy algorithm.

```python
from typing import List, Tuple, Optional

class TreeNode:
    def __init__(self):
        self.left: Optional['TreeNode'] = None
        self.right: Optional['TreeNode'] = None
        self.feature: Optional[int] = None
        self.threshold: Optional[float] = None
        self.value: Optional[float] = None  # leaf output

class TreeBooster:
    def __init__(self, max_depth: int = 3, min_child_weight: float = 1.0,
                 gamma: float = 0.0, reg_lambda: float = 1.0):
        self.max_depth = max_depth
        self.min_child_weight = min_child_weight
        self.gamma = gamma
        self.reg_lambda = reg_lambda
        self.root: Optional[TreeNode] = None

    def _compute_gradients(self, y_true: float, y_pred: float) -> Tuple[float, float]:
        # Example: squared error loss
        grad = y_pred - y_true
        hess = 1.0  # hessian = 1 for squared loss
        return grad, hess

    def _find_better_split(self, X: List[List[float]], y_true: List[float], y_pred: List[float],
                           idxs: List[int]) -> Tuple[Optional[int], Optional[float], Optional[float]]:
        best_gain = -float('inf')
        best_feature = None
        best_threshold = None
        best_value = None

        # Compute total G and H for current node
        G = sum(self._compute_gradients(y_true[i], y_pred[i])[0] for i in idxs)
        H = sum(self._compute_gradients(y_true[i], y_pred[i])[1] for i in idxs)

        if H < self.min_child_weight:
            return None, None, None

        n_features = len(X[0])
        for feature_idx in range(n_features):
            # Sort indices by feature value
            sorted_idxs = sorted(idxs, key=lambda i: X[i][feature_idx])
            values = [X[i][feature_idx] for i in sorted_idxs]

            GL, HL = 0.0, 0.0
            GR, HR = G, H

            for i in range(len(sorted_idxs) - 1):
                idx = sorted_idxs[i]
                g, h = self._compute_gradients(y_true[idx], y_pred[idx])
                GL += g; HL += h
                GR -= g; HR -= h

                # Avoid duplicate values
                if values[i] == values[i + 1]:
                    continue

                threshold = (values[i] + values[i + 1]) / 2.0

                # Check child weight
                if HL < self.min_child_weight or HR < self.min_child_weight:
                    continue

                gain = 0.5 * (
                    (GL**2 / (HL + self.reg_lambda)) +
                    (GR**2 / (HR + self.reg_lambda)) -
                    ((GL + GR)**2 / (HL + HR + self.reg_lambda))
                ) - self.gamma

                if gain > best_gain:
                    best_gain = gain
                    best_feature = feature_idx
                    best_threshold = threshold
                    best_value = -GL / (HL + self.reg_lambda)

        if best_gain <= 0:
            return None, None, None
        return best_feature, best_threshold, best_value

    def _build_tree(self, X: List[List[float]], y_true: List[float], y_pred: List[float],
                    idxs: List[int], depth: int) -> TreeNode:
        node = TreeNode()

        if depth >= self.max_depth:
            G = sum(self._compute_gradients(y_true[i], y_pred[i])[0] for i in idxs)
            H = sum(self._compute_gradients(y_true[i], y_pred[i])[1] for i in idxs)
            node.value = -G / (H + self.reg_lambda)
            return node

        feature, threshold, value = self._find_better_split(X, y_true, y_pred, idxs)

        if feature is None:
            G = sum(self._compute_gradients(y_true[i], y_pred[i])[0] for i in idxs)
            H = sum(self._compute_gradients(y_true[i], y_pred[i])[1] for i in idxs)
            node.value = -G / (H + self.reg_lambda)
            return node

        node.feature = feature
        node.threshold = threshold

        left_idxs = [i for i in idxs if X[i][feature] <= threshold]
        right_idxs = [i for i in idxs if X[i][feature] > threshold]

        node.left = self._build_tree(X, y_true, y_pred, left_idxs, depth + 1)
        node.right = self._build_tree(X, y_true, y_pred, right_idxs, depth + 1)

        return node

    def fit(self, X: List[List[float]], y: List[float], base_pred: List[float]):
        idxs = list(range(len(X)))
        self.root = self._build_tree(X, y, base_pred, idxs, 0)

    def _predict_row(self, row: List[float]) -> float:
        node = self.root
        while node.value is None:
            if row[node.feature] <= node.threshold:
                node = node.left
            else:
                node = node.right
        return node.value

    def predict(self, X: List[List[float]]) -> List[float]:
        return [self._predict_row(row) for row in X]
```

### ✅ Example Usage

```python
X = [[1.0], [2.0], [3.0], [4.0]]
y = [2.0, 4.0, 6.0, 8.0]
base_pred = [0.0] * len(y)

model = TreeBooster(max_depth=2, reg_lambda=1.0)
model.fit(X, y, base_pred)
print(model.predict(X))  # Outputs tree-based corrections
```

> ⚠️ This is a **pedagogical** implementation. Real XGBoost uses histograms, sparsity, and parallelism for speed.

---

## **8. Key Insights**

1. **Second-order optimization** enables precise leaf weight estimation.
2. **Dual regularization** ($$ \gamma $$  and $$  \lambda $$ ) controls structure and output magnitude.
3. **Gain-based splitting** ensures only meaningful splits are made.
4. **Leaf grouping** allows closed-form optimization of $$  w_j $$ .
5. **Hessian-aware pruning** improves stability in uncertain regions.

---

## **9. Conclusion**

XGBoost’s power lies in its principled fusion of:
- Gradient boosting,
- Second-order optimization,
- Structural and weight regularization.

By understanding how instances are grouped into leaves and how leaf weights are optimized, we move beyond treating XGBoost as a black box.

It’s not magic—it’s **math**, carefully engineered.

---

*References*  
[1] Chen, T., & Guestrin, C. (2016). *XGBoost: A Scalable Tree Boosting System.* KDD.  
[2] Friedman, J. H. (2001). *Greedy Function Approximation: A Gradient Boosting Machine.*  
[3] Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The Elements of Statistical Learning.*
