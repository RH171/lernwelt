/* Pauls Probenstoff Mathe (13.10.2026, Dennys Wahl A + B + D) – die reine Logik, für Browser und Node.
 *
 * Paul schreibt am Montag, 19.10.2026, eine Mathe-Probe. Bis einschließlich diesem Tag gibt es
 * jeden Tag eine Runde, danach ist der Teil still aus (EIN.bis, aktiv()).
 *   A  8 frische Aufgaben aus 5 Themen: mal (Zehnerzahlen), teil (durch Zehner/Zehnerzahlen),
 *      rest (Teilen mit Rest), punkt (Punkt vor Strich), teiler (Teiler und Vielfache).
 *      Stufen je Thema: nach 3 richtigen ersten Versuchen größere Zahlen (höchstens Stufe 2).
 *      Fehlerthemen bekommen die drei freien Plätze zuerst.
 *   B  Kiste: Pauls gezählte Fehlerstellen als Varianten, dazu jede Aufgabe, die er beim ersten
 *      Versuch falsch hat. Sie kommt an den folgenden Übungstagen wieder, bis sie an 3 Übungstagen
 *      beim ersten Versuch sitzt. Gezählt werden Übungstage, nicht Kalendertage.
 *      Paul sieht keine Liste, nur Aufgaben (sie stehen gemischt zwischen den frischen).
 *   D  4 Textaufgaben: 2 im Wortlaut der Lehrerin (Schemata von Pauls Blättern), 2 Sachaufgaben zum neuen Stoff.
 * Jede Aufgabe ist ein Schlüssel ("mal:7x80", "rest:17:5", "tl:36" …); Text, Lösung, Hilfe und
 * Bestätigung kommen aus demselben Schlüssel. Tageszufall aus dem Datum: dieselbe Runde nach Neuladen.
 * Hinweise ohne Begründungssätze (die Lehrerin erlaubt kein "w-e-i-l"), keine Fragen nach dem Grund.
 */
(function (wurzel) {
  "use strict";

  var EIN = {
    an: true,              // Hauptschalter
    bis: "2026-10-19",     // letzter Übungstag (Tag der Probe), danach still aus
    frisch: 16,            // A: frische Aufgaben je Runde (16.10.2026 verdoppelt, Denny: „Paul war immer zu schnell fertig“)
    sach: 4,               // D: Sachaufgaben je Runde (vorher 2), davon „lehrer“ Textaufgaben im Wortlaut der Lehrerin
    lehrer: 2,             // D: Textaufgaben im Wortlaut der Lehrerin je Runde (16.10.2026, Denny 19:13 Uhr)
    blattMax: 4,           // A: so viele der frischen sind „Geschwister“ von Aufgaben auf Pauls neuesten Blättern
    wdhMax: 8,             // Fehler in derselben Runde: höchstens so viele Aufgaben mehr je Teil (16.10.2026)
    wdhAbstand: 4,         // dieselbe Aufgabe kommt nach so vielen Aufgaben wieder
    wdhAbstandNeu: 7,      // dieselbe Form mit neuen Zahlen nach so vielen
    kisteMax: 5,           // B: Kisten-Aufgaben je Tag (Saat-Stellen füllen bis hierhin auf)
    eigeneMax: 8,          // B: eigene Fehler kommen alle, höchstens so viele
    sitztNach: 3,          // B: an so vielen Übungstagen richtig, dann sitzt sie
    stufeNach: 3,          // A: so viele richtige erste Versuche hintereinander, dann nächste Stufe
    stufeMax: 2,
    benutztMax: 500,
    tageMax: 40,
    schreibProTag: 3,      // KV: höchstens drei Schreibvorgänge am Tag (gilt auch mit Teil 3 Fachwörter)
    fach: 20,              // Teil 3 Fachwörter: Aufgaben je Runde (18.10.2026, Denny wollte die doppelte Menge)
    fwKisteMax: 6          // Teil 3: so viele Fachwort-Aufgaben von den Vortagen (falsch beim ersten Versuch) kommen zuerst
  };
  var THEMEN = ["mal", "teil", "rest", "punkt", "teiler"];
  var NAME = {
    mal: "Mal mit Zehnerzahlen", teil: "Teilen durch Zehnerzahlen", rest: "Teilen mit Rest",
    punkt: "Punkt vor Strich", teiler: "Teiler und Vielfache", sach: "Sachaufgabe",
    rech: "Rechnen", raet: "Zahlenrätsel", lt: "Textaufgabe wie im Heft", fw: "Fachwörter"
  };
  var MERKMAL = {
    mal: "probe mal mit zehnerzahlen", teil: "probe teilen durch zehnerzahlen", rest: "probe teilen mit rest",
    punkt: "probe punkt vor strich", teiler: "probe teiler und vielfache", sach: "probe sachaufgabe",
    rech: "probe rechnen", raet: "probe zahlenraetsel", lt: "probe textaufgabe", fw: "probe fachwoerter"
  };

  /* Pauls gezählte Fehlerstellen (Blätter 06.–13.10.2026, befunde/2026-10-13-paul-mathe-stoff.txt).
   * Erste Variante = die Stelle selbst, danach Abwandlungen. f = Startgewicht des Themas. */
  var SAAT = [
    { k: "seed:tl36", v: ["tl:36", "tl:48", "tl:24", "tl:36"] },              // 36: 1, 6, 6
    { k: "seed:m78", v: ["mal:7x80", "mal:8x70", "malp:560=7x?", "mal:80x7"] }, // 7·8/8·7 als 66 (3×)
    { k: "seed:tl50", v: ["tl:50", "tl:40", "tl:30", "tl:50"] },              // 50: 5, 10, 1, 50
    { k: "seed:t1806", v: ["teil:180:6", "teil:240:6", "teil:420:7", "teil:320:8"] }, // 180 : 6 = 40
    { k: "seed:p5039", v: ["pkt:50-3*9", "pkt:60-4*9", "pkt:40-3*8", "pkt:70-6*9"] }, // 50 − 3·9 = 33
    { k: "seed:tl24", v: ["tl:24", "tl:32", "tl:42", "tl:24"] },              // 24: 4 und 3 fehlten
    { k: "seed:t149", v: ["teilp:?:10=49", "teilp:?:10=73", "teilp:?:10=86", "teilp:?:10=38"] }, // ? : 10 = 49
    { k: "seed:tl18", v: ["tl:18", "tl:12", "tl:20", "tl:18"] }               // Teiler von 18: noch mal anschauen
  ];
  var START_F = { mal: 3, teil: 2, rest: 1, punkt: 1, teiler: 4 };

  /* ---------- Hilfen ---------- */
  function heuteIso(jetzt) {
    // Ortszeit, nicht UTC (Kapitel 096). Für Messungen darf window.__psHeute einen Tag vorgeben.
    if (typeof window !== "undefined" && window.__psHeute) return String(window.__psHeute);
    var d = jetzt || new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function aktiv(iso) { return !!EIN.an && String(iso) <= EIN.bis; }
  function hash(s) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function zufall(saat) {   // mulberry32
    var a = hash(String(saat));
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function ganz(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }
  function eins(r, liste) { return liste[Math.floor(r() * liste.length)]; }
  function mischen(liste, r) {
    var a = liste.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function nullen(n) { var z = 0; while (n && n % 10 === 0) { n /= 10; z++; } return z; }
  function ohneNullen(n) { while (n && n % 10 === 0) n /= 10; return n; }
  function zeichen(op) { return op === "*" ? "·" : op === "/" ? ":" : op === "-" ? "−" : "+"; }
  function rechne(a, op, b) { return op === "*" ? a * b : op === "/" ? a / b : op === "-" ? a - b : a + b; }
  function teilerVon(n) { var t = []; for (var i = 1; i <= n; i++) if (n % i === 0) t.push(i); return t; }
  function punktOp(o) { return o === "*" || o === "/"; }
  /* Punkt vor Strich über eine Kette; null, wenn eine Division nicht aufgeht. */
  function rechneKette(z, o) {
    var w = z.slice(), op = o.slice();
    for (var i = 0; i < op.length;) {
      if (punktOp(op[i])) {
        if (op[i] === "/" && (!w[i + 1] || w[i] % w[i + 1])) return null;
        w.splice(i, 2, rechne(w[i], op[i], w[i + 1])); op.splice(i, 1);
      } else i++;
    }
    var v = w[0];
    for (var j = 0; j < op.length; j++) { v = rechne(v, op[j], w[j + 1]); if (v < 0) return null; }
    return v;
  }
  function linksRechnen(z, o) { var v = z[0]; for (var i = 0; i < o.length; i++) { v = rechne(v, o[i], z[i + 1]); if (v !== Math.floor(v)) return null; } return v; }
  /* Der erste Rechenschritt einer Kette (Punkt zuerst, sonst von links): {text, wert}. */
  function ersterSchritt(z, o) {
    var i = 0; for (var j = 0; j < o.length; j++) if (punktOp(o[j])) { i = j; break; }
    if (!o.some(punktOp)) i = 0;
    var w = rechne(z[i], o[i], z[i + 1]);
    return { text: z[i] + " " + zeichen(o[i]) + " " + z[i + 1], wert: w, i: i };
  }
  function paare(n) { var p = []; for (var i = 1; i * i <= n; i++) if (n % i === 0) p.push(i + " · " + (n / i)); return p; }

  /* ---------- Aufgaben aus dem Schlüssel ----------
   * typ: "zahl" (ein Feld), "rest" (Ergebnis und Rest), "tippen" (Zahlen antippen).
   * frage: Anzeige mit "?" an der Stelle des Feldes (bei "rest": "? R ?"). */
  var SACH = {
    stunde: function (n) {
      var d = eins(zufall("ps-sn|" + n), [["ein Ruderboot", "es"], ["ein Fahrrad", "es"], ["ein Tretboot", "es"], ["ein Kanu", "es"]]);
      return { text: "Für 10 Stunden kostet " + d[0] + " " + n + " €. Wie viel kostet " + d[1] + " für 1 Stunde?",
        loesung: n / 10, einheit: "€", rechnung: n + " : 10", schritte: 1, signal: "„für 1 Stunde“: Teile den Preis für 10 Stunden durch 10." };
    },
    gruppen: function (n, d) {
      var w = eins(zufall("ps-sg|" + n + "|" + d), [["Kinder", "Gruppen zu"], ["Kinder", "Teams zu"], ["Spieler", "Mannschaften zu"]]);
      return { text: n + " " + w[0] + " bilden " + w[1] + " " + d + ". Wie viele volle " + w[1].split(" ")[0] + " gibt es? Wie viele " + w[0] + " bleiben übrig?",
        q: Math.floor(n / d), r: n % d, labelA: "volle " + w[1].split(" ")[0], labelB: w[0] + " übrig",
        rechnung: n + " : " + d, schritte: 2, signal: "Wie oft passt " + d + " in " + n + "? Was übrig bleibt, ist der Rest." };
    },
    kisten: function (b, a) {
      var w = eins(zufall("ps-sk|" + a + "|" + b), [["eine Kiste", "Äpfel", "Kisten"], ["eine Schachtel", "Stifte", "Schachteln"], ["eine Packung", "Blätter", "Packungen"], ["einen Korb", "Nüsse", "Körbe"]]);
      return { text: "In " + w[0] + " passen " + b + " " + w[1] + ". Wie viele " + w[1] + " passen in " + a + " " + w[2] + "?",
        loesung: a * b, einheit: w[1], rechnung: a + " · " + b, schritte: 1, signal: "„in " + a + " " + w[2] + "“: " + a + "-mal so viele. Rechne mal." };
    },
    verteilen: function (n, d) {
      var w = eins(zufall("ps-sv|" + n + "|" + d), [["Aufkleber", "Kinder", "jedes Kind"], ["Murmeln", "Kinder", "jedes Kind"], ["Sammelkarten", "Freunde", "jeder Freund"], ["Bonbons", "Kinder", "jedes Kind"]]);
      return { text: n + " " + w[0] + " werden gerecht an " + d + " " + w[1] + " verteilt. Wie viele " + w[0] + " bekommt " + w[2] + "?",
        loesung: n / d, einheit: w[0], rechnung: n + " : " + d, schritte: 1, signal: "„gerecht verteilen“ heißt geteilt." };
    },
    einkauf: function (c, a, b) {
      var w = eins(zufall("ps-se|" + c + "|" + a + "|" + b), [["Bücher", "jedes"], ["Hefte", "jedes"], ["Bälle", "jeder"], ["Spiele", "jedes"]]);
      return { text: "Paul hat " + c + " €. Er kauft " + a + " " + w[0] + ", " + w[1] + " kostet " + b + " €. Wie viel Geld bleibt ihm?",
        loesung: c - a * b, einheit: "€", rechnung: c + " − " + a + " · " + b, links: (c - a) * b, schritte: 2,
        signal: "Rechne zuerst, was die " + w[0] + " zusammen kosten. Das ziehst du von " + c + " € ab." };
    }
  };

  /* ---------- Textaufgaben im Wortlaut der Lehrerin (16.10.2026) ----------
   * Denny, 16.10.2026, 19:13 Uhr: „Die Textaufgabe so nah wie möglich an der Lehrerformulierung knüpfen.
   * Da ist ein Schema zu erkennen.“ Jedes Schema steht so auf einem Blatt von Paul, nur die Zahlen sind neu:
   *   unt   „Berechne den Unterschied der Zahlen 801 und 563. Addiere zum Ergebnis die Zahl 347. Wie heißt die Zahl?“
   *         „Berechne den Unterschied der Zahlen 919 und 755. Teile das Ergebnis durch 2.“      (16.10.2026)
   *   add   „Addiere zu 25 die Zahl 75 und dividiere das Ergebnis durch 2.“                     (30.09.2026, Typ 1)
   *   addt  „Addiere zur Zahl 25 die Zahl 3 und teile das Ergebnis durch 7.“                    (30.09.2026, Nr. 6)
   *   vd    „Verdopple die Zahl 111. Addiere zum Ergebnis 333.“                                (30.09.2026, Nr. 1)
   *   hb    „Halbiere die Zahl 100. Subtrahiere vom Ergebnis 20.“                              (30.09.2026, Nr. 2)
   *   wenn  „Wenn du von meiner Zahl 300 subtrahierst und dann 60 addierst, erhältst du 200.“  (30.09.2026, Nr. 7–10, Typ 2;
   *         16.09.2026 „Wenn du meine Zahl verdoppelst und dann 15 addierst, erhältst du 155.“ – rot durchgestrichen)
   *   du    „Du erhältst meine Zahl, wenn du die Zahl 480 halbierst und dann 30 subtrahierst.“ (16.09.2026, rot durchgestrichen)
   *   dz    „Addiere das Doppelte von 204 zu der Zahl 369.“ „Addiere die Hälfte von 260 zu der Zahl 536.“
   *         „Subtrahiere von der Zahl 335 das Doppelte von 151.“                         (Schulbuch S. 10/11, 28.09.2026)
   *   dif   „Subtrahiere von 508 die Zahl 264. Von der Differenz subtrahiere dann die Zahl 156.“ (Schulbuch S. 11, 28.09.2026)
   *   sum   „Subtrahiere von der Zahl 718 die Summe von 287 und 365.“                    (Schulbuch S. 11, 28.09.2026)
   * Pauls Fehler dabei: den zweiten Schritt vergessen (801 − 563 = 238 statt 585, rot verbessert),
   * und beim Rückwärtsrechnen vorwärts gerechnet (Nr. 7, durchgestrichen). */
  var FACHE = { 2: "Doppelte", 3: "Dreifache", 4: "Vierfache", 5: "Fünffache" };
  function ltAufgabe(sc, p) {
    var n = p.map(function (z) { return /^\d+$/.test(z) ? +z : z; }), x = { art: "lt", schema: sc, typ: "zahl", frage: "?", satz: "Die Zahl ist" };
    var A, B, C, w1, L, s1, s2op, s2b;
    function ok(v) { return v === Math.floor(v) && v >= 0 && v <= 1000; }
    if (sc === "unt") {
      A = n[0]; B = n[1]; C = n[3]; var op = n[2];
      if (!(A > B) || (op !== "+" && op !== "/") || !C) return null;
      w1 = A - B; L = op === "+" ? w1 + C : w1 / C;
      if (op === "/" && (C < 2 || w1 % C)) return null;
      x.text = "Berechne den Unterschied der Zahlen " + A + " und " + B + ". " + (op === "+" ? "Addiere zum Ergebnis die Zahl " + C + ". Wie heißt die Zahl?" : "Teile das Ergebnis durch " + C + ".");
      x.satz = "Meine Zahl ist"; s1 = A + " − " + B; s2op = op; s2b = C; x.op = op;
    } else if (sc === "add" || sc === "addt") {
      A = n[0]; B = n[1]; C = n[2];
      if (!(C >= 2) || (A + B) % C) return null;
      w1 = A + B; L = w1 / C;
      x.text = sc === "add" ? "Addiere zu " + A + " die Zahl " + B + " und dividiere das Ergebnis durch " + C + "." : "Addiere zur Zahl " + A + " die Zahl " + B + " und teile das Ergebnis durch " + C + ".";
      s1 = A + " + " + B; s2op = "/"; s2b = C;
    } else if (sc === "vd") {
      A = n[0]; B = n[1]; w1 = 2 * A; L = w1 + B;
      x.text = "Verdopple die Zahl " + A + ". Addiere zum Ergebnis " + B + ".";
      s1 = A + " · 2"; s2op = "+"; s2b = B;
    } else if (sc === "hb") {
      A = n[0]; B = n[1]; if (A % 2) return null; w1 = A / 2; L = w1 - B; if (L <= 0) return null;
      x.text = "Halbiere die Zahl " + A + ". Subtrahiere vom Ergebnis " + B + ".";
      s1 = A + " : 2"; s2op = "-"; s2b = B;
    } else if (sc === "wenn") {
      /* Rückwärts: wenn:o1:A:o2:B:R. o1 - (subtrahierst A), v (verdoppelst), h (halbierst);
         o2 + (addierst B), - (subtrahierst B), v (das Ergebnis verdoppelst), / (durch B dividierst). */
      var o1 = n[0], o2 = n[2], R = n[4]; A = n[1]; B = n[3];
      if ("-vh".indexOf(o1) < 0 || "+-v/".indexOf(o2) < 0 || typeof R !== "number") return null;
      if ((o1 === "-" && !(A > 0)) || ((o2 === "+" || o2 === "-" || o2 === "/") && !(B > 0))) return null;
      var y = o2 === "+" ? R - B : o2 === "-" ? R + B : o2 === "v" ? R / 2 : R * B;
      if (!ok(y)) return null;
      L = o1 === "-" ? y + A : o1 === "v" ? y / 2 : y * 2;
      if (!ok(L) || L === 0) return null;
      var t1 = o1 === "-" ? (o2 === "/" ? "Wenn du von meiner Zahl, die du nicht kennst, " + A + " subtrahierst" : "Wenn du von meiner Zahl " + A + " subtrahierst")
        : o1 === "v" ? "Wenn du meine Zahl verdoppelst" : "Wenn du meine Zahl halbierst";
      var t2 = o2 === "+" ? "dann " + B + " addierst" : o2 === "-" ? "dann " + B + " subtrahierst" : o2 === "v" ? "dann das Ergebnis verdoppelst" : "dann durch " + B + " dividierst";
      x.text = t1 + " und " + t2 + ", erhältst du " + R + ".";
      x.rueck = true; x.r = R;
      // Rückwärts: erster Schritt ist die Umkehr von o2, zweiter die Umkehr von o1.
      var inv2 = o2 === "+" ? ["-", B] : o2 === "-" ? ["+", B] : o2 === "v" ? ["/", 2] : ["*", B];
      var inv1 = o1 === "-" ? ["+", A] : o1 === "v" ? ["/", 2] : ["*", 2];
      w1 = y; s1 = R + " " + zeichen(inv2[0]) + " " + inv2[1]; s2op = inv1[0]; s2b = inv1[1];
      // Vorwärts gerechnet (Pauls Fehler in Nr. 7): die Schritte des Textes auf R angewandt.
      var f1 = o1 === "-" ? R - A : o1 === "v" ? R * 2 : R / 2;
      var f2 = o2 === "+" ? f1 + B : o2 === "-" ? f1 - B : o2 === "v" ? f1 * 2 : f1 / B;
      x.vorwaerts = ok(f2) && f2 !== L ? f2 : null;
    } else if (sc === "du") {
      var d1 = n[0], d2 = n[2]; A = n[1]; B = n[3];
      if ((d1 !== "h" && d1 !== "v") || (d2 !== "+" && d2 !== "-") || (d1 === "h" && A % 2)) return null;
      w1 = d1 === "h" ? A / 2 : 2 * A; L = d2 === "+" ? w1 + B : w1 - B; if (L <= 0) return null;
      x.text = "Du erhältst meine Zahl, wenn du die Zahl " + A + " " + (d1 === "h" ? "halbierst" : "verdoppelst") + " und dann " + B + " " + (d2 === "+" ? "addierst" : "subtrahierst") + ".";
      x.satz = "Die Zahl heißt"; s1 = A + (d1 === "h" ? " : 2" : " · 2"); s2op = d2; s2b = B;
      // Pauls Fehler (16.09.2026): 480 : 2 = 240, dann + 30 statt − 30 – er hat „rückwärts“ gerechnet.
      x.umgekehrt = d2 === "+" ? w1 - B : w1 + B; x.umWort = d2 === "+" ? "addierst" : "subtrahierst"; x.umB = B;
    } else if (sc === "dz") {
      var fz = n[0], zop = n[2]; A = n[1]; B = n[3];
      if ((fz !== "d" && fz !== "h") || (zop !== "+" && zop !== "-") || (fz === "h" && A % 2)) return null;
      w1 = fz === "d" ? 2 * A : A / 2; L = zop === "+" ? B + w1 : B - w1; if (L <= 0) return null;
      var tf = fz === "d" ? "das Doppelte von " + A : "die Hälfte von " + A;
      x.text = zop === "+" ? "Addiere " + tf + " zu der Zahl " + B + "." : "Subtrahiere von der Zahl " + B + " " + tf + ".";
      s1 = A + (fz === "d" ? " · 2" : " : 2"); x.zweiter2 = B + " " + zeichen(zop) + " " + w1;
      x.ohneF = zop === "+" ? B + A : B - A; x.fWort = fz === "d" ? "das Doppelte" : "die Hälfte"; x.fA = A;
    } else if (sc === "dif") {
      A = n[0]; B = n[1]; C = n[2]; w1 = A - B; L = w1 - C; if (!(w1 > 0) || !(L > 0)) return null;
      x.text = "Subtrahiere von " + A + " die Zahl " + B + ". Von der Differenz subtrahiere dann die Zahl " + C + ".";
      s1 = A + " − " + B; s2op = "-"; s2b = C;
    } else if (sc === "sum") {
      A = n[0]; B = n[1]; C = n[2]; w1 = B + C; L = A - w1; if (!(L > 0)) return null;
      x.text = "Subtrahiere von der Zahl " + A + " die Summe von " + B + " und " + C + ".";
      s1 = B + " + " + C; x.zweiter2 = A + " − " + w1; x.ohneSumme = A - B;
    } else return null;
    if (!ok(w1) || !ok(L)) return null;
    x.loesung = L; x.zwischen = { text: s1, wert: w1 };
    x.zweiter = x.zweiter2 || (w1 + " " + zeichen(s2op) + " " + s2b);
    return x;
  }

  function aufgabe(k) {
    var m, x = null;
    if ((m = /^mal:(\d+)x(\d+)$/.exec(k))) {
      var a = +m[1], b = +m[2];
      x = { art: "mal", typ: "zahl", frage: a + " · " + b + " = ?", loesung: a * b, a: a, b: b,
        sa: ohneNullen(a), sb: ohneNullen(b), z: nullen(a) + nullen(b) };
    } else if ((m = /^malp:(\d+)=(\?|\d+)x(\?|\d+)$/.exec(k))) {
      var p = +m[1], links = m[2] === "?", bek = links ? +m[3] : +m[2];
      if (p % bek) return null;
      x = { art: "mal", typ: "zahl", platz: 1, frage: p + " = " + (links ? "? · " + bek : bek + " · ?"),
        loesung: p / bek, p: p, bek: bek };
    } else if ((m = /^teil:(\d+):(\d+)$/.exec(k))) {
      var n = +m[1], d = +m[2];
      if (!d || n % d) return null;
      x = { art: "teil", typ: "zahl", frage: n + " : " + d + " = ?", loesung: n / d, n: n, d: d };
    } else if ((m = /^teilp:\?:(\d+)=(\d+)$/.exec(k))) {
      x = { art: "teil", typ: "zahl", platz: 1, frage: "? : " + m[1] + " = " + m[2], loesung: +m[1] * +m[2], d: +m[1], q: +m[2] };
    } else if ((m = /^rest:(\d+):(\d+)$/.exec(k))) {
      var rn = +m[1], rd = +m[2];
      if (!rd) return null;
      x = { art: "rest", typ: "rest", frage: rn + " : " + rd + " = ? R ?", loesung: { q: Math.floor(rn / rd), r: rn % rd },
        n: rn, d: rd, labelA: "Ergebnis", labelB: "Rest" };
    } else if ((m = /^pkt:(\d+)([-+*\/])(\d+)([-+*\/])(\d+)$/.exec(k))) {
      var A = +m[1], o1 = m[2], B = +m[3], o2 = m[4], C = +m[5], punktVorn = o1 === "*" || o1 === "/";
      if (punktVorn === (o2 === "*" || o2 === "/")) return null;
      var pv = punktVorn ? rechne(A, o1, B) : rechne(B, o2, C);
      if (pv !== Math.floor(pv)) return null;
      var erg = punktVorn ? rechne(pv, o2, C) : rechne(A, o1, pv);
      var lr = rechne(rechne(A, o1, B), o2, C);
      x = { art: "punkt", typ: "zahl", frage: A + " " + zeichen(o1) + " " + B + " " + zeichen(o2) + " " + C + " = ?", loesung: erg,
        punktTeil: punktVorn ? A + " " + zeichen(o1) + " " + B : B + " " + zeichen(o2) + " " + C, pv: pv,
        rest: punktVorn ? function (v) { return v + " " + zeichen(o2) + " " + C; } : function (v) { return A + " " + zeichen(o1) + " " + v; },
        punktZeichen: zeichen(punktVorn ? o1 : o2), links: lr === Math.floor(lr) ? lr : null };
    } else if ((m = /^tl:(\d+)$/.exec(k))) {
      var tn = +m[1], tl = teilerVon(tn), nicht = [];
      for (var i = 2; i < tn; i++) if (tn % i) nicht.push(i);
      var rr = zufall("ps-tl|" + tn), wie = Math.max(4, Math.min(nicht.length, 14 - tl.length));
      var chips = tl.concat(mischen(nicht, rr).slice(0, wie)).sort(function (u, v) { return u - v; });
      x = { art: "teiler", typ: "tippen", frage: "Tippe alle Teiler von " + tn + " an.", loesung: tl, chips: chips, n: tn, wovon: "teiler" };
    } else if ((m = /^vf:(\d+)(?::(\d+))?$/.exec(k))) {
      var vd = +m[1], ja = [], nein = [];
      for (var j = vd; j <= 10 * vd; j++) (j % vd ? nein : ja).push(j);
      var rv = zufall("ps-vf|" + vd + (m[2] ? "|" + m[2] : ""));
      var vja = mischen(ja, rv).slice(0, 6), vnein = mischen(nein, rv).slice(0, 6);
      var vchips = vja.concat(vnein).sort(function (u, v) { return u - v; });
      x = { art: "teiler", typ: "tippen", frage: "Tippe alle Vielfachen von " + vd + " an, die hier stehen.",
        loesung: vja.slice().sort(function (u, v) { return u - v; }), chips: vchips, d: vd, wovon: "vielfache" };
    } else if ((m = /^rech:(\d{1,4}(?:[-+*\/]\d{1,4}){1,3})$/.exec(k))) {
      /* Rechnen mit 2 bis 4 Zahlen (vom Blatt: „801 − 563 + 347“, „7 · 8“). Punkt vor Strich, nur ganze Zahlen. */
      var tz = m[1].split(/[-+*\/]/).map(Number), to = m[1].match(/[-+*\/]/g);
      var rv = rechneKette(tz, to);
      if (rv == null || rv < 0 || rv > 10000) return null;
      var txt = tz.map(function (z, i) { return (i ? zeichen(to[i - 1]) + " " : "") + z; }).join(" ");
      var gemischt = to.some(punktOp) && !to.every(punktOp);
      var lk = linksRechnen(tz, to);
      x = { art: "rech", typ: "zahl", frage: txt + " = ?", loesung: rv, tz: tz, to: to, gemischt: gemischt,
        links: gemischt && lk != null && lk !== rv ? lk : null, zwischen: tz.length > 2 ? ersterSchritt(tz, to) : null };
    } else if ((m = /^raet:([mpw]):(\d{1,4}):(\d{1,4})(?::([2-5]))?$/.exec(k))) {
      /* Zahlenrätsel im Wortlaut der Lehrerin (Blatt „Zahlenrätsel: Wie heißt die Zahl?“, 16.10.2026):
         „Ich denke mir eine Zahl. Wenn ich sie um 18 verkleinere, erhalte ich 50. Wie heißt meine Zahl?“
         Mit Faktor: „… erhalte ich das Vierfache von 80.“ (raet:m:27:80:4). w = nach demselben Muster. */
      var ra = +m[2], rb = +m[3], rf = m[4] ? +m[4] : 0, rc = rf ? rf * rb : rb, rw = m[1];
      var rl = rw === "m" ? rc + ra : rw === "p" ? rc - ra : ra - rc;
      if (rl < 0 || rl > 1000 || rc > 1000) return null;
      var ct = rf ? "das " + FACHE[rf] + " von " + rb : String(rc);
      x = { art: "raet", typ: "zahl", wie: rw, a: ra, c: rc, b: rb, f: rf, frage: "?", loesung: rl, satz: "Meine Zahl ist",
        text: "Ich denke mir eine Zahl. Wenn ich sie " + (rw === "m" ? "um " + ra + " verkleinere" : rw === "p" ? "um " + ra + " vergrößere" : "von " + ra + " abziehe") +
          ", erhalte ich " + ct + ". Wie heißt meine Zahl?" };
    } else if ((m = /^lt:(\w+):([\w:+\/-]+)$/.exec(k))) {
      x = ltAufgabe(m[1], m[2].split(":"));
      if (!x) return null;
    } else if (/^fw:/.test(k)) {
      x = fwAufgabe(k);   // Teil 3 Fachwörter (18.10.2026)
      if (!x) return null;
    } else if ((m = /^sach:(\w+):([\d:]+)$/.exec(k))) {
      var f = SACH[m[1]]; if (!f) return null;
      var s = f.apply(null, m[2].split(":").map(Number));
      x = { art: "sach", vorlage: m[1], typ: s.q != null ? "rest" : "zahl", text: s.text, frage: s.q != null ? "? R ?" : "?",
        loesung: s.q != null ? { q: s.q, r: s.r } : s.loesung, einheit: s.einheit || "", labelA: s.labelA, labelB: s.labelB,
        rechnung: s.rechnung, signal: s.signal, links: s.links, schritte: s.schritte || 1 };   // schritte: Rechenschritte (ab 2 „Mein Rechenweg“)
    }
    if (!x) return null;
    x.k = k;
    x.thema = NAME[x.art];
    x.merkmal = MERKMAL[x.art];
    x.punkt = "ps#" + k.slice(0, 60);
    return x;
  }

  /* ---------- Erzeugen je Thema und Stufe ---------- */
  var ERZEUGE = {
    mal: function (r, st) {
      var a = ganz(r, 2, 9), b = ganz(r, 2, 9);
      if (st === 0) return r() < .5 ? "mal:" + a + "x" + (b * 10) : "mal:" + (b * 10) + "x" + a;
      if (st === 1) {
        if (r() < .5) return "mal:" + a + "x" + (b * 100);
        return r() < .5 ? "malp:" + (a * b * 10) + "=" + (b * 10) + "x?" : "malp:" + (a * b * 10) + "=?x" + (b * 10);
      }
      var h = ganz(r, 6, 9), g = ganz(r, 6, 9), w = r();
      if (w < .35) return "malp:" + (h * g * 10) + "=" + h + "x?";
      if (w < .7) return "malp:" + (h * g * 10) + "=" + (g * 10) + "x?";
      return r() < .5 ? "mal:" + h + "x" + (g * 10) : "mal:" + h + "x" + (g * 100);
    },
    teil: function (r, st) {
      var a = ganz(r, 2, 9), q = ganz(r, 2, 9);
      if (st === 0) return r() < .5 ? "teil:" + (ganz(r, 11, 99) * 10) + ":10" : "teil:" + (a * q * 10) + ":" + a;
      if (st === 1) return r() < .6 ? "teil:" + (a * q * 10) + ":" + (a * 10) : "teil:" + (a * q * 10) + ":" + a;
      var h = ganz(r, 6, 9), w = r();
      if (w < .35) return "teilp:?:10=" + ganz(r, 21, 99);
      if (w < .7) return "teil:" + (h * q * 10) + ":" + (h * 10);
      return "teil:" + (h * ganz(r, 6, 9) * 10) + ":" + h;
    },
    rest: function (r, st) {
      var d, q, rr;
      if (st === 0) { d = ganz(r, 3, 5); q = ganz(r, 2, 9); rr = ganz(r, 1, d - 1); return "rest:" + (q * d + rr) + ":" + d; }
      if (st === 1) { d = ganz(r, 6, 9); q = ganz(r, 2, 9); rr = r() < .15 ? 0 : ganz(r, 1, d - 1); return "rest:" + (q * d + rr) + ":" + d; }
      if (r() < .5) {   // 830 : 90 = 9 R 20
        var dz = ganz(r, 3, 9); q = ganz(r, 2, 9); rr = ganz(r, 1, dz - 1);
        var n = q * dz * 10 + rr * 10;
        return "rest:" + n + ":" + (dz * 10);
      }
      // 230 : 7 = 32 R 6 (Zehnerzahl durch Einer, zweistelliges Ergebnis)
      d = ganz(r, 3, 9);
      var lo = Math.ceil((11 * d + 1) / 10), hi = Math.floor(Math.min(990, 49 * d) / 10), nn;
      for (var t = 0; t < 20; t++) { nn = ganz(r, lo, hi) * 10; if (nn % d) break; }
      return "rest:" + nn + ":" + d;
    },
    punkt: function (r, st) {
      var a = ganz(r, 2, 9), b = ganz(r, 2, 9), w = r();
      if (st === 0) {   // 50 − 3 · 9 · 20 − 8 : 2 · 6 · 4 + 13
        if (w < .45) return "pkt:" + (10 * Math.ceil((a * b + 1) / 10) + 10 * ganz(r, 0, 3)) + "-" + a + "*" + b;
        if (w < .75) return "pkt:" + (10 * ganz(r, 2, 9)) + "-" + (a * b) + "/" + b;
        return "pkt:" + a + "*" + b + "+" + ganz(r, 3, 40);
      }
      if (st === 1) {   // 4 · 40 + 15 · 100 − 180 : 6 · 6 · 70 − 38
        if (w < .4) return "pkt:" + a + "*" + (b * 10) + "+" + ganz(r, 5, 99);
        if (w < .7) return "pkt:" + (10 * a + 10 * ganz(r, 1, 9)) + "-" + (a * b * 10) + "/" + b;
        return "pkt:" + a + "*" + (b * 10) + "-" + ganz(r, 5, Math.min(99, a * b * 10 - 1));
      }
      // Stufe 2: 8 · 90 − 38 · 70 · 8 − 279 · 9 · 70 + 359 · 900 − 7 · 80
      var g = ganz(r, 4, 9), h = ganz(r, 4, 9), pr = g * h * 10;
      if (w < .4) return "pkt:" + (r() < .5 ? g + "*" + (h * 10) : (h * 10) + "*" + g) + "-" + ganz(r, 21, pr - 10);
      if (w < .7 && pr < 980) return "pkt:" + g + "*" + (h * 10) + "+" + ganz(r, 11, 1000 - pr);
      var c = Math.min(1000, 100 * Math.ceil((pr + 1) / 100) + 100 * ganz(r, 0, 2));
      return "pkt:" + c + "-" + g + "*" + (h * 10);
    },
    teiler: function (r, st) {
      var L = [[6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 25, 27, 28],
               [24, 26, 30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 48, 50],
               [52, 54, 56, 60, 63, 64, 66, 70, 72, 75, 80, 81, 84, 88, 90, 96, 98, 100]];
      var V = [[2, 3, 4, 5, 6], [6, 7, 8, 9], [6, 7, 8, 9, 12]];
      return r() < .65 ? "tl:" + eins(r, L[st]) : "vf:" + eins(r, V[st]) + ":" + ganz(r, 1, 4);
    }
  };
  /* Punkt vor Strich: keine Aufgabe, deren Ergebnis schon als Zahl dasteht (30 − 24 : 4 = 24). */
  var punktRoh = ERZEUGE.punkt;
  ERZEUGE.punkt = function (r, st) {
    var k;
    for (var i = 0; i < 30; i++) {
      k = punktRoh(r, st);
      var x = aufgabe(k), zahlen = k.slice(4).split(/[-+*\/]/).map(Number);
      if (x && x.loesung >= 0 && zahlen.indexOf(x.loesung) < 0) return k;
    }
    return k;
  };
  var SACH_ERZ = {
    stunde: function (r) { return "sach:stunde:" + (10 * ganz(r, 6, 99)); },
    gruppen: function (r) { var d = ganz(r, 3, 8), q = ganz(r, 3, 9); return "sach:gruppen:" + (q * d + ganz(r, 1, d - 1)) + ":" + d; },
    kisten: function (r) { return "sach:kisten:" + (10 * ganz(r, 2, 9)) + ":" + ganz(r, 3, 9); },
    verteilen: function (r) { var d = ganz(r, 3, 9); return "sach:verteilen:" + (d * 10 * ganz(r, 2, 9)) + ":" + d; },
    einkauf: function (r) { var a = ganz(r, 2, 6), b = ganz(r, 3, 9), c = 10 * Math.ceil((a * b + 1) / 10) + 10 * ganz(r, 0, 3); return "sach:einkauf:" + c + ":" + a + ":" + b; }
  };
  var SACH_ARTEN = Object.keys(SACH_ERZ);

  /* Eine Aufgabe ziehen, die es in den letzten Tagen nicht gab und die nicht schon heute dran ist. */
  function frischZiehen(art, st, r, belegt, benutzt, sach) {
    var k = null;
    for (var v = 0; v < 40; v++) {
      k = sach ? SACH_ERZ[art](r) : ERZEUGE[art](r, st);
      var x = aufgabe(k);
      if (!x) continue;
      if (x.typ === "zahl" && (x.loesung < 0 || x.loesung > 10000 || x.loesung !== Math.floor(x.loesung))) continue;
      if (!belegt[k] && benutzt.indexOf(k) < 0) break;
    }
    belegt[k] = 1;
    return k;
  }


  /* ---------- Geschwister: dieselbe Aufgabenform mit neuen Zahlen (16.10.2026) ----------
   * Für die Wiederholung in derselben Runde, für die Kiste an den folgenden Tagen und für
   * Aufgaben „wie auf dem Blatt“. Gleiche Form heißt: gleiche Rechenzeichen, gleiche Stellenzahl,
   * gleich viele Nullen, gleicher Platz der Lücke. n = 1, 2, 3 … gibt verschiedene Geschwister. */
  function wieZahl(z, r) {   // gleiche Stellenzahl und gleich viele Nullen am Ende
    var nz = nullen(z), kern = ohneNullen(z), st = String(kern).length, lo = Math.pow(10, st - 1), hi = Math.pow(10, st) - 1, k;
    if (st === 1) lo = 2;
    for (var t = 0; t < 30; t++) { k = ganz(r, lo, hi); if (k % 10 && k !== kern) break; }
    return k * Math.pow(10, nz);
  }
  /* Textaufgaben: dasselbe Schema, neue Zahlen. Die Rätsel rückwärts bauen: erst die gesuchte Zahl, dann R. */
  function ltGeschwister(sc, p, r) {
    var n = p.map(function (z) { return /^\d+$/.test(z) ? +z : z; }), A, B, C;
    if (sc === "unt") {
      A = wieZahl(n[0], r); B = wieZahl(n[1], r); if (B >= A) { var t = A; A = B; B = t; }
      if (A - B < 20) return null;
      C = n[2] === "/" ? n[3] : wieZahl(n[3], r);
      if (n[2] === "/" && (A - B) % C) B += (A - B) % C;   // geht glatt auf
      return "lt:unt:" + A + ":" + B + ":" + n[2] + ":" + C;
    }
    if (sc === "add" || sc === "addt") {
      C = n[2] <= 3 ? ganz(r, 2, 3) : ganz(r, 4, 9); A = wieZahl(n[0], r); B = wieZahl(n[1], r);
      B += (C - (A + B) % C) % C;
      return "lt:" + sc + ":" + A + ":" + B + ":" + C;
    }
    if (sc === "vd") return "lt:vd:" + wieZahl(n[0], r) + ":" + wieZahl(n[1], r);
    if (sc === "hb") { A = wieZahl(n[0], r); if (A % 2) A++; return "lt:hb:" + A + ":" + wieZahl(n[1], r); }
    if (sc === "du" || sc === "dz") { A = wieZahl(n[1], r); if ((n[0] === "h") && A % 2) A++; return "lt:" + sc + ":" + n[0] + ":" + A + ":" + n[2] + ":" + wieZahl(n[3], r); }
    if (sc === "dif" || sc === "sum") return "lt:" + sc + ":" + wieZahl(n[0], r) + ":" + wieZahl(n[1], r) + ":" + wieZahl(n[2], r);
    if (sc === "wenn") {
      var o1 = n[0], o2 = n[2], alt = aufgabe("lt:" + sc + ":" + p.join(":")); if (!alt) return null;
      var X = wieZahl(alt.loesung, r); A = o1 === "-" ? wieZahl(n[1], r) : 0; B = o2 === "v" ? 0 : o2 === "/" ? ganz(r, 2, 5) : wieZahl(n[3], r);
      if (o1 === "h" && X % 2) X++;
      var y = o1 === "-" ? X - A : o1 === "v" ? 2 * X : X / 2;
      if (o2 === "/" && y % B) { X += B - y % B; y = X - A; }
      var R = o2 === "+" ? y + B : o2 === "-" ? y - B : o2 === "v" ? 2 * y : y / B;
      if (!(y > 0) || !(R > 0) || R > 1000) return null;
      return "lt:wenn:" + o1 + ":" + A + ":" + o2 + ":" + B + ":" + R;
    }
    return null;
  }
  function geschwister(k, n) {
    if (/^fw:/.test(k)) return fwGeschwister(k, n);   // Fachwörter: dasselbe Wort, eine andere Frage
    var r = zufall("ps-g|" + k + "|" + (n || 1)), m, kand, t;
    for (t = 0; t < 60; t++) {
      kand = null;
      if ((m = /^mal:(\d+)x(\d+)$/.exec(k))) kand = "mal:" + wieZahl(+m[1], r) + "x" + wieZahl(+m[2], r);
      else if ((m = /^malp:(\d+)=(\?|\d+)x(\?|\d+)$/.exec(k))) {
        var links = m[2] === "?", bek = links ? +m[3] : +m[2], un = +m[1] / bek;
        var b2 = wieZahl(bek, r), u2 = wieZahl(un, r);
        kand = "malp:" + (b2 * u2) + "=" + (links ? "?x" + b2 : b2 + "x?");
      } else if ((m = /^teil:(\d+):(\d+)$/.exec(k))) {
        var d2 = wieZahl(+m[2], r), q2 = wieZahl(+m[1] / +m[2], r);
        kand = "teil:" + (d2 * q2) + ":" + d2;
      } else if ((m = /^teilp:\?:10=(\d+)$/.exec(k))) kand = "teilp:?:10=" + ganz(r, 21, 99);
      else if ((m = /^rest:(\d+):(\d+)$/.exec(k))) {
        var rn = +m[1], rd = +m[2], q0 = Math.floor(rn / rd), r0 = rn % rd, dd, qq, rr;
        if (rd >= 10 && rd % 10 === 0) { dd = 10 * ganz(r, 3, 9); qq = ganz(r, 2, 9); rr = r0 ? 10 * ganz(r, 1, dd / 10 - 1) : 0; }
        else { dd = ganz(r, 3, 9); qq = q0 >= 10 ? ganz(r, 11, Math.max(12, Math.min(40, q0 + 8))) : ganz(r, 2, 9); rr = r0 ? ganz(r, 1, dd - 1) : 0; }
        kand = "rest:" + (qq * dd + rr) + ":" + dd;
      } else if ((m = /^(pkt|rech):(.+)$/.exec(k))) {
        var zz = m[2].split(/[-+*\/]/).map(Number), oo = m[2].match(/[-+*\/]/g), neu = [];
        for (var i = 0; i < zz.length; i++) {
          // Hinter einem Geteilt-Zeichen: ein Teiler der neuen Zahl davor (sonst geht es nicht auf).
          if (i && oo[i - 1] === "/") { var tv = teilerVon(neu[i - 1]).filter(function (q) { return q > 1 && q < neu[i - 1] && String(q).length === String(zz[i]).length; }); neu.push(tv.length ? eins(r, tv) : zz[i]); }
          else neu.push(wieZahl(zz[i], r));
        }
        kand = m[1] + ":" + neu.map(function (z, j) { return (j ? oo[j - 1] : "") + z; }).join("");
        var xk = aufgabe(kand);
        if (xk && xk.typ === "zahl") {
          var zahlen = neu;
          var zw = ersterSchritt(neu, oo).wert;   // Zwischenergebnis = Ergebnis wäre verwirrend (70 − 70 : 2)
          if (zahlen.indexOf(xk.loesung) >= 0 || xk.loesung > 1000 || (neu.length > 2 && zw === xk.loesung)) kand = null;
        }
      } else if ((m = /^raet:([mpw]):(\d+):(\d+)(?::([2-5]))?$/.exec(k))) {
        var a2 = wieZahl(+m[2], r), c2 = wieZahl(+m[3], r);
        if (m[1] === "w" && c2 >= a2) c2 = Math.max(1, a2 - wieZahl(+m[3], r) % a2);
        kand = "raet:" + m[1] + ":" + a2 + ":" + c2 + (m[4] ? ":" + m[4] : "");
        var xr = aufgabe(kand); if (xr && (xr.loesung === xr.c || [xr.a, xr.b].indexOf(xr.loesung) >= 0)) kand = null;
      } else if ((m = /^lt:(\w+):(.+)$/.exec(k))) {
        kand = ltGeschwister(m[1], m[2].split(":"), r);
      } else if ((m = /^tl:(\d+)$/.exec(k))) {
        var tn = +m[1], band = tn <= 28 ? [12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28] : tn <= 50 ? [30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 48, 50] : [54, 56, 60, 63, 64, 66, 70, 72, 75, 80, 81, 84, 88, 90, 96];
        kand = "tl:" + eins(r, band);
      } else if ((m = /^vf:(\d+)(?::(\d+))?$/.exec(k))) kand = "vf:" + ganz(r, 3, 9) + ":" + ganz(r, 1, 4);
      else if ((m = /^sach:(\w+):/.exec(k)) && SACH_ERZ[m[1]]) kand = SACH_ERZ[m[1]](r);
      else return k;
      if (kand && kand !== k) {
        var xa = aufgabe(kand);
        if (xa && (xa.typ !== "zahl" || (xa.loesung >= 0 && xa.loesung <= 10000 && xa.loesung === Math.floor(xa.loesung)))) return kand;
      }
    }
    return k;
  }
  /* Gleiche Form? (für Messung und Prüfskript) */
  function form(k) {
    var x = aufgabe(k); if (!x) return "";
    if (x.art === "fw") return "fw:" + x.begriff;
    if (x.art === "rech" || x.art === "punkt") {
      var b = k.slice(k.indexOf(":") + 1);
      return x.art + ":" + b.replace(/\d+/g, function (z) { return "s" + String(ohneNullen(+z)).length + "n" + nullen(+z); });
    }
    if (x.art === "raet") return "raet:" + x.wie + (x.f ? "f" : "");
    if (x.art === "lt") return "lt:" + x.schema + (x.schema === "unt" ? x.op : x.schema === "wenn" ? k.split(":")[2] + k.split(":")[4] : x.schema === "du" || x.schema === "dz" ? k.split(":")[2] + k.split(":")[4] : "");
    if (x.art === "rest") return "rest:" + (x.d % 10 === 0 ? "z" : "e");
    if (x.art === "sach") return "sach:" + x.vorlage;
    if (x.art === "mal") return (x.platz ? "malp:" + (k.indexOf("=?") > 0 ? "l" : "r") : "mal") + ":" + nullen(x.platz ? x.bek : x.a) + nullen(x.platz ? 0 : x.b);
    if (x.art === "teil") return (x.platz ? "teilp" : "teil:" + nullen(x.d));
    return x.art + ":" + x.wovon;
  }

  /* ---------- Stoff von Pauls Blättern (16.10.2026) ----------
   * Kommt von GET /api/probenstoff (functions/api/_probenstoff.js): stellen = Pauls belegte Fehler
   * (rot verbessert oder doppelt gelesen), quellen = Aufgaben vom Blatt, neueste zuerst. Jeder Schlüssel
   * wird hier noch einmal geprüft. Ist der Server nicht erreichbar, gilt BLATT_STAND (Stand 16.10.2026, 18:45 Uhr).
   * Stellen, die eine Saat-Variante schon abdeckt, fallen weg (sonst zweimal in der Kiste). */
  var BLATT_STAND = {
    stellen: [{ k: "lt:unt:801:563:+:347", blatt: "he331mspzq" }, { k: "tl:21", blatt: "oewbd88522" }, { k: "teil:440:10", blatt: "y3hm4vzkrj" },
      { k: "teil:320:40", blatt: "y3hm4vzkrj" }, { k: "teil:240:40", blatt: "y3hm4vzkrj" }, { k: "teil:280:70", blatt: "y3hm4vzkrj" },
      { k: "teil:420:70", blatt: "y3hm4vzkrj" }, { k: "teil:360:60", blatt: "y3hm4vzkrj" }, { k: "teil:240:80", blatt: "y3hm4vzkrj" },
      { k: "teil:400:80", blatt: "y3hm4vzkrj" }],
    quellen: [{ k: "raet:m:18:50", blatt: "he331mspzq" }, { k: "raet:p:56:100", blatt: "he331mspzq" }, { k: "raet:m:27:320", blatt: "he331mspzq" },
      { k: "lt:unt:801:563:+:347", blatt: "he331mspzq" }, { k: "tl:12", blatt: "r7ung8g7u6" }, { k: "tl:56", blatt: "r7ung8g7u6" }, { k: "tl:24", blatt: "r7ung8g7u6" },
      { k: "rest:52:5", blatt: "5tkzva9rss" }, { k: "rest:86:5", blatt: "5tkzva9rss" }, { k: "rest:103:5", blatt: "5tkzva9rss" },
      { k: "tl:21", blatt: "oewbd88522" }, { k: "tl:28", blatt: "oewbd88522" }, { k: "tl:32", blatt: "oewbd88522" },
      { k: "malp:240=60x?", blatt: "8o6ufnxur4" }, { k: "rest:830:90", blatt: "8o6ufnxur4" }, { k: "pkt:80*7-348", blatt: "8o6ufnxur4" }],
    texte: [{ k: "raet:m:18:50", blatt: "he331mspzq" }, { k: "raet:p:56:50:2", blatt: "he331mspzq" }, { k: "raet:m:27:80:4", blatt: "he331mspzq" },
      { k: "lt:unt:801:563:+:347", blatt: "he331mspzq" }, { k: "lt:unt:919:755:/:2", blatt: "he331mspzq" },
      { k: "lt:vd:111:333", blatt: "yd2enafh4h" }, { k: "lt:hb:100:20", blatt: "yd2enafh4h" }, { k: "lt:addt:25:3:7", blatt: "yd2enafh4h" },
      { k: "lt:wenn:-:300:+:60:200", blatt: "yd2enafh4h" }, { k: "lt:wenn:-:70:v:0:440", blatt: "yd2enafh4h" }, { k: "lt:wenn:h:0:-:170:180", blatt: "yd2enafh4h" },
      { k: "lt:wenn:v:0:+:280:1000", blatt: "yd2enafh4h" }, { k: "lt:add:25:75:2", blatt: "ntaaffc81s" }, { k: "lt:wenn:-:35:/:3:30", blatt: "ntaaffc81s" }],
    stand: "2026-10-16"
  };
  /* Von Hand am Foto gelesen (16.10.2026), weil die Abschrift den Wortlaut nicht hergibt. Gilt immer, auch mit Server.
   * stellen: 16.09.2026 „Das kann ich noch aus Klasse 3!“ (nrjtwbfa45), Zahlenrätsel 1 und 2 von der Lehrerin rot
   *   durchgestrichen (Paul: 270 statt 210, 60 statt 70), darunter „Das könntest du noch üben: … Sachaufgaben“.
   * texte: Schulbuch S. 10 und 11 (di9sd8l5es, 4df7oalf79, m7ogskl5u2, 28.09.2026), Aufgaben 4, 5 und 6. */
  var HEFT_GELESEN = {
    stellen: [{ k: "lt:du:h:480:-:30", blatt: "nrjtwbfa45" }, { k: "lt:wenn:v:0:+:15:155", blatt: "nrjtwbfa45" }],
    texte: [{ k: "lt:du:h:480:-:30", blatt: "nrjtwbfa45" }, { k: "lt:wenn:v:0:+:15:155", blatt: "nrjtwbfa45" },
      { k: "lt:dz:d:204:+:369", blatt: "m7ogskl5u2" }, { k: "lt:dz:d:151:-:746", blatt: "m7ogskl5u2" },
      { k: "lt:dz:d:243:+:513", blatt: "di9sd8l5es" }, { k: "lt:dz:h:260:+:536", blatt: "di9sd8l5es" },
      { k: "lt:dif:508:264:156", blatt: "4df7oalf79" }, { k: "lt:sum:718:287:365", blatt: "4df7oalf79" }, { k: "lt:dz:d:151:-:335", blatt: "4df7oalf79" }]
  };
  function istText(x) { return !!x && (x.art === "sach" || x.art === "raet" || x.art === "lt"); }
  function inSaat(k) { for (var i = 0; i < SAAT.length; i++) if (SAAT[i].v.indexOf(k) >= 0) return true; return false; }
  function blattPruefen(d) {
    var aus = { stellen: [], quellen: [], texte: [] }, schon = {};
    if (!d || typeof d !== "object") d = {};
    (Array.isArray(d.stellen) ? d.stellen : []).concat(HEFT_GELESEN.stellen).forEach(function (e) {
      var k = e && String(e.k || "");
      if (!k || schon[k] || !aufgabe(k) || inSaat(k) || aus.stellen.length >= 12) return;
      var fo = form(k); schon[fo] = (schon[fo] || 0) + 1; if (schon[fo] > 2) return;   // höchstens 2 je Form
      schon[k] = 1; aus.stellen.push({ k: k, blatt: String(e.blatt || "").slice(0, 20) });
    });
    var q = {};
    (Array.isArray(d.quellen) ? d.quellen : []).forEach(function (e) {
      var k = e && String(e.k || "");
      if (!k || q[k] || !aufgabe(k) || istText(aufgabe(k)) || aus.quellen.length >= 40) return;
      q[k] = 1; aus.quellen.push({ k: k, blatt: String(e.blatt || "").slice(0, 20) });
    });
    var tq = {};
    (Array.isArray(d.texte) ? d.texte : []).concat(HEFT_GELESEN.texte).forEach(function (e) {
      var k = e && String(e.k || ""), x = k && aufgabe(k);
      if (!x || tq[k] || (x.art !== "raet" && x.art !== "lt") || aus.texte.length >= 30) return;
      tq[k] = 1; aus.texte.push({ k: k, blatt: String(e.blatt || "").slice(0, 20) });
    });
    return aus;
  }
  /* Aufgaben „wie auf dem Blatt“: je neuestem Blatt eine Vorlage (Tageszufall), höchstens blattMax. */
  function blattWahl(blatt, r) {
    var je = {}, reihe = [];
    (blatt && blatt.quellen || []).forEach(function (q) { if (!je[q.blatt]) { je[q.blatt] = []; reihe.push(q.blatt); } je[q.blatt].push(q.k); });
    var wahl = [];
    for (var i = 0; wahl.length < EIN.blattMax && i < reihe.length * 2; i++) {
      var l = je[reihe[i % reihe.length]]; if (!l.length) continue;
      wahl.push(l.splice(Math.floor(r() * l.length), 1)[0]);
    }
    return wahl;
  }


  /* ---------- Fachwörter (18.10.2026) ----------
   * Denny am Sonntag, 18.10.2026: Paul kennt die Bedeutung der Mathe-Fachwörter nicht (addieren, multiplizieren …)
   * und scheitert daran in Aufgaben. Gewählt: „Liste und Übung“ – die Lernliste paul/klasse4-mathe-fachwoerter.html
   * zum Lesen mit Papa und Teil 3 „Fachwörter“ hier im Probenstoff. Nur Paul (Probe am 19.10.2026).
   * Die 14 Wörter stehen so in Pauls Heft „Fachbegriffe zum Einmaleins“ (06.10.2026) und auf seinen Blättern:
   *   Heft 06.10.: Multiplikation (Ergebnis Produkt), dividieren (Ergebnis Quotient), Tauschaufgabe, Umkehraufgabe,
   *   Vielfache, Teiler, Primzahl („Primzahlen haben als Teiler nur 1 und sich selbst“), Punkt vor Strich.
   *   Klasse 3 und Blätter 28.–30.09.: addieren, subtrahieren (Zahlenrätsel „Addiere …“, „subtrahierst“),
   *   Summe und Differenz (Schulbuch S. 11: „die Summe von 287 und 365“, „Von der Differenz subtrahiere …“).
   * Nicht dabei: Faktor, Summand, Dividend, Divisor (kommen in Pauls Heft nicht vor, gezählt am 18.10.2026).
   * Eine Quelle für Liste und Übung: FACHWORT. Merksätze ohne Begründungssätze (Lehrerin), keine Frage nach dem Grund. */
  var FACHWORT = [
    { id: "addieren", gruppe: "Die vier Rechenarten", wort: "addieren", nomen: "die Addition", zeichen: "+", beispiel: "25 + 17 = 42",
      ergebnis: "Das Ergebnis heißt Summe.", merk: "Addieren heißt plus rechnen. Die Rechenart heißt Addition.", esel: "Es kommt etwas dazu. Es wird mehr." },
    { id: "subtrahieren", gruppe: "Die vier Rechenarten", wort: "subtrahieren", nomen: "die Subtraktion", zeichen: "−", beispiel: "42 − 17 = 25",
      ergebnis: "Das Ergebnis heißt Differenz.", merk: "Subtrahieren heißt minus rechnen. Die Rechenart heißt Subtraktion.", esel: "Es wird etwas weggenommen. Es wird weniger." },
    { id: "multiplizieren", gruppe: "Die vier Rechenarten", wort: "multiplizieren", nomen: "die Multiplikation", zeichen: "·", beispiel: "7 · 6 = 42",
      ergebnis: "Das Ergebnis heißt Produkt.", merk: "Multiplizieren heißt mal rechnen. Die Rechenart heißt Multiplikation.", esel: "7 · 6 heißt: siebenmal die 6." },
    { id: "dividieren", gruppe: "Die vier Rechenarten", wort: "dividieren", nomen: "die Division", zeichen: ":", beispiel: "42 : 6 = 7",
      ergebnis: "Das Ergebnis heißt Quotient.", merk: "Dividieren heißt geteilt rechnen. Die Rechenart heißt Division.", esel: "42 Murmeln werden gerecht an 6 Kinder verteilt." },
    { id: "summe", gruppe: "So heißt das Ergebnis", wort: "die Summe", zeichen: "+", beispiel: "25 + 17 = 42",
      ergebnis: "Die 42 ist die Summe.", merk: "Das Ergebnis beim Addieren (plus) heißt Summe.", esel: "Beim Plus-Rechnen zählst du alles zusammen. Das Wort fängt mit S an." },
    { id: "differenz", gruppe: "So heißt das Ergebnis", wort: "die Differenz", zeichen: "−", beispiel: "42 − 17 = 25",
      ergebnis: "Die 25 ist die Differenz.", merk: "Das Ergebnis beim Subtrahieren (minus) heißt Differenz.", esel: "Beim Minus-Rechnen bleibt der Unterschied übrig. Das Wort fängt mit D an." },
    { id: "produkt", gruppe: "So heißt das Ergebnis", wort: "das Produkt", zeichen: "·", beispiel: "7 · 6 = 42",
      ergebnis: "Die 42 ist das Produkt.", merk: "Das Ergebnis beim Multiplizieren (mal) heißt Produkt.", esel: "Mal ist eine Punktrechnung. Das Wort fängt mit P an wie Punkt." },
    { id: "quotient", gruppe: "So heißt das Ergebnis", wort: "der Quotient", zeichen: ":", beispiel: "42 : 6 = 7",
      ergebnis: "Die 7 ist der Quotient.", merk: "Das Ergebnis beim Dividieren (geteilt) heißt Quotient.", esel: "Beim Geteilt-Rechnen kommt etwas Kleines heraus. Das Wort fängt mit Q an." },
    { id: "tausch", gruppe: "Aufgaben, die zusammengehören", wort: "die Tauschaufgabe", zeichen: "·", beispiel: "7 · 6 = 42 und 6 · 7 = 42",
      ergebnis: "Das Ergebnis bleibt gleich.", merk: "Bei der Tauschaufgabe tauschen die zwei Zahlen den Platz. Das Ergebnis bleibt gleich.", esel: "Die Zahlen wechseln den Platz wie zwei Kinder auf einer Bank." },
    { id: "umkehr", gruppe: "Aufgaben, die zusammengehören", wort: "die Umkehraufgabe", zeichen: "· und :", beispiel: "7 · 6 = 42 und 42 : 6 = 7",
      ergebnis: "Du kommst zurück zur Zahl vom Anfang.", merk: "Die Umkehraufgabe rechnet rückwärts: Aus mal wird geteilt, aus geteilt wird mal.", esel: "Du gehst den Weg zurück und landest wieder am Anfang." },
    { id: "vielfache", gruppe: "Teiler und Vielfache", wort: "die Vielfachen", zeichen: "·", beispiel: "Vielfache von 7: 7, 14, 21, 28, …",
      ergebnis: "Sie stehen in der 7er-Reihe.", merk: "Die Vielfachen einer Zahl stehen in ihrer Einmaleinsreihe.", esel: "Du zählst immer dieselbe Zahl dazu: 7, 14, 21 …" },
    { id: "teiler", gruppe: "Teiler und Vielfache", wort: "der Teiler", zeichen: ":", beispiel: "Teiler von 20: 1, 2, 4, 5, 10, 20",
      ergebnis: "20 : 4 = 5 geht glatt auf.", merk: "Ein Teiler teilt eine Zahl glatt, ohne Rest.", esel: "Suche Malaufgaben mit dem Ergebnis: 1 · 20, 2 · 10, 4 · 5." },
    { id: "primzahl", gruppe: "Teiler und Vielfache", wort: "die Primzahl", zeichen: "", beispiel: "Teiler von 19: 1, 19",
      ergebnis: "19 ist eine Primzahl.", merk: "Primzahlen haben als Teiler nur 1 und sich selbst.", esel: "So eine Zahl ist ein Einzelgänger: Nur die 1 und sie selbst teilen sie." },
    { id: "punkt", gruppe: "Die Regel", wort: "Punkt vor Strich", zeichen: "· : vor + −", beispiel: "50 − 3 · 9 = 50 − 27 = 23",
      ergebnis: "Zuerst 3 · 9, dann minus.", merk: "Punktaufgaben (· und :) rechnest du vor Strichaufgaben (+ und −).", esel: "Erst die Punkte, dann die Striche." }
  ];
  var FW = {}; FACHWORT.forEach(function (c) { FW[c.id] = c; });
  /* Die vier Rechenarten: Zeichen, Fachwort, Rechenart, Ergebnis, Bedeutung. */
  var OPS = {
    a: { z: "+", verb: "addieren", nomen: "Addition", erg: "Summe", art: "die", bed: "plus rechnen", v: "addieren", e: "summe", r: function (x, y) { return x + y; } },
    s: { z: "−", verb: "subtrahieren", nomen: "Subtraktion", erg: "Differenz", art: "die", bed: "minus rechnen", v: "subtrahieren", e: "differenz", r: function (x, y) { return x - y; } },
    m: { z: "·", verb: "multiplizieren", nomen: "Multiplikation", erg: "Produkt", art: "das", bed: "mal rechnen", v: "multiplizieren", e: "produkt", r: function (x, y) { return x * y; } },
    d: { z: ":", verb: "dividieren", nomen: "Division", erg: "Quotient", art: "den", bed: "geteilt rechnen", v: "dividieren", e: "quotient", r: function (x, y) { return x / y; } }
  };
  var OPK = ["a", "s", "m", "d"];
  var PRIM = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  function istPrim(n) { if (n < 2) return false; for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
  /* Zwei Zahlen zu einer Rechenart, klein und ganz (Plus/Minus bis 100, Mal/Geteilt im Einmaleins). */
  function fwZahlen(o, r) {
    var a, b;
    if (o === "a") { a = ganz(r, 12, 59); b = ganz(r, 11, 39); }
    else if (o === "s") { a = ganz(r, 35, 99); b = ganz(r, 11, a - 12); if (2 * b === a) b++; }   // Ergebnis ≠ zweite Zahl (64 − 32)
    else if (o === "m") { a = ganz(r, 3, 9); b = ganz(r, 3, 9); if (a === b) b = a === 9 ? 8 : a + 1; }
    else { var q = ganz(r, 3, 9), dd = ganz(r, 3, 9); if (q === dd) dd = q === 9 ? 8 : q + 1; a = q * dd; b = dd; }
    return [a, b];
  }
  function fwAufg(o, a, b) { return a + " " + OPS[o].z + " " + b + " = " + OPS[o].r(a, b); }
  /* Ziehen je Fachwort: eine der Fragen dazu (r = Zufall). */
  var FW_ZIEH = {};
  OPK.forEach(function (o) {
    FW_ZIEH[OPS[o].v] = function (r) {
      var w = r(), z = fwZahlen(o, r);
      if (w < .25) return "fw:bed:" + o;
      if (w < .45) return "fw:zei:" + o;
      if (w < .65) return "fw:art:" + o + ":" + z[0] + ":" + z[1];
      if (w < .8) return "fw:nom:" + o;
      return "fw:tu:" + o + ":" + z[0] + ":" + z[1];
    };
    FW_ZIEH[OPS[o].e] = function (r) {
      var w = r(), z = fwZahlen(o, r);
      if (w < .4) return "fw:erg:" + o + ":" + z[0] + ":" + z[1];
      if (w < .65) return "fw:ena:" + o;
      return "fw:ber:" + o + ":" + z[0] + ":" + z[1];
    };
  });
  function malPaar(r) { var z = fwZahlen("m", r); return z[0] + ":" + z[1]; }
  FW_ZIEH.tausch = function (r) { var w = r(); return (w < .45 ? "fw:tau:" : w < .7 ? "fw:tna:" : "fw:tz:") + malPaar(r); };
  FW_ZIEH.umkehr = function (r) { var w = r(); return w < .3 ? "fw:umk:" + malPaar(r) : w < .55 ? "fw:umd:" + malPaar(r) : w < .75 ? "fw:una:" + malPaar(r) : "fw:uz:" + (r() < .5 ? "m" : "d") + ":" + malPaar(r); };
  FW_ZIEH.vielfache = function (r) {
    var d = ganz(r, 3, 9), w = r();
    if (w < .4) return "fw:vf:" + d + ":" + ganz(r, 1, 99);
    if (w < .7) return "fw:vfn:" + d + ":" + ganz(r, 3, 6);
    return "fw:vja:" + d + ":" + (r() < .5 ? d * ganz(r, 2, 10) : d * ganz(r, 2, 9) + ganz(r, 1, d - 1));
  };
  var TEILER_N = [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48];
  FW_ZIEH.teiler = function (r) {
    var n = eins(r, TEILER_N), w = r();
    if (w < .55) return "fw:tw:" + n + ":" + ganz(r, 1, 99);
    var tl = teilerVon(n).filter(function (t) { return t > 1 && t < n; }), nicht = [];
    for (var i = 2; i < n; i++) if (n % i) nicht.push(i);
    return "fw:tja:" + (r() < .5 ? eins(r, tl) : eins(r, nicht)) + ":" + n;
  };
  FW_ZIEH.primzahl = function (r) {
    var w = r();
    if (w < .45) return "fw:pr:" + ganz(r, 1, 99);
    if (w < .8) { var n = r() < .5 ? eins(r, PRIM.slice(2)) : ganz(r, 4, 50); return "fw:pja:" + n; }
    return "fw:pna";
  };
  var punktFwRoh = function (r) {
    var a = ganz(r, 2, 9), b = ganz(r, 2, 9), w = r(), e;
    var form = r();
    if (form < .4) e = (10 * Math.ceil((a * b + 1) / 10) + 10 * ganz(r, 0, 2)) + "-" + a + "*" + b;
    else if (form < .7) e = ganz(r, 3, 40) + "+" + (a * b) + "/" + b;
    else e = a + "*" + b + "+" + ganz(r, 3, 40);
    if (w < .45) return "fw:pz:" + e;
    if (w < .6) return "fw:pw";
    return "fw:pzz:" + e;
  };
  /* Punkt vor Strich: kein Ergebnis, das schon als Zahl oder Zwischenergebnis dasteht (60 − 5 · 6 = 30). */
  FW_ZIEH.punkt = function (r) {
    var k;
    for (var i = 0; i < 30; i++) {
      k = punktFwRoh(r); var x = fwAufgabe(k);
      if (!x || x.typ !== "zahl") return k;
      var zz = k.slice(7).split(/[-+*\/]/).map(Number);
      if (zz.indexOf(x.loesung) < 0 && x.loesung !== x.pw) return k;
    }
    return k;
  };
  var FW_IDS = FACHWORT.map(function (c) { return c.id; });

  /* Der Fachwort-Teil einer Aufgabe: Text, Antwort, Auswahl, Hilfe-Bausteine. */
  function fwMischen(k, liste) { return mischen(liste, zufall("fw-o|" + k)); }
  function fwAufgabe(k) {
    var p = k.split(":"), f = p[1], x = { art: "fw", typ: "wahl" }, o, a, b, c, n, d;
    if (f === "bed" || f === "zei" || f === "nom" || f === "ena") {
      o = p[2]; if (!OPS[o]) return null;
      x.begriff = f === "ena" ? OPS[o].e : OPS[o].v;
      if (f === "bed") { x.text = "Was heißt " + OPS[o].verb + "?"; x.loesung = OPS[o].bed; x.optionen = OPK.map(function (q) { return OPS[q].bed; }); }
      if (f === "zei") { x.text = "Welches Rechenzeichen gehört zu " + OPS[o].verb + "?"; x.loesung = OPS[o].z; x.optionen = OPK.map(function (q) { return OPS[q].z; }); x.zeichen = 1; }
      if (f === "nom") { x.text = "Wie heißt die Rechenart, bei der du " + OPS[o].bed.replace(" rechnen", "") + " rechnest?"; x.loesung = OPS[o].nomen; x.optionen = OPK.map(function (q) { return OPS[q].nomen; }); }
      if (f === "ena") { x.text = "Wie nennt man das Ergebnis der " + OPS[o].nomen + "?"; x.loesung = OPS[o].erg; x.optionen = OPK.map(function (q) { return OPS[q].erg; }); }
      x.schau = FW[x.begriff].beispiel + ". " + (f === "ena" ? FW[x.begriff].ergebnis : OPS[o].verb.charAt(0).toUpperCase() + OPS[o].verb.slice(1) + " heißt " + OPS[o].bed + ".");
      if (f === "bed") x.schau = FW[x.begriff].beispiel + ". Schau auf das Rechenzeichen " + OPS[o].z + ".";
      if (f === "ena") x.schau = "Bei " + FW[x.begriff].beispiel + " ist das Ergebnis " + FW[x.begriff].beispiel.split(" = ")[1] + ". " + FW[x.begriff].ergebnis.replace(/^Die \d+ ist /, "Diese Zahl ist ");
      x.bestaetigung = f === "ena" ? "Das Ergebnis der " + OPS[o].nomen + " heißt " + OPS[o].erg : f === "zei" ? OPS[o].verb + ": " + OPS[o].z : f === "nom" ? OPS[o].bed + " heißt " + OPS[o].nomen : OPS[o].verb + " heißt " + OPS[o].bed;
    } else if (f === "art" || f === "erg" || f === "tu" || f === "ber") {
      o = p[2]; a = +p[3]; b = +p[4]; if (!OPS[o] || !(a > 0) || !(b > 0)) return null;
      c = OPS[o].r(a, b); if (c !== Math.floor(c) || c <= 0) return null;
      var auf = fwAufg(o, a, b);
      x.aufg = auf; x.zahlen = [a, b, c];
      if (f === "art") {
        x.begriff = OPS[o].v; x.text = auf + ". Welches Fachwort passt zu dieser Aufgabe?"; x.loesung = OPS[o].verb; x.optionen = OPK.map(function (q) { return OPS[q].verb; });
        x.schau = "Bei " + auf + " steht das Zeichen " + OPS[o].z + ". " + OPS[o].z + " heißt " + OPS[o].bed + "."; x.bestaetigung = auf + ": " + OPS[o].verb;
      }
      if (f === "erg") {
        x.begriff = OPS[o].e; x.text = auf + ". Wie heißt die " + c + "?"; x.loesung = OPS[o].erg; x.optionen = OPK.map(function (q) { return OPS[q].erg; });
        x.schau = FW[x.begriff].beispiel + ". " + FW[x.begriff].ergebnis; x.bestaetigung = auf + ": Die " + c + " ist " + (OPS[o].art === "den" ? "der" : OPS[o].art) + " " + OPS[o].erg;
      }
      if (f === "tu" || f === "ber") {
        x.typ = "zahl"; x.frage = "?"; x.satz = "Das Ergebnis ist"; x.loesung = c; x.op = o; x.a = a; x.b = b;
        x.begriff = f === "tu" ? OPS[o].v : OPS[o].e;
        if (f === "tu") x.text = o === "a" ? "Addiere zu " + a + " die Zahl " + b + "." : o === "s" ? "Subtrahiere von " + a + " die Zahl " + b + "." : o === "m" ? "Multipliziere " + a + " mit " + b + "." : "Dividiere " + a + " durch " + b + ".";
        else x.text = "Berechne " + OPS[o].art + " " + (o === "d" ? "Quotienten" : OPS[o].erg) + " von " + a + " und " + b + ".";
        x.schau = (f === "tu" ? OPS[o].verb.charAt(0).toUpperCase() + OPS[o].verb.slice(1) + " heißt " + OPS[o].bed : OPS[o].erg + " heißt: " + OPS[o].bed) + ". Rechne " + a + " " + OPS[o].z + " " + b + " = ?";
        x.bestaetigung = a + " " + OPS[o].z + " " + b + " = " + c;
      }
    } else if (f === "tau" || f === "tna" || f === "tz" || f === "umk" || f === "umd" || f === "una") {
      a = +p[2]; b = +p[3]; if (!(a >= 2 && b >= 2 && a !== b && a <= 10 && b <= 10)) return null;
      c = a * b;
      var mal = a + " · " + b + " = " + c, tausch = b + " · " + a + " = " + c, umk = c + " : " + b + " = " + a, plus = a + " + " + b + " = " + (a + b);
      x.zahlen = [a, b, c];
      if (f === "tau") { x.begriff = "tausch"; x.text = "Welche Aufgabe ist die Tauschaufgabe zu " + mal + "?"; x.loesung = tausch; x.optionen = [tausch, umk, plus, a + " · " + a + " = " + (a * a)]; x.aufgaben = 1;
        x.schau = FW.tausch.beispiel + ". Die zwei Zahlen tauschen den Platz."; x.bestaetigung = "Tauschaufgabe zu " + mal + ": " + tausch; }
      if (f === "tna") { x.begriff = "tausch"; x.text = mal + " und " + tausch + ". Wie heißen solche Aufgaben?"; x.loesung = "Tauschaufgaben"; x.optionen = ["Tauschaufgaben", "Umkehraufgaben"];
        x.schau = "Die Zahlen " + a + " und " + b + " haben den Platz getauscht. Das Ergebnis bleibt " + c + "."; x.bestaetigung = mal + " und " + tausch + " sind Tauschaufgaben"; }
      if (f === "tz") { x.begriff = "tausch"; x.typ = "zahl"; x.text = mal + ". Rechne die Tauschaufgabe."; x.frage = b + " · " + a + " = ?"; x.loesung = c;
        var bei = c === 18 ? ["3 · 4", "4 · 3", 12] : ["2 · 9", "9 · 2", 18];
        x.schau = "Bei " + bei[0] + " und " + bei[1] + " kommt beide Male " + bei[2] + " heraus. Schau auf " + mal.replace(" = " + c, "") + "."; x.bestaetigung = tausch; }
      if (f === "umk") { x.begriff = "umkehr"; x.text = "Welche Aufgabe ist die Umkehraufgabe zu " + mal + "?"; x.loesung = umk; x.optionen = [umk, tausch, plus, c + " − " + b + " = " + (c - b)]; x.aufgaben = 1;
        x.schau = FW.umkehr.beispiel + ". Aus mal wird geteilt."; x.bestaetigung = "Umkehraufgabe zu " + mal + ": " + umk; }
      if (f === "umd") { x.begriff = "umkehr"; x.text = "Welche Aufgabe ist die Umkehraufgabe zu " + umk + "?"; x.loesung = a + " · " + b + " = " + c; x.optionen = [x.loesung, c + " − " + b + " = " + (c - b), c + " + " + b + " = " + (c + b), plus]; x.aufgaben = 1;
        x.schau = "42 : 6 = 7 und 7 · 6 = 42. Aus geteilt wird mal."; x.bestaetigung = "Umkehraufgabe zu " + umk + ": " + x.loesung; }
      if (f === "una") { x.begriff = "umkehr"; x.text = mal + " und " + umk + ". Wie heißen solche Aufgaben?"; x.loesung = "Umkehraufgaben"; x.optionen = ["Tauschaufgaben", "Umkehraufgaben"];
        x.schau = "Aus mal wird geteilt: Du rechnest rückwärts und landest wieder bei " + a + "."; x.bestaetigung = mal + " und " + umk + " sind Umkehraufgaben"; }
      if (f === "tz") x.optionen = null;
    } else if (f === "uz") {
      var art2 = p[2]; a = +p[3]; b = +p[4]; if ((art2 !== "m" && art2 !== "d") || !(a >= 2 && b >= 2 && a <= 10 && b <= 10)) return null;
      c = a * b; x.begriff = "umkehr"; x.typ = "zahl"; x.zahlen = [a, b, c];
      if (art2 === "m") { x.text = "Bilde die Umkehraufgabe zu " + a + " · " + b + " = " + c + "."; x.frage = c + " : " + b + " = ?"; x.loesung = a; x.bestaetigung = c + " : " + b + " = " + a; x.schau = "Aus mal wird geteilt. Du rechnest rückwärts und landest wieder bei der ersten Zahl."; }
      else { x.text = "Bilde die Umkehraufgabe zu " + c + " : " + b + " = " + a + "."; x.frage = a + " · " + b + " = ?"; x.loesung = c; x.bestaetigung = a + " · " + b + " = " + c; x.schau = "Aus geteilt wird mal. Du rechnest rückwärts und landest wieder bei der Zahl vom Anfang."; }
    } else if (f === "vf" || f === "tw" || f === "pr") {
      n = +p[2]; var rr = zufall("fw-z|" + k), ja, nein = [];
      if (f === "vf") {
        if (!(n >= 2 && n <= 10)) return null;
        x.begriff = "vielfache"; ja = n * ganz(rr, 2, 10);
        for (var i = n + 1; i < 10 * n; i++) if (i % n && Math.abs(i - ja) <= 3 * n) nein.push(i);
        x.text = "Welche Zahl ist ein Vielfaches von " + n + "?"; x.schau = "Die " + n + "er-Reihe: " + reihe(n, 5 * n) + " …"; x.bestaetigung = ja + " steht in der " + n + "er-Reihe";
        x.d = n;
      } else if (f === "tw") {
        if (TEILER_N.indexOf(n) < 0) return null;
        x.begriff = "teiler"; var tl = teilerVon(n).filter(function (t) { return t > 1 && t < n; }); ja = eins(rr, tl);
        for (var j = 2; j < n; j++) if (n % j) nein.push(j);
        x.text = "Welche Zahl ist ein Teiler von " + n + "?"; x.schau = "Suche Malaufgaben mit dem Ergebnis " + n + ": " + paare(n).join(", ") + "."; x.bestaetigung = n + " : " + ja + " = " + (n / ja) + ", das geht glatt auf";
        x.n = n;
      } else {
        x.begriff = "primzahl"; ja = eins(rr, PRIM.slice(1));
        for (var q = 4; q <= 50; q++) if (!istPrim(q)) nein.push(q);
        x.text = "Welche Zahl ist eine Primzahl?"; x.schau = FW.primzahl.beispiel + ". Die 19 hat nur zwei Teiler: die 1 und sich selbst."; x.bestaetigung = "Teiler von " + ja + ": 1, " + ja + ". " + ja + " ist eine Primzahl";
        if (ja === 19) x.schau = "Teiler von 13: 1, 13. Die 13 hat nur zwei Teiler: die 1 und sich selbst.";
      }
      x.loesung = String(ja);
      x.optionen = [String(ja)].concat(mischen(nein, rr).slice(0, 3).map(String));
      if (x.optionen.length < 4) return null;
    } else if (f === "vfn") {
      d = +p[2]; n = +p[3]; if (!(d >= 2 && d <= 10 && n >= 2 && n <= 9)) return null;
      var zz = []; for (var t = 1; t <= n; t++) zz.push(t * d);
      x.begriff = "vielfache"; x.typ = "zahl"; x.text = "Schreibe die Vielfachen von " + d + " weiter."; x.frage = zz.join(", ") + ", ?"; x.loesung = (n + 1) * d;
      x.schau = "Du zählst immer " + d + " dazu: " + (n * d) + " + " + d + " = ?"; x.bestaetigung = "Vielfache von " + d + ": " + zz.join(", ") + ", " + ((n + 1) * d);
    } else if (f === "vja" || f === "tja" || f === "pja") {
      x.optionen = ["Ja", "Nein"];
      if (f === "vja") { d = +p[2]; n = +p[3]; if (!(d >= 2 && n > d)) return null; x.begriff = "vielfache"; x.text = "Ist " + n + " ein Vielfaches von " + d + "?"; x.loesung = n % d ? "Nein" : "Ja";
        x.schau = "Die " + d + "er-Reihe: " + reihe(d, 10 * d) + "."; x.bestaetigung = n % d ? n + " steht nicht in der " + d + "er-Reihe" : n + " steht in der " + d + "er-Reihe"; }
      if (f === "tja") { d = +p[2]; n = +p[3]; if (!(d >= 2 && n > d)) return null; x.begriff = "teiler"; x.text = "Ist " + d + " ein Teiler von " + n + "?"; x.loesung = n % d ? "Nein" : "Ja";
        x.schau = "Rechne " + n + " : " + d + ". Geht es glatt auf, ohne Rest?"; x.bestaetigung = n % d ? n + " : " + d + " geht nicht glatt auf" : n + " : " + d + " = " + (n / d) + ", das geht glatt auf"; }
      if (f === "pja") { n = +p[2]; if (!(n >= 2 && n <= 50)) return null; x.begriff = "primzahl"; x.text = "Ist " + n + " eine Primzahl?"; x.loesung = istPrim(n) ? "Ja" : "Nein";
        var tn = teilerVon(n); x.schau = "Suche alle Teiler von " + n + ". Sind es nur die 1 und " + n + "?"; x.bestaetigung = "Teiler von " + n + ": " + tn.join(", ") + (istPrim(n) ? ". " + n + " ist eine Primzahl" : ". " + n + " ist keine Primzahl"); }
    } else if (f === "pna") {
      x.begriff = "primzahl"; x.text = "Eine Zahl hat als Teiler nur 1 und sich selbst. Wie heißt so eine Zahl?"; x.loesung = "Primzahl"; x.optionen = ["Primzahl", "Vielfaches", "Produkt", "Quotient"];
      x.schau = "Teiler von 13: 1, 13. So eine Zahl heißt P…"; x.bestaetigung = "So eine Zahl heißt Primzahl";
    } else if (f === "pw") {
      x.begriff = "punkt"; x.text = "Punkt vor Strich: Welche Aufgaben rechnest du zuerst?"; x.loesung = "Mal und geteilt (· und :)"; x.optionen = ["Mal und geteilt (· und :)", "Plus und minus (+ und −)"];
      x.schau = FW.punkt.beispiel + ". Zuerst kommt 3 · 9."; x.bestaetigung = "Punktaufgaben zuerst: mal und geteilt";
    } else if (f === "pz" || f === "pzz") {
      var m = /^(\d+)([-+*\/])(\d+)([-+*\/])(\d+)$/.exec(p[2] || ""); if (!m) return null;
      var A = +m[1], o1 = m[2], B = +m[3], o2 = m[4], C = +m[5], pv = punktOp(o1);
      if (pv === punktOp(o2)) return null;
      var pt = pv ? A + " " + zeichen(o1) + " " + B : B + " " + zeichen(o2) + " " + C, st = pv ? B + " " + zeichen(o2) + " " + C : A + " " + zeichen(o1) + " " + B;
      var pw = pv ? rechne(A, o1, B) : rechne(B, o2, C); if (pw !== Math.floor(pw)) return null;
      var erg = pv ? rechne(pw, o2, C) : rechne(A, o1, pw); if (!(erg >= 0)) return null;
      var ausdr = A + " " + zeichen(o1) + " " + B + " " + zeichen(o2) + " " + C;
      x.begriff = "punkt"; x.punktTeil = pt; x.pw = pw;
      if (f === "pz") { x.text = "Was rechnest du bei " + ausdr + " zuerst?"; x.loesung = pt; x.optionen = [pt, st]; x.aufgaben = 1;
        x.schau = "In " + ausdr + " steht ein Punktzeichen. Die Punktaufgabe kommt zuerst."; x.bestaetigung = "Zuerst " + pt + " = " + pw; }
      else { x.typ = "zahl"; x.text = "Rechne mit Punkt vor Strich."; x.frage = ausdr + " = ?"; x.loesung = erg;
        var lr = rechne(rechne(A, o1, B), o2, C); x.links = lr === Math.floor(lr) && lr !== erg ? lr : null; x.punktZeichen = zeichen(pv ? o1 : o2);
        x.schau = "Zuerst " + pt + " = " + pw + ". Dann " + (pv ? pw + " " + zeichen(o2) + " " + C : A + " " + zeichen(o1) + " " + pw) + " = ?";
        x.bestaetigung = ausdr + " = " + (pv ? pw + " " + zeichen(o2) + " " + C : A + " " + zeichen(o1) + " " + pw) + " = " + erg; }
    } else return null;
    if (x.typ === "wahl") {
      if (!x.optionen || x.optionen.indexOf(x.loesung) < 0) return null;
      var u = {}; x.optionen.forEach(function (v) { u[v] = 1; }); if (Object.keys(u).length !== x.optionen.length) return null;
      x.optionen = fwMischen(k, x.optionen);
    }
    if (x.typ === "zahl" && (x.loesung !== Math.floor(x.loesung) || x.loesung < 0)) return null;
    x.bestaetigung = x.bestaetigung.charAt(0).toUpperCase() + x.bestaetigung.slice(1);
    x.karte = FW[x.begriff];
    return x;
  }
  /* Was ein falsch gewähltes Wort bedeutet (Denkfehler benennen, nicht tadeln). */
  var FW_BED = {};
  OPK.forEach(function (o) {
    FW_BED[OPS[o].bed] = OPS[o].verb.charAt(0).toUpperCase() + OPS[o].verb.slice(1) + " heißt " + OPS[o].bed + ".";
    FW_BED[OPS[o].verb] = OPS[o].verb.charAt(0).toUpperCase() + OPS[o].verb.slice(1) + " heißt " + OPS[o].bed + ". Das Zeichen ist " + OPS[o].z + ".";
    FW_BED[OPS[o].nomen] = "Die " + OPS[o].nomen + " ist das " + OPS[o].bed.replace(" rechnen", "") + "-Rechnen.";
    FW_BED[OPS[o].erg] = FW[OPS[o].e].merk;
    FW_BED[OPS[o].z] = OPS[o].z + " heißt " + OPS[o].bed + ".";
  });
  FW_BED["Tauschaufgaben"] = "Bei Tauschaufgaben tauschen die zwei Zahlen den Platz.";
  FW_BED["Umkehraufgaben"] = "Bei Umkehraufgaben wird aus mal geteilt.";
  FW_BED["Vielfaches"] = "Ein Vielfaches steht in einer Einmaleinsreihe.";
  FW_BED["Plus und minus (+ und −)"] = "Plus und minus sind Strichaufgaben. Die kommen danach.";
  function fwDenkfehler(x, e) {
    if (e === "" || e == null) return "";
    if (x.typ === "zahl") {
      var v = +e;
      if (x.op) {
        for (var i = 0; i < OPK.length; i++) { var q = OPK[i]; if (q !== x.op && OPS[q].r(x.a, x.b) === v) return "Du hast " + OPS[q].bed.replace(" rechnen", "") + " gerechnet. " + (x.text.indexOf("Berechne") === 0 ? OPS[x.op].erg + " heißt " + OPS[x.op].bed + "." : OPS[x.op].verb.charAt(0).toUpperCase() + OPS[x.op].verb.slice(1) + " heißt " + OPS[x.op].bed + "."); }
      }
      if (x.links != null && v === x.links) return "Du hast von links nach rechts gerechnet. Punkt vor Strich: Zuerst kommt " + x.punktZeichen + ".";
      return "";
    }
    if (e === x.loesung) return "";
    if (FW_BED[e]) return FW_BED[e];
    if (x.d && /^\d+$/.test(e)) return e + " steht nicht in der " + x.d + "er-Reihe.";
    if (x.n && /^\d+$/.test(e)) return x.n + " : " + e + " geht nicht glatt auf.";
    if (x.begriff === "primzahl" && /^\d+$/.test(e)) { var tt = teilerVon(+e).filter(function (t) { return t > 1 && t < +e; }); return e + " hat noch mehr Teiler, zum Beispiel " + tt[0] + "."; }
    if (x.aufgaben) {
      if (/ · /.test(e) && /Tausch/.test(x.text)) return "Das ist eine Malaufgabe, aber die Zahlen stehen nicht getauscht da.";
      if (/ · /.test(e)) return e + " ist die Tauschaufgabe. Gesucht ist die Umkehraufgabe.";
      if (/ : /.test(e)) return /Umkehr/.test(x.text) ? "" : e + " ist die Umkehraufgabe. Gesucht ist die Tauschaufgabe.";
      if (/ \+ /.test(e)) return "Bei " + e + " wird plus gerechnet.";
      if (/ − /.test(e)) return "Bei " + e + " wird minus gerechnet.";
    }
    return "";
  }
  /* Verrät ein Satz die Antwort? (Stufe 1 darf es nicht.) */
  function fwVerraet(s, x) {
    var l = String(x.loesung).toLowerCase(), t = s.toLowerCase();
    if (x.typ === "zahl") return x.loesung >= 10 && new RegExp("(^|[^0-9])" + x.loesung + "([^0-9]|$)").test(s);
    if (l === "ja" || l === "nein") return false;   // Ja/Nein: der Merksatz nennt keine Antwort
    var kl = /\(([^)]+)\)/.exec(l); if (kl && t.indexOf(kl[1]) >= 0) return true;   // „(· und :)“
    if (/^\d+$/.test(l)) return new RegExp("(^|[^0-9])" + l + "([^0-9]|$)").test(s);
    var stamm = l.replace(/aufgaben$/, "aufgabe").slice(0, Math.max(4, Math.min(l.length, 6)));
    return t.indexOf(l) >= 0 || t.indexOf(stamm) >= 0;
  }
  /* Stufe 1: der Merksatz aus der Lernliste. Würde er die Antwort nennen, die Eselsbrücke derselben Karte. */
  function fwStufe1(x) {
    var c = x.karte;
    if (!fwVerraet(c.merk, x)) return "Merksatz: " + c.merk;
    if (!fwVerraet(c.esel, x)) return "So merkst du es dir: " + c.esel;
    return "Lies die Frage noch einmal in Ruhe.";
  }
  function fwStufe2(x) { return "Schau: " + x.schau + (x.typ === "zahl" ? " Tipp es jetzt selbst ein." : " Tippe jetzt die passende Antwort an."); }

  /* Die Fachwort-Runde eines Tages: Kiste (gestern falsch, zuerst), dann jedes der 14 Wörter einmal,
     der Rest nach Fehlergewicht. nr = 0 Tagesrunde (mit Kiste), nr > 0 „Noch eine Runde“ ohne Kiste. */
  function fwLeer() { var f = {}; FW_IDS.forEach(function (id) { f[id] = 1; }); return { f: f, kiste: {}, o: 0, benutzt: [], heute: { d: "", n: 0 } }; }
  function fwPruefen(w) {
    var l = fwLeer();
    if (!w || typeof w !== "object") return l;
    FW_IDS.forEach(function (id) { if (w.f && w.f[id] != null) l.f[id] = Math.max(0, +w.f[id] || 0); });
    if (w.kiste && typeof w.kiste === "object") Object.keys(w.kiste).forEach(function (k) { if (/^fw:/.test(k) && fwAufgabe(k)) l.kiste[k] = w.kiste[k]; });
    l.o = +w.o || 0;
    l.benutzt = Array.isArray(w.benutzt) ? w.benutzt.slice(-300) : [];
    l.heute = w.heute && typeof w.heute === "object" ? { d: String(w.heute.d || ""), n: +w.heute.n || 0 } : l.heute;
    return l;
  }
  function fachNr(stand, heute) { var w = stand.fw || fwLeer(); return w.heute && w.heute.d === heute ? w.heute.n : 0; }
  function fwGeschwister(k, n) {
    var x = fwAufgabe(k); if (!x) return k;
    var r = zufall("fw-g|" + k + "|" + (n || 1));
    for (var t = 0; t < 40; t++) { var g = FW_ZIEH[x.begriff](r); if (g !== k && fwAufgabe(g)) return g; }
    return k;
  }
  function fachRunde(stand, heute, nr) {
    nr = nr || 0;
    var w = fwPruefen(stand.fw), r = zufall("fw|" + heute + "|" + nr), liste = [], belegt = {}, gedeckt = {};
    if (nr === 0) {
      Object.keys(w.kiste).sort(function (a, b) { return (w.kiste[a].o || 0) - (w.kiste[b].o || 0); }).slice(0, EIN.fwKisteMax).forEach(function (kk) {
        var e = w.kiste[kk], k = (e.z || 0) ? fwGeschwister(kk, e.z) : kk, x = fwAufgabe(k);
        if (!x || belegt[k]) return;
        belegt[k] = 1; gedeckt[x.begriff] = 1; liste.push({ k: k, kk: kk });
      });
    }
    function ziehe(id) {
      var k = null;
      for (var v = 0; v < 30; v++) { k = FW_ZIEH[id](r); if (!belegt[k] && w.benutzt.indexOf(k) < 0) break; }
      for (var v2 = 0; v2 < 30 && belegt[k]; v2++) k = FW_ZIEH[id](r);
      if (belegt[k] || !fwAufgabe(k)) return;
      belegt[k] = 1; liste.push({ k: k });
    }
    mischen(FW_IDS, r).forEach(function (id) { if (!gedeckt[id] && liste.length < EIN.fach) ziehe(id); });
    // Der Rest nach Fehlergewicht: wer oft danebenlag, kommt öfter (Gleichstand: Tageszufall).
    var extra = {}, zuf = {}; FW_IDS.forEach(function (id) { zuf[id] = r(); extra[id] = 0; });
    for (var i = 0; liste.length < EIN.fach && i < 40; i++) {
      var best = null, bw = -1e9;
      FW_IDS.forEach(function (id) { var g = (w.f[id] || 0) - 1.2 * extra[id] + zuf[id] * 0.8; if (g > bw) { bw = g; best = id; } });
      extra[best]++; ziehe(best);
    }
    return mischen(liste, r);
  }
  /* Buchen einer Fachwort-Runde (ein Aufruf je fertiger Runde, danach schreibt die Seite EINMAL). */
  function buchenFach(stand, heute, erg, nr) {
    var s = standPruefen(JSON.parse(JSON.stringify(stand))), w = s.fw;
    erg.forEach(function (e) {
      var x = fwAufgabe(e.k); if (!x) return;
      w.f[x.begriff] = e.ok ? Math.max(0, (w.f[x.begriff] || 0) - 0.5) : (w.f[x.begriff] || 0) + 1;
      if (e.kk && w.kiste[e.kk]) {
        var ke = w.kiste[e.kk];
        if (ke.zd !== heute) { ke.z = (ke.z || 0) + 1; ke.zd = heute; }
        if (!e.ok) { ke.s = 0; ke.d = heute; }
        else if (ke.d !== heute) { ke.s = (ke.s || 0) + 1; ke.d = heute; if (ke.s >= EIN.sitztNach) delete w.kiste[e.kk]; }
      } else if (!e.ok) {
        if (w.kiste[e.k]) { w.kiste[e.k].s = 0; w.kiste[e.k].d = heute; }
        else w.kiste[e.k] = { s: 0, d: heute, z: 0, zd: heute, o: w.o++ };
      }
      if (w.benutzt.indexOf(e.k) < 0) w.benutzt.push(e.k);
    });
    if (w.benutzt.length > 300) w.benutzt = w.benutzt.slice(-300);
    w.heute = w.heute && w.heute.d === heute ? { d: heute, n: w.heute.n + 1 } : { d: heute, n: 1 };
    var tag = s.tage[heute] = s.tage[heute] || [];
    tag.push({ t: 3, nr: nr || 0, a: [erg.filter(function (e) { return e.ok; }).length, erg.length],
      f: erg.filter(function (e) { return !e.ok; }).map(function (e) { return e.k; }).slice(0, 12) });
    return s;
  }

  /* ---------- Stand ---------- */
  function leererStand() {
    var th = {};
    THEMEN.forEach(function (t) { th[t] = { s: 0, r: 0, f: START_F[t] }; });
    var kiste = {};
    SAAT.forEach(function (e, i) { kiste[e.k] = { s: 0, d: "", z: 0, zd: "", o: i }; });
    return { v: 1, themen: th, kiste: kiste, o: SAAT.length, weg: [], benutzt: [], tage: {}, heute: { d: "", t1: 0, t2: 0, n: 0 }, schreib: { d: "", n: 0 }, fw: fwLeer() };
  }
  function standPruefen(s) {
    var l = leererStand();
    if (!s || typeof s !== "object" || s.v !== 1) return l;
    THEMEN.forEach(function (t) {
      var e = s.themen && s.themen[t];
      if (e && typeof e === "object") l.themen[t] = { s: Math.max(0, Math.min(EIN.stufeMax, +e.s || 0)), r: +e.r || 0, f: Math.max(0, +e.f || 0) };
    });
    l.kiste = s.kiste && typeof s.kiste === "object" ? s.kiste : l.kiste;
    l.o = +s.o || SAAT.length;
    l.benutzt = Array.isArray(s.benutzt) ? s.benutzt.slice(-EIN.benutztMax) : [];
    l.weg = Array.isArray(s.weg) ? s.weg.slice(-200) : [];   // Blatt-Stellen, die schon sitzen (kommen nicht wieder)
    l.tage = s.tage && typeof s.tage === "object" ? s.tage : {};
    l.heute = s.heute && typeof s.heute === "object" ? { d: String(s.heute.d || ""), t1: +s.heute.t1 || 0, t2: +s.heute.t2 || 0, n: +s.heute.n || 0 } : l.heute;
    l.schreib = s.schreib && typeof s.schreib === "object" ? { d: String(s.schreib.d || ""), n: +s.schreib.n || 0 } : l.schreib;
    l.fw = fwPruefen(s.fw);   // Teil 3 Fachwörter (18.10.2026)
    return l;
  }
  function heuteStand(stand, heute) {
    return stand.heute && stand.heute.d === heute ? stand.heute : { d: heute, t1: 0, t2: 0, n: 0 };
  }

  /* Welche Aufgabe eine Kisten-Zeile heute zeigt. Saat: Variante nach der Zahl der Übungstage. */
  function kistenAufgabe(kk, e) {
    if (kk.indexOf("seed:") === 0) {
      for (var i = 0; i < SAAT.length; i++) if (SAAT[i].k === kk) return SAAT[i].v[(e.z || 0) % SAAT[i].v.length];
      return null;
    }
    /* Eigene Fehler und Blatt-Stellen: am ersten Kistentag die Aufgabe selbst, danach dieselbe Form
       mit neuen Zahlen (16.10.2026, Denny: „Paul hat immer wieder mit der gleichen Aufgabenform Probleme“). */
    var k = kk.indexOf("auto:") === 0 ? kk.slice(5) : kk;
    return (e.z || 0) ? geschwister(k, e.z) : k;
  }
  /* Reihenfolge: zuerst Pauls eigene Fehler aus den Runden (die kommen JEDEN Übungstag, bis sie sitzen),
   * dann die Saat-Stellen: wenig gesessen zuerst, dann am längsten nicht dran. */
  function kistenEintraege(stand, blatt) {
    var alle = {};
    Object.keys(stand.kiste).forEach(function (kk) { alle[kk] = stand.kiste[kk]; });
    (blatt && blatt.stellen || []).forEach(function (st, i) {
      var kk = "auto:" + st.k;
      if (!alle[kk] && (stand.weg || []).indexOf(kk) < 0 && !stand.kiste[st.k]) alle[kk] = { s: 0, d: "", z: 0, zd: "", o: 1e6 + i };
    });
    return alle;
  }
  /* Rang: 0 eigene Fehler aus den Runden, 1 Stellen von Pauls Blättern, 2 Saat. */
  function rang(kk) { return kk.indexOf("seed:") === 0 ? 2 : kk.indexOf("auto:") === 0 ? 1 : 0; }
  function kistenListe(stand, blatt) {
    var K = kistenEintraege(stand, blatt);
    return Object.keys(K).filter(function (kk) { var a = kistenAufgabe(kk, K[kk]); return a && aufgabe(a); })
      .sort(function (x, y) {
        var a = K[x], b = K[y], sx = rang(x), sy = rang(y);
        if (sx !== sy) return sx - sy;
        if (sx === 0) return (a.o || 0) - (b.o || 0);
        return ((a.s || 0) - (b.s || 0)) || ((a.d || "") < (b.d || "") ? -1 : (a.d || "") > (b.d || "") ? 1 : 0) || ((a.o || 0) - (b.o || 0));
      });
  }

  /* Die drei freien Plätze gehen an die Themen mit den meisten Fehlern (Gleichstand: Tageszufall). */
  function verteilung(stand, r, plaetze, blattArt) {
    var zahl = {}, extra = (plaetze == null ? EIN.frisch : plaetze) - THEMEN.length;
    THEMEN.forEach(function (t) { zahl[t] = 1; });
    var zuf = {}; THEMEN.forEach(function (t) { zuf[t] = r(); });
    for (var i = 0; i < extra; i++) {
      var best = null, bw = -1e9;
      THEMEN.forEach(function (t) {
        // Themen der neuesten Blätter bekommen etwas mehr Gewicht (höchstens +2).
        var w = (stand.themen[t].f || 0) + Math.min(2, (blattArt && blattArt[t] || 0) * 0.5) - 2.5 * (zahl[t] - 1) + zuf[t] * 0.9;
        if (w > bw) { bw = w; best = t; }
      });
      zahl[best]++;
    }
    return zahl;
  }

  /* Die Runde eines Tages. nr = 0 die Tagesrunde (mit Kiste), nr > 0 eine Extrarunde nur mit frischen. */
  function tagesRunde(stand, heute, nr, blatt) {
    nr = nr || 0;
    blatt = blattPruefen(blatt);
    var r = zufall("ps|" + heute + "|" + nr), belegt = {}, teil1 = [], teil2 = [];
    if (nr === 0) {
      var K = kistenEintraege(stand, blatt), kl = kistenListe(stand, blatt), n1 = 0, n2 = 0;
      kl.forEach(function (kk) {
        var k = kistenAufgabe(kk, K[kk]), x = aufgabe(k);
        if (belegt[k]) return;
        if (istText(x)) { if (n2 < 2) { teil2.push({ k: k, kk: kk }); belegt[k] = 1; n2++; } return; }
        // Eigene Fehler immer (bis eigeneMax), Saat-Stellen füllen bis kisteMax auf.
        // Eigene Fehler immer (bis eigeneMax); Blatt-Stellen und Saat füllen bis kisteMax auf.
        if (rang(kk) === 0 ? n1 < EIN.eigeneMax : n1 < EIN.kisteMax) { teil1.push({ k: k, kk: kk }); belegt[k] = 1; n1++; }
      });
    }
    // Aufgaben wie auf Pauls neuesten Blättern (dieselbe Form, neue Zahlen), dann die Themen.
    var rb = zufall("ps-b|" + heute + "|" + nr), blattArt = {}, nb = 0;
    blattWahl(blatt, rb).forEach(function (q, i) {
      var k = null;
      for (var v = 1; v < 12; v++) { var g = geschwister(q, hash(heute + "|" + nr + "|" + i) % 997 + v); if (!belegt[g] && stand.benutzt.indexOf(g) < 0) { k = g; break; } }
      if (!k) return;
      belegt[k] = 1; teil1.push({ k: k, b: 1 }); nb++;
      var xa = aufgabe(k).art; blattArt[xa] = (blattArt[xa] || 0) + 1;
    });
    var z = verteilung(stand, r, EIN.frisch - nb, blattArt);
    THEMEN.forEach(function (t) {
      for (var i = 0; i < z[t]; i++) teil1.push({ k: frischZiehen(t, stand.themen[t].s, r, belegt, stand.benutzt) });
    });
    teil1 = mischen(teil1, r);
    // Teil 2 mit eigenem Tageszufall: bleibt gleich, auch wenn Teil 1 schon gebucht ist.
    var r2 = zufall("ps-s|" + heute + "|" + nr), arten = mischen(SACH_ARTEN, r2), mitKiste = teil2.length;
    /* Zuerst Textaufgaben im Wortlaut der Lehrerin: eine Form von Pauls Fehlern (Tageswechsel), dann ein Schema vom
       neuesten Blatt. Zwei verschiedene Formen je Runde, auch verschieden von den Kisten-Aufgaben. */
    var rl = zufall("ps-l|" + heute + "|" + nr), formen = {}, vorlagen = [];
    var fehlerT = blatt.stellen.filter(function (st) { var x = aufgabe(st.k); return x && (x.art === "raet" || x.art === "lt"); }).map(function (st) { return st.k; });
    // Höchstens eine Fehlerform hier (die übrigen stehen schon in der Kiste), dann das neueste Blatt der Lehrerin, dann der Rest.
    var neuestes = blatt.texte.length ? blatt.texte[0].blatt : "";
    teil2.forEach(function (e) { formen[form(e.k)] = 1; });
    vorlagen = mischen(fehlerT.filter(function (k) { return !formen[form(k)]; }), rl).slice(0, 1)
      .concat(mischen(blatt.texte.filter(function (t) { return t.blatt === neuestes; }).map(function (t) { return t.k; }), rl))
      .concat(mischen(blatt.texte.filter(function (t) { return t.blatt !== neuestes; }).map(function (t) { return t.k; }), rl));
    for (var li = 0, nl = 0; nl < EIN.lehrer && li < vorlagen.length; li++) {
      var vf = form(vorlagen[li]); if (formen[vf]) continue;
      var lk = null;
      for (var lv = 1; lv < 12; lv++) { var lg = geschwister(vorlagen[li], hash(heute + "|" + nr + "|l" + li) % 997 + lv); if (!belegt[lg] && stand.benutzt.indexOf(lg) < 0 && lg !== vorlagen[li]) { lk = lg; break; } }
      if (!lk) continue;
      formen[vf] = 1; belegt[lk] = 1; teil2.push({ k: lk, l: 1 }); nl++;
    }
    for (var j = 0; teil2.length < EIN.sach + mitKiste && j < arten.length; j++) {
      teil2.push({ k: frischZiehen(arten[j], 0, r2, belegt, stand.benutzt, true) });
    }
    return { teil1: teil1, teil2: teil2 };
  }

  /* ---------- Prüfen ---------- */
  function zahlOder(v) { return v === "" || v == null ? null : +v; }
  function stimmt(x, e) {
    if (x.typ === "zahl") return zahlOder(e) === x.loesung;
    if (x.typ === "rest") return e && zahlOder(e.q) === x.loesung.q && zahlOder(e.r) === x.loesung.r;
    if (x.typ === "wahl") return e != null && String(e) === x.loesung;
    var s = (e || []).map(Number).sort(function (a, b) { return a - b; });
    return s.join(",") === x.loesung.join(",");
  }
  function loesungText(x) {
    if (x.typ === "rest") return x.loesung.q + " R " + x.loesung.r;
    if (x.typ === "tippen") return x.loesung.join(", ");
    if (x.typ === "wahl") return x.loesung;
    return String(x.loesung);
  }
  function eingabeText(x, e) {
    if (x.typ === "rest") return (e && e.q !== "" ? e.q : "?") + " R " + (e && e.r !== "" ? e.r : "?");
    if (x.typ === "tippen") return (e || []).slice().sort(function (a, b) { return a - b; }).join(", ");
    if (x.typ === "wahl") return String(e == null ? "" : e);
    return String(e);
  }

  /* ---------- Denkfehler und Hilfe in Stufen (Kapitel 044) ----------
   * Erst der Denkfehler, wenn er sich erkennen lässt, dann Stufe 1 (Tipp ohne Ergebnis),
   * ab dem zweiten Fehlversuch Stufe 2 (Rechenweg, die letzte Lücke tippt Paul selbst),
   * ab dem vierten die Lösung zum Abtippen, damit er nie feststeckt. */
  function denkfehler(x, e) {
    var v, s;
    if (e === "" || e == null) return "";
    if (x.art === "fw") return fwDenkfehler(x, e);
    if (x.art === "mal" && !x.platz) {
      v = +e; var sm = x.sa * x.sb, zz = Math.pow(10, x.z);
      if (v === sm) return x.z === 1 ? "Die Null fehlt noch." : "Die Nullen fehlen noch.";
      if (v === sm * zz * 10) return "Da ist eine Null zu viel.";
      if (v % zz === 0 && v / zz !== sm) return "Die Nullen stimmen. Die kleine Aufgabe " + x.sa + " · " + x.sb + " noch nicht.";
      return "";
    }
    if (x.art === "mal" && x.platz) { v = +e; return "Mach die Probe: " + x.bek + " · " + v + " = " + (x.bek * v) + ". Das ist nicht " + x.p + "."; }
    if (x.art === "teil" && !x.platz) { v = +e; return "Mach die Probe: " + v + " · " + x.d + " = " + (v * x.d) + ". Das ist nicht " + x.n + "."; }
    if (x.art === "teil" && x.platz) { v = +e; return v % x.d ? "Mach die Probe: " + v + " : " + x.d + " geht nicht glatt auf." : "Mach die Probe: " + v + " : " + x.d + " = " + (v / x.d) + ". Das ist nicht " + x.q + "."; }
    if (x.typ === "rest") {
      var q = zahlOder(e && e.q), r = zahlOder(e && e.r), d = x.art === "sach" ? +x.rechnung.split(" : ")[1] : x.d, n = x.art === "sach" ? +x.rechnung.split(" : ")[0] : x.n;
      if (q == null || r == null) return "";
      if (r >= d) return "Der Rest ist zu groß: Da passt noch einmal " + d + " hinein.";
      s = q * d + r;
      if (s !== n) return "Mach die Probe: " + q + " · " + d + " + " + r + " = " + s + ". Das ist nicht " + n + ".";
      return "";
    }
    if (x.art === "rech") {
      v = +e;
      if (x.links != null && v === x.links) return "Du hast von links nach rechts gerechnet. Punkt vor Strich: Zuerst kommt " + zeichen(x.to[x.zwischen.i]) + ".";
      if (x.zwischen && v === x.zwischen.wert) return "Das ist erst " + x.zwischen.text + ". Die Aufgabe geht noch weiter.";
      return "";
    }
    if (x.art === "lt") {
      v = +e;
      if (x.vorwaerts != null && v === x.vorwaerts) return "Du hast vorwärts gerechnet. Hier rechnest du rückwärts: Fang bei " + x.r + " an und nimm die Umkehraufgabe.";
      if (x.umgekehrt != null && v === x.umgekehrt) return "Lies noch einmal genau: „und dann " + x.umB + " " + x.umWort + "“. Hier rechnest du vorwärts, so wie es im Text steht.";
      if (x.ohneF != null && v === x.ohneF) return "Erst kommt " + x.fWort + " von " + x.fA + ". Damit rechnest du weiter.";
      if (x.ohneSumme != null && v === x.ohneSumme) return "Du sollst die ganze Summe abziehen, nicht nur die erste Zahl.";
      if (v === x.zwischen.wert) return "Das ist erst " + x.zwischen.text + " = " + x.zwischen.wert + ". Die Aufgabe hat noch einen zweiten Schritt.";
      return "";
    }
    if (x.art === "raet") {
      v = +e;
      if (x.f && (v === (x.wie === "m" ? x.b + x.a : x.b - x.a))) return "Erst kommt das " + FACHE[x.f] + " von " + x.b + ": " + x.f + " · " + x.b + ". Damit rechnest du weiter.";
      if (x.wie === "m" && v === x.c - x.a) return "Mach die Probe: " + v + " − " + x.a + " = " + (v - x.a) + ". Das ist nicht " + x.c + ". Rechne rückwärts.";
      if (x.wie === "p" && v === x.c + x.a) return "Mach die Probe: " + v + " + " + x.a + " = " + (v + x.a) + ". Das ist nicht " + x.c + ". Rechne rückwärts.";
      if (x.wie === "m") return "Mach die Probe: " + v + " − " + x.a + " = " + (v - x.a) + ". Das ist nicht " + x.c + ".";
      if (x.wie === "p") return "Mach die Probe: " + v + " + " + x.a + " = " + (v + x.a) + ". Das ist nicht " + x.c + ".";
      if (v === x.c) return "Das ist die Zahl, die übrig bleibt. Gesucht ist die Zahl, die du wegnimmst.";
      return v <= x.a ? "Mach die Probe: " + x.a + " − " + v + " = " + (x.a - v) + ". Das ist nicht " + x.c + "." : "";
    }
    if ((x.art === "punkt" || (x.art === "sach" && x.links != null)) && x.links != null && +e === x.links) {
      return "Du hast von links nach rechts gerechnet. Punkt vor Strich: Zuerst kommt " + (x.punktZeichen || "·") + ".";
    }
    if (x.typ === "tippen") {
      var w = (e || []).map(Number), fehlt = x.loesung.filter(function (t) { return w.indexOf(t) < 0; }).length;
      var zuviel = w.filter(function (t) { return x.loesung.indexOf(t) < 0; }).length;
      var satz = [];
      if (fehlt) satz.push("Es fehlen noch " + fehlt + (x.wovon === "teiler" ? " Teiler." : " Vielfache."));
      if (zuviel) satz.push(zuviel === 1 ? "Eine Zahl gehört nicht dazu." : zuviel + " Zahlen gehören nicht dazu.");
      return satz.join(" ");
    }
    return "";
  }
  function stufe1(x) {
    switch (x.art) {
      case "fw": return fwStufe1(x);
      case "mal":
        if (x.platz) {
          var zb = nullen(x.bek), zp = nullen(x.p);
          if (zb && zp) return "Streiche bei " + x.p + " und " + x.bek + " je eine Null. Welche Zahl mal " + (x.bek / 10) + " ergibt " + (x.p / 10) + "?";
          return "Rechne erst ohne die Null: Welche Zahl mal " + x.bek + " ergibt " + (x.p / 10) + "? Dann hängst du die Null an.";
        }
        return "Nullentrick: Rechne erst die kleine Aufgabe " + x.sa + " · " + x.sb + ". Dann hängst du " + (x.z === 1 ? "die Null" : "die " + x.z + " Nullen") + " an.";
      case "teil":
        if (x.platz) return "Rechne rückwärts: Welche Zahl geteilt durch " + x.d + " ergibt " + x.q + "? Nimm die Malaufgabe.";
        if (x.d === 10) return "Durch 10 teilen: Streiche bei " + x.n + " die Null am Ende weg.";
        if (x.d % 10 === 0) return "Streiche bei beiden Zahlen eine Null. Dann rechnest du " + (x.n / 10) + " : " + (x.d / 10) + ".";
        return "Rechne erst die kleine Aufgabe " + (x.n / 10) + " : " + x.d + ". Dann hängst du die Null an.";
      case "rest":
        if (x.d < 10 && Math.floor(x.n / x.d) >= 11) {
          var gross = 10 * x.d * Math.floor(x.n / (10 * x.d));
          return "Zerlege " + x.n + ": Nimm zuerst " + gross + ". Das geht glatt durch " + x.d + ". Den Rest teilst du danach.";
        }
        return "Suche in der " + x.d + "er-Reihe die Zahl, die knapp unter " + x.n + " liegt. Was übrig bleibt, ist der Rest.";
      case "punkt":
        return "Punkt vor Strich: Rechne zuerst " + x.punktTeil + ".";
      case "teiler":
        if (x.wovon === "teiler") return "Suche Paare: 1 · " + x.n + ", 2 · ? … Jede Zahl in einem Paar ist ein Teiler.";
        return "Vielfache von " + x.d + " stehen in der " + x.d + "er-Reihe: " + x.d + ", " + (2 * x.d) + ", " + (3 * x.d) + " …";
      case "sach":
        return x.signal;
      case "rech":
        if (!x.zwischen) return x.to[0] === "*" ? "Denk an die " + Math.min(x.tz[0], x.tz[1]) + "er-Reihe." : "Rechne Schritt für Schritt.";
        return (x.gemischt ? "Punkt vor Strich: Rechne zuerst " : "Rechne von links nach rechts: zuerst ") + x.zwischen.text + ".";
      case "lt":
        if (x.rueck) return "Rechne rückwärts: Fang hinten bei " + x.r + " an. Aus plus wird minus, aus minus wird plus, aus mal wird geteilt, aus geteilt wird mal.";
        return "Zwei Schritte: Rechne zuerst " + x.zwischen.text + ". Mit dem Ergebnis rechnest du weiter.";
      case "raet":
        if (x.f) return "Rechne zuerst das " + FACHE[x.f] + " von " + x.b + " aus: " + x.f + " · " + x.b + ". Dann rechne rückwärts.";
        if (x.wie === "m") return "Rechne rückwärts: Was weggenommen wurde, zählst du wieder dazu.";
        if (x.wie === "p") return "Rechne rückwärts: Was dazugezählt wurde, nimmst du wieder weg.";
        return "Von " + x.a + " bis " + x.c + ": Wie viel fehlt dazwischen? Rechne " + x.a + " − " + x.c + ".";
    }
    return "";
  }
  function reihe(d, bis) { var z = []; for (var i = 1; i * d <= bis; i++) z.push(i * d); return z.join(", "); }
  function stufe2(x) {
    var t = " Tipp es jetzt selbst ein.";
    switch (x.art) {
      case "fw": return fwStufe2(x);
      case "mal":
        if (x.platz) {
          var b = nullen(x.bek) ? x.bek / 10 : x.bek, p = x.p / 10;
          return "Schau: " + b + "er-Reihe: " + reihe(b, p) + ". " + (nullen(x.bek) ? "Die wievielte Zahl ist " + p + "?" : "Die wievielte Zahl ist " + p + "? Dann noch die Null dran.") + t;
        }
        return "Schau: " + x.sa + " · " + x.sb + " = " + (x.sa * x.sb) + ". Jetzt " + (x.z === 1 ? "die Null" : "die Nullen") + " dran." + t;
      case "teil":
        if (x.platz) return "Schau: " + x.q + " · " + x.d + ". Häng an " + x.q + " eine Null an." + t;
        if (x.d === 10) return "Schau: ? · 10 = " + x.n + ". Welche Zahl mit einer Null dahinter ergibt " + x.n + "?" + t;
        if (x.d % 10 === 0) return "Schau: " + (x.d / 10) + "er-Reihe: " + reihe(x.d / 10, x.n / 10) + ". Die wievielte Zahl ist " + (x.n / 10) + "?" + t;
        return "Schau: " + (x.n / 10) + " : " + x.d + " = " + (x.n / 10 / x.d) + ". Jetzt die Null dran." + t;
      case "rest":
        var q = Math.floor(x.n / x.d);
        if (x.d < 10 && q >= 11) {
          var zehn = 10 * Math.floor(x.n / (10 * x.d)), gross = zehn * x.d;
          return "Schau: " + gross + " : " + x.d + " = " + zehn + ". Dann " + (x.n - gross) + " : " + x.d + " = ? R ?. Zähl die Ergebnisse zusammen." + t;
        }
        return "Schau: " + q + " · " + x.d + " = " + (q * x.d) + ". " + x.n + " − " + (q * x.d) + " = ? Das ist der Rest." + t;
      case "punkt":
        return "Schau: " + x.punktTeil + " = " + x.pv + ". Dann " + x.rest(x.pv) + " = ?" + t;
      case "teiler":
        if (x.wovon === "teiler") return "Schau: " + paare(x.n).join(", ") + ". Jede Zahl darin ist ein Teiler. Tippe genau diese an.";
        return "Schau: " + reihe(x.d, x.chips[x.chips.length - 1]) + ". Tippe genau die an, die hier stehen.";
      case "sach":
        return "Schau: Rechne " + x.rechnung + " = ?" + t;
      case "rech":
        if (!x.zwischen) {
          var kl = Math.min(x.tz[0], x.tz[1]), gr = Math.max(x.tz[0], x.tz[1]);
          return x.to[0] === "*" && kl <= 10 ? "Schau: " + kl + "er-Reihe: " + reihe(kl, kl * (gr - 1)) + " … Die " + gr + ". Zahl fehlt noch." + t : "Schau: Rechne " + x.frage.replace(" = ?", "") + " in Ruhe." + t;
        }
        var zt = x.tz.slice(), zo = x.to.slice(); zt.splice(x.zwischen.i, 2, x.zwischen.wert); zo.splice(x.zwischen.i, 1);
        return "Schau: " + x.zwischen.text + " = " + x.zwischen.wert + ". Dann " + zt.map(function (z, i) { return (i ? zeichen(zo[i - 1]) + " " : "") + z; }).join(" ") + " = ?" + t;
      case "lt":
        return "Schau: " + x.zwischen.text + " = " + x.zwischen.wert + ". Dann " + x.zweiter + " = ?" + t;
      case "raet":
        if (x.f) return "Schau: " + x.f + " · " + x.b + " = " + x.c + ". Dann " + (x.wie === "m" ? x.c + " + " + x.a : x.wie === "p" ? x.c + " − " + x.a : x.a + " − " + x.c) + " = ?" + t;
        return "Schau: " + (x.wie === "m" ? x.c + " + " + x.a : x.wie === "p" ? x.c + " − " + x.a : x.a + " − " + x.c) + " = ?" + t;
    }
    return "";
  }
  function hilfe(x, versuche, e) {
    if (versuche >= 4) return x.typ === "wahl" ? "Die Lösung ist „" + x.loesung + "“. Tippe sie an." : "Die Lösung ist " + loesungText(x) + (x.typ === "tippen" ? ". Tippe genau diese Zahlen an." : ". Tipp sie jetzt ein.");
    var d = denkfehler(x, e), h = versuche >= 2 ? stufe2(x) : stufe1(x);
    return (d ? d + " " : "") + h;
  }
  function bestaetigung(x) {
    switch (x.art) {
      case "fw": return x.bestaetigung;
      case "punkt": return x.frage.replace(" = ?", "") + " = " + x.rest(x.pv) + " = " + x.loesung;
      case "teiler": return (x.wovon === "teiler" ? "Teiler von " + x.n + ": " : "Vielfache von " + x.d + ": ") + x.loesung.join(", ");
      case "sach": return x.rechnung + " = " + loesungText(x) + (x.typ === "zahl" && x.einheit === "€" ? " €" : "");
      case "rech": return x.frage.replace("?", String(x.loesung));
      case "raet": return (x.f ? x.f + " · " + x.b + " = " + x.c + ", " : "") + (x.wie === "m" ? x.c + " + " + x.a : x.wie === "p" ? x.c + " − " + x.a : x.a + " − " + x.c) + " = " + x.loesung + ". Meine Zahl ist " + x.loesung + ".";
      case "lt": return x.zwischen.text + " = " + x.zwischen.wert + ", " + x.zweiter + " = " + x.loesung + ". " + x.satz + " " + x.loesung + ".";
    }
    return x.frage.replace("? R ?", loesungText(x)).replace("?", String(x.loesung));
  }

  /* ---------- Buchen ----------
   * erg: [{k, kk?, ok, sek}] – je Aufgabe nur der erste Versuch.
   * teil: 1 oder 2. Ein Aufruf je fertigem Teil, danach schreibt die Seite EINMAL. */
  function buchen(stand, heute, teil, erg, nr) {
    var s = standPruefen(JSON.parse(JSON.stringify(stand)));
    var h = heuteStand(s, heute);
    erg.forEach(function (e) {
      var x = aufgabe(e.k); if (!x) return;
      if (e.kk && e.kk.indexOf("auto:") === 0 && !s.kiste[e.kk] && s.weg.indexOf(e.kk) < 0) s.kiste[e.kk] = { s: 0, d: "", z: 0, zd: "", o: s.o++ };
      var th = s.themen[x.art];
      if (th) {
        if (e.ok) {
          th.r++; th.f = Math.max(0, th.f - 0.5);
          if (th.r >= EIN.stufeNach && th.s < EIN.stufeMax) { th.s++; th.r = 0; }
        } else { th.r = 0; th.f += 1; }
      }
      if (e.kk && s.kiste[e.kk]) {
        var ke = s.kiste[e.kk];
        if (ke.zd !== heute) { ke.z = (ke.z || 0) + 1; ke.zd = heute; }
        if (!e.ok) { ke.s = 0; ke.d = heute; }
        else if (ke.d !== heute) {
          ke.s = (ke.s || 0) + 1; ke.d = heute;
          if (ke.s >= EIN.sitztNach) { delete s.kiste[e.kk]; if (e.kk.indexOf("auto:") === 0 && s.weg.indexOf(e.kk) < 0) s.weg.push(e.kk); }
        }
      } else {
        if (!e.ok) {
          if (s.kiste[e.k]) { s.kiste[e.k].s = 0; s.kiste[e.k].d = heute; }
          else s.kiste[e.k] = { s: 0, d: heute, z: 0, zd: heute, o: s.o++ };
        }
        if (s.benutzt.indexOf(e.k) < 0) s.benutzt.push(e.k);
      }
    });
    if (s.benutzt.length > EIN.benutztMax) s.benutzt = s.benutzt.slice(-EIN.benutztMax);
    if (teil === 1) h.t1 = 1;
    if (teil === 2) { h.t2 = 1; h.n++; }
    s.heute = h;
    var tag = s.tage[heute] = s.tage[heute] || [];
    tag.push({ t: teil, nr: nr || 0, a: [erg.filter(function (e) { return e.ok; }).length, erg.length],
      f: erg.filter(function (e) { return !e.ok; }).map(function (e) { return e.k; }).slice(0, 12) });
    var tage = Object.keys(s.tage).sort();
    while (tage.length > EIN.tageMax) delete s.tage[tage.shift()];
    return s;
  }
  function darfSchreiben(stand, heute) {
    return !(stand.schreib && stand.schreib.d === heute && stand.schreib.n >= EIN.schreibProTag);
  }
  function geschrieben(stand, heute) {
    if (stand.schreib.d !== heute) stand.schreib = { d: heute, n: 0 };
    stand.schreib.n++;
    return stand;
  }

  var M = {
    EIN: EIN, THEMEN: THEMEN, NAME: NAME, SAAT: SAAT, SACH_ARTEN: SACH_ARTEN,
    heuteIso: heuteIso, aktiv: aktiv, zufall: zufall, ERZEUGE: ERZEUGE, SACH_ERZ: SACH_ERZ,
    aufgabe: aufgabe, tagesRunde: tagesRunde, kistenListe: kistenListe, kistenAufgabe: kistenAufgabe, verteilung: verteilung,
    geschwister: geschwister, form: form, blattPruefen: blattPruefen, BLATT_STAND: BLATT_STAND, HEFT_GELESEN: HEFT_GELESEN, kistenEintraege: kistenEintraege, istText: istText,
    stimmt: stimmt, loesungText: loesungText, eingabeText: eingabeText,
    denkfehler: denkfehler, hilfe: hilfe, bestaetigung: bestaetigung,
    leererStand: leererStand, standPruefen: standPruefen, heuteStand: heuteStand, buchen: buchen,
    darfSchreiben: darfSchreiben, geschrieben: geschrieben, teilerVon: teilerVon,
    FACHWORT: FACHWORT, FW_IDS: FW_IDS, FW_ZIEH: FW_ZIEH, fachRunde: fachRunde, buchenFach: buchenFach, fachNr: fachNr, fwPruefen: fwPruefen
  };
  if (typeof module !== "undefined" && module.exports) module.exports = M;
  else wurzel.PSMotor = M;
})(typeof window !== "undefined" ? window : this);
