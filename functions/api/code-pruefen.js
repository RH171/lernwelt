// Prüft den Code eines Bereichs und setzt bei Erfolg das signierte Zugangs-Cookie.
// Angenommen werden zwei Codes: der eigene der Seite und der Hauptschlüssel
// MASTER_CODE (Regel im Skill rh171web, 21.09.2026).
import { gleich, ausweisBauen, ausweisKopfzeile, ausweisGueltig, geheimFuer,
         zuVieleFehlversuche, fehlversuchZaehlen, fehlversucheLoeschen,
         besuchKennung, besuchKopfzeile, besuchLoeschenKopfzeile } from "./_riegel.js";

// Welches Kind meldet sich an? Steht als ?kind=leon in der Adresse bzw. im Auftrag.
function kindAus(request, auftrag) {
  const ausAdresse = new URL(request.url).searchParams.get("kind");
  return String((auftrag && auftrag.kind) || ausAdresse || "paul").toLowerCase();
}

export async function onRequestGet(context) {
  // Fragt nur: bin ich hier schon angemeldet?
  const { request, env } = context;
  if (!env.PAUL_CODE) return json(500, { ok: false, fehler: "Auf dem Server fehlt der Zugangscode." });
  return json(200, { ok: await ausweisGueltig(request, geheimFuer(env, kindAus(request, null)), env) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.PAUL_CODE) {
    return json(500, { ok: false, fehler: "Auf dem Server fehlt der Zugangscode. Denny muss ihn bei Cloudflare als PAUL_CODE hinterlegen." });
  }
  if (await zuVieleFehlversuche(request, env)) {
    return json(429, { ok: false, fehler: "Zu viele falsche Codes. Bitte in einer Stunde nochmal – oder frag Denny." });
  }

  let code = "", auftrag = null;
  try { auftrag = await request.json(); code = String((auftrag && auftrag.code) || ""); } catch (e) {}
  const geheim = geheimFuer(env, kindAus(request, auftrag));

  // Ohne hinterlegten Code bleibt der Bereich zu - auch fuer den Hauptschluessel.
  // Es gaebe sonst nichts, womit der Ausweis signiert werden koennte, und ein
  // mit etwas anderem signierter Ausweis wuerde ueberall sonst abgewiesen.
  if (!geheim) {
    return json(401, { ok: false, fehler: "Für diesen Bereich ist kein Code hinterlegt." });
  }

  // Zwei Wege hinein, seit 21.09.2026 (Denny: "Ich möchte mit meinem
  // Master-Passwort auf jede Seite hineinkommen."): der eigene Code der Seite
  // und der Hauptschlüssel MASTER_CODE. Der Ausweis wird trotzdem weiter mit
  // `geheim` signiert - der Hauptschlüssel ist ein zweiter Weg zur Anmeldung,
  // kein zweiter Ausweis. Ohne gesetztes MASTER_CODE bleibt alles wie vorher.
  //
  // Der leere Code muss ausdrücklich raus: gleich("", undefined) ist WAHR,
  // weil beide Seiten zu "" werden. Ohne diese Prüfung käme man in einen
  // Bereich ohne hinterlegten Code mit einem leeren Feld hinein - genau das
  // Gegenteil dessen, was der Kommentar in geheimFuer() verspricht
  // (nachgerechnet am 21.09.2026 beim Einbau des Hauptschlüssels).
  const eigener = code !== "" && gleich(code, geheim);
  const haupt = code !== "" && !!env.MASTER_CODE && gleich(code, env.MASTER_CODE);

  if (!eigener && !haupt) {
    const n = await fehlversuchZaehlen(request, env);
    return json(401, { ok: false, fehler: "Der Code stimmt nicht.", uebrig: Math.max(0, 8 - n) });
  }

  await fehlversucheLoeschen(request, env);
  const ausweis = await ausweisBauen(geheim);

  /* Wer mit dem Hauptschluessel hereinkommt, hinterlaesst eine Spur - sonst
     zaehlt sein Besuch als Anwesenheit des Kindes (Denny, 21.09.2026: "Das
     macht natuerlich keinen Sinn"). Wer den EIGENEN Code des Bereichs nimmt,
     bekommt die Spur ausdruecklich wieder weggenommen: Sonst bliebe ein
     Geraet, auf dem einmal der Hauptschluessel benutzt wurde, dreissig Tage
     lang unsichtbar.
     Der Elternbereich selbst braucht das nicht - er pulst ohnehin nicht. */
  const kindHier = kindAus(request, auftrag);
  const kekse = [ausweisKopfzeile(ausweis, kindHier)];
  if (haupt && !eigener && kindHier !== "eltern") {
    kekse.push(besuchKopfzeile(await besuchKennung(geheim), kindHier));
  } else if (eigener) {
    kekse.push(besuchLoeschenKopfzeile());
  }
  // Das Kind muss mit: Wie lange die Anmeldung liegen bleibt, haengt davon ab,
  // wer sich anmeldet. Pauls Bereich bekommt seit dem 16.09.2026 ein
  // Sitzungs-Cookie (siehe ausweisKopfzeile in _riegel.js).
  /* Zwei Set-Cookie-Zeilen gehen nur ueber Headers - ein Objekt kann denselben
     Schluessel nicht zweimal tragen. */
  const kopf = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  for (const k of kekse) kopf.append("set-cookie", k);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: kopf });
}

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
