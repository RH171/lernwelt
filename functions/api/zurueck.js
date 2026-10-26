/* Zurueckbekommene Arbeiten - der Weg von aussen.
 *
 *   GET    /api/zurueck?kind=helena             die eigene Liste
 *   GET    /api/zurueck?kind=helena&bild=id:0   eine Seite
 *   POST   /api/zurueck   {kind, eintrag:{...}, seiten:[dataurl]}
 *   DELETE /api/zurueck?kind=helena&id=abc      aus der Liste nehmen
 *   POST   /api/zurueck   {kind, uebernommen:{id, noteId}}   nur Eltern
 *
 * Seit 26.10.2026 (Kapitel 146) EINE Sicht fuer Kind und Eltern: Die Antwort
 * auf GET ?kind= traegt zusaetzlich "ausNoten" - die Noten aus dem
 * Elternbereich (noten:<kind>) und die Proben aus dem Probenvergleich, die zu
 * keinem Eintrag hier passen. Neue Eintraege werden gegen beides verglichen:
 * Passt einer zu einer schon eingetragenen Note, wird er damit verknuepft
 * (zaehlt einmal); steht dieselbe Arbeit schon in der Liste, kommt 409 mit
 * {doppelt} - ausser {trotzdem:true}. Alte Seiten lesen die neuen Felder nicht.
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
import { notenLesen, ohneDoppelte, gleicheProbe, schonDa, fachSchluessel } from "./_noten.js";
import { PROBEN } from "./_proben-daten.js";

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

/* Ein Eintrag der Zurueck-Liste in der Form, die gleicheProbe() versteht. */
function alsProbe(e) {
  return { id: "z:" + e.id, fach: e.fach, datum: e.datum, note: e.note, punkte: e.punkte,
           eigeneProbe: e.eigeneProbe };
}

/* Welche Note zu welchem Eintrag passt (fuer Eintraege ohne Haken). */
function passtZu(liste, noten) {
  const zaehlt = ohneDoppelte(noten || []);
  return (liste || []).map((e) => {
    if (e.uebernommen || e.noteId) return e;
    const n = zaehlt.find((x) => gleicheProbe(x, alsProbe(e)));
    return n ? { ...e, passtZu: { id: n.id, von: n.von || "eltern", note: n.note, offen: !!n.offen } } : e;
  });
}

/* Was das Kind hier sieht, obwohl es nicht von ihm kommt: Noten der Eltern
   und Proben aus dem Probenvergleich, die zu keinem Eintrag passen. Nur
   Fach, Datum, was es war, Punkte, Note - keine Auswertung, kein Lehrerprofil. */
function ausNotenFuer(kind, liste, noten) {
  const raus = [];
  const verknuepft = new Set((liste || []).map((e) => e.noteId).filter(Boolean));
  const vergleich = (liste || []).map(alsProbe);
  for (const n of ohneDoppelte(noten || [])) {
    if (verknuepft.has(n.id)) continue;
    if (vergleich.some((e) => gleicheProbe(e, n))) continue;
    const was = n.anlass && n.anlass !== "Leistungsnachweis" ? n.anlass : "Probe";
    const r = { id: n.id, quelle: "noten", fach: fachSchluessel(n.fach), datum: n.datum, anlass: was,
                von: n.von && n.von !== "eltern" ? "kind" : "eltern" };
    if (typeof n.note === "number") r.note = n.note;
    if (n.punkte) r.punkte = String(n.punkte);
    if (n.offen && typeof n.note !== "number") r.offen = true;
    raus.push(r);
    vergleich.push(n);
  }
  for (const p of PROBEN.filter((x) => x.kind === kind)) {
    const als = { id: "p:" + p.id, fach: p.fach, datum: p.datum, note: p.note, punkte: p.punkte };
    if (vergleich.some((e) => gleicheProbe(e, als))) continue;
    const r = { id: p.id, quelle: "probe", fach: fachSchluessel(p.fach), datum: p.datum,
                anlass: String(p.titel || "Probe").slice(0, 120), von: "eltern" };
    if (typeof p.note === "number") r.note = p.note;
    if (typeof p.punkte === "number" && typeof p.max === "number") r.punkte = String(p.punkte).replace(".", ",") + "/" + p.max;
    raus.push(r);
    vergleich.push(als);
  }
  return raus.sort((a, b) => String(b.datum || "").localeCompare(String(a.datum || "")));
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
      const noten = liste === null ? null : await notenLesen(env, k);
      kinder[k] = liste === null ? { kaputt: true, liste: [] } : { liste: passtZu(liste, noten) };
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
  /* Antwortet der Notenspeicher nicht, fehlt "ausNoten" ganz (null) - nie eine
     leere Liste, sonst hiesse "nichts von den Eltern" in Wahrheit "weiss ich nicht". */
  const noten = await notenLesen(env, kind);
  return json(200, {
    ok: true, liste: passtZu(liste, noten),
    ausNoten: noten === null ? null : ausNotenFuer(kind, liste, noten),
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

  /* Doppelt (26.10.2026): erst vergleichen, dann Bilder schreiben - eine
     abgelehnte Arbeit soll keine Schreibvorgaenge kosten. */
  const e = gepruef.eintrag;
  const bisher = await listeLesen(env, kind);
  if (bisher === null) return json(503, { ok: false, fehler: "Der Speicher antwortet gerade nicht. Nichts gespeichert." });
  if (daten.trotzdem === true) e.eigeneProbe = true;
  else {
    const gleich = bisher.find((x) => gleicheProbe(alsProbe(x), alsProbe(e)));
    if (gleich) {
      return json(409, { ok: false,
        fehler: "Diese Arbeit ist schon da, abgegeben am " + String(gleich.angelegt || "").slice(0, 10).split("-").reverse().join(".") + ".",
        doppelt: { id: gleich.id, anlass: gleich.anlass, datum: gleich.datum, fach: gleich.fach,
                   angelegt: gleich.angelegt, wo: "zurueck" } });
    }
  }
  /* Steht die Note schon im Notenbuch (von den Eltern oder vom Kind selbst),
     wird der Eintrag damit verknuepft: Er bekommt den Haken und zaehlt nicht
     noch einmal. Eine OFFENE Note ("kommt noch") verknuepft nur, wenn hier
     auch keine Note steht - sonst ergaenzt der Elternbereich sie beim
     Uebernehmen. */
  let passt = null;
  const noten = await notenLesen(env, kind);
  if (noten && !e.eigeneProbe) {
    const n = schonDa(ohneDoppelte(noten), alsProbe(e));
    if (n && !(n.offen && typeof n.note !== "number" && typeof e.note === "number")) {
      e.uebernommen = new Date().toISOString();
      e.noteId = n.id;
      e.verknuepft = true;
      passt = { id: n.id, von: n.von && n.von !== "eltern" ? "kind" : "eltern", note: n.note, datum: n.datum };
    }
  }

  const r = await ablegen(env, kind, e, seiten);
  if (!r.ok) return json(503, r);
  return json(200, { ok: true, eintrag: r.eintrag, liste: r.liste, passtZu: passt });
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
