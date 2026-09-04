// Meldet ALLE Geräte ab - auch das eigene.
// Danach verlangt Pauls Bereich überall wieder den Code.
//
// POST /api/alle-abmelden   (nur wer selbst angemeldet ist)

import { ausweisGueltig, alleAbmelden } from "./_riegel.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.PAUL_CODE) return json(500, { ok: false, fehler: "Auf dem Server fehlt der Zugangscode." });
  if (!(await ausweisGueltig(request, env.PAUL_CODE, env))) {
    return json(401, { ok: false, fehler: "Nur wer angemeldet ist, kann alle abmelden." });
  }
  if (!(await alleAbmelden(env))) {
    return json(500, { ok: false, fehler: "Der Speicher ist nicht erreichbar." });
  }

  // Das eigene Cookie gleich mit wegräumen.
  return new Response(JSON.stringify({ ok: true, hinweis: "Alle Geräte sind abgemeldet." }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "set-cookie": "lw_werkstatt=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
    },
  });
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
