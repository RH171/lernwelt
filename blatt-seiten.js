/* Alle Seiten eines Blattes ansehen - an JEDER Stelle, an der ein Kind sein
 * Blatt gross sieht (04.10.2026).
 *
 * Denny am 04.10.2026: "Wenn Paul auf das Blatt (Geschichte 'Der Brief',
 * drei Seiten) klickt, kann er nur eine Seite anschauen, nicht die weiteren."
 * Gemessen: Im Speicher lagen alle drei Seiten (75rjuqomzx:0, :1, :2). Die
 * Grossansicht im Lernquiz holte aber fest Seite ":0" - es gab dort gar
 * keinen Weg zur zweiten Seite.
 *
 *   LWSeiten.blaettern({
 *     bild:   <img>,                    // wo die Seite steht
 *     leiste: <div>,                    // hier kommen ‹ Seite 2 von 3 › hin
 *     seiten: 3,
 *     holen:  function (nr) { return Promise<url|null> },
 *     start:  0
 *   })  ->  { gehe(nr), nr(), weg() }
 *
 *   LWSeiten.wischen(element, links, rechts)   // nur das Wischen
 *
 * Blaettern geht dreifach: Pfeil-Knoepfe (mind. 44 px, Finger), Wischen auf
 * dem Bild, Pfeiltasten. Bei einer Seite steht keine Leiste da.
 */
(function () {
  "use strict";

  var STIL = ".lwseiten{display:flex;align-items:center;justify-content:center;gap:12px}" +
    ".lwseiten button{min-width:52px;min-height:48px;padding:6px 14px;border-radius:14px;" +
    "border:none;background:rgba(127,127,127,.22);color:inherit;font:800 24px/1 system-ui,sans-serif;" +
    "cursor:pointer;touch-action:manipulation}" +
    ".lwseiten button:disabled{opacity:.35;cursor:default}" +
    ".lwseiten span{font:700 16px/1.2 system-ui,sans-serif;min-width:9.5em;text-align:center}";

  function stilEinmal() {
    if (document.getElementById("lwseiten-stil")) return;
    var s = document.createElement("style");
    s.id = "lwseiten-stil";
    s.textContent = STIL;
    (document.head || document.documentElement).appendChild(s);
  }

  /* Wischen: waagerecht mehr als 40 px und deutlich mehr als senkrecht.
     Senkrechtes Rollen und Zwei-Finger-Zoom bleiben dem Browser. */
  function wischen(el, links, rechts) {
    if (!el) return function () {};
    var x0 = null, y0 = 0, finger = 0;
    try { el.style.touchAction = "pan-y pinch-zoom"; } catch (e) {}
    function start(e) {
      var t = e.touches ? e.touches[0] : e;
      finger = e.touches ? e.touches.length : 1;
      x0 = t.clientX; y0 = t.clientY;
    }
    function ende(e) {
      if (x0 === null || finger > 1) { x0 = null; return; }
      var t = e.changedTouches ? e.changedTouches[0] : e;
      var dx = t.clientX - x0, dy = t.clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
      if (dx < 0) rechts(); else links();
    }
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchend", ende, { passive: true });
    return function () {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchend", ende);
    };
  }

  function blaettern(o) {
    stilEinmal();
    var seiten = Math.max(1, Number(o.seiten) || 1);
    var nr = Math.min(Math.max(0, Number(o.start) || 0), seiten - 1);
    var zug = 0;

    var leiste = document.createElement("div");
    leiste.className = "lwseiten";
    leiste.innerHTML = '<button type="button" class="lwseiten-zurueck" aria-label="Vorige Seite">‹</button>' +
      '<span class="lwseiten-nr" aria-live="polite"></span>' +
      '<button type="button" class="lwseiten-vor" aria-label="Nächste Seite">›</button>';
    var kZurueck = leiste.querySelector(".lwseiten-zurueck");
    var kVor = leiste.querySelector(".lwseiten-vor");
    var anzeige = leiste.querySelector(".lwseiten-nr");
    if (seiten < 2) leiste.style.display = "none";
    if (o.leiste) o.leiste.appendChild(leiste);

    function malen() {
      anzeige.textContent = "Seite " + (nr + 1) + " von " + seiten;
      kZurueck.disabled = nr <= 0;
      kVor.disabled = nr >= seiten - 1;
      var meins = ++zug;
      if (o.bild) o.bild.setAttribute("data-seite", String(nr));
      Promise.resolve(o.holen ? o.holen(nr) : null).then(function (url) {
        if (meins !== zug || !o.bild) return;   // inzwischen weitergeblaettert
        if (url) { o.bild.src = url; o.bild.alt = "Dein Blatt, Seite " + (nr + 1) + " von " + seiten; }
      });
    }
    function gehe(n) {
      n = Math.min(Math.max(0, n), seiten - 1);
      if (n === nr && zug) return;
      nr = n; malen();
    }
    kZurueck.addEventListener("click", function (e) { e.stopPropagation(); gehe(nr - 1); });
    kVor.addEventListener("click", function (e) { e.stopPropagation(); gehe(nr + 1); });
    var ohneWischen = seiten > 1 ? wischen(o.bild, function () { gehe(nr - 1); }, function () { gehe(nr + 1); })
                                 : function () {};
    function taste(e) {
      if (seiten < 2) return;
      if (e.key === "ArrowLeft") gehe(nr - 1);
      else if (e.key === "ArrowRight") gehe(nr + 1);
    }
    document.addEventListener("keydown", taste);
    malen();
    return {
      gehe: gehe,
      nr: function () { return nr; },
      weg: function () {
        document.removeEventListener("keydown", taste);
        ohneWischen();
        if (leiste.parentNode) leiste.parentNode.removeChild(leiste);
      }
    };
  }

  window.LWSeiten = { blaettern: blaettern, wischen: wischen };
})();
