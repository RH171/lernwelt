/* Kreise fuellen in "Deine Woche" (Denny, 29.09.2026).
 *
 * Jeder Punkt im Tagebuch ist eine beantwortete Aufgabe in lernstand:<kind>.
 * Ein leerer Kreis (erst nachgeschaut) wird hier seiner Frage zugeordnet:
 *   Quiz:        merkmal + richtige Antwort  -> Frage im Vorrat
 *   Suchkarte:   Blatttitel + richtige Antwort -> Karte im Heft
 * Gemessen an Pauls echten Runden vom 28./29.09.2026: 27 von 29 leeren
 * Kreisen lassen sich so zuordnen. Die zwei anderen stehen nicht mehr im
 * Vorrat - sie bleiben leer und werden nicht angeboten.
 *
 * Geschafft wird ein Kreis, wenn Paul die Frage beim Nachholen beim ERSTEN
 * Tipp richtig hat. Gemerkt wird das als Menge von Punkt-Kennungen in EINEM
 * Schluessel (ein Schreibvorgang je Runde). Die Kennung ist Zeit der Runde +
 * Nummer der Aufgabe darin - sie aendert sich nie.
 *
 * Denny, 29.09.2026: "Gedacht war, Paul klickt auf ein Datum, wo noch nicht
 * alles gefuellt ist, und bekommt dann die Moeglichkeit, die noch zu
 * fuellenden zu fuellen. Es wird ihm auch gesagt, wie viele es sind." */

export const GEFUELLT = (kind) => "kreise-gefuellt:" + kind;
const GEFUELLT_MAX = 3000;

export function punktId(zeit, i) { return String(zeit || "") + "#" + i; }

function norm(s) { return String(s == null ? "" : s).toLowerCase().trim(); }

/* Nachschlagetabellen aus Vorrat und Heft. */
export function tabellen(fragen, eintraege) {
  const quiz = new Map(), fund = new Map(), titel = {};
  for (const e of eintraege || []) {
    if (!e || !e.id || e.sichtbar === false) continue;
    titel[e.id] = e.titel || "";
    for (const k of e.karten || []) {
      if (!k || !k.frage || !k.richtig || !Array.isArray(k.falsch) || k.falsch.length !== 2) continue;
      const key = norm(e.titel).slice(0, 40) + "|" + String(k.richtig).slice(0, 30);
      if (!fund.has(key)) fund.set(key, Object.assign({}, k, { blatt: e.id, blattTitel: e.titel || "" }));
    }
  }
  for (const f of fragen || []) {
    const a = Array.isArray(f && f.antworten) ? f.antworten.map(String) : [];
    const ri = Number(f && f.richtig) || 0;
    if (a.length < 3 || !a[ri] || !f.frage) continue;
    if (f.blatt && !(f.blatt in titel)) continue;          // ausgeblendetes Blatt
    const key = norm(f.merkmal).slice(0, 40) + "|" + a[ri].slice(0, 30);
    if (quiz.has(key)) continue;
    quiz.set(key, {
      frage: String(f.frage), richtig: a[ri], falsch: a.filter((x, i) => i !== ri).slice(0, 2),
      merke: String(f.merke || f.tipp || ""), stichwort: "Aus dem Quiz",
      blatt: f.blatt || "", blattTitel: f.blatt ? titel[f.blatt] : "",
      quiz: { belegNr: f.belegNr || 0, frageId: String(f.id || "") },
    });
  }
  return { quiz, fund };
}

/* Die offenen Kreise je Tag: { datum: [{ ids:[...], karte }] }.
   `tagVon(zeit)` gibt den deutschen Tag, `tage` die erlaubten Tage. */
export function offeneKreise(liste, tab, gefuellt, tagVon, tage, schonGelb) {
  const raus = {};
  const erlaubt = new Set(tage || []);
  const voll = gefuellt instanceof Set ? gefuellt : new Set(gefuellt || []);
  for (const r of liste || []) {
    if (!r || r.nurBesuch || r.zeitart === "bauen") continue;
    const tag = tagVon(r.zeit);
    if (!erlaubt.has(tag)) continue;
    const jeKarte = (raus[tag] = raus[tag] || new Map());
    (r.aufgaben || []).forEach((a, i) => {
      if (!a || a.stimmt || a.art === "besuch" || a.art === "bauen") return;
      const id = punktId(r.zeit, i);
      if (voll.has(id) || (schonGelb && schonGelb(a, r))) return;
      const key = norm(a.merkmal).slice(0, 40) + "|" + String(a.richtig || "").slice(0, 30);
      const karte = (tab.quiz.get(key) || tab.fund.get(key));
      if (!karte) return;
      const k = jeKarte.get(key) || { ids: [], karte };
      k.ids.push(id);
      jeKarte.set(key, k);
    });
  }
  const fertig = {};
  for (const t of Object.keys(raus)) fertig[t] = [...raus[t].values()];
  return fertig;
}

export async function gefuelltLesen(env, kind) {
  try {
    const roh = await env.PAUL_KV.get(GEFUELLT(kind));
    const d = roh ? JSON.parse(roh) : [];
    return new Set(Array.isArray(d) ? d : []);
  } catch (e) { return new Set(); }
}

/* Schreibt nur, wenn wirklich etwas dazukommt. */
export async function gefuelltMerken(env, kind, ids) {
  const neu = (ids || []).map((x) => String(x).slice(0, 40)).filter(Boolean);
  if (!neu.length) return false;
  const alt = await gefuelltLesen(env, kind);
  const vorher = alt.size;
  neu.forEach((x) => alt.add(x));
  if (alt.size === vorher) return false;
  const liste = [...alt].slice(-GEFUELLT_MAX);
  try { await env.PAUL_KV.put(GEFUELLT(kind), JSON.stringify(liste)); return true; }
  catch (e) { return false; }
}
