/* Prüf-Reiter (14.10.2026) - siehe _pruefreiter.js
 *
 * GET  /api/pruefreiter?kind=paul               -> offene Stellen im Bestand (Blätter ab AB)
 * GET  /api/pruefreiter?kind=paul&blatt=<id>    -> offene Stellen dieses einen Blattes (nach dem Hochladen)
 *      -> { ok, stellen: [ohne Lösung], blaetter: <Zahl der Blätter mit Stellen> }
 * GET  /api/pruefreiter?kind=paul&eltern=1      -> (nur Elternausweis) was Paul mit "Stimmt doch so"
 *      abgelegt hat, zur Kontrolle - hier MIT der nachgerechneten Lösung
 * POST /api/pruefreiter { kind, stelle, aktion: "pruefen"|"stimmt"|"gesehen", antwort? }
 *      -> pruefen: { ok, richtig, satz? , tipp? }   (falsch: kein Schreibvorgang)
 *      -> stimmt/gesehen: { ok }                     (ein Schreibvorgang)
 *
 * Nur Paul (Dennys Auftrag). Für andere Kinder antwortet der Weg leer, damit
 * eine Seite, die ihn trotzdem fragt, einfach nichts zeigt.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { stoffLesen, kindOk } from "./_schulstoff.js";
import { vorlagenLesen } from "./_lehrervorlagen.js";
import { KINDER_MIT_PRUEFREITER, offeneStellen, oeffentlich, stellenFuerBlatt, verbesserungPruefen,
         zustandLesen, zustandSchreiben } from "./_pruefreiter.js";

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

async function istEltern(request, env) {
  const g = geheimFuer(env, "eltern");
  return !!g && (await ausweisGueltig(request, g, env));
}
async function darfRein(request, env, kind) {
  if (await istEltern(request, env)) return true;
  const g = geheimFuer(env, kind);
  return !!g && (await ausweisGueltig(request, g, env));
}
/* Bestand: 3 Monate reichen ab dem 06.10.2026 bis Ende Dezember; danach
   zählt sowieso nur, was ab AB liegt. Ein einzelnes Blatt kann ein altes
   Datum tragen - dann alle Monate (nur Lesen). */
const MONATE_BESTAND = 4;
const MONATE_BLATT = 14;

export async function onRequestGet(context) {
  const { request, env } = context;
  let p;
  try { p = new URL(request.url).searchParams; } catch (e) { p = new URLSearchParams(); }
  const kind = String(p.get("kind") || "").toLowerCase();
  if (!kindOk(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });
  if (!KINDER_MIT_PRUEFREITER.includes(kind)) return json(200, { ok: true, stellen: [], blaetter: 0 });

  const blatt = String(p.get("blatt") || "").slice(0, 40);
  const e = await stoffLesen(env, kind, blatt ? MONATE_BLATT : MONATE_BESTAND);
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });
  const vorlagen = await vorlagenLesen(env, kind);
  const zustand = await zustandLesen(env, kind);

  if (p.get("eltern") === "1") {
    if (!(await istEltern(request, env))) return json(401, { ok: false, fehler: "Nur für Eltern." });
    const alle = {};
    for (const b of e.eintraege || []) for (const s of stellenFuerBlatt(b, vorlagen)) alle[s.id] = s;
    const liste = Object.keys(zustand.s).filter((id) => zustand.s[id].z === "stimmt").map((id) => {
      const s = alle[id], z = zustand.s[id];
      return { id, wann: z.t || "", blatt: s ? s.blatt : { id: id.split(":")[0] }, aufgabe: s ? s.aufgabe : "",
               du: s ? s.du : (z.du || ""), richtig: s && s.soll != null ? (Array.isArray(s.soll) ? s.soll.join(", ") : String(s.soll)) : "",
               art: s ? s.art : "" };
    });
    const offen = offeneStellen(e.eintraege, vorlagen, zustand);
    return json(200, { ok: true, stimmtDoch: liste, offen: offen.length });
  }

  const offen = offeneStellen(e.eintraege, vorlagen, zustand, blatt || null);
  return json(200, { ok: true, stellen: offen.map(oeffentlich), blaetter: new Set(offen.map((s) => s.blatt.id)).size });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let d = {};
  try { d = await request.json(); } catch (e) { return json(400, { ok: false, fehler: "Das kam nicht richtig an." }); }
  const kind = String(d.kind || "").toLowerCase();
  if (!kindOk(kind) || !KINDER_MIT_PRUEFREITER.includes(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });
  const id = String(d.stelle || "").slice(0, 80);
  const aktion = String(d.aktion || "");
  if (!/^[a-z0-9]+:[rpl]:[a-z0-9]+$/.test(id)) return json(400, { ok: false, fehler: "Unbekannte Stelle." });
  if (!["pruefen", "stimmt", "gesehen"].includes(aktion)) return json(400, { ok: false, fehler: "Unbekannte Aktion." });

  const e = await stoffLesen(env, kind, MONATE_BLATT);
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });
  const blattId = id.split(":")[0];
  const blatt = (e.eintraege || []).find((b) => b.id === blattId);
  const vorlagen = await vorlagenLesen(env, kind);
  const s = blatt ? stellenFuerBlatt(blatt, vorlagen).find((x) => x.id === id) : null;
  if (!s) return json(404, { ok: false, fehler: "Diese Stelle gibt es nicht mehr." });

  const zustand = await zustandLesen(env, kind);
  if (zustand.s[id]) return json(200, { ok: true, schon: true, richtig: zustand.s[id].z === "richtig" });

  const jetzt = new Date().toISOString();
  if (aktion === "gesehen") {
    if (s.art !== "lehrerin") return json(400, { ok: false, fehler: "Diese Stelle wird verbessert, nicht nur angesehen." });
    zustand.s[id] = { z: "gesehen", t: jetzt };
  } else if (aktion === "stimmt") {
    if (s.art === "lehrerin") return json(400, { ok: false, fehler: "Das hat deine Lehrerin verbessert." });
    zustand.s[id] = { z: "stimmt", t: jetzt, du: s.du };
  } else {
    if (s.art === "lehrerin") return json(400, { ok: false, fehler: "Das hat deine Lehrerin verbessert." });
    const r = verbesserungPruefen(s, d.antwort);
    if (!r.richtig) return json(200, { ok: true, richtig: false, tipp: r.tipp });
    zustand.s[id] = { z: "richtig", t: jetzt };
    try { await zustandSchreiben(env, kind, zustand); }
    catch (x) { return json(200, { ok: true, richtig: true, satz: r.satz, gemerkt: false }); }
    return json(200, { ok: true, richtig: true, satz: r.satz, gemerkt: true });
  }
  try { await zustandSchreiben(env, kind, zustand); }
  catch (x) { return json(503, { ok: false, fehler: "Ich konnte es mir gerade nicht merken. Probier es später nochmal." }); }
  return json(200, { ok: true });
}
