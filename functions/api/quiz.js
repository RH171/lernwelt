// Das tägliche Lernquiz - Fragen zum aktuellen Schulstoff, je Kind.
//
// Denny am 20.09.2026: "Kannst du bei jedem Anwender noch ein Quiz bauen, wo
// die Fragen zum Schulunterricht sind und nur die Fragen, die falsch
// beantwortet werden, immer wiederholt werden? Die Fragen sollen immer
// unterschiedlich sein ... 5 bis 10 Minuten lernen oder früh morgens noch mal
// schnell ... alle oder nur gezielte Fächer ... 15 oder mehr Fragen oder
// endlos ... aber so, dass ein hoher Lernerfolg ist."
// Dazu: "daran denken, dass dies immer aktuell bei jedem Spieler sein muss."
//
// GET  /api/quiz?faecher=mathe,deutsch&anzahl=15   -> Fragen
// POST /api/quiz  {antworten:[{frageId, merkmal, fach, stimmt}]}  -> mitschreiben
//
// ---------------------------------------------------------------------------
// Woher die Fragen kommen, und warum nicht aus einer festen Liste
//
// Eine feste Liste ist genau das Problem, das Paul am selben Tag gemeldet hat:
// "die Aufgaben hier sind immer die gleichen" - er lernt die Antwort auswendig
// statt der Regel. Darum gibt es einen VORRAT je Kind, der nachwächst:
//
//   quiz-vorrat:<kind>   { fragen: [...], gebaut: <iso> }
//
// Läuft er leer, wird nachgebaut - mit dem Lehrplan des Kindes, seinen offenen
// Lernzielen (_schwaechen.js) und dem, was es zuletzt aus der Schule
// fotografiert hat. Das ist der "immer aktuell"-Teil: Nicht der Lehrplan
// allein entscheidet, sondern was in der Woche wirklich dran war.
//
// Gestellte Fragen werden vermerkt und kommen nicht wieder - eine Frage wird
// also nie zweimal gezeigt. Das LERNZIEL dagegen schon, sooft es nötig ist.

import { ausweisGueltig, geheimFuer, brauchtAusweis } from "./_riegel.js";
import { schwaechenHolen } from "./_schwaechen.js";
import { stoffLesen, schuljahrStart, FAECHER } from "./_schulstoff.js";
import { stehtAufBlatt } from "./spiel-bauen.js";

const KINDER = {
  paul:   { datei: "grundschule-3-4.json", stufe: "4. Klasse Grundschule", alter: 10 },
  leon:   { datei: "grundschule-1-2.json", stufe: "2. Klasse Grundschule", alter: 8 },
  helena: { datei: "gymnasium-7.json",     stufe: "7. Klasse Gymnasium",   alter: 12 },
};

const VORRAT = (kind) => "quiz-vorrat:" + kind;
const GESTELLT = (kind) => "quiz-gestellt:" + kind;

// So viele Fragen baut ein Nachschub-Lauf. Gross genug, dass es sich lohnt
// (ein Lauf kostet echtes Geld), klein genug fuer eine Antwort ohne Abbruch.
const JE_LAUF = 24;
// Darunter wird nachgefuellt, damit nie jemand vor einem leeren Quiz sitzt.
const NACHFUELLEN_AB = 10;
// Mehr als so viele Kennungen werden nicht aufgehoben - sonst waechst der
// Eintrag endlos und jeder Schreibvorgang wird teurer.
const GESTELLT_MAX = 400;

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  const url = new URL(request.url);
  const kind = String(url.searchParams.get("kind") || "").toLowerCase();
  if (!KINDER[kind]) return json(400, { ok: false, fehler: "Welches Kind denn?" });
  if (brauchtAusweis(env, kind) && !(await ausweisGueltig(request, geheimFuer(env, kind), env)))
    return json(401, { ok: false, fehler: "Nicht angemeldet." });

  const gewuenschteFaecher = String(url.searchParams.get("faecher") || "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  /* Welche Blaetter aus dem Schulheft abgefragt werden sollen.
   *
   * Denny am 23.09.2026: "Ganz klar, nur aus seinen Blättern. Wenn du jetzt
   * Paul plötzlich was zu Nürnberg fragst, obwohl er ein HSU heute Fürth
   * hatte, versteht er ja die Welt nicht und kennt die Antworten nicht."
   *
   * Jede Frage, die aus einem Blatt gebaut wurde, traegt dessen id in
   * f.blatt. Ohne Auswahl bleibt alles beim Alten - das ganze Fach. */
  const gewuenschteBlaetter = String(url.searchParams.get("blaetter") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const anzahlRoh = Number(url.searchParams.get("anzahl"));
  // 0 heisst "endlos" - dann wird geliefert, was da ist, und beim naechsten
  // Nachladen weiter.
  const anzahl = Number.isFinite(anzahlRoh) ? Math.min(40, Math.max(0, Math.trunc(anzahlRoh))) : 15;

  let vorrat = await vorratLesen(env, kind);
  const gestellt = new Set(await gestellteLesen(env, kind));

  const passt = (f) => {
    if (gewuenschteFaecher.length &&
        !gewuenschteFaecher.includes(String(f.fach || "").toLowerCase())) return false;
    if (gewuenschteBlaetter.length && !gewuenschteBlaetter.includes(String(f.blatt || ""))) return false;
    return true;
  };

  let offen = vorrat.fragen.filter((f) => !gestellt.has(f.id) && passt(f));

  /* WIEDERHOLEN STATT NEU BAUEN.
   *
   * Denny am 23.09.2026 zum Quiz je Blatt: "Es sollte dann aber im Quiz auch
   * entsprechend das Spiel so liegen, dass wir es nicht zweimal oder dreimal
   * bauen müssen."
   *
   * Uebt Paul dasselbe Blatt ein zweites Mal, sind alle Fragen dazu schon
   * "gestellt" - und es wuerde fuer Geld neu gebaut, obwohl ein Dutzend
   * fertiger Fragen daliegt. Bei einer Wiederholung ist das Wiedersehen aber
   * genau der Zweck: Was man zweimal beantwortet, sitzt.
   *
   * Also: Erst nachsehen, was zur Auswahl ueberhaupt da ist. Reicht das,
   * werden die am laengsten nicht gestellten wieder zugelassen - die
   * juengsten zuletzt, damit es sich nicht wie dieselbe Runde anfuehlt. */
  const alleDazu = vorrat.fragen.filter(passt);
  let wiederholt = 0;
  const gebraucht = Math.max(NACHFUELLEN_AB, anzahl || NACHFUELLEN_AB);
  if (offen.length < gebraucht && alleDazu.length >= Math.min(gebraucht, 5)) {
    const schonMal = alleDazu.filter((f) => gestellt.has(f.id));
    // gestellteLesen() gibt die aeltesten zuerst - die kommen als erste dran.
    offen = offen.concat(schonMal.slice(0, gebraucht - offen.length));
    wiederholt = Math.min(schonMal.length, gebraucht - (offen.length - schonMal.length));
  }

  // Reicht es immer noch nicht, wird nachgebaut. Der Aufruf dauert - darum
  // sagt die Antwort ehrlich, dass gewartet wird, statt still nichts zu liefern.
  let nachgebaut = false;
  if (offen.length < Math.max(NACHFUELLEN_AB, anzahl || NACHFUELLEN_AB)) {
    try {
      const neu = await nachschubBauen(env, kind, gewuenschteFaecher, gewuenschteBlaetter);
      if (neu.length) {
        vorrat.fragen = vorrat.fragen.concat(neu).slice(-200);
        vorrat.gebaut = new Date().toISOString();
        await env.PAUL_KV.put(VORRAT(kind), JSON.stringify(vorrat));
        nachgebaut = true;
        offen = vorrat.fragen.filter((f) => !gestellt.has(f.id) && passt(f));
      }
    } catch (e) { /* Vorrat reicht vielleicht trotzdem */ }
  }

  if (!offen.length)
    return json(200, { ok: true, fragen: [], leer: true,
      fehler: gewuenschteBlaetter.length
        ? "Zu diesen Blättern habe ich gerade keine neuen Fragen. Nimm noch eines dazu."
        : "Für diese Auswahl habe ich gerade keine neuen Fragen. Versuch es mit mehr Fächern." });

  mischen(offen);
  const raus = anzahl ? offen.slice(0, anzahl) : offen.slice(0, 40);
  return json(200, { ok: true, fragen: raus, nachgebaut, vorrat: offen.length,
                     ...(wiederholt ? { wiederholt } : {}) });
}

/* Den Vorrat gegen den heutigen Riegel halten.
 *
 *   DELETE /api/quiz?kind=paul&unbelegt=1     (nur mit Eltern-Code)
 *
 * Dieselbe Lehre wie bei pruefe-bestand.sh fuer die Spiele: Der Riegel laeuft
 * nur beim BAUEN. Eine Frage, die vorher entstanden ist, kennt ihn nie - sie
 * liegt im Vorrat und wird wieder gestellt.
 *
 * Anlass: Am 23.09.2026 um 03:21 Uhr stand in Pauls HSU-Lauf "Was ist weniger
 * Wasser: 1 Liter oder 300 ml aus der Regnitz-Probe?" - auf seinem Blatt steht
 * davon nichts. Denny: "Diese Antwort gibt es dort drin gar nicht." Der neue
 * Riegel verhindert solche Fragen kuenftig; die schon gebauten holt er nicht
 * ein. Dafuer ist dieser Weg da.
 *
 * Er LIEST die Blaetter und schreibt nur den Vorrat - ein Schreibvorgang, und
 * nur, wenn wirklich etwas wegfaellt. Kostet kein Geld: Es wird nichts gebaut.
 */
export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  let p;
  try { p = new URL(request.url).searchParams; } catch (e) { return json(400, { ok: false, fehler: "Kaputte Adresse." }); }
  const kind = String(p.get("kind") || "").toLowerCase();
  if (!KINDER[kind]) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (p.get("unbelegt") !== "1") return json(400, { ok: false, fehler: "Nichts zu tun." });

  /* Eltern-Code, nicht der des Kindes: Ein Kind soll seinen eigenen Vorrat
     nicht leerraeumen koennen, wenn ihm eine Frage nicht gefaellt. */
  if (!geheimFuer(env, "eltern") || !(await ausweisGueltig(request, geheimFuer(env, "eltern"), env)))
    return json(401, { ok: false, fehler: "Dafür braucht es den Eltern-Code." });

  let vorrat;
  try {
    const roh = await env.PAUL_KV.get(VORRAT(kind));
    vorrat = roh ? JSON.parse(roh) : null;
  } catch (e) { return json(503, { ok: false, fehler: "Der Speicher antwortet gerade nicht." }); }
  if (!vorrat || !Array.isArray(vorrat.fragen) || !vorrat.fragen.length)
    return json(200, { ok: true, geprueft: 0, weg: 0 });

  const schule = await letzterUnterricht(env, kind, null);
  const blaetter = schule.blaetter || [];

  /* Eine gespeicherte Frage traegt die id ihres Blattes (f.blatt), nicht die
     Nummer aus dem Auftrag. frageBelegt() erwartet die Nummer - also hier
     zurueckuebersetzen. Ohne Blatt oder ohne gelesenen Inhalt wird nicht
     geurteilt: ein Fehlalarm wuerde eine richtige Frage wegwerfen. */
  const weg = [];
  const bleiben = vorrat.fragen.filter((f) => {
    if (!f || !f.blatt) return true;
    const nr = blaetter.findIndex((b) => b.id === f.blatt) + 1;
    if (!nr) return true;
    if (frageBelegt({ blatt_nr: nr, frage: f.frage, antworten: f.antworten }, schule, true)) return true;
    weg.push({ frage: String(f.frage || "").slice(0, 80), blatt: f.blatt });
    return false;
  });

  if (!weg.length) return json(200, { ok: true, geprueft: vorrat.fragen.length, weg: 0 });

  vorrat.fragen = bleiben;
  try { await env.PAUL_KV.put(VORRAT(kind), JSON.stringify(vorrat)); }
  catch (e) { return json(503, { ok: false, fehler: "Konnte den Vorrat nicht speichern." }); }
  return json(200, { ok: true, geprueft: weg.length + bleiben.length, weg: weg.length, welche: weg.slice(0, 20) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  let daten = {};
  try { daten = await request.json(); } catch (e) {}
  const kind = String(daten.kind || "").toLowerCase();
  if (!KINDER[kind]) return json(400, { ok: false, fehler: "Welches Kind denn?" });
  if (brauchtAusweis(env, kind) && !(await ausweisGueltig(request, geheimFuer(env, kind), env)))
    return json(401, { ok: false, fehler: "Nicht angemeldet." });

  const antworten = Array.isArray(daten.antworten) ? daten.antworten.slice(0, 60) : [];
  if (!antworten.length) return json(200, { ok: true });

  /* Gestellte Fragen merken - eine Frage kommt nie zweimal.
     RICHTIG beantwortete verschwinden endgültig. FALSCHE bleiben im Vorrat
     nicht liegen: Das Lernziel kommt über _schwaechen.js in die nächsten
     Spiele UND in den nächsten Nachschub, aber als andere Frage. Genau
     Dennys Vorgabe: "nicht exakt die gleiche Frage ... sondern mit dem
     gleichen Lernziel". */
  const gestellt = await gestellteLesen(env, kind);
  for (const a of antworten) if (a && a.frageId) gestellt.push(String(a.frageId).slice(0, 24));
  await env.PAUL_KV.put(GESTELLT(kind), JSON.stringify(gestellt.slice(-GESTELLT_MAX)));

  return json(200, { ok: true });
}

async function vorratLesen(env, kind) {
  try {
    const roh = await env.PAUL_KV.get(VORRAT(kind));
    const d = roh ? JSON.parse(roh) : null;
    if (d && Array.isArray(d.fragen)) return d;
  } catch (e) {}
  return { fragen: [], gebaut: null };
}

async function gestellteLesen(env, kind) {
  try {
    const roh = await env.PAUL_KV.get(GESTELLT(kind));
    const d = roh ? JSON.parse(roh) : null;
    if (Array.isArray(d)) return d;
  } catch (e) {}
  return [];
}

function mischen(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

/* ---------- Nachschub ---------- */

const WERKZEUG = {
  name: "quiz_fragen",
  description: "Die Quizfragen als Liste.",
  input_schema: {
    type: "object",
    properties: {
      fragen: {
        type: "array", minItems: 12, maxItems: 30,
        items: {
          type: "object",
          properties: {
            fach: { type: "string", description: "Kürzel des Fachs, genau wie in der Fächerliste vorgegeben." },
            frage: { type: "string", description: "Eine Frage, höchstens 20 Wörter. Keine Aufzählung, kein Lückentext über mehrere Zeilen." },
            antworten: { type: "array", minItems: 3, maxItems: 4, items: { type: "string" },
                         description: "Drei oder vier kurze Antworten. Die erste ist die richtige - sie wird später gemischt." },
            erklaerung: { type: "string", description: "Ein Satz, warum das stimmt. Für das Kind, nicht für Erwachsene." },
            merkmal: { type: "string", description: 'Was die Frage übt, als kurzer Schlüssel in Kleinbuchstaben, 2-4 Wörter. Gleiche Sache = gleicher Schlüssel, damit sich zählen lässt, ob es sitzt. Gut: "zehneruebergang plus", "m in cm", "steigerung adjektive", "passe compose". Schlecht: "Frage 3", "gemischt".' },
            blatt_nr: { type: "integer", description: "Nummer des Blattes aus der Liste oben, auf dem diese Frage steht (1 = das erste). 0, wenn die Frage nicht von einem Blatt stammt." },
            tipp: { type: "string", description: "HILFE NACH DEM ERSTEN FEHLVERSUCH - ein Satz, der zum Nachdenken anstößt und die Lösung NICHT enthält. Nenne nie die richtige Antwort, keine Zahl daraus, kein Wort daraus. Gut: \"Denk an die Zeile, in der die Postleitzahlen stehen - deine eigene steht ganz hinten.\" Schlecht: \"Es ist 90765.\" Und schlecht: \"Es war das Jahr der Olympischen Spiele in München\" - wer das weiß, hat die Antwort." },
            merke: { type: "string", description: "ESELSBRÜCKE, die nach der Lösung stehenbleibt - etwas, woran das Kind es beim nächsten Mal wiedererkennt. Eine Merkregel, ein Bild, eine Verbindung zu etwas Bekanntem. Gut: \"FÜ wie die ersten zwei Buchstaben von FÜrth.\" Leer lassen, wenn dir nichts Tragfähiges einfällt - eine erfundene Eselsbrücke ist schlimmer als keine." },
            zeile: { type: "string", description: "Nur bei Fragen von einem Blatt: das STICHWORT der Zeile, in der die Antwort steht, genau so wie es dort links steht (z. B. \"Einwohner\", \"Telefonvorwahl\", \"Eingemeindung\"). Damit kann das Kind auf seinem eigenen Foto nachschlagen. Leer, wenn die Frage nicht von einem Blatt kommt." },
          },
          required: ["fach", "frage", "antworten", "erklaerung", "merkmal", "blatt_nr", "tipp", "merke"],
        },
      },
    },
    required: ["fragen"],
  },
};

async function nachschubBauen(env, kind, nurFaecher, nurBlaetter) {
  if (!env.ANTHROPIC_API_KEY) return [];
  const k = KINDER[kind];

  let lehrplan = null;
  try {
    const r = await env.ASSETS.fetch(new URL("/lehrplan/" + k.datei, "https://x"));
    lehrplan = await r.json();
  } catch (e) { return []; }
  if (!lehrplan) return [];

  let faecher = Array.isArray(lehrplan) ? lehrplan : (lehrplan.faecher || []);
  if (nurFaecher && nurFaecher.length)
    faecher = faecher.filter((f) => nurFaecher.includes(String(f.kuerzel || "").toLowerCase()));
  if (!faecher.length) faecher = Array.isArray(lehrplan) ? lehrplan : (lehrplan.faecher || []);

  const fachListe = faecher.map((f) =>
    `${f.kuerzel} = ${f.name}: ` +
    (f.lernbereiche || []).slice(0, 8).map((l) => l.titel).join("; ")).join("\n");

  // Was zuletzt nicht saß - das ist der Kern der Wiederholung.
  let schwaechen = [];
  try { schwaechen = await schwaechenHolen(env, kind, 6); } catch (e) {}

  // Und was zuletzt wirklich im Unterricht dran war (Fotos aus dem Heft).
  const schule = await letzterUnterricht(env, kind, nurBlaetter);
  const ausDerSchule = schule.text;
  const nurDaraus = !!(nurBlaetter && nurBlaetter.length && schule.blaetter.length);

  const auftrag = `Du baust Quizfragen für ein Kind, das jeden Tag fünf bis zehn Minuten üben will.

DAS KIND
${kind.charAt(0).toUpperCase() + kind.slice(1)}, ${k.alter} Jahre, ${k.stufe}, Bayern.

FÄCHER UND LERNBEREICHE (Kürzel genau so ins Feld "fach")
${fachListe}
${ausDerSchule ? (nurDaraus ? `
NUR AUS DIESEN BLÄTTERN FRAGEN
Das Kind hat sich genau das ausgesucht:
${ausDerSchule}
Frage AUSSCHLIESSLICH nach dem, was auf diesen Blättern steht. Keine
Zusatzfragen zum selben Thema, kein Allgemeinwissen, nichts aus dem Lehrplan
drumherum. Steht auf dem Blatt "Fürth", dann frage nicht nach Nürnberg - das
Kind war im Unterricht dabei und hat das andere nie gehört. Es hält sich sonst
für dumm, obwohl es alles gewusst hat, was drankam.
Trag zu JEDER Frage die Nummer des Blattes in das Feld "blatt_nr" ein.
` : `
DAS WAR ZULETZT WIRKLICH DRAN
Das Kind hat aus dem Unterricht fotografiert:
${ausDerSchule}
Nimm das als Schwerpunkt - dafür ist das Quiz da. Ein Lehrplan sagt, was
irgendwann drankommt; das hier sagt, was diese Woche zählt.
Trag zu jeder Frage, die daher stammt, die Nummer des Blattes in "blatt_nr" ein.
`) : ""}${schwaechen.length ? `
DAS HAT ZULETZT NICHT GESESSEN
${schwaechen.map((s) => `- "${s.merkmal}"${s.beispiel ? ` (zuletzt: ${s.beispiel})` : ""}`).join("\n")}
Zu jedem dieser Punkte mindestens zwei Fragen, mit genau diesem Schlüssel im
Feld "merkmal". Aber: andere Zahlen, andere Wörter, anderer Zusammenhang.
Wer die alte Frage wiedererkennt, lernt die Antwort auswendig statt der Regel.
` : ""}
REGELN
1. ${JE_LAUF} Fragen. Wenn mehrere Fächer dabei sind, verteile sie gleichmäßig.
2. Eine Frage = ein Gedanke. Höchstens 20 Wörter, beantwortbar in unter 30 Sekunden.
3. Die ERSTE Antwort ist die richtige. Die falschen müssen AUS DERSELBEN ART
   sein wie die richtige: Zahl gegen Zahl, Ort gegen Ort, Name gegen Name.
   Steht als Antwort "90765", heissen die falschen "90762", "90768", "90756" -
   NICHT "Kleeblatt" oder "132.000". Sonst schliesst das Kind Unsinn aus,
   statt etwas zu wissen, und die richtige Antwort springt ins Auge.
4. Alle Antworten ungefähr gleich lang. Sonst rät man nach Länge.
4b. KEINE Verneinungsfragen. "Welcher Ort wurde NICHT eingemeindet?" prüft, ob
   ein Kind das Wort "nicht" überliest - nicht, ob es etwas weiss. Frag positiv.
4c. Keine zwei Fragen zur selben Zeile des Blattes. Nimm die genauere.
4d. Frag nicht "ungefähr", wenn auf dem Blatt eine genaue Zahl steht.
5. Nichts Verletzendes, nichts Gruseliges, keine Politik, keine Marken.
6. Deutsche Rechtschreibung mit Umlauten und ß.
${k.alter <= 8 ? `7. LESEANFÄNGER: höchstens 12 Wörter je Frage, höchstens 3 Wörter je Antwort,
   nur bekannte Wörter, keine Jahreszahlen, keine Nebensätze.` :
  k.alter >= 12 ? `7. Diese Schülerin ist am Gymnasium in der 7. Klasse - Fragen dürfen einen
   Gedankenschritt verlangen, nicht nur Auswendiggelerntes abfragen.` :
  `7. Vierte Klasse: konkret und aus dem Alltag, keine abstrakten Definitionen.`}`;

  const antwort = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      tools: [WERKZEUG],
      tool_choice: { type: "tool", name: "quiz_fragen" },
      messages: [{ role: "user", content: auftrag }],
    }),
  });
  if (!antwort.ok) return [];

  let daten = null;
  try { daten = await antwort.json(); } catch (e) { return []; }
  const block = (daten.content || []).find((c) => c.type === "tool_use");
  const fragen = (block && block.input && block.input.fragen) || [];

  const erlaubt = new Set(faecher.map((f) => String(f.kuerzel || "").toLowerCase()));
  /* DER RIEGEL: Was nicht auf dem Blatt steht, wird nicht gefragt.
   *
   * Denny am 23.09.2026, mit Frage 2 aus Pauls HSU-Lauf ("Was ist weniger
   * Wasser: 1 Liter oder 300 ml aus der Regnitz-Probe?"): "Diese Frage kommt
   * auf dem Blatt nicht einmal hervor. Sprich: Diese Antwort gibt es dort drin
   * gar nicht."
   *
   * Dieselbe Lehre wie beim Spielbau am 22.09.2026 und bei den Namen und beim
   * Rechnen davor: Eine Bitte im Auftrag ist keine Pruefung. Geprueft wird die
   * RICHTIGE Antwort - sie muss in den Stichwortzeilen des Blattes stehen, an
   * dem die Frage haengt.
   *
   * Zwei Faelle bleiben bewusst ungeprueft, weil ein Fehlalarm hier eine
   * richtige Frage wegwirft:
   *   - Blaetter ohne gelesenen Inhalt (alte Eintraege) - nichts zum Vergleichen.
   *   - Fragen ohne Blatt, wenn das Kind KEINE Blaetter angehakt hat. Dann ist
   *     das Quiz ausdruecklich auch fuer Lehrplan-Fragen da.
   * Hat das Kind dagegen Blaetter ausgesucht, muss JEDE Frage von einem davon
   * stammen - dann ist eine Frage ohne Blatt schon der Fehler. */
  const belegt = (f) => frageBelegt(f, schule, nurDaraus);

  return fragen
    .filter((f) => f && f.frage && Array.isArray(f.antworten) && f.antworten.length >= 3)
    .filter(belegt)
    .filter((f) => !verneint(f.frage))
    // Ein falsches Fachkürzel macht die Fächerauswahl kaputt - lieber weglassen.
    .filter((f) => erlaubt.has(String(f.fach || "").toLowerCase()))
    .map((f) => ({
      id: kennung(),
      fach: String(f.fach).toLowerCase(),
      frage: String(f.frage).slice(0, 300),
      antworten: f.antworten.slice(0, 4).map((a) => String(a).slice(0, 120)),
      richtig: 0,                       // die erste ist richtig; gemischt wird auf der Seite
      erklaerung: String(f.erklaerung || "").slice(0, 300),
      merkmal: String(f.merkmal || "").toLowerCase().slice(0, 40),
      /* Hilfe in Stufen (23.09.2026). Denny: "Leicht helfen hier Bilder, kleine
         Eselsbrücken, wie man sich das besser merken kann." Der Tipp kommt nach
         dem ersten Fehlversuch, die Eselsbrücke nach der Lösung, die Zeile
         zeigt aufs eigene Blatt. */
      ...(tippOk(f.tipp, f.antworten) ? { tipp: String(f.tipp).slice(0, 200) } : {}),
      ...(f.merke ? { merke: String(f.merke).slice(0, 200) } : {}),
      ...(f.zeile ? { zeile: String(f.zeile).slice(0, 40) } : {}),
      /* Aus welchem Blatt die Frage stammt - daran filtert /api/quiz, wenn
         Paul einzelne Blaetter angehakt hat. Die Nummer aus dem Auftrag wird
         hier zur echten id; eine Nummer daneben heisst lieber KEIN Blatt als
         ein falsches. */
      ...(blattVon(f.blatt_nr, schule.blaetter) ? { blatt: blattVon(f.blatt_nr, schule.blaetter) } : {}),
    }));
}

function blattVon(nr, liste) {
  const n = Number(nr);
  if (!Number.isFinite(n) || n < 1 || !liste || n > liste.length) return "";
  return liste[n - 1].id || "";
}

function kennung() {
  return "q" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/* Was hat das Kind zuletzt aus dem Unterricht geschickt?
   Das ist der "immer aktuell"-Teil: Die Fotos aus dem Heft (Kachel "Das haben
   wir heute gemacht") sagen, was diese Woche wirklich dran war. */
/* Was zuletzt wirklich im Unterricht dran war - aus dem SCHULHEFT.
 *
 * Bis zum 23.09.2026 kam das aus den Hausaufgaben-Meldungen. Seit es das
 * Schulheft gibt, steht es dort sauber mit Fach, Datum und Titel.
 *
 * Denny am 23.09.2026: "Ganz klar, nur aus seinen Blättern. Wenn du jetzt
 * Paul plötzlich was zu Nürnberg fragst, obwohl er ein HSU heute Fürth hatte,
 * versteht er ja die Welt nicht und kennt die Antworten nicht."
 *
 * Gibt nurBlaetter[] mit, wird NUR daraus gefragt - das ist Pauls eigene
 * Auswahl im Quiz.
 */
async function letzterUnterricht(env, kind, nurBlaetter) {
  try {
    const e = await stoffLesen(env, kind, 4);
    if (!e.ok) return { text: "", blaetter: [] };
    const ab = schuljahrStart(e.heute);
    let liste = e.eintraege.filter((x) =>
      x.sichtbar !== false && x.datum >= ab && x.titel);
    if (nurBlaetter && nurBlaetter.length) {
      liste = liste.filter((x) => nurBlaetter.includes(x.id));
    }
    liste = liste.slice(0, 8);
    if (!liste.length) return { text: "", blaetter: [] };
    return {
      /* MIT dem Inhalt, nicht nur mit dem Titel. Bis zum 23.09.2026 stand hier
         allein "1. Stadtporträt von Fürth (HSU, 2026-09-22)" - und daneben im
         Auftrag die Anweisung, ausschliesslich nach dem Blatt zu fragen. Das
         Modell hat das Blatt nie gesehen und aus dem Titel geraten; heraus kam
         eine Frage nach "300 ml aus der Regnitz-Probe", die es dort nicht
         gibt. Eine Bitte, die sich gar nicht erfuellen laesst, ist schlimmer
         als gar keine. */
      text: liste.map((x, i) => {
        const kopf = (i + 1) + ". " + x.titel + " (" +
                     (FAECHER[x.fach] || x.fach || "?") + ", " + x.datum + ")";
        const zeilen = Array.isArray(x.inhalt) ? x.inhalt : [];
        return zeilen.length
          ? kopf + "\n" + zeilen.map((z) => "   - " + z).join("\n")
          : kopf + "\n   (Inhalt nicht gelesen - zu diesem Blatt nur ganz " +
            "allgemein fragen, nichts Bestimmtes behaupten)";
      }).join("\n"),
      blaetter: liste,
    };
  } catch (e) { return { text: "", blaetter: [] }; }
}

export function frageBelegt(f, schule, nurDaraus) {
  const blattId = blattVon(f.blatt_nr, schule.blaetter);
  if (!blattId) return !nurDaraus;
  const blatt = (schule.blaetter || []).find((b) => b.id === blattId);
  const zeilen = (blatt && Array.isArray(blatt.inhalt)) ? blatt.inhalt : [];
  if (!zeilen.length) return true;              // nichts zum Vergleichen
  const richtig = (f.antworten || [])[0];
  /* Steht die Antwort da? Eine Zahl, die man aus einer Liste abzaehlt,
     steht dort nicht woertlich - deshalb gilt auch eine Frage als belegt,
     deren FRAGE sich aus dem Blatt speist und deren Antwort eine kleine
     Zahl ist. Das ist dieselbe Ausnahme wie in ohneBeleg(). */
  if (stehtAufBlatt(zeilen, richtig)) return true;

  /* Die Ausnahme: eine Zahl, die man aus einer Liste ABZAEHLT.
     "Wie viele Partnerstädte hat Fürth?" -> "4". Die Vier steht nirgends,
     die vier Städte schon. Also muss eine Zeile zwei Dinge erfuellen: Sie
     traegt ein kennzeichnendes Wort aus der Frage, UND sie hat mindestens
     so viele Eintraege, wie die Antwort behauptet.
     Beides zusammen ist noetig. Nur das Wort reicht nicht - sonst kaeme
     "Wie viele Brücken hat Fürth? -> 17" durch, weil "Fürth" irgendwo steht.
     Deshalb zaehlen nur Woerter ab sechs Buchstaben; "Fürth" und "viele"
     fallen damit von selbst weg. */
  const n = Number(String(richtig == null ? "" : richtig).replace(/[^0-9]/g, ""));
  if (Number.isFinite(n) && n > 1 && n <= 20) {
    const stichwoerter = String(f.frage || "").toLowerCase()
      .split(/[^a-zäöüß]+/).filter((w) => w.length >= 6).map((w) => w.slice(0, 6));
    const passt = zeilen.some((z) => {
      const zk = String(z || "").toLowerCase();
      if (!stichwoerter.some((w) => zk.includes(w))) return false;
      const teile = String(z).split(/[;,]| und /).filter((x) => x.trim().length > 1);
      return teile.length >= n;
    });
    if (passt) return true;
  }
  return false;
}

/* Eine Verneinungsfrage prueft, ob ein Kind "nicht" ueberliest - nicht, ob es
 * etwas weiss. Regel 4b bittet darum; hier wird sie durchgesetzt, weil eine
 * Bitte im Auftrag keine Pruefung ist (dieselbe Lehre wie bei den Namen, beim
 * Fachfremden und beim Rechnen).
 *
 * Nur GROSS geschriebene Verneinungen und die eindeutigen Formen - "nicht" in
 * normaler Schreibweise kommt in harmlosen Fragen vor ("Was gehoert nicht
 * dazu" faengt die Grossschreibung ohnehin, und "Welche Zahl ist nicht
 * gerade?" ist eine echte Matheaufgabe). */
export function verneint(frage) {
  const f = String(frage || "");
  if (/\b(NICHT|KEIN|KEINE|FALSCH|AUSSER)\b/.test(f)) return true;
  return /\b(nicht|kein|keine)\s+(zu|nach|in|an|auf)\b/i.test(f) &&
         /^(welch|wer|was)/i.test(f.trim());
}

/* Ein Tipp, der die Loesung enthaelt, ist kein Tipp. Geprueft wird gegen die
 * RICHTIGE Antwort (die erste) - steht sie oder eine Zahl daraus im Tipp,
 * faellt er weg. Lieber kein Tipp als einer, der es verschenkt.
 *
 * Anlass: Mein eigener Entwurf vom 23.09.2026 schlug "Es war das Jahr der
 * Olympischen Spiele in Muenchen" vor - wer das weiss, hat 1972. Denny hat
 * beim Ansehen genau solche Details gefunden. */
export function tippOk(tipp, antworten) {
  const s = String(tipp || "").trim();
  if (!s || s.length < 8) return false;
  const richtig = String((antworten || [])[0] == null ? "" : antworten[0]).trim();
  if (!richtig) return true;
  const putzen = (x) => x.toLowerCase().replace(/[.,;:!?"'()]/g, " ").replace(/\s+/g, " ").trim();
  const st = putzen(s), rt = putzen(richtig);
  if (rt.length >= 2 && st.includes(rt)) return false;
  // Jede Zahl der Antwort einzeln - "1972" darf nicht im Tipp stehen.
  const zahlen = richtig.match(/\d[\d.\s]*\d|\d/g) || [];
  for (const z of zahlen) {
    const nackt = z.replace(/[^0-9]/g, "");
    if (nackt.length >= 2 && s.replace(/[^0-9]/g, "").includes(nackt)) return false;
  }
  // Und jedes Sachwort ab fuenf Buchstaben.
  for (const w of rt.split(" ")) {
    if (w.length >= 5 && st.includes(w)) return false;
  }
  return true;
}
