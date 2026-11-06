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
 *
 * Lineal (02.11.2026, Auftrag 192): Paul wollte gerade Linien für Tabellen. Das Schmierblatt bekommt
 * "📏 Lineal" und "↶ Zurück" (lineal: true). Beide bleiben versteckt, bis der Rückweg-Schalter
 * GET /api/schalter?name=lineal "neu" meldet (einmal je Seite). "alt" oder kein Netz = wie bisher.
 *
 * Zeichnen | Tippen (03.11.2026, Auftrag 196): Paul rechnet am Mac mit der Maus. Das Schmierblatt
 * bekommt den Umschalter "✏️ Zeichnen | ⌨️ Tippen" (tippen: true), sichtbar erst, wenn
 * GET /api/schalter?name=rechentippen "neu" meldet. "alt" oder kein Netz = ohne Umschalter, wie bisher.
 * An einem reinen Maus-Gerät steht dann Tippen vorn, an iPad und Stift Zeichnen (schmierblatt.js).
 *
 * Rechentabelle (05.11.2026, Auftrag 210): Im Tippen-Teil steht vor dem freien Feld eine Stellentafel
 * (T H Z E, Rechenzeichen aus der Frage, Ziffern rücken von rechts ein, Übertrag, Ergebnis springt nach
 * links). Sichtbar, sobald GET /api/schalter?name=rechentafel "neu" meldet (Standard). "alt" oder kein
 * Netz = freies Feld wie am 03.11.2026. Die Frage wird nur gelesen, nichts wird gespeichert.
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
    ".rf .sb-lineal,.rf .sb-zurueck{min-height:48px;padding:8px 16px;border-radius:999px;border:2px solid var(--line,#c9cfdb);",
    "  background:var(--card,#fff);color:var(--ink,#172033);font:700 15px system-ui,sans-serif;cursor:pointer}",
    ".rf .sb-lineal.an{border-color:var(--ink,#172033);box-shadow:0 0 0 2px var(--ink,#172033) inset}",
    ".rf .sb-zurueck:disabled{opacity:.45;cursor:default}",
    ".rf .sb-lineal[hidden],.rf .sb-zurueck[hidden]{display:none}",
    /* Zeichnen | Tippen */
    ".rf .sb-modus{display:inline-flex;gap:0;margin-bottom:8px;border:2px solid var(--line,#c9cfdb);border-radius:999px;overflow:hidden}",
    ".rf .sb-modus button{min-height:48px;min-width:120px;padding:8px 16px;border:0;background:var(--card,#fff);color:var(--ink,#172033);",
    "  font:700 15px system-ui,sans-serif;cursor:pointer}",
    ".rf .sb-modus button.an{background:var(--ink,#172033);color:var(--card,#fff)}",
    ".rf .sb-modus[hidden],.rf .sb-tippen[hidden],.rf .sb-leiste[hidden],.rf .sb-flaeche[hidden]{display:none}",
    ".rf .sb-tippleiste{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:8px}",
    ".rf .sb-zeichen{min-width:48px;min-height:48px;border-radius:12px;border:2px solid var(--line,#c9cfdb);background:var(--card,#fff);",
    "  color:var(--ink,#172033);font:700 22px ui-monospace,Menlo,Consolas,monospace;cursor:pointer}",
    ".rf .sb-text-leeren{min-height:48px;padding:8px 16px;margin-left:auto;border-radius:999px;border:2px solid var(--line,#c9cfdb);",
    "  background:var(--card,#fff);color:var(--muted,#5b6270);font:700 14px system-ui,sans-serif;cursor:pointer}",
    /* Papier hell wie im Heft, Schrift groß und gleich breit: Ziffern stehen sauber untereinander. */
    ".rf .sb-text{display:block;box-sizing:border-box;width:100%;height:280px;padding:10px 14px;border-radius:14px;",
    "  border:2px solid var(--line,#c9cfdb);background:#fffef8;color:#1f2937;resize:vertical;white-space:pre;overflow:auto;",
    "  font:600 28px/1.35 ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace;letter-spacing:.06em;tab-size:4}",
    ".rf .sb-text:focus{outline:3px solid #1d4ed8;outline-offset:2px}",
    ".rf .sb-text::placeholder{color:#9aa3b2}",
    "@media (max-height:720px){.rf .sb-text{height:230px}}",
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
    ".rf-spiel:not(.sb-zu) .sb-flaeche,.rf-spiel:not(.sb-zu) .sb-text{height:min(38vh,300px)}",
    /* Rechentabelle (05.11.2026): feste Kästchen je Stelle, Papier hell wie im Heft. */
    ".rf .sb-art{display:inline-flex;gap:0;margin:0 0 8px 8px;border:2px solid var(--line,#c9cfdb);border-radius:999px;overflow:hidden;vertical-align:top}",
    ".rf .sb-art button{min-height:48px;padding:8px 14px;border:0;background:var(--card,#fff);color:var(--ink,#172033);font:700 15px system-ui,sans-serif;cursor:pointer}",
    ".rf .sb-art button.an{background:var(--ink,#172033);color:var(--card,#fff)}",
    ".rf .sb-art[hidden],.rf .sb-tafelteil[hidden],.rf .sb-frei[hidden],.rf .sb-tafel-zeile[hidden],.rf .sb-tafel-stelle[hidden]{display:none}",
    "@media (max-width:520px){.rf .sb-art{margin-left:0}}",
    ".rf .sb-tafelleiste{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:8px}",
    ".rf .sb-tafel-op,.rf .sb-tafel-zeile,.rf .sb-tafel-stelle{min-height:48px;padding:8px 14px;border-radius:999px;border:2px solid var(--line,#c9cfdb);",
    "  background:var(--card,#fff);color:var(--ink,#172033);font:700 15px system-ui,sans-serif;cursor:pointer}",
    ".rf .sb-tafel-op{font-size:17px}",
    ".rf .sb-tafel{--sb-z:min(56px,calc((100% - 4px) / var(--sb-spalten)));display:grid;grid-template-columns:repeat(var(--sb-spalten),var(--sb-z));",
    "  justify-content:center;row-gap:6px;padding:12px 8px;border-radius:14px;border:2px solid var(--line,#c9cfdb);background:#fffef8;color:#1f2937;",
    "  font:700 30px/1 ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace}",
    ".rf .sb-tk{text-align:center;font:800 15px/1.6 system-ui,sans-serif;color:#5b6270}",
    ".rf .sb-tz{display:flex;align-items:center;justify-content:center;min-height:52px;font-size:30px;color:#1f2937}",
    ".rf .sb-tz-ue{min-height:34px}",
    ".rf .sb-tzeile{position:relative;display:grid;grid-template-columns:subgrid;min-height:52px;border-radius:8px}",
    ".rf .sb-tzeile.an{box-shadow:0 0 0 3px #1d4ed8}",
    ".rf .sb-tzelle{display:flex;align-items:center;justify-content:center;margin:0 2px;border:1px solid #dfe5ee;border-radius:6px;background:#fff}",
    ".rf .sb-tzahl{position:absolute;inset:0;width:100%;height:100%;box-sizing:border-box;margin:0;padding:0;border:0;background:transparent;",
    "  color:transparent;caret-color:transparent;font-size:16px;opacity:0;cursor:text}",
    ".rf .sb-tue-zelle{display:flex;align-items:center;justify-content:center;min-height:34px}",
    ".rf .sb-tue{box-sizing:border-box;width:30px;height:30px;padding:0;border:1px dashed #9aa3b2;border-radius:6px;background:#fff;",
    "  color:#b91c1c;text-align:center;font:700 18px/1 ui-monospace,Menlo,monospace}",
    ".rf .sb-tstrich{grid-column:1 / -1;height:0;border-top:3px solid #1f2937;margin:2px 0}",
    ".rf .sb-terg{box-sizing:border-box;width:calc(100% - 4px);margin:0 2px;height:52px;padding:0;border:2px solid #9aa3b2;border-radius:8px;background:#fff;",
    "  color:#1f2937;text-align:center;font:700 30px/1 ui-monospace,'SF Mono',Menlo,Consolas,monospace}",
    ".rf .sb-tue:focus,.rf .sb-terg:focus{outline:3px solid #1d4ed8;outline-offset:1px;border-color:#1d4ed8}"
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
      knopf: "✏️ Rechnen", werkzeug: true, lineal: true, tippen: true,
      auf: function () {
        /* Die Frage bleibt sichtbar: Ragt die Fläche unten aus dem Bild oder ist die Frage
           oben hinausgerollt, kommt die Frage an den oberen Rand - die Fläche steht darunter. */
        if (!frage) return;
        var c = h.querySelector(h.classList.contains("sb-tippt") ? (h.classList.contains("sb-tafelt") ? ".sb-tafel" : ".sb-text") : "canvas"), fr = frage.getBoundingClientRect();
        var cr = c ? c.getBoundingClientRect() : null;
        if (fr.top < 0 || (cr && cr.bottom > window.innerHeight)) {
          try { frage.scrollIntoView({ block: "start" }); } catch (e) { frage.scrollIntoView(true); }
          if (frage.getBoundingClientRect().top < 4) window.scrollBy(0, -8);
        }
      }
    });
    huellen.push(h);
    if (linealFrei) h.sbLineal && h.sbLineal(true);
    if (tippenFrei) h.sbTippen && h.sbTippen(true);
    h.__frage = frage ? frage.textContent : "";
    if (tafelFrei) h.sbTafel && h.sbTafel(true, h.__frage);
    return h;
  }

  /* Rückweg-Schalter "lineal": einmal fragen, dann alle jetzigen und künftigen Flächen freischalten. */
  var huellen = [], linealFrei = false, tippenFrei = false, tafelFrei = false;
  function linealFragen() {
    try {
      fetch("/api/schalter?name=lineal", { credentials: "same-origin", cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || d.wert !== "neu") return;
          linealFrei = true;
          huellen.forEach(function (x) { if (x.sbLineal) x.sbLineal(true); });
        })
        .catch(function () {});
    } catch (e) {}
  }

  /* Rückweg-Schalter "rechentippen": genauso, aber für den Umschalter Zeichnen | Tippen. */
  function tippenFragen() {
    try {
      fetch("/api/schalter?name=rechentippen", { credentials: "same-origin", cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || d.wert !== "neu") return;
          tippenFrei = true;
          huellen.forEach(function (x) { if (x.sbTippen) x.sbTippen(true); });
        })
        .catch(function () {});
    } catch (e) {}
  }

  /* Rückweg-Schalter "rechentafel" (05.11.2026): Rechentabelle im Tippen-Teil. */
  function tafelFragen() {
    try {
      fetch("/api/schalter?name=rechentafel", { credentials: "same-origin", cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || d.wert !== "neu") return;
          tafelFrei = true;
          huellen.forEach(function (x) { if (x.sbTafel) x.sbTafel(true, x.__frage || ""); });
        })
        .catch(function () {});
    } catch (e) {}
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
    linealFragen();
    tippenFragen();
    tafelFragen();
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

  /* Rechenflächen-Marke (05.11.2026, Dennys Absicherung 2): lernstand.js fragt je Mathe-Antwort, ob die
     Rechentabelle angeboten war (tafelAn) und ob Paul seit der letzten Antwort hineingetippt hat
     (tafelGenutzt(true) liest und setzt zurück). Lauscht nur, ändert keine Eingabe. */
  var tafelGetippt = false;
  document.addEventListener("input", function (e) {
    try { if (e.target && e.target.closest && e.target.closest(".rf .sb-tafel")) tafelGetippt = true; } catch (x) {}
  }, true);
  window.Rechenflaeche = {
    istRechnen: istRechnen,                            // nur zum Prüfen von außen, ändert nichts
    tafelAn: function () { return tafelFrei; },
    tafelGenutzt: function (zuruecksetzen) { var g = tafelGetippt; if (zuruecksetzen) tafelGetippt = false; return g; }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
