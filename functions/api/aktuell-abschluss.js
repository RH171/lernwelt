/* Abschluss offener Blaetter im Elternbereich (Schalter "aktuell", Regel F, nur Paul)
 * Nachbesserung 2 (Dennys Beschluss 04.11.2026, 12:55 Uhr): Abschluss nur nach Inhalt, nie nach Datum.
 * Je Blatt eine Stufe: "abgefragt" (abgeschlossen), "nicht abgefragt" (offen), "unsicher" (offen, ein Satz
 * Begruendung), "probenzeitraum" (Probenzeitraum, nicht abgefragt: abgeschlossen, Auftrag 208). "abgefragt" und
 * "probenzeitraum" schliessen. Das Datum ist nur noch Vorschlag in der Vorschau.
 * Auftrag 208: bestaetigte Proben der Vorschlagsdatei (Mathe 19.10.2026) gelten als Grundstand ("basis", gesetzt 0)
 * ohne Speichern; sie stehen in GET als basis und werden von POST nie geschrieben oder zurueckgenommen.
 *
 * GET  /api/aktuell-abschluss?kind=paul
 *   -> { ok, schalter, faecher: { fach: [Blatt] }, abschluesse, proben: [Probe aus der Vorschlagsdatei] }
 *      Blatt = { id, titel, thema, datum, von, unsicher?, angelegt, offen, geschlossen, markiert, gleicherTitel? }
 * GET  /api/aktuell-abschluss?kind=paul&probe=<schluessel>   (Probe aus der Vorschlagsdatei)
 * GET  /api/aktuell-abschluss?kind=paul&fach=<fach>&probeDatum=JJJJ-MM-TT  (Probe ohne Vorschlag)
 *   -> { ok, liste }   die GANZE Liste des Fachs mit vorgeschlagener Stufe und Begruendung (nichts gespeichert)
 * POST { kind:"paul", fach, probe?, probeDatum, stufen: { blattId: Stufe }, begruendungen?: { blattId: Satz } }
 *   -> jedes sichtbare Blatt des Fachs braucht eine Stufe (Denny bestaetigt die ganze Liste), sonst 409 mit
 *      der aktuellen Liste; "unsicher" braucht einen Satz Begruendung (400). Gespeichert werden die Kennungen
 *      mit Stufe: { fach, probe, probeDatum, stufen, begruendungen, gesetzt } an aktuell-abschluss:paul.
 * POST { kind:"paul", aktion:"zuruecknehmen", gesetzt } -> nimmt genau diesen Abschluss heraus.
 *
 * Nur mit Elternausweis, nur Paul. EINZIGE Stelle, die den Abschluss-Schluessel schreibt. Wirkt auf die
 * Kinderseiten nur bei schalter:aktuell = "neu". Ist der gespeicherte Stand nicht lesbar: 503, nichts geschrieben.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { stoffLesen } from "./_schulstoff.js";
import { fachNorm } from "./_wiedervorlage.js";
import { ABSCHLUSS, STUFEN, STUFE_LESBAR, aktuellAn, abschlussLesen, geschlossenJeFach, offenesBlatt, istGeschlossen, schuldatum, abschlussVorschau, grundlageText } from "./_aktuell.js";
import { VORSCHLAG } from "./_aktuell-vorschlag.js";
import { PROBENFOTO_AN, fotoLesen, probeFuer, schluessel as fotoSchluessel, vorschlagMitFoto, zuordnen as probenfotoZuordnen } from "./_probenfoto.js";
import { listeLesen as zurueckLesen, bildLesen } from "./_zurueck.js";

/* Auftrag 211 (06.11.2026): Probenfotos der vorlaeufigen Proben. Je Probe das gespeicherte Ergebnis, oder
   - wenn ein Foto da ist, aber noch nicht gelesen - "fehlt" mit der Kennung des Zurueck-Eintrags. Liest nur. */
async function probenfotos(env, kind) {
  if (!PROBENFOTO_AN) return { ergebnisse: {}, fehlt: {} };
  const st = await fotoLesen(env, kind);
  const fehlt = {};
  const liste = await zurueckLesen(env, kind);
  for (const e of liste || []) {
    const p = probeFuer(kind, e);
    if (!p) continue;
    const k = fotoSchluessel(p);
    if (st.ergebnisse[k] && st.ergebnisse[k].zurueckId === String(e.id)) continue;
    if (st.ergebnisse[k] && String(st.ergebnisse[k].hochgeladen || "") >= String(e.angelegt || "")) continue;
    if (!fehlt[k] || String(e.angelegt || "") > String(fehlt[k].angelegt || "")) fehlt[k] = { zurueckId: String(e.id), angelegt: String(e.angelegt || "") };
  }
  return { ergebnisse: st.ergebnisse, fehlt, ...(st.ok ? {} : { fehler: true }) };
}

const json = (status, d) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});

async function elternDa(request, env) {
  const g = geheimFuer(env, "eltern");
  return !!g && (await ausweisGueltig(request, g, env));
}

const DATUM = /^\d{4}-\d{2}-\d{2}$/;

async function lage(env, kind) {
  const e = await stoffLesen(env, kind, 4);
  if (!e.ok) return { ok: false, fehler: e.fehler || "Der Speicher ist gerade nicht da." };
  const blaetter = e.eintraege.filter((b) => b && b.id);
  const abschluss = await abschlussLesen(env, kind);
  return { ok: true, blaetter, abschluss, zu: geschlossenJeFach(abschluss) };
}

/* Proben aus der Vorschlagsdatei (nur Paul). schluessel = fach + ":" + probeDatum (oder probe). */
function probenListe(kind) {
  return ((VORSCHLAG && VORSCHLAG[kind] && VORSCHLAG[kind].proben) || []).map((p) => ({
    schluessel: fachNorm(p.fach) + ":" + (p.probeDatum || p.probe), fach: fachNorm(p.fach), probe: String(p.probe || ""),
    probeDatum: String(p.probeDatum || ""), vorlaeufig: !!p.vorlaeufig, hinweis: String(p.hinweis || ""), blaetter: p.blaetter || [],
    ...(p.bestaetigt ? { bestaetigt: p.bestaetigt } : {}),
  }));
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!(await elternDa(request, env))) return json(401, { ok: false, fehler: "Bitte im Elternbereich anmelden." });
  const u = new URL(request.url);
  const kind = String(u.searchParams.get("kind") || "").toLowerCase();
  if (kind !== "paul") return json(400, { ok: false, fehler: "Nur für Paul." });
  const l = await lage(env, kind);
  if (!l.ok) return json(503, l);
  const proben = probenListe(kind);
  const pSchl = String(u.searchParams.get("probe") || "");
  const fachQ = fachNorm(u.searchParams.get("fach") || "");
  if (pSchl || fachQ) {
    const pr = pSchl ? proben.find((p) => p.schluessel === pSchl) : null;
    if (pSchl && !pr) return json(400, { ok: false, fehler: "Diese Probe steht nicht in der Vorschlagsdatei.", liste: [] });
    const fach = pr ? pr.fach : fachQ;
    const pd = pr ? pr.probeDatum : String(u.searchParams.get("probeDatum") || "");
    const foto = pr && PROBENFOTO_AN ? (await fotoLesen(env, kind)).ergebnisse[pr.schluessel] || null : null;
    const v = abschlussVorschau(l.blaetter, fach, pd, pr ? vorschlagMitFoto(pr.blaetter, foto) : [], l.zu[fach]);
    if (foto && v.ok) { const ids = new Set(foto.blaetter.map((b) => b.id)); for (const e of v.liste) if (ids.has(e.id)) e.quelle = "probenfoto"; }
    return json(v.ok ? 200 : 400, { ...v, fach, probe: pr ? pr.probe : "", probeDatum: pd, ...(foto ? { probenfoto: foto } : {}),
      ...(pr && pr.vorlaeufig ? { vorlaeufig: true, hinweis: pr.hinweis } : {}), ...(pr && pr.bestaetigt ? { bestaetigt: pr.bestaetigt } : {}) });
  }
  const faecher = {};
  for (const b of l.blaetter) {
    if (b.sichtbar === false) continue;
    const f = fachNorm(b.fach);
    if (!f) continue;
    const sd = schuldatum(b);
    (faecher[f] = faecher[f] || []).push({
      id: String(b.id), titel: String(b.titel || b.thema || "(ohne Titel)"), thema: String(b.thema || ""),
      datum: sd.datum, von: sd.von, ...(sd.unsicher ? { unsicher: true } : {}), angelegt: String(b.angelegt || ""),
      geschlossen: istGeschlossen(b, l.zu[f]), offen: offenesBlatt(b, l.zu),
      markiert: !!(l.zu[f] && l.zu[f].markiert && l.zu[f].markiert.has(String(b.id))),
      ...(l.zu[f] && l.zu[f].stufe && l.zu[f].stufe[String(b.id)] ? { stufe: l.zu[f].stufe[String(b.id)], stufeLesbar: STUFE_LESBAR[l.zu[f].stufe[String(b.id)]] } : {}),
      ...(grundlageText(kind, b.id) ? { grundlage: grundlageText(kind, b.id) } : {}),
    });
  }
  for (const f of Object.keys(faecher)) {
    faecher[f].sort((x, y) => (x.datum < y.datum ? 1 : x.datum > y.datum ? -1 : 0) || y.angelegt.localeCompare(x.angelegt) || x.id.localeCompare(y.id));
    const zahl = {}, n = {};
    for (const e of faecher[f]) zahl[e.titel] = (zahl[e.titel] || 0) + 1;
    for (const e of faecher[f]) if (zahl[e.titel] > 1) { n[e.titel] = (n[e.titel] || 0) + 1; e.gleicherTitel = n[e.titel] + " von " + zahl[e.titel]; }
  }
  return json(200, { ok: true, schalter: (await aktuellAn(env)) ? "neu" : "alt", faecher, abschluesse: l.abschluss.abschluesse,
                     basis: (l.abschluss.basis || []).map((a) => ({ fach: a.fach, probe: a.probe, probeDatum: a.probeDatum, bestaetigt: a.bestaetigt, stufen: a.stufen })),
                     proben: proben.map((p) => ({ schluessel: p.schluessel, fach: p.fach, probe: p.probe, probeDatum: p.probeDatum, vorlaeufig: p.vorlaeufig, hinweis: p.hinweis,
                       ...(p.bestaetigt ? { bestaetigt: p.bestaetigt } : {}) })),
                     probenfotos: await probenfotos(env, kind),
                     ...(l.abschluss.fehler ? { warnung: "Die gespeicherten Abschlüsse sind gerade nicht lesbar. Speichern ist gesperrt, bis sie wieder da sind." } : {}) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!(await elternDa(request, env))) return json(401, { ok: false, fehler: "Bitte im Elternbereich anmelden." });
  let d = null;
  try { d = await request.json(); } catch (e) {}
  if (!d || String(d.kind || "").toLowerCase() !== "paul") return json(400, { ok: false, fehler: "Nur für Paul." });
  const kind = "paul";
  const l = await lage(env, kind);
  if (!l.ok) return json(503, l);
  if (l.abschluss.fehler) return json(503, { ok: false, fehler: "Die gespeicherten Abschlüsse sind gerade nicht lesbar. Bitte später nochmal, es wurde nichts geändert." });
  const alle = l.abschluss.abschluesse.slice();

  /* Auftrag 211: ein Probenfoto nachlesen, das beim Hochladen nicht fertig wurde (die Seite ruft das von selbst).
     Schreibt nur aktuell-probenfoto:paul, nie einen Abschluss. */
  if (d.aktion === "probenfoto") {
    if (!PROBENFOTO_AN) return json(400, { ok: false, fehler: "Probenfotos werden gerade nicht gelesen." });
    const liste = await zurueckLesen(env, kind);
    const e = (liste || []).find((x) => String(x.id) === String(d.zurueckId || ""));
    if (!e || !probeFuer(kind, e)) return json(404, { ok: false, fehler: "Dieses Probenfoto gibt es nicht." });
    const r = await probenfotoZuordnen(env, kind, e, { blaetter: l.blaetter, bildLesen });
    return json(r.ok ? 200 : 502, r.ok ? { ok: true, ergebnis: r.ergebnis } : { ok: false, fehler: "Das Probenfoto ließ sich gerade nicht lesen (" + r.grund + ")." });
  }

  if (d.aktion === "zuruecknehmen") {
    const rest = alle.filter((a) => String(a.gesetzt) !== String(d.gesetzt || ""));
    if (rest.length === alle.length) return json(404, { ok: false, fehler: "Diesen Abschluss gibt es nicht." });
    try { await env.PAUL_KV.put(ABSCHLUSS(kind), JSON.stringify({ v: 2, abschluesse: rest })); }
    catch (e) { return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Bitte später nochmal." }); }
    return json(200, { ok: true, abschluesse: rest });
  }

  const fach = fachNorm(d.fach || "");
  const probeDatum = String(d.probeDatum || "");
  const probe = String(d.probe || "").trim().slice(0, 120);
  if (!fach) return json(400, { ok: false, fehler: "Bitte ein Fach wählen." });
  if (!DATUM.test(probeDatum)) return json(400, { ok: false, fehler: "Bitte das Probendatum eintragen." });
  const pr = probenListe(kind).find((p) => p.fach === fach && p.probeDatum === probeDatum);
  const v = abschlussVorschau(l.blaetter, fach, probeDatum, pr ? pr.blaetter : [], l.zu[fach]);
  if (!v.ok) return json(400, v);
  if (!v.liste.length) return json(400, { ok: false, fehler: "In diesem Fach gibt es keine Blätter." });
  const st = d.stufen && typeof d.stufen === "object" ? d.stufen : {};
  const bg = d.begruendungen && typeof d.begruendungen === "object" ? d.begruendungen : {};
  const ids = v.liste.map((x) => x.id);
  /* Ganze Liste: genau die Blaetter der Vorschau, jedes mit gueltiger Stufe. */
  const fehlt = ids.filter((id) => !STUFEN.includes(st[id]));
  const fremd = Object.keys(st).filter((id) => !ids.includes(id));
  if (fehlt.length || fremd.length)
    return json(409, { ok: false, fehler: "Die Liste hat sich geändert oder ist nicht vollständig. Bitte die neue Liste prüfen.", liste: v.liste });
  const stufen = {}, begruendungen = {};
  for (const id of ids) {
    stufen[id] = st[id];
    const satz = String(bg[id] || "").trim().slice(0, 300);
    if (st[id] === "unsicher" && !satz) {
      const b = v.liste.find((x) => x.id === id);
      return json(400, { ok: false, fehler: "Bei „unsicher“ fehlt die Begründung: " + (b ? b.titel : id) + "." });
    }
    if (satz && st[id] !== "abgefragt") begruendungen[id] = satz;
  }
  const neu = { fach, probe, probeDatum, stufen, begruendungen, gesetzt: Date.now() };
  alle.push(neu);
  try { await env.PAUL_KV.put(ABSCHLUSS(kind), JSON.stringify({ v: 2, abschluesse: alle })); }
  catch (e) { return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Bitte später nochmal." }); }
  return json(200, { ok: true, abschluss: neu, abschluesse: alle });
}
