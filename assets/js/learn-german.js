/* /learn/german — the three bits of behaviour the section has.
   Session page: Quiz mode. Cards start collapsed (Word only); tapping a card
   reveals its answer half; one control toggles all and a counter shows how many
   are open.
   Index page: Glossary items start collapsed (Word + Session links); tapping one
   reveals its Meaning.
   Prompt page: a Copy button puts the brief on the clipboard.
   Stateless on purpose: nothing is persisted across loads. With JavaScript off
   the stylesheet leaves every card and every Meaning open (it keys off html.js). */

/* Shared: should a tap on `target` toggle its container? Real links keep
   behaving as links, and a text selection is left alone instead of collapsing
   the element under it. */
function germanTapShouldToggle(target) {
  if (target.closest && target.closest("a")) return false;
  var selection = window.getSelection ? window.getSelection() : null;
  return !(selection && String(selection).length > 0);
}

/* Session page — Quiz mode */
(function () {
  var root = document.querySelector("[data-german-session]");
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll("[data-german-card]"));
  var toggleAll = document.querySelector("[data-german-toggle-all]");
  var progress = document.querySelector("[data-german-progress]");

  function isOpen(card) {
    return card.classList.contains("is-open");
  }

  function setOpen(card, open) {
    card.classList.toggle("is-open", open);
    var button = card.querySelector("[data-german-card-toggle]");
    if (button) button.setAttribute("aria-expanded", String(open));
  }

  function openCount() {
    return cards.filter(isOpen).length;
  }

  function refreshControls() {
    var open = openCount();
    if (progress) {
      progress.textContent = open + " / " + cards.length + " revealed";
    }
    if (toggleAll) {
      var all = cards.length > 0 && open === cards.length;
      toggleAll.textContent = all ? "Hide all" : "Show all";
      toggleAll.setAttribute("aria-pressed", String(all));
    }
  }

  cards.forEach(function (card) {
    setOpen(card, false);
    card.addEventListener("click", function (event) {
      if (!germanTapShouldToggle(event.target)) return;
      setOpen(card, !isOpen(card));
      refreshControls();
    });
  });

  if (toggleAll) {
    toggleAll.addEventListener("click", function () {
      var open = openCount() !== cards.length;
      cards.forEach(function (card) { setOpen(card, open); });
      refreshControls();
    });
  }

  refreshControls();
})();

/* Index page — Glossary */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-german-gloss]"));
  if (items.length === 0) return;

  function setOpen(item, open) {
    item.classList.toggle("is-open", open);
    var button = item.querySelector("[data-german-gloss-toggle]");
    if (button) button.setAttribute("aria-expanded", String(open));
  }

  items.forEach(function (item) {
    setOpen(item, false);
    item.addEventListener("click", function (event) {
      if (!germanTapShouldToggle(event.target)) return;
      setOpen(item, !item.classList.contains("is-open"));
    });
  });
})();

/* Prompt page — copy the brief. The button names the element to copy in
   data-german-copy; without JavaScript it is hidden and the text is still there
   to select by hand. */
(function () {
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-german-copy]"));
  if (buttons.length === 0) return;

  buttons.forEach(function (button) {
    var label = button.textContent;
    button.addEventListener("click", function () {
      var source = document.getElementById(button.getAttribute("data-german-copy"));
      if (!source) return;
      var text = source.textContent;
      var done = function (ok) {
        button.textContent = ok ? "Copied" : "Copy failed";
        setTimeout(function () { button.textContent = label; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var range = document.createRange();
        range.selectNodeContents(source);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        done(document.execCommand && document.execCommand("copy"));
        selection.removeAllRanges();
      }
    });
  });
})();
