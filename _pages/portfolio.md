---
layout: portfolio
class: wide
permalink: /portfolio/
author_profile: false
title: "portfolio"
---

<div class="projects-grid">
  <!-- Drone Vision -->
  <div class="project-card">
    <div class="project-title-bar">Drone Vision</div>
    <a href="https://youtu.be/AqAXgcsjH5k" target="_blank">
      <img src="../img/demo_video.PNG" alt="Drone Vision DEMO" class="project-image">
    </a>
    <div class="project-content">
      Advanced drone vision system with trajectory planning, object detection, and visual SLAM.
      <ul>
        <li><a href="https://github.com/ccomkhj/tello_ros_drone">Drone control using ROS2</a></li>
        <li><a href="https://github.com/HexaFarms/yolov5">Customized YOLOv5</a></li>
        <li><a href="https://github.com/ccomkhj/ORB_SLAM3">Drone-Visual SLAM in farming</a></li>
        <li><a href="https://github.com/ccomkhj/PCL_Plants">Point Cloud Processing</a></li>
      </ul>
    </div>
    <div class="project-tags">
      <span class="project-tag">Computer Vision</span>
      <span class="project-tag">ROS2</span>
      <span class="project-tag">SLAM</span>
    </div>
  </div>

  <!-- 3D Reconstruction -->
  <div class="project-card">
    <div class="project-title-bar">3D Reconstruction</div>
    <a href="https://youtu.be/Ypbvzz4kERU" target="_blank">
      <img src="../img/reconstruction.PNG" alt="3D Reconstruction Demo" class="project-image">
    </a>
    <div class="project-content">
      Advanced 3D reconstruction system for creating detailed digital models.
    </div>
    <div class="project-tags">
      <span class="project-tag">Computer Vision</span>
      <span class="project-tag">3D Modeling</span>
      <span class="project-tag">SfM</span>
    </div>
  </div>

  <!-- Stereo Vision -->
  <div class="project-card">
    <div class="project-title-bar">Stereo Vision</div>
    <img src="../img/raft.png" alt="Stereo Vision" class="project-image">
    <div class="project-content">
      <ul>
        <li>Build hardware of stereo vision from scratch</li>
        <li>Depth computation</li>
        <li><a href="https://github.com/ccomkhj/Charuco_Stereo_Calibrator">Custom stereo calibration</a></li>
        <li><a href="https://ccomkhj.github.io/StereoVision">Reading</a></li>
      </ul>
    </div>
    <div class="project-tags">
      <span class="project-tag">Computer Vision</span>
      <span class="project-tag">3D Reconstruction</span>
      <span class="project-tag">Depth Estimation</span>
    </div>
  </div>

  <!-- Cancer Detector -->
  <div class="project-card">
    <div class="project-title-bar">Cancer Detector</div>
    <div class="project-content">
      End-to-end pipeline for multi-class segmentation and classification on prostate MRI data.
      <ul>
        <li>Config-driven modular architecture with layered YAML composition</li>
        <li>Full HPC/SLURM support with sweep/grid search and auto model promotion</li>
        <li>Research runner orchestrating data import through inference</li>
      </ul>
      <a href="https://github.com/ccomkhj/cancer_detector" target="_blank">View on GitHub</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">Deep Learning</span>
      <span class="project-tag">Medical Imaging</span>
      <span class="project-tag">MRI Segmentation</span>
    </div>
  </div>

  <!-- Agent Materialize -->
  <div class="project-card">
    <div class="project-title-bar">Agent Materialize</div>
    <div class="project-content">
      Foundation layer for agents over Postgres — agent-curated materialized views behind a two-role access boundary.
      <ul>
        <li>Setup + runtime MCP servers; agent never touches base tables</li>
        <li>Access boundary enforced inside Postgres, not the app layer</li>
        <li>Lineage parsed by sqlglot; static HTML dashboard with refresh history</li>
      </ul>
      <a href="https://github.com/ccomkhj/agent_materialize" target="_blank">View on GitHub</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">MCP</span>
      <span class="project-tag">Postgres</span>
      <span class="project-tag">Agent Tools</span>
    </div>
  </div>

  <!-- Agentune -->
  <div class="project-card">
    <div class="project-title-bar">Agentune</div>
    <a href="https://github.com/ccomkhj/agentune" target="_blank">
      <img src="https://raw.githubusercontent.com/ccomkhj/agentune/main/assets/logo.png" alt="Agentune logo" class="project-image">
    </a>
    <div class="project-content">
      Agent-driven hyperparameter optimization with Optuna — Claude Code adapts the search strategy round-by-round.
      <ul>
        <li>LLM agent reads round summaries via MCP, proposes search-space changes</li>
        <li>Optuna runs deterministically within each round (XGBoost, LightGBM, CatBoost)</li>
        <li>Auto-generated HTML reports per campaign; Postgres + MLflow backend</li>
      </ul>
    </div>
    <div class="project-tags">
      <span class="project-tag">HPO</span>
      <span class="project-tag">MCP</span>
      <span class="project-tag">Optuna</span>
    </div>
  </div>

  <!-- Polarize -->
  <div class="project-card">
    <div class="project-title-bar">Polarize</div>
    <div class="project-content">
      Agent-native CLI that discovers compute-heavy pandas operations and validates their Polars conversions.
      <ul>
        <li>AST-based discovery with compute-weight ranking (loop-aware, impact-sorted)</li>
        <li>Validates correctness and benchmarks time/memory improvement</li>
        <li>Structured JSON output designed for autonomous agent loops</li>
      </ul>
      <a href="https://github.com/ccomkhj/polarize" target="_blank">View on GitHub</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">Python</span>
      <span class="project-tag">Pandas-to-Polars</span>
      <span class="project-tag">Agent Tools</span>
    </div>
  </div>

  <!-- Event Inventory Kafra -->
  <div class="project-card">
    <div class="project-title-bar">Event Inventory</div>
    <div class="project-content">
      Event-driven inventory sync replacing daily batch pulls with near-real-time Shopify webhook updates.
      <ul>
        <li>Shopify webhooks → FastAPI → Kafka (KRaft) → PostgreSQL pipeline</li>
        <li>Idempotent & order-safe with partition-keyed Kafka messages</li>
        <li>Fully containerized with mock webhook generator for local testing</li>
      </ul>
      <a href="https://github.com/ccomkhj/event_inventory_kafra" target="_blank">View on GitHub</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">Kafka</span>
      <span class="project-tag">Event-Driven</span>
      <span class="project-tag">Shopify</span>
    </div>
  </div>

  <!-- Finance Portfolio -->
  <div class="project-card">
    <div class="project-title-bar">Finance Portfolio</div>
    <div class="project-content">
      Plain-text, git-tracked personal portfolio manager — check, visualize, and rebalance from terminal or dashboard.
      <ul>
        <li>Drift-to-target in one command; EUR-native with auto FX conversion</li>
        <li>Trades live in CSV, targets in YAML; git is the audit trail</li>
        <li>Streamlit dashboard with inline editing; ~500 lines of Python</li>
      </ul>
      <a href="https://github.com/ccomkhj/finance_portfolio" target="_blank">View on GitHub</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">Finance</span>
      <span class="project-tag">CLI</span>
      <span class="project-tag">Streamlit</span>
    </div>
  </div>
</div>

## II. Publications

<div class="projects-grid">
  <div class="project-card">
    <div class="project-title-bar">Master Thesis</div>
    <div class="project-content">
      Deep Learning-Based Semiautomatic Generation of HD maps from Aerial Imagery
    </div>
    <div class="project-tags">
      <span class="project-tag">Deep Learning</span>
      <span class="project-tag">HD Maps</span>
      <span class="project-tag">Aerial Imagery</span>
    </div>
  </div>

  <div class="project-card">
    <div class="project-title-bar">Deep Aerial Mapper</div>
    <div class="project-content">
      Research paper on advanced aerial mapping techniques using deep learning.
      <br><br>
      <a href="https://www.arxiv.org/abs/2410.00769" target="_blank">View Paper</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">Research</span>
      <span class="project-tag">Computer Vision</span>
      <span class="project-tag">arXiv</span>
    </div>
  </div>
</div>

<figure>
    <img src="../assets/images/photo_in_farm.jpg" alt="Working in the field" width="150">
    <figcaption>I enjoy working close to the field and clients. </figcaption>
</figure>