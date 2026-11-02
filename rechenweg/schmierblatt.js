/* Schmierblatt (14.10.2026) – Nebenrechnungen mit dem Finger, wie auf dem Probenblatt.
 *
 * Für die Generalprobe Mathe: In der echten Probe darf Paul auf dem Blatt Nebenrechnungen
 * machen. Eine Zerlegung in Schritte oder ein Prüfen der Zwischenergebnisse gäbe es dort nicht,
 * deshalb hier nur eine freie Fläche zum Schreiben. Sie prüft nichts, verrät nichts,
 * speichert nichts (kein Schreibvorgang, kein localStorage) und ist beim nächsten Teil wieder leer.
 *
 *   window.Schmierblatt.malen(huelle)  -> legt Knopf und Fläche in die Hülle
 *
 * Rechnen-Knopf im Lernquiz (30.10.2026, Auftrag 179, nur Paul): dieselbe Fläche, mit opts:
 *   window.Schmierblatt.malen(huelle, { knopf: "✏️ Rechnen", werkzeug: true, auf: fn })
 *   werkzeug: Stiftfarben, Radierer, "Alles löschen" (statt "Leeren"); ein Stift (Apple Pencil)
 *   hat Vorrang vor der Hand: Hat die Fläche einmal einen Stift gesehen, zeichnet ein Finger
 *   nicht mehr mit (Handballen). Ohne opts ist alles wie vorher (Generalprobe Mathe).
 *
 * Lineal (02.11.2026, Auftrag 192, nur Paul, nur mit werkzeug und lineal: true): Paul: "Ohne Lineal
 * und so will ich die leere Hand nicht haben." Zwei Knöpfe kommen dazu, zuerst versteckt:
 *   "📏 Lineal": an/aus. An = Finger oder Stift ansetzen, ziehen, loslassen gibt eine gerade Linie,
 *     beim Ziehen als Vorschau. Anfang und Ende rasten an den Kästchenecken ein, unter 8 Grad
 *     Abweichung wird die Linie waagerecht oder senkrecht. Farbe wie gewählt; der Stift bleibt frei.
 *   "↶ Zurück": nimmt den letzten Strich zurück (Stift, Lineal, Radierer, "Alles löschen").
 * huelle.sbLineal(true) zeigt die Knöpfe (rechenflaeche.js nach dem Schalter "lineal").
 */
(function () {
  "use strict";
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  var FARBEN = [["Schwarz", "#1f2937"], ["Blau", "#1d4ed8"], ["Grün", "#047857"]];

  function malen(huelle, opts) {
    if (!huelle) return;
    opts = opts || {};
    var wz = !!opts.werkzeug;
    huelle.innerHTML = "";
    huelle.classList.add("sb", "sb-zu");
    var knopf = el("button", "sb-auf", opts.knopf || "✏️ Schmierblatt für Nebenrechnungen");
    knopf.type = "button";
    knopf.setAttribute("aria-expanded", "false");
    var koerper = el("div", "sb-koerper");
    var flaeche = el("canvas", "sb-flaeche");
    flaeche.setAttribute("aria-label", wz ? "Rechenfläche: hier mit Stift oder Finger rechnen" : "Schmierblatt: hier mit dem Finger rechnen");
    var leeren = el("button", "sb-leeren", wz ? "Alles löschen" : "Leeren");
    leeren.type = "button";
    var farbe = null, radiert = false, leiste = null, lineal = false, linKnopf = null, zurueck = null;
    if (wz) {
      leiste = el("div", "sb-leiste");
      FARBEN.forEach(function (f, n) {
        var b = el("button", "sb-farbe" + (n === 0 ? " an" : ""));
        b.type = "button";
        b.setAttribute("aria-label", "Stift " + f[0]);
        b.setAttribute("aria-pressed", n === 0 ? "true" : "false");
        b.dataset.farbe = f[1];
        b.appendChild(el("i")).style.background = f[1];
        leiste.appendChild(b);
      });
      var rad = el("button", "sb-radierer", "Radierer");
      rad.type = "button"; rad.setAttribute("aria-pressed", "false");
      leiste.appendChild(rad);
      if (opts.lineal) {
        linKnopf = el("button", "sb-lineal", "📏 Lineal");
        linKnopf.type = "button"; linKnopf.setAttribute("aria-pressed", "false"); linKnopf.hidden = true;
        zurueck = el("button", "sb-zurueck", "↶ Zurück");
        zurueck.type = "button"; zurueck.hidden = true; zurueck.disabled = true;
        leiste.appendChild(linKnopf); leiste.appendChild(zurueck);
      }
      leiste.appendChild(leeren);
      farbe = FARBEN[0][1];
      leiste.addEventListener("click", function (ev) {
        var b = ev.target.closest ? ev.target.closest("button") : null;
        if (!b || b === leeren || b === zurueck) return;
        if (b === linKnopf) {
          /* Lineal an/aus; vom Radierer aus geht es mit der letzten Farbe weiter. */
          lineal = radiert ? true : !lineal; radiert = false;
        } else {
          radiert = b === rad;
          if (!radiert) farbe = b.dataset.farbe;
        }
        [].forEach.call(leiste.querySelectorAll(".sb-farbe,.sb-radierer"), function (x) {
          var an = radiert ? x === rad : (x !== rad && x.dataset.farbe === farbe);
          x.classList.toggle("an", an); x.setAttribute("aria-pressed", an ? "true" : "false");
        });
        if (linKnopf) {
          var la = lineal && !radiert;
          linKnopf.classList.toggle("an", la); linKnopf.setAttribute("aria-pressed", la ? "true" : "false");
        }
      });
      koerper.appendChild(leiste);
      koerper.appendChild(flaeche);
    } else {
      koerper.appendChild(flaeche);
      koerper.appendChild(leeren);
    }
    huelle.appendChild(knopf);
    huelle.appendChild(koerper);

    var ctx = null, zieht = false, letzter = null, stiftDa = false, aktiv = null;
    var verlauf = [], linStart = null, linBild = null, linEnde = null;
    function linealAn() { return !!(linKnopf && !linKnopf.hidden && lineal && !radiert); }
    function merken() {
      if (!zurueck || zurueck.hidden || !ctx) return;
      try { verlauf.push(ctx.getImageData(0, 0, flaeche.width, flaeche.height)); } catch (e) { return; }
      if (verlauf.length > 20) verlauf.shift();
      zurueck.disabled = false;
    }
    /* Kästchengitter: 24 px, die Linien liegen im Inhaltsbereich (innerhalb des Rahmens). Die
       Zeichenfläche ist auf die volle Breite samt Rahmen gerechnet - deshalb umrechnen, damit
       eine Lineal-Linie genau auf einer Kästchenlinie liegt. */
    var GITTER = 24;
    function gitterPunkt(e) {
      var r = flaeche.getBoundingClientRect();
      var cw = flaeche.clientWidth || r.width, ch = flaeche.clientHeight || r.height;
      var sx = Math.min(Math.max(e.clientX - r.left - flaeche.clientLeft, 0), cw);
      var sy = Math.min(Math.max(e.clientY - r.top - flaeche.clientTop, 0), ch);
      return { sx: sx, sy: sy, kx: r.width / cw, ky: r.height / ch, cw: cw, ch: ch };
    }
    function rasten(v, max) { var g = Math.round(v / GITTER) * GITTER; return Math.min(Math.max(g, 0), Math.floor(max / GITTER) * GITTER); }
    function linieRechnen(a, b) {
      var x1 = rasten(a.sx, a.cw), y1 = rasten(a.sy, a.ch), x2, y2;
      var dx = b.sx - a.sx, dy = b.sy - a.sy;
      var w = Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI;
      if (w < 8) { x2 = rasten(b.sx, b.cw); y2 = y1; }
      else if (w > 82) { x2 = x1; y2 = rasten(b.sy, b.ch); }
      else { x2 = rasten(b.sx, b.cw); y2 = rasten(b.sy, b.ch); }
      /* +0.5: die Kästchenlinie ist 1 px breit und liegt am Anfang jedes Kästchens. */
      return { x1: (x1 + 0.5) * a.kx, y1: (y1 + 0.5) * a.ky, x2: (x2 + 0.5) * a.kx, y2: (y2 + 0.5) * a.ky, laenge: Math.hypot(x2 - x1, y2 - y1) };
    }
    function linieZeigen(endeEv) {
      if (linBild) ctx.putImageData(linBild, 0, 0);
      var l = linieRechnen(linStart, gitterPunkt(endeEv)); linEnde = l;
      if (!l.laenge) return;
      ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
    }
    function stil() {
      if (!ctx || !wz) return;
      ctx.globalCompositeOperation = radiert ? "destination-out" : "source-over";
      ctx.lineWidth = radiert ? 22 : 3;
      ctx.strokeStyle = farbe; ctx.fillStyle = farbe;
    }
    function groesse() {
      var r = flaeche.getBoundingClientRect(), d = window.devicePixelRatio || 1;
      if (!r.width) return;
      var alt = null;
      if (flaeche.width) { try { alt = ctx.getImageData(0, 0, flaeche.width, flaeche.height); } catch (e) {} }
      flaeche.width = Math.round(r.width * d); flaeche.height = Math.round(r.height * d);
      ctx = flaeche.getContext("2d");
      if (alt) ctx.putImageData(alt, 0, 0);
      if (alt && (alt.width !== flaeche.width || alt.height !== flaeche.height)) { verlauf = []; if (zurueck) zurueck.disabled = true; }
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 3;
      ctx.strokeStyle = getComputedStyle(flaeche).color || "#172033";
    }
    function punkt(e) { var r = flaeche.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    flaeche.addEventListener("pointerdown", function (e) {
      if (!ctx) groesse(); if (!ctx) return;
      if (wz) {
        if (e.pointerType === "pen") stiftDa = true;
        else if (stiftDa && e.pointerType === "touch") { e.preventDefault(); return; }   // Handballen
        if (zieht && aktiv !== e.pointerId) return;                                      // zweiter Finger
        aktiv = e.pointerId; stil();
        merken();
        if (linealAn()) {
          zieht = true; linStart = gitterPunkt(e); linEnde = null;
          try { linBild = ctx.getImageData(0, 0, flaeche.width, flaeche.height); } catch (x) { linBild = null; }
          try { flaeche.setPointerCapture(e.pointerId); } catch (x) {}
          e.preventDefault(); return;
        }
      }
      linStart = null;
      zieht = true; letzter = punkt(e);
      try { flaeche.setPointerCapture(e.pointerId); } catch (x) {}
      ctx.beginPath(); ctx.arc(letzter.x, letzter.y, wz && radiert ? 11 : 1.5, 0, 6.3); if (!wz) ctx.fillStyle = ctx.strokeStyle; ctx.fill();
      e.preventDefault();
    });
    flaeche.addEventListener("pointermove", function (e) {
      if (!zieht || !ctx) return;
      if (wz && aktiv !== e.pointerId) return;
      if (linStart) { linieZeigen(e); e.preventDefault(); return; }
      var p = punkt(e);
      ctx.beginPath(); ctx.moveTo(letzter.x, letzter.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      letzter = p; e.preventDefault();
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) { flaeche.addEventListener(n, function (e) {
      if (wz && aktiv !== null && e.pointerId !== aktiv) return;
      if (linStart && zieht) {
        /* Abgebrochen oder nur getippt: nichts stehen lassen und den Zurück-Schritt wieder wegnehmen. */
        if (e.type === "pointercancel" || !linEnde || !linEnde.laenge) {
          if (linBild) ctx.putImageData(linBild, 0, 0);
          if (verlauf.length) verlauf.pop();
          if (zurueck) zurueck.disabled = !verlauf.length;
        } else linieZeigen(e);
        linStart = null; linBild = null;
      }
      zieht = false; aktiv = null;
    }); });
    leeren.addEventListener("click", function () { if (ctx) { merken(); ctx.clearRect(0, 0, flaeche.width, flaeche.height); } });
    if (zurueck) zurueck.addEventListener("click", function () {
      if (!ctx || !verlauf.length) return;
      ctx.putImageData(verlauf.pop(), 0, 0);
      zurueck.disabled = !verlauf.length;
    });
    huelle.sbLineal = function (zeigen) {
      if (!linKnopf) return;
      linKnopf.hidden = zurueck.hidden = !zeigen;
      if (!zeigen) { lineal = false; linKnopf.classList.remove("an"); linKnopf.setAttribute("aria-pressed", "false"); verlauf = []; zurueck.disabled = true; }
    };
    knopf.addEventListener("click", function () {
      var zu = !huelle.classList.contains("sb-zu");
      huelle.classList.toggle("sb-zu", zu);
      knopf.setAttribute("aria-expanded", zu ? "false" : "true");
      if (!zu) { groesse(); stil(); if (opts.auf) opts.auf(huelle); }
    });
  }
  window.Schmierblatt = { malen: malen };
})();
