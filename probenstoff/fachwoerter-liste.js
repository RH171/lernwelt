/* Lernliste der Mathe-Fachwörter (18.10.2026) – zeigt PSMotor.FACHWORT als große Karten, nach Gruppen.
 * Rechnet und speichert nichts. Der Knopf „Fachwörter üben“ erscheint nur, solange der Probenstoff läuft
 * (PSMotor.aktiv: bis zur Probe am 19.10.2026), danach steht nur die Liste da. */
(function () {
  "use strict";
  var M = window.PSMotor;
  function $(id) { return document.getElementById(id); }
  function esc(t) { var d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; }
  if (!M || !M.FACHWORT) return;
  if (M.aktiv(M.heuteIso())) $("fw-ueben").classList.remove("verborgen");
  var gruppen = [], je = {};
  M.FACHWORT.forEach(function (c) { if (!je[c.gruppe]) { je[c.gruppe] = []; gruppen.push(c.gruppe); } je[c.gruppe].push(c); });
  var h = "";
  gruppen.forEach(function (g) {
    h += '<section class="gruppe"><h2>' + esc(g) + '</h2><div class="karten">';
    je[g].forEach(function (c) {
      h += '<article class="fwkarte" id="fw-' + esc(c.id) + '">' +
        '<div class="kopf"><div><div class="wort">' + esc(c.wort) + '</div>' + (c.nomen ? '<div class="nomen">' + esc(c.nomen) + '</div>' : "") + '</div>' +
        (c.zeichen ? '<div class="zeichen" aria-label="Rechenzeichen">' + esc(c.zeichen) + '</div>' : "") + '</div>' +
        '<div class="beispiel">' + esc(c.beispiel) + '</div>' +
        '<div class="ergebnis">' + esc(c.ergebnis) + '</div>' +
        '<div class="merk"><b>Merksatz:</b> ' + esc(c.merk) + '</div>' +
        '<div class="esel"><b>So merkst du es dir:</b> ' + esc(c.esel) + '</div>' +
        '</article>';
    });
    h += '</div></section>';
  });
  $("liste").innerHTML = h;
  // Für die Messung (mess-schritte-fachwoerter.js): lesen, nichts verändern.
  window.__fachwoerter = { motor: M, karten: function () { return document.querySelectorAll(".fwkarte").length; } };
})();
