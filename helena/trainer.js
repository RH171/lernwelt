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
*/
(function(){
  "use strict";
  var K = window.HELENA_KONFIG;
  if (!K) { console.error("HELENA_KONFIG fehlt - der Trainer startet nicht."); return; }
  var PRE   = K.praefix;
  var UNITS = K.units || [];
  var $   = function(s){ return document.querySelector(s); };
  var get = function(k,d){ try{ var v=localStorage.getItem(k); return v==null?d:v; }catch(e){ return d; } };
  var set = function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} };

  /* ---------- Vorlieben: was uebt sie tatsaechlich? ----------
     Wir zaehlen mit, welche Uebungsart, welche Richtung und welche Einheit
     Helena waehlt. Beim naechsten Oeffnen ist das schon eingestellt - sie
     soll nicht jedes Mal dieselben drei Knoepfe druecken muessen. Was wir
     NICHT tun: die Anforderung senken. Wer nur Multiple-Choice waehlt,
     bekommt in der gemischten Runde trotzdem Karten zum Eintippen. */
  /* ---------- Was ausdruecklich eingestellt wurde ----------
     Helena am 07.09.2026: "Wenn ich bei ,lieber selbst aussuchen' etwas selber
     aussuche ist es wenn ich aufhoere und wieder rein gehe alles wieder so als
     haette ich nichts geaendert. Mach dass, das was ich eingestellt habe so
     bleibt biss ich es selbst wieder aendere."

     Sie hat recht. Die Vorlieben unten zaehlen mit, was jemand OFT waehlt, und
     greifen erst ab dreimal - das war als Schutz gedacht, damit ein einmaliges
     Ausprobieren nicht gleich zur Gewohnheit erklaert wird. Fuer eine
     ABSICHTLICHE Einstellung ist das aber schlicht falsch: Wer etwas einstellt,
     will es behalten, und zwar sofort.

     Deshalb zwei getrennte Dinge: die Einstellung hier gilt immer und sofort,
     die Vorlieben weiter unten sind nur noch der Rueckfall fuer den allerersten
     Besuch. */
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

  var VORLIEBEN = PRE+"-vorlieben";
  function vorliebenLaden(){
    try { var v=JSON.parse(get(VORLIEBEN,"{}")); return (v&&typeof v==="object")?v:{}; }
    catch(e){ return {}; }
  }
  function vorliebeZaehlen(art, wert){
    if(!wert) return;
    var v=vorliebenLaden();
    v[art]=v[art]||{};
    v[art][wert]=(v[art][wert]||0)+1;
    try{ set(VORLIEBEN, JSON.stringify(v)); }catch(e){}
  }
  function liebste(art, rueckfall){
    var t=vorliebenLaden()[art]; if(!t) return rueckfall;
    var bester=rueckfall, hoechste=0;
    for(var k in t){ if(t[k]>hoechste){ hoechste=t[k]; bester=k; } }
    return hoechste>=3 ? bester : rueckfall;   // erst ab dreimal ist es eine Gewohnheit
  }

  function customUnits(){ try{var a=JSON.parse(get(PRE+"-custom-units","[]"));return Array.isArray(a)?a:[];}catch(e){return [];} }
  function allUnits(){ return UNITS.concat(customUnits()); }

  var unitSel=$("#unit");
  function fillUnits(sel){
    unitSel.innerHTML="";
    // Der Normalfall zuerst: Das System stellt zusammen, was ansteht.
    var o0=document.createElement("option");
    o0.value="__faellig"; o0.textContent="★ Was heute dran ist";
    unitSel.appendChild(o0);
    // Nach Jahrgangsstufe gruppieren: Helena soll auf einen Blick sehen,
    // was Grundwortschatz ist und was Wiederholung aus der 6. Klasse.
    var gruppen=K.gruppen.concat([
      {stufe:0, titel:"Meine eigenen Einheiten"}
    ]);
    gruppen.forEach(function(g){
      var drin=allUnits().filter(function(u){
        // Eigene Einheiten haben keine Stufe. Ohne die zweite Bedingung
        // rutschten sie zusaetzlich in die Gruppe mit der Stufe 5 und standen
        // zweimal im Menue.
        return g.stufe===0 ? !u.stufe : (u.stufe===g.stufe);
      });
      if(!drin.length) return;
      var gr=document.createElement("optgroup"); gr.label=g.titel;
      drin.forEach(function(u){
        var o=document.createElement("option");
        o.value=u.id; o.textContent=u.name+" ("+u.pairs.length+")";
        gr.appendChild(o);
      });
      unitSel.appendChild(gr);
    });
    if(sel) unitSel.value=sel;
  }
  // Auch die gewaehlte Einheit bleibt stehen - sie gehoert zu dem, was
  // Helena "selbst ausgesucht" hat.
  fillUnits(einstellungLaden().einheit || "");
  unitSel.value="__faellig";

  // Die Zahl oben: Was steht heute an?
  function heuteMalen(){
    var z=faelligZaehlen();
    /* Den Stand fuer die Uebersicht hinterlegen (21.09.2026). Helenas
       Startseite ist seitdem nicht mehr der Trainer selbst, sondern eine
       Uebersicht - und die soll sagen koennen, wie viel heute ansteht, ohne
       den ganzen Vokabelbestand mitzuladen. Steht nichts da, sagt sie das
       ehrlich, statt eine Zahl zu erfinden.
       Seit 19.10.2026 je Sprache ein eigener Schluessel: Vorher schrieben
       Englisch und Franzoesisch beide nach "helena-vokabelstand", und die
       Startseite las den Wert immer als Englisch - nach einer Franzoesisch-
       Runde zeigte sie franzoesische Zahlen und fuehrte zum Englisch-Trainer.
       Weiterhin genau EIN Schreibvorgang je Aufruf (paul-sync: jedes
       setItem wird ein KV-Schreibvorgang). Der alte Schluessel wird nicht
       mehr geschrieben, die Startseite liest ihn nur noch als Rueckfall. */
    try {
      var kurz = K.fach==="franzoesisch" ? "fr" : "en";
      localStorage.setItem("helena-vokabelstand-"+kurz, JSON.stringify({
        faellig: z.faellig, neu: z.neu, sprache: kurz,
        stand: Date.now()
      }));
    } catch(e){}
    var zahl=$("#heuteZahl"), txt=$("#faelligText");
    if(!zahl||!txt) return;
    var offen=z.faellig;
    if(offen){
      zahl.textContent=offen;
      txt.textContent=(offen===1?"Wort ist heute dran":"W\u00f6rter sind heute dran")+
        (z.neu?" \u00b7 "+z.neu+" noch nie ge\u00fcbt":"");
    } else if(z.neu){
      zahl.textContent=Math.min(z.neu,20);
      txt.textContent="neue W\u00f6rter zum Kennenlernen \u00b7 nichts Altes f\u00e4llig";
    } else {
      zahl.textContent="\u2713";
      txt.textContent="Alles sitzt. Komm morgen wieder \u2013 oder such dir unten etwas aus.";
    }
  }
  heuteMalen();

  /* ---------- XP & Streak ---------- */
  var xp=parseInt(get(PRE+"-xp","0"),10)||0;
  var streak=parseInt(get(PRE+"-streak","0"),10)||0;
  // Ist heute der erste Besuch des Tages - die Serie also gerade eben
  // gewachsen? Nur dann wird sie am Rundenende hervorgehoben.
  var serieNeuHeute=false;
  (function(){
    var today=new Date(); today.setHours(0,0,0,0);
    var iso=today.toISOString().slice(0,10);
    var last=get(PRE+"-last",null);
    if(last!==iso){
      var y=new Date(today); y.setDate(y.getDate()-1);
      streak=(last===y.toISOString().slice(0,10))?streak+1:1;
      set(PRE+"-streak",String(streak)); set(PRE+"-last",iso);
      serieNeuHeute=true;
    }
    if(streak<1){streak=1; set(PRE+"-streak","1");}
  })();
  function paintStats(){ $("#xp").textContent=xp; $("#streak").textContent=streak; }
  paintStats();

  function writeProgress(best,uebung){
    try{ set(K.fortschritt,
      JSON.stringify({xp:xp,best:best||0,uebung:uebung||0})); }catch(e){}
  }

  /* ---------- Einstellungen ---------- */
  var eingestellt = einstellungLaden();
  var dir  = eingestellt.richtung || liebste("richtung","de2en");
  var mode = eingestellt.modus    || liebste("modus","mc");
  var dauerMin = eingestellt.dauer !== undefined
    ? (parseInt(eingestellt.dauer,10)||0)
    : (parseInt(liebste("dauer","0"),10)||0);           // 0 = nach Woertern, sonst Minuten
  // Wie viele Antworten stehen bei Multiple-Choice zur Wahl? Mehr heisst
  // schwerer: bei zwei ist die Haelfte geraten, bei fuenf muss man das Wort
  // schon fast wissen.
  var wahlAnzahl = parseInt(eingestellt.auswahl || liebste("auswahl","4"),10)||4;
  function seg(id,cb){
    var g=$(id);
    g.addEventListener("click",function(e){
      var b=e.target.closest("button"); if(!b) return;
      [].forEach.call(g.children,function(x){x.setAttribute("aria-pressed","false");});
      b.setAttribute("aria-pressed","true"); cb(b.getAttribute("data-v")); blip();
    });
  }
  seg("#dir",function(v){dir=v; einstellungMerken();});
  seg("#mode",function(v){mode=v; einstellungMerken();});
  seg("#dauer",function(v){dauerMin=parseInt(v,10)||0; einstellungMerken();});
  seg("#auswahl",function(v){wahlAnzahl=Math.max(2,Math.min(5,parseInt(v,10)||4)); einstellungMerken();});
  if (unitSel) unitSel.addEventListener("change", einstellungMerken);

  // War die Feineinstellung offen, ist sie es beim naechsten Mal wieder.
  (function(){
    var f = document.querySelector("details.feineinst");
    if (!f) return;
    try { if (get(PRE+"-feineinst","") === "auf") f.open = true; } catch(e){}
    f.addEventListener("toggle", function(){
      try { set(PRE+"-feineinst", f.open ? "auf" : "zu"); } catch(e){}
    });
  })();

  // Was sie zuletzt am haeufigsten genommen hat, steht schon da.
  function segSetzen(id,wert){
    var g=$(id); if(!g) return;
    [].forEach.call(g.children,function(x){
      x.setAttribute("aria-pressed", x.getAttribute("data-v")===String(wert) ? "true":"false");
    });
  }
  segSetzen("#dir",dir); segSetzen("#mode",mode); segSetzen("#dauer",dauerMin);
  segSetzen("#auswahl",wahlAnzahl);

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
  function bad(){tone(300,.18,0,"sawtooth");}
  function fanfare(){tone(523,.15,0);tone(659,.15,.12);tone(784,.28,.24);}

  /* ---------- Vorlesen – beste verfügbare Stimme der Zielsprache ---------- */
  var bestVoice=null;
  function chooseVoice(){
    try{
      var vs=speechSynthesis.getVoices()||[]; if(!vs.length) return;
      function score(v){
        var n=(v.name||"").toLowerCase(), l=(v.lang||"").toLowerCase().replace("_","-"), s=0;
        if(l.indexOf(K.stimmeVorwahl)!==0) return -1;      // nur die Zielsprache
        if(l.indexOf(K.stimmeBevorzugt)===0) s+=3; else s+=1;  // die bevorzugte Variante
        if(n.indexOf("google")>=0) s+=6;                    // Chrome-Google-Stimmen: sehr gut
        if(v.localService===false) s+=3;                    // Netz-Stimmen meist besser
        if(/(daniel|kate|serena|arthur|martha|libby|sonia|aria|natasha|jenny|ryan|neural|enhanced|premium|siri)/.test(n)) s+=4;
        if(/compact|kompakt|eloquence|fred|albert/.test(n)) s-=4;   // blecherne Altstimmen meiden
        return s;
      }
      var ranked=vs.map(function(v){return {v:v,s:score(v)};})
                   .filter(function(x){return x.s>=0;})
                   .sort(function(a,b){return b.s-a.s;});
      if(ranked.length) bestVoice=ranked[0].v;
    }catch(e){}
  }
  chooseVoice();
  try{ speechSynthesis.onvoiceschanged=chooseVoice; }catch(e){}

  function say(text){
    try{
      var u=new SpeechSynthesisUtterance(text);
      if(bestVoice){ u.voice=bestVoice; u.lang=bestVoice.lang; } else { u.lang=K.stimmeRueckfall; }
      u.rate=.88;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }catch(e){}
  }

  /* ---------- Helfer ---------- */
  function shuffle(a){ for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
  function normalize(s){
    return (s||"").toLowerCase().trim()
      .replace(/^(to|der|die|das|the|a|an)\s+/,"")
      .replace(/[.,!?;:'’]/g,"").replace(/\s+/g," ");
  }
  function clozeTarget(en){ return en.replace(/^to\s+/,"").trim(); }
  function esc(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
  function makeCloze(sentence, target){
    if(!sentence) return null;
    var pat=new RegExp("\\b"+esc(target).replace(/\s+/g,"\\s+")+"\\b","i");
    if(!pat.test(sentence)) return null;
    var blank='<span class="gap">'+Array(Math.max(4,target.replace(/\s/g,"").length)+1).join("_")+'</span>';
    return sentence.replace(pat, blank);
  }
  function maskWord(w){
    return w.split("").map(function(ch,i){
      if(!/[a-zA-ZäöüÄÖÜß]/.test(ch)) return ch;
      if(i===0 || i===w.length-1) return ch;
      return Math.random()<.55 ? "_" : ch;
    }).join("");
  }


  /* ---------- Wort-Gedächtnis (Leitner) ----------
     Bis hierher merkte sich der Trainer XP, Serie und Datum - aber nicht,
     WELCHE Wörter sitzen. Jede Sitzung fing bei null an: Ein Wort, das
     fünfmal danebenging, kam so oft dran wie eines, das man im Schlaf kann.
     Verteiltes Wiederholen ist aber der stärkste Einzeleffekt beim
     Vokabellernen - also merken wir uns pro Wort, wann es zuletzt saß.

     Fünf Fächer mit wachsendem Abstand. Richtig: eine Stufe hoch.
     Daneben: zurück auf Anfang, das Wort kommt morgen wieder. */

  var FACH_TAGE = [0, 1, 3, 7, 16, 35];      // Fach 0 = heute noch einmal
  var WISSEN_SCHLUESSEL = PRE+"-wissen";

  function wissenLaden(){
    try { var o = JSON.parse(get(WISSEN_SCHLUESSEL, "{}")); return (o && typeof o === "object") ? o : {}; }
    catch(e){ return {}; }
  }
  function wissenSichern(w){ try { set(WISSEN_SCHLUESSEL, JSON.stringify(w)); } catch(e){} }

  // Ein Wort eindeutig benennen - die Einheit gehört dazu, sonst kollidieren
  // gleiche Wörter aus verschiedenen Einheiten.
  function wortSchluessel(unitId, p){ return unitId + "|" + p.en; }

  function heuteZahl(){ return Math.floor(Date.now() / 86400000); }

  function standVon(wissen, schl){
    return wissen[schl] || { fach: 0, faellig: 0, richtig: 0, falsch: 0 };
  }

  // Was ist heute dran? Fällige zuerst, dann neue Wörter zum Auffüllen.
  function faelligeAuswahl(maxAnzahl){
    var wissen = wissenLaden(), heute = heuteZahl();
    var faellig = [], neu = [];
    allUnits().forEach(function(u){
      u.pairs.forEach(function(p){
        var st = wissen[wortSchluessel(u.id, p)];
        if (!st) neu.push({p:p, tries:0, unitId:u.id});
        else if (st.faellig <= heute) faellig.push({p:p, tries:0, unitId:u.id, faellig:st.faellig});
      });
    });
    // Am längsten überfällig zuerst - das ist am ehesten am Vergessen.
    faellig.sort(function(a,b){ return a.faellig - b.faellig; });
    var raus = faellig.slice(0, maxAnzahl);
    if (raus.length < maxAnzahl) raus = raus.concat(shuffle(neu).slice(0, maxAnzahl - raus.length));
    // Mischen: Themen durcheinander üben sitzt besser als Block für Block,
    // auch wenn es sich schwerer anfühlt.
    return shuffle(raus);
  }

  // Der ehrlichste Wert der ganzen App: Wie viele Woerter sind so oft richtig
  // wiedergekommen, dass sie im Langzeitgedaechtnis stehen? Fach 4 heisst,
  // das Wort hat 16 Tage Pause ueberstanden.
  function sitztZaehlen(){
    var w=wissenLaden(), n=0, fast=0;
    for(var k in w){ if(w[k].fach>=4) n++; else if(w[k].fach>=2) fast++; }
    return { sitzt:n, aufDemWeg:fast };
  }

  function faelligZaehlen(){
    var wissen = wissenLaden(), heute = heuteZahl(), n = 0, neu = 0;
    allUnits().forEach(function(u){
      u.pairs.forEach(function(p){
        var st = wissen[wortSchluessel(u.id, p)];
        if (!st) neu++; else if (st.faellig <= heute) n++;
      });
    });
    return { faellig: n, neu: neu };
  }

  // Nach jeder Antwort das Fach nachführen.
  function wortMerken(unitId, p, richtig){
    if (!unitId) return;
    var wissen = wissenLaden(), schl = wortSchluessel(unitId, p);
    var st = standVon(wissen, schl);
    if (richtig){
      st.fach = Math.min(st.fach + 1, FACH_TAGE.length - 1);
      st.richtig++;
    } else {
      st.fach = 0;
      st.falsch++;
    }
    st.faellig = heuteZahl() + FACH_TAGE[st.fach];
    st.zuletzt = new Date().toLocaleDateString("sv-SE");
    wissen[schl] = st;
    wissenSichern(wissen);
  }

  /* ---------- Übungslogik ---------- */
  var queue=[], curUnit=null, roundDir="de2en", total=0, mastered=0, wrongWords=[], answered=false;
  // Mitschrift für den Lernstand: Was wurde geübt, was saß, wie lange.
  var protokoll=[], rundeBegonnen=0, karteBegonnen=0;
  var zeitEnde=0, gesehen={}, rundenModus="mc";
  var erstRichtig=0, erstGesamt=0, lauf=0, laufBest=0;
  function kannSprechen(){ return typeof speechSynthesis!=="undefined"; }

  // Sagt der Seite, ob gerade gespielt wird. Auf dem Handy blendet das die
  // Kopfzeile aus - siehe die Begruendung im CSS der Seite.
  function ansicht(was){
    // Beim Spielen UND beim Ergebnis: Kopf- und Fusszeile weg. Beides sind
    // Momente, in denen sie weiterkommen will, nicht Punktestaende lesen.
    document.body.classList.toggle("konzentriert", was === "spiel" || was === "ende");
  }

  function startSession(){
    roundDir=dir;
    rundenModus=mode;
    vorliebeZaehlen("richtung",dir); vorliebeZaehlen("modus",mode);
    vorliebeZaehlen("dauer",String(dauerMin)); vorliebeZaehlen("einheit",unitSel.value);
    vorliebeZaehlen("auswahl",String(wahlAnzahl));
    zeitEnde = dauerMin ? Date.now() + dauerMin*60000 : 0;
    erstRichtig=0; erstGesamt=0; lauf=0; laufBest=0;
    if (unitSel.value === "__faellig"){
      // Das System stellt zusammen, was ansteht - fällige zuerst, dann Neues.
      queue = faelligeAuswahl(20);
      // pairs mitgeben: Daraus werden die falschen Antwortmöglichkeiten
      // gezogen, und das Ergebnisbild braucht die Anzahl. Ohne sie blieb
      // die Karte leer.
      curUnit = { id:"__faellig", name:"Was heute dran ist",
                  pairs: queue.map(function(it){ return it.p; }) };
    } else {
      curUnit=allUnits().filter(function(u){return u.id===unitSel.value;})[0]||UNITS[0];
      queue=shuffle(curUnit.pairs.map(function(p){return {p:p, tries:0, unitId:curUnit.id};}));
    }
    total=queue.length; mastered=0; wrongWords=[];
    protokoll=[]; rundeBegonnen=Date.now();
    if(LS()) LS().uhrZuruecksetzen();
    gesehen={};
    queue.forEach(function(it){ gesehen[wortSchluessel(it.unitId,it.p)]=1; });
    if (!total){ meldungKeineWoerter(); return; }
    $("#setup").style.display="none"; $("#end").style.display="none"; $("#play").style.display="block";
    ansicht("spiel");
    window.scrollTo(0,0);
    nextCard();
  }
  function meldungKeineWoerter(){
    ansicht("start");
    $("#setup").style.display="block"; $("#play").style.display="none";
    var e=$("#faelligText");
    if(e) e.textContent="Gerade ist nichts fällig - alles sitzt. Wähle unten eine Einheit, wenn du trotzdem üben willst.";
  }

  function pickDir(){ return roundDir==="mix" ? (Math.random()<.5?"de2en":"en2de") : roundDir; }

  // Im Zeitmodus laeuft die Runde, bis die Minuten um sind - nicht, bis eine
  // feste Zahl Woerter durch ist. Genau dafuer ist die Zugfahrt da.
  function nachfuellen(){
    var neue = faelligeAuswahl(12).filter(function(it){
      return !gesehen[wortSchluessel(it.unitId,it.p)];
    });
    if(!neue.length) return false;
    neue.forEach(function(it){ gesehen[wortSchluessel(it.unitId,it.p)]=1; });
    queue = queue.concat(neue);
    total = mastered + queue.length;
    if(curUnit && curUnit.id==="__faellig")
      curUnit.pairs = curUnit.pairs.concat(neue.map(function(it){return it.p;}));
    return true;
  }

  function restZeit(){ return zeitEnde ? Math.max(0, zeitEnde - Date.now()) : 0; }

  function nextCard(){
    answered=false;
    karteBegonnen=Date.now();
    if(zeitEnde){
      var anteil = 1 - restZeit() / (dauerMin*60000);
      $("#prog").style.width=Math.round(Math.min(1,Math.max(0,anteil))*100)+"%";
      var u=$("#uhrRest");
      if(u) u.textContent=Math.ceil(restZeit()/60000)+" Min";
    } else {
      $("#prog").style.width=(total? Math.round(mastered/total*100):0)+"%";
    }
    if(zeitEnde && restZeit()<=0){ finish(); return; }
    if(!queue.length && zeitEnde && nachfuellen()){ /* weiter */ }
    if(!queue.length){ finish(); return; }
    var item=queue[0], p=item.p;
    var c=$("#card");

    if(mode==="hoeren" && kannSprechen()){
      item._sol=p.en; item._solLang="en"; item._prompt=p.en;
      c.innerHTML='<div class="kicker">Hören &amp; schreiben · '+K.sprache+'</div>'+
        '<div class="hoerfeld"><button class="hoerknopf" id="nochmal" type="button" '+
          'aria-label="Nochmal vorlesen">&#128266;</button></div>'+
        '<div class="clozemean">bedeutet: <b>'+p.de+'</b></div>'+
        '<div class="hint">Tippe, was du hörst</div>'+
        '<div class="answer"><input id="ipt" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="…"><button id="chk">Prüfen</button></div>'+
        '<div class="verdict" id="vd"></div><div class="exs" id="exs"></div>';
      var iph=$("#ipt"); iph.focus();
      var goh=function(){ if(!answered) judgeText(iph.value,item); };
      $("#chk").addEventListener("click",goh);
      iph.addEventListener("keydown",function(e){ if(e.key==="Enter") goh(); });
      $("#nochmal").addEventListener("click",function(){ say(p.en); });
      say(p.en);
      return;
    }

    if(mode==="cloze"){
      var tgt=clozeTarget(p.en);
      var sentHtml=makeCloze(p.ex, tgt);
      item._sol=p.en; item._solLang="en"; item._prompt=p.en;
      if(sentHtml){
        c.innerHTML='<div class="kicker">Lückentext · '+K.sprache+'</div>'+
          '<div class="clozemean">bedeutet: <b>'+p.de+'</b></div>'+
          '<div class="clozesent">'+sentHtml+'</div>'+
          '<div class="answer"><input id="ipt" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="fehlendes Wort"><button id="chk">Prüfen</button></div>'+
          '<div class="verdict" id="vd"></div><div class="exs" id="exs"></div>';
      } else {
        c.innerHTML='<div class="kicker">Lückentext · '+K.sprache+'</div>'+
          '<div class="prompt">'+p.de+'</div>'+
          '<div class="hint">Ergänze das '+K.spracheAdj+' Wort: <span class="masked">'+maskWord(p.en)+'</span></div>'+
          '<div class="answer"><input id="ipt" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ganzes Wort"><button id="chk">Prüfen</button></div>'+
          '<div class="verdict" id="vd"></div><div class="exs" id="exs"></div>';
      }
      var ipc=$("#ipt"); ipc.focus();
      var goc=function(){ if(!answered) judgeText(ipc.value,item); };
      $("#chk").addEventListener("click",goc);
      ipc.addEventListener("keydown",function(e){ if(e.key==="Enter") goc(); });
      return;
    }

    var d=pickDir();
    var promptWord = d==="de2en" ? p.de : p.en;
    var solution   = d==="de2en" ? p.en : p.de;
    item._d=d; item._sol=solution; item._solLang=(d==="de2en"?"en":"de"); item._prompt=promptWord;

    var sayBtn = (d==="en2de")
      ? '<button class="say" title="Aussprache" data-say="'+p.en.replace(/"/g,'')+'">🔊</button>' : '';
    var head='<div class="kicker">'+(d==="de2en"?"Deutsch → "+K.sprache:K.sprache+" → Deutsch")+'</div>'+
             '<div class="prompt">'+promptWord+sayBtn+'</div>';

    if(mode==="mc"){
      var opts=[solution];
      var pool=shuffle(curUnit.pairs.map(function(x){return d==="de2en"?x.en:x.de;})
                 .filter(function(w){return w!==solution;}));
      while(opts.length<wahlAnzahl && pool.length) opts.push(pool.pop());
      opts=shuffle(opts);
      c.innerHTML=head+'<div class="hint">Wähle die richtige Übersetzung</div><div class="choices" id="ch"></div>'+
        '<div class="verdict" id="vd"></div><div class="exs" id="exs"></div>';
      var ch=$("#ch");
      opts.forEach(function(o){
        var b=document.createElement("button"); b.className="choice"; b.textContent=o;
        b.addEventListener("click",function(){ if(answered) return; judgeChoice(b,o,solution,item); });
        ch.appendChild(b);
      });
    } else { /* type */
      c.innerHTML=head+'<div class="hint">Tippe die Übersetzung ein</div>'+
        '<div class="answer"><input id="ipt" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="…"><button id="chk">Prüfen</button></div>'+
        '<div class="verdict" id="vd"></div><div class="exs" id="exs"></div>';
      var ipt=$("#ipt"); ipt.focus();
      var go=function(){ if(!answered) judgeText(ipt.value,item); };
      $("#chk").addEventListener("click",go);
      ipt.addEventListener("keydown",function(e){ if(e.key==="Enter") go(); });
    }

    var sb=c.querySelector("[data-say]");
    if(sb) sb.addEventListener("click",function(){ say(sb.getAttribute("data-say")); });
    if(d==="en2de") say(p.en);
  }

  function artName(){
    // Bei Multiple-Choice steht die Anzahl mit dabei: "vok-auswahl-5" ist eine
    // ganz andere Aufgabe als "vok-auswahl-2", und in der Auswertung soll man
    // das auseinanderhalten koennen.
    if (rundenModus === "mc") return "vok-auswahl-" + wahlAnzahl;
    return { type:"vok-tippen", cloze:"vok-luecke", hoeren:"vok-hoeren" }[rundenModus] || "vokabel";
  }

  function award(item,correct){
    answered=true;
    // Beim ERSTEN Versuch zählt es fürs Gedächtnis - wer dreimal rät und
    // dann trifft, kann das Wort noch nicht.
    if(item.tries === 0){
      wortMerken(item.unitId, item.p, correct);
      erstGesamt++;
      if(correct){ erstRichtig++; lauf++; if(lauf>laufBest) laufBest=lauf; } else { lauf=0; }
      // Einheit als Merkmal - daran sieht man in der Auswertung, wo es hakt.
      var einheit = allUnits().filter(function(u){return u.id===item.unitId;})[0];
      protokoll.push({
        merkmal: (einheit ? einheit.name : "Vokabeln").toLowerCase(),
        // Die Uebungsart steht mit in der Auswertung - daran sieht man, ob
        // sie wirklich abruft (tippen, hoeren) oder nur wiedererkennt (mc).
        art: artName(),
        stimmt: !!correct,
        nachspielzeit: false,
        sekunden: karteBegonnen ? Math.round((Date.now()-karteBegonnen)/1000) : 0,
        /* Bis 18.10.2026 stand hier item.p.de - also die deutsche Vokabel,
           nicht das, was Helena getippt hatte. Jetzt ihre Eingabe (auch bei
           "fast", damit die Eltern die Schreibweise sehen), die erwartete
           Loesung und das abgefragte Wort. */
        gegeben: (correct && !item._fast) ? "" : String(item._gegeben != null ? item._gegeben : item._waehlt || "").slice(0,80),
        richtig: String(item._sol != null ? item._sol : item.p.en).slice(0,80),
        frage: String(frageText(item)).slice(0,160)
      });
    }
    if(correct){ mastered++; xp+=10; queue.shift(); }
    else{
      item.tries++; if(wrongWords.indexOf(item.p)<0) wrongWords.push(item.p);
      queue.shift(); queue.splice(Math.min(3,queue.length),0,item);
      total=mastered+queue.length;
    }
    xp=Math.max(0,xp); set(PRE+"-xp",String(xp)); paintStats();
    writeProgress(mastered, wrongWords.length);
  }

  function afterAnswer(correct,solution,item,erg){
    var vd=$("#vd"), T=window.LWToleranz;
    var gegeben = item && item._gegeben;
    var nah = T && gegeben && erg && T.unterschied(gegeben, erg.treffer || solution);
    if(correct && erg && erg.stufe==="fast"){
      vd.className="verdict ok"; vd.textContent="Fast richtig! ✦ +10 XP"; good();
      T.zeigen(vd, gegeben, erg.treffer || solution, { wo: "So schreibt man es:" });
    }
    else if(correct){ vd.className="verdict ok"; vd.textContent="Richtig! ✦ +10 XP"; good(); }
    else if(nah){
      // Knapp daneben (z. B. falscher Artikel): sehen, WO es hakt.
      vd.className="verdict no"; vd.textContent="Knapp daneben"; bad();
      T.zeigen(vd, gegeben, solution, { wo: "Richtig wäre:" });
    }
    else{ vd.className="verdict no"; vd.textContent="Richtig wäre: "+solution; bad(); }
    if(item && item.p && item.p.ex){ var e=$("#exs"); if(e) e.textContent="„"+item.p.ex+"\u201c"; }
    var b=document.createElement("button"); b.className="next"; b.textContent="Weiter ›";
    b.addEventListener("click",nextCard);
    $("#card").appendChild(b); b.focus();
  }

  function judgeChoice(btn,chosen,solution,item){
    // Auswahl bleibt exakt: ein Nachbarknopf kann sich nur in einem
    // Buchstaben unterscheiden und ist trotzdem falsch.
    var correct=(chosen===solution);
    item._waehlt=chosen; item._gegeben=null; item._fast=false;
    award(item,correct);
    [].forEach.call($("#ch").children,function(x){
      x.disabled=true;
      if(x.textContent===solution) x.classList.add("ok");
      else if(x===btn && !correct) x.classList.add("no");
    });
    if(item.p && item.p.en) say(item.p.en);
    afterAnswer(correct,solution,item);
  }

  /* Toleranter Vergleich (18.10.2026, Denny: richtige Antworten von Helena
     galten als falsch, weil die Schreibweise abwich). Die Regel steht EINMAL
     in /toleranz.js: kleine Tippfehler und fehlende Akzente sind "fast" -
     das zaehlt als richtig, die richtige Schreibweise steht aber gross da.
     Kurzformen (don't = do not), mehrere Loesungen ("der Laden / das
     Geschaeft", "guten Tag, hallo") und Klammerteile ("(to) run") gelten.
     Artikel: in Englisch und Deutsch egal wie bisher, in Franzoesisch gehoert
     le/la zum Wort. Fehlt /toleranz.js, gilt der alte exakte Vergleich. */
  /* Was auf der Karte gefragt war. Bei Lueckentext und Hoeren ist _prompt
     die Loesung selbst - dort steht die Bedeutung (p.de) auf der Karte. */
  function frageText(item){
    if(item._d) return item._prompt || "";
    return (item.p && item.p.de) || "";
  }
  function spracheVon(item){
    if(item._solLang==="de") return "de";
    return String(K.stimmeVorwahl||"en").slice(0,2).toLowerCase()==="fr" ? "fr" : "en";
  }
  function andereWoerter(item){
    var feld = item._solLang==="de" ? "de" : "en";
    var einheit = allUnits().filter(function(u){return u.id===item.unitId;})[0] || curUnit;
    return ((einheit && einheit.pairs) || []).map(function(x){ return x[feld]; })
      .filter(function(w){ return w && w!==item._sol; });
  }
  function bewerten(val,item){
    var T = window.LWToleranz;
    if(!T) return { stufe: normalize(val)===normalize(item._sol) ? "gut" : "schlecht", treffer: item._sol };
    var sp = spracheVon(item);
    /* Steht auch in der Frage ein "/" oder Komma, ist es ein PAAR ("sur / sous"
       = "auf / unter", "un, deux, trois"): dann muessen alle Teile dastehen.
       Sonst sind es Alternativen ("enchanté / enchantée" fuer "sehr erfreut"). */
    var paar = /[\/,;]/.test(String(frageText(item)).replace(/\([^)]*\)/g,""));
    return T.pruefen(val, item._sol, { sprache: sp, trennen: paar ? "keine" : "alle", artikelEgal: sp!=="fr",
      verboten: andereWoerter(item) });
  }
  function judgeText(val,item){
    var erg = bewerten(val,item);
    var correct = erg.stufe==="gut" || erg.stufe==="fast";
    var ipt=$("#ipt"); ipt.classList.add(correct?"ok":"no"); ipt.disabled=true;
    var chk=$("#chk"); if(chk) chk.disabled=true;
    item._gegeben = String(val||"").trim();
    item._fast = erg.stufe==="fast";
    award(item,correct);
    if(item.p && item.p.en) say(item.p.en);
    afterAnswer(correct,item._sol,item,erg);
  }

  /* ---------- Statistik, tunnelfest ----------
     Im Zug bricht die Verbindung weg. Eine Runde, die nicht durchgeht, wandert
     in eine Warteschlange im Browser und wird beim naechsten Mal mitgeschickt.
     Sonst waere ausgerechnet das Ueben unterwegs das, was nie gezaehlt wird. */
  var AUSGANG = PRE+"-ausgang";

  function ausgangLaden(){
    try{ var a=JSON.parse(get(AUSGANG,"[]")); return Array.isArray(a)?a:[]; }catch(e){ return []; }
  }
  function ausgangSichern(a){ try{ set(AUSGANG, JSON.stringify(a.slice(-30))); }catch(e){} }

  function ausgangLeeren(){
    var warten=ausgangLaden();
    if(!warten.length) return;
    ausgangSichern([]);                       // erst raus, dann senden
    var uebrig=[];
    var offen=warten.length;
    warten.forEach(function(runde){
      fetch("/api/statistik",{method:"POST",credentials:"same-origin",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({kind:"helena", runde:runde})})
        .then(function(a){ if(!a.ok) uebrig.push(runde); })
        .catch(function(){ uebrig.push(runde); })
        .then(function(){ if(--offen===0 && uebrig.length) ausgangSichern(ausgangLaden().concat(uebrig)); });
    });
  }

  function LS(){ return window.lernstand || null; }

  function lernstandSenden(){
    if(!protokoll.length) return;
    var runde={
      spielId:K.spielId, titel:K.titel,
      quelle:(curUnit&&curUnit.id)||"", fach:K.fach,
      thema:(curUnit&&curUnit.name)||"Vokabeln", lernbereich:"",
      // Dieselbe ehrliche Uhr wie in Pauls Welt: Wanduhrzeit ist keine
      // Lernzeit. Wer das Handy weglegt und wiederkommt, sammelt sonst
      // Minuten, in denen nichts geübt wurde.
      sekunden: LS() ? LS().aktiveSekunden()
                     : (rundeBegonnen ? Math.round((Date.now()-rundeBegonnen)/1000) : 0),
      pause: LS() ? Math.max(0, LS().wanduhrSekunden() - LS().aktiveSekunden()) : 0,
      zeitart: "lernen",
      // Ohne das stand bei Helenas Runden kein Geraet - und damit liess sich
      // nicht pruefen, wogegen ihr Layout eigentlich stimmen muss.
      geraet: LS() ? LS().geraet() : "",
      // Wie viele Woerter stehen ueberhaupt zur Verfuegung? Ohne das kann die
      // Elternseite nicht sagen, wie viel vom Vorrat schon angefasst ist.
      vorrat: allUnits().reduce(function(n,u){ return n + (u.pairs ? u.pairs.length : 0); }, 0),
      aufgaben: protokoll
    };
    protokoll=[];
    if(LS()) LS().uhrZuruecksetzen();
    ausgangSichern(ausgangLaden().concat([runde]));
    ausgangLeeren();
  }

  ausgangLeeren();
  window.addEventListener("online", ausgangLeeren);

  function finish(){
    // Erst ablesen, dann senden: lernstandSenden stellt die Uhr zurueck.
    var geuebteSekunden = LS() ? LS().aktiveSekunden()
                               : (rundeBegonnen ? Math.round((Date.now()-rundeBegonnen)/1000) : 0);
    lernstandSenden();
    heuteMalen(); sitztMalen();
    $("#play").style.display="none";
    ansicht("ende");
    window.scrollTo(0,0);
    var e=$("#end"); e.style.display="block";

    var reviewHtml="";
    if(wrongWords.length){
      reviewHtml='<div class="review"><b>Nochmal anschauen:</b>'+
        wrongWords.map(function(p){return '<div>'+esc2(p.en)+' \u2014 '+esc2(p.de)+'</div>';}).join("")+'</div>';
    }

    // Sterne sind eine Ruueckschau, keine Huerde: Wer mitgemacht hat, bekommt
    // mindestens einen. Gezaehlt wird der erste Versuch - wer dreimal raet und
    // dann trifft, kann das Wort noch nicht.
    var quote = erstGesamt ? erstRichtig/erstGesamt : 0;
    var sterne = erstGesamt===0 ? 0 : (quote>=.9 ? 3 : (quote>=.7 ? 2 : 1));
    var sternHtml='<div class="sterne" aria-label="'+sterne+' von 3 Sternen">'+
      "\u2605\u2605\u2605".slice(0,sterne).replace(/./g,'<span class="an">\u2605</span>')+
      "\u2606\u2606\u2606".slice(0,3-sterne).replace(/./g,'<span class="aus">\u2606</span>')+
      '</div>';

    // Ueber die Anstrengung reden, nicht ueber Begabung.
    var kopf, unter;
    if(erstGesamt===0){ kopf="Runde beendet"; unter="Beim n\u00e4chsten Mal geht\u2019s los."; }
    else if(sterne===3){ kopf="Sitzt \u2013 fast alles auf Anhieb"; unter="Du hast "+erstRichtig+" von "+erstGesamt+" gleich beim ersten Versuch gewusst."; }
    else if(sterne===2){ kopf="Gut drangeblieben"; unter="Die "+(erstGesamt-erstRichtig)+" W\u00f6rter, die geklemmt haben, kommen wieder \u2013 genau darum sitzen sie danach."; }
    else { kopf="Schwere Runde durchgezogen"; unter="Genau das bringt am meisten. Was heute wackelte, ist morgen wieder dran."; }

    var neuerRekord=false;
    var alterRekord=parseInt(get(PRE+"-rekord","0"),10)||0;
    if(laufBest>alterRekord){ set(PRE+"-rekord",String(laufBest)); neuerRekord=true; }
    var rekordHtml = laufBest>=3
      ? '<p class="rekord">'+(neuerRekord?"Neuer Rekord: ":"L\u00e4ngste Serie: ")+laufBest+
        " richtige hintereinander"+(neuerRekord?" \ud83c\udf89":"")+'</p>'
      : "";

    // Helena am 07.09.2026: die Serie stand nur oben in der Leiste und war
    // nach der Runde weg - dabei ist genau das der Moment, in dem sie gerade
    // um einen Tag gewachsen ist.
    var serieText, serieZusatz;
    if(streak>1){
      serieText=streak+" Tage in Folge";
      serieZusatz=serieNeuHeute ? "heute drangeh\u00e4ngt" : "";
    } else {
      serieText="Heute ge\u00fcbt";
      serieZusatz="Tag 1 deiner Serie";
    }
    var serieHtml='<div class="serie'+(serieNeuHeute?" gewachsen":"")+'">'+
      "\ud83d\udd25 "+serieText+
      (serieZusatz?' <small>'+serieZusatz+'</small>':'')+'</div>';

    var s=sitztZaehlen();
    // Dieselbe Zahl, die auch in der Auswertung landet - sonst stimmt das
    // eine nicht mit dem anderen überein.
    var minuten = Math.round(geuebteSekunden / 60);

    e.innerHTML='<div class="done">'+
      sternHtml+
      '<h2>'+kopf+'</h2>'+
      '<p>'+unter+'</p>'+
      rekordHtml+
      serieHtml+
      '<div class="bilanz">'+
        '<div><b>'+erstGesamt+'</b><small>W\u00f6rter ge\u00fcbt</small></div>'+
        '<div><b>'+s.sitzt+'</b><small>sitzen fest</small></div>'+
        '<div><b>'+(minuten||"<1")+'</b><small>Minuten</small></div>'+
      '</div>'+
      // Am Anfang steht dort eine Null. Die ist richtig - aber sie braucht
      // eine Erklaerung, sonst sieht ein guter Durchgang nach nichts aus.
      (s.sitzt===0
        ? '<p class="fussnote">\u201esitzen fest\u201c z\u00e4hlt erst, wenn du ein Wort nach ' +
          'Tagen Pause noch konntest. Daf\u00fcr hast du heute den Grundstein gelegt' +
          (s.aufDemWeg ? ' \u2013 '+s.aufDemWeg+' sind schon auf dem Weg.' : '.') + '</p>'
        : '')+
      reviewHtml+
      '<button class="start" id="again">Noch eine Runde</button>'+
      '<button class="ghost" id="zurueckUebersicht" type="button">Zur \u00dcbersicht</button>'+
      '</div>';
    $("#again").addEventListener("click",function(){ $("#end").style.display="none"; startSession(); });
    $("#zurueckUebersicht").addEventListener("click",endToSetup);
    writeProgress(mastered, wrongWords.length);
    if(sterne===3){ confetti(); fanfare(); } else { good(); }
  }

  function esc2(s){ var d=document.createElement("div"); d.textContent=String(s==null?"":s); return d.innerHTML; }

  function sitztMalen(){
    var el=$("#sitzt"); if(!el) return;
    el.textContent=sitztZaehlen().sitzt;
  }
  sitztMalen();

  $("#startBtn").addEventListener("click",startSession);

  function endToSetup(){
    try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
    $("#play").style.display="none"; $("#end").style.display="none"; $("#setup").style.display="block";
    ansicht("start"); window.scrollTo(0,0);
    blip();
  }
  $("#backBtn").addEventListener("click", endToSetup);

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
  var pvOffen = 0;
  function pvOffenMalen(){
    var z=$("#vfOffen"), b=$("#saveUnit");
    if(z){ z.textContent = pvOffen ? ("Noch "+pvOffen+" Rückfrage"+(pvOffen>1?"n":"")+" offen – erst dann kannst du speichern.") : ""; z.style.display = pvOffen ? "block" : "none"; }
    if(b){ b.disabled = pvOffen>0; }
  }
  function zeileEinfuegen(en,de,pos){
    var rows=$("#pvrows"); if(!rows) return null;
    var r=document.createElement("div"); r.className="pvrow";
    r.setAttribute("data-pos", pos==null ? "1e9" : String(pos));
    r.innerHTML='<input class="pven" placeholder="'+K.spracheKlein+'" value="'+attrEsc(en)+'">'+
      '<span class="pvarr">→</span>'+
      '<input class="pvde" placeholder="deutsch" value="'+attrEsc(de)+'">'+
      '<button class="pvx" type="button" title="Zeile entfernen" aria-label="Zeile entfernen">✕</button>';
    r.querySelector(".pvx").addEventListener("click",function(){ if(r.parentNode) r.parentNode.removeChild(r); });
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
    function setzen(en,de,text){
      if(!erledigt){ erledigt=true; pvOffen--; }
      if(zeile && zeile.parentNode) zeile.parentNode.removeChild(zeile);
      zeile = (en && de) ? zeileEinfuegen(en,de,r.pos) : null;
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
      b.textContent=(gute.length>1?"So steht es da: ":"Stimmt so: ")+l.fremd+" → "+l.deutsch;
      b.addEventListener("click",function(){ setzen(l.fremd,l.deutsch,"✓ "+attrEsc(l.fremd)+" → "+attrEsc(l.deutsch)); blip(); });
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
      setzen(en,de,"✓ "+attrEsc(en)+" → "+attrEsc(de)+" <small>(selbst getippt)</small>"); blip();
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
    pairs.forEach(function(p,i){ zeileEinfuegen(p.en,p.de,p.pos!=null?p.pos:i); });
    if(opt.pruefen && opt.pruefen.length){
      var liste=$("#vfListe");
      opt.pruefen.forEach(function(r){ rueckfrageBauen(r, opt.urls, liste); });
    }
    pvOffenMalen();
    if(opt.nochmal && $("#vfNochmal")) $("#vfNochmal").addEventListener("click",opt.nochmal);
    $("#addRow").addEventListener("click",function(){ zeileEinfuegen("","",null); });
    $("#swapBtn").addEventListener("click",function(){
      [].forEach.call($("#pvrows").querySelectorAll(".pvrow"),function(r){
        var a=r.querySelector(".pven"), b=r.querySelector(".pvde"); var t=a.value; a.value=b.value; b.value=t;
      });
    });
    $("#cancelUnit").addEventListener("click",function(){ box.style.display="none"; box.innerHTML=""; pvOffen=0; });
    $("#saveUnit").addEventListener("click",saveFromPreview);
  }

  function saveFromPreview(){
    var msg=$("#addMsg");
    // Nichts Unbestätigtes rutscht in die Einheit.
    if(pvOffen>0){ msg.textContent="Bitte erst die Rückfragen oben beantworten."; msg.style.color="var(--no)"; var k=$("#vfKasten"); if(k) k.scrollIntoView({block:"start"}); return; }
    var name=($("#unitName").value||"").trim() || "Neue Einheit";
    var pairs=[];
    [].forEach.call($("#pvrows").children,function(r){
      var en=r.querySelector(".pven").value.trim(), de=r.querySelector(".pvde").value.trim();
      if(en && de) pairs.push({en:en, de:de});
    });
    if(pairs.length<2){ msg.textContent="Bitte mindestens 2 Paare."; msg.style.color="var(--no)"; return; }
    var units=customUnits(); var id="u"+Date.now();
    units.push({id:id, name:name, pairs:pairs});
    set(PRE+"-custom-units",JSON.stringify(units));
    fillUnits(id); renderMyUnits();
    $("#unitName").value=""; $("#pasteBox").value="";
    var box=$("#preview"); box.style.display="none"; box.innerHTML="";
    seitenLeeren();
    msg.textContent="Gespeichert: „"+name+"“ ("+pairs.length+" Vokabeln) ✓"; msg.style.color="var(--ok)";
    blip();
  }

  $("#detectBtn").addEventListener("click",function(){
    var pairs=parseVocab($("#pasteBox").value);
    var msg=$("#addMsg");
    if(!pairs.length){ msg.textContent="Nichts erkannt – bitte Text einfügen und erneut auf Erkennen tippen."; msg.style.color="var(--no)"; return; }
    msg.textContent=""; renderPreview(pairs);
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
      msg.textContent="Höchstens "+MAX_SEITEN+" Seiten – "+(neu.length-platz)+" Foto"+(neu.length-platz>1?"s":"")+" habe ich weggelassen."; msg.style.color="var(--no)";
      neu=neu.slice(0,Math.max(0,platz));
    }
    var offen=neu.length; if(!offen) return;
    var reserv=neu.map(function(f){ var s={file:f, url:null}; vfSeiten.push(s); return s; });
    seitenMalen();
    reserv.forEach(function(s){
      fotoVerkleinern(s.file,function(url){
        if(url) s.url=url; else { vfSeiten=vfSeiten.filter(function(x){ return x!==s; }); msg.textContent="Ein Foto ließ sich nicht öffnen."; msg.style.color="var(--no)"; }
        seitenMalen();
      });
    });
    // Neue Seiten = neue Lesung: eine alte Vorschau passt nicht mehr dazu.
    var box=$("#preview"); if(box && box.style.display!=="none" && box.innerHTML){ box.style.display="none"; box.innerHTML=""; pvOffen=0; }
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
        vfSeiten.splice(vfSeiten.indexOf(s),1); seitenMalen();
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
    return (d.paare||[]).map(function(p){ return {en:String(p.fremd||""), de:String(p.deutsch||""), pos:p.pos}; })
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
        if(!pairs.length && !pruefen.length && !(d.fehlend||[]).length){ msg.textContent="Keine Wortpaare gefunden. Bitte die reine Wortliste gerade & scharf fotografieren – oder Text einfügen."; msg.style.color="var(--no)"; return; }
        var fehlend=d.fehlend||[];
        renderPreview(pairs, { meldung:d.meldung, fehlend:fehlend, einmal:einmal, pruefen:pruefen, urls:urls,
          nochmal: fehlend.length ? function(){ fehlendNachlesen(fehlend, urls); } : null });
        // Die Vorschau steht unter dem Textfeld - dorthin springen, die Rückfragen zuerst.
        try{ $("#preview").scrollIntoView({block:"start", behavior:"smooth"}); }catch(e){}
        return;
      }
      if(d && d.ok===false && d.rueckfall===false){ setOcr(""); msg.textContent=d.fehler||"Das ging nicht."; msg.style.color="var(--no)"; return; }
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
      serverPaare(d).forEach(function(p){ if(!vorhanden[(p.en+"|"+p.de).toLowerCase()]) zeileEinfuegen(p.en,p.de,umrechnen(p.pos)); });
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
      if(!ok){ setOcr(""); msg.textContent="Texterkennung ließ sich nicht laden – Internet prüfen oder Liste als Text einfügen."; msg.style.color="var(--no)"; return; }
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
          if(!alle.length){ msg.textContent="Keine Wortpaare gefunden. Bitte die reine Wortliste gerade & scharf fotografieren – oder Text einfügen."; msg.style.color="var(--no)"; return; }
          msg.textContent=""; renderPreview(alle, { ohnePruefung:true });
        })
        .catch(function(){ try{ if(worker) worker.terminate(); }catch(e){} setOcr(""); msg.textContent="Bei der Erkennung ging etwas schief – bitte nochmal versuchen."; msg.style.color="var(--no)"; });
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
      ".adder button.vfweg{background:transparent;color:var(--no);border:1px solid var(--line);min-height:44px;padding:8px 12px;font-size:13px}"+
      ".vfzahl{color:var(--muted);font-size:12.5px;margin-top:6px}"+
      ".photobtn.vflesen{margin-top:10px;min-height:50px}"+
      ".photobtn.vflesen:disabled{opacity:.55;cursor:default}"+
      ".vfwarn{background:color-mix(in srgb,var(--no) 14%,var(--surface2));border:1px solid var(--no);border-radius:12px;padding:11px 13px;margin:10px 0;font-size:13.5px;line-height:1.55;color:var(--ink)}"+
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
      ".vfoffen{margin-top:10px;font-size:13px;font-weight:700;color:var(--no)}"+
      "#saveUnit:disabled{opacity:.5;cursor:default}"+
      ".pvx{min-width:44px;min-height:44px}"+
      ".pvrow input{min-height:44px}";
    var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);
  })();

  /* ---------- Eigene Einheiten verwalten (löschen) ---------- */
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
        var id=btn.getAttribute("data-id");
        var left=customUnits().filter(function(u){return u.id!==id;});
        set(PRE+"-custom-units",JSON.stringify(left));
        fillUnits(); renderMyUnits(); blip();
      });
    });
  }
  renderMyUnits();

  /* ---------- Konfetti ---------- */
  function confetti(){
    if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var c=$("#cf"); if(!c.getContext) return; var x=c.getContext("2d");
    c.width=innerWidth; c.height=innerHeight;
    var cols=["#a78bfa","#7c5cff","#49d6bd","#ffce5c","#ff7a6b"], P=[];
    for(var i=0;i<120;i++)P.push({x:Math.random()*c.width,y:-20-Math.random()*c.height*.4,
      r:5+Math.random()*6,vy:2+Math.random()*3.5,vx:-1.5+Math.random()*3,
      rot:Math.random()*6.28,vr:-.2+Math.random()*.4,col:cols[i%cols.length]});
    var f=0;(function loop(){ x.clearRect(0,0,c.width,c.height); f++;
      P.forEach(function(p){ p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;p.vy+=.05;
        x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.fillStyle=p.col;
        x.fillRect(-p.r/2,-p.r/2,p.r,p.r*.6);x.restore(); });
      if(f<200)requestAnimationFrame(loop); else x.clearRect(0,0,c.width,c.height);
    })();
  }

})();
