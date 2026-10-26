/* Probenvergleich im Elternbereich (26.10.2026, Kapitel 141)
 *
 * GET /api/probenvergleich?kind=paul
 *   -> { ok: true, proben: [ ... ], profil }   Proben neueste zuerst, nur dieses Kind;
 *      profil = Lehrerprofil des Kindes (Kapitel 143) oder null
 *   -> 401 ohne Elternausweis (auch MIT dem Ausweis eines Kindes)
 *
 * Die Daten liegen in ./_proben-daten.js (serverseitig, nie als statische Datei
 * abrufbar). Liest nur, schreibt nichts in den Speicher.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { PROBEN, LEHRERPROFIL } from "./_proben-daten.js";

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});

// Nur die Eltern. Ohne gesetztes ELTERN_CODE bleibt die Tuer zu (geheimFuer liefert dann null).
async function elternDa(request, env) {
  const g = geheimFuer(env, "eltern");
  return !!g && (await ausweisGueltig(request, g, env));
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!(await elternDa(request, env))) return json(401, { ok: false, fehler: "Bitte im Elternbereich anmelden." });
  let kind = "";
  try { kind = String(new URL(request.url).searchParams.get("kind") || "").toLowerCase(); } catch (e) {}
  const proben = PROBEN.filter(p => !kind || p.kind === kind)
    .slice().sort((a, b) => (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0));
  const profil = (kind && LEHRERPROFIL[kind]) || null;
  return json(200, { ok: true, proben, profil });
}
