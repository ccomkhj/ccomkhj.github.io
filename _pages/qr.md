---
layout: splash
permalink: /qr/
title: "Huijo Kim — QR"
description: "Scan to open Huijo Kim's contact card."
classes:
  - wide
  - qr-page
author_profile: false
sitemap: false
noindex: true
---

<div class="qr-screen">
  <h1 class="qr-name">Huijo Kim</h1>
  <img class="qr-img" src="/assets/images/huijo-card.png" alt="QR code linking to https://www.huijo.xyz/card">
  <p class="qr-hint">scan to connect</p>
  <p class="qr-url">huijo.xyz/card</p>
</div>

<style>
  /* Single-purpose display page: hide all site chrome, plain white, max scan reliability */
  .masthead, .page__footer, .initial-content > footer { display: none !important; }
  html, body { background: #fff !important; height: 100%; }
  body { min-height: 100vh; }
  .initial-content, .splash, .page__content { background: #fff !important; }
  #main {
    padding: 0 !important;
    max-width: none !important;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .page__content { padding: 0 !important; margin: 0 !important; width: 100%; }
  article.page .page__inner-wrap {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }

  .qr-screen {
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #111;
    padding: 24px;
  }
  .qr-name {
    margin: 0 0 28px;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    border: none;
    color: #111;
  }
  .qr-img {
    width: min(72vmin, 460px);
    height: min(72vmin, 460px);
    display: block;
    margin: 0 auto;
    image-rendering: pixelated;
  }
  .qr-hint {
    margin: 28px 0 2px;
    font-size: 1.1rem;
    font-weight: 600;
    color: #111;
    letter-spacing: 0.02em;
  }
  .qr-url {
    margin: 0;
    font-family: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.95rem;
    color: #888;
  }
</style>
