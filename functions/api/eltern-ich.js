/* Wer ist im Elternbereich angemeldet? (Auftrag 195, 03.11.2026)
 * GET /api/eltern-ich
 *   Personen-Ausweis:   { ok, art: "person", rolle, kinder, bis, schalter: "neu" }
 *   alter Eltern-Code:  { ok, art: "code", rolle: null, kinder: [alle drei], bis: null, schalter }
 *   sonst 401           { ok: false, schalter }
 * Die Seite baut daraus Reiter und Listen. Die Grenze selbst zieht der Server
 * (functions/api/_middleware.js), nicht diese Antwort.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { personPruefen, personenCookieDa, schalterLesen, KINDER } from "./_elternzugang.js";

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});

export async function onRequestGet(context) {
  const { request, env } = context;
  const schalter = await schalterLesen(env, "elternzugang");
  if (personenCookieDa(request)) {
    const ich = await personPruefen(request, env);
    if (!ich) return json(401, { ok: false, schalter });
    return json(200, { ok: true, art: "person", rolle: ich.rolle, kinder: ich.kinder,
                       bis: new Date(ich.bis).toISOString(), schalter });
  }
  const g = geheimFuer(env, "eltern");
  if (g && (await ausweisGueltig(request, g, env)))
    return json(200, { ok: true, art: "code", rolle: null, kinder: KINDER.slice(), bis: null, schalter });
  return json(401, { ok: false, schalter });
}
