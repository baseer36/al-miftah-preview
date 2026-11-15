(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- mobile nav ---------------- */
  var burger = $("#burger"), nav = $("#nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------------- language menu ---------------- */
  var lb = $("#langBtn"), lm = $("#langMenu");
  if (lb && lm) {
    lb.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var open = lm.classList.toggle("open");
      lb.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (ev) {
      if (!lm.contains(ev.target) && ev.target !== lb) {
        lm.classList.remove("open");
        lb.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        lm.classList.remove("open");
        lb.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------- hero slider: 3 slides, 2.5s each ---------------- */
  var slides = $$(".hero-slide"), dots = $$("#heroDots button"), i = 0, timer = null;

  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle("on", k === i); });
    dots.forEach(function (d, k) {
      if (k === i) { d.setAttribute("aria-current", "true"); }
      else { d.removeAttribute("aria-current"); }
    });
  }
  function start() {
    if (reduced || slides.length < 2) return;
    stop();
    timer = setInterval(function () { show(i + 1); }, 2500);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  if (slides.length) {
    dots.forEach(function (d) {
      d.addEventListener("click", function () { show(+d.dataset.i); start(); });
    });
    var hero = $(".hero");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      hero.addEventListener("focusin", stop);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { stop(); } else { start(); }
    });
    start();
  }

  /* ---------------- registration form ---------------- */
  var form = $("#regForm");
  if (form) {
    /* preselect the course from ?course=slug */
    try {
      var want = new URLSearchParams(location.search).get("course");
      var sel = $("#course", form);
      if (want && sel) {
        $$("option", sel).forEach(function (o) { if (o.value === want) { sel.value = want; } });
      }
    } catch (err) { /* older browsers: leave the default */ }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var note = $("#formNote");
      var btn = $("button[type=submit]", form);
      var errorHtml = note ? (note.getAttribute("data-err") || note.innerHTML) : "";
      if (note && !note.getAttribute("data-err")) { note.setAttribute("data-err", errorHtml); }

      function show(html, asText) {
        if (!note) { return; }
        if (asText) { note.textContent = html; } else { note.innerHTML = html; }
        note.hidden = false;
        note.focus();
        note.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      }

      if (form.reportValidity && !form.reportValidity()) { return; }

      var label = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.textContent = form.getAttribute("data-sending") || "…"; }

      fetch(form.action, { method: "POST", body: new FormData(form), headers: { "Accept": "application/json" } })
        .then(function (r) { return r.json().then(function (j) { return j && j.ok; }); })
        .catch(function () { return false; })
        .then(function (ok) {
          if (btn) { btn.disabled = false; btn.innerHTML = label; }
          if (ok) { show(form.getAttribute("data-ok") || "OK", true); form.reset(); }
          else { show(errorHtml, false); }
        });
    });
  }

  /* ---------------- active nav ---------------- */
  var here = location.pathname.replace(/index\.html$/, "");
  if (here.length > 1) { here = here.replace(/\/$/, ""); }
  $$(".nav a").forEach(function (a) {
    var p = a.getAttribute("href").replace(/\/$/, "");
    if (p && p !== "" && here.indexOf(p) === 0) { a.classList.add("on"); }
  });
})();
