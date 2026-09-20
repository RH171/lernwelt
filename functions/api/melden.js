// Ein Gespräch zwischen Kind und Werkstatt.
//
// Paul meldet nicht nur - er bekommt Antwort, kann nachfragen, und sagt am
// Ende selbst, ob es passt. Ein "Danke" wäre eine Sackgasse: Das Kind
// erführe nie, ob und wie sein Hinweis ankam.
//
// POST   /api/melden                  -> neuer Faden (Kind)
// POST   /api/melden {id, text}       -> Antwort im Faden (Kind ODER Eltern)
// GET    /api/melden                  -> alle Fäden (Eltern)
// GET    /api/melden?meine=1&kind=... -> eigene Fäden (Kind)
// GET    /api/melden?bild=<id>        -> ein Bild
// POST   /api/melden {id, status}     -> "passt jetzt" (Kind) / erledigt (Eltern)
// DELETE /api/melden?id=...           -> wegräumen (Eltern)

import { ausweisGueltig, geheimFuer, brauchtAusweis } from "./_riegel.js";
import { antwortErzeugen } from "./_antwort.js";

// Damit ein offener Bereich nicht zur Kostenfalle wird: hoechstens so viele
// sofortige Antworten je Kind. Danach bleibt die Meldung normal liegen - nur
// ohne Sofortantwort.
//
// Helena am 14.09.2026 (v4534cdwsc): "Bitte repariere die Seite, sodass nicht
// immer nur die gleiche Antwort kommt." Sie hatte recht, und die Ursache stand
// genau hier: Am 14.09. zwischen 13:22 und 13:43 hat sie ein echtes Gespraech
// gefuehrt - Frage, Antwort, Nachfrage, zehn Runden lang - und ab 13:44 stand
// der Stundenzaehler auf zwoelf. Danach kam fuenfmal hintereinander derselbe
// Satz, wortgleich, jedes Mal in derselben Sekunde wie ihre Nachricht. Fuer sie
// sah das aus wie eine kaputte Seite, und das war es aus ihrer Sicht auch.
//
// Zwoelf ist fuer ein Gespraech zu wenig. Die Stundengrenze steht darum auf 25;
// dafuer gibt es jetzt zusaetzlich eine TAGESGRENZE, die es vorher gar nicht
// gab. Unterm Strich kann ein Kind damit weniger Antworten am Tag ausloesen als
// vorher (80 statt 12*24), das Gespraech reisst aber nicht mehr mittendrin ab.
const ANTWORTEN_PRO_STUNDE = 25;
const ANTWORTEN_PRO_TAG = 80;

// Gibt zurueck, WARUM nicht - der Unterschied ist fuer das Kind wichtig.
// "ok" | "stunde" | "tag"
//
// Beide Zaehler stehen ABSICHTLICH in EINEM Schluessel. Im KV ist nicht der
// Platz knapp, sondern die Zahl der Schreibvorgaenge am Tag - und die sind am
// 14.09.2026 tatsaechlich ausgegangen, danach nahm der Speicher stundenlang
// nichts mehr an. Zwei Schluessel waeren zwei Schreibvorgaenge je Nachricht
// gewesen; so bleibt es bei einem, genau wie vor der Tagesgrenze.
const ZAEHLER = (kind) => "antwortzaehler:" + kind;

async function darfAntworten(env, kind) {
  const jetzt = new Date();
  const stunde = jetzt.toISOString().slice(0, 13);
  const tag = jetzt.toISOString().slice(0, 10);

  let z = {};
  try { z = JSON.parse((await env.PAUL_KV.get(ZAEHLER(kind))) || "{}") || {}; } catch (e) {}
  const inDerStunde = z.stunde === stunde ? Number(z.n) || 0 : 0;
  const amTag = z.tag === tag ? Number(z.m) || 0 : 0;

  if (amTag >= ANTWORTEN_PRO_TAG) return "tag";
  if (inDerStunde >= ANTWORTEN_PRO_STUNDE) return "stunde";

  try {
    await env.PAUL_KV.put(ZAEHLER(kind),
      JSON.stringify({ stunde, n: inDerStunde + 1, tag, m: amTag + 1 }),
      { expirationTtl: 172800 });
  } catch (e) {}
  return "ok";
}

// Wie viele Minuten noch, bis die Stundengrenze weiterzaehlt? Bewusst als
// Minuten und nicht als Uhrzeit: der Zaehler laeuft nach UTC, eine Uhrzeit
// waere auf dem Handy der Kinder um zwei Stunden falsch. Minuten stimmen immer.
function minutenBisZurNaechstenStunde() {
  const j = new Date();
  return Math.max(1, 60 - j.getUTCMinutes());
}

// Wenn keine echte Antwort zustande kam, darf wenigstens nicht zweimal
// dasselbe dastehen. Das Kind soll sehen: da ist etwas passiert, und zwar
// etwas anderes als beim letzten Mal.
function ersatzText(grund, faden) {
  // Wie viele Ersatzantworten AUS DEMSELBEN GRUND stehen am Stueck am Ende des
  // Fadens? Danach richtet sich die Wortwahl. Gezaehlt wird nur die laufende
  // Serie: kam dazwischen eine richtige Antwort oder ein anderer Grund, faengt
  // die Zaehlung wieder bei null an - sonst bliebe bei einem langen Faden immer
  // dieselbe letzte Variante stehen, und genau das war ja Helenas Beschwerde.
  let schon = 0;
  const v = faden.verlauf || [];
  for (let i = v.length - 1; i >= 0; i--) {
    if (v[i].von !== "werkstatt") continue;
    if (!v[i].automatisch || v[i].grund !== grund) break;
    schon++;
  }
  // Umlaufend, nicht anhaltend: nach der letzten Variante geht es wieder bei
  // der ersten los. Zweimal hintereinander derselbe Satz kann so nicht mehr
  // vorkommen, egal wie lange es hakt.
  const wahl = (f) => f[schon % f.length];

  if (grund === "stunde") {
    const min = minutenBisZurNaechstenStunde();
    const wann = min === 1 ? "In einer Minute" : "In etwa " + min + " Minuten";
    const varianten = [
      "Ich muss kurz Luft holen. \u23f3\n\n" +
        "Wir haben in dieser Stunde schon richtig viel hin und her geschrieben, " +
        "und mehr Antworten am Stueck schafft die Werkstatt gerade nicht. " +
        wann + " kann ich dir wieder richtig antworten.\n\n" +
        "Deine Nachricht ist da und geht nicht verloren. Schreib ruhig weiter \u2013 " +
        "ich lese alles, sobald es wieder geht.",
      "Immer noch Pause, tut mir leid. \ud83d\ude14\n\n" +
        "Das liegt nicht an dir und auch nicht an deiner Nachricht: Ich darf pro " +
        "Stunde nur eine bestimmte Zahl Antworten schreiben, und die ist gerade " +
        "aufgebraucht. " + wann + " geht es weiter.\n\n" +
        "Alles, was du bis dahin schreibst, steht nachher trotzdem hier.",
      "Ich bin noch in der Zwangspause. \u23f3 " + wann + " bin ich wieder da.\n\n" +
        "Du musst nichts noch einmal schreiben \u2013 dein Faden ist vollstaendig, " +
        "ich lese ihn von oben, wenn es weitergeht.",
    ];
    return wahl(varianten);
  }

  if (grund === "tag") {
    return "Fuer heute ist mein Antwort-Vorrat leer. \ud83c\udf19\n\n" +
      "Wir haben heute wirklich viel geschrieben. Morgen kann ich dir wieder " +
      "antworten \u2013 und deine Nachricht liegt bis dahin sicher in der " +
      "Werkstatt, sie geht nicht verloren.";
  }

  // Kein Zaehler, sondern wirklich eine Stoerung.
  const varianten = [
    "Angekommen! \u2705 Deine Meldung liegt in der Werkstatt.\n\n" +
      "Gerade ist bei mir etwas schiefgegangen, darum kann ich dir nicht " +
      "gleich richtig antworten. Deine Nachricht ist trotzdem da. " +
      "Schau spaeter nochmal in diesen Faden.",
    "Schon wieder ich mit derselben Panne \u2013 entschuldige. \ud83d\udd27\n\n" +
      "Bei mir hakt etwas, und ich bekomme keine richtige Antwort zusammen. " +
      "Das ist mein Fehler, nicht deiner. Deine Nachrichten sind alle da und " +
      "werden gelesen.",
    "Es hakt immer noch bei mir. \ud83d\udd27\n\n" +
      "Schreib bitte nicht noch einmal dasselbe \u2013 alles ist angekommen. " +
      "Sobald es wieder laeuft, findest du die Antwort hier im Faden.",
  ];
  return wahl(varianten);
}

// Die Werkstatt antwortet selbst - im selben Aufruf, damit das Kind die
// Antwort sofort sieht. Schlaegt es fehl (kein Schluessel, Modell nicht
// erreichbar, Grenze erreicht), bleibt wenigstens die Eingangsbestaetigung.
async function sofortAntworten(env, faden, kind, text, bild, bilder) {
  const nr = faden.verlauf.length;
  let antwort = null;
  const grund = await darfAntworten(env, kind);
  if (grund === "ok") {
    antwort = await antwortErzeugen(env, {
      kind, text, bild, bilder, seite: faden.seite, geraet: faden.geraet, art: faden.art,
      verlauf: faden.verlauf.slice(0, -1),
    });
  }
  // Hausaufgaben bekommen ihren Titel aus der ersten Antwort: "📌 Mathe - Zahlen
  // bis 1000". Denny am 18.09.2026: "Kannst Du hier den Titel für die Hausaufgaben
  // bitte immer entsprechend zum Fach und Aufgabe betiteln." In der Liste stand
  // sonst bei jeder Hausaufgabe derselbe Satz ("Ich habe das Blatt fertig gelöst").
  let text2 = antwort;
  if (antwort && faden.art === "hausaufgabe") {
    const kopf = antwort.match(/^\s*📌\s*([^\n]{3,70})\n+/);
    if (kopf) {
      faden.titel = kopf[1].trim();
      text2 = antwort.slice(kopf[0].length);
    }
  }
  const eintrag = antwort
    ? { von: "werkstatt", text: text2, zeit: new Date().toISOString(),
        hatBild: false, nr, vonKi: true }
    : { von: "werkstatt", nr, hatBild: false, zeit: new Date().toISOString(),
        automatisch: true, grund: grund === "ok" ? "stoerung" : grund,
        text: ersatzText(grund === "ok" ? "stoerung" : grund, faden) };
  faden.verlauf.push(eintrag);
  faden.status = "beantwortet";
  faden.ungelesenKind = false;   // das Kind sieht die Antwort ja sofort
  return eintrag;
}

const KINDER = ["paul", "leon", "helena"];
const LISTE = "meldungen";
const PAPIERKORB = "meldung-papierkorb:";
const MAX = 200;
const MAX_BILD = 900 * 1024;
// Ein gescanntes Blatt als PDF ist groesser als ein verkleinertes Foto
// (Pauls Scan vom 16.09.2026: 1 MB fuer zwei Seiten). KV nimmt bis 25 MB.
const MAX_PDF = 4 * 1024 * 1024;
const zuGross = (b) => b.length > (/^data:application\/pdf;/.test(b) ? MAX_PDF : MAX_BILD);

export async function onRequestPost(context) {
  return mitSpeicherwache(() => postVerarbeiten(context));
}

async function postVerarbeiten(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  let daten = {};
  try { daten = await request.json(); } catch (e) {}

  const kind = KINDER.includes(String(daten.kind || "").toLowerCase())
    ? String(daten.kind).toLowerCase() : null;

  // Wer schreibt? Ein Kind aus seinem Bereich, oder die Werkstatt mit dem
  // Elterncode.
  //
  // Bis zum 07.09.2026 wurde hier fuer JEDES Kind ein Ausweis verlangt - auch
  // fuer Helena, deren Bereich offen ist. geheimFuer() faellt fuer sie auf
  // PAUL_CODE zurueck, sie haette also Pauls Code gebraucht, um einen Fehler
  // zu melden. Dass es bei ihr trotzdem ging, lag nur an einem Cookie, das
  // zufaellig auf ihrem Handy lag; auf einem frischen Geraet waere sie
  // ausgesperrt gewesen. Jetzt gilt dieselbe Regel wie ueberall sonst.
  const alsEltern = await ausweisGueltig(request, geheimFuer(env, "eltern"), env);
  const alsKind = kind
    ? (!brauchtAusweis(env, kind) || await ausweisGueltig(request, geheimFuer(env, kind), env))
    : false;
  if (!alsEltern && !alsKind) return json(401, { ok: false, fehler: "Nicht angemeldet." });

  let liste = await listeHolen(env);

  /* --- Einen geloeschten Faden zurueckholen (nur Eltern) --- */
  if (daten.zurueckholen) {
    if (!alsEltern) return json(401, { ok: false, fehler: "Das darf nur der Elternzugang." });
    const roh = await env.PAUL_KV.get(PAPIERKORB + String(daten.zurueckholen));
    if (!roh) return json(404, { ok: false, fehler: "Im Papierkorb liegt dazu nichts (mehr)." });
    const gerettet = JSON.parse(roh).faden;
    if (liste.some((m) => m.id === gerettet.id))
      return json(409, { ok: false, fehler: "Der Faden ist schon wieder da." });
    liste.unshift(gerettet);
    await liste_speichern(env, liste);
    try { await env.PAUL_KV.delete(PAPIERKORB + gerettet.id); } catch (e) {}
    return json(200, { ok: true, faden: gerettet });
  }

  /* --- Antwort in einem bestehenden Faden --- */
  if (daten.id) {
    const faden = liste.find((m) => m.id === daten.id);
    if (!faden) return json(404, { ok: false, fehler: "Den Faden gibt es nicht mehr." });

    // Gelesen. Sonst kaeme der rote Punkt nach jedem Seitenwechsel zurueck.
    if (daten.gelesen && alsKind) {
      faden.ungelesenKind = false;
      await liste_speichern(env, liste);
      return json(200, { ok: true });
    }

    // "Passt jetzt" darf nur das Kind sagen - es ist seine Meldung.
    if (daten.status === "passt" && alsKind) {
      faden.status = "erledigt";
      faden.verlauf.push({ von: kind, text: "Passt jetzt! 👍", zeit: new Date().toISOString() });
      faden.ungelesenKind = false;
      await liste_speichern(env, liste);
      return json(200, { ok: true, faden });
    }

    // Eltern/Werkstatt antworten als "werkstatt", das Kind unter seinem Namen.
    const von = alsKind && (!alsEltern || daten.alsKind) ? kind : "werkstatt";

    // Warum die Grenze vom Absender abhaengt: Eine Kindernachricht ist ein paar
    // Saetze lang, 1500 Zeichen reichen dafuer dreimal. Ein Baubericht der
    // Werkstatt ist laenger - und der wurde hier bis zum 14.09.2026 mitten im
    // Wort abgeschnitten. Helena hat genau das gemeldet (wjj9vuza7x): "Deine
    // Antworten brechen mitten im Satz ab." Ihr Bericht endete auf "Vorher war
    // es ander", Pauls auf "Dein Foto-Knopf und dein". Die Sofortantwort der
    // KI war nie betroffen, die laeuft an dieser Stelle vorbei - deshalb sah es
    // so willkuerlich aus.
    const text = kuerzen(String(daten.text || "").trim(), von === "werkstatt" ? 6000 : 1500);
    const bild = typeof daten.bild === "string" ? daten.bild : "";
    if (!text && !bild) return json(400, { ok: false, fehler: "Die Nachricht war leer." });
    if (zuGross(bild)) return json(400, { ok: false, fehler: "Das Bild ist zu groß." });
    // Ein verbessertes Hausaufgabenblatt kann wieder mehrere Seiten haben.
    const weitereSeiten = faden.art === "hausaufgabe" && von !== "werkstatt" && Array.isArray(daten.bilder)
      ? daten.bilder.filter((b) => typeof b === "string" && b).slice(0, 3) : [];
    if (weitereSeiten.some(zuGross)) return json(400, { ok: false, fehler: "Ein Bild ist zu groß." });

    const nr = faden.verlauf.length;
    if (bild) await env.PAUL_KV.put("meldung-bild:" + faden.id + ":" + nr, bild);

    faden.verlauf.push({ von, text, zeit: new Date().toISOString(), hatBild: !!bild, nr,
                         ...(/^data:application\/pdf;/.test(bild) ? { pdf: true } : {}) });
    for (let i = 0; i < weitereSeiten.length; i++) {
      const n2 = faden.verlauf.length;
      await env.PAUL_KV.put("meldung-bild:" + faden.id + ":" + n2, weitereSeiten[i]);
      faden.verlauf.push({ von, text: "Seite " + (i + 2), zeit: new Date().toISOString(), hatBild: true, nr: n2,
                           ...(/^data:application\/pdf;/.test(weitereSeiten[i]) ? { pdf: true } : {}) });
    }
    // Hausaufgabe: Den Bau-Waechter braucht es nur, wenn das Kind ausdruecklich
    // eine eigene Uebung will. Sonst startete jede Verbesserungsrunde eine
    // ganze Bausitzung (waechter-meldungen.sh achtet auf uebungOffen).
    if (faden.art === "hausaufgabe"){
      if (von !== "werkstatt" && daten.uebung === true) faden.uebungOffen = true;
      if (von === "werkstatt") faden.uebungOffen = false;
    }

    /* Ein Uebungsspiel gehoert zu SEINER Hausaufgabe, nicht ins allgemeine
       Regal. Denny am 20.09.2026, mit Foto des Fadens: "Es ist jetzt aber auch
       nicht ersichtlich, wo das Uebungsspiel gelandet ist ... sodass das dann
       in dieser Uebungshausaufgabe unten auch erscheint ... Das Spiel ist
       extra und separat nur fuer diese Hausaufgabe."
       Darum wird die Kennung am Faden gemerkt; das Heft zeigt sie dort als
       Knopf, solange es die Hausaufgabe gibt. */
    if (daten.spielId){
      const id = String(daten.spielId).slice(0, 40).replace(/[^a-z0-9]/gi, "");
      if (id){
        if (!Array.isArray(faden.spiele)) faden.spiele = [];
        if (!faden.spiele.some((s) => s.id === id)){
          faden.spiele.push({ id,
            titel: kuerzen(String(daten.spielTitel || "Übung zu dieser Hausaufgabe").trim(), 120),
            zeit: new Date().toISOString() });
          faden.spiele = faden.spiele.slice(-6);
        }
      }
    }
    faden.status = von === "werkstatt" ? "beantwortet" : "offen";
    // Das Kind soll sehen, dass etwas Neues da ist.
    faden.ungelesenKind = von === "werkstatt";

    // Schreibt das KIND, wird auch hier sofort geantwortet - genau wie in
    // einem Chat. Sonst waere die erste Antwort schnell und jede weitere
    // Rueckfrage laege wieder tagelang.
    let antwort = null;
    if (von !== "werkstatt") {
      antwort = await sofortAntworten(env, faden, von, text, bild, weitereSeiten);
    }
    await liste_speichern(env, liste);
    return json(200, { ok: true, faden, antwort });
  }

  /* --- Ein neuer Faden --- */
  if (!alsKind) return json(401, { ok: false, fehler: "Nur die Kinder melden." });

  const text = kuerzen(String(daten.text || "").trim(), 1500);
  const bild = typeof daten.bild === "string" ? daten.bild : "";
  if (!text && !bild) return json(400, { ok: false, fehler: "Die Meldung war leer." });
  if (zuGross(bild)) return json(400, { ok: false, fehler: "Das Bild ist zu groß." });

  // Pauls Hausaufgabe (16.09.2026) hat oft mehr als eine Seite. Die weiteren
  // Seiten stehen als eigene Eintraege im Verlauf - so bleibt jedes Bild unter
  // seiner Nummer abrufbar (werkstatt.sh bild <id>:<nr>), ohne neues Format.
  const hausaufgabe = daten.art === "hausaufgabe";
  const weitere = hausaufgabe && Array.isArray(daten.bilder)
    ? daten.bilder.filter((b) => typeof b === "string" && b).slice(0, 3) : [];
  if (weitere.some(zuGross)) return json(400, { ok: false, fehler: "Ein Bild ist zu groß." });

  const id = neueId();
  if (bild) await env.PAUL_KV.put("meldung-bild:" + id + ":0", bild);
  for (let i = 0; i < weitere.length; i++) {
    await env.PAUL_KV.put("meldung-bild:" + id + ":" + (i + 1), weitere[i]);
  }

  liste.unshift({
    id, kind,
    zeit: new Date().toISOString(),
    art: daten.art === "wunsch" ? "wunsch" : hausaufgabe ? "hausaufgabe" : "problem",
    wo: String(daten.wo || "").slice(0, 200),
    // Welches Fach - Paul waehlt es im Hausaufgaben-Heft (18.09.2026).
    fach: String(daten.fach || "").slice(0, 24),
    titel: String(daten.titel || "").slice(0, 120),
    geraet: String(daten.geraet || "").slice(0, 80),
    status: "offen",
    ungelesenKind: false,
    verlauf: [{ von: kind, text, zeit: new Date().toISOString(), hatBild: !!bild, nr: 0,
                ...(/^data:application\/pdf;/.test(bild) ? { pdf: true } : {}) }]
      .concat(weitere.map((b, i) => ({ von: kind, text: "Seite " + (i + 2), zeit: new Date().toISOString(), hatBild: true, nr: i + 1,
                                        ...(/^data:application\/pdf;/.test(b) ? { pdf: true } : {}) }))),
    ...(hausaufgabe && daten.uebung === true ? { uebungOffen: true } : {}),
  });

  // Sofort antworten - noch in diesem Aufruf, damit das Kind die Antwort
  // direkt im Fenster sieht und nicht warten muss.
  const neuerFaden = liste[0];
  const antwort = await sofortAntworten(env, neuerFaden, kind, text, bild, weitere);
  await liste_speichern(env, liste);
  return json(200, { ok: true, id, antwort, faden: neuerFaden });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  const url = new URL(request.url);

  // Das Kind holt seine eigenen Fäden - damit es Antworten lesen kann.
  const meine = url.searchParams.get("meine") === "1";
  const kind = String(url.searchParams.get("kind") || "").toLowerCase();
  if (meine) {
    if (!KINDER.includes(kind)) return json(400, { ok: false, fehler: "Wer denn?" });
    // Gleiche Regel wie beim Schreiben: Wo der Bereich offen ist, braucht es
    // keinen Ausweis. Sonst haette Helena ihre eigenen Meldungen nicht lesen
    // koennen - genau das, was sie sich gewuenscht hat.
    if (brauchtAusweis(env, kind) && !(await ausweisGueltig(request, geheimFuer(env, kind), env)))
      return json(401, { ok: false, fehler: "Nicht angemeldet." });
    const liste = await listeHolen(env);
    const meins = liste.filter((m) => m.kind === kind);

    // Sein eigenes Bild darf das Kind sehen - aber nur aus einem Faden, der
    // ihm auch gehoert. Die Kennung <id>:<nr> wird dafuer aufgetrennt.
    const eigenesBild = url.searchParams.get("bild");
    if (eigenesBild) {
      const fadenId = String(eigenesBild).split(":")[0];
      if (!meins.some((m) => m.id === fadenId))
        return json(403, { ok: false, fehler: "Das ist nicht deins." });
      const d = await env.PAUL_KV.get("meldung-bild:" + eigenesBild);
      if (!d) return json(404, { ok: false, fehler: "Kein Bild dabei." });
      return json(200, { ok: true, bild: d });
    }
    return json(200, { ok: true, meldungen: meins });
  }

  if (!(await ausweisGueltig(request, geheimFuer(env, "eltern"), env)))
    return json(401, { ok: false, fehler: "Bitte mit dem Eltern-Code anmelden." });

  const bild = url.searchParams.get("bild");
  if (bild) {
    const d = await env.PAUL_KV.get("meldung-bild:" + bild);
    if (!d) return json(404, { ok: false, fehler: "Kein Bild dabei." });
    return json(200, { ok: true, bild: d });
  }

  // Was im Papierkorb liegt. Nur mit Elternausweis, und bewusst NICHT in der
  // normalen Liste: Fuer die Kinder soll ein weggeraeumter Faden weg bleiben.
  if (url.searchParams.get("papierkorb") === "1") {
    const gefunden = [];
    let cursor;
    do {
      const s = await env.PAUL_KV.list({ prefix: PAPIERKORB, cursor });
      for (const k of s.keys) {
        const roh = await env.PAUL_KV.get(k.name);
        if (!roh) continue;
        try {
          const e = JSON.parse(roh);
          gefunden.push({ id: e.faden.id, kind: e.faden.kind, zeit: e.faden.zeit,
                          geloescht: e.geloescht, von: e.von,
                          nachrichten: (e.faden.verlauf || []).length, faden: e.faden });
        } catch (err) {}
      }
      cursor = s.list_complete ? null : s.cursor;
    } while (cursor);
    gefunden.sort((a, b) => String(b.geloescht).localeCompare(String(a.geloescht)));
    return json(200, { ok: true, papierkorb: gefunden });
  }

  return json(200, { ok: true, meldungen: await listeHolen(env) });
}

export async function onRequestDelete(context) {
  return mitSpeicherwache(() => loeschenVerarbeiten(context));
}

async function loeschenVerarbeiten(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return json(400, { ok: false, fehler: "Welche Meldung denn?" });

  const liste = await listeHolen(env);
  const faden = liste.find((m) => m.id === id);

  // Helena am 07.09.2026: "Kannst du oben bei meinen Meldungen einen X Knopf
  // anbringen damit ich dann die Themen anklicken kann und sie loeschen kann,
  // wenn ich will!!!" - Ein Kind darf seine EIGENEN Meldungen wegraeumen.
  // Fremde nicht, und die Eltern duerfen weiterhin alles.
  const meins = String(url.searchParams.get("kind") || "").toLowerCase();
  const alsKindSelbst = faden && meins && KINDER.includes(meins) && faden.kind === meins &&
    (!brauchtAusweis(env, meins) || await ausweisGueltig(request, geheimFuer(env, meins), env));

  if (!alsKindSelbst && !(await ausweisGueltig(request, geheimFuer(env, "eltern"), env)))
    return json(401, { ok: false, fehler: "Das darfst du nicht loeschen." });

  // Erst in den Papierkorb, dann aus der Liste. Zweimal ist ein Faden schon
  // endgueltig verschwunden - Pauls drei am 07.09.2026, Helenas am 14.09.2026 -
  // und beide Male gab es nichts zum Zurueckholen. Helena dazu: "Ich will
  // nicht, dass so was noch mal passiert." Das hier ist das Netz darunter: der
  // Text bleibt 90 Tage liegen, unsichtbar fuer die Kinder, lesbar nur mit dem
  // Elternausweis. Die Bilder werden weiter geloescht - sie sind zu gross, um
  // sie doppelt zu halten, und der Text ist das, was verloren wehtut.
  if (faden) {
    try {
      await env.PAUL_KV.put(PAPIERKORB + id,
        JSON.stringify({ faden, geloescht: new Date().toISOString(),
                         von: alsKindSelbst ? meins : "eltern" }),
        { expirationTtl: 60 * 60 * 24 * 90 });
    } catch (e) {}
  }

  await liste_speichern(env, liste.filter((m) => m.id !== id));
  // Nur die Nachrichten anfassen, an denen wirklich ein Bild hing. Ein delete
  // ist im KV ein SCHREIBvorgang und zaehlt gegen das Tageskontingent - auch
  // dann, wenn der Schluessel gar nicht existiert. Vorher lief die Schleife
  // ueber den ganzen Verlauf: Helenas Faden wjj9vuza7x haette 20 Schreibvorgaenge
  // gekostet, obwohl daran kein einziges Bild hing. "hatBild" steht seit jeher
  // an jeder Nachricht, ein Nachschauen im Speicher braucht es dafuer nicht.
  if (faden) for (let i = 0; i < (faden.verlauf || []).length; i++) {
    const e = faden.verlauf[i];
    if (!e || !e.hatBild) continue;
    const nr = (e.nr === undefined || e.nr === null) ? i : e.nr;
    try { await env.PAUL_KV.delete("meldung-bild:" + id + ":" + nr); } catch (e2) {}
  }
  return json(200, { ok: true });
}

async function listeHolen(env) {
  try {
    const roh = await env.PAUL_KV.get(LISTE);
    const l = roh ? JSON.parse(roh) : [];
    // Ältere Einträge hatten noch keinen Verlauf - nachziehen, damit
    // nichts verlorengeht.
    return l.map((m) => m.verlauf ? m : Object.assign({}, m, {
      status: m.erledigt ? "erledigt" : "offen",
      verlauf: [{ von: m.kind, text: m.text || "", zeit: m.zeit, hatBild: !!m.hatBild, nr: 0 }],
    }));
  } catch (e) { return []; }
}

// Fliegt der Schreibvorgang, war das bisher ein abgestuerzter Worker: Das Kind
// bekam die nackte Cloudflare-Seite "error code: 1101" zu sehen und wusste
// nicht, ob seine Meldung angekommen ist. Am 14.09.2026 ab etwa 14 Uhr UTC nahm
// der Speicher stundenlang nichts mehr an - GET ging weiter, jedes put warf.
// Seitdem gibt es hier einen ehrlichen Satz statt eines Absturzes. Wichtig:
// Er sagt NICHT "angekommen", denn das waere gelogen.
class SpeicherVoll extends Error {}

async function liste_speichern(env, liste) {
  try {
    await env.PAUL_KV.put(LISTE, JSON.stringify(liste.slice(0, MAX)));
  } catch (e) {
    throw new SpeicherVoll(String((e && e.message) || e));
  }
}

// Nimmt einen Handler und faengt genau diesen einen Fall ab.
async function mitSpeicherwache(arbeit) {
  try { return await arbeit(); }
  catch (e) {
    if (!(e instanceof SpeicherVoll)) throw e;
    return json(503, { ok: false, speicherVoll: true,
      fehler: "Ich kann deine Nachricht gerade nicht ablegen – der Speicher " +
              "nimmt nichts an. Das liegt an mir, nicht an dir. Bitte schick sie " +
              "später noch einmal, dann ist sie da." });
  }
}

// Kuerzt am Wortende, nicht mitten im Wort - und sagt dazu, dass gekuerzt
// wurde. Ein Text, der einfach aufhoert, liest sich fuer ein Kind wie ein
// Fehler; ein Text mit "(gekuerzt)" liest sich wie eine Ansage.
function kuerzen(t, grenze) {
  if (t.length <= grenze) return t;
  const stumpf = t.slice(0, grenze - 14);
  const luecke = stumpf.lastIndexOf(" ");
  return (luecke > grenze * 0.6 ? stumpf.slice(0, luecke) : stumpf) + " … (gekuerzt)";
}

function neueId() {
  const zeichen = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (const b of crypto.getRandomValues(new Uint8Array(10))) s += zeichen[b % zeichen.length];
  return s;
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
