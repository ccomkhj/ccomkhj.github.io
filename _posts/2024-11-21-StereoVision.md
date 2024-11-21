---
layout: single
author: Huijo
date: 2024-11-21
tags:
   - Study
classes: wide
title: Stereo Vision
---

# DIY Depth Camera Project

I have done a side project to build a DIY depth camera. I chose a lens off the shelf and, based on its focal length, MinZ, and pixel size, I computed the baseline. This site: [Nerian Calculator](https://en.nerian.alliedvision.com/support/calculator/) provides a great start.

Thanks to my previous experience in electric car engineering design, creating the CAD of the camera case was a small step.

![DIY Stereo Camera Case](..\img\dyi_stereo.jpg)


## Key Considerations

A general rule of thumb is to obtain the intrinsic and extrinsic camera matrix, which comes from calibration. I learned this from school and read some documentation, but it required some effort (2-4 hours).

Below are the tips I discovered for newbies:

- Use more than 20 images with different angles.
- Strictly adhere to pasting the paper to a hard board.
- Check if any image is corrupted. This is the most crucial step. Use my repo, I tailored to handle this issue.

Once you achieve each camera calibration and stereo calibration, intrinsic and extrinsic camera parameters become available. If you know parameters like focal length and pixel size, keep them as constraints to reduce the search space, allowing you to need fewer calibration samples. In my case, 10-15 images were enough with good constraints, but over 50 images were required without constraints.

## Repository and Tools

To estimate depth, several approaches can be used:

- **Binocular-Stereo Approach**: Uses two cameras to estimate depth by comparing the horizontal (x-axis) differences between corresponding points in the two images.
- **Fundamental Matrix Projection**: Establishes a relationship between two views to find corresponding points but isn't directly used to calculate depth.
- **Optical Flow with Stereo**: Estimates depth by looking at motion between frames, extending the stereo setup to handle changes over time.

My repository automatically selects the constraint based on your input. Depth is computed from the disparity and the geometry of the lens.

Here is my repository that detects potential outliers in calibration images. I introduced statistics to figure this out. My years of data science experience in plant science shine in this domain.

[Visit my repository on GitHub](https://github.com/ccomkhj/Stereo_Calibrator/)
In my opinion, it provides the best comfort and performance for stereo camera calibration.

Once you get calibration, it's time to compute depth. We are living in the era of deep learning, so stereo (or feature) matching is done through CNN, Cascaded GRU, Transformers. Below is the state of the art as of now (Nov. 2024). All significantly outperformed SGBM and BM. 
Any will give you the good one, so start with one of below.

### RAFT-based
- [**Accurate and Efficient Stereo Matching via Attention Concatenation Volume**](https://arxiv.org/pdf/2209.12699)
- [**Attention Concatenation Volume for Accurate and Efficient Stereo Matching**](https://arxiv.org/pdf/2203.02146)
- [**Iterative Geometry Encoding Volume for Stereo Matching**](https://www.semanticscholar.org/paper/697e176d66a17c0b24613b8513ab951dc4112c34)
- [**IGEV++: Iterative Multi-range Geometry Encoding Volumes for Stereo Matching**](https://arxiv.org/pdf/2409.00638) 

### Optical Flow-based
- [**Unifying Flow, Stereo and Depth Estimation**](https://arxiv.org/abs/2211.05783)

![Depth from stereo matching](..\img\raft.png)