/* Generalprobe Mathe "Einmaleins und Teilen" (13.10.2026, Dennys Wahl C) – reine Logik, Browser und Node.
 *
 * Anlass: Paul schreibt am Montag, 19.10.2026 die Mathe-Probe "Einmaleins und Teilen".
 * Aufbau wie sein Blatt vom 13.10.2026 "Mal- und Geteiltaufgaben": 7 Teile, 15 Aufgaben.
 * Jedes Blatt kommt aus einer Saat: gleiche Saat = gleiches Blatt (Neuladen), neue Saat = neue Zahlen.
 * Keine Sofort-Korrektur: geprueft wird erst am Ende (pruefe), dann Rueckschau je Thema ohne Note
 * und ohne Punkte. Zweiter Versuch mit Hilfe in Stufen (hilfe(a, 1|2)), danach der Rechenweg (weg).
 * Hinweise ohne Begruendungssaetze und ohne Warum-Fragen (Frau Sy, Kapitel 103).
 * Pruefen: node pruefe-generalprobe-mathe.mjs
 */
(function (wurzel) {
  "use strict";

  /* merkmal = dieselben Namen wie die Tagesrunde Probenstoff (Kapitel 121), damit der Elternbereich
   * "Was sitzt"/"Woran es hakt" je Thema ueber beide Seiten zusammenzaehlt. */
  var THEMEN = [
    { key: "mal",    merkmal: "probe mal mit zehnerzahlen", name: "Mal mit Zehnerzahlen",      auftrag: "Rechne. Denk an die Nullen.", zahl: 2 },
    { key: "platz",  merkmal: "probe platzhalter", name: "Platzhalter finden",        auftrag: "Finde die fehlende Zahl.", zahl: 2 },
    { key: "zehner", merkmal: "probe teilen durch zehnerzahlen", name: "Durch Zehnerzahlen teilen", auftrag: "Rechne.", zahl: 2 },
    { key: "rest",   merkmal: "probe teilen mit rest", name: "Teilen mit Rest",           auftrag: "Rechne. Schreib den Rest ins Feld hinter R.", zahl: 3 },
    { key: "pvs",    merkmal: "probe punkt vor strich", name: "Punkt vor Strich",          auftrag: "Rechne. Punktrechnung geht vor Strichrechnung.", zahl: 3 },
    { key: "teiler", merkmal: "probe teiler und vielfache", name: "Teiler finden",             auftrag: "Tippe alle Teiler an.", zahl: 1 },
    { key: "sach",   merkmal: "probe sachaufgabe", name: "Sachaufgaben",              auftrag: "Lies genau und rechne. Ergänze die Antwort.", zahl: 2 }
  ];
  var THEMA = {}; THEMEN.forEach(function (t) { THEMA[t.key] = t; });
  var TEILER_ZAHLEN = [12, 15, 16, 18, 20, 24, 27, 28, 30, 32, 36];

  /* ---------- Zufall mit Saat (mulberry32) ---------- */
  function zufall(saat) {
    var s = (saat >>> 0) || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function zahl(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }
  function eins(r, liste) { return liste[Math.floor(r() * liste.length)]; }
  function neueSaat() { return (Date.now() ^ Math.floor(Math.random() * 4294967296)) >>> 0; }

  function teilerVon(n) { var t = []; for (var i = 1; i <= n; i++) if (n % i === 0) t.push(i); return t; }
  function reihe(d) { return d + "er-Reihe"; }

  /* Felder einer Aufgabe: [{name, vor, nach}] - vor/nach ist der Text um das Feld. */
  function feld(name, vor, nach) { return { name: name, vor: vor || "", nach: nach || "" }; }

  /* ---------- 1. Mal mit Zehnerzahlen ---------- */
  function malAufgabe(r, variante, schon) {
    for (var v = 0; v < 50; v++) {
      var a = zahl(r, 3, 9), b = zahl(r, 2, 9), stellen = variante === 2 ? 100 : 10;
      var k = a + "x" + b; if (schon[k]) continue; schon[k] = 1;
      var gross = b * stellen, links = variante === 1 ? gross : a, rechts = variante === 1 ? a : gross;
      return {
        thema: "mal", art: "zahl",
        text: links + " · " + rechts,
        felder: [feld("e", links + " · " + rechts + " = ")],
        loesung: { e: a * gross },
        klein: { a: a, b: b, stellen: stellen, links: links, rechts: rechts },
        weg: a + " · " + b + " = " + (a * b) + ", also " + links + " · " + rechts + " = " + (a * gross) + "."
      };
    }
  }

  /* ---------- 2. Platzhalter ---------- */
  function platzAufgabe(r, variante, schon) {
    for (var v = 0; v < 50; v++) {
      var a = zahl(r, 3, 9), b = zahl(r, 2, 9), zehn = b * 10, p = a * zehn;
      var k = a + "x" + b; if (schon[k]) continue; schon[k] = 1;
      // Variante 0: "240 = ▢ · 3" (Zehnerzahl fehlt) · 1: "720 = 9 · ▢" (Zehnerzahl fehlt) · 2: "240 = 80 · ▢" (Einer fehlt)
      var fehlt, bekannt, vor, nach;
      if (variante === 0) { fehlt = zehn; bekannt = a; vor = p + " = "; nach = " · " + a; }
      else if (variante === 1) { fehlt = zehn; bekannt = a; vor = p + " = " + a + " · "; nach = ""; }
      else { fehlt = a; bekannt = zehn; vor = p + " = " + zehn + " · "; nach = ""; }
      return {
        thema: "platz", art: "zahl",
        text: vor + "▢" + nach,
        felder: [feld("e", vor, nach)],
        loesung: { e: fehlt },
        klein: { p: p, bekannt: bekannt, fehlt: fehlt, a: a, b: b },
        weg: fehlt + " · " + bekannt + " = " + p + ". Die fehlende Zahl ist " + fehlt + "."
      };
    }
  }

  /* ---------- 3. Durch Zehnerzahlen teilen ---------- */
  function zehnerAufgabe(r, variante, schon) {
    for (var v = 0; v < 50; v++) {
      var a = zahl(r, 3, 9), b = zahl(r, 2, 9), k = variante + ":" + a + "x" + b;
      if (schon[k]) continue; schon[k] = 1;
      var n, d, e;
      if (variante === 0) { n = (a * 10 + b) * 10; d = 10; e = a * 10 + b; }         // 730 : 10
      else if (variante === 1) { n = a * b * 10; d = b * 10; e = a; }               // 320 : 80
      else { n = a * b * 10; d = b; e = a * 10; }                                   // 450 : 9
      return {
        thema: "zehner", art: "zahl",
        text: n + " : " + d,
        felder: [feld("e", n + " : " + d + " = ")],
        loesung: { e: e },
        klein: { n: n, d: d, variante: variante, a: a, b: b },
        weg: variante === 0 ? "Beim Teilen durch 10 fällt eine Null weg: " + n + " : 10 = " + e + "."
          : variante === 1 ? "Bei beiden Zahlen eine Null streichen: " + (n / 10) + " : " + b + " = " + e + ", also " + n + " : " + d + " = " + e + "."
          : (n / 10) + " : " + d + " = " + a + ", dann die Null anhängen: " + n + " : " + d + " = " + e + "."
      };
    }
  }

  /* ---------- 4. Teilen mit Rest ---------- */
  function restAufgabe(r, variante, schon) {
    for (var v = 0; v < 80; v++) {
      var n, d, q, rest, info = { variante: variante };
      if (variante === 0) {                       // 47 : 6 = 7 R 5
        d = zahl(r, 3, 9); q = zahl(r, 3, 9); rest = zahl(r, 1, d - 1); n = q * d + rest;
      } else if (variante === 1) {                // 830 : 90 = 9 R 20
        var D = zahl(r, 3, 9); d = D * 10; q = zahl(r, 2, 9); rest = zahl(r, 1, D - 1) * 10; n = q * d + rest;
        if (n > 990) continue;
      } else {                                    // 230 : 7 = 32 R 6 (210 : 7 und 20 : 7)
        d = zahl(r, 3, 9); n = zahl(r, 2 * d + 1, 10 * d - 1) * 10;
        q = Math.floor(n / d); rest = n % d;
        if (q < 12 || q > 99 || rest === 0 || q % 10 === 0) continue;
        info.teil = Math.floor(q / 10) * 10 * d;  // 210
      }
      var k = n + ":" + d; if (schon[k]) continue; schon[k] = 1;
      info.n = n; info.d = d;
      return {
        thema: "rest", art: "rest",
        text: n + " : " + d,
        felder: [feld("e", n + " : " + d + " = "), feld("r", "R ")],
        loesung: { e: q, r: rest },
        klein: info,
        weg: variante === 2
          ? info.teil + " : " + d + " = " + (Math.floor(q / 10) * 10) + " und " + (n - info.teil) + " : " + d + " = " + (q % 10) + " R " + rest + ". Zusammen: " + n + " : " + d + " = " + q + " R " + rest + "."
          : q + " · " + d + " = " + (q * d) + ". Bis " + n + " fehlen noch " + rest + ". Also " + n + " : " + d + " = " + q + " R " + rest + "."
      };
    }
  }

  /* ---------- 5. Punkt vor Strich ---------- */
  function pvsAufgabe(r, variante, schon) {
    for (var v = 0; v < 80; v++) {
      var a, b, c, text, e, zuerst, zwischen, falschLR, schritt2;
      if (variante === 0) {                       // 6 · 70 + 14   oder  14 + 6 · 70
        a = zahl(r, 3, 9); b = zahl(r, 2, 9) * 10; c = zahl(r, 11, 99);
        var vorn = r() < 0.5;
        zwischen = a * b; e = zwischen + c; if (e > 1000) continue;
        text = vorn ? c + " + " + a + " · " + b : a + " · " + b + " + " + c;
        zuerst = a + " · " + b; schritt2 = vorn ? c + " + " + zwischen : zwischen + " + " + c;
        falschLR = vorn ? (c + a) * b : e;
      } else if (variante === 1) {                // 8 · 90 − 38
        a = zahl(r, 3, 9); b = zahl(r, 2, 9) * 10; zwischen = a * b; c = zahl(r, 11, Math.min(99, zwischen - 20));
        e = zwischen - c; if (e <= 0) continue;
        text = a + " · " + b + " − " + c; zuerst = a + " · " + b; schritt2 = zwischen + " − " + c; falschLR = e;
      } else {                                    // 60 − 40 : 5  oder  50 − 3 · 9
        if (r() < 0.5) {
          var dv = zahl(r, 2, 9), qv = zahl(r, 2, 9); b = dv * qv * (r() < 0.5 ? 10 : 1); zwischen = b / dv;
          a = zahl(r, Math.ceil((zwischen + 5) / 10), 9) * 10;
          e = a - zwischen; if (e <= 0) continue;
          text = a + " − " + b + " : " + dv; zuerst = b + " : " + dv; schritt2 = a + " − " + zwischen;
          falschLR = (a - b) / dv; if (a - b <= 0 || (a - b) % dv) falschLR = null;
        } else {
          var x = zahl(r, 3, 9), y = zahl(r, 3, 9); zwischen = x * y;
          a = zahl(r, Math.ceil((zwischen + 5) / 10), 10) * 10;
          e = a - zwischen; if (e <= 0) continue;
          text = a + " − " + x + " · " + y; zuerst = x + " · " + y; schritt2 = a + " − " + zwischen; falschLR = (a - x) * y;
        }
      }
      if (schon[text] || e === zwischen) continue; schon[text] = 1;   // e = Zwischenergebnis wuerde die Hilfe 2 zur Loesung machen
      return {
        thema: "pvs", art: "zahl",
        text: text,
        felder: [feld("e", text + " = ")],
        loesung: { e: e },
        klein: { zuerst: zuerst, zwischen: zwischen, schritt2: schritt2, falschLR: falschLR === e ? null : falschLR },
        weg: "Zuerst " + zuerst + " = " + zwischen + ". Dann " + schritt2 + " = " + e + "."
      };
    }
  }

  /* ---------- 6. Teiler ---------- */
  function teilerAufgabe(r) {
    var n = eins(r, TEILER_ZAHLEN), t = teilerVon(n);
    return {
      thema: "teiler", art: "teiler",
      text: "Teiler von " + n,
      felder: [feld("t", "Alle Teiler von " + n + ":")],
      loesung: { t: t },
      klein: { n: n, bis: n },
      weg: "Die Teiler von " + n + " sind " + t.join(", ") + "."
    };
  }

  /* ---------- 7. Sachaufgaben ---------- */
  var SACH_REST = [
    { t: function (n, d) { return n + " Kinder machen eine Bootsfahrt. In jedes Boot passen " + d + " Kinder."; },
      frage: "Wie viele Boote sind ganz voll? Wie viele Kinder bleiben übrig?",
      a1: ["", " Boote sind ganz voll."], a2: ["", " Kinder bleiben übrig."], signal: "In jedes Boot passen gleich viele: Das heißt teilen." },
    { t: function (n, d) { return "Oma hat " + n + " Eier. In eine Schachtel passen " + d + " Eier."; },
      frage: "Wie viele Schachteln werden voll? Wie viele Eier bleiben übrig?",
      a1: ["", " Schachteln werden voll."], a2: ["", " Eier bleiben übrig."], signal: "In eine Schachtel passen gleich viele: Das heißt teilen." },
    { t: function (n, d) { return "Die Klasse hat " + n + " Buntstifte. Jedes Kind am Gruppentisch bekommt " + d + " Stifte."; },
      frage: "Wie viele Kinder bekommen Stifte? Wie viele Stifte bleiben übrig?",
      a1: ["", " Kinder bekommen Stifte."], a2: ["", " Stifte bleiben übrig."], signal: "„Jedes Kind bekommt gleich viele“: Das heißt teilen." },
    { t: function (n, d) { return "Im Fußballverein sind " + n + " Kinder. Für ein Spiel braucht man Mannschaften mit je " + d + " Kindern."; },
      frage: "Wie viele Mannschaften gibt es? Wie viele Kinder bleiben übrig?",
      a1: ["Es gibt ", " Mannschaften."], a2: ["", " Kinder bleiben übrig."], signal: "„Mannschaften mit je … Kindern“: Das heißt teilen." }
  ];
  var SACH_RECHNEN = [
    { art: "mal", t: function (a, z) { return "Eine Kinokarte kostet " + a + " €. Für einen Ausflug kauft die Schule " + z + " Karten."; },
      frage: "Wie viel kosten alle Karten zusammen?", a: ["Alle Karten kosten ", " €."],
      signal: "Viele gleiche Karten: Das heißt malnehmen.", rechnung: function (a, z) { return z + " · " + a; } },
    { art: "mal", t: function (a, z) { return "Ein Bus fährt jeden Tag " + z + " km. Er fährt " + a + " Tage lang."; },
      frage: "Wie viele Kilometer fährt er zusammen?", a: ["Er fährt ", " km."],
      signal: "„jeden Tag“ gleich weit: Das heißt malnehmen.", rechnung: function (a, z) { return a + " · " + z; } },
    { art: "durch10", t: function (a, z) { return "10 Stunden Fahrradverleih kosten " + (a * z) + " €."; },
      frage: "Wie viel kostet eine Stunde?", a: ["Eine Stunde kostet ", " €."],
      signal: "Von 10 Stunden auf eine Stunde: Das heißt durch 10 teilen.", rechnung: function (a, z) { return (a * z) + " : 10"; } },
    { art: "pvs", t: function (a, z, g) { return "Mia hat " + g + " €. Sie kauft " + a + " Bücher. Jedes Buch kostet " + (z / 10) + " €."; },
      frage: "Wie viel Geld bleibt ihr?", a: ["Mia bleiben ", " €."],
      signal: "„Jedes Buch kostet gleich viel“: erst malnehmen, dann abziehen.", rechnung: function (a, z, g) { return g + " − " + a + " · " + (z / 10); } }
  ];
  function sachAufgaben(r) {
    var raus = [];
    // a) Teilen mit Rest
    var s = eins(r, SACH_REST), d = zahl(r, 4, 9), q = zahl(r, 3, 9), rest = zahl(r, 2, d - 1), n = q * d + rest;
    raus.push({
      thema: "sach", art: "rest", sach: true,
      text: s.t(n, d) + " " + s.frage,
      felder: [feld("e", s.a1[0], s.a1[1]), feld("r", s.a2[0], s.a2[1])],
      loesung: { e: q, r: rest },
      klein: { n: n, d: d, variante: 0, signal: s.signal, rechnung: n + " : " + d },
      weg: "Rechnung: " + n + " : " + d + " = " + q + " R " + rest + ". " + s.a1[0] + q + s.a1[1] + " " + s.a2[0] + rest + s.a2[1]
    });
    // b) Mal / durch 10 / Punkt vor Strich
    var t = eins(r, SACH_RECHNEN), a = zahl(r, 3, 9), z = zahl(r, 2, 9) * 10, g = 0, e, rech;
    if (t.art === "mal") e = a * z;
    else if (t.art === "durch10") e = a * z / 10;
    else { a = zahl(r, 2, 4); z = zahl(r, 3, 9) * 10; var kosten = a * z / 10; g = (Math.floor(kosten / 10) + 1 + zahl(r, 0, 1)) * 10; e = g - kosten; }
    rech = t.rechnung(a, z, g);
    raus.push({
      thema: "sach", art: "zahl", sach: true,
      text: t.t(a, z, g) + " " + t.frage,
      felder: [feld("e", t.a[0], t.a[1])],
      loesung: { e: e },
      klein: { signal: t.signal, rechnung: rech, art: t.art },
      weg: "Rechnung: " + rech + " = " + e + ". " + t.a[0] + e + t.a[1]
    });
    return raus;
  }

  /* ---------- Ein ganzes Blatt ---------- */
  function blatt(saat) {
    if (saat == null) saat = neueSaat();
    var r = zufall(saat), schon = {}, liste = [];
    function dazu(a) { liste.push(a); }
    // Mal: einmal "7 · 80", einmal "80 · 7" oder "6 · 900"
    dazu(malAufgabe(r, 0, schon)); dazu(malAufgabe(r, r() < 0.5 ? 1 : 2, schon));
    var pv = [0, 1, 2]; var p1 = pv.splice(zahl(r, 0, 2), 1)[0], p2 = eins(r, pv);
    dazu(platzAufgabe(r, p1, schon)); dazu(platzAufgabe(r, p2, schon));
    dazu(zehnerAufgabe(r, r() < 0.5 ? 0 : 2, schon)); dazu(zehnerAufgabe(r, 1, schon));
    dazu(restAufgabe(r, 0, schon)); dazu(restAufgabe(r, 1, schon)); dazu(restAufgabe(r, 2, schon));
    dazu(pvsAufgabe(r, 0, schon)); dazu(pvsAufgabe(r, 1, schon)); dazu(pvsAufgabe(r, 2, schon));
    dazu(teilerAufgabe(r));
    sachAufgaben(r).forEach(dazu);
    var buchst = "abcdefgh", zaehl = {};
    liste.forEach(function (a, i) {
      a.nr = i;
      zaehl[a.thema] = (zaehl[a.thema] || 0);
      a.buchstabe = buchst.charAt(zaehl[a.thema]++);
      a.id = a.thema + "-" + a.buchstabe;
    });
    return { saat: saat >>> 0, aufgaben: liste };
  }
  function teileVon(b) {
    return THEMEN.map(function (t, i) {
      return { nr: i, key: t.key, name: t.name, auftrag: t.auftrag, aufgaben: b.aufgaben.filter(function (a) { return a.thema === t.key; }) };
    });
  }

  /* ---------- Pruefen ---------- */
  function zahlAus(s) {
    var t = String(s == null ? "" : s).replace(/[\s.]/g, "");
    if (!/^\d{1,5}$/.test(t)) return null;
    return parseInt(t, 10);
  }
  function leer(a, ein) {
    ein = ein || {};
    if (a.art === "teiler") return !(Array.isArray(ein.t) && ein.t.length);
    return a.felder.some(function (f) { return String(ein[f.name] == null ? "" : ein[f.name]).trim() === ""; });
  }
  function pruefe(a, ein) {
    ein = ein || {};
    if (leer(a, ein)) return { stimmt: false, leer: true, denkfehler: "Hier ist noch nichts eingetragen." };
    if (a.art === "teiler") {
      var soll = a.loesung.t, ist = ein.t.map(Number).filter(function (x, i, l) { return l.indexOf(x) === i; }).sort(function (x, y) { return x - y; });
      var fehlt = soll.filter(function (x) { return ist.indexOf(x) < 0; });
      var zuviel = ist.filter(function (x) { return soll.indexOf(x) < 0; });
      return { stimmt: !fehlt.length && !zuviel.length, fehlt: fehlt.length, zuviel: zuviel, denkfehler: denkfehlerTeiler(a, fehlt, zuviel) };
    }
    var w = {}, gut = true;
    a.felder.forEach(function (f) { w[f.name] = zahlAus(ein[f.name]); if (w[f.name] !== a.loesung[f.name]) gut = false; });
    return { stimmt: gut, denkfehler: gut ? null : denkfehler(a, w) };
  }

  function nullen(x) { var n = 0; while (x && x % 10 === 0) { n++; x /= 10; } return n; }
  function denkfehlerTeiler(a, fehlt, zuviel) {
    if (zuviel.length) return zuviel[0] + " ist kein Teiler von " + a.klein.n + ": " + a.klein.n + " : " + zuviel[0] + " geht nicht ohne Rest.";
    if (fehlt.length === 1) return "Ein Teiler fehlt noch.";
    if (fehlt.length) return "Es fehlen noch " + fehlt.length + " Teiler.";
    return null;
  }
  function denkfehler(a, w) {
    var k = a.klein, e = w.e, soll = a.loesung.e;
    if (e == null && a.art !== "rest") return "Schreib nur die Zahl ins Feld.";
    if (a.thema === "mal" || (a.sach && k.art === "mal")) {
      if (e != null && e * 10 === soll) return "Da fehlt eine Null am Ergebnis.";
      if (e != null && e * 100 === soll) return "Da fehlen zwei Nullen am Ergebnis.";
      if (e != null && e === soll * 10) return "Da ist eine Null zu viel.";
      if (a.thema === "mal" && e != null && nullen(e) === nullen(soll) && e !== soll) return "Die Nullen stimmen. Schau noch einmal auf die kleine Aufgabe " + k.a + " · " + k.b + ".";
    }
    if (a.thema === "platz") {
      if (e != null && e * 10 === soll) return "Schau auf die Nullen: " + e + " · " + k.bekannt + " ist erst " + (e * k.bekannt) + ".";
      if (e != null && e === soll * 10) return "Da ist eine Null zu viel: " + e + " · " + k.bekannt + " = " + (e * k.bekannt) + ".";
      if (e != null) return "Mach die Probe: " + e + " · " + k.bekannt + " = " + (e * k.bekannt) + ". Das ist noch nicht " + k.p + ".";
    }
    if (a.thema === "zehner" || (a.sach && k.art === "durch10")) {
      if (k.variante === 0 || (a.sach && k.art === "durch10")) {
        if (e != null && e === soll * 100) return "Beim Teilen durch 10 wird die Zahl kleiner: Eine Null fällt weg.";
        if (e != null && e > soll) return "Beim Teilen durch 10 wird die Zahl kleiner: Eine Null fällt weg.";
      }
      if (k.variante === 1 && e === soll * 10) return "Streich die Null bei beiden Zahlen, nicht nur bei einer.";
      if (k.variante === 2 && e != null && e * 10 === soll) return "Da fehlt noch die Null am Ergebnis.";
    }
    if (a.art === "rest") {
      var q = w.e, rr = w.r, n = k.n, d = k.d;
      if (q == null || rr == null) return "Schreib in beide Felder eine Zahl. Ist nichts übrig, schreib 0.";
      if (q === a.loesung.e && rr * 10 === a.loesung.r) return "Das Ergebnis vorne stimmt. Beim Rest fehlt noch die Null.";
      if (rr >= d) return "Der Rest ist so groß wie " + d + " oder größer. Da passt noch einmal " + d + " hinein.";
      if (q * d > n) return q + " · " + d + " = " + (q * d) + ". Das ist schon mehr als " + n + ". Nimm eine kleinere Zahl.";
      if (q === a.loesung.e) return "Das Ergebnis vorne stimmt. Rechne den Rest noch einmal: " + n + " − " + (q * d) + ".";
      if (q * d + rr !== n) return "Mach die Probe: " + q + " · " + d + " + " + rr + " = " + (q * d + rr) + ". Das ist nicht " + n + ".";
    }
    if (a.thema === "pvs" || (a.sach && k.art === "pvs")) {
      if (a.thema === "pvs" && k.falschLR != null && e === k.falschLR) return "Du hast von links nach rechts gerechnet. Punkt vor Strich: Das Mal- oder Geteiltrechnen kommt zuerst.";
      if (a.thema === "pvs" && e === k.zwischen) return "Der erste Schritt stimmt. Jetzt fehlt noch der zweite: " + k.schritt2 + ".";
    }
    if (e != null && Math.abs(e - soll) <= 2) return "Knapp daneben. Rechne noch einmal ganz in Ruhe nach.";
    return "Das stimmt noch nicht. Mit der Hilfe klappt es bestimmt.";
  }

  /* ---------- Hilfe in Stufen (nie die Loesung) ---------- */
  function hilfe(a, stufe) {
    var k = a.klein;
    if (a.sach) {
      if (stufe === 1) return k.signal;
      return a.art === "rest" ? "Rechne: " + k.rechnung + " = ▢ R ▢." : "Rechne: " + k.rechnung + " = ▢.";
    }
    switch (a.thema) {
      case "mal":
        return stufe === 1 ? "Rechne zuerst die kleine Aufgabe: " + k.a + " · " + k.b + ". Dann häng " + (k.stellen === 100 ? "die zwei Nullen" : "die Null") + " an."
          : "Schau: " + k.a + " · " + k.b + " = ▢. Und " + k.links + " · " + k.rechts + " hat " + (k.stellen === 100 ? "zwei Nullen" : "eine Null") + " mehr.";
      case "platz":
        return stufe === 1 ? "Denk an die kleine Aufgabe ohne Null: Welche Zahl mal " + (k.bekannt % 10 === 0 ? k.bekannt / 10 : k.bekannt) + " ergibt " + (k.p / 10) + "?"
          : (k.fehlt % 10 === 0 ? "Schau: " + (k.fehlt / 10) + " · " + k.bekannt + " = " + (k.p / 10) + ". Jetzt fehlt noch die Null."
                                : "Geh die " + reihe(k.bekannt / 10) + " durch, bis du bei " + (k.p / 10) + " bist.");
      case "zehner":
        if (k.variante === 0) return stufe === 1 ? "Beim Teilen durch 10 fällt eine Null weg." : "Streich bei " + k.n + " die letzte Null.";
        if (k.variante === 1) return stufe === 1 ? "Streich bei beiden Zahlen eine Null: " + (k.n / 10) + " : " + (k.d / 10) + "." : "Denk an die Malaufgabe: ▢ · " + (k.d / 10) + " = " + (k.n / 10) + ".";
        return stufe === 1 ? "Rechne zuerst " + (k.n / 10) + " : " + k.d + ". Dann häng die Null an." : "Denk an die Malaufgabe: ▢ · " + k.d + " = " + (k.n / 10) + ".";
      case "rest":
        if (k.variante === 0) return stufe === 1 ? "Such in der " + reihe(k.d) + " die Zahl, die knapp unter " + k.n + " liegt." : "Schau: " + (a.loesung.e * k.d) + " ist in der " + reihe(k.d) + ". Wie oft passt " + k.d + " hinein, und wie viel fehlt bis " + k.n + "?";
        if (k.variante === 1) return stufe === 1 ? "Streich bei beiden eine Null: " + (k.n / 10) + " : " + (k.d / 10) + ". Der Rest bekommt die Null danach wieder." : "Schau: ▢ · " + k.d + " ist knapp unter " + k.n + ". Wie viel fehlt dann noch bis " + k.n + "?";
        return stufe === 1 ? "Teile in zwei Schritten: erst eine Zehnerzahl, die gut durch " + k.d + " geht, dann den Rest." : "Schau: " + k.teil + " : " + k.d + " = " + (k.teil / k.d) + ". Jetzt noch " + (k.n - k.teil) + " : " + k.d + " = ▢ R ▢.";
      case "pvs":
        return stufe === 1 ? "Punkt vor Strich: Rechne zuerst " + k.zuerst + "." : "Schau: " + k.zuerst + " = " + k.zwischen + ". Jetzt noch " + k.schritt2 + ".";
      case "teiler":
        return stufe === 1 ? "Denk an Malaufgaben-Paare: 1 · " + k.n + ", 2 · ▢, 3 · ▢ … Beide Zahlen eines Paares sind Teiler."
          : "Prüf jede Zahl von 1 bis " + Math.floor(k.n / 2) + ": Geht " + k.n + " durch sie ohne Rest? Und " + k.n + " selbst gehört auch dazu.";
    }
    return "";
  }

  /* ---------- Rueckschau: je Thema, ohne Note, ohne Punkte ---------- */
  function rueckschau(b, ergebnisse) {
    return teileVon(b).map(function (t) {
      var falsch = t.aufgaben.filter(function (a) { return !(ergebnisse[a.id] && ergebnisse[a.id].stimmt); });
      return { key: t.key, name: t.name, sitzt: falsch.length === 0, falsch: falsch.map(function (a) { return a.id; }) };
    });
  }

  /* Was Paul sieht, darf kein Begruendungswort und keine Warum-Frage enthalten (Frau Sy). */
  var VERBOTEN = /\b(weil|warum|wieso|weshalb|begründe|begruende)\b/i;
  function alleTexte(b) {
    var t = [];
    THEMEN.forEach(function (x) { t.push(x.name, x.auftrag); });
    b.aufgaben.forEach(function (a) {
      t.push(a.text, a.weg, hilfe(a, 1), hilfe(a, 2));
      a.felder.forEach(function (f) { t.push(f.vor, f.nach); });
    });
    return t;
  }

  var M = {
    THEMEN: THEMEN, THEMA: THEMA, TEILER_ZAHLEN: TEILER_ZAHLEN, VERBOTEN: VERBOTEN,
    zufall: zufall, neueSaat: neueSaat, teilerVon: teilerVon,
    blatt: blatt, teileVon: teileVon, pruefe: pruefe, leer: leer, zahlAus: zahlAus,
    hilfe: hilfe, rueckschau: rueckschau, alleTexte: alleTexte, denkfehler: denkfehler
  };
  if (typeof module !== "undefined" && module.exports) module.exports = M;
  else wurzel.GPMMotor = M;
})(typeof window !== "undefined" ? window : this);
