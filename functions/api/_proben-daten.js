/* Proben-Liste fuer den Probenvergleich im Elternbereich (26.10.2026, Kapitel 141)
 *
 * NUR SERVERSEITIG. Dateien unter functions/ liefert Cloudflare nicht als statische
 * Datei aus (gemessen 26.10.2026: /functions/api/_riegel.js antwortet mit der
 * Startseite, text/html). Gelesen wird diese Liste ausschliesslich ueber
 * GET /api/probenvergleich - und das nur mit dem Elternausweis.
 *
 * Eine neue Probe = ein neuer Eintrag in PROBEN. Die Seite eltern/probenvergleich.html
 * zeichnet jeden Eintrag gleich; sie kennt keine Probe beim Namen.
 *
 * Felder je Probe:
 *   id, kind, fach, datum (JJJJ-MM-TT), titel (Wortlaut der Kopfzeile), quelle,
 *   max, punkte, note, notenschluessel (null = steht nicht auf dem Blatt),
 *   halbePunkte (true/false), selbsteinschaetzung, aufgaben[], fehlerthemen[], sicher[], hinweise[]
 * Felder je Aufgabe:
 *   nr, auftrag (Wortlaut der Lehrerin), beispiel, typ, max, punkte,
 *   aufteilung (wie sich die Punkte verteilen; "nicht angegeben" oder als Annahme gekennzeichnet),
 *   rechenweg: "ja" (ausdruecklich verlangt) | "zeile" (Zeile vorgegeben) | "schriftlich" (untereinander im Kaestchen) | "nein",
 *   ergebnis (was das Kind hatte), verloren (Grund, wenn Punkte fehlen), unklar (true = nicht sicher lesbar),
 *   lernwelt: { stand: "ja" | "teilweise" | "nein", wo, abweichung }
 */

export const PROBEN = [
  {
    id: "paul-2026-10-19-mathe-1",
    kind: "paul",
    fach: "mathe",
    datum: "2026-10-19",
    klasse: "4. Klasse",
    titel: "1. Probe im Fach Mathematik – Plus, Minus, Mal, Geteilt, Fachbegriffe",
    quelle: "Foto der Probe (4 Seiten), ownCloud „4 Klasse - Proben“, gelesen am 26.10.2026, alle Aufgaben nachgerechnet",
    max: 50,
    punkte: 44,
    note: 2,
    notenschluessel: null,
    halbePunkte: true,
    selbsteinschaetzung: "Strich rechts der Mitte zwischen „leicht“ und „schwer“",
    aufgaben: [
      { nr: 1, auftrag: "Löse die Aufgaben.", beispiel: "360 + 610 · 578 − 99 · 520 + 190 · 630 − 450",
        typ: "Kopfrechnen bis 1000 mit Zehnern", max: 4, punkte: 4, aufteilung: "1 P. je Aufgabe", rechenweg: "nein",
        ergebnis: "alle richtig",
        lernwelt: { stand: "teilweise", wo: "Tagesaufgabe (Zehner/Hunderter), Trick 98/99 im Lernquiz", abweichung: "keine reine Kopfrechenreihe mit Plus und Minus" } },
      { nr: 2, auftrag: "Rechne schriftlich. Denke an die Merkzahlen. Teilweise musst du knobeln. (Klecksaufgaben)", beispiel: "372 + 378 · 5_8 + 2_2 = 81_",
        typ: "schriftliche Addition, Klecksaufgabe", max: 5, punkte: 5, aufteilung: "nicht angegeben", rechenweg: "schriftlich",
        ergebnis: "750; 538 + 272 = 810",
        lernwelt: { stand: "teilweise", wo: "Rechenkästchen im Lernquiz", abweichung: "Ergebnis wird aus Vorschlägen gewählt, nicht selbst gerechnet; keine Klecksaufgabe; die Lernwelt sagt nie „Merkzahl“" } },
      { nr: 3, auftrag: "Rechne schriftlich. Denke an die Merkzahlen. Teilweise musst du knobeln. (Klecksaufgaben)", beispiel: "641 − 187 · 8_4 − 256 = _3_",
        typ: "schriftliche Subtraktion mit Übertrag, Klecksaufgabe", max: 4.5, punkte: 4.5, aufteilung: "nicht angegeben (halbe Punkte)", rechenweg: "schriftlich",
        ergebnis: "454; 894 − 256 = 638",
        lernwelt: { stand: "teilweise", wo: "Minus-Maschine (Klasse 3), Rechenkästchen", abweichung: "Minus-Maschine sagt „Ausleihen“, Heft sagt „Übertrag“, Probe sagt „Merkzahl“; keine Klecksaufgabe" } },
      { nr: 4, auftrag: "Hier haben sich Fehler eingeschlichen. Kreise den Fehler ein und rechne richtig.", beispiel: "613 − 351 = 342 · 415 + 295 = 610",
        typ: "Fehlersuche in schriftlicher Rechnung", max: 5, punkte: 3, aufteilung: "Annahme: je Rechnung 1 P. fürs Einkreisen, Rest fürs richtige Rechnen", rechenweg: "schriftlich",
        ergebnis: "beide richtig gerechnet (262, 710), eingekreist aber nicht die falsche Ergebnisziffer",
        verloren: "Fehlerstelle nicht genau eingekreist",
        lernwelt: { stand: "nein", wo: "–", abweichung: "eine Übung „Fehler einkreisen“ gibt es nicht" } },
      { nr: 5, auftrag: "Schreibe sinnvolle Subtraktionsaufgaben auf und rechne schriftlich untereinander.", beispiel: "Zahlenwolken: 687 und 413 · 834 und 248 · 123 und 321 · 700 und 77",
        typ: "offene Aufgabe, schriftliche Subtraktion", max: 4, punkte: 4, aufteilung: "1 P. je Wolke", rechenweg: "schriftlich",
        ergebnis: "274, 586, 198, 623 – alle richtig",
        lernwelt: { stand: "nein", wo: "–", abweichung: "keine Zahlenwolken, keine selbst gebildeten Aufgaben" } },
      { nr: 6, auftrag: "Schreibe alle Rechenschritte und das Ergebnis auf.", beispiel: "„Subtrahiere 90 von der Summe aus 250 und 300.“ · „Bilde die Differenz aus den Zahlen 569 und 28.“",
        typ: "Fachbegriffe in eine Rechnung übersetzen (mehrschrittig)", max: 3, punkte: 1, aufteilung: "aus Pauls Punkten abgeleitet: a) 2 P., b) 1 P.", rechenweg: "ja",
        ergebnis: "a) 250 − 90 = 160, 300 − 160 = 140 (richtig: 250 + 300 = 550, 550 − 90 = 460); b) 541 richtig",
        verloren: "Reihenfolge der Fachbegriffe: erst die Summe bilden, dann subtrahieren",
        lernwelt: { stand: "teilweise", wo: "Fachwörter im Probenstoff (bis 19.10.2026)", abweichung: "nur einschrittig; die Formen „Bilde die Differenz aus …“ und „Subtrahiere … von der Summe …“ kommen nicht vor" } },
      { nr: 7, auftrag: "Löse die Zahlenmauer!", beispiel: "4 Reihen, unten 187 · 65 · 29 · 141 (mit Lücken)",
        typ: "Zahlenmauer mit Plus und Minus", max: 3, punkte: 3, aufteilung: "Annahme: ½ P. je Lücke (6 Lücken)", rechenweg: "nein",
        ergebnis: "alles richtig, Spitze 610 (auf dem Papier nachgesehen am 26.10.2026)",
        lernwelt: { stand: "nein", wo: "–", abweichung: "keine Zahlenmauer" } },
      { nr: 8, auftrag: "Welche Zahl ist es?", beispiel: "„Ich denke mir eine Zahl. Wenn ich sie um 76 vergrößere erhalte ich das Doppelte von 50. Wie heißt meine Zahl?“",
        typ: "Zahlenrätsel mit Umkehraufgabe", max: 1.5, punkte: 1.5, aufteilung: "nicht angegeben (halbe Punkte)", rechenweg: "nein",
        ergebnis: "24",
        lernwelt: { stand: "ja", wo: "Probenstoff (bis 19.10.2026), Tagesaufgabe Textaufgaben", abweichung: "Probenstoff seit 19.10.2026 aus" } },
      { nr: 9, auftrag: "Rechne aus.", beispiel: "240 : 8 · 240 : 80 · 720 : 9 · 720 : 90 · 350 : 50 · 810 : 90",
        typ: "Teilen mit Zehnerzahlen (Nachbaraufgaben)", max: 3, punkte: 3, aufteilung: "½ P. je Aufgabe", rechenweg: "nein",
        ergebnis: "alle richtig",
        lernwelt: { stand: "ja", wo: "Generalprobe Mathe Teil 3, Nullentrick im Lernquiz", abweichung: "Paare wie 240 : 8 / 240 : 80 nebeneinander kommen nicht vor" } },
      { nr: 10, auftrag: "Schreibe alle Teiler der Zahlen auf.", beispiel: "Teiler von 19 · Teiler von 20",
        typ: "Teiler", max: 4, punkte: 4, aufteilung: "Annahme: ½ P. je Teiler (8 Teiler)", rechenweg: "nein",
        ergebnis: "1, 19 · 1, 20, 2, 10, 4, 5",
        lernwelt: { stand: "ja", wo: "Generalprobe Mathe Teil 6", abweichung: "Teiler werden angetippt statt aufgeschrieben; nur Zahlen 12–36, keine Primzahl wie 19" } },
      { nr: 11, auftrag: "Rechne aus. Denke an die Rechenregel.", beispiel: "25 + 3 · 8 · 45 − 14 : 2 · 8 + 2 · 4 + 5",
        typ: "Punkt vor Strich", max: 3, punkte: 1, aufteilung: "1 P. je Aufgabe", rechenweg: "zeile",
        ergebnis: "52 (richtig 49), 38 richtig, 27 (richtig 21)",
        verloren: "Punkt vor Strich nicht beachtet, von links nach rechts gerechnet",
        lernwelt: { stand: "ja", wo: "Generalprobe Mathe (Punkt vor Strich), „Mein Rechenweg“", abweichung: "nur mit 3 Zahlen; die Probe sagt „Rechenregel“, die Lernwelt „Punktrechnung geht vor Strichrechnung“" } },
      { nr: 12, auftrag: "Löse die Rechentabellen.", beispiel: "Mal-Tabelle mit 50 und 4, 20 · Geteilt-Tabelle mit 240 und 6, 3 (auch Randzahlen gesucht)",
        typ: "Rechentabelle mit Umkehraufgabe", max: 4, punkte: 4, aufteilung: "Annahme: ½ P. je Lücke (8 Lücken)", rechenweg: "nein",
        ergebnis: "alles richtig",
        lernwelt: { stand: "teilweise", wo: "Einmaleins-Tabelle zum Ausfüllen", abweichung: "nur Einmaleins bis 10, keine Zehnerzahlen, keine gesuchten Randzahlen" } },
      { nr: 13, auftrag: "Welche Aufgaben gehören in die Kiste mit Rest 3 (2, 1, 20, 30)? Verbinde die Aufgabenkarten mit der passenden Kiste.", beispiel: "30 : 4 · 23 : 7 · 41 : 8 · 570 : 60 · 140 : 30 · 750 : 80 (Kiste Rest 3 bleibt leer)",
        typ: "Teilen mit Rest, zuordnen", max: 6, punkte: 6, aufteilung: "1 P. je Karte", rechenweg: "nein",
        ergebnis: "alles richtig",
        lernwelt: { stand: "teilweise", wo: "Generalprobe Mathe Teil 4 (Teilen mit Rest)", abweichung: "kein Zuordnen zu Kisten, keine leere Kiste als Falle" } },
    ],
    fehlerthemen: [
      { titel: "Punkt vor Strich", aufgaben: [11], verloren: 2 },
      { titel: "Fachbegriffe (Summe, Differenz, „subtrahiere von“) in eine mehrschrittige Rechnung übersetzen", aufgaben: [6], verloren: 2 },
      { titel: "Fehlerstelle genau einkreisen", aufgaben: [4], verloren: 2 },
    ],
    sicher: ["Kopfrechnen bis 1000", "schriftlich plus und minus", "Klecksaufgaben", "Zahlenmauer", "Teilen mit Zehnerzahlen", "Teiler", "Rechentabellen", "Teilen mit Rest"],
    hinweise: [
      "Der Notenschlüssel steht nicht auf dem Blatt.",
      "Halbe Punkte kommen vor (4,5 und 1,5). Meist gibt es 1 Punkt je Teilergebnis.",
      "Rechenweg ausdrücklich verlangt bei Nr. 6, bei Nr. 11 ist eine Zeile dafür vorgegeben.",
      "Am Ende schätzt das Kind ein, wie leicht oder schwer die Aufgaben waren.",
    ],
  },
];

// Nur fuer die Pruefung: dieselben Summen, die die Seite zeigt.
export function summen(p) {
  const max = p.aufgaben.reduce((s, a) => s + a.max, 0);
  const punkte = p.aufgaben.reduce((s, a) => s + a.punkte, 0);
  return { max, punkte };
}
