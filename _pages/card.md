---
layout: splash
permalink: /card/
title: "Huijo Kim — Contact card"
description: "Huijo Kim — Data Scientist at voids.ai. Building data products & agents, ex-founder."
classes: card98-page
author_profile: false
sitemap: false
noindex: true
---
{%- comment -%}
  huijo.vcf as a Windows Address Book "Properties" dialog. Opened from the QR code on
  /qr/, so phone first. Styles: _sass/_card98.scss. Keep the rows in step with
  assets/huijo.vcf, so Add to Contacts saves what the page shows.
{%- endcomment -%}
<section class="window card98" aria-labelledby="card98-name">
  {% include title-bar98.html title="📇 Huijo Kim Properties" close="/" dialog=true %}
  <div class="window-body">
    <menu role="tablist" class="card98-tabs" aria-label="Contact details">
      <li role="tab" aria-selected="true" aria-controls="card98-summary"><a href="#card98-summary">Summary</a></li>
      <li role="tab" aria-controls="card98-business"><a href="#card98-business">Business</a></li>
    </menu>

    <div class="card98-panels">
    <div class="window card98-panel" role="tabpanel" id="card98-summary">
      <div class="card98-id">
        <img class="card98-photo" src="{{ '/assets/images/huijo_voids_profile.jpeg' | relative_url }}" alt="" width="72" height="72">
        <div class="read98">
          <h1 class="card98-name" id="card98-name">Huijo Kim</h1>
          <p class="card98-role">Data Scientist at voids</p>
          <p class="card98-sub">Building data products &amp; agents</p>
        </div>
      </div>
      <ul class="card98-list field98 read98">
        <li><a class="card98-row" href="https://www.linkedin.com/in/khj17" target="_blank" rel="noopener"><span class="glyph98" aria-hidden="true">🔗</span><span class="card98-k">LinkedIn</span><span class="card98-v">linkedin.com/in/khj17</span></a></li>
        <li><a class="card98-row" href="https://github.com/ccomkhj" target="_blank" rel="noopener"><span class="glyph98" aria-hidden="true">🐙</span><span class="card98-k">GitHub</span><span class="card98-v">github.com/ccomkhj</span></a></li>
        <li><a class="card98-row" href="mailto:huijo.kim@voids.ai"><span class="glyph98" aria-hidden="true">✉️</span><span class="card98-k">Work e-mail</span><span class="card98-v">huijo.kim@voids.ai</span></a></li>
        <li><a class="card98-row" href="mailto:ccomkhj@gmail.com"><span class="glyph98" aria-hidden="true">📧</span><span class="card98-k">Personal e-mail</span><span class="card98-v">ccomkhj@gmail.com</span></a></li>
        <li><a class="card98-row" href="tel:+4915205981504"><span class="glyph98" aria-hidden="true">📱</span><span class="card98-k">Mobile</span><span class="card98-v">+49 152 0598 1504</span></a></li>
        <li><a class="card98-row" href="{{ '/' | relative_url }}"><span class="glyph98" aria-hidden="true">🌐</span><span class="card98-k">Web page</span><span class="card98-v">huijo.xyz</span></a></li>
      </ul>
    </div>

    <div class="window card98-panel" role="tabpanel" id="card98-business">
      <dl class="card98-fields read98">
        <dt>Company</dt><dd><a href="https://voids.ai" target="_blank" rel="noopener">voids</a></dd>
        <dt>Job title</dt><dd>Data Scientist</dd>
        <dt>Building</dt><dd>Data products &amp; agents</dd>
        <dt>Previously</dt><dd>Cofounder, <a href="https://hexafarms.com" target="_blank" rel="noopener">hexafarms</a> (agtech)</dd>
        <dt>Earlier</dt><dd>EV development, Hyundai Motor Group</dd>
        <dt>More</dt><dd><a href="{{ '/about/' | relative_url }}">About me</a> · <a href="{{ '/writings/' | relative_url }}">Writings</a></dd>
      </dl>
    </div>
    </div>

    <div class="buttons98 card98-buttons">
      <a class="btn98 btn98--default card98-save" href="{{ '/assets/huijo.vcf' | relative_url }}"><span class="glyph98" aria-hidden="true">📇</span>Add to Contacts</a>
      <a class="btn98" href="{{ '/' | relative_url }}">Open huijo.xyz</a>
    </div>
  </div>
</section>

<script>
  /* Tabs. Without JS the tab strip stays hidden and both panels show. */
  (function () {
    var tabs = document.querySelectorAll(".card98-tabs [role=tab]");
    function show(tab) {
      tabs.forEach(function (t) {
        t.setAttribute("aria-selected", t === tab);
        document.getElementById(t.getAttribute("aria-controls")).hidden = t !== tab;
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function (e) { e.preventDefault(); show(t); });
    });
    show(tabs[0]);
  })();
</script>
