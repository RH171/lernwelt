// Cloud-Speicher für den Fortschritt der Kinder.
//
// GET  /api/progress?kind=paul   -> liefert den gespeicherten Fortschritt
// POST /api/progress?kind=paul   -> speichert ihn
//
// Am 07.09.2026 grundlegend geändert. Vorher gab es EINEN gemeinsamen Speicher
// ("paul-blob") für alle Kinder, und beide Richtungen waren ohne Anmeldung
// offen. Drei Folgen, alle gemessen:
//
//   1. Jeder im Netz konnte den kompletten Fortschritt lesen - Datum, Punkte
//      und Sekunden jeder Spielrunde seit Juni.
//   2. Jeder konnte ihn mit einem einzigen Aufruf ERSETZEN. Genau das ist beim
//      Durchprüfen aus Versehen passiert.
//   3. Helenas Vokabeldaten lagen in Pauls Speicher, weil das Sync-Skript den
//      ganzen localStorage einsammelte.
//
// Jetzt: ein Speicher je Kind, und wer hinter dem Riegel wohnt, braucht den
// Ausweis. Helenas Bereich ist offen - sie kann sich nicht anmelden, also gilt
// für sie dieselbe Ausnahme wie beim Lernstand.

import { ausweisGueltig, geheimFuer, brauchtAusweis } from "./_riegel.js";

const KINDER = ["paul", "leon", "helena"];

// Pauls Speicher behält seinen alten Namen. Er ist der einzige mit Inhalt aus
// der Zeit davor, und ein Umzug würde nur eine Fehlerquelle schaffen.
const SCHLUESSEL = (kind) => (kind === "paul" ? "paul-blob" : "blob:" + kind);

function kindAus(request) {
  const url = new URL(request.url);
  const k = String(url.searchParams.get("kind") || "").toLowerCase();
  return KINDER.includes(k) ? k : null;
}

async function darfEr(request, env, kind) {
  if (!brauchtAusweis(env, kind)) return true;
  return await ausweisGueltig(request, geheimFuer(env, kind), env);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const kind = kindAus(request);
  if (!kind) return json(400, { ok: false, fehler: "Welches Kind denn?" });
  if (!(await darfEr(request, env, kind))) return json(401, { ok: false, fehler: "Nicht angemeldet." });

  try {
    const daten = (env.PAUL_KV && (await env.PAUL_KV.get(SCHLUESSEL(kind)))) || "null";
    return new Response(daten, {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
  } catch (e) {
    return new Response("null", {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const kind = kindAus(request);
  if (!kind) return json(400, { ok: false, fehler: "Welches Kind denn?" });
  if (!(await darfEr(request, env, kind))) return json(401, { ok: false, fehler: "Nicht angemeldet." });

  let paket = null;
  try { paket = JSON.parse(await request.text()); } catch (e) {}
  if (!paket || typeof paket !== "object" || Array.isArray(paket))
    return json(400, { ok: false, fehler: "Das war kein Objekt." });

  // Zwei Formen erlaubt: {daten:{...}, vollstaendig:true} vom Sync-Skript,
  // und ein blankes Objekt (aeltere Seiten, die noch im Browser-Cache liegen).
  const neu = (paket.daten && typeof paket.daten === "object" && !Array.isArray(paket.daten))
    ? paket.daten : paket;
  const vollstaendig = paket.vollstaendig === true;

  if (typeof neu !== "object" || Array.isArray(neu))
    return json(400, { ok: false, fehler: "Das war kein Objekt." });

  // Ein leeres Objekt löscht nichts. Ein Browser, der gerade erst startet und
  // noch nichts geladen hat, soll nicht den ganzen Stand wegwischen können -
  // genau das war der Weg, auf dem der Fortschritt verlorenging.
  if (!Object.keys(neu).length) return json(200, { ok: true, unveraendert: true });

  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  // Hat das Gerät den Stand aus der Cloud bekommen, kennt es ihn vollständig -
  // dann darf es ihn ERSETZEN, und Weggeworfenes bleibt weg. Sonst wird nur
  // ZUSAMMENGEFÜHRT: lieber ein Schlüssel zu viel als ein Stand zu wenig.
  let fertig = neu;
  if (!vollstaendig) {
    let alt = {};
    try {
      const roh = await env.PAUL_KV.get(SCHLUESSEL(kind));
      if (roh) alt = JSON.parse(roh) || {};
    } catch (e) {}
    fertig = Object.assign(alt, neu);
  }
  await env.PAUL_KV.put(SCHLUESSEL(kind), JSON.stringify(fertig));
  return json(200, { ok: true, ersetzt: vollstaendig });
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
