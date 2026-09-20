/* Die Spiel-Schmiede - ein Motor fuer Paul, Leon und Helena (16.09.2026).
 *
 * Bis zum 16.09.2026 stand alles in paul/schmiede.html. Denny: "Leon hat
 * gerade moniert, dass in seiner Lernwelt nicht die Moeglichkeiten bestehen,
 * wie Paul ein neues Spiel zu erfinden ... Denke bitte an sein Alter und seine
 * Faehigkeiten." Und: "Bitte setze das auch gleich fuer Helena um."
 *
 * Statt 1700 Zeilen zweimal zu kopieren, liegt der Motor jetzt hier. Jede
 * Seite setzt vorher window.SCHMIEDE und hat ein <div id="schmiede"></div>:
 *   kind, name, titel, speicher ("<kind>-schmiede" - die Vorsilbe braucht der Sync),
 *   zurueck:{href,text,endeText}, faecher:[{id,label}], themen:[...],
 *   wunschBeispiel, torLabel, raetselHinweis, eingabeModus ("numeric"|"text"),
 *   textAntworten, vorlesen, vorlesenVonSelbst, schritte:[{frage,unter}],
 *   welten/figuren/steuerungen/toene (optional, gleiche Schluessel!), wahl
 * Die Themen-SCHLUESSEL muessen dieselben sein wie in der Werkstatt des Kindes,
 * sonst findet die Schmiede fertige Spiele im Regal nicht.
 */
(function(){
  var K = window.SCHMIEDE || {};
  var ESC = function(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  var SKELETT = `<div class="huelle" id="werkbank">

  <header>
    <a class="zurueck" id="zurueck" href="@@ZURUECK_HREF@@">@@ZURUECK_TEXT@@</a>
    <h1>@@TITEL@@</h1>
  </header>

  <!-- 0. Anmelden -->
  <section id="sicht-anmelden" class="verborgen">
    <div class="karte anmeldung">
      <div class="schloss">🔐</div>
      <h2>Hallo @@NAME@@!</h2>
      <p class="unter">Hier baust nur du. Gib deinen Code ein.</p>
      <input class="codefeld" id="code" type="password" inputmode="numeric"
             autocomplete="off" maxlength="12" aria-label="Dein Code">
      <div class="codefehler" id="codefehler"></div>
      <button class="los" id="anmelden">Los geht's</button>
    </div>
  </section>

  <!-- 1. Schritt für Schritt -->
  <section id="sicht-schritte" class="verborgen">
    <div class="karte">
      <!-- Spielstand (Leon, 16.09.2026, Bild vom iPad): "keine Spielstände
           speichern". Wer mitten im Spiel raus ist, macht hier weiter. -->
      <div class="weiterspielen verborgen" id="weiterspielen">
        <div class="ws-text"><b>▶️ Weiterspielen</b><span id="ws-info"></span></div>
        <button class="los" id="ws-los" type="button">Weiterspielen</button>
      </div>

      <div class="wegweiser" id="wegweiser"></div>
      <div class="schrittfrage" id="schrittfrage"></div>
      <p class="unter" id="schrittunter"></p>

      <div class="faecher verborgen" id="faecher">
        @@FAECHER@@
      </div>

      <div class="felder" id="felder"></div>

      <div class="wunschfeld verborgen" id="wunschfeld">
        <label for="wunsch">Oder schreib selbst rein, worum es gehen soll</label>
        <textarea id="wunsch" maxlength="600"
          placeholder="@@WUNSCH_BEISPIEL@@"></textarea>
        <div class="tipp">Wenn du hier etwas hineinschreibst, gilt das statt des Feldes oben.</div>
      </div>

      <div id="meldung"></div>

      <div class="reihe">
        <button class="zurueckschritt verborgen" id="schritt-zurueck">‹ Zurück</button>
        <button class="los" id="schritt-weiter">Weiter</button>
      </div>

      <div class="zettel verborgen" id="zettel">
        <div class="kopf">🛠️ Dein Bauzettel</div>
        <div class="zeile" id="zettel-zeilen"></div>
      </div>
    </div>
  </section>

  <!-- 2. Es wird gebaut -->
  <section id="sicht-laden" class="verborgen">
    <div class="karte laden">
      <div class="kreis"></div>
      <div class="schritt" id="lade-titel">Ich schmiede dein Spiel …</div>
      <p class="unter" id="lade-unter">Das dauert einen kleinen Moment.</p>
    </div>
  </section>

</div>

<!-- 3. Gespielt wird auf der Bühne -->
<div id="buehne">
  <canvas id="leinwand"></canvas>

  <div id="kopf">
    <div id="anzeigen">
      <div class="pille" id="geloestzaehler">✅ 0</div>
      <div class="pille" id="stationszaehler">1 / 8</div>
      <div class="pille" id="punkte">⭐ 0</div>
    </div>
    <div id="fragekarte">
      <div id="fragelabel">Spring zur richtigen Antwort!</div>
      <button class="eckknopf verborgen" id="vorleseknopf" type="button" aria-label="Frage vorlesen">🔊</button>
      <div id="fragetext">Bereit?</div>
    </div>
  </div>

  <button class="eckknopf" id="rausknopf" aria-label="Spiel verlassen">Raus</button>
  <button class="eckknopf" id="tonknopf" aria-label="Ton an oder aus">🔊</button>
  
  <div id="steuerung">
    <div class="knopfgruppe" id="gruppe-laufen">
      <button class="knopf" id="knopf-links" aria-label="Nach links">◀</button>
      <button class="knopf" id="knopf-rechts" aria-label="Nach rechts">▶</button>
    </div>
    <div class="knopfgruppe rechts">
      <button class="knopf" id="knopf-sprung" aria-label="Springen">SPRUNG</button>
    </div>
  </div>

  <!-- Rätsel-Tor: Aufgaben, die man nicht anspringen kann, weil man sie tippen muss -->
  <div class="schirm weg" id="schirm-raetsel">
    <div class="tafel">
      <h2 id="raetsel-titel">🔒 Rätsel-Tor</h2>
      <div class="frageGross" id="raetsel-frage"></div>
      <div class="weg-hinweis verborgen" id="raetsel-weg"></div>
      <div class="eingabe">
        <input type="text" inputmode="@@EINGABE_MODUS@@" autocomplete="off" autocorrect="off"
               spellcheck="false" id="raetsel-feld" aria-label="Deine Antwort" placeholder="?">
        <button id="raetsel-pruefen">Prüfen</button>
      </div>
      <p style="font-size:14px;color:#64748b;margin:0">@@RAETSEL_HINWEIS@@</p>
    </div>
  </div>

  <!-- Nach einer Aufgabe: Rechenweg und Merkhilfe -->
  <div class="schirm weg" id="schirm-loesung">
    <div class="tafel">
      <h2 id="loesung-titel">Richtig! 🎉</h2>
      <div class="schritte" id="loesung-weg"></div>
      <div class="merke verborgen" id="loesung-merke"></div>
      <button class="startknopf" id="loesung-weiter">Weiter geht's!</button>
    </div>
  </div>

  <!-- Ende -->
  <div class="schirm weg" id="schirm-ende">
    <div class="tafel">
      <h2 id="ende-titel">Geschafft! 🎉</h2>
      <p id="ende-text"></p>
      <div class="punktegross" id="ende-punkte">0</div>
      <div class="rekord" id="ende-rekord"></div>
      <button class="startknopf" id="ende-nochmal">Nochmal spielen 🔁</button>
      <button class="nebenknopf" id="ende-neu">Ein ganz neues Spiel schmieden</button>
      <button class="nebenknopf" id="ende-raus">@@ENDE_RAUS@@</button>
    </div>
  </div>
</div>

<canvas class="konfetti" id="konfetti"></canvas>`;
  var html = SKELETT
    .replace("@@ZURUECK_HREF@@", ESC(K.zurueck.href)).replace("@@ZURUECK_TEXT@@", ESC(K.zurueck.text))
    .replace("@@TITEL@@", ESC(K.titel)).replace("@@NAME@@", ESC(K.name))
    .replace("@@FAECHER@@", (K.faecher || []).map(function(f, i){
      return '<button class="fach' + (i === 0 ? " an" : "") + '" type="button" data-fach="' + ESC(f.id) + '">' + ESC(f.label) + '</button>';
    }).join("\n        "))
    .replace("@@WUNSCH_BEISPIEL@@", ESC(K.wunschBeispiel)).replace("@@RAETSEL_HINWEIS@@", ESC(K.raetselHinweis))
    .replace("@@ENDE_RAUS@@", ESC(K.zurueck.endeText)).replace("@@EINGABE_MODUS@@", ESC(K.eingabeModus || "numeric"));
  var platz = document.getElementById("schmiede");
  platz.insertAdjacentHTML("beforebegin", html);
  platz.parentNode.removeChild(platz);
})();

"use strict";
(function(){
  var K = window.SCHMIEDE || {};

  /* =====================================================================
     Pauls Spiel-Schmiede
     ---------------------------------------------------------------------
     Paul am 14.09.2026 (Meldung 8fcenvfnsh), nachdem er dreimal
     richtiggestellt hat, was er eigentlich meint:

        "Ein richtig großes Spielbauen steht aber immer noch später. Ich
         rede mit dir gerade die ganze Zeit darüber, dass ich in der
         Lernwerkstatt selber ein Spiel bauen kann, ein größeres."

     und auf die Frage, ob die Werkstatt ihn dabei Schritt für Schritt
     fragen soll oder ob er lieber alles auf einmal hineinschreibt:

        "Schritt für Schritt, bitte."

     Bis dahin stand in seiner Lernwelt ein Fenster, das ihn für das grosse
     Spiel an Denny und den Lern-Chat verwiesen hat. Genau das wollte er
     nicht. Hier ist der Weg dorthin ohne Warten auf einen Erwachsenen.

     Was hier NICHT passiert: Es wird kein fremder Programmtext erzeugt und
     ausgefuehrt. Der Motor steht fertig in dieser Datei; Paul stellt ihn
     ein. Das ist der Unterschied zwischen "ein Kind baut sich ein Spiel"
     und "eine Seite fuehrt aus, was ihr jemand hinschreibt".

     Der Lernstoff kommt aus demselben Weg wie in der Werkstatt
     (/api/spiel-bauen) - und was dort schon gebaut wurde, wird sofort
     wieder gespielt statt neu gebaut. Ein Spiel kostet echtes Geld und
     90 Sekunden Warten; beides gespart, wenn zum Thema schon etwas
     bereitliegt. Erkannt wird das ueber "quelle", nie ueber den Titel.

     WARUM HIER NICHTS WEGGENOMMEN WIRD (Meldung csnzy24mrm, 20.09.2026)
     Paul, mit einem Bild vom Schloss ueber seiner Figur: "ich will nicht
     das das nochmal pasiert in der spiel scchmiede" - und zwei Nachfragen
     spaeter: "es hat dan schon geklappt aber ich habe hals ein herz
     verloren". Er hat das Raetsel-Tor also geschafft und trotzdem etwas
     verloren.

     Dennys Bauregeln vom 04.09.2026 sagen dazu: "Kein Druck ueber
     Verlustangst: keine 'Serie ist weg'-Meldung, kein Countdown, keine
     knappe Ressource, die das Lernen bremst." Fuer die Gegner war das
     laengst umgesetzt (sie kosten Sterne, keine Herzen) - fuer die
     ANTWORTEN nicht, und genau dort tut es weh: Wer sich beim Rechnen
     vertut, verliert ein Leben, und das Spiel endet frueher.

     Seit dem 20.09.2026 gibt es die Herzen nicht mehr. An ihrer Stelle
     steht oben, wie viele Aufgaben schon geloest sind (Haken) - eine Zahl,
     die waechst, statt einer, die schrumpft. Eine falsche Antwort ruettelt,
     klingt und bringt Erklaerung und Loesung; mehr passiert nicht. Am
     Raetsel-Tor gibt es weiter zwei Versuche, der zweite jetzt MIT Hinweis.
     Wer das wieder umdreht, dreht eine Entscheidung von Denny um, nicht
     nur eine Einstellung.
     ===================================================================== */

  function $(id){ return document.getElementById(id); }
  function mische(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
  function zeigen(el, ja){ if(el) el.classList.toggle("verborgen", !ja); }

  /* ---------------------------------------------------------------
     Die Bauteile, aus denen Paul sein Spiel zusammenstellt.
     Jedes Stueck hat einen "schluessel". Der wandert in den Speicher
     und wird - wie bei den Themenfeldern - nie wieder umbenannt.
     --------------------------------------------------------------- */

  var WELTEN = [
    { schluessel:"weltraum", bild:"🚀", titel:"Weltraum", sub:"wenig Schwerkraft, hohe Sprünge",
      himmel:["#0b1026","#1b2450","#2d3a74"], boden:"#4b5563", bodenOben:"#6b7280",
      fern:"#232c58", nah:"#2f3a6e", schmuck:"sterne", G:0.60, sprung:-13 },
    { schluessel:"dschungel", bild:"🌴", titel:"Dschungel", sub:"grün, laut und voller Ranken",
      himmel:["#7dd3fc","#bbf7d0","#dcfce7"], boden:"#3f6212", bodenOben:"#65a30d",
      fern:"#166534", nah:"#15803d", schmuck:"blaetter", G:0.90, sprung:-15 },
    { schluessel:"tiefsee", bild:"🐠", titel:"Tiefsee", sub:"du schwebst mehr, als du springst",
      himmel:["#082f49","#0c4a6e","#0e7490"], boden:"#7c6f4a", bodenOben:"#a3924f",
      fern:"#0b4363", nah:"#115e75", schmuck:"blasen", G:0.45, sprung:-11 },
    { schluessel:"burg", bild:"🏰", titel:"Ritterburg", sub:"Steinmauern und Fackeln",
      himmel:["#334155","#64748b","#94a3b8"], boden:"#57534e", bodenOben:"#78716c",
      fern:"#475569", nah:"#525c6b", schmuck:"fackeln", G:0.90, sprung:-15 },
    { schluessel:"stadion", bild:"⚽", titel:"Fußballstadion", sub:"Rasen, Flutlicht und Publikum",
      himmel:["#1e3a8a","#3b82f6","#93c5fd"], boden:"#166534", bodenOben:"#22c55e",
      fern:"#1e40af", nah:"#1d4ed8", schmuck:"flutlicht", G:0.90, sprung:-15 },
    { schluessel:"geisterhaus", bild:"👻", titel:"Geisterhaus", sub:"dunkel, neblig, ein bisschen gruselig",
      himmel:["#1e1b4b","#3b0764","#4c1d95"], boden:"#292524", bodenOben:"#44403c",
      fern:"#2e1065", nah:"#3b0764", schmuck:"nebel", G:0.90, sprung:-15 }
  ];

  var FIGUREN = [
    { schluessel:"fuchs",     bild:"🦊", titel:"Fuchs" },
    { schluessel:"roboter",   bild:"🤖", titel:"Roboter" },
    { schluessel:"pinguin",   bild:"🐧", titel:"Pinguin" },
    { schluessel:"dino",      bild:"🦖", titel:"Dino" },
    { schluessel:"astronaut", bild:"🧑‍🚀", titel:"Astronautin" },
    { schluessel:"drache",    bild:"🐉", titel:"Drache" },
    { schluessel:"ritter",    bild:"🛡️", titel:"Ritter" },
    { schluessel:"kleeblatt", bild:"🍀", titel:"Kleeblatt" }
  ];

  var STEUERUNGEN = [
    { schluessel:"laufen",  bild:"🕹️", titel:"Laufen und springen",
      sub:"◀ ▶ zum Laufen, SPRUNG zum Springen. Zweimal tippen = Doppelsprung." },
    { schluessel:"rennen",  bild:"🏃", titel:"Von allein rennen",
      sub:"Du rennst immer nach rechts. Du musst nur noch springen." },
    { schluessel:"fliegen", bild:"🪁", titel:"Fliegen",
      sub:"◀ ▶ zum Fliegen nach links und rechts. FLIEGEN gedrückt halten und du steigst, loslassen und du sinkst." }
  ];

  var TOENE = [
    { schluessel:"froehlich", bild:"🎺", titel:"Fröhlich", sub:"Sprung, Sterne, kleine Melodie" },
    { schluessel:"leise",     bild:"🔈", titel:"Leise",     sub:"nur ein kurzes Klick" },
    { schluessel:"aus",       bild:"🔇", titel:"Aus",       sub:"ganz ohne Ton" }
  ];

  /* Dieselben Themenfelder wie in der Werkstatt, mit denselben Schluesseln.
     Das ist Absicht: Ein Spiel, das Paul sich dort schon hat bauen lassen,
     findet die Schmiede sofort wieder - und umgekehrt. Wer hier einen
     Schluessel aendert, trennt die beiden Regale voneinander. */
  var THEMEN = K.themen;

  /* ---------------------------------------------------------------
     Pauls Einstellungen. Sie duerfen in den localStorage: das sind
     keine Geheimnisse, sondern seine Wahl - und weil paul-sync sie
     mitnimmt, steht sein Spiel auf dem iPad genauso da wie am Laptop.
     Geschrieben wird nur, wenn sich wirklich etwas geaendert hat;
     jeder Schreibvorgang wandert sonst als voller Schnappschuss in
     den Speicher, und davon gibt es am Tag nur 1000.
     --------------------------------------------------------------- */

  var SPEICHER = K.speicher;
  var wahl = Object.assign({ welt:"weltraum", figur:"fuchs", steuerung:"laufen", toene:"froehlich", thema:"" }, K.wahl || {});
  var rekord = 0;
  try {
    var alt = JSON.parse(localStorage.getItem(SPEICHER) || "{}");
    ["welt","figur","steuerung","toene","thema"].forEach(function(k){
      if (typeof alt[k] === "string" && alt[k]) wahl[k] = alt[k];
    });
    rekord = parseInt(alt.rekord || 0, 10) || 0;
  } catch(e){}

  function merken(){
    try {
      var neu = JSON.stringify({ welt:wahl.welt, figur:wahl.figur, steuerung:wahl.steuerung,
                                 toene:wahl.toene, thema:wahl.thema, rekord:rekord });
      if (neu !== localStorage.getItem(SPEICHER)) localStorage.setItem(SPEICHER, neu);
    } catch(e){}
  }

  /* ---------------------------------------------------------------
     Der Spielstand. Leon am 16.09.2026 (Bild vom iPad, mitten im Spiel):
     er kann "keine Spielstände speichern". Stimmt - gemerkt wurden nur
     Einstellungen und Rekord; wer "Raus" tippte oder das iPad weglegte,
     fing wieder bei Aufgabe 1 an.

     Ein Platz je Kind: welches Spiel, welche Aufgabe, Sterne, Herzen.
     Geschrieben wird NUR beim Verlassen (Raus, Seite weg, iPad zu) und
     beim Ende geloescht - nicht nach jeder Aufgabe. Jeder Schreibvorgang
     geht ueber den Sync in den Speicher, und davon gibt es 1000 am Tag.
     Die Welt selbst wird beim Weiterspielen neu gewuerfelt; sie ist ohnehin
     jedes Mal anders. Der Schluessel beginnt mit dem Kind, damit der Sync
     ihn mitnimmt und der Stand auch auf dem anderen Geraet da ist.
     --------------------------------------------------------------- */
  var STAND = SPEICHER + "-stand";
  function standLesen(){
    try { var d = JSON.parse(localStorage.getItem(STAND) || "null"); return (d && d.spielId) ? d : null; }
    catch(e){ return null; }
  }
  function standMerken(){
    try {
      if (!spiel || !spiel.id || !aufgaben.length) return;
      if (zustand !== "spielt" && zustand !== "pause") return;
      // Steht die Loesung schon da, ist diese Aufgabe erledigt.
      var nr = aufgabeNr + (station && station.geloest ? 1 : 0);
      if (nr >= aufgaben.length) return;
      var neu = JSON.stringify({ spielId: spiel.id, titel: spiel.titel || "", aufgabeNr: nr,
        gesamt: aufgaben.length, punkte: punkte, geloest: geloest });
      if (neu !== localStorage.getItem(STAND)) localStorage.setItem(STAND, neu);
    } catch(e){}
  }
  function standWeg(){ try { if (localStorage.getItem(STAND) !== null) localStorage.removeItem(STAND); } catch(e){} }
  function weiterspielenZeigen(){
    var st = standLesen();
    zeigen($("weiterspielen"), !!st);
    if (!st) return;
    $("ws-info").textContent = (st.titel ? "„" + st.titel + "“ – " : "") + "Aufgabe " + (st.aufgabeNr + 1) +
      " von " + st.gesamt + " · ⭐ " + st.punkte + " · ✅ " + Math.max(0, st.geloest | 0);
  }
  var fortsetzen = null;

  function welt(){ return WELTEN.filter(function(w){ return w.schluessel === wahl.welt; })[0] || WELTEN[0]; }
  function figur(){ return FIGUREN.filter(function(f){ return f.schluessel === wahl.figur; })[0] || FIGUREN[0]; }

  /* ---------------------------------------------------------------
     Anmelden - genau wie in der Werkstatt. Der Code selbst wird NICHT
     im Browser gespeichert, der Server setzt ein signiertes Cookie.
     --------------------------------------------------------------- */

  function sicht(name){
    ["anmelden","schritte","laden"].forEach(function(n){
      zeigen($("sicht-" + n), n === name);
    });
  }

  function pruefeAnmeldung(){
    fetch("/api/code-pruefen?kind=" + K.kind, {credentials:"same-origin"})
      .then(function(r){ return r.json(); })
      .then(function(a){
        if (a && a.ok){ sicht("schritte"); spieleLaden(); schrittZeigen(); }
        else { sicht("anmelden"); $("code").focus(); }
      })
      .catch(function(){ sicht("anmelden"); });
  }

  $("anmelden").addEventListener("click", function(){
    var code = $("code").value.trim();
    if (!code){ $("codefehler").textContent = "Bitte gib deinen Code ein."; return; }
    $("anmelden").disabled = true; $("codefehler").textContent = "";
    fetch("/api/code-pruefen", {
      method:"POST", credentials:"same-origin",
      headers:{"content-type":"application/json"},
      body: JSON.stringify({code: code, kind: K.kind})
    })
    .then(function(r){ return r.json(); })
    .then(function(j){
      $("anmelden").disabled = false;
      if (j && j.ok){ $("code").value=""; sicht("schritte"); spieleLaden(); schrittZeigen(); return; }
      $("code").value = ""; $("code").focus();
      $("codefehler").textContent = (j && j.fehler) ? j.fehler : "Das hat nicht geklappt.";
    })
    .catch(function(){
      $("anmelden").disabled = false;
      $("codefehler").textContent = "Ich konnte den Server nicht erreichen.";
    });
  });
  $("code").addEventListener("keydown", function(e){ if (e.key === "Enter") $("anmelden").click(); });

  /* Was schon im Regal liegt. Damit weiss Schritt 5, wo es sofort losgeht. */
  var SPIELE = [];
  function spieleLaden(){
    fetch("/api/spiele?kind=" + K.kind, {credentials:"same-origin"})
      .then(function(r){ return r.json(); })
      .then(function(j){ if (j && j.ok && j.spiele){ SPIELE = j.spiele; if (schrittNr === 4) felderMalen(); } })
      .catch(function(){});
  }
  function fertigesSpiel(schluessel){
    var passend = SPIELE.filter(function(e){ return !!e.quelle && e.quelle === schluessel; });
    if (!passend.length) return null;
    passend.sort(function(a,b){
      return new Date(a.zuletztGespielt || 0).getTime() - new Date(b.zuletztGespielt || 0).getTime();
    });
    return passend[0];
  }

  /* ---------------------------------------------------------------
     Schritt fuer Schritt. Genau das hat Paul sich gewuenscht:
     eine Frage nach der anderen, nicht alles auf einmal.
     --------------------------------------------------------------- */

  if (K.welten) WELTEN = K.welten;
  if (K.figuren) FIGUREN = K.figuren;
  if (K.steuerungen) STEUERUNGEN = K.steuerungen;
  if (K.toene) TOENE = K.toene;

  var SCHRITTE = [
    { frage:"Wo soll dein Spiel spielen?", unter:"Die Welt bestimmt, wie es aussieht - und wie hoch du springst.",
      feld:"welt", liste:WELTEN },
    { frage:"Wer bist du in dem Spiel?", unter:"Deine Figur läuft, springt und sammelt die Sterne ein.",
      feld:"figur", liste:FIGUREN },
    { frage:"Wie willst du sie steuern?", unter:"Am Laptop gehen immer auch die Pfeiltasten und die Leertaste.",
      feld:"steuerung", liste:STEUERUNGEN },
    { frage:"Welche Töne willst du hören?", unter:"Du kannst den Ton auch mitten im Spiel umstellen.",
      feld:"toene", liste:TOENE },
    { frage:"Worum soll es gehen?", unter:"Such dir ein Feld aus - oder schreib ganz unten selbst rein, was du willst.",
      feld:"thema", liste:null }
  ];
  // Eigene Worte je Kind (Leon ist sieben und liest noch nicht sicher).
  (K.schritte || []).forEach(function(t, n){ if (SCHRITTE[n] && t){ if (t.frage) SCHRITTE[n].frage = t.frage; if (t.unter) SCHRITTE[n].unter = t.unter; } });

  var schrittNr = 0;
  var fachJetzt = (K.faecher && K.faecher[0]) ? K.faecher[0].id : "mathe";

  function schrittZeigen(){
    var s = SCHRITTE[schrittNr];
    $("schrittfrage").textContent = s.frage;
    $("schrittunter").textContent = s.unter;
    $("meldung").innerHTML = "";

    var weg = $("wegweiser");
    weg.innerHTML = "";
    SCHRITTE.forEach(function(_, i){
      var p = document.createElement("span");
      p.className = "punkt" + (i === schrittNr ? " an" : (i < schrittNr ? " fertig" : ""));
      weg.appendChild(p);
    });
    var z = document.createElement("span");
    z.className = "zahl";
    z.textContent = "Schritt " + (schrittNr + 1) + " von " + SCHRITTE.length;
    weg.appendChild(z);

    zeigen($("faecher"), s.feld === "thema");
    zeigen($("wunschfeld"), s.feld === "thema");
    zeigen($("schritt-zurueck"), schrittNr > 0);
    zeigen($("zettel"), schrittNr > 0);
    weiterspielenZeigen();
    $("schritt-weiter").textContent = (schrittNr === SCHRITTE.length - 1) ? "Spiel schmieden 🔨" : "Weiter";
    zettelMalen();
    felderMalen();
    window.scrollTo(0, 0);
  }

  function felderMalen(){
    var s = SCHRITTE[schrittNr];
    var kasten = $("felder");
    kasten.innerHTML = "";

    var liste = s.liste;
    if (s.feld === "thema"){
      liste = THEMEN.filter(function(t){ return t.fach === fachJetzt; });
      Array.prototype.forEach.call(document.querySelectorAll("#faecher .fach"), function(k){
        k.classList.toggle("an", k.getAttribute("data-fach") === fachJetzt);
      });
    }

    liste.forEach(function(e){
      var feld = document.createElement("div");
      feld.className = "feld" + (wahl[s.feld] === e.schluessel ? " an" : "");
      feld.setAttribute("data-schluessel", e.schluessel);
      feld.setAttribute("role", "button");
      feld.setAttribute("tabindex", "0");
      var fertig = (s.feld === "thema") ? fertigesSpiel(e.schluessel) : null;
      feld.innerHTML = '<span class="bild"></span><span class="tt"></span>'
        + (e.sub ? '<span class="sub"></span>' : "")
        + (fertig ? '<span class="bereit">▶ liegt schon bereit</span>' : "");
      feld.querySelector(".bild").textContent = e.bild;
      feld.querySelector(".tt").textContent = e.titel;
      if (e.sub) feld.querySelector(".sub").textContent = e.sub;
      var waehlen = function(){
        wahl[s.feld] = e.schluessel;
        if (s.feld === "thema") $("wunsch").value = "";
        felderMalen(); zettelMalen();
      };
      feld.addEventListener("click", waehlen);
      feld.addEventListener("keydown", function(ev){
        if (ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); waehlen(); }
      });
      kasten.appendChild(feld);
    });
  }

  function zettelMalen(){
    var teile = [];
    var w = WELTEN.filter(function(x){return x.schluessel===wahl.welt;})[0];
    var f = FIGUREN.filter(function(x){return x.schluessel===wahl.figur;})[0];
    var st = STEUERUNGEN.filter(function(x){return x.schluessel===wahl.steuerung;})[0];
    var to = TOENE.filter(function(x){return x.schluessel===wahl.toene;})[0];
    var th = THEMEN.filter(function(x){return x.schluessel===wahl.thema;})[0];
    if (schrittNr > 0 && w)  teile.push(w.bild + " Welt: " + w.titel);
    if (schrittNr > 1 && f)  teile.push(f.bild + " Figur: " + f.titel);
    if (schrittNr > 2 && st) teile.push(st.bild + " Steuerung: " + st.titel);
    if (schrittNr > 3 && to) teile.push(to.bild + " Ton: " + to.titel);
    var eigen = $("wunsch").value.trim();
    if (eigen) teile.push("✏️ Thema: " + eigen);
    else if (th) teile.push(th.bild + " Thema: " + th.titel);
    $("zettel-zeilen").innerHTML = "";
    teile.forEach(function(t){
      var d = document.createElement("div");
      d.textContent = t;
      $("zettel-zeilen").appendChild(d);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("#faecher .fach"), function(k){
    k.addEventListener("click", function(){
      fachJetzt = k.getAttribute("data-fach");
      felderMalen();
    });
  });
  $("wunsch").addEventListener("input", zettelMalen);

  $("schritt-zurueck").addEventListener("click", function(){
    if (schrittNr > 0){ schrittNr--; schrittZeigen(); }
  });

  $("schritt-weiter").addEventListener("click", function(){
    var s = SCHRITTE[schrittNr];
    if (s.feld === "thema"){
      var eigen = $("wunsch").value.trim();
      if (!eigen && !wahl.thema){
        melde("Such dir ein Feld aus – oder schreib unten selbst rein, worum es gehen soll.");
        return;
      }
      merken();
      losSchmieden(eigen);
      return;
    }
    schrittNr++;
    schrittZeigen();
  });

  function melde(text){
    $("meldung").innerHTML = '<div class="hinweis fehler"></div>';
    $("meldung").firstChild.textContent = text;
  }

  /* ---------------------------------------------------------------
     Schmieden: erst im Regal nachsehen, dann erst bauen lassen.
     --------------------------------------------------------------- */

  var GEDULD = [
    ["Ich denke mir Aufgaben aus …", "Gleich wird gesprungen."],
    ["Ich baue deine Welt auf …", "Sterne, Gegner, Tore."],
    ["Ich haenge die Antworten an die Ballons …", "Gleich hast du es."],
    ["Fast fertig …", "Der letzte Handgriff dauert manchmal etwas."]
  ];
  var baeuft = false;
  var spiel = null;

  function losSchmieden(eigenerWunsch){
    if (baeuft) return;

    // Liegt zum Thema schon ein Spiel im Regal, wird es gespielt statt neu
    // gebaut - kein Warten, keine Kosten. Bei einem eigenen Wunsch geht das
    // nicht: den kennt das Regal nicht.
    if (!eigenerWunsch){
      var da = fertigesSpiel(wahl.thema);
      if (da){ spielHolen(da.id); return; }
    }

    var th = THEMEN.filter(function(x){return x.schluessel===wahl.thema;})[0];
    var text = eigenerWunsch || (th ? th.wunsch : "");
    if (eigenerWunsch && th) text = th.wunsch + "\n\nUnd " + K.name + " wünscht sich dazu: " + eigenerWunsch;

    baeuft = true;
    sicht("laden");
    var i = 0;
    $("lade-titel").textContent = "Ich schmiede dein Spiel …";
    $("lade-unter").textContent = "Das dauert ungefähr anderthalb Minuten.";
    var takt = setInterval(function(){
      var s = GEDULD[i % GEDULD.length]; i++;
      $("lade-titel").textContent = s[0];
      $("lade-unter").textContent = s[1];
    }, 8000);

    fetch("/api/spiel-bauen", {
      method:"POST", credentials:"same-origin",
      headers:{"content-type":"application/json"},
      body: JSON.stringify({
        kind:K.kind,
        quelle: eigenerWunsch ? "" : wahl.thema,
        wunsch: text,
        seiten: []
      })
    })
    .then(function(r){ return r.json().then(function(j){ return {ok:r.ok, status:r.status, j:j}; }); })
    .then(function(a){
      clearInterval(takt); baeuft = false;
      if (a.status === 401){ sicht("anmelden"); $("code").focus(); return; }
      if (!a.ok || !a.j.ok || !a.j.spiel){
        sicht("schritte");
        melde(a.j && a.j.fehler ? a.j.fehler : "Da ist etwas schiefgegangen. Probier es noch einmal.");
        return;
      }
      spiel = a.j.spiel;
      spieleLaden();
      spielStarten();
    })
    .catch(function(){
      clearInterval(takt); baeuft = false;
      sicht("schritte");
      melde("Ich konnte den Server nicht erreichen. Bist du im Internet?");
    });
  }

  $("ws-los").addEventListener("click", function(){
    var st = standLesen();
    if (!st) { weiterspielenZeigen(); return; }
    fortsetzen = st;
    spielHolen(st.spielId);
  });

  function spielHolen(id){
    sicht("laden");
    $("lade-titel").textContent = "Ich hole dein Spiel aus dem Regal …";
    $("lade-unter").textContent = "Das geht schnell.";
    fetch("/api/spiele?kind=" + K.kind + "&id=" + encodeURIComponent(id), {credentials:"same-origin"})
      .then(function(r){ return r.json(); })
      .then(function(j){
        if (!j || !j.ok || !j.spiel){
          if (fortsetzen){ fortsetzen = null; standWeg(); weiterspielenZeigen(); }
          sicht("schritte");
          melde((j && j.fehler) ? j.fehler : "Das Spiel war nicht mehr da. Ich baue dir ein neues.");
          return;
        }
        spiel = j.spiel;
        spielStarten();
      })
      .catch(function(){ sicht("schritte"); melde("Ich konnte den Server nicht erreichen."); });
  }

  /* =====================================================================
     Der Motor
     ===================================================================== */

  var cv = $("leinwand"), ctx = cv.getContext("2d");
  var W = 0, H = 0, bodenY = 0, horizY = 0;
  var istTouch = false;
  try { istTouch = window.matchMedia("(pointer: coarse)").matches || ("ontouchstart" in window); } catch(e){}

  function passeGroesse(){
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = $("buehne").clientWidth || window.innerWidth;
    H = $("buehne").clientHeight || window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    // Unter dem Boden liegen die Steuerknoepfe. Mit dem Finger sind sie
    // groesser, also braucht der Boden dort mehr Abstand nach unten.
    var alterBoden = bodenY;
    bodenY = H - (istTouch ? 132 : 104);
    horizY = bodenY - 64;
    if (alterBoden) weltMitnehmen(bodenY - alterBoden);
  }

  /* Auf dem iPad faehrt Safaris Leiste beim Spielen ein und aus. Das Fenster
     wird dabei um bis zu 80 px hoeher oder niedriger, und der Boden wandert
     mit. Wer schon in der Welt steht, wanderte bisher NICHT mit: Die Gegner
     blieben auf ihrer alten Hoehe stehen und steckten danach bis zur Haelfte
     im Boden - genau das hat Paul am 15.09.2026 fotografiert (Meldung
     9ytvhx394e). Der Figur faellt es nicht auf, weil sie in jedem Bild neu
     auf den Boden gesetzt wird; allem anderen schon. Am schlimmsten trifft es
     die Antwort-Ballons: einer, der im Boden verschwindet, ist nicht mehr
     anzuspringen, und die Aufgabe waere nicht mehr zu loesen.
     Also alles, was am Boden haengt, um dieselbe Strecke mitnehmen. */
  function weltMitnehmen(dy){
    if (!dy) return;
    var i;
    for (i=0;i<gegner.length;i++)   gegner[i].y   += dy;
    for (i=0;i<sterne.length;i++)   sterne[i].y   += dy;
    for (i=0;i<schmuck.length;i++)  schmuck[i].y  += dy;
    for (i=0;i<partikel.length;i++) partikel[i].y += dy;
    held.y += dy;
    if (station && station.items){
      // Nach unten ausweichen, nie hinter die Fragekarte - dieselbe Grenze
      // wie beim Setzen in ballonsAusrichten().
      var kopf = $("kopf");
      var unten = kopf ? kopf.getBoundingClientRect().bottom + 10 : 150;
      for (i=0;i<station.items.length;i++){
        station.items[i].y = Math.max(unten, station.items[i].y + dy);
      }
    }
  }

  /* ---- Ton ---- */
  var actx = null, tonAn = true;
  function ton(freq, dauer, typ, vol){
    if (!tonAn || wahl.toene === "aus") return;
    if (wahl.toene === "leise") vol = (vol || 0.15) * 0.45;
    try{
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = typ || "sine"; o.frequency.value = freq;
      g.gain.value = vol || 0.16;
      o.connect(g); g.connect(actx.destination);
      var t = actx.currentTime;
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dauer || 0.15));
      o.start(t); o.stop(t + (dauer || 0.15));
    }catch(e){}
  }
  function sndSprung(){ ton(520,0.11,"square",0.11); }
  function sndStern(){ ton(880,0.07,"triangle",0.15); if (wahl.toene==="froehlich") setTimeout(function(){ton(1180,0.09,"triangle",0.15);},70); }
  function sndRichtig(){
    ton(660,0.10,"sine",0.19);
    if (wahl.toene === "froehlich"){
      setTimeout(function(){ton(880,0.10,"sine",0.19);},95);
      setTimeout(function(){ton(1320,0.18,"sine",0.19);},200);
    }
  }
  function sndFalsch(){ ton(150,0.22,"sawtooth",0.15); }

  /* ---- Zustand ---- */
  var zustand = "aus";              // aus | spielt | pause | ende
  var held = { x:0, y:0, vx:0, vy:0, w:44, h:52, amBoden:true, blickRechts:true,
               unverwundbar:0, lauf:0, spruenge:0 };
  var TASTE = { links:false, rechts:false, hoch:false };
  var kamera = 0, punkte = 0, geloest = 0, ruettel = 0;
  var sterne = [], gegner = [], partikel = [], schmuck = [];
  var naechsteWeltX = 0, rennRichtung = 1;
  var aufgaben = [], aufgabeNr = 0, station = null, protokoll = [], aufgabeBegonnen = 0;
  var G = 0.9, SPRUNGKRAFT = -15, LAUFTEMPO = 3.7;

  function spielStarten(){
    aufgaben = (spiel && spiel.aufgaben) ? spiel.aufgaben.slice() : [];
    if (!aufgaben.length){
      sicht("schritte");
      melde("Es kamen keine Aufgaben zurück. Bitte probier es noch einmal.");
      return;
    }
    document.body.classList.add("spielt");
    // Ab hier wird gespielt und nicht mehr gebaut - die Uhr faengt neu an.
    bauzeitMelden();
    if (LS()) LS().uhrZuruecksetzen();
    imSpiel = true;
    // Die Pfeile gehoeren zu JEDER Steuerung ausser "von allein rennen".
    // Paul (Meldung 9ytvhx394e, 16.09.2026, Bild): in "Fliegen" stand seine
    // Figur ganz links am Rand, und es gab nur den FLIEGEN-Knopf. Vorwaerts
    // kam sie gar nicht - held.vx wird dort aus TASTE.links/rechts gesetzt,
    // und die wurden ohne Knoepfe nie wahr. Auf dem iPad war "Fliegen"
    // damit nicht spielbar: Die Antwort-Ballons haengen rechts, er stand
    // links und kam nie hin. Mit Tastatur fiel es nicht auf, deshalb hat es
    // beim Bauen keiner gemerkt.
    zeigen($("gruppe-laufen"), wahl.steuerung !== "rennen");
    $("knopf-sprung").textContent = (wahl.steuerung === "fliegen") ? "FLIEGEN" : "SPRUNG";
    $("tonknopf").textContent = (wahl.toene === "aus") ? "🔇" : "🔊";
    tonAn = (wahl.toene !== "aus");
    neuStart(fortsetzen);
    fortsetzen = null;
    if (!laeuft){ laeuft = true; requestAnimationFrame(schleife); }
  }

  function neuStart(st){
    passeGroesse();
    var w = welt();
    G = w.G; SPRUNGKRAFT = w.sprung;
    punkte = 0; geloest = 0; ruettel = 0;
    sterne = []; gegner = []; partikel = [];
    kamera = 0; naechsteWeltX = 0; rennRichtung = 1;
    aufgabeNr = 0; station = null; protokoll = [];
    // Weiterspielen: nur uebernehmen, was zu DIESEM Spiel passt.
    if (st && spiel && st.spielId === spiel.id && st.aufgabeNr < aufgaben.length){
      aufgabeNr = Math.max(0, st.aufgabeNr | 0);
      punkte = Math.max(0, st.punkte | 0);
      geloest = Math.max(0, Math.min(aufgabeNr, st.geloest | 0));
    }
    held.x = 110; held.y = bodenY - held.h; held.vx = 0; held.vy = 0;
    held.amBoden = true; held.spruenge = 0; held.unverwundbar = 0; held.blickRechts = true;
    schmuckSetzen();
    weltErzeugen(2200);
    stationSetzen(620);
    anzeigenAuffrischen();
    $("schirm-ende").classList.add("weg");
    $("schirm-loesung").classList.add("weg");
    $("schirm-raetsel").classList.add("weg");
    zustand = "spielt";
  }

  function schmuckSetzen(){
    schmuck = [];
    for (var i=0;i<40;i++){
      schmuck.push({ x:i*160 + Math.random()*120, y:20 + Math.random()*(bodenY-140),
                     s:0.5 + Math.random()*1.1, t:Math.random()*6 });
    }
  }

  function weltErzeugen(bisX){
    while (naechsteWeltX < bisX){
      var x = naechsteWeltX;
      if (Math.random() < 0.72){
        var basis = bodenY - 70 - Math.random()*110;
        var n = 3 + Math.floor(Math.random()*3);
        for (var i=0;i<n;i++){
          sterne.push({ x:x + i*42, y: basis - Math.sin(i/(n-1)*Math.PI)*46, r:13, weg:false, blink:Math.random()*6 });
        }
      }
      if (Math.random() < 0.42){
        gegner.push({ x:x + Math.random()*120, y:bodenY-38, w:38, h:38, weg:false, t:Math.random()*6 });
      }
      naechsteWeltX += 270 + Math.random()*130;
    }
  }

  /* ---- Eine Station: hier haengen die Antworten in der Luft ---- */

  function stationSetzen(worldX){
    var a = aufgaben[aufgabeNr];
    if (!a){ station = null; return; }
    aufgabeBegonnen = Date.now();

    var art = a.art || "wahl";
    var moeglich = (a.antworten && a.antworten.length) ? a.antworten.slice() : [];
    if (a.richtig != null && moeglich.indexOf(a.richtig) === -1 && moeglich.length) moeglich.push(a.richtig);

    if (art === "wahl" && moeglich.length >= 2){
      var items = mische(moeglich).map(function(text){
        return { text:String(text), korrekt: String(text) === String(a.richtig), weg:false, wack:Math.random()*6 };
      });
      station = { art:"ballons", items:items, aufgabe:a, geloest:false,
                  startX: worldX, torX: worldX + 400 };
      // Erst die Frage hinschreiben, dann die Ballons setzen: Wie weit die
      // Fragekarte oben herunterreicht, haengt an der Laenge der Frage - und
      // ein Ballon, der dahinter verschwindet, ist fuer das Kind nicht da.
      frageZeigen();
      ballonsAusrichten(worldX);
    } else {
      // Aufgaben zum Eintippen kann man nicht anspringen. Sie werden zu
      // einem Tor, das aufgeht, wenn die Zahl stimmt.
      station = { art:"tor", items:[], aufgabe:a, geloest:false,
                  startX: worldX, torX: worldX + 120, offen:false, gefragt:false };
      frageZeigen();
    }
    anzeigenAuffrischen();
  }

  function ballonsAusrichten(worldX){
    var items = station.items;
    var hoehen = mische([100, 155, 210, 140, 185]).slice(0, items.length);
    var kopf = $("kopf");
    var unten = kopf ? kopf.getBoundingClientRect().bottom + 10 : 150;
    var x = worldX;
    items.forEach(function(it, i){
      beschriften(it, Math.min(230, Math.max(150, W * 0.55)));
      it.x = x;
      // Nach unten ausweichen, nie nach oben: weiter oben kaeme die Figur
      // auch mit Doppelsprung nicht mehr hin.
      it.y = Math.max(unten, bodenY - hoehen[i] - it.h);
      x += it.w + 58;
    });
    station.torX = x + 90;
  }

  /* Wie viel Text auf einen Ballon passt, haengt vom Spiel ab: In Mathe steht
     dort "42", in Deutsch "gestreckter Winkel" oder ein halber Satz. Zwei
     Antworten, die beide hinten abgeschnitten werden, sehen gleich aus - dann
     raet das Kind, statt zu lesen. Deshalb wird erst die Schrift kleiner und
     nur im aeussersten Fall gekuerzt. Unter 13 px geht es nicht: Was man nicht
     lesen kann, hilft auch nicht. */
  var SCHRIFTEN = [ {px:18, zeilen:2}, {px:15, zeilen:3}, {px:13, zeilen:3} ];

  function beschriften(it, maxB){
    var innen = maxB - 26;
    for (var s=0; s<SCHRIFTEN.length; s++){
      var stufe = SCHRIFTEN[s];
      ctx.font = "600 " + stufe.px + "px ui-rounded, 'SF Pro Rounded', system-ui, sans-serif";
      var umbruch = umbrechen(it.text, innen, stufe.zeilen);
      if (!umbruch.passt && s < SCHRIFTEN.length - 1) continue;
      it.zeilen = umbruch.passt ? umbruch.liste : kuerzen(umbruch.liste, innen);
      it.schrift = stufe.px;
      it.abstand = Math.round(stufe.px * 1.18);
      var breiteste = 0;
      it.zeilen.forEach(function(z){ breiteste = Math.max(breiteste, ctx.measureText(z).width); });
      it.w = Math.min(maxB, Math.max(74, breiteste + 26));
      it.h = Math.max(40, stufe.px + 22) + (it.zeilen.length - 1) * it.abstand;
      return;
    }
  }

  // Bricht den Text um und sagt dazu, ob er in die erlaubten Zeilen gepasst hat.
  function umbrechen(text, maxB, maxZeilen){
    var worte = String(text).split(/\s+/), liste = [], jetzt = "";
    for (var i=0;i<worte.length;i++){
      var probe = jetzt ? jetzt + " " + worte[i] : worte[i];
      if (ctx.measureText(probe).width > maxB && jetzt){ liste.push(jetzt); jetzt = worte[i]; }
      else jetzt = probe;
    }
    if (jetzt) liste.push(jetzt);
    var passt = liste.length <= maxZeilen;
    liste.forEach(function(z){ if (ctx.measureText(z).width > maxB) passt = false; });
    return { liste: liste.slice(0, Math.max(1, maxZeilen)), passt: passt };
  }

  // Letzte Rettung: lieber abschneiden als ueber den Ballon hinauslaufen.
  function kuerzen(liste, maxB){
    var i = liste.length - 1;
    while (liste[i].length > 3 && ctx.measureText(liste[i] + "…").width > maxB){
      liste[i] = liste[i].slice(0, -1);
    }
    liste[i] += "…";
    return liste;
  }

  var kannSprechen = !!K.vorlesen && typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
  function sprich(t){
    if (!kannSprechen || !t || document.hidden) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(t)); u.lang = "de-DE"; u.rate = .9;
      var st = (window.speechSynthesis.getVoices() || []).filter(function(v){ return /^de/i.test(v.lang); })[0];
      if (st) u.voice = st;
      window.speechSynthesis.speak(u);
    } catch(e){}
  }
  function vorlesen(){
    var a = station && station.aufgabe; if (!a) return;
    var text = a.frage || "";
    if (station.art === "ballons") text += ". Spring zu: " + station.items.map(function(it){ return it.text; }).join(", oder ");
    sprich(text);
  }
  if (kannSprechen){
    zeigen($("vorleseknopf"), true);
    $("vorleseknopf").addEventListener("click", function(e){ e.stopPropagation(); vorlesen(); });
    document.addEventListener("visibilitychange", function(){ if (document.hidden) try { speechSynthesis.cancel(); } catch(e){} });
  }

  function frageZeigen(){
    var a = station && station.aufgabe;
    if (!a){ $("fragetext").textContent = ""; return; }
    $("fragelabel").textContent = (station.art === "tor")
      ? (K.torLabel || "Am Tor musst du die Zahl eintippen") : "Spring zur richtigen Antwort!";
    $("fragetext").textContent = a.frage || "";
    if (K.vorlesenVonSelbst) setTimeout(vorlesen, 350);
  }

  function anzeigenAuffrischen(){
    $("geloestzaehler").textContent = "✅ " + geloest;
    $("punkte").textContent = "⭐ " + punkte;
    $("stationszaehler").textContent = Math.min(aufgabeNr+1, aufgaben.length) + " / " + aufgaben.length;
  }

  /* ---- Steuerung ---- */

  function springen(){
    if (zustand !== "spielt") return;
    if (wahl.steuerung === "fliegen"){ TASTE.hoch = true; return; }
    if (held.spruenge < 2){ held.vy = SPRUNGKRAFT; held.amBoden = false; held.spruenge++; sndSprung(); }
  }
  function sprungAus(){ TASTE.hoch = false; }

  function knopfBinden(id, an, aus){
    var el = $(id); if (!el) return;
    var A = function(e){ e.preventDefault(); an(); };
    var B = function(e){ e.preventDefault(); if (aus) aus(); };
    el.addEventListener("touchstart", A, {passive:false});
    el.addEventListener("touchend", B, {passive:false});
    el.addEventListener("touchcancel", B, {passive:false});
    el.addEventListener("mousedown", A);
    el.addEventListener("mouseup", B);
    el.addEventListener("mouseleave", B);
  }
  knopfBinden("knopf-links",  function(){TASTE.links=true;},  function(){TASTE.links=false;});
  knopfBinden("knopf-rechts", function(){TASTE.rechts=true;}, function(){TASTE.rechts=false;});
  knopfBinden("knopf-sprung", springen, sprungAus);

  window.addEventListener("keydown", function(e){
    if (!document.body.classList.contains("spielt")) return;
    if (e.code==="ArrowLeft"||e.code==="KeyA") TASTE.links = true;
    else if (e.code==="ArrowRight"||e.code==="KeyD") TASTE.rechts = true;
    else if (e.code==="Space"||e.code==="ArrowUp"||e.code==="KeyW"){
      if (document.activeElement && document.activeElement.tagName === "INPUT") return;
      e.preventDefault(); springen();
    }
  });
  window.addEventListener("keyup", function(e){
    if (e.code==="ArrowLeft"||e.code==="KeyA") TASTE.links = false;
    if (e.code==="ArrowRight"||e.code==="KeyD") TASTE.rechts = false;
    if (e.code==="Space"||e.code==="ArrowUp"||e.code==="KeyW") sprungAus();
  });

  $("tonknopf").addEventListener("click", function(){
    if (wahl.toene === "aus"){ wahl.toene = "froehlich"; tonAn = true; }
    else { wahl.toene = "aus"; tonAn = false; }
    merken();
    $("tonknopf").textContent = tonAn ? "🔊" : "🔇";
    if (tonAn) sndStern();
  });

  $("rausknopf").addEventListener("click", function(){ spielVerlassen(); });

  function spielVerlassen(){
    standMerken();
    lernstandSenden();
    zustand = "aus";
    document.body.classList.remove("spielt");
    TASTE.links = TASTE.rechts = TASTE.hoch = false;
    sicht("schritte");
    weiterspielenZeigen();
    spieleLaden();
  }

  /* ---- Der Schritt je Bild ---- */

  function update(){
    if (zustand !== "spielt") return;

    if (wahl.steuerung === "rennen"){
      // Wer von allein rennt, kann nicht umkehren - und genau das braeuchte
      // er: Das Tor haelt ihn vorne fest, die Antwort-Ballons haengen hinter
      // ihm. Ohne das hier steht die Figur am Tor und das Spiel ist zu Ende,
      // ohne dass es das sagt. Also pendelt sie zwischen dem ersten Ballon
      // und dem Tor hin und her, bis die Aufgabe geloest ist; gesprungen
      // wird weiter selbst.
      // Nur vor Ballons pendeln. Am Raetsel-Tor muss die Figur ANSTOSSEN,
      // sonst geht die Tafel nie auf - wer dort umkehrt, steht ewig davor.
      if (station && !station.geloest && station.art === "ballons"){
        if (held.x + held.w >= station.torX - 2) rennRichtung = -1;
        if (held.x <= station.startX - 90) rennRichtung = 1;
      } else rennRichtung = 1;
      held.vx = LAUFTEMPO * rennRichtung;
      held.blickRechts = rennRichtung > 0;
    } else {
      held.vx = 0;
      if (TASTE.links){ held.vx = -LAUFTEMPO; held.blickRechts = false; }
      if (TASTE.rechts){ held.vx = LAUFTEMPO; held.blickRechts = true; }
    }

    if (wahl.steuerung === "fliegen" && TASTE.hoch){
      held.vy -= G * 1.9;
      if (held.vy < SPRUNGKRAFT * 0.62) held.vy = SPRUNGKRAFT * 0.62;
    }

    held.x += held.vx;
    if (held.x < kamera + 10) held.x = kamera + 10;

    // Das Tor haelt auf, bis die Aufgabe gelöst ist. Sonst rennt man an
    // einer Frage vorbei und merkt es nicht.
    if (station && !station.geloest && held.x + held.w > station.torX){
      held.x = station.torX - held.w;
      if (station.art === "tor" && !station.gefragt){ station.gefragt = true; raetselOeffnen(); }
    }

    if (Math.abs(held.vx) > 0.1) held.lauf += 0.3;

    held.vy += G; held.y += held.vy;
    if (held.y + held.h >= bodenY){ held.y = bodenY - held.h; held.vy = 0; held.amBoden = true; held.spruenge = 0; }
    else held.amBoden = false;

    var zielKam = held.x - W * 0.30;
    kamera += (zielKam - kamera) * 0.12;
    if (kamera < 0) kamera = 0;

    if (held.unverwundbar > 0) held.unverwundbar--;
    if (ruettel > 0) ruettel--;

    weltErzeugen(kamera + W + 700);

    var i, s, g, it;
    for (i=0;i<sterne.length;i++){ s = sterne[i];
      if (s.weg) continue; s.blink += 0.1;
      if (rechteck(held.x,held.y,held.w,held.h, s.x-s.r,s.y-s.r,s.r*2,s.r*2)){
        s.weg = true; punkte += 5; sndStern(); funken(s.x,s.y,"#fbbf24",8); anzeigenAuffrischen();
      }
    }
    if (held.unverwundbar <= 0){
      for (i=0;i<gegner.length;i++){ g = gegner[i];
        if (g.weg) continue;
        if (rechteck(held.x,held.y,held.w,held.h, g.x,g.y,g.w,g.h)){
          // Ein Zusammenstoss kostet Sterne und schubst zurueck - aber KEIN
          // Herz. Herzen gibt es nur fuer Antworten. Wer von allein rennt,
          // kann einem Gegner kaum ausweichen; ein Spiel, das dafuer bestraft,
          // macht Angst statt Lust. Geuebt wird das Rechnen, nicht das
          // Ausweichen.
          g.weg = true;
          punkte = Math.max(0, punkte - 5);
          held.vy = SPRUNGKRAFT * 0.45; held.amBoden = false;
          held.unverwundbar = 60; ruettel = 10;
          sndFalsch(); funken(g.x+g.w/2, g.y, "#ef4444", 10);
          anzeigenAuffrischen();
        }
      }
    }
    for (i=0;i<gegner.length;i++) gegner[i].t += 0.05;

    if (station && station.art === "ballons" && !station.geloest){
      for (i=0;i<station.items.length;i++){ it = station.items[i];
        if (it.weg) continue;
        it.wack += 0.055;
        var by = it.y + Math.sin(it.wack) * 5;
        if (rechteck(held.x,held.y,held.w,held.h, it.x,by,it.w,it.h)){
          if (it.korrekt) ballonRichtig(it, by);
          else { it.weg = true; funken(it.x + it.w/2, by, "#ef4444", 12);
                 antwortMelden(false, it.text); danebenSchubsen();
                 loesungZeigen(false, station.aufgabe); }
        }
      }
    }

    for (i=0;i<partikel.length;i++){ var p = partikel[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.leben--; }
    partikel = partikel.filter(function(p){ return p.leben > 0; });
    sterne = sterne.filter(function(x){ return !x.weg && x.x > kamera - 240; });
    gegner = gegner.filter(function(x){ return !x.weg && x.x > kamera - 240; });
  }

  function ballonRichtig(it, by){
    station.geloest = true;
    punkte += 20; geloest++;
    held.vy = SPRUNGKRAFT * 0.7; held.amBoden = false; held.spruenge = 1;
    sndRichtig(); fxKonfetti(); funken(it.x + it.w/2, by, "#22c55e", 22);
    anzeigenAuffrischen();
    antwortMelden(true, it.text);
    loesungZeigen(true, station.aufgabe);
  }

  /* Daneben heisst: es ruettelt, es klingt, und danach kommt die Loesung mit
     der Erklaerung. Es heisst NICHT, dass etwas weggenommen wird - siehe den
     Absatz "Warum hier nichts weggenommen wird" im Kopf dieser Datei. */
  function danebenSchubsen(){
    held.unverwundbar = 80; ruettel = 14; sndFalsch(); anzeigenAuffrischen();
  }

  function funken(x,y,farbe,n){
    for (var i=0;i<n;i++){
      var a = Math.random()*Math.PI*2, s = 1 + Math.random()*4;
      partikel.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,leben:24+Math.random()*16,farbe:farbe,r:2+Math.random()*3});
    }
  }

  function rechteck(ax,ay,aw,ah, bx,by,bw,bh){ return ax<bx+bw && ax+aw>bx && ay<by+bh && ay+ah>by; }

  /* ---- Tafeln: Rätsel-Tor und Rückmeldung ---- */

  var raetselSchritt = 0, raetselFehler = 0;

  function raetselOeffnen(){
    zustand = "pause";
    var a = station.aufgabe;
    raetselSchritt = 0; raetselFehler = 0;
    $("schirm-raetsel").classList.remove("weg");
    raetselFrageZeigen();
    sprich($("raetsel-frage").textContent);
    setTimeout(function(){ try{ $("raetsel-feld").focus(); }catch(e){} }, 60);
  }

  function raetselFrageZeigen(){
    var a = station.aufgabe;
    var kette = (a.art === "teilschritte" && a.teilschritte && a.teilschritte.length) ? a.teilschritte : null;
    $("raetsel-titel").textContent = kette ? ("🔒 Tor, Schritt " + (raetselSchritt+1) + " von " + kette.length) : "🔒 Rätsel-Tor";
    $("raetsel-frage").textContent = kette ? kette[raetselSchritt].frage : (a.frage || "");
    var weg = (a.weg && String(a.weg).trim()) ? String(a.weg) : "";
    zeigen($("raetsel-weg"), !!weg && !raetselSchritt);
    $("raetsel-weg").textContent = weg ? ("So gehen wir vor: " + weg) : "";
    var feld = $("raetsel-feld");
    feld.value = ""; feld.classList.remove("schlecht"); feld.disabled = false;
    // Ohne eigenen Namen traegt der Browser die Zahl vom letzten Schritt
    // wieder ein - genau das hatte Paul am Wiege-Meister gemeldet.
    feld.setAttribute("name", "tor-" + aufgabeNr + "-" + raetselSchritt + "-" + Date.now());
  }

  function raetselPruefen(){
    var a = station.aufgabe;
    var kette = (a.art === "teilschritte" && a.teilschritte && a.teilschritte.length) ? a.teilschritte : null;
    var soll = kette ? kette[raetselSchritt].richtig : a.richtig;
    var eingabe = $("raetsel-feld").value.trim();
    if (!eingabe) return;

    if (zahlGleich(eingabe, soll)){
      sndRichtig();
      if (kette && raetselSchritt < kette.length - 1){
        raetselSchritt++; raetselFrageZeigen();
        setTimeout(function(){ try{ $("raetsel-feld").focus(); }catch(e){} }, 40);
        return;
      }
      $("schirm-raetsel").classList.add("weg");
      station.geloest = true; station.offen = true;
      punkte += 20; geloest++;
      anzeigenAuffrischen();
      antwortMelden(raetselFehler === 0, eingabe);
      fxKonfetti();
      loesungZeigen(raetselFehler === 0, a);
      return;
    }

    raetselFehler++;
    var feld = $("raetsel-feld");
    feld.classList.add("schlecht");
    sndFalsch();
    if (raetselFehler >= 2){
      $("schirm-raetsel").classList.add("weg");
      station.geloest = true; station.offen = true;
      danebenSchubsen();
      antwortMelden(false, eingabe);
      loesungZeigen(false, a);
    } else {
      // Der zweite Versuch bekommt einen Hinweis. Ohne ihn waere er nur ein
      // zweites Raten - ueberall sonst in der Lernwelt steht dort ein Tipp,
      // der sagt, WORAN man es erkennt, nie die Loesung selbst.
      torTippZeigen(a);
      setTimeout(function(){ feld.classList.remove("schlecht"); feld.value = ""; try{feld.focus();}catch(e){} }, 600);
    }
  }
  /* Der Tipp kommt aus dem, was der Baumeister ohnehin mitliefert: erst
     "merke" (die Faustregel, traegt auch bei der naechsten Aufgabe), sonst
     "weg" (der Rechenweg dieser Aufgabe). Gibt es beides nicht, steht
     wenigstens ein Anstupser da - ein leeres Feld waere schlimmer als ein
     allgemeiner Satz. Die Loesung steht hier NIE. */
  function torTippZeigen(a){
    var tipp = (a.merke && String(a.merke).trim()) ? String(a.merke).trim()
             : ((a.weg && String(a.weg).trim()) ? String(a.weg).trim() : "");
    var el = $("raetsel-weg");
    el.textContent = tipp ? ("💡 Tipp: " + tipp)
                          : "💡 Lies die Frage noch einmal in Ruhe – du hast noch einen Versuch.";
    zeigen(el, true);
  }

  $("raetsel-pruefen").addEventListener("click", raetselPruefen);
  $("raetsel-feld").addEventListener("keydown", function(e){ if (e.key === "Enter") raetselPruefen(); });

  function loesungZeigen(stimmt, a){
    zustand = "pause";
    $("loesung-titel").textContent = stimmt ? "Richtig! 🎉" : "Noch nicht ganz 💡";
    $("loesung-weg").textContent = a.erklaerung || (stimmt ? "Sauber gemacht." : ("Richtig wäre: " + a.richtig));
    var merke = (a.merke && String(a.merke).trim()) ? String(a.merke) : "";
    zeigen($("loesung-merke"), !!merke);
    $("loesung-merke").innerHTML = "";
    if (merke){
      var b = document.createElement("span"); b.textContent = "💡";
      var t = document.createElement("span");
      var fett = document.createElement("b"); fett.textContent = "Merke: ";
      t.appendChild(fett); t.appendChild(document.createTextNode(merke));
      $("loesung-merke").appendChild(b); $("loesung-merke").appendChild(t);
    }
    $("schirm-loesung").classList.remove("weg");
  }

  $("loesung-weiter").addEventListener("click", function(){
    $("schirm-loesung").classList.add("weg");
    aufgabeNr++;
    if (aufgabeNr >= aufgaben.length){ spielEnde(); return; }
    var naechstes = Math.max(held.x + 520, (station ? station.torX : held.x) + 420);
    station = null;
    zustand = "spielt";
    weltErzeugen(naechstes + 900);
    stationSetzen(naechstes);
  });

  /* "1736", " 1736 " und "1.736" gelten als dasselbe; eine fehlende Einheit
     ist in Ordnung, eine widersprechende nicht. Dieselbe Regel wie in der
     Werkstatt - Paul hatte sie dort am 07.09.2026 erstritten. */
  function zahlGleich(a, b){
    var sauber = function(s){ return String(s).replace(/[\s.' ]/g, "").toLowerCase(); };
    var A = sauber(a), B = sauber(b);
    if (A === B) return true;
    // Helenas Aufgaben koennen ein Wort als Loesung haben ("went", "la maison"):
    // Gross-/Kleinschreibung, Leerzeichen am Rand und ein Satzzeichen am Ende
    // zaehlen dort nicht als Fehler.
    if (K.textAntworten){
      var wort = function(s){ return String(s).trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "").toLowerCase(); };
      if (wort(a) && wort(a) === wort(b)) return true;
    }
    var teile = function(s){
      var m = s.match(/^(-?[0-9,]+)([a-zäöüß²³%°€\/]*)$/);
      return m ? { zahl:m[1], einheit:m[2] } : null;
    };
    var x = teile(A), y = teile(B);
    if (!x || !y || x.zahl !== y.zahl) return false;
    return !x.einheit || !y.einheit || x.einheit === y.einheit;
  }

  /* ---- Ende ---- */

  function spielEnde(){
    zustand = "ende";
    standWeg();
    // Ein Lauf endet nur noch, wenn alle Aufgaben durch sind. Ein vorzeitiges
    // "Alle Herzen weg" gibt es nicht mehr - Meldung csnzy24mrm, 20.09.2026.
    var alles = geloest >= aufgaben.length;
    $("ende-titel").textContent = alles ? "Alles richtig! 🎉" : "Durch! 💪";
    $("ende-text").textContent = "Du hast " + geloest + " von " + aufgaben.length + " Aufgaben gelöst.";
    $("ende-punkte").textContent = punkte;
    if (punkte > rekord){ rekord = punkte; merken(); $("ende-rekord").textContent = "Neue Bestleistung! 🏆"; }
    else $("ende-rekord").textContent = "Deine Bestleistung: " + rekord;
    $("schirm-ende").classList.remove("weg");
    fxKonfetti();
    rundeMelden();
    lernstandSenden();
  }

  $("ende-nochmal").addEventListener("click", function(){ if (LS()) LS().uhrZuruecksetzen(); imSpiel = true; neuStart(); });
  $("ende-raus").addEventListener("click", function(){
    zustand = "aus"; document.body.classList.remove("spielt");
    window.location.href = K.zurueck.href;
  });
  $("ende-neu").addEventListener("click", function(){
    spielVerlassen();
    schrittNr = 0; schrittZeigen();
  });

  /* ---- Zeichnen ---- */

  function himmel(){
    var w = welt();
    var g = ctx.createLinearGradient(0,0,0,bodenY);
    g.addColorStop(0, w.himmel[0]); g.addColorStop(0.55, w.himmel[1]); g.addColorStop(1, w.himmel[2]);
    ctx.fillStyle = g; ctx.fillRect(0,0,W,bodenY+2);
  }

  function hintergrund(){
    var w = welt();
    // Zwei Ebenen Hügel/Gebäude, die langsamer mitlaufen als der Boden -
    // daher wirkt es tief, ohne dass etwas in 3D gerechnet werden muss.
    ctx.fillStyle = w.fern;
    for (var k=0;k<24;k++){
      var x = k*260 - kamera*0.12;
      var mx = ((x % (W+420)) + (W+420)) % (W+420) - 210;
      var h = 46 + ((k*37) % 60);
      ctx.beginPath(); ctx.moveTo(mx-70, horizY); ctx.lineTo(mx, horizY-h); ctx.lineTo(mx+70, horizY); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = w.nah;
    for (k=0;k<30;k++){
      var x2 = k*200 - kamera*0.28;
      var mx2 = ((x2 % (W+320)) + (W+320)) % (W+320) - 160;
      var h2 = 28 + ((k*53) % 34);
      ctx.beginPath(); ctx.moveTo(mx2-80, horizY+6); ctx.quadraticCurveTo(mx2, horizY-h2, mx2+80, horizY+6); ctx.closePath(); ctx.fill();
    }
    schmuckZeichnen();
  }

  function schmuckZeichnen(){
    var art = welt().schmuck;
    for (var i=0;i<schmuck.length;i++){
      var s = schmuck[i];
      var x = s.x - kamera*0.35;
      var sx = ((x % (W+260)) + (W+260)) % (W+260) - 130;
      s.t += 0.01;
      if (art === "sterne"){
        ctx.fillStyle = "rgba(255,255,255," + (0.35 + Math.abs(Math.sin(s.t))*0.5) + ")";
        ctx.beginPath(); ctx.arc(sx, s.y, 1.4*s.s, 0, Math.PI*2); ctx.fill();
      } else if (art === "blasen"){
        ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(sx, s.y - (s.t*14 % 240), 4*s.s, 0, Math.PI*2); ctx.stroke();
      } else if (art === "blaetter"){
        ctx.fillStyle = "rgba(21,128,61,.30)";
        ctx.beginPath(); ctx.ellipse(sx, s.y*0.45 + Math.sin(s.t)*4, 16*s.s, 6*s.s, 0.5, 0, Math.PI*2); ctx.fill();
      } else if (art === "nebel"){
        ctx.fillStyle = "rgba(196,181,253,.10)";
        ctx.beginPath(); ctx.arc(sx, s.y, 46*s.s, 0, Math.PI*2); ctx.fill();
      } else if (art === "fackeln"){
        if (i % 4) continue;
        ctx.fillStyle = "rgba(251,191,36," + (0.45 + Math.abs(Math.sin(s.t*3))*0.4) + ")";
        ctx.beginPath(); ctx.arc(sx, Math.min(s.y, horizY-20), 7 + Math.sin(s.t*4)*2, 0, Math.PI*2); ctx.fill();
      } else if (art === "flutlicht"){
        if (i % 6) continue;
        ctx.fillStyle = "rgba(255,255,255,.16)";
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx-60, horizY); ctx.lineTo(sx+60, horizY); ctx.closePath(); ctx.fill();
      }
    }
  }

  function boden(){
    var w = welt();
    ctx.fillStyle = w.boden; ctx.fillRect(0, bodenY, W, H - bodenY);
    ctx.fillStyle = w.bodenOben; ctx.fillRect(0, bodenY, W, 10);
    ctx.fillStyle = "rgba(0,0,0,.12)";
    for (var x = -(kamera % 60); x < W; x += 60) ctx.fillRect(x, bodenY+10, 30, 4);
  }

  function pille(x, y, b, h, farbe, rand){
    var r = Math.min(16, h/2);
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+b-r, y); ctx.quadraticCurveTo(x+b, y, x+b, y+r);
    ctx.lineTo(x+b, y+h-r); ctx.quadraticCurveTo(x+b, y+h, x+b-r, y+h);
    ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fillStyle = farbe; ctx.fill();
    if (rand){ ctx.strokeStyle = rand; ctx.lineWidth = 3; ctx.stroke(); }
  }

  function stationZeichnen(){
    if (!station) return;
    var i, it;
    if (station.art === "ballons"){
      for (i=0;i<station.items.length;i++){
        it = station.items[i];
        if (it.weg) continue;
        var by = it.y + Math.sin(it.wack) * 5;
        var sx = it.x - kamera;
        // Schnur nach unten, damit klar ist, dass es schwebt
        ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx + it.w/2, by + it.h); ctx.lineTo(sx + it.w/2, by + it.h + 26); ctx.stroke();
        pille(sx, by, it.w, it.h, "rgba(255,255,255,.96)", "#4f46e5");
        ctx.fillStyle = "#1e293b";
        ctx.font = "600 " + it.schrift + "px ui-rounded, 'SF Pro Rounded', system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        var oben = by + it.h/2 - (it.zeilen.length-1)*it.abstand/2;
        for (var z=0; z<it.zeilen.length; z++) ctx.fillText(it.zeilen[z], sx + it.w/2, oben + z*it.abstand);
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      }
    }
    // Das Tor
    if (!station.geloest){
      var tx = station.torX - kamera;
      if (tx > -60 && tx < W + 60){
        var g = ctx.createLinearGradient(tx, 0, tx+16, 0);
        g.addColorStop(0, "rgba(129,140,248,.15)");
        g.addColorStop(0.5, "rgba(129,140,248,.70)");
        g.addColorStop(1, "rgba(129,140,248,.15)");
        ctx.fillStyle = g; ctx.fillRect(tx, 0, 16, bodenY);
        ctx.font = "26px system-ui"; ctx.textAlign = "center";
        ctx.fillText(station.art === "tor" ? "🔒" : "🚪", tx+8, bodenY - 18);
        ctx.textAlign = "left";
      }
    }
  }

  function heldZeichnen(){
    var x = held.x - kamera, y = held.y;
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.beginPath(); ctx.ellipse(x + held.w/2, bodenY + 4, held.w*0.42, 6, 0, 0, Math.PI*2); ctx.fill();
    if (held.unverwundbar > 0 && Math.floor(held.unverwundbar/5) % 2) return;
    ctx.save();
    ctx.translate(x + held.w/2, y + held.h/2);
    if (!held.blickRechts) ctx.scale(-1, 1);
    var hupf = held.amBoden ? Math.sin(held.lauf)*2 : -3;
    ctx.font = "46px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji'";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(figur().bild, 0, hupf);
    ctx.restore();
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  }

  function zeichnen(){
    ctx.save();
    if (ruettel > 0) ctx.translate((Math.random()-0.5)*6, (Math.random()-0.5)*6);
    himmel(); hintergrund(); boden();

    var i;
    for (i=0;i<sterne.length;i++){
      var s = sterne[i]; if (s.weg) continue;
      var sx = s.x - kamera; if (sx < -40 || sx > W+40) continue;
      ctx.fillStyle = "#fbbf24";
      ctx.font = "24px system-ui, 'Apple Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("⭐", sx, s.y + Math.sin(s.blink)*3);
    }
    for (i=0;i<gegner.length;i++){
      var g = gegner[i]; if (g.weg) continue;
      var gx = g.x - kamera; if (gx < -60 || gx > W+60) continue;
      ctx.font = "30px system-ui, 'Apple Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("👾", gx + g.w/2, g.y + g.h/2 + Math.sin(g.t)*4);
    }
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";

    stationZeichnen();
    heldZeichnen();

    for (i=0;i<partikel.length;i++){
      var p = partikel[i];
      ctx.globalAlpha = Math.max(0, p.leben/40);
      ctx.fillStyle = p.farbe;
      ctx.beginPath(); ctx.arc(p.x - kamera, p.y, p.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    pfeileZeigen();
    ctx.restore();
  }

  // Auf dem Handy passen nicht alle Antworten auf einen Schirm. Ohne
  // Hinweis sucht ein Kind die vierte Antwort nicht - es denkt, es gebe
  // nur drei.
  function pfeileZeigen(){
    if (!station || station.art !== "ballons" || station.geloest) return;
    var links = 0, rechts = 0;
    station.items.forEach(function(it){
      if (it.weg) return;
      if (it.x + it.w - kamera < 0) links++;
      if (it.x - kamera > W) rechts++;
    });
    ctx.font = "600 15px ui-rounded, system-ui"; ctx.textBaseline = "middle";
    if (links){
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.textAlign = "left"; ctx.fillText("◀ " + links, 10, bodenY - 150);
    }
    if (rechts){
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.textAlign = "right"; ctx.fillText(rechts + " ▶", W - 10, bodenY - 150);
    }
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  }

  /* ---- Fenster fuer die Messung: nur lesen ----------------------------
     Figur, Ballons und Boden liegen im Canvas, nicht im DOM - aus einer
     Schritt-Datei heraus sind sie also unsichtbar. Die Messung musste
     deshalb blind tippen und hoffen, dass sie unterwegs einen Ballon
     streift; mal ging es gut, mal nicht (mess-schritte-schmiede-fliegen.js,
     Etappe "Endtafel"). Eine Pruefung, die ihr Ziel nur zufaellig erreicht,
     ist keine Pruefung.

     Hier steht darum, WO alles ist - lesend, nichts laesst sich von aussen
     setzen. Bewusst NICHT dabei: welcher Ballon der richtige ist. Das waere
     ein Spickzettel fuer jedes Kind, das die Konsole aufmacht, und dafuer
     ist hier niemand zu jung. Zum Messen reicht "irgendein Ballon": ob
     richtig oder falsch - danach kommt die Loesungstafel, und das Spiel
     laeuft weiter. */
  window.__messStand = function(){
    return {
      x: held.x, y: held.y, w: held.w, h: held.h,
      boden: bodenY, kamera: kamera, breite: W, zustand: zustand,
      torX: station ? station.torX : null,
      art: station ? station.art : null,
      geloest: station ? !!station.geloest : null,
      ballons: (station && station.art === "ballons")
        ? station.items.filter(function(it){ return !it.weg; })
                       .map(function(it){ return { x:it.x, y:it.y, w:it.w, h:it.h }; })
        : []
    };
  };

  var laeuft = false;
  function schleife(){
    if (document.body.classList.contains("spielt")){ update(); zeichnen(); }
    requestAnimationFrame(schleife);
  }

  window.addEventListener("resize", function(){ if (document.body.classList.contains("spielt")) passeGroesse(); });
  window.addEventListener("orientationchange", function(){ setTimeout(passeGroesse, 300); });

  /* ---- Konfetti ---- */
  function fxKonfetti(){
    var c = $("konfetti");
    c.width = window.innerWidth; c.height = window.innerHeight;
    var k = c.getContext("2d"), teile = [];
    for (var i=0;i<70;i++){
      teile.push({ x:Math.random()*c.width, y:-20-Math.random()*120,
                   vx:(Math.random()-0.5)*3, vy:2+Math.random()*3,
                   b:5+Math.random()*7, h:8+Math.random()*9, dr:(Math.random()-0.5)*0.3, r:Math.random()*6,
                   f:["#4f46e5","#22c55e","#fbbf24","#f472b6","#38bdf8"][Math.floor(Math.random()*5)] });
    }
    var bilder = 0;
    (function male(){
      k.clearRect(0,0,c.width,c.height);
      teile.forEach(function(t){
        t.x += t.vx; t.y += t.vy; t.r += t.dr;
        k.save(); k.translate(t.x,t.y); k.rotate(t.r);
        k.fillStyle = t.f; k.fillRect(-t.b/2,-t.h/2,t.b,t.h); k.restore();
      });
      bilder++;
      if (bilder < 110) requestAnimationFrame(male); else k.clearRect(0,0,c.width,c.height);
    })();
  }

  /* ---------------------------------------------------------------
     Mitschrift. Dieselbe Trennung wie in der Werkstatt: Die Zeit am
     Bauzettel ist "bauen", die Zeit im Spiel ist "lernen". Denny am
     07.09.2026: die Entwicklungszeit gehoert nicht in die Lernzeit.
     --------------------------------------------------------------- */

  function LS(){ return window.lernstand || null; }
  var imSpiel = false;

  function antwortMelden(stimmt, gegeben){
    var a = station && station.aufgabe;
    if (!a) return;
    protokoll.push({
      merkmal: a.merkmal ? String(a.merkmal) : "",
      art: a.art || "wahl",
      stimmt: !!stimmt,
      nachspielzeit: false,
      sekunden: aufgabeBegonnen ? Math.round((Date.now() - aufgabeBegonnen)/1000) : 0,
      gegeben: stimmt ? "" : String(gegeben == null ? "" : gegeben),
      richtig: a.richtig != null ? String(a.richtig) : ""
    });
  }

  function bauzeitMelden(){
    if (imSpiel || !LS()) return;
    var sek = LS().aktiveSekunden();
    if (sek < 30) return;
    schicke({
      spielId:"schmiede", titel:"In der Schmiede gebaut", quelle:"schmiede",
      fach:"", thema:"Schmiede", lernbereich:"", sekunden:sek,
      pause: Math.max(0, LS().wanduhrSekunden() - sek),
      zeitart:"bauen", geraet: LS().geraet(),
      aufgaben:[{merkmal:"", art:"bauen", stimmt:true, nachspielzeit:false, sekunden:sek, gegeben:"", richtig:""}],
      nurBesuch:true
    });
    LS().uhrZuruecksetzen();
  }

  function lernstandSenden(){
    if (!protokoll.length) return;
    schicke({
      spielId: (spiel && spiel.id) || "", titel: (spiel && spiel.titel) || "Selbst geschmiedet",
      quelle: (spiel && spiel.quelle) || wahl.thema, fach: (spiel && spiel.fach) || "",
      thema: (spiel && spiel.thema) || "", lernbereich: (spiel && spiel.lernbereich) || "",
      sekunden: LS() ? LS().aktiveSekunden() : 0,
      pause: LS() ? Math.max(0, LS().wanduhrSekunden() - LS().aktiveSekunden()) : 0,
      zeitart: "lernen", geraet: LS() ? LS().geraet() : "",
      aufgaben: protokoll
    });
    protokoll = [];
    imSpiel = false;
    if (LS()) LS().uhrZuruecksetzen();
  }

  function schicke(runde){
    try {
      fetch("/api/statistik", { method:"POST", credentials:"same-origin",
        headers:{"content-type":"application/json"},
        body: JSON.stringify({kind:K.kind, runde:runde}) }).catch(function(){});
    } catch(e){}
  }

  // Wann ein Spiel zuletzt gespielt wurde - daran erkennt die Schmiede beim
  // naechsten Mal, welches am laengsten nicht dran war.
  function rundeMelden(){
    if (!spiel || !spiel.id) return;
    try {
      fetch("/api/spiele?kind=" + K.kind, { method:"POST", credentials:"same-origin",
        headers:{"content-type":"application/json"},
        body: JSON.stringify({ id: spiel.id, richtig: geloest, gesamt: aufgaben.length,
                               quelle: spiel.quelle || wahl.thema }) }).catch(function(){});
    } catch(e){}
  }

  window.addEventListener("pagehide", function(){
    standMerken();
    if (imSpiel) lernstandSenden(); else bauzeitMelden();
  });
  // Auf dem iPad kommt "pagehide" beim Weglegen oft gar nicht - die Seite
  // wird nur unsichtbar und spaeter still beendet.
  document.addEventListener("visibilitychange", function(){ if (document.hidden) standMerken(); });

  /* ---- Los ---- */
  try {
    var hub = localStorage.getItem("hub-url");
    if (K.kind === "paul" && hub && !/werkstatt/.test(hub)) $("zurueck").setAttribute("href", K.zurueck.href);
  } catch(e){}

  passeGroesse();
  pruefeAnmeldung();

})();
