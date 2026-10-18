/* Lernliste der Mathe-Fachwörter (18.10.2026) – Merkplakat (Dennys Wahl „G · Merkplakat“, 18.10.2026):
 * die vier Rechenarten als breite farbige Zeilen (Zeichen, Verb, Rechenart, Beispiel, Ergebnisname),
 * die übrigen sechs Wörter als Kacheln im 2er-Raster. Inhalt aus PSMotor.FACHWORT, rechnet und speichert nichts.
 * Der Knopf „Fachwörter üben“ erscheint nur, solange der Probenstoff läuft (PSMotor.aktiv: bis 19.10.2026). */
(function () {
  "use strict";
  var M = window.PSMotor;
  function $(id) { return document.getElementById(id); }
  function esc(t) { var d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; }
  if (!M || !M.FACHWORT) return;
  if (M.aktiv(M.heuteIso())) $("fw-ueben").classList.remove("verborgen");
  var je = {}; M.FACHWORT.forEach(function (c) { je[c.id] = c; });
  var ARTEN = [["addieren", "summe", "plus"], ["subtrahieren", "differenz", "minus"], ["multiplizieren", "produkt", "mal"], ["dividieren", "quotient", "geteilt"]];
  var REST = ["tausch", "umkehr", "vielfache", "teiler", "primzahl", "punkt"];
  // Ergebnis im Beispiel farbig: alles nach dem letzten „= “.
  function bsp(t) { var i = t.lastIndexOf("= "); return i < 0 ? esc(t) : esc(t.slice(0, i + 2)) + '<span class="erg">' + esc(t.slice(i + 2)) + "</span>"; }
  // Ergebnisname aus dem Satz der Rechenart („Das Ergebnis heißt Summe.“).
  function ergName(c) { var m = /heißt (\S+?)\.?$/.exec(c.ergebnis); return m ? m[1] : ""; }
  var h = '<section class="plakat" aria-label="Die vier Rechenarten">';
  ARTEN.forEach(function (a) {
    var c = je[a[0]], e = je[a[1]]; if (!c) return;
    h += '<article class="zeile ' + a[2] + '" id="fw-' + esc(c.id) + '">' +
      '<div class="zeichen" aria-label="Rechenzeichen">' + esc(c.zeichen) + '</div>' +
      '<div class="text"><div class="oben"><span class="wort">' + esc(c.wort) + '</span><span class="nomen">' + esc(c.nomen) + '</span></div>' +
      '<div class="unten"><span class="beispiel">' + bsp(c.beispiel) + '</span>' +
      '<span class="ergname"' + (e ? ' id="fw-' + esc(e.id) + '"' : "") + ' title="' + esc(c.ergebnis) + '"><small>Ergebnis</small>' + esc(ergName(c)) + '</span></div></div>' +
      '</article>';
  });
  h += '</section><section class="kacheln" aria-label="Noch mehr Fachwörter">';
  REST.forEach(function (id) {
    var c = je[id]; if (!c) return;
    h += '<article class="kachel" id="fw-' + esc(c.id) + '"><h2 class="wort">' + esc(c.wort) + '</h2>' +
      '<div class="beispiel">' + esc(c.beispiel).replace(" und ", "<br>").replace(": ", ":<br>") + '</div><div class="kurz">' + esc(c.ergebnis) + '</div></article>';
  });
  h += '</section>';
  $("liste").innerHTML = h;
  // Für die Messung (mess-schritte-fachwoerter.js): lesen, nichts verändern.
  window.__fachwoerter = { motor: M, karten: function () { return document.querySelectorAll(".zeile, .kachel").length + document.querySelectorAll(".ergname[id]").length; } };
})();
