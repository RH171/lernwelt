/* "Probe angekündigt" – Paul trägt seine Proben selbst ein (13.10.2026).
 *
 * Denny per Klickfrage: Paul soll angekündigte Proben selbst eintragen. Er
 * wählt Fach (Knöpfe), Tag (heute bis +60 Tage, kein Wochenende) und – wenn
 * er es weiß – ein Thema: die Themen seiner Heftblätter dieses Fachs zum
 * Antippen oder frei getippt. Gespeichert wird über POST /api/noten mit
 * seinem eigenen Ausweis (der Server prüft alle Grenzen noch einmal,
 * functions/api/_probentermine.js, kindSchreiben).
 *
 * Danach zeigt die Probenkarte die Probe sofort (LWProbenkarte.zeigen mit den
 * zurückgegebenen Terminen). Eigene, noch nicht vergangene Einträge kann er
 * ändern oder löschen; was Mama oder Papa eingetragen haben, nicht.
 *
 * Nichts davon liegt im localStorage – paul-sync würde es an alle Geräte
 * verteilen. Der Stand kommt immer vom Server.
 *
 *   LWProbeneintrag.start({ kind: "paul", knopf: el, karte: el })
 */
(function(){
  var FAECHER = [["mathe", "Mathe", "➕"], ["deutsch", "Deutsch", "📖"], ["hsu", "HSU", "🌍"],
    ["englisch", "Englisch", "🇬🇧"], ["rel", "Religion", "🕊️"], ["musik", "Musik", "🎵"]];
  var NAME = {}; FAECHER.forEach(function(f){ NAME[f[0]] = f[1]; });
  var VORAUS = 60;

  function esc(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function heute(){ return window.__probenHeute || new Date().toLocaleDateString("sv-SE"); }
  function plus(iso, n){
    var d = new Date(Date.UTC(+iso.slice(0,4), +iso.slice(5,7)-1, +iso.slice(8,10) + n, 12));
    return d.toISOString().slice(0, 10);
  }
  function wochenende(iso){ var w = new Date(iso + "T12:00:00Z").getUTCDay(); return w === 0 || w === 6; }
  function lang(iso){ return new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" }); }

  function stil(){
    if (document.getElementById("lwpe-stil")) return;
    var s = document.createElement("style"); s.id = "lwpe-stil";
    s.textContent =
      ".pe-knopf{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:48px;margin:0 0 18px;" +
      "border:2px dashed var(--muted);border-radius:18px;background:var(--card);color:var(--ink);font:800 16px var(--round,system-ui);cursor:pointer}" +
      ".pe-knopf:focus-visible{outline:3px solid #f59e0b;outline-offset:2px}" +
      ".pe-ov{position:fixed;inset:0;z-index:300;background:rgba(10,12,20,.55);display:flex;align-items:flex-start;justify-content:center;" +
      "padding:max(12px,env(safe-area-inset-top)) 12px 12px;overflow-y:auto}" +
      ".pe-ov.verborgen{display:none}" +
      ".pe-box{background:var(--card);color:var(--ink);border-radius:22px;max-width:560px;width:100%;padding:18px 18px 20px;" +
      "box-shadow:0 20px 50px rgba(0,0,0,.35);font-family:var(--round,system-ui);margin:auto 0}" +
      ".pe-kopf{display:flex;align-items:center;gap:10px;margin-bottom:6px}" +
      ".pe-kopf h2{margin:0;font-size:22px;flex:1}" +
      ".pe-zu{min-width:48px;min-height:48px;border:0;border-radius:14px;background:transparent;color:var(--ink);font-size:24px;cursor:pointer}" +
      ".pe-l{font-weight:800;font-size:16px;margin:16px 0 8px}" +
      ".pe-reihe{display:flex;flex-wrap:wrap;gap:8px}" +
      ".pe-chip{min-height:48px;padding:8px 14px;border-radius:14px;border:2px solid var(--line);background:transparent;color:var(--ink);" +
      "font:700 16px var(--round,system-ui);cursor:pointer}" +
      ".pe-chip.an{border-color:#b45309;background:#fff3c4;color:#3a2c00}" +
      "html[data-theme=dark] .pe-chip.an{border-color:#f2d36b;background:#2e2610;color:#fff1c2}" +
      ".pe-chip.klein{min-height:44px;font-size:15px;font-weight:600}" +
      ".pe-feld{width:100%;box-sizing:border-box;min-height:48px;padding:10px 12px;border-radius:14px;border:2px solid var(--line);" +
      "background:transparent;color:var(--ink);font:600 17px var(--round,system-ui)}" +
      "html[data-theme=dark] .pe-feld{color-scheme:dark}" +
      ".pe-leise{color:var(--muted);font-size:14px;margin-top:6px}" +
      ".pe-meldung{min-height:22px;margin:12px 0 0;font-weight:700;font-size:15px}" +
      ".pe-meldung.fehl{color:#9a3412}html[data-theme=dark] .pe-meldung.fehl{color:#fdba74}" +
      ".pe-meldung.gut{color:#166534}html[data-theme=dark] .pe-meldung.gut{color:#86efac}" +
      ".pe-speichern{display:block;width:100%;min-height:52px;margin-top:14px;border:0;border-radius:16px;background:#7a5a00;color:#fff;" +
      "font:800 18px var(--round,system-ui);cursor:pointer}" +
      "html[data-theme=dark] .pe-speichern{background:#f2d36b;color:#2a2000}" +
      ".pe-speichern:disabled{opacity:.6;cursor:default}" +
      ".pe-liste{margin-top:18px;border-top:1px solid var(--line);padding-top:6px}" +
      ".pe-zeile{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid var(--line)}" +
      ".pe-zeile:last-child{border-bottom:0}" +
      ".pe-zeile .pe-was{flex:1 1 200px;min-width:0;font-size:15px}" +
      ".pe-zeile button{min-height:44px;padding:6px 12px;border-radius:12px;border:2px solid var(--line);background:transparent;" +
      "color:var(--ink);font:700 15px var(--round,system-ui);cursor:pointer}";
    document.head.appendChild(s);
  }

  function start(o){
    var kind = o.kind || "paul";
    stil();
    var knopf = o.knopf;
    if (!knopf) return;
    knopf.className = "pe-knopf";
    knopf.type = "button";
    knopf.innerHTML = "📝 Probe angekündigt? Hier eintragen";

    var ov = document.createElement("div");
    ov.className = "pe-ov verborgen"; ov.id = "peDialog";
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "peTitel");
    ov.innerHTML =
      '<div class="pe-box">' +
        '<div class="pe-kopf"><h2 id="peTitel">📝 Probe angekündigt</h2><button type="button" class="pe-zu" id="peZu" aria-label="Schließen">✕</button></div>' +
        '<div class="pe-leise" id="peUnter">Trag ein, was deine Lehrerin angekündigt hat.</div>' +
        '<div class="pe-l">Welches Fach?</div><div class="pe-reihe" id="peFaecher"></div>' +
        '<div class="pe-l"><label for="peTag">Wann?</label></div>' +
        '<input class="pe-feld" type="date" id="peTag">' +
        '<div class="pe-leise" id="peTagText"></div>' +
        '<div class="pe-l"><label for="peThema">Thema – wenn du es weißt</label></div>' +
        '<div class="pe-reihe" id="peThemen"></div>' +
        '<input class="pe-feld" type="text" id="peThema" maxlength="40" autocomplete="off" placeholder="z. B. Einmaleins und Teilen" style="margin-top:8px">' +
        '<div class="pe-meldung" id="peMeldung" aria-live="polite"></div>' +
        '<button type="button" class="pe-speichern" id="peSpeichern">Speichern</button>' +
        '<div class="pe-liste" id="peListe"></div>' +
      '</div>';
    document.body.appendChild(ov);
    var $ = function(id){ return document.getElementById(id); };

    var wahl = { fach: "", alt: null };
    var termine = [];          // kuenftige, vom Server
    var themenCache = {};

    function meldung(text, art){ var m = $("peMeldung"); m.textContent = text || ""; m.className = "pe-meldung" + (art ? " " + art : ""); }

    function faecherMalen(){
      var box = $("peFaecher"); box.innerHTML = "";
      FAECHER.forEach(function(f){
        var b = document.createElement("button");
        b.type = "button"; b.className = "pe-chip" + (wahl.fach === f[0] ? " an" : "");
        b.setAttribute("aria-pressed", wahl.fach === f[0] ? "true" : "false");
        b.setAttribute("data-fach", f[0]);
        b.textContent = f[2] + " " + f[1];
        b.addEventListener("click", function(){ wahl.fach = f[0]; faecherMalen(); themenHolen(); meldung(""); });
        box.appendChild(b);
      });
    }

    function themenMalen(liste){
      var box = $("peThemen"); box.innerHTML = "";
      (liste || []).slice(0, 8).forEach(function(t){
        var b = document.createElement("button");
        b.type = "button"; b.className = "pe-chip klein" + ($("peThema").value.trim() === t ? " an" : "");
        b.textContent = t;
        b.addEventListener("click", function(){ $("peThema").value = t; themenMalen(liste); });
        box.appendChild(b);
      });
    }
    function themenHolen(){
      var f = wahl.fach; themenMalen([]);
      if (!f) return;
      if (themenCache[f]) { themenMalen(themenCache[f]); return; }
      fetch("/api/schulstoff?kind=" + encodeURIComponent(kind) + "&fach=" + encodeURIComponent(f), { credentials: "same-origin" })
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(j){
          var zahl = {};
          ((j && j.ok && j.blaetter) || []).forEach(function(b){
            var t = String(b.thema || "").trim();
            if (!t || b.probenstoff === false) return;
            zahl[t] = (zahl[t] || 0) + 1;
          });
          themenCache[f] = Object.keys(zahl).sort(function(a, b){ return zahl[b] - zahl[a] || a.localeCompare(b, "de"); });
          if (wahl.fach === f) themenMalen(themenCache[f]);
        })
        .catch(function(){});
    }

    function tagPruefen(){
      var v = $("peTag").value, h = heute(), txt = $("peTagText");
      if (!v) { txt.textContent = ""; return ""; }
      if (v < h) { txt.textContent = "Dieser Tag ist schon vorbei."; return "fehl"; }
      if (v > plus(h, VORAUS)) { txt.textContent = "So weit voraus geht es nicht – höchstens zwei Monate."; return "fehl"; }
      if (wochenende(v)) { txt.textContent = "Das ist ein Wochenende – da ist keine Schule."; return "fehl"; }
      txt.textContent = lang(v);
      return "ok";
    }

    function listeMalen(){
      var box = $("peListe");
      var eigene = termine.filter(function(t){ return t && t.datum >= heute(); });
      if (!eigene.length) { box.innerHTML = ""; return; }
      box.innerHTML = '<div class="pe-l" style="margin-top:8px">Eingetragene Proben</div>';
      eigene.forEach(function(t){
        var z = document.createElement("div"); z.className = "pe-zeile";
        var meins = t.von === kind;
        z.innerHTML = '<div class="pe-was"><b>' + esc(NAME[t.fach] || t.fach) + '</b>' + (t.thema ? " · " + esc(t.thema) : "") +
          '<br><span class="pe-leise">' + esc(lang(t.datum)) + (meins ? "" : " · von Mama oder Papa") + '</span></div>';
        if (meins) {
          var aendern = document.createElement("button"); aendern.type = "button"; aendern.textContent = "Ändern";
          aendern.addEventListener("click", function(){
            wahl.fach = t.fach; wahl.alt = { datum: t.datum, fach: t.fach };
            $("peTag").value = t.datum; $("peThema").value = t.thema || "";
            faecherMalen(); themenHolen(); tagPruefen();
            $("peSpeichern").textContent = "Änderung speichern";
            meldung("Ändere Fach, Tag oder Thema und tippe auf „Änderung speichern“.");
            try { $("peFaecher").scrollIntoView({ block: "center" }); } catch (e) {}
          });
          var weg = document.createElement("button"); weg.type = "button"; weg.textContent = "Löschen";
          weg.addEventListener("click", function(){
            if (weg.getAttribute("data-sicher") !== "1") { weg.setAttribute("data-sicher", "1"); weg.textContent = "Wirklich löschen?"; return; }
            senden({ kind: kind, terminWeg: { datum: t.datum, fach: t.fach } }, "Gelöscht.");
          });
          z.appendChild(aendern); z.appendChild(weg);
        }
        box.appendChild(z);
      });
    }

    function kartePflegen(){
      if (o.karte && window.LWProbenkarte) try { LWProbenkarte.zeigen(o.karte, termine, kind); } catch (e) {}
    }

    function laden(){
      return fetch("/api/noten?eigene=1&kind=" + encodeURIComponent(kind), { credentials: "same-origin" })
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(j){ if (j && j.ok && Array.isArray(j.termine)) { termine = j.termine; listeMalen(); } })
        .catch(function(){});
    }

    function senden(korpus, gutText){
      var knopfS = $("peSpeichern");
      knopfS.disabled = true; meldung("Einen Moment …");
      return fetch("/api/noten", { method: "POST", credentials: "same-origin",
          headers: { "content-type": "application/json" }, body: JSON.stringify(korpus) })
        .then(function(r){ return r.json().catch(function(){ return { ok: false }; }).then(function(j){ return { s: r.status, j: j }; }); })
        .then(function(x){
          knopfS.disabled = false;
          if (!x.j || !x.j.ok) { meldung((x.j && x.j.fehler) || "Das hat gerade nicht geklappt. Versuch es gleich noch einmal.", "fehl"); return false; }
          if (Array.isArray(x.j.termine)) termine = x.j.termine;
          kartePflegen(); listeMalen();
          meldung(gutText, "gut");
          return true;
        })
        .catch(function(){ knopfS.disabled = false; meldung("Keine Verbindung. Versuch es gleich noch einmal.", "fehl"); return false; });
    }

    function zuruecksetzen(){
      wahl.fach = ""; wahl.alt = null;
      $("peTag").value = ""; $("peThema").value = ""; $("peTagText").textContent = "";
      $("peSpeichern").textContent = "Speichern";
      faecherMalen(); themenMalen([]);
    }

    function oeffnen(){
      zuruecksetzen(); meldung("");
      var h = heute();
      $("peTag").min = h; $("peTag").max = plus(h, VORAUS);
      ov.classList.remove("verborgen");
      document.documentElement.style.overflow = "hidden";
      laden();
      try { $("peZu").focus(); } catch (e) {}
    }
    function schliessen(){
      ov.classList.add("verborgen");
      document.documentElement.style.overflow = "";
      try { knopf.focus(); } catch (e) {}
    }

    knopf.addEventListener("click", oeffnen);
    $("peZu").addEventListener("click", schliessen);
    ov.addEventListener("click", function(e){ if (e.target === ov) schliessen(); });
    document.addEventListener("keydown", function(e){ if (e["key"] === "Escape" && !ov.classList.contains("verborgen")) schliessen(); });
    $("peTag").addEventListener("change", tagPruefen);
    $("peTag").addEventListener("input", tagPruefen);
    $("peThema").addEventListener("input", function(){ themenMalen(themenCache[wahl.fach] || []); });

    $("peSpeichern").addEventListener("click", function(){
      if (!wahl.fach) { meldung("Tipp zuerst auf ein Fach.", "fehl"); return; }
      var tag = $("peTag").value;
      if (!tag) { meldung("Wähl noch den Tag der Probe.", "fehl"); return; }
      if (tagPruefen() !== "ok") { meldung($("peTagText").textContent, "fehl"); return; }
      var korpus = { kind: kind, termin: { datum: tag, fach: wahl.fach, thema: $("peThema").value.trim().slice(0, 40) } };
      if (wahl.alt) korpus.terminAlt = wahl.alt;
      senden(korpus, "Gespeichert: " + (NAME[wahl.fach] || wahl.fach) + " am " + lang(tag) + ".").then(function(ok){
        if (!ok) return;
        zuruecksetzen();
        setTimeout(function(){
          schliessen();
          try { if (o.karte) o.karte.scrollIntoView({ block: "nearest" }); } catch (e) {}
        }, 900);
      });
    });

    faecherMalen();
    return { oeffnen: oeffnen, schliessen: schliessen };
  }

  window.LWProbeneintrag = { start: start };
})();
