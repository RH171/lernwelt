/* Probenfoto zuordnen (Auftrag 211, Punkt 2, 06.11.2026, nur Paul, Schalter "aktuell").
 *
 * Kommt das Foto einer vorlaeufigen Probe (Deutsch, HSU; Vorschlagsdatei _aktuell-vorschlag.js) ueber
 * "Zurueckbekommen" herein, liest Opus 5.5 einmal:
 *   1. das Datum auf der Probe. Geprueft: gueltiger Tag, Jahr passend gesetzt, nicht nach dem Hochladen,
 *      hoechstens 60 Tage davor. Sonst (oder ohne Datum) gilt das hinterlegte Probendatum. Keine Sondermeldung.
 *   2. je Blatt der letzten 5 Kalendertage vor diesem Datum (nach Schuldatum, schuldatum() wie ueberall):
 *      kommt sein Stoff in der Probe vor? ja -> Vorschlag "abgefragt" (abgeschlossen), nein -> "nicht abgefragt"
 *      (bleibt offen und wird weiter abgefragt).
 * Ergebnis: EIN Schreibvorgang in aktuell-probenfoto:paul. Es ist nur ein Vorschlag: Die Elternseite
 * (eltern/aktuell-abschluss.html) zeigt die Abweichungen zur vorlaeufigen Annahme (Auftrag 207/208) von selbst
 * und setzt die Stufen in der Vorschau vor. Abgeschlossen wird weiter nur durch "Ganze Liste bestaetigen"
 * (Regel F). Das Quiz liest diesen Schluessel nie, auch nicht bei schalter:aktuell = neu (R11 bleibt vorlaeufig).
 * Wirft nie.
 */
import { VORSCHLAG } from "./_aktuell-vorschlag.js";
import { schuldatum } from "./_aktuell.js";
import { fachNorm } from "./_wiedervorlage.js";
import { quellZeile } from "./_belegpruefung.js";

export const MODELL = "claude-opus-5-5";
export const PROBENFOTO_AN = true;       // Rueckweg: false = kein Lesen beim Hochladen, die Elternseite liest dann auch nicht nach
export const FOTO = (kind) => "aktuell-probenfoto:" + kind;
export const FENSTER_TAGE = 5;            // wie Regel 2 von Auftrag 208
export const NACH_PROBE_TAGE = 45;        // ein Foto zaehlt fuer eine Probe, wenn es bis dahin hochgeladen wurde
export const DATUM_ZURUECK_TAGE = 60;     // gelesenes Datum hoechstens so weit vor dem Hochladen
export const MIT_VOR_TAGEN = FENSTER_TAGE + 7; // so viele Tage vor dem hinterlegten Datum gehen Blaetter an Opus

const TAG = 86400000;
const DATUM = /^\d{4}-\d{2}-\d{2}$/;
const tagMEZ = (d) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(d);
const plus = (iso, n) => new Date(Date.parse(iso + "T12:00:00Z") + n * TAG).toISOString().slice(0, 10);
const gueltig = (iso) => DATUM.test(iso) && new Date(iso + "T12:00:00Z").toISOString().slice(0, 10) === iso;

/* Vorlaeufige Probe, zu der ein Zurueck-Eintrag gehoert: gleiches Fach, Foto da, hochgeladen am Probentag
   bis NACH_PROBE_TAGE danach. Mehrere passen: die juengste Probe. */
export function probeFuer(kind, eintrag) {
  if (!eintrag || !(Number(eintrag.seiten) > 0)) return null;
  const f = fachNorm(eintrag.fach === "sachunterricht" ? "hsu" : eintrag.fach);
  const up = Date.parse(eintrag.angelegt || "");
  if (!f || !Number.isFinite(up)) return null;
  const upTag = tagMEZ(new Date(up));
  const passend = ((VORSCHLAG && VORSCHLAG[kind] && VORSCHLAG[kind].proben) || [])
    .filter((p) => p && p.vorlaeufig && fachNorm(p.fach) === f && DATUM.test(p.probeDatum || "") &&
      upTag >= p.probeDatum && upTag <= plus(p.probeDatum, NACH_PROBE_TAGE))
    .sort((a, b) => (a.probeDatum < b.probeDatum ? 1 : -1));
  return passend[0] || null;
}

export const schluessel = (p) => fachNorm(p.fach) + ":" + (p.probeDatum || p.probe);

/* Datum auf der Probe pruefen. Rueckgabe { datum, quelle: "probe"|"hinterlegt", gelesen? }. */
export function probeDatumWaehlen(gelesen, hinterlegt, upTag) {
  const roh = String(gelesen || "").slice(0, 10);
  const nein = { datum: hinterlegt, quelle: "hinterlegt", ...(roh ? { gelesen: roh } : {}) };
  if (!DATUM.test(roh) || !DATUM.test(upTag || "")) return nein;
  let d = roh;
  if (!gueltig(d)) return nein;
  /* Falsches Jahr (am 28.10.2026 kam 2016 statt 2026): Tag und Monat behalten, Jahr des Hochladens,
     liegt es dann nach dem Hochladen, das Jahr davor. */
  if (d.slice(0, 4) !== upTag.slice(0, 4)) {
    d = upTag.slice(0, 4) + d.slice(4);
    if (gueltig(d) && d > upTag) d = String(Number(upTag.slice(0, 4)) - 1) + roh.slice(4);
    if (!gueltig(d)) return nein;
  }
  if (d > upTag || d < plus(upTag, -DATUM_ZURUECK_TAGE)) return nein;
  return { datum: d, quelle: "probe", ...(d !== roh ? { gelesen: roh } : {}) };
}

/* Blaetter der letzten FENSTER_TAGE Kalendertage vor dem Probendatum (ohne den Probentag), nach Schuldatum. */
export function fensterBlaetter(blaetter, fach, probeDatum) {
  const f = fachNorm(fach), von = plus(probeDatum, -FENSTER_TAGE), bis = plus(probeDatum, -1);
  return (blaetter || []).filter((b) => b && b.id && b.sichtbar !== false && fachNorm(b.fach) === f)
    .map((b) => ({ b, sd: schuldatum(b) }))
    .filter((x) => x.sd.datum && x.sd.datum >= von && x.sd.datum <= bis)
    .sort((x, y) => (x.sd.datum < y.sd.datum ? -1 : x.sd.datum > y.sd.datum ? 1 : String(x.b.id).localeCompare(String(y.b.id))));
}

export function auftragText(probe, fenster, hinterlegt) {
  const liste = fenster.map((x) => {
    const zeilen = (Array.isArray(x.b.inhalt) ? x.b.inhalt : []).map(quellZeile).filter(Boolean).slice(0, 40);
    return "### Blatt " + x.b.id + " · " + String(x.b.titel || x.b.thema || "(ohne Titel)") + " · Schuldatum " + x.sd.datum +
      "\n" + (zeilen.length ? zeilen.map((z) => "- " + z.slice(0, 240)).join("\n") : "(kein gelesener Inhalt, nur der Titel)");
  }).join("\n\n");
  return "Auf den Bildern ist eine zurückgegebene Probe eines Viertklässlers (Fach " + probe.fach + ", angekündigt als " +
    String(probe.probe || "") + " am " + hinterlegt + ").\n\n" +
    "Aufgabe 1: Steht auf der Probe ein Datum (Kopfzeile, Stempel, von der Lehrerin oder dem Kind geschrieben)? Gib es als JJJJ-MM-TT an, " +
    "sonst null. Rate kein Datum.\n\n" +
    "Aufgabe 2: Unten stehen die Heftblätter der letzten Schultage vor der Probe. Entscheide je Blatt nur nach dem Inhalt: " +
    "Wird Stoff dieses Blattes in der Probe abgefragt (gleiches Thema, gleiche Begriffe, Regel, Fertigkeit oder Tatsache)? " +
    "Ein bloß ähnliches Fach oder Oberthema reicht nicht. Nenne als Beleg die Aufgabe der Probe in einem kurzen Satz. " +
    "Kannst du es nicht sicher sagen, antworte \"nein\" (das Blatt bleibt dann offen und wird weiter geübt).\n\n" +
    "Gib NUR JSON zurück:\n" +
    "{\"datum\":\"2026-10-23\"|null,\"blaetter\":[{\"id\":\"<Blatt-Kennung>\",\"inProbe\":true|false,\"beleg\":\"Aufgabe 2 fragt die Nachsilbe -ung ab\"}]}\n\n" +
    (liste || "(keine Blätter in diesem Zeitraum)");
}

/* Ergebnis aus der Antwort von Opus bauen. Rein, ohne Netz. Fehlt ein Blatt in der Antwort: "nicht abgefragt". */
export function ergebnisBauen({ probe, eintrag, upTag, gelesen, blaetter, am }) {
  const hinterlegt = String(probe.probeDatum || "");
  const wahl = probeDatumWaehlen(gelesen && gelesen.datum, hinterlegt, upTag);
  const fenster = fensterBlaetter(blaetter, probe.fach, wahl.datum);
  const antw = {};
  for (const a of (gelesen && Array.isArray(gelesen.blaetter) ? gelesen.blaetter : [])) if (a && a.id) antw[String(a.id)] = a;
  const alt = {};
  for (const v of probe.blaetter || []) if (v && v.blattId) alt[String(v.blattId)] = v;
  const liste = fenster.map((x) => {
    const id = String(x.b.id), a = antw[id];
    const inProbe = !!(a && a.inProbe === true);
    const beleg = String((a && a.beleg) || "").replace(/\s+/g, " ").trim().slice(0, 240);
    const stufe = inProbe ? "abgefragt" : "nicht abgefragt";
    const vorher = alt[id] ? String(alt[id].stufe) : "";
    return { id, titel: String(x.b.titel || x.b.thema || "(ohne Titel)"), datum: x.sd.datum, stufe, inProbe,
             begruendung: (inProbe ? "Probenfoto: kommt in der Probe vor. " : "Probenfoto: kommt in der Probe nicht vor, bleibt offen. ") + beleg,
             vorher: vorher || "ohne Stufe", abweichung: vorher !== stufe };
  });
  return { v: 1, schluessel: schluessel(probe), fach: fachNorm(probe.fach), probe: String(probe.probe || ""),
           zurueckId: String(eintrag.id), hochgeladen: String(eintrag.angelegt || ""), seiten: Number(eintrag.seiten) || 0,
           probeDatumHinterlegt: hinterlegt, probeDatum: wahl.datum, datumQuelle: wahl.quelle, ...(wahl.gelesen ? { datumGelesen: wahl.gelesen } : {}),
           fenster: [plus(wahl.datum, -FENSTER_TAGE), plus(wahl.datum, -1)], blaetter: liste,
           abweichungen: liste.filter((b) => b.abweichung).length + (wahl.datum !== hinterlegt ? 1 : 0), am: am || new Date().toISOString() };
}

export async function fotoLesen(env, kind) {
  try {
    const roh = env && env.PAUL_KV ? await env.PAUL_KV.get(FOTO(kind)) : null;
    if (roh == null) return { ok: true, ergebnisse: {} };
    const d = JSON.parse(roh);
    return { ok: true, ergebnisse: (d && d.ergebnisse && typeof d.ergebnisse === "object") ? d.ergebnisse : {} };
  } catch (e) { return { ok: false, ergebnisse: {} }; }
}

/* Bilder eines Zurueck-Eintrags als Inhaltsbloecke fuer die Nachricht. */
async function bilderBloecke(env, eintrag, bildLesen) {
  const out = [];
  for (let i = 0; i < Math.min(4, Number(eintrag.seiten) || 0); i++) {
    const s = await bildLesen(env, eintrag.id, i);
    const m = /^data:(image\/(?:png|jpe?g|webp|gif));base64,(.+)$/.exec(String(s || ""));
    if (m) out.push({ type: "image", source: { type: "base64", media_type: m[1] === "image/jpg" ? "image/jpeg" : m[1], data: m[2] } });
  }
  return out;
}

/* Ganze Zuordnung fuer einen Zurueck-Eintrag. Laeuft hoechstens einmal je Probe und Eintrag (gleiches
   zurueckId schon gespeichert: nichts). Rueckgabe { ok, ergebnis? , grund? }. Kein Schreiben ohne Ergebnis. */
export async function zuordnen(env, kind, eintrag, { blaetter, bildLesen, holen } = {}) {
  try {
    if (kind !== "paul" || !env || !env.PAUL_KV) return { ok: false, grund: "nur Paul" };
    const probe = probeFuer(kind, eintrag);
    if (!probe) return { ok: false, grund: "keine vorlaeufige Probe" };
    const st = await fotoLesen(env, kind);
    if (!st.ok) return { ok: false, grund: "Speicher nicht lesbar" };
    const schl = schluessel(probe);
    if (st.ergebnisse[schl] && st.ergebnisse[schl].zurueckId === String(eintrag.id)) return { ok: true, ergebnis: st.ergebnisse[schl], schon: true };
    const upTag = tagMEZ(new Date(Date.parse(eintrag.angelegt)));
    const bilder = await bilderBloecke(env, eintrag, bildLesen);
    if (!bilder.length) return { ok: false, grund: "keine Bilder" };
    /* Mit an Opus gehen die Blaetter des Fachs mit Schuldatum von MIT_VOR_TAGEN vor dem hinterlegten
       Probendatum bis zum Tag vor dem Hochladen. So ist das 5-Tage-Fenster auch abgedeckt, wenn auf der Probe
       ein bis zu 7 Tage frueheres oder ein spaeteres Datum steht. Liegt ein Fensterblatt doch ausserhalb, fehlt
       es in der Antwort und bleibt "nicht abgefragt" (offen) - die sichere Seite. */
    const ab = plus(probe.probeDatum, -MIT_VOR_TAGEN);
    const liste = (blaetter || []).filter((b) => b && b.id && b.sichtbar !== false && fachNorm(b.fach) === fachNorm(probe.fach))
      .map((b) => ({ b, sd: schuldatum(b) })).filter((x) => x.sd.datum && x.sd.datum >= ab && x.sd.datum < upTag)
      .sort((x, y) => (x.sd.datum < y.sd.datum ? -1 : x.sd.datum > y.sd.datum ? 1 : 0));
    const holer = holen || ((url, opt) => fetch(url, opt));
    const a = await holer("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODELL, max_tokens: 8000, thinking: { type: "adaptive" }, output_config: { effort: "low" },
        messages: [{ role: "user", content: [{ type: "text", text: auftragText(probe, liste, probe.probeDatum) }, ...bilder] }] }),
    });
    if (!a || !a.ok) return { ok: false, grund: "Lesen fehlgeschlagen" };
    const j = await a.json();
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("").trim();
    let gelesen = null;
    try { gelesen = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)); } catch (e) { return { ok: false, grund: "Antwort nicht lesbar" }; }
    const erg = ergebnisBauen({ probe, eintrag, upTag, gelesen, blaetter });
    st.ergebnisse[schl] = erg;
    await env.PAUL_KV.put(FOTO(kind), JSON.stringify({ v: 1, ergebnisse: st.ergebnisse }));
    return { ok: true, ergebnis: erg };
  } catch (e) { return { ok: false, grund: "Fehler" }; }
}

/* Vorschau der Elternseite: Stufen der Fensterblaetter aus dem Probenfoto vorsetzen. Rein. */
export function vorschlagMitFoto(vorschlagBlaetter, ergebnis) {
  if (!ergebnis || !Array.isArray(ergebnis.blaetter)) return vorschlagBlaetter || [];
  const neu = {};
  for (const b of ergebnis.blaetter) neu[b.id] = b;
  const out = (vorschlagBlaetter || []).map((v) => (v && neu[v.blattId])
    ? { ...v, stufe: neu[v.blattId].stufe, begruendung: neu[v.blattId].begruendung, quelle: "probenfoto" } : v);
  const da = new Set(out.map((v) => v && v.blattId));
  for (const b of ergebnis.blaetter) if (!da.has(b.id)) out.push({ blattId: b.id, stufe: b.stufe, begruendung: b.begruendung, quelle: "probenfoto" });
  return out;
}
