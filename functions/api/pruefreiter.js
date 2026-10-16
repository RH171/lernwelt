/* Prüf-Reiter (14.10.2026) - siehe _pruefreiter.js
 *
 * GET  /api/pruefreiter?kind=paul               -> offene Stellen im Bestand (Blätter ab AB)
 * GET  /api/pruefreiter?kind=paul&blatt=<id>    -> offene Stellen dieses einen Blattes (nach dem Hochladen)
 *      -> { ok, stellen: [ohne Lösung], blaetter: <Zahl der Blätter mit Stellen>,
 *           fortschritt: { erledigt, gesamt } }   (seit 14.10.2026, Runde = heutiger Tag)
 *      📌-Stellen tragen seit 14.10.2026 beleg: { vorlage, titel, nr, aufgabe, bild }
 * GET  /api/pruefreiter?kind=paul&eltern=1      -> (nur Elternausweis) was Paul mit "Stimmt doch so"
 *      abgelegt hat, zur Kontrolle - hier MIT der nachgerechneten Lösung
 * POST /api/pruefreiter { kind, stelle, aktion: "pruefen"|"stimmt"|"gesehen"|"verbessert", antwort? }
 *      verbessert: 📌 und ✍️ (seit 14.10.2026 zeigt die Karte dort die Antwort der Lehrerin);
 *      "gesehen" und "pruefen" bei 📌 bleiben für alte offene Seiten erlaubt.
 *      -> pruefen: { ok, richtig, satz? , tipp? }   (falsch: kein Schreibvorgang)
 *      -> stimmt/gesehen: { ok }                     (ein Schreibvorgang)
 *
 * Fehlerkreis (14.10.2026, anleitung/123):
 *   GET liefert je Stelle `ort: [{s,x,y,b,h}]` (Prozent des Blattes, s = Seite ab 0),
 *       bei 📌 `beleg.ort`, und `orten: [<blatt-id>]` = Blätter, denen noch ein Ort fehlt.
 * POST /api/pruefreiter { kind, aktion: "orten", blatt }
 *      -> EIN Modellaufruf je Blatt (alle Stellen, alle Seiten) und, wenn nötig, einer
 *         fürs Bild der Lehrerin; EIN Schreibvorgang (`fehlerkreis:<kind>`).
 *         Nur Stellen ohne Ort - der Kostenriegel ist der Speicher, nicht der Ausweis.
 *      -> { ok, stellen: [{ id, ort, belegOrt? }] }
 * Verbessert durch Claude (Zusatz 14.10.2026): "verbessert" und ein richtiges
 *      "pruefen" berichtigen danach die Zeile im Blatt (_korrektur.js) - zweiter
 *      Schreibvorgang. Antwort zusätzlich { korrigiert, gruen: [{s,x,y,b,h,text}] }.
 *
 * Nachrechnen (14.10.2026, _nachrechnen.js):
 *   GET liefert `nachrechnen: [<blatt-id>]` = gelesene Matheblätter im Bereich ohne
 *       (gültige) Feld-für-Feld-Abschrift - meist leer, weil das Durchlesen sie mitbringt.
 * POST /api/pruefreiter { kind, aktion: "nachrechnen", blatt }
 *      -> 1-2 Modellaufrufe, EIN Schreibvorgang (die Monatsliste des Blattes).
 *         Kostenriegel: nur, wenn die Abschrift fehlt oder älter als das Foto ist.
 *      -> { ok, nachgerechnet: true, stellen: <Zahl neuer 🧮> }
 * GET ?eltern=1 liefert zusätzlich `nachgerechnet: [{blatt, voll, soll, ist, fehlt, fehler,
 *      ungeprueft, rotFalsch}]` - auch „unvollständig nachgerechnet“ steht dort.
 *
 * Volllesen (15.10.2026, _volllesen.js, anleitung/125): alle drei Kinder, alle Fächer.
 *   GET liefert `volllesen: [<blatt-id>]` = gelesene Blätter im Bereich ohne (gültige)
 *       Abschrift des ganzen Blattes; Stellen 🔤 „Schau genau hin“ (art "schreiben",
 *       Kennung <blatt>:v:<kurz>) - nur mit eindeutiger Quelle und bestätigter Zweitlesung.
 * POST /api/pruefreiter { kind, aktion: "volllesen", blatt }
 *      -> 1-3 Modellaufrufe (bei Mathe zusätzlich Nachrechnen, falls es fehlt),
 *         EIN Schreibvorgang. Kostenriegel: nur, wenn die Abschrift fehlt, halb ist
 *         (`offen`) oder älter als das Foto.
 *      -> { ok, volllesen: true, stellen: <Zahl neuer 🔤/🧮> }
 * GET ?eltern=1 liefert zusätzlich `volllesen: [{blatt, voll, soll, ist, fehlt, mitKind,
 *      pruefbar, nichtPruefbar, fehler, ungeprueft}]` - „unvollständig gelesen“ steht dort.
 *
 * Bis 14.10.2026 nur Paul; seit dem Volllesen alle drei Kinder (KINDER_MIT_PRUEFREITER).
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { stoffLesen, kindOk, FAECHER_JE_KIND, fachPruefen } from "./_schulstoff.js";
import { stoffBild } from "./_schulstoff.js";
import { vorlagenLesen, vorlagenBilderLesen, vorlageFuerBlatt, BILD_SCHLUESSEL } from "./_lehrervorlagen.js";
import { KINDER_MIT_PRUEFREITER, offeneStellen, oeffentlich, stellenFuerBlatt, verbesserungPruefen,
         zustandLesen, zustandSchreiben, fortschritt, imBestand, brauchtNachrechnen, nachrechenStand,
         brauchtVolllesen, volllesStand, optFuer } from "./_pruefreiter.js";
import { nachrechnen } from "./_nachrechnen.js";
import { volllesen, fortsetzbar, vokabelnImFach, fachGelesen as vlFach } from "./_volllesen.js";
import { nachgerechnetSetzen, abschriftenSetzen } from "./_schulstoff.js";
import { kreiseLesen, kreiseSchreiben, fehltOrt, ortFuer, vorlageOrt, zieleFuerStelle, zielFuerVorlage,
         orten, orteVerwerfen } from "./_fehlerkreis.js";
import { korrekturFuer, korrekturSetzen, gruenFuer } from "./_korrektur.js";

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

async function istEltern(request, env) {
  const g = geheimFuer(env, "eltern");
  return !!g && (await ausweisGueltig(request, g, env));
}
async function darfRein(request, env, kind) {
  if (await istEltern(request, env)) return true;
  const g = geheimFuer(env, kind);
  return !!g && (await ausweisGueltig(request, g, env));
}
/* Bestand: 3 Monate reichen ab dem 06.10.2026 bis Ende Dezember; danach
   zählt sowieso nur, was ab AB liegt. Ein einzelnes Blatt kann ein altes
   Datum tragen - dann alle Monate (nur Lesen). */
const MONATE_BESTAND = 4;
const MONATE_BLATT = 14;

export async function onRequestGet(context) {
  const { request, env } = context;
  let p;
  try { p = new URL(request.url).searchParams; } catch (e) { p = new URLSearchParams(); }
  const kind = String(p.get("kind") || "").toLowerCase();
  if (!kindOk(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });
  if (!KINDER_MIT_PRUEFREITER.includes(kind)) return json(200, { ok: true, stellen: [], blaetter: 0 });

  const blatt = String(p.get("blatt") || "").slice(0, 40);
  const e = await stoffLesen(env, kind, blatt ? MONATE_BLATT : MONATE_BESTAND);
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });
  const vorlagen = await vorlagenLesen(env, kind);
  const zustand = await zustandLesen(env, kind);

  if (p.get("eltern") === "1") {
    if (!(await istEltern(request, env))) return json(401, { ok: false, fehler: "Nur für Eltern." });
    const alle = {};
    for (const b of e.eintraege || []) for (const s of stellenFuerBlatt(b, vorlagen, optFuer(e.eintraege, b))) alle[s.id] = s;
    const liste = Object.keys(zustand.s).filter((id) => zustand.s[id].z === "stimmt").map((id) => {
      const s = alle[id], z = zustand.s[id];
      return { id, wann: z.t || "", blatt: s ? s.blatt : { id: id.split(":")[0] }, aufgabe: s ? s.aufgabe : "",
               du: s ? s.du : (z.du || ""), richtig: s && s.soll != null ? (Array.isArray(s.soll) ? s.soll.join(", ") : String(s.soll)) : "",
               art: s ? s.art : "" };
    });
    const offen = offeneStellen(e.eintraege, vorlagen, zustand);
    /* Verbessert durch Claude (14.10.2026): was im Blatt berichtigt wurde, mit dem alten Wert. */
    const verbessert = [];
    for (const b of e.eintraege || []) for (const k of (Array.isArray(b.korrekturen) ? b.korrekturen : [])) {
      if (!k || k.von !== "claude") continue;
      if (k.quelle === "lehrerin") continue;   // Rot ist fertig (16.10.2026): das hat die Lehrerin verbessert, nicht Claude
      verbessert.push({ blatt: { id: b.id, titel: String(b.titel || "").slice(0, 80), datum: b.datum || "", fach: b.fach || "" },
                        war: String(k.war || ""), korrigiert: String(k.korrigiert || ""), quelle: String(k.quelle || ""), am: String(k.am || "") });
    }
    verbessert.sort((a, b) => (a.am < b.am ? 1 : -1));
    const nachgerechnet = [];
    for (const b of e.eintraege || []) {
      const st = b.sichtbar !== false ? nachrechenStand(b) : null;
      if (!st) continue;
      nachgerechnet.push({ blatt: { id: b.id, titel: String(b.titel || "").slice(0, 80), datum: b.datum || "" }, ...st });
    }
    /* Volllesen (15.10.2026): je Blatt, wie vollständig es gelesen ist. */
    const gelesen = [];
    for (const b of e.eintraege || []) {
      if (b.sichtbar === false || !Array.isArray(b.inhalt) || !b.inhalt.length) continue;
      const st = volllesStand(b, optFuer(e.eintraege, b).vokabeln);
      gelesen.push({ blatt: { id: b.id, titel: String(b.titel || "").slice(0, 80), datum: b.datum || "", fach: b.fach || "" }, ...st });
    }
    return json(200, { ok: true, stimmtDoch: liste, offen: offen.length, verbessertClaude: verbessert.slice(0, 40),
                       nachgerechnet: nachgerechnet.slice(0, 60), volllesen: gelesen.slice(0, 160) });
  }

  const offen = offeneStellen(e.eintraege, vorlagen, zustand, blatt || null);
  /* Bilder nur, wenn es überhaupt eine 📌-Stelle gibt - sonst ein Lesevorgang umsonst. */
  const bilder = offen.some((s) => s.art === "pinnwand") ? await vorlagenBilderLesen(env, kind) : {};
  /* Fehlerkreis: ein Lesevorgang, nur wenn es Stellen gibt. */
  const kreise = offen.length ? await kreiseLesen(env, kind) : null;
  const orten_ = kreise && env.ANTHROPIC_API_KEY
    ? [...new Set(offen.filter((s) => fehltOrt(kreise, s) || belegFehlt(kreise, s, bilder)).map((s) => s.blatt.id))] : [];
  const nachr = env.ANTHROPIC_API_KEY ? (e.eintraege || []).filter((b) =>
    (blatt ? b.id === blatt : imBestand(b)) && Array.isArray(b.inhalt) && b.inhalt.length && brauchtNachrechnen(b)).map((b) => b.id) : [];
  /* Volllesen (15.10.2026): gelesene Blätter ohne ganze Abschrift. */
  const voll = env.ANTHROPIC_API_KEY ? (e.eintraege || []).filter((b) =>
    (blatt ? b.id === blatt : imBestand(b)) && Array.isArray(b.inhalt) && b.inhalt.length && brauchtVolllesen(b)).map((b) => b.id) : [];
  return json(200, { ok: true, stellen: offen.map((s) => oeffentlich(s, bilder, kreise)),
                     ...(nachr.length ? { nachrechnen: nachr.slice(0, 4) } : {}),
                     ...(voll.length ? { volllesen: voll.slice(0, 4) } : {}),
                     blaetter: new Set(offen.map((s) => s.blatt.id)).size,
                     fortschritt: fortschritt(e.eintraege, vorlagen, zustand, blatt || null),
                     ...(orten_.length ? { orten: orten_.slice(0, 6) } : {}) });
}

/* Fehlt beim Beweis einer 📌-Stelle noch der Ort auf dem Bild der Lehrerin? */
function belegFehlt(kreise, s, bilder) {
  if (s.art !== "pinnwand" || !s.beleg || !bilder || !bilder[s.beleg.vorlage]) return false;
  const v = kreise.vorlagen && kreise.vorlagen[s.beleg.vorlage];
  return !(v && v[String(s.beleg.nr)]);
}

function base64(buf) {
  const u = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
}

/* Fehlerkreis: die Stellen eines Blattes orten. Wirft nie; ohne Ergebnis
   wird nichts geschrieben (der nächste Aufruf versucht es wieder). */
async function ortenAktion(env, kind, blattId) {
  if (!env.ANTHROPIC_API_KEY) return json(503, { ok: false, fehler: "Auf dem Server fehlt der Schlüssel." });
  const e = await stoffLesen(env, kind, MONATE_BLATT);
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });
  const blatt = (e.eintraege || []).find((b) => b.id === blattId);
  if (!blatt) return json(404, { ok: false, fehler: "Das finde ich nicht mehr." });
  const vorlagen = await vorlagenLesen(env, kind);
  const zustand = await zustandLesen(env, kind);
  const stellen = stellenFuerBlatt(blatt, vorlagen, optFuer(e.eintraege, blatt)).filter((s) => !zustand.s[s.id]);
  const kreise = await kreiseLesen(env, kind);
  /* Neues Foto (14.10.2026): Orte vom alten Foto dieses Blattes verwerfen.
     Gespeichert wird das nur mit dem Schreibvorgang der neuen Ortung - bis
     dahin blendet ortGilt() sie beim Lesen aus. */
  const verworfen = orteVerwerfen(kreise, blattId, blatt.fotoNeu);
  const bilder = stellen.some((s) => s.art === "pinnwand") ? await vorlagenBilderLesen(env, kind) : {};
  const fehlen = stellen.filter((s) => fehltOrt(kreise, s));
  const ziele = fehlen.flatMap(zieleFuerStelle).filter((z) => !(kreise.b[blattId] && kreise.b[blattId][z.id]));
  const vorlageZiele = {};
  for (const s of stellen) if (belegFehlt(kreise, s, bilder)) {
    const v = vorlageFuerBlatt(vorlagen, blattId);
    const vz = v && (v.zeilen || []).find((q) => q.nr === s.beleg.nr);
    if (vz) (vorlageZiele[s.beleg.vorlage] = vorlageZiele[s.beleg.vorlage] || []).push(zielFuerVorlage(vz));
  }
  const auftraege = [];
  if (ziele.length) {
    const seiten = [];
    for (let i = 0; i < Math.min(4, Number(blatt.seiten) || 1); i++) {
      const b = await stoffBild(env, blattId, i);
      if (!b) break;
      seiten.push(b);
    }
    if (seiten.length) auftraege.push(orten(env.ANTHROPIC_API_KEY, seiten, ziele, { grenze: 45000 })
      .then((r) => ({ art: "blatt", r, ziele })));
  }
  for (const vid of Object.keys(vorlageZiele)) {
    let daten = null;
    try { daten = await env.PAUL_KV.get(BILD_SCHLUESSEL(vid), { type: "arrayBuffer" }); } catch (x) {}
    if (!daten || !daten.byteLength) continue;
    auftraege.push(orten(env.ANTHROPIC_API_KEY, "data:image/jpeg;base64," + base64(daten), vorlageZiele[vid], { grenze: 45000 })
      .then((r) => ({ art: "vorlage", vid, r, ziele: vorlageZiele[vid] })));
  }
  let geaendert = false;
  const jetzt = new Date().toISOString();
  for (const a of await Promise.all(auftraege)) {
    if (a.r.fehler) continue;   // HTTP-Fehler, Abbruch: nichts merken, später wieder
    for (const z of a.ziele) {
      const o = a.r.orte[z.id] || { nicht: 1 };   // geantwortet, aber nicht gefunden: nicht nochmal bezahlen
      if (a.art === "blatt") { (kreise.b[blattId] = kreise.b[blattId] || {})[z.id] = { ...o, am: jetzt }; }
      else if (!o.nicht) { (kreise.vorlagen[a.vid] = kreise.vorlagen[a.vid] || {})[z.id] = { x: o.x, y: o.y, b: o.b, h: o.h }; }
      else { (kreise.vorlagen[a.vid] = kreise.vorlagen[a.vid] || {})[z.id] = { nicht: 1 }; }
      geaendert = true;
    }
  }
  if (geaendert) {
    try { await kreiseSchreiben(env, kind, kreise); }
    catch (x) { return json(503, { ok: false, fehler: "Ich konnte es mir gerade nicht merken." }); }
  }
  return json(200, { ok: true, geortet: geaendert, ...(verworfen ? { verworfen } : {}), stellen: stellen.map((s) => {
    const o = { id: s.id, ort: ortFuer(kreise, s) };
    if (s.art === "pinnwand" && s.beleg) { const vo = vorlageOrt(kreise, s.beleg.vorlage, s.beleg.nr); if (vo) o.belegOrt = vo; }
    return o;
  }) });
}

/* Nachrechnen nachholen: Abschrift, Zählung, zweite Lesung - ein Schreibvorgang.
   Ohne Ergebnis (HTTP-Fehler, Abbruch) wird nichts geschrieben. */
async function nachrechnenAktion(env, kind, blattId) {
  if (!env.ANTHROPIC_API_KEY) return json(503, { ok: false, fehler: "Auf dem Server fehlt der Schlüssel." });
  const e = await stoffLesen(env, kind, MONATE_BLATT);
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });
  const blatt = (e.eintraege || []).find((b) => b.id === blattId);
  if (!blatt) return json(404, { ok: false, fehler: "Das finde ich nicht mehr." });
  if (!brauchtNachrechnen(blatt)) return json(200, { ok: true, schon: true });
  const seiten = [];
  for (let i = 0; i < Math.min(4, Number(blatt.seiten) || 1); i++) {
    const b = await stoffBild(env, blattId, i);
    if (!b) break;
    seiten.push(b);
  }
  if (!seiten.length) return json(404, { ok: false, fehler: "Zu dem Blatt liegt kein Bild da." });
  const r = await nachrechnen(env.ANTHROPIC_API_KEY, seiten, { grenze: 45000 });
  if (!r.ok) return json(503, { ok: false, fehler: "Nachrechnen ging gerade nicht (" + r.fehler + ")." });
  const w = await nachgerechnetSetzen(env, kind, blattId, r.nachgerechnet);
  if (!w.ok) return json(503, { ok: false, fehler: "Ich konnte es mir gerade nicht merken." });
  const neu = stellenFuerBlatt({ ...blatt, nachgerechnet: r.nachgerechnet }, await vorlagenLesen(env, kind), optFuer(e.eintraege, blatt)).filter((s) => s.id.includes(":n:"));
  return json(200, { ok: true, nachgerechnet: true, stellen: neu.length });
}

/* Volllesen nachholen (15.10.2026): das ganze Blatt Feld für Feld, bei Mathe auch das
   Nachrechnen, wenn es fehlt - EIN Schreibvorgang. Ohne Ergebnis wird nichts geschrieben.
   Unter der Leitungsgrenze (Kapitel 021): höchstens rund 85 s, ein ausgelassener Schritt
   wird als `offen` gespeichert und beim nächsten Aufruf fortgesetzt. */
async function volllesenAktion(env, kind, blattId) {
  if (!env.ANTHROPIC_API_KEY) return json(503, { ok: false, fehler: "Auf dem Server fehlt der Schlüssel." });
  const e = await stoffLesen(env, kind, MONATE_BLATT);
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });
  const blatt = (e.eintraege || []).find((b) => b.id === blattId);
  if (!blatt) return json(404, { ok: false, fehler: "Das finde ich nicht mehr." });
  const vl = brauchtVolllesen(blatt), nr = blatt.fach === "mathe" && brauchtNachrechnen(blatt);
  if (!vl && !nr) return json(200, { ok: true, schon: true });
  const seiten = [];
  for (let i = 0; i < Math.min(4, Number(blatt.seiten) || 1); i++) {
    const b = await stoffBild(env, blattId, i);
    if (!b) break;
    seiten.push(b);
  }
  if (!seiten.length) return json(404, { ok: false, fehler: "Zu dem Blatt liegt kein Bild da." });
  const start = Date.now();
  const [rv, rn] = await Promise.all([
    vl ? volllesen(env.ANTHROPIC_API_KEY, seiten, { fach: blatt.fach, kind, faecher: FAECHER_JE_KIND[kind], ohneRechnen: blatt.fach === "mathe",
                                                     vokabeln: vokabelnImFach(e.eintraege, blatt.fach, blatt.id),
                                                     grenze: 80000, frist: start + 85000 }, fortsetzbar(blatt) || undefined) : null,
    nr ? nachrechnen(env.ANTHROPIC_API_KEY, seiten, { grenze: 80000 }) : null,
  ]);
  const felder = {};
  if (rv && rv.ok) felder.volllesen = rv.volllesen;
  if (rn && rn.ok) felder.nachgerechnet = rn.nachgerechnet;
  if (!felder.volllesen && !felder.nachgerechnet)
    return json(503, { ok: false, fehler: "Lesen ging gerade nicht (" + ((rv && rv.fehler) || (rn && rn.fehler) || "?") + ")." });
  const w = await abschriftenSetzen(env, kind, blattId, felder);
  if (!w.ok) return json(503, { ok: false, fehler: "Ich konnte es mir gerade nicht merken." });
  const mit = { ...blatt, ...felder };
  /* Fach (16.10.2026, anleitung/054): Das nachgeholte Volllesen liest das Fach mit. Weicht es ab,
     wird nur ein Vorschlag vermerkt (zweiter Schreibvorgang, nur dann) - die Rueckfrage erscheint
     auf der Startseite („Bitte kurz nachsehen“) und in der Ablage. Nie, wenn schon eine Frage
     offen ist oder das Kind das Fach selbst gewaehlt oder bestaetigt hat. */
  let fachFrage = null;
  if (felder.volllesen) { try { fachFrage = await fachPruefen(env, kind, blatt, vlFach(felder.volllesen), { spaet: true }); } catch (x) {} }
  const neu = stellenFuerBlatt(mit, await vorlagenLesen(env, kind), optFuer(e.eintraege, mit)).filter((s) => /:[nv]:/.test(s.id));
  return json(200, { ok: true, volllesen: !!felder.volllesen, nachgerechnet: !!felder.nachgerechnet, stellen: neu.length,
                     ...(fachFrage ? { fachFrage } : {}),
                     ...(felder.volllesen && felder.volllesen.offen ? { offen: true } : {}) });
}

/* Verbessert durch Claude: Zeile im Blatt berichtigen, mit dem Ort der Stelle
   (für die grüne Überlagerung). Gibt die Felder für die Antwort. Wirft nie. */
async function berichtigen(env, kind, blatt, s) {
  try {
    const k = korrekturFuer(s);
    if (!k) return { korrigiert: false };
    const kreise = await kreiseLesen(env, kind);
    const ort = ortFuer(kreise, s);
    if (ort.length) k.ort = ort;
    const r = await korrekturSetzen(env, kind, blatt, k);
    if (!r.ok) return { korrigiert: false };
    return { korrigiert: true, gruen: gruenFuer({ korrekturen: [k] }) };
  } catch (x) { return { korrigiert: false }; }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let d = {};
  try { d = await request.json(); } catch (e) { return json(400, { ok: false, fehler: "Das kam nicht richtig an." }); }
  const kind = String(d.kind || "").toLowerCase();
  if (!kindOk(kind) || !KINDER_MIT_PRUEFREITER.includes(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });
  if (String(d.aktion || "") === "orten") {
    const b = String(d.blatt || "").slice(0, 40);
    if (!/^[a-z0-9]+$/.test(b)) return json(400, { ok: false, fehler: "Welches Blatt denn?" });
    return ortenAktion(env, kind, b);
  }
  if (String(d.aktion || "") === "volllesen") {
    const b = String(d.blatt || "").slice(0, 40);
    if (!/^[a-z0-9]+$/.test(b)) return json(400, { ok: false, fehler: "Welches Blatt denn?" });
    return volllesenAktion(env, kind, b);
  }
  if (String(d.aktion || "") === "nachrechnen") {
    const b = String(d.blatt || "").slice(0, 40);
    if (!/^[a-z0-9]+$/.test(b)) return json(400, { ok: false, fehler: "Welches Blatt denn?" });
    return nachrechnenAktion(env, kind, b);
  }
  const id = String(d.stelle || "").slice(0, 80);
  const aktion = String(d.aktion || "");
  if (!/^[a-z0-9]+:[rplnv]:[a-z0-9]+$/.test(id)) return json(400, { ok: false, fehler: "Unbekannte Stelle." });
  if (!["pruefen", "stimmt", "gesehen", "verbessert"].includes(aktion)) return json(400, { ok: false, fehler: "Unbekannte Aktion." });

  const e = await stoffLesen(env, kind, MONATE_BLATT);
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });
  const blattId = id.split(":")[0];
  const blatt = (e.eintraege || []).find((b) => b.id === blattId);
  const vorlagen = await vorlagenLesen(env, kind);
  const s = blatt ? stellenFuerBlatt(blatt, vorlagen, optFuer(e.eintraege, blatt)).find((x) => x.id === id) : null;
  if (!s) {
    /* Rot ist fertig (16.10.2026): eine alte offene Seite zeigt vielleicht noch eine
       ✍️-Karte oder eine Stelle, an der die Lehrerin rot verbessert hat. Tippt Paul
       dort, verschwindet die Karte still - kein Schreibvorgang, keine Korrektur. */
    const alt = blatt ? stellenFuerBlatt(blatt, vorlagen, { ...optFuer(e.eintraege, blatt), mitRot: true }).find((x) => x.id === id) : null;
    if (alt) return json(200, { ok: true, schon: true, rot: true });
    return json(404, { ok: false, fehler: "Diese Stelle gibt es nicht mehr." });
  }

  const zustand = await zustandLesen(env, kind);
  if (zustand.s[id]) return json(200, { ok: true, schon: true, richtig: zustand.s[id].z === "richtig" });

  const jetzt = new Date().toISOString();
  if (aktion === "verbessert") {
    if (s.art === "rechnen") return json(400, { ok: false, fehler: "Diese Stelle prüfst du mit „Prüfen“." });
    zustand.s[id] = { z: "verbessert", t: jetzt };
  } else if (aktion === "gesehen") {
    if (s.art !== "lehrerin") return json(400, { ok: false, fehler: "Diese Stelle wird verbessert, nicht nur angesehen." });
    zustand.s[id] = { z: "gesehen", t: jetzt };
  } else if (aktion === "stimmt") {
    if (s.art === "lehrerin") return json(400, { ok: false, fehler: "Das hat deine Lehrerin verbessert." });
    zustand.s[id] = { z: "stimmt", t: jetzt, du: s.du };
  } else {
    if (s.art === "lehrerin") return json(400, { ok: false, fehler: "Das hat deine Lehrerin verbessert." });
    const r = verbesserungPruefen(s, d.antwort);
    if (!r.richtig) return json(200, { ok: true, richtig: false, tipp: r.tipp });
    zustand.s[id] = { z: "richtig", t: jetzt };
    try { await zustandSchreiben(env, kind, zustand); }
    catch (x) { return json(200, { ok: true, richtig: true, satz: r.satz, gemerkt: false }); }
    return json(200, { ok: true, richtig: true, satz: r.satz, gemerkt: true, ...(await berichtigen(env, kind, blatt, s)) });
  }
  try { await zustandSchreiben(env, kind, zustand); }
  catch (x) { return json(503, { ok: false, fehler: "Ich konnte es mir gerade nicht merken. Probier es später nochmal." }); }
  /* "Stimmt doch so" und "gesehen" ändern das Blatt nicht. */
  if (aktion === "verbessert") return json(200, { ok: true, ...(await berichtigen(env, kind, blatt, s)) });
  return json(200, { ok: true });
}
