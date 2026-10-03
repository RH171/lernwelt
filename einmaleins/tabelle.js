/* Die Einmaleins-Tabelle zum Ausfuellen (01.10.2026).
 *
 * Paul hat in Mathe ein Blatt "Das kleine 1 x 1" (Tabelle 1-10 mal 1-10) und
 * will genau das ueben: dieselbe Tabelle mit Luecken, die er selbst fuellt,
 * und einmal ganz leer - Zeile und Spalte von 1 bis 10 (Denny, 01.10.2026; die 0er-Reihe ist raus, "0 · 0 macht keinen Sinn").
 *
 * Geteilt: Paul (paul/klasse3-mathe-einmaleins-tabelle.html) und Leon
 * (leon/klasse2-mathe-einmaleins-tabelle.html) setzen window.EINMALEINS:
 *   kind, speicher, lueckenReihen (nur in diesen Reihen gibt es Luecken; leer = alle),
 *   stufen [{n, name, sub}], vorlesen (Leon).
 *
 * Bauregeln: keine Uhr waehrend des Fuellens, keine Herzen. Gezaehlt wird der
 * erste Versuch. Nach einem Fehlversuch kommt ein Tipp ueber die Nachbarzahl,
 * nach dem zweiten steht die Rechnung da - eingetippt wird trotzdem selbst.
 * Was danebenging, kommt beim naechsten Mal haeufiger als Luecke dran.
 */
(function () {
  var C = window.EINMALEINS || {};
  var KIND = C.kind || "paul";
  var SPEICHER = C.speicher || (KIND + "-einmaleins");
  var REIHEN = C.lueckenReihen || null;            // z. B. [1,2,5,10]
  var STUFEN = C.stufen || [
    { n: 10, name: "10 Lücken", sub: "zum Warmwerden" },
    { n: 25, name: "25 Lücken", sub: "ein Viertel" },
    { n: 50, name: "50 Lücken", sub: "die Hälfte" },
    { n: "leer", name: "Ganz leer", sub: "alle 100 Felder" }
  ];
  /* Zweite Uebung (01.10.2026, Pauls Wunsch ueber Denny): "Die Tabelle ist ausgefuellt,
     und immer fehlt eine Zahl - lerne daraus, wo Paul Schwierigkeiten hat."
     modus "einzeln": volle Tafel, eine Luecke je Frage. Ausgewaehlt wird nach dem, was
     wackelt (Fehler) und was lange dauert (Zeit beim ersten Versuch). Ein Fehler kommt
     in derselben Runde nach drei anderen Aufgaben noch einmal. Derselbe Speicher wie die
     Tabelle - was dort danebenging, kommt hier oefter, und umgekehrt. */
  var EINZELN = C.modus === "einzeln";
  if (EINZELN && !C.stufen) STUFEN = [
    { n: 10, name: "10 Aufgaben", sub: "kurz" },
    { n: 20, name: "20 Aufgaben", sub: "normal" },
    { n: 30, name: "30 Aufgaben", sub: "lang" }
  ];
  var LANGSAM = 6000;   // ab 6 Sekunden beim ersten Versuch gilt eine Aufgabe als "dauert noch"
  var $ = function (s) { return document.querySelector(s); };

  function lesen() { try { return JSON.parse(localStorage.getItem(SPEICHER)) || {}; } catch (e) { return {}; } }
  function schreiben(d) { try { localStorage.setItem(SPEICHER, JSON.stringify(d)); } catch (e) {} }
  var stand = lesen(); stand.fehler = stand.fehler || {}; stand.best = stand.best || {}; stand.zeit = stand.zeit || {};

  function schl(a, b) { return a + "x" + b; }
  function erlaubt(a, b) { return !REIHEN || REIHEN.indexOf(a) >= 0 || REIHEN.indexOf(b) >= 0; }

  var luecken = [], offen = {}, wahl = null, versuche = {}, erster = {}, start = 0, modus = null;
  var runde = 0, gestellt = 0, gefragtAm = 0, warte = [], zuletzt = [];

  function gewicht(k) {
    var ab = k.split("x"), a = +ab[0], b = +ab[1];
    var g = 1 + 5 * (stand.fehler[k] || 0) + (stand.zeit[k] > LANGSAM ? 3 : 0) + (stand.zeit[k] === undefined ? 1 : 0);
    if (a < 2 || b < 2) g *= 0.15;
    if (a === 10 || b === 10) g *= 0.4;
    return g;
  }
  function baustellen() {
    var ks = [];
    for (var a = 1; a <= 10; a++) for (var b = 1; b <= 10; b++) if (erlaubt(a, b)) {
      var k = schl(a, b);
      if ((stand.fehler[k] || 0) > 0 || stand.zeit[k] > LANGSAM) ks.push(k);
    }
    ks.sort(function (x, y) { return gewicht(y) - gewicht(x); });
    return ks;
  }
  function einzelneWaehlen() {
    var f = warte.filter(function (w) { return w.ab <= gestellt; })[0];
    if (f) { warte.splice(warte.indexOf(f), 1); return f.k; }
    var topf = [];
    for (var a = 1; a <= 10; a++) for (var b = 1; b <= 10; b++) if (erlaubt(a, b)) {
      var k = schl(a, b);
      if (zuletzt.indexOf(k) < 0) topf.push({ k: k, z: Math.pow(Math.random(), 1 / gewicht(k)) });
    }
    topf.sort(function (x, y) { return y.z - x.z; });
    return topf[0].k;
  }

  function waehleLuecken(n) {
    var alle = [];
    for (var a = 1; a <= 10; a++) for (var b = 1; b <= 10; b++) if (erlaubt(a, b)) alle.push([a, b]);
    if (n === "leer") return alle;
    if (n === "wackler") {
      var w = alle.filter(function (p) { return stand.fehler[schl(p[0], p[1])] > 0; });
      if (w.length >= 5) return w;
      n = 10;
    }
    // Gewicht: Gewackeltes oft, Nullen und Einsen selten (die sitzen fast immer).
    var topf = alle.map(function (p) {
      var g = 1 + 4 * (stand.fehler[schl(p[0], p[1])] || 0);
      if (p[0] < 2 || p[1] < 2) g *= 0.25;
      return { p: p, k: Math.pow(Math.random(), 1 / g) };
    });
    topf.sort(function (x, y) { return y.k - x.k; });
    return topf.slice(0, Math.min(n, topf.length)).map(function (t) { return t.p; });
  }

  /* Paul rechnet oft vom Nachbarn aus weiter ("20, 25 - also 30"). Denny, 01.10.2026:
     "Lasse daher die Zahl davor und danach weg ... Paul soll aber nur die Loesung sagen."
     In "Wo fehlt die Zahl?" bleiben deshalb die Felder links, rechts, darueber und
     darunter leer - auch die Spalte laesst sich sonst aufaddieren. */
  function verdeckt(a, b) {
    if (!EINZELN || !wahl) return false;
    var ab = wahl.split("x"), wa = +ab[0], wb = +ab[1];
    var nah = function (x, y) {
      return (a === x && Math.abs(b - y) === 1) || (b === y && Math.abs(a - x) === 1);
    };
    // Die Tauschaufgabe (8 · 4 bei 4 · 8) hat dasselbe Ergebnis und verriete die
    // Loesung - sie bleibt leer, samt ihren Nachbarn (Denny, 01.10.2026).
    if (wa !== wb && a === wb && b === wa) return true;
    return nah(wa, wb) || (wa !== wb && nah(wb, wa));
  }
  function zeichnen() {
    var t = $("#tafel"), h = '<div class="z kopf ecke">·</div>';
    // Spaltenzahl setzt der Motor selbst: Am 01.10.2026 traf auf Pauls iPad neues CSS
    // (11 Spalten) auf altes Skript (mit 0er-Reihe, 12 Felder je Zeile) - alles verrutschte.
    t.style.gridTemplateColumns = "repeat(11, var(--z))";
    for (var b = 1; b <= 10; b++) h += '<div class="z kopf" data-sp="' + b + '">' + b + '</div>';
    for (var a = 1; a <= 10; a++) {
      h += '<div class="z kopf" data-ze="' + a + '">' + a + '</div>';
      for (b = 1; b <= 10; b++) {
        var k = schl(a, b);
        if (verdeckt(a, b)) h += '<div class="z verdeckt" data-a="' + a + '" data-b="' + b + '"></div>';
        else if (offen[k] !== undefined) h += '<div class="z luecke" data-k="' + k + '" data-a="' + a + '" data-b="' + b + '">' + (offen[k] || "") + '</div>';
        else h += '<div class="z fest' + (erster[k] !== undefined ? (erster[k] ? " gut" : " spaet") : "") + '" data-a="' + a + '" data-b="' + b + '">' + (a * b) + '</div>';
      }
    }
    t.innerHTML = h;
    markieren();
  }

  function markieren() {
    document.querySelectorAll("#tafel .an").forEach(function (e) { e.classList.remove("an"); });
    if (!wahl) return;
    var z = document.querySelector('#tafel [data-k="' + wahl + '"]');
    if (z) z.classList.add("an");
    var ab = wahl.split("x");
    var zk = document.querySelector('#tafel [data-ze="' + ab[0] + '"]'), sk = document.querySelector('#tafel [data-sp="' + ab[1] + '"]');
    if (zk) zk.classList.add("an"); if (sk) sk.classList.add("an");
    $("#frage").textContent = ab[0] + " · " + ab[1] + " = " + (offen[wahl] || "?");
    $("#zaehler").textContent = EINZELN ? "Aufgabe " + (gestellt + 1) + " von " + runde : "noch " + Object.keys(offen).length + " Lücken";
  }

  function naechste() {
    if (EINZELN) {
      if (gestellt >= runde) return fertig();
      offen = {}; wahl = einzelneWaehlen(); offen[wahl] = ""; versuche[wahl] = 0;
      zuletzt.push(wahl); if (zuletzt.length > 4) zuletzt.shift();
      luecken = [wahl.split("x").map(Number)];
      gefragtAm = Date.now();
      $("#tipp").textContent = ""; $("#tipp").className = "tipp";
      zeichnen();
      $("#zaehler").textContent = "Aufgabe " + (gestellt + 1) + " von " + runde;
      return;
    }
    var ks = luecken.map(function (p) { return schl(p[0], p[1]); }).filter(function (k) { return offen[k] !== undefined; });
    if (!ks.length) return fertig();
    var i = ks.indexOf(wahl);
    wahl = ks[i >= 0 && i + 1 < ks.length ? i + 1 : 0];
    $("#tipp").textContent = ""; $("#tipp").className = "tipp";
    markieren();
  }

  function tipp(a, b) {
    // Ueber eine Nachbarzahl - nie das Ergebnis selbst.
    if (a === 0 || b === 0) return "Mal 0 ist immer 0.";
    if (a === 1 || b === 1) return "Mal 1 bleibt die Zahl gleich.";
    if (b === 10 || a === 10) return "Mal 10: hinten eine 0 anhängen.";
    if (b === 5 || a === 5) { var x = b === 5 ? a : b; return "Mal 5 ist die Hälfte von mal 10: " + x + " · 10 = " + (x * 10) + "."; }
    if (b > 1) return "Tipp: " + a + " · " + (b - 1) + " = " + (a * (b - 1)) + ", dann noch einmal " + a + " dazu.";
    return "Tipp: " + (a - 1) + " · " + b + " = " + ((a - 1) * b) + ", dann noch einmal " + b + " dazu.";
  }

  function pruefen() {
    if (!wahl || !offen[wahl]) return;
    var ab = wahl.split("x"), a = +ab[0], b = +ab[1], richtig = a * b, gegeben = +offen[wahl];
    var stimmt = gegeben === richtig;
    versuche[wahl] = (versuche[wahl] || 0) + 1;
    // Eine Wiederholung in derselben Runde zaehlt nicht noch einmal: Der erste Versuch
    // ist der Befund, sonst hebt ein "richtig beim zweiten Mal" den Fehler gleich wieder auf.
    if (versuche[wahl] === 1 && erster[wahl] === undefined) {
      erster[wahl] = stimmt;
      if (!stimmt) stand.fehler[wahl] = (stand.fehler[wahl] || 0) + 1;
      else if (stand.fehler[wahl]) stand.fehler[wahl] = Math.max(0, stand.fehler[wahl] - 1);
      if (EINZELN) {
        // Zeit nur bei richtigem ersten Versuch, geglaettet. Gedeckelt bei 30 s (Pause ist kein Ueberlegen).
        var ms = Math.min(30000, Date.now() - gefragtAm);
        if (stimmt) stand.zeit[wahl] = stand.zeit[wahl] === undefined ? ms : Math.round(stand.zeit[wahl] * 0.5 + ms * 0.5);
        if (!stimmt) warte.push({ k: wahl, ab: gestellt + 4 });
      }
      schreiben(stand);
      if (window.lernstand && window.lernstand.antwort)
        window.lernstand.antwort(stimmt, "einmaleins " + Math.max(a, b) + "er reihe", String(gegeben), String(richtig), "1x1#" + wahl);
    }
    var tp = $("#tipp");
    if (stimmt) {
      delete offen[wahl];
      if (EINZELN) gestellt++;
      zeichnen(); naechste();
      return;
    }
    offen[wahl] = "";
    var z = document.querySelector('#tafel [data-k="' + wahl + '"]');
    if (z) { z.textContent = ""; z.classList.remove("rueck"); void z.offsetWidth; z.classList.add("rueck"); }
    tp.className = "tipp zeigen";
    tp.textContent = versuche[wahl] === 1 ? "Noch nicht. " + tipp(a, b)
                                          : "Schau: " + a + " · " + b + " = " + richtig + ". Tipp es jetzt selbst ein.";
    if (C.vorlesen) sprich(tp.textContent);
    markieren();
  }

  function sprich(t) { try { var u = new SpeechSynthesisUtterance(t); u.lang = "de-DE"; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }

  function taste(z) {
    if (!wahl) return;
    if (z === "weg") offen[wahl] = String(offen[wahl] || "").slice(0, -1);
    else if (z === "ok") return pruefen();
    else if (String(offen[wahl] || "").length < 3) offen[wahl] = String(offen[wahl] || "") + z;
    var e = document.querySelector('#tafel [data-k="' + wahl + '"]');
    if (e) e.textContent = offen[wahl];
    markieren();
  }

  function los(n) {
    if (EINZELN) {
      modus = n; runde = n; gestellt = 0; warte = []; zuletzt = []; versuche = {}; erster = {}; start = Date.now();
      $("#start").classList.add("verborgen"); $("#ende").classList.add("verborgen"); $("#spiel").classList.remove("verborgen");
      return naechste();
    }
    modus = n; luecken = waehleLuecken(n); offen = {}; versuche = {}; erster = {};
    luecken.sort(function (x, y) { return x[0] - y[0] || x[1] - y[1]; });
    luecken.forEach(function (p) { offen[schl(p[0], p[1])] = ""; });
    wahl = null; start = Date.now();
    $("#start").classList.add("verborgen"); $("#ende").classList.add("verborgen"); $("#spiel").classList.remove("verborgen");
    zeichnen(); naechste();
  }

  function zeit(s) { var m = Math.floor(s / 60), r = s % 60; return (m ? m + " Min " : "") + r + " s"; }

  function fertig() {
    var s = Math.round((Date.now() - start) / 1000);
    var ks = Object.keys(erster), gut = ks.filter(function (k) { return erster[k]; }).length;
    var wack = ks.filter(function (k) { return !erster[k]; });
    var key = String(modus), alt = stand.best[key];
    if (!alt || s < alt) { stand.best[key] = s; schreiben(stand); }
    $("#spiel").classList.add("verborgen"); $("#ende").classList.remove("verborgen");
    $("#ende-zahl").textContent = gut + " von " + ks.length + " beim ersten Mal gewusst";
    $("#ende-zeit").textContent = "Gebraucht: " + zeit(s) + (alt && s < alt ? " – so schnell warst du noch nie!" : alt ? " · deine schnellste Zeit: " + zeit(alt) : "");
    $("#ende-wack").textContent = wack.length ? "Diese übst du noch: " + wack.map(function (k) { return k.replace("x", " · "); }).join(", ") : "Alles beim ersten Mal – stark!";
    if (EINZELN) {
      $("#ende-zahl").textContent = gut + " von " + ks.length + " Aufgaben beim ersten Mal gewusst";
      var bs = baustellen().slice(0, 6);
      $("#ende-wack").textContent = bs.length ? "Daran arbeiten wir weiter: " + bs.map(function (k) { return k.replace("x", " · "); }).join(", ")
                                              : "Gerade wackelt nichts – stark!";
    }
    $("#nur-wackler").classList.toggle("verborgen", EINZELN || !Object.keys(stand.fehler).some(function (k) { return stand.fehler[k] > 0; }));
  }

  function startMalen() {
    var h = "";
    STUFEN.forEach(function (s) { h += '<button class="stufe" data-n="' + s.n + '"><b>' + s.name + '</b><span>' + s.sub + '</span></button>'; });
    $("#stufen").innerHTML = h;
    var w = Object.keys(stand.fehler).filter(function (k) { return stand.fehler[k] > 0; });
    $("#wackel-start").classList.toggle("verborgen", w.length < 1 || EINZELN);
    var bst = $("#baustellen");
    if (bst) {
      var bs = baustellen().slice(0, 6);
      bst.textContent = bs.length ? "Daran arbeiten wir gerade: " + bs.map(function (k) { return k.replace("x", " · "); }).join(", ") : "";
      bst.classList.toggle("verborgen", !bs.length);
    }
    $("#wackel-start").textContent = "🔁 Nur was noch wackelt (" + w.length + ")";
  }

  document.addEventListener("click", function (e) {
    var s = e.target.closest(".stufe"); if (s) { var n = s.dataset.n; return los(n === "leer" ? "leer" : +n); }
    var l = e.target.closest("#tafel .luecke"); if (l) { wahl = l.dataset.k; $("#tipp").textContent = ""; $("#tipp").className = "tipp"; return markieren(); }
    var t = e.target.closest("[data-taste]"); if (t) return taste(t.dataset.taste);
    if (e.target.closest("#nochmal")) return los(modus === "wackler" ? 10 : modus);
    if (e.target.closest("#nur-wackler") || e.target.closest("#wackel-start")) return los("wackler");
    if (e.target.closest(".zurueck")) { $("#spiel").classList.add("verborgen"); $("#ende").classList.add("verborgen"); $("#start").classList.remove("verborgen"); startMalen(); }
  });
  document.addEventListener("keydown", function (e) {
    if ($("#spiel").classList.contains("verborgen")) return;
    if (/^[0-9]$/.test(e.key)) taste(e.key);
    else if (e.key === "Backspace") taste("weg");
    else if (e.key === "Enter") taste("ok");
  });
  window.__einmaleins = { los: los, stand: function () { return { offen: offen, wahl: wahl, erster: erster, gestellt: gestellt, warte: warte, gespeichert: stand }; },
    baustellen: baustellen, gewicht: gewicht };
  startMalen();

  // Nach einem Update genau da weitermachen (03.10.2026, lernstand.js -> LWWeiter).
  // lernstand.js laedt NACH diesem Skript (defer, Reihenfolge der Seite) - deshalb
  // ueber window.LW_WEITER, das lernstand.js beim Start selbst abholt.
  var weiterSeite = {
    sichern: function () {
      if ($("#spiel").classList.contains("verborgen") || modus === null) return null;
      return { modus: modus, luecken: luecken, offen: offen, wahl: wahl, versuche: versuche, erster: erster,
               dauer: Date.now() - start, runde: runde, gestellt: gestellt, warte: warte, zuletzt: zuletzt,
               seitFrage: Date.now() - gefragtAm, zaehler: ($("#zaehler") || {}).textContent || "" };
    },
    laden: function (d) {
      if (!d || !d.offen || d.modus === undefined) return;
      modus = d.modus; luecken = d.luecken || []; offen = d.offen; wahl = d.wahl; versuche = d.versuche || {};
      erster = d.erster || {}; start = Date.now() - (+d.dauer || 0); runde = d.runde || 0; gestellt = d.gestellt || 0;
      warte = d.warte || []; zuletzt = d.zuletzt || []; gefragtAm = Date.now() - Math.min(+d.seitFrage || 0, 30000);
      $("#start").classList.add("verborgen"); $("#ende").classList.add("verborgen"); $("#spiel").classList.remove("verborgen");
      zeichnen();
      if ($("#zaehler") && d.zaehler) $("#zaehler").textContent = d.zaehler;
    }
  };
  if (window.LWWeiter) window.LWWeiter.anmelden(weiterSeite); else window.LW_WEITER = weiterSeite;
})();
