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
// Am 14.09.2026 sparsam gemacht (Denny: "Die Kostenlose bitte"). An dem Tag
// war um 13:54 UTC das Tageskontingent des KV-Speichers aufgebraucht - 1000
// Schreibvorgaenge -, und danach speicherte die ganze Lernwelt nichts mehr.
// Dieses Skript schrieb bei JEDEM setItem/removeItem, auch wenn sich nichts
// aenderte (Leons Seite loescht beim Laden einen laengst leeren Schluessel),
// und beim Verlassen doppelt (pagehide UND visibilitychange) - bei jedem
// Tab-Wechsel. Jetzt wird nur gesendet, was sich vom Stand in der Cloud
// wirklich unterscheidet. Den Stand liest das Skript beim Laden einmal
// (Lesen kostet praktisch nichts). Geht ein Senden schief, bleibt der
// Unterschied bestehen und wird beim naechsten Anlass nachgeholt.
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

  // Was nach unserem Wissen gerade in der Cloud liegt. null = unbekannt,
  // dann wird im Zweifel gesendet (lieber einmal zu viel als ein Stand zu wenig).
  var inDerCloud = null;

  function gleicheWerte(a, b) {
    var ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (var i = 0; i < ka.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(b, ka[i]) || b[ka[i]] !== a[ka[i]]) return false;
    }
    return true;
  }

  // Muss dieser Stand ueberhaupt geschickt werden?
  function unterschiedlich(d, vollstaendig) {
    if (!inDerCloud) return true;
    if (vollstaendig) return !gleicheWerte(d, inDerCloud);
    // Zusammenfuehren: nur senden, wenn ein Schluessel neu ist oder anders lautet
    for (var k in d) {
      if (Object.prototype.hasOwnProperty.call(d, k) && inDerCloud[k] !== d[k]) return true;
    }
    return false;
  }

  function merken(d, vollstaendig) {
    var neu = {};
    if (!vollstaendig && inDerCloud) for (var k in inDerCloud) neu[k] = inDerCloud[k];
    for (var j in d) neu[j] = d[j];
    inDerCloud = neu;
  }

  // Einmal beim Laden nachsehen, was die Cloud hat - nur die Schluessel, die
  // hierher gehoeren. Solange die Antwort fehlt, bleibt inDerCloud null.
  try {
    fetch(ZIEL, { credentials: "same-origin", cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (wolke) {
        if (inDerCloud !== null) return;     // inzwischen schon selbst gesendet
        var sauber = {};
        if (wolke && typeof wolke === "object" && !Array.isArray(wolke)) {
          for (var k in wolke) if (Object.prototype.hasOwnProperty.call(wolke, k) && gehoertHierher(k)) sauber[k] = String(wolke[k]);
        }
        inDerCloud = sauber;
      })
      .catch(function () {});
  } catch (e) {}

  // Nur wenn der Seed angekommen ist, kennt dieses Geraet den vollstaendigen
  // Stand - dann darf es ihn ersetzen, und Geloeschtes verschwindet auch
  // wirklich. Sonst wird nur zusammengefuehrt, damit ein Geraet ohne Seed
  // nicht den Stand aller anderen wegwischt.
  function paket() {
    var d = snapshot();
    if (!Object.keys(d).length) return null;
    var vollstaendig = window.__lwStandGeladen === true;
    if (!unterschiedlich(d, vollstaendig)) return null;   // steht so schon in der Cloud
    return { daten: d, vollstaendig: vollstaendig, text: JSON.stringify({ daten: d, vollstaendig: vollstaendig }) };
  }

  function push() {
    try {
      var p = paket();
      if (!p) return;                       // nichts zu sichern
      fetch(ZIEL, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: p.text,
        keepalive: true
      }).then(function (r) {
        // Erst als gesichert merken, wenn der Server es angenommen hat. Ist der
        // Speicher voll (500), bleibt der Unterschied - naechster Anlass holt es nach.
        if (r.ok) merken(p.daten, p.vollstaendig);
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
      if (timer) { clearTimeout(timer); timer = null; }
      var p = paket();
      if (!p) return;
      if (navigator.sendBeacon && navigator.sendBeacon(ZIEL, new Blob([p.text], { type: "application/json" }))) {
        // Ob der Beacon ankommt, erfahren wir nicht. Merken, damit pagehide und
        // visibilitychange nicht zweimal dasselbe schicken - ging er verloren,
        // zeigt der Stand beim naechsten Laden den Unterschied und es wird nachgeholt.
        merken(p.daten, p.vollstaendig);
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
