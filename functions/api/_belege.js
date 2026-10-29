/* Belegliste (29.10.2026, Dennys Entscheidung A, nur Paul).
 *
 * Seit der Zwei-Lesungen-Regel zählt ein Fehler der Abschrift nur, wenn auch das Durchlesen (`inhalt`)
 * dieselbe Zahl des Kindes nennt. Nennt es die Aufgabe nicht, steht die Stelle im Elternbereich unter
 * „bitte nachsehen“ und Paul bekommt keine Karte. Ein ZWEITER BELEG ersetzt das Durchlesen:
 *
 *   - am Foto einzeln bestätigt (feste Liste FOTO_BELEGE unten, mit Ausschnitt im Projekt), oder
 *   - Dennys Klick im Elternbereich („Ist ein Fehler“ / „Ist richtig“), gespeichert unter `belege:paul`.
 *
 * Ein Beleg gilt nur für genau dieses Feld (Feldkennung wie in der zweiten Lesung, z. B. "4c|63:9=?")
 * UND genau Pauls Zahl (`du`). Liest ein neues Foto eine andere Zahl, gilt der Beleg nicht mehr.
 *
 * urteil "fehler":  Pauls Zahl ist falsch -> die Stelle zählt als Fehler, Karte bleibt (wie zwei Lesungen).
 * urteil "richtig": die Abschrift hat sich verlesen -> kein Fehler, keine Karte, nicht mehr „nachsehen“.
 */

export const BELEGE_KINDER = ["paul"];
export const BELEGE_SCHLUESSEL = (kind) => "belege:" + kind;
const MAX_BELEGE = 400;

/* Am Foto einzeln bestätigt. Wer etwas hinzufügt: Blatt, Feldkennung, Pauls Zahl, was am Foto steht,
   Ausschnitt im Projekt, Datum, wer geprüft hat. */
export const FOTO_BELEGE = {
  paul: [
    {
      blatt: "44hlbc6vvm", feld: "4c|63:9=?", zeile: "4c | 63 : 9 = [6]", du: "6", richtig: "7", urteil: "fehler",
      beleg: "Foto: Paul schrieb blau 6, daneben grün 7·9=63 (sein Nachschreiben), darunter blau 63 : 6 = 9 durchgestrichen; kein Rot der Lehrerin an 4c",
      ausschnitt: "befunde/markierung-ausschnitte/44hlbc6vvm_4c_63durch9.jpg",
      datum: "2026-10-29", wer: "Claude, Einzelprüfung am Foto, Auftrag Denny 29.10.2026, 21:20 Uhr",
    },
  ],
};

/* Gespeicherte Klicks lesen: { "<blatt>": { "<feld>": beleg } }. Wirft nie; ohne Speicher leer. */
export async function belegeLesen(env, kind) {
  if (!BELEGE_KINDER.includes(kind) || !env || !env.PAUL_KV) return {};
  try {
    const roh = await env.PAUL_KV.get(BELEGE_SCHLUESSEL(kind));
    const d = roh ? JSON.parse(roh) : null;
    return d && d.v === 1 && d.s && typeof d.s === "object" ? d.s : {};
  } catch (e) { return {}; }
}

/* Ein Klick der Eltern. urteil "weg" nimmt ihn zurück. Liefert {ok} oder {ok:false, fehler}. */
export async function belegSetzen(env, kind, blatt, feld, eintrag) {
  if (!BELEGE_KINDER.includes(kind)) return { ok: false, fehler: "Nur für Paul." };
  let s;
  try {
    const roh = await env.PAUL_KV.get(BELEGE_SCHLUESSEL(kind));
    const d = roh ? JSON.parse(roh) : null;
    s = d && d.v === 1 && d.s && typeof d.s === "object" ? d.s : {};
  } catch (e) { return { ok: false, fehler: "Der Speicher ist gerade nicht lesbar." }; }
  s[blatt] = s[blatt] && typeof s[blatt] === "object" ? s[blatt] : {};
  if (eintrag === null) delete s[blatt][feld]; else s[blatt][feld] = eintrag;
  if (!Object.keys(s[blatt]).length) delete s[blatt];
  const zahl = Object.values(s).reduce((n, x) => n + Object.keys(x).length, 0);
  if (zahl > MAX_BELEGE) return { ok: false, fehler: "Zu viele Belege gespeichert." };
  try { await env.PAUL_KV.put(BELEGE_SCHLUESSEL(kind), JSON.stringify({ v: 1, s })); }
  catch (e) { return { ok: false, fehler: "Der Speicher nimmt gerade nichts an." }; }
  return { ok: true };
}

/* Gespeicherte Klicks an die Blätter hängen (nur im Speicher des Aufrufs, nie zurückgeschrieben). */
export function belegeAnhaengen(eintraege, gespeichert) {
  if (!Array.isArray(eintraege) || !gespeichert || !Object.keys(gespeichert).length) return eintraege;
  return eintraege.map((b) => (b && gespeichert[b.id] ? Object.assign({}, b, { belege: gespeichert[b.id] }) : b));
}

/* Alle Belege eines Blattes als { feld: beleg }. Ein Klick der Eltern geht vor der festen Liste. */
export function belegeFuerBlatt(blatt, kind) {
  if (!blatt || !BELEGE_KINDER.includes(kind)) return {};
  const aus = {};
  for (const b of FOTO_BELEGE[kind] || []) if (b.blatt === blatt.id) aus[b.feld] = { ...b, quelle: "foto" };
  const k = blatt.belege && typeof blatt.belege === "object" ? blatt.belege : {};
  for (const feld of Object.keys(k)) {
    const b = k[feld];
    if (b && (b.urteil === "fehler" || b.urteil === "richtig")) aus[feld] = { ...b, feld, quelle: "eltern" };
  }
  return aus;
}

/* Gilt ein Beleg für dieses Feld mit genau dieser Zahl des Kindes? */
export function belegGilt(belege, feld, final) {
  const b = belege && belege[feld];
  if (!b || (b.urteil !== "fehler" && b.urteil !== "richtig")) return null;
  return String(b.du) === String(final) ? b : null;
}
