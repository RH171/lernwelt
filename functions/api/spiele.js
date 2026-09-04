// Pauls gebaute Spiele: auflisten, einzeln holen, löschen.
//
// GET    /api/spiele          -> Liste (ohne Foto, damit sie klein bleibt)
// GET    /api/spiele?id=...   -> ein Spiel samt Foto
// DELETE /api/spiele?id=...   -> Spiel wegwerfen
//
// Liegt im selben KV wie Pauls Fortschritt, aber unter eigenem Präfix
// "werkstatt:" - der Fortschritt unter "paul-blob" wird nicht berührt.

import { ausweisGueltig } from "./_riegel.js";

const LISTE = "werkstatt:liste:paul";
const SPIEL = (id) => "werkstatt:spiel:" + id;

export async function onRequestGet(context) {
  const { request, env } = context;
  const wache = await wacheOk(request, env);
  if (wache) return wache;

  const id = new URL(request.url).searchParams.get("id");

  if (id) {
    const roh = await env.PAUL_KV.get(SPIEL(id));
    if (!roh) return json(404, { ok: false, fehler: "Das Spiel gibt es nicht mehr." });
    return json(200, { ok: true, spiel: JSON.parse(roh) });
  }

  return json(200, { ok: true, spiele: await listeHolen(env) });
}

// POST /api/spiele  { id, richtig, gesamt }
// Hält fest, wann ein Spiel zuletzt gespielt wurde und wie es lief.
// Grundlage fürs verteilte Wiederholen: was länger her ist und schlechter
// lief, wird zuerst wieder vorgeschlagen.
export async function onRequestPost(context) {
  const { request, env } = context;
  const wache = await wacheOk(request, env);
  if (wache) return wache;

  let daten = {};
  try { daten = await request.json(); } catch (e) {}
  const id = String(daten.id || "");
  if (!id) return json(400, { ok: false, fehler: "Welches Spiel denn?" });

  const richtig = Number(daten.richtig) || 0;
  const gesamt = Number(daten.gesamt) || 0;

  const liste = await listeHolen(env);
  const eintrag = liste.find((e) => e.id === id);
  if (!eintrag) return json(404, { ok: false, fehler: "Das Spiel gibt es nicht mehr." });

  eintrag.zuletztGespielt = new Date().toISOString();
  eintrag.malGespielt = (eintrag.malGespielt || 0) + 1;
  if (gesamt > 0) eintrag.letzteQuote = Math.round((richtig / gesamt) * 100);

  await env.PAUL_KV.put(LISTE, JSON.stringify(liste));
  return json(200, { ok: true, spiele: liste });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const wache = await wacheOk(request, env);
  if (wache) return wache;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json(400, { ok: false, fehler: "Welches Spiel denn?" });

  await env.PAUL_KV.delete(SPIEL(id));
  const liste = (await listeHolen(env)).filter((e) => e.id !== id);
  await env.PAUL_KV.put(LISTE, JSON.stringify(liste));
  return json(200, { ok: true, spiele: liste });
}

async function listeHolen(env) {
  try {
    const roh = await env.PAUL_KV.get(LISTE);
    return roh ? JSON.parse(roh) : [];
  } catch (e) { return []; }
}

async function wacheOk(request, env) {
  if (!env.PAUL_CODE) return json(500, { ok: false, fehler: "Auf dem Server fehlt der Zugangscode." });
  if (!env.PAUL_KV)   return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  if (!(await ausweisGueltig(request, env.PAUL_CODE, env)))
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
export async function spielSichern(env, spiel, seiten) {
  const id = neueId();
  const eintrag = {
    id,
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
    const roh = await env.PAUL_KV.get(LISTE);
    liste = roh ? JSON.parse(roh) : [];
  } catch (e) {}
  liste.unshift(eintrag);
  await env.PAUL_KV.put(LISTE, JSON.stringify(liste.slice(0, 200)));

  return id;
}

function neueId() {
  const zeichen = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  const zufall = crypto.getRandomValues(new Uint8Array(10));
  for (const b of zufall) s += zeichen[b % zeichen.length];
  return s;
}
