/* Heft gegen die Lehrerin (13.10.2026)
 *
 * GET /api/lehrervorlagen?kind=paul
 * GET /api/lehrervorlagen?kind=paul&bild=<vorlage-id>   (14.10.2026) das Bild der
 *   Vorlage als JPEG, gleicher Ausweis, "private" (kein geteilter Cache). Ohne
 *   Bild im Speicher: 404 JSON. Die Antwort ohne `bild` ist unverändert.
 *   -> { ok, vergleiche: { <blattId>: { vorlage, geprueft, richtig,
 *          abweichungen, schreibweise, gleichwertig, rot, ungeprueft } }, medien: [...] }
 *   26.10.2026: `abweichungen` enthält nur noch die am FOTO bestätigten (Gegenprobe, Merkmal `gegenprobe`
 *   an der Vorlagenzeile). Die übrigen zählt `ungeprueft` (Zahl, kein Inhalt) - sie bleiben still, bis
 *   die Gegenprobe sie bestätigt. Felder und Form sonst unverändert (abwärtsverträglich).
 *
 * Denny: "die Einträge in seinem Heft mit dem Hochladen der Lehrerin zu
 * verifizieren und gegebenenfalls auf Fehler direkt hinzuweisen. Natürlich
 * zählt das Hochladen oder der rote Stift der Lehrerin."
 *
 * Nur mit dem Ausweis des Kindes oder der Eltern - die Vorlagen sind
 * Material der Lehrerin und liegen nie als Datei im öffentlichen Ordner.
 * Liest nur (Heftmonate + ein Schlüssel), schreibt nie.
 * Ohne Vorlage UND ohne rote Verbesserung steht ein Blatt gar nicht drin -
 * dann gibt es auch keine Fehlermeldung.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { stoffLesen, kindOk } from "./_schulstoff.js";
import { vorlagenLesen, blattVergleichen, vorlageFuerBlatt, BILD_SCHLUESSEL, BILD_ID, KINDER_MIT_VORLAGE } from "./_lehrervorlagen.js";

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

async function darfRein(request, env, kind) {
  if (geheimFuer(env, "eltern") && (await ausweisGueltig(request, geheimFuer(env, "eltern"), env))) return true;
  const g = geheimFuer(env, kind);
  return !!g && (await ausweisGueltig(request, g, env));
}

export async function onRequestGet(context) {
  const { request, env } = context;
  let kind = "", bild = null;
  try {
    const p = new URL(request.url).searchParams;
    kind = String(p.get("kind") || "").toLowerCase();
    bild = p.get("bild");
  } catch (e) {}
  if (!kindOk(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });

  if (bild != null) {
    const id = String(bild);
    if (!KINDER_MIT_VORLAGE.includes(kind) || !BILD_ID.test(id)) return json(404, { ok: false, fehler: "Kein Bild." });
    let daten = null;
    try { daten = await env.PAUL_KV.get(BILD_SCHLUESSEL(id), { type: "arrayBuffer" }); } catch (e) { daten = null; }
    if (!daten || !daten.byteLength) return json(404, { ok: false, fehler: "Kein Bild." });
    return new Response(daten, { status: 200, headers: {
      "content-type": "image/jpeg", "cache-control": "private, max-age=3600",
      "x-robots-tag": "noindex", "x-content-type-options": "nosniff" } });
  }

  const daten = await vorlagenLesen(env, kind);
  const e = await stoffLesen(env, kind, 6);
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });

  const vergleiche = {};
  for (const b of e.eintraege || []) {
    const v = blattVergleichen(b, vorlageFuerBlatt(daten, b.id));
    if (!v) continue;
    if (!v.vorlage && !v.rot.length) continue;
    if (Array.isArray(v.abweichungen)) {
      const alle = v.abweichungen;
      v.abweichungen = alle.filter((x) => x.bestaetigt);
      v.ungeprueft = alle.length - v.abweichungen.length;
    }
    vergleiche[b.id] = { ...v, blatt: { titel: String(b.titel || "").slice(0, 80), datum: b.datum || "", fach: b.fach || "" } };
  }
  const medien = ((daten && daten.medien) || []).map((m) => ({ titel: m.titel, art: m.art, url: m.url, fach: m.fach }));
  return json(200, { ok: true, mitVorlagen: !!daten, vergleiche, medien });
}
