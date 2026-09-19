// GET /api/anwesend?tage=7   -> wer war an welchen Viertelstunden da?
//
// Nur mit Elternausweis. Die Antwort nennt Kindernamen und Uhrzeiten - das ist
// genau die Art Angabe, die nach der Regel "Namen nur nach Login" niemals offen
// im Netz stehen darf. /api/aktiv bleibt davon unberuehrt: Dessen GET sagt
// weiterhin nur "frei ja/nein" und keinen Namen.
//
// Denny am 19.09.2026: "haettest Du in Zukunft die Moeglichkeit das besser zu
// loggen" - nachdem ich auf "War Helena nicht ein einziges Mal da?" ehrlich
// nur sagen konnte, dass ich es nicht weiss.
//
// Was hier NICHT herauskommt: Lernzeit. Dagesessen ist nicht gelernt. Diese
// Antwort sagt ausschliesslich, ob jemand da war - dafuer aber verlaesslich,
// auch bei kurzen Besuchen und beim Quiz-Duell, die beide in /api/statistik
// fehlen.

import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { monateLesen, monatTag, monateFuer, letzteTage, blockUhrzeit, KINDER } from "./_anwesend.js";

const TAGE_MAX = 45;          // so weit reicht die Haltbarkeit der Baender
const TAGE_STANDARD = 7;

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  const geheim = geheimFuer(env, "eltern");
  if (!geheim || !(await ausweisGueltig(request, geheim, env)))
    return json(401, { ok: false, fehler: "Nicht angemeldet." });

  const url = new URL(request.url);
  // Achtung: Number(null) ist 0 und damit endlich - ein fehlender Parameter
  // haette hier auf 1 Tag gedeckelt statt auf den Standardwert. Darum wird der
  // Rohwert geprueft, nicht sein Zahlenwert (Pruefrunde 01).
  const roh = url.searchParams.get("tage");
  const gewuenscht = roh === null || roh === "" ? NaN : Number(roh);
  const tage = Number.isFinite(gewuenscht)
    ? Math.min(TAGE_MAX, Math.max(1, Math.trunc(gewuenscht)))
    : TAGE_STANDARD;

  const jetzt = Date.now();
  const liste = letzteTage(tage, jetzt);
  const kinder = {};

  const monate = monateFuer(liste);
  for (const kind of KINDER) {
    const tageRaus = [];
    let zuletzt = null;
    // Alle Monate dieses Kindes auf einmal - nicht jeden Tag einzeln. 14 Tage
    // kosteten vorher 85 Abfragen und knapp zehn Sekunden (Pruefrunde 02).
    const gelesen = await monateLesen(env, kind, monate);
    let unsicher = gelesen.unsicher;
    for (const tag of liste) {
      const band = monatTag(gelesen, tag);
      // Hat der Speicher fuer einen Tag nicht geantwortet, darf "nichts
      // gefunden" nicht als "war nicht da" durchgehen. Der Elternbereich sagt
      // das dann auch so - eine falsche Auskunft waere hier schlimmer als gar
      // keine (Pruefrunde 01).
      if (band.unsicher) unsicher = true;
      const alle = [...new Set(band.lernwelt.concat(band.duell))].sort((a, b) => a - b);
      if (!alle.length) continue;
      tageRaus.push({
        tag,
        lernwelt: band.lernwelt,
        duell: band.duell,
        viertelstunden: alle.length,
        // Erster und letzter Zeitpunkt des Tages. Das ist eine SPANNE, keine
        // durchgehende Anwesenheit: Wer um 2:30 und um 10:00 da war, steht hier
        // mit "2:30 bis 10:15". Damit das niemand als siebeneinhalb Stunden
        // liest, wird die Zahl der Viertelstunden immer mitgenannt und bei
        // Luecken ausdruecklich markiert (Pruefrunde 01).
        von: blockUhrzeit(alle[0]),
        // Das Ende ist der SCHLUSS der letzten Viertelstunde, nicht ihr Anfang -
        // sonst stuende bei 8:00 bis 8:15 nur "8:00 bis 8:00". Block 96 ist
        // dabei erlaubt und heisst 24:00.
        bis: blockUhrzeit(alle[alle.length - 1] + 1),
        // Zusammenhaengend heisst: keine Luecke zwischen erstem und letztem Block.
        amStueck: alle.length === alle[alle.length - 1] - alle[0] + 1,
        nurDuell: band.lernwelt.length === 0,
      });
      // Die Liste kommt von heute rueckwaerts, der erste Treffer ist also der
      // juengste Tag mit Anwesenheit.
      if (!zuletzt) zuletzt = { tag, uhrzeit: blockUhrzeit(alle[alle.length - 1]) };
    }
    kinder[kind] = { zuletzt, tage: tageRaus, unsicher };
  }

  return json(200, { ok: true, heute: liste[0], tage: liste, kinder });
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
