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
  /* "Heute lernen" nur zeigen, wenn es Karten gibt (29.09.2026): Helena und
     Leon hatten noch kein Blatt - ein Knopf, hinter dem nichts kommt, waere
     schlimmer als keiner. Steht auf der Seite data-nurmitkarten="1". */
  function heuteZeigen(eintraege) {
    var h = $("heuteLernen");
    if (!h || h.getAttribute("data-nurmitkarten") !== "1") return;
    var n = 0;
    (eintraege || []).forEach(function (x) {
      if (x && x.sichtbar !== false && Array.isArray(x.karten)) n += x.karten.length;
    });
    h.style.display = n >= 3 ? "" : "none";
  }
  function nachsehen() {
    if (!$("nachsehen") && !$("heuteLernen")) return;
    fetch("/api/schulstoff?kind=" + encodeURIComponent(KIND) + "&monate=3", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) return;
        // Gescheitertes Durchlesen nachholen (29.09.2026, siehe /nachlesen.js).
        if (window.LWNachlesen) LWNachlesen(KIND, j.eintraege);
        heuteZeigen(j.eintraege);
        if (!$("nachsehen") || !$("nachsehenListe")) return;
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
  /* ---------- Deine Woche mit "Kreise fuellen" ----------
     Von Paul (Variante B, Denny 29.09.2026), am selben Tag an Helena und Leon:
     "diese Dinge jetzt auch immer an Helena und Leon ausgerollt ... nur eben
     fuer ihr Alter angepasst". Die Seite gibt die Worte in H.woche mit:
       { gewusst, spaeter, offen, fuellen: "Kreise füllen", dunkel: true, gross: true }
     Ohne H.woche bleibt alles wie vorher. Kein Rot, kein "Fehler". */
  var WOCHENTAG = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  var TAG_LANG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
  function wocheStil() {
    if ($("lww-stil")) return;
    var s = document.createElement("style"); s.id = "lww-stil";
    s.textContent =
      ".lww{--wg:#047857;--wn:#1d4ed8;--ws:#8a5a00;margin:0 0 14px}" +
      "html[data-theme=dark] .lww,.lww.dunkel{--wg:#6ee7a8;--wn:#8cb8ff;--ws:#f5d77a}" +
      ".lww .wsum{border:1px solid var(--line);border-radius:14px;padding:11px 13px;margin:0 0 8px}" +
      ".lww .wleg{color:var(--muted);font-size:13.5px;margin-top:4px}" +
      ".lww i{font-style:normal;letter-spacing:1px}.lww i.g{color:var(--wg)}.lww i.n{color:var(--wn)}.lww i.s{color:var(--ws)}" +
      ".lww .wtag{display:grid;grid-template-columns:4.6em 4.4em minmax(0,1fr);gap:8px;align-items:center;" +
      "border:1px solid var(--line);border-radius:14px;padding:9px 12px;margin:0 0 6px}" +
      ".lww .wtag.heute{border-color:var(--wg)}.lww .wtag.kann{cursor:pointer}" +
      ".lww .wd{font-weight:800}.lww .wm{color:var(--muted);font-weight:600}.lww .wmsum{display:block;color:var(--ink);font-weight:800;margin-top:2px}" +
      ".lww .wp{min-width:0;overflow-wrap:anywhere;line-height:1.35;color:var(--muted)}" +
      ".lww .wfuell{grid-column:1/-1;justify-self:end;font-weight:800;color:var(--ws);min-height:48px;display:flex;align-items:center}" +
      ".lww .wknopf{display:block;width:100%;min-height:48px;margin-top:10px;border:0;border-radius:14px;" +
      "font-weight:800;font-size:16px;color:#2b2100;background:#f5d77a;cursor:pointer}" +
      ".lww .wfrage{grid-column:1/-1;border-top:1px solid var(--line);padding-top:10px}.lww .wfrage p{margin:0;font-weight:700}" +
      ".lww .wfrage.verborgen{display:none}" +
      ".lww .wspaeter{display:block;width:100%;min-height:48px;margin-top:6px;border:1px solid var(--line);border-radius:14px;" +
      "background:transparent;color:var(--ink);font-weight:700;font-size:15px;cursor:pointer}" +
      ".lww.gross .wp{font-size:19px}.lww.gross .wd,.lww.gross .wm{font-size:17px}.lww.gross .wknopf{font-size:18px;min-height:54px}";
    document.head.appendChild(s);
  }
  function gehe(u) { (window.__geheZu || function (x) { location.href = x; })(u); }
  function wocheZeichnen(box, w) {
    var W = H.woche || {};
    var mehrz = function (n) { return n + " " + (n === 1 ? (W.einKreis || "Kreis") : (W.kreise || "Kreise")); };
    box.innerHTML = "";
    box.className = "lww" + (W.dunkel ? " dunkel" : "") + (W.gross ? " gross" : "");
    var gewusst = 0, alle = 0, spaeter = 0, offenAlle = 0;
    var liste = el("div");
    (w.tage || []).forEach(function (t, i) {
      if (t.datum > w.heute) return;
      var z = el("div", "wtag"); z.dataset.tag = t.datum;
      if (t.datum === w.heute) z.classList.add("heute");
      z.appendChild(el("span", "wd", WOCHENTAG[i] + " " + tagKurz(t.datum)));
      var leer = !t.minuten && !(t.punkte || []).length;
      var mz = el("span", "wm", leer ? "–" : (t.minuten ? t.minuten + " Min" : "unter 1 Min"));
      /* Tagessumme (Pauls Wunsch, 01.10.2026): wie viele Fragen an dem Tag, gewusst davon */
      if (t.gesamt) mz.appendChild(el("b", "wmsum", t.gesamt + (t.gesamt === 1 ? " Frage" : " Fragen") + " · " + (t.gewusst || 0) + " gewusst"));
      z.appendChild(mz);
      var p = el("span", "wp");
      if (leer) p.textContent = t.datum === w.heute ? "heute noch nichts" : "frei";
      (t.punkte || []).forEach(function (x) { p.appendChild(el("i", x === 1 ? "g" : x === 2 ? "s" : "n", x === 0 ? "○" : "●")); });
      if (t.mehr) p.appendChild(el("span", null, " +" + t.mehr));
      z.appendChild(p);
      alle += t.gesamt || 0; gewusst += t.gewusst || 0; spaeter += t.spaeter || 0;
      var n = t.kreise || 0; offenAlle += n;
      var leerN = t.leer || 0;
      if (n) {
        z.classList.add("kann"); z.setAttribute("role", "button"); z.tabIndex = 0; z.setAttribute("aria-expanded", "false");
        z.appendChild(el("span", "wfuell", "✨ " + mehrz(n) + " " + (W.fuellen || "füllen") + " ›"));
        var fach = el("div", "wfrage verborgen");
        fach.appendChild(el("p", null, "Am " + TAG_LANG[i] + " " + (n === 1 ? "ist noch 1 " + (W.einKreis || "Kreis") + " " + (W.leer || "leer")
          : "sind noch " + mehrz(n) + " " + (W.leer || "leer")) + "." +
          (leerN > n ? " (" + (leerN - n) + " davon lassen sich nicht mehr nachholen.)" : "")));
        var ziel = (H.quiz || "quiz.html") + "?kreise=" + encodeURIComponent(t.datum);
        var ja = el("button", "wknopf", "✨ " + (W.jetzt || "Jetzt füllen")); ja.type = "button";
        ja.addEventListener("click", (function (u) { return function (ev) { ev.stopPropagation(); gehe(u); }; })(ziel));
        var sp = el("button", "wspaeter", "Später"); sp.type = "button";
        fach.appendChild(ja); fach.appendChild(sp);
        fach.addEventListener("click", function (ev) { ev.stopPropagation(); });
        z.appendChild(fach);
        (function (z, fach, sp) {
          var auf = function (an) { fach.classList.toggle("verborgen", !an); z.setAttribute("aria-expanded", an ? "true" : "false"); };
          sp.addEventListener("click", function () { auf(false); });
          z.addEventListener("click", function () { auf(fach.classList.contains("verborgen")); });
          z.addEventListener("keydown", function (ev) { if (ev.target === z && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); auf(fach.classList.contains("verborgen")); } });
        })(z, fach, sp);
      }
      liste.appendChild(z);
    });
    var k = el("div", "wsum");
    if (alle) {
      k.appendChild(el("b", null, (W.summe || "Diese Woche gewusst: ") + gewusst + " von " + alle));
      var leg = el("div", "wleg");
      leg.appendChild(el("i", "g", "●")); leg.appendChild(document.createTextNode(" " + (W.gewusst || "gleich gewusst") + "  "));
      if (spaeter) { leg.appendChild(el("i", "s", "●")); leg.appendChild(document.createTextNode(" " + (W.spaeter || "später geschafft") + "  ")); }
      leg.appendChild(el("i", "n", "○")); leg.appendChild(document.createTextNode(" " + (offenAlle ? (W.offen || "noch zu füllen") : "erst nachgeschaut")));
      k.appendChild(leg);
      if (offenAlle) {
        var b = el("button", "wknopf", "✨ " + mehrz(offenAlle) + " " + (W.fuellen || "füllen"));
        b.type = "button"; b.id = "kreiseFuellen";
        b.addEventListener("click", function () { gehe((H.quiz || "quiz.html") + "?kreise=woche"); });
        k.appendChild(b);
      }
    } else {
      k.appendChild(el("b", null, "Diese Woche hast du noch keine Fragen beantwortet."));
    }
    box.appendChild(k);
    box.appendChild(liste);
  }
  function wocheLaden(box) {
    wocheStil();
    fetch("/api/statistik?eigene=1&kind=" + encodeURIComponent(KIND), { credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { if (!j || !j.ok || !Array.isArray(j.tage)) throw 0; wocheZeichnen(box, j); })
      .catch(function () { box.innerHTML = ""; });
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
      if (H.woche) {
        var wb = $("wocheBericht");
        if (!wb) { wb = document.createElement("div"); wb.id = "wocheBericht"; box.parentNode.insertBefore(wb, box); }
        wocheLaden(wb);
      }
      heftLaden(box);
      ov.classList.add("on");
    });
    if (zu) zu.addEventListener("click", function () { ov.classList.remove("on"); });
    ov.addEventListener("click", function (ev) { if (ev.target === ov) ov.classList.remove("on"); });
  }

  window.LWHeftStart = { zeichnen: heftZeichnen, woche: wocheZeichnen };
  function los() { nachsehen(); heftAnbinden(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los); else los();
})();
