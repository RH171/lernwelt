/* Helenas Zeugnis-Hochrechnung (19.10.2026, Denny per Klickfrage: Startseite D,
 * "Noten eintragen + Zeugnis-Hochrechnung in Mein Halbjahr").
 *
 * Grundlage: GSO § 28 "Bildung der Jahresfortgangsnote in den Jahrgangsstufen
 * 5 bis 11" (gesetze-bayern.de/Content/Document/BayGSO-28, Fassung ab
 * 01.08.2026, gelesen 19.10.2026):
 *   - Faecher MIT Schulaufgaben: zwei Gesamtnoten, eine fuer die grossen, eine
 *     fuer die kleinen Leistungsnachweise. Bei zwei Schulaufgaben grundsaetzlich
 *     1:1, bei mehr als zwei grundsaetzlich 2:1.
 *   - Faecher OHNE Schulaufgaben: nur die kleinen.
 *   - Die kleinen untereinander "in angemessener Gewichtung" - das legt die
 *     Schule fest, deshalb ist es hier einstellbar (Standard je 1).
 * Zahl der Schulaufgaben (7. Klasse, KMS 18.06.2026, functions/api/_noten.js
 * SCHULAUFGABEN): Deutsch 3, Englisch 4, Mathe 4, Franzoesisch 4 -> ueberall 2:1.
 * BET 7: doppelt gewichteter kleiner Leistungsnachweis (gewicht 2, fest).
 *
 * Dieselbe Rechnung steht fuer die Eltern in functions/api/_noten.js
 * (fachSchnitt). Hier kommt dazu: einstellbares Verhaeltnis je Fach, Gewichte
 * der kleinen und das Planspiel. Gezeigt wird auf zwei Stellen ABGESCHNITTEN
 * wie in Pauls Zeugnisplaner (Kapitel 126) - die Zeugnisnote gibt die Lehrkraft.
 *
 * Kein DOM, kein Speicher: rein rechnen. pruefe-helena-halbjahr.mjs laedt
 * diese Datei in Node und rechnet sie gegen von Hand gerechnete Werte.
 */
(function (w) {
  "use strict";
  var FAECHER = [
    { k: "englisch",   n: "Englisch",    e: "🇬🇧", sa: 4 },
    { k: "franz",      n: "Französisch", e: "🇫🇷", sa: 4 },
    { k: "mathe",      n: "Mathe",       e: "📐", sa: 4 },
    { k: "deutsch",    n: "Deutsch",     e: "📖", sa: 3 },
    { k: "geschichte", n: "Geschichte",  e: "🏛️", sa: 0 },
    { k: "geo",        n: "Geographie",  e: "🌍", sa: 0 },
    { k: "info",       n: "Informatik",  e: "💻", sa: 0 },
    { k: "rel",        n: "Ethik",       e: "🤔", sa: 0 },
    { k: "musik",      n: "Musik",       e: "🎵", sa: 0 }
  ];
  var FACH = {}; FAECHER.forEach(function (f) { FACH[f.k] = f; });
  var HAUPT = ["englisch", "franz", "mathe", "deutsch"];
  var ARTEN = [
    { k: "schulaufgabe", n: "Schulaufgabe", gross: true },
    { k: "kurzarbeit",   n: "Kurzarbeit" },
    { k: "ex",           n: "Ex" },
    { k: "muendlich",    n: "mündlich" },
    { k: "test",         n: "Test" }
  ];
  var ART = {}; ARTEN.forEach(function (a) { ART[a.k] = a; });
  var KLEINE = ["kurzarbeit", "ex", "muendlich", "test"];

  /* Eltern tragen mit langen Namen ein ("mathematik", "franzoesisch"), Helena
     und das Schulheft mit den kurzen (heftFach() in functions/api/quiz.js). */
  var ALIAS = { mathematik: "mathe", "franzoesisch": "franz", "französisch": "franz", geographie: "geo",
                informatik: "info", ethik: "rel", religion: "rel", "religion-kath": "rel" };
  function fachKey(k) { k = String(k || "").toLowerCase(); return ALIAS[k] || k; }

  function zahl(x, min, max, std) { x = Number(x); if (!isFinite(x)) return std; return Math.max(min, Math.min(max, Math.round(x))); }

  /* Einstellungen mit Standardwerten auffuellen. roh kommt aus localStorage
     ("helena-gewichtung") und darf kaputt oder leer sein. */
  function gewichtung(roh) {
    roh = roh && typeof roh === "object" ? roh : {};
    var g = { verh: {}, klein: {} };
    HAUPT.forEach(function (k) {
      var std = FACH[k].sa > 2 ? 2 : 1;
      var v = roh.verh && roh.verh[k];
      g.verh[k] = v === 1 || v === 2 ? v : std;
    });
    KLEINE.forEach(function (k) { g.klein[k] = zahl(roh.klein && roh.klein[k], 1, 3, 1); });
    return g;
  }

  function hatNote(n) { return n && !n.offen && typeof n.note === "number" && isFinite(n.note); }
  function istGross(n) { return n.art === "gross" || n.lnArt === "schulaufgabe"; }
  function kleinGewicht(n, g) {
    if (n.gewicht === 2) return 2;                 // BET und andere doppelt gewertete: fest
    return (n.lnArt && g.klein[n.lnArt]) || 1;
  }
  function abschneiden(x) {
    if (x === null || x === undefined || !isFinite(x)) return "–";
    var t = Math.floor(x * 100 + 1e-9) / 100;
    return t.toFixed(2).replace(".", ",");
  }

  /* noten: alle Noten EINES Fachs. plan: {note, gross} = die gedachte naechste. */
  function rechnen(noten, fach, g, plan) {
    g = g || gewichtung(null);
    fach = fachKey(fach);
    var f = FACH[fach] || { sa: 0 };
    var mitSa = f.sa > 0;
    var gs = 0, gn = 0, ks = 0, kw = 0;
    (noten || []).forEach(function (n) {
      if (!hatNote(n)) return;
      if (mitSa && istGross(n)) { gs += n.note; gn++; }
      else { var wt = kleinGewicht(n, g); ks += n.note * wt; kw += wt; }
    });
    var p = plan && plan.note >= 1 && plan.note <= 6 ? plan : null;
    if (p) { if (mitSa && p.gross) { gs += p.note; gn++; } else { ks += p.note; kw += 1; } }
    var G = gn ? gs / gn : null, K = kw ? ks / kw : null;
    var v = mitSa ? (g.verh[fach] || (f.sa > 2 ? 2 : 1)) : null;
    var wert, art;
    if (!mitSa) { wert = K; art = "nur kleine (keine Schulaufgaben)"; }
    else if (G === null && K === null) { wert = null; art = "noch keine Note"; }
    else if (G === null) { wert = K; art = "bisher nur kleine"; }
    else if (K === null) { wert = G; art = "bisher nur Schulaufgaben"; }
    else { wert = (v * G + K) / (v + 1); art = "groß : klein = " + v + " : 1"; }
    if (wert === null && !mitSa && K === null) art = "noch keine Note";
    return { wert: wert, text: abschneiden(wert), gross: G, klein: K, verh: v, art: art, plan: !!p,
             anzahlGross: gn - (p && mitSa && p.gross ? 1 : 0) };
  }

  w.LWZeugnis = { FAECHER: FAECHER, FACH: FACH, HAUPT: HAUPT, ARTEN: ARTEN, ART: ART, KLEINE: KLEINE,
                  fachKey: fachKey, gewichtung: gewichtung, rechnen: rechnen, abschneiden: abschneiden, istGross: istGross };
})(typeof window !== "undefined" ? window : this);
