/* Pauls Probenstoff Mathe – die Anzeige (13.10.2026). Rechnet nichts selbst: Runde, Prüfung,
 * Hilfen und Buchung kommen aus /probenstoff/motor.js (window.PSMotor).
 *
 * Ablauf: Start → Teil 1 (Kiste + 8 frische, gemischt) → Zwischenschirm → Teil 2 (Textaufgaben im Wortlaut der Lehrerin und Sachaufgaben) → Ende.
 * Gezählt wird der erste Versuch, Hilfe in Stufen (Kapitel 044). Eingabe: ein Feld, zwei Felder
 * (Ergebnis und R) oder Zahlen antippen (Teiler, Vielfache).
 * Speicher: localStorage "paul-probenstoff" (paul-sync.js schickt ihn mit), EIN Schreibvorgang je
 * fertigem Teil, höchstens drei am Tag; darüber hinaus bleibt der Stand im sessionStorage und reist mit
 * dem nächsten Schreibvorgang mit. Zwischenstand je Antwort nur im sessionStorage und über LWWeiter.
 * Nach dem 19.10.2026 zeigt die Seite nur noch einen ruhigen Satz (Motor: aktiv()).
 * Teil 3 Fachwörter (18.10.2026): eigene Runde mit 20 Aufgaben (Antippen eines Wortes oder eine Zahl), jederzeit
 * startbar, auch über ?fw=1 von der Lernliste. Ein Schreibvorgang je fertiger Runde, innerhalb der drei am Tag.
 */
(function () {
  "use strict";
  var M = window.PSMotor;
  var RW = window.Rechenweg, RK = window.Rechenkaestchen;   // Rechenweg-Hilfe (14.10.2026, Kapitel 121)
  var RW_ZU = "paul-probenstoff-rw-zu";                       // sessionStorage: Paul hat „Schritt für Schritt“ zugeklappt
  var MW = window.MeinWeg, MW_AUF = "paul-probenstoff-mw-auf"; // „Mein Rechenweg“ (sessionStorage: zuletzt offen)
  var SPEICHER = "paul-probenstoff", LAUF = "paul-probenstoff-lauf", NACHTRAG = "paul-probenstoff-nachtrag";
  var BLATT = "paul-probenstoff-blatt";   // sessionStorage: Stoff von Pauls Blättern für heute (16.10.2026)
  function $(id) { return document.getElementById(id); }
  function esc(t) { var d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; }

  var datum = M.heuteIso();
  var stand = laden();
  var lauf = null;   // { d, nr, phase:"1"|"2"|"1-fertig", liste:[{k,kk}], i, erg:{1:[],2:[]}, versuche, eingabe:{a,b}, feld, wahl:[], tipp }
  var sperre = false, shown = 0, verdeckt = 0, verdecktSeit = 0, weiterAb = 0;

  /* Stoff von Pauls neuesten Matheblättern (16.10.2026): GET /api/probenstoff, einmal je Tag und Tab
     (sessionStorage), damit Neuladen dieselbe Runde zeigt. Kommt nichts (offline, Messung), gilt der
     eingebaute Stand im Motor. Nur lesen, kein Schreibvorgang. */
  var blatt = null;
  function blattHolen(fertig) {
    if (window.__psBlatt) { blatt = window.__psBlatt; fertig(); return; }   // Messung
    try { var c = JSON.parse(sessionStorage.getItem(BLATT) || "null"); if (c && c.d === datum && c.b) { blatt = c.b; fertig(); return; } } catch (e) {}
    var fertigGemacht = false;
    function ende(b) {
      if (fertigGemacht) return; fertigGemacht = true;
      blatt = b && b.ok ? { stellen: b.stellen || [], quellen: b.quellen || [] } : M.BLATT_STAND;
      if (b && b.ok) { try { sessionStorage.setItem(BLATT, JSON.stringify({ d: datum, b: blatt })); } catch (e) {} }
      fertig();
    }
    setTimeout(function () { ende(null); }, 3500);
    try {
      fetch("/api/probenstoff?kind=paul", { credentials: "same-origin", cache: "no-store" })
        .then(function (r) { return r.ok && /json/.test(r.headers.get("content-type") || "") ? r.json() : null; })
        .then(ende, function () { ende(null); });
    } catch (e) { ende(null); }
  }

  function laden() {
    var s = null, n = null;
    try { s = JSON.parse(localStorage.getItem(SPEICHER) || "null"); } catch (e) {}
    try { n = JSON.parse(sessionStorage.getItem(NACHTRAG) || "null"); } catch (e) {}
    s = M.standPruefen(s);
    if (n && n.stand && n.zahl > zahlTeile(s)) s = M.standPruefen(n.stand);
    return s;
  }
  function zahlTeile(s) { var z = 0; for (var d in s.tage) z += (s.tage[d] || []).length; return z; }
  function speichern() {
    if (M.darfSchreiben(stand, datum)) {
      M.geschrieben(stand, datum);
      try { localStorage.setItem(SPEICHER, JSON.stringify(stand)); } catch (e) {}
      try { sessionStorage.removeItem(NACHTRAG); } catch (e) {}
    } else {
      try { sessionStorage.setItem(NACHTRAG, JSON.stringify({ zahl: zahlTeile(stand), stand: stand })); } catch (e) {}
    }
  }
  function laufMerken() { try { sessionStorage.setItem(LAUF, JSON.stringify(lauf)); } catch (e) {} }
  function laufHolen() {
    var l = null;
    try { l = JSON.parse(sessionStorage.getItem(LAUF) || "null"); } catch (e) {}
    return l && l.d === datum ? l : null;
  }
  function laufWeg() { try { sessionStorage.removeItem(LAUF); } catch (e) {} }
  function h() { return M.heuteStand(stand, datum); }

  /* ---------- Start ---------- */
  function startZeigen() {
    if (!M.aktiv(datum)) { zeige("aus"); return; }
    zeige("start");
    var hs = h(), runde = M.tagesRunde(stand, datum, hs.t2 ? hs.n : 0, blatt);
    $("teil-1-satz").textContent = runde.teil1.length + " Aufgaben: Mal, Geteilt, Rest, Punkt vor Strich, Teiler und Aufgaben wie auf deinen Blättern.";
    $("teil-2-satz").textContent = runde.teil2.length + " Textaufgaben: wie auf deinen Blättern und aus dem Alltag.";
    $("teil-1").classList.toggle("fertig", !!hs.t1);
    $("teil-2").classList.toggle("fertig", !!hs.t2);
    $("los").textContent = hs.t2 ? "Noch eine Runde" : hs.t1 ? "Weiter mit Teil 2" : "Los geht's";
    $("start-fertig").textContent = hs.t2 ? "Heute geschafft! Du kannst noch eine Runde mit neuen Aufgaben rechnen." : "";
    // Teil 3 Fachwörter (18.10.2026): eigene Runde, unabhängig von Teil 1 und 2.
    var fn = M.fachNr(stand, datum);
    $("teil-3-satz").textContent = M.EIN.fach + " Aufgaben: addieren, Produkt, Umkehraufgabe, Primzahl und mehr.";
    $("teil-3").classList.toggle("fertig", fn > 0);
    $("los-fw").textContent = fn > 0 ? "Noch eine Runde Fachwörter" : "Fachwörter üben";
  }

  /* ---------- Spiel ---------- */
  function rundeBeginnen(phase) {
    if (phase === "3") {   // Teil 3 Fachwörter: eigene Runde, eigener Zähler (fachNr)
      var fnr = M.fachNr(stand, datum), fl = M.fachRunde(stand, datum, fnr);
      lauf = { d: datum, nr: fnr, runde: { teil3: fl }, phase: "3", liste: fl.slice(), i: 0, erg: { 3: [] },
        versuche: 0, eingabe: { a: "", b: "" }, feld: "a", wahl: [], nein: [], tipp: "", wdh: 0 };
      laufMerken(); zeige("spiel"); aufgabeZeigen();
      return;
    }
    var hs = h(), nr = hs.t2 ? hs.n : 0;
    var runde = lauf && lauf.runde ? lauf.runde : M.tagesRunde(stand, datum, nr, blatt);
    var erg = lauf && lauf.erg ? lauf.erg : { 1: [], 2: [] };
    lauf = { d: datum, nr: nr, runde: runde, phase: phase, liste: (phase === "1" ? runde.teil1 : runde.teil2).slice(), i: 0, erg: erg,
      versuche: 0, eingabe: { a: "", b: "" }, feld: "a", wahl: [], tipp: "", wdh: 0 };
    laufMerken();
    zeige("spiel");
    aufgabeZeigen();
  }
  function aktuell() { var e = lauf && lauf.liste[lauf.i]; return e ? M.aufgabe(e.k) : null; }

  function feldHtml(name, label) {
    return '<span class="feldbox"><span class="feld' + (lauf.feld === name ? " aktiv" : "") + '" id="feld-' + name + '" data-feld="' + name + '" role="button" tabindex="0" aria-label="' + esc(label) + '">' +
      esc(lauf.eingabe[name]) + '</span><small>' + esc(label) + '</small></span>';
  }
  function frageHtml(x) {
    if (x.typ === "wahl") {   // Fachwörter: genau ein Wort (oder eine Aufgabe) antippen, dann Prüfen
      var nein = lauf.nein || [];
      return '<p class="auftrag" id="frage">' + esc(x.text) + '</p><div class="chips woerter' + (x.zeichen ? " zeichen" : "") + '" role="group">' + x.optionen.map(function (c, i) {
        var an = lauf.wahl.indexOf(c) >= 0;
        return '<button type="button" class="chip wort' + (an ? " an" : "") + (nein.indexOf(c) >= 0 ? " nein" : "") + '" data-wahl="' + i + '" aria-pressed="' + an + '">' + esc(c) + '</button>';
      }).join("") + '</div>';
    }
    if (x.art === "fw") {   // Fachwörter mit Zahl: Auftrag im Wortlaut, dann Feld (mit Antwortsatz) oder die Aufgabe mit Lücke
      var fk = '<p class="sachtext" id="frage">' + esc(x.text) + '</p>';
      if (x.frage === "?") return fk + '<div class="zeile sach"><span class="satz">' + esc(x.satz) + '</span>' + feldHtml("a", "Antwort") + '</div>';
      var ft = x.frage.split("?");
      return fk + '<div class="zeile"><span>' + esc(ft[0]) + '</span>' + feldHtml("a", "Ergebnis") + '<span>' + esc(ft[1] || "") + '</span></div>';
    }
    if (x.typ === "tippen") {
      return '<p class="auftrag" id="frage">' + esc(x.frage) + '</p><div class="chips" role="group">' + x.chips.map(function (c) {
        var an = lauf.wahl.indexOf(c) >= 0;
        return '<button type="button" class="chip' + (an ? " an" : "") + '" data-chip="' + c + '" aria-pressed="' + an + '">' + c + '</button>';
      }).join("") + '</div>';
    }
    var kopf = x.text ? '<p class="sachtext" id="frage">' + esc(x.text) + '</p>' : "";
    var zeile;
    if (x.art === "sach" || x.art === "raet" || x.art === "lt") {
      /* Zahlenrätsel und Textaufgaben der Lehrerin: Antwortsatz wie auf dem Blatt („Meine Zahl ist …“). */
      zeile = x.typ === "rest"
        ? feldHtml("a", x.labelA) + '<span class="und">und</span>' + feldHtml("b", x.labelB)
        : (x.satz ? '<span class="satz">' + esc(x.satz) + '</span>' : "") + feldHtml("a", "Antwort") + (x.einheit ? '<span class="einheit">' + esc(x.einheit) + '</span>' : "");
      return kopf + '<div class="zeile sach">' + zeile + '</div>';
    }
    if (x.typ === "rest") {
      var vorn = x.frage.split(" = ")[0];
      return '<div class="zeile" id="frage"><span>' + esc(vorn) + ' =</span>' + feldHtml("a", "Ergebnis") + '<span>R</span>' + feldHtml("b", "Rest") + '</div>';
    }
    var teile = x.frage.split("?"), vorn = esc(teile[0]);
    var z = rwZerlegung();
    if (z && x.art === "punkt" && lauf.rw.auf && !lauf.rw.ok[0]) vorn = tokHtml(z.schritte[0].vorher, z.schritte[0].von, z.schritte[0].bis) + " =";
    return '<div class="zeile" id="frage"><span>' + vorn + '</span>' + feldHtml("a", "Ergebnis") + '<span>' + esc(teile[1] || "") + '</span></div>' + rwHtml();
  }

  /* ---------- Rechenweg (14.10.2026) ----------
   * Bei Punkt vor Strich (und bei der Einkaufs-Sachaufgabe ab dem zweiten Fehlversuch) zerlegt
   * /rechenweg/rechenweg.js die Aufgabe in Zwischenschritte mit eigenen Kästchen. Zwischenschritte
   * werden geprüft, zählen aber nicht als Versuch und melden nichts. Das letzte Kästchen ist die
   * Antwort: Prüfen dort geht wie das Feld oben in die Wertung (erster Versuch zählt).
   * lauf.rw = { k, aus, auf, w:[Eingaben], ok:[bool], v:[Fehlversuche], rk:Schritt mit Kästchen|-1 } */
  function rwNeu(x, auf) {
    if (!RW) return null;
    var aus = x.art === "punkt" || (x.art === "rech" && x.tz.length > 2) ? x.frage.replace(/\s*=\s*\?\s*$/, "") : x.art === "sach" && x.links != null ? x.rechnung : null;
    if (!aus || !RW.zerlege(aus)) return null;
    return { k: x.k, aus: aus, auf: auf, w: [], ok: [], v: [], rk: -1 };
  }
  function rwZuGemerkt() { try { return sessionStorage.getItem(RW_ZU) === "1"; } catch (e) { return false; } }
  function rwZerlegung() { return lauf && lauf.rw ? RW.zerlege(lauf.rw.aus) : null; }
  function rwJetzt(z) { for (var i = 0; i < z.schritte.length; i++) if (!lauf.rw.ok[i]) return i; return -1; }
  function tokHtml(tok, von, bis) {
    var s = "";
    tok.forEach(function (t, i) {
      var w = t.k ? t.k : t.n != null ? String(t.n) : RW.ANZEIGE[t.o];
      var teil = esc(w);
      if (i === von) teil = '<mark class="rw-mark">' + teil;
      if (i === bis) teil = teil + '</mark>';
      s += (s && t.k !== ")" && !/\($/.test(s) ? " " : "") + teil;
    });
    return s;
  }
  function rwZahl(n, von) {
    return von != null && !lauf.rw.ok[von] ? '<span class="rw-luecke" aria-label="kommt aus dem Schritt davor">?</span>' : esc(n);
  }
  function rwHtml() {
    var rw = lauf && lauf.rw, z = rwZerlegung();
    if (!z) return "";
    if (!rw.auf) return '<button type="button" class="rw-auf" data-rw="auf">🪜 Schritt für Schritt</button>';
    var j = rwJetzt(z);
    var h = '<div class="rw" role="group" aria-label="Schritt für Schritt"><div class="rw-kopf"><b>🪜 Schritt für Schritt</b>' +
      '<button type="button" class="rw-zu" data-rw="zu">Zuklappen</button></div>';
    z.schritte.forEach(function (s, i) {
      var zustand = rw.ok[i] ? "fertig" : i === j ? "jetzt" : "spaeter";
      var name = "s" + i, an = lauf.feld === name;
      h += '<div class="rw-schritt ' + zustand + '"><div class="rw-titel">' + (i + 1) + ". " + esc(RW.titel(s)) + '</div>';
      if (i > 0 && !s.ganz) h += '<div class="rw-zusammen">' + (zustand === "spaeter" ? "…" : tokHtml(s.vorher, s.von, s.bis)) + '</div>';
      h += '<div class="rw-rechnung">' + rwZahl(s.a, s.aVon) + " " + esc(s.zeichen) + " " + rwZahl(s.b, s.bVon) + ' =' +
        '<span class="feld' + (an ? " aktiv" : "") + (rw.ok[i] ? " gut" : "") + '" id="feld-' + name + '" data-feld="' + name + '" role="button" tabindex="0" aria-label="' +
        (s.letzter ? "Ergebnis" : "Zwischenergebnis " + (i + 1)) + '">' + esc(rw.ok[i] ? s.wert : rw.w[i] || "") + '</span>' +
        (zustand === "jetzt" && RK && RW.schriftlich(s) ? '<button type="button" class="rw-rkknopf" data-rw="rk" data-i="' + i + '">📝 Untereinander</button>' : "") +
        '</div>' + (zustand === "jetzt" && rw.rk === i ? '<div class="rk rw-rkfeld" id="rk-' + i + '"></div>' : "") + '</div>';
    });
    return h + '</div>';
  }
  function rwMalen() {
    var x = aktuell(); if (!x) return;
    $("aufgabe").innerHTML = frageHtml(x);
    var rw = lauf.rw, z = rwZerlegung();
    if (rw && rw.auf && rw.rk >= 0 && z && !rw.ok[rw.rk] && $("rk-" + rw.rk)) {
      var s = z.schritte[rw.rk];
      RK.malen($("rk-" + rw.rk), "schriftlich: " + s.a + " " + s.zeichen + " " + s.b, { ohneBlock: true, ohneTasten: true });
    }
  }
  function rwKnopf(was, i) {
    var rw = lauf && lauf.rw; if (!rw || sperre) return;
    if (was === "auf") { rw.auf = true; try { sessionStorage.removeItem(RW_ZU); } catch (e) {} lauf.feld = "s" + Math.max(0, rwJetzt(rwZerlegung())); }
    if (was === "zu") { rw.auf = false; rw.rk = -1; try { sessionStorage.setItem(RW_ZU, "1"); } catch (e) {} lauf.feld = "a"; }
    if (was === "rk") { rw.rk = rw.rk === i ? -1 : i; lauf.feld = rw.rk >= 0 ? "rk" : "s" + i; }
    rwMalen(); laufMerken();
  }
  /* „✏️ Mein Rechenweg“: ab zwei Rechenschritten (Punkt vor Strich, Sachaufgabe mit schritte ≥ 2,
     sonst Rechenzeichen im Text). Bei Sachaufgaben gibt es KEINE Vorgabe: Paul stellt selbst auf.
     Steht außerhalb von #aufgabe und bleibt deshalb beim Fehlversuch stehen; neu nur bei neuer Aufgabe. */
  var mwFuer = null;
  function brauchtWeg(x) {
    if (!MW || !x) return false;
    if (x.art === "fw") return false;   // Fachwörter: ein Rechenschritt, kein Rechenweg-Feld
    if (x.art === "punkt" || x.typ === "rest") return true;   // Teilen mit Rest: teilen, dann Rest ausrechnen
    if (x.art === "sach") return (x.schritte || 1) >= 2;
    if (x.art === "lt" || x.art === "raet") return true;   // Rechenkästchen wie auf dem Blatt der Lehrerin
    return MW.schritte(x.frage) >= 2;
  }
  function meinWegZeigen(x) {
    var h = $("meinweg"); if (!h) return;
    if (!brauchtWeg(x)) { h.innerHTML = ""; h.classList.add("verborgen"); mwFuer = null; return; }
    h.classList.remove("verborgen");
    if (mwFuer === lauf.d + "|" + lauf.phase + "|" + lauf.i + "|" + x.k) return;
    mwFuer = lauf.d + "|" + lauf.phase + "|" + lauf.i + "|" + x.k;
    var auf = false; try { auf = sessionStorage.getItem(MW_AUF) === "1"; } catch (e) {}
    MW.malen(h, {
      offen: auf,
      beimOeffnen: function (an) { try { sessionStorage.setItem(MW_AUF, an ? "1" : "0"); } catch (e) {} },
      uebernehmen: function (z) {
        if (!lauf || sperre) return;
        var f = lauf.feld === "b" && $("feld-b") ? "b" : "a";
        lauf.eingabe[f] = String(z).slice(0, 4); feldWaehlen(f);
        $("feld-" + f).textContent = lauf.eingabe[f];
      }
    });
  }

  /* Prüfen in einem Rechenweg-Kästchen. */
  function rwPruefen(i) {
    var rw = lauf.rw, z = rwZerlegung(); if (!z) return;
    var s = z.schritte[i], e = rw.w[i] || "";
    if (lauf.feld === "rk") { e = RK.wert(); if (!e) { tipp("Rechne unten in den Kästchen. Dann drückst du Prüfen.", false); return; } rw.w[i] = e; }
    if (!e) return;
    if (s.letzter) {   // die Antwort selbst: zählt wie das Feld oben
      lauf.eingabe.a = String(+e); $("feld-a").textContent = lauf.eingabe.a;
      pruefen();
      return;
    }
    if (RW.stimmt(s, e)) {
      rw.ok[i] = true; rw.rk = -1;
      lauf.feld = "s" + rwJetzt(z);
      rwMalen();
      tipp("Stimmt: " + s.teil + " = " + s.wert + ".", true);
    } else {
      rw.v[i] = (rw.v[i] || 0) + 1; rw.w[i] = "";
      lauf.feld = rw.rk === i ? "rk" : "s" + i;
      var f = $("feld-s" + i); if (f) { f.textContent = ""; f.classList.remove("rueck"); void f.offsetWidth; f.classList.add("rueck"); }
      tipp(RW.hinweis(s, rw.v[i], e), false);
    }
    laufMerken();
  }

  function aufgabeZeigen() {
    var x = aktuell();
    if (!x) { teilFertig(); return; }
    if (!lauf.rw || lauf.rw.k !== x.k) {
      // Die geführte Zerlegung ist eine Hilfe-Stufe: zu Beginn nur als Knopf, nach dem ersten
      // Fehlversuch geht sie von selbst auf (außer Paul hat sie in dieser Sitzung zugeklappt).
      lauf.rw = x.art === "punkt" || x.art === "rech" ? rwNeu(x, false) : null;
    }
    meinWegZeigen(x);
    var el0 = lauf.liste[lauf.i];
    $("thema").textContent = x.thema + (el0 && el0.w === 1 ? " · Noch einmal" : el0 && el0.w === 2 ? (x.art === "fw" ? " · Noch einmal anders" : " · Neue Zahlen") : "");
    $("zaehler").textContent = (lauf.phase === "2" ? "Sachaufgabe " : "Aufgabe ") + (lauf.i + 1) + " von " + lauf.liste.length;
    rwMalen();
    $("aufgabe").setAttribute("data-typ", x.typ);
    $("tasten").classList.toggle("nurok", x.typ === "tippen" || x.typ === "wahl");
    $("tasten").classList.remove("verborgen"); $("weiter").classList.add("verborgen");
    tipp(lauf.versuche ? lauf.tipp : "", false);
    sperre = false;
    shown = jetzt(); verdeckt = 0; verdecktSeit = document.hidden ? shown : 0;
  }
  function jetzt() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function vergangen() {
    var v = verdeckt + (verdecktSeit ? jetzt() - verdecktSeit : 0);
    return Math.min(600, Math.max(0, (jetzt() - shown - v) / 1000));
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) verdecktSeit = jetzt();
    else if (verdecktSeit) { verdeckt += jetzt() - verdecktSeit; verdecktSeit = 0; }
  });
  function tipp(t, gut) { var el = $("tipp"); el.textContent = t || ""; el.classList.toggle("gut", !!gut); }

  function feldWaehlen(name) {
    if (!lauf || sperre) return;
    lauf.feld = name;
    [].forEach.call(document.querySelectorAll("#aufgabe .feld"), function (f) { f.classList.toggle("aktiv", f.getAttribute("data-feld") === name); });
  }
  function taste(z) {
    if (!lauf || lauf.phase === "1-fertig") return;
    if (sperre) { if (z === "ok") naechste(); return; }
    var f = lauf.feld || "a";
    if ((f === "rk" || f.charAt(0) === "s") && !lauf.rw) f = lauf.feld = "a";
    if (f === "rk" || f.charAt(0) === "s") {
      var si = f === "rk" ? lauf.rw.rk : +f.slice(1);
      if (z === "ok") { rwPruefen(si); return; }
      if (f === "rk") { if (z === "weg") RK.loesche(); else RK.tippe(z); return; }
      var w = lauf.rw.w[si] || "";
      if (z === "weg") w = w.slice(0, -1); else if (w.length < 5) w += z;
      lauf.rw.w[si] = w; var sf = $("feld-" + f); if (sf) sf.textContent = w;
      return;
    }
    if (z === "ok") { pruefen(); return; }
    var x = aktuell(); if (!x || x.typ === "tippen" || x.typ === "wahl") return;
    if (z === "weg") lauf.eingabe[f] = lauf.eingabe[f].slice(0, -1);
    else if (lauf.eingabe[f].length < 4) lauf.eingabe[f] += z;
    $("feld-" + f).textContent = lauf.eingabe[f];
  }
  function chip(c) {
    if (!lauf || sperre) return;
    var i = lauf.wahl.indexOf(c);
    if (i >= 0) lauf.wahl.splice(i, 1); else lauf.wahl.push(c);
    var b = document.querySelector('[data-chip="' + c + '"]');
    if (b) { b.classList.toggle("an", i < 0); b.setAttribute("aria-pressed", String(i < 0)); }
  }

  /* Fachwörter: ein Wort antippen (eins zur Zeit). Ein falsch gewähltes tritt blass zurück, bleibt aber antippbar. */
  function wort(i) {
    if (!lauf || sperre) return;
    var x = aktuell(); if (!x || x.typ !== "wahl") return;
    var c = x.optionen[i]; if (c == null) return;
    lauf.wahl = lauf.wahl[0] === c ? [] : [c];
    [].forEach.call(document.querySelectorAll("[data-wahl]"), function (b) {
      var an = x.optionen[+b.getAttribute("data-wahl")] === lauf.wahl[0];
      b.classList.toggle("an", an); b.setAttribute("aria-pressed", String(an));
    });
  }
  function eingabe(x) {
    if (x.typ === "wahl") return lauf.wahl[0];
    if (x.typ === "tippen") return lauf.wahl.slice();
    if (x.typ === "rest") return { q: lauf.eingabe.a, r: lauf.eingabe.b };
    return lauf.eingabe.a;
  }
  function pruefen() {
    var x = aktuell();
    // Leere Felder sind kein Versuch: erst ausfüllen lassen.
    if (x.typ === "zahl" && !lauf.eingabe.a) return;
    if (x.typ === "rest") {
      if (!lauf.eingabe.a) { feldWaehlen("a"); return; }
      if (!lauf.eingabe.b) { feldWaehlen("b"); tipp("Trag noch den Rest ein. Geht es glatt auf, ist der Rest 0.", false); return; }
    }
    if (x.typ === "tippen" && !lauf.wahl.length) { tipp("Tippe die passenden Zahlen an. Dann drückst du Prüfen.", false); return; }
    if (x.typ === "wahl" && !lauf.wahl.length) { tipp("Tippe eine Antwort an. Dann drückst du Prüfen.", false); return; }
    var e = eingabe(x), ok = M.stimmt(x, e), erster = lauf.versuche === 0;
    var el = lauf.liste[lauf.i];
    if (erster && !el.w) {
      // Nur der erste Versuch einer Aufgabe zählt; Wiederholungen in derselben Runde zählen nicht noch einmal.
      var sek = Math.round(vergangen() * 10) / 10;
      lauf.erg[lauf.phase].push({ k: x.k, kk: el.kk || undefined, ok: ok, sek: sek });
      melden(x, ok, M.eingabeText(x, e), sek);
    }
    if (erster && !ok) wiederholen(x, el);
    if (ok) { richtig(x, erster); return; }
    lauf.versuche++;
    lauf.tipp = M.hilfe(x, lauf.versuche, e);
    if (x.typ === "wahl") {
      lauf.nein = (lauf.nein || []).concat(lauf.wahl); lauf.wahl = [];
      [].forEach.call(document.querySelectorAll("[data-wahl]"), function (b) {
        var w = x.optionen[+b.getAttribute("data-wahl")];
        b.classList.remove("an"); b.setAttribute("aria-pressed", "false");
        if (lauf.nein.indexOf(w) >= 0) { b.classList.add("nein"); b.classList.remove("rueck"); void b.offsetWidth; b.classList.add("rueck"); }
      });
    } else if (x.typ !== "tippen") {
      lauf.eingabe = { a: "", b: "" }; lauf.feld = "a";
      ["a", "b"].forEach(function (n) { var f = $("feld-" + n); if (f) { f.textContent = ""; f.classList.toggle("aktiv", n === "a"); f.classList.remove("rueck"); void f.offsetWidth; f.classList.add("rueck"); } });
    }
    // Rechenweg: das letzte Kästchen leeren und dort weitermachen; bei der Einkaufs-Sachaufgabe
    // gibt es den Rechenweg ab dem zweiten Fehlversuch (dann nennt auch die Hilfe die Rechnung).
    if (lauf.rw && lauf.rw.auf) {
      var zz = rwZerlegung(), last = zz.schritte.length - 1;
      lauf.rw.w[last] = ""; lauf.feld = "s" + Math.max(0, rwJetzt(zz));
      rwMalen();
    } else if (lauf.rw && !lauf.rw.auf && (x.art === "punkt" || x.art === "rech") && !rwZuGemerkt()) {
      lauf.rw.auf = true; lauf.feld = "s0"; rwMalen();
    }
    tipp(lauf.tipp, false);
    laufMerken();
  }
  /* Fehler in derselben Runde üben (Denny, 16.10.2026, 18:36 Uhr: „Fehler bitte auch wiederholen. Paul hat
     immer wieder mit der gleichen Aufgabenform Probleme.“): Ist der erste Versuch falsch, kommt dieselbe
     Aufgabe nach wdhAbstand Aufgaben wieder (w:1) und dieselbe Form mit neuen Zahlen nach wdhAbstandNeu (w:2).
     Ist eine Wiederholung beim ersten Versuch wieder falsch, kommt sie noch einmal ans Ende. Höchstens wdhMax
     zusätzliche Aufgaben je Teil. Geübt ist die Form für heute, wenn beide beim ersten Versuch sitzen. */
  function einfuegen(eintrag, ab) {
    if ((lauf.wdh || 0) >= M.EIN.wdhMax) return false;
    var pos = Math.min(lauf.liste.length, lauf.i + 1 + ab);
    lauf.liste.splice(pos, 0, eintrag); lauf.wdh = (lauf.wdh || 0) + 1;
    return true;
  }
  function wiederholen(x, el) {
    if (!el.w) {
      einfuegen({ k: x.k, w: 1, von: x.k }, M.EIN.wdhAbstand);
      var neu = M.geschwister(x.k, 1 + (lauf.wdh || 0));
      if (neu !== x.k) einfuegen({ k: neu, w: 2, von: x.k }, M.EIN.wdhAbstandNeu);
    } else {
      // Wieder daneben: dieselbe Aufgabe noch einmal ganz ans Ende (keine Kette ohne Ende: wdhMax).
      einfuegen({ k: x.k, w: el.w, von: el.von }, lauf.liste.length);
    }
  }
  function richtig(x, erster) {
    if (lauf.rw && lauf.rw.auf) {   // Rechenweg ausgefüllt zeigen
      var zr = rwZerlegung(); zr.schritte.forEach(function (s, i) { lauf.rw.ok[i] = true; }); lauf.rw.rk = -1; rwMalen();
      $("feld-a").textContent = lauf.eingabe.a;
    }
    [].forEach.call(document.querySelectorAll("#aufgabe .feld"), function (f) { f.classList.add("gut"); });
    [].forEach.call(document.querySelectorAll(".chip.an"), function (b) { b.classList.add("gut"); });
    // Doppeltippen auf „Prüfen“ springt nicht gleich über das Ergebnis weiter (die Messung darf die Zeit verkürzen).
    sperre = true; weiterAb = jetzt() + (window.__psWeiterMs != null ? +window.__psWeiterMs : 500);
    tipp((erster ? "Richtig! " : "Gut, jetzt stimmt es. ") + M.bestaetigung(x) + ".", true);
    // Eigener großer Weiter-Knopf statt der Zifferntasten: das Ergebnis bleibt stehen, bis Paul weitertippt.
    $("tasten").classList.add("verborgen"); $("weiter").classList.remove("verborgen");
    if ($("meinweg")) $("meinweg").classList.add("verborgen");
    lauf.i++; lauf.versuche = 0; lauf.eingabe = { a: "", b: "" }; lauf.feld = "a"; lauf.wahl = []; lauf.nein = []; lauf.tipp = ""; lauf.rw = null;
    laufMerken();
  }
  function naechste() {
    if (!sperre || jetzt() < weiterAb) return;
    if (lauf.i >= lauf.liste.length) teilFertig(); else aufgabeZeigen();
  }

  function teilFertig() {
    if (lauf.phase === "3") {   // Fachwörter: einmal buchen, einmal schreiben
      stand = M.buchenFach(stand, datum, lauf.erg[3], lauf.nr);
      speichern();
      var e3 = lauf.erg[3], r3 = e3.filter(function (e) { return e.ok; }).length;
      lauf = null; laufWeg();
      zeige("fw-ende");
      $("fw-ende-zahlen").textContent = "Beim ersten Versuch richtig: " + r3 + " von " + e3.length + ". Du hast dir viele Fachwörter angeschaut. Gut gemacht!";
      return;
    }
    if (lauf.phase === "1") {
      stand = M.buchen(stand, datum, 1, lauf.erg[1], lauf.nr);
      speichern();
      lauf.phase = "1-fertig"; laufMerken();
    }
    if (lauf.phase === "1-fertig") {
      var r1 = lauf.erg[1].filter(function (e) { return e.ok; }).length;
      $("zwischen-satz").textContent = "Beim ersten Versuch richtig: " + r1 + " von " + lauf.erg[1].length + ". Jetzt noch " + lauf.runde.teil2.length + " Textaufgaben.";
      zeige("zwischen");
      return;
    }
    stand = M.buchen(stand, datum, 2, lauf.erg[2], lauf.nr);
    speichern();
    var a = lauf.erg[1], b = lauf.erg[2];
    var ra = a.filter(function (e) { return e.ok; }).length, rb = b.filter(function (e) { return e.ok; }).length;
    lauf = null; laufWeg();
    zeige("ende");
    $("ende-zahlen").textContent = "Beim ersten Versuch richtig: " + (a.length ? "Probenstoff " + ra + " von " + a.length + ", " : "") + "Textaufgaben " + rb + " von " + b.length + ". Du hast heute fleißig geübt.";
  }

  function melden(x, ok, gegeben, sek) {
    try { if (window.lernstand) window.lernstand.antwort(ok, x.merkmal, gegeben, M.loesungText(x), x.punkt, sek); } catch (e) {}
  }
  function zeige(welche) {
    ["start", "zwischen", "spiel", "ende", "aus", "fw-ende"].forEach(function (id) { $(id).classList.toggle("verborgen", id !== welche); });
    window.scrollTo(0, 0);
  }

  /* ---------- Bedienung ---------- */
  document.addEventListener("click", function (e) {
    var r = e.target.closest ? e.target.closest("[data-rw]") : null;
    if (r) { rwKnopf(r.getAttribute("data-rw"), +r.getAttribute("data-i")); return; }
    if (e.target.closest && e.target.closest(".rw-rkfeld") && !(sperre)) { feldWaehlen("rk"); return; }
    var t = e.target.closest ? e.target.closest("[data-taste]") : null;
    if (t) { taste(t.getAttribute("data-taste")); return; }
    var c = e.target.closest ? e.target.closest("[data-chip]") : null;
    if (c) { chip(+c.getAttribute("data-chip")); return; }
    var wo = e.target.closest ? e.target.closest("[data-wahl]") : null;
    if (wo) { wort(+wo.getAttribute("data-wahl")); return; }
    var f = e.target.closest ? e.target.closest("[data-feld]") : null;
    if (f) { feldWaehlen(f.getAttribute("data-feld")); return; }
    var b = e.target.closest ? e.target.closest("button") : null, id = b ? b.id : "";
    if (id === "los") {
      var hs = h();
      lauf = null; laufWeg();
      if (hs.t1 && !hs.t2) { lauf = { runde: M.tagesRunde(stand, datum, 0, blatt), erg: { 1: [], 2: [] } }; rundeBeginnen("2"); }
      else rundeBeginnen("1");
      return;
    }
    if (id === "weiter-sach") { rundeBeginnen("2"); return; }
    if (id === "weiter") { naechste(); return; }
    if (id === "nochmal") { lauf = null; laufWeg(); startZeigen(); return; }
    if (id === "los-fw" || id === "fw-nochmal") { lauf = null; laufWeg(); rundeBeginnen("3"); return; }
    if (id === "fw-zurueck") { lauf = null; laufWeg(); startZeigen(); return; }
  });
  document.addEventListener("keydown", function (e) {
    if ($("spiel").classList.contains("verborgen")) return;
    if (e.repeat) return;   // gehaltene Taste zählt einmal
    var t = e["key"];
    if (/^[0-9]$/.test(t)) taste(t);
    else if (t === "Backspace") taste("weg");
    else if (t === "Enter") taste("ok");
    else if (t === "r" || t === "R" || t === "Tab") { if (document.getElementById("feld-b")) { e.preventDefault(); feldWaehlen(lauf.feld === "a" ? "b" : "a"); } }
  });

  /* Nach Neuladen oder Update genau da weitermachen (sessionStorage dieses Tabs, LWWeiter). */
  function fortsetzen(l) {
    if (!l || l.d !== datum || !l.liste || !M.aktiv(datum)) return false;
    lauf = l;
    if (lauf.phase === "1-fertig" || lauf.i >= lauf.liste.length) { teilFertig(); return true; }
    zeige("spiel");
    aufgabeZeigen();
    return true;
  }
  var weiterSeite = { sichern: function () { return lauf; }, laden: function (l) { fortsetzen(l); } };
  if (window.LWWeiter) window.LWWeiter.anmelden(weiterSeite); else window.LW_WEITER = weiterSeite;

  // Erst der Stoff von den Blättern, dann die Startseite (ein laufender Durchgang trägt seine Runde selbst).
  // ?fw=1 (Knopf „Fachwörter üben“ auf der Lernliste): gleich Teil 3 starten, solange die Übung läuft.
  var fwDirekt = /[?&]fw=1(&|$)/.test(location.search);
  if (!fortsetzen(laufHolen())) blattHolen(function () { if (lauf) return; if (fwDirekt && M.aktiv(datum)) rundeBeginnen("3"); else startZeigen(); });
  else blattHolen(function () {});

  // Für die Messung (mess-schritte-probenstoff.js): lesen, nichts verändern.
  window.__probenstoff = {
    motor: M, stand: function () { return stand; }, lauf: function () { return lauf; },
    datum: function () { return datum; }, blatt: function () { return blatt; },
    aktuell: function () { return lauf && lauf.liste && lauf.phase !== "1-fertig" ? aktuell() : null; }
  };
})();
