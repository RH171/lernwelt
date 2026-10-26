/* Prüf-Reiter: "Ich habe nachgesehen" (14.10.2026)
 *
 * Dennys Wahl am 14.10.2026, Variante C, nur für Paul: Jedes Blatt, das
 * Paul hochlädt, wird sofort nachgesehen. Die Karten erscheinen direkt im
 * Hochladen-Ablauf (paul/schulstoff.html); was offen bleibt, steht als
 * blauer Knopf "Nachgesehen" ganz oben auf paul/index.html.
 *
 * Diese Datei kennt KEINE Lösung. Sie holt die Stellen über
 * /api/pruefreiter (ohne Lösung) und schickt Pauls Verbesserung zurück -
 * geprüft wird auf dem Server (functions/api/_pruefreiter.js).
 *
 *   LWPruef.hochladen(kasten, blattId)   nach dem Durchlesen eines Blattes
 *   LWPruef.startseite(knopf)            Knopf oben auf der Startseite
 *
 * Umbau 14.10.2026 nachmittags (Denny auf dem iPhone, alle vier Vorschläge
 * gewählt, dazu zwei Nachträge):
 *   - Fach sichtbar: Name, Zeichen und Farbe je Blatt (FACH unten).
 *   - Nach Blatt gruppiert (A): EIN Kasten je Blatt mit Vorschaubild, alle
 *     Stellen des Blattes darunter, keine doppelte Kopfzeile mehr.
 *   - Vorschau: Antippen öffnet das Blatt groß, mit Blättern bei mehreren Seiten.
 *   - Fortschritt (C): "2 von 5 verbessert", Runde = heutiger Tag (Server).
 *   - Sonnenknopf (D): in der Einblendung oben neben "Zurück"; der schwebende
 *     Knopf ist dort ausgeblendet, unten bleibt Platz für den 💬-Knopf.
 *   - 📌: "Auf der Pinnwand deiner Lehrerin steht:" und der Beweis: ihre
 *     Vorlagenzeile als Zitat und das Bild der Vorlage (über die API, nie als
 *     Datei im Web-Ordner).
 *
 * Fehlerkreis (14.10.2026, Denny: "umkringeln, wo der Fehler ist"): roter Kreis
 * um jede Stelle in Vorschau und Großansicht (/fehlerkreis.js), auch auf dem Bild
 * der Lehrerin. Fehlt einem Blatt der Ort, fragt diese Seite einmal nach
 * (POST aktion "orten") und malt nach. "📍 Zeig mir die Stelle" öffnet die
 * Großansicht vergrößert an genau diesem Kreis. Ist eine Stelle verbessert, wird
 * der Kreis grün mit der richtigen Antwort und "verbessert · durch Claude" -
 * das Foto selbst bleibt, wie es ist. Ohne /fehlerkreis.js: keine Kreise, sonst alles gleich.
 *
 * Nachrechnen (14.10.2026): Bringt der Server `nachrechnen: [blatt…]` (Matheblatt
 * ohne Feld-für-Feld-Abschrift), schickt diese Seite einmal POST aktion
 * "nachrechnen" und holt die Stellen danach neu. Neue Eingabeart "rest"
 * (9 R 2); `steht` = die Lehrerin hat dort schon geändert -> "Bei dir steht".
 *
 * Volllesen (15.10.2026, anleitung/125): alle drei Kinder. Das Kind kommt aus
 * window.LWPRUEF_KIND oder dem Pfad (/paul/, /helena/, /leon/), sonst Paul.
 * Neue Stellen 🔤 „Schau genau hin“ (art "schreiben"): ein Wort, das nicht so
 * auf dem Blatt steht (Wörterkasten, Abschreibtext, gedruckte Lösung, Vokabeln) -
 * das Kind vergleicht selbst und tippt sein Wort ein, geprüft wird auf dem Server.
 * Bringt der Server `volllesen: [blatt…]`, schickt diese Seite einmal POST aktion
 * "volllesen" (wie beim Nachrechnen) und holt die Stellen danach neu.
 */
(function () {
  "use strict";
  var KIND = (function () {
    var k = String(window.LWPRUEF_KIND || "").toLowerCase();
    if (/^(paul|helena|leon)$/.test(k)) return k;
    var m = /^\/(paul|helena|leon)\//.exec(location.pathname || "");
    return m ? m[1] : "paul";
  })();

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function tag(iso) {
    var t = String(iso || "").split("-");
    return t.length === 3 ? (+t[2]) + "." + (+t[1]) + "." : "";
  }
  /* Fächer wie in der Ablage (paul/schulstoff.html: ZEICHEN, KURZ) mit den
     Fachfarben von Pauls Startseite (paul/index.html: --deutsch, --mathe, ...).
     Die Farbe steht nur als Rand und Punkt, nie als Schriftgrund - so bleibt
     die Schrift in hell und dunkel lesbar. */
  var FACH = {
    mathe:    { n: "Mathe",          z: "🔢", c: "#10b981" },
    deutsch:  { n: "Deutsch",        z: "📖", c: "#4f46e5" },
    hsu:      { n: "HSU",            z: "🌍", c: "#f3960b" },
    englisch: { n: "Englisch",       z: "🇬🇧", c: "#ef4444" },
    franz:    { n: "Französisch",    z: "🇫🇷", c: "#2563eb" },
    geschichte: { n: "Geschichte",   z: "🏛️", c: "#b45309" },
    geo:      { n: "Geographie",     z: "🗺️", c: "#0d9488" },
    info:     { n: "Informatik",     z: "💻", c: "#7c3aed" },
    rel:      { n: "Religion/Ethik", z: "🕊️", c: "#0891b2" },
    religion: { n: "Religion/Ethik", z: "🕊️", c: "#0891b2" },
    musik:    { n: "Musik",          z: "🎵", c: "#8b5cf6" },
    anderes:  { n: "Anderes",        z: "✏️", c: "#64748b" }
  };
  function fachVon(k) { return FACH[k] || { n: "Ohne Fach", z: "📄", c: "#64748b" }; }

  var SCHILD = {
    rechnen:  '<span class="lwp-schild lwp-s-rechnen">🧮 Bitte nachrechnen</span>',
    pinnwand: '<span class="lwp-schild lwp-s-pinnwand">📌 Blatt der Lehrerin</span>',
    lehrerin: '<span class="lwp-schild lwp-s-lehrerin">✍️ Rot von deiner Lehrerin</span>',
    schreiben: '<span class="lwp-schild lwp-s-schreiben">🔤 Schau genau hin</span>'
  };

  function holen(blatt) {
    return fetch("/api/pruefreiter?kind=" + KIND + (blatt ? "&blatt=" + encodeURIComponent(blatt) : ""),
                 { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        /* Ein alter Server ohne diesen Weg antwortet mit der Startseite oder
           mit {ok:true} ohne Liste - dann gibt es nichts zu zeigen. */
        if (!j || !j.ok || !Array.isArray(j.stellen)) return { stellen: [], blaetter: 0 };
        /* Ein Server ohne Fortschritt (vor dem 14.10.2026 nachmittags): Runde = was offen ist. */
        var f = j.fortschritt;
        if (!f || !(f.gesamt >= j.stellen.length) || !(f.erledigt >= 0)) j.fortschritt = { erledigt: 0, gesamt: j.stellen.length };
        return j;
      })
      .catch(function () { return { stellen: [], blaetter: 0, fortschritt: { erledigt: 0, gesamt: 0 } }; });
  }
  function senden(stelle, aktion, antwort) {
    return fetch("/api/pruefreiter", {
      method: "POST", credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: KIND, stelle: stelle, aktion: aktion, antwort: antwort })
    }).then(function (r) { return r.json(); });
  }

  /* Eine Karte je Stelle. weg(id, endgueltig) meldet, dass die Karte geht:
     endgueltig = erledigt (verschwindet auch auf der Startseite),
     sonst "Später" (bleibt offen). */
  /* ---------- Großansicht: ein Bild bildschirmfüllend ----------
     o = { titel, seiten, holen(nr) -> Promise<url|null> }. Über allem, auch
     über den schwebenden Knöpfen; "✕ Schließen" 48 px, Esc, Blättern über
     /blatt-seiten.js (Pfeile, Wischen), wenn die Seite es geladen hat. */
  /* Fehlerkreis: je Blatt die Stellen (mit ort) und die grünen Verbesserungen;
     jede Vorschau dieses Blattes meldet sich hier an und malt bei Änderung neu. */
  var KR = {};
  function krBlatt(id) { return KR[id] || (KR[id] = { stellen: [], gruen: [], apis: [] }); }
  function krKreise(id) {
    var k = krBlatt(id);
    return window.LWKreis ? LWKreis.ausStellen(k.stellen, k.gruen) : [];
  }
  function krMalen(id) {
    var k = krBlatt(id), ks = krKreise(id);
    k.apis = k.apis.filter(function (a) { return a.ebene && a.ebene.isConnected; });
    k.apis.forEach(function (a) { a.setzen(ks); });
    k.stellen.forEach(function (s) { if (s._zeigMalen) s._zeigMalen(); });
    var z = document.querySelectorAll('.lwp-blattkasten[data-blatt="' + id + '"] .lwp-claude');
    Array.prototype.forEach.call(z, function (el) {
      el.hidden = !k.gruen.length;
      el.textContent = "✓ " + (k.gruen.length === 1 ? "1 Stelle" : k.gruen.length + " Stellen") + " verbessert · durch Claude";
    });
  }
  /* Nach "Verbessert ✓" bzw. richtig nachgerechnet: roter Kreis weg, grüner da. */
  function krErledigt(s, gruen) {
    var id = s.blatt && s.blatt.id; if (!id) return;
    var k = krBlatt(id);
    k.stellen = k.stellen.filter(function (x) { return x.id !== s.id; });
    (gruen || []).forEach(function (g) { k.gruen.push(g); });
    krMalen(id);
  }
  /* Orte nachholen: ein Blatt nach dem anderen (ein Schreibvorgang je Blatt). */
  function orteHolen(ids, stellen) {
    var reihe = (ids || []).slice(0, 6);
    function weiter() {
      var id = reihe.shift();
      if (!id) return Promise.resolve();
      return fetch("/api/pruefreiter", {
        method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: KIND, aktion: "orten", blatt: id })
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j || !j.ok || !Array.isArray(j.stellen)) return;
        j.stellen.forEach(function (x) {
          stellen.forEach(function (s) {
            if (s.id !== x.id) return;
            if (Array.isArray(x.ort)) s.ort = x.ort;
            if (x.belegOrt && s.beleg) { s.beleg.ort = x.belegOrt; belegMalen(s); }
          });
        });
        krMalen(id);
      }).catch(function () {}).then(weiter);
    }
    return weiter();
  }
  /* Nachrechnen nachholen (14.10.2026): ein Blatt nach dem anderen. Gibt true,
     wenn mindestens ein Blatt neu nachgerechnet wurde. */
  function nachrechnenHolen(ids, aktion) {
    var reihe = (ids || []).slice(0, 4), neu = false;
    function weiter() {
      var id = reihe.shift();
      if (!id) return Promise.resolve(neu);
      return fetch("/api/pruefreiter", {
        method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: KIND, aktion: aktion || "nachrechnen", blatt: id })
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.ok && (j.nachgerechnet || j.volllesen)) neu = true;
      }).catch(function () {}).then(weiter);
    }
    return weiter();
  }
  /* Volllesen (15.10.2026): beides nachholen, was der Server meldet - erst
     nachrechnen, dann ganz lesen (bei Mathe holt "volllesen" ein fehlendes
     Nachrechnen mit). true, wenn sich etwas geändert hat. */
  function abschriftenHolen(j) {
    var nr = (j && j.nachrechnen) || [], vl = (j && j.volllesen) || [];
    nr = nr.filter(function (id) { return vl.indexOf(id) < 0; });
    if (!nr.length && !vl.length) return Promise.resolve(false);
    return nachrechnenHolen(nr).then(function (a) {
      return nachrechnenHolen(vl, "volllesen").then(function (b) { return a || b; });
    });
  }
  var BELEG = {};
  function belegMalen(s) { var f = BELEG[s.id]; if (f) f(); }

  function gross(o) {
    stilEinmal();
    var alt = document.querySelector(".lwp-gross"); if (alt) alt.remove();
    var g = document.createElement("div");
    g.className = "lwp lwp-gross";
    g.setAttribute("role", "dialog");
    g.setAttribute("aria-modal", "true");
    g.setAttribute("aria-label", o.titel || "Großansicht");
    g.innerHTML = '<div class="lwp-gross-oben"><div class="lwp-gross-titel">' + esc(o.titel || "") + '</div>' +
      '<button type="button" class="lwp-gross-zu">✕ Schließen</button></div>' +
      '<div class="lwp-gross-bild"><img alt="' + esc(o.titel || "Bild") + '"><div class="lwp-gross-laedt">Einen Moment …</div></div>' +
      '<div class="lwp-gross-leiste"></div>';
    document.body.appendChild(g);
    document.documentElement.classList.add("lwp-gross-offen");
    var img = g.querySelector("img"), laedt = g.querySelector(".lwp-gross-laedt");
    img.setAttribute("data-seite", String(Math.max(0, Number(o.start) || 0)));
    /* Fehlerkreis in der Großansicht; von einer Karte aus ist ihr Kreis hervorgehoben
       und das Bild startet vergrößert an dieser Stelle ("🔍 Ganzes Blatt" zeigt alles). */
    var kreis = window.LWKreis && o.kreise && o.kreise.length ? LWKreis.legen(img, o.kreise, {}) : null;
    if (kreis && o.aktiv) kreis.aktiv(o.aktiv);
    var zoomKnopf = null;
    if (kreis && o.zoom) {
      zoomKnopf = document.createElement("button");
      zoomKnopf.type = "button";
      zoomKnopf.className = "lwp-gross-zoom";
      g.querySelector(".lwp-gross-oben").insertBefore(zoomKnopf, g.querySelector(".lwp-gross-zu"));
      var flaeche = g.querySelector(".lwp-gross-bild"), nah = true;
      var zoomen = function () {
        g.classList.toggle("lwp-gross-nah", nah);
        zoomKnopf.textContent = nah ? "🔍 Ganzes Blatt" : "🔍 Näher ran";
        if (!nah) { flaeche.scrollLeft = 0; flaeche.scrollTop = 0; return; }
        /* Zur Stelle rollen: Mitte des Kreises in die Mitte der Fläche. */
        var z = o.zoom, ws = flaeche.scrollWidth, hs = flaeche.scrollHeight;
        var r = img.naturalWidth && img.clientWidth ? Math.min(img.clientWidth / img.naturalWidth, img.clientHeight / img.naturalHeight) : 0;
        var dw = r ? img.naturalWidth * r : ws, dh = r ? img.naturalHeight * r : hs;
        var ox = (img.clientWidth - dw) / 2, oy = (img.clientHeight - dh) / 2;
        flaeche.scrollLeft = Math.max(0, ox + (z.x + z.b / 2) / 100 * dw - flaeche.clientWidth / 2);
        flaeche.scrollTop = Math.max(0, oy + (z.y + z.h / 2) / 100 * dh - flaeche.clientHeight / 2);
      };
      zoomKnopf.addEventListener("click", function (e) { e.stopPropagation(); nah = !nah; zoomen(); });
      img.addEventListener("load", function () { setTimeout(zoomen, 30); });
      zoomen();
    }
    img.addEventListener("load", function () { laedt.style.display = "none"; });
    img.addEventListener("error", function () { laedt.textContent = "Das Bild kommt gerade nicht. Probier es gleich nochmal."; });
    var blaetter = null;
    var seiten = Math.max(1, Number(o.seiten) || 1);
    if (seiten > 1 && window.LWSeiten) {
      blaetter = LWSeiten.blaettern({ bild: img, leiste: g.querySelector(".lwp-gross-leiste"), seiten: seiten, holen: o.holen, start: Math.min(seiten - 1, Math.max(0, Number(o.start) || 0)) });
    } else {
      Promise.resolve(o.holen(Math.max(0, Number(o.start) || 0))).then(function (url) { if (url) img.src = url; else laedt.textContent = "Das Bild kommt gerade nicht. Probier es gleich nochmal."; });
    }
    function zu() {
      if (blaetter) blaetter.weg();
      if (kreis) kreis.weg();
      document.removeEventListener("keydown", taste, true);
      g.remove();
      document.documentElement.classList.remove("lwp-gross-offen");
      if (o.zurueck && o.zurueck.focus) try { o.zurueck.focus(); } catch (e) {}
    }
    function taste(e) { if (e.key === "Escape") { e.stopPropagation(); zu(); } }
    document.addEventListener("keydown", taste, true);
    g.querySelector(".lwp-gross-zu").addEventListener("click", zu);
    try { g.querySelector(".lwp-gross-zu").focus(); } catch (e) {}
    return { zu: zu, wurzel: g };
  }

  /* Seiten von Pauls Blatt - derselbe Weg wie die Ablage (bildHolen). */
  var blattBilder = {};
  function blattBild(id, nr) {
    var k = id + ":" + nr;
    if (blattBilder[k]) return Promise.resolve(blattBilder[k]);
    return fetch("/api/schulstoff?kind=" + KIND + "&bild=" + encodeURIComponent(k), { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.ok && j.bild) { blattBilder[k] = j.bild; return j.bild; } return null; })
      .catch(function () { return null; });
  }
  /* Bild der Vorlage der Lehrerin: nur über die API hinter dem Ausweis, als
     Blob geholt - so bricht nichts, wenn es fehlt (404) oder der Ausweis
     abgelaufen ist (401): dann gibt es eben kein Bild, nur das Zitat. */
  var vorlageBilder = {};
  function vorlageBild(id) {
    if (vorlageBilder[id]) return vorlageBilder[id];
    vorlageBilder[id] = fetch("/api/lehrervorlagen?kind=" + KIND + "&bild=" + encodeURIComponent(id), { credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok || !/^image\//.test(r.headers.get("content-type") || "")) return null;
        return r.blob().then(function (b) { return URL.createObjectURL(b); });
      })
      .catch(function () { return null; });
    return vorlageBilder[id];
  }

  /* Eine Karte je Stelle. weg(id, endgueltig) meldet, dass die Karte geht:
     endgueltig = erledigt (verschwindet auch auf der Startseite),
     sonst "Später" (bleibt offen). Das Blatt steht im Kasten darüber. */
  function karte(s, weg) {
    var d = document.createElement("div");
    d.className = "lwp-karte";
    d.setAttribute("data-stelle", s.id);
    d.setAttribute("data-art", s.art);
    var kopf = '<div class="lwp-kopf">' + (SCHILD[s.art] || "") + "</div>";
    if (s.art === "lehrerin") {
      d.innerHTML = kopf +
        '<div class="lwp-lehrerin">Deine Lehrerin hat verbessert:<ul class="lwp-rotliste">' +
          (s.zeilen || []).map(function (z) { return "<li>" + esc(z) + "</li>"; }).join("") + "</ul></div>" +
        '<div class="lwp-hinweis">Verbessere es in deinem Heft.</div>' +
        '<div class="lwp-knoepfe"><button type="button" class="lwp-ja lwp-verbessert">Verbessert ✓</button>' +
        '<button type="button" class="lwp-leise lwp-spaeter">Später</button></div>' +
        '<div class="lwp-meldung" aria-live="polite"></div>';
    } else if (s.art === "pinnwand") {
      /* Dennys Entscheidung 14.10.2026, 10:30 Uhr: Paul hat nur falsch
         abgeschrieben und kann es nicht selbst nachprüfen - die Antwort der
         Lehrerin steht sofort da. Nachmittags: die Quelle klar nennen und
         den Beweis zeigen (ihre Vorlagenzeile, ihr Blatt). */
      var b = s.beleg || null;
      var beleg = "";
      if (b && (b.aufgabe || b.titel)) {
        beleg = '<div class="lwp-beleg"><div class="lwp-beleg-satz">So steht es auf ihrer Vorlage' +
          (b.titel ? " „" + esc(b.titel) + "“" : "") + ":</div>" +
          '<div class="lwp-beleg-reihe">' +
          (b.bild ? '<button type="button" class="lwp-vorschau lwp-vorlagebild" aria-label="Vorlage deiner Lehrerin groß ansehen">' +
                    '<span class="lwp-vorschau-leer" aria-hidden="true">📌</span><img alt="" hidden>' +
                    '<span class="lwp-lupe" aria-hidden="true">🔍</span></button>' : "") +
          '<blockquote class="lwp-zitat">' + (b.nr != null ? '<span class="lwp-nr">Nr. ' + esc(b.nr) + "</span> " : "") +
          esc(b.aufgabe) + ' <span aria-hidden="true">→</span> <b>' + esc(s.lehrerin) + "</b></blockquote></div></div>";
      }
      d.innerHTML = kopf +
        '<div class="lwp-aufgabe">' + esc(s.aufgabe) + "</div>" +
        /* Heft-Hinweis (26.10.2026, Dennys Beschluss): nur am Foto bestätigte Abweichungen kommen hier an
           (Server, _pruefreiter.js). Wortlaut fest: Heft, Blatt der Lehrerin, mit Papa ansehen - kein Druck,
           kein „weil“, kein Name. */
        '<div class="lwp-du">In deinem Heft steht: <span class="lwp-falsch">' + esc(s.du) + "</span></div>" +
        '<div class="lwp-lehrerin">Auf dem Blatt der Lehrerin steht: <b class="lwp-richtig">' + esc(s.lehrerin) + "</b></div>" +
        beleg +
        '<div class="lwp-hinweis">Schau es dir mit Papa an.</div>' +
        '<div class="lwp-knoepfe"><button type="button" class="lwp-ja lwp-verbessert">Verbessert ✓</button>' +
        '<button type="button" class="lwp-leise lwp-spaeter">Später</button></div>' +
        '<div class="lwp-meldung" aria-live="polite"></div>';
      var vb = d.querySelector(".lwp-vorlagebild");
      if (vb) {
        var vimg = vb.querySelector("img");
        /* Kein Bild im Speicher oder kein Ausweis: Zitat ohne Bild, nichts bricht. */
        /* Fehlerkreis auf dem Blatt der Lehrerin: um ihre Zeile (beleg.ort). */
        var vKreis = null;
        var belegKreise = function () { return b.ort ? [{ s: 0, x: b.ort.x, y: b.ort.y, b: b.ort.b, h: b.ort.h, art: "offen", id: s.id }] : []; };
        BELEG[s.id] = function () { if (vKreis) vKreis.setzen(belegKreise()); };
        vorlageBild(b.vorlage).then(function (url) {
          if (!url) { vb.remove(); return; }
          vimg.onload = function () {
            vimg.hidden = false; var l = vb.querySelector(".lwp-vorschau-leer"); if (l) l.remove();
            if (window.LWKreis && !vKreis) vKreis = LWKreis.legen(vimg, belegKreise(), { klein: true, fokus: true });
          };
          vimg.onerror = function () { vb.remove(); };
          vimg.src = url;
        });
        vb.addEventListener("click", function () {
          var ks = belegKreise();
          gross({ titel: "Vorlage deiner Lehrerin: " + (b.titel || ""), seiten: 1, zurueck: vb, kreise: ks,
                  aktiv: s.id, zoom: ks.length && b.ort.b < 40 ? b.ort : null,
                  holen: function () { return vorlageBild(b.vorlage); } });
        });
      }
    } else {
      d.innerHTML = kopf +
        '<div class="lwp-aufgabe">' + esc(s.aufgabe) + "</div>" +
        '<div class="lwp-du">' + (s.steht ? "Bei dir steht: " : "Du hast geschrieben: ") + '<span class="lwp-falsch">' + esc(s.du) + "</span></div>" +
        '<div class="lwp-tipp">💡 <span class="lwp-tipptext">' + esc(s.tipp) + "</span></div>" +
        '<div class="lwp-feld"><input type="text" autocomplete="off" aria-label="Deine Verbesserung" ' +
          (s.eingabe === "zahl" ? 'inputmode="numeric" placeholder="neue Zahl"' :
           s.eingabe === "liste" ? 'inputmode="numeric" placeholder="z. B. 1, 2, …"' :
           s.eingabe === "rest" ? 'placeholder="z. B. 9 R 2"' : 'placeholder="dein Wort"') + ">" +
          '<button type="button" class="lwp-ja lwp-pruefen">Prüfen</button></div>' +
        '<div class="lwp-knoepfe"><button type="button" class="lwp-leise lwp-stimmt">Stimmt doch so</button>' +
        '<button type="button" class="lwp-leise lwp-spaeter">Später</button></div>' +
        '<div class="lwp-meldung" aria-live="polite"></div>';
    }
    /* Fehlerkreis: "📍 Zeig mir die Stelle" - nur, wenn die Stelle geortet ist. */
    var zeig = document.createElement("button");
    zeig.type = "button";
    zeig.className = "lwp-leise lwp-zeig";
    zeig.textContent = "📍 Zeig mir die Stelle";
    zeig.hidden = true;
    d.querySelector(".lwp-kopf").appendChild(zeig);
    function zeigMalen() { zeig.hidden = !(window.LWKreis && s.ort && s.ort.length); }
    s._zeigMalen = zeigMalen;
    zeigMalen();
    zeig.addEventListener("click", function () {
      var b = s.blatt || {}, f = fachVon(b.fach), o0 = (s.ort || [])[0];
      if (!o0) return;
      gross({ titel: [f.n, b.titel].filter(Boolean).join(" · "), seiten: b.seiten || 1, zurueck: zeig,
              start: o0.s || 0, kreise: krKreise(b.id), aktiv: s.id, zoom: o0.b < 40 ? o0 : null,
              holen: function (nr) { return blattBild(b.id, nr); } });
    });
    var meldung = d.querySelector(".lwp-meldung");
    function sag(text, art) { meldung.textContent = text; meldung.className = "lwp-meldung" + (art ? " lwp-" + art : ""); }
    function fertig(text, j) {
      krErledigt(s, j && j.gruen);
      d.classList.add("lwp-erledigt");
      Array.prototype.forEach.call(d.querySelectorAll("button,input"), function (x) { x.disabled = true; });
      sag(text, "gut");
      weg(s.id, true, "sofort");
      setTimeout(function () { d.remove(); weg(s.id, true); }, 1600);
    }
    function knoepfe(an) { Array.prototype.forEach.call(d.querySelectorAll(".lwp-knoepfe button,.lwp-feld button,input"), function (x) { x.disabled = !an; }); }

    var spaeter = d.querySelector(".lwp-spaeter");
    spaeter.addEventListener("click", function () { d.remove(); weg(s.id, false); });

    var verbessert = d.querySelector(".lwp-verbessert");
    if (verbessert) verbessert.addEventListener("click", function () {
      knoepfe(false);
      senden(s.id, "verbessert").then(function (j) {
        if (!j || !j.ok) throw 0;
        fertig("Super, du hast es in deinem Heft verbessert!", j);
      }).catch(function () { knoepfe(true); sag("Das hat gerade nicht geklappt. Probier es gleich nochmal.", "fehler"); });
    });

    var pruefen = d.querySelector(".lwp-pruefen");
    if (pruefen) {
      var feld = d.querySelector("input");
      var los = function () {
        var a = feld.value.trim();
        if (!a) { sag("Schreib deine Verbesserung in das Feld.", ""); feld.focus(); return; }
        knoepfe(false);
        senden(s.id, "pruefen", a).then(function (j) {
          if (!j || !j.ok) throw 0;
          if (j.richtig) { fertig("✓ " + (j.satz || "Super, das stimmt jetzt!"), j); return; }
          knoepfe(true);
          if (j.tipp) d.querySelector(".lwp-tipptext").textContent = j.tipp;
          sag("Noch nicht ganz. Lies den Tipp und probier es nochmal.", "noch");
          feld.focus();
        }).catch(function () { knoepfe(true); sag("Das hat gerade nicht geklappt. Probier es gleich nochmal.", "fehler"); });
      };
      pruefen.addEventListener("click", los);
      feld.addEventListener("keydown", function (e) { if (e.key === "Enter") los(); });
      d.querySelector(".lwp-stimmt").addEventListener("click", function () {
        knoepfe(false);
        senden(s.id, "stimmt").then(function (j) {
          if (!j || !j.ok) throw 0;
          fertig("Okay! Ich zeige es deinen Eltern zum Nachsehen.");
        }).catch(function () { knoepfe(true); sag("Das hat gerade nicht geklappt. Probier es gleich nochmal.", "fehler"); });
      });
    }
    return d;
  }

  /* ---------- Ein Kasten je Blatt (Dennys Wahl A) ----------
     Kopf: Fachfarbe als Rand, Fach mit Zeichen, Art · Titel · Datum,
     Vorschaubild zum Antippen. Darunter alle Stellen dieses Blattes.
     Geht die letzte Karte, geht der Kasten mit. */
  function gruppieren(stellen) {
    var reihe = [], je = {};
    stellen.forEach(function (s) {
      var id = (s.blatt && s.blatt.id) || "?";
      if (!je[id]) { je[id] = { blatt: s.blatt || {}, stellen: [] }; reihe.push(je[id]); }
      je[id].stellen.push(s);
    });
    return reihe;
  }
  function blattKasten(gr, weg) {
    var b = gr.blatt, f = fachVon(b.fach);
    var k = document.createElement("section");
    k.className = "lwp-blattkasten";
    k.setAttribute("data-blatt", b.id || "");
    k.setAttribute("data-fach", b.fach || "");
    k.style.setProperty("--lwp-fach", f.c);
    var titel = [b.art, b.titel, tag(b.datum)].filter(Boolean).join(" · ");
    k.innerHTML = '<div class="lwp-blattkopf">' +
      '<button type="button" class="lwp-vorschau lwp-blattbild" aria-label="Dein Blatt groß ansehen">' +
        '<span class="lwp-vorschau-leer" aria-hidden="true">' + f.z + '</span><img alt="" hidden>' +
        '<span class="lwp-lupe" aria-hidden="true">🔍</span></button>' +
      '<div class="lwp-blattinfo"><span class="lwp-fach"><span class="lwp-fachpunkt" aria-hidden="true"></span>' +
        f.z + " " + esc(f.n) + "</span>" +
        '<div class="lwp-blatt">' + esc(titel) + "</div>" +
        (b.seiten > 1 ? '<div class="lwp-seiten">' + b.seiten + " Seiten · antippen zum Ansehen</div>" : '<div class="lwp-seiten">Antippen zum Ansehen</div>') +
        '<div class="lwp-claude" hidden></div>' +
      "</div></div>";
    var knopf = k.querySelector(".lwp-blattbild"), img = knopf.querySelector("img");
    /* Fehlerkreis: Stellen und Verbesserungen dieses Blattes merken. */
    var kr = krBlatt(b.id);
    gr.stellen.forEach(function (s) { if (!kr.stellen.some(function (x) { return x.id === s.id; })) kr.stellen.push(s); });
    if (Array.isArray(b.gruen) && !kr.gruen.length) kr.gruen = b.gruen.slice();
    blattBild(b.id, 0).then(function (url) {
      if (!url) return;
      img.onload = function () {
        img.hidden = false; var l = knopf.querySelector(".lwp-vorschau-leer"); if (l) l.remove();
        if (window.LWKreis && !img._kreis) { img._kreis = LWKreis.legen(img, krKreise(b.id), { klein: true, fokus: true }); kr.apis.push(img._kreis); }
      };
      img.src = url;
    });
    knopf.addEventListener("click", function () {
      gross({ titel: [f.n, b.titel].filter(Boolean).join(" · "), seiten: b.seiten || 1, zurueck: knopf, kreise: krKreise(b.id),
              holen: function (nr) { return blattBild(b.id, nr); } });
    });
    var liste = document.createElement("div");
    liste.className = "lwp-blattstellen";
    k.appendChild(liste);
    setTimeout(function () { krMalen(b.id); }, 0);
    gr.stellen.forEach(function (s) {
      liste.appendChild(karte(s, function (id, erledigt, sofort) {
        if (!sofort && !liste.querySelector(".lwp-karte")) k.remove();
        weg(id, erledigt, sofort);
      }));
    });
    return k;
  }

  /* ---------- Fortschritt (Dennys Wahl C) ----------
     "2 von 5 verbessert". gesamt und erledigt kommen vom Server (Runde =
     heutiger Tag), jede hier erledigte Stelle rückt eins weiter. Ist alles
     geschafft, lobt sie die Mühe - nie die Zahl der Fehler. */
  function leiste(f) {
    var el = document.createElement("div");
    el.className = "lwp-fortschritt";
    el.innerHTML = '<div class="lwp-fs-text" aria-live="polite"></div>' +
      '<div class="lwp-fs-bahn" role="progressbar" aria-valuemin="0"><div class="lwp-fs-fuell"></div></div>';
    var stand = { erledigt: Math.max(0, f.erledigt | 0), gesamt: Math.max(0, f.gesamt | 0) };
    function malen() {
      if (stand.erledigt > stand.gesamt) stand.gesamt = stand.erledigt;
      var fertig = stand.gesamt > 0 && stand.erledigt >= stand.gesamt;
      el.querySelector(".lwp-fs-text").textContent = fertig
        ? "Geschafft! Du hast dir jede Stelle selbst angeschaut. Das war fleißige Arbeit!"
        : stand.erledigt + " von " + stand.gesamt + " verbessert";
      el.classList.toggle("lwp-fs-fertig", fertig);
      var bahn = el.querySelector(".lwp-fs-bahn");
      bahn.setAttribute("aria-valuemax", String(stand.gesamt));
      bahn.setAttribute("aria-valuenow", String(stand.erledigt));
      bahn.setAttribute("aria-label", stand.erledigt + " von " + stand.gesamt + " verbessert");
      el.querySelector(".lwp-fs-fuell").style.width = (stand.gesamt ? Math.round(100 * stand.erledigt / stand.gesamt) : 0) + "%";
    }
    malen();
    return { el: el, eins: function () { stand.erledigt++; malen(); }, fertig: function () { return stand.gesamt > 0 && stand.erledigt >= stand.gesamt; } };
  }

  function saetze(stellen, blaetter) {
    var n = stellen.length;
    if (n === 1) return "In einem Blatt habe ich eine Stelle gefunden. Schau sie dir an!";
    return "In " + (blaetter === 1 ? "einem Blatt" : blaetter + " Blättern") + " habe ich Stellen gefunden. Schau sie dir an!";
  }

  /* ---------- Nach dem Hochladen ---------- */
  function hochladen(kasten, blattId) {
    if (!kasten || !blattId) return Promise.resolve(0);
    stilEinmal();
    return holen(blattId).then(function (j) {
      /* Kam das Durchlesen ohne Abschrift zurück: erst nachrechnen bzw. ganz lesen, dann zeigen. */
      if ((j.nachrechnen && j.nachrechnen.length) || (j.volllesen && j.volllesen.length))
        return abschriftenHolen(j).then(function (neu) { return neu ? holen(blattId) : j; });
      return j;
    }).then(function (j) {
      var st = j.stellen || [];
      if (!st.length) return 0;
      var box = document.createElement("section");
      box.className = "lwp lwp-hoch";
      box.setAttribute("data-blatt", blattId);
      box.innerHTML = '<div class="lwp-titel">🔍 Ich habe nachgesehen</div>' +
        '<div class="lwp-satz">' + (st.length === 1 ? "Eine Stelle möchte ich dir zeigen." : st.length + " Stellen möchte ich dir zeigen.") +
        " Du verbesserst selbst.</div>";
      var fs = leiste(j.fortschritt || { erledigt: 0, gesamt: st.length });
      box.appendChild(fs.el);
      var liste = document.createElement("div");
      liste.className = "lwp-liste";
      box.appendChild(liste);
      var offen = st.length, spaeter = 0;
      gruppieren(st).forEach(function (gr) {
        liste.appendChild(blattKasten(gr, function (id, erledigt, sofort) {
          if (sofort) { fs.eins(); return; }
          offen--; if (!erledigt) spaeter++;
          if (offen) return;
          box.innerHTML = '<div class="lwp-titel">🔍 Ich habe nachgesehen</div><div class="lwp-satz lwp-gut">' +
            (spaeter ? "Alles klar! Was noch offen ist, findest du oben auf deiner Startseite unter „Nachgesehen“."
                     : "Fertig! Du hast alles selbst nachgesehen. Toll gemacht!") + "</div>";
        }));
      });
      kasten.insertBefore(box, kasten.firstChild);
      try { box.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) {}
      if (window.LWKreis && j.orten && j.orten.length) orteHolen(j.orten, st);
      return st.length;
    });
  }

  /* ---------- Knopf auf der Startseite ---------- */
  function startseite(knopf) {
    if (!knopf) return Promise.resolve(0);
    stilEinmal();
    var stellen = [];
    var stand = { erledigt: 0, gesamt: 0 };
    function zaehlen() {
      var bl = {};
      stellen.forEach(function (s) { bl[s.blatt && s.blatt.id] = 1; });
      return Object.keys(bl).length;
    }
    function malen() {
      if (!stellen.length) { knopf.classList.add("verborgen"); knopf.hidden = true; return; }
      knopf.hidden = false;
      knopf.classList.remove("verborgen");
      var z = knopf.querySelector(".lwp-zahl"); if (z) z.textContent = String(stellen.length);
      var t = knopf.querySelector(".cc-s"); if (t) t.textContent = saetze(stellen, zaehlen());
    }
    /* Sonnenknopf in der Kopfzeile (Dennys Wahl D): drückt den schwebenden
       Schalter (/farbschalter.js) oder Pauls #modeBtn - dieselbe Logik,
       dieselbe Wahl. Ohne beide steht keiner da. */
    function schalter() { return document.getElementById("farbschalter") || document.getElementById("modeBtn"); }
    var ueber = null, sonneBeob = null;
    function schliessen() {
      if (ueber) {
        ueber.remove(); ueber = null;
        document.documentElement.classList.remove("lwp-offen");
        if (sonneBeob) { sonneBeob.disconnect(); sonneBeob = null; }
      }
      malen();
    }
    function oeffnen() {
      if (ueber) return;
      ueber = document.createElement("div");
      ueber.className = "lwp-ueber";
      ueber.setAttribute("role", "dialog");
      ueber.setAttribute("aria-label", "Nachgesehen");
      ueber.innerHTML = '<div class="lwp lwp-innen"><div class="lwp-oben">' +
        '<button type="button" class="lwp-leise lwp-zu">‹ Zurück</button>' +
        '<div class="lwp-titel">🔍 Nachgesehen</div>' +
        '<button type="button" class="lwp-leise lwp-sonne"></button></div>' +
        '<div class="lwp-satz">Hier sind Stellen aus deinen Blättern. Du verbesserst selbst.</div>' +
        '<div class="lwp-liste"></div></div>';
      document.body.appendChild(ueber);
      document.documentElement.classList.add("lwp-offen");
      ueber.querySelector(".lwp-zu").addEventListener("click", schliessen);
      var sonne = ueber.querySelector(".lwp-sonne");
      function sonneMalen() {
        var dunkel = document.documentElement.getAttribute("data-theme") === "dark";
        sonne.textContent = dunkel ? "☀️" : "🌙";
        var was = dunkel ? "Hell einschalten" : "Dunkel einschalten";
        sonne.setAttribute("aria-label", was); sonne.title = was;
      }
      if (!schalter()) sonne.remove();
      else {
        sonneMalen();
        sonne.addEventListener("click", function () { var x = schalter(); if (x) x.click(); sonneMalen(); });
        try { sonneBeob = new MutationObserver(sonneMalen); sonneBeob.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }); } catch (e) {}
      }
      var inner = ueber.querySelector(".lwp-innen");
      var fs = leiste(stand);
      inner.insertBefore(fs.el, inner.querySelector(".lwp-liste"));
      var liste = ueber.querySelector(".lwp-liste");
      gruppieren(stellen.slice()).forEach(function (gr) {
        liste.appendChild(blattKasten(gr, function (id, erledigt, sofort) {
          if (sofort) { stand.erledigt++; fs.eins(); return; }
          if (erledigt) stellen = stellen.filter(function (x) { return x.id !== id; });
          malen();
          if (!liste.querySelector(".lwp-karte")) {
            liste.innerHTML = '<div class="lwp-satz lwp-gut">' +
              (stellen.length ? "Für heute reicht das. Der Rest wartet hier auf dich."
                              : "Fertig! Du hast alles selbst nachgesehen. Toll gemacht!") + "</div>";
            setTimeout(schliessen, 2400);
          }
        }));
      });
    }
    knopf.addEventListener("click", function (e) { e.preventDefault(); oeffnen(); });
    function uebernehmen(j) {
      stellen = j.stellen || [];
      stand = { erledigt: (j.fortschritt && j.fortschritt.erledigt) || 0, gesamt: (j.fortschritt && j.fortschritt.gesamt) || stellen.length };
      malen();
      /* Fehlerkreis: fehlt einem Blatt der Ort, jetzt nachholen - bis Paul öffnet, ist er meist da. */
      if (window.LWKreis && j.orten && j.orten.length) orteHolen(j.orten, stellen);
      return stellen.length;
    }
    return holen(null).then(function (j) {
      var n = uebernehmen(j);
      /* Nachrechnen im Hintergrund; ist die Einblendung noch zu, kommt die neue Zahl dazu. */
      if ((j.nachrechnen && j.nachrechnen.length) || (j.volllesen && j.volllesen.length))
        abschriftenHolen(j).then(function (neu) {
          if (neu && !ueber) return holen(null).then(uebernehmen);
        });
      return n;
    });
  }

  /* ---------- Aussehen: hell und dunkel (data-theme), Finger ab 44 px ---------- */
  function stilEinmal() {
    if (document.getElementById("lwp-stil")) return;
    var st = document.createElement("style");
    st.id = "lwp-stil";
    st.textContent = [
      ".lwp{--lwp-karte:#fff;--lwp-ink:#1b1c22;--lwp-neben:#4b5160;--lwp-linie:#dfe3ee;--lwp-blau:#1d4fae;--lwp-blaubg:#e8efff;",
      "--lwp-rot:#b42318;--lwp-rotbg:#fdecec;--lwp-gelb:#fff7ed;--lwp-gelblinie:#fed7aa;--lwp-gelbink:#7a4a12;--lwp-gruen:#0b6b43;--lwp-gruenbg:#e7f6ee;",
      "--lwp-leise:#eef1f7;--lwp-kasten:#f6f8fc;color:var(--lwp-ink);font-family:ui-rounded,'SF Pro Rounded',-apple-system,system-ui,sans-serif;text-align:left}",
      "html[data-theme=\"dark\"] .lwp{--lwp-karte:#1d2030;--lwp-ink:#f1f2f7;--lwp-neben:#b9bfd3;--lwp-linie:#353a50;--lwp-blau:#a9c1ff;--lwp-blaubg:#1e2b4d;",
      "--lwp-rot:#ffb4ab;--lwp-rotbg:#3a1a1a;--lwp-gelb:#2c2414;--lwp-gelblinie:#6b4f1e;--lwp-gelbink:#fde7c2;--lwp-gruen:#8be0b4;--lwp-gruenbg:#12301f;--lwp-leise:#2a2e40;--lwp-kasten:#181c2b}",
      ".lwp-hoch{background:var(--lwp-blaubg);border:2px solid var(--lwp-blau);border-radius:22px;padding:16px;margin:14px 0}",
      ".lwp-titel{font-weight:800;font-size:20px;margin:0 0 4px}",
      ".lwp-satz{font-size:16px;line-height:1.4;margin:0 0 12px;color:var(--lwp-ink)}",
      ".lwp-satz.lwp-gut{color:var(--lwp-gruen);font-weight:700}",
      ".lwp-karte{background:var(--lwp-karte);border:1px solid var(--lwp-linie);border-radius:20px;padding:16px;margin:0 0 12px;transition:opacity .3s}",
      ".lwp-karte.lwp-erledigt{opacity:.75}",
      ".lwp-kopf{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}",
      ".lwp-schild{font-size:14px;font-weight:700;border-radius:999px;padding:4px 10px}",
      ".lwp-s-rechnen{background:var(--lwp-blaubg);color:var(--lwp-blau)}",
      ".lwp-s-lehrerin{background:var(--lwp-rotbg);color:var(--lwp-rot)}",
      ".lwp-s-pinnwand{background:var(--lwp-gelb);color:var(--lwp-gelbink);border:1px solid var(--lwp-gelblinie)}",
      ".lwp-s-schreiben{background:var(--lwp-leise);color:var(--lwp-ink);border:1px solid var(--lwp-linie)}",
      ".lwp-blatt{font-size:14px;color:var(--lwp-neben)}",
      ".lwp-aufgabe{font-size:22px;font-weight:800;margin:6px 0;overflow-wrap:anywhere}",
      ".lwp-du{font-size:17px;margin:6px 0;overflow-wrap:anywhere}",
      ".lwp-falsch{font-weight:700;text-decoration:underline wavy var(--lwp-rot);text-underline-offset:4px}",
      ".lwp-tipp{background:var(--lwp-gelb);border:1px solid var(--lwp-gelblinie);color:var(--lwp-gelbink);border-radius:14px;padding:10px 12px;margin:10px 0;font-size:16px;line-height:1.4}",
      ".lwp-lehrerin{background:var(--lwp-rotbg);border-left:5px solid var(--lwp-rot);border-radius:10px;padding:10px 12px;margin:8px 0;font-size:16px;line-height:1.4}",
      ".lwp-hinweis{font-size:16px;font-weight:600;margin:6px 0 0}",
      ".lwp-richtig{font-weight:800}",
      ".lwp-rotliste{margin:6px 0 0;padding-left:20px;font-weight:700}",
      ".lwp-rotliste li{margin:3px 0}",
      ".lwp-feld{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px}",
      ".lwp-feld input{flex:1 1 160px;min-width:0;max-width:340px;font-family:inherit;font-weight:600;font-size:20px;padding:10px 12px;min-height:48px;border-radius:12px;",
      "border:2px solid var(--lwp-linie);background:var(--lwp-karte);color:var(--lwp-ink);box-sizing:border-box}",
      ".lwp-knoepfe{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}",
      ".lwp button{appearance:none;font-family:inherit;font-weight:700;font-size:16px;border-radius:14px;padding:10px 16px;min-height:48px;min-width:48px;border:0;cursor:pointer}",
      ".lwp .lwp-ja{background:#1d4fae;color:#fff}",
      "html[data-theme=\"dark\"] .lwp .lwp-ja{background:#a9c1ff;color:#10142a}",
      ".lwp .lwp-leise{background:var(--lwp-leise);color:var(--lwp-ink)}",
      ".lwp button[disabled],.lwp input[disabled]{opacity:.6;cursor:default}",
      ".lwp-meldung{font-size:16px;margin-top:8px;min-height:0}",
      ".lwp-meldung.lwp-gut{background:var(--lwp-gruenbg);color:var(--lwp-gruen);border-radius:12px;padding:10px 12px;font-weight:700}",
      ".lwp-meldung.lwp-noch{color:var(--lwp-ink);font-weight:600}",
      ".lwp-meldung.lwp-fehler{color:var(--lwp-rot)}",
      ".lwp-ueber{position:fixed;inset:0;z-index:9000;overflow-y:auto;-webkit-overflow-scrolling:touch;background:rgba(10,12,24,.55);padding:16px 12px 40px;box-sizing:border-box}",
      ".lwp-innen{max-width:640px;margin:0 auto;background:var(--lwp-blaubg);border-radius:24px;padding:16px;box-sizing:border-box}",
      "html[data-theme=\"dark\"] .lwp-innen{background:#151a2c}",
      ".lwp-oben{display:flex;align-items:center;gap:12px;margin-bottom:6px}",
      ".lwp-oben .lwp-titel{margin:0}",
      "html.lwp-offen{overflow:hidden}",
      /* Unten Platz für den 💬-Knopf (52 px + 14 px Rand): die letzte Karte bleibt frei. */
      ".lwp-ueber{padding-bottom:calc(96px + env(safe-area-inset-bottom,0px))}",
      /* In der Einblendung sitzt der Sonnenknopf oben; der schwebende ginge über die Karten. */
      "html.lwp-offen #farbschalter,html.lwp-offen #farbschalter-tafel,html.lwp-gross-offen #farbschalter,html.lwp-gross-offen #farbschalter-tafel{display:none!important}",
      "html.lwp-gross-offen #melde-knopf{display:none!important}",
      ".lwp-oben .lwp-titel{flex:1 1 auto;min-width:0}",
      ".lwp .lwp-sonne{flex:none;width:48px;padding:0;font-size:22px;border:2px solid var(--lwp-linie)}",
      /* Blattkasten */
      ".lwp-blattkasten{background:var(--lwp-kasten);border:1px solid var(--lwp-linie);border-left:8px solid var(--lwp-fach,#64748b);border-radius:20px;padding:12px;margin:0 0 14px}",
      ".lwp-blattkopf{display:flex;gap:12px;align-items:center;margin:0 0 10px}",
      ".lwp .lwp-vorschau{position:relative;flex:none;width:72px;height:92px;min-height:0;padding:0;border-radius:12px;overflow:hidden;",
      "background:var(--lwp-leise);border:2px solid var(--lwp-linie);display:grid;place-items:center;font-size:30px}",
      ".lwp-vorschau img{width:100%;height:100%;object-fit:cover;display:block}",
      ".lwp-vorschau img[hidden]{display:none}",
      ".lwp-lupe{position:absolute;right:3px;bottom:3px;font-size:14px;line-height:1;background:rgba(255,255,255,.9);border-radius:999px;padding:3px}",
      ".lwp-blattinfo{min-width:0;flex:1 1 auto}",
      ".lwp-fach{display:inline-flex;align-items:center;gap:6px;font-size:15px;font-weight:800;border:2px solid var(--lwp-fach,#64748b);",
      "border-radius:999px;padding:3px 10px;color:var(--lwp-ink)}",
      ".lwp-fachpunkt{width:10px;height:10px;border-radius:50%;background:var(--lwp-fach,#64748b);display:inline-block}",
      ".lwp-blattinfo .lwp-blatt{display:block;font-size:16px;font-weight:700;color:var(--lwp-ink);margin:6px 0 2px;overflow-wrap:anywhere}",
      ".lwp-seiten{font-size:14px;color:var(--lwp-neben)}",
      ".lwp-blattstellen .lwp-karte:last-child{margin-bottom:0}",
      /* Beweis bei der Pinnwand */
      ".lwp-beleg{margin:8px 0;font-size:16px;line-height:1.4}",
      ".lwp-beleg-satz{font-weight:600;margin:0 0 6px}",
      ".lwp-beleg-reihe{display:flex;gap:10px;align-items:flex-start}",
      ".lwp-zitat{margin:0;flex:1 1 auto;min-width:0;border-left:4px solid var(--lwp-gelblinie);background:var(--lwp-gelb);color:var(--lwp-gelbink);border-radius:10px;padding:8px 12px;overflow-wrap:anywhere}",
      ".lwp-nr{font-weight:800}",
      /* Fortschritt */
      ".lwp-fortschritt{margin:0 0 14px}",
      ".lwp-fs-text{font-size:17px;font-weight:800;margin:0 0 6px;color:var(--lwp-ink)}",
      ".lwp-fs-fertig .lwp-fs-text{color:var(--lwp-gruen)}",
      ".lwp-fs-bahn{height:14px;border-radius:999px;background:var(--lwp-leise);border:1px solid var(--lwp-linie);overflow:hidden}",
      ".lwp-fs-fuell{height:100%;width:0;background:var(--lwp-gruen);border-radius:999px;transition:width .4s ease}",
      /* Großansicht */
      ".lwp-gross{position:fixed;inset:0;z-index:2147483300;background:rgba(8,10,20,.94);display:flex;flex-direction:column;color:#fff;",
      "padding:calc(10px + env(safe-area-inset-top,0px)) 10px calc(10px + env(safe-area-inset-bottom,0px));box-sizing:border-box}",
      ".lwp-gross-oben{display:flex;align-items:center;gap:10px;margin:0 0 8px}",
      ".lwp-gross-titel{flex:1 1 auto;min-width:0;font-weight:800;font-size:17px;color:#fff;overflow-wrap:anywhere}",
      ".lwp .lwp-gross-zu{flex:none;background:#fff;color:#10142a;min-height:48px;min-width:48px}",
      ".lwp-gross-bild{position:relative;flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;overflow:auto}",
      ".lwp-gross-bild img{width:100%;height:100%;object-fit:contain;display:block}",
      ".lwp-gross-laedt{position:absolute;font-size:16px;color:#fff}",
      ".lwp-gross-leiste{flex:none;color:#fff;margin-top:8px}",
      ".lwp-gross-leiste .lwseiten button{background:rgba(255,255,255,.22);color:#fff}",
      "html.lwp-gross-offen{overflow:hidden}",
      /* Fehlerkreis */
      ".lwp-lupe{z-index:3}",
      ".lwp .lwp-zeig{margin-left:auto;font-size:15px;padding:8px 12px}",
      ".lwp-claude{font-size:14px;font-weight:800;color:var(--lwp-gruen);margin-top:4px}",
      ".lwp-claude[hidden]{display:none}",
      ".lwp .lwp-gross-zoom{flex:none;background:rgba(255,255,255,.22);color:#fff;min-height:48px}",
      ".lwp-gross-nah .lwp-gross-bild{display:block}",
      ".lwp-gross-nah .lwp-gross-bild img{width:220%;height:220%;max-width:none}"
    ].join("");
    (document.head || document.documentElement).appendChild(st);
  }

  window.LWPruef = { hochladen: hochladen, startseite: startseite, holen: holen };
})();
