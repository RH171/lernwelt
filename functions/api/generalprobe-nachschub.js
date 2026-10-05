/* Geschichten-Nachschub fuer Pauls Generalprobe "D | Lesen" (05.10.2026).
 *
 * Denny, 05.10.2026: Die Werkstatt schreibt selbst nach, sobald Paul weniger
 * als 4 ungelesene Geschichten hat. Die festen Geschichten stehen weiter in
 * paul/generalprobe-geschichten.js; die vom Server kommen dazu und werden erst
 * gezeigt, wenn die festen gelesen sind.
 *
 *   GET  /api/generalprobe-nachschub?kind=paul
 *        -> { ok, geschichten:[...], gelesen:[ids aus Pauls Speicher], heute:{tag, versuche, neu}, deckel }
 *        Nur lesen. Auch fuer ./werkstatt.sh geschichten-vorrat paul.
 *   POST /api/generalprobe-nachschub  { kind, fest:[{id,titel}], gelesen:[ids] }
 *        -> { ok, ungelesen, erzeugt, grund, geschichte? }
 *        Die Seite schickt das beim Aufruf im Hintergrund. Sind weniger als 4
 *        ungelesen, schreibt die Werkstatt EINE neue Geschichte und prueft sie
 *        mechanisch (_nachschub-pruefen.js). Was eine Regel reisst, wird verworfen.
 *
 * Warum der Lauf im Request UND in waitUntil haengt: Ein Lauf dauert rund 26 s
 * (gemessen 05.10.2026). waitUntil allein darf nur 30 s nach dem Antworten
 * weiterlaufen (Cloudflare-Doku "Context", 10/2026) - zu knapp. Die Seite
 * wartet deshalb auf die Antwort, waehrend Paul liest; schliesst er die Seite,
 * traegt waitUntil den Lauf noch 30 s weiter.
 *
 * KV sparsam (1000 Schreibvorgaenge am Tag fuers ganze Konto): EIN Schluessel
 * "gp-nachschub:paul". Je Versuch ein Schreibvorgang vorher (Zaehler + Sperre),
 * bei Erfolg einer nachher (Geschichte dazu). Deckel je Tag (UTC, wie das
 * KV-Kontingent): 7 Versuche, 5 neue Geschichten -> hoechstens 12 Schreibvorgaenge.
 * Kosten je Lauf rund 0,06 EUR (gemessen 05.10.2026), also hoechstens ~0,40 EUR am Tag.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { anfrageBauen, geschichteAusText, pruefeGeschichte, saeubern } from "./_nachschub-pruefen.js";

const KINDER = ["paul"];                 // nur Paul (Proben-Uebungen nur fuers Kind mit der Probe)
export const SCHLUESSEL = (kind) => "gp-nachschub:" + kind;
export const SCHWELLE = 6;               // weniger als 6 ungelesen -> nachschreiben (Puffer, 05.10.2026)
/* Keine Drosselung (Denny, 05.10.2026: "Wenn Paul am Tag 10 Geschichten machen moechte, dann
 * moechte er 10 machen ... keine Drosselung"). Die Zahlen sind nur eine Notbremse gegen eine
 * Fehlerschleife (60 Versuche = rund 3,60 EUR), kein Kind erreicht sie. */
export const DECKEL = { versuche: 60, neu: 40, vorrat: 80 };
const SPERRE_MS = 120000;                // ein Lauf zur Zeit (zwei Tabs, zwei Geraete)
const heuteUtc = () => new Date().toISOString().slice(0, 10);

async function darf(request, env, kind) {
  return KINDER.includes(kind) && (await ausweisGueltig(request, geheimFuer(env, kind), env));
}

export async function standLesen(env, kind) {
  let s = null;
  try { s = JSON.parse((await env.PAUL_KV.get(SCHLUESSEL(kind))) || "null"); } catch (e) {}
  s = s && typeof s === "object" ? s : {};
  if (!Array.isArray(s.geschichten)) s.geschichten = [];
  if (s.tag !== heuteUtc()) { s.tag = heuteUtc(); s.versuche = 0; s.neu = 0; }
  s.versuche = Number(s.versuche) || 0; s.neu = Number(s.neu) || 0;
  return s;
}

/* "gelesen" aus Pauls synchronisiertem Speicher (paul-sync.js legt seinen
 * localStorage unter "paul-blob" ab, also auch "paul-generalprobe"). */
export async function gelesenAusSpeicher(env, kind) {
  try {
    const blob = JSON.parse((await env.PAUL_KV.get(kind === "paul" ? "paul-blob" : "blob:" + kind)) || "null");
    const roh = blob && typeof blob === "object" ? blob["paul-generalprobe"] : null;   // flach: {schluessel: text}
    const d = typeof roh === "string" ? JSON.parse(roh) : roh;
    return d && Array.isArray(d.gelesen) ? d.gelesen.map(String) : [];
  } catch (e) { return []; }
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const kind = String(new URL(request.url).searchParams.get("kind") || "").toLowerCase();
  if (!(await darf(request, env, kind))) return json(401, { ok: false, fehler: "Nicht angemeldet." });
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  const s = await standLesen(env, kind);
  return json(200, { ok: true, geschichten: s.geschichten, gelesen: await gelesenAusSpeicher(env, kind),
    heute: { tag: s.tag, versuche: s.versuche, neu: s.neu }, deckel: DECKEL, schwelle: SCHWELLE });
}

/* Ruft die Werkstatt einmal auf und prueft. Liefert {geschichte} oder {grund}. */
export async function einmalSchreiben(env, titelBekannt, abrufen = fetch) {
  const r = await abrufen("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify(anfrageBauen(titelBekannt)),
  });
  if (!r.ok) return { grund: "werkstatt " + r.status };
  const j = await r.json();
  const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
  const g = geschichteAusText(text);
  if (!g) return { grund: "kein JSON", usage: j.usage };
  const fehler = pruefeGeschichte(g, titelBekannt);
  if (fehler.length) return { grund: "verworfen: " + fehler.slice(0, 3).join("; "), usage: j.usage };
  return { geschichte: g, usage: j.usage };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let daten = {};
  try { daten = await request.json(); } catch (e) {}
  const kind = String(daten.kind || "").toLowerCase();
  if (!(await darf(request, env, kind))) return json(401, { ok: false, fehler: "Nicht angemeldet." });
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  const fest = (Array.isArray(daten.fest) ? daten.fest : []).slice(0, 200)
    .map((f) => ({ id: String((f && f.id) || "").slice(0, 60), titel: String((f && f.titel) || "").slice(0, 80) })).filter((f) => f.id);
  const gelesen = new Set((Array.isArray(daten.gelesen) ? daten.gelesen : []).slice(0, 400).map((x) => String(x).slice(0, 60)));
  const s = await standLesen(env, kind);
  const ungelesen = fest.filter((f) => !gelesen.has(f.id)).length + s.geschichten.filter((g) => !gelesen.has(g.id)).length;
  const antwort = (extra) => json(200, Object.assign({ ok: true, ungelesen }, extra));

  if (ungelesen >= SCHWELLE) return antwort({ erzeugt: false, grund: "genug Vorrat" });
  if (!env.ANTHROPIC_API_KEY) return antwort({ erzeugt: false, grund: "kein Schluessel" });
  if (s.neu >= DECKEL.neu || s.versuche >= DECKEL.versuche) return antwort({ erzeugt: false, grund: "Tagesdeckel" });
  if (s.laeuft && Date.now() - Number(s.laeuft) < SPERRE_MS) return antwort({ erzeugt: false, grund: "laeuft schon" });

  // Schreibvorgang 1: Versuch zaehlen und sperren - BEVOR Geld ausgegeben wird.
  s.versuche++; s.laeuft = Date.now();
  await env.PAUL_KV.put(SCHLUESSEL(kind), JSON.stringify(s));

  const lauf = (async () => {
    const titel = fest.map((f) => f.titel).concat(s.geschichten.map((g) => g.titel)).filter(Boolean);
    let e;
    try { e = await einmalSchreiben(env, titel); } catch (err) { e = { grund: "abgebrochen" }; }
    if (!e.geschichte) return e;   // verworfen: kein zweiter Schreibvorgang, die Sperre laeuft von selbst ab
    // Schreibvorgang 2: frisch lesen (ein anderer Lauf koennte inzwischen geschrieben haben), anhaengen.
    const neu = await standLesen(env, kind);
    const id = "srv-" + Date.now().toString(36);
    const g = saeubern(e.geschichte, id);
    neu.geschichten.push(g);
    // Vorrat deckeln: zuerst die aeltesten schon gelesenen fallen weg, nie eine ungelesene.
    while (neu.geschichten.length > DECKEL.vorrat) {
      const i = neu.geschichten.findIndex((x) => gelesen.has(x.id));
      if (i < 0) break;
      neu.geschichten.splice(i, 1);
    }
    neu.neu++; neu.laeuft = 0;
    await env.PAUL_KV.put(SCHLUESSEL(kind), JSON.stringify(neu));
    return { geschichte: g };
  })();
  if (context.waitUntil) context.waitUntil(lauf.catch(() => {}));
  const e = await lauf.catch(() => ({ grund: "abgebrochen" }));
  return antwort(e.geschichte ? { erzeugt: true, ungelesen: ungelesen + 1, geschichte: e.geschichte } : { erzeugt: false, grund: e.grund });
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
