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
import { anwesendLesen, letzteTage, blockUhrzeit, BLOECKE_PRO_TAG } from "./_anwesend.js";

const KINDER = ["paul", "leon", "helena"];
const TAGE_MAX = 45;          // so weit reicht die Haltbarkeit der Baender
const TAGE_STANDARD = 7;

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  const geheim = geheimFuer(env, "eltern");
  if (!geheim || !(await ausweisGueltig(request, geheim, env)))
    return json(401, { ok: false, fehler: "Nicht angemeldet." });

  const url = new URL(request.url);
  const gewuenscht = Number(url.searchParams.get("tage"));
  const tage = Number.isFinite(gewuenscht)
    ? Math.min(TAGE_MAX, Math.max(1, Math.trunc(gewuenscht)))
    : TAGE_STANDARD;

  const jetzt = Date.now();
  const liste = letzteTage(tage, jetzt);
  const kinder = {};

  for (const kind of KINDER) {
    const tageRaus = [];
    let zuletzt = null;
    for (const tag of liste) {
      const band = await anwesendLesen(env, kind, tag);
      const alle = [...new Set(band.lernwelt.concat(band.duell))].sort((a, b) => a - b);
      if (!alle.length) continue;
      tageRaus.push({
        tag,
        lernwelt: band.lernwelt,
        duell: band.duell,
        viertelstunden: alle.length,
        von: blockUhrzeit(alle[0]),
        // Das Ende ist der SCHLUSS der letzten Viertelstunde, nicht ihr Anfang.
        // Sonst stuende bei einem Kind, das von 8:00 bis 8:15 da war,
        // "8:00 bis 8:00" - und das liest sich wie "gar nicht".
        bis: blockUhrzeit(Math.min(BLOECKE_PRO_TAG - 1, alle[alle.length - 1] + 1)),
        nurDuell: band.lernwelt.length === 0,
      });
      // Die Liste kommt von heute rueckwaerts, der erste Treffer ist also der
      // juengste Tag mit Anwesenheit.
      if (!zuletzt) zuletzt = { tag, uhrzeit: blockUhrzeit(alle[alle.length - 1]) };
    }
    kinder[kind] = { zuletzt, tage: tageRaus };
  }

  return json(200, { ok: true, heute: liste[0], tage: liste, kinder });
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
