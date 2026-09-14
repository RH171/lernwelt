// Warum nimmt der Speicher nichts an? Diese Frage muss der Server selbst
// beantworten koennen.
//
// GET /api/speicher-pruefen   -> {lesen, schreiben, fehler:{name, meldung}}
//
// Hintergrund: Am 14.09.2026 ab 13:54 UTC warf jedes env.PAUL_KV.put(...),
// waehrend jedes get(...) weiter mit 200 antwortete. Nach aussen kam nur die
// nackte Seite "error code: 1101" - die sagt bloss "der Worker ist gestolpert"
// und verschweigt, worueber. Helena hat zu Recht darauf bestanden, dass die
// Werkstatt den Grund kennt, statt zu raten. Genau das steht jetzt hier.
//
// Warum hinter dem Elternausweis: Jeder Aufruf kostet einen Schreibvorgang,
// und Schreibvorgaenge sind hier die knappe Zahl (siehe aktiv.js). Offen im
// Netz koennte ein Fremder damit das Tageskontingent leerlaufen lassen - also
// genau den Zustand ausloesen, den diese Datei aufklaeren soll.

import { ausweisGueltig, geheimFuer } from "./_riegel.js";

const SCHLUESSEL = "speicher:probe";

export async function onRequestGet(context) {
  const { request, env } = context;

  const geheim = geheimFuer(env, "eltern");
  if (!geheim || !(await ausweisGueltig(request, geheim, env)))
    return json(401, { ok: false, fehler: "Nicht angemeldet." });

  if (!env.PAUL_KV)
    return json(200, { ok: false, gebunden: false, hinweis: "PAUL_KV ist gar nicht eingerichtet." });

  const bericht = { ok: true, gebunden: true, zeit: new Date().toISOString() };

  // Lesen zuerst - es lief bisher immer weiter und taeuscht deshalb Gesundheit vor.
  try {
    await env.PAUL_KV.get(SCHLUESSEL);
    bericht.lesen = "geht";
  } catch (e) {
    bericht.lesen = "geht nicht";
    bericht.lesenFehler = fehlerBild(e);
  }

  // Ein einziger, winziger Schreibvorgang mit kurzer Haltbarkeit. Mehr nicht -
  // wenn das Kontingent wirklich die Ursache ist, soll die Pruefung es nicht
  // weiter belasten.
  try {
    await env.PAUL_KV.put(SCHLUESSEL, String(Date.now()), { expirationTtl: 120 });
    bericht.schreiben = "geht";
  } catch (e) {
    bericht.schreiben = "geht nicht";
    bericht.fehler = fehlerBild(e);
    bericht.deutung = deuten(bericht.fehler);
  }

  return json(200, bericht);
}

// Die Fehlermeldung von Cloudflare traegt den eigentlichen Grund im Text -
// etwa "KV PUT failed: 429 Too Many Requests" beim erschoepften Tageskontingent.
// Deshalb wird sie vollstaendig durchgereicht und nicht zusammengefasst.
function fehlerBild(e) {
  return {
    name: (e && e.name) || "unbekannt",
    meldung: String((e && e.message) || e || "").slice(0, 500),
  };
}

// Aus der Meldung eine Vermutung in Worten. Bewusst als "Vermutung"
// gekennzeichnet: Was nicht in der Meldung steht, wird hier nicht behauptet.
function deuten(f) {
  const t = (f.meldung || "").toLowerCase();
  if (t.includes("429") || t.includes("too many") || t.includes("limit") || t.includes("exceed"))
    return "Das Tageskontingent fuer Schreibvorgaenge ist aufgebraucht. Es beginnt um 00:00 UTC neu.";
  if (t.includes("quota") || t.includes("storage"))
    return "Der Platz im Speicher ist voll.";
  if (t.includes("403") || t.includes("unauthorized") || t.includes("forbidden"))
    return "Der Worker darf nicht in diesen Speicher schreiben - eine Frage der Berechtigung.";
  if (t.includes("404") || t.includes("not found"))
    return "Der Speicher, in den geschrieben werden soll, ist nicht da.";
  return "Die Meldung passt in kein bekanntes Muster - hier bitte nicht raten, sondern die Meldung oben lesen.";
}

function json(status, daten) {
  return new Response(JSON.stringify(daten, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
