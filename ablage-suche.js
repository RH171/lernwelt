/* Suche in der Ablage - fuer Paul, Helena und Leon (04.10.2026).
 *
 * Anlass: Am Sonntag, 04.10.2026 wollten Denny und Paul Textaufgaben ueben und
 * fanden das Blatt nicht. Kein Blatt HEISST "Textaufgabe" - das Wort steht nur
 * im gelesenen Blatttext (drei Mathe-Seiten vom 28.09.2026), dazu kommen zwei
 * "Zahlenraetsel" vom 30.09.2026. Eine Suche nur im Titel findet 0 von 5.
 * Gewaehlt: Option A (unterlagen/suche-optionen.html).
 *
 * Gesucht wird nur in dem, was schon auf dem Geraet liegt: Titel, Thema,
 * Fach, Notiz, gelesener Text (inhalt) und Merksaetze der Fundkarten. Kein
 * Server-Aufruf, kein Schreibvorgang, kein Modell.
 *
 *   var suche = LWSuche.einbauen(<div>, {
 *     platzhalter: "Suchen, z. B. Textaufgabe",
 *     fachName:  function (fach) { return "Mathe"; },
 *     artName:   function (art)  { return "📘 Buch"; },
 *     datum:     function (iso)  { return "Montag, 28. September 2026"; },
 *     zeichen:   function (fach) { return "🔢"; },
 *     oeffnen:   function (id)   { ... },     // wie ein Tipp auf die Kachel
 *     geaendert: function ()     { ... }      // Liste neu malen
 *   });
 *   suche.zeigen(<div>, eintraege)  -> true, wenn gesucht wird (dann ist
 *                                      gemalt), sonst false (Seite malt selbst)
 *
 * Die Eintraege kommen schon nach Fach und Art gefiltert herein - so wirkt
 * die Suche zusammen mit den Reitern.
 *
 * Gleiche Bedeutung: Eine kleine Wortliste (GLEICH) erweitert jedes Suchwort.
 * Gross/klein und Umlaute sind egal ("ae" = "ä", "ss" = "ß").
 */
(function () {
  "use strict";

  /* Jede Zeile: Woerter, die fuer ein Kind dasselbe meinen. Kurze Woerter
     (unter 4 Zeichen) zaehlen nur als ganzes Wort - sonst faende "mal" auch
     "einmal" und "malen". */
  var GLEICH = [
    ["textaufgabe", "sachaufgabe", "zahlenrätsel", "rechengeschichte", "rechenrätsel", "sachrechnen"],
    ["diktat", "rechtschreibung", "lernwörter", "übungswörter"],
    ["plus", "addieren", "addition", "plusrechnen"],
    ["minus", "subtrahieren", "subtraktion", "minusrechnen"],
    ["mal", "malnehmen", "multiplizieren", "multiplikation", "malaufgabe"],
    ["geteilt", "teilen", "dividieren", "division"],
    ["einmaleins", "1x1", "malreihe", "malreihen"],
    ["nomen", "namenwort", "namenswort", "substantiv", "hauptwort"],
    ["verb", "verben", "tunwort", "tuwort", "zeitwort"],
    ["adjektiv", "wiewort", "eigenschaftswort"],
    ["geschichte", "erzählung", "aufsatz"],
    ["vokabeln", "vokabel", "vocabulary", "words"],
    ["hsu", "sachunterricht", "sachkunde", "heimat- und sachunterricht"],
    ["probe", "test", "prüfung", "schulaufgabe", "stegreifaufgabe"],
    ["geld", "euro", "cent"],
    ["gewicht", "gramm", "kilogramm", "wiegen"],
    ["länge", "längen", "meter", "zentimeter", "messen"],
    ["uhr", "uhrzeit", "minuten", "stunden"]
  ];

  /* Normalform mit Rueckweg: zu jedem Zeichen der Normalform steht, aus
     welchem Zeichen des Originals es kommt - sonst liesse sich das Fundstueck
     nicht im Originaltext hervorheben. */
  var ERSATZ = { "ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss" };
  function normMitWeg(s) {
    s = String(s == null ? "" : s);
    var aus = "", weg = [];
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i).toLowerCase();
      var r = ERSATZ[c];
      if (!r) {
        try { r = c.normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) { r = c; }
        if (r.length !== 1) r = c;
      }
      for (var j = 0; j < r.length; j++) { aus += r.charAt(j); weg.push(i); }
    }
    return { text: aus, weg: weg };
  }
  function norm(s) { return normMitWeg(s).text; }

  var GLEICH_N = GLEICH.map(function (g) { return g.map(norm); });

  function istWortzeichen(c) { return !!c && /[0-9a-z]/.test(c); }

  /* Wo steht das Wort? Kurze Woerter nur als ganzes Wort. */
  function finden(text, wort) {
    if (!wort) return -1;
    var ab = 0;
    while (true) {
      var i = text.indexOf(wort, ab);
      if (i < 0) return -1;
      if (wort.length >= 4) return i;
      if (!istWortzeichen(text.charAt(i - 1)) && !istWortzeichen(text.charAt(i + wort.length))) return i;
      ab = i + 1;
    }
  }

  /* Ein Suchwort und alles, was dasselbe meint. "textaufgaben" (Mehrzahl)
     findet die Gruppe von "textaufgabe" genauso wie "textauf" (Wortanfang). */
  function varianten(w) {
    var alle = [w];
    GLEICH_N.forEach(function (g) {
      var passt = g.some(function (m) {
        return m === w || (w.length >= 4 && (m.indexOf(w) === 0 || w.indexOf(m) === 0));
      });
      if (passt) g.forEach(function (m) { if (alle.indexOf(m) < 0) alle.push(m); });
    });
    return alle;
  }

  function sicher(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var STIL =
    ".lwsuche{position:relative;margin-top:16px}" +
    ".lwsuche input{width:100%;min-height:54px;border-radius:18px;border:2px solid var(--line,#d6dae6);" +
    "background:var(--karte,#fff);color:var(--ink,#1b1c22);font:600 19px/1.3 var(--font,system-ui,sans-serif);" +
    "padding:12px 58px 12px 16px;-webkit-appearance:none;appearance:none;outline:none}" +
    ".lwsuche input::placeholder{color:var(--muted,#5b6070);opacity:1;font-weight:500}" +
    ".lwsuche input:focus{border-color:var(--paul,#4f46e5)}" +
    ".lwsuche input::-webkit-search-cancel-button{display:none}" +
    ".lwsuche .lwsuche-weg{position:absolute;right:5px;top:50%;transform:translateY(-50%);" +
    "min-width:46px;min-height:46px;border:none;border-radius:14px;background:transparent;" +
    "color:var(--muted,#5b6070);font:700 22px/1 system-ui,sans-serif;cursor:pointer}" +
    ".lwsuche .lwsuche-weg[hidden]{display:none}" +
    ".lwsuche-kopf{font:700 16px var(--rund,system-ui,sans-serif);color:var(--muted,#5b6070);margin:18px 2px 10px}" +
    ".lwsuche-liste{display:flex;flex-direction:column;gap:10px}" +
    ".lwsuche-treffer{display:block;width:100%;text-align:left;border:none;cursor:pointer;" +
    "background:var(--karte,#fff);color:var(--ink,#1b1c22);border-radius:16px;padding:13px 15px;min-height:64px;" +
    "box-shadow:0 1px 2px rgba(20,22,40,.06),0 6px 18px rgba(20,22,40,.07);font:inherit}" +
    ".lwsuche-treffer.versteckt{opacity:.55}" +
    ".lwsuche-treffer .wo{display:block;color:var(--muted,#5b6070);font-size:14.5px}" +
    ".lwsuche-treffer b{display:block;font:700 17px/1.3 var(--rund,system-ui,sans-serif);margin:2px 0 4px}" +
    ".lwsuche-treffer .fund{display:block;font-size:15.5px;line-height:1.45}" +
    ".lwsuche-treffer .auch{color:var(--muted,#5b6070);font-size:14px}" +
    /* Hervorgehoben wie mit dem Textmarker - gelb, nie rot (Rot heisst bei
       den Kindern "falsch"). */
    "mark.lwsuche-mark{background:rgba(250,204,21,.5);color:inherit;border-radius:4px;padding:0 2px}" +
    "html[data-theme=\"dark\"] mark.lwsuche-mark{background:rgba(250,204,21,.34)}" +
    ".lwsuche-leer{text-align:center;padding:26px 12px;background:var(--karte,#fff);border-radius:22px;margin-top:14px}" +
    ".lwsuche-leer .zeichen{font-size:44px}" +
    ".lwsuche-leer b{display:block;font:700 19px var(--rund,system-ui,sans-serif);margin-top:8px}" +
    ".lwsuche-leer p{color:var(--muted,#5b6070);font-size:15px;margin:6px 0 0}";

  function stilEinmal() {
    if (document.getElementById("lwsuche-stil")) return;
    var s = document.createElement("style");
    s.id = "lwsuche-stil";
    s.textContent = STIL;
    (document.head || document.documentElement).appendChild(s);
  }

  /* Die Felder eines Blattes in der Reihenfolge, in der ein Fundstueck am
     meisten sagt: erst die Ueberschrift, dann der Blatttext. */
  function felder(e, o) {
    var f = [];
    if (e.titel) f.push({ was: "titel", text: e.titel });
    if (e.thema) f.push({ was: "thema", text: e.thema });
    (e.inhalt || []).forEach(function (z) { if (z) f.push({ was: "text", text: String(z) }); });
    (e.karten || []).forEach(function (k) { if (k && k.merke) f.push({ was: "merke", text: k.merke }); });
    if (e.notiz) f.push({ was: "notiz", text: e.notiz });
    var fn = o.fachName ? o.fachName(e.fach || "") : (e.fach || "");
    if (fn) f.push({ was: "fach", text: fn });
    return f;
  }

  /* Prueft ein Blatt. Jedes Suchwort muss irgendwo stehen; das Fundstueck
     kommt vom ersten Wort. */
  function pruefen(e, woerter, o) {
    var fs = felder(e, o).map(function (x) {
      var n = normMitWeg(x.text);
      return { was: x.was, text: x.text, n: n.text, weg: n.weg };
    });
    var fund = null;
    for (var w = 0; w < woerter.length; w++) {
      var getroffen = false;
      for (var i = 0; i < fs.length && !getroffen; i++) {
        for (var v = 0; v < woerter[w].alle.length; v++) {
          var a = woerter[w].alle[v], pos = finden(fs[i].n, a);
          if (pos < 0) continue;
          getroffen = true;
          /* "passt auch zu" nur, wenn ein ANDERES Wort getroffen hat - nicht bei
             Mehrzahl oder Wortanfang ("textaufgaben" -> "Textaufgabe"). */
          var ww = woerter[w].w, gleichesWort = a === ww || ww.indexOf(a) === 0 || a.indexOf(ww) === 0;
          if (w === 0 && !fund) fund = { feld: fs[i], pos: pos, laenge: a.length, ueber: gleichesWort ? "" : a };
          break;
        }
      }
      if (!getroffen) return null;
    }
    return fund;
  }

  /* Das Fundstueck: die Zeile, gekuerzt um die Stelle herum, mit Markierung. */
  function fundHtml(fund) {
    var f = fund.feld, t = f.text;
    var von = f.weg[fund.pos], bisN = fund.pos + fund.laenge - 1;
    var bis = (bisN < f.weg.length ? f.weg[bisN] : t.length - 1) + 1;
    var a = 0, z = t.length;
    if (t.length > 110) {
      a = Math.max(0, von - 40);
      z = Math.min(t.length, bis + 60);
      // Nicht mitten im Wort anfangen.
      if (a > 0) { var leer = t.lastIndexOf(" ", von); if (leer > a - 15 && leer >= 0) a = leer + 1; }
    }
    return (a > 0 ? "… " : "") + sicher(t.slice(a, von)) +
      '<mark class="lwsuche-mark">' + sicher(t.slice(von, bis)) + "</mark>" +
      sicher(t.slice(bis, z)) + (z < t.length ? " …" : "");
  }

  function einbauen(ort, o) {
    o = o || {};
    if (!ort) return { zeigen: function () { return false; }, aktiv: function () { return false; } };
    stilEinmal();
    ort.classList.add("lwsuche");
    ort.innerHTML =
      '<input type="search" id="lwsuche-feld" enterkeyhint="search" autocomplete="off" ' +
      'autocorrect="off" autocapitalize="off" spellcheck="false" ' +
      'aria-label="In deinen Blättern suchen" placeholder="🔎 ' + sicher(o.platzhalter || "Suchen") + '">' +
      '<button type="button" class="lwsuche-weg" aria-label="Suche leeren" hidden>✕</button>';
    var feld = ort.querySelector("input"), weg = ort.querySelector(".lwsuche-weg");

    function wort() { return String(feld.value || "").trim(); }
    function neu() {
      weg.hidden = !feld.value;
      if (o.geaendert) o.geaendert();
    }
    feld.addEventListener("input", neu);
    feld.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && feld.value) { feld.value = ""; neu(); }
      if (e.key === "Enter") { try { feld.blur(); } catch (x) {} }   // Tastatur weg, Treffer frei
    });
    weg.addEventListener("click", function () { feld.value = ""; neu(); feld.focus(); });

    function suchen(eintraege) {
      var woerter = norm(wort()).split(/\s+/).filter(Boolean).map(function (w) {
        return { w: w, alle: varianten(w) };
      });
      var treffer = [];
      (eintraege || []).forEach(function (e) {
        var f = pruefen(e, woerter, o);
        if (f) treffer.push({ e: e, fund: f });
      });
      return treffer;
    }

    function zeigen(ziel, eintraege) {
      if (!wort()) return false;
      var treffer = suchen(eintraege), roh = wort();
      if (!treffer.length) {
        ziel.innerHTML = '<div class="lwsuche-leer"><div class="zeichen">🔎</div>' +
          "<b>Zu „" + sicher(roh) + "“ habe ich kein Blatt gefunden</b>" +
          "<p>Probier ein anderes Wort – oder tipp oben auf „Alle“ und „Alles“, " +
          "dann suche ich in allen Blättern.</p></div>";
        return true;
      }
      var html = '<div class="lwsuche-kopf">' + treffer.length +
        (treffer.length === 1 ? " Blatt gefunden" : " Blätter gefunden") + "</div>" +
        '<div class="lwsuche-liste">';
      treffer.forEach(function (t) {
        var e = t.e, wo = [];
        var fn = o.fachName ? o.fachName(e.fach || "") : (e.fach || "");
        wo.push(((o.zeichen ? o.zeichen(e.fach || "") : "") + " " + fn).trim());
        var an = o.artName ? o.artName(e.art) : "";
        if (an) wo.push(an);
        if (e.datum) wo.push(o.datum ? o.datum(e.datum) : e.datum);
        if (e.seiten > 1) wo.push(e.seiten + " Seiten");
        if (e.sichtbar === false) wo.push("ausgeblendet");
        var titel = e.titel || fn || "Ohne Titel";
        var fund = t.fund.feld.was === "titel" && !t.fund.ueber ? "" :
          '<span class="fund">' + (t.fund.ueber ? '<span class="auch">passt auch zu „' +
          sicher(roh) + "“: </span>" : "") + fundHtml(t.fund) + "</span>";
        // Steht der Treffer im Titel, wird er dort markiert.
        var titelHtml = t.fund.feld.was === "titel" ? fundHtml(t.fund) : sicher(titel);
        html += '<button type="button" class="lwsuche-treffer' + (e.sichtbar === false ? " versteckt" : "") +
          '" data-id="' + sicher(e.id) + '">' +
          '<span class="wo">' + sicher(wo.join(" · ")) + "</span>" +
          "<b>" + titelHtml + "</b>" + fund + "</button>";
      });
      ziel.innerHTML = html + "</div>";
      Array.prototype.forEach.call(ziel.querySelectorAll(".lwsuche-treffer"), function (k) {
        k.addEventListener("click", function () { if (o.oeffnen) o.oeffnen(k.getAttribute("data-id")); });
      });
      return true;
    }

    return {
      zeigen: zeigen,
      suchen: suchen,
      aktiv: function () { return !!wort(); },
      feld: feld
    };
  }

  window.LWSuche = { einbauen: einbauen, norm: norm, varianten: varianten, GLEICH: GLEICH };
})();
