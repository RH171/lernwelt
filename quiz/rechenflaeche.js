/* Rechnen-Knopf (30.10.2026, Auftrag 179, nur Paul).
 *
 * Denny: "Bei solchen Aufgaben muss er rechnen, hat aber kein Feld dafür. In der Lernwelt gab es
 * früher schon eine Rechenfläche ... bring sie zurück." Die frühere Fläche ist das Schmierblatt der
 * Generalprobe Mathe (/rechenweg/schmierblatt.js, 14.10.2026). Diese Datei baut nichts Neues, sie
 * hängt das Schmierblatt (mit Stiftfarben, Radierer, "Alles löschen") an jede Rechen-Karte:
 *
 *   - Fundkarten (Heute lernen, Fach-Runde, Such-Spiel; /fundkarten.js): direkt unter der Frage.
 *   - Lernquiz-Fragen (/quiz/motor.js): unter der Frage, vor Hilfe und Antworten.
 *   - Rechenspiele (Seiten paul/klasse*-mathe-*.html): ein Knopf unten rechts, die Fläche klappt
 *     als Leiste unten auf, die Aufgabe oben bleibt stehen.
 *
 * Prüft nichts, verrät nichts, speichert nichts (kein localStorage, kein Server). Sie greift in
 * keine Antwort, keine Wertung und keine Wiedervorlage ein: Sie liest nur den Fragetext aus dem
 * DOM. Neue Karte = neues, leeres Feld (Fundkarten bauen jede Karte neu, beim Lernquiz merkt
 * sich die Datei Nummer und Fragetext und zeichnet bei einer anderen Frage neu).
 *
 * Nur Paul: Die Datei ist nur in Pauls Seiten eingebunden, und sie prüft zusätzlich den Pfad.
 */
(function () {
  "use strict";
  if (!/^\/paul\//.test(location.pathname)) return;

  var CSS = [
    ".rf{margin:12px 0 2px}",
    ".rf .sb-auf{display:inline-flex;align-items:center;gap:6px;min-height:48px;padding:8px 18px;border-radius:999px;",
    "  border:2px dashed var(--line,#c9cfdb);background:var(--card,#fff);color:var(--ink,#172033);font:700 17px system-ui,sans-serif;cursor:pointer}",
    ".rf .sb-auf[aria-expanded=true]{border-style:solid}",
    ".rf.sb-zu .sb-koerper{display:none}",
    ".rf .sb-koerper{margin-top:8px}",
    ".rf .sb-leiste{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:8px}",
    ".rf .sb-farbe{width:48px;height:48px;border-radius:50%;border:2px solid var(--line,#c9cfdb);background:var(--card,#fff);",
    "  display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0}",
    ".rf .sb-farbe i{display:block;width:26px;height:26px;border-radius:50%}",
    ".rf .sb-farbe.an,.rf .sb-radierer.an{border-color:var(--ink,#172033);box-shadow:0 0 0 2px var(--ink,#172033) inset}",
    ".rf .sb-radierer,.rf .sb-leeren{min-height:48px;padding:8px 16px;border-radius:999px;border:2px solid var(--line,#c9cfdb);",
    "  background:var(--card,#fff);color:var(--ink,#172033);font:700 15px system-ui,sans-serif;cursor:pointer}",
    ".rf .sb-leeren{margin-left:auto;color:var(--muted,#5b6270)}",
    /* Papier immer hell wie im Heft - die Stiftfarben bleiben so in hell und dunkel lesbar. */
    ".rf .sb-flaeche{display:block;width:100%;height:280px;border-radius:14px;border:2px solid var(--line,#c9cfdb);touch-action:none;",
    "  -webkit-user-select:none;user-select:none;-webkit-touch-callout:none;",
    "  background-color:#fffef8;background-image:linear-gradient(#dfe5ee 1px,transparent 1px),linear-gradient(90deg,#dfe5ee 1px,transparent 1px);",
    "  background-size:24px 24px}",
    "@media (max-height:720px){.rf .sb-flaeche{height:230px}}",
    /* Rechenspiele: Knopf unten rechts, Fläche als Leiste unten. */
    ".rf-spiel{position:fixed;right:12px;bottom:12px;z-index:9000;margin:0;max-width:calc(100vw - 24px)}",
    ".rf-spiel .sb-auf{box-shadow:0 4px 14px rgba(0,0,0,.18);border-style:solid}",
    ".rf-spiel:not(.sb-zu){left:12px;padding:10px;border-radius:18px;background:var(--card,#fff);",
    "  border:1px solid var(--line,#c9cfdb);box-shadow:0 -6px 24px rgba(0,0,0,.22)}",
    ".rf-spiel:not(.sb-zu) .sb-flaeche{height:min(38vh,300px)}"
  ].join("\n");

  function stil() {
    if (document.getElementById("rf-stil")) return;
    var s = document.createElement("style"); s.id = "rf-stil"; s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* Muss Paul hier rechnen? Zahl im Text und ein Rechen-Hinweis. Lieber einmal zu oft ein Knopf
     als bei einer Sachaufgabe keiner - ein Knopf kostet nichts, er ändert nichts. */
  var ZAHL = /\d/;
  var RECHNEN = /(rechne|berechne|wie\s*viel|wie\s*viele|wie\s*lange|wie\s*alt|wie\s*schwer|wie\s*weit|wie\s*hoch|wie\s*teuer|kostet|kosten|bezahl|euro|€|\bct\b|cent|insgesamt|zusammen|übrig|uebrig|bleib|mehr\s+als|weniger\s+als|unterschied|doppelt|hälfte|haelfte|verteil|jede[rsn]?\b|\bmal\b|geteilt|plus|minus|summe|differenz|produkt|quotient|ergebnis|[+\-−–×·*:÷=]\s*\d|\d\s*[+\-−–×·*:÷=]|\b\d+\s*(cm|mm|km|m|kg|g|l|ml|min|h|std|stunden|minuten|sekunden|tage)\b)/i;
  function istRechnen(text, fach) {
    text = String(text || "");
    if (/mathe/i.test(String(fach || ""))) return true;
    return ZAHL.test(text) && RECHNEN.test(text);
  }
  function fachRunde() {
    try { return new URLSearchParams(location.search).get("fach") || ""; } catch (e) { return ""; }
  }

  function huelleBauen(klasse, frage) {
    stil();
    var h = document.createElement("div");
    h.className = "rf" + (klasse ? " " + klasse : "");
    window.Schmierblatt.malen(h, {
      knopf: "✏️ Rechnen", werkzeug: true,
      auf: function () {
        /* Die Frage bleibt sichtbar: Ragt die Fläche unten aus dem Bild oder ist die Frage
           oben hinausgerollt, kommt die Frage an den oberen Rand - die Fläche steht darunter. */
        if (!frage) return;
        var c = h.querySelector("canvas"), fr = frage.getBoundingClientRect();
        var cr = c ? c.getBoundingClientRect() : null;
        if (fr.top < 0 || (cr && cr.bottom > window.innerHeight)) {
          try { frage.scrollIntoView({ block: "start" }); } catch (e) { frage.scrollIntoView(true); }
          if (frage.getBoundingClientRect().top < 4) window.scrollBy(0, -8);
        }
      }
    });
    return h;
  }

  /* Fundkarten: jede Karte ist ein neues .lwf-karte mit .lwf-frage. */
  function fundkarte(karte) {
    if (karte.__rf) return; karte.__rf = 1;
    var frage = karte.querySelector(".lwf-frage");
    if (!frage) return;
    if (karte.querySelector(".lwf-auszug")) return;                 // Lese-Karte: Zeile finden, nicht rechnen
    var mathe = frage.classList.contains("lwf-mathe");
    if (!mathe && !istRechnen(frage.textContent, fachRunde())) return;
    frage.insertAdjacentElement("afterend", huelleBauen("", frage));
  }

  /* Lernquiz (motor.js): #q-frage bleibt stehen, nur der Text wechselt. */
  var quizSchluessel = null;
  function lernquiz() {
    var frage = document.getElementById("q-frage");
    if (!frage) return;
    var nr = document.getElementById("q-nr"), fach = document.getElementById("q-fach");
    var schluessel = (nr ? nr.textContent : "") + "|" + frage.textContent;
    if (schluessel === quizSchluessel) return;
    quizSchluessel = schluessel;
    var alt = document.getElementById("rf-quiz");
    if (alt && alt.parentNode) alt.parentNode.removeChild(alt);
    if (!istRechnen(frage.textContent, fach ? fach.textContent : "")) return;
    var h = huelleBauen("", frage); h.id = "rf-quiz";
    var vor = document.getElementById("q-hilfe") || document.getElementById("q-antworten");
    if (vor && vor.parentNode) vor.parentNode.insertBefore(h, vor);
    else frage.insertAdjacentElement("afterend", h);
  }

  function durchsehen() {
    if (!window.Schmierblatt) return;
    [].forEach.call(document.querySelectorAll(".lwf-karte"), fundkarte);
    lernquiz();
  }

  function start() {
    if (!window.Schmierblatt) return;
    /* Rechenspiel: eigene Seite, Knopf unten rechts, einmal je Seite. */
    if (/^\/paul\/klasse\d+-mathe-/.test(location.pathname)) {
      if (!document.getElementById("rf-spiel")) {
        var h = huelleBauen("rf-spiel", null); h.id = "rf-spiel";
        document.body.appendChild(h);
      }
      return;
    }
    durchsehen();
    var wartet = false;
    new MutationObserver(function () {
      if (wartet) return; wartet = true;
      (window.requestAnimationFrame || setTimeout)(function () { wartet = false; durchsehen(); });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  window.Rechenflaeche = { istRechnen: istRechnen };   // nur zum Prüfen von außen, ändert nichts
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
