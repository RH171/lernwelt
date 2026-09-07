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
  // Seiten, die ihre Runden selbst an /api/statistik melden. Der Dateiname
  // reicht dafuer nicht: Helenas "franzoesisch.html" heisst nicht "index",
  // schreibt aber sehr wohl selbst mit. Deshalb darf eine Seite es auch
  // ausdruecklich sagen: <script>window.LERNSTAND_SCHREIBT_SELBST = true;</script>
  var NUR_MELDEN = (DATEI === "index" || DATEI === "werkstatt"
                    || window.LERNSTAND_SCHREIBT_SELBST === true);

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
      '#melde-karte .blasenbild{display:block;max-width:100%;max-height:180px;border-radius:10px;'+
      'margin-top:8px;object-fit:contain;background:#f4f6fa}' +
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
        // Nur beim Oeffnen von selbst fragen. Mitten im Spiel waere ein
        // Fenster vor der Nase eine Stoerung - da genuegt der rote Punkt.
        if (!schonGefragt) { schonGefragt = true; offenesAnsprechen(); }
      })
      .catch(function(){});
  }

  /* ---------- Offene Punkte von selbst ansprechen ----------
     Ein roter Punkt wird übersehen. Wenn etwas offen ist - eine Antwort
     ungelesen, oder ein Bild ohne ein Wort dazu - fragen wir beim Öffnen
     einmal freundlich nach, statt darauf zu warten, dass das Kind von sich
     aus nachschaut. Höchstens einmal pro Tag und Faden. */

  var ANGESPROCHEN = "lernstand-angesprochen";
  var schonGefragt = false;

  function schonAngesprochen(id){
    try {
      var d = JSON.parse(localStorage.getItem(ANGESPROCHEN) || "{}");
      return d[id] === new Date().toISOString().slice(0,10);
    } catch(e){ return false; }
  }
  function ansprechenVermerken(id){
    try {
      var d = JSON.parse(localStorage.getItem(ANGESPROCHEN) || "{}");
      d[id] = new Date().toISOString().slice(0,10);
      localStorage.setItem(ANGESPROCHEN, JSON.stringify(d));
    } catch(e){}
  }

  function offenesAnsprechen(){
    if (document.getElementById("melde-huelle")) return;

    // 1. Eine ungelesene Antwort - die soll das Kind sehen.
    var antwort = meineFaeden.filter(function(f){
      return f.ungelesenKind && !schonAngesprochen(f.id);
    })[0];
    if (antwort){
      ansprechenVermerken(antwort.id);
      setTimeout(function(){ fadenZeigen(antwort); }, 1400);
      return;
    }

    // 2. Ein Bild ohne ein Wort dazu - da fehlt uns die Hälfte.
    var stumm = meineFaeden.filter(function(f){
      if (f.status === "erledigt" || schonAngesprochen(f.id)) return false;
      var v = f.verlauf || [];
      if (v.length !== 1) return false;                 // schon im Gespräch
      return v[0].hatBild && !(v[0].text || "").trim();
    })[0];
    if (stumm){
      ansprechenVermerken(stumm.id);
      setTimeout(function(){ nachBildFragen(stumm); }, 1400);
    }
  }

  // Das Bild zeigen und fragen, was daran nicht stimmt.
  function nachBildFragen(faden){
    if (document.getElementById("melde-huelle")) return;
    var h = document.createElement("div");
    h.id = "melde-huelle";
    h.innerHTML =
      '<div id="melde-karte">' +
        '<h3>Kurze Frage zu deinem Bild</h3>' +
        '<p class="u">Du hast mir dieses Bild geschickt, aber nichts dazugeschrieben. ' +
        'Was stimmt da nicht? Ein Satz reicht – dann kann ich es reparieren.</p>' +
        '<img id="melde-altbild" alt="Dein Bild" style="max-width:100%;max-height:200px;' +
          'border-radius:12px;display:block;margin-bottom:12px;object-fit:contain;background:#f4f6fa">' +
        '<textarea id="melde-text" maxlength="1500" placeholder="Zum Beispiel: Der Knopf reagiert nicht, wenn ich …"></textarea>' +
        '<button type="button" class="schicken" id="melde-schicken">Abschicken</button>' +
        '<button type="button" class="zurueck" id="melde-spaeter">Später</button>' +
      '</div>';
    document.body.appendChild(h);

    bildHolen(faden.id, 0, function(datenUrl){
      var i = h.querySelector("#melde-altbild");
      if (!i) return;
      if (datenUrl) i.src = datenUrl; else i.remove();
    });

    h.addEventListener("click", function(e){ if (e.target === h) h.remove(); });
    h.querySelector("#melde-spaeter").addEventListener("click", function(){ h.remove(); });
    h.querySelector("#melde-schicken").addEventListener("click", function(){
      antwortSchicken(h, faden);
    });
    setTimeout(function(){ h.querySelector("#melde-text").focus(); }, 60);
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
               (n.hatBild ? '<img class="blasenbild" data-nr="' + (n.nr || 0) + '" alt="Dein Bild">' : "") +
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

    Array.prototype.forEach.call(h.querySelectorAll(".blasenbild"), function (i) {
      bildHolen(faden.id, i.getAttribute("data-nr"), function (d) {
        if (d) i.src = d; else i.remove();
      });
    });

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

  // Ein Bild aus dem eigenen Faden holen. Der Server prueft, dass es dem Kind
  // gehoert; hier interessiert nur, ob eins ankommt.
  function bildHolen(fadenId, nr, fertig) {
    fetch("/api/melden?meine=1&kind=" + encodeURIComponent(KIND) +
          "&bild=" + encodeURIComponent(fadenId + ":" + nr), { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) { fertig(j && j.ok ? j.bild : null); })
      .catch(function () { fertig(null); });
  }

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
        art: gewaehlteArt, wo: location.pathname, titel: document.title || "",
        geraet: geraet()
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

  // Frueher stand hier "if (NUR_MELDEN) return;". Damit fielen auf dem Hub,
  // in der Werkstatt und in Helenas Trainer auch der Anwesenheits-Puls und die
  // Geraeteangabe weg - der Waechter vor dem Ausrollen sah diese Seiten also
  // gar nicht. NUR_MELDEN schaltet jetzt nur noch die automatische
  // Besuchs-Runde ab, weiter unten an der einen Stelle, wo sie entsteht.

  // Auf welchem Gerät wird gespielt? Das muss man ein Kind nicht fragen -
  // der Browser weiß es. Bewusst nur eine kurze, lesbare Beschreibung und
  // keine vollständige Browser-Kennung: Die wäre ein Fingerabdruck, und für
  // Usability-Fragen reicht "iPad, 1024x768, Touch" vollkommen.
  function geraet() {
    try {
      var u = navigator.userAgent || "";
      var art =
        /iPad/i.test(u) || (/Macintosh/i.test(u) && navigator.maxTouchPoints > 1) ? "iPad" :
        /iPhone|iPod/i.test(u) ? "iPhone" :
        /Android/i.test(u) ? (/Mobile/i.test(u) ? "Android-Handy" : "Android-Tablet") :
        /Macintosh|Mac OS X/i.test(u) ? "Mac" :
        /Windows/i.test(u) ? "Windows-PC" :
        /CrOS/i.test(u) ? "Chromebook" :
        /Linux/i.test(u) ? "Linux" : "unbekannt";
      var browser =
        /EdgA?\//i.test(u) ? "Edge" :
        /OPR\//i.test(u) ? "Opera" :
        /Firefox\//i.test(u) ? "Firefox" :
        /CriOS|Chrome\//i.test(u) ? "Chrome" :
        /Safari\//i.test(u) ? "Safari" : "";
      // Bisher stand hier nur die Bildschirmgroesse. Die ist auf dem iPad fest
      // (820x1180), egal wie er gehalten wird - fuer das Layout zaehlt aber
      // das FENSTER. Beides steht jetzt drin: das Fenster sagt, wogegen ich
      // pruefen muss, der Schirm sagt, welches Geraet es ist.
      var fb = window.innerWidth || 0, fh = window.innerHeight || 0;
      var sb = window.screen ? window.screen.width : 0;
      var sh = window.screen ? window.screen.height : 0;
      var tasten = (navigator.maxTouchPoints || 0) > 0 ? "Touch" : "Maus";
      return [art, browser, "Fenster " + fb + "x" + fh,
              (sb ? "Schirm " + sb + "x" + sh : ""), tasten].filter(Boolean).join(" \u00B7 ");
    } catch (e) { return ""; }
  }

  var begonnen = Date.now();
  var aufgaben = [];
  var gesendet = false;

  /* ---------- Aktive Zeit ----------
     Wanduhrzeit ist keine Lernzeit. Wer eine Seite offen liegen lässt und
     weggeht, hat nicht gelernt - bisher zählte das trotzdem mit. Gezählt wird
     jetzt nur, solange die Seite sichtbar ist UND in den letzten Minuten
     etwas passiert ist.

     Die Schonfrist ist mit Absicht grosszügig: Ein Kind, das eine Aufgabe
     liest und nachdenkt, rührt sich zwei Minuten lang nicht - das ist die
     wertvollste Zeit überhaupt und darf nicht als Pause gelten. Erst danach
     hält die Uhr an und läuft bei der nächsten Regung weiter. */

  var PAUSE_AB = 120000;                 // zwei Minuten ohne Regung
  var aktivMs = 0, laeuftSeit = 0, letzteRegung = Date.now();

  function uhrAnhalten(bis) {
    if (!laeuftSeit) return;
    aktivMs += Math.max(0, (bis || Date.now()) - laeuftSeit);
    laeuftSeit = 0;
  }
  function uhrStarten() {
    if (laeuftSeit || document.hidden) return;
    laeuftSeit = Date.now();
  }
  function regung() { letzteRegung = Date.now(); uhrStarten(); }

  ["pointerdown", "keydown", "touchstart", "wheel", "scroll", "click"].forEach(function (e) {
    document.addEventListener(e, regung, { passive: true, capture: true });
  });
  setInterval(function () {
    if (!laeuftSeit) return;
    if (Date.now() - letzteRegung > PAUSE_AB) uhrAnhalten(letzteRegung + PAUSE_AB);
  }, 5000);

  function aktiveSekunden() {
    // Die Deckelung beim Ablesen rechnen, nicht erst beim naechsten Takt:
    // Sonst meldete eine Runde, die mitten in einer Pause endet, bis zu fuenf
    // Sekunden zu viel.
    var bis = Math.min(Date.now(), letzteRegung + PAUSE_AB);
    return Math.round((aktivMs + (laeuftSeit ? Math.max(0, bis - laeuftSeit) : 0)) / 1000);
  }
  function wanduhrSekunden() { return Math.round((Date.now() - begonnen) / 1000); }

  uhrStarten();

  // "klasse3-deutsch-praedikat-springer" -> Fach "deutsch", Thema "praedikat springer"
  function ausDateiname() {
    var t = DATEI.split("-");
    if (t[0] && /^klasse\d/i.test(t[0])) t.shift();
    var fach = t.shift() || "";
    return { fach: fach, thema: t.join(" ").replace(/\d+d$/, "").trim() || fach };
  }

  window.lernstand = {
    // Wer seine Runde selbst zusammenstellt (Helenas Vokabeltrainer), soll
    // dieselbe Geraeteangabe verwenden - sonst fehlt sie dort ganz.
    geraet: geraet,

    // Dieselbe ehrliche Uhr fuer alle: Werkstatt und Vokabeltrainer messen
    // ihre Runden damit, statt jeder mit einer eigenen Wanduhr.
    aktiveSekunden: aktiveSekunden,
    wanduhrSekunden: wanduhrSekunden,
    // Am Anfang einer Runde auf null stellen.
    uhrZuruecksetzen: function () { aktivMs = 0; laeuftSeit = 0; begonnen = Date.now(); regung(); },

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
    if (NUR_MELDEN) return;   // Hub, Werkstatt und Vokabeltrainer schreiben selbst mit
    if (gesendet) return;
    uhrAnhalten();
    var sekunden = aktiveSekunden();
    // Unter einer halben Minute war es kein Spielen, sondern ein Blick.
    if (sekunden < 30) return;
    gesendet = true;

    var d = ausDateiname();
    var runde = {
      spielId: DATEI, titel: document.title || DATEI,
      quelle: DATEI, fach: d.fach, thema: d.thema, lernbereich: "",
      sekunden: sekunden,
      // Getrennt ausweisen, was getrennt gehoert: gelernt, pausiert, gebaut.
      zeitart: "lernen",
      pause: Math.max(0, wanduhrSekunden() - sekunden),
      geraet: geraet(),
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

  /* ---------- Puls: "hier spielt gerade jemand" ----------
     Damit kein Update ausgerollt wird, während ein Kind mitten in einer
     Aufgabe steckt. Der Wächter auf Dennys Rechner fragt vor dem Hochladen
     nach und wartet, wenn jemand da ist.

     Bewusst sparsam: alle drei Minuten, und nur solange die Seite wirklich
     sichtbar ist. Ein vergessener Tab im Hintergrund pulst nicht - sonst
     würde ein offenes iPad in der Ecke jedes Update für immer blockieren. */

  var PULS_TAKT = 180000;                 // 3 Minuten
  var pulsUhr = null, binGemeldet = false;

  function pulsSchicken(weg) {
    var text = JSON.stringify({ kind: KIND, weg: !!weg });
    try {
      if (weg && navigator.sendBeacon) {
        navigator.sendBeacon("/api/aktiv", new Blob([text], { type: "application/json" }));
      } else {
        fetch("/api/aktiv", { method: "POST", credentials: "same-origin",
          headers: { "content-type": "application/json" }, body: text,
          keepalive: !!weg }).catch(function () {});
      }
    } catch (e) {}
  }

  function pulsAn() {
    if (pulsUhr) return;
    binGemeldet = true;
    pulsSchicken(false);
    pulsUhr = setInterval(function () { pulsSchicken(false); }, PULS_TAKT);
  }

  function pulsAus() {
    if (pulsUhr) { clearInterval(pulsUhr); pulsUhr = null; }
    // Sauber abmelden, damit der Wächter nicht acht Minuten Stille abwartet.
    if (binGemeldet) { binGemeldet = false; pulsSchicken(true); }
  }

  if (!document.hidden) pulsAn();
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) pulsAus(); else pulsAn();
  });

  window.addEventListener("pagehide", function () { uhrAnhalten(); senden(); pulsAus(); });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { uhrAnhalten(); senden(); } else { regung(); }
  });
})();
