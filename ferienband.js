/* Ein Band mit den nächsten Ferien - für Paul, Leon und Helena dasselbe.
 *
 * Denny am 21.09.2026, nachdem er Helenas Entwurf gesehen hatte: "Die Anzeige
 * mit den Ferien finden Paul und Leon sicher bei sich auch sehr cool. Dort
 * ebenfalls mit einbauen."
 *
 * EINE Datei für alle drei - wie der Spielmotor in /schmiede/. Wer hier etwas
 * ändert, ändert es für alle drei und misst alle drei.
 *
 * Die Daten stehen in /ferien.json und gelten für ganz Bayern; Helenas
 * Gymnasium und die Grundschule Seeackerstraße haben dieselben Ferien.
 * Schulinterne unterrichtsfreie Tage stehen dort NICHT - die kommen bei
 * Helena aus ihrem eigenen Terminplan.
 *
 * EINBAUEN: ein leeres <div id="ferienband"></div> an die gewünschte Stelle,
 * dazu <script src="/ferienband.js"></script>. Mehr nicht. Solange nichts
 * geladen ist, bleibt das Band unsichtbar - eine leere Zeile ist besser als
 * eine falsche Zahl.
 *
 * ZIEL: window.FERIENBAND = {ziel:"termine.html"} macht das Band anklickbar
 * (nur Helena hat eine Terminseite). Ohne das ist es reine Anzeige.
 */
(function () {
  "use strict";

  var kasten = document.getElementById("ferienband");
  if (!kasten) return;
  var opt = window.FERIENBAND || {};

  var MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli",
                "August", "September", "Oktober", "November", "Dezember"];
  var heute = new Date();
  heute.setHours(0, 0, 0, 0);

  function alsDatum(s) {
    var p = s.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function tageBis(d) {
    return Math.round((d - heute) / 86400000);
  }

  // Das Band bringt sein eigenes Aussehen mit, weil die drei Lernwelten
  // verschieden aussehen (Paul und Leon hell, Helena dunkel). Es greift auf
  // die Farbvariablen der jeweiligen Seite zurück und hat für jede einen
  // Rückfall - so passt es sich an, ohne dass jemand etwas nachtragen muss.
  var stil = document.createElement("style");
  stil.textContent =
    "#ferienband{display:none}" +
    "#ferienband a,#ferienband div.fb{display:flex;align-items:center;gap:12px;" +
      "text-decoration:none;color:var(--ink,#1b1c22);" +
      "background:var(--card,var(--surface,#fff));" +
      "border:1px solid var(--line,#e4e7f0);border-left:4px solid var(--ok,#10b981);" +
      "border-radius:14px;padding:12px 15px;min-height:60px}" +
    "#ferienband .fbic{font-size:23px;line-height:1;flex:none}" +
    "#ferienband .fbtext{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0;" +
      "overflow-wrap:anywhere}" +
    "#ferienband .fbtext b{font-size:15.5px;line-height:1.25}" +
    "#ferienband .fbtext span{font-size:13px;color:var(--muted,#71768a)}" +
    "#ferienband .fbtage{font-family:var(--rund,var(--round,inherit));font-weight:800;" +
      "font-size:15px;line-height:1.2;color:var(--ok,#10b981);white-space:nowrap;text-align:right}" +
    "#ferienband.gross .fbtext b{font-size:18px}" +
    "#ferienband.gross .fbtext span{font-size:15px}" +
    "#ferienband.gross .fbtage{font-size:17px}" +
    /* Auf schmalen und auf flachen Schirmen zaehlt jede Zeile: In Helenas
       Lernwelt muss "Los geht's" ohne Scrollen erreichbar bleiben, und mit
       offener Tastatur bleiben 360 Punkte Hoehe. Das Band gibt dann seinen
       Untertext auf, nicht seine Tippflaeche - 46 px bleiben stehen. */
    "@media (max-height:520px),(max-width:520px){" +
      "#ferienband a,#ferienband div.fb{min-height:46px;padding:8px 12px}" +
      "#ferienband .fbtext span{display:none}" +
      "#ferienband.gross .fbtext b{font-size:16px}" +
      "#ferienband.gross .fbtage{font-size:15px}}";
  document.head.appendChild(stil);

  if (opt.gross) kasten.classList.add("gross");

  fetch("/ferien.json", { cache: "no-cache" }).then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }).then(function (d) {
    var naechste = null;
    (d.ferien || []).forEach(function (f) {
      if (naechste) return;
      var bis = alsDatum(f.bis);
      if (tageBis(bis) >= 0) naechste = f;
    });
    if (!naechste) return;

    var von = alsDatum(naechste.von), bis = alsDatum(naechste.bis);
    var n = tageBis(von);
    var titel, unten, zahl;

    if (n <= 0) {
      // Mitten drin: Dann interessiert nicht der Countdown, sondern wie lange
      // es noch geht. "Noch 0 Tage" wäre in den Ferien eine Frechheit.
      var rest = tageBis(bis);
      titel = naechste.name;
      unten = "noch bis " + bis.getDate() + ". " + MONATE[bis.getMonth()];
      zahl = rest === 0 ? "letzter<br>Tag" : rest === 1 ? "noch<br>1 Tag" : "noch<br>" + rest + " Tage";
    } else {
      titel = naechste.name;
      unten = "ab " + von.getDate() + ". " + MONATE[von.getMonth()];
      zahl = n === 1 ? "morgen" : "noch<br>" + n + " Tage";
    }

    var innen = '<span class="fbic">🏖️</span><span class="fbtext"><b>' + titel +
                '</b><span>' + unten + '</span></span><span class="fbtage">' + zahl + "</span>";
    kasten.innerHTML = opt.ziel
      ? '<a href="' + opt.ziel + '">' + innen + "</a>"
      : '<div class="fb">' + innen + "</div>";
    kasten.style.display = "block";
  }).catch(function () {
    // Kein Band ist besser als ein falsches Band.
  });
})();
