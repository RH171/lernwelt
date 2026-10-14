/* Woher stammt eine Zeile aus dem Heft? (13.10.2026)
 *
 * Anlass, Denny am 13.10.2026, 20:44 Uhr: Paul bekam im Lernquiz unter der
 * richtigen Antwort "Bürgermeisteramt" den Kasten
 *   "📖 SO STEHT ES IN DEINEM HEFT: Klasse 4 besucht den Bürgermeister:
 *    Kind schrieb Bürgeramt, richtig: Bürgermeisteramt"
 * Auf dem Blatt steht aber nur Pauls "Bürgeramt", ohne jede rote Korrektur.
 * Das "richtig: …" hat der Lesehelfer beim Einlesen selbst geschrieben.
 * Zweites Beispiel (20:55 Uhr): "Haustürschlüssel in der Stadt verloren:
 * Fundamt" ist Pauls eigene Eintragung - die Lehrerin hat sie nie bestätigt.
 *
 * Dennys Wahl: "A · Kennzeichnen statt behaupten". Die Fragen bleiben, der
 * Kasten sagt ehrlich, woher die Zeile kommt:
 *
 *   lehrerin     ✍ rote Korrektur oder Anmerkung der Lehrerin ("Lehrkraft")
 *   nachgesehen  🔎 eigenes Urteil des Lesehelfers ("Kind schrieb X, richtig: Y",
 *                "(richtig: …)", "gedruckt, richtig: …", "Lehrkraft schrieb X,
 *                richtig: Y" - dort hat der Lesehelfer sogar die Lehrerin
 *                nachgerechnet)
 *   eingetragen  ✏️ was das Kind selbst eingetragen hat, unbestätigt
 *   heft         📖 reiner Inhalt des Blattes
 *   verbessert   ✅ Paul hat es im Heft verbessert, Claude hat die Zeile
 *                berichtigt (Marke "(✓ verbessert · durch Claude)", _korrektur.js,
 *                14.10.2026). Eine alte Seite kennt das Wort nicht -> Heft.
 *
 * Alles wird aus dem vorhandenen Text abgeleitet - kein neues Lesen, kein
 * Schreibvorgang im Speicher. Neue Blätter tragen seit 13.10.2026 zusätzlich
 * "Kind: …" vor unbestätigten Eintragungen (Leseauftrag in schulstoff.js).
 *
 * Prüfen ohne Server: node pruefe-herkunft.mjs
 */

const HAND = /^✍\s*/;
/* Dieselbe Marke wie in _fehlerkreis.js (MARKE_RE) - hier ohne Import, damit
   diese Datei für sich allein läuft. */
const VERBESSERT = /\s*\(✓ verbessert · durch Claude\)/;

/* "richtig: Y" als Urteil - nicht "Färbe richtig ein" oder "Pirat richtig". */
const URTEIL = /\brichtig(?: ist)?:\s*\S/i;

/* Verben, mit denen der Lesehelfer beschreibt, was das Kind getan hat. */
const KIND_VERB = "schrieb|trug|kreuzte|markierte|rechnete|ergänzte|ergaenzte|füllte|fuellte|" +
  "baute|nummerierte|kreiste|ließ|liess|strich|bei";
const KIND_AM_ANFANG = new RegExp("^(?:Kind|Kind:)(?:\\s+(?:" + KIND_VERB + ")(?=[\\s:]|$)|:)", "i");
const KIND_IRGENDWO = new RegExp("(?:^|[:;(,]\\s*)Kind\\s+(?:" + KIND_VERB + ")(?=[\\s:]|$)", "i");

/* Ein Blatt, auf dem das Kind Antworten zuordnet oder einträgt. Erkennbar
 * an einer Zeile "<Situation>: Kind schrieb …" oder an einem Auftrag zum
 * Zuordnen/Ausfüllen. Auf so einem Blatt ist eine Zeile
 * "<Situation aus mehreren Wörtern>: <eine kurze Antwort>" die Eintragung
 * des Kindes, nicht Heftstoff - genau das Muster auf dem Ämter-Blatt. */
export function istAusfuellblatt(inhalt) {
  const z = (inhalt || []).map((x) => String(x || "").replace(HAND, ""));
  return z.some((x) => /^[^:]{8,}:\s*Kind\s+schrieb\b/i.test(x)) ||
         z.some((x) => /^(?:Auftrag|Arbeitsauftrag|Aufgabe)\s*:.*\b(?:zuordn|ordne|verbind|ausfüll|ausfuell|eintrag|trage? .* ein|ergänz|ankreuz)/i.test(x));
}

function situationAntwort(z) {
  /* Genau EIN Doppelpunkt, davor mindestens drei Wörter, danach eine
     Antwort ohne Komma und Aufzählung, höchstens vier Wörter. */
  const teile = z.split(":");
  if (teile.length !== 2) return false;
  const kopf = teile[0].trim(), wert = teile[1].trim();
  if (/^(?:Auftrag|Arbeitsauftrag|Aufgabe|Thema|Titel|Merke|Lehrkraft)\b/i.test(kopf)) return false;
  if (kopf.split(/\s+/).length < 2) return false;
  if (!wert || /[,;]/.test(wert)) return false;
  return wert.split(/\s+/).length <= 4;
}

/* Die Herkunft einer Zeile. `inhalt` (das ganze Blatt) braucht es nur für
 * das Ausfüllblatt-Muster; ohne bleibt die Zeile dann "heft". */
export function zeileHerkunft(zeile, inhalt) {
  const roh = String(zeile || "");
  const z = roh.replace(HAND, "").trim();
  if (!z) return "heft";
  if (VERBESSERT.test(z)) return "verbessert";
  /* Der Lesehelfer rechnet die Lehrerin nach - das Urteil ist seines. */
  if (/Lehrkraft\s+schrieb\b[^,]*,\s*richtig/i.test(z)) return "nachgesehen";
  if (/\bLehrkraft\b|\bLehrerin\b/i.test(z)) return "lehrerin";
  if (URTEIL.test(z)) return "nachgesehen";
  if (/^Kind\s*:/i.test(z) || /[–;(]\s*Kind\s*:/.test(z) || KIND_AM_ANFANG.test(z) || KIND_IRGENDWO.test(z)) return "eingetragen";
  if (inhalt && situationAntwort(z) && istAusfuellblatt(inhalt)) return "eingetragen";
  return "heft";
}

/* Hat die Lehrerin ALLE Aufgaben abgehakt? ("Lehrkraft: Haken bei allen
 * Aufgaben") - dann sind die Eintragungen des Kindes bestätigt. */
export function allesAbgehakt(inhalt) {
  return (inhalt || []).some((x) => /Lehrkraft[^\n]*(?:Haken|\u2713)[^\n]*\b(?:bei|an|unter)\s+allen\b/i.test(String(x || "")));
}

/* Hat die Lehrerin etwas verbessert - oder nur abgehakt/angemerkt? */
export function lehrerinVerbessert(zeile) {
  return /verbess|korrig|richtig|durchgestrichen|ergänzt|ergaenzt|statt|Kind schrieb|rot|✗|falsch/i.test(String(zeile || ""));
}

const VERBEN = "schrieb|trug|kreuzte|markierte|rechnete|ergänzte|ergaenzte|füllte|fuellte|baute|nummerierte|kreiste|ließ|liess|strich";
const DU_VERB = {
  schrieb: "hast … geschrieben", trug: "hast … eingetragen", kreuzte: "hast … angekreuzt",
  markierte: "hast … markiert", rechnete: "hast … gerechnet", "ergänzte": "hast … ergänzt",
  ergaenzte: "hast … ergänzt", "füllte": "hast … ausgefüllt", fuellte: "hast … ausgefüllt",
  baute: "hast … aufgebaut", nummerierte: "hast … nummeriert", kreiste: "hast … eingekreist",
  "ließ": "hast … ausgelassen", liess: "hast … ausgelassen", strich: "hast … durchgestrichen",
};

/* Die Zeile so, wie ein Kind sie lesen soll: kein "Kind schrieb", kein
 * Heftzitat für ein Urteil des Lesehelfers. */
export function zeileKindgerecht(zeile) {
  let z = String(zeile || "").replace(HAND, "").trim();
  /* Von Claude berichtigt: die Zeile steht so in Pauls Heft - die Marke sagt der Kasten. */
  if (VERBESSERT.test(z)) return z.replace(VERBESSERT, "").trim();
  /* "Kind schrieb X, richtig: Y" -> "Du hast „X“ geschrieben. Richtig ist „Y“."
     X gierig bis zum LETZTEN ", richtig:" - X kann selbst Kommas tragen
     ("36: 1, 6, 6"). Eine Klammer am Ende von Y ("räuberische (Fuchs)")
     bleibt als Anmerkung draussen. */
  z = z.replace(new RegExp("(\\(?)\\bKind\\s+(" + VERBEN + ")(?=[\\s:]):?\\s+((?:(?!,\\s*Lehr).)+?)" +
                           "(,\\s*Lehr[^,]*)?,\\s*richtig(?: ist)?:\\s*([^;]+?)(\\s*;.*)?$", "i"),
    (m, auf, verb, x, mitte, y, rest) => {
      if (auf && /\)\s*$/.test(y)) y = y.replace(/\)\s*$/, "");
      let anm = "";
      const k = y.match(/^(.*?\S)\s*(\([^()]*\))\s*$/);
      if (k) { y = k[1]; anm = " " + k[2]; }
      x = x.trim().replace(/\s+(?:an|aus|ein|nach)$/i, "");
      const [a, b] = (DU_VERB[verb.toLowerCase()] || "hast … geschrieben").split(" … ");
      return (auf ? "– " : "") + "Du " + a + " „" + x + "“ " + b +
             (mitte ? ", " + mitte.replace(/^,\s*/, "") : "") + ". Richtig ist „" +
             y.trim().replace(/[.]$/, "") + "“." + anm + (rest ? " –" + rest.replace(/^\s*;/, "") : "");
    });
  /* "Lehrkraft schrieb X, richtig: Y" -> nachgerechnet */
  z = z.replace(/\bLehrkraft\s+schrieb\s+([^,]+?),\s*richtig:\s*(.+)$/i,
    (m, x, y) => "Auf dem Blatt steht „" + x.trim() + "“. Nachgerechnet ist es „" + y.trim() + "“.");
  /* "345 gedruckt, richtig: 235" -> Druckfehler */
  z = z.replace(/(\S+)\s+gedruckt,\s*richtig:\s*(.+)$/i,
    (m, x, y) => x + " – so ist es gedruckt. Richtig ist „" + y.trim() + "“.");
  /* "(richtig: böse)" und ein übrig gebliebenes "richtig: Y" */
  z = z.replace(/\(richtig:\s*([^)]+)\)/gi, "(richtig ist „$1“)");
  z = z.replace(/,\s*richtig:\s*([^;]+?)\s*(?:;\s*(.*))?$/i, (m, y, r) => ". Richtig ist „" + y + "“." + (r ? " – " + r : ""));
  /* Übrige "Kind <verb> …" in du-Form, nur am Zeilen- oder Teilanfang.
     "schrieb/trug" mit schlichtem Rest -> "Du hast „…“ geschrieben"; alles
     andere (Satzreste mit "durch", zweitem Verb …) schlicht im Präteritum
     ("Du strichst too often durch, schriebst es aber …"), damit kein Satz
     zerbricht. */
  z = z.replace(new RegExp("(^|[:;(]\\s*|,\\s*)Kind\\s+(" + VERBEN + ")(?=[\\s:]|$)(:?)\\s*((?:(?!,\\s*Lehr)[^;()])*)", "gi"),
    (m, vor, verb, dp, rest) => {
      const v = verb.toLowerCase();
      const r = rest.trim().replace(/[.]$/, "");
      const du = vor && vor.trim() ? "du " : "Du ";
      const schlicht = !/,\s*(?:\p{Ll}+te|schrieb|strich|trug|ließ)\b|\s(?:durch|an|aus|ein|nach)$/u.test(r);
      if (v === "schrieb" && schlicht) {
        const [a, b] = DU_VERB[v].split(" … ");
        return vor + du + a + (r ? " „" + r + "“" : "") + " " + b;
      }
      const praet = (w) => w === "ließ" || w === "liess" ? "ließt" : w + "st";
      const r2 = r.replace(new RegExp(",\\s*(" + VERBEN + ")(?=\\s)", "gi"), (x, w) => ", " + praet(w.toLowerCase()));
      return vor + du + praet(v) + (r2 ? (dp ? ": " : " ") + r2 : "");
    });
  z = z.replace(/(^|[:;(]\s*)Kind hat\b/g, (m, vor) => vor + (vor.trim() ? "du hast" : "Du hast"));
  z = z.replace(/([–;(]\s*)Kind\s*:\s*/g, "$1dein Eintrag: ");
  z = z.replace(/^Kind bei ([^:]+):/i, "Bei $1 hast du eingetragen:");
  z = z.replace(/^Kind\s*:\s*/i, "");
  z = z.replace(/\bLehrkraft\b/g, "Lehrerin");
  return z;
}

/* Gleichwertige Namen - beide Antworten sind richtig. Bewusst klein und
 * nur mit Paaren, die im Bestand vorkamen (13.10.2026: Pauls Ämter-Blatt
 * schreibt "Fundbüro" und "Fundamt" für dasselbe). */
export const GLEICHWERTIG = [
  ["Fundbüro", "Fundamt"],
];
const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
export function gleichwertigeVon(wort) {
  const n = norm(wort);
  for (const g of GLEICHWERTIG) if (g.some((x) => norm(x) === n)) return g.filter((x) => norm(x) !== n);
  return [];
}
/* Indizes von Antworten, die gleichwertig zur richtigen sind. */
export function auchRichtig(antworten, richtig) {
  const r = (antworten || [])[richtig || 0];
  const gl = new Set(gleichwertigeVon(r).map(norm));
  const raus = [];
  (antworten || []).forEach((a, i) => { if (i !== (richtig || 0) && gl.has(norm(a))) raus.push(i); });
  return raus;
}

function alsWort(text, wort) {
  const w = String(wort || "").trim();
  if (w.length < 4) return false;
  const esc = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("(^|[^\\p{L}\\p{N}])" + esc + "($|[^\\p{L}\\p{N}])", "iu").test(String(text || ""));
}

/* Ein ANDERES Blatt desselben Fachs, auf dem die richtige Antwort als
 * Heftstoff steht (nicht als Kindeintrag, nicht als Urteil). Nur wenn das
 * Wort wörtlich dasteht - sonst lieber kein zweites Blatt. Gleichwertige
 * Namen zählen, dann wird das gesagt. */
export function anderesBlatt(antwort, blatt, alle, fachGleich) {
  if (!blatt || !alle || !antwort) return null;
  const woerter = [String(antwort)].concat(gleichwertigeVon(antwort));
  const gleich = fachGleich || ((a, b) => String(a || "") === String(b || ""));
  const kandidaten = Object.values(alle).filter((x) => x && x.id !== blatt.id &&
    x.sichtbar !== false && Array.isArray(x.inhalt) && gleich(x.fach, blatt.fach));
  /* Am nächsten am Datum zuerst. */
  const t = Date.parse(blatt.datum || "") || 0;
  kandidaten.sort((a, b) => Math.abs((Date.parse(a.datum || "") || 0) - t) - Math.abs((Date.parse(b.datum || "") || 0) - t));
  for (const x of kandidaten) {
    for (const z of x.inhalt) {
      const h = zeileHerkunft(z, x.inhalt);
      if (h !== "heft" && h !== "lehrerin") continue;
      const wort = woerter.find((w) => alsWort(z, w));
      if (!wort) continue;
      return { blatt: String(x.id), titel: String(x.titel || "").slice(0, 80), datum: String(x.datum || ""),
               zeile: zeileKindgerecht(z).slice(0, 200),
               ...(norm(wort) !== norm(antwort) ? { gleichwertig: String(wort) } : {}) };
    }
  }
  return null;
}

/* Die Marke für den Bauauftrag des Quiz-Modells: damit es in Erklärungen
 * nie "deine Lehrerin" oder "in deinem Heft steht" für ein eigenes Urteil
 * oder eine unbestätigte Eintragung schreibt. */
export function markeFuerModell(zeile, inhalt) {
  const h = zeileHerkunft(zeile, inhalt);
  return h === "verbessert" ? "[vom Kind im Heft verbessert, von Claude berichtigt, KEINE Korrektur der Lehrerin] "
       : h === "nachgesehen" ? "[nachgesehen vom Lesehelfer, KEINE Korrektur der Lehrerin] "
       : h === "eingetragen" ? "[vom Kind eingetragen, von der Lehrerin nicht bestätigt] "
       : h === "lehrerin" ? "[rot von der Lehrerin] " : "";
}
