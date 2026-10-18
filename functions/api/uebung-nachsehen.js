/* Antworten nach dem Sinn nachsehen (18.10.2026).
 *
 * Denny am 18.10.2026, Helenas Geschichts-Übung: "19.Jahundert" für "19.",
 * "11 Jahundert und 12 Jahundert" für "11. und 12. Jahrhundert" und "für die
 * weltliche Macht" für "weltliche" standen als falsch da. "Wenn du das
 * verifizieren würdest, würdest du die Antwort auch als richtig empfinden."
 *
 * Ein Buchstabenvergleich kann keinen Sinn prüfen. Die Seite vergleicht
 * deshalb zuerst selbst; nur was dort NICHT passt, kommt hierher und wird von
 * Claude nach dem Inhalt beurteilt: richtig, auch wenn anders formuliert oder
 * verschrieben - dann mit einem kurzen Schreibtipp. Schreibt nie, merkt sich
 * nichts. Kostet einen kleinen Modell-Lauf je Runde, nur mit Ausweis.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";

const MODELL = "claude-sonnet-5-5";
const KINDER = {
  paul: "Paul, 4. Klasse Grundschule, 10 Jahre. Seine Lehrerin erlaubt keine Weil-Sätze: im Tipp nie \"weil\".",
  leon: "Leon, 2. Klasse Grundschule, 7 Jahre. Tipp in sehr einfachen Worten, nie \"weil\".",
  helena: "Helena, 7. Klasse Gymnasium, 12 Jahre. Sachlich, auf Augenhöhe.",
};
const MAX = 20;

function antwort(status, obj) {
  return new Response(JSON.stringify(obj), {
    status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
const kurz = (s, n) => String(s == null ? "" : s).slice(0, n);

export function systemtext(kind) {
  return [
    "Du siehst Antworten eines Kindes in einer Übung nach. Eine einfache Buchstaben-Prüfung hat sie als falsch",
    "markiert. Deine Aufgabe: nach dem INHALT entscheiden, ob die Antwort stimmt.",
    "",
    "RICHTIG ist eine Antwort, wenn sie inhaltlich dasselbe sagt wie die Musterlösung - auch wenn sie",
    "- anders formuliert ist oder mehr Worte hat (\"für die weltliche Macht\" statt \"weltliche\"),",
    "- eine Einheit oder ein Wort dazu hat (\"19. Jahrhundert\" statt \"19.\"),",
    "- Tippfehler oder Rechtschreibfehler hat, solange klar ist, was gemeint ist (\"Jahundert\"),",
    "- den Punkt bei einer Ordnungszahl weglässt oder Groß-/Kleinschreibung anders ist.",
    "FALSCH ist sie, wenn der Inhalt nicht stimmt, wenn sie zwei Möglichkeiten nennt und nicht entscheidet,",
    "wenn die Musterlösung zwei Teile verlangt und einer fehlt, oder wenn eine Vokabel bzw. Grammatikform",
    "das Geübte selbst ist und falsch geschrieben wurde (in Fremdsprachen und Rechtschreibung zählt die",
    "Schreibweise). Ist die Musterlösung selbst falsch und die Antwort des Kindes sachlich richtig, ist sie RICHTIG.",
    "",
    "Zu jeder Antwort ein kurzer Tipp (höchstens ein Satz, Deutsch, an das Kind mit \"du\"):",
    "- bei richtig mit Fehlern: wie man es richtig schreibt (\"Jahrhundert schreibt man mit r: Jahrhundert.\");",
    "- bei richtig ohne Fehler: leer lassen;",
    "- bei falsch: was inhaltlich fehlt oder nicht stimmt, ohne Wertung der Person.",
    "Kind: " + (KINDER[kind] || KINDER.helena),
    "",
    "Antworte NUR mit JSON, ohne Text davor oder danach:",
    "{\"urteile\":[{\"nr\":1,\"richtig\":true,\"tipp\":\"...\"}]} - genau ein Urteil je Nummer.",
  ].join("\n");
}

export function lesen(text, anzahl) {
  const m = String(text || "").match(/\{[\s\S]*\}/);
  if (!m) return null;
  let j; try { j = JSON.parse(m[0]); } catch (e) { return null; }
  const liste = Array.isArray(j && j.urteile) ? j.urteile : null;
  if (!liste) return null;
  const raus = [];
  for (let i = 1; i <= anzahl; i++) {
    const u = liste.find((x) => Number(x && x.nr) === i);
    raus.push(u ? { richtig: u.richtig === true, tipp: kurz(u.tipp, 240).replace(/\bweil\b/gi, "denn") } : null);
  }
  return raus;
}

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) return antwort(500, { ok: false, fehler: "Schlüssel fehlt" });
  let a; try { a = await request.json(); } catch (e) { return antwort(400, { ok: false, fehler: "kein JSON" }); }
  const kind = KINDER[a.kind] ? a.kind : "paul";
  const alsEltern = !!geheimFuer(env, "eltern") && (await ausweisGueltig(request, geheimFuer(env, "eltern"), env));
  if (!alsEltern && !(await ausweisGueltig(request, geheimFuer(env, kind), env))) {
    return antwort(401, { ok: false, fehler: "Bitte melde dich an." });
  }
  const posten = (Array.isArray(a.posten) ? a.posten : []).slice(0, MAX);
  if (!posten.length) return antwort(200, { ok: true, urteile: [] });

  const liste = posten.map((p, i) => [
    `Nr. ${i + 1}`,
    `Frage: ${kurz(p.frage, 600)}`,
    `Musterlösung: ${kurz(p.antwort, 200)}` + (Array.isArray(p.auch) && p.auch.length ? ` (auch: ${p.auch.map((x) => kurz(x, 80)).join(" | ")})` : ""),
    p.erklaerung ? `Erklärung: ${kurz(p.erklaerung, 500)}` : "",
    `Antwort des Kindes: ${kurz(p.gegeben, 300)}`,
  ].filter(Boolean).join("\n")).join("\n\n");

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODELL, max_tokens: 2000,
        system: systemtext(kind),
        messages: [{ role: "user", content: liste }],
      }),
    });
    if (!r.ok) return antwort(200, { ok: false, fehler: "Modell " + r.status });
    const j = await r.json();
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    const urteile = lesen(text, posten.length);
    if (!urteile) return antwort(200, { ok: false, fehler: "unlesbar" });
    return antwort(200, { ok: true, urteile });
  } catch (e) {
    return antwort(200, { ok: false, fehler: "keine Verbindung" });
  }
}
