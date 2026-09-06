// Lernstand der Kinder: aufzeichnen und auswerten.
//
// POST /api/statistik            -> eine gespielte Runde ablegen (Kind angemeldet)
// GET  /api/statistik?kind=leon  -> Auswertung (nur mit Elternzugang)
//
// Liegt im selben KV wie alles andere, unter eigenem Präfix "lernstand:".
// Der Fortschritt unter "paul-blob" wird nicht berührt.

import { ausweisGueltig, geheimFuer } from "./_riegel.js";

const KINDER = ["paul", "leon", "helena"];
const RUNDEN = (kind) => "lernstand:" + kind;
const MAX_RUNDEN = 400;          // reicht für weit über ein Schuljahr

function kindAus(request, daten) {
  const k = String((daten && daten.kind) || new URL(request.url).searchParams.get("kind") || "").toLowerCase();
  return KINDER.includes(k) ? k : null;
}

/* ---------- Aufzeichnen ---------- */

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  let daten = {};
  try { daten = await request.json(); } catch (e) {}
  const kind = kindAus(request, daten);
  if (!kind) return json(400, { ok: false, fehler: "Welches Kind denn?" });

  // Nur das Kind selbst darf für sich schreiben. Ausnahme: Ist für ein Kind
  // gar kein eigener Code hinterlegt und sein Bereich damit offen (derzeit
  // Helena), kann es sich auch nicht anmelden - dann nehmen wir die Runde
  // trotzdem an. Sobald HELENA_CODE gesetzt ist, gilt wieder der Ausweis.
  const eigenerCode = (kind === "paul" && env.PAUL_CODE) ||
                      (kind === "leon" && env.LEON_CODE) ||
                      (kind === "helena" && env.HELENA_CODE);
  if (eigenerCode && !(await ausweisGueltig(request, geheimFuer(env, kind), env)))
    return json(401, { ok: false, fehler: "Nicht angemeldet." });

  const runde = saeubern(daten.runde);
  if (!runde) return json(400, { ok: false, fehler: "Die Runde war unvollständig." });

  let liste = [];
  try {
    const roh = await env.PAUL_KV.get(RUNDEN(kind));
    liste = roh ? JSON.parse(roh) : [];
  } catch (e) {}
  liste.unshift(runde);
  await env.PAUL_KV.put(RUNDEN(kind), JSON.stringify(liste.slice(0, MAX_RUNDEN)));
  return json(200, { ok: true });
}

// Nur mitschreiben, was gebraucht wird - keine ganzen Aufgabentexte,
// keine Fotos. Was hier nicht steht, kann später auch nicht auslaufen.
function saeubern(r) {
  if (!r || !Array.isArray(r.aufgaben) || !r.aufgaben.length) return null;
  const zahl = (x, max) => Math.max(0, Math.min(max, Math.round(Number(x) || 0)));
  const text = (x, n) => String(x == null ? "" : x).slice(0, n);
  return {
    zeit: new Date().toISOString(),
    spielId: text(r.spielId, 40),
    titel: text(r.titel, 80),
    quelle: text(r.quelle, 40),
    fach: text(r.fach, 20),
    thema: text(r.thema, 90),
    lernbereich: text(r.lernbereich, 60),
    sekunden: zahl(r.sekunden, 36000),
    nurBesuch: !!r.nurBesuch,
    geraet: text(r.geraet, 80),
    aufgaben: r.aufgaben.slice(0, 40).map((a) => ({
      merkmal: text(a.merkmal, 40).toLowerCase(),
      art: text(a.art, 14),
      stimmt: !!a.stimmt,
      nachspielzeit: !!a.nachspielzeit,
      sekunden: zahl(a.sekunden, 3600),
      gegeben: text(a.gegeben, 30),
      richtig: text(a.richtig, 30),
    })),
  };
}

/* ---------- Aufraeumen ---------- */
// DELETE /api/statistik?kind=leon[&alles=1]
// Ohne "alles" wird nur die neueste Runde entfernt - fuer den Fall, dass
// jemand anderes als das Kind eine Runde gespielt hat (Testlauf, kleine
// Schwester am Tablet). Nur mit Elternzugang.
export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  if (!(await ausweisGueltig(request, geheimFuer(env, "eltern"), env)))
    return json(401, { ok: false, fehler: "Bitte mit dem Eltern-Code anmelden." });

  const url = new URL(request.url);
  const kind = kindAus(request, null);
  if (!kind) return json(400, { ok: false, fehler: "Welches Kind denn?" });

  if (url.searchParams.get("alles") === "1") {
    await env.PAUL_KV.delete(RUNDEN(kind));
    return json(200, { ok: true, entfernt: "alles" });
  }
  let liste = [];
  try {
    const roh = await env.PAUL_KV.get(RUNDEN(kind));
    liste = roh ? JSON.parse(roh) : [];
  } catch (e) {}
  const weg = liste.shift();
  await env.PAUL_KV.put(RUNDEN(kind), JSON.stringify(liste));
  return json(200, { ok: true, entfernt: weg ? (weg.titel || "eine Runde") : "nichts", uebrig: liste.length });
}

/* ---------- Auswerten ---------- */

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  // Die Auswertung ist für die Eltern, nicht für die Kinder.
  const elternGeheim = geheimFuer(env, "eltern");
  if (!elternGeheim) return json(500, { ok: false, fehler: "Auf dem Server fehlt der Zugangscode." });
  if (!(await ausweisGueltig(request, elternGeheim, env)))
    return json(401, { ok: false, fehler: "Bitte mit dem Eltern-Code anmelden." });

  const url = new URL(request.url);
  const gewuenscht = String(url.searchParams.get("kind") || "").toLowerCase();
  const kinder = KINDER.includes(gewuenscht) ? [gewuenscht] : KINDER;

  const raus = {};
  for (const kind of kinder) {
    let liste = [];
    try {
      const roh = await env.PAUL_KV.get(RUNDEN(kind));
      liste = roh ? JSON.parse(roh) : [];
    } catch (e) {}
    raus[kind] = auswerten(liste);
  }
  return json(200, { ok: true, kinder: raus });
}

function auswerten(liste) {
  const leer = { runden: 0, aufgaben: 0, richtig: 0, quote: null, minuten: 0,
                 merkmale: [], themen: [], verlauf: [], letzte: [], stolpersteine: [] };
  if (!liste.length) return leer;

  const g = { runden: liste.length, aufgaben: 0, richtig: 0, sekunden: 0 };
  const jeMerkmal = {}, jeThema = {}, jeWoche = {}, fehlerBilder = {}, jeGeraet = {};

  for (const r of liste) {
    g.sekunden += r.sekunden || 0;
    if (r.geraet) {
      jeGeraet[r.geraet] = jeGeraet[r.geraet] || { name: r.geraet, runden: 0, minuten: 0 };
      jeGeraet[r.geraet].runden++;
      jeGeraet[r.geraet].minuten += (r.sekunden || 0) / 60;
    }
    const woche = wochenSchluessel(r.zeit);
    jeWoche[woche] = jeWoche[woche] || { woche, aufgaben: 0, richtig: 0, minuten: 0 };
    jeWoche[woche].minuten += (r.sekunden || 0) / 60;

    const t = r.quelle || r.thema || "unbekannt";
    jeThema[t] = jeThema[t] || { name: t, thema: r.thema || t, aufgaben: 0, richtig: 0, sekunden: 0 };

    for (const a of r.aufgaben || []) {
      // Ein "Besuch" ist keine gelöste Aufgabe: Er sagt nur, dass gespielt
      // wurde. Er darf die Quote nicht schönen - sonst stünden Pauls
      // Eigenbau-Spiele mit 100 Prozent in der Auswertung.
      if (a.art === "besuch") { jeThema[t].sekunden += a.sekunden || 0; continue; }
      g.aufgaben++; jeThema[t].aufgaben++; jeWoche[woche].aufgaben++;
      jeThema[t].sekunden += a.sekunden || 0;
      if (a.stimmt) { g.richtig++; jeThema[t].richtig++; jeWoche[woche].richtig++; }

      const m = a.merkmal || "ohne Angabe";
      jeMerkmal[m] = jeMerkmal[m] || { name: m, aufgaben: 0, richtig: 0, sekunden: 0, zuletzt: r.zeit };
      jeMerkmal[m].aufgaben++;
      jeMerkmal[m].sekunden += a.sekunden || 0;
      if (a.stimmt) jeMerkmal[m].richtig++;
      if (r.zeit > jeMerkmal[m].zuletzt) jeMerkmal[m].zuletzt = r.zeit;

      // Welche falsche Antwort kommt immer wieder? Das ist oft ein
      // Denkfehler mit System, kein Verrutschen.
      if (!a.stimmt && a.gegeben) {
        const k = m + " || " + a.gegeben + " statt " + a.richtig;
        fehlerBilder[k] = (fehlerBilder[k] || 0) + 1;
      }
    }
  }

  const mitQuote = (o) => Object.assign({}, o, {
    quote: o.aufgaben ? Math.round((o.richtig / o.aufgaben) * 100) : null,
    schnitt: o.aufgaben ? Math.round((o.sekunden || 0) / o.aufgaben) : null,
    minuten: Math.round((o.sekunden || 0) / 60),
  });

  const merkmale = Object.values(jeMerkmal).map(mitQuote)
    .sort((a, b) => (a.quote - b.quote) || (b.aufgaben - a.aufgaben));
  const themen = Object.values(jeThema).map(mitQuote)
    .sort((a, b) => {
      // Themen ganz ohne bewertete Aufgaben (reine Spielzeit) nach hinten.
      if (a.quote == null && b.quote == null) return b.sekunden - a.sekunden;
      if (a.quote == null) return 1;
      if (b.quote == null) return -1;
      return (a.quote - b.quote) || (b.aufgaben - a.aufgaben);
    });

  const verlauf = Object.values(jeWoche)
    .map((w) => Object.assign({}, w, {
      quote: w.aufgaben ? Math.round((w.richtig / w.aufgaben) * 100) : null,
      minuten: Math.round(w.minuten),
    }))
    .sort((a, b) => (a.woche < b.woche ? -1 : 1));

  const stolpersteine = Object.entries(fehlerBilder)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([k, n]) => {
      const [merkmal, rest] = k.split(" || ");
      return { merkmal, muster: rest, wieOft: n };
    });

  return {
    geraete: Object.values(jeGeraet)
      .map((x) => Object.assign({}, x, { minuten: Math.round(x.minuten) }))
      .sort((a, b) => b.runden - a.runden),
    runden: g.runden,
    aufgaben: g.aufgaben,
    richtig: g.richtig,
    quote: g.aufgaben ? Math.round((g.richtig / g.aufgaben) * 100) : null,
    minuten: Math.round(g.sekunden / 60),
    merkmale,
    themen,
    verlauf,
    stolpersteine,
    letzte: liste.slice(0, 12).map((r) => ({
      zeit: r.zeit, titel: r.titel, thema: r.thema, minuten: Math.round((r.sekunden || 0) / 60),
      aufgaben: (r.aufgaben || []).length,
      richtig: (r.aufgaben || []).filter((a) => a.stimmt).length,
    })),
  };
}

// Montag der jeweiligen Woche, als "2026-09-07".
function wochenSchluessel(iso) {
  const d = new Date(iso || Date.now());
  if (isNaN(d)) return "?";
  const tag = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - tag);
  return d.toISOString().slice(0, 10);
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
