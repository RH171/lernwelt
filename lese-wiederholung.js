/* Lese-Wiederholung in "Heute lernen" - nur ein Kind, KIND==="paul" in quiz/such.js (28.10.2026, Kapitel 149).
 *
 * Denny (Wahl 28.10.2026, 13:51 Uhr), gebaut wie die Mathe-Wiederholung (Kapitel 142):
 *   - hoechstens 1 Lese-Karte je Runde, Lese-Karten fruehestens alle 3 Tage
 *   - nie als erste Karte, nicht in Fach-Runden (das regeln tagesrunde.js und quiz/such.js)
 *   - drei Formate: Zeile finden · ganze Antwort waehlen · Wortbedeutung
 *   - Stufen wie bei Mathe: falsch -> 2 Tage · 1x richtig -> 4 · 2x -> 7 · ab 3x sicher -> 28
 *
 * Hier wird NUR ausgewaehlt. Gemerkt wird wie bei Mathe ueber den bestehenden Weg:
 * Das Ergebnis geht mit den Fundkarten im selben POST /api/quiz {fund} an den
 * Server (Blatt "lesen", Karte = Karten-id) - kein zusaetzlicher Schreibvorgang.
 * Der Stand kommt aus fundStand ("lesen#k:<id>", mit z seit _wiedervorlage.js).
 *
 * Anders als bei Mathe ist der Stand je KARTE, nicht je Art: Jede Karte ist eine
 * eigene, wortwoertlich gepruefte Stelle aus einem Text. Abwechslung kommt aus der
 * Reihenfolge (Formate verschraenkt, je Format hoechstens eine Karte je Runde) und
 * der Lage der richtigen Antwort, die vom Tag abhaengt.
 *
 * Laeuft im Browser (window.LWLesen) und im Selbsttest (node pruefe-lese-wiederholung.mjs).
 */
(function (g) {
  "use strict";

  var EIN = {
    hoechstens: 1,
    abstandTage: 3,
    nachFehler: 2,
    stufen: { 1: 4, 2: 7 },
    sicherAb: 3,
    sicherTage: 28,
    blatt: "lesen",
    blattTitel: "Lese-Wiederholung"
  };

  function tagVon(d) {
    var x = d instanceof Date ? d : new Date(d);
    if (isNaN(x.getTime())) return "";
    /* Ortszeit, nicht UTC (anleitung/096). */
    return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  }
  function tageZwischen(a, b) {
    var x = Date.parse(a + "T12:00:00Z"), y = Date.parse(b + "T12:00:00Z");
    return isFinite(x) && isFinite(y) ? Math.round((y - x) / 86400000) : 999;
  }
  /* Derselbe Schluessel wie punktSchluessel() fuer Fundkarten im Server. */
  function idSchluessel(id) {
    return String(id || "").toLowerCase().replace(/[^a-z0-9äöüß]+/g, "").slice(0, 40);
  }
  function standSchluessel(id) { return EIN.blatt + "#k:" + idSchluessel(id); }

  function letzterTag(stand, heute) {
    var best = "";
    Object.keys(stand || {}).forEach(function (s) {
      if (s.indexOf(EIN.blatt + "#k:") !== 0) return;
      var st = stand[s] || {}, t = "";
      if (st.z) t = tagVon(Number(st.z));
      else if (st.tage != null) {
        var d = new Date(Date.parse(heute + "T12:00:00")); d.setDate(d.getDate() - Number(st.tage)); t = tagVon(d);
      }
      if (t && t > best) best = t;
    });
    return best;
  }
  function seitTagen(st, heute) {
    if (!st) return null;
    if (st.z) return tageZwischen(tagVon(Number(st.z)), heute);
    return st.tage != null ? Number(st.tage) : null;
  }
  function lageVon(st, heute) {
    if (!st) return { stufe: "neu", faellig: true, ueber: 0, r: 0 };
    var seit = seitTagen(st, heute), r = Number(st.r) || 0, abstand;
    var stufe = st.f ? "fehler" : (r >= EIN.sicherAb ? "sicher" : "lernt");
    if (stufe === "fehler") abstand = EIN.nachFehler;
    else if (stufe === "sicher") abstand = EIN.sicherTage;
    else abstand = EIN.stufen[r] || EIN.stufen[1];
    var ueber = seit == null ? 0 : seit - abstand;
    return { stufe: stufe, faellig: seit == null || ueber >= 0, ueber: ueber, r: r };
  }
  function tagNummer(heute) { return Math.round(Date.parse(heute + "T12:00:00Z") / 86400000) || 0; }

  function brauchbar(a) {
    return a && a.id && a.format && a.frage && a.richtig && Array.isArray(a.falsch) && a.falsch.length === 2 &&
      (a.format !== "zeile" || (Array.isArray(a.auszug) && a.auszug.length >= 2));
  }

  /* daten: LWLeseDaten · stand: fundStand · opt.heute "JJJJ-MM-TT"
     Rueckgabe: { karten: [...], grund: "pause" | "nichts" | "da", letzter } */
  function waehlen(daten, stand, opt) {
    opt = opt || {};
    var e = {}; for (var x in EIN) e[x] = EIN[x];
    for (var y in opt) if (y in EIN) e[y] = opt[y];
    var heute = opt.heute || tagVon(new Date());
    stand = stand || {};
    var letzter = letzterTag(stand, heute);
    if (letzter && tageZwischen(letzter, heute) < e.abstandTage) return { karten: [], grund: "pause", letzter: letzter };

    var kandidaten = [];
    (daten || []).forEach(function (a, n) {
      if (!brauchbar(a)) return;
      var l = lageVon(stand[standSchluessel(a.id)], heute);
      if (l.faellig) kandidaten.push({ a: a, n: n, lage: l });
    });
    /* Fehler zuerst, dann Faelliges im Lernen (r 1-2), dann Neues, zuletzt Sicheres (28 Tage).
       ABWEICHUNG von Mathe (gemessen 28.10.2026, Selbsttest ueber 400 Tage): Mit Mathe-Reihenfolge
       (Sicheres vor Neuem) fuellen bei 1 Karte je 3 Tage schon 9 sichere Karten alle Plaetze
       (28 / 3 = 9,3) - die Karten 10 bis 18 kaemen NIE dran. */
    var gruppe = function (k) {
      var s = k.lage.stufe;
      return s === "fehler" ? 0 : (s === "lernt" ? 1 : (s === "neu" ? 2 : 3));
    };
    kandidaten.sort(function (p, q) {
      return (gruppe(p) - gruppe(q)) || (q.lage.ueber - p.lage.ueber) || (p.n - q.n);
    });
    var nimm = [], formate = {};
    kandidaten.forEach(function (k) {
      if (nimm.length >= e.hoechstens || formate[k.a.format]) return;
      nimm.push(k); formate[k.a.format] = 1;
    });
    kandidaten.forEach(function (k) { if (nimm.length < e.hoechstens && nimm.indexOf(k) < 0) nimm.push(k); });

    var tn = tagNummer(heute);
    var karten = nimm.map(function (k) {
      var a = k.a;
      return {
        frage: a.frage, richtig: String(a.richtig), falsch: [String(a.falsch[0]), String(a.falsch[1])],
        stichwort: a.stichwort || "Lesen", merke: a.merke || "",
        blatt: e.blatt, blattTitel: e.blattTitel, sorte: "lesen",
        lesen: { id: a.id, format: a.format, text: a.text || "", zeilen: a.format === "zeile" ? a.auszug : [],
                 /* Lage der richtigen Antwort: haengt am Tag, nicht an der Kartennummer der Runde. */
                 pos: (tn + k.n) % 3, stufe: k.lage.stufe }
      };
    });
    return { karten: karten, grund: karten.length ? "da" : "nichts", letzter: letzter };
  }

  var LWLesen = { waehlen: waehlen, lageVon: lageVon, letzterTag: letzterTag,
    standSchluessel: standSchluessel, idSchluessel: idSchluessel, EIN: EIN };
  if (typeof module !== "undefined" && module.exports) module.exports = LWLesen;
  else g.LWLesen = LWLesen;
})(typeof window !== "undefined" ? window : this);
