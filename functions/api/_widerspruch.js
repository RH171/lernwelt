/* Widerspruchspruefung fuer Fundkarten (03.11.2026, Dennys Vorgaben 14:26 Uhr MEZ).
 *
 * Anlass: Die Belegpruefung (Kapitel 147) prueft jede Karte nur gegen ihr eigenes Blatt. So stand in
 * Pauls HSU-Karte 5 (Blatt kiub8ud5wh) die geheime Wahl beim Buergerbegehren, obwohl andere Karten und
 * das Blatt 3e8kjtv6v4 sie dem Buergerentscheid zuordnen.
 *
 * Was hier passiert:
 *   - Neue oder geaenderte Karten eines Blattes werden gegen den Bestand DESSELBEN Kindes, Fachs und
 *     Themas geprueft (andere Blaetter). Opus 5.5 meldet nur echte inhaltliche Widersprueche:
 *     Begriffe, Zustaendigkeiten, Zahlen oder Reihenfolgen verwechselt. Formulierungsunterschiede nie.
 *   - Ein Treffer haelt die neue Karte an: Feld halt = { art: "widerspruch", gegen, satz, am }.
 *     Angehaltene Karten fallen beim Lesen ueber stoffLesen() weg (Ablage, Such-Spiel, Lernquiz),
 *     der Speicher behaelt sie. Keine Meldung an das Kind.
 *   - Denny bekommt die Treffer gebuendelt als Liste (werkzeuge/widerspruch.mjs liste ->
 *     befunde/widerspruch-neu/<datum>.md), nicht Karte fuer Karte.
 *   - Schalter schalter:widerspruch, Standard "alt" = keine Pruefung, keine neue Markierung.
 *     Schon gesetzte Markierungen bleiben auch bei "alt" wirksam (Freigeben = Feld halt entfernen).
 *
 * Diese Datei wird auch vom lokalen Werkzeug (werkzeuge/widerspruch.mjs) fuer den Bestandslauf benutzt,
 * damit Server und Lauf denselben Auftrag an Opus schicken. Wirft nie.
 */

export const MODELL = "claude-opus-5-5";
export const BESTAND_MAX = 160;          // so viele Bestandskarten gehen hoechstens mit (juengste zuerst)

export async function widerspruchAn(env) {
  try {
    const roh = env && env.PAUL_KV ? await env.PAUL_KV.get("schalter:widerspruch") : null;
    if (roh == null) return false;
    return String(roh).trim().replace(/^["']|["']$/g, "").trim().toLowerCase() === "neu";
  } catch (e) { return false; }          // Lesefehler: sichere Seite = aus
}

export const norm = (s) => String(s == null ? "" : s).toLowerCase().replace(/\s+/g, " ").trim();
export const schluessel = (k) => norm(k && (k.frage || k.text)) + "|" + norm(k && k.richtig);
export const angehalten = (k) => !!(k && k.halt && k.halt.art === "widerspruch");
export const ohneAngehaltene = (karten) => (Array.isArray(karten) ? karten.filter((k) => !angehalten(k)) : karten);

/* Fuer stoffLesen: angehaltene Karten fallen beim Lesen weg, der Speicher bleibt unberuehrt. */
export function eintraegeOhneAngehaltene(eintraege) {
  if (!Array.isArray(eintraege)) return eintraege;
  return eintraege.map((e) => {
    if (!e || !Array.isArray(e.karten) || !e.karten.some(angehalten)) return e;
    return Object.assign({}, e, { karten: ohneAngehaltene(e.karten) });
  });
}

/* Eine Karte in einer Zeile: Frage -> richtige Antwort (Merksatz). Falsche Antworten gehen nicht mit. */
export function kartenZeile(k) {
  if (!k) return "";
  const frage = String(k.frage || k.text || k.stichwort || "").replace(/\s+/g, " ").trim();
  let richtig = k.richtig;
  if (Array.isArray(k.antworten) && typeof k.richtig === "number") richtig = k.antworten[k.richtig];
  const teile = [frage + " -> " + String(richtig == null ? "" : richtig).replace(/\s+/g, " ").trim()];
  const merke = String(k.merke || "").replace(/\s+/g, " ").trim();
  if (merke) teile.push("Merke: " + merke);
  const erkl = String(k.erklaerung || "").replace(/\s+/g, " ").trim();
  if (erkl) teile.push("Erklaerung: " + erkl);
  return teile.join(" | ");
}

/* Bestand fuer ein Blatt: Karten anderer Blaetter mit gleichem Fach und Thema, ohne angehaltene. */
export function bestandFuer(eintraege, blatt) {
  const fach = norm(blatt && blatt.fach), thema = norm(blatt && blatt.thema);
  if (!fach || !thema || !Array.isArray(eintraege)) return [];
  const aus = [];
  const sortiert = eintraege.slice().sort((a, b) => String((b && (b.datum || b.angelegt)) || "").localeCompare(String((a && (a.datum || a.angelegt)) || "")));
  for (const e of sortiert) {
    if (!e || e.id === blatt.id || norm(e.fach) !== fach || norm(e.thema) !== thema || !Array.isArray(e.karten)) continue;
    e.karten.forEach((k, i) => { if (!angehalten(k) && aus.length < BESTAND_MAX) aus.push({ blatt: e.id, titel: e.titel || "", nr: i, karte: k }); });
  }
  return aus;
}

export const KRITERIEN = [
  "Du pruefst Lernkarten fuer ein Grundschul- bzw. Gymnasialkind auf INHALTLICHE WIDERSPRUECHE untereinander.",
  "Ein Widerspruch liegt NUR vor, wenn zwei Karten zur selben Sache Unvereinbares behaupten:",
  "- Begriffe verwechselt (z. B. Buergerbegehren und Buergerentscheid vertauscht, Nomen und Verb vertauscht),",
  "- Zustaendigkeiten verwechselt (wer entscheidet, wer waehlt, wer beschliesst),",
  "- Zahlen, Daten, Mengen oder Ergebnisse verschieden,",
  "- Reihenfolgen oder Ablaeufe vertauscht.",
  "KEIN Widerspruch: andere Formulierung, Synonym, kuerzere oder laengere Fassung, andere Beispiele,",
  "eine Karte sagt mehr als die andere, Gross/klein, Rechtschreibung, Satzbau. Im Zweifel: kein Widerspruch.",
  "Melde nur, was ein Kind beim Lernen wirklich falsch lernen wuerde.",
].join("\n");

const AUFTRAG = KRITERIEN + "\n\n" + [
  "Antworte NUR mit JSON, ohne Text davor oder danach:",
  "{\"widersprueche\":[{\"neu\":<Nummer der Karte aus NEU>,\"gegen\":[<Nummern aus BESTAND>],\"satz\":\"<ein deutscher Satz: was widerspricht sich>\",\"welche_falsch\":\"neu|bestand|unklar\"}]}",
  "Keine Treffer: {\"widersprueche\":[]}",
].join("\n");

export function auftragText(neue, bestand, rahmen) {
  const r = rahmen || {};
  const kopf = "Fach: " + (r.fach || "?") + " · Thema: " + (r.thema || "?");
  const n = neue.map((x, i) => "N" + i + ": " + kartenZeile(x.karte || x)).join("\n");
  const b = bestand.map((x, i) => "B" + i + " [" + (x.titel || x.blatt || "") + "]: " + kartenZeile(x.karte || x)).join("\n");
  return AUFTRAG + "\n\n" + kopf + "\n\nNEU (zu pruefen):\n" + n + "\n\nBESTAND (schon im Quiz):\n" + (b || "(leer)") +
    "\n\nNummern: N0, N1 ... fuer neu als Zahl ohne N, B0, B1 ... fuer Bestand als Zahl ohne B.";
}

/* Antwort lesen; unbrauchbare Eintraege fallen weg. */
export function antwortLesen(text, anzahlNeu, anzahlBestand) {
  const m = String(text || "").match(/\{[\s\S]*\}/);
  if (!m) return null;
  let j; try { j = JSON.parse(m[0]); } catch (e) { return null; }
  if (!j || !Array.isArray(j.widersprueche)) return null;
  const zahl = (v) => { const z = parseInt(String(v).replace(/^[NB]/i, ""), 10); return Number.isFinite(z) ? z : -1; };
  return j.widersprueche.map((w) => ({
    neu: zahl(w && w.neu),
    gegen: (Array.isArray(w && w.gegen) ? w.gegen : [w && w.gegen]).map(zahl).filter((z) => z >= 0 && z < anzahlBestand),
    satz: String((w && w.satz) || "").slice(0, 400),
    welche: ["neu", "bestand", "unklar"].includes(w && w.welche_falsch) ? w.welche_falsch : "unklar",
  })).filter((w) => w.neu >= 0 && w.neu < anzahlNeu && w.satz);
}

/* Ein Aufruf an Opus. Gibt { ok, treffer, usage } oder { ok:false, fehler, usage }. Wirft nie. */
export async function pruefen(key, neue, bestand, opt) {
  const o = opt || {};
  if (!key) return { ok: false, fehler: "kein Schluessel" };
  if (!neue.length || !bestand.length) return { ok: true, treffer: [], usage: null, leer: true };
  const abbruch = typeof AbortController !== "undefined" ? new AbortController() : null;
  const uhr = abbruch ? setTimeout(() => abbruch.abort(), o.grenze || 50000) : null;
  try {
    const r = await (o.fetch || fetch)("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: abbruch ? abbruch.signal : undefined,
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODELL, max_tokens: o.max || 8000,
        thinking: { type: "adaptive" }, output_config: { effort: o.effort || "low" },
        messages: [{ role: "user", content: auftragText(neue, bestand, o.rahmen) }],
      }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j) return { ok: false, fehler: "HTTP " + r.status, usage: j && j.usage };
    if (j.stop_reason === "max_tokens") return { ok: false, fehler: "max_tokens", usage: j.usage };
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    const treffer = antwortLesen(text, neue.length, bestand.length);
    if (!treffer) return { ok: false, fehler: "Antwort unlesbar", usage: j.usage };
    return { ok: true, treffer, usage: j.usage };
  } catch (e) {
    return { ok: false, fehler: String((e && e.name) || e) };
  } finally { if (uhr) clearTimeout(uhr); }
}

/* Karten markieren: jede neue Karte mit Treffer bekommt halt (Auftrag: ein Treffer haelt die neue Karte an),
   auch wenn Opus die Bestandskarte fuer die falsche haelt; das steht dann in halt.welche, Denny entscheidet. */
export function markieren(karten, treffer, bestand, am, neue) {
  const halt = new Map();
  for (const t0 of treffer || []) {
    /* neue = Liste {karte, nr} wie an Opus geschickt; t.neu zeigt hinein, nr ist der Platz in karten. */
    const t = neue ? Object.assign({}, t0, { neu: neue[t0.neu] ? neue[t0.neu].nr : -1 }) : t0;
    if (t.neu < 0) continue;
    const gegen = t.gegen.map((g) => bestand[g]).filter(Boolean).map((x) => ({ blatt: x.blatt, nr: x.nr, frage: String((x.karte && (x.karte.frage || x.karte.text)) || "").slice(0, 160) }));
    const alt = halt.get(t.neu);
    if (alt) { alt.gegen = alt.gegen.concat(gegen); alt.satz += " " + t.satz; }
    else halt.set(t.neu, { art: "widerspruch", gegen, satz: t.satz, welche: t.welche, am: am || new Date().toISOString() });
  }
  if (!halt.size) return { karten, angehalten: 0 };
  return { karten: karten.map((k, i) => (halt.has(i) ? Object.assign({}, k, { halt: halt.get(i) }) : k)), angehalten: halt.size };
}

/* Server-Einstieg fuer ein frisch gelesenes Blatt. Wirft nie, haelt bei Fehlern nichts an.
   blatt = { id, fach, thema }, karten = neue Karten, eintraege = Bestand des Kindes (stoffLesen). */
export async function blattPruefen(env, blatt, karten, eintraege, opt) {
  const o = opt || {};
  try {
    if (!Array.isArray(karten) || !karten.length) return { karten, angehalten: 0, geprueft: false };
    if (!(await widerspruchAn(env))) return { karten, angehalten: 0, geprueft: false, grund: "schalter alt" };
    const bestand = bestandFuer(eintraege, blatt);
    if (!bestand.length) return { karten, angehalten: 0, geprueft: false, grund: "kein Bestand" };
    /* Nur neue oder geaenderte Karten: was schon vorher am Blatt stand (kartenAlt), gilt als Bestand. */
    const altSchl = new Set((Array.isArray(o.alt) ? o.alt : []).map(schluessel));
    const neue = karten.map((k, i) => ({ karte: k, nr: i })).filter((x) => !angehalten(x.karte) && !altSchl.has(schluessel(x.karte)));
    if (!neue.length) return { karten, angehalten: 0, geprueft: false, grund: "keine neue Karte" };
    const r = await pruefen(env.ANTHROPIC_API_KEY, neue, bestand, { fetch: o.fetch, grenze: o.grenze, rahmen: { fach: blatt.fach, thema: blatt.thema } });
    if (!r.ok) return { karten, angehalten: 0, geprueft: false, fehler: r.fehler, usage: r.usage };
    const m = markieren(karten, r.treffer, bestand, o.am, neue);
    return { karten: m.karten, angehalten: m.angehalten, geprueft: true, treffer: r.treffer, usage: r.usage };
  } catch (e) {
    return { karten, angehalten: 0, geprueft: false, fehler: String((e && e.message) || e) };
  }
}

/* Vorratsfragen des Lernquiz (quiz.js nachschubBauen): neue Fragen je Blatt gegen Fundkarten und
   Vorratsfragen anderer Blaetter desselben Fachs und Themas. Gibt die Liste neu zurueck, angehaltene
   Fragen tragen halt und werden bei der Ausgabe ausgefiltert (ohneAngehaltene). Wirft nie. */
export async function vorratPruefen(env, kind, neu, eintraege, vorratFragen, opt) {
  const o = opt || {};
  try {
    if (!Array.isArray(neu) || !neu.length) return neu;
    if (!(await widerspruchAn(env))) return neu;
    const blattNach = {};
    for (const e of eintraege || []) if (e && e.id) blattNach[e.id] = e;
    const jeBlatt = {};
    neu.forEach((f, i) => { if (f && f.blatt && blattNach[f.blatt]) (jeBlatt[f.blatt] = jeBlatt[f.blatt] || []).push({ karte: f, nr: i }); });
    const aus = neu.slice();
    await Promise.all(Object.keys(jeBlatt).map(async (id) => {
      const blatt = blattNach[id];
      const bestand = bestandFuer(eintraege, blatt);
      const fach = norm(blatt.fach), thema = norm(blatt.thema);
      for (const f of vorratFragen || []) {
        if (bestand.length >= BESTAND_MAX) break;
        const b = f && blattNach[f.blatt];
        if (!b || f.blatt === id || angehalten(f) || norm(b.fach) !== fach || norm(b.thema) !== thema) continue;
        bestand.push({ blatt: f.blatt, titel: b.titel || "", nr: f.id, karte: f });
      }
      if (!bestand.length) return;
      const r = await pruefen(env.ANTHROPIC_API_KEY, jeBlatt[id], bestand, { fetch: o.fetch, grenze: o.grenze, rahmen: { fach: blatt.fach, thema: blatt.thema } });
      if (!r.ok) return;
      const m = markieren(aus, r.treffer, bestand, o.am, jeBlatt[id]);
      m.karten.forEach((k, i) => { if (angehalten(k)) aus[i] = k; });
    }));
    return aus;
  } catch (e) { return neu; }
}
