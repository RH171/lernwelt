/* Fachfrage in der Ablage (16.10.2026, anleitung/054)
 *
 * Bis heute fragte nur das Hochladen nach dem Fach („Dein Blatt sieht nach HSU aus, du hast
 * Mathe gewählt“). Entsteht der Vorschlag erst später - weil das erste Lesen scheiterte und das
 * Volllesen das Fach nachliest -, stand er nur auf der Startseite („Bitte kurz nachsehen“). In der
 * Ablage, wo das Kind das Blatt gerade ansieht, war er unsichtbar. Beleg: Pauls „Abschreiben und
 * Trennungsregeln“ vom 14.10.2026 lag unter Mathe, Inhalt Deutsch.
 *
 * Eine Datei für alle drei Ablagen (paul/, leon/, helena/schulstoff.html):
 *   LWFachfrage.schild(e)                      -> HTML-Schild „❓ Fach?“ für die Karte (oder "")
 *   LWFachfrage.kasten(box, e, opt)            -> malt die Frage in box (leer ohne offenen Vorschlag)
 *        opt = { kind, kurz: {fach: Name}, zeichen: {fach: Zeichen}, fertig: function(fach) }
 * Geschrieben wird erst beim Tippen: PATCH fach-bestaetigen / fach-ablehnen (wie Startseite und
 * Hochladen). Nie still getauscht.
 */
(function () {
  "use strict";
  function offen(e) { return !!(e && e.fachVorschlag && e.fachVorschlag !== e.fach && e.sichtbar !== false); }
  function el(tag, cls, text) {
    var x = document.createElement(tag); if (cls) x.className = cls;
    if (text != null) x.textContent = text; return x;
  }
  /* Altersgerecht: Leon (2. Klasse) kurz und mit „ich glaube“, Helena (7. Klasse) sachlich. */
  var TEXT = {
    paul:   function (neu, alt) { return "Dein Blatt sieht nach " + neu + " aus. Du hast " + alt + " gewählt. Welches stimmt?"; },
    leon:   function (neu, alt) { return "Ich glaube, das ist " + neu + ". Du hast " + alt + " getippt. Was stimmt?"; },
    helena: function (neu, alt) { return "Das Blatt sieht nach " + neu + " aus, abgelegt ist es unter " + alt + ". Welches Fach stimmt?"; }
  };
  var STIL = ".lwf-schild{position:absolute;left:8px;bottom:auto;top:116px;background:#b45309;color:#fff;" +
    "border-radius:999px;padding:3px 10px;font:700 12.5px var(--rund,system-ui)}" +
    ".lwf-kasten{background:#fff7ed;color:#161a2b;border-radius:14px;padding:12px 14px;margin:10px 0 0;" +
    "font:600 16px var(--rund,system-ui);line-height:1.35}" +
    ".lwf-kasten.verborgen{display:none}" +
    ".lwf-kasten .lwf-knoepfe{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}" +
    ".lwf-kasten button{appearance:none;min-height:44px;padding:10px 16px;border-radius:999px;cursor:pointer;" +
    "font:700 16px var(--rund,system-ui);border:2px solid #92400e;background:#fff;color:#7c2d12}" +
    ".lwf-kasten button.lwf-ja{background:#92400e;color:#fff}" +
    ".lwf-kasten button:disabled{opacity:.6}";
  function stil() {
    if (document.getElementById("lwf-stil")) return;
    var s = document.createElement("style"); s.id = "lwf-stil"; s.textContent = STIL;
    document.head.appendChild(s);
  }
  function schild(e) { return offen(e) ? '<span class="lwf-schild">❓ Fach?</span>' : ""; }

  function kasten(box, e, opt) {
    if (!box) return;
    stil();
    /* Gerade beantwortet: die Bestätigung bleibt stehen, auch wenn die Seite neu malt. */
    if (e && box.getAttribute("data-fertig") === e.id) return;
    box.removeAttribute("data-fertig");
    box.innerHTML = "";
    box.className = "lwf-kasten";
    if (!offen(e)) { box.classList.add("verborgen"); return; }
    var o = opt || {}, kurz = o.kurz || {}, zeichen = o.zeichen || {};
    var name = function (f) { return kurz[f] || f; };
    var kind = TEXT[o.kind] ? o.kind : "paul";
    var neu = e.fachVorschlag, alt = e.fach;
    var text = el("div", "lwf-text", "❓ " + TEXT[kind](name(neu), name(alt)));
    var ja = el("button", "lwf-ja", (zeichen[neu] ? zeichen[neu] + " " : "") + (kind === "leon" ? "Es ist " : "") + name(neu));
    var nein = el("button", "lwf-nein", (zeichen[alt] ? zeichen[alt] + " " : "") + (kind === "helena" ? "Bleibt " : kind === "leon" ? "Es ist " : "") + name(alt));
    ja.type = nein.type = "button";
    ja.setAttribute("data-fachfrage", "ja"); nein.setAttribute("data-fachfrage", "nein");
    var k = el("div", "lwf-knoepfe"); k.appendChild(ja); k.appendChild(nein);
    box.appendChild(text); box.appendChild(k);
    function antwort(was) {
      ja.disabled = nein.disabled = true;
      fetch("/api/schulstoff", { method: "PATCH", credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: o.kind, id: e.id, was: was }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j || !j.ok) throw 0;
          var auf = j.fach || (was === "fach-bestaetigen" ? neu : alt);
          e.fach = auf; delete e.fachVorschlag;
          box.innerHTML = "";
          box.setAttribute("data-fertig", e.id);
          box.appendChild(el("div", "lwf-fertig", "✅ Alles klar – " + (kind === "helena" ? "das Blatt" : "dein Blatt") + " liegt bei " + name(auf) + "."));
          if (typeof o.fertig === "function") o.fertig(auf);
        })
        .catch(function () {
          ja.disabled = nein.disabled = false;
          text.textContent = "Das hat nicht geklappt – probier es nochmal.";
        });
    }
    ja.addEventListener("click", function () { antwort("fach-bestaetigen"); });
    nein.addEventListener("click", function () { antwort("fach-ablehnen"); });
  }
  window.LWFachfrage = { schild: schild, kasten: kasten, offen: offen };
})();
