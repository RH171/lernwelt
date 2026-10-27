/* Belegprüfung vor jeder Ausgabe an Paul - vorberechnet (27.10.2026).
   Dennys Wahl „Erklärung weg, Rest prüfen“ verlangt die Prüfung für jede
   Frage, bevor Paul sie bekommt. Live über den ganzen Vorrat kostet sie rund
   11 s Rechenzeit (gemessen 27.10.2026, 2.284 Fragen) - Cloudflare erlaubt
   im Gratistarif 10 ms je Anfrage. Deshalb rechnet werkzeuge/beleg-tabelle.mjs
   das Ergebnis vorab aus (_beleg-tabelle-paul.js), und hier wird es nur
   angewendet:
   - Frage steht in der Tabelle mit gleichem Fingerabdruck: Ergebnis der
     Tabelle (ausgeblendet oder mit ersetzter/gestrichener Erklärung).
   - Frage trägt `bp` mit gleichem Fingerabdruck: beim Erzeugen schon mit
     derselben Prüfung geprüft.
   - Sonst (unbekannt oder seit der Prüfung verändert): ausgeblendet. Im
     Speicher bleibt alles.
   Hat sich das Blatt einer Frage seit der Tabelle verändert oder ist es weg,
   wird die Frage ebenfalls ausgeblendet, bis die Tabelle neu gerechnet ist. */
import { BELEG_TABELLE } from "./_beleg-tabelle-paul.js";

const FELDER = ["frage", "antworten", "richtig", "erklaerung", "merke", "tipp", "hilfe", "blatt", "fach", "belegNr"];

function mische(h, s) {
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return Math.imul(h ^ 1, 0x01000193);
}

export function belegHash(q) {
  let h = 0x811c9dc5;
  for (const k of FELDER) {
    const v = q[k];
    if (v == null) h = mische(h, "");
    else if (typeof v === "string") h = mische(h, v);
    else if (typeof v === "number") h = mische(h, "#" + v);
    else if (Array.isArray(v) && v.every((x) => typeof x === "string")) { for (const x of v) h = mische(h, x); h = mische(h, "]"); }
    else h = mische(h, "{" + JSON.stringify(v));
  }
  return (h >>> 0).toString(36);
}

export function blattZeichen(b) {
  return [b.sichtbar !== false ? 1 : 0, b.fach || "", b.datum || "", JSON.stringify(b.inhalt || null).length].join("|");
}

export function abstempeln(q) {
  return q ? { ...q, bp: belegHash(q) } : q;
}

export function tabelleAnwenden(fragen, blattNach, tabelle = BELEG_TABELLE) {
  const geaendert = new Set();
  for (const id in tabelle.blaetter || {}) {
    const b = (blattNach || {})[id];
    if (!b || blattZeichen(b) !== tabelle.blaetter[id]) geaendert.add(id);
  }
  const raus = [];
  for (const f of fragen || []) {
    if (f.blatt && geaendert.has(f.blatt)) continue;
    const h = belegHash(f);
    const t = (tabelle.fragen || {})[f.id];
    if (t && t[0] === h) {
      if (t[1]) continue;
      if (!t[2]) { raus.push(f); continue; }
      const q = { ...f, ...(t[2].s || {}) };
      for (const k of t[2].d || []) delete q[k];
      raus.push(q);
      continue;
    }
    if (f.bp === h) raus.push(f);
  }
  return raus;
}
