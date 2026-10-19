/* Foto einer Wortliste -> Vokabelpaare. Für Helenas Vokabeltrainer
 * („＋ Neue Einheit aus Foto“ in helena/vokabeln.html und helena/franzoesisch.html).
 *
 * Denny am 19.10.2026: „Wenn Helena Vokabeln abfotografiert … beim Paul haben
 * wir eine bessere Schrifterkennung gewählt. Ist es bei Helena auch schon
 * umgesetzt?“ Nein: trainer.js las mit Tesseract im Browser, Sprachen
 * „eng+deu“ - auch bei Französisch, also ohne é, è, ç, à. Pauls Blätter liest
 * der Server mit Opus 5.5 (Kapitel 029: kleine Modelle raten still).
 *
 * POST /api/vokabel-foto
 *   { kind: "helena", sprache: "englisch"|"franzoesisch", bild: { media_type, data } }
 * Zurück:
 *   { ok: true, paare: [{ fremd, deutsch }], unsicher: ["…"] }
 *   { ok: false, fehler, rueckfall: true }   -> trainer.js liest dann mit Tesseract
 *
 * Seit 19.10.2026 (Denny: „Zweimal lesen + Sinn prüfen“; Helena: „zwischen 1
 * und 5 Seiten … kommt auch eine Rückfrage an die Helena“) gibt es den
 * Mehrseiten-Aufruf:
 *   { kind, sprache, bilder: [{ media_type, data }, …] }   (1 bis 5 Seiten)
 * Je Seite parallel: Lesung 1 (Werkzeug, mit Zeilen-Ort), unabhängige
 * Lesung 2 (Text, kennt Lesung 1 nicht), Sinnprüfung der Paare (nur Text).
 * Zurück:
 *   { ok, anzahl, gelesen, fehlend:[nr], meldung:"5 von 5 Seiten gelesen",
 *     paare:[{fremd,deutsch,seite,pos}],              beide Lesungen gleich, Sinn passt
 *     pruefen:[{seite,pos,ort,arten,lesungen,hinweis,erwartet}],   Rückfrage an Helena
 *     seiten:[{nr,ok,paare,pruefen,zweitlesung,sinn,fehler}] }
 * Abweichungen werden markiert, NIE still geändert - das Buch gilt. Der
 * Sinnhinweis („erwartet eher …“) ist nur ein Hinweis, übernommen wird nichts.
 * Der alte Aufruf mit `bild` (eine Seite, nur Lesung 1) läuft unverändert
 * weiter - eine offene alte Seite spricht mit dem neuen Server (Kapitel 099).
 *
 * Nichts wird gespeichert außer dem Seitenzähler der Kostenbremse (ein
 * KV-Schreibvorgang je Mehrseiten-Aufruf). Das Bearbeiten vor dem Speichern
 * bleibt im Browser, die Einheit liegt wie bisher im Gerätespeicher.
 *
 * Der Schlüssel liegt als Cloudflare-Secret ANTHROPIC_API_KEY.
 */

import { ausweisGueltig, geheimFuer } from "./_riegel.js";

// Dasselbe Modell wie beim Blattlesen (schulstoff.js TITEL_MODELL, _volllesen.js).
export const MODELL = "claude-opus-5-5";

// Nur Helena nutzt den Vokabeltrainer (Kapitel 130: Paul und Leon laden trainer.js nicht).
const KINDER = ["helena"];
const SPRACHEN = {
  englisch:     { name: "Englisch",    artikel: "the, a, an, to (vor Verben)" },
  franzoesisch: { name: "Französisch", artikel: "le, la, l', les, un, une, des" },
};

// Der Browser verkleinert auf 2000 px und unter 900 KB; 5 MB ist die
// Obergrenze der Anthropic-API je Bild und lässt Platz für ein unverkleinertes Foto.
const MAX_BYTES = 5 * 1024 * 1024;
const BILDARTEN = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_PAARE = 80;

/* Wortart je Paar (19.10.2026, Denny: „Die Wortart bestimmt die KI beim
   Foto-Import und speichert sie“). Sie kommt im SELBEN Aufruf mit, kein
   zusaetzlicher Modellaufruf. Das Feld ist freiwillig: fehlt es oder passt
   es nicht in die Liste, bleibt es weg, und alte Seiten lesen nur fremd und
   deutsch wie bisher. Die Vokabel-Logik waehlt damit die Ablenker in Stufe 1;
   ohne Wortart nimmt sie Woerter derselben Lektion mit aehnlicher Laenge. */
export const WORTARTEN = ["nomen", "verb", "adjektiv", "adverb", "wendung", "sonstiges"];
const WORTART_FELD = { type: "string", enum: WORTARTEN,
  description: "Wortart des fremdsprachigen Eintrags: nomen, verb, adjektiv, adverb, wendung (mehrere Wörter, Satz, Redewendung) oder sonstiges. Im Zweifel weglassen." };
export function wortartSaubern(w) {
  const x = String(w == null ? "" : w).trim().toLowerCase();
  return WORTARTEN.includes(x) ? x : "";
}

const WERKZEUG = {
  name: "vokabeln_zurueckgeben",
  description: "Gibt die vom Foto abgeschriebenen Vokabelpaare zurück.",
  input_schema: {
    type: "object",
    properties: {
      paare: {
        type: "array",
        description: "Jede sicher gelesene Vokabel mit ihrer deutschen Bedeutung, in der Reihenfolge auf dem Blatt.",
        items: {
          type: "object",
          properties: {
            fremd:   { type: "string", description: "Das Wort oder die Wendung in der Fremdsprache, genau wie auf dem Blatt, mit Artikel, Apostroph und allen Akzenten. Ohne Lautschrift." },
            deutsch: { type: "string", description: "Die deutsche Bedeutung, genau wie auf dem Blatt. Mehrere Bedeutungen mit Komma." },
            wortart: WORTART_FELD,
          },
          required: ["fremd", "deutsch"],
        },
      },
      unsicher: {
        type: "array",
        items: { type: "string" },
        description: "Zeilen, die nicht sicher lesbar sind oder denen eine Seite fehlt. So abgeschrieben, wie sie lesbar sind; unleserliche Buchstaben als ?. Nichts raten.",
      },
    },
    required: ["paare", "unsicher"],
  },
};

export function systemtext(sprache) {
  const s = SPRACHEN[sprache] || SPRACHEN.englisch;
  return [
    `Du schreibst eine fotografierte Vokabelliste ab: ${s.name} – Deutsch.`,
    "Helena (7. Klasse Gymnasium) lernt danach genau diese Wörter. Ein falsch gelesenes Wort lernt sie falsch.",
    "",
    "REGELN",
    "- Schreib jedes Wort GENAU so ab, wie es auf dem Blatt steht. Nicht übersetzen, nicht ergänzen, nicht verbessern.",
    `- Artikel bleiben stehen (${s.artikel}), ebenso Apostrophe, Bindestriche und Klammern wie „(to) run“ oder „qn“/„qc“.`,
    "- Akzente und Sonderzeichen genau übernehmen: é è ê ë à â ç î ï ô ù û œ, im Deutschen ä ö ü ß.",
    "- Lautschrift (zwischen /…/ oder […]) weglassen.",
    "- Beispielsätze, Merkhinweise und Seitenzahlen weglassen, wenn sie in einer eigenen Spalte oder Zeile stehen.",
    "- Mehrere deutsche Bedeutungen mit Komma in ein Feld.",
    "- Ein Paar besteht aus dem Wort in der Fremdsprache und seiner deutschen Bedeutung vom Blatt.",
    "- Gib zu jedem Paar die Wortart an (nomen, verb, adjektiv, adverb, wendung, sonstiges). Bist du unsicher, lass sie weg.",
    "",
    "UNSICHER IST BESSER ALS FALSCH",
    "- Kannst du einen Buchstaben, einen Akzent oder ein Wort nicht sicher lesen, kommt die ganze Zeile nach „unsicher“, nicht nach „paare“.",
    "- Fehlt auf dem Blatt die deutsche oder die fremdsprachige Seite, kommt die Zeile ebenfalls nach „unsicher“. Erfinde die fehlende Seite nicht.",
    "- Ist auf dem Foto gar keine Vokabelliste, gib leere Listen zurück.",
    "",
    "Antworte nur über das Werkzeug vokabeln_zurueckgeben.",
  ].join("\n");
}

function antwortJson(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
const fehler = (status, text, rueckfall = true) => antwortJson(status, { ok: false, fehler: text, rueckfall });

export async function onRequestPost(context) {
  const { request, env } = context;

  let auftrag;
  try { auftrag = await request.json(); }
  catch (e) { return fehler(400, "Die Anfrage war kein gültiges JSON."); }

  const kind = String(auftrag && auftrag.kind || "").toLowerCase();
  if (!KINDER.includes(kind)) return fehler(400, "Diesen Bereich gibt es hier nicht.", false);

  /* Jeder Lauf kostet Geld - nur mit Ausweis des Kindes oder dem Eltern-Code. */
  const alsEltern = !!geheimFuer(env, "eltern") &&
    (await ausweisGueltig(request, geheimFuer(env, "eltern"), env));
  if (!alsEltern && !(await ausweisGueltig(request, geheimFuer(env, kind), env))) {
    return fehler(401, "Bitte melde dich mit deinem Code an.");
  }

  if (!env.ANTHROPIC_API_KEY) return fehler(500, "Der Schlüssel fehlt auf dem Server.");

  const sprache0 = SPRACHEN[auftrag.sprache] ? auftrag.sprache : "englisch";
  if (Array.isArray(auftrag.bilder)) {
    const g = bilderPruefen(auftrag.bilder);
    if (g.fehler) return fehler(g.status, g.fehler, g.rueckfall);
    const b = await bremse(env, kind, g.bilder.length);
    if (!b.ok) return fehler(429, "Für heute sind genug Seiten gelesen – morgen geht es wieder.");
    const e = await mehrereLesen(env.ANTHROPIC_API_KEY, g.bilder, sprache0);
    if (!e.gelesen) {
      const s = (e.seiten.find((x) => x.status === 503) || {});
      return fehler(s.status || 502, (e.seiten[0] && e.seiten[0].fehler) || "Es ließ sich keine Seite lesen.");
    }
    const { usage, ms, ...fuerBrowser } = e;
    return antwortJson(200, { ok: true, ...fuerBrowser });
  }

  const bild = auftrag.bild;
  if (!bild || typeof bild.data !== "string" || !BILDARTEN.includes(bild.media_type)) {
    return fehler(400, "Da war kein Foto dabei.", false);
  }
  const bytes = Math.floor(bild.data.length * 0.75);
  if (bytes > MAX_BYTES) {
    return fehler(400, `Das Foto ist ${(bytes / 1048576).toFixed(1)} MB groß – höchstens 5 MB.`);
  }
  const sprache = SPRACHEN[auftrag.sprache] ? auftrag.sprache : "englisch";

  const e = await lesen(env.ANTHROPIC_API_KEY, bild, sprache);
  if (!e.ok) return fehler(e.status || 502, e.text);
  return antwortJson(200, { ok: true, paare: e.paare, unsicher: e.unsicher });
}

/* Eigentlicher Lesevorgang, auch von den Messwerkzeugen aufgerufen.
   Gibt { ok, paare, unsicher, usage, ms } oder { ok:false, status, text, usage }. */
export async function lesen(schluessel, bild, sprache, abruf = fetch) {
  const anfrage = () => abruf("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": schluessel,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODELL,
      /* Puffer fürs Nachdenken: 80 Paare sind gut 2.000 Ausgabe-Tokens,
         adaptive Denkzeit kommt obendrauf. */
      max_tokens: 10000,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: systemtext(sprache),
      tools: [WERKZEUG],
      /* Opus 5.5 lehnt erzwungenes tool_choice (tool/any) mit HTTP 400 ab
         (gemessen 24.09.2026). Mit "auto" ruft es trotzdem. */
      tool_choice: { type: "auto" },
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: bild.media_type, data: bild.data } },
        { type: "text", text: "Das ist meine Vokabelliste. Schreib bitte alle Vokabelpaare ab." },
      ] }],
    }),
  });

  const ERHOLT_SICH = new Set([408, 409, 425, 500, 502, 503, 504, 529]);
  const start = Date.now();
  let r;
  try {
    r = await anfrage();
    if (!r.ok && ERHOLT_SICH.has(r.status)) {
      await new Promise((ok) => setTimeout(ok, 1500));
      r = await anfrage();
    }
  } catch (err) {
    return { ok: false, status: 502, text: "Ich komme gerade nicht zu Claude durch." };
  }

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    if (r.status === 429) return { ok: false, status: 503, text: "Gerade ist zu viel los." };
    if (/credit|billing|spend/i.test(t)) return { ok: false, status: 503, text: "Das Monatslimit ist erreicht." };
    return { ok: false, status: 502, text: "Claude hat nicht geantwortet (Code " + r.status + ")." };
  }

  const d = await r.json().catch(() => null);
  const usage = d && d.usage;
  if (!d) return { ok: false, status: 502, text: "Die Antwort war nicht lesbar." };
  if (d.stop_reason === "max_tokens") return { ok: false, status: 502, text: "Die Liste war zu lang für einen Durchgang.", usage };
  const block = (d.content || []).find((b) => b.type === "tool_use");
  if (!block || !block.input) return { ok: false, status: 502, text: "Es kam keine Wortliste zurück.", usage };

  const s = saubern(block.input);
  return { ok: true, paare: s.paare, unsicher: s.unsicher, usage, ms: Date.now() - start };
}

/* Alles, was auf den Schirm geht, wird gestutzt. Lautschrift, die trotzdem
   durchrutscht, fällt hier weg. Doppelte Paare zählen einmal. */
export function saubern(roh) {
  const kurz = (x, n) => String(x == null ? "" : x)
    .replace(/\/[^\/]{1,40}\//g, " ").replace(/\[[^\]]{1,40}\]/g, " ")
    .replace(/\s+/g, " ").trim().slice(0, n);
  const gesehen = new Set();
  const paare = [];
  for (const p of Array.isArray(roh && roh.paare) ? roh.paare : []) {
    const fremd = kurz(p && p.fremd, 120), deutsch = kurz(p && p.deutsch, 160);
    if (!fremd || !deutsch) continue;
    const k = (fremd + "\u0000" + deutsch).toLowerCase();
    if (gesehen.has(k)) continue;
    gesehen.add(k);
    const wortart = wortartSaubern(p && p.wortart);
    paare.push(wortart ? { fremd, deutsch, wortart } : { fremd, deutsch });
    if (paare.length >= MAX_PAARE) break;
  }
  const unsicher = (Array.isArray(roh && roh.unsicher) ? roh.unsicher : [])
    .map((z) => kurz(z, 160)).filter(Boolean).slice(0, 40);
  return { paare, unsicher };
}

/* Kosten in Euro aus der usage-Angabe. Opus 5.5: 4 $ je Mio. Eingabe,
   20 $ je Mio. Ausgabe (wie _volllesen.js kostenEuro). */
export function kostenEuro(usage, eurJeUsd = 0.86) {
  if (!usage) return 0;
  return ((usage.input_tokens || 0) * 4e-6 + (usage.output_tokens || 0) * 20e-6) * eurJeUsd;
}


/* =====================================================================
   Mehrseiten-Aufruf mit Zweitlesung und Sinnprüfung (19.10.2026)
   ===================================================================== */

export const MAX_SEITEN = 5;
const MAX_GESAMT_BYTES = 12 * 1024 * 1024;   // fünf verkleinerte Fotos sind < 5 MB
const MAX_PAARE_GESAMT = 300;
/* Kostenbremse: Seiten je Kind und Tag. Eine Seite kostet gemessen rund
   6 Cent (Lesung 1 + Lesung 2 + Sinnprüfung), 40 Seiten also höchstens
   rund 2,50 € am Tag. */
export const SEITEN_JE_TAG = 40;
/* Cloudflare bricht eine stille Leitung nach 90-120 s ab (Kapitel 021).
   Jede Lesung bekommt höchstens 60 s, die Sinnprüfung startet nur, solange
   der ganze Aufruf unter 80 s bleibt. */
const FRIST_LESUNG = 60000;
const FRIST_GESAMT = 80000;

const WERKZEUG_SEITE = {
  name: "vokabeln_zurueckgeben",
  description: "Gibt die vom Foto abgeschriebenen Vokabelpaare mit ihrer Zeile auf dem Foto zurück.",
  input_schema: {
    type: "object",
    properties: {
      paare: {
        type: "array",
        description: "Jede sicher gelesene Vokabel mit ihrer deutschen Bedeutung, in der Reihenfolge auf dem Blatt.",
        items: {
          type: "object",
          properties: {
            fremd:   { type: "string", description: "Das Wort oder die Wendung in der Fremdsprache, genau wie auf dem Blatt, mit Artikel, Apostroph und allen Akzenten. Ohne Lautschrift." },
            deutsch: { type: "string", description: "Die deutsche Bedeutung, genau wie auf dem Blatt. Mehrere Bedeutungen mit Komma." },
            ort: { type: "array", items: { type: "integer" }, description: "Rechteck der ganzen Zeile auf dem Foto: [links, oben, rechts, unten] in Promille von Bildbreite und Bildhöhe (0 bis 1000)." },
            wortart: WORTART_FELD,
          },
          required: ["fremd", "deutsch"],
        },
      },
      unsicher: {
        type: "array",
        description: "Zeilen, die nicht sicher lesbar sind oder denen eine Seite fehlt. Nichts raten.",
        items: {
          type: "object",
          properties: {
            fremd:   { type: "string", description: "Fremdsprachige Seite, soweit lesbar; unleserliche Buchstaben als ?, fehlt sie ganz: leer." },
            deutsch: { type: "string", description: "Deutsche Seite, soweit lesbar; unleserliche Buchstaben als ?, fehlt sie ganz: leer." },
            ort: { type: "array", items: { type: "integer" }, description: "[links, oben, rechts, unten] in Promille (0 bis 1000)." },
          },
          required: ["fremd", "deutsch"],
        },
      },
    },
    required: ["paare", "unsicher"],
  },
};

export function systemtextSeite(sprache) {
  return systemtext(sprache).replace("Antworte nur über das Werkzeug vokabeln_zurueckgeben.",
    "- Gib zu jedem Paar und jeder unsicheren Zeile `ort` an: das Rechteck der Zeile auf dem Foto als [links, oben, rechts, unten] in Promille (0 bis 1000).\n\nAntworte nur über das Werkzeug vokabeln_zurueckgeben.");
}

/* Die zweite Lesung ist absichtlich anders gebaut: reiner Text, andere
   Worte, kein Werkzeug - und sie sieht die erste Lesung nie. */
export function systemtextZweit(sprache) {
  const s = SPRACHEN[sprache] || SPRACHEN.englisch;
  return [
    `Lies die Vokabelliste auf dem Foto Buchstabe für Buchstabe ab (${s.name} und Deutsch).`,
    "Gib für jede Vokabel genau eine Zeile aus, sonst nichts:",
    "<Wort in der Fremdsprache> || <deutsche Bedeutung>",
    "",
    "- So, wie es dasteht: mit Artikel, Akzenten, Apostroph, Klammern. Nichts übersetzen oder verbessern.",
    "- Lautschrift, Beispielsätze, Überschriften und Seitenzahlen weglassen.",
    "- Einen Buchstaben, den du nicht sicher erkennst, schreibst du als ?.",
    "- Fehlt eine Seite, bleibt sie leer: „déjà || “.",
  ].join("\n");
}

export function systemtextSinn(sprache) {
  const s = SPRACHEN[sprache] || SPRACHEN.englisch;
  return [
    `Du prüfst abgeschriebene Vokabelpaare ${s.name} – Deutsch aus einem Schulbuch der 7. Klasse.`,
    "Melde NUR klare Fehler. Ein falscher Alarm ist schlimmer als ein übersehener Fehler, denn das Kind muss dann grundlos ins Buch schauen.",
    "",
    "MELDEN",
    "- sinn: Die deutsche Bedeutung passt eindeutig nicht zum Wort, z. B. „window – die Tür“, „le frère – die Schwester“.",
    "- schreibung: Das Fremdwort wird so sicher nicht geschrieben, z. B. fehlender oder falscher Akzent („la fenetre“), vertauschte Buchstaben („freind“).",
    "",
    "KEIN FEHLER",
    "- eine andere gültige oder seltenere Übersetzung, mehrere Bedeutungen, eine Bedeutung, die nur im Lehrbuch-Zusammenhang passt",
    `- Artikel (${s.artikel}) oder ihr Fehlen, Groß-/Kleinschreibung, „to“ vor Verben, Klammern, Abkürzungen wie qn, qc, sb, sth, jdn, etw.`,
    "- Großbuchstaben ohne Akzent, britische oder amerikanische Schreibweise, männliche und weibliche Form",
    "",
    "Antworte je Fund mit genau einer Zeile:",
    "Nr | sinn oder schreibung | erwartet eher: <Vorschlag>",
    "Gibt es keinen klaren Fehler, antworte nur: keine",
  ].join("\n");
}

/* Ein Anthropic-Aufruf mit Frist und einem zweiten Versuch bei Störungen. */
async function rufeClaude(schluessel, body, frist, abruf = fetch) {
  const ERHOLT_SICH = new Set([408, 409, 425, 500, 502, 503, 504, 529]);
  const ende = Date.now() + frist;
  const einmal = async () => {
    const rest = ende - Date.now();
    if (rest < 3000) throw Object.assign(new Error("frist"), { frist: true });
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const uhr = ctl ? setTimeout(() => ctl.abort(), rest) : null;
    try {
      return await abruf("https://api.anthropic.com/v1/messages", {
        method: "POST", signal: ctl ? ctl.signal : undefined,
        headers: { "content-type": "application/json", "x-api-key": schluessel, "anthropic-version": "2023-06-01" },
        body: JSON.stringify(body),
      });
    } finally { if (uhr) clearTimeout(uhr); }
  };
  let r;
  try {
    r = await einmal();
    if (!r.ok && ERHOLT_SICH.has(r.status)) { await new Promise((ok) => setTimeout(ok, 1500)); r = await einmal(); }
  } catch (err) {
    return { ok: false, status: 502, text: err && (err.frist || err.name === "AbortError") ? "Das Lesen hat zu lange gedauert." : "Ich komme gerade nicht zu Claude durch." };
  }
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    if (r.status === 429) return { ok: false, status: 503, text: "Gerade ist zu viel los." };
    if (/credit|billing|spend/i.test(t)) return { ok: false, status: 503, text: "Das Monatslimit ist erreicht." };
    return { ok: false, status: 502, text: "Claude hat nicht geantwortet (Code " + r.status + ")." };
  }
  const d = await r.json().catch(() => null);
  if (!d) return { ok: false, status: 502, text: "Die Antwort war nicht lesbar." };
  if (d.stop_reason === "max_tokens") return { ok: false, status: 502, text: "Die Liste war zu lang für einen Durchgang.", usage: d.usage };
  return { ok: true, d, usage: d.usage };
}

const textVon = (d) => (d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");

function ortSaubern(o) {
  if (!Array.isArray(o) || o.length !== 4) return null;
  const z = o.map((x) => Math.round(Number(x)));
  if (z.some((x) => !Number.isFinite(x) || x < 0 || x > 1000)) return null;
  if (z[2] <= z[0] || z[3] <= z[1]) return null;
  return z;
}
const kurz = (x, n) => String(x == null ? "" : x)
  .replace(/\/[^\/]{1,40}\//g, " ").replace(/\[[^\]]{1,40}\]/g, " ")
  .replace(/\s+/g, " ").trim().slice(0, n);

/* Lesung 1 einer Seite: wie bisher, dazu der Ort jeder Zeile. */
export function saubernSeite(roh) {
  const paare = [], gesehen = new Set();
  for (const p of Array.isArray(roh && roh.paare) ? roh.paare : []) {
    const fremd = kurz(p && p.fremd, 120), deutsch = kurz(p && p.deutsch, 160);
    if (!fremd || !deutsch) continue;
    const k = (fremd + "\u0000" + deutsch).toLowerCase();
    if (gesehen.has(k)) continue;
    gesehen.add(k);
    const wortart = wortartSaubern(p && p.wortart);
    paare.push(wortart ? { fremd, deutsch, ort: ortSaubern(p.ort), wortart } : { fremd, deutsch, ort: ortSaubern(p.ort) });
    if (paare.length >= MAX_PAARE) break;
  }
  const unsicher = [];
  for (const u of Array.isArray(roh && roh.unsicher) ? roh.unsicher : []) {
    // Ältere Antwortform: nur ein Text
    const o = typeof u === "string" ? { fremd: u, deutsch: "" } : (u || {});
    const fremd = kurz(o.fremd, 120), deutsch = kurz(o.deutsch, 160);
    if (!fremd && !deutsch) continue;
    unsicher.push({ fremd, deutsch, ort: ortSaubern(o.ort) });
    if (unsicher.length >= 40) break;
  }
  return { paare, unsicher };
}

/* Lesung 2: „fremd || deutsch“ je Zeile. */
export function zweitParsen(text) {
  const aus = [];
  for (const z0 of String(text || "").split("\n")) {
    const i = z0.indexOf("||");
    if (i < 0) continue;
    const fremd = kurz(z0.slice(0, i).replace(/^\s*[-*•\d.)]+\s+/, ""), 120);
    const deutsch = kurz(z0.slice(i + 2), 160);
    if (!fremd && !deutsch) continue;
    aus.push({ fremd, deutsch, unsicher: /\?/.test(fremd + deutsch) || !fremd || !deutsch });
    if (aus.length >= MAX_PAARE + 40) break;
  }
  return aus;
}

/* Sinnprüfung: „Nr | sinn | erwartet eher: …“ */
export function sinnParsen(text, anzahl) {
  const aus = {};
  for (const z0 of String(text || "").split("\n")) {
    const m = /^\s*[-*]?\s*(\d{1,3})\s*[|.)]\s*(sinn|schreibung)\s*(?:\|\s*(?:erwartet\s+eher\s*:?\s*)?(.*))?$/i.exec(z0);
    if (!m) continue;
    const nr = +m[1];
    if (nr < 1 || nr > anzahl) continue;
    aus[nr - 1] = { art: m[2].toLowerCase(), erwartet: kurz(m[3] || "", 120) };
  }
  return aus;
}

/* ---------- Vergleich zweier Lesungen ----------
   Keine Abweichung: Groß/klein, Artikel (le/la/l'/les, the/a/an, der/die/das),
   „to“ vor englischen Verben, Klammern, Lautschrift, Satzzeichen, Leerzeichen,
   Reihenfolge mehrerer Bedeutungen. Akzente zählen - ein verwischter Akzent
   ist genau der Fehler, um den es geht. */
const ARTIKEL = {
  englisch: /^(?:the|a|an|to)\s+/,
  franzoesisch: /^(?:le|la|les|un|une|des|du|de la|de l'|l')\s*/,
  deutsch: /^(?:der|die|das|den|dem|des|ein|eine|einen|einem|einer)\s+/,
};
function grund(s) {
  return String(s || "").normalize("NFC").toLowerCase()
    .replace(/[’‘`´]/g, "'").replace(/[“”„«»"]/g, "")
    .replace(/\/[^\/]{1,40}\//g, " ").replace(/\[[^\]]{1,40}\]/g, " ")
    .replace(/[.!?:¡¿…]/g, " ").replace(/\s*-\s*/g, "-").replace(/\s+/g, " ").trim();
}
function ohneArtikel(s, sprache) {
  let x = s, alt;
  do { alt = x; x = x.replace(ARTIKEL[sprache] || ARTIKEL.englisch, "").trim(); } while (x !== alt && x);
  return x || s;
}
/* Alle gleichwertigen Formen eines Eintrags: Klammern mit Inhalt und ohne. */
export function formen(s, sprache) {
  const g = grund(s);
  const mit = g.replace(/[()]/g, "").replace(/\s+/g, " ").trim();
  const ohne = g.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  const set = new Set();
  for (const f of [mit, ohne]) {
    if (!f) continue;
    set.add(ohneArtikel(f.replace(/[,;]\s*/g, ", "), sprache));
  }
  return set;
}
function bedeutungen(s) {
  return new Set(String(s || "").split(/[,;\/]|\boder\b/)
    .map((t) => [...formen(t, "deutsch")][0] || "").filter(Boolean));
}
export function fremdGleich(a, b, sprache) {
  const fa = formen(a, sprache), fb = formen(b, sprache);
  for (const x of fa) if (fb.has(x)) return true;
  return false;
}
/* "gleich", "teil" (b hat nur einen Teil der Bedeutungen von a) oder "anders" */
export function deutschVergleich(a, b) {
  const A = bedeutungen(a), B = bedeutungen(b);
  if (!A.size || !B.size) return "anders";
  let inA = 0; for (const x of B) if (A.has(x)) inA++;
  if (inA === B.size && A.size === B.size) return "gleich";
  if (inA === B.size) return "teil";
  return "anders";
}
function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  let v = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const w = [i];
    for (let j = 1; j <= n; j++) w[j] = Math.min(v[j] + 1, w[j - 1] + 1, v[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    v = w;
  }
  return v[n];
}
function aehnlich(a, b) {
  const x = grund(a), y = grund(b);
  if (!x && !y) return 1;
  return 1 - lev(x, y) / Math.max(x.length, y.length, 1);
}

/* Paare der beiden Lesungen einander zuordnen: die ähnlichsten zuerst,
   Reihenfolge auf dem Blatt als leichter Ausgleich. */
export function zuordnen(liste1, liste2) {
  const kand = [];
  const n1 = Math.max(liste1.length, 1), n2 = Math.max(liste2.length, 1);
  liste1.forEach((a, i) => liste2.forEach((b, j) => {
    const s = (aehnlich(a.fremd, b.fremd) * 0.6 + aehnlich(a.deutsch, b.deutsch) * 0.4) - 0.15 * Math.abs(i / n1 - j / n2);
    if (s >= 0.45) kand.push([s, i, j]);
  }));
  kand.sort((x, y) => y[0] - x[0]);
  const zu1 = new Array(liste1.length).fill(-1), zu2 = new Array(liste2.length).fill(-1);
  for (const [, i, j] of kand) if (zu1[i] < 0 && zu2[j] < 0) { zu1[i] = j; zu2[j] = i; }
  return { zu1, zu2 };
}

const pur = (p) => (p.wortart ? { fremd: p.fremd, deutsch: p.deutsch, wortart: p.wortart } : { fremd: p.fremd, deutsch: p.deutsch });
const hatFragezeichen = (p) => /\?/.test(p.fremd + p.deutsch) || !p.fremd || !p.deutsch;

/* Eine Seite: Lesung 1, Lesung 2 und Sinnprüfung zusammenführen.
   l1 = { paare, unsicher }, l2 = [{fremd,deutsch,unsicher}] oder null (fehlgeschlagen),
   sinn = { index: {art, erwartet} } oder null (nicht geprüft). */
export function seiteZusammenfuehren(nr, l1, l2, sinn, sprache) {
  const paare = [], pruefen = [];
  const pos = (i) => nr * 1000 + i;
  const zweit = Array.isArray(l2) ? l2 : null;
  const { zu1, zu2 } = zweit ? zuordnen(l1.paare, zweit) : { zu1: [], zu2: [] };

  l1.paare.forEach((p, i) => {
    const arten = [], lesungen = [pur(p)];
    let hinweis = "", erwartet = "";
    if (zweit) {
      const j = zu1[i];
      if (j < 0) { arten.push("einmal"); hinweis = "Nur einmal gelesen."; }
      else {
        const q = zweit[j];
        const fg = fremdGleich(p.fremd, q.fremd, sprache);
        const dv = deutschVergleich(p.deutsch, q.deutsch);
        // „teil“: Lesung 2 hat nur einen Teil der Bedeutungen - Lesung 1 hat mehr gelesen, kein Alarm.
        if (!fg || dv === "anders" || q.unsicher) {
          arten.push("abweichend");
          lesungen.push({ ...pur(q), unsicher: !!q.unsicher || undefined });
          hinweis = "Zweimal gelesen, zweimal verschieden.";
        }
      }
    }
    const s = sinn && sinn[i];
    if (s) {
      arten.push(s.art);
      erwartet = s.erwartet;
      hinweis = (hinweis ? hinweis + " " : "") + (s.art === "schreibung" ? "Die Schreibweise sieht ungewöhnlich aus." : "Passt die Bedeutung?");
    }
    if (arten.length) pruefen.push({ seite: nr, pos: pos(i), ort: p.ort, arten, lesungen, hinweis, erwartet });
    else paare.push({ ...pur(p), seite: nr, pos: pos(i) });
  });

  // Was Lesung 1 nicht sicher lesen konnte - mit einer passenden Zeile aus Lesung 2, falls da.
  const frei2 = zweit ? zweit.map((q, j) => (zu2[j] < 0 ? j : -1)).filter((j) => j >= 0) : [];
  const genommen = new Set();
  l1.unsicher.forEach((u, k) => {
    const lesungen = [{ ...pur(u), unsicher: true }];
    let best = -1, bs = 0.4;
    for (const j of frei2) {
      if (genommen.has(j)) continue;
      const q = zweit[j];
      const sc = aehnlich(u.fremd, q.fremd) * 0.6 + aehnlich(u.deutsch, q.deutsch) * 0.4;
      if (sc > bs) { bs = sc; best = j; }
    }
    if (best >= 0) { genommen.add(best); lesungen.push({ ...pur(zweit[best]), unsicher: !!zweit[best].unsicher || undefined }); }
    const hinweis = !u.deutsch ? "Auf dem Foto fehlt die deutsche Bedeutung." : !u.fremd ? "Auf dem Foto fehlt das " + (sprache === "franzoesisch" ? "französische" : "englische") + " Wort." : "Nicht sicher lesbar.";
    pruefen.push({ seite: nr, pos: pos(500 + k), ort: u.ort, arten: ["unsicher"], lesungen, hinweis, erwartet: "" });
  });
  // Was nur Lesung 2 gesehen hat - nichts verschwindet still.
  frei2.filter((j) => !genommen.has(j)).forEach((j, k) => {
    const q = zweit[j];
    pruefen.push({ seite: nr, pos: pos(800 + k), ort: null, arten: ["einmal"],
      lesungen: [{ ...pur(q), unsicher: !!q.unsicher || undefined }], hinweis: "Nur einmal gelesen.", erwartet: "" });
  });
  // Zwei gleich gelesene Fassungen stehen nur einmal zur Wahl.
  for (const r of pruefen) {
    const da = new Set();
    r.lesungen = r.lesungen.filter((l) => { const k = l.fremd + "\u0000" + l.deutsch; if (da.has(k)) return false; da.add(k); return true; });
  }
  pruefen.sort((a, b) => a.pos - b.pos);
  return { paare, pruefen };
}

/* Dubletten über Seiten: gleiche Vokabel auf zwei Fotos zählt einmal. Eine
   Rückfrage entfällt, wenn eine ihrer Lesungen schon sicher in der Liste steht. */
export function seitenZusammenfuehren(seiten, sprache) {
  const schluessel = (p) => [...formen(p.fremd, sprache)][0] + "\u0000" + [...bedeutungen(p.deutsch)].sort().join(",");
  const gesehen = new Set(), paare = [], pruefen = [];
  for (const s of seiten) for (const p of s.paare || []) {
    const k = schluessel(p);
    if (gesehen.has(k)) continue;
    gesehen.add(k); paare.push(p);
    if (paare.length >= MAX_PAARE_GESAMT) break;
  }
  const fragen = new Set();
  for (const s of seiten) for (const r of s.pruefen || []) {
    const ks = r.lesungen.filter((l) => !hatFragezeichen(l)).map(schluessel);
    if (ks.some((k) => gesehen.has(k))) continue;
    const kf = ks.sort().join("|");
    if (kf && fragen.has(kf)) continue;
    if (kf) fragen.add(kf);
    pruefen.push(r);
  }
  return { paare, pruefen };
}

/* Eine Seite komplett: Lesung 1 und 2 parallel, Sinnprüfung hinter Lesung 1. */
export async function seiteLesen(schluessel, bild, sprache, nr, start = Date.now(), abruf = fetch) {
  const bildTeil = { type: "image", source: { type: "base64", media_type: bild.media_type, data: bild.data } };
  const usage = [];
  const merk = (u) => { if (u) usage.push(u); };
  const lesung1 = rufeClaude(schluessel, {
    model: MODELL, max_tokens: 12000, thinking: { type: "adaptive" }, output_config: { effort: "low" },
    system: systemtextSeite(sprache), tools: [WERKZEUG_SEITE],
    /* Opus 5.5 lehnt erzwungenes tool_choice (tool/any) mit HTTP 400 ab. */
    tool_choice: { type: "auto" },
    messages: [{ role: "user", content: [bildTeil, { type: "text", text: "Das ist meine Vokabelliste. Schreib bitte alle Vokabelpaare ab." }] }],
  }, Math.min(FRIST_LESUNG, FRIST_GESAMT - (Date.now() - start)), abruf).then((e) => {
    merk(e.usage);
    if (!e.ok) return { ok: false, text: e.text, status: e.status };
    const block = (e.d.content || []).find((b) => b.type === "tool_use");
    if (!block || !block.input) return { ok: false, text: "Es kam keine Wortliste zurück.", status: 502 };
    return { ok: true, ...saubernSeite(block.input) };
  });
  const lesung2 = rufeClaude(schluessel, {
    model: MODELL, max_tokens: 10000, thinking: { type: "adaptive" }, output_config: { effort: "low" },
    system: systemtextZweit(sprache),
    messages: [{ role: "user", content: [bildTeil, { type: "text", text: "Bitte jede Vokabel als „fremd || deutsch“." }] }],
  }, Math.min(FRIST_LESUNG, FRIST_GESAMT - (Date.now() - start)), abruf).then((e) => {
    merk(e.usage);
    return e.ok ? zweitParsen(textVon(e.d)) : null;
  });
  const sinnPromise = lesung1.then(async (l1) => {
    if (!l1.ok || !l1.paare.length) return null;
    const rest = FRIST_GESAMT - (Date.now() - start);
    if (rest < 8000) return null;
    const liste = l1.paare.map((p, i) => `${i + 1}. ${p.fremd} = ${p.deutsch}`).join("\n");
    const e = await rufeClaude(schluessel, {
      model: MODELL, max_tokens: 6000, thinking: { type: "adaptive" }, output_config: { effort: "low" },
      system: systemtextSinn(sprache),
      messages: [{ role: "user", content: [{ type: "text", text: liste }] }],
    }, rest, abruf);
    merk(e.usage);
    return e.ok ? sinnParsen(textVon(e.d), l1.paare.length) : null;
  });
  const [l1, l2, sinn] = await Promise.all([lesung1, lesung2, sinnPromise]);
  if (!l1.ok) return { nr, ok: false, fehler: l1.text, status: l1.status, usage };
  const z = seiteZusammenfuehren(nr, l1, l2, sinn, sprache);
  return { nr, ok: true, ...z, zweitlesung: !!l2, sinn: !!sinn, usage };
}

/* Alle Seiten parallel. Für jede Seite wird ein Ergebnis gezählt. */
export async function mehrereLesen(schluessel, bilder, sprache, abruf = fetch) {
  const start = Date.now();
  const seiten = await Promise.all(bilder.map((b, i) =>
    seiteLesen(schluessel, b, sprache, i + 1, start, abruf).catch((err) => ({ nr: i + 1, ok: false, fehler: "Beim Lesen ging etwas schief.", usage: [] }))));
  const gut = seiten.filter((s) => s.ok);
  const { paare, pruefen } = seitenZusammenfuehren(gut, sprache);
  const fehlend = seiten.filter((s) => !s.ok).map((s) => s.nr);
  const usage = seiten.flatMap((s) => s.usage || []);
  return {
    anzahl: bilder.length, gelesen: gut.length, fehlend, paare, pruefen,
    meldung: `${gut.length} von ${bilder.length} Seite${bilder.length === 1 ? "" : "n"} gelesen` +
      (fehlend.length ? ` – Seite ${fehlend.join(", ")} fehlt` : ""),
    seiten: seiten.map((s) => ({ nr: s.nr, ok: s.ok, paare: s.ok ? s.paare.length : 0, pruefen: s.ok ? s.pruefen.length : 0,
      zweitlesung: !!s.zweitlesung, sinn: !!s.sinn, fehler: s.ok ? undefined : s.fehler, status: s.ok ? undefined : s.status })),
    usage, ms: Date.now() - start,
  };
}
export function kostenSumme(usage) { return (usage || []).reduce((n, u) => n + kostenEuro(u), 0); }

/* Prüft den Mehrseiten-Auftrag. Gibt { bilder } oder { fehler, status, rueckfall }. */
export function bilderPruefen(liste) {
  if (!Array.isArray(liste) || !liste.length) return { fehler: "Da war kein Foto dabei.", status: 400, rueckfall: false };
  if (liste.length > MAX_SEITEN) return { fehler: `Höchstens ${MAX_SEITEN} Seiten auf einmal.`, status: 400, rueckfall: false };
  let gesamt = 0;
  for (let i = 0; i < liste.length; i++) {
    const b = liste[i];
    if (!b || typeof b.data !== "string" || !BILDARTEN.includes(b.media_type)) return { fehler: `Seite ${i + 1} ist kein Foto.`, status: 400, rueckfall: false };
    const bytes = Math.floor(b.data.length * 0.75);
    if (bytes > MAX_BYTES) return { fehler: `Seite ${i + 1} ist ${(bytes / 1048576).toFixed(1)} MB groß – höchstens 5 MB.`, status: 400, rueckfall: true };
    gesamt += bytes;
  }
  if (gesamt > MAX_GESAMT_BYTES) return { fehler: "Die Fotos sind zusammen zu groß.", status: 400, rueckfall: true };
  return { bilder: liste.map((b) => ({ media_type: b.media_type, data: b.data })) };
}

/* Kostenbremse: Seiten je Kind und Tag (ein Lese- und ein Schreibvorgang je Aufruf). */
export async function bremse(env, kind, seiten, jetzt = new Date()) {
  if (!env.PAUL_KV) return { ok: true };
  const k = "vokabelfoto:" + kind + ":" + jetzt.toISOString().slice(0, 10);
  let n = 0;
  try { n = Number(await env.PAUL_KV.get(k)) || 0; } catch (e) {}
  if (n + seiten > SEITEN_JE_TAG) return { ok: false, n };
  try { await env.PAUL_KV.put(k, String(n + seiten), { expirationTtl: 2 * 86400 }); } catch (e) {}
  return { ok: true, n: n + seiten };
}
