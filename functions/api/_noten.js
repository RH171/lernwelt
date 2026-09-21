/* Noten der Kinder - Speicher und Rechnung.
 *
 * Denny am 21.09.2026: "Beim Lernstand sollen auch bitte noch der aktuelle
 * Notenschluessel der Faecher zu sehen sein" - und zur Rechnung: "Eins finde
 * ich richtig", also nach der Gymnasialschulordnung.
 *
 * WIE GERECHNET WIRD, und warum nicht einfach "mal zwei":
 *
 * GSO Art. 28 (gesetze-bayern.de, geprueft 21.09.2026): In Faechern MIT
 * Schulaufgaben wird die Jahresfortgangsnote aus zwei Gesamtnoten gebildet -
 * eine fuer die grossen, eine fuer die kleinen Leistungsnachweise.
 *   - bei zwei Schulaufgaben stehen sie "grundsaetzlich im Verhaeltnis 1:1"
 *   - bei mehr als zwei "grundsaetzlich im Verhaeltnis 2:1"
 * In Faechern OHNE Schulaufgaben zaehlen nur die kleinen.
 *
 * Eine Schulaufgabe ist also NICHT "zwei kleine Noten wert": Bei zwei
 * Schulaufgaben wiegen die beiden zusammen so viel wie ALLE kleinen zusammen.
 * Wer das als Faktor 2 rechnet, zeigt einen Schnitt, der am Zeugnis nicht
 * ankommt.
 *
 * Bei Paul ist es einfach, und das steht schwarz auf weiss im Schreiben der
 * Viertklasslehrkraefte: "Jede schriftliche Probe wird einfach gewertet."
 * Deshalb hat jedes Kind seine eigene Regel - siehe RECHNUNG.
 */

const SCHLUESSEL = (kind) => "noten:" + kind;
const MAX = 400;

/* Wie viele GROSSE Leistungsnachweise ein Fach im Schuljahr hat. Das
   entscheidet ueber das Verhaeltnis der beiden Toepfe (GSO Art. 28) - und zwar
   von Anfang an, nicht erst, wenn alle geschrieben sind. Ohne diese Zahl haette
   Helena nach ihrer ersten Schulaufgabe ein 1:1 gesehen, obwohl in ihren
   Faechern 2:1 gilt.

   Quelle: "Festlegungen gemaess GSO: Zahl der grossen Leistungsnachweise ...
   (KMS vom 18.06.26)", Stand 19.09.2026, Jahrgangsstufe 7 - liegt als Scan in
   unterlagen/. Deutsch 3, Englisch 3 + 1 Projekt-Schulaufgabe, Mathematik 4,
   Franzoesisch 3 + 1 muendliche. */
export const SCHULAUFGABEN = {
  helena: { deutsch: 3, englisch: 4, mathematik: 4, franzoesisch: 4 },
};

export const RECHNUNG = {
  // Grundschule: alles einfach, ein Topf.
  paul:   { schulaufgaben: false, quelle: "Schreiben der Viertklasslehrkräfte" },
  leon:   { schulaufgaben: false, quelle: "Grundschule – Noten erst ab dem 2. Halbjahr" },
  // Gymnasium: zwei Toepfe nach GSO Art. 28.
  helena: { schulaufgaben: true,  quelle: "GSO Art. 28" },
};

export async function notenLesen(env, kind) {
  try {
    const roh = await env.PAUL_KV.get(SCHLUESSEL(kind));
    const d = roh ? JSON.parse(roh) : null;
    return Array.isArray(d && d.noten) ? d.noten : [];
  } catch (e) {
    // Ein Speicherfehler ist KEINE leere Notenliste - das waere dieselbe
    // Verwechslung wie beim Anwesenheitsband ("nichts gefunden" heisst nicht
    // "war nicht da"). Der Aufrufer bekommt null und sagt es weiter.
    return null;
  }
}

export async function notenSchreiben(env, kind, noten) {
  await env.PAUL_KV.put(SCHLUESSEL(kind), JSON.stringify({ noten: noten.slice(-MAX) }));
}

export function neueId() {
  const z = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (const b of crypto.getRandomValues(new Uint8Array(8))) s += z[b % z.length];
  return s;
}

/* Eine Note aufraeumen, bevor sie in den Speicher geht. Was hier nicht
   durchkommt, steht spaeter auch nicht in der Auswertung. */
export function notePruefen(roh) {
  const n = {};
  n.fach = String(roh.fach || "").toLowerCase().slice(0, 30).trim();
  if (!n.fach) return { fehler: "Zu welchem Fach gehört die Note?" };

  if (roh.note !== undefined && roh.note !== null && roh.note !== "") {
    const w = Number(String(roh.note).replace(",", "."));
    if (!Number.isFinite(w) || w < 1 || w > 6) return { fehler: "Eine Note geht von 1 bis 6." };
    // Halbe Noten sind erlaubt, Viertel nicht.
    n.note = Math.round(w * 2) / 2;
  }
  n.punkte = String(roh.punkte || "").slice(0, 20).trim() || undefined;
  if (n.note === undefined && !n.punkte) return { fehler: "Ohne Note und ohne Punkte kann ich nichts festhalten." };

  n.anlass = String(roh.anlass || "").slice(0, 120).trim() || "Leistungsnachweis";
  const d = String(roh.datum || "").slice(0, 10);
  n.datum = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : new Date().toISOString().slice(0, 10);
  n.art = roh.art === "gross" ? "gross" : "klein";
  n.gewicht = Number(roh.gewicht) === 2 ? 2 : 1;
  n.quelle = ["heft", "eltern", "blatt"].includes(roh.quelle) ? roh.quelle : "eltern";
  n.sicher = roh.sicher === false ? false : true;
  n.id = String(roh.id || "").replace(/[^a-z0-9]/gi, "").slice(0, 12) || neueId();
  n.angelegt = roh.angelegt || new Date().toISOString();
  return { note: n };
}

const mittel = (liste) => {
  let o = 0, u = 0;
  for (const n of liste) {
    if (typeof n.note !== "number") continue;      // reine Punktzahlen zaehlen nicht mit
    o += n.note * (n.gewicht || 1);
    u += (n.gewicht || 1);
  }
  return u ? o / u : null;
};

/* Der Schnitt je Fach - und zwar so, wie die Schule ihn bildet. */
export function fachSchnitt(kind, notenDesFachs, fach) {
  const regel = RECHNUNG[kind] || RECHNUNG.paul;
  const gross = notenDesFachs.filter((n) => n.art === "gross");
  const klein = notenDesFachs.filter((n) => n.art !== "gross");
  const sG = mittel(gross), sK = mittel(klein);

  if (!regel.schulaufgaben || !gross.length) {
    return { schnitt: mittel(notenDesFachs), gross: sG, klein: sK, verhaeltnis: null };
  }
  if (sK === null) return { schnitt: sG, gross: sG, klein: null, verhaeltnis: null };

  /* Zwei Schulaufgaben: 1:1. Mehr als zwei: 2:1 zugunsten der grossen.
     Massgeblich ist die Zahl, die das Fach im ganzen Jahr HAT - nicht die,
     die schon geschrieben ist. Sonst springt das Verhaeltnis mitten im Jahr um
     und der Schnitt macht einen Satz, den niemand erklaeren kann. */
  const soll = (SCHULAUFGABEN[kind] || {})[String(fach || "").toLowerCase()];
  const zahl = soll || gross.length;
  const zwei = zahl <= 2;
  const schnitt = zwei ? (sG + sK) / 2 : (2 * sG + sK) / 3;
  return { schnitt, gross: sG, klein: sK, verhaeltnis: zwei ? "1:1" : "2:1" };
}

/* Alles auf einmal, nach Fach sortiert - das ist, was der Elternbereich zeigt. */
export function auswertung(kind, noten) {
  const faecher = {};
  for (const n of noten) (faecher[n.fach] = faecher[n.fach] || []).push(n);
  return Object.keys(faecher).sort().map((fach) => {
    const liste = faecher[fach].slice().sort((a, b) => (a.datum < b.datum ? -1 : 1));
    return { fach, noten: liste, soll: (SCHULAUFGABEN[kind] || {})[fach] || null,
             ...fachSchnitt(kind, liste, fach) };
  });
}
