// Pauls gebaute Spiele: auflisten, einzeln holen, löschen.
//
// GET    /api/spiele          -> Liste (ohne Foto, damit sie klein bleibt)
// GET    /api/spiele?id=...   -> ein Spiel samt Foto
// DELETE /api/spiele?id=...   -> Spiel wegwerfen
//
// Liegt im selben KV wie Pauls Fortschritt, aber unter eigenem Präfix
// "werkstatt:" - der Fortschritt unter "paul-blob" wird nicht berührt.

import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { namenRichten } from "./_namen.js";

// Jedes Kind hat seine eigene Liste. Pauls Liste heisst weiterhin
// "werkstatt:liste:paul" - seine gebauten Spiele bleiben also da, wo sie sind.
const LISTE = (kind) => "werkstatt:liste:" + kind;
const SPIEL = (id) => "werkstatt:spiel:" + id;

function kindAus(request) {
  const k = String(new URL(request.url).searchParams.get("kind") || "paul").toLowerCase();
  return (k === "leon" || k === "helena") ? k : "paul";
}

export async function onRequestGet(context) {
  const { request, env } = context;
  // Lesen darf auch Denny mit dem Eltern-Code - so lassen sich die Spiele
  // der Kinder pruefen, ohne ihren Code zu kennen. Aendern bleibt beim Kind.
  const wache = await wacheOk(request, env, true);
  if (wache) return wache;

  const id = new URL(request.url).searchParams.get("id");

  if (id) {
    const roh = await env.PAUL_KV.get(SPIEL(id));
    if (!roh) return json(404, { ok: false, fehler: "Das Spiel gibt es nicht mehr." });
    const spiel = JSON.parse(roh);
    // Auch Spiele, die vor dem 14.09.2026 gebaut wurden, sollen Leon und Theo
    // im Tor haben. Gerichtet wird beim Ausliefern; der Speicher bleibt, wie
    // er ist - so geht nichts verloren, falls die Regel mal danebenliegt.
    // ?roh=1 zeigt den unveraenderten Speicher - zum Nachpruefen der Regel.
    const roh1 = new URL(request.url).searchParams.get("roh") === "1";
    if (!roh1 && (spiel.kind === "leon" || kindAus(request) === "leon")) namenRichten(spiel);
    return json(200, { ok: true, spiel });
  }

  return json(200, { ok: true, spiele: await listeHolen(env, kindAus(request)) });
}

// POST /api/spiele  { id, richtig, gesamt }
// Hält fest, wann ein Spiel zuletzt gespielt wurde und wie es lief.
// Grundlage fürs verteilte Wiederholen: was länger her ist und schlechter
// lief, wird zuerst wieder vorgeschlagen.
export async function onRequestPost(context) {
  return mitSpeicherwache(() => rundeMitschreiben(context));
}

async function rundeMitschreiben(context) {
  const { request, env } = context;
  const wache = await wacheOk(request, env);
  if (wache) return wache;

  let daten = {};
  try { daten = await request.json(); } catch (e) {}
  const id = String(daten.id || "");
  if (!id) return json(400, { ok: false, fehler: "Welches Spiel denn?" });

  const richtig = Number(daten.richtig) || 0;
  const gesamt = Number(daten.gesamt) || 0;

  const kind = kindAus(request);
  const liste = await listeHolen(env, kind);
  const eintrag = liste.find((e) => e.id === id);
  if (!eintrag) return json(404, { ok: false, fehler: "Das Spiel gibt es nicht mehr." });

  // Herkunft nachtragen. Gebraucht fuer Spiele, die vor dem Einfuehren des
  // Feldes gebaut wurden - sonst wuerde die Themenwahl sie nie wiederfinden.
  if (typeof daten.quelle === "string" && daten.quelle) {
    eintrag.quelle = daten.quelle.slice(0, 40);
    await schreiben(env, LISTE(kind), JSON.stringify(liste));
    return json(200, { ok: true, spiele: liste });
  }

  eintrag.zuletztGespielt = new Date().toISOString();
  eintrag.malGespielt = (eintrag.malGespielt || 0) + 1;
  if (gesamt > 0) eintrag.letzteQuote = Math.round((richtig / gesamt) * 100);

  await schreiben(env, LISTE(kind), JSON.stringify(liste));
  return json(200, { ok: true, spiele: liste });
}

// PUT /api/spiele?kind=leon&id=...  { aufgaben: [...], titel?, begruessung? }
// Nur mit Eltern-Code. Zum Nachbessern einzelner Aufgaben, die beim Durchsehen
// aufgefallen sind - ohne das ganze Spiel neu bauen zu lassen (14.09.2026: in
// Leons ersten HSU-Spielen standen Rechenaufgaben und ein fachlicher Fehler).
// Foto, Herkunft und Spielstatistik bleiben, wie sie sind.
export async function onRequestPut(context) {
  return mitSpeicherwache(() => spielNachbessern(context));
}

async function spielNachbessern(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  const elternGeheim = geheimFuer(env, "eltern");
  if (!elternGeheim || !(await ausweisGueltig(request, elternGeheim, env)))
    return json(401, { ok: false, fehler: "Nachbessern geht nur mit dem Eltern-Code." });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json(400, { ok: false, fehler: "Welches Spiel denn?" });
  const roh = await env.PAUL_KV.get(SPIEL(id));
  if (!roh) return json(404, { ok: false, fehler: "Das Spiel gibt es nicht mehr." });

  let neu = {};
  try { neu = await request.json(); } catch (e) {}
  const auf = Array.isArray(neu.aufgaben) ? neu.aufgaben : null;
  if (!auf || auf.length < 5) return json(400, { ok: false, fehler: "Mindestens fünf Aufgaben." });
  for (let i = 0; i < auf.length; i++) {
    const a = auf[i] || {};
    if (!String(a.frage || "").trim() || String(a.richtig == null ? "" : a.richtig).trim() === "")
      return json(400, { ok: false, fehler: `Aufgabe ${i + 1} ohne Frage oder Lösung.` });
    if ((a.art || "wahl") === "wahl" && (!Array.isArray(a.antworten) || a.antworten.indexOf(a.richtig) < 0))
      return json(400, { ok: false, fehler: `Bei Aufgabe ${i + 1} fehlt die Lösung in der Auswahl.` });
  }

  const spiel = JSON.parse(roh);
  spiel.aufgaben = auf;
  if (typeof neu.titel === "string" && neu.titel.trim()) spiel.titel = neu.titel.trim();
  if (typeof neu.begruessung === "string") spiel.begruessung = neu.begruessung;
  spiel.nachgebessert = new Date().toISOString();
  await schreiben(env, SPIEL(id), JSON.stringify(spiel));

  const kind = kindAus(request);
  const liste = await listeHolen(env, kind);
  const eintrag = liste.find((e) => e.id === id);
  if (eintrag) {
    eintrag.aufgaben = auf.length;
    eintrag.titel = spiel.titel;
    await schreiben(env, LISTE(kind), JSON.stringify(liste));
  }
  return json(200, { ok: true, id, aufgaben: auf.length });
}

export async function onRequestDelete(context) {
  return mitSpeicherwache(() => spielWegwerfen(context));
}

async function spielWegwerfen(context) {
  const { request, env } = context;
  const wache = await wacheOk(request, env);
  if (wache) return wache;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json(400, { ok: false, fehler: "Welches Spiel denn?" });

  const kind = kindAus(request);
  await wegwerfen(env, SPIEL(id));
  const liste = (await listeHolen(env, kind)).filter((e) => e.id !== id);
  await schreiben(env, LISTE(kind), JSON.stringify(liste));
  return json(200, { ok: true, spiele: liste });
}

async function listeHolen(env, kind) {
  try {
    const roh = await env.PAUL_KV.get(LISTE(kind || "paul"));
    return roh ? JSON.parse(roh) : [];
  } catch (e) { return []; }
}

async function wacheOk(request, env, elternDuerfen) {
  if (!env.PAUL_CODE) return json(500, { ok: false, fehler: "Auf dem Server fehlt der Zugangscode." });
  if (!env.PAUL_KV)   return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  const elternGeheim = elternDuerfen ? geheimFuer(env, "eltern") : null;
  if (elternGeheim && (await ausweisGueltig(request, elternGeheim, env))) return null;
  if (!(await ausweisGueltig(request, geheimFuer(env, kindAus(request)), env)))
    return json(401, { ok: false, fehler: "Bitte melde dich mit deinem Code an." });
  return null;
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

// Wird von spiel-bauen.js benutzt.
// Kalibriert an der Anthropic-Console (5.9.2026: 4,32 $ für 29 Bauten).
// Die Console bleibt die Wahrheit - das hier gibt nur ein Gefühl dafür,
// welches Spiel wie ins Gewicht fällt.
// Listenpreise Claude Opus 5 (nachgeschlagen 6.9.2026):
// Eingang 5 $, Ausgang 25 $, Cache schreiben 6,25 $, Cache lesen 0,50 $ je Mio.
const PREIS_JE_MIO = { ein: 5, aus: 25, cache_lesen: 0.5, cache_schreiben: 6.25 };

function kostenSchaetzen(u) {
  if (!u) return null;
  const ein = (u.input_tokens || 0), aus = (u.output_tokens || 0);
  const cSchreib = u.cache_creation_input_tokens || 0;
  const cLesen = u.cache_read_input_tokens || 0;
  const d = (ein * PREIS_JE_MIO.ein + aus * PREIS_JE_MIO.aus +
             cSchreib * PREIS_JE_MIO.cache_schreiben + cLesen * PREIS_JE_MIO.cache_lesen) / 1e6;
  return { ein, aus, cache_neu: cSchreib, cache_gelesen: cLesen, dollar: Math.round(d * 10000) / 10000 };
}

export async function spielSichern(env, spiel, seiten, kind, quelle, verbrauch) {
  const id = neueId();
  const eintrag = {
    id,
    // Aus welchem Themenfeld dieses Spiel stammt. Damit weiss die Oberflaeche,
    // dass zu diesem Thema schon etwas Fertiges bereitliegt, und baut nicht
    // jedes Mal neu - 90 Sekunden Warten fuer nichts.
    quelle: quelle || "",
    verbrauch: kostenSchaetzen(verbrauch),
    modell: spiel.modell || null,
    titel: spiel.titel,
    fach: spiel.fach,
    thema: spiel.thema,
    welt: spiel.welt,
    spielart: spiel.spielart,
    aufgaben: (spiel.aufgaben || []).length,
    erzeugt: spiel.erzeugt,
  };

  // Das Foto bleibt beim Spiel liegen - Paul leitet daraus später weitere ab.
  const voll = Object.assign({}, spiel, { id, seiten: seiten || [] });

  await env.PAUL_KV.put(SPIEL(id), JSON.stringify(voll));

  let liste = [];
  try {
    const roh = await env.PAUL_KV.get(LISTE(kind || "paul"));
    liste = roh ? JSON.parse(roh) : [];
  } catch (e) {}
  liste.unshift(eintrag);
  await env.PAUL_KV.put(LISTE(kind || "paul"), JSON.stringify(liste.slice(0, 200)));

  return id;
}

// Schreiben, ohne dass ein voller Speicher den Worker abwuergt.
//
// Am 14.09.2026 nahm der KV ab 13:54 UTC nichts mehr an. Jedes put hier warf,
// und weil es ungefangen war, bekam das Kind die nackte Cloudflare-Seite
// "error code: 1101" zu sehen - dieselbe Sackgasse, die Helena in wjj9vuza7x
// gemeldet hat. Lesen ging die ganze Zeit weiter, das Spiel lief also
// scheinbar normal und nur das Wegwerfen und das Mitschreiben brachen ab.
//
// Jetzt kommt ein ehrlicher Satz zurueck. Er sagt NICHT "gespeichert", denn
// das waere gelogen - genau wie in melden.js.
class SpeicherVoll extends Error {}

async function schreiben(env, schluessel, wert) {
  try { await env.PAUL_KV.put(schluessel, wert); }
  catch (e) { throw new SpeicherVoll(String((e && e.message) || e)); }
}

async function wegwerfen(env, schluessel) {
  try { await env.PAUL_KV.delete(schluessel); }
  catch (e) { throw new SpeicherVoll(String((e && e.message) || e)); }
}

async function mitSpeicherwache(arbeit) {
  try { return await arbeit(); }
  catch (e) {
    if (!(e instanceof SpeicherVoll)) throw e;
    return json(503, { ok: false, speicherVoll: true,
      fehler: "Der Speicher nimmt gerade nichts an. Das liegt an mir, nicht an " +
              "dir. Dein Spiel ist nicht weg - probier es später noch einmal." });
  }
}

function neueId() {
  const zeichen = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  const zufall = crypto.getRandomValues(new Uint8Array(10));
  for (const b of zufall) s += zeichen[b % zeichen.length];
  return s;
}
