/* „✏️ Mein Rechenweg“ (14.10.2026) – Paul schreibt seine eigenen Rechnungen Zeile für Zeile auf.
 *
 * Beschluss Denny (13./14.10.2026): Sobald eine Aufgabe zwei oder mehr Rechenschritte braucht,
 * hat Paul in jeder Übung eine Möglichkeit, den Rechenweg für sich aufzuzeichnen. Anlass: Foto
 * „Paul hat 60 €. Er kauft 4 Hefte, jedes kostet 6 €. Wie viel Geld bleibt ihm?“ mit nur einem Feld.
 *
 * - Eigener Tastenblock: Ziffern, + − · : =, ⌫, „Neue Zeile“. Keine Bildschirmtastatur.
 * - Jede fertige Zeile („Neue Zeile“) rechnet der Code still nach: ✓ oder „schau noch mal“.
 *   Die richtige Zahl wird nie gezeigt. Mit { pruefen:false } (Generalprobe) gibt es keine Marken.
 * - Das Ergebnis einer Zeile lässt sich antippen: in die aktuelle Zeile übernehmen oder (wenn die
 *   Seite opts.uebernehmen mitgibt) ins Antwortfeld.
 * - Nichts wird gespeichert (kein localStorage, kein Schreibvorgang). Der Rechenweg steht nur,
 *   solange die Aufgabe offen ist, auch nach einem Fehlversuch.
 *
 *   MeinWeg.schritte(text)            -> Zahl der Rechenzeichen zwischen Zahlen (ab 2: Feld zeigen)
 *   MeinWeg.malen(huelle, opts)       -> { zeilen(), leeren() }
 *       opts: { pruefen (Standard true), uebernehmen: function(zahlText), offen: bool, beimOeffnen: fn(offen) }
 *   MeinWeg.zeile("9 · 4 = 36")       -> true | false | null (nicht nachrechenbar)
 */
(function (wurzel) {
  "use strict";

  /* Rechenzeichen zwischen zwei Zahlen zählen: „50 − 9 · 4“ -> 2, „7 · 80“ -> 1.
     Der Doppelpunkt zählt nur zwischen Ziffern (sonst Satzzeichen), der Bindestrich nur mit Leerraum
     oder zwischen Ziffern. */
  function schritte(text) {
    var t = String(text || "").replace(/(\d)\.(\d{3})/g, "$1$2");
    var m = t.match(/\d\s*[+−–\-·×*:÷\/]\s*(?=\(?\s*\d)/g);
    return m ? m.length : 0;
  }

  function lies(ausdruck) {
    var t = String(ausdruck).replace(/[−–]/g, "-").replace(/[·×]/g, "*").replace(/[:÷]/g, "/").replace(/\s+/g, "");
    if (!/^\d+([-+*\/]\d+)*$/.test(t)) return null;
    var tok = t.match(/\d+|[-+*\/]/g).map(function (x) { return /\d/.test(x) ? +x : x; });
    for (var i = 1; i < tok.length; i += 2) {
      if (tok[i] === "*" || tok[i] === "/") {
        var a = tok[i - 1], b = tok[i + 1], w = tok[i] === "*" ? a * b : (b ? a / b : NaN);
        tok.splice(i - 1, 3, w); i -= 2;
      }
    }
    var v = tok[0];
    for (var j = 1; j < tok.length; j += 2) v = tok[j] === "+" ? v + tok[j + 1] : v - tok[j + 1];
    return isFinite(v) ? v : null;
  }
  /* Eine Zeile nachrechnen: alle Teile zwischen „=“ müssen gleich viel ergeben, und mindestens ein
     Teil muss ein Rechenzeichen haben. */
  function zeile(text) {
    var teile = String(text || "").split("=").map(function (s) { return s.trim(); });
    if (teile.length < 2 || teile.some(function (s) { return !s; })) return null;
    if (!teile.some(function (s) { return /[+−\-·:]/.test(s); })) return null;
    var w = teile.map(lies);
    if (w.some(function (x) { return x == null; })) return null;
    return w.every(function (x) { return Math.abs(x - w[0]) < 1e-9; });
  }
  function ergebnis(text) {
    var m = /=\s*(\d+)\s*$/.exec(String(text || ""));
    return m ? m[1] : null;
  }

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  var TASTEN = ["7", "8", "9", "+", "−", "4", "5", "6", "·", ":", "1", "2", "3", "=", "weg", "0", "neu"];

  function malen(huelle, opts) {
    opts = opts || {};
    var pruefen = opts.pruefen !== false;
    huelle.innerHTML = "";
    huelle.classList.add("mw");
    var zeilen = [{ t: "", fertig: false }];
    var knopf = el("button", "mw-auf", "✏️ Mein Rechenweg");
    knopf.type = "button";
    var koerper = el("div", "mw-koerper");
    var liste = el("div", "mw-zeilen");
    liste.setAttribute("aria-live", "polite");
    var block = el("div", "mw-block");
    block.setAttribute("role", "group");
    block.setAttribute("aria-label", "Tasten für den Rechenweg");
    TASTEN.forEach(function (w) {
      var b = el("button", "mw-taste" + (w === "neu" ? " mw-neu" : w === "weg" ? " mw-weg" : /\d/.test(w) ? "" : " mw-zeichen"),
        w === "neu" ? "↵ Neue Zeile" : w === "weg" ? "⌫" : w);
      b.type = "button";
      b.setAttribute("data-mw", w);
      if (w === "weg") b.setAttribute("aria-label", "Löschen");
      block.appendChild(b);
    });
    koerper.appendChild(liste);
    koerper.appendChild(block);
    huelle.appendChild(knopf);
    huelle.appendChild(koerper);

    function offen(an) {
      huelle.classList.toggle("mw-zu", !an);
      knopf.setAttribute("aria-expanded", an ? "true" : "false");
      knopf.textContent = an ? "✏️ Mein Rechenweg ▴" : "✏️ Mein Rechenweg";
    }
    offen(!!opts.offen);

    function zeichnen() {
      liste.innerHTML = "";
      zeilen.forEach(function (z, i) {
        var aktiv = i === zeilen.length - 1;
        var r = el("div", "mw-zeile" + (aktiv ? " aktiv" : ""));
        var txt = el("span", "mw-text", z.t || (aktiv ? "" : "–"));
        r.appendChild(txt);
        if (z.fertig && pruefen) {
          var ok = zeile(z.t);
          if (ok === true) r.appendChild(el("span", "mw-ok", "✓"));
          else if (ok === false) r.appendChild(el("span", "mw-schau", "schau noch mal"));
        }
        var erg = z.fertig ? ergebnis(z.t) : null;
        if (erg != null) {
          var a = el("button", "mw-nimm", erg + " ⤵");
          a.type = "button"; a.setAttribute("data-nimm", erg); a.setAttribute("aria-label", erg + " in die neue Zeile");
          r.appendChild(a);
          if (opts.uebernehmen) {
            var b = el("button", "mw-antwort", erg + " → Antwort");
            b.type = "button"; b.setAttribute("data-antwort", erg);
            r.appendChild(b);
          }
        }
        liste.appendChild(r);
      });
    }
    function aktuell() { return zeilen[zeilen.length - 1]; }
    function taste(w) {
      var z = aktuell();
      if (w === "neu") {
        if (!z.t.trim()) return;
        z.fertig = true; zeilen.push({ t: "", fertig: false });
        if (zeilen.length > 12) zeilen.shift();
      } else if (w === "weg") {
        if (z.t) z.t = z.t.replace(/\s*\S\s*$/, "");
        else if (zeilen.length > 1) { zeilen.pop(); aktuell().fertig = false; }
      } else if (z.t.length < 40) {
        z.t += /\d/.test(w) ? (/\d$/.test(z.t) || !z.t ? w : " " + w) : (z.t ? " " : "") + w;
      }
      zeichnen();
    }
    huelle.onclick = function (e) {   // onclick statt addEventListener: neu zeichnen hängt nichts doppelt an
      var t = e.target.closest ? e.target : null; if (!t) return;
      var k = t.closest("[data-mw]"), n = t.closest("[data-nimm]"), a = t.closest("[data-antwort]");
      if (t.closest(".mw-auf")) { var an = huelle.classList.contains("mw-zu"); offen(an); if (opts.beimOeffnen) opts.beimOeffnen(an); }
      else if (k) taste(k.getAttribute("data-mw"));
      else if (n) { var z = aktuell(); z.t += (z.t && !/\s$/.test(z.t) ? " " : "") + n.getAttribute("data-nimm"); zeichnen(); }
      else if (a && opts.uebernehmen) opts.uebernehmen(a.getAttribute("data-antwort"));
      else return;
      e.stopPropagation();   // die Seite soll diese Tipper nicht als ihre eigenen Tasten deuten
    };
    zeichnen();
    return {
      zeilen: function () { return zeilen.map(function (z) { return z.t; }); },
      leeren: function () { zeilen = [{ t: "", fertig: false }]; zeichnen(); },
      offen: offen
    };
  }

  var MW = { schritte: schritte, zeile: zeile, lies: lies, ergebnis: ergebnis, malen: malen };
  if (typeof module !== "undefined" && module.exports) module.exports = MW;
  else wurzel.MeinWeg = MW;
})(typeof window !== "undefined" ? window : this);
