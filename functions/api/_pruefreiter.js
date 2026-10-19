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
 *   lehrerin  ✍️ Die Lehrerin hat rot verbessert. SEIT 16.10.2026 STILL (ROT_STILL):
 *             Paul ändert kein Blatt, auf dem die Lehrerin die Lösung schon rot
 *             hingeschrieben hat. Dieselbe Regel unterdrückt 🧮 (Rot im Feld) und
 *             📌 (Rot an der Zeile). Kapitel 123, Abschnitt „Rot ist fertig“.
 *
 * Bei 🧮 VERLÄSST DIE LÖSUNG DEN SERVER NIE. oeffentlich() streift sie ab, und das
 * Prüfen einer Verbesserung läuft hier, gegen die nachgerechnete Wahrheit.
 * Bei 📌 und ✍️ zeigt die Karte die Antwort der Lehrerin SOFORT (Dennys neue
 * Entscheidung 14.10.2026, 10:30 Uhr): Paul hat dort nur falsch abgeschrieben
 * und kann es nicht selbst nachprüfen. Er verbessert im Heft und tippt
 * "Verbessert ✓" (Aktion "verbessert").
 * Tipps sind Regeln, kein Modellaufruf: ohne "weil", ohne Warum-Fragen
 * (die Lehrerin erlaubt keine Weil-Antworten), sie zeigen den WEG, nie die Zahl.
 *
 * Nachrechnen (14.10.2026, _nachrechnen.js): 🧮 kommt zusätzlich aus der Feld-für-
 * Feld-Abschrift am Blatt (`nachgerechnet`) - nur Fehler, die die zweite Lesung
 * bestätigt hat, Kennung <blatt>:n:<kurz>. Dieselbe Aufgabe wie eine "Kind
 * schrieb"-Stelle oder eine schon verbesserte Zeile gibt es nur einmal.
 *
 * Speicher: EIN Schlüssel `pruefreiter:<kind>` mit dem, was erledigt ist.
 * Ein Schreibvorgang je erledigter Stelle, falsche Versuche schreiben nichts.
 *
 * Prüfen ohne Server: node pruefe-pruefreiter.mjs
 */
import { kindSchrieb, blattVergleichen, vorlageFuerBlatt, falten, levenshtein, GLEICHWERTIG, zeileFinden } from "./_lehrervorlagen.js";
import { ortFuer, vorlageOrt } from "./_fehlerkreis.js";
import { gruenFuer } from "./_korrektur.js";
import { zeileKindgerecht } from "./_herkunft.js";
import { auswerten as nrAuswerten, aktuell as nrAktuell, aufgabeSchluessel, ausdruckZeigen, rechnen as nrRechnen } from "./_nachrechnen.js";
export { brauchtNachrechnen } from "./_nachrechnen.js";
import { auswerten as vlAuswerten, aktuell as vlAktuell, vokabelnImFach, sauber as vlSauber } from "./_volllesen.js";
export { brauchtVolllesen } from "./_volllesen.js";

/* Ab diesem Blattdatum zählt der Bestand mit (Dennys Auftrag: "Die schon
   vorhandenen Blätter seit 06.10.2026 gehören dazu"). Ein Blatt, das gerade
   hochgeladen wird, zählt immer - egal, welches Datum darauf steht. */
export const AB = "2026-10-06";
/* Rote Stellen nur von Blättern, die ab diesem Tag (deutsche Zeit) hochgeladen
   wurden. Ohne `angelegt` gilt ein Blatt als alt. */
export const ROT_AB = "2026-10-14";
/* Rot ist fertig (16.10.2026, Denny 18:09 Uhr): „Diese Blätter dürfen nicht zum
   Korrigieren auftauchen, wo sie mit dem roten Stift die Zahl schon selber daneben
   verbessert hat.“ Gezählt am 16.10.2026: von 71 roten Zeilen aller drei Kinder
   tragen 55 die Lösung der Lehrerin (von Hand gezählt), die übrigen sind Haken, „noch mal anschauen“,
   ✗ oder Durchgestrichenes ohne Lösung - die meldet die Lehrerin selbst, und
   Rechenfehler darin findet das Nachrechnen ohnehin (🧮). Darum keine ✍️-Karte mehr.
   `mitRot: true` (opt) baut die alten Stellen - nur für POST (alte offene Seiten)
   und die Gegenprobe. */
export const ROT_STILL = true;
const TAG_BERLIN = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" });
export function hochgeladenAm(blatt) {
  const t = Date.parse(String((blatt && blatt.angelegt) || ""));
  return isNaN(t) ? "" : TAG_BERLIN.format(new Date(t));
}
/* Volllesen (15.10.2026, Denny: „alles, was da hochgeladen worden ist“): alle drei Kinder. */
export const KINDER_MIT_PRUEFREITER = ["paul", "helena", "leon"];
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

/* Rest (Nachrechnen 14.10.2026): der Weg, nie die Zahl. */
export function restTipp(g) {
  if (g.r >= g.b) return "Schau auf deinen Rest: " + g.r + " ist nicht kleiner als " + g.b + ". Da passt die " + g.b + " noch einmal hinein.";
  return "Mach die Probe: Rechne " + g.q + " · " + g.b + " + " + g.r + ". Kommt " + g.a + " heraus?";
}
export function ausdruckTipp(a, luecke, ist) {
  if (luecke !== "e") return "Setz deine Zahl " + ist + " in die Aufgabe ein und rechne nach. Kommt " + a.erg + " heraus?";
  if (a.ops.some((o) => o === "*" || o === "/") && a.ops.some((o) => o === "+" || o === "-"))
    return "Rechne Schritt für Schritt: erst · und :, dann + und −.";
  return "Rechne die Aufgabe noch einmal Schritt für Schritt. Schreib dir das Zwischenergebnis auf.";
}
export function listeTipp(ist, n, art) {
  const zaehl = {};
  ist.forEach((x) => { zaehl[x] = (zaehl[x] || 0) + 1; });
  const teile = [];
  Object.keys(zaehl).filter((x) => zaehl[x] > 1).forEach((d) => teile.push("Die " + d + " steht " + (zaehl[d] === 2 ? "zweimal" : zaehl[d] + "-mal") + " da."));
  [...new Set(ist)].filter((x) => art === "vielfache" ? x % n !== 0 : n % x !== 0).forEach((x) =>
    teile.push(art === "vielfache" ? "Mach die Probe mit der " + x + ": Geht " + x + " : " + n + " ohne Rest auf?"
                                   : "Mach die Probe mit der " + x + ": Geht " + n + " : " + x + " ohne Rest auf?"));
  return teile.join(" ") || "Schau dir jede Zahl noch einmal an.";
}
function listeGut(ist, n, art) {
  return ist.length > 0 && ist.length === new Set(ist).size &&
    ist.every((x) => x > 0 && (art === "vielfache" ? x % n === 0 : n % x === 0));
}

/* Schlüssel einer "Kind schrieb"-Stelle - derselbe wie in der Abschrift. */
function stellenSchluessel(r) {
  if (r.typ === "teiler") return "T" + r.n;
  if (r.typ === "gleichung") return aufgabeSchluessel(r.g, r.luecke);
  return "";
}
/* Schon von Claude verbesserte Rechnungen ("180 : 6 = 30 (✓ verbessert · durch Claude)"):
   jede Lücke dieser Rechnung gilt als erledigt. */
const GL_ZEILE = /(\d{1,6})\s*([·x×*:÷+\-−–])\s*(\d{1,6})\s*=\s*(\d{1,7})/g;
function verbesserteSchluessel(inhalt) {
  const aus = new Set();
  for (const z of inhalt || []) {
    if (!/✓ verbessert · durch Claude/.test(String(z))) continue;
    for (const m of String(z).matchAll(GL_ZEILE)) {
      const g = { a: +m[1], op: OP[m[2]], b: +m[3], c: +m[4] };
      ["a", "b", "c"].forEach((l) => aus.add(aufgabeSchluessel(g, l)));
    }
  }
  return aus;
}

/* Stellen aus der Abschrift (`nachgerechnet`) - nur von der zweiten Lesung
   bestätigte Fehler. `schon` = Schlüssel, die es schon gibt. */
export function nachrechenStellen(blatt, bk, schon, mitRot) {
  if (!blatt || blatt.fach !== "mathe" || !nrAktuell(blatt)) return [];
  const w = nrAuswerten(blatt.nachgerechnet);
  if (!w) return [];
  const aus = [];
  for (const x of w.fehler) {
    if (x.bestaetigt !== true || schon.has(x.u.key)) continue;
    /* Rot ist fertig (16.10.2026): hat die Lehrerin in diesem Feld rot etwas
       hingeschrieben, ändert Paul es nicht - auch wenn ihr Rot nicht stimmt. Die
       Eltern sehen das weiter als ⚠️ (nachrechenStand().rotFalsch). */
    if (x.u.rotDa && !mitRot) continue;
    schon.add(x.u.key);
    const f = x.f, u = x.u;
    const nr = f.nr && f.nr !== "-" ? f.nr : "";
    const vorn = nr ? "Aufgabe " + nr + ": " : "";
    const grund = { id: bk.id + ":n:" + kurz(x.id + "|" + u.final), art: "rechnen", blatt: bk, nachgerechnet: true,
                    wo: nr, zeile: f.roh, rotDa: !!u.rotDa, paulGut: u.paulGut };
    if (u.rotDa) grund.steht = true;   // "Bei dir steht" - die Lehrerin hat dort schon etwas geändert
    if (f.typ === "gleichung") {
      aus.push({ ...grund, typ: "gleichung", g: u.g, luecke: u.luecke, ist: +u.final, soll: u.soll,
                 aufgabe: vorn + zeigen(u.g, u.luecke), du: u.final, tipp: gleichungTipp(u.g, u.luecke, +u.final), eingabe: "zahl",
                 paulWert: u.paulWert });
    } else if (f.typ === "ausdruck") {
      aus.push({ ...grund, typ: "ausdruck", aus: u.aus, luecke: u.luecke, soll: u.soll,
                 aufgabe: vorn + ausdruckZeigen(u.aus.terme, u.aus.ops, u.aus.erg, u.luecke), du: u.final,
                 tipp: ausdruckTipp(u.aus, u.luecke, +u.final), eingabe: "zahl", paulWert: u.paulWert });
    } else if (f.typ === "rest") {
      aus.push({ ...grund, typ: "rest", g: u.g, soll: u.soll, aufgabe: vorn + u.g.a + " : " + u.g.b + " = ? R ?",
                 du: u.g.q + " R " + u.g.r, tipp: restTipp(u.g), eingabe: "rest" });
    } else if (f.typ === "teiler") {
      aus.push({ ...grund, typ: "teiler", n: f.n, ist: u.ist, soll: teiler(f.n), aufgabe: vorn + "Alle Teiler von " + f.n,
                 du: u.ist.join(", "), tipp: teilerTipp(u.ist, f.n), eingabe: "liste" });
    } else {
      aus.push({ ...grund, typ: "liste", liste: f.typ, n: f.n, ist: u.ist,
                 aufgabe: vorn + (f.typ === "vielfache" ? "Vielfache von " : "Teiler von ") + f.n,
                 du: u.ist.join(", "), tipp: listeTipp(u.ist, f.n, f.typ), eingabe: "liste" });
    }
  }
  return aus;
}

/* Für den Elternbereich: wie vollständig ein Blatt nachgerechnet ist. */
export function nachrechenStand(blatt) {
  if (!blatt || blatt.fach !== "mathe") return null;
  if (!nrAktuell(blatt)) return { offen: true };
  const w = nrAuswerten(blatt.nachgerechnet);
  if (!w) return { offen: true };
  return { voll: w.voll, soll: w.soll, ist: w.ist, fehlt: w.fehlt.slice(0, 8), felder: w.felder,
           fehler: w.fehler.filter((x) => x.bestaetigt === true).length,
           ungeprueft: w.fehler.filter((x) => x.bestaetigt !== true).map((x) => x.f.roh).slice(0, 10),
           rotFalsch: w.fehler.filter((x) => x.bestaetigt === true && x.u.rotDa).map((x) => ({ zeile: x.f.roh, paulGut: !!x.u.paulGut })).slice(0, 10) };
}

/* ---------- Volllesen (15.10.2026, _volllesen.js) ----------
   🔤 „Schau genau hin“: nur Stellen, die eine EINDEUTIGE Quelle auf dem Blatt oder
   im Heft haben (Wörterkasten, Abschreibvorlage, gedruckte Lösung, gedruckte
   Vokabelliste) UND die die zweite Lesung Buchstabe für Buchstabe bestätigt hat.
   Die richtige Schreibweise verlässt den Server nie (wie bei 🧮): Das Kind
   vergleicht selbst mit seinem Blatt. Kennung <blatt>:v:<kurz>. */
const VL_TIPP = {
  woerter: "Vergleiche dein Wort Buchstabe für Buchstabe mit den Wörtern im Kasten auf deinem Blatt.",
  abschrift: "Vergleiche dein Wort Buchstabe für Buchstabe mit dem Text auf deinem Blatt.",
  loesung: "Auf deinem Blatt steht die Lösung. Vergleiche sie Buchstabe für Buchstabe mit deinem Eintrag.",
  vokabel: "Schau in deiner Vokabelliste nach und vergleiche Buchstabe für Buchstabe.",
};
export function volllesStellen(blatt, bk, vokabeln) {
  if (!blatt || !vlAktuell(blatt)) return [];
  const w = vlAuswerten(blatt.volllesen, vokabeln || []);
  if (!w) return [];
  const aus = [], ids = new Set();
  for (const x of w.fehler) {
    if (x.bestaetigt !== true) continue;
    const id = bk.id + ":v:" + kurz(x.fid);
    if (ids.has(id)) continue;
    ids.add(id);
    const vorn = x.nr && !/^[A-Z]$|^Rand$/i.test(x.nr) ? "Aufgabe " + x.nr + ": " : "";
    const vg = String(x.vorgabe || "").replace(/\s+/g, " ").trim();
    const aufgabe = x.quelle === "abschrift"
      ? vorn + "Abschreiben" + (vg ? ": „" + (vg.split(" ").length > 10 ? vg.split(" ").slice(0, 8).join(" ") + " …" : vg) + "“" : "")
      : vorn + (vg ? "„" + vg.slice(0, 100) + "“" : "dein Eintrag");
    aus.push({ id, art: "schreiben", typ: "wort", quelle: x.quelle, blatt: bk, volllesen: true, wo: x.nr, seite: x.seite,
               aufgabe, du: x.ist, soll: x.soll, gross: !!x.gross, zeile: x.roh, eingabe: "text",
               tipp: (x.gross ? "Schau auf den ersten Buchstaben: groß oder klein? " : "") + (VL_TIPP[x.quelle] || VL_TIPP.abschrift) });
  }
  return aus;
}
/* Für den Elternbereich: wie vollständig ein Blatt gelesen ist und was prüfbar war. */
export function volllesStand(blatt, vokabeln) {
  if (!blatt) return null;
  if (!vlAktuell(blatt)) return { offen: true };
  const w = vlAuswerten(blatt.volllesen, vokabeln || []);
  if (!w) return { offen: true };
  return { voll: w.voll && !w.leer, soll: w.soll, ist: w.ist, fehlt: w.fehlt.slice(0, 8), felder: w.felder, druck: w.druck,
           mitKind: w.mitKind, pruefbar: w.pruefbar, nichtPruefbar: w.nichtPruefbar,
           fehler: w.fehler.filter((x) => x.bestaetigt === true).length,
           ungeprueft: w.fehler.filter((x) => x.bestaetigt !== true).map((x) => x.ist + " → " + x.soll + " (" + x.quelle + ")").slice(0, 10) };
}
/* Die Vokabeln der anderen Blätter desselben Fachs - je Aufruf einmal gerechnet. */
export function optFuer(blaetter, blatt) {
  return { vokabeln: blatt && blatt.volllesen ? vokabelnImFach(blaetter || [], blatt.fach, blatt.id) : [] };
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

/* Rot ist fertig (16.10.2026): Pauls Zeile trägt Rot der Lehrerin, oder eine rote
   Zeile nennt die Antwort der Vorlage. Dann hat sie es schon verbessert. */
export function rotHatAntwort(inhalt, paulZeile, vz) {
  if (paulZeile && /\bLehrkraft\b|\bLehrerin\b/i.test(String(paulZeile))) return true;
  const antw = [vz && vz.antwort, ...((vz && vz.gleich) || [])].map((a) => falten(String(a || ""))).filter((a) => a.length >= 3);
  if (!antw.length) return false;
  return (inhalt || []).map((z) => String(z || "")).filter((z) => /\bLehrkraft\b/.test(z) && !/Lehrkraft\s+schrieb\b[^,]*,\s*richtig/i.test(z))
    .some((z) => { const f = falten(z); return antw.some((a) => f.includes(a)); });
}

/* ---------- Alle Stellen eines Blattes ---------- */

function blattKurz(b) {
  /* seiten (14.10.2026): für die Vorschau und das Blättern in der Großansicht.
     gruen (Fehlerkreis, 14.10.2026): was Claude auf diesem Blatt schon verbessert
     hat - grüne Überlagerung mit "verbessert · durch Claude". */
  const o = { id: String(b.id || ""), titel: String(b.titel || "").slice(0, 80), datum: String(b.datum || ""),
              fach: String(b.fach || ""), art: ART_NAME[b.art] || "", seiten: Math.min(9, Math.max(1, Number(b.seiten) || 1)) };
  const g = gruenFuer(b);
  if (g.length) o.gruen = g;
  return o;
}

/* Mit Wahrheit - nur für den Server. */
export function stellenFuerBlatt(blatt, vorlagenDaten, opt) {
  if (!blatt || blatt.sichtbar === false) return [];
  const inhalt = Array.isArray(blatt.inhalt) ? blatt.inhalt : [];
  const aus = [];
  const bk = blattKurz(blatt);

  const schon = verbesserteSchluessel(inhalt);
  inhalt.forEach((z) => {
    const r = rechenStelle(z, blatt);
    if (r) { aus.push({ id: bk.id + ":r:" + kurz(z), art: "rechnen", blatt: bk, ...r, zeile: String(z) }); schon.add(stellenSchluessel(r)); }
  });
  const mitRot = !ROT_STILL || !!(opt && opt.mitRot);
  /* Nachrechnen (14.10.2026): Feld für Feld, nur bestätigte Fehler, keine Doppel. */
  try { aus.push(...nachrechenStellen(blatt, bk, schon, mitRot)); } catch (e) {}
  /* Volllesen (15.10.2026): Text-Stellen mit eindeutiger Quelle, alle Fächer. */
  try { aus.push(...volllesStellen(blatt, bk, (opt && opt.vokabeln) || [])); } catch (e) {}

  const vorlage = vorlageFuerBlatt(vorlagenDaten, blatt.id);
  if (vorlage) {
    const v = blattVergleichen(blatt, vorlage);
    (v && v.abweichungen || []).forEach((x) => {
      const vz = (vorlage.zeilen || []).find((q) => q.nr === x.nr);
      if (!vz || vz.unsicher || vz.frei || vz.liste) return;
      /* Rot ist fertig (16.10.2026): steht an Pauls Zeile Rot, oder hat die
         Lehrerin die Antwort der Vorlage rot hingeschrieben, bleibt es still. */
      if (!mitRot && rotHatAntwort(inhalt, zeileFinden(inhalt, vz), vz)) return;
      aus.push({ id: bk.id + ":p:" + x.nr, art: "pinnwand", blatt: bk, aufgabe: String(x.aufgabe || "").slice(0, 120),
                 du: String(x.paul || "").slice(0, 80), soll: vz.antwort, gleich: vz.gleich || [], eingabe: "text",
                 /* Beweis (14.10.2026): WO es bei der Lehrerin steht - Vorlage und Zeile. */
                 beleg: { vorlage: String(vorlage.id || ""), titel: String(vorlage.titel || "").slice(0, 80),
                          nr: vz.nr, aufgabe: String(vz.aufgabe || "").slice(0, 160) },
                 tipp: "Auf der Vorlage deiner Lehrerin steht hier etwas anderes. Lies die Aufgabe noch einmal genau und schau in deinem Heft nach.",
                 /* Pauls Zeile im Wortlaut - für die Korrektur (bleibt auf dem Server). */
                 zeile: zeileFinden(inhalt, vz) });
    });
  }

  /* Rot: EINE Karte je Blatt mit allen roten Stellen (Auftrag 14.10.2026), und
     nur für Blätter, die ab ROT_AB hochgeladen wurden - ältere hat Paul längst
     von der Lehrerin zurückbekommen und gesehen. */
  const rz = mitRot ? rotZeilen(inhalt) : [];
  if (rz.length && hochgeladenAm(blatt) >= ROT_AB) {
    aus.push({ id: bk.id + ":l:" + kurz(rz.join("\n")), art: "lehrerin", blatt: bk,
               zeilen: rz.map(rotText) });
  }
  /* Neues Foto (14.10.2026): foto = wann welche Seite ersetzt wurde - nur für
     den Server (ortFuer/fehltOrt), oeffentlich() gibt es nicht weiter. */
  if (blatt.fotoNeu && typeof blatt.fotoNeu === "object") for (const s of aus) s.foto = blatt.fotoNeu;
  return aus;
}

/* Was der Browser bekommt: ohne `soll`, ohne `gleich`, ohne Rohzeile.
   `bilder` = { <vorlage-id>: true } aus vorlagenBilderLesen(). Wird die
   Funktion über .map() gerufen, kommt dort eine Zahl an - dann ohne Bilder. */
/* `kreise` (Fehlerkreis, 14.10.2026) = kreiseLesen(): dann trägt jede Stelle
   `ort: [{s,x,y,b,h}]` in Prozent ihres Blattes (leer = noch nicht geortet)
   und der Beweis bei 📌 `beleg.ort` auf dem Bild der Lehrerin. */
export function oeffentlich(s, bilder, kreise) {
  const bi = bilder && typeof bilder === "object" && !Array.isArray(bilder) ? bilder : {};
  const kr = kreise && typeof kreise === "object" && !Array.isArray(kreise) && kreise.b ? kreise : null;
  const o = { id: s.id, art: s.art, blatt: s.blatt };
  if (kr) o.ort = ortFuer(kr, s);
  if (s.art === "lehrerin") { o.zeilen = s.zeilen; return o; }
  o.aufgabe = s.aufgabe; o.du = s.du;
  if (s.art === "pinnwand") {
    o.lehrerin = String(s.soll || "");
    if (s.beleg) {
      o.beleg = { ...s.beleg, bild: !!bi[s.beleg.vorlage] };
      const vo = kr ? vorlageOrt(kr, s.beleg.vorlage, s.beleg.nr) : null;
      if (vo) o.beleg.ort = vo;
    }
    return o;
  }
  o.tipp = s.tipp; o.eingabe = s.eingabe;
  if (s.steht) o.steht = true;
  return o;
}

export function imBestand(blatt) {
  return !!blatt && blatt.sichtbar !== false && String(blatt.datum || "") >= AB;
}

/* Fortschritt (14.10.2026, Dennys Wahl C · Fortschrittsleiste): "2 von 5 verbessert".
   Die Runde ist der heutige Tag (deutsche Zeit): gesamt = offene Stellen +
   heute erledigte Stellen im selben Bereich (Bestand oder ein Blatt).
   So stimmt die Zahl auch, wenn Paul die Ansicht schließt und wieder
   öffnet, und ab morgen fängt die Leiste wieder bei den offenen an - ein
   Kind soll nicht wochenlang "40 von 45" lesen. "Stimmt doch so" zählt als
   erledigt, die Stelle ist ja aus der Liste. */
export function berlinTag(iso) {
  const t = Date.parse(String(iso || ""));
  return isNaN(t) ? "" : TAG_BERLIN.format(new Date(t));
}
export function fortschritt(blaetter, vorlagenDaten, zustand, nurBlatt, jetzt) {
  const erl = (zustand && zustand.s) || {};
  const heute = TAG_BERLIN.format(jetzt ? new Date(jetzt) : new Date());
  let offen = 0, erledigt = 0;
  const gezaehlt = new Set(), bereich = new Set();
  for (const b of blaetter || []) {
    if (nurBlatt ? b.id !== nurBlatt : !imBestand(b)) continue;
    bereich.add(b.id);
    for (const s of stellenFuerBlatt(b, vorlagenDaten, optFuer(blaetter, b))) {
      gezaehlt.add(s.id);
      const z = erl[s.id];
      if (!z) offen++;
      else if (berlinTag(z.t) === heute) erledigt++;
    }
  }
  /* Eine verbesserte Stelle (Zeile durch Claude berichtigt) gibt es danach nicht
     mehr - heute erledigt zählt sie trotzdem mit. */
  for (const id of Object.keys(erl)) {
    if (gezaehlt.has(id) || !bereich.has(id.split(":")[0])) continue;
    const z = erl[id];
    if (z && (z.z === "verbessert" || z.z === "richtig") && berlinTag(z.t) === heute) erledigt++;
  }
  return { erledigt, gesamt: offen + erledigt };
}

export function offeneStellen(blaetter, vorlagenDaten, zustand, nurBlatt) {
  const erledigt = (zustand && zustand.s) || {};
  const aus = [];
  for (const b of blaetter || []) {
    if (nurBlatt ? b.id !== nurBlatt : !imBestand(b)) continue;
    for (const s of stellenFuerBlatt(b, vorlagenDaten, optFuer(blaetter, b))) if (!erledigt[s.id]) aus.push(s);
  }
  return aus;
}

/* ---------- Eine Verbesserung prüfen ---------- */

const GUT = {
  teiler: (n, k) => "Super, jetzt hast du alle " + k + " Teiler von " + n + " gefunden!",
  gleichung: () => "Super, du hast nachgerechnet und es selbst verbessert!",
  pinnwand: () => "Super, jetzt steht es wie bei deiner Lehrerin!",
  schreiben: () => "Super, du hast genau hingeschaut und es selbst verbessert!",
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
  if (s.art === "rechnen" && s.typ === "rest") {
    const m = /^\s*(\d{1,6})\s*(?:(?:R|Rest|r)\s*(\d{1,6}))?\s*$/.exec(a);
    if (!m) return { richtig: false, tipp: "Schreib das Ergebnis mit Rest, zum Beispiel 9 R 2." };
    const q = +m[1], r = m[2] == null ? 0 : +m[2];
    if (q === s.soll.q && r === s.soll.r) return { richtig: true, satz: GUT.gleichung() };
    return { richtig: false, tipp: "Noch nicht. " + restTipp({ a: s.g.a, b: s.g.b, q, r }) };
  }
  if (s.art === "rechnen" && s.typ === "ausdruck") {
    const m = /^\s*(\d{1,7})\s*$/.exec(a);
    if (!m) return { richtig: false, tipp: "Schreib nur die Zahl in das Feld." };
    const t = s.aus.terme.slice(); let e = s.aus.erg;
    if (s.luecke === "e") e = +m[1]; else t[s.luecke] = +m[1];
    if (nrRechnen(t, s.aus.ops) === e) return { richtig: true, satz: GUT.gleichung() };
    return { richtig: false, tipp: "Noch nicht. " + ausdruckTipp(s.aus, s.luecke, +m[1]) };
  }
  if (s.art === "rechnen" && s.typ === "liste") {
    const ist = zahlen(a);
    if (!ist.length) return { richtig: false, tipp: "Schreib die Zahlen mit Komma dazwischen." };
    if (listeGut(ist, s.n, s.liste) && ist.length >= new Set(s.ist).size) return { richtig: true, satz: GUT.gleichung() };
    return { richtig: false, tipp: "Noch nicht ganz. " + listeTipp(ist, s.n, s.liste) };
  }
  if (s.art === "rechnen" && s.typ === "gleichung") {
    const m = /^\s*(\d{1,7})\s*$/.exec(a);
    if (!m) return { richtig: false, tipp: "Schreib nur die Zahl in das Feld." };
    if (stimmt({ ...s.g, [s.luecke]: +m[1] })) return { richtig: true, satz: GUT.gleichung() };
    return { richtig: false, tipp: "Noch nicht. " + gleichungTipp(s.g, s.luecke, +m[1]) };
  }
  if (s.art === "schreiben") {
    /* Buchstabe für Buchstabe, mit Groß- und Kleinschreibung - genau das ist die Übung. */
    const ein = vlSauber(a), soll = vlSauber(s.soll);
    if (ein === soll) return { richtig: true, satz: GUT.schreiben() };
    if (ein.toLowerCase() === soll.toLowerCase()) return { richtig: false, tipp: "Fast! Schau auf den ersten Buchstaben: groß oder klein?" };
    const d = levenshtein(falten(ein), falten(soll));
    if (d > 0 && d <= 2) return { richtig: false, tipp: "Fast! " + (VL_TIPP[s.quelle] || VL_TIPP.abschrift) };
    return { richtig: false, tipp: "Noch nicht. " + s.tipp };
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
