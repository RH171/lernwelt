// Kurzer Prüfstein: Kommen neue Functions überhaupt im Deployment an?
// Verrät nichts über Inhalte und wird nach der Prüfung wieder entfernt
// (21.09.2026, beim Einbau des Hauptschlüssels).
//
// "schluessel" nennt nur die NAMEN der gesetzten Umgebungswerte, nie einen
// Wert und nie eine Länge - damit ist zu sehen, was der laufende Worker
// überhaupt kennt.
export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    ok: true,
    stand: "21.09.2026",
    schluessel: Object.keys(context.env || {}).sort(),
  }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
