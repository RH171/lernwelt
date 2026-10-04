/* Gelbe Probenkarte (04.10.2026, Dennys Wahl: Version B).
 *
 * "Naechste Probe · Deutsch · Lesen · Freitag, 9. Oktober 2026" mit einem Knopf
 * zur passenden Uebung. Erscheint nur, wenn
 *   - der Termin in den naechsten 14 Tagen liegt (heute zaehlt mit), UND
 *   - zu Fach und Thema eine Uebung in UEBUNGEN steht.
 * Ohne Uebung keine Karte: Eine Erinnerung ohne Weg dorthin waere nur Druck.
 * Kein Countdown, keine rote Zahl - "in 5 Tagen" steht ruhig dabei.
 *
 * Termine kommen aus GET /api/noten?eigene=1 (Feld termine, gesetzt mit
 * ./werkstatt.sh probe-termin). termine:null heisst "Speicher hat nicht
 * geantwortet" - dann bleibt die Karte einfach weg.
 *
 *   LWProbenkarte.laden("paul", element)          holt selbst
 *   LWProbenkarte.zeigen(element, termine, kind)  mit schon geholten Terminen
 */
(function(){
  /* Je Kind: "fach|thema" (klein) -> Uebung. "satz" ist optional, sonst gilt
   * der Lese-Satz. Helena (04.10.2026): noch kein Termin, keine Uebung - die
   * Karte ist auf Start- und Pruefungsseite eingebaut und bleibt bis dahin weg.
   * Ein Eintrag hier plus ein Termin genuegen (Kapitel 103 und 105). */
  var UEBUNGEN = {
    paul: { "deutsch|lesen": { href: "/paul/klasse4-deutsch-generalprobe-lesen.html?los=1", knopf: "▶ Neue Geschichte" } },
    leon: { "deutsch|lesen": { href: "/leon/klasse2-deutsch-generalprobe-lesen.html?los=1", knopf: "▶ Neue Geschichte",
            satz: "Üb mit einer kurzen Geschichte – so oft du magst." } },
    helena: {}
  };
  var FAECHER = { deutsch: "Deutsch", mathe: "Mathe", hsu: "HSU", englisch: "Englisch", religion: "Religion", musik: "Musik",
    franz: "Französisch", geschichte: "Geschichte", geo: "Geographie", info: "Informatik", ethik: "Ethik" };
  var TAGE = 14;

  function heute(){ return new Date().toLocaleDateString("sv-SE"); }
  function tageBis(iso, h){
    var a = Date.UTC(+h.slice(0,4), +h.slice(5,7)-1, +h.slice(8,10));
    var b = Date.UTC(+iso.slice(0,4), +iso.slice(5,7)-1, +iso.slice(8,10));
    return Math.round((b - a) / 86400000);
  }
  function lang(iso){
    var d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
  function esc(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }

  function stil(){
    if (document.getElementById("lwpk-stil")) return;
    var s = document.createElement("style"); s.id = "lwpk-stil";
    s.textContent =
      ".lwpk{--pk-grund:#fff3c4;--pk-rand:#e8c35a;--pk-text:#3a2c00;--pk-leise:#5e4a10;" +
      "background:var(--pk-grund);border:2px solid var(--pk-rand);color:var(--pk-text);border-radius:18px;" +
      "padding:14px 16px;margin:0 0 12px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}" +
      "html[data-theme=dark] .lwpk{--pk-grund:#2e2610;--pk-rand:#8a6d1c;--pk-text:#fff1c2;--pk-leise:#e9d79a}" +
      ".lwpk .pk-ic{font-size:28px;line-height:1}" +
      ".lwpk .pk-txt{flex:1 1 220px;min-width:0}" +
      ".lwpk .pk-k{font:800 13px/1.2 system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--pk-leise)}" +
      ".lwpk .pk-t{font:800 18px/1.3 system-ui,sans-serif;margin-top:2px}" +
      ".lwpk .pk-s{font:15px/1.35 system-ui,sans-serif;color:var(--pk-leise);margin-top:2px}" +
      ".lwpk.gross .pk-t{font-size:21px}.lwpk.gross .pk-s{font-size:17px}.lwpk.gross .pk-los{font-size:18px;min-height:52px}" +
      ".lwpk .pk-los{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 18px;" +
      "border-radius:999px;background:#7a5a00;color:#fff;font:800 16px system-ui,sans-serif;text-decoration:none;white-space:nowrap}" +
      "html[data-theme=dark] .lwpk .pk-los{background:#f2d36b;color:#2a2000}";
    document.head.appendChild(s);
  }

  // Liefert den naechsten passenden Termin oder null.
  function waehle(termine, kind, h){
    var u = UEBUNGEN[kind] || {};
    var liste = (Array.isArray(termine) ? termine : []).slice().sort(function(a, b){ return a.datum < b.datum ? -1 : 1; });
    for (var i = 0; i < liste.length; i++) {
      var t = liste[i]; if (!t || typeof t.datum !== "string") continue;
      var n = tageBis(t.datum, h);
      if (n < 0 || n > TAGE) continue;
      var ueb = u[String(t.fach || "").toLowerCase() + "|" + String(t.thema || "").trim().toLowerCase()];
      if (ueb) return { termin: t, tage: n, uebung: ueb };
    }
    return null;
  }

  function zeigen(el, termine, kind){
    if (!el) return false;
    var h = window.__probenHeute || heute();
    var w = waehle(termine, kind, h);
    if (!w) { el.innerHTML = ""; el.classList.add("verborgen"); return false; }
    stil();
    var t = w.termin;
    var wann = w.tage === 0 ? "heute" : w.tage === 1 ? "morgen" : "in " + w.tage + " Tagen";
    el.classList.remove("verborgen");
    // Leon ist Leseanfaenger: groessere Schrift.
    el.innerHTML = '<div class="lwpk' + (kind === "leon" ? " gross" : "") + '" id="lwpk">' +
      '<div class="pk-ic">📝</div>' +
      '<div class="pk-txt"><div class="pk-k">Nächste Probe</div>' +
      '<div class="pk-t">' + esc(FAECHER[t.fach] || t.fach) + ' · ' + esc(t.thema) + ' · ' + esc(lang(t.datum)) + '</div>' +
      '<div class="pk-s">Das ist ' + wann + '. ' + esc(w.uebung.satz || "Üb mit einer Geschichte – so viel du magst.") + '</div></div>' +
      '<a class="pk-los" href="' + esc(w.uebung.href) + '">' + esc(w.uebung.knopf) + '</a></div>';
    return true;
  }

  function laden(kind, el){
    if (!el) return;
    fetch("/api/noten?eigene=1&kind=" + encodeURIComponent(kind), { credentials: "same-origin" })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ zeigen(el, j && j.ok ? j.termine : null, kind); })
      .catch(function(){});
  }

  window.LWProbenkarte = { laden: laden, zeigen: zeigen, waehle: waehle, UEBUNGEN: UEBUNGEN };
})();
