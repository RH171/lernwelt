// Paul und Leon melden selbst, was hakt.
//
// POST /api/melden   -> eine Meldung ablegen (Kind angemeldet)
// GET  /api/melden   -> alle Meldungen lesen (Elternzugang)
// DELETE /api/melden?id=... -> erledigte Meldung wegräumen (Elternzugang)
//
// Ein Kind, das mitten im Spiel sagen kann "hier stimmt was nicht", ist die
// beste Fehlerquelle, die es gibt - es sieht Dinge, die im Code nicht
// auffallen. Deshalb ist der Weg dorthin bewusst kurz.

import { ausweisGueltig, geheimFuer } from "./_riegel.js";

const KINDER = ["paul", "leon", "helena"];
const LISTE = "meldungen";
const MAX = 200;
const MAX_BILD = 900 * 1024;     // ~900 kB je Bild, schon verkleinert

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  let daten = {};
  try { daten = await request.json(); } catch (e) {}
  const kind = KINDER.includes(String(daten.kind || "").toLowerCase())
    ? String(daten.kind).toLowerCase() : null;
  if (!kind) return json(400, { ok: false, fehler: "Wer meldet denn?" });

  if (!(await ausweisGueltig(request, geheimFuer(env, kind), env)))
    return json(401, { ok: false, fehler: "Nicht angemeldet." });

  const text = String(daten.text || "").trim().slice(0, 1500);
  const bild = typeof daten.bild === "string" ? daten.bild : "";
  if (!text && !bild) return json(400, { ok: false, fehler: "Die Meldung war leer." });
  if (bild.length > MAX_BILD) return json(400, { ok: false, fehler: "Das Bild ist zu groß." });

  const id = neueId();
  const eintrag = {
    id, kind,
    zeit: new Date().toISOString(),
    text,
    wo: String(daten.wo || "").slice(0, 200),          // welche Seite
    titel: String(daten.titel || "").slice(0, 120),    // was dort lief
    art: daten.art === "wunsch" ? "wunsch" : "problem",
    erledigt: false,
    hatBild: !!bild,
  };

  // Das Bild getrennt ablegen, damit die Liste klein und schnell bleibt.
  if (bild) await env.PAUL_KV.put("meldung-bild:" + id, bild);

  let liste = [];
  try {
    const roh = await env.PAUL_KV.get(LISTE);
    liste = roh ? JSON.parse(roh) : [];
  } catch (e) {}
  liste.unshift(eintrag);
  await env.PAUL_KV.put(LISTE, JSON.stringify(liste.slice(0, MAX)));
  return json(200, { ok: true, id });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  if (!(await ausweisGueltig(request, geheimFuer(env, "eltern"), env)))
    return json(401, { ok: false, fehler: "Bitte mit dem Eltern-Code anmelden." });

  const id = new URL(request.url).searchParams.get("bild");
  if (id) {
    const bild = await env.PAUL_KV.get("meldung-bild:" + id);
    if (!bild) return json(404, { ok: false, fehler: "Kein Bild dabei." });
    return json(200, { ok: true, bild });
  }

  let liste = [];
  try {
    const roh = await env.PAUL_KV.get(LISTE);
    liste = roh ? JSON.parse(roh) : [];
  } catch (e) {}
  return json(200, { ok: true, meldungen: liste });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  if (!(await ausweisGueltig(request, geheimFuer(env, "eltern"), env)))
    return json(401, { ok: false, fehler: "Bitte mit dem Eltern-Code anmelden." });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json(400, { ok: false, fehler: "Welche Meldung denn?" });

  let liste = [];
  try {
    const roh = await env.PAUL_KV.get(LISTE);
    liste = roh ? JSON.parse(roh) : [];
  } catch (e) {}
  const bleibt = liste.filter((m) => m.id !== id);
  await env.PAUL_KV.put(LISTE, JSON.stringify(bleibt));
  try { await env.PAUL_KV.delete("meldung-bild:" + id); } catch (e) {}
  return json(200, { ok: true, uebrig: bleibt.length });
}

function neueId() {
  const zeichen = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (const b of crypto.getRandomValues(new Uint8Array(10))) s += zeichen[b % zeichen.length];
  return s;
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
