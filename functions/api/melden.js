// Ein Gespräch zwischen Kind und Werkstatt.
//
// Paul meldet nicht nur - er bekommt Antwort, kann nachfragen, und sagt am
// Ende selbst, ob es passt. Ein "Danke" wäre eine Sackgasse: Das Kind
// erführe nie, ob und wie sein Hinweis ankam.
//
// POST   /api/melden                  -> neuer Faden (Kind)
// POST   /api/melden {id, text}       -> Antwort im Faden (Kind ODER Eltern)
// GET    /api/melden                  -> alle Fäden (Eltern)
// GET    /api/melden?meine=1&kind=... -> eigene Fäden (Kind)
// GET    /api/melden?bild=<id>        -> ein Bild
// POST   /api/melden {id, status}     -> "passt jetzt" (Kind) / erledigt (Eltern)
// DELETE /api/melden?id=...           -> wegräumen (Eltern)

import { ausweisGueltig, geheimFuer, brauchtAusweis } from "./_riegel.js";
import { antwortErzeugen } from "./_antwort.js";

// Damit ein offener Bereich nicht zur Kostenfalle wird: hoechstens so viele
// sofortige Antworten je Kind und Stunde. Danach bleibt die Meldung normal
// liegen - nur ohne Sofortantwort.
const ANTWORTEN_PRO_STUNDE = 12;

async function darfAntworten(env, kind) {
  const stunde = new Date().toISOString().slice(0, 13);
  const schluessel = "antwortzaehler:" + kind + ":" + stunde;
  let n = 0;
  try { n = Number(await env.PAUL_KV.get(schluessel)) || 0; } catch (e) {}
  if (n >= ANTWORTEN_PRO_STUNDE) return false;
  try { await env.PAUL_KV.put(schluessel, String(n + 1), { expirationTtl: 7200 }); } catch (e) {}
  return true;
}

// Die Werkstatt antwortet selbst - im selben Aufruf, damit das Kind die
// Antwort sofort sieht. Schlaegt es fehl (kein Schluessel, Modell nicht
// erreichbar, Grenze erreicht), bleibt wenigstens die Eingangsbestaetigung.
async function sofortAntworten(env, faden, kind, text, bild) {
  const nr = faden.verlauf.length;
  let antwort = null;
  if (await darfAntworten(env, kind)) {
    antwort = await antwortErzeugen(env, {
      kind, text, bild, seite: faden.seite, geraet: faden.geraet,
      verlauf: faden.verlauf.slice(0, -1),
    });
  }
  const eintrag = antwort
    ? { von: "werkstatt", text: antwort, zeit: new Date().toISOString(),
        hatBild: false, nr, vonKi: true }
    : { von: "werkstatt", nr, hatBild: false, zeit: new Date().toISOString(),
        automatisch: true,
        text: "Angekommen! \u2705 Deine Meldung liegt in der Werkstatt.\n\n" +
              "Gerade konnte ich dir nicht gleich richtig antworten \u2013 aber sie ist da " +
              "und geht nicht verloren. Schau spaeter nochmal in diesen Faden." };
  faden.verlauf.push(eintrag);
  faden.status = "beantwortet";
  faden.ungelesenKind = false;   // das Kind sieht die Antwort ja sofort
  return eintrag;
}

const KINDER = ["paul", "leon", "helena"];
const LISTE = "meldungen";
const MAX = 200;
const MAX_BILD = 900 * 1024;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  let daten = {};
  try { daten = await request.json(); } catch (e) {}

  const kind = KINDER.includes(String(daten.kind || "").toLowerCase())
    ? String(daten.kind).toLowerCase() : null;

  // Wer schreibt? Ein Kind aus seinem Bereich, oder die Werkstatt mit dem
  // Elterncode.
  //
  // Bis zum 07.09.2026 wurde hier fuer JEDES Kind ein Ausweis verlangt - auch
  // fuer Helena, deren Bereich offen ist. geheimFuer() faellt fuer sie auf
  // PAUL_CODE zurueck, sie haette also Pauls Code gebraucht, um einen Fehler
  // zu melden. Dass es bei ihr trotzdem ging, lag nur an einem Cookie, das
  // zufaellig auf ihrem Handy lag; auf einem frischen Geraet waere sie
  // ausgesperrt gewesen. Jetzt gilt dieselbe Regel wie ueberall sonst.
  const alsEltern = await ausweisGueltig(request, geheimFuer(env, "eltern"), env);
  const alsKind = kind
    ? (!brauchtAusweis(env, kind) || await ausweisGueltig(request, geheimFuer(env, kind), env))
    : false;
  if (!alsEltern && !alsKind) return json(401, { ok: false, fehler: "Nicht angemeldet." });

  let liste = await listeHolen(env);

  /* --- Antwort in einem bestehenden Faden --- */
  if (daten.id) {
    const faden = liste.find((m) => m.id === daten.id);
    if (!faden) return json(404, { ok: false, fehler: "Den Faden gibt es nicht mehr." });

    // Gelesen. Sonst kaeme der rote Punkt nach jedem Seitenwechsel zurueck.
    if (daten.gelesen && alsKind) {
      faden.ungelesenKind = false;
      await liste_speichern(env, liste);
      return json(200, { ok: true });
    }

    // "Passt jetzt" darf nur das Kind sagen - es ist seine Meldung.
    if (daten.status === "passt" && alsKind) {
      faden.status = "erledigt";
      faden.verlauf.push({ von: kind, text: "Passt jetzt! 👍", zeit: new Date().toISOString() });
      faden.ungelesenKind = false;
      await liste_speichern(env, liste);
      return json(200, { ok: true, faden });
    }

    const text = String(daten.text || "").trim().slice(0, 1500);
    const bild = typeof daten.bild === "string" ? daten.bild : "";
    if (!text && !bild) return json(400, { ok: false, fehler: "Die Nachricht war leer." });
    if (bild.length > MAX_BILD) return json(400, { ok: false, fehler: "Das Bild ist zu groß." });

    // Eltern/Werkstatt antworten als "werkstatt", das Kind unter seinem Namen.
    const von = alsKind && (!alsEltern || daten.alsKind) ? kind : "werkstatt";
    const nr = faden.verlauf.length;
    if (bild) await env.PAUL_KV.put("meldung-bild:" + faden.id + ":" + nr, bild);

    faden.verlauf.push({ von, text, zeit: new Date().toISOString(), hatBild: !!bild, nr });
    faden.status = von === "werkstatt" ? "beantwortet" : "offen";
    // Das Kind soll sehen, dass etwas Neues da ist.
    faden.ungelesenKind = von === "werkstatt";

    // Schreibt das KIND, wird auch hier sofort geantwortet - genau wie in
    // einem Chat. Sonst waere die erste Antwort schnell und jede weitere
    // Rueckfrage laege wieder tagelang.
    let antwort = null;
    if (von !== "werkstatt") {
      antwort = await sofortAntworten(env, faden, von, text, bild);
    }
    await liste_speichern(env, liste);
    return json(200, { ok: true, faden, antwort });
  }

  /* --- Ein neuer Faden --- */
  if (!alsKind) return json(401, { ok: false, fehler: "Nur die Kinder melden." });

  const text = String(daten.text || "").trim().slice(0, 1500);
  const bild = typeof daten.bild === "string" ? daten.bild : "";
  if (!text && !bild) return json(400, { ok: false, fehler: "Die Meldung war leer." });
  if (bild.length > MAX_BILD) return json(400, { ok: false, fehler: "Das Bild ist zu groß." });

  const id = neueId();
  if (bild) await env.PAUL_KV.put("meldung-bild:" + id + ":0", bild);

  liste.unshift({
    id, kind,
    zeit: new Date().toISOString(),
    art: daten.art === "wunsch" ? "wunsch" : "problem",
    wo: String(daten.wo || "").slice(0, 200),
    titel: String(daten.titel || "").slice(0, 120),
    geraet: String(daten.geraet || "").slice(0, 80),
    status: "offen",
    ungelesenKind: false,
    verlauf: [{ von: kind, text, zeit: new Date().toISOString(), hatBild: !!bild, nr: 0 }],
  });

  // Sofort antworten - noch in diesem Aufruf, damit das Kind die Antwort
  // direkt im Fenster sieht und nicht warten muss.
  const neuerFaden = liste[0];
  const antwort = await sofortAntworten(env, neuerFaden, kind, text, bild);
  await liste_speichern(env, liste);
  return json(200, { ok: true, id, antwort, faden: neuerFaden });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  const url = new URL(request.url);

  // Das Kind holt seine eigenen Fäden - damit es Antworten lesen kann.
  const meine = url.searchParams.get("meine") === "1";
  const kind = String(url.searchParams.get("kind") || "").toLowerCase();
  if (meine) {
    if (!KINDER.includes(kind)) return json(400, { ok: false, fehler: "Wer denn?" });
    // Gleiche Regel wie beim Schreiben: Wo der Bereich offen ist, braucht es
    // keinen Ausweis. Sonst haette Helena ihre eigenen Meldungen nicht lesen
    // koennen - genau das, was sie sich gewuenscht hat.
    if (brauchtAusweis(env, kind) && !(await ausweisGueltig(request, geheimFuer(env, kind), env)))
      return json(401, { ok: false, fehler: "Nicht angemeldet." });
    const liste = await listeHolen(env);
    const meins = liste.filter((m) => m.kind === kind);

    // Sein eigenes Bild darf das Kind sehen - aber nur aus einem Faden, der
    // ihm auch gehoert. Die Kennung <id>:<nr> wird dafuer aufgetrennt.
    const eigenesBild = url.searchParams.get("bild");
    if (eigenesBild) {
      const fadenId = String(eigenesBild).split(":")[0];
      if (!meins.some((m) => m.id === fadenId))
        return json(403, { ok: false, fehler: "Das ist nicht deins." });
      const d = await env.PAUL_KV.get("meldung-bild:" + eigenesBild);
      if (!d) return json(404, { ok: false, fehler: "Kein Bild dabei." });
      return json(200, { ok: true, bild: d });
    }
    return json(200, { ok: true, meldungen: meins });
  }

  if (!(await ausweisGueltig(request, geheimFuer(env, "eltern"), env)))
    return json(401, { ok: false, fehler: "Bitte mit dem Eltern-Code anmelden." });

  const bild = url.searchParams.get("bild");
  if (bild) {
    const d = await env.PAUL_KV.get("meldung-bild:" + bild);
    if (!d) return json(404, { ok: false, fehler: "Kein Bild dabei." });
    return json(200, { ok: true, bild: d });
  }
  return json(200, { ok: true, meldungen: await listeHolen(env) });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  if (!(await ausweisGueltig(request, geheimFuer(env, "eltern"), env)))
    return json(401, { ok: false, fehler: "Bitte mit dem Eltern-Code anmelden." });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json(400, { ok: false, fehler: "Welche Meldung denn?" });
  const liste = await listeHolen(env);
  const faden = liste.find((m) => m.id === id);
  await liste_speichern(env, liste.filter((m) => m.id !== id));
  if (faden) for (let i = 0; i < (faden.verlauf || []).length; i++) {
    try { await env.PAUL_KV.delete("meldung-bild:" + id + ":" + i); } catch (e) {}
  }
  return json(200, { ok: true });
}

async function listeHolen(env) {
  try {
    const roh = await env.PAUL_KV.get(LISTE);
    const l = roh ? JSON.parse(roh) : [];
    // Ältere Einträge hatten noch keinen Verlauf - nachziehen, damit
    // nichts verlorengeht.
    return l.map((m) => m.verlauf ? m : Object.assign({}, m, {
      status: m.erledigt ? "erledigt" : "offen",
      verlauf: [{ von: m.kind, text: m.text || "", zeit: m.zeit, hatBild: !!m.hatBild, nr: 0 }],
    }));
  } catch (e) { return []; }
}

async function liste_speichern(env, liste) {
  await env.PAUL_KV.put(LISTE, JSON.stringify(liste.slice(0, MAX)));
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
