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
  /* "mathe" und "franz" (19.10.2026): Seit Helena ihre Noten selbst eintraegt,
     kommen sie mit den Heft-Schluesseln (wie Schulheft und Probentermine,
     heftFach() in quiz.js). Die langen Namen bleiben fuer Eintraege der Eltern. */
  helena: { deutsch: 3, englisch: 4, mathematik: 4, franzoesisch: 4, mathe: 4, franz: 4 },
};

/* Art des Leistungsnachweises, wenn das Kind selbst eintraegt (19.10.2026,
   Helena): nur die Schulaufgabe ist ein GROSSER Leistungsnachweis (GSO § 28),
   alles andere ist klein. Gespeichert als lnArt, alte Eintraege haben keins. */
export const LN_ARTEN = ["schulaufgabe", "kurzarbeit", "ex", "muendlich", "test"];

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
  /* Geschrieben, Note kommt noch (15.10.2026): Paul schrieb am 09.10.2026 den
     Leseverstaendnistest, die Note fehlt noch. Er soll ihn trotzdem bei
     "Deutsch 1 von 8" mitzaehlen sehen. Ein solcher Eintrag traegt offen:true
     und KEINE Note; sobald eine Note kommt, faellt offen weg. In jedem
     Mittelwert zaehlt er nicht mit (mittel() nimmt nur Zahlen). */
  if (n.note === undefined && !n.punkte && roh.offen === true) n.offen = true;
  if (n.note === undefined && !n.punkte && !n.offen) return { fehler: "Ohne Note und ohne Punkte kann ich nichts festhalten." };

  n.anlass = String(roh.anlass || "").slice(0, 120).trim() || "Leistungsnachweis";
  const d = String(roh.datum || "").slice(0, 10);
  n.datum = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : new Date().toISOString().slice(0, 10);
  n.art = roh.art === "gross" ? "gross" : "klein";
  n.gewicht = Number(roh.gewicht) === 2 ? 2 : 1;

  /* Die zentralen Tests sind KLEINE Leistungsnachweise - auch wenn sie sich
     anfuehlen wie eine Schulaufgabe und obwohl der BET doppelt zaehlt. Denny
     am 21.09.2026: "Nicht, dass diese auch mit hinzugefuegt wird, weil derzeit
     stehen: drei Schriftliche und eine Projekt-Schulaufgabe, aber der BET
     fliesst ja auch mit ein."

     Waere er als "gross" eingetragen, haette Englisch fuenf grosse Nachweise
     statt vier - und der Schnitt waere falsch. Das steht auch im Auftrag ans
     Modell, aber eine Bitte im Auftrag ist keine Pruefung: Hier wird es
     mechanisch richtiggestellt.

     Quelle: KMS vom 18.06.2026 - "BET 7: verpflichtend am 01.10.26, doppelt
     gewichteter kleiner LN", ebenso BMT 8/10; BDT 6 einfach; Vera 8
     "verpflichtend (wird aber nie bewertet)". */
  const ZENTRAL = /\b(bet|bmt|bdt|vera)\s*-?\s*\d*\b|jahrgangsstufentest|jahrgangsstufenarbeit|englischtest|mathematiktest|deutschtest/i;
  if (ZENTRAL.test(n.anlass)) {
    n.art = "klein";
    n.zentral = true;
    // BET und BMT zaehlen doppelt, BDT einfach. Steht etwas anderes im
    // Anlass, bleibt es beim Vorgeschlagenen.
    if (/\b(bet|bmt)\b|englischtest|mathematiktest/i.test(n.anlass)) n.gewicht = 2;
    else if (/\bbdt\b|deutschtest/i.test(n.anlass)) n.gewicht = 1;
  }
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

/* ---------- Doppelte Proben (26.10.2026, Kapitel 146) ----------
 *
 * Denny am 26.10.2026 zur Zurueckbekommen-Seite: "ob Paul oder ich hochlädt
 * ist egal - muss ggf. verglichen werden, nicht dass doppelte Proben in die
 * Berechnung kommen."
 *
 * Eine Probe kann auf vier Wegen ins Notenbuch kommen: "Notenstand hochladen"
 * und "Note von Hand" im Elternbereich, Pauls/Helenas eigener Eintrag
 * (kindNote) und "Als Note übernehmen" aus der Zurueckbekommen-Liste. Jeder
 * Weg fuer sich ist sauber - zusammen zaehlt dieselbe Probe zweimal.
 *
 * GLEICH heisst: gleiches Fach (nach fachSchluessel) und gleiches Datum, und
 * nichts widerspricht sich - zwei verschiedene Noten, zwei verschiedene
 * Punktzahlen oder einmal Schulaufgabe und einmal klein sind ZWEI Proben.
 * Den freien Anlass vergleichen wir nicht: "Probe", "1. Probe Mathe" und
 * "Leistungsnachweis" meinen oft dasselbe Blatt.
 *
 * Wer bewusst zwei gleiche Proben am selben Tag eintraegt, setzt beim
 * Speichern "trotzdem" - der Eintrag traegt dann eigeneProbe:true und wird nie
 * zusammengefasst. Geloescht wird hier nichts: Die Doppelten bleiben im
 * Speicher und in der Liste, sie zaehlen nur nicht mit.
 */
const FACH_GLEICH = {
  mathematik: "mathe", franzoesisch: "franz", "französisch": "franz", frz: "franz",
  "heimat- und sachunterricht": "hsu", heimatundsachunterricht: "hsu", sachunterricht: "hsu",
  religion: "rel", "religion-kath": "rel", "religion-ev": "rel", ethik: "rel",
  geographie: "geo", erdkunde: "geo", informatik: "info", engl: "englisch", deu: "deutsch",
};
export function fachSchluessel(f) {
  const k = String(f || "").toLowerCase().trim();
  return FACH_GLEICH[k] || FACH_GLEICH[k.replace(/[^a-zäöüß-]/g, "")] || k;
}

// "34/60", "34 von 60", 34 -> 34. Ohne Zahl: undefined.
export function punktZahl(x) {
  if (typeof x === "number") return Number.isFinite(x) ? x : undefined;
  const m = String(x === undefined || x === null ? "" : x).match(/\d+(?:[.,]\d+)?/);
  return m ? Number(m[0].replace(",", ".")) : undefined;
}

const hatNote = (n) => typeof n.note === "number" && Number.isFinite(n.note);

export function gleicheProbe(a, b) {
  if (!a || !b || a === b) return false;
  if (a.eigeneProbe || b.eigeneProbe) return false;
  if (!a.datum || a.datum !== b.datum) return false;
  if (fachSchluessel(a.fach) !== fachSchluessel(b.fach)) return false;
  if (hatNote(a) && hatNote(b) && a.note !== b.note) return false;
  const pa = punktZahl(a.punkte), pb = punktZahl(b.punkte);
  if (pa !== undefined && pb !== undefined && pa !== pb) return false;
  if (a.art && b.art && a.art !== b.art) return false;
  return true;
}

/* Welcher von zwei gleichen Eintraegen zaehlt: der mit Note vor dem offenen,
   der der Eltern vor dem des Kindes, sonst der aeltere. */
function rang(n) {
  return (hatNote(n) ? 0 : 10)
       + ((n.von && n.von !== "eltern") ? 1 : 0);
}

/* Gibt eine Karte id -> id des Eintrags, der stattdessen zaehlt. */
export function doppelteFinden(noten) {
  const liste = (noten || []).slice().sort((a, b) =>
    rang(a) - rang(b) || String(a.angelegt || "").localeCompare(String(b.angelegt || "")));
  const behalten = [];
  const doppelt = {};
  for (const n of liste) {
    const vorher = behalten.find((b) => gleicheProbe(b, n));
    if (vorher) doppelt[n.id] = vorher.id;
    else behalten.push(n);
  }
  return doppelt;
}

/* Die Noten ohne die Doppelten - fuer jede Rechnung und fuer die Sicht des Kindes. */
export function ohneDoppelte(noten) {
  const d = doppelteFinden(noten);
  return (noten || []).filter((n) => !d[n.id]);
}

/* Ein NEUER Eintrag: gibt es diese Probe schon? Liefert den vorhandenen oder null. */
export function schonDa(noten, neu) {
  if (!neu || neu.eigeneProbe) return null;
  return (noten || []).find((n) => n.id !== neu.id && gleicheProbe(n, neu)) || null;
}

/* Wer hat es eingetragen - fuer die Warnung "eingetragen von ... am ...". */
export function vonWem(n, fuerKind) {
  if (!n) return "";
  if (n.von && n.von !== "eltern") return fuerKind ? "dir" : (n.von.charAt(0).toUpperCase() + n.von.slice(1));
  return fuerKind ? "Mama oder Papa" : "den Eltern";
}

/* Alles auf einmal, nach Fach sortiert - das ist, was der Elternbereich zeigt.
   Doppelte stehen mit doppeltVon in der Liste, zaehlen aber nicht im Schnitt. */
export function auswertung(kind, noten) {
  const doppelt = doppelteFinden(noten);
  const faecher = {};
  for (const n0 of noten) {
    const n = doppelt[n0.id] ? { ...n0, doppeltVon: doppelt[n0.id] } : n0;
    (faecher[n.fach] = faecher[n.fach] || []).push(n);
  }
  return Object.keys(faecher).sort().map((fach) => {
    const liste = faecher[fach].slice().sort((a, b) => (a.datum < b.datum ? -1 : 1));
    const zaehlt = liste.filter((n) => !n.doppeltVon);
    const r = { fach, noten: liste, soll: (SCHULAUFGABEN[kind] || {})[fach] || null,
                ...fachSchnitt(kind, zaehlt, fach) };
    const z = liste.length - zaehlt.length;
    if (z) r.doppelt = z;
    return r;
  });
}
