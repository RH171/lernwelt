/* Der Schaukasten: was ein Kind heute in der Schule gemacht hat.
 *
 * Denny am 22.09.2026: "Es wird ein digitaler Schaukasten seiner täglichen
 * Schularbeiten, selektiert nach Fach. Hier baust du im Hintergrund eine
 * Datenbank auf. Daraus können wir dann arbeiten und alles Mögliche bauen."
 *
 * Und vorher, am selben Tag: "Lass doch das Spiel erst mal weg - es geht
 * doch erst mal darum, dass Paul seine Daten hochladen kann."
 *
 * Deshalb macht dieser Weg NICHTS ausser aufbewahren. Kein Modell, kein
 * Geld, keine 90 Sekunden Warten: Foto rein, in zwei Sekunden fertig. Was
 * daraus gebaut wird - Übungen, Quiz, Prüfungsvorbereitung - kommt später
 * und liest aus demselben Bestand.
 *
 *   POST   /api/schulstoff         legt einen Eintrag ab   {fach, datum, notiz, seiten[]}
 *   GET    /api/schulstoff         liest den Bestand       ?monate=3
 *   GET    /api/schulstoff?bild=<id>:<nr>   ein Bild
 *   PATCH  /api/schulstoff         verstecken/zeigen/weg   {id, was}
 *
 * Der Ausweis des Kindes reicht - es ist sein eigenes Heft. Der Eltern-Code
 * kommt überall hinein.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import {
  FAECHER, kindOk, datumOk, heuteBerlin, blattDatum,
  stoffAblegen, stoffLesen, stoffBild, stoffAendern, titelSetzen,
} from "./_schulstoff.js";

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

// Bis hierher darf ein Bild gehen. Ein Handyfoto kommt verkleinert an
// (strom.js bringt es auf 1800 px, rund 280 KB) - 2 MB sind reichlich Luft.
const MAX_BILD = 2 * 1024 * 1024;
const MAX_SEITEN = 6;

async function darfRein(request, env, kind) {
  if (geheimFuer(env, "eltern") && (await ausweisGueltig(request, geheimFuer(env, "eltern"), env))) return true;
  const g = geheimFuer(env, kind);
  return !!g && (await ausweisGueltig(request, g, env));
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let d;
  try { d = await request.json(); } catch (e) { return json(400, { ok: false, fehler: "Die Anfrage war kein gültiges JSON." }); }

  const kind = String(d.kind || "").toLowerCase();
  if (!kindOk(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });

  const seiten = (Array.isArray(d.seiten) ? d.seiten : []).slice(0, MAX_SEITEN);
  if (!seiten.length) return json(400, { ok: false, fehler: "Da war kein Bild dabei." });
  for (const s of seiten) {
    if (typeof s !== "string" || !s.startsWith("data:")) {
      return json(400, { ok: false, fehler: "Eine der Seiten war unvollständig." });
    }
    if (s.length > MAX_BILD * 1.37) {   // base64 ist gut ein Drittel größer
      return json(400, { ok: false, fehler: "Ein Bild ist zu groß. Mach es bitte etwas kleiner." });
    }
  }

  /* Das Datum: zuerst das, was auf dem Blatt steht, dann Pauls Angabe, sonst
     heute. Denny am 22.09.2026: "Die Blätter, die Paul fotografiert, werden
     ein Datum haben … Solltest du auf dem Foto keines finden, bitte frage
     Paul danach." Gelesen wird es hier NICHT aus dem Bild - das kann nur das
     Modell, und das läuft erst beim Bauen. Schickt die Seite eines mit
     (blattText), wird es ausgewertet. */
  const heute = heuteBerlin();
  const vomBlatt = blattDatum(d.blattText || "", heute);
  const datum = vomBlatt || (datumOk(d.datum, heute) ? d.datum : heute);

  const e = await stoffAblegen(env, kind, {
    datum,
    fach: String(d.fach || ""),
    thema: d.thema,
    titel: d.titel,
    notiz: d.notiz,
    datumVonBlatt: !!vomBlatt,
  }, seiten);

  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });

  /* Der Titel wird DIREKT geholt, nicht im Hintergrund.
   *
   * Der erste Entwurf nutzte context.waitUntil() - und nichts kam an, kein
   * Titel und nicht einmal ein Grund. Dieselbe Grenze wie beim Spielbau am
   * selben Tag: "waitUntil() can extend execution for up to 30 seconds after
   * the response is sent" (Cloudflare Workers Limits, 22.09.2026), und was
   * danach passiert, sieht niemand mehr.
   *
   * Also lieber ein paar Sekunden warten. Haiku mit einem verkleinerten Bild
   * braucht wenige Sekunden; nach GRENZE ist Schluss und es wird ohne Titel
   * abgelegt. Das Ablegen bleibt damit weit unter den 90 Sekunden, um die es
   * hier eigentlich ging - und der Eintrag liegt ohnehin schon sicher im
   * Speicher, bevor dieser Aufruf startet. */
  let titel = "";
  if (env.ANTHROPIC_API_KEY) {
    try {
      titel = await titelHolen(env, seiten[0]);
      if (titel) await titelSetzen(env, kind, e.id, titel);
    } catch (err) {
      // Der Grund gehoert in den Eintrag, nicht in einen stillen catch.
      try { await titelSetzen(env, kind, e.id, "", String(err && err.message || err).slice(0, 80)); }
      catch (e2) {}
    }
  }

  return json(200, { ok: true, id: e.id, datum: e.datum, datumVonBlatt: !!vomBlatt,
                     ...(titel ? { titel } : {}) });
}

const TITEL_MODELL = "claude-haiku-4-5-20251001";
// Nach so vielen Sekunden wird ohne Titel abgelegt. Lieber kein Titel als
// ein Kind, das vor dem Ladebalken sitzt.
const TITEL_GRENZE = 9000;

async function titelHolen(env, seite) {
  const komma = String(seite || "").indexOf(",");
  if (komma < 0) throw new Error("kein Bild dabei");
  const typ = String(seite).slice(5, String(seite).indexOf(";"));
  if (typ.indexOf("image/") !== 0) return "";       // PDFs schaut dieser Weg nicht an

  const abbruch = new AbortController();
  const uhr = setTimeout(() => abbruch.abort(), TITEL_GRENZE);
  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: abbruch.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: TITEL_MODELL,
        max_tokens: 100,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: typ, data: String(seite).slice(komma + 1) } },
            { type: "text", text:
              "Das ist ein Blatt aus dem Unterricht eines Grundschulkindes. Schreib mir NUR " +
              "eine kurze Überschrift, worum es darauf geht - höchstens fünf Wörter, deutsch, " +
              "ohne Anführungszeichen und ohne Satzzeichen am Ende. Beispiele: " +
              "\"Stadtporträt von Fürth\", \"Schriftliche Multiplikation\", \"Wörtliche Rede\". " +
              "Erkennst du es nicht sicher, schreib nur: unklar" },
          ],
        }],
      }),
    });
  } finally {
    clearTimeout(uhr);
  }

  if (!r.ok) {
    const roh = await r.text().catch(() => "");
    let art = "";
    try { const j = JSON.parse(roh); art = String((j.error && (j.error.type || j.error.message)) || ""); } catch (e) {}
    throw new Error("HTTP " + r.status + (art ? " " + art.slice(0, 60) : ""));
  }

  const d = await r.json();
  const roh = ((d.content || []).filter((c) => c.type === "text")[0] || {}).text || "";
  const titel = roh.trim().replace(/^["'„]|["'"]$/g, "").slice(0, 60);
  // "unklar" ist eine ehrliche Antwort - dann steht lieber nichts da als
  // etwas Erfundenes.
  return (!titel || /^unklar$/i.test(titel)) ? "" : titel;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  let p;
  try { p = new URL(request.url).searchParams; } catch (e) { return json(400, { ok: false, fehler: "Kaputte Adresse." }); }

  const kind = String(p.get("kind") || "").toLowerCase();
  if (!kindOk(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });

  // Ein einzelnes Bild: /api/schulstoff?kind=paul&bild=<id>:<nr>
  const bild = p.get("bild");
  if (bild) {
    const [id, nr] = String(bild).split(":");
    const daten = await stoffBild(env, id, nr);
    if (!daten) return json(404, { ok: false, fehler: "Das Bild finde ich nicht." });
    // Als data-URL zurück, damit die Seite es direkt in ein <img> hängen kann.
    return json(200, { ok: true, bild: daten });
  }

  const e = await stoffLesen(env, kind, Number(p.get("monate") || 3));
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });
  return json(200, { ok: true, heute: e.heute, faecher: FAECHER, eintraege: e.eintraege });
}

/* Verstecken, wieder zeigen, wegräumen.
 *
 * Denny: "Er kann das aus seiner Ansicht herausnehmen. Die alten
 * Fotografien aber erst nach einem wiederholten Fragen, ob er es wirklich
 * löschen möchte, weil du darauf am Ende gegebenenfalls prüfungsvorbereitende
 * Fragen erarbeiten sollst."
 *
 * Deshalb: "verstecken" ist ein Tipp und umkehrbar. "weg" nimmt den Eintrag
 * aus der Liste - DAS BILD BLEIBT LIEGEN und ist über seine Nummer weiter
 * lesbar. Nichts, was ein Kind fotografiert hat, verschwindet wirklich.
 */
export async function onRequestPatch(context) {
  const { request, env } = context;
  let d;
  try { d = await request.json(); } catch (e) { return json(400, { ok: false, fehler: "Die Anfrage war kein gültiges JSON." }); }

  const kind = String(d.kind || "").toLowerCase();
  if (!kindOk(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });

  const e = await stoffAendern(env, kind, String(d.id || ""), String(d.was || ""));
  if (!e.ok) return json(e.fehler === "Das finde ich nicht mehr." ? 404 : 503, { ok: false, fehler: e.fehler });
  return json(200, { ok: true, was: e.was });
}
