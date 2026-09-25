/*
  Helenas Selbstkontrolle fuer das Hoerverstehen im Jahrgangsstufentest 7
  Englisch. Gebaut am 25.09.2026 aus ihrer Meldung 6ahcrbde4e:

    "Kannst du aber trotzdem korrigieren du kannst ja auf den link gehen wo
     die Loesungen sind und dort gucken. Wenn es so funktioniert"

  und davor: "weil ich das selber alles mach, verschwinde ich richtig viel
  zeit". Sie hat das Hoerverstehen 2025 durchgezogen, ausgefuellt und wollte
  wissen, ob es stimmt - und musste jede Zeile selbst im Loesungs-PDF suchen.

  WOHER DIE LOESUNGEN KOMMEN: aus den amtlichen Loesungs-PDFs des ISB Bayern,
  am 25.09.2026 abgerufen und mit pdftotext -layout gelesen. Nichts davon ist
  ausgedacht. Jede Luecke traegt den Wortlaut des Loesungs in "wortlaut" -
  der wird ihr NACH dem Pruefen gezeigt, damit sie Grenzfaelle selbst
  beurteilen kann.

  BE-PROBE: Jede Luecke ist 1 BE wert (so steht es in den Korrekturhinweisen:
  "Fuer jedes Item wird 1 BE vergeben"), jeder Test hat 20 BE. Stimmt die
  Summe eines Jahres nicht, fehlt eine Luecke - das prueft
  ../pruefe-hoerverstehen.mjs mechanisch nach.

  WIE VERGLICHEN WIRD: Wort gegen Wort, nicht Satz gegen Satz. Eine Variante
  gilt als getroffen, wenn ALLE ihre Kernwoerter in ihrer Antwort stehen -
  mit Toleranz bei der Schreibweise, denn im echten Test gilt:
  "Rechtschreibfehler werden, sofern sie nicht sinnentstellend sind,
  generell nicht gewertet." Helena schrieb "Countrys" und "stardet"; beides
  ist dort richtig und muss auch hier richtig sein.

  Lieber zu streng als falsches Lob: Wo der Vergleich nicht trifft, steht
  der Loesung daneben und sie kann selbst "zaehlt trotzdem" tippen. Die
  Seite behauptet nie, mehr zu koennen, als sie kann.
*/
(function(global){
  "use strict";

  /* ---------- Vergleichen ------------------------------------------- */

  function normal(s){
    var t = String(s == null ? "" : s).toLowerCase();
    t = t.replace(/[‘’´`]/g, "'");
    t = t.replace(/\bcannot\b/g, "can't").replace(/\bcan not\b/g, "can't");
    t = t.replace(/\bdo not\b/g, "don't").replace(/\bdid not\b/g, "didn't");
    t = t.replace(/\bis not\b/g, "isn't").replace(/\bare not\b/g, "aren't");
    t = t.replace(/'/g, "");
    /* Tausenderzeichen weg: 700,000,000 und 700.000.000 werden 700000000.
       Dreimal, weil jede Runde nur eine Gruppe erwischt. */
    for (var i = 0; i < 3; i++) t = t.replace(/(\d)[.,](\d{3})(?!\d)/g, "$1$2");
    t = t.replace(/(\d),(\d)/g, "$1.$2");          // Dezimalkomma wird Punkt
    t = t.replace(/[^a-z0-9äöüß.:½]+/g, " ");
    return t.split(/\s+/)
            .map(function(w){ return w.replace(/^[.:]+|[.:]+$/g, ""); })
            .filter(Boolean);
  }

  function abstand(a, b){
    if (a === b) return 0;
    var m = a.length, n = b.length, v0 = [], v1 = [], i, j;
    for (j = 0; j <= n; j++) v0[j] = j;
    for (i = 0; i < m; i++){
      v1[0] = i + 1;
      for (j = 0; j < n; j++){
        var kosten = a.charAt(i) === b.charAt(j) ? 0 : 1;
        v1[j+1] = Math.min(v1[j] + 1, v0[j+1] + 1, v0[j] + kosten);
      }
      for (j = 0; j <= n; j++) v0[j] = v1[j];
    }
    return v0[n];
  }

  /* Verneinungen vertragen keine Toleranz: "can" und "cant" unterscheiden
     sich um einen Buchstaben und bedeuten das Gegenteil. Ohne diese Liste
     gilt "the teams can sit in them" als richtig - gefunden vom Selbsttest,
     nicht im Betrieb. */
  var HART = ["cant","dont","didnt","doesnt","isnt","arent","wasnt","werent",
              "wont","never","not","no","nicht"];

  /* Zahlen muessen genau stimmen - "70" darf nicht als "700" durchgehen.
     Bei Woertern ist ein Buchstabe (ab 4 Zeichen) bzw. zwei (ab 7) erlaubt. */
  function toleranz(w){
    if (/\d/.test(w)) return 0;
    if (HART.indexOf(w) >= 0) return 0;
    if (w.length <= 3) return 0;
    if (w.length <= 6) return 1;
    return 2;
  }

  function wortDa(kern, woerter){
    for (var i = 0; i < woerter.length; i++){
      var w = woerter[i];
      if (w === kern) return true;
      if (kern.length >= 4 && HART.indexOf(kern) < 0 &&
          w.length > kern.length && w.indexOf(kern) === 0) return true;
      if (abstand(kern, w) <= toleranz(kern)) return true;
    }
    return false;
  }

  /* ok ist eine Liste von Varianten, jede Variante eine Liste von Kernwoertern.
     Eine Variante zaehlt nur, wenn ALLE ihre Kernwoerter dastehen. */
  function textStimmt(antwort, ok){
    var woerter = normal(antwort);
    if (!woerter.length) return false;
    for (var v = 0; v < ok.length; v++){
      var kerne = ok[v], alle = true;
      for (var k = 0; k < kerne.length; k++){
        if (!wortDa(normal(kerne[k])[0] || kerne[k], woerter)){ alle = false; break; }
      }
      if (alle) return true;
    }
    return false;
  }

  /* Eine Antwort bewerten. Rueckgabe: {beantwortet, stimmt, be, beMax}.
     Bei "mehrfach" gilt die amtliche Regel: mehr Haekchen als verlangt
     heisst null BE. */
  function pruefe(luecke, antwort){
    var max = luecke.be || 1;
    var leer = antwort == null || antwort === "" ||
               (Array.isArray(antwort) && antwort.length === 0);
    if (leer) return { beantwortet:false, stimmt:false, be:0, beMax:max };

    if (luecke.art === "mehrfach"){
      var gewaehlt = antwort.slice().sort();
      var richtig = luecke.richtig.slice().sort();
      if (gewaehlt.length > richtig.length)
        return { beantwortet:true, stimmt:false, be:0, beMax:max, zuviel:true };
      var treffer = gewaehlt.filter(function(x){ return richtig.indexOf(x) >= 0; }).length;
      return { beantwortet:true, stimmt:treffer === richtig.length && gewaehlt.length === richtig.length,
               be:treffer, beMax:max };
    }
    if (luecke.art === "tf" || luecke.art === "wahl" || luecke.art === "buchstabe"){
      var gut = String(antwort) === String(luecke.richtig);
      return { beantwortet:true, stimmt:gut, be:gut ? max : 0, beMax:max };
    }
    var t = textStimmt(antwort, luecke.ok || []);
    return { beantwortet:true, stimmt:t, be:t ? max : 0, beMax:max };
  }

  /* ---------- Die vier Tests ----------------------------------------- */
  /* Wortlaut der Aufgaben aus den Aufgaben-PDFs, Loesung aus den
     Loesungs-PDFs des ISB, beide am 25.09.2026 gelesen. */

  var TESTS = {
    "2025": {
      titel: "The European Day of Languages",
      aufgaben: [
        { nr:1, teil:"A", auftrag:"Complete the sentences.", luecken:[
          { art:"text", vor:"The Council of Europe is like a", nach:".",
            ok:[["club"]], wortlaut:"a big club" },
          { art:"text", vor:"Most of the", nach:"are in it.",
            ok:[["countries","europe"],["european","countries"]],
            wortlaut:"countries in Europe / European countries" },
          { art:"text", vor:"Their mission is to make Europe", nach:".",
            ok:[["better","place"]], wortlaut:"a better place (to grow up in / for kids)" }
        ]},
        { nr:2, teil:"A", auftrag:"Complete the table on the Council of Europe.", luecken:[
          { art:"text", vor:"year in which it began:", ok:[["1949"]], wortlaut:"1949" },
          { art:"text", vor:"city where it began:", ok:[["london"]], wortlaut:"London" },
          { art:"text", vor:"number of people who live in its member states:",
            ok:[["700","million"],["700m"],["700000000"]],
            wortlaut:"(almost) 700 million / 700m / 700,000,000" }
        ]},
        { nr:3, teil:"A", auftrag:"Languages. Tick whether each statement is true or false.", luecken:[
          { art:"tf", vor:"People speak a lot more languages than there are states.", richtig:"true", wortlaut:"true" },
          { art:"tf", vor:"Each country has just one national language.", richtig:"false", wortlaut:"false" },
          { art:"tf", vor:"Some people in Spain and Italy speak the oldest European language.", richtig:"false", wortlaut:"false" }
        ]},
        { nr:4, teil:"A", auftrag:"What do governments do to save special languages? Tick the two correct aspects.", luecken:[
          { art:"mehrfach", be:2,
            optionen:["teach them at schools","sell books in these languages","have films in these languages","have special language camps"],
            richtig:[0,3], wortlaut:"teach them at schools + have special language camps" }
        ]},
        { nr:5, teil:"A", auftrag:"Complete the sentences.", luecken:[
          { art:"text", vor:"Ms Smith says that learning new languages is good for our brains because it", nach:".",
            ok:[["trains","think"],["makes","smarter"]],
            wortlaut:"trains the way we think / makes us smarter" },
          { art:"text", vor:"It also changes the way we see others because it helps us to", nach:".",
            ok:[["more","open"],["understand","cultures"],["communicate"]],
            wortlaut:"become more open / understand other cultures (better) / communicate" }
        ]},
        { nr:6, teil:"A", auftrag:"Complete the sentences.", luecken:[
          { art:"text", vor:"Since then, it has always been on the same date:", nach:".",
            ok:[["26","september"],["26th","september"]], wortlaut:"26 September" },
          { art:"text", vor:"On this day, there are events where people can", nach:".",
            ok:[["try","out"],["get","interested"]],
            wortlaut:"try out / get interested in (learning) new languages – NICHT: learn new languages" }
        ]},
        { nr:7, teil:"B", auftrag:"Complete the sentences with information on the European Day of Languages in class 7A.", luecken:[
          { art:"text", vor:"The students can get ideas from the", nach:"of the European Day of Languages.",
            ok:[["website"],["homepage"]], wortlaut:"website / homepage – NICHT: Internet" },
          { art:"text", vor:"One student’s idea is to find out", nach:".",
            ok:[["countries","families"],["how","many","languages"],["languages","speak"]],
            wortlaut:"which countries his classmates’ families come from / how many languages the students in 7A speak" }
        ]},
        { nr:8, teil:"B", auftrag:"The big challenge. Tick whether each statement is true or false.", luecken:[
          { art:"tf", vor:"One group chooses a place somewhere in the world and the other group must find it.", richtig:"false", wortlaut:"false" },
          { art:"tf", vor:"When the students find the place, they type in its name.", richtig:"false", wortlaut:"false" }
        ]},
        { nr:9, teil:"B", auftrag:"What exactly gives the players tips about the places? Answer the question.", luecken:[
          { art:"text", ok:[["street","signs"],["posters"]], wortlaut:"(the language of) street signs / posters" }
        ]}
      ]
    },

    "2024": {
      titel: "Holidays and festivals",
      aufgaben: [
        { nr:1, teil:"A", auftrag:"King’s School in Canterbury. Complete the information.", luecken:[
          { art:"text", vor:"number of students at King’s School:",
            ok:[["400"],["four","hundred"]], wortlaut:"400 / four hundred" }
        ]},
        { nr:2, teil:"A", auftrag:"What’s special about King’s School? Complete the sentences.", luecken:[
          { art:"text", vor:"This is what people from Australia say when they speak about their", nach:".",
            ok:[["country"]], wortlaut:"country" },
          { art:"text", vor:"British students travel to meet their partners face-to-face in the month of", nach:"…",
            ok:[["december"]], wortlaut:"December" },
          { art:"text", vor:"… because it’s", nach:"there.",
            ok:[["summer"],["summertime"],["warm"],["hot"]], wortlaut:"summer / summertime / (warm/hot)" }
        ]},
        { nr:3, teil:"A", auftrag:"What British students do in Australia. Tick the correct picture. (Die Bilder stehen auf deinem Blatt.)", luecken:[
          { art:"wahl", optionen:["1. Bild","2. Bild","3. Bild"], richtig:"1",
            wortlaut:"das 2. Bild – der Strand (beach)" }
        ]},
        { nr:4, teil:"A", auftrag:"The project. Tick the correct statement.", luecken:[
          { art:"wahl", optionen:[
              "The kids meet on the Internet one day every week.",
              "Students from class 8JT take part with their partners from Down Under.",
              "Liz and Noah are preparing presentations on their last holidays."],
            richtig:"0", wortlaut:"The kids meet on the Internet one day every week." }
        ]},
        { nr:5, teil:"A", auftrag:"British Bank Holidays. Complete the sentences.", luecken:[
          { art:"text", vor:"In Britain almost all Bank Holidays are on a", nach:".",
            ok:[["monday"]], wortlaut:"Monday" },
          { art:"text", vor:"People often go away to cool places like", nach:", zoos, or fun parks.",
            ok:[["museums"],["museum"]], wortlaut:"museums" },
          { art:"text", vor:"Only one group of people is not happy about Bank Holidays: the", nach:".",
            ok:[["shop","assistants"],["assistants"]], wortlaut:"shop assistants" }
        ]},
        { nr:6, teil:"A", auftrag:"Liz’s last Bank Holiday. Tick the correct statement. Liz and her family …", luecken:[
          { art:"wahl", optionen:[
              "travelled to the sea by car.",
              "spent a day at the beach and had fish and chips there.",
              "went on some rides at the fun park but not everybody loved them."],
            richtig:"2", wortlaut:"went on some rides at the fun park but not everybody loved them." }
        ]},
        { nr:7, teil:"A", auftrag:"Dreamland. Complete the sentence.", luecken:[
          { art:"text", vor:"An attraction at Dreamland is the oldest roller coaster in the country. It’s also special because it’s", nach:".",
            ok:[["made","wood"],["wooden"],["wood"]], wortlaut:"made of wood / wooden" }
        ]},
        { nr:8, teil:"A", auftrag:"The history of Bank Holidays. Complete the table.", luecken:[
          { art:"text", vor:"when they started:", ok:[["150"]], wortlaut:"(about) 150 years ago" },
          { art:"text", vor:"where the name comes from:", ok:[["banks","closed"],["closed"]], wortlaut:"(just the) banks closed" },
          { art:"text", vor:"why people in Northern Ireland are lucky:",
            ok:[["10"],["ten"],["more","holidays"],["highest"]],
            wortlaut:"ten / 10 Bank Holidays – die hoechste Zahl im ganzen UK" }
        ]},
        { nr:9, teil:"B", auftrag:"A regatta on Todd River. Complete the sentences.", luecken:[
          { art:"text", vor:"This river in fact isn’t really a river because there is", nach:".",
            ok:[["sand"],["no","water"]], wortlaut:"just sand / no water" },
          { art:"text", vor:"The first regatta on Todd River took place in the year", nach:"…",
            ok:[["1962"]], wortlaut:"1962" },
          { art:"text", vor:"… because some people wanted to", nach:".",
            ok:[["raise","money"],["money","charity"]], wortlaut:"raise money (for charity)" }
        ]},
        { nr:10, teil:"B", auftrag:"The Henley-on-Todd Regatta. Tick the correct statement.", luecken:[
          { art:"wahl", optionen:[
              "Everybody can join in the regatta for free.",
              "The event starts with a team competition.",
              "The regatta is always on the same day in August."],
            richtig:"2", wortlaut:"The regatta is always on the same day in August." }
        ]},
        { nr:11, teil:"B", auftrag:"The Battle of the Boats. Complete the sentences.", luecken:[
          { art:"text", vor:"There are three teams. All of them wear", nach:".",
            ok:[["crazy","costumes"],["costumes"]], wortlaut:"crazy costumes" },
          { art:"text", vor:"Their boats aren’t real boats because", nach:".",
            ok:[["cant","sit"],["carry"]], wortlaut:"the teams can’t sit in them / (have to) carry them" }
        ]}
      ]
    },

    "2023": {
      titel: "A special school in Australia",
      aufgaben: [
        { nr:1, teil:"A", auftrag:"Schools in the last fifty years. Complete.", luecken:[
          { art:"text", vor:"One aspect that has changed:",
            ok:[["whiteboards"],["computers"],["tablets"],["internet"]],
            wortlaut:"interactive whiteboards / computers / tablets / internet" }
        ]},
        { nr:2, teil:"A", auftrag:"Tick the correct statement. Alice Springs is …", luecken:[
          { art:"wahl", optionen:[
              "in the west of Australia.",
              "six hours away from Julie’s home.",
              "a village where only a few people live."],
            richtig:"1", wortlaut:"six hours away from Julie’s home." }
        ]},
        { nr:3, teil:"A", auftrag:"Complete the table with information on Julie and her school.", luecken:[
          { art:"text", vor:"name of the school: Alice Springs …",
            ok:[["school","air"]], wortlaut:"School of the Air" },
          { art:"text", vor:"age at which Julie became a student:",
            ok:[["three","half"],["3.5"],["3½"]], wortlaut:"(at the age of) three and a half / 3.5" },
          { art:"text", vor:"the month when the school year starts:",
            ok:[["february"]], wortlaut:"February" },
          { art:"text", vor:"age of the school:", ok:[["70"]], wortlaut:"70 (years old)" }
        ]},
        { nr:4, teil:"A", auftrag:"Typical school days. Tick whether the statement is true or false.", luecken:[
          { art:"tf", vor:"Julie gets her worksheets by e-mail every week.", richtig:"false", wortlaut:"false" },
          { art:"tf", vor:"Lessons start at quarter to nine.", richtig:"true", wortlaut:"true" },
          { art:"tf", vor:"Ms Baker is their teacher.", richtig:"false", wortlaut:"false" },
          { art:"tf", vor:"The class always celebrates birthdays on Fridays.", richtig:"false", wortlaut:"false" }
        ]},
        { nr:5, teil:"A", auftrag:"Complete the sentences.", luecken:[
          { art:"text", vor:"In her class, there are", nach:"other students and Julie.",
            ok:[["12"],["twelve"]], wortlaut:"12 / twelve" },
          { art:"text", vor:"She finds it good to be in such a small class because", nach:"… and everybody can be active during lessons every day.",
            ok:[["ask","questions"],["chances","ask"]],
            wortlaut:"she gets lots of chances to ask questions / she can ask lots of questions" }
        ]},
        { nr:6, teil:"B", auftrag:"At high school. Complete the table. (fifteen = …)", luecken:[
          { art:"text", vor:"number of", ok:[["lessons"]], wortlaut:"lessons (a week)" }
        ]},
        { nr:7, teil:"B", auftrag:"Tick the two correct statements. Her year’s website is important for Julie and the other students because they can …", luecken:[
          { art:"mehrfach", be:2,
            optionen:["read stories.","write to their teachers.","chat with their classmates.",
                      "do worksheets and get feedback.","watch some of their lessons again."],
            richtig:[3,4], wortlaut:"do worksheets and get feedback + watch some of their lessons again" }
        ]},
        { nr:8, teil:"B", auftrag:"Julie’s afternoons. Tick the picture which shows what she often does. (Die Bilder stehen auf deinem Blatt.)", luecken:[
          { art:"wahl", optionen:["1. Bild","2. Bild","3. Bild"], richtig:"0",
            wortlaut:"das 1. Bild – Reiten (horse riding)" }
        ]},
        { nr:9, teil:"B", auftrag:"Complete the sentence.", luecken:[
          { art:"text", vor:"For Julie, the get-together week is the", nach:"in the school year …",
            ok:[["most","exciting"],["best","week"]], wortlaut:"most exciting time / best week (ever)" },
          { art:"text", vor:"… because", nach:".",
            ok:[["meet","camp"],["face","face"],["see","each","other"]],
            wortlaut:"the students (and teachers) meet at a camp / they see each other face-to-face" }
        ]},
        { nr:10, teil:"B", auftrag:"Complete.", luecken:[
          { art:"text", vor:"Julie’s best friend is Noah. His school room is on", nach:".",
            ok:[["wheels"]], wortlaut:"wheels" },
          { art:"text", vor:"He travels around with his parents because they work in", nach:".",
            ok:[["different","places"]], wortlaut:"different places" }
        ]}
      ]
    },

    "2022": {
      titel: "School Twinning",
      aufgaben: [
        { nr:1, teil:"A", auftrag:"Fill in the information.", luecken:[
          { art:"text", vor:"Number of German towns/cities with a British partner:",
            ok:[["553"]], wortlaut:"553" },
          { art:"text", vor:"Why twinning is a good idea:",
            ok:[["meet"],["make","friends"],["friends"]],
            wortlaut:"people (from different countries) can meet / make friends" }
        ]},
        { nr:2, teil:"A", auftrag:"Which city is it? Write L (= London), M (= Munich) or O (= Oxford).", luecken:[
          { art:"buchstabe", optionen:["L","M","O"], vor:"The city where Mr Black shows a film:", richtig:"M", wortlaut:"M (Munich)" },
          { art:"buchstabe", optionen:["L","M","O"], vor:"The city where Mr Black lives:", richtig:"O", wortlaut:"O (Oxford)" },
          { art:"buchstabe", optionen:["L","M","O"], vor:"The city where lots of international students met:", richtig:"L", wortlaut:"L (London)" },
          { art:"buchstabe", optionen:["L","M","O"], vor:"The city where the partner school is going to be:", richtig:"O", wortlaut:"O (Oxford)" }
        ]},
        { nr:3, teil:"A", auftrag:"Tick the correct answer. Some students stayed at home and joined the project online because …", luecken:[
          { art:"wahl", optionen:[
              "it was too expensive to go there.",
              "they didn’t have time to travel there.",
              "there were too many students there already."],
            richtig:"0", wortlaut:"it was too expensive to go there." }
        ]},
        { nr:4, teil:"A", auftrag:"Write down Sarah’s idea for what to do on Saturdays and Sundays.", luecken:[
          { art:"text", ok:[["visit","places"],["go","visit"]], wortlaut:"go and visit places (with families)" }
        ]},
        { nr:5, teil:"B", auftrag:"Add the information about the German students’ time at their English partner school.", luecken:[
          { art:"text", vor:"The lessons ended at …",
            ok:[["quarter","four"],["3.45"],["15:45"],["1545"]],
            wortlaut:"(a) quarter to four (in the afternoon) / 3.45 pm / 15:45" },
          { art:"text", vor:"The clubs they went to were the chess club and the …",
            ok:[["yearbook"],["drama"]], wortlaut:"yearbook club / drama club" }
        ]},
        { nr:6, teil:"B", auftrag:"Tick the correct answer. The English students knew they were German visitors because …", luecken:[
          { art:"wahl", optionen:[
              "they spoke German.",
              "they asked lots of questions.",
              "they didn’t wear school uniforms."],
            richtig:"2", wortlaut:"they didn’t wear school uniforms." }
        ]},
        { nr:7, teil:"B", auftrag:"Finish the sentence.", luecken:[
          { art:"text", vor:"Paul remembers that the families they stayed with were friendly and", nach:".",
            ok:[["asked","questions"],["questions"]], wortlaut:"asked a lot of questions (about what they do at home)" }
        ]},
        { nr:8, teil:"B", auftrag:"Tick the correct picture. What did Sarah get on Easter Sunday? (Die Bilder stehen auf deinem Blatt.)", luecken:[
          { art:"wahl", optionen:["1. Bild","2. Bild","3. Bild"], richtig:"1",
            wortlaut:"das 2. Bild – Schokoeier in Schachteln (chocolate eggs in boxes)" }
        ]},
        { nr:9, teil:"B", auftrag:"Tick the correct answer.", luecken:[
          { art:"wahl", optionen:[
              "They ate the painted eggs on top of the hill.",
              "They had a picnic before they went up the hill.",
              "They had lovely food when they arrived at the top of the hill."],
            richtig:"2", wortlaut:"They had lovely food when they arrived at the top of the hill." }
        ]},
        { nr:10, teil:"B", auftrag:"Complete the text.", luecken:[
          { art:"text", vor:"Egg rolling is", nach:"in England.",
            ok:[["tradition"],["competition"]], wortlaut:"a(n) (old) (Easter) tradition / competition" },
          { art:"text", vor:"Each person takes one egg. All the eggs have", nach:".",
            ok:[["different","colour"]], wortlaut:"a different colour / different colours" }
        ]},
        { nr:11, teil:"B", auftrag:"Who? Write J (= John), L (= Lucy) or S (= Sarah).", luecken:[
          { art:"buchstabe", optionen:["J","L","S"], vor:"… won the second round.", richtig:"L", wortlaut:"L (Lucy)" },
          { art:"buchstabe", optionen:["J","L","S"], vor:"… won more rounds than the others.", richtig:"J", wortlaut:"J (John)" },
          { art:"buchstabe", optionen:["J","L","S"], vor:"… had the fastest egg in round one.", richtig:"S", wortlaut:"S (Sarah)" },
          { art:"buchstabe", optionen:["J","L","S"], vor:"… had the egg that went the longest way in round two.", richtig:"L", wortlaut:"L (Lucy)" }
        ]}
      ]
    }
  };

  function beSumme(jahr){
    var t = TESTS[jahr];
    if (!t) return 0;
    var s = 0;
    t.aufgaben.forEach(function(a){
      a.luecken.forEach(function(l){ s += (l.be || 1); });
    });
    return s;
  }

  var API = { TESTS:TESTS, pruefe:pruefe, textStimmt:textStimmt, normal:normal,
              abstand:abstand, beSumme:beSumme };

  if (typeof module === "object" && module.exports) module.exports = API;
  global.BETLOES = API;
})(typeof window !== "undefined" ? window : globalThis);
