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
    mindestens: 3,
    /* Vorrang (16.10.2026, Denny zu Pauls Zahlenraetsel: "Wir finden dieses
       Blatt nicht in Heute lernen - das ist genau, wo Paul Probleme hat.
       Textaufgaben."). Gemessen: Die drei Plaetze fuer Unsicheres gingen an
       drei alte Wackler aus dem September, KEINE neue Karte kam in die Runde.
       Vorrang haben jetzt: Karten zu einer Stelle, die die Lehrerin rot
       verbessert hat, je frisches Blatt zwei Karten, dann Textaufgaben.
       Solange es Vorrang gibt, duerfen es bis zu 5 Unsichere sein (3 Bekannte
       bleiben) - so weit gelockert wie noetig, nicht weiter. */
    vorrangHoechstens: 5,
    jeFrischemBlatt: 2,
    /* "Frisch" = hochgeladen heute oder in den 2 Tagen davor und noch keine
       Karte davon gespielt. So geht ein Blatt vom Freitagabend nicht verloren,
       wenn am Freitag keine Runde mehr kam. */
    frischTage: 2
  };

  function tagVon(d) {
    var x = d instanceof Date ? d : new Date(d);
    if (isNaN(x.getTime())) return "";
    /* Ortszeit, nicht UTC (anleitung/096) - um 00:30 Uhr ist schon morgen. */
    return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  }
  function tageZwischen(a, b) {
    var x = Date.parse(a + "T12:00:00Z"), y = Date.parse(b + "T12:00:00Z");
    return isFinite(x) && isFinite(y) ? Math.round((y - x) / 86400000) : 999;
  }
  function knapp(s) {
    return String(s == null ? "" : s).toLowerCase().replace(/[\s.,'\u2019`\-\u2013\u2014]/g, "");
  }

  /* Hat Paul auf diesem Blatt Fehler gemacht, die die Lehrerin verbessert hat?
     Quellen: Korrektur mit quelle "lehrerin" (Pruef-Reiter) und Inhaltszeilen
     der Lehrkraft mit Verbesserung ("Lehrkraft: f. 585 (Kind schrieb 238)").
     Ein blosser Haken oder ein Stempel ist kein Fehler. */
  function lehrerinVerbessert(b) {
    var raus = [];
    (b.korrekturen || []).forEach(function (k) {
      if (!k || k.quelle !== "lehrerin") return;
      var m = /\bf\.\s*([^\s(]+)/.exec(String(k.korrigiert || ""));
      raus.push(m ? m[1] : "");
    });
    (b.inhalt || []).forEach(function (z) {
      z = String(z || "");
      if (!/Lehrkraft/i.test(z)) return;
      var m = /\bf\.\s*([^\s(]+)/.exec(z) || /richtig:\s*([^,;)]+)/.exec(z);
      if (m) raus.push(m[1].trim());
      else if (/Kind schrieb|verbessert|noch ?mal anschauen/i.test(z)) raus.push("");
    });
    return raus;
  }
  /* Text-, Sach- und Raetselaufgaben: die Karte traegt den Wortlaut vom Blatt
     (k.text vom Lesen) oder erkennbar die Form einer Textaufgabe. */
  function istText(k, b) {
    if (k && k.text) return true;
    var f = String((k && k.frage) || "");
    if (/\bich denke mir\b|wie hei(ß|ss)t meine zahl|\b(kostet|kosten|bezahlt|kauft|euro|cent)\b|€/i.test(f)) return true;
    return /zahlenr(ä|ae)tsel|sachaufgabe|textaufgabe|sachrechnen/i.test(String((b && b.titel) || "") + " " + String((b && b.thema) || ""));
  }

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
  /* quiz: quizWackler aus /api/quiz?nurWartend=1 (28.09.2026) - faellige
     Quizfragen, bei denen Paul zuletzt danebenlag. Sie zaehlen als Wackler. */
  function waehlen(blaetter, stand, opt, quiz) {
    var e = {};
    for (var x in EIN) e[x] = EIN[x];
    for (var y in (opt || {})) e[y] = opt[y];
    stand = stand || {};
    var heute = e.heute || tagVon(new Date());

    /* Ein Fach (19.10.2026, Probenfokus Deutsch und HSU, Kapitel 131): opt.fach = "hsu" nimmt nur
       Blaetter dieses Fachs (Heft-Schluessel, "deutsch-…" zaehlt zu "deutsch"). Damit fallen auch
       Quizfehler anderer Faecher weg (sie haengen an ihrem Blatt). Ohne opt.fach alles wie vorher. */
    var fachPasst = function (b) {
      if (!e.fach) return true;
      var f = String(b.fach || "").toLowerCase();
      return f === e.fach || f.indexOf(e.fach + "-") === 0;
    };
    /* opt.ohne: Schluessel, die in dieser Sitzung schon dran waren ("<blatt>#k:<antwort>", "q:<frageId>") -
       fuer "Noch 10 Fragen". */
    var ohne = e.ohne || {};
    var liste = (blaetter || []).filter(function (b) {
      /* Handwerk (Lineatur, Heftregeln) ist kein Probenstoff - 30.09.2026. */
      return b && b.id && b.sichtbar !== false && b.probenstoff !== false && Array.isArray(b.karten) && b.karten.length && fachPasst(b);
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
        if (gesehen[key] || ohne[key]) return;  // dieselbe Antwort zweimal auf einem Blatt / schon dran
        gesehen[key] = 1;
        var st = stand[key];
        var c = {};
        for (var z in k) c[z] = k[z];
        c.blatt = b.id; c.blattTitel = b.titel || ""; c.sorte = sorteVon(st);
        c._tage = st && st.tage != null ? st.tage : 0; c._r = st ? st.r : 0;
        c._b = b;
        if (c.sorte === "neu") neuHier.push(c); else topf[c.sorte].push(c);
      });
      if (neuHier.length) neuJeBlatt.push(neuHier);
    });
    var titel = {};
    liste.forEach(function (b) { titel[b.id] = b.titel || ""; });
    (quiz || []).forEach(function (q) {
      if (!q || !q.frage || !q.richtig || !q.falsch || q.falsch.length !== 2) return;
      if (!(q.blatt in titel)) return;          // ausgeblendetes Blatt (oder anderes Fach): nicht abfragen
      if (q.frageId != null && ohne["q:" + q.frageId]) return;
      topf.wackler.push({ frage: q.frage, richtig: q.richtig, falsch: q.falsch,
        merke: q.merke || "", stichwort: "Aus dem Quiz", blatt: q.blatt,
        blattTitel: titel[q.blatt], sorte: "wackler",
        quiz: { belegNr: q.belegNr, frageId: q.frageId }, _tage: q.tage || 0, _r: 0 });
    });
    // Am laengsten her zuerst; bei "sicher" das Unsicherste (wenig r) zuerst.
    topf.wackler.sort(function (a, b) { return b._tage - a._tage; });
    topf.wieder.sort(function (a, b) { return b._tage - a._tage; });
    topf.sicher.sort(function (a, b) { return (a._r - b._r) || (b._tage - a._tage); });
    topf.ruht.sort(function (a, b) { return b._tage - a._tage; });
    topf.neu = reihum(neuJeBlatt, Infinity);

    var bekannt = topf.wieder.concat(topf.sicher);
    /* opt.ruhtUnsicher (19.10.2026, Denny zur HSU-Runde: "alles, was er falsch hatte und was noch nicht
       sitzt"): Danebengetipptes, das noch nicht wieder faellig ist, zaehlt mit zum Unsicheren - nach
       den faelligen Wacklern, vor dem Neuen. Ohne die Angabe bleibt es Fuellstoff wie bisher. */
    var unsicher = e.ruhtUnsicher ? topf.wackler.concat(topf.ruht, topf.neu) : topf.wackler.concat(topf.neu);
    if (e.ruhtUnsicher) topf.ruht = [];
    /* opt.mathe (26.10.2026, Kapitel 142, nur Paul): fertige Mathe-Karten aus LWMathe.waehlen().
       Sie bekommen ihre Plaetze VOR allem anderen (hoechstens 2, das zaehlt LWMathe) und werden
       unten eingestreut, nie als erste Karte. Ohne opt.mathe alles wie vorher. */
    var mathe = (Array.isArray(e.mathe) ? e.mathe : []).filter(function (k) { return k && k.mathe && k.frage; })
      .slice(0, e.hoechstens);
    /* opt.lesen (28.10.2026, Kapitel 149, ein Kind): fertige Lese-Karten aus LWLesen.waehlen()
       (hoechstens 1, das zaehlt LWLesen). Wie Mathe: Platz vorab, eingestreut, nie als erste Karte. */
    var lesen = (Array.isArray(e.lesen) ? e.lesen : []).filter(function (k) { return k && k.lesen && k.frage; })
      .slice(0, Math.max(0, e.hoechstens - mathe.length));
    var n = e.hoechstens - mathe.length - lesen.length;

    /* ---- Vorrang (16.10.2026) ---- */
    var fehlerBlatt = {}, fehlerWert = {}, gespielt = {}, frisch = {};
    liste.forEach(function (b) {
      var v = lehrerinVerbessert(b);
      if (v.length) fehlerBlatt[b.id] = 1;
      v.forEach(function (w) { if (w) fehlerWert[b.id + "|" + knapp(w)] = 1; });
    });
    (quiz || []).forEach(function (q) { if (q && q.blatt) fehlerBlatt[q.blatt] = 1; });   // eigene Quizfehler
    Object.keys(stand).forEach(function (s) {
      var i = s.indexOf("#k:"); if (i < 1) return;
      gespielt[s.slice(0, i)] = 1;
      if (stand[s] && stand[s].f) fehlerBlatt[s.slice(0, i)] = 1;           // eigene Fundkarten-Fehler
    });
    /* opt.nachBlattdatum (28.10.2026, Schritt 2, nur Paul): frisch zaehlt nach dem Datum des Blattes,
       nicht nach dem Hochladen - ein altes Blatt, heute fotografiert, ist nicht neu. Ein Blatt ohne
       Datum ("ohne") oder mit unsicherem Datum gilt im Zweifel als alt. */
    liste.forEach(function (b) {
      if (e.nachBlattdatum && (b.datumUnsicher || b.datumVon === "ohne")) return;
      var tag = e.nachBlattdatum ? String(b.datum || "").slice(0, 10)
        : (b.angelegt ? tagVon(b.angelegt) : String(b.datum || "").slice(0, 10));
      var alter = tageZwischen(tag, heute);
      if (alter >= 0 && alter <= e.frischTage && !gespielt[b.id]) frisch[b.id] = alter;
    });
    var istFehlerKarte = function (c) { return !!fehlerWert[c.blatt + "|" + knapp(c.richtig)]; };
    var rang = function (c) {   // innerhalb eines Blattes: Fehlerstelle, Textaufgabe, Rest
      return (istFehlerKarte(c) ? 0 : 2) + (istText(c, c._b) ? 0 : 1);
    };
    var vorrang = [], drin = [];
    var nimm = function (c) { if (c && drin.indexOf(c) < 0) { drin.push(c); vorrang.push(c); } };
    // 1. Auf frischen Blaettern: Stellen, die die Lehrerin rot verbessert hat (Antwort = ihre Loesung)
    unsicher.filter(function (c) { return istFehlerKarte(c) && c.blatt in frisch; }).forEach(nimm);
    // 2. Je frisches Blatt zwei Karten: Fehlerblaetter zuerst, dann Textaufgaben, dann das juengste
    var frischeBlaetter = liste.filter(function (b) { return b.id in frisch; }).sort(function (a, b) {
      var ra = (fehlerBlatt[a.id] ? 0 : 2) + (a.karten.some(function (k) { return istText(k, a); }) ? 0 : 1);
      var rb = (fehlerBlatt[b.id] ? 0 : 2) + (b.karten.some(function (k) { return istText(k, b); }) ? 0 : 1);
      return (ra - rb) || (frisch[a.id] - frisch[b.id]);
    });
    frischeBlaetter.forEach(function (b) {
      var schon = vorrang.filter(function (c) { return c.blatt === b.id; }).length;
      unsicher.filter(function (c) { return c.blatt === b.id && drin.indexOf(c) < 0; })
        .sort(function (a, c) { return rang(a) - rang(c); })
        .slice(0, Math.max(0, e.jeFrischemBlatt - schon)).forEach(nimm);
    });
    // 3. Verbesserte Stellen auf aelteren Blaettern (juengstes Blatt zuerst)
    unsicher.filter(istFehlerKarte).forEach(nimm);
    // 4. Textaufgaben: erst von Blaettern mit Fehlern, dann alle (juengstes Blatt zuerst)
    unsicher.filter(function (c) { return istText(c, c._b) && fehlerBlatt[c.blatt]; }).forEach(nimm);
    unsicher.filter(function (c) { return istText(c, c._b); }).forEach(nimm);

    var platzVorrang = Math.min(e.vorrangHoechstens, n);
    var v = vorrang.slice(0, platzVorrang);
    var platzUnsicher = Math.min(Math.max(e.unsicherHoechstens, v.length), n);
    /* Reicht das Bekannte nicht, bekommt das Unsichere den Rest. */
    if (bekannt.length < n - platzUnsicher) platzUnsicher = n - bekannt.length;
    var u = v.concat(unsicher.filter(function (c) { return v.indexOf(c) < 0; })).slice(0, platzUnsicher);
    var b2 = bekannt.slice(0, n - u.length);
    var rest = n - u.length - b2.length;
    var r = rest > 0 ? topf.ruht.slice(0, rest) : [];

    /* Reihenfolge: mit Bekanntem anfangen, Unsicheres dazwischen streuen -
       die ersten Karten sollen gelingen. */
    var sicherTeil = b2.concat(r), karten = [];
    var ui = 0, si = 0;
    if (u.length > sicherTeil.length) {
      /* Mehr Unsicheres als Bekanntes (Vorrang-Tag): abwechselnd, mit
         Bekanntem vorn - nebeneinander steht nur, was nicht anders passt. */
      while (karten.length < sicherTeil.length + u.length) {
        if (si < sicherTeil.length) karten.push(sicherTeil[si++]);
        if (ui < u.length) karten.push(u[ui++]);
      }
    } else {
      var jede = u.length ? Math.max(1, Math.floor((sicherTeil.length + u.length) / u.length)) : 0;
      for (var p = 0; karten.length < sicherTeil.length + u.length; p++) {
        var unsicherHier = u.length && ui < u.length && si > 0 && (p % jede === jede - 1);
        if (unsicherHier || si >= sicherTeil.length) karten.push(u[ui++]);
        else karten.push(sicherTeil[si++]);
      }
    }
    karten.forEach(function (k) {
      if (v.indexOf(k) >= 0) k.vorrang = istFehlerKarte(k) ? "fehler" : (k.blatt in frisch ? "frisch" : "text");
      delete k._tage; delete k._r; delete k._b;
    });

    /* Ohne eine einzige Karte aus dem Heft gibt es keine Runde - auch nicht aus Mathe und Lesen
       allein (2 Mathe + 1 Lesen wuerden sonst die 3 Mindestkarten fuellen, 28.10.2026). */
    var heftKarten = karten.length;
    /* Mathe einstreuen: gleichmaessig verteilt, die erste Karte bleibt eine aus dem Heft. */
    mathe.forEach(function (k, i) {
      var pos = karten.length ? Math.max(1, Math.round((i + 1) * (karten.length + 1) / (mathe.length + 1))) : 0;
      k.sorte = "mathe";
      karten.splice(Math.min(pos + i, karten.length), 0, k);
    });
    /* Lesen einstreuen: in die Mitte, nie an Platz 1 und nicht direkt neben eine Mathe-Karte, wenn es anders geht. */
    lesen.forEach(function (k, i) {
      k.sorte = "lesen";
      var pos = karten.length ? Math.max(1, Math.round(karten.length / 2) + i) : 0;
      var frei = function (p) { return !(karten[p - 1] && karten[p - 1].mathe) && !(karten[p] && karten[p].mathe); };
      if (!frei(pos)) for (var d = 1; d < karten.length; d++) {
        if (pos + d <= karten.length && frei(pos + d)) { pos = pos + d; break; }
        if (pos - d >= 1 && frei(pos - d)) { pos = pos - d; break; }
      }
      karten.splice(Math.min(pos, karten.length), 0, k);
    });

    var zaehl = { wackler: 0, neu: 0, wieder: 0, sicher: 0, ruht: 0, vorrang: 0, mathe: 0, lesen: 0 };
    karten.forEach(function (k) { zaehl[k.sorte]++; if (k.vorrang) zaehl.vorrang++; });
    if (karten.length < e.mindestens || !heftKarten) karten = [];
    return { karten: karten, zaehl: zaehl, blaetter: liste.length };
  }

  /* Kreise fuellen (Variante B, Denny 29.09.2026): Paul tippt in "Deine
     Woche" auf einen Tag oder auf "N Kreise fuellen" und bekommt genau die
     Karten, die er erst nachschauen musste. Er hat sie sich selbst
     ausgesucht - deshalb kein Deckel von 3 Unsicheren wie in "Heute lernen".
     Aber: hoechstens 10 offene je Runde, und nach je zwei offenen eine, die
     schon sitzt - die Runde soll nicht nur aus Wacklern bestehen.

     keys:  Lernpunkte ("blatt#k:..." fuer Suchkarten, "blatt#12" fuer Quiz)
     quiz:  kreiseQuiz aus /api/quiz?nurWartend=1&kreise=...
     Rueckgabe: { karten, offen: gefunden, rest: nicht in dieser Runde } */
  function kreise(blaetter, keys, quiz, stand, opt) {
    var e = { hoechstens: 10, jeSicher: 2 };
    for (var y in (opt || {})) e[y] = opt[y];
    stand = stand || {};
    var titel = {}, karteVon = {}, sicher = [];
    (blaetter || []).forEach(function (b) {
      if (!b || !b.id || b.sichtbar === false || !Array.isArray(b.karten)) return;
      titel[b.id] = b.titel || "";
      b.karten.forEach(function (k) {
        if (!k || !k.frage || !k.richtig || !k.falsch || k.falsch.length !== 2) return;
        var key = b.id + "#k:" + schluessel(k);
        if (karteVon[key]) return;
        var c = {};
        for (var z in k) c[z] = k[z];
        c.blatt = b.id; c.blattTitel = b.titel || "";
        karteVon[key] = c;
        var st = stand[key];
        if (st && !st.f) { c.sorte = "sicher"; c._r = st.r || 0; sicher.push(c); }
      });
    });
    var quizVon = {};
    (quiz || []).forEach(function (q) {
      if (!q || !q.frage || !q.richtig || !q.falsch || q.falsch.length !== 2 || !(q.blatt in titel)) return;
      quizVon[Number(q.belegNr) >= 1 ? q.blatt + "#" + Math.floor(Number(q.belegNr))
                                     : q.blatt + "#f:" + String(q.frageId || "").slice(0, 24)] = {
        frage: q.frage, richtig: q.richtig, falsch: q.falsch, merke: q.merke || "",
        stichwort: "Aus dem Quiz", blatt: q.blatt, blattTitel: titel[q.blatt],
        quiz: { belegNr: q.belegNr, frageId: q.frageId } };
    });
    var offen = [], gesehen = {};
    (keys || []).forEach(function (s) {
      if (gesehen[s]) return; gesehen[s] = 1;
      var c = karteVon[s] || quizVon[s];
      if (!c) return;
      c.sorte = "kreis"; offen.push(c);
    });
    var dran = offen.slice(0, e.hoechstens);
    /* Die sicheren vom selben Blatt zuerst - dann passt die Runde zusammen. */
    var blattDran = {};
    dran.forEach(function (c) { blattDran[c.blatt] = 1; });
    sicher.sort(function (a, b) { return ((blattDran[b.blatt] ? 1 : 0) - (blattDran[a.blatt] ? 1 : 0)) || (b._r - a._r); });
    var karten = [], si = 0;
    dran.forEach(function (c, i) {
      karten.push(c);
      if ((i + 1) % e.jeSicher === 0 && i + 1 < dran.length && si < sicher.length) karten.push(sicher[si++]);
    });
    karten.forEach(function (k) { delete k._r; });
    return { karten: karten, offen: dran.length, rest: offen.length - dran.length };
  }

  var LWTag = { waehlen: waehlen, kreise: kreise, schluessel: schluessel, EIN: EIN, istText: istText, lehrerinVerbessert: lehrerinVerbessert };
  if (typeof module !== "undefined" && module.exports) module.exports = LWTag;
  else global.LWTag = LWTag;
})(typeof window !== "undefined" ? window : this);
