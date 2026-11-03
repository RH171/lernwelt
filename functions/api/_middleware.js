/* Kindergrenze für die Personen-Zugänge des Elternbereichs (Auftrag 195, 03.11.2026).
 *
 * Läuft vor jeder /api/-Anfrage (nach functions/_middleware.js, das /api/ unverändert
 * durchreicht). Ohne Personen-Ausweis (Cookie lw_werkstatt im Format "p1.…") tut diese
 * Datei NICHTS: Die Anfrage geht unverändert weiter, ohne Speicherzugriff. Damit bleibt bei
 * schalter:elternzugang = "alt" alles wie vorher, und Kinder, Werkzeuge und der alte
 * Eltern-Code merken nichts.
 *
 * Mit Personen-Ausweis gilt STANDARD VERBIETEN:
 *  - Nur Endpunkte aus REGELN bekommen den Ausweis zu sehen, und nur, wenn das Kind aus
 *    Adresse, Rumpf oder Speicher eindeutig hervorgeht und zum Zugang gehört (sonst 403).
 *  - Antworten mit mehreren Kindern werden auf die erlaubten gefiltert.
 *  - Jeder andere Endpunkt bekommt die Anfrage OHNE Ausweis: Für ihn ist der Besucher
 *    nicht angemeldet. Öffentliches bleibt öffentlich, Geschütztes antwortet 401.
 */
import { personenCookieDa, personPruefen } from "./_elternzugang.js";
import { listeLesen as zurueckListe } from "./_zurueck.js";

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});
const nichtDeins = () => json(403, { ok: false, fehler: "Dieses Kind gehört nicht zu deinem Zugang." });

/* Ohne Ausweis weiterreichen: Cookie lw_werkstatt fällt weg, alle anderen bleiben. */
function ohneAusweis(request) {
  const h = new Headers(request.headers);
  const rest = String(h.get("cookie") || "").split(/;\s*/).filter((c) => c && !/^lw_werkstatt=/.test(c));
  if (rest.length) h.set("cookie", rest.join("; ")); else h.delete("cookie");
  return new Request(request, { headers: h });
}

async function rumpf(request) {
  try { return await request.clone().json(); } catch (e) { return null; }
}

/* Antwort mit mehreren Kindern auf die erlaubten zuschneiden. */
async function filtern(antwort, kinder) {
  const typ = antwort.headers.get("content-type") || "";
  if (!typ.includes("application/json")) return antwort;
  let d;
  try { d = await antwort.clone().json(); } catch (e) { return antwort; }
  if (!d || typeof d !== "object") return antwort;
  let geaendert = false;
  if (d.kinder && typeof d.kinder === "object" && !Array.isArray(d.kinder)) {
    for (const k of Object.keys(d.kinder)) if (!kinder.includes(k)) { delete d.kinder[k]; geaendert = true; }
  }
  for (const feld of ["meldungen", "papierkorb"]) {
    if (Array.isArray(d[feld])) {
      const vorher = d[feld].length;
      d[feld] = d[feld].filter((m) => m && kinder.includes(String(m.kind || "").toLowerCase()));
      if (d[feld].length !== vorher) geaendert = true;
    }
  }
  if (!geaendert) return antwort;
  const h = new Headers(antwort.headers);
  h.delete("content-length");
  return new Response(JSON.stringify(d), { status: antwort.status, headers: h });
}

const kindAusAdresse = (url) => String(url.searchParams.get("kind") || "").toLowerCase();

/* Ein Faden der Meldungen: wem gehört er? */
async function fadenKind(env, id) {
  if (!id || !env.PAUL_KV) return null;
  try {
    const l = JSON.parse((await env.PAUL_KV.get("meldungen")) || "[]");
    const f = Array.isArray(l) ? l.find((m) => m && m.id === id) : null;
    return f ? String(f.kind || "").toLowerCase() : null;
  } catch (e) { return null; }
}

/* Gehört ein Blatt der Ablage (stoff:<kind>:<monat>) zu diesem Kind? */
async function stoffBildVonKind(env, kind, id) {
  if (!env.PAUL_KV || !/^[a-z0-9]{6,20}$/.test(String(id || ""))) return false;
  try {
    let cursor;
    do {
      const s = await env.PAUL_KV.list({ prefix: "stoff:" + kind + ":", cursor });
      for (const k of s.keys) {
        const roh = await env.PAUL_KV.get(k.name);
        if (!roh) continue;
        try {
          const l = JSON.parse(roh);
          if (Array.isArray(l) && l.some((e) => e && e.id === id)) return true;
        } catch (e) {}
      }
      cursor = s.list_complete ? null : s.cursor;
    } while (cursor);
  } catch (e) {}
  return false;
}

async function zurueckBildVonKind(env, kind, id) {
  const l = await zurueckListe(env, kind);
  return Array.isArray(l) && l.some((e) => e && String(e.id) === String(id).replace(/[^a-z0-9]/gi, ""));
}

/* Erlaubt-Liste: Pfad -> Methode -> Prüfung. Prüfung liefert eine Antwort
   oder "weiter" (mit Ausweis weiterreichen und filtern). */
const W = "weiter";
const kindMuss = (kinder, k) => (k && kinder.includes(k) ? W : nichtDeins());
const kindWennDa = (kinder, k) => (!k || kinder.includes(k) ? W : nichtDeins());

const REGELN = {
  "/api/statistik": {
    GET: async ({ url, ich }) => kindWennDa(ich.kinder, kindAusAdresse(url)),
  },
  "/api/anwesend": {
    GET: async () => W,
  },
  "/api/melden": {
    GET: async ({ url, env, ich }) => {
      if (url.searchParams.get("meine") === "1") return "ohne";
      const bild = url.searchParams.get("bild");
      if (bild) return kindMuss(ich.kinder, await fadenKind(env, String(bild).split(":")[0]));
      return W;
    },
    DELETE: async ({ url, env, ich }) => kindMuss(ich.kinder, await fadenKind(env, url.searchParams.get("id"))),
  },
  "/api/schulstoff": {
    GET: async ({ url, env, ich }) => {
      const k = kindAusAdresse(url);
      if (!k || !ich.kinder.includes(k)) return nichtDeins();
      const bild = url.searchParams.get("bild");
      if (bild && !(await stoffBildVonKind(env, k, String(bild).split(":")[0]))) return nichtDeins();
      return W;
    },
  },
  "/api/noten": {
    GET: async ({ url, ich }) => kindWennDa(ich.kinder, kindAusAdresse(url)),
    POST: async ({ request, url, ich }) => {
      const d = await rumpf(request);
      return kindMuss(ich.kinder, String((d && d.kind) || kindAusAdresse(url)).toLowerCase());
    },
    DELETE: async ({ url, ich }) => kindMuss(ich.kinder, kindAusAdresse(url)),
  },
  "/api/pruefreiter": {
    GET: async ({ url, ich }) => kindMuss(ich.kinder, kindAusAdresse(url)),
    POST: async ({ request, url, ich }) => {
      const d = await rumpf(request);
      return kindMuss(ich.kinder, String((d && d.kind) || kindAusAdresse(url)).toLowerCase());
    },
  },
  "/api/zurueck": {
    GET: async ({ url, env, ich }) => {
      if (url.searchParams.get("alle") === "1") return W;
      const k = kindAusAdresse(url);
      if (!k || !ich.kinder.includes(k)) return nichtDeins();
      const bild = url.searchParams.get("bild");
      if (bild && !(await zurueckBildVonKind(env, k, String(bild).split(":")[0]))) return nichtDeins();
      return W;
    },
    POST: async ({ request, url, ich }) => {
      const d = await rumpf(request);
      return kindMuss(ich.kinder, String((d && d.kind) || kindAusAdresse(url)).toLowerCase());
    },
  },
  "/api/probenvergleich": {
    GET: async ({ url, ich }) => kindMuss(ich.kinder, kindAusAdresse(url)),
  },
  "/api/lehrervorlagen": {
    GET: async ({ url, ich }) => kindMuss(ich.kinder, kindAusAdresse(url)),
  },
  "/api/tagesrechnen": {
    GET: async ({ ich }) => kindMuss(ich.kinder, "paul"),
  },
  "/api/einmaleinswoche": {
    GET: async ({ ich }) => kindMuss(ich.kinder, "paul"),
  },
  // Selbstauskunft und Abmelden brauchen den Ausweis selbst.
  "/api/eltern-ich": { GET: async () => W },
  "/api/abmelden":   { POST: async () => W },
};

export async function onRequest(context) {
  const { request, env, next } = context;
  if (!personenCookieDa(request)) return next();          // alter Weg, unverändert

  const url = new URL(request.url);
  const pfad = url.pathname.replace(/\/+$/, "");
  const regel = REGELN[pfad] && REGELN[pfad][request.method.toUpperCase()];
  if (!regel) return next(ohneAusweis(request));          // Standard: wie nicht angemeldet

  const ich = await personPruefen(request, env);
  if (!ich) return next(ohneAusweis(request));

  const urteil = await regel({ request, url, env, ich });
  if (urteil instanceof Response) return urteil;
  if (urteil === "ohne") return next(ohneAusweis(request));
  return filtern(await next(), ich.kinder);
}
