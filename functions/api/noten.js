/* Noten je Kind - lesen, eintragen, korrigieren, und ein Blatt auslesen lassen.
 *
 * Alles hier braucht den ELTERNAUSWEIS. Die Kinder sehen ihre Auswertung
 * nicht: Denny am 20.09.2026 zum Noten-Manager - "sie müssen nicht unbedingt
 * sehen, wo die Defizite waren". Eine einzelne Note bekommt das Kind im
 * Hausaufgaben-Heft unkommentiert bestaetigt, mehr nicht.
 *
 *   GET    /api/noten?kind=helena            -> Auswertung je Fach
 *   POST   /api/noten  {kind, note:{...}}    -> anlegen oder aendern (gleiche id)
 *   DELETE /api/noten?kind=helena&id=abc     -> loeschen
 *   POST   /api/noten  {kind, blatt:"data:…"} -> Notenstand auslesen (kostet Geld,
 *                                               speichert NICHTS, schlaegt nur vor)
 */

import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { notenLesen, notenSchreiben, notePruefen, auswertung, RECHNUNG, neueId } from "./_noten.js";

const KINDER = ["paul", "leon", "helena"];
const MODELL = "claude-opus-5";
const MAX_BLATT = 4 * 1024 * 1024;

const json = (status, daten) =>
  new Response(JSON.stringify(daten), { status, headers: { "content-type": "application/json; charset=utf-8" } });

async function eltern(request, env) {
  return ausweisGueltig(request, geheimFuer(env, "eltern"), env);
}

function kindAus(url, daten) {
  const k = String((daten && daten.kind) || url.searchParams.get("kind") || "").toLowerCase();
  return KINDER.includes(k) ? k : null;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  if (!(await eltern(request, env))) return json(401, { ok: false, fehler: "Nur mit Elternausweis." });

  const url = new URL(request.url);
  const kind = kindAus(url, null);
  const kinder = {};
  for (const k of kind ? [kind] : KINDER) {
    const noten = await notenLesen(env, k);
    if (noten === null) {
      // Derselbe Grundsatz wie beim Anwesenheitsband: Ein Speicherfehler ist
      // KEINE leere Notenliste. Sonst stuende da "noch keine Noten", obwohl
      // welche da sind.
      kinder[k] = { kaputt: true, faecher: [] };
      continue;
    }
    kinder[k] = { faecher: auswertung(k, noten), regel: RECHNUNG[k] || null, anzahl: noten.length };
  }
  return json(200, { ok: true, kinder });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  if (!(await eltern(request, env))) return json(401, { ok: false, fehler: "Nur mit Elternausweis." });

  let daten = {};
  try { daten = await request.json(); } catch (e) { return json(400, { ok: false, fehler: "Ich konnte die Anfrage nicht lesen." }); }

  const url = new URL(request.url);
  const kind = kindAus(url, daten);
  if (!kind) return json(400, { ok: false, fehler: "Welches Kind denn?" });

  // Ein Blatt auslesen lassen - es wird NICHTS gespeichert, nur vorgeschlagen.
  if (daten.blatt) return blattLesen(env, kind, daten.blatt);

  const gepruef = notePruefen(daten.note || {});
  if (gepruef.fehler) return json(400, { ok: false, fehler: gepruef.fehler });

  const noten = await notenLesen(env, kind);
  if (noten === null) return json(503, { ok: false, fehler: "Der Speicher antwortet gerade nicht. Bitte gleich noch einmal." });

  const i = noten.findIndex((n) => n.id === gepruef.note.id);
  if (i >= 0) noten[i] = { ...noten[i], ...gepruef.note };
  else noten.push(gepruef.note);

  try { await notenSchreiben(env, kind, noten); }
  catch (e) { return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Die Note ist NICHT gespeichert." }); }

  return json(200, { ok: true, note: gepruef.note, faecher: auswertung(kind, noten) });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!(await eltern(request, env))) return json(401, { ok: false, fehler: "Nur mit Elternausweis." });
  const url = new URL(request.url);
  const kind = kindAus(url, null);
  const id = String(url.searchParams.get("id") || "").replace(/[^a-z0-9]/gi, "");
  if (!kind || !id) return json(400, { ok: false, fehler: "Welche Note denn?" });

  const noten = await notenLesen(env, kind);
  if (noten === null) return json(503, { ok: false, fehler: "Der Speicher antwortet gerade nicht." });
  const rest = noten.filter((n) => n.id !== id);
  if (rest.length === noten.length) return json(404, { ok: false, fehler: "Diese Note gibt es nicht (mehr)." });

  try { await notenSchreiben(env, kind, rest); }
  catch (e) { return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Nichts geloescht." }); }
  return json(200, { ok: true, faecher: auswertung(kind, rest) });
}

/* Ein Notenblatt auslesen. Denny am 21.09.2026: "Helena bekommt jeden Monat
   einen Notendurchschnitt mitgeteilt. Den kann ich dir dann auch entsprechend
   hochladen." Das Ergebnis wird NICHT gespeichert - es kommt als Vorschlag
   zurueck, und erst Dennys Klick legt es an. Ein falsch gelesener Notenstand
   waere schlimmer als gar keiner. */
async function blattLesen(env, kind, blatt) {
  if (typeof blatt !== "string" || blatt.length > MAX_BLATT)
    return json(400, { ok: false, fehler: "Das Blatt ist zu groß (höchstens 4 MB)." });
  if (!env.ANTHROPIC_API_KEY) return json(500, { ok: false, fehler: "Kein Zugang zum Auslesen hinterlegt." });

  const istPdf = /^data:application\/pdf;base64,/.test(blatt);
  const istBild = /^data:image\/(png|jpe?g|webp|gif);base64,/.test(blatt);
  if (!istPdf && !istBild) return json(400, { ok: false, fehler: "Das kann ich nicht lesen – Foto oder PDF." });

  const kopf = blatt.slice(5, blatt.indexOf(";"));
  const roh = blatt.split(",", 2)[1];
  const auftrag =
`Du liest einen Notenstand aus, den eine Schule den Eltern geschickt hat.
Gib NUR JSON zurück, ohne Fließtext, in dieser Form:
{"noten":[{"fach":"englisch","note":2,"anlass":"Schulaufgabe 1","datum":"2026-10-14","art":"gross","gewicht":1,"sicher":true}]}

Regeln:
- "fach" klein geschrieben, ausgeschrieben ("mathematik", "englisch", "deutsch").
- "note" ist 1 bis 6, halbe Noten erlaubt. Steht nur eine Punktzahl da, nimm
  "punkte" als Text und lass "note" weg - rechne NIE selbst eine Note aus.
- "art": "gross" bei Schulaufgabe oder Klausur, sonst "klein".
- "gewicht": 2 nur, wenn auf dem Blatt ausdrücklich eine doppelte Wertung steht
  (z. B. Jahrgangsstufentest), sonst 1.
- "datum" im Format JJJJ-MM-TT; steht keines da, lass das Feld weg.
- "sicher": false, wenn du eine Ziffer nicht eindeutig lesen kannst. Lieber
  false als eine falsche Zahl - jemand prüft das nach.
- Ist auf dem Blatt ein Durchschnitt angegeben, gib ihn als "durchschnitt" je
  Fach mit an: {"faecher":[{"fach":"englisch","durchschnitt":2.5}]}
- Steht dort keine einzige Note, antworte {"noten":[]}.`;

  try {
    const a = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODELL, max_tokens: 4000,
        messages: [{ role: "user", content: [
          { type: "text", text: auftrag },
          istPdf ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: roh } }
                 : { type: "image", source: { type: "base64", media_type: kopf, data: roh } },
        ] }],
      }),
    });
    if (!a.ok) return json(502, { ok: false, fehler: "Das Auslesen hat nicht geklappt. Versuch es noch einmal." });
    const j = await a.json();
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("").trim();
    const klammer = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    let gelesen = null;
    try { gelesen = JSON.parse(klammer); } catch (e) { return json(502, { ok: false, fehler: "Die Antwort war nicht lesbar." }); }

    // Jede vorgeschlagene Note durch dieselbe Pruefung wie eine getippte.
    const vorschlaege = [];
    for (const n of (gelesen.noten || []).slice(0, 60)) {
      const p = notePruefen({ ...n, quelle: "blatt", id: neueId() });
      if (!p.fehler) vorschlaege.push(p.note);
    }
    return json(200, { ok: true, vorschlaege, faecherDurchschnitt: gelesen.faecher || [], gespeichert: false });
  } catch (e) {
    return json(502, { ok: false, fehler: "Beim Auslesen ist etwas schiefgegangen." });
  }
}
