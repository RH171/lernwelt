// Foto oder Datei rein -> Lernspiel raus.
//
// POST /api/spiel-bauen
//   { kind: "paul", seiten: [{ media_type, data }, ...], wunsch?: "..." }
//
// Der Schlüssel liegt als Cloudflare-Secret ANTHROPIC_API_KEY und taucht
// weder im Code noch in einer Antwort auf.
//
// Zurück kommen SPIELDATEN, kein fertiges HTML: Inhalt und Darstellung sind
// getrennt. Dieselben Daten kann eine feste Bauform füllen oder ein frei
// erfundenes Spiel - das entscheidet die Werkstatt, nicht der Server.

import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { schwaechenHolen, schwaechenBlock, wiederholungGeprueft } from "./_schwaechen.js";
import { spielSichern } from "./spiele.js";
import { namenRichten } from "./_namen.js";
import { rechenfehler } from "./_rechnung.js";

// Entscheidung vom 06.09.2026 nach einem Vergleich an denselben Themen:
// Es bleibt bei Opus 5. Sonnet 5 war zwar schneller und guenstiger, riss aber
// den Zahlenraum ("214 cm + 214 cm" in der 2. Klasse), setzte weniger Bilder
// und liess Merkhilfen weg. Haiku 4.5 lieferte gar nichts. Der Unterschied
// waere rund 0,09 $ je Spiel gewesen - dafuer nicht die Qualitaet eintauschen.
const MODELL = "claude-opus-5";

// Nur zum Nachmessen: Ein Auftrag darf ein anderes Modell verlangen, aber nur
// aus dieser Liste. Die Oberflaeche sendet nichts davon - Leon und Paul bauen
// immer mit MODELL.
const MODELLE_ERLAUBT = {
  "opus":   "claude-opus-5",
  "sonnet": "claude-sonnet-5",
  "haiku":  "claude-haiku-4-5-20251001",
};

// Welches Kind lernt nach welchem Lehrplan.
const KINDER = {
  paul:   { datei: "grundschule-3-4.json", stufe: "4. Klasse Grundschule", alter: 9,
            // Paul am 12.09.2026 (Meldung zjqgkp3xmg) zum Wiege-Meister: "Manche
            // Kunden sagen nur 'ein halbes Kilo Äpfel' oder '200 g mehr als eben',
            // da musst du selbst mitdenken statt nur abzulesen - und diese Kunden
            // geben mehr Taler." Im Wiege-Meister ist das gebaut; hier steht es,
            // weil es fuer jedes Spiel gilt, das er sich bauen laesst.
            // Das steht bei den Wuenschen und nicht bei den Interessen, weil es
            // eine Ansage des Kindes ist und keine Beobachtung ueber das Kind.
            wuensche: [
              'NICHT JEDE MENGE ALS ZAHL HINSCHREIBEN. Paul will mitdenken statt ablesen. Nenne in einem Teil der Aufgaben die Menge in Worten ("ein halbes Kilo", "dreihundert Gramm", "anderthalb Liter") oder im Vergleich zu etwas, das in derselben Aufgabe schon dasteht ("200 g mehr als der erste Sack"). Dann ist der erste Schritt das Umrechnen und nicht das Abschreiben.',
              'DER VERGLEICH MUSS EINDEUTIG SEIN. Sagt eine Aufgabe "200 g mehr als eben", dann steht in derselben Aufgabe, WORAUF sich das bezieht - beim Namen genannt, nicht aus der Aufgabe davor zu erraten. Eine Aufgabe, bei der Paul raten muss, was gemeint war, prüft nicht das Rechnen, sondern das Glück.',
              'NICHT ÜBERALL. Höchstens etwa die Hälfte der Aufgaben so; der Rest nennt die Zahl weiter geradeheraus. Sonst wird das Lesen zur Hürde statt das Rechnen, und Regel 16 (kurze Frage) geht dabei verloren. Der Zahlenraum aus Regel 15 gilt unverändert - auch die ausgeschriebene Menge bleibt darin.',
              // Paul am 14.09.2026 (Meldung 4gq38rd3ts) zum Wiege-Meister: "Ein
              // Kunde sagt 'Ach, mach doch lieber 250g mehr!' - dann musst du dein
              // Gewicht schnell anpassen, und das macht dich richtig flink im
              // Kopfrechnen mit Kilo und Gramm." Im Spiel ist es gebaut; hier
              // steht es, weil es fuer jedes Spiel gilt, das er sich bauen laesst.
              'DIE ANGABE DARF SICH NOCH EINMAL ÄNDERN. Paul mag Aufgaben, in denen die Zahl mittendrin umgeworfen wird: "Zuerst wollte der Kunde 800 g. Jetzt sagt er: lieber 250 g mehr. Wie viel wiegt er ab?" Dafür ist "teilschritte" gemacht - Schritt 1 die erste Menge, Schritt 2 die geänderte. Er nennt das selbst "flink im Kopfrechnen werden".',
              'DIE ÄNDERUNG MUSS DASTEHEN, NICHT ZU ERRATEN SEIN. Wie bei W2: In der Aufgabe steht ausdrücklich, worauf sich die Änderung bezieht ("250 g mehr als die erste Bestellung"), und beide Zahlen bleiben im Zahlenraum aus Regel 15 - auch die geänderte. Ein Ergebnis unter null oder eine krumme Zwischenzahl darf dabei nicht herauskommen. Höchstens ein paar Aufgaben je Spiel so, sonst wird aus der Abwechslung eine Masche.'
            ] },
  leon:   { datei: "grundschule-1-2.json", stufe: "2. Klasse Grundschule", alter: 7,
            interessen: "Fußball, und zwar die SpVgg Greuther Fürth - das Kleeblatt, zu Hause im Ronhof. Leon lebt in Fürth und kennt sich damit richtig gut aus. Er spielt selbst: F-Jugend beim ASC Boxdorf, Training mittwochs und freitags von 17 bis 18.30 Uhr - Training, Trikot, Sporttasche und Trinkflasche sind für ihn Alltag.",
            // Leon am 09.09.2026 (Meldung c75z9z49k5): "Wenn ein Torwart mit Namen
            // benannt wird, muss der Leon heißen. Weil Leon ist Torwart." Auf die
            // Rueckfrage nach dem zweiten Tor: "soll er Theo heißen. Weil der ist
            // auch Torwart und mein bester Freund." Dass die gehaltenen Baelle
            // dabeistehen sollen, hat er mit "Ja" bestaetigt.
            // Nachgeschaerft am 09.09.2026 (Meldung fqhdfzd8ij): "In allen spielen
            // soll Leon und Theo als Torwart genannt werden", wer oefter drankommt -
            // "Hauptsächlich ich" - und auf die Frage, ob Theo dann Stuermer wird:
            // "Nein Theo ist auch Torwart".
            // Das steht hier und nicht bei den Interessen, weil es eine Ansage des
            // Kindes ist und keine Beobachtung ueber das Kind - sie wiegt schwerer.
            wuensche: [
              'TORWART HEISST LEON. Bekommt ein Torwart in einer Aufgabe einen Namen, dann heißt er Leon - nie anders. Leon steht selbst im Tor und soll sich wiedererkennen. Das ist keine erfundene Person im Sinn von Regel 13, sondern das Kind selbst. Kommt in einem Spiel nur ein einziger Torwart vor, ist es immer Leon: Er will hauptsächlich selbst im Tor stehen.',
              'DER ZWEITE TORWART HEISST THEO. Stehen zwei Torhüter auf dem Platz, weil zwei Mannschaften spielen, heißt der andere Theo - Leons bester Freund. Mehr als diese beiden benannten Torhüter gibt es nicht. Theo ist IMMER Torwart und nie Stürmer, Verteidiger oder Feldspieler; er hütet das andere Tor. Und Leon kommt öfter vor als Theo - über ein ganzes Spiel gesehen ist Leon meistens dabei, Theo ab und zu.',
              'SAG, WIE VIELE BÄLLE SIE GEHALTEN HABEN. Kommen Leon und Theo zusammen vor, dann steht in der Aufgabe, wie viele Bälle jeder gehalten hat, und genau mit diesen Zahlen wird gerechnet - zusammenzählen, abziehen, vergleichen. So: "Leon hält 7 Bälle, Theo hält 5. Wie viele sind das zusammen?" Die Zahlen bleiben im Zahlenraum aus Regel 15. DAS GILT NUR IN MATHE-SPIELEN - in Deutsch und HSU wird nicht gerechnet, auch nicht mit gehaltenen Bällen.',
              'NUR WENN EIN TORWART VORKOMMT. Erzwinge dafür keine Fußball-Aufgabe. Eine Tiefsee- oder Werkstatt-Welt bleibt eine Tiefsee- oder Werkstatt-Welt; Abwechslung ist weiter erwünscht (Regel 13, letzter Absatz).',
              // Denny am 14.09.2026, nachdem Leon wieder "Tom" im Tor fand:
              // Paul, Helena und Xaver sollen mitspielen. Durchgesetzt wird das
              // zusaetzlich in _namen.js - diese Zeile allein hat nicht gereicht.
              'ANDERE KINDER SIND LEONS ECHTE LEUTE. Braucht eine Aufgabe weitere Kinder, nimm nur diese: Paul (Leons großer Bruder), Helena (große Schwester), Xaver (Nachbarsjunge) und seine Mitschüler aus der 2bG: Joko, Luka, Jannik, Mia, Romina, Mina. Dazu Klaas (Jokos Bruder, in Pauls Klasse) und Maja (Janniks große Schwester, 5. Klasse Realschule). Sie dürfen schießen, mitspielen, zuschauen, einkaufen - alles außer im Tor stehen, das Tor gehört Leon und Theo. Erfinde KEINE anderen Kindernamen: kein Tom, Max, Ben, Finn, keine Lena. Reichen sie nicht, sag "ein Mitspieler" oder "die Nummer 9". Erwachsene dürfen wie bisher ausgedachte Namen tragen ("Trainer Bodo").'
            ] },
  helena: { datei: "gymnasium-7.json",     stufe: "7. Klasse Gymnasium",   alter: 12 },
};

// Grenzen der Claude-API: 32 MB und 600 Seiten pro Anfrage.
const MAX_BYTES = 24 * 1024 * 1024;   // Sicherheitsabstand zu den 32 MB
const MAX_SEITEN = 20;                // Werkstatt-Grenze; Bücher kommen später


// Die Bauformen, die die Werkstatt darstellen kann.
const SPIELARTEN = ["quiz", "zuordnen", "luecken", "karteikarten", "sammeln"];

// Was die Oberflaeche als Menge wirklich zeichnen kann (leon/index.html,
// MENGE_ZEICHEN und MENGE_FORMEN). Der Auftrag an Claude und die Pruefung
// unten benutzen dieselbe Liste - sonst laufen sie auseinander.
//
// Leon am 09.09.2026 (Meldung jt9m7ev2a7) zu einer Aufgabe ueber 10 Flaschen,
// neben der 10 Muenzen lagen: "Bitte achte darauf, Bebilderungen so zu
// waehlen, dass sie unterstuetzen und nicht verwirren." Die Flasche fehlte in
// der Liste, also griff Claude zur naechstbesten Sache. Jetzt gibt es sie.
const MENGE_DINGE = ["ball", "tor", "spieler", "stern", "apfel", "punkt", "muenze", "schuh",
                     "flasche", "trikot", "pokal", "auto", "blume", "fisch", "kuchen", "herz"];

const BILD_FORMEN = ["kreis", "dreieck", "quadrat", "rechteck", "fuenfeck", "f\u00fcnfeck", "sechseck"];


export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.PAUL_CODE) {
    return fehler(500, "Auf dem Server fehlt der Zugangscode. Denny muss ihn bei Cloudflare als PAUL_CODE hinterlegen.");
  }
  if (!env.ANTHROPIC_API_KEY) {
    return fehler(500, "Der Schlüssel fehlt auf dem Server. Denny muss ihn bei Cloudflare als ANTHROPIC_API_KEY hinterlegen.");
  }

  let auftrag;
  try {
    auftrag = await request.json();
  } catch (e) {
    return fehler(400, "Die Anfrage war kein gültiges JSON.");
  }

  const kind = KINDER[auftrag.kind] ? auftrag.kind : "paul";

  // Erst jetzt pruefen: jedes Kind hat sein eigenes Geheimnis. Bis Denny fuer
  // ein Kind einen eigenen Code hinterlegt, gilt PAUL_CODE (siehe _riegel.js).
  // Denny darf mit dem Eltern-Code fuer ein Kind vorbauen (14.09.2026: Leons
  // erste Deutsch-Spiele sollten bereitliegen, bevor er das Feld antippt).
  const alsEltern = !!geheimFuer(env, "eltern") &&
    (await ausweisGueltig(request, geheimFuer(env, "eltern"), env));
  if (!alsEltern && !(await ausweisGueltig(request, geheimFuer(env, kind), env))) {
    return fehler(401, "Hier darfst du nur mit deinem Code bauen. Bitte melde dich an.");
  }
  const seiten = Array.isArray(auftrag.seiten) ? auftrag.seiten : [];

  const wunsch = String(auftrag.wunsch || "").trim().slice(0, 600);
  const quelle = String(auftrag.quelle || "").trim().slice(0, 40);
  // Pauls Knopf "Meine Hausaufgabe" (16.09.2026). Denny hat entschieden:
  // ueben, nicht loesen. Das Spiel uebt denselben Stoff mit ANDEREN Aufgaben -
  // das Blatt selbst loest das Kind. Geprueft wird das unten in vomBlatt().
  const hausaufgabe = auftrag.hausaufgabe === true && Array.isArray(auftrag.seiten) && auftrag.seiten.length > 0;
  if (seiten.length === 0 && !wunsch) {
    return fehler(400, "Schreib mir, was du dir wünschst – oder schick ein Foto mit.");
  }
  if (seiten.length > MAX_SEITEN) return fehler(400, `Das sind ${seiten.length} Seiten. Mehr als ${MAX_SEITEN} auf einmal kann die Werkstatt noch nicht.`);

  let bytes = 0;
  for (const s of seiten) {
    if (!s || typeof s.data !== "string" || typeof s.media_type !== "string") {
      return fehler(400, "Eine der Seiten war unvollständig.");
    }
    bytes += Math.floor(s.data.length * 0.75); // base64 -> echte Bytes
  }
  if (bytes > MAX_BYTES) {
    return fehler(400, `Zusammen ${(bytes / 1048576).toFixed(1)} MB - das ist zu viel für einen Rutsch. Bitte weniger oder kleinere Seiten.`);
  }

  const vorgaben = { kind, seiten, wunsch, quelle, hausaufgabe, auftrag };

  /* KEIN Hintergrundweg ueber waitUntil - er ist am 22.09.2026 gescheitert.
   * Die Doku ist eindeutig: "waitUntil() can extend execution for up to 30
   * seconds after the response is sent" (Cloudflare Workers Limits,
   * abgerufen 22.09.2026). Nachgemessen: Die Annahme ging in 0,7 s raus, der
   * Auftrag stand danach 622 Sekunden auf "laeuft", und im Regal lag nichts.
   * Wer den Weg wieder aufmacht, braucht eine Queue oder ein Durable Object
   * (dort gilt 15 Minuten Wanduhrzeit), nicht waitUntil. */

  /* Der Weg, der traegt: waehrend gebaut wird, fliessen Lebenszeichen.
   *
   * Gemessen am 22.09.2026: Der Bau MIT Foto dauert 90 bis 120 Sekunden, und
   * Cloudflare brach die stille Leitung mit HTTP 502 ab - Paul sah "Ich
   * konnte den Server nicht erreichen". Ohne Foto sind es 66 s; es lag also
   * schon immer knapp unter der Grenze. Am Bild lag es nicht: dasselbe Blatt
   * mit 286 statt 1382 KB brauchte 120,3 s. Es ist die Denkzeit des Modells.
   *
   * Die Doku nennt den Weg: "There is no hard limit on duration for
   * HTTP-triggered Workers. As long as the client remains connected, the
   * Worker can continue processing, making subrequests, and streaming a
   * response body" (Cloudflare Workers Limits, 22.09.2026). Der 502 kam vom
   * LEERLAUF auf der Leitung. Wer alle fuenf Sekunden eine Zeile schickt,
   * hat keinen Leerlauf.
   *
   * Geantwortet wird zeilenweise (NDJSON): {"status":"laeuft","seit":N} als
   * Puls, am Ende {"status":"fertig","spiel":...} oder
   * {"status":"fehler","fehler":...}. Wer kein strom:true schickt, bekommt
   * weiter eine gewoehnliche Antwort - die Schmiede und das
   * Hausaufgaben-Heft bleiben unberuehrt. */
  if (auftrag.strom === true) {
    const strom = new TransformStream();
    const w = strom.writable.getWriter();
    const enc = new TextEncoder();

    /* Jede Zeile wird auf gut 2 KB aufgefuellt.
     *
     * Ohne das kommt gar nichts an: Cloudflare sammelt kleine Antworten und
     * schickt sie erst am Stueck ("Cloudflare buffers responses when they're
     * really small", Cloudflare-Community, nachgelesen am 22.09.2026).
     * Gemessen: Mit 40-Byte-Zeilen kamen nicht einmal die Kopfzeilen los,
     * und nach 103,8 s stand wieder ein 502 da.
     *
     * Die Fuellung steht HINTER dem JSON und vor dem Umbruch - der Leser
     * schneidet an "\n" und laesst Leerzeichen weg, sie stoert ihn nicht. */
    const FUELLUNG = " ".repeat(2048);
    const zeile = (o) => w.write(enc.encode(JSON.stringify(o) + FUELLUNG + "\n"));

    // Nicht awaiten: Die Antwort geht sofort raus, der Rumpf fuellt sich.
    (async () => {
      let puls = null;
      try {
        await zeile({ status: "laeuft", seit: 0 });
        const start = Date.now();
        puls = setInterval(() => {
          zeile({ status: "laeuft", seit: Math.round((Date.now() - start) / 1000) }).catch(() => {});
        }, 5000);
        const e = await bauLauf(context, vorgaben);
        clearInterval(puls); puls = null;
        await zeile(e.ok ? { status: "fertig", spiel: e.spiel, verbrauch: e.verbrauch || null }
                         : { status: "fehler", fehler: e.text });
      } catch (err) {
        if (puls) clearInterval(puls);
        // Ein Absturz darf nicht heissen, dass das Kind ewig auf den
        // Ladeschirm guckt - es kommt eine ehrliche letzte Zeile.
        try { await zeile({ status: "fehler", fehler: "Beim Bauen ist etwas schiefgegangen. Bitte nochmal versuchen." }); }
        catch (e2) {}
      }
      try { await w.close(); } catch (e) {}
    })();

    return new Response(strom.readable, {
      headers: {
        "content-type": "application/x-ndjson; charset=utf-8",
        "cache-control": "no-store",
        "x-accel-buffering": "no",
      },
    });
  }

  const ergebnis = await bauLauf(context, vorgaben);
  if (!ergebnis.ok) return fehler(ergebnis.status, ergebnis.text);
  return new Response(JSON.stringify({ ok: true, spiel: ergebnis.spiel, verbrauch: ergebnis.verbrauch }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

/* ---- Der eigentliche Bau, losgeloest von der Antwort ---------------------
 *
 * Am 22.09.2026 stand Paul zweimal vor "Ich konnte den Server nicht
 * erreichen". Gemessen war es kein Netzfehler: Der Bau MIT Foto brauchte
 * 90 bis 120 Sekunden, und Cloudflare bricht die Verbindung vorher ab
 * (HTTP 502). Ohne Foto sind es 66 s - es lag also schon immer knapp unter
 * der Grenze, und jedes etwas vollere Blatt kippt es.
 *
 * Am Bild lag es nicht: dasselbe Blatt mit 286 statt 1382 KB brauchte
 * 120,3 s. Es ist die Denkzeit des Modells.
 *
 * Deshalb wird hier nur noch GEBAUT. Wer das Ergebnis sofort braucht,
 * bekommt es zurueck; wer ueber den Hintergrundweg kommt, bekommt sofort
 * eine Auftragsnummer und holt es spaeter ab. Der Bau darf dann so lange
 * dauern, wie er braucht.
 *
 * Rueckgabe: { ok:true, spiel, verbrauch } oder { ok:false, status, text }.
 */
async function bauLauf(context, vorgaben) {
  const { request, env } = context;
  const { kind, seiten, wunsch, quelle, hausaufgabe } = vorgaben;
  const auftrag = vorgaben.auftrag || {};
  // Lehrplan des Kindes holen (liegt als statische Datei neben der Seite).
  let lehrplan;
  try {
    const url = new URL("/lehrplan/" + KINDER[kind].datei, request.url);
    const r = await fetch(url.toString());
    if (!r.ok) throw new Error("HTTP " + r.status);
    lehrplan = await r.json();
  } catch (e) {
    return { ok: false, status: 500, text: "Der Lehrplan konnte nicht geladen werden." };
  }

  const inhalt = [];
  for (const s of seiten) {
    inhalt.push(
      s.media_type === "application/pdf"
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: s.data } }
        : { type: "image",    source: { type: "base64", media_type: s.media_type,      data: s.data } }
    );
  }
  if (hausaufgabe) {
    inhalt.push({ type: "text", text: "Das ist meine HAUSAUFGABE. Bitte löse sie nicht und verrate keine Lösung davon. " +
      "Bau mir ein Übungsspiel zum selben Stoff mit ANDEREN Aufgaben - andere Zahlen, andere Wörter, andere Sätze -, " +
      "damit ich die Hausaufgabe danach selbst schaffe. Die Erklärungen zeigen den Weg an deinen eigenen Beispielen. " +
      "Trag jede Aufgabe, die du auf dem Blatt siehst, kurz in blatt_aufgaben ein. " +
      "Ist das Blatt schon ausgefüllt, übe gezielt das, was dort noch nicht sitzt - ohne zu verraten, welche Antwort auf dem Blatt falsch ist." +
      (wunsch ? ` Was ich brauche: ${wunsch}` : "") });
  } else if (seiten.length && wunsch) {
    inhalt.push({ type: "text", text: `Das ist mein Schulstoff. Dazu mein Wunsch: ${wunsch}` });
  } else if (seiten.length) {
    inhalt.push({ type: "text", text: "Das ist mein Schulstoff. Bau mir ein Spiel daraus." });
  } else {
    inhalt.push({ type: "text", text: `Ich habe kein Bild dabei. Bau mir ein Spiel nach diesem Wunsch: ${wunsch}` });
  }

  /* Was zuletzt nicht saß, kommt wieder - siehe _schwaechen.js.
     Bewusst in die NUTZER-Nachricht und nicht in den System-Text: Der wird
     zwischengespeichert (cache_control), und eine Liste, die sich bei jedem
     Kind und jedem Aufruf ändert, würde den Cache bei jedem Spiel entwerten. */
  let schwaechen = [];
  try { schwaechen = await schwaechenHolen(env, kind); } catch (e) {}
  if (schwaechen.length) inhalt.push({ type: "text", text: schwaechenBlock(schwaechen) });

  const anfrageStellen = () => fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODELLE_ERLAUBT[String(auftrag.modell || "").toLowerCase()] || MODELL,
      // Grosszuegig: Mit Bild und Merkmal je Aufgabe sind die Antworten lang
      // geworden, und ein abgeschnittenes Ergebnis kommt als leeres Spiel
      // zurueck. Am 6.9.2026 zweimal beobachtet, danach von 16000 auf 32000.
      // Gedeckelt am 22.09.2026: Pauls Bau mit Foto lief nach 115,9 s in
      // HTTP 502, also in Cloudflares Zeitgrenze (ohne Foto: 66 s). 32000
      // waren nur Luft nach oben - und Luft, die Zeit kostet.
      max_tokens: 20000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: [{ type: "text", text: systemtext(kind, lehrplan), cache_control: { type: "ephemeral" } }],
      tools: [WERKZEUG],
      tool_choice: { type: "tool", name: "spiel_bauen" },
      messages: [{ role: "user", content: inhalt }],
    }),
  });

  let antwort = await anfrageStellen();

  if (!antwort.ok) {
    const text = await antwort.text().catch(() => "");
    // Nie den Schlüssel oder rohe API-Fehler nach außen geben.
    if (antwort.status === 401 || antwort.status === 403) return { ok: false, status: 500, text: "Der Server darf gerade nicht bei Claude anfragen. Denny muss den Schlüssel prüfen." };
    if (antwort.status === 429) return { ok: false, status: 503, text: "Gerade ist zu viel los. Bitte in einer Minute nochmal." };
    if (text.includes("credit") || text.includes("billing")) return { ok: false, status: 503, text: "Das Guthaben ist aufgebraucht oder das Monatslimit erreicht. Denny muss nachsehen." };
    return { ok: false, status: 502, text: "Claude hat nicht geantwortet. Bitte nochmal versuchen." };
  }

  const daten = await antwort.json();
  const block = (daten.content || []).find((b) => b.type === "tool_use");
  if (!block || !block.input) return { ok: false, status: 502, text: "Es kam kein brauchbares Spiel zurück. Bitte nochmal versuchen." };

  const spiel = block.input;

  // Bevor irgendetwas gespeichert oder ausgeliefert wird: Taugt das Spiel?
  // Am 06.09.2026 kam ein Spiel mit einer einzigen Aufgabe zurueck - fuer ein
  // Kind ist das kein Spiel. Lieber ein ehrlicher Fehler als Murks im Regal.
  let maengel = pruefeSpiel(spiel, kind);

  /* ERST aussortieren, DANN erst neu bauen.
   *
   * Am 22.09.2026 stand Paul vor "Ich konnte den Server nicht erreichen":
   * Der neue Beleg-Riegel fand bei seinem HSU-Blatt Aufgaben ohne Beleg, und
   * jeder einzelne Mangel loeste hier einen kompletten zweiten Bau aus. Aus
   * 90 Sekunden wurden 180, und Safari auf dem iPad bricht vorher ab. Das
   * Aussortieren stand schon da - aber erst NACH dem zweiten Anlauf, also an
   * der teuersten Stelle.
   *
   * Ein Mangel, den man wegnehmen kann, braucht keinen neuen Bau. Der zweite
   * Anlauf bleibt fuer die echten Aussetzer (kein Titel, zu wenige Aufgaben). */
  if (maengel.length && maengel.every(aussortierbar)) {
    aussortieren(spiel, kind);
    maengel = pruefeSpiel(spiel, kind);
  }

  if (maengel.length) {
    // Einmal nachfassen. Diese Aussetzer sind sporadisch, und ein Kind soll
    // nicht mit einer Fehlermeldung dastehen, wenn ein zweiter Anlauf reicht.
    const zweite = await anfrageStellen();
    if (zweite.ok) {
      const d2 = await zweite.json();
      const b2 = (d2.content || []).find((c) => c.type === "tool_use");
      if (b2 && b2.input && !pruefeSpiel(b2.input, kind).length) {
        Object.assign(spiel, b2.input);
        maengel = [];
      }
    }
  }
  // Letzter Ausweg vor der Fehlermeldung: Sind es NUR fachfremde Aufgaben,
  // dann wirf die einzelnen raus, statt das ganze Spiel wegzuwerfen. Ein
  // Deutsch-Spiel mit neun Deutsch-Aufgaben ist besser als eine Fehlermeldung
  // nach neunzig Sekunden Warten - und deutlich besser als zwölf Aufgaben,
  // von denen vier Mathe sind.
  if (maengel.length && maengel.every(aussortierbar)) {
    aussortieren(spiel, kind);
    maengel = pruefeSpiel(spiel, kind);
  }
  if (maengel.length) {
    return { ok: false, status: 502, text: "Das Spiel kam unvollständig zurück (" + maengel[0] + "). Bitte nochmal versuchen." };
  }

  // Bilder, die die Oberflaeche nicht zeichnen kann, gar nicht erst aufheben.
  bilderAufraeumen(spiel);

  // Leons Torhueter heissen Leon und Theo, die anderen Kinder Paul, Helena,
  // Xaver. Die Bitte im Auftrag reicht nicht - hier wird es sicher.
  if (kind === "leon") namenRichten(spiel);

  /* Kam die Wiederholung wirklich an? "Eine Bitte im Auftrag ist keine
     Prüfung" (CLAUDE.md) - also mechanisch nachsehen. Das Spiel wird deswegen
     NICHT verworfen: Neun brauchbare Aufgaben sind besser als eine
     Fehlermeldung nach neunzig Sekunden Warten. Aber es wird vermerkt, damit
     im Elternbereich sichtbar ist, was noch offen steht. */
  if (schwaechen.length) {
    const fehlend = wiederholungGeprueft(schwaechen, spiel.aufgaben);
    spiel.wiederholt = schwaechen.map((s) => s.merkmal).filter((m) => !fehlend.includes(m));
    if (fehlend.length) spiel.wiederholungFehlt = fehlend;
  }

  spiel.erzeugt = new Date().toISOString();
  if (hausaufgabe) spiel.hausaufgabe = true;
  spiel.kind = kind;
  spiel.modell = MODELLE_ERLAUBT[String(auftrag.modell || "").toLowerCase()] || MODELL;

  // Aufheben, damit Paul es wiederfindet und daraus weitere Spiele ableiten kann.
  // Ein Fehler beim Speichern darf das fertige Spiel nicht kosten.
  try {
    if (env.PAUL_KV) spiel.id = await spielSichern(env, spiel, seiten, kind, quelle, daten.usage);
  } catch (e) {
    spiel.nichtGespeichert = true;
  }

  return { ok: true, spiel, verbrauch: daten.usage || null };
}


// Was ein Spiel mindestens erfuellen muss, damit es ein Kind vorgesetzt bekommt.
const MIN_AUFGABEN = 5;

// Titel, die offensichtlich stehengeblieben sind. Am 6.9.2026 kam ein
// fertiges Spiel mit dem Titel "Platzhalter" zurueck - Aufgaben gut,
// Ueberschrift vergessen.
const TITEL_MURKS = /^(platzhalter|titel|spiel|unbenannt|todo|beispiel|test|neues spiel|lernspiel)\.?$/i;

// ---- Rechnen, das sich in ein Deutsch- oder HSU-Spiel verirrt hat ----------
//
// Regel D11 im Auftrag sagt es seit dem 14.09.2026 ausdruecklich ("KEIN RECHNEN
// UND KEIN ABZÄHLEN in Deutsch und HSU"), und trotzdem stand in Leons Spiel
// psu4ydv39g ueber das Praedikat: "Leon haelt 6 Baelle, Theo haelt 4 Baelle.
// Wie viele sind das zusammen?" Eine Bitte im Auftrag ist eben keine Pruefung -
// dieselbe Lehre wie bei den Namen (namenRichten in _namen.js).
//
// Woher das kommt, ist kein Zufall: Leons Eingabefeld hat nur Ziffern, eine
// getippte Loesung MUSS also eine Zahl sein. Wer in einem Deutsch-Spiel eine
// "eingabe"-Aufgabe bauen will, landet darum schnell beim Rechnen. Erlaubt
// bleibt nur, was aus dem Fach selbst kommt: Silben, Buchstaben, Nomen im Satz,
// die fuenf Sinne, die vier Jahreszeiten.
/* Maengel, die sich durch Wegnehmen beheben lassen - im Gegensatz zu "ohne
 * Titel" oder "nur 3 statt 8 Aufgaben", wo wirklich neu gebaut werden muss. */
export function aussortierbar(m) {
  return m.startsWith(FACHFREMD_MARKE) || m.startsWith(RECHENFEHLER_MARKE) ||
         m.startsWith(VOM_BLATT_MARKE) || m.startsWith(OHNE_BELEG_MARKE);
}

/* Die einzelnen Aufgaben rausnehmen, das Spiel behalten. Ein Deutsch-Spiel mit
 * neun Aufgaben ist besser als eine Fehlermeldung nach neunzig Sekunden. */
function aussortieren(spiel, kind) {
  fachfremdeEntfernen(spiel, kind);
  falschGerechneteEntfernen(spiel);
  vomBlattEntfernen(spiel);
  ohneBelegEntfernen(spiel);
  aufWahlStellen(spiel);
}

const FACHFREMD_MARKE = "fachfremd: ";

// Merkmale, die eine Rechenfertigkeit benennen. Bewusst NICHT das nackte
// "zaehlen": "silben zaehlen" und "buchstaben zaehlen" sind Deutsch und sollen
// bleiben, "mengen zaehlen" ist Mathe.
const RECHEN_MERKMAL = /(zusammenzaehlen|zusammenzählen|verdoppeln|halbieren|abziehen|zehneruebergang|zehnerübergang|einmaleins|er-reihe|rueckgeld|rückgeld|muenzen|münzen|nachbarzahlen|zahlen zerlegen|mengen zaehlen|mengen zählen|plus|minus|malnehmen|addieren|subtrahieren|rechnen)/i;

// Eine Rechnung, die in der Frage selbst steht: "3 + 5", "12 : 4".
const RECHEN_FRAGE = /\d+\s*(?:\+|-|−|·|×|\*|:)\s*\d+/;

// Gilt nur fuer Leseanfaenger - fuer sie steht D1/D10/D11 ueberhaupt im
// Auftrag. Bei Paul kann eine Schrittkette in Deutsch sinnvoll sein
// (Satzglieder der Reihe nach), bei Leon nicht.
export function fachfremd(a, spiel, kind) {
  const k = KINDER[kind];
  if (!k || k.alter > 8) return "";
  const fach = String((spiel && spiel.fach) || "").toLowerCase();
  if (fach !== "deutsch" && fach !== "hsu") return "";
  if ((a.art || "") === "teilschritte") return "ist eine Rechen-Schrittkette";
  if (RECHEN_MERKMAL.test(String(a.merkmal || ""))) return `übt "${a.merkmal}" statt ${fach === "hsu" ? "HSU" : "Deutsch"}`;
  if (RECHEN_FRAGE.test(String(a.frage || ""))) return "rechnet mitten in der Frage";
  return "";
}

// Rechenfehler in der Loesung oder im Rechenweg. Dieselbe Bauart wie
// FACHFREMD_MARKE: markiert, damit die einzelne Aufgabe rausfliegen kann,
// statt das ganze Spiel wegzuwerfen.
//
// Am 15.09.2026 lag in Pauls Regal "Ein Marktbroetchen kostet 1,20 €. Was
// kosten 6 Broetchen?" mit der Loesung 7 und dem Rechenweg "120 ct = 1 €".
// Der Auftrag bittet den Baumeister seit jeher, richtig zu rechnen - eine
// Bitte im Auftrag ist eben keine Pruefung.
const RECHENFEHLER_MARKE = "rechnet falsch: ";

// Die fachfremden Aufgaben aus dem Spiel nehmen. Gibt zurueck, was rausflog -
// zum Mitschreiben, nicht zum Anzeigen.
export function fachfremdeEntfernen(spiel, kind) {
  const raus = [];
  spiel.aufgaben = (spiel.aufgaben || []).filter((a) => {
    const grund = fachfremd(a, spiel, kind);
    if (grund) { raus.push(grund); return false; }
    return true;
  });
  return raus;
}

// ---- Aufgaben, die vom Blatt abgeschrieben sind ----------------------------
//
// Regel 2 sagt "SCHREIBE NICHTS AB" seit dem ersten Tag. Seit Pauls Knopf
// "Meine Hausaufgabe" (16.09.2026) waere eine abgeschriebene Aufgabe aber mehr
// als unschoen: Das Spiel zeigt nach jeder Antwort die Loesung - es wuerde die
// Hausaufgabe loesen. Denny hat entschieden: ueben, nicht loesen. Eine Bitte
// im Auftrag ist keine Pruefung (dieselbe Lehre wie bei den Namen), darum
// nennt das Modell in blatt_aufgaben, was auf dem Blatt steht, und hier wird
// verglichen.
//
// Verglichen wird nur, was eindeutig ist: Rechnungen (Ziffer UND Rechenzeichen)
// und Saetze ab vier Woertern. Ein einzelnes Wort wie "Hund" oder eine nackte
// Zahl darf auch im Spiel vorkommen - sonst waere kein Deutsch-Spiel mehr moeglich.
const VOM_BLATT_MARKE = "vom Blatt: ";

function blattForm(t) {
  return String(t == null ? "" : t).toLowerCase()
    .replace(/[×·∙⋅*]/g, "x").replace(/[÷:]/g, "/").replace(/[−–]/g, "-")
    .replace(/(\d)\s*x\s*(\d)/g, "$1x$2")
    .replace(/[^a-zäöüß0-9+\-x\/=]+/g, "");
}

function blattMuster(spiel) {
  const muster = [];
  ((spiel && spiel.blatt_aufgaben) || []).forEach((b) => {
    // Die Nummerierung vom Blatt ("3)", "b.") gehoert nicht zur Aufgabe, ein
    // leeres "= __" am Ende auch nicht.
    const roh = String(b == null ? "" : b)
      .replace(/^\s*(\d+|[a-z])[.)]\s+/i, "").replace(/=\s*_*\s*\??\s*$/, "");
    // "Unterstreiche das Prädikat: Der Hund bellt laut." - die Anweisung
    // formuliert das Spiel anders, der Satz dahinter waere trotzdem derselbe.
    [roh].concat(roh.split(/[:;]/).length > 1 && !/\d\s*:\s*\d/.test(roh) ? roh.split(/[:;]/) : [])
      .forEach((teil) => {
        const rechnung = /\d/.test(teil) && /\d\s*[+\-−–×·∙⋅*x÷:\/]\s*\d/.test(teil);
        const satz = teil.trim().split(/\s+/).length >= 4;
        const form = blattForm(teil);
        if ((rechnung || satz) && form.length >= 3) muster.push(form);
      });
  });
  return muster;
}

// Enthaelt die Frage das Muster - aber nicht als Teil einer groesseren Zahl?
// "134 + 27" ist nicht "34 + 27".
function enthaeltGanz(text, m) {
  for (let i = text.indexOf(m); i >= 0; i = text.indexOf(m, i + 1)) {
    const vor = text.charAt(i - 1), nach = text.charAt(i + m.length);
    if (!(/\d/.test(m.charAt(0)) && /\d/.test(vor)) &&
        !(/\d/.test(m.charAt(m.length - 1)) && /\d/.test(nach))) return true;
  }
  return false;
}

/* Eine Frage, die das Kind nicht wissen KANN.
 *
 * Paul hat am 22.09.2026 sein HSU-Blatt "Das Stadtporträt von Fürth"
 * fotografiert. Auf dem Blatt steht in seiner Handschrift
 * "Regierungsbezirk: Mittelfranken". Das gebaute Spiel fragte als erste
 * Aufgabe: "Eine Stadt liegt in einem Regierungsbezirk. Wie viele
 * Regierungsbezirke hat Bayern?" - die Sieben stand nirgends. Denny:
 * "Woher soll Paul das dann wissen? ... du würdest ihn hiermit
 * demotivieren, als würde er etwas nicht wissen."
 *
 * Regel 2b bittet darum. Eine Bitte im Auftrag ist keine Pruefung - dieselbe
 * Lehre wie bei den Namen, beim Fachfremden und beim Rechnen. Also wird
 * gemessen: Die richtige Antwort muss im beleg stehen, und der beleg muss
 * vom Blatt sein.
 *
 * Geprueft wird NUR bei einem Wissensblatt mit Foto. Bei einem Verfahren
 * (Rechnen, Rechtschreibung) waeren eigene Zahlen ja gerade Pflicht.
 */
const OHNE_BELEG_MARKE = "nicht vom Blatt: ";

export function istWissensblatt(spiel) {
  if (!spiel || !(spiel.blatt_aufgaben || spiel.blatt_inhalt)) return false;
  // HSU mit Blatt gilt IMMER als Wissensblatt, auch wenn das Modell etwas
  // anderes eintraegt: Genau dort kommt der Stoff als Tatsache vom Blatt,
  // und genau dort ist Paul der Fehler passiert.
  const fach = String(spiel.fach || "").toLowerCase();
  const hatBlatt = (spiel.blatt_aufgaben || []).length > 0 || (spiel.blatt_inhalt || []).length > 0;
  return spiel.wissensblatt === true || (hatBlatt && (fach === "hsu" || fach === "sachunterricht"));
}

/* Steht die Antwort so im Text? Verglichen werden Woerter und Zahlen ohne
 * Satzzeichen; "132.000" und "132000" sind dasselbe, "FÜ" und "fü" auch. */
function belegForm(t) {
  return " " + String(t == null ? "" : t).toLowerCase()
    .replace(/[.\u00b7\u2019']/g, "").replace(/[^a-z\u00e4\u00f6\u00fc\u00df0-9]+/g, " ").trim() + " ";
}

function stehtDrin(grosser, kleiner) {
  const g = belegForm(grosser), k = belegForm(kleiner).trim();
  return k.length > 0 && g.includes(" " + k + " ");
}

export function ohneBeleg(a, spiel) {
  if (!istWissensblatt(spiel) || !a) return "";
  const inhalt = ((spiel.blatt_inhalt || []).concat(spiel.blatt_aufgaben || []))
    .map((x) => String(x || "")).filter(Boolean);
  if (!inhalt.length) return "";      // nichts zum Vergleichen - dann nicht raten

  /* Der Beleg kommt als NUMMER (beleg_nr, 1 = erste Zeile von blatt_inhalt).
     Das spart je Aufgabe einen abgeschriebenen Satz - und genau diese Saetze
     haben den Bau am 22.09.2026 ueber Cloudflares Zeitgrenze geschoben.
     Ein Zitat im alten Feld beleg gilt weiter, damit gespeicherte Spiele
     lesbar bleiben. */
  const nr = Number(a.beleg_nr);
  const ausNummer = (Number.isFinite(nr) && nr >= 1 && nr <= inhalt.length && nr === Math.floor(nr))
    ? inhalt[nr - 1] : "";
  const beleg = ausNummer || String(a.beleg || "").trim();
  if (!beleg) return OHNE_BELEG_MARKE + String(a.frage || "").slice(0, 70) + " (kein Beleg)";

  // Der Beleg muss WIRKLICH vom Blatt sein, sonst schreibt sich das Modell
  // seinen eigenen Beleg und die Pruefung waere ein Papiertiger.
  if (!inhalt.some((z) => stehtDrin(z, beleg) || stehtDrin(beleg, z)))
    return OHNE_BELEG_MARKE + String(a.frage || "").slice(0, 70) + " (Beleg steht nicht auf dem Blatt)";

  // Und die Antwort muss im Beleg stehen. Eine Zahl, die man aus einer Liste
  // abzaehlt ("wie viele Partnerstaedte"), steht dort nicht - dafuer darf der
  // Beleg die ganze Liste sein, dann traegt die naechste Zeile.
  const richtig = String(a.richtig == null ? "" : a.richtig).trim();
  if (!richtig) return "";
  if (stehtDrin(beleg, richtig)) return "";
  const n = Number(richtig.replace(/[^0-9]/g, ""));
  if (Number.isFinite(n) && n > 0 && n <= 20 && belegForm(beleg).trim().split(/\s+/).length >= n) return "";
  return OHNE_BELEG_MARKE + String(a.frage || "").slice(0, 70) + " (die Antwort steht nicht im Beleg)";
}

/* Nur die Art ist falsch? Dann umstellen statt wegwerfen.
 *
 * Aus einer Eingabe-Aufgabe wird eine Auswahl: die richtige Antwort plus drei
 * andere Angaben VOM BLATT. Die falschen kommen damit aus demselben Stoff -
 * genau wie es Regel 2c verlangt, und es bleibt beim Wiedererkennen statt beim
 * Ausschliessen von Unsinn. Findet sich nichts Passendes, faellt die Aufgabe
 * doch raus: lieber eine weniger als eine, die er nicht bedienen kann. */
export function aufWahlStellen(spiel) {
  if (!istWissensblatt(spiel)) return [];
  const vorrat = [];
  ((spiel.blatt_inhalt || []).concat(spiel.blatt_aufgaben || [])).forEach((z) => {
    // Nur die WERTE, nicht die Feldnamen: aus "Regierungsbezirk: Mittelfranken"
    // wird "Mittelfranken". Sonst stuenden als falsche Antworten
    // "Einwohner" und "Wappen" da - das waere zum Ausschliessen von Unsinn
    // geraten, nicht zum Wiedererkennen.
    const roh = String(z || "");
    const wert = roh.includes(":") ? roh.slice(roh.indexOf(":") + 1) : roh;
    wert.split(/[;,]| und /).map((x) => x.trim().replace(/\.$/, ""))
      .filter((x) => x && x.length > 1 && x.length < 40)
      .forEach((x) => { if (!vorrat.includes(x)) vorrat.push(x); });
  });
  const raus = [];
  spiel.aufgaben = (spiel.aufgaben || []).filter((a) => {
    if ((a.art || "wahl") === "wahl") return true;
    const richtig = String(a.richtig == null ? "" : a.richtig).trim();
    const andere = vorrat.filter((x) => x.toLowerCase() !== richtig.toLowerCase()).slice(0, 12);
    if (!richtig || andere.length < 3) { raus.push(a.frage); return false; }
    // Immer dieselben drei waeren nach drei Aufgaben durchschaut; gewuerfelt
    // wird aus dem, was das Blatt hergibt.
    const gewaehlt = [];
    while (gewaehlt.length < 3 && andere.length) {
      gewaehlt.push(andere.splice(Math.floor(Math.random() * andere.length), 1)[0]);
    }
    a.art = "wahl";
    a.teilschritte = [];
    a.antworten = gewaehlt.concat([richtig])
      .map((v) => ({ v, r: Math.random() })).sort((x, y) => x.r - y.r).map((x) => x.v);
    return true;
  });
  return raus;
}

export function ohneBelegEntfernen(spiel) {
  const raus = [];
  spiel.aufgaben = (spiel.aufgaben || []).filter((a) => {
    const grund = ohneBeleg(a, spiel);
    if (grund) { raus.push(grund); return false; }
    return true;
  });
  return raus;
}

export function vomBlatt(a, spiel) {
  const muster = blattMuster(spiel);
  if (!muster.length || !a) return false;
  const frage = blattForm(a.frage);
  return muster.some((m) => enthaeltGanz(frage, m));
}

export function vomBlattEntfernen(spiel) {
  const raus = [];
  spiel.aufgaben = (spiel.aufgaben || []).filter((a) => {
    if (vomBlatt(a, spiel)) { raus.push(a.frage); return false; }
    return true;
  });
  return raus;
}

// Dasselbe fuer Aufgaben, bei denen die Zahl nicht stimmt.
export function falschGerechneteEntfernen(spiel) {
  const raus = [];
  spiel.aufgaben = (spiel.aufgaben || []).filter((a) => {
    const grund = rechenfehler(a);
    if (grund) { raus.push(grund); return false; }
    return true;
  });
  return raus;
}

export function pruefeSpiel(spiel, kind) {
  const m = [];
  const auf = (spiel && spiel.aufgaben) || [];
  const t = String((spiel && spiel.titel) || "").trim();
  if (!t) m.push("ohne Titel");
  else if (TITEL_MURKS.test(t)) m.push(`Titel "${t}" ist ein Platzhalter`);
  if (auf.length < MIN_AUFGABEN) {
    m.push(`nur ${auf.length} statt mindestens ${MIN_AUFGABEN} Aufgaben`);
  }
  auf.forEach((a, i) => {
    const nr = i + 1;
    if (vomBlatt(a, spiel)) m.push(`${VOM_BLATT_MARKE}Aufgabe ${nr} steht so auf dem Blatt`);
    const fremd = fachfremd(a, spiel, kind);
    if (fremd) m.push(`${FACHFREMD_MARKE}Aufgabe ${nr} ${fremd}`);
    const krumm = rechenfehler(a);
    if (krumm) m.push(`${RECHENFEHLER_MARKE}Aufgabe ${nr}: ${krumm}`);
    const unbelegt = ohneBeleg(a, spiel);
    if (unbelegt) m.push(`${OHNE_BELEG_MARKE}Aufgabe ${nr}: ${unbelegt.slice(OHNE_BELEG_MARKE.length)}`);
    /* Auf einem Wissensblatt wird angetippt, nicht getippt (Denny, 22.09.2026):
       "Wenn Paul dir das fotografiert hat, hat er das heute oder gestern ... in
       der Schule gehabt. Das heisst ja noch nicht, dass er das auch alles
       auswendig kann." Vier Moeglichkeiten sind die Stufe, auf der er anfaengt. */
    if (istWissensblatt(spiel) && (a.art || "wahl") !== "wahl")
      m.push(`${OHNE_BELEG_MARKE}Aufgabe ${nr} muss zum Antippen sein, nicht zum Eintippen`);
    if (!a.frage || !String(a.frage).trim()) m.push(`Aufgabe ${nr} ohne Frage`);
    if (a.richtig === undefined || a.richtig === null || String(a.richtig).trim() === "")
      m.push(`Aufgabe ${nr} ohne Lösung`);
    if ((a.art || "wahl") === "wahl") {
      const antw = a.antworten || [];
      if (antw.length < 2) m.push(`Aufgabe ${nr} hat zu wenige Antworten`);
      else if (antw.indexOf(a.richtig) < 0) m.push(`bei Aufgabe ${nr} fehlt die richtige Antwort in der Auswahl`);
    }
    // Leons Eingabefeld zeigt nur die Zahlentastatur. Ein Wort als Loesung
    // koennte er dort gar nicht eintippen - bei Deutsch-Aufgaben naheliegend.
    if (kind === "leon" && (a.art || "") === "eingabe" && !/^\s*\d+\s*$/.test(String(a.richtig)))
      m.push(`Aufgabe ${nr}: "${a.richtig}" lässt sich auf Leons Zahlentastatur nicht eintippen`);
    if ((a.art || "") === "teilschritte" && !(a.teilschritte || []).length)
      m.push(`Aufgabe ${nr} ist eine Schrittkette ohne Schritte`);

    // Getippte Antworten mit Einheit sind der Fehler, den Paul am 07.09.2026
    // gemeldet hat: Er tippte 3250, erwartet war "3250 g", und die richtige
    // Antwort galt als falsch. Der Vergleich verzeiht das inzwischen - aber
    // gar nicht erst entstehen lassen ist besser.
    const nackt = (w) => !/^-?[\d.,\s]*\d\s*[^\d\s,.].*$/.test(String(w == null ? "" : w).trim());
    if ((a.art || "") === "eingabe" && !nackt(a.richtig))
      m.push(`Aufgabe ${nr}: die Lösung "${a.richtig}" trägt eine Einheit - die gehört in die Frage`);
    (a.teilschritte || []).forEach((sch, j) => {
      if (!nackt(sch.richtig))
        m.push(`Aufgabe ${nr}, Schritt ${j + 1}: die Lösung "${sch.richtig}" trägt eine Einheit`);
    });
  });
  return m;
}

// Ein falsches Bild ist schlimmer als gar keins: Das Kind sucht dann erst den
// Zusammenhang, den es nicht gibt. Was die Oberflaeche nicht sauber zeichnen
// kann, wird hier still geleert - die Frage steht ja im Text und traegt allein.
function bildTaugt(spec) {
  const t = String(spec || "").trim().toLowerCase();
  if (!t) return false;
  const teile = t.split(":");
  const zahl = (w) => /^\d+$/.test(String(w == null ? "" : w).trim());
  const wort = String(teile[1] || "").trim();
  switch (teile[0]) {
    case "uhr":          return zahl(teile[1]) && (teile[2] === undefined || zahl(teile[2]));
    case "strichliste":  return zahl(teile[1]) && Number(teile[1]) <= 60;
    case "menge":        return zahl(teile[1]) && Number(teile[1]) >= 1 && Number(teile[1]) <= 40 &&
                                !!mengeDing(teile[2]);
    case "form":         return BILD_FORMEN.some((f) => wort.includes(f));
    case "zahlenstrahl": return teile.length >= 4 && zahl(teile[1]) && zahl(teile[2]) &&
                                Number(teile[2]) > Number(teile[1]) && teile.slice(3).every(zahl);
    default:             return false;
  }
}

// Mehrzahl mitlesen, genau wie mengeName() in leon/index.html: "flaschen"
// zeichnet die Oberflaeche als Flasche, also darf es hier nicht durchfallen.
function mengeDing(was) {
  const roh = String(was || "").trim().toLowerCase();
  for (const v of [roh, roh.replace(/en$/, ""), roh.replace(/n$/, ""),
                   roh.replace(/e$/, ""), roh.replace(/s$/, "")]) {
    if (MENGE_DINGE.includes(v)) return v;
  }
  return "";
}

function bilderAufraeumen(spiel) {
  const raus = [];
  for (const a of (spiel && spiel.aufgaben) || []) {
    if (a && a.bild && !bildTaugt(a.bild)) { raus.push(a.bild); a.bild = ""; }
  }
  return raus;
}

function fehler(status, text) {
  return new Response(JSON.stringify({ ok: false, fehler: text }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function systemtext(kind, lehrplan) {
  const k = KINDER[kind];
  const faecher = lehrplan.faecher.map((f) => {
    const pfad = (f.lernpfad || f.lernpfad_annahme || []).map((t) => `${t.nr}. ${t.thema}`).join(" -> ");
    const lb = f.lernbereiche.map((l) => `${l.id} ${l.titel}`).join("; ");
    return `FACH ${f.name} (${f.kuerzel})\n  Lernbereiche: ${lb}\n  Übliche Reihenfolge: ${pfad}`;
  }).join("\n\n");

  return `Du baust Lernspiele für ein Kind. Du bekommst ein Foto oder eine Datei aus dem Schulalltag und machst daraus ein Spiel.

DAS KIND
${kind.charAt(0).toUpperCase() + kind.slice(1)}, ${k.alter} Jahre, ${k.stufe}, Bayern.${k.interessen ? "\nWoran sein Herz hängt: " + k.interessen : ""}
${(k.wuensche && k.wuensche.length) ? `
WAS DAS KIND SICH SELBST GEWÜNSCHT HAT
Diese Sätze kommen vom Kind, nicht von mir. Wo sie greifen, gehen sie deiner
eigenen Idee vor - das Kind erkennt sofort, ob du zugehört hast.
${k.wuensche.map((w, i) => `W${i + 1}. ${w}`).join("\n")}
` : ""}

${k.alter <= 8 ? `DEUTSCH FÜR LESEANFÄNGER - gilt, sobald das Spiel Deutsch übt
Das Kind liest noch nicht sicher. Frage UND Antworten werden vorgelesen.
D1. NUR ANTIPPEN. Nimm "wahl". "eingabe" nur, wenn die Lösung eine Zahl ist (Silben zählen, Buchstaben zählen) - das Eingabefeld hat nur Ziffern. Keine "teilschritte".
D2. KURZE ANTWORTEN. Drei oder vier, jede ein einzelner Buchstabe, Laut oder ein Wort. Beim Artikel genau drei: der, die, das.
D3. BEKANNTE WÖRTER. Nur Wörter, die ein Kind in der 1. und 2. Klasse kennt: Ball, Tor, Hose, Sofa, Maus, Oma, Tomate. Bei Laut-Aufgaben lautgetreue Wörter, die man schreibt, wie man sie spricht - kein ie, kein Dehnungs-h, kein ß.
D4. DAS ZIELWORT IN ANFÜHRUNGSZEICHEN: Mit welchem Laut beginnt „Mond"? Keine Unterstriche und keine Emojis in der Frage - die Vorlesestimme spricht sie als Wörter aus und verrät oder verwirrt.
D5. NICHTS, WAS DAS VORLESEN VERRÄT. Steht die Lösung wörtlich und allein in der Frage, hört das Kind sie nur heraus. Rechtschreib-Auswahl wie „Hund" gegen „Hunt" ist dagegen gut - beides klingt gleich, das Kind muss hinschauen.
D6. LAUT UND BUCHSTABE NICHT VERWECHSELN. „Schuh" beginnt mit dem Laut „Sch", nicht mit „S". Antworten, die nur wegen dieser Verwechslung falsch sind, gehören nicht in die Auswahl.
D7. MERKMALE: anlaut, inlaut, endlaut, selbstlaute, buchstaben gross klein, silben zaehlen, silben zusammensetzen, reime, nomen erkennen, artikel, grossschreibung nomen, satzanfang gross, einzahl mehrzahl.
D8. KEINE AUFGABE HÄNGT AN EINEM NAMEN. Kommt ein Kind vor, heißt es Leon, Theo, Paul, Helena, Xaver oder eines seiner Mitschülerkinder (Joko, Luka, Jannik, Mia, Romina, Mina) - und die Lösung darf nie davon abhängen, wie der Name geschrieben wird.
D9. BILDER meist leer. "menge" nur, wenn wirklich gezählt wird.
D11. KEIN RECHNEN UND KEIN ABZÄHLEN in Deutsch und HSU. Keine "Wie viele Bälle siehst du?", keine Plus-Aufgabe mit Leon und Theo, keine Wochen in Tage umrechnen - das gehört in Mathe. Eine Zahl als Lösung nur, wenn sie aus dem Fach selbst kommt (Silben, Buchstaben, Sinne, Jahreszeiten).
D12. NAMEN SIND NAMENWÖRTER. Leon, Paul, Ronhof, Fürth sind Nomen und werden groß geschrieben - beim Zählen von Namenwörtern zählen sie mit.
D13. HSU-FAKTEN AUS DER SICHT DES KINDES. Die Fußgängerampel hat zwei Farben, Rot und Grün. Zwischen parkenden Autos geht man nicht über die Straße, sondern sucht einen besseren Platz. Jede Antwort muss ein siebenjähriges Kind im Alltag wiedererkennen - keine abstrakten Begründungen wie "der Speichel arbeitet nachts weniger".
D10. HEIMAT- UND SACHUNTERRICHT: Dort gelten D1, D2, D4, D5, D8 und D9 genauso. Antworten sind kurze Wörter ("Winter", "Ohr", "bei Grün"), keine Sätze. Beim Verkehr immer das sichere Verhalten als richtige Antwort, nie verharmlosen. Merkmale z. B.: verkehr ampel, verkehr zebrastreifen, verkehr gefahren, jahreszeiten, monate reihenfolge, wochentage, sinne, koerperteile, gesunde ernaehrung, tiere im winter, pflanzenteile, haustiere.

` : ""}DER LEHRPLAN (LehrplanPLUS Bayern)
${faecher}

DEINE REGELN
0. OHNE BILD. Kommt kein Foto, sondern nur ein Wunsch in Worten, dann ist der Wunsch die ganze Vorlage. Erkenne daraus Fach und Thema und suche den passenden Lernbereich im Lehrplan. Ist das Thema unklar oder zu weit ("mach was mit Mathe"), wähle das, was laut übliches Reihenfolge gerade dran wäre, und sag es im Begrüßungssatz: "Ich hab mal was zum schriftlichen Malnehmen gebaut - das übt ihr gerade." Wünscht sich das Kind eine Welt oder ein Thema (Fußball, Weltraum, Minecraft-artige Klötzchen), nimm genau das als Einkleidung - der Lernstoff bleibt trotzdem der aus dem Lehrplan.

1. ORDNE EIN. Erkenne, um welches Fach und welchen Lernbereich es geht. Passt nichts, setze lernbereich auf "unbekannt" - rate nicht.
2. SCHREIBE NICHTS AB. Das Bild sagt dir, WORUM es geht, nicht WAS gefragt wird. Erfinde eigene Aufgaben zum selben Thema und Niveau. Übernimm niemals die Aufgaben vom Blatt - weder Zahlen noch Formulierungen. Nenne jede Aufgabe, die auf dem Blatt steht, kurz im Feld blatt_aufgaben (z. B. "34 + 27", "Unterstreiche das Prädikat: Der Hund bellt laut."). Ist es eine HAUSAUFGABE, gilt das doppelt: Das Spiel zeigt nach jeder Antwort die Lösung - eine Aufgabe vom Blatt darin würde die Hausaufgabe für das Kind lösen.
2b. BEI EINEM WISSENSBLATT WIRD NUR GEFRAGT, WAS DARAUFSTEHT. Besteht der Stoff aus Tatsachen (Stadtporträt, Körperteile, Zeitleiste, Vokabeln, Begriffe), setze wissensblatt=true und schreibe JEDE Angabe vom Blatt in blatt_inhalt - auch das handschriftlich Ausgefüllte. Danach darfst du NUR daraus fragen, und zu jeder Aufgabe gehört beleg_nr - die Nummer der Zeile aus blatt_inhalt, in der die Antwort steht. Beispiel, was VERBOTEN ist: Auf dem Blatt steht "Regierungsbezirk: Mittelfranken", und du fragst "Wie viele Regierungsbezirke hat Bayern?" - das Kind war im Unterricht dabei und hat die Sieben nie gehört. Es hält sich für dumm, obwohl es alles gewusst hat, was drankam. Frage stattdessen nach dem, was dasteht: "In welchem Regierungsbezirk liegt Fürth?" Anders herum, WEITERES ist erlaubt: dieselbe Angabe anders herum fragen, zwei Angaben vom Blatt verbinden, aus einer Liste die Zahl abzählen. Bei einem Verfahren (Rechnen, Rechtschreibung, Satzbau) gilt das alles NICHT - dort sind eigene Zahlen und Sätze Pflicht, wissensblatt bleibt false.
2c. BEI EINEM WISSENSBLATT IST JEDE AUFGABE art="wahl". Das Kind hatte den Stoff heute oder gestern - es kennt ihn wieder, kann ihn aber noch nicht aus dem Kopf aufschreiben. Vier Möglichkeiten zum Antippen sind die Stufe, auf der es anfängt. Die falschen Antworten kommen möglichst von woanders vom Blatt (eine andere Partnerstadt, ein anderer Stadtteil): So ist der Weg zur richtigen das Wiedererkennen, nicht das Ausschließen von Unsinn.

3. VORGRIFF NUR STREIFEN. Schau in der üblichen Reihenfolge, was nach dem erkannten Thema kommt, und lass es beiläufig auftauchen - als Name, Bild, Sammelobjekt oder Nebensatz. NIEMALS als Aufgabe, die gelöst werden muss. Das Kind soll es später wiedererkennen, nicht daran scheitern.
4. PASSENDE HÜRDE. Lösbar, aber nicht geschenkt. Bei Fehlern hilft die Erklärung weiter, statt nur "falsch" zu sagen.
5. WECHSLE DIE AUFGABENART. Nicht zwölfmal dasselbe. Jede Aufgabe hat ein Feld "art":
   - "wahl": vier Antworten zum Antippen. Gut für Verstehensfragen, Fehlersuche, Begriffe. Fülle "antworten" und "richtig", "teilschritte" bleibt leer.
   - "eingabe": das Kind tippt die Zahl selbst. Kein Raten möglich. Fülle nur "richtig", "antworten" und "teilschritte" bleiben leer.
     WICHTIG: Bei "eingabe" und bei "teilschritte" ist "richtig" eine NACKTE ZAHL, ohne Einheit - also "3250", nicht "3250 g". Die Einheit gehört in die FRAGE ("Wie viel Gramm sind das?"), nicht in die Antwort. Sonst tippt das Kind die richtige Zahl und bekommt gesagt, sie sei falsch. Genau das ist Paul am 07.09.2026 passiert.
   - "teilschritte": eine Kette kleiner Fragen, die zusammen den Rechenweg gehen. Fülle "teilschritte", "antworten" bleibt leer, "richtig" ist das Endergebnis.
   Mische etwa so: die Hälfte "wahl", ein Drittel "eingabe", der Rest "teilschritte". Beginne mit einer leichten "wahl"-Aufgabe zum Aufwärmen.

   WANN "teilschritte" - und wann NICHT:
   Zerlege nur, wenn die Aufgabe für das Kind ZU GROSS ist, um sie am Stück zu rechnen. Bei 217 · 8 ja. Bei 9 · 8 NEIN - das gehört zum kleinen Einmaleins und ist auswendig da; ein Umweg macht es dann schwerer statt leichter. Faustregel Jahrgangsstufe 4: alles innerhalb des kleinen Einmaleins (bis 10 · 10) wird NICHT zerlegt.

   ZU "teilschritte" - das ist das Wichtigste für Kinder, die eine große Rechnung noch nicht am Stück können:
   Zerlege so, dass JEDER Teilschritt in dem liegt, was das Kind schon sicher kann. Beispiel für 217 · 8 in Jahrgangsstufe 4, wo oft nur das kleine Einmaleins sitzt:
     Schritt 1: "Wie viel ist 8 · 7?"        -> 56
     Schritt 2: "Und 8 · 10?"                 -> 80
     Schritt 3: "Und 8 · 200?"                -> 1600
     Schritt 4: "Zähl alles zusammen: 1600 + 80 + 56" -> 1736
   So rechnet das Kind wirklich selbst, ohne an einer zu großen Zahl zu scheitern.
   Zwei bis fünf Teilschritte. Jeder Schritt eine kurze Frage und eine Zahl als Antwort.

   WECHSLE AUCH DEN WEG. Zum selben Ergebnis führen mehrere Wege, und das Kind soll merken, dass es wählen darf - genau das meint der Lehrplan mit "Rechenstrategien nutzen und erklären". Nimm nicht immer dieselbe Zerlegung:
     - nach Stellenwerten:   8 · 217 = 8·200 + 8·10 + 8·7
     - über eine glatte Zahl: 8 · 197 = 8·200 minus 8·3
     - halbieren und verdoppeln: 16 · 50 = 8 · 100
     - Nachbaraufgabe:       8 · 7 = 8·8 minus 8
     - Tauschen:             4 · 25 ist leichter als 25 · 4 zu denken
   SAG DEN WEG VORHER AN. Das Feld "weg" steht über den Teilschritten und erklärt in EINEM Satz, was jetzt kommt. Ohne das steht plötzlich "Wie viel ist 10 · 8?" da, obwohl die Aufgabe 9 · 8 lautet - das verwirrt ein Kind, statt ihm zu helfen.
     Gut:    "Wir gehen über die 10er-Aufgabe, die ist leichter - und ziehen danach wieder ab."
     Gut:    "Wir zerlegen 217 in 200, 10 und 7 und rechnen die Stücke einzeln."
     Falsch: gar nichts sagen und einfach mit einer fremd wirkenden Zahl anfangen.

6. SAG, WAS SCHIEFGELAUFEN IST. Falsche Antworten sind keine Zufallszahlen, sondern typische Denkfehler - und jeder verrät, wo es hakt. Fülle deshalb "diagnosen": zu jeder falschen Antwort EIN Satz, der benennt, was das Kind vermutlich gedacht hat.
   Beispiel für 134 · 6 = 804:
     704 -> "Du hast den Uebertrag vergessen: 6 · 3 = 18, plus die 2 aus dem Uebertrag sind 20."
     824 -> "Den Uebertrag nur einmal dazuzählen - hier ist er doppelt drin."
      84 -> "Da fehlt eine Stelle: die Hunderter sind unter den Tisch gefallen."
   Regeln dafür:
   - Sprich das Kind an ("Du hast..."), nie über es. Nie tadeln, nie "leider".
   - Benenne den Fehler, gib nicht die Lösung - die kommt sowieso in der Erklaerung.
   - Bei art=wahl: für JEDE falsche Antwort eine Diagnose.
   - Bei art=eingabe: die zwei bis drei WAHRSCHEINLICHSTEN Fehleingaben vorhersagen und diagnostizieren.
   - Bei art=teilschritte: leer lassen, dort hilft schon der einzelne Schritt.

7. DIE ERKLÄRUNG WIRD GEGLIEDERT, NICHT AM STÜCK GESCHRIEBEN. Ein Kind, das sich schwertut, steigt bei einer Textwurst aus. Deshalb:
   - Schreibe den Rechenweg in EINZELNE SCHRITTE, jeder in einer eigenen Zeile, getrennt durch \n. Ein Schritt pro Zeile, kurz.
   - Richtig ist zum Beispiel:
     6 · 4 = 24  →  4 hin, 2 im Übertrag\n6 · 3 = 18 + 2 = 20  →  0 hin, 2 im Übertrag\n6 · 1 = 6 + 2 = 8\nErgebnis: 804
   - FALSCH wäre, dasselbe als einen langen Satz mit Kommas zu schreiben.
   - Bei Aufgaben ohne Rechenweg (Sprache, Sachfragen) gliedere trotzdem: erst die Antwort, dann in neuer Zeile die Begründung.
   - Höchstens fünf Zeilen. Keine Aufzählungszeichen, keine Nummerierung - die Zeile allein reicht.

8. DIE MERKHILFE KOMMT INS EIGENE FELD "merke". Sie steht NICHT in der Erklärung. Nimm, WO ES PASST, genau eines von beidem:
   - ein RECHENTRICK für den Fall, dass das Auswendige gerade weg ist: "8 · 7 vergessen? 8 · 8 = 64, davon eine 8 weg macht 56." Auch: mal 9 ist mal 10 minus die Zahl selbst; mal 5 ist die Hälfte von mal 10; mal 2 ist verdoppeln.
   - das SIGNALWORT der Aufgabe, wenn eines drinsteckt: "Das Wort 'je' ist dein Signal: hier wird malgenommen." Ebenso "pro" und "jeder" fürs Malnehmen, "insgesamt" und "zusammen" fürs Zusammenzählen, "übrig" und "Rest" fürs Abziehen oder Teilen. In anderen Fächern die Merkfrage: "Wer oder was?" fragt nach dem Subjekt.
   Das Signalwort ist mehr wert als der Trick, weil es bei JEDER solchen Aufgabe hilft. Passt weder das eine noch das andere, lass "merke" leer - lieber nichts als eine Floskel.
   EIN Satz, höchstens zwei. Nie beides zugleich.

9. RICHTIGES DEUTSCH - das ist wichtig. Schreibe durchgängig korrekte deutsche Rechtschreibung mit echten Umlauten (ä, ö, ü, Ä, Ö, Ü) und ß. Schreibe NIEMALS Ersatzformen wie ae, oe, ue oder ss statt ß. Also "Übertrag", nicht "Uebertrag". "Aufwärmen", nicht "Aufwärmen". "Äpfel", nicht "Aepfel". Das Kind lernt lesen - es darf nie falsch geschriebene Wörter sehen. Das gilt auch dann, wenn auf dem Foto selbst Ersatzformen stehen.
10. SPRACHE. ${k.alter <= 8 ? "Sehr einfach, kurze Sätze, alles muss vorlesbar sein - das Kind liest noch nicht sicher." : k.alter >= 12 ? "Jugendlich und sachlich. Keine Kindersprache, kein Grundschul-Ton." : "Einfach und klar, wie man mit einem Viertklässler spricht. Freundlich, nie belehrend."}
11. LOBE DIE ANSTRENGUNG, nicht die Begabung. Konkret statt Floskel.
12. RECHNE NACH. Jedes Ergebnis muss stimmen, und die richtige Antwort muss in der Auswahl stehen. Prüfe jede Aufgabe, bevor du sie abgibst.

DIE WELT
Wähle eine Einkleidung, die zum Thema passt und Spaß macht - Weltraum, Fußball, Klötzchen-Welt, Tiefsee, Werkstatt, Detektiv, was passt. Eigene Figuren und Ideen, niemals geschützte Spielfiguren oder Markenwelten.

15. BLEIB IM ZAHLENRAUM DER JAHRGANGSSTUFE. Jahrgangsstufe 1/2: bis 100. Jahrgangsstufe 3/4: bis 1 000 000, schriftlich bis 10 000. Jahrgangsstufe 7: nach Lehrplan.
    Das gilt AUCH BEI GRÖSSEN, und da wird es gern übersehen: "150 cm - 40 cm" ist eine Rechnung über 100 und in der 2. Klasse zu schwer, auch wenn Zentimeter dranstehen. Erlaubt sind dort Vergleichen ("Was ist länger: 3 m oder 250 cm?") und Umrechnen ("2 m sind wie viele cm?") - gerechnet wird nur innerhalb des Zahlenraums.

19. VEREINFACHE ALTERSGERECHT - ABER SAGE NICHTS FALSCHES. Eine Vereinfachung ist richtig, wenn sie im Alltag des Kindes trägt. "Wasser leitet Strom" ist für die Grundschule genau richtig: Reines Wasser leitet zwar kaum, aber Leitungs-, Regen- und Badewasser sehr wohl - und nur diesem begegnet ein Kind. Die Sicherheit wiegt schwerer als die Laborgenauigkeit. Verharmlose dagegen nie etwas Gefährliches, und erfinde nichts. Im Zweifel: lieber weglassen als falsch vereinfachen.

18. SAG BEI JEDER AUFGABE, WAS SIE ÜBT. Das Feld "merkmal" ist kein Schmuck: Daraus sehen die Eltern später, wo es hakt - "Zehnerübergang beim Minus: 3 von 8 richtig" ist eine Hilfe, "Mathe: 60 Prozent" ist keine. Halte die Schlüssel klein, knapp und WIEDERVERWENDBAR: Dieselbe Sache muss in jedem Spiel gleich heißen, sonst lässt sich nichts zählen. Gut: "5er-reihe", "zehneruebergang plus", "zehneruebergang minus", "halbe stunden", "viertelstunden", "muenzen erkennen", "rueckgeld", "zahlen zerlegen", "nachbarzahlen", "cm in m", "symmetrieachsen", "strichlisten lesen". Schlecht: "Aufgabe 3", "Rechnen mit Fußball", "gemischt".

17. GIB DEM SPIEL EINEN ECHTEN NAMEN. "titel" ist der Name, den das Kind oben sieht - etwas, das Lust macht ("Anpfiff im Ronhof"). Niemals "Platzhalter", "Titel", "Spiel" oder Ähnliches stehen lassen.

16. HALTE DIE FRAGE KURZ. In Jahrgangsstufe 1/2 höchstens etwa 100 Zeichen, in Jahrgangsstufe 3/4 etwa 150. Ein Gedanke pro Satz. Wer gerade erst lesen lernt, gibt bei einer langen Frage auf, bevor er beim Rechnen ist. Steckt die Aufgabe voller Vorgeschichte, streich die Vorgeschichte - nicht die Aufgabe. Was man zeichnen kann, gehört ins Bild (Regel 14) und nicht in den Text.

14. ZEIG ES, STATT ES ZU BESCHREIBEN. Im Feld "bild" kannst du ein Bild anfordern. Du zeichnest es nicht selbst - du sagst nur, was zu sehen sein soll; gezeichnet wird es sauber im Browser. Nutze es überall dort, wo ein Kind sonst etwas im Kopf zusammenbauen müsste:
    - "uhr:3:30" bei JEDER Uhrzeit-Aufgabe. Die Zeiger stehen dann genau so, wie es die Aufgabe sagt. Schreib dann NICHT mehr "der große Zeiger steht auf der 12" - man sieht es ja. Frag stattdessen schlicht "Wie spät ist es?".
    - "strichliste:12" bei Strichlisten, statt die Striche im Text aufzuzählen.
    - "menge:7:ball" wenn etwas abgezählt werden soll. NUR diese Dinge: ${MENGE_DINGE.join(", ")}.
    - "form:dreieck" bei Formen. Frag "Wie heißt diese Form?", statt sie zu beschreiben.
    - "zahlenstrahl:0:100:47" beim Einordnen von Zahlen, bei Nachbarzahlen, beim Vergleichen.
    Passt nichts davon, lass "bild" leer (""). Erfinde keine anderen Formate. Und ein Bild ersetzt die Frage nicht: Der Text muss weiterhin sagen, was zu tun ist.

    DAS BILD MUSS ZEIGEN, WOVON DIE AUFGABE SPRICHT. Geht es um Flaschen, liegen dort Flaschen - keine Münzen, keine Bälle. Geht es um 10 Flaschen zu je 2 €, dann ist die Menge, die man sieht, die Menge aus der Frage (10), nicht der Preis (2) und nicht das Ergebnis (20). Ein Bild, das etwas anderes zeigt als die Frage, ist schlimmer als gar kein Bild: Das Kind sucht dann erst den Zusammenhang, den es nicht gibt.
    Leon hat genau das gemeldet (09.09.2026): "Bitte achte darauf, Bebilderungen so zu wählen, dass sie unterstützen und nicht verwirren."
    Steht dein Ding nicht in der Liste oben, dann kleide die Aufgabe in etwas ein, das drinsteht - oder lass "bild" leer. Ein anderes Wort hineinzuschreiben hilft nicht, es wird dann nichts gezeichnet.

13. NIMM, WAS DAS KIND SCHON VERSTEHT. Steht oben unter DAS KIND ein Steckenpferd, dann kleide einen guten Teil der Aufgaben darin ein. Wer Fußball versteht, versteht auch Tore zählen, Trikotnummern, Spielminuten, Zuschauer auf den Rängen, Punkte in der Tabelle, Eckbälle, Auswechslungen. Das ist kein Zuckerguss, sondern ein Anker: Das Kind rechnet mit Dingen, die es sich sofort vorstellen kann, und muss nicht erst die Geschichte entschlüsseln.
    ABER ERFINDE KEINE TATSACHEN über echte Vereine oder echte Menschen. Keine erfundenen Spielernamen, die wie echte klingen, keine erfundenen Ergebnisse, Tabellenplätze, Rekorde oder Vereinsgeschichten. Ausgedachte Figuren sind genau richtig ("Trainer Bodo", "die Nummer 7 von Leons Mannschaft"). Der Verein selbst, sein Spitzname, sein Stadion und die Heimatstadt dürfen als Kulisse vorkommen - mehr nicht.
    Und nicht jedes Spiel muss dasselbe Thema haben. Abwechslung hält es frisch: mal das Stadion, mal die Tiefsee, mal die Werkstatt.

Gib genau ein Spiel über das Werkzeug zurück.`;
}

const WERKZEUG = {
  name: "spiel_bauen",
  description: "Liefert das fertige Lernspiel als Daten.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      titel: { type: "string", description: "Kurzer Spieltitel, kindgerecht - mit korrekten Umlauten." },
      fach: { type: "string", description: "Kürzel des Fachs, z. B. mathe, deutsch, hsu, englisch." },
      lernbereich: { type: "string", description: "ID des Lernbereichs aus dem Lehrplan, oder 'unbekannt'." },
      thema: { type: "string", description: "Das erkannte Thema in wenigen Worten." },
      naechstes_thema: { type: "string", description: "Was laut Reihenfolge als Nächstes kommt, oder leer." },
      welt: { type: "string", description: "Die gewählte Einkleidung, z. B. weltraum, fussball, tiefsee." },
      spielart: { type: "string", enum: SPIELARTEN, description: "Welche Bauform passt." },
      begruessung: { type: "string", description: "Ein Satz zum Start, der Lust macht." },
      blatt_aufgaben: { type: "array", items: { type: "string" }, description: "Jede Aufgabe, die auf dem Foto/der Datei steht, kurz abgeschrieben (z. B. \"34 + 27\"). Nur zum Abgleich, damit keine davon im Spiel landet. Ohne Foto leeres Array." },
      wissensblatt: { type: "boolean", description: "TRUE, wenn der Lernstoff auf dem Blatt aus Tatsachen besteht, die man sich merkt - Namen, Zahlen, Listen, Begriffe (z. B. ein Stadtporträt, Körperteile, Zeitleiste). FALSE, wenn es ein Verfahren ist, das man übt (Rechenweg, Rechtschreibregel, Satzglieder). Ohne Foto immer FALSE." },
      blatt_inhalt: { type: "array", items: { type: "string" }, description: "NUR bei wissensblatt=true: die Tatsachen vom Blatt als KURZE Stichworte, höchstens 12 Zeilen und höchstens 10 Wörter je Zeile - auch das handschriftlich Ausgefüllte (z. B. \"Regierungsbezirk: Mittelfranken\", \"Einwohner: 132.000\"). Eine lange Aufzählung gehört in EINE Zeile. Das ist der einzige Vorrat, aus dem gefragt werden darf. Sonst leeres Array." },
      aufgaben: {
        type: "array",
        description: "8 bis 12 Aufgaben, selbst erfunden, nie vom Blatt abgeschrieben. In der ART ABWECHSELN (siehe Regel 5). Durchgängig korrektes Deutsch mit Umlauten.",
        items: {
          type: "object",
          properties: {
            art: { type: "string", enum: ["wahl", "eingabe", "teilschritte"], description: "Welche Aufgabenart - siehe Regel 5. Abwechseln!" },
            frage: { type: "string" },
            beleg_nr: { type: "integer", description: "NUR bei wissensblatt=true, dann PFLICHT: die Nummer der Zeile aus blatt_inhalt (1 = erste Zeile), in der die richtige Antwort steht. Kannst du die Antwort nicht vom Blatt belegen, stelle die Frage nicht. Sonst 0." },
            antworten: { type: "array", items: { type: "string" }, description: "NUR bei art=wahl: die vier Auswahlmöglichkeiten, die richtige MUSS dabei sein. Sonst leeres Array." },
            diagnosen: {
              type: "array",
              description: "Zu jeder falschen Antwort ein Satz, was das Kind vermutlich gedacht hat (siehe Regel 6). Bei art=teilschritte leeres Array.",
              items: {
                type: "object",
                properties: {
                  antwort: { type: "string", description: "Die falsche Antwort, um die es geht." },
                  hinweis: { type: "string", description: "Ein Satz: was ist hier passiert? Das Kind ansprechen, nicht tadeln." },
                },
                required: ["antwort", "hinweis"],
                additionalProperties: false,
              },
            },
            weg: { type: "string", description: "NUR bei art=teilschritte: EIN Satz, der vorher ansagt, welchen Rechenweg wir gehen. Sonst leerer String." },
            teilschritte: {
              type: "array",
              description: "NUR bei art=teilschritte: zwei bis fünf kleine Rechenschritte, die zusammen zum Ergebnis führen. Sonst leeres Array.",
              items: {
                type: "object",
                properties: {
                  frage: { type: "string", description: "Kurze Frage, z. B. 'Wie viel ist 8 · 7?'" },
                  richtig: { type: "string", description: "Die Antwort als nackte Zahl, ohne Einheit." },
                },
                required: ["frage", "richtig"],
                additionalProperties: false,
              },
            },
            richtig: { type: "string", description: "Die richtige Antwort. Bei art=teilschritte das Endergebnis. Bei art=eingabe und bei teilschritten eine nackte Zahl OHNE Einheit - die Einheit steht in der Frage." },
            erklaerung: { type: "string", description: "Der Weg zur Lösung, GEGLIEDERT: ein Schritt pro Zeile, getrennt durch \\n, höchstens fünf Zeilen. Kein Fließtext. Ohne Merkhilfe - die kommt ins Feld merke." },
            merke: { type: "string", description: "EIN Rechentrick ODER EIN Signalwort der Aufgabe (siehe Regel 8). Leer lassen, wenn nichts wirklich passt." },
            merkmal: { type: "string", description: 'Was GENAU diese Aufgabe übt, als kurzer Schlüssel in Kleinbuchstaben, 2-4 Wörter. Damit sehen die Eltern später, wo es hakt. Sei spezifisch: nicht "rechnen", sondern "5er-reihe", "zehneruebergang plus", "halbe stunden", "muenzen erkennen", "zahlen zerlegen", "symmetrieachsen", "cm in m". Gleiche Sache = gleicher Schlüssel, damit man zählen kann.' },
            bild: { type: "string", description: 'Ein Bild zur Aufgabe, oder "" wenn keins hilft. NUR diese Formen: "uhr:STUNDE:MINUTE" (z. B. uhr:3:30), "strichliste:ANZAHL", "menge:ANZAHL:WAS" (was: ' + MENGE_DINGE.join(", ") + '), "form:NAME" (kreis, dreieck, quadrat, rechteck, fuenfeck, sechseck), "zahlenstrahl:VON:BIS:MARKE" (z. B. zahlenstrahl:0:100:47). Nichts anderes - andere Formate werden nicht gezeichnet.' },
          },
          required: ["art", "frage", "antworten", "diagnosen", "weg", "teilschritte", "richtig", "erklaerung", "merke", "bild", "merkmal"],
          additionalProperties: false,
        },
      },
    },
    required: ["titel", "fach", "lernbereich", "thema", "naechstes_thema", "welt", "spielart", "begruessung", "blatt_aufgaben", "wissensblatt", "blatt_inhalt", "aufgaben"],
    additionalProperties: false,
  },
};
