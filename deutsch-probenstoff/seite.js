/* Pauls Deutsch-Probenstoff - die Anzeige (19.10.2026, Kapitel 131). Rechnet nichts selbst: Runde, Pruefung
 * und Hilfen kommen aus /deutsch-probenstoff/motor.js (window.DPSMotor), die Schreibtoleranz beim Perfekt
 * aus /toleranz.js (Kapitel 130), die Minuten aus /fachzeit.js.
 *
 * Ablauf: Start -> Runde (16 Aufgaben, Themen gemischt) -> Ende -> "Noch eine Runde" (neue Aufgaben).
 * Gezaehlt wird der erste Versuch (lernstand.antwort, Merkmal "deutsch …", Lernpunkt "dps#<id>").
 * Hilfe in Stufen (Kapitel 044): 1. Fehlversuch Regel, 2. staerkerer Hinweis, ab dem 3. die Loesung.
 * Falsch beim ersten Versuch: dieselbe Aufgabe kommt nach 4 Aufgaben noch einmal (zaehlt nicht, meldet nichts).
 * Speicher: nur sessionStorage (laufende Runde, Rundenzahl des Tages) - kein KV-Schreibvorgang ausser den
 * Minuten (fachzeit.js) und der einen Statistik-Runde von lernstand.js.
 */
(function () {
  "use strict";
  var M = window.DPSMotor, Tol = window.LWToleranz, FZ = window.LWFachzeit;
  var LAUF = "paul-dps-lauf", RUNDEN = "paul-dps-runden";
  function $(id) { return document.getElementById(id); }
  function el(tag, klasse, text) { var e = document.createElement(tag); if (klasse) e.className = klasse; if (text != null) e.textContent = text; return e; }
  function zeige(welche) {
    ["start", "spiel", "ende", "aus"].forEach(function (x) { $(x).classList.toggle("verborgen", x !== welche); });
    window.scrollTo(0, 0);
  }

  var datum = M.heuteIso();
  if (!M.aktiv(datum)) { zeige("aus"); return; }
  var zeit = FZ ? FZ.start({ kind: "paul", fach: "deutsch" }) : null;

  function minutenSatz() {
    if (!zeit) return "";
    var min = Math.floor(zeit.sekunden("deutsch") / 60);
    if (min >= 10) return "✓ Für heute geschafft – " + min + " Min geübt. Mehr geht immer.";
    if (min > 0) return "Heute " + min + " Min geübt – 10 Min sind ein gutes Ziel.";
    return "10 Min am Tag sind ein gutes Ziel.";
  }

  /* ---------- Laufende Runde (sessionStorage) ---------- */
  var lauf = null;  // { d, nr, liste:[{t,i,w}], pos, erg:[{id,ok}], extra, versuch, fertig, wahl:[] }
  function merken() { try { sessionStorage.setItem(LAUF, JSON.stringify(lauf)); } catch (e) {} }
  function holen() {
    var l = null; try { l = JSON.parse(sessionStorage.getItem(LAUF) || "null"); } catch (e) {}
    return l && l.d === datum && Array.isArray(l.liste) ? l : null;
  }
  function naechsteNr() {
    var r = null; try { r = JSON.parse(sessionStorage.getItem(RUNDEN) || "null"); } catch (e) {}
    var n = r && r.d === datum ? (+r.n || 0) : 0;
    try { sessionStorage.setItem(RUNDEN, JSON.stringify({ d: datum, n: n + 1 })); } catch (e) {}
    return n;
  }
  function aufgabe(x) { var a = M.bauen(x.t, x.i); a.wieder = !!x.w; return a; }

  function neueRunde() {
    var nr = naechsteNr();
    var liste = M.runde(datum, nr).map(function (a) { var p = a.id.split(":"); return { t: p[0], i: +p[1] }; });
    lauf = { d: datum, nr: nr, liste: liste, pos: 0, erg: [], extra: 0, versuch: 0, fertig: false, wahl: [] };
    merken(); zeige("spiel"); malen();
  }

  /* ---------- Eine Aufgabe zeigen ---------- */
  var a = null, seit = 0, weiterAb = 0;
  function zaehlerText() {
    var echte = lauf.liste.filter(function (x) { return !x.w; }).length;
    var schon = lauf.liste.slice(0, lauf.pos + 1).filter(function (x) { return !x.w; }).length;
    return a.wieder ? "Noch einmal" : schon + " von " + echte;
  }
  function malen() {
    if (lauf.pos >= lauf.liste.length) return ende();
    a = aufgabe(lauf.liste[lauf.pos]);
    seit = Date.now();
    $("thema").textContent = M.THEMA[a.thema].name + (a.wieder ? " · Noch einmal" : "");
    $("zaehler").textContent = zaehlerText();
    $("tipp").textContent = ""; $("tipp").className = "tipp";
    $("weiter").classList.add("verborgen");
    $("spiel").classList.remove("fertig");
    var box = $("aufgabe"), kn = $("knoepfe");
    box.innerHTML = ""; kn.innerHTML = "";
    box.appendChild(el("p", "frage", a.frage));

    if (a.satzTeile) {
      var s = el("p", "satz");
      s.appendChild(document.createTextNode(a.satzTeile.vor));
      s.appendChild(el("span", a.satzTeile.wort === "?" ? "mark luecke" : "mark", a.satzTeile.wort));
      s.appendChild(document.createTextNode(a.satzTeile.nach));
      box.appendChild(s);
    }
    if (a.wortTeile) {
      var w = el("p", "wortgross");
      w.appendChild(document.createTextNode(a.wortTeile.vor));
      w.appendChild(el("span", "mark", a.wortTeile.wort));
      w.appendChild(document.createTextNode(a.wortTeile.nach));
      box.appendChild(w);
    }
    if (a.wortGross) { box.appendChild(el("p", "wortgross", a.wortGross)); box.appendChild(el("p", "teile", a.teile)); }
    if (a.luecke) {
      var l = el("p", "wortgross"), t = a.luecke.split("_");
      l.appendChild(document.createTextNode(t[0])); l.appendChild(el("span", "luecke", "?")); l.appendChild(document.createTextNode(t[1]));
      box.appendChild(l);
    }

    if (a.art === "wahl") {
      a.optionen.forEach(function (o) {
        var b = el("button", "wahl", o); b.type = "button"; b.setAttribute("data-wahl", o);
        b.addEventListener("click", function () { if (!b.disabled) antworten(o, b); });
        kn.appendChild(b);
      });
    } else if (a.art === "woerter") {
      lauf.wahl = [];
      var ws = el("div", "woerter");
      a.woerter.forEach(function (wort, k) {
        var b = el("button", "wort", wort); b.type = "button"; b.setAttribute("data-wort", k);
        b.addEventListener("click", function () {
          if (sperre()) return;
          var i = lauf.wahl.indexOf(k);
          if (a.thema === "praedikat") { lauf.wahl = i >= 0 ? [] : [k]; }
          else if (i >= 0) lauf.wahl.splice(i, 1); else lauf.wahl.push(k);
          Array.prototype.forEach.call(ws.children, function (c, n) { c.classList.toggle("an", lauf.wahl.indexOf(n) >= 0); });
        });
        ws.appendChild(b);
      });
      box.appendChild(ws);
      var p = el("button", "wahl pruefen", "Prüfen"); p.type = "button"; p.id = "pruefen";
      p.addEventListener("click", function () { if (!lauf.wahl.length) { tipp("Tippe zuerst ein Wort an.", false); return; } antworten(lauf.wahl.slice(), p); });
      kn.appendChild(p);
    } else {
      box.appendChild(el("p", "vorgabe", a.vorgabe));
      var e = el("div", "eingabe");
      e.appendChild(el("span", "pers", a.person));
      var inp = document.createElement("input");
      inp.type = "text"; inp.id = "feld"; inp.autocomplete = "off"; inp.spellcheck = false;
      inp.setAttribute("autocapitalize", "off"); inp.setAttribute("autocorrect", "off");
      inp.setAttribute("aria-label", "Perfekt eintippen"); inp.placeholder = "… im Perfekt";
      inp.addEventListener("keydown", function (ev) { if (ev.key === "Enter" && !ev.repeat) { ev.preventDefault(); los(); } });
      e.appendChild(inp); box.appendChild(e);
      var q = el("button", "wahl pruefen", "Prüfen"); q.type = "button"; q.id = "pruefen";
      function los() { if (q.disabled) return; antworten(inp.value, q); }
      q.addEventListener("click", los);
      kn.appendChild(q);
      if (!window.matchMedia || !window.matchMedia("(pointer: coarse)").matches) setTimeout(function () { try { inp.focus(); } catch (er) {} }, 30);
    }
    merken();
  }
  function sperre() { return !$("weiter").classList.contains("verborgen"); }
  function tipp(text, gut) { var t = $("tipp"); t.textContent = text; t.className = "tipp" + (gut ? " gut" : ""); }

  /* ---------- Antworten ---------- */
  function antworten(eingabe, knopf) {
    if (sperre()) return;
    var erg = M.pruefen(a, eingabe, Tol);
    if (erg.leer) { tipp("Schreib zuerst deine Antwort hinein.", false); return; }
    var erster = lauf.versuch === 0;
    lauf.versuch++;
    if (erster && !a.wieder) melden(erg.stimmt, eingabe);
    if (erster && !erg.stimmt && !a.wieder && lauf.extra < M.EIN.wiederHoechstens) {
      var ziel = Math.min(lauf.pos + 1 + M.EIN.wiederNach, lauf.liste.length);
      var x = lauf.liste[lauf.pos];
      lauf.liste.splice(ziel, 0, { t: x.t, i: x.i, w: 1 });
      lauf.extra++;
    }
    if (erster && !a.wieder) lauf.erg.push({ id: a.id, t: a.thema, ok: erg.stimmt });
    if (erg.stimmt) return richtig(erg, eingabe);
    var h = M.hilfe(a, lauf.versuch, erg);
    if (a.art === "wahl" && knopf) { knopf.disabled = true; knopf.classList.add("weg"); }
    if (knopf) { knopf.classList.remove("rueck"); void knopf.offsetWidth; knopf.classList.add("rueck"); }
    if (h.stufe >= 3) return loesungZeigen(h.text);
    tipp(h.text, false);
    merken();
  }
  function melden(stimmt, eingabe) {
    try {
      var gegeben = a.art === "woerter" ? (eingabe || []).map(function (k) { return a.woerter[k]; }).join(" ") : String(eingabe);
      var richtigText = a.art === "woerter" ? a.loesung.map(function (k) { return a.woerter[k]; }).join(" ") : a.loesung;
      if (window.lernstand && window.lernstand.antwort)
        window.lernstand.antwort(stimmt, M.THEMA[a.thema].merkmal, gegeben, richtigText, "dps#" + a.id,
          (Date.now() - seit) / 1000, (a.frage + " " + (a.vorgabe || a.wortGross || a.luecke || "")).trim());
    } catch (e) {}
  }
  function fertigMachen() {
    lauf.versuch = 0;
    Array.prototype.forEach.call(document.querySelectorAll("#knoepfe button, .wort, #feld"), function (b) { b.disabled = true; });
    weiterAb = Date.now() + (window.__dpsWeiterMs != null ? window.__dpsWeiterMs : 500);
    $("weiter").classList.remove("verborgen");
    $("spiel").classList.add("fertig");
    merken();
  }
  function richtig(erg, eingabe) {
    if (a.art === "wahl") Array.prototype.forEach.call(document.querySelectorAll("#knoepfe .wahl"), function (b) { if (b.getAttribute("data-wahl") === a.loesung) b.classList.add("gut"); });
    if (a.art === "woerter") Array.prototype.forEach.call(document.querySelectorAll(".wort"), function (b, n) { if (a.loesung.indexOf(n) >= 0) b.classList.add("gut"); });
    if (a.art === "text") $("feld").classList.add("gut");
    tipp(erg.fast ? "Richtig! Schau dir die Schreibweise noch einmal an:" : "Richtig!", true);
    if (erg.fast && Tol && Tol.zeigen) Tol.zeigen($("tipp"), M.perfektRoh(a, eingabe), a.loesung);
    fertigMachen();
  }
  function loesungZeigen(text) {
    if (a.art === "wahl") Array.prototype.forEach.call(document.querySelectorAll("#knoepfe .wahl"), function (b) { if (b.getAttribute("data-wahl") === a.loesung) { b.classList.add("gut"); b.classList.remove("weg"); } });
    if (a.art === "woerter") Array.prototype.forEach.call(document.querySelectorAll(".wort"), function (b, n) { b.classList.toggle("gut", a.loesung.indexOf(n) >= 0); b.classList.remove("an"); });
    tipp(text, false);
    fertigMachen();
  }
  $("weiter").addEventListener("click", function () {
    if (Date.now() < weiterAb) return;
    lauf.pos++; lauf.versuch = 0; merken(); malen();
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" && !ev.repeat && sperre() && !$("spiel").classList.contains("verborgen")) { ev.preventDefault(); $("weiter").click(); }
  });

  /* ---------- Ende ---------- */
  function ende() {
    lauf.fertig = true; merken();
    var n = lauf.erg.length, ok = lauf.erg.filter(function (x) { return x.ok; }).length;
    var wackel = [];
    lauf.erg.forEach(function (x) { if (!x.ok && wackel.indexOf(M.THEMA[x.t].name) < 0) wackel.push(M.THEMA[x.t].name); });
    $("ende-zahlen").textContent = "Beim ersten Versuch richtig: " + ok + " von " + n + "." +
      (wackel.length ? " Das kannst du noch üben: " + wackel.join(", ") + "." : " Alles sitzt – stark!");
    $("ende-zeit").textContent = minutenSatz();
    zeige("ende");
  }

  function startZeigen() { $("start-zeit").textContent = minutenSatz(); zeige("start"); }
  $("los").addEventListener("click", function () {
    var l = holen();
    if (l && !l.fertig && l.pos < l.liste.length) { lauf = l; zeige("spiel"); malen(); return; }
    neueRunde();
  });
  $("nochmal").addEventListener("click", neueRunde);

  // Neuladen mitten in der Runde: dort weiter, wo Paul war.
  var alt = holen();
  if (alt && !alt.fertig && alt.pos > 0 && alt.pos < alt.liste.length) { lauf = alt; zeige("spiel"); malen(); }
  else startZeigen();
  setInterval(function () { if (!$("start").classList.contains("verborgen")) $("start-zeit").textContent = minutenSatz(); }, 15000);

  window.__dps = { lauf: function () { return lauf; }, aufgabe: function () { return a; } };   // fuer die Messung
})();
