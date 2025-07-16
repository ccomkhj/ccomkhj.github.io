---
layout: single
class: wide
permalink: /immobilien/
author_profile: false
sitemap: false
---

<style>
  :root {
    --primary-color: #2E7D32; /* Main Green */
    --secondary-color: #55a65a; /* Lighter Green */
    --background-color: #f4f7f6;
    --card-background: #ffffff;
    --text-color: #333333;
    --subtle-text-color: #666666;
    --accent-color: #2E7D32; /* Kept for consistency */
    --border-radius: 12px;
    --shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }

  .immo-page-container {
    font-family: var(--font-sans);
    background-color: var(--background-color);
    color: var(--text-color);
    max-width: 900px;
    margin: 2rem auto;
    padding: 1rem;
    animation: fadeIn 0.8s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .immo-header {
    text-align: center;
    margin-bottom: 3rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e0e0e0;
  }

  .immo-header h1 {
    font-size: 2.5rem;
    color: var(--primary-color);
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .immo-header p {
    font-size: 1.1rem;
    color: var(--subtle-text-color);
  }

  .immo-card {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 2rem;
    margin-bottom: 2rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .immo-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
  }

  .immo-card h2 {
    font-size: 1.8rem;
    color: var(--primary-color);
    margin-top: 0;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid var(--secondary-color);
    padding-bottom: 0.5rem;
  }

  .about-section {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2rem;
  }

  .about-text {
    flex: 1; 
    min-width: 300px;
    line-height: 1.7;
  }
  
  .about-text a {
    color: var(--primary-color);
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px dotted var(--primary-color);
  }

  .family-photo {
    flex-basis: 250px;
    text-align: center;
  }

  .family-photo img {
    max-width: 100%;
    border-radius: var(--border-radius);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .glance-box {
    background-color: #f8faff;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 2rem;
    border-left: 4px solid var(--primary-color);
  }

  .glance-box h3 {
    margin-top: 0; color: var(--primary-color);
  }

  .glance-box ul {
    padding-left: 0; list-style: none;
  }
  .glance-box li {
    margin-bottom: 0.75rem;
    position: relative;
    padding-left: 25px;
  }
  .glance-box li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--accent-color);
    font-weight: bold;
  }

  .docs-link {
    display: inline-block;
    background-color: var(--primary-color);
    color: white;
    padding: 12px 25px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: background-color 0.3s ease;
    margin-bottom: 1.5rem;
  }

  .docs-link:hover {
    background-color: var(--secondary-color);
  }

  .docs-list ul {
    list-style-type: none;
    padding: 0;
  }

  .docs-list li {
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }
  .docs-list li:not(:last-child) { margin-bottom: 10px; }
  .docs-list li:hover { background-color: #f8faff; }

  .docs-list .icon {
    color: var(--accent-color);
    margin-right: 15px;
    font-size: 1.5rem;
  }

  .contact-card {
    background: var(--primary-color);
    color: white;
    text-align: center;
  }
  .contact-card h2 { color: white; border-bottom-color: rgba(255,255,255,0.5); }
  .contact-card p { color: rgba(255,255,255,0.9); }
  .contact-card a { color: white; text-decoration: underline; }

  /* Password Modal */
  .modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex; justify-content: center; align-items: center;
    opacity: 0; visibility: hidden; transition: all 0.3s ease;
    z-index: 1000;
  }
  .modal-overlay.active {
    opacity: 1; visibility: visible;
  }
  .modal-content {
    background: white; padding: 2.5rem; border-radius: var(--border-radius);
    width: 90%; max-width: 400px; text-align: center;
    transform: scale(0.9); transition: transform 0.3s ease;
  }
  .modal-overlay.active .modal-content { transform: scale(1); }
  .modal-content h3 { margin-top: 0; color: var(--primary-color); }
  .modal-content p { margin-bottom: 1.5rem; color: var(--subtle-text-color); }
  .modal-input {
    width: 100%; padding: 12px; margin-bottom: 1rem;
    border: 1px solid #ccc; border-radius: 8px; font-size: 1rem;
  }
  .modal-button {
    width: 100%; padding: 12px; border: none; border-radius: 8px;
    background: var(--primary-color); color: white; font-size: 1rem; cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .modal-button:hover { background: var(--secondary-color); }
  .modal-error {
    color: #d93025; margin-top: 10px; font-size: 0.9rem; display: none;
  }
</style>

<div class="immo-page-container">
  <header class="immo-header">
    <h1>Bewerbungsunterlagen für Ihre Immobilie</h1>
    <p>Alle relevanten Unterlagen für Ihre Beurteilung</p>
  </header>

  <section class="immo-card">
    <h2>Über uns</h2>
    <div class="about-section">
      <div class="about-text">
        <p>
          Hallo, danke, dass Sie meine Familie als Mieterin in Betracht ziehen.<br>
          Mein Name ist Huijo Kim, habe an der RWTH den Master in Robotik studiert und bin danach in den Bereichen KI und Daten tätig. Ich arbeite als Data Scientist bei einem renommierten Unternehmen (<a href="https://www.voids.ai/" target="_blank">VOIDS technology GmbH</a>).<br>
          Meine kleine Familie besteht aus meiner Frau Eunhye, unserem 6 Monate alten Baby Ijun und mir. <br>
          Wir haben keine Haustiere, wir rauchen nicht und leben ruhig. Als verantwortungsvolle und zuverlässige Mieter legen wir großen Wert auf einen gepflegten Wohnraum und ein harmonisches Mietverhältnis.
        </p>
      </div>
    </div>
    <div class="family-photo" style="text-align: center; margin-top: 2rem;">
      <img src="../img/family_photo.jpeg" alt="Unsere Familie">
    </div>
    <div class="glance-box">
      <h3>Auf einen Blick:</h3>
      <ul>
        <li><strong>Einkommen:</strong> - EUR netto monatlich aus meiner neuen Anstellung</li>
        <li><strong>Berufliche Veränderung:</strong> Neue Position, vorher - EUR, jetzt - EUR netto</li>
        <li><strong>Umzugszeitpunkt:</strong> Flexibel, idealerweise im August 2025</li>
        <li><strong>Unterlagen:</strong> Vollständige Dokumente sofort verfügbar</li>
      </ul>
    </div>
  </section>

  <section class="immo-card">
    <h2>Bereitgestellte Dokumente</h2>
    <p>Für Ihre umfassende Beurteilung stellen wir alle erforderlichen Dokumente in einem gemeinsamen Google Drive-Ordner bereit. Klicken Sie hier, um darauf zuzugreifen:</p>
    <a href="#" class="docs-link" onclick="showPasswordModal(event)">Google Drive-Ordner öffnen ↗</a>
    <div class="docs-list">
      <p>In diesem Ordner finden Sie folgende Dokumente:</p>
      <ul>
        <li><span class="icon">✓</span> <div><strong>Mieterselbstauskunft</strong><br><small>Vollständig ausgefüllt mit allen persönlichen Angaben</small></div></li>
        <li><span class="icon">✓</span> <div><strong>Gehaltsnachweise der letzten 3 Monate</strong><br><small>Nachweis stabiler Einkommensverhältnisse</small></div></li>
        <li><span class="icon">✓</span> <div><strong>SCHUFA-Auskunft</strong><br><small>Aktuelle Bonitätsauskunft ohne negative Einträge</small></div></li>
        <li><span class="icon">✓</span> <div><strong>Mietzahlungsbestätigung</strong><br><small>Nachweis pünktlicher Mietzahlungen</small></div></li>
      </ul>
    </div>
  </section>

  <section class="immo-card contact-card">
    <h2>Kontaktaufnahme</h2>
    <p>Über die Möglichkeit, die Wohnung zu besichtigen, würde ich mich sehr freuen. Gerne stehe ich für weitere Informationen zur Verfügung.</p>
    <p>
      <strong>Huijo Kim</strong> | Data Scientist<br>
      <a href="mailto:ccomkhj@gmail.com">ccomkhj@gmail.com</a> | 
      <a href="tel:+4915205981504">+49 152 05981504</a>
    </p>
  </section>
</div>

<!-- Password Modal HTML -->
<div id="passwordModal" class="modal-overlay">
  <div class="modal-content" onclick="event.stopPropagation();">
    <h3>Passwort erforderlich</h3>
    <p>Bitte geben Sie das Passwort ein, um auf die Dokumente zuzugreifen.</p>
    <input type="password" id="passwordInput" class="modal-input" placeholder="Passwort">
    <div id="passwordError" class="modal-error">Falsches Passwort.</div>
    <button id="passwordSubmit" class="modal-button">Zugriff</button>
  </div>
</div>

<script>
  const modal = document.getElementById('passwordModal');
  const passwordInput = document.getElementById('passwordInput');
  const passwordSubmit = document.getElementById('passwordSubmit');
  const passwordError = document.getElementById('passwordError');

  function showPasswordModal(event) {
    event.preventDefault();
    modal.classList.add('active');
    passwordInput.focus();
  }

  function hidePasswordModal() {
    modal.classList.remove('active');
    passwordInput.value = '';
    passwordError.style.display = 'none';
  }

  function checkPassword() {
    const correctPassword = "0525";
    if (passwordInput.value === correctPassword) {
      window.open("https://drive.google.com/drive/folders/1vdixMRH9mG4E_mh8-8kFYuMthsRJuNwT?usp=sharing", "_blank");
      hidePasswordModal();
    } else {
      passwordError.style.display = 'block';
      passwordInput.focus();
    }
  }

  // Event Listeners
  passwordSubmit.addEventListener('click', checkPassword);
  passwordInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      checkPassword();
    }
  });
  modal.addEventListener('click', hidePasswordModal);
</script>
