/* Mathe-Wiederholung in "Heute lernen" - nur Paul (26.10.2026, Kapitel 142).
 *
 * Denny nach der 1. Matheprobe (Klickfrage, Option A "eng"):
 *   - hoechstens 2 Mathe-Karten je Runde, Mathe-Karten fruehestens alle 3 Tage
 *   - eine falsch beantwortete Aufgabenart kommt nach 2, 4 und 7 Tagen wieder
 *   - "sicher" nach 3x richtig an verschiedenen Tagen, danach alle 28 Tage
 *   - Vorrang: Fehler in einer fremden Rechnung finden, Rechenwoerter
 *     mehrschrittig, Punkt vor Strich (die drei Fehlerarten im Bestand)
 *
 * Hier wird NUR ausgewaehlt und gewertet. Gemerkt wird ueber den bestehenden
 * Weg der Tagesrunde: Das Ergebnis geht mit den Fundkarten im selben POST
 * /api/quiz {fund} an den Server (Blatt "mathe", Karte = Aufgabenart) - kein
 * zusaetzlicher Schreibvorgang. Der Stand kommt aus fundStand ("mathe#k:<art>").
 *
 * Gespeichert wird je Art nur, was der Server ohnehin fuehrt:
 *   r = richtig (bei einem Fehler EINEN Schritt zurueck, nie auf null),
 *   f = zuletzt falsch, z = wann zuletzt (ms).
 * Daraus die Stufen:   f            -> wieder nach 2 Tagen
 *                      r = 1        -> nach 4 Tagen
 *                      r = 2        -> nach 7 Tagen
 *                      r >= 3       -> sicher, nach 28 Tagen
 * "An verschiedenen Tagen" haelt die 3-Tage-Sperre: An einem Tag mit Mathe
 * kommt keine zweite Mathe-Runde, also zaehlt jede Art hoechstens einmal je Tag.
 *
 * Laeuft im Browser (window.LWMathe) und im Selbsttest (node pruefe-mathe-wiederholung.mjs).
 */
(function (g) {
  "use strict";

  var EIN = {
    hoechstens: 2,
    abstandTage: 3,
    nachFehler: 2,
    stufen: { 1: 4, 2: 7 },
    sicherAb: 3,
    sicherTage: 28,
    blatt: "mathe",
    blattTitel: "Mathe-Wiederholung"
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
  function artSchluessel(art) {
    return String(art || "").toLowerCase().replace(/[^a-z0-9äöüß]+/g, "").slice(0, 40);
  }
  function standSchluessel(art) { return EIN.blatt + "#k:" + artSchluessel(art); }

  /* Letzter Tag mit Mathe-Karte, aus dem Stand (z, sonst tage). */
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
  /* Stufe einer Art: neu · fehler · lernt · sicher - und ob sie heute dran ist. */
  function lageVon(st, heute) {
    if (!st) return { stufe: "neu", faellig: true, ueber: 0 };
    var seit = seitTagen(st, heute), r = Number(st.r) || 0, abstand;
    var stufe = st.f ? "fehler" : (r >= EIN.sicherAb ? "sicher" : "lernt");
    if (stufe === "fehler") abstand = EIN.nachFehler;
    else if (stufe === "sicher") abstand = EIN.sicherTage;
    else abstand = EIN.stufen[r] || EIN.stufen[1];
    var ueber = seit == null ? 0 : seit - abstand;
    return { stufe: stufe, faellig: seit == null || ueber >= 0, ueber: ueber, r: r };
  }

  function tagNummer(heute) { return Math.round(Date.parse(heute + "T12:00:00Z") / 86400000) || 0; }

  /* daten: LWMatheDaten · stand: fundStand · opt.heute "JJJJ-MM-TT"
     Rueckgabe: { karten: [...], grund: "pause" | "nichts" | "da", letzter } */
  function waehlen(daten, stand, opt) {
    opt = opt || {};
    var e = {}; for (var x in EIN) e[x] = EIN[x];
    for (var y in opt) if (y in EIN) e[y] = opt[y];
    var heute = opt.heute || tagVon(new Date());
    stand = stand || {};
    var letzter = letzterTag(stand, heute);
    if (letzter && tageZwischen(letzter, heute) < e.abstandTage) return { karten: [], grund: "pause", letzter: letzter };

    var jeArt = {}, reihe = [];
    (daten || []).forEach(function (a) {
      if (!a || !a.art || !a.frage || a.antwort == null) return;
      if (!jeArt[a.art]) { jeArt[a.art] = []; reihe.push(a.art); }
      jeArt[a.art].push(a);
    });
    var kandidaten = [];
    reihe.forEach(function (art, n) {
      var l = lageVon(stand[standSchluessel(art)], heute);
      if (!l.faellig) return;
      var erste = jeArt[art][0];
      kandidaten.push({ art: art, n: n, lage: l, familie: erste.familie || "", vorrang: erste.familie ? 0 : 1 });
    });
    /* Reihenfolge: Fehler zuerst, dann Vorrang-Arten, dann Faelliges, dann Neues;
       innerhalb: Vorrang vor Rest, am laengsten ueberfaellig zuerst, dann Bestandsreihenfolge. */
    var gruppe = function (k) {
      if (k.lage.stufe === "fehler") return 0;
      if (k.vorrang === 0) return 1;
      return k.lage.stufe === "neu" ? 3 : 2;
    };
    kandidaten.sort(function (a, b) {
      return (gruppe(a) - gruppe(b)) || (a.vorrang - b.vorrang) || (b.lage.ueber - a.lage.ueber) || (a.n - b.n);
    });
    /* Je Familie hoechstens eine Karte, solange es anderes gibt - zwei Fehlersuchen
       nebeneinander sind keine Wiederholung, sondern eine Wiederholung zu viel. */
    var nimm = [], familien = {};
    kandidaten.forEach(function (k) {
      if (nimm.length >= e.hoechstens) return;
      if (k.familie && familien[k.familie]) return;
      nimm.push(k); if (k.familie) familien[k.familie] = 1;
    });
    kandidaten.forEach(function (k) {
      if (nimm.length < e.hoechstens && nimm.indexOf(k) < 0) nimm.push(k);
    });
    var tn = tagNummer(heute);
    var karten = nimm.map(function (k) {
      var liste = jeArt[k.art];
      /* Nie dieselbe Aufgabe wie beim letzten Mal: die Wahl haengt am Tag. */
      var a = liste[(tn + k.n * 7) % liste.length];
      return {
        frage: a.frage, richtig: String(a.antwort), falsch: ["-", "-"],
        stichwort: a.stichwort || "Mathe", merke: a.hinweis || "",
        blatt: e.blatt, blattTitel: e.blattTitel, sorte: "mathe",
        mathe: { art: k.art, id: a.id, eingabe: a.eingabe, wie: a.wie || "", weg: a.weg || [], stufe: k.lage.stufe }
      };
    });
    return { karten: karten, grund: karten.length ? "da" : "nichts", letzter: letzter };
  }

  /* ---------- Werten (nach Inhalt) ----------
     zahl  : eine Zahl - ueber LWToleranz.pruefen ("863", "= 863", "863." zaehlen; "862" nicht)
     rest  : Ergebnis und Rest in dieser Reihenfolge ("4 R 6", "4 Rest 6", "4 r6")
     menge : alle Zahlen, Reihenfolge egal, keine fehlt, keine zu viel
     folge : Ziffern in Leserichtung ("5, 6, 6", "5 6 6", "566") */
  function zahlen(s) {
    return (String(s || "").match(/\d+/g) || []).map(Number);
  }
  function pruefen(karte, eingabe, tol) {
    var m = (karte && karte.mathe) || {}, soll = String((karte && karte.richtig) || "");
    var roh = String(eingabe == null ? "" : eingabe).trim();
    if (!roh) return { stimmt: false, leer: true };
    var z = zahlen(roh), zs = zahlen(soll);
    if (m.eingabe === "zahl") {
      /* "1.000" und "1 000" sind tausend, nicht eins und null. */
      roh = roh.replace(/(\d)[.\s](?=\d{3}(?!\d))/g, "$1"); z = zahlen(roh);
      tol = tol || g.LWToleranz;
      if (tol && tol.pruefen) {
        var r = tol.pruefen(roh, soll, { tippfehler: false });
        return { stimmt: r.stufe === "gut" || (r.stufe === "fast" && z.length === 1 && z[0] === zs[0]) };
      }
      return { stimmt: z.length === 1 && z[0] === zs[0] };
    }
    if (m.eingabe === "rest") return { stimmt: z.length === 2 && z[0] === zs[0] && z[1] === zs[1] };
    if (m.eingabe === "menge") {
      var a = z.slice().sort(function (p, q) { return p - q; }), b = zs.slice().sort(function (p, q) { return p - q; });
      return { stimmt: a.length === b.length && a.every(function (v, i) { return v === b[i]; }) };
    }
    if (m.eingabe === "folge") {
      /* "566" ohne Trennzeichen: Ziffer fuer Ziffer lesen. */
      if (z.length === 1 && String(z[0]).length === zs.length) z = String(roh.match(/\d+/)[0]).split("").map(Number);
      return { stimmt: z.length === zs.length && z.every(function (v, i) { return v === zs[i]; }) };
    }
    return { stimmt: false };
  }

  var LWMathe = { waehlen: waehlen, pruefen: pruefen, lageVon: lageVon, letzterTag: letzterTag,
    standSchluessel: standSchluessel, artSchluessel: artSchluessel, EIN: EIN };
  if (typeof module !== "undefined" && module.exports) module.exports = LWMathe;
  else g.LWMathe = LWMathe;
})(typeof window !== "undefined" ? window : this);
