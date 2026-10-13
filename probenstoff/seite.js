/* Pauls Probenstoff Mathe – die Anzeige (13.10.2026). Rechnet nichts selbst: Runde, Prüfung,
 * Hilfen und Buchung kommen aus /probenstoff/motor.js (window.PSMotor).
 *
 * Ablauf: Start → Teil 1 (Kiste + 8 frische, gemischt) → Zwischenschirm → Teil 2 (Sachaufgaben) → Ende.
 * Gezählt wird der erste Versuch, Hilfe in Stufen (Kapitel 044). Eingabe: ein Feld, zwei Felder
 * (Ergebnis und R) oder Zahlen antippen (Teiler, Vielfache).
 * Speicher: localStorage "paul-probenstoff" (paul-sync.js schickt ihn mit), EIN Schreibvorgang je
 * fertigem Teil, höchstens drei am Tag; darüber hinaus bleibt der Stand im sessionStorage und reist mit
 * dem nächsten Schreibvorgang mit. Zwischenstand je Antwort nur im sessionStorage und über LWWeiter.
 * Nach dem 19.10.2026 zeigt die Seite nur noch einen ruhigen Satz (Motor: aktiv()).
 */
(function () {
  "use strict";
  var M = window.PSMotor;
  var SPEICHER = "paul-probenstoff", LAUF = "paul-probenstoff-lauf", NACHTRAG = "paul-probenstoff-nachtrag";
  function $(id) { return document.getElementById(id); }
  function esc(t) { var d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; }

  var datum = M.heuteIso();
  var stand = laden();
  var lauf = null;   // { d, nr, phase:"1"|"2"|"1-fertig", liste:[{k,kk}], i, erg:{1:[],2:[]}, versuche, eingabe:{a,b}, feld, wahl:[], tipp }
  var sperre = false, shown = 0, verdeckt = 0, verdecktSeit = 0;

  function laden() {
    var s = null, n = null;
    try { s = JSON.parse(localStorage.getItem(SPEICHER) || "null"); } catch (e) {}
    try { n = JSON.parse(sessionStorage.getItem(NACHTRAG) || "null"); } catch (e) {}
    s = M.standPruefen(s);
    if (n && n.stand && n.zahl > zahlTeile(s)) s = M.standPruefen(n.stand);
    return s;
  }
  function zahlTeile(s) { var z = 0; for (var d in s.tage) z += (s.tage[d] || []).length; return z; }
  function speichern() {
    if (M.darfSchreiben(stand, datum)) {
      M.geschrieben(stand, datum);
      try { localStorage.setItem(SPEICHER, JSON.stringify(stand)); } catch (e) {}
      try { sessionStorage.removeItem(NACHTRAG); } catch (e) {}
    } else {
      try { sessionStorage.setItem(NACHTRAG, JSON.stringify({ zahl: zahlTeile(stand), stand: stand })); } catch (e) {}
    }
  }
  function laufMerken() { try { sessionStorage.setItem(LAUF, JSON.stringify(lauf)); } catch (e) {} }
  function laufHolen() {
    var l = null;
    try { l = JSON.parse(sessionStorage.getItem(LAUF) || "null"); } catch (e) {}
    return l && l.d === datum ? l : null;
  }
  function laufWeg() { try { sessionStorage.removeItem(LAUF); } catch (e) {} }
  function h() { return M.heuteStand(stand, datum); }

  /* ---------- Start ---------- */
  function startZeigen() {
    if (!M.aktiv(datum)) { zeige("aus"); return; }
    zeige("start");
    var hs = h(), runde = M.tagesRunde(stand, datum, hs.t2 ? hs.n : 0);
    $("teil-1-satz").textContent = runde.teil1.length + " Aufgaben: Mal, Geteilt, Rest, Punkt vor Strich, Teiler.";
    $("teil-2-satz").textContent = runde.teil2.length + " Aufgaben aus dem Alltag.";
    $("teil-1").classList.toggle("fertig", !!hs.t1);
    $("teil-2").classList.toggle("fertig", !!hs.t2);
    $("los").textContent = hs.t2 ? "Noch eine Runde" : hs.t1 ? "Weiter mit Teil 2" : "Los geht's";
    $("start-fertig").textContent = hs.t2 ? "Heute geschafft! Du kannst noch eine Runde mit neuen Aufgaben rechnen." : "";
  }

  /* ---------- Spiel ---------- */
  function rundeBeginnen(phase) {
    var hs = h(), nr = hs.t2 ? hs.n : 0;
    var runde = lauf && lauf.runde ? lauf.runde : M.tagesRunde(stand, datum, nr);
    var erg = lauf && lauf.erg ? lauf.erg : { 1: [], 2: [] };
    lauf = { d: datum, nr: nr, runde: runde, phase: phase, liste: phase === "1" ? runde.teil1 : runde.teil2, i: 0, erg: erg,
      versuche: 0, eingabe: { a: "", b: "" }, feld: "a", wahl: [], tipp: "" };
    laufMerken();
    zeige("spiel");
    aufgabeZeigen();
  }
  function aktuell() { var e = lauf && lauf.liste[lauf.i]; return e ? M.aufgabe(e.k) : null; }

  function feldHtml(name, label) {
    return '<span class="feldbox"><span class="feld' + (lauf.feld === name ? " aktiv" : "") + '" id="feld-' + name + '" data-feld="' + name + '" role="button" tabindex="0" aria-label="' + esc(label) + '">' +
      esc(lauf.eingabe[name]) + '</span><small>' + esc(label) + '</small></span>';
  }
  function frageHtml(x) {
    if (x.typ === "tippen") {
      return '<p class="auftrag" id="frage">' + esc(x.frage) + '</p><div class="chips" role="group">' + x.chips.map(function (c) {
        var an = lauf.wahl.indexOf(c) >= 0;
        return '<button type="button" class="chip' + (an ? " an" : "") + '" data-chip="' + c + '" aria-pressed="' + an + '">' + c + '</button>';
      }).join("") + '</div>';
    }
    var kopf = x.text ? '<p class="sachtext" id="frage">' + esc(x.text) + '</p>' : "";
    var zeile;
    if (x.art === "sach") {
      zeile = x.typ === "rest"
        ? feldHtml("a", x.labelA) + '<span class="und">und</span>' + feldHtml("b", x.labelB)
        : feldHtml("a", "Antwort") + (x.einheit ? '<span class="einheit">' + esc(x.einheit) + '</span>' : "");
      return kopf + '<div class="zeile sach">' + zeile + '</div>';
    }
    if (x.typ === "rest") {
      var vorn = x.frage.split(" = ")[0];
      return '<div class="zeile" id="frage"><span>' + esc(vorn) + ' =</span>' + feldHtml("a", "Ergebnis") + '<span>R</span>' + feldHtml("b", "Rest") + '</div>';
    }
    var teile = x.frage.split("?");
    return '<div class="zeile" id="frage"><span>' + esc(teile[0]) + '</span>' + feldHtml("a", "Ergebnis") + '<span>' + esc(teile[1] || "") + '</span></div>';
  }

  function aufgabeZeigen() {
    var x = aktuell();
    if (!x) { teilFertig(); return; }
    $("thema").textContent = x.thema;
    $("zaehler").textContent = (lauf.phase === "1" ? "Aufgabe " : "Sachaufgabe ") + (lauf.i + 1) + " von " + lauf.liste.length;
    $("aufgabe").innerHTML = frageHtml(x);
    $("aufgabe").setAttribute("data-typ", x.typ);
    $("tasten").classList.toggle("nurok", x.typ === "tippen");
    document.querySelector('[data-taste="ok"]').textContent = "Prüfen";
    tipp(lauf.versuche ? lauf.tipp : "", false);
    sperre = false;
    shown = jetzt(); verdeckt = 0; verdecktSeit = document.hidden ? shown : 0;
  }
  function jetzt() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function vergangen() {
    var v = verdeckt + (verdecktSeit ? jetzt() - verdecktSeit : 0);
    return Math.min(600, Math.max(0, (jetzt() - shown - v) / 1000));
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) verdecktSeit = jetzt();
    else if (verdecktSeit) { verdeckt += jetzt() - verdecktSeit; verdecktSeit = 0; }
  });
  function tipp(t, gut) { var el = $("tipp"); el.textContent = t || ""; el.classList.toggle("gut", !!gut); }

  function feldWaehlen(name) {
    if (!lauf || sperre) return;
    lauf.feld = name;
    ["a", "b"].forEach(function (n) { var f = $("feld-" + n); if (f) f.classList.toggle("aktiv", n === name); });
  }
  function taste(z) {
    if (!lauf || lauf.phase === "1-fertig") return;
    if (sperre) { if (z === "ok") naechste(); return; }
    if (z === "ok") { pruefen(); return; }
    var x = aktuell(); if (!x || x.typ === "tippen") return;
    var f = lauf.feld;
    if (z === "weg") lauf.eingabe[f] = lauf.eingabe[f].slice(0, -1);
    else if (lauf.eingabe[f].length < 4) lauf.eingabe[f] += z;
    $("feld-" + f).textContent = lauf.eingabe[f];
  }
  function chip(c) {
    if (!lauf || sperre) return;
    var i = lauf.wahl.indexOf(c);
    if (i >= 0) lauf.wahl.splice(i, 1); else lauf.wahl.push(c);
    var b = document.querySelector('[data-chip="' + c + '"]');
    if (b) { b.classList.toggle("an", i < 0); b.setAttribute("aria-pressed", String(i < 0)); }
  }

  function eingabe(x) {
    if (x.typ === "tippen") return lauf.wahl.slice();
    if (x.typ === "rest") return { q: lauf.eingabe.a, r: lauf.eingabe.b };
    return lauf.eingabe.a;
  }
  function pruefen() {
    var x = aktuell();
    // Leere Felder sind kein Versuch: erst ausfüllen lassen.
    if (x.typ === "zahl" && !lauf.eingabe.a) return;
    if (x.typ === "rest") {
      if (!lauf.eingabe.a) { feldWaehlen("a"); return; }
      if (!lauf.eingabe.b) { feldWaehlen("b"); tipp("Trag noch den Rest ein. Geht es glatt auf, ist der Rest 0.", false); return; }
    }
    if (x.typ === "tippen" && !lauf.wahl.length) { tipp("Tippe die passenden Zahlen an. Dann drückst du Prüfen.", false); return; }
    var e = eingabe(x), ok = M.stimmt(x, e), erster = lauf.versuche === 0;
    if (erster) {
      var sek = Math.round(vergangen() * 10) / 10, el = lauf.liste[lauf.i];
      lauf.erg[lauf.phase].push({ k: x.k, kk: el.kk || undefined, ok: ok, sek: sek });
      melden(x, ok, M.eingabeText(x, e), sek);
    }
    if (ok) { richtig(x, erster); return; }
    lauf.versuche++;
    lauf.tipp = M.hilfe(x, lauf.versuche, e);
    if (x.typ !== "tippen") {
      lauf.eingabe = { a: "", b: "" }; lauf.feld = "a";
      ["a", "b"].forEach(function (n) { var f = $("feld-" + n); if (f) { f.textContent = ""; f.classList.toggle("aktiv", n === "a"); f.classList.remove("rueck"); void f.offsetWidth; f.classList.add("rueck"); } });
    }
    tipp(lauf.tipp, false);
    laufMerken();
  }
  function richtig(x, erster) {
    ["a", "b"].forEach(function (n) { var f = $("feld-" + n); if (f) f.classList.add("gut"); });
    [].forEach.call(document.querySelectorAll(".chip.an"), function (b) { b.classList.add("gut"); });
    sperre = true;
    tipp((erster ? "Richtig! " : "Gut, jetzt stimmt es. ") + M.bestaetigung(x) + ".", true);
    document.querySelector('[data-taste="ok"]').textContent = "Weiter";
    $("tasten").classList.add("nurok");
    lauf.i++; lauf.versuche = 0; lauf.eingabe = { a: "", b: "" }; lauf.feld = "a"; lauf.wahl = []; lauf.tipp = "";
    laufMerken();
  }
  function naechste() {
    if (!sperre) return;
    if (lauf.i >= lauf.liste.length) teilFertig(); else aufgabeZeigen();
  }

  function teilFertig() {
    if (lauf.phase === "1") {
      stand = M.buchen(stand, datum, 1, lauf.erg[1], lauf.nr);
      speichern();
      lauf.phase = "1-fertig"; laufMerken();
    }
    if (lauf.phase === "1-fertig") {
      var r1 = lauf.erg[1].filter(function (e) { return e.ok; }).length;
      $("zwischen-satz").textContent = "Beim ersten Versuch richtig: " + r1 + " von " + lauf.erg[1].length + ". Jetzt noch " + lauf.runde.teil2.length + " Sachaufgaben.";
      zeige("zwischen");
      return;
    }
    stand = M.buchen(stand, datum, 2, lauf.erg[2], lauf.nr);
    speichern();
    var a = lauf.erg[1], b = lauf.erg[2];
    var ra = a.filter(function (e) { return e.ok; }).length, rb = b.filter(function (e) { return e.ok; }).length;
    lauf = null; laufWeg();
    zeige("ende");
    $("ende-zahlen").textContent = "Beim ersten Versuch richtig: " + (a.length ? "Probenstoff " + ra + " von " + a.length + ", " : "") + "Sachaufgaben " + rb + " von " + b.length + ". Du hast heute fleißig geübt.";
  }

  function melden(x, ok, gegeben, sek) {
    try { if (window.lernstand) window.lernstand.antwort(ok, x.merkmal, gegeben, M.loesungText(x), x.punkt, sek); } catch (e) {}
  }
  function zeige(welche) {
    ["start", "zwischen", "spiel", "ende", "aus"].forEach(function (id) { $(id).classList.toggle("verborgen", id !== welche); });
    window.scrollTo(0, 0);
  }

  /* ---------- Bedienung ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-taste]") : null;
    if (t) { taste(t.getAttribute("data-taste")); return; }
    var c = e.target.closest ? e.target.closest("[data-chip]") : null;
    if (c) { chip(+c.getAttribute("data-chip")); return; }
    var f = e.target.closest ? e.target.closest("[data-feld]") : null;
    if (f) { feldWaehlen(f.getAttribute("data-feld")); return; }
    var b = e.target.closest ? e.target.closest("button") : null, id = b ? b.id : "";
    if (id === "los") {
      var hs = h();
      lauf = null; laufWeg();
      if (hs.t1 && !hs.t2) { lauf = { runde: M.tagesRunde(stand, datum, 0), erg: { 1: [], 2: [] } }; rundeBeginnen("2"); }
      else rundeBeginnen("1");
      return;
    }
    if (id === "weiter-sach") { rundeBeginnen("2"); return; }
    if (id === "nochmal") { lauf = null; laufWeg(); startZeigen(); return; }
  });
  document.addEventListener("keydown", function (e) {
    if ($("spiel").classList.contains("verborgen")) return;
    var t = e["key"];
    if (/^[0-9]$/.test(t)) taste(t);
    else if (t === "Backspace") taste("weg");
    else if (t === "Enter") taste("ok");
    else if (t === "r" || t === "R" || t === "Tab") { if (document.getElementById("feld-b")) { e.preventDefault(); feldWaehlen(lauf.feld === "a" ? "b" : "a"); } }
  });

  /* Nach Neuladen oder Update genau da weitermachen (sessionStorage dieses Tabs, LWWeiter). */
  function fortsetzen(l) {
    if (!l || l.d !== datum || !l.liste || !M.aktiv(datum)) return false;
    lauf = l;
    if (lauf.phase === "1-fertig" || lauf.i >= lauf.liste.length) { teilFertig(); return true; }
    zeige("spiel");
    aufgabeZeigen();
    return true;
  }
  var weiterSeite = { sichern: function () { return lauf; }, laden: function (l) { fortsetzen(l); } };
  if (window.LWWeiter) window.LWWeiter.anmelden(weiterSeite); else window.LW_WEITER = weiterSeite;

  if (!fortsetzen(laufHolen())) startZeigen();

  // Für die Messung (mess-schritte-probenstoff.js): lesen, nichts verändern.
  window.__probenstoff = {
    motor: M, stand: function () { return stand; }, lauf: function () { return lauf; },
    datum: function () { return datum; },
    aktuell: function () { return lauf && lauf.liste && lauf.phase !== "1-fertig" ? aktuell() : null; }
  };
})();
