// Wer ist gerade da? Speist das Anwesenheitsband (seit 05.10.2026 haelt es das Ausrollen nicht mehr an).
//
// POST /api/aktiv   {kind:"leon", seite:"quiz"}  -> "ich bin da" (alle 3 Minuten)
// POST /api/aktiv   {kind:"leon", weg:true}  -> Seite geschlossen
// GET  /api/aktiv                            -> {frei:true|false, seit:<Sekunden>}
//
// Die GET-Antwort nennt bewusst KEINE Namen. Sie sagt nur, ob gerade jemand
// da ist - das braucht der Wächter auf Dennys Rechner, und mehr darf offen im
// Netz nicht stehen (siehe Regel: Namen nur nach Login).
//
// Warum nicht sekundengenau: Jeder Puls ist ein Schreibvorgang im KV, und
// davon gibt es am Tag nur begrenzt viele. Alle 3 Minuten reicht vollkommen -
// wir wollen wissen, ob jemand spielt, nicht wo die Maus steht.

import { ausweisGueltig, geheimFuer, brauchtAusweis, besuchIstEltern } from "./_riegel.js";
import { anwesendVermerken, woVermerken } from "./_anwesend.js";

const KINDER = ["paul", "leon", "helena"];
const SCHLUESSEL = (kind) => "aktiv:" + kind;

/* Bis 05.10.2026 stand hier die "Darf ich kurz?"-Frage (ausrollen:wunsch,
 * updateOk, pause:<kind>, Bauzettel). Denny am 05.10.2026 per Klickfrage:
 * "Still beim Seitenwechsel" - kein Kind wird mehr gefragt. Eine neue Fassung
 * kommt, sobald das Kind die naechste Seite oeffnet (HTML no-store, Skripte mit
 * ?v=-Stempel). Der Puls bleibt: er speist das Anwesenheitsband.
 * Alte, noch offene Seiten schicken evtl. updateOk - das zaehlt jetzt als
 * gewoehnlicher Puls. ?wunsch=... wird ignoriert. */

// Nach so vielen Sekunden ohne Puls gilt jemand als weg. Etwas mehr als zwei
// Pulsabstände, damit ein verschlucktes Signal niemanden verschwinden lässt.
const STILLE_BIS_WEG = 480;

// So dicht dürfen zwei Pulse hintereinander wirklich in den Speicher.
// Der Takt in lernstand.js ist 180 Sekunden - dazwischen liegt aber JEDER
// Seitenwechsel und jeder Wechsel zurück in den Tab, und beide melden sich
// sofort wieder an. Ein Kind, das sich durch sein Spielemenü klickt, hat so in
// einer Minute fünf Schreibvorgänge verbraucht, obwohl der Eintrag danach
// dasselbe sagt wie vorher: "ist da". Steht der letzte Puls noch keine 90
// Sekunden zurück, bleibt er stehen. Sein Verfallsdatum reicht (STILLE_BIS_WEG
// + 120) weit über den nächsten regulären Puls hinaus, es geht also nichts
// verloren.
const PULS_MINDESTABSTAND = 90;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  let daten = {};
  try { daten = await request.json(); } catch (e) {}
  const kind = String(daten.kind || "").toLowerCase();
  if (!KINDER.includes(kind)) return json(400, { ok: false, fehler: "Welches Kind denn?" });

  /* Meldung aus dem Quiz-Duell: NUR Anwesenheit, kein Puls - und BEWUSST ohne
   * Ausweis.
   *
   * Denny am 19.09.2026 auf die Frage, wie das geloest werden soll: "Ohne
   * Anmeldung zaehlen." Der Grund: /duell/ liegt ausserhalb des Riegels und ist
   * nur von der offenen Startseite verlinkt, nicht aus Pauls oder Leons
   * Bereich. Wer direkt dorthin geht, hat kein Cookie - mit Ausweispflicht
   * waere die Meldung fuer beide meistens mit 401 abgewiesen worden, und die
   * Anforderung "das Duell meldet mit" waere still ausgefallen (Pruefrunde 01).
   *
   * Was das kostet: Wer die Adresse kennt, kann einen Anwesenheitseintrag fuer
   * ein fremdes Kind erzeugen. Betroffen ist nur diese Anzeige - keine
   * Lerndaten, keine Inhalte, kein Zugang. Fuer Helena galt das ohnehin schon,
   * weil ihr Bereich keinen Riegel hat.
   *
   * Der Puls wird hier NICHT gesetzt: Er haelt das Ausrollen an, und das Duell
   * wertet die Rueckfrage "darf ich kurz?" gar nicht aus - ein Quizabend haette
   * sonst bis zu 45 Minuten lang jedes Ausrollen blockiert, ohne dass jemand
   * gefragt wird (Pruefrunde 01).
   */
  if (daten.quelle === "duell") {
    // Ehrlich antworten, was passiert ist. Die erste Fassung meldete immer
    // "vermerkt: true" - auch bei vollem Speicher. Damit belegte ein
    // erfolgreicher Live-Aufruf gar nichts (Pruefrunde 03).
    let r = { geschrieben: false, fehler: "unbekannt" };
    // offen = true: Hier wurde kein Ausweis geprueft.
    try { r = await anwesendVermerken(env, kind, "duell", Date.now(), true); } catch (e) {}
    return json(200, { ok: !r.fehler, vermerkt: !!r.geschrieben, grund: r.fehler });
  }

  // Liegt der Bereich des Kindes hinter dem Riegel, muss der Ausweis stimmen.
  // Helenas Bereich ist offen - sie kann sich gar nicht anmelden, also nehmen
  // wir dort ohne Ausweis an. Sobald HELENA_CODE gesetzt und ihr Bereich in
  // GESCHUETZT aufgenommen wird, gilt auch fuer sie der Ausweis.
  /* Wurde hier wirklich ein Ausweis geprueft? Fuer Helena ist brauchtAusweis
     false - ihr Bereich hat keinen Riegel -, ein Puls kommt also ohne Cookie
     durch. Das war schon vorher so; neu ist nur, dass daraus jetzt ein
     45 Tage haltbarer Eintrag wird. Darum wird die Antwort mitgefuehrt und
     unten an den Tagesdeckel gegeben (Pruefrunde 04). */
  const ausweisNoetig = brauchtAusweis(env, kind);
  if (ausweisNoetig && !(await ausweisGueltig(request, geheimFuer(env, kind), env)))
    return json(401, { ok: false, fehler: "Nicht angemeldet." });
  const offen = !ausweisNoetig;

  if (daten.weg) {
    // Sauber abgemeldet - dann muss niemand die volle Stille abwarten.
    // Erst nachschauen: Ein delete ist im KV ein SCHREIBvorgang, ein get nicht.
    // Steht gar nichts da (zweite Abmeldung, abgelaufener Eintrag), gibt es
    // auch nichts zu löschen.
    try {
      if (await env.PAUL_KV.get(SCHLUESSEL(kind))) await env.PAUL_KV.delete(SCHLUESSEL(kind));
    } catch (e) {}
    return json(200, { ok: true });
  }

  // Nachschauen kostet nichts, schreiben schon.
  let letzter = 0;
  try { letzter = Number(await env.PAUL_KV.get(SCHLUESSEL(kind))) || 0; } catch (e) {}
  if (!letzter || (Date.now() - letzter) / 1000 >= PULS_MINDESTABSTAND) {
    await env.PAUL_KV.put(SCHLUESSEL(kind), String(Date.now()),
                          { expirationTtl: STILLE_BIS_WEG + 120 });
  }

  /* Das Anwesenheitsband fortschreiben - siehe _anwesend.js.
   *
   * Das laeuft ABSICHTLICH ausserhalb des PULS_MINDESTABSTAND oben: Sonst ginge
   * genau an der Viertelstundengrenze ein Block verloren. Puls um 8:44:50,
   * naechster um 8:45:10 - der zweite faellt unter den Mindestabstand, und die
   * Viertelstunde ab 8:45 waere nie vermerkt worden, obwohl das Kind
   * durchgehend da war. Nachschauen kostet nichts; geschrieben wird drinnen nur
   * bei einer wirklich neuen Viertelstunde.
   */
  /* Sitzt hier ein Erwachsener? Dann wird NICHTS vermerkt - weder Anwesenheit
     noch die Seite. Denny am 21.09.2026: "wenn ich in der leeren Welt der
     Kinder drin bin mit meinem Passwort, wird die Anwesenheit getrackt ... Das
     macht natuerlich keinen Sinn."
     Der Puls oben bleibt bewusst stehen: Er haelt das Ausrollen an, und auch
     Denny soll die Seite nicht unter den Fingern getauscht bekommen. */
  let alsEltern = false;
  try { alsEltern = await besuchIstEltern(request, geheimFuer(env, kind)); } catch (e) {}
  if (alsEltern) return json(200, { ok: true, alsEltern: true });

  try { await anwesendVermerken(env, kind, "lernwelt", Date.now(), offen); } catch (e) {}

  /* Und WORAN gesessen wird - Denny am 21.09.2026: "Was machen die Kids in der
   * Zeit?" Der Puls trug bisher nur "ich bin da"; stand daneben keine Runde,
   * blieb offen, ob das Kind gespielt oder die Seite nur offen gelassen hat.
   *
   * Das laeuft in einem EIGENEN Eintrag (siehe _anwesend.js) und darf den Puls
   * unter keinen Umstaenden abwuergen: Der hat die wichtigere Aufgabe, naemlich
   * kein Ausrollen zuzulassen, waehrend ein Kind uebt. Geht es schief, fehlt
   * eine Zeile in der Elternansicht - mehr nicht. */
  try { await woVermerken(env, kind, Date.now(), daten.seite, offen, daten.geraet); } catch (e) {}

  return json(200, { ok: true });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  // Nur noch Lesen: Ist gerade jemand da? (?wunsch=... seit 05.10.2026 ohne Wirkung.)
  let juengste = 0;
  for (const kind of KINDER) {
    const roh = await env.PAUL_KV.get(SCHLUESSEL(kind));
    const t = roh ? Number(roh) : 0;
    if (t > juengste) juengste = t;
  }
  const seit = juengste ? Math.round((Date.now() - juengste) / 1000) : null;
  const frei = seit === null || seit > STILLE_BIS_WEG;
  return json(200, { ok: true, frei, seit, stilleBisWeg: STILLE_BIS_WEG });
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
