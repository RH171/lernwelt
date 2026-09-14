// Prueft, dass kein Rechnen mehr in einem Deutsch- oder HSU-Spiel fuer Leon
// landet - und dass echte Deutsch- und HSU-Aufgaben dabei stehenbleiben.
//
// Anlass: Leons Spiel psu4ydv39g ("Verben im Satz finden") enthielt vier
// Rechenaufgaben, darunter "Leon haelt 6 Baelle, Theo haelt 4 Baelle. Wie
// viele sind das zusammen?". Regel D11 im Bauauftrag verbietet das seit dem
// 14.09.2026 - eine Bitte im Auftrag ist aber keine Pruefung.
//
//   node pruefe-fachfremd.mjs

import { fachfremd, fachfremdeEntfernen, pruefeSpiel }
  from "./functions/api/spiel-bauen.js";

let fehler = 0;
const pruefe = (name, bed) => { console.log((bed ? "  ok   " : "  FEHL ") + name); if (!bed) fehler++; };

const auf = (o) => Object.assign({
  art: "wahl", frage: "Welches Wort ist das Tätigkeitswort? Leon hält den Ball.",
  antworten: ["hält", "Leon", "den", "Ball"], diagnosen: [], weg: "", teilschritte: [],
  richtig: "hält", erklaerung: "Was tut Leon?\nEr hält.", merke: "", bild: "",
  merkmal: "praedikat finden",
}, o);

const spiel = (fach, aufgaben) => ({
  titel: "Wörter-Jagd im Ronhof", fach, lernbereich: "D2", thema: "Verben",
  naechstes_thema: "", welt: "fussball", spielart: "quiz", begruessung: "Los!",
  aufgaben,
});

console.log("Was in einem Deutsch-Spiel nichts zu suchen hat");
{
  const d = spiel("deutsch", []);
  pruefe("Plus-Aufgabe mit Baellen",
    !!fachfremd(auf({ art: "eingabe", frage: "Leon hält 6 Bälle, Theo hält 4 Bälle. Wie viele sind das zusammen?",
                      antworten: [], richtig: "10", merkmal: "zusammenzaehlen bis 20" }), d, "leon"));
  pruefe("Schrittkette (D1 verbietet sie fuer Leseanfaenger)",
    !!fachfremd(auf({ art: "teilschritte", teilschritte: [{ frage: "Und 3 + 5?", richtig: "8" }],
                      richtig: "8", merkmal: "praedikat finden" }), d, "leon"));
  pruefe("Sterne abzaehlen",
    !!fachfremd(auf({ art: "eingabe", frage: "Wie viele Sterne siehst du?", antworten: [],
                      richtig: "7", merkmal: "mengen zaehlen" }), d, "leon"));
  pruefe("Verdoppeln",
    !!fachfremd(auf({ frage: "Xaver schießt 4 Mal. Helena doppelt so oft. Wie oft?",
                      richtig: "8", merkmal: "verdoppeln" }), d, "leon"));
  pruefe("eine Rechnung mitten in der Frage",
    !!fachfremd(auf({ frage: "Wie viel ist 3 + 5?", richtig: "8", merkmal: "praedikat finden" }), d, "leon"));
}

console.log("Was stehenbleiben muss - das ist Deutsch, auch wenn gezaehlt wird");
{
  const d = spiel("deutsch", []);
  pruefe("Silben zaehlen",
    !fachfremd(auf({ art: "eingabe", frage: "Wie viele Silben hat „Elfmeter“?", antworten: [],
                     richtig: "3", merkmal: "silben zaehlen" }), d, "leon"));
  pruefe("Buchstaben zaehlen",
    !fachfremd(auf({ art: "eingabe", frage: "Wie viele Buchstaben hat „Trikot“?", antworten: [],
                     richtig: "6", merkmal: "buchstaben zaehlen" }), d, "leon"));
  pruefe("Nomen im Satz zaehlen",
    !fachfremd(auf({ art: "eingabe", frage: "Wie viele Nomen stehen im Satz: Leon hält den Ball im Tor.",
                     antworten: [], richtig: "3", merkmal: "nomen erkennen" }), d, "leon"));
  pruefe("Praedikat finden",
    !fachfremd(auf({}), d, "leon"));
}

console.log("HSU zaehlt mit, Mathe bleibt unangetastet");
{
  pruefe("vier Jahreszeiten sind HSU",
    !fachfremd(auf({ art: "eingabe", frage: "Wie viele Monate hat ein Jahr?", antworten: [],
                     richtig: "12", merkmal: "monate reihenfolge" }), spiel("hsu", []), "leon"));
  pruefe("Rueckgeld gehoert nicht in HSU",
    !!fachfremd(auf({ frage: "Wie viel bekommst du zurück?", richtig: "3", merkmal: "rueckgeld" }),
                spiel("hsu", []), "leon"));
  pruefe("im Mathe-Spiel ist dasselbe voellig in Ordnung",
    !fachfremd(auf({ art: "teilschritte", frage: "Leon hält 6 Bälle, Theo 4. Zusammen?",
                     teilschritte: [{ frage: "6 + 4?", richtig: "10" }],
                     richtig: "10", merkmal: "zusammenzaehlen bis 20" }), spiel("mathe", []), "leon"));
  pruefe("bei Paul greift die Regel nicht - dort darf Deutsch Schritte haben",
    !fachfremd(auf({ art: "teilschritte", teilschritte: [{ frage: "Wer oder was?", richtig: "2" }],
                     richtig: "2", merkmal: "satzglieder" }), spiel("deutsch", []), "paul"));
}

console.log("Aus dem Spiel nehmen statt das Spiel wegwerfen");
{
  const gut = () => auf({});
  const schlecht = auf({ art: "eingabe", frage: "Leon hält 6, Theo 4. Zusammen?", antworten: [],
                         richtig: "10", merkmal: "zusammenzaehlen bis 20" });
  const s = spiel("deutsch", [gut(), gut(), schlecht, gut(), gut(), gut()]);
  const maengel = pruefeSpiel(s, "leon");
  pruefe("pruefeSpiel meldet es als fachfremd",
    maengel.length === 1 && maengel[0].startsWith("fachfremd: "));
  const raus = fachfremdeEntfernen(s, "leon");
  pruefe("genau eine Aufgabe fliegt raus", raus.length === 1 && s.aufgaben.length === 5);
  pruefe("danach ist das Spiel sauber", pruefeSpiel(s, "leon").length === 0);

  // Bleiben zu wenige uebrig, muss es weiter ein Mangel sein - dann ist ein
  // ehrlicher Fehler besser als ein Dreiviertel-Spiel.
  const duenn = spiel("deutsch", [gut(), gut(), schlecht, schlecht]);
  fachfremdeEntfernen(duenn, "leon");
  pruefe("zu duenn geworden bleibt ein Mangel", pruefeSpiel(duenn, "leon").length > 0);
}

console.log(fehler ? `\n${fehler} Prüfung(en) fehlgeschlagen.` : "\nAlles sauber.");
process.exit(fehler ? 1 : 0);
