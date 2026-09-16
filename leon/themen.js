/* Leons Themenfelder - von seiner Lernwelt (index.html) und seiner
   Spiel-Schmiede (schmiede.html) gemeinsam benutzt. Seit 16.09.2026 in eigener
   Datei: Beide Seiten muessen DIESELBEN Schluessel haben, sonst findet die
   Schmiede ein fertiges Spiel im Regal nicht und Leon wartet umsonst.
   Einen Schluessel nie umbenennen (siehe CLAUDE.md, Themenfelder). */
window.LEON_THEMEN = [
  { fach:"mathe", schluessel:"plus20", stich:["bis 20"], bild:"\u2795", titel:"Plus und Minus bis 20", jetzt:true,
    wunsch:"Übe Plus- und Minusaufgaben im Zahlenraum bis 20. Das ist Wiederholung aus der ersten Klasse und soll sicher sitzen." },
  { fach:"mathe", schluessel:"zahlen100", stich:["zahlenraum bis 100","zahlen bis 100"], bild:"\u{1F4AF}", titel:"Zahlen bis 100", jetzt:true,
    wunsch:"Übe den Zahlenraum bis 100: Zahlen ordnen und vergleichen, Nachbarzahlen, Zehner und Einer unterscheiden." },
  { fach:"mathe", schluessel:"plus100", stich:["bis 100"], bild:"\u2796", titel:"Plus und Minus bis 100",
    wunsch:"Übe Plus- und Minusaufgaben im Zahlenraum bis 100, auch mit Zehnerübergang." },
  { fach:"mathe", schluessel:"doppelt", stich:["verdoppeln","halbieren"], bild:"\u{1F91D}", titel:"Verdoppeln und Halbieren",
    wunsch:"Übe Verdoppeln und Halbieren im Zahlenraum bis 100." },
  { fach:"mathe", schluessel:"einmaleins", stich:["einmaleins","reihe"], bild:"\u2716\uFE0F", titel:"Das Einmaleins",
    wunsch:"Baue das Einmaleins auf. Beginne mit der 2er-, 5er- und 10er-Reihe." },
  { fach:"mathe", schluessel:"geld", stich:["geld","münzen","einkauf"], bild:"\u{1F4B6}", titel:"Geld und Einkaufen",
    wunsch:"Übe Geld: Münzen und Scheine erkennen, Beträge legen und wechseln, einkaufen und Rückgeld." },
  { fach:"mathe", schluessel:"uhr", stich:["uhr","zeit"], bild:"\u{1F551}", titel:"Die Uhr",
    wunsch:"Übe die Uhrzeit: volle Stunden, halbe Stunden und Viertelstunden ablesen, und einfache Zeitspannen." },
  { fach:"mathe", schluessel:"laengen", stich:["läng","meter","messen"], bild:"\u{1F4CF}", titel:"Längen messen",
    wunsch:"Übe Längen: Zentimeter und Meter, schätzen und messen, Längen vergleichen." },
  { fach:"mathe", schluessel:"formen", stich:["form","körper","symmetrie"], bild:"\u{1F537}", titel:"Formen und Körper",
    wunsch:"Übe Formen und Körper: Dreieck, Kreis, Viereck, Quadrat, Rechteck sowie Würfel, Quader, Kugel, Zylinder, Kegel erkennen und benennen. Dazu Symmetrie und Muster." },
  { fach:"mathe", schluessel:"daten", stich:["tabelle","strichliste","zufall"], bild:"\u{1F4CA}", titel:"Tabellen und Zufall",
    wunsch:"Übe Daten: Strichlisten und Tabellen lesen, und einschätzen, ob etwas sicher, möglich oder unmöglich ist." },

  /* Deutsch, seit 14.09.2026. Denny: "gerne Wiederholungen aus der ersten
     Klasse". Die Reihenfolge folgt dem Lernpfad D1/2 (Buchstaben und Laute,
     Silben, Nomen und Artikel). Alle drei sind Wiederholung und deshalb
     "gerade dran". Wie es fuer einen Leseanfaenger gebaut wird, steht im
     Bauauftrag unter DEUTSCH FUER LESEANFAENGER (spiel-bauen.js). */
  { fach:"deutsch", schluessel:"d-laute", bild:"\u{1F524}", titel:"Laute und Buchstaben", jetzt:true,
    wunsch:"Deutsch, Wiederholung aus der 1. Klasse: Laute und Buchstaben. Anlaut, Inlaut und Endlaut heraushören, die Selbstlaute a, e, i, o, u erkennen, großen und kleinen Buchstaben zuordnen, den fehlenden Buchstaben in einem kurzen Wort finden." },
  { fach:"deutsch", schluessel:"d-silben", bild:"\u{1F44F}", titel:"Silben und Reime", jetzt:true,
    wunsch:"Deutsch, Wiederholung aus der 1. Klasse: Silben und Reime. Silben klatschen und zählen, Wörter aus Silben zusammensetzen, Reimwörter finden, das Wort mit einer anderen Silbenzahl herausfinden." },
  { fach:"deutsch", schluessel:"d-nomen", bild:"\u{1F4D6}", titel:"Der, die, das", jetzt:true,
    wunsch:"Deutsch, Wiederholung aus der 1. Klasse: Namenwörter. Nomen erkennen, den richtigen Artikel der, die oder das wählen, Nomen und Satzanfänge schreibt man groß, Einzahl und Mehrzahl (ein Ball, viele Bälle)." },

  /* HSU, seit 14.09.2026. Denny: "HSU hat Leon auch in der ersten Klasse
     schon gehabt." Lernpfad HSU 1/2; im September passen Schulweg und
     Herbst, deshalb sind diese beiden "gerade dran". */
  { fach:"hsu", schluessel:"h-verkehr", bild:"\u{1F6A6}", titel:"Sicher unterwegs", jetzt:true,
    wunsch:"Heimat- und Sachunterricht, Wiederholung aus der 1. Klasse: der sichere Schulweg. Ampel und Zebrastreifen, links-rechts-links schauen, Gefahren zwischen parkenden Autos und an der Bushaltestelle, im Dunkeln gut sichtbar sein." },
  { fach:"hsu", schluessel:"h-jahreszeiten", bild:"\u{1F342}", titel:"Jahreszeiten und Feste", jetzt:true,
    wunsch:"Heimat- und Sachunterricht, Wiederholung aus der 1. Klasse: die vier Jahreszeiten, Wochentage und Monate in der richtigen Reihenfolge, was man in jeder Jahreszeit in der Natur sieht, passende Kleidung, Feste im Jahreslauf." },
  { fach:"hsu", schluessel:"h-koerper", bild:"\u{1F440}", titel:"Körper und Sinne",
    wunsch:"Heimat- und Sachunterricht, Wiederholung aus der 1. Klasse: die fünf Sinne und ihre Sinnesorgane, Körperteile benennen, gesund essen und trinken, Zähne putzen und Hände waschen." },
  { fach:"hsu", schluessel:"h-tiere", bild:"\u{1F41E}", titel:"Tiere und Pflanzen",
    wunsch:"Heimat- und Sachunterricht, 1. und 2. Klasse: Tiere und Pflanzen im Jahreslauf. Welche Tiere Winterschlaf halten oder in den Süden ziehen, die Teile einer Pflanze (Wurzel, Stängel, Blatt, Blüte), Haustiere richtig versorgen." }
];
