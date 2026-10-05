/* Foto rein -> Übungsaufgaben raus. Alle auf einmal, geprüft wird am Ende.
 *
 * Helena am 05.10.2026 (Meldung uhpehqypar): "Nein, ich meine in der lernwelt
 * nicht hier übungsaufgaben, irgendwie, wo ich einen knopf auch habe oder
 * irgendeinen keine Ahnung, wo ich draufklicken kann, dann ein foto machen
 * kann und mir du mir dazu übungen stellst" - und auf die Rückfrage, wann
 * kontrolliert wird: "Alle zusammen am ende. Und soll auswählbar sein wie
 * viele fragen".
 *
 * WARUM DAS NICHT DAS LERNQUIZ IST: Das Lernquiz fragt aus dem SCHULHEFT ab -
 * erst ablegen, Fach wählen, Blatt wählen, dann üben, und jede Antwort wird
 * sofort kontrolliert. Helena will den kurzen Weg: Blatt vor sich, Foto,
 * Aufgaben. Nichts wird abgelegt, nichts sortiert. Das hier ist der kurze
 * Weg daneben, nicht ein Ersatz dafür.
 *
 * POST /api/uebung-foto
 *   { kind, seiten:[{media_type,data}], anzahl, wunsch?, strom? }
 *
 * Zurück: { uebung: { fach, thema, einleitung, aufgaben:[...] } }
 *
 * ÜBEN, NICHT LÖSEN (Dennys Regel vom 16.09.2026). Keine Aufgabe vom Blatt
 * mit ihrer Lösung - immer eigene, ähnliche Aufgaben zum selben Stoff. Das
 * Blatt löst das Kind selbst.
 *
 * Der Schlüssel liegt als Cloudflare-Secret ANTHROPIC_API_KEY und taucht
 * weder im Code noch in einer Antwort auf.
 */

import { ausweisGueltig, geheimFuer } from "./_riegel.js";

// Dasselbe Modell wie in der Schmiede (Vergleich vom 06.09.2026): Haiku
// liefert bei Handschrift nichts Brauchbares, Sonnet reisst den Zahlenraum.
const MODELL = "claude-opus-5-5";

const KINDER = {
  paul: {
    datei: "grundschule-3-4.json", stufe: "4. Klasse Grundschule", alter: 10,
    anrede: "du", name: "Paul",
    ton: "Freundlich und knapp, wie zu einem Zehnjährigen. Keine Babysprache, kein Gejubel vorweg.",
    /* Pauls Lehrerin (Frau Sy) erlaubt keine Weil-Antworten (04.10.2026,
       über Denny). Eine Übung, die hier "Begründe!" fragt, übt genau das,
       was in der Probe nicht gewollt ist. */
    extra: "KEINE WARUM- ODER BEGRÜNDE-AUFGABEN und kein \"weil\" in Frage, Tipp oder Erklärung. Pauls Lehrerin lässt Weil-Antworten nicht zu. Eine Meinung wird als \"Schreibe deine Meinung in einem ganzen Satz\" gefragt.",
  },
  leon: {
    datei: "grundschule-1-2.json", stufe: "2. Klasse Grundschule", alter: 7,
    anrede: "du", name: "Leon",
    ton: "Sehr kurze Sätze, einfache Wörter, eine Sache je Aufgabe. Leon ist sieben und liest noch langsam.",
    extra: "Höchstens ein Satz je Frage. Zahlenraum bis 100. Keine Warum-Aufgaben, kein \"weil\".",
  },
  helena: {
    datei: "gymnasium-7.json", stufe: "7. Klasse Gymnasium", alter: 12,
    anrede: "du", name: "Helena",
    ton: "Sachlich und auf Augenhöhe, wie zu einer Zwölfjährigen. Kein Kindergarten-Ton, keine Maskottchen, keine Sticker.",
    extra: "Bei Fremdsprachen bleibt die Aufgabe in der Fremdsprache, die Anweisung davor auf Deutsch.",
  },
};

// Wie viele Aufgaben das Kind wählen darf. Mehr als 20 wäre in einem Rutsch
// weder zu schaffen noch in einer Antwort unterzubringen.
const ANZAHLEN = [5, 10, 15, 20];

const MAX_BYTES = 12 * 1024 * 1024;   // Sicherheitsabstand zu den 32 MB der API
const MAX_SEITEN = 4;

const WERKZEUG = {
  name: "uebung_stellen",
  description: "Gibt die fertigen Übungsaufgaben zum fotografierten Blatt zurück.",
  input_schema: {
    type: "object",
    properties: {
      fach: { type: "string", description: "Das Fach, erkannt vom Blatt. Ein Wort, deutsch: Mathe, Deutsch, Englisch, Französisch, HSU, Geschichte, Geographie, Informatik, Musik, Religion." },
      thema: { type: "string", description: "Worum es auf dem Blatt geht, in drei bis sechs Wörtern. Deutsch. Zum Beispiel: Die Verben vouloir, pouvoir und savoir." },
      einleitung: { type: "string", description: "Ein bis zwei Sätze an das Kind: was es hier übt und worauf es achten soll. Deutsch, keine Lösung darin." },
      aufgaben: {
        type: "array",
        description: "Die Übungsaufgaben, genau so viele wie verlangt.",
        items: {
          type: "object",
          properties: {
            frage: { type: "string", description: "Die Aufgabe. Kurz und eindeutig. Eine Lücke wird mit drei Unterstrichen ___ geschrieben. Die Anweisung steht auf Deutsch, der zu übende Text darf in der Fremdsprache stehen." },
            antwort: { type: "string", description: "Die richtige Antwort. So KURZ wie möglich - ein Wort oder eine kurze Wortgruppe, nichts, was man abtippen müsste. Nur das, was in die Lücke gehört." },
            auch: { type: "array", items: { type: "string" }, description: "Weitere Schreibweisen, die genauso richtig sind (andere Reihenfolge, zweite erlaubte Form). Leer lassen, wenn es nur eine gibt." },
            tipp: { type: "string", description: "Ein Hinweis, der den Weg zeigt, OHNE die Antwort zu nennen. Deutsch." },
            erklaerung: { type: "string", description: "Nach dem Prüfen: warum die Antwort so lautet, in ein bis zwei Sätzen, an einem eigenen Beispiel. Deutsch." },
          },
          required: ["frage", "antwort", "tipp", "erklaerung"],
        },
      },
    },
    required: ["fach", "thema", "einleitung", "aufgaben"],
  },
};

function systemtext(kind, lehrplan, anzahl) {
  const k = KINDER[kind];
  return [
    `Du stellst Übungsaufgaben für ${k.name}, ${k.stufe}, ${k.alter} Jahre alt.`,
    k.ton,
    "",
    `${k.name} hat ein Blatt aus der Schule fotografiert und möchte GENAU ZU DIESEM STOFF üben.`,
    "",
    "DIE WICHTIGSTE REGEL: ÜBEN, NICHT LÖSEN.",
    "Übernimm KEINE Aufgabe vom Blatt und verrate keine Lösung, die dort gefragt ist.",
    "Erfinde eigene, ähnliche Aufgaben zum selben Stoff - andere Zahlen, andere Wörter,",
    "andere Sätze. Ist das Blatt schon ausgefüllt, sag NICHT, was dort falsch ist; übe",
    "stattdessen gezielt das, was dort noch wackelt.",
    "",
    `Stelle GENAU ${anzahl} Aufgaben. Nicht mehr, nicht weniger.`,
    "",
    "So sieht eine gute Aufgabe aus:",
    "- Sie prüft eine Sache, nicht drei.",
    "- Die Antwort ist kurz: ein Wort, eine Zahl, eine kurze Wortgruppe. Niemals ein ganzer Absatz.",
    "- Sie ist eindeutig: Es gibt genau eine richtige Antwort (Schreibweisen gehören nach \"auch\").",
    "- Sie steigt an: Die ersten Aufgaben sind leichter als die letzten.",
    "- Sie ist abwechslungsreich: nicht zehnmal dasselbe Muster.",
    "",
    "Was NICHT hineingehört:",
    "- Keine Aufgabe, deren Antwort schon in der Frage steht.",
    "- Keine Frage nach etwas, das auf dem Blatt gar nicht vorkommt.",
    "- Keine Rechtschreibfallen, die mit dem Thema nichts zu tun haben.",
    "- Keine Noten, keine Punkte, kein Zeitdruck, keine Drohung.",
    k.extra ? "- " + k.extra : "",
    "",
    "Alles, was das Kind liest, steht auf Deutsch - außer dem Teil, der in einer",
    "Fremdsprache geübt wird.",
    "",
    "Zum Einordnen der Klassenstufe (nicht abfragen, nur als Maßstab):",
    JSON.stringify(lehrplan).slice(0, 6000),
  ].filter(Boolean).join("\n");
}

function fehler(status, text) {
  return new Response(JSON.stringify({ ok: false, fehler: text }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return fehler(500, "Der Schlüssel fehlt auf dem Server. Denny muss ihn bei Cloudflare als ANTHROPIC_API_KEY hinterlegen.");
  }

  let auftrag;
  try { auftrag = await request.json(); }
  catch (e) { return fehler(400, "Die Anfrage war kein gültiges JSON."); }

  const kind = KINDER[auftrag.kind] ? auftrag.kind : "paul";

  /* Jeder Lauf kostet echtes Geld - deshalb nur mit Ausweis, wie in der
     Schmiede. Denny darf mit dem Eltern-Code für ein Kind vorbauen. */
  const alsEltern = !!geheimFuer(env, "eltern") &&
    (await ausweisGueltig(request, geheimFuer(env, "eltern"), env));
  if (!alsEltern && !(await ausweisGueltig(request, geheimFuer(env, kind), env))) {
    return fehler(401, "Hier darfst du nur mit deinem Code üben. Bitte melde dich an.");
  }

  const seiten = Array.isArray(auftrag.seiten) ? auftrag.seiten : [];
  if (!seiten.length) return fehler(400, "Da war kein Foto dabei. Mach eins von deinem Blatt.");
  if (seiten.length > MAX_SEITEN) return fehler(400, `Das sind ${seiten.length} Seiten. Mehr als ${MAX_SEITEN} auf einmal geht hier nicht.`);

  let bytes = 0;
  for (const s of seiten) {
    if (!s || typeof s.data !== "string" || typeof s.media_type !== "string") {
      return fehler(400, "Eine der Seiten war unvollständig.");
    }
    bytes += Math.floor(s.data.length * 0.75);
  }
  if (bytes > MAX_BYTES) {
    return fehler(400, `Zusammen ${(bytes / 1048576).toFixed(1)} MB - das ist zu viel auf einmal. Bitte weniger oder kleinere Fotos.`);
  }

  const anzahlRoh = Math.trunc(Number(auftrag.anzahl));
  const anzahl = ANZAHLEN.indexOf(anzahlRoh) >= 0 ? anzahlRoh : 10;
  const wunsch = String(auftrag.wunsch || "").trim().slice(0, 400);

  const vorgaben = { kind, seiten, anzahl, wunsch };

  /* Derselbe Weg wie beim Spielbau (22.09.2026): Cloudflare bricht eine
     STILLE Leitung nach gut 100 Sekunden mit HTTP 502 ab. Wer alle fünf
     Sekunden eine Zeile schickt, hat keinen Leerlauf. Die Füllung von 2 KB
     muss sein - kleine Häppchen reicht Cloudflare gar nicht erst durch. */
  if (auftrag.strom === true) {
    const strom = new TransformStream();
    const w = strom.writable.getWriter();
    const enc = new TextEncoder();
    const FUELLUNG = " ".repeat(2048);
    const zeile = (o) => w.write(enc.encode(JSON.stringify(o) + FUELLUNG + "\n"));

    (async () => {
      let puls = null;
      try {
        await zeile({ status: "laeuft", seit: 0 });
        const start = Date.now();
        puls = setInterval(() => {
          zeile({ status: "laeuft", seit: Math.round((Date.now() - start) / 1000) }).catch(() => {});
        }, 5000);
        const e = await stellLauf(context, vorgaben);
        clearInterval(puls); puls = null;
        await zeile(e.ok ? { status: "fertig", uebung: e.uebung }
                         : { status: "fehler", fehler: e.text, ...(e.warum ? { warum: e.warum } : {}) });
      } catch (err) {
        if (puls) clearInterval(puls);
        try { await zeile({ status: "fehler", fehler: "Beim Aufgabenstellen ist etwas schiefgegangen. Bitte nochmal versuchen." }); } catch (e2) {}
      }
      try { await w.close(); } catch (e) {}
    })();

    return new Response(strom.readable, {
      headers: {
        "content-type": "application/x-ndjson; charset=utf-8",
        "cache-control": "no-store",
        "x-accel-buffering": "no",
      },
    });
  }

  const e = await stellLauf(context, vorgaben);
  if (!e.ok) return fehler(e.status || 502, e.text);
  return new Response(JSON.stringify({ ok: true, uebung: e.uebung }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function stellLauf(context, vorgaben) {
  const { request, env } = context;
  const { kind, seiten, anzahl, wunsch } = vorgaben;

  let lehrplan;
  try {
    const url = new URL("/lehrplan/" + KINDER[kind].datei, request.url);
    const r = await fetch(url.toString());
    if (!r.ok) throw new Error("HTTP " + r.status);
    lehrplan = await r.json();
  } catch (e) {
    return { ok: false, status: 500, text: "Der Lehrplan konnte nicht geladen werden." };
  }

  const inhalt = [];
  for (const s of seiten) {
    inhalt.push(
      s.media_type === "application/pdf"
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: s.data } }
        : { type: "image",    source: { type: "base64", media_type: s.media_type,      data: s.data } }
    );
  }
  inhalt.push({ type: "text", text:
    `Das ist mein Blatt aus der Schule. Stell mir ${anzahl} Übungsaufgaben zu genau diesem Stoff. ` +
    "Nimm keine Aufgabe vom Blatt und verrate keine Lösung davon - ich will selbst üben, nicht abschreiben." +
    (wunsch ? ` Was mir dabei wichtig ist: ${wunsch}` : "") });

  const anfrageStellen = () => fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODELL,
      max_tokens: 12000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: [{ type: "text", text: systemtext(kind, lehrplan, anzahl), cache_control: { type: "ephemeral" } }],
      tools: [WERKZEUG],
      /* Opus 5.5 kennt kein erzwungenes Werkzeug (gemessen 24.09.2026:
         "tool_choice: type tool and any are not supported for this model").
         Mit "auto" ruft es trotzdem. */
      tool_choice: { type: "auto" },
      messages: [{ role: "user", content: inhalt }],
    }),
  });

  // Was sich von selbst erholt, bekommt einen zweiten Anlauf; ein kaputter
  // Auftrag oder ein 401 würde beim zweiten Mal genauso abgelehnt.
  const ERHOLT_SICH = new Set([408, 409, 425, 429, 500, 502, 503, 504, 529]);

  let antwort;
  try {
    antwort = await anfrageStellen();
    if (!antwort.ok && ERHOLT_SICH.has(antwort.status)) {
      await new Promise((r) => setTimeout(r, 2500));
      const zweiter = await anfrageStellen().catch(() => null);
      if (zweiter) antwort = zweiter;
    }
  } catch (e) {
    await new Promise((r) => setTimeout(r, 2500));
    try { antwort = await anfrageStellen(); }
    catch (e2) {
      return { ok: false, status: 502, text: "Ich komme gerade nicht zu Claude durch. Dein Foto ist noch da – tipp nochmal auf den Knopf." };
    }
  }

  if (!antwort.ok) {
    const text = await antwort.text().catch(() => "");
    if (antwort.status === 401 || antwort.status === 403) return { ok: false, status: 500, text: "Der Server darf gerade nicht bei Claude anfragen. Denny muss den Schlüssel prüfen." };
    if (antwort.status === 429) return { ok: false, status: 503, text: "Gerade ist zu viel los. Bitte in einer Minute nochmal." };
    if (text.includes("credit") || text.includes("billing")) return { ok: false, status: 503, text: "Das Guthaben ist aufgebraucht oder das Monatslimit erreicht. Denny muss nachsehen." };
    let art = "";
    try {
      const j = JSON.parse(text);
      art = String((j && j.error && (j.error.type || j.error.message)) || "").slice(0, 80);
    } catch (e) {}
    return { ok: false, status: 502,
      text: "Claude hat nicht geantwortet (Code " + antwort.status + (art ? ", " + art : "") + "). Bitte nochmal versuchen." };
  }

  const daten = await antwort.json();
  const block = (daten.content || []).find((b) => b.type === "tool_use");
  if (!block || !block.input) {
    return { ok: false, status: 502, text: "Es kamen keine brauchbaren Aufgaben zurück. Dein Foto ist noch da – tipp nochmal auf den Knopf." };
  }

  const uebung = saubern(block.input, anzahl);
  let maengel = pruefen(uebung, anzahl);

  /* Ein zweiter Anlauf, bevor das Kind nach über einer Minute Warten eine
     Fehlermeldung bekommt. Aussetzer sind sporadisch. */
  if (maengel.length) {
    const zweite = await anfrageStellen().catch(() => null);
    if (zweite && zweite.ok) {
      const d2 = await zweite.json().catch(() => null);
      const b2 = d2 && (d2.content || []).find((c) => c.type === "tool_use");
      if (b2 && b2.input) {
        const u2 = saubern(b2.input, anzahl);
        if (!pruefen(u2, anzahl).length) return { ok: true, uebung: u2 };
      }
    }
  }

  /* Lieber sieben gute Aufgaben als eine Fehlermeldung: Nur wenn es zu
     WENIGE sind, ist es wirklich keine Übung mehr. */
  if (maengel.length && uebung.aufgaben.length >= 3) return { ok: true, uebung };
  if (maengel.length) {
    return { ok: false, status: 502,
      text: "Das hat diesmal nicht geklappt. Dein Foto ist noch da – tipp nochmal auf den Knopf.",
      warum: maengel[0] };
  }
  return { ok: true, uebung };
}

/* Alles, was auf den Schirm geht, wird vorher zurechtgestutzt - kein roher
   Modelltext, keine endlosen Felder, keine doppelten Aufgaben. */
export function saubern(roh, anzahl) {
  const kurz = (s, n) => String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, n);
  const gesehen = new Set();
  const aufgaben = [];
  for (const a of Array.isArray(roh && roh.aufgaben) ? roh.aufgaben : []) {
    const frage = kurz(a && a.frage, 400);
    const antwort = kurz(a && a.antwort, 120);
    if (!frage || !antwort) continue;
    const schluessel = frage.toLowerCase();
    if (gesehen.has(schluessel)) continue;     // zweimal dieselbe Frage hilft niemandem
    gesehen.add(schluessel);
    aufgaben.push({
      nr: aufgaben.length + 1,
      frage,
      antwort,
      auch: (Array.isArray(a && a.auch) ? a.auch : [])
        .map((x) => kurz(x, 120)).filter(Boolean).slice(0, 6),
      tipp: kurz(a && a.tipp, 300),
      erklaerung: kurz(a && a.erklaerung, 400),
    });
    if (aufgaben.length >= anzahl) break;
  }
  return {
    fach: kurz(roh && roh.fach, 40),
    thema: kurz(roh && roh.thema, 120),
    einleitung: kurz(roh && roh.einleitung, 400),
    aufgaben,
  };
}

export function pruefen(u, anzahl) {
  const m = [];
  if (!u || !Array.isArray(u.aufgaben)) { m.push("keine Aufgaben"); return m; }
  if (u.aufgaben.length < anzahl) m.push(`nur ${u.aufgaben.length} von ${anzahl} Aufgaben`);
  if (!u.thema) m.push("kein Thema erkannt");
  /* Eine Antwort, die schon in der Frage steht, ist keine Aufgabe - das kam
     bei Lückensätzen vor, in denen die Lücke danebenstand. */
  for (const a of u.aufgaben) {
    if (a.antwort.length > 2 && a.frage.toLowerCase().includes(a.antwort.toLowerCase())) {
      m.push("Antwort steht in der Frage: " + a.frage.slice(0, 60));
      break;
    }
  }
  return m;
}
