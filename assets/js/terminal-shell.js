/* Interactive terminal engine. Reads window.TerminalCommands (loaded first),
   runs the boot sequence, handles input/history, dispatches commands. */
(function () {
  "use strict";

  var PROMPT = "whoami@huijo.xyz:~$";

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function startLorenz() {
    var canvas = document.getElementById("math-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var width, height;
    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);
    }
    window.addEventListener("resize", resize);
    resize();
    var x = 0.1, y = 0, z = 0, sigma = 10, rho = 28, beta = 8 / 3, dt = 0.01;
    function draw() {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 255, 100, 0.4)";
      ctx.lineWidth = 0.8;
      for (var i = 0; i < 20; i++) {
        ctx.moveTo(width / 2 + x * 15, height / 2 + z * 10 - 200);
        var dx = sigma * (y - x) * dt;
        var dy = (x * (rho - z) - y) * dt;
        var dz = (x * y - beta * z) * dt;
        x += dx; y += dy; z += dz;
        ctx.lineTo(width / 2 + x * 15, height / 2 + z * 10 - 200);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(5, 5, 5, 0.01)";
      ctx.fillRect(0, 0, width, height);
      requestAnimationFrame(draw);
    }
    draw();
  }

  function init() {
    startLorenz();

    var container = document.getElementById("terminal-container");
    var outputDiv = document.getElementById("terminal-output");
    var inputLine = document.getElementById("terminal-input-line");
    var inputField = document.getElementById("terminal-input");
    if (!outputDiv || !inputField || !inputLine) return;

    var history = [];
    var historyIndex = 0;

    function scrollToBottom() {
      if (container) container.scrollTop = container.scrollHeight;
    }

    var ctx = {
      print: function (text) {
        var div = document.createElement("div");
        div.className = "terminal-line";
        div.textContent = text;
        outputDiv.appendChild(div);
      },
      printHTML: function (html) {
        var div = document.createElement("div");
        div.className = "terminal-line";
        div.innerHTML = html;
        outputDiv.appendChild(div);
      },
      clear: function () { outputDiv.innerHTML = ""; },
      navigate: function (url) { window.location.href = url; },
      lunr: {
        get idx() { return typeof idx !== "undefined" ? idx : null; },
        get store() { return typeof store !== "undefined" ? store : null; }
      },
      commands: window.TerminalCommands || [],
      history: history
    };

    function findCommand(name) {
      var list = window.TerminalCommands || [];
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.name === name || (c.aliases && c.aliases.indexOf(name) !== -1)) return c;
      }
      return null;
    }

    function run(line) {
      var trimmed = line.trim();
      var echo = document.createElement("div");
      echo.className = "terminal-line";
      echo.innerHTML = "<span class='terminal-prompt'>" + PROMPT + "</span> " + escapeHtml(trimmed);
      outputDiv.appendChild(echo);

      if (trimmed === "") { scrollToBottom(); return; }
      history.push(trimmed);
      historyIndex = history.length;

      var name = trimmed.split(/\s+/)[0].toLowerCase();
      var argStr = trimmed.slice(name.length).trim();
      var cmd = findCommand(name);
      if (!cmd) {
        ctx.print("command not found: " + name + ". type 'help' for a list.");
      } else {
        ctx.args = argStr;
        try { cmd.run(argStr, ctx); }
        catch (err) { ctx.print("error: " + err.message); }
      }
      scrollToBottom();
    }

    inputField.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var val = inputField.value;
        inputField.value = "";
        run(val);
      } else if (e.key === "ArrowUp") {
        if (!history.length) return;
        historyIndex = Math.max(0, historyIndex - 1);
        inputField.value = history[historyIndex] || "";
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (!history.length) return;
        historyIndex = Math.min(history.length, historyIndex + 1);
        inputField.value = history[historyIndex] || "";
        e.preventDefault();
      }
    });

    if (container) {
      container.addEventListener("click", function () { inputField.focus(); });
    }

    function showPrompt() {
      inputLine.style.display = "flex";
      inputField.focus();
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get("cmd") === "cat_bio") {
      showPrompt();
      run("whoami");
      window.history.replaceState({}, document.title, "/");
      return;
    }

    var bootText = [
      "Initializing kernel...",
      "Verifying Euler's identity: e^(iπ) + 1 = 0 ... [OK]",
      "System ready.",
      "type 'help' to begin."
    ];
    var li = 0, ci = 0;
    function typeWriter() {
      if (li < bootText.length) {
        if (ci === 0) {
          var p = document.createElement("div");
          p.className = "terminal-line";
          outputDiv.appendChild(p);
        }
        var cur = bootText[li];
        var last = outputDiv.lastElementChild;
        if (ci < cur.length) {
          last.textContent += cur.charAt(ci);
          ci++;
          setTimeout(typeWriter, 18);
        } else {
          li++; ci = 0;
          setTimeout(typeWriter, 120);
        }
      } else {
        showPrompt();
      }
    }
    typeWriter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
