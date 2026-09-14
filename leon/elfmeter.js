/* Das Elfmeter-Spiel als gemeinsame Maschine (14.09.2026).
 *
 * Leon nach "Leon haelt den Elfer": "Sehr viel Spass! Kannst du so eins auch
 * fuer Deutsch und eins fuer HSU machen?" Statt die Seite zweimal zu kopieren
 * (bei Helenas Trainern standen danach 96 % doppelt da, und ein Fehler steckte
 * nur in einer Kopie), liegt die Maschine hier. Jede Seite bringt nur mit, was
 * gefragt wird:
 *
 *   window.ELFMETER = {
 *     speicher:  "leon-elfmeter-deutsch",   // localStorage, beginnt mit "leon-"
 *     titel, einleitung, stufen: [{ id, gross, name, klein, jetzt }],
 *     aufgaben(stufeId, anzahl) -> [ { text, bild?, sprechen, ecken:[3], r, merkmal,
 *                                      erklaerung(gewaehlt) -> html, diagnose(gewaehlt) -> text } ],
 *     vorlesenVonSelbst: true               // bei Deutsch/HSU: Frage sofort vorlesen
 *   }
 *
 * Bewusst OHNE Zeitdruck (Bauregeln). Der Ball fliegt erst, wenn Leon sich
 * entschieden hat; daneben ist kein Versagen - der Elfer kommt in der
 * Nachspielzeit wieder.
 */
(function(){
  "use strict";
  var K = window.ELFMETER;
  if (!K) return;
  var $ = function(id){ return document.getElementById(id); };
  function esc(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }

  /* ---------- Geruest ---------- */
  var app = $("elfmeter");
  app.className = "huelle";
  app.innerHTML =
    '<header><a class="zurueck" href="/leon/#anfassen">‹ Leons Spiele</a><h1>' + esc(K.titel) + '</h1><div class="punkte verborgen" id="punkte">🧤 0</div></header>' +
    '<section class="karte start" id="sicht-start">' +
      '<div style="text-align:center;font-size:54px">' + (K.startbild || "🧤⚽") + '</div>' +
      '<h2>Du stehst im Tor!</h2><p>' + esc(K.einleitung) + '</p>' +
      '<div class="stufen" id="stufen"></div><div class="rueckblick verborgen" id="rueckblick"></div>' +
    '</section>' +
    '<section class="verborgen" id="sicht-spiel">' +
      '<div class="feld" id="feld">' +
        '<div class="tor" id="tor">' +
          '<button class="ecke" data-ecke="0"><span></span></button><button class="ecke" data-ecke="1"><span></span></button><button class="ecke" data-ecke="2"><span></span></button>' +
        '</div>' +
        '<div class="linie"></div><div class="strafraum"></div>' +
        '<div class="keeper" id="keeper"><div class="name">Leon</div><div class="arm l"></div><div class="arm r"></div>' +
          '<div class="hand l">🧤</div><div class="hand r">🧤</div><div class="kopf"></div><div class="koerper">1</div>' +
          '<div class="bein l"></div><div class="bein r"></div></div>' +
        '<div class="aufgabe" id="aufgabe"></div><div class="ball" id="ball">⚽</div>' +
        '<div class="schuetze"><span class="figur">🏃</span><span class="wer" id="schuetze"></span></div>' +
        '<button class="vorlesen" id="vorlesen" aria-label="Vorlesen">🔊</button><div class="ruf" id="ruf"></div>' +
      '</div>' +
      '<div class="leiste"><div class="baelle" id="baelle"></div><span class="nachspiel verborgen" id="nachspiel"></span></div>' +
      '<div class="karte rueck verborgen" id="rueck"></div>' +
    '</section>' +
    '<section class="karte ende verborgen" id="sicht-ende">' +
      '<div class="gross">🏆</div><h2 id="ende-titel"></h2><p id="ende-text"></p>' +
      '<button class="weiter" id="nochmal">Nochmal ins Tor</button>' +
      '<button class="knopf2" id="andere">' + esc(K.andereText || "Andere Stufe wählen") + '</button>' +
      '<a class="knopf2" href="/leon/#anfassen">Zurück zu Leons Spielen</a>' +
    '</section>';
  var leinwand = document.createElement("canvas"); leinwand.className = "konfetti"; leinwand.id = "konfetti";
  document.body.appendChild(leinwand);

  $("stufen").innerHTML = K.stufen.map(function(s){
    return '<button class="stufe' + (s.jetzt ? " jetzt" : "") + '" data-stufe="' + esc(s.id) + '"><span class="gross">' + s.gross + '</span>' +
      esc(s.name) + '<span class="klein">' + esc(s.klein || "") + '</span></button>';
  }).join("");

  /* ---------- Speicher: nur Rueckschau ---------- */
  function lesen(){ try { return JSON.parse(localStorage.getItem(K.speicher) || "{}") || {}; } catch(e){ return {}; } }
  function schreiben(d){ try { localStorage.setItem(K.speicher, JSON.stringify(d)); } catch(e){} }
  function rueckblickMalen(){
    var d = lesen();
    if (d.gehalten){ $("rueckblick").textContent = "🧤 Du hast schon " + d.gehalten + " Elfer gehalten."; $("rueckblick").classList.remove("verborgen"); }
  }
  rueckblickMalen();

  function mische(f){ for (var i = f.length - 1; i > 0; i--){ var j = Math.floor(Math.random()*(i+1)); var t=f[i]; f[i]=f[j]; f[j]=t; } return f; }

  /* ---------- Vorlesen ---------- */
  var kannSprechen = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
  function sprich(t){
    if (!kannSprechen || document.hidden || !t) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(t); u.lang = "de-DE"; u.rate = .9;
      var st = (window.speechSynthesis.getVoices() || []).filter(function(v){ return /^de/i.test(v.lang); })[0];
      if (st) u.voice = st;
      window.speechSynthesis.speak(u);
    } catch(e){}
  }
  if (!kannSprechen) $("vorlesen").classList.add("verborgen");
  document.addEventListener("visibilitychange", function(){ if (document.hidden && kannSprechen) try { speechSynthesis.cancel(); } catch(e){} });

  /* ---------- Ablauf ---------- */
  var RUNDE = K.runde || 10;
  var SCHUETZEN = ["Paul", "Xaver", "Helena"];
  var stufe = K.stufen[0].id, liste = [], pos = 0, gehalten = 0, aufgeholt = 0, verpasst = [], nachspielzeit = false, ergebnis = [], gesperrt = false;

  function zeige(welche){
    ["start", "spiel", "ende"].forEach(function(n){ $("sicht-" + n).classList.toggle("verborgen", n !== welche); });
    $("punkte").classList.toggle("verborgen", welche !== "spiel");
    window.scrollTo(0, 0);
  }

  Array.prototype.forEach.call(document.querySelectorAll(".stufe"), function(k){
    k.addEventListener("click", function(){
      var id = k.getAttribute("data-stufe");
      stufe = /^\d+$/.test(id) ? +id : id;
      rundeStarten();
    });
  });

  function rundeStarten(){
    liste = K.aufgaben(stufe, RUNDE);
    RUNDE = liste.length;
    pos = 0; gehalten = 0; aufgeholt = 0; verpasst = []; nachspielzeit = false;
    ergebnis = liste.map(function(){ return ""; });
    $("nachspiel").classList.add("verborgen");
    zeige("spiel");
    elfer();
  }

  function baelleMalen(){
    $("baelle").innerHTML = liste.map(function(_, i){
      var k = nachspielzeit ? "g" : (ergebnis[i] || "");
      if (!nachspielzeit && i === pos) k += " n";
      return '<i class="' + k + '"></i>';
    }).join("");
    $("punkte").textContent = "🧤 " + (gehalten + aufgeholt);
  }

  function elfer(){
    var auf = liste[pos];
    gesperrt = false;
    var chip = $("aufgabe");
    chip.innerHTML = (auf.frage ? '<small>' + esc(auf.frage) + '</small>' : "") +
      (auf.bild ? '<span class="bildchen">' + auf.bild + '</span>' : "") + esc(auf.text || "");
    chip.classList.toggle("lang", String(auf.text || "").length > 12);
    $("schuetze").textContent = SCHUETZEN[pos % SCHUETZEN.length] + " schießt";
    $("keeper").style.transform = "";
    $("ball").style.transform = "";
    chip.style.opacity = "1";
    $("ruf").className = "ruf";
    $("rueck").classList.add("verborgen");
    var woerter = auf.ecken.some(function(e){ return String(e).length > 3; });
    $("tor").classList.toggle("woerter", woerter);
    Array.prototype.forEach.call(document.querySelectorAll(".ecke"), function(e, i){
      e.disabled = false; e.className = "ecke";
      e.querySelector("span").textContent = auf.ecken[i];
      e.setAttribute("aria-label", "Ecke mit " + auf.ecken[i]);
    });
    baelleMalen();
    if (K.vorlesenVonSelbst) setTimeout(function(){ sprich(auf.sprechen); }, 250);
  }

  $("vorlesen").addEventListener("click", function(){
    var auf = liste[pos]; if (!auf) return;
    sprich(auf.sprechen + ". " + auf.ecken.join(", oder ") + "?");
  });

  Array.prototype.forEach.call(document.querySelectorAll(".ecke"), function(e){
    e.addEventListener("click", function(){ if (!gesperrt) schuss(+e.getAttribute("data-ecke")); });
  });

  function mitte(el, bezug){
    var r = el.getBoundingClientRect(), b = bezug.getBoundingClientRect();
    return { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top };
  }

  function schuss(ecke){
    gesperrt = true;
    var auf = liste[pos];
    var ziel = auf.ecken.indexOf(auf.r);
    var stimmt = ecke === ziel;
    var feld = $("feld"), ecken = document.querySelectorAll(".ecke");
    Array.prototype.forEach.call(ecken, function(x){ x.disabled = true; });

    var kp = mitte($("keeper"), feld), zielEcke = mitte(ecken[ecke], feld);
    var dx = zielEcke.x - kp.x, dreh = ecke === 1 ? 0 : (ecke === 0 ? -55 : 55);
    $("keeper").style.transform = "translate(" + dx + "px," + (ecke === 1 ? -10 : 18) + "px) rotate(" + dreh + "deg)";

    var bp = mitte($("ball"), feld), zb = mitte(ecken[ziel], feld);
    $("aufgabe").style.opacity = "0";
    setTimeout(function(){
      $("ball").style.transform = "translate(" + (zb.x - bp.x) + "px," + (zb.y - bp.y + 30) + "px) scale(.62)";
    }, 120);

    setTimeout(function(){
      ecken[ziel].classList.add("richtig");
      if (!stimmt){ ecken[ecke].classList.add("falsch"); $("tor").classList.add("wackelt"); setTimeout(function(){ $("tor").classList.remove("wackelt"); }, 500); }
      $("ruf").textContent = stimmt ? "Gehalten! 🧤" : "Tor für " + SCHUETZEN[pos % SCHUETZEN.length];
      $("ruf").classList.add("zeigen");
      if (stimmt) konfetti(false);
      auswerten(auf, stimmt, auf.ecken[ecke]);
    }, 650);
  }

  function auswerten(auf, stimmt, gewaehlt){
    try { window.lernstand && window.lernstand.antwort(stimmt, auf.merkmal, gewaehlt, auf.r); } catch(e){}
    if (nachspielzeit){ if (stimmt) aufgeholt++; }
    else { ergebnis[pos] = stimmt ? "g" : "t"; if (stimmt) gehalten++; else verpasst.push(auf); }
    baelleMalen();
    var h = "";
    if (stimmt){
      h += '<p class="satz gut">' + (nachspielzeit ? "Jetzt sitzt es!" : "Stark gehalten!") + '</p>';
    } else {
      var d = auf.diagnose ? auf.diagnose(gewaehlt) : "";
      h += '<p class="satz schlecht">Der war schwer. Richtig ist: ' + esc(auf.r) + '</p>';
      if (d) h += '<div class="diagnose">' + esc(d) + '</div>';
    }
    h += auf.erklaerung ? auf.erklaerung(gewaehlt, stimmt) : "";
    if (!stimmt && !nachspielzeit) h += '<div class="weg">Den Elfer bekommst du in der Nachspielzeit nochmal.</div>';
    h += '<button class="weiter" id="weiter">Nächster Elfer ›</button>';
    var r = $("rueck");
    r.innerHTML = h;
    r.classList.remove("verborgen");
    $("weiter").addEventListener("click", weiter);
    if (K.vorlesenVonSelbst && !stimmt && auf.sprechenLoesung) sprich(auf.sprechenLoesung);
    setTimeout(function(){ try { r.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch(e){} }, 200);
  }

  function weiter(){
    pos++;
    if (pos < liste.length){ elfer(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (!nachspielzeit && verpasst.length){
      nachspielzeit = true;
      liste = mische(verpasst.map(function(a){ a.ecken = mische(a.ecken.slice()); return a; }));
      pos = 0;
      $("nachspiel").textContent = "⏱️ Nachspielzeit · " + (liste.length === 1 ? "ein Elfer" : liste.length + " Elfer") + " nochmal";
      $("nachspiel").classList.remove("verborgen");
      elfer(); window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    ende();
  }

  function ende(){
    var alle = gehalten + aufgeholt;
    var d = lesen();
    d.gehalten = (d.gehalten || 0) + alle;
    d.runden = (d.runden || 0) + 1;
    schreiben(d);
    $("ende-titel").textContent = alle + " von " + RUNDE + " Elfern gehalten";
    $("ende-text").textContent = alle === RUNDE && !aufgeholt
      ? "Alle gehalten – und das beim ersten Sprung. Was für ein Torwart!"
      : alle === RUNDE
        ? "Am Ende alle gehalten – " + (aufgeholt === 1 ? "einer" : aufgeholt) + " davon in der Nachspielzeit. Genau so wird man besser: dranbleiben."
        : aufgeholt
          ? "In der Nachspielzeit hast du noch " + aufgeholt + " gehalten. Weiter so!"
          : "Gut gekämpft. Spiel gleich nochmal – beim zweiten Mal sitzt es schon besser.";
    zeige("ende");
    rueckblickMalen();
    konfetti(true);
  }

  $("nochmal").addEventListener("click", rundeStarten);
  $("andere").addEventListener("click", function(){ zeige("start"); });

  /* ---------- Konfetti ---------- */
  var fl = leinwand, st = fl.getContext("2d"), teile = [], laeuft = false;
  function konfetti(gross){
    fl.width = innerWidth; fl.height = innerHeight;
    for (var i = 0; i < (gross ? 120 : 30); i++) teile.push({ x: Math.random()*fl.width, y: -20 - Math.random()*100, b: 6+Math.random()*6, h: 8+Math.random()*8,
      v: 2.4+Math.random()*3, d: Math.random()*6, t: (Math.random()-.5)*.3, f: ["#10b981","#16a34a","#ffffff","#f79009","#3b82f6"][i%5] });
    if (!laeuft){ laeuft = true; requestAnimationFrame(male); }
  }
  function male(){
    st.clearRect(0, 0, fl.width, fl.height);
    teile = teile.filter(function(s){ return s.y < fl.height + 30; });
    teile.forEach(function(s){ s.y += s.v; s.d += s.t; st.save(); st.translate(s.x, s.y); st.rotate(s.d); st.fillStyle = s.f; st.fillRect(-s.b/2, -s.h/2, s.b, s.h); st.restore(); });
    if (teile.length) requestAnimationFrame(male); else { laeuft = false; st.clearRect(0, 0, fl.width, fl.height); }
  }

  // Zum Nachpruefen ohne Klicken (Messung, Tests). Name bleibt __elfer, damit
  // mess-schritte-leon-anfassen.js fuer alle drei Seiten gilt.
  window.__elfer = {
    aufgabeBauen: function(s, nr){ return K.aufgabe ? K.aufgabe(s, nr) : K.aufgaben(s, nr + 1)[nr]; },
    aufgaben: function(s, n){ return K.aufgaben(s, n); },
    starten: function(s){ stufe = s; rundeStarten(); },
    schuss: function(e){ schuss(e); },
    zustand: function(){ return { pos: pos, liste: liste, nachspielzeit: nachspielzeit, gehalten: gehalten }; }
  };
})();
