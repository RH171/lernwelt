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
 * Nichts wird gespeichert, kein KV-Schreibvorgang. Das Bearbeiten vor dem
 * Speichern bleibt im Browser, die Einheit liegt wie bisher im Gerätespeicher.
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
    paare.push({ fremd, deutsch });
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
