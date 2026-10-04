/* Probentermine je Kind (04.10.2026).
 *
 * Denny: Paul schreibt am Freitag, 09.10.2026 die Probe "D | Lesen". Die
 * Lernwelt soll das wissen und eine passende Uebung oben anbieten.
 *
 * Ein Schluessel je Kind: proben-termine:<kind> = { termine: [{datum, fach, thema}] }.
 * Gesetzt wird nur mit Elternausweis (noten.js), gelesen vom Kind ueber
 * GET /api/noten?eigene=1 - dort nur heutige und kuenftige Termine.
 *
 * Schreibvorgaenge sind die knappe Zahl (1000 am Tag): vor jedem put erst
 * get, ein gleicher Termin wird nicht noch einmal geschrieben, ein Loeschen
 * ohne Treffer schreibt nichts.
 */

export const TERMIN_SCHLUESSEL = (kind) => "proben-termine:" + kind;
export const TERMINE_MAX = 40;

/* "Heute" in deutscher Zeit - der Worker laeuft in UTC, bis 2 Uhr waere es
 * sonst noch gestern (dieselbe Falle wie am 30.09.2026 im Elternbereich). */
export function berlinHeute(jetzt = new Date()) {
  return jetzt.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

export function terminPruefen(roh) {
  const t = roh || {};
  const datum = String(t.datum || "").trim();
  const fach = String(t.fach || "").trim().toLowerCase();
  const thema = String(t.thema || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) return { fehler: "Datum bitte als JJJJ-MM-TT." };
  const d = new Date(datum + "T12:00:00Z");
  if (isNaN(d) || d.toISOString().slice(0, 10) !== datum) return { fehler: "Dieses Datum gibt es nicht." };
  if (!/^[a-z][a-z-]{1,19}$/.test(fach)) return { fehler: "Fach bitte als kurzes Wort, z. B. deutsch." };
  if (!thema || thema.length > 40) return { fehler: "Thema fehlt oder ist zu lang (höchstens 40 Zeichen)." };
  return { termin: { datum, fach, thema } };
}

/* null heisst: der Speicher hat nicht geantwortet. Ein leeres Array heisst:
 * es gibt keine Termine. Beides darf nie verwechselt werden. */
export async function termineLesen(env, kind) {
  try {
    const roh = await env.PAUL_KV.get(TERMIN_SCHLUESSEL(kind));
    if (!roh) return [];
    const d = JSON.parse(roh);
    return Array.isArray(d && d.termine) ? d.termine : [];
  } catch (e) {
    return null;
  }
}

const gleich = (a, b) => a.datum === b.datum && a.fach === b.fach;
const ordnen = (liste) => liste.slice().sort((a, b) =>
  a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : a.fach < b.fach ? -1 : 1);

/* Setzt oder ersetzt einen Termin (gleicher Tag + gleiches Fach = derselbe).
 * Wirft bei Speicherfehler - der Aufrufer meldet es ehrlich. */
export async function terminSetzen(env, kind, termin) {
  const liste = await termineLesen(env, kind);
  if (liste === null) throw new Error("lesen");
  const alt = liste.find((t) => gleich(t, termin));
  if (alt && alt.thema === termin.thema) return { geschrieben: false, termine: ordnen(liste) };
  const neu = ordnen(liste.filter((t) => !gleich(t, termin)).concat([termin])).slice(-TERMINE_MAX);
  await env.PAUL_KV.put(TERMIN_SCHLUESSEL(kind), JSON.stringify({ termine: neu }));
  return { geschrieben: true, termine: neu };
}

export async function terminWeg(env, kind, datum, fach) {
  const liste = await termineLesen(env, kind);
  if (liste === null) throw new Error("lesen");
  const rest = liste.filter((t) => !(t.datum === datum && (!fach || t.fach === fach)));
  if (rest.length === liste.length) return { geschrieben: false, gefunden: false, termine: ordnen(liste) };
  await env.PAUL_KV.put(TERMIN_SCHLUESSEL(kind), JSON.stringify({ termine: rest }));
  return { geschrieben: true, gefunden: true, termine: ordnen(rest) };
}

/* Nur heutige und kuenftige Termine, nach Datum. */
export function kuenftige(liste, heute) {
  return ordnen((liste || []).filter((t) => t && typeof t.datum === "string" && t.datum >= heute));
}
