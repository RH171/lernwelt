/* Fundkarten, die bei der Ausgabe ausgeblendet werden (28.10.2026).
 *
 * Anlass: Helenas Blatt i64xdavjvr ("Zahlen auf Französisch", 01.10.2026)
 * trug die Fundkarte "Wie schreibt man 39 auf Französisch?" mit "trente-dix"
 * als richtiger Antwort. Das ist falsch. Berichtigt werden durfte sie nur,
 * wenn "trente-neuf" auf dem Heftfoto steht. Am Foto geprüft (alle 3 Seiten,
 * 28.10.2026): Dort steht nur Helenas "trentte-neuf" mit rotem Haken-Kreuz,
 * keine rote Lösung der Lehrerin. Also wird die Karte ausgeblendet.
 *
 * Der Speicher bleibt unberührt: Die Karte fällt nur beim Lesen über
 * stoffLesen() weg, also überall, wo Kinder sie sehen (Ablage, Such-Spiel,
 * Lernquiz, Kreise). Schreibwege lesen den Speicher roh und behalten sie.
 */
const AUSBLENDEN = [
  { kind: "helena", blatt: "i64xdavjvr", stichwort: "39", richtig: "trente-dix" },
];

function norm(s) { return String(s == null ? "" : s).toLowerCase().trim(); }

export function kartenAusblenden(kind, eintraege) {
  const regeln = AUSBLENDEN.filter((r) => r.kind === kind);
  if (!regeln.length || !Array.isArray(eintraege)) return eintraege;
  return eintraege.map((e) => {
    const r = e && Array.isArray(e.karten) ? regeln.filter((x) => x.blatt === e.id) : [];
    if (!r.length) return e;
    const karten = e.karten.filter((k) => !r.some((x) =>
      norm(k && k.richtig) === norm(x.richtig) &&
      (norm(k && k.stichwort) === norm(x.stichwort) || String((k && k.frage) || "").includes(x.stichwort))));
    return karten.length === e.karten.length ? e : Object.assign({}, e, { karten });
  });
}
