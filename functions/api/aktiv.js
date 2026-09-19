// Wer spielt gerade? Damit nichts ausgerollt wird, während ein Kind übt.
//
// POST /api/aktiv   {kind:"leon"}            -> "ich bin da" (alle 3 Minuten)
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

import { ausweisGueltig, geheimFuer, brauchtAusweis } from "./_riegel.js";
import { anwesendVermerken } from "./_anwesend.js";

const KINDER = ["paul", "leon", "helena"];
const SCHLUESSEL = (kind) => "aktiv:" + kind;

// Ein Update wartet. Denny am 07.09.2026: "Du koenntest auch eine Push
// Benachrichtung in der APP senden, dass Du ein update machen moechtest und
// fragst, ob du sie kurz kicken darfst." Besser als beides, was es vorher gab:
// blockieren, bis irgendwann niemand mehr spielt - oder einfach ausrollen.
const WUNSCH = "ausrollen:wunsch";
const WUNSCH_GILT = 900;          // 15 Minuten, dann verfaellt die Frage

// Erst nach so vielen Sekunden wird die Frage neu hingeschrieben.
// ausrollen-frei.sh ruft ?wunsch=1 JEDE MINUTE auf, solange ein Kind spielt
// und etwas zum Ausrollen bereitliegt - am 14.09.2026 waren das 75 Minuten
// und damit 75 Schreibvorgaenge fuer einen Satz, der sich in der ganzen Zeit
// kein einziges Mal geaendert hat. Nachschauen ist umsonst, schreiben nicht.
const WUNSCH_AUFFRISCHEN = 600;

// Woran gerade gebaut wird - Pauls Meldung 5z785gdjxc vom 08.09.2026: "wenn das
// Fenster aufplatzt ... da will ich gerne wissen, was du da überhaupt machst",
// und auf die Rückfrage, ob ein grober Satz reicht: "Ich will was genaueres".
// Der Satz wird beim Ausrollen mitgeschickt und im Fenster angezeigt.
//
// Warum er einen Ausweis braucht: Diese Antwort steht ungeschützt im Netz - ohne
// Riegel könnte jeder Fremde Paul einen beliebigen Satz auf den Bildschirm
// schreiben. Der reine "es liegt etwas bereit"-Schalter bleibt offen wie bisher;
// er verrät nichts und ist nur ein Ja/Nein.
const WAS_MAX = 160;

function wasSaeubern(roh) {
  const t = String(roh || "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")   // Steuerzeichen raus
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= WAS_MAX) return t;
  // Nicht mitten im Wort abschneiden - Paul soll lesen koennen, was dasteht.
  const kurz = t.slice(0, WAS_MAX - 1);
  const luecke = kurz.lastIndexOf(" ");
  return (luecke > WAS_MAX - 45 ? kurz.slice(0, luecke) : kurz).replace(/[ ,;:.-]+$/, "") + "\u2026";
}

// Was liegt bereit? Gibt {da, was} zurueck. Alte Eintraege (nur ein Zeitstempel)
// werden weiter verstanden - dann eben ohne Satz.
async function wunschLesen(env) {
  let roh = null;
  try { roh = await env.PAUL_KV.get(WUNSCH); } catch (e) {}
  if (!roh) return { da: false, was: "" };
  try {
    const d = JSON.parse(roh);
    if (d && typeof d === "object") return { da: true, was: wasSaeubern(d.was) };
  } catch (e) {}
  return { da: true, was: "" };
}

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

  // Liegt der Bereich des Kindes hinter dem Riegel, muss der Ausweis stimmen.
  // Helenas Bereich ist offen - sie kann sich gar nicht anmelden, also nehmen
  // wir dort ohne Ausweis an. Sobald HELENA_CODE gesetzt und ihr Bereich in
  // GESCHUETZT aufgenommen wird, gilt auch fuer sie der Ausweis.
  if (brauchtAusweis(env, kind) && !(await ausweisGueltig(request, geheimFuer(env, kind), env)))
    return json(401, { ok: false, fehler: "Nicht angemeldet." });

  /* Meldung aus dem Quiz-Duell: NUR Anwesenheit, kein Puls.
   *
   * Der Puls unten haelt das Ausrollen an, solange ein Kind spielt. Das Duell
   * hat daran aber nicht teil: Es bindet lernstand.js bewusst nicht ein, fragt
   * also auch niemanden "darf ich kurz?" und wertet updateWartet nicht aus.
   * Wuerde es hier mitpulsen, blockierte ein Quizabend jedes Ausrollen bis zu
   * 45 Minuten lang, ohne dass irgendjemand gefragt wird - eine stille
   * Verschlechterung gegenueber vorher, wo ein Quizabend gar nichts blockiert
   * hat (Pruefrunde 01, 19.09.2026).
   *
   * Das Band wird trotzdem fortgeschrieben - genau darum geht es ja.
   */
  if (daten.quelle === "duell") {
    try { await anwesendVermerken(env, kind, "duell", Date.now()); } catch (e) {}
    return json(200, { ok: true, vermerkt: true });
  }

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

  // Das Kind hat zugestimmt, dass jetzt aktualisiert werden darf.
  if (daten.updateOk) {
    try {
      if (await env.PAUL_KV.get(SCHLUESSEL(kind))) await env.PAUL_KV.delete(SCHLUESSEL(kind));
      // Kurze Schonzeit, damit der Puls nicht sofort wieder anspringt und
      // das Ausrollen erneut blockiert.
      await env.PAUL_KV.put("pause:" + kind, "1", { expirationTtl: 180 });
    } catch (e) {}
    return json(200, { ok: true, danke: true });
  }

  // Waehrend der Schonzeit nach einem Ja wird kein Puls angenommen.
  try { if (await env.PAUL_KV.get("pause:" + kind)) return json(200, { ok: true, pausiert: true }); }
  catch (e) {}

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
  try { await anwesendVermerken(env, kind, "lernwelt", Date.now()); } catch (e) {}

  // Wartet ein Update? Dann sagt die Antwort es der Seite, und die fragt das
  // Kind. So erfaehrt es davon, ohne dass jemand extra nachschauen muss.
  // updateWas sagt zusaetzlich, woran gebaut wurde - Paul wollte es genau wissen.
  const w = await wunschLesen(env);
  return json(200, { ok: true, updateWartet: w.da, updateWas: w.was });
}

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  // ?wunsch=1 heisst: Es soll ausgerollt werden. Die Seiten fragen daraufhin
  // beim naechsten Puls nach - hoechstens WUNSCH_GILT Sekunden lang.
  const url = new URL(request.url);
  if (url.searchParams.get("wunsch") === "1") {
    // Den Satz nimmt der Server nur von jemandem an, der den Elternausweis hat.
    let was = "";
    const roh = wasSaeubern(url.searchParams.get("was"));
    if (roh) {
      const geheim = geheimFuer(env, "eltern");
      if (geheim && (await ausweisGueltig(request, geheim, env))) was = roh;
    }
    try {
      // Steht dieselbe Frage schon da und ist sie noch frisch, bleibt sie
      // einfach stehen. Geschrieben wird nur, wenn sich der Satz aendert oder
      // der Eintrag seinem Ablauf naher kommt.
      let schreiben = true;
      const alt = await env.PAUL_KV.get(WUNSCH);
      if (alt) {
        try {
          const d = JSON.parse(alt);
          const alterSek = (Date.now() - (Number(d && d.t) || 0)) / 1000;
          if (wasSaeubern(d && d.was) === was && alterSek >= 0 && alterSek < WUNSCH_AUFFRISCHEN)
            schreiben = false;
        } catch (e) {}
      }
      if (schreiben)
        await env.PAUL_KV.put(WUNSCH, JSON.stringify({ t: Date.now(), was }),
                              { expirationTtl: WUNSCH_GILT });
    } catch (e) {}
  } else if (url.searchParams.get("wunsch") === "0") {
    // Erst nachschauen, dann erst loeschen. Ein delete ist im KV ein
    // SCHREIBvorgang und zaehlt gegen das Tageskontingent, ein get nicht.
    // Diese Zeile laeuft nach JEDEM Ausrollen - und ausgerollt wird, sobald
    // sich eine Datei geaendert hat, an einem Bastelabend also im Minutentakt.
    // Fast immer liegt dann gar keine Frage vor, die zurueckzunehmen waere.
    try { if (await env.PAUL_KV.get(WUNSCH)) await env.PAUL_KV.delete(WUNSCH); } catch (e) {}
  }

  let juengste = 0;
  for (const kind of KINDER) {
    const roh = await env.PAUL_KV.get(SCHLUESSEL(kind));
    const t = roh ? Number(roh) : 0;
    if (t > juengste) juengste = t;
  }
  const seit = juengste ? Math.round((Date.now() - juengste) / 1000) : null;
  const frei = seit === null || seit > STILLE_BIS_WEG;
  const w = await wunschLesen(env);
  return json(200, { ok: true, frei, seit, stilleBisWeg: STILLE_BIS_WEG, gefragt: w.da });
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
