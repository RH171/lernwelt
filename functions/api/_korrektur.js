/* Verbessert durch Claude (14.10.2026)
 *
 * Denny am 14.10.2026, 14:19 Uhr: "Wenn der Paul sagt: ‚Ja, er hat es
 * verbessert', dann hat er das in seinem Heft verbessert, aber das Bild, das
 * er hochgeladen hat, natürlich nicht. Ich würde es als umständlich erachten,
 * dass Paul erst nochmal hochladen muss. … Es wäre aber sinnig, wenn deutlich
 * hervorgeht, dass du das hier korrigiert hast … ‚durch KI' oder ‚durch Claude'."
 *
 * Was passiert, wenn eine Stelle erledigt ist (📌/✍️ "Verbessert ✓", 🧮 richtig
 * nachgerechnet):
 *   1. Die Zeile im gespeicherten Blattinhalt wird verbessert - Pauls falscher
 *      Wert raus, der richtige rein, dahinter die MARKE "(✓ verbessert · durch
 *      Claude)". Aus dieser Zeile bauen Quiz, Fundkarten und "Heute lernen"
 *      ihre Fragen; _herkunft.js erkennt die Marke als Herkunft "verbessert".
 *   2. Am Eintrag hängt der Verlauf `korrekturen: [{ stelle, war, korrigiert,
 *      von: "claude", am, quelle: pinnwand|nachgerechnet|lehrerin, ort?, vorher?, zeile? }]`.
 *      `vorher` ist die alte Zeile im Wortlaut - nichts geht verloren.
 *   3. Fundkarten am Blatt, deren "richtig" Pauls falscher Wert war, bekommen
 *      den richtigen.
 *   4. Das FOTO bleibt unangetastet. Die Verbesserung ist eine Überlagerung
 *      im Browser (/fehlerkreis.js): grüner Kreis, richtige Antwort, "verbessert ·
 *      durch Claude".
 * "Stimmt doch so" und "Später" ändern nichts.
 *
 * Bei ✍️ hat die Lehrerin schon rot verbessert - die Zeile trägt ihre Verbesserung
 * bereits. Dort wird nur der Verlauf geschrieben (quelle "lehrerin"), die Zeile bleibt.
 */
import { kindSchrieb, falten } from "./_lehrervorlagen.js";
import { MARKE, MARKE_RE, rechteck, ortGilt } from "./_fehlerkreis.js";
export { korrekturenErneuern } from "./_korrekturhalt.js";
import { listeLesen, KAPUTT, monatVon, heuteBerlin } from "./_schulstoff.js";

const OP_ZEIGEN = { "*": "·", "/": ":", "+": "+", "-": "−" };

function wortErsetzen(text, alt, neu) {
  const esc = String(alt).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("(^|[^\\p{L}\\p{N}])" + esc + "(?![\\p{L}\\p{N}])", "gu");
  let letzte = -1, m;
  while ((m = re.exec(text))) { letzte = m.index + m[1].length; if (re.lastIndex === m.index) re.lastIndex++; }
  if (letzte < 0) return null;
  return text.slice(0, letzte) + neu + text.slice(letzte + String(alt).length);
}

/* "Kind schrieb X, richtig: Y" durch den Wert ersetzen - der Leerraum davor bleibt. */
function ganzErsetzen(zeile, ganz, wert) {
  const vorn = (/^\s*/.exec(ganz) || [""])[0];
  return zeile.replace(ganz, (zeile.indexOf(ganz) > 0 && !vorn ? " " : vorn) + wert);
}

/* Aus einer erledigten Stelle (mit Wahrheit, vom Server) die Korrektur.
 * Gibt null, wenn es nichts zu verbessern gibt. */
export function korrekturFuer(s, jetzt) {
  if (!s) return null;
  const am = jetzt || new Date().toISOString();
  const grund = { stelle: s.id, von: "claude", am };
  if (s.art === "lehrerin") {
    return { ...grund, quelle: "lehrerin", war: "", korrigiert: (s.zeilen || []).join("; ").slice(0, 200) };
  }
  const zeile = String(s.zeile || "");
  let korrigiert = "", neu = null;
  if (s.art === "rechnen" && s.typ === "teiler") {
    korrigiert = s.soll.join(", ");
    const k = kindSchrieb(zeile);
    if (k) neu = ganzErsetzen(zeile, k.ganz, s.n + ": " + korrigiert);
  } else if (s.art === "rechnen" && s.typ === "gleichung") {
    korrigiert = String(s.soll);
    const g = { ...s.g, [s.luecke]: s.soll };
    const k = kindSchrieb(zeile);
    if (k) neu = ganzErsetzen(zeile, k.ganz, g.a + " " + OP_ZEIGEN[g.op] + " " + g.b + " = " + g.c);
  } else if (s.art === "pinnwand") {
    korrigiert = String(s.soll || "");
    const k = kindSchrieb(zeile);
    if (k) neu = ganzErsetzen(zeile, k.ganz, korrigiert);
    else if (s.du) neu = wortErsetzen(zeile, s.du, korrigiert);
  } else return null;
  if (!korrigiert) return null;
  const quelle = s.art === "pinnwand" ? "pinnwand" : "nachgerechnet";
  const out = { ...grund, quelle, war: String(s.du || "").slice(0, 120), korrigiert: korrigiert.slice(0, 120) };
  if (neu && neu !== zeile && !MARKE_RE.test(zeile)) {
    out.vorher = zeile.slice(0, 200);
    out.zeile = (neu.replace(/\s+/g, " ").trim() + " " + MARKE).slice(0, 200);
  }
  return out;
}

/* Die Korrektur auf einen Eintrag anwenden (ohne Speicher - für Server und Prüfung).
 * Gibt den geänderten Eintrag zurück (Kopie) und was sich geändert hat. */
export function korrekturAnwenden(eintrag, k) {
  const e = { ...eintrag };
  const liste = Array.isArray(e.korrekturen) ? e.korrekturen.slice() : [];
  if (liste.some((x) => x && x.stelle === k.stelle)) return { eintrag: e, neu: false };
  let zeileGeaendert = false, kartenGeaendert = 0;
  if (k.zeile && k.vorher && Array.isArray(e.inhalt)) {
    const i = e.inhalt.findIndex((z) => String(z) === k.vorher);
    if (i >= 0) { e.inhalt = e.inhalt.slice(); e.inhalt[i] = k.zeile; zeileGeaendert = true; }
  }
  if (k.war && k.korrigiert && Array.isArray(e.karten)) {
    e.karten = e.karten.map((c) => {
      if (!c || falten(c.richtig) !== falten(k.war)) return c;
      kartenGeaendert++;
      const falsch = (c.falsch || []).filter((f) => falten(f) !== falten(k.korrigiert));
      if (!falsch.some((f) => falten(f) === falten(k.war))) falsch.push(k.war);
      return { ...c, richtig: k.korrigiert, falsch: falsch.slice(0, 3) };
    });
  }
  const eintragK = { ...k };
  if (!zeileGeaendert) { delete eintragK.zeile; }
  liste.push(eintragK);
  e.korrekturen = liste.slice(-40);
  return { eintrag: e, neu: true, zeileGeaendert, kartenGeaendert };
}

/* Quiz: Eine Frage, deren richtige Antwort Pauls verbesserter FALSCHER Wert ist,
 * fällt beim Lesen heraus (kein Schreibvorgang) - der Vorrat baut neu nach. */
export function frageGegenKorrektur(f, blatt) {
  const ks = (blatt && Array.isArray(blatt.korrekturen)) ? blatt.korrekturen : [];
  if (!ks.length || !f) return false;
  const r = falten((f.antworten || [])[f.richtig || 0]);
  if (!r) return false;
  return ks.some((k) => k && k.war && falten(k.war) === r && falten(k.korrigiert) !== r);
}

/* Was der Browser zur Überlagerung bekommt: nur Verbesserungen mit Ort. */
export function gruenFuer(blatt) {
  const ks = (blatt && Array.isArray(blatt.korrekturen)) ? blatt.korrekturen : [];
  const aus = [];
  for (const k of ks) {
    if (!k || !Array.isArray(k.ort)) continue;
    for (const o of k.ort) {
      /* Neues Foto (14.10.2026): ein Ort vom alten Foto zeigt nichts mehr. */
      if (!ortGilt({ ...o, am: k.am }, blatt.fotoNeu)) continue;
      const r = rechteck(o);
      if (!r) continue;
      aus.push({ ...r,
                 text: k.quelle === "lehrerin" ? "" : String(k.korrigiert || "").slice(0, 60),
                 quelle: k.quelle });
    }
  }
  return aus.slice(0, 30);
}

/* Für den Browser (GET /api/schulstoff): Korrektur-Orte vom alten Foto
   weglassen - der Verlauf selbst bleibt vollständig. Ändert nichts im Speicher. */
export function korrekturenFuerBrowser(blatt) {
  if (!blatt || !blatt.fotoNeu || !Array.isArray(blatt.korrekturen)) return blatt;
  return { ...blatt, korrekturen: blatt.korrekturen.map((k) => {
    if (!k || !Array.isArray(k.ort)) return k;
    const ort = k.ort.filter((o) => ortGilt({ ...o, am: k.am }, blatt.fotoNeu));
    if (ort.length === k.ort.length) return k;
    const c = { ...k };
    if (ort.length) c.ort = ort; else delete c.ort;
    return c;
  }) };
}

/* Speichern: EIN Schreibvorgang in die Monatsliste des Blattes (dort, wo auch
 * inhaltSetzen() schreibt). Gesucht wird zuerst im Monat des Blattdatums,
 * dann in den 14 Monaten davor. Gibt { ok, ... } - wirft nie. */
export async function korrekturSetzen(env, kind, blatt, k) {
  if (!env || !env.PAUL_KV || !blatt || !k) return { ok: false };
  const monate = [];
  const m0 = monatVon(blatt.datum);
  if (/^\d{4}-\d{2}$/.test(m0)) monate.push(m0);
  const heute = heuteBerlin();
  for (let i = 0; i < 14; i++) {
    const d = new Date(heute + "T12:00:00Z");
    d.setUTCMonth(d.getUTCMonth() - i);
    const m = d.toISOString().slice(0, 7);
    if (!monate.includes(m)) monate.push(m);
  }
  for (const monat of monate) {
    const schluessel = "stoff:" + kind + ":" + monat;
    let roh;
    try { roh = await env.PAUL_KV.get(schluessel); } catch (e) { return { ok: false }; }
    const liste = listeLesen(roh);
    if (liste === KAPUTT) return { ok: false };
    const i = liste.findIndex((e) => e && e.id === blatt.id);
    if (i < 0) continue;
    const r = korrekturAnwenden(liste[i], k);
    if (!r.neu) return { ok: true, schon: true };
    liste[i] = r.eintrag;
    try { await env.PAUL_KV.put(schluessel, JSON.stringify(liste)); } catch (e) { return { ok: false }; }
    return { ok: true, zeile: !!r.zeileGeaendert, karten: r.kartenGeaendert };
  }
  return { ok: false, fehlt: true };
}
