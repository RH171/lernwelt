// Tuer zum Quiz-Duell (14.09.2026).
//
//   GET /api/duell?raum=1234              -> { phase, spieler } (ohne Namen)
//   GET /api/duell?raum=1234  (WebSocket) -> Verbindung in den Spielraum
//
// Der Spielraum selbst ist ein eigener kleiner Dienst (duell-worker/), weil
// ein Live-Spiel einen Ort braucht, der sich den Stand fuer alle Geraete
// gleichzeitig merkt. Er haengt als Binding DUELL an diesem Projekt.
//
// Bewusst OHNE Zugangscode: Das Duell ist eine eigene Kachel fuer alle Kinder,
// auch fuer Freunde wie Xaver (Denny, 14.09.2026). Geschuetzt wird durch den
// 4-stelligen Raumcode, den nur kennt, wer eingeladen ist, und dadurch, dass
// nichts gespeichert wird ausser dem laufenden Spiel.
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = (url.searchParams.get("raum") || "").replace(/\D/g, "");
  if (code.length !== 4) {
    return Response.json({ ok: false, fehler: "Der Raumcode hat vier Ziffern." }, { status: 400 });
  }
  if (!env.DUELL) {
    return Response.json({ ok: false, fehler: "Das Duell wird gerade noch eingerichtet." }, { status: 503 });
  }
  const raum = env.DUELL.get(env.DUELL.idFromName(code));
  return raum.fetch(new Request("https://duell/raum?raum=" + code, request));
}
