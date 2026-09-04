// Foto oder Datei rein -> Lernspiel raus.
//
// POST /api/spiel-bauen
//   { kind: "paul", seiten: [{ media_type, data }, ...], wunsch?: "..." }
//
// Der Schlüssel liegt als Cloudflare-Secret ANTHROPIC_API_KEY und taucht
// weder im Code noch in einer Antwort auf.
//
// Zurück kommen SPIELDATEN, kein fertiges HTML: Inhalt und Darstellung sind
// getrennt. Dieselben Daten kann eine feste Bauform füllen oder ein frei
// erfundenes Spiel - das entscheidet die Werkstatt, nicht der Server.

const MODELL = "claude-opus-5";

// Welches Kind lernt nach welchem Lehrplan.
const KINDER = {
  paul:   { datei: "grundschule-3-4.json", stufe: "4. Klasse Grundschule", alter: 9 },
  leon:   { datei: "grundschule-1-2.json", stufe: "2. Klasse Grundschule", alter: 7 },
  helena: { datei: "gymnasium-7.json",     stufe: "7. Klasse Gymnasium",   alter: 12 },
};

// Grenzen der Claude-API: 32 MB und 600 Seiten pro Anfrage.
const MAX_BYTES = 24 * 1024 * 1024;   // Sicherheitsabstand zu den 32 MB
const MAX_SEITEN = 20;                // Werkstatt-Grenze; Bücher kommen später

// Die Bauformen, die die Werkstatt darstellen kann.
const SPIELARTEN = ["quiz", "zuordnen", "luecken", "karteikarten", "sammeln"];

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return fehler(500, "Der Schlüssel fehlt auf dem Server. Denny muss ihn bei Cloudflare als ANTHROPIC_API_KEY hinterlegen.");
  }

  let auftrag;
  try {
    auftrag = await request.json();
  } catch (e) {
    return fehler(400, "Die Anfrage war kein gültiges JSON.");
  }

  const kind = KINDER[auftrag.kind] ? auftrag.kind : "paul";
  const seiten = Array.isArray(auftrag.seiten) ? auftrag.seiten : [];

  if (seiten.length === 0) return fehler(400, "Es wurde kein Bild und keine Datei mitgeschickt.");
  if (seiten.length > MAX_SEITEN) return fehler(400, `Das sind ${seiten.length} Seiten. Mehr als ${MAX_SEITEN} auf einmal kann die Werkstatt noch nicht.`);

  let bytes = 0;
  for (const s of seiten) {
    if (!s || typeof s.data !== "string" || typeof s.media_type !== "string") {
      return fehler(400, "Eine der Seiten war unvollständig.");
    }
    bytes += Math.floor(s.data.length * 0.75); // base64 -> echte Bytes
  }
  if (bytes > MAX_BYTES) {
    return fehler(400, `Zusammen ${(bytes / 1048576).toFixed(1)} MB - das ist zu viel für einen Rutsch. Bitte weniger oder kleinere Seiten.`);
  }

  // Lehrplan des Kindes holen (liegt als statische Datei neben der Seite).
  let lehrplan;
  try {
    const url = new URL("/lehrplan/" + KINDER[kind].datei, request.url);
    const r = await fetch(url.toString());
    if (!r.ok) throw new Error("HTTP " + r.status);
    lehrplan = await r.json();
  } catch (e) {
    return fehler(500, "Der Lehrplan konnte nicht geladen werden.");
  }

  const inhalt = [];
  for (const s of seiten) {
    inhalt.push(
      s.media_type === "application/pdf"
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: s.data } }
        : { type: "image",    source: { type: "base64", media_type: s.media_type,      data: s.data } }
    );
  }
  inhalt.push({ type: "text", text: auftrag.wunsch
    ? `Das ist mein Schulstoff. Zusätzlicher Wunsch von mir: ${String(auftrag.wunsch).slice(0, 400)}`
    : "Das ist mein Schulstoff. Bau mir ein Spiel daraus." });

  const antwort = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODELL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: [{ type: "text", text: systemtext(kind, lehrplan), cache_control: { type: "ephemeral" } }],
      tools: [WERKZEUG],
      tool_choice: { type: "tool", name: "spiel_bauen" },
      messages: [{ role: "user", content: inhalt }],
    }),
  });

  if (!antwort.ok) {
    const text = await antwort.text().catch(() => "");
    // Nie den Schlüssel oder rohe API-Fehler nach außen geben.
    if (antwort.status === 401 || antwort.status === 403) return fehler(500, "Der Server darf gerade nicht bei Claude anfragen. Denny muss den Schlüssel prüfen.");
    if (antwort.status === 429) return fehler(503, "Gerade ist zu viel los. Bitte in einer Minute nochmal.");
    if (text.includes("credit") || text.includes("billing")) return fehler(503, "Das Guthaben ist aufgebraucht oder das Monatslimit erreicht. Denny muss nachsehen.");
    return fehler(502, "Claude hat nicht geantwortet. Bitte nochmal versuchen.");
  }

  const daten = await antwort.json();
  const block = (daten.content || []).find((b) => b.type === "tool_use");
  if (!block || !block.input) return fehler(502, "Es kam kein brauchbares Spiel zurück. Bitte nochmal versuchen.");

  const spiel = block.input;
  spiel.erzeugt = new Date().toISOString();
  spiel.kind = kind;

  return new Response(JSON.stringify({ ok: true, spiel, verbrauch: daten.usage || null }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function fehler(status, text) {
  return new Response(JSON.stringify({ ok: false, fehler: text }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function systemtext(kind, lehrplan) {
  const k = KINDER[kind];
  const faecher = lehrplan.faecher.map((f) => {
    const pfad = (f.lernpfad || f.lernpfad_annahme || []).map((t) => `${t.nr}. ${t.thema}`).join(" -> ");
    const lb = f.lernbereiche.map((l) => `${l.id} ${l.titel}`).join("; ");
    return `FACH ${f.name} (${f.kuerzel})\n  Lernbereiche: ${lb}\n  Uebliche Reihenfolge: ${pfad}`;
  }).join("\n\n");

  return `Du baust Lernspiele fuer ein Kind. Du bekommst ein Foto oder eine Datei aus dem Schulalltag und machst daraus ein Spiel.

DAS KIND
${kind.charAt(0).toUpperCase() + kind.slice(1)}, ${k.alter} Jahre, ${k.stufe}, Bayern.

DER LEHRPLAN (LehrplanPLUS Bayern)
${faecher}

DEINE REGELN
1. ORDNE EIN. Erkenne, um welches Fach und welchen Lernbereich es geht. Passt nichts, setze lernbereich auf "unbekannt" - rate nicht.
2. SCHREIBE NICHTS AB. Das Bild sagt dir, WORUM es geht, nicht WAS gefragt wird. Erfinde eigene Aufgaben zum selben Thema und Niveau. Uebernimm niemals die Aufgaben vom Blatt - weder Zahlen noch Formulierungen.
3. VORGRIFF NUR STREIFEN. Schau in der ueblichen Reihenfolge, was nach dem erkannten Thema kommt, und lass es beilaeufig auftauchen - als Name, Bild, Sammelobjekt oder Nebensatz. NIEMALS als Aufgabe, die geloest werden muss. Das Kind soll es spaeter wiedererkennen, nicht daran scheitern.
4. PASSENDE HUERDE. Loesbar, aber nicht geschenkt. Bei Fehlern hilft die Erklaerung weiter, statt nur "falsch" zu sagen.
5. SPRACHE. ${k.alter <= 8 ? "Sehr einfach, kurze Saetze, alles muss vorlesbar sein - das Kind liest noch nicht sicher." : k.alter >= 12 ? "Jugendlich und sachlich. Keine Kindersprache, kein Grundschul-Ton." : "Einfach und klar, wie man mit einem Viertklaessler spricht. Freundlich, nie belehrend."}
6. LOB DIE ANSTRENGUNG, nicht die Begabung. Konkret statt Floskel.

DIE WELT
Waehle eine Einkleidung, die zum Thema passt und Spass macht - Weltraum, Fussball, Klotzchen-Welt, Tiefsee, Werkstatt, Detektiv, was passt. Eigene Figuren und Ideen, niemals echte Marken oder geschuetzte Spielfiguren.

Gib genau ein Spiel ueber das Werkzeug zurueck.`;
}

const WERKZEUG = {
  name: "spiel_bauen",
  description: "Liefert das fertige Lernspiel als Daten.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      titel: { type: "string", description: "Kurzer Spieltitel, kindgerecht." },
      fach: { type: "string", description: "Kuerzel des Fachs, z. B. mathe, deutsch, hsu, englisch." },
      lernbereich: { type: "string", description: "ID des Lernbereichs aus dem Lehrplan, oder 'unbekannt'." },
      thema: { type: "string", description: "Das erkannte Thema in wenigen Worten." },
      naechstes_thema: { type: "string", description: "Was laut Reihenfolge als Naechstes kommt, oder leer." },
      welt: { type: "string", description: "Die gewaehlte Einkleidung, z. B. weltraum, fussball, tiefsee." },
      spielart: { type: "string", enum: SPIELARTEN, description: "Welche Bauform passt." },
      begruessung: { type: "string", description: "Ein Satz zum Start, der Lust macht." },
      aufgaben: {
        type: "array",
        description: "8 bis 12 Aufgaben, selbst erfunden, nie vom Blatt abgeschrieben.",
        items: {
          type: "object",
          properties: {
            frage: { type: "string" },
            antworten: { type: "array", items: { type: "string" }, description: "Bei quiz/zuordnen die Auswahl, sonst leer." },
            richtig: { type: "string", description: "Die richtige Antwort als Text." },
            erklaerung: { type: "string", description: "Warum das stimmt - hilft bei Fehlern weiter." },
          },
          required: ["frage", "antworten", "richtig", "erklaerung"],
          additionalProperties: false,
        },
      },
    },
    required: ["titel", "fach", "lernbereich", "thema", "naechstes_thema", "welt", "spielart", "begruessung", "aufgaben"],
    additionalProperties: false,
  },
};
