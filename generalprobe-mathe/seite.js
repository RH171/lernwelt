/* Generalprobe Mathe – Anzeige (13.10.2026, Kapitel 122). Logik: /generalprobe-mathe/motor.js.
 *
 * Ablauf: Start · 7 Teile (Zurueck/Weiter, keine Sofort-Korrektur) · "Fertig – nachsehen" ·
 * Rueckschau je Thema ohne Note und ohne Punkte, je falscher Aufgabe zweiter Versuch mit
 * Hilfe in Stufen (Stufe 1 sofort, Stufe 2 nach dem naechsten Fehlversuch, danach der Rechenweg).
 * Gezaehlt wird nur der erste Versuch: lernstand.antwort einmal je Aufgabe beim Nachsehen.
 * Stand: sessionStorage "paul-gp-mathe-lauf" (6 Stunden, kein Sync, kein KV-Schreibvorgang).
 * Kein Rot, keine Uhr, keine Warum-Frage, kein Begruendungswort.
 */
(function () {
  "use strict";
  var M = window.GPMMotor;
  var LAUF = "paul-gp-mathe-lauf", HALTBAR = 6 * 3600 * 1000;
  var stand = null, blatt = null, teile = null;

  function $(id) { return document.getElementById(id); }
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function zeige(id) { ["start", "arbeit", "rueck"].forEach(function (x) { $(x).classList.toggle("verborgen", x !== id); }); window.scrollTo(0, 0); }

  function sichern() { try { stand.zeit = Date.now(); sessionStorage.setItem(LAUF, JSON.stringify(stand)); } catch (e) {} }
  function holen() {
    try {
      var d = JSON.parse(sessionStorage.getItem(LAUF) || "null");
      if (d && typeof d.saat === "number" && Date.now() - (d.zeit || 0) < HALTBAR) return d;
    } catch (e) {}
    return null;
  }
  function aufbauen() { blatt = M.blatt(stand.saat); teile = M.teileVon(blatt); }
  function neu() {
    stand = { saat: M.neueSaat(), teil: 0, phase: "arbeit", ein: {}, erg: null, zweit: {}, gemeldet: false };
    aufbauen(); sichern(); teilZeigen();
  }

  /* ---------- Arbeit ---------- */
  function feldHtml(a, f, wert, extra) {
    return (f.vor ? '<span>' + esc(f.vor) + '</span>' : '') +
      '<input class="zahl' + (f.name === "r" ? " rest" : "") + '" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" ' +
      'enterkeyhint="next" maxlength="5" placeholder=" " aria-label="' + esc((a.text || "") + (f.name === "r" ? " Rest" : "")) + '" ' +
      'data-a="' + a.id + '" data-f="' + f.name + '" value="' + esc(wert == null ? "" : wert) + '"' + (extra || "") + '>' +
      (f.nach ? '<span>' + esc(f.nach) + '</span>' : '');
  }
  function aufgabeHtml(a, ein, ohneText) {
    ein = ein || {};
    var h = "";
    if (a.art === "teiler") {
      var gew = Array.isArray(ein.t) ? ein.t : [];
      h += '<div class="rechnung">' + esc(a.felder[0].vor) + '</div><div class="teilerwahl" role="group" aria-label="' + esc(a.text) + '">';
      for (var i = 1; i <= a.klein.bis; i++)
        h += '<button class="knopf" type="button" data-a="' + a.id + '" data-teiler="' + i + '" aria-pressed="' + (gew.indexOf(i) >= 0) + '">' + i + '</button>';
      return h + '</div>';
    }
    if (a.sach) {
      if (!ohneText) h += '<p class="sachtext">' + esc(a.text) + '</p>';
      a.felder.forEach(function (f) { h += '<div class="antwortzeile">' + feldHtml(a, f, ein[f.name]) + '</div>'; });
      return h;
    }
    if (a.art === "rest") {
      return '<div class="rechnung">' + feldHtml(a, a.felder[0], ein.e) + feldHtml(a, a.felder[1], ein.r) + '</div>';
    }
    return '<div class="rechnung">' + feldHtml(a, a.felder[0], ein.e) + '</div>';
  }
  function teilZeigen() {
    stand.phase = "arbeit";
    var t = teile[stand.teil], n = teile.length;
    $("zaehler").textContent = "Teil " + (stand.teil + 1) + " von " + n;
    $("balken").innerHTML = teile.map(function (x, i) { return '<span class="' + (i < stand.teil ? "fertig" : i === stand.teil ? "jetzt" : "") + '"></span>'; }).join("");
    $("teil-titel").textContent = (stand.teil + 1) + ". " + t.name;
    $("teil-auftrag").textContent = t.auftrag;
    $("teil-aufgaben").innerHTML = t.aufgaben.map(function (a) {
      return '<div class="aufg" id="aufg-' + a.id + '"><div class="bu">' + a.buchstabe + ')</div><div class="inhalt">' + aufgabeHtml(a, stand.ein[a.id]) + '</div></div>';
    }).join("");
    // Schmierblatt (14.10.2026): In der echten Probe rechnet Paul Nebenrechnungen auf dem Blatt.
    // Hier eine freie Fläche dafür, ohne Zerlegung und ohne Prüfen, in Teilen ohne „Mein Rechenweg“.
    // Bei „Teiler antippen“ nicht nötig.
    // „✏️ Mein Rechenweg“ (14.10.2026) bei jeder Aufgabe mit zwei oder mehr Rechenschritten (schritte ≥ 2).
    // Wie in der Probe: keine Haken, kein „schau noch mal“, keine Vorgabe (pruefen:false).
    var mitWeg = 0;
    if (window.MeinWeg) t.aufgaben.forEach(function (a) {
      if ((a.schritte || 1) < 2 && window.MeinWeg.schritte(a.text) < 2) return;
      var box = $("aufg-" + a.id), inh = box && box.querySelector(".inhalt"); if (!inh) return;
      var h = document.createElement("div"); h.id = "mw-" + a.id; inh.appendChild(h); mitWeg++;
      window.MeinWeg.malen(h, { pruefen: false, uebernehmen: function (z) {
        var fs = [].slice.call(box.querySelectorAll("input.zahl")), f = fs.filter(function (i) { return !i.value; })[0] || fs[0];
        if (!f) return; f.value = z; f.dispatchEvent(new Event("input", { bubbles: true }));
      } });
    });
    var sb = $("schmier");
    if (sb) { if (window.Schmierblatt && t.key !== "teiler" && !mitWeg) { sb.classList.remove("verborgen"); window.Schmierblatt.malen(sb); } else { sb.innerHTML = ""; sb.classList.add("verborgen"); } }
    $("leerhinweis").classList.add("verborgen");
    $("zurueck").disabled = stand.teil === 0;
    $("weiter").textContent = stand.teil === n - 1 ? "Fertig – nachsehen ✓" : "Weiter →";
    zeige("arbeit"); sichern();
  }
  function eingabe(e) {
    var el = e.target; if (!el.matches || !el.matches("#teil-aufgaben input.zahl")) return;
    var rein = el.value.replace(/[^\d]/g, ""); if (rein !== el.value) el.value = rein;
    var id = el.getAttribute("data-a"); stand.ein[id] = stand.ein[id] || {};
    stand.ein[id][el.getAttribute("data-f")] = el.value; sichern();
  }
  function taste(e) {
    var el = e.target; if (e["key"] !== "Enter" || !el.matches || !el.matches("input.zahl")) return;
    e.preventDefault();
    var alle = Array.prototype.slice.call(el.closest("section").querySelectorAll("input.zahl"));
    var i = alle.indexOf(el); if (i >= 0 && i < alle.length - 1) alle[i + 1].focus(); else el.blur();
  }
  function teilerTippen(e) {
    var b = e.target.closest && e.target.closest("#teil-aufgaben [data-teiler]"); if (!b) return;
    var id = b.getAttribute("data-a"), z = +b.getAttribute("data-teiler");
    stand.ein[id] = stand.ein[id] || {}; var l = Array.isArray(stand.ein[id].t) ? stand.ein[id].t : [];
    var i = l.indexOf(z); if (i >= 0) l.splice(i, 1); else l.push(z);
    stand.ein[id].t = l; b.setAttribute("aria-pressed", String(i < 0)); sichern();
  }
  function leereAufgaben() { return blatt.aufgaben.filter(function (a) { return M.leer(a, stand.ein[a.id]); }); }
  function weiter() {
    if (stand.teil < teile.length - 1) { stand.teil++; teilZeigen(); return; }
    var leer = leereAufgaben();
    if (leer.length && $("leerhinweis").classList.contains("verborgen")) {
      $("leer-satz").textContent = leer.length === 1 ? "Eine Aufgabe ist noch leer. Magst du sie noch rechnen?"
        : leer.length + " Aufgaben sind noch leer. Magst du sie noch rechnen?";
      $("leerhinweis").classList.remove("verborgen");
      $("leerhinweis").scrollIntoView({ block: "nearest" });
      return;
    }
    nachsehen();
  }
  function zuLeer() {
    var leer = leereAufgaben(); if (!leer.length) return nachsehen();
    stand.teil = teile.findIndex(function (t) { return t.key === leer[0].thema; });
    teilZeigen();
    var box = $("aufg-" + leer[0].id); if (box) { box.classList.add("leer-mark"); var f = box.querySelector("input.zahl:placeholder-shown"); if (f) f.focus(); box.scrollIntoView({ block: "center" }); }
  }

  /* ---------- Nachsehen und Rueckschau ---------- */
  function antwortText(a, ein) {
    ein = ein || {};
    if (a.art === "teiler") return Array.isArray(ein.t) && ein.t.length ? ein.t.slice().sort(function (x, y) { return x - y; }).join(", ") : "–";
    if (a.art === "rest") return (ein.e || "–") + " R " + (ein.r || "–");
    return ein.e || "–";
  }
  function loesungText(a) {
    if (a.art === "teiler") return a.loesung.t.join(", ");
    if (a.art === "rest") return a.loesung.e + " R " + a.loesung.r;
    return String(a.loesung.e);
  }
  function nachsehen() {
    stand.erg = {};
    blatt.aufgaben.forEach(function (a) { stand.erg[a.id] = M.pruefe(a, stand.ein[a.id]); });
    stand.phase = "rueck";
    if (!stand.gemeldet) {
      stand.gemeldet = true;
      blatt.aufgaben.forEach(function (a) {
        var r = stand.erg[a.id];
        try { if (window.lernstand && typeof lernstand.antwort === "function")
          lernstand.antwort(r.stimmt, M.THEMA[a.thema].merkmal, antwortText(a, stand.ein[a.id]), loesungText(a), "gpm:" + a.id); } catch (e) {}
      });
    }
    sichern(); rueckZeigen();
  }
  function nochmalHtml(a) {
    var z = stand.zweit[a.id] || { stufe: 1, ein: {}, fertig: false, stimmt: false };
    stand.zweit[a.id] = z;
    var t = '<div class="nochmal' + (z.stimmt ? " geschafft" : "") + '" id="nm-' + a.id + '">' +
      (a.sach ? "" : '<div style="font-weight:700">' + a.buchstabe + ') ' + esc(a.text) + '</div>') +
      '<div class="vorher">Deine Antwort: ' + esc(antwortText(a, stand.ein[a.id])) + '</div>';
    if (z.stimmt) return t + '<p class="gut">Richtig! Gut, dass du drangeblieben bist.</p></div>';
    if (z.fertig) return t + '<div class="weg"><b>So geht es:</b> ' + esc(a.weg) + '</div></div>';
    var df = z.df || (stand.erg[a.id] && stand.erg[a.id].denkfehler);
    t += (df ? '<p class="df">' + esc(df) + '</p>' : '') +
      '<div class="tipp"><b>Hilfe ' + z.stufe + '</b>' + esc(M.hilfe(a, z.stufe)) + '</div>' +
      '<div style="margin-top:10px">' + aufgabeHtml(a, z.ein, true).replace(/data-a="/g, 'data-zweit="1" data-a="') + '</div>' +
      '<div class="leiste"><button class="knopf voll" data-pruefen="' + a.id + '">Prüfen</button></div>';
    return t + '</div>';
  }
  function rueckZeigen() {
    var r = M.rueckschau(blatt, stand.erg);
    var sitzt = r.filter(function (x) { return x.sitzt; }), schau = r.filter(function (x) { return !x.sitzt; });
    $("rueck-titel").textContent = "✓ Geschafft – du hast das ganze Blatt bearbeitet!";
    $("rueck-lob").textContent = schau.length ? "Stark, dass du alle 7 Teile durchgerechnet hast. Jetzt schauen wir genau hin."
      : "Alle 7 Teile sitzen. Du hast sorgfältig gerechnet – genau so geht es in der Probe.";
    $("sitzt-block").classList.toggle("verborgen", !sitzt.length);
    $("sitzt").innerHTML = sitzt.map(function (x) { return "<li>✓ " + esc(x.name) + "</li>"; }).join("");
    $("anschauen-block").classList.toggle("verborgen", !schau.length);
    $("anschauen").innerHTML = schau.map(function (x) {
      var auf = blatt.aufgaben.filter(function (a) { return x.falsch.indexOf(a.id) >= 0; });
      return '<div class="schau"><h3>' + esc(x.name) + '</h3>' + auf.map(function (a) {
        return (a.sach ? '<p class="sachtext" style="margin:8px 0 0">' + a.buchstabe + ') ' + esc(a.text) + '</p>' : '') + nochmalHtml(a);
      }).join("") + '</div>';
    }).join("");
    zeige("rueck");
  }
  function zweitEingabe(e) {
    var el = e.target; if (!el.matches || !el.matches("#anschauen input.zahl")) return;
    var rein = el.value.replace(/[^\d]/g, ""); if (rein !== el.value) el.value = rein;
    var z = stand.zweit[el.getAttribute("data-a")]; if (!z) return;
    z.ein[el.getAttribute("data-f")] = el.value; sichern();
  }
  function zweitKlick(e) {
    var tb = e.target.closest && e.target.closest("#anschauen [data-teiler]");
    if (tb) {
      var z0 = stand.zweit[tb.getAttribute("data-a")], n0 = +tb.getAttribute("data-teiler"), l = Array.isArray(z0.ein.t) ? z0.ein.t : [];
      var i = l.indexOf(n0); if (i >= 0) l.splice(i, 1); else l.push(n0); z0.ein.t = l;
      tb.setAttribute("aria-pressed", String(i < 0)); sichern(); return;
    }
    var pb = e.target.closest && e.target.closest("#anschauen [data-pruefen]"); if (!pb) return;
    var id = pb.getAttribute("data-pruefen"), a = blatt.aufgaben.filter(function (x) { return x.id === id; })[0], z = stand.zweit[id];
    var r = M.pruefe(a, z.ein);
    if (r.leer) { z.df = "Trag erst etwas ein, dann prüfen wir."; }
    else if (r.stimmt) { z.stimmt = true; z.fertig = true; }
    else if (z.stufe < 2) { z.stufe = 2; z.df = r.denkfehler; z.ein = {}; }
    else { z.fertig = true; }
    sichern();
    var box = $("nm-" + id), neuBox = document.createElement("div"); neuBox.innerHTML = nochmalHtml(a);
    box.parentNode.replaceChild(neuBox.firstChild, box);
    var nb = $("nm-" + id); if (nb) { var f = nb.querySelector("input.zahl"); if (f && !z.fertig) f.focus({ preventScroll: true }); nb.scrollIntoView({ block: "nearest" }); }
    tipptPflegen();
  }

  /* ---------- Start ---------- */
  function start() {
    var alt = holen();
    if (alt) {
      stand = alt; aufbauen();
      if (/[?&]los=1/.test(location.search) && alt.phase === "rueck") { neu(); return; }
      if (alt.phase === "rueck" && alt.erg) { rueckZeigen(); return; }
      if (/[?&]los=1/.test(location.search)) { teilZeigen(); return; }
      $("weiter-lauf").classList.remove("verborgen");
      $("los").textContent = "▶ Neues Blatt";
      $("start-info").textContent = "Du warst bei Teil " + (alt.teil + 1) + " von 7.";
    } else if (/[?&]los=1/.test(location.search)) { neu(); return; }
    zeige("start");
  }

  document.addEventListener("input", function (e) { eingabe(e); zweitEingabe(e); });
  document.addEventListener("keydown", taste);
  function tipptPflegen() { var a = document.activeElement; document.body.classList.toggle("tippt", !!(a && a.matches && a.matches("#anschauen input.zahl"))); }
  document.addEventListener("focusin", tipptPflegen);
  document.addEventListener("focusout", function () { setTimeout(tipptPflegen, 0); });
  document.addEventListener("click", function (e) { teilerTippen(e); zweitKlick(e); });
  $("los").addEventListener("click", neu);
  $("weiter-lauf").addEventListener("click", function () { teilZeigen(); });
  $("weiter").addEventListener("click", weiter);
  $("zurueck").addEventListener("click", function () { if (stand.teil > 0) { stand.teil--; teilZeigen(); } });
  $("zu-leer").addEventListener("click", zuLeer);
  $("trotzdem").addEventListener("click", nachsehen);
  $("neu").addEventListener("click", neu);

  window.__gpmathe = { stand: function () { return stand; }, blatt: function () { return blatt; }, neu: neu, nachsehen: nachsehen, M: M };
  start();
})();
