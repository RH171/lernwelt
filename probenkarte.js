/* Gelbe Probenkarte (04.10.2026, Dennys Wahl: Version B; erweitert 13.10.2026).
 *
 * Seit 13.10.2026 (Dennys Wahl per Klickfrage): ein Hinweis fuer JEDE Probe in
 * den naechsten 14 Tagen, nicht nur fuer eine mit eigener Uebung. Paul traegt
 * angekuendigte Proben selbst ein (probeneintrag.js). Die naechste Probe steht
 * gross da, weitere als kurze Zeile.
 *
 *   "Noch 6 Tage bis Mathe · Einmaleins und Teilen"   am Tag selbst "Heute: Mathe-Probe"
 *
 * Der Knopf fuehrt immer irgendwohin - ein Hinweis ohne Weg waere nur Druck:
 *   1. Uebung genau zu Fach+Thema (UEBUNGEN, z. B. Deutsch Lesen -> Generalprobe)
 *   2. Uebung zum Fach (UEBUNGEN "<fach>|*", z. B. Mathe -> 1x1-Woche)
 *   3. sonst "Im Heft wiederholen": Lernquiz dieses Fachs (?fach=…)
 * Kein Rot, kein Alarm, keine Uhr. Die Zahl der Tage steht ruhig dabei.
 *
 * Termine kommen aus GET /api/noten?eigene=1 (Feld termine). termine:null
 * heisst "Speicher hat nicht geantwortet" - dann bleibt die Karte einfach weg.
 * Nach jedem Zeigen meldet die Karte die Termine als Ereignis
 * "lw-probentermine" (detail: {kind, termine, faecher}) - die Startseite
 * zeigt damit Probe-Kacheln nur, solange eine Probe des Fachs ansteht.
 *
 *   LWProbenkarte.laden("paul", element)          holt selbst
 *   LWProbenkarte.zeigen(element, termine, kind)  mit schon geholten Terminen
 */
(function(){
  /* Je Kind: "fach|thema" (klein) -> Uebung. "satz" ist optional, sonst gilt
   * der Lese-Satz. Nur Paul: Leon und Helena bekommen die Karte nicht (Denny,
   * 04.10.2026: "Das war nicht gewuenscht. Das war fuer Paul"). Kapitel 105. */
  var UEBUNGEN = {
    paul: {
      "deutsch|lesen": { href: "/paul/klasse4-deutsch-generalprobe-lesen.html?los=1", knopf: "▶ Neue Geschichte",
        satz: "Üb mit einer Geschichte – so viel du magst." },
      // Mathe: die 1x1-Woche passt zu jedem Mathe-Thema der Klasse 4 als Aufwaermen (Dennys Vorgabe 13.10.2026).
      "mathe|*": { href: "/paul/klasse4-mathe-einmaleinswoche.html", knopf: "▶ 1×1-Woche",
        satz: "Üb in Ruhe – so viel du magst." }
    }
  };
  /* Kurz vor der Probe (13.10.2026, Dennys Wahl C): In den letzten Tagen vor einer Probe, deren
   * Thema passt, fuehrt die Karte auf die Generalprobe statt auf die allgemeine Uebung.
   * Mathe "Einmaleins und Teilen" am 19.10.2026: ab Samstag 17.10. (2 Tage vorher) bis zum
   * Probentag; danach ist die Probe vorbei und die Karte weg. Ohne Thema zaehlt es auch. Kapitel 122. */
  var NAH = {
    paul: {
      mathe: { tage: 2, thema: /einmaleins|1\s*[x×·]\s*1|teil|geteilt|divi|mal|multipli/i,
        href: "/paul/klasse4-mathe-generalprobe.html?los=1", knopf: "▶ Generalprobe Mathe",
        satz: "Eine Probe zum Ausprobieren – jedes Mal neue Zahlen, so oft du magst.", nah: true }
    }
  };
  var FAECHER = { deutsch: "Deutsch", mathe: "Mathe", hsu: "HSU", englisch: "Englisch", religion: "Religion", rel: "Religion",
    musik: "Musik", franz: "Französisch", geschichte: "Geschichte", geo: "Geographie", info: "Informatik", ethik: "Ethik" };
  // Quiz-Seite je Kind fuer "Im Heft wiederholen".
  var QUIZ = { paul: "/paul/quiz.html", leon: "/leon/quiz.html", helena: "/helena/quiz.html" };
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
      "html[data-theme=dark] .lwpk .pk-los{background:#f2d36b;color:#2a2000}" +
      ".lwpk .pk-w{font:600 14px/1.35 system-ui,sans-serif;color:var(--pk-leise);margin-top:6px}" +
      ".lwpk .pk-knoepfe{display:flex;flex-direction:column;align-items:stretch;gap:6px}" +
      ".lwpk .pk-heft{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:6px 14px;" +
      "border-radius:999px;border:2px solid var(--pk-rand);color:var(--pk-text);font:700 15px system-ui,sans-serif;text-decoration:none;white-space:nowrap}";
    document.head.appendChild(s);
  }

  function fachName(f){ return FAECHER[f] || (f ? f.charAt(0).toUpperCase() + f.slice(1) : ""); }
  function heftWeg(kind, fach){ return (QUIZ[kind] || "quiz.html") + "?fach=" + encodeURIComponent(String(fach || "").toLowerCase()); }
  function uebungFuer(t, kind, tage){
    var u = UEBUNGEN[kind] || {}, f = String(t.fach || "").toLowerCase();
    var genau = u[f + "|" + String(t.thema || "").trim().toLowerCase()];
    if (genau) return genau;
    var nah = (NAH[kind] || {})[f], th = String(t.thema || "").trim();
    if (nah && typeof tage === "number" && tage >= 0 && tage <= nah.tage && (!th || nah.thema.test(th))) return nah;
    if (u[f + "|*"]) return u[f + "|*"];
    return { href: heftWeg(kind, f), knopf: "▶ Im Heft wiederholen",
      satz: "Wiederhol, was in deinem Heft steht – so viel du magst.", heft: true };
  }

  // Alle Termine von heute bis +14 Tage, nach Datum: [{termin, tage, uebung}].
  function anstehend(termine, kind, h){
    var liste = (Array.isArray(termine) ? termine : []).slice().sort(function(a, b){ return a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : 0; });
    var raus = [];
    for (var i = 0; i < liste.length; i++) {
      var t = liste[i]; if (!t || typeof t.datum !== "string" || !t.fach) continue;
      var n = tageBis(t.datum, h);
      if (n < 0 || n > TAGE) continue;
      raus.push({ termin: t, tage: n, uebung: uebungFuer(t, kind, n) });
    }
    return raus;
  }
  // Liefert den naechsten Termin (mit Uebung oder Heft-Weg) oder null.
  function waehle(termine, kind, h){ return anstehend(termine, kind, h)[0] || null; }

  function titel(w){
    var t = w.termin, f = fachName(t.fach), th = String(t.thema || "").trim();
    if (w.tage === 0) return "Heute: " + f + "-Probe" + (th ? " · " + th : "");
    if (w.tage === 1) return "Morgen: " + f + "-Probe" + (th ? " · " + th : "");
    return "Noch " + w.tage + " Tage bis " + f + (th ? " · " + th : "");
  }
  function kurz(iso){
    return new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  }

  function melden(kind, termine, h){
    try {
      var faecher = {}, nah = {};
      anstehend(termine, kind, h).forEach(function(w){
        var f = String(w.termin.fach).toLowerCase(); faecher[f] = true;
        if (w.uebung && w.uebung.nah) nah[f] = true;   // Generalprobe kurz vor der Probe (NAH)
      });
      window.LWProbenkarte.termine = termine;
      window.LWProbenkarte.faecher = faecher;
      window.LWProbenkarte.nah = nah;
      document.dispatchEvent(new CustomEvent("lw-probentermine", { detail: { kind: kind, termine: termine, faecher: faecher, nah: nah } }));
    } catch (e) {}
  }

  function zeigen(el, termine, kind){
    if (!el) return false;
    var h = window.__probenHeute || heute();
    var alle = anstehend(termine, kind, h);
    melden(kind, termine, h);
    if (!alle.length) { el.innerHTML = ""; el.classList.add("verborgen"); return false; }
    stil();
    var w = alle[0], t = w.termin;
    el.classList.remove("verborgen");
    var weitere = alle.slice(1, 4).map(function(x){
      var th = String(x.termin.thema || "").trim();
      return '<div class="pk-w">Danach: ' + esc(fachName(x.termin.fach)) + (th ? " · " + esc(th) : "") + " am " + esc(kurz(x.termin.datum)) +
        " (" + (x.tage === 1 ? "morgen" : "in " + x.tage + " Tagen") + ")</div>";
    }).join("");
    var heftLink = w.uebung.heft ? "" :
      '<a class="pk-heft" href="' + esc(heftWeg(kind, t.fach)) + '">Im Heft wiederholen</a>';
    // Leon ist Leseanfaenger: groessere Schrift.
    el.innerHTML = '<div class="lwpk' + (kind === "leon" ? " gross" : "") + '" id="lwpk">' +
      '<div class="pk-ic">📝</div>' +
      '<div class="pk-txt"><div class="pk-k">Nächste Probe</div>' +
      '<div class="pk-t">' + esc(titel(w)) + '</div>' +
      '<div class="pk-s">' + esc(lang(t.datum)) + '. ' + esc(w.uebung.satz || "Üb in Ruhe – so viel du magst.") + '</div>' +
      weitere + '</div>' +
      '<div class="pk-knoepfe"><a class="pk-los" href="' + esc(w.uebung.href) + '">' + esc(w.uebung.knopf) + '</a>' + heftLink + '</div></div>';
    return true;
  }

  function laden(kind, el){
    if (!el) return;
    fetch("/api/noten?eigene=1&kind=" + encodeURIComponent(kind), { credentials: "same-origin" })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ zeigen(el, j && j.ok ? j.termine : null, kind); })
      .catch(function(){ zeigen(el, null, kind); });
  }

  window.LWProbenkarte = { laden: laden, zeigen: zeigen, waehle: waehle, anstehend: anstehend, UEBUNGEN: UEBUNGEN, NAH: NAH,
    FAECHER: FAECHER, termine: undefined, faecher: {}, nah: {} };
})();
