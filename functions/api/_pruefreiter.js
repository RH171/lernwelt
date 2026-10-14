/* Prüf-Reiter: jedes Blatt wird sofort nachgesehen (14.10.2026)
 *
 * Dennys Wahl am 14.10.2026, Variante C aus entwuerfe/2026-10-14-pruef-reiter.html,
 * nur für Paul: Nach dem Durchlesen steht im Hochladen-Ablauf ein Kasten
 * "Ich habe nachgesehen" mit den gefundenen Stellen. Was offen bleibt, steht
 * als blauer Knopf "Nachgesehen" ganz oben auf seiner Startseite.
 *
 * Drei Arten von Stellen:
 *   rechnen   🧮 Bitte nachrechnen - der Lesehelfer schrieb "Kind schrieb X,
 *             richtig: Y" in eine MATHE-Zeile, ohne Lehrkraft. Gemeldet wird
 *             nur, was hier NACHGERECHNET stimmt: X ist falsch UND Y ist
 *             richtig. Was sich nicht rechnen lässt, bleibt still - ein
 *             falscher Hinweis kostet ein Kind Zeit an einer Stelle, die
 *             längst stimmt (Kapitel 015).
 *   pinnwand  📌 Abweichung von der Vorlage der Lehrerin (_lehrervorlagen.js),
 *             nur Status "abweichung" - nie unsicher, frei, schreibweise.
 *   lehrerin  ✍️ Die Lehrerin hat rot verbessert - nur zur Kenntnis.
 *
 * DIE LÖSUNG VERLÄSST DEN SERVER NIE. oeffentlich() streift sie ab, und das
 * Prüfen einer Verbesserung läuft hier, gegen die nachgerechnete Wahrheit.
 * Tipps sind Regeln, kein Modellaufruf: ohne "weil", ohne Warum-Fragen
 * (Frau Sy erlaubt keine Weil-Antworten), sie zeigen den WEG, nie die Zahl.
 *
 * Speicher: EIN Schlüssel `pruefreiter:<kind>` mit dem, was erledigt ist.
 * Ein Schreibvorgang je erledigter Stelle, falsche Versuche schreiben nichts.
 *
 * Prüfen ohne Server: node pruefe-pruefreiter.mjs
 */
import { kindSchrieb, blattVergleichen, vorlageFuerBlatt, falten, levenshtein, GLEICHWERTIG } from "./_lehrervorlagen.js";
import { zeileKindgerecht } from "./_herkunft.js";

/* Ab diesem Blattdatum zählt der Bestand mit (Dennys Auftrag: "Die schon
   vorhandenen Blätter seit 06.10.2026 gehören dazu"). Ein Blatt, das gerade
   hochgeladen wird, zählt immer - egal, welches Datum darauf steht. */
export const AB = "2026-10-06";
export const KINDER_MIT_PRUEFREITER = ["paul"];
export const SCHLUESSEL = (kind) => "pruefreiter:" + kind;

const HAND = /^✍\s*/;
const ART_NAME = { heft: "Heft", uebung: "Übungsblatt", buch: "Schulbuch", arbeitsheft: "Arbeitsheft", merkheft: "Merkheft" };

function kurz(s) {
  /* FNV-1a, 32 Bit, als Basis 36 - stabil, solange die Zeile gleich bleibt. */
  let h = 0x811c9dc5;
  const t = String(s || "");
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}

/* ---------- Rechnen ---------- */

const OP = { "·": "*", "x": "*", "×": "*", "*": "*", ":": "/", "÷": "/", "+": "+", "-": "-", "−": "-", "–": "-" };
const OP_ZEIGEN = { "*": "·", "/": ":", "+": "+", "-": "−" };

export function gleichungLesen(s) {
  const m = /^\s*(\d{1,6})\s*([·x×*:÷+\-−–])\s*(\d{1,6})\s*=\s*(\d{1,7})\s*$/.exec(String(s || ""));
  if (!m) return null;
  return { a: +m[1], op: OP[m[2]], b: +m[3], c: +m[4] };
}
function stimmt(g) {
  if (g.op === "*") return g.a * g.b === g.c;
  if (g.op === "+") return g.a + g.b === g.c;
  if (g.op === "-") return g.a - g.b === g.c;
  if (g.op === "/") return g.b !== 0 && g.a === g.b * g.c;
  return false;
}
function zeigen(g, luecke) {
  const f = (p) => (p === luecke ? "?" : String(g[p]));
  return f("a") + " " + OP_ZEIGEN[g.op] + " " + f("b") + " = " + f("c");
}
export function teiler(n) {
  const aus = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) aus.push(i);
  return aus;
}
const zahlen = (s) => (String(s || "").match(/\d+/g) || []).map(Number);
function mengeGleich(a, b) {
  const x = [...new Set(a)].sort((p, q) => p - q), y = [...new Set(b)].sort((p, q) => p - q);
  return x.length === y.length && x.every((v, i) => v === y[i]);
}

/* Der Weg zur Lösung, nie die Lösung. `ist` = was Paul (jetzt) stehen hat. */
export function gleichungTipp(g, luecke, ist) {
  const { a, b, c, op } = g;
  if (op === "/") {
    if (luecke === "c") return "Mach die Probe: Rechne " + ist + " · " + b + ". Kommt " + a + " heraus?";
    if (luecke === "a") return "Mach die Umkehraufgabe: Rechne " + c + " · " + b + ". Das Ergebnis gehört vorne hin.";
    return "Mach die Probe: Rechne " + ist + " · " + c + ". Kommt " + a + " heraus?";
  }
  if (op === "*") {
    if (luecke === "c") {
      if (/0$/.test(String(a)) || /0$/.test(String(b)))
        return "Rechne erst die kleine Aufgabe ohne die Nullen. Dann hänge alle Nullen der Aufgabe an.";
      return "Rechne die Aufgabe noch einmal langsam. Die " + Math.min(a, b) + "er-Reihe hilft dir.";
    }
    const andere = luecke === "a" ? b : a;
    return "Mach die Probe: Rechne " + ist + " · " + andere + ". Kommt " + c + " heraus?";
  }
  if (luecke === "c") {
    if (op === "+") return "Mach die Probe: Rechne " + ist + " − " + b + ". Kommt " + a + " heraus?";
    return "Mach die Probe: Rechne " + ist + " + " + b + ". Kommt " + a + " heraus?";
  }
  return "Setz deine Zahl in die Aufgabe ein und rechne nach. Kommt " + c + " heraus?";
}

export function teilerTipp(ist, n) {
  const D = teiler(n);
  const zaehl = {};
  ist.forEach((x) => { zaehl[x] = (zaehl[x] || 0) + 1; });
  const doppelt = Object.keys(zaehl).filter((x) => zaehl[x] > 1).map(Number);
  const menge = [...new Set(ist)];
  const fremd = menge.filter((x) => !D.includes(x));
  const fehlen = D.length - menge.filter((x) => D.includes(x)).length;
  const teile = [];
  doppelt.forEach((d) => teile.push("Die " + d + " steht " + (zaehl[d] === 2 ? "zweimal" : zaehl[d] + "-mal") + " da."));
  fremd.forEach((f) => teile.push("Mach die Probe mit der " + f + ": Geht " + n + " : " + f + " ohne Rest auf?"));
  if (fehlen === 1) teile.push("Es fehlt noch 1 Teiler.");
  else if (fehlen > 1) teile.push("Es fehlen noch " + fehlen + " Teiler.");
  if (fehlen > 0) {
    /* Ein Paar, das Paul schon hat - sonst 1 · n. */
    const p = menge.filter((x) => D.includes(x) && x > 1 && x * x < n && menge.includes(n / x)).sort((x, y) => y - x)[0];
    teile.push("Teiler kommen immer als Paar, zum Beispiel " + (p ? p + " · " + (n / p) : "1 · " + n) + " = " + n +
               ". Probiere der Reihe nach 2, 3, 4 …");
  }
  return teile.join(" ");
}

/* Eine Mathe-Zeile mit "Kind schrieb X, richtig: Y" -> nachgerechnete Stelle
   oder null. Gibt die Wahrheit mit (`soll`) - die bleibt auf dem Server. */
export function rechenStelle(zeile, blatt) {
  if (!blatt || blatt.fach !== "mathe") return null;
  const roh = String(zeile || "").replace(HAND, "");
  if (/\bLehrkraft\b|\bLehrerin\b/i.test(roh)) return null;   // die Lehrerin hat es gesehen
  const k = kindSchrieb(roh);
  if (!k) return null;

  const t = /^(\d{1,4})\s*:\s*(\d+(?:\s*,\s*\d+)*)\s*$/.exec(k.x);
  if (t && /teiler/i.test([blatt.titel, blatt.thema, roh].join(" "))) {
    const n = +t[1], ist = zahlen(t[2]), soll = zahlen(k.y);
    if (!n || n > 1000) return null;
    const D = teiler(n);
    if (!mengeGleich(soll, D) || soll.length !== D.length) return null;   // Urteil des Lesehelfers nicht bestätigt
    if (mengeGleich(ist, D) && ist.length === D.length) return null;      // stimmt doch
    return { typ: "teiler", n, ist, soll: D, aufgabe: "Alle Teiler von " + n, du: ist.join(", "),
             tipp: teilerTipp(ist, n), eingabe: "liste" };
  }

  const g = gleichungLesen(k.x);
  const y = /^\s*(\d{1,7})\s*$/.exec(k.y);
  if (g && y) {
    if (stimmt(g)) return null;
    const Y = +y[1];
    const passt = ["a", "b", "c"].filter((p) => g[p] !== Y && stimmt({ ...g, [p]: Y }));
    if (passt.length !== 1) return null;
    const luecke = passt[0];
    return { typ: "gleichung", g, luecke, ist: g[luecke], soll: Y, aufgabe: zeigen(g, luecke), du: String(g[luecke]),
             tipp: gleichungTipp(g, luecke, g[luecke]), eingabe: "zahl" };
  }
  return null;
}

/* ---------- Rot von der Lehrerin ---------- */

/* Strenger als rotVonLehrerin(): nur Zeilen mit dem Wort "Lehrkraft" (so
   schreibt es der Lesehelfer) und einer Verbesserung. "Die Lehrerin erklärt
   die Aufgabe" ist Text vom Blatt, keine Verbesserung. */
export function rotZeilen(inhalt) {
  return (inhalt || []).map((z) => String(z || "")).filter((z) => {
    const s = z.replace(HAND, "");
    if (!/\bLehrkraft\b/.test(s)) return false;
    if (/Lehrkraft\s+schrieb\b[^,]*,\s*richtig/i.test(s)) return false;
    return /verbess|korrig|richtig|durchgestrichen|ergänzt|ergaenzt|statt|Kind schrieb|✗|falsch|noch mal/i.test(s);
  });
}

/* "Lehrkraft verbessert: schimmlige Käse (rotes g)" -> "schimmlige Käse (rotes g)",
   "Lehrkraft zu Teiler von 18: noch mal anschauen" -> "Zu Teiler von 18: noch mal anschauen",
   sonst "Lehrerin" -> "deine Lehrerin". Die Überschrift der Karte sagt schon,
   dass es die Lehrerin war. */
export function rotText(z) {
  return zeileKindgerecht(z)
    .replace(/^Lehrerin\s+(?:verbessert|hat verbessert|korrigiert)\s*:\s*/i, "")
    .replace(/^Lehrerin\s+zu\s+([^:]+):\s*/i, "Zu $1: ")
    .replace(/^Lehrerin\s*:\s*/i, "")
    .replace(/(^|[^\p{L}])Lehrerin\b/gu, "$1deine Lehrerin")
    .slice(0, 200);
}

/* ---------- Alle Stellen eines Blattes ---------- */

function blattKurz(b) {
  return { id: String(b.id || ""), titel: String(b.titel || "").slice(0, 80), datum: String(b.datum || ""),
           fach: String(b.fach || ""), art: ART_NAME[b.art] || "" };
}

/* Mit Wahrheit - nur für den Server. */
export function stellenFuerBlatt(blatt, vorlagenDaten) {
  if (!blatt || blatt.sichtbar === false) return [];
  const inhalt = Array.isArray(blatt.inhalt) ? blatt.inhalt : [];
  const aus = [];
  const bk = blattKurz(blatt);

  inhalt.forEach((z) => {
    const r = rechenStelle(z, blatt);
    if (r) aus.push({ id: bk.id + ":r:" + kurz(z), art: "rechnen", blatt: bk, ...r });
  });

  const vorlage = vorlageFuerBlatt(vorlagenDaten, blatt.id);
  if (vorlage) {
    const v = blattVergleichen(blatt, vorlage);
    (v && v.abweichungen || []).forEach((x) => {
      const vz = (vorlage.zeilen || []).find((q) => q.nr === x.nr);
      if (!vz || vz.unsicher || vz.frei || vz.liste) return;
      aus.push({ id: bk.id + ":p:" + x.nr, art: "pinnwand", blatt: bk, aufgabe: String(x.aufgabe || "").slice(0, 120),
                 du: String(x.paul || "").slice(0, 80), soll: vz.antwort, gleich: vz.gleich || [], eingabe: "text",
                 tipp: "Auf der Vorlage deiner Lehrerin steht hier etwas anderes. Lies die Aufgabe noch einmal genau und schau in deinem Heft nach." });
    });
  }

  rotZeilen(inhalt).forEach((z) => {
    aus.push({ id: bk.id + ":l:" + kurz(z), art: "lehrerin", blatt: bk,
               text: rotText(z) });
  });
  return aus;
}

/* Was der Browser bekommt: ohne `soll`, ohne `gleich`, ohne Rohzeile. */
export function oeffentlich(s) {
  const o = { id: s.id, art: s.art, blatt: s.blatt };
  if (s.art === "lehrerin") { o.text = s.text; return o; }
  o.aufgabe = s.aufgabe; o.du = s.du; o.tipp = s.tipp; o.eingabe = s.eingabe;
  return o;
}

export function imBestand(blatt) {
  return !!blatt && blatt.sichtbar !== false && String(blatt.datum || "") >= AB;
}

export function offeneStellen(blaetter, vorlagenDaten, zustand, nurBlatt) {
  const erledigt = (zustand && zustand.s) || {};
  const aus = [];
  for (const b of blaetter || []) {
    if (nurBlatt ? b.id !== nurBlatt : !imBestand(b)) continue;
    for (const s of stellenFuerBlatt(b, vorlagenDaten)) if (!erledigt[s.id]) aus.push(s);
  }
  return aus;
}

/* ---------- Eine Verbesserung prüfen ---------- */

const GUT = {
  teiler: (n, k) => "Super, jetzt hast du alle " + k + " Teiler von " + n + " gefunden!",
  gleichung: () => "Super, du hast nachgerechnet und es selbst verbessert!",
  pinnwand: () => "Super, jetzt steht es wie bei deiner Lehrerin!",
};

export function verbesserungPruefen(s, antwort) {
  const a = String(antwort == null ? "" : antwort).slice(0, 200).trim();
  if (!a) return { richtig: false, tipp: "Schreib deine Verbesserung in das Feld." };
  if (s.art === "rechnen" && s.typ === "teiler") {
    const ist = zahlen(a);
    if (!ist.length) return { richtig: false, tipp: "Schreib die Teiler mit Komma dazwischen, zum Beispiel 1, 2, …" };
    if (mengeGleich(ist, s.soll) && ist.length === s.soll.length) return { richtig: true, satz: GUT.teiler(s.n, s.soll.length) };
    return { richtig: false, tipp: (mengeGleich(ist, s.soll) ? "Fast! " : "Noch nicht ganz. ") + teilerTipp(ist, s.n) };
  }
  if (s.art === "rechnen" && s.typ === "gleichung") {
    const m = /^\s*(\d{1,7})\s*$/.exec(a);
    if (!m) return { richtig: false, tipp: "Schreib nur die Zahl in das Feld." };
    if (stimmt({ ...s.g, [s.luecke]: +m[1] })) return { richtig: true, satz: GUT.gleichung() };
    return { richtig: false, tipp: "Noch nicht. " + gleichungTipp(s.g, s.luecke, +m[1]) };
  }
  if (s.art === "pinnwand") {
    const gut = [s.soll].concat(s.gleich || []);
    for (const g of GLEICHWERTIG) if (g.some((x) => falten(x) === falten(s.soll))) gut.push(...g);
    if (gut.some((g) => falten(g) === falten(a))) return { richtig: true, satz: GUT.pinnwand() };
    const nah = gut.some((g) => { const d = levenshtein(falten(g), falten(a)); return d > 0 && d <= 2; });
    if (nah) return { richtig: false, tipp: "Fast! Schau noch einmal genau, wie das Wort geschrieben wird." };
    return { richtig: false, tipp: "Noch nicht. " + s.tipp };
  }
  return { richtig: false, tipp: "" };
}

/* ---------- Speicher ---------- */

export async function zustandLesen(env, kind) {
  try {
    const roh = await env.PAUL_KV.get(SCHLUESSEL(kind));
    const d = roh ? JSON.parse(roh) : null;
    return d && typeof d.s === "object" && d.s ? d : { v: 1, s: {} };
  } catch (e) { return { v: 1, s: {} }; }
}

export async function zustandSchreiben(env, kind, zustand) {
  await env.PAUL_KV.put(SCHLUESSEL(kind), JSON.stringify(zustand));
}
