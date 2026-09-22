/* Ein Bau mit Foto dauert lange - diese Datei hält die Leitung offen.
 *
 * Paul stand am 22.09.2026 dreimal vor "Ich konnte den Server nicht
 * erreichen". Der Server war gesund: Der Bau MIT Foto dauert gemessen 90 bis
 * 120 Sekunden (ohne Foto 66 s), und Cloudflare bricht eine STILLE Leitung
 * mit HTTP 502 ab. Seitdem schickt /api/spiel-bauen bei "strom: true"
 * zeilenweise Lebenszeichen, und hier werden sie gelesen.
 *
 * EINMAL gebaut, von allen benutzt - dieselbe Regel wie beim Ferien-Band und
 * beim Spielmotor in /schmiede/. Wer hier etwas ändert, ändert es für Pauls
 * Werkstatt, beide Hausaufgaben-Hefte, Leons Startseite und die Schmiede -
 * und misst alle.
 *
 * Benutzt wird es so:
 *
 *     LWStrom.bauen({ kind:"paul", seiten:[…], wunsch:"…" }, {
 *       laeuft: function(sek){ … },          // optional, alle ~5 Sekunden
 *     }).then(function(spiel){ … })
 *       .catch(function(e){ melde(e.message); });
 *
 * Der Fehler trägt immer einen Satz, den ein Kind lesen kann - nie "HTTP 502".
 */
(function (global) {
  "use strict";

  var ABRISS = "Die Verbindung ist mittendrin abgerissen. Dein Foto ist noch da – " +
               "tipp nochmal auf den Knopf.";

  function ausJson(r) {
    // Kann der Browser keinen Strom lesen (sehr alt), kommt eine gewöhnliche
    // Antwort - dann ist es wie vorher, aber wenigstens nicht kaputt.
    return r.json().then(function (j) {
      if (r.status === 401) throw new Error("Bitte melde dich nochmal an.");
      if (!r.ok || !j || !j.ok || !j.spiel) {
        throw new Error((j && j.fehler) || "Da ist etwas schiefgegangen. Bitte nochmal versuchen.");
      }
      return j.spiel;
    });
  }

  function lesen(r, melder) {
    var leser = r.body.getReader(), decoder = new TextDecoder(), rest = "", letzte = null;

    function zeileNehmen(t) {
      t = String(t || "").trim();
      if (!t) return;
      // Jede Zeile trägt 2 KB Füllung - ohne die reicht Cloudflare kleine
      // Häppchen gar nicht erst durch. trim() nimmt sie weg.
      try { letzte = JSON.parse(t); } catch (e) { return; }
      if (letzte.status === "laeuft" && melder && typeof letzte.seit === "number") {
        try { melder(letzte.seit); } catch (e) {}
      }
    }

    function weiter() {
      return leser.read().then(function (stueck) {
        if (stueck.done) {
          zeileNehmen(rest); rest = "";
          return letzte || { status: "fehler", fehler: ABRISS };
        }
        rest = rest + decoder.decode(stueck.value, { stream: true });
        var teile = rest.split("\n");
        rest = teile.pop();
        teile.forEach(zeileNehmen);
        return weiter();
      });
    }

    return weiter().then(function (t) {
      if (t && t.status === "fertig" && t.spiel) return t.spiel;
      throw new Error((t && t.fehler) || ABRISS);
    });
  }

  function bauen(auftrag, haken) {
    haken = haken || {};
    var mit = {};
    for (var k in auftrag) if (Object.prototype.hasOwnProperty.call(auftrag, k)) mit[k] = auftrag[k];
    mit.strom = true;

    return fetch("/api/spiel-bauen", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mit),
    }).then(function (r) {
      var typ = (r.headers.get("content-type") || "");
      if (r.ok && r.body && r.body.getReader && typ.indexOf("ndjson") >= 0) {
        return lesen(r, haken.laeuft);
      }
      return ausJson(r);
    });
  }

  global.LWStrom = { bauen: bauen, ABRISS: ABRISS };
})(window);
