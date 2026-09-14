// Zaehlt Schreibvorgaenge statt sie zu schaetzen.
//
// Im Cloudflare-KV ist nicht der Platz knapp, sondern die Zahl der
// Schreibvorgaenge: 1000 am Tag, neu ab 00:00 UTC. Am 14.09.2026 waren sie um
// 13:54 UTC aufgebraucht. Lesen ging weiter - deshalb sah die Lernwelt gesund
// aus, waehrend in Wahrheit keine Meldung, keine Runde und kein Fortschritt
// mehr ankam. Helena hat es gemerkt, bevor es jemand anders gemerkt hat
// (Meldung v4534cdwsc): "Bitte repariere die Seite, sodass nicht immer nur die
// gleiche Antwort kommt."
//
// Diese Pruefung faehrt die haeufigsten Ablaeufe durch und zaehlt mit, wie oft
// dabei geschrieben wird. Sie haelt fest, was heute gilt - wer den Puls oder
// den Bauzettel umbaut, sieht hier sofort, was ihn das kostet.
//
//     node pruefe-sparsam.mjs

import { onRequestPost, onRequestGet } from "./functions/api/aktiv.js";

/* ---- ein KV, das mitzaehlt ------------------------------------------- */
function kvBauen() {
  const daten = new Map();
  const zaehler = { get: 0, put: 0, delete: 0 };
  return {
    zaehler,
    schreibt() { return zaehler.put + zaehler.delete; },
    nullen() { zaehler.get = zaehler.put = zaehler.delete = 0; },
    async get(k) { zaehler.get++; return daten.has(k) ? daten.get(k) : null; },
    async put(k, v) { zaehler.put++; daten.set(k, String(v)); },
    async delete(k) { zaehler.delete++; daten.delete(k); },
    async list() { return { keys: [], list_complete: true }; },
    _setzen(k, v) { daten.set(k, String(v)); },
  };
}

const env = () => ({ PAUL_KV: kvBauen() });

function anfragePost(koerper) {
  return new Request("https://lernwelt.test/api/aktiv", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(koerper),
  });
}
function anfrageGet(suche) {
  return new Request("https://lernwelt.test/api/aktiv" + (suche || ""));
}

let fehler = 0;
function pruefe(was, ist, soll) {
  const gut = ist === soll;
  if (!gut) fehler++;
  console.log("  %s   %s%s", gut ? "ok " : "NEIN", was,
              gut ? "" : "   (" + ist + " statt " + soll + ")");
}
function ueberschrift(t) { console.log(t); }

/* ---- 1. Ein Kind spielt und klickt sich durch seine Seiten ------------ */
ueberschrift("Ein Kind klickt sich durch fuenf Seiten");
{
  const e = { PAUL_KV: kvBauen() };
  // Seitenaufruf, dann Seitenwechsel ohne Abmelden (gehtNurWoandersHin),
  // vier weitere Male - so laeuft es seit heute in lernstand.js.
  for (let i = 0; i < 5; i++) await onRequestPost({ request: anfragePost({ kind: "leon" }), env: e });
  pruefe("kosten zusammen einen Schreibvorgang", e.PAUL_KV.schreibt(), 1);
  pruefe("nachgeschaut wurde trotzdem jedes Mal", e.PAUL_KV.zaehler.get >= 5, true);
}

/* ---- 2. Der regulaere Puls kommt weiter durch ------------------------- */
ueberschrift("Der Puls alle drei Minuten");
{
  const e = { PAUL_KV: kvBauen() };
  e.PAUL_KV._setzen("aktiv:leon", String(Date.now() - 180000));
  e.PAUL_KV.nullen();
  await onRequestPost({ request: anfragePost({ kind: "leon" }), env: e });
  pruefe("wird geschrieben", e.PAUL_KV.zaehler.put, 1);
}

/* ---- 3. Abmelden, wenn gar nichts dasteht ----------------------------- */
ueberschrift("Abmelden ohne Anmeldung");
{
  const e = { PAUL_KV: kvBauen() };
  await onRequestPost({ request: anfragePost({ kind: "leon", weg: true }), env: e });
  pruefe("kostet nichts", e.PAUL_KV.schreibt(), 0);
}
ueberschrift("Abmelden, wenn jemand da war");
{
  const e = { PAUL_KV: kvBauen() };
  e.PAUL_KV._setzen("aktiv:leon", String(Date.now()));
  e.PAUL_KV.nullen();
  await onRequestPost({ request: anfragePost({ kind: "leon", weg: true }), env: e });
  pruefe("loescht wirklich", e.PAUL_KV.zaehler.delete, 1);
}

/* ---- 4. Der Bauzettel, jede Minute neu gefragt ------------------------ */
ueberschrift("ausrollen-frei.sh fragt 15 Minuten lang jede Minute");
{
  const e = { PAUL_KV: kvBauen() };
  for (let i = 0; i < 15; i++) await onRequestGet({ request: anfrageGet("?wunsch=1"), env: e });
  pruefe("kostet einen Schreibvorgang, nicht fuenfzehn", e.PAUL_KV.zaehler.put, 1);
}
ueberschrift("Die Frage wird vor ihrem Ablauf aufgefrischt");
{
  const e = { PAUL_KV: kvBauen() };
  e.PAUL_KV._setzen("ausrollen:wunsch", JSON.stringify({ t: Date.now() - 700000, was: "" }));
  e.PAUL_KV.nullen();
  await onRequestGet({ request: anfrageGet("?wunsch=1"), env: e });
  pruefe("wird neu geschrieben", e.PAUL_KV.zaehler.put, 1);
}

/* ---- 5. Nach dem Ausrollen die Frage zuruecknehmen -------------------- */
ueberschrift("Frage zuruecknehmen, obwohl keine offen war");
{
  const e = { PAUL_KV: kvBauen() };
  await onRequestGet({ request: anfrageGet("?wunsch=0"), env: e });
  pruefe("kostet nichts", e.PAUL_KV.schreibt(), 0);
}

/* ---- 6. Der Waechter fragt nach: darf ausgerollt werden? -------------- */
ueberschrift("Der Waechter fragt, ob frei ist");
{
  const e = { PAUL_KV: kvBauen() };
  const a = await onRequestGet({ request: anfrageGet(), env: e });
  const j = await a.json();
  pruefe("kostet nichts", e.PAUL_KV.schreibt(), 0);
  pruefe("und sagt: frei", j.frei, true);
}

console.log("");
console.log(fehler ? fehler + " Stelle(n) stimmen nicht." : "Alles sauber.");
process.exit(fehler ? 2 : 0);
