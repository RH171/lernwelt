// Prueft nur, ob der eingegebene Code stimmt - ohne ein Spiel zu bauen.
// Damit kann die Werkstatt beim Anmelden sofort Rueckmeldung geben,
// statt den Fehler erst nach einer teuren Anfrage zu zeigen.

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.PAUL_CODE) {
    return antwort(500, { ok: false, fehler: "Auf dem Server fehlt der Zugangscode." });
  }

  let code = "";
  try { code = (await request.json()).code || ""; } catch (e) {}

  const wer = request.headers.get("cf-connecting-ip") || "unbekannt";
  const schluessel = "fehlversuche:" + wer;

  let versuche = 0;
  try {
    if (env.PAUL_KV) versuche = parseInt((await env.PAUL_KV.get(schluessel)) || "0", 10) || 0;
  } catch (e) {}
  if (versuche >= 8) {
    return antwort(429, { ok: false, fehler: "Zu viele falsche Codes. Bitte in einer Stunde nochmal." });
  }

  const a = String(code), b = String(env.PAUL_CODE);
  let stimmt = a.length === b.length;
  if (stimmt) {
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    stimmt = diff === 0;
  }

  if (!stimmt) {
    try { if (env.PAUL_KV) await env.PAUL_KV.put(schluessel, String(versuche + 1), { expirationTtl: 3600 }); } catch (e) {}
    return antwort(401, { ok: false, fehler: "Der Code stimmt nicht.", uebrig: Math.max(0, 8 - versuche - 1) });
  }

  try { if (env.PAUL_KV) await env.PAUL_KV.delete(schluessel); } catch (e) {}
  return antwort(200, { ok: true });
}

function antwort(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
