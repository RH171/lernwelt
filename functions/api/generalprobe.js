/* Generalprobe "D | Lesen": die Werkstatt schaut auf die freien Antworten (04.10.2026).
 *
 * POST /api/generalprobe  { kind, titel, zeilen:[...], antworten:[{nr, auftrag, antwort}] }
 * Antwort: { ok, hinweise:[{nr, hinweis}] }
 *
 * Nur fuer die drei Aufgaben, die keine Maschine sicher pruefen kann: die
 * Antwort im ganzen Satz (1), den ergaenzten Anfang (3) und die Meinung (7). Keine Weil-Antworten: Pauls Lehrerin erlaubt sie nicht (04.10.2026).
<<<<<<< HEAD
 * Die Werkstatt sagt NUR, worauf das Kind achten soll - keine Musterloesung, keine
=======
 * Die Werkstatt sagt NUR, worauf Paul achten soll - keine Musterloesung, keine
>>>>>>> bau/gp-druck
 * Note, keine Punkte. Das ist zusaetzlich mechanisch abgesichert (verraet()),
 * weil eine Bitte im Auftrag keine Pruefung ist.
 *
 * Die Geschichte schickt die Seite mit (die Datei ist ein Browser-Skript und
 * im Worker nicht ladbar). Gedeckelt: 30 Zeilen, je Antwort 400 Zeichen.
 * Kein KV: Ein Zaehler kostete Schreibvorgaenge, und der Endpunkt braucht
 * Pauls Ausweis.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";

const MODELL = "claude-opus-5-5";
/* Leon dazu am 04.10.2026 (Denny: "dasselbe altersgerecht fuer Helena und
 * Leon"). Bei ihm ist nur EIN Satz frei: er schreibt einen angefangenen Satz
 * zu Ende. Der Hinweis ist kuerzer und in Woertern fuer einen Zweitklaessler. */
const KINDER = {
  paul: { name: "Paul", klasse: "4. Klasse" },
  leon: { name: "Leon", klasse: "2. Klasse" },
};

const REGELN =
  "Du schaust einem Viertklaessler ueber die Schulter. Er uebt fuer eine Probe 'Lesen' " +
  "(Grundschule Bayern): Geschichte lesen, Fragen IM GANZEN SATZ beantworten, die Lehrerin " +
  "verlangt das ausdruecklich. Zu jeder Antwort gibst du GENAU EINEN kurzen Hinweis " +
  "(hoechstens 22 Woerter, du-Form, freundlich, kein Rot, keine Fehlerliste). " +
  "Worauf du achtest: ganzer Satz mit Subjekt und Verb? Punkt am Ende? Grossschreibung am " +
  "Satzanfang und bei Nomen? Passt die Antwort zur Frage und zum Text? Bei der Meinungsfrage: " +
  "steht eine klare Meinung im ganzen Satz da? WICHTIG: Die Lehrerin erlaubt KEINE Antworten mit 'weil'. Verlange oder lobe nie 'weil'; steht 'weil' in der Antwort, sag freundlich, dass Frau Sy Antworten ohne 'weil' moechte. Ist etwas gut, sag das zuerst in drei Woertern. " +
  "VERBOTEN: die richtige Antwort nennen, einen Mustersatz vorgeben, Woerter aus der Geschichte " +
  "abschreiben, eine Note oder Punkte vergeben. Sag hoechstens, WO er nachlesen soll. " +
  'Antworte NUR mit JSON: {"hinweise":[{"nr":1,"hinweis":"..."}]}';

<<<<<<< HEAD
const REGELN_LEON =
  "Du schaust einem Zweitklaessler (Grundschule Bayern, Leseanfaenger) ueber die Schulter. " +
  "Er hat eine kurze Geschichte gelesen und einen angefangenen Satz zu Ende geschrieben. " +
  "Gib GENAU EINEN Hinweis: hoechstens 15 Woerter, ganz einfache kurze Woerter, du-Form, " +
  "freundlich, kein Rot, keine Fehlerliste. Ist etwas gut, sag das zuerst in zwei, drei Woertern. " +
  "Worauf du achtest: Passt der Satz zur Geschichte? Steht am Ende ein Punkt? Nomen gross? " +
  "Rechtschreibung nur sanft und hoechstens ein Wort ansprechen. " +
  "WICHTIG: Verlange oder lobe nie 'weil' und frag nie nach einem Grund (Denny, 04.10.2026). " +
  "VERBOTEN: die Antwort vorsagen, einen Mustersatz vorgeben, Woerter aus der Geschichte " +
  "abschreiben, eine Note oder Punkte vergeben. Sag hoechstens, WO er nachlesen soll. " +
  'Antworte NUR mit JSON: {"hinweise":[{"nr":5,"hinweis":"..."}]}';
const REGELN_JE_KIND = { paul: REGELN, leon: REGELN_LEON };

const WEIL_ERSATZ = "Frau Sy möchte Antworten ohne \u201eweil\u201c. Schreib deine Meinung als ganzen Satz.";
/* Leon: Frau Sy ist Pauls Lehrerin, nicht seine. Bei ihm faellt ein Weil-Hinweis
 * still auf den neutralen Satz zurueck - verlangt und gelobt wird "weil" nie. */
const WEIL_ERSATZ_JE_KIND = { leon: "Lies deinen Satz noch einmal. Passt er zur Geschichte? Punkt am Ende?" };
=======
const WEIL_ERSATZ = "Frau Sy möchte Antworten ohne \u201eweil\u201c. Schreib deine Meinung als ganzen Satz.";
>>>>>>> bau/gp-druck
const ERSATZ = "Lies selbst nach: ganzer Satz? Punkt am Ende? Passt es zur Frage?";

const woerter = (s) => (String(s).toLowerCase().match(/[a-zäöüß]+/g) || []);

/* true, wenn der Hinweis vier Woerter am Stueck aus der Geschichte enthaelt
 * (= abgeschriebene Loesung) oder eine Note bzw. Punkte nennt. */
export function verraet(hinweis, zeilen) {
  const h = String(hinweis || "");
  // "Punkt am Ende" ist ein Hinweis, "3 Punkte" eine Bewertung.
  if (/\bnoten?\b|\bpunkte\b|\d+\s*punkt|\bbe\b/i.test(h)) return true;
  const hw = woerter(h).join(" ");
  for (const z of zeilen || []) {
    const w = woerter(z);
    for (let i = 0; i + 4 <= w.length; i++) {
      if ((" " + hw + " ").includes(" " + w.slice(i, i + 4).join(" ") + " ")) return true;
    }
  }
  return false;
}

export function hinweiseAuswerten(text, zeilen, nummern, kind) {
  let liste = [];
  try {
    const m = String(text).match(/\{[\s\S]*\}/);
    const j = JSON.parse(m ? m[0] : "");
    if (Array.isArray(j.hinweise)) liste = j.hinweise;
  } catch (e) {}
  return nummern.map((nr) => {
    const f = liste.find((x) => x && Number(x.nr) === nr);
    const h = f && typeof f.hinweis === "string" ? f.hinweis.trim().slice(0, 220) : "";
    if (!h || verraet(h, zeilen)) return { nr, hinweis: ERSATZ, ersetzt: true };
    // Pauls Lehrerin erlaubt keine Weil-Antworten (04.10.2026): ein Hinweis,
    // der "weil" lobt oder verlangt, wird ersetzt. Erlaubt ist nur "ohne 'weil'".
<<<<<<< HEAD
    if (/\bweil\b/i.test(h) && !/ohne\s+.?weil/i.test(h)) return { nr, hinweis: WEIL_ERSATZ_JE_KIND[kind] || WEIL_ERSATZ, ersetzt: true };
=======
    if (/\bweil\b/i.test(h) && !/ohne\s+.?weil/i.test(h)) return { nr, hinweis: WEIL_ERSATZ, ersetzt: true };
>>>>>>> bau/gp-druck
    return { nr, hinweis: h };
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let daten = {};
  try { daten = await request.json(); } catch (e) {}
  const kind = String(daten.kind || "").toLowerCase();
  if (!KINDER[kind]) return json(400, { ok: false, fehler: "Welches Kind denn?" });
  if (!(await ausweisGueltig(request, geheimFuer(env, kind), env)))
    return json(401, { ok: false, fehler: "Nicht angemeldet." });
  if (!env.ANTHROPIC_API_KEY) return json(503, { ok: false, fehler: "Die Werkstatt ist gerade nicht erreichbar." });

  const zeilen = (Array.isArray(daten.zeilen) ? daten.zeilen : []).slice(0, 30).map((z) => String(z).slice(0, 200));
  const antworten = (Array.isArray(daten.antworten) ? daten.antworten : []).slice(0, 3)
    .map((a) => ({ nr: Number(a.nr) || 0, auftrag: String(a.auftrag || "").slice(0, 300), antwort: String(a.antwort || "").slice(0, 400) }))
    .filter((a) => a.nr > 0);
  if (!antworten.length) return json(400, { ok: false, fehler: "Keine Antworten." });

  const frage =
    `Geschichte "${String(daten.titel || "").slice(0, 80)}" (Zeilen nummeriert):\n` +
    zeilen.map((z, i) => `${i + 1} ${z}`).join("\n") + "\n\n" +
    antworten.map((a) => `Aufgabe ${a.nr}: ${a.auftrag}\n${KINDER[kind].name}s Antwort: ${a.antwort || "(leer)"}`).join("\n\n");

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODELL,
        // Das Denken zaehlt in max_tokens (24.09.2026) - genug Luft und effort low.
        max_tokens: 4000,
        output_config: { effort: "low" },
        system: REGELN_JE_KIND[kind] || REGELN,
        messages: [{ role: "user", content: frage }],
      }),
    });
    if (!r.ok) return json(502, { ok: false, fehler: "Die Werkstatt antwortet gerade nicht (" + r.status + ")." });
    const j = await r.json();
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
    return json(200, { ok: true, hinweise: hinweiseAuswerten(text, zeilen, antworten.map((a) => a.nr), kind) });
  } catch (e) {
    return json(502, { ok: false, fehler: "Die Werkstatt antwortet gerade nicht." });
  }
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
