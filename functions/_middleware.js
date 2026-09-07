// Läuft vor JEDER Anfrage an die Lernwelt.
//
// Zwei Aufgaben: den Zugangsriegel bewachen, und den gespeicherten Fortschritt
// eines Kindes so in SEINE Seiten schreiben, dass die Spiele ihn beim Start
// schon kennen – ganz OHNE die Spiel-Dateien selbst zu verändern.
//
// Am 07.09.2026 geändert. Vorher wurde Pauls Fortschritt in JEDE HTML-Seite
// gesetzt: auch in die öffentliche Startseite, in Helenas offenen Bereich und
// in die Ersatzseite für unbekannte Adressen. Damit standen 85 Schlüssel mit
// Datum, Punkten und Sekunden jeder Spielrunde offen im Netz, für jeden
// abrufbar, der lernwelt.rh171.de aufrief. Gemessen und behoben.
//
// Jetzt: nur innerhalb von /paul/, /leon/ und /helena/, und dort nur der
// Speicher genau dieses Kindes. Bei /paul/ und /leon/ ist der Riegel davor
// schon durchlaufen - wer bis hierher kommt, ist angemeldet.

import { ausweisGueltig, anmeldeSeite, geheimFuer } from "./api/_riegel.js";

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // API-Aufrufe (z. B. /api/progress) nicht anfassen – die machen ihr eigenes Ding.
  if (url.pathname.startsWith("/api/")) {
    return next();
  }

  // Pauls Bereich ist nur mit seinem Code zu erreichen. Der Link ist inzwischen
  // anderen Kindern bekannt. Muss hier oben stehen: Eine Middleware in einem
  // Unterordner greift bei Cloudflare NICHT für statische Dateien, nur für
  // Functions – deshalb ist dies die einzige Stelle, an der es wirkt.
  // Fehlt das Secret, wird niemand ausgesperrt.
  const bereich = url.pathname.match(/^\/(paul|leon|eltern)(?:\/|$)/);
  if (bereich) {
    const geheim = geheimFuer(env, bereich[1]);
    if (geheim && !(await ausweisGueltig(request, geheim, env))) {
      return new Response(anmeldeSeite(bereich[1]), {
        status: 401,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      });
    }
  }

  // Die eigentliche Seite/Datei holen.
  const response = await next();

  // Nur echte HTML-Seiten bearbeiten (Bilder, JS, CSS bleiben unberührt).
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // Welchem Kind gehört diese Seite? Ausserhalb der drei Bereiche wird nichts
  // gesetzt - die Startseite und unbekannte Adressen bleiben unpersönlich.
  const kindTreffer = url.pathname.match(/^\/(paul|leon|helena)(?:\/|$)/);
  if (!kindTreffer) {
    return response;
  }
  const kind = kindTreffer[1];

  // Pauls Speicher behält seinen alten Namen - er ist der einzige mit Inhalt
  // aus der Zeit davor, und ein Umzug wäre nur eine Fehlerquelle.
  const speicher = kind === "paul" ? "paul-blob" : "blob:" + kind;

  // Fortschritt holen (defensiv – bei Fehler: nichts seeden).
  let blobJson = "null";
  try {
    if (env.PAUL_KV) {
      const stored = await env.PAUL_KV.get(speicher);
      if (stored) blobJson = stored;
    }
  } catch (e) {
    blobJson = "null";
  }

  // Seed-Skript: schreibt die Cloud-Werte in localStorage, BEVOR die Spiel-Skripte laufen.
  // Wird ganz vorne in den <head> gesetzt, läuft also als Erstes.
  const seedScript =
    "<script>(function(){try{var d=" +
    blobJson +
    ';if(d&&typeof d==="object"){for(var k in d){if(Object.prototype.hasOwnProperty.call(d,k)){try{localStorage.setItem(k,d[k]);}catch(e){}}}}' +
    // Marke fuer das Sync-Skript: Der Stand aus der Cloud ist angekommen.
    // Nur dann darf es den Cloud-Stand ERSETZEN und damit auch Geloeschtes
    // wirklich loeschen. Ohne die Marke wird nur zusammengefuehrt - sonst
    // koennte ein Geraet, dem der Seed nicht geglueckt ist, alles wegwischen.
    'window.__lwStandGeladen=true;' +
    '}catch(e){}})();<\/script>';

  // Sync-Skript: schiebt spätere Änderungen zurück in die Cloud. Timing unkritisch.
  const syncScript = '<script src="/paul-sync.js" defer><\/script>';

  return new HTMLRewriter()
    .on("head", {
      element(el) {
        el.prepend(seedScript, { html: true });
        el.append(syncScript, { html: true });
      },
    })
    .transform(response);
}
