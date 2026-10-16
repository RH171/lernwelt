/* Pauls 1×1-Woche – die Anzeige (13.10.2026). Rechnet nichts selbst: Runden, Hilfen und
 * Buchung kommen aus /einmaleinswoche/motor.js (window.EWMotor).
 *
 * Ablauf eines Durchgangs:  Start (Auswahl der Reihen) → Merkhilfe (C) → 20 Dreiecke (A)
 *   → Familie als Abschluss → Tempo-Runde mit 20 Aufgaben (B) → Rückschau.
 * Gezählt wird der erste Versuch, Hilfe in Stufen (Kapitel 044).
 * Speicher: localStorage "paul-einmaleinswoche" (paul-sync.js schickt ihn mit), EIN
 * Schreibvorgang je fertigem Durchgang, höchstens zwei am Tag. Ein dritter Durchgang
 * am selben Tag bleibt im sessionStorage und reist mit dem nächsten Schreibvorgang mit.
 * Zwischenstand je Antwort nur im sessionStorage und über LWWeiter (Kapitel 099).
 * Zeit: je Aufgabe vom Anzeigen bis zur richtigen Antwort, verdeckte Zeit (Tab im
 * Hintergrund) zählt nicht. Keine sichtbare Uhr, kein Countdown.
 * Ergebnis bleibt stehen (16.10.2026, Denny): nach "Prüfen" steht Pauls Zahl grün oder mit der
 * richtigen Zahl daneben, bis er "Weiter" tippt. Die Uhr ruht dabei (zeitB wird beim Prüfen
 * gebucht, die nächste Aufgabe startet ihre Zeit erst beim Anzeigen). Tempo-Runde: ein Versuch
 * je Aufgabe. Weiter erst SPERRE_MS nach dem Ergebnis, damit ein Doppeltipp nichts überspringt.
 */
(function () {
  "use strict";
  var M = window.EWMotor;
  var SPEICHER = "paul-einmaleinswoche", LAUF = "paul-einmaleinswoche-lauf", NACHTRAG = "paul-einmaleinswoche-nachtrag";
  function $(id) { return document.getElementById(id); }
  function esc(t) { var d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; }

  var datum = M.heuteIso();
  var stand = laden();
  var gewaehlt = M.setFuerTag(datum);
  var lauf = null;     // { d, set, phase:"a"|"b"|"a-fertig", liste:[{k,r}], i, erg:{a:[],b:[]}, versuche, eingabe, tipp, zeitB }
  var sperre = false, shown = 0, verdeckt = 0, verdecktSeit = 0, ergebnisSeit = 0;
  // Die Messung darf die Sperre abkürzen (window.__ewSperreMs), sonst 500 ms.
  var SPERRE_MS = typeof window.__ewSperreMs === "number" ? window.__ewSperreMs : 500;

  function laden() {
    var s = null, n = null;
    try { s = JSON.parse(localStorage.getItem(SPEICHER) || "null"); } catch (e) {}
    try { n = JSON.parse(sessionStorage.getItem(NACHTRAG) || "null"); } catch (e) {}
    s = M.standPruefen(s);
    // Nachtrag aus einem dritten Durchgang: enthält er mehr Durchgänge als der Speicher, gilt er.
    if (n && n.stand && n.zahl > anzahlLaeufe(s)) s = M.standPruefen(n.stand);
    return s;
  }
  function anzahlLaeufe(s) { var z = 0; for (var d in s.tage) z += (s.tage[d] || []).length; return z; }
  function speichern() {
    if (M.darfSchreiben(stand, datum)) {
      M.geschrieben(stand, datum);
      try { localStorage.setItem(SPEICHER, JSON.stringify(stand)); } catch (e) {}
      try { sessionStorage.removeItem(NACHTRAG); } catch (e) {}
    } else {
      try { sessionStorage.setItem(NACHTRAG, JSON.stringify({ zahl: anzahlLaeufe(stand), stand: stand })); } catch (e) {}
    }
  }
  function laufMerken() { try { sessionStorage.setItem(LAUF, JSON.stringify(lauf)); } catch (e) {} }
  function laufHolen() {
    var l = null;
    try { l = JSON.parse(sessionStorage.getItem(LAUF) || "null"); } catch (e) {}
    return l && l.d === datum ? l : null;
  }
  function laufWeg() { try { sessionStorage.removeItem(LAUF); } catch (e) {} }

  function heuteGeschafft(set) {
    return (stand.tage[datum] || []).some(function (l) { return !set || l.s === set; });
  }
  function reihenName(set) {
    if (set === "gemischt") return "alle Reihen gemischt";
    return M.wahl(set).reihen.map(function (r) { return r + "er"; }).join(", ").replace(/, ([^,]*)$/, " und $1");
  }

  /* ---------- Start ---------- */
  function startZeigen() {
    zeige("start");
    var plan = M.setFuerTag(datum), wt = M.wochentag(datum);
    $("wahl").innerHTML = M.WAHLEN.map(function (w) {
      return '<button type="button" class="wahlknopf' + (w.set === gewaehlt ? " an" : "") + '" data-set="' + w.set + '" aria-pressed="' + (w.set === gewaehlt) + '">' +
        esc(w.name) + (w.set === plan ? ' <small>heute</small>' : "") + '</button>';
    }).join("");
    $("start-satz").textContent = M.PLAN[datum]
      ? "Heute (" + wt + ") sind dran: " + reihenName(plan) + "."
      : "Heute üben wir " + reihenName(plan) + ". Du kannst auch eine andere Auswahl nehmen.";
    var wied = M.wacklerListe(stand).length;
    $("teil-c-satz").textContent = "Der Trick für " + reihenName(gewaehlt) + ".";
    $("teil-a-satz").textContent = M.EIN.dreiecke + " Dreiecke, Mal und Geteilt" + (wied ? " – vorn " + Math.min(wied, gewaehlt === "gemischt" ? M.EIN.wacklerVornMix : M.EIN.wacklerVorn) + " von letztem Mal" : "") + ".";
    $("teil-b-satz").textContent = M.EIN.tempo + " schnelle Aufgaben. Danach siehst du deine Zeit.";
    var fertig = heuteGeschafft(gewaehlt);
    ["teil-c", "teil-a", "teil-b"].forEach(function (id) { $(id).classList.toggle("fertig", fertig); });
    $("los").textContent = fertig ? "Noch einmal üben" : "Los geht's";
    $("start-fertig").textContent = heuteGeschafft() ? "Heute schon geschafft. Du kannst gern noch eine andere Reihe üben." : "";
  }

  /* ---------- Merkhilfe (C) ---------- */
  function merkZeigen() {
    zeige("merk");
    $("merk-kopf").textContent = "Der Trick für " + reihenName(gewaehlt);
    $("merk-liste").innerHTML = M.merkKarten(gewaehlt).map(function (k) {
      return '<div class="merkkarte' + (k.klein ? " klein" : "") + (k.dreieck ? " mitdreieck" : "") + '"' + (k.r ? ' data-reihe="' + k.r + '"' : "") + '>' +
        (k.dreieck ? dreieckHtml({ a: 3, b: 5, p: 15, fehlt: "" }, "", true) : "") +
        '<div><b>' + esc(k.kopf) + '</b><p>' + esc(k.satz) + '</p>' + (k.bsp ? '<p class="bsp">' + esc(k.bsp) + '</p>' : "") + '</div></div>';
    }).join("");
  }

  /* ---------- Spiel ---------- */
  function teilBeginnen(phase) {
    var liste = phase === "a" ? M.rundeDreiecke(stand, datum, gewaehlt)
      : M.rundeTempo(datum, gewaehlt, (stand.tage[datum] || []).length);
    var erg = phase === "b" && lauf && lauf.erg ? lauf.erg : { a: [], b: [] };
    lauf = { d: datum, set: gewaehlt, phase: phase, liste: liste, i: 0, erg: erg, versuche: 0, eingabe: "", tipp: "", zeitB: 0 };
    laufMerken();
    zeige("spiel");
    aufgabeZeigen();
  }
  function aktuell() { var e = lauf.liste[lauf.i]; return e ? M.aufgabe(e.k, e.r) : null; }

  function dreieckHtml(x, eingabe, beispiel) {
    function ecke(pos, wert) {
      var leer = x.fehlt === pos;
      return '<div class="ecke ' + pos + (leer ? " leer" : "") + '"' + (leer && !beispiel ? ' id="feld"' : "") + '>' + (leer ? esc(eingabe || "") : wert) + '</div>';
    }
    return '<div class="dreieck' + (beispiel ? " beispiel" : "") + '" aria-label="Zahlendreieck">' +
      '<svg viewBox="0 0 100 86" preserveAspectRatio="none" aria-hidden="true"><polygon points="50,8 8,78 92,78"/></svg>' +
      ecke("oben", x.p) + ecke("links", x.a) + ecke("rechts", x.b) + '</div>';
  }

  function aufgabeZeigen() {
    var x = aktuell();
    if (!x) { teilFertig(); return; }
    var a = lauf.phase === "a";
    $("teil").textContent = a ? "Zahlendreiecke" : "Tempo-Runde";
    // "X von 20" zählt nur die ersten Aufgaben; Wiederholungen (w) tragen "Noch einmal".
    var e = lauf.liste[lauf.i], nr = 0, gesamt = 0;
    lauf.liste.forEach(function (y, j) { if (!y.w) { gesamt++; if (j <= lauf.i) nr++; } });
    $("zaehler").textContent = e.w ? "Noch einmal üben" : (a ? "Dreieck " : "Aufgabe ") + nr + " von " + gesamt;
    if (a) {
      $("aufgabe").innerHTML = dreieckHtml(x, lauf.eingabe) + '<p class="rechnung" id="frage">' + esc(x.rechnung) + '</p>';
    } else {
      $("aufgabe").innerHTML = '<div class="malzeile"><span id="frage">' + esc(x.rechnung.replace(" = ?", "")) + ' =</span><span class="feld" id="feld">' + esc(lauf.eingabe) + '</span></div>';
    }
    $("aufgabe").setAttribute("data-art", x.art);
    $("aufgabe").setAttribute("data-fehlt", a ? x.fehlt : "");
    $("spiel").setAttribute("data-phase", lauf.phase);
    document.querySelector('[data-taste="ok"]').textContent = "Prüfen";
    tipp(lauf.versuche ? lauf.tipp : "", false);
    weiterZeigen(false);
    sperre = false;
    shown = jetzt(); verdeckt = 0; verdecktSeit = document.hidden ? shown : 0;
  }
  function jetzt() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function vergangen() {
    var v = verdeckt + (verdecktSeit ? jetzt() - verdecktSeit : 0);
    return Math.min(120, Math.max(0, (jetzt() - shown - v) / 1000));
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) verdecktSeit = jetzt();
    else if (verdecktSeit) { verdeckt += jetzt() - verdecktSeit; verdecktSeit = 0; }
  });

  function tipp(t, gut, falsch) {
    var el = $("tipp"); el.textContent = t || "";
    el.classList.toggle("gut", !!gut); el.classList.toggle("falsch", !!falsch);
  }
  /* Ergebnis stehen lassen: großer Knopf "Weiter", Zifferntasten ruhen. */
  function weiterZeigen(an) {
    $("weiter").classList.toggle("verborgen", !an);
    $("tasten").classList.toggle("ruht", !!an);
    if (an) ergebnisSeit = jetzt();
  }

  function taste(z) {
    if (!lauf || lauf.phase === "a-fertig") return;
    if (sperre) { if (z === "ok") naechste(); return; }
    if (z === "weg") lauf.eingabe = lauf.eingabe.slice(0, -1);
    else if (z === "ok") { pruefen(); return; }
    else if (lauf.eingabe.length < 3) lauf.eingabe += z;
    $("feld").textContent = lauf.eingabe;
  }

  function pruefen() {
    if (!lauf.eingabe) return;
    var x = aktuell(), wert = +lauf.eingabe, stimmt = wert === x.loesung, erster = lauf.versuche === 0;
    var e = lauf.liste[lauf.i], wieder = !!e.w;
    // Gezählt, gemeldet und gebucht wird nur der erste Versuch einer ersten Aufgabe – keine Wiederholung.
    if (erster && !wieder) {
      var sek = Math.round(vergangen() * 10) / 10;
      lauf.erg[lauf.phase].push({ k: x.k, r: x.r, ok: stimmt, sek: sek });
      melden(x, stimmt, wert, sek);
    }
    // Falsch beim ersten Versuch: kommt in dieser Runde wieder, dazu dieselbe Form mit neuen Zahlen.
    if (erster && !stimmt) M.wiederholungEinreihen(lauf.liste, lauf.i, e, datum + "|" + lauf.phase + "|" + lauf.i);
    if (stimmt) { richtig(x, erster); return; }
    if (lauf.phase === "b") { tempoFalsch(x, wert); return; }
    lauf.versuche++;
    lauf.eingabe = "";
    var f = $("feld"); f.textContent = ""; f.classList.remove("rueck"); void f.offsetWidth; f.classList.add("rueck");
    lauf.tipp = M.hilfe(x, Math.min(2, lauf.versuche));
    tipp(lauf.tipp, false);
    laufMerken();
  }

  function richtig(x, erster) {
    $("feld").classList.add("gut");
    sperre = true; lauf.wartet = true;
    // Tempo-Zeit nur für die ersten 20 Aufgaben; Wiederholungen zählen nicht in die Zeit.
    if (lauf.phase === "b" && !lauf.liste[lauf.i].w) lauf.zeitB += vergangen();
    tipp((erster ? "Richtig! " : "Gut, jetzt stimmt es. ") + M.bestaetigung(x) + ".", true);
    document.querySelector('[data-taste="ok"]').textContent = "Weiter";
    lauf.i++; lauf.versuche = 0; lauf.eingabe = ""; lauf.tipp = "";
    laufMerken();
    // Bleibt stehen, bis Paul "Weiter" tippt (Denny, 16.10.2026) – auch in der Tempo-Runde.
    weiterZeigen(true);
  }

  /* Tempo-Runde, falsch: Pauls Zahl bleibt stehen, die richtige steht daneben. Ein Versuch. */
  function tempoFalsch(x, wert) {
    var f = $("feld"); f.classList.add("falsch");
    f.insertAdjacentHTML("afterend", '<span class="richtigzahl" id="richtigzahl">' + esc(x.loesung) + '</span>');
    sperre = true; lauf.wartet = true;
    if (!lauf.liste[lauf.i].w) lauf.zeitB += vergangen();
    tipp("Fast! Richtig ist " + x.loesung + ". " + M.bestaetigung(x) + ".", false, true);
    document.querySelector('[data-taste="ok"]').textContent = "Weiter";
    lauf.i++; lauf.versuche = 0; lauf.eingabe = ""; lauf.tipp = "";
    laufMerken();
    weiterZeigen(true);
  }

  function naechste() {
    if (!sperre || !lauf || !lauf.wartet) return;
    if (jetzt() - ergebnisSeit < SPERRE_MS) return;   // Doppeltipp auf Prüfen überspringt nichts
    lauf.wartet = false;
    weiterZeigen(false);
    if (lauf.i >= lauf.liste.length) teilFertig(); else aufgabeZeigen();
  }

  function teilFertig() {
    if (lauf.phase === "a" || lauf.phase === "a-fertig") {
      var fam = familieWaehlen();
      $("zwischen-kopf").textContent = "Dreiecke geschafft!";
      $("zwischen-satz").textContent = "Eine Zahlenfamilie: drei Zahlen, vier Aufgaben. Danach kommt die Tempo-Runde – rechne in deinem Tempo.";
      $("familie").innerHTML = dreieckHtml({ a: fam[0], b: fam[1], p: fam[0] * fam[1], fehlt: "" }, "", true) +
        '<ul>' + M.familie(fam[0], fam[1]).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + '</ul>';
      lauf.phase = "a-fertig"; laufMerken();
      zeige("zwischen");
      return;
    }
    // Tempo fertig: buchen, einmal schreiben, Rückschau.
    var sek = Math.max(1, Math.round(lauf.zeitB));
    var satz = M.rueckschau(stand, lauf.set, sek);
    stand = M.buchen(stand, datum, lauf.set, { dreieck: lauf.erg.a, tempo: lauf.erg.b, zeit: sek });
    speichern();
    var a = lauf.erg.a, b = lauf.erg.b;
    var ra = a.filter(function (e) { return e.ok; }).length, rb = b.filter(function (e) { return e.ok; }).length;
    lauf = null; laufWeg();
    zeige("ende");
    $("ende-zeit").textContent = satz;
    $("ende-zahlen").textContent = "Beim ersten Versuch richtig: Dreiecke " + ra + " von " + a.length + ", Tempo-Runde " + rb + " von " + b.length + ".";
    var w = M.wacklerListe(stand).length;
    $("ende-morgen").textContent = w ? "Was heute gewackelt hat, kommt beim nächsten Mal zuerst (" + w + (w === 1 ? " Aufgabe" : " Aufgaben") + ")." : "Heute hat nichts gewackelt.";
  }
  function familieWaehlen() {
    var falsch = lauf.erg.a.filter(function (e) { return !e.ok; });
    var kand = (falsch.length ? falsch : lauf.erg.a).map(function (e) { return M.aufgabe(e.k); })
      .filter(function (x) { return x && x.a > 1 && x.a !== x.b; });
    var x = kand[0] || { a: 3, b: 5 };
    return [x.a, x.b];
  }

  function melden(x, stimmt, wert, sek) {
    try {
      if (!window.lernstand) return;
      // 6. Angabe (seit 13.10.2026): Sekunden bis zum ersten Versuch.
      window.lernstand.antwort(stimmt, x.merkmal, wert, x.loesung, x.punkt, sek);
    } catch (e) {}
  }

  function zeige(welche) {
    ["start", "merk", "zwischen", "spiel", "ende"].forEach(function (id) { $(id).classList.toggle("verborgen", id !== welche); });
    window.scrollTo(0, 0);
  }

  /* ---------- Bedienung ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-taste]") : null;
    if (t) { taste(t.getAttribute("data-taste")); return; }
    var w = e.target.closest ? e.target.closest("[data-set]") : null;
    if (w) { gewaehlt = w.getAttribute("data-set"); startZeigen(); return; }
    var b = e.target.closest ? e.target.closest("button") : null, id = b ? b.id : "";
    if (id === "los") { lauf = null; laufWeg(); merkZeigen(); return; }
    if (id === "merk-los") { lauf = null; teilBeginnen("a"); return; }
    if (id === "weiter-tempo") { teilBeginnen("b"); return; }
    if (id === "nochmal") { startZeigen(); return; }
    if (id === "weiter") { naechste(); return; }
  });
  document.addEventListener("keydown", function (e) {
    if ($("spiel").classList.contains("verborgen")) return;
    var t = e["key"];
    if (e.repeat) return;   // gehaltene Taste wertet nicht mehrfach
    if (/^[0-9]$/.test(t)) taste(t);
    else if (t === "Backspace") taste("weg");
    else if (t === "Enter") taste("ok");
  });

  /* Nach Neuladen oder Update genau da weitermachen (sessionStorage dieses Tabs, LWWeiter). */
  function fortsetzen(l) {
    if (!l || l.d !== datum || !l.liste) return false;
    lauf = l; lauf.wartet = false; gewaehlt = l.set;
    if (lauf.phase === "a-fertig" || lauf.i >= lauf.liste.length) { teilFertig(); return true; }
    zeige("spiel");
    aufgabeZeigen();
    return true;
  }
  var weiterSeite = { sichern: function () { return lauf; }, laden: function (l) { fortsetzen(l); } };
  if (window.LWWeiter) window.LWWeiter.anmelden(weiterSeite); else window.LW_WEITER = weiterSeite;

  if (!fortsetzen(laufHolen())) startZeigen();

  // Für die Messung (mess-schritte-einmaleinswoche.js): lesen, nichts verändern.
  window.__einmaleinswoche = {
    motor: M, stand: function () { return stand; }, lauf: function () { return lauf; },
    datum: function () { return datum; }, gewaehlt: function () { return gewaehlt; },
    aktuell: function () { return lauf && lauf.liste && lauf.phase !== "a-fertig" ? aktuell() : null; }
  };
})();
