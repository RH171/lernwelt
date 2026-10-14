/* Fehlerkreis (14.10.2026): Kreise über einem Blattfoto - nie im Foto.
 *
 * Denny am 14.10.2026, 14:16 Uhr: "Könntest du bei den Vorschauen, wo noch
 * verbessert werden muss, umkringeln, wo der Fehler ist?" - und um 14:19 Uhr:
 * Ist es verbessert, steht die Verbesserung auf dem Bild, mit "durch Claude".
 *
 *   LWKreis.legen(img, kreise, { klein, fokus })  ->  { setzen(kreise), aktiv(id), weg() }
 *
 *   kreise: [{ s, x, y, b, h, art: "offen"|"gut", id?, text? }]   (Prozent des Bildes, s = Seite ab 0)
 *     offen  roter Kreis: hier ist etwas nachzusehen
 *     gut    grüner Kreis mit der richtigen Antwort und "verbessert · durch Claude"
 *   klein    Vorschau: dünne Linie, statt Schrift nur ein ✓ (die Zeile "verbessert ·
 *            durch Claude" steht dann neben der Vorschau)
 *   fokus    Vorschau mit object-fit: cover - die Bildlage rückt so, dass der
 *            (aktive) Kreis zu sehen ist
 *
 * Das Foto wird nie verändert: eine Ebene (div.lwk-lage) liegt genau über dem
 * sichtbaren Bildinhalt - object-fit contain/cover wird nachgerechnet. Die
 * Seite des Bildes steht in img[data-seite] (so setzt es /blatt-seiten.js);
 * gezeigt werden nur die Kreise dieser Seite. Ohne Kreise: keine Ebene.
 * Jeder Kreis bleibt innerhalb des Bildes.
 */
(function () {
  "use strict";
  var ROT = "#dc2626", GRUEN = "#15803d";

  function stilEinmal() {
    if (document.getElementById("lwk-stil")) return;
    var st = document.createElement("style");
    st.id = "lwk-stil";
    st.textContent = [
      ".lwk-lage{position:absolute;pointer-events:none;z-index:2}",
      ".lwk-ring{position:absolute;box-sizing:border-box;border-radius:50%;border:4px solid " + ROT + ";",
      "box-shadow:0 0 0 2px rgba(255,255,255,.85),inset 0 0 0 1px rgba(255,255,255,.6)}",
      ".lwk-ring.lwk-gut{border-color:" + GRUEN + "}",
      ".lwk-klein .lwk-ring{border-width:2px;box-shadow:0 0 0 1px rgba(255,255,255,.9)}",
      ".lwk-ring.lwk-aktiv{border-width:6px}",
      ".lwk-klein .lwk-ring.lwk-aktiv{border-width:3px}",
      ".lwk-lage.lwk-mitaktiv .lwk-ring:not(.lwk-aktiv){opacity:.45}",
      "@media (prefers-reduced-motion:no-preference){.lwk-ring.lwk-aktiv{animation:lwkPuls 1.6s ease-in-out 3}}",
      "@keyframes lwkPuls{50%{transform:scale(1.08)}}",
      ".lwk-schild{position:absolute;background:" + GRUEN + ";color:#fff;border-radius:10px;padding:4px 8px;",
      "font:800 15px/1.2 ui-rounded,-apple-system,system-ui,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.35);",
      "max-width:min(320px,90%);overflow-wrap:anywhere;text-align:left}",
      ".lwk-schild small{display:block;font-weight:700;font-size:12px;opacity:.95}",
      ".lwk-haken{position:absolute;width:16px;height:16px;border-radius:50%;background:" + GRUEN + ";color:#fff;",
      "font:900 11px/16px system-ui,sans-serif;text-align:center;box-shadow:0 0 0 1px #fff}"
    ].join("");
    (document.head || document.documentElement).appendChild(st);
  }

  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }
  function klemm(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* Wo liegt der Bildinhalt im <img>? (object-fit contain/cover/fill, Lage 50 % oder fokus) */
  function inhalt(img, lage) {
    var cw = img.clientWidth, ch = img.clientHeight, nw = img.naturalWidth, nh = img.naturalHeight;
    if (!cw || !ch || !nw || !nh) return null;
    var fit = (window.getComputedStyle ? getComputedStyle(img).objectFit : "") || "fill";
    var dw = cw, dh = ch;
    if (fit === "contain" || fit === "scale-down") { var k = Math.min(cw / nw, ch / nh); dw = nw * k; dh = nh * k; }
    else if (fit === "cover") { var c = Math.max(cw / nw, ch / nh); dw = nw * c; dh = nh * c; }
    var px = lage ? lage[0] : 0.5, py = lage ? lage[1] : 0.5;
    return { l: img.offsetLeft + (cw - dw) * px, t: img.offsetTop + (ch - dh) * py, b: dw, h: dh };
  }

  function legen(img, kreise, opt) {
    if (!img) return { setzen: function () {}, aktiv: function () {}, weg: function () {} };
    stilEinmal();
    var o = opt || {};
    var liste = [], aktivId = null, lage = null;
    var eltern = img.parentNode;
    if (eltern && window.getComputedStyle && getComputedStyle(eltern).position === "static") eltern.style.position = "relative";
    var ebene = document.createElement("div");
    ebene.className = "lwk-lage" + (o.klein ? " lwk-klein" : "");
    ebene.setAttribute("aria-hidden", "true");
    if (eltern) eltern.insertBefore(ebene, img.nextSibling);

    function seite() { return num(img.getAttribute("data-seite")); }
    function sichtbar() {
      var s = seite();
      return liste.filter(function (k) { return num(k.s) === s && num(k.b) > 0 && num(k.h) > 0; });
    }
    function fokusLage(ks) {
      /* Nur bei cover: die Lage so wählen, dass der Kreis mitten im Ausschnitt liegt. */
      if (!o.fokus || !ks.length || (window.getComputedStyle && getComputedStyle(img).objectFit !== "cover")) return null;
      var k = ks.filter(function (x) { return x.id && x.id === aktivId; })[0] || ks[0];
      var cx = (num(k.x) + num(k.b) / 2) / 100, cy = (num(k.y) + num(k.h) / 2) / 100;
      var cw = img.clientWidth, ch = img.clientHeight, nw = img.naturalWidth, nh = img.naturalHeight;
      if (!cw || !nw) return null;
      var c = Math.max(cw / nw, ch / nh), dw = nw * c, dh = nh * c;
      var px = dw > cw + 1 ? klemm((cx * dw - cw / 2) / (dw - cw), 0, 1) : 0.5;
      var py = dh > ch + 1 ? klemm((cy * dh - ch / 2) / (dh - ch), 0, 1) : 0.5;
      img.style.objectPosition = Math.round(px * 100) + "% " + Math.round(py * 100) + "%";
      return [px, py];
    }

    function malen() {
      var ks = sichtbar();
      ebene.innerHTML = "";
      if (!ks.length) { ebene.style.display = "none"; return; }
      lage = fokusLage(ks);
      var r = inhalt(img, lage);
      if (!r) { ebene.style.display = "none"; return; }
      ebene.style.display = "";
      /* Die Ebene ist nur so groß wie das sichtbare <img> - bei cover wird der
         Rest abgeschnitten, Kreise rechnen trotzdem im ganzen Bild. */
      ebene.style.left = r.l + "px"; ebene.style.top = r.t + "px";
      ebene.style.width = r.b + "px"; ebene.style.height = r.h + "px";
      ebene.classList.toggle("lwk-mitaktiv", !!aktivId && ks.some(function (k) { return k.id === aktivId; }));
      var pad = o.klein ? 3 : Math.max(6, Math.min(14, r.b * 0.012));
      ks.forEach(function (k) {
        var x0 = klemm(num(k.x) / 100 * r.b - pad, 0, r.b), y0 = klemm(num(k.y) / 100 * r.h - pad, 0, r.h);
        var x1 = klemm((num(k.x) + num(k.b)) / 100 * r.b + pad, 0, r.b), y1 = klemm((num(k.y) + num(k.h)) / 100 * r.h + pad, 0, r.h);
        if (x1 - x0 < 4 || y1 - y0 < 4) return;
        var ring = document.createElement("div");
        ring.className = "lwk-ring" + (k.art === "gut" ? " lwk-gut" : "") + (k.id && k.id === aktivId ? " lwk-aktiv" : "");
        if (k.id) ring.setAttribute("data-stelle", k.id);
        ring.setAttribute("data-art", k.art || "offen");
        ring.style.left = x0 + "px"; ring.style.top = y0 + "px";
        ring.style.width = (x1 - x0) + "px"; ring.style.height = (y1 - y0) + "px";
        ebene.appendChild(ring);
        if (k.art !== "gut") return;
        if (o.klein) {
          var hk = document.createElement("div");
          hk.className = "lwk-haken"; hk.textContent = "✓";
          hk.style.left = klemm(x1 - 10, 0, r.b - 16) + "px"; hk.style.top = klemm(y0 - 6, 0, r.h - 16) + "px";
          ebene.appendChild(hk);
          return;
        }
        var sch = document.createElement("div");
        sch.className = "lwk-schild";
        sch.innerHTML = (k.text ? "✓ " + esc(k.text) : "✓ verbessert") + "<small>verbessert · durch Claude</small>";
        ebene.appendChild(sch);
        var sb = sch.offsetWidth, sh = sch.offsetHeight;
        var oben = y0 - sh - 4;
        sch.style.left = klemm(x0, 0, Math.max(0, r.b - sb)) + "px";
        sch.style.top = (oben >= 0 ? oben : klemm(y1 + 4, 0, Math.max(0, r.h - sh))) + "px";
      });
    }
    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }
    var beob = null;
    try { beob = new ResizeObserver(function () { malen(); }); beob.observe(img); } catch (e) {}
    function geladen() { malen(); }
    img.addEventListener("load", geladen);
    window.addEventListener("resize", malen);
    var api = {
      setzen: function (ks) { liste = (ks || []).slice(); malen(); },
      aktiv: function (id) { aktivId = id || null; malen(); },
      malen: malen,
      ebene: ebene,
      weg: function () {
        if (beob) try { beob.disconnect(); } catch (e) {}
        img.removeEventListener("load", geladen);
        window.removeEventListener("resize", malen);
        if (ebene.parentNode) ebene.parentNode.removeChild(ebene);
      }
    };
    api.setzen(kreise);
    return api;
  }

  /* Aus Server-Daten Kreise bauen: offene Stellen rot, Verbesserungen grün. */
  function ausStellen(stellen, gruen) {
    var aus = [];
    (stellen || []).forEach(function (s) {
      (s.ort || []).forEach(function (o) { aus.push({ s: o.s, x: o.x, y: o.y, b: o.b, h: o.h, art: "offen", id: s.id }); });
    });
    (gruen || []).forEach(function (g) { aus.push({ s: g.s, x: g.x, y: g.y, b: g.b, h: g.h, art: "gut", text: g.text || "" }); });
    return aus;
  }

  window.LWKreis = { legen: legen, ausStellen: ausStellen };
})();
