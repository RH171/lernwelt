/* ERZEUGT von werkzeuge/aktuell-vorschlag.py aus unterlagen/aktuell-2026-11-04/proben-stufen.json - nicht von Hand aendern.
 * Vorschlag je Blatt fuer die Elternseite "Blaetter abschliessen" (nur Paul). Stufen nach Inhalt plus Regeln 1-4
 * (Auftrag 208, 04.11.2026). "probenzeitraum" = Probenzeitraum, nicht abgefragt (schliesst).
 * Eine Probe mit "bestaetigt" gilt als Grundstand, ohne KV-Schreiben (AKTUELL.vorschlagBasis); jeder Abschluss auf der
 * Elternseite gilt vorrangig. Ohne "bestaetigt" schliesst erst Dennys Bestaetigung auf der Elternseite.
 * GRUNDLAGE: Blatt-Kennung -> Halbsatz (Regel 5), steuert nur die Reihenfolge im Altbestand. */
export const VORSCHLAG = {
 "paul": {
  "proben": [
   {
    "fach": "mathe",
    "probe": "Mathe „Plus, Minus, Mal, Geteilt, Fachbegriffe“",
    "probeDatum": "2026-10-19",
    "vorlaeufig": false,
    "hinweis": "",
    "beweisBlatt": "5tkzva9rss",
    "bestaetigt": {
     "am": "2026-11-04",
     "von": "Denny im Chat 04.11.2026"
    },
    "fenster": [
     "2026-10-14",
     "2026-10-18"
    ],
    "stichtag": "2026-10-16",
    "probenfoto": true,
    "blaetter": [
     {
      "blattId": "nrjtwbfa45",
      "stufe": "probenzeitraum",
      "begruendung": "Regel 3: Schuldatum 16.09.2026 vor dem spätesten Probenblatt (16.10.2026, „Teilen durch 5 mit Rest“), also im Stoffzeitraum der Probe; nicht abgefragt, abgeschlossen. Inhalt: Plus/minus passt zu Aufgabe 1, Nachbarzehner und Wiederholung Klasse 3 kamen nicht vor.",
      "grundlage": "Plus/minus aus Klasse 3: Grundrechnen, auf dem alles aufbaut",
      "regel": 3
     },
     {
      "blattId": "fgovwr046g",
      "stufe": "probenzeitraum",
      "begruendung": "Regel 3: Schuldatum 17.09.2026 vor dem spätesten Probenblatt (16.10.2026, „Teilen durch 5 mit Rest“), also im Stoffzeitraum der Probe; nicht abgefragt, abgeschlossen. Inhalt: Tausenderbuch kam in der Probe nicht vor.",
      "regel": 3
     },
     {
      "blattId": "5jvk2111qb",
      "stufe": "abgefragt",
      "begruendung": "Kopfrechnen plus/minus bis 1000 wie Probe Aufgabe 1.",
      "grundlage": "Kopfrechnen plus/minus bis 1000: Grundlage für Überschlag und jede Sachaufgabe"
     },
     {
      "blattId": "v7elr11soo",
      "stufe": "probenzeitraum",
      "begruendung": "Regel 3: Schuldatum 17.09.2026 vor dem spätesten Probenblatt (16.10.2026, „Teilen durch 5 mit Rest“), also im Stoffzeitraum der Probe; nicht abgefragt, abgeschlossen. Inhalt: Nachbarzahlen kamen in der Probe nicht vor.",
      "regel": 3
     },
     {
      "blattId": "rcvx6u313j",
      "stufe": "abgefragt",
      "begruendung": "Rechenstrategien plus/minus bis 1000 wie Probe Aufgabe 1 (z. B. 578−99).",
      "grundlage": "Kopfrechnen plus/minus bis 1000: Grundlage für Überschlag und jede Sachaufgabe"
     },
     {
      "blattId": "nktw7c3l6m",
      "stufe": "probenzeitraum",
      "begruendung": "Regel 3: Schuldatum 17.09.2026 vor dem spätesten Probenblatt (16.10.2026, „Teilen durch 5 mit Rest“), also im Stoffzeitraum der Probe; nicht abgefragt, abgeschlossen. Inhalt: Heftführung, kein Prüfstoff.",
      "regel": 3
     },
     {
      "blattId": "i4urom4pfm",
      "stufe": "abgefragt",
      "begruendung": "Subtrahieren im Zahlenraum 1000 wie Probe Aufgabe 1.",
      "grundlage": "Kopfrechnen plus/minus bis 1000: Grundlage für Überschlag und jede Sachaufgabe"
     },
     {
      "blattId": "ifmos6hgvs",
      "stufe": "abgefragt",
      "begruendung": "Plus/minus bis 1000 wie Probe Aufgabe 1.",
      "grundlage": "Kopfrechnen plus/minus bis 1000: Grundlage für Überschlag und jede Sachaufgabe"
     },
     {
      "blattId": "cyxsbwrvxd",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Schriftliche Addition wie Probe Aufgaben 2, 4, 5.",
      "grundlage": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht"
     },
     {
      "blattId": "tqasatsswh",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Schriftliche Subtraktion wie Probe Aufgaben 3–5.",
      "grundlage": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht"
     },
     {
      "blattId": "dcfw5dtv8a",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Schriftliche Addition wie Probe Aufgaben 2, 4, 5; Datum von Paul.",
      "grundlage": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht"
     },
     {
      "blattId": "qh8lcou6bl",
      "stufe": "abgefragt",
      "begruendung": "Schriftliche Subtraktion wie Probe Aufgaben 3–5; Datum von Paul.",
      "grundlage": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht"
     },
     {
      "blattId": "di9sd8l5es",
      "stufe": "abgefragt",
      "begruendung": "Schriftliche Addition bis 1000 wie Probe Aufgaben 2, 4.",
      "grundlage": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht"
     },
     {
      "blattId": "4df7oalf79",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Schriftliche Subtraktion mit Fehlersuche und Rechenwörtern wie Probe Aufgaben 3–6.",
      "grundlage": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht"
     },
     {
      "blattId": "m173ogkoeu",
      "stufe": "abgefragt",
      "begruendung": "Schriftliche Addition wie Probe Aufgabe 2.",
      "grundlage": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht"
     },
     {
      "blattId": "m7ogskl5u2",
      "stufe": "abgefragt",
      "begruendung": "Schriftlich plus/minus mit Lückenziffern wie die Klecksaufgaben der Probe (Aufgaben 2, 3).",
      "grundlage": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht"
     },
     {
      "blattId": "n7bp2tbja8",
      "stufe": "abgefragt",
      "begruendung": "Schriftlich plus/minus wie Probe Aufgaben 2–5.",
      "grundlage": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht"
     },
     {
      "blattId": "ntaaffc81s",
      "stufe": "abgefragt",
      "begruendung": "Zahlenrätsel wie Probe Aufgabe 8."
     },
     {
      "blattId": "yd2enafh4h",
      "stufe": "abgefragt",
      "begruendung": "Zahlenrätsel mit Rechenwörtern wie Probe Aufgaben 6 und 8."
     },
     {
      "blattId": "hssm0vl8d1",
      "stufe": "probenzeitraum",
      "begruendung": "Regel 3: Schuldatum 01.10.2026 vor dem spätesten Probenblatt (16.10.2026, „Teilen durch 5 mit Rest“), also im Stoffzeitraum der Probe; nicht abgefragt, abgeschlossen. Inhalt: Kleines Einmaleins ist nur Grundlage, in der Probe nicht direkt gefragt.",
      "grundlage": "Einmaleins: Grundlage für Mal, Geteilt, Teiler und Punkt vor Strich",
      "regel": 3
     },
     {
      "blattId": "bpkri6jv2s",
      "stufe": "abgefragt",
      "begruendung": "Einmaleins mit Punkt vor Strich, Probe Aufgabe 11, Grundlage für 9 und 12.",
      "grundlage": "Einmaleins: Grundlage für Mal, Geteilt, Teiler und Punkt vor Strich; mit Punkt vor Strich"
     },
     {
      "blattId": "e8x5rl20iy",
      "stufe": "abgefragt",
      "begruendung": "Teiler finden wie Probe Aufgabe 10 (Vielfache kamen nicht vor).",
      "grundlage": "Teiler finden: Einmaleins rückwärts, Grundlage für Brüche und Vielfache"
     },
     {
      "blattId": "2oyye63jo7",
      "stufe": "probenzeitraum",
      "begruendung": "Regel 3: Schuldatum 06.10.2026 vor dem spätesten Probenblatt (16.10.2026, „Teilen durch 5 mit Rest“), also im Stoffzeitraum der Probe; nicht abgefragt, abgeschlossen. Inhalt: Einfache Geteilt-Aufgaben sind nur Grundlage für Aufgaben 9 und 13.",
      "grundlage": "Geteilt: Umkehrung des Einmaleins, Grundlage für Teilen mit Rest und Sachaufgaben",
      "regel": 3
     },
     {
      "blattId": "rd4hwi3rcd",
      "stufe": "abgefragt",
      "begruendung": "Teiler finden wie Probe Aufgabe 10.",
      "grundlage": "Teiler finden: Einmaleins rückwärts, Grundlage für Brüche und Vielfache"
     },
     {
      "blattId": "ff5apf4k2r",
      "stufe": "abgefragt",
      "begruendung": "Teiler von 19 und 20 stehen wörtlich darauf (Probe Aufgabe 10); Produkt, Quotient, Primzahl kamen in der Probe nicht vor.",
      "grundlage": "Teiler finden: Einmaleins rückwärts, Grundlage für Brüche und Vielfache"
     },
     {
      "blattId": "44hlbc6vvm",
      "stufe": "abgefragt",
      "begruendung": "Mischblatt mit Punkt vor Strich und Kopfrechnen, Probe Aufgaben 1 und 11.",
      "grundlage": "Punkt vor Strich: Rechenregel, gilt in jeder späteren Aufgabe; dazu Kopfrechnen"
     },
     {
      "blattId": "wulbdn4urh",
      "stufe": "abgefragt",
      "begruendung": "Teiler finden wie Probe Aufgabe 10.",
      "grundlage": "Teiler finden: Einmaleins rückwärts, Grundlage für Brüche und Vielfache"
     },
     {
      "blattId": "j9sfyiuyte",
      "stufe": "abgefragt",
      "begruendung": "Mal mit Zehnerzahlen wie Probe Aufgabe 12 (bisher fälschlich „Kopfrechnen A1, 6, 8“).",
      "grundlage": "Mal mit Zehnerzahlen: Stellenwert-Trick, Grundlage für Mal mit Hunderterzahlen (28.10.)"
     },
     {
      "blattId": "jbuxcyx3ym",
      "stufe": "abgefragt",
      "begruendung": "Mal mit Zehnerzahlen wie Probe Aufgabe 12 (bisher fälschlich „Kopfrechnen A1, 6, 8“).",
      "grundlage": "Mal mit Zehnerzahlen: Stellenwert-Trick, Grundlage für Mal mit Hunderterzahlen (28.10.)"
     },
     {
      "blattId": "ycle04vm7v",
      "stufe": "abgefragt",
      "begruendung": "Durch Zehnerzahlen teilen wie Probe Aufgabe 9 (bisher fälschlich „Kopfrechnen A1, 6, 8“).",
      "grundlage": "Geteilt: Umkehrung des Einmaleins, Grundlage für Teilen mit Rest und Sachaufgaben; durch Zehner"
     },
     {
      "blattId": "k72y352si1",
      "stufe": "abgefragt",
      "begruendung": "Einmaleins mit Zehnerzahlen wie Rechentabellen Probe Aufgabe 12.",
      "grundlage": "Einmaleins: Grundlage für Mal, Geteilt, Teiler und Punkt vor Strich; mit Zehnerzahlen"
     },
     {
      "blattId": "jez39ew3h7",
      "stufe": "abgefragt",
      "begruendung": "Teilen mit Rest wie Probe Aufgabe 13 (bisher fälschlich „Teiler finden A10“).",
      "grundlage": "Teilen mit Rest: Grundverfahren beim Teilen, kommt in jedem späteren Geteilt-Stoff wieder"
     },
     {
      "blattId": "q6glf3xv13",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Teilen mit Rest wie Probe Aufgabe 13.",
      "grundlage": "Teilen mit Rest: Grundverfahren beim Teilen, kommt in jedem späteren Geteilt-Stoff wieder"
     },
     {
      "blattId": "y3hm4vzkrj",
      "stufe": "abgefragt",
      "begruendung": "Durch Zehnerzahlen dividieren wie Probe Aufgabe 9 (bisher „Aufgabe 13“).",
      "grundlage": "Geteilt: Umkehrung des Einmaleins, Grundlage für Teilen mit Rest und Sachaufgaben; durch Zehner"
     },
     {
      "blattId": "1x9txoyt4f",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Teilen mit Rest wie Probe Aufgabe 13; bisher nur wegen Upload am 16.10. offen.",
      "grundlage": "Teilen mit Rest: Grundverfahren beim Teilen, kommt in jedem späteren Geteilt-Stoff wieder"
     },
     {
      "blattId": "2ialalqizs",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Teilen mit Rest auch mit Zehnern (wie 570:60) und Punkt vor Strich, Probe Aufgaben 9, 11, 13.",
      "grundlage": "Einmaleins: Grundlage für Mal, Geteilt, Teiler und Punkt vor Strich; Mal und Geteilt gemischt"
     },
     {
      "blattId": "8o6ufnxur4",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Wie 2ialalqizs, Probe Aufgaben 9, 11, 13; bisher nur wegen Upload am 16.10. offen.",
      "grundlage": "Einmaleins: Grundlage für Mal, Geteilt, Teiler und Punkt vor Strich; Mal und Geteilt gemischt"
     },
     {
      "blattId": "oewbd88522",
      "stufe": "abgefragt",
      "begruendung": "Teiler finden wie Probe Aufgabe 10; bisher nur wegen Upload am 16.10. offen.",
      "grundlage": "Teiler finden: Einmaleins rückwärts, Grundlage für Brüche und Vielfache"
     },
     {
      "blattId": "5tkzva9rss",
      "stufe": "abgefragt",
      "begruendung": "Teilen mit Rest wie Probe Aufgabe 13; bisher nur wegen Upload am 16.10. offen.",
      "grundlage": "Teilen mit Rest: Grundverfahren beim Teilen, kommt in jedem späteren Geteilt-Stoff wieder"
     },
     {
      "blattId": "r7ung8g7u6",
      "stufe": "unsicher",
      "begruendung": "Zahlen in Malaufgaben zerlegen ist nah an Teilern, aber nicht direkt gefragt; war bisher „letztes Probenblatt“.",
      "grundlage": "Einmaleins: Grundlage für Mal, Geteilt, Teiler und Punkt vor Strich; Zahlen in Malaufgaben zerlegen"
     },
     {
      "blattId": "he331mspzq",
      "stufe": "abgefragt",
      "begruendung": "Fast wörtlich Probe Aufgabe 8 („um … vergrößert = Doppelte von 50“); bisher nur wegen Upload am 16.10. offen."
     },
     {
      "blattId": "k6i05tuyia",
      "stufe": "nicht abgefragt",
      "begruendung": "Sachaufgaben nach der Probe, in der Probe keine Sachaufgaben."
     },
     {
      "blattId": "u6yz99ubmi",
      "stufe": "nicht abgefragt",
      "begruendung": "Sachaufgaben nach der Probe, in der Probe keine Sachaufgaben."
     },
     {
      "blattId": "75xb6uavut",
      "stufe": "nicht abgefragt",
      "begruendung": "Zahlenraum bis 2000, neuer Stoff nach der Probe."
     },
     {
      "blattId": "g503ypea2c",
      "stufe": "nicht abgefragt",
      "begruendung": "Zahlenraum bis 2000, neuer Stoff nach der Probe."
     },
     {
      "blattId": "5490uqtsk6",
      "stufe": "unsicher",
      "begruendung": "Stoff (schriftlich plus/minus) war in der Probe, das Blatt selbst ist eine Wiederholung vom 27.10., nach der Probe.",
      "grundlage": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht",
      "widerspruch": "Inhalt (schriftlich plus/minus) steht in der Probe, Schuldatum 27.10. liegt aber 8 Tage nach dem Probentag (Datum von Paul). Bleibt offen, bis Denny entscheidet."
     },
     {
      "blattId": "8tv8tshw4c",
      "stufe": "nicht abgefragt",
      "begruendung": "Malnehmen mit Hunderterzahlen bis 6300, neuer Stoff nach der Probe.",
      "grundlage": "Mal mit Zehnerzahlen: Stellenwert-Trick, Grundlage für Mal mit Hunderterzahlen"
     },
     {
      "blattId": "9m35z4kkqe",
      "stufe": "nicht abgefragt",
      "begruendung": "Sachaufgaben vom 30.10., nach der Probe."
     }
    ]
   },
   {
    "fach": "deutsch",
    "probe": "Deutsch „Sprachuntersuchen | RS“",
    "probeDatum": "2026-10-23",
    "vorlaeufig": true,
    "hinweis": "Probenfoto fehlt: Datum nur angekündigt, Stufen vorläufig nach Thema und Datum. Probenzeitraum (Regel 3) erst mit Probenfoto.",
    "fenster": [
     "2026-10-18",
     "2026-10-22"
    ],
    "probenfoto": false,
    "blaetter": [
     {
      "blattId": "6kyh0py7u8",
      "stufe": "abgefragt",
      "begruendung": "Nomen mit Begleiter und Hinhör-Text, passt zu Sprachuntersuchen und RS."
     },
     {
      "blattId": "6nb3g8825v",
      "stufe": "nicht abgefragt",
      "begruendung": "⚠️ gleicher Titel. Lineatur und Schrift, kein Prüfstoff."
     },
     {
      "blattId": "67ijvb8i1r",
      "stufe": "nicht abgefragt",
      "begruendung": "⚠️ gleicher Titel. Lineatur und Schrift, kein Prüfstoff."
     },
     {
      "blattId": "swtceu8y8u",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Sprachuntersuchen vor dem angekündigten Termin 23.10.: Wortarten zuordnen.",
      "grundlage": "Wortarten erkennen (Nomen, Verb, Adjektiv): Grundlage für Großschreibung und jedes Sprachuntersuchen"
     },
     {
      "blattId": "2k3x9m9sf2",
      "stufe": "nicht abgefragt",
      "begruendung": "Lineatur und Schrift, kein Prüfstoff."
     },
     {
      "blattId": "1qr2kna2xa",
      "stufe": "nicht abgefragt",
      "begruendung": "Schreibschrift, kein Prüfstoff."
     },
     {
      "blattId": "7kr2qvai1y",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Sprachuntersuchen vor dem angekündigten Termin 23.10.: Wortarten in Tabelle, gleicher Inhalt wie 071dl0l1dy (doppelt hochgeladen).",
      "grundlage": "Wortarten erkennen (Nomen, Verb, Adjektiv): Grundlage für Großschreibung und jedes Sprachuntersuchen"
     },
     {
      "blattId": "eabd73ausa",
      "stufe": "abgefragt",
      "begruendung": "Sprachuntersuchen vor dem angekündigten Termin 23.10.: Merkeintrag Nomen, Verben, Adjektive.",
      "grundlage": "Wortarten erkennen (Nomen, Verb, Adjektiv): Grundlage für Großschreibung und jedes Sprachuntersuchen"
     },
     {
      "blattId": "h00oz7bbtv",
      "stufe": "nicht abgefragt",
      "begruendung": "Heftführung, kein Prüfstoff."
     },
     {
      "blattId": "9xjm4kc9i0",
      "stufe": "unsicher",
      "begruendung": "Reines Abschreiben; ob die RS-Probe einen Abschreibteil hatte, zeigt erst das Probenfoto.",
      "grundlage": "Worttrennung: Rechtschreib-Grundregel, gilt in jedem Text"
     },
     {
      "blattId": "ngd66acqiv",
      "stufe": "unsicher",
      "begruendung": "Reines Abschreiben; ob die RS-Probe einen Abschreibteil hatte, zeigt erst das Probenfoto."
     },
     {
      "blattId": "ys7cxgd8ue",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Sprachuntersuchen vor dem angekündigten Termin 23.10.: Nomen erkennen, gleicher Inhalt wie v2m1r2vb3w (doppelt hochgeladen).",
      "grundlage": "Nomen großschreiben: Rechtschreib-Grundregel, gilt in jedem Text"
     },
     {
      "blattId": "071dl0l1dy",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Sprachuntersuchen vor dem angekündigten Termin 23.10.: Wortarten in Tabelle, gleicher Inhalt wie 7kr2qvai1y (doppelt hochgeladen).",
      "grundlage": "Wortarten erkennen (Nomen, Verb, Adjektiv): Grundlage für Großschreibung und jedes Sprachuntersuchen"
     },
     {
      "blattId": "75rjuqomzx",
      "stufe": "nicht abgefragt",
      "begruendung": "Lesetext (Leseprobe 09.10. oder keine Probe), nicht Sprachuntersuchen/RS."
     },
     {
      "blattId": "v2m1r2vb3w",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Sprachuntersuchen vor dem angekündigten Termin 23.10.: Nomen erkennen, gleicher Inhalt wie ys7cxgd8ue (doppelt hochgeladen).",
      "grundlage": "Nomen großschreiben: Rechtschreib-Grundregel, gilt in jedem Text"
     },
     {
      "blattId": "kh4j6hvqdq",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Sprachuntersuchen vor dem angekündigten Termin 23.10.: Nomen erkennen, andere Seite mit Lehrerinnen-Korrektur.",
      "grundlage": "Nomen großschreiben: Rechtschreib-Grundregel, gilt in jedem Text"
     },
     {
      "blattId": "r4vzt5uf6x",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Sprachuntersuchen vor dem angekündigten Termin 23.10.: konkrete und abstrakte Nomen."
     },
     {
      "blattId": "l4vp56uu1r",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Sprachuntersuchen vor dem angekündigten Termin 23.10.: konkrete und abstrakte Nomen, zweite Seite."
     },
     {
      "blattId": "m5rpf5zmj7",
      "stufe": "abgefragt",
      "begruendung": "Sprachuntersuchen vor dem angekündigten Termin 23.10.: zusammengesetzte Nomen."
     },
     {
      "blattId": "66j7pn0a3v",
      "stufe": "abgefragt",
      "begruendung": "Sprachuntersuchen vor dem angekündigten Termin 23.10.: abstrakte Nomen ordnen."
     },
     {
      "blattId": "q3dxgcd55k",
      "stufe": "abgefragt",
      "begruendung": "Sprachuntersuchen vor dem angekündigten Termin 23.10.: Nachsilben von Nomen.",
      "grundlage": "Nachsilben -heit/-keit/-ung: Signal für Großschreibung, Grundregel der Rechtschreibung"
     },
     {
      "blattId": "be828lmi70",
      "stufe": "abgefragt",
      "begruendung": "Sprachuntersuchen vor dem angekündigten Termin 23.10.: Nomen mit -heit.",
      "grundlage": "Nachsilben -heit/-keit/-ung: Signal für Großschreibung, Grundregel der Rechtschreibung"
     },
     {
      "blattId": "x0g2ecn2i2",
      "stufe": "abgefragt",
      "begruendung": "Sprachuntersuchen vor dem angekündigten Termin 23.10.: Nomen mit -keit.",
      "grundlage": "Nachsilben -heit/-keit/-ung: Signal für Großschreibung, Grundregel der Rechtschreibung"
     },
     {
      "blattId": "royylnna86",
      "stufe": "abgefragt",
      "begruendung": "Sprachuntersuchen vor dem angekündigten Termin 23.10.: Nomen mit -ung.",
      "grundlage": "Nachsilben -heit/-keit/-ung: Signal für Großschreibung, Grundregel der Rechtschreibung"
     },
     {
      "blattId": "w3us2aftse",
      "stufe": "abgefragt",
      "begruendung": "Lernwörter, RS-Teil."
     },
     {
      "blattId": "fd2lth6inq",
      "stufe": "abgefragt",
      "begruendung": "Sprachuntersuchen vor dem angekündigten Termin 23.10.: Adjektive markieren."
     },
     {
      "blattId": "y23vi75kgp",
      "stufe": "abgefragt",
      "begruendung": "Sprachuntersuchen vor dem angekündigten Termin 23.10.: Nomen mit -e."
     },
     {
      "blattId": "ce1j696ekd",
      "stufe": "nicht abgefragt",
      "begruendung": "Eigener Text (Texte schreiben), nicht Sprachuntersuchen/RS."
     },
     {
      "blattId": "9apups42yx",
      "stufe": "nicht abgefragt",
      "begruendung": "Lesetext, nicht Sprachuntersuchen/RS."
     },
     {
      "blattId": "psd8k1wt8b",
      "stufe": "abgefragt",
      "begruendung": "Lernwörter aufbauen und Adjektive im Hinhör-Text, RS-Teil."
     },
     {
      "blattId": "f1k7iaw0ea",
      "stufe": "abgefragt",
      "begruendung": "Sprachuntersuchen vor dem angekündigten Termin 23.10.: Adjektive mit Nachsilben."
     },
     {
      "blattId": "ftdljy0zdb",
      "stufe": "nicht abgefragt",
      "begruendung": "Lesefragen, nicht Sprachuntersuchen/RS."
     },
     {
      "blattId": "9f3pr71iyf",
      "stufe": "nicht abgefragt",
      "begruendung": "Lesetext, nicht Sprachuntersuchen/RS."
     },
     {
      "blattId": "yubacw1x0y",
      "stufe": "abgefragt",
      "begruendung": "Sprachuntersuchen vor dem angekündigten Termin 23.10.: Adjektive aus Nomen und Verben."
     },
     {
      "blattId": "cd1i16t982",
      "stufe": "abgefragt",
      "begruendung": "Sprachuntersuchen vor dem angekündigten Termin 23.10.: Adjektive mit Wortbausteinen; Datum von Paul, aber am 13.10. hochgeladen, also sicher vorher."
     },
     {
      "blattId": "toqf6mzn7u",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Sprachuntersuchen vor dem angekündigten Termin 23.10.: Adjektive mit -bar, -haft, -los."
     },
     {
      "blattId": "bg15umzxw1",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Sprachuntersuchen vor dem angekündigten Termin 23.10.: Adjektive mit -ig, -lich, -isch (andere Seite)."
     },
     {
      "blattId": "d7es6jt51h",
      "stufe": "abgefragt",
      "begruendung": "Trennungsregeln und Groß/klein vom 14.10., RS-Teil; bisher nur wegen Upload offen.",
      "grundlage": "Worttrennung: Rechtschreib-Grundregel, gilt in jedem Text"
     },
     {
      "blattId": "k19oqr39eh",
      "stufe": "abgefragt",
      "begruendung": "Merkeintrag Worttrennung vom 14.10., RS-Teil; bisher nur wegen Upload am 28.10. offen.",
      "grundlage": "Worttrennung: Rechtschreib-Grundregel, gilt in jedem Text"
     },
     {
      "blattId": "tt9xymh4xv",
      "stufe": "abgefragt",
      "begruendung": "Steigerung vom 15.10., Thema vor dem Termin; bisher nur wegen Upload offen. Fast gleicher Inhalt wie sg8t5h5vbv."
     },
     {
      "blattId": "674qdumpbh",
      "stufe": "abgefragt",
      "begruendung": "Vergleichsstufen vom 15.10., Thema vor dem Termin; bisher nur wegen Upload offen."
     },
     {
      "blattId": "a0r1dt4r0l",
      "stufe": "unsicher",
      "begruendung": "⚠️ gleicher Titel. Zusammengesetzte Adjektive: Merkeintrag 15.10., geübt aber erst 26./27.10., also nach dem Termin."
     },
     {
      "blattId": "sg8t5h5vbv",
      "stufe": "abgefragt",
      "begruendung": "Steigerung vom 15.10., Thema vor dem Termin; bisher nur wegen Upload offen. Fast gleicher Inhalt wie tt9xymh4xv."
     },
     {
      "blattId": "94qwj6n68m",
      "stufe": "abgefragt",
      "begruendung": "Wörterbuch-Regeln vom 16.10., RS-Teil; bisher nur wegen Upload offen.",
      "grundlage": "Nachschlagen im Wörterbuch: Grundtechnik für jede Rechtschreibprüfung"
     },
     {
      "blattId": "y1jaxopdto",
      "stufe": "abgefragt",
      "begruendung": "Lernwörter Buchstabe für Buchstabe vom 16.10., RS-Teil; bisher nur wegen Upload offen."
     },
     {
      "blattId": "ukgsfgpoxu",
      "stufe": "abgefragt",
      "begruendung": "Lernwörterdiktat vom 16.10., typischer RS-Stoff."
     },
     {
      "blattId": "pwu0qywws4",
      "stufe": "unsicher",
      "begruendung": "Wörterbuch-Übung vom 19.10. (Datum von Paul), nur 4 Tage vor dem unbestätigten Termin.",
      "grundlage": "Nachschlagen im Wörterbuch: Grundtechnik für jede Rechtschreibprüfung"
     },
     {
      "blattId": "8fdw8467d2",
      "stufe": "unsicher",
      "begruendung": "Steigerung vom 19.10., nur 4 Tage vor dem unbestätigten Termin."
     },
     {
      "blattId": "1vxmdm6q9i",
      "stufe": "unsicher",
      "begruendung": "Steigerung vom 19.10. (Datum von Paul), nur 4 Tage vor dem unbestätigten Termin."
     },
     {
      "blattId": "hen76451qo",
      "stufe": "nicht abgefragt",
      "begruendung": "⚠️ gleicher Titel. Vom 26.10., nach dem Termin; gleicher Inhalt wie jnvzbg8085."
     },
     {
      "blattId": "jnvzbg8085",
      "stufe": "nicht abgefragt",
      "begruendung": "⚠️ gleicher Titel. Vom 26.10., nach dem Termin; gleicher Inhalt wie hen76451qo."
     },
     {
      "blattId": "52uigby5aa",
      "stufe": "nicht abgefragt",
      "begruendung": "⚠️ gleicher Titel. Vom 27.10., nach dem Termin."
     },
     {
      "blattId": "x190orot42",
      "stufe": "nicht abgefragt",
      "begruendung": "Lesetext vom 29.10., nach dem Termin."
     },
     {
      "blattId": "i8s4xyjld9",
      "stufe": "nicht abgefragt",
      "begruendung": "Brief schreiben vom 30.10., nach dem Termin."
     }
    ]
   },
   {
    "fach": "hsu",
    "probe": "HSU „Fürth, unsere Stadt“",
    "probeDatum": "2026-10-27",
    "vorlaeufig": true,
    "hinweis": "Probenfoto fehlt: Datum nur angekündigt, Stufen vorläufig nach Thema und Datum. Probenzeitraum (Regel 3) erst mit Probenfoto.",
    "fenster": [
     "2026-10-22",
     "2026-10-26"
    ],
    "probenfoto": false,
    "blaetter": [
     {
      "blattId": "jf2bvfr1lf",
      "stufe": "abgefragt",
      "begruendung": "Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Stadtporträt."
     },
     {
      "blattId": "4u7p549uxr",
      "stufe": "abgefragt",
      "begruendung": "Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Gründungssage."
     },
     {
      "blattId": "jom992basv",
      "stufe": "abgefragt",
      "begruendung": "Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Stadtgeschichte."
     },
     {
      "blattId": "d2iiwyacc5",
      "stufe": "abgefragt",
      "begruendung": "Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Königshof; Datum von Paul, aber am 28.09. hochgeladen, also sicher vorher."
     },
     {
      "blattId": "opk8qs96z0",
      "stufe": "abgefragt",
      "begruendung": "Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Gemeinde und Verwaltung."
     },
     {
      "blattId": "cvp2rkkcal",
      "stufe": "abgefragt",
      "begruendung": "Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Aufgaben der Stadt."
     },
     {
      "blattId": "h8n4p6hopx",
      "stufe": "abgefragt",
      "begruendung": "Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Schule als Aufgabe der Gemeinde."
     },
     {
      "blattId": "0y20szi2z3",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Ämter, Merkeintrag."
     },
     {
      "blattId": "m2vebh7uw6",
      "stufe": "abgefragt",
      "begruendung": "⚠️ gleicher Titel. Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Ämter zuordnen, Übung."
     },
     {
      "blattId": "vmnk9ku4ft",
      "stufe": "abgefragt",
      "begruendung": "Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Einnahmen."
     },
     {
      "blattId": "0qhs63uo4j",
      "stufe": "abgefragt",
      "begruendung": "Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Geld und Haushaltsplan."
     },
     {
      "blattId": "tqzv2pux68",
      "stufe": "abgefragt",
      "begruendung": "Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Wahl und Stadtrat."
     },
     {
      "blattId": "3e8kjtv6v4",
      "stufe": "abgefragt",
      "begruendung": "Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Mitbestimmung der Bürger."
     },
     {
      "blattId": "kiub8ud5wh",
      "stufe": "unsicher",
      "begruendung": "Regel 2: Schuldatum 22.10.2026 in den letzten 5 Tagen vor dem Probentag, Inhalt ohne Probenfoto nicht eindeutig belegt; bleibt offen. Vorher: Thema „Fürth, unsere Stadt“ vor dem angekündigten Termin 27.10.: Bürgerinitiative, 5 Tage vor dem Termin, setzt die Kette Wahl und Mitbestimmung fort.",
      "regel": 2
     },
     {
      "blattId": "1e7tvugb5h",
      "stufe": "nicht abgefragt",
      "begruendung": "Vom 29.10., nach dem Termin; neues Thema (Fürth bis Welt)."
     }
    ]
   }
  ]
 }
};
export const GRUNDLAGE = {
 "paul": {
  "nrjtwbfa45": "Plus/minus aus Klasse 3: Grundrechnen, auf dem alles aufbaut",
  "5jvk2111qb": "Kopfrechnen plus/minus bis 1000: Grundlage für Überschlag und jede Sachaufgabe",
  "rcvx6u313j": "Kopfrechnen plus/minus bis 1000: Grundlage für Überschlag und jede Sachaufgabe",
  "i4urom4pfm": "Kopfrechnen plus/minus bis 1000: Grundlage für Überschlag und jede Sachaufgabe",
  "ifmos6hgvs": "Kopfrechnen plus/minus bis 1000: Grundlage für Überschlag und jede Sachaufgabe",
  "cyxsbwrvxd": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht",
  "tqasatsswh": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht",
  "dcfw5dtv8a": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht",
  "qh8lcou6bl": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht",
  "di9sd8l5es": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht",
  "4df7oalf79": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht",
  "m173ogkoeu": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht",
  "m7ogskl5u2": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht",
  "n7bp2tbja8": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht",
  "hssm0vl8d1": "Einmaleins: Grundlage für Mal, Geteilt, Teiler und Punkt vor Strich",
  "bpkri6jv2s": "Einmaleins: Grundlage für Mal, Geteilt, Teiler und Punkt vor Strich; mit Punkt vor Strich",
  "e8x5rl20iy": "Teiler finden: Einmaleins rückwärts, Grundlage für Brüche und Vielfache",
  "2oyye63jo7": "Geteilt: Umkehrung des Einmaleins, Grundlage für Teilen mit Rest und Sachaufgaben",
  "rd4hwi3rcd": "Teiler finden: Einmaleins rückwärts, Grundlage für Brüche und Vielfache",
  "ff5apf4k2r": "Teiler finden: Einmaleins rückwärts, Grundlage für Brüche und Vielfache",
  "44hlbc6vvm": "Punkt vor Strich: Rechenregel, gilt in jeder späteren Aufgabe; dazu Kopfrechnen",
  "wulbdn4urh": "Teiler finden: Einmaleins rückwärts, Grundlage für Brüche und Vielfache",
  "j9sfyiuyte": "Mal mit Zehnerzahlen: Stellenwert-Trick, Grundlage für Mal mit Hunderterzahlen (28.10.)",
  "jbuxcyx3ym": "Mal mit Zehnerzahlen: Stellenwert-Trick, Grundlage für Mal mit Hunderterzahlen (28.10.)",
  "ycle04vm7v": "Geteilt: Umkehrung des Einmaleins, Grundlage für Teilen mit Rest und Sachaufgaben; durch Zehner",
  "k72y352si1": "Einmaleins: Grundlage für Mal, Geteilt, Teiler und Punkt vor Strich; mit Zehnerzahlen",
  "jez39ew3h7": "Teilen mit Rest: Grundverfahren beim Teilen, kommt in jedem späteren Geteilt-Stoff wieder",
  "q6glf3xv13": "Teilen mit Rest: Grundverfahren beim Teilen, kommt in jedem späteren Geteilt-Stoff wieder",
  "y3hm4vzkrj": "Geteilt: Umkehrung des Einmaleins, Grundlage für Teilen mit Rest und Sachaufgaben; durch Zehner",
  "1x9txoyt4f": "Teilen mit Rest: Grundverfahren beim Teilen, kommt in jedem späteren Geteilt-Stoff wieder",
  "2ialalqizs": "Einmaleins: Grundlage für Mal, Geteilt, Teiler und Punkt vor Strich; Mal und Geteilt gemischt",
  "8o6ufnxur4": "Einmaleins: Grundlage für Mal, Geteilt, Teiler und Punkt vor Strich; Mal und Geteilt gemischt",
  "oewbd88522": "Teiler finden: Einmaleins rückwärts, Grundlage für Brüche und Vielfache",
  "5tkzva9rss": "Teilen mit Rest: Grundverfahren beim Teilen, kommt in jedem späteren Geteilt-Stoff wieder",
  "r7ung8g7u6": "Einmaleins: Grundlage für Mal, Geteilt, Teiler und Punkt vor Strich; Zahlen in Malaufgaben zerlegen",
  "5490uqtsk6": "schriftliches Verfahren (plus/minus): wird bis Klasse 4 und darüber hinaus gebraucht",
  "8tv8tshw4c": "Mal mit Zehnerzahlen: Stellenwert-Trick, Grundlage für Mal mit Hunderterzahlen",
  "swtceu8y8u": "Wortarten erkennen (Nomen, Verb, Adjektiv): Grundlage für Großschreibung und jedes Sprachuntersuchen",
  "7kr2qvai1y": "Wortarten erkennen (Nomen, Verb, Adjektiv): Grundlage für Großschreibung und jedes Sprachuntersuchen",
  "eabd73ausa": "Wortarten erkennen (Nomen, Verb, Adjektiv): Grundlage für Großschreibung und jedes Sprachuntersuchen",
  "9xjm4kc9i0": "Worttrennung: Rechtschreib-Grundregel, gilt in jedem Text",
  "ys7cxgd8ue": "Nomen großschreiben: Rechtschreib-Grundregel, gilt in jedem Text",
  "071dl0l1dy": "Wortarten erkennen (Nomen, Verb, Adjektiv): Grundlage für Großschreibung und jedes Sprachuntersuchen",
  "v2m1r2vb3w": "Nomen großschreiben: Rechtschreib-Grundregel, gilt in jedem Text",
  "kh4j6hvqdq": "Nomen großschreiben: Rechtschreib-Grundregel, gilt in jedem Text",
  "q3dxgcd55k": "Nachsilben -heit/-keit/-ung: Signal für Großschreibung, Grundregel der Rechtschreibung",
  "be828lmi70": "Nachsilben -heit/-keit/-ung: Signal für Großschreibung, Grundregel der Rechtschreibung",
  "x0g2ecn2i2": "Nachsilben -heit/-keit/-ung: Signal für Großschreibung, Grundregel der Rechtschreibung",
  "royylnna86": "Nachsilben -heit/-keit/-ung: Signal für Großschreibung, Grundregel der Rechtschreibung",
  "d7es6jt51h": "Worttrennung: Rechtschreib-Grundregel, gilt in jedem Text",
  "k19oqr39eh": "Worttrennung: Rechtschreib-Grundregel, gilt in jedem Text",
  "94qwj6n68m": "Nachschlagen im Wörterbuch: Grundtechnik für jede Rechtschreibprüfung",
  "pwu0qywws4": "Nachschlagen im Wörterbuch: Grundtechnik für jede Rechtschreibprüfung",
  "qwdaux3rk7": "sich vorstellen (name, age, I like): Grundsätze, die jedes spätere Thema braucht",
  "msi2ofg3dj": "Fragen und Antworten im Dialog: Grundmuster für jedes Gespräch",
  "8vowj6nu41": "Grundwortschatz Schule und Begrüßung"
 }
};
