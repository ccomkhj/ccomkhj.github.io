(function () {
  function addCopyButtons() {
    var blocks = document.querySelectorAll(
      "article.page .page__content .highlighter-rouge"
    );
    blocks.forEach(function (block) {
      if (block.querySelector(".copy-code-button")) return;

      var pre = block.querySelector("pre");
      if (!pre) return;

      var lang = "";
      block.classList.forEach(function (cls) {
        var m = cls.match(/^language-(.+)$/);
        if (m) lang = m[1];
      });
      if (lang) block.setAttribute("data-lang", lang);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-code-button";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy code to clipboard");

      btn.addEventListener("click", function () {
        var code = pre.innerText;
        var done = function () {
          btn.textContent = "Copied!";
          btn.classList.add("copied");
          setTimeout(function () {
            btn.textContent = "Copy";
            btn.classList.remove("copied");
          }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(done, function () {});
        } else {
          var ta = document.createElement("textarea");
          ta.value = code;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
            done();
          } catch (e) {}
          document.body.removeChild(ta);
        }
      });

      block.appendChild(btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addCopyButtons);
  } else {
    addCopyButtons();
  }
})();
