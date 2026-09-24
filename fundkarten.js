/* Die Fundkarten - der Bildschirm direkt nach dem Hochladen eines Blattes.
 *
 * Denny am 23.09.2026, nach neun Entwuerfen: "Nach dem Hochladen eines
 * Bildes/Fotos soll so das Quiz starten - mit Entwurf 2." Und davor, worum
 * es geht: "Sie koennen verifizieren, was Sie sehen und geschrieben haben,
 * und dann selber beantworten, in dem Sie es selber noch mal gesehen haben."
 *
 * Eine Karte je Fund: ein AUSSCHNITT aus Pauls eigenem Foto, darunter die
 * Frage und drei Antworten zum Antippen. Die Antwort ist auf dem Ausschnitt
 * zu sehen - es geht ums Hinschauen, nicht ums Auswendigwissen. Geloeste
 * Karten wandern sichtbar ins Regal.
 *
 * WAS HIER BEWUSST FEHLT:
 *   - keine Uhr, kein Countdown, keine Punkte, keine Herzen. Dennys Bauregel
 *     vom 04.09.2026: "Kein Druck ueber Verlustangst." In der Schmiede sind
 *     die Herzen am 20.09.2026 genau deshalb rausgeflogen.
 *   - kein Wegwerfen einer Karte. Danebengetippt heisst: nochmal hinschauen.
 *   - keine Lernzeit. Sein Blatt nachlesen ist kein Lernen; eine gezaehlte
 *     Minute wuerde die Statistik im Elternbereich faelschen - dieselbe
 *     Begruendung wie beim Schaukasten (paul/schulstoff.html).
 *
 * Gebraucht wird nur diese Datei:
 *   <script src="/fundkarten.js"></script>
 *
 *   LWFund.zeigen(document.getElementById("wohin"), {
 *     karten: antwort.karten,      // aus /api/schulstoff (POST)
 *     kind:   "paul",
 *     was:    antwort.titel,       // nur fuer die Kopfzeile, darf fehlen
 *     blattId: antwort.id,         // holt das Foto selbst nach
 *     fertig: function(){ ... }    // wenn alle Karten im Regal liegen
 *   });
 *
 * Ohne Karten passiert NICHTS - zeigen() gibt false zurueck, und die Seite
 * macht weiter wie bisher. Ein leerer Bildschirm zum Wegklicken waere
 * schlimmer als keiner (dieselbe Entscheidung wie bei der Merkkarten-Runde
 * im Lernquiz).
 */
(function (global) {
  "use strict";

  /* Farben kommen aus der Seite. Pauls Seiten setzen teils --karte, teils
   * --card - deshalb doppelter Rueckfall. Genau hier ist am 23.09.2026 ein
   * Tippfehler fast live gegangen: .qblatt nahm var(--karte), gesetzt war
   * nur --card, und Helenas dunkle Welt haette eine weisse Flaeche bekommen. */
  var K = "var(--karte,var(--card,#fff))";
  var LINE = "var(--line,#e4e7f0)";
  var INK = "var(--ink,#1b1c22)";
  /* Nebentexte bekommen eine EIGENE Farbe, nicht --muted.
   *
   * Gemessen am 23.09.2026: Pauls --muted (#6b7280) liegt auf dem hellen
   * Seitengrund #eef1f7 bei 4,27:1 - WCAG 2.2 (1.4.3) verlangt 4,5:1. Das
   * betrifft seine ganzen Seiten, nicht nur diesen Bildschirm, und wird
   * dort gesondert gemessen; hier wird es nicht nebenbei mitgeaendert.
   * #5b6270 hat 5,42:1 auf dem Grund und 6,13:1 auf der Karte.
   * Im Dunkeln bleibt --muted (#a0a6bd auf #1e2029 = 6,71:1) richtig. */
  var MUT = "var(--lwf-muted,#5b6270)";
  /* Auch das Gruen bekommt eine eigene Fassung. Gemessen 23.09.2026: Pauls
   * --gut (#12b76a) auf der hellgruenen Flaeche einer richtigen Antwort
   * ergibt 2,42:1 - WCAG 2.2 (1.4.11) verlangt 3:1 fuer Symbole wie das
   * Haekchen. #0b7a47 kommt auf 4,97:1. Im Dunkeln bleibt --gut (#4ade9b),
   * das dort deutlich heraussticht. */
  var GUT = "var(--lwf-gut,#0b7a47)";
  var AKZ = "var(--akzent,#4f46e5)";
  var AUF = "var(--akzent-auf,#fff)";

  var STIL = [
    ":root{--lwf-muted:#5b6270;--lwf-gut:#0b7a47}",
    "html[data-theme=\"dark\"]{--lwf-muted:var(--muted,#a0a6bd);--lwf-gut:var(--gut,#4ade9b)}",
    ".lwf{margin-top:4px}",
    ".lwf .kicker{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:" + MUT + "}",
    ".lwf h2{font:800 20px var(--rund,inherit);margin:2px 0 4px;color:" + INK + "}",
    ".lwf .u{color:" + MUT + ";font-size:15px;margin:0 0 4px;line-height:1.45}",

    /* Der Stapel: zwei angedeutete Karten dahinter, damit man sieht, dass
       noch etwas kommt. Feste Hoehe, damit beim Wechsel nichts springt. */
    ".lwf-stapel{position:relative;margin-top:14px}",
    ".lwf-hinten{position:absolute;left:0;right:0;top:0;height:100%;border-radius:20px;",
    "  background:" + K + ";border:1px solid " + LINE + ";pointer-events:none;transition:opacity .4s}",
    ".lwf-h1{transform:translateY(12px) scale(.96);opacity:.5}",
    ".lwf-h2{transform:translateY(23px) scale(.92);opacity:.28}",
    ".lwf-karte{position:relative;background:" + K + ";border:1px solid " + LINE + ";",
    "  border-radius:20px;padding:15px;transition:transform .5s cubic-bezier(.4,0,.2,1),opacity .4s}",
    ".lwf-karte.ab{transform:translateY(260px) scale(.4);opacity:0}",
    ".lwf-karte.rein{animation:lwfRein .4s ease}",
    "@keyframes lwfRein{from{transform:translateY(20px) scale(.96);opacity:0}}",
    ".lwf-num{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}",

    /* Der Ausschnitt. Waagrecht schiebbar, falls beim Vergroessern etwas
       aus dem Bild laeuft - abschneiden ohne Ausweg waere schlimmer. */
    ".lwf-schnipsel{border-radius:12px;overflow:hidden;border:1px solid " + LINE + ";",
    "  background:#fff;position:relative}",
    ".lwf-rolle{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}",
    ".lwf-schnipsel img{display:block;max-width:none}",
    ".lwf-bu{text-align:center;font-size:12px;color:" + MUT + ";margin-top:7px}",
    ".lwf-ganz{display:block;margin:6px auto 0;background:none;border:none;",
    "  color:" + MUT + ";font-size:13px;text-decoration:underline;cursor:pointer;",
    "  min-height:44px;padding:0 10px}",

    ".lwf-frage{font:600 17px var(--rund,inherit);margin:14px 2px 0;color:" + INK + ";line-height:1.35}",
    ".lwf-chips{display:flex;flex-direction:column;gap:8px;margin-top:11px}",
    ".lwf-chip{display:flex;align-items:center;gap:10px;width:100%;min-height:52px;",
    "  padding:10px 14px;border-radius:14px;border:1.5px solid " + LINE + ";background:" + K + ";",
    "  color:" + INK + ";font-size:16px;text-align:left;cursor:pointer;appearance:none;",
    "  transition:opacity .2s,border-color .2s}",
    ".lwf-mark{width:22px;height:22px;flex:none;border-radius:50%;border:1.5px solid " + LINE + ";",
    "  display:grid;place-items:center;font-size:13px;color:transparent}",
    ".lwf-chip.gut{border-color:" + GUT + ";background:rgba(74,222,155,.14)}",
    ".lwf-chip.gut .lwf-mark{border-color:" + GUT + ";color:" + GUT + "}",
    ".lwf-chip.daneben{opacity:.45;animation:lwfWackeln .34s}",
    ".lwf-chip[disabled]{cursor:default}",
    "@keyframes lwfWackeln{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}",

    ".lwf-tipp{font-size:14px;color:var(--orange,#b45309);margin:10px 2px 0;line-height:1.45}",
    ".lwf-lob{font-size:14px;color:" + GUT + ";margin:10px 2px 0;line-height:1.45}",
    ".lwf-knopf{min-height:56px;width:100%;border:none;border-radius:16px;background:" + AKZ + ";",
    "  color:" + AUF + ";font:700 17px var(--rund,inherit);cursor:pointer;margin-top:13px}",
    ".lwf-knopf.leise{background:transparent;color:" + MUT + ";border:1px solid " + LINE + ";font-weight:600}",

    /* Das Regal: was gefunden ist, bleibt sichtbar. Belohnung als Rueckschau,
       nicht als Versprechen - Dennys Bauregel. */
    ".lwf-sammlung{margin-top:16px}",
    ".lwf-sammlung h3{font:700 15px var(--rund,inherit);margin:0 0 8px;display:flex;",
    "  justify-content:space-between;align-items:baseline;color:" + INK + "}",
    ".lwf-sammlung h3 span{font-size:12px;color:" + MUT + ";font-weight:400}",
    ".lwf-regal{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}",
    ".lwf-slot{aspect-ratio:1/.72;border-radius:11px;border:1px dashed " + LINE + ";",
    "  overflow:hidden;position:relative;display:grid;place-items:center;min-height:44px}",
    ".lwf-slot.voll{border:1px solid " + GUT + ";background:#fff}",
    ".lwf-slot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}",
    ".lwf-slot em{font-size:17px;color:" + MUT + ";font-style:normal;opacity:.5}",
    ".lwf-slot b{position:absolute;left:0;right:0;bottom:0;background:rgba(10,11,16,.82);",
    "  color:#fff;font-size:9.5px;font-weight:600;padding:2px 3px;text-align:center;",
    "  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",

    /* Das ganze Blatt gross - derselbe Weg wie Stufe 2 im Lernquiz. */
    ".lwf-gross{position:fixed;inset:0;background:rgba(8,9,14,.9);z-index:9999;display:grid;",
    "  place-items:center;padding:14px}",
    ".lwf-gross img{max-width:100%;max-height:82vh;border-radius:12px;background:#fff}",
    ".lwf-zu{position:absolute;top:10px;right:10px;min-width:56px;min-height:56px;border-radius:16px;",
    "  border:none;background:rgba(255,255,255,.14);color:#fff;font-size:22px;cursor:pointer}",

    /* Handy mit offener Tastatur bzw. sehr flache Fenster: der Ausschnitt
       bleibt, das Drumherum tritt zurueck. Hier wird zwar nichts getippt,
       aber ein iPad im geteilten Bildschirm ist genauso niedrig. */
    "@media (max-height:520px){",
    "  .lwf .u{display:none}",
    "  .lwf-sammlung{margin-top:10px}",
    "  .lwf-regal{grid-template-columns:repeat(8,minmax(0,1fr))}",
    "  .lwf-slot b{display:none}",
    "  .lwf-karte{padding:11px}",
    "  .lwf-frage{margin-top:10px;font-size:16px}",
    "}"
  ].join("");

  /* Wo stehen die Textzeilen auf dem Blatt? Rein mechanisch aus dem Bild -
   * kein Modell, keine Wartezeit, kein Geld.
   *
   * Das Bild wird klein auf ein Canvas gezeichnet, und je Bildzeile wird
   * gezaehlt, wie viele Punkte deutlich dunkler sind als das Papier neben
   * ihnen (der 85er-Perzentilwert der Zeile ist der Papierton - das haelt
   * Schatten und schiefe Fotos aus). Zusammenhaengende Bereiche mit Tinte
   * sind die Zeilen.
   *
   * WAS DAS LEISTET UND WAS NICHT - gemessen am 23.09.2026 an Pauls
   * Stadtportraet, damit es niemand erneut ausprobieren muss:
   *   ja   Der Ausschnitt schneidet nie mitten durch eine Zeile. Er zeigt
   *        ganze Zeilen statt eines willkuerlichen Prozentbandes.
   *   nein Er trifft dadurch NICHT oefter die richtige Stelle. Die
   *        Trefferquote haengt allein an der Schaetzung des Modells; mit
   *        Einrasten auf die naechste Zeile UND mit monotoner Zuordnung
   *        ueber die Reihenfolge kamen beide Male dieselben 2 von 4 heraus.
   * Wer das loesen will, braucht Texterkennung, nicht bessere Geometrie. */
  function zeilenFinden(im) {
    try {
      var breite = 300;
      var hoehe = Math.round(breite * im.naturalHeight / im.naturalWidth);
      if (!(hoehe > 20)) return null;
      var c = document.createElement("canvas");
      c.width = breite; c.height = hoehe;
      var ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(im, 0, 0, breite, hoehe);
      var d = ctx.getImageData(0, 0, breite, hoehe).data;
      var profil = new Array(hoehe), reihe = new Array(breite), x, y, i;
      for (y = 0; y < hoehe; y++) {
        for (x = 0; x < breite; x++) {
          i = (y * breite + x) * 4;
          reihe[x] = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000;
        }
        var sortiert = reihe.slice().sort(function (a, b) { return a - b; });
        var papier = sortiert[Math.floor(breite * 0.85)];
        var dunkel = 0;
        for (x = 0; x < breite; x++) if (reihe[x] < papier - 55) dunkel++;
        profil[y] = dunkel / breite;
      }
      var g = new Array(hoehe);
      for (y = 0; y < hoehe; y++) {
        var a = Math.max(0, y - 1), b = Math.min(hoehe - 1, y + 1), s = 0;
        for (i = a; i <= b; i++) s += profil[i];
        g[y] = s / (b - a + 1);
      }
      var zeilen = [], start = null;
      for (y = 0; y < hoehe; y++) {
        if (g[y] >= 0.035 && start === null) start = y;
        else if (g[y] < 0.035 && start !== null) {
          if (y - start >= 3) zeilen.push([start * 100 / hoehe, y * 100 / hoehe]);
          start = null;
        }
      }
      if (start !== null && hoehe - start >= 3) zeilen.push([start * 100 / hoehe, 100]);
      return zeilen.length >= 3 ? zeilen : null;
    } catch (e) {
      /* Ein Bild anderer Herkunft macht das Canvas "unrein" und
         getImageData wirft. Dann eben ohne - der Ausschnitt sitzt weiter
         auf der Schaetzung. */
      return null;
    }
  }

  /* Das Band auf ganze Zeilen aufziehen: von der ersten Zeile, die es
   * beruehrt, bis zur letzten. Beruehrt es keine (Leerraum, Bildbereich),
   * bleibt es, wie es war. */
  function einrasten(von, bis, zeilen) {
    if (!zeilen) return [von, bis];
    var lo = null, hi = null;
    for (var i = 0; i < zeilen.length; i++) {
      var z = zeilen[i];
      if (z[1] < von || z[0] > bis) continue;
      if (lo === null || z[0] < lo) lo = z[0];
      if (hi === null || z[1] > hi) hi = z[1];
    }
    if (lo === null) return [von, bis];
    return [Math.max(0, lo - 0.6), Math.min(100, hi + 0.6)];
  }

  function el(tag, klasse, text) {
    var n = document.createElement(tag);
    if (klasse) n.className = klasse;
    if (text != null) n.textContent = text;
    return n;
  }

  /* Die Reihenfolge der drei Antworten haengt an der Kartennummer, nicht am
   * Zufall: Beim zweiten Durchgang liegt dieselbe Antwort an derselben
   * Stelle. Ein Kind, das eine Karte wiedererkennt, soll nicht durch eine
   * neue Anordnung verunsichert werden. */
  function antworten(k, i) {
    var a = [String(k.falsch[0]), String(k.falsch[1])];
    a.splice(i % 3, 0, String(k.richtig));
    return a;
  }

  var stilDa = false;
  function stilEinhaengen() {
    if (stilDa) return;
    stilDa = true;
    var s = document.createElement("style");
    s.textContent = STIL;
    document.head.appendChild(s);
  }

  /* Das Blatt holen wir uns selbst - die POST-Antwort traegt es nicht mit,
   * und ein zweites grosses Bild durch die Leitung zu schicken waere Unsinn,
   * wo das Foto gerade erst hochgegangen ist. Kommt es nicht, laeuft alles
   * ohne Ausschnitt weiter: Die Frage allein ist immer noch eine Frage.
   * (Dieselbe Lehre wie im Lernquiz, wo Stufe 2 ohne Bild ganz wegfiel.) */
  function blattHolen(kind, blattId, dann) {
    if (!blattId) { dann(""); return; }
    fetch("/api/schulstoff?kind=" + encodeURIComponent(kind) +
          "&bild=" + encodeURIComponent(blattId + ":0"), { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) { dann((j && j.ok && j.bild) || ""); })
      .catch(function () { dann(""); });
  }

  function zeigen(wurzel, opt) {
    opt = opt || {};
    var karten = (opt.karten || []).filter(function (k) {
      return k && k.frage && k.richtig && k.falsch && k.falsch.length === 2;
    });
    /* Unter drei Karten lohnt der Bildschirm nicht - dann ist es kein
       Stapel, sondern eine Unterbrechung. Lieber gar nicht zeigen. */
    if (!wurzel || karten.length < 3) return false;

    stilEinhaengen();
    var kind = opt.kind || "paul";
    var blattBild = "";
    var i = 0, gefunden = 0;

    wurzel.innerHTML = "";
    var box = el("div", "lwf");
    wurzel.appendChild(box);

    var kopf = el("div");
    kopf.appendChild(el("div", "kicker", "Hochgeladen" + (opt.was ? " · " + String(opt.was).slice(0, 40) : "")));
    kopf.appendChild(el("h2", null, karten.length + " Fundkarten aus deinem Blatt"));
    kopf.appendChild(el("p", "u", "Ich habe dein Blatt gelesen und " + karten.length +
      " Stellen ausgeschnitten. Schau hin und tipp an, was dort steht."));
    box.appendChild(kopf);

    var stapel = el("div", "lwf-stapel");
    var h2 = el("div", "lwf-hinten lwf-h2"), h1 = el("div", "lwf-hinten lwf-h1");
    stapel.appendChild(h2); stapel.appendChild(h1);
    var halter = el("div"); stapel.appendChild(halter);
    box.appendChild(stapel);

    var samm = el("div", "lwf-sammlung");
    var h3 = el("h3");
    h3.appendChild(el("span", null, "Dein Regal"));
    var zahl = el("span", null, "0 von " + karten.length);
    h3.appendChild(zahl);
    samm.appendChild(h3);
    var regal = el("div", "lwf-regal");
    var slots = karten.map(function () {
      var s = el("div", "lwf-slot");
      s.appendChild(el("em", null, "·"));
      regal.appendChild(s);
      return s;
    });
    samm.appendChild(regal);
    box.appendChild(samm);

    function grossZeigen() {
      if (!blattBild) return;
      var lage = el("div", "lwf-gross");
      var im = el("img"); im.src = blattBild; im.alt = "Dein ganzes Blatt";
      lage.appendChild(im);
      var zu = el("button", "lwf-zu", "×");
      zu.type = "button";
      zu.setAttribute("aria-label", "Schließen");
      lage.appendChild(zu);
      function weg() { if (lage.parentNode) lage.parentNode.removeChild(lage); }
      zu.addEventListener("click", weg);
      lage.addEventListener("click", function (ev) { if (ev.target === lage) weg(); });
      document.body.appendChild(lage);
    }

    /* Der Ausschnitt entsteht aus dem GANZEN Blatt und zwei Prozentwerten -
     * kein zweites Bild, kein Zuschneiden auf dem Server. Gerechnet wird
     * erst, wenn das Bild seine echten Masse kennt; vorher steht nur der
     * leere Rahmen da. */
    /* Einmal je Bild gerechnet und gemerkt - nicht je Karte. */
    var zeilen;
    function schnipsel(k) {
      var aussen = el("div");
      var rahmen = el("div", "lwf-schnipsel lwf-rolle");
      aussen.appendChild(rahmen);
      if (!blattBild) {
        aussen.appendChild(el("div", "lwf-bu", "Dein Blatt lädt noch – die Frage geht trotzdem."));
        return aussen;
      }
      var im = el("img");
      im.alt = "Ausschnitt aus deinem Blatt";
      rahmen.appendChild(im);

      function setzen() {
        if (zeilen === undefined) zeilen = zeilenFinden(im);
        var breite = rahmen.clientWidth || 300;
        var nw = im.naturalWidth || 1, nh = im.naturalHeight || 1;
        var hoch = breite * nh / nw;                       // Bildhoehe bei voller Breite
        /* ⚠️ Das Modell verortet die Zeile nur ungefaehr - und der Fehler ist
         * systematisch: je weiter unten, desto weiter oben schaetzt es.
         * Gemessen am 23.09.2026 an Pauls Stadtportraet: von vier Baendern
         * sassen die beiden oberen richtig, die unteren 6 bzw. 12
         * Prozentpunkte zu hoch - der Ausschnitt zur Postleitzahl zeigte
         * die Eingemeindung.
         *
         * Bis der zweite Blick das genauer macht, wird das Band auf
         * mindestens ein Sechstel des Blattes aufgezogen, um die Mitte der
         * Modellangabe herum. Dann liegt die gesuchte Zeile mit grosser
         * Wahrscheinlichkeit drin - und dass man sie darin SUCHEN muss, ist
         * kein Mangel: Nachschlagen ist Lesen (dieselbe Idee wie bei Leons
         * Lesegeschichte und bei Stufe 2 im Lernquiz). */
        /* Hat der zweite Blick die Stelle gezielt nachgeschlagen (k.genau),
           bleibt das Band so schmal, wie er es angegeben hat - dann ist es
           ein Ausschnitt und kein Bereich. Nur die Schaetzung aus dem
           ersten Aufruf wird aufgezogen. */
        var mitte = (k.von + k.bis) / 2;
        var weit = k.genau ? (k.bis - k.von) : Math.max(k.bis - k.von, 17);
        var von = Math.max(0, Math.min(100 - weit, mitte - weit / 2));
        // Auf ganze Textzeilen aufziehen, damit der Schnitt nicht mitten
        // durch einen Buchstaben laeuft.
        var ein = einrasten(von, von + weit, zeilen);
        von = ein[0]; weit = ein[1] - ein[0];
        var band = hoch * weit / 100;                      // so hoch ist die Stelle
        /* Ein schmales Band ueber die volle Breite ist winzig. Also so weit
         * vergroessern, dass es etwa 120 px hoch wird - hoechstens aber
         * 2,4-fach, sonst sieht man von der Zeile nur noch ein Stueck. */
        var zoom = Math.max(1, Math.min(1.8, 170 / Math.max(band, 1)));
        im.style.width = (breite * zoom) + "px";
        im.style.marginTop = (-hoch * zoom * von / 100) + "px";
        rahmen.style.height = Math.round(band * zoom) + "px";
        // Mittig starten, damit bei Vergroesserung beide Seiten gleich weit weg sind.
        rahmen.scrollLeft = (breite * zoom - breite) / 2;
      }
      if (im.complete && im.naturalWidth) { im.src = blattBild; setzen(); }
      else { im.addEventListener("load", setzen); im.src = blattBild; }
      window.addEventListener("resize", setzen);

      /* NICHT "So steht es in deinem Heft" - der Ausschnitt trifft die Zeile
         nur ungefaehr, und eine Anzeige darf nie mehr behaupten, als
         gemessen wurde. */
      aussen.appendChild(el("div", "lwf-bu", "Irgendwo hier steht es – such es auf deinem Blatt"));
      var ganz = el("button", "lwf-ganz", "Das ganze Blatt ansehen");
      ganz.type = "button";
      ganz.addEventListener("click", grossZeigen);
      aussen.appendChild(ganz);
      return aussen;
    }

    function insRegal(k) {
      var s = slots[gefunden - 1];
      if (!s) return;
      s.className = "lwf-slot voll";
      s.innerHTML = "";
      if (blattBild) {
        var im = el("img"); im.src = blattBild; im.alt = "";
        /* Die Miniatur zeigt die Stelle, nicht das halbe Blatt: senkrecht
           genau dort, wo die Karte sass. */
        im.style.objectPosition = "50% " + Math.max(0, Math.min(100, (k.von + k.bis) / 2)) + "%";
        s.appendChild(im);
      }
      s.appendChild(el("b", null, k.stichwort || "Fund"));
      zahl.textContent = gefunden + " von " + karten.length;
    }

    function zeichne() {
      halter.innerHTML = "";
      if (i >= karten.length) {
        var fertig = el("div", "lwf-karte rein");
        fertig.appendChild(el("div", "kicker", "Regal voll"));
        fertig.appendChild(el("h2", null, karten.length + " von " + karten.length));
        fertig.appendChild(el("p", "u",
          "Alle Karten aus deinem Blatt liegen im Regal. Du hast dein Blatt jetzt einmal ganz durchgesehen."));
        var b1 = el("button", "lwf-knopf", "Weiter");
        b1.type = "button";
        b1.addEventListener("click", function () { if (opt.fertig) opt.fertig(); });
        fertig.appendChild(b1);
        var b2 = el("button", "lwf-knopf leise", "Karten noch mal ansehen");
        b2.type = "button";
        b2.addEventListener("click", function () {
          i = 0; gefunden = 0;
          slots.forEach(function (s) { s.className = "lwf-slot"; s.innerHTML = ""; s.appendChild(el("em", null, "·")); });
          zahl.textContent = "0 von " + karten.length;
          h1.style.opacity = ""; h2.style.opacity = "";
          zeichne();
        });
        fertig.appendChild(b2);
        halter.appendChild(fertig);
        h1.style.opacity = 0; h2.style.opacity = 0;
        return;
      }

      var k = karten[i];
      var karte = el("div", "lwf-karte rein");
      var num = el("div", "lwf-num");
      num.appendChild(el("div", "kicker", "Karte " + (i + 1) + " von " + karten.length));
      num.appendChild(el("div", "kicker", k.stichwort || ""));
      karte.appendChild(num);
      karte.appendChild(schnipsel(k));
      karte.appendChild(el("div", "lwf-frage", k.frage));

      var sagt = el("div", "lwf-tipp", "");
      var chips = el("div", "lwf-chips");
      var fertigChip = false;

      antworten(k, i).forEach(function (text) {
        var b = el("button", "lwf-chip");
        b.type = "button";
        b.appendChild(el("span", "lwf-mark", "✓"));
        b.appendChild(el("span", null, text));
        b.addEventListener("click", function () {
          if (fertigChip) return;
          if (text === String(k.richtig)) {
            fertigChip = true;
            b.className = "lwf-chip gut";
            [].forEach.call(chips.children, function (c) {
              c.disabled = true;
              if (c !== b) c.style.opacity = .32;
            });
            sagt.className = "lwf-lob";
            sagt.textContent = "Richtig gelesen. Die Karte kommt ins Regal.";
            var w = el("button", "lwf-knopf", "Karte ins Regal legen");
            w.type = "button";
            w.addEventListener("click", function () {
              w.disabled = true;
              karte.classList.add("ab");
              gefunden++;
              insRegal(k);
              setTimeout(function () { i++; zeichne(); }, 450);
            });
            karte.appendChild(w);
          } else {
            /* Danebengetippt kostet nichts - der Knopf tritt zurueck, die
               Karte bleibt. "Kein Druck ueber Verlustangst" (04.09.2026). */
            b.className = "lwf-chip daneben";
            b.disabled = true;
            sagt.className = "lwf-tipp";
            sagt.textContent = "Noch nicht. Schau dir den Ausschnitt noch mal genau an.";
          }
        });
        chips.appendChild(b);
      });

      karte.appendChild(chips);
      karte.appendChild(sagt);
      halter.appendChild(karte);
    }

    zeichne();
    blattHolen(kind, opt.blattId, function (b) {
      blattBild = b;
      if (b && i < karten.length) zeichne();   // jetzt mit Ausschnitt
    });
    return true;
  }

  global.LWFund = { zeigen: zeigen };
})(window);
