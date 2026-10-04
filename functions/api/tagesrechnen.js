// Pauls Tagesaufgabe "1×1 und Textaufgaben" – Übersicht für die Eltern (04.10.2026).
//
// GET /api/tagesrechnen  -> { ok, stand }   nur mit Elternausweis
//
// Der Stand liegt in Pauls Fortschritts-Speicher (paul-blob, Schlüssel
// "paul-tagesrechnen"), den nur Pauls Ausweis über /api/progress lesen darf.
// Damit der Elternbereich ihn sieht, ohne progress.js anzufassen, liest dieser
// Endpunkt genau diesen einen Schlüssel heraus. NUR LESEN: kein Schreibvorgang,
// kein Geld. Was nicht sitzt, rechnet die Seite /eltern/tagesrechnen.html mit
// demselben Motor aus (/tagesrechnen/motor.js).

import { ausweisGueltig, geheimFuer } from "./_riegel.js";

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const geheim = geheimFuer(env, "eltern");
  if (!geheim || !(await ausweisGueltig(request, geheim, env)))
    return json(401, { ok: false, fehler: "Nur mit Elternausweis." });
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  let stand = null;
  try {
    const roh = await env.PAUL_KV.get("paul-blob");
    const blob = roh ? JSON.parse(roh) : null;
    const wert = blob && blob["paul-tagesrechnen"];
    stand = wert ? JSON.parse(wert) : null;
  } catch (e) {
    return json(500, { ok: false, fehler: "Der Stand ließ sich nicht lesen." });
  }
  if (stand && typeof stand === "object") delete stand.benutzt;   // Fingerabdrücke braucht die Übersicht nicht
  return json(200, { ok: true, stand });
}
