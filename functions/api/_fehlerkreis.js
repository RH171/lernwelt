/* Fehlerkreis (14.10.2026): ein roter Kreis um die Stelle, die nachzusehen ist
 *
 * Denny am 14.10.2026, 14:16 Uhr: "Könntest du bei den Vorschauen, wo noch
 * verbessert werden muss, umkringeln, wo der Fehler ist? Ich musste bei beiden
 * Dokumenten immer ein bisschen suchen." Per Klickfrage: "Gleich fest einbauen".
 *
 * Und sein Zusatz (14:19 Uhr): Ist eine Stelle verbessert, steht auf dem Bild
 * die Verbesserung - grün, mit "verbessert · durch Claude". Das Foto selbst
 * wird NIE verändert, alles ist eine Überlagerung im Browser.
 *
 * Hier liegt alles, was Server, Werkzeug und Prüfung gemeinsam brauchen:
 *   - zieleFuerStelle(), zielFuerVorlage()   was zu orten ist
 *   - ortAuftrag()       der Text ans Modell (Pixel-Rechteck je Ziel, alle Seiten)
 *   - ortLesen()         die Antwort -> Rechtecke in Prozent, geklammert 0-100
 *   - orten()            EIN Modellaufruf je Blatt, wirft nie
 *   - jpegMasse()        Breite/Höhe aus dem JPEG-Kopf (ohne Bildbibliothek)
 *   - kreiseLesen/-Schreiben, ortFuer(), vorlageOrt()   Speicher und Abfrage
 *
 * WARUM PIXEL STATT PROZENT: Die Fundkarten (Kapitel 033/055) liessen das
 * Modell Zeilen in Prozent schätzen - es lag systematisch 6-12 Prozentpunkte
 * zu hoch. Hier nennt das Modell Pixel im Bild, die Maße kennt es aus dem
 * Auftrag; umgerechnet wird erst hier. Gemessen am 14.10.2026 an Pauls echten
 * Blättern: 6 von 6 Stellen getroffen, schon im ersten Durchgang. Ein zweiter
 * Blick auf einen Ausschnitt war deshalb nicht nötig (und ginge im Worker ohne
 * Bildbibliothek nicht). Kontrollbilder: befunde/2026-10-14-fehlerkreis/.
 *
 * Speicher: EIN Schlüssel `fehlerkreis:<kind>`
 *   { v:1, b: { <blatt>: { <ziel>: { s, x, y, b, h } | { nicht: 1 }, ... } },
 *          vorlagen: { <vorlage>: { <nr>: { x, y, b, h } } } }
 * Ein Schreibvorgang je georteten Blatt (alle Ziele gebündelt).
 */

export const MODELL = "claude-opus-5-5";
export const SCHLUESSEL = (kind) => "fehlerkreis:" + kind;
export const MARKE = "(✓ verbessert · durch Claude)";
export const MARKE_RE = /\s*\(✓ verbessert · durch Claude\)/;

const zahl = (v) => (typeof v === "number" && isFinite(v) ? v : Number(v));
export function klammern(v) { const n = zahl(v); return isFinite(n) ? Math.min(100, Math.max(0, Math.round(n * 10) / 10)) : 0; }

/* Ein Rechteck in Prozent, sicher: x,y in 0-100, b,h > 0 und nicht über den Rand.
   Gibt null, wenn nichts Brauchbares darin steht. */
export function rechteck(o) {
  if (!o || typeof o !== "object") return null;
  let x = klammern(o.x), y = klammern(o.y), b = klammern(o.b), h = klammern(o.h);
  if (b <= 0 || h <= 0) return null;
  if (x + b > 100) b = Math.round((100 - x) * 10) / 10;
  if (y + h > 100) h = Math.round((100 - y) * 10) / 10;
  if (b <= 0 || h <= 0) return null;
  const s = Math.min(8, Math.max(0, Math.floor(zahl(o.s) || 0)));
  return { s, x, y, b, h };
}

/* ---------- JPEG-Kopf ---------- */
export function jpegMasse(bytes) {
  const u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (u[0] !== 0xff || u[1] !== 0xd8) {
    /* PNG */
    if (u[0] === 0x89 && u[1] === 0x50) return { b: (u[16] << 24 | u[17] << 16 | u[18] << 8 | u[19]) >>> 0, h: (u[20] << 24 | u[21] << 16 | u[22] << 8 | u[23]) >>> 0 };
    return null;
  }
  let i = 2;
  while (i + 9 < u.length) {
    if (u[i] !== 0xff) { i++; continue; }
    const m = u[i + 1];
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
    const len = (u[i + 2] << 8) | u[i + 3];
    if ((m >= 0xc0 && m <= 0xc3) || (m >= 0xc5 && m <= 0xc7) || (m >= 0xc9 && m <= 0xcb) || (m >= 0xcd && m <= 0xcf)) {
      return { h: (u[i + 5] << 8) | u[i + 6], b: (u[i + 7] << 8) | u[i + 8] };
    }
    i += 2 + len;
  }
  return null;
}
export function dataUrlBytes(url) {
  const s = String(url || "");
  const k = s.indexOf(",");
  const b64 = k >= 0 ? s.slice(k + 1) : s;
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

/* ---------- Was zu orten ist ---------- */

/* Eine Stelle des Prüf-Reiters (mit Wahrheit, vom Server) -> Ziele.
   ✍️ hat EINE Karte, aber je rote Zeile einen Kreis. */
export function zieleFuerStelle(s) {
  if (!s) return [];
  if (s.art === "rechnen" && s.typ === "teiler")
    return [{ id: s.id, text: "die Aufgabe \"Teiler von " + s.n + "\": dort steht die Zahl " + s.n +
      " und dahinter hat das Kind " + JSON.stringify(s.du) + " geschrieben. Das Rechteck umfasst die Zahl " + s.n + " und die Teiler des Kindes." }];
  if (s.art === "rechnen" && s.typ === "gleichung") {
    const g = s.g, op = { "*": "·", "/": ":", "+": "+", "-": "−" }[g.op];
    return [{ id: s.id, text: "die Rechnung " + g.a + " " + op + " " + g.b + " = " + g.c +
      " (vielleicht in einer Tabelle: Zeile und Spalte ergeben die Rechnung). Das Kind hat dort " + JSON.stringify(s.du) +
      " eingetragen. Das Rechteck umfasst genau diese eingetragene Zahl " + JSON.stringify(s.du) + "." }];
  }
  if (s.art === "pinnwand")
    return [{ id: s.id, text: "das Feld zur Aufgabe " + JSON.stringify(s.aufgabe) + ". Dort hat das Kind " +
      JSON.stringify(s.du) + " eingetragen. Das Rechteck umfasst genau dieses eingetragene Wort." }];
  if (s.art === "lehrerin")
    return (s.zeilen || []).map((z, i) => ({ id: s.id + "#" + i, text: "die Stelle, die die Lehrerin rot verbessert hat: " + JSON.stringify(z) }));
  return [];
}

/* Die Zeile einer Vorlage der Lehrerin -> Ziel. */
export function zielFuerVorlage(vz) {
  return { id: String(vz.nr), text: "das Feld zur Aufgabe " + JSON.stringify(vz.aufgabe) +
    ". Dort steht die Antwort " + JSON.stringify(vz.antwort) + ". Das Rechteck umfasst genau diese Antwort." };
}

/* ---------- Der Auftrag ans Modell ----------
   masse = [{b,h}] je Seite (ein Bild je Seite, in dieser Reihenfolge). */
export function ortAuftrag(ziele, masse) {
  const m = Array.isArray(masse) ? masse : [masse];
  const mehr = m.length > 1;
  const groesse = (x) => (x && x.b && x.h ? x.b + " Pixel breit und " + x.h + " Pixel hoch" : "");
  return (mehr
    ? "Das sind " + m.length + " Fotos (Seite 1 bis " + m.length + ") von einem Schulblatt eines Kindes. " +
      m.map((x, i) => groesse(x) ? "Seite " + (i + 1) + " ist " + groesse(x) + "." : "").filter(Boolean).join(" ") + " "
    : "Das ist ein Foto von einem Schulblatt eines Kindes. " + (groesse(m[0]) ? "Das Bild ist " + groesse(m[0]) + ". " : "")) +
    "Finde jede der folgenden Stellen und gib ein enges Rechteck in Pixeln des Bildes an " +
    "(x und y = linke obere Ecke, b = Breite, h = Höhe" + (mehr ? ", seite = auf welcher Seite, 1 bis " + m.length : "") + "). " +
    "Achte genau auf die Höhe: das Rechteck sitzt auf der Schrift selbst, nicht auf der Zeile darüber.\n\n" +
    ziele.map((z, i) => "Stelle " + (i + 1) + " (id " + z.id + "): " + z.text).join("\n") +
    "\n\nAntworte NUR mit JSON, ohne weiteren Text, genau so:\n" +
    "{\"stellen\":[{\"id\":\"...\"," + (mehr ? "\"seite\":1," : "") + "\"x\":0,\"y\":0,\"b\":0,\"h\":0}]}\n" +
    "Findest du eine Stelle nicht sicher, lass x,y,b,h weg und schreib \"nicht\":true.";
}

/* Antworttext -> { <id>: {s,x,y,b,h} in Prozent } bzw. { nicht: 1 }. */
export function ortLesen(text, masse, ids) {
  const m = Array.isArray(masse) ? masse : [masse];
  const aus = {};
  const t = String(text || "");
  const a = t.indexOf("{"), e = t.lastIndexOf("}");
  if (a < 0 || e <= a) return aus;
  let d;
  try { d = JSON.parse(t.slice(a, e + 1)); } catch (x) { return aus; }
  const liste = Array.isArray(d && d.stellen) ? d.stellen : [];
  for (const s of liste) {
    const id = String(s && s.id || "");
    if (!id || (ids && !ids.includes(id))) continue;
    if (s.nicht) { aus[id] = { nicht: 1 }; continue; }
    const seite = m.length > 1 ? Math.min(m.length, Math.max(1, Math.floor(zahl(s.seite) || 1))) - 1 : 0;
    const W = (m[seite] && m[seite].b) || 0, H = (m[seite] && m[seite].h) || 0;
    if (!W || !H) continue;
    const r = rechteck({ s: seite, x: 100 * zahl(s.x) / W, y: 100 * zahl(s.y) / H, b: 100 * zahl(s.b) / W, h: 100 * zahl(s.h) / H });
    if (r) aus[id] = r;
  }
  return aus;
}

/* ---------- Modellaufruf (Server und Werkzeug) ----------
   bilder = data:-URL oder Liste davon (eine je Seite). Gibt { orte, usage, roh } - wirft nie.
   Ein Aufruf je Blatt, alle Ziele und alle Seiten zusammen. */
export async function orten(key, bilder, ziele, opt) {
  const o = opt || {};
  const liste = (Array.isArray(bilder) ? bilder : [bilder]).slice(0, 4).map(String);
  const masse = liste.map((b) => { try { return jpegMasse(dataUrlBytes(b)); } catch (e) { return null; } });
  const abbruch = typeof AbortController !== "undefined" ? new AbortController() : null;
  const uhr = abbruch ? setTimeout(() => abbruch.abort(), o.grenze || 60000) : null;
  try {
    const r = await (o.fetch || fetch)("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: abbruch ? abbruch.signal : undefined,
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODELL,
        /* Opus 5.5 denkt von selbst; Denk-Tokens zählen in max_tokens (Kapitel 029).
           Kein erzwungenes tool_choice - Opus 5.5 lehnt das ab. */
        max_tokens: 6000,
        thinking: { type: "adaptive" },
        output_config: { effort: o.effort || "low" },
        messages: [{ role: "user", content: liste.map((b) => ({ type: "image", source: {
            type: "base64", media_type: (/^data:([^;]+);/.exec(b) || [])[1] || "image/jpeg", data: b.slice(b.indexOf(",") + 1) } }))
          .concat([{ type: "text", text: ortAuftrag(ziele, masse) }]) }],
      }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j) return { orte: {}, usage: j && j.usage, fehler: "HTTP " + r.status, masse };
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    return { orte: ortLesen(text, masse, ziele.map((z) => z.id)), usage: j.usage, roh: text, masse };
  } catch (e) {
    return { orte: {}, fehler: String(e && e.name || e), masse };
  } finally { if (uhr) clearTimeout(uhr); }
}

/* Kosten einer Antwort in Euro (Opus 5.5: 4 $ je Mio. Eingabe, 20 $ je Mio.
   Ausgabe, Anthropic-Preisliste 09/2026; Kurs als Parameter). */
export function kostenEuro(usage, eurJeUsd) {
  if (!usage) return 0;
  const usd = (usage.input_tokens || 0) * 4e-6 + (usage.output_tokens || 0) * 20e-6;
  return usd * (eurJeUsd || 0.86);
}

/* ---------- Speicher ---------- */
export async function kreiseLesen(env, kind) {
  try {
    const roh = env && env.PAUL_KV ? await env.PAUL_KV.get(SCHLUESSEL(kind)) : null;
    const d = roh ? JSON.parse(roh) : null;
    if (d && typeof d === "object" && d.b && typeof d.b === "object")
      return { v: 1, b: d.b, vorlagen: d.vorlagen && typeof d.vorlagen === "object" ? d.vorlagen : {} };
  } catch (e) {}
  return { v: 1, b: {}, vorlagen: {} };
}
export async function kreiseSchreiben(env, kind, d) {
  await env.PAUL_KV.put(SCHLUESSEL(kind), JSON.stringify({ v: 1, b: d.b || {}, vorlagen: d.vorlagen || {} }));
}

/* Was der Browser zu einer Stelle bekommt: [{s,x,y,b,h}] - nie mehr. */
export function ortFuer(kreise, s) {
  const jeBlatt = (kreise && kreise.b && kreise.b[s.blatt && s.blatt.id]) || {};
  const aus = [];
  for (const z of zieleFuerStelle(s)) {
    const r = rechteck(jeBlatt[z.id]);
    if (r && !jeBlatt[z.id].nicht) aus.push(r);
  }
  return aus;
}
export function vorlageOrt(kreise, vorlageId, nr) {
  const r = kreise && kreise.vorlagen && kreise.vorlagen[vorlageId] && kreise.vorlagen[vorlageId][String(nr)];
  const q = rechteck(r);
  return q ? { x: q.x, y: q.y, b: q.b, h: q.h } : null;
}
/* Fehlt für diese Stelle noch eine Ortung (und ist sie nicht als "nicht gefunden" vermerkt)? */
export function fehltOrt(kreise, s) {
  const jeBlatt = (kreise && kreise.b && kreise.b[s.blatt && s.blatt.id]) || {};
  return zieleFuerStelle(s).some((z) => !jeBlatt[z.id]);
}
