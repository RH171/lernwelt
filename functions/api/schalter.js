/* Rückweg-Schalter ohne neuen Bau (Denny 30.10.2026, 09:0x Uhr, nur Paul)
 *
 * GET /api/schalter?name=heute-dran
 *   -> { ok: true, name: "heute-dran", wert: "neu" | "alt", quelle: "kv" | "standard" | "unbekannt" | "fehler" }
 *
 * Liest NUR den Speicherwert schalter:<name> aus PAUL_KV. Schreibt nie.
 * Standard ist immer "neu": fehlt der Wert, ist er unbekannt, fehlt der Speicher oder scheitert das
 * Lesen, bleibt die neue Startseite. Nur der genaue Wert "alt" (Groß/klein und Anführungszeichen egal)
 * schaltet auf die alte Startseite mit „Heute lernen“ zurück (paul/index.html, <template id="startAlt">).
 *
 * Ohne Anmeldung lesbar: Die Antwort verrät nichts außer "neu"/"alt", und der Rückweg soll auch dann
 * greifen, wenn an der Anmeldung etwas klemmt. Nur Namen aus ERLAUBT, also kein beliebiger Schlüssel.
 *
 * Umschalten (nur Denny oder der Hauptchat mit Dennys Ja):
 *   npx wrangler kv key put "schalter:heute-dran" "alt" --namespace-id b0c17f5eabaa4a4da3212117a236dae2 --remote
 *   npx wrangler kv key delete "schalter:heute-dran" --namespace-id b0c17f5eabaa4a4da3212117a236dae2 --remote   # zurück auf neu
 * Prüfprotokoll: befunde/2026-10-30-heute-dran-pruefprotokoll.md, Abschnitt „Nacharbeit 30.10.2026“.
 */
const ERLAUBT = { "heute-dran": ["neu", "alt"] };

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});

export async function onRequestGet(context) {
  const { request, env } = context;
  let name = "";
  try { name = String(new URL(request.url).searchParams.get("name") || "").toLowerCase(); } catch (e) {}
  if (!Object.prototype.hasOwnProperty.call(ERLAUBT, name)) return json(400, { ok: false, fehler: "Unbekannter Schalter." });
  let wert = "neu", quelle = "standard";
  try {
    const roh = env && env.PAUL_KV ? await env.PAUL_KV.get("schalter:" + name) : null;
    if (roh != null) {
      const w = String(roh).trim().replace(/^["']|["']$/g, "").trim().toLowerCase();
      if (ERLAUBT[name].includes(w)) { wert = w; quelle = "kv"; } else quelle = "unbekannt";
    }
  } catch (e) { wert = "neu"; quelle = "fehler"; }
  return json(200, { ok: true, name, wert, quelle });
}
