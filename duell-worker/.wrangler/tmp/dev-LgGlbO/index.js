var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../duell/fragen.js
var FRAGEN = [
  // ---------- Tiere ----------
  [1, "tiere", "\u{1F577}\uFE0F", "Wie viele Beine hat eine Spinne?", ["8", "6", "10", "4"], "Insekten haben 6 Beine, Spinnen 8 \u2013 darum sind Spinnen keine Insekten."],
  [1, "tiere", "\u{1F41E}", "Wie viele Beine hat ein K\xE4fer?", ["6", "8", "4", "10"], "Alle Insekten haben 6 Beine: K\xE4fer, Bienen, Ameisen, Schmetterlinge."],
  [1, "tiere", "\u{1F418}", "Welches Tier hat einen R\xFCssel?", ["Elefant", "Nashorn", "Nilpferd", "L\xF6we"], "Mit dem R\xFCssel kann ein Elefant riechen, trinken, greifen und sogar trompeten."],
  [1, "tiere", "\u{1F992}", "Welches Tier ist das h\xF6chste der Welt?", ["Giraffe", "Elefant", "Kamel", "Pferd"], "Eine Giraffe kann \xFCber 5 Meter hoch werden \u2013 so hoch wie zwei Stockwerke."],
  [1, "tiere", "\u{1F427}", "Welcher Vogel kann nicht fliegen?", ["Pinguin", "Adler", "Spatz", "M\xF6we"], "Pinguine fliegen daf\xFCr unter Wasser \u2013 mit ihren Fl\xFCgeln schwimmen sie superschnell."],
  [1, "tiere", "\u{1F43C}", "Was frisst ein Panda am liebsten?", ["Bambus", "Fisch", "Bananen", "Honig"], "Ein Panda frisst jeden Tag viele Kilo Bambus \u2013 er ist fast den ganzen Tag mit Essen besch\xE4ftigt."],
  [1, "tiere", "\u{1F434}", "Wie hei\xDFt ein Pferdebaby?", ["Fohlen", "Kalb", "Lamm", "Ferkel"], "Ein Fohlen kann schon kurz nach der Geburt stehen und laufen."],
  [1, "tiere", "\u{1F404}", "Wie hei\xDFt ein Kuhbaby?", ["Kalb", "Fohlen", "K\xFCken", "Welpe"], "Ein Kalb trinkt am Anfang Milch bei seiner Mutter \u2013 genau wie ein Menschenbaby."],
  [1, "tiere", "\u{1F414}", "Welches Tier legt Eier?", ["Huhn", "Hund", "Katze", "Kuh"], "Ein Huhn kann fast jeden Tag ein Ei legen."],
  [1, "tiere", "\u{1F43B}\u200D\u2744\uFE0F", "Wo lebt der Eisb\xE4r?", ["am Nordpol", "am S\xFCdpol", "in der W\xFCste", "im Dschungel"], "Pinguine leben am S\xFCdpol, Eisb\xE4ren am Nordpol \u2013 in der Natur treffen sie sich nie."],
  [1, "tiere", "\u{1F413}", "Welches Tier ruft \u201EKikeriki\u201C?", ["Hahn", "Ente", "Gans", "Schaf"], "In England ruft der Hahn \xFCbrigens \u201ECock-a-doodle-doo\u201C."],
  [1, "tiere", "\u{1F9A9}", "Welche Farbe hat ein Flamingo?", ["rosa", "blau", "gr\xFCn", "schwarz"], "Flamingos werden rosa, weil sie kleine Krebse und Algen fressen. K\xFCken sind noch grau."],
  [1, "tiere", "\u{1F40C}", "Welches Tier tr\xE4gt sein Haus auf dem R\xFCcken?", ["Schnecke", "Igel", "K\xE4fer", "Frosch"], "Das Schneckenhaus w\xE4chst mit der Schnecke mit."],
  [1, "tiere", "\u{1F981}", "Welches Tier nennt man den \u201EK\xF6nig der Tiere\u201C?", ["L\xF6we", "Tiger", "B\xE4r", "Adler"], "Nur L\xF6wenm\xE4nnchen haben eine M\xE4hne. Gejagt wird aber meistens von den Weibchen."],
  [1, "tiere", "\u{1F987}", "Welches Tier schl\xE4ft mit dem Kopf nach unten?", ["Fledermaus", "Eule", "Katze", "Hase"], "Flederm\xE4use h\xE4ngen sich mit den F\xFC\xDFen fest und schlafen kopf\xFCber."],
  [1, "tiere", "\u{1F419}", "Wie viele Arme hat ein Oktopus?", ["8", "6", "10", "4"], "Okto hei\xDFt acht. Ein Oktopus hat au\xDFerdem drei Herzen!"],
  [1, "tiere", "\u{1F993}", "Welche Farben hat ein Zebra?", ["schwarz und wei\xDF", "braun und gelb", "grau und rot", "blau und wei\xDF"], "Kein Zebra hat das gleiche Streifenmuster wie ein anderes \u2013 wie ein Fingerabdruck."],
  [2, "tiere", "\u{1F406}", "Welches ist das schnellste Tier an Land?", ["Gepard", "L\xF6we", "Pferd", "Hase"], "Ein Gepard ist so schnell wie ein Auto auf der Landstra\xDFe \u2013 aber nur f\xFCr ein paar Sekunden."],
  [2, "tiere", "\u{1F40B}", "Welches ist das gr\xF6\xDFte Tier der Welt?", ["Blauwal", "Elefant", "Wei\xDFer Hai", "Giraffe"], "Ein Blauwal ist so lang wie ein Schwimmbecken \u2013 und frisst winzige Krebse."],
  [2, "tiere", "\u{1F98E}", "Welches Tier kann seine Farbe wechseln?", ["Cham\xE4leon", "Frosch", "Schildkr\xF6te", "Krokodil"], "Das Cham\xE4leon zeigt mit seiner Farbe auch, wie es sich gerade f\xFChlt."],
  [2, "tiere", "\u{1F42A}", "Wie viele H\xF6cker hat ein Dromedar?", ["1", "2", "3", "0"], "Das Kamel hat zwei H\xF6cker, das Dromedar einen. In den H\xF6ckern ist Fett, kein Wasser."],
  [2, "tiere", "\u{1F9AB}", "Welches Tier baut D\xE4mme aus Holz im Fluss?", ["Biber", "Otter", "Maulwurf", "Fuchs"], "Biber f\xE4llen B\xE4ume mit ihren Z\xE4hnen \u2013 und die Z\xE4hne wachsen ein Leben lang nach."],
  [2, "tiere", "\u{1F434}", "Welches Tier kann im Stehen schlafen?", ["Pferd", "Hund", "Katze", "Maus"], "Pferde d\xF6sen im Stehen. F\xFCr den Tiefschlaf legen sie sich aber hin."],
  [2, "tiere", "\u{1F42C}", "Delfine sind \u2026", ["S\xE4ugetiere", "Fische", "V\xF6gel", "Insekten"], "Delfine atmen Luft und trinken als Babys Milch \u2013 wie wir."],
  [2, "tiere", "\u{1F989}", "Wann ist eine Eule meistens wach?", ["in der Nacht", "am Mittag", "am Morgen", "nie"], "Eulen k\xF6nnen fast lautlos fliegen und in der Dunkelheit sehr gut h\xF6ren."],
  [3, "tiere", "\u{1F426}", "Welcher Vogel kann r\xFCckw\xE4rts fliegen?", ["Kolibri", "Adler", "Spatz", "Taube"], "Kolibris schlagen so schnell mit den Fl\xFCgeln, dass sie in der Luft stehen bleiben k\xF6nnen."],
  [3, "tiere", "\u{1F428}", "Wie lange schl\xE4ft ein Koala ungef\xE4hr am Tag?", ["20 Stunden", "5 Stunden", "10 Stunden", "1 Stunde"], "Koalas fressen Eukalyptusbl\xE4tter \u2013 die geben wenig Kraft, darum schlafen sie so viel."],
  [3, "tiere", "\u{1F419}", "Wie viele Herzen hat ein Oktopus?", ["3", "1", "2", "8"], "Und sein Blut ist blau!"],
  [3, "tiere", "\u{1F41D}", "Wie nennt man eine Gruppe von Bienen, die zusammen wohnen?", ["Volk", "Herde", "Rudel", "Schwarm aus Fischen"], "In einem Bienenvolk gibt es eine K\xF6nigin und tausende Arbeiterinnen."],
  [4, "tiere", "\u{1F988}", "Wie oft wachsen einem Hai neue Z\xE4hne nach?", ["immer wieder, sein ganzes Leben", "nie", "genau einmal", "nur als Baby"], "Haie verlieren st\xE4ndig Z\xE4hne \u2013 und es r\xFCckt immer ein neuer nach."],
  // ---------- Natur & Weltall ----------
  [1, "natur", "\u{1F30D}", "Wie hei\xDFt unser Planet?", ["Erde", "Mars", "Mond", "Sonne"], "Die Erde ist der einzige Planet, auf dem man bisher Leben gefunden hat."],
  [1, "natur", "\u2600\uFE0F", "Was scheint am Tag hell vom Himmel und w\xE4rmt uns?", ["die Sonne", "der Mond", "eine Sternschnuppe", "eine Wolke"], "Die Sonne ist ein riesiger Stern. Ihr Licht braucht etwa 8 Minuten bis zu uns."],
  [1, "natur", "\u{1F308}", "Wie viele Farben z\xE4hlt man beim Regenbogen?", ["7", "3", "5", "10"], "Rot, Orange, Gelb, Gr\xFCn, Blau, Indigo, Violett. Ein Regenbogen entsteht, wenn Sonne auf Regentropfen scheint."],
  [1, "natur", "\u{1F342}", "Wie viele Jahreszeiten gibt es?", ["4", "2", "6", "12"], "Fr\xFChling, Sommer, Herbst und Winter."],
  [1, "natur", "\u{1F4C5}", "Wie viele Tage hat eine Woche?", ["7", "5", "10", "6"], "Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag."],
  [1, "natur", "\u{1F3A8}", "Welche Farbe entsteht aus Blau und Gelb?", ["Gr\xFCn", "Lila", "Orange", "Braun"], "Probier es mit Wasserfarben aus!"],
  [1, "natur", "\u{1F3A8}", "Welche Farbe entsteht aus Rot und Gelb?", ["Orange", "Gr\xFCn", "Lila", "Blau"], "Die Farbe hat denselben Namen wie eine Frucht."],
  [1, "natur", "\u{1F331}", "Was braucht eine Pflanze zum Wachsen?", ["Wasser und Licht", "Cola", "Dunkelheit", "Salz"], "Aus Licht, Wasser und Luft macht die Pflanze ihre eigene Nahrung."],
  [2, "natur", "\u{1F5D3}\uFE0F", "Wie viele Monate hat ein Jahr?", ["12", "10", "7", "52"], "52 sind \xFCbrigens die Wochen in einem Jahr."],
  [2, "natur", "\u{1F3A8}", "Welche Farbe entsteht aus Rot und Blau?", ["Lila", "Gr\xFCn", "Orange", "Gelb"], "Lila nennt man auch Violett."],
  [2, "natur", "\u{1F534}", "Welcher Planet wird der \u201ERote Planet\u201C genannt?", ["Mars", "Jupiter", "Venus", "Erde"], "Der Mars ist rot, weil sein Staub rostiges Eisen enth\xE4lt."],
  [2, "natur", "\u2B50", "Was ist die Sonne?", ["ein Stern", "ein Planet", "ein Mond", "ein Komet"], "Nachts siehst du andere Sonnen \u2013 sie sind nur sehr weit weg und darum klein."],
  [2, "natur", "\u{1F319}", "Was macht der Mond?", ["Er kreist um die Erde", "Er leuchtet selbst", "Er kreist um den Mars", "Er steht still"], "Der Mond leuchtet nicht selbst \u2013 er wird von der Sonne angestrahlt."],
  [2, "natur", "\u26A1", "Warum sieht man den Blitz vor dem Donner?", ["Licht ist schneller als Schall", "Der Donner ist sch\xFCchtern", "Blitze sind n\xE4her", "Zufall"], "Z\xE4hl die Sekunden zwischen Blitz und Donner und teile durch 3 \u2013 so viele Kilometer ist das Gewitter weg."],
  [2, "natur", "\u{1F321}\uFE0F", "Was misst ein Thermometer?", ["die Temperatur", "die Uhrzeit", "den Regen", "das Gewicht"], "Wasser gefriert bei 0 Grad und kocht bei 100 Grad."],
  [2, "natur", "\u{1F9ED}", "Was zeigt ein Kompass an?", ["die Himmelsrichtung", "die Uhrzeit", "die Temperatur", "das Wetter"], "Die Nadel zeigt immer nach Norden."],
  [3, "natur", "\u{1FA90}", "Welcher Planet ist der gr\xF6\xDFte in unserem Sonnensystem?", ["Jupiter", "Erde", "Mars", "Venus"], "In den Jupiter w\xFCrde die Erde \xFCber 1000-mal hineinpassen."],
  [3, "natur", "\u{1FA90}", "Wie viele Planeten hat unser Sonnensystem?", ["8", "9", "7", "12"], "Fr\xFCher z\xE4hlte Pluto mit \u2013 seit 2006 gilt er als Zwergplanet."],
  [3, "natur", "\u{1F9CA}", "Bei wie viel Grad gefriert Wasser?", ["0 Grad", "10 Grad", "100 Grad", "-50 Grad"], "Eis ist leichter als Wasser \u2013 darum schwimmt es oben."],
  [4, "natur", "\u{1F48E}", "Wie hei\xDFt das h\xE4rteste nat\xFCrliche Material?", ["Diamant", "Gold", "Eisen", "Granit"], "Diamanten bestehen aus reinem Kohlenstoff \u2013 wie Bleistiftminen, nur ganz anders angeordnet."],
  [5, "natur", "\u{1F4A7}", "Wof\xFCr steht H\u2082O?", ["Wasser", "Sauerstoff", "Salz", "Zucker"], "Zwei Wasserstoff-Teilchen und ein Sauerstoff-Teilchen ergeben Wasser."],
  [5, "natur", "\u{1F321}\uFE0F", "Welches Metall ist bei Zimmertemperatur fl\xFCssig?", ["Quecksilber", "Eisen", "Kupfer", "Silber"], "Fr\xFCher war Quecksilber in Fieberthermometern \u2013 heute nicht mehr, weil es giftig ist."],
  // ---------- Welt & Länder ----------
  [1, "welt", "\u{1F1E9}\u{1F1EA}", "Was ist die Hauptstadt von Deutschland?", ["Berlin", "M\xFCnchen", "Hamburg", "F\xFCrth"], "In Berlin wohnen \xFCber 3 Millionen Menschen \u2013 so viele wie in keiner anderen deutschen Stadt."],
  [1, "welt", "\u{1F1E9}\u{1F1EA}", "Welche Farben hat die deutsche Flagge?", ["Schwarz, Rot, Gold", "Rot, Wei\xDF, Blau", "Gr\xFCn, Wei\xDF, Rot", "Blau, Gelb"], "Die Farben Schwarz, Rot, Gold gibt es als Flagge schon seit fast 200 Jahren."],
  [2, "welt", "\u{1F3D4}\uFE0F", "In welchem Bundesland liegt F\xFCrth?", ["Bayern", "Hessen", "Sachsen", "Berlin"], "F\xFCrth liegt in Franken \u2013 das ist der n\xF6rdliche Teil von Bayern."],
  [2, "welt", "\u{1F3D9}\uFE0F", "Welche Gro\xDFstadt liegt direkt neben F\xFCrth?", ["N\xFCrnberg", "Hamburg", "K\xF6ln", "Bremen"], "Zwischen N\xFCrnberg und F\xFCrth fuhr 1835 die allererste Eisenbahn Deutschlands."],
  [2, "welt", "\u{1F5FC}", "In welchem Land steht der Eiffelturm?", ["Frankreich", "Italien", "Spanien", "England"], "Der Eiffelturm in Paris ist \xFCber 300 Meter hoch und wurde vor mehr als 130 Jahren gebaut."],
  [2, "welt", "\u{1F1EB}\u{1F1F7}", "Was ist die Hauptstadt von Frankreich?", ["Paris", "Rom", "London", "Madrid"], "Helena lernt Franz\xF6sisch \u2013 in Paris kann sie es ausprobieren!"],
  [2, "welt", "\u{1F985}", "Welches Tier ist das Wappentier von Deutschland?", ["Adler", "L\xF6we", "B\xE4r", "Hirsch"], "Den Bundesadler siehst du auf den deutschen 1- und 2-Euro-M\xFCnzen."],
  [2, "welt", "\u{1F968}", "Wie hei\xDFt die Hauptstadt von Bayern?", ["M\xFCnchen", "N\xFCrnberg", "Augsburg", "W\xFCrzburg"], "In M\xFCnchen steht die Allianz Arena."],
  [2, "welt", "\u{1F6AA}", "In welcher Stadt steht das Brandenburger Tor?", ["Berlin", "Brandenburg", "Potsdam", "Hamburg"], "Oben auf dem Tor steht eine Figur mit einem Wagen und vier Pferden."],
  [2, "welt", "\u{1F4B6}", "Mit welchem Geld bezahlt man in Deutschland?", ["Euro", "Dollar", "Franken", "Pfund"], "Den Euro gibt es als Bargeld seit 2002."],
  [2, "welt", "\u{1F1EC}\u{1F1E7}", "Was ist die Hauptstadt von England?", ["London", "Paris", "Dublin", "Berlin"], "In London fahren rote Doppeldeckerbusse."],
  [3, "welt", "\u{1F1EE}\u{1F1F9}", "Was ist die Hauptstadt von Italien?", ["Rom", "Mailand", "Venedig", "Neapel"], "In Rom steht das Kolosseum \u2013 dort k\xE4mpften vor fast 2000 Jahren Gladiatoren."],
  [3, "welt", "\u{1F1EA}\u{1F1F8}", "Was ist die Hauptstadt von Spanien?", ["Madrid", "Barcelona", "Lissabon", "Sevilla"], "Lissabon ist die Hauptstadt von Portugal."],
  [3, "welt", "\u{1F1E6}\u{1F1F9}", "Was ist die Hauptstadt von \xD6sterreich?", ["Wien", "Salzburg", "Graz", "Innsbruck"], "In \xD6sterreich spricht man auch Deutsch."],
  [3, "welt", "\u{1F3D4}\uFE0F", "Wie hei\xDFt der h\xF6chste Berg der Welt?", ["Mount Everest", "Zugspitze", "Kilimandscharo", "Matterhorn"], "Der Mount Everest ist fast 9 Kilometer hoch."],
  [3, "welt", "\u26F0\uFE0F", "Wie hei\xDFt der h\xF6chste Berg Deutschlands?", ["Zugspitze", "Watzmann", "Brocken", "Feldberg"], "Die Zugspitze ist fast 3000 Meter hoch und liegt in Bayern."],
  [3, "welt", "\u{1F53A}", "In welchem Land stehen die Pyramiden von Gizeh?", ["\xC4gypten", "Mexiko", "China", "Italien"], "Die gro\xDFe Pyramide ist \xFCber 4500 Jahre alt."],
  [3, "welt", "\u{1F30A}", "Welcher Ozean ist der gr\xF6\xDFte?", ["Pazifik", "Atlantik", "Indischer Ozean", "Nordsee"], "Der Pazifik ist gr\xF6\xDFer als alle Kontinente zusammen."],
  [3, "welt", "\u{1F30F}", "Welcher Kontinent ist der gr\xF6\xDFte?", ["Asien", "Europa", "Afrika", "Australien"], "In Asien liegen China und Indien \u2013 dort leben die meisten Menschen der Welt."],
  [3, "welt", "\u{1F3DE}\uFE0F", "Welche zwei Fl\xFCsse flie\xDFen in F\xFCrth zusammen?", ["Rednitz und Pegnitz", "Rhein und Main", "Donau und Isar", "Elbe und Spree"], "Zusammen hei\xDFen sie ab F\xFCrth Regnitz."],
  [4, "welt", "\u{1F5FA}\uFE0F", "Wie viele Bundesl\xE4nder hat Deutschland?", ["16", "12", "10", "20"], "Die drei kleinsten sind St\xE4dte: Berlin, Hamburg und Bremen."],
  [4, "welt", "\u{1F6A2}", "Welcher Fluss flie\xDFt am l\xE4ngsten durch Deutschland?", ["Rhein", "Main", "Elbe", "Isar"], "Die Donau ist insgesamt l\xE4nger \u2013 aber durch Deutschland flie\xDFt der Rhein am weitesten."],
  [5, "welt", "\u{1F465}", "Welches Land hat die meisten Einwohner?", ["Indien", "Deutschland", "Brasilien", "Australien"], "Indien hat 2023 China \xFCberholt."],
  // ---------- Sport ----------
  [1, "sport", "\u26BD", "Wie viele Spieler einer Mannschaft stehen beim Fu\xDFball auf dem Platz?", ["11", "10", "9", "12"], "Zehn Feldspieler und ein Torwart \u2013 wie Leon!"],
  [1, "sport", "\u{1F7E5}", "Welche Karte bekommt ein Spieler, der vom Platz muss?", ["Rot", "Gelb", "Gr\xFCn", "Blau"], "Zwei gelbe Karten in einem Spiel ergeben auch Gelb-Rot \u2013 dann muss er ebenfalls runter."],
  [1, "sport", "\u{1F340}", "Was ist das Zeichen der SpVgg Greuther F\xFCrth?", ["Kleeblatt", "L\xF6we", "Adler", "Stern"], "Deshalb hei\xDFt der Verein auch einfach \u201Edas Kleeblatt\u201C."],
  [1, "sport", "\u{1F3C0}", "Wohin wirft man beim Basketball den Ball?", ["in den Korb", "ins Tor", "ins Netz am Boden", "in einen Eimer"], "Der Korb h\xE4ngt \xFCber 3 Meter hoch."],
  [2, "sport", "\u{1F3DF}\uFE0F", "Wie hei\xDFt das Stadion der SpVgg Greuther F\xFCrth?", ["Ronhof", "Allianz Arena", "Westfalenstadion", "Olympiastadion"], "Im Ronhof spielt das Kleeblatt schon seit \xFCber 100 Jahren."],
  [2, "sport", "\u23F1\uFE0F", "Wie lange dauert ein Fu\xDFballspiel ohne Nachspielzeit?", ["90 Minuten", "60 Minuten", "45 Minuten", "120 Minuten"], "Zweimal 45 Minuten mit einer Pause dazwischen."],
  [2, "sport", "\u2B55", "Wie viele Ringe sind auf der Flagge der Olympischen Spiele?", ["5", "4", "6", "3"], "Die f\xFCnf Ringe stehen f\xFCr die Erdteile, die sich beim Sport treffen."],
  [2, "sport", "\u{1F3D2}", "In welcher Sportart spielt man mit Schl\xE4ger und Puck auf dem Eis?", ["Eishockey", "Tennis", "Golf", "Handball"], "Ein Puck ist eine kleine, harte Gummischeibe."],
  [3, "sport", "\u26F3", "Wie viele L\xF6cher hat ein gro\xDFer Golfplatz meistens?", ["18", "10", "9", "24"], "Wer ein Loch mit nur einem Schlag trifft, hat ein \u201EHole in One\u201C geschafft."],
  [3, "sport", "\u{1F3BE}", "Wie hei\xDFt das ber\xFChmteste Tennisturnier auf Rasen?", ["Wimbledon", "Bundesliga", "Tour de France", "Super Bowl"], "In Wimbledon in London gibt es traditionell Erdbeeren mit Sahne."],
  [3, "sport", "\u{1F6B4}", "Wie hei\xDFt das ber\xFChmte Radrennen durch Frankreich?", ["Tour de France", "Wimbledon", "Formel 1", "Champions League"], "Der F\xFChrende tr\xE4gt ein gelbes Trikot."],
  // ---------- Körper ----------
  [1, "koerper", "\u{1F590}\uFE0F", "Wie viele Finger hast du an beiden H\xE4nden zusammen?", ["10", "5", "8", "12"], "Und genauso viele Zehen!"],
  [1, "koerper", "\u{1F443}", "Womit riechst du?", ["mit der Nase", "mit den Ohren", "mit den Augen", "mit der Zunge"], "Ein Hund kann viele tausendmal besser riechen als ein Mensch."],
  [1, "koerper", "\u{1F442}", "Wie viele Sinne hat der Mensch?", ["5", "3", "10", "2"], "Sehen, H\xF6ren, Riechen, Schmecken, F\xFChlen."],
  [2, "koerper", "\u2764\uFE0F", "Welches Organ pumpt das Blut durch den K\xF6rper?", ["das Herz", "die Lunge", "der Magen", "die Leber"], "Dein Herz schl\xE4gt ungef\xE4hr 100 000 Mal an einem Tag."],
  [2, "koerper", "\u{1FAC1}", "Womit atmen wir?", ["mit der Lunge", "mit dem Magen", "mit dem Herz", "mit der Niere"], "Die Lunge holt Sauerstoff in den K\xF6rper."],
  [2, "koerper", "\u{1F9B7}", "Wie viele Milchz\xE4hne hat ein Kind?", ["20", "32", "10", "28"], "Erwachsene haben bis zu 32 Z\xE4hne."],
  [3, "koerper", "\u{1F9B4}", "Wie hei\xDFt der l\xE4ngste Knochen im K\xF6rper?", ["Oberschenkelknochen", "Rippe", "Fingerknochen", "Schl\xFCsselbein"], "Der Oberschenkelknochen ist auch einer der st\xE4rksten Knochen."],
  [4, "koerper", "\u{1F9CD}", "Was ist das gr\xF6\xDFte Organ des Menschen?", ["die Haut", "das Herz", "das Gehirn", "der Magen"], "Die Haut sch\xFCtzt uns, h\xE4lt die W\xE4rme und l\xE4sst uns f\xFChlen."],
  [4, "koerper", "\u{1F9B4}", "Wie viele Knochen hat ein erwachsener Mensch ungef\xE4hr?", ["206", "50", "1000", "100"], "Babys haben sogar noch mehr \u2013 einige Knochen wachsen sp\xE4ter zusammen."],
  // ---------- Kurios ----------
  [1, "kurios", "\u{1F3B2}", "Wie viele Seiten hat ein W\xFCrfel?", ["6", "4", "8", "12"], "Gegen\xFCberliegende Seiten ergeben beim Spielw\xFCrfel immer zusammen 7."],
  [1, "kurios", "\u{1F41D}", "Was machen Bienen aus Bl\xFCtennektar?", ["Honig", "Marmelade", "Milch", "Zucker"], "F\xFCr ein Glas Honig fliegen Bienen zusammen ungef\xE4hr zweimal um die Erde."],
  [1, "kurios", "\u{1F35F}", "Woraus werden Pommes gemacht?", ["Kartoffeln", "\xC4pfeln", "Karotten", "Brot"], "Pommes frites hei\xDFt auf Franz\xF6sisch \u201Egebratene Kartoffeln\u201C."],
  [1, "kurios", "\u{1F995}", "Welche Tiere lebten vor Millionen Jahren und sind ausgestorben?", ["Dinosaurier", "Elefanten", "Pferde", "Pinguine"], "Die V\xF6gel sind die heutigen Verwandten der Dinosaurier."],
  [1, "kurios", "\u{1F53A}", "Wie viele Ecken hat ein Dreieck?", ["3", "4", "5", "0"], "Das Wort verr\xE4t es schon: drei Ecken."],
  [1, "kurios", "\u{1F426}", "Kann ein Strau\xDF fliegen?", ["Nein, aber schnell laufen", "Ja, sehr weit", "Nur nachts", "Nur r\xFCckw\xE4rts"], "Ein Strau\xDF rennt schneller, als ein Auto in der Stadt fahren darf."],
  [2, "kurios", "\u{1FAB6}", "Was ist schwerer: ein Kilo Federn oder ein Kilo Steine?", ["gleich schwer", "die Steine", "die Federn", "kommt aufs Wetter an"], "Ein Kilo ist ein Kilo \u2013 die Federn brauchen nur viel mehr Platz."],
  [2, "kurios", "\u{1F36B}", "Aus welchen Bohnen wird Schokolade gemacht?", ["Kakaobohnen", "Kaffeebohnen", "Gartenbohnen", "Vanillebohnen"], "Kakaob\xE4ume wachsen nur dort, wo es warm und feucht ist."],
  [2, "kurios", "\u{1F37F}", "Woraus wird Popcorn gemacht?", ["Mais", "Reis", "Weizen", "Kartoffeln"], "Im Maiskorn ist Wasser. Beim Erhitzen wird es zu Dampf \u2013 und das Korn platzt auf."],
  [2, "kurios", "\u{1F524}", "Wie viele Buchstaben hat das Alphabet (ohne \xE4, \xF6, \xFC, \xDF)?", ["26", "24", "30", "20"], "Mit \xE4, \xF6, \xFC und \xDF sind es im Deutschen 30."],
  [2, "kurios", "\u{1F4C6}", "Welcher Monat hat die wenigsten Tage?", ["Februar", "Januar", "Juni", "Dezember"], "Der Februar hat 28 Tage \u2013 im Schaltjahr 29."],
  [3, "kurios", "\u{1F3B2}", "Wie viele Punkte hat ein Spielw\xFCrfel zusammen?", ["21", "18", "24", "36"], "1 + 2 + 3 + 4 + 5 + 6 = 21."],
  [3, "kurios", "\u{1F4C6}", "Wie viele Tage hat ein Schaltjahr?", ["366", "365", "364", "360"], "Ein Schaltjahr kommt fast immer alle 4 Jahre."],
  [3, "kurios", "\u{1F419}", "Welche Farbe hat das Blut eines Oktopus?", ["blau", "rot", "gr\xFCn", "gelb"], "Im Blut des Oktopus steckt Kupfer statt Eisen \u2013 das macht es blau."],
  [4, "kurios", "\u{1F95A}", "Was war zuerst da: Huhn oder Ei?", ["Das Ei \u2013 Dinosaurier legten schon Eier", "Das Huhn", "Beide gleichzeitig", "Keins von beiden"], "Eier gab es schon lange vor den ersten H\xFChnern, zum Beispiel bei Dinosauriern."],
  // ---------- Filme & Märchen ----------
  [1, "maerchen", "\u{1F420}", "Was f\xFCr ein Fisch ist Nemo?", ["Clownfisch", "Hai", "Goldfisch", "Delfin"], "Echte Clownfische wohnen zwischen den Armen von Seeanemonen."],
  [1, "maerchen", "\u{1F34D}", "Wer wohnt in einer Ananas ganz tief im Meer?", ["SpongeBob", "Nemo", "Arielle", "Olaf"], "Sein bester Freund ist der Seestern Patrick."],
  [1, "maerchen", "\u{1F34E}", "Wie viele Zwerge wohnen bei Schneewittchen?", ["7", "5", "3", "10"], "Das M\xE4rchen haben die Br\xFCder Grimm aufgeschrieben."],
  [1, "maerchen", "\u{1F460}", "Was verliert Aschenputtel auf der Treppe?", ["einen Schuh", "ihre Krone", "einen Handschuh", "ihre Kette"], "Mit dem Schuh sucht der Prinz im ganzen Land nach ihr."],
  [1, "maerchen", "\u{1F41D}", "Wie hei\xDFt der beste Freund von Biene Maja?", ["Willi", "Flip", "Paul", "Max"], "Flip ist der Grash\xFCpfer in der Geschichte."],
  [1, "maerchen", "\u{1F43A}", "Wem begegnet Rotk\xE4ppchen im Wald?", ["dem Wolf", "dem B\xE4ren", "dem Fuchs", "dem Drachen"], "Rotk\xE4ppchen wollte eigentlich zur Gro\xDFmutter."],
  [2, "maerchen", "\u26C4", "Wie hei\xDFt der lustige Schneemann aus \u201EDie Eisk\xF6nigin\u201C?", ["Olaf", "Sven", "Kristoff", "Hans"], "Sven ist das Rentier."],
  [2, "maerchen", "\u{1F42D}", "Wie hei\xDFt die ber\xFChmte Maus mit den gro\xDFen runden Ohren?", ["Micky Maus", "Jerry", "Speedy", "Pikachu"], "Micky Maus gibt es schon seit fast 100 Jahren."],
  [2, "maerchen", "\u{1F9D9}", "Wie hei\xDFt die Schule, auf die Harry Potter geht?", ["Hogwarts", "Hollywood", "Hogsmeade", "Narnia"], "Hogsmeade ist das Zaubererdorf neben der Schule."],
  [3, "maerchen", "\u{1F4DA}", "Wer hat viele deutsche M\xE4rchen gesammelt und aufgeschrieben?", ["die Br\xFCder Grimm", "Mozart und Beethoven", "H\xE4nsel und Gretel", "Max und Moritz"], "Jacob und Wilhelm Grimm \u2013 ihre M\xE4rchen kennt man auf der ganzen Welt."],
  // ---------- Sprache ----------
  [1, "sprache", "\u{1F524}", "Welcher Buchstabe kommt nach A?", ["B", "C", "Z", "E"], "A, B, C, D, E \u2026 das ABC."],
  [1, "sprache", "\u{1F339}", "Welches Wort reimt sich auf \u201EHose\u201C?", ["Rose", "Hase", "Nase", "Haus"], "Beim Reim klingt das Ende gleich: H-ose, R-ose."],
  [1, "sprache", "\u{1F525}", "Was ist das Gegenteil von \u201Ehei\xDF\u201C?", ["kalt", "warm", "gro\xDF", "laut"], "Warm liegt dazwischen."],
  [1, "sprache", "\u{1F34C}", "Wie viele Silben hat das Wort \u201EBanane\u201C?", ["3", "2", "4", "1"], "Ba \u2013 na \u2013 ne: dreimal klatschen."],
  [2, "sprache", "\u{1F42D}", "Was ist die Mehrzahl von \u201EMaus\u201C?", ["M\xE4use", "Mause", "M\xE4user", "Mausen"], "Aus au wird \xE4u: Maus \u2013 M\xE4use, Haus \u2013 H\xE4user."],
  [2, "sprache", "\u{1F436}", "Welches Wort ist ein Nomen?", ["Hund", "laufen", "schnell", "und"], "Nomen schreibt man gro\xDF, und man kann der, die oder das davorsetzen."],
  [3, "sprache", "\u{1F415}", "Was hei\xDFt \u201Edog\u201C auf Deutsch?", ["Hund", "Katze", "Vogel", "Pferd"], "Und \u201Ecat\u201C hei\xDFt Katze."],
  [3, "sprache", "\u{1F64F}", "Was hei\xDFt \u201EThank you\u201C?", ["Danke", "Bitte", "Hallo", "Tsch\xFCss"], "Auf Franz\xF6sisch sagt man \u201EMerci\u201C."],
  [3, "sprache", "\u{1F535}", "Was hei\xDFt \u201Eblue\u201C auf Deutsch?", ["blau", "gelb", "gr\xFCn", "braun"], "Red ist rot, green ist gr\xFCn, yellow ist gelb."],
  [4, "sprache", "\u{1F1EB}\u{1F1F7}", "Was hei\xDFt \u201EBonjour\u201C?", ["Guten Tag", "Gute Nacht", "Danke", "Tsch\xFCss"], "Helena lernt Franz\xF6sisch \u2013 frag sie mal nach mehr W\xF6rtern!"],
  // ---------- Erfinder & Geschichte ----------
  [2, "wissen", "\u{1F3F0}", "Wer lebte fr\xFCher auf einer Burg?", ["Ritter und Burgherren", "Astronauten", "Piraten auf Schiffen", "Dinosaurier"], "Burgen hatten dicke Mauern, damit Feinde nicht hineinkamen."],
  [2, "wissen", "\u{1F996}", "Welcher Dinosaurier hatte sehr kurze Arme und fra\xDF Fleisch?", ["Tyrannosaurus Rex", "Brachiosaurus", "Triceratops", "Stegosaurus"], "Der Brachiosaurus war ein langhalsiger Pflanzenfresser."],
  [3, "wissen", "\u{1F315}", "Wer war der erste Mensch auf dem Mond?", ["Neil Armstrong", "Juri Gagarin", "Albert Einstein", "Christoph Kolumbus"], "Das war 1969. Juri Gagarin war der erste Mensch im Weltall."],
  [3, "wissen", "\u{1F3B9}", "Welcher ber\xFChmte Komponist konnte sp\xE4ter nicht mehr h\xF6ren?", ["Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Michael Jackson"], "Beethoven komponierte weiter, obwohl er taub war \u2013 die Musik hatte er im Kopf."],
  [4, "wissen", "\u{1F4A1}", "Wer machte die Gl\xFChbirne ber\xFChmt und verkaufte sie an alle?", ["Thomas Edison", "Albert Einstein", "Isaac Newton", "Leonardo da Vinci"], "Andere hatten schon vor ihm daran get\xFCftelt \u2013 Edison machte sie haltbar und bekannt."],
  [4, "wissen", "\u{1F697}", "Aus welchem Land kommt das erste Auto mit Benzinmotor?", ["Deutschland", "USA", "Japan", "Frankreich"], "Carl Benz baute es 1886. Bertha Benz fuhr damit die erste lange Autofahrt."],
  [5, "wissen", "\u{1F5BC}\uFE0F", "Wer malte die Mona Lisa?", ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Albrecht D\xFCrer"], "Albrecht D\xFCrer war \xFCbrigens aus N\xFCrnberg \u2013 gleich neben F\xFCrth."],
  [5, "wissen", "\u{1F4D6}", "Wer erfand in Europa den Buchdruck mit beweglichen Buchstaben?", ["Johannes Gutenberg", "Martin Luther", "Carl Benz", "Galileo Galilei"], "Vorher wurden B\xFCcher mit der Hand abgeschrieben."],
  [5, "wissen", "\u{1F9F1}", "In welchem Jahr fiel die Berliner Mauer?", ["1989", "1945", "2001", "1969"], "Danach wurden Ost- und Westdeutschland wieder ein Land."]
];

// ../duell/rechnen.js
function z(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}
__name(z, "z");
function ablenker(r, extra) {
  var k = (extra || []).concat([r + 1, r - 1, r + 2, r - 2, r + 10, r - 10]);
  var gut = [];
  k.forEach(function(x) {
    if (x >= 0 && x !== r && gut.indexOf(x) < 0 && gut.length < 3) gut.push(x);
  });
  return gut;
}
__name(ablenker, "ablenker");
function rechenFrage(klasse) {
  var k = Math.max(1, Math.min(klasse || 1, 7)), a, b, r, text, sprich, extra = [], info;
  var art = Math.random();
  if (k === 1) {
    if (art < 0.5) {
      a = z(2, 9);
      b = z(1, 10 - a);
      r = a + b;
      text = a + " + " + b;
      sprich = a + " plus " + b;
    } else {
      a = z(5, 10);
      b = z(1, a - 1);
      r = a - b;
      text = a + " \u2212 " + b;
      sprich = a + " minus " + b;
      extra = [a + b];
    }
    info = "Tipp: Rechne mit den Fingern \u2013 bis 10 reichen zwei H\xE4nde.";
  } else if (k === 2) {
    if (art < 0.3) {
      a = z(4, 9);
      b = z(11 - a, 9);
      r = a + b;
      text = a + " + " + b;
      sprich = a + " plus " + b;
      info = "\xDCber die 10: " + a + " + " + (10 - a) + " = 10, dann noch " + (b - (10 - a)) + ".";
    } else if (art < 0.5) {
      a = z(11, 18);
      b = z(a - 9, 9);
      r = a - b;
      text = a + " \u2212 " + b;
      sprich = a + " minus " + b;
      extra = [a + b];
      info = "Erst bis zur 10 zur\xFCck, dann weiter.";
    } else if (art < 0.8) {
      a = [2, 5, 10][z(0, 2)];
      b = z(2, 10);
      r = a * b;
      text = b + " \xD7 " + a;
      sprich = b + " mal " + a;
      extra = [a + b, r + a];
      info = b + " \xD7 " + a + " hei\xDFt: " + b + "-mal die " + a + ".";
    } else {
      a = z(3, 12);
      r = a + a;
      text = a + " + " + a;
      sprich = a + " plus " + a;
      info = "Das ist das Doppelte von " + a + ".";
    }
  } else if (k === 3) {
    if (art < 0.5) {
      a = z(3, 9);
      b = z(3, 9);
      r = a * b;
      text = a + " \xD7 " + b;
      sprich = a + " mal " + b;
      extra = [a + b, r + a, r - b];
      info = "Einmaleins: " + a + " \xD7 " + b + " = " + r + ".";
    } else if (art < 0.75) {
      b = z(2, 9);
      r = z(2, 9);
      a = b * r;
      text = a + " : " + b;
      sprich = a + " geteilt durch " + b;
      extra = [r + 1, a - b];
      info = "Umkehraufgabe: " + r + " \xD7 " + b + " = " + a + ".";
    } else {
      a = z(21, 68);
      b = z(11, 99 - a);
      r = a + b;
      text = a + " + " + b;
      sprich = a + " plus " + b;
      extra = [r + 10, r - 10];
      info = "Erst die Zehner, dann die Einer.";
    }
  } else if (k === 4) {
    if (art < 0.4) {
      a = z(6, 12);
      b = z(6, 12);
      r = a * b;
      text = a + " \xD7 " + b;
      sprich = a + " mal " + b;
      extra = [r + a, r - b];
      info = a + " \xD7 " + b + " = " + r + ".";
    } else if (art < 0.7) {
      a = z(12, 48) * 10;
      b = z(11, 45) * 10;
      r = a + b;
      text = a + " + " + b;
      sprich = a + " plus " + b;
      extra = [r + 100, r - 100];
      info = "Mit Zehnern rechnen wie mit Einern.";
    } else {
      a = z(2, 9);
      b = [10, 100][z(0, 1)];
      r = a * b * z(1, 9);
      a = r / b;
      text = a + " \xD7 " + b;
      sprich = a + " mal " + b;
      extra = [r * 10, r / 10 | 0];
      info = "Mal " + b + ": " + (b === 10 ? "eine Null" : "zwei Nullen") + " anh\xE4ngen.";
    }
  } else {
    if (art < 0.35) {
      a = [50, 25, 10][z(0, 2)];
      b = z(2, 20) * (a === 25 ? 4 : a === 10 ? 10 : 2);
      r = b * a / 100;
      text = a + " % von " + b;
      sprich = a + " Prozent von " + b;
      extra = [b - r, r * 2];
      info = a + " % sind " + (a === 50 ? "die H\xE4lfte" : a === 25 ? "ein Viertel" : "ein Zehntel") + ".";
    } else if (art < 0.7) {
      a = z(-9, -1);
      b = z(2, 12);
      r = a + b;
      text = "(" + a + ") + " + b;
      sprich = "minus " + -a + " plus " + b;
      extra = [-r, b - a];
      info = "Auf dem Zahlenstrahl von " + a + " um " + b + " nach rechts.";
    } else {
      a = z(11, 19);
      r = a * a;
      text = a + "\xB2";
      sprich = a + " hoch 2";
      extra = [a * 2, r + a];
      info = a + "\xB2 = " + a + " \xD7 " + a + ".";
    }
  }
  var falsch = ablenker(r, extra);
  return [k, "rechnen", "\u{1F522}", text + " = ?", [String(r)].concat(falsch.map(String)), info, sprich];
}
__name(rechenFrage, "rechenFrage");

// src/index.js
var MAX_SPIELER = 8;
var NACH_ERSTEM_MS = 3e3;
var AUFLOESUNG_MS = 7e3;
var AUFRAEUMEN_MS = 2 * 60 * 60 * 1e3;
var src_default = {
  // Direkter Zugang (zum Testen). In der Lernwelt geht es ueber /api/duell.
  async fetch(request, env) {
    const url = new URL(request.url);
    const code = (url.searchParams.get("raum") || "").replace(/\D/g, "");
    if (code.length !== 4) return new Response("Raum-Code fehlt", { status: 400 });
    return env.DUELL.get(env.DUELL.idFromName(code)).fetch(request);
  }
};
function mische(f) {
  for (let i = f.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [f[i], f[j]] = [f[j], f[i]];
  }
  return f;
}
__name(mische, "mische");
function sauber(t, n) {
  return String(t || "").replace(/[<>"'`\\]/g, "").replace(/\s+/g, " ").trim().slice(0, n);
}
__name(sauber, "sauber");
var DuellRaum = class {
  static {
    __name(this, "DuellRaum");
  }
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.s = null;
    ctx.blockConcurrencyWhile(async () => {
      this.s = await ctx.storage.get("zustand") || null;
    });
  }
  leer(code) {
    return { code, phase: "lobby", host: null, anzahl: 10, spieler: {}, runde: null, erstellt: Date.now() };
  }
  async sichern() {
    await this.ctx.storage.put("zustand", this.s);
  }
  async fetch(request) {
    const url = new URL(request.url);
    const code = (url.searchParams.get("raum") || "").replace(/\D/g, "");
    if (!this.s) this.s = this.leer(code);
    if (request.headers.get("Upgrade") !== "websocket") {
      const sockets = this.ctx.getWebSockets().length;
      return Response.json(
        { ok: true, phase: this.s.phase, spieler: Object.keys(this.s.spieler).length, verbunden: sockets },
        { headers: { "cache-control": "no-store", "access-control-allow-origin": "*" } }
      );
    }
    if (this.ctx.getWebSockets().length >= MAX_SPIELER * 2) return new Response("Raum voll", { status: 429 });
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }
  // ---------- Nachrichten ----------
  async webSocketMessage(ws, roh) {
    if (typeof roh !== "string" || roh.length > 4e3) return;
    let m;
    try {
      m = JSON.parse(roh);
    } catch (e) {
      return;
    }
    const id = ws.deserializeAttachment()?.id;
    if (m.t === "hallo") return this.hallo(ws, m);
    if (!id || !this.s.spieler[id]) return;
    if (m.t === "einstellung" && id === this.s.host && this.s.phase === "lobby") {
      const n = +m.anzahl;
      if ([5, 10, 15].includes(n)) this.s.anzahl = n;
      await this.sichern();
      return this.alleSenden(this.raumBild());
    }
    if (m.t === "start" && id === this.s.host && (this.s.phase === "lobby" || this.s.phase === "ende")) return this.start();
    if (m.t === "antwort") return this.antwort(id, m);
    if (m.t === "zurLobby" && id === this.s.host && this.s.phase === "ende") {
      this.s.phase = "lobby";
      this.s.runde = null;
      for (const sp of Object.values(this.s.spieler)) sp.punkte = 0;
      await this.sichern();
      return this.alleSenden(this.raumBild());
    }
  }
  async hallo(ws, m) {
    const id = sauber(m.id, 40);
    if (!id) return;
    const neu = !this.s.spieler[id];
    if (neu && Object.keys(this.s.spieler).length >= MAX_SPIELER) {
      ws.send(JSON.stringify({ t: "fehler", text: "Der Raum ist voll \u2013 h\xF6chstens " + MAX_SPIELER + " Spieler." }));
      return ws.close(4e3, "voll");
    }
    const klasse = Math.max(0, Math.min(13, parseInt(m.klasse, 10) || 0));
    const alter = Math.max(3, Math.min(99, parseInt(m.alter, 10) || 7));
    const alt = this.s.spieler[id] || { punkte: 0 };
    this.s.spieler[id] = {
      name: sauber(m.name, 14) || "Spieler",
      avatar: sauber(m.avatar, 8) || "\u{1F642}",
      klasse,
      alter,
      punkte: alt.punkte || 0,
      gesehen: Array.isArray(m.gesehen) ? m.gesehen.filter((x) => typeof x === "string").slice(-80) : alt.gesehen || []
    };
    if (!this.s.host || !this.s.spieler[this.s.host]) this.s.host = id;
    ws.serializeAttachment({ id });
    await this.sichern();
    await this.ctx.storage.deleteAlarm().catch(() => {
    });
    if (this.s.phase === "frage" || this.s.phase === "aufloesung") await this.weckerStellen();
    ws.send(JSON.stringify({ t: "du", id }));
    this.alleSenden(this.raumBild());
    if (this.s.phase === "frage") ws.send(JSON.stringify(this.frageBild()));
    if (this.s.phase === "aufloesung") ws.send(JSON.stringify(this.aufloesungBild()));
  }
  verbundeneIds() {
    return new Set(this.ctx.getWebSockets().map((w) => w.deserializeAttachment()?.id).filter(Boolean));
  }
  raumBild() {
    const online = this.verbundeneIds();
    const liste = Object.entries(this.s.spieler).map(([id, sp]) => ({
      id,
      name: sp.name,
      avatar: sp.avatar,
      klasse: sp.klasse,
      alter: sp.alter,
      punkte: sp.punkte,
      online: online.has(id)
    }));
    return {
      t: "raum",
      code: this.s.code,
      phase: this.s.phase,
      host: this.s.host,
      anzahl: this.s.anzahl,
      stufe: this.stufe(),
      spieler: liste
    };
  }
  // Die Fragen richten sich nach dem juengsten verbundenen Mitspieler.
  stufe() {
    const online = this.verbundeneIds();
    const klassen = Object.entries(this.s.spieler).filter(([id]) => online.has(id)).map(([, sp]) => sp.klasse);
    if (!klassen.length) return 1;
    return Math.max(1, Math.min(...klassen));
  }
  // ---------- Spiel ----------
  async start() {
    const stufe = this.stufe();
    const gesehen = /* @__PURE__ */ new Set();
    Object.values(this.s.spieler).forEach((sp) => (sp.gesehen || []).forEach((g) => gesehen.add(g)));
    const passend = FRAGEN.map((f, i) => ({ f, i })).filter(({ f }) => f[0] <= stufe);
    const pool = mische(passend.filter(({ i }) => !gesehen.has("f" + i))).concat(mische(passend.filter(({ i }) => gesehen.has("f" + i))));
    const n = this.s.anzahl;
    const rechnenAnzahl = Math.round(n * 0.3);
    const wissen = [];
    let letzteKat = "";
    for (let durchgang = 0; durchgang < 2 && wissen.length < n - rechnenAnzahl; durchgang++) {
      for (const eintrag of pool) {
        if (wissen.length >= n - rechnenAnzahl) break;
        if (wissen.includes(eintrag)) continue;
        if (durchgang === 0 && eintrag.f[1] === letzteKat) continue;
        wissen.push(eintrag);
        letzteKat = eintrag.f[1];
      }
    }
    const liste = wissen.map(({ f, i }) => ({ f, key: "f" + i }));
    for (let r = 0; r < rechnenAnzahl; r++) liste.splice(Math.floor(Math.random() * (liste.length + 1)), 0, { f: rechenFrage(stufe), key: null });
    const fragen = liste.slice(0, n).map(({ f, key }) => {
      const antworten = mische(f[4].slice());
      return { key, kat: f[1], bild: f[2], text: f[3], sprechen: f[6] ? f[6] + "?" : f[3], antworten, richtig: antworten.indexOf(f[4][0]), info: f[5] };
    });
    for (const sp of Object.values(this.s.spieler)) sp.punkte = 0;
    this.s.runde = { fragen, n: -1, stufe };
    this.s.phase = "frage";
    await this.naechsteFrage();
  }
  async naechsteFrage() {
    const r = this.s.runde;
    r.n++;
    if (r.n >= r.fragen.length) return this.ende();
    const f = r.fragen[r.n];
    const jetzt = Date.now();
    const lesen = Math.max(2200, Math.min(5500, 1400 + f.text.length * 45));
    const dauer = r.stufe <= 2 ? 25e3 : 2e4;
    r.frage = { freiAb: jetzt + lesen, bis: jetzt + lesen + dauer, antworten: {}, ersterRichtig: null, schlussUm: null };
    this.s.phase = "frage";
    await this.sichern();
    await this.weckerStellen();
    this.alleSenden(this.frageBild());
  }
  frageBild() {
    const r = this.s.runde, f = r.fragen[r.n], q = r.frage;
    return {
      t: "frage",
      n: r.n + 1,
      von: r.fragen.length,
      kat: f.kat,
      bild: f.bild,
      text: f.text,
      sprechen: f.sprechen,
      antworten: f.antworten,
      freiIn: Math.max(0, q.freiAb - Date.now()),
      zeit: Math.max(0, q.bis - Date.now()),
      beantwortet: Object.keys(q.antworten),
      ersterDa: !!q.ersterRichtig
    };
  }
  async antwort(id, m) {
    const r = this.s.runde;
    if (this.s.phase !== "frage" || !r || +m.n !== r.n + 1) return;
    const q = r.frage, jetzt = Date.now();
    if (jetzt < q.freiAb || q.antworten[id]) return;
    const wahl = parseInt(m.wahl, 10);
    const f = r.fragen[r.n];
    if (!(wahl >= 0 && wahl < f.antworten.length)) return;
    const richtig = wahl === f.richtig;
    const ms = jetzt - q.freiAb;
    q.antworten[id] = { wahl, ms, richtig };
    if (richtig) {
      if (!q.ersterRichtig) {
        q.ersterRichtig = id;
        this.s.spieler[id].punkte += 3;
        q.schlussUm = Math.min(q.bis, jetzt + NACH_ERSTEM_MS);
      } else {
        this.s.spieler[id].punkte += 1;
      }
    }
    const online = this.verbundeneIds();
    const alleDa = [...online].filter((sid) => this.s.spieler[sid]).every((sid) => q.antworten[sid]);
    await this.sichern();
    if (alleDa) return this.aufloesen();
    await this.weckerStellen();
    this.alleSenden({
      t: "stand",
      beantwortet: Object.keys(q.antworten),
      ersterDa: !!q.ersterRichtig,
      schlussIn: q.schlussUm ? Math.max(0, q.schlussUm - jetzt) : null
    });
  }
  async aufloesen() {
    this.s.phase = "aufloesung";
    this.s.runde.aufloesungBis = Date.now() + AUFLOESUNG_MS;
    await this.sichern();
    await this.weckerStellen();
    this.alleSenden(this.aufloesungBild());
  }
  aufloesungBild() {
    const r = this.s.runde, f = r.fragen[r.n], q = r.frage;
    const antworten = Object.entries(q.antworten).map(([id, a]) => ({ id, wahl: a.wahl, ms: a.ms, richtig: a.richtig }));
    return {
      t: "aufloesung",
      n: r.n + 1,
      von: r.fragen.length,
      richtig: f.richtig,
      info: f.info,
      erster: q.ersterRichtig,
      antworten,
      punkte: Object.fromEntries(Object.entries(this.s.spieler).map(([id, sp]) => [id, sp.punkte])),
      weiterIn: Math.max(0, (r.aufloesungBis || Date.now()) - Date.now()),
      frageKey: f.key
    };
  }
  async ende() {
    this.s.phase = "ende";
    const tabelle = Object.entries(this.s.spieler).map(([id, sp]) => ({ id, name: sp.name, avatar: sp.avatar, punkte: sp.punkte })).sort((a, b) => b.punkte - a.punkte);
    const keys = this.s.runde.fragen.map((f) => f.key).filter(Boolean);
    await this.sichern();
    await this.ctx.storage.deleteAlarm().catch(() => {
    });
    this.alleSenden({ t: "ende", tabelle, gesehen: keys });
    this.alleSenden(this.raumBild());
  }
  // ---------- Wecker ----------
  async weckerStellen() {
    let wann = null;
    if (this.s.phase === "frage") {
      const q = this.s.runde.frage;
      wann = q.schlussUm ? Math.min(q.schlussUm, q.bis) : q.bis;
    }
    if (this.s.phase === "aufloesung") wann = this.s.runde.aufloesungBis;
    if (wann) await this.ctx.storage.setAlarm(wann);
  }
  async alarm() {
    if (!this.s) this.s = await this.ctx.storage.get("zustand") || null;
    if (!this.s) return;
    const jetzt = Date.now();
    if (this.s.phase === "frage") {
      const q = this.s.runde.frage;
      const schluss = q.schlussUm ? Math.min(q.schlussUm, q.bis) : q.bis;
      if (jetzt + 50 >= schluss) return this.aufloesen();
      return this.weckerStellen();
    }
    if (this.s.phase === "aufloesung") {
      if (jetzt + 50 >= this.s.runde.aufloesungBis) {
        this.s.phase = "frage";
        return this.naechsteFrage();
      }
      return this.weckerStellen();
    }
    if (this.ctx.getWebSockets().length === 0 && jetzt - (this.s.zuletzt || 0) >= AUFRAEUMEN_MS - 1e3) {
      await this.ctx.storage.deleteAll();
      this.s = null;
    }
  }
  async webSocketClose(ws) {
    await this.weg(ws);
  }
  async webSocketError(ws) {
    await this.weg(ws);
  }
  async weg(ws) {
    try {
      ws.close(1e3, "tschuess");
    } catch (e) {
    }
    if (!this.s) return;
    this.s.zuletzt = Date.now();
    const uebrig = this.ctx.getWebSockets().filter((w) => w !== ws && w.readyState === 1);
    if (uebrig.length === 0 && (this.s.phase === "lobby" || this.s.phase === "ende")) {
      await this.sichern();
      await this.ctx.storage.setAlarm(Date.now() + AUFRAEUMEN_MS);
      return;
    }
    const online = new Set(uebrig.map((w) => w.deserializeAttachment()?.id).filter(Boolean));
    if (this.s.host && !online.has(this.s.host)) {
      const neu = [...online].find((id) => this.s.spieler[id]);
      if (neu) this.s.host = neu;
    }
    await this.sichern();
    for (const w of uebrig) {
      try {
        w.send(JSON.stringify(this.raumBild()));
      } catch (e) {
      }
    }
  }
  alleSenden(obj) {
    const text = JSON.stringify(obj);
    for (const w of this.ctx.getWebSockets()) {
      try {
        w.send(text);
      } catch (e) {
      }
    }
  }
};

// ../../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-z93iS0/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-z93iS0/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  DuellRaum,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
