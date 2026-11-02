/* Ein Blattfoto als echtes Bild statt als base64 in JSON (Auftrag 193, 02.11.2026, nur Pauls Fundkarten).
 *
 * Paul, 02.11.2026: „Ein Bild hat gerade 30 Sekunden lang geladen.“ Gemessen (befunde/2026-11-02-paul-meldungen-befund.md,
 * Abschnitt 2): /api/schulstoff?bild= liefert das ganze Foto als base64 in JSON, no-store, also jedes Mal neu und 33 % größer.
 *
 *   GET /api/schulstoff?kind=paul&bild=<id>:<nr>&format=jpeg          -> 302 auf dieselbe Adresse mit &v=<abdruck>, no-store
 *   GET /api/schulstoff?kind=paul&bild=<id>:<nr>&format=jpeg&v=<abdruck> -> 200 image/jpeg, private, max-age 30 Tage, immutable
 *
 * Der Abdruck ist ein Teil der SHA-256 über das gespeicherte Bild. Neu fotografieren oder Drehen ändert das Bild und damit
 * den Abdruck - der Browser bekommt eine neue Adresse und lädt neu. Ein alter Abdruck wird nie mit neuem Inhalt beantwortet
 * (er leitet auf den gültigen um). "private": Nur der Browser des Kindes hält das Bild, nie ein Zwischenspeicher im Netz.
 * Ohne format=jpeg bleibt alles wie vorher (JSON) - für alte offene Seiten und alle anderen Aufrufer.
 */
export const BILD_MAXALTER = 2592000;   // 30 Tage

export async function bildAbdruck(daten) {
  const bytes = new TextEncoder().encode(String(daten || ""));
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  let s = "";
  for (let i = 0; i < 8; i++) s += h[i].toString(16).padStart(2, "0");
  return s;
}

/* data:<typ>;base64,<daten> -> { typ, bytes }; sonst null. */
export function bildZerlegen(daten) {
  const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,/i.exec(String(daten || "").slice(0, 64));
  if (!m) return null;
  const b64 = String(daten).slice(String(daten).indexOf(",") + 1);
  let bin;
  try { bin = atob(b64); } catch (e) { return null; }
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { typ: m[1].toLowerCase(), bytes };
}

export async function bildAntwort(request, daten) {
  const url = new URL(request.url);
  const abdruck = await bildAbdruck(daten);
  if (url.searchParams.get("v") !== abdruck) {
    url.searchParams.set("v", abdruck);
    return new Response(null, { status: 302, headers: {
      location: url.pathname + url.search, "cache-control": "no-store", "x-robots-tag": "noindex" } });
  }
  const etag = '"' + abdruck + '"';
  const kopf = { "cache-control": "private, max-age=" + BILD_MAXALTER + ", immutable", etag, "x-robots-tag": "noindex" };
  if ((request.headers.get("if-none-match") || "") === etag) return new Response(null, { status: 304, headers: kopf });
  const z = bildZerlegen(daten);
  if (!z) return new Response("Kein Bild.", { status: 415, headers: { "cache-control": "no-store" } });
  return new Response(z.bytes, { status: 200, headers: { ...kopf, "content-type": z.typ, "content-length": String(z.bytes.length) } });
}
