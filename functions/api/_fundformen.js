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
export function fundFormenFuer(fragen, blattNach, punkte, opus) {
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
      /* Opus-Formen (Dennys Option 2, 29.10.2026): nur dort, wo Pauls Quiz keine Form hergibt */
      if (!formen.length && opus && Array.isArray(opus[key])) for (const o of opus[key]) {
        if (formen.length >= FORMEN_JE_KARTE || !o.frage || texte.has(norm(o.frage))) continue;
        if (kartenSchluessel(o.richtig) !== kartenSchluessel(c.richtig)) continue;
        texte.add(norm(o.frage));
        formen.push({ frage: String(o.frage), richtig: String(o.richtig), falsch: (o.falsch || []).slice(0, 2).map(String),
          ...(o.merke ? { merke: String(o.merke) } : {}) });
      }
      if (formen.length) raus[key] = formen;
    }
  }
  return raus;
}

/* Opus-Formen der Quiz-Tatsachen (Schritt 3a, Option 2): nur fuer Tatsachen, die Paul im Vorrat
   hat (Blatt sichtbar), als Pseudo-Quizfragen derselben tatsache fuer quizWacklerListe. */
export function opusAlsQuizForm(fragen, opus) {
  const raus = [], schon = new Set();
  if (!opus) return raus;
  for (const f of fragen || []) {
    if (!f || !f.tatsache || !f.blatt) continue;
    const key = f.blatt + "#t:" + f.tatsache;
    if (schon.has(key) || !Array.isArray(opus[key])) continue;
    schon.add(key);
    opus[key].forEach((o, i) => {
      if (!o.frage || !o.richtig || !Array.isArray(o.falsch) || o.falsch.length < 2) return;
      raus.push({ id: "opus:" + key + ":" + i, blatt: f.blatt, tatsache: f.tatsache, fach: f.fach,
        frage: String(o.frage), antworten: [String(o.richtig), ...o.falsch.slice(0, 2).map(String)], richtig: 0,
        ...(o.merke ? { merke: String(o.merke) } : {}) });
    });
  }
  return raus;
}

/* Umgekehrt (Schritt 3a): Quiz-Tatsachen mit nur EINER Form bekommen die passende Fundkarte
   desselben Blattes als zweite Form - gleiche Antwort und dieselbe passt-Regel wie oben. Die
   Fundkarte ist schon belegt (vom Blatt gelesen, Kapitel 147). Gezaehlt 29.10.2026: 11 von 42
   Tatsachen mit nur einer Form (Mathe 8, Deutsch 2, HSU 1). Rueckgabe: Pseudo-Quizfragen mit
   derselben tatsache, die quizWacklerListe wie jede andere Form waehlen kann. */
export function karteAlsQuizForm(fragen, blattNach) {
  const norm2 = (s) => String(s || "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const jeT = new Map();
  for (const f of fragen || []) {
    if (!f || !f.tatsache || !f.blatt) continue;
    const t = f.blatt + "#" + f.tatsache;
    if (!jeT.has(t)) jeT.set(t, []);
    jeT.get(t).push(f);
  }
  const raus = [];
  for (const liste of jeT.values()) {
    if (new Set(liste.map((x) => norm2(x.frage))).size >= 2) continue;
    const f = liste[0], b = blattNach && blattNach[f.blatt];
    const a = Array.isArray(f.antworten) ? f.antworten.map(String) : [];
    const ri = Number(f.richtig) || 0;
    if (!b || b.sichtbar === false || !Array.isArray(b.karten) || !a[ri]) continue;
    const df = new Map();
    for (const c of b.karten) for (const w of woerter(c && c.frage)) df.set(w, (df.get(w) || 0) + 1);
    const k = kartenSchluessel(a[ri]);
    const c = b.karten.find((c) => c && c.frage && kartenSchluessel(c.richtig) === k
      && Array.isArray(c.falsch) && c.falsch.length >= 2
      && formPasst({ frage: f.frage, richtig: a[ri] }, { frage: c.frage }, df));
    if (!c) continue;
    raus.push({ id: "karte:" + f.id, blatt: f.blatt, tatsache: f.tatsache, fach: f.fach,
      frage: String(c.frage), antworten: [String(c.richtig), ...c.falsch.slice(0, 2).map(String)], richtig: 0,
      ...(c.merke ? { merke: String(c.merke) } : {}) });
  }
  return raus;
}
