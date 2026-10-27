/* Quiz wartet auf Klärung (27.10.2026, Dennys Entscheidung, Kapitel 147).
 *
 * Steht an einer Stelle seines Blattes ein bestätigter Pinnwand-Unterschied
 * (📌: „In deinem Heft steht etwas anderes als auf dem Blatt deiner
 * Lehrerin“), fragt das Quiz diese Stelle erst wieder ab, wenn Paul sie
 * geklärt hat: „Verbessert ✓“ oder „Stimmt doch so“. Vorher würde das Quiz
 * eine Antwort üben, von der noch niemand weiß, ob sie stimmt.
 *
 * Nur lesend: kein Schreibvorgang, die Frage bleibt im Vorrat und kommt nach
 * der Klärung von selbst zurück. Ohne Vorlagen (lehrer = null) oder ohne
 * Pinnwand-Stelle ändert sich nichts - abwärtsverträglich.
 *
 * Zuordnung Frage -> Stelle (gleiches Blatt, und eins davon):
 *   a) die Frage gehört zur selben Vorlagenzeile (zeilenZurFrage, nr),
 *   b) ihre Belegzeile (belegNr) ist Pauls Zeile der Stelle,
 *   c) ihre richtige Antwort ist die Antwort der Lehrerin oder Pauls Fassung.
 */
import { stellenFuerBlatt, imBestand, zustandLesen, optFuer } from "./_pruefreiter.js";
import { vorlageFuerBlatt, zeilenZurFrage, falten } from "./_lehrervorlagen.js";

/* Was eine Stelle freigibt. "gesehen" gilt nur für rote Karten, nicht hier. */
const GEKLAERT = new Set(["verbessert", "stimmt", "richtig"]);

const ohneMarke = (z) => String(z || "").replace(/^\s*✍\s*/, "").replace(/\s+/g, " ").trim();

export function offenePinnwandStellen(blattNach, lehrer, zustand) {
  if (!lehrer) return [];
  const erl = (zustand && zustand.s) || {};
  const blaetter = Object.values(blattNach || {});
  const aus = [];
  for (const b of blaetter) {
    if (!imBestand(b) || !vorlageFuerBlatt(lehrer, b.id)) continue;
    let st = [];
    try { st = stellenFuerBlatt(b, lehrer, optFuer(blaetter, b)); } catch (e) { st = []; }
    for (const s of st) {
      if (s.art !== "pinnwand") continue;
      const z = erl[s.id];
      if (z && GEKLAERT.has(z.z)) continue;
      aus.push(s);
    }
  }
  return aus;
}

export function frageWartet(f, s, blatt, lehrer) {
  if (!f || !s || !s.blatt || f.blatt !== s.blatt.id) return false;
  const vorlage = lehrer ? vorlageFuerBlatt(lehrer, f.blatt) : null;
  const nr = s.beleg && s.beleg.nr;
  if (vorlage && nr != null && zeilenZurFrage(f, vorlage).some((vz) => vz.nr === nr)) return true;
  const inhalt = blatt && Array.isArray(blatt.inhalt) ? blatt.inhalt : [];
  if (s.zeile && Number(f.belegNr) >= 1 && ohneMarke(inhalt[f.belegNr - 1]) === ohneMarke(s.zeile)) return true;
  const r = falten((f.antworten || [])[f.richtig || 0] || "");
  if (r && (r === falten(s.soll || "") || (s.du && r === falten(s.du)))) return true;
  return false;
}

/* Die ids der Fragen, die auf eine Klärung warten. */
export function wartendeIds(fragen, stellen, blattNach, lehrer) {
  const aus = new Set();
  if (!stellen || !stellen.length) return aus;
  for (const f of fragen || []) {
    if (stellen.some((s) => frageWartet(f, s, (blattNach || {})[f.blatt], lehrer))) aus.add(f.id);
  }
  return aus;
}

/* Für den Quiz-GET: nur Paul, nur mit Vorlagen; ein Lesevorgang. */
export async function klaerungSperre(env, kind, fragen, blattNach, lehrer) {
  if (kind !== "paul" || !lehrer) return new Set();
  try {
    const zustand = await zustandLesen(env, kind);
    return wartendeIds(fragen, offenePinnwandStellen(blattNach, lehrer, zustand), blattNach, lehrer);
  } catch (e) { return new Set(); }
}
