/* Am Foto bestätigte Fehlalarme der Belegprüfung bei Leon (28.10.2026, Dennys
   Wahl 08:44 Uhr): Fragen, die die Prüfung als unbelegt ausblenden würde, deren
   Lösung aber gedruckt oder rot verbessert auf Leons Blatt steht. Je Frage die
   Zeile auf dem Blatt (belegNr, ab 1). Nur im Werkzeug
   (werkzeuge/beleg-tabelle-leon.mjs), live wirkt nur die Tabelle.
   Fotoprüfung 28.10.2026 der 4 ausgeblendeten Mathe-Fragen: 2 Fehlalarme frei,
   2 echt (qwtffpejwc8qz: „Vorgänger“ steht nicht auf dem Blatt, nur „V“;
   qzgwyfcxtoj5r: Ablenker „von der Mitte“ stammt nicht aus der Schule). */
export const BELEG_FREIGABEN_LEON = {
  q9s5raq9aoj5r: { belegNr: 3 }, // mathe: „Bestimme die Nachbarzahlen“ gedruckt, Tabelle V|Zahl|N mit 18, 19, 20 rot abgehakt (Foto e98s87aego-0, Aufgabe 2 b und c).
  qeow20g6bc8qy: { belegNr: 3 }, // mathe: dieselbe Stelle, umgekehrt gefragt; Lösung 19 steht in der Zeile 18|19|20.
};
