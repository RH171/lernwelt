// Fragen fuer das Quiz-Duell (14.09.2026).
//
// Denny: "So gemischte Aufgaben (aber die gleichen), was auch 1.- bzw. jetzt
// 2.-Klaessler beantworten kann ... 5x3, 6+6, Was ist die Hauptstadt von
// Deutschland ... auch so lustige Fragen wie bei Toggo Radio, die Kinder
// interessieren und die Allgemeinbildung vorantreiben. Immer abwechselnd und
// spannend."
//
// Jede Frage: [ab Klasse, Kategorie, Bild, Frage, [RICHTIG, falsch, falsch, falsch], "Wusstest du?"]
// Die richtige Antwort steht IMMER zuerst - gemischt wird im Spielraum.
// Gestellt wird nur, was der JUENGSTE Mitspieler schaffen kann (Klasse <= seiner).
//
// Nur gesichertes Wissen. Wo Quellen streiten (laengster Fluss der Welt: Nil
// oder Amazonas? Wie viele Kontinente?), steht die Frage bewusst NICHT drin.
// Diese Datei wird vom Spielraum-Dienst (duell-worker) eingebunden; die
// Seite im Browser bekommt immer nur die aktuelle Frage.

export const KATEGORIEN = {
  tiere:    { name: "Tiere",          farbe: "#16a34a" },
  natur:    { name: "Natur & Weltall", farbe: "#0ea5e9" },
  welt:     { name: "Welt & Länder",  farbe: "#f97316" },
  sport:    { name: "Sport",          farbe: "#e11d48" },
  koerper:  { name: "Körper",         farbe: "#db2777" },
  kurios:   { name: "Kurios",         farbe: "#8b5cf6" },
  sprache:  { name: "Sprache",        farbe: "#ca8a04" },
  maerchen: { name: "Filme & Märchen", farbe: "#9333ea" },
  wissen:   { name: "Erfinder & Geschichte", farbe: "#0f766e" },
  rechnen:  { name: "Rechnen",        farbe: "#2563eb" },
  technik:  { name: "Technik & Verkehr", farbe: "#475569" },
  musik:    { name: "Musik & Kunst",  farbe: "#c026d3" },
  pflanzen: { name: "Pflanzen",       farbe: "#65a30d" }
};

import { KLEXIKON } from "./fragen-klexikon.js";

// Die Klexikon-Fragen (17.09.2026) haengen HINTEN an: Gesehene Fragen merkt sich
// das Duell ueber ihre Position ("f" + Index) - die alten behalten so ihre Nummer.
const EIGENE = [
  // ---------- Tiere ----------
  [1, "tiere", "🕷️", "Wie viele Beine hat eine Spinne?", ["8", "6", "10", "4"], "Insekten haben 6 Beine, Spinnen 8 – darum sind Spinnen keine Insekten."],
  [1, "tiere", "🐞", "Wie viele Beine hat ein Käfer?", ["6", "8", "4", "10"], "Alle Insekten haben 6 Beine: Käfer, Bienen, Ameisen, Schmetterlinge."],
  [1, "tiere", "🐘", "Welches Tier hat einen Rüssel?", ["Elefant", "Nashorn", "Nilpferd", "Löwe"], "Mit dem Rüssel kann ein Elefant riechen, trinken, greifen und sogar trompeten."],
  [1, "tiere", "🦒", "Welches Tier ist das höchste der Welt?", ["Giraffe", "Elefant", "Kamel", "Pferd"], "Eine Giraffe kann über 5 Meter hoch werden – so hoch wie zwei Stockwerke."],
  [1, "tiere", "🐧", "Welcher Vogel kann nicht fliegen?", ["Pinguin", "Adler", "Spatz", "Möwe"], "Pinguine fliegen dafür unter Wasser – mit ihren Flügeln schwimmen sie superschnell."],
  [1, "tiere", "🐼", "Was frisst ein Panda am liebsten?", ["Bambus", "Fisch", "Bananen", "Honig"], "Ein Panda frisst jeden Tag viele Kilo Bambus – er ist fast den ganzen Tag mit Essen beschäftigt."],
  [1, "tiere", "🐴", "Wie heißt ein Pferdebaby?", ["Fohlen", "Kalb", "Lamm", "Ferkel"], "Ein Fohlen kann schon kurz nach der Geburt stehen und laufen."],
  [1, "tiere", "🐄", "Wie heißt ein Kuhbaby?", ["Kalb", "Fohlen", "Küken", "Welpe"], "Ein Kalb trinkt am Anfang Milch bei seiner Mutter – genau wie ein Menschenbaby."],
  [1, "tiere", "🐔", "Welches Tier legt Eier?", ["Huhn", "Hund", "Katze", "Kuh"], "Ein Huhn kann fast jeden Tag ein Ei legen."],
  [1, "tiere", "🐻‍❄️", "Wo lebt der Eisbär?", ["am Nordpol", "am Südpol", "in der Wüste", "im Dschungel"], "Pinguine leben am Südpol, Eisbären am Nordpol – in der Natur treffen sie sich nie."],
  [1, "tiere", "🐓", "Welches Tier ruft „Kikeriki“?", ["Hahn", "Ente", "Gans", "Schaf"], "In England ruft der Hahn übrigens „Cock-a-doodle-doo“."],
  [1, "tiere", "🦩", "Welche Farbe hat ein Flamingo?", ["rosa", "blau", "grün", "schwarz"], "Flamingos werden rosa, weil sie kleine Krebse und Algen fressen. Küken sind noch grau."],
  [1, "tiere", "🐌", "Welches Tier trägt sein Haus auf dem Rücken?", ["Schnecke", "Igel", "Käfer", "Frosch"], "Das Schneckenhaus wächst mit der Schnecke mit."],
  [1, "tiere", "🦁", "Welches Tier nennt man den „König der Tiere“?", ["Löwe", "Tiger", "Bär", "Adler"], "Nur Löwenmännchen haben eine Mähne. Gejagt wird aber meistens von den Weibchen."],
  [1, "tiere", "🦇", "Welches Tier schläft mit dem Kopf nach unten?", ["Fledermaus", "Eule", "Katze", "Hase"], "Fledermäuse hängen sich mit den Füßen fest und schlafen kopfüber."],
  [1, "tiere", "🐙", "Wie viele Arme hat ein Oktopus?", ["8", "6", "10", "4"], "Okto heißt acht. Ein Oktopus hat außerdem drei Herzen!"],
  [1, "tiere", "🦓", "Welche Farben hat ein Zebra?", ["schwarz und weiß", "braun und gelb", "grau und rot", "blau und weiß"], "Kein Zebra hat das gleiche Streifenmuster wie ein anderes – wie ein Fingerabdruck."],
  [2, "tiere", "🐆", "Welches ist das schnellste Tier an Land?", ["Gepard", "Löwe", "Pferd", "Hase"], "Ein Gepard ist so schnell wie ein Auto auf der Landstraße – aber nur für ein paar Sekunden."],
  [2, "tiere", "🐋", "Welches ist das größte Tier der Welt?", ["Blauwal", "Elefant", "Weißer Hai", "Giraffe"], "Ein Blauwal ist so lang wie ein Schwimmbecken – und frisst winzige Krebse."],
  [2, "tiere", "🦎", "Welches Tier kann seine Farbe wechseln?", ["Chamäleon", "Frosch", "Schildkröte", "Krokodil"], "Das Chamäleon zeigt mit seiner Farbe auch, wie es sich gerade fühlt."],
  [2, "tiere", "🐪", "Wie viele Höcker hat ein Dromedar?", ["1", "2", "3", "0"], "Das Kamel hat zwei Höcker, das Dromedar einen. In den Höckern ist Fett, kein Wasser."],
  [2, "tiere", "🦫", "Welches Tier baut Dämme aus Holz im Fluss?", ["Biber", "Otter", "Maulwurf", "Fuchs"], "Biber fällen Bäume mit ihren Zähnen – und die Zähne wachsen ein Leben lang nach."],
  [2, "tiere", "🐴", "Welches Tier kann im Stehen schlafen?", ["Pferd", "Hund", "Katze", "Maus"], "Pferde dösen im Stehen. Für den Tiefschlaf legen sie sich aber hin."],
  [2, "tiere", "🐬", "Delfine sind …", ["Säugetiere", "Fische", "Vögel", "Insekten"], "Delfine atmen Luft und trinken als Babys Milch – wie wir."],
  [2, "tiere", "🦉", "Wann ist eine Eule meistens wach?", ["in der Nacht", "am Mittag", "am Morgen", "nie"], "Eulen können fast lautlos fliegen und in der Dunkelheit sehr gut hören."],
  [3, "tiere", "🐦", "Welcher Vogel kann rückwärts fliegen?", ["Kolibri", "Adler", "Spatz", "Taube"], "Kolibris schlagen so schnell mit den Flügeln, dass sie in der Luft stehen bleiben können."],
  [3, "tiere", "🐨", "Wie lange schläft ein Koala ungefähr am Tag?", ["20 Stunden", "5 Stunden", "10 Stunden", "1 Stunde"], "Koalas fressen Eukalyptusblätter – die geben wenig Kraft, darum schlafen sie so viel."],
  [3, "tiere", "🐙", "Wie viele Herzen hat ein Oktopus?", ["3", "1", "2", "8"], "Und sein Blut ist blau!"],
  [3, "tiere", "🐝", "Wie nennt man eine Gruppe von Bienen, die zusammen wohnen?", ["Volk", "Herde", "Rudel", "Schwarm aus Fischen"], "In einem Bienenvolk gibt es eine Königin und tausende Arbeiterinnen."],
  [4, "tiere", "🦈", "Wie oft wachsen einem Hai neue Zähne nach?", ["immer wieder, sein ganzes Leben", "nie", "genau einmal", "nur als Baby"], "Haie verlieren ständig Zähne – und es rückt immer ein neuer nach."],

  // ---------- Natur & Weltall ----------
  [1, "natur", "🌍", "Wie heißt unser Planet?", ["Erde", "Mars", "Mond", "Sonne"], "Die Erde ist der einzige Planet, auf dem man bisher Leben gefunden hat."],
  [1, "natur", "☀️", "Was scheint am Tag hell vom Himmel und wärmt uns?", ["die Sonne", "der Mond", "eine Sternschnuppe", "eine Wolke"], "Die Sonne ist ein riesiger Stern. Ihr Licht braucht etwa 8 Minuten bis zu uns."],
  [1, "natur", "🌈", "Wie viele Farben zählt man beim Regenbogen?", ["7", "3", "5", "10"], "Rot, Orange, Gelb, Grün, Blau, Indigo, Violett. Ein Regenbogen entsteht, wenn Sonne auf Regentropfen scheint."],
  [1, "natur", "🍂", "Wie viele Jahreszeiten gibt es?", ["4", "2", "6", "12"], "Frühling, Sommer, Herbst und Winter."],
  [1, "natur", "📅", "Wie viele Tage hat eine Woche?", ["7", "5", "10", "6"], "Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag."],
  [1, "natur", "🎨", "Welche Farbe entsteht aus Blau und Gelb?", ["Grün", "Lila", "Orange", "Braun"], "Probier es mit Wasserfarben aus!"],
  [1, "natur", "🎨", "Welche Farbe entsteht aus Rot und Gelb?", ["Orange", "Grün", "Lila", "Blau"], "Die Farbe hat denselben Namen wie eine Frucht."],
  [1, "natur", "🌱", "Was braucht eine Pflanze zum Wachsen?", ["Wasser und Licht", "Cola", "Dunkelheit", "Salz"], "Aus Licht, Wasser und Luft macht die Pflanze ihre eigene Nahrung."],
  [2, "natur", "🗓️", "Wie viele Monate hat ein Jahr?", ["12", "10", "7", "52"], "52 sind übrigens die Wochen in einem Jahr."],
  [2, "natur", "🎨", "Welche Farbe entsteht aus Rot und Blau?", ["Lila", "Grün", "Orange", "Gelb"], "Lila nennt man auch Violett."],
  [2, "natur", "🔴", "Welcher Planet wird der „Rote Planet“ genannt?", ["Mars", "Jupiter", "Venus", "Erde"], "Der Mars ist rot, weil sein Staub rostiges Eisen enthält."],
  [2, "natur", "⭐", "Was ist die Sonne?", ["ein Stern", "ein Planet", "ein Mond", "ein Komet"], "Nachts siehst du andere Sonnen – sie sind nur sehr weit weg und darum klein."],
  [2, "natur", "🌙", "Was macht der Mond?", ["Er kreist um die Erde", "Er leuchtet selbst", "Er kreist um den Mars", "Er steht still"], "Der Mond leuchtet nicht selbst – er wird von der Sonne angestrahlt."],
  [2, "natur", "⚡", "Warum sieht man den Blitz vor dem Donner?", ["Licht ist schneller als Schall", "Der Donner ist schüchtern", "Blitze sind näher", "Zufall"], "Zähl die Sekunden zwischen Blitz und Donner und teile durch 3 – so viele Kilometer ist das Gewitter weg."],
  [2, "natur", "🌡️", "Was misst ein Thermometer?", ["die Temperatur", "die Uhrzeit", "den Regen", "das Gewicht"], "Wasser gefriert bei 0 Grad und kocht bei 100 Grad."],
  [2, "natur", "🧭", "Was zeigt ein Kompass an?", ["die Himmelsrichtung", "die Uhrzeit", "die Temperatur", "das Wetter"], "Die Nadel zeigt immer nach Norden."],
  [3, "natur", "🪐", "Welcher Planet ist der größte in unserem Sonnensystem?", ["Jupiter", "Erde", "Mars", "Venus"], "In den Jupiter würde die Erde über 1000-mal hineinpassen."],
  [3, "natur", "🪐", "Wie viele Planeten hat unser Sonnensystem?", ["8", "9", "7", "12"], "Früher zählte Pluto mit – seit 2006 gilt er als Zwergplanet."],
  [3, "natur", "🧊", "Bei wie viel Grad gefriert Wasser?", ["0 Grad", "10 Grad", "100 Grad", "-50 Grad"], "Eis ist leichter als Wasser – darum schwimmt es oben."],
  [4, "natur", "💎", "Wie heißt das härteste natürliche Material?", ["Diamant", "Gold", "Eisen", "Granit"], "Diamanten bestehen aus reinem Kohlenstoff – wie Bleistiftminen, nur ganz anders angeordnet."],
  [5, "natur", "💧", "Wofür steht H₂O?", ["Wasser", "Sauerstoff", "Salz", "Zucker"], "Zwei Wasserstoff-Teilchen und ein Sauerstoff-Teilchen ergeben Wasser."],
  [5, "natur", "🌡️", "Welches Metall ist bei Zimmertemperatur flüssig?", ["Quecksilber", "Eisen", "Kupfer", "Silber"], "Früher war Quecksilber in Fieberthermometern – heute nicht mehr, weil es giftig ist."],

  // ---------- Welt & Länder ----------
  [1, "welt", "🇩🇪", "Was ist die Hauptstadt von Deutschland?", ["Berlin", "München", "Hamburg", "Fürth"], "In Berlin wohnen über 3 Millionen Menschen – so viele wie in keiner anderen deutschen Stadt."],
  [1, "welt", "🇩🇪", "Welche Farben hat die deutsche Flagge?", ["Schwarz, Rot, Gold", "Rot, Weiß, Blau", "Grün, Weiß, Rot", "Blau, Gelb"], "Die Farben Schwarz, Rot, Gold gibt es als Flagge schon seit fast 200 Jahren."],
  [2, "welt", "🏔️", "In welchem Bundesland liegt Fürth?", ["Bayern", "Hessen", "Sachsen", "Berlin"], "Fürth liegt in Franken – das ist der nördliche Teil von Bayern."],
  [2, "welt", "🏙️", "Welche Großstadt liegt direkt neben Fürth?", ["Nürnberg", "Hamburg", "Köln", "Bremen"], "Zwischen Nürnberg und Fürth fuhr 1835 die allererste Eisenbahn Deutschlands."],
  [2, "welt", "🗼", "In welchem Land steht der Eiffelturm?", ["Frankreich", "Italien", "Spanien", "England"], "Der Eiffelturm in Paris ist über 300 Meter hoch und wurde vor mehr als 130 Jahren gebaut."],
  [2, "welt", "🇫🇷", "Was ist die Hauptstadt von Frankreich?", ["Paris", "Rom", "London", "Madrid"], "Helena lernt Französisch – in Paris kann sie es ausprobieren!"],
  [2, "welt", "🦅", "Welches Tier ist das Wappentier von Deutschland?", ["Adler", "Löwe", "Bär", "Hirsch"], "Den Bundesadler siehst du auf den deutschen 1- und 2-Euro-Münzen."],
  [2, "welt", "🥨", "Wie heißt die Hauptstadt von Bayern?", ["München", "Nürnberg", "Augsburg", "Würzburg"], "In München steht die Allianz Arena."],
  [2, "welt", "🚪", "In welcher Stadt steht das Brandenburger Tor?", ["Berlin", "Brandenburg", "Potsdam", "Hamburg"], "Oben auf dem Tor steht eine Figur mit einem Wagen und vier Pferden."],
  [2, "welt", "💶", "Mit welchem Geld bezahlt man in Deutschland?", ["Euro", "Dollar", "Franken", "Pfund"], "Den Euro gibt es als Bargeld seit 2002."],
  [2, "welt", "🇬🇧", "Was ist die Hauptstadt von England?", ["London", "Paris", "Dublin", "Berlin"], "In London fahren rote Doppeldeckerbusse."],
  [3, "welt", "🇮🇹", "Was ist die Hauptstadt von Italien?", ["Rom", "Mailand", "Venedig", "Neapel"], "In Rom steht das Kolosseum – dort kämpften vor fast 2000 Jahren Gladiatoren."],
  [3, "welt", "🇪🇸", "Was ist die Hauptstadt von Spanien?", ["Madrid", "Barcelona", "Lissabon", "Sevilla"], "Lissabon ist die Hauptstadt von Portugal."],
  [3, "welt", "🇦🇹", "Was ist die Hauptstadt von Österreich?", ["Wien", "Salzburg", "Graz", "Innsbruck"], "In Österreich spricht man auch Deutsch."],
  [3, "welt", "🏔️", "Wie heißt der höchste Berg der Welt?", ["Mount Everest", "Zugspitze", "Kilimandscharo", "Matterhorn"], "Der Mount Everest ist fast 9 Kilometer hoch."],
  [3, "welt", "⛰️", "Wie heißt der höchste Berg Deutschlands?", ["Zugspitze", "Watzmann", "Brocken", "Feldberg"], "Die Zugspitze ist fast 3000 Meter hoch und liegt in Bayern."],
  [3, "welt", "🔺", "In welchem Land stehen die Pyramiden von Gizeh?", ["Ägypten", "Mexiko", "China", "Italien"], "Die große Pyramide ist über 4500 Jahre alt."],
  [3, "welt", "🌊", "Welcher Ozean ist der größte?", ["Pazifik", "Atlantik", "Indischer Ozean", "Nordsee"], "Der Pazifik ist größer als alle Kontinente zusammen."],
  [3, "welt", "🌏", "Welcher Kontinent ist der größte?", ["Asien", "Europa", "Afrika", "Australien"], "In Asien liegen China und Indien – dort leben die meisten Menschen der Welt."],
  [3, "welt", "🏞️", "Welche zwei Flüsse fließen in Fürth zusammen?", ["Rednitz und Pegnitz", "Rhein und Main", "Donau und Isar", "Elbe und Spree"], "Zusammen heißen sie ab Fürth Regnitz."],
  [4, "welt", "🗺️", "Wie viele Bundesländer hat Deutschland?", ["16", "12", "10", "20"], "Die drei kleinsten sind Städte: Berlin, Hamburg und Bremen."],
  [4, "welt", "🚢", "Welcher Fluss fließt am längsten durch Deutschland?", ["Rhein", "Main", "Elbe", "Isar"], "Die Donau ist insgesamt länger – aber durch Deutschland fließt der Rhein am weitesten."],
  [5, "welt", "👥", "Welches Land hat die meisten Einwohner?", ["Indien", "Deutschland", "Brasilien", "Australien"], "Indien hat 2023 China überholt."],

  // ---------- Sport ----------
  [1, "sport", "⚽", "Wie viele Spieler einer Mannschaft stehen beim Fußball auf dem Platz?", ["11", "10", "9", "12"], "Zehn Feldspieler und ein Torwart – wie Leon!"],
  [1, "sport", "🟥", "Welche Karte bekommt ein Spieler, der vom Platz muss?", ["Rot", "Gelb", "Grün", "Blau"], "Zwei gelbe Karten in einem Spiel ergeben auch Gelb-Rot – dann muss er ebenfalls runter."],
  [1, "sport", "🍀", "Was ist das Zeichen der SpVgg Greuther Fürth?", ["Kleeblatt", "Löwe", "Adler", "Stern"], "Deshalb heißt der Verein auch einfach „das Kleeblatt“."],
  [1, "sport", "🏀", "Wohin wirft man beim Basketball den Ball?", ["in den Korb", "ins Tor", "ins Netz am Boden", "in einen Eimer"], "Der Korb hängt über 3 Meter hoch."],
  [2, "sport", "🏟️", "Wie heißt das Stadion der SpVgg Greuther Fürth?", ["Ronhof", "Allianz Arena", "Westfalenstadion", "Olympiastadion"], "Im Ronhof spielt das Kleeblatt schon seit über 100 Jahren."],
  [2, "sport", "⏱️", "Wie lange dauert ein Fußballspiel ohne Nachspielzeit?", ["90 Minuten", "60 Minuten", "45 Minuten", "120 Minuten"], "Zweimal 45 Minuten mit einer Pause dazwischen."],
  [2, "sport", "⭕", "Wie viele Ringe sind auf der Flagge der Olympischen Spiele?", ["5", "4", "6", "3"], "Die fünf Ringe stehen für die Erdteile, die sich beim Sport treffen."],
  [2, "sport", "🏒", "In welcher Sportart spielt man mit Schläger und Puck auf dem Eis?", ["Eishockey", "Tennis", "Golf", "Handball"], "Ein Puck ist eine kleine, harte Gummischeibe."],
  [3, "sport", "⛳", "Wie viele Löcher hat ein großer Golfplatz meistens?", ["18", "10", "9", "24"], "Wer ein Loch mit nur einem Schlag trifft, hat ein „Hole in One“ geschafft."],
  [3, "sport", "🎾", "Wie heißt das berühmteste Tennisturnier auf Rasen?", ["Wimbledon", "Bundesliga", "Tour de France", "Super Bowl"], "In Wimbledon in London gibt es traditionell Erdbeeren mit Sahne."],
  [3, "sport", "🚴", "Wie heißt das berühmte Radrennen durch Frankreich?", ["Tour de France", "Wimbledon", "Formel 1", "Champions League"], "Der Führende trägt ein gelbes Trikot."],

  // ---------- Körper ----------
  [1, "koerper", "🖐️", "Wie viele Finger hast du an beiden Händen zusammen?", ["10", "5", "8", "12"], "Und genauso viele Zehen!"],
  [1, "koerper", "👃", "Womit riechst du?", ["mit der Nase", "mit den Ohren", "mit den Augen", "mit der Zunge"], "Ein Hund kann viele tausendmal besser riechen als ein Mensch."],
  [1, "koerper", "👂", "Wie viele Sinne hat der Mensch?", ["5", "3", "10", "2"], "Sehen, Hören, Riechen, Schmecken, Fühlen."],
  [2, "koerper", "❤️", "Welches Organ pumpt das Blut durch den Körper?", ["das Herz", "die Lunge", "der Magen", "die Leber"], "Dein Herz schlägt ungefähr 100 000 Mal an einem Tag."],
  [2, "koerper", "🫁", "Womit atmen wir?", ["mit der Lunge", "mit dem Magen", "mit dem Herz", "mit der Niere"], "Die Lunge holt Sauerstoff in den Körper."],
  [2, "koerper", "🦷", "Wie viele Milchzähne hat ein Kind?", ["20", "32", "10", "28"], "Erwachsene haben bis zu 32 Zähne."],
  [3, "koerper", "🦴", "Wie heißt der längste Knochen im Körper?", ["Oberschenkelknochen", "Rippe", "Fingerknochen", "Schlüsselbein"], "Der Oberschenkelknochen ist auch einer der stärksten Knochen."],
  [4, "koerper", "🧍", "Was ist das größte Organ des Menschen?", ["die Haut", "das Herz", "das Gehirn", "der Magen"], "Die Haut schützt uns, hält die Wärme und lässt uns fühlen."],
  [4, "koerper", "🦴", "Wie viele Knochen hat ein erwachsener Mensch ungefähr?", ["206", "50", "1000", "100"], "Babys haben sogar noch mehr – einige Knochen wachsen später zusammen."],

  // ---------- Kurios ----------
  [1, "kurios", "🎲", "Wie viele Seiten hat ein Würfel?", ["6", "4", "8", "12"], "Gegenüberliegende Seiten ergeben beim Spielwürfel immer zusammen 7."],
  [1, "kurios", "🐝", "Was machen Bienen aus Blütennektar?", ["Honig", "Marmelade", "Milch", "Zucker"], "Für ein Glas Honig fliegen Bienen zusammen ungefähr zweimal um die Erde."],
  [1, "kurios", "🍟", "Woraus werden Pommes gemacht?", ["Kartoffeln", "Äpfeln", "Karotten", "Brot"], "Pommes frites heißt auf Französisch „gebratene Kartoffeln“."],
  [1, "kurios", "🦕", "Welche Tiere lebten vor Millionen Jahren und sind ausgestorben?", ["Dinosaurier", "Elefanten", "Pferde", "Pinguine"], "Die Vögel sind die heutigen Verwandten der Dinosaurier."],
  [1, "kurios", "🔺", "Wie viele Ecken hat ein Dreieck?", ["3", "4", "5", "0"], "Das Wort verrät es schon: drei Ecken."],
  [1, "kurios", "🐦", "Kann ein Strauß fliegen?", ["Nein, aber schnell laufen", "Ja, sehr weit", "Nur nachts", "Nur rückwärts"], "Ein Strauß rennt schneller, als ein Auto in der Stadt fahren darf."],
  [2, "kurios", "🪶", "Was ist schwerer: ein Kilo Federn oder ein Kilo Steine?", ["gleich schwer", "die Steine", "die Federn", "kommt aufs Wetter an"], "Ein Kilo ist ein Kilo – die Federn brauchen nur viel mehr Platz."],
  [2, "kurios", "🍫", "Aus welchen Bohnen wird Schokolade gemacht?", ["Kakaobohnen", "Kaffeebohnen", "Gartenbohnen", "Vanillebohnen"], "Kakaobäume wachsen nur dort, wo es warm und feucht ist."],
  [2, "kurios", "🍿", "Woraus wird Popcorn gemacht?", ["Mais", "Reis", "Weizen", "Kartoffeln"], "Im Maiskorn ist Wasser. Beim Erhitzen wird es zu Dampf – und das Korn platzt auf."],
  [2, "kurios", "🔤", "Wie viele Buchstaben hat das Alphabet (ohne ä, ö, ü, ß)?", ["26", "24", "30", "20"], "Mit ä, ö, ü und ß sind es im Deutschen 30."],
  [2, "kurios", "📆", "Welcher Monat hat die wenigsten Tage?", ["Februar", "Januar", "Juni", "Dezember"], "Der Februar hat 28 Tage – im Schaltjahr 29."],
  [3, "kurios", "🎲", "Wie viele Punkte hat ein Spielwürfel zusammen?", ["21", "18", "24", "36"], "1 + 2 + 3 + 4 + 5 + 6 = 21."],
  [3, "kurios", "📆", "Wie viele Tage hat ein Schaltjahr?", ["366", "365", "364", "360"], "Ein Schaltjahr kommt fast immer alle 4 Jahre."],
  [3, "kurios", "🐙", "Welche Farbe hat das Blut eines Oktopus?", ["blau", "rot", "grün", "gelb"], "Im Blut des Oktopus steckt Kupfer statt Eisen – das macht es blau."],
  [4, "kurios", "🥚", "Was war zuerst da: Huhn oder Ei?", ["Das Ei – Dinosaurier legten schon Eier", "Das Huhn", "Beide gleichzeitig", "Keins von beiden"], "Eier gab es schon lange vor den ersten Hühnern, zum Beispiel bei Dinosauriern."],

  // ---------- Filme & Märchen ----------
  [1, "maerchen", "🐠", "Was für ein Fisch ist Nemo?", ["Clownfisch", "Hai", "Goldfisch", "Delfin"], "Echte Clownfische wohnen zwischen den Armen von Seeanemonen."],
  [1, "maerchen", "🍍", "Wer wohnt in einer Ananas ganz tief im Meer?", ["SpongeBob", "Nemo", "Arielle", "Olaf"], "Sein bester Freund ist der Seestern Patrick."],
  [1, "maerchen", "🍎", "Wie viele Zwerge wohnen bei Schneewittchen?", ["7", "5", "3", "10"], "Das Märchen haben die Brüder Grimm aufgeschrieben."],
  [1, "maerchen", "👠", "Was verliert Aschenputtel auf der Treppe?", ["einen Schuh", "ihre Krone", "einen Handschuh", "ihre Kette"], "Mit dem Schuh sucht der Prinz im ganzen Land nach ihr."],
  [1, "maerchen", "🐝", "Wie heißt der beste Freund von Biene Maja?", ["Willi", "Flip", "Paul", "Max"], "Flip ist der Grashüpfer in der Geschichte."],
  [1, "maerchen", "🐺", "Wem begegnet Rotkäppchen im Wald?", ["dem Wolf", "dem Bären", "dem Fuchs", "dem Drachen"], "Rotkäppchen wollte eigentlich zur Großmutter."],
  [2, "maerchen", "⛄", "Wie heißt der lustige Schneemann aus „Die Eiskönigin“?", ["Olaf", "Sven", "Kristoff", "Hans"], "Sven ist das Rentier."],
  [2, "maerchen", "🐭", "Wie heißt die berühmte Maus mit den großen runden Ohren?", ["Micky Maus", "Jerry", "Speedy", "Pikachu"], "Micky Maus gibt es schon seit fast 100 Jahren."],
  [2, "maerchen", "🧙", "Wie heißt die Schule, auf die Harry Potter geht?", ["Hogwarts", "Hollywood", "Hogsmeade", "Narnia"], "Hogsmeade ist das Zaubererdorf neben der Schule."],
  [3, "maerchen", "📚", "Wer hat viele deutsche Märchen gesammelt und aufgeschrieben?", ["die Brüder Grimm", "Mozart und Beethoven", "Hänsel und Gretel", "Max und Moritz"], "Jacob und Wilhelm Grimm – ihre Märchen kennt man auf der ganzen Welt."],

  // ---------- Sprache ----------
  [1, "sprache", "🔤", "Welcher Buchstabe kommt nach A?", ["B", "C", "Z", "E"], "A, B, C, D, E … das ABC."],
  [1, "sprache", "🌹", "Welches Wort reimt sich auf „Hose“?", ["Rose", "Hase", "Nase", "Haus"], "Beim Reim klingt das Ende gleich: H-ose, R-ose."],
  [1, "sprache", "🔥", "Was ist das Gegenteil von „heiß“?", ["kalt", "warm", "groß", "laut"], "Warm liegt dazwischen."],
  [1, "sprache", "🍌", "Wie viele Silben hat das Wort „Banane“?", ["3", "2", "4", "1"], "Ba – na – ne: dreimal klatschen."],
  [2, "sprache", "🐭", "Was ist die Mehrzahl von „Maus“?", ["Mäuse", "Mause", "Mäuser", "Mausen"], "Aus au wird äu: Maus – Mäuse, Haus – Häuser."],
  [2, "sprache", "🐶", "Welches Wort ist ein Nomen?", ["Hund", "laufen", "schnell", "und"], "Nomen schreibt man groß, und man kann der, die oder das davorsetzen."],
  [3, "sprache", "🐕", "Was heißt „dog“ auf Deutsch?", ["Hund", "Katze", "Vogel", "Pferd"], "Und „cat“ heißt Katze."],
  [3, "sprache", "🙏", "Was heißt „Thank you“?", ["Danke", "Bitte", "Hallo", "Tschüss"], "Auf Französisch sagt man „Merci“."],
  [3, "sprache", "🔵", "Was heißt „blue“ auf Deutsch?", ["blau", "gelb", "grün", "braun"], "Red ist rot, green ist grün, yellow ist gelb."],
  [4, "sprache", "🇫🇷", "Was heißt „Bonjour“?", ["Guten Tag", "Gute Nacht", "Danke", "Tschüss"], "Helena lernt Französisch – frag sie mal nach mehr Wörtern!"],

  // ---------- Erfinder & Geschichte ----------
  [2, "wissen", "🏰", "Wer lebte früher auf einer Burg?", ["Ritter und Burgherren", "Astronauten", "Piraten auf Schiffen", "Dinosaurier"], "Burgen hatten dicke Mauern, damit Feinde nicht hineinkamen."],
  [2, "wissen", "🦖", "Welcher Dinosaurier hatte sehr kurze Arme und fraß Fleisch?", ["Tyrannosaurus Rex", "Brachiosaurus", "Triceratops", "Stegosaurus"], "Der Brachiosaurus war ein langhalsiger Pflanzenfresser."],
  [3, "wissen", "🌕", "Wer war der erste Mensch auf dem Mond?", ["Neil Armstrong", "Juri Gagarin", "Albert Einstein", "Christoph Kolumbus"], "Das war 1969. Juri Gagarin war der erste Mensch im Weltall."],
  [3, "wissen", "🎹", "Welcher berühmte Komponist konnte später nicht mehr hören?", ["Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Michael Jackson"], "Beethoven komponierte weiter, obwohl er taub war – die Musik hatte er im Kopf."],
  [4, "wissen", "💡", "Wer machte die Glühbirne berühmt und verkaufte sie an alle?", ["Thomas Edison", "Albert Einstein", "Isaac Newton", "Leonardo da Vinci"], "Andere hatten schon vor ihm daran getüftelt – Edison machte sie haltbar und bekannt."],
  [4, "wissen", "🚗", "Aus welchem Land kommt das erste Auto mit Benzinmotor?", ["Deutschland", "USA", "Japan", "Frankreich"], "Carl Benz baute es 1886. Bertha Benz fuhr damit die erste lange Autofahrt."],
  [5, "wissen", "🖼️", "Wer malte die Mona Lisa?", ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Albrecht Dürer"], "Albrecht Dürer war übrigens aus Nürnberg – gleich neben Fürth."],
  [5, "wissen", "📖", "Wer erfand in Europa den Buchdruck mit beweglichen Buchstaben?", ["Johannes Gutenberg", "Martin Luther", "Carl Benz", "Galileo Galilei"], "Vorher wurden Bücher mit der Hand abgeschrieben."],
  [5, "wissen", "🧱", "In welchem Jahr fiel die Berliner Mauer?", ["1989", "1945", "2001", "1969"], "Danach wurden Ost- und Westdeutschland wieder ein Land."]
];

export const FRAGEN = EIGENE.concat(KLEXIKON);
