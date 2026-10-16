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
 *   D  2 Sachaufgaben zum neuen Stoff.
 * Jede Aufgabe ist ein Schlüssel ("mal:7x80", "rest:17:5", "tl:36" …); Text, Lösung, Hilfe und
 * Bestätigung kommen aus demselben Schlüssel. Tageszufall aus dem Datum: dieselbe Runde nach Neuladen.
 * Hinweise ohne Begründungssätze (Frau Sy erlaubt kein "w-e-i-l"), keine Fragen nach dem Grund.
 */
(function (wurzel) {
  "use strict";

  var EIN = {
    an: true,              // Hauptschalter
    bis: "2026-10-19",     // letzter Übungstag (Tag der Probe), danach still aus
    frisch: 16,            // A: frische Aufgaben je Runde (16.10.2026 verdoppelt, Denny: „Paul war immer zu schnell fertig“)
    sach: 4,               // D: Sachaufgaben je Runde (vorher 2)
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
    schreibProTag: 3       // KV: höchstens drei Schreibvorgänge am Tag
  };
  var THEMEN = ["mal", "teil", "rest", "punkt", "teiler"];
  var NAME = {
    mal: "Mal mit Zehnerzahlen", teil: "Teilen durch Zehnerzahlen", rest: "Teilen mit Rest",
    punkt: "Punkt vor Strich", teiler: "Teiler und Vielfache", sach: "Sachaufgabe",
    rech: "Rechnen", raet: "Zahlenrätsel"
  };
  var MERKMAL = {
    mal: "probe mal mit zehnerzahlen", teil: "probe teilen durch zehnerzahlen", rest: "probe teilen mit rest",
    punkt: "probe punkt vor strich", teiler: "probe teiler und vielfache", sach: "probe sachaufgabe",
    rech: "probe rechnen", raet: "probe zahlenraetsel"
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
    } else if ((m = /^raet:([mpw]):(\d{1,4}):(\d{1,4})$/.exec(k))) {
      /* Zahlenrätsel vom Blatt (Lehrerin, 16.10.2026): „Meine Zahl um 18 verkleinert ergibt 50.“ */
      var ra = +m[2], rc = +m[3], rw = m[1];
      var rl = rw === "m" ? rc + ra : rw === "p" ? rc - ra : ra - rc;
      if (rl < 0 || rl > 10000) return null;
      x = { art: "raet", typ: "zahl", wie: rw, a: ra, c: rc, frage: "?", loesung: rl,
        text: rw === "m" ? "Ich nehme von meiner Zahl " + ra + " weg. Dann kommt " + rc + " heraus. Wie heißt meine Zahl?"
          : rw === "p" ? "Ich zähle zu meiner Zahl " + ra + " dazu. Dann kommt " + rc + " heraus. Wie heißt meine Zahl?"
          : "Ich nehme von " + ra + " meine Zahl weg. Dann bleibt " + rc + " übrig. Wie heißt meine Zahl?" };
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
  function geschwister(k, n) {
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
      } else if ((m = /^raet:([mpw]):(\d+):(\d+)$/.exec(k))) {
        var a2 = wieZahl(+m[2], r), c2 = wieZahl(+m[3], r);
        if (m[1] === "w" && c2 >= a2) c2 = Math.max(1, a2 - wieZahl(+m[3], r) % a2);
        kand = "raet:" + m[1] + ":" + a2 + ":" + c2;
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
    if (x.art === "rech" || x.art === "punkt") {
      var b = k.slice(k.indexOf(":") + 1);
      return x.art + ":" + b.replace(/\d+/g, function (z) { return "s" + String(ohneNullen(+z)).length + "n" + nullen(+z); });
    }
    if (x.art === "raet") return "raet:" + x.wie;
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
    stellen: [{ k: "rech:801-563+347", blatt: "he331mspzq" }, { k: "tl:21", blatt: "oewbd88522" }, { k: "teil:440:10", blatt: "y3hm4vzkrj" },
      { k: "teil:320:40", blatt: "y3hm4vzkrj" }, { k: "teil:240:40", blatt: "y3hm4vzkrj" }, { k: "teil:280:70", blatt: "y3hm4vzkrj" },
      { k: "teil:420:70", blatt: "y3hm4vzkrj" }, { k: "teil:360:60", blatt: "y3hm4vzkrj" }, { k: "teil:240:80", blatt: "y3hm4vzkrj" },
      { k: "teil:400:80", blatt: "y3hm4vzkrj" }],
    quellen: [{ k: "raet:m:18:50", blatt: "he331mspzq" }, { k: "raet:p:56:100", blatt: "he331mspzq" }, { k: "raet:m:27:320", blatt: "he331mspzq" },
      { k: "rech:801-563+347", blatt: "he331mspzq" }, { k: "tl:12", blatt: "r7ung8g7u6" }, { k: "tl:56", blatt: "r7ung8g7u6" }, { k: "tl:24", blatt: "r7ung8g7u6" },
      { k: "rest:52:5", blatt: "5tkzva9rss" }, { k: "rest:86:5", blatt: "5tkzva9rss" }, { k: "rest:103:5", blatt: "5tkzva9rss" },
      { k: "tl:21", blatt: "oewbd88522" }, { k: "tl:28", blatt: "oewbd88522" }, { k: "tl:32", blatt: "oewbd88522" },
      { k: "malp:240=60x?", blatt: "8o6ufnxur4" }, { k: "rest:830:90", blatt: "8o6ufnxur4" }, { k: "pkt:80*7-348", blatt: "8o6ufnxur4" }],
    stand: "2026-10-16"
  };
  function inSaat(k) { for (var i = 0; i < SAAT.length; i++) if (SAAT[i].v.indexOf(k) >= 0) return true; return false; }
  function blattPruefen(d) {
    var aus = { stellen: [], quellen: [] }, schon = {};
    if (!d || typeof d !== "object") return aus;
    (Array.isArray(d.stellen) ? d.stellen : []).forEach(function (e) {
      var k = e && String(e.k || "");
      if (!k || schon[k] || !aufgabe(k) || inSaat(k) || aus.stellen.length >= 12) return;
      var fo = form(k); schon[fo] = (schon[fo] || 0) + 1; if (schon[fo] > 2) return;   // höchstens 2 je Form
      schon[k] = 1; aus.stellen.push({ k: k, blatt: String(e.blatt || "").slice(0, 20) });
    });
    var q = {};
    (Array.isArray(d.quellen) ? d.quellen : []).forEach(function (e) {
      var k = e && String(e.k || "");
      if (!k || q[k] || !aufgabe(k) || aufgabe(k).art === "sach" || aus.quellen.length >= 40) return;
      q[k] = 1; aus.quellen.push({ k: k, blatt: String(e.blatt || "").slice(0, 20) });
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

  /* ---------- Stand ---------- */
  function leererStand() {
    var th = {};
    THEMEN.forEach(function (t) { th[t] = { s: 0, r: 0, f: START_F[t] }; });
    var kiste = {};
    SAAT.forEach(function (e, i) { kiste[e.k] = { s: 0, d: "", z: 0, zd: "", o: i }; });
    return { v: 1, themen: th, kiste: kiste, o: SAAT.length, weg: [], benutzt: [], tage: {}, heute: { d: "", t1: 0, t2: 0, n: 0 }, schreib: { d: "", n: 0 } };
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
    blatt = blatt ? blattPruefen(blatt) : { stellen: [], quellen: [] };
    var r = zufall("ps|" + heute + "|" + nr), belegt = {}, teil1 = [], teil2 = [];
    if (nr === 0) {
      var K = kistenEintraege(stand, blatt), kl = kistenListe(stand, blatt), n1 = 0, n2 = 0;
      kl.forEach(function (kk) {
        var k = kistenAufgabe(kk, K[kk]), x = aufgabe(k);
        if (belegt[k]) return;
        if (x.art === "sach") { if (n2 < 1) { teil2.push({ k: k, kk: kk }); belegt[k] = 1; n2++; } return; }
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
    var s = (e || []).map(Number).sort(function (a, b) { return a - b; });
    return s.join(",") === x.loesung.join(",");
  }
  function loesungText(x) {
    if (x.typ === "rest") return x.loesung.q + " R " + x.loesung.r;
    if (x.typ === "tippen") return x.loesung.join(", ");
    return String(x.loesung);
  }
  function eingabeText(x, e) {
    if (x.typ === "rest") return (e && e.q !== "" ? e.q : "?") + " R " + (e && e.r !== "" ? e.r : "?");
    if (x.typ === "tippen") return (e || []).slice().sort(function (a, b) { return a - b; }).join(", ");
    return String(e);
  }

  /* ---------- Denkfehler und Hilfe in Stufen (Kapitel 044) ----------
   * Erst der Denkfehler, wenn er sich erkennen lässt, dann Stufe 1 (Tipp ohne Ergebnis),
   * ab dem zweiten Fehlversuch Stufe 2 (Rechenweg, die letzte Lücke tippt Paul selbst),
   * ab dem vierten die Lösung zum Abtippen, damit er nie feststeckt. */
  function denkfehler(x, e) {
    var v, s;
    if (e === "" || e == null) return "";
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
    if (x.art === "raet") {
      v = +e;
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
      case "raet":
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
      case "raet":
        return "Schau: " + (x.wie === "m" ? x.c + " + " + x.a : x.wie === "p" ? x.c + " − " + x.a : x.a + " − " + x.c) + " = ?" + t;
    }
    return "";
  }
  function hilfe(x, versuche, e) {
    if (versuche >= 4) return "Die Lösung ist " + loesungText(x) + (x.typ === "tippen" ? ". Tippe genau diese Zahlen an." : ". Tipp sie jetzt ein.");
    var d = denkfehler(x, e), h = versuche >= 2 ? stufe2(x) : stufe1(x);
    return (d ? d + " " : "") + h;
  }
  function bestaetigung(x) {
    switch (x.art) {
      case "punkt": return x.frage.replace(" = ?", "") + " = " + x.rest(x.pv) + " = " + x.loesung;
      case "teiler": return (x.wovon === "teiler" ? "Teiler von " + x.n + ": " : "Vielfache von " + x.d + ": ") + x.loesung.join(", ");
      case "sach": return x.rechnung + " = " + loesungText(x) + (x.typ === "zahl" && x.einheit === "€" ? " €" : "");
      case "rech": return x.frage.replace("?", String(x.loesung));
      case "raet": return "Meine Zahl ist " + x.loesung;
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
    geschwister: geschwister, form: form, blattPruefen: blattPruefen, BLATT_STAND: BLATT_STAND, kistenEintraege: kistenEintraege,
    stimmt: stimmt, loesungText: loesungText, eingabeText: eingabeText,
    denkfehler: denkfehler, hilfe: hilfe, bestaetigung: bestaetigung,
    leererStand: leererStand, standPruefen: standPruefen, heuteStand: heuteStand, buchen: buchen,
    darfSchreiben: darfSchreiben, geschrieben: geschrieben, teilerVon: teilerVon
  };
  if (typeof module !== "undefined" && module.exports) module.exports = M;
  else wurzel.PSMotor = M;
})(typeof window !== "undefined" ? window : this);
