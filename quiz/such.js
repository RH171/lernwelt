/* Such-Spiel, "Heute lernen" und die Blattwahl mit Suchen-Knopf im Lernquiz.
 *
 * Bis 29.09.2026 stand das inline in paul/quiz.html ("Erst Paul fertig, dann
 * uebertragen", Denny 23.09.2026). Mit der Uebertragung auf Helena liegt es
 * EINMAL hier; das Kind kommt aus window.QUIZ.kind. Wer hier etwas aendert,
 * misst Paul UND Helena (und Leon, sobald er es bekommt).
 *
 * Braucht auf der Seite: #heute-wahl, #heute-unter, #heute-los, #heute-selbst,
 * #such-wahl, #such-liste, #sicht-such, #fundkarten, #such-zurueck, dazu
 * /fundkarten.js und /tagesrunde.js davor.
 */
/* Such-Spiel: Blaetter mit mindestens drei Fundkarten anbieten. Nur fuer
   Paul, nicht im geteilten /quiz/motor.js - "Erst Paul fertig, dann
   uebertragen" (Denny, 23.09.2026). Ohne Karten bleibt die Karte verborgen:
   ein leeres Angebot waere schlimmer als keines. */
(function(){
  function $(i){ return document.getElementById(i); }
  function datum(iso){ var t = String(iso || "").split("-"); return t.length === 3 ? (+t[2]) + "." + (+t[1]) + "." : ""; }
  var KIND = (window.QUIZ && window.QUIZ.kind) || "paul";
  /* Fachnamen aus der Seite (window.QUIZ.faecher), nicht fest - Helena hat
     andere Faecher als Paul. */
  var FACH = {};
  ((window.QUIZ && window.QUIZ.faecher) || []).forEach(function(f){ FACH[f.k] = f.n; });
  function zurueck(){
    if (window.LWFachzeit) LWFachzeit.fach(null);
    $("fundkarten").innerHTML = "";
    $("sicht-such").classList.add("verborgen");
    $("sicht-start").classList.remove("verborgen");
    window.scrollTo(0, 0);
  }
  /* Wiedervorlage (Denny, 25.09.2026): Was faellig ist, steht vorn; nach
     jeder Runde geht EIN Schreibvorgang an /api/quiz (fund). */
  var faellig = {}, faelligText = {}, fundStand = {}, quizWackler = [], fundFormen = {}, schritt4 = null, heute = null;
  /* Entwurf A (Denny, 28.09.2026): "🔎 Suchen" steht direkt hinter jedem
     Blatt in der Blattwahl des Quiz. Die eigene Such-Karte bleibt nur da,
     wo keine Blattliste steht (mehrere oder alle Faecher). */
  var suchMap = {}, suchListe = [];
  window.QUIZ_BLATT_EXTRA = function(b){
    var x = suchMap[b.id];
    if (!x) return null;
    var k = document.createElement("button");
    k.type = "button"; k.className = "qsuch";
    k.setAttribute("data-such", b.id);
    k.setAttribute("aria-label", "Such-Spiel zu " + (x.titel || "diesem Blatt"));
    /* Faellige Karten sichtbar machen (28.09.2026): Die alte Such-Karte zeigte
       "1 wartet auf dich" - in der Zeile steht es jetzt als Zahl am Knopf. */
    var n = (faellig[b.id] || []).length;
    k.textContent = n ? "🔎 Suchen · " + n + " wieder dran" : "🔎 Suchen";
    if (n) k.classList.add("faellig");
    k.addEventListener("click", function(ev){ ev.stopPropagation(); starten(x); });
    return k;
  };
  /* Teil 1 A (Denny, 29.09.2026): Der Stand je Blatt - sitzt · uebst du
     noch · neu - steht im Lernquiz an jedem Blatt der Blattwahl, nicht mehr
     als "Bericht" auf der Startseite. Dieselbe Zaehlung wie "Mein Heft"
     (heft-start.js): sitzt = zuletzt beim ersten Tipp gewusst, uebst du noch
     = zuletzt daneben, neu = noch nie gespielt. Liefert null, wenn das Blatt
     keine Karten hat - dann steht dort nichts. */
  function kartenSchluessel(k){
    return String((k && k.richtig) || "").toLowerCase().replace(/[^a-z0-9äöüß]+/g, "").slice(0, 40);
  }
  window.QUIZ_BLATT_STAND = function(b){
    var x = suchMap[b.id];
    if (!x) return null;
    var s = 0, n = 0, neu = 0, gesehen = {};
    x.karten.forEach(function(c){
      if (!c || !c.richtig) return;
      var key = x.id + "#k:" + kartenSchluessel(c);
      if (gesehen[key]) return; gesehen[key] = 1;
      var st = fundStand[key];
      if (!st) neu++; else if (st.f) n++; else s++;
    });
    return (s + n + neu) ? { sitzt: s, noch: n, neu: neu } : null;
  };
  /* Die eigene Such-Karte ist seit 29.09.2026 immer zu. Denny: "Der Punkt
     Suchspiele kann hier auch verschwinden, weil das jetzt geloest werden
     kann ueber die Buttons, die er auswaehlt" - das Such-Spiel startet ueber
     "🔎 Suchen" am Blatt, nachdem Paul ein Fach gewaehlt hat. Nur ?blatt=<id>
     startet es noch direkt (siehe laden()). */
  function suchKarteZeigen(){
    $("such-wahl").classList.add("verborgen");
  }
  window.QUIZ_NACH_BLAETTERN = function(){ suchKarteZeigen(); };
  function merken(blattId, liste){
    /* Quizfragen aus der Tagesrunde (28.09.2026) gehen als Quiz-Antwort an
       ihren Lernpunkt, Fundkarten wie bisher als "fund". */
    var fund = liste.filter(function(e){ return !e.quiz; });
    var quiz = liste.filter(function(e){ return e.quiz; });
    function schicken(daten){
      fetch("/api/quiz", { method: "POST", credentials: "same-origin",
        headers: { "content-type": "application/json" }, body: JSON.stringify(daten)
      }).catch(function(){ /* ohne Speicher merkt sich nur die Wiedervorlage diese Runde nicht */ });
    }
    /* Kreise fuellen: beim ersten Tipp richtig = Kreis gefuellt. */
    var kreise = [];
    liste.forEach(function(e){ if (e.kreis && e.stimmt) kreise = kreise.concat(e.kreis); });
    /* Schritt 4 (29.10.2026, nur Paul): EIN POST statt drei gleichzeitiger. fund und
       antworten schrieben sonst beide quiz-punkte:paul in derselben Sekunde. Der
       Server verbucht beides mit einem Lesen und einem Schreiben. */
    if (KIND === "paul") {
      var alles = { kind: KIND };
      if (kreise.length) alles.kreise = kreise;
      if (fund.length) alles.fund = fund.map(function(e){
        return { blatt: e.blatt || blattId, karte: e.karte, stimmt: e.stimmt }; });
      if (quiz.length) alles.antworten = quiz.map(function(e){
        return { frageId: e.quiz.frageId, blatt: e.blatt, belegNr: e.quiz.belegNr, stimmt: e.stimmt }; });
      if (alles.kreise || alles.fund || alles.antworten) schicken(alles);
      return;
    }
    if (kreise.length) schicken({ kind: KIND, kreise: kreise });
    if (fund.length) schicken({ kind: KIND, fund: fund.map(function(e){
      return { blatt: e.blatt || blattId, karte: e.karte, stimmt: e.stimmt }; }) });
    if (quiz.length) schicken({ kind: KIND, antworten: quiz.map(function(e){
      return { frageId: e.quiz.frageId, blatt: e.blatt, belegNr: e.quiz.belegNr, stimmt: e.stimmt }; }) });
  }
  function gruenVon(x){
    var aus = [];
    (x && Array.isArray(x.korrekturen) ? x.korrekturen : []).forEach(function(k){
      (k && Array.isArray(k.ort) ? k.ort : []).forEach(function(o){
        if (o && !(o.s > 0)) aus.push({ s: 0, x: o.x, y: o.y, b: o.b, h: o.h, art: "gut",
          text: k.quelle === "lehrerin" ? "" : String(k.korrigiert || "").slice(0, 60) });
      });
    });
    return aus;
  }
  /* Heute lernen und Kreise fuellen ueber mehrere Blaetter (14.10.2026):
     das Gruen je Blatt, wie beim Such-Spiel eines Blattes. */
  var alleBlaetter = [];
  function gruenJeBlatt(){
    var je = {};
    alleBlaetter.forEach(function(x){ var g = gruenVon(x); if (x && x.id && g.length) je[x.id] = g; });
    return je;
  }
  function starten(x){
    var ok = window.LWFund && LWFund.zeigen($("fundkarten"), {
      karten: x.karten, kind: KIND, was: x.titel, blattId: x.id,
      /* Verbessert durch Claude (14.10.2026): grün über dem Ausschnitt. */
      gruen: gruenVon(x),
      zuerst: faellig[x.id] || null,
      ergebnis: function(liste){ merken(x.id, liste); },
      fertigText: "Zurück zur Auswahl", fertig: function(){ zurueck(); laden(); }
    });
    if (!ok) return;
    $("sicht-start").classList.add("verborgen");
    $("sicht-such").classList.remove("verborgen");
    window.scrollTo(0, 0);
  }
  function laden(){
    fetch("/api/quiz?kind=" + encodeURIComponent(KIND) + "&nurWartend=1", { credentials: "same-origin" })
      .then(function(r){ return r.json(); })
      .then(function(j){ faellig = (j && j.fundFaellig) || {}; faelligText = (j && j.fundText) || {};
                         fundStand = (j && j.fundStand) || {}; quizWackler = (j && j.quizWackler) || [];
                         fundFormen = (j && j.fundFormen) || {}; schritt4 = (j && j.schritt4) || null; })
      .catch(function(){ faellig = {}; faelligText = {}; fundStand = {}; quizWackler = []; schritt4 = null; })
      .then(function(){ return fetch("/api/schulstoff?kind=" + encodeURIComponent(KIND) + "&monate=6", { credentials: "same-origin" }); })
      .then(function(r){ return r.json(); })
      .then(function(j){
        /* Gescheitertes Durchlesen nachholen (29.09.2026, siehe /nachlesen.js).
           Klappt es, wird neu geladen - dann hat das Blatt Titel und Suchkarten. */
        if (window.LWNachlesen) LWNachlesen(KIND, j && j.eintraege, function(){ laden(); });
        alleBlaetter = ((j && j.eintraege) || []).filter(function(x){ return x && x.id; });
        var liste = ((j && j.eintraege) || []).filter(function(x){
          return x && x.sichtbar !== false && Array.isArray(x.karten) && x.karten.length >= 3;
        }).sort(function(a, b){ return String(b.datum).localeCompare(String(a.datum)); });
        suchListe = liste; suchMap = {};
        liste.forEach(function(x){ suchMap[x.id] = x; });
        if (window.QUIZ_BLAETTER_NEU) window.QUIZ_BLAETTER_NEU();
        var box = $("such-liste"); box.innerHTML = "";
        liste.forEach(function(x){
          var b = document.createElement("button");
          b.type = "button"; b.className = "qblatt such-blatt";
          var w = document.createElement("span"); w.className = "was";
          var t = document.createElement("b"); t.textContent = x.titel || "Dein Blatt";
          var u = document.createElement("span");
          /* Wie im Motor: als Text im Untertitel, kein eigenes Element. */
          u.textContent = [FACH[x.fach] || "", datum(x.datum), x.karten.length + " Karten",
                           faelligText[x.id] || ""].filter(Boolean).join(" · ");
          w.appendChild(t); w.appendChild(u); b.appendChild(w);
          b.addEventListener("click", function(){ starten(x); });
          box.appendChild(b);
        });
        /* Aus "Mein Heft" (Bericht auf der Startseite, 25.09.2026): ?blatt=<id>
           startet das Such-Spiel zu genau diesem Blatt. Nur einmal. */
        if (blattWahl) {
          var ziel = liste.filter(function(x){ return x.id === blattWahl; })[0];
          blattWahl = "";
          if (ziel) { $("such-wahl").classList.remove("verborgen"); heuteAnbieten((j && j.eintraege) || [], true); starten(ziel); return; }
        }
        suchKarteZeigen();
        heuteAnbieten((j && j.eintraege) || []);
        if (kreiseWahl) { var kw = kreiseWahl; kreiseWahl = ""; kreiseStarten((j && j.eintraege) || [], kw); }
      })
      .catch(function(){ /* ohne Liste kein Such-Spiel - das Quiz laeuft weiter */ });
  }
  /* Heute lernen. Der Satz sagt ehrlich, was drin ist - ohne Rueckstand-Zahl:
     "3 kommen wieder dran, 2 sind neu", nie "5 offen". */
  var autostart = /[?&]heute=1\b/.test(location.search);
  /* Tagesrunde fuer EIN Fach (19.10.2026, Denny: Paul hatte alle HSU-Blaetter mit ueber 100 Fragen
     durchgemacht, "das ist ihm zu viel"). ?heute=1&fach=hsu: etwa 10 Fragen zum Ankreuzen - seine
     Fehler und Wackelkandidaten (auch noch nicht faellige), Neues von frischen Blaettern, dazu 3-4
     Fragen, die schon sitzen, wie eine Karteikarte. Was sicher sitzt, kommt nur selten (sicher
     sortiert nach wenig Treffern zuerst, tagesrunde.js). Danach freiwillig "Noch 10 Fragen".
     Keine Serie, kein Zwang. Nur Paul ruft das auf (Startseite, Deutsch-Probenstoff). Kapitel 131. */
  var FACH_RUNDE = { hoechstens: 10, unsicherHoechstens: 7, vorrangHoechstens: 7, ruhtUnsicher: true };   // 7 Unsichere + 3 Bekannte
  var rundeFach = autostart ? ((/[?&]fach=([a-z-]{2,20})/.exec(location.search) || [])[1] || "") : "";
  var schonDran = {}, mehrGleich = false, matheGespielt = false, lesenGespielt = false;
  function fachWort(f){ return FACH[f] || (f ? f.charAt(0).toUpperCase() + f.slice(1) : ""); }
  var blattWahl = (/[?&]blatt=([^&#]+)/.exec(location.search) || [])[1];
  blattWahl = blattWahl ? decodeURIComponent(blattWahl) : "";
  function heuteAnbieten(eintraege, ohneStart){
    var o = null;
    if (rundeFach) { o = { fach: rundeFach, ohne: schonDran }; for (var x in FACH_RUNDE) o[x] = FACH_RUNDE[x]; }
    /* Mathe-Wiederholung (26.10.2026, Kapitel 142): NUR Paul, nur in der allgemeinen Runde. Hoechstens
       2 Aufgaben, fruehestens alle 3 Tage - das entscheidet LWMathe aus fundStand. matheGespielt haelt
       eine zweite Runde auf derselben Seite frei, auch wenn der Server die erste noch nicht gemerkt hat. */
    if (KIND === "paul" && !rundeFach && !matheGespielt && window.LWMathe && window.LWMatheDaten) {
      try {
        var mw = LWMathe.waehlen(window.LWMatheDaten, fundStand);
        if (mw.karten.length) { o = o || {}; o.mathe = mw.karten; }
      } catch (e) { /* ohne Mathe laeuft die Runde wie vorher */ }
    }
    /* Lese-Wiederholung (28.10.2026, Kapitel 149): genauso, nur ein Kind, nur in der allgemeinen Runde,
       hoechstens 1 Karte, fruehestens alle 3 Tage (LWLesen aus fundStand), lesenGespielt wie oben. */
    if (KIND === "paul" && !rundeFach && !lesenGespielt && window.LWLesen && window.LWLeseDaten) {
      try {
        var lw = LWLesen.waehlen(window.LWLeseDaten, fundStand);
        if (lw.karten.length) { o = o || {}; o.lesen = lw.karten; }
      } catch (e) { /* ohne Lesen laeuft die Runde wie vorher */ }
    }
    /* Blattdatum mit Herkunft (28.10.2026, Schritt 2): bei Paul zaehlt "neu" nach dem Datum des Blattes. */
    if (KIND === "paul") { o = o || {}; o.nachBlattdatum = true; o.formen = fundFormen; if (schritt4) o.schritt4 = schritt4; }
    heute = window.LWTag ? LWTag.waehlen(eintraege, fundStand, o, quizWackler) : null;
    var da = !!(heute && heute.karten.length);
    if (rundeFach && mehrGleich) { mehrGleich = false; if (da) { heuteStarten(); return; } allesDurch(); return; }
    $("heute-wahl").classList.toggle("verborgen", !da);
    if (rundeFach) {
      var h2 = $("heute-wahl").querySelector("h2");
      if (h2) h2.textContent = da ? "☀️ " + fachWort(rundeFach) + " für heute" : "☀️ Heute lernen";
    }
    if (!da) return;
    var z = heute.zaehl, teile = [];
    var wieder = z.wieder + z.wackler + z.sicher + z.ruht;
    if (wieder) teile.push(wieder === 1 ? "1 Karte kommt wieder dran" : wieder + " Karten kommen wieder dran");
    if (z.neu) teile.push(z.neu === 1 ? "1 ist neu" : z.neu + " sind neu");
    if (z.mathe) teile.push(z.mathe === 1 ? "1 Mathe-Aufgabe" : z.mathe + " Mathe-Aufgaben");
    if (z.lesen) teile.push(z.lesen === 1 ? "1 Lese-Aufgabe" : z.lesen + " Lese-Aufgaben");
    $("heute-unter").textContent = rundeFach
      ? heute.karten.length + " Fragen aus deinen " + fachWort(rundeFach) + "-Blättern: " + teile.join(", ") + ". Dauert etwa 5 Minuten."
      : heute.karten.length + " Karten aus deinen Blättern: " + teile.join(", ") + ". Dauert ein paar Minuten.";
    /* Von der Startseite (?heute=1) geht es NICHT mehr sofort los: Paul
       sieht erst, was kommt, und entscheidet selbst (25.09.2026). */
    if (autostart && !ohneStart) $("heute-selbst").classList.remove("verborgen");
  }
  /* Kreise fuellen (Variante B, Denny 29.09.2026): aus "Deine Woche" kommt
     ?kreise=woche oder ?kreise=<datum>. Die offenen Lernpunkte liefert
     /api/statistik?eigene=1, die Quizfragen dazu /api/quiz?kreise=... */
  var kreiseWahl = (/[?&]kreise=([^&#]+)/.exec(location.search) || [])[1];
  kreiseWahl = kreiseWahl ? decodeURIComponent(kreiseWahl) : "";
  function kreiseStarten(eintraege, wahl){
    if (!window.LWFund) return;
    fetch("/api/quiz?kind=" + encodeURIComponent(KIND) + "&nurWartend=1&kreiseTag=" + encodeURIComponent(wahl),
          { credentials: "same-origin" })
      .then(function(r){ return r.json(); })
      .then(function(j){ kreiseZeigen(kreiseStapel((j && j.kreiseKarten) || [], eintraege), wahl); })
      .catch(function(){ kreiseZeigen({ karten: [], offen: 0, rest: 0 }, wahl); });
  }
  /* Hoechstens 10 Fragen je Runde, nach je zwei eine, die schon sitzt. */
  function kreiseStapel(liste, eintraege){
    var sicher = [];
    (eintraege || []).forEach(function(b){
      if (!b || b.sichtbar === false) return;
      (b.karten || []).forEach(function(k){
        if (!k || !k.richtig || !k.falsch || k.falsch.length !== 2) return;
        var st = fundStand[b.id + "#k:" + kartenSchluessel(k)];
        if (st && !st.f) { var c = {}; for (var z in k) c[z] = k[z]; c.blatt = b.id; c.blattTitel = b.titel || ""; sicher.push(c); }
      });
    });
    var dran = liste.slice(0, 10), karten = [], si = 0;
    dran.forEach(function(c, i){
      karten.push(c);
      if ((i + 1) % 2 === 0 && i + 1 < dran.length && si < sicher.length) karten.push(sicher[si++]);
    });
    var kreise = 0, rest = 0;
    dran.forEach(function(c){ kreise += (c.kreis || []).length; });
    liste.slice(10).forEach(function(c){ rest += (c.kreis || []).length; });
    return { karten: karten, offen: kreise, rest: rest };
  }
  function kreiseZeigen(st, wahl){
    if (!st.karten.length) {
      /* Nie ein stilles "irgendwas": Paul kam mit einer Absicht hierher. */
      $("fundkarten").innerHTML = "";
      var p = document.createElement("div"); p.className = "lwf-karte rein";
      var h = document.createElement("h2"); h.textContent = "Hier ist schon alles gefüllt.";
      var b = document.createElement("button"); b.type = "button"; b.className = "lwf-knopf"; b.textContent = "Zurück zur Auswahl";
      b.addEventListener("click", function(){ zurueck(); laden(); });
      p.appendChild(h); p.appendChild(b); $("fundkarten").appendChild(p);
      $("heute-wahl").classList.add("verborgen");
      $("sicht-start").classList.add("verborgen");
      $("sicht-such").classList.remove("verborgen");
      return;
    }
    var wann = wahl === "woche" ? "diese Woche" : ("am " + datum(wahl));
    /* Worte je Kind (29.09.2026): Helena liest "Wiederholen" und "Fragen". */
    var W = (window.QUIZ && window.QUIZ.kreiseWorte) || {};
    var ein = W.einKreis || "Kreis", viele = W.kreise || "Kreise";
    var ok = LWFund.zeigen($("fundkarten"), {
      karten: st.karten, kind: KIND, mindestens: 1,
      kicker: W.titel || "Kreise füllen", mitBlattTitel: true, gruenJe: gruenJeBlatt(),
      ueberschrift: (st.offen === 1 ? "1 " + ein : st.offen + " " + viele) + " " + (W.zum || "zum Füllen"),
      unter: "Die hattest du " + wann + " erst nachgeschaut. Dazwischen kommen ein paar, die du schon kannst.",
      fertigSatz: st.rest ? "Geschafft! " + st.rest + " " + viele + " warten noch – die kommen beim nächsten Mal." : "Geschafft! Schau in „Deine Woche“, was jetzt gelb ist.",
      ergebnis: function(liste){ merken("", liste); },
      fertigText: "Zurück zur Auswahl", fertig: function(){ zurueck(); laden(); }
    });
    if (!ok) return;
    $("heute-wahl").classList.add("verborgen");
    $("sicht-start").classList.add("verborgen");
    $("sicht-such").classList.remove("verborgen");
    window.scrollTo(0, 0);
  }
  // Fach-Runde: Was in dieser Sitzung dran war, kommt bei "Noch 10 Fragen" nicht gleich wieder.
  function merkeDran(karten){
    (karten || []).forEach(function(k){
      if (k.quiz && k.quiz.frageId != null) schonDran["q:" + k.quiz.frageId] = 1;
      else if (k.blatt) schonDran[k.blatt + "#k:" + kartenSchluessel(k)] = 1;
    });
  }
  function allesDurch(){
    $("fundkarten").innerHTML = "";
    var p = document.createElement("div"); p.className = "lwf-karte rein";
    var h = document.createElement("h2"); h.textContent = "Für heute sind alle " + fachWort(rundeFach) + "-Fragen dran gewesen.";
    var b = document.createElement("button"); b.type = "button"; b.className = "lwf-knopf"; b.textContent = "Zurück zur Auswahl";
    b.addEventListener("click", function(){ zurueck(); laden(); });
    p.appendChild(h); p.appendChild(b); $("fundkarten").appendChild(p);
    $("heute-wahl").classList.add("verborgen");
    $("sicht-start").classList.add("verborgen");
    $("sicht-such").classList.remove("verborgen");
  }
  function heuteStarten(){
    if (!heute || !heute.karten.length || !window.LWFund) return;
    var f = rundeFach;
    if (f) merkeDran(heute.karten);
    if (f && window.LWFachzeit) LWFachzeit.fach(f);     // Minuten fuer die Karte auf der Startseite
    var ok = LWFund.zeigen($("fundkarten"), {
      karten: heute.karten, kind: KIND, mindestens: 1,
      kicker: f ? fachWort(f) + " für heute" : "Heute lernen", mitBlattTitel: heute.blaetter > 1, gruenJe: gruenJeBlatt(),
      ueberschrift: heute.karten.length + (f ? " Fragen für heute" : " Karten für heute"),
      unter: "Aus deinen Blättern. Schau auf den Ausschnitt und tipp an, was dort steht.",
      fertigSatz: f ? "Deine " + fachWort(f) + "-Runde für heute ist geschafft. Mehr geht immer – musst du aber nicht." : "Deine Runde für heute ist geschafft.",
      ergebnis: function(liste){
        if (liste.some(function(e){ return e.blatt === "mathe"; })) matheGespielt = true;
        if (liste.some(function(e){ return e.blatt === "lesen"; })) lesenGespielt = true;
        merken("", liste);
      },
      mehrText: f ? "Noch 10 Fragen" : "", mehr: f ? function(){ mehrGleich = true; laden(); } : null,
      fertigText: "Zurück zur Auswahl", fertig: function(){ zurueck(); laden(); }
    });
    if (!ok) return;
    $("sicht-start").classList.add("verborgen");
    $("sicht-such").classList.remove("verborgen");
    window.scrollTo(0, 0);
  }
  document.addEventListener("DOMContentLoaded", function(){
    $("heute-los").addEventListener("click", heuteStarten);
    $("heute-selbst").addEventListener("click", function(){
      autostart = false;
      $("heute-wahl").classList.add("verborgen");
      window.scrollTo(0, 0);
    });
    $("such-zurueck").addEventListener("click", function(){ zurueck(); laden(); });
    laden();
  });
})();
