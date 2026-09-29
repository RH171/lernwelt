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
    $("fundkarten").innerHTML = "";
    $("sicht-such").classList.add("verborgen");
    $("sicht-start").classList.remove("verborgen");
    window.scrollTo(0, 0);
  }
  /* Wiedervorlage (Denny, 25.09.2026): Was faellig ist, steht vorn; nach
     jeder Runde geht EIN Schreibvorgang an /api/quiz (fund). */
  var faellig = {}, faelligText = {}, fundStand = {}, quizWackler = [], heute = null;
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
    if (fund.length) schicken({ kind: KIND, fund: fund.map(function(e){
      return { blatt: e.blatt || blattId, karte: e.karte, stimmt: e.stimmt }; }) });
    if (quiz.length) schicken({ kind: KIND, antworten: quiz.map(function(e){
      return { frageId: e.quiz.frageId, blatt: e.blatt, belegNr: e.quiz.belegNr, stimmt: e.stimmt }; }) });
  }
  function starten(x){
    var ok = window.LWFund && LWFund.zeigen($("fundkarten"), {
      karten: x.karten, kind: KIND, was: x.titel, blattId: x.id,
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
                         fundStand = (j && j.fundStand) || {}; quizWackler = (j && j.quizWackler) || []; })
      .catch(function(){ faellig = {}; faelligText = {}; fundStand = {}; quizWackler = []; })
      .then(function(){ return fetch("/api/schulstoff?kind=" + encodeURIComponent(KIND) + "&monate=6", { credentials: "same-origin" }); })
      .then(function(r){ return r.json(); })
      .then(function(j){
        /* Gescheitertes Durchlesen nachholen (29.09.2026, siehe /nachlesen.js).
           Klappt es, wird neu geladen - dann hat das Blatt Titel und Suchkarten. */
        if (window.LWNachlesen) LWNachlesen(KIND, j && j.eintraege, function(){ laden(); });
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
  var blattWahl = (/[?&]blatt=([^&#]+)/.exec(location.search) || [])[1];
  blattWahl = blattWahl ? decodeURIComponent(blattWahl) : "";
  function heuteAnbieten(eintraege, ohneStart){
    heute = window.LWTag ? LWTag.waehlen(eintraege, fundStand, null, quizWackler) : null;
    var da = !!(heute && heute.karten.length);
    $("heute-wahl").classList.toggle("verborgen", !da);
    if (!da) return;
    var z = heute.zaehl, teile = [];
    var wieder = z.wieder + z.wackler + z.sicher + z.ruht;
    if (wieder) teile.push(wieder === 1 ? "1 Karte kommt wieder dran" : wieder + " Karten kommen wieder dran");
    if (z.neu) teile.push(z.neu === 1 ? "1 ist neu" : z.neu + " sind neu");
    $("heute-unter").textContent = heute.karten.length + " Karten aus deinen Blättern: " +
      teile.join(", ") + ". Dauert ein paar Minuten.";
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
    if (!window.LWTag || !LWTag.kreise || !window.LWFund) return;
    fetch("/api/statistik?eigene=1&kind=" + encodeURIComponent(KIND), { credentials: "same-origin" })
      .then(function(r){ return r.json(); })
      .then(function(w){
        var keys = [];
        ((w && w.tage) || []).forEach(function(t){
          if (wahl === "woche" || t.datum === wahl) keys = keys.concat(t.offen || []);
        });
        var quizKeys = keys.filter(function(s){ return /#\d+$/.test(s); });
        var weiter = quizKeys.length
          ? fetch("/api/quiz?kind=" + encodeURIComponent(KIND) + "&nurWartend=1&kreise=" +
                  encodeURIComponent(quizKeys.join(",")), { credentials: "same-origin" })
              .then(function(r){ return r.json(); }).then(function(j){ return (j && j.kreiseQuiz) || []; })
              .catch(function(){ return []; })
          : Promise.resolve([]);
        return weiter.then(function(quiz){ kreiseZeigen(LWTag.kreise(eintraege, keys, quiz, fundStand), wahl); });
      })
      .catch(function(){ /* ohne Tagebuch bleibt die normale Auswahl stehen */ });
  }
  function kreiseZeigen(st, wahl){
    if (!st.karten.length) return;
    var wann = wahl === "woche" ? "diese Woche" : ("am " + datum(wahl));
    /* Worte je Kind (29.09.2026): Helena liest "Wiederholen" und "Fragen". */
    var W = (window.QUIZ && window.QUIZ.kreiseWorte) || {};
    var ein = W.einKreis || "Kreis", viele = W.kreise || "Kreise";
    var ok = LWFund.zeigen($("fundkarten"), {
      karten: st.karten, kind: KIND, mindestens: 1,
      kicker: W.titel || "Kreise füllen", mitBlattTitel: true,
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
  function heuteStarten(){
    if (!heute || !heute.karten.length || !window.LWFund) return;
    var ok = LWFund.zeigen($("fundkarten"), {
      karten: heute.karten, kind: KIND, mindestens: 1,
      kicker: "Heute lernen", mitBlattTitel: heute.blaetter > 1,
      ueberschrift: heute.karten.length + " Karten für heute",
      unter: "Aus deinen Blättern. Schau auf den Ausschnitt und tipp an, was dort steht.",
      fertigSatz: "Deine Runde für heute ist geschafft.",
      ergebnis: function(liste){ merken("", liste); },
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
