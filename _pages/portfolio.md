---
layout: portfolio
class: wide
permalink: /portfolio/
author_profile: false
title: "portfolio"
description: "Agent systems, multi-agent workflows, agentic ML tools, and selected applied machine learning work by Huijo Kim."
---

## I. Agent Systems

<div class="projects-grid projects-grid--agent">
  <!-- Agent Workflows & Skills -->
  <div class="project-card project-card--half">
    <div class="project-title-bar">
      <span>Agent Workflows & Skills</span>
      <span class="project-status project-status--maintained">Maintained</span>
    </div>
    <div class="project-flow" aria-label="Specification to goal to measured agent loop to reviewed pull request">
      <span class="project-flow-step">spec</span>
      <span class="project-flow-arrow" aria-hidden="true">→</span>
      <span class="project-flow-step">goal</span>
      <span class="project-flow-arrow" aria-hidden="true">→</span>
      <span class="project-flow-step">race / ratchet</span>
      <span class="project-flow-arrow" aria-hidden="true">→</span>
      <span class="project-flow-step">reviewed PR</span>
    </div>
    <div class="project-content">
      Versioned agent workflows for long-horizon execution, multi-model review, measured optimization, and agent-tool hygiene.
      <ul>
        <li>Long-haul loops turn a request into a verifiable goal and keep only measured wins</li>
        <li>Dual-haul races independent Claude and Codex worktrees under the same check</li>
        <li>Pair workflows add bounded consultation, optimization, review, and test gates</li>
      </ul>
      <a href="https://github.com/ccomkhj/skills" target="_blank" rel="noopener noreferrer">Explore the skill collection</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">Agent Harnesses</span>
      <span class="project-tag">Multi-Agent</span>
      <span class="project-tag">Claude + Codex</span>
    </div>
  </div>

  <!-- Continuous Improvement Harness -->
  <div class="project-card project-card--half">
    <div class="project-title-bar">
      <span>Continuous Improvement Harness</span>
      <span class="project-status project-status--beta">Beta · v0.2.5</span>
    </div>
    <div class="project-flow" aria-label="Audit to isolated agent teams to test-driven verification to merge">
      <span class="project-flow-step">audit</span>
      <span class="project-flow-arrow" aria-hidden="true">→</span>
      <span class="project-flow-step">agent teams</span>
      <span class="project-flow-arrow" aria-hidden="true">→</span>
      <span class="project-flow-step">TDD gate</span>
      <span class="project-flow-arrow" aria-hidden="true">→</span>
      <span class="project-flow-step">merge</span>
    </div>
    <div class="project-content">
      Multi-agent system that audits a codebase, finds high-value improvements, and ships only mechanically verified changes.
      <ul>
        <li>High-planner dispatches scoped work to isolated, disposable worktrees</li>
        <li>Non-LLM verifier proves red → green and re-runs the full test suite</li>
        <li>PyPI CLI, HTML reports, and no-push/no-bulk-stage safety boundaries</li>
      </ul>
      <a href="https://github.com/ccomkhj/continuous-improvement-harness" target="_blank" rel="noopener noreferrer">View release and architecture</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">Multi-Agent</span>
      <span class="project-tag">TDD</span>
      <span class="project-tag">Agent Safety</span>
    </div>
  </div>

  <!-- Agentune -->
  <div class="project-card project-card--third">
    <div class="project-title-bar">
      <span>Agentune</span>
      <span class="project-status project-status--maintained">Maintained</span>
    </div>
    <a href="https://github.com/ccomkhj/agentune" target="_blank" rel="noopener noreferrer">
      <img src="https://raw.githubusercontent.com/ccomkhj/agentune/main/assets/logo.png" alt="Agentune logo" class="project-image">
    </a>
    <div class="project-content">
      Agent-driven hyperparameter optimization with Optuna — Claude Code adapts the search strategy round-by-round.
      <ul>
        <li>Agent diagnoses convergence and parameter importance through MCP</li>
        <li>Optuna keeps every round deterministic across three boosting backends</li>
        <li>Guardrailed decisions and self-contained campaign reports</li>
      </ul>
      <a href="https://github.com/ccomkhj/agentune" target="_blank" rel="noopener noreferrer">View on GitHub</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">Agentic ML</span>
      <span class="project-tag">MCP</span>
      <span class="project-tag">Optuna</span>
    </div>
  </div>

  <!-- Agent Materialize -->
  <div class="project-card project-card--third">
    <div class="project-title-bar">
      <span>Agent Materialize</span>
      <span class="project-status project-status--prototype">Prototype</span>
    </div>
    <div class="project-content">
      Foundation layer for agents over Postgres — agent-curated materialized views behind a two-role access boundary.
      <ul>
        <li>Setup and runtime MCP servers; agents never touch base tables</li>
        <li>Access boundary is enforced inside Postgres, not the app layer</li>
        <li>SQL lineage, refresh history, and a static operations dashboard</li>
      </ul>
      <a href="https://github.com/ccomkhj/agent_materialize" target="_blank" rel="noopener noreferrer">View on GitHub</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">MCP</span>
      <span class="project-tag">Postgres</span>
      <span class="project-tag">Agent Data Layer</span>
    </div>
  </div>

  <!-- Polarize -->
  <div class="project-card project-card--third">
    <div class="project-title-bar">
      <span>Polarize</span>
      <span class="project-status project-status--prototype">Prototype</span>
    </div>
    <div class="project-content">
      Agent-native CLI that discovers compute-heavy pandas operations and validates their Polars conversions.
      <ul>
        <li>Ranks conversion targets by estimated impact using AST analysis</li>
        <li>Checks equivalent output before benchmarking time and memory</li>
        <li>Returns structured JSON designed for autonomous optimization loops</li>
      </ul>
      <a href="https://github.com/ccomkhj/polarize" target="_blank" rel="noopener noreferrer">View on GitHub</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">Agent Tools</span>
      <span class="project-tag">Pandas → Polars</span>
      <span class="project-tag">Verification</span>
    </div>
  </div>
</div>

## II. Applied ML & Data Systems

<div class="projects-grid projects-grid--applied">
  <!-- Drone Vision -->
  <div class="project-card">
    <div class="project-title-bar">
      <span>Drone Vision</span>
      <span class="project-status">Field system</span>
    </div>
    <a href="https://youtu.be/AqAXgcsjH5k" target="_blank" rel="noopener noreferrer">
      <img src="../img/demo_video.PNG" alt="Drone Vision demo" class="project-image">
    </a>
    <div class="project-content">
      Integrated drone vision system with trajectory planning, object detection, and visual SLAM.
      <ul>
        <li><a href="https://github.com/ccomkhj/tello_ros_drone">Drone control using ROS2</a></li>
        <li><a href="https://github.com/HexaFarms/yolov5">Customized YOLOv5</a></li>
        <li><a href="https://github.com/ccomkhj/ORB_SLAM3">Drone visual SLAM in farming</a></li>
        <li><a href="https://github.com/ccomkhj/PCL_Plants">Point-cloud processing</a></li>
      </ul>
    </div>
    <div class="project-tags">
      <span class="project-tag">Computer Vision</span>
      <span class="project-tag">ROS2</span>
      <span class="project-tag">SLAM</span>
    </div>
  </div>

  <!-- Cancer Detector -->
  <div class="project-card">
    <div class="project-title-bar">
      <span>Cancer Detector</span>
      <span class="project-status">Research system</span>
    </div>
    <div class="project-content">
      End-to-end pipeline for multi-class segmentation and classification on prostate MRI data.
      <ul>
        <li>Config-driven modular architecture with layered YAML composition</li>
        <li>HPC/SLURM sweeps with automatic model promotion</li>
        <li>Research runner orchestrating data import through inference</li>
      </ul>
      <a href="https://github.com/ccomkhj/cancer_detector" target="_blank" rel="noopener noreferrer">View on GitHub</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">Deep Learning</span>
      <span class="project-tag">Medical Imaging</span>
      <span class="project-tag">MRI Segmentation</span>
    </div>
  </div>

  <!-- Event Inventory Kafra -->
  <div class="project-card">
    <div class="project-title-bar">
      <span>Event Inventory</span>
      <span class="project-status">Systems demo</span>
    </div>
    <div class="project-content">
      Event-driven inventory sync replacing daily batch pulls with near-real-time Shopify webhook updates.
      <ul>
        <li>Shopify webhooks → FastAPI → Kafka (KRaft) → PostgreSQL</li>
        <li>Idempotent and order-safe with partition-keyed messages</li>
        <li>Containerized with a mock webhook generator for local testing</li>
      </ul>
      <a href="https://github.com/ccomkhj/event_inventory_kafra" target="_blank" rel="noopener noreferrer">View on GitHub</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">Kafka</span>
      <span class="project-tag">Event-Driven</span>
      <span class="project-tag">Shopify</span>
    </div>
  </div>

  <!-- Finance Portfolio -->
  <div class="project-card">
    <div class="project-title-bar">
      <span>Finance Portfolio</span>
      <span class="project-status project-status--maintained">Maintained</span>
    </div>
    <div class="project-content">
      Plain-text, git-tracked personal portfolio manager — check, visualize, and rebalance from terminal or dashboard.
      <ul>
        <li>Drift-to-target in one command with EUR-native FX conversion</li>
        <li>Trades live in CSV, targets in YAML, and git is the audit trail</li>
        <li>Streamlit dashboard with inline editing in about 500 lines of Python</li>
      </ul>
      <a href="https://github.com/ccomkhj/finance_portfolio" target="_blank" rel="noopener noreferrer">View on GitHub</a>
    </div>
    <div class="project-tags">
      <span class="project-tag">Finance</span>
      <span class="project-tag">CLI</span>
      <span class="project-tag">Streamlit</span>
    </div>
  </div>
</div>

## III. Publications

<div class="projects-grid projects-grid--publications">
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
