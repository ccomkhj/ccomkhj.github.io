---
layout: single
author: Huijo
date: 2025-02-10
tags:
   - Computer Vision
classes: wide
title: "Beyond mAP: Better Evaluation of Bbox"
---

In the pursuit of advancing computer vision technologies, evaluating the performance of instance segmentation or object detection models has predominantly relied on a metric known as Average Precision (AP). Despite its widespread use, AP has notable limitations that often result in selecting models that produce suboptimal results in real-world applications.

Every time, I select the model architecture or run hyper-parameter tuning purely based on mAP, it often ends up unexpected model.
Therefore, to junior AI researchers, I used to suggest using the old-fashioned model rather than chasing after state-of-the-art.

This essay explores insights from the paper [Beyond mAP: Towards Better Evaluation of Instance Segmentation](https://openaccess.thecvf.com/content/CVPR2023/papers/Jena_Beyond_mAP_Towards_Better_Evaluation_of_Instance_Segmentation_CVPR_2023_paper.pdf), emphasizing the need for improved evaluation metrics and methodologies to address the shortcomings of AP.

#### Understanding the Pitfalls of AP
Average Precision measures the area under the precision-recall curve, prioritizing predictions based on confidence scores. However, AP focuses more on the order of predictions rather than their confidence and fails to penalize false positives at the lower end of the precision-recall curve. This encourages models to "hedge" predictions by generating low-confidence duplicates, artificially inflating scores without improving true performance. For example, a model may produce multiple overlapping predictions for a single object, increasing recall without meaningful gains in precision.

#### Toward Better Evaluation Metrics
To address these issues, the paper proposes new metrics to quantify spatial and categorical duplication errors. Spatial hedging occurs when models generate overlapping predictions for the same object, while category hedging involves assigning multiple class labels to a single instance. The authors introduce Semantic Sorting and Non-Maximum Suppression (NMS), a method that suppresses duplicates by leveraging semantic segmentation masks.

Semantic NMS evaluates whether a predicted instance aligns with regions identified in a semantic mask. Predictions with insufficient overlap are discarded, reducing false positives. This approach also operates efficiently, with linear time complexity, making it practical for large-scale applications like crowd segmentation.

#### Impact and Applications
By minimizing duplicated predictions, these methods improve model reliability. Experiments show significant reductions in false positives and better alignment between metrics and real-world performance. For instance, integrating Semantic NMS with existing frameworks improves F1 scores and localization accuracy while maintaining mask quality.

#### Hands-on Demo code
I have written sample code to fully understand myself.
Check out here: https://github.com/ccomkhj/ScienceNote/blob/main/ml_beyond_mAP.ipynb

#### Conclusion
The paper highlights critical flaws in relying solely on AP for evaluating instance segmentation models. By introducing metrics that explicitly measure duplication errors and a practical solution like Semantic NMS, the research advances toward evaluation frameworks that better reflect real-world utility. These improvements are essential as AI models increasingly power applications requiring precise and trustworthy outputs.

#### Reference
[Beyond mAP: Towards Better Evaluation of Instance Segmentation](https://openaccess.thecvf.com/content/CVPR2023/papers/Jena_Beyond_mAP_Towards_Better_Evaluation_of_Instance_Segmentation_CVPR_2023_paper.pdf)