// Fortschritt-Sync (Client-Seite) - ein eigener Reiter je Kind.
//
// Das LADEN aus der Cloud erledigt der Server (Seed im <head>); hier geht es
// nur darum, spätere Änderungen ZURÜCK in die Cloud zu speichern.
//
// Am 07.09.2026 umgebaut. Vorher sammelte dieses Skript auf JEDER Seite den
// GESAMTEN localStorage ein und schrieb ihn in einen gemeinsamen Speicher.
// Dadurch landeten Helenas Vokabeldaten in Pauls Speicher - und weil der in
// jede HTML-Seite gesetzt wurde, standen sie öffentlich im Netz.
//
// Jetzt gilt: Das Skript läuft nur in einem Kinderbereich, sammelt nur die
// Schlüssel, die dorthin gehören, und schickt sie an den Speicher genau
// dieses Kindes.
//
// Pauls Spiele benutzen freie Schlüsselnamen ohne Vorsilbe ("beethoven-games",
// "wiege-taler", "hub-streak"). Die dürfen NICHT umbenannt werden - seine
// selbstgebauten Spiele lesen sie so. Für ihn gilt deshalb die Umkehrung:
// alles, was nicht erkennbar einem anderen Kind gehört.
(function () {
  "use strict";

  var treffer = location.pathname.match(/^\/(paul|leon|helena)(?:\/|$)/);
  if (!treffer) return;                    // Startseite und alles andere: nichts sammeln
  var KIND = treffer[1];

  var FREMD = /^(helena-|leon-|lw-progress:(helena|leon)-)/;
  var EIGEN = {
    helena: /^(helena-|lw-progress:helena-)/,
    leon:   /^(leon-|lw-progress:leon-)/
  };

  function gehoertHierher(k) {
    return KIND === "paul" ? !FREMD.test(k) : EIGEN[KIND].test(k);
  }

  function snapshot() {
    var out = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k !== null && gehoertHierher(k)) out[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    return out;
  }

  var ZIEL = "/api/progress?kind=" + KIND;
  var timer = null;

  function push() {
    try {
      var d = snapshot();
      if (!Object.keys(d).length) return;   // nichts zu sichern
      fetch(ZIEL, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(d),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  // Mehrere schnelle Änderungen zu einem Speichervorgang bündeln.
  function schedulePush() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(push, 1500);
  }

  // Schreibzugriffe auf localStorage abfangen und Speichern auslösen.
  try {
    var _set = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (k, v) { _set(k, v); schedulePush(); };
    var _rem = localStorage.removeItem.bind(localStorage);
    localStorage.removeItem = function (k) { _rem(k); schedulePush(); };
  } catch (e) {}

  // Beim Verlassen der Seite den Stand sicher wegschreiben.
  function flush() {
    try {
      var d = snapshot();
      if (!Object.keys(d).length) return;
      var text = JSON.stringify(d);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ZIEL, new Blob([text], { type: "application/json" }));
      } else {
        push();
      }
    } catch (e) {}
  }

  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush();
  });
})();
