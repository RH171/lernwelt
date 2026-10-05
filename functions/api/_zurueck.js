/* Zurueckbekommene Arbeiten - Speicher.
 *
 * Helena am 05.10.2026: "Wir haben den BET zurueckbekommen. Wo soll ich das
 * hinschicken?" Es gab dafuer keinen Ort. Ihre Ablage kennt Heft, Uebung,
 * Schulbuch, Arbeitsheft und Merkheft - alles Stoff, der noch VOR ihr liegt.
 * Eine korrigierte Arbeit mit Punkten und Note ist etwas anderes: Sie ist
 * fertig, sie traegt eine Bewertung, und die Bewertung gehoert zu den Noten.
 *
 * Deshalb ein eigener, kleiner Weg - und bewusst NICHT eine sechste Art in
 * der Ablage: Die haengt an der Quiz-Strecke aller drei Kinder (quiz/motor.js,
 * functions/api/quiz.js), und ein Fehler dort trifft alle.
 *
 * WAS HIER NICHT PASSIERT: Es entsteht KEINE Note.
 * Noten schreibt nur der Elternbereich (functions/api/noten.js, Dennys
 * Entscheidung vom 20.09.2026). Was das Kind hier eintraegt, ist ein
 * VORSCHLAG: Fach, Anlass, Punkte, Note vom Blatt. Erst Dennys Klick im
 * Elternbereich legt daraus eine Note an.
 *
 * Sparsam gespeichert wie die Ablage: EIN Schluessel je Kind fuer die Liste,
 * dazu je Seite ein Bild (KV hat 1000 Schreibvorgaenge am Tag).
 */

export const KINDER = ["paul", "leon", "helena"];

const LISTE = (kind) => "zurueck:" + kind;
const BILD  = (id, nr) => "zurueckbild:" + id + ":" + nr;

export const MAX_EINTRAEGE = 200;
export const MAX_SEITEN = 4;

/* Welche Kinder eine Note eintragen koennen. Leon (2. Klasse) bekommt erst im
   zweiten Halbjahr Noten (RECHNUNG in _noten.js) - bei ihm bleibt es beim
   Foto und "was es war". Ein Notenfeld, das nie etwas enthaelt, ist nur eine
   Frage zu viel. */
export const MIT_NOTE = { paul: true, helena: true, leon: false };

export function neueId() {
  const z = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (const b of crypto.getRandomValues(new Uint8Array(8))) s += z[b % z.length];
  return s;
}

export function heuteBerlin() {
  return new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 10);
}

/* Einen Eintrag aufraeumen, bevor er in den Speicher geht. Was hier nicht
   durchkommt, steht spaeter auch nicht im Elternbereich. */
export function eintragPruefen(roh, kind) {
  const e = {};
  e.fach = String(roh.fach || "").toLowerCase().replace(/[^a-zäöüß]/g, "").slice(0, 20);
  if (!e.fach) return { fehler: "Zu welchem Fach gehört die Arbeit?" };

  e.anlass = String(roh.anlass || "").slice(0, 120).trim();
  if (!e.anlass) return { fehler: "Was war das denn für eine Arbeit?" };

  const d = String(roh.datum || "").slice(0, 10);
  e.datum = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : heuteBerlin();

  /* Punkte: zwei Zahlen, erreicht und moeglich. Gerechnet wird nur, wenn
     BEIDE da sind - aus "18" allein laesst sich keine Note machen, und
     geraten wird hier nichts. */
  const zahl = (x) => {
    if (x === undefined || x === null || String(x).trim() === "") return undefined;
    const w = Number(String(x).replace(",", "."));
    return Number.isFinite(w) && w >= 0 && w <= 1000 ? Math.round(w * 2) / 2 : undefined;
  };
  e.punkte = zahl(roh.punkte);
  e.maxpunkte = zahl(roh.maxpunkte);
  if (e.punkte !== undefined && e.maxpunkte !== undefined && e.punkte > e.maxpunkte) {
    return { fehler: "Mehr Punkte als möglich? Schau noch mal auf dein Blatt." };
  }

  if (MIT_NOTE[kind] && roh.note !== undefined && roh.note !== null && String(roh.note).trim() !== "") {
    const w = Number(String(roh.note).replace(",", "."));
    if (!Number.isFinite(w) || w < 1 || w > 6) return { fehler: "Eine Note geht von 1 bis 6." };
    e.note = Math.round(w * 2) / 2;
  }

  e.notiz = String(roh.notiz || "").slice(0, 400).trim() || undefined;
  e.id = String(roh.id || "").replace(/[^a-z0-9]/gi, "").slice(0, 12) || neueId();
  e.angelegt = new Date().toISOString();
  e.seiten = 0;
  return { eintrag: e };
}

export async function listeLesen(env, kind) {
  try {
    const roh = await env.PAUL_KV.get(LISTE(kind));
    const d = roh ? JSON.parse(roh) : null;
    return Array.isArray(d && d.liste) ? d.liste : [];
  } catch (e) {
    /* Derselbe Grundsatz wie beim Anwesenheitsband: ein Speicherfehler ist
       KEINE leere Liste. Der Aufrufer bekommt null und sagt es weiter. */
    return null;
  }
}

async function listeSchreiben(env, kind, liste) {
  await env.PAUL_KV.put(LISTE(kind), JSON.stringify({ liste: liste.slice(0, MAX_EINTRAEGE) }));
}

/* Ablegen: erst die Bilder, dann die Liste. Bricht es nach dem ersten Bild ab,
   liegt ein Bild ohne Eintrag herum - das kostet nichts. Umgekehrt stuende ein
   Eintrag da, dessen Seiten fehlen. */
export async function ablegen(env, kind, eintrag, seiten) {
  const bilder = (seiten || []).slice(0, MAX_SEITEN).filter(Boolean);
  for (let i = 0; i < bilder.length; i++) {
    await env.PAUL_KV.put(BILD(eintrag.id, i), bilder[i]);   // keine Ablaufzeit
  }
  eintrag.seiten = bilder.length;

  const liste = await listeLesen(env, kind);
  if (liste === null) return { ok: false, fehler: "Der Speicher antwortet gerade nicht. Nichts gespeichert." };

  const i = liste.findIndex((x) => x.id === eintrag.id);
  if (i >= 0) liste[i] = { ...liste[i], ...eintrag };
  else liste.unshift(eintrag);

  try { await listeSchreiben(env, kind, liste); }
  catch (e) { return { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Nichts gespeichert." }; }
  return { ok: true, eintrag, liste };
}

export async function bildLesen(env, id, nr) {
  const n = Math.max(0, Math.min(MAX_SEITEN - 1, Number(nr) || 0));
  try { return await env.PAUL_KV.get(BILD(String(id).replace(/[^a-z0-9]/gi, ""), n)); }
  catch (e) { return null; }
}

/* Aus der Liste nehmen. Das BILD bleibt liegen - dieselbe Regel wie in der
   Ablage (Denny, 22.09.2026: "sodass es nicht geloescht werden kann"). */
export async function wegnehmen(env, kind, id) {
  const liste = await listeLesen(env, kind);
  if (liste === null) return { ok: false, fehler: "Der Speicher antwortet gerade nicht." };
  const rest = liste.filter((x) => x.id !== id);
  if (rest.length === liste.length) return { ok: false, fehler: "Das gibt es nicht (mehr)." };
  try { await listeSchreiben(env, kind, rest); }
  catch (e) { return { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Nichts gelöscht." }; }
  return { ok: true, liste: rest };
}

/* Haken dran: Denny hat daraus eine Note gemacht. Damit derselbe Ruecklaeufer
   nicht zweimal im Notenbuch landet. */
export async function uebernommen(env, kind, id, noteId) {
  const liste = await listeLesen(env, kind);
  if (liste === null) return { ok: false, fehler: "Der Speicher antwortet gerade nicht." };
  const i = liste.findIndex((x) => x.id === id);
  if (i < 0) return { ok: false, fehler: "Das gibt es nicht (mehr)." };
  liste[i].uebernommen = new Date().toISOString();
  if (noteId) liste[i].noteId = String(noteId).replace(/[^a-z0-9]/gi, "").slice(0, 12);
  try { await listeSchreiben(env, kind, liste); }
  catch (e) { return { ok: false, fehler: "Der Speicher nimmt gerade nichts an." }; }
  return { ok: true, liste };
}
