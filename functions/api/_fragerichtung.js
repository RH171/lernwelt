/* Drei Fragerichtungen je Tatsache (19.10.2026).
 *
 * Denny per Klickfrage, Montag 19.10.2026 ~16:30 Uhr: "sind die Fragen hier
 * immer exakt die gleichen mit den gleichen Lösungen … dass Paul das nicht am
 * Ende nur stumpf auswendig lernt, sondern auch wiedergeben könnte unter einer
 * anderen Fragestellung". Gewählt: "Drei Fragerichtungen".
 *
 * Gemessen am selben Tag (quiz-vorrat:paul): 118 HSU-Fragen zu ~110
 * Tatsachen, nur 7 Tatsachen mit zwei oder mehr Fragen, und bei Mangel an
 * frischen Fragen kam eine gestellte Frage WORTGLEICH wieder.
 *
 * Deshalb:
 *   - Fragen derselben Tatsache tragen `tatsache` (Schlüssel) und `form`
 *     ("standard" | "umgekehrt" | "luecke" | "zuordnung").
 *   - Kommt eine Tatsache wieder, wird eine ANDERE Form gewählt als beim
 *     letzten Mal. Wortgleich nur, wenn es keine andere Form gibt.
 *   - Je Runde höchstens eine Frage je Tatsache.
 *   - Getippt wird nur ausnahmsweise (Dennys Entscheidung 19.10.2026,
 *     ~16:35 Uhr): "Grundsätzlich bleibt es beim Ankreuzen. Getippt wird nur
 *     bei einer Tatsache, die Paul schon zweimal richtig hatte, und dann
 *     höchstens 1–2 Mal je Runde: ein kurzes Wort." Bei einem Fehlversuch
 *     erscheinen die Antworten zum Ankreuzen als Hilfe (quiz/motor.js).
 *
 * Abwärtsverträglich: Alte Fragen ohne `tatsache` bekommen einen
 * abgeleiteten Schlüssel (Blatt + Zeilennummer, sonst Blatt + Zeilen-
 * Stichwort, sonst die Frage selbst). Eine alte Seite kennt `eingabe` nicht
 * und kreuzt einfach an.
 *
 * Alles Pure Funktionen, ohne Speicher - geprüft mit pruefe-fragerichtung.mjs.
 */

/* ---------------------------------------------------------------- *
 *  DIE SCHALTER. Hier und nur hier wird gedreht.                    *
 * ---------------------------------------------------------------- */
export const RICHTUNG = {
  /* false = alles wie vor dem 19.10.2026: eine gestellte Frage ist "gestellt"
     je Kennung, es wird nicht getauscht, nichts wird getippt. */
  an: true,

  /* Tippen statt Ankreuzen. false schaltet NUR das Tippen ab - die
     Fragerichtungen bleiben. */
  frei: {
    an: true,
    /* So oft muss die Tatsache schon richtig gewesen sein (erster Versuch,
       gezählt über alle ihre Formen in quiz-punkte). */
    abRichtig: 2,
    /* Höchstens so viele Tipp-Fragen je Runde. */
    jeRunde: 2,
    /* Ein kurzes Wort: so viele Wörter und Zeichen höchstens. */
    worte: 1,
    zeichen: { paul: 20, helena: 24, leon: 12 },
  },
};

export const FORMEN = ["standard", "umgekehrt", "luecke", "zuordnung"];

export function formVon(f) {
  const x = String((f && f.form) || "");
  return FORMEN.includes(x) ? x : "standard";
}

function norm(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

/* Der Schlüssel einer Tatsache. Mit `tatsache` an der Frage (neu gebaut oder
   nachgebaut) gilt der. Sonst abgeleitet:
     Blatt + Zeilennummer          "blatt#z:3"
     Blatt + Zeilen-Stichwort      "blatt#w:einwohner"  (nicht in Mathe, nicht "a)")
     die Frage selbst              "f:<id>"  -> verhält sich wie vorher
   ⚠️ In Mathe ist das Stichwort meist "a)", "c)" - zwei verschiedene
   Rechnungen wären sonst EINE Tatsache. */
export function tatsacheVon(f) {
  if (!f) return "";
  const blatt = String(f.blatt || "");
  if (f.tatsache) return (blatt ? blatt + "#t:" : "t:") + String(f.tatsache);
  if (blatt) {
    const n = Number(f.belegNr);
    if (Number.isFinite(n) && n >= 1) return blatt + "#z:" + Math.floor(n);
    const w = norm(f.zeile);
    const mathe = /^mathe/i.test(String(f.fach || ""));
    if (!mathe && w.length >= 3 && !/^[a-z0-9]{1,2}$/.test(w)) return blatt + "#w:" + w;
  }
  return "f:" + String(f.id || "");
}

/* Was das Kind schon hatte, je Tatsache - aus quiz-gestellt (Kennungen in der
   Reihenfolge der Antworten). Kein neuer Speicher, kein Schreibvorgang. */
export function begegnungen(gestellt, nachId) {
  const raus = new Map();
  for (const id of gestellt || []) {
    const f = nachId.get(String(id));
    if (!f) continue;
    const t = tatsacheVon(f);
    if (!t) continue;
    const b = raus.get(t) || { n: 0, zahl: {}, letzteId: "", letzteForm: "" };
    b.n++;
    b.zahl[f.id] = (b.zahl[f.id] || 0) + 1;
    b.letzteId = String(f.id);
    b.letzteForm = formVon(f);
    raus.set(t, b);
  }
  return raus;
}

export function nachTatsache(fragen) {
  const m = new Map();
  for (const f of fragen || []) {
    const t = tatsacheVon(f);
    if (!t) continue;
    if (!m.has(t)) m.set(t, []);
    m.get(t).push(f);
  }
  return m;
}

/* Je Tatsache EINE Frage: die zuletzt gestellte, sonst eine schon gestellte,
   sonst die erste. Für die Fälligkeit zählt der Lernpunkt der zuletzt
   gestellten Form - die ist am frischesten. */
export function vertreter(fragen, beg) {
  const raus = [];
  for (const [t, liste] of nachTatsache(fragen)) {
    const b = beg && beg.get(t);
    let v = null;
    if (b) v = liste.find((f) => String(f.id) === b.letzteId) || liste.find((f) => b.zahl[f.id]);
    raus.push(v || liste[0]);
  }
  return raus;
}

/* Wie oft eine Tatsache schon richtig war: Summe von `r` über die Lernpunkte
   ALLER ihrer Formen (quiz-punkte, r = richtig beim ersten Versuch, nach
   einem Fehler einen Schritt zurück). */
export function richtigZahl(geschwister, punkte, schluessel) {
  let n = 0;
  const gesehen = new Set();
  for (const g of geschwister || []) {
    const s = schluessel(g);
    if (!s || gesehen.has(s)) continue;
    gesehen.add(s);
    const p = punkte && punkte[s];
    if (p) n += Number(p.r) || 0;
  }
  return n;
}

/* Taugt die Frage zum Tippen? Ein kurzes Wort, genau eine richtige Antwort,
   und keine Frage, die nur MIT den Antworten eindeutig ist ("Welcher DIESER
   Orte …", "Welcher Satz ist richtig geschrieben?"). Das Modell kann es mit
   `frei: false` ausschließen. */
export function tippbar(f, kind, e) {
  const ein = (e || RICHTUNG).frei;
  if (!f || f.frei === false) return false;
  const a = Array.isArray(f.antworten) ? f.antworten : [];
  const richtig = String(a[Number(f.richtig) || 0] == null ? "" : a[Number(f.richtig) || 0]).trim();
  if (!richtig) return false;
  const worte = richtig.split(/\s+/).filter(Boolean).length;
  const max = (ein.zeichen && ein.zeichen[kind]) || 20;
  if (worte > ein.worte || richtig.length > max) return false;
  const frage = String(f.frage || "");
  if (/\b(dieser|diese|dieses|diesen|diesem)\b/i.test(frage)) return false;
  if (/richtig geschrieben|welche antwort|welche aussage|welcher satz|stimmt\b/i.test(frage)) return false;
  return true;
}

/* DIE AUSWAHL je Runde.
 *
 *   offen     die Fragen, die die Wiedervorlage ausgesucht hat (je Tatsache
 *             schon EINE, siehe vertreter())
 *   alle      alle Fragen der Auswahl (Fach/Blatt) - daraus kommen die
 *             anderen Formen
 *   beg       begegnungen()
 *   punkte    quiz-punkte, schluessel = punktSchluessel
 *
 * Gibt die Liste zurück, je Tatsache höchstens eine Frage, schon gesehene
 * Tatsachen in einer anderen Form, und höchstens `jeRunde` mit
 * `eingabe: "frei"`. Ändert die übergebenen Fragen nicht. */
export function richtungAnwenden(offen, alle, beg, opt) {
  const o = opt || {};
  const ein = o.einstellungen || RICHTUNG;
  if (!ein.an) return (offen || []).slice();
  const geschwister = nachTatsache(alle);
  const genutzt = new Set();
  const raus = [];
  let frei = 0;
  for (const f of offen || []) {
    const t = tatsacheVon(f);
    if (genutzt.has(t)) continue;
    genutzt.add(t);
    const b = beg && beg.get(t);
    if (!b) { raus.push(f); continue; }
    const liste = geschwister.get(t) || [f];
    // Eine andere Form als beim letzten Mal - und nie die zuletzt gestellte Frage.
    const andere = liste.filter((g) => formVon(g) !== b.letzteForm && String(g.id) !== b.letzteId);
    const pool = andere.length ? andere : liste.filter((g) => String(g.id) !== b.letzteId);
    let wahl = f;
    if (pool.length) {
      wahl = pool.slice().sort((x, y) => ((b.zahl[x.id] || 0) - (b.zahl[y.id] || 0)) ||
        (FORMEN.indexOf(formVon(x)) - FORMEN.indexOf(formVon(y))))[0];
    }
    const extra = { begegnung: b.n + 1 };
    if (ein.frei && ein.frei.an && frei < ein.frei.jeRunde && tippbar(wahl, o.kind, ein) &&
        o.punkte && o.schluessel &&
        richtigZahl(liste, o.punkte, o.schluessel) >= ein.frei.abRichtig) {
      extra.eingabe = "frei";
      frei++;
    }
    raus.push({ ...wahl, ...extra });
  }
  return raus;
}

/* Eine Frage je Tatsache, in der gegebenen Reihenfolge (für frische Fragen). */
export function eineJeTatsache(fragen) {
  const g = new Set();
  return (fragen || []).filter((f) => {
    const t = tatsacheVon(f);
    if (g.has(t)) return false;
    g.add(t);
    return true;
  });
}
