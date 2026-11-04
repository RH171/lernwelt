/* Abschluss offener Blaetter im Elternbereich (Schalter "aktuell", Regel F, 04.11.2026, nur Paul)
 *
 * GET  /api/aktuell-abschluss?kind=paul
 *   -> { ok, schalter: "neu"|"alt", faecher: { fach: [Blatt] }, abschluesse, grenze }
 *      Blatt = { id, titel, thema, datum, von, unsicher?, angelegt, offen, geschlossen, gleicherTitel? }
 * GET  /api/aktuell-abschluss?kind=paul&fach=deutsch&letztes=<id>[&thema=<wort>]
 *   -> { ok, liste }   Vorschau: diese Blaetter wuerden geschlossen (noch nichts gespeichert)
 * POST { kind:"paul", fach, probe:"JJJJ-MM-TT", letztes, thema?, bestaetigt:[ids] }
 *   -> rechnet die Vorschau neu; weicht sie von "bestaetigt" ab: 409 mit der neuen Liste.
 *      Sonst wird { fach, probe, letztes, schnitt (Schuldatum des letzten Blatts), thema?, ids, gesetzt }
 *      an aktuell-abschluss:paul angehaengt. Geschlossen: in ids ODER Schuldatum vor schnitt.
 * POST { kind:"paul", aktion:"zuruecknehmen", gesetzt:"<Zeitstempel des Abschlusses>" }
 *   -> nimmt genau diesen Abschluss wieder heraus.
 *
 * Nur mit Elternausweis (wie probenvergleich.js), nur Paul. Das ist die EINZIGE Stelle, die den
 * Abschluss-Schluessel schreibt. Wirkt auf die Kinderseiten nur bei schalter:aktuell = "neu";
 * vorher kann Denny Abschluesse schon setzen, ohne dass sich fuer Paul etwas aendert.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { stoffLesen } from "./_schulstoff.js";
import { termineLesen, berlinHeute } from "./_probentermine.js";
import { notenLesen } from "./_noten.js";
import { probenLage, fachNorm } from "./_wiedervorlage.js";
import { ABSCHLUSS, aktuellAn, abschlussLesen, geschlossenJeFach, offenesBlatt, istGeschlossen, schuldatum, abschlussVorschau } from "./_aktuell.js";

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});

async function elternDa(request, env) {
  const g = geheimFuer(env, "eltern");
  return !!g && (await ausweisGueltig(request, g, env));
}

const DATUM = /^\d{4}-\d{2}-\d{2}$/;

async function lage(env, kind) {
  const e = await stoffLesen(env, kind, 4);
  if (!e.ok) return { ok: false, fehler: e.fehler || "Der Speicher ist gerade nicht da." };
  const blaetter = e.eintraege.filter((b) => b && b.id);
  const heute = berlinHeute(new Date());
  const { grenze } = probenLage((await termineLesen(env, kind)) || [], (await notenLesen(env, kind)) || [], heute);
  const abschluss = await abschlussLesen(env, kind);
  return { ok: true, blaetter, grenze, abschluss, zu: geschlossenJeFach(abschluss) };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!(await elternDa(request, env))) return json(401, { ok: false, fehler: "Bitte im Elternbereich anmelden." });
  const u = new URL(request.url);
  const kind = String(u.searchParams.get("kind") || "").toLowerCase();
  if (kind !== "paul") return json(400, { ok: false, fehler: "Nur für Paul." });
  const l = await lage(env, kind);
  if (!l.ok) return json(503, l);
  const fach = fachNorm(u.searchParams.get("fach") || "");
  const letztes = String(u.searchParams.get("letztes") || "");
  if (fach && letztes) {
    const v = abschlussVorschau(l.blaetter, fach, letztes, u.searchParams.get("thema") || "", l.zu[fach]);
    return json(v.ok ? 200 : 400, v);
  }
  const faecher = {};
  for (const b of l.blaetter) {
    if (b.sichtbar === false) continue;
    const f = fachNorm(b.fach);
    if (!f) continue;
    const sd = schuldatum(b);
    (faecher[f] = faecher[f] || []).push({
      id: String(b.id), titel: String(b.titel || b.thema || "(ohne Titel)"), thema: String(b.thema || ""),
      datum: sd.datum, von: sd.von, ...(sd.unsicher ? { unsicher: true } : {}), angelegt: String(b.angelegt || ""),
      geschlossen: istGeschlossen(b, l.zu[f]), offen: offenesBlatt(b, l.zu, l.grenze),
    });
  }
  for (const f of Object.keys(faecher)) {
    faecher[f].sort((x, y) => (x.datum < y.datum ? 1 : x.datum > y.datum ? -1 : 0) || y.angelegt.localeCompare(x.angelegt) || x.id.localeCompare(y.id));
    const zahl = {}, n = {};
    for (const e of faecher[f]) zahl[e.titel] = (zahl[e.titel] || 0) + 1;
    for (const e of faecher[f]) if (zahl[e.titel] > 1) { n[e.titel] = (n[e.titel] || 0) + 1; e.gleicherTitel = n[e.titel] + " von " + zahl[e.titel]; }
  }
  return json(200, { ok: true, schalter: (await aktuellAn(env)) ? "neu" : "alt", faecher, abschluesse: l.abschluss.abschluesse, grenze: l.grenze,
                     ...(l.abschluss.fehler ? { warnung: "Die gespeicherten Abschlüsse sind gerade nicht lesbar. Speichern ist gesperrt, bis sie wieder da sind." } : {}) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!(await elternDa(request, env))) return json(401, { ok: false, fehler: "Bitte im Elternbereich anmelden." });
  let d = null;
  try { d = await request.json(); } catch (e) {}
  if (!d || String(d.kind || "").toLowerCase() !== "paul") return json(400, { ok: false, fehler: "Nur für Paul." });
  const kind = "paul";
  const l = await lage(env, kind);
  if (!l.ok) return json(503, l);
  if (l.abschluss.fehler) return json(503, { ok: false, fehler: "Die gespeicherten Abschlüsse sind gerade nicht lesbar. Bitte später nochmal, es wurde nichts geändert." });
  const alle = l.abschluss.abschluesse.slice();

  if (d.aktion === "zuruecknehmen") {
    const rest = alle.filter((a) => String(a.gesetzt) !== String(d.gesetzt || ""));
    if (rest.length === alle.length) return json(404, { ok: false, fehler: "Diesen Abschluss gibt es nicht." });
    try { await env.PAUL_KV.put(ABSCHLUSS(kind), JSON.stringify({ v: 1, abschluesse: rest })); }
    catch (e) { return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Bitte später nochmal." }); }
    return json(200, { ok: true, abschluesse: rest });
  }

  const fach = fachNorm(d.fach || "");
  const probe = String(d.probe || "");
  if (!fach) return json(400, { ok: false, fehler: "Bitte ein Fach wählen." });
  if (!DATUM.test(probe)) return json(400, { ok: false, fehler: "Bitte das Probendatum eintragen." });
  const thema = String(d.thema || "").trim().slice(0, 80);
  const v = abschlussVorschau(l.blaetter, fach, String(d.letztes || ""), thema, l.zu[fach]);
  if (!v.ok) return json(400, v);
  const ids = v.liste.map((x) => x.id);
  const best = Array.isArray(d.bestaetigt) ? d.bestaetigt.map(String) : [];
  const gleich = ids.length === best.length && ids.every((x) => best.includes(x));
  if (!ids.length) return json(400, { ok: false, fehler: "Es gibt keine offenen Blätter zum Abschließen." });
  if (!gleich) return json(409, { ok: false, fehler: "Die Liste hat sich geändert. Bitte die neue Vorschau prüfen.", liste: v.liste });
  if (!v.schnitt) return json(400, { ok: false, fehler: "Das letzte Blatt hat kein Schuldatum. Bitte ein Blatt mit Datum wählen." });
  const neu = { fach, probe, letztes: String(d.letztes), schnitt: v.schnitt, ...(thema ? { thema } : {}), ids, gesetzt: Date.now() };
  alle.push(neu);
  try { await env.PAUL_KV.put(ABSCHLUSS(kind), JSON.stringify({ v: 1, abschluesse: alle })); }
  catch (e) { return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Bitte später nochmal." }); }
  return json(200, { ok: true, abschluss: neu, abschluesse: alle });
}
