/* Generalprobe "D | Lesen" fuer Paul (04.10.2026).
 *
 * Anlass: Probe "D | Lesen" am Freitag, 09.10.2026. Die Aufgabenformen sind
 * die von Pauls Uebungsblatt (25.09.2026) - ganze Saetze mit Zeile,
 * Reihenfolge, Anfang ergaenzen, ankreuzen, unterstreichen, Wort aus dem Text,
 * Meinung begruenden. Die GESCHICHTEN sind selbst geschrieben; der Text seines
 * Blatts wird nicht uebernommen und nicht nacherzaehlt. Alle Namen erfunden.
 *
 * Eine Zeile = ein Satz, damit "Unterstreiche den Satz" ein Tipp auf die Zeile ist.
 * Neue Geschichten HINTEN anhaengen, nie eine id aendern (localStorage merkt sie).
 * Pruefen:  node pruefe-generalprobe.mjs
 *
 * Aufgaben (genau sieben, in dieser Reihenfolge):
 *  frage          ganzer Satz + Zeile. Zeile wird geprueft, der Satz geht an die Werkstatt.
 *  reihenfolge    Ereignisse in Textreihenfolge (je mit zeile); angezeigt gemischt.
 *  anfang         ersten Satz ergaenzen - Werkstatt.
 *  kreuz          optionen, richtig = Index. Ablenker sind aehnliche Namen.
 *  unterstreichen zeilen = die richtigen Saetze.
 *  einsetzen      satz mit <u>alt</u>, wort steht in zeile.
 *  meinung        begruenden - Werkstatt.
 */
window.GENERALPROBE = [
  {
    id: "drachen",
    titel: "Der Drachen auf dem Garagendach",
    zeilen: [
      "Am Samstag wehte ein kräftiger Wind über die Siedlung.",
      "Jonas holte seinen roten Drachen aus dem Keller.",
      "Seine Schwester Merle wollte unbedingt mitkommen.",
      "Auf der Wiese hinter den Garagen ließen sie die Schnur langsam laufen.",
      "Der Drachen stieg höher und höher.",
      "Plötzlich kam eine starke Böe von der Seite.",
      "Die Schnur rutschte Jonas aus der Hand.",
      "Der Drachen trudelte und landete auf dem Dach der letzten Garage.",
      "„So ein Mist!“, rief Jonas und stampfte mit dem Fuß auf.",
      "Merle sah sich um und entdeckte Herrn Brodersen in seinem Garten.",
      "Herr Brodersen wohnte neben den Garagen und hatte eine lange Leiter.",
      "Merle klingelte an seinem Tor, obwohl ihr Herz ein bisschen klopfte.",
      "Herr Brodersen lachte und holte sofort die Leiter aus dem Schuppen.",
      "Vorsichtig stieg er hinauf und reichte den Drachen herunter.",
      "Eine Ecke war eingerissen, aber sonst war alles heil.",
      "Zu Hause klebten die Kinder das Loch mit buntem Klebeband zu.",
      "Am Abend bastelte Merle eine kleine Karte für den Nachbarn.",
      "Sie malte einen roten Drachen mit einem bunten Pflaster darauf.",
      "Jonas schrieb darunter mit seiner schönsten Schrift: „Danke für die Rettung!“",
      "Am nächsten Morgen steckten sie die Karte in seinen Briefkasten.",
      "Seitdem winkt Herr Brodersen jedes Mal, wenn der Drachen am Himmel steht."
    ],
    aufgaben: [
      { art: "frage", frage: "Wer holte den Drachen vom Dach?", zeilen: [13, 14], hinweis: [10, 14] },
      { art: "reihenfolge", ereignisse: [
        { text: "Jonas holt den Drachen aus dem Keller.", zeile: 2 },
        { text: "Die Schnur rutscht Jonas aus der Hand.", zeile: 7 },
        { text: "Merle klingelt beim Nachbarn.", zeile: 12 },
        { text: "Die Kinder kleben das Loch zu.", zeile: 16 },
        { text: "Die Kinder stecken die Karte in den Briefkasten.", zeile: 20 } ] },
      { art: "anfang", auftrag: "Merle schreibt Herrn Brodersen ein paar Zeilen auf die Karte. Wie könnte sie anfangen? Ergänze den ersten Satz!", anfang: "Lieber Herr Brodersen," },
      { art: "kreuz", frage: "Wie heißt der Nachbar?", optionen: ["Herr Brodersen", "Herr Brodmann", "Herr Broderich"], richtig: 0, hinweis: [10, 11] },
      { art: "unterstreichen", auftrag: "Tippe die Sätze an, die verraten, dass der Wind stark war.", zeilen: [1, 6], hinweis: [1, 6] },
      { art: "einsetzen", satz: "Der Drachen <u>fiel</u> auf das Dach der letzten Garage.", wort: "landete", zeile: 8 },
      { art: "meinung", frage: "War es richtig, dass Merle beim Nachbarn geklingelt hat? Schreibe deine Meinung in einem ganzen Satz." }
    ]
  },
  {
    id: "igel",
    titel: "Löcher im Gemüsebeet",
    zeilen: [
      "In Lottas Garten wuchsen Möhren, Bohnen und große Kürbisse.",
      "Jeden Morgen goss sie die Beete mit ihrer grünen Gießkanne.",
      "Eines Tages entdeckte sie kleine Löcher in der Erde.",
      "Zwei Möhren lagen ausgegraben neben dem Beet.",
      "„Wer war das?“, fragte Lotta ihren Onkel Bertram.",
      "Onkel Bertram zuckte mit den Schultern und schmunzelte.",
      "„Vielleicht war es die Katze Pünktchen von nebenan“, meinte er.",
      "Lotta glaubte das nicht, denn Pünktchen mochte keine Erde an den Pfoten.",
      "Am Abend stellte sie eine alte Kamera ans Fenster.",
      "Die Kamera machte jede Minute ein Foto vom Beet.",
      "Am nächsten Morgen sah sich Lotta alle Bilder genau an.",
      "Auf einem Foto war ein kleiner, runder Schatten zu erkennen.",
      "Auf dem nächsten Bild sah sie eine spitze Nase und viele Stacheln.",
      "„Ein Igel!“, rief Lotta und lachte laut.",
      "Onkel Bertram erklärte ihr, dass Igel am liebsten Käfer und Schnecken fressen.",
      "An den Möhren hatte der Igel nur geschnuppert.",
      "Die Löcher hatte er beim Suchen nach Würmern gegraben.",
      "Lotta baute ihm aus Laub und Zweigen ein Haus unter der Hecke.",
      "Auf ein Holzschild schrieb sie mit dicken Buchstaben das Wort „Igelhotel“.",
      "Seitdem schaut sie jeden Abend ganz leise aus dem Fenster in den Garten."
    ],
    aufgaben: [
      { art: "frage", frage: "Womit fand Lotta heraus, wer nachts im Garten war?", zeilen: [9, 10], hinweis: [9, 11] },
      { art: "reihenfolge", ereignisse: [
        { text: "Lotta entdeckt Löcher in der Erde.", zeile: 3 },
        { text: "Lotta stellt eine Kamera ans Fenster.", zeile: 9 },
        { text: "Auf einem Bild sieht sie Stacheln.", zeile: 13 },
        { text: "Onkel Bertram erklärt, was Igel fressen.", zeile: 15 },
        { text: "Lotta baut ein Haus unter der Hecke.", zeile: 18 } ] },
      { art: "anfang", auftrag: "Lotta schreibt ihrer Freundin eine Nachricht über ihren Gast im Garten. Ergänze den ersten Satz!", anfang: "Liebe Ida," },
      { art: "kreuz", frage: "Wie heißt die Katze von nebenan?", optionen: ["Punkti", "Pünktchen", "Pünktli"], richtig: 1, hinweis: [7, 8] },
      { art: "unterstreichen", auftrag: "Tippe die Sätze an, die verraten, dass Lotta den Igel gern hat.", zeilen: [18, 20], hinweis: [17, 20] },
      { art: "einsetzen", satz: "Jeden Morgen <u>bewässerte</u> sie die Beete.", wort: "goss", zeile: 2 },
      { art: "meinung", frage: "Soll Lotta dem Igel Futter hinstellen oder ihn in Ruhe lassen? Schreibe deine Meinung in einem ganzen Satz." }
    ]
  },
  {
    id: "schluessel",
    titel: "Der Schlüssel im Schnee",
    zeilen: [
      "An einem kalten Morgen lag überall frischer Schnee.",
      "Finn sollte vor der Schule noch schnell Brötchen beim Bäcker holen.",
      "Seine Mutter gab ihm den Haustürschlüssel und ein paar Münzen.",
      "Auf dem Weg baute Finn mit seinem Freund Malik eine kleine Schneeburg.",
      "Sie warfen Schneebälle und lachten, bis ihre Finger rot waren.",
      "Beim Bäcker griff Finn in seine Jackentasche.",
      "Die Münzen waren da, doch der Schlüssel fehlte.",
      "Finn wurde ganz heiß, obwohl es draußen so kalt war.",
      "„Wir suchen ihn zusammen“, sagte Malik sofort.",
      "Die beiden liefen zurück zu ihrer Schneeburg.",
      "Sie suchten zuerst im Schnee rund um die kleine Mauer.",
      "Malik schob den Schnee mit seinen Handschuhen zur Seite.",
      "Finn kniete sich hin und tastete jeden Schneeball ab.",
      "Plötzlich klirrte etwas ganz leise.",
      "In einem halb zerbrochenen Schneeball steckte der Schlüssel.",
      "Finn jubelte so laut, dass eine Amsel aus dem Busch flatterte.",
      "Danach rannten die Jungen zum Bäcker und kauften die Brötchen.",
      "Zu Hause erzählte Finn seiner Mutter die ganze Geschichte.",
      "Sie lächelte und nähte ihm einen großen Knopf an die Tasche.",
      "Seitdem knöpft Finn die Tasche immer zu, bevor er im Schnee spielt."
    ],
    aufgaben: [
      { art: "frage", frage: "Wo fanden die Jungen den Schlüssel?", zeilen: [15], hinweis: [13, 15] },
      { art: "reihenfolge", ereignisse: [
        { text: "Die Mutter gibt Finn den Schlüssel.", zeile: 3 },
        { text: "Finn und Malik bauen eine Schneeburg.", zeile: 4 },
        { text: "Beim Bäcker fehlt der Schlüssel.", zeile: 7 },
        { text: "Malik schiebt den Schnee zur Seite.", zeile: 12 },
        { text: "Die Jungen kaufen die Brötchen.", zeile: 17 } ] },
      { art: "anfang", auftrag: "Finn schreibt Malik am Abend eine Nachricht. Ergänze den ersten Satz!", anfang: "Lieber Malik," },
      { art: "kreuz", frage: "Wie heißt Finns Freund?", optionen: ["Malte", "Malik", "Mailo"], richtig: 1, hinweis: [4, 4] },
      { art: "unterstreichen", auftrag: "Tippe die Sätze an, die verraten, dass Malik ein guter Freund ist.", zeilen: [9, 12], hinweis: [9, 12] },
      { art: "einsetzen", satz: "Finn kniete sich hin und <u>befühlte</u> jeden Schneeball.", wort: "tastete", zeile: 13 },
      { art: "meinung", frage: "Was glaubst du: Was wollte die Mutter mit dem Knopf an der Tasche erreichen? Antworte in einem ganzen Satz." }
    ]
  },
  {
    id: "floete",
    titel: "Hanna und die Flöte",
    zeilen: [
      "In zwei Wochen sollte in der Schule ein großes Konzert stattfinden.",
      "Hanna durfte dort zum ersten Mal auf ihrer Flöte vorspielen.",
      "Jeden Nachmittag übte sie das Lied vom Abendwind.",
      "Ihr kleiner Bruder Theo hielt sich dabei manchmal die Ohren zu.",
      "Am Tag des Konzerts zitterten Hannas Hände.",
      "Die Aula war voll mit Eltern, Großeltern und Lehrern.",
      "Hinter dem Vorhang flüsterte ihre Lehrerin Frau Albers: „Du schaffst das.“",
      "Dann ging Hanna mit ihrer Flöte auf die Bühne.",
      "Beim ersten Ton quietschte die Flöte schrecklich.",
      "Ein paar Kinder in der ersten Reihe kicherten.",
      "Hanna wäre am liebsten von der Bühne gelaufen.",
      "Da entdeckte sie Theo, der ihr beide Daumen nach oben zeigte.",
      "Hanna atmete tief ein und begann noch einmal von vorn.",
      "Diesmal klang jeder Ton klar und sauber.",
      "Am Ende klatschten alle Leute in der Aula laut.",
      "Frau Albers schenkte ihr eine kleine Sonnenblume.",
      "Auf dem Heimweg fragte Theo, ob er auch Flöte lernen dürfe.",
      "Hanna lachte und versprach, ihm die ersten Töne zu zeigen.",
      "Am Abend schrieb sie in ihr Tagebuch über diesen aufregenden Tag.",
      "Unter den Eintrag klebte sie ein gelbes Blütenblatt der Sonnenblume."
    ],
    aufgaben: [
      { art: "frage", frage: "Was gab Hanna den Mut, noch einmal anzufangen?", zeilen: [12], hinweis: [11, 13] },
      { art: "reihenfolge", ereignisse: [
        { text: "Hanna darf beim Konzert vorspielen.", zeile: 2 },
        { text: "Frau Albers macht Hanna Mut.", zeile: 7 },
        { text: "Die Flöte quietscht.", zeile: 9 },
        { text: "Hanna beginnt noch einmal von vorn.", zeile: 13 },
        { text: "Hanna bekommt eine Sonnenblume.", zeile: 16 } ] },
      { art: "anfang", auftrag: "Hanna schreibt am Abend in ihr Tagebuch. Ergänze den ersten Satz!", anfang: "Liebes Tagebuch," },
      { art: "kreuz", frage: "Wie heißt Hannas Lehrerin?", optionen: ["Frau Albrecht", "Frau Alberts", "Frau Albers"], richtig: 2, hinweis: [7, 7] },
      { art: "unterstreichen", auftrag: "Tippe die Sätze an, die verraten, dass Hanna aufgeregt war.", zeilen: [5, 11], hinweis: [5, 11] },
      { art: "einsetzen", satz: "Beim ersten Ton <u>pfiff</u> die Flöte schrecklich.", wort: "quietschte", zeile: 9 },
      { art: "meinung", frage: "Was hättest du an Hannas Stelle gemacht, als die Kinder kicherten? Antworte in einem ganzen Satz." }
    ]
  },
  {
    id: "radtour",
    titel: "Ausflug zum Waldsee",
    zeilen: [
      "Am Sonntag wollte Familie Weber mit dem Fahrrad zum Waldsee fahren.",
      "Mila packte Äpfel, Wasser und eine Decke in ihren Rucksack.",
      "Ihr Vater prüfte vorher bei allen Rädern die Bremsen und das Licht.",
      "Bei Milas Rad war der Hinterreifen fast platt.",
      "Zum Glück hatte der Vater eine Luftpumpe dabei.",
      "Nach einer halben Stunde ging es endlich los.",
      "Der Weg führte über eine Brücke und dann an einem Bach entlang.",
      "An einer Kreuzung hielt Mila an und schaute nach links und rechts.",
      "Ein Traktor kam langsam um die Ecke.",
      "Der Fahrer hob die Hand und ließ die Familie zuerst fahren.",
      "Kurz vor dem See begann es plötzlich zu regnen.",
      "Alle stellten sich unter eine große, dichte Buche.",
      "Milas kleiner Bruder Ben war enttäuscht und schmollte.",
      "Mila holte die Äpfel aus dem Rucksack und verteilte sie.",
      "Nach zehn Minuten hörte der Regen wieder auf.",
      "Am See schien sogar die Sonne durch die Wolken.",
      "Die Kinder ließen flache Steine über das Wasser hüpfen.",
      "Bens Stein sprang fünfmal, Milas nur dreimal.",
      "Ben strahlte über das ganze Gesicht.",
      "Auf dem Rückweg sang die ganze Familie laut Lieder."
    ],
    aufgaben: [
      { art: "frage", frage: "Was machte die Familie, als es zu regnen begann?", zeilen: [12], hinweis: [11, 13] },
      { art: "reihenfolge", ereignisse: [
        { text: "Der Vater prüft Bremsen und Licht.", zeile: 3 },
        { text: "Mila schaut an der Kreuzung nach links und rechts.", zeile: 8 },
        { text: "Alle stellen sich unter eine Buche.", zeile: 12 },
        { text: "Mila verteilt die Äpfel.", zeile: 14 },
        { text: "Die Kinder lassen Steine hüpfen.", zeile: 17 } ] },
      { art: "anfang", auftrag: "Mila schreibt ihrer Tante eine Postkarte vom Ausflug. Ergänze den ersten Satz!", anfang: "Liebe Tante Rosi," },
      { art: "kreuz", frage: "Wie heißt Milas Bruder?", optionen: ["Ben", "Benno", "Bent"], richtig: 0, hinweis: [13, 13] },
      { art: "unterstreichen", auftrag: "Tippe die Sätze an, die verraten, dass Ben erst traurig und dann froh war.", zeilen: [13, 19], hinweis: [13, 19] },
      { art: "einsetzen", satz: "Ben <u>lächelte</u> über das ganze Gesicht.", wort: "strahlte", zeile: 19 },
      { art: "meinung", frage: "Was glaubst du: Was wollte Mila erreichen, als sie die Äpfel verteilt hat? Antworte in einem ganzen Satz." }
    ]
  }
];
