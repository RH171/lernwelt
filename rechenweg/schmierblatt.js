/* Schmierblatt (14.10.2026) – Nebenrechnungen mit dem Finger, wie auf dem Probenblatt.
 *
 * Für die Generalprobe Mathe: In der echten Probe darf Paul auf dem Blatt Nebenrechnungen
 * machen. Eine Zerlegung in Schritte oder ein Prüfen der Zwischenergebnisse gäbe es dort nicht,
 * deshalb hier nur eine freie Fläche zum Schreiben. Sie prüft nichts, verrät nichts,
 * speichert nichts (kein Schreibvorgang, kein localStorage) und ist beim nächsten Teil wieder leer.
 *
 *   window.Schmierblatt.malen(huelle)  -> legt Knopf und Fläche in die Hülle
 */
(function () {
  "use strict";
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function malen(huelle) {
    if (!huelle) return;
    huelle.innerHTML = "";
    huelle.classList.add("sb", "sb-zu");
    var knopf = el("button", "sb-auf", "✏️ Schmierblatt für Nebenrechnungen");
    knopf.type = "button";
    knopf.setAttribute("aria-expanded", "false");
    var koerper = el("div", "sb-koerper");
    var flaeche = el("canvas", "sb-flaeche");
    flaeche.setAttribute("aria-label", "Schmierblatt: hier mit dem Finger rechnen");
    var leeren = el("button", "sb-leeren", "Leeren");
    leeren.type = "button";
    koerper.appendChild(flaeche);
    koerper.appendChild(leeren);
    huelle.appendChild(knopf);
    huelle.appendChild(koerper);

    var ctx = null, zieht = false, letzter = null;
    function groesse() {
      var r = flaeche.getBoundingClientRect(), d = window.devicePixelRatio || 1;
      if (!r.width) return;
      var alt = null;
      if (flaeche.width) { try { alt = ctx.getImageData(0, 0, flaeche.width, flaeche.height); } catch (e) {} }
      flaeche.width = Math.round(r.width * d); flaeche.height = Math.round(r.height * d);
      ctx = flaeche.getContext("2d");
      if (alt) ctx.putImageData(alt, 0, 0);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 3;
      ctx.strokeStyle = getComputedStyle(flaeche).color || "#172033";
    }
    function punkt(e) { var r = flaeche.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    flaeche.addEventListener("pointerdown", function (e) {
      if (!ctx) groesse(); if (!ctx) return;
      zieht = true; letzter = punkt(e);
      try { flaeche.setPointerCapture(e.pointerId); } catch (x) {}
      ctx.beginPath(); ctx.arc(letzter.x, letzter.y, 1.5, 0, 6.3); ctx.fillStyle = ctx.strokeStyle; ctx.fill();
      e.preventDefault();
    });
    flaeche.addEventListener("pointermove", function (e) {
      if (!zieht || !ctx) return;
      var p = punkt(e);
      ctx.beginPath(); ctx.moveTo(letzter.x, letzter.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      letzter = p; e.preventDefault();
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) { flaeche.addEventListener(n, function () { zieht = false; }); });
    leeren.addEventListener("click", function () { if (ctx) ctx.clearRect(0, 0, flaeche.width, flaeche.height); });
    knopf.addEventListener("click", function () {
      var zu = !huelle.classList.contains("sb-zu");
      huelle.classList.toggle("sb-zu", zu);
      knopf.setAttribute("aria-expanded", zu ? "false" : "true");
      if (!zu) { groesse(); }
    });
  }
  window.Schmierblatt = { malen: malen };
})();
