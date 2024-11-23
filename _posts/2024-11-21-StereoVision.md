---

layout: single  
author: Huijo  
date: 2024-11-21  
tags:  
   - Study  
classes: wide  
title: Stereo Vision  

---

# Building a DIY Depth Camera  

Past days, I worked on a side project to construct a DIY depth camera. Starting with an off-the-shelf lens, I calculated the baseline based on its focal length, minimal distance (MinZ), and pixel size. The [Nerian Calculator](https://en.nerian.alliedvision.com/support/calculator/) was a fantastic starting resource for this.  

Thanks to my previous experience in electric car engineering and design, creating a CAD model for the camera case felt like second nature.  

![DIY Stereo Camera Case](..\img\dyi_stereo.jpg)  

---

## Key Steps and Tips for Camera Calibration  

One of the critical steps in creating a depth camera involves obtaining the intrinsic and extrinsic camera matrices through careful calibration. While I had some foundational knowledge from school and supplementary documentation, the entire process still required focused effort (2–4 hours).  

Here are key tips I discovered for beginners:  

- **Capture at least 20 images** from various angles to improve calibration accuracy.  
- **Mount the checkerboard target on a solid board** to prevent flexing or distortion.  
- **Validate all captured images** for potential corruption—this step is essential. I developed a custom solution in my repository to address this issue.  

Once you complete the individual camera calibration and stereo calibration, the intrinsic and extrinsic camera parameters will be available. Using constraints like known focal length and pixel size can significantly reduce the search space, allowing calibration with fewer images (10–15 images with constraints versus 50+ without constraints).  

---

## Repository and Depth Estimation Approaches  

After calibration, the next step is estimating depth. There are several techniques to achieve this:  

- **Binocular Stereo:** Compares horizontal (x-axis) disparities between two images to estimate depth.  
- **Fundamental Matrix Projection:** Establishes a relationship between corresponding points in two images but does not directly compute depth.  
- **Optical Flow with Stereo:** Estimates depth by analyzing motion between frames, extending the binocular stereo setup to handle temporal dynamics.  

I created a repository that automates detecting problematic calibration images through statistical analysis, leveraging my background in plant data science. This repository simplifies calibration and ensures a smooth workflow:  

[Check out the repository on GitHub](https://github.com/ccomkhj/Stereo_Calibrator/)  

Once the calibration is complete, you're ready to compute depth. These days, we live in an era dominated by deep learning, where stereo matching and feature extraction benefit from cutting-edge architectures like CNNs, GRUs, and Transformers.  

---

## Advancing Stereo Matching Through Deep Learning  

Stereo vision has undergone tremendous transformation with advancements in deep learning. (Former) standard algorithm, such as [SGBM](https://docs.opencv.org/3.4/d2/d85/classcv_1_1StereoSGBM.html), [BM](https://docs.opencv.org/3.4/d9/dba/classcv_1_1StereoBM.html), became considerably outdated, because it is really sensitive to calibration. It costs my time a lot because it's the theories that school teaches, and I could gain from computer vision communities.

New architectural paradigms are reshaping stereo matching and disparity estimation, with three leading approaches standing out:  

1. **CNN-Based Cost Volume Aggregation**  
2. **RAFT-Inspired Iterative Optimization**  
3. **Transformer-Based Architectures**  

Each paradigm offers distinct advantages and efficiency trade-offs, pushing the boundaries of accuracy and computational performance. Below are some elaboration how stereo matching researches have evolved over the last 4 years.

---

### CNN-Based Cost Volume Aggregation  

Traditionally, **Convolutional Neural Networks (CNNs)** have been central to stereo vision, handling 3D cost volumes to measure correspondence across stereo image pairs. These cost volumes are critical to generating accurate disparity maps.  

Two notable breakthroughs in this space are:  

- **LEA Stereo (2020):** Introduced neural architecture search into stereo vision, optimizing cost volumes and producing high-density disparity maps tailored for stereo tasks.  
- **CFNet (2021):** Enhanced this pipeline with multi-resolution cost volumes and uncertainty modeling, achieving improved accuracy through adaptable disparity search ranges.  

However, while CNNs excel at dense mapping, their heavy memory requirements present scalability challenges.  

---

### RAFT-Stereo: Iterative Refinements  

The **RAFT-Stereo series** has revolutionized stereo matching by introducing iterative, optimization-based methodologies. This approach relies on compact, dynamic cost volumes that balance computational efficiency with robust disparity predictions.  

Key innovations include:  

- **RAFT-Stereo (2021):** Introduced "all-pairs correlation volumes," enabling unbounded disparity searches through iterative refinement. Gated Recurrent Units (GRUs) dynamically update predictions during each refinement step, yielding highly accurate results.  
- **IGEV (2023):** Improved pipelines for finer details and smoother disparity maps.  
- **Selective-Stereo (2024):** Leveraged attention-based selective GRUs to focus on the most relevant features during iteration, achieving significant performance improvements.  

This iterative series is particularly effective for complex and dynamic environments.  

---

### Transformer-Based Models  

Transformers have made groundbreaking contributions to stereo vision by replacing cost-volume computations with self-attention mechanisms to model long-range dependencies.  

Initial attempts, such as **STTR (2021),** faced issues with occlusion handling. However, subsequent models introduced refinements:  

- **CEST (2022):** Enhanced disparity predictions with axial attention modules that model context more effectively.  
- **UniMatch (2023):** Unified optical flow, stereo, and depth estimation into one versatile architecture, demonstrating strong performance across multiple modalities.  

While Transformer models circumvent computational inefficiencies of traditional cost volumes, they remain challenged by occluded or texturally ambiguous scenarios.  

---

## Deep Learning Models for Depth Estimation  

Throughout my project, I explored several cutting-edge papers to optimize depth estimation and stereo matching. Based on reproducing their results, I realized that **RAFT-Stereo** and **GM-Stereo** consistently deliver the most generic, reliable outputs. If you're starting, I recommend beginning with one of these.

Here are some prominent models that I implemented on my dataset:  

- **[Accurate and Efficient Stereo Matching via Attention Concatenation Volume](https://arxiv.org/pdf/2209.12699)**  
- **[Attention Concatenation Volume for Accurate and Efficient Stereo Matching](https://arxiv.org/pdf/2203.02146)**  
- **[Iterative Geometry Encoding Volume for Stereo Matching](https://www.semanticscholar.org/paper/697e176d66a17c0b24613b8513ab951dc4112c34)**  
- **[IGEV++: Iterative Multi-range Geometry Encoding Volumes for Stereo Matching](https://arxiv.org/pdf/2409.00638)**  
- **[Unifying Flow, Stereo, and Depth Estimation](https://arxiv.org/abs/2211.05783)**  

There have been numerous papers claiming higher performance scores compared to foundational models like **RAFT** and **GM-Stereo**. However, in my experiments, these newer models often didn't produce consistently better outcomes across my dataset. The dominant reason, in my opinion, is the challenge of **Facing Domain Shifts**.  

Public datasets, which researchers commonly use for training and evaluation, often differ significantly from real-world datasets. As a result, models optimized for these public datasets struggle with generalization in practical applications. This highlights that **the generality of a model's architecture is a critical factor**, and it cannot simply be assessed through the metrics reported in academic papers. Real-world testing is essential to truly evaluate a model's robustness and adaptability.  

![Depth from Stereo Matching](..\img\raft.png)  
