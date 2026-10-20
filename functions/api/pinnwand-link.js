/* Link zur Klassenpinnwand (TaskCards) für ein Kind (20.10.2026, Kapitel 124)
 *
 * GET /api/pinnwand-link?kind=paul
 *   -> { ok: true, link: "https://….taskcards.app/#/board/<id>/view?token=<token>" }
 *   -> { ok: true, link: null }   wenn für das Kind kein Link eingestellt ist (der Knopf bleibt dann verborgen)
 *
 * Der Link trägt den Lese-Token der Pinnwand und steht deshalb NICHT im Repo (öffentlich lesbar),
 * sondern als Cloudflare-Pages-Secret: PINNWAND_LINK_PAUL, später PINNWAND_LINK_LEON.
 * Neues Schuljahr: Secret neu setzen, danach einmal ausrollen (Pages-Variablen greifen erst mit dem
 * nächsten Deployment).
 *
 * Nur mit dem Ausweis des Kindes oder der Eltern (wie /api/videos). Das Ernte-Werkzeug
 * werkzeuge/pinnwand-ernten.py liest denselben Link mit dem Eltern-Ausweis.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";

const VARIABLE = { paul: "PINNWAND_LINK_PAUL", leon: "PINNWAND_LINK_LEON" };

// Nur echte TaskCards-Board-Links – ein vertippter Wert darf nie als Link auf der Seite landen.
const MUSTER = /^https:\/\/[a-z0-9-]+\.taskcards\.app\/#\/board\/[0-9a-f-]{36}\/view\?token=[0-9a-f-]{36}$/;

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});

async function darfRein(request, env, kind) {
  const eltern = geheimFuer(env, "eltern");
  if (eltern && (await ausweisGueltig(request, eltern, env))) return true;
  const g = geheimFuer(env, kind);
  return !!g && (await ausweisGueltig(request, g, env));
}

export async function onRequestGet(context) {
  const { request, env } = context;
  let kind = "";
  try { kind = String(new URL(request.url).searchParams.get("kind") || "").toLowerCase(); } catch (e) {}
  if (!["paul", "leon", "helena"].includes(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });
  const roh = VARIABLE[kind] ? String(env[VARIABLE[kind]] || "").trim() : "";
  return json(200, { ok: true, link: MUSTER.test(roh) ? roh : null });
}
