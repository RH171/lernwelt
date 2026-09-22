/* Pauls Stundenplan als Daten - EINMAL, nicht zweimal.
 *
 * Bis zum 22.09.2026 stand der Plan nur in stundenplan.html. Die Werkstatt
 * soll aber vorschlagen koennen, welches Fach zu einem Foto gehoert ("Heute
 * hattest du Englisch") - und zwei Kopien laufen frueher oder spaeter
 * auseinander. Dieselbe Regel wie beim Ferien-Band und beim Spielmotor:
 * die Daten stehen an einer Stelle, beide Seiten lesen sie.
 *
 * Klasse 4bG, Schuljahr 2026/27, Grundschule Seeackerstrasse Fuerth.
 * Aendert sich der Plan: HIER aendern - und den Scan in stundenplan.jpg
 * neu ablegen.
 *
 * "X" heisst Deutsch, Mathematik ODER HSU - das sucht die Lehrerin selbst
 * aus. Ein Vorschlag kann daraus also nur "eins von dreien" machen, nie
 * eines davon behaupten.
 */
(function (global) {
  "use strict";

  var TAGE = ["Mo", "Di", "Mi", "Do", "Fr"];

  // Stunde: [Nummer, Zeit, Mo, Di, Mi, Do, Fr] - "" heisst frei.
  var STUNDEN = [
    ["1", "8:00 – 8:45",   "X", "X", "X", "X", "X"],
    ["2", "8:45 – 9:30",   "X", "X", "X", "X", "X"],
    ["Pause", "9:30 – 9:50"],
    ["3", "9:50 – 10:35",  "X", "X", "Englisch", "Rel./Eth", "X"],
    ["4", "10:35 – 11:20", "WÜL", "WÜL", "WÜL", "X", "X"],
    ["Pause", "11:20 – 11:30"],
    ["5", "11:30 – 12:15", "Sport (14-tägig)", "Rel./Eth", "Schwimmen", "WÜL", "Musik"],
    ["6", "12:15 – 13:00", "WG (14-tägig)", "Rel./Eth", "Schwimmen", "", ""],
    ["Mittag", "13:00 – 13:15"],
    ["7", "13:15 – 14:00", "", "Lernzeitinsel", "", "Lernzeitinsel", ""],
    ["8", "14:00 – 14:45", "WÜL", "WÜL", "Kunst", "AG", ""],
    ["9", "14:45 – 15:30", "X", "WÜL digital", "Kunst", "AG", ""]
  ];

  /* Was im Plan steht -> welcher Fach-Schluessel im Schulheft.
   * WÜL, Lernzeitinsel und AG sind Betreuungszeiten, kein Fach - sie
   * erzeugen keinen Eintrag und tauchen deshalb hier nicht auf.
   * Kunst, WG, Sport und Schwimmen ebenso wenig: dort entsteht nichts
   * zum Ueben. Wer doch etwas mitbringt, nimmt "anderes". */
  var ZUM_FACH = {
    "Englisch": "englisch",
    "Rel./Eth": "rel",
    "Musik": "musik"
  };

  // "X" ist eines von dreien - welches, weiss nur Paul.
  var HINTER_X = ["mathe", "deutsch", "hsu"];

  /* Welche Faecher an diesem Wochentag drankamen.
   * wochentag: 0 = Montag … 4 = Freitag. Gibt die Schluessel zurueck,
   * die wahrscheinlichsten zuerst - genannte Faecher vor den drei hinter
   * "X", weil ein genanntes Fach sicher ist und "X" nur eine Moeglichkeit. */
  function faecherAm(wochentag) {
    if (!(wochentag >= 0 && wochentag <= 4)) return [];
    var genannt = [], hatX = false;
    STUNDEN.forEach(function (z) {
      var f = z[2 + wochentag];
      if (!f) return;
      if (f === "X") { hatX = true; return; }
      var s = ZUM_FACH[f];
      if (s && genannt.indexOf(s) < 0) genannt.push(s);
    });
    return hatX ? genannt.concat(HINTER_X) : genannt;
  }

  /* Dasselbe fuer ein Datum (JS-Date oder "2026-09-22").
   * Am Wochenende gibt es nichts vorzuschlagen - dann kommt eine leere
   * Liste zurueck und die Oberflaeche zeigt einfach alle Faecher. */
  function faecherAmDatum(d) {
    var tag;
    if (typeof d === "string") {
      var t = d.split("-");
      if (t.length !== 3) return [];
      tag = new Date(+t[0], +t[1] - 1, +t[2]).getDay();
    } else {
      tag = (d || new Date()).getDay();
    }
    return faecherAm(tag - 1);   // 0 = Sonntag -> -1, faellt durch
  }

  global.PAUL_PLAN = {
    TAGE: TAGE,
    STUNDEN: STUNDEN,
    faecherAm: faecherAm,
    faecherAmDatum: faecherAmDatum
  };
})(window);
