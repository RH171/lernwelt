/* Teil II des Jahrgangsstufentests Englisch 7: "Der folgende Text enthält
   Fehler, die alle unterstrichen sind. Schreibe deine Verbesserung in die
   rechte Spalte, ohne die Aussage des Textes zu verändern."

   Gebaut am 30.09.2026 aus Helenas Meldung hup7ep8mdp. Sie hatte am selben
   Tag den Text von 2023 ausgefüllt und danach zweimal darum gebeten:
   "Soll ich dir einen kurzen Text mit versteckten Fehlern schreiben, den du
   verbessern kannst?" - "Ja". Und der Satz, der den Bau bestimmt hat:
   "Ja, aber ich hab sie ja nur verbessert, weil du es gesagt hast."
   Hier sagt niemand, WAS falsch ist. Der Fehler ist markiert, das Finden der
   Verbesserung bleibt bei ihr - genau wie im Test.

   UEBEN, NICHT LOESEN: Kein Satz, kein Name und kein Item aus den echten
   Tests 2022-2025. Verboten sind damit Doughnuts/Sunny Beatson/Tasmanien
   (2023 - genau ihr Blatt von heute), Koala-Maedchen (2022), Harvey
   Sutton/Appalachian Trail (2024), digital detox/Cathy (2025). Geprueft wird
   das mechanisch in pruefe-fehlertexte.mjs gegen eine Sperrliste.

   WIE GEWERTET WIRD - das steht in den amtlichen Korrekturhinweisen des ISB
   und ist in allen vier Jahrgaengen wortgleich (gelesen 30.09.2026):
   - "Fuer jede richtige Loesung wird 1 BE vergeben."
   - "Rechtschreibfehler werden geahndet."  -> HIER GILT KEINE TOLERANZ.
     Das ist der Unterschied zu Teil I (Hoerverstehen), wo es ausdruecklich
     heisst "sofern sie nicht sinnentstellend sind, generell nicht gewertet".
     Wer hier Toleranz einbaut, uebt am Test vorbei.
   - "Die fehlerhafte Kleinschreibung am Satzanfang muss markiert, darf aber
     nicht durch BE-Abzug geahndet werden."
     Daraus folgt die Regel dieser Seite: Der ERSTE Buchstabe entscheidet nur
     dort, wo die Grossschreibung selbst der Pruefgegenstand ist - dann traegt
     das Item gross: true (Nationalitaeten). Sonst ist gross oder klein egal;
     alles andere wird Zeichen fuer Zeichen verglichen.

   DIE FEHLERTYPEN SIND AUSGEZAEHLT, nicht ausgedacht. Alle 80 Items der
   Jahrgaenge 2022-2025 aus den Loesungs-PDFs (Spalte "Focus on"), Haeufigkeit:
   L1 interference 11x, Vergleichen und Steigern 9x, unregelmaessiges simple
   past 7x, Konjunktionen 6x, Kollokation/Praeposition 6x, present perfect
   gegen simple past 5x, Genitiv 5x, Frage und Verneinung im past 5x,
   quantifier much/many 5x, Homophone 3x, unregelmaessiger Plural 3x,
   Relativpronomen 3x, modal substitutes 3x, Grossschreibung 2x.
   Die drei Texte hier folgen dieser Verteilung.

   Die richtige Loesung steht in ok[] - ALLE Varianten, die das ISB zulaesst
   (dort stehen sie als "chose / (decided)" oder "which / that").
*/

window.BET_FEHLERTEXTE = [

{ k: "radio", titel: "The school radio", ic: "🎙",
  unter: "10 Fehler – Zeiten, Vergleiche, Genitiv",
  /* [[n]] markiert die unterstrichene Stelle n. */
  text:
"Last year our school started a radio show, and I am in it from the beginning.\n" +
"For my birthday I [[1]] a real microphone, so Mrs Lane asked me to join.\n" +
"On the first afternoon we [[2]] our very first show together in the music room.\n" +
"It sounded terrible. At first we [[3]] what to say, and we all talked at once.\n" +
"Maya reads the news, and she is [[4]] me before every show, which always\n" +
"surprises me. The [[5]] part is the interview at the end. Last week we\n" +
"recorded it in the [[6]] room, because it is the only quiet place in the\n" +
"building. We [[7]] the show every Friday since March.\n" +
"Maya is now the girl [[8]] voice everybody in school knows, and\n" +
"[[9]] listeners write to us. Even the teachers are interested [[10]] our music.",
  items: [
    { nr:1, falsch:"became", ok:["got","was given","received"],
      fokus:"typisch deutscher Fehler (L1 interference): bekommen ≠ become",
      stufe1:"Ein deutsches Wort und ein englisches klingen hier fast gleich – aber sie bedeuten nicht dasselbe.",
      stufe2:"Auf Englisch heißt das Wort, das hier steht, „werden“. Gesucht ist das Wort für „etwas geschenkt bekommen“ – die einfache Vergangenheit davon." },
    { nr:2, falsch:"writed", ok:["wrote"],
      fokus:"unregelmäßige Form des simple past",
      stufe1:"Die Zeit ist richtig, die Form nicht. Dieses Verb hängt kein -ed an.",
      stufe2:"Manche Verben ändern in der Vergangenheit ihren Vokal: sing – sang, drink – drank. Hier ist es genauso." },
    { nr:3, falsch:"didn't knew", ok:["didn't know","did not know"],
      fokus:"Verneinung im simple past",
      stufe1:"Zwei Wörter zeigen hier gleichzeitig die Vergangenheit an. Eines davon reicht.",
      stufe2:"Nach didn’t steht immer die Grundform. Die Vergangenheit steckt schon in didn’t." },
    { nr:4, falsch:"as nervous like", ok:["as nervous as"],
      fokus:"Vergleich mit as … as",
      stufe1:"Es sollen zwei Personen gleich nervös sein. Für „gleich“ gibt es im Englischen eine feste Klammer.",
      stufe2:"Bei Gleichheit steht vorne und hinten dasselbe kleine Wort. Bei Unterschied nimmt man -er und than." },
    { nr:5, falsch:"interestingest", ok:["most interesting"],
      fokus:"Superlativ langer Adjektive",
      stufe1:"Das Adjektiv ist zu lang für eine Endung.",
      stufe2:"Kurze Adjektive steigert man mit -est (fastest). Lange bekommen ein Wort davor gestellt, wie bei „am schönsten“ → the … beautiful." },
    { nr:6, falsch:"teachers", ok:["teachers'","teachers’"],
      fokus:"Genitiv im Plural",
      stufe1:"Der Raum gehört mehreren Personen. Am Wort fehlt ein Zeichen.",
      stufe2:"Ein Besitz wird mit einem Häkchen angezeigt. Beim Plural, der schon auf -s endet, kommt es hinter das s." },
    { nr:7, falsch:"do", ok:["have done","have been doing"],
      fokus:"present perfect mit since",
      stufe1:"Achte auf since March. Die Sendung läuft seit damals – und immer noch.",
      stufe2:"Für „seit“ nimmt das Englische die vollendete Form – zwei Teile: ein Hilfsverb und die dritte Form des Verbs. Vergleiche: I … lived here since 2020." },
    { nr:8, falsch:"who's", ok:["whose"],
      fokus:"Relativpronomen whose",
      stufe1:"Es geht um die Stimme, die ihr gehört. Gesucht ist ein Besitz-Wort, keine Kurzform.",
      stufe2:"who’s ist die Kurzform von who is. Für „dessen“ oder „deren“ gibt es ein eigenes Wort – es klingt gleich, wird aber anders geschrieben." },
    { nr:9, falsch:"much", ok:["many","a lot of","lots of"],
      fokus:"quantifier much gegen many",
      stufe1:"Zuhörer kann man zählen.",
      stufe2:"much steht nur bei Dingen, die man nicht zählt (much water). Bei zählbaren Dingen nimmt man ein anderes Wort." },
    { nr:10, falsch:"at", ok:["in"],
      fokus:"feste Verbindung: to be interested in sth.",
      stufe1:"Das Verb braucht ein bestimmtes kleines Wort hinter sich – das muss man einfach wissen.",
      stufe2:"Im Deutschen heißt es „interessiert an“, im Englischen steht ein anderes Wörtchen. Es ist dasselbe wie in „in the room“." }
  ]
},

{ k: "voegel", titel: "Tom and the rare bird", ic: "🦉",
  unter: "10 Fehler – Fragen, Modalverben, Plural",
  text:
"Tom is eleven and he belongs to a bird club in Norwich. Last month a\n" +
"[[1]] bird expert came to their meeting and showed them photos of an owl\n" +
"that nobody in the club had ever seen. Tom [[2]] his camera to every walk\n" +
"after that. And [[3]] the owl? Not for a long time.\n" +
"Last winter he [[4]] at home for three weeks with a broken leg, and he says\n" +
"those weeks were the worst of his life. He kept reading about owls [[5]]\n" +
"he could not go outside. Three [[6]] from the club sent him bird books.\n" +
"Then, in April, he heard it. He took [[7]] photos that evening, and the next\n" +
"morning he was so [[8]] that he forgot his breakfast. Last year he\n" +
"[[9]] the club prize for the best photo, and this year he won it again.\n" +
"[[10]] more owls in that forest than anybody thought.",
  items: [
    { nr:1, falsch:"british", ok:["British"], gross:true,
      fokus:"Großschreibung von Nationalitäten",
      stufe1:"Am Wort selbst ist nichts falsch. Schau auf den ersten Buchstaben.",
      stufe2:"Länder, Sprachen und Nationalitäten schreibt man im Englischen immer groß – anders als im Deutschen bei „britisch“." },
    { nr:2, falsch:"bringed", ok:["brought","took"],
      fokus:"unregelmäßige Form des simple past",
      stufe1:"Die Zeit stimmt, die Form nicht. Dieses Verb bildet die Vergangenheit nicht mit -ed.",
      stufe2:"Die Vergangenheit dieses Verbs endet auf -ought, wie bei think – thought." },
    { nr:3, falsch:"found he", ok:["did he find"],
      fokus:"Frage im simple past mit Hilfsverb did",
      stufe1:"Es ist eine Frage in der Vergangenheit. Im Englischen braucht sie ein Hilfswort.",
      stufe2:"Die Frage baut man mit did + Grundform: Did you see …? Die Vergangenheit steckt dann im Hilfswort, nicht im Verb." },
    { nr:4, falsch:"musted stay", ok:["had to stay"],
      fokus:"Ersatzform für must in der Vergangenheit",
      stufe1:"must hat keine Vergangenheitsform. Es braucht einen Ersatz.",
      stufe2:"Für „musste“ nimmt man eine Form von have – dahinter kommt to und die Grundform." },
    { nr:5, falsch:"because", ok:["although","even though","though"],
      fokus:"Konjunktion: Gegensatz statt Grund",
      stufe1:"Lies beide Satzteile. Ist das zweite der Grund für das erste – oder das Gegenteil?",
      stufe2:"Er liest weiter, OBWOHL er nicht raus kann. Für diesen Gegensatz gibt es ein eigenes Wort, nicht das für „weil“." },
    { nr:6, falsch:"womans", ok:["women"],
      fokus:"unregelmäßiger Plural",
      stufe1:"Die Mehrzahl dieses Wortes entsteht nicht durch ein angehängtes -s.",
      stufe2:"Bei diesem Wort ändert sich ein Vokal in der Mitte, so wie bei man – men." },
    { nr:7, falsch:"a lots of", ok:["a lot of","lots of","many"],
      fokus:"quantifier a lot of / lots of",
      stufe1:"Zwei richtige Möglichkeiten sind hier vermischt worden. Nimm eine davon.",
      stufe2:"Zwei richtige Wendungen sind hier ineinandergeschoben. Eine trägt die Mehrzahl-Endung, die andere den Artikel davor – beides gleichzeitig gibt es nicht." },
    { nr:8, falsch:"exciting", ok:["excited"],
      fokus:"Adjektiv auf -ed gegen Adjektiv auf -ing",
      stufe1:"Die Endung entscheidet, ob eine Person etwas fühlt oder ob eine Sache etwas auslöst.",
      stufe2:"Ein Film ist exciting, ein Mensch ist … – es geht um Tom und sein Gefühl." },
    { nr:9, falsch:"has won", ok:["won"],
      fokus:"simple past gegen present perfect",
      stufe1:"Achte auf Last year. Der Zeitpunkt ist abgeschlossen.",
      stufe2:"Steht eine abgeschlossene Zeitangabe im Satz (yesterday, last year), nimmt man die einfache Vergangenheit – nicht die Form mit has." },
    { nr:10, falsch:"It gives", ok:["There are"],
      fokus:"typisch deutscher Fehler (L1 interference): es gibt",
      stufe1:"Das deutsche „es gibt“ wird hier Wort für Wort übersetzt. So sagt man es auf Englisch nicht.",
      stufe2:"Für „es gibt“ nimmt das Englische eine ganz andere Wendung – sie beginnt mit dem Wort für „dort“. Es sind mehrere Eulen, also Plural." }
  ]
},

{ k: "garten", titel: "Our school garden", ic: "🌱",
  unter: "10 Fehler – Genitiv, Steigern, present perfect",
  text:
"Behind the sports hall there is a small piece of land, and our garden is over\n" +
"[[1]]. Mr Kent had the idea, and [[2]] we have grown vegetables there.\n" +
"Every class gets one bed. Last spring my friend Nadia got a watering can on her\n" +
"[[3]] birthday and she has used it in the garden ever since. In May we\n" +
"[[4]] water from the changing rooms in buckets, because the tap outside\n" +
"was broken. Small plants [[5]] without water, we learned that the hard way.\n" +
"My tomatoes grew much better [[6]] Leo's, and I still don't know why.\n" +
"I go there on my [[7]] bike, so I can be in the garden before the bell rings.\n" +
"The beans [[8]] yet, but Mr Kent says that is normal in a cold spring.\n" +
"Leo [[9]] the plants every morning before school. Right now we are\n" +
"[[10]] a sunnier place for the beans.",
  items: [
    { nr:1, falsch:"their", ok:["there"],
      fokus:"Homophone: there – their – they’re",
      stufe1:"Drei Wörter klingen gleich. Hier ist ein Ort gemeint, kein Besitz.",
      stufe2:"Hier steht das Wort für Besitz (ihr Garten). Gemeint ist der Ort. Das Ortswort klingt gleich und unterscheidet sich nur in zwei Buchstaben – es steckt in der Wendung, mit der dieser Text anfängt." },
    { nr:2, falsch:"since two years", ok:["for two years"],
      fokus:"typisch deutscher Fehler (L1 interference): seit + Zeitdauer",
      stufe1:"Das deutsche „seit“ gibt es auf Englisch zweimal – je nachdem, ob ein Zeitpunkt oder eine Dauer folgt.",
      stufe2:"Bei einem Zeitpunkt (since 2020, since March) steht das Wort, das hier steht. Bei einer Dauer (… two years) braucht es ein anderes – dasselbe wie in for a week." },
    { nr:3, falsch:"twelve", ok:["twelfth"],
      fokus:"Ordnungszahl statt Grundzahl",
      stufe1:"Es ist nicht die Anzahl der Geburtstage, sondern welcher es war.",
      stufe2:"Für „der zwölfte“ hängt man eine Endung an, wie bei four – fourth. Bei dieser Zahl ändert sich zusätzlich der letzte Buchstabe." },
    { nr:4, falsch:"bringed", ok:["brought","carried"],
      fokus:"unregelmäßige Form des simple past",
      stufe1:"Die Zeit stimmt. Das Verb hängt in der Vergangenheit kein -ed an.",
      stufe2:"Die Vergangenheit dieses Verbs endet auf -ought, wie bei buy – bought." },
    { nr:5, falsch:"can not to grow", ok:["cannot grow","can't grow","can not grow"],
      fokus:"Grundform nach Modalverb",
      stufe1:"Nach can steht das Verb immer ohne Zusatz.",
      stufe2:"Modalverben (can, must, will) nehmen die nackte Grundform – das kleine Wort davor muss weg." },
    { nr:6, falsch:"as", ok:["than"],
      fokus:"Vergleich mit … than",
      stufe1:"Meine Tomaten waren besser, nicht gleich gut. Das ist ein Unterschied.",
      stufe2:"Bei Gleichheit nimmt man as … as. Bei einem Unterschied steht nach der Steigerungsform ein anderes Wort." },
    { nr:7, falsch:"sisters", ok:["sister's","sister’s"],
      fokus:"Genitiv im Singular",
      stufe1:"Das Fahrrad gehört einer Schwester. Am Wort fehlt ein Zeichen.",
      stufe2:"Bei einer Person kommt das Häkchen vor das s: my friend’s bike." },
    { nr:8, falsch:"didn't grow", ok:["haven't grown","have not grown"],
      fokus:"present perfect mit dem Signalwort yet",
      stufe1:"Achte auf yet am Ende. Es ist noch nicht vorbei – sie können noch wachsen.",
      stufe2:"yet und already stehen nie mit der einfachen Vergangenheit. Sie verlangen die vollendete Form – hier verneint, mit der dritten Form des Verbs." },
    { nr:9, falsch:"water", ok:["waters"],
      fokus:"simple present, 3. Person Singular",
      stufe1:"Es ist eine Gewohnheit, jeden Morgen. Und es ist eine einzige Person.",
      stufe2:"Bei he, she und it hängt man im simple present ein -s an das Verb." },
    { nr:10, falsch:"looking after", ok:["looking for"],
      fokus:"phrasal verb: look for / look after / look at",
      stufe1:"Wir suchen einen Platz – wir passen nicht auf ihn auf.",
      stufe2:"look after heißt „sich kümmern um“, look at heißt „anschauen“. Für „suchen“ braucht es ein drittes kleines Wort." }
  ]
}

];

/* Die amtliche Umrechnungstabelle. Sie steht wortgleich in allen vier
   Loesungs-PDFs (2022-2025) unter "Allgemeine Korrekturhinweise", und sie ist
   der Grund, warum diese Datei ueberhaupt so heisst: Helena hat am 30.09.2026
   DREIMAL nach ihrer Note gefragt, und die Sofortantwort hat dreimal
   geantwortet, sie kenne die Umrechnung nicht. Sie stand die ganze Zeit in
   einem PDF, das auf Helenas eigener BET-Seite verlinkt ist.
   Gelesen 30.09.2026 aus JT_2024_E7_Loesungen.pdf, Seite 5. */
window.BET_NOTEN = [
  { ab:52.5, note:1 },
  { ab:45,   note:2 },
  { ab:37.5, note:3 },
  { ab:30,   note:4 },
  { ab:20,   note:5 },
  { ab:0,    note:6 }
];

/* Wird das Hoerverstehen nicht bewertet (Nachteilsausgleich), gilt eine
   eigene Tabelle auf 40 BE. Sie steht hier vollstaendig, damit niemand sie
   aus der 60er-Tabelle hochrechnet - das waere falsch. */
window.BET_NOTEN_40 = [
  { ab:35,   note:1 },
  { ab:30,   note:2 },
  { ab:25,   note:3 },
  { ab:20,   note:4 },
  { ab:13.5, note:5 },
  { ab:0,    note:6 }
];

window.BET_NOTE = function (be, max) {
  var t = max === 40 ? window.BET_NOTEN_40 : window.BET_NOTEN;
  for (var i = 0; i < t.length; i++) if (be >= t[i].ab) return t[i].note;
  return 6;
};

if (typeof module === "object" && module.exports)
  module.exports = { texte: window.BET_FEHLERTEXTE, noten: window.BET_NOTEN,
                     noten40: window.BET_NOTEN_40, note: window.BET_NOTE };
