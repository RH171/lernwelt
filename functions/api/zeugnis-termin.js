/* Tag des Übertrittszeugnisses je Kind (20.10.2026, Kapitel 126)
 *
 * GET /api/zeugnis-termin?kind=paul
 *   -> { ok: true, datum: "2027-05-03" }   Einstellung gesetzt
 *   -> { ok: true, datum: null }           keine (gültige) Einstellung: die Seite zeigt nichts an
 *
 * Dennys Beschluss vom 20.10.2026: Im Zeugnisplaner (paul/proben.html) steht ruhig,
 * wie viele Tage es noch bis zum Übertrittszeugnis sind. Das Datum ist eine
 * Einstellung, kein Code: Cloudflare-Pages-Variable UEBERTRITT_DATUM_<KIND>
 * (UEBERTRITT_DATUM_PAUL, später UEBERTRITT_DATUM_LEON), Wert JJJJ-MM-TT.
 *
 * Nur mit dem Ausweis des Kindes oder der Eltern (wie /api/videos). Liest nur.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";

const KINDER = ["paul", "leon"];   // Übertritt nach der 4. Klasse; Helena ist schon am Gymnasium

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});

async function darfRein(request, env, kind) {
  if (geheimFuer(env, "eltern") && (await ausweisGueltig(request, geheimFuer(env, "eltern"), env))) return true;
  const g = geheimFuer(env, kind);
  return !!g && (await ausweisGueltig(request, g, env));
}

// Nur ein echter Kalendertag im Format JJJJ-MM-TT gilt; alles andere heißt "nicht gesetzt".
export function terminSaeubern(roh) {
  const s = String(roh == null ? "" : roh).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
  return s;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  let kind = "";
  try { kind = String(new URL(request.url).searchParams.get("kind") || "").toLowerCase(); } catch (e) {}
  if (!KINDER.includes(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });
  return json(200, { ok: true, datum: terminSaeubern(env["UEBERTRITT_DATUM_" + kind.toUpperCase()]) });
}
