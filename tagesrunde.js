/* Die Tagesrunde "Heute lernen" (25.09.2026).
 *
 * Denny, auf die Frage, wie es weitergeht, per Klickfrage: "Tagesrunde bauen".
 * Ein Knopf auf Pauls Startseite, eine kurze Runde am Tag aus SEINEN Blaettern:
 * was wieder dran ist, dazu etwas Neues - hoechstens 8 Karten.
 *
 * Die Mischung kommt von der Lehrer-Gegenpruefung vom 23.09.2026:
 *   "Der Stapel muss zu etwa zwei Dritteln aus Bekanntem bestehen. Ein Kind,
 *    das taeglich ueberwiegend richtig liegt, kommt morgen wieder."
 * und: "Nachmittags haelt ein Zehnjaehriger freiwillig 5 bis 8 Minuten
 *    konzentriert durch" - daher 8.
 *
 * Hier wird NUR ausgewaehlt, nichts gespeichert und nichts angezeigt. Das
 * Zeigen macht /fundkarten.js, das Merken /api/quiz (fund). Die Datei laeuft
 * im Browser (window.LWTag) und im Selbsttest (node pruefe-tagesrunde.mjs).
 *
 * Die Sorten einer Karte, nach ihrem Stand in der Wiedervorlage:
 *   wackler  faellig, beim letzten Mal danebengetippt   -> unsicher
 *   neu      noch nie gespielt                          -> unsicher
 *   wieder   faellig, beim letzten Mal richtig          -> bekannt
 *   sicher   gespielt, richtig, noch nicht faellig      -> bekannt (Fuellstoff)
 *   ruht     danebengetippt, aber noch nicht faellig    -> nur, wenn sonst nichts da ist
 *
 * ⚠️ Nichts davon zwingt. Paul kann die Runde abbrechen, und im Such-Spiel
 * darunter waehlt er weiter jedes Blatt selbst (Denny, 24.09.2026: "Paul soll
 * doch selber entscheiden, wann er lernen will und welchen Bereich").
 */
(function (global) {
  "use strict";

  var EIN = {
    hoechstens: 8,
    /* Hoechstens so viele Unsichere (neu + wackler) - solange es genug
       Bekanntes gibt. Gibt es keins (die ersten Tage), fuellt Neues auf:
       lieber eine Runde mit lauter Neuem als gar keine. */
    unsicherHoechstens: 3,
    mindestens: 3
  };

  function schluessel(k) {
    return String((k && k.richtig) || "").toLowerCase().replace(/[^a-z0-9äöüß]+/g, "").slice(0, 40);
  }

  function sorteVon(stand) {
    if (!stand) return "neu";
    if (stand.faellig) return stand.f ? "wackler" : "wieder";
    return stand.f ? "ruht" : "sicher";
  }

  /* Aus mehreren Blaettern reihum nehmen, damit die Runde nicht nur aus dem
     juengsten Blatt besteht. `gruppen` ist schon nach Vorrang sortiert. */
  function reihum(gruppen, n) {
    var raus = [], i = 0, weiter = true;
    while (raus.length < n && weiter) {
      weiter = false;
      for (var g = 0; g < gruppen.length && raus.length < n; g++) {
        if (i < gruppen[g].length) { raus.push(gruppen[g][i]); weiter = true; }
      }
      i++;
    }
    return raus;
  }

  /* blaetter: [{id, titel, datum, sichtbar, karten:[...]}] aus /api/schulstoff
     stand:    fundStand aus /api/quiz?nurWartend=1
     Rueckgabe: { karten:[...mit .blatt, .blattTitel, .sorte], zaehl:{...} } */
  function waehlen(blaetter, stand, opt) {
    var e = {};
    for (var x in EIN) e[x] = EIN[x];
    for (var y in (opt || {})) e[y] = opt[y];
    stand = stand || {};

    var liste = (blaetter || []).filter(function (b) {
      return b && b.id && b.sichtbar !== false && Array.isArray(b.karten) && b.karten.length;
    }).slice().sort(function (a, b) {
      return String(b.datum || "").localeCompare(String(a.datum || ""));  // juengstes zuerst
    });

    var topf = { wackler: [], neu: [], wieder: [], sicher: [], ruht: [] };
    var neuJeBlatt = [], gesehen = {};
    liste.forEach(function (b) {
      var neuHier = [];
      b.karten.forEach(function (k) {
        if (!k || !k.frage || !k.richtig || !k.falsch || k.falsch.length !== 2) return;
        var key = b.id + "#k:" + schluessel(k);
        if (gesehen[key]) return;             // dieselbe Antwort zweimal auf einem Blatt
        gesehen[key] = 1;
        var st = stand[key];
        var c = {};
        for (var z in k) c[z] = k[z];
        c.blatt = b.id; c.blattTitel = b.titel || ""; c.sorte = sorteVon(st);
        c._tage = st && st.tage != null ? st.tage : 0; c._r = st ? st.r : 0;
        if (c.sorte === "neu") neuHier.push(c); else topf[c.sorte].push(c);
      });
      if (neuHier.length) neuJeBlatt.push(neuHier);
    });
    // Am laengsten her zuerst; bei "sicher" das Unsicherste (wenig r) zuerst.
    topf.wackler.sort(function (a, b) { return b._tage - a._tage; });
    topf.wieder.sort(function (a, b) { return b._tage - a._tage; });
    topf.sicher.sort(function (a, b) { return (a._r - b._r) || (b._tage - a._tage); });
    topf.ruht.sort(function (a, b) { return b._tage - a._tage; });
    topf.neu = reihum(neuJeBlatt, Infinity);

    var bekannt = topf.wieder.concat(topf.sicher);
    var unsicher = topf.wackler.concat(topf.neu);
    var n = e.hoechstens;
    var platzUnsicher = Math.min(e.unsicherHoechstens, n);
    /* Reicht das Bekannte nicht, bekommt das Unsichere den Rest. */
    if (bekannt.length < n - platzUnsicher) platzUnsicher = n - bekannt.length;
    var u = unsicher.slice(0, platzUnsicher);
    var b2 = bekannt.slice(0, n - u.length);
    var rest = n - u.length - b2.length;
    var r = rest > 0 ? topf.ruht.slice(0, rest) : [];

    /* Reihenfolge: mit Bekanntem anfangen, Unsicheres dazwischen streuen -
       die ersten Karten sollen gelingen. */
    var sicherTeil = b2.concat(r), karten = [];
    var jede = u.length ? Math.max(1, Math.floor((sicherTeil.length + u.length) / u.length)) : 0;
    var ui = 0, si = 0;
    for (var p = 0; karten.length < sicherTeil.length + u.length; p++) {
      var unsicherHier = u.length && ui < u.length && si > 0 && (p % jede === jede - 1);
      if (unsicherHier || si >= sicherTeil.length) karten.push(u[ui++]);
      else karten.push(sicherTeil[si++]);
    }
    karten.forEach(function (k) { delete k._tage; delete k._r; });

    var zaehl = { wackler: 0, neu: 0, wieder: 0, sicher: 0, ruht: 0 };
    karten.forEach(function (k) { zaehl[k.sorte]++; });
    if (karten.length < e.mindestens) karten = [];
    return { karten: karten, zaehl: zaehl, blaetter: liste.length };
  }

  var LWTag = { waehlen: waehlen, schluessel: schluessel, EIN: EIN };
  if (typeof module !== "undefined" && module.exports) module.exports = LWTag;
  else global.LWTag = LWTag;
})(typeof window !== "undefined" ? window : this);
