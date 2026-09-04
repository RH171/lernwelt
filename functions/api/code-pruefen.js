// Prüft Pauls Code und setzt bei Erfolg das signierte Zugangs-Cookie.
import { gleich, ausweisBauen, ausweisKopfzeile, ausweisGueltig,
         zuVieleFehlversuche, fehlversuchZaehlen, fehlversucheLoeschen } from "./_riegel.js";

export async function onRequestGet(context) {
  // Fragt nur: bin ich hier schon angemeldet?
  const { request, env } = context;
  if (!env.PAUL_CODE) return json(500, { ok: false, fehler: "Auf dem Server fehlt der Zugangscode." });
  return json(200, { ok: await ausweisGueltig(request, env.PAUL_CODE, env) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.PAUL_CODE) {
    return json(500, { ok: false, fehler: "Auf dem Server fehlt der Zugangscode. Denny muss ihn bei Cloudflare als PAUL_CODE hinterlegen." });
  }
  if (await zuVieleFehlversuche(request, env)) {
    return json(429, { ok: false, fehler: "Zu viele falsche Codes. Bitte in einer Stunde nochmal – oder frag Denny." });
  }

  let code = "";
  try { code = String((await request.json()).code || ""); } catch (e) {}

  if (!gleich(code, env.PAUL_CODE)) {
    const n = await fehlversuchZaehlen(request, env);
    return json(401, { ok: false, fehler: "Der Code stimmt nicht.", uebrig: Math.max(0, 8 - n) });
  }

  await fehlversucheLoeschen(request, env);
  const ausweis = await ausweisBauen(env.PAUL_CODE);
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
