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

  /* Was der Browser sagt, versteht kein Kind.
   *
   * Paul sah am 22.09.2026 um 20:46 Uhr "Load failed" - Safaris eigener Text
   * fuer einen abgebrochenen fetch, englisch und ohne jeden Hinweis, was er
   * tun soll. Hier wird daraus ein Satz, den er lesen kann. Der Originaltext
   * bleibt in der Konsole, damit man ihn beim Suchen noch hat. */
  function fuerKinder(e) {
    var roh = String((e && e.message) || e || "");
    try { if (roh) console.warn("Bau abgebrochen:", roh); } catch (x) {}
    if (roh.indexOf("melde dich") >= 0) return roh;            // kommt schon aus unserem Haus
    if (/^[A-ZÄÖÜ].{0,80}[.!?]$/.test(roh) && /[äöüß]|ich|dein|nochmal/i.test(roh)) return roh;
    return "Die Verbindung ist abgerissen. Dein Foto ist noch da \u2013 tipp nochmal auf den Knopf.";
  }

  function einmal(mit, haken) {
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

  function bauen(auftrag, haken) {
    haken = haken || {};
    var mit = {};
    for (var k in auftrag) if (Object.prototype.hasOwnProperty.call(auftrag, k)) mit[k] = auftrag[k];
    mit.strom = true;

    /* Ein abgebrochener Upload bekommt einen zweiten Versuch.
     *
     * Ein Foto ist gut ein Megabyte, und ein Handy wechselt beim Hochladen
     * schon mal die Funkzelle. Dass die Verbindung einmal abreisst, ist
     * normal - dass das Kind dafuer von vorne anfangen muss, nicht. Nur der
     * NETZfehler wird wiederholt: Sagt der Server etwas (zu gross, nicht
     * angemeldet, kein Spiel), waere ein zweiter Versuch dieselbe Absage
     * und nur mehr Wartezeit. */
    return einmal(mit, haken).catch(function (e) {
      var roh = String((e && e.message) || e || "");
      var vomServer = /melde dich|zu viel los|Guthaben|Claude hat nicht|zu gross|zu groß|unvollständig|unvollstaendig/i.test(roh);
      if (vomServer) throw new Error(fuerKinder(e));
      if (haken.laeuft) { try { haken.laeuft(0); } catch (x) {} }
      return new Promise(function (r) { setTimeout(r, 2000); })
        .then(function () { return einmal(mit, haken); })
        .catch(function (e2) { throw new Error(fuerKinder(e2)); });
    });
  }

  global.LWStrom = { bauen: bauen, ABRISS: ABRISS };
})(window);
