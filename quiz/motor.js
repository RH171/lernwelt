/* Das tägliche Lernquiz - ein Motor, drei Kinder.
 *
 * Denny am 20.09.2026: "sodass die Kinder jeden Tag 5 bis 10 Minuten lernen
 * oder früh morgens noch mal schnell mit einer Quizrunde sinnig werden ...
 * alle oder nur gezielte Fächer ... 15 oder mehr Fragen oder endlos ... aber
 * so, dass ein hoher Lernerfolg ist."
 *
 * Wie bei der Schmiede steht der Motor EINMAL hier; die drei Seiten
 * (<kind>/quiz.html) setzen nur window.QUIZ mit Kind, Fächern und Texten.
 * Wer hier etwas ändert, ändert es für alle drei und misst alle drei.
 *
 * Was es NICHT gibt, mit Absicht:
 * - Keine Uhr, die gegen das Kind läuft. Nachdenken ist der Sinn der Sache.
 * - Kein "Game over". Falsch beantwortet heißt: kommt wieder, anders gestellt.
 * - Keine Punkte fürs Tempo (siehe Quiz-Duell, 19.09.2026: "Es sollte doch
 *   nicht mehr der gewinnen, der am schnellsten ist").
 */
(function () {
  "use strict";
  var K = window.QUIZ || {};
  var KIND = K.kind;
  var $ = function (id) { return document.getElementById(id); };

  function lese(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function schreibe(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  var SPEICHER = KIND + "-quiz";
  var stand = lese(SPEICHER, { faecher: [], laenge: 15, gespielt: 0, richtig: 0, tage: [] });
  if (!Array.isArray(stand.faecher)) stand.faecher = [];

  var fragen = [], nr = 0, richtigGesamt = 0, antwortenLog = [], laufend = false;

  /* ---------- Start ---------- */

  /* Welche Faecher angeboten werden, entscheidet das SCHULHEFT - nicht eine
   * feste Liste in der Seite.
   *
   * Denny am 23.09.2026: "Prinzipiell sollte dort nur das Fach auftauchen,
   * was er auch [in] der Zeit, in der er was hochgeladen hat" - und
   * ausdruecklich: "ich würde dann auch beim Lernquiz Musik noch nicht
   * anzeigen, sondern nur, wenn du im Heft-Eintrag auch was hast."
   *
   * Ein weggelegtes Blatt zaehlt nicht mit, und das vorige Schuljahr auch
   * nicht - das rechnet der Server (faecherImHeft).
   *
   * Kommt der Server nicht ans Heft, bleibt die Liste aus der Seite stehen.
   * Ein Kind ohne Quiz waere schlechter als eines mit einem Fach zu viel. */
  var ausHeft = null;    // [{fach, blaetter}] oder null = noch nicht geladen

  function faecherHolen() {
    return fetch("/api/schulstoff?kind=" + encodeURIComponent(K.kind) + "&faecher=1",
                 { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) return;
        ausHeft = j.faecher || [];
        // Nur die Faecher, die auch in der Seite beschrieben sind (Name, Zeichen).
        var bekannt = {};
        K.faecher.forEach(function (f) { bekannt[f.k] = f; });
        var neu = [];
        ausHeft.forEach(function (x) {
          if (bekannt[x.fach]) neu.push(Object.assign({}, bekannt[x.fach], { blaetter: x.blaetter }));
        });
        if (neu.length) K.faecher = neu;
        // Was nicht mehr angeboten wird, darf auch nicht mehr gewaehlt sein.
        stand.faecher = stand.faecher.filter(function (k) {
          return K.faecher.some(function (f) { return f.k === k; });
        });
        schreibe(SPEICHER, stand);
      })
      .catch(function () {})
      .then(function () { fachkachelnMalen(); blaetterMalen(); });
  }

  function fachkachelnMalen() {
    var box = $("q-faecher");
    box.innerHTML = "";
    K.faecher.forEach(function (f) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qfach" + (stand.faecher.indexOf(f.k) >= 0 ? " an" : "");
      b.innerHTML = '<span class="ic">' + f.ic + "</span><span>" + esc(f.n) +
        (f.blaetter ? ' <small style="opacity:.65">' + f.blaetter + "</small>" : "") + "</span>";
      b.addEventListener("click", function () {
        var i = stand.faecher.indexOf(f.k);
        if (i >= 0) stand.faecher.splice(i, 1); else stand.faecher.push(f.k);
        schreibe(SPEICHER, stand);
        fachkachelnMalen();
        blaetterMalen();
      });
      box.appendChild(b);
    });
    $("q-alle").classList.toggle("an", stand.faecher.length === 0);
    // Ohne Auswahl heißt "alle" - so muss niemand erst etwas anklicken.
    $("q-start").textContent = stand.faecher.length
      ? "Los geht's · " + stand.faecher.length + " Fach" + (stand.faecher.length === 1 ? "" : "er")
      : "Los geht's · alle Fächer";
  }

  /* Welche Blaetter abgefragt werden.
   *
   * Denny am 23.09.2026: "Ich würde es auch begrüßen, wenn Paul in dem Fall
   * HSU auswählt und das Blatt selbstständig ausbringen kann, welches er für
   * dieses Quiz haben kann. Das gibt ihm schon ein Stück weit
   * Entscheidungsgewalt."
   *
   * Sichtbar wird die Liste erst, wenn GENAU EIN Fach gewaehlt ist - bei
   * mehreren waere es eine Wand aus Kacheln. Ohne Auswahl gilt: alle
   * Blaetter des Fachs; niemand muss erst etwas anhaken. */
  var blaetter = [], blattFach = "";
  if (!Array.isArray(stand.blaetter)) stand.blaetter = [];

  function blaetterMalen() {
    var kasten = $("q-blaetter");
    if (!kasten) return;
    var eins = stand.faecher.length === 1 ? stand.faecher[0] : "";
    if (!eins) { kasten.classList.add("verborgen"); return; }

    if (blattFach !== eins) {
      blattFach = eins; blaetter = []; stand.blaetter = [];
      $("q-blaetter-liste").innerHTML = "";
      $("q-blaetter-kopf").textContent = "Ich schaue nach, was du dazu im Heft hast …";
      kasten.classList.remove("verborgen");
      fetch("/api/schulstoff?kind=" + encodeURIComponent(K.kind) +
            "&fach=" + encodeURIComponent(eins), { credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j || !j.ok) { kasten.classList.add("verborgen"); return; }
          blaetter = j.blaetter || [];
          blaetterZeichnen();
        })
        .catch(function () { kasten.classList.add("verborgen"); });
      return;
    }
    blaetterZeichnen();
  }

  function blaetterZeichnen() {
    var kasten = $("q-blaetter");
    if (!blaetter.length) { kasten.classList.add("verborgen"); return; }
    kasten.classList.remove("verborgen");
    $("q-blaetter-kopf").textContent = stand.blaetter.length
      ? "Daraus frage ich dich ab (" + stand.blaetter.length + " von " + blaetter.length + ")"
      : "Woraus soll ich fragen? Ohne Auswahl nehme ich alle " + blaetter.length + ".";

    var liste = $("q-blaetter-liste");
    liste.innerHTML = "";
    blaetter.forEach(function (b) {
      var an = stand.blaetter.indexOf(b.id) >= 0;
      var k = document.createElement("button");
      k.type = "button";
      k.className = "qblatt" + (an ? " an" : "");
      k.innerHTML = '<span class="haken">' + (an ? "✓" : "") + "</span>" +
        '<span class="was"><b></b><span></span></span>';
      k.querySelector("b").textContent = b.titel || "Ohne Titel";
      k.querySelector(".was span").textContent =
        deutschKurz(b.datum) + (b.seiten > 1 ? " · " + b.seiten + " Seiten" : "");
      k.addEventListener("click", function () {
        var i = stand.blaetter.indexOf(b.id);
        if (i >= 0) stand.blaetter.splice(i, 1); else stand.blaetter.push(b.id);
        schreibe(SPEICHER, stand);
        blaetterZeichnen();
      });
      liste.appendChild(k);
    });
  }

  function deutschKurz(iso) {
    var t = String(iso || "").split("-");
    return t.length === 3 ? (+t[2]) + "." + (+t[1]) + "." : String(iso || "");
  }

  function laengeMalen() {
    var box = $("q-laenge");
    box.innerHTML = "";
    [[10, "10 Fragen"], [15, "15 Fragen"], [25, "25 Fragen"], [0, "Endlos"]].forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qchip" + (stand.laenge === p[0] ? " an" : "");
      b.textContent = p[1];
      b.addEventListener("click", function () { stand.laenge = p[0]; schreibe(SPEICHER, stand); laengeMalen(); });
      box.appendChild(b);
    });
  }

  function zeige(welche) {
    ["start", "spiel", "ende"].forEach(function (x) {
      $("sicht-" + x).classList.toggle("verborgen", x !== welche);
    });
    window.scrollTo(0, 0);
  }

  /* ---------- Fragen holen ---------- */

  function holen() {
    var p = new URLSearchParams();
    p.set("kind", KIND);
    if (stand.faecher.length) p.set("faecher", stand.faecher.join(","));
    /* Hat Paul einzelne Blaetter angehakt, wird NUR daraus gefragt. Denny am
       23.09.2026: "Ganz klar, nur aus seinen Blättern. Wenn du jetzt Paul
       plötzlich was zu Nürnberg fragst, obwohl er ein HSU heute Fürth hatte,
       versteht er ja die Welt nicht und kennt die Antworten nicht."
       Ohne Auswahl gilt weiter das ganze Fach. */
    if (stand.blaetter && stand.blaetter.length && stand.faecher.length === 1) {
      p.set("blaetter", stand.blaetter.join(","));
    }
    p.set("anzahl", String(stand.laenge || 0));
    return fetch("/api/quiz?" + p.toString(), { credentials: "same-origin" })
      .then(function (r) { return r.json(); });
  }

  $("q-start").addEventListener("click", function () {
    if (laufend) return;
    laufend = true;
    $("q-start").disabled = true;
    $("q-laedt").classList.remove("verborgen");
    $("q-fehler").textContent = "";
    holen().then(function (j) {
      laufend = false;
      $("q-start").disabled = false;
      $("q-laedt").classList.add("verborgen");
      if (!j || !j.ok || !j.fragen || !j.fragen.length) {
        $("q-fehler").textContent = (j && j.fehler) || "Ich konnte gerade keine Fragen holen. Versuch es gleich noch einmal.";
        return;
      }
      fragen = j.fragen; nr = 0; richtigGesamt = 0; antwortenLog = [];
      zeige("spiel");
      frageMalen();
    }).catch(function () {
      laufend = false;
      $("q-start").disabled = false;
      $("q-laedt").classList.add("verborgen");
      $("q-fehler").textContent = "Keine Verbindung. Bist du online?";
    });
  });

  /* ---------- Eine Frage ---------- */

  var wahlOffen = true, reihenfolge = [];
  /* Hilfe in Stufen (23.09.2026, Denny: "Leicht helfen hier Bilder, kleine
     Eselsbrücken, wie man sich das besser merken kann").
       Versuch 1 -> nichts
       Versuch 2 -> Tipp, zwei falsche Antworten fallen weg
       Versuch 3 -> das eigene Blatt mit der Zeile, in der es steht
     GEZAEHLT WIRD NUR DER ERSTE VERSUCH - sonst waere die Elternauswertung
     geschoenkt. Dieselbe Regel wie beim Hinweis in Helenas Holiday Report. */
  var versuch = 0, ersterFalsch = "";

  function frageMalen() {
    var f = fragen[nr];
    if (!f) return endeMalen();
    wahlOffen = true;
    $("q-nr").textContent = "Frage " + (nr + 1) + (stand.laenge ? " von " + Math.min(stand.laenge, fragen.length) : "");
    $("q-fach").textContent = fachName(f.fach);
    $("q-frage").textContent = f.frage;
    $("q-erklaerung").classList.add("verborgen");
    $("q-weiter").classList.add("verborgen");
    versuch = 0; ersterFalsch = "";
    hilfeVerbergen();

    // Die richtige Antwort steht an Stelle 0 - hier wird gemischt, damit sie
    // nicht immer oben steht.
    reihenfolge = f.antworten.map(function (_, i) { return i; });
    for (var i = reihenfolge.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var h = reihenfolge[i]; reihenfolge[i] = reihenfolge[j]; reihenfolge[j] = h;
    }

    var box = $("q-antworten");
    box.innerHTML = "";
    reihenfolge.forEach(function (originalIndex, platz) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qantwort";
      b.textContent = f.antworten[originalIndex];
      b.addEventListener("click", function () { waehlen(platz, originalIndex, b); });
      box.appendChild(b);
    });
    fortschrittMalen();
  }

  /* ---------- Hilfe in Stufen ---------- */

  /* Das eigene Blatt wird erst geholt, wenn es gebraucht wird - ein Foto sind
     schnell 300 KB, und die meisten Fragen sitzen beim ersten Versuch.
     Gemerkt wird es je Blatt-id, damit dasselbe Foto nicht zehnmal kommt. */
  var blattBild = null, blattVonId = "", blattLaeuft = false;

  function blattHolen(id) {
    if (!id || blattVonId === id || blattLaeuft) return;
    blattLaeuft = true;
    fetch("/api/schulstoff?kind=" + encodeURIComponent(K.kind) +
          "&bild=" + encodeURIComponent(id) + ":0", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok && j.bild) { blattBild = j.bild; blattVonId = id; }
      })
      .catch(function () {})
      .then(function () { blattLaeuft = false; });
  }

  function hilfeVerbergen() {
    var h = $("q-hilfe");
    if (h) { h.innerHTML = ""; h.classList.add("verborgen"); }
  }

  function stufeZeigen(f, stufe) {
    var h = $("q-hilfe");
    if (!h) return;
    if (stufe === 1) {
      h.innerHTML = '<div class="qtipp"><b>Denk nach:</b> ' +
        esc(f.tipp || "Lies die Frage noch einmal in Ruhe.") + "</div>";
      h.classList.remove("verborgen");
      /* Zwei falsche Antworten treten zurueck - sie bleiben sichtbar und
         anklickbar. Wegnehmen waere eine Strafe; blass werden ist eine Hilfe. */
      var blass = 0;
      Array.prototype.forEach.call($("q-antworten").children, function (b, i) {
        if (reihenfolge[i] !== (f.richtig || 0) && blass < 2 &&
            !b.classList.contains("daneben")) { b.classList.add("zurueck"); blass++; }
      });
      // Das Blatt schon mal holen, falls es eine dritte Stufe gibt.
      if (f.zeile && f.blatt) blattHolen(f.blatt);
    } else if (stufe === 2) {
      h.innerHTML = '<div class="qtipp"><b>Schau auf dein Blatt:</b> Die Antwort steht in der Zeile <b>' +
        esc(f.zeile) + "</b>.</div>" +
        (blattBild ? '<div class="qblatt"><img src="' + blattBild +
                     '" alt="Dein Blatt zum Nachschlagen"></div>' : "");
      h.classList.remove("verborgen");
    }
  }

  function waehlen(platz, originalIndex, knopf) {
    if (!wahlOffen) return;
    var f = fragen[nr];
    var stimmt = originalIndex === (f.richtig || 0);
    versuch++;

    /* Daneben, und es gibt noch Hilfe? Dann ist es KEIN Fehler, sondern ein
       Zwischenschritt: Der Knopf ruettelt, die naechste Stufe geht auf, und
       das Kind darf noch einmal. Kein "falsch", nichts wird weggenommen -
       dieselbe Bauregel wie in der Schmiede seit dem 20.09.2026. */
    if (!stimmt && versuch === 1 && (f.tipp || f.zeile)) {
      if (!ersterFalsch) ersterFalsch = f.antworten[originalIndex];
      knopf.classList.add("daneben");
      setTimeout(function () { knopf.classList.remove("daneben"); }, 700);
      stufeZeigen(f, 1);
      return;                       // wahlOffen bleibt true - er darf nochmal
    }
    if (!stimmt && versuch === 2 && f.zeile && blattBild) {
      knopf.classList.add("daneben");
      setTimeout(function () { knopf.classList.remove("daneben"); }, 700);
      stufeZeigen(f, 2);
      return;
    }

    wahlOffen = false;
    if (stimmt && versuch === 1) richtigGesamt++;

    Array.prototype.forEach.call($("q-antworten").children, function (b, i) {
      b.disabled = true;
      if (reihenfolge[i] === (f.richtig || 0)) b.classList.add("richtig");
    });
    if (!stimmt) knopf.classList.add("falsch");

    var e = $("q-erklaerung");
    var kopf = stimmt
      ? (versuch === 1 ? "Richtig." : "Jetzt stimmt es.")
      : "Schau es dir an.";
    e.innerHTML = "<b>" + kopf + "</b> " + esc(f.erklaerung || "") +
      (f.merke ? '<div class="qmerke"><span>Damit du es behältst</span>' + esc(f.merke) + "</div>" : "");
    e.classList.remove("verborgen");
    e.classList.toggle("gut", stimmt);
    $("q-weiter").classList.remove("verborgen");
    $("q-weiter").textContent = (nr + 1 >= fragen.length || (stand.laenge && nr + 1 >= stand.laenge))
      ? "Fertig" : "Weiter";

    /* Gezaehlt wird der ERSTE Versuch. Wer erst mit Tipp und Blatt darauf
       kommt, hat es noch nicht gewusst - sonst zeigt der Elternbereich
       lauter Erfolge, die keine sind. */
    var stimmtEcht = stimmt && versuch === 1;
    antwortenLog.push({ frageId: f.id, merkmal: f.merkmal, fach: f.fach, stimmt: stimmtEcht });
    // Der Lernstand ist die Quelle für die Wiederholung - hier entsteht sie.
    if (window.lernstand && window.lernstand.antwort)
      window.lernstand.antwort(stimmtEcht, f.merkmal || "quiz",
        stimmtEcht ? "" : (ersterFalsch || f.antworten[originalIndex]), f.antworten[f.richtig || 0]);
    fortschrittMalen();
  }

  $("q-weiter").addEventListener("click", function () {
    nr++;
    if (stand.laenge && nr >= stand.laenge) return endeMalen();
    if (nr >= fragen.length) {
      // Endlos: nachladen, statt aufzuhören.
      if (!stand.laenge) return nachladen();
      return endeMalen();
    }
    frageMalen();
  });

  function nachladen() {
    $("q-frage").textContent = "Einen Moment, ich hole neue Fragen …";
    $("q-antworten").innerHTML = "";
    $("q-weiter").classList.add("verborgen");
    $("q-erklaerung").classList.add("verborgen");
    holen().then(function (j) {
      if (j && j.ok && j.fragen && j.fragen.length) {
        fragen = fragen.concat(j.fragen);
        frageMalen();
      } else {
        endeMalen();
      }
    }).catch(endeMalen);
  }

  function fortschrittMalen() {
    var ziel = stand.laenge || fragen.length;
    $("q-balken").style.width = Math.round(((nr + (wahlOffen ? 0 : 1)) / Math.max(1, ziel)) * 100) + "%";
    $("q-punkte").textContent = richtigGesamt + " richtig";
  }

  /* ---------- Ende ---------- */

  function endeMalen() {
    melden();
    var gesamt = antwortenLog.length;
    var quote = gesamt ? Math.round((richtigGesamt / gesamt) * 100) : 0;
    $("q-ende-zahl").textContent = richtigGesamt + " von " + gesamt;

    // Loben, was geleistet wurde - nicht die Quote feiern. Wer 6 von 15 hat,
    // hat 15 Fragen durchgehalten, und das ist die Anstrengung.
    $("q-ende-text").textContent = gesamt === 0 ? "Kein Durchgang gespielt."
      : quote >= 80 ? "Stark. Das sitzt."
      : quote >= 50 ? "Gut durchgehalten. Die, die nicht saßen, kommen wieder - dann mit anderen Zahlen."
      : "Das war schwer, und du bist drangeblieben. Genau die Fragen kommen wieder, bis sie sitzen.";

    // Was heute nicht saß, beim Namen nennen.
    var offen = {};
    antwortenLog.forEach(function (a) { if (!a.stimmt && a.merkmal) offen[a.merkmal] = (offen[a.merkmal] || 0) + 1; });
    var liste = Object.keys(offen);
    var box = $("q-ende-offen");
    if (liste.length) {
      box.innerHTML = "<b>Das üben wir weiter:</b><ul>" +
        liste.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul>";
      box.classList.remove("verborgen");
    } else {
      box.classList.add("verborgen");
    }

    stand.gespielt = (stand.gespielt || 0) + gesamt;
    stand.richtig = (stand.richtig || 0) + richtigGesamt;
    var heute = new Date().toISOString().slice(0, 10);
    if (!Array.isArray(stand.tage)) stand.tage = [];
    if (stand.tage[stand.tage.length - 1] !== heute) stand.tage.push(heute);
    stand.tage = stand.tage.slice(-60);
    schreibe(SPEICHER, stand);

    $("q-ende-serie").textContent = serie(stand.tage) + " Tage in Folge";
    zeige("ende");
  }

  function serie(tage) {
    if (!tage || !tage.length) return 0;
    var n = 0, d = new Date();
    for (;;) {
      var s = d.toISOString().slice(0, 10);
      if (tage.indexOf(s) < 0) break;
      n++; d.setDate(d.getDate() - 1);
    }
    return n;
  }

  function melden() {
    if (!antwortenLog.length) return;
    try {
      fetch("/api/quiz", { method: "POST", credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: KIND, antworten: antwortenLog }) }).catch(function () {});
    } catch (e) {}
  }

  $("q-nochmal").addEventListener("click", function () { zeige("start"); });

  function fachName(k) {
    var f = K.faecher.filter(function (x) { return x.k === k; })[0];
    return f ? f.ic + " " + f.n : "";
  }

  /* ---------- Aufbau ---------- */
  $("q-alle").addEventListener("click", function () {
    stand.faecher = []; stand.blaetter = []; schreibe(SPEICHER, stand);
    fachkachelnMalen(); blaetterMalen();
  });
  faecherHolen();   // holt die Faecher aus dem Heft und zeichnet danach
  laengeMalen();
  if (stand.tage && stand.tage.length) {
    $("q-serie").textContent = serie(stand.tage) ? "🔥 " + serie(stand.tage) + " Tage in Folge" : "";
  }
  zeige("start");
})();
