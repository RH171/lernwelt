// Wer spielt gerade? Damit nichts ausgerollt wird, während ein Kind übt.
//
// POST /api/aktiv   {kind:"leon"}            -> "ich bin da" (alle 3 Minuten)
// POST /api/aktiv   {kind:"leon", weg:true}  -> Seite geschlossen
// GET  /api/aktiv                            -> {frei:true|false, seit:<Sekunden>}
//
// Die GET-Antwort nennt bewusst KEINE Namen. Sie sagt nur, ob gerade jemand
// da ist - das braucht der Wächter auf Dennys Rechner, und mehr darf offen im
// Netz nicht stehen (siehe Regel: Namen nur nach Login).
//
// Warum nicht sekundengenau: Jeder Puls ist ein Schreibvorgang im KV, und
// davon gibt es am Tag nur begrenzt viele. Alle 3 Minuten reicht vollkommen -
// wir wollen wissen, ob jemand spielt, nicht wo die Maus steht.

import { ausweisGueltig, geheimFuer, brauchtAusweis } from "./_riegel.js";

const KINDER = ["paul", "leon", "helena"];
const SCHLUESSEL = (kind) => "aktiv:" + kind;

// Ein Update wartet. Denny am 07.09.2026: "Du koenntest auch eine Push
// Benachrichtung in der APP senden, dass Du ein update machen moechtest und
// fragst, ob du sie kurz kicken darfst." Besser als beides, was es vorher gab:
// blockieren, bis irgendwann niemand mehr spielt - oder einfach ausrollen.
const WUNSCH = "ausrollen:wunsch";
const WUNSCH_GILT = 900;          // 15 Minuten, dann verfaellt die Frage

// Nach so vielen Sekunden ohne Puls gilt jemand als weg. Etwas mehr als zwei
// Pulsabstände, damit ein verschlucktes Signal niemanden verschwinden lässt.
const STILLE_BIS_WEG = 480;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  let daten = {};
  try { daten = await request.json(); } catch (e) {}
  const kind = String(daten.kind || "").toLowerCase();
  if (!KINDER.includes(kind)) return json(400, { ok: false, fehler: "Welches Kind denn?" });

  // Liegt der Bereich des Kindes hinter dem Riegel, muss der Ausweis stimmen.
  // Helenas Bereich ist offen - sie kann sich gar nicht anmelden, also nehmen
  // wir dort ohne Ausweis an. Sobald HELENA_CODE gesetzt und ihr Bereich in
  // GESCHUETZT aufgenommen wird, gilt auch fuer sie der Ausweis.
  if (brauchtAusweis(env, kind) && !(await ausweisGueltig(request, geheimFuer(env, kind), env)))
    return json(401, { ok: false, fehler: "Nicht angemeldet." });

  if (daten.weg) {
    // Sauber abgemeldet - dann muss niemand die volle Stille abwarten.
    try { await env.PAUL_KV.delete(SCHLUESSEL(kind)); } catch (e) {}
    return json(200, { ok: true });
  }

  // Das Kind hat zugestimmt, dass jetzt aktualisiert werden darf.
  if (daten.updateOk) {
    try {
      await env.PAUL_KV.delete(SCHLUESSEL(kind));
      // Kurze Schonzeit, damit der Puls nicht sofort wieder anspringt und
      // das Ausrollen erneut blockiert.
      await env.PAUL_KV.put("pause:" + kind, "1", { expirationTtl: 180 });
    } catch (e) {}
    return json(200, { ok: true, danke: true });
  }

  // Waehrend der Schonzeit nach einem Ja wird kein Puls angenommen.
  try { if (await env.PAUL_KV.get("pause:" + kind)) return json(200, { ok: true, pausiert: true }); }
  catch (e) {}

  await env.PAUL_KV.put(SCHLUESSEL(kind), String(Date.now()),
                        { expirationTtl: STILLE_BIS_WEG + 120 });

  // Wartet ein Update? Dann sagt die Antwort es der Seite, und die fragt das
  // Kind. So erfaehrt es davon, ohne dass jemand extra nachschauen muss.
  let updateWartet = false;
  try { updateWartet = !!(await env.PAUL_KV.get(WUNSCH)); } catch (e) {}
  return json(200, { ok: true, updateWartet });
}

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  // ?wunsch=1 heisst: Es soll ausgerollt werden. Die Seiten fragen daraufhin
  // beim naechsten Puls nach - hoechstens WUNSCH_GILT Sekunden lang.
  const url = new URL(request.url);
  if (url.searchParams.get("wunsch") === "1") {
    try { await env.PAUL_KV.put(WUNSCH, String(Date.now()), { expirationTtl: WUNSCH_GILT }); } catch (e) {}
  } else if (url.searchParams.get("wunsch") === "0") {
    try { await env.PAUL_KV.delete(WUNSCH); } catch (e) {}
  }

  let juengste = 0;
  for (const kind of KINDER) {
    const roh = await env.PAUL_KV.get(SCHLUESSEL(kind));
    const t = roh ? Number(roh) : 0;
    if (t > juengste) juengste = t;
  }
  const seit = juengste ? Math.round((Date.now() - juengste) / 1000) : null;
  const frei = seit === null || seit > STILLE_BIS_WEG;
  let gefragt = false;
  try { gefragt = !!(await env.PAUL_KV.get(WUNSCH)); } catch (e) {}
  return json(200, { ok: true, frei, seit, stilleBisWeg: STILLE_BIS_WEG, gefragt });
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
