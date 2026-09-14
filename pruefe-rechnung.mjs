// Rechnet nach, was in den gespeicherten Spielen als Loesung steht.
//
// Die Pruefung selbst steht in functions/api/_rechnung.js - dort, weil sie
// auch im Worker beim BAUEN laeuft und deshalb keinen node-Anteil haben darf.
// Hier ist nur der Aufruf von Hand und der Selbsttest.
//
// Warum es das gibt: Am 15.09.2026 stand in Pauls "Marktbude am Hafen" die
// Aufgabe "Ein Marktbroetchen kostet 1,20 €. Was kosten 6 Broetchen?" mit der
// Loesung 7, und im Rechenweg der Satz "120 ct = 1 €". pruefeSpiel prueft nur
// die FORM; ob eine Zahl stimmt, prueft nur, wer nachrechnet.
//
//   node lernwelt/pruefe-rechnung.mjs <ordner-mit-spielen-als-json> [...]
//   node lernwelt/pruefe-rechnung.mjs --selbsttest
//
// Rueckgabe 0 = nichts gefunden, 1 = es gibt Verdachtsfaelle.
// Laeuft als fester Teil von ./pruefe-bestand.sh mit.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spielPruefen } from "./functions/api/_rechnung.js";

function selbsttest() {
  const faelle = [
    // [Aufgabe, soll gemeldet werden?]
    [{ frage: "Ein Marktbroetchen kostet 1,20 €. Was kosten 6 Broetchen?", richtig: "7" }, true],
    [{ frage: "Ein Marktbroetchen kostet 1,20 €. Was kosten 6 Broetchen?", richtig: "7,20 €" }, false],
    [{ frage: "x", richtig: "1", erklaerung: "6 · 20 ct = 120 ct = 1 €" }, true],
    [{ frage: "x", richtig: "1", erklaerung: "120 ct = 1,20 €" }, false],
    [{ frage: "x", richtig: "34", erklaerung: "6 · 5 + 4 = 34" }, false],
    [{ frage: "x", richtig: "34", erklaerung: "6 · 5 + 4 = 54" }, true],
    [{ frage: "Kapitaen Nelli kauft 9 Netze mit je 8 Krabben. Wie viele Krabben sind das?", richtig: "72" }, false],
    [{ frage: "Die Station hebt 6 Kisten mit je 45 kg. Wie schwer ist die Ladung?", richtig: "270 kg" }, false],
    [{ frage: "Die Station hebt 6 Kisten mit je 45 kg. Wie schwer ist die Ladung?", richtig: "240 kg" }, true],
    [{ frage: "x", richtig: "72", teilschritte: [{ frage: "10 · 8", richtig: "80" }, { frage: "80 - 8", richtig: "72" }] }, false],
    [{ frage: "x", richtig: "72", teilschritte: [{ frage: "10 · 8", richtig: "80" }, { frage: "80 - 8", richtig: "70" }] }, true],
    [{ frage: "Wie viel Gramm sind 3 kg 250 g?", richtig: "3250", erklaerung: "3 kg = 3000 g" }, false],
    [{ frage: "x", richtig: "1", erklaerung: "1 kg = 100 g" }, true],
    // Deutsch darf nicht anschlagen
    [{ frage: "Ein Tor, viele ...?", richtig: "Tore" }, false],
    [{ frage: "Wie viele Silben hat das Wort Kleeblatt?", richtig: "2" }, false],
  ];
  let schlecht = 0;
  faelle.forEach(([a, soll], i) => {
    const f = spielPruefen({ aufgaben: [a] });
    const ist = f.length > 0;
    if (ist !== soll) {
      schlecht++;
      console.log(`  Fall ${i + 1}: erwartet ${soll ? "Fund" : "still"}, bekommen ${ist ? "Fund" : "still"}` +
                  (f.length ? "  -> " + f.map((x) => x.was).join(" | ") : ""));
    }
  });
  console.log(schlecht ? `${schlecht} von ${faelle.length} Faellen daneben.` : `Selbsttest sauber (${faelle.length} Faelle).`);
  return schlecht ? 1 : 0;
}

// ---------------------------------------------------------------- Aufruf

const args = process.argv.slice(2);
if (args[0] === "--selbsttest") process.exit(selbsttest());

if (!args.length) {
  console.log("Aufruf: node lernwelt/pruefe-rechnung.mjs <ordner> [...]   |   --selbsttest");
  process.exit(1);
}

let gesamt = 0, spiele = 0;
for (const ordner of args) {
  const dateien = statSync(ordner).isDirectory()
    ? readdirSync(ordner).filter((d) => d.endsWith(".json")).map((d) => join(ordner, d))
    : [ordner];
  for (const datei of dateien) {
    let roh;
    try { roh = JSON.parse(readFileSync(datei, "utf8")); } catch (e) { continue; }
    const spiel = roh.spiel || roh;
    if (!Array.isArray(spiel.aufgaben)) continue;
    spiele++;
    const funde = spielPruefen(spiel);
    if (!funde.length) continue;
    gesamt += funde.length;
    console.log(`\n${spiel.id || datei}  ${spiel.titel || ""}  (${spiel.fach || "?"})`);
    for (const f of funde) console.log(`   Aufgabe ${f.nr}: ${f.was}\n      ${f.frage}`);
  }
}
console.log(`\n${spiele} Spiele gelesen, ${gesamt} Verdachtsfaelle.`);
process.exit(gesamt ? 1 : 0);
