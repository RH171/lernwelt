/* Vokabeltrainer fuer Helena - die gemeinsame Maschine hinter Englisch und
   Franzoesisch. Beide Seiten laden diese Datei; was sich unterscheidet, steht
   in window.HELENA_KONFIG. Vorher standen 618 von 642 Zeilen doppelt im Repo -
   jede Aenderung musste zweimal gemacht werden, und beim Kopieren war der
   franzoesischen Seite eine englische Sprachausgabe untergeschoben worden.

   Erwartet in HELENA_KONFIG:
     praefix        Praefix aller localStorage-Schluessel ("helena-vok")
     sprache        "Englisch"      spracheAdj  "englische"
     spracheKlein   "englisch"      (Platzhalter im Foto-Editor)
     stimmeVorwahl  "en"   stimmeBevorzugt "en-gb"   stimmeRueckfall "en-GB"
     gruppen        [{stufe, titel}, ...] fuer die Auswahlliste
     fortschritt    Schluessel fuer die Kachel im Hub
     spielId/titel/fach   fuer die Statistik
     units          die Wortlisten

   OBERFLAECHE AUF DER VOKABEL-LOGIK (19.10.2026, Denny ~22:50 Uhr, Klickfrage
   "Heute umbauen"; Logik: /vokabel-logik.js, Kapitel 136):
   - "Jetzt lernen" laeuft ueber window.VokabelLogik: Stufe 1 Auswahl (a/b),
     Stufe 2 Lueckenwort, Stufe 3 Selberschreiben, Wiederholungsordner.
     Wertung STRENG (jeder Tipp-, Akzent-, Artikelfehler ist falsch), die
     Fehlerstelle neutral (gelb, unterstrichen), nie rot. /toleranz.js gilt
     hier nicht mehr.
   - Paketende "Paket 2 von 4 geschafft" bzw. Runde mit "Weiter"/"Pause".
   - Gespeichert wird sparsam: waehrend der Sitzung nur im sessionStorage
     (Sammler der Logik), localStorage erst bei "Pause" oder beim Verlassen.
   - "Frei ueben" (Einheit, Richtung, Uebungsart, Zeitmodus, Hoeren) bleibt,
     zaehlt aber NICHT fuer die Stufen (Denny, entschieden 19.10.2026).
   - Ausgebaut (Antworten Nr. 11): Serie/Streak, "Neuer Rekord", Flamme,
     Sterne, XP-Zaehler je Antwort, rote Markierungen. */
(function(){
  "use strict";
  var K = window.HELENA_KONFIG;
  if (!K) { console.error("HELENA_KONFIG fehlt - der Trainer startet nicht."); return; }
  var V = window.VokabelLogik;
  if (!V) { console.error("/vokabel-logik.js fehlt - der Trainer startet nicht."); return; }
  var PRE   = K.praefix;
  var UNITS = K.units || [];
  var SP    = K.fach === "franzoesisch" ? "fr" : "en";
  var SCHL  = V.schluessel(PRE);
  var TASTEN = (V.SPRACHEN[SP] && V.SPRACHEN[SP].tasten) || [];
  var $   = function(s){ return document.querySelector(s); };
  var get = function(k,d){ try{ var v=localStorage.getItem(k); return v==null?d:v; }catch(e){ return d; } };
  var set = function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} };
  function jsonLesen(k, d){ try{ var v = JSON.parse(get(k, "null")); return v == null ? d : v; }catch(e){ return d; } }
  function esc2(s){ var d=document.createElement("div"); d.textContent=String(s==null?"":s); return d.innerHTML; }
  function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=String(text); return e; }

  /* ---------- Was im freien Ueben ausdruecklich eingestellt wurde ----------
     Helena am 07.09.2026: "Mach dass, das was ich eingestellt habe so bleibt
     biss ich es selbst wieder aendere." Gilt sofort und bleibt. Die alten
     Vorlieben werden nur noch gelesen (Rueckfall fuer den ersten Besuch) -
     mitgezaehlt wird nicht mehr, das waren fuenf Schreibvorgaenge je Runde. */
  var EINSTELLUNG = PRE+"-einstellung";
  function einstellungLaden(){
    try { var e = JSON.parse(get(EINSTELLUNG,"{}")); return (e && typeof e==="object") ? e : {}; }
    catch(e){ return {}; }
  }
  function einstellungMerken(){
    try {
      set(EINSTELLUNG, JSON.stringify({
        richtung: dir, modus: mode, dauer: dauerMin, auswahl: wahlAnzahl,
        einheit: unitSel ? unitSel.value : ""
      }));
    } catch(e){}
  }
  function liebste(art, rueckfall){
    var t; try { t = (JSON.parse(get(PRE+"-vorlieben","{}")) || {})[art]; } catch(e){ t = null; }
    if(!t) return rueckfall;
    var bester=rueckfall, hoechste=0;
    for(var k in t){ if(t[k]>hoechste){ hoechste=t[k]; bester=k; } }
    return hoechste>=3 ? bester : rueckfall;
  }

  function customUnits(){ try{var a=JSON.parse(get(PRE+"-custom-units","[]"));return Array.isArray(a)?a:[];}catch(e){return [];} }
  function allUnits(){ return UNITS.concat(customUnits()); }

  /* ---------- Lernstand (Vokabel-Logik) ----------
     Der Sammler haelt den Stand waehrend der Sitzung im sessionStorage und
     schreibt localStorage erst bei "Pause" oder beim Verlassen der Seite
     (paul-sync macht aus jedem setItem einen KV-Schreibvorgang, 1000 am Tag
     fuer alle Kinder - Gedaechtnis kv-kontingent). */
  var sam = V.sammler({ local: window.localStorage, session: window.sessionStorage, schluessel: SCHL.wissen, fenster: window });
  var zustand = sam.lies() || {};
  var migriert = 0;
  /* Migration beim ersten Oeffnen je Sprache (Fach 0->1, 1->2, 2->3 ...),
     genau EIN Schreibvorgang. Die alten Felder bleiben, eine alte offene
     Seite liest und schreibt weiter wie bisher (Kapitel 099). */
  (function(){
    var m = V.migration(zustand, Date.now());
    if (!m.geaendert) return;
    zustand = m.zustand; migriert = m.geaendert;
    if (sam.offen()) sam.merken(zustand);
    else set(SCHL.wissen, JSON.stringify(zustand));
  })();

  function planLesen(){ var p = jsonLesen(SCHL.plan, {}); return (p && typeof p === "object") ? p : {}; }
  function pausenLesen(){ var p = jsonLesen(SCHL.pause, []); return Array.isArray(p) ? p : []; }
  function pruefungenLesen(){ var p = jsonLesen(SCHL.pruefung, []); return Array.isArray(p) ? p : (p && p.termin ? [p] : []); }
  var plan = planLesen(), pausen = pausenLesen(), pruefungen = pruefungenLesen();
  function lopt(){ return { sprache: SP, pruefungen: pruefungen, pausen: pausen }; }

  /* ---------- Datum, sachlich ---------- */
  var WT = ["So","Mo","Di","Mi","Do","Fr","Sa"];
  function datumText(iso){
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso||"")); if(!m) return String(iso||"");
    var d = new Date(+m[1], +m[2]-1, +m[3]);
    return WT[d.getDay()] + ", " + m[3] + "." + m[2] + "." + m[1];
  }
  function heuteIso(plus){
    var d = new Date(); d.setHours(12,0,0,0); if(plus) d.setDate(d.getDate()+plus);
    return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);
  }

  /* ---------- Uebersicht ----------
     Stufe 1/2/3/Ordner, faellig, in Arbeit, Pruefung, Pause. Dazu der
     Kurzstand fuer die Startseite (helena-vokabelstand-en/-fr) - geschrieben
     nur, wenn sich etwas geaendert hat oder der Stand aelter als 12 Stunden
     ist (die Startseite zeigt Staende ueber drei Tage nicht mehr). */
  function standSchreiben(u){
    var k = "helena-vokabelstand-" + SP, kurz = V.kurzStand(u, Date.now());
    var alt = jsonLesen(k, null);
    var gleich = alt && ["faellig","neu","inArbeit","pruefungTage","pause"].every(function(f){ return alt[f] === kurz[f]; });
    if (gleich && Date.now() - (alt.stand || 0) < 12 * 3600e3) return;
    set(k, JSON.stringify(kurz));
  }
  var letzteUebersicht = null;
  function uebersichtMalen(){
    var u = V.uebersicht(zustand, allUnits(), Date.now(), plan, lopt());
    letzteUebersicht = u;
    standSchreiben(u);
    var zahl=$("#heuteZahl"), txt=$("#faelligText");
    var dran = u.faellig + u.inArbeit;
    if (zahl && txt){
      if (dran){
        zahl.textContent = dran;
        txt.textContent = (dran===1 ? "Wort ist dran" : "Wörter sind dran") + (u.neu ? " · " + u.neu + " noch nie geübt" : "");
      } else if (u.neu){
        zahl.textContent = u.neu;
        txt.textContent = (u.neu===1 ? "neues Wort wartet" : "neue Wörter warten") + " · nichts Altes ist dran";
      } else {
        zahl.textContent = "✓";
        txt.textContent = "Gerade ist nichts dran. Du kannst frei üben oder neue Wörter fotografieren.";
      }
    }
    var box = $("#vlStufen");
    if (!box){
      box = el("div", "vlstufen"); box.id = "vlStufen";
      // Unter "Jetzt lernen": der Knopf bleibt auf dem Handy ohne Scrollen erreichbar.
      var h = $("#startBtn") || $("#heute"); if (h && h.parentNode) h.parentNode.insertBefore(box, h.nextSibling);
    }
    box.innerHTML = "";
    var reihe = el("div", "vlkacheln");
    [["Stufe 1", u.stufe1, "Ankreuzen"], ["Stufe 2", u.stufe2, "Lückenwort"], ["Stufe 3", u.stufe3, "Schreiben"], ["Ordner", u.ordner, "gelernt"]]
      .forEach(function(x, i){
        var k = el("div", "vlkachel"); k.setAttribute("data-stufe", String(i+1));
        k.appendChild(el("b", null, x[1])); k.appendChild(el("span", null, x[0])); k.appendChild(el("small", null, x[2]));
        reihe.appendChild(k);
      });
    box.appendChild(reihe);
    box.appendChild(el("p", "vlinfo", "Zum Wiederholen dran: " + u.faellig + " · In Arbeit: " + u.inArbeit + " · Neu: " + u.neu));
    if (u.pruefung){
      var p = u.pruefung;
      var pz = el("p", "vlinfo vlpruefung");
      pz.id = "vlPruefungZeile";
      pz.textContent = "📋 Prüfung " + (p.thema ? "„" + p.thema + "“ " : "") + "am " + datumText(p.termin) + ", " + p.text +
        " · " + p.stoff + " Wörter, " + p.sicher + " davon im Ordner" +
        (p.neuProTag ? " · Empfehlung: etwa " + p.neuProTag + " neue Wörter pro Tag" : "");
      box.appendChild(pz);
    }
    if (u.pause){
      var pa = el("p", "vlinfo vlpause"); pa.id = "vlPauseZeile";
      pa.textContent = "⏸ Pause bis " + datumText(u.pause.bis) + " – bis dahin wird nichts fällig" + (u.pruefung ? " (außer den Prüfungswörtern)" : "") + ".";
      box.appendChild(pa);
    }
    var sz = $("#sitzt"); if (sz){ sz.textContent = u.ordner; var sm = sz.nextElementSibling; if (sm && sm.tagName === "SMALL") sm.textContent = "im Ordner"; }
    var sb = $("#startBtn"); if (sb) sb.textContent = sitzungLaden() ? "Weiter lernen" : "Jetzt lernen";
    return u;
  }

  /* ---------- Freies Ueben: Einheit, Richtung, Uebungsart, Dauer ---------- */
  var unitSel=$("#unit");
  function fillUnits(sel){
    if(!unitSel) return;
    unitSel.innerHTML="";
    var gruppen=K.gruppen.concat([{stufe:0, titel:"Meine eigenen Einheiten"}]);
    gruppen.forEach(function(g){
      var drin=allUnits().filter(function(u){ return g.stufe===0 ? !u.stufe : (u.stufe===g.stufe); });
      if(!drin.length) return;
      var gr=document.createElement("optgroup"); gr.label=g.titel;
      drin.forEach(function(u){
        var o=document.createElement("option");
        o.value=u.id; o.textContent=u.name+" ("+u.pairs.length+")";
        gr.appendChild(o);
      });
      unitSel.appendChild(gr);
    });
    if(sel && unitSel.querySelector("option[value='"+String(sel).replace(/'/g,"")+"']")) unitSel.value=sel;
  }
  fillUnits(einstellungLaden().einheit || "");

  function writeProgress(best,uebung){
    var alt = jsonLesen(K.fortschritt, {}) || {};
    try{ set(K.fortschritt, JSON.stringify({xp: alt.xp||0, best:best||0, uebung:uebung||0})); }catch(e){}
  }

  var eingestellt = einstellungLaden();
  var dir  = eingestellt.richtung || liebste("richtung","de2en");
  var mode = eingestellt.modus    || liebste("modus","mc");
  var dauerMin = eingestellt.dauer !== undefined ? (parseInt(eingestellt.dauer,10)||0) : (parseInt(liebste("dauer","0"),10)||0);
  var wahlAnzahl = parseInt(eingestellt.auswahl || liebste("auswahl","4"),10)||4;
  function seg(id,cb){
    var g=$(id); if(!g) return;
    g.addEventListener("click",function(e){
      var b=e.target.closest("button"); if(!b) return;
      [].forEach.call(g.children,function(x){ if(x.tagName==="BUTTON") x.setAttribute("aria-pressed","false"); });
      b.setAttribute("aria-pressed","true"); cb(b.getAttribute("data-v")); blip();
    });
  }
  seg("#dir",function(v){dir=v; einstellungMerken();});
  seg("#mode",function(v){mode=v; einstellungMerken();});
  seg("#dauer",function(v){dauerMin=parseInt(v,10)||0; einstellungMerken();});
  seg("#auswahl",function(v){wahlAnzahl=Math.max(2,Math.min(5,parseInt(v,10)||4)); einstellungMerken();});
  if (unitSel) unitSel.addEventListener("change", einstellungMerken);
  (function(){
    var f = document.querySelector("details.feineinst");
    if (!f) return;
    try { if (get(PRE+"-feineinst","") === "auf") f.open = true; } catch(e){}
    // Nur schreiben, wenn sich etwas aendert: Das Wiederherstellen beim Laden
    // loest selbst ein "toggle" aus - vorher ein Schreibvorgang je Seitenaufruf.
    f.addEventListener("toggle", function(){ var w = f.open ? "auf" : "zu"; if (get(PRE+"-feineinst","") !== w) set(PRE+"-feineinst", w); });
  })();
  function segSetzen(id,wert){
    var g=$(id); if(!g) return;
    [].forEach.call(g.children,function(x){ if(x.tagName==="BUTTON") x.setAttribute("aria-pressed", x.getAttribute("data-v")===String(wert) ? "true":"false"); });
  }
  segSetzen("#dir",dir); segSetzen("#mode",mode); segSetzen("#dauer",dauerMin); segSetzen("#auswahl",wahlAnzahl);

  /* ---------- Sound ---------- */
  var actx=null;
  function tone(f,d,delay,type){
    try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)();
      var o=actx.createOscillator(),g=actx.createGain(); o.type=type||"sine"; o.frequency.value=f;
      var t=actx.currentTime+(delay||0); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.16,t+.02);
      g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g); g.connect(actx.destination);
      o.start(t); o.stop(t+d+.02);
    }catch(e){}
  }
  function blip(){tone(620,.1,0,"triangle");}
  function good(){tone(660,.12,0);tone(880,.16,.1);}
  // Kein schnarrender Fehlerton mehr: ein leiser, tiefer Hinweis genuegt.
  function hinweisTon(){tone(392,.14,0,"triangle");}

  /* ---------- Vorlesen – beste verfügbare Stimme der Zielsprache ---------- */
  var bestVoice=null;
  function chooseVoice(){
    try{
      var vs=speechSynthesis.getVoices()||[]; if(!vs.length) return;
      function score(v){
        var n=(v.name||"").toLowerCase(), l=(v.lang||"").toLowerCase().replace("_","-"), s=0;
        if(l.indexOf(K.stimmeVorwahl)!==0) return -1;
        if(l.indexOf(K.stimmeBevorzugt)===0) s+=3; else s+=1;
        if(n.indexOf("google")>=0) s+=6;
        if(v.localService===false) s+=3;
        if(/(daniel|kate|serena|arthur|martha|libby|sonia|aria|natasha|jenny|ryan|neural|enhanced|premium|siri)/.test(n)) s+=4;
        if(/compact|kompakt|eloquence|fred|albert/.test(n)) s-=4;
        return s;
      }
      var ranked=vs.map(function(v){return {v:v,s:score(v)};}).filter(function(x){return x.s>=0;}).sort(function(a,b){return b.s-a.s;});
      if(ranked.length) bestVoice=ranked[0].v;
    }catch(e){}
  }
  chooseVoice();
  try{ speechSynthesis.onvoiceschanged=chooseVoice; }catch(e){}
  function say(text){
    try{
      var u=new SpeechSynthesisUtterance(String(text).replace(/\s*\([^)]*\)/g,""));
      if(bestVoice){ u.voice=bestVoice; u.lang=bestVoice.lang; } else { u.lang=K.stimmeRueckfall; }
      u.rate=.88;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }catch(e){}
  }
  function kannSprechen(){ return typeof speechSynthesis!=="undefined"; }

  /* ---------- Gemeinsame Bausteine der Karten ---------- */
  var protokoll=[], rundeBegonnen=0, karteBegonnen=0;
  function LS(){ return window.lernstand || null; }
  function ansicht(was){ document.body.classList.toggle("konzentriert", was === "spiel" || was === "ende"); }
  function zeigeSpiel(){
    $("#setup").style.display="none"; $("#end").style.display="none"; $("#play").style.display="block";
    ansicht("spiel"); window.scrollTo(0,0);
  }
  function zeigeSetup(){
    try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
    $("#play").style.display="none"; $("#end").style.display="none"; $("#setup").style.display="block";
    ansicht("start"); window.scrollTo(0,0);
  }

  /* Die Akzentleiste (Franzoesisch): e è ê à â ç ô û ù ë ï œ. Fuegt an der
     Cursorstelle des zuletzt angetippten Feldes ein; pointerdown haelt den
     Fokus im Feld, damit die Handytastatur offen bleibt. */
  var letztesFeld = null;
  function akzentLeiste(){
    if (!TASTEN.length) return null;
    var leiste = el("div", "vltasten"); leiste.setAttribute("role", "group"); leiste.setAttribute("aria-label", "Akzente");
    TASTEN.forEach(function(ch){
      var b = el("button", "vltaste", ch); b.type = "button"; b.setAttribute("aria-label", ch + " einfügen"); b.setAttribute("data-zeichen", ch);
      b.addEventListener("pointerdown", function(e){ e.preventDefault(); });
      b.addEventListener("mousedown", function(e){ e.preventDefault(); });
      b.addEventListener("click", function(){ einfuegen(ch); });
      leiste.appendChild(b);
    });
    return leiste;
  }
  function einfuegen(ch){
    var f = letztesFeld;
    if (!f || !document.body.contains(f) || f.disabled) f = document.querySelector("#card input:not([disabled])");
    if (!f) return;
    if (f.maxLength === 1){
      f.value = ch; f.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    var v = f.value, a = f.selectionStart, z = f.selectionEnd;
    if (a == null){ a = z = v.length; }
    f.value = v.slice(0, a) + ch + v.slice(z);
    try { f.setSelectionRange(a + ch.length, a + ch.length); } catch(e){}
    try { f.focus(); } catch(e){}
  }
  document.addEventListener("focusin", function(e){ if (e.target && e.target.tagName === "INPUT" && e.target.closest && e.target.closest("#card")) letztesFeld = e.target; });

  function eingabeFeld(platzhalter){
    var i = el("input"); i.id = "ipt"; i.type = "text";
    i.setAttribute("autocomplete","off"); i.setAttribute("autocapitalize","off"); i.setAttribute("autocorrect","off");
    i.setAttribute("spellcheck","false"); i.placeholder = platzhalter || "…";
    return i;
  }

  /* Die Markierung der Logik ([[zeichen, 0|1], ...]) als Text mit neutral
     hervorgehobenen Stellen: gelb hinterlegt und unterstrichen, nie rot. */
  function markiert(liste){
    var s = el("span", "vlwort");
    (liste || []).forEach(function(x){
      if (x[1]) { var m = el("span", "vlmark", x[0] === " " ? " " : x[0]); s.appendChild(m); }
      else s.appendChild(document.createTextNode(x[0]));
    });
    return s;
  }
  var ARTTEXT = { akzent: "Akzentfehler", artikel: "Artikelfehler", tippfehler: "Tippfehler", falsch: "Nicht ganz", leer: "Keine Antwort" };
  function rueckmeldungFalsch(vd, erg, loesungAnzeige){
    vd.className = "verdict neutral";
    var art = (erg.arten && erg.arten.indexOf("leer") >= 0) ? "leer" : erg.art;
    vd.innerHTML = "";
    vd.appendChild(el("div", "vlart", ARTTEXT[art] || "Nicht ganz"));
    var box = el("div", "vlrm");
    if (erg.markierung && erg.eingabe){
      var z1 = el("div", "vlzeile"); z1.appendChild(el("small", null, "Deine Antwort:")); z1.appendChild(markiert(erg.markierung.gegeben)); box.appendChild(z1);
      var z2 = el("div", "vlzeile vlrichtig"); z2.appendChild(el("small", null, "So schreibt man es:")); z2.appendChild(markiert(erg.markierung.richtig)); box.appendChild(z2);
    } else {
      var z3 = el("div", "vlzeile vlrichtig"); z3.appendChild(el("small", null, "Richtig ist:")); z3.appendChild(el("span", "vlwort", loesungAnzeige || erg.treffer)); box.appendChild(z3);
    }
    vd.appendChild(box);
  }
  function weiterKnopf(fn){
    var b=el("button","next","Weiter ›"); b.type="button"; b.id="weiterKarte";
    b.addEventListener("click",fn);
    $("#card").appendChild(b);
    // focus() ohne preventScroll: rueckt "Weiter" ins Bild, auch bei offener Tastatur.
    try{ b.focus(); }catch(e){}
    return b;
  }

  /* =====================================================================
     JETZT LERNEN - die Sitzung ueber die Vokabel-Logik
     ===================================================================== */
  var sitz = null, ab = null, beantwortet = false, lernenLaeuft = false, sitzGeschrieben = "";
  function sitzungLaden(){
    var s = null;
    try { s = JSON.parse(sessionStorage.getItem(SCHL.sitzung) || "null"); } catch(e){}
    if (!s) s = jsonLesen(SCHL.sitzung, null);
    return V.sitzungGueltig(s, Date.now()) ? s : null;
  }
  function sitzungMerken(){ try { sessionStorage.setItem(SCHL.sitzung, JSON.stringify(sitz)); } catch(e){} }
  function sitzungVergessen(){
    try { sessionStorage.removeItem(SCHL.sitzung); } catch(e){}
    if (get(SCHL.sitzung, null) != null) { try { localStorage.removeItem(SCHL.sitzung); } catch(e){} }
    sitzGeschrieben = "";
  }
  /* Beim Verlassen: eine laufende Sitzung bleibt fortsetzbar (Busfahrt,
     Netzabbruch). Den Lernstand selbst sichert der Sammler. */
  function beimVerlassen(){
    if (lernenLaeuft && sitz){
      var t = JSON.stringify(sitz);
      if (t !== sitzGeschrieben){ set(SCHL.sitzung, t); sitzGeschrieben = t; }
    }
    if (protokoll.length) lernstandSichernFuerSpaeter();
    entwurfSichern();
  }
  window.addEventListener("pagehide", beimVerlassen);
  /* Eine durchgeschaute, aber nicht gespeicherte Wortliste ist ein echter
     Verlust - der Browser fragt nach (21.10.2026). */
  window.addEventListener("beforeunload", function(e){
    if(!entwurfSammeln()) return;
    e.preventDefault(); e.returnValue = ""; return "";
  });
  document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "hidden") beimVerlassen(); });

  function lernenStarten(einheitId){
    var jetzt = Date.now();
    plan = planLesen(); pausen = pausenLesen(); pruefungen = pruefungenLesen();
    var alt = !einheitId && sitzungLaden();
    sitz = alt || V.sitzungStarten(zustand, allUnits(), jetzt, plan, { sprache: SP, pruefungen: pruefungen, pausen: pausen, einheit: einheitId || null });
    if (!sitz || sitz.modus === "leer"){
      sitz = null;
      var txt = $("#faelligText");
      if (txt) txt.textContent = "Gerade ist nichts dran. Du kannst unten frei üben oder neue Wörter fotografieren.";
      zeigeSetup();
      return false;
    }
    lernenLaeuft = true; frei = false;
    if (!alt || !protokoll.length){ protokoll = []; rundeBegonnen = jetzt; if(LS()) LS().uhrZuruecksetzen(); }
    sitzungMerken();
    var u = $("#uhrRest"); if (u) u.textContent = "";
    zeigeSpiel();
    naechste();
    return true;
  }

  function fortschrittMalen(){
    var balken = $("#prog"); if (!balken || !sitz) return;
    var anteil = 0;
    if (sitz.modus === "paket" && sitz.paket.length){
      var ein = V.einstellungen(plan), ziel = 3 + ein.gelerntNach, summe = 0;
      sitz.paket.forEach(function(k){
        var e = V.lesen(zustand[k], V.tagVon(Date.now()));
        if (!e) return;
        if (e.stufe === "ordner") summe += ziel;
        else if (e.stufe === 3) summe += 3 + Math.min(ein.gelerntNach, e.folge || 0);
        else if (e.stufe === 2) summe += 2;
        else summe += (e.r1a ? 1 : 0) + (e.r1b ? 1 : 0);
      });
      anteil = summe / (ziel * sitz.paket.length);
    } else if (sitz.modus === "runde"){
      anteil = (sitz.anzahl || 0) / V.einstellungen(plan).sitzungGroesse;
    }
    balken.style.width = Math.round(Math.min(1, Math.max(0, anteil)) * 100) + "%";
  }

  function naechste(){
    var r = V.naechsteAbfrage(sitz, zustand, allUnits(), Date.now(), plan, { pruefungen: pruefungen, pausen: pausen });
    if (r.ende){ endeZeigen(r.ende); return; }
    ab = r.abfrage; beantwortet = false; karteBegonnen = Date.now();
    fortschrittMalen();
    karteMalen(ab);
  }

  function kickerText(a){
    var form = { auswahl: "Ankreuzen", luecke: "Lückenwort", schreiben: "Selbst schreiben" }[a.form];
    var vorn;
    if (a.zwischen) vorn = "Zwischendurch";
    else if (a.grund === "wiederholung") vorn = "Wiederholung";
    else if (a.grund === "pruefung") vorn = "Für die Prüfung";
    else if (a.grund === "extra") vorn = "Extra";
    else vorn = "Stufe " + (a.stufe === "ordner" ? 3 : a.stufe);
    if (a.form === "auswahl") form += " · " + (a.richtung === "b" ? K.sprache + " → Deutsch" : "Deutsch → " + K.sprache);
    return vorn + " · " + form;
  }

  function karteMalen(a){
    var c = $("#card"); c.innerHTML = ""; c.setAttribute("data-form", a.form);
    c.appendChild(el("div", "kicker", kickerText(a)));
    var pr = el("div", "prompt", a.frage);
    var fremdOben = a.form === "auswahl" && a.richtung === "b";
    if (fremdOben){
      var sb = el("button", "say", "🔊"); sb.type = "button"; sb.title = "Aussprache"; sb.setAttribute("aria-label", "Vorlesen");
      sb.addEventListener("click", function(){ say(a.paar.en); });
      pr.appendChild(sb);
    }
    c.appendChild(pr);
    if (a.form === "auswahl"){
      c.appendChild(el("div", "hint", "Wähle die richtige Übersetzung"));
      var ch = el("div", "choices vlliste"); ch.id = "ch";
      a.optionen.forEach(function(o){
        var b = el("button", "choice", o); b.type = "button";
        b.addEventListener("click", function(){ antworten(o, b); });
        ch.appendChild(b);
      });
      c.appendChild(ch);
      if (fremdOben) say(a.paar.en);
    } else if (a.form === "luecke"){
      c.appendChild(el("div", "hint", "Setze die fehlenden Buchstaben ein"));
      var wort = el("div", "vlluecke"); wort.id = "vlLuecke";
      var stellen = a.luecke.stellen, ziel = a.luecke.ziel, felder = [];
      var gruppe = el("span", "vlgruppe");
      for (var i = 0; i < ziel.length; i++){
        var zch = ziel.charAt(i);
        if (zch === " "){ wort.appendChild(gruppe); gruppe = el("span", "vlgruppe"); continue; }
        var k = stellen.indexOf(i);
        if (k >= 0){
          var f = el("input", "vlgap"); f.type = "text"; f.maxLength = 1; f.setAttribute("data-nr", String(k));
          f.setAttribute("autocomplete","off"); f.setAttribute("autocapitalize","off"); f.setAttribute("autocorrect","off"); f.setAttribute("spellcheck","false");
          f.setAttribute("aria-label", "Fehlender Buchstabe " + (k + 1));
          gruppe.appendChild(f); felder.push(f);
        } else gruppe.appendChild(el("span", "vlbst", zch));
      }
      wort.appendChild(gruppe);
      var t1 = akzentLeiste(); if (t1) c.appendChild(t1);
      c.appendChild(wort);
      felder.forEach(function(f, n){
        f.addEventListener("input", function(){
          if (f.value.length > 1) f.value = f.value.slice(-1);
          if (f.value && felder[n + 1]) felder[n + 1].focus();
        });
        f.addEventListener("keydown", function(e){
          if (e.key === "Backspace" && !f.value && felder[n - 1]){ felder[n - 1].focus(); e.preventDefault(); }
          if (e.key === "Enter"){ e.preventDefault(); if (beantwortet) naechste(); else pruefLuecke(); }
        });
      });
      var zeile = el("div", "answer vlprueffeld");
      var chk = el("button", null, "Prüfen"); chk.id = "chk"; chk.type = "button";
      zeile.appendChild(chk); c.appendChild(zeile);
      var pruefLuecke = function(){ antworten(felder.map(function(x){ return x.value; })); };
      chk.addEventListener("click", pruefLuecke);
      if (felder[0]) { letztesFeld = felder[0]; try { felder[0].focus({preventScroll:true}); } catch(e){} }
    } else {
      var nomen = SP === "fr" && V.wortartVon(a.paar, SP) === "nomen";
      c.appendChild(el("div", "hint", "Schreib das " + K.spracheAdj + " Wort" + (nomen ? " mit Artikel" : "")));
      var t2 = akzentLeiste(); if (t2) c.appendChild(t2);
      var an = el("div", "answer");
      var ipt = eingabeFeld(nomen ? "mit Artikel, z. B. le / la …" : "…");
      var chk2 = el("button", null, "Prüfen"); chk2.id = "chk"; chk2.type = "button";
      an.appendChild(ipt); an.appendChild(chk2); c.appendChild(an);
      var go = function(){ antworten(ipt.value); };
      chk2.addEventListener("click", go);
      ipt.addEventListener("keydown", function(e){ if (e.key === "Enter"){ e.preventDefault(); if (beantwortet) naechste(); else go(); } });
      letztesFeld = ipt;
      try { ipt.focus({preventScroll:true}); } catch(e){}
    }
    var vd = el("div", "verdict"); vd.id = "vd"; c.appendChild(vd);
    var exs = el("div", "exs"); exs.id = "exs"; c.appendChild(exs);
  }

  function antworten(antwort, knopf){
    if (beantwortet || !ab) return;
    beantwortet = true;
    var jetzt = Date.now();
    var erg = V.werten(ab, antwort, plan);
    var res = V.anwenden(zustand, ab, erg, jetzt, plan);
    if (!ab.zwischen){ zustand = res.zustand; sam.merken(zustand); }
    sitz = V.nachAntwort(sitz, ab, erg, res); sitzungMerken();
    if (!ab.zwischen){
      var einheit = allUnits().filter(function(u){ return u.id === ab.unitId; })[0];
      protokoll.push({
        merkmal: (einheit ? einheit.name : "Vokabeln").toLowerCase(),
        art: { auswahl: "vok-auswahl-4", luecke: "vok-luecke", schreiben: "vok-tippen" }[ab.form] || "vokabel",
        stimmt: !!erg.richtig, nachspielzeit: false,
        sekunden: karteBegonnen ? Math.round((jetzt - karteBegonnen)/1000) : 0,
        gegeben: erg.richtig ? "" : String(Array.isArray(antwort) ? (erg.eingabe || "") : (antwort || "")).slice(0,80),
        richtig: String(ab.loesung || "").slice(0,80),
        frage: String(ab.frage || "").slice(0,160)
      });
    }
    // Karte sperren und Rueckmeldung zeigen.
    var c = $("#card");
    [].forEach.call(c.querySelectorAll("input"), function(i){ i.disabled = true; });
    var chk = $("#chk"); if (chk) chk.disabled = true;
    [].forEach.call(c.querySelectorAll(".vltaste"), function(b){ b.disabled = true; });
    if (ab.form === "auswahl"){
      [].forEach.call($("#ch").children, function(x){
        x.disabled = true;
        if (x.textContent === ab.loesung) x.classList.add("ok");
        else if (x === knopf && !erg.richtig) x.classList.add("vlgewaehlt");
      });
    } else {
      var ipt = $("#ipt"); if (ipt) ipt.classList.add(erg.richtig ? "ok" : "vlneutral");
    }
    var vd = $("#vd");
    if (erg.richtig){
      vd.className = "verdict ok";
      var ev = res.ereignis || {};
      vd.textContent = "Richtig!" + (ab.zwischen ? "" : ev.gelernt ? " Gelernt – das Wort kommt in den Ordner." : ev.aufgestiegen ? " Eine Stufe weiter." : "");
      good();
    } else {
      rueckmeldungFalsch(vd, erg, ab.loesung);
      hinweisTon();
    }
    if (ab.paar && ab.paar.ex){ var e = $("#exs"); if (e) e.textContent = "„" + ab.paar.ex + "“"; }
    if (ab.paar && ab.paar.en && !(ab.form === "auswahl" && ab.richtung === "b")) say(ab.paar.en);
    fortschrittMalen();
    weiterKnopf(naechste);
  }

  function endeZeigen(ende){
    lernenLaeuft = false;
    var z = V.zusammenfassung(sitz);
    var quelle = sitz && sitz.quelle;
    sitzungVergessen();
    $("#play").style.display = "none";
    ansicht("ende"); window.scrollTo(0,0);
    var e = $("#end"); e.style.display = "block"; e.innerHTML = "";
    var d = el("div", "done"); d.id = "vlEnde"; d.setAttribute("data-art", ende.art);
    d.appendChild(el("h2", null, ende.text));
    if (ende.art === "paket" || ende.art === "runde"){
      d.appendChild(el("p", null, ende.art === "paket" ? "Du entscheidest: weiter mit dem nächsten Paket oder Pause." : "Du entscheidest: noch eine Runde oder Pause."));
      var w = el("button", "start", "Weiter"); w.id = "vlWeiter"; w.type = "button";
      w.addEventListener("click", function(){
        var naechsteEinheit = quelle && quelle.id && quelle.art !== "runde" && quelle.art !== "pruefung" ? quelle.id : null;
        if (!lernenStarten(naechsteEinheit)) lernenBeenden();
      });
      var pz = el("button", "ghost", "Pause"); pz.id = "vlPause"; pz.type = "button";
      pz.addEventListener("click", lernenBeenden);
      d.appendChild(w); d.appendChild(pz);
    } else {
      d.appendChild(el("p", null, "Alles, was gerade dran war, ist geübt."));
      var zu = el("button", "start", "Zur Übersicht"); zu.id = "vlZurUebersicht"; zu.type = "button";
      zu.addEventListener("click", lernenBeenden);
      d.appendChild(zu);
    }
    // Die Zusammenfassung steht UNTER den Knoepfen: "Weiter"/"Pause" bleiben
    // auch auf kleinen Schirmen ohne Scrollen erreichbar.
    if (z.abfragen){
      var bil = el("div", "bilanz vlbilanz");
      [[z.abfragen, z.abfragen === 1 ? "Abfrage" : "Abfragen"], [z.richtig, "richtig"], [z.aufgestiegen, "eine Stufe weiter"], [z.gelernt, "gelernt"]]
        .forEach(function(x){ var k = el("div"); k.appendChild(el("b", null, x[0])); k.appendChild(el("small", null, x[1])); bil.appendChild(k); });
      d.appendChild(bil);
      var teile = [];
      if (SP === "fr" || z.akzent) teile.push("Akzentfehler: " + z.akzent);
      if (SP === "fr" || z.artikel) teile.push("Artikelfehler: " + z.artikel);
      if (z.tippfehler) teile.push("Tippfehler: " + z.tippfehler);
      if (teile.length){ var p = el("p", "vlfehlerarten", teile.join(" · ")); p.id = "vlFehlerarten"; d.appendChild(p); }
    }
    e.appendChild(d);
    good();
  }

  /* "Pause" (oder Zurueck): JETZT wird gespeichert - ein Schreibvorgang fuer
     Lernstand, Kurzstand und Statistik zusammen (paul-sync buendelt alles,
     was innerhalb von 1,5 s geschrieben wird). */
  function lernenBeenden(){
    lernenLaeuft = false;
    sitzungVergessen();
    sam.sichern();
    var u = letzteUebersicht = V.uebersicht(zustand, allUnits(), Date.now(), plan, lopt());
    var richtig = protokoll.filter(function(x){ return x.stimmt; }).length;
    if (protokoll.length) writeProgress(richtig, protokoll.length - richtig);
    lernstandSenden();
    standSchreiben(u);
    zeigeSetup();
    uebersichtMalen();
    blip();
  }
  function lernenUnterbrechen(){
    // Zurueck mitten in der Sitzung: Stand sichern, Sitzung bleibt im Tab fortsetzbar.
    lernenLaeuft = false;
    sam.sichern();
    lernstandSenden();
    zeigeSetup();
    uebersichtMalen();
    blip();
  }

  /* =====================================================================
     FREI UEBEN - Einheit, Richtung, Uebungsart, Zeitmodus, Hoeren.
     Streng gewertet wie das Lernen, aber OHNE Einfluss auf die Stufen:
     hier wird kein Lernstand gelesen oder geschrieben (Denny, 19.10.2026).
     ===================================================================== */
  var frei=false, queue=[], curUnit=null, roundDir="de2en", total=0, mastered=0, wrongWords=[], answered=false;
  var zeitEnde=0, gesehen={}, rundenModus="mc", erstRichtig=0, erstGesamt=0;
  function shuffle(a){ for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
  function clozeTarget(en){ return String(en).replace(/^to\s+/,"").replace(/\s*\([^)]*\)/g,"").trim(); }
  function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
  function makeCloze(sentence, target){
    if(!sentence) return null;
    var pat=new RegExp("\\b"+escRe(target).replace(/\s+/g,"\\s+")+"\\b","i");
    if(!pat.test(sentence)) return null;
    var blank='<span class="gap">'+Array(Math.max(4,target.replace(/\s/g,"").length)+1).join("_")+'</span>';
    return esc2(sentence).replace(new RegExp("\\b"+escRe(esc2(target)).replace(/\s+/g,"\\s+")+"\\b","i"), blank);
  }
  function maskWord(w){
    return w.split("").map(function(ch,i){
      if(!/[a-zA-ZäöüÄÖÜßÀ-ÿœ]/.test(ch)) return ch;
      if(i===0 || i===w.length-1) return ch;
      return Math.random()<.55 ? "_" : ch;
    }).join("");
  }
  function freiStarten(){
    frei=true; lernenLaeuft=false;
    roundDir=dir; rundenModus=mode;
    zeitEnde = dauerMin ? Date.now() + dauerMin*60000 : 0;
    erstRichtig=0; erstGesamt=0;
    curUnit=allUnits().filter(function(u){return unitSel && u.id===unitSel.value;})[0]||UNITS[0];
    queue=shuffle(curUnit.pairs.map(function(p){return {p:p, tries:0, unitId:curUnit.id};}));
    total=queue.length; mastered=0; wrongWords=[];
    protokoll=[]; rundeBegonnen=Date.now();
    if(LS()) LS().uhrZuruecksetzen();
    gesehen={};
    queue.forEach(function(it){ gesehen[it.unitId+"|"+it.p.en]=1; });
    if (!total) return;
    zeigeSpiel();
    nextCard();
  }
  function pickDir(){ return roundDir==="mix" ? (Math.random()<.5?"de2en":"en2de") : roundDir; }
  // Im Zeitmodus laeuft die Runde, bis die Minuten um sind: aus allen
  // Einheiten wird zufaellig nachgefuellt - ohne Blick auf den Lernstand.
  function nachfuellen(){
    var alle=[];
    allUnits().forEach(function(u){ u.pairs.forEach(function(p){ if(!gesehen[u.id+"|"+p.en]) alle.push({p:p, tries:0, unitId:u.id}); }); });
    var neue=shuffle(alle).slice(0,12);
    if(!neue.length) return false;
    neue.forEach(function(it){ gesehen[it.unitId+"|"+it.p.en]=1; });
    queue = queue.concat(neue);
    total = mastered + queue.length;
    return true;
  }
  function restZeit(){ return zeitEnde ? Math.max(0, zeitEnde - Date.now()) : 0; }
  function nextCard(){
    answered=false; karteBegonnen=Date.now();
    if(zeitEnde){
      var anteil = 1 - restZeit() / (dauerMin*60000);
      $("#prog").style.width=Math.round(Math.min(1,Math.max(0,anteil))*100)+"%";
      var u=$("#uhrRest"); if(u) u.textContent=Math.ceil(restZeit()/60000)+" Min";
    } else {
      $("#prog").style.width=(total? Math.round(mastered/total*100):0)+"%";
      var u2=$("#uhrRest"); if(u2) u2.textContent="";
    }
    if(zeitEnde && restZeit()<=0){ finish(); return; }
    if(!queue.length && zeitEnde && nachfuellen()){ /* weiter */ }
    if(!queue.length){ finish(); return; }
    var item=queue[0], p=item.p;
    var c=$("#card"); c.removeAttribute("data-form");
    var frei1 = '<div class="kicker">Frei üben · ';
    var freiHinweis = '<div class="vlfrei">Zählt nicht für die Stufen.</div>';
    if(mode==="hoeren" && kannSprechen()){
      item._sol=p.en; item._solLang=SP; item._prompt=p.en; item._d=null;
      c.innerHTML=frei1+'Hören &amp; schreiben · '+K.sprache+'</div>'+freiHinweis+
        '<div class="hoerfeld"><button class="hoerknopf" id="nochmal" type="button" aria-label="Nochmal vorlesen">&#128266;</button></div>'+
        '<div class="clozemean">bedeutet: <b>'+esc2(p.de)+'</b></div>'+
        '<div class="hint">Tippe, was du hörst</div>';
      freiEingabe(c, item, "…");
      $("#nochmal").addEventListener("click",function(){ say(p.en); });
      say(p.en);
      return;
    }
    if(mode==="cloze"){
      var tgt=clozeTarget(p.en);
      var sentHtml=makeCloze(p.ex, tgt);
      item._sol=sentHtml ? tgt : p.en; item._solLang=SP; item._prompt=p.en; item._d=null;
      if(sentHtml){
        c.innerHTML=frei1+'Lückentext · '+K.sprache+'</div>'+freiHinweis+
          '<div class="clozemean">bedeutet: <b>'+esc2(p.de)+'</b></div>'+
          '<div class="clozesent">'+sentHtml+'</div>';
        freiEingabe(c, item, "fehlendes Wort");
      } else {
        c.innerHTML=frei1+'Lückentext · '+K.sprache+'</div>'+freiHinweis+
          '<div class="prompt">'+esc2(p.de)+'</div>'+
          '<div class="hint">Ergänze das '+K.spracheAdj+' Wort: <span class="masked">'+esc2(maskWord(p.en))+'</span></div>';
        freiEingabe(c, item, "ganzes Wort");
      }
      return;
    }
    var d=pickDir();
    var promptWord = d==="de2en" ? p.de : p.en;
    var solution   = d==="de2en" ? p.en : p.de;
    item._d=d; item._sol=solution; item._solLang=(d==="de2en"?SP:"de"); item._prompt=promptWord;
    var sayBtn = (d==="en2de") ? '<button class="say" type="button" title="Aussprache" aria-label="Vorlesen" data-say="'+esc2(p.en).replace(/"/g,'')+'">🔊</button>' : '';
    c.innerHTML=frei1+(d==="de2en"?"Deutsch → "+K.sprache:K.sprache+" → Deutsch")+'</div>'+freiHinweis+
      '<div class="prompt">'+esc2(promptWord)+sayBtn+'</div>';
    if(mode==="mc"){
      var opts=[solution];
      var pool=shuffle(curUnit.pairs.map(function(x){return d==="de2en"?x.en:x.de;}).filter(function(w){return w!==solution;}));
      if(pool.length < wahlAnzahl-1){
        allUnits().forEach(function(u){ u.pairs.forEach(function(x){ var w=d==="de2en"?x.en:x.de; if(w!==solution && pool.indexOf(w)<0) pool.push(w); }); });
        pool=shuffle(pool);
      }
      while(opts.length<wahlAnzahl && pool.length) opts.push(pool.pop());
      opts=shuffle(opts);
      c.insertAdjacentHTML("beforeend",'<div class="hint">Wähle die richtige Übersetzung</div><div class="choices" id="ch"></div><div class="verdict" id="vd"></div><div class="exs" id="exs"></div>');
      var ch=$("#ch");
      opts.forEach(function(o){
        var b=el("button","choice",o); b.type="button";
        b.addEventListener("click",function(){ if(answered) return; judgeChoice(b,o,solution,item); });
        ch.appendChild(b);
      });
    } else {
      c.insertAdjacentHTML("beforeend",'<div class="hint">Tippe die Übersetzung ein</div>');
      freiEingabe(c, item, "…");
    }
    var sb=c.querySelector("[data-say]");
    if(sb) sb.addEventListener("click",function(){ say(sb.getAttribute("data-say")); });
    if(d==="en2de") say(p.en);
  }
  function freiEingabe(c, item, platz){
    if (item._solLang !== "de"){ var t = akzentLeiste(); if (t) c.appendChild(t); }
    var an=el("div","answer"), ipt=eingabeFeld(platz), chk=el("button",null,"Prüfen"); chk.id="chk"; chk.type="button";
    an.appendChild(ipt); an.appendChild(chk); c.appendChild(an);
    var vd=el("div","verdict"); vd.id="vd"; c.appendChild(vd);
    var exs=el("div","exs"); exs.id="exs"; c.appendChild(exs);
    letztesFeld=ipt;
    try{ ipt.focus({preventScroll:true}); }catch(e){}
    var go=function(){ if(!answered) judgeText(ipt.value,item); };
    chk.addEventListener("click",go);
    ipt.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); if(answered) nextCard(); else go(); } });
  }
  function artName(){
    if (rundenModus === "mc") return "vok-auswahl-" + wahlAnzahl;
    return { type:"vok-tippen", cloze:"vok-luecke", hoeren:"vok-hoeren" }[rundenModus] || "vokabel";
  }
  function frageText(item){ if(item._d) return item._prompt || ""; return (item.p && item.p.de) || ""; }
  function award(item,correct){
    answered=true;
    if(item.tries === 0){
      erstGesamt++; if(correct) erstRichtig++;
      var einheit = allUnits().filter(function(u){return u.id===item.unitId;})[0];
      protokoll.push({
        merkmal: (einheit ? einheit.name : "Vokabeln").toLowerCase(),
        art: artName(), stimmt: !!correct, nachspielzeit: false,
        sekunden: karteBegonnen ? Math.round((Date.now()-karteBegonnen)/1000) : 0,
        gegeben: correct ? "" : String(item._gegeben != null ? item._gegeben : item._waehlt || "").slice(0,80),
        richtig: String(item._sol != null ? item._sol : item.p.en).slice(0,80),
        frage: String(frageText(item)).slice(0,160)
      });
    }
    if(correct){ mastered++; queue.shift(); }
    else{
      item.tries++; if(wrongWords.indexOf(item.p)<0) wrongWords.push(item.p);
      queue.shift(); queue.splice(Math.min(3,queue.length),0,item);
      total=mastered+queue.length;
    }
  }
  function judgeChoice(btn,chosen,solution,item){
    var correct=(chosen===solution);
    item._waehlt=chosen; item._gegeben=null;
    award(item,correct);
    [].forEach.call($("#ch").children,function(x){
      x.disabled=true;
      if(x.textContent===solution) x.classList.add("ok");
      else if(x===btn && !correct) x.classList.add("vlgewaehlt");
    });
    if(item.p && item.p.en) say(item.p.en);
    var vd=$("#vd");
    if(correct){ vd.className="verdict ok"; vd.textContent="Richtig!"; good(); }
    else { rueckmeldungFalsch(vd, { art:"falsch", arten:["falsch"], treffer:solution, markierung:null }, solution); hinweisTon(); }
    if(item.p && item.p.ex){ var e=$("#exs"); if(e) e.textContent="„"+item.p.ex+"“"; }
    weiterKnopf(nextCard);
  }
  /* Streng wie beim Lernen (Logik werteText), nur ohne Stufen. */
  function judgeText(val,item){
    var sp = item._solLang === "de" ? "de" : SP;
    var erg = V.werteText(val, item._sol, { sprache: sp, paar: V.istPaar(item.p, SP), einst: V.einstellungen(plan) });
    var correct = !!erg.richtig;
    var ipt=$("#ipt"); ipt.classList.add(correct?"ok":"vlneutral"); ipt.disabled=true;
    var chk=$("#chk"); if(chk) chk.disabled=true;
    [].forEach.call($("#card").querySelectorAll(".vltaste"), function(b){ b.disabled = true; });
    item._gegeben = String(val||"").trim();
    award(item,correct);
    if(item.p && item.p.en) say(item.p.en);
    var vd=$("#vd");
    if(correct){ vd.className="verdict ok"; vd.textContent="Richtig!"; good(); }
    else { rueckmeldungFalsch(vd, erg, item._sol); hinweisTon(); }
    if(item.p && item.p.ex){ var e=$("#exs"); if(e) e.textContent="„"+item.p.ex+"“"; }
    weiterKnopf(nextCard);
  }
  function finish(){
    var geuebteSekunden = LS() ? LS().aktiveSekunden() : (rundeBegonnen ? Math.round((Date.now()-rundeBegonnen)/1000) : 0);
    lernstandSenden();
    $("#play").style.display="none";
    ansicht("ende"); window.scrollTo(0,0);
    var e=$("#end"); e.style.display="block";
    var reviewHtml="";
    if(wrongWords.length){
      reviewHtml='<div class="review"><b>Nochmal anschauen:</b>'+
        wrongWords.map(function(p){return '<div>'+esc2(p.en)+' — '+esc2(p.de)+'</div>';}).join("")+'</div>';
    }
    var minuten = Math.round(geuebteSekunden / 60);
    e.innerHTML='<div class="done" id="vlFreiEnde">'+
      '<h2>Runde beendet</h2>'+
      '<p>Frei geübt – das zählt nicht für die Stufen.</p>'+
      '<div class="bilanz">'+
        '<div><b>'+erstGesamt+'</b><small>Wörter geübt</small></div>'+
        '<div><b>'+erstRichtig+'</b><small>beim ersten Mal richtig</small></div>'+
        '<div><b>'+(minuten||"<1")+'</b><small>Minuten</small></div>'+
      '</div>'+
      reviewHtml+
      '<button class="start" id="again" type="button">Noch eine Runde</button>'+
      '<button class="ghost" id="zurueckUebersicht" type="button">Zur Übersicht</button>'+
      '</div>';
    $("#again").addEventListener("click",function(){ $("#end").style.display="none"; freiStarten(); });
    $("#zurueckUebersicht").addEventListener("click",function(){ frei=false; zeigeSetup(); uebersichtMalen(); blip(); });
    good();
  }

  /* ---------- Statistik, tunnelfest ----------
     Im Zug bricht die Verbindung weg. Eine Runde, die nicht durchgeht, wandert
     in eine Warteschlange im Browser und wird beim naechsten Mal mitgeschickt. */
  var AUSGANG = PRE+"-ausgang";
  function ausgangLaden(){ try{ var a=JSON.parse(get(AUSGANG,"[]")); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function ausgangSichern(a){ try{ set(AUSGANG, JSON.stringify(a.slice(-30))); }catch(e){} }
  function ausgangLeeren(){
    var warten=ausgangLaden();
    if(!warten.length) return;
    ausgangSichern([]);
    var uebrig=[], offen=warten.length;
    warten.forEach(function(runde){
      fetch("/api/statistik",{method:"POST",credentials:"same-origin",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({kind:"helena", runde:runde})})
        .then(function(a){ if(!a.ok) uebrig.push(runde); })
        .catch(function(){ uebrig.push(runde); })
        .then(function(){ if(--offen===0 && uebrig.length) ausgangSichern(ausgangLaden().concat(uebrig)); });
    });
  }
  function rundeBauen(){
    if(!protokoll.length) return null;
    var thema = frei ? ((curUnit&&curUnit.name)||"Vokabeln") : (sitz && sitz.quelle && sitz.quelle.name) || "Vokabeln lernen";
    var runde={
      spielId:K.spielId, titel:K.titel,
      quelle: frei ? ((curUnit&&curUnit.id)||"") : "lernen", fach:K.fach,
      thema: thema, lernbereich:"",
      sekunden: LS() ? LS().aktiveSekunden() : (rundeBegonnen ? Math.round((Date.now()-rundeBegonnen)/1000) : 0),
      pause: LS() ? Math.max(0, LS().wanduhrSekunden() - LS().aktiveSekunden()) : 0,
      zeitart: "lernen",
      geraet: LS() ? LS().geraet() : "",
      vorrat: allUnits().reduce(function(n,u){ return n + (u.pairs ? u.pairs.length : 0); }, 0),
      aufgaben: protokoll
    };
    protokoll=[];
    if(LS()) LS().uhrZuruecksetzen();
    return runde;
  }
  function lernstandSenden(){
    var r = rundeBauen(); if (!r) return;
    ausgangSichern(ausgangLaden().concat([r]));
    ausgangLeeren();
  }
  function lernstandSichernFuerSpaeter(){
    var r = rundeBauen(); if (!r) return;
    ausgangSichern(ausgangLaden().concat([r]));
  }
  ausgangLeeren();
  window.addEventListener("online", ausgangLeeren);

  /* ---------- Knoepfe ---------- */
  $("#startBtn").addEventListener("click", function(){ lernenStarten(null); });
  (function(){
    var body = document.querySelector("details.feineinst .feinbody");
    if (!body || $("#freiBtn")) return;
    var b = el("button", "vlfreistart", "Frei üben ›"); b.id = "freiBtn"; b.type = "button";
    b.addEventListener("click", freiStarten);
    body.appendChild(b);
  })();
  $("#backBtn").addEventListener("click", function(){
    if (frei){ frei=false; lernstandSenden(); zeigeSetup(); uebersichtMalen(); blip(); return; }
    lernenUnterbrechen();
  });

  /* =====================================================================
     LERNPLAN: Rhythmus, "gelernt nach", Pause, Pruefung (je Sprache)
     ===================================================================== */
  function planSpeichern(neu){
    var p = planLesen();
    for (var k in neu) if (Object.prototype.hasOwnProperty.call(neu, k)) p[k] = neu[k];
    set(SCHL.plan, JSON.stringify(p));
    plan = p;
    uebersichtMalen();
  }
  function lernplanBauen(){
    var setup = $("#setup"), start = $("#startBtn");
    if (!setup || !start || $("#vlPlan")) return;
    var d = el("details", "feineinst vlplan"); d.id = "vlPlan";
    d.appendChild(el("summary", null, "Lernplan, Pause und Prüfung"));
    var body = el("div", "feinbody");
    var ein = V.einstellungen(plan);
    // Rhythmus
    var f1 = el("div", "field"); f1.appendChild(el("label", null, "Wiederholen im Ordner"));
    var s1 = el("div", "seg"); s1.id = "vlRhythmus";
    [["normal","Normal"],["intensiv","Intensiv"],["entspannt","Entspannt"],["eigene","Eigene"]].forEach(function(x){
      var b = el("button", null, x[1]); b.type = "button"; b.setAttribute("data-v", x[0]); b.setAttribute("aria-pressed", ein.rhythmus === x[0] ? "true" : "false");
      s1.appendChild(b);
    });
    f1.appendChild(s1);
    var tage = el("p", "tipp"); tage.id = "vlRhythmusTage"; f1.appendChild(tage);
    var eigen = el("div", "vleigene"); eigen.id = "vlEigene";
    var werte = (ein.rhythmus === "eigene" && ein.abstaende) ? ein.abstaende : V.RHYTHMEN.normal;
    for (var i = 0; i < 5; i++){
      var inp = el("input", "vlzahl"); inp.type = "number"; inp.min = "1"; inp.max = "60"; inp.inputMode = "numeric";
      inp.value = String(werte[i]); inp.setAttribute("aria-label", (i+1) + ". Abstand in Tagen");
      eigen.appendChild(inp);
    }
    var ueb = el("button", "mini vlueb", "Übernehmen"); ueb.type = "button"; ueb.id = "vlEigeneOk"; eigen.appendChild(ueb);
    var em = el("div", "vlmeldung"); em.id = "vlEigeneMeldung"; eigen.appendChild(em);
    f1.appendChild(eigen);
    function rhythmusMalen(r){
      var e2 = V.einstellungen(planLesen());
      var a = r === "eigene" ? null : V.RHYTHMEN[r];
      tage.textContent = a ? "Wieder dran nach " + a.join(", ") + " Tagen (danach bleibt es bei " + a[a.length-1] + ")." : "Eigene Abstände: jeder länger als der vorige, höchstens 60 Tage.";
      eigen.style.display = r === "eigene" ? "flex" : "none";
      [].forEach.call(s1.children, function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-v") === r ? "true" : "false"); });
      return e2;
    }
    rhythmusMalen(ein.rhythmus);
    s1.addEventListener("click", function(e){
      var b = e.target.closest("button"); if (!b) return;
      var r = b.getAttribute("data-v"); rhythmusMalen(r);
      if (r !== "eigene") planSpeichern({ rhythmus: r });
      blip();
    });
    ueb.addEventListener("click", function(){
      var a = [].map.call(eigen.querySelectorAll("input"), function(x){ return parseInt(x.value, 10); });
      var ok = V.abstaendePruefen(a, 60);
      if (!ok.ok){ em.textContent = ok.fehler; return; }
      em.textContent = "Gespeichert.";
      planSpeichern({ rhythmus: "eigene", abstaende: a });
    });
    body.appendChild(f1);
    // gelernt nach
    var f2 = el("div", "field"); f2.appendChild(el("label", null, "Gelernt nach so oft richtig auf Stufe 3"));
    var s2 = el("div", "seg"); s2.id = "vlGelernt";
    [3,4,5].forEach(function(n){
      var b = el("button", null, n + "×"); b.type = "button"; b.setAttribute("data-v", String(n)); b.setAttribute("aria-pressed", ein.gelerntNach === n ? "true" : "false");
      s2.appendChild(b);
    });
    s2.addEventListener("click", function(e){
      var b = e.target.closest("button"); if (!b) return;
      [].forEach.call(s2.children, function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      planSpeichern({ gelerntNach: parseInt(b.getAttribute("data-v"), 10) }); blip();
    });
    f2.appendChild(s2);
    body.appendChild(f2);
    // Pause und Pruefung
    var f3 = el("div", "vlplanknoepfe");
    var pb = el("button", "ghost vlplanknopf", "⏸ Pause einstellen"); pb.type = "button"; pb.id = "vlPauseBtn";
    var qb = el("button", "ghost vlplanknopf", "📋 Prüfung anlegen"); qb.type = "button"; qb.id = "vlPruefBtn";
    pb.addEventListener("click", pauseDialog); qb.addEventListener("click", pruefungDialog);
    f3.appendChild(pb); f3.appendChild(qb);
    body.appendChild(f3);
    d.appendChild(body);
    var fein = document.querySelector("details.feineinst:not(.vlplan)");
    setup.insertBefore(d, fein || start.nextSibling);
  }

  /* ---------- Dialoge (eigene Huelle, kein <dialog>: laeuft ueberall gleich) ---------- */
  function dialogOeffnen(id, titel){
    var alt = document.getElementById(id); if (alt && alt.parentNode) alt.parentNode.removeChild(alt);
    var h = el("div", "vldlg"); h.id = id;
    var p = el("div", "vldlgpanel"); p.setAttribute("role", "dialog"); p.setAttribute("aria-modal", "true"); p.setAttribute("aria-label", titel);
    p.appendChild(el("h3", null, titel));
    var inhalt = el("div", "vldlginhalt"); p.appendChild(inhalt);
    var knoepfe = el("div", "vldlgknoepfe"); p.appendChild(knoepfe);
    h.appendChild(p);
    h.addEventListener("click", function(e){ if (e.target === h) zu(); });
    document.body.appendChild(h);
    document.body.classList.add("vldlgoffen");
    function zu(){ if (h.parentNode) h.parentNode.removeChild(h); if (!document.querySelector(".vldlg")) document.body.classList.remove("vldlgoffen"); }
    function knopf(text, cls, fn, kid){ var b = el("button", cls || "ghost", text); b.type = "button"; if (kid) b.id = kid; b.addEventListener("click", fn); knoepfe.appendChild(b); return b; }
    return { huelle: h, inhalt: inhalt, knoepfe: knoepfe, zu: zu, knopf: knopf };
  }
  function hinweisDialog(text, danach){
    var d = dialogOeffnen("vlHinweis", "Hinweis");
    d.inhalt.appendChild(el("p", "vlhinweistext", text));
    d.knopf("OK", "start", function(){ d.zu(); if (danach) danach(); }, "vlHinweisOk");
  }
  function datumFeld(id, wert, label){
    var w = el("label", "vldatum"); w.appendChild(el("span", null, label));
    var i = el("input"); i.type = "date"; i.id = id; i.value = wert || ""; w.appendChild(i);
    return w;
  }

  function pauseDialog(){
    pausen = pausenLesen();
    var d = dialogOeffnen("vlPauseDlg", "Pause einstellen");
    d.inhalt.appendChild(el("p", "tipp", "In der Pause wird nichts fällig. Danach rücken alle Wiederholungen um die Pausenlänge nach hinten – nichts staut sich."));
    var reihe = el("div", "vldatumreihe");
    reihe.appendChild(datumFeld("vlPauseVon", heuteIso(0), "von"));
    reihe.appendChild(datumFeld("vlPauseBis", heuteIso(7), "bis"));
    d.inhalt.appendChild(reihe);
    var wahl = el("div", "seg vlsprachen"); wahl.id = "vlPauseSprachen";
    [["nur", "Nur " + K.sprache], ["beide", "Englisch und Französisch"]].forEach(function(x, i){
      var b = el("button", null, x[1]); b.type = "button"; b.setAttribute("data-v", x[0]); b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      wahl.appendChild(b);
    });
    wahl.addEventListener("click", function(e){ var b = e.target.closest("button"); if (!b) return; [].forEach.call(wahl.children, function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); });
    d.inhalt.appendChild(wahl);
    var meld = el("div", "vlmeldung"); meld.id = "vlPauseMeldung"; d.inhalt.appendChild(meld);
    var h = heuteIso(0);
    var laufend = pausen.filter(function(p){ return p && p.bis >= h; });
    if (laufend.length){
      var liste = el("div", "vlliste2");
      liste.appendChild(el("b", null, "Eingestellte Pausen"));
      laufend.forEach(function(p){
        var z = el("div", "vlzeile2");
        var spr = (p.sprachen && p.sprachen.length === 1) ? (p.sprachen[0] === "fr" ? "Französisch" : "Englisch") : "beide Sprachen";
        z.appendChild(el("span", null, datumText(p.von) + " bis " + datumText(p.bis) + " · " + spr));
        var w = el("button", "mini", "Pause beenden"); w.type = "button";
        w.addEventListener("click", function(){
          var rest = pausenLesen().filter(function(x){ return !(x.von === p.von && x.bis === p.bis); });
          set(SCHL.pause, JSON.stringify(rest)); pausen = rest; d.zu(); uebersichtMalen();
        });
        z.appendChild(w); liste.appendChild(z);
      });
      d.inhalt.appendChild(liste);
    }
    d.knopf("Pause speichern", "start", function(){
      var von = $("#vlPauseVon").value, bis = $("#vlPauseBis").value;
      if (!von || !bis || bis < von){ meld.textContent = "Bitte ein Datum „bis“ ab dem Datum „von“ wählen."; return; }
      if (bis < h){ meld.textContent = "Die Pause muss heute oder später enden."; return; }
      var nur = wahl.querySelector("[aria-pressed='true']").getAttribute("data-v") === "nur";
      var neu = pausenLesen().filter(function(p){ return p && p.bis >= h; });
      neu.push({ von: von, bis: bis, sprachen: nur ? [SP] : ["en", "fr"] });
      set(SCHL.pause, JSON.stringify(neu)); pausen = neu;
      d.zu();
      uebersichtMalen();
      if (pruefungen.some(function(p){ return p && p.termin > h; }))
        hinweisDialog("Die Wörter deiner Prüfung werden auch in der Pause abgefragt.");
    }, "vlPauseOk");
    d.knopf("Abbrechen", "ghost", d.zu, "vlPauseAbbrechen");
  }

  function termineHolen(fertig){
    if (!window.fetch){ fertig(null); return; }
    fetch("/api/noten?eigene=1&kind=helena", { credentials: "same-origin" })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ fertig(j && j.ok && Array.isArray(j.termine) ? j.termine : null); })
      .catch(function(){ fertig(null); });
  }
  function pruefungDialog(){
    pruefungen = pruefungenLesen(); pausen = pausenLesen();
    var d = dialogOeffnen("vlPruefDlg", "Prüfung " + K.sprache);
    var h = heuteIso(0);
    var aktiv = pruefungen.filter(function(p){ return p && p.termin > h; })[0];
    if (aktiv){
      var ak = el("div", "vlliste2"); ak.id = "vlPruefAktiv";
      ak.appendChild(el("b", null, "Eingestellt"));
      var z = el("div", "vlzeile2");
      z.appendChild(el("span", null, (aktiv.thema ? aktiv.thema + " · " : "") + datumText(aktiv.termin)));
      var w = el("button", "mini", "Prüfung entfernen"); w.type = "button"; w.id = "vlPruefWeg";
      w.addEventListener("click", function(){ set(SCHL.pruefung, JSON.stringify([])); pruefungen = []; d.zu(); uebersichtMalen(); });
      z.appendChild(w); ak.appendChild(z);
      d.inhalt.appendChild(ak);
    }
    // Termin
    var ft = el("div", "field"); ft.appendChild(el("label", null, "Termin"));
    var tl = el("div", "vltermine"); tl.id = "vlTermine"; tl.appendChild(el("p", "tipp", "Deine eingetragenen Prüfungen werden geladen …"));
    ft.appendChild(tl);
    var eig = datumFeld("vlPrTermin", "", "oder eigenes Datum"); ft.appendChild(eig);
    d.inhalt.appendChild(ft);
    var gewaehlt = { termin: "", thema: "" };
    function terminWaehlen(t, knopf){
      gewaehlt = { termin: t.datum, thema: t.thema || "" };
      [].forEach.call(tl.querySelectorAll("button"), function(x){ x.setAttribute("aria-pressed", x === knopf ? "true" : "false"); });
      $("#vlPrTermin").value = "";
    }
    $("#vlPrTermin").addEventListener("change", function(){
      gewaehlt = { termin: this.value, thema: "" };
      [].forEach.call(tl.querySelectorAll("button"), function(x){ x.setAttribute("aria-pressed", "false"); });
    });
    termineHolen(function(alle){
      tl.innerHTML = "";
      if (!alle){ tl.appendChild(el("p", "tipp", "Deine eingetragenen Prüfungen kommen gerade nicht – wähle unten ein Datum.")); return; }
      var R = V.SPRACHEN[SP];
      var meine = alle.filter(function(t){ return t && t.datum > h && R.faecher.indexOf(String(t.fach || "").toLowerCase()) >= 0; })
        .sort(function(a, b){ return a.datum < b.datum ? -1 : 1; });
      if (!meine.length){ tl.appendChild(el("p", "tipp", "In " + K.sprache + " ist noch keine Prüfung eingetragen – wähle unten ein Datum.")); return; }
      var vorschlag = V.pruefungAusTerminen(alle, SP, Date.now());
      meine.forEach(function(t){
        var tage = V.tagAusIso(t.datum) - V.tagVon(Date.now());
        var b = el("button", "vltermin", datumText(t.datum) + (t.thema ? " · " + t.thema : "") + " · " + (tage === 1 ? "morgen" : "in " + tage + " Tagen"));
        b.type = "button"; b.setAttribute("data-datum", t.datum); b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function(){ terminWaehlen(t, b); });
        tl.appendChild(b);
        if (vorschlag && vorschlag.termin === String(t.datum).slice(0, 10) && !gewaehlt.termin) terminWaehlen(t, b);
      });
    });
    // Stoff
    var fs = el("div", "field"); fs.appendChild(el("label", null, "Stoff"));
    var sw = el("div", "seg"); sw.id = "vlStoffArt";
    [["zeitraum", "Zeitraum"], ["einheiten", "Einheiten"], ["gws", "Grundwortschatz"]].forEach(function(x, i){
      var b = el("button", null, x[1]); b.type = "button"; b.setAttribute("data-v", x[0]); b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      sw.appendChild(b);
    });
    fs.appendChild(sw);
    var pz = el("div", "vlstoff"); pz.setAttribute("data-art", "zeitraum");
    var zr = el("div", "vldatumreihe"); zr.appendChild(datumFeld("vlStoffVon", heuteIso(-28), "hochgeladen von")); zr.appendChild(datumFeld("vlStoffBis", h, "bis"));
    pz.appendChild(zr);
    var pe = el("div", "vlstoff vleinheiten"); pe.setAttribute("data-art", "einheiten"); pe.style.display = "none";
    var eigene = customUnits();
    var reihenfolge = eigene.slice().reverse().concat(UNITS);
    reihenfolge.forEach(function(u){
      var lab = el("label", "vlhaken");
      var cb = el("input"); cb.type = "checkbox"; cb.value = u.id;
      lab.appendChild(cb); lab.appendChild(el("span", null, u.name + " (" + u.pairs.length + ")" + (u.id && /^u\d{12,14}$/.test(u.id) ? "" : " · eingebaut")));
      pe.appendChild(lab);
    });
    var pg = el("div", "vlstoff"); pg.setAttribute("data-art", "gws"); pg.style.display = "none";
    pg.appendChild(el("p", "tipp", "Alle eingebauten Wörter (" + UNITS.reduce(function(n, u){ return n + u.pairs.length; }, 0) + "). Deine Fotos zählen hier nicht mit."));
    fs.appendChild(pz); fs.appendChild(pe); fs.appendChild(pg);
    sw.addEventListener("click", function(e){
      var b = e.target.closest("button"); if (!b) return;
      [].forEach.call(sw.children, function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      [pz, pe, pg].forEach(function(x){ x.style.display = x.getAttribute("data-art") === b.getAttribute("data-v") ? "" : "none"; });
    });
    d.inhalt.appendChild(fs);
    var meld = el("div", "vlmeldung"); meld.id = "vlPruefMeldung"; d.inhalt.appendChild(meld);
    d.knopf("Prüfung anlegen", "start", function(){
      var termin = gewaehlt.termin;
      if (!termin){ meld.textContent = "Bitte einen Termin wählen."; return; }
      var art = sw.querySelector("[aria-pressed='true']").getAttribute("data-v"), stoff;
      if (art === "zeitraum") stoff = { von: $("#vlStoffVon").value || null, bis: $("#vlStoffBis").value || null };
      else if (art === "einheiten") stoff = { einheiten: [].filter.call(pe.querySelectorAll("input"), function(x){ return x.checked; }).map(function(x){ return x.value; }) };
      else stoff = { quellen: ["grundwortschatz"] };
      if (art === "einheiten" && !stoff.einheiten.length){ meld.textContent = "Bitte mindestens eine Einheit ankreuzen."; return; }
      var r = V.pruefungAnlegen(zustand, allUnits(), { termin: termin, thema: gewaehlt.thema, stoff: stoff }, Date.now(), plan, { sprache: SP, pausen: pausen });
      if (r.fehler){ meld.textContent = r.fehler; return; }
      pruefungen = [r.pruefung];
      set(SCHL.pruefung, JSON.stringify(pruefungen));
      d.zu();
      uebersichtMalen();
      var z = r.zahlen;
      var text = "Prüfung am " + datumText(z.termin) + ", " + z.text + ". Im Stoff sind " + z.stoff + " Wörter" +
        (z.sicher ? ", " + z.sicher + " davon schon im Ordner" : "") + "." +
        (z.neuProTag ? " Empfehlung: etwa " + z.neuProTag + " neue Wörter pro Tag – mehr geht immer." : "");
      var hinweise = (r.hinweise || []).slice();
      var e = dialogOeffnen("vlPruefFertig", "Prüfung angelegt");
      e.inhalt.appendChild(el("p", "vlhinweistext", text));
      hinweise.forEach(function(x){ var p = el("p", "vlhinweistext vlhinweis-" + x.art, x.text); e.inhalt.appendChild(p); });
      e.knopf("OK", "start", e.zu, "vlPruefFertigOk");
    }, "vlPruefOk");
    d.knopf("Abbrechen", "ghost", d.zu, "vlPruefAbbrechen");
  }

  lernplanBauen();
  uebersichtMalen();
  /* Nur zum Nachsehen (Messung): die aktuelle Abfrage, als Kopie. */
  window.VokabelTrainer = { abfrage: function(){ return ab ? JSON.parse(JSON.stringify(ab)) : null; }, migriert: function(){ return migriert; } };

  /* ---------- Neue Einheit aus gescanntem Text ---------- */
  function attrEsc(s){ return (s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }
  function cleanTok(s){
    return (s||"")
      .replace(/^[\s•·\-\*\u2013\u2014\d\.\)\(]+/,"")   /* führende Bullets/Nummern/Striche */
      .replace(/\/[^\/]*\//g,"")                          /* /Lautschrift/ */
      .replace(/\[[^\]]*\]/g,"")                          /* [Lautschrift] */
      .replace(/\s+/g," ").trim();
  }
  function smartSplitLine(l){
    var toks=(l||"").split(/\s+/).filter(Boolean);
    if(toks.length<2) return null;
    var artRe=/^(der|die|das|dem|den|des|ein|eine|einen|einem|sich)$/i;
    for(var i=1;i<toks.length;i++){ if(artRe.test(toks[i])) return [toks.slice(0,i).join(" "), toks.slice(i).join(" ")]; }
    for(var j=1;j<toks.length;j++){ if(/[äöüßÄÖÜ]/.test(toks[j])) return [toks.slice(0,j).join(" "), toks.slice(j).join(" ")]; }
    return [toks.slice(0,toks.length-1).join(" "), toks[toks.length-1]];
  }
  // Was beim Erkennen liegen blieb. Wird angezeigt, statt still zu verschwinden -
  // eine Vokabel, die aus dem Foto faellt, faellt sonst aus dem Lernen.
  var nichtErkannt = [];

  function parseVocab(text){
    nichtErkannt = [];
    var lines=(text||"").split(/\r?\n/).map(function(l){return l.trim();}).filter(Boolean);
    if(!lines.length) return [];
    var sepRe=/\s*(?:=|→|\u2192|::|:|\t|\u2013|\u2014| {2,}| - | , )\s*/;
    var withSep=0, singleTok=0;
    lines.forEach(function(l){ if(sepRe.test(l)) withSep++; if(l.split(/\s+/).filter(Boolean).length<2) singleTok++; });
    var half=Math.max(2, Math.floor(lines.length*0.5));
    var pairs=[];
    if(withSep>=half){
      lines.forEach(function(l){
        if(l.search(sepRe)>=0){
          var m=l.split(sepRe);
          var en=cleanTok(m[0]), de=cleanTok(m.slice(1).join(" "));
          if(en&&de){ pairs.push({en:en,de:de}); return; }
        }
        // Kein sauberer Trenner: noch einmal mit der Wortarten-Heuristik.
        var s2=smartSplitLine(cleanTok(l));
        if(s2 && cleanTok(s2[0]) && cleanTok(s2[1])) pairs.push({en:cleanTok(s2[0]), de:cleanTok(s2[1])});
        else nichtErkannt.push(l);
      });
    } else if(singleTok >= Math.ceil(lines.length*0.4)){
      for(var i=0;i+1<lines.length;i+=2){ var en2=cleanTok(lines[i]), de2=cleanTok(lines[i+1]);
        if(en2&&de2) pairs.push({en:en2,de:de2}); else { if(lines[i]) nichtErkannt.push(lines[i]); if(lines[i+1]) nichtErkannt.push(lines[i+1]); } }
      if(lines.length % 2) nichtErkannt.push(lines[lines.length-1]);
    } else {
      lines.forEach(function(l){ var s=smartSplitLine(cleanTok(l));
        var en3=s?cleanTok(s[0]):"", de3=s?cleanTok(s[1]):"";
        if(en3&&de3) pairs.push({en:en3,de:de3}); else nichtErkannt.push(l); });
    }
    return pairs;
  }

  /* Spalten über die größte horizontale Lücke je Zeile trennen (aus Foto-Positionen) */
  function splitByGap(words){
    var ws=(words||[]).filter(function(w){return w.text && w.text.trim() && w.bbox;}).sort(function(a,b){return a.bbox.x0-b.bbox.x0;});
    if(ws.length<2) return null;
    var maxGap=-1, idx=-1;
    for(var i=0;i<ws.length-1;i++){ var g=ws[i+1].bbox.x0 - ws[i].bbox.x1; if(g>maxGap){ maxGap=g; idx=i; } }
    var avgH=ws.reduce(function(s,w){return s+(w.bbox.y1-w.bbox.y0);},0)/ws.length;
    if(maxGap < avgH*0.8) return null;
    var en=ws.slice(0,idx+1).map(function(w){return w.text;}).join(" ").replace(/\s+/g," ").trim();
    var de=ws.slice(idx+1).map(function(w){return w.text;}).join(" ").replace(/\s+/g," ").trim();
    return (en&&de)?{en:en,de:de}:null;
  }
  function pairsFromOCR(data){
    if(!data) return [];
    var lines=data.lines||[]; var pairs=[];
    lines.forEach(function(l){ var p=splitByGap(l.words||[]); if(p) pairs.push(p); });
    if(pairs.length>=2) return pairs;
    return parseVocab(data.text||"");   /* Fallback, falls kein klares Spaltenbild */
  }

  /* ---------- Vorschau: prüfen, nachsehen, speichern ----------
     Seit 19.10.2026 kann die Vorschau eine Rückfrage tragen (Helena über
     Denny: „Solltest du hier Fehler bemerken oder dir unsicher sein, kommt
     auch eine Rückfrage an die Helena, weil sie in dem Moment das Buch offen
     hat“). Paare, bei denen die zwei Lesungen abweichen, eine unsicher war
     oder die Bedeutung nicht zu passen scheint, stehen oben im Kasten „Bitte
     kurz im Buch nachsehen“. Helena wählt eine Lesung, tippt selbst oder
     lässt das Paar weg. Erst danach lässt sich speichern - nichts
     Unbestätigtes rutscht in die Einheit, und nichts wird still geändert:
     der Hinweis „Erwartet eher …“ ist nur ein Hinweis, das Buch gilt.
     Gewählte Paare werden normale Zeilen an ihrem Platz in der Liste. */
  /* Wortart je Paar (19.10.2026): der Foto-Server bestimmt sie im selben
     Aufruf, Helena sieht sie in der Vorschau und kann sie korrigieren; sie
     wird mitgespeichert und hilft bei plausiblen Ablenkern in Stufe 1. */
  var WORTARTEN = [["","Wortart \u2013"],["nomen","Nomen"],["verb","Verb"],["adjektiv","Adjektiv"],["adverb","Adverb"],["wendung","Wendung"],["sonstiges","Sonstiges"]];
  function wortartName(w){ for(var i=1;i<WORTARTEN.length;i++) if(WORTARTEN[i][0]===w) return WORTARTEN[i][1]; return ""; }
  var pvHerkunft = "foto";
  var pvOffen = 0;
  function pvOffenMalen(){
    var z=$("#vfOffen"), b=$("#saveUnit");
    if(z){ z.textContent = pvOffen ? ("Noch "+pvOffen+" Rückfrage"+(pvOffen>1?"n":"")+" offen – erst dann kannst du speichern.") : ""; z.style.display = pvOffen ? "block" : "none"; }
    if(b){ b.disabled = pvOffen>0; }
    bandMalen();
  }
  /* ---------- Noch nicht gespeichert (21.10.2026) ----------
     Helena am 21.10.2026: sie hatte ihr Buchblatt fotografiert, die Liste
     durchgeschaut, ein paar Zeilen mit dem ✕ weggenommen - und danach war
     nichts in ihren Einheiten. Gemessen: die Vorschau lebte nur im Fenster.
     Wer den Knopf "Einheit speichern" nicht findet oder weggeht, verliert
     die ganze Seite still. Drei Riegel dagegen:
       1. ein Band unten am Schirm, solange etwas offen ist ("48 Wörter -
          noch nicht gespeichert"), mit dem Speicher-Knopf darin,
       2. eine Frage, bevor die Vorschau weggeworfen wird (Abbrechen, neue
          Seite dazu, Seite verlassen),
       3. ein Entwurf im Speicher: beim Verlassen wird die Wortliste gesichert
          und beim nächsten Besuch oben im Foto-Kasten angeboten.
     Sparsam geschrieben wird wie bei der Sitzung: nur beim Verlassen, und nur
     wenn sich etwas geändert hat. */
  var VF_ENTWURF = PRE + "-vf-entwurf";
  var ENTWURF_FRIST = 14 * 24 * 3600e3;
  var entwurfGeschrieben = "";
  var pvBand = null, pvLuft = null;

  function pvVorschauOffen(){
    var box = $("#preview");
    return !!(box && box.style.display !== "none" && $("#pvrows"));
  }
  function pvPaare(){
    var rows = $("#pvrows"); if(!rows) return [];
    var raus = [];
    [].forEach.call(rows.children, function(r){
      var a = r.querySelector(".pven"), b = r.querySelector(".pvde"), wa = r.querySelector(".pvwa");
      if(!a || !b) return;
      var en = a.value.trim(), de = b.value.trim();
      if(en && de) raus.push({ en:en, de:de, wortart: wa ? wa.value : "" });
    });
    return raus;
  }
  function bandWeg(){
    if(pvBand && pvBand.parentNode) pvBand.parentNode.removeChild(pvBand);
    if(pvLuft && pvLuft.parentNode) pvLuft.parentNode.removeChild(pvLuft);
    pvBand = null; pvLuft = null;
  }
  function bandMalen(){
    if(!pvVorschauOffen()){ bandWeg(); return; }
    var n = pvPaare().length;
    if(!n && !pvOffen){ bandWeg(); return; }
    if(!pvBand){
      pvBand = el("div", "vfband"); pvBand.id = "vfBand";
      pvBand.appendChild(el("span", "vfbandtext"));
      var k = el("button", "vfbandknopf"); k.type = "button";
      pvBand.appendChild(k);
      k.addEventListener("click", function(){
        if(pvOffen > 0){
          var kasten = $("#vfKasten");
          if(kasten){ try{ kasten.scrollIntoView({ block:"start", behavior:"smooth" }); }catch(e){} }
          return;
        }
        saveFromPreview();
      });
      pvLuft = el("div", "vfbandluft");
      document.body.appendChild(pvBand);
      document.body.appendChild(pvLuft);
    }
    var t = pvBand.querySelector(".vfbandtext"), k2 = pvBand.querySelector(".vfbandknopf");
    if(pvOffen > 0){
      t.textContent = n + (n === 1 ? " Wort" : " Wörter") + " · noch " + pvOffen + " Rückfrage" + (pvOffen > 1 ? "n" : "");
      k2.textContent = "Hinschauen";
      pvBand.classList.add("wartet");
    } else {
      t.textContent = n + (n === 1 ? " Wort" : " Wörter") + " – noch nicht gespeichert";
      k2.textContent = "Speichern";
      pvBand.classList.remove("wartet");
    }
  }

  function entwurfSammeln(){
    if(!pvVorschauOffen()) return null;
    var paare = pvPaare();
    if(paare.length < 2) return null;
    var nf = $("#unitName");
    return { zeit: Date.now(), name: nf ? (nf.value || "").trim() : "",
             herkunft: pvHerkunft, offen: pvOffen, paare: paare };
  }
  function entwurfSichern(){
    var e = entwurfSammeln(); if(!e) return;
    var t = JSON.stringify(e);
    if(t === entwurfGeschrieben) return;
    set(VF_ENTWURF, t); entwurfGeschrieben = t;
  }
  function entwurfVergessen(){
    if(get(VF_ENTWURF, null) != null){ try{ localStorage.removeItem(VF_ENTWURF); }catch(e){} }
    entwurfGeschrieben = "";
    var k = $("#vfEntwurfKarte"); if(k && k.parentNode) k.parentNode.removeChild(k);
  }
  function entwurfAnbieten(){
    var e = jsonLesen(VF_ENTWURF, null);
    if(!e || !e.paare || e.paare.length < 2) return;
    if(Date.now() - (e.zeit || 0) > ENTWURF_FRIST){ entwurfVergessen(); return; }
    var kasten = document.querySelector(".adderbody"); if(!kasten) return;
    var alt = $("#vfEntwurfKarte"); if(alt && alt.parentNode) alt.parentNode.removeChild(alt);
    var k = el("div", "vfentwurf"); k.id = "vfEntwurfKarte";
    k.appendChild(el("div", "vfentwurfkopf", "📝 " + e.paare.length + " Wörter von vorhin sind noch nicht gespeichert"));
    k.appendChild(el("p", "vfentwurfunter",
      "Du hattest sie fotografiert und durchgeschaut, aber noch nicht gespeichert. Die Wörter sind da, die Fotos nicht." +
      (e.offen ? " Zeilen, bei denen ich dich gefragt hatte, fehlen – schau die Liste bitte noch einmal durch." : "")));
    var reihe = el("div", "vfentwurfknoepfe");
    var w = el("button", "photobtn", "Weitermachen und speichern"); w.type = "button";
    w.addEventListener("click", function(){
      var nf = $("#unitName"); if(nf && e.name) nf.value = e.name;
      renderPreview(e.paare.map(function(p){ return { en:p.en, de:p.de, wortart:p.wortart || "" }; }),
                    { herkunft: e.herkunft === "text" ? "text" : "foto" });
      if(k.parentNode) k.parentNode.removeChild(k);
      try{ $("#preview").scrollIntoView({ block:"start", behavior:"smooth" }); }catch(x){}
    });
    var n = el("button", "mini", "Wegwerfen"); n.type = "button";
    n.addEventListener("click", function(){
      var d = dialogOeffnen("vfEntwurfWeg", "Entwurf wegwerfen");
      d.inhalt.appendChild(el("p", "vlhinweistext", "Sollen die " + e.paare.length + " Wörter wirklich weg? Dann müsstest du die Seite neu fotografieren."));
      d.knopf("Nein, behalten", "start", function(){ d.zu(); });
      d.knopf("Ja, wegwerfen", "ghost", function(){ d.zu(); entwurfVergessen(); blip(); });
    });
    reihe.appendChild(w); reihe.appendChild(n); k.appendChild(reihe);
    kasten.insertBefore(k, kasten.firstChild);
  }
  /* Vorschau wegwerfen - immer erst fragen, danach ist sie wirklich weg. */
  function vorschauWegFragen(titel, satz, danach){
    var paare = pvPaare();
    if(!pvVorschauOffen() || paare.length < 2){ danach(); return; }
    var d = dialogOeffnen("vfVorschauWeg", titel);
    d.inhalt.appendChild(el("p", "vlhinweistext", paare.length + " Wörter stehen hier und sind noch nicht gespeichert. " + satz));
    d.knopf("Erst speichern", "start", function(){ d.zu(); saveFromPreview(); });
    d.knopf("Nein, hierbleiben", "ghost", function(){ d.zu(); });
    d.knopf("Ja, wegwerfen", "ghost", function(){ d.zu(); danach(); blip(); });
  }
  function vorschauSchliessen(){
    var box = $("#preview"); if(box){ box.style.display = "none"; box.innerHTML = ""; }
    pvOffen = 0; bandWeg();
  }

  /* ---------- Erst fragen, dann weg (21.10.2026) ----------
     Helena am 21.10.2026: „Ich habe aus Versehen voc. In englisch
     gelöscht was mach ich jetzt“ – 1 bis 3 Vokabeln, und auf ihre Wahl
     hin: „Das sie nach fragt“. Das kleine ✕ lag auf ihrem 360er Handy
     direkt neben dem deutschen Feld und nahm die Zeile sofort weg, ohne
     Frage und ohne Rückweg. Jetzt fragt es in der Zeile selbst nach, und
     nach dem Ja bleibt die Zeile als Streifen mit „Zurückholen“ stehen,
     solange die Vorschau offen ist. Eine leere Zeile geht ohne Frage –
     da ist nichts zu verlieren. */
  function zeileFuellen(r, en, de, wortart){
    r.className="pvrow";
    r.innerHTML='<input class="pven" placeholder="'+K.spracheKlein+'" value="'+attrEsc(en)+'">'+
      '<span class="pvarr">→</span>'+
      '<input class="pvde" placeholder="deutsch" value="'+attrEsc(de)+'">'+
      '<select class="pvwa" aria-label="Wortart">'+WORTARTEN.map(function(w){ return '<option value="'+w[0]+'"'+(w[0]===(wortart||"")?' selected':'')+'>'+w[1]+'</option>'; }).join("")+'</select>'+
      '<button class="pvx" type="button" title="Zeile weglassen" aria-label="Zeile weglassen">✕</button>';
    r.querySelector(".pvx").addEventListener("click",function(){ zeileWegFragen(r); });
    bandMalen();
    return r;
  }
  function zeileWortlaut(r){
    var a=r.querySelector(".pven"), b=r.querySelector(".pvde");
    var en=a?a.value.trim():"", de=b?b.value.trim():"";
    if(en&&de) return en+" → "+de;
    return en||de||"";
  }
  function zeileWegFragen(r){
    if(r.querySelector(".pvfrage")) return;                  // es wird schon gefragt
    var txt=zeileWortlaut(r);
    if(!txt){ if(r.parentNode) r.parentNode.removeChild(r); return; }
    var f=el("div","pvfrage");
    f.appendChild(el("span","pvfragetext","„"+txt+"“ wirklich weglassen?"));
    var nein=el("button","mini pvbleibt","Nein, behalten"); nein.type="button";
    var ja=el("button","mini pvweg","Ja, weglassen"); ja.type="button";
    f.appendChild(nein); f.appendChild(ja);
    r.classList.add("pvfragend"); r.appendChild(f);
    nein.addEventListener("click",function(){ r.classList.remove("pvfragend"); if(f.parentNode) f.parentNode.removeChild(f); });
    ja.addEventListener("click",function(){ zeileWeglegen(r, txt); blip(); });
  }
  function zeileWeglegen(r, txt){
    var a=r.querySelector(".pven"), b=r.querySelector(".pvde"), wa=r.querySelector(".pvwa");
    var en=a?a.value:"", de=b?b.value:"", w=wa?wa.value:"";
    r.className="pvweggelegt";                                // kein .pvrow mehr: weder Speichern noch Tauschen fassen sie an
    r.innerHTML="";
    r.appendChild(el("span","pvwegtext","✕ „"+txt+"“ weggelassen"));
    var zurueck=el("button","mini pvzurueck","Zurückholen"); zurueck.type="button";
    zurueck.addEventListener("click",function(){ zeileFuellen(r, en.trim(), de.trim(), w); bandMalen(); blip(); });
    r.appendChild(zurueck);
    bandMalen();
  }
  function zeileEinfuegen(en,de,pos,wortart){
    var rows=$("#pvrows"); if(!rows) return null;
    var r=document.createElement("div"); r.className="pvrow";
    r.setAttribute("data-pos", pos==null ? "1e9" : String(pos));
    zeileFuellen(r, en, de, wortart);
    // An ihren Platz auf dem Blatt (Seite, Zeile), neue Zeilen ans Ende.
    var p = pos==null ? 1e9 : pos, vor=null;
    [].some.call(rows.children,function(x){ if(parseFloat(x.getAttribute("data-pos"))>p){ vor=x; return true; } return false; });
    rows.insertBefore(r, vor);
    return r;
  }

  // Der Ausschnitt der Zeile aus dem eigenen Foto (Ort vom Server in Promille).
  function ausschnitt(url, ort, ziel){
    if(!url || !ort || ort.length!==4) return;
    var bild=new Image();
    bild.onload=function(){
      try{
        var w=bild.width, h=bild.height;
        var bx=(ort[2]-ort[0]), by=(ort[3]-ort[1]);
        var x0=Math.max(0,ort[0]-Math.max(20,bx*0.08)), x1=Math.min(1000,ort[2]+Math.max(20,bx*0.08));
        var y0=Math.max(0,ort[1]-Math.max(15,by*0.6)), y1=Math.min(1000,ort[3]+Math.max(15,by*0.6));
        var sx=x0/1000*w, sy=y0/1000*h, sw=(x1-x0)/1000*w, sh=(y1-y0)/1000*h;
        if(sw<8||sh<8) return;
        var c=document.createElement("canvas"); c.className="vfbild";
        var f=Math.min(1, 900/sw); c.width=Math.round(sw*f); c.height=Math.round(sh*f);
        c.getContext("2d").drawImage(bild,sx,sy,sw,sh,0,0,c.width,c.height);
        c.setAttribute("role","img"); c.setAttribute("aria-label","Diese Zeile auf deinem Foto");
        ziel.appendChild(c);
      }catch(e){}
    };
    bild.src=url;
  }

  function rueckfrageBauen(r, urls, liste){
    var el=document.createElement("div"); el.className="vfrf";
    var gute=(r.lesungen||[]).filter(function(l){ return l && l.fremd && l.deutsch && !/\?/.test(l.fremd+l.deutsch); });
    var alle=(r.lesungen||[]).filter(function(l){ return l && (l.fremd||l.deutsch); });
    var kopf='<div class="vfrfkopf"><span class="vfseite">Seite '+(r.seite||1)+'</span> '+attrEsc(r.hinweis||"Bitte nachsehen.")+'</div>';
    var gelesen = alle.length>1
      ? '<div class="vfles">'+alle.map(function(l,i){ return '<div><small>'+(i+1)+'. Lesung:</small> '+attrEsc(l.fremd||"–")+' → '+attrEsc(l.deutsch||"–")+'</div>'; }).join("")+'</div>'
      : (alle.length && !gute.length ? '<div class="vfles"><div><small>Gelesen:</small> '+attrEsc(alle[0].fremd||"–")+' → '+attrEsc(alle[0].deutsch||"–")+'</div></div>' : '');
    var erw = r.erwartet ? '<div class="vferw">Erwartet eher: <b>'+attrEsc(r.erwartet)+'</b> – nimm aber, was im Buch steht.</div>' : '';
    el.innerHTML=kopf+'<div class="vfbildplatz"></div>'+gelesen+erw+
      '<div class="vfwahl"></div>'+
      '<div class="vftipp" style="display:none"><input class="vften" placeholder="'+K.spracheKlein+'"><input class="vfde" placeholder="deutsch">'+
        '<button type="button" class="vfuebernehmen">Übernehmen</button></div>'+
      '<div class="vffertig" style="display:none"></div>';
    ausschnitt(urls && urls[(r.seite||1)-1], r.ort, el.querySelector(".vfbildplatz"));
    var wahl=el.querySelector(".vfwahl"), tipp=el.querySelector(".vftipp"), fertig=el.querySelector(".vffertig");
    var zeile=null, erledigt=false;
    function setzen(en,de,text,wortart){
      if(!erledigt){ erledigt=true; pvOffen--; }
      if(zeile && zeile.parentNode) zeile.parentNode.removeChild(zeile);
      zeile = (en && de) ? zeileEinfuegen(en,de,r.pos,wortart) : null;
      if(wortart && wortartName(wortart)) text += ' <small class="vfwa">· '+wortartName(wortart)+' (unten änderbar)</small>';
      wahl.style.display="none"; tipp.style.display="none"; fertig.style.display="flex";
      fertig.innerHTML='<span>'+text+'</span><button type="button" class="mini vfaendern">ändern</button>';
      fertig.querySelector(".vfaendern").addEventListener("click",oeffnen);
      el.classList.add("erledigt");
      pvOffenMalen();
    }
    function oeffnen(){
      if(erledigt){ erledigt=false; pvOffen++; }
      if(zeile && zeile.parentNode) zeile.parentNode.removeChild(zeile);
      zeile=null;
      wahl.style.display="flex"; fertig.style.display="none"; el.classList.remove("erledigt");
      pvOffenMalen();
    }
    gute.forEach(function(l){
      var b=document.createElement("button"); b.type="button"; b.className="vfopt";
      b.textContent=(gute.length>1?"So steht es da: ":"Stimmt so: ")+l.fremd+" → "+l.deutsch+(l.wortart && wortartName(l.wortart) ? " · "+wortartName(l.wortart) : "");
      b.addEventListener("click",function(){ setzen(l.fremd,l.deutsch,"✓ "+attrEsc(l.fremd)+" → "+attrEsc(l.deutsch),l.wortart||""); blip(); });
      wahl.appendChild(b);
    });
    var bt=document.createElement("button"); bt.type="button"; bt.className="vfopt vfneben"; bt.textContent="✎ Selbst eintippen";
    bt.addEventListener("click",function(){
      var v=gute[0]||alle[0]||{fremd:"",deutsch:""};
      tipp.querySelector(".vften").value=String(v.fremd||"").replace(/\?/g,"");
      tipp.querySelector(".vfde").value=String(v.deutsch||"").replace(/\?/g,"");
      tipp.style.display="flex"; tipp.querySelector(gute.length?".vfde":".vften").focus();
    });
    wahl.appendChild(bt);
    var bw=document.createElement("button"); bw.type="button"; bw.className="vfopt vfneben"; bw.textContent="Weglassen";
    bw.addEventListener("click",function(){ setzen("","","Weggelassen"); blip(); });
    wahl.appendChild(bw);
    tipp.querySelector(".vfuebernehmen").addEventListener("click",function(){
      var en=tipp.querySelector(".vften").value.trim(), de=tipp.querySelector(".vfde").value.trim();
      if(!en||!de){ (en?tipp.querySelector(".vfde"):tipp.querySelector(".vften")).focus(); return; }
      var v0=gute[0]||alle[0]||{};
      setzen(en,de,"✓ "+attrEsc(en)+" → "+attrEsc(de)+" <small>(selbst getippt)</small>",v0.wortart||""); blip();
    });
    pvOffen++;
    liste.appendChild(el);
  }

  /* opt: { meldung, fehlend:[nr], einmal:[nr], pruefen:[…], urls:[dataURL je Seite], ohnePruefung, nochmal:fn } */
  function renderPreview(pairs, opt){
    opt=opt||{};
    pvOffen=0;
    var box=$("#preview"); box.style.display="block";
    var hinweise="";
    if(opt.fehlend && opt.fehlend.length){
      hinweise+='<div class="vfwarn" id="vfFehlend"><b>Seite '+opt.fehlend.join(", ")+' ließ sich nicht lesen.</b> '+
        'Die Wörter davon fehlen noch.'+(opt.nochmal?' <button type="button" class="mini" id="vfNochmal">Seite '+opt.fehlend.join(", ")+' nochmal lesen</button>':'')+'</div>';
    }
    if(opt.einmal && opt.einmal.length){
      hinweise+='<div class="pvrest"><b>Seite '+opt.einmal.join(", ")+' wurde nur einmal gelesen.</b> Vergleiche sie bitte selbst kurz mit dem Buch.</div>';
    }
    if(opt.ohnePruefung){
      hinweise+='<div class="pvrest"><b>Ohne Prüfung gelesen</b> (der Server war gerade nicht erreichbar). Vergleiche bitte jede Zeile mit dem Buch.</div>';
    }
    box.innerHTML=
      '<div class="pvhead"><span><b>'+(opt.meldung ? attrEsc(opt.meldung)+' · ' : '')+pairs.length+' Paare sicher</b> – bitte prüfen</span>'+
      '<button class="mini" id="swapBtn" type="button">↔ Spalten tauschen</button></div>'+
      hinweise+
      (nichtErkannt.length
        ? '<div class="pvrest"><b>'+nichtErkannt.length+' Zeile'+(nichtErkannt.length>1?'n':'')+
          ' konnte ich nicht aufteilen.</b> Trag sie unten von Hand ein – oder lass sie weg.'+
          nichtErkannt.slice(0,8).map(function(z){ return '<div>'+attrEsc(z)+'</div>'; }).join("")+
          (nichtErkannt.length>8 ? '<div>…</div>' : '')+'</div>'
        : '')+
      ((opt.pruefen && opt.pruefen.length)
        ? '<div class="vfkasten" id="vfKasten"><div class="vfkastenkopf">📖 Bitte kurz im Buch nachsehen ('+opt.pruefen.length+')</div>'+
          '<div class="vfkastenunter">Hier war ich mir nicht sicher. Schau ins Buch und wähle, was dort steht.</div><div id="vfListe"></div></div>'
        : '')+
      '<div id="pvrows"></div>'+
      '<button class="mini" id="addRow" type="button">＋ Zeile</button>'+
      '<div class="vfoffen" id="vfOffen" style="display:none"></div>'+
      '<div class="pvsave"><button id="saveUnit" type="button">Einheit speichern</button>'+
      '<button class="ghost" id="cancelUnit" type="button">Abbrechen</button></div>';
    pvHerkunft = opt.herkunft === "text" ? "text" : "foto";
    var nach=$("#vlNachUpload"); if(nach) nach.parentNode.removeChild(nach);
    pairs.forEach(function(p,i){ zeileEinfuegen(p.en,p.de,p.pos!=null?p.pos:i,p.wortart||""); });
    if(opt.pruefen && opt.pruefen.length){
      var liste=$("#vfListe");
      opt.pruefen.forEach(function(r){ rueckfrageBauen(r, opt.urls, liste); });
    }
    pvOffenMalen();
    if(opt.nochmal && $("#vfNochmal")) $("#vfNochmal").addEventListener("click",opt.nochmal);
    $("#addRow").addEventListener("click",function(){ zeileEinfuegen("","",null); });
    $("#swapBtn").addEventListener("click",function(){
      [].forEach.call($("#pvrows").querySelectorAll(".pvrow"),function(r){
        var a=r.querySelector(".pven"), b=r.querySelector(".pvde");
        if(!a || !b) return;
        var t=a.value; a.value=b.value; b.value=t;
      });
    });
    $("#cancelUnit").addEventListener("click",function(){
      vorschauWegFragen("Liste wegwerfen", "Beim Wegwerfen ist die Liste weg und du müsstest die Seite neu fotografieren.", vorschauSchliessen);
    });
    $("#saveUnit").addEventListener("click",saveFromPreview);
    $("#pvrows").addEventListener("input",bandMalen);
  }

  function saveFromPreview(){
    var msg=$("#addMsg");
    // Nichts Unbestätigtes rutscht in die Einheit.
    if(pvOffen>0){ msg.textContent="Bitte erst die Rückfragen oben beantworten."; msg.style.color="var(--ink)"; var k=$("#vfKasten"); if(k) k.scrollIntoView({block:"start"}); return; }
    var name=($("#unitName").value||"").trim() || "Neue Einheit";
    var pairs=[];
    [].forEach.call($("#pvrows").children,function(r){
      var fa=r.querySelector(".pven"), fb=r.querySelector(".pvde");
      if(!fa || !fb) return;                 // weggelegte Zeile: steht nur als Streifen da
      var en=fa.value.trim(), de=fb.value.trim();
      var wa=r.querySelector(".pvwa"), w=wa ? wa.value : "";
      if(en && de) pairs.push(w ? {en:en, de:de, wortart:w} : {en:en, de:de});
    });
    if(pairs.length<2){ msg.textContent="Bitte mindestens 2 Paare."; msg.style.color="var(--ink)"; return; }
    /* Upload-Datum und Herkunft (Foto oder Text) gehoeren zur Einheit (Logik
       einheitNeu) - danach fuehrt "Jetzt lernen" direkt in ihr erstes Paket. */
    var units=customUnits(), unit=V.einheitNeu(name, pairs, Date.now(), pvHerkunft, SP), id=unit.id;
    units.push(unit);
    set(PRE+"-custom-units",JSON.stringify(units));
    fillUnits(id); renderMyUnits();
    $("#unitName").value=""; $("#pasteBox").value="";
    var box=$("#preview"); box.style.display="none"; box.innerHTML="";
    pvOffen=0; bandWeg(); entwurfVergessen();
    seitenLeeren();
    msg.textContent="Gespeichert: „"+name+"“ ("+pairs.length+" Vokabeln) ✓"; msg.style.color="var(--ok)";
    var alt=$("#vlNachUpload"); if(alt) alt.parentNode.removeChild(alt);
    var los=document.createElement("button"); los.type="button"; los.id="vlNachUpload"; los.className="start vlnachupload";
    los.textContent="Jetzt lernen ›";
    los.addEventListener("click",function(){ lernenStarten(id); });
    // Ganz oben im Foto-Kasten: sofort im Bild, auch auf kleinen Schirmen.
    var kasten=document.querySelector(".adderbody")||msg.parentNode.parentNode;
    kasten.insertBefore(los, kasten.firstChild);
    try{ los.scrollIntoView({block:"nearest"}); }catch(e){}
    uebersichtMalen();
    blip();
  }

  $("#detectBtn").addEventListener("click",function(){
    var pairs=parseVocab($("#pasteBox").value);
    var msg=$("#addMsg");
    if(!pairs.length){ msg.textContent="Nichts erkannt – bitte Text einfügen und erneut auf Erkennen tippen."; msg.style.color="var(--ink)"; return; }
    msg.textContent=""; renderPreview(pairs, { herkunft:"text" });
  });

  /* ---------- Fotos aufnehmen -> Server liest (Opus 5.5), Rückfall Tesseract ----------
     Seit 19.10.2026 liest zuerst der Server (Opus 5.5, /api/vokabel-foto) -
     dasselbe Modell wie bei Pauls Blättern. Tesseract im Browser bleibt nur
     der Rückfall, wenn der Server nicht antwortet oder das Limit erreicht ist.
     Seit dem Abend desselben Tages (Helenas Wunsch): 1 bis 5 Seiten, einzeln
     mit der Kamera oder mehrere aus der Galerie. Der Server liest jede Seite
     zweimal unabhängig und prüft den Sinn jedes Paares. */
  function setOcr(txt){ var s=$("#ocrStatus"); if(!txt){ s.style.display="none"; s.textContent=""; return; } s.style.display="block"; s.textContent=txt; }
  function loadTesseract(cb){
    if(window.Tesseract){ cb(true); return; }
    var s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    s.onload=function(){ cb(!!window.Tesseract); };
    s.onerror=function(){ cb(false); };
    document.head.appendChild(s);
  }
  var SPRACHE_SERVER = K.fach==="franzoesisch" ? "franzoesisch" : "englisch";
  var TESS_SPRACHEN  = K.fach==="franzoesisch" ? "fra+deu" : "eng+deu";
  var SERVER_FRIST   = 90000;   /* Server liest alle Seiten parallel und hört nach 80 s auf */
  var MAX_SEITEN     = 5;

  // Groß genug für Handschrift, klein genug für die Leitung (wie im Hausaufgaben-Heft).
  function fotoVerkleinern(file, fertig){
    var l=new FileReader();
    l.onerror=function(){ fertig(null); };
    l.onload=function(){
      var bild=new Image();
      bild.onerror=function(){ fertig(null); };
      bild.onload=function(){
        try{
          var f=Math.min(1, 2000/Math.max(bild.width,bild.height));
          var c=document.createElement("canvas"); c.width=Math.round(bild.width*f); c.height=Math.round(bild.height*f);
          c.getContext("2d").drawImage(bild,0,0,c.width,c.height);
          var url="", q=0.85;
          do { url=c.toDataURL("image/jpeg",q); q-=0.1; } while(url.length>880*1024 && q>0.3);
          fertig(url);
        }catch(e){ fertig(null); }
      };
      bild.src=String(l.result);
    };
    l.readAsDataURL(file);
  }

  /* Die gesammelten Seiten. Jede: { file, url } (url = verkleinertes JPEG). */
  var vfSeiten = [];
  (function aufbauen(){
    var knopf=$("#photoBtn"); if(!knopf) return;
    // Die zweite Eingabe: Galerie, mehrere auf einmal, ohne Kamera-Zwang.
    var gal=document.createElement("input"); gal.type="file"; gal.id="galerieInput"; gal.accept="image/*"; gal.multiple=true; gal.style.display="none";
    var reihe=document.createElement("div"); reihe.className="vfknoepfe";
    knopf.parentNode.insertBefore(reihe, knopf);
    reihe.appendChild(knopf);
    var gb=document.createElement("button"); gb.type="button"; gb.id="galerieBtn"; gb.className="photobtn vfgalerie"; gb.textContent="🖼️ Aus der Galerie";
    reihe.appendChild(gb); reihe.appendChild(gal);
    var liste=document.createElement("div"); liste.id="vfSeiten"; liste.className="vfseiten";
    reihe.parentNode.insertBefore(liste, reihe.nextSibling);
    var los=document.createElement("button"); los.type="button"; los.id="lesenBtn"; los.className="photobtn vflesen"; los.style.display="none";
    liste.parentNode.insertBefore(los, liste.nextSibling);
    gb.addEventListener("click",function(){ gal.click(); });
    gal.addEventListener("change",function(e){ dateienDazu(e.target.files); e.target.value=""; });
    los.addEventListener("click",lesenStarten);
    seitenMalen();
  })();

  function dateienDazu(files){
    var msg=$("#addMsg"); msg.textContent="";
    var neu=[].slice.call(files||[]).filter(function(f){ return f && /^image\//.test(f.type||"image/"); });
    var platz=MAX_SEITEN-vfSeiten.length;
    if(neu.length>platz){
      msg.textContent="Höchstens "+MAX_SEITEN+" Seiten – "+(neu.length-platz)+" Foto"+(neu.length-platz>1?"s":"")+" habe ich weggelassen."; msg.style.color="var(--ink)";
      neu=neu.slice(0,Math.max(0,platz));
    }
    var offen=neu.length; if(!offen) return;
    var reserv=neu.map(function(f){ var s={file:f, url:null}; vfSeiten.push(s); return s; });
    seitenMalen();
    reserv.forEach(function(s){
      fotoVerkleinern(s.file,function(url){
        if(url) s.url=url; else { vfSeiten=vfSeiten.filter(function(x){ return x!==s; }); msg.textContent="Ein Foto ließ sich nicht öffnen."; msg.style.color="var(--ink)"; }
        seitenMalen();
      });
    });
    // Neue Seiten = neue Lesung: eine alte Vorschau passt nicht mehr dazu.
    // Erst fragen, sonst ist die durchgeschaute Liste still weg (21.10.2026).
    if(pvVorschauOffen()) vorschauWegFragen("Neue Seite dazu", "Mit einer neuen Seite wird alles noch einmal gelesen, die Liste hier geht dabei weg.", vorschauSchliessen);
  }
  function seitenLeeren(){ vfSeiten=[]; seitenMalen(); }
  function seitenMalen(){
    var liste=$("#vfSeiten"), los=$("#lesenBtn"), kam=$("#photoBtn"), gal=$("#galerieBtn");
    if(!liste) return;
    liste.innerHTML="";
    vfSeiten.forEach(function(s,i){
      var z=document.createElement("div"); z.className="vfseite-zeile";
      z.innerHTML=(s.url?'<img alt="Seite '+(i+1)+'" src="'+s.url+'">':'<span class="vfladen">…</span>')+
        '<span class="vfname">Seite '+(i+1)+'</span>'+
        '<button type="button" class="vfweg" aria-label="Seite '+(i+1)+' entfernen">✕ Entfernen</button>';
      z.querySelector(".vfweg").addEventListener("click",function(){
        /* Eine Seite wegzunehmen kostet die ganze Wortliste darauf - also
           erst fragen (21.10.2026, Helenas Wunsch aus dem Faden zum ✕). */
        var d=dialogOeffnen("vfSeiteWeg","Seite entfernen");
        d.inhalt.appendChild(el("p","vlhinweistext","Soll Seite "+(i+1)+" wirklich weg? Die Wörter von dieser Seite sind dann nicht dabei."));
        d.inhalt.appendChild(el("p","tipp","Du kannst sie danach jederzeit neu fotografieren."));
        d.knopf("Nein, behalten","start",function(){ d.zu(); });
        d.knopf("Ja, Seite weg","ghost",function(){
          d.zu();
          var w=vfSeiten.indexOf(s); if(w>=0) vfSeiten.splice(w,1);
          seitenMalen(); blip();
        });
      });
      liste.appendChild(z);
    });
    var n=vfSeiten.length, voll=n>=MAX_SEITEN;
    if(kam){ kam.textContent = voll ? "5 Seiten – mehr geht nicht" : (n ? "📷 Seite dazu" : "📷 Seite fotografieren"); kam.disabled=voll; }
    if(gal){ gal.disabled=voll; }
    if(n){
      var z2=document.createElement("div"); z2.className="vfzahl";
      z2.textContent=n+" von höchstens "+MAX_SEITEN+" Seiten";
      liste.appendChild(z2);
    }
    if(los){
      var bereit=n && vfSeiten.every(function(s){ return !!s.url; });
      los.style.display=n?"block":"none"; los.disabled=!bereit;
      los.textContent="Wortliste lesen › ("+n+" Seite"+(n===1?"":"n")+")";
    }
  }

  function serverLesen(urls, fertig){
    if(!window.fetch){ fertig(null); return; }
    var ctl = window.AbortController ? new AbortController() : null;
    var uhr = setTimeout(function(){ if(ctl) ctl.abort(); ende(null); }, SERVER_FRIST);
    var erledigt=false;
    function ende(x){ if(erledigt) return; erledigt=true; clearTimeout(uhr); fertig(x); }
    fetch("/api/vokabel-foto", {
      method:"POST", credentials:"same-origin", headers:{"content-type":"application/json"},
      signal: ctl ? ctl.signal : undefined,
      body: JSON.stringify({ kind:"helena", sprache:SPRACHE_SERVER,
        bilder: urls.map(function(u){ return { media_type:"image/jpeg", data:u.split(",")[1] }; }) })
    }).then(function(r){ return r.json().catch(function(){ return null; }); })
      .then(function(d){ ende(d); })
      .catch(function(){ ende(null); });
  }
  function serverPaare(d){
    return (d.paare||[]).map(function(p){ return {en:String(p.fremd||""), de:String(p.deutsch||""), pos:p.pos, wortart:p.wortart||""}; })
      .filter(function(p){ return p.en && p.de; });
  }
  function lesenStarten(){
    var msg=$("#addMsg"); msg.textContent="";
    var seiten=vfSeiten.filter(function(s){ return !!s.url; });
    if(!seiten.length) return;
    var urls=seiten.map(function(s){ return s.url; });
    var n=urls.length;
    var los=$("#lesenBtn"); if(los) los.disabled=true;
    setOcr("Lese "+(n===1?"die Seite":n+" Seiten")+" … zweimal und mit Sinnprüfung (etwa 15–40 Sekunden)");
    serverLesen(urls, function(d){
      if(los) los.disabled=false;
      if(d && d.ok && Array.isArray(d.paare)){
        setOcr(""); nichtErkannt=[];
        var pairs=serverPaare(d);
        var pruefen=Array.isArray(d.pruefen)?d.pruefen:
          /* Antwort in alter Form (nur „unsicher“ als Text): auch das wird eine Rückfrage. */
          (d.unsicher||[]).map(function(z,i){ return { seite:1, pos:500+i, ort:null, arten:["unsicher"],
            lesungen:[{fremd:String(z), deutsch:"", unsicher:true}], hinweis:"Nicht sicher lesbar." }; });
        var einmal=(d.seiten||[]).filter(function(s){ return s.ok && !s.zweitlesung; }).map(function(s){ return s.nr; });
        if(!pairs.length && !pruefen.length && !(d.fehlend||[]).length){ msg.textContent="Keine Wortpaare gefunden. Bitte die reine Wortliste gerade & scharf fotografieren – oder Text einfügen."; msg.style.color="var(--ink)"; return; }
        var fehlend=d.fehlend||[];
        renderPreview(pairs, { meldung:d.meldung, fehlend:fehlend, einmal:einmal, pruefen:pruefen, urls:urls,
          nochmal: fehlend.length ? function(){ fehlendNachlesen(fehlend, urls); } : null });
        // Die Vorschau steht unter dem Textfeld - dorthin springen, die Rückfragen zuerst.
        try{ $("#preview").scrollIntoView({block:"start", behavior:"smooth"}); }catch(e){}
        return;
      }
      if(d && d.ok===false && d.rueckfall===false){ setOcr(""); msg.textContent=d.fehler||"Das ging nicht."; msg.style.color="var(--ink)"; return; }
      tesseractLesen(seiten.map(function(s){ return s.file; }));
    });
  }
  /* Fehlende Seiten noch einmal: nur diese gehen zum Server, das Ergebnis
     kommt dazu (Zeilen an ihren Platz, Rückfragen in den Kasten). */
  function fehlendNachlesen(nrs, urls){
    var knopf=$("#vfNochmal"); if(knopf){ knopf.disabled=true; knopf.textContent="Lese …"; }
    var teil=nrs.map(function(nr){ return urls[nr-1]; });
    serverLesen(teil, function(d){
      var warn=$("#vfFehlend");
      if(!(d && d.ok && Array.isArray(d.paare))){ if(knopf){ knopf.disabled=false; knopf.textContent="Nochmal versuchen"; } return; }
      var umrechnen=function(pos){ var s=Math.floor(pos/1000); return nrs[s-1]*1000 + (pos%1000); };
      var vorhanden={};
      [].forEach.call($("#pvrows").children,function(r){ vorhanden[(r.querySelector(".pven").value+"|"+r.querySelector(".pvde").value).toLowerCase()]=1; });
      serverPaare(d).forEach(function(p){ if(!vorhanden[(p.en+"|"+p.de).toLowerCase()]) zeileEinfuegen(p.en,p.de,umrechnen(p.pos),p.wortart); });
      var pruefen=(d.pruefen||[]).map(function(r){ var x={}; for(var k in r) x[k]=r[k]; x.seite=nrs[(r.seite||1)-1]; x.pos=umrechnen(r.pos); return x; });
      if(pruefen.length){
        var liste=$("#vfListe");
        if(!liste){
          var k=document.createElement("div"); k.className="vfkasten"; k.id="vfKasten";
          k.innerHTML='<div class="vfkastenkopf">📖 Bitte kurz im Buch nachsehen</div><div class="vfkastenunter">Hier war ich mir nicht sicher. Schau ins Buch und wähle, was dort steht.</div><div id="vfListe"></div>';
          $("#pvrows").parentNode.insertBefore(k, $("#pvrows")); liste=$("#vfListe");
        }
        pruefen.forEach(function(r){ rueckfrageBauen(r, urls, liste); });
        pvOffenMalen();
      }
      var noch=(d.fehlend||[]).map(function(i){ return nrs[i-1]; });
      if(warn){
        if(noch.length){ warn.innerHTML='<b>Seite '+noch.join(", ")+' ließ sich wieder nicht lesen.</b> Fotografiere sie bitte neu – oder trag die Wörter unten selbst ein.'; }
        else { warn.className="pvrest"; warn.innerHTML='<b>Jetzt sind alle Seiten gelesen.</b>'; }
      }
    });
  }
  function tesseractLesen(files){
    var msg=$("#addMsg"); msg.textContent="";
    setOcr("Texterkennung wird geladen … (beim ersten Mal etwas Geduld)");
    loadTesseract(function(ok){
      if(!ok){ setOcr(""); msg.textContent="Texterkennung ließ sich nicht laden – Internet prüfen oder Liste als Text einfügen."; msg.style.color="var(--ink)"; return; }
      var worker, alle=[], i=0;
      window.Tesseract.createWorker(TESS_SPRACHEN,1,{ logger:function(m){
          if(m && m.status==="recognizing text"){ setOcr("Lese Seite "+(i+1)+" von "+files.length+" … "+Math.round((m.progress||0)*100)+" %"); }
          else if(m && m.status){ setOcr("Bereite Texterkennung vor …"); }
        }})
        .then(function(w){
          worker=w;
          function naechste(){
            if(i>=files.length) return Promise.resolve();
            return w.recognize(files[i], {}, { blocks:true }).then(function(res){
              alle=alle.concat(pairsFromOCR(res && res.data)); i++; return naechste();
            });
          }
          return naechste();
        })
        .then(function(){
          try{ if(worker) worker.terminate(); }catch(e){}
          setOcr("");
          if(!alle.length){ msg.textContent="Keine Wortpaare gefunden. Bitte die reine Wortliste gerade & scharf fotografieren – oder Text einfügen."; msg.style.color="var(--ink)"; return; }
          msg.textContent=""; renderPreview(alle, { ohnePruefung:true });
        })
        .catch(function(){ try{ if(worker) worker.terminate(); }catch(e){} setOcr(""); msg.textContent="Bei der Erkennung ging etwas schief – bitte nochmal versuchen."; msg.style.color="var(--ink)"; });
    });
  }
  $("#photoBtn").addEventListener("click",function(){ $("#photoInput").click(); });
  $("#photoInput").addEventListener("change",function(e){
    dateienDazu(e.target.files); e.target.value="";
  });

  /* Aussehen der neuen Teile - steht hier, damit beide Seiten (Englisch,
     Französisch) es gleich haben. Farben nur aus den Seitenvariablen, damit
     hell und dunkel stimmen. */
  (function(){
    var css=
      ".vfknoepfe{display:flex;gap:8px;flex-wrap:wrap}"+
      ".vfknoepfe .photobtn{flex:1 1 180px;min-height:48px}"+
      ".vfknoepfe .photobtn:disabled{opacity:.55;cursor:default}"+
      ".photobtn.vfgalerie{background:var(--surface2);color:var(--ink);border:1px solid var(--line)}"+
      ".vfseiten{margin-top:10px}"+
      ".vfseite-zeile{display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1px solid var(--line)}"+
      ".vfseite-zeile img{width:44px;height:56px;object-fit:cover;border-radius:6px;border:1px solid var(--line);flex:none}"+
      ".vfladen{width:44px;height:56px;display:grid;place-items:center;color:var(--muted);flex:none}"+
      ".vfname{flex:1;font-weight:700;font-size:14px;color:var(--ink)}"+
      ".adder button.vfweg{background:transparent;color:var(--ink);border:1px solid var(--line);min-height:44px;padding:8px 12px;font-size:13px}"+
      ".vfzahl{color:var(--muted);font-size:12.5px;margin-top:6px}"+
      ".photobtn.vflesen{margin-top:10px;min-height:50px}"+
      ".photobtn.vflesen:disabled{opacity:.55;cursor:default}"+
      ".vfwarn{background:color-mix(in srgb,var(--gold) 12%,var(--surface2));border:1.5px solid var(--line);border-radius:12px;padding:11px 13px;margin:10px 0;font-size:13.5px;line-height:1.55;color:var(--ink)}"+
      ".vfwarn .mini{margin-top:8px;min-height:44px}"+
      ".vfkasten{background:color-mix(in srgb,var(--gold) 14%,var(--surface2));border:1.5px solid color-mix(in srgb,var(--gold) 60%,var(--line));border-radius:14px;padding:12px;margin:12px 0}"+
      ".vfkastenkopf{font-family:var(--round);font-weight:800;font-size:15.5px;color:var(--ink)}"+
      ".vfkastenunter{color:var(--muted);font-size:13px;margin:3px 0 8px;line-height:1.45}"+
      ".vfrf{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px;margin-top:8px}"+
      ".vfrf.erledigt{opacity:.85}"+
      ".vfrfkopf{font-size:13.5px;color:var(--ink);line-height:1.45}"+
      ".vfseite{display:inline-block;background:var(--surface2);border:1px solid var(--line);border-radius:999px;padding:1px 8px;font-size:12px;font-weight:700;color:var(--muted);margin-right:4px}"+
      ".vfbild{display:block;max-width:100%;height:auto;margin:8px 0 4px;border-radius:8px;border:1px solid var(--line);background:#fff}"+
      ".vfles{font-size:13.5px;color:var(--ink);margin:6px 0;line-height:1.5;word-break:break-word}"+
      ".vfles small{color:var(--muted);font-size:12px}"+
      ".vferw{font-size:13px;color:var(--muted);margin:4px 0;line-height:1.45}"+
      ".vferw b{color:var(--ink)}"+
      ".vfwahl{display:flex;flex-direction:column;gap:6px;margin-top:8px}"+
      ".adder button.vfopt{min-height:44px;text-align:left;font-size:14px;padding:10px 12px;word-break:break-word}"+
      ".adder button.vfopt.vfneben{background:var(--surface2);color:var(--ink);border:1px solid var(--line)}"+
      ".vftipp{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}"+
      ".vftipp input{flex:1 1 120px;min-width:0;min-height:44px;font-size:14px;color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:9px 10px}"+
      ".adder .vftipp button{min-height:44px}"+
      ".vffertig{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;font-size:14px;color:var(--ink);font-weight:700;word-break:break-word}"+
      ".vffertig small{color:var(--muted);font-weight:600}"+
      ".vffertig .mini{min-height:44px;flex:none}"+
      ".vfoffen{margin-top:10px;font-size:13px;font-weight:700;color:var(--ink)}"+
      "#saveUnit:disabled{opacity:.5;cursor:default}"+
      ".pvx{min-width:44px;min-height:44px}"+
      ".pvrow input{min-height:44px}"+
      /* Erst fragen, dann weg (21.10.2026) */
      ".pvfrage{flex:1 1 100%;display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:6px;padding:8px 10px;background:var(--surface2);border:1px solid var(--line);border-radius:12px}"+
      ".pvfragetext{flex:1 1 100%;font-size:14px;font-weight:700;color:var(--ink);overflow-wrap:anywhere}"+
      ".pvfrage .mini{min-height:44px;flex:1 1 44%;color:var(--ink)}"+
      ".pvfrage .pvbleibt{border:2px solid var(--brand);font-weight:800}"+
      ".pvrow.pvfragend{border:1px dashed var(--line);border-radius:12px;padding:6px}"+
      ".pvweggelegt{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:8px;padding:8px 10px;background:var(--surface2);border:1px dashed var(--line);border-radius:12px}"+
      ".pvwegtext{flex:1 1 120px;font-size:13.5px;font-weight:700;color:var(--muted);text-decoration:line-through;overflow-wrap:anywhere}"+
      ".pvweggelegt .mini{min-height:44px;flex:none;color:var(--ink)}"+
      ".vlzurueckstreifen{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:8px;padding:8px 10px;background:var(--surface2);border:1px solid var(--line);border-radius:12px}"+
      ".vlzuruecktext{flex:1 1 120px;font-size:13.5px;font-weight:700;color:var(--ink);overflow-wrap:anywhere}"+
      ".vlzurueckstreifen .mini{min-height:44px;flex:none;color:var(--ink)}";
    var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);
  })();

  /* ---------- Eigene Einheiten verwalten (löschen) ---------- */
  function einheitLoeschen(weg){
    var left=customUnits().filter(function(u){return u.id!==weg.id;});
    set(PRE+"-custom-units",JSON.stringify(left));
    fillUnits(); renderMyUnits(); uebersichtMalen(); blip();
    var box=$("#myUnits"); if(!box) return;
    var s=el("div","vlzurueckstreifen");
    s.appendChild(el("span","vlzuruecktext","„"+weg.name+"“ ist gelöscht."));
    var b=el("button","mini","Zurückholen"); b.type="button";
    b.addEventListener("click",function(){
      var jetzt=customUnits();
      if(!jetzt.some(function(u){return u.id===weg.id;})) jetzt.push(weg);
      set(PRE+"-custom-units",JSON.stringify(jetzt));
      fillUnits(weg.id); renderMyUnits(); uebersichtMalen(); blip();
    });
    s.appendChild(b);
    box.appendChild(s);
  }

  function renderMyUnits(){
    var box=$("#myUnits"); var mine=customUnits();
    if(!mine.length){ box.innerHTML=""; return; }
    var html='<div class="muhead">Meine Einheiten</div>';
    mine.forEach(function(u){
      html+='<div class="myunit"><span>'+attrEsc(u.name)+' ('+u.pairs.length+')</span>'+
        '<button class="del" type="button" data-id="'+u.id+'">löschen</button></div>';
    });
    box.innerHTML=html;
    [].forEach.call(box.querySelectorAll(".del"),function(btn){
      btn.addEventListener("click",function(){
        var id=btn.getAttribute("data-id"), weg=null;
        customUnits().forEach(function(u){ if(u.id===id) weg=u; });
        if(!weg) return;
        var n=(weg.pairs||[]).length;
        /* Eine ganze Einheit ist der groesste Verlust im Trainer - erst fragen
           (21.10.2026, Helenas Wunsch), danach bleibt ein Rueckweg stehen. */
        var d=dialogOeffnen("vlEinheitWeg","Einheit löschen");
        d.inhalt.appendChild(el("p","vlhinweistext","Soll „"+weg.name+"“ mit "+n+" Vokabel"+(n===1?"":"n")+" wirklich weg?"));
        d.inhalt.appendChild(el("p","tipp","Direkt danach kannst du sie noch zurückholen – nach dem Neuladen der Seite nicht mehr."));
        d.knopf("Nein, behalten","start",function(){ d.zu(); });
        d.knopf("Ja, löschen","ghost",function(){ d.zu(); einheitLoeschen(weg); });
      });
    });
  }
  renderMyUnits();

  /* Aussehen der Lern-Oberflaeche (19.10.2026). Farben nur aus den
     Seitenvariablen, damit hell und dunkel stimmen. Fehlerstellen sind gelb
     hinterlegt und unterstrichen, nie rot (Antworten Nr. 11). */
  (function(){
    var css=
      ".choices.vlliste{grid-template-columns:1fr}"+
      ".choices.vlliste .choice{min-height:52px;font-size:17px;text-align:left;word-break:break-word}"+
      ".choice.vlgewaehlt{border:2px dashed var(--muted)}"+
      ".answer input.vlneutral{border-color:var(--muted);border-style:dashed}"+
      ".verdict.neutral{color:var(--ink)}"+
      ".vlart{font-weight:800;font-size:15px;color:var(--ink)}"+
      ".vlrm{margin-top:10px;text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:12px 14px}"+
      ".vlzeile{display:flex;flex-direction:column;gap:2px;margin:4px 0;word-break:break-word;overflow-wrap:anywhere}"+
      ".vlzeile small{color:var(--muted);font-size:12.5px;font-weight:600}"+
      ".vlwort{font-family:var(--round);font-size:19px;font-weight:700;color:var(--ink);letter-spacing:.02em}"+
      ".vlrichtig .vlwort{font-size:26px;font-weight:800}"+
      ".vlmark{background:#6b5410;color:var(--ink);text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:3px;border-radius:3px;padding:0 1px}"+
      "html[data-theme=\"light\"] .vlmark{background:#fde68a;color:#1b1c22}"+
      ".vlluecke{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 16px;margin:10px 0 14px}"+
      ".vlgruppe{display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:3px;max-width:100%}"+
      ".vlbst{font-family:var(--round);font-size:26px;font-weight:800;color:var(--ink);min-width:.55em;text-align:center}"+
      ".vlgap{width:2.1em;min-width:36px;height:48px;min-height:48px;padding:0;text-align:center;font-size:24px;font-weight:800;font-family:var(--round);color:var(--ink);background:var(--surface2);border:2px solid var(--brand);border-radius:10px;outline:none}"+
      ".vlgap:focus{border-color:var(--ok)}"+
      ".vlgap:disabled{opacity:1;color:var(--ink)}"+
      ".vlprueffeld{justify-content:center}"+
      ".vlprueffeld button{min-height:48px;padding:0 28px}"+
      ".vltasten{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 10px}"+
      ".vltaste{min-width:44px;min-height:44px;padding:0 6px;font-size:20px;font-weight:700;font-family:var(--font);color:var(--ink);background:var(--surface2);border:1px solid var(--line);border-radius:10px;cursor:pointer}"+
      ".vltaste:disabled{opacity:.55}"+
      ".vlstufen{margin:6px 0 12px}"+
      "@media (max-height:440px){.setup{padding:12px}.heute{display:flex;align-items:center;gap:12px;text-align:left;padding:2px 4px 8px}.heutezahl{font-size:34px;flex:none}.heutetext{font-size:13.5px;margin-top:0}.done h2{font-size:20px;margin:0 0 2px}.done{padding:14px 14px}}"+
      ".vlkacheln{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}"+
      ".vlkachel{background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:8px 4px;text-align:center;display:flex;flex-direction:column;gap:1px;min-width:0}"+
      ".vlkachel b{font-family:var(--round);font-size:20px;font-weight:800;color:var(--ink)}"+
      ".vlkachel span{font-size:12.5px;font-weight:700;color:var(--ink)}"+
      ".vlkachel small{font-size:12px;color:var(--muted);overflow-wrap:anywhere}"+
      ".vlinfo{font-size:13.5px;color:var(--muted);margin:8px 2px 0;line-height:1.45;text-align:center}"+
      ".vlinfo.vlpruefung,.vlinfo.vlpause{color:var(--ink)}"+
      ".done p.vlfehlerarten{color:var(--ink);font-weight:600}"+
      ".done .ghost{min-height:48px;color:var(--ink)}"+
      ".vlfrei{text-align:center;color:var(--muted);font-size:12.5px;margin-top:2px}"+
      ".vlfreistart{width:100%;margin-top:6px;min-height:48px;border:none;border-radius:14px;padding:13px;cursor:pointer;font-family:var(--round);font-weight:800;font-size:15.5px;color:var(--auf-brand,#150f2e);background:var(--brand)}"+
      ".vlnachupload{margin:0 0 10px}"+
      ".vlplanknoepfe{display:flex;flex-direction:column;gap:8px}"+
      ".vlplanknopf{min-height:48px;width:100%;color:var(--ink)}"+
      ".vleigene{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px}"+
      ".vlzahl{width:64px;min-height:44px;font-size:16px;text-align:center;color:var(--ink);background:var(--surface2);border:1px solid var(--line);border-radius:10px}"+
      ".vleigene .mini{min-height:44px}"+
      ".vldlg{position:fixed;inset:0;z-index:80;background:rgba(10,12,20,.55);display:flex;align-items:flex-end;justify-content:center;padding:12px}"+
      "@media (min-width:600px){.vldlg{align-items:center}}"+
      ".vldlgpanel{width:100%;max-width:520px;max-height:calc(100vh - 24px);overflow-y:auto;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:18px;padding:18px 16px;box-shadow:var(--shadow)}"+
      ".vldlgpanel h3{font-family:var(--round);font-size:18px;margin:0 0 10px;color:var(--ink)}"+
      ".vldlgknoepfe{display:flex;flex-direction:column;gap:8px;margin:14px -16px -18px;padding:10px 16px 14px;position:sticky;bottom:-18px;background:var(--surface);z-index:2;border-top:1px solid var(--line)}"+
      ".vldlgknoepfe button{min-height:48px;width:100%;margin:0}"+
      ".vldlgknoepfe .ghost{color:var(--ink)}"+
      ".vldatumreihe{display:flex;gap:8px;flex-wrap:wrap}"+
      ".vldatum{flex:1 1 140px;display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--muted);font-weight:700;min-width:0}"+
      ".vldatum input{min-height:44px;font-size:16px;color:var(--ink);background:var(--surface2);border:1px solid var(--line);border-radius:10px;padding:8px 10px;width:100%;min-width:0}"+
      ".vlmeldung{font-size:13.5px;color:var(--ink);font-weight:700;min-height:18px;margin-top:8px}"+
      ".vlliste2{background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:10px;margin:0 0 12px;font-size:14px;color:var(--ink)}"+
      ".vlzeile2{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;flex-wrap:wrap}"+
      ".vlzeile2 .mini{min-height:44px;color:var(--ink)}"+
      ".vltermine{display:flex;flex-direction:column;gap:6px;margin-bottom:8px}"+
      ".vltermin{min-height:48px;text-align:left;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--surface2);color:var(--ink);font-size:14.5px;font-weight:700;cursor:pointer;font-family:var(--font)}"+
      ".vltermin[aria-pressed=\"true\"]{border:2px solid var(--brand)}"+
      ".vleinheiten{max-height:220px;overflow-y:auto;border:1px solid var(--line);border-radius:12px;padding:4px 8px}"+
      ".vlhaken{display:flex;align-items:center;gap:10px;min-height:44px;font-size:14px;color:var(--ink);border-bottom:1px solid var(--line)}"+
      ".vlhaken input{width:22px;height:22px;flex:none}"+
      ".vlstoff{margin-top:8px}"+
      ".vlhinweistext{font-size:15px;line-height:1.5;color:var(--ink)}"+
      ".vldlgpanel .tipp{color:var(--muted)}"+
      "body.vldlgoffen{overflow:hidden}"+
      ".pvrow{flex-wrap:wrap}"+
      ".pvrow .pven,.pvrow .pvde{flex:1 1 38%}"+
      ".pvrow select.pvwa{flex:1 1 140px;width:auto;min-height:44px;font-size:14px;color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:6px 10px;background-image:none}"+
      ".pvx{color:var(--ink)}"+
      ".myunit .del{color:var(--ink);min-height:44px}"+
      ".vfwa{color:var(--muted)}";
    var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);
  })();

})();
