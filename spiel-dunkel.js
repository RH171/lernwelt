/* Dunkel fuer Spiele mit fest heller Spielflaeche (25.09.2026).
 *
 * Denny: "Wenn er im Dark-Mode ist, moechte er nicht auf der naechsten Seite
 * wieder den Hell-Mode haben. Bei den Programmen, bei denen es nicht
 * funktioniert, wie bei Spielen, die vielleicht auf einer weissen Ebene sind
 * ... vielleicht kannst du dennoch den Hintergrund abdunkeln und da, wo es
 * noetig ist, hell bleiben." Per Klickfrage gewaehlt: "Umgebung dunkel,
 * Flaeche gedimmt".
 *
 * Einbau, im <head> VOR dem ersten Zeichnen:
 *
 *   <script src="/spiel-dunkel.js" data-flaeche=".wrap"></script>
 *
 * data-flaeche ist der Kasten, in dem das Spiel steht. Er behaelt den hellen
 * Hintergrund, den bisher die ganze Seite hatte; alles drumherum wird dunkel,
 * und ueber allem liegt ein leichter Schleier, damit das Weiss nicht blendet.
 * Farben, Bilder und Texte im Spiel werden NICHT umgefaerbt - sie sind auf
 * Hell gerechnet, und ein Umfaerben per Filter kippt Bilder und Emojis.
 *
 * Es zaehlt dieselbe Wahl wie ueberall: localStorage "hub-theme". Wer nie
 * etwas gewaehlt hat, bekommt dunkel (so steht es auf Pauls Startseite).
 * prefers-color-scheme spielt bewusst keine Rolle (thema.css, 23.09.2026).
 *
 * Kein data-flaeche (leer): nur Schleier und dunkler Rand, fuer Spiele ohne
 * einen einzelnen Kasten.
 */
(function () {
  "use strict";
  var el = document.currentScript;
  var sel = (el && el.getAttribute("data-flaeche")) || "";
  /* Seit 25.09.2026 auch fuer Leon: eigener Schluessel je Kind (auf einem
     geteilten Geraet soll Pauls Wahl nicht Leons Seiten umfaerben) und ein
     eigener Standard - Leons Welt war immer hell, Pauls immer dunkel.
       data-schluessel="leon-theme" data-standard="light" */
  var schluessel = (el && el.getAttribute("data-schluessel")) || "hub-theme";
  var standard = (el && el.getAttribute("data-standard")) || "dark";
  var dunkel = standard !== "light";
  try {
    var w = localStorage.getItem(schluessel);
    if (w === "light" || w === "dark") dunkel = (w === "dark");
  } catch (e) {}
  if (!dunkel) return;

  var html = document.documentElement;
  html.setAttribute("data-spiel-dunkel", "");

  var BG = "#14151c";
  var css =
    "html[data-spiel-dunkel]{background:" + BG + ";color-scheme:light}" +
    /* Der Schleier: dimmt gleichmaessig, veraendert keine Farbe und kein
       Layout. pointer-events:none, sonst waere nichts mehr antippbar. */
    "html[data-spiel-dunkel]::after{content:'';position:fixed;inset:0;" +
      "background:rgba(0,0,0,.10);pointer-events:none;z-index:2147483646}";
  if (sel) {
    css += "html[data-spiel-dunkel] body{background:" + BG + " !important}" +
      "html[data-spiel-dunkel] " + sel + "{border-radius:22px;" +
      "box-shadow:0 0 0 1px rgba(255,255,255,.06)}";
  }
  var st = document.createElement("style");
  st.id = "spiel-dunkel";
  st.textContent = css;
  (document.head || html).appendChild(st);

  if (!sel) return;
  /* Die Flaeche bekommt den Hintergrund, den die Seite vorher hatte. Der wird
     einmal gemessen - mit abgeschaltetem Dunkel, synchron, ohne dass
     dazwischen gezeichnet wird. */
  function flaeche() {
    var ziel = document.querySelector(sel);
    if (!ziel || !document.body) return;
    html.removeAttribute("data-spiel-dunkel");
    var b = getComputedStyle(document.body);
    var farbe = b.backgroundColor, bild = b.backgroundImage;
    if ((!farbe || farbe === "rgba(0, 0, 0, 0)") && bild && bild !== "none") {
      /* Nur ein Verlauf, keine Grundfarbe: dessen letzte Farbe ist der
         Grund (Himmel-Wiese-Erde im Zeit-Baumeister endet in Erde). */
      var alle = bild.match(/rgba?\([^)]+\)/g);
      if (alle) farbe = alle[alle.length - 1];
    }
    if (!farbe || farbe === "rgba(0, 0, 0, 0)" || farbe === "transparent") {
      farbe = getComputedStyle(html).backgroundColor;
      if (!farbe || farbe === "rgba(0, 0, 0, 0)") farbe = "#ffffff";
    }
    html.setAttribute("data-spiel-dunkel", "");
    var z = getComputedStyle(ziel);
    if (z.backgroundColor === "rgba(0, 0, 0, 0)" && z.backgroundImage === "none") {
      ziel.style.backgroundColor = farbe;
      if (bild && bild !== "none") ziel.style.backgroundImage = bild;
    }
    /* Ein Kasten ohne Innenabstand klebt sonst mit dem Text am Rand. */
    if (parseFloat(z.paddingLeft) < 12) { ziel.style.paddingLeft = "14px"; ziel.style.paddingRight = "14px"; }
    if (parseFloat(z.paddingTop) < 12) { ziel.style.paddingTop = "14px"; ziel.style.paddingBottom = "14px"; }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", flaeche);
  else flaeche();
})();
