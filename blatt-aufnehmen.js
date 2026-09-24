/* Ein Blatt ins Schulheft legen - EINMAL gebaut, von mehreren Orten benutzt.
 *
 * Denny am 23.09.2026 zur Kachel "Heft abfotografieren": "Ich glaube nicht,
 * dass dies noch benötigt wird." Richtig - aber das Hochladen war bis dahin
 * NUR dort zu Hause. Also wandert es dorthin, wo es hingehört: ins Schulheft
 * selbst. Danach braucht es die Kachel nicht mehr.
 *
 * Dieselbe Regel wie beim Ferien-Band, beim Spielmotor und beim Strom-Leser:
 * Der Ablauf steht an EINER Stelle. Wer hier etwas ändert, ändert es für alle
 * Orte - und misst alle.
 *
 * Gebraucht wird:
 *   <script src="/strom.js"></script>          (verkleinert das Foto)
 *   <script src="/blatt-aufnehmen.js"></script>
 *
 * Benutzt wird es so:
 *
 *   LWBlatt.einbauen(document.getElementById("aufnehmen"), {
 *     kind: "paul",
 *     faecher: [...],              // {schluessel, text}
 *     plan: window.PAUL_PLAN,      // optional, sortiert die Fächer
 *     fertig: function(antwort){ ... }   // nach dem Ablegen
 *   });
 */
(function (global) {
  "use strict";

  // Aus Pauls echtem Stundenplan (Klasse 4bG, geprüft 22.09.2026). Kunst, WG,
  // Sport und Schwimmen fehlen mit Absicht: dort entsteht nichts zum Üben.
  var FAECHER = [
    { schluessel: "mathe",    text: "🔢 Mathe" },
    { schluessel: "deutsch",  text: "📖 Deutsch" },
    { schluessel: "hsu",      text: "🌍 HSU" },
    { schluessel: "englisch", text: "🇬🇧 Englisch" },
    { schluessel: "rel",      text: "🕊️ Religion/Ethik" },
    { schluessel: "musik",    text: "🎵 Musik" },
    { schluessel: "anderes",  text: "✏️ Etwas anderes" }
  ];

  var STIL = [
    ".lwb{background:var(--karte,#fff);border-radius:22px;padding:18px;",
    "  box-shadow:0 1px 2px rgba(20,22,40,.05),0 10px 28px rgba(20,22,40,.07)}",
    ".lwb h2{font:800 20px var(--rund,inherit);margin:0 0 4px}",
    ".lwb .u{color:var(--muted,#6b7280);font-size:15px;margin:0 0 14px}",
    ".lwb .frage{font:600 16.5px var(--rund,inherit);margin-top:16px}",
    ".lwb .reihe{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px;align-items:center}",
    ".lwb button,.lwb .chip{appearance:none;border:1.5px solid var(--line,#e4e7f0);",
    "  background:var(--karte,#fff);color:var(--ink,#1b1c22);border-radius:999px;",
    "  padding:10px 14px;font:600 15.5px inherit;cursor:pointer;min-height:44px}",
    ".lwb .chip.an{background:var(--paul,#4f46e5);border-color:var(--paul,#4f46e5);color:#fff}",
    ".lwb input[type=date]{font:600 16.5px inherit;padding:10px 12px;border-radius:14px;",
    "  border:1.5px solid var(--line,#e4e7f0);background:var(--karte,#fff);",
    "  color:var(--ink,#1b1c22);min-height:44px}",
    ".lwb .knoepfe{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}",
    /* Variante A, gewaehlt von Denny am 23.09.2026: Die Karte zerfaellt in drei
       Abschnitte mit Trennlinie, und "Wo stand das?" bekommt eine ANDERE Form
       als das Hochladen - breite Zeilen statt gestrichelter Kacheln. Denny:
       "Es erscheint eigentlich, als wuerden die fuenf Kacheln zusammengehoeren."
       Sie taten es optisch auch: beide Gruppen waren .knopf. */
    ".lwb .trenn{height:1px;background:var(--line,#e4e7f0);margin:20px -18px 0}",
    ".lwb .zeile{display:flex;align-items:center;gap:13px;width:100%;text-align:left;",
    "  border:1.5px solid var(--line,#e4e7f0);background:var(--vertief,#f7f8fc);border-radius:16px;",
    "  padding:13px 15px;margin-top:10px;cursor:pointer;color:var(--ink,#1b1c22);font:inherit;min-height:60px}",
    ".lwb .zeile .z{font-size:26px;line-height:1}",
    ".lwb .zeile b{display:block;font:700 16.5px var(--rund,inherit)}",
    ".lwb .zeile small{color:var(--lwb-neben,#5b6270);font-size:14px}",
    ".lwb .zeile .haken{margin-left:auto;font-size:19px;opacity:0;color:var(--paul,#4f46e5)}",
    ".lwb .zeile.an{border-color:var(--paul,#4f46e5);background:rgba(79,70,229,.13)}",
    ".lwb .zeile.an .haken{opacity:1}",
    ".lwb .knopf{border:2px dashed #cdd3e4;border-radius:16px;padding:15px 8px;text-align:center;",
    "  font:600 15px inherit;cursor:pointer;background:transparent;min-height:44px}",
    ".lwb .knopf .z{display:block;font-size:24px;margin-bottom:5px}",
    ".lwb .seiten{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}",
    ".lwb .seite{position:relative;width:78px;height:78px;border-radius:12px;overflow:hidden;",
    "  background:#f1f4fa}",
    ".lwb .seite img{width:100%;height:100%;object-fit:cover}",
    ".lwb .seite .weg{position:absolute;top:3px;right:3px;width:26px;height:26px;border-radius:50%;",
    "  background:rgba(20,22,40,.72);color:#fff;border:none;font-size:15px;cursor:pointer;padding:0}",
    ".lwb .los{width:100%;margin-top:16px;border:none;border-radius:16px;",
    "  background:var(--paul,#4f46e5);color:#fff;padding:15px;font:700 17.5px var(--rund,inherit);",
    "  cursor:pointer;min-height:52px}",
    ".lwb .los[disabled]{background:#b9bcd4;cursor:default}",
    ".lwb .melden{margin-top:12px;border-radius:14px;padding:12px 14px;font-size:15.5px}",
    ".lwb .melden.fehler{background:#fef2f2;border:1.5px solid #fecaca;color:#7f1d1d}",
    ".lwb .melden.gut{background:#f0fdf4;border:1.5px solid #bbf7d0;color:#14532d}",
    ".lwb .verborgen{display:none}",
    /* Eigene Nebenfarbe: --muted ist auf den hellen Seiten zu blass (4,27:1,
       gemessen 23.09.2026 an den Fundkarten). 5,4:1 statt darunter. */
    ".lwb{--lwb-neben:#5b6270}",
    "html[data-theme=\"dark\"] .lwb{--lwb-neben:#a7adc4}",
    /* An der WAHL, nicht am Geraet (23.09.2026): Pauls Schulheft folgt
       data-theme wie seine uebrigen Seiten. Am Geraet zu haengen hiesse, dass
       der Aufnahme-Ablauf dunkel wird, waehrend die Seite um ihn herum hell
       ist - genau der Wechsel, den Denny beanstandet hat. */
    "html[data-theme=\"dark\"] .lwb .knopf{border-color:#3a3e52}",
    "html[data-theme=\"dark\"] .lwb .seite{background:#262a38}",
    "html[data-theme=\"dark\"] .lwb .melden.fehler{background:#2a1416;border-color:#5b2226;color:#fecaca}",
    "html[data-theme=\"dark\"] .lwb .melden.gut{background:#0f2c1c;border-color:#1f5137;color:#b6f0cd}"
  ].join("");

  function stilEinmal() {
    if (document.getElementById("lwb-stil")) return;
    var s = document.createElement("style");
    s.id = "lwb-stil";
    s.textContent = STIL;
    document.head.appendChild(s);
  }

  function iso(minus) {
    var d = new Date();
    d.setDate(d.getDate() - (minus || 0));
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
           "-" + String(d.getDate()).padStart(2, "0");
  }
  function deutsch(t) {
    var x = String(t || "").split("-");
    return x.length === 3 ? (+x[2]) + "." + (+x[1]) + "." + x[0] : String(t || "");
  }

  function einbauen(kasten, opt) {
    if (!kasten) return null;
    opt = opt || {};
    var kind = opt.kind || "paul";
    var faecher = opt.faecher || FAECHER;
    stilEinmal();

    /* art: "heft" oder "uebung" - Dennys Entwurf vom 23.09.2026, zwei Kacheln
       nach der Fachwahl. Der Grund steht in der Ansage der Lehrerin am
       Elternabend: "Es wird das gefragt, was im Heft enthalten ist." Aus dem
       Heft wird abgefragt, aus Uebungsblaettern wird geuebt - und diese
       Unterscheidung kann kein Modell erraten, die weiss nur das Kind.
       KEINE Vorauswahl, aus demselben Grund, aus dem am 22.09.2026 "Weiss ich
       nicht" bei den Faechern gestrichen wurde: Paul soll wissen, wohin sein
       Blatt gehoert. */
    var seiten = [], fach = "", art = "", laeuft = false;

    kasten.className = "lwb";
    kasten.innerHTML =
      '<h2>📸 Neues Blatt</h2>' +
      '<p class="u">Heft, Zettel oder Arbeitsblatt – fotografier, was du in der Schule gemacht hast.</p>' +
      '<div class="frage">Wann war das?</div>' +
      '<div class="reihe">' +
        '<input type="date" class="lwb-datum" aria-label="Datum des Blattes">' +
        '<button type="button" class="chip an" data-tag="0">Heute</button>' +
        '<button type="button" class="chip" data-tag="1">Gestern</button>' +
      '</div>' +
      '<div class="frage">Zu welchem Fach gehört das?</div>' +
      '<div class="reihe lwb-faecher"></div>' +
      '<div class="trenn"></div>' +
      '<div class="frage">Wo stand das?</div>' +
      '<div class="lwb-arten">' +
        '<button type="button" class="zeile" data-art="heft">' +
          '<span class="z">\uD83D\uDCD3</span>' +
          '<span><b>In meinem Schulheft</b><small>Daraus wird in der Probe gefragt</small></span>' +
          '<span class="haken">✓</span></button>' +
        '<button type="button" class="zeile" data-art="uebung">' +
          '<span class="z">\uD83D\uDCC4</span>' +
          '<span><b>Ein Übungsblatt</b><small>Zum Üben dazu</small></span>' +
          '<span class="haken">✓</span></button>' +
      '</div>' +
      '<div class="trenn"></div>' +
      '<div class="frage">Und jetzt dein Blatt</div>' +
      '<div class="knoepfe">' +
        '<div class="knopf" data-holen="kamera"><span class="z">📸</span>Fotografieren</div>' +
        '<div class="knopf" data-holen="datei"><span class="z">📄</span>Datei oder PDF</div>' +
        '<div class="knopf" data-holen="bild"><span class="z">🖼️</span>Bild auswählen</div>' +
      '</div>' +
      '<input type="file" class="lwb-kamera verborgen" accept="image/*" capture="environment">' +
      '<input type="file" class="lwb-bild verborgen" accept="image/*" multiple>' +
      '<input type="file" class="lwb-datei verborgen" accept="image/*,application/pdf" multiple>' +
      '<div class="seiten lwb-seiten"></div>' +
      '<div class="melden verborgen lwb-melden"></div>' +
      '<button class="los lwb-los" disabled>Erst dein Blatt fotografieren</button>';

    var $ = function (k) { return kasten.querySelector(k); };
    var datum = $(".lwb-datum");
    datum.value = iso(0);

    // ---- Fächer, vom Stundenplan sortiert ------------------------------
    var reihe = $(".lwb-faecher");
    faecher.forEach(function (f) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip";
      b.setAttribute("data-fach", f.schluessel);
      b.textContent = f.text;
      b.addEventListener("click", function () {
        fach = f.schluessel;
        Array.prototype.forEach.call(reihe.children, function (x) { x.classList.toggle("an", x === b); });
        knopf();
      });
      reihe.appendChild(b);
    });

    // ---- Schulheft oder Uebungsblatt ------------------------------------
    Array.prototype.forEach.call(kasten.querySelectorAll("[data-art]"), function (b) {
      b.addEventListener("click", function () {
        art = b.getAttribute("data-art");
        Array.prototype.forEach.call(kasten.querySelectorAll("[data-art]"), function (x) {
          x.classList.toggle("an", x === b);
        });
        knopf();
      });
    });

    /* Die Reihenfolge der Faecher: haeufigstes im Stundenplan zuerst.
     *
     * Denny am 23.09.2026: "Die Ansortierung von den Faechern macht sicher Sinn
     * nach Haeufigkeit im Stundenplan." Vorher standen die Faecher DES TAGES
     * vorn und trugen dazu einen violetten Rahmen - am Mittwoch waren das vier
     * von sieben, und Denny las sie als schon gewaehlt: "Ich finde es unschoen,
     * dass Englisch, Mathe, Deutsch, HSU so aussehen, als waeren sie schon
     * vorausgewaehlt."
     *
     * Jetzt steht die Reihe FEST - sie springt beim Datumswechsel nicht mehr,
     * und keine Markierung behauptet eine Auswahl, die es nicht gibt.
     * Gerechnet wird in stundenplan.js; ohne Plan bleibt die Grundreihenfolge. */
    function planSortieren() {
      var plan = opt.plan;
      if (!plan || !plan.nachHaeufigkeit) return;
      var chips = Array.prototype.slice.call(reihe.querySelectorAll("[data-fach]"));
      var reihenfolge = plan.nachHaeufigkeit(chips.map(function (c) {
        return c.getAttribute("data-fach");
      }));
      reihenfolge.forEach(function (s) {
        chips.forEach(function (c) { if (c.getAttribute("data-fach") === s) reihe.appendChild(c); });
      });
    }

    function tagKnoepfe() {
      var h = iso(0), g = iso(1);
      Array.prototype.forEach.call(kasten.querySelectorAll("[data-tag]"), function (k) {
        k.classList.toggle("an", datum.value === (k.getAttribute("data-tag") === "0" ? h : g));
      });
    }
    Array.prototype.forEach.call(kasten.querySelectorAll("[data-tag]"), function (k) {
      k.addEventListener("click", function () {
        datum.value = iso(k.getAttribute("data-tag") === "0" ? 0 : 1);
        tagKnoepfe();
      });
    });
    datum.addEventListener("change", tagKnoepfe);
    tagKnoepfe(); planSortieren();

    // ---- Seiten ---------------------------------------------------------
    Array.prototype.forEach.call(kasten.querySelectorAll("[data-holen]"), function (k) {
      k.addEventListener("click", function () {
        $(".lwb-" + k.getAttribute("data-holen")).click();
      });
    });
    ["kamera", "bild", "datei"].forEach(function (w) {
      $(".lwb-" + w).addEventListener("change", function (e) {
        Array.prototype.forEach.call(e.target.files || [], nehmen);
        e.target.value = "";
      });
    });

    function nehmen(datei) {
      /* Ein Blatt je Eintrag - hoechstens Vorder- und Rueckseite.
         Denny am 23.09.2026: "Hat den Vorteil, dass er selber gar nicht
         durcheinanderkommt ... Wenn man 25 Seiten liest, kann sicher was
         untergehen, bei ein bis zwei Seiten nicht." Stand vorher bei 6,
         der Server deckelt seit demselben Tag ebenfalls bei 2 (MAX_SEITEN). */
      if (seiten.length >= 2) {
        melde("Ein Blatt auf einmal - Vorder- und Rückseite. Das nächste legst du gleich danach in die Ablage.", "fehler");
        return;
      }
      var leser = new FileReader();
      leser.onload = function () {
        seiten.push({ url: String(leser.result), name: datei.name || "" });
        malen(); knopf();
      };
      leser.readAsDataURL(datei);
    }

    function malen() {
      var k = $(".lwb-seiten");
      k.innerHTML = "";
      seiten.forEach(function (s, i) {
        var d = document.createElement("div");
        d.className = "seite";
        d.innerHTML = (s.url.indexOf("data:application/pdf") === 0
          ? '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:28px">📄</div>'
          : '<img alt="Seite ' + (i + 1) + '" src="' + s.url + '">') +
          '<button class="weg" type="button" aria-label="Seite entfernen">×</button>';
        d.querySelector(".weg").addEventListener("click", function () {
          seiten.splice(i, 1); malen(); knopf();
        });
        k.appendChild(d);
      });
    }

    function melde(text, art) {
      var m = $(".lwb-melden");
      if (!m) return;
      m.textContent = text || "";
      // Die Kennklasse MUSS bleiben - sonst findet der naechste Aufruf das
      // Feld nicht mehr wieder (und die Messung auch nicht).
      m.className = "lwb-melden melden " + (art || "") + (text ? "" : " verborgen");
    }

    function knopf() {
      var l = $(".lwb-los");
      if (!seiten.length) { l.disabled = true; l.textContent = "Erst dein Blatt fotografieren"; return; }
      if (!fach) { l.disabled = true; l.textContent = "Sag mir noch, welches Fach"; return; }
      if (!art) { l.disabled = true; l.textContent = "Schulheft oder Übungsblatt?"; return; }
      l.disabled = false;
      l.textContent = seiten.length > 1 ? seiten.length + " Seiten in die Ablage legen" : "In die Ablage legen";
    }

    /* Schritt 2 des zweistufigen Ablegens.
     *
     * ⚠️ Das Blatt ist zu diesem Zeitpunkt SCHON im Heft. Was hier
     * schiefgeht, kostet nur den Inhalt - und den holt ?nachtragen=1
     * spaeter nach. Deshalb steht hier nie "Fehler", sondern ein Satz, der
     * stimmt: sein Blatt ist da.
     *
     * Ein Versuch, kein zweiter: Der Server liest ein Blatt mit Inhalt
     * ohnehin nicht noch einmal (Kostenriegel), ein Wiederholen waere also
     * nur Wartezeit. */
    function lesenAnstossen(abgelegt) {
      fetch("/api/schulstoff?lesen=1", {
        method: "POST", credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: kind, id: abgelegt.id })
      })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) {
          melde("✅ Ist in deiner Ablage – " + deutsch(abgelegt.datum) +
                ". Durchlesen hat gerade nicht geklappt, das hole ich nach.", "gut");
          if (opt.fertig) { try { opt.fertig(abgelegt); } catch (e) {} }
          return;
        }
        melde("✅ Ist in deiner Ablage – " + deutsch(j.datum) +
              (j.titel ? ", „" + j.titel + "“" : "") + ".", "gut");
        /* Alles, was Schritt 2 herausgefunden hat, geht an denselben
           Empfaenger wie beim einstufigen Weg - Fundkarten, Datumsfrage,
           Zwilling. Die id kommt aus Schritt 1. */
        if (opt.fertig) {
          try { opt.fertig(Object.assign({}, abgelegt, j, { lesenOffen: false })); }
          catch (e) {}
        }
      })
      .catch(function () {
        melde("✅ Ist in deiner Ablage – " + deutsch(abgelegt.datum) +
              ". Durchlesen hat gerade nicht geklappt, das hole ich nach.", "gut");
        if (opt.fertig) { try { opt.fertig(abgelegt); } catch (e) {} }
      });
    }

    // ---- Ablegen --------------------------------------------------------
    $(".lwb-los").addEventListener("click", function () {
      if (laeuft || !seiten.length || !fach || !art) return;
      laeuft = true;
      var l = $(".lwb-los");
      l.disabled = true; l.textContent = "Ich lege es ab …";
      melde("", "");

      // Verkleinern über dieselbe Stelle wie beim Spielbau: 1,4 MB über ein
      // Handynetz sind am 22.09.2026 abgerissen.
      var vorbereitet = (global.LWStrom && global.LWStrom.kleinerMachen)
        ? global.LWStrom.kleinerMachen(seiten.map(function (s) { return s.url; }))
        : Promise.resolve(seiten.map(function (s) { return s.url; }));

      vorbereitet.then(function (bilder) {
        return fetch("/api/schulstoff", {
          method: "POST", credentials: "same-origin",
          headers: { "content-type": "application/json" },
          /* Zweistufig (Dennys Wahl vom 24.09.2026): erst ablegen, dann
             lesen. Seit das Blatt mit Opus 5.5 gelesen wird, dauert das
             Lesen rund 30 s statt 1,5 - und darauf soll Paul nicht warten,
             nur damit sein Blatt ankommt. Es ist nach ~2 s da. */
          body: JSON.stringify({ kind: kind, fach: fach, art: art, datum: datum.value,
                                 seiten: bilder, zweistufig: true })
        });
      })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j }; }); })
      .then(function (a) {
        if (a.status === 401) { laeuft = false; l.disabled = false; knopf(); melde("Melde dich bitte nochmal an.", "fehler"); return; }
        if (!a.j || !a.j.ok) {
          laeuft = false; l.disabled = false; knopf();
          melde((a.j && a.j.fehler) || "Das hat nicht geklappt. Dein Foto ist noch da – probier es nochmal.", "fehler");
          return;
        }
        /* Das Blatt liegt JETZT im Heft - das Foto darf weg, der Knopf
           frei werden. Was noch fehlt, ist nur der Inhalt. */
        laeuft = false; l.disabled = false;
        seiten = []; art = "";
        Array.prototype.forEach.call(kasten.querySelectorAll("[data-art]"), function (x) { x.classList.remove("an"); });
        malen(); knopf();
        melde("✅ Ist in deiner Ablage – " + deutsch(a.j.datum) +
              (a.j.titel ? ", „" + a.j.titel + "“" : "") + ".", "gut");

        if (!a.j.lesenOffen) {
          if (opt.fertig) { try { opt.fertig(a.j); } catch (e) {} }
          return;
        }
        /* Schritt 2. Er darf scheitern, ohne dass etwas verloren geht -
           das Blatt ist abgelegt, und ?nachtragen=1 holt den Inhalt
           spaeter nach. Deshalb kein "Fehler", nur ein ehrlicher Satz. */
        melde("✅ Ist in deiner Ablage. Ich lese es gerade durch …", "gut");
        /* Die Liste darunter sofort neu laden: Sonst stand dort "Alle 0",
           waehrend oben "Ist in deiner Ablage" stand (Denny, 25.09.2026). */
        if (opt.abgelegt) { try { opt.abgelegt(a.j); } catch (e) {} }
        lesenAnstossen(a.j);
      })
      .catch(function () {
        laeuft = false; l.disabled = false; knopf();
        melde("Die Verbindung ist abgerissen. Dein Foto ist noch da – tipp nochmal.", "fehler");
      });
    });

    knopf();
    return { zuruecksetzen: function () { seiten = []; malen(); knopf(); melde("", ""); } };
  }

  global.LWBlatt = { einbauen: einbauen, FAECHER: FAECHER };
})(window);
