// Mitschrift für Pauls selbstgebaute Spiele.
//
// Diese Spiele sind alle verschieden gebaut - eigene Speicherformate, kein
// gemeinsamer Aufbau. Deshalb greift dieses Skript NICHT in ihr Innenleben
// ein. Es misst nur, WAS gespielt wurde und WIE LANGE, und meldet das beim
// Verlassen der Seite. Fach und Thema kommen aus dem Dateinamen.
//
// Will ein Spiel mehr beitragen, kann es das freiwillig tun:
//     window.lernstand.antwort(true,  "praedikat finden");
//     window.lernstand.antwort(false, "praedikat finden", "ging", "lief");
// Dann steht in der Elternauswertung auch, woran es hakt.
(function () {
  "use strict";
  if (window.lernstand) return;

  var DATEI = (location.pathname.split("/").pop() || "").replace(/\.html?$/i, "");
  if (!DATEI || DATEI === "index" || DATEI === "werkstatt") return;   // Hub und Werkstatt melden selbst

  var KIND = /\/leon\//.test(location.pathname) ? "leon"
           : /\/helena\//.test(location.pathname) ? "helena" : "paul";

  var begonnen = Date.now();
  var aufgaben = [];
  var gesendet = false;

  // "klasse3-deutsch-praedikat-springer" -> Fach "deutsch", Thema "praedikat springer"
  function ausDateiname() {
    var t = DATEI.split("-");
    if (t[0] && /^klasse\d/i.test(t[0])) t.shift();
    var fach = t.shift() || "";
    return { fach: fach, thema: t.join(" ").replace(/\d+d$/, "").trim() || fach };
  }

  window.lernstand = {
    // Ein Spiel kann jede beantwortete Aufgabe melden - freiwillig.
    antwort: function (stimmt, merkmal, gegeben, richtig) {
      try {
        aufgaben.push({
          merkmal: String(merkmal || "").slice(0, 40).toLowerCase(),
          art: "spiel",
          stimmt: !!stimmt,
          nachspielzeit: false,
          sekunden: 0,
          gegeben: stimmt ? "" : String(gegeben == null ? "" : gegeben).slice(0, 30),
          richtig: String(richtig == null ? "" : richtig).slice(0, 30)
        });
      } catch (e) {}
    }
  };

  function senden() {
    if (gesendet) return;
    var sekunden = Math.round((Date.now() - begonnen) / 1000);
    // Unter einer halben Minute war es kein Spielen, sondern ein Blick.
    if (sekunden < 30) return;
    gesendet = true;

    var d = ausDateiname();
    var runde = {
      spielId: DATEI, titel: document.title || DATEI,
      quelle: DATEI, fach: d.fach, thema: d.thema, lernbereich: "",
      sekunden: sekunden,
      // Hat das Spiel nichts gemeldet, halten wir wenigstens fest, DASS
      // gespielt wurde - ohne Ergebnis, damit keine Quote verfälscht wird.
      aufgaben: aufgaben.length ? aufgaben : [{ merkmal: "", art: "besuch", stimmt: true,
                                                nachspielzeit: false, sekunden: sekunden,
                                                gegeben: "", richtig: "" }],
      nurBesuch: aufgaben.length === 0
    };
    var text = JSON.stringify({ kind: KIND, runde: runde });
    try {
      // sendBeacon überlebt das Schließen des Tabs - fetch oft nicht.
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/statistik", new Blob([text], { type: "application/json" }));
      } else {
        fetch("/api/statistik", { method: "POST", credentials: "same-origin",
          headers: { "content-type": "application/json" }, body: text, keepalive: true }).catch(function(){});
      }
    } catch (e) {}
  }

  window.addEventListener("pagehide", senden);
  document.addEventListener("visibilitychange", function () { if (document.hidden) senden(); });
})();
