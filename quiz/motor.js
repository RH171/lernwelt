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
      .then(function () { fachkachelnMalen(); });
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
      });
      box.appendChild(b);
    });
    $("q-alle").classList.toggle("an", stand.faecher.length === 0);
    // Ohne Auswahl heißt "alle" - so muss niemand erst etwas anklicken.
    $("q-start").textContent = stand.faecher.length
      ? "Los geht's · " + stand.faecher.length + " Fach" + (stand.faecher.length === 1 ? "" : "er")
      : "Los geht's · alle Fächer";
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

  function frageMalen() {
    var f = fragen[nr];
    if (!f) return endeMalen();
    wahlOffen = true;
    $("q-nr").textContent = "Frage " + (nr + 1) + (stand.laenge ? " von " + Math.min(stand.laenge, fragen.length) : "");
    $("q-fach").textContent = fachName(f.fach);
    $("q-frage").textContent = f.frage;
    $("q-erklaerung").classList.add("verborgen");
    $("q-weiter").classList.add("verborgen");

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

  function waehlen(platz, originalIndex, knopf) {
    if (!wahlOffen) return;
    wahlOffen = false;
    var f = fragen[nr];
    var stimmt = originalIndex === (f.richtig || 0);
    if (stimmt) richtigGesamt++;

    Array.prototype.forEach.call($("q-antworten").children, function (b, i) {
      b.disabled = true;
      if (reihenfolge[i] === (f.richtig || 0)) b.classList.add("richtig");
    });
    if (!stimmt) knopf.classList.add("falsch");

    var e = $("q-erklaerung");
    e.innerHTML = '<b>' + (stimmt ? "Richtig." : "Noch nicht.") + "</b> " + esc(f.erklaerung || "");
    e.classList.remove("verborgen");
    e.classList.toggle("gut", stimmt);
    $("q-weiter").classList.remove("verborgen");
    $("q-weiter").textContent = (nr + 1 >= fragen.length || (stand.laenge && nr + 1 >= stand.laenge))
      ? "Fertig" : "Weiter";

    antwortenLog.push({ frageId: f.id, merkmal: f.merkmal, fach: f.fach, stimmt: stimmt });
    // Der Lernstand ist die Quelle für die Wiederholung - hier entsteht sie.
    if (window.lernstand && window.lernstand.antwort)
      window.lernstand.antwort(stimmt, f.merkmal || "quiz", stimmt ? "" : f.antworten[originalIndex], f.antworten[f.richtig || 0]);
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
    stand.faecher = []; schreibe(SPEICHER, stand); fachkachelnMalen();
  });
  faecherHolen();   // holt die Faecher aus dem Heft und zeichnet danach
  laengeMalen();
  if (stand.tage && stand.tage.length) {
    $("q-serie").textContent = serie(stand.tage) ? "🔥 " + serie(stand.tage) + " Tage in Folge" : "";
  }
  zeige("start");
})();
