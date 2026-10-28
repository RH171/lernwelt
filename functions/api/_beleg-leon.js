/* Leons Fragen vor der Ausgabe berichtigen (28.10.2026, Dennys Ja 07:34 Uhr).
   Keine Belegprüfung wie bei Paul: Nur die Fragen in _beleg-leon-tabelle.js
   (erzeugt von werkzeuge/beleg-leon.mjs) werden ausgeblendet oder bekommen
   eine berichtigte Erklärung. Alle anderen gehen unverändert durch. Im
   Speicher bleibt alles.
   - aus: immer ausgeblendet, auch wenn sich die Frage seither geändert hat.
   - Korrektur mit gleichem Fingerabdruck: wird angewendet.
   - Korrektur, deren Frage sich seither geändert hat: Erklärung weg (und was
     die Korrektur streichen sollte), statt eine alte Erklärung zu zeigen. */
import { belegHash, tabelleAnwenden } from "./_beleg-ausgabe.js";
import { BELEG_LEON } from "./_beleg-leon-tabelle.js";

export function leonKorrigieren(fragen, tabelle = BELEG_LEON) {
  const raus = [];
  for (const f of fragen || []) {
    const t = (tabelle.fragen || {})[f.id];
    if (!t) { raus.push(f); continue; }
    if (t[1]) continue;
    const d = t[2] || {};
    const q = t[0] === belegHash(f) ? { ...f, ...(d.s || {}) } : { ...f };
    if (t[0] !== belegHash(f)) delete q.erklaerung;
    for (const k of d.d || []) delete q[k];
    raus.push(q);
  }
  return raus;
}

/* Leons Ausgabe mit Belegprüfung (28.10.2026, Dennys Wahl 08:44 Uhr), Reihenfolge:
   1. Deutsch nur mit Fotofreigabe: eine Deutsch-Frage kommt nur durch, wenn sie in
      _beleg-foto-leon.js mit gleichem Fingerabdruck steht (von Claude am Foto
      geprüft). Neue, automatisch gebaute Deutsch-Fragen warten so, bis sie geprüft
      sind (gemeldet von werkzeuge/leon-blatt-waechter.mjs).
   2. Die Einzelkorrekturen von oben (leonKorrigieren).
   3. Mathe und Deutsch: Belegprüfung, vorberechnet in _beleg-tabelle-leon.js
      (werkzeuge/beleg-tabelle-leon.mjs), oder Stempel bp beim Erzeugen.
   Andere Fächer gehen unverändert durch. Im Speicher bleibt alles. */
const istGeprueft = (f) => /^(mathe|deutsch)/i.test(String(f.fach || ""));
export function leonAusgabe(fragen, blattNach, tabelle, foto, korrektur = BELEG_LEON) {
  const mitFoto = (fragen || []).filter((f) => !/^deutsch/i.test(String(f.fach || "")) || (foto[f.id] && foto[f.id][0] === belegHash(f)));
  const k = leonKorrigieren(mitFoto, korrektur);
  const nach = new Map(tabelleAnwenden(k.filter(istGeprueft), blattNach, tabelle).map((q) => [q.id, q]));
  return k.filter((f) => !istGeprueft(f) || nach.has(f.id)).map((f) => (istGeprueft(f) ? nach.get(f.id) : f));
}
