/* Korrekturen halten (14.10.2026): "verbessert · durch Claude" überlebt das Neueinlesen
 *
 * Lücke aus dem Fehlerkreis-Bau (anleitung/123, Risiken): Wird ein Blatt neu
 * gelesen - Durchlesen nachgeholt (Kapitel 078), Seite neu fotografiert oder
 * dazugelegt (Kapitel 097), Nachtrag der Eltern -, liefert das Modell Pauls
 * ALTE falsche Zeile wieder ("Kind schrieb 40, richtig: 30"). Die Korrektur
 * stand dann nur noch im Verlauf, die Zeile war wieder falsch, und der
 * Prüf-Reiter zeigte Paul dieselbe Stelle ein zweites Mal.
 *
 * Dauerlösung: inhaltSetzen() ruft nach JEDEM Einlesen korrekturenErneuern()
 * auf - im selben Schreibvorgang, der den neuen Inhalt ohnehin speichert.
 * Kein zusätzlicher Schreibvorgang, kein Modellaufruf.
 *
 * Wie die Zeile gefunden wird (streng - lieber nichts als etwas Erfundenes):
 *   1. Die berichtigte Zeile (k.zeile) steht schon da (Neue Seite: die alte
 *      Lesung bleibt vorn, lesungenZusammen()) -> Pauls wieder gelesene falsche
 *      Zeile ist ein Doppel und fällt weg.
 *   2. Die alte Zeile (k.vorher) steht wörtlich da -> wird ersetzt.
 *   3. Eine Zeile mit demselben "Kind schrieb X, richtig: Y" wie k.vorher
 *      (gefaltet, ohne Leerraum) und demselben Rest -> wird mit derselben
 *      Ersetzung berichtigt.
 *   4. Pinnwand ohne "Kind schrieb": eine Zeile, die <war> als ganzes Wort
 *      enthält und sonst gleich ist wie k.vorher -> Wort ersetzt.
 * Gibt es mehrere Kandidaten oder keinen, bleibt alles, wie es ist; der Verlauf
 * `korrekturen` wird NIE angefasst.
 *
 * Fundkarten: Eine neu gelesene Karte mit Pauls falschem Wert als "richtig"
 * bekommt wieder den richtigen (wie korrekturAnwenden()), Doppel fallen weg.
 *
 * Diese Datei importiert nichts aus _schulstoff.js, damit inhaltSetzen() sie
 * ohne Ringverweis laden kann.
 */
import { kindSchrieb, falten } from "./_lehrervorlagen.js";
import { MARKE, MARKE_RE } from "./_fehlerkreis.js";

const eng = (s) => String(s || "").replace(/\s+/g, " ").trim();
/* Zum Vergleichen: gefaltet, ohne Leerraum und Punkte ("180 : 6  =  40." = "180:6=40"). */
const dicht = (s) => falten(s).replace(/[\s.]+/g, "");
const ohneMarke = (s) => eng(String(s || "").replace(MARKE_RE, ""));

/* "Kind schrieb X, richtig: Y" durch den Wert ersetzen - wie ganzErsetzen() in _korrektur.js. */
function ganzErsetzen(zeile, ganz, wert) {
  const vorn = (/^\s*/.exec(ganz) || [""])[0];
  return zeile.replace(ganz, (zeile.indexOf(ganz) > 0 && !vorn ? " " : vorn) + wert);
}
function wortErsetzen(text, alt, neu) {
  const esc = String(alt).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("(^|[^\\p{L}\\p{N}])" + esc + "(?![\\p{L}\\p{N}])", "gu");
  let letzte = -1, m;
  while ((m = re.exec(text))) { letzte = m.index + m[1].length; if (re.lastIndex === m.index) re.lastIndex++; }
  if (letzte < 0) return null;
  return text.slice(0, letzte) + neu + text.slice(letzte + String(alt).length);
}
function wortDrin(text, wort) {
  return wortErsetzen(String(text || ""), wort, "\u0000") !== null;
}

/* Was in k.zeile an die Stelle von "Kind schrieb …" trat (aus vorher und zeile
   zurückgerechnet - ältere Korrekturen tragen den Wert nicht eigens). */
function ersatzVon(k) {
  const vorher = String(k.vorher || ""), alt = kindSchrieb(vorher);
  if (!alt) return null;
  const i = vorher.indexOf(alt.ganz);
  const pre = eng(vorher.slice(0, i)), suf = eng(vorher.slice(i + alt.ganz.length));
  const z = ohneMarke(k.zeile);
  if (!z.startsWith(pre) || !z.endsWith(suf) || z.length < pre.length + suf.length) return null;
  const wert = z.slice(pre.length, z.length - suf.length).trim();
  return wert ? { wert, alt } : null;
}

/* Rest einer Zeile ohne "Kind schrieb …" (bzw. ohne das Wort) - zum Vergleichen. */
function restOhne(zeile, teil) {
  return falten(String(zeile || "").replace(teil, " ")).replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

/* Die Zeile für EINE Korrektur suchen. Gibt { i, neu } oder { doppel: [i…] } oder null. */
function zeileFuer(inhalt, k) {
  const zeileOhne = ohneMarke(k.zeile);
  const da = inhalt.findIndex((z) => MARKE_RE.test(String(z)) && ohneMarke(z) === zeileOhne);
  const ers = ersatzVon(k);
  /* Kandidaten: wörtlich die alte Zeile, oder dieselbe Stelle neu gelesen. */
  const kand = [];
  inhalt.forEach((z, i) => {
    const t = String(z || "");
    if (MARKE_RE.test(t)) return;                         // schon berichtigt - nie zweimal
    if (t === k.vorher) { kand.push({ i, neu: k.zeile, wort: true }); return; }
    if (ers) {
      const ks = kindSchrieb(t);
      if (!ks || dicht(ks.x) !== dicht(ers.alt.x) || dicht(ks.y) !== dicht(ers.alt.y)) return;
      if (restOhne(t, ks.ganz) !== restOhne(k.vorher, ers.alt.ganz)) return;
      const neu = ganzErsetzen(t, ks.ganz, ers.wert);
      kand.push({ i, neu: (eng(neu) + " " + MARKE).slice(0, 200) });
      return;
    }
    /* Pinnwand ohne "Kind schrieb": dasselbe Wort an derselben Zeile. */
    if (k.quelle === "pinnwand" && k.war && wortDrin(t, k.war) && !kindSchrieb(t)) {
      if (restOhne(t, k.war) !== restOhne(k.vorher, k.war)) return;
      const neu = wortErsetzen(t, k.war, k.korrigiert);
      if (neu) kand.push({ i, neu: (eng(neu) + " " + MARKE).slice(0, 200) });
    }
  });
  if (da >= 0) return kand.length ? { doppel: kand.map((c) => c.i) } : null;
  if (kand.length !== 1) return null;                   // keiner oder mehrdeutig: nichts erfinden
  return { i: kand[0].i, neu: kand[0].neu };
}

/* Nach dem Einlesen: alle gespeicherten Korrekturen des Blattes wieder anwenden.
   Ändert den Eintrag NICHT, gibt eine Kopie und Zahlen zurück. */
export function korrekturenErneuern(eintrag) {
  const e = { ...(eintrag || {}) };
  const ks = Array.isArray(e.korrekturen) ? e.korrekturen : [];
  const aus = { eintrag: e, zeilen: 0, doppel: 0, karten: 0, ohneZeile: 0 };
  if (!ks.length) return aus;
  if (Array.isArray(e.inhalt)) {
    let inhalt = e.inhalt.slice();
    const weg = new Set();
    for (const k of ks) {
      if (!k || k.quelle === "lehrerin" || !k.zeile || !k.vorher) continue;
      const r = zeileFuer(inhalt, k);
      if (!r) {
        if (!inhalt.some((z) => MARKE_RE.test(String(z)) && ohneMarke(z) === ohneMarke(k.zeile))) aus.ohneZeile++;
        continue;
      }
      if (r.doppel) { r.doppel.forEach((i) => weg.add(i)); aus.doppel += r.doppel.length; continue; }
      inhalt[r.i] = r.neu; aus.zeilen++;
    }
    if (weg.size) inhalt = inhalt.filter((z, i) => !weg.has(i));
    if (aus.zeilen || weg.size) e.inhalt = inhalt;
  }
  if (Array.isArray(e.karten) && e.karten.length) {
    let geaendert = false;
    let karten = e.karten.map((c) => {
      const k = c && ks.find((x) => x && x.war && x.korrigiert && x.quelle !== "lehrerin" && falten(c.richtig) === falten(x.war));
      if (!k) return c;
      geaendert = true; aus.karten++;
      const falsch = (c.falsch || []).filter((f) => falten(f) !== falten(k.korrigiert));
      if (!falsch.some((f) => falten(f) === falten(k.war))) falsch.push(k.war);
      return { ...c, richtig: k.korrigiert, falsch: falsch.slice(0, 3) };
    });
    if (geaendert) {
      const gesehen = new Set();
      karten = karten.filter((c) => {
        const s = falten(c && c.richtig);
        if (!s) return true;
        if (gesehen.has(s)) return false;
        gesehen.add(s); return true;
      });
      e.karten = karten;
    }
  }
  return aus;
}
