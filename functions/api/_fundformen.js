/* Belegte Zweitformen fuer Fundkarten (Schritt 3a, Denny 29.10.2026, nur Paul).

   "Jede Karte bekommt mehrere Formen mit wechselndem Wortlaut und Blickwinkel, Antwort
   dem Inhalt nach gleich. Formulierungen nur aus Pauls Blaettern, Heft, Vorlagen der
   Lehrerin und Proben, jede Form einzeln gegen die Quelle geprueft."

   Quelle der Zweitform ist Pauls Quiz-Ausgabe (ausgabeFuerPaul): Jede Frage darin hat
   die Belegpruefung (Kapitel 147) schon bestanden - Loesung, Ablenker und Merksatz nur aus
   Schulquellen. Erzeugt wird hier nichts. Eine Quizfrage gilt als Form einer Fundkarte nur,
   wenn (gemessen 29.10.2026, wegA.py, Stichprobe von Hand gelesen):
     - gleiches Blatt und gleiche Antwort (nach schluessel(), also derselbe Lernpunkt),
     - anderer Wortlaut als die Karte,
     - und sie nach demselben fragt: bei Zahlen stehen alle Zahlen der Kartenfrage (ohne die
       Antwort) auch in der Form; sonst teilen beide das Stichwort der Karte oder ein Wort,
       das auf dem Blatt in hoechstens zwei Karten vorkommt.
   Eine gleiche Antwort allein reicht nicht: "Verb" oder "abstrakt" ist auf einem
   Wortartenblatt die Antwort auf zehn verschiedene Fragen (erste Zaehlung: 391 Paare,
   davon viele falsch; geschaerft: 185 von 927 Karten). */

const STOPP = new Set(("welche welcher welches wie viel viele ist sind gehört gehoert wort wörter heißt heisst " +
  "wird werden wortart aufgabe ergebnis rechne nomen verb adjektiv richtig schreibt bedeutet passt fehlt " +
  "zahl kommt heraus konkret abstrakt oder einzahl mehrzahl").split(" "));
export const FORMEN_JE_KARTE = 3;

export function kartenSchluessel(antwort) {
  return String(antwort || "").toLowerCase().replace(/[^a-z0-9äöüß]+/g, "").slice(0, 40);
}
const norm = (s) => String(s || "").normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}_]+/gu, "");
const woerter = (s) => new Set((String(s || "").toLowerCase().match(/[a-zäöüß]{4,}/g) || []).filter((w) => !STOPP.has(w)));
const zahlen = (s) => new Set(String(s || "").replace(/\./g, "").match(/\d+/g) || []);

/* Passt die Quizfrage h als Form zur Fundkarte c? df: Wort -> Zahl der Karten des Blattes. */
export function formPasst(c, h, df) {
  if (norm(h.frage) === norm(c.frage)) return false;
  const a = String(c.richtig || "");
  if (/^[\d\s.,]+$/.test(a.trim())) {
    const ohne = [...zahlen(c.frage)].filter((z) => !zahlen(a).has(z));
    const inForm = zahlen(h.frage);
    return ohne.length > 0 && ohne.every((z) => inForm.has(z));
  }
  const sw = norm(c.stichwort);
  if (sw.length >= 3 && norm(c.frage).includes(sw) && norm(h.frage).includes(sw) && sw !== norm(a)) return true;
  const inAntwort = woerter(a), inForm = woerter(h.frage);
  for (const w of woerter(c.frage)) if (!inAntwort.has(w) && (df.get(w) || 0) <= 2 && inForm.has(w)) return true;
  return false;
}

/* fragen: Pauls Ausgabe; blattNach: {id: Eintrag mit karten}; punkte: quiz-punkte (nur Karten, die
   Paul schon hatte, brauchen eine Zweitform - neue kommen in ihrer ersten Form).
   Rueckgabe: {"<blatt>#k:<schluessel>": [{frage, richtig, falsch:[2], merke?}]} */
export function fundFormenFuer(fragen, blattNach, punkte) {
  const jeAntwort = new Map();
  for (const f of fragen || []) {
    const a = Array.isArray(f.antworten) ? f.antworten.map(String) : [];
    const ri = Number(f.richtig) || 0;
    if (!f.blatt || a.length < 3 || !a[ri]) continue;
    const k = f.blatt + "#k:" + kartenSchluessel(a[ri]);
    if (!jeAntwort.has(k)) jeAntwort.set(k, []);
    jeAntwort.get(k).push({ f, a, ri });
  }
  const raus = {};
  for (const b of Object.values(blattNach || {})) {
    if (!b || b.sichtbar === false || !Array.isArray(b.karten)) continue;
    const df = new Map();
    for (const c of b.karten) for (const w of woerter(c && c.frage)) df.set(w, (df.get(w) || 0) + 1);
    for (const c of b.karten) {
      if (!c || !c.frage || !c.richtig) continue;
      const key = b.id + "#k:" + kartenSchluessel(c.richtig);
      if (raus[key] || (punkte && !punkte[key])) continue;
      const formen = [], texte = new Set();
      for (const { f, a, ri } of jeAntwort.get(key) || []) {
        if (!formPasst(c, f, df) || texte.has(norm(f.frage))) continue;
        texte.add(norm(f.frage));
        formen.push({ frage: String(f.frage), richtig: a[ri], falsch: a.filter((x, i) => i !== ri).slice(0, 2),
          ...(f.merke ? { merke: String(f.merke) } : {}) });
        if (formen.length >= FORMEN_JE_KARTE) break;
      }
      if (formen.length) raus[key] = formen;
    }
  }
  return raus;
}
