/* /learn/german — Quiz mode for a Session page.
   Cards start collapsed (Word only); tapping a card reveals its answer half;
   one control toggles all and a counter shows how many are open.
   Stateless on purpose: nothing is persisted across loads. With JavaScript off
   the stylesheet leaves every card open (it keys off html.js). */
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
      // Let real links inside a card behave as links, and leave a text
      // selection alone instead of collapsing the card under it.
      if (event.target.closest && event.target.closest("a")) return;
      var selection = window.getSelection ? window.getSelection() : null;
      if (selection && String(selection).length > 0) return;
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
