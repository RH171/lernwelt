/* Pauls Tagesaufgabe "1×1 und Textaufgaben" – die Anzeige (04.10.2026).
 * Rechnet nichts selbst: Runde, Lösungen und Buchung kommen aus /tagesrechnen/motor.js.
 *
 * Ablauf eines Tages:
 *   Teil 1 Einmaleins: Hauptdurchgang (neue + Wiederholer), dann die Fehler des Tages
 *          noch einmal, bis jede einmal beim ersten Versuch richtig ist. Danach EIN
 *          Schreibvorgang (localStorage "paul-tagesrechnen", paul-sync.js schickt ihn).
 *   Teil 2 Textaufgaben: genauso, danach der zweite Schreibvorgang.
 * Hilfe in Stufen (Kapitel 044): 1. Fehlversuch = Denkfehler benennen + Tipp,
 * 2. Fehlversuch = Rechenweg, eingetippt wird selbst. Gezählt wird der erste Versuch.
 * Zwischenstand je Antwort nur im sessionStorage (wird nicht synchronisiert) und über
 * LWWeiter (Kapitel 099), damit Neuladen oder ein Update nichts verliert.
 */
(function () {
  "use strict";
  var M = window.TRMotor;
  var SPEICHER = "paul-tagesrechnen", LAUF = "paul-tagesrechnen-lauf";
  var NACH_HOECHSTENS = 3;   // in der Fehlerrunde gilt eine Aufgabe nach drei Anläufen als erledigt (morgen kommt sie ohnehin wieder)
  function $(id) { return document.getElementById(id); }
  function esc(t) { var d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; }

  var datum = M.heuteIso();
  var stand = laden();
  var textRunde = null;     // Aufgaben-Objekte des Tages (mit Rückmelde-Funktionen), aus dem Motor neu erzeugt
  var lauf = null;          // { d, phase:"e"|"t", liste:[schlüssel], i, erg:{}, nach:[], nachZahl:{}, modus:"haupt"|"nach", versuche, eingabe }
  var sperre = false, marke = 0;

  function laden() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(SPEICHER) || "null"); } catch (e) {}
    return M.standPruefen(s);
  }
  function speichern() {
    // Genau zweimal am Tag: nach Teil 1 und nach Teil 2 (KV: 1000 Schreibvorgänge am Tag für alle).
    try { localStorage.setItem(SPEICHER, JSON.stringify(stand)); } catch (e) {}
  }
  function laufMerken() { try { sessionStorage.setItem(LAUF, JSON.stringify(lauf)); } catch (e) {} }
  function laufHolen() {
    var l = null;
    try { l = JSON.parse(sessionStorage.getItem(LAUF) || "null"); } catch (e) {}
    return l && l.d === datum ? l : null;
  }
  function laufWeg() { try { sessionStorage.removeItem(LAUF); } catch (e) {} }

  function heuteFertig(teil) { return stand.heute && stand.heute.d === datum && stand.heute[teil] === 1; }

  function texte() {
    if (!textRunde) textRunde = M.rundeText(stand, datum);
    return textRunde;
  }
  function textNach(fp) { return texte().filter(function (a) { return a.fp === fp; })[0] || null; }

  /* ---------- Start ---------- */
  function startZeigen() {
    zeige("start");
    var e = M.rundeEinmaleins(stand, datum), wied = Object.keys(stand.offen).length;
    $("teil-e-satz").textContent = heuteFertig("e") ? "Heute schon erledigt."
      : e.length + " Aufgaben, Mal und Geteilt" + (wied ? " – " + wied + " davon kommen wieder dran" : "") + ".";
    var t = texte(), tw = t.filter(function (a) { return a.wieder; }).length;
    $("teil-t-satz").textContent = heuteFertig("t") ? "Heute schon erledigt."
      : t.length + " Rätsel- und Sachaufgaben" + (tw ? " – " + tw + " davon in neuer Form wieder" : "") + ".";
    $("teil-e").classList.toggle("fertig", heuteFertig("e"));
    $("teil-t").classList.toggle("fertig", heuteFertig("t"));
    if (heuteFertig("e") && heuteFertig("t")) { endeZeigen(); return; }
    $("los").textContent = heuteFertig("e") ? "Weiter mit Teil 2" : "Los geht's";
  }

  function teilBeginnen(phase) {
    var liste = phase === "e" ? M.rundeEinmaleins(stand, datum) : texte().map(function (a) { return a.fp; });
    lauf = { d: datum, phase: phase, liste: liste, i: 0, erg: {}, nach: [], nachZahl: {}, modus: "haupt", versuche: 0, eingabe: "" };
    laufMerken();
    zeige("spiel");
    aufgabeZeigen();
  }

  /* ---------- Aufgabe ---------- */
  function aktuell() {
    var k = lauf.modus === "haupt" ? lauf.liste[lauf.i] : lauf.nach[0];
    if (lauf.phase === "e") return { k: k, x: M.einmaleins(k) };
    return { k: k, x: textNach(k) };
  }

  function aufgabeZeigen() {
    var a = aktuell();
    if (!a.x) { weiter(); return; }
    $("teil").textContent = lauf.phase === "e" ? "Teil 1 · Einmaleins" : "Teil 2 · Textaufgaben";
    $("zaehler").textContent = lauf.modus === "haupt"
      ? "Aufgabe " + (lauf.i + 1) + " von " + lauf.liste.length
      : "Noch einmal: " + lauf.nach.length + (lauf.nach.length === 1 ? " Aufgabe" : " Aufgaben");
    if (lauf.phase === "e") {
      $("aufgabe").innerHTML = '<div class="malzeile"><span id="frage">' + esc(a.x.frage) + ' =</span><span class="feld" id="feld"></span></div>';
    } else {
      $("aufgabe").innerHTML = '<p class="text" id="frage">' + esc(a.x.text) + '</p>' +
        '<div class="antwortzeile">Antwort: <span class="feld" id="feld"></span></div>' +
        '<p class="probehinweis">🔁 Mach die Probe, bevor du prüfst.</p>';
    }
    $("feld").textContent = lauf.eingabe || "";
    document.querySelector('[data-taste="ok"]').textContent = "Prüfen";
    tipp(lauf.versuche ? lauf.tippText || "" : "", false);
    if (lauf.modus === "nach" && !lauf.versuche) tipp("Diese hat vorhin gewackelt. Probier es noch einmal.", false);
    sperre = false;
  }

  function tipp(t, gut) { var el = $("tipp"); el.textContent = t || ""; el.classList.toggle("gut", !!gut); }

  function taste(z) {
    if (sperre) { if (z === "ok" && lauf && lauf.wartet) naechste(); return; }   // Prüfen im Grün = gleich weiter
    if (z === "weg") lauf.eingabe = lauf.eingabe.slice(0, -1);
    else if (z === "ok") { pruefen(); return; }
    else if (lauf.eingabe.length < 4) lauf.eingabe += z;
    $("feld").textContent = lauf.eingabe;
  }

  function pruefen() {
    if (!lauf.eingabe) return;
    var a = aktuell(), x = +lauf.eingabe, loes = a.x.loesung, stimmt = x === loes;
    var erster = lauf.versuche === 0;
    if (erster && lauf.modus === "haupt") {
      lauf.erg[a.k] = stimmt;
      melden(a, stimmt, x);
    }
    if (erster && lauf.modus === "nach") lauf.nachZahl[a.k] = (lauf.nachZahl[a.k] || 0) + 1;
    if (stimmt) { richtig(a, erster); return; }
    lauf.versuche++;
    lauf.eingabe = "";
    var f = $("feld"); f.textContent = ""; f.classList.remove("rueck"); void f.offsetWidth; f.classList.add("rueck");
    lauf.tippText = hilfe(a, x, lauf.versuche);
    tipp(lauf.tippText, false);
    laufMerken();
  }

  function hilfe(a, x, n) {
    if (lauf.phase === "e") return n === 1 ? M.tipp1x1(a.k) : M.hilfe1x1(a.k);
    if (n === 1) {
      var r = M.rueckmeldung(a.x, x);
      return (r ? r + " " : "") + a.x.tipp;
    }
    return "Schau: " + a.x.weg + " Tipp es jetzt selbst ein.";
  }

  function richtig(a, erster) {
    var f = $("feld"); f.classList.add("gut");
    var lob = erster ? "Richtig!" : "Gut, jetzt stimmt es.";
    sperre = true;
    lauf.wartet = true;
    if (lauf.phase === "t") {
      tipp(lob + " " + a.x.probe, true);
      document.querySelector('[data-taste="ok"]').textContent = "Weiter";
    } else {
      // Bleibt stehen, bis Paul "Weiter" tippt (Denny, 04.10.2026).
      tipp(lob + " " + a.x.weg, true);
      document.querySelector('[data-taste="ok"]').textContent = "Weiter";
    }
    // In der Fehlerrunde: richtig beim ersten Anlauf = erledigt, sonst hinten wieder anstellen.
    if (lauf.modus === "nach") {
      var k = lauf.nach.shift();
      if (!erster && lauf.nachZahl[k] < NACH_HOECHSTENS) lauf.nach.push(k);
    } else {
      lauf.i++;
    }
    lauf.versuche = 0; lauf.eingabe = ""; lauf.tippText = "";
    laufMerken();
  }

  function naechste() {
    if (!sperre) return;
    marke++;
    lauf.wartet = false;
    document.querySelector('[data-taste="ok"]').textContent = "Prüfen";
    weiter();
  }

  function weiter() {
    if (lauf.modus === "haupt" && lauf.i >= lauf.liste.length) {
      lauf.nach = lauf.liste.filter(function (k) { return lauf.erg[k] === false; });
      lauf.modus = "nach";
      laufMerken();
      if (lauf.nach.length) {
        zwischen("Fast geschafft!", (lauf.nach.length === 1 ? "Eine Aufgabe hat" : lauf.nach.length + " Aufgaben haben") +
          " heute gewackelt. Wir machen sie jetzt noch einmal – bis jede einmal sitzt.", function () { zeige("spiel"); aufgabeZeigen(); });
        return;
      }
    }
    if (lauf.modus === "nach" && !lauf.nach.length) { teilFertig(); return; }
    aufgabeZeigen();
  }

  function teilFertig() {
    var phase = lauf.phase;
    if (phase === "e") stand = M.buchenEinmaleins(stand, datum, lauf.erg);
    else stand = M.buchenText(stand, datum, texte(), lauf.erg);
    speichern();
    lauf = null; laufWeg();
    if (phase === "e") {
      zwischen("Teil 1 geschafft!", "Du bist drangeblieben. Jetzt kommen die Textaufgaben – lies sie in Ruhe und mach die Probe.",
        function () { teilBeginnen("t"); });
    } else endeZeigen();
  }

  function melden(a, stimmt, x) {
    try {
      if (!window.lernstand) return;
      if (lauf.phase === "e") window.lernstand.antwort(stimmt, "einmaleins " + a.x.art, x, a.x.loesung, "tr#" + a.k);
      else window.lernstand.antwort(stimmt, "textaufgabe " + M.ARTNAME[a.x.typ], x, a.x.loesung, "tr#t:" + a.x.typ + ":" + a.x.v);
    } catch (e) {}
  }

  /* ---------- Zwischen und Ende ---------- */
  var zwischenWeiter = null;
  function zwischen(kopf, satz, fn) {
    $("zwischen-kopf").textContent = kopf; $("zwischen-satz").textContent = satz;
    zwischenWeiter = fn; zeige("zwischen");
  }
  function endeZeigen() {
    zeige("ende");
    var l = stand.log.filter(function (x) { return x.d === datum; })[0] || {};
    var e = l.e || [0, 0], t = l.t || [0, 0];
    $("ende-lob").textContent = "Du hast alles durchgezogen, auch die kniffligen Aufgaben. Stark!";
    $("ende-zahlen").textContent = "Heute beim ersten Versuch: Einmaleins " + e[0] + " von " + e[1] + ", Textaufgaben " + t[0] + " von " + t[1] + ".";
    var n = stand.tage.length, sitzt = stand.sitzt.filter(function (x) { return x.d === datum; }).length;
    $("ende-tage").textContent = "Du hast die Tagesaufgabe schon an " + n + (n === 1 ? " Tag" : " Tagen") + " geschafft." +
      (sitzt ? " Heute " + (sitzt === 1 ? "sitzt eine Aufgabe" : "sitzen " + sitzt + " Aufgaben") + " neu – drei Tage hintereinander richtig." : "");
  }

  function zeige(welche) {
    ["start", "zwischen", "spiel", "ende"].forEach(function (id) { $(id).classList.toggle("verborgen", id !== welche); });
    window.scrollTo(0, 0);
  }

  /* ---------- Bedienung ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-taste]") : null;
    if (t) { taste(t.getAttribute("data-taste")); return; }
    if (e.target.id === "los") { teilBeginnen(heuteFertig("e") ? "t" : "e"); return; }
    if (e.target.id === "weiter-teil" && zwischenWeiter) { var fn = zwischenWeiter; zwischenWeiter = null; fn(); }
  });
  document.addEventListener("keydown", function (e) {
    if ($("spiel").classList.contains("verborgen")) return;
    if (/^[0-9]$/.test(e.key)) taste(e.key);
    else if (e.key === "Backspace") taste("weg");
    else if (e.key === "Enter") taste("ok");
  });

  /* Nach Neuladen oder Update genau da weitermachen (sessionStorage dieses Tabs, LWWeiter). */
  function fortsetzen(l) {
    if (!l || l.d !== datum || !l.liste) return false;
    if (heuteFertig(l.phase)) return false;
    lauf = l; lauf.wartet = false;
    if (lauf.modus === "nach" && !lauf.nach.length) { teilFertig(); return true; }
    zeige("spiel");
    if (lauf.modus === "haupt" && lauf.i >= lauf.liste.length) weiter(); else aufgabeZeigen();
    return true;
  }
  var weiterSeite = {
    sichern: function () { return lauf; },
    laden: function (l) { fortsetzen(l); }
  };
  if (window.LWWeiter) window.LWWeiter.anmelden(weiterSeite); else window.LW_WEITER = weiterSeite;

  if (!fortsetzen(laufHolen())) startZeigen();

  // Für die Messung (mess-schritte-tagesrechnen.js): lesen, nichts verändern.
  window.__tagesrechnen = {
    motor: M, stand: function () { return stand; }, lauf: function () { return lauf; },
    datum: function () { return datum; }, texte: texte, aktuell: function () { return lauf ? aktuell() : null; }
  };
})();
