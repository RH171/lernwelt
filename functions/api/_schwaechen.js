// Woran ein Kind zuletzt gescheitert ist - damit es wiederkommt.
//
// Paul am 20.09.2026, über die Ferien-Zeitung: "die Aufgaben hier sind immer
// die gleichen". Denny dazu: "Ich möchte, dass diese Fragen immer wiederholt
// werden, ähnlich wie bei Duolingo, sodass er aus seinen Fehlern lernt. Wenn
// er eins falsch gemacht hat, soll diese Frage mindestens dreimal in den
// nächsten Spielen immer wiederholt werden ... Es soll dann aber nicht exakt
// die gleiche Frage sein, sondern vielleicht mit dem gleichen Wort oder mit
// dem gleichen Lernziel."
//
// Genau das ist der Unterschied zu einer Fehlerliste: Wiederholt wird das
// LERNZIEL (das Merkmal), nicht die Frage. Sonst lernt er die Antwort
// auswendig, statt die Regel zu verstehen - und das war Dennys zweite Sorge
// am selben Tag.
//
// Die Daten liegen längst da: lernstand.js meldet zu jeder Antwort ein
// Merkmal ("zehneruebergang plus", "m in cm", "steigerung adjektive"), und
// die Runden stehen im KV. Hier wird daraus die Liste, die beim nächsten
// Spielbau mitgeht.

const RUNDEN = (kind) => "lernstand:" + kind;   // derselbe Schluessel wie in statistik.js

// So viele Spiele lang bleibt ein Fehler auf der Liste, wenn er nicht wieder
// richtig beantwortet wird. Dennys Zahl: "mindestens dreimal".
export const WIEDERHOLUNGEN = 3;

// Weiter zurück wird nicht geschaut - was vor drei Wochen hakte, ist kein
// Thema mehr für das Spiel von heute.
const TAGE_ZURUECK = 21;

/* Die offenen Lernziele eines Kindes, wichtigstes zuerst.
 *
 * Gezählt wird je Merkmal, wie oft es zuletzt falsch war und wie oft richtig.
 * Auf die Liste kommt nur, was seit dem letzten Fehler noch nicht dreimal
 * gesessen hat - wer eine Sache dreimal richtig hatte, muss sie nicht weiter
 * vorgesetzt bekommen.
 */
export async function schwaechenHolen(env, kind, wieViele = 5) {
  if (!env || !env.PAUL_KV) return [];
  let liste = [];
  try {
    const roh = await env.PAUL_KV.get(RUNDEN(String(kind || "").toLowerCase()));
    liste = roh ? JSON.parse(roh) : [];
  } catch (e) { return []; }
  if (!Array.isArray(liste) || !liste.length) return [];

  const grenze = Date.now() - TAGE_ZURUECK * 24 * 3600 * 1000;
  const je = {};

  // Älteste zuerst, damit "seit dem letzten Fehler" wirklich stimmt.
  const sortiert = liste
    .filter((r) => r && !isNaN(new Date(r.zeit)) && new Date(r.zeit).getTime() >= grenze)
    .sort((a, b) => new Date(a.zeit) - new Date(b.zeit));

  for (const r of sortiert) {
    for (const a of (r.aufgaben || [])) {
      const m = String(a.merkmal || "").trim().toLowerCase();
      // "besuch" ist eine Runde ohne Aufgaben - kein Lernziel.
      if (!m || a.art === "besuch") continue;
      const e = je[m] || (je[m] = { merkmal: m, falsch: 0, seitdemRichtig: 0, beispiel: "", thema: "" });
      if (a.stimmt) {
        e.seitdemRichtig++;
      } else {
        e.falsch++;
        e.seitdemRichtig = 0;      // der Zähler beginnt nach jedem Fehler neu
        if (a.gegeben && a.richtig) e.beispiel = a.gegeben + " statt " + a.richtig;
        e.thema = r.thema || r.fach || "";
      }
    }
  }

  return Object.values(je)
    .filter((e) => e.falsch > 0 && e.seitdemRichtig < WIEDERHOLUNGEN)
    // Was oft danebenging und seitdem selten saß, zuerst.
    .sort((a, b) => (b.falsch - b.seitdemRichtig) - (a.falsch - a.seitdemRichtig))
    .slice(0, wieViele)
    .map((e) => ({
      merkmal: e.merkmal,
      falsch: e.falsch,
      nochOffen: WIEDERHOLUNGEN - e.seitdemRichtig,
      beispiel: e.beispiel,
      thema: e.thema,
    }));
}

/* Daraus den Textblock für den Bauauftrag.
 *
 * Bewusst als ANWEISUNG formuliert, nicht als Hintergrundwissen: "Eine Bitte
 * im Auftrag ist keine Prüfung" gilt hier genauso - aber ohne klare Ansage
 * passiert gar nichts. Geprüft wird hinterher mechanisch (siehe
 * wiederholungGeprueft).
 */
export function schwaechenBlock(schwaechen) {
  if (!schwaechen || !schwaechen.length) return "";
  const zeilen = schwaechen.map((s) =>
    `- "${s.merkmal}"${s.beispiel ? ` (zuletzt: ${s.beispiel})` : ""}`).join("\n");
  return `

DAS HAT ZULETZT NICHT GESESSEN - BAUE ES WIEDER EIN
${zeilen}

Zu JEDEM dieser Punkte mindestens eine Aufgabe, und schreibe in ihr Feld
"merkmal" GENAU den Schlüssel aus der Liste - sonst lässt sich nicht zählen,
ob es diesmal saß.

Aber: NICHT dieselbe Aufgabe noch einmal. Anderes Wort, andere Zahlen, anderer
Zusammenhang - dasselbe Lernziel. Wer die alte Frage wiedererkennt, lernt die
Antwort auswendig statt der Regel.

Diese Aufgaben kommen NICHT zuerst. Verteile sie zwischen die neuen, damit das
Spiel sich nicht wie eine Strafarbeit anfühlt.`;
}

// Wurde wirklich eingebaut, was verlangt war? Gibt die Merkmale zurück, die
// FEHLEN - der Aufrufer entscheidet, was er damit macht.
export function wiederholungGeprueft(schwaechen, aufgaben) {
  if (!schwaechen || !schwaechen.length) return [];
  const drin = new Set((aufgaben || []).map((a) => String(a.merkmal || "").trim().toLowerCase()));
  return schwaechen.map((s) => s.merkmal).filter((m) => !drin.has(m));
}
