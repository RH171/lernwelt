/* Leons Fragen vor der Ausgabe berichtigen (28.10.2026, Dennys Ja 07:34 Uhr).
   Keine Belegprüfung wie bei Paul: Nur die Fragen in _beleg-leon-tabelle.js
   (erzeugt von werkzeuge/beleg-leon.mjs) werden ausgeblendet oder bekommen
   eine berichtigte Erklärung. Alle anderen gehen unverändert durch. Im
   Speicher bleibt alles.
   - aus: immer ausgeblendet, auch wenn sich die Frage seither geändert hat.
   - Korrektur mit gleichem Fingerabdruck: wird angewendet.
   - Korrektur, deren Frage sich seither geändert hat: Erklärung weg (und was
     die Korrektur streichen sollte), statt eine alte Erklärung zu zeigen. */
import { belegHash } from "./_beleg-ausgabe.js";
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
