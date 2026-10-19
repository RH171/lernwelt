/* Pauls Deutsch-Probenstoff - der Motor (19.10.2026, Kapitel 131). Reine Logik, Node und Browser
 * (window.DPSMotor). Rechnet die Runde des Tages, prueft Antworten und liefert die Hilfen.
 *
 * Anlass: Denny am 19.10.2026: "Nun sollte Deutsch in den Fokus gehen … mindestens am Tag 10-30 Minuten
 * ueben." Deutsch-Probe am Freitag, 23.10.2026, "Sprachuntersuchen | RS" (Sprache untersuchen /
 * Richtig schreiben). Pauls Luecken laut der Lehrerin auf seinem Wiederholungsblatt: "Das koenntest du
 * noch ueben: Nomen, Verben". Nur Paul (Proben-Uebungen nur fuer das Kind mit der Probe, Kapitel 105).
 *
 * Acht Themen, Klasse 4 (LehrplanPLUS Bayern, Sprache untersuchen / Richtig schreiben):
 *   wortart   Nomen, Verb oder Adjektiv im Satz              (antippen)
 *   zusammen  zusammengesetzte Nomen: Nomen+Nomen, Verb+Nomen, Adjektiv+Nomen (antippen)
 *   perfekt   Perfekt bilden: er geht -> ist gegangen         (eintippen, /toleranz.js)
 *   subjekt   Subjekt im Satz finden (alle Woerter)          (antippen)
 *   praedikat Praedikat im Satz finden                       (antippen)
 *   vokal     langer oder kurzer Vokal; richtig geschrieben (Doppelmitlaut, ck, tz) (antippen)
 *   ableiten  e oder ae, eu oder aeu                          (antippen)
 *   gross     gross oder klein (Nomen, Nominalisierung "die Grossen", "beim Schwimmen") (antippen)
 *
 * Jeden Tag neue Aufgaben ohne Speicher: Jede Liste steht in einer festen, gemischten Reihenfolge; Tag und
 * Runde waehlen den Abschnitt (tagNr*3 + runde). Ab dem 19.10. kommt so jede Aufgabe erst wieder, wenn die
 * Liste durch ist. Kein Schreibvorgang dafuer.
 * Keine Warum-Frage, kein w-e-i-l in allem, was Paul liest (die Lehrerin erlaubt es nicht; VERBOTEN prueft).
 */
(function (wurzel) {
  "use strict";

  var EIN = {
    ab: "2026-10-19",          // erster Tag (Tag 0 der Reihenfolge)
    bis: "2026-10-23",         // Deutsch-Probe; am Probentag ab 13 Uhr vorbei (wie probenkarte.js)
    abStunde: 13,
    rundenJeTag: 3,            // so viele Runden je Tag ohne Ueberschneidung mit dem naechsten Tag
    // Aufgaben je Runde und Thema: 16 Aufgaben, Nomen und Verben (Luecke laut Lehrerin) etwas mehr.
    jeRunde: { wortart: 3, zusammen: 2, perfekt: 3, subjekt: 1, praedikat: 1, vokal: 2, ableiten: 2, gross: 2 },
    wiederNach: 4,             // falsch beim ersten Versuch: dieselbe Aufgabe nach 4 Aufgaben noch einmal
    wiederHoechstens: 6
  };

  var THEMA = {
    wortart:   { name: "Wortarten",               merkmal: "deutsch wortart" },
    zusammen:  { name: "Zusammengesetzte Nomen",  merkmal: "deutsch zusammengesetzte nomen" },
    perfekt:   { name: "Perfekt",                 merkmal: "deutsch perfekt" },
    subjekt:   { name: "Subjekt",                 merkmal: "deutsch subjekt" },
    praedikat: { name: "Prädikat",                merkmal: "deutsch praedikat" },
    vokal:     { name: "Lang oder kurz",          merkmal: "deutsch vokal lang kurz" },
    ableiten:  { name: "e oder ä, eu oder äu",    merkmal: "deutsch ableiten e ae" },
    gross:     { name: "Groß oder klein",         merkmal: "deutsch grossschreibung" }
  };
  var REIHE = ["wortart", "zusammen", "perfekt", "subjekt", "praedikat", "vokal", "ableiten", "gross"];

  /* ---------- Listen ---------- */

  // [Satz mit *markiertem* Wort, Wortart N|V|A]
  var WORTART = [
    ["Der *Hund* bellt laut.", "N"], ["Der Hund *bellt* laut.", "V"], ["Der Hund bellt *laut*.", "A"],
    ["Paul *spielt* im Garten.", "V"], ["Im *Garten* blühen Blumen.", "N"], ["Die Blumen sind *bunt*.", "A"],
    ["Oma *backt* einen Kuchen.", "V"], ["Der Kuchen ist *süß*.", "A"], ["Der *Kuchen* duftet.", "N"],
    ["Die Kinder *rennen* über den Hof.", "V"], ["Der *Bürgermeister* arbeitet im Rathaus.", "N"],
    ["Das Rathaus ist *alt*.", "A"], ["Leon *schießt* ein Tor.", "V"], ["Das *Tor* ist groß.", "N"],
    ["Der Ball ist *rund*.", "A"], ["Im Winter ist es *kalt*.", "A"], ["Im *Winter* fällt Schnee.", "N"],
    ["Wir *lesen* ein Buch.", "V"], ["Das *Buch* ist spannend.", "N"], ["Das Buch ist *spannend*.", "A"],
    ["Die Katze *schläft* auf dem Sofa.", "V"], ["Die *Katze* ist müde.", "N"], ["Die Katze ist *müde*.", "A"],
    ["Der Bus *hält* an der Schule.", "V"], ["Die *Lehrerin* erklärt die Aufgabe.", "N"],
    ["Die Aufgabe ist *leicht*.", "A"], ["Die Vögel *singen* im Baum.", "V"], ["Der *Baum* ist hoch.", "N"],
    ["Der Baum ist *hoch*.", "A"], ["Am Abend *schreibt* Paul eine Geschichte.", "V"],
    ["Die *Stadt* Fürth hat viele Brücken.", "N"], ["Die Straße ist *nass*.", "A"],
    ["Der Wind *weht* kräftig.", "V"], ["Mein *Freund* wohnt nebenan.", "N"], ["Der Tee ist *heiß*.", "A"],
    ["Wir *bauen* eine Burg.", "V"]
  ];
  var WORTART_NAME = { N: "Nomen", V: "Verb", A: "Adjektiv" };

  // [Wort, Teil 1, Teil 2, Art NN|VN|AN]
  var ZUSAMMEN = [
    ["Handschuh", "Hand", "Schuh", "NN"], ["Haustür", "Haus", "Tür", "NN"], ["Apfelbaum", "Apfel", "Baum", "NN"],
    ["Fußball", "Fuß", "Ball", "NN"], ["Zahnbürste", "Zahn", "Bürste", "NN"], ["Regenschirm", "Regen", "Schirm", "NN"],
    ["Sonnenbrille", "Sonne", "Brille", "NN"], ["Tischbein", "Tisch", "Bein", "NN"], ["Baumhaus", "Baum", "Haus", "NN"],
    ["Stadtplan", "Stadt", "Plan", "NN"], ["Wintermantel", "Winter", "Mantel", "NN"], ["Hosentasche", "Hose", "Tasche", "NN"],
    ["Gießkanne", "gießen", "Kanne", "VN"], ["Schreibtisch", "schreiben", "Tisch", "VN"], ["Waschmaschine", "waschen", "Maschine", "VN"],
    ["Spielplatz", "spielen", "Platz", "VN"], ["Schlafzimmer", "schlafen", "Zimmer", "VN"], ["Lesebuch", "lesen", "Buch", "VN"],
    ["Schwimmbad", "schwimmen", "Bad", "VN"], ["Bratpfanne", "braten", "Pfanne", "VN"], ["Trinkflasche", "trinken", "Flasche", "VN"],
    ["Wohnzimmer", "wohnen", "Zimmer", "VN"], ["Kochtopf", "kochen", "Topf", "VN"], ["Turnhalle", "turnen", "Halle", "VN"],
    ["Kühlschrank", "kühl", "Schrank", "AN"], ["Großstadt", "groß", "Stadt", "AN"], ["Weißbrot", "weiß", "Brot", "AN"],
    ["Schnellzug", "schnell", "Zug", "AN"], ["Hochhaus", "hoch", "Haus", "AN"], ["Rotstift", "rot", "Stift", "AN"],
    ["Blaubeere", "blau", "Beere", "AN"], ["Altpapier", "alt", "Papier", "AN"], ["Glatteis", "glatt", "Eis", "AN"],
    ["Großeltern", "groß", "Eltern", "AN"], ["Schwarzbrot", "schwarz", "Brot", "AN"], ["Frischkäse", "frisch", "Käse", "AN"]
  ];
  var ZUSAMMEN_NAME = { NN: "Nomen + Nomen", VN: "Verb + Nomen", AN: "Adjektiv + Nomen" };

  // [Personalform Praesens, Perfekt (Hilfsverb + Partizip), Grundform, falsche Formen]
  var PERFEKT = [
    ["er geht", "ist gegangen", "gehen", ["hat gegangen", "ist gegeht", "hat gegeht"]],
    ["sie isst", "hat gegessen", "essen", ["ist gegessen", "hat gegesst", "hat geesst"]],
    ["wir spielen", "haben gespielt", "spielen", ["sind gespielt", "haben gespielen"]],
    ["ich laufe", "bin gelaufen", "laufen", ["habe gelaufen", "bin gelauft"]],
    ["du schreibst", "hast geschrieben", "schreiben", ["bist geschrieben", "hast geschreibt"]],
    ["er fährt", "ist gefahren", "fahren", ["hat gefahren", "ist gefahrt"]],
    ["sie liest", "hat gelesen", "lesen", ["ist gelesen", "hat gelest"]],
    ["wir trinken", "haben getrunken", "trinken", ["sind getrunken", "haben getrinkt"]],
    ["ich komme", "bin gekommen", "kommen", ["habe gekommen", "bin gekommt"]],
    ["er schläft", "hat geschlafen", "schlafen", ["ist geschlafen", "hat geschlaft"]],
    ["sie springt", "ist gesprungen", "springen", ["hat gesprungen", "ist gespringt"]],
    ["du singst", "hast gesungen", "singen", ["bist gesungen", "hast gesingt"]],
    ["wir malen", "haben gemalt", "malen", ["sind gemalt", "haben gemalen"]],
    ["er findet", "hat gefunden", "finden", ["ist gefunden", "hat gefindet"]],
    ["sie schwimmt", "ist geschwommen", "schwimmen", ["hat geschwommen", "ist geschwimmt"]],
    ["ich bringe", "habe gebracht", "bringen", ["bin gebracht", "habe gebringt"]],
    ["er denkt", "hat gedacht", "denken", ["ist gedacht", "hat gedenkt"]],
    ["sie fliegt", "ist geflogen", "fliegen", ["hat geflogen", "ist gefliegt"]],
    ["wir rennen", "sind gerannt", "rennen", ["haben gerannt", "sind gerennt"]],
    ["du rufst", "hast gerufen", "rufen", ["bist gerufen", "hast geruft"]],
    ["er sieht", "hat gesehen", "sehen", ["ist gesehen", "hat geseht"]],
    ["sie bleibt", "ist geblieben", "bleiben", ["hat geblieben", "ist gebleibt"]],
    ["ich kaufe", "habe gekauft", "kaufen", ["bin gekauft", "habe gekaufen"]],
    ["er baut", "hat gebaut", "bauen", ["ist gebaut", "hat gebauen"]],
    ["sie fällt", "ist gefallen", "fallen", ["hat gefallen", "ist gefallt"]],
    ["wir lachen", "haben gelacht", "lachen", ["sind gelacht", "haben gelachen"]],
    ["er nimmt", "hat genommen", "nehmen", ["ist genommen", "hat genehmt"]],
    ["sie gibt", "hat gegeben", "geben", ["ist gegeben", "hat gegebt"]],
    ["er wirft", "hat geworfen", "werfen", ["ist geworfen", "hat gewerft"]],
    ["sie hilft", "hat geholfen", "helfen", ["ist geholfen", "hat gehelft"]],
    ["er klettert", "ist geklettert", "klettern", ["hat geklettert", "ist gekletteren"]],
    ["wir fahren", "sind gefahren", "fahren", ["haben gefahren", "sind gefahrt"]],
    ["du wäschst", "hast gewaschen", "waschen", ["bist gewaschen", "hast gewäscht"]],
    ["ich trage", "habe getragen", "tragen", ["bin getragen", "habe getragt"]]
  ];
  // Hilfsverb je Person: [haben, sein]
  var HILFS = { ich: ["habe", "bin"], du: ["hast", "bist"], er: ["hat", "ist"], sie: ["hat", "ist"], wir: ["haben", "sind"] };
  // Bewegung von einem Ort zum anderen: sein (fuer die Hilfe)
  var MIT_SEIN = { gehen: 1, laufen: 1, fahren: 1, kommen: 1, springen: 1, schwimmen: 1, fliegen: 1, rennen: 1, bleiben: 1, fallen: 1, klettern: 1 };

  // [Satz als Woerter, Subjekt (Indizes), Praedikat (Index)]
  var SAETZE = [
    ["Der Hund bellt laut.", [0, 1], 2], ["Paul spielt im Garten Fußball.", [0], 1],
    ["Die Kinder lesen ein Buch.", [0, 1], 2], ["Am Morgen backt Oma einen Kuchen.", [3], 2],
    ["Im Rathaus arbeitet der Bürgermeister.", [3, 4], 2], ["Heute scheint die Sonne.", [2, 3], 1],
    ["Die Lehrerin erklärt die Aufgabe.", [0, 1], 2], ["Der Bäcker verkauft frische Brezen.", [0, 1], 2],
    ["Im Winter fällt viel Schnee.", [3, 4], 2], ["Leon schießt den Ball ins Tor.", [0], 1],
    ["Die Katze schläft auf dem Sofa.", [0, 1], 2], ["Nach der Schule macht Paul Hausaufgaben.", [4], 3],
    ["Die Feuerwehr löscht den Brand.", [0, 1], 2], ["Viele Menschen wohnen in Fürth.", [0, 1], 2],
    ["Der Stadtrat entscheidet über den Spielplatz.", [0, 1], 2], ["Das kleine Mädchen trinkt Kakao.", [0, 1, 2], 3],
    ["Der Wind bläst kräftig.", [0, 1], 2], ["Unsere Klasse besucht das Museum.", [0, 1], 2],
    ["Die Vögel singen im Baum.", [0, 1], 2], ["Morgen schreibt die Klasse eine Probe.", [2, 3], 1],
    ["Mein Freund schenkt mir einen Ball.", [0, 1], 2], ["Im Sommer baden wir im See.", [3], 2],
    ["Der große Hund jagt die Katze.", [0, 1, 2], 3], ["Am Nachmittag regnet es.", [3], 2],
    ["Opa repariert das Fahrrad.", [0], 1], ["Die Bürger wählen den Stadtrat.", [0, 1], 2],
    ["Auf dem Markt kaufen wir Äpfel.", [4], 3], ["Das Flugzeug landet pünktlich.", [0, 1], 2]
  ];

  // Lang oder kurz: [Wort, markierter Vokal (Start, Laenge), lang?]
  var VOKAL = [
    ["Hase", 1, 1, true], ["Kamm", 1, 1, false], ["Bahn", 1, 1, true], ["Ball", 1, 1, false],
    ["Biene", 1, 2, true], ["Mitte", 1, 1, false], ["Ofen", 0, 1, true], ["Sonne", 1, 1, false],
    ["Schule", 3, 1, true], ["Butter", 1, 1, false], ["Rabe", 1, 1, true], ["Tasse", 1, 1, false],
    ["Höhle", 1, 1, true], ["Hütte", 1, 1, false], ["Zahn", 1, 1, true], ["Katze", 1, 1, false],
    ["Wiese", 1, 2, true], ["Hecke", 1, 1, false], ["Boot", 1, 2, true], ["Schiff", 3, 1, false],
    ["Blume", 2, 1, true], ["Zucker", 1, 1, false], ["Nase", 1, 1, true], ["Tanne", 1, 1, false],
    ["Mond", 1, 1, true], ["Rock", 1, 1, false], ["Tal", 1, 1, true], ["Brücke", 2, 1, false],
    ["Kuh", 1, 1, true], ["Pfütze", 2, 1, false]
  ];
  // Richtig geschrieben: [richtig, falsch, Regel ck|tz|doppel]
  var SCHREIB = [
    ["Butter", "Buter", "doppel"], ["Zucker", "Zuker", "ck"], ["Hecke", "Heke", "ck"], ["Tasse", "Tase", "doppel"],
    ["Sonne", "Sone", "doppel"], ["Schiff", "Schif", "doppel"], ["Katze", "Kaze", "tz"], ["Pfütze", "Pfüze", "tz"],
    ["Brücke", "Brüke", "ck"], ["Mütze", "Müze", "tz"], ["Wecker", "Weker", "ck"], ["Kammer", "Kamer", "doppel"],
    ["Blitz", "Bliz", "tz"], ["Decke", "Deke", "ck"], ["Teller", "Teler", "doppel"], ["Hitze", "Hize", "tz"],
    ["Rucksack", "Ruksack", "ck"], ["Puppe", "Pupe", "doppel"], ["Platz", "Plaz", "tz"], ["Socke", "Soke", "ck"]
  ];

  // e oder ae, eu oder aeu: [Wort mit _ , Loesung, Wahl e|eu, verwandtes Wort oder ""]
  var ABLEITEN = [
    ["H_nde", "ä", "e", "Hand"], ["W_lder", "ä", "e", "Wald"], ["F_lder", "e", "e", ""], ["G_ste", "ä", "e", "Gast"],
    ["Gl_ser", "ä", "e", "Glas"], ["St_dte", "ä", "e", "Stadt"], ["M_nner", "ä", "e", "Mann"], ["B_tten", "e", "e", ""],
    ["K_lte", "ä", "e", "kalt"], ["tr_gt", "ä", "e", "tragen"], ["f_hrt", "ä", "e", "fahren"], ["W_lt", "e", "e", ""],
    ["N_tze", "e", "e", ""], ["B_cker", "ä", "e", "backen"], ["Z_lte", "e", "e", ""], ["l_cheln", "ä", "e", "lachen"],
    ["H_ser", "äu", "eu", "Haus"], ["B_me", "äu", "eu", "Baum"], ["Fr_nde", "eu", "eu", ""], ["L_te", "eu", "eu", ""],
    ["M_se", "äu", "eu", "Maus"], ["h_te", "eu", "eu", ""], ["Kr_ter", "äu", "eu", "Kraut"], ["n_", "eu", "eu", ""],
    ["Tr_me", "äu", "eu", "Traum"], ["Fr_de", "eu", "eu", ""], ["L_fer", "äu", "eu", "laufen"], ["F_er", "eu", "eu", ""],
    ["Z_ne", "äu", "eu", "Zaun"], ["Kr_z", "eu", "eu", ""], ["R_ber", "äu", "eu", "rauben"]
  ];

  // Gross oder klein: [Satz mit {gross|klein}-Wort, richtig geschrieben, gross?, Grund g|n|a]
  //   g = Nominalisierung (Begleiter davor), n = Nomen, a = gehoert zu einem Nomen / Verb / Zeitangabe klein
  var GROSS = [
    ["Die {großen} dürfen zuerst gehen.", "Großen", true, "g"], ["Der {große} Hund bellt.", "große", false, "a"],
    ["Beim {schwimmen} friere ich nie.", "Schwimmen", true, "g"], ["Wir gehen heute {schwimmen}.", "schwimmen", false, "a"],
    ["Das {laufen} macht mir Spaß.", "Laufen", true, "g"], ["Ich kann schnell {laufen}.", "laufen", false, "a"],
    ["Ich wünsche dir alles {gute}.", "Gute", true, "g"], ["Das ist ein {gutes} Buch.", "gutes", false, "a"],
    ["Zum {lesen} brauche ich Ruhe.", "Lesen", true, "g"], ["Paul kann gut {rechnen}.", "rechnen", false, "a"],
    ["Sie hat etwas {neues} gekauft.", "Neues", true, "g"], ["Das ist ein {neues} Fahrrad.", "neues", false, "a"],
    ["Im {dunkeln} sieht man wenig.", "Dunkeln", true, "g"], ["Der Keller ist {dunkel}.", "dunkel", false, "a"],
    ["Die {kleinen} spielen im Sand.", "Kleinen", true, "g"], ["Der {kleine} Bruder schläft.", "kleine", false, "a"],
    ["Mein {freund} heißt Tim.", "Freund", true, "n"], ["Am {abend} lesen wir.", "Abend", true, "n"],
    ["Wir treffen uns am {morgen}.", "Morgen", true, "n"], ["Ich komme {morgen} wieder.", "morgen", false, "a"],
    ["Beim {malen} bin ich ganz still.", "Malen", true, "g"], ["Wir wollen heute {malen}.", "malen", false, "a"],
    ["Die {fürther} feiern die Kirchweih.", "Fürther", true, "n"], ["Viel {glück} bei der Probe!", "Glück", true, "n"],
    ["Das {singen} im Chor ist schön.", "Singen", true, "g"], ["Die Sonne scheint {hell}.", "hell", false, "a"]
  ];

  // Was Paul liest, darf nie nach einem Grund fragen (die Lehrerin erlaubt kein "weil").
  var VERBOTEN = /\bweil\b|\bwarum\b|\bwieso\b|\bweshalb\b|begründ/i;

  /* ---------- Zufall und Tag ---------- */
  function heuteIso(d) {
    if (typeof window !== "undefined" && window.__dpsHeute) return window.__dpsHeute;
    d = d || new Date(); return d.toLocaleDateString("sv-SE");
  }
  function stundeJetzt() {
    if (typeof window !== "undefined" && window.__dpsHeute) return +window.__dpsStunde || 0;
    return new Date().getHours();
  }
  function tageSeit(a, b) {
    var x = Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10));
    var y = Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10));
    return Math.round((y - x) / 86400000);
  }
  // Ab dem Probentag 13 Uhr ist die Uebung vorbei.
  function aktiv(tag, std) {
    tag = tag || heuteIso(); std = std == null ? stundeJetzt() : std;
    if (tag > EIN.bis) return false;
    if (tag === EIN.bis && std >= EIN.abStunde) return false;
    return true;
  }
  function zufall(saat) {
    var s = saat >>> 0 || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function hash(t) { var h = 2166136261; for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function gemischt(n, saat) {
    var a = []; for (var i = 0; i < n; i++) a.push(i);
    var r = zufall(saat);
    for (var j = n - 1; j > 0; j--) { var k = Math.floor(r() * (j + 1)); var t = a[j]; a[j] = a[k]; a[k] = t; }
    return a;
  }
  var LISTE = { wortart: WORTART, zusammen: ZUSAMMEN, perfekt: PERFEKT, subjekt: SAETZE, praedikat: SAETZE,
    vokal: VOKAL.concat(SCHREIB), ableiten: ABLEITEN, gross: GROSS };
  var ORDNUNG = {};
  REIHE.forEach(function (t) { ORDNUNG[t] = gemischt(LISTE[t].length, hash("dps:" + t)); });

  // Indizes der Liste fuer Thema t an Tag/Runde.
  function auswahl(t, tag, runde) {
    var n = EIN.jeRunde[t], len = LISTE[t].length, ord = ORDNUNG[t];
    var abschnitt = Math.max(0, tageSeit(EIN.ab, tag)) * EIN.rundenJeTag + (runde || 0);
    var raus = [];
    for (var j = 0; j < n; j++) raus.push(ord[(abschnitt * n + j) % len]);
    return raus;
  }

  /* ---------- Aufgabe bauen ----------
     Jede Aufgabe: { id, thema, art: "wahl"|"woerter"|"text", frage, satz?, woerter?, optionen?, loesung,
                     anzeige (richtige Antwort als Text), hilfe: [Stufe1, Stufe2] } */
  function markiert(satz) {
    var m = satz.match(/^(.*)\*(.+?)\*(.*)$/);
    return m ? { vor: m[1], wort: m[2], nach: m[3] } : { vor: satz, wort: "", nach: "" };
  }
  function woerterVon(satz) { return satz.replace(/[.!?]$/, "").split(" "); }

  function bauen(t, i) {
    var x = LISTE[t][i], id = t + ":" + i;
    if (t === "wortart") {
      var m = markiert(x[0]);
      return { id: id, thema: t, art: "wahl", frage: "Welche Wortart ist das markierte Wort?", satzTeile: m,
        optionen: ["Nomen", "Verb", "Adjektiv"], loesung: WORTART_NAME[x[1]], anzeige: m.wort + " ist ein " + WORTART_NAME[x[1]] + ".",
        hilfe: [
          "Probier drei Proben: Passt der, die oder das davor (Nomen)? Sagt es, was jemand tut (Verb)? Sagt es, wie etwas ist (Adjektiv)?",
          x[1] === "N" ? "Probier: der, die oder das " + m.wort + ". Passt ein Begleiter, ist es ein Nomen." :
          x[1] === "V" ? "Probier: ich …, du …, wir … Das Wort verändert sich mit der Person. So ist es ein Verb." :
                         "Probier: sehr " + m.wort + ". Passt „sehr“ davor, ist es ein Adjektiv."
        ] };
    }
    if (t === "zusammen") {
      return { id: id, thema: t, art: "wahl", frage: "Aus welchen Wortarten ist das Wort zusammengesetzt?",
        wortGross: x[0], teile: x[1] + " + " + x[2],
        optionen: ["Nomen + Nomen", "Verb + Nomen", "Adjektiv + Nomen"], loesung: ZUSAMMEN_NAME[x[3]],
        anzeige: x[0] + " = " + x[1] + " + " + x[2] + " (" + ZUSAMMEN_NAME[x[3]] + ")",
        hilfe: [
          "Schau dir den ersten Teil an: „" + x[1] + "“. Der zweite Teil ist immer ein Nomen.",
          x[3] === "NN" ? "Kannst du „der, die oder das " + x[1] + "“ sagen? Dann ist der erste Teil ein Nomen." :
          x[3] === "VN" ? "„" + x[1] + "“ ist die Grundform. Probier: ich …, wir " + x[1] + ". Was jemand tut, ist ein Verb." :
                          "Probier: „sehr " + x[1] + "“. Wie etwas ist, sagt ein Adjektiv."
        ] };
    }
    if (t === "perfekt") {
      var person = x[0].split(" ")[0], hv = HILFS[person], sein = /^(ist|bin|bist|sind)\b/.test(x[1]);
      var partizip = x[1].split(" ").slice(1).join(" ");
      return { id: id, thema: t, art: "text", frage: "Schreib im Perfekt.", vorgabe: x[0], person: person,
        loesung: x[1], falsch: x[3], anzeige: x[0] + " → " + person + " " + x[1],
        hilfe: [
          "Das Perfekt hat zwei Teile: " + hv[0] + " oder " + hv[1] + " – und ein Wort mit ge-, zum Beispiel „gespielt“.",
          (sein ? "Bei „" + x[2] + "“ nimmst du „" + hv[1] + "“." : "Bei „" + x[2] + "“ nimmst du „" + hv[0] + "“.") +
            " Das zweite Wort beginnt mit „" + partizip.slice(0, 3) + "…“."
        ] };
    }
    if (t === "subjekt" || t === "praedikat") {
      var w = woerterVon(x[0]);
      var sub = x[1].map(function (k) { return w[k]; }).join(" "), pr = w[x[2]];
      // "Wer oder was backt einen Kuchen?" - Praedikat und was danach kommt, ohne das Subjekt
      var frageRest = w.filter(function (wort, k) { return k > x[2] && x[1].indexOf(k) < 0; }).join(" ");
      var werWas = "Wer oder was " + pr + (frageRest ? " " + frageRest : "") + "?";
      if (t === "subjekt") return { id: id, thema: t, art: "woerter", frage: "Tippe das Subjekt an (alle Wörter, die dazugehören).",
        woerter: w, punkt: x[0].slice(-1), loesung: x[1].slice(), anzeige: "Subjekt: " + sub,
        hilfe: ["Frag: " + werWas, "Die Antwort auf „" + werWas + "“ ist " + x[1].length +
          (x[1].length === 1 ? " Wort" : " Wörter") + " lang."] };
      return { id: id, thema: t, art: "woerter", frage: "Tippe das Prädikat an.", woerter: w, punkt: x[0].slice(-1),
        loesung: [x[2]], anzeige: "Prädikat: " + pr,
        hilfe: ["Das Prädikat ist das Verb. Es sagt, was jemand tut oder was passiert.",
          "Frag: Was tut das Subjekt, was passiert? Im Aussagesatz steht das Prädikat an zweiter Stelle."] };
    }
    if (t === "vokal") {
      if (i < VOKAL.length) {
        var v = x, teil = v[0].substr(v[1], v[2]);
        return { id: id, thema: t, art: "wahl", frage: "Wird der markierte Vokal lang oder kurz gesprochen?",
          wortTeile: { vor: v[0].slice(0, v[1]), wort: teil, nach: v[0].slice(v[1] + v[2]) },
          optionen: ["lang", "kurz"], loesung: v[3] ? "lang" : "kurz", anzeige: v[0] + ": " + (v[3] ? "lang" : "kurz"),
          hilfe: ["Sprich das Wort langsam und klatsche dabei. Ziehst du den Vokal in die Länge?",
            v[3] ? "Achte auf das, was nach dem Vokal kommt: ein Mitlaut, ein h oder ein zweiter Vokal." :
                   "Achte auf das, was nach dem Vokal kommt: zwei Mitlaute, ck oder tz."] };
      }
      var s = SCHREIB[i - VOKAL.length], links = hash(s[0]) % 2 === 0;
      return { id: id, thema: t, art: "wahl", frage: "Welches Wort ist richtig geschrieben?",
        optionen: links ? [s[0], s[1]] : [s[1], s[0]], loesung: s[0], anzeige: "Richtig: " + s[0],
        hilfe: ["Sprich das Wort deutlich: Ist der Vokal vorne kurz oder lang?",
          s[2] === "ck" ? "Nach einem kurzen Vokal schreibt man ck statt k." :
          s[2] === "tz" ? "Nach einem kurzen Vokal schreibt man tz statt z." :
                          "Nach einem kurzen Vokal folgen zwei gleiche Mitlaute."] };
    }
    if (t === "ableiten") {
      var paar = x[2] === "e" ? ["e", "ä"] : ["eu", "äu"], richtig = x[0].replace("_", x[1]);
      return { id: id, thema: t, art: "wahl", frage: "Welcher Buchstabe fehlt?", luecke: x[0],
        optionen: paar, loesung: x[1], anzeige: "Richtig: " + richtig,
        hilfe: ["Such ein verwandtes Wort mit " + (x[2] === "e" ? "a" : "au") + ". Gibt es eins, schreibst du " + paar[1] + ".",
          x[3] ? "Denk an: " + x[3] + "." : "Ein verwandtes Wort mit " + (x[2] === "e" ? "a" : "au") + " gibt es hier nicht."] };
    }
    if (t === "gross") {
      var mm = x[0].match(/^(.*)\{(.+?)\}(.*)$/), klein = mm[2], gross = klein.charAt(0).toUpperCase() + klein.slice(1);
      return { id: id, thema: t, art: "wahl", frage: "Wie schreibt man das markierte Wort?",
        satzTeile: { vor: mm[1], wort: "?", nach: mm[3] },
        optionen: [gross, klein], loesung: x[1], anzeige: mm[1] + x[1] + mm[3],
        hilfe: [
          "Ist es ein Nomen, oder macht ein Begleiter davor es zum Nomen (beim Schwimmen, die Großen)? Dann groß. Gehört es zu einem Nomen dahinter, bleibt es klein.",
          x[3] === "g" ? "Schau auf das Wort davor: „" + mm[1].trim().split(" ").pop() + "“ ist ein Begleiter. Aus dem Wort wird so ein Nomen." :
          x[3] === "n" ? "Kannst du der, die oder das davorsetzen? Dann ist es ein Nomen." :
                         (/^\s*[A-ZÄÖÜ]/.test(mm[3]) ? "Das Wort gehört zu dem Nomen dahinter. Das Nomen schreibt man groß, das Wort davor nicht." :
                                                       "Es ist kein Nomen, und kein Begleiter gehört zu ihm.")
        ] };
    }
    return null;
  }

  /* ---------- Runde ---------- */
  // Mischt die Themen: nie zweimal hintereinander dasselbe Thema, wenn es anders geht.
  function runde(tag, nr) {
    tag = tag || heuteIso(); nr = nr || 0;
    var stapel = {};
    REIHE.forEach(function (t) { stapel[t] = auswahl(t, tag, nr).map(function (i) { return bauen(t, i); }); });
    // subjekt und praedikat ziehen aus denselben Saetzen: nie derselbe Satz zweimal in einer Runde
    if (stapel.subjekt[0] && stapel.praedikat[0] && stapel.subjekt[0].id.split(":")[1] === stapel.praedikat[0].id.split(":")[1]) {
      var alt = (+stapel.praedikat[0].id.split(":")[1] + 1) % SAETZE.length;
      stapel.praedikat[0] = bauen("praedikat", alt);
    }
    var r = zufall(hash("runde:" + tag + ":" + nr)), liste = [], letztes = "";
    var rest = function () { return REIHE.filter(function (t) { return stapel[t].length; }); };
    while (rest().length) {
      var moeglich = rest().filter(function (t) { return t !== letztes; });
      if (!moeglich.length) moeglich = rest();
      // groesster Stapel zuerst bevorzugt, damit am Ende nicht nur ein Thema uebrig bleibt
      var max = Math.max.apply(null, moeglich.map(function (t) { return stapel[t].length; }));
      var kandidaten = moeglich.filter(function (t) { return stapel[t].length >= max - 1; });
      var t = kandidaten[Math.floor(r() * kandidaten.length)];
      liste.push(stapel[t].shift()); letztes = t;
    }
    return liste;
  }

  /* ---------- Pruefen ---------- */
  function norm(s) { return String(s == null ? "" : s).replace(/\s+/g, " ").replace(/[.!]+$/, "").trim(); }
  // Perfekt: Pronomen davor darf stehen ("er ist gegangen"). Gross/klein egal (iPad schreibt gross an).
  function perfektRoh(a, eingabe) {
    var e = norm(eingabe).toLowerCase(), p = a.person.toLowerCase() + " ";
    if (e.indexOf(p) === 0) e = e.slice(p.length);
    return e;
  }
  /* Ergebnis: { stimmt, fast, grund }. fast = richtig gewertet, aber Schreibweise zeigen (Kapitel 130).
     Tol = window.LWToleranz bzw. require("../toleranz.js"). */
  function pruefen(a, eingabe, Tol) {
    if (a.art === "wahl") return { stimmt: eingabe === a.loesung, fast: false };
    if (a.art === "woerter") {
      var g = (eingabe || []).slice().sort(function (x, y) { return x - y; }).join(","), s = a.loesung.slice().sort(function (x, y) { return x - y; }).join(",");
      return { stimmt: g === s, fast: false, teil: g !== s && (eingabe || []).some(function (k) { return a.loesung.indexOf(k) >= 0; }) };
    }
    var roh = perfektRoh(a, eingabe);
    if (!roh) return { stimmt: false, leer: true };
    if (roh === a.loesung) return { stimmt: true, fast: false };
    var hv = roh.split(" ")[0], sollHv = a.loesung.split(" ")[0];
    if (Tol && Tol.pruefen) {
      var e = Tol.pruefen(roh, a.loesung, { sprache: "de", trennen: "keine", verboten: a.falsch });
      // Das Hilfsverb muss stimmen: haben/sein ist der Lernpunkt, kein Tippfehler.
      if ((e.stufe === "gut" || e.stufe === "fast") && hv === sollHv) return { stimmt: true, fast: e.stufe === "fast" || roh !== a.loesung };
    }
    return { stimmt: false, fast: false, hilfsverb: hv !== sollHv && roh.split(" ").slice(1).join(" ") === a.loesung.split(" ").slice(1).join(" ") };
  }

  /* Hilfe nach dem n-ten Fehlversuch (1, 2, 3+). Ab dem 3. die Loesung. Erkennbare Denkfehler zuerst. */
  function hilfe(a, versuch, erg) {
    if (versuch >= 3) return { stufe: 3, text: "So ist es richtig: " + a.anzeige };
    if (erg && erg.hilfsverb) return { stufe: versuch, text: "Das Wort mit ge- stimmt. Schau noch mal auf das erste Wort: haben oder sein?" };
    if (erg && erg.teil && a.thema === "subjekt") return { stufe: versuch, text: "Ein Teil stimmt schon. " + a.hilfe[versuch - 1] };
    return { stufe: versuch, text: a.hilfe[versuch - 1] };
  }

  // Alles, was Paul zu lesen bekommt (fuer die Pruefung auf w-e-i-l).
  function texte(a) {
    var t = [a.frage, a.anzeige].concat(a.hilfe, a.optionen || []);
    if (a.satzTeile) t.push(a.satzTeile.vor + a.satzTeile.wort + a.satzTeile.nach);
    if (a.woerter) t.push(a.woerter.join(" "));
    if (a.vorgabe) t.push(a.vorgabe);
    return t.join(" | ");
  }

  var DPSMotor = { EIN: EIN, THEMA: THEMA, REIHE: REIHE, LISTE: LISTE, WORTART: WORTART, ZUSAMMEN: ZUSAMMEN, PERFEKT: PERFEKT,
    SAETZE: SAETZE, VOKAL: VOKAL, SCHREIB: SCHREIB, ABLEITEN: ABLEITEN, GROSS: GROSS, HILFS: HILFS, MIT_SEIN: MIT_SEIN, VERBOTEN: VERBOTEN,
    heuteIso: heuteIso, aktiv: aktiv, tageSeit: tageSeit, auswahl: auswahl, bauen: bauen, runde: runde, pruefen: pruefen,
    hilfe: hilfe, texte: texte, perfektRoh: perfektRoh };
  if (typeof module !== "undefined" && module.exports) module.exports = DPSMotor;
  else wurzel.DPSMotor = DPSMotor;
})(typeof window !== "undefined" ? window : this);
