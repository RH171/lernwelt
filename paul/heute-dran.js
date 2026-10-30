/* Startseite „Heute dran" (Schritt 5, Denny 30.10.2026, 07:10 Uhr, nur Paul).
 *
 * Die Startseite zeigt je Fach mit Material genau die Runde, die das Lernquiz bei
 * quiz.html?heute=1&fach=<f> abfragt. Es gibt KEINE zweite Auswahl: gerechnet wird mit
 * LWTag.waehlen (/tagesrunde.js), denselben Daten (/api/quiz?nurWartend=1 und
 * /api/schulstoff?monate=6) und denselben Optionen wie quiz/such.js.
 *
 * Die Auswahl zieht gewichtet per Zufall (Einstiegskarte, gewichtetZiehen). Damit die
 * Runde beim Klick dieselbe ist, gilt zweierlei:
 *   1. Feste Saat je Kind, Tag und Fach (zufall()) - gleiche Daten ergeben dieselbe Runde,
 *      auch in einem neuen Tab oder ohne Zwischenspeicher.
 *   2. Uebergabe: die Startseite legt die gewaehlten Karten in sessionStorage (nur dieser
 *      Tab, kein Sync, keine Geheimnisse). Das Lernquiz nimmt sie fuer die ERSTE Runde, wenn
 *      Tag und Fach passen und sie hoechstens 30 Minuten alt ist. So bleibt es dieselbe Runde,
 *      auch wenn sich zwischen Startseite und Klick ein Blatt geaendert hat.
 * Gepruefter Weg: pruefe-heute-dran.mjs (Projektwurzel).
 *
 * Kein Druck (Bauregeln, Beschluss 24.09.2026): keine Rest- oder Rueckstandszahl, kein
 * „noch X", kein Rot. Die Zahl sagt nur, wie gross die heutige Runde ist.
 */
(function (global) {
  "use strict";

  var KIND = "paul";
  var SCHLUESSEL = "lw-heute-dran";
  var GUELTIG_MS = 30 * 60 * 1000;
  /* Dieselben Werte wie FACH_RUNDE in quiz/such.js (19.10.2026, Kapitel 131). Gleichheit prueft
     pruefe-heute-dran.mjs, indem es such.js wirklich laufen laesst. */
  var FACH_RUNDE = { hoechstens: 10, unsicherHoechstens: 7, vorrangHoechstens: 7, ruhtUnsicher: true };
  /* Reihenfolge und Namen wie window.QUIZ.faecher in paul/quiz.html. */
  var FAECHER = [
    { k: "deutsch",  n: "Deutsch",  ic: "📘" },
    { k: "mathe",    n: "Mathe",    ic: "🔢" },
    { k: "hsu",      n: "HSU",      ic: "🌍" },
    { k: "englisch", n: "Englisch", ic: "🇬🇧" },
    { k: "musik",    n: "Musik",    ic: "🎵" }
  ];

  function tag(d) {   // Ortszeit, wie tagVon() in tagesrunde.js (anleitung/096)
    var x = d || new Date();
    return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  }
  function jetztMs() { return global.__hdJetzt ? Number(global.__hdJetzt) : Date.now(); }
  function heute() { return global.__hdJetzt ? tag(new Date(Number(global.__hdJetzt))) : tag(new Date()); }

  /* Feste Saat: mulberry32 aus einem Text-Hash (FNV-1a). runde = 0 ist die erste Runde des Tages,
     „Noch 10 Fragen" zaehlt hoch. */
  function zufall(fach, runde, datum) {
    var s = KIND + "|" + (datum || heute()) + "|" + fach + "|" + (runde || 0), h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    var seed = h | 0;
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Die Optionen der Fach-Runde - Feld fuer Feld wie heuteAnbieten() in quiz/such.js bei Paul. */
  function optionen(fach, daten, ohne, runde) {
    var o = { fach: fach, ohne: ohne || {} };
    for (var x in FACH_RUNDE) o[x] = FACH_RUNDE[x];
    o.nachBlattdatum = true; o.formen = daten.fundFormen || {};
    if (daten.schritt4) o.schritt4 = daten.schritt4;
    o.zufall = zufall(fach, runde || 0);
    return o;
  }

  function id(k) {   // Lernpunkt einer Karte, wie schonDran/merkeDran in such.js
    if (k && k.quiz && k.quiz.frageId != null) return "q:" + k.quiz.frageId;
    return String(k && k.blatt) + "#k:" + (global.LWTag ? global.LWTag.schluessel(k) : "");
  }
  function ids(r) { return ((r && r.karten) || []).map(id); }

  /* Ein Fach hat Material, wenn LWTag.waehlen dort ueberhaupt Blaetter nimmt (gleicher Filter). */
  function hatMaterial(eintraege, fach) {
    return (eintraege || []).some(function (b) {
      if (!b || !b.id || b.sichtbar === false || b.probenstoff === false || !Array.isArray(b.karten) || !b.karten.length) return false;
      var f = String(b.fach || "").toLowerCase();
      return f === fach || f.indexOf(fach + "-") === 0;
    });
  }

  function runde(fach, daten, ohne, nr) {
    if (!global.LWTag) return null;
    return global.LWTag.waehlen(daten.eintraege || [], daten.fundStand || {}, optionen(fach, daten, ohne, nr), daten.quizWackler || []);
  }

  /* Aufschluesselung fuer die Karte: Einstieg, neu, Nochmal (Fehler), Kontrolle, Wiederholen. */
  function teile(r) {
    var z = { einstieg: 0, neu: 0, fehler: 0, kontrolle: 0, wiederholen: 0 };
    ((r && r.karten) || []).forEach(function (k) {
      if (k.einstieg) z.einstieg++;
      else if (k.stufe === "frischFehler" || k.stufe === "altFehler") z.fehler++;
      else if (k.stufe === "sicher") z.kontrolle++;
      else if (k.stufe === "neu") z.neu++;
      else z.wiederholen++;
    });
    return z;
  }
  function menge(daten, fach) {
    var s4 = daten.schritt4;
    if (!s4 || !s4.k) return null;
    var m = s4.menge && s4.menge[fach];
    return Number(m) || (s4.k.tagesmenge && s4.k.tagesmenge[0]) || null;
  }

  /* Heute schon erledigt (30.10.2026, Auftrag 178): Lernpunkte, die Paul heute beantwortet hat
     (daten.heuteBeantwortet vom Server, Berliner Tag), soweit sie zu Blaettern dieses Fachs gehoeren.
     keys sind die ohne-Schluessel der Runde ("<blatt>#k:<antwort>", "q:<frageId>"), zahl die Anzahl
     der heutigen Lernpunkte im Fach. Ohne Liste (alter Server) bleibt alles wie vorher. */
  function heuteErledigt(daten, fach) {
    var aus = { keys: {}, zahl: 0 };
    var liste = daten && daten.heuteBeantwortet;
    if (!Array.isArray(liste) || !liste.length) return aus;
    var imFach = {};
    (daten.eintraege || []).forEach(function (b) {
      if (!b || !b.id) return;
      var f = String(b.fach || "").toLowerCase();
      if (f === fach || f.indexOf(fach + "-") === 0) imFach[b.id] = 1;
    });
    var heute = {};
    liste.forEach(function (s) {
      s = String(s || "");
      var i = s.indexOf("#");
      if (i <= 0 || !imFach[s.slice(0, i)] || heute[s]) return;
      heute[s] = 1; aus.zahl++;
      if (s.indexOf("#k:", i) === i) aus.keys[s] = 1;
    });
    /* Quizfragen: Lernpunkt "<blatt>#<nr>" oder "<blatt>#f:<id>", in der Runde "q:<frageId>". */
    (daten.quizWackler || []).forEach(function (q) {
      if (!q || q.frageId == null) return;
      var p = Number(q.belegNr) >= 1 ? q.blatt + "#" + Math.floor(Number(q.belegNr))
                                     : q.blatt + "#f:" + String(q.frageId || "").slice(0, 24);
      if (heute[p]) aus.keys["q:" + q.frageId] = 1;
    });
    return aus;
  }

  /* Runde fuer ein Fach mit dem, was heute schon erledigt ist: Heutiges kommt nicht noch einmal,
     und es zaehlt gegen die Tagesmenge. Ist die Menge erreicht (oder bleibt nach dem Abzug keine
     Runde), ist das Fach fuer heute geschafft - keine neue volle Runde. */
  function fachRunde(fach, daten, ohne, nr) {
    var m = menge(daten, fach), h = heuteErledigt(daten, fach);
    if (!h.zahl || !m || !daten.schritt4) return { runde: runde(fach, daten, ohne || {}, nr), erledigt: 0, menge: m };
    if (h.zahl >= m) return { runde: null, erledigt: h.zahl, menge: m };
    var o = {}, x;
    for (x in (ohne || {})) o[x] = ohne[x];
    for (x in h.keys) o[x] = 1;
    var s4 = {};
    for (x in daten.schritt4) s4[x] = daten.schritt4[x];
    s4.menge = {};
    for (x in (daten.schritt4.menge || {})) s4.menge[x] = daten.schritt4.menge[x];
    s4.menge[fach] = m - h.zahl;   // nie 0: runde4 faellt bei 0 auf die volle Tagesmenge zurueck
    var d = {};
    for (x in daten) d[x] = daten[x];
    d.schritt4 = s4;
    var r = runde(fach, d, o, nr);
    if (!r || !r.karten || !r.karten.length) return { runde: null, erledigt: h.zahl, menge: m };
    return { runde: r, erledigt: 0, rest: m - h.zahl, menge: m };
  }

  /* Alles fuer die Startseite: je Fach mit Material die Runde. */
  function berechnen(daten) {
    var aus = [];
    FAECHER.forEach(function (f) {
      if (!hatMaterial(daten.eintraege, f.k)) return;
      var fr = fachRunde(f.k, daten, {}, 0), r = fr.runde;
      var x = { fach: f.k, name: f.n, ic: f.ic, runde: r, ids: ids(r), teile: teile(r), menge: fr.menge || menge(daten, f.k) };
      if (fr.erledigt) x.erledigt = fr.erledigt;
      aus.push(x);
    });
    return aus;
  }

  /* ---- Uebergabe an das Lernquiz ---- */
  function speichern(liste) {
    try {
      var runden = {};
      liste.forEach(function (x) { if (x.runde && x.runde.karten.length) runden[x.fach] = x.runde; });
      global.sessionStorage.setItem(SCHLUESSEL, JSON.stringify({ kind: KIND, datum: heute(), zeit: jetztMs(), runden: runden }));
    } catch (e) { /* ohne Speicher rechnet das Quiz mit derselben Saat */ }
  }
  /* Liefert die Runde fuer das Fach und nimmt sie aus der Uebergabe (nur die erste Runde). */
  function uebernehmen(fach, verbrauchen) {
    try {
      var s = JSON.parse(global.sessionStorage.getItem(SCHLUESSEL) || "null");
      if (!s || s.kind !== KIND || s.datum !== heute() || !(jetztMs() - Number(s.zeit) <= GUELTIG_MS)) return null;
      var r = s.runden && s.runden[fach];
      if (!r || !Array.isArray(r.karten) || !r.karten.length) return null;
      if (verbrauchen) { delete s.runden[fach]; global.sessionStorage.setItem(SCHLUESSEL, JSON.stringify(s)); }
      return r;
    } catch (e) { return null; }
  }

  /* ---- Daten holen: dieselben zwei Abrufe wie laden() in quiz/such.js (nur lesen) ---- */
  function holen(fertig) {
    var d = { fundStand: {}, quizWackler: [], fundFormen: {}, schritt4: null, eintraege: [] }, ok = true;
    fetch("/api/quiz?kind=" + KIND + "&nurWartend=1", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        d.fundStand = (j && j.fundStand) || {}; d.quizWackler = (j && j.quizWackler) || [];
        d.fundFormen = (j && j.fundFormen) || {}; d.schritt4 = (j && j.schritt4) || null;
        d.heuteBeantwortet = (j && Array.isArray(j.heuteBeantwortet)) ? j.heuteBeantwortet : [];
        if (!j || !j.ok) ok = false;
      })
      .catch(function () { ok = false; })
      .then(function () { return fetch("/api/schulstoff?kind=" + KIND + "&monate=6", { credentials: "same-origin" }); })
      .then(function (r) { return r.json(); })
      .then(function (j) { d.eintraege = (j && j.eintraege) || []; if (!j || !j.ok) ok = false; })
      .catch(function () { ok = false; })
      .then(function () { fertig(ok ? d : null); });
  }

  /* ---- Anzeige ---- */
  function el(tagName, cls, text) {
    var e = document.createElement(tagName);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function zahlWort(n, eins, viele) { return n === 1 ? "1 " + eins : n + " " + viele; }
  function karte(x) {
    var n = x.runde ? x.runde.karten.length : 0;
    var a = el("a", "hd-fach " + x.fach);
    a.setAttribute("data-fach", x.fach);
    a.setAttribute("data-karten", x.ids.join("|"));
    var kopf = el("div", "hd-kopf");
    kopf.appendChild(el("span", "hd-ic", x.ic));
    kopf.appendChild(el("span", "hd-name", x.name));
    a.appendChild(kopf);
    if (!n && x.erledigt) {
      /* Heute schon geschafft (30.10.2026): keine neue Runde, freies Ueben bleibt. */
      a.href = "quiz.html?fach=" + encodeURIComponent(x.fach);
      a.classList.add("leer", "erledigt");
      a.setAttribute("data-erledigt", String(x.erledigt));
      a.appendChild(el("div", "hd-zahl klein", "Für heute geschafft ✅"));
      a.appendChild(el("div", "hd-satz", "Du kannst trotzdem üben, wenn du magst."));
      a.appendChild(el("span", "hd-los", "Üben ›"));
      a.setAttribute("aria-label", x.name + ": für heute geschafft");
      return a;
    }
    if (!n) {
      /* Material da, aber heute keine Runde (zu wenig faellig): ehrlich sagen, freies Ueben bleibt. */
      a.href = "quiz.html?fach=" + encodeURIComponent(x.fach);
      a.classList.add("leer");
      a.appendChild(el("div", "hd-zahl klein", "Heute nichts fällig"));
      a.appendChild(el("div", "hd-satz", "Du kannst trotzdem üben, wenn du magst."));
      a.appendChild(el("span", "hd-los", "Üben ›"));
      return a;
    }
    a.href = "quiz.html?heute=1&fach=" + encodeURIComponent(x.fach);
    a.appendChild(el("div", "hd-zahl", zahlWort(n, "Karte", "Karten")));
    var t = x.teile, liste = el("ul", "hd-teile");
    [["einstieg", "zum Einstieg", "zum Einstieg"], ["neu", "neu", "neu"], ["fehler", "nochmal üben", "nochmal üben"],
     ["kontrolle", "Kontrolle", "Kontrollen"], ["wiederholen", "wiederholen", "wiederholen"]].forEach(function (w) {
      if (!t[w[0]]) return;
      var li = el("li", "hd-" + w[0], t[w[0]] + " " + (t[w[0]] === 1 ? w[1] : w[2]));
      li.setAttribute("data-teil", w[0]);
      liste.appendChild(li);
    });
    a.appendChild(liste);
    if (x.menge) {
      var m = el("div", "hd-menge", "Tagesmenge " + x.menge);
      m.setAttribute("data-menge", String(x.menge));
      a.appendChild(m);
    }
    a.appendChild(el("span", "hd-los", "Los ›"));
    a.setAttribute("aria-label", x.name + ": " + n + " Karten für heute");
    return a;
  }
  function zeigen(box, liste) {
    box.innerHTML = "";
    box.removeAttribute("aria-busy");
    if (!liste) {
      var f = el("a", "hd-fach leer");
      f.href = "quiz.html";
      f.appendChild(el("div", "hd-satz", "Gerade kann ich nicht nachsehen. Im Lernquiz kannst du trotzdem üben."));
      f.appendChild(el("span", "hd-los", "Zum Lernquiz ›"));
      box.appendChild(f);
      return;
    }
    if (!liste.length) {
      box.appendChild(el("div", "hd-hinweis", "Sobald du ein Blatt hochlädst, steht hier, was heute dran ist."));
      return;
    }
    liste.forEach(function (x) { box.appendChild(karte(x)); });
  }
  function start(box) {
    if (!box) return;
    box.setAttribute("aria-busy", "true");
    holen(function (d) {
      var liste = d ? berechnen(d) : null;
      if (liste) speichern(liste);
      zeigen(box, liste);
      global.LWHeuteDranStand = { liste: liste, fertig: true };
      try { document.dispatchEvent(new CustomEvent("lw-heute-dran", { detail: { liste: liste } })); } catch (e) {}
    });
  }

  global.LWHeuteDran = {
    FACH_RUNDE: FACH_RUNDE, FAECHER: FAECHER, SCHLUESSEL: SCHLUESSEL, GUELTIG_MS: GUELTIG_MS,
    zufall: zufall, optionen: optionen, runde: runde, berechnen: berechnen, heuteErledigt: heuteErledigt, fachRunde: fachRunde, teile: teile, ids: ids, id: id,
    hatMaterial: hatMaterial, speichern: speichern, uebernehmen: uebernehmen, holen: holen, zeigen: zeigen, start: start,
    heute: heute
  };
})(typeof window !== "undefined" ? window : this);
