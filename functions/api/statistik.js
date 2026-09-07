// Lernstand der Kinder: aufzeichnen und auswerten.
//
// POST /api/statistik            -> eine gespielte Runde ablegen (Kind angemeldet)
// GET  /api/statistik?kind=leon  -> Auswertung (nur mit Elternzugang)
//
// Liegt im selben KV wie alles andere, unter eigenem Präfix "lernstand:".
// Der Fortschritt unter "paul-blob" wird nicht berührt.

import { ausweisGueltig, geheimFuer, brauchtAusweis } from "./_riegel.js";

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

  // Liegt der Bereich des Kindes hinter dem Riegel, muss der Ausweis stimmen.
  // Helenas Bereich ist offen - sie kann sich gar nicht anmelden, also nehmen
  // wir dort ohne Ausweis an. Sobald HELENA_CODE gesetzt und ihr Bereich in
  // GESCHUETZT aufgenommen wird, gilt auch fuer sie der Ausweis.
  if (brauchtAusweis(env, kind) && !(await ausweisGueltig(request, geheimFuer(env, kind), env)))
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
    // Lernen, Pausieren und Entwickeln duerfen nicht in einen Topf. Denny am
    // 07.09.2026: die Bauzeit in der Werkstatt gehoert nicht in die Lernzeit.
    zeitart: ["lernen", "bauen"].includes(r.zeitart) ? r.zeitart : "lernen",
    pause: zahl(r.pause, 36000),
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
                 minutenPause: 0, minutenBauen: 0, geraete: [],
                 merkmale: [], themen: [], verlauf: [], letzte: [], stolpersteine: [] };
  if (!liste.length) return leer;

  const g = { runden: 0, aufgaben: 0, richtig: 0, sekunden: 0, pause: 0, bauen: 0 };
  const jeMerkmal = {}, jeThema = {}, jeWoche = {}, fehlerBilder = {}, jeGeraet = {};

  // Ein Topf je Tag, Woche und Jahreszeit. Daraus wird unten "heute / diese
  // Woche / dieser Herbst" und der Vergleich zum Zeitraum davor.
  const jeZeitraum = { tag: {}, woche: {}, jahreszeit: {} };
  const zaehle = (art, schluessel, r, aufgaben, richtig) => {
    const t = jeZeitraum[art];
    t[schluessel] = t[schluessel] ||
      { runden: 0, aufgaben: 0, richtig: 0, sekunden: 0, pause: 0, bauen: 0, tage: {} };
    const e = t[schluessel];
    if (r.zeitart === "bauen") { e.bauen += r.sekunden || 0; return; }
    e.runden++;
    e.aufgaben += aufgaben;
    e.richtig += richtig;
    e.sekunden += r.sekunden || 0;
    e.pause += r.pause || 0;
    e.tage[tagSchluessel(r.zeit)] = 1;
  };

  for (const r of liste) {
    // Das Gerät zählt immer mit - auch beim Bauen wird es benutzt, und die
    // Layoutprüfung soll es kennen.
    if (r.geraet) {
      jeGeraet[r.geraet] = jeGeraet[r.geraet] || { name: r.geraet, runden: 0, minuten: 0 };
      jeGeraet[r.geraet].runden++;
      jeGeraet[r.geraet].minuten += (r.sekunden || 0) / 60;
    }

    // Bauzeit ist keine Lernzeit. Sie wird gezeigt, aber getrennt - sonst
    // sähe eine Stunde Werkstatt aus wie eine Stunde Üben.
    if (r.zeitart === "bauen") { g.bauen += r.sekunden || 0; continue; }
    g.runden++;
    g.sekunden += r.sekunden || 0;
    g.pause += r.pause || 0;
    const woche = wochenSchluessel(r.zeit);
    jeWoche[woche] = jeWoche[woche] || { woche, aufgaben: 0, richtig: 0, minuten: 0 };
    jeWoche[woche].minuten += (r.sekunden || 0) / 60;

    const echte = (r.aufgaben || []).filter((a) => a.art !== "besuch" && a.art !== "bauen");
    zaehle("tag", tagSchluessel(r.zeit), r, echte.length, echte.filter((a) => a.stimmt).length);
    zaehle("woche", woche, r, echte.length, echte.filter((a) => a.stimmt).length);
    zaehle("jahreszeit", jahreszeitSchluessel(r.zeit), r, echte.length, echte.filter((a) => a.stimmt).length);

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

  /* ---------- Die drei Zeiträume fertig rechnen ----------
     Jeweils der laufende Zeitraum und der davor. Der Vergleich ist der Punkt:
     "8 Minuten" sagt wenig, "8 Minuten, letzte Woche waren es 3" sagt viel. */
  const jetzt = new Date();
  const jz = jahreszeitVon(jetzt);
  const vorigerTag = new Date(jetzt); vorigerTag.setDate(vorigerTag.getDate() - 1);
  const vorigeWoche = new Date(jetzt); vorigeWoche.setDate(vorigeWoche.getDate() - 7);
  const vorigeJz = new Date(jetzt); vorigeJz.setMonth(vorigeJz.getMonth() - 3);

  const leerTopf = { runden: 0, aufgaben: 0, richtig: 0, sekunden: 0, pause: 0, bauen: 0, tage: {} };
  const fertig = (topf) => {
    const e = topf || leerTopf;
    return {
      runden: e.runden,
      aufgaben: e.aufgaben,
      richtig: e.richtig,
      quote: e.aufgaben ? Math.round((e.richtig / e.aufgaben) * 100) : null,
      minuten: Math.round(e.sekunden / 60),
      minutenPause: Math.round(e.pause / 60),
      minutenBauen: Math.round(e.bauen / 60),
      tageAktiv: Object.keys(e.tage || {}).length,
    };
  };

  const zeitraeume = {
    tag: Object.assign({ titel: "Heute", art: "tag" },
      fertig(jeZeitraum.tag[tagSchluessel(jetzt)]),
      { davor: fertig(jeZeitraum.tag[tagSchluessel(vorigerTag)]), davorTitel: "gestern" }),
    woche: Object.assign({ titel: "Diese Woche", art: "woche", kw: kalenderwoche(jetzt) },
      fertig(jeZeitraum.woche[wochenSchluessel(jetzt.toISOString())]),
      { davor: fertig(jeZeitraum.woche[wochenSchluessel(vorigeWoche.toISOString())]), davorTitel: "letzte Woche" }),
    jahreszeit: Object.assign({ titel: jz.name + " " + jz.jahr, art: "jahreszeit" },
      fertig(jeZeitraum.jahreszeit[jz.jahr + "-" + jz.name]),
      { davor: fertig(jeZeitraum.jahreszeit[jahreszeitSchluessel(vorigeJz.toISOString())]),
        davorTitel: jahreszeitVon(vorigeJz).name }),
  };

  return {
    zeitraeume,
    geraete: Object.values(jeGeraet)
      .map((x) => Object.assign({}, x, { minuten: Math.round(x.minuten) }))
      .sort((a, b) => b.runden - a.runden),
    runden: g.runden,
    aufgaben: g.aufgaben,
    richtig: g.richtig,
    quote: g.aufgaben ? Math.round((g.richtig / g.aufgaben) * 100) : null,
    minuten: Math.round(g.sekunden / 60),
    minutenPause: Math.round(g.pause / 60),
    minutenBauen: Math.round(g.bauen / 60),
    merkmale,
    themen,
    verlauf,
    stolpersteine,
    letzte: liste.slice(0, 12).map((r) => {
      const echte = (r.aufgaben || []).filter((a) => a.art !== "besuch" && a.art !== "bauen");
      const d = new Date(r.zeit);
      const j = isNaN(d) ? null : jahreszeitVon(d);
      return {
        zeit: r.zeit, titel: r.titel, thema: r.thema,
        minuten: Math.round((r.sekunden || 0) / 60),
        sekunden: r.sekunden || 0,
        minutenPause: Math.round((r.pause || 0) / 60),
        zeitart: r.zeitart || "lernen",
        // Tag, Woche und Jahreszeit stehen fertig dabei - die Seite soll nicht
        // jedes Mal selbst rechnen und dabei anders zählen als der Server.
        wochentag: isNaN(d) ? "" : ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()],
        kw: kalenderwoche(r.zeit),
        jahreszeit: j ? j.name : "",
        aufgaben: echte.length,
        richtig: echte.filter((a) => a.stimmt).length,
        geraet: r.geraet || "",
      };
    }),
  };
}

// Montag der jeweiligen Woche, als "2026-09-07".
/* ---------- Tag, Woche, Jahreszeit ----------
   Denny am 07.09.2026: Er will je Eintrag Tag, Woche und Jahreszeit sehen -
   und dazu, wie viel gelernt, wie viele Spiele und wie viel Zeit.

   Jahreszeiten meteorologisch: Frühling März-Mai, Sommer Juni-August,
   Herbst September-November, Winter Dezember-Februar. Der Winter gehört zum
   Jahr, in dem er ANFÄNGT - sonst zerfiele eine Weihnachtswoche in zwei. */

const JAHRESZEITEN = ["Winter", "Frühling", "Sommer", "Herbst"];

function jahreszeitVon(d) {
  const m = d.getMonth();                       // 0 = Januar
  if (m >= 2 && m <= 4) return { name: "Frühling", jahr: d.getFullYear() };
  if (m >= 5 && m <= 7) return { name: "Sommer", jahr: d.getFullYear() };
  if (m >= 8 && m <= 10) return { name: "Herbst", jahr: d.getFullYear() };
  return { name: "Winter", jahr: m === 11 ? d.getFullYear() : d.getFullYear() - 1 };
}

function jahreszeitSchluessel(iso) {
  const d = new Date(iso || Date.now());
  if (isNaN(d)) return "?";
  const j = jahreszeitVon(d);
  return j.jahr + "-" + j.name;
}

// Kalenderwoche nach ISO 8601 - die Zählung, die auch im Schulkalender steht.
function kalenderwoche(iso) {
  const d = new Date(iso || Date.now());
  if (isNaN(d)) return null;
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - ((t.getUTCDay() + 6) % 7));
  const jahresbeginn = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - jahresbeginn) / 86400000 + 1) / 7);
}

function tagSchluessel(iso) {
  const d = new Date(iso || Date.now());
  if (isNaN(d)) return "?";
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
         "-" + String(d.getDate()).padStart(2, "0");
}

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
