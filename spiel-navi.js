/* Ein Weg zurueck zur Auswahl - mitten im Spiel (14.09.2026).
 *
 * Denny hat Leon beobachtet: Er kam aus einem Spiel "nicht auf den Startbildschirm
 * einfach" - und bat, die Wege "gleich bei allen drei" zu pruefen. In den Spielen
 * zum Anfassen (Leon) und den Spielen fuer Helena ging es mitten in einer Runde
 * nur ganz raus, aber nicht zurueck zur Stufen- oder Deck-Auswahl.
 *
 * Dieses Skript setzt dafuer einen Knopf "↺ Auswahl" in die Kopfzeile. Er
 * erscheint nur, solange gespielt wird (#sicht-start verborgen), und bringt
 * zurueck auf #sicht-start. Er uebernimmt das Aussehen des vorhandenen
 * Zurueck-Knopfs, damit er in Leons hellem und Helenas dunklem Stil passt.
 * Die Seiten muessen dafuer nichts tun ausser dem <script>.
 */
(function () {
  "use strict";
  // Auf dem Handy wird die Kopfzeile sonst zu voll (Titel, Zurueck, Auswahl, Punkte):
  // Titel in eine eigene Zeile, die Knoepfe darunter, nichts bricht mitten im Wort.
  (function () {
    if (document.getElementById("spiel-navi-stil")) return;
    var st = document.createElement("style");
    st.id = "spiel-navi-stil";
    st.textContent = "@media (max-width:560px){header{flex-wrap:wrap!important;row-gap:8px!important}" +
      "header h1{flex:1 1 100%!important;order:-1}header a,header button,#punkte,#zaehler{white-space:nowrap}}";
    document.head.appendChild(st);
  })();

  function los() {
    var start = document.getElementById("sicht-start");
    var kopf = document.querySelector("header");
    if (!start || !kopf || document.getElementById("zur-auswahl")) return;
    var vorlage = kopf.querySelector("a");
    var knopf = document.createElement("button");
    knopf.id = "zur-auswahl";
    knopf.type = "button";
    knopf.className = vorlage ? vorlage.className : "";
    knopf.textContent = "↺ Auswahl";
    knopf.setAttribute("aria-label", "Zurück zur Auswahl");
    knopf.style.cssText = "cursor:pointer;font:inherit;white-space:nowrap;margin-left:auto;" + (vorlage ? "" : "min-height:44px;padding:10px 14px;border-radius:999px;border:1px solid #d0d5dd;background:#fff");
    // Rechts neben die Ueberschrift, vor Punktestand o. ae.
    var h1 = kopf.querySelector("h1");
    if (h1 && h1.nextSibling) kopf.insertBefore(knopf, h1.nextSibling); else kopf.appendChild(knopf);
    if (h1) h1.style.flex = "1";

    function malen() {
      var spielt = start.classList.contains("verborgen");
      knopf.style.display = spielt ? "" : "none";
    }
    knopf.addEventListener("click", function () {
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
      var sichten = document.querySelectorAll('[id^="sicht-"]');
      Array.prototype.forEach.call(sichten, function (s) { s.classList.toggle("verborgen", s !== start); });
      // Nur Anzeigen in der Kopfzeile ausblenden - #punkte in der Kabine liegt im Spielfeld
      // und wuerde sonst in der naechsten Runde unsichtbar bleiben.
      Array.prototype.forEach.call(kopf.querySelectorAll("#punkte, #zaehler"), function (el) { el.classList.add("verborgen"); });
      window.scrollTo(0, 0);
      malen();
    });
    new MutationObserver(malen).observe(start, { attributes: true, attributeFilter: ["class"] });
    malen();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los); else los();
  // Die Elfmeter-Seiten bauen ihre Kopfzeile erst per Skript - nochmal nachsehen.
  window.addEventListener("load", los);
})();
