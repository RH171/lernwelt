// Arbeitsdateien gehoeren nicht ins Netz (30.10.2026, anleitung/153-webordner.md).
// Diese Adresse antwortet mit einem echten 404 statt mit der Datei.
export function onRequest() {
  return new Response("Nicht gefunden", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}
