/* Videos mit Papa (17.10.2026, Kapitel 129)
 *
 * GET /api/videos?kind=paul
 *   -> { ok, videos: [{ id, titel, fach, laenge, kanal, fragen: [{ frage, antworten, richtig,
 *          beleg, erklaerung, hinweise }] }] }
 *
 * Dennys Wahl vom 17.10.2026 („C · Beides zusammen“): Paul sieht die Videos seiner
 * Lehrerin von der Klassenpinnwand zusammen mit Papa, darunter je drei Fragen.
 *
 * Die Zusammenstellung und die Fragen liegen im Speicher "videos:paul" (PAUL_KV),
 * eingespielt mit werkzeuge/videos-laden.py – nie als Datei in lernwelt/ und nie
 * im Code: Das Repo ist öffentlich lesbar. Dasselbe Muster wie /api/lehrervorlagen.
 * Nur mit dem Ausweis des Kindes oder der Eltern. Liest nur, schreibt nie.
 * Das Häkchen „zusammen gesehen“ speichert die Seite über den normalen
 * Fortschritt (localStorage + paul-sync.js), nicht hier.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";

const KINDER_MIT_VIDEOS = ["paul"];   // Proben-Übungen nur für Paul (Beschluss 04.10.2026)

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});

async function darfRein(request, env, kind) {
  if (geheimFuer(env, "eltern") && (await ausweisGueltig(request, geheimFuer(env, "eltern"), env))) return true;
  const g = geheimFuer(env, kind);
  return !!g && (await ausweisGueltig(request, g, env));
}

const text = (s, n) => String(s == null ? "" : s).slice(0, n);

export function videosSaeubern(roh) {
  const liste = (roh && Array.isArray(roh.videos)) ? roh.videos : [];
  return liste.filter((v) => v && /^[A-Za-z0-9_-]{11}$/.test(String(v.id || ""))).map((v) => ({
    id: v.id,
    titel: text(v.titel, 120),
    fach: text(v.fach, 20).toLowerCase(),
    laenge: /^\d+(:\d\d)+$/.test(String(v.laenge || "")) ? v.laenge : "",
    kanal: text(v.kanal, 80),
    fragen: (Array.isArray(v.fragen) ? v.fragen : []).filter((q) => q && Array.isArray(q.antworten) && q.antworten.length >= 2
      && Number.isInteger(q.richtig) && q.richtig >= 0 && q.richtig < q.antworten.length).map((q) => ({
      frage: text(q.frage, 300),
      antworten: q.antworten.map((a) => text(a, 160)),
      richtig: q.richtig,
      beleg: /^\d\d:\d\d:\d\d$/.test(String(q.beleg || "")) ? q.beleg : "",
      erklaerung: text(q.erklaerung, 400),
      hinweise: (Array.isArray(q.hinweise) ? q.hinweise : []).map((h) => (h == null ? null : text(h, 300))),
    })),
  }));
}

export async function onRequestGet(context) {
  const { request, env } = context;
  let kind = "";
  try { kind = String(new URL(request.url).searchParams.get("kind") || "").toLowerCase(); } catch (e) {}
  if (!["paul", "leon", "helena"].includes(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });
  if (!KINDER_MIT_VIDEOS.includes(kind)) return json(200, { ok: true, videos: [] });

  let roh = null;
  try { roh = await env.PAUL_KV.get("videos:" + kind, { type: "json" }); } catch (e) {
    return json(503, { ok: false, fehler: "Die Videos lassen sich gerade nicht laden." });
  }
  return json(200, { ok: true, videos: videosSaeubern(roh) });
}
