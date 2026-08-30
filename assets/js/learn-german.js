/* /learn/german behaviour.
   Session: Quiz mode — cards start collapsed, tap reveals, one control toggles
   all, a counter shows how many are open; a direction switch (word / meaning /
   cloze) sets data-german-direction on the root and mirrors it in the URL hash.
   Index: Glossary items collapsed, tap reveals the Meaning.
   Prompt: Copy button.
   Stateless: nothing persists across loads. Without JS the stylesheet leaves
   everything open (keys off html.js). */

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

  /* Direction */
  var directionButtons = Array.prototype.slice.call(root.querySelectorAll("[data-german-direction]"));
  var directions = directionButtons.map(function (b) { return b.getAttribute("data-german-direction"); });

  function setDirection(direction, updateHash) {
    if (directions.indexOf(direction) === -1) return;
    root.setAttribute("data-german-direction", direction);
    directionButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-german-direction") === direction));
    });
    cards.forEach(function (card) { setOpen(card, false); });
    refreshControls();
    if (updateHash && window.history && history.replaceState) {
      history.replaceState(null, "", direction === "word" ? location.pathname + location.search : "#" + direction);
    }
  }

  directionButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      setDirection(b.getAttribute("data-german-direction"), true);
    });
  });

  setDirection(location.hash.replace("#", "") || "word", false);
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

/* Prompt page — copy the element named in data-german-copy. */
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
