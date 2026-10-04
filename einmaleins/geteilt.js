/* "Wo fehlt die Zahl? · Geteilt" (04.10.2026, Dennys Wahl "1 · Leere Tafel, die sich fuellt").
 *
 * Paul (4. Klasse) uebt das Geteilt-Einmaleins an derselben Tafel wie "Wo fehlt die Zahl?".
 * Waehrend der Frage stehen nur Kopfzeile, Kopfspalte und die in dieser Runde schon richtig
 * geloesten Felder da, alle anderen Felder sind leer. Frage z. B. "42 : 6 = ?". Richtig: das
 * Feld 6 · 7 = 42 leuchtet gruen auf und bleibt gefuellt.
 *
 * Ueberspring-Regel: Ist das Feld (Reihe 6, Spalte 7) oder sein Spiegelfeld (Reihe 7, Spalte 6)
 * schon gefuellt, kommt die Aufgabe in dieser Runde nicht dran - sonst waere sie ablesbar
 * (Version A "Kreuz" war genau daran gescheitert, unterlagen/division-tabelle-ideen.html).
 *
 * Eigene Datei, damit /einmaleins/tabelle.js (Multiplikation, Paul und Leon) unberuehrt bleibt.
 * Aussehen kommt aus tabelle.css, dazu geteilt.css. Bauregeln wie dort: keine Uhr, kein Rot,
 * gezaehlt wird der erste Versuch, Hilfe in Stufen (Kapitel 044).
 * Seite setzt window.GETEILT = { kind, speicher }.
 */
(function () {
  var C = window.GETEILT || {};
  var KIND = C.kind || "paul";
  var SPEICHER = C.speicher || (KIND + "-geteilt");
  var STUFEN = C.stufen || [
    { n: 10, name: "10 Aufgaben", sub: "kurz" },
    { n: 20, name: "20 Aufgaben", sub: "normal" },
    { n: 30, name: "30 Aufgaben", sub: "lang" }
  ];
  var LANGSAM = 6000;   // ab 6 s beim ersten Versuch "dauert noch" (wie im Einmaleins)
  var LEUCHTEN = 1100;  // so lange leuchtet das neue Feld, bevor die naechste Frage kommt
  var $ = function (s) { return document.querySelector(s); };

  function lesen() { try { return JSON.parse(localStorage.getItem(SPEICHER)) || {}; } catch (e) { return {}; } }
  function schreiben(d) { try { localStorage.setItem(SPEICHER, JSON.stringify(d)); } catch (e) {} }
  var stand = lesen(); stand.fehler = stand.fehler || {}; stand.best = stand.best || {}; stand.zeit = stand.zeit || {};

  /* Eine Aufgabe heisst "D:d" (42:6). Ihr Feld liegt in Reihe d, Spalte q = D/d. */
  function aufgabe(d, q) { return (d * q) + ":" + d; }
  function teile(k) { var p = k.split(":"), D = +p[0], d = +p[1]; return { D: D, d: d, q: D / d }; }
  function feld(a, b) { return a + "x" + b; }
  function alleAufgaben() {
    var r = [];
    for (var d = 1; d <= 10; d++) for (var q = 1; q <= 10; q++) r.push(aufgabe(d, q));
    return r;
  }

  var gefuellt = {}, erster = {}, versuche = 0, wahl = null, eingabe = "", phase = "frage";
  var runde = 0, gestellt = 0, gefragtAm = 0, start = 0, modus = null, neu = null, zeitgeber = 0;

  /* Die Ueberspring-Regel. Frei ist eine Aufgabe nur, wenn weder ihr Feld noch das
     Spiegelfeld schon gefuellt ist. */
  function frei(k, voll) {
    var t = teile(k); voll = voll || gefuellt;
    return !voll[feld(t.d, t.q)] && !voll[feld(t.q, t.d)];
  }
  function gewicht(k) {
    var t = teile(k);
    var g = 1 + 5 * (stand.fehler[k] || 0) + (stand.zeit[k] > LANGSAM ? 3 : 0) + (stand.zeit[k] === undefined ? 1 : 0);
    // Wie im Einmaleins (Kapitel 093): 1er-Reihe selten, 10er-Reihe seltener. Die 0er gibt es nicht.
    if (t.d === 1 || t.q === 1) g *= 0.15;
    if (t.d === 10 || t.q === 10) g *= 0.4;
    return g;
  }
  function waehlen() {
    var topf = alleAufgaben().filter(function (k) { return frei(k); })
      .map(function (k) { return { k: k, z: Math.pow(Math.random(), 1 / gewicht(k)) }; });
    if (!topf.length) return null;
    topf.sort(function (x, y) { return y.z - x.z; });
    return topf[0].k;
  }
  function baustellen() {
    var ks = alleAufgaben().filter(function (k) { return (stand.fehler[k] || 0) > 0 || stand.zeit[k] > LANGSAM; });
    ks.sort(function (x, y) { return gewicht(y) - gewicht(x); });
    return ks;
  }
  function zeigeAufgabe(k) { return k.replace(":", " : "); }

  function zeichnen() {
    var t = $("#tafel"), h = '<div class="z kopf ecke">:</div>', w = wahl && teile(wahl);
    t.style.gridTemplateColumns = "repeat(11, var(--z))";
    for (var b = 1; b <= 10; b++)
      h += '<div class="z kopf' + (w && phase === "richtig" && b === w.q ? " an" : "") + '" data-sp="' + b + '">' + b + '</div>';
    for (var a = 1; a <= 10; a++) {
      h += '<div class="z kopf' + (w && a === w.d ? " an" : "") + '" data-ze="' + a + '">' + a + '</div>';
      for (b = 1; b <= 10; b++) {
        var f = feld(a, b);
        if (gefuellt[f]) h += '<div class="z fest ' + (gefuellt[f] === "gut" ? "gut" : "spaet") + (neu === f ? " neu" : "") +
                              '" data-a="' + a + '" data-b="' + b + '">' + (a * b) + '</div>';
        else h += '<div class="z leer" data-a="' + a + '" data-b="' + b + '"></div>';
      }
    }
    t.innerHTML = h;
  }
  function frageZeigen() {
    if (!wahl) return;
    var t = teile(wahl);
    $("#frage").textContent = t.D + " : " + t.d + " = " + (phase === "richtig" ? t.q : (eingabe || "?"));
    $("#zaehler").textContent = "Aufgabe " + Math.min(gestellt + 1, runde) + " von " + runde;
  }
  function meldung(text, art) {
    var tp = $("#tipp");
    tp.textContent = text || "";
    tp.className = "tipp" + (text ? " zeigen" : "") + (art ? " " + art : "");
  }

  function naechste() {
    clearTimeout(zeitgeber); neu = null;
    if (gestellt >= runde) return fertig();
    wahl = waehlen();
    if (!wahl) return fertig();   // geht bei hoechstens 30 Aufgaben nicht leer (55 Paare), aber sicher ist sicher
    eingabe = ""; versuche = 0; phase = "frage"; gefragtAm = Date.now();
    meldung("");
    zeichnen(); frageZeigen();
  }

  function pruefen() {
    if (phase === "richtig") return naechste();
    if (!wahl || !eingabe) return;
    var t = teile(wahl), gegeben = +eingabe, stimmt = gegeben === t.q;
    versuche++;
    if (versuche === 1 && erster[wahl] === undefined) {
      // Der erste Versuch ist der Befund (Kapitel 044): Was erst mit Tipp klappt, war noch nicht gewusst.
      erster[wahl] = stimmt;
      if (!stimmt) stand.fehler[wahl] = (stand.fehler[wahl] || 0) + 1;
      else if (stand.fehler[wahl]) stand.fehler[wahl] = Math.max(0, stand.fehler[wahl] - 1);
      var ms = Math.min(30000, Date.now() - gefragtAm);
      if (stimmt) stand.zeit[wahl] = stand.zeit[wahl] === undefined ? ms : Math.round(stand.zeit[wahl] * 0.5 + ms * 0.5);
      schreiben(stand);
      if (window.lernstand && window.lernstand.antwort)
        window.lernstand.antwort(stimmt, "geteilt durch " + t.d, String(gegeben), String(t.q), "geteilt#" + wahl);
    }
    if (stimmt) {
      var f = feld(t.d, t.q);
      gefuellt[f] = erster[wahl] ? "gut" : "spaet";
      neu = f; phase = "richtig"; gestellt++;
      meldung("Richtig! " + t.d + " · " + t.q + " = " + t.D + ", also " + t.D + " : " + t.d + " = " + t.q + ".", "ok");
      zeichnen(); frageZeigen();
      zeitgeber = setTimeout(naechste, LEUCHTEN);
      return;
    }
    // Falsch: kein Rot, die Frage bleibt, es gibt Hilfe in Stufen.
    eingabe = "";
    meldung(versuche === 1 ? "Noch nicht. Welche Malaufgabe passt? " + t.d + " · ? = " + t.D
                           : "Schau: " + t.d + " · " + t.q + " = " + t.D + ". Tipp es jetzt selbst ein.");
    var fr = $("#frage"); fr.classList.remove("rueck"); void fr.offsetWidth; fr.classList.add("rueck");
    frageZeigen();
  }

  function taste(z) {
    if (!wahl) return;
    if (z === "ok") return pruefen();
    if (phase !== "frage") return;
    if (z === "weg") eingabe = eingabe.slice(0, -1);
    else if (eingabe.length < 2) eingabe += z;
    frageZeigen();
  }

  function los(n) {
    clearTimeout(zeitgeber);
    modus = n; runde = n; gestellt = 0; gefuellt = {}; erster = {}; neu = null; start = Date.now();
    $("#start").classList.add("verborgen"); $("#ende").classList.add("verborgen"); $("#spiel").classList.remove("verborgen");
    naechste();
  }

  function zeit(s) { var m = Math.floor(s / 60), r = s % 60; return (m ? m + " Min " : "") + r + " s"; }
  function fertig() {
    clearTimeout(zeitgeber); wahl = null; phase = "fertig";
    var s = Math.round((Date.now() - start) / 1000);
    var ks = Object.keys(erster), gut = ks.filter(function (k) { return erster[k]; }).length;
    var key = String(modus), alt = stand.best[key];
    if (!alt || s < alt) { stand.best[key] = s; schreiben(stand); }
    $("#spiel").classList.add("verborgen"); $("#ende").classList.remove("verborgen");
    $("#ende-zahl").textContent = gut + " von " + ks.length + " Aufgaben beim ersten Mal gewusst";
    $("#ende-zeit").textContent = "Gebraucht: " + zeit(s) + (alt && s < alt ? " – so schnell warst du noch nie!" : alt ? " · deine schnellste Zeit: " + zeit(alt) : "");
    var bs = baustellen().slice(0, 6);
    $("#ende-wack").textContent = bs.length ? "Daran arbeiten wir weiter: " + bs.map(zeigeAufgabe).join(", ") : "Gerade wackelt nichts – stark!";
  }

  function startMalen() {
    var h = "";
    STUFEN.forEach(function (s) { h += '<button class="stufe" data-n="' + s.n + '"><b>' + s.name + '</b><span>' + s.sub + '</span></button>'; });
    $("#stufen").innerHTML = h;
    var bst = $("#baustellen"), bs = baustellen().slice(0, 6);
    bst.textContent = bs.length ? "Daran arbeiten wir gerade: " + bs.map(zeigeAufgabe).join(", ") : "";
    bst.classList.toggle("verborgen", !bs.length);
  }

  document.addEventListener("click", function (e) {
    var s = e.target.closest(".stufe"); if (s) return los(+s.dataset.n);
    var t = e.target.closest("[data-taste]"); if (t) return taste(t.dataset.taste);
    if (e.target.closest("#nochmal")) return los(modus);
    if (e.target.closest(".zurueck")) {
      clearTimeout(zeitgeber); wahl = null;
      $("#spiel").classList.add("verborgen"); $("#ende").classList.add("verborgen"); $("#start").classList.remove("verborgen"); startMalen();
    }
  });
  document.addEventListener("keydown", function (e) {
    if ($("#spiel").classList.contains("verborgen")) return;
    if (/^[0-9]$/.test(e.key)) taste(e.key);
    else if (e.key === "Backspace") taste("weg");
    else if (e.key === "Enter") taste("ok");
  });

  /* Selbsttest der Ueberspring-Regel, erschoepfend: Ob eine Aufgabe frei ist, haengt nur
     davon ab, ob zwei bestimmte Felder gefuellt sind. Also genuegt es, fuer jede der 100
     Aufgaben jedes der 100 Felder einzeln gefuellt zu pruefen: Frei darf sie genau dann
     sein, wenn das Feld weder ihr eigenes noch ihr Spiegelfeld ist. */
  function selbsttest() {
    var fehler = [];
    alleAufgaben().forEach(function (k) {
      var t = teile(k);
      for (var a = 1; a <= 10; a++) for (var b = 1; b <= 10; b++) {
        var v = {}; v[feld(a, b)] = "gut";
        var verraet = (a === t.d && b === t.q) || (a === t.q && b === t.d);
        if (frei(k, v) === verraet) fehler.push(k + " bei gefuelltem " + a + " · " + b);
      }
      if (!frei(k, {})) fehler.push(k + " ist auf leerer Tafel nicht frei");
    });
    return fehler;
  }

  window.__geteilt = {
    los: los, selbsttest: selbsttest, gewicht: gewicht, baustellen: baustellen, frei: frei,
    stand: function () { return { wahl: wahl, phase: phase, gefuellt: gefuellt, erster: erster, gestellt: gestellt, runde: runde, versuche: versuche, gespeichert: stand }; },
    weiter: naechste
  };
  startMalen();

  // Nach einem Update genau da weitermachen (wie tabelle.js, lernstand.js -> LWWeiter).
  var weiterSeite = {
    sichern: function () {
      if ($("#spiel").classList.contains("verborgen") || modus === null) return null;
      return { modus: modus, runde: runde, gestellt: gestellt, gefuellt: gefuellt, erster: erster,
               wahl: phase === "richtig" ? null : wahl, versuche: versuche, dauer: Date.now() - start,
               seitFrage: Date.now() - gefragtAm };
    },
    laden: function (d) {
      if (!d || d.modus === undefined || !d.gefuellt) return;
      modus = d.modus; runde = d.runde || 0; gestellt = d.gestellt || 0; gefuellt = d.gefuellt; erster = d.erster || {};
      start = Date.now() - (+d.dauer || 0);
      $("#start").classList.add("verborgen"); $("#ende").classList.add("verborgen"); $("#spiel").classList.remove("verborgen");
      // Die gesicherte Frage nur nehmen, wenn sie noch frei ist - sonst eine neue.
      if (d.wahl && frei(d.wahl)) {
        wahl = d.wahl; versuche = d.versuche || 0; eingabe = ""; phase = "frage"; neu = null;
        gefragtAm = Date.now() - Math.min(+d.seitFrage || 0, 30000);
        meldung(""); zeichnen(); frageZeigen();
      } else naechste();
    }
  };
  if (window.LWWeiter) window.LWWeiter.anmelden(weiterSeite); else window.LW_WEITER = weiterSeite;
})();
