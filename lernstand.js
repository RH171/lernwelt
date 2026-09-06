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

  var DATEI = (location.pathname.split("/").pop() || "").replace(/\.html?$/i, "") || "index";
  var NUR_MELDEN = (DATEI === "index" || DATEI === "werkstatt");   // die schreiben selbst mit

  var KIND = /\/leon\//.test(location.pathname) ? "leon"
           : /\/helena\//.test(location.pathname) ? "helena" : "paul";


  /* ---------- "Hier stimmt was nicht" ----------
     Ein Kind, das mitten im Spiel sagen kann, was hakt, ist die beste
     Fehlerquelle, die es gibt - es sieht Dinge, die im Code nicht auffallen.
     Deshalb ist der Weg dorthin kurz: ein Knopf, ein Satz, ein Bild. */

  function melderBauen() {
    if (document.getElementById("melde-knopf")) return;

    var stil = document.createElement("style");
    stil.textContent =
      '#melde-knopf{position:fixed;right:14px;bottom:14px;z-index:2147483000;' +
        'width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;' +
        'background:#fff;color:#1b1c22;font-size:23px;line-height:1;' +
        'box-shadow:0 3px 14px rgba(0,0,0,.22);display:grid;place-items:center;' +
        'font-family:system-ui,sans-serif;padding:0}' +
      '#melde-knopf:active{transform:scale(.93)}' +
      '#melde-huelle{position:fixed;inset:0;z-index:2147483001;background:rgba(15,18,28,.55);' +
        'display:grid;place-items:center;padding:16px;font-family:system-ui,sans-serif}' +
      '#melde-karte{background:#fff;color:#1b1c22;border-radius:20px;padding:20px;' +
        'max-width:430px;width:100%;max-height:92vh;overflow:auto;box-shadow:0 18px 50px rgba(0,0,0,.3)}' +
      '#melde-karte h3{margin:0 0 4px;font-size:20px}' +
      '#melde-karte p.u{margin:0 0 14px;color:#6b7280;font-size:14px;line-height:1.5}' +
      '#melde-karte .arten{display:flex;gap:8px;margin-bottom:12px}' +
      '#melde-karte .arten button{flex:1;padding:11px;border-radius:12px;border:2px solid #e5e8ef;' +
        'background:#fbfcff;font-size:14.5px;font-weight:600;cursor:pointer;color:#1b1c22}' +
      '#melde-karte .arten button.an{border-color:#4f46e5;background:#eef0ff}' +
      '#melde-karte textarea{width:100%;min-height:96px;border:2px solid #e5e8ef;border-radius:13px;' +
        'padding:11px 13px;font:inherit;font-size:15.5px;resize:vertical;box-sizing:border-box}' +
      '#melde-karte textarea:focus{outline:none;border-color:#4f46e5}' +
      '#melde-karte .bildreihe{display:flex;align-items:center;gap:10px;margin-top:11px;flex-wrap:wrap}' +
      '#melde-karte .bildknopf{padding:11px 14px;border-radius:12px;border:2px dashed #cfd5e4;' +
        'background:#fbfcff;font-size:14.5px;cursor:pointer;color:#1b1c22}' +
      '#melde-vorschau{max-height:120px;border-radius:10px;border:1px solid #e5e8ef;display:none}' +
      '#melde-karte .schicken{width:100%;margin-top:15px;padding:15px;border:none;border-radius:14px;' +
        'background:#4f46e5;color:#fff;font-size:17px;font-weight:700;cursor:pointer}' +
      '#melde-karte .schicken:disabled{opacity:.5}' +
      '#melde-karte .abbrechen{width:100%;margin-top:8px;padding:12px;border:none;border-radius:12px;' +
        'background:#f2f3f8;color:#1b1c22;font-size:15px;cursor:pointer}' +
      '#melde-karte .fertig{text-align:center;padding:14px 0}' +
      '#melde-karte .fertig .haken{font-size:44px}' +
      '#melde-punkt{position:absolute;top:-3px;right:-3px;width:17px;height:17px;border-radius:50%;' +
        'background:#ef4444;border:2px solid #fff;display:none}' +
      '#melde-knopf.hat-neues #melde-punkt{display:block}' +
      '#melde-knopf{position:fixed}' +
      '.faden{margin:0 0 14px}' +
      '.faden .blase{padding:11px 13px;border-radius:14px;margin-bottom:8px;font-size:15px;line-height:1.5;white-space:pre-line}' +
      '.faden .von-kind{background:#eef0ff;border-bottom-right-radius:5px;margin-left:22px}' +
      '.faden .von-werkstatt{background:#f2f6f3;border:1px solid #dfeae2;border-bottom-left-radius:5px;margin-right:22px}' +
      '.faden .wer{display:block;font-size:12px;color:#6b7280;margin-bottom:3px;font-weight:600}' +
      '.faden img{max-width:100%;border-radius:10px;margin-top:7px;display:block}' +
      '.faden-liste{max-height:44vh;overflow:auto;margin-bottom:12px}' +
      '#melde-karte .passt{width:100%;margin-top:8px;padding:13px;border:none;border-radius:13px;' +
        'background:#12a35f;color:#fff;font-size:16px;font-weight:700;cursor:pointer}' +
      '#melde-karte .zurueck{background:none;border:none;color:#6b7280;font-size:14px;cursor:pointer;padding:6px 0}';
    document.head.appendChild(stil);

    var knopf = document.createElement("button");
    knopf.id = "melde-knopf";
    knopf.type = "button";
    knopf.title = "Hier stimmt was nicht";
    knopf.setAttribute("aria-label", "Problem melden");
    knopf.innerHTML = "\u{1F4AC}<span id=\"melde-punkt\"></span>";
    knopf.style.position = "fixed";
    knopf.addEventListener("click", dialogOeffnen);
    document.body.appendChild(knopf);
  }

  var gewaehlteArt = "problem", bildDaten = "";
  var meineFaeden = [];

  // Hat die Werkstatt geantwortet? Dann bekommt der Knopf einen roten Punkt.
  function nachAntwortenSehen(){
    fetch("/api/melden?meine=1&kind=" + encodeURIComponent(KIND), {credentials:"same-origin"})
      .then(function(r){ return r.json(); })
      .then(function(j){
        if (!j || !j.ok) return;
        meineFaeden = j.meldungen || [];
        var neues = meineFaeden.some(function(f){ return f.ungelesenKind; });
        var k = document.getElementById("melde-knopf");
        if (k) k.classList.toggle("hat-neues", neues);
      })
      .catch(function(){});
  }

  function dialogOeffnen() {
    if (document.getElementById("melde-huelle")) return;
    // Wartet eine Antwort? Dann die zuerst zeigen - Paul soll nicht suchen
    // muessen, was aus seiner Meldung geworden ist.
    var offen = meineFaeden.filter(function (f) { return f.ungelesenKind; })[0];
    if (offen) { fadenZeigen(offen); return; }
    dialogOeffnenNeu();
  }

  function dialogOeffnenNeu() {
    if (document.getElementById("melde-huelle")) return;
    bildDaten = ""; gewaehlteArt = "problem";

    var h = document.createElement("div");
    h.id = "melde-huelle";
    h.innerHTML =
      '<div id="melde-karte">' +
        '<h3>Was ist los?</h3>' +
        '<p class="u">Schreib einfach rein, was nicht stimmt oder was du dir wünschst. Denny und Claude lesen das.</p>' +
        '<div class="arten">' +
          '<button type="button" data-art="problem" class="an">\u{1F41B} Da ist ein Fehler</button>' +
          '<button type="button" data-art="wunsch">✨ Ich wünsche mir was</button>' +
        '</div>' +
        '<textarea id="melde-text" maxlength="1500" placeholder="Zum Beispiel: Der Knopf geht nicht, wenn ich ihn zweimal drücke."></textarea>' +
        '<div class="bildreihe">' +
          '<button type="button" class="bildknopf" id="melde-bildknopf">\u{1F4F7} Bild dazutun</button>' +
          '<img id="melde-vorschau" alt="">' +
        '</div>' +
        '<input type="file" id="melde-datei" accept="image/*" style="display:none">' +
        '<button type="button" class="schicken" id="melde-schicken">Abschicken</button>' +
        '<button type="button" class="abbrechen" id="melde-abbrechen">Doch nicht</button>' +
      '</div>';
    document.body.appendChild(h);

    h.addEventListener("click", function (e) { if (e.target === h) h.remove(); });
    h.querySelector("#melde-abbrechen").addEventListener("click", function () { h.remove(); });
    Array.prototype.forEach.call(h.querySelectorAll(".arten button"), function (b) {
      b.addEventListener("click", function () {
        gewaehlteArt = b.getAttribute("data-art");
        Array.prototype.forEach.call(h.querySelectorAll(".arten button"), function (x) {
          x.classList.toggle("an", x === b);
        });
      });
    });
    h.querySelector("#melde-bildknopf").addEventListener("click", function () {
      h.querySelector("#melde-datei").click();
    });
    h.querySelector("#melde-datei").addEventListener("change", function (e) {
      var d = e.target.files && e.target.files[0];
      if (d) bildLesen(d, h);
    });
    h.querySelector("#melde-schicken").addEventListener("click", function () { schicken(h); });
    setTimeout(function () { h.querySelector("#melde-text").focus(); }, 60);
  }

  // Der Gespraechsfaden: Was Paul geschrieben hat, was die Werkstatt
  // geantwortet hat, und die Moeglichkeit weiterzureden - bis er selbst sagt,
  // dass es passt.
  function fadenZeigen(faden) {
    var h = document.createElement("div");
    h.id = "melde-huelle";
    var blasen = (faden.verlauf || []).map(function (n) {
      var vonMir = (n.von !== "werkstatt");
      return '<div class="blase ' + (vonMir ? "von-kind" : "von-werkstatt") + '">' +
               '<span class="wer">' + (vonMir ? "Du" : "Werkstatt") + '</span>' +
               entschaerfen(n.text || "") +
             '</div>';
    }).join("");

    h.innerHTML =
      '<div id="melde-karte">' +
        '<h3>Deine Meldung</h3>' +
        '<p class="u">Wir haben dir geantwortet. Passt es so, oder fehlt noch was?</p>' +
        '<div class="faden faden-liste">' + blasen + '</div>' +
        '<textarea id="melde-text" maxlength="1500" placeholder="Antworte hier …"></textarea>' +
        '<button type="button" class="schicken" id="melde-schicken">Abschicken</button>' +
        '<button type="button" class="passt" id="melde-passt">Passt jetzt! \u{1F44D}</button>' +
        '<button type="button" class="zurueck" id="melde-neu">Etwas anderes melden</button>' +
      '</div>';
    document.body.appendChild(h);
    h.addEventListener("click", function (e) { if (e.target === h) schliessen(h, faden); });

    h.querySelector("#melde-schicken").addEventListener("click", function () {
      antwortSchicken(h, faden);
    });
    h.querySelector("#melde-passt").addEventListener("click", function () {
      fetch("/api/melden", {
        method: "POST", credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: KIND, id: faden.id, status: "passt" })
      }).then(function () {
        h.querySelector("#melde-karte").innerHTML =
          '<div class="fertig"><div class="haken">\u{1F389}</div><h3>Super!</h3>' +
          '<p class="u">Danke, dass du es gemeldet hast.</p></div>';
        setTimeout(function () { h.remove(); nachAntwortenSehen(); }, 1700);
      }).catch(function () {});
    });
    h.querySelector("#melde-neu").addEventListener("click", function () {
      gelesenMerken(faden); h.remove(); dialogOeffnenNeu();
    });

    gelesenMerken(faden);
  }

  function schliessen(h, faden) { if (faden) gelesenMerken(faden); h.remove(); }

  // Als gelesen vermerken, damit der rote Punkt verschwindet.
  function gelesenMerken(faden) {
    if (faden.ungelesenKind) {
      try {
        fetch("/api/melden", {
          method: "POST", credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ kind: KIND, id: faden.id, gelesen: true })
        }).catch(function () {});
      } catch (e) {}
    }
    faden.ungelesenKind = false;
    var k = document.getElementById("melde-knopf");
    if (k && !meineFaeden.some(function (f) { return f.ungelesenKind; })) k.classList.remove("hat-neues");
  }

  function antwortSchicken(h, faden) {
    var text = h.querySelector("#melde-text").value.trim();
    if (!text && !bildDaten) { h.querySelector("#melde-text").focus(); return; }
    var knopf = h.querySelector("#melde-schicken");
    knopf.disabled = true; knopf.textContent = "Wird geschickt \u2026";
    fetch("/api/melden", {
      method: "POST", credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: KIND, id: faden.id, text: text, bild: bildDaten, alsKind: true })
    })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j || !j.ok) throw new Error("nein");
      h.querySelector("#melde-karte").innerHTML =
        '<div class="fertig"><div class="haken">\u{1F44D}</div><h3>Ist angekommen</h3>' +
        '<p class="u">Wir melden uns wieder.</p></div>';
      setTimeout(function () { h.remove(); nachAntwortenSehen(); }, 1700);
    })
    .catch(function () { knopf.disabled = false; knopf.textContent = "Nochmal versuchen"; });
  }

  function entschaerfen(t) {
    var d = document.createElement("div");
    d.textContent = String(t == null ? "" : t);
    return d.innerHTML;
  }

  // Grosse Fotos vorher verkleinern - sonst passt kein Bild durch.
  function bildLesen(datei, h) {
    var leser = new FileReader();
    leser.onload = function (ev) {
      var bild = new Image();
      bild.onload = function () {
        var max = 1280;
        var b = bild.width, hh = bild.height;
        if (b > max || hh > max) { var f = Math.min(max / b, max / hh); b = Math.round(b * f); hh = Math.round(hh * f); }
        try {
          var c = document.createElement("canvas");
          c.width = b; c.height = hh;
          c.getContext("2d").drawImage(bild, 0, 0, b, hh);
          bildDaten = c.toDataURL("image/jpeg", 0.72);
        } catch (e) { bildDaten = ev.target.result; }
        var v = h.querySelector("#melde-vorschau");
        v.src = bildDaten; v.style.display = "block";
        h.querySelector("#melde-bildknopf").textContent = "\u{1F504} Anderes Bild";
      };
      bild.src = ev.target.result;
    };
    leser.readAsDataURL(datei);
  }

  function schicken(h) {
    var text = h.querySelector("#melde-text").value.trim();
    if (!text && !bildDaten) { h.querySelector("#melde-text").focus(); return; }
    var knopf = h.querySelector("#melde-schicken");
    knopf.disabled = true; knopf.textContent = "Wird geschickt …";

    fetch("/api/melden", {
      method: "POST", credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: KIND, text: text, bild: bildDaten,
        art: gewaehlteArt, wo: location.pathname, titel: document.title || ""
      })
    })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j || !j.ok) throw new Error("nein");
      h.querySelector("#melde-karte").innerHTML =
        '<div class="fertig"><div class="haken">\u{1F44D}</div>' +
        '<h3>Danke!</h3><p class="u">Wir schauen uns das an.</p></div>';
      setTimeout(function () { h.remove(); }, 1800);
    })
    .catch(function () {
      knopf.disabled = false; knopf.textContent = "Nochmal versuchen";
    });
  }

  function melderStarten(){
    melderBauen();
    nachAntwortenSehen();
    // Alle zwei Minuten nachsehen - eine Antwort soll ankommen, auch wenn
    // Paul gerade spielt.
    setInterval(nachAntwortenSehen, 120000);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", melderStarten);
  } else {
    melderStarten();
  }

  if (NUR_MELDEN) return;   // Hub und Werkstatt schreiben ihre Runden selbst mit

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
