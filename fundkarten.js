/* Die Fundkarten - der Bildschirm direkt nach dem Hochladen eines Blattes.
 *
 * ⚠️ Seit 25.09.2026 NICHT mehr nach dem Hochladen, sondern als Such-Spiel
 * im Lernquiz (paul/quiz.html). Denny: "Brauchst du das, um die Zahlen zu
 * verifizieren, oder ginge es auch ohne? Denn dann wuerde ich das Ganze gerne
 * eher als Quiz- und Spielmoeglichkeit fuer Paul haben wollen." Zum Pruefen
 * der Zahlen braucht der Server die Karten nicht - Paul startet sie selbst.
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

    /* Mathe-Wiederholung (26.10.2026, nur Paul): ein Eingabefeld statt drei Knoepfe. */
    ".lwf-frage.lwf-mathe{white-space:pre-line}",
    /* Lese-Wiederholung (28.10.2026, ein Kind): Textauszug mit gedruckten Zeilennummern. */
    ".lwf-auszug{border-radius:12px;border:1px solid " + LINE + ";padding:10px 12px;font-size:16px;line-height:1.55;color:" + INK + "}",
    ".lwf-zeile{display:flex;gap:10px}",
    ".lwf-znr{flex:none;min-width:2.2em;text-align:right;font-weight:700;color:" + MUT + ";font-variant-numeric:tabular-nums}",
    ".lwf-zt{flex:1;min-width:0}",
    ".lwf-wie{font-size:14px;color:" + MUT + ";margin:6px 2px 0;line-height:1.4}",
    ".lwf-eingabe{display:flex;gap:8px;margin-top:11px}",
    ".lwf-feld{flex:1;min-width:0;min-height:52px;padding:10px 14px;border-radius:14px;border:1.5px solid " + LINE + ";",
    "  background:" + K + ";color:" + INK + ";font-size:20px;font-family:inherit}",
    ".lwf-feld.gut{border-color:" + GUT + ";background:rgba(74,222,155,.14)}",
    ".lwf-pruefen{min-height:52px;min-width:96px;border:none;border-radius:14px;background:" + AKZ + ";",
    "  color:" + AUF + ";font:700 16px var(--rund,inherit);cursor:pointer}",
    ".lwf-pruefen[disabled]{opacity:.4;cursor:default}",
    /* Selbst schreiben (02.11.2026, nur Paul): derselbe Schalter wie im Lernquiz. */
    ".lwf-selbst{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:48px;margin:10px 0 0;" +
      "padding:6px 14px;border:2px solid " + LINE + ";border-radius:14px;background:" + K + ";color:" + INK + ";font:700 16px/1.2 var(--rund,inherit);cursor:pointer}",
    ".lwf-selbst b{min-width:52px;padding:6px 10px;border-radius:999px;background:" + LINE + ";text-align:center}",
    ".lwf-selbst[aria-pressed=true]{border-color:" + AKZ + "}.lwf-selbst[aria-pressed=true] b{background:" + AKZ + ";color:" + AUF + "}",
    ".lwf-weg{margin:10px 2px 0;padding:9px 12px;border-radius:12px;font-size:14.5px;line-height:1.5;" +
      "border:1px solid " + LINE + ";white-space:pre-line}",
    ".lwf-tipp{font-size:14px;color:var(--orange,#b45309);margin:10px 2px 0;line-height:1.45}",
    ".lwf-lob{font-size:14px;color:" + GUT + ";margin:10px 2px 0;line-height:1.45}",
    /* Die Merkhilfe (25.09.2026): getoente Flaeche mit Alpha, die Schrift erbt
       die Kartenfarbe - so passt sie hell wie dunkel. */
    ".lwf-merke{margin:10px 2px 0;padding:9px 12px;border-radius:12px;font-size:14.5px;line-height:1.45;" +
      "background:rgba(245,158,11,.13);border:1px solid rgba(245,158,11,.4)}",
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
    ".lwf-drehen{position:absolute;top:10px;left:10px;min-height:56px;padding:0 18px;border-radius:16px;border:0;font:inherit;font-weight:700;font-size:18px;background:#fff;color:#111;cursor:pointer}",
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

  /* Derselbe Lernpunkt wie punktSchluessel() in _wiedervorlage.js - fuer
     "Deine Woche" (Kreise fuellen, 29.09.2026). */
  function lernpunkt(k) {
    var blatt = String(k.blatt || aktuellesBlatt || "");
    if (!blatt) return "";
    if (k.mathe) return blatt + "#k:" + schluessel({ richtig: k.mathe.art });
    if (k.lesen) return blatt + "#k:" + schluessel({ richtig: k.lesen.id });
    if (k.quiz) return k.quiz.belegNr ? blatt + "#" + Math.floor(Number(k.quiz.belegNr))
                     : k.quiz.frageId ? blatt + "#f:" + String(k.quiz.frageId).slice(0, 24) : "";
    var s = String(k.richtig || "").toLowerCase().replace(/[^a-z0-9äöüß]+/g, "").slice(0, 40);
    return s ? blatt + "#k:" + s : "";
  }
  var aktuellesBlatt = "";
  /* Antwort-Kennung (03.11.2026, nur Paul; lernstand.js nimmt sie nur bei Paul an): Fragen-ID, Frageart,
     Antwortweise je Blatt-Antwort. Nur Sicheres: Blattkarte = Frageart "n" (eine Zweitform aus Schritt 3a
     ist keine der vier Fragearten, also leer); Quiz-Karte nur mit der Angabe des Servers (k.zeige), sonst
     leer. Mathe und Lesen sind keine Blatt-Antworten. weise: "k" angetippt, "s" selbst geschrieben. */
  function kennungVon(k, weise) {
    try {
      if (!k || k.mathe || k.lesen || !lernpunkt(k)) return undefined;
      var o = { aw: weise === "k" || weise === "s" ? weise : "" };
      if (k.quiz) {
        if (k.zeige && typeof k.zeige === "object") { o.q = String(k.zeige.q || ""); o.fa = String(k.zeige.fa || ""); }
      } else if (k.form !== "andere") o.fa = "n";
      return o;
    } catch (e) { return undefined; }
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
    /* Lese-Karte (28.10.2026): Die Lage der richtigen Antwort haengt am Tag (k.lesen.pos), sonst stuende
       sie bei nur 1 Karte je Runde immer an derselben Stelle. */
    if (k.lesen && k.lesen.pos != null) i = Number(k.lesen.pos) || 0;
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

  /* Rueckweg-Schalter (02.11.2026, Auftrag 193, nur Paul): "bildlast" und "fundtippen", einmal je Seite
     gefragt, schon beim Laden der Datei. "alt" oder kein Netz = genau wie vorher. */
  var schalter = {};
  function schalterFragen(name) {
    if (schalter[name]) return schalter[name];
    var w = schalter[name] = { wert: null, warte: [] };
    function fertig(x) { w.wert = x; w.warte.splice(0).forEach(function (f) { try { f(x); } catch (e) {} }); }
    try {
      fetch("/api/schalter?name=" + name, { credentials: "same-origin", cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { fertig(d && d.wert === "neu" ? "neu" : "alt"); })
        .catch(function () { fertig("alt"); });
    } catch (e) { fertig("alt"); }
    return w;
  }
  function schalterDann(name, f) { var w = schalterFragen(name); if (w.wert) f(w.wert); else w.warte.push(f); }
  try { if (/^\/paul\//.test(global.location.pathname)) { schalterFragen("bildlast"); schalterFragen("fundtippen"); } } catch (e) {}

  /* Bildlast "neu" (Paul: „Ein Bild hat gerade 30 Sekunden lang geladen.“): das Foto als echtes Bild mit
     Abdruck in der Adresse (functions/api/_bildantwort.js) - der Browser haelt es 30 Tage, ein neues oder
     gedrehtes Foto hat eine neue Adresse. Geladen wird nur, was die offene und die naechste Karte zeigen. */
  function bildAdresse(kind, id) {
    return "/api/schulstoff?kind=" + encodeURIComponent(kind) + "&bild=" + encodeURIComponent(id + ":0") + "&format=jpeg";
  }

  /* Selbst schreiben in den Fundkarten (02.11.2026, nur Paul): derselbe Schalter und Speicher wie im
     Lernquiz (quiz/motor.js), dieselbe Wertung (QUIZ_FREI_PRUEFEN), Zahlen wie LWMathe. Freiwillig -
     die Stufen des Lernquiz aendert das nicht. Taugt nur fuer kurze Antworten (1-3 Woerter, wie selbstOk). */
  var SELBST = "paul-quiz-selbst";
  function selbstLesen() { try { return JSON.parse(global.localStorage.getItem(SELBST)) === true; } catch (e) { return false; } }
  function selbstSchreiben(an) { try { global.localStorage.setItem(SELBST, JSON.stringify(!!an)); } catch (e) {} }
  function istZahl(t) { return /^[-\u2212]?\d+([.,]\d+)*$/.test(String(t).trim()); }
  function tippTauglich(k) {
    var r = String((k && k.richtig) || "").trim();
    if (!auswahlAlt && auswahlFrage(k)) return false;   // Auswahlschutz (03.11.2026)
    return !!r && r.length <= 40 && r.split(/\s+/).length <= 3 && !/[.!?;:]$/.test(r);
  }

  /* Auswahlschutz (03.11.2026, Pauls Meldung 07:56 MEZ, nur Paul): „Welches Wort ist richtig geschrieben?“
     ist nur MIT den Antworten eindeutig - mit „Selbst schreiben an“ sah Paul ein leeres Feld und keine
     Auswahl. Solche Fragen bekommen den Schalter nicht, die Antworten bleiben zum Antippen. Ausnahme: die
     Antwort steht schon in der Frage. Dieselbe Regel wie istAuswahlFrage() in functions/api/_fragerichtung.js
     (pruefe-auswahlschutz.mjs vergleicht beide an allen Karten). Rueckweg: /api/schalter?name=auswahlschutz
     = "alt" schaltet den Schutz ab der naechsten Karte aus. Ohne Antwort oder Netz bleibt der Schutz an. */
  var AUSWAHL_MUSTER = [
    /richtig geschrieben|falsch geschrieben|schreibweise|richtige schreibung/i,
    /\bwelche[rsnm]?\s+(wort|w(?:ö|oe)rter|lernwort|lernw(?:ö|oe)rter|begriff|begriffe|ausdruck|satz|s(?:ä|ae)tze|nomen|namenwort|namenw(?:ö|oe)rter|verb|verben|tunwort|adjektiv|adjektive|wiewort|aussage|antwort|(?:ü|ue)berschrift|erkl(?:ä|ae)rung|beschreibung|rechnung|l(?:ö|oe)sung|schreibung)\s+(ist|sind|passt|passen|geh(?:ö|oe)rt|geh(?:ö|oe)ren|steht|stehen|beschreibt|bedeutet|reimt|stimmt|stimmen)\b/i,
    /\bwelche[rsnm]?\s+(mal|plus|minus|geteilt|rechen)?aufgaben?\s+(hat|haben|ergibt|ergeben|geh(?:ö|oe)rt|passt|stimmt|ist)\b/i,
    /\bwelche[rsnm]?\s+(ist|sind)\s+(richtig|falsch)\b/i,
    /\b(passt|geh(?:ö|oe)rt)\s+nicht\b|\bnicht dazu\b|nicht in die reihe/i,
    /^\s*wie schreibt man (das|dieses) wort richtig\s*\??\s*$/i,
    /\b(w(?:ä|ae)hle|kreuze|markiere)\b/i,
    /\bwelche[rsnm]?\s+(dieser|davon|der folgenden)\b/i
  ];
  var ARTIKEL = ["der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem", "einer", "eines"];
  function normWorte(x) { return String(x == null ? "" : x).toLowerCase().replace(/[^a-z0-9äöüß]+/g, " ").trim(); }
  function auswahlFrage(k) {
    var frage = String((k && k.frage) || "");
    if (!AUSWAHL_MUSTER.some(function (re) { return re.test(frage); })) return false;
    var text = " " + normWorte(frage) + " " + normWorte(k && k.kontext) + " ";
    var worte = normWorte(k && k.richtig).split(" ").filter(function (w) { return w && ARTIKEL.indexOf(w) < 0; });
    return !(worte.length > 0 && worte.every(function (w) { return text.indexOf(" " + w + " ") >= 0; }));
  }
  var auswahlAlt = false;
  try {
    if (/^\/paul\//.test(global.location.pathname))
      fetch("/api/schalter?name=auswahlschutz", { credentials: "same-origin", cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { auswahlAlt = !!(d && d.wert === "alt"); })
        .catch(function () {});
  } catch (e) {}
  global.LWAuswahl = { frage: auswahlFrage };
  function tippWerten(k, text) {
    var T = global.LWToleranz, r = String(k.richtig);
    if (istZahl(r)) {
      if (global.LWMathe) return { stimmt: !!global.LWMathe.pruefen({ richtig: r, mathe: { eingabe: "zahl" } }, text, T).stimmt };
      return { stimmt: T.pruefen(text.replace(/(\d)[.\s](?=\d{3}(?!\d))/g, "$1"), r, { tippfehler: false }).stufe === "gut" };
    }
    var f = String(k.fach || ""), sp = /^englisch/.test(f) ? "en" : /^franz/.test(f) ? "fr" : "de";
    var e = T.pruefen(text, r, { sprache: sp, verboten: (k.falsch || []).slice(), trennen: "keine",
      artikelEgal: sp !== "fr", zusatzWorte: sp === "de" && !/^deutsch/.test(f) });
    return { stimmt: e.stufe === "gut" || e.stufe === "fast", fast: e.stufe === "fast" };
  }

  /* Der Lernpunkt einer Karte: die Antwort, vereinfacht. Dieselbe Regel
     wie punktSchluessel() in functions/api/_wiedervorlage.js - der Server
     vereinfacht noch einmal, eine Abweichung hier kostet also nichts. */
  function schluessel(k) {
    return String((k && k.richtig) || "").toLowerCase().replace(/[^a-z0-9äöüß]+/g, "").slice(0, 40);
  }

  function zeigen(wurzel, opt) {
    aktuellesBlatt = (opt && opt.blattId) || "";
    opt = opt || {};
    var karten = (opt.karten || []).filter(function (k) {
      return k && k.frage && k.richtig && k.falsch && k.falsch.length === 2;
    });
    /* Wiedervorlage (25.09.2026): Was faellig ist, kommt zuerst - es wird
       nichts weggelassen, nur umsortiert. opt.zuerst: Liste von Schluesseln. */
    if (opt.zuerst && opt.zuerst.length) {
      var vorn = {};
      opt.zuerst.forEach(function (s) { vorn[String(s).split("#k:").pop()] = 1; });
      karten = karten.map(function (k, n) { return { k: k, n: n, v: vorn[schluessel(k)] ? 0 : 1 }; })
        .sort(function (a, b) { return (a.v - b.v) || (a.n - b.n); })
        .map(function (x) { return x.k; });
    }
    /* Unter drei Karten lohnt der Bildschirm nicht - dann ist es kein
       Stapel, sondern eine Unterbrechung. Lieber gar nicht zeigen. */
    if (!wurzel || karten.length < (opt.mindestens || 3)) return false;

    stilEinhaengen();
    var kind = opt.kind || "paul";
    /* Mehrere Blaetter in einem Stapel (Tagesrunde, 25.09.2026): Traegt eine
       Karte ihr eigenes .blatt, kommt ihr Ausschnitt aus DIESEM Foto. Ohne
       gilt opt.blattId wie bisher. Je Blatt ein Bild und eine Zeilensuche. */
    var bilder = {}, zeilenJe = {};
    /* Schalter (nur Paul): meist schon beantwortet, sonst nach der Antwort nachgeholt (Ende von zeigen). */
    var bildNeu = kind === "paul" && schalterFragen("bildlast").wert === "neu";
    var tippNeu = kind === "paul" && schalterFragen("fundtippen").wert === "neu";
    var rueck = {};
    function rueckfall(bid) {     // JPEG-Weg scheitert: der alte JSON-Weg, wie bisher
      if (rueck[bid]) return;
      rueck[bid] = 1;
      blattHolen(kind, bid, function (b) {
        bilder[bid] = b;
        Array.prototype.forEach.call(document.querySelectorAll("img[data-lwf-blatt]"), function (im) {
          if (im.getAttribute("data-lwf-blatt") === bid) im.src = b;
        });
      });
    }
    function vorladen() {         // nur die offene und die naechste Karte
      [i, i + 1].forEach(function (n) {
        var k = karten[n], bid = blattVon(k);
        if (!k || k.mathe || k.lesen || k.quiz || !bid || bilder[bid]) return;
        bilder[bid] = bildAdresse(kind, bid);
        var vor = new Image();
        vor.onerror = function () { rueckfall(bid); };
        vor.src = bilder[bid];
      });
    }
    function blattVon(k) { return (k && k.blatt) || opt.blattId || ""; }
    function gruenFuer(bid) {
      if (opt.gruenJe && Array.isArray(opt.gruenJe[bid])) return opt.gruenJe[bid];
      return (bid === opt.blattId && Array.isArray(opt.gruen)) ? opt.gruen : null;
    }
    function bildVon(k) { return bilder[blattVon(k)] || ""; }
    /* Nach dem Knopf "Drehen": neues Bild für alle Karten dieses Blattes. Die Stelle auf dem
       gedrehten Blatt kennt erst der Server - bis zum nächsten Laden zeigt die Karte das ganze
       Blatt statt einer falschen Stelle (Auftrag 178). */
    function gedreht(bid, neu) {
      bilder[bid] = neu;
      delete zeilenJe[bid];
      karten.forEach(function (k) { if (blattVon(k) === bid && typeof k.von === "number") { k.von = 0; k.bis = 100; k.genau = false; } });
      Array.prototype.forEach.call(document.querySelectorAll("img[data-lwf-blatt]"), function (im) {
        if (im.getAttribute("data-lwf-blatt") === bid) im.src = neu;
      });
    }
    var i = 0, gefunden = 0;
    /* Gezaehlt wird der ERSTE Tipp je Karte - wer erst nach einem
       Danebentippen trifft, hat noch nachgeschaut. Dieselbe Regel wie
       stimmtEcht im Lernquiz. Gemeldet wird einmal je Durchgang. */
    var erster = {}, gemeldet = false;
    /* Mathe zaehlt einmal je Runde: "gleich nochmal" und "noch mal ansehen" melden sie nicht
       erneut - sonst stiege die Stufe am selben Tag (Kapitel 142: richtig an VERSCHIEDENEN Tagen). */
    var matheGemeldet = !!opt.nurWackler;

    wurzel.innerHTML = "";
    var box = el("div", "lwf");
    wurzel.appendChild(box);

    var kopf = el("div");
    kopf.appendChild(el("div", "kicker", (opt.kicker || "Such-Spiel") + (opt.was ? " · " + String(opt.was).slice(0, 40) : "")));
    kopf.appendChild(el("h2", null, opt.ueberschrift || (karten.length + " Fundkarten aus deinem Blatt")));
    kopf.appendChild(el("p", "u", opt.nurWackler
      ? "Das sind die Karten, bei denen du beim ersten Tipp noch nachschauen musstest."
      : (opt.unter || ("Ich habe dein Blatt gelesen und " + karten.length +
        " Stellen ausgeschnitten. Schau hin und tipp an, was dort steht."))));
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

    function grossZeigen(k) {
      var blattBild = bildVon(k);
      if (!blattBild && bildNeu && blattVon(k)) blattBild = bilder[blattVon(k)] = bildAdresse(kind, blattVon(k));
      if (!blattBild) return;
      var lage = el("div", "lwf-gross");
      var im = el("img"); im.src = blattBild; im.alt = "Dein ganzes Blatt";
      if (bildNeu) { im.setAttribute("data-lwf-blatt", blattVon(k)); im.addEventListener("error", function () { rueckfall(blattVon(k)); }); }
      lage.appendChild(im);
      var zu = el("button", "lwf-zu", "×");
      zu.type = "button";
      zu.setAttribute("aria-label", "Schließen");
      lage.appendChild(zu);
      /* Knopf "Drehen" (Auftrag 178, 30.10.2026) - nur wo /blatt-drehen.js geladen ist (Paul). */
      if (global.LWDrehen && blattVon(k)) {
        global.LWDrehen.knopf(lage, { kind: kind, klasse: "lwf-drehen",
          wer: function () { return { id: blattVon(k), nr: 0, img: im }; },
          fertig: function (neu, g, z) { gedreht(z.id, neu); } });
      }
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
    function schnipsel(k) {
      var blattBild = bildVon(k), bid = blattVon(k);
      var aussen = el("div");
      /* Quizfrage in der Tagesrunde (28.09.2026): Sie hat keine Stelle im
         Foto. Kein Ausschnitt, aber das ganze Blatt zum Nachsehen. */
      if (k.mathe) {
        aussen.appendChild(el("div", "lwf-bu", "Eine Mathe-Aufgabe zum Wiederholen. Rechne gern auf einem Zettel mit."));
        return aussen;
      }
      /* Lese-Wiederholung (28.10.2026, Kapitel 149): kein Foto, sondern der Text selbst -
         bei "Zeile finden" der Auszug mit den gedruckten Zeilennummern. */
      if (k.lesen) {
        var titel = k.lesen.text ? "„" + k.lesen.text + "“" : "deinem Lesetext";
        if (k.lesen.zeilen && k.lesen.zeilen.length) {
          var aus = el("div", "lwf-auszug");
          aus.setAttribute("aria-label", "Auszug aus " + titel);
          k.lesen.zeilen.forEach(function (z) {
            var zl = el("div", "lwf-zeile");
            zl.appendChild(el("span", "lwf-znr", String(z.n)));
            zl.appendChild(el("span", "lwf-zt", String(z.t)));
            aus.appendChild(zl);
          });
          aussen.appendChild(aus);
          aussen.appendChild(el("div", "lwf-bu", "Aus " + titel + ". Die Zahl vorn ist die Zeile."));
        } else {
          aussen.appendChild(el("div", "lwf-bu", "Eine Frage zu " + titel + ". Lies alle drei Antworten genau."));
        }
        return aussen;
      }
      if (k.quiz) {
        aussen.appendChild(el("div", "lwf-bu", "Eine Frage aus deinem Quiz. Wenn du nachsehen willst: dein Blatt."));
        if (blattBild || (bildNeu && bid)) {   // bildlast neu: das Foto laedt erst beim Antippen
          var gq = el("button", "lwf-ganz", "Das ganze Blatt ansehen");
          gq.type = "button";
          gq.addEventListener("click", function () { grossZeigen(k); });
          aussen.appendChild(gq);
        }
        return aussen;
      }
      var rahmen = el("div", "lwf-schnipsel lwf-rolle");
      aussen.appendChild(rahmen);
      if (!blattBild) {
        aussen.appendChild(el("div", "lwf-bu", "Dein Blatt lädt noch – die Frage geht trotzdem."));
        return aussen;
      }
      var im = el("img");
      im.alt = "Ausschnitt aus deinem Blatt";
      im.setAttribute("data-lwf-blatt", bid);
      if (bildNeu) im.addEventListener("error", function () { rueckfall(bid); });
      rahmen.appendChild(im);

      function setzen() {
        if (zeilenJe[bid] === undefined) zeilenJe[bid] = zeilenFinden(im);
        var zeilen = zeilenJe[bid];
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
        /* Quer liegendes Blatt bei Paul (Auftrag 178, 30.10.2026): Die Zeile geht über die
           ganze Bildbreite. Kein Vergrößern (sonst ist sie seitlich abgeschnitten) und ein
           großzügigeres Band - Denny: „der Ausschnitt ist so eng, dass der Text abgeschnitten ist“. */
        var quer = kind === "paul" && nw > nh;
        var mitte = (k.von + k.bis) / 2;
        var weit = k.genau ? (k.bis - k.von) : Math.max(k.bis - k.von, quer ? 24 : 17);
        var von = Math.max(0, Math.min(100 - weit, mitte - weit / 2));
        // Auf ganze Textzeilen aufziehen, damit der Schnitt nicht mitten
        // durch einen Buchstaben laeuft.
        var ein = einrasten(von, von + weit, zeilen);
        von = ein[0]; weit = ein[1] - ein[0];
        var band = hoch * weit / 100;                      // so hoch ist die Stelle
        /* Ein schmales Band ueber die volle Breite ist winzig. Also so weit
         * vergroessern, dass es etwa 120 px hoch wird - hoechstens aber
         * 2,4-fach, sonst sieht man von der Zeile nur noch ein Stueck. */
        var zoom = quer ? 1 : Math.max(1, Math.min(1.8, 170 / Math.max(band, 1)));
        im.style.width = (breite * zoom) + "px";
        im.style.marginTop = (-hoch * zoom * von / 100) + "px";
        rahmen.style.height = Math.round(band * zoom) + "px";
        // Mittig starten, damit bei Vergroesserung beide Seiten gleich weit weg sind.
        rahmen.scrollLeft = (breite * zoom - breite) / 2;
        /* Verbessert durch Claude (14.10.2026): Was Paul verbessert hat, steht
           auch im Ausschnitt gruen darueber - nie im Foto selbst (/fehlerkreis.js).
           Nur Seite 0 (die Karten zeigen immer Seite 0) und nur fuer das Blatt,
           zu dem opt.gruen gehoert. */
        /* Mehrere Blaetter (Heute lernen, Kreise fuellen, 14.10.2026): opt.gruenJe
           = { <blatt-id>: [...] } - jede Karte bekommt das Gruen IHRES Blattes. */
        var gr = gruenFuer(bid);
        if (window.LWKreis && gr && gr.length) {
          if (!im._gruen) im._gruen = LWKreis.legen(im, gr, {});
          else im._gruen.malen();
        }
      }
      if (im.complete && im.naturalWidth) { im.src = blattBild; setzen(); }
      else { im.src = blattBild; }
      im.addEventListener("load", setzen);
      window.addEventListener("resize", setzen);

      /* NICHT "So steht es in deinem Heft" - der Ausschnitt trifft die Zeile
         nur ungefaehr, und eine Anzeige darf nie mehr behaupten, als
         gemessen wurde. */
      aussen.appendChild(el("div", "lwf-bu", "Irgendwo hier steht es – such es auf deinem Blatt"));
      var ganz = el("button", "lwf-ganz", "Das ganze Blatt ansehen");
      ganz.type = "button";
      ganz.addEventListener("click", function () { grossZeigen(k); });
      aussen.appendChild(ganz);
      return aussen;
    }

    function insRegal(k) {
      var s = slots[gefunden - 1];
      if (!s) return;
      s.className = "lwf-slot voll";
      s.innerHTML = "";
      if (bildVon(k) && !k.quiz) {
        var im = el("img"); im.src = bildVon(k); im.alt = "";
        /* Die Miniatur zeigt die Stelle, nicht das halbe Blatt: senkrecht
           genau dort, wo die Karte sass. */
        im.style.objectPosition = "50% " + Math.max(0, Math.min(100, (k.von + k.bis) / 2)) + "%";
        s.appendChild(im);
      }
      s.appendChild(el("b", null, k.stichwort || "Fund"));
      zahl.textContent = gefunden + " von " + karten.length;
    }

    /* Mathe-Karte (26.10.2026, Kapitel 142): eintippen und pruefen. Gewertet wird nach Inhalt
       (LWMathe.pruefen, Zahlen ueber /toleranz.js), gezaehlt der ERSTE Versuch. Nach einem
       Fehlversuch kommt die Hilfe, nach dem zweiten darf Paul sich den Rechenweg zeigen lassen -
       steckenbleiben soll niemand. */
    function matheKarte(k, karte, sagt, merkZeigen) {
      var m = k.mathe, versuche = 0, fertigM = false;
      if (m.wie) karte.appendChild(el("div", "lwf-wie", m.wie));
      var reihe = el("div", "lwf-eingabe");
      var feld = el("input", "lwf-feld");
      feld.type = "text"; feld.autocomplete = "off"; feld.spellcheck = false;
      feld.setAttribute("autocapitalize", "off");
      feld.setAttribute("inputmode", m.eingabe === "zahl" ? "numeric" : "text");
      feld.setAttribute("aria-label", "Deine Antwort");
      var knopf = el("button", "lwf-pruefen", "Prüfen");
      knopf.type = "button";
      reihe.appendChild(feld); reihe.appendChild(knopf);
      karte.appendChild(reihe);
      karte.appendChild(sagt);
      var loes = null;
      function wegZeigen(mitLoesung) {
        var zeilen = (m.weg || []).filter(Boolean);
        var text = (mitLoesung ? "Richtig ist: " + k.richtig + "\n" : "") + (zeilen.length ? "So geht der Rechenweg:\n" + zeilen.join("\n") : "");
        if (!text) return;
        var w = el("div", "lwf-weg", text);
        karte.insertBefore(w, sagt.nextSibling);
      }
      function abschliessen() {
        fertigM = true;
        feld.disabled = true; knopf.disabled = true;
        if (loes && loes.parentNode) loes.parentNode.removeChild(loes);
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
      }
      function pruefen() {
        if (fertigM) return;
        var r = window.LWMathe ? window.LWMathe.pruefen(k, feld.value) : { stimmt: false };
        if (r.leer) { sagt.className = "lwf-tipp"; sagt.textContent = "Schreib zuerst deine Antwort hinein."; feld.focus(); return; }
        versuche++;
        if (erster[i] === undefined) {
          erster[i] = !!r.stimmt;
          try {
            if (window.lernstand && window.lernstand.antwort)
              window.lernstand.antwort(erster[i], "Mathe-Wiederholung", String(feld.value).slice(0, 40), k.richtig, lernpunkt(k));
          } catch (e) {}
        }
        if (r.stimmt) {
          feld.className = "lwf-feld gut";
          sagt.className = "lwf-lob";
          sagt.textContent = "Richtig gerechnet. Die Karte kommt ins Regal.";
          wegZeigen(false);
          abschliessen();
          return;
        }
        sagt.className = "lwf-tipp";
        sagt.textContent = k.merke ? "Noch nicht. Hier ist eine Hilfe – versuch es gleich nochmal." : "Noch nicht. Rechne noch einmal nach.";
        merkZeigen();
        feld.select();
        if (versuche >= 2 && !loes) {
          loes = el("button", "lwf-knopf leise", "Rechenweg zeigen");
          loes.type = "button";
          loes.addEventListener("click", function () {
            sagt.className = "lwf-tipp";
            sagt.textContent = "Schau dir den Rechenweg in Ruhe an. Die Aufgabe kommt wieder dran.";
            wegZeigen(true);
            abschliessen();
          });
          karte.appendChild(loes);
        }
      }
      knopf.addEventListener("click", pruefen);
      feld.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); pruefen(); } });
      halter.appendChild(karte);
    }

    function zeichne() {
      halter.innerHTML = "";
      if (i >= karten.length) {
        var wackler = karten.filter(function (k, n) { return erster[n] === false; });
        if (!gemeldet && opt.ergebnis) {
          gemeldet = true;
          try {
            var meld = [];
            karten.forEach(function (k, n) {
              /* Mathe und Lesen zaehlen einmal je Runde (matheGemeldet gilt fuer beide). */
              if ((k.mathe || k.lesen) && matheGemeldet) return;
              var e1 = { blatt: blattVon(k), karte: k.mathe ? k.mathe.art : (k.lesen ? k.lesen.id : schluessel(k)), stimmt: erster[n] !== false };
              if (k.quiz) e1.quiz = k.quiz;
              if (k.kreis) e1.kreis = k.kreis;   // Kreise fuellen: welche Punkte in "Deine Woche"
              meld.push(e1);
            });
            matheGemeldet = true;
            if (meld.length) opt.ergebnis(meld);
          } catch (e) {}
        }
        var fertig = el("div", "lwf-karte rein");
        fertig.appendChild(el("div", "kicker", "Regal voll"));
        fertig.appendChild(el("h2", null, karten.length + " von " + karten.length));
        var satz = el("p", "u", opt.fertigSatz ||
          "Alle Karten aus deinem Blatt liegen im Regal. Du hast dein Blatt jetzt einmal ganz durchgesehen.");
        fertig.appendChild(satz);
        if (wackler.length) {
          /* Kein Rot, keine Fehlerzahl - nur die Stichworte und ein Angebot.
             Die Karten kommen ausserdem in zwei Tagen von selbst wieder. */
          var w1 = el("p", "u lwf-wackler", "Beim ersten Tipp noch nachgeschaut: " +
            wackler.map(function (k) { return k.stichwort || k.richtig; }).join(", ") +
            (wackler.some(function (k) { return k.mathe || k.lesen; }) ? ". Die kommen in ein paar Tagen wieder dran."
                                                             /* Paul: Schritt 3b (29.10.2026) - 1, 2 oder 3 Tage je nach Fehlern in Folge. */
                                                             : opt.kind === "paul" ? ". Die kommen bald wieder dran."
                                                             : ". Die kommen in zwei Tagen wieder dran."));
          fertig.appendChild(w1);
          var bw = el("button", "lwf-knopf lwf-nochmal",
            wackler.length === 1 ? "Die eine gleich nochmal" : "Die " + wackler.length + " gleich nochmal");
          bw.type = "button";
          bw.addEventListener("click", function () {
            var neu = {}; for (var x in opt) neu[x] = opt[x];
            neu.karten = wackler; neu.zuerst = null; neu.nurWackler = true;
            /* Unter drei Karten zeigt zeigen() nichts - hier ist es gewollt. */
            neu.mindestens = 1;
            zeigen(wurzel, neu);
          });
          fertig.appendChild(bw);
        }
        /* "Noch 10 Fragen" (19.10.2026, Fach-Runde aus quiz/such.js): freiwillig weiter, nur wenn die Seite es anbietet. */
        var bm = null;
        if (opt.mehrText && opt.mehr) {
          bm = el("button", "lwf-knopf lwf-mehr", opt.mehrText);
          bm.type = "button";
          bm.addEventListener("click", function () { opt.mehr(); });
          fertig.appendChild(bm);
        }
        var b1 = el("button", "lwf-knopf" + (opt.mehrText && opt.mehr ? " leise" : ""), opt.fertigText || "Weiter");
        b1.type = "button";
        b1.addEventListener("click", function () { if (opt.fertig) opt.fertig(); });
        fertig.appendChild(b1);
        var b2 = el("button", "lwf-knopf leise", "Karten noch mal ansehen");
        b2.type = "button";
        b2.addEventListener("click", function () {
          i = 0; gefunden = 0; erster = {}; gemeldet = false;
          slots.forEach(function (s) { s.className = "lwf-slot"; s.innerHTML = ""; s.appendChild(el("em", null, "·")); });
          zahl.textContent = "0 von " + karten.length;
          h1.style.opacity = ""; h2.style.opacity = "";
          zeichne();
        });
        fertig.appendChild(b2);
        /* Restrunde (02.11.2026, nur Paul aus quiz/such.js): die Seite darf den Abschluss ergaenzen. Ohne opt.abschluss wie vorher. */
        if (opt.abschluss) { try { opt.abschluss({ box: fertig, satz: satz, mehr: bm, fertig: b1 }); } catch (e) {} }
        halter.appendChild(fertig);
        h1.style.opacity = 0; h2.style.opacity = 0;
        return;
      }

      if (bildNeu) vorladen();
      var k = karten[i];
      var karte = el("div", "lwf-karte rein");
      var num = el("div", "lwf-num");
      num.appendChild(el("div", "kicker", "Karte " + (i + 1) + " von " + karten.length));
      /* Aus mehreren Blaettern gemischt: dazusagen, aus welchem. */
      num.appendChild(el("div", "kicker", (k.blattTitel && opt.mitBlattTitel
        ? String(k.blattTitel).slice(0, 28) + " · " : "") + (k.stichwort || "")));
      karte.appendChild(num);
      karte.appendChild(schnipsel(k));
      karte.appendChild(el("div", "lwf-frage" + (k.mathe ? " lwf-mathe" : ""), k.frage));

      var sagt = el("div", "lwf-tipp", "");
      /* Merkhilfe: nach dem ersten falschen Tipp, dann auch nach der richtigen
         Antwort zur Bestaetigung (Denny, 25.09.2026). Ohne Satz bleibt alles
         wie vorher. */
      var merk = null;
      function merkZeigen() {
        if (!k.merke || merk) return;
        merk = el("div", "lwf-merke", "\uD83D\uDCA1 " + k.merke);
        karte.insertBefore(merk, sagt.nextSibling);
      }
      if (k.mathe) { matheKarte(k, karte, sagt, merkZeigen); return; }
      var chips = el("div", "lwf-chips");
      var fertigChip = false;

      function zaehlen(text, stimmt, weise) {
        if (erster[i] !== undefined) return;
        erster[i] = stimmt;
        /* An die Statistik der Eltern (Denny, 25.09.2026, "gruppiert nach
           Blatt"): eine Aufgabe je Karte, gezaehlt der ERSTE Tipp, sofort -
           auch wenn Paul die Runde danach abbricht. Merkmal ist der
           Blatttitel, nicht die Karte: 16 Karten je Blatt wuerden "Woran es
           hakt" fluten. Ohne lernstand.js (Messung) passiert nichts. */
        try {
          if (window.lernstand && window.lernstand.antwort)
            window.lernstand.antwort(erster[i],
              String(k.blattTitel || opt.was || "such-spiel").slice(0, 40), text, k.richtig,
              lernpunkt(k), undefined, undefined, kennungVon(k, weise));
        } catch (e) {}
      }
      function richtigFertig(b, lob) {
        fertigChip = true;
        if (b) b.className = "lwf-chip gut";
        [].forEach.call(chips.children, function (c) {
          c.disabled = true;
          if (c !== b) c.style.opacity = .32;
        });
        sagt.className = "lwf-lob";
        sagt.textContent = lob || "Richtig gelesen. Die Karte kommt ins Regal.";
        merkZeigen();
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
      }

      antworten(k, i).forEach(function (text) {
        var b = el("button", "lwf-chip");
        b.type = "button";
        b.appendChild(el("span", "lwf-mark", "✓"));
        b.appendChild(el("span", null, text));
        b.addEventListener("click", function () {
          if (fertigChip) return;
          zaehlen(text, text === String(k.richtig), "k");
          if (text === String(k.richtig)) {
            richtigFertig(b);
          } else {
            /* Danebengetippt kostet nichts - der Knopf tritt zurueck, die
               Karte bleibt. "Kein Druck ueber Verlustangst" (04.09.2026). */
            b.className = "lwf-chip daneben";
            b.disabled = true;
            sagt.className = "lwf-tipp";
            sagt.textContent = k.merke ? "Noch nicht. Hier ist eine Hilfe - versuch es gleich nochmal."
                                       : (k.quiz ? "Noch nicht. Versuch es gleich nochmal."
                                                 : "Noch nicht. Schau dir den Ausschnitt noch mal genau an.");
            merkZeigen();
          }
        });
        chips.appendChild(b);
      });

      /* Selbst schreiben (fundtippen "neu", nur Paul, Quiz-Karten): Schalter wie im Lernquiz. Ist er an,
         kommt zuerst ein Eingabefeld; ein Fehlversuch zeigt die Antworten zum Antippen. Verbucht wird
         genau wie ein Tipp (zaehlen) - dieselbe Wiedervorlage. */
      if (tippNeu && k.quiz && global.LWToleranz && tippTauglich(k)) {
        var an = selbstLesen();
        var sb = el("button", "lwf-selbst");
        sb.type = "button";
        sb.setAttribute("aria-pressed", an ? "true" : "false");
        sb.appendChild(el("span", null, "\u270F\uFE0F Selbst schreiben"));
        sb.appendChild(el("b", null, an ? "an" : "aus"));
        sb.addEventListener("click", function () {
          selbstSchreiben(!an);
          if (erster[i] === undefined && !fertigChip) zeichne();
          else { an = !an; sb.setAttribute("aria-pressed", an ? "true" : "false"); sb.lastChild.textContent = an ? "an" : "aus"; }
        });
        karte.appendChild(sb);
        if (an && erster[i] === undefined) {
          var reihe = el("div", "lwf-eingabe");
          var feld = el("input", "lwf-feld");
          feld.type = "text"; feld.autocomplete = "off"; feld.spellcheck = false;
          feld.setAttribute("autocapitalize", "off");
          feld.setAttribute("inputmode", istZahl(k.richtig) ? "numeric" : "text");
          feld.setAttribute("aria-label", "Deine Antwort");
          var knopf = el("button", "lwf-pruefen", "Prüfen");
          knopf.type = "button";
          reihe.appendChild(feld); reihe.appendChild(knopf);
          karte.appendChild(reihe);
          karte.appendChild(sagt);
          var tippen = function () {
            if (fertigChip || erster[i] !== undefined) return;
            var text = String(feld.value || "").trim();
            if (!text) { sagt.className = "lwf-tipp"; sagt.textContent = "Schreib zuerst deine Antwort hinein."; feld.focus(); return; }
            var e = tippWerten(k, text);
            zaehlen(text.slice(0, 40), e.stimmt, "s");
            feld.disabled = true; knopf.disabled = true;
            if (e.stimmt) {
              feld.className = "lwf-feld gut";
              richtigFertig(null, "Richtig geschrieben. Die Karte kommt ins Regal.");
              if (e.fast) global.LWToleranz.zeigen(sagt, text, String(k.richtig), { wo: "So schreibt man es:" });
              return;
            }
            sagt.className = "lwf-tipp";
            sagt.textContent = "Noch nicht. Tipp unten die richtige Antwort an.";
            merkZeigen();
            karte.insertBefore(chips, sagt);
          };
          knopf.addEventListener("click", tippen);
          feld.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); tippen(); } });
          halter.appendChild(karte);
          return;
        }
      }

      karte.appendChild(chips);
      karte.appendChild(sagt);
      halter.appendChild(karte);
    }

    zeichne();
    function allesHolen() {     // bisheriger Weg: alle Blaetter beim Start, als JSON
      var ids = {};
      karten.forEach(function (k) { if (blattVon(k) && !k.mathe && !k.lesen) ids[blattVon(k)] = 1; });
      Object.keys(ids).forEach(function (id) {
        blattHolen(kind, id, function (b) {
          bilder[id] = b;
          /* Nur neu zeichnen, wenn die GERADE offene Karte davon profitiert -
             sonst springt die Karte unter dem Finger. */
          if (b && i < karten.length && blattVon(karten[i]) === id) zeichne();
        });
      });
    }
    if (kind !== "paul") allesHolen();
    else {
      /* Kam die Schalter-Antwort erst jetzt: die offene Karte umstellen, solange sie unberuehrt ist. */
      var offenUnberuehrt = function () { return i < karten.length && erster[i] === undefined && !karten[i].mathe && !karten[i].lesen; };
      if (!bildNeu) schalterDann("bildlast", function (w) {
        if (w !== "neu") { allesHolen(); return; }
        bildNeu = true;
        if (offenUnberuehrt() && blattVon(karten[i])) zeichne(); else vorladen();
      });
      if (!tippNeu) schalterDann("fundtippen", function (w) {
        if (w !== "neu") return;
        tippNeu = true;
        if (offenUnberuehrt() && karten[i].quiz) zeichne();
      });
    }
    return true;
  }

  global.LWFund = { zeigen: zeigen, schluessel: schluessel };
})(window);
