/* Probenstoff Mathe: Stoff aus Pauls Matheblättern (16.10.2026, Kapitel 121, _probenstoff.js)
 *
 * GET /api/probenstoff?kind=paul
 *   -> { ok, stellen: [{k, blatt, datum}], quellen: [{k, blatt, datum}], texte: [{k, blatt, datum}] (Textaufgaben
 *      im Wortlaut der Lehrerin, ab Schuljahresbeginn), blaetter: <Zahl im Probenstoff> }
 *   Nur Pauls Ausweis oder der Elternausweis. NUR LESEN: zwei KV-Lesevorgänge (zwei Monate),
 *   kein Schreibvorgang, kein Modellaufruf. Lösungen stehen nicht drin - sie folgen ohnehin aus
 *   dem Schlüssel, den die Seite rechnet (/probenstoff/motor.js prüft jeden Schlüssel noch einmal).
 * GET /api/probenstoff?kind=paul&eltern=1  (nur Elternausweis) zusätzlich `liste`: je Blatt drin/raus,
 *   Grund, Soll gegen Ist, Fehler, vertauschte Zahlen, nicht übernommene Felder.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { stoffLesen } from "./_schulstoff.js";
import { blattStoff, VON } from "./_probenstoff.js";

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

export async function onRequestGet(context) {
  const { request, env } = context;
  let p;
  try { p = new URL(request.url).searchParams; } catch (e) { p = new URLSearchParams(); }
  if (String(p.get("kind") || "paul").toLowerCase() !== "paul") return json(200, { ok: true, stellen: [], quellen: [], blaetter: 0 });
  const ge = geheimFuer(env, "eltern"), gp = geheimFuer(env, "paul");
  const eltern = !!ge && (await ausweisGueltig(request, ge, env));
  if (!eltern && !(gp && (await ausweisGueltig(request, gp, env)))) return json(401, { ok: false, fehler: "Bitte melde dich an." });
  const e = await stoffLesen(env, "paul", 2);
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });
  const r = blattStoff(e.eintraege, { von: VON, bis: e.heute });
  const aus = { ok: true, stellen: r.stellen.map(({ k, blatt, datum }) => ({ k, blatt, datum })), quellen: r.quellen, texte: r.texte,
                blaetter: r.blaetter.filter((b) => b.drin).length };
  if (p.get("eltern") === "1" && eltern) aus.liste = r.blaetter;
  return json(200, aus);
}
