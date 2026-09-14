// Nachrechnen, was in einer Aufgabe als Loesung und im Rechenweg steht.
//
// Warum es das gibt: Am 15.09.2026 nachts stand in Pauls "Marktbude am Hafen"
// die Aufgabe "Ein Marktbroetchen kostet 1,20 €. Was kosten 6 Broetchen?" mit
// der Loesung 7 - und im Rechenweg der Satz "120 ct = 1 €". Richtig sind
// 7,20 € und 1,20 €. pruefeSpiel prueft nur die FORM (Anzahl, Loesung in der
// Auswahl, Zahlentastatur); ob eine Zahl stimmt, prueft nur, wer nachrechnet.
// "Eine Bitte im Auftrag ist keine Pruefung" gilt hier genauso wie bei
// fachfremd(): Der Baumeister SOLL richtig rechnen - verlassen kann man sich
// darauf nicht.
//
// Vorsichtig gebaut, und zwar mit Absicht: Gemeldet wird nur, was sich
// EINDEUTIG nachrechnen laesst. Ein Fehlalarm wuerde hier eine richtige
// Aufgabe aus einem fertigen Spiel werfen - lieber eine Luecke als das.
// Gegen den ganzen Bestand vom 15.09.2026 (52 Spiele): ein Treffer, und der
// war echt.
//
// Ohne node-Anteil, weil es im Cloudflare-Worker laeuft. Der Aufruf von Hand
// steht in ../../pruefe-rechnung.mjs.

// ---------------------------------------------------------------- Werkzeug

const zahl = (s) => {
  if (s == null) return null;
  const t = String(s).trim().replace(/\s/g, "").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
};

// Die Loesung steht oft mit Einheit da ("850 g", "1 kg", "270 kg").
// Fuer den Vergleich zaehlt die Zahl davor.
const zahlAusLoesung = (s) => {
  const m = String(s == null ? "" : s).match(/-?\d+(?:[.,]\d+)?/);
  return m ? zahl(m[0]) : null;
};

const fastGleich = (a, b) => a != null && b != null && Math.abs(a - b) < 1e-6;

// ------------------------------------------------- 1. Einheiten-Gleichungen
//
// "120 ct = 1 €" faellt hier auf. Nur Paare, bei denen der Faktor feststeht.
const FAKTOR = [
  { klein: "ct",  gross: "€",  f: 100 },
  { klein: "g",   gross: "kg", f: 1000 },
  { klein: "kg",  gross: "t",  f: 1000 },
  { klein: "ml",  gross: "l",  f: 1000 },
  { klein: "cm",  gross: "m",  f: 100 },
  { klein: "mm",  gross: "cm", f: 10 },
  { klein: "m",   gross: "km", f: 1000 },
  { klein: "min", gross: "h",  f: 60 },
];

// Geht es hinter dem Ergebnis noch weiter ("2 m = 100 cm + 100 cm"), ist das
// keine Gleichung, die man einzeln nachrechnen kann.
function weiter(text, ab) {
  return /^\s*(?:[+\-−·*÷]\s*\d|(?:plus|minus|mal|und)\b)/i.test(text.slice(ab));
}

function einheitenPruefen(text, melden) {
  for (const { klein, gross, f } of FAKTOR) {
    // 120 ct = 1 €   und   1 € = 120 ct
    const e = klein.replace(/[€]/g, "\\$&");
    const g = gross.replace(/[€]/g, "\\$&");
    const hin = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${e}\\b\\s*=\\s*(\\d+(?:[.,]\\d+)?)\\s*${g}(?![a-zA-Z])`, "g");
    const her = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${g}(?![a-zA-Z])\\s*=\\s*(\\d+(?:[.,]\\d+)?)\\s*${e}\\b`, "g");
    let m;
    while ((m = hin.exec(text))) {
      const a = zahl(m[1]), b = zahl(m[2]);
      if (weiter(text, hin.lastIndex)) continue;
      if (a != null && b != null && !fastGleich(a, b * f))
        melden(`"${m[0]}" stimmt nicht: ${a} ${klein} sind ${a / f} ${gross}.`);
    }
    while ((m = her.exec(text))) {
      const a = zahl(m[1]), b = zahl(m[2]);
      if (weiter(text, her.lastIndex)) continue;
      if (a != null && b != null && !fastGleich(a * f, b))
        melden(`"${m[0]}" stimmt nicht: ${a} ${gross} sind ${a * f} ${klein}.`);
    }
  }
}

// -------------------------------------------------- 2. Ausgerechnete Zeilen
//
// "6 · 5 + 4 = 34" im Erklaertext. Nur reine Zahlenketten mit + − · : und
// nur, wenn wirklich ein Gleichheitszeichen mit Ergebnis dahinter steht.
// Der Doppelpunkt ist KEIN Geteiltzeichen. Im deutschen Fliesstext steht er
// als Satzzeichen ("Zerlege die 6 in 3 und 3: 7 + 3 = 10"), und genau so hat
// er beim ersten Lauf acht Fehlalarme erzeugt. Geteilt wird in den Spielen
// ohnehin fast nur in Worten ("verteilt auf") beschrieben.
const OPS = "[+\\-−·*÷–]";

function rechnen(ausdruck) {
  // Punkt vor Strich, links nach rechts. Nur die vier Grundrechenarten.
  const teile = ausdruck
    .replace(/−|–/g, "-")
    .replace(/·|×/g, "*")
    .replace(/÷/g, ":")
    .split(/(?<=[\d.])\s*([+\-*:])\s*(?=[\d.])/);
  if (teile.length < 3) return null;
  let werte = [], zeichen = [];
  for (let i = 0; i < teile.length; i++) {
    if (i % 2 === 0) {
      const z = zahl(teile[i]);
      if (z == null) return null;
      werte.push(z);
    } else zeichen.push(teile[i]);
  }
  // Punkt vor Strich
  for (let i = 0; i < zeichen.length; ) {
    if (zeichen[i] === "*" || zeichen[i] === ":") {
      const r = zeichen[i] === "*" ? werte[i] * werte[i + 1] : werte[i] / werte[i + 1];
      werte.splice(i, 2, r); zeichen.splice(i, 1);
    } else i++;
  }
  let erg = werte[0];
  for (let i = 0; i < zeichen.length; i++)
    erg = zeichen[i] === "+" ? erg + werte[i + 1] : erg - werte[i + 1];
  return erg;
}

function zeilenPruefen(text, melden) {
  // Nur Leerzeichen, KEIN Zeilenumbruch: "4 · 5 = 5 + 5 + 5 + 5\n= 20" ist
  // eine Rechnung ueber zwei Zeilen, nicht "5 + 5 + 5 = 20".
  const re = new RegExp(`(\\d+(?:[.,]\\d+)?(?:[ \t]*${OPS}[ \t]*\\d+(?:[.,]\\d+)?)+)[ \t]*=[ \t]*(\\d+(?:[.,]\\d+)?)`, "g");
  let m;
  while ((m = re.exec(text))) {
    // "12 · 8 = 10 · 8 plus 2 · 8" und "8 · 50 = 4 · 100": hinter dem
    // vermeintlichen Ergebnis geht die Rechnung weiter.
    if (weiter(text, re.lastIndex)) continue;
    const soll = rechnen(m[1]);
    const ist = zahl(m[2]);
    if (soll == null || ist == null) continue;
    if (!fastGleich(soll, ist))
      melden(`"${m[0].trim()}" stimmt nicht: ${m[1].trim()} ergibt ${runde(soll)}.`);
  }
}

const runde = (x) => Math.round(x * 1e6) / 1e6;

// ------------------------------------------------------ 3. "kostet P, was kosten N"
//
// Genau das Muster, an dem die Broetchen-Aufgabe gescheitert ist.
function preisMalAnzahl(frage, loesung, melden) {
  const m = frage.match(
    /kostet\s+(\d+(?:[.,]\d+)?)\s*(?:€|Euro)\s*\.?\s*(?:Was|Wie\s*viel)[^.?]*?(\d+)\s+\S+\s*\?/i);
  if (!m) return;
  const preis = zahl(m[1]), anzahl = zahl(m[2]);
  const soll = preis * anzahl;
  const ist = zahlAusLoesung(loesung);
  if (ist == null) return;
  // In Cent gefragt? Dann ist das Hundertfache richtig.
  const inCent = /\bcent\b|\bct\b/i.test(frage);
  const erlaubt = inCent ? soll * 100 : soll;
  if (!fastGleich(erlaubt, ist))
    melden(`${anzahl} Stueck zu ${preis} € sind ${runde(soll)} €` +
           (inCent ? ` = ${runde(soll * 100)} ct` : "") + `, dasteht ${ist}.`);
}

// ------------------------------------------------------- 4. "N ... je M ..."
function jeMal(frage, loesung, melden) {
  const m = frage.match(/(\d+)\s+\S+\s+mit\s+je\s+(\d+(?:[.,]\d+)?)\s*(\S*)/i)
        || frage.match(/(\d+)\s+\S+\s+zu\s+je\s+(\d+(?:[.,]\d+)?)\s*(\S*)/i);
  if (!m) return;
  const a = zahl(m[1]), b = zahl(m[2]);
  const ist = zahlAusLoesung(loesung);
  if (a == null || b == null || ist == null) return;
  // Nur melden, wenn die Frage wirklich nach der Gesamtzahl fragt.
  if (!/wie\s+(viele|viel|schwer|lang)/i.test(frage)) return;
  // Und nur, wenn danach nichts mehr passiert. "4 Reihen mit je 10 Schrauben
  // und nimmt danach 7 weg" ist eben nicht 4 · 10.
  if (/danach|dann|weg|übrig|uebrig|bleiben|dazu|zurück|zurueck|verschenkt|verteilt|verkauft|mehr als|weniger/i.test(frage)) return;
  // Mehr als zwei Saetze heisst: da passiert noch etwas drittes ("... Ein
  // Platz ist defekt. Wie viele funktionieren?"). Und zwei "je"-Gruppen sind
  // zwei Rechnungen, nicht eine.
  if (frage.split(/[.?!]\s+/).filter((t) => t.trim()).length > 2) return;
  if ((frage.match(/\bje\b/gi) || []).length > 1) return;
  if (!fastGleich(a * b, ist)) melden(`${a} · ${b} ist ${runde(a * b)}, dasteht ${ist}.`);
}

// --------------------------------------------- 5. Letzter Teilschritt = Loesung
function teilschritteEnde(a, melden) {
  const t = a.teilschritte;
  if (!Array.isArray(t) || !t.length) return;
  const letzte = zahlAusLoesung(t[t.length - 1].richtig);
  const ganz = zahlAusLoesung(a.richtig);
  if (letzte == null || ganz == null) return;
  // Zusammengesetzte Loesungen ("88 und 90", "5 Euro 70 Cent") sind mehr als
  // der letzte Teilschritt. Da sagt der Vergleich nichts.
  if ((String(a.richtig).match(/\d+/g) || []).length > 1) return;
  if (!fastGleich(letzte, ganz))
    melden(`Der letzte Teilschritt endet auf ${letzte}, die Loesung sagt ${ganz}.`);
}

// ---------------------------------------------------------------- Durchlauf

export function spielPruefen(spiel) {
  const funde = [];
  (spiel.aufgaben || []).forEach((a, i) => {
    const melden = (was) => funde.push({ nr: i + 1, frage: String(a.frage || "").slice(0, 90), was });
    const frage = String(a.frage || "");
    // Manche Aufgaben ZEIGEN mit Absicht eine falsche Rechnung: "Was ist bei
    // 246 · 3 = 638 schiefgegangen?" Die darf niemand "richtigstellen".
    if (/schiefgegangen|falsch gerechnet|Fehler|was ist passiert|stimmt (hier )?nicht|richtigstellen/i.test(frage)) return;
    const texte = [frage, String(a.erklaerung || ""), String(a.merke || "")]
      .concat((a.teilschritte || []).map((t) => String(t.frage || "") + " = " + String(t.richtig == null ? "" : t.richtig)));
    for (const t of texte) { einheitenPruefen(t, melden); zeilenPruefen(t, melden); }
    preisMalAnzahl(frage, a.richtig, melden);
    jeMal(frage, a.richtig, melden);
    teilschritteEnde(a, melden);
  });
  return funde;
}

// ------------------------------------------------------------- Nach aussen

// Alle Funde einer Aufgabe, als Saetze. Leer = nichts gefunden.
export function rechenfunde(a) {
  const funde = [];
  const melden = (was) => funde.push(was);
  const frage = String((a && a.frage) || "");
  // Manche Aufgaben ZEIGEN mit Absicht eine falsche Rechnung: "Was ist bei
  // 246 · 3 = 638 schiefgegangen?" Die darf niemand "richtigstellen".
  if (/schiefgegangen|falsch gerechnet|Fehler|was ist passiert|stimmt (hier )?nicht|richtigstellen/i.test(frage))
    return funde;
  const texte = [frage, String((a && a.erklaerung) || ""), String((a && a.merke) || "")]
    .concat(((a && a.teilschritte) || []).map(
      (t) => String(t.frage || "") + " = " + String(t.richtig == null ? "" : t.richtig)));
  for (const t of texte) { einheitenPruefen(t, melden); zeilenPruefen(t, melden); }
  preisMalAnzahl(frage, a && a.richtig, melden);
  jeMal(frage, a && a.richtig, melden);
  teilschritteEnde(a || {}, melden);
  return funde;
}

// Der erste Fund als Grund, sonst "". Dieselbe Form wie fachfremd().
export function rechenfehler(a) {
  const f = rechenfunde(a);
  return f.length ? f[0] : "";
}

// Ganzes Spiel: [{nr, frage, was}]
export function spielPruefen(spiel) {
  const funde = [];
  ((spiel && spiel.aufgaben) || []).forEach((a, i) => {
    for (const was of rechenfunde(a))
      funde.push({ nr: i + 1, frage: String((a && a.frage) || "").slice(0, 90), was });
  });
  return funde;
}
