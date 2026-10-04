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
  var hilfe = {};   // Aufgaben, bei denen das Kind den Rechenweg geoeffnet hat (04.10.2026)

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
    wegKnopfZeigen();
  }

  function naechste() {
    wegZu();
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
    // Mit Rechenweg gerechnet zaehlt fuer die Statistik als "noch nicht gewusst": Die Aufgabe
    // kommt dann oefter dran - ohne Rot, das Kind sieht nur sein Lob (04.10.2026).
    var gewusst = stimmt && !hilfe[wahl];
    versuche[wahl] = (versuche[wahl] || 0) + 1;
    // Eine Wiederholung in derselben Runde zaehlt nicht noch einmal: Der erste Versuch
    // ist der Befund, sonst hebt ein "richtig beim zweiten Mal" den Fehler gleich wieder auf.
    if (versuche[wahl] === 1 && erster[wahl] === undefined) {
      erster[wahl] = gewusst;
      if (!gewusst) stand.fehler[wahl] = (stand.fehler[wahl] || 0) + 1;
      else if (stand.fehler[wahl]) stand.fehler[wahl] = Math.max(0, stand.fehler[wahl] - 1);
      if (EINZELN) {
        // Zeit nur bei richtigem ersten Versuch, geglaettet. Gedeckelt bei 30 s (Pause ist kein Ueberlegen).
        var ms = Math.min(30000, Date.now() - gefragtAm);
        if (gewusst) stand.zeit[wahl] = stand.zeit[wahl] === undefined ? ms : Math.round(stand.zeit[wahl] * 0.5 + ms * 0.5);
        if (!gewusst) warte.push({ k: wahl, ab: gestellt + 4 });
      }
      schreiben(stand);
      if (window.lernstand && window.lernstand.antwort)
        window.lernstand.antwort(gewusst, "einmaleins " + Math.max(a, b) + "er reihe", hilfe[wahl] ? "mit Rechenweg " + gegeben : String(gegeben), String(richtig), "1x1#" + wahl);
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
    if (weg.offen) return wegTaste(z);
    if (z === "weg") offen[wahl] = String(offen[wahl] || "").slice(0, -1);
    else if (z === "ok") return pruefen();
    else if (String(offen[wahl] || "").length < 3) offen[wahl] = String(offen[wahl] || "") + z;
    var e = document.querySelector('#tafel [data-k="' + wahl + '"]');
    if (e) e.textContent = offen[wahl];
    markieren();
  }

  function los(n) {
    hilfe = {}; wegZu();
    if (EINZELN) {
      modus = n; runde = n; gestellt = 0; warte = []; zuletzt = []; versuche = {}; erster = {}; start = Date.now();
      $("#start").classList.add("verborgen"); $("#ende").classList.add("verborgen"); $("#spiel").classList.remove("verborgen");
      return naechste();
    }
    modus = n; luecken = waehleLuecken(n); offen = {}; versuche = {}; erster = {}; hilfe = {};
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

  /* Rechenweg als Lueckenkette (04.10.2026). Denny waehlte aus drei Entwuerfen
     (unterlagen/einmaleins-rechenwege-darstellung.html) Darstellung 1: nur Rechnungen,
     je eine Luecke, dazu ein Wort als Hinweis. Reihenfolge der Wege: Verdoppeln ->
     5er-Reihe -> eine Reihe mehr/weniger. Das Kind fuellt jede Luecke selbst mit dem
     Tastenfeld; erst nach einem Fehlversuch darf es sich eine Luecke zeigen lassen.
     Kein Rot, keine Uhr. Die Loesung tippt es am Ende selbst in die Tabelle.
     Leon (Klasse 2): nur Wege, deren Hilfsaufgaben in der 1er-, 2er-, 5er- oder
     10er-Reihe liegen, jede Zeile wird vorgelesen. Bei mal 1 und mal 10 gibt es keinen
     Weg - dort reicht die Merkregel aus tipp(). */
  var KERN = { 1: 1, 2: 1, 5: 1, 10: 1 };
  function leicht(x, y) { return !REIHEN || KERN[x] || KERN[y]; }
  function rechenwege(a, b) {
    var L = [];
    if (a === 1 || b === 1 || a === 10 || b === 10) return L;
    var paare = a === b ? [[a, b]] : [[a, b], [b, a]];
    // 1. Verdoppeln - bevorzugt die Zerlegung, deren Haelfte schon eine Kernaufgabe ist.
    var dop = paare.filter(function (p) { return p[0] % 2 === 0 && leicht(p[0] / 2, p[1]); })
      .sort(function (x, y) { return (KERN[y[0] / 2] ? 1 : 0) - (KERN[x[0] / 2] ? 1 : 0); })[0];
    if (dop) {
      var f = dop[0], g = dop[1], h = f / 2 * g;
      L.push({ id: "doppelt", name: "✌️ Verdoppeln", zeilen: f === 2
        ? [[g + " + " + g + " =", 2 * g, "2 mal heißt: doppelt"]]
        : [[f / 2 + " · " + g + " =", h, "die Hälfte von " + f + " mal"], [h + " + " + h + " =", 2 * h, "doppelt"]] });
    }
    // 2. 5er-Reihe: steht die 5 schon in der Aufgabe, ist 5 mal die Haelfte von 10 mal;
    //    sonst 5 mal und den Rest.
    var p5 = paare.filter(function (p) { return p[0] === 5; })[0];
    if (p5) {
      var g5 = p5[1];
      L.push({ id: "fuenf", name: "✋ 5er-Reihe", zeilen: [["10 · " + g5 + " =", 10 * g5, "leichte Aufgabe"],
        ["Hälfte von " + 10 * g5 + " =", 5 * g5, "5 ist die Hälfte von 10"]] });
    } else {
      var pr = paare.filter(function (p) { return p[0] > 5 && leicht(p[0] - 5, p[1]); })[0];
      if (pr) {
        var f6 = pr[0], g6 = pr[1], r = f6 - 5;
        L.push({ id: "fuenf", name: "✋ 5er-Reihe", zeilen: r === 1
          ? [["5 · " + g6 + " =", 5 * g6, "5er-Reihe"], [5 * g6 + " + " + g6 + " =", f6 * g6, "noch eine " + g6 + " dazu"]]
          : [["5 · " + g6 + " =", 5 * g6, "5er-Reihe"], [r + " · " + g6 + " =", r * g6, "der Rest"],
             [5 * g6 + " + " + r * g6 + " =", f6 * g6, "zusammen"]] });
      }
    }
    // 3. Eine Reihe mehr oder weniger - von einer Kernaufgabe aus.
    var nb = null;
    paare.forEach(function (p) {
      var f = p[0], g = p[1];
      if (nb) return;
      if (f > 2 && KERN[f - 1]) nb = { id: "mehr", name: "⬆️ Reihe mehr", zeilen: [[(f - 1) + " · " + g + " =", (f - 1) * g, "leichte Aufgabe"],
        [(f - 1) * g + " + " + g + " =", f * g, "eine " + g + " dazu"]] };
      else if (KERN[f + 1]) nb = { id: "weniger", name: "⬇️ Reihe weniger", zeilen: [[(f + 1) + " · " + g + " =", (f + 1) * g, "leichte Aufgabe"],
        [(f + 1) * g + " − " + g + " =", f * g, "eine " + g + " weg"]] };
    });
    // 6 · 6: "5er-Reihe" und "eine Reihe mehr" waeren dieselbe Kette - dann nur einmal.
    if (nb && !L.some(function (w) { return w.zeilen[0][0] === nb.zeilen[0][0]; })) L.push(nb);
    return L;
  }

  var LOB = ["Gut überlegt!", "Stark gerechnet!", "Du bleibst dran – genau so!", "Klasse mitgedacht!"];
  var weg = { offen: false, wege: [], w: null, i: 0, ein: "", fehl: 0, fertig: false };
  function wegBauen() {
    if ($("#weg")) return;
    var tasten = $("#tasten"); if (!tasten) return;
    var k = document.createElement("button");
    k.id = "weg-knopf"; k.className = "knopf weg-knopf verborgen"; k.type = "button";
    k.textContent = "🪜 Rechenweg";
    var box = document.createElement("div");
    box.id = "weg"; box.className = "weg verborgen";
    box.innerHTML = '<div class="weg-kopf"><b id="weg-aufgabe"></b><button type="button" class="knopf weg-zu">Zur Tabelle</button></div>' +
      '<div class="weg-wahl"></div><div class="weg-kette"></div><div class="weg-wort" aria-live="polite"></div>' +
      '<button type="button" class="knopf weg-zeigen verborgen">Zeig mir diese Zahl</button>';
    // Der Knopf sitzt in der Zeile der Aufgabe - eine eigene Zeile kostete auf kurzen
    // Bildschirmen die Tafel 38 px (gemessen 04.10.2026, 375x360).
    var oben = document.querySelector("#seite .oben"), zl = $("#zaehler");
    if (oben && zl) oben.insertBefore(k, zl); else tasten.parentNode.insertBefore(k, tasten);
    tasten.parentNode.insertBefore(box, tasten);
  }
  function wegKnopfZeigen() {
    var k = $("#weg-knopf"); if (!k) return;
    var ab = wahl ? wahl.split("x") : null;
    var da = !weg.offen && ab && offen[wahl] !== undefined && rechenwege(+ab[0], +ab[1]).length > 0;
    k.classList.toggle("verborgen", !da);
  }
  function vorlesbar(t) { return t.replace(/·/g, " mal ").replace(/−/g, " minus ").replace(/\+/g, " plus ").replace(/=/g, " ist "); }
  function wegAuf() {
    if (!wahl) return;
    var ab = wahl.split("x"), a = +ab[0], b = +ab[1];
    weg.wege = rechenwege(a, b); if (!weg.wege.length) return;
    hilfe[wahl] = true; weg.offen = true;
    $("#spiel").classList.add("weg-an");
    $("#weg").classList.remove("verborgen"); $("#weg-knopf").classList.add("verborgen");
    $("#weg-aufgabe").textContent = a + " · " + b + " = ?";
    $("#tipp").textContent = ""; $("#tipp").className = "tipp";
    var wl = $("#weg .weg-wahl"), h = "";
    weg.wege.forEach(function (w, i) { h += '<button type="button" class="weg-art" data-weg="' + i + '">' + w.name + '</button>'; });
    wl.innerHTML = h;
    wegStart(0);
  }
  function wegStart(i) {
    weg.w = weg.wege[i]; weg.i = 0; weg.ein = ""; weg.fehl = 0; weg.fertig = false;
    document.querySelectorAll("#weg .weg-art").forEach(function (x, j) { x.classList.toggle("an", j === i); });
    $("#weg .weg-kette").innerHTML = ""; $("#weg .weg-zu").classList.remove("primaer");
    wegZeile();
  }
  function wegZeile() {
    var z = weg.w.zeilen[weg.i];
    var r = document.createElement("div"); r.className = "weg-zeile";
    r.innerHTML = '<span>' + z[0] + '</span> <span class="lk aktiv"></span>';
    var kette = $("#weg .weg-kette"); kette.appendChild(r);
    var bx = $("#weg"); if (bx.scrollHeight > bx.clientHeight) bx.scrollTop = bx.scrollHeight;
    weg.ein = ""; weg.fehl = 0;
    $("#weg .weg-zeigen").classList.add("verborgen");
    $("#weg .weg-wort").textContent = z[2];
    if (C.vorlesen) sprich(vorlesbar(z[0]) + " wie viel? " + z[2]);
  }
  function wegLuecke() { var l = document.querySelectorAll("#weg .lk"); return l[l.length - 1]; }
  function wegWeiter(gezeigt) {
    var z = weg.w.zeilen[weg.i], l = wegLuecke();
    l.textContent = z[1]; l.className = "lk " + (gezeigt ? "gezeigt" : "ok");
    weg.i++;
    if (weg.i >= weg.w.zeilen.length) {
      weg.fertig = true;
      var ab = wahl.split("x");
      var t = (gezeigt ? "" : LOB[Math.floor(Math.random() * LOB.length)] + " ") + "Jetzt tipp " + ab[0] + " · " + ab[1] + " selbst in die Tabelle.";
      $("#weg .weg-wort").textContent = t;
      $("#weg .weg-zeigen").classList.add("verborgen");
      $("#weg .weg-zu").classList.add("primaer");
      if (C.vorlesen) sprich(t.replace(/·/g, " mal "));
      return;
    }
    if (!gezeigt) $("#weg .weg-wort").textContent = LOB[Math.floor(Math.random() * LOB.length)];
    setTimeout(wegZeile, gezeigt ? 0 : 450);
  }
  function wegTaste(z) {
    if (weg.fertig) { if (z === "ok") wegZu(); return; }
    var l = wegLuecke(); if (!l || !l.classList.contains("aktiv")) return;
    var soll = weg.w.zeilen[weg.i][1];
    if (z === "weg") weg.ein = weg.ein.slice(0, -1);
    else if (z === "ok") {
      if (!weg.ein) return;
      if (+weg.ein === soll) { weg.ein = ""; return wegWeiter(false); }
      weg.fehl++; weg.ein = "";
      l.classList.remove("rueck"); void l.offsetWidth; l.classList.add("rueck");
      $("#weg .weg-wort").textContent = "Fast! Schau noch mal: " + weg.w.zeilen[weg.i][2] + ".";
      $("#weg .weg-zeigen").classList.remove("verborgen");
    } else if (weg.ein.length < 3) weg.ein += z;
    l.textContent = weg.ein;
  }
  function wegZu() {
    if (!weg.offen) return;
    weg.offen = false;
    var sp = $("#spiel"); if (sp) sp.classList.remove("weg-an");
    var b = $("#weg"); if (b) b.classList.add("verborgen");
    if (wahl && $("#tafel")) markieren();
  }
  wegBauen();
  document.addEventListener("click", function (e) {
    if (e.target.closest("#weg-knopf")) return wegAuf();
    if (e.target.closest("#weg .weg-zu")) return wegZu();
    if (e.target.closest("#weg .weg-zeigen")) return wegWeiter(true);
    var w = e.target.closest("#weg .weg-art"); if (w) return wegStart(+w.dataset.weg);
  });

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
  window.__einmaleins = { los: los, stand: function () { return { offen: offen, wahl: wahl, erster: erster, gestellt: gestellt, warte: warte, gespeichert: stand, hilfe: hilfe, weg: weg }; },
    baustellen: baustellen, gewicht: gewicht, rechenwege: rechenwege };
  startMalen();

  // Nach einem Update genau da weitermachen (03.10.2026, lernstand.js -> LWWeiter).
  // lernstand.js laedt NACH diesem Skript (defer, Reihenfolge der Seite) - deshalb
  // ueber window.LW_WEITER, das lernstand.js beim Start selbst abholt.
  var weiterSeite = {
    sichern: function () {
      if ($("#spiel").classList.contains("verborgen") || modus === null) return null;
      return { modus: modus, luecken: luecken, offen: offen, wahl: wahl, versuche: versuche, erster: erster,
               dauer: Date.now() - start, runde: runde, gestellt: gestellt, warte: warte, zuletzt: zuletzt,
               seitFrage: Date.now() - gefragtAm, hilfe: hilfe, zaehler: ($("#zaehler") || {}).textContent || "" };
    },
    laden: function (d) {
      if (!d || !d.offen || d.modus === undefined) return;
      modus = d.modus; luecken = d.luecken || []; offen = d.offen; wahl = d.wahl; versuche = d.versuche || {};
      erster = d.erster || {}; start = Date.now() - (+d.dauer || 0); runde = d.runde || 0; gestellt = d.gestellt || 0;
      warte = d.warte || []; zuletzt = d.zuletzt || []; hilfe = d.hilfe || {}; gefragtAm = Date.now() - Math.min(+d.seitFrage || 0, 30000);
      $("#start").classList.add("verborgen"); $("#ende").classList.add("verborgen"); $("#spiel").classList.remove("verborgen");
      zeichnen();
      if ($("#zaehler") && d.zaehler) $("#zaehler").textContent = d.zaehler;
    }
  };
  if (window.LWWeiter) window.LWWeiter.anmelden(weiterSeite); else window.LW_WEITER = weiterSeite;
})();
