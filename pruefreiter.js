/* Prüf-Reiter: "Ich habe nachgesehen" (14.10.2026)
 *
 * Dennys Wahl am 14.10.2026, Variante C, nur für Paul: Jedes Blatt, das
 * Paul hochlädt, wird sofort nachgesehen. Die Karten erscheinen direkt im
 * Hochladen-Ablauf (paul/schulstoff.html); was offen bleibt, steht als
 * blauer Knopf "Nachgesehen" ganz oben auf paul/index.html.
 *
 * Diese Datei kennt KEINE Lösung. Sie holt die Stellen über
 * /api/pruefreiter (ohne Lösung) und schickt Pauls Verbesserung zurück -
 * geprüft wird auf dem Server (functions/api/_pruefreiter.js).
 *
 *   LWPruef.hochladen(kasten, blattId)   nach dem Durchlesen eines Blattes
 *   LWPruef.startseite(knopf)            Knopf oben auf der Startseite
 */
(function () {
  "use strict";
  var KIND = "paul";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function tag(iso) {
    var t = String(iso || "").split("-");
    return t.length === 3 ? (+t[2]) + "." + (+t[1]) + "." : "";
  }
  var SCHILD = {
    rechnen:  '<span class="lwp-schild lwp-s-rechnen">🧮 Bitte nachrechnen</span>',
    pinnwand: '<span class="lwp-schild lwp-s-pinnwand">📌 Pinnwand deiner Lehrerin</span>',
    lehrerin: '<span class="lwp-schild lwp-s-lehrerin">✍️ Rot von deiner Lehrerin</span>'
  };

  function holen(blatt) {
    return fetch("/api/pruefreiter?kind=" + KIND + (blatt ? "&blatt=" + encodeURIComponent(blatt) : ""),
                 { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        /* Ein alter Server ohne diesen Weg antwortet mit der Startseite oder
           mit {ok:true} ohne Liste - dann gibt es nichts zu zeigen. */
        if (!j || !j.ok || !Array.isArray(j.stellen)) return { stellen: [], blaetter: 0 };
        return j;
      })
      .catch(function () { return { stellen: [], blaetter: 0 }; });
  }
  function senden(stelle, aktion, antwort) {
    return fetch("/api/pruefreiter", {
      method: "POST", credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: KIND, stelle: stelle, aktion: aktion, antwort: antwort })
    }).then(function (r) { return r.json(); });
  }

  /* Eine Karte je Stelle. weg(id, endgueltig) meldet, dass die Karte geht:
     endgueltig = erledigt (verschwindet auch auf der Startseite),
     sonst "Später" (bleibt offen). */
  function karte(s, weg) {
    var d = document.createElement("div");
    d.className = "lwp-karte";
    d.setAttribute("data-stelle", s.id);
    d.setAttribute("data-art", s.art);
    var b = s.blatt || {};
    var kopf = '<div class="lwp-kopf">' + (SCHILD[s.art] || "") + '<span class="lwp-blatt">' +
      esc([b.art, b.titel, tag(b.datum)].filter(Boolean).join(" · ")) + "</span></div>";
    if (s.art === "lehrerin") {
      d.innerHTML = kopf +
        '<div class="lwp-lehrerin">Deine Lehrerin hat verbessert:<ul class="lwp-rotliste">' +
          (s.zeilen || []).map(function (z) { return "<li>" + esc(z) + "</li>"; }).join("") + "</ul></div>" +
        '<div class="lwp-hinweis">Verbessere es in deinem Heft.</div>' +
        '<div class="lwp-knoepfe"><button type="button" class="lwp-ja lwp-verbessert">Verbessert ✓</button>' +
        '<button type="button" class="lwp-leise lwp-spaeter">Später</button></div>' +
        '<div class="lwp-meldung" aria-live="polite"></div>';
    } else if (s.art === "pinnwand") {
      /* Dennys Entscheidung 14.10.2026, 10:30 Uhr: Paul hat nur falsch
         abgeschrieben und kann es nicht selbst nachprüfen - die Antwort der
         Lehrerin steht sofort da. */
      d.innerHTML = kopf +
        '<div class="lwp-aufgabe">' + esc(s.aufgabe) + "</div>" +
        '<div class="lwp-du">Du hast geschrieben: <span class="lwp-falsch">' + esc(s.du) + "</span></div>" +
        '<div class="lwp-lehrerin">Bei deiner Lehrerin steht: <b class="lwp-richtig">' + esc(s.lehrerin) + "</b></div>" +
        '<div class="lwp-hinweis">Verbessere es in deinem Heft.</div>' +
        '<div class="lwp-knoepfe"><button type="button" class="lwp-ja lwp-verbessert">Verbessert ✓</button>' +
        '<button type="button" class="lwp-leise lwp-spaeter">Später</button></div>' +
        '<div class="lwp-meldung" aria-live="polite"></div>';
    } else {
      d.innerHTML = kopf +
        '<div class="lwp-aufgabe">' + esc(s.aufgabe) + "</div>" +
        '<div class="lwp-du">Du hast geschrieben: <span class="lwp-falsch">' + esc(s.du) + "</span></div>" +
        '<div class="lwp-tipp">💡 <span class="lwp-tipptext">' + esc(s.tipp) + "</span></div>" +
        '<div class="lwp-feld"><input type="text" autocomplete="off" aria-label="Deine Verbesserung" ' +
          (s.eingabe === "zahl" ? 'inputmode="numeric" placeholder="neue Zahl"' :
           s.eingabe === "liste" ? 'inputmode="numeric" placeholder="z. B. 1, 2, …"' : 'placeholder="dein Wort"') + ">" +
          '<button type="button" class="lwp-ja lwp-pruefen">Prüfen</button></div>' +
        '<div class="lwp-knoepfe"><button type="button" class="lwp-leise lwp-stimmt">Stimmt doch so</button>' +
        '<button type="button" class="lwp-leise lwp-spaeter">Später</button></div>' +
        '<div class="lwp-meldung" aria-live="polite"></div>';
    }
    var meldung = d.querySelector(".lwp-meldung");
    function sag(text, art) { meldung.textContent = text; meldung.className = "lwp-meldung" + (art ? " lwp-" + art : ""); }
    function fertig(text) {
      d.classList.add("lwp-erledigt");
      Array.prototype.forEach.call(d.querySelectorAll("button,input"), function (x) { x.disabled = true; });
      sag(text, "gut");
      setTimeout(function () { d.remove(); weg(s.id, true); }, 1600);
    }
    function knoepfe(an) { Array.prototype.forEach.call(d.querySelectorAll("button,input"), function (x) { x.disabled = !an; }); }

    var spaeter = d.querySelector(".lwp-spaeter");
    spaeter.addEventListener("click", function () { d.remove(); weg(s.id, false); });

    var verbessert = d.querySelector(".lwp-verbessert");
    if (verbessert) verbessert.addEventListener("click", function () {
      knoepfe(false);
      senden(s.id, "verbessert").then(function (j) {
        if (!j || !j.ok) throw 0;
        fertig("Super, du hast es in deinem Heft verbessert!");
      }).catch(function () { knoepfe(true); sag("Das hat gerade nicht geklappt. Probier es gleich nochmal.", "fehler"); });
    });

    var pruefen = d.querySelector(".lwp-pruefen");
    if (pruefen) {
      var feld = d.querySelector("input");
      var los = function () {
        var a = feld.value.trim();
        if (!a) { sag("Schreib deine Verbesserung in das Feld.", ""); feld.focus(); return; }
        knoepfe(false);
        senden(s.id, "pruefen", a).then(function (j) {
          if (!j || !j.ok) throw 0;
          if (j.richtig) { fertig("✓ " + (j.satz || "Super, das stimmt jetzt!")); return; }
          knoepfe(true);
          if (j.tipp) d.querySelector(".lwp-tipptext").textContent = j.tipp;
          sag("Noch nicht ganz. Lies den Tipp und probier es nochmal.", "noch");
          feld.focus();
        }).catch(function () { knoepfe(true); sag("Das hat gerade nicht geklappt. Probier es gleich nochmal.", "fehler"); });
      };
      pruefen.addEventListener("click", los);
      feld.addEventListener("keydown", function (e) { if (e.key === "Enter") los(); });
      d.querySelector(".lwp-stimmt").addEventListener("click", function () {
        knoepfe(false);
        senden(s.id, "stimmt").then(function (j) {
          if (!j || !j.ok) throw 0;
          fertig("Okay! Ich zeige es deinen Eltern zum Nachsehen.");
        }).catch(function () { knoepfe(true); sag("Das hat gerade nicht geklappt. Probier es gleich nochmal.", "fehler"); });
      });
    }
    return d;
  }

  function saetze(stellen, blaetter) {
    var n = stellen.length;
    if (n === 1) return "In einem Blatt habe ich eine Stelle gefunden. Schau sie dir an!";
    return "In " + (blaetter === 1 ? "einem Blatt" : blaetter + " Blättern") + " habe ich Stellen gefunden. Schau sie dir an!";
  }

  /* ---------- Nach dem Hochladen ---------- */
  function hochladen(kasten, blattId) {
    if (!kasten || !blattId) return Promise.resolve(0);
    stilEinmal();
    return holen(blattId).then(function (j) {
      var st = j.stellen || [];
      if (!st.length) return 0;
      var box = document.createElement("section");
      box.className = "lwp lwp-hoch";
      box.setAttribute("data-blatt", blattId);
      box.innerHTML = '<div class="lwp-titel">🔍 Ich habe nachgesehen</div>' +
        '<div class="lwp-satz">' + (st.length === 1 ? "Eine Stelle möchte ich dir zeigen." : st.length + " Stellen möchte ich dir zeigen.") +
        " Du verbesserst selbst.</div>";
      var liste = document.createElement("div");
      liste.className = "lwp-liste";
      box.appendChild(liste);
      var offen = st.length, spaeter = 0;
      st.forEach(function (s) {
        liste.appendChild(karte(s, function (id, erledigt) {
          offen--; if (!erledigt) spaeter++;
          if (offen) return;
          box.innerHTML = '<div class="lwp-titel">🔍 Ich habe nachgesehen</div><div class="lwp-satz lwp-gut">' +
            (spaeter ? "Alles klar! Was noch offen ist, findest du oben auf deiner Startseite unter „Nachgesehen“."
                     : "Fertig! Du hast alles selbst nachgesehen. Toll gemacht!") + "</div>";
        }));
      });
      kasten.insertBefore(box, kasten.firstChild);
      try { box.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) {}
      return st.length;
    });
  }

  /* ---------- Knopf auf der Startseite ---------- */
  function startseite(knopf) {
    if (!knopf) return Promise.resolve(0);
    stilEinmal();
    var stellen = [];
    function zaehlen() {
      var bl = {};
      stellen.forEach(function (s) { bl[s.blatt && s.blatt.id] = 1; });
      return Object.keys(bl).length;
    }
    function malen() {
      if (!stellen.length) { knopf.classList.add("verborgen"); knopf.hidden = true; return; }
      knopf.hidden = false;
      knopf.classList.remove("verborgen");
      var z = knopf.querySelector(".lwp-zahl"); if (z) z.textContent = String(stellen.length);
      var t = knopf.querySelector(".cc-s"); if (t) t.textContent = saetze(stellen, zaehlen());
    }
    var ueber = null;
    function schliessen() { if (ueber) { ueber.remove(); ueber = null; document.documentElement.classList.remove("lwp-offen"); } malen(); }
    function oeffnen() {
      if (ueber) return;
      ueber = document.createElement("div");
      ueber.className = "lwp-ueber";
      ueber.setAttribute("role", "dialog");
      ueber.setAttribute("aria-label", "Nachgesehen");
      ueber.innerHTML = '<div class="lwp lwp-innen"><div class="lwp-oben">' +
        '<button type="button" class="lwp-leise lwp-zu">‹ Zurück</button>' +
        '<div class="lwp-titel">🔍 Nachgesehen</div></div>' +
        '<div class="lwp-satz">Hier sind Stellen aus deinen Blättern. Du verbesserst selbst.</div>' +
        '<div class="lwp-liste"></div></div>';
      document.body.appendChild(ueber);
      document.documentElement.classList.add("lwp-offen");
      ueber.querySelector(".lwp-zu").addEventListener("click", schliessen);
      var liste = ueber.querySelector(".lwp-liste");
      stellen.slice().forEach(function (s) {
        liste.appendChild(karte(s, function (id, erledigt) {
          if (erledigt) stellen = stellen.filter(function (x) { return x.id !== id; });
          malen();
          if (!liste.children.length) {
            liste.innerHTML = '<div class="lwp-satz lwp-gut">' +
              (stellen.length ? "Für heute reicht das. Der Rest wartet hier auf dich."
                              : "Fertig! Du hast alles selbst nachgesehen. Toll gemacht!") + "</div>";
            setTimeout(schliessen, 1800);
          }
        }));
      });
    }
    knopf.addEventListener("click", function (e) { e.preventDefault(); oeffnen(); });
    return holen(null).then(function (j) { stellen = j.stellen || []; malen(); return stellen.length; });
  }

  /* ---------- Aussehen: hell und dunkel (data-theme), Finger ab 44 px ---------- */
  function stilEinmal() {
    if (document.getElementById("lwp-stil")) return;
    var st = document.createElement("style");
    st.id = "lwp-stil";
    st.textContent = [
      ".lwp{--lwp-karte:#fff;--lwp-ink:#1b1c22;--lwp-neben:#4b5160;--lwp-linie:#dfe3ee;--lwp-blau:#1d4fae;--lwp-blaubg:#e8efff;",
      "--lwp-rot:#b42318;--lwp-rotbg:#fdecec;--lwp-gelb:#fff7ed;--lwp-gelblinie:#fed7aa;--lwp-gelbink:#7a4a12;--lwp-gruen:#0b6b43;--lwp-gruenbg:#e7f6ee;",
      "--lwp-leise:#eef1f7;color:var(--lwp-ink);font-family:ui-rounded,'SF Pro Rounded',-apple-system,system-ui,sans-serif;text-align:left}",
      "html[data-theme=\"dark\"] .lwp{--lwp-karte:#1d2030;--lwp-ink:#f1f2f7;--lwp-neben:#b9bfd3;--lwp-linie:#353a50;--lwp-blau:#a9c1ff;--lwp-blaubg:#1e2b4d;",
      "--lwp-rot:#ffb4ab;--lwp-rotbg:#3a1a1a;--lwp-gelb:#2c2414;--lwp-gelblinie:#6b4f1e;--lwp-gelbink:#fde7c2;--lwp-gruen:#8be0b4;--lwp-gruenbg:#12301f;--lwp-leise:#2a2e40}",
      ".lwp-hoch{background:var(--lwp-blaubg);border:2px solid var(--lwp-blau);border-radius:22px;padding:16px;margin:14px 0}",
      ".lwp-titel{font-weight:800;font-size:20px;margin:0 0 4px}",
      ".lwp-satz{font-size:16px;line-height:1.4;margin:0 0 12px;color:var(--lwp-ink)}",
      ".lwp-satz.lwp-gut{color:var(--lwp-gruen);font-weight:700}",
      ".lwp-karte{background:var(--lwp-karte);border:1px solid var(--lwp-linie);border-radius:20px;padding:16px;margin:0 0 12px;transition:opacity .3s}",
      ".lwp-karte.lwp-erledigt{opacity:.75}",
      ".lwp-kopf{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}",
      ".lwp-schild{font-size:14px;font-weight:700;border-radius:999px;padding:4px 10px}",
      ".lwp-s-rechnen{background:var(--lwp-blaubg);color:var(--lwp-blau)}",
      ".lwp-s-lehrerin{background:var(--lwp-rotbg);color:var(--lwp-rot)}",
      ".lwp-s-pinnwand{background:var(--lwp-gelb);color:var(--lwp-gelbink);border:1px solid var(--lwp-gelblinie)}",
      ".lwp-blatt{font-size:14px;color:var(--lwp-neben)}",
      ".lwp-aufgabe{font-size:22px;font-weight:800;margin:6px 0;overflow-wrap:anywhere}",
      ".lwp-du{font-size:17px;margin:6px 0;overflow-wrap:anywhere}",
      ".lwp-falsch{font-weight:700;text-decoration:underline wavy var(--lwp-rot);text-underline-offset:4px}",
      ".lwp-tipp{background:var(--lwp-gelb);border:1px solid var(--lwp-gelblinie);color:var(--lwp-gelbink);border-radius:14px;padding:10px 12px;margin:10px 0;font-size:16px;line-height:1.4}",
      ".lwp-lehrerin{background:var(--lwp-rotbg);border-left:5px solid var(--lwp-rot);border-radius:10px;padding:10px 12px;margin:8px 0;font-size:16px;line-height:1.4}",
      ".lwp-hinweis{font-size:16px;font-weight:600;margin:6px 0 0}",
      ".lwp-richtig{font-weight:800}",
      ".lwp-rotliste{margin:6px 0 0;padding-left:20px;font-weight:700}",
      ".lwp-rotliste li{margin:3px 0}",
      ".lwp-feld{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px}",
      ".lwp-feld input{flex:1 1 160px;min-width:0;max-width:340px;font-family:inherit;font-weight:600;font-size:20px;padding:10px 12px;min-height:48px;border-radius:12px;",
      "border:2px solid var(--lwp-linie);background:var(--lwp-karte);color:var(--lwp-ink);box-sizing:border-box}",
      ".lwp-knoepfe{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}",
      ".lwp button{appearance:none;font-family:inherit;font-weight:700;font-size:16px;border-radius:14px;padding:10px 16px;min-height:48px;min-width:48px;border:0;cursor:pointer}",
      ".lwp .lwp-ja{background:#1d4fae;color:#fff}",
      "html[data-theme=\"dark\"] .lwp .lwp-ja{background:#a9c1ff;color:#10142a}",
      ".lwp .lwp-leise{background:var(--lwp-leise);color:var(--lwp-ink)}",
      ".lwp button[disabled],.lwp input[disabled]{opacity:.6;cursor:default}",
      ".lwp-meldung{font-size:16px;margin-top:8px;min-height:0}",
      ".lwp-meldung.lwp-gut{background:var(--lwp-gruenbg);color:var(--lwp-gruen);border-radius:12px;padding:10px 12px;font-weight:700}",
      ".lwp-meldung.lwp-noch{color:var(--lwp-ink);font-weight:600}",
      ".lwp-meldung.lwp-fehler{color:var(--lwp-rot)}",
      ".lwp-ueber{position:fixed;inset:0;z-index:9000;overflow-y:auto;-webkit-overflow-scrolling:touch;background:rgba(10,12,24,.55);padding:16px 12px 40px;box-sizing:border-box}",
      ".lwp-innen{max-width:640px;margin:0 auto;background:var(--lwp-blaubg);border-radius:24px;padding:16px;box-sizing:border-box}",
      "html[data-theme=\"dark\"] .lwp-innen{background:#151a2c}",
      ".lwp-oben{display:flex;align-items:center;gap:12px;margin-bottom:6px}",
      ".lwp-oben .lwp-titel{margin:0}",
      "html.lwp-offen{overflow:hidden}"
    ].join("");
    (document.head || document.documentElement).appendChild(st);
  }

  window.LWPruef = { hochladen: hochladen, startseite: startseite, holen: holen };
})();
