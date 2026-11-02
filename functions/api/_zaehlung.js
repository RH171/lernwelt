/* Zaehlung (02.11.2026, Auftrag 193, nur Paul).
 *
 * Paul: „Hab gerade auch HSU gemacht, wird auch nicht gezählt oben … ich möchte, dass Mama auch
 * sieht, was ich gemacht habe“. Ursache (gemessen 02.11.2026, 18:47 MEZ): Die Einstiegskarte einer
 * Fach-Runde ist eine sichere, noch nicht faellige Karte. Schritt 4 laesst bei ihr z unveraendert
 * (der 28-Tage-Takt bleibt), also stand sie nie in heuteBeantwortet - HSU zeigte „noch 5“ nach Pauls Runde.
 *
 * Neu:  punktVerbuchen setzt beim Sicher-Ruecksprung p.h = Berliner Tag (z und Wiedervorlage
 *       bleiben), heuteBeantwortet zaehlt p.h mit, die Startseite sagt „10 geschafft, noch 5“,
 *       der Elternbereich zeigt Aufgaben und Minuten je Fach.
 * Alt:  genau das Verhalten vor dem 02.11.2026 - p.h wird weder gesetzt noch gelesen.
 *
 * Rueckweg ohne neuen Bau (kein Eintrag = neu):
 *   npx wrangler kv key put "schalter:zaehlung" "alt" --namespace-id b0c17f5eabaa4a4da3212117a236dae2 --remote
 *   npx wrangler kv key delete "schalter:zaehlung" --namespace-id b0c17f5eabaa4a4da3212117a236dae2 --remote   # zurueck auf neu
 */
export async function zaehlungAn(env) {
  try {
    const roh = env && env.PAUL_KV ? await env.PAUL_KV.get("schalter:zaehlung") : null;
    if (roh != null && String(roh).trim().replace(/^["']|["']$/g, "").trim().toLowerCase() === "alt") return false;
  } catch (e) { /* Standard: neu */ }
  return true;
}
