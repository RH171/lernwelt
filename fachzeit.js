/* Geuebte Minuten je Fach und Tag (19.10.2026, Probenfokus Deutsch und HSU, Kapitel 131).
 *
 * Denny am 19.10.2026: Deutsch und HSU soll Paul jeden Tag mindestens 10 bis 30 Minuten
 * ueben. Die Karten auf seiner Startseite zeigen deshalb, wie viele Minuten er heute
 * in diesem Fach geuebt hat - "Heute 4 Min geuebt", ab 10 Minuten "Fuer heute geschafft".
 *
 * Gezaehlt wird AKTIVE Zeit, keine Wanduhrzeit - dieselben Regeln wie die Uhr in
 * lernstand.js: nur solange die Seite sichtbar ist und in den letzten zwei Minuten
 * etwas passiert ist (Tippen, Tasten, Scrollen). Wer nachdenkt, ruehrt sich zwei
 * Minuten nicht, das zaehlt mit; danach haelt die Uhr an.
 * Eine eigene kleine Uhr statt der aus lernstand.js: Die stellt sich nach jedem
 * Senden (Wegschalten) auf null und kennt kein Fach. Lernstand.js bleibt unberuehrt.
 *
 * Welches Fach gerade laeuft, sagt die Seite:
 *   LWFachzeit.start({ kind: "paul", fach: "deutsch" })   Deutsch-Probenstoff
 *   LWFachzeit.start({ kind: "paul" })                    Lernquiz, dazu je Frage
 *   LWFachzeit.fach("hsu")  /  LWFachzeit.fach(null)      (nur deutsch und hsu zaehlen)
 *
 * Speicher (kein Geheimnis, Kinderdaten nur als Zahlen):
 *   localStorage   "<kind>-fachzeit"       {"d":"2026-10-19","s":{"deutsch":245,"hsu":0}}
 *                  paul-sync.js schickt ihn mit. Nur HEUTE steht drin - kein Verlauf,
 *                  also auch keine Serie und kein Rueckstand (Bauregeln).
 *   sessionStorage "<kind>-fachzeit-lauf"  derselbe Stand, laufend nachgefuehrt (kostet nichts).
 * Geschrieben wird localStorage sparsam (paul-sync.js macht aus jedem setItem einen
 * KV-Schreibvorgang, 1000 am Tag fuer die ganze Lernwelt): beim Verlassen der Seite und
 * einmal, wenn die 10 Minuten erreicht sind. Die Startseite im selben Tab liest beide und
 * nimmt je Fach den groesseren Wert.
 *
 * Node: require("./fachzeit.js") liefert dieselben Funktionen (uhr, lesen, normFach ...)
 * fuer pruefe-probenfokus.mjs.
 */
(function (wurzel) {
  "use strict";

  var PAUSE_AB = 120000;          // zwei Minuten ohne Regung, wie lernstand.js
  var TAKT = 5000;
  var ZIEL = 600;                 // 10 Minuten in Sekunden: dann einmal sofort schreiben
  var FAECHER = { deutsch: 1, hsu: 1 };

  function heuteIso(d) { d = d || new Date(); return d.toLocaleDateString("sv-SE"); }   // Ortszeit, Kapitel 096
  function normFach(f) {
    var s = String(f == null ? "" : f).toLowerCase();
    if (/^deutsch/.test(s)) return "deutsch";
    if (/^hsu/.test(s)) return "hsu";
    return null;
  }
  function leer(tag) { return { d: tag, s: { deutsch: 0, hsu: 0 } }; }
  function pruefe(x, tag) {
    if (!x || typeof x !== "object" || x.d !== tag || !x.s || typeof x.s !== "object") return leer(tag);
    var r = leer(tag);
    for (var f in FAECHER) {
      var n = +x.s[f];
      r.s[f] = isFinite(n) && n > 0 ? Math.min(86400, Math.round(n)) : 0;
    }
    return r;
  }
  // Groesserer Wert je Fach: localStorage (vom Server, anderes Geraet) und sessionStorage (dieser Tab).
  function vereinen(a, b, tag) {
    a = pruefe(a, tag); b = pruefe(b, tag);
    var r = leer(tag);
    for (var f in FAECHER) r.s[f] = Math.max(a.s[f], b.s[f]);
    return r;
  }

  /* Die Uhr ohne Browser: jetzt() und sichtbar() kommen von aussen (Node-Pruefung mit
     falscher Zeit). Bucht aktive Millisekunden auf das laufende Fach. */
  function uhr(opt) {
    opt = opt || {};
    var jetzt = opt.jetzt || function () { return Date.now(); };
    var sichtbar = opt.sichtbar || function () { return true; };
    var fach = null, laeuftSeit = 0, letzteRegung = jetzt(), ms = { deutsch: 0, hsu: 0 };

    function buchen() {
      var n = jetzt();
      if (laeuftSeit) {
        var bis = Math.min(n, letzteRegung + PAUSE_AB);
        if (fach && bis > laeuftSeit) ms[fach] += bis - laeuftSeit;
        laeuftSeit = (n - letzteRegung > PAUSE_AB || !sichtbar()) ? 0 : n;
      }
    }
    function starten() { if (!laeuftSeit && sichtbar()) laeuftSeit = jetzt(); }
    return {
      regung: function () { buchen(); letzteRegung = jetzt(); starten(); },
      fach: function (f) { buchen(); fach = normFach(f); },
      aktuell: function () { return fach; },
      verdeckt: function () { buchen(); laeuftSeit = 0; },
      sichtbarWieder: function () { letzteRegung = jetzt(); starten(); },
      buchen: buchen,
      // Gebuchte Sekunden seit dem letzten abholen() - danach von vorn.
      abholen: function () {
        buchen();
        var r = { deutsch: Math.floor(ms.deutsch / 1000), hsu: Math.floor(ms.hsu / 1000) };
        ms.deutsch -= r.deutsch * 1000; ms.hsu -= r.hsu * 1000;
        return r;
      }
    };
  }

  function lesenAus(kind, tag, ls, ss) {
    var a = null, b = null;
    try { a = JSON.parse(ls.getItem(kind + "-fachzeit") || "null"); } catch (e) {}
    try { b = JSON.parse(ss.getItem(kind + "-fachzeit-lauf") || "null"); } catch (e) {}
    return vereinen(a, b, tag);
  }
  // Fuer die Startseite: Sekunden je Fach heute.
  function lesen(kind, tag) {
    tag = tag || window.__fzHeute || heuteIso();
    var ls = { getItem: function () { return null; } }, ss = ls;
    try { ls = window.localStorage; } catch (e) {}
    try { ss = window.sessionStorage; } catch (e) {}
    return lesenAus(kind || "paul", tag, ls, ss);
  }
  function minuten(sek) { return Math.floor((+sek || 0) / 60); }

  var laufend = null;
  function start(o) {
    if (laufend || typeof document === "undefined") return laufend;
    o = o || {};
    var kind = o.kind || "paul";
    var u = uhr({ sichtbar: function () { return !document.hidden; } });
    var tag = window.__fzHeute || heuteIso();
    var stand = lesen(kind, tag);
    var geschrieben = JSON.stringify(stand);
    try { var x = localStorage.getItem(kind + "-fachzeit"); if (x) geschrieben = x; } catch (e) {}

    function nachfuehren() {
      var neu = u.abholen();
      var t = window.__fzHeute || heuteIso();
      if (t !== stand.d) stand = vereinen(lesen(kind, t), null, t);   // Mitternacht: neuer Tag
      var vorher = { deutsch: stand.s.deutsch, hsu: stand.s.hsu };
      stand.s.deutsch += neu.deutsch; stand.s.hsu += neu.hsu;
      if (neu.deutsch || neu.hsu) {
        try { sessionStorage.setItem(kind + "-fachzeit-lauf", JSON.stringify(stand)); } catch (e) {}
      }
      // Ziel erreicht: einmal sofort schreiben, damit es auch ein anderes Geraet sieht.
      if ((vorher.deutsch < ZIEL && stand.s.deutsch >= ZIEL) || (vorher.hsu < ZIEL && stand.s.hsu >= ZIEL)) schreiben();
    }
    function schreiben() {
      var text = JSON.stringify(stand);
      if (text === geschrieben) return;
      try { localStorage.setItem(kind + "-fachzeit", text); geschrieben = text; } catch (e) {}
    }
    function weg() { u.verdeckt(); nachfuehren(); schreiben(); }

    ["pointerdown", "keydown", "touchstart", "wheel", "scroll", "click", "input"].forEach(function (e) {
      document.addEventListener(e, function () { u.regung(); }, { passive: true, capture: true });
    });
    /* Beim Weggehen ZUERST schreiben, dann sendet paul-sync.js (es hoert am document auf
       visibilitychange; dieses Fenster-Capture laeuft vorher). So geht der Stand im selben
       Schreibvorgang mit, statt einen eigenen zu kosten. */
    window.addEventListener("visibilitychange", function () {
      if (document.hidden) weg(); else u.sichtbarWieder();
    }, true);
    window.addEventListener("pagehide", weg, true);
    setInterval(nachfuehren, TAKT);

    laufend = {
      fach: function (f) { u.fach(f); nachfuehren(); },
      aktuell: function () { return u.aktuell(); },
      sekunden: function (f) { nachfuehren(); return stand.s[normFach(f)] || 0; },
      stand: function () { nachfuehren(); return pruefe(stand, stand.d); },
      schreiben: function () { nachfuehren(); schreiben(); }
    };
    u.fach(o.fach || null);
    u.regung();
    return laufend;
  }

  var LWFachzeit = {
    start: start,
    fach: function (f) { if (laufend) laufend.fach(f); },
    lesen: lesen, lesenAus: lesenAus, minuten: minuten, uhr: uhr, normFach: normFach,
    vereinen: vereinen, heuteIso: heuteIso, PAUSE_AB: PAUSE_AB, ZIEL: ZIEL,
    laufend: function () { return laufend; }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = LWFachzeit;
  else wurzel.LWFachzeit = LWFachzeit;
})(typeof window !== "undefined" ? window : this);
