/* /learn/german — Quiz mode for a Session page.
   Cards start collapsed (Word only); tapping a card toggles it; one control
   toggles all. Stateless on purpose: nothing is persisted across loads.
   Without JS the stylesheet shows everything (it keys off html.js). */
(function () {
  var root = document.querySelector("[data-german-session]");
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll("[data-german-card]"));
  var toggleAll = root.querySelector("[data-german-toggle-all]");

  function isOpen(card) {
    return card.classList.contains("is-open");
  }

  function setOpen(card, open) {
    card.classList.toggle("is-open", open);
    var button = card.querySelector("[data-german-card-toggle]");
    if (button) button.setAttribute("aria-expanded", String(open));
  }

  function allOpen() {
    return cards.length > 0 && cards.every(isOpen);
  }

  function refreshToggleAll() {
    if (!toggleAll) return;
    var open = allOpen();
    toggleAll.textContent = open ? "Hide all" : "Show all";
    toggleAll.setAttribute("aria-pressed", String(open));
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
      refreshToggleAll();
    });
  });

  if (toggleAll) {
    toggleAll.addEventListener("click", function () {
      var open = !allOpen();
      cards.forEach(function (card) { setOpen(card, open); });
      refreshToggleAll();
    });
  }

  refreshToggleAll();
})();
