// Prüft Pauls Code und setzt bei Erfolg das signierte Zugangs-Cookie.
import { gleich, ausweisBauen, ausweisKopfzeile, ausweisGueltig, geheimFuer,
         zuVieleFehlversuche, fehlversuchZaehlen, fehlversucheLoeschen } from "./_riegel.js";

// Welches Kind meldet sich an? Steht als ?kind=leon in der Adresse bzw. im Auftrag.
function kindAus(request, auftrag) {
  const ausAdresse = new URL(request.url).searchParams.get("kind");
  return String((auftrag && auftrag.kind) || ausAdresse || "paul").toLowerCase();
}

export async function onRequestGet(context) {
  // Fragt nur: bin ich hier schon angemeldet?
  const { request, env } = context;
  if (!env.PAUL_CODE) return json(500, { ok: false, fehler: "Auf dem Server fehlt der Zugangscode." });
  return json(200, { ok: await ausweisGueltig(request, geheimFuer(env, kindAus(request, null)), env) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.PAUL_CODE) {
    return json(500, { ok: false, fehler: "Auf dem Server fehlt der Zugangscode. Denny muss ihn bei Cloudflare als PAUL_CODE hinterlegen." });
  }
  if (await zuVieleFehlversuche(request, env)) {
    return json(429, { ok: false, fehler: "Zu viele falsche Codes. Bitte in einer Stunde nochmal – oder frag Denny." });
  }

  let code = "", auftrag = null;
  try { auftrag = await request.json(); code = String((auftrag && auftrag.code) || ""); } catch (e) {}
  const geheim = geheimFuer(env, kindAus(request, auftrag));

  if (!gleich(code, geheim)) {
    const n = await fehlversuchZaehlen(request, env);
    return json(401, { ok: false, fehler: "Der Code stimmt nicht.", uebrig: Math.max(0, 8 - n) });
  }

  await fehlversucheLoeschen(request, env);
  const ausweis = await ausweisBauen(geheim);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "set-cookie": ausweisKopfzeile(ausweis),
    },
  });
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
