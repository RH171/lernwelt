/* Zurueckbekommene Arbeiten - der Weg von aussen.
 *
 *   GET    /api/zurueck?kind=helena             die eigene Liste
 *   GET    /api/zurueck?kind=helena&bild=id:0   eine Seite
 *   POST   /api/zurueck   {kind, eintrag:{...}, seiten:[dataurl]}
 *   DELETE /api/zurueck?kind=helena&id=abc      aus der Liste nehmen
 *   POST   /api/zurueck   {kind, uebernommen:{id, noteId}}   nur Eltern
 *
 * Der Ausweis des Kindes reicht zum Ablegen und Lesen - es ist seine eigene
 * Arbeit. Der Eltern-Code kommt ueberall hinein. Eine NOTE entsteht hier
 * nicht; das tut nur /api/noten mit Elternausweis.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { FAECHER, FAECHER_JE_KIND } from "./_schulstoff.js";
import {
  KINDER, MAX_SEITEN, MIT_NOTE,
  eintragPruefen, listeLesen, ablegen, bildLesen, wegnehmen, uebernommen,
} from "./_zurueck.js";

const json = (status, daten) =>
  new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

// Ein Handyfoto kommt verkleinert an (strom.js, rund 280 KB) - 2 MB sind Luft.
const MAX_BILD = 2 * 1024 * 1024;

async function darfRein(request, env, kind) {
  if (geheimFuer(env, "eltern") && (await ausweisGueltig(request, geheimFuer(env, "eltern"), env))) return true;
  const g = geheimFuer(env, kind);
  return !!g && (await ausweisGueltig(request, g, env));
}

async function istEltern(request, env) {
  return !!geheimFuer(env, "eltern") && (await ausweisGueltig(request, geheimFuer(env, "eltern"), env));
}

function kindAus(url, daten) {
  const k = String((daten && daten.kind) || url.searchParams.get("kind") || "").toLowerCase();
  return KINDER.includes(k) ? k : null;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  const url = new URL(request.url);

  // Alle Kinder auf einmal - nur fuer den Elternbereich.
  if (url.searchParams.get("alle") === "1") {
    if (!(await istEltern(request, env))) return json(401, { ok: false, fehler: "Nur mit Elternausweis." });
    const kinder = {};
    for (const k of KINDER) {
      const liste = await listeLesen(env, k);
      kinder[k] = liste === null ? { kaputt: true, liste: [] } : { liste };
    }
    return json(200, { ok: true, kinder, faecher: FAECHER });
  }

  const kind = kindAus(url, null);
  if (!kind) return json(400, { ok: false, fehler: "Welches Kind denn?" });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });

  const bild = url.searchParams.get("bild");
  if (bild) {
    const [id, nr] = String(bild).split(":");
    const daten = await bildLesen(env, id, nr);
    if (!daten) return json(404, { ok: false, fehler: "Das Bild finde ich nicht." });
    return json(200, { ok: true, bild: daten });
  }

  const liste = await listeLesen(env, kind);
  if (liste === null) return json(503, { ok: false, fehler: "Ich komme gerade nicht an deine Arbeiten." });
  return json(200, {
    ok: true, liste,
    faecher: (FAECHER_JE_KIND[kind] || []).map((s) => ({ schluessel: s, text: FAECHER[s] || s })),
    mitNote: !!MIT_NOTE[kind],
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  let daten = {};
  try { daten = await request.json(); }
  catch (e) { return json(400, { ok: false, fehler: "Ich konnte die Anfrage nicht lesen." }); }

  const url = new URL(request.url);
  const kind = kindAus(url, daten);
  if (!kind) return json(400, { ok: false, fehler: "Welches Kind denn?" });

  /* Haken dran, wenn Denny daraus eine Note gemacht hat. Das darf NUR der
     Elternbereich - sonst koennte ein Kind seinen Ruecklaeufer als "erledigt"
     markieren, ohne dass je eine Note entstanden ist. */
  if (daten.uebernommen) {
    if (!(await istEltern(request, env))) return json(401, { ok: false, fehler: "Nur mit Elternausweis." });
    const id = String(daten.uebernommen.id || "").replace(/[^a-z0-9]/gi, "");
    if (!id) return json(400, { ok: false, fehler: "Welcher Eintrag denn?" });
    const r = await uebernommen(env, kind, id, daten.uebernommen.noteId);
    return json(r.ok ? 200 : 503, r);
  }

  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });

  const gepruef = eintragPruefen(daten.eintrag || {}, kind);
  if (gepruef.fehler) return json(400, { ok: false, fehler: gepruef.fehler });

  const seiten = Array.isArray(daten.seiten) ? daten.seiten.slice(0, MAX_SEITEN) : [];
  for (const s of seiten) {
    if (typeof s !== "string" || !s.startsWith("data:")) {
      return json(400, { ok: false, fehler: "Eine Seite konnte ich nicht lesen. Mach das Foto noch einmal." });
    }
    if (s.length > MAX_BILD * 1.37) {
      return json(413, { ok: false, fehler: "Ein Foto ist zu groß. Mach es noch einmal, etwas weiter weg." });
    }
  }

  const r = await ablegen(env, kind, gepruef.eintrag, seiten);
  if (!r.ok) return json(503, r);
  return json(200, { ok: true, eintrag: r.eintrag, liste: r.liste });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  const url = new URL(request.url);
  const kind = kindAus(url, null);
  const id = String(url.searchParams.get("id") || "").replace(/[^a-z0-9]/gi, "");
  if (!kind || !id) return json(400, { ok: false, fehler: "Welcher Eintrag denn?" });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });
  const r = await wegnehmen(env, kind, id);
  return json(r.ok ? 200 : 503, r);
}
