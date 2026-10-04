/* Hell oder dunkel - der Schalter auf JEDER Seite von Paul, Leon und Helena
 * (04.10.2026).
 *
 * Denny am 04.10.2026: "Nur Paul kann White/Dark Mode schalten. Das soll fuer
 * alle drei Lernwelten zaehlen. Bitte pruefe die Usability dazu auch. Die
 * Auswahl soll auf jeder Seite moeglich sein."
 *
 * Vorher stand der Schalter nur auf zwei Startseiten (Paul, Leon); auf 70 von
 * 72 Kinderseiten liess sich nichts umstellen, und Helena hatte gar keine
 * Wahl - ihre Welt war fest dunkel.
 *
 * Einbau, als LETZTE Zeile im <head> (nach allen alten Kopfschnipseln, damit
 * diese Datei das letzte Wort hat und vor dem ersten Zeichnen laeuft):
 *
 *   <script src="/farbschalter.js"></script>
 *
 * Was sie tut:
 *  1. Sofort, vor dem ersten Zeichnen: data-theme am <html> nach der Wahl des
 *     Kindes setzen. Kein Aufblitzen.
 *  2. Bei Helena im Hellen: die hellen Werte fuer ihre Farbnamen einsetzen
 *     (ihre Seiten sind dunkel gebaut und hatten nie eine helle Fassung).
 *  3. Nach dem Laden: ein runder Knopf unten rechts, links neben dem
 *     Melde-Knopf (💬) - auf jeder Seite am selben Ort. 52 px wie der
 *     Melde-Knopf, aria-label und title sagen, was er tut.
 *  4. Umschalten wirkt SOFORT, ohne Neuladen - ein Neuladen mitten im Spiel
 *     wuerde den Spielstand kosten (Kapitel 099). Spiele mit heller Flaeche
 *     hoeren auf das Ereignis "lw-farbschema" (spiel-dunkel.js).
 *
 * Schluessel je Kind, wie bisher (auf einem geteilten Geraet soll Pauls Wahl
 * nicht Leons Seiten umfaerben):
 *   Paul    "hub-theme"     Standard dunkel
 *   Leon    "leon-theme"    Standard hell
 *   Helena  "helena-theme"  Standard dunkel (ihre Welt war immer dunkel)
 * Gespeichert wird nur "light" oder "dark" - kein Geheimnis.
 *
 * prefers-color-scheme spielt bewusst keine Rolle (thema.css, 23.09.2026):
 * Eine getroffene Wahl darf nicht davon abhaengen, wie das Geraet steht.
 *
 * Steht auf der Seite schon ein eigener Schalter (Pauls #modeBtn, Leons
 * #modusBtn auf der Startseite), drueckt dieser Knopf genau den - so laeuft
 * dort dieselbe Logik, und beide zeigen immer dasselbe an.
 */
(function () {
  "use strict";
  var pfad = location.pathname;
  var kind = /\/leon\//.test(pfad) ? "leon" : /\/helena\//.test(pfad) ? "helena"
           : /\/paul\//.test(pfad) ? "paul" : "";
  if (!kind || window.__farbschalter) return;

  var SCHLUESSEL = { paul: "hub-theme", leon: "leon-theme", helena: "helena-theme" }[kind];
  var STANDARD = { paul: "dark", leon: "light", helena: "dark" }[kind];
  var html = document.documentElement;

  function gewaehlt() {
    try {
      var w = localStorage.getItem(SCHLUESSEL);
      if (w === "light" || w === "dark") return w;
    } catch (e) {}
    return STANDARD;
  }

  function anwenden(w) {
    if (w === "dark") html.setAttribute("data-theme", "dark");
    else if (kind === "helena") html.setAttribute("data-theme", "light");
    else html.removeAttribute("data-theme");  /* so stand "hell" bei Paul und Leon schon immer */
  }

  var jetzt = gewaehlt();
  anwenden(jetzt);

  /* ---------- Helena im Hellen ----------
     Ihre Seiten benutzen durchweg dieselben Farbnamen (--bg, --card,
     --surface, --ink, --muted, --brand ...), alle dunkel gerechnet. Hier
     bekommt jeder Name seinen hellen Wert mit derselben Rolle. Lila bleibt
     ihre Farbe, im Hellen nur dunkler - #a78bfa auf Weiss waere 2,7:1,
     #6d28d9 sind 7,1:1, und weisse Schrift darauf ebenso.
     Spezifitaet html[data-theme="light"] (0,1,1) schlaegt :root (0,1,0). */
  if (kind === "helena") {
    var hell = document.createElement("style");
    hell.id = "farbschalter-helena-hell";
    hell.textContent =
      'html[data-theme="light"]{color-scheme:light;' +
        '--bg:#f4f2fb;--bg2:#ebe8f5;--card:#ffffff;--karte:#ffffff;--surface:#ffffff;' +
        '--surface2:#efecf8;--feld:#efecf8;--line:#d6d0e8;--ink:#1d1a2b;--muted:#57536b;' +
        '--brand:#6d28d9;--brand-ink:#5b21b6;--brand2:#1d4ed8;' +
        '--akzent:#6d28d9;--akzent-text:#5b21b6;--akzent-hell:#ede7fb;--akzent-auf:#ffffff;' +
        '--paul:#6d28d9;--pink:#be185d;--blau:#1d4ed8;' +
        '--ok:#0f766e;--gut:#0f766e;--gut-text:#0f766e;--gut-hell:#dcf3ee;--gruen:#0f766e;--gruen-hell:#dcf3ee;' +
        '--gut-feld:rgba(15,118,110,.12);' +
        '--no:#b91c1c;--schlecht:#b91c1c;--schlecht-text:#b91c1c;--schlecht-hell:#fde8e6;' +
        '--gold:#a15c07;--warn:#a15c07;--orange:#a15c07;--offen-feld:rgba(161,92,7,.12);' +
        /* Schrift, die bisher fest dunkel auf einer Lila- oder Gruenflaeche
           stand (#150f2e auf --brand): Die Flaeche ist im Hellen dunkel,
           also wird die Schrift weiss. Ebenso helle Schrift auf zart
           getoenten Antwortfeldern - die wird dunkel. */
        '--offen-hell:#fbf0d9;--vertief:#efecf8;--auf-fuellung:#ffffff;--auf-gut-feld:#0b5d56;--auf-schlecht-feld:#8f1a1a;' +
        '--shadow:0 1px 2px rgba(40,30,80,.08),0 12px 30px rgba(40,30,80,.10)}' +
      'html[data-theme="light"] body{background-color:var(--bg);color:var(--ink)}';
    (document.head || html).appendChild(hell);
  }

  function melden(w) {
    try { document.dispatchEvent(new CustomEvent("lw-farbschema", { detail: w })); } catch (e) {}
  }

  /* Seiten, die sich gar nicht umfaerben (vier Spiele bei Paul sind in beiden
     Modi ein Nachthimmel): Der Knopf bleibt trotzdem da - die Wahl gilt dann
     fuer die naechsten Seiten, und das sagt ein kurzer Hinweis. */
  function faerbtSichUm() {
    if (kind === "helena") return true;
    return !!document.querySelector('link[href*="thema.css"],script[src*="spiel-dunkel"]');
  }

  function umschalten() {
    var eigen = document.getElementById(kind === "leon" ? "modusBtn" : "modeBtn");
    var neu = gewaehlt() === "dark" ? "light" : "dark";
    if (eigen && kind !== "helena") {
      eigen.click();                 /* die Startseite schaltet selbst und speichert */
    } else {
      try { localStorage.setItem(SCHLUESSEL, neu); } catch (e) {}
      anwenden(neu);
    }
    melden(neu);
    zeigen();
    hinweis(neu);
  }

  var knopf, tafel, tafelUhr, rollUhr;
  function zeigen() {
    if (!knopf) return;
    var dunkel = html.getAttribute("data-theme") === "dark";
    knopf.textContent = dunkel ? "☀️" : "🌙";   /* zeigt, wohin es geht */
    var was = dunkel ? "Hell einschalten" : "Dunkel einschalten";
    knopf.setAttribute("aria-label", was);
    knopf.title = was;
    knopf.setAttribute("aria-pressed", dunkel ? "true" : "false");
  }

  function hinweis(w) {
    if (!tafel) return;
    tafel.textContent = (w === "dark" ? "Dunkel" : "Hell") +
      (faerbtSichUm() ? " – gilt auf allen deinen Seiten" : " – gilt ab der nächsten Seite, dieses Spiel bleibt dunkel");
    tafel.classList.add("an");
    clearTimeout(tafelUhr);
    tafelUhr = setTimeout(function () { tafel.classList.remove("an"); }, 2600);
  }

  function bauen() {
    if (document.getElementById("farbschalter")) return;
    var stil = document.createElement("style");
    stil.id = "farbschalter-stil";
    /* Gleicher Ort wie der Melde-Knopf, eine Stelle weiter links: right 14 px
       + 52 px Knopf + 16 px Luecke (82 px; bei 76 px stiess er an den
       60-px-Hilfeknopf "?" im Praedikat-Quiz). Rand 2 px, damit der Knopf auch auf
       gleichfarbigem Grund als Knopf erkennbar ist (WCAG 1.4.11: 3:1). */
    stil.textContent =
      '#farbschalter{position:fixed;right:calc(82px + env(safe-area-inset-right,0px));' +
        'bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:2147483000;' +
        'width:52px;height:52px;border-radius:50%;cursor:pointer;padding:0;margin:0;' +
        'display:grid;place-items:center;font-size:23px;line-height:1;' +
        'font-family:system-ui,sans-serif;background:#ffffff;color:#1b1c22;' +
        'border:2px solid #6b7280;box-shadow:0 3px 14px rgba(0,0,0,.22);' +
        '-webkit-tap-highlight-color:transparent;touch-action:manipulation}' +
      'html[data-theme="dark"] #farbschalter{background:#1e2029;color:#eef1f8;border-color:#a0a6bd;' +
        'box-shadow:0 3px 14px rgba(0,0,0,.5)}' +
      '#farbschalter:active{transform:scale(.93)}' +
      '#farbschalter:focus-visible{outline:3px solid #4f46e5;outline-offset:3px}' +
      'html[data-theme="dark"] #farbschalter:focus-visible{outline-color:#a5b4ff}' +
      '#farbschalter-tafel{position:fixed;right:calc(14px + env(safe-area-inset-right,0px));' +
        'bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:2147483000;max-width:min(320px,calc(100vw - 28px));' +
        'padding:10px 14px;border-radius:14px;background:#1b1c22;color:#ffffff;font:600 15px/1.35 system-ui,sans-serif;' +
        'box-shadow:0 6px 20px rgba(0,0,0,.25);opacity:0;transform:translateY(6px);pointer-events:none;' +
        'transition:opacity .2s ease,transform .2s ease}' +
      'html[data-theme="dark"] #farbschalter-tafel{background:#eef1f8;color:#14151c}' +
      '#farbschalter-tafel.an{opacity:1;transform:none}' +
      '@media print{#farbschalter,#farbschalter-tafel{display:none}}';
    document.head.appendChild(stil);

    knopf = document.createElement("button");
    knopf.id = "farbschalter";
    knopf.type = "button";
    knopf.addEventListener("click", umschalten);
    tafel = document.createElement("div");
    tafel.id = "farbschalter-tafel";
    tafel.setAttribute("role", "status");
    tafel.setAttribute("aria-live", "polite");
    /* Platz am Seitenende, damit der Knopf ganz unten nichts verdeckt -
       derselbe Abstand, den lernstand.js fuer den Melde-Knopf anlegt, und
       unter DERSELBEN id: So entsteht er nur einmal, egal wer zuerst kommt.
       Seiten ohne lernstand.js (Stundenplaene, Pruefungen) hatten keinen. */
    try {
      var bs = getComputedStyle(document.body);
      if (!document.getElementById("melde-abstand") && bs.overflow !== "hidden" && bs.overflowY !== "hidden") {
        var ab = document.createElement("div");
        ab.id = "melde-abstand";
        ab.style.cssText = "height:78px;flex:none;grid-column:1/-1;pointer-events:none";
        document.body.appendChild(ab);
      }
      /* Ist <body> eine Flex-ZEILE (Quizseiten mit zentrierter Karte), steht
         ein Abstand im <body> daneben statt darunter und bringt nichts. Dann
         kommt er ans Ende des hoechsten Inhaltskastens. */
      if (/flex/.test(bs.display) && !/column/.test(bs.flexDirection)) {
        var hoch = null;
        [].forEach.call(document.body.children, function (k) {
          if (/^(SCRIPT|STYLE|TEMPLATE)$/.test(k.tagName) || /^(melde-abstand|farbschalter|farbschalter-tafel|melde-knopf)$/.test(k.id)) return;
          var ks = getComputedStyle(k);
          if (ks.display === "none" || ks.position === "fixed" || ks.position === "absolute") return;
          if (!hoch || k.offsetHeight > hoch.offsetHeight) hoch = k;
        });
        if (hoch && !hoch.querySelector(":scope > .farbschalter-abstand")) {
          var ab2 = document.createElement("div");
          ab2.className = "farbschalter-abstand";
          ab2.setAttribute("aria-hidden", "true");
          ab2.style.cssText = "height:78px;flex:none;width:100%;grid-column:1/-1;pointer-events:none";
          hoch.appendChild(ab2);
        }
      }
    } catch (e) {}
    document.body.appendChild(tafel);
    document.body.appendChild(knopf);
    zeigen();

    ausweichen();
    window.addEventListener("resize", ausweichen);
    window.addEventListener("scroll", function () { clearTimeout(rollUhr); rollUhr = setTimeout(ausweichen, 120); }, { passive: true });
    setInterval(ausweichen, 1200);

    /* Schaltet die Seite selbst um (Pauls oder Leons Startseiten-Schalter),
       zieht dieser Knopf nach. */
    try { new MutationObserver(zeigen).observe(html, { attributes: true, attributeFilter: ["data-theme"] }); } catch (e) {}
  }

  /* ---------- Nichts verdecken ----------
     Unten rechts liegt in drei Action-Spielen bei Paul die SPRUNG-Taste, im
     Praedikat-Quiz ein Hilfeknopf. Liegt dort etwas, das man sehen oder
     tippen muss, rueckt der Schalter in derselben Ecke nach OBEN, ueber
     dieses Element - der Ort bleibt "unten rechts", nur eine Etage hoeher.
     Was zaehlt:
       - feste Tippziele (fixed/sticky, die Spieltasten) immer,
       - auf Seiten, die nicht rollen (ein Bildschirm, Spiele mit
         overflow:hidden), auch normaler Text und normale Knoepfe - auf
         rollenden Seiten schafft der Abstand am Seitenende den Platz.
     Hoechstens bis zur halben Hoehe; laeuft alle 1,2 s nach, weil Spiele
     ihre Tasten erst beim Start zeigen. */
  function istFest(el) {
    for (var e = el; e && e !== document.body; e = e.parentElement) {
      var p = getComputedStyle(e).position;
      if (p === "fixed" || p === "sticky") return true;
    }
    return el.matches(".tbtn");   /* Strom-Jump'n'Run: Tasten als <div> im Spielfeld */
  }
  function rolltSeite() {
    var d = document.documentElement, b = document.body;
    if (d.scrollHeight > innerHeight + 4 && getComputedStyle(d).overflowY !== "hidden" &&
        getComputedStyle(b).overflowY !== "hidden") return true;
    var bo = getComputedStyle(b).overflowY;
    return (bo === "auto" || bo === "scroll") && b.scrollHeight > b.clientHeight + 4;
  }
  function stoesst(el, r, rollt, nurTipp) {
    if (el === knopf || el.id === "melde-knopf" || el.id === "melde-abstand" ||
        el.closest("#melde-huelle,#farbschalter-tafel,#farbschalter")) return false;
    var tipp = el.matches("a,button,input,select,textarea,[role=button],[onclick],.tbtn");
    var text = false;
    if (!tipp && !rollt && !nurTipp) for (var c = el.firstChild; c; c = c.nextSibling)
      if (c.nodeType === 3 && c.nodeValue.trim()) { text = true; break; }
    if (!tipp && !text) return false;
    var e = el.getBoundingClientRect();
    if (e.width < 2 || e.height < 2) return false;
    if (!(e.right > r.left && e.left < r.right && e.bottom > r.top && e.top < r.bottom)) return false;
    if (e.height > innerHeight * 0.5) return false;          /* Rahmen, kein Inhalt */
    var cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || +cs.opacity < 0.1 || cs.pointerEvents === "none" && !text) return false;
    if (el.closest("details:not([open])") && !el.closest("summary")) return false;
    return rollt ? (tipp && istFest(el)) : true;
  }
  /* Sucht von unten nach oben die erste freie Etage. null = keine bis zur
     halben Hoehe. */
  function freieEtage(rollt, nurTipp) {
    var alle = document.body.getElementsByTagName("*"), unten = 14;
    for (var runde = 0; runde < 8; runde++) {
      knopf.style.bottom = unten === 14 ? "" : unten + "px";
      var r = knopf.getBoundingClientRect(), stoss = null;
      for (var i = 0; i < alle.length; i++) {
        if (!stoesst(alle[i], r, rollt, nurTipp)) continue;
        var e = alle[i].getBoundingClientRect();
        if (!stoss || e.top < stoss.top) stoss = e;
      }
      if (!stoss) return unten;
      unten = Math.max(unten + 1, Math.round(innerHeight - stoss.top + 8));
      if (unten > innerHeight * 0.5) return null;
    }
    return null;
  }
  function ausweichen() {
    if (!knopf) return;
    /* Ganz unten angekommen zaehlt auch auf rollenden Seiten der Inhalt:
       Dort hilft kein Weiterrollen mehr (Seiten mit fester Hoehe, bei denen
       der Abstand am Ende nicht greift, etwa das Subjekt-Praedikat-Quiz). */
    var d = document.documentElement;
    var amEnde = scrollY + innerHeight >= d.scrollHeight - 4;
    var rollt = rolltSeite() && !amEnde;
    /* Erst Tippziele UND Text meiden; geht das nicht, wenigstens die
       Tippziele - eine verdeckte SPRUNG-Taste ist schlimmer als ein
       verdeckter Hinweissatz. */
    var u = freieEtage(rollt, false);
    if (u === null) u = freieEtage(rollt, true);
    knopf.style.bottom = (u === null || u === 14) ? "" : u + "px";
  }

  window.__farbschalter = { kind: kind, schluessel: SCHLUESSEL, gewaehlt: gewaehlt, umschalten: umschalten };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bauen);
  else bauen();
})();
