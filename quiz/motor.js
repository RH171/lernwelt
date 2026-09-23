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
          blaetter = nachArtSortiert(j.blaetter || []);
          blaetterZeichnen();
        })
        .catch(function () { kasten.classList.add("verborgen"); });
      return;
    }
    blaetterZeichnen();
  }

  /* Die Vorschaubilder je Blatt - einmal geholt, dann gemerkt. Ein Foto sind
     schnell 300 KB; ohne dieses Gedaechtnis kaeme es bei jedem Neuzeichnen der
     Liste wieder (und die zeichnet bei jedem Anhaken neu). */
  var vorschau = {};

  function vorschauFuellen(kasten, b) {
    if (!kasten || !b || !b.id) return;
    if (vorschau[b.id]) { kasten.style.backgroundImage = 'url("' + vorschau[b.id] + '")'; return; }
    if (vorschau[b.id] === false) return;          // schon versucht, ging nicht
    fetch("/api/schulstoff?kind=" + encodeURIComponent(K.kind) +
          "&bild=" + encodeURIComponent(b.id) + ":0", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok || !j.bild) { vorschau[b.id] = false; return; }
        vorschau[b.id] = j.bild;
        /* Nach dem Laden steht die Liste vielleicht schon neu da - deshalb
           nicht den gemerkten Knoten fuellen, sondern den aktuellen suchen. */
        var jetzt = document.querySelector('#q-blaetter-liste [data-blatt="' + b.id + '"] .qvor');
        (jetzt || kasten).style.backgroundImage = 'url("' + j.bild + '")';
      })
      .catch(function () { vorschau[b.id] = false; });
  }

  /* Gross ansehen. Bewusst kein eigenes Fenster und kein Verlassen der Seite:
     Das Kind steht mitten in seiner Auswahl und soll dahin zurueck. */
  function grossZeigen(b) {
    var alt = document.getElementById("q-gross");
    if (alt) alt.remove();
    var hu = document.createElement("div");
    hu.id = "q-gross";
    hu.className = "qgross";
    hu.innerHTML = '<div class="qgross-innen">' +
      '<div class="qgross-kopf"><b></b><button type="button" class="qgross-zu">Fertig</button></div>' +
      (vorschau[b.id] ? '<img alt="Dein Blatt">' : '<p class="qgross-leer">Das Bild kommt gerade nicht. Der Titel steht oben.</p>') +
      "</div>";
    hu.querySelector("b").textContent = b.titel || "Dein Blatt";
    if (vorschau[b.id]) hu.querySelector("img").src = vorschau[b.id];
    function zu() { hu.remove(); document.removeEventListener("keydown", aufTaste); }
    function aufTaste(e) { if (e.key === "Escape") zu(); }
    hu.addEventListener("click", function (e) { if (e.target === hu) zu(); });
    hu.querySelector(".qgross-zu").addEventListener("click", zu);
    document.addEventListener("keydown", aufTaste);
    document.body.appendChild(hu);
    hu.querySelector(".qgross-zu").focus();
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
      k.setAttribute("data-blatt", b.id);
      /* Eine Miniatur des eigenen Fotos, damit das Kind SIEHT, welches Blatt
         das ist. Denny am 23.09.2026: "Ich würde es cool finden, wenn Paul
         hier kurz sehen würde, welches Blatt das ist … er wird es meistens am
         Tablet oder iPhone machen."
         Deshalb keine Hover-Vorschau: Auf einem Finger-Gerät gibt es kein
         Darüberfahren. Die Miniatur steht einfach da, und ein Tipp darauf
         zeigt das Blatt gross - ohne dass die Auswahl umspringt. */
      k.innerHTML = '<span class="haken">' + (an ? "✓" : "") + "</span>" +
        '<span class="qvor" aria-hidden="true"></span>' +
        '<span class="was"><b></b><span></span></span>';
      k.querySelector("b").textContent = b.titel || "Ohne Titel";
      k.querySelector(".was span").textContent =
        schildFuer(b) + deutschKurz(b.datum) +
        (b.seiten > 1 ? " · " + b.seiten + " Seiten" : "");
      vorschauFuellen(k.querySelector(".qvor"), b);
      k.addEventListener("click", function (ev) {
        /* Ein Tipp auf die Miniatur vergroessert, statt an- oder abzuhaken -
           sonst muesste man zum Ansehen die Auswahl aendern. */
        if (ev.target.closest && ev.target.closest(".qvor")) {
          ev.preventDefault(); ev.stopPropagation();
          grossZeigen(b); return;
        }
        var i = stand.blaetter.indexOf(b.id);
        if (i >= 0) stand.blaetter.splice(i, 1); else stand.blaetter.push(b.id);
        schreibe(SPEICHER, stand);
        blaetterZeichnen();
      });
      liste.appendChild(k);
    });
  }

  /* Woraus gefragt wird, steht auf der Karte.
   *
   * Die Lehrerin am Elternabend der 4bG (23.09.2026, von Denny berichtet):
   * "Es wird das gefragt, was im Heft enthalten ist." Damit ist ein
   * Hefteintrag der Pruefungsstoff und ein Uebungsblatt die Uebung dazu -
   * das Lernquiz bevorzugt seit dem 23.09.2026 das Heft (nachArt() in
   * functions/api/quiz.js). Wenn es das tut, muss Paul es auch SEHEN,
   * sonst waehlt er blind.
   *
   * Als Text im Untertitel, nicht als eigenes Schild: Er erbt damit Farbe
   * und Groesse der Zeile, und es kann keine Klasse kollidieren - genau
   * das ist am 23.09.2026 mit .qblatt passiert (1,01:1 Kontrast). */
  /* Das Schild in der Blattauswahl. "sorte" schlaegt "art": Eine Lernzielliste
 * ist eine Lernzielliste, auch wenn Paul sie als Uebungsblatt abgelegt hat -
 * und der Server sortiert sie seit 24.09.2026 ganz nach vorn. Liefe die
 * Anzeige anders, sae Paul eine andere Reihenfolge als das Quiz benutzt. */
function schildFuer(b) {
  var s = (b && b.sorte) || "";
  if (s === "lernziele") return "\uD83D\uDCCB Lernziele \u00b7 ";
  if (s === "probennah") return "\uD83D\uDCDD Wie eine Probe \u00b7 ";
  return artKurz(b && b.art);
}

function artKurz(art) {
    if (art === "heft") return "\uD83D\uDCD3 Heft \u00b7 ";
    if (art === "uebung") return "\uD83D\uDCC4 \u00dcbung \u00b7 ";
    return "";                       // ohne Angabe: gar nichts behaupten
  }

  /* Hefteintraege zuerst, dann was ohne Angabe, dann Uebungsblaetter -
   * innerhalb einer Gruppe das Neueste oben. Dieselbe Reihenfolge wie
   * nachArt() auf dem Server, damit Auswahl und Fragenbau nicht
   * auseinanderlaufen. Es wird nichts weggelassen: Paul kann jedes Blatt
   * anhaken, es steht nur weiter unten. */
  function nachArtSortiert(liste) {
    // Dieselben fuenf Raenge wie nachArt() in functions/api/quiz.js (24.09.2026).
    var RANG = { heft: 1, "": 3, uebung: 4 };
    function rang(x) {
      var s = (x && x.sorte) || "";
      if (s === "lernziele") return 0;
      var r = RANG[(x && x.art) || ""];
      var a = r === undefined ? 3 : r;
      if (s === "probennah") return Math.min(a, 2);
      return a;
    }
    return (liste || []).slice().sort(function (a, b) {
      var ra = rang(a), rb = rang(b);
      if (ra !== rb) return ra - rb;
      return String(b.datum || "").localeCompare(String(a.datum || ""));
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
    ["start", "merken", "spiel", "ende"].forEach(function (x) {
      if (!$("sicht-" + x)) return;      // nicht jede Seite hat jeden Schirm
      $("sicht-" + x).classList.toggle("verborgen", x !== welche);
    });
    window.scrollTo(0, 0);
  }

  /* ---------- Erst anschauen, dann abfragen (Entwurf C, 23.09.2026) ----------
   *
   * Denny: "Leicht helfen hier Bilder, kleine Eselsbrücken, wie man sich das
   * besser merken kann." Die Eselsbrücken liegen ohnehin an jeder Frage - hier
   * werden sie EINMAL vorher gezeigt, bevor irgendetwas zählt.
   *
   * Lernen vor Prüfen. Wer gleich loslegen will, überspringt.
   * Gibt es keine Eselsbrücken (alte Fragen, andere Fächer), faellt der Schirm
   * still weg - er waere dann eine leere Seite zum Wegklicken. */
  /* Ein Zeichen zur KATEGORIE, nicht zum Inhalt.
   *
   * Das Modell liefert "symbol" nur, wenn es sicher passt - und die Fragen aus
   * dem Vorrat von vorher haben gar keines. Dann steht die Karte nackt da und
   * sieht nicht aus wie das, was Denny am 23.09.2026 abgenommen hat.
   *
   * Diese Liste geht nach dem ZEILENNAMEN des Blattes ("Einwohner",
   * "Telefonvorwahl"). Das ist die Kategorie und damit ungefaehrlich. Was vom
   * INHALT abhaengt, steht bewusst NICHT drin: Beim Wappen entscheidet die
   * Zahl der Blaetter, ob ☘️ oder 🍀 richtig ist - das kann nur das Modell
   * wissen, das das Blatt gelesen hat. Lieber keine Karte mit Zeichen als eine
   * mit dem falschen. */
  var ZEICHEN = [
    [/einwohner|bevoelker/i, "🏙️"],
    [/telefon|vorwahl/i, "☎️"],
    [/kfz|kennzeichen/i, "🚗"],
    [/postleit|plz/i, "✉️"],
    [/rathaus|adresse/i, "🏛️"],
    [/buergermeister|bürgermeister/i, "👤"],
    [/stadtteil|ortsteil/i, "🏘️"],
    [/fluss|flüsse|fluesse|gewaesser/i, "🌊"],
    [/partnerstadt|partnerstädte|partnerstaedte/i, "🤝"],
    [/eingemeind|jahr|datum/i, "📅"],
    [/regierungsbezirk|bezirk|land/i, "🗺️"],
    [/schule|klasse/i, "🎒"],
    [/tier|pflanze/i, "🌿"]
  ];

  function zeichenFuer(f) {
    if (f.symbol) return f.symbol;              // das Modell weiss es besser
    var z = String(f.zeile || "");
    for (var i = 0; i < ZEICHEN.length; i++) {
      if (ZEICHEN[i][0].test(z)) return ZEICHEN[i][1];
    }
    return "";
  }

  function merkkartenZeigen() {
    if (!$("sicht-merken")) return false;
    var mit = fragen.filter(function (f) { return f.merke; });
    if (mit.length < 3) return false;

    var box = $("m-karten");
    box.innerHTML = "";
    /* Hoechstens sechs - mehr merkt sich niemand auf einmal, und die Runde
       soll unter einer Minute bleiben. */
    mit.slice(0, 6).forEach(function (f) {
      var k = document.createElement("div");
      k.className = "mkarte";
      var richtig = f.antworten[f.richtig || 0];
      var zeichen = zeichenFuer(f);
      k.innerHTML = (zeichen ? '<div class="sym"></div>' : "") +
        '<div class="wert"></div><div class="was"></div><div class="brue"></div>';
      if (zeichen) k.querySelector(".sym").textContent = zeichen;
      k.querySelector(".wert").textContent = richtig;
      k.querySelector(".was").textContent = f.zeile || "";
      k.querySelector(".brue").textContent = f.merke;
      box.appendChild(k);
    });
    $("m-kopf").textContent = "Das kommt gleich dran";
    $("m-unter").textContent = mit.length > 6
      ? "Sechs davon zeige ich dir vorher – danach frage ich dich."
      : "Schau es dir einmal an – danach frage ich dich.";
    zeige("merken");
    return true;
  }

  if ($("m-los")) {
    $("m-los").addEventListener("click", function () { zeige("spiel"); frageMalen(); });
  }
  if ($("m-weiter")) {
    $("m-weiter").addEventListener("click", function () { zeige("spiel"); frageMalen(); });
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
      /* Erst anschauen, dann abfragen - wenn es etwas anzuschauen gibt. */
      if (merkkartenZeigen()) return;
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
        (blattBild ? '<div class="qfoto"><img src="' + blattBild +
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
    /* Auch OHNE Bild: Der Zeilenname allein ist schon eine Hilfe ("schau in
       die Zeile Regierungsbezirk"), und das Kind hat sein Heft oft daneben
       liegen. Die Gegenprobe am 23.09.2026 hat gezeigt, dass Stufe 2 sonst
       ganz wegfaellt, sobald der Speicher das Foto nicht liefert. */
    if (!stimmt && versuch === 2 && f.zeile) {
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
