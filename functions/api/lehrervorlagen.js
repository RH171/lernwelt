/* Heft gegen die Lehrerin (13.10.2026)
 *
 * GET /api/lehrervorlagen?kind=paul
 *   -> { ok, vergleiche: { <blattId>: { vorlage, geprueft, richtig,
 *          abweichungen, schreibweise, gleichwertig, rot } }, medien: [...] }
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
import { vorlagenLesen, blattVergleichen, vorlageFuerBlatt } from "./_lehrervorlagen.js";

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
  let kind = "";
  try { kind = String(new URL(request.url).searchParams.get("kind") || "").toLowerCase(); } catch (e) {}
  if (!kindOk(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });

  const daten = await vorlagenLesen(env, kind);
  const e = await stoffLesen(env, kind, 6);
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });

  const vergleiche = {};
  for (const b of e.eintraege || []) {
    const v = blattVergleichen(b, vorlageFuerBlatt(daten, b.id));
    if (!v) continue;
    if (!v.vorlage && !v.rot.length) continue;
    vergleiche[b.id] = { ...v, blatt: { titel: String(b.titel || "").slice(0, 80), datum: b.datum || "", fach: b.fach || "" } };
  }
  const medien = ((daten && daten.medien) || []).map((m) => ({ titel: m.titel, art: m.art, url: m.url, fach: m.fach }));
  return json(200, { ok: true, mitVorlagen: !!daten, vergleiche, medien });
}
