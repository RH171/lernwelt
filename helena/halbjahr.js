/* Helenas Halbjahr: Pruefungen und Noten (19.10.2026, Startseite D).
 *
 * Denny mit Helena per Klickfrage: Pruefungen eintragen (Fach, Datum, Art,
 * Thema), Noten eintragen, Hochrechnung in "Mein Halbjahr". Genutzt von
 *   - helena/index.html   Kasten "Mein Halbjahr" (#halbjahr) und die Zeile
 *                         "naechste Pruefung" auf den Fachkarten - OHNE Schnitt
 *   - helena/halbjahr.html  dazu Hochrechnung und Planspiel (zeugnis-rechnung.js)
 *
 * Quelle ist allein der Server: GET /api/noten?eigene=1&kind=helena (Noten
 * nackt, kuenftige Termine). Geschrieben wird ueber /probeneintrag.js (derselbe
 * Weg wie bei Paul, POST /api/noten mit ihrem eigenen Ausweis). Nichts davon
 * liegt im localStorage - paul-sync wuerde es an alle Geraete verteilen und
 * jedes Mal einen KV-Schreibvorgang kosten.
 *
 * Ruhig: "in 5 Tagen", kein Rot, kein Ticken, kein "weil", keine Wertung.
 */
(function () {
  "use strict";
  var Z = window.LWZeugnis;
  if (!Z) return;
  var FAECHER = Z.FAECHER, FACH = Z.FACH, ART = Z.ART;
  var TAGE_K = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  function $(i) { return document.getElementById(i); }
  function el(tag, cls, text) { var x = document.createElement(tag); if (cls) x.className = cls; if (text != null) x.textContent = text; return x; }
  function heuteISO() {
    if (window.__probenHeute) return window.__probenHeute;
    var d = window.__jetzt ? new Date(window.__jetzt) : new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function tage(iso) {
    var a = heuteISO().split("-"), b = String(iso).split("-");
    return Math.round((Date.UTC(+b[0], +b[1] - 1, +b[2]) - Date.UTC(+a[0], +a[1] - 1, +a[2])) / 86400000);
  }
  function inTagen(iso) { var n = tage(iso); return n <= 0 ? "heute" : n === 1 ? "morgen" : "in " + n + " Tagen"; }
  function kurz(iso) { var p = String(iso).split("-"); return (+p[2] < 10 ? "0" : "") + (+p[2]) + "." + p[1] + "."; }
  function wtag(iso) { return TAGE_K[new Date(iso + "T12:00:00").getDay()]; }
  function fachName(k) { k = Z.fachKey(k); return (FACH[k] && FACH[k].n) || k; }
  function artName(a) { return (a && ART[a] && ART[a].n) || ""; }
  /* Wie eine Note in der Liste heisst - nackt: Art und Zahl. */
  function notenText(n) {
    var a = artName(n.lnArt) || (n.art === "gross" ? "Schulaufgabe" : "") || (n.was && n.was.length <= 18 ? n.was : "") || "Note";
    if (n.offen) return a + " · Note kommt noch";
    var z = String(n.note).replace(".", ",");
    return a + " " + z + (n.gewicht === 2 ? " · doppelt" : "");
  }

  /* ---------- Stand vom Server ---------- */
  var stand = { noten: null, termine: null, schulaufgaben: null, fehler: false };
  var hoerer = [];
  function melden() { hoerer.forEach(function (f) { try { f(stand); } catch (e) {} }); }
  function laden() {
    return fetch("/api/noten?eigene=1&kind=helena", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.ok) { stand.fehler = true; melden(); return; }
        stand.fehler = false;
        stand.noten = Array.isArray(j.noten) ? j.noten : [];
        stand.termine = Array.isArray(j.termine) ? j.termine : null;   // null = Speicher hat nicht geantwortet
        stand.schulaufgaben = j.schulaufgaben || null;
        melden();
      })
      .catch(function () { stand.fehler = true; melden(); });
  }

  /* ---------- Pruefungen ---------- */
  function pruefungZeile(t) {
    var z = el("div", "pr"); z.setAttribute("data-termin", t.datum + ":" + t.fach);
    var dt = el("div", "dt"); dt.appendChild(el("span", null, wtag(t.datum))); dt.appendChild(el("b", null, kurz(t.datum)));
    var wo = el("div", "wo"), kz = el("div", "kz");
    if (t.art && ART[t.art]) kz.appendChild(el("span", "art" + (t.art === "schulaufgabe" ? " gross" : ""), artName(t.art)));
    kz.appendChild(el("span", null, fachName(t.fach)));
    wo.appendChild(kz);
    wo.appendChild(el("small", "wann", inTagen(t.datum) + (t.thema ? " · " + t.thema : "")));
    z.appendChild(dt); z.appendChild(wo);
    return z;
  }
  function pruefungenMalen(box, max) {
    if (!box) return;
    box.innerHTML = "";
    if (stand.fehler || stand.termine === null) { box.appendChild(el("div", "leer", "Deine Prüfungen kommen gerade nicht. Versuch es gleich noch einmal.")); return; }
    var h = heuteISO();
    var liste = stand.termine.filter(function (t) { return t && t.datum >= h; });
    if (!liste.length) { box.appendChild(el("div", "leer", "Noch keine Prüfung eingetragen.")); return; }
    var l = el("div", "prl");
    liste.slice(0, max || 99).forEach(function (t) { l.appendChild(pruefungZeile(t)); });
    box.appendChild(l);
    if (max && liste.length > max) box.appendChild(el("div", "leer", "und " + (liste.length - max) + " weitere"));
  }
  /* Die naechste Pruefung eines Fachs unten auf seiner Karte. */
  function naechsteMalen(box, faecher) {
    if (!box) return;
    box.innerHTML = ""; box.hidden = true;
    if (!stand.termine) return;
    var h = heuteISO();
    var t = stand.termine.filter(function (x) { return x && x.datum >= h && faecher.indexOf(Z.fachKey(x.fach)) >= 0; })[0];
    if (!t) return;
    if (t.art && ART[t.art]) box.appendChild(el("span", "art", artName(t.art)));
    box.appendChild(el("span", null, wtag(t.datum) + " " + kurz(t.datum) + " · " + inTagen(t.datum) + (t.thema ? " · " + t.thema : "")));
    box.hidden = false;
  }

  /* ---------- Noten nackt, je Fach ---------- */
  function notenJeFach() {
    var je = {};
    (stand.noten || []).forEach(function (n) { var k = Z.fachKey(n.fach); (je[k] = je[k] || []).push(n); });
    return je;
  }
  function notenMalen(box) {
    if (!box) return;
    box.innerHTML = "";
    if (stand.fehler) { box.appendChild(el("div", "leer", "Deine Noten kommen gerade nicht. Versuch es gleich noch einmal.")); return; }
    var je = notenJeFach();
    var reihe = FAECHER.map(function (f) { return f.k; }).concat(Object.keys(je).filter(function (k) { return !FACH[k]; }));
    var da = reihe.filter(function (k) { return je[k] && je[k].length; });
    if (!da.length) { box.appendChild(el("div", "leer", "Noch keine Note eingetragen.")); return; }
    var l = el("div", "nt");
    da.forEach(function (k) {
      var z = el("div", "nz"); z.setAttribute("data-fach", k);
      z.appendChild(el("span", "fn", ((FACH[k] && FACH[k].e) ? FACH[k].e + " " : "") + fachName(k)));
      var pn = el("span", "pn");
      je[k].slice().sort(function (a, b) { return String(a.datum).localeCompare(String(b.datum)); })
        .forEach(function (n) { pn.appendChild(el("i", null, notenText(n))); });
      z.appendChild(pn);
      l.appendChild(z);
    });
    box.appendChild(l);
  }

  /* ---------- Eintragen: derselbe Dialog wie bei Paul (/probeneintrag.js) ---------- */
  var dialog = null;
  function dialogBauen(knopf) {
    if (!window.LWProbeneintrag || !knopf) return null;
    dialog = LWProbeneintrag.start({
      kind: "helena", knopf: knopf, knopfBehalten: true, noten: true,
      wort: "Prüfung", lehrkraft: "deine Lehrkraft", voraus: 150,
      faecher: FAECHER.map(function (f) { return [f.k, f.n, f.e]; }),
      arten: Z.ARTEN.map(function (a) { return [a.k, a.n]; }),
      nachTermin: function () { laden(); },
      nachNote: function () { laden(); }
    });
    return dialog;
  }

  /* ---------- "Aus deinem Heft": Faecher mit Blatt (Ereignis aus /heft-start.js) ---------- */
  var HEFT_FARBE = { deutsch: "#9a3412", geschichte: "#92400e", geo: "#0e7490", info: "#4338ca", rel: "#6d28d9", musik: "#a16207" };
  function heftChips(eintraege) {
    var box = $("heftChips"); if (!box) return;
    var da = {};
    (eintraege || []).forEach(function (e) { if (e && e.sichtbar !== false && e.fach) da[e.fach] = (da[e.fach] || 0) + 1; });
    box.innerHTML = "";
    Object.keys(HEFT_FARBE).forEach(function (k) {
      if (!da[k]) return;
      var a = el("a", "k"); a.href = "quiz.html?fach=" + encodeURIComponent(k); a.setAttribute("data-fach", k);
      var t = el("i", "tupf"); t.style.background = HEFT_FARBE[k]; a.appendChild(t);
      a.appendChild(document.createTextNode(fachName(k)));
      box.appendChild(a);
    });
  }
  document.addEventListener("lw-heft-eintraege", function (ev) { heftChips(ev.detail); });

  window.LWHalbjahr = {
    laden: laden, stand: function () { return stand; }, beimLaden: function (f) { hoerer.push(f); },
    pruefungenMalen: pruefungenMalen, notenMalen: notenMalen, naechsteMalen: naechsteMalen,
    notenJeFach: notenJeFach, notenText: notenText, fachName: fachName, dialogBauen: dialogBauen,
    dialog: function () { return dialog; }, inTagen: inTagen
  };

  /* ---------- Startseite ---------- */
  function startseite() {
    if (!$("halbjahr")) return;
    dialogBauen($("pruefungNeu"));
    var nb = $("noteNeu");
    if (nb) nb.addEventListener("click", function () { if (dialog) dialog.oeffnen("note"); });
    hoerer.push(function () {
      pruefungenMalen($("hjPruefungen"), 3);
      notenMalen($("hjNoten"));
      naechsteMalen($("nxt-en"), ["englisch"]);
      naechsteMalen($("nxt-fr"), ["franz"]);
      naechsteMalen($("nxt-ma"), ["mathe"]);
    });
    laden();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startseite); else startseite();
})();
