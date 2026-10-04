/* Generalprobe "D | Lesen" fuer Leon, 2. Klasse (04.10.2026).
 *
 * Denny, 04.10.2026: Probenkarte und Generalprobe "danach dasselbe
 * altersgerecht fuer Helena und Leon". Kurze, selbst geschriebene Geschichten
 * (60-90 Woerter), ein Satz je Zeile, alle Namen erfunden. Kein fremder Text.
 *
 * Neue Geschichten HINTEN anhaengen, nie eine id aendern (localStorage merkt sie).
 * Pruefen:  node pruefe-generalprobe-leon.mjs
 *
 * Aufgaben (genau fuenf, in dieser Reihenfolge):
 *  kreuz        frage, drei optionen, richtig = Index, hinweis = [von, bis]
 *  luecke       satz mit ___, drei optionen, wort = Loesung, zeile = wo es steht
 *  reihenfolge  drei Ereignisse in Textreihenfolge (je mit zeile); angezeigt gemischt
 *  stimmt       satz, richtig = true/false, zeile = wo man es nachliest
 *  ende         angefangener Satz, Leon schreibt ihn zu Ende - geht an die Werkstatt
 */
window.GENERALPROBE = [
  {
    id: "tor",
    titel: "Das Tor in letzter Minute",
    zeilen: [
      "Ben spielt jeden Dienstag Fußball im Verein.",
      "Heute ist ein großes Spiel gegen die Blauen.",
      "Ben ist sehr aufgeregt und bindet seine Schuhe zweimal.",
      "In der ersten Halbzeit fällt kein Tor.",
      "Dann bekommt Ben den Ball von seiner Freundin Ela.",
      "Er läuft schnell zum Tor und schießt.",
      "Der Ball fliegt ganz knapp am Pfosten vorbei.",
      "Ben ist traurig, aber Ela ruft: „Weiter so!“",
      "Kurz vor dem Ende schießt Ben noch einmal.",
      "Diesmal landet der Ball im Netz.",
      "Alle jubeln, und Ben hüpft vor Freude."
    ],
    aufgaben: [
      { art: "kreuz", frage: "Von wem bekommt Ben den Ball?", optionen: ["Ela", "Ella", "Elsa"], richtig: 0, hinweis: [5, 5] },
      { art: "luecke", satz: "Ben spielt jeden ___ Fußball.", optionen: ["Montag", "Dienstag", "Freitag"], wort: "Dienstag", zeile: 1 },
      { art: "reihenfolge", ereignisse: [
        { text: "Ben bindet seine Schuhe zweimal.", zeile: 3 },
        { text: "Der Ball fliegt am Pfosten vorbei.", zeile: 7 },
        { text: "Der Ball landet im Netz.", zeile: 10 } ] },
      { art: "stimmt", satz: "In der ersten Halbzeit fällt ein Tor.", richtig: false, zeile: 4 },
      { art: "ende", anfang: "Ben hüpft vor Freude, weil" }
    ]
  },
  {
    id: "katze",
    titel: "Wo ist Flocke?",
    zeilen: [
      "Lina hat eine kleine Katze mit dem Namen Flocke.",
      "Am Morgen ist Flocke nicht in ihrem Korb.",
      "Lina sucht unter dem Bett und hinter dem Sofa.",
      "Sie ruft laut: „Flocke, wo bist du?“",
      "Dann hört sie ein leises Miauen.",
      "Das Miauen kommt aus dem Kleiderschrank.",
      "Lina macht die Tür ganz weit auf.",
      "Flocke liegt gemütlich auf einem warmen Pulli.",
      "Lina lacht und streichelt ihre Katze.",
      "Ab jetzt bleibt die Schranktür immer zu."
    ],
    aufgaben: [
      { art: "kreuz", frage: "Wie heißt die Katze?", optionen: ["Flocke", "Flecki", "Socke"], richtig: 0, hinweis: [1, 1] },
      { art: "luecke", satz: "Flocke liegt auf einem warmen ___.", optionen: ["Kissen", "Teppich", "Pulli"], wort: "Pulli", zeile: 8 },
      { art: "reihenfolge", ereignisse: [
        { text: "Lina sucht unter dem Bett.", zeile: 3 },
        { text: "Lina hört ein leises Miauen.", zeile: 5 },
        { text: "Lina streichelt ihre Katze.", zeile: 9 } ] },
      { art: "stimmt", satz: "Das Miauen kommt aus der Küche.", richtig: false, zeile: 6 },
      { art: "ende", anfang: "Lina ist froh, weil" }
    ]
  },
  {
    id: "kuchen",
    titel: "Ein Kuchen für Opa",
    zeilen: [
      "Heute hat Opa Geburtstag.",
      "Emil und Mama backen einen Apfelkuchen für ihn.",
      "Emil schält die Äpfel, und Mama rührt den Teig.",
      "Dann kommt der Kuchen in den Ofen.",
      "Nach einer Stunde riecht die ganze Küche lecker.",
      "Emil malt noch schnell eine Karte mit einer Sonne.",
      "Am Nachmittag klingelt Opa an der Tür.",
      "Emil singt ein Lied, und Opa strahlt.",
      "Dann essen alle zusammen den warmen Kuchen.",
      "Opa sagt: „So einen guten Kuchen hatte ich noch nie!“"
    ],
    aufgaben: [
      { art: "kreuz", frage: "Was für einen Kuchen backen Emil und Mama?", optionen: ["Kirschkuchen", "Apfelkuchen", "Schokokuchen"], richtig: 1, hinweis: [2, 2] },
      { art: "luecke", satz: "Emil malt eine Karte mit einer ___.", optionen: ["Sonne", "Blume", "Torte"], wort: "Sonne", zeile: 6 },
      { art: "reihenfolge", ereignisse: [
        { text: "Emil schält die Äpfel.", zeile: 3 },
        { text: "Emil malt eine Karte.", zeile: 6 },
        { text: "Alle essen den warmen Kuchen.", zeile: 9 } ] },
      { art: "stimmt", satz: "Opa klingelt am Morgen an der Tür.", richtig: false, zeile: 7 },
      { art: "ende", anfang: "Opa freut sich, weil" }
    ]
  },
  {
    id: "schnecke",
    titel: "Mila und die Schnecke",
    zeilen: [
      "Es regnet schon den ganzen Tag.",
      "Mila zieht ihre gelben Gummistiefel an.",
      "Im Garten springt sie in jede Pfütze.",
      "Platsch! Das Wasser spritzt bis an ihre Nase.",
      "Auf dem Weg sieht sie eine Schnecke.",
      "Die Schnecke trägt ein braunes Haus auf dem Rücken.",
      "Mila trägt sie vorsichtig unter einen großen Busch.",
      "„Hier tritt dich keiner“, sagt sie leise.",
      "Dann geht Mila nass, aber fröhlich ins Haus."
    ],
    aufgaben: [
      { art: "kreuz", frage: "Welche Farbe haben Milas Gummistiefel?", optionen: ["grün", "rot", "gelb"], richtig: 2, hinweis: [2, 2] },
      { art: "luecke", satz: "Mila trägt sie unter einen großen ___.", optionen: ["Busch", "Baum", "Stein"], wort: "Busch", zeile: 7 },
      { art: "reihenfolge", ereignisse: [
        { text: "Mila zieht die Gummistiefel an.", zeile: 2 },
        { text: "Mila sieht eine Schnecke.", zeile: 5 },
        { text: "Mila geht fröhlich ins Haus.", zeile: 9 } ] },
      { art: "stimmt", satz: "Die Schnecke hat ein braunes Haus.", richtig: true, zeile: 6 },
      { art: "ende", anfang: "Mila trägt die Schnecke weg, weil" }
    ]
  },
  {
    id: "bauernhof",
    titel: "Ausflug auf den Bauernhof",
    zeilen: [
      "Die Klasse 2b fährt mit dem Bus auf einen Bauernhof.",
      "Dort wartet Bäuerin Hanne schon am Tor.",
      "Zuerst dürfen die Kinder die Kühe füttern.",
      "Eine Kuh leckt Tom mit ihrer langen Zunge am Arm.",
      "Alle lachen, und Tom lacht am lautesten.",
      "Danach sammeln die Kinder Eier im Hühnerstall.",
      "Jedes Kind darf ein Ei mit nach Hause nehmen.",
      "Im Bus hält Tom sein Ei ganz fest.",
      "Zu Hause kocht Papa das Ei zum Abendessen."
    ],
    aufgaben: [
      { art: "kreuz", frage: "Wie heißt die Bäuerin?", optionen: ["Hanna", "Hanne", "Anne"], richtig: 1, hinweis: [2, 2] },
      { art: "luecke", satz: "Die Kinder sammeln ___ im Hühnerstall.", optionen: ["Federn", "Äpfel", "Eier"], wort: "Eier", zeile: 6 },
      { art: "reihenfolge", ereignisse: [
        { text: "Die Kinder füttern die Kühe.", zeile: 3 },
        { text: "Die Kinder sammeln Eier.", zeile: 6 },
        { text: "Papa kocht das Ei.", zeile: 9 } ] },
      { art: "stimmt", satz: "Eine Kuh leckt Tom am Arm.", richtig: true, zeile: 4 },
      { art: "ende", anfang: "Tom hält sein Ei ganz fest, weil" }
    ]
  },
  {
    id: "laterne",
    titel: "Die Fuchs-Laterne",
    zeilen: [
      "Bald ist das Laternenfest in der Schule.",
      "Jonte bastelt eine Laterne in Form eines Fuchses.",
      "Er schneidet rotes Papier und klebt zwei Ohren an.",
      "Papa hilft ihm beim Draht für den Griff.",
      "Am Abend des Festes ist es schon dunkel.",
      "Alle Kinder gehen mit ihren Laternen durch den Park.",
      "Plötzlich weht ein Wind, und das Licht geht aus.",
      "Frau Kern, die Lehrerin, macht ein neues Licht an.",
      "Jonte singt das Laternenlied am lautesten."
    ],
    aufgaben: [
      { art: "kreuz", frage: "Welches Tier ist Jontes Laterne?", optionen: ["Fuchs", "Fisch", "Igel"], richtig: 0, hinweis: [2, 2] },
      { art: "luecke", satz: "Er schneidet rotes ___.", optionen: ["Holz", "Papier", "Stoff"], wort: "Papier", zeile: 3 },
      { art: "reihenfolge", ereignisse: [
        { text: "Jonte bastelt eine Laterne.", zeile: 2 },
        { text: "Die Kinder gehen durch den Park.", zeile: 6 },
        { text: "Frau Kern macht ein neues Licht an.", zeile: 8 } ] },
      { art: "stimmt", satz: "Mama hilft Jonte beim Griff.", richtig: false, zeile: 4 },
      { art: "ende", anfang: "Jonte singt am lautesten, weil" }
    ]
  }
];
