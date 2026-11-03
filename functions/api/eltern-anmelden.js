/* Anmeldung im Elternbereich mit Passwort je Person (Auftrag 195, 03.11.2026).
 *
 * POST /api/eltern-anmelden  { "passwort": "…" }      (nie in der Adresse)
 *   200 { ok: true, rolle, kinder, bis }  + Personen-Ausweis als Cookie
 *   401 { ok: false, fehler, uebrig }     falsches Passwort
 *   429 { ok: false, fehler }             5 falsche -> 15 Minuten Pause je Absender
 *   409 { ok: false, alt: true }          schalter:elternzugang steht auf "alt":
 *                                         die Seite nimmt dann den alten Weg /api/code-pruefen
 * Der alte Code (ELTERN_CODE, MASTER_CODE) gilt hier NICHT - er bleibt bei /api/code-pruefen.
 */
import { schalterLesen, rolleZuPasswort, personenAusweisBauen, personenKopfzeile, personPruefen,
         gesperrt, fehlversuch, fehlversucheWeg, zugaengeLesen, SPERRE } from "./_elternzugang.js";

const json = (status, d, kekse) => {
  const h = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" });
  for (const k of kekse || []) h.append("set-cookie", k);
  return new Response(JSON.stringify(d), { status, headers: h });
};

export async function onRequestPost(context) {
  const { request, env } = context;
  if ((await schalterLesen(env, "elternzugang")) !== "neu") return json(409, { ok: false, alt: true });
  if (!env.ELTERN_CODE || !zugaengeLesen(env)) return json(503, { ok: false, fehler: "Die Zugänge sind auf dem Server nicht eingerichtet." });
  if (new URL(request.url).search) return json(400, { ok: false, fehler: "Das Passwort gehört nicht in die Adresse." });
  if (await gesperrt(request, env))
    return json(429, { ok: false, fehler: "Zu viele falsche Versuche. Bitte in 15 Minuten nochmal." });

  let pw = "";
  try { const d = await request.json(); pw = String((d && d.passwort) || "").slice(0, 200); } catch (e) {}
  const rolle = pw ? await rolleZuPasswort(env, pw) : null;
  if (!rolle) {
    const n = await fehlversuch(request, env);
    return json(401, { ok: false, fehler: "Das Passwort stimmt nicht.", uebrig: Math.max(0, SPERRE.max - n) });
  }
  const ausweis = await personenAusweisBauen(env, rolle);
  if (!ausweis) return json(403, { ok: false, fehler: "Dieser Zugang ist abgelaufen." });
  await fehlversucheWeg(request, env);

  // Gleich gegenpruefen, wie der Ausweis wirken wird (Verwalter-Schalter, Kinder).
  const probe = new Request(request.url, { headers: { cookie: "lw_werkstatt=" + encodeURIComponent(ausweis.wert) } });
  const ich = await personPruefen(probe, env);
  if (!ich) return json(403, { ok: false, fehler: "Dieser Zugang ist gerade abgeschaltet." });
  return json(200, { ok: true, rolle: ich.rolle, kinder: ich.kinder, bis: new Date(ich.bis).toISOString() },
              [personenKopfzeile(ausweis)]);
}

/* Anmelden nur per POST. Ohne diese Zeile fiele GET auf die Startseite durch (200) und sähe aus wie Erfolg. */
export const onRequestGet = () => json(405, { ok: false, fehler: "Nur per POST, das Passwort gehört nicht in die Adresse." });
