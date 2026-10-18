/* Wort-Detektiv: Paul übt die 14 Mathe-Fachwörter (18.10.2026, Kapitel 121, Abschnitt „Wort-Detektiv“).
 *
 * Denny am 18.10.2026, 18:44 Uhr, gewählt „L · Wort-Detektiv“ (unterlagen/fachwoerter-ueben-versionen.html), dazu:
 * „Paul sollte die Möglichkeit der Antwort haben. Diese Wörter sind relativ schwer zu schreiben für ihn. Sprich, wenn
 * er sie halbwegs schreiben kann bzw. antippen könnte, würde es erst mal helfen.“
 *
 * 14 Fälle, einer nach dem anderen: eine Rechnung mit markiertem Teil und eine Frage. Antworten auf zwei Wegen,
 * beide sofort sichtbar: Fachwort eintippen (großzügige Schreibtoleranz) ODER eines von 4 Wortknöpfen antippen.
 * Hilfe in Stufen (Kapitel 044): 1. Fehlversuch Anfangsbuchstabe + ein falscher Knopf blass, 2. nur noch 2 Knöpfe,
 * ab dem 3. bleibt nur der richtige Knopf. Nach jeder Lösung der Merksatz, dann „Weiter“.
 *
 * Wort und Merksatz kommen aus PSMotor.FACHWORT (probenstoff/motor.js) – eine Quelle mit Lernliste und Teil 3.
 * Gezählt und gemeldet wird nur der erste Versuch je Fall (lernstand.antwort, Merkmal „probe fachwoerter“,
 * Lernpunkt „fw-detektiv:<id>“). Gespeichert wird sonst nichts. Kein „weil“, keine Frage nach dem Grund.
 *
 * Läuft auch in Node (Prüfung der Schreibtoleranz): module.exports = { pruefen, phon, abstand, … }. */
(function (wurzel) {
  "use strict";
  var M = wurzel.PSMotor;
  if (!M && typeof require === "function") { try { M = require("./motor.js"); } catch (e) {} }
  if (!M || !M.FACHWORT) return;

  var FW = {}; M.FACHWORT.forEach(function (c) { FW[c.id] = c; });

  /* Die 14 Fälle. Farbe wie das Merkplakat: plus grün, minus rot, mal blau, geteilt gelb/braun, sonst lila. */
  var FAELLE = [
    { id: "addieren", f: "plus", bild: '25 <span class="mark">+</span> 17 = 42', frage: "Was machst du hier mit 25 und 17? Du …" },
    { id: "subtrahieren", f: "minus", bild: '42 <span class="mark">−</span> 17 = 25', frage: "Was machst du hier mit 42 und 17? Du …" },
    { id: "multiplizieren", f: "mal", bild: '7 <span class="mark">·</span> 6 = 42', frage: "Was machst du hier mit 7 und 6? Du …" },
    { id: "dividieren", f: "geteilt", bild: '42 <span class="mark">:</span> 6 = 7', frage: "Was machst du hier mit 42 und 6? Du …" },
    { id: "summe", f: "plus", bild: '25 + 17 = <span class="mark">42</span>', frage: "Wie heißt die 42?" },
    { id: "differenz", f: "minus", bild: '42 − 17 = <span class="mark">25</span>', frage: "Wie heißt die 25?" },
    { id: "produkt", f: "mal", bild: '7 · 6 = <span class="mark">42</span>', frage: "Wie heißt die 42?" },
    { id: "quotient", f: "geteilt", bild: '42 : 6 = <span class="mark">7</span>', frage: "Wie heißt die 7?" },
    { id: "tausch", f: "mal", bild: '7 · 6 = 42<br><span class="mark">6 · 7 = 42</span>', frage: "Welche Aufgabe ist 6 · 7 = 42 zu 7 · 6 = 42?" },
    { id: "umkehr", f: "geteilt", bild: '7 · 6 = 42<br><span class="mark">42 : 6 = 7</span>', frage: "Welche Aufgabe ist 42 : 6 = 7 zu 7 · 6 = 42?" },
    { id: "vielfache", f: "mal", bild: '<span class="mark">7, 14, 21, 28 …</span>', frage: "Diese Zahlen stehen in der 7er-Reihe. Wie heißen sie? Die … von 7" },
    { id: "teiler", f: "geteilt", bild: '<span class="mark">1, 2, 4, 5, 10, 20</span>', frage: "Diese Zahlen teilen die 20 ohne Rest. Wie heißen sie? Die … von 20" },
    { id: "primzahl", f: "lila", bild: '<span class="mark">19</span>', frage: "Nur 1 und 19 teilen die 19. Was für eine Zahl ist die 19?" },
    { id: "punkt", f: "lila", bild: '50 − <span class="mark">3 · 9</span> = 23', frage: "Erst 3 · 9, dann minus. Wie heißt diese Regel?" }
  ];
  /* Drei passende falsche Wörter je Fall (aus den 14): gleiche Gruppe zuerst. */
  var FALSCH = {
    addieren: ["subtrahieren", "multiplizieren", "dividieren"], subtrahieren: ["addieren", "dividieren", "multiplizieren"],
    multiplizieren: ["dividieren", "addieren", "subtrahieren"], dividieren: ["multiplizieren", "subtrahieren", "addieren"],
    summe: ["produkt", "differenz", "quotient"], differenz: ["summe", "quotient", "produkt"],
    produkt: ["summe", "quotient", "differenz"], quotient: ["produkt", "differenz", "summe"],
    tausch: ["umkehr", "punkt", "vielfache"], umkehr: ["tausch", "teiler", "punkt"],
    vielfache: ["teiler", "primzahl", "produkt"], teiler: ["vielfache", "primzahl", "quotient"],
    primzahl: ["teiler", "vielfache", "produkt"], punkt: ["tausch", "umkehr", "primzahl"]
  };
  /* Weitere Schreibweisen, die als richtig gelten. */
  var AUCH = { vielfache: ["Vielfache"], primzahl: ["Primzahlen"], teiler: ["Teilern"] };
  /* Rechenarten: kein Fachwort dieser Übung, aber eine Eingabe nah daran darf nie zu „addieren“ & Co. werden. */
  var NOMEN = ["Addition", "Subtraktion", "Multiplikation", "Division"];

  function wortVon(id) {
    var c = FW[id], m = /^(der|die|das) (.+)$/.exec(c.wort);
    var w = m ? m[2] : c.wort;
    return { id: id, art: m ? m[1] : "", wort: w, anzeige: c.wort, formen: [w].concat(AUCH[id] || []), merk: c.merk };
  }
  var WORT = {}; FAELLE.forEach(function (f) { WORT[f.id] = wortVon(f.id); });

  /* ---------- Schreibtoleranz ----------
   * Klein, Artikel weg, Umlaute, ph→f, qu→kw, tz/ts→z, ck/c→k (ch bleibt), v→f, ie→i, Dehnungs-h weg,
   * doppelte Buchstaben einfach, Leerzeichen weg. Danach Abstand ≤ 2, ab 9 Buchstaben ≤ 3 (vertauschte
   * Nachbarn zählen 1). Liegt ein anderes der 14 Wörter (oder eine Rechenart) genauso nah oder näher,
   * gilt die Eingabe nicht als richtig. */
  function phon(s) {
    s = String(s == null ? "" : s).toLowerCase().replace(/[’'`´.,;:!?"„“”()\-–_]/g, " ").replace(/\s+/g, " ").trim();
    s = s.replace(/^(der|die|das|den|dem|des|ein|eine|einen|einer|eines)\s+/, "");
    s = s.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "s").replace(/\s+/g, "");
    s = s.replace(/ch/g, "§").replace(/ph/g, "f").replace(/qu/g, "kw").replace(/tz/g, "z").replace(/ts/g, "z")
      .replace(/ck/g, "k").replace(/c/g, "k").replace(/v/g, "f").replace(/y/g, "i").replace(/dt/g, "t").replace(/th/g, "t")
      .replace(/ie/g, "i").replace(/([aeiou])h(?=[^aeiou]|$)/g, "$1").replace(/§/g, "ch");
    return s.replace(/(.)\1+/g, "$1");
  }
  function abstand(a, b) {   // Levenshtein mit vertauschten Nachbarn (OSA)
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 0; j <= n; j++) { d[0][j] = j; }
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) {
      var k = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + k);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[m][n];
  }
  function grenze(wort) { return wort.replace(/[^A-Za-zÄÖÜäöüß]/g, "").length >= 9 ? 3 : 2; }
  function naechster(p, ohne) {   // nächstliegendes anderes Wort: { id|nomen, d }
    var best = { id: "", d: 99 };
    FAELLE.forEach(function (f) {
      if (f.id === ohne) return;
      WORT[f.id].formen.forEach(function (w) { var d = abstand(p, phon(w)); if (d < best.d) best = { id: f.id, d: d }; });
    });
    NOMEN.forEach(function (w) { var d = abstand(p, phon(w)); if (d < best.d) best = { id: "nomen:" + w, d: d }; });
    return best;
  }
  /* -> { stufe: "gut" | "fast" | "falsch" | "leer", anders: id des anderen Fachworts, wenn genau getroffen } */
  function pruefen(eingabe, id) {
    var soll = WORT[id], roh = String(eingabe == null ? "" : eingabe).trim().replace(/\s+/g, " ");
    if (!roh) return { stufe: "leer" };
    var ohneArt = roh.replace(/^(der|die|das)\s+/i, "");
    if (soll.formen.indexOf(ohneArt) >= 0) return { stufe: "gut" };
    var p = phon(roh);
    if (p.length < 2) return { stufe: "falsch" };
    var ds = Math.min.apply(null, soll.formen.map(function (w) { return abstand(p, phon(w)); }));
    var nb = naechster(p, id);
    // Ein anderes der 14 Wörter getroffen (auch halbwegs geschrieben): für den Denkfehler-Satz.
    var anders = nb.id && nb.id.indexOf("nomen:") !== 0 && nb.d < ds && nb.d <= grenze(WORT[nb.id].wort) ? nb.id : "";
    if (ds > grenze(soll.wort) || nb.d <= ds) return { stufe: "falsch", anders: anders };
    return { stufe: "fast" };
  }

  var API = { FAELLE: FAELLE, FALSCH: FALSCH, WORT: WORT, phon: phon, abstand: abstand, pruefen: pruefen, grenze: grenze };
  if (typeof module === "object" && module.exports) module.exports = API;
  if (typeof document === "undefined") return;

  /* ---------- Seite ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(t) { var d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; }
  function mischen(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function jetzt() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  var FINGER = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  var B = $("buehne");
  var liste, i, fehl, ersterOk, selbst, wackler, melden, fall, gestartet, geloest, gemeldet, weiterAb;
  var WEITER_MS = typeof window.__fwdWeiterMs === "number" ? window.__fwdWeiterMs : 400;

  function start(neu, mitMelden) {
    liste = neu; i = 0; ersterOk = 0; selbst = 0; wackler = []; melden = mitMelden;
    zeigeFall();
  }

  function zeigeFall() {
    if (i >= liste.length) return ende();
    fall = liste[i]; fehl = 0; geloest = false; gemeldet = false; gestartet = jetzt();
    var w = WORT[fall.id];
    var knoepfe = mischen([fall.id].concat(FALSCH[fall.id]));
    B.innerHTML = '<section class="fall ' + fall.f + '" id="fall" data-id="' + fall.id + '">' +
      '<div class="nr">🔍 Fall ' + (i + 1) + ' von ' + liste.length + '</div>' +
      '<div class="bild" id="bild">' + fall.bild + '</div>' +
      '<p class="frage" id="frage">' + esc(fall.frage) + '</p>' +
      '<div class="eingabe"><input id="ein" class="wort" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"' +
      ' placeholder="Fachwort eintippen" aria-label="Fachwort eintippen"><button id="pruefen" class="knopf primaer" type="button">✔️ Prüfen</button></div>' +
      '<div class="hilfe" id="hilfe" aria-live="polite"></div>' +
      '<p class="oder">oder tippe an:</p>' +
      '<div class="wahl" id="wahl">' + knoepfe.map(function (id) {
        return '<button type="button" class="wwahl" data-id="' + id + '">' + esc(WORT[id].wort) + '</button>';
      }).join("") + '</div>' +
      '<div id="merk" aria-live="polite"></div>' +
      '<div class="mitte"><button id="weiter" class="knopf primaer verborgen" type="button">' + (i + 1 < liste.length ? "Weiter ➜" : "Zum Ergebnis ➜") + '</button></div>' +
      '</section>';
    var ein = $("ein");
    ein.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); if (e.repeat) return; if (geloest) weiter(); else eingabePruefen(); } });
    ein.addEventListener("input", vorschlag);
    $("pruefen").addEventListener("click", eingabePruefen);
    [].forEach.call(document.querySelectorAll("#wahl .wwahl"), function (b) { b.addEventListener("click", function () { antippen(b); }); });
    $("weiter").addEventListener("click", weiter);
    window.scrollTo(0, 0);
    if (!FINGER) setTimeout(function () { try { ein.focus(); } catch (e) {} }, 50);
  }

  function knoepfe() { return [].slice.call(document.querySelectorAll("#wahl .wwahl")); }
  function sichtbar() { return knoepfe().filter(function (b) { return !b.classList.contains("verborgen"); }); }

  /* Ab 3 Buchstaben leuchtet der Knopf auf, der zum Getippten passt (Anfang des Wortes, höchstens 1 Zeichen daneben). */
  function vorschlag() {
    if (geloest) return;
    var p = phon($("ein").value), bester = null, bd = 99, gleich = false;
    knoepfe().forEach(function (b) { b.classList.remove("vorschlag"); });
    if (p.length < 3) return;
    sichtbar().forEach(function (b) {
      var w = phon(WORT[b.getAttribute("data-id")].wort), d = abstand(p, w.slice(0, p.length));
      if (p.length >= w.length - 1) d = Math.min(d, abstand(p, w));
      if (d < bd) { bd = d; bester = b; gleich = false; } else if (d === bd) gleich = true;
    });
    if (bester && !gleich && bd <= (p.length >= 6 ? 2 : 1)) bester.classList.add("vorschlag");
  }

  function eingabePruefen() {
    if (geloest) return;
    var ein = $("ein"), r = pruefen(ein.value, fall.id);
    if (r.stufe === "leer") { wackel(ein); $("hilfe").textContent = "Schreib das Fachwort oder tippe unten ein Wort an."; return; }
    if (r.stufe === "gut" || r.stufe === "fast") return loesen(true, r.stufe === "fast", ein.value);
    fehlversuch(ein.value, r.anders, ein);
    ein.classList.add("nochmal");
    try { ein.select(); } catch (e) {}
  }

  function antippen(b) {
    if (geloest) return;
    var id = b.getAttribute("data-id");
    if (id === fall.id) return loesen(false, false, WORT[id].wort);
    fehlversuch(WORT[id].wort, id, b);
  }

  function melde(ok, gegeben) {
    if (gemeldet) return;
    gemeldet = true;
    if (!melden) return;
    var sek = Math.round((jetzt() - gestartet) / 100) / 10;
    try { if (window.lernstand) window.lernstand.antwort(ok, "probe fachwoerter", gegeben, WORT[fall.id].wort, "fw-detektiv:" + fall.id, sek, fall.frage); } catch (e) {}
  }

  function fehlversuch(gegeben, anders, el) {
    var gewaehlt = anders;
    melde(false, gegeben);
    fehl++;
    wackel(el);
    var w = WORT[fall.id], h = "", falsche = sichtbar().filter(function (b) { return b.getAttribute("data-id") !== fall.id; });
    // Denkfehler zuerst: was das falsch gewählte Wort bedeutet (Merksatz jenes Wortes, nennt die Lösung nicht).
    // Nennt der Merksatz des anderen Wortes die Lösung („Primzahlen haben als Teiler …“), entfällt er.
    if (anders && WORT[anders] && WORT[anders].merk.toLowerCase().indexOf(w.wort.toLowerCase().slice(0, 5)) >= 0) anders = "";
    var dk = anders && WORT[anders] ? '<span class="denk">„' + esc(WORT[anders].wort) + "“: " + esc(WORT[anders].merk) + "</span> " : "";
    if (fehl === 1) {
      h = dk + "💡 Das Wort fängt mit <b class=\"anfang\">" + esc(w.wort.charAt(0).toUpperCase()) + "</b> an" + (w.art ? " (" + w.art + " …)" : "") + ". Versuch es noch einmal.";
      // Blass wird das falsch gewählte Wort, sonst irgendein falsches (Kapitel 044: bleibt antippbar).
      var blass = falsche.filter(function (b) { return b.getAttribute("data-id") === gewaehlt; })[0] || falsche[0];
      if (blass) blass.classList.add("blass");
    } else if (fehl === 2) {
      h = dk + "💡 Eins von diesen zwei ist es. Tipp es an oder schreib es.";
      // Nur noch 2 Knöpfe: der richtige und einer der falschen (nicht der blasse).
      var bleibt = falsche.filter(function (b) { return !b.classList.contains("blass"); })[0] || falsche[0];
      falsche.forEach(function (b) { if (b !== bleibt) b.classList.add("verborgen"); });
    } else {
      h = "Gut probiert! Das Wort heißt <b class=\"anfang\">" + esc(w.anzeige) + "</b>. Tipp es an oder schreib es ab.";
      falsche.forEach(function (b) { b.classList.add("verborgen"); });
      knoepfe().forEach(function (b) { if (b.getAttribute("data-id") === fall.id) b.classList.add("vorschlag"); });
    }
    $("hilfe").innerHTML = h;
    vorschlag();
  }

  function loesen(getippt, schreibweise, gegeben) {
    geloest = true;
    melde(true, gegeben);
    if (fehl === 0) { ersterOk++; if (getippt) selbst++; } else wackler.push(fall);
    var w = WORT[fall.id], ein = $("ein");
    ein.classList.remove("nochmal"); ein.classList.add("gut"); ein.readOnly = true;
    $("pruefen").classList.add("verborgen");
    $("hilfe").innerHTML = "";
    knoepfe().forEach(function (b) {
      b.disabled = true; b.classList.remove("vorschlag");
      if (b.getAttribute("data-id") === fall.id) { b.classList.remove("blass", "verborgen"); b.classList.add("richtig"); }
    });
    var lob = fehl === 0 ? (getippt ? "✅ Richtig – selbst geschrieben!" : "✅ Richtig!") : "✅ Geschafft – gut drangeblieben!";
    $("merk").innerHTML = '<div class="merkbox" id="merkbox"><div class="lob">' + lob + '</div>' +
      (schreibweise ? '<div class="schreib">So schreibt man es:</div>' : "") +
      '<div class="gross" id="loesung">' + esc(w.anzeige) + '</div><div class="satz">' + esc(w.merk) + '</div></div>';
    // Nach der Lösung nur noch Rechnung, Frage, Merksatz und „Weiter“: so steht „Weiter“ auch bei offener Tastatur im Bild.
    document.querySelector(".eingabe").classList.add("verborgen");
    document.querySelector(".oder").classList.add("verborgen");
    $("wahl").classList.add("verborgen");
    var wt = $("weiter"); wt.classList.remove("verborgen");
    weiterAb = jetzt() + WEITER_MS;
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
    setTimeout(function () { try { wt.focus({ preventScroll: true }); } catch (e) {} }, 60);
    try { wt.scrollIntoView({ block: "end" }); } catch (e) {}
  }

  function weiter() {
    if (!geloest || jetzt() < weiterAb) return;
    i++; zeigeFall();
  }

  function wackel(el) { if (!el) return; el.classList.remove("wackel"); void el.offsetWidth; el.classList.add("wackel"); }

  function ende() {
    fall = null;
    var n = liste.length, h = '<section class="fall ergebnis" id="ende">' +
      '<div class="nr">Fertig! Alle ' + n + ' Fälle gelöst.</div>' +
      '<div class="gross" id="ende-zahl">' + ersterOk + ' von ' + n + '</div><div class="unter">beim ersten Versuch</div>' +
      '<div class="unter" id="ende-selbst">davon ' + selbst + ' selbst geschrieben ✍️</div>';
    if (wackler.length) {
      h += '<p class="dran">Du bist bei jedem Fall drangeblieben. Stark!</p>' +
        '<div class="mitte"><button class="knopf primaer" id="wieder" type="button">🔁 Wackel-Wörter noch einmal</button></div>' +
        '<div class="wackler" id="wackler">Diese Wörter üben wir noch einmal:<ul>' + wackler.map(function (f) { return "<li>" + esc(WORT[f.id].anzeige) + "</li>"; }).join("") + '</ul></div>';
    } else h += '<p class="dran" id="wackler">Jedes Wort sofort gewusst. Super gemerkt!</p>';
    h += '<div class="mitte"><button class="knopf" id="neu" type="button">↺ Alle ' + FAELLE.length + ' neu</button>' +
      '<a class="knopf" href="klasse4-mathe-fachwoerter.html">📖 Zur Fachwörter-Liste</a></div></section>';
    B.innerHTML = h;
    var wl = wackler.slice();
    if ($("wieder")) $("wieder").addEventListener("click", function () { start(wl, false); });
    $("neu").addEventListener("click", function () { start(FAELLE.slice(), true); });
    window.scrollTo(0, 0);
  }

  start(FAELLE.slice(), true);

  // Für die Messung (mess-schritte-fachwort-detektiv.js): lesen, nichts verändern.
  window.__detektiv = {
    api: API,
    stand: function () {
      return { i: i, n: liste.length, fall: fall ? fall.id : "", fehl: fehl, geloest: geloest, ersterOk: ersterOk, selbst: selbst,
        wackler: wackler.map(function (f) { return f.id; }), melden: melden };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
