/* Antwort-Kennung (03.11.2026, Dennys Auftrag 203, nur Paul)
 *
 * Je Blatt-Antwort zusaetzlich: q = Fragen-ID, fa = Frageart (n normal/standard, u umgekehrt,
 * l Luecke, z Zuordnung), aw = Antwortweise (k angekreuzt, l Luecke gefuellt, s selbst geschrieben),
 * t = Zeitpunkt der Antwort (ISO, Serveruhr). Nur IDs und Kuerzel, nie Kinderantworten.
 *
 * Schalter schalter:antwortkennung: Standard "alt" = nichts wird mitgespeichert, Verhalten wie vor dem
 * 03.11.2026. Nur der genaue Wert "neu" speichert die Felder. Scheitert das Lesen, gilt "alt".
 *
 * Zeit: Der Browser schickt je Antwort seine Uhrzeit (ta) und beim Senden seine Sendezeit (gesendet).
 * t = Empfangszeit - (gesendet - ta). So wirkt eine falsch gehende Geraeteuhr nicht. Liegt die Antwort
 * mehr als 12 Stunden vor dem Senden oder fehlt etwas, bleibt t leer (nie geraten).
 *
 * Bestehende Felder werden nie veraendert; alte Antworten nie angefasst (nur die neue Runde).
 */
const FA = new Set(["n", "u", "l", "z"]);
const AW = new Set(["k", "l", "s"]);
const Q = /^[A-Za-z0-9:_.\-]{1,40}$/;
const MAX_ABSTAND = 12 * 3600 * 1000;

export async function antwortkennungAn(env) {
  try {
    const roh = env && env.PAUL_KV ? await env.PAUL_KV.get("schalter:antwortkennung") : null;
    if (roh != null && String(roh).trim().replace(/^["']|["']$/g, "").trim().toLowerCase() === "neu") return true;
  } catch (e) { /* Standard: alt */ }
  return false;
}

/* Traegt die Runde aus dem Browser ueberhaupt Kennungen? (Dann erst den Schalter lesen.) */
export function hatKennung(roh) {
  try {
    return !!(roh && Array.isArray(roh.aufgaben) && roh.aufgaben.some((a) => a && (a.q || a.fa || a.aw || a.ta)));
  } catch (e) { return false; }
}

export function kennungFelder(a, gesendet, empfangMs) {
  const o = {};
  if (!a || typeof a !== "object") return o;
  if (typeof a.q === "string" && Q.test(a.q)) o.q = a.q;
  if (FA.has(a.fa)) o.fa = a.fa;
  if (AW.has(a.aw)) o.aw = a.aw;
  const ta = Number(a.ta), gs = Number(gesendet), em = Number(empfangMs);
  if (Number.isFinite(ta) && Number.isFinite(gs) && Number.isFinite(em) && ta > 0 && gs >= ta && gs - ta <= MAX_ABSTAND)
    o.t = new Date(em - (gs - ta)).toISOString().slice(0, 19) + "Z";
  return o;
}

/* runde = gesaeuberte Runde (saeubern), roh = Runde aus dem Browser. saeubern() kuerzt nur hinten
   (slice(0, max)), die Stellen passen also. Haengt nur an, aendert nichts. Gibt die Zahl der
   ergaenzten Antworten zurueck. */
export function kennungAnhaengen(runde, roh) {
  if (!runde || !Array.isArray(runde.aufgaben) || !roh || !Array.isArray(roh.aufgaben)) return 0;
  const empfang = Date.parse(runde.zeit);
  let n = 0;
  runde.aufgaben.forEach((a, i) => {
    const o = kennungFelder(roh.aufgaben[i], roh.gesendet, empfang);
    if (!o.q && !o.fa && !o.aw) return;     // eine Zeit allein sagt nichts ueber die Frage
    for (const k of Object.keys(o)) if (!(k in a)) a[k] = o[k];
    n++;
  });
  return n;
}
