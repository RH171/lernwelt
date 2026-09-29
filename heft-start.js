/* Startseite eines Kindes: "Bitte kurz nachsehen" und "Mein Heft".
 *
 * Bei Paul seit 25./28.09.2026 inline in paul/index.html. Mit der Uebertragung
 * auf Helena (29.09.2026, Denny: "Helena zuerst, danach Leon mit allem wie
 * Paul") steht es fuer die anderen Kinder EINMAL hier.
 *
 * Die Seite setzt vorher:
 *   window.HEFT_START = {
 *     kind: "helena",
 *     faecher: { deutsch: {n:"Deutsch", c:"#60a5fa"}, ... },   // Name und Farbe
 *     immer: ["deutsch", "mathe", "englisch"],                // auch ohne Blatt zeigen
 *     quiz: "quiz.html"                                       // Such-Spiel zu einem Blatt
 *   };
 * und hat #nachsehen / #nachsehenListe (Nachsehen) sowie #heftOeffnen,
 * #heftOverlay, #heftZu, #heftBericht (Mein Heft). Fehlt ein Teil, bleibt er
 * einfach weg.
 *
 * Kein Rot, kein Warnzeichen, keine Serie - wie bei Paul.
 */
(function () {
  "use strict";
  var H = window.HEFT_START || {};
  var KIND = H.kind;
  if (!KIND) return;
  var FACH = H.faecher || {};
  function $(i) { return document.getElementById(i); }
  function name(f) { return (FACH[f] && FACH[f].n) || (f === "anderes" ? "Etwas anderes" : f); }
  function el(tag, cls, text) {
    var x = document.createElement(tag); if (cls) x.className = cls;
    if (text != null) x.textContent = text; return x;
  }
  function tagLang(iso) { var t = String(iso || "").split("-"); return t.length === 3 ? (+t[2]) + "." + (+t[1]) + "." + t[0] : iso; }
  function tagKurz(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || "")); return m ? (+m[3]) + "." + (+m[2]) + "." : ""; }

  /* ---------- Bitte kurz nachsehen ----------
     Offene Rueckfragen zu Fach und Datum. Liest nur; geschrieben wird erst,
     wenn das Kind tippt. */
  function offen(e) {
    if (e.sichtbar === false) return [];
    var f = [];
    if (e.fachVorschlag && e.fachVorschlag !== e.fach) f.push("fach");
    if (e.datumVorschlag && e.datumVorschlag !== e.datum) f.push("datum");
    return f;
  }
  function punkt(e, was) {
    var d = el("div", "ns-punkt");
    d.setAttribute("data-offen", e.id + ":" + was);
    var titel = "„" + (e.titel || "Dein Blatt vom " + tagLang(e.datum)) + "“";
    var text = el("div", "ns-text");
    var ja = el("button", "ns-ja"), nein = el("button");
    ja.type = nein.type = "button";
    if (was === "fach") {
      text.textContent = titel + " liegt bei " + name(e.fach) + ". Es sieht aber nach " + name(e.fachVorschlag) + " aus.";
      ja.textContent = "Ist " + name(e.fachVorschlag);
      nein.textContent = "Stimmt so: " + name(e.fach);
    } else {
      text.textContent = "Auf " + titel + " lese ich das Datum " + tagLang(e.datumVorschlag) + ". Abgelegt ist es am " + tagLang(e.datum) + ".";
      ja.textContent = "Ist der " + tagLang(e.datumVorschlag);
      nein.textContent = "Stimmt so: " + tagLang(e.datum);
    }
    var k = el("div", "ns-knoepfe"); k.appendChild(ja); k.appendChild(nein);
    d.appendChild(text); d.appendChild(k);
    function antwort(w) {
      ja.disabled = nein.disabled = true;
      fetch("/api/schulstoff", { method: "PATCH", credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: KIND, id: e.id, was: w }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j || !j.ok) throw 0;
          d.innerHTML = '<div class="ns-fertig">✅ Danke, ist gemerkt.</div>';
          var rest = document.querySelectorAll("#nachsehenListe .ns-punkt .ns-knoepfe").length;
          if (!rest) setTimeout(function () { $("nachsehen").classList.add("verborgen"); }, 1800);
        })
        .catch(function () { ja.disabled = nein.disabled = false; text.textContent += " (Das hat gerade nicht geklappt – probier es nochmal.)"; });
    }
    ja.addEventListener("click", function () { antwort(was + "-bestaetigen"); });
    nein.addEventListener("click", function () { antwort(was + "-ablehnen"); });
    return d;
  }
  function nachsehen() {
    if (!$("nachsehen") || !$("nachsehenListe")) return;
    fetch("/api/schulstoff?kind=" + encodeURIComponent(KIND) + "&monate=3", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) return;
        var liste = $("nachsehenListe"); liste.innerHTML = "";
        (j.eintraege || []).forEach(function (e) {
          offen(e).forEach(function (w) { liste.appendChild(punkt(e, w)); });
        });
        $("nachsehen").classList.toggle("verborgen", !liste.children.length);
      })
      .catch(function () { /* ohne Speicher bleibt die Karte einfach zu */ });
  }

  /* ---------- Mein Heft ----------
     Je Blatt ein Balken: sitzt · uebst du noch · neu. Eine Karte "sitzt",
     wenn sie beim letzten Mal beim ersten Tipp gewusst wurde. Quelle ist die
     Wiedervorlage (fundStand), dieselbe wie "Heute lernen". */
  function kartenSchluessel(k) {
    return String((k && k.richtig) || "").toLowerCase().replace(/[^a-z0-9äöüß]+/g, "").slice(0, 40);
  }
  function heftZeichnen(box, eintraege, stand) {
    box.innerHTML = "";
    var je = {};
    (eintraege || []).forEach(function (x) {
      if (!x || x.sichtbar === false) return;
      var f = FACH[x.fach] ? x.fach : "anderes";
      (je[f] = je[f] || []).push(x);
    });
    var alleF = Object.keys(FACH); if (alleF.indexOf("anderes") < 0) alleF.push("anderes");
    var immer = H.immer || [];
    var faecher = alleF.filter(function (f) { return je[f] || immer.indexOf(f) >= 0; });
    faecher.sort(function (a, b) { return (je[b] ? je[b].length : 0) - (je[a] ? je[a].length : 0); });
    faecher.forEach(function (f) {
      var liste = (je[f] || []).slice().sort(function (a, b) { return String(b.datum).localeCompare(String(a.datum)); });
      var k = el("div", "hfach"); k.dataset.fach = f;
      var h = el("h4"), rd = el("span", "rd");
      rd.style.background = (FACH[f] && FACH[f].c) || "#94a3b8";
      h.appendChild(rd); h.appendChild(document.createTextNode(name(f)));
      h.appendChild(el("span", "hz", liste.length ? (liste.length === 1 ? "1 Blatt" : liste.length + " Blätter") : "noch kein Blatt"));
      k.appendChild(h);
      if (!liste.length) k.appendChild(el("p", "hleer", "Leg ein Blatt ins Heft, dann steht es hier."));
      liste.forEach(function (x) {
        var b = el("div", "hblatt"); b.dataset.blatt = x.id;
        var tt = el("div", "ht", x.titel || "Dein Blatt");
        var d = tagKurz(x.datum); if (d) tt.appendChild(el("span", null, " · " + d));
        b.appendChild(tt);
        var karten = Array.isArray(x.karten) ? x.karten : [];
        var s = 0, n = 0, neu = 0, gesehen = {};
        karten.forEach(function (c) {
          var key = x.id + "#k:" + kartenSchluessel(c);
          if (!c || !c.richtig || gesehen[key]) return; gesehen[key] = 1;
          var st = stand[key];
          if (!st) neu++; else if (st.f) n++; else s++;
        });
        var alle = s + n + neu;
        if (alle) {
          var bal = el("div", "hbalken");
          var bs = el("b", "s"); bs.style.width = (100 * s / alle) + "%";
          var bn = el("b", "n"); bn.style.width = (100 * n / alle) + "%";
          bal.appendChild(bs); bal.appendChild(bn); b.appendChild(bal);
          var leg = el("div", "hleg");
          if (s) leg.appendChild(el("span", "ls", s + " " + (s === 1 ? "sitzt" : "sitzen")));
          if (n) leg.appendChild(el("span", "ln", n + " übst du noch"));
          if (neu) leg.appendChild(el("span", null, neu + " neu"));
          b.appendChild(leg);
        } else {
          b.appendChild(el("p", "hleer", "Zu diesem Blatt gibt es noch keine Karten."));
        }
        if (karten.length >= 3) {
          var a = el("a", "hlos", s === alle ? "🔎 Nochmal suchen" : (s + n ? "🔎 Weiter suchen" : "🔎 Jetzt suchen"));
          a.href = (H.quiz || "quiz.html") + "?blatt=" + encodeURIComponent(x.id);
          b.appendChild(a);
        }
        k.appendChild(b);
      });
      box.appendChild(k);
    });
  }
  function heftLaden(box) {
    box.innerHTML = '<p class="hleer">Dein Heft lädt …</p>';
    var stand = {};
    fetch("/api/quiz?kind=" + encodeURIComponent(KIND) + "&nurWartend=1", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) { stand = (j && j.fundStand) || {}; })
      .catch(function () { stand = {}; })
      .then(function () { return fetch("/api/schulstoff?kind=" + encodeURIComponent(KIND) + "&monate=12", { credentials: "same-origin" }); })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (j) { heftZeichnen(box, (j && j.eintraege) || [], stand); })
      .catch(function () { box.innerHTML = '<p class="hleer">Dein Heft kommt gerade nicht. Versuch es gleich noch einmal.</p>'; });
  }
  function heftAnbinden() {
    var auf = $("heftOeffnen"), ov = $("heftOverlay"), zu = $("heftZu"), box = $("heftBericht");
    if (!auf || !ov || !box) return;
    auf.addEventListener("click", function (ev) {
      ev.preventDefault();
      heftLaden(box);
      ov.classList.add("on");
    });
    if (zu) zu.addEventListener("click", function () { ov.classList.remove("on"); });
    ov.addEventListener("click", function (ev) { if (ev.target === ov) ov.classList.remove("on"); });
  }

  window.LWHeftStart = { zeichnen: heftZeichnen };
  function los() { nachsehen(); heftAnbinden(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los); else los();
})();
