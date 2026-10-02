/* Eine Seite neu fotografieren oder eine dazulegen - in der Grossansicht
 * der Ablage, bei allen drei Kindern (02.10.2026).
 *
 * Denny, mit einem Foto von Pauls Hefteintrag "Zusammengesetzte Nomen", den
 * Paul nach dem Ablegen zu Ende geschrieben hatte: "Haben wir derzeit schon
 * die Moeglichkeit, eine Seite zu ergaenzen oder auszutauschen?" Gewaehlt
 * per Klickfrage: ein Knopf, Fach, Art, Datum und Thema bleiben, das alte
 * Foto bleibt gespeichert.
 *
 *   var t = LWSeite.einbauen(knoepfeEl, { kind:"paul",
 *     offen: function(){ return {eintrag: offen, seite: offenSeite}; },
 *     fertig: function(){ laden(); } });
 *   t.malen();   // nach jedem seiteZeigen()
 *
 * Ablauf: Foto waehlen -> verkleinern (LWStrom) -> POST ?seite=1 -> POST
 * ?lesen=1. Das Blatt liegt nach dem ersten Schritt sicher; scheitert das
 * Lesen, holt es /nachlesen.js spaeter nach. */
(function (global) {
  "use strict";
  var MAX = 4;

  function einbauen(knoepfe, opt) {
    var kind = opt.kind;
    var neu = document.createElement("button");
    neu.type = "button"; neu.className = "fach"; neu.id = "schau-seite-neu";
    neu.textContent = "📸 Diese Seite neu";
    var dazu = document.createElement("button");
    dazu.type = "button"; dazu.className = "fach"; dazu.id = "schau-seite-dazu";
    dazu.textContent = "➕ Seite dazu";
    var datei = document.createElement("input");
    datei.type = "file"; datei.accept = "image/*"; datei.hidden = true;
    datei.id = "schau-seite-datei";
    var meldung = document.createElement("p");
    meldung.className = "seite-meldung"; meldung.id = "schau-seite-meldung";
    meldung.setAttribute("role", "status");
    meldung.style.cssText = "flex-basis:100%;margin:6px 0 0;text-align:center;color:#fff;font-weight:600;min-height:1.2em";
    knoepfe.appendChild(neu); knoepfe.appendChild(dazu);
    knoepfe.appendChild(datei); knoepfe.appendChild(meldung);

    var ziel = null, laeuft = false, zuletzt = null;

    function melde(t) { meldung.textContent = t || ""; }

    function malen() {
      var o = opt.offen() || {};
      var e = o.eintrag;
      if (!e) return;
      var seiten = Math.max(1, Number(e.seiten) || 1);
      neu.textContent = seiten > 1 ? "📸 Seite " + ((o.seite || 0) + 1) + " neu" : "📸 Diese Seite neu";
      dazu.style.display = seiten < MAX ? "" : "none";
      neu.disabled = dazu.disabled = laeuft;
      // Ein anderes Blatt geoeffnet: die alte Meldung gehoert nicht dazu.
      if (!laeuft && e.id !== zuletzt) melde("");
      zuletzt = e.id;
    }

    function waehlen(nr) {
      if (laeuft) return;
      ziel = nr;
      datei.value = "";
      datei.click();
    }
    neu.addEventListener("click", function () {
      var o = opt.offen() || {};
      if (o.eintrag) waehlen(o.seite || 0);
    });
    dazu.addEventListener("click", function () {
      var o = opt.offen() || {};
      if (o.eintrag) waehlen(Math.max(1, Number(o.eintrag.seiten) || 1));
    });

    datei.addEventListener("change", function () {
      var f = datei.files && datei.files[0];
      var o = opt.offen() || {};
      if (!f || !o.eintrag || ziel == null) return;
      var id = o.eintrag.id, nr = ziel;
      laeuft = true; neu.disabled = dazu.disabled = true;
      melde("Ich lege das Foto ab …");
      var leser = new FileReader();
      leser.onerror = function () { fertigMit("Das Foto ließ sich nicht öffnen. Probier es nochmal."); };
      leser.onload = function () {
        var url = String(leser.result);
        var klein = (global.LWStrom && global.LWStrom.kleinerMachen)
          ? global.LWStrom.kleinerMachen([url]) : Promise.resolve([url]);
        klein.then(function (b) {
          return fetch("/api/schulstoff?seite=1", {
            method: "POST", credentials: "same-origin",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ kind: kind, id: id, nr: nr, bild: b[0] })
          });
        }).then(function (r) { return r.json(); }).then(function (j) {
          if (!j || !j.ok) { fertigMit((j && j.fehler) || "Das hat gerade nicht geklappt. Probier es nochmal."); return; }
          if (opt.abgelegt) { try { opt.abgelegt(j, nr); } catch (e) {} }
          melde("✅ Foto liegt drin. Ich lese dein Blatt jetzt neu …");
          return fetch("/api/schulstoff?lesen=1", {
            method: "POST", credentials: "same-origin",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ kind: kind, id: id })
          }).then(function (r) { return r.json(); }).then(function (l) {
            fertigMit(l && l.ok ? "✅ Fertig – dein Blatt ist neu gelesen." :
              "✅ Foto liegt drin. Durchlesen hat gerade nicht geklappt, das hole ich nach.");
          }, function () {
            fertigMit("✅ Foto liegt drin. Durchlesen hat gerade nicht geklappt, das hole ich nach.");
          });
        }).catch(function () { fertigMit("Ich komme gerade nicht an dein Heft. Probier es gleich nochmal."); });
      };
      leser.readAsDataURL(f);
    });

    function fertigMit(text) {
      laeuft = false; neu.disabled = dazu.disabled = false;
      if (opt.fertig) { try { opt.fertig(); } catch (e) {} }
      melde(text);
    }

    return { malen: malen };
  }

  global.LWSeite = { einbauen: einbauen };
})(window);
