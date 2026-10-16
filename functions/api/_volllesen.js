/* Volllesen: jedes Blatt, jedes Fach, jedes Kind - Feld für Feld (15.10.2026)
 *
 * Anlass, Denny am 14.10.2026, 17:57 Uhr: „Es geht aber nicht nur um die
 * Mathe-Blätter. Es geht mir um alles, was da hochgeladen worden ist … Zukünftig
 * möchte ich, dass wirklich jedes Dokument gelesen wird zu 100 %.“ Dazu die Regel
 * vom selben Abend (arbeitsweise.md, „Vollständig lesen, prüfen, verifizieren“).
 *
 * Fach- und kindneutral, gebaut auf den Bausteinen von _nachrechnen.js:
 *   1. ABSCHREIBEN (abschreibAuftrag/abschriftLesen): Das Modell meldet je
 *      Aufgabe, wie viele Eintragsfelder es sieht (SOLL), und schreibt dann das
 *      GANZE Blatt ab: gedruckte Zeilen (druck), jedes Feld des Kindes (feld,
 *      kreuz, abschrift, zeile), Rot der Lehrkraft getrennt (| rot …), und
 *      gedruckte Prüfquellen (WOERTER, LOESUNG, VOKABEL).
 *      Der Code zählt nach (sollIst). Weicht es ab: EIN zweiter Anlauf, bleibt es
 *      ungleich: „unvollständig gelesen“ - laut, im Elternbereich und im Werkzeug.
 *   2. PRÜFEN deterministisch hier im Code, nur gegen eine EINDEUTIGE Quelle auf
 *      dem Blatt oder im Heft desselben Kindes und Fachs:
 *        woerter   Lückenwort, das einem Wort im Wörterkasten bis auf 1-2
 *                  Buchstaben gleicht (Rechtschreibung)
 *        abschrift Abschreiben einer gedruckten Vorlage: Wort für Wort
 *        loesung   gedruckte Lösung / Selbstkontrolle
 *        vokabel   gedruckte Vokabelliste (auch von einem anderen Blatt) - nur
 *                  Schreibfehler (1-2 Buchstaben), nie ein „anderes Wort“
 *      Alles andere heißt „gelesen, nicht prüfbar“ - nie raten. Mathe prüft
 *      weiter _nachrechnen.js; Pinnwand-Vorlagen weiter _lehrervorlagen.js.
 *   3. ZWEITLESUNG (gegenAuftrag/gegenLesen): jede verdächtige Stelle wird ein
 *      zweites Mal gelesen, ohne die erste Lesung und ohne das richtige Wort zu
 *      nennen. Nur wenn beide Lesungen Buchstabe für Buchstabe gleich sind, wird
 *      es eine Stelle. Sonst „ungeprüft“ - das Kind sieht es nicht.
 *
 * Fehlalarme sind schlimmer als übersehene Fehler (Kapitel 015): unsicher (#),
 * leer, rot abgehakt oder rot verbessert ist NIE eine Stelle.
 *
 * Gespeichert am Blatt (`volllesen`), im Schreibvorgang des Durchlesens oder in
 * genau einem eigenen:
 *   { v:1, am, z: [Zeilen ohne „druck“], d: <Zahl gedruckter Zeilen>,
 *     g: { <stelle>: "<Lesung 2>" }, w: <Anläufe>, u: [ein, aus], r?: true }
 * r = ohne Rechenfelder gelesen (Matheblatt, die stehen in `nachgerechnet`).
 * Die Auswertung entsteht beim Lesen neu - eine bessere Regel wirkt ohne neuen
 * Modellaufruf auch auf alte Blätter.
 */
import { falten, levenshtein } from "./_lehrervorlagen.js";

export const MODELL = "claude-opus-5-5";
export const VERSION = 1;

const FACH_NAME = { mathe: "Mathematik", deutsch: "Deutsch", hsu: "Heimat- und Sachunterricht", englisch: "Englisch",
                    franz: "Französisch", rel: "Religion/Ethik", musik: "Musik", geschichte: "Geschichte",
                    geo: "Geographie", info: "Informatik" };
const WER = { paul: "eines Kindes der 4. Klasse", leon: "eines Kindes der 2. Klasse", helena: "einer Schülerin der 7. Klasse" };

/* ---------- Der Auftrag ans Modell ---------- */

/* Die Fächer, die das Modell in der FACH-Zeile nennen darf (16.10.2026, anleitung/054):
   dieselben Schlüssel wie FAECHER_JE_KIND in _schulstoff.js (ohne „anderes“). */
const FACH_WORT = { mathe: "mathe", deutsch: "deutsch", hsu: "hsu (Heimat- und Sachunterricht: Natur, Technik, Ort, Geschichte)",
                    englisch: "englisch", franz: "franz (Französisch)", rel: "rel (Religion oder Ethik)", musik: "musik",
                    geschichte: "geschichte", geo: "geo (Geographie)", info: "info (Informatik)" };
const FAECHER_STANDARD = { paul: ["mathe", "deutsch", "hsu", "englisch", "rel", "musik"],
                           leon: ["mathe", "deutsch", "hsu", "rel", "musik"],
                           helena: ["deutsch", "mathe", "englisch", "franz", "geschichte", "geo", "info", "rel", "musik"] };

export function abschreibAuftrag(fach, kind, seitenZahl, ohneRechnen, faecher) {
  const fn = FACH_NAME[fach] ? " im Fach " + FACH_NAME[fach] : "";
  const liste = (Array.isArray(faecher) && faecher.length ? faecher : (FAECHER_STANDARD[kind] || FAECHER_STANDARD.paul))
    .filter((k) => FACH_WORT[k]).map((k) => FACH_WORT[k]).join(", ");
  return (seitenZahl > 1 ? "Das sind " + seitenZahl + " Fotos (Seiten) von einem Blatt" : "Das ist ein Foto von einem Blatt") +
    fn + " " + (WER[kind] || WER.paul) + ". Schreibe das GANZE Blatt ab – Seite für Seite, Aufgabe für Aufgabe, Zeile für " +
    "Zeile, jedes Feld einzeln. NICHTS zusammenfassen, nichts auslassen, nichts verbessern.\n\n" +
    /* Fach mitlesen (16.10.2026): Scheitert das erste Durchlesen, war das hier bisher die einzige
       Lesung - und das Fach blieb ungeprüft (Pauls „Abschreiben und Trennungsregeln“ unter Mathe). */
    "GANZ ZUERST eine Zeile\nFACH | <Schulfach>\nwelches Schulfach das Blatt nach seinem INHALT ist – genau eines dieser " +
    "Wörter: " + liste + ". Das Fach oben hat das Kind angetippt, es kann falsch sein: entscheide nur nach dem, was auf dem " +
    "Blatt steht. Bist du nicht sicher: FACH | unklar\n\n" +
    "DANN zählen: je Aufgabe eine Zeile\nSOLL | <Nr> | <Anzahl Eintragsfelder>\n" +
    "Nr = die Nummer auf dem Blatt (1, 2a, 3 …). Abschnitte ohne Nummer von oben nach unten A, B, C …; eine Heftseite ohne " +
    "Aufgaben ist A. Eintragsfeld = jede Stelle, an der das Kind etwas eintragen soll oder eingetragen hat: Lücke, " +
    "Antwortzeile, Tabellenfeld, jedes Kästchen zum Ankreuzen oder Ankreisen, jede Zuordnungslinie, jede selbst geschriebene " +
    "Zeile im Heft. Eine Tabelle: Zeilen x Spalten der Eintragsfelder, z. B. SOLL | 2 | 3x4. JEDE Nr, die unten eine " +
    "feld-, kreuz-, abschrift-, berichtigung- oder zeile-Zeile hat, braucht ihre SOLL-Zeile (auch A, B, Rand); druck-Zeilen zählen nicht.\n\n" +
    "DANN das Blatt in seiner Reihenfolge, je Zeile des Blattes eine Zeile:\n" +
    "<Nr> | druck | <gedruckter Text wörtlich>   – Überschrift, Arbeitsauftrag, Lesetext, Beispiel: JEDE gedruckte Zeile. Zählt nicht im SOLL.\n" +
    "<Nr> | feld | <Vorgabe> | [<Eintrag des Kindes>]   – Lücke, Antwort, Tabellenfeld. Vorgabe = der gedruckte Text am Feld, " +
    "die Lücke als ___ (z. B. Der ___ bellt.). Mehrere Lücken in einem Satz: je Lücke eine Zeile, Vorgabe mit (1), (2).\n" +
    "<Nr> | kreuz | <Möglichkeit> | [x]  oder  [ ]   – jedes Kästchen/jede Möglichkeit eine Zeile.\n" +
    "<Nr> | abschrift | <gedruckte Vorlage wörtlich> | [<Abschrift des Kindes wörtlich>]   – NUR wenn das Kind einen Text " +
    "unverändert abschreibt, der auf DIESEM Blatt gedruckt steht; je Satz eine Zeile.\n" +
    "<Nr> | berichtigung | <gedruckte Vorlage wörtlich> | [<was das Kind geschrieben hat>]   – statt abschrift, wenn das " +
    "Kind die Vorlage VERBESSERN oder umformen soll: Auftrag wie „Schreibe richtig ab“, „Achte auf Groß- und Kleinschreibung“, " +
    "„Trenne die Wörter“, „Finde die Fehler“, oder die Vorlage ist absichtlich klein oder falsch geschrieben. Zählt im SOLL.\n" +
    "<Nr> | zeile | [<was das Kind selbst geschrieben hat>]   – eigene Sätze, Heftzeilen, Notizen, Rand (Nr Rand).\n" +
    "Prüfquellen, NUR wenn sie GEDRUCKT auf dem Blatt stehen (nie, was das Kind geschrieben hat):\n" +
    "WOERTER | <Nr> | <Wort>; <Wort>; …   – Wörterkasten, vorgegebene Wörter zum Einsetzen\n" +
    "LOESUNG | <Nr> | <Vorgabe des Feldes> | <Lösung>   – gedruckte Lösung, Lösungswort, Selbstkontrolle\n" +
    "VOKABEL | <deutsch> | <fremdsprachig>   – gedruckte Vokabelliste, je Paar eine Zeile\n\n" +
    "Regeln:\n" +
    "- In [ ] steht GENAU, was das Kind geschrieben hat: Buchstabe für Buchstabe, mit seinen Fehlern und seiner Groß- und " +
    "Kleinschreibung. Verbessere NICHTS, ergänze nichts, rechne nichts nach.\n" +
    "- Ein Wort, das du nicht sicher lesen kannst: # statt des Wortes. Ganz unlesbar: [#]. Leeres Feld: [ ].\n" +
    "- Was das Kind durchgestrichen hat, lässt du weg; in [ ] steht, was gilt.\n" +
    "- ROT schreibt nur die Lehrkraft. Hat sie etwas geändert: hinten „| rot [<was nach der roten Änderung dasteht>]“, " +
    "nur ein Haken: „| rot ✓“, nur als falsch markiert: „| rot ✗“. Ohne Rot nichts davon.\n" +
    "- Mehrere Fotos: vor jedem Foto eine Zeile SEITE | <1, 2, 3 …> (das wievielte Foto, nicht die gedruckte Seitenzahl).\n" +
    (ohneRechnen ? "- Reine Rechenfelder (Zahlen in Rechnungen, Rechentabellen, Zahlenmauern) sind schon abgeschrieben – lass sie " +
                   "weg, auch im SOLL. Alles andere schreibst du ab: Antwortsätze, Text, Wörter, Beschriftungen, Ankreuzen.\n" : "") +
    "Antworte NUR mit den Zeilen (erst FACH, dann alle SOLL, dann das Blatt), ohne weiteren Text.";
}

/* Zweiter, anders gebauter Zugriff: nur die verdächtigen Stellen, OHNE die
   erste Lesung und ohne das richtige Wort - nur der Ort. */
export function gegenAuftrag(fragen, seitenZahl) {
  return (seitenZahl > 1 ? "Das sind Fotos von einem Blatt eines Kindes. " : "Das ist ein Foto von einem Blatt eines Kindes. ") +
    "Schau dir nur die folgenden Stellen an. Lies jeweils GENAU ab, was das Kind (mit Stift oder Bleistift, nicht gedruckt, " +
    "nicht rot) dort geschrieben hat – Buchstabe für Buchstabe, mit Groß- und Kleinschreibung, auch wenn es falsch ist. " +
    "Verbessere nichts.\n\n" +
    fragen.map((f, i) => "Stelle " + (i + 1) + ": " + f.text).join("\n") +
    "\n\nAntworte NUR mit einer Zeile je Stelle, genau so:\nStelle 1 | [<genau abgelesen>]\n" +
    "Kannst du es nicht sicher lesen: Stelle 1 | ?";
}

/* ---------- Lesen der Abschrift ---------- */

const ARTEN = ["feld", "kreuz", "abschrift", "berichtigung", "zeile"];

function klammer(s) {
  const m = /^\s*\[([^\]]*)\]\s*$/.exec(String(s || ""));
  if (!m) return null;
  const t = m[1].replace(/\s+/g, " ").trim();
  if (!t) return { leer: true, text: "" };
  if (t === "#") return { unsicher: true, text: t };
  return { text: t, unsicher: t.includes("#") };
}
function rotLesen(teile) {
  const r = teile.join("|");
  const m = /\brot\s*(.*)$/i.exec(r);
  if (!m) return null;
  const t = m[1].trim();
  if (/^✓|^\[?\s*✓/.test(t)) return { haken: true };
  if (/^✗|^x$|^\[?\s*✗/i.test(t)) return { kreuz: true };
  const k = klammer((t.match(/\[[^\]]*\]/) || [""])[0]);
  return k ? { text: k.text, leer: !!k.leer } : { unklar: true };
}

/* Eine Zeile -> { typ: soll|seite|druck|feld|quelle, … } oder null. */
export function zeileLesen(z0) {
  const z = String(z0 || "").replace(/^[-*•]\s*/, "").trim();
  if (!z || /^keine\.?$/i.test(z)) return null;
  const s = /^SOLL\s*\|\s*(?:Aufgabe\s*)?([^|]+?)\s*\|\s*(\d{1,3})\s*(?:[x×*]\s*(\d{1,3}))?\s*$/i.exec(z);
  if (s) return { typ: "soll", nr: s[1].replace(/\s+/g, ""), n: s[3] ? +s[2] * +s[3] : +s[2] };
  const fa = /^FACH\s*\|\s*(.{0,60})$/i.exec(z);
  if (fa) return { typ: "fach", text: fa[1].trim() };
  const se = /^SEITE\s*\|\s*(\d{1,2})\s*$/i.exec(z);
  if (se) return { typ: "seite", n: +se[1] };
  const t = z.split("|").map((x) => x.trim());
  if (/^W(OE|Ö)RTER$/i.test(t[0]) && t.length >= 3)
    return { typ: "quelle", q: "woerter", nr: t[1].replace(/\s+/g, ""), woerter: t.slice(2).join("|").split(/\s*[;,]\s*/).map((w) => w.trim()).filter(Boolean) };
  if (/^L(OE|Ö)SUNG$/i.test(t[0]) && t.length >= 4)
    return { typ: "quelle", q: "loesung", nr: t[1].replace(/\s+/g, ""), vorgabe: t[2], loesung: t.slice(3).join("|").trim() };
  if (/^VOKABEL$/i.test(t[0]) && t.length >= 3)
    return { typ: "quelle", q: "vokabel", de: t[1], fremd: t.slice(2).join("|").trim() };
  if (t.length < 3) return null;
  const nr = t[0].replace(/^Aufgabe\s*/i, "").replace(/\s+/g, "");
  const art = t[1].toLowerCase();
  if (!nr || nr.length > 12) return null;
  if (art === "druck") return { typ: "druck", nr, text: t.slice(2).join("|").trim() };
  if (!ARTEN.includes(art)) return null;
  /* Das Feld des Kindes ist die erste [ ]-Spalte nach der Art. */
  let ki = -1;
  for (let i = 2; i < t.length; i++) if (/^\[[^\]]*\]$/.test(t[i]) && !/^rot\b/i.test(t[i])) { ki = i; break; }
  if (ki < 0) return { typ: "feld", art, nr, kaputt: true, roh: z.slice(0, 240) };
  const k = klammer(t[ki]);
  const f = { typ: "feld", art, nr, vorgabe: t.slice(2, ki).join(" | ").trim(), kind: k, roh: z.slice(0, 240) };
  const rot = rotLesen(t.slice(ki + 1));
  if (rot) f.rot = rot;
  if (art === "kreuz") f.kind = { ...k, x: /^[x✓✗×]$/i.test(k.text || "") };
  return f;
}

/* Die ganze Antwort -> { soll, felder, quellen, zeilen (ohne druck), druck: n } */
export function abschriftLesen(text) {
  const soll = {}, felder = [], quellen = [], zeilen = [];
  let druck = 0, seite = 1, fotos = 0, fach = "";
  for (const z0 of String(text || "").split("\n")) {
    const x = zeileLesen(z0);
    if (!x) continue;
    const z = String(z0).replace(/^[-*•]\s*/, "").trim().slice(0, 240);
    if (x.typ === "fach") { if (!fach) { fach = x.text; zeilen.push(z); } continue; }
    if (x.typ === "soll") { soll[x.nr] = (soll[x.nr] || 0) + x.n; zeilen.push(z); continue; }
    /* Das wievielte Foto - auch wenn das Modell die gedruckte Seitenzahl schreibt. */
    if (x.typ === "seite") { seite = ++fotos; zeilen.push(z); continue; }
    if (x.typ === "druck") { druck++; continue; }
    if (x.typ === "quelle") { quellen.push(x); zeilen.push(z); continue; }
    x.seite = seite;
    felder.push(x);
    zeilen.push(z);
  }
  return { soll, felder, quellen, zeilen, druck, fach };
}

/* Was das Volllesen als Fach gelesen hat (Rohtext der FACH-Zeile, "" ohne). Alte Abschriften
   vor dem 16.10.2026 haben keine FACH-Zeile. */
export function fachGelesen(v) {
  if (!v || !Array.isArray(v.z)) return "";
  for (const z of v.z) { const x = zeileLesen(z); if (x && x.typ === "fach") return x.text; }
  return "";
}

/* Soll gegen Ist: je Aufgabe so viele Feldzeilen, wie gemeldet. */
export function sollIst(ab) {
  const ist = {};
  for (const f of ab.felder) ist[f.nr] = (ist[f.nr] || 0) + 1;
  const fehlt = [];
  let s = 0, i = 0;
  for (const nr of Object.keys(ab.soll)) {
    s += ab.soll[nr];
    i += Math.min(ab.soll[nr], ist[nr] || 0);
    if ((ist[nr] || 0) !== ab.soll[nr]) fehlt.push(nr + ": " + (ist[nr] || 0) + " von " + ab.soll[nr]);
  }
  for (const nr of Object.keys(ist)) if (!(nr in ab.soll)) fehlt.push(nr + ": " + ist[nr] + " ohne SOLL");
  /* Ein Blatt ohne ein einziges Feld und ohne SOLL ist kein „vollständig gelesen“,
     wenn das Modell nichts geliefert hat - das prüft der Aufrufer über `leer`. */
  return { voll: !fehlt.length, soll: s, ist: i, fehlt };
}

/* ---------- Prüfen (deterministisch) ---------- */

const RAND = /^[\s"'„“”‚‘’.,;:!?()«»…\-–—]+|[\s"'„“”‚‘’.,;:!?()«»…\-–—]+$/g;
export const sauber = (w) => String(w || "").replace(RAND, "");
/* Groß/klein nur bei Buchstaben, deren Handschrift-Formen sich klar unterscheiden
   (bei c, k, o, p, s, u, v, w, x, z sieht ein großes oft wie ein kleines aus). */
const KLAR_GROSS = new Set("ABDEFGHLNQRTÄ".split(""));
function grossKlein(ist, soll) {
  if (!ist || !soll || ist === soll || ist.toLowerCase() !== soll.toLowerCase()) return false;
  if (ist.slice(1) !== soll.slice(1)) return false;
  const a = ist[0], b = soll[0];
  return KLAR_GROSS.has(a.toUpperCase()) && a !== b && a.length === 1 && soll.length >= 3;
}
/* Trennstriche sind nie ein Fehler (16.10.2026): „wahr-nehmen“ am Zeilenende oder in einer
   Trennübung ist dasselbe Wort wie „wahrnehmen“. */
export const ohneTrennung = (w) => String(w || "").replace(/(\p{L})[-–­](?=\p{L})/gu, "$1");
/* Ein Schreibfehler, keine anderes Wort: 1 Buchstabe ab 4, 2 ab 7 Buchstaben. */
function schreibfehler(ist, soll) {
  const a = falten(ohneTrennung(sauber(ist))), b = falten(ohneTrennung(sauber(soll)));
  if (!a || !b || a === b) return false;
  const d = levenshtein(a, b);
  const n = Math.max(a.length, b.length);
  return (d === 1 && n >= 4) || (d === 2 && n >= 7);
}
const nurWort = (s) => /^[\p{L}'’\-]+$/u.test(sauber(s)) && sauber(s).length <= 30;
/* Vorgabe ohne Lücke und Klammern - für den Vergleich mit Vokabel und Lösung. */
const vorgabeKern = (s) => falten(String(s || "").replace(/_{2,}|\(\d\)|\([^)]*\)|\.{3,}|…/g, " ").replace(RAND, ""));

/* quellen = [aus diesem Blatt], vokabeln = [{de, fremd}] aus Blättern desselben
   Kindes und Fachs (nur gedruckte VOKABEL-Zeilen). Gibt Kandidaten: verdächtige
   Stellen mit Quelle, ist (Kind) und soll (richtig) - noch ohne Zweitlesung. */
/* Umformung: siehe kandidaten(). Liefert die Feldgruppen, deren Kastenwörter nur Wortmaterial sind. */
function umformungsGruppen(ab, woerter) {
  /* Umformung statt Einsetzen (15.10.2026, Fehlalarm „Impfung“ → „impfen“ bei Pauls Nomen aus Verben):
     Trägt das Kind in einer Aufgabe meist KEIN Kastenwort wörtlich ein, ist der Kasten Wortmaterial
     zum Umformen, keine Prüfquelle. Ab 4 ausgefüllten Wortfeldern ohne Rotstift, weniger als die Hälfte wörtlich. */
  /* Je Aufgabe UND Feldart (gleiche Vorgabe, z. B. „-ung die ___“ neben „___ -ung“): eine Spalte mit Umformung
     neben einer Spalte zum Abschreiben der Kastenwörter (gemessen bei Pauls Blatt: 18 Verben wörtlich, 18 Nomen). */
  const gruppe = (f) => f.nr + "|" + String(f.vorgabe || "").replace(/_+/g, "_").replace(/\s+/g, " ").trim();
  const umformung = new Set();
  const gruppen = {};
  for (const f of ab.felder) {
    if (!woerter[f.nr] || f.art !== "feld" || !f.kind || f.kind.leer || f.kind.unsicher || f.rot || !nurWort(sauber(f.kind.text))) continue;
    (gruppen[gruppe(f)] = gruppen[gruppe(f)] || []).push(f);
  }
  for (const [gk, fs] of Object.entries(gruppen)) {
    const wk = new Set(woerter[fs[0].nr].map(falten));
    const treffer = fs.filter((f) => wk.has(falten(sauber(f.kind.text)))).length;
    if (fs.length >= 4 && treffer * 2 < fs.length) umformung.add(gk);
  }
  return { gruppe, umformung };
}
/* Berichtigungsaufgaben (16.10.2026, Pauls „Abschreiben und Trennungsregeln“): Die Vorlage ist
   absichtlich klein oder falsch geschrieben, das Kind soll sie VERBESSERT abschreiben. Dann ist die
   Vorlage keine Prüfquelle - wer „Ein Regenbogen“ statt „ein regenbogen“ schreibt, hat es richtig
   gemacht. Neue Abschriften tragen dafür die Art `berichtigung`; für alte (und falls das Modell doch
   `abschrift` schreibt) erkennt das hier eine Aufgabe (Nr) an drei Zeichen:
     1. eine Vorlagenzeile beginnt mit einem kleinen Buchstaben (gedruckte Sätze beginnen groß),
     2. das Kind schreibt mindestens 2 Wörter groß, die die Vorlage klein hat,
     3. mindestens 3 Wörter weichen um 1-2 Buchstaben ab (ein Fehlertext; wer nur abschreibt,
        trifft so oft nicht daneben - und Fehlalarme sind schlimmer als übersehene Fehler).
   Gibt die Nummern zurück; alle Abschrift-Stellen dieser Nummern bleiben still. */
const ERSTER_BUCHSTABE = /\p{L}/u;
export function berichtigungsAufgaben(ab) {
  const nr = new Set(), gross = {}, nah = {};
  for (const f of ab.felder) {
    if (f.art === "berichtigung") { nr.add(f.nr); continue; }
    if (f.art !== "abschrift" || f.kaputt) continue;
    const m = ERSTER_BUCHSTABE.exec(String(f.vorgabe || ""));
    if (m && m[0] === m[0].toLowerCase() && m[0] !== m[0].toUpperCase()) nr.add(f.nr);
    if (!f.kind || f.kind.leer || f.kind.unsicher) continue;
    for (const x of abschriftVergleich(f.vorgabe, f.kind.text, { roh: true })) {
      if (x.gross && x.ist[0] !== x.ist[0].toLowerCase() && x.soll[0] === x.soll[0].toLowerCase()) gross[f.nr] = (gross[f.nr] || 0) + 1;
      else if (!x.gross) nah[f.nr] = (nah[f.nr] || 0) + 1;
    }
  }
  for (const k of Object.keys(gross)) if (gross[k] >= 2) nr.add(k);
  for (const k of Object.keys(nah)) if (nah[k] >= 3) nr.add(k);
  return nr;
}
export function kandidaten(ab, vokabeln) {
  const aus = [];
  const berichtigung = berichtigungsAufgaben(ab);
  const woerter = {}, loesung = [];
  for (const q of ab.quellen) {
    if (q.q === "woerter") (woerter[q.nr] = woerter[q.nr] || []).push(...q.woerter.map(sauber).filter(Boolean));
    if (q.q === "loesung") loesung.push(q);
  }
  const vok = (vokabeln || []).concat(ab.quellen.filter((q) => q.q === "vokabel"));
  const dazu = (f, quelle, ist, soll, frage, extra) => aus.push({ fid: f.nr + "|" + quelle + "|" + ist + "|" + soll, nr: f.nr, quelle, ist, soll,
                                                                  vorgabe: f.vorgabe, frage, seite: f.seite, roh: f.roh, ...(extra || {}) });
  const { gruppe, umformung } = umformungsGruppen(ab, woerter);
  const ortText = (f) => (f.nr && !/^[A-Z]$/.test(f.nr) ? "Aufgabe " + f.nr : "Abschnitt " + f.nr) + (f.seite > 1 ? " auf Seite " + f.seite : "");
  for (const f of ab.felder) {
    if (f.kaputt || !f.kind || f.kind.leer || f.kind.unsicher) continue;
    /* Die Lehrkraft hat es schon gesehen - auch ein rotes ✗ (16.10.2026, „Rot ist fertig“, anleitung/123). */
    if (f.rot && (f.rot.haken || f.rot.kreuz || f.rot.text != null || f.rot.unklar)) continue;
    const ist = sauber(f.kind.text);
    if (f.art === "feld") {
      /* 1. gedruckte Lösung */
      const l = loesung.find((q) => q.nr === f.nr && vorgabeKern(q.vorgabe) && vorgabeKern(q.vorgabe) === vorgabeKern(f.vorgabe));
      if (l && ist.length <= 40 && sauber(l.loesung).length <= 40) {
        if (falten(ist) !== falten(sauber(l.loesung)))
          dazu(f, "loesung", ist, sauber(l.loesung), ortText(f) + ", das Feld bei „" + f.vorgabe + "“: was hat das Kind eingetragen?");
        continue;
      }
      /* 2. Wörterkasten derselben Aufgabe */
      const wk = umformung.has(gruppe(f)) ? null : woerter[f.nr];
      if (wk && wk.length && nurWort(ist)) {
        if (wk.includes(ist)) continue;
        const gk = wk.filter((w) => grossKlein(ist, w));
        if (gk.length === 1 && !wk.some((w) => falten(w) === falten(ist) && w === ist)) {
          dazu(f, "woerter", ist, gk[0], ortText(f) + ", das Wort in der Lücke bei „" + f.vorgabe + "“", { gross: true });
          continue;
        }
        if (wk.some((w) => falten(w) === falten(ist))) continue;
        const nah = wk.filter((w) => schreibfehler(ist, w));
        const d = (w) => levenshtein(falten(ist), falten(w));
        if (nah.length && nah.filter((w) => d(w) === Math.min(...nah.map(d))).length === 1) {
          const soll = nah.sort((a, b) => d(a) - d(b))[0];
          /* Nicht, wenn das Kind ein ANDERES Kastenwort fast getroffen hat - dann ist unklar, welches gemeint war. */
          dazu(f, "woerter", ist, soll, ortText(f) + ", das Wort in der Lücke bei „" + f.vorgabe + "“");
        }
        continue;
      }
      /* 3. Vokabelliste (gedruckt) */
      const kern = vorgabeKern(f.vorgabe);
      if (kern && ist.split(/\s+/).length <= 4) {
        const passt = vok.filter((v) => vorgabeKern(v.de) === kern).map((v) => sauber(v.fremd))
          .concat(vok.filter((v) => vorgabeKern(v.fremd) === kern).map((v) => sauber(v.de)));
        if (passt.length) {
          if (passt.some((p) => falten(p) === falten(ist))) continue;
          const nah = passt.filter((p) => schreibfehler(ist, p));
          if (nah.length === 1 && new Set(passt.map(falten)).size === 1)
            dazu(f, "vokabel", ist, nah[0], ortText(f) + ", das Feld bei „" + f.vorgabe + "“: was hat das Kind eingetragen?");
        }
      }
      continue;
    }
    if (f.art === "abschrift" && !berichtigung.has(f.nr)) {
      for (const x of abschriftVergleich(f.vorgabe, f.kind.text)) {
        dazu(f, "abschrift", x.ist, x.soll, ortText(f) + ", in der Abschrift des Kindes von „" + kurzSatz(f.vorgabe) + "“: " +
             (x.vor || x.nach ? "das Wort " + (x.vor ? "nach „" + x.vor + "“" : "") + (x.vor && x.nach ? " und " : "") +
                                (x.nach ? "vor „" + x.nach + "“" : "") : "das " + (x.i + 1) + ". Wort"), x.gross ? { gross: true } : {});
      }
    }
  }
  /* Doppel (dieselbe Stelle zweimal gemeldet) zusammenlegen. */
  const ids = new Set();
  return aus.filter((k) => !ids.has(k.fid) && ids.add(k.fid)).slice(0, 25);
}
const kurzSatz = (s) => { const w = String(s || "").split(/\s+/); return w.length > 8 ? w.slice(0, 6).join(" ") + " …" : String(s || ""); };

/* Wort für Wort: gleiche Wörter (ohne Satzzeichen) verankern, dazwischen gleich
   lange Lücken paarweise vergleichen. Fehlende und zusätzliche Wörter werden NIE
   gemeldet (kann eine Lesefalle sein), nur ein Wort, das 1-2 Buchstaben von der
   Vorlage abweicht, oder ein klarer Groß-/Kleinbuchstabe. */
export function abschriftVergleich(vorlage, kind, opt) {
  /* Trennstriche zählen nicht (16.10.2026): verglichen wird ohne sie, gemeldet das Wort des Kindes. */
  const A = String(vorlage || "").split(/\s+/).map(sauber).filter(Boolean).map(ohneTrennung);
  const B0 = String(kind || "").split(/\s+/).map(sauber).filter(Boolean);
  const B = B0.map(ohneTrennung);
  if (!A.length || !B.length || A.length > 120 || B.length > 120 || B.some((w) => w.includes("#"))) return [];
  const n = A.length, m = B.length;
  const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const paare = [];
  let i = 0, j = 0, gi = [], gj = [];
  const luecke = () => {
    if (gi.length && gi.length === gj.length) gi.forEach((a, k) => paare.push([a, gj[k]]));
    gi = []; gj = [];
  };
  while (i < n && j < m) {
    if (A[i] === B[j]) { luecke(); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) { gi.push(i); i++; }
    else { gj.push(j); j++; }
  }
  while (i < n) gi.push(i++);
  while (j < m) gj.push(j++);
  luecke();
  const aus = [];
  for (const [a, b] of paare) {
    const soll = A[a], ist = B[b];
    /* roh (für berichtigungsAufgaben): jede Groß-/Klein-Abweichung zählt, nicht nur die klar lesbaren. */
    const gross = opt && opt.roh ? (ist !== soll && ist.toLowerCase() === soll.toLowerCase()) : grossKlein(ist, soll);
    if (!gross && !schreibfehler(ist, soll)) continue;
    aus.push({ i: b, ist: B0[b], soll, gross, vor: b > 0 ? B0[b - 1] : "", nach: b + 1 < m ? B0[b + 1] : "" });
  }
  return aus;
}

/* ---------- Auswerten (ohne Modell, aus dem Gespeicherten) ---------- */

export function stelleId(k) { return k.fid; }

export function auswerten(v, vokabeln) {
  if (!v || !Array.isArray(v.z)) return null;
  const ab = abschriftLesen(v.z.join("\n"));
  const si = sollIst(ab);
  const g = v.g || {};
  const kand = kandidaten(ab, vokabeln);
  let fehler = kand.map((k) => ({ ...k, bestaetigt: g[k.fid] == null ? null : g[k.fid] === k.ist }));
  /* Verrutschte Zweitlesung (15.10.2026, gemessen bei Pauls Nomen aus Verben: Stelle n bekam das Wort von
     Stelle n+1): Liest die Zweitlesung an mindestens 2 Stellen das Wort einer ANDEREN Stelle, gilt keine
     Bestätigung dieser Lesung - lieber übersehen als falsch melden. */
  const fremd = kand.filter((k) => g[k.fid] != null && g[k.fid] !== k.ist && kand.some((j) => j !== k && j.ist === g[k.fid])).length;
  const verrutscht = fremd >= 2;
  if (verrutscht) fehler = fehler.map((x) => ({ ...x, bestaetigt: x.bestaetigt === true ? null : x.bestaetigt, verrutscht: true }));
  /* Prüfbar = ein Kindfeld, für das es eine Quelle gibt (oder abschrift); der Rest
     ist „gelesen, nicht prüfbar“. Leere Felder zählen nicht mit. */
  let mitKind = 0, pruefbar = 0;
  const quellNr = new Set(ab.quellen.filter((q) => q.nr).map((q) => q.nr));
  const wo = {};
  for (const q of ab.quellen) if (q.q === "woerter") (wo[q.nr] = wo[q.nr] || []).push(...q.woerter.map(sauber).filter(Boolean));
  const ug = umformungsGruppen(ab, wo);
  const vokKeys = new Set((vokabeln || []).concat(ab.quellen.filter((q) => q.q === "vokabel")).flatMap((q) => [vorgabeKern(q.de), vorgabeKern(q.fremd)]));
  for (const f of ab.felder) {
    if (!f.kind || f.kind.leer) continue;
    mitKind++;
    if (f.art === "abschrift" || (quellNr.has(f.nr) && !ug.umformung.has(ug.gruppe(f))) || (f.art === "feld" && vokKeys.has(vorgabeKern(f.vorgabe)))) pruefbar++;
  }
  return { ...si, felder: ab.felder.length, druck: Number(v.d) || 0, mitKind, pruefbar, nichtPruefbar: mitKind - pruefbar,
           kaputt: ab.felder.filter((f) => f.kaputt).length, fehler, leer: !ab.felder.length && !Object.keys(ab.soll).length && !(v.r && Number(v.d) > 0), verrutscht,
           abgebrochen: !!v.f };
}

export function gegenFragen(ab, vokabeln, schon) {
  return kandidaten(ab, vokabeln).filter((k) => !(schon && k.fid in schon)).map((k) => ({ id: k.fid, text: k.frage }));
}

export function gegenLesen(text, fragen) {
  const aus = {};
  for (const z0 of String(text || "").split("\n")) {
    const m = /^\s*[-*]?\s*Stelle\s*(\d{1,3})\s*\|\s*(.*)$/i.exec(z0);
    if (!m) continue;
    const f = fragen[+m[1] - 1];
    if (!f) continue;
    const rest = m[2].trim();
    const k = klammer((rest.match(/\[[^\]]*\]/) || [""])[0]);
    aus[f.id] = !k || k.leer || k.unsicher || /^\?/.test(rest) ? "?" : sauber(k.text);
  }
  return aus;
}

/* Ist das Gespeicherte noch gültig? Ein neues Foto macht es alt. */
export function aktuell(blatt) {
  const v = blatt && blatt.volllesen;
  if (!v || v.v !== VERSION || !Array.isArray(v.z) || typeof v.am !== "string" || v.offen) return false;
  const foto = blatt.fotoNeu && typeof blatt.fotoNeu === "object" ? Object.values(blatt.fotoNeu) : [];
  if (typeof blatt.seiteNeu === "string") foto.push(blatt.seiteNeu);
  return !foto.some((t) => typeof t === "string" && t > v.am);
}
export function brauchtVolllesen(blatt) {
  return !!blatt && blatt.sichtbar !== false && !aktuell(blatt);
}
/* Was beim Nachholen weiterverwendet wird: nur eine halbe Lesung (`offen`) desselben Fotos. */
export function fortsetzbar(blatt) {
  const v = blatt && blatt.volllesen;
  if (!v || !v.offen || v.v !== VERSION || !Array.isArray(v.z)) return null;
  const foto = blatt.fotoNeu && typeof blatt.fotoNeu === "object" ? Object.values(blatt.fotoNeu) : [];
  if (typeof blatt.seiteNeu === "string") foto.push(blatt.seiteNeu);
  return foto.some((t) => typeof t === "string" && t > v.am) ? null : { ...v, offen: undefined };
}

/* Gedruckte Vokabeln aller Blätter eines Fachs (für die Prüfquelle „vokabel“). */
export function vokabelnImFach(blaetter, fach, ausser) {
  const aus = [];
  for (const b of blaetter || []) {
    if (!b || b.fach !== fach || b.id === ausser || b.sichtbar === false || !b.volllesen || !Array.isArray(b.volllesen.z)) continue;
    for (const z of b.volllesen.z) { const x = zeileLesen(z); if (x && x.typ === "quelle" && x.q === "vokabel") aus.push({ de: x.de, fremd: x.fremd }); }
  }
  return aus;
}

/* ---------- Modellaufrufe ---------- */

async function frage(key, bilder, text, opt) {
  const o = opt || {};
  const abbruch = typeof AbortController !== "undefined" ? new AbortController() : null;
  const uhr = abbruch ? setTimeout(() => abbruch.abort(), o.grenze || 120000) : null;
  try {
    const r = await (o.fetch || fetch)("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: abbruch ? abbruch.signal : undefined,
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODELL,
        /* Opus 5.5 denkt von selbst, Denk-Tokens zählen in max_tokens (Kapitel 029/030);
           kein erzwungenes tool_choice. */
        max_tokens: o.max || 16000,
        thinking: { type: "adaptive" },
        output_config: { effort: o.effort || "low" },
        messages: [{ role: "user", content: bilder.map((b) => ({ type: "image", source: {
            type: "base64", media_type: (/^data:([^;]+);/.exec(b) || [])[1] || "image/jpeg", data: b.slice(b.indexOf(",") + 1) } }))
          .concat([{ type: "text", text }]) }],
      }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j) return { fehler: "HTTP " + r.status, usage: j && j.usage };
    if (j.stop_reason === "max_tokens") return { fehler: "max_tokens", usage: j.usage };
    return { text: (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join(""), usage: j.usage };
  } catch (e) {
    return { fehler: String(e && e.name || e) };
  } finally { if (uhr) clearTimeout(uhr); }
}

/* Ein Blatt ganz lesen: Abschrift, Zählung, Zweitlesung der Verdächtigen.
   bilder = data:-URLs (eine je Seite, höchstens 4). Wirft nie.
   opt: { fach, kind, faecher, ohneRechnen, vokabeln, grenze, fetch, jetzt }
   vorher = schon gespeicherte Abschrift: dann nur nachholen, was fehlt.
   Gibt { ok, volllesen, usage, aufrufe, roh } oder { ok:false, fehler }. */
export async function volllesen(key, bilder, opt, vorher) {
  const o = opt || {};
  const liste = (Array.isArray(bilder) ? bilder : [bilder]).slice(0, 4).map(String);
  const usage = { ein: 0, aus: 0 };
  const plus = (u) => { if (u) { usage.ein += u.input_tokens || 0; usage.aus += u.output_tokens || 0; } };
  let aufrufe = 0, roh = "";
  let zeilen = vorher && Array.isArray(vorher.z) ? vorher.z : null, druck = vorher ? Number(vorher.d) || 0 : 0;
  const g = { ...((vorher && vorher.g) || {}) };
  let versuche = (vorher && vorher.w) || 0;
  /* frist (Zeitpunkt in ms): Reicht die Zeit für einen Schritt nicht mehr (Leitungsgrenze,
     Kapitel 021), wird er ausgelassen und das Ergebnis als `offen` gespeichert - der
     nächste Aufruf holt ihn mit `vorher` nach, ohne neu abzuschreiben. */
  const zeitDa = (ms) => !o.frist || Date.now() + ms < o.frist;
  let offen = false;
  const auftrag = abschreibAuftrag(o.fach, o.kind, liste.length, !!o.ohneRechnen, o.faecher);
  if (!zeilen) {
    const r1 = await frage(key, liste, auftrag, o);
    aufrufe++; plus(r1.usage);
    if (r1.fehler) return { ok: false, fehler: r1.fehler, usage, aufrufe };
    roh = r1.text;
    const ab = abschriftLesen(r1.text);
    zeilen = ab.zeilen; druck = ab.druck; versuche = 1;
  }
  let ab = abschriftLesen(zeilen.join("\n"));
  let si = sollIst(ab);
  if (!si.voll && versuche < 2 && o.zweiterAnlauf !== false && !zeitDa(60000)) offen = true;
  else if (!si.voll && versuche < 2 && o.zweiterAnlauf !== false) {
    const hinweis = "\n\nACHTUNG: Ein erster Durchgang hat sich verzählt (" + si.fehlt.slice(0, 8).join("; ") +
      "). Zähle die Eintragsfelder jeder Aufgabe noch einmal genau und schreibe JEDES Feld ab – SOLL und Feldzeilen müssen übereinstimmen.";
    const r1b = await frage(key, liste, auftrag + hinweis, { ...o, effort: "medium", max: 24000 });
    aufrufe++; plus(r1b.usage); versuche = 2;
    if (!r1b.fehler) {
      const ab2 = abschriftLesen(r1b.text), si2 = sollIst(ab2);
      if (si2.voll || (si2.soll && si2.ist / si2.soll > (si.soll ? si.ist / si.soll : 0))) {
        zeilen = ab2.zeilen; druck = ab2.druck; ab = ab2; si = si2; roh = r1b.text;
        for (const k of Object.keys(g)) delete g[k];
      }
    }
  }
  const fragen = gegenFragen(ab, o.vokabeln, g);
  if (fragen.length && !zeitDa(25000)) offen = true;
  else if (fragen.length) {
    const r2 = await frage(key, liste, gegenAuftrag(fragen, liste.length), { ...o, max: 6000 });
    aufrufe++; plus(r2.usage);
    if (r2.fehler) return { ok: false, fehler: "Gegenlesen: " + r2.fehler, usage, aufrufe };
    Object.assign(g, gegenLesen(r2.text, fragen));
    for (const f of fragen) if (!(f.id in g)) g[f.id] = "?";
  }
  const am = o.jetzt || new Date().toISOString();
  const alt = (vorher && vorher.u) || [0, 0];
  return { ok: true, aufrufe, usage, roh,
           volllesen: { v: VERSION, am: vorher && vorher.am && !roh ? vorher.am : am, z: zeilen.slice(0, 500), d: druck, g, w: versuche,
                        u: [alt[0] + usage.ein, alt[1] + usage.aus], ...(o.ohneRechnen ? { r: true } : {}), ...(offen ? { offen: 1 } : {}) } };
}

/* Opus 5.5: 4 $ je Mio. Eingabe, 20 $ je Mio. Ausgabe (Anthropic-Preisliste 09/2026). */
export function kostenEuro(usage, eurJeUsd) {
  if (!usage) return 0;
  return ((usage.ein || 0) * 4e-6 + (usage.aus || 0) * 20e-6) * (eurJeUsd || 0.86);
}
