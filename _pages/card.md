---
layout: splash
permalink: /card/
title: "Huijo Kim — whoami"
description: "Huijo Kim — Data Scientist at voids.ai. Building data products & agents, ex-founder."
classes:
  - wide
  - card-page
author_profile: false
sitemap: false
---

<div class="window card-window">
  <div class="title-bar">
    <div class="title-bar-text">Terminal — whoami@huijo.xyz</div>
    <div class="title-bar-controls">
      <button aria-label="Minimize"></button>
      <button aria-label="Maximize"></button>
      <button aria-label="Close"></button>
    </div>
  </div>
  <div class="window-body card-window__body">

<div class="terminal-container card-terminal">
  <div class="terminal-line"><span class="terminal-prompt">whoami@huijo.xyz:~$</span> cat ./identity.json</div>
  <div class="card-id">
    <img class="card-id__avatar" src="/assets/images/huijo_voids_profile.jpeg" alt="Huijo Kim">
    <div class="card-id__lines">
      <div class="card-id__line"><span class="card-key">name</span>      = <span class="card-val">"Huijo Kim"</span></div>
      <div class="card-id__line"><span class="card-key">role</span>      = <span class="card-val">"Data Scientist @ <a class="card-inline-link" href="http://voids.ai" target="_blank" rel="noopener">voids</a>"</span></div>
      <div class="card-id__line"><span class="card-key">building</span>  = <span class="card-val">"data products &amp; agents"</span></div>
      <div class="card-id__line"><span class="card-key">prev</span>      = <span class="card-val">"cofounder, <a class="card-inline-link" href="http://hexafarms.com" target="_blank" rel="noopener">hexafarms</a>"</span></div>
    </div>
  </div>

  <div class="terminal-line">&nbsp;</div>
  <div class="terminal-line"><span class="terminal-prompt">whoami@huijo.xyz:~$</span> ls -la ./contact/</div>

  <div class="card-links">
    <a class="card-link" href="https://www.linkedin.com/in/khj17" target="_blank" rel="noopener">
      <span class="card-link__perm">-rw-r--r--</span>
      <span class="card-link__icon"><i class="fab fa-linkedin"></i></span>
      <span class="card-link__name">linkedin</span>
      <span class="card-link__val">linkedin.com/in/khj17</span>
    </a>
    <a class="card-link" href="https://github.com/ccomkhj" target="_blank" rel="noopener">
      <span class="card-link__perm">-rw-r--r--</span>
      <span class="card-link__icon"><i class="fab fa-github"></i></span>
      <span class="card-link__name">github</span>
      <span class="card-link__val">github.com/ccomkhj</span>
    </a>
    <a class="card-link" href="mailto:huijo.kim@voids.ai">
      <span class="card-link__perm">-rw-r--r--</span>
      <span class="card-link__icon"><i class="fas fa-briefcase"></i></span>
      <span class="card-link__name">email.work</span>
      <span class="card-link__val">huijo.kim@voids.ai</span>
    </a>
    <a class="card-link" href="mailto:ccomkhj@gmail.com">
      <span class="card-link__perm">-rw-r--r--</span>
      <span class="card-link__icon"><i class="fas fa-envelope"></i></span>
      <span class="card-link__name">email.personal</span>
      <span class="card-link__val">ccomkhj@gmail.com</span>
    </a>
    <a class="card-link" href="https://huijo.xyz" target="_blank" rel="noopener">
      <span class="card-link__perm">-rw-r--r--</span>
      <span class="card-link__icon"><i class="fas fa-globe"></i></span>
      <span class="card-link__name">website</span>
      <span class="card-link__val">huijo.xyz</span>
    </a>
    <div class="card-link card-link--static">
      <span class="card-link__perm">-r--------</span>
      <span class="card-link__icon"><i class="fas fa-phone"></i></span>
      <span class="card-link__name">phone</span>
      <span class="card-link__val">+49 152 0598 1504</span>
    </div>
  </div>

  <div class="terminal-line">&nbsp;</div>
  <div class="terminal-line"><span class="terminal-prompt">whoami@huijo.xyz:~$</span> ./save_contact</div>
  <a class="card-save-btn" href="/assets/huijo.vcf" download="huijo-kim.vcf">
    <i class="fas fa-address-card"></i><span>add-to-phone.vcf</span>
  </a>

  <div class="terminal-line">&nbsp;</div>
  <div class="terminal-line"><span class="terminal-prompt">whoami@huijo.xyz:~$</span> <span class="card-cursor">_</span></div>
</div>

  </div>
</div>

<style>
  /* Hide site chrome — this page is a single-purpose share card */
  .masthead, .page__footer, .initial-content > footer { display: none !important; }
  html, body { background: #000 !important; height: 100%; }
  body { min-height: 100vh; }
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

  /* 98.css window wrapper */
  .card-window {
    max-width: 680px;
    width: 92vw;
    margin: 0 auto;
  }
  .card-window__body {
    padding: 6px;
    margin: 0;
  }

  /* Inner terminal — drop its own border since the 98.css window provides chrome */
  .card-terminal {
    max-width: none;
    margin: 0;
    height: auto;
    min-height: 0;
    padding: 18px 22px;
    border-radius: 0;
  }

  /* Inline links inside identity values (company names) */
  .card-terminal .card-inline-link,
  .card-terminal .card-inline-link:visited {
    color: #33ff00 !important;
    font-weight: 700;
    text-decoration: none;
    border-bottom: none;
  }
  .card-terminal .card-inline-link:hover {
    background: #33ff00;
    color: #000 !important;
  }

  /* Identity block: avatar + key=value lines */
  .card-id {
    display: flex;
    gap: 18px;
    align-items: center;
    margin: 12px 0 8px 18px;
    position: relative;
    z-index: 3;
  }
  .card-id__avatar {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #33ff00;
    box-shadow: 0 0 12px rgba(51, 255, 0, 0.35);
    filter: grayscale(0.15) contrast(1.05);
    flex-shrink: 0;
  }
  .card-id__lines {
    color: #ccc;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.65;
  }
  .card-id__line { white-space: pre; }
  .card-key { color: #33ff00; }
  .card-val { color: #fff; }

  /* Link list — styled like `ls -la` output */
  .card-links {
    margin: 8px 0 4px 18px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    position: relative;
    z-index: 3;
  }
  .card-link {
    display: grid;
    grid-template-columns: 90px 22px 130px 1fr;
    gap: 10px;
    align-items: center;
    padding: 3px 6px;
    color: #ccc;
    text-decoration: none;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    border-bottom: 1px dashed transparent;
    transition: background 0.1s ease, color 0.1s ease;
  }
  .card-link:hover {
    background: #33ff00;
    color: #000;
    text-decoration: none;
  }
  .card-link:hover .card-link__perm,
  .card-link:hover .card-link__icon,
  .card-link:hover .card-link__name,
  .card-link:hover .card-link__val { color: #000; }
  .card-link__perm { color: #888; }
  .card-link__icon { color: #33ff00; text-align: center; }
  .card-link__name { color: #33ff00; }
  .card-link__val  { color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  /* save_contact button — boxed terminal-style CTA */
  .card-save-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0 4px 18px;
    padding: 8px 16px;
    background: rgba(51, 255, 0, 0.08);
    border: 1px solid #33ff00;
    color: #33ff00;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    text-decoration: none;
    position: relative;
    z-index: 3;
    transition: background 0.1s ease, color 0.1s ease;
  }
  .card-save-btn:hover {
    background: #33ff00;
    color: #000;
    text-decoration: none;
  }

  .card-link--static { cursor: default; }
  .card-link--static:hover { background: transparent; color: #ccc; }
  .card-link--static:hover .card-link__perm { color: #888; }
  .card-link--static:hover .card-link__icon,
  .card-link--static:hover .card-link__name { color: #33ff00; }
  .card-link--static:hover .card-link__val { color: #fff; }
  /* iOS auto-detects phone numbers and wraps them in a gray <a href="tel:"> — force white */
  .card-link__val a { color: inherit !important; text-decoration: none !important; }

  /* Blinking cursor */
  .card-cursor {
    display: inline-block;
    width: 8px;
    background: #33ff00;
    animation: card-blink 1s steps(2, start) infinite;
    color: transparent;
  }
  @keyframes card-blink { to { background: transparent; } }

  /* Make terminal text rendered above scanline overlay */
  .card-terminal > .terminal-line { position: relative; z-index: 3; }

  /* Mobile */
  /* Preserve desktop layout on mobile — shrink proportionally, no column hiding,
     allow horizontal scroll inside the terminal as a safety net on very narrow screens. */
  .card-terminal { overflow-x: auto; }
  @media (max-width: 520px) {
    .card-window { width: 98vw; }
    .card-terminal { padding: 14px 14px; }
    .card-id { gap: 14px; margin-left: 10px; }
    .card-id__avatar { width: 72px; height: 72px; }
    .card-id__lines { font-size: 11px; line-height: 1.6; }
    .card-links { margin-left: 10px; }
    .card-link {
      grid-template-columns: 72px 18px 95px 1fr;
      gap: 6px;
      font-size: 11px;
      padding: 2px 4px;
    }
  }
  @media (max-width: 360px) {
    .card-id__lines { font-size: 10px; }
    .card-link { font-size: 10px; grid-template-columns: 66px 16px 88px 1fr; }
  }
</style>

