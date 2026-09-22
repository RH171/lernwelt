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
  stoffAblegen, stoffLesen, stoffBild, stoffAendern, titelSetzen, datumSetzen,
  fingerabdruck, schonDa,
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
  try {
    if (new URL(request.url).searchParams.get("nachtragen") === "1") {
      return await nachtragen(context);
    }
  } catch (e) {}

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

  const abdruck = await fingerabdruck(seiten[0]);

  const e = await stoffAblegen(env, kind, {
    datum,
    abdruck,
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
  let titel = "", vomBlattGelesen = "", weichtAb = false;
  if (env.ANTHROPIC_API_KEY) {
    try {
      const gelesen = await blattLesen(env, seiten[0]);
      titel = gelesen.titel;
      /* Das Datum vom Blatt gilt - es weiss besser, wann das Blatt entstanden
         ist, als eine Voreinstellung. ABER es wird nicht stillschweigend
         getauscht: Weicht es von dem ab, was das Kind gewaehlt hat, steht das
         in der Antwort, und die Seite sagt es ihm. Denny: "am Ende hilft es
         natuerlich der Zuordnung" - ein heimlich geaendertes Datum hilft
         niemandem. */
      const geprueft = blattDatum(gelesen.datum, heute);
      if (geprueft) {
        vomBlattGelesen = geprueft;
        weichtAb = geprueft !== e.datum;
      }
      if (titel || vomBlattGelesen) {
        await titelSetzen(env, kind, e.id, titel,
                          vomBlattGelesen && !weichtAb ? "Datum vom Blatt bestätigt" : "");
      }
      if (weichtAb) await datumSetzen(env, kind, e.id, vomBlattGelesen, e.datum);
    } catch (err) {
      // Der Grund gehoert in den Eintrag, nicht in einen stillen catch.
      try { await titelSetzen(env, kind, e.id, "", String(err && err.message || err).slice(0, 80)); }
      catch (e2) {}
    }
  }

  /* Warnen, nicht sperren (Dennys Entscheidung vom 22.09.2026).
   *
   * Das Blatt liegt zu diesem Zeitpunkt SCHON im Heft - nichts geht
   * verloren, wenn die Pruefung schiefgeht. Findet sich ein Zwilling, sagt
   * die Seite es Paul und bietet an, das neue wieder wegzunehmen. Er
   * entscheidet: Ein zweites Foto vom verbesserten Blatt ist gewollt. */
  let zwilling = null;
  try {
    zwilling = await schonDa(env, kind, {
      abdruck, titel,
      fach: String(d.fach || ""),
      datum: weichtAb ? vomBlattGelesen : e.datum,
      ausser: e.id,
    });
  } catch (err) {}

  return json(200, {
    ok: true, id: e.id,
    ...(zwilling ? { schonDa: zwilling } : {}),
    // Das Datum, das jetzt wirklich im Heft steht.
    datum: weichtAb ? vomBlattGelesen : e.datum,
    datumVonBlatt: !!(vomBlatt || vomBlattGelesen),
    ...(titel ? { titel } : {}),
    // Nur wenn es abweicht - die Seite sagt es dem Kind dann ausdrücklich.
    ...(weichtAb ? { datumGeaendert: { von: e.datum, auf: vomBlattGelesen } } : {}),
  });
}

const TITEL_MODELL = "claude-haiku-4-5-20251001";
// Nach so vielen Sekunden wird ohne Titel abgelegt. Lieber kein Titel als
// ein Kind, das vor dem Ladebalken sitzt.
const TITEL_GRENZE = 9000;

/* EIN Blick aufs Bild - Titel und Datum zusammen.
 *
 * Denny am 22.09.2026: "Ich habe jetzt absichtlich ein falsches Datum
 * gewählt. Du müsstest aber das Datum oben rechts oder oben links sehen."
 * Und: "Da schon abgesehen, wird das Datum nicht so relevant sein, aber am
 * Ende hilft es natürlich der Zuordnung."
 *
 * Der Aufruf lief ohnehin schon fuer den Titel - das Datum kostet nichts
 * dazu. Auf einem Schulblatt steht es oben links oder oben rechts, oft
 * abgekuerzt ("22.9.26").
 */
async function blattLesen(env, seite) {
  const komma = String(seite || "").indexOf(",");
  if (komma < 0) throw new Error("kein Bild dabei");
  const typ = String(seite).slice(5, String(seite).indexOf(";"));
  if (typ.indexOf("image/") !== 0) return { titel: "", datum: "" };

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
        max_tokens: 150,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: typ, data: String(seite).slice(komma + 1) } },
            { type: "text", text:
              "Das ist ein Blatt aus dem Unterricht eines Grundschulkindes. Antworte NUR mit zwei " +
              "Zeilen, ohne weiteren Text:\n" +
              "TITEL: eine kurze Überschrift, worum es geht - höchstens fünf Wörter, deutsch, " +
              "ohne Anführungszeichen. Erkennst du es nicht sicher: unklar\n" +
              "DATUM: das Datum, das auf dem Blatt steht - meist oben links oder oben rechts, " +
              "oft abgekürzt wie 22.9.26. Schreib es genau so ab, wie es dasteht. " +
              "Steht keines da: keins\n" +
              "Beispiel:\nTITEL: Stadtporträt von Fürth\nDATUM: 22.9.26" },
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

  const zeile = (name) => {
    const m = roh.match(new RegExp("^\\s*" + name + "\\s*:\\s*(.+)$", "mi"));
    return m ? m[1].trim().replace(/^["'„]|["'"]$/g, "") : "";
  };
  const titel = zeile("TITEL").slice(0, 60);
  const datumRoh = zeile("DATUM").slice(0, 40);

  return {
    // "unklar" ist eine ehrliche Antwort - dann steht lieber nichts da als
    // etwas Erfundenes.
    titel: (!titel || /^unklar$/i.test(titel)) ? "" : titel,
    datum: (!datumRoh || /^(keins|kein|keines|unklar)$/i.test(datumRoh)) ? "" : datumRoh,
  };
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
/* Fehlende Titel nachtragen.
 *
 * Denny am 22.09.2026 zu einem Blatt, das vor der Titel-Funktion abgelegt
 * wurde: "Es heisst nur 'HSU ansehen'. Es hat aber keinen Titel gekommen bis
 * jetzt." Ein Eintrag von gestern soll deshalb nicht fuer immer namenlos
 * bleiben.
 *
 *   POST /api/schulstoff?nachtragen=1   {kind}
 *
 * Nur mit ELTERN-Ausweis - es kostet Geld (ein Haiku-Blick je Blatt, Bruch-
 * teile eines Cents) und soll nicht versehentlich von einem Kind ausgeloest
 * werden, das die Seite neu laedt. Hoechstens 12 auf einmal, damit der
 * Aufruf in der Zeit bleibt; wer mehr hat, ruft nochmal.
 */
async function nachtragen(context) {
  const { request, env } = context;
  let d;
  try { d = await request.json(); } catch (e) { d = {}; }
  const kind = String(d.kind || "").toLowerCase();
  if (!kindOk(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });

  if (!geheimFuer(env, "eltern") || !(await ausweisGueltig(request, geheimFuer(env, "eltern"), env))) {
    return json(401, { ok: false, fehler: "Dafür braucht es den Eltern-Code." });
  }
  if (!env.ANTHROPIC_API_KEY) return json(503, { ok: false, fehler: "Auf dem Server fehlt der Schlüssel." });

  const e = await stoffLesen(env, kind, 6);
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });

  /* Offen ist, wem der Titel fehlt ODER dessen Datum noch nie am Blatt
     geprueft wurde. Sonst bliebe ein Eintrag, der gestern nur den Titel
     bekommen hat, fuer immer falsch einsortiert. */
  const offen = e.eintraege
    .filter((x) => !x.titel || x.datumVon !== "blatt")
    .slice(0, 12);
  const getan = [];
  for (const x of offen) {
    const seite = await stoffBild(env, x.id, 0);
    if (!seite) { getan.push({ id: x.id, warum: "kein Bild" }); continue; }
    try {
      const gelesen = await blattLesen(env, seite);
      /* Auch das DATUM nachtragen.
       *
       * Denny am 22.09.2026 mit einem Bild aus der Grossansicht: Oben stand
       * "Montag, 21. September 2026", auf dem Blatt aber deutlich "22.9.26".
       * Der Nachtrag hat das Datum gelesen und weggeworfen - dabei liefert
       * blattLesen() es gratis mit. Ein Blatt, das sein Datum zeigt, soll
       * auch nachtraeglich richtig einsortiert werden: "am Ende hilft es
       * natuerlich der Zuordnung". */
      const jetzt = heuteBerlin();
      const ausBlatt = blattDatum(gelesen.datum, jetzt);
      const datumNeu = (ausBlatt && ausBlatt !== x.datum) ? ausBlatt : "";

      if (gelesen.titel) await titelSetzen(env, kind, x.id, gelesen.titel);
      else await titelSetzen(env, kind, x.id, "", "nicht erkannt");
      if (datumNeu) await datumSetzen(env, kind, x.id, datumNeu, x.datum);

      getan.push({
        id: x.id,
        ...(gelesen.titel ? { titel: gelesen.titel } : { warum: "Titel nicht erkannt" }),
        ...(datumNeu ? { datum: { von: x.datum, auf: datumNeu } } : {}),
      });
    } catch (err) {
      getan.push({ id: x.id, warum: String(err && err.message || err).slice(0, 60) });
    }
  }
  return json(200, {
    ok: true,
    offen: e.eintraege.filter((x) => !x.titel || x.datumVon !== "blatt").length,
    getan,
  });
}

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
