/* Pauls 1×1-Woche (13.10.2026, Dennys Wahl A+B+C) – die reine Logik, für Browser und Node.
 *
 * Tagesplan 13.–17.10.2026: Di 1,2,5,10 · Mi 3,4 · Do 6,9 · Fr 7,8 · Sa gemischt.
 * Sonst (ab So 18.10.) gemischt über alle Reihen. Paul darf frei eine andere Auswahl nehmen.
 * Je Durchgang: Merkhilfe (C) · 20 Zahlendreiecke (A) · Tempo-Runde mit 20 Aufgaben (B).
 * Dreieck: oben das Produkt, unten links der kleinere, unten rechts der größere Faktor
 * (Dennys Regel). Eine Ecke fehlt: Spitze = Malaufgabe, untere Ecke = Geteiltaufgabe.
 * Was falsch oder langsam war, kommt im nächsten Durchgang zuerst (wackel).
 * Hinweise ohne Begründungssätze (Frau Sy erlaubt kein "w-e-i-l").
 */
(function (wurzel) {
  "use strict";

  var EIN = {
    dreiecke: 20,
    tempo: 20,
    wacklerVorn: 8,       // so viele Wackler stehen vorn in den Dreiecken
    wacklerVornMix: 14,   // am gemischten Tag (Samstag) mehr
    langsamAb: 4,         // Sekunden: darunter gilt eine Tempo-Aufgabe nie als langsam
    langsamZahl: 3,       // die langsamsten drei einer Tempo-Runde merken
    zeitenMax: 30,
    tageMax: 60,
    schreibProTag: 2      // KV: höchstens zwei Schreibvorgänge am Tag
  };

  var PLAN = {
    "2026-10-13": [1, 2, 5, 10],
    "2026-10-14": [3, 4],
    "2026-10-15": [6, 9],
    "2026-10-16": [7, 8],
    "2026-10-17": "gemischt"
  };
  var WAHLEN = [
    { set: "1-2-5-10", reihen: [1, 2, 5, 10], name: "1 · 2 · 5 · 10" },
    { set: "3-4", reihen: [3, 4], name: "3 · 4" },
    { set: "6-9", reihen: [6, 9], name: "6 · 9" },
    { set: "7-8", reihen: [7, 8], name: "7 · 8" },
    { set: "gemischt", reihen: [2, 3, 4, 5, 6, 7, 8, 9], name: "Gemischt" }
  ];
  var WOCHENTAG = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  /* ---------- Hilfen ---------- */
  function heuteIso(jetzt) {
    // Ortszeit, nicht UTC (Kapitel 096). Für Messungen darf window.__ewHeute einen Tag vorgeben.
    if (typeof window !== "undefined" && window.__ewHeute) return String(window.__ewHeute);
    var d = jetzt || new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function wochentag(iso) { var p = iso.split("-"); return WOCHENTAG[new Date(+p[0], +p[1] - 1, +p[2]).getDay()]; }
  function hash(s) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function zufall(saat) {   // mulberry32: derselbe Tag gibt dieselbe Runde, auch nach Neuladen
    var a = hash(String(saat));
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function mischen(liste, r) {
    var a = liste.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------- Plan ---------- */
  function wahl(set) { for (var i = 0; i < WAHLEN.length; i++) if (WAHLEN[i].set === set) return WAHLEN[i]; return WAHLEN[4]; }
  function setFuerTag(iso) {
    var p = PLAN[iso];
    if (!p || p === "gemischt") return "gemischt";
    return p.join("-");
  }

  /* ---------- Aufgaben ----------
   * Schlüssel "3x5" = Malaufgabe (kleiner x größer), "15:3" = 15 geteilt durch 3.
   * r = die Reihe, aus der sie kommt (für Hilfe und Statistik), n = die andere Zahl. */
  function aufgabe(k, r) {
    var m = /^(\d+)x(\d+)$/.exec(k), g = /^(\d+):(\d+)$/.exec(k), a, b, p, x;
    if (m) {
      a = +m[1]; b = +m[2]; p = a * b;
      if (a < 1 || b > 10 || a > b) return null;
      x = { k: k, art: "mal", a: a, b: b, p: p, fehlt: "oben", loesung: p, rechnung: a + " · " + b + " = ?" };
      x.r = r && (r === a || r === b) ? r : (b === 10 || b === 1 ? a : b);
      x.n = x.r === a ? b : a;
    } else if (g) {
      p = +g[1]; var d = +g[2], q = p / d;
      if (!d || q !== Math.floor(q) || q < 1 || q > 10 || d > 10) return null;
      a = Math.min(d, q); b = Math.max(d, q);
      x = { k: k, art: "geteilt", a: a, b: b, p: p, d: d, loesung: q, rechnung: p + " : " + d + " = ?",
        fehlt: q < d ? "links" : "rechts", r: d, n: q };
    } else return null;
    x.punkt = "ew#" + k;
    x.merkmal = "einmaleins " + x.r + "er reihe";
    return x;
  }
  function malSchluessel(r, n) { return Math.min(r, n) + "x" + Math.max(r, n); }
  function geteiltSchluessel(r, n) { return (r * n) + ":" + r; }

  function vorrat(reihen) {
    var mal = [], get = [], sah = {};
    reihen.forEach(function (r) {
      for (var n = 1; n <= 10; n++) {
        var km = malSchluessel(r, n), kg = geteiltSchluessel(r, n);
        if (!sah[km]) { sah[km] = 1; mal.push({ k: km, r: r }); }
        if (!sah[kg]) { sah[kg] = 1; get.push({ k: kg, r: r }); }
      }
    });
    return { mal: mal, get: get };
  }
  function paar(k) { var x = aufgabe(k); return x ? x.a + "x" + x.b : k; }

  /* Wackler: zuerst falsch, dann langsam, älteste zuerst. */
  function wacklerListe(stand) {
    return Object.keys(stand.wackel).filter(function (k) { return aufgabe(k); }).sort(function (x, y) {
      var a = stand.wackel[x], b = stand.wackel[y];
      return ((b.f || 0) - (a.f || 0)) || (a.d < b.d ? -1 : a.d > b.d ? 1 : 0) || (x < y ? -1 : 1);
    });
  }

  /* Die Dreiecke eines Durchgangs: Wackler vorn, dann halb Mal, halb Geteilt aus den Reihen. */
  function rundeDreiecke(stand, heute, set) {
    var w = wahl(set), r = zufall("ew-d|" + heute + "|" + set), v = vorrat(w.reihen);
    var liste = [], paare = {}, nGet = 0, einser = 0;
    var vorn = set === "gemischt" ? EIN.wacklerVornMix : EIN.wacklerVorn;
    wacklerListe(stand).slice(0, vorn).forEach(function (k) {
      var x = aufgabe(k, stand.wackel[k].r);
      liste.push({ k: k, r: x.r, w: 1 }); paare[paar(k)] = 1; if (x.art === "geteilt") nGet++;
    });
    var mal = mischen(v.mal, r), get = mischen(v.get, r);
    // Die 1er sind leicht: höchstens zwei davon in einer Runde.
    function nimm(von, paarFrei) {
      for (var i = 0; i < von.length; i++) {
        var e = von[i]; if (e.genommen) continue;
        var x = aufgabe(e.k, e.r);
        if (paarFrei && paare[paar(e.k)]) continue;
        if (x.a === 1 && einser >= 2) continue;
        e.genommen = 1; paare[paar(e.k)] = 1; if (x.a === 1) einser++;
        return e;
      }
      return null;
    }
    while (liste.length < EIN.dreiecke) {
      var willGet = nGet < EIN.dreiecke / 2 && nGet <= liste.length - nGet;
      // Erst ein neues Paar suchen; bei kleinem Vorrat (3 · 4) darf ein Paar in der anderen Art wiederkommen.
      var e = nimm(willGet ? get : mal, true) || nimm(willGet ? mal : get, true) ||
              nimm(willGet ? get : mal, false) || nimm(willGet ? mal : get, false);
      if (!e) break;
      if (aufgabe(e.k).art === "geteilt") nGet++;
      liste.push({ k: e.k, r: e.r });
    }
    // Wackler bleiben vorn, der Rest wird gemischt, damit Mal und Geteilt abwechseln.
    var wv = liste.filter(function (e) { return e.w; }), rest = mischen(liste.filter(function (e) { return !e.w; }), r);
    return wv.concat(rest).map(function (e) { return { k: e.k, r: e.r }; });
  }

  /* Tempo-Runde: 20 Aufgaben aus den Reihen, Mal und Geteilt gemischt, ohne die 1er. */
  function rundeTempo(heute, set, nr) {
    var w = wahl(set), r = zufall("ew-t|" + heute + "|" + set + "|" + (nr || 0)), v = vorrat(w.reihen);
    var mal = mischen(v.mal.filter(function (e) { return aufgabe(e.k).a !== 1; }), r);
    var get = mischen(v.get.filter(function (e) { return e.r !== 1 && aufgabe(e.k).loesung !== 1; }), r);
    var liste = [];
    for (var i = 0; liste.length < EIN.tempo && (i < mal.length || i < get.length); i++) {
      if (i < get.length) liste.push(get[i]);
      if (liste.length < EIN.tempo && i < mal.length) liste.push(mal[i]);
    }
    return mischen(liste, r).map(function (e) { return { k: e.k, r: e.r }; });
  }

  /* ---------- Merkhilfen (Teil C) ---------- */
  var MERK = {
    1: { kopf: "1er-Reihe", satz: "Die Zahl bleibt, wie sie ist.", bsp: "1 · 7 = 7" },
    2: { kopf: "2er-Reihe", satz: "Verdoppeln: die Zahl plus sich selbst.", bsp: "2 · 7 = 7 + 7 = 14" },
    5: { kopf: "5er-Reihe", satz: "Erst die 10er, dann die Hälfte.", bsp: "10 · 6 = 60, die Hälfte ist 30. Also 5 · 6 = 30" },
    10: { kopf: "10er-Reihe", satz: "Eine Null anhängen.", bsp: "10 · 7 = 70" },
    3: { kopf: "3er-Reihe", satz: "Erst die 2er, dann einmal mehr.", bsp: "2 · 7 = 14, plus 7 ergibt 21. Also 3 · 7 = 21" },
    4: { kopf: "4er-Reihe", satz: "Die 2er verdoppeln.", bsp: "2 · 7 = 14, doppelt ist 28. Also 4 · 7 = 28" },
    6: { kopf: "6er-Reihe", satz: "Erst die 5er, dann einmal mehr.", bsp: "5 · 7 = 35, plus 7 ergibt 42. Also 6 · 7 = 42" },
    9: { kopf: "9er-Reihe", satz: "Erst die 10er, dann einmal weniger.", bsp: "10 · 7 = 70, minus 7 ergibt 63. Also 9 · 7 = 63" },
    8: { kopf: "8er-Reihe", satz: "Die 4er verdoppeln.", bsp: "4 · 7 = 28, doppelt ist 56. Also 8 · 7 = 56" },
    7: { kopf: "7er-Reihe", satz: "Merk dir 7 · 7 = 49. Die Nachbarn rechnest du von dort aus.", bsp: "7 · 8 = 49 + 7 = 56 und 7 · 6 = 49 − 7 = 42" }
  };
  var EXTRA = {
    finger: { kopf: "Fingertrick für die 9er", satz: "Halte zehn Finger hoch. Für 9 · 4 beugst du den 4. Finger von links. Links davon stehen 3 Finger: 3 Zehner. Rechts stehen 6 Finger: 6 Einer.", bsp: "9 · 4 = 36" },
    quadrat: { kopf: "Ankerzahlen", satz: "Diese drei merkst du dir fest. Von dort aus findest du die Nachbarn.", bsp: "6 · 6 = 36 · 7 · 7 = 49 · 8 · 8 = 64" },
    geteilt: { kopf: "Geteilt", satz: "Rechne die Malaufgabe rückwärts: Welche Zahl mal 3 ergibt 15?", bsp: "3 · 5 = 15, also 15 : 3 = 5" },
    dreieck: { kopf: "Das Zahlendreieck", satz: "Oben steht das Ergebnis. Unten stehen die beiden Zahlen, die du malnimmst: links die kleinere, rechts die größere. Eine Ecke ist leer, die füllst du.", bsp: "", dreieck: 1 }
  };
  function merkKarten(set) {
    var karten = [];
    if (set === "gemischt") {
      [2, 5, 3, 4, 6, 9, 8, 7].forEach(function (r) { karten.push({ kopf: MERK[r].kopf, satz: MERK[r].satz, bsp: "", klein: 1, r: r }); });
      karten.push(EXTRA.quadrat);
    } else {
      wahl(set).reihen.forEach(function (r) { var k = MERK[r]; karten.push({ kopf: k.kopf, satz: k.satz, bsp: k.bsp, r: r }); });
      if (set === "6-9") karten.push(EXTRA.finger);
      if (set === "7-8" || set === "6-9") karten.push(EXTRA.quadrat);
    }
    karten.push(EXTRA.geteilt);
    karten.push(EXTRA.dreieck);
    return karten;
  }

  /* ---------- Hilfe in Stufen (Kapitel 044) ----------
   * Stufe 1: der Trick der Reihe für genau diese Zahlen, ohne Ergebnis.
   * Stufe 2: der Rechenweg als Lückenkette, die letzte Lücke tippt Paul selbst. */
  function trick(r, n) {
    switch (r) {
      case 1: return "Mal 1: Die Zahl bleibt, wie sie ist.";
      case 2: return "2er: Verdopple die " + n + ". Rechne " + n + " + " + n + ".";
      case 5: return "5er: Rechne erst 10 · " + n + ". Davon nimmst du die Hälfte.";
      case 10: return "10er: Hänge an die " + n + " eine Null an.";
      case 3: return "3er: Rechne erst 2 · " + n + ". Dann noch einmal " + n + " dazu.";
      case 4: return "4er: Rechne erst 2 · " + n + ". Das verdoppelst du.";
      case 6: return "6er: Rechne erst 5 · " + n + ". Dann noch einmal " + n + " dazu.";
      case 9: return "9er: Rechne erst 10 · " + n + ". Dann nimmst du einmal " + n + " weg.";
      case 8: return "8er: Rechne erst 4 · " + n + ". Das verdoppelst du.";
      case 7:
        if (n === 7) return "7er: Das ist die Ankerzahl 7 · 7. Erinnerst du dich?";
        if (n === 8) return "7er: Geh von 7 · 7 = 49 aus. Dann noch einmal 7 dazu.";
        if (n === 6) return "7er: Geh von 7 · 7 = 49 aus. Dann einmal 7 weg.";
        return "7er: Rechne erst 5 · " + n + ", dann noch 2 · " + n + " dazu.";
    }
    return "";
  }
  function kette(r, n) {
    switch (r) {
      case 1: return "Die Zahl bleibt: 1 · " + n + " = ?";
      case 2: return n + " + " + n + " = ?";
      case 5: return "10 · " + n + " = " + (10 * n) + ". Die Hälfte von " + (10 * n) + " = ?";
      case 10: return n + " mit einer Null dahinter = ?";
      case 3: return "2 · " + n + " = " + (2 * n) + ", " + (2 * n) + " + " + n + " = ?";
      case 4: return "2 · " + n + " = " + (2 * n) + ", " + (2 * n) + " + " + (2 * n) + " = ?";
      case 6: return "5 · " + n + " = " + (5 * n) + ", " + (5 * n) + " + " + n + " = ?";
      case 9: return "10 · " + n + " = " + (10 * n) + ", " + (10 * n) + " − " + n + " = ?";
      case 8: return "4 · " + n + " = " + (4 * n) + ", " + (4 * n) + " + " + (4 * n) + " = ?";
      case 7:
        if (n === 8) return "7 · 7 = 49, 49 + 7 = ?";
        if (n === 6) return "7 · 7 = 49, 49 − 7 = ?";
        if (n === 7) return "Die Ankerzahl: 7 · 7 = ?";
        return "5 · " + n + " = " + (5 * n) + ", 2 · " + n + " = " + (2 * n) + ", " + (5 * n) + " + " + (2 * n) + " = ?";
    }
    return "";
  }
  function reihenKette(d, bis) {
    var z = []; for (var i = 1; i * d <= bis; i++) z.push(i * d);
    return z.join(", ");
  }
  function hilfe(x, stufe) {
    if (x.art === "mal") {
      if (stufe === 1) return trick(x.r, x.n);
      return "Schau: " + kette(x.r, x.n) + " Tipp es jetzt selbst ein.";
    }
    if (stufe === 1) {
      var bis = Math.min(3 * x.d, x.p - x.d);
      return "Rechne rückwärts: ? · " + x.d + " = " + x.p + "." + (bis >= x.d ? " Geh die " + x.d + "er-Reihe durch: " + reihenKette(x.d, bis) + " …" : "");
    }
    return "Schau: " + reihenKette(x.d, x.p) + ". Zähl mit: Die wievielte Zahl ist " + x.p + "? Tipp es jetzt selbst ein.";
  }
  function bestaetigung(x) {
    if (x.art === "mal") return x.a + " · " + x.b + " = " + x.p;
    return x.d + " · " + x.loesung + " = " + x.p + ", also " + x.p + " : " + x.d + " = " + x.loesung;
  }
  /* Die Aufgaben einer Familie (Abschluss nach den Dreiecken). */
  function familie(a, b) {
    var p = a * b;
    if (a === b) return [a + " · " + b + " = " + p, p + " : " + a + " = " + b];
    return [a + " · " + b + " = " + p, b + " · " + a + " = " + p, p + " : " + a + " = " + b, p + " : " + b + " = " + a];
  }

  /* ---------- Stand ---------- */
  function leererStand() {
    return { v: 1, tage: {}, zeiten: {}, wackel: {}, schreib: { d: "", n: 0 } };
  }
  function standPruefen(s) {
    var l = leererStand();
    if (!s || typeof s !== "object") return l;
    l.tage = s.tage && typeof s.tage === "object" ? s.tage : {};
    l.zeiten = s.zeiten && typeof s.zeiten === "object" ? s.zeiten : {};
    l.wackel = s.wackel && typeof s.wackel === "object" ? s.wackel : {};
    l.schreib = s.schreib && typeof s.schreib === "object" ? { d: String(s.schreib.d || ""), n: +s.schreib.n || 0 } : l.schreib;
    return l;
  }

  /* Rückschau der Tempo-Runde: nur Vergleich mit sich selbst, nie eine Strafe. */
  function rueckschau(stand, set, sek) {
    var z = stand.zeiten[set] || [];
    var letzte = z.length ? z[z.length - 1].t : null;
    var beste = z.length ? Math.min.apply(null, z.map(function (e) { return e.t; })) : null;
    var s = "Heute: " + sek + " s.";
    if (letzte == null) return s + " Das ist deine erste Zeit für diese Reihen. Beim nächsten Mal kannst du vergleichen.";
    s += " Letztes Mal: " + letzte + " s.";
    if (sek < beste) s += " Das ist deine schnellste Zeit für diese Reihen!";
    else if (beste < letzte) s += " Deine schnellste Zeit für diese Reihen: " + beste + " s.";
    return s;
  }

  /* Einen fertigen Durchgang buchen.
   * erg: { dreieck: [{k,r,ok,sek}], tempo: [{k,r,ok,sek}], zeit: Sekunden der Tempo-Runde } */
  function buchen(stand, heute, set, erg) {
    var s = standPruefen(JSON.parse(JSON.stringify(stand)));
    var dr = erg.dreieck || [], te = erg.tempo || [], alle = dr.concat(te);
    // Langsam: die drei langsamsten der Tempo-Runde, ab EIN.langsamAb Sekunden.
    var langsam = {};
    te.filter(function (e) { return e.ok && e.sek >= EIN.langsamAb; })
      .sort(function (a, b) { return b.sek - a.sek; }).slice(0, EIN.langsamZahl)
      .forEach(function (e) { langsam[e.k] = e; });
    var falsch = {};
    alle.forEach(function (e) { if (!e.ok) falsch[e.k] = e; });
    alle.forEach(function (e) {
      if (falsch[e.k]) { s.wackel[e.k] = { r: e.r, d: heute, f: 1 }; return; }
      if (langsam[e.k]) { if (!s.wackel[e.k] || s.wackel[e.k].d < heute) s.wackel[e.k] = { r: e.r, d: heute, l: 1 }; return; }
      // An einem späteren Tag beim ersten Versuch richtig und nicht langsam: sitzt wieder.
      if (s.wackel[e.k] && s.wackel[e.k].d < heute) delete s.wackel[e.k];
    });
    var lauf = {
      s: set,
      a: [dr.filter(function (e) { return e.ok; }).length, dr.length],
      b: [te.filter(function (e) { return e.ok; }).length, te.length],
      t: erg.zeit == null ? null : erg.zeit,
      l: te.filter(function (e) { return e.sek != null; }).sort(function (a, b) { return b.sek - a.sek; })
        .slice(0, 3).map(function (e) { return [e.k, e.sek]; }),
      f: Object.keys(falsch).slice(0, 12)
    };
    (s.tage[heute] = s.tage[heute] || []).push(lauf);
    if (erg.zeit != null) {
      (s.zeiten[set] = s.zeiten[set] || []).push({ d: heute, t: erg.zeit });
      if (s.zeiten[set].length > EIN.zeitenMax) s.zeiten[set] = s.zeiten[set].slice(-EIN.zeitenMax);
    }
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
    EIN: EIN, PLAN: PLAN, WAHLEN: WAHLEN, heuteIso: heuteIso, wochentag: wochentag,
    wahl: wahl, setFuerTag: setFuerTag,
    aufgabe: aufgabe, vorrat: vorrat, rundeDreiecke: rundeDreiecke, rundeTempo: rundeTempo,
    wacklerListe: wacklerListe, merkKarten: merkKarten, MERK: MERK,
    hilfe: hilfe, bestaetigung: bestaetigung, familie: familie,
    leererStand: leererStand, standPruefen: standPruefen, rueckschau: rueckschau, buchen: buchen,
    darfSchreiben: darfSchreiben, geschrieben: geschrieben
  };
  if (typeof module !== "undefined" && module.exports) module.exports = M;
  else wurzel.EWMotor = M;
})(typeof window !== "undefined" ? window : this);
