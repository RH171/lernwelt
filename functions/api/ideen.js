// "Was könnte man an diesem Spiel noch besser machen?"
//
// Denny am 08.09.2026: "Paul wollte jetzt eigentlich schreiben, ob du Ideen
// hast, um dieses Spiel weiterzuentwickeln. Vielleicht könntest du hier einen
// Button einbauen ... Die Kinder könnten das dann bestätigen oder
// Änderungswünsche eingeben."
//
// Ein Kind, das gefragt wird, antwortet. Ein Kind, das vor einem leeren Feld
// sitzt, oft nicht - obwohl es genaue Vorstellungen hat. Deshalb macht die
// Werkstatt drei Vorschläge, und das Kind sagt ja, nein oder "anders".
//
// Die Vorschläge sind bewusst KLEIN gehalten: Was hier steht, soll auch
// gebaut werden können. Ein Kind, dem Großes versprochen wird und dann nichts
// passiert, meldet sich nicht wieder.

import { ausweisGueltig, geheimFuer, brauchtAusweis } from "./_riegel.js";

const MODELL = "claude-opus-5";
const KINDER = {
  paul:   { name: "Paul",   alter: "10 Jahre, 4. Klasse Grundschule" },
  leon:   { name: "Leon",   alter: "7 Jahre, 2. Klasse Grundschule, grosser Fan der SpVgg Greuther Fürth" },
  helena: { name: "Helena", alter: "12 Jahre, 7. Klasse Gymnasium" },
};
const PRO_STUNDE = 8;

const REGELN = `Du bist die Werkstatt in einer Lern-App, die ein Vater für seine drei Kinder
gebaut hat. Ein Kind fragt gerade: "Wie könnte man dieses Spiel noch besser machen?"

Mach GENAU DREI Vorschläge. Für jeden:
  titel  – was es ist, in höchstens 6 Wörtern, aus Sicht des Kindes
  warum  – ein Satz, warum das Spaß macht oder beim Lernen hilft

WAS EINEN GUTEN VORSCHLAG AUSMACHT:
- KLEIN genug, dass er wirklich gebaut werden kann. Ein neuer Knopf, eine neue
  Aufgabenart, eine Anzeige, ein Ton, eine Belohnung. Kein zweites Spiel.
- Er passt zu DIESEM Spiel und zu diesem Kind. Nichts Beliebiges, das überall
  ginge.
- Er macht das Lernen besser, nicht nur bunter. Etwas, das zum Wiederholen
  einlädt, ist mehr wert als eine Animation.
- Belohnung immer als Rückschau ("du hast schon 12 geschafft"), nie als Druck
  ("gleich verlierst du deine Serie"). Gelobt wird das Drangeblieben-Sein,
  nie die Begabung.
- Für ein Kind formuliert, in seiner Sprache. Kein Fachwort, kein "Feature".

Mach die drei Vorschläge VERSCHIEDEN: einen, der das Üben leichter macht,
einen, der es schwerer oder spannender macht, und einen, der zeigt, was schon
geschafft ist.`;

const SCHEMA = {
  name: "vorschlaege",
  description: "Drei Vorschläge, wie das Spiel besser werden könnte.",
  input_schema: {
    type: "object",
    properties: {
      ideen: {
        type: "array",
        minItems: 3, maxItems: 3,
        items: {
          type: "object",
          properties: {
            titel: { type: "string", description: "Höchstens 6 Wörter, aus Sicht des Kindes." },
            warum: { type: "string", description: "Ein Satz: warum das Spaß macht oder hilft." },
          },
          required: ["titel", "warum"],
          additionalProperties: false,
        },
      },
    },
    required: ["ideen"],
    additionalProperties: false,
  },
};

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANTHROPIC_API_KEY) return json(500, { ok: false, fehler: "Der Schlüssel fehlt auf dem Server." });

  let daten = {};
  try { daten = await request.json(); } catch (e) {}
  const kind = String(daten.kind || "").toLowerCase();
  if (!KINDER[kind]) return json(400, { ok: false, fehler: "Welches Kind denn?" });

  if (brauchtAusweis(env, kind) && !(await ausweisGueltig(request, geheimFuer(env, kind), env)))
    return json(401, { ok: false, fehler: "Nicht angemeldet." });

  // Kostenbremse - dieselbe Regel wie bei den Sofortantworten.
  if (env.PAUL_KV) {
    const s = "ideenzaehler:" + kind + ":" + new Date().toISOString().slice(0, 13);
    let n = 0;
    try { n = Number(await env.PAUL_KV.get(s)) || 0; } catch (e) {}
    if (n >= PRO_STUNDE) return json(429, { ok: false, fehler: "Gleich wieder – erstmal ausprobieren!" });
    try { await env.PAUL_KV.put(s, String(n + 1), { expirationTtl: 7200 }); } catch (e) {}
  }

  const k = KINDER[kind];
  const wo = String(daten.seite || "").slice(0, 120);
  const titel = String(daten.titel || "").slice(0, 120);
  const beschreibung = String(daten.beschreibung || "").slice(0, 1200);

  const frage =
    `Das Kind heißt ${k.name} (${k.alter}).\n` +
    `Das Spiel heißt "${titel}" und liegt unter ${wo}.\n\n` +
    (beschreibung ? `So stellt sich das Spiel selbst vor:\n${beschreibung}\n\n` : "") +
    `Was könnte man daran besser machen?`;

  try {
    const a = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODELL,
        max_tokens: 1200,
        system: REGELN,
        tools: [SCHEMA],
        tool_choice: { type: "tool", name: "vorschlaege" },
        messages: [{ role: "user", content: frage }],
      }),
    });
    if (!a.ok) return json(502, { ok: false, fehler: "Die Werkstatt antwortet gerade nicht." });
    const j = await a.json();
    const b = (j.content || []).find((c) => c.type === "tool_use");
    if (!b || !b.input || !Array.isArray(b.input.ideen))
      return json(502, { ok: false, fehler: "Da kam nichts Brauchbares zurück." });
    return json(200, { ok: true, ideen: b.input.ideen.slice(0, 3) });
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
