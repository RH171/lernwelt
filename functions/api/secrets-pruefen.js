// Welche Secrets kennt der laufende Worker? Sagt NUR ja/nein - nie einen Wert,
// nie eine Länge, nie einen Fingerabdruck. Sonst wäre es ein Orakel, mit dem
// man einen Code Stück für Stück erraten könnte.
//
// Angelegt am 21.09.2026, weil beim Einbau des Hauptschlüssels nicht zu
// unterscheiden war, ob MASTER_CODE beim Worker gar nicht ankommt oder
// schlicht einen anderen Wert hat als der Eintrag im Tresor. Pages reicht ein
// Secret nämlich erst an ein NEUES Deployment weiter.
//
// Nur mit Elternausweis - niemand Fremdes soll die Liste sehen.
import { ausweisGueltig, geheimFuer } from "./_riegel.js";

const NAMEN = ["PAUL_CODE", "HELENA_CODE", "ELTERN_CODE", "MASTER_CODE",
               "ANTHROPIC_API_KEY"];

export async function onRequestGet(context) {
  const { request, env } = context;
  const geheim = geheimFuer(env, "eltern");
  if (!geheim || !(await ausweisGueltig(request, geheim, env))) {
    return json(401, { ok: false, fehler: "Nicht angemeldet." });
  }
  const stand = {};
  for (const n of NAMEN) stand[n] = !!env[n];
  return json(200, { ok: true, gesetzt: stand });
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
