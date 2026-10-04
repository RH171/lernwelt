/* Pauls tägliche Aufgabe "1×1 und Textaufgaben" (04.10.2026) – der Motor.
 *
 * Reine Rechenlogik, ohne Seite und ohne Speicher: läuft im Browser
 * (window.TRMotor) und in Node (module.exports, für pruefe-tagesrechnen.mjs).
 * Die Seite paul/klasse4-mathe-tagesrechnen.html zeigt nur an.
 *
 * Denny am 04.10.2026 (über den Alltagshelfer-Chat):
 *  - Einmaleins jeden Tag, jeden Tag andere Aufgaben. Gezogen wird aus den am
 *    längsten nicht gesehenen; eine Aufgabe kommt erst wieder, wenn alle
 *    anderen dran waren.
 *  - Fehler kommen am Ende der Runde noch einmal, bis jede einmal richtig ist,
 *    und am nächsten Tag wieder. Eine Aufgabe "sitzt" erst nach drei Tagen
 *    hintereinander richtig.
 *  - Textaufgaben täglich neu, ohne Wiederholung, fest erzeugt (keine KI),
 *    jede Lösung mechanisch geprüft. Zahlenraum aus Pauls Blättern
 *    (Kapitel 110): Kopfrechnen mit Zehner- und Hunderterzahlen bis 1000,
 *    kleine Einer-Schritte (15, 35), Mal und Geteilt nur im kleinen 1×1.
 *
 * "Drei Tage hintereinander" heißt drei ÜBUNGSTAGE hintereinander, nicht drei
 * Kalendertage: Lässt Paul einen Tag aus, fängt nichts von vorn an. Sonst
 * bestrafte die Regel einen freien Tag (Bauregeln: kein Druck über
 * Verlustangst).
 *
 * Der Stand (localStorage "paul-tagesrechnen", synchronisiert über
 * paul-sync.js; geschrieben wird höchstens zweimal am Tag, nach jedem Teil):
 *   { v:1,
 *     gesehen: { "7x8": "2026-10-04", "56:8": "…" },   zuletzt gesehen
 *     offen:   { "7x8": { s:1, d:"2026-10-04" } },      sitzt noch nicht; s = Übungstage in Folge richtig
 *     toffen:  { "<id>": { typ, v, s, d } },            Textaufgaben-Fehlerart, kommt mit neuen Zahlen wieder
 *     benutzt: [ "<kurz>" … ],                          Fingerabdrücke gestellter Textaufgaben
 *     heute:   { d, e:0|1, t:0|1 },                     welcher Teil heute fertig ist
 *     tage:    [ "2026-10-04" … ],                      geschaffte Tage (beide Teile)
 *     log:     [ { d, e:[richtig, gesamt], t:[richtig, gesamt] } … ],
 *     sitzt:   [ { k, d } … ] }                         zuletzt "gesessen"
 */
(function (wurzel) {
  "use strict";

  var EIN = {
    neu: 15,            // neue 1×1-Aufgaben am Tag, solange wenig offen ist
    neuMin: 8,          // so viele neue kommen immer, auch bei vielen Fehlern
    rundeZiel: 20,      // ab vielen offenen: neue = max(neuMin, rundeZiel - offen)
    textNeu: 4,         // neue Textaufgaben am Tag
    textNeuMin: 2,
    sitztNach: 3,       // Übungstage hintereinander richtig
    benutztMax: 1500,
    tageMax: 400,
    logMax: 120
  };

  /* ---------- Hilfen ---------- */
  function heuteIso(jetzt) {
    // Ortszeit, nicht UTC (Kapitel 096): toISOString() rechnete um Mitternacht
    // in den Vortag. Für Messungen darf window.__trHeute einen Tag vorgeben.
    if (typeof window !== "undefined" && window.__trHeute) return String(window.__trHeute);
    var d = jetzt || new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function hash(s) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function kurz(s) { return (hash(s).toString(36) + hash("x" + s).toString(36)).slice(0, 7); }
  function zufall(saat) {   // mulberry32 – derselbe Tag gibt dieselbe Runde, auch nach Neuladen
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
  function wahl(r, liste) { return liste[Math.floor(r() * liste.length)]; }
  function mischen(r, liste) {
    var a = liste.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function zehner(r, a, b) { return 10 * ganz(r, Math.ceil(a / 10), Math.floor(b / 10)); }
  function leererStand() {
    return { v: 1, gesehen: {}, offen: {}, toffen: {}, benutzt: [], heute: { d: "", e: 0, t: 0 }, tage: [], log: [], sitzt: [] };
  }
  function standPruefen(s) {
    var l = leererStand();
    if (!s || typeof s !== "object") return l;
    Object.keys(l).forEach(function (k) {
      if (s[k] == null || typeof s[k] !== typeof l[k] || Array.isArray(s[k]) !== Array.isArray(l[k])) s[k] = l[k];
    });
    return s;
  }

  /* ---------- Einmaleins ---------- */
  // 100 Malaufgaben (1·1 bis 10·10) und 100 Geteiltaufgaben (a·b : b), keine 0er (Kapitel 093).
  var ALLE = (function () {
    var l = [];
    for (var a = 1; a <= 10; a++) for (var b = 1; b <= 10; b++) l.push(a + "x" + b);
    for (var c = 1; c <= 10; c++) for (var d = 1; d <= 10; d++) l.push((c * d) + ":" + d);
    return l;
  })();

  function einmaleins(k) {
    var m = /^(\d+)x(\d+)$/.exec(k);
    if (m) {
      var a = +m[1], b = +m[2];
      return { k: k, art: "mal", a: a, b: b, frage: a + " · " + b, loesung: a * b };
    }
    var g = /^(\d+):(\d+)$/.exec(k);
    if (!g) return null;
    var D = +g[1], t = +g[2];
    return { k: k, art: "geteilt", a: D, b: t, frage: D + " : " + t, loesung: D / t };
  }

  // Erste Hilfe: über eine Nachbaraufgabe, nie das Ergebnis selbst.
  function tipp1x1(k) {
    var x = einmaleins(k);
    if (x.art === "geteilt") return "Welche Malaufgabe passt? " + x.b + " · ? = " + x.a;
    var a = x.a, b = x.b;
    if (a === 1 || b === 1) return "Mal 1 bleibt die Zahl gleich.";
    if (a === 10 || b === 10) return "Mal 10: hinten eine 0 anhängen.";
    if (a === 5 || b === 5) { var y = b === 5 ? a : b; return "Mal 5 ist die Hälfte von mal 10: " + y + " · 10 = " + (y * 10) + "."; }
    return "Tipp: " + a + " · " + (b - 1) + " = " + (a * (b - 1)) + ", dann noch einmal " + a + " dazu.";
  }
  // Zweite Hilfe: die Rechnung steht da, eingetippt wird selbst.
  function hilfe1x1(k) {
    var x = einmaleins(k);
    if (x.art === "geteilt") return "Schau: " + x.b + " · " + x.loesung + " = " + x.a + ". Tipp es jetzt selbst ein.";
    return "Schau: " + x.a + " · " + x.b + " = " + x.loesung + ". Tipp es jetzt selbst ein.";
  }

  function neueAnzahl(offenZahl) {
    if (offenZahl <= EIN.rundeZiel - EIN.neu) return EIN.neu;
    return Math.max(EIN.neuMin, EIN.rundeZiel - offenZahl);
  }

  /* Die Runde eines Tages. Wiederholer = alles, was noch nicht sitzt (kommt
     jeden Tag). Neu = aus den übrigen die am längsten nicht gesehenen; nie
     gesehen gilt als ältestes. Gleichstand entscheidet der Tageszufall. */
  function rundeEinmaleins(stand, datum) {
    stand = standPruefen(stand);
    var r = zufall("1x1|" + datum);
    var wied = Object.keys(stand.offen).filter(function (k) { return einmaleins(k); });
    var los = {}; ALLE.forEach(function (k) { los[k] = r(); });
    var frei = ALLE.filter(function (k) { return !stand.offen[k]; });
    frei.sort(function (x, y) {
      var gx = stand.gesehen[x] || "", gy = stand.gesehen[y] || "";
      if (gx !== gy) return gx < gy ? -1 : 1;
      return los[x] - los[y];
    });
    var neu = frei.slice(0, neueAnzahl(wied.length));
    return verteilen(r, mischen(r, neu), mischen(r, wied));
  }

  // Wiederholer gleichmäßig zwischen die neuen, die Runde beginnt mit einer neuen.
  function verteilen(r, neu, wied) {
    if (!neu.length) return wied.slice();
    var L = neu.length, n = wied.length, aus = [], k = 0;
    function platz(j) { return Math.max(1, Math.floor((j + 1) * L / (n + 1))); }
    for (var i = 0; i <= L; i++) {
      while (k < n && i >= 1 && platz(k) <= i) aus.push(wied[k++]);
      if (i < L) aus.push(neu[i]);
    }
    while (k < n) aus.push(wied[k++]);
    return aus;
  }

  /* Ergebnis des Hauptdurchgangs verbuchen: { "7x8": true|false } =
     erster Versuch richtig? Die Fehlerrunde am Ende zählt hier nicht. */
  function buchenEinmaleins(stand, datum, erg) {
    stand = standPruefen(stand);
    var richtig = 0, gesamt = 0;
    Object.keys(erg).forEach(function (k) {
      if (!einmaleins(k)) return;
      gesamt++;
      stand.gesehen[k] = datum;
      var o = stand.offen[k];
      if (!erg[k]) { stand.offen[k] = { s: 0, d: datum }; return; }
      richtig++;
      if (!o || o.d === datum) return;      // heute schon gezählt
      o.s = (o.s || 0) + 1; o.d = datum;
      if (o.s >= EIN.sitztNach) { delete stand.offen[k]; stand.sitzt.push({ k: k, d: datum }); }
    });
    if (stand.sitzt.length > 200) stand.sitzt = stand.sitzt.slice(-200);
    tagEintragen(stand, datum, "e", [richtig, gesamt]);
    return stand;
  }

  function tagEintragen(stand, datum, teil, zahl) {
    if (stand.heute.d !== datum) stand.heute = { d: datum, e: 0, t: 0 };
    stand.heute[teil] = 1;
    var l = stand.log.filter(function (x) { return x.d === datum; })[0];
    if (!l) { l = { d: datum }; stand.log.push(l); }
    l[teil] = zahl;
    if (stand.log.length > EIN.logMax) stand.log = stand.log.slice(-EIN.logMax);
    if (stand.heute.e && stand.heute.t && stand.tage.indexOf(datum) < 0) {
      stand.tage.push(datum);
      if (stand.tage.length > EIN.tageMax) stand.tage = stand.tage.slice(-EIN.tageMax);
    }
  }

  /* ---------- Textaufgaben ----------
     Jede Aufgabe ist eine Kette von Schritten { op, n }. Die Lösung rechnet
     der Motor aus der Kette, nicht aus dem Text: dieselbe Kette erzeugt Text,
     Lösung, Rechenweg und Probe. pruefe-tagesrechnen.mjs rechnet jede Aufgabe
     über tausend Tage noch einmal unabhängig nach. */

  var OP = {
    add: { f: function (x, n) { return x + n; }, z: "+", um: "sub" },
    sub: { f: function (x, n) { return x - n; }, z: "−", um: "add" },
    ver: { f: function (x) { return x * 2; }, z: "· 2", um: "hal" },
    hal: { f: function (x) { return x / 2; }, z: ": 2", um: "ver" },
    mul: { f: function (x, n) { return x * n; }, z: "·", um: "div" },
    div: { f: function (x, n) { return x / n; }, z: ":", um: "mul" }
  };
  function schritt(x, s) { return OP[s.op].f(x, s.n); }
  function rechne(start, kette) { var x = start; kette.forEach(function (s) { x = schritt(x, s); }); return x; }
  function zeichen(s) { return s.op === "ver" || s.op === "hal" ? OP[s.op].z : OP[s.op].z + " " + s.n; }
  function umkehr(s) { return { op: OP[s.op].um, n: s.op === "ver" || s.op === "hal" ? 2 : s.n }; }
  function zeile(x, s) { return x + " " + zeichen(s) + " = " + schritt(x, s); }
  function kette(start, k, offenLassen) {
    var x = start, z = [];
    k.forEach(function (s, i) {
      var y = schritt(x, s);
      z.push(x + " " + zeichen(s) + " = " + (offenLassen && i === k.length - 1 ? "?" : y));
      x = y;
    });
    return z.join(", dann ");
  }
  function sauber(x) { return Number.isInteger(x) && x >= 1 && x <= 1000; }
  function ketteSauber(start, k) {
    var x = start;
    if (!sauber(x)) return false;
    for (var i = 0; i < k.length; i++) {
      var s = k[i];
      if ((s.op === "hal" && x % 2) || (s.op === "div" && x % s.n)) return false;
      x = schritt(x, s);
      if (!sauber(x)) return false;
    }
    return true;
  }

  var WORT = {
    // Erster Schritt mit Startzahl, zweiter Schritt "dann"; Formen wie auf Pauls Blatt vom 30.09.2026.
    erst: {
      ver: function (x) { return "Verdopple " + x; }, hal: function (x) { return "Halbiere " + x; },
      add: function (x, n) { return "Addiere zu " + x + " die Zahl " + n; },
      sub: function (x, n) { return "Subtrahiere von " + x + " die Zahl " + n; },
      mul: function (x, n) { return "Multipliziere " + x + " mit " + n; },
      div: function (x, n) { return "Dividiere " + x + " durch " + n; }
    },
    dann: {
      ver: function () { return "verdopple dann das Ergebnis"; }, hal: function () { return "halbiere dann das Ergebnis"; },
      add: function (n) { return "addiere dann " + n; }, sub: function (n) { return "subtrahiere dann " + n; },
      mul: function (n) { return "multipliziere das Ergebnis dann mit " + n; },
      div: function (n) { return "dividiere das Ergebnis dann durch " + n; }
    },
    // Rätsel in der Ich-Form ("Wenn ich sie verdopple und dann 15 addiere, …").
    ich1: {
      ver: function () { return "sie verdopple"; }, hal: function () { return "sie halbiere"; },
      add: function (n) { return "zu ihr " + n + " addiere"; }, sub: function (n) { return "von ihr " + n + " subtrahiere"; },
      mul: function (n) { return "sie mit " + n + " multipliziere"; }, div: function (n) { return "sie durch " + n + " dividiere"; }
    },
    ich2: {
      ver: function () { return "das Ergebnis dann verdopple"; }, hal: function () { return "das Ergebnis dann halbiere"; },
      add: function (n) { return "dann " + n + " addiere"; }, sub: function (n) { return "dann " + n + " subtrahiere"; },
      mul: function (n) { return "das Ergebnis dann mit " + n + " multipliziere"; },
      div: function (n) { return "das Ergebnis dann durch " + n + " dividiere"; }
    },
    name: { ver: "verdoppeln", hal: "halbieren", add: "addieren", sub: "subtrahieren", mul: "multiplizieren", div: "dividieren" },
    zeichenwort: { ver: "das Doppelte (· 2)", hal: "die Hälfte (: 2)", add: "plus", sub: "minus", mul: "mal", div: "geteilt" }
  };

  /* Varianten je Art. Zahlen: Zehner- und Hunderterzahlen bis 1000, als
     zweiter Schritt auch 15, 25, 35 … (wie "verdoppeln und 15 addieren").
     Mal und Geteilt nur mit kleinen Zahlen aus dem 1×1. */
  var VARIANTEN = {
    vor2: ["hal-sub", "hal-add", "ver-add", "ver-sub", "add-hal", "sub-ver", "add-div", "hal-mul"],
    rueck2: ["ver-add", "hal-sub", "sub-ver", "add-hal", "sub-add", "ver-sub", "hal-add", "mul-add"],
    nachbar: ["add-z-k", "add-z-g", "sub-z-k", "sub-z-g", "add-h-k", "sub-h-g"],
    sach: ["karten", "seiten", "buecherei", "fahrrad", "baecker", "kino", "teilen"],
    ergaenzen: ["add", "sub", "mul", "ver"]
  };
  var NAMEN = ["Lina", "Tom", "Mia", "Jonas", "Emil", "Sara", "Ben", "Ida", "Noah", "Ella"];

  function zahlFuer(r, op, gross) {
    // gross: der Schritt gehört zu einer Rechnung mit Zehner-/Hunderterzahlen
    if (op === "add" || op === "sub") {
      if (!gross) return ganz(r, 2, 9);
      if (r() < 0.3) return 10 * ganz(r, 1, 9) + 5;   // 15, 25 … 95
      return zehner(r, 10, r() < 0.5 ? 90 : 400);
    }
    if (op === "mul" || op === "div") return ganz(r, 2, 9);
    return 2;
  }

  function erzeugeKette(r, v, rueck) {
    var ops = v.split("-");
    var klein = ops.indexOf("mul") >= 0 || ops.indexOf("div") >= 0;
    for (var versuch = 0; versuch < 400; versuch++) {
      var k = ops.map(function (op) { return { op: op, n: zahlFuer(r, op, !klein) }; });
      var start;
      if (klein) {
        if (v === "add-div") { var t = k[1].n, q = ganz(r, 2, 10); var summe = t * q; var b = ganz(r, 1, Math.min(9, summe - 1)); start = summe - b; k[0].n = b; }
        else if (v === "hal-mul") { start = 2 * ganz(r, 2, 10); k[1].n = ganz(r, 2, 10); }
        else if (v === "mul-add") { start = ganz(r, 2, 10); k[0].n = ganz(r, 2, 10); k[1].n = 5 * ganz(r, 1, 9); }
        else start = ganz(r, 2, 50);
      } else {
        // Startzahl so, dass Halbieren glatt aufgeht (Vielfache von 20) und alles bis 1000 bleibt.
        start = ops[0] === "hal" ? 20 * ganz(r, 3, 50) : zehner(r, 30, 900);
        if (ops[0] === "ver") start = zehner(r, 20, 450);
      }
      if (!ketteSauber(start, k)) continue;
      var erg = rechne(start, k);
      if (!klein && (erg % 5)) continue;
      // Rätsel brauchen ein Ergebnis über 10; Zwischenergebnisse nicht trivial.
      if ((!klein && erg < 10) || start === erg) continue;
      return { start: start, k: k, erg: erg };
    }
    return null;
  }

  function aufgabeVor2(r, v) {
    var c = erzeugeKette(r, v, false); if (!c) return null;
    var s1 = c.k[0], s2 = c.k[1];
    var text = WORT.erst[s1.op](c.start, s1.n) + " und " + WORT.dann[s2.op](s2.n) + ". Welche Zahl erhältst du?";
    return {
      typ: "vor2", v: v, sig: "vor2|" + v + "|" + c.start + "|" + s1.n + "|" + s2.n,
      text: text, loesung: c.erg,
      tipp: "Rechne Schritt für Schritt. Zuerst: " + WORT.name[s1.op] + ". Danach: " + WORT.name[s2.op] + ".",
      weg: kette(c.start, c.k, true),
      probe: "Probe rückwärts: " + kette(c.erg, c.k.slice().reverse().map(umkehr)) + " ✓",
      fehler: function (a) {
        var tausch = { op: s2.op === "add" ? "sub" : s2.op === "sub" ? "add" : s2.op === "ver" ? "hal" : s2.op === "hal" ? "ver" : s2.op, n: s2.n };
        if (tausch.op !== s2.op && a === schritt(schritt(c.start, s1), tausch))
          return "Schau auf das Rechenwort: „" + WORT.name[s2.op] + "“ heißt " + WORT.zeichenwort[s2.op] + ".";
        var t1 = { op: s1.op === "ver" ? "hal" : s1.op === "hal" ? "ver" : s1.op === "add" ? "sub" : s1.op === "sub" ? "add" : s1.op, n: s1.n };
        if (t1.op !== s1.op && a === schritt(schritt(c.start, t1), s2))
          return "Schau auf das erste Rechenwort: „" + WORT.name[s1.op] + "“ heißt " + WORT.zeichenwort[s1.op] + ".";
        if (a === schritt(c.start, s1)) return "Das ist erst der erste Schritt. Es kommt noch: " + WORT.name[s2.op] + ".";
        if (ketteSauber(c.start, [s2, s1]) && a === rechne(c.start, [s2, s1]) && a !== c.erg)
          return "Achte auf die Reihenfolge: zuerst " + WORT.name[s1.op] + ", dann " + WORT.name[s2.op] + ".";
        return null;
      }
    };
  }

  function aufgabeRueck2(r, v) {
    var c = erzeugeKette(r, v, true); if (!c) return null;
    var s1 = c.k[0], s2 = c.k[1], R = c.erg, zahl = c.start;
    var rueck = [umkehr(s2), umkehr(s1)];
    var text = "Ich denke mir eine Zahl. Wenn ich " + WORT.ich1[s1.op](s1.n) + " und " + WORT.ich2[s2.op](s2.n) +
      ", erhalte ich " + R + ". Wie heißt meine Zahl?";
    return {
      typ: "rueck2", v: v, sig: "rueck2|" + v + "|" + zahl + "|" + s1.n + "|" + s2.n,
      text: text, loesung: zahl,
      tipp: "Rechne rückwärts: Fang bei " + R + " an und nimm die Umkehraufgabe – zuerst von „" + WORT.name[s2.op] + "“, dann von „" + WORT.name[s1.op] + "“.",
      weg: "Rückwärts: " + kette(R, rueck, true),
      probe: "Probe vorwärts: " + kette(zahl, c.k) + " ✓",
      fehler: function (a) {
        if (ketteSauber(R, c.k) && a === rechne(R, c.k)) return "Du hast vorwärts gerechnet. Beim Rätsel geht es rückwärts: Fang bei " + R + " an und nimm die Umkehraufgaben.";
        if (a === schritt(R, rueck[0])) return "Das ist erst der erste Schritt zurück. Jetzt noch die Umkehraufgabe von „" + WORT.name[s1.op] + "“.";
        var falsch2 = [s2, umkehr(s1)];   // letzten Schritt nicht umgekehrt
        if (ketteSauber(R, falsch2) && a === rechne(R, falsch2)) return "Beim Rückwärtsrechnen wird aus „" + WORT.name[s2.op] + "“ die Umkehraufgabe: " + WORT.name[OP[s2.op].um] + ".";
        var falsch1 = [umkehr(s2), s1];   // ersten Schritt nicht umgekehrt
        if (ketteSauber(R, falsch1) && a === rechne(R, falsch1)) return "Beim Rückwärtsrechnen wird aus „" + WORT.name[s1.op] + "“ die Umkehraufgabe: " + WORT.name[OP[s1.op].um] + ".";
        return null;
      },
      // Die Probe mit SEINER Zahl: setzt er sie ein, sieht er selbst, dass es nicht aufgeht.
      probeMit: function (a) {
        if (!(a >= 0) || !ketteSauber(Math.max(1, a), c.k) || a < 1) return null;
        var y = rechne(a, c.k);
        return y === R ? null : "Mach die Probe mit deiner Zahl: " + kette(a, c.k) + " – das ist nicht " + R + ".";
      }
    };
  }

  function aufgabeNachbar(r, v) {
    var p = v.split("-"), op = p[0], art = p[1], richt = p[2];
    var stelle = art === "z" ? 10 : 100;
    for (var versuch = 0; versuch < 400; versuch++) {
      var a = ganz(r, 120, 880);
      if (a % 10 === 0) continue;
      var b = art === "z" ? (r() < 0.5 ? zehner(r, 20, 90) : 100 * ganz(r, 1, 3)) : zehner(r, 20, 90) + (r() < 0.5 ? 100 : 0);
      var e = op === "add" ? a + b : a - b;
      if (e < 101 || e > 999 || e % stelle === 0) continue;
      var klein = Math.floor(e / stelle) * stelle, gross = klein + stelle;
      var loes = richt === "k" ? klein : gross;
      var wort = (richt === "k" ? "kleinere" : "größere") + " Nachbar" + (art === "z" ? "zehner" : "hunderter");
      var wortAkk = (richt === "k" ? "kleineren" : "größeren") + " Nachbar" + (art === "z" ? "zehner" : "hunderter");
      var aKlein = Math.floor(a / stelle) * stelle, aGross = aKlein + stelle;
      var text = "Rechne " + a + (op === "add" ? " + " : " − ") + b + ". Wie heißt der " + wort + " deines Ergebnisses?";
      return {
        typ: "nachbar", v: v, sig: "nachbar|" + v + "|" + a + "|" + b,
        text: text, loesung: loes,
        tipp: "Erst rechnen: " + a + (op === "add" ? " + " : " − ") + b + ". Dann vom ERGEBNIS den " + wortAkk + " suchen.",
        weg: a + (op === "add" ? " + " : " − ") + b + " = " + e + ". " + e + " liegt zwischen " + klein + " und " + gross + ". Der " + wort + " ist ?",
        probe: a + (op === "add" ? " + " : " − ") + b + " = " + e + ", und " + e + " liegt zwischen " + klein + " und " + gross + " ✓",
        fehler: function (x) {
          if (x === e) return "Das ist das Ergebnis der Rechnung. Gefragt ist der " + wort + " davon.";
          if ((x === aKlein || x === aGross) && x !== loes) return "Du hast den Nachbar" + (art === "z" ? "zehner" : "hunderter") + " von " + a + " genommen. Gesucht ist er für dein Ergebnis.";
          if (x === (richt === "k" ? gross : klein)) return "Das ist der " + (richt === "k" ? "größere" : "kleinere") + " Nachbar. Gefragt ist der " + (richt === "k" ? "kleinere" : "größere") + ".";
          var anders = art === "z" ? [Math.floor(e / 100) * 100, Math.floor(e / 100) * 100 + 100] : [Math.floor(e / 10) * 10, Math.floor(e / 10) * 10 + 10];
          if (anders.indexOf(x) >= 0) return "Schau genau hin: gefragt ist der Nachbar" + (art === "z" ? "zehner" : "hunderter") + ".";
          return null;
        }
      };
    }
    return null;
  }

  function aufgabeSach(r, v) {
    var name = wahl(r, NAMEN);
    for (var versuch = 0; versuch < 400; versuch++) {
      var a, b, c, t, loes, weg, probe, tipp, fehler = function () { return null; };
      if (v === "karten") {
        a = zehner(r, 200, 800); b = zehner(r, 30, 300); c = zehner(r, 20, 200);
        if (a - b < 20 || a - b + c > 1000) continue;
        loes = a - b + c;
        t = name + " hat " + a + " Sammelkarten. " + name + " verschenkt " + b + " Karten und bekommt dann " + c + " neue dazu. Wie viele Karten hat " + name + " jetzt?";
        tipp = "Zuerst: Wie viele Karten sind es nach dem Verschenken? Verschenken heißt minus, dazubekommen heißt plus.";
        weg = a + " − " + b + " = " + (a - b) + ", dann " + (a - b) + " + " + c + " = ?";
        probe = "Probe: " + loes + " − " + c + " = " + (a - b) + ", " + (a - b) + " + " + b + " = " + a + " ✓";
        fehler = (function (a, b, c) { return function (x) {
          if (x === a - b - c) return "„Bekommt dazu“ heißt plus, nicht minus.";
          if (x === a + b + c) return "„Verschenkt“ heißt minus: die Karten sind danach weg.";
          if (x === a - b) return "Das ist erst nach dem Verschenken. Es kommen noch " + c + " Karten dazu.";
          return null; }; })(a, b, c);
      } else if (v === "seiten") {
        b = zehner(r, 20, 300);
        loes = b + 2 * b; if (loes > 1000) continue;
        t = name + " liest am Montag " + b + " Seiten und am Dienstag doppelt so viele. Wie viele Seiten sind es an beiden Tagen zusammen?";
        tipp = "Zuerst: Wie viele Seiten am Dienstag? „Doppelt so viele“ heißt · 2. Dann beide Tage zusammenzählen.";
        weg = b + " · 2 = " + (2 * b) + ", dann " + b + " + " + (2 * b) + " = ?";
        probe = "Probe: " + loes + " − " + (2 * b) + " = " + b + " ✓";
        fehler = (function (b) { return function (x) {
          if (x === 2 * b) return "Das sind nur die Seiten vom Dienstag. Gefragt ist: beide Tage zusammen.";
          if (x === b + 2) return "„Doppelt so viele“ heißt · 2, nicht + 2.";
          return null; }; })(b);
      } else if (v === "buecherei") {
        a = 20 * ganz(r, 10, 50); b = zehner(r, 10, a / 2 - 10);
        loes = a / 2 - b; if (loes < 10) continue;
        t = "In der Schulbücherei stehen " + a + " Bücher. Die Hälfte davon sind Sachbücher. " + b + " Sachbücher sind ausgeliehen. Wie viele Sachbücher stehen noch im Regal?";
        tipp = "Zuerst: Wie viele Sachbücher gibt es? „Die Hälfte“ heißt : 2. Dann die ausgeliehenen abziehen.";
        weg = a + " : 2 = " + (a / 2) + ", dann " + (a / 2) + " − " + b + " = ?";
        probe = "Probe: " + loes + " + " + b + " = " + (a / 2) + ", " + (a / 2) + " · 2 = " + a + " ✓";
        fehler = (function (a, b) { return function (x) {
          if (x === a - b) return "Es geht nur um die Sachbücher – das ist die Hälfte von " + a + ".";
          if (x === a / 2) return "Das sind alle Sachbücher. " + b + " davon sind ausgeliehen.";
          return null; }; })(a, b);
      } else if (v === "fahrrad") {
        a = zehner(r, 300, 900); b = zehner(r, 50, a - 100); c = zehner(r, 20, 200);
        loes = a - b - c; if (loes < 10) continue;
        t = "Ein Fahrrad kostet " + a + " Euro. " + name + " hat schon " + b + " Euro gespart. Oma schenkt " + c + " Euro dazu. Wie viel Euro fehlen noch?";
        tipp = "Zuerst: Wie viel Geld ist schon da? Gespartes und Geschenk zusammen. Dann: Was fehlt bis " + a + " Euro?";
        weg = b + " + " + c + " = " + (b + c) + ", dann " + a + " − " + (b + c) + " = ?";
        probe = "Probe: " + (b + c) + " + " + loes + " = " + a + " ✓";
        fehler = (function (a, b, c) { return function (x) {
          if (x === b + c) return "So viel Geld ist schon da. Gefragt ist, was bis " + a + " Euro noch fehlt.";
          if (x === a - b + c) return "Omas Geld kommt zum Gesparten dazu – dann fehlt weniger, nicht mehr.";
          if (x === a - b) return "Oma schenkt noch " + c + " Euro dazu. Dann fehlt weniger.";
          return null; }; })(a, b, c);
      } else if (v === "baecker") {
        a = zehner(r, 200, 900); b = zehner(r, 50, 400); c = zehner(r, 20, 300);
        loes = a - b - c; if (loes < 10) continue;
        t = "Der Bäcker backt am Morgen " + a + " Brötchen. Bis Mittag verkauft er " + b + ", am Nachmittag noch " + c + ". Wie viele Brötchen sind übrig?";
        tipp = "Zuerst: Wie viele sind nach dem Mittag übrig? Verkaufen heißt minus.";
        weg = a + " − " + b + " = " + (a - b) + ", dann " + (a - b) + " − " + c + " = ?";
        probe = "Probe: " + loes + " + " + c + " + " + b + " = " + a + " ✓";
        fehler = (function (a, b, c) { return function (x) {
          if (x === a - b) return "Das ist erst bis Mittag. Am Nachmittag verkauft er noch " + c + ".";
          if (x === a - b + c) return "Auch am Nachmittag wird verkauft – das heißt minus.";
          if (x === b + c) return "So viele hat er verkauft. Gefragt ist, wie viele übrig sind.";
          return null; }; })(a, b, c);
      } else if (v === "kino") {
        var reihen = ganz(r, 4, 10), je = ganz(r, 5, 10);
        a = reihen * je; b = ganz(r, 5, a - 5);
        loes = a - b;
        t = "Ein kleines Kino hat " + reihen + " Reihen mit je " + je + " Plätzen. " + b + " Plätze sind besetzt. Wie viele Plätze sind noch frei?";
        tipp = "„Je“ heißt malnehmen: " + reihen + " · " + je + ". Dann die besetzten abziehen.";
        weg = reihen + " · " + je + " = " + a + ", dann " + a + " − " + b + " = ?";
        probe = "Probe: " + loes + " + " + b + " = " + a + " ✓";
        fehler = (function (a, b, reihen, je) { return function (x) {
          if (x === a) return "So viele Plätze hat das Kino. " + b + " sind besetzt.";
          if (x === reihen + je - b || x === reihen + je) return "„Je“ heißt malnehmen, nicht plus.";
          return null; }; })(a, b, reihen, je);
      } else if (v === "teilen") {
        var kinder = ganz(r, 2, 9), pro = ganz(r, 3, 10);
        a = kinder * pro; b = ganz(r, 1, pro - 1);
        loes = pro - b;
        t = kinder + " Kinder teilen sich " + a + " Euro gerecht. Jedes Kind gibt davon " + b + " Euro für ein Eis aus. Wie viel Euro hat jedes Kind dann noch?";
        tipp = "Zuerst: Wie viel bekommt jedes Kind? „Gerecht teilen“ heißt geteilt: " + a + " : " + kinder + ".";
        weg = a + " : " + kinder + " = " + pro + ", dann " + pro + " − " + b + " = ?";
        probe = "Probe: " + loes + " + " + b + " = " + pro + ", " + pro + " · " + kinder + " = " + a + " ✓";
        fehler = (function (a, b, pro) { return function (x) {
          if (x === pro) return "So viel bekommt jedes Kind. Das Eis kostet noch " + b + " Euro.";
          if (x === a - b) return "Erst gerecht teilen, dann für ein Kind das Eis abziehen.";
          return null; }; })(a, b, pro);
      } else return null;
      if (!sauber(loes)) continue;
      return { typ: "sach", v: v, sig: "sach|" + v + "|" + t, text: t, loesung: loes, tipp: tipp, weg: weg, probe: probe, fehler: fehler };
    }
    return null;
  }

  function aufgabeErgaenzen(r, v) {
    for (var versuch = 0; versuch < 400; versuch++) {
      var a, z, t, loes, weg, probe, tipp, fehler;
      if (v === "add") {
        z = zehner(r, 200, 1000); a = zehner(r, 30, z - 30); loes = z - a;
        t = "Welche Zahl musst du zu " + a + " addieren, damit " + z + " herauskommt?";
        tipp = "Gesucht ist, was fehlt. Umkehraufgabe: " + z + " − " + a + ".";
        weg = z + " − " + a + " = ?"; probe = "Probe: " + a + " + " + loes + " = " + z + " ✓";
        fehler = (function (a, z) { return function (x) { if (x === a + z) return "Du hast zusammengezählt. Gesucht ist, was zu " + a + " noch fehlt bis " + z + "."; return null; }; })(a, z);
      } else if (v === "sub") {
        z = zehner(r, 50, 700); a = zehner(r, 20, 300); loes = z + a;
        t = "Von welcher Zahl musst du " + a + " subtrahieren, damit " + z + " herauskommt?";
        tipp = "Rechne rückwärts: Die Umkehraufgabe von minus ist plus.";
        weg = z + " + " + a + " = ?"; probe = "Probe: " + loes + " − " + a + " = " + z + " ✓";
        fehler = (function (a, z) { return function (x) { if (x === z - a) return "Die Umkehraufgabe von minus ist plus: " + z + " + " + a + "."; return null; }; })(a, z);
      } else if (v === "mul") {
        var f = ganz(r, 3, 10), q = ganz(r, 3, 10); z = f * q; loes = q; a = f;
        t = "Mit welcher Zahl musst du " + f + " multiplizieren, damit " + z + " herauskommt?";
        tipp = "Welche Malaufgabe passt? " + f + " · ? = " + z;
        weg = z + " : " + f + " = ?"; probe = "Probe: " + f + " · " + q + " = " + z + " ✓";
        fehler = (function (f, z) { return function (x) { if (x === z - f) return "Gesucht ist eine Malaufgabe: " + f + " · ? = " + z + "."; return null; }; })(f, z);
      } else if (v === "ver") {
        var d = 20 * ganz(r, 6, 50); a = zehner(r, 20, 300); z = d + a; loes = d / 2;
        if (z > 1000) continue;
        t = "Ich verdopple eine Zahl und addiere dann " + a + ". Das Ergebnis ist " + z + ". Wie heißt die Zahl?";
        tipp = "Rechne rückwärts: zuerst " + z + " − " + a + ", dann halbieren.";
        weg = z + " − " + a + " = " + d + ", dann " + d + " : 2 = ?"; probe = "Probe: " + loes + " · 2 = " + d + ", " + d + " + " + a + " = " + z + " ✓";
        fehler = (function (a, z, d) { return function (x) {
          if (x === d) return "Das ist das Doppelte. Jetzt noch halbieren.";
          if (x === (z + a) / 2 || x === z / 2 - a) return "Rückwärts heißt: erst " + a + " subtrahieren, dann halbieren.";
          return null; }; })(a, z, d);
      } else return null;
      if (!sauber(loes) || loes === a) continue;
      return { typ: "ergaenzen", v: v, sig: "ergaenzen|" + v + "|" + a + "|" + z, text: t, loesung: loes, tipp: tipp, weg: weg, probe: probe, fehler: fehler };
    }
    return null;
  }

  var BAUER = { vor2: aufgabeVor2, rueck2: aufgabeRueck2, nachbar: aufgabeNachbar, sach: aufgabeSach, ergaenzen: aufgabeErgaenzen };
  var ARTNAME = {
    vor2: "Rechenwörter vorwärts", rueck2: "Zahlenrätsel rückwärts", nachbar: "Nachbarzehner und -hunderter",
    sach: "Sachaufgabe", ergaenzen: "Umkehraufgabe"
  };

  function beschreibung(typ, v) {
    if (typ === "vor2" || typ === "rueck2") return ARTNAME[typ] + ": " + v.split("-").map(function (o) { return WORT.name[o]; }).join(", dann ");
    if (typ === "nachbar") { var p = v.split("-"); return (p[2] === "k" ? "kleinerer " : "größerer ") + "Nachbar" + (p[1] === "z" ? "zehner" : "hunderter") + " nach " + (p[0] === "add" ? "Plus" : "Minus"); }
    if (typ === "sach") return "Sachaufgabe (" + ({ karten: "Sammelkarten", seiten: "doppelt so viele", buecherei: "die Hälfte", fahrrad: "was fehlt noch", baecker: "zweimal weniger", kino: "je", teilen: "gerecht teilen" }[v] || v) + ")";
    if (typ === "ergaenzen") return "Umkehraufgabe (" + ({ add: "was fehlt bis …", sub: "von welcher Zahl …", mul: "mit welcher Zahl mal …", ver: "verdoppeln und addieren rückwärts" }[v] || v) + ")";
    return typ;
  }

  function bauen(r, typ, v, benutzt, schon) {
    for (var i = 0; i < 60; i++) {
      var var_ = v || wahl(r, VARIANTEN[typ]);
      var a = BAUER[typ](r, var_);
      if (!a) continue;
      var fp = kurz(a.sig);
      if (benutzt[fp] || schon[fp]) continue;
      a.fp = fp;
      return a;
    }
    return null;
  }

  /* Die Textaufgaben eines Tages: zuerst die Fehlerarten von früher (gleiche
     Art, neue Zahlen), dann die neuen. Jeden Tag ein Vorwärts- und ein
     Rückwärts-Rätsel (genau dort lagen Pauls Fehler am 30.09. und 04.10.2026),
     dazu reihum die übrigen Arten. */
  function rundeText(stand, datum) {
    stand = standPruefen(stand);
    var r = zufall("text|" + datum);
    var benutzt = {}; stand.benutzt.forEach(function (f) { benutzt[f] = 1; });
    var schon = {}, aus = [];
    var offen = Object.keys(stand.toffen).sort(function (x, y) { return (stand.toffen[x].d || "") < (stand.toffen[y].d || "") ? -1 : 1; });
    offen.forEach(function (id) {
      var o = stand.toffen[id];
      if (!BAUER[o.typ]) return;
      var a = bauen(r, o.typ, o.v, benutzt, schon);
      if (!a) return;
      a.wieder = id; schon[a.fp] = 1; aus.push(a);
    });
    var neu = Math.max(EIN.textNeuMin, Math.min(EIN.textNeu, 5 - offen.length));
    var tagNr = Math.floor(Date.UTC(+datum.slice(0, 4), +datum.slice(5, 7) - 1, +datum.slice(8, 10)) / 864e5);
    var rest = [["nachbar", "sach"], ["sach", "ergaenzen"], ["ergaenzen", "nachbar"]][tagNr % 3];
    var arten = ["vor2", "rueck2"].concat(rest).slice(0, neu);
    var neue = [];
    arten.forEach(function (typ) {
      var a = bauen(r, typ, null, benutzt, schon);
      if (a) { schon[a.fp] = 1; neue.push(a); }
    });
    // Die Runde beginnt mit dem Vorwärts-Rätsel (das leichteste), Wiederholer stehen dazwischen.
    return verteilen(r, neue, mischen(r, aus));
  }

  function buchenText(stand, datum, aufgaben, erg) {
    stand = standPruefen(stand);
    var richtig = 0, gesamt = 0;
    aufgaben.forEach(function (a, i) {
      if (!(a.fp in erg)) return;
      gesamt++;
      var ok = !!erg[a.fp];
      if (ok) richtig++;
      if (stand.benutzt.indexOf(a.fp) < 0) stand.benutzt.push(a.fp);
      if (a.wieder && stand.toffen[a.wieder]) {
        var o = stand.toffen[a.wieder];
        if (!ok) { o.s = 0; o.d = datum; }
        else if (o.d !== datum) {
          o.s = (o.s || 0) + 1; o.d = datum;
          if (o.s >= EIN.sitztNach) { delete stand.toffen[a.wieder]; stand.sitzt.push({ k: "t:" + a.typ + ":" + a.v, d: datum }); }
        }
      } else if (!ok) {
        // Dieselbe Fehlerart nur einmal führen.
        var gleich = Object.keys(stand.toffen).filter(function (id) { return stand.toffen[id].typ === a.typ && stand.toffen[id].v === a.v; })[0];
        if (gleich) { stand.toffen[gleich].s = 0; stand.toffen[gleich].d = datum; }
        else stand.toffen[datum + "#" + i] = { typ: a.typ, v: a.v, s: 0, d: datum };
      }
    });
    if (stand.benutzt.length > EIN.benutztMax) stand.benutzt = stand.benutzt.slice(-EIN.benutztMax);
    tagEintragen(stand, datum, "t", [richtig, gesamt]);
    return stand;
  }

  // Für Eingaben ohne bekannten Denkfehler: Paul vergleicht selbst (Probe mit seiner Zahl).
  function rueckmeldung(a, x) {
    var f = a.fehler ? a.fehler(x) : null;
    if (f) return f;
    if (a.probeMit) { var p = a.probeMit(x); if (p) return p; }
    if (x > a.loesung * 5 && a.loesung >= 10) return "Deine Zahl ist viel zu groß. Lies die Aufgabe noch einmal.";
    return null;
  }

  var M = {
    EIN: EIN, ALLE: ALLE, VARIANTEN: VARIANTEN, ARTNAME: ARTNAME,
    heuteIso: heuteIso, leererStand: leererStand, standPruefen: standPruefen,
    einmaleins: einmaleins, tipp1x1: tipp1x1, hilfe1x1: hilfe1x1, neueAnzahl: neueAnzahl,
    rundeEinmaleins: rundeEinmaleins, buchenEinmaleins: buchenEinmaleins,
    rundeText: rundeText, buchenText: buchenText, rueckmeldung: rueckmeldung,
    beschreibung: beschreibung, bauer: BAUER, zufall: zufall, kurz: kurz,
    rechne: rechne, ketteSauber: ketteSauber
  };
  if (typeof module === "object" && module.exports) module.exports = M;
  else wurzel.TRMotor = M;
})(typeof window !== "undefined" ? window : this);
