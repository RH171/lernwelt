/* Leons Lesegeschichten - eine je Tag, in dieser Reihenfolge (lesegeschichte.html).
   Stand 21.09.2026: 62 Geschichten (Mitschueler aus der 2bG und der ASC Boxdorf -
   Denny: Termine gehoeren in den Inhalt, nicht als Banner in die App), von Hand geschrieben und geprüft. Neue hinten
   anhängen, nie eine id ändern - der Lesepass merkt sich die id.

   Geprueft wird mit `node pruefe-geschichten.mjs` (Seitenzahl, Satzlaenge,
   Wortzahl, Silbentrennung, ob jede Antwort wirklich auf ihrer Seite steht).
   Am 21.09.2026 kamen h1 bis h20 dazu: Leon hatte am Wochenende fuenf
   Geschichten an einem Tag gelesen, von 42 waren noch 18 uebrig. */
window.LEON_GESCHICHTEN = [
 {
  "id": "a1-der-neue-junge",
  "titel": "Der neue Junge",
  "bild": "🎒",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🔔",
      "☀️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Es klin|gelt laut zur gro|ßen Pau|se.",
     "Le|on rennt schnell auf den Pau|sen|hof.",
     "Die Son|ne scheint noch rich|tig warm.",
     "Am Baum steht der klei|ne Le|o ganz al|lein.",
     "Er hält sei|ne Brot|do|se ganz fest."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🥪"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "„Hal|lo, bist du neu hier?“, fragt Le|on.",
     "Le|o nickt ein biss|chen schüch|tern.",
     "„Ich bin seit ges|tern an der Schu|le.“",
     "„Ich bin in der ers|ten Klas|se.“",
     "„Ich ken|ne hier noch gar nichts.“"
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "👋",
      "😊"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Le|on lä|chelt ihn freund|lich an.",
     "„Ich bin Le|on aus der zwei|ten Klas|se.“",
     "„Komm mit, ich zei|ge dir al|les!“",
     "Le|o packt schnell sei|ne Brot|do|se ein.",
     "Dann ge|hen die bei|den los."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🌳",
      "🪣"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "„Hier ist das Klet|ter|ge|rüst“, sagt Le|on.",
     "„Da drü|ben ist die Bank im Schat|ten.“",
     "„Und dort hin|ten ist der Sand|kas|ten.“",
     "Le|o schaut ü|ber|all hin.",
     "Der Pau|sen|hof ist ganz schön groß."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Dann kom|men sie zum Fuß|ball|tor.",
     "„Das ist mein Lieb|lings|platz!“, ruft Le|on.",
     "„Ich bin näm|lich Tor|wart.“",
     "Le|o macht gro|ße Au|gen.",
     "„Ich spie|le auch so gern Fuß|ball!“"
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "„Schieß doch mal auf das Tor!“, sagt Le|on.",
     "Le|o nimmt ei|nen lan|gen An|lauf.",
     "Er schießt mit al|ler Kraft.",
     "Le|on springt, a|ber der Ball ist schnel|ler.",
     "Der Ball ist drin!"
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎉",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "„Toll ge|schos|sen!“, ruft Le|on.",
     "Le|o strahlt ü|ber das gan|ze Ge|sicht.",
     "Dann hält Le|on drei Schüs|se hin|ter|ein|an|der.",
     "„Du bist ein gu|ter Tor|wart!“, sagt Le|o.",
     "Jetzt strahlt Le|on auch."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🔔",
      "🤝"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Da klin|gelt es schon wie|der.",
     "„Spie|len wir mor|gen wie|der?“, fragt Le|o.",
     "„Na klar, ich war|te am Tor!“, sagt Le|on.",
     "Der klei|ne Le|o ist jetzt nicht mehr al|lein.",
     "Er hat ei|nen neu|en Freund."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wo steht der kleine Leo am Anfang?",
    "richtig": "am Baum",
    "falsch": [
     "am Tor",
     "an der Bank"
    ],
    "seite": 1
   },
   {
    "frage": "In welche Klasse geht Leo?",
    "richtig": "in die erste Klasse",
    "falsch": [
     "in die zweite Klasse",
     "in die vierte Klasse"
    ],
    "seite": 2
   },
   {
    "frage": "Was zeigt Leon ihm zuerst?",
    "richtig": "das Klettergerüst",
    "falsch": [
     "den Sandkasten",
     "die Bank"
    ],
    "seite": 4
   },
   {
    "frage": "Wie viele Schüsse hält Leon danach?",
    "richtig": "drei",
    "falsch": [
     "zwei",
     "fünf"
    ],
    "seite": 7
   },
   {
    "frage": "Was hat Leo am Ende?",
    "richtig": "einen neuen Freund",
    "falsch": [
     "einen neuen Ball",
     "eine neue Brotdose"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "b1-die-verlorenen-handschuhe",
  "titel": "Die verlorenen Handschuhe",
  "bild": "🧤",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚽",
      "☀️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Heu|te ist end|lich Sams|tag.",
     "Die Son|ne scheint warm ins Zim|mer.",
     "Le|on will mit Xa|ver Fuß|ball spie|len.",
     "Le|on spielt im|mer im Tor.",
     "Da|für braucht er sei|ne Hand|schu|he."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎒",
      "🛏️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on sucht in sei|nem Ruck|sack.",
     "Da sind nur ei|ne Fla|sche und ein Ap|fel.",
     "Er schaut un|ter das Bett.",
     "Da liegt nur ein al|ter Schuh.",
     "„Wo sind mei|ne Hand|schu|he?“, ruft Le|on."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧣",
      "🧢"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa kommt aus der Kü|che.",
     "„Hast du im Schrank ge|schaut?“, fragt er.",
     "Le|on macht den Schrank auf.",
     "Dort lie|gen Müt|zen und ein grü|ner Schal.",
     "A|ber da sind kei|ne Hand|schu|he."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🔍",
      "😂"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Nun su|chen bei|de in der Kü|che.",
     "Pa|pa schaut so|gar in den Brot|korb.",
     "„Da drin sind sie si|cher nicht!“, sagt Le|on.",
     "Er muss laut la|chen.",
     "Pa|pa lacht auch mit."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🤔",
      "💡"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Le|on setzt sich auf den Bo|den und ü|ber|legt.",
     "Er denkt ganz scharf nach.",
     "Wo hat|te er die Hand|schu|he zu|letzt?",
     "Ges|tern hat er mit Ma|ma Tor|wart ge|übt.",
     "„Viel|leicht lie|gen sie bei Ma|ma!“, ruft er."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🏠",
      "👀"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Ma|ma wohnt gleich ge|gen|ü|ber.",
     "Pa|pa nimmt Le|on an die Hand.",
     "Sie schau|en nach links und nach rechts.",
     "Kein ein|zi|ges Au|to kommt.",
     "Dann ge|hen sie zu|sam|men hin|ü|ber."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚪",
      "😄"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "Ma|ma macht die Tür auf.",
     "Sie lacht und hält et|was hoch.",
     "Es sind Le|ons wei|ße Hand|schu|he!",
     "„Die hast du ges|tern bei mir ver|ges|sen.“",
     "„Dan|ke, Ma|ma!“, ruft Le|on froh."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "⚽",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Papa",
      "Xaver"
     ]
    },
    "zeilen": [
     "Pa|pa und Le|on ge|hen si|cher zu|rück.",
     "Vor dem Haus war|tet schon Xa|ver mit dem Ball.",
     "Le|on zieht die Hand|schu|he an.",
     "Dann ge|hen sie zum Fuß|ball|platz.",
     "„Heu|te hal|te ich je|den Ball!“, ruft Le|on."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was liegt unter dem Bett?",
    "richtig": "ein alter Schuh",
    "falsch": [
     "ein Apfel",
     "eine Mütze"
    ],
    "seite": 2
   },
   {
    "frage": "Wo schaut Papa nach?",
    "richtig": "im Brotkorb",
    "falsch": [
     "im Rucksack",
     "unter dem Bett"
    ],
    "seite": 4
   },
   {
    "frage": "Wie viele Autos kommen?",
    "richtig": "kein Auto",
    "falsch": [
     "ein Auto",
     "zwei Autos"
    ],
    "seite": 6
   },
   {
    "frage": "Welche Farbe haben die Handschuhe?",
    "richtig": "weiß",
    "falsch": [
     "grün",
     "rot"
    ],
    "seite": 7
   },
   {
    "frage": "Wohin gehen Leon und Xaver am Ende?",
    "richtig": "zum Fußballplatz",
    "falsch": [
     "zu Mama",
     "in die Küche"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "c1-der-apfelbaum",
  "titel": "Der Apfelbaum",
  "bild": "🍎",
  "seiten": [
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🌳",
      "☀️"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Es ist ein war|mer Tag im Sep|tem|ber.",
     "Le|on und Paul sind im Gar|ten.",
     "Dort steht ein gro|ßer Ap|fel|baum.",
     "Die Äp|fel sind rot und gelb."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🍎",
      "🌳"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Wir pflü|cken Äp|fel!“, ruft Paul.",
     "Le|on holt ei|nen Korb.",
     "Paul pflückt die Äp|fel un|ten am Baum.",
     "Le|on legt sie vor|sich|tig in den Korb.",
     "Bald ist der Korb fast voll."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🍎",
      "👆"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Da sieht Le|on ei|nen ganz be|son|ders schö|nen Ap|fel.",
     "Er ist groß und glänzt in der Son|ne.",
     "A|ber er hängt ganz o|ben im Baum.",
     "„Den will ich ha|ben!“, sagt Le|on."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🍎",
      "🦘"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Le|on streckt sich ganz hoch.",
     "Er hüpft und hüpft.",
     "Doch der Ap|fel ist viel zu hoch.",
     "Paul ver|sucht es auch.",
     "Auch Paul kommt nicht an den Ap|fel."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🤔",
      "🍎"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Schaf|fen wir das nie?“, fragt Le|on.",
     "„Wir brau|chen ein biss|chen Ge|duld“, sagt Paul.",
     "Die bei|den set|zen sich ins Gras.",
     "Sie den|ken lan|ge nach.",
     "Le|on isst ei|nen Ap|fel aus dem Korb."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "💡",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Plötz|lich springt Le|on auf.",
     "„Ich hab ei|ne I|dee!“, ruft er.",
     "„Ich bin doch Tor|wart!“",
     "„Du schüt|telst den Ast mit dem Re|chen.“",
     "„Und ich fan|ge den Ap|fel“, sagt Le|on."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🌳",
      "🍎"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Paul holt den lan|gen Re|chen.",
     "Er stupst den Ast ganz sanft an.",
     "Le|on steht un|ter dem Baum wie im Tor.",
     "Der Ast wa|ckelt hin und her.",
     "Da fällt der gro|ße Ap|fel!"
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🍎",
      "😄"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Le|on streckt bei|de Hän|de aus.",
     "Er fängt den Ap|fel si|cher auf.",
     "„Toll ge|hal|ten!“, ruft Paul und klatscht.",
     "Le|on lacht und teilt den Ap|fel mit Paul.",
     "Die|ser Ap|fel schmeckt am al|ler|bes|ten."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Welche Farbe haben die Äpfel?",
    "richtig": "rot und gelb",
    "falsch": [
     "grün und gelb",
     "rot und grün"
    ],
    "seite": 1
   },
   {
    "frage": "Was holt Leon?",
    "richtig": "einen Korb",
    "falsch": [
     "einen Rechen",
     "einen Ball"
    ],
    "seite": 2
   },
   {
    "frage": "Wo hängt der schöne Apfel?",
    "richtig": "ganz oben im Baum",
    "falsch": [
     "ganz unten am Baum",
     "im Korb"
    ],
    "seite": 3
   },
   {
    "frage": "Womit schüttelt Paul den Ast?",
    "richtig": "mit dem Rechen",
    "falsch": [
     "mit dem Korb",
     "mit dem Ball"
    ],
    "seite": 6
   },
   {
    "frage": "Was macht Leon am Ende mit dem Apfel?",
    "richtig": "Er teilt ihn mit Paul.",
    "falsch": [
     "Er isst ihn allein.",
     "Er wirft ihn ins Gras."
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "a2-zwei-torwarte-ein-tor",
  "titel": "Zwei Torwarte, ein Tor",
  "bild": "🧤",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "🔔"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Heu|te ist end|lich gro|ße Pau|se.",
     "Le|on hat sei|nen Ball da|bei.",
     "Er rennt so|fort zum Fuß|ball|tor.",
     "Da kommt auch The|o an|ge|rannt.",
     "The|o ist in Le|ons Klas|se."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🥅",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "„Ich ge|he ins Tor!“, ruft Le|on.",
     "„Nein, ich ge|he ins Tor!“, ruft The|o.",
     "Bei|de sind näm|lich rich|ti|ge Tor|war|te.",
     "Bei|de stel|len sich zwi|schen die Pfos|ten.",
     "Jetzt ist das Tor ganz schön voll."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🥅",
      "😕"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Le|on schiebt ein biss|chen nach links.",
     "The|o schiebt ein biss|chen nach rechts.",
     "Kein Ball fliegt, und kein Spiel geht los.",
     "„So macht das kei|nen Spaß“, sagt The|o.",
     "Le|on nickt lang|sam und seufzt."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🤔",
      "💡"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Le|on setzt sich auf den Ball.",
     "Er denkt ganz lan|ge und ganz fest nach.",
     "Dann hat er ei|ne gu|te I|dee.",
     "„Wir tau|schen ein|fach ab!“, ruft er.",
     "„Ei|ner hält, und der an|de|re schießt.“"
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "✋",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "„Je|der hat fünf Schüs|se im Tor“, sagt Le|on.",
     "„Da|nach wird ge|tauscht.“",
     "The|o ü|ber|legt ei|nen Mo|ment.",
     "„Das ist gut!“, sagt er.",
     "„A|ber wer darf zu|erst ins Tor?“"
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "✊",
      "✌️",
      "✋"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Sie spie|len Sche|re, Stein, Pa|pier.",
     "Le|on macht ei|ne Faust für den Stein.",
     "The|o nimmt das Pa|pier.",
     "Pa|pier wi|ckelt den Stein ein.",
     "Al|so darf The|o zu|erst ins Tor."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Le|on schießt fünf|mal auf das Tor.",
     "The|o fliegt und hält drei Bäl|le.",
     "Dann geht Le|on mit Hand|schu|hen ins Tor.",
     "Jetzt schießt The|o fünf|mal.",
     "Le|on hält auch drei Bäl|le fest."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🔔",
      "🤝"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Da klin|gelt es zum En|de der Pau|se.",
     "Bei|de sind ganz rot und ver|schwitzt.",
     "„Das war die bes|te Pau|se!“, sagt The|o.",
     "„Mor|gen tau|schen wir wie|der“, sagt Le|on.",
     "Zwei Tor|war|te tei|len sich jetzt ein Tor."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wohin rennt Leon sofort?",
    "richtig": "zum Fußballtor",
    "falsch": [
     "zur Bank",
     "in die Klasse"
    ],
    "seite": 1
   },
   {
    "frage": "Wer hat die gute Idee?",
    "richtig": "Leon",
    "falsch": [
     "Theo",
     "Theo und Leon"
    ],
    "seite": 4
   },
   {
    "frage": "Wer darf zuerst ins Tor?",
    "richtig": "Theo",
    "falsch": [
     "Leon",
     "beide zusammen"
    ],
    "seite": 6
   },
   {
    "frage": "Wie viele Bälle hält Leon?",
    "richtig": "drei",
    "falsch": [
     "fünf",
     "zwei"
    ],
    "seite": 7
   },
   {
    "frage": "Was machen die beiden morgen?",
    "richtig": "wieder tauschen",
    "falsch": [
     "nur schießen",
     "gar nicht spielen"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "b2-im-stadion",
  "titel": "Im Stadion",
  "bild": "🏟️",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "👕",
      "🍀"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Heu|te ist ein ganz be|son|de|rer Tag.",
     "Pa|pa und Le|on ge|hen ins Sta|di|on.",
     "Die Klee|blät|ter spie|len!",
     "Le|on zieht sein grü|nes Tri|kot an.",
     "Pa|pa nimmt den grü|nen Schal mit."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🎶"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Sie fah|ren mit dem Bus zum Sta|di|on.",
     "Im Bus sind vie|le Leu|te in Grün und Weiß.",
     "Ein Mann singt laut ein Lied.",
     "Le|on singt ein|fach mit.",
     "Das macht rich|tig viel Spaß."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🏟️",
      "🍀"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Das Sta|di|on ist rie|sig.",
     "Ü|ber|all we|hen grü|ne Fah|nen.",
     "Pa|pa und Le|on set|zen sich auf ih|re Plät|ze.",
     "Von hier se|hen sie das Tor ganz ge|nau.",
     "„Da steht gleich un|ser Tor|wart“, sagt Pa|pa."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "👏"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die Spie|ler lau|fen auf den Ra|sen.",
     "Al|le Leu|te klat|schen und ru|fen.",
     "Le|on schaut a|ber nur auf den Tor|wart.",
     "Der Tor|wart hat gel|be Hand|schu|he.",
     "Er hüpft und klatscht in die Hän|de."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Das Spiel geht los.",
     "Der Ball fliegt hin und her.",
     "Dann schießt ein Spie|ler von den Gäs|ten.",
     "Der Tor|wart springt weit zur Sei|te.",
     "Er fängt den Ball mit bei|den Hän|den!"
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "😮",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Nach der Pau|se gibt es ei|nen Elf|me|ter.",
     "Le|on hält sich die Au|gen zu.",
     "Nur durch die Fin|ger schaut er hin.",
     "Der Tor|wart springt in die rich|ti|ge E|cke.",
     "Er hält den Ball!"
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🎉",
      "🍀"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Das gan|ze Sta|di|on ju|belt laut.",
     "Le|on springt von sei|nem Platz auf.",
     "„Das war mu|tig!“, ruft er.",
     "Pa|pa nickt und lacht.",
     "Am En|de steht es eins zu eins."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🌙",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Am A|bend ge|hen sie nach Hau|se.",
     "Le|on ist mü|de und froh.",
     "„Ich will auch so mu|tig sprin|gen“, sagt er.",
     "„Mor|gen ü|ben wir Sprin|gen“, sagt Pa|pa.",
     "Le|on lacht und nimmt Pa|pas Hand."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Womit fahren Papa und Leon zum Stadion?",
    "richtig": "mit dem Bus",
    "falsch": [
     "mit dem Auto",
     "mit dem Fahrrad"
    ],
    "seite": 2
   },
   {
    "frage": "Welche Farbe haben die Handschuhe vom Torwart?",
    "richtig": "gelb",
    "falsch": [
     "grün",
     "weiß"
    ],
    "seite": 4
   },
   {
    "frage": "Was macht Leon beim Elfmeter?",
    "richtig": "Er hält die Augen zu.",
    "falsch": [
     "Er singt ein Lied.",
     "Er klatscht in die Hände."
    ],
    "seite": 6
   },
   {
    "frage": "Wie steht es am Ende?",
    "richtig": "eins zu eins",
    "falsch": [
     "zwei zu eins",
     "null zu null"
    ],
    "seite": 7
   },
   {
    "frage": "Was wollen Papa und Leon morgen üben?",
    "richtig": "Springen",
    "falsch": [
     "Singen",
     "Klatschen"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "a3-der-ball-im-garten",
  "titel": "Der Ball im Garten",
  "bild": "⚽",
  "seiten": [
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "☀️"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Es ist ein war|mer Nach|mit|tag im Sep|tem|ber.",
     "Le|on spielt mit Xa|ver im Gar|ten Fuß|ball.",
     "Xa|ver ist der Nach|bar und wohnt ne|ben|an.",
     "Er geht in die fünf|te Klas|se am Gym|na|si|um.",
     "Fast je|den Tag spie|len die bei|den zu|sam|men."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🧤",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Le|on steht zwi|schen zwei gro|ßen Blu|men|töp|fen.",
     "Das ist heu|te sein Tor.",
     "Er hat sei|ne Tor|wart|hand|schu|he an.",
     "„Schieß, Xa|ver, ich hal|te al|les!“, ruft Le|on.",
     "Xa|ver nimmt ei|nen lan|gen An|lauf."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "💨"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Xa|ver schießt mit vol|ler Kraft.",
     "Der Ball fliegt hoch in die Luft.",
     "Er fliegt ü|ber Le|ons Hän|de hin|weg.",
     "Er fliegt so|gar ü|ber den ho|hen Zaun!",
     "Plumps, da ist der Ball weg."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "😮",
      "🙈"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "„Oh nein, das tut mir leid!“, ruft Xa|ver.",
     "„Das macht doch nichts“, sagt Le|on.",
     "„A|ber wie ho|len wir den Ball zu|rück?“",
     "Die bei|den schau|en rat|los zum Zaun.",
     "Der Zaun ist viel hö|her als Le|on."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "👀",
      "💧"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "„Wir klet|tern nicht da rü|ber“, sagt Xa|ver.",
     "„Das ist viel zu ge|fähr|lich.“",
     "Le|on schaut durch ei|ne Lü|cke im Zaun.",
     "Da steht ei|ne Frau mit ei|ner Gieß|kan|ne.",
     "Sie gießt ge|ra|de ih|re To|ma|ten."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🙋",
      "🤞"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Le|on ist ein biss|chen auf|ge|regt.",
     "Dann holt er tief Luft.",
     "„Ent|schul|di|gung, un|ser Ball ist bei Ih|nen!“, ruft er.",
     "„Dür|fen wir ihn bit|te zu|rück|ha|ben?“",
     "Xa|ver steht ganz nah ne|ben ihm."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "🙌"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Die Frau dreht sich um und lä|chelt.",
     "„Na klar, ich ha|be ihn schon ge|se|hen!“",
     "Sie hebt den Ball aus dem Beet auf.",
     "Dann wirft sie ihn ü|ber den Zaun.",
     "Le|on fängt ihn si|cher mit bei|den Hän|den."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "😊",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "„Dan|ke schön!“, ru|fen Le|on und Xa|ver.",
     "„Ihr habt so nett ge|fragt“, sagt die Frau.",
     "Sie gibt je|dem ei|ne klei|ne ro|te To|ma|te.",
     "„Du warst rich|tig mu|tig“, sagt Xa|ver zu Le|on.",
     "Dann spie|len sie wei|ter, a|ber nicht mehr so hoch."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "In welche Klasse geht Xaver?",
    "richtig": "in die fünfte Klasse",
    "falsch": [
     "in die zweite Klasse",
     "in die vierte Klasse"
    ],
    "seite": 1
   },
   {
    "frage": "Was ist heute Leons Tor?",
    "richtig": "zwei Blumentöpfe",
    "falsch": [
     "zwei Bäume",
     "zwei Gartenstühle"
    ],
    "seite": 2
   },
   {
    "frage": "Wohin fliegt der Ball?",
    "richtig": "über den Zaun",
    "falsch": [
     "auf das Dach",
     "in den Baum"
    ],
    "seite": 3
   },
   {
    "frage": "Was gießt die Frau gerade?",
    "richtig": "ihre Tomaten",
    "falsch": [
     "ihre Blumen",
     "den Rasen"
    ],
    "seite": 5
   },
   {
    "frage": "Was bekommt jeder von der Frau?",
    "richtig": "eine kleine Tomate",
    "falsch": [
     "einen neuen Ball",
     "ein Eis"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "c3-das-klassenspiel",
  "titel": "Das Klassenspiel",
  "bild": "🥅",
  "seiten": [
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "☀️",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Die zwei|te Klas|se geht heu|te auf den Sport|platz.",
     "Die Blät|ter an den Bäu|men wer|den schon gelb.",
     "Herr Ce|lis hat ei|ne sil|ber|ne Pfei|fe da|bei.",
     "„Heu|te spie|len wir ein gro|ßes Fuß|ball|spiel!“, ruft er.",
     "Al|le Kin|der ju|beln laut."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Le|on und The|o sind gu|te Freun|de.",
     "Bei|de spie|len am liebs|ten im Tor.",
     "Heu|te sind sie in der glei|chen Mann|schaft.",
     "A|ber es gibt nur ein Tor für sie.",
     "„Wer darf zu|erst ins Tor?“, fragt The|o."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "💡",
      "🤝"
     ],
     "leute": [
      "Leon",
      "Theo",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Herr Ce|lis hat ei|ne gu|te I|dee.",
     "„Ihr wech|selt euch ein|fach ab“, sagt er.",
     "„Le|on geht in der ers|ten Hälf|te ins Tor.“",
     "„Nach der Pau|se ist The|o dran.“",
     "„Dann schie|ße ich erst ein paar To|re!“, lacht The|o."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Herr Ce|lis pfeift laut.",
     "Das Spiel geht los.",
     "Le|on steht im Tor und passt gut auf.",
     "Ein Kind aus der an|de|ren Mann|schaft schießt ganz fest.",
     "Le|on springt zur Sei|te und hält den Ball!"
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "👏"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "„Su|per ge|hal|ten!“, ruft The|o von vor|ne.",
     "The|o rennt mit dem Ball zum an|de|ren Tor.",
     "Er schießt mit viel Kraft.",
     "Der Ball fliegt knapp am Pfos|ten vor|bei.",
     "„Das war trotz|dem ein tol|ler Schuss!“, ruft Le|on."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⏱️",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Theo",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Nach ei|ner Wei|le pfeift Herr Ce|lis zur Pau|se.",
     "Al|le Kin|der trin|ken ei|nen Schluck Was|ser.",
     "Le|on und The|o klat|schen sich ab.",
     "„Jetzt bist du im Tor dran!“, sagt Le|on.",
     "Nun läuft Le|on als Spie|ler nach vor|ne."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🏃"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Das Spiel geht wei|ter.",
     "The|o fängt ei|nen ho|hen Ball mit bei|den Hän|den.",
     "Er wirft den Ball weit zu Le|on.",
     "Le|on läuft schnell mit dem Ball nach vor|ne.",
     "Dann schießt er den Ball ge|nau ins Tor!"
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🎉",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Theo",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Le|on ju|belt und rennt zu The|o.",
     "„Dein Wurf war su|per!“, ruft Le|on.",
     "Bald pfeift Herr Ce|lis das Spiel ab.",
     "„Ihr habt euch al|le toll an|ge|strengt“, lobt er.",
     "Le|on und The|o ge|hen mü|de und froh zu|rück."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was hat Herr Celis dabei?",
    "richtig": "eine silberne Pfeife",
    "falsch": [
     "einen roten Ball",
     "eine grüne Mütze"
    ],
    "seite": 1
   },
   {
    "frage": "Wer geht zuerst ins Tor?",
    "richtig": "Leon",
    "falsch": [
     "Theo",
     "Herr Celis"
    ],
    "seite": 3
   },
   {
    "frage": "Wo fliegt Theos Schuss vorbei?",
    "richtig": "knapp am Pfosten",
    "falsch": [
     "hoch über den Zaun",
     "an Leons Kopf"
    ],
    "seite": 5
   },
   {
    "frage": "Was trinken die Kinder in der Pause?",
    "richtig": "Wasser",
    "falsch": [
     "Apfelsaft",
     "Milch"
    ],
    "seite": 6
   },
   {
    "frage": "Wohin schießt Leon den Ball?",
    "richtig": "genau ins Tor",
    "falsch": [
     "an den Pfosten",
     "weit zu Theo"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "b4-leon-backt-mit-mama",
  "titel": "Leon backt mit Mama",
  "bild": "🍰",
  "seiten": [
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥣",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "Heu|te ist Le|on bei Ma|ma in der Kü|che.",
     "Mor|gen hat Le|on Fuß|ball|trai|ning mit Xa|ver.",
     "Auch die an|de|ren Freun|de kom|men zum Trai|ning.",
     "„Wir ba|cken ei|nen Ku|chen für al|le“, sagt Ma|ma.",
     "Le|on hüpft vor Freu|de durch die Kü|che."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍎",
      "💧"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "Es soll ein le|cke|rer Ap|fel|ku|chen wer|den.",
     "Le|on wäscht sechs ro|te Äp|fel.",
     "Ma|ma schnei|det sie in klei|ne Stü|cke.",
     "Das Mes|ser ist sehr scharf.",
     "Da|rum macht das nur Ma|ma."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥣",
      "😮"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "Jetzt ma|chen sie den Teig.",
     "Le|on schlägt drei Ei|er in die Schüs|sel.",
     "Ein biss|chen Scha|le fällt mit hin|ein.",
     "Ma|ma fischt sie mit ei|nem Löf|fel he|raus.",
     "„Das pas|siert mir auch oft“, sagt sie und lacht."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥣",
      "😂"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "Nun darf Le|on das Mehl in die Schüs|sel ge|ben.",
     "Er kippt die Tü|te ein biss|chen zu schnell.",
     "Ei|ne gro|ße Mehl|wol|ke fliegt hoch.",
     "Le|ons Na|se ist ganz weiß.",
     "Ma|ma und Le|on la|chen laut."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥣",
      "💪"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "Le|on rührt den Teig lan|ge um.",
     "Das ist ganz schön an|stren|gend.",
     "„Du hast Kraft wie ein Tor|wart“, sagt Ma|ma.",
     "Dann le|gen sie die Äp|fel auf den Teig.",
     "Le|on legt ein gro|ßes Mus|ter aus Äp|feln."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "⏰",
      "🔥"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "Der Ku|chen kommt in den O|fen.",
     "Ma|ma stellt die Uhr auf vier|zig Mi|nu|ten.",
     "Le|on setzt sich auf den Bo|den vor den O|fen.",
     "Er schaut ge|spannt durch die Schei|be und war|tet.",
     "Lang|sam wird der Ku|chen gol|den und hoch."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍰",
      "⏰"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "Nach vier|zig Mi|nu|ten klin|gelt die Uhr.",
     "Ma|ma holt den Ku|chen mit di|cken Hand|schu|hen he|raus.",
     "Es riecht wun|der|bar in der gan|zen Kü|che.",
     "„Darf ich ein Stück pro|bie|ren?“, fragt Le|on.",
     "„Mor|gen, beim Trai|ning“, sagt Ma|ma und zwin|kert."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🍰",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Am nächs|ten Tag ist Trai|ning auf dem Platz.",
     "Nach dem Spiel ha|ben al|le Kin|der gro|ßen Hun|ger.",
     "Le|on ver|teilt den Ap|fel|ku|chen an al|le.",
     "„Den hast du ge|ba|cken?“, fragt Xa|ver und kaut.",
     "„Ja, zu|sam|men mit Ma|ma!“, sagt Le|on stolz."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Warum schneidet nur Mama die Äpfel?",
    "richtig": "Das Messer ist scharf.",
    "falsch": [
     "Leon ist zu müde.",
     "Die Äpfel sind rot."
    ],
    "seite": 2
   },
   {
    "frage": "Was fällt mit in die Schüssel?",
    "richtig": "ein bisschen Schale",
    "falsch": [
     "ein ganzer Apfel",
     "ein kleiner Löffel"
    ],
    "seite": 3
   },
   {
    "frage": "Welche Farbe hat Leons Nase?",
    "richtig": "weiß",
    "falsch": [
     "rot",
     "braun"
    ],
    "seite": 4
   },
   {
    "frage": "Auf wie viele Minuten stellt Mama die Uhr?",
    "richtig": "vierzig Minuten",
    "falsch": [
     "zehn Minuten",
     "sechzig Minuten"
    ],
    "seite": 6
   },
   {
    "frage": "Mit wem hat Leon den Kuchen gebacken?",
    "richtig": "mit Mama",
    "falsch": [
     "mit Xaver",
     "ganz allein"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "f1-mit-dem-roller-zur-schule",
  "titel": "Mit dem Roller zur Schule",
  "bild": "🛴",
  "seiten": [
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🛴",
      "🎒"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Am Mor|gen steht Le|ons Rol|ler schon drau|ßen.",
     "Die Luft ist heu|te kühl und frisch.",
     "Le|on setzt zu|erst sei|nen Helm auf.",
     "Pa|pa macht den Rie|men or|dent|lich fest.",
     "Dann kann es für Le|on los|ge|hen."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🛴"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Vor dem Haus war|tet schon Ro|mi|na.",
     "Sie fährt oft mit Le|on zur Schu|le.",
     "Ihr Rol|ler ist blau und ganz neu.",
     "„Gu|ten Mor|gen, Le|on!“, ruft Ro|mi|na fröh|lich.",
     "„Fah|ren wir gleich los?“, fragt Le|on."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🛴",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Die bei|den fah|ren auf dem Geh|weg.",
     "Da|für ist der Geh|weg ge|nau rich|tig.",
     "Sie fah|ren hin|ter|ein|an|der und nicht ne|ben|ein|an|der.",
     "Ro|mi|na fährt vorn und Le|on hin|ter|her.",
     "Die bun|ten Blät|ter ra|scheln un|ter den Rä|dern."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🛴",
      "👜"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Vor|ne kommt ei|ne Frau mit ei|ner Ta|sche.",
     "Ro|mi|na bremst und stellt ei|nen Fuß ab.",
     "Le|on bremst auch und bleibt kurz ste|hen.",
     "„Dan|ke, ihr zwei!“, sagt die Frau.",
     "Dann fah|ren die bei|den lang|sam wei|ter."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚗",
      "🛴"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Nun kommt ei|ne Stra|ße mit Au|tos.",
     "Hier stei|gen bei|de von den Rol|lern ab.",
     "Sie schie|ben die Rol|ler bis zum Rand.",
     "Erst schau|en sie nach links und rechts.",
     "Auf der Stra|ße ist ge|ra|de kein Au|to."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🛴",
      "🏫"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Zu Fuß schie|ben sie die Rol|ler hin|ü|ber.",
     "Auf der an|de|ren Sei|te stei|gen sie auf.",
     "Jetzt ist die Schu|le nicht mehr weit.",
     "Ro|mi|na fährt ein biss|chen schnel|ler.",
     "Am Schul|tor war|tet sie ge|dul|dig auf ihn."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🛴"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Auf dem Hof steht ein Rol|ler|stän|der.",
     "Dort stel|len die bei|den ih|re Rol|ler ab.",
     "Le|on nimmt sei|nen Helm vor|sich|tig ab.",
     "Sei|ne Haa|re ste|hen ganz wild nach o|ben.",
     "Da lacht Ro|mi|na und Le|on auch."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "📒"
     ],
     "leute": [
      "Leon",
      "Romina",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "In der Klas|se sieht Herr Ce|lis die Hel|me.",
     "„Das habt ihr rich|tig gut ge|macht“, sagt er.",
     "„Mit Helm seid ihr si|cher un|ter|wegs.“",
     "Le|on und Ro|mi|na freu|en sich sehr.",
     "„Mor|gen fah|ren wir wie|der zu|sam|men“, sagt Ro|mi|na."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was setzt Leon zuerst auf?",
    "richtig": "seinen Helm",
    "falsch": [
     "seine Mütze",
     "seine Kapuze"
    ],
    "seite": 1
   },
   {
    "frage": "Welche Farbe hat Rominas Roller?",
    "richtig": "blau",
    "falsch": [
     "grün",
     "rot"
    ],
    "seite": 2
   },
   {
    "frage": "Wo fahren Leon und Romina?",
    "richtig": "auf dem Gehweg",
    "falsch": [
     "auf der Wiese",
     "auf der Straße"
    ],
    "seite": 3
   },
   {
    "frage": "Was machen die beiden an der Straße?",
    "richtig": "Sie steigen ab.",
    "falsch": [
     "Sie fahren schnell.",
     "Sie rennen los."
    ],
    "seite": 5
   },
   {
    "frage": "Was sagt Herr Celis über die Helme?",
    "richtig": "Das habt ihr gut gemacht.",
    "falsch": [
     "Die Helme sind zu klein.",
     "Nehmt die Helme schnell ab."
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "f2-joko-und-sein-grosser-bruder",
  "titel": "Joko und sein großer Bruder",
  "bild": "🤝",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎒"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "Die Schu|le ist für heu|te aus.",
     "Le|on packt sei|nen Ran|zen und geht raus.",
     "Da kommt Jo|ko ü|ber den Hof ge|rannt.",
     "Jo|ko ist in Le|ons Klas|se.",
     "„Kommst du heu|te mit zum Fuß|ball|platz?“, fragt er."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽"
     ],
     "leute": [
      "Leon",
      "Joko",
      "Paul"
     ]
    },
    "zeilen": [
     "Auf dem Platz war|ten schon zwei gro|ße Jun|gen.",
     "Der ei|ne ist Le|ons Bru|der Paul.",
     "Ne|ben Paul steht ein gro|ßer Jun|ge.",
     "Das ist Jo|kos gro|ßer Bru|der Klaas.",
     "Klaas geht mit Paul in ei|ne Klas|se."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Joko",
      "Paul"
     ]
    },
    "zeilen": [
     "„Wir spie|len zwei ge|gen zwei“, sagt Paul.",
     "Le|on und Jo|ko spie|len zu|sam|men.",
     "Paul und Klaas sind die an|de|re Mann|schaft.",
     "„Ich stel|le mich zu|erst ins Tor!“, ruft Le|on.",
     "Er zieht schnell sei|ne Hand|schu|he an."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽"
     ],
     "leute": [
      "Leon",
      "Klaas"
     ]
    },
    "zeilen": [
     "Klaas nimmt ei|nen lan|gen An|lauf.",
     "Er schießt den Ball ganz fest aufs Tor.",
     "Le|on wirft sich weit zur Sei|te.",
     "Er hat den Ball in bei|den Hän|den!",
     "„Su|per ge|hal|ten, Le|on!“, ruft Klaas laut."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "Jetzt darf Jo|ko end|lich nach vorn.",
     "Le|on wirft ihm den Ball ge|nau zu.",
     "Jo|ko läuft da|mit schnell ü|ber den Platz.",
     "Dann schießt er ganz flach in die E|cke.",
     "Der Ball rollt lang|sam ins lee|re Tor."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤"
     ],
     "leute": [
      "Paul",
      "Leon",
      "Klaas"
     ]
    },
    "zeilen": [
     "Nach ei|ner Wei|le wech|seln die vier.",
     "Jetzt geht Paul für sei|ne Mann|schaft ins Tor.",
     "Le|on darf end|lich ein|mal selbst schie|ßen.",
     "Er schießt den Ball mit vol|ler Kraft.",
     "Doch Paul hält ihn mit bei|den Hän|den."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽"
     ],
     "leute": [
      "Leon",
      "Joko",
      "Klaas"
     ]
    },
    "zeilen": [
     "Da hat Le|on ei|ne gu|te I|dee.",
     "Er legt Jo|ko den Ball vor das Tor.",
     "Jo|ko muss nur noch ganz kurz schie|ßen.",
     "Der Ball saust knapp an Paul vor|bei.",
     "„Dein Pass war rich|tig su|per!“, ruft Jo|ko."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🤝"
     ],
     "leute": [
      "Leon",
      "Joko",
      "Klaas"
     ]
    },
    "zeilen": [
     "Am En|de steht es vier zu vier.",
     "Al|le vier sind ganz rot und mü|de.",
     "„Ihr zwei habt heu|te rich|tig toll ge|spielt“, sagt Paul.",
     "Le|on und Jo|ko klat|schen sich froh ab.",
     "„Mor|gen spie|len wir wie|der zu|sam|men“, sagt Klaas."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wohin will Joko mit Leon gehen?",
    "richtig": "zum Fußballplatz",
    "falsch": [
     "in die Bücherei",
     "in den Park"
    ],
    "seite": 1
   },
   {
    "frage": "Wer ist Klaas?",
    "richtig": "Jokos großer Bruder",
    "falsch": [
     "Pauls Freund",
     "Leons Nachbar"
    ],
    "seite": 2
   },
   {
    "frage": "Wer stellt sich zuerst ins Tor?",
    "richtig": "Leon",
    "falsch": [
     "Paul",
     "Joko"
    ],
    "seite": 3
   },
   {
    "frage": "Wohin rollt Jokos Ball?",
    "richtig": "ins leere Tor",
    "falsch": [
     "an den Pfosten",
     "über den Zaun"
    ],
    "seite": 5
   },
   {
    "frage": "Wie steht es am Ende des Spiels?",
    "richtig": "vier zu vier",
    "falsch": [
     "zwei zu eins",
     "drei zu null"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "f8-regen-auf-dem-schulweg",
  "titel": "Regen auf dem Schulweg",
  "bild": "☔",
  "seiten": [
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "☔"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Am frü|hen Mor|gen fal|len die ers|ten Trop|fen.",
     "Le|on zieht schnell sei|ne Re|gen|ja|cke an.",
     "An der E|cke war|tet schon Ro|mi|na.",
     "Sie hat ei|nen bun|ten Schirm da|bei.",
     "Heu|te ge|hen die bei|den lie|ber zu Fuß."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "☔",
      "💨"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Nach ein paar Schrit|ten reg|net es stär|ker.",
     "Dann kommt auch noch ein kräf|ti|ger Wind.",
     "Ro|mi|nas Schirm klappt plötz|lich nach o|ben.",
     "„Oh nein!“, ruft sie und lacht laut.",
     "Der Schirm sieht jetzt aus wie ei|ne Schüs|sel."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "💧"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Auf dem Geh|weg ste|hen gro|ße Pfüt|zen.",
     "Le|on hüpft ganz vor|sich|tig da|rum her|um.",
     "Ro|mi|na geht lie|ber au|ßen am Rand.",
     "Die bei|den ren|nen nicht auf die Stra|ße.",
     "Sie blei|ben schön or|dent|lich auf dem Geh|weg."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🏫",
      "💧"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "End|lich se|hen sie das gro|ße Schul|tor.",
     "Bei|de sind von o|ben bis un|ten nass.",
     "Von Le|ons Haa|ren tropft das Was|ser.",
     "Ro|mi|nas Ho|se klebt an den Bei|nen.",
     "Im Hof ist heu|te kein ein|zi|ges Kind."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "📒"
     ],
     "leute": [
      "Leon",
      "Romina",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "In der Klas|se ist es schön warm.",
     "Herr Ce|lis schaut die bei|den lan|ge an.",
     "„Ihr seid ja rich|tig nass ge|wor|den“, sagt er.",
     "Le|on nickt und friert ein biss|chen.",
     "Da hat Herr Ce|lis ei|ne I|dee."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🧥"
     ],
     "leute": [
      "Herr Celis",
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Er legt die nas|sen Ja|cken ü|ber die Hei|zung.",
     "Aus dem Schrank holt er zwei Hand|tü|cher.",
     "Le|on rub|belt sich die Haa|re tro|cken.",
     "Ro|mi|na macht es ge|nau|so.",
     "Bald ste|hen zwei klei|ne Pfüt|zen am Bo|den."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🍵"
     ],
     "leute": [
      "Leon",
      "Romina",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Dann holt Herr Ce|lis zwei Be|cher.",
     "Er gibt den bei|den war|men Tee.",
     "Le|on hält den Be|cher mit bei|den Hän|den.",
     "Lang|sam wird ihm wie|der schön warm.",
     "„Jetzt geht es mir viel bes|ser“, sagt Le|on."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🧥",
      "☀️"
     ],
     "leute": [
      "Leon",
      "Romina",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Nach der Pau|se sind die Ja|cken tro|cken.",
     "Drau|ßen scheint so|gar wie|der die Son|ne.",
     "„Dan|ke für den Tee!“, ru|fen die bei|den.",
     "Herr Ce|lis lacht und winkt ab.",
     "„Mor|gen neh|men wir zwei Schir|me mit“, sagt Ro|mi|na."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was hat Romina dabei?",
    "richtig": "einen bunten Schirm",
    "falsch": [
     "einen roten Roller",
     "eine große Tasche"
    ],
    "seite": 1
   },
   {
    "frage": "Was passiert mit Rominas Schirm?",
    "richtig": "Er klappt nach oben.",
    "falsch": [
     "Er fliegt weg.",
     "Er geht kaputt."
    ],
    "seite": 2
   },
   {
    "frage": "Was steht auf dem Gehweg?",
    "richtig": "große Pfützen",
    "falsch": [
     "viele Blätter",
     "ein alter Baum"
    ],
    "seite": 3
   },
   {
    "frage": "Wohin legt Herr Celis die Jacken?",
    "richtig": "über die Heizung",
    "falsch": [
     "auf die Bank",
     "vor die Tür"
    ],
    "seite": 6
   },
   {
    "frage": "Was bekommen die beiden zu trinken?",
    "richtig": "warmen Tee",
    "falsch": [
     "kalte Milch",
     "kühlen Apfelsaft"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "h13-der-wackelzahn",
  "titel": "Der Wackelzahn",
  "bild": "🦷",
  "seiten": [
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍎",
      "🥛"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Beim Früh|stück beißt Le|on in ei|nen Ap|fel.",
     "Auf ein|mal tut et|was ein biss|chen weh.",
     "Er fasst mit der Zun|ge nach vorn.",
     "Ein Zahn un|ten wa|ckelt hin und her.",
     "„Pa|pa, schau mal“, ruft er."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "😃",
      "🦷"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa schaut ganz ge|nau hin.",
     "„Der geht bald raus“, sagt er.",
     "Le|on freut sich und er|schrickt zu|gleich.",
     "Ob das wohl weh tut?",
     "Pa|pa schüt|telt den Kopf."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🦷",
      "✏️"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "In der Schu|le er|zählt Le|on es so|fort.",
     "Ro|mi|na hat schon vier Zäh|ne ver|lo|ren.",
     "„Es zwickt nur ganz kurz“, sagt sie.",
     "Jo|ko zeigt sei|ne gro|ße Lü|cke.",
     "Le|on wa|ckelt vor|sich|tig wei|ter."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🥪",
      "🦷"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "In der Pau|se isst Le|on sein Brot.",
     "Der Zahn wa|ckelt jetzt noch mehr.",
     "Er hängt fast nur noch an ei|nem Fa|den.",
     "Le|on kaut lie|ber auf der an|de|ren Sei|te.",
     "Bis nach Hau|se hält er durch."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🪞",
      "🦷"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zu Hau|se stellt er sich vor den Spie|gel.",
     "Er zieht die Lip|pe nach un|ten.",
     "Der Zahn steht ganz schief.",
     "Le|on holt tief Luft.",
     "Dann fasst er ihn mit zwei Fin|gern."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "✨",
      "🦷"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Ein klei|ner Ruck, und schon ist er drau|ßen.",
     "Le|on hält den Zahn in der Hand.",
     "Es hat fast gar nicht weh ge|tan.",
     "Er lacht in den Spie|gel.",
     "Die Lü|cke sieht rich|tig lus|tig aus."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "📦",
      "🦷"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa sucht ei|ne klei|ne Do|se.",
     "Da hin|ein legt Le|on den Zahn.",
     "Die Do|se stellt er auf sein Re|gal.",
     "„Den zei|ge ich mor|gen al|len“, sagt er.",
     "Pa|pa macht noch ein Fo|to."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🛏️",
      "🌙"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am A|bend fährt die Zun|ge im|mer wie|der hin.",
     "Die Lü|cke fühlt sich ganz fremd an.",
     "Le|on freut sich auf mor|gen.",
     "Dann kann er sie al|len zei|gen.",
     "Mit ei|nem Grin|sen schläft er ein."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wobei merkt Leon den Wackelzahn?",
    "richtig": "beim Apfelessen",
    "falsch": [
     "beim Zähneputzen",
     "beim Training"
    ],
    "seite": 1
   },
   {
    "frage": "Wie viele Zähne hat Romina schon verloren?",
    "richtig": "vier",
    "falsch": [
     "zwei",
     "sechs"
    ],
    "seite": 3
   },
   {
    "frage": "Was macht Leon in der Pause?",
    "richtig": "Er kaut auf der anderen Seite.",
    "falsch": [
     "Er isst nichts.",
     "Er zieht den Zahn."
    ],
    "seite": 4
   },
   {
    "frage": "Wo zieht Leon den Zahn heraus?",
    "richtig": "vor dem Spiegel",
    "falsch": [
     "in der Küche",
     "im Bett"
    ],
    "seite": 5
   },
   {
    "frage": "Wohin kommt der Zahn?",
    "richtig": "in eine kleine Dose",
    "falsch": [
     "unter das Kopfkissen",
     "in den Ranzen"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "h14-theos-neuer-ball",
  "titel": "Theos neuer Ball",
  "bild": "⚽",
  "seiten": [
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🎁"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "The|o bringt ei|nen neu|en Ball mit.",
     "Er ist weiß mit grü|nen Ster|nen.",
     "„Den ha|be ich zum Ge|burts|tag be|kom|men.“",
     "Der Ball glänzt in der Son|ne.",
     "Le|on darf ihn zu|erst hal|ten."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "💨"
     ],
     "leute": [
      "Theo"
     ]
    },
    "zeilen": [
     "The|o schießt ihn hoch in die Luft.",
     "Der Ball fliegt wei|ter als ge|dacht.",
     "Er rollt bis an den Zaun.",
     "„Der ist rich|tig leicht“, ruft The|o.",
     "Bei|de lau|fen hin|ter|her."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🥅",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on stellt sich ins Tor.",
     "Der neu|e Ball fühlt sich an|ders an.",
     "Er springt schnel|ler von den Hän|den ab.",
     "Zwei|mal rutscht er Le|on weg.",
     "Beim drit|ten Mal hält er ihn fest."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "😟",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Dann schießt The|o ganz nah an den Zaun.",
     "Der Ball trifft ei|nen spit|zen Draht.",
     "Es macht ein lei|ses Zi|schen.",
     "Die Luft geht lang|sam he|raus.",
     "The|o steht ganz still da."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "😢",
      "⚽"
     ],
     "leute": [
      "Theo"
     ]
    },
    "zeilen": [
     "„Er ist erst ei|nen Tag alt“, sagt The|o.",
     "Sei|ne Au|gen wer|den ganz glän|zend.",
     "Le|on weiß nicht gleich, was hel|fen kann.",
     "Er setzt sich ne|ben ihn ins Gras.",
     "Bei|de schau|en auf den fla|chen Ball."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🔧",
      "💡"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "„Mein Pa|pa hat so ein Flick|zeug“, sagt Le|on.",
     "Da|mit re|pa|riert er Fahr|rad|schläu|che.",
     "„Viel|leicht geht das auch beim Ball.“",
     "The|o hebt den Kopf.",
     "„Meinst du wirk|lich?“, fragt er."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🔧",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Theo",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa schaut sich das Loch ge|nau an.",
     "Es ist klei|ner als ein Punkt.",
     "Er klebt ein win|zi|ges Stück dar|auf.",
     "Dann pum|pen die bei|den den Ball auf.",
     "Er bleibt tat|säch|lich prall."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "😊"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "The|o schießt den Ball ge|gen die Wand.",
     "Er springt zu|rück wie vor|her.",
     "„Er hält“, sagt The|o er|leich|tert.",
     "Le|on stellt sich wie|der ins Tor.",
     "Den nächs|ten Schuss fängt er si|cher."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie sieht Theos Ball aus?",
    "richtig": "weiß mit grünen Sternen",
    "falsch": [
     "ganz gelb",
     "blau mit Punkten"
    ],
    "seite": 1
   },
   {
    "frage": "Was passiert am Zaun?",
    "richtig": "Die Luft geht heraus.",
    "falsch": [
     "Der Ball bleibt hängen.",
     "Der Ball fliegt darüber."
    ],
    "seite": 4
   },
   {
    "frage": "Was schlägt Leon vor?",
    "richtig": "das Flickzeug von Papa",
    "falsch": [
     "einen neuen Ball kaufen",
     "zum Training gehen"
    ],
    "seite": 6
   },
   {
    "frage": "Wie groß ist das Loch?",
    "richtig": "kleiner als ein Punkt",
    "falsch": [
     "so groß wie ein Finger",
     "man sieht es nicht"
    ],
    "seite": 7
   },
   {
    "frage": "Was macht Theo am Ende?",
    "richtig": "Er schießt gegen die Wand.",
    "falsch": [
     "Er nimmt den Ball mit heim.",
     "Er legt ihn weg."
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "h15-das-herbstbild",
  "titel": "Das Herbstbild",
  "bild": "🍁",
  "seiten": [
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🍁",
      "✂️"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Herr Ce|lis legt ei|nen Korb auf den Tisch.",
     "Dar|in lie|gen vie|le bun|te Blät|ter.",
     "„Die ha|be ich heu|te früh ge|sam|melt.“",
     "Man|che sind rot, an|de|re gelb.",
     "Ein paar sind noch ganz grün."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🍁",
      "📄"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Je|des Kind be|kommt ein gro|ßes Blatt Pa|pier.",
     "Da|rauf soll ein Bild ent|ste|hen.",
     "Le|on sucht sich sechs Blät|ter aus.",
     "Drei ro|te und drei gel|be.",
     "Er legt sie erst ein|mal hin."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🦔",
      "🍁"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Aus den ro|ten Blät|tern wird ein Kör|per.",
     "Die gel|ben wer|den zu Sta|cheln.",
     "So ent|steht lang|sam ein I|gel.",
     "Le|on klebt je|des Blatt ein|zeln fest.",
     "Der Kle|ber riecht ein biss|chen süß."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🖍️",
      "👀"
     ],
     "leute": [
      "Leon",
      "Mina"
     ]
    },
    "zeilen": [
     "Mi|na sitzt ne|ben ihm und schaut zu.",
     "Sie klebt ei|nen gro|ßen Baum.",
     "„Dei|nem I|gel feh|len die Au|gen“, sagt sie.",
     "Le|on malt zwei schwar|ze Punk|te.",
     "Jetzt schaut der I|gel ihn an."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🍁",
      "😟"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Ein gel|bes Blatt bricht beim An|drü|cken.",
     "Ein Stück bleibt am Fin|ger kle|ben.",
     "Le|on will es weg|wer|fen.",
     "Dann hat er ei|ne I|dee.",
     "Das Stück wird ein klei|ner Ap|fel."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🖼️",
      "👏"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Herr Ce|lis geht durch die Rei|hen.",
     "Bei Le|on bleibt er ste|hen.",
     "„Der Ap|fel ist ei|ne gu|te I|dee“, sagt er.",
     "Le|on wird ein biss|chen rot.",
     "Er klebt schnell wei|ter."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🖼️",
      "🍁"
     ],
     "leute": [
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Am En|de hän|gen al|le Bil|der an der Wand.",
     "Es gibt Bäu|me, Vö|gel und Son|nen.",
     "Nur ein I|gel ist da|bei.",
     "Die Wand sieht aus wie ein Wald.",
     "Herr Ce|lis macht ein Fo|to da|von."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🍁",
      "🎒"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auf dem Heim|weg schaut Le|on nach un|ten.",
     "Über|all lie|gen jetzt bun|te Blät|ter.",
     "Er hebt ein be|son|ders gro|ßes auf.",
     "Das steckt er in sein Heft.",
     "Zu Hau|se legt er es aufs Re|gal."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was bringt Herr Celis mit?",
    "richtig": "einen Korb mit Blättern",
    "falsch": [
     "Kastanien",
     "Farben und Pinsel"
    ],
    "seite": 1
   },
   {
    "frage": "Was klebt Leon aus den Blättern?",
    "richtig": "einen Igel",
    "falsch": [
     "einen Baum",
     "einen Vogel"
    ],
    "seite": 3
   },
   {
    "frage": "Was fehlt dem Igel zuerst?",
    "richtig": "die Augen",
    "falsch": [
     "die Stacheln",
     "die Beine"
    ],
    "seite": 4
   },
   {
    "frage": "Was macht Leon aus dem abgebrochenen Stück?",
    "richtig": "einen kleinen Apfel",
    "falsch": [
     "eine Wolke",
     "ein Blatt am Baum"
    ],
    "seite": 5
   },
   {
    "frage": "Was macht Leon auf dem Heimweg?",
    "richtig": "Er hebt ein Blatt auf.",
    "falsch": [
     "Er läuft schnell nach Hause.",
     "Er trifft Theo."
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "h16-das-laub-im-garten",
  "titel": "Das Laub im Garten",
  "bild": "🍂",
  "seiten": [
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🍂",
      "🧹"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Der gan|ze Gar|ten liegt vol|ler Laub.",
     "Man sieht kaum noch et|was Grü|nes.",
     "Pa|pa holt zwei Re|chen aus der Hüt|te.",
     "Ei|nen gro|ßen und ei|nen klei|nen.",
     "Der klei|ne ist ge|nau rich|tig für Le|on."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🍂",
      "💪"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Bei|de zie|hen das Laub zu|sam|men.",
     "Der Re|chen kratzt über den Bo|den.",
     "Nach kur|zer Zeit ist ein Hau|fen da.",
     "Er reicht Le|on fast bis zum Bauch.",
     "Pa|pa ar|bei|tet wei|ter hin|ten wei|ter."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🍂",
      "😃"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on schaut den Hau|fen lan|ge an.",
     "Dann nimmt er ein paar Schrit|te An|lauf.",
     "Er springt mit|ten in den Hau|fen hi|nein.",
     "Die Blät|ter flie|gen nach al|len Sei|ten.",
     "Es ra|schelt un|ter ihm wie Pa|pier."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "😅",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa dreht sich lang|sam um.",
     "Der Hau|fen ist wie|der über|all ver|teilt.",
     "Le|on schaut ein biss|chen schuld|be|wusst.",
     "Doch Pa|pa fängt an zu la|chen.",
     "„Dann noch ein|mal von vorn.“"
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🧹",
      "🍂"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die|ses Mal ar|bei|tet Le|on rich|tig mit.",
     "Er zieht von der He|cke zur Mit|te.",
     "Pa|pa kommt von der an|de|ren Sei|te.",
     "In der Mit|te tref|fen sich die Hau|fen.",
     "Jetzt ist es ein rie|si|ger Berg."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🦔",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Un|ter der He|cke ras|chelt et|was.",
     "Le|on bleibt so|fort ste|hen.",
     "Ein klei|ner I|gel schaut he|raus.",
     "„Da lässt du bes|ser Laub lie|gen“, sagt Pa|pa.",
     "Le|on nickt und geht zu|rück."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🍂",
      "🗑️"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Das Laub kommt in die gro|ße Ton|ne.",
     "Le|on hält den De|ckel fest.",
     "Pa|pa trägt Korb für Korb hi|nüber.",
     "Ein Rest bleibt für den I|gel lie|gen.",
     "Der Gar|ten sieht jetzt auf|ge|räumt aus."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍫",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Drin|nen sind Le|ons Hän|de ganz kalt.",
     "Pa|pa macht hei|ßen Ka|kao.",
     "Vom Fens|ter aus sieht man die He|cke.",
     "Da|hin|ter schläft jetzt der I|gel.",
     "Le|on sagt lei|se gu|te Nacht."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was holt Papa aus der Hütte?",
    "richtig": "zwei Rechen",
    "falsch": [
     "zwei Eimer",
     "eine Schaufel"
    ],
    "seite": 1
   },
   {
    "frage": "Was macht Leon mit dem ersten Haufen?",
    "richtig": "Er springt hinein.",
    "falsch": [
     "Er trägt ihn weg.",
     "Er zählt die Blätter."
    ],
    "seite": 3
   },
   {
    "frage": "Wie reagiert Papa darauf?",
    "richtig": "Er lacht.",
    "falsch": [
     "Er schimpft.",
     "Er geht hinein."
    ],
    "seite": 4
   },
   {
    "frage": "Was raschelt unter der Hecke?",
    "richtig": "ein kleiner Igel",
    "falsch": [
     "ein Vogel",
     "eine Katze"
    ],
    "seite": 6
   },
   {
    "frage": "Warum bleibt ein Rest Laub liegen?",
    "richtig": "für den Igel",
    "falsch": [
     "weil die Tonne voll ist",
     "weil es dunkel wird"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "h17-der-buechereiausweis",
  "titel": "Der Büchereiausweis",
  "bild": "🎫",
  "seiten": [
   {
    "szene": {
     "ort": "buecherei",
     "dinge": [
      "📚",
      "🎫"
     ],
     "leute": [
      "Leon",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "E|li|sa|beth fährt mit Le|on in die Bü|che|rei.",
     "Heu|te soll er ei|nen ei|ge|nen Aus|weis be|kom|men.",
     "Am Tre|sen steht ei|ne freund|li|che Frau.",
     "Sie fragt nach sei|nem Na|men.",
     "Le|on sagt ihn ganz deut|lich."
    ]
   },
   {
    "szene": {
     "ort": "buecherei",
     "dinge": [
      "🎫",
      "✏️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die Frau tippt et|was in den Rech|ner.",
     "Dann druckt sie ei|ne klei|ne Kar|te.",
     "Dar|auf steht Le|ons Na|me.",
     "„Jetzt bist du an|ge|mel|det“, sagt sie.",
     "Le|on hält die Kar|te fest."
    ]
   },
   {
    "szene": {
     "ort": "buecherei",
     "dinge": [
      "📚",
      "👀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "In den Re|ga|len ste|hen Hun|der|te Bü|cher.",
     "Ganz un|ten sind die für die Klei|nen.",
     "Wei|ter o|ben wird die Schrift klei|ner.",
     "Le|on geht lang|sam an al|lem vor|bei.",
     "Er zieht drei Bü|cher he|raus."
    ]
   },
   {
    "szene": {
     "ort": "buecherei",
     "dinge": [
      "📖",
      "🤔"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auf ei|nem Sitz|sack blät|tert er sie durch.",
     "Das ers|te hat zu vie|le Wör|ter.",
     "Das zwei|te hat fast nur Bil|der.",
     "Das drit|te ist ge|nau rich|tig.",
     "Es geht um ei|nen Hund im Sta|di|on."
    ]
   },
   {
    "szene": {
     "ort": "buecherei",
     "dinge": [
      "🤫",
      "📚"
     ],
     "leute": [
      "Leon",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "E|li|sa|beth sucht sich auch et|was aus.",
     "In der Bü|che|rei ist es sehr lei|se.",
     "Nur die Sei|ten ma|chen ein Ge|räusch.",
     "Le|on flüs|tert sei|ne Fra|ge.",
     "„Wie lan|ge darf ich es be|hal|ten?“"
    ]
   },
   {
    "szene": {
     "ort": "buecherei",
     "dinge": [
      "📅",
      "🎫"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "„Vier Wo|chen“, sagt E|li|sa|beth.",
     "Das ist ein gan|zer Mo|nat.",
     "Die Frau stem|pelt ein Da|tum hi|nein.",
     "Le|on schaut sich den Stem|pel an.",
     "So lan|ge braucht er be|stimmt nicht."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "📖",
      "🎫"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Drau|ßen trägt Le|on das Buch selbst.",
     "Den Aus|weis steckt er in die Ja|cke.",
     "Er fasst im|mer wie|der da|nach.",
     "Ver|lie|ren wä|re jetzt sehr dumm.",
     "Zu Hau|se legt er ihn in die Schub|la|de."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📖",
      "🛏️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "A|bends liest er die ers|ten Sei|ten.",
     "Der Hund im Buch heißt Ot|to.",
     "Ot|to läuft mit|ten aufs Spiel|feld.",
     "Le|on muss laut la|chen.",
     "Mor|gen liest er wei|ter."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wer fährt mit Leon in die Bücherei?",
    "richtig": "Elisabeth",
    "falsch": [
     "Papa",
     "Helena"
    ],
    "seite": 1
   },
   {
    "frage": "Was bekommt Leon am Tresen?",
    "richtig": "eine kleine Karte",
    "falsch": [
     "ein Buch geschenkt",
     "einen Stempel auf die Hand"
    ],
    "seite": 2
   },
   {
    "frage": "Wie viele Bücher zieht Leon heraus?",
    "richtig": "drei",
    "falsch": [
     "zwei",
     "fünf"
    ],
    "seite": 3
   },
   {
    "frage": "Worum geht es im dritten Buch?",
    "richtig": "um einen Hund im Stadion",
    "falsch": [
     "um einen Igel",
     "um eine Schule"
    ],
    "seite": 4
   },
   {
    "frage": "Wie lange darf Leon das Buch behalten?",
    "richtig": "vier Wochen",
    "falsch": [
     "eine Woche",
     "ein Jahr"
    ],
    "seite": 6
   }
  ]
 },
 {
  "id": "h18-minas-pausenspiel",
  "titel": "Minas Pausenspiel",
  "bild": "🎯",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🌧️",
      "🏫"
     ],
     "leute": [
      "Leon",
      "Mina"
     ]
    },
    "zeilen": [
     "Seit Ta|gen reg|net es in je|der Pau|se.",
     "Auf dem Hof ste|hen gro|ße Pfüt|zen.",
     "Fuß|ball geht heu|te nicht.",
     "Die Kin|der ste|hen un|ter dem Dach.",
     "Vie|le schau|en ein|fach nach drau|ßen."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "💡",
      "🎯"
     ],
     "leute": [
      "Mina"
     ]
    },
    "zeilen": [
     "Mi|na holt ei|ne Krei|de aus der Ta|sche.",
     "Da|mit malt sie Krei|se auf den Bo|den.",
     "In je|den Kreis schreibt sie ei|ne Zahl.",
     "Der kleins|te Kreis be|kommt die Zehn.",
     "„Wer trifft, be|kommt die Punk|te.“"
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🌰",
      "🎯"
     ],
     "leute": [
      "Leon",
      "Mina"
     ]
    },
    "zeilen": [
     "Ge|wor|fen wird mit ei|ner Kas|ta|nie.",
     "Man steht hin|ter ei|nem Strich.",
     "Le|on ist als Ers|ter dran.",
     "Sei|ne Kas|ta|nie lan|det in der Drei.",
     "Mi|na schreibt die Punk|te an die Wand."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎯",
      "👏"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "Jo|ko wirft viel zu weit.",
     "Sei|ne Kas|ta|nie rollt in ei|ne Pfüt|ze.",
     "Al|le la|chen, auch Jo|ko selbst.",
     "Beim zwei|ten Ver|such trifft er die Fünf.",
     "Er hebt bei|de Ar|me hoch."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎯",
      "🤔"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on über|legt sich et|was.",
     "Er wirft nicht mehr ge|ra|de|aus.",
     "Statt|des|sen lässt er die Kas|ta|nie hoch flie|gen.",
     "So fällt sie fast senk|recht her|un|ter.",
     "Sie bleibt in der Zehn lie|gen."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "👏",
      "🎯"
     ],
     "leute": [
      "Leon",
      "Mina"
     ]
    },
    "zeilen": [
     "„Wie hast du das ge|macht?“, fragt Mi|na.",
     "Le|on zeigt ihr den ho|hen Bo|gen.",
     "Gleich pro|bie|ren es al|le so.",
     "Jetzt tref|fen viel mehr Kin|der.",
     "Die Zah|len an der Wand wer|den grö|ßer."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🔔",
      "🌧️"
     ],
     "leute": [
      "Leon",
      "Mina"
     ]
    },
    "zeilen": [
     "Viel zu früh klin|gelt es wie|der.",
     "Der Re|gen wäscht die Krei|de weg.",
     "Mi|na schaut ein biss|chen trau|rig.",
     "„Mor|gen ma|le ich neu“, sagt sie.",
     "Le|on bringt dann die Kas|ta|ni|en mit."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "✏️",
      "🎯"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Herr Ce|lis hat aus dem Fens|ter ge|schaut.",
     "„Das war ei|ne gu|te I|dee“, sagt er.",
     "Er holt ei|ne Schach|tel Krei|de aus dem Schrank.",
     "Die darf Mi|na be|hal|ten.",
     "Jetzt gibt es je|den Tag ein Pau|sen|spiel."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Warum geht Fußball nicht?",
    "richtig": "Es regnet.",
    "falsch": [
     "Der Ball ist kaputt.",
     "Der Hof ist gesperrt."
    ],
    "seite": 1
   },
   {
    "frage": "Womit malt Mina die Kreise?",
    "richtig": "mit Kreide",
    "falsch": [
     "mit einem Stift",
     "mit Farbe"
    ],
    "seite": 2
   },
   {
    "frage": "Womit wird geworfen?",
    "richtig": "mit einer Kastanie",
    "falsch": [
     "mit einem Ball",
     "mit einem Stein"
    ],
    "seite": 3
   },
   {
    "frage": "Was macht Leon anders?",
    "richtig": "Er wirft in einem hohen Bogen.",
    "falsch": [
     "Er geht näher heran.",
     "Er wirft mit links."
    ],
    "seite": 5
   },
   {
    "frage": "Was schenkt Herr Celis Mina?",
    "richtig": "eine Schachtel Kreide",
    "falsch": [
     "einen Ball",
     "ein Buch"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "h19-kalte-haende-im-tor",
  "titel": "Kalte Hände im Tor",
  "bild": "🧤",
  "seiten": [
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "❄️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Frei|tag ist es rich|tig kalt ge|wor|den.",
     "Le|on sieht sei|nen A|tem in der Luft.",
     "Das Gras ist hart und grau.",
     "Sei|ne Hand|schu|he lie|gen im Beu|tel.",
     "Er zieht sie schnell an."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "😣"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Schon nach zehn Mi|nu|ten frie|ren die Fin|ger.",
     "Le|on macht im|mer wie|der ei|ne Faust.",
     "Es hilft nur ganz kurz.",
     "Der nächs|te Ball tut rich|tig weh.",
     "Er lässt ihn fal|len."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "😔",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "„Heu|te geht gar nichts“, denkt Le|on.",
     "Der zwei|te Ball rutscht auch weg.",
     "Sonst hält er die|se Schüs|se im|mer.",
     "Er schaut auf sei|ne ro|ten Hän|de.",
     "Am liebs|ten wür|de er auf|hö|ren."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "👐",
      "💡"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Trai|ner Jens kommt zu ihm ins Tor.",
     "„Halt die Hän|de vor den Mund“, sagt er.",
     "„Und dann lang|sam hi|nein|pus|ten.“",
     "Le|on macht es so|fort.",
     "Die war|me Luft kit|zelt ein biss|chen."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "💪"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Nach ein paar Mal wird es bes|ser.",
     "Die Fin|ger las|sen sich wie|der be|we|gen.",
     "Le|on macht das Dau|men-Drei|eck.",
     "Der nächs|te Ball bleibt in den Hän|den.",
     "Es tut nur noch ein biss|chen weh."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🔥",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zwi|schen|durch läuft Le|on ein paar Schrit|te.",
     "Trai|ner Jens sagt, das hel|fe auch.",
     "Wer steht, friert am schnells|ten.",
     "Al|so hüpft Le|on im Tor hin und her.",
     "Sei|ne Fü|ße wer|den wie|der warm."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "👏"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am En|de hält er vier Bäl|le hin|ter|ein|an|der.",
     "Die Mann|schaft ruft sei|nen Na|men.",
     "Trai|ner Jens klatscht ihn ab.",
     "„Kal|te Hän|de sind kei|ne Aus|re|de“, sagt er.",
     "Le|on grinst und nickt."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍫",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Zu Hau|se legt er die Hand|schu|he auf die Hei|zung.",
     "Pa|pa macht hei|ßen Ka|kao.",
     "Le|on hält die Tas|se mit bei|den Hän|den.",
     "Das ist der schöns|te Mo|ment.",
     "Mor|gen früh sind die Hand|schu|he tro|cken."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Woran merkt Leon die Kälte zuerst?",
    "richtig": "Er sieht seinen Atem.",
    "falsch": [
     "Es schneit.",
     "Der Ball ist hart."
    ],
    "seite": 1
   },
   {
    "frage": "Was passiert nach zehn Minuten?",
    "richtig": "Seine Finger frieren.",
    "falsch": [
     "Es fängt an zu regnen.",
     "Das Training ist aus."
    ],
    "seite": 2
   },
   {
    "frage": "Was soll Leon mit den Händen machen?",
    "richtig": "hineinpusten",
    "falsch": [
     "sie in die Hosentasche stecken",
     "sie aneinander reiben"
    ],
    "seite": 4
   },
   {
    "frage": "Warum hüpft Leon im Tor?",
    "richtig": "Wer steht, friert schneller.",
    "falsch": [
     "Um höher zu springen.",
     "Weil der Boden nass ist."
    ],
    "seite": 6
   },
   {
    "frage": "Wie viele Bälle hält Leon am Ende?",
    "richtig": "vier",
    "falsch": [
     "zwei",
     "acht"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "h20-nudeln-mit-papa",
  "titel": "Nudeln mit Papa",
  "bild": "🍝",
  "seiten": [
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍝",
      "🥄"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Heu|te darf Le|on das Es|sen aus|su|chen.",
     "Er wünscht sich Nu|deln mit To|ma|ten|so|ße.",
     "Pa|pa stellt ei|nen gro|ßen Topf be|reit.",
     "„Dann kochst du mit“, sagt er.",
     "Le|on holt sich ei|nen Ho|cker."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "💧",
      "🧂"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zu|erst kommt Was|ser in den Topf.",
     "Le|on trägt ihn mit bei|den Hän|den.",
     "Dann streut er ein we|nig Salz hi|nein.",
     "„Nicht zu viel“, sagt Pa|pa lä|chelnd.",
     "Das Was|ser soll ko|chen wie das Meer."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍅",
      "🔪"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa schnei|det Zwie|beln in klei|ne Stü|cke.",
     "Sei|ne Au|gen wer|den da|von feucht.",
     "Le|on drückt die To|ma|ten aus der Do|se.",
     "Das matscht rich|tig zwi|schen den Fin|gern.",
     "Sei|ne Hän|de sind bald ganz rot."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "⏲️",
      "🍝"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auf der Pa|ckung steht ei|ne Zahl.",
     "Neun Mi|nu|ten sol|len die Nu|deln ko|chen.",
     "Le|on stellt den Wec|ker da|nach.",
     "Dann schüt|tet er die Nu|deln hi|nein.",
     "Sie ver|schwin|den im spru|deln|den Was|ser."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥄",
      "🍅"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "In der Pfan|ne bro|delt die So|ße.",
     "Pa|pa gibt ein paar Kräu|ter da|zu.",
     "Le|on darf ein|mal um|rüh|ren.",
     "Da|bei spritzt es auf die Plat|te.",
     "Es zischt ganz kurz."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "⏲️",
      "😅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Der Wec|ker klin|gelt viel zu früh.",
     "Le|on fischt ei|ne Nu|del he|raus.",
     "Sie ist in|nen noch ganz hart.",
     "„Dann eine Mi|nu|te län|ger“, sagt Pa|pa.",
     "Die|ses Mal passt es ge|nau."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍝",
      "🧀"
     ],
     "leute": [
      "Leon",
      "Papa",
      "Helena"
     ]
    },
    "zeilen": [
     "Al|le set|zen sich an den Tisch.",
     "He|le|na streut Kä|se über ih|ren Tel|ler.",
     "Le|on nimmt lie|ber ex|tra viel So|ße.",
     "„Die ha|be ich ge|rührt“, sagt er stolz.",
     "Sein Tel|ler wird ganz schnell leer."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🧽",
      "🍝"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Nach dem Es|sen räumt Le|on ab.",
     "Der Topf muss lan|ge ein|wei|chen.",
     "Pa|pa wäscht, Le|on trock|net ab.",
     "„Nächs|te Wo|che wie|der?“, fragt Le|on.",
     "Pa|pa hält ihm die Hand hin."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was wünscht sich Leon zu essen?",
    "richtig": "Nudeln mit Tomatensoße",
    "falsch": [
     "Pfannkuchen",
     "Suppe"
    ],
    "seite": 1
   },
   {
    "frage": "Was kommt zuerst in den Topf?",
    "richtig": "Wasser",
    "falsch": [
     "die Nudeln",
     "die Soße"
    ],
    "seite": 2
   },
   {
    "frage": "Wie lange sollen die Nudeln kochen?",
    "richtig": "neun Minuten",
    "falsch": [
     "fünf Minuten",
     "eine halbe Stunde"
    ],
    "seite": 4
   },
   {
    "frage": "Wie ist die erste Nudel?",
    "richtig": "innen noch hart",
    "falsch": [
     "genau richtig",
     "zu weich"
    ],
    "seite": 6
   },
   {
    "frage": "Was macht Leon nach dem Essen?",
    "richtig": "Er trocknet ab.",
    "falsch": [
     "Er wäscht ab.",
     "Er geht nach draußen."
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "w42-kerwa",
  "titel": "Mit dem Bus zur Kerwa",
  "bild": "🎡",
  "ereignis": "2026-10-11",
  "zeigenAb": "2026-10-12",
  "zeigenBis": "2026-10-14",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌧️",
      "🪟"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "Am Sonn|tag war in Fürth Ker|wa.",
     "Am Mor|gen hat es stark ge|reg|net.",
     "Le|on woll|te am liebs|ten so|fort los.",
     "Paul woll|te lie|ber erst am A|bend.",
     "Ma|ma sag|te: „Wir war|ten den Re|gen ab.“"
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🛁",
      "🕒"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "Dann ent|schied Ma|ma: am Nach|mit|tag.",
     "So kom|men al|le nicht zu spät ins Bett.",
     "Paul muss|te vor|her noch in die Ba|de|wan|ne.",
     "Le|on war|te|te schon an der Tür.",
     "Er war rich|tig zap|pe|lig."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚏",
      "🚌"
     ],
     "leute": [
      "Leon",
      "Omi",
      "Opi"
     ]
    },
    "zeilen": [
     "An der Hal|te|stel|le war|te|ten O|mi und O|pi.",
     "Al|le woll|ten mit dem Bus fah|ren.",
     "Um elf nach drei kam der Bus.",
     "Le|on durf|te am Fens|ter sit|zen.",
     "Drau|ßen war es end|lich tro|cken."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🥁",
      "🎺"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Opi"
     ]
    },
    "zeilen": [
     "In der Stadt war ein Um|zug.",
     "Mu|sik|ka|pel|len lie|fen durch die Stra|ßen.",
     "Die Trom|meln wa|ren ganz laut.",
     "Sie schau|ten nur ein biss|chen zu.",
     "Dann gin|gen sie wei|ter zu den Bu|den."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🎡",
      "🎠"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "Ü|ber|all blink|ten bun|te Lich|ter.",
     "Es roch nach ge|brann|ten Man|deln.",
     "Ka|rus|sells dreh|ten sich im Kreis.",
     "Le|on staun|te mit gro|ßen Au|gen.",
     "So vie|le Leu|te wa|ren da!"
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🍭",
      "❤️"
     ],
     "leute": [
      "Leon",
      "Omi"
     ]
    },
    "zeilen": [
     "O|mi hielt Le|on an der Hand.",
     "Sie gin|gen an vie|len Bu|den vor|bei.",
     "Le|on such|te sich et|was Sü|ßes aus.",
     "O|pi mach|te mit Paul ei|nen Spaß.",
     "Al|le hat|ten gu|te Lau|ne."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚌",
      "🌆"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "Um sechs Uhr ging es wie|der heim.",
     "Wie|der fuh|ren al|le mit dem Bus.",
     "Le|on lehn|te sich an Ma|ma.",
     "Sei|ne Fü|ße wa|ren ganz mü|de.",
     "Paul gähn|te laut."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🕚",
      "🎒"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Diens|tag ist noch|mal Ker|wa.",
     "Da ist die Schu|le schon früh aus.",
     "Um zwan|zig nach elf klin|gelt es.",
     "Le|on freut sich auf den frei|en Mit|tag.",
     "Ker|wa ist ein|fach toll!"
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie war das Wetter am Morgen?",
    "richtig": "Es hat stark geregnet.",
    "falsch": [
     "Es war heiß.",
     "Es hat geschneit."
    ],
    "seite": 1
   },
   {
    "frage": "Wer musste vorher noch in die Badewanne?",
    "richtig": "Paul",
    "falsch": [
     "Leon",
     "Mama"
    ],
    "seite": 2
   },
   {
    "frage": "Um wie viel Uhr kam der Bus?",
    "richtig": "um elf nach drei",
    "falsch": [
     "um acht Uhr",
     "um zwölf Uhr"
    ],
    "seite": 3
   },
   {
    "frage": "Was war in der Stadt?",
    "richtig": "ein Umzug",
    "falsch": [
     "ein Fußballspiel",
     "ein Markt mit Tieren"
    ],
    "seite": 4
   },
   {
    "frage": "Wann ist am Dienstag die Schule aus?",
    "richtig": "um zwanzig nach elf",
    "falsch": [
     "um eins",
     "um vier"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "w42-omis-geburtstag",
  "titel": "Omi hat Geburtstag",
  "bild": "🎂",
  "ereignis": "2026-10-12",
  "zeigenAb": "2026-10-13",
  "zeigenBis": "2026-10-15",
  "seiten": [
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🎂",
      "📅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Mon|tag hat|te O|mi Ge|burts|tag.",
     "O|mi ist Pa|pas Ma|ma.",
     "Le|on hat sich schon lan|ge ge|freut.",
     "Ge|burts|ta|ge mag er sehr.",
     "Da gibt es im|mer viel zu fei|ern."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "💭",
      "🎁"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hat sich über|legt, was er sagt.",
     "„Al|les Gu|te, O|mi!“, will er ru|fen.",
     "Und er will sie ganz fest drü|cken.",
     "Das mag O|mi am liebs|ten.",
     "Viel|leicht malt er ihr noch et|was."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚗",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Am Nach|mit|tag ging es los.",
     "Pa|pa und Le|on fuh|ren nach Kalch|reuth.",
     "Dort woll|ten sie mit O|mi es|sen ge|hen.",
     "Die Bäu|me wa|ren schon bunt."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "💐",
      "🎂"
     ],
     "leute": [
      "Leon",
      "Omi"
     ]
    },
    "zeilen": [
     "Dann war es so weit.",
     "Le|on gra|tu|lier|te O|mi zum Ge|burts|tag.",
     "Das war ein schö|ner Mo|ment.",
     "O|mi hat sich be|stimmt sehr ge|freut."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "❓",
      "🎂"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Wie alt ist O|mi ei|gent|lich?",
     "Le|on weiß es gar nicht ge|nau.",
     "Er weiß nur, dass sie äl|ter ist als Pa|pa.",
     "Viel|leicht fragt er sie mal."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍽️",
      "😋"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Es|sen ge|hen ist et|was Be|son|de|res.",
     "Man sitzt an ei|nem gro|ßen Tisch.",
     "Je|der kann sich et|was aus|su|chen.",
     "Und kei|ner muss ab|wa|schen!",
     "Das macht Le|on Spaß."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🌙",
      "🚗"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Am A|bend fuh|ren sie wie|der heim.",
     "Le|on war mü|de.",
     "Es war ein lan|ger Tag.",
     "Am nächs|ten Tag war ja schon wie|der Schu|le."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎂",
      "❤️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on denkt noch ger|ne an den Tag.",
     "Ein Ge|burts|tag mit der Fa|mi|lie ist schön.",
     "Bald hat Le|on selbst Ge|burts|tag.",
     "Dann wird er acht Jah|re alt.",
     "Da|rauf freut er sich schon."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wer hatte am Montag Geburtstag?",
    "richtig": "Omi",
    "falsch": [
     "Opi",
     "Paul"
    ],
    "seite": 1
   },
   {
    "frage": "Was will Leon rufen?",
    "richtig": "Alles Gute, Omi!",
    "falsch": [
     "Gute Nacht!",
     "Hallo Papa!"
    ],
    "seite": 2
   },
   {
    "frage": "Wohin fuhren Papa und Leon?",
    "richtig": "nach Kalchreuth",
    "falsch": [
     "nach Berlin",
     "ins Freibad"
    ],
    "seite": 3
   },
   {
    "frage": "Was muss beim Essengehen keiner machen?",
    "richtig": "abwaschen",
    "falsch": [
     "essen",
     "sitzen"
    ],
    "seite": 6
   },
   {
    "frage": "Wie alt wird Leon bald?",
    "richtig": "acht Jahre",
    "falsch": [
     "sechs Jahre",
     "zehn Jahre"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "w42-kleeblatt",
  "titel": "Ein Tor zu wenig",
  "bild": "🍀",
  "ereignis": "2026-10-11",
  "zeigenAb": "2026-10-13",
  "zeigenBis": "2026-10-17",
  "seiten": [
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🏟️",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sonn|tag spiel|ten die Klee|blät|ter.",
     "So nennt man den Ver|ein aus Fürth.",
     "Sie spiel|ten in Ber|lin ge|gen Her|tha.",
     "Le|on war an dem Tag auf der Ker|wa.",
     "Das Er|geb|nis hat er erst spä|ter er|fah|ren."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🏟️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Das Sta|di|on in Ber|lin ist rie|sig.",
     "Lan|ge steht es null zu null.",
     "Dann schießt Her|tha ein Tor.",
     "Die Fans aus Fürth sind ganz lei|se.",
     "Ih|re grü|nen Fah|nen hän|gen nach un|ten."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "😟"
     ],
     "leute": []
    },
    "zeilen": [
     "Kurz da|nach fällt noch ein Tor.",
     "Wie|der für Her|tha.",
     "Jetzt steht es zwei zu null.",
     "Die Spie|ler aus Fürth ge|ben nicht auf.",
     "Sie lau|fen und kämp|fen wei|ter."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🎉"
     ],
     "leute": []
    },
    "zeilen": [
     "In der letz|ten Mi|nu|te pas|siert es.",
     "Fürth schießt end|lich ein Tor!",
     "Die Fans aus Fürth ju|beln laut.",
     "Doch dann pfeift der Schieds|rich|ter ab.",
     "Es en|det zwei zu eins für Her|tha."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📊",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on schaut sich die Ta|bel|le an.",
     "Am Sonn|tag stand Fürth auf Platz fünf|zehn.",
     "„Das ist ziem|lich weit un|ten“, denkt Le|on.",
     "Aber das kann sich schnell än|dern.",
     "Je|des Spiel ist ei|ne neu|e Chan|ce."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auch Nürn|berg hat am Wo|chen|en|de ge|spielt.",
     "Sie spiel|ten ge|gen Wolfs|burg.",
     "Am En|de stand es vier zu vier.",
     "„Acht To|re!“, staunt Le|on.",
     "Nürn|berg war auf Platz zwei."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sams|tag spielt Fürth wie|der.",
     "Dann kommt Braun|schweig nach Fürth.",
     "Das Spiel be|ginnt um ein Uhr mit|tags.",
     "Le|on hat da selbst ein Tur|nier.",
     "Da|nach will er gleich das Er|geb|nis wis|sen."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hängt sein Tri|kot an den Schrank.",
     "Er ist im|mer noch ein Klee|blatt|fan.",
     "Auch wenn sie ver|lo|ren ha|ben.",
     "„Am Sams|tag ge|win|nen wir“, sagt er.",
     "Und er meint da|mit bei|de Spie|le."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Gegen wen spielten die Kleeblätter am Sonntag?",
    "richtig": "gegen Hertha",
    "falsch": [
     "gegen Bayern",
     "gegen Nürnberg"
    ],
    "seite": 1
   },
   {
    "frage": "Wie steht es nach dem zweiten Tor für Hertha?",
    "richtig": "zwei zu null",
    "falsch": [
     "eins zu null",
     "drei zu null"
    ],
    "seite": 3
   },
   {
    "frage": "Wie endet das Spiel?",
    "richtig": "zwei zu eins für Hertha",
    "falsch": [
     "unentschieden",
     "eins zu null für Fürth"
    ],
    "seite": 4
   },
   {
    "frage": "Wie viele Tore gab es bei Nürnberg gegen Wolfsburg?",
    "richtig": "acht Tore",
    "falsch": [
     "zwei Tore",
     "kein Tor"
    ],
    "seite": 6
   },
   {
    "frage": "Wer kommt am Samstag nach Fürth?",
    "richtig": "Braunschweig",
    "falsch": [
     "Hertha",
     "Wolfsburg"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "w42-turnier",
  "titel": "Das Turnier in Nürnberg",
  "bild": "🏆",
  "ereignis": "2026-10-17",
  "zeigenAb": "2026-10-16",
  "zeigenBis": "2026-10-16",
  "seiten": [
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚗",
      "🏟️"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Am Sams|tag ist end|lich Tur|nier.",
     "Pa|pa fährt Le|on nach Nürn|berg.",
     "Der Platz ge|hört zum ESV Flü|gel|rad.",
     "Das ers|te Spiel be|ginnt um zehn Uhr.",
     "Le|on schaut aus dem Fens|ter."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🏟️",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Vier Mann|schaf|ten sind ge|mel|det.",
     "Flü|gel|rad hat so|gar zwei Teams.",
     "Da|zu kommt Ran|gier|bahn|hof.",
     "Und na|tür|lich der ASC Box|dorf.",
     "Das ist Le|ons Mann|schaft."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⏱️",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Es spie|len im|mer fünf ge|gen fünf.",
     "Ein Spiel dau|ert fünf|zehn Mi|nu|ten.",
     "Da|zwi|schen gibt es kur|ze Pau|sen.",
     "Dann kann man et|was trin|ken.",
     "Dann wird wei|ter|ge|spielt."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "🥅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on zieht sei|ne Hand|schu|he an.",
     "Er stellt sich ins Tor.",
     "Sein Herz klopft ganz schnell.",
     "Das ist ein biss|chen wie im Sta|di|on.",
     "Nur klei|ner."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die|se Wo|che trai|niert Le|on viel.",
     "Am Mitt|woch mit der Mann|schaft.",
     "Am Frei|tag mit Pa|pa im Tor.",
     "Am Sams|tag will er zei|gen, was er kann.",
     "Le|on ist be|reit."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "📣",
      "👏"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa ist am Platz da|bei.",
     "Das macht Le|on Mut.",
     "Le|on ist nicht al|lein auf dem Platz.",
     "Sei|ne gan|ze Mann|schaft ist da.",
     "Zu|sam|men sind sie stark."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📺",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Um ein Uhr spielt auch Fürth.",
     "Die Klee|blät|ter spie|len ge|gen Braun|schweig.",
     "Le|on will das Er|geb|nis wis|sen.",
     "Viel|leicht ge|win|nen heu|te al|le bei|de.",
     "Das wä|re ein schö|ner Tag."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on denkt an die Klee|blät|ter.",
     "„Wir hal|ten heu|te bei|de durch“, denkt er.",
     "Er zieht die Hand|schu|he fest.",
     "Dann läuft er ins Tor.",
     "Das Tur|nier kann be|gin|nen!"
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wer fährt Leon nach Nürnberg?",
    "richtig": "Papa",
    "falsch": [
     "Omi",
     "der Trainer"
    ],
    "seite": 1
   },
   {
    "frage": "Wie viele Mannschaften sind gemeldet?",
    "richtig": "vier",
    "falsch": [
     "zehn",
     "sieben"
    ],
    "seite": 2
   },
   {
    "frage": "Wie lange dauert ein Spiel?",
    "richtig": "fünfzehn Minuten",
    "falsch": [
     "eine Stunde",
     "fünf Minuten"
    ],
    "seite": 3
   },
   {
    "frage": "Wann trainiert Leon mit Papa?",
    "richtig": "am Freitag",
    "falsch": [
     "am Sonntag",
     "am Montag"
    ],
    "seite": 5
   },
   {
    "frage": "Gegen wen spielt Fürth?",
    "richtig": "gegen Braunschweig",
    "falsch": [
     "gegen Hertha",
     "gegen Bayern"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "w42-igel",
  "titel": "Ein Igel zu Besuch",
  "bild": "🦔",
  "ereignis": "2026-10-10",
  "zeigenAb": "2026-10-12",
  "zeigenBis": "2026-10-15",
  "seiten": [
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🍂",
      "🦔"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "Am Sams|tag hat Ma|ma ei|nen I|gel auf|ge|nom|men.",
     "Er war ganz klein und ganz kalt.",
     "Al|lein drau|ßen hät|te er es schwer.",
     "Ma|ma hat ihn vor|sich|tig mit|ge|nom|men.",
     "Jetzt ist er ein klei|ner Haus|gast."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "📦",
      "🧣"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "Der I|gel liegt in ei|ner war|men Kis|te.",
     "Er muss erst rich|tig warm wer|den.",
     "Le|on und Paul knien da|ne|ben.",
     "„Ist der süß!“, flüs|tert Le|on.",
     "Sie sind ganz be|geis|tert."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "📱",
      "🦔"
     ],
     "leute": [
      "Mama"
     ]
    },
    "zeilen": [
     "Ma|ma fragt bei der I|gel|hil|fe nach.",
     "Das sind Leu|te, die I|geln hel|fen.",
     "Sie ge|ben Ma|ma Tipps über das Han|dy.",
     "Ma|ma schickt ih|nen Bil|der vom I|gel.",
     "So wis|sen sie, wie es ihm geht."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥣",
      "🦔"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "Ein I|gel braucht das rich|ti|ge Fut|ter.",
     "Ma|ma hat ei|ne Pa|ste|te für ihn.",
     "Die ist gut für ei|nen I|gel.",
     "Dann frisst der I|gel end|lich et|was.",
     "Le|on ist rich|tig froh."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "⚖️",
      "🦔"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "Am Sonn|tag wiegt Ma|ma den I|gel.",
     "Er wiegt nur hun|dert|fünf|und|zwan|zig Gramm.",
     "Das ist wirk|lich win|zig.",
     "Ein I|gel braucht viel mehr für den Win|ter.",
     "Er muss noch viel fres|sen."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "❄️",
      "🏠"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "„Darf er wie|der raus?“, fragt Le|on.",
     "„Noch nicht“, sagt Ma|ma.",
     "„Er ist noch zu klein für den Win|ter.“",
     "„Er bleibt wohl bis zum Früh|ling hier.“",
     "Le|on freut sich sehr."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🌳",
      "🪺"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "O|ma hat ei|ne gu|te I|dee.",
     "Im Früh|ling bau|en die Kin|der ein Nest.",
     "Das Nest kommt ins Af|fen|wäld|chen.",
     "Dort kann der I|gel dann woh|nen.",
     "Und er be|kommt noch ein biss|chen Fut|ter."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌙",
      "🦔"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am A|bend denkt Le|on an den I|gel.",
     "Wel|chen Na|men soll er be|kom|men?",
     "Viel|leicht Sta|chel|chen oder Pieks|i?",
     "O|ma will ihn bald be|su|chen.",
     "Sie ist schon ganz ge|spannt."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wer kümmert sich um den Igel?",
    "richtig": "Mama",
    "falsch": [
     "Paul",
     "Opi"
    ],
    "seite": 1
   },
   {
    "frage": "Wo liegt der Igel?",
    "richtig": "in einer warmen Kiste",
    "falsch": [
     "im Garten",
     "in Leons Bett"
    ],
    "seite": 2
   },
   {
    "frage": "Wer gibt Mama Tipps?",
    "richtig": "die Igelhilfe",
    "falsch": [
     "der Tierarzt im Fernsehen",
     "Leons Lehrer"
    ],
    "seite": 3
   },
   {
    "frage": "Wie viel wiegt der Igel?",
    "richtig": "hundertfünfundzwanzig Gramm",
    "falsch": [
     "ein Kilo",
     "zehn Gramm"
    ],
    "seite": 5
   },
   {
    "frage": "Wohin kommt das Nest im Frühling?",
    "richtig": "ins Affenwäldchen",
    "falsch": [
     "in den Keller",
     "auf den Balkon"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "w42-training",
  "titel": "Training am Mittwoch",
  "bild": "🥅",
  "ereignis": "2026-10-14",
  "zeigenAb": "2026-10-13",
  "zeigenBis": "2026-10-14",
  "seiten": [
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "📅",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die|se Wo|che ist Le|on auf|ge|regt.",
     "Am Sams|tag hat er ein Tur|nier.",
     "Er spielt beim ASC Box|dorf.",
     "Le|on ist der Tor|wart.",
     "Vor|her wird noch trai|niert."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎒",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Mitt|woch ist das ers|te Trai|ning.",
     "Es be|ginnt um fünf Uhr.",
     "Le|on legt sei|ne Sa|chen schon be|reit.",
     "Die Tor|wart|hand|schu|he dür|fen nicht feh|len.",
     "Oh|ne die geht er nie ins Tor."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🥅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auf dem Platz trifft er sei|ne Freun|de.",
     "Al|le spie|len beim ASC Box|dorf.",
     "Sie wol|len am Sams|tag ge|win|nen.",
     "Da|für muss je|der mit|ma|chen.",
     "Auch der Tor|wart."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on weiß, was ein Tor|wart braucht.",
     "Er muss gut auf|pas|sen.",
     "Er muss schnell sprin|gen kön|nen.",
     "Und er darf kei|ne Angst vor dem Ball ha|ben.",
     "Le|on hat kei|ne Angst."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "💭"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on stellt sich schon vor, wie es wird.",
     "Ein Ball fliegt hoch aufs Tor.",
     "Le|on springt und fängt ihn.",
     "Sei|ne Freun|de klat|schen.",
     "Das wä|re toll!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Frei|tag gibt es noch mehr Trai|ning.",
     "Dann kommt so|gar Pa|pa mit.",
     "Da|von er|zählt ei|ne an|de|re Ge|schich|te.",
     "Erst ein|mal ist Mitt|woch dran."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌙",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Vor ei|nem Trai|ning geht Le|on früh ins Bett.",
     "Er will fit sein.",
     "Er macht die Au|gen zu.",
     "In sei|nem Kopf rollt ein Ball.",
     "Dann schläft er ein."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🥅",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on freut sich auf den Mitt|woch.",
     "Er freut sich auf den Ball.",
     "Er freut sich auf sei|ne Freun|de.",
     "Und am meis|ten freut er sich auf Sams|tag."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wann beginnt das Training am Mittwoch?",
    "richtig": "um fünf Uhr",
    "falsch": [
     "um zehn Uhr",
     "um acht Uhr"
    ],
    "seite": 2
   },
   {
    "frage": "Was darf nicht fehlen?",
    "richtig": "die Torwarthandschuhe",
    "falsch": [
     "die Mütze",
     "die Brille"
    ],
    "seite": 2
   },
   {
    "frage": "Für welchen Verein spielt Leon?",
    "richtig": "ASC Boxdorf",
    "falsch": [
     "ESV Flügelrad",
     "Hertha"
    ],
    "seite": 3
   },
   {
    "frage": "Wovor hat Leon keine Angst?",
    "richtig": "vor dem Ball",
    "falsch": [
     "vor dem Hund",
     "vor der Nacht"
    ],
    "seite": 4
   },
   {
    "frage": "Wer kommt am Freitag mit?",
    "richtig": "Papa",
    "falsch": [
     "Opi",
     "Paul"
    ],
    "seite": 6
   }
  ]
 },
 {
  "id": "w42-torwart",
  "titel": "Torwarttraining mit Papa",
  "bild": "🧤",
  "ereignis": "2026-10-16",
  "zeigenAb": "2026-10-15",
  "zeigenBis": "2026-10-16",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Frei|tag ist ein be|son|de|rer Tag.",
     "Le|on hat Tor|wart|trai|ning.",
     "Und Pa|pa kommt mit.",
     "Es be|ginnt um vier Uhr.",
     "Le|on kann es kaum er|war|ten."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Le|on stellt es sich schon vor.",
     "Pa|pa schießt flach und hoch.",
     "Le|on springt nach links und rechts.",
     "Sei|ne Hand|schu|he wer|den ganz dre|ckig.",
     "Aber das macht nichts."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "💪"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Ein Tor|wart muss viel üben.",
     "Er muss sich schnell auf den Bo|den wer|fen.",
     "Dann muss er schnell wie|der auf|ste|hen.",
     "Das ist ganz schön an|stren|gend.",
     "Le|on übt das gern."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🏃"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Um fünf Uhr geht es gleich wei|ter.",
     "Dann ist das nor|ma|le Trai|ning.",
     "Le|on ist dann schon warm.",
     "Sei|ne Freun|de kom|men da|zu.",
     "Jetzt wird für Sams|tag ge|übt."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🥅",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die Mann|schaft übt Päs|se und Tor|schüs|se.",
     "Le|on steht da|bei im Tor.",
     "Er ruft sei|nen Freun|den et|was zu.",
     "Ein Tor|wart sieht das gan|ze Feld.",
     "Er hilft so den an|de|ren."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎒",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Frei|tag|a|bend packt Le|on.",
     "Tri|kot, Ho|se und Stut|zen kom|men in die Ta|sche.",
     "Die Hand|schu|he legt er o|ben drauf.",
     "Die Fuß|ball|schu|he stellt er an die Tür."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🌙",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Dann geht er früh ins Bett.",
     "Mor|gen ist das Tur|nier.",
     "Le|on ist mü|de von den zwei Trai|nings.",
     "Aber er ist auch auf|ge|regt.",
     "Er ku|schelt sich in sei|ne De|cke."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🍀",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on denkt an das Tur|nier.",
     "Er will viel hal|ten.",
     "Er will sei|ner Mann|schaft hel|fen.",
     "Mit die|sem Ge|dan|ken schläft er ein."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wann beginnt das Torwarttraining?",
    "richtig": "um vier Uhr",
    "falsch": [
     "um fünf Uhr",
     "um neun Uhr"
    ],
    "seite": 1
   },
   {
    "frage": "Wie schießt Papa?",
    "richtig": "flach und hoch",
    "falsch": [
     "nur ganz leise",
     "mit dem Kopf"
    ],
    "seite": 2
   },
   {
    "frage": "Was ist um fünf Uhr?",
    "richtig": "das normale Training",
    "falsch": [
     "das Abendessen",
     "das Turnier"
    ],
    "seite": 4
   },
   {
    "frage": "Was legt Leon oben in die Tasche?",
    "richtig": "die Handschuhe",
    "falsch": [
     "die Trinkflasche",
     "ein Buch"
    ],
    "seite": 6
   },
   {
    "frage": "Was ist morgen?",
    "richtig": "das Turnier",
    "falsch": [
     "Omis Geburtstag",
     "ein Ausflug"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "w42-profi",
  "titel": "Ein Profi kommt in die Schule",
  "bild": "⭐",
  "ereignis": "2026-10-13",
  "zeigenAb": "2026-10-12",
  "zeigenBis": "2026-10-13",
  "seiten": [
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "⚽",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Diens|tag gibt es ei|ne Über|ra|schung.",
     "Ein Fuß|ball|pro|fi kommt in die Schu|le.",
     "Er spielt für die Klee|blät|ter aus Fürth.",
     "Le|on kann es kaum glau|ben.",
     "Ein ech|ter Pro|fi, bei ihm in der Schu|le!"
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🏫",
      "⏰"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Paul geht auch auf die|se Schu|le.",
     "Bei|de dür|fen den Pro|fi se|hen.",
     "Der Be|such be|ginnt um elf Uhr.",
     "Am Diens|tag ist die Schu|le früh aus.",
     "Denn in Fürth ist noch Ker|wa."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🗓️",
      "✍️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Der Pro|fi bringt et|was mit.",
     "Er ver|teilt Stun|den|plä|ne.",
     "Da|rauf steht, wann wel|ches Fach dran ist.",
     "Und er ver|teilt Au|to|gramm|kar|ten.",
     "Da|rauf ist sei|ne Un|ter|schrift."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "👕",
      "🧣"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Man darf auch et|was mit|brin|gen.",
     "Zum Bei|spiel ei|nen Schal oder ein Tri|kot.",
     "Der Pro|fi un|ter|schreibt dann da|rauf.",
     "Le|on über|legt lan|ge.",
     "Was soll er nur mit|neh|men?"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "💭",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Viel|leicht sein grü|nes Tri|kot.",
     "Oder viel|leicht sei|nen Schal.",
     "Bei|des mag er sehr.",
     "Mit ei|ner Un|ter|schrift wä|re es ein Schatz.",
     "Den wür|de er gut auf|he|ben."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "❓",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hat vie|le Fra|gen im Kopf.",
     "Wie oft trai|niert ein Pro|fi?",
     "War er als Kind auch Tor|wart?",
     "Ist er vor ei|nem Spiel auf|ge|regt?",
     "Viel|leicht darf Le|on et|was fra|gen."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🏟️",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sonn|tag ha|ben die Klee|blät|ter ver|lo|ren.",
     "Am Sams|tag spie|len sie wie|der.",
     "Dann kommt Braun|schweig nach Fürth.",
     "Le|on wünscht dem Pro|fi viel Glück.",
     "Viel|leicht sagt er ihm das so|gar."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌙",
      "⭐"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am A|bend vor|her ist Le|on ganz auf|ge|regt.",
     "Er legt sei|ne Sa|chen be|reit.",
     "Dann schließt er die Au|gen.",
     "Mor|gen trifft er ei|nen ech|ten Pro|fi.",
     "Das ist ein be|son|de|rer Tag."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Für welchen Verein spielt der Profi?",
    "richtig": "für die Kleeblätter aus Fürth",
    "falsch": [
     "für Hertha",
     "für Braunschweig"
    ],
    "seite": 1
   },
   {
    "frage": "Wann beginnt der Besuch?",
    "richtig": "um elf Uhr",
    "falsch": [
     "um acht Uhr",
     "um drei Uhr"
    ],
    "seite": 2
   },
   {
    "frage": "Was verteilt der Profi?",
    "richtig": "Stundenpläne und Autogrammkarten",
    "falsch": [
     "Bälle und Trikots",
     "Bonbons"
    ],
    "seite": 3
   },
   {
    "frage": "Was darf man mitbringen?",
    "richtig": "einen Schal oder ein Trikot",
    "falsch": [
     "ein Haustier",
     "ein Fahrrad"
    ],
    "seite": 4
   },
   {
    "frage": "Wer kommt am Samstag nach Fürth?",
    "richtig": "Braunschweig",
    "falsch": [
     "Hertha",
     "Nürnberg"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "w42-audi",
  "titel": "Ein neues Auto für Mama",
  "bild": "🚗",
  "ereignis": "2026-10-15",
  "zeigenAb": "2026-10-14",
  "zeigenBis": "2026-10-15",
  "seiten": [
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🚗",
      "✨"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "Ma|ma be|kommt ein neu|es Au|to.",
     "Am Don|ners|tag wird es ab|ge|holt.",
     "Le|on und Paul dür|fen mit|fah|ren.",
     "Le|on freut sich schon rie|sig.",
     "Ein neu|es Au|to ist auf|re|gend!"
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🗺️",
      "🛣️"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "Das Au|to steht in In|gol|stadt.",
     "Die Stadt liegt in Bay|ern.",
     "Die Fahrt dau|ert ein|ein|halb Stun|den.",
     "Das ist ganz schön weit.",
     "Am Nach|mit|tag geht es los."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚙",
      "🎲"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Was macht man auf so ei|ner lan|gen Fahrt?",
     "Man kann aus dem Fens|ter schau|en.",
     "Man kann Au|tos zäh|len.",
     "Oder man denkt sich Rät|sel aus.",
     "Dann geht die Zeit schnel|ler vor|bei."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🏢",
      "🚗"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "In In|gol|stadt baut die Fir|ma Au|di Au|tos.",
     "Dort gibt es ein gro|ßes Haus.",
     "Es heißt Au|di Fo|rum.",
     "Dort holt man sein neu|es Au|to ab.",
     "Ma|ma hat dort ei|nen Ter|min."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "❓",
      "🎨"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hat das Au|to noch nicht ge|se|hen.",
     "Wel|che Far|be es wohl hat?",
     "Ist es groß oder klein?",
     "Wie viel Platz gibt es hin|ten?",
     "Le|on ist sehr neu|gie|rig."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🔌",
      "⚡"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Au|di Fo|rum gibt es auch La|de|säu|len.",
     "Dort kön|nen E|lek|tro|au|tos Strom tan|ken.",
     "Fährt Ma|mas neu|es Au|to auch mit Strom?",
     "Das weiß Le|on noch nicht.",
     "Er wird es am Don|ners|tag se|hen."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚗",
      "🌇"
     ],
     "leute": [
      "Leon",
      "Mama"
     ]
    },
    "zeilen": [
     "Auf dem Heim|weg fah|ren sie mit dem neu|en Au|to.",
     "Al|les riecht noch ganz neu.",
     "Le|on schaut sich al|les ge|nau an.",
     "Viel|leicht gibt es ganz vie|le Knöp|fe.",
     "Was die wohl al|le ma|chen?"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌙",
      "🚗"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am A|bend ist Le|on mü|de.",
     "Es war ein lan|ger Aus|flug.",
     "Im Bett denkt er an das neu|e Au|to.",
     "Bald fährt er be|stimmt oft da|rin mit.",
     "Dar|auf freut er sich schon."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wer bekommt ein neues Auto?",
    "richtig": "Mama",
    "falsch": [
     "Papa",
     "Omi"
    ],
    "seite": 1
   },
   {
    "frage": "Wie lange dauert die Fahrt?",
    "richtig": "eineinhalb Stunden",
    "falsch": [
     "zehn Minuten",
     "einen ganzen Tag"
    ],
    "seite": 2
   },
   {
    "frage": "Was kann man auf der Fahrt machen?",
    "richtig": "Autos zählen",
    "falsch": [
     "schlafen gehen",
     "kochen"
    ],
    "seite": 3
   },
   {
    "frage": "Wie heißt das große Haus in Ingolstadt?",
    "richtig": "Audi Forum",
    "falsch": [
     "Kleeblatt-Halle",
     "Rathaus"
    ],
    "seite": 4
   },
   {
    "frage": "Was können Autos an Ladesäulen tanken?",
    "richtig": "Strom",
    "falsch": [
     "Wasser",
     "Benzin"
    ],
    "seite": 6
   }
  ]
 },
 {
  "id": "w42-frueher-aus",
  "titel": "Heute ist früher Schluss",
  "bild": "🕐",
  "ereignis": "2026-10-15",
  "zeigenAb": "2026-10-14",
  "zeigenBis": "2026-10-15",
  "seiten": [
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🏫",
      "🕐"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Don|ners|tag ist ein be|son|de|rer Tag.",
     "Die Schu|le ist für Le|on frü|her aus.",
     "Schon um ein Uhr ist Schluss.",
     "Für Paul gilt das auch.",
     "Le|on fin|det das pri|ma."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "📋",
      "✅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die Leh|re|rin|nen wis|sen schon Be|scheid.",
     "Die Schu|le hat es er|laubt.",
     "Le|on muss sich al|so kei|ne Sor|gen ma|chen.",
     "Al|les ist gut ge|plant."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎒",
      "🌅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Mor|gen packt Le|on sei|ne Schul|ta|sche.",
     "Er denkt schon an den Mit|tag.",
     "Ob die Zeit heu|te schnell ver|geht?",
     "Le|on ist ein biss|chen auf|ge|regt."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🕐",
      "👀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "In der Klas|se hängt ei|ne gro|ße Uhr.",
     "Le|on schaut im|mer wie|der hin.",
     "Um eins zeigt der klei|ne Zei|ger auf die Eins.",
     "Der gro|ße Zei|ger zeigt dann auf die Zwölf.",
     "Das kann Le|on schon le|sen!"
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "👋",
      "🎒"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Dann ist es end|lich so weit.",
     "Le|on packt sei|ne Sa|chen ein.",
     "Die an|de|ren Kin|der blei|ben noch da.",
     "Le|on winkt ih|nen zum Ab|schied.",
     "„Tschüss!“, ruft er fröh|lich."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🏫",
      "🚸"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Vor der Schu|le trifft er Paul.",
     "Paul geht in die vier|te Klas|se.",
     "Le|on geht in die zwei|te Klas|se.",
     "Heu|te wer|den bei|de zu|sam|men ab|ge|holt."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🗺️",
      "🚗"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "Heu|te steht noch et|was Gro|ßes an.",
     "Es geht nach In|gol|stadt.",
     "Dort war|tet Ma|mas neu|es Au|to.",
     "Die Fahrt dau|ert ein|ein|halb Stun|den.",
     "Da|rum ist frü|her Schluss."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧤",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Ein frei|er Mit|tag ist et|was Schö|nes.",
     "Am Frei|tag geht es dann wie|der nor|mal wei|ter.",
     "Dann ist auch wie|der Trai|ning.",
     "Le|on hat al|so viel zu er|zäh|len."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Um wie viel Uhr ist am Donnerstag Schluss?",
    "richtig": "um ein Uhr",
    "falsch": [
     "um acht Uhr",
     "um fünf Uhr"
    ],
    "seite": 1
   },
   {
    "frage": "Wer weiß schon Bescheid?",
    "richtig": "die Lehrerinnen",
    "falsch": [
     "der Busfahrer",
     "niemand"
    ],
    "seite": 2
   },
   {
    "frage": "Wohin zeigt der kleine Zeiger um eins?",
    "richtig": "auf die Eins",
    "falsch": [
     "auf die Drei",
     "auf die Sechs"
    ],
    "seite": 4
   },
   {
    "frage": "In welche Klasse geht Paul?",
    "richtig": "in die vierte Klasse",
    "falsch": [
     "in die dritte Klasse",
     "in die erste Klasse"
    ],
    "seite": 6
   },
   {
    "frage": "Wohin geht es nach der Schule?",
    "richtig": "nach Ingolstadt",
    "falsch": [
     "ins Schwimmbad",
     "zum Zahnarzt"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "w42-auto-ist-da",
  "titel": "Mamas neues Auto ist da",
  "bild": "🚗",
  "ereignis": "2026-10-15",
  "zeigenAb": "2026-10-16",
  "zeigenBis": "2026-10-18",
  "seiten": [
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚗",
      "✨"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "Am Don|ners|tag war ein be|son|de|rer Tag.",
     "Ma|ma hat ihr neu|es Au|to ge|holt.",
     "Le|on und Paul wa|ren da|bei.",
     "Sie sind zu|sam|men nach In|gol|stadt ge|fah|ren."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🏢",
      "🚗"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "In In|gol|stadt gibt es das Au|di Fo|rum.",
     "Dort hat das neu|e Au|to ge|war|tet.",
     "Ein ganz neu|es Au|to für Ma|ma!",
     "Für Le|on war das sehr auf|re|gend.",
     "So et|was er|lebt man nicht je|den Tag."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "📱",
      "📷"
     ],
     "leute": [
      "Mama"
     ]
    },
    "zeilen": [
     "Ma|ma hat Fo|tos ge|macht.",
     "Die Fo|tos hat sie an die Fa|mi|lie ge|schickt.",
     "Dann wis|sen al|le Be|scheid.",
     "Al|le sol|len sich mit|freu|en."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📱",
      "😄"
     ],
     "leute": [
      "Omi"
     ]
    },
    "zeilen": [
     "Omi hat die Fo|tos an|ge|schaut.",
     "Sie hat zu|rück|ge|schrie|ben.",
     "„Die Kin|der üben schon das Fah|ren!“",
     "Das war na|tür|lich ein Witz von Omi.",
     "Kin|der dür|fen noch nicht Au|to fah|ren."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🎡",
      "🧒"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on darf erst fah|ren, wenn er groß ist.",
     "Bis da|hin dau|ert es noch vie|le Jah|re.",
     "Aber hin|ter dem Lenk|rad sit|zen macht Spaß.",
     "Na|tür|lich nur, wenn das Au|to steht."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "📱",
      "💬"
     ],
     "leute": [
      "Opa"
     ]
    },
    "zeilen": [
     "Auch Tan|te Ste|fa|nie hat ge|schrie|ben.",
     "„Kommt gut nach Hau|se“, hat sie ge|schrie|ben.",
     "Opa hat auch ge|ant|wor|tet.",
     "„Auch von uns gu|te Fahrt“, schreibt er."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🛣️",
      "🌆"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "Dann ging es wie|der nach Hau|se.",
     "Die Fahrt dau|ert ein|ein|halb Stun|den.",
     "Da kann man gut aus dem Fens|ter schau|en.",
     "Oder man zählt die Au|tos auf der Stra|ße.",
     "Wie vie|le ro|te Au|tos fin|det Le|on wohl?"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🛏️",
      "🚗"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Was für ein Tag!",
     "Le|on hat jetzt viel zu er|zäh|len.",
     "Am Frei|tag geht es dann wie|der zum Trai|ning.",
     "Und am Sams|tag ist das Tur|nier.",
     "Im Traum fährt Le|on viel|leicht schon selbst."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wohin sind Leon, Paul und Mama gefahren?",
    "richtig": "nach Ingolstadt",
    "falsch": [
     "nach Berlin",
     "nach Bamberg"
    ],
    "seite": 1
   },
   {
    "frage": "Wie heißt das Haus, in dem das Auto gewartet hat?",
    "richtig": "Audi Forum",
    "falsch": [
     "Auto Turm",
     "Fürth Halle"
    ],
    "seite": 2
   },
   {
    "frage": "Was hat Mama an die Familie geschickt?",
    "richtig": "Fotos",
    "falsch": [
     "Kuchen",
     "einen Brief"
    ],
    "seite": 3
   },
   {
    "frage": "Was hat Omi als Witz geschrieben?",
    "richtig": "Die Kinder üben schon das Fahren!",
    "falsch": [
     "Ich komme gleich vorbei!",
     "Das Auto ist zu klein!"
    ],
    "seite": 4
   },
   {
    "frage": "Was hat Tante Stefanie geschrieben?",
    "richtig": "Kommt gut nach Hause",
    "falsch": [
     "Gute Nacht",
     "Viel Spaß im Kino"
    ],
    "seite": 6
   }
  ]
 },
 {
  "id": "w42-oscar",
  "titel": "Oscar schläft bei uns",
  "bild": "🛌",
  "ereignis": "2026-10-17",
  "zeigenAb": "2026-10-16",
  "zeigenBis": "2026-10-17",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🛌",
      "✨"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Am Sams|tag gibt es Be|such.",
     "Os|car kommt zu Paul und Le|on.",
     "Os|car ist Pauls Freund.",
     "Er schläft so|gar ei|ne Nacht bei ih|nen.",
     "Dar|über freut sich Paul be|stimmt sehr."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎒",
      "🧸"
     ],
     "leute": [
      "Paul",
      "Oscar"
     ]
    },
    "zeilen": [
     "Os|car bringt be|stimmt ei|ne Ta|sche mit.",
     "Da|rin sind Schlaf|an|zug und Zahn|bürs|te.",
     "Viel|leicht auch ein klei|nes Ku|schel|tier.",
     "Wer bei Freun|den schläft, packt gut ein."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🏠",
      "👋"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on freut sich auf den Be|such.",
     "Ein Gast im Haus ist im|mer span|nend.",
     "Was wer|den die Jun|gen wohl spie|len?",
     "Le|on hat schon ein paar I|de|en.",
     "Mit drei Kin|dern wird es lus|tig."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Oscar"
     ]
    },
    "zeilen": [
     "Viel|leicht spie|len sie Fuß|ball im Gar|ten.",
     "Le|on steht na|tür|lich im Tor.",
     "Paul und Os|car schie|ßen aufs Tor.",
     "Hält Le|on den Ball fest?",
     "Dann wird ge|tauscht, und Os|car hält."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧱",
      "🎲"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Oscar"
     ]
    },
    "zeilen": [
     "Oder sie bau|en zu|sam|men et|was Gro|ßes.",
     "Oder sie spie|len ein Brett|spiel.",
     "Bei je|dem Spiel gibt es Re|geln.",
     "Und je|der darf auch mal ver|lie|ren.",
     "Dann spielt man ein|fach noch ein|mal."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🌙",
      "🔦"
     ],
     "leute": [
      "Paul",
      "Oscar"
     ]
    },
    "zeilen": [
     "Am A|bend wird es drau|ßen dun|kel.",
     "Dann ist Schla|fens|zeit für al|le.",
     "Mit ei|ner Ta|schen|lam|pe ist es ge|müt|lich.",
     "Viel|leicht flüs|tern die Jun|gen noch ein biss|chen.",
     "Dann wird es end|lich ru|hig."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🛏️",
      "💤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auch Le|on liegt in sei|nem Bett.",
     "Er hört, wie es im Haus lei|se wird.",
     "Ein Gast in der Nacht ist et|was Be|son|de|res.",
     "Bald schla|fen al|le tief und fest."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥐",
      "☀️"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Oscar"
     ]
    },
    "zeilen": [
     "Am Sonn|tag|mor|gen sind al|le wie|der wach.",
     "Viel|leicht früh|stü|cken sie zu|sam|men.",
     "Spä|ter geht Os|car wie|der nach Hau|se.",
     "Das war ei|ne lus|ti|ge Nacht mit Freun|den!"
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wer ist Oscar?",
    "richtig": "Pauls Freund",
    "falsch": [
     "Leons Lehrer",
     "ein Nachbar"
    ],
    "seite": 1
   },
   {
    "frage": "Was ist in Oscars Tasche?",
    "richtig": "Schlafanzug und Zahnbürste",
    "falsch": [
     "ein Fußballtor",
     "ein Kuchen"
    ],
    "seite": 2
   },
   {
    "frage": "Wo steht Leon beim Fußball?",
    "richtig": "im Tor",
    "falsch": [
     "auf dem Dach",
     "in der Küche"
    ],
    "seite": 4
   },
   {
    "frage": "Was darf bei jedem Spiel jeder auch mal?",
    "richtig": "verlieren",
    "falsch": [
     "schummeln",
     "weglaufen"
    ],
    "seite": 5
   },
   {
    "frage": "Womit ist es am Abend gemütlich?",
    "richtig": "Taschenlampe",
    "falsch": [
     "Radio",
     "Trommel"
    ],
    "seite": 6
   }
  ]
 },
 {
  "id": "w42-fuerth-braunschweig",
  "titel": "Fürth gegen die Löwen",
  "bild": "🍀",
  "ereignis": "2026-10-17",
  "zeigenAb": "2026-10-16",
  "zeigenBis": "2026-10-17",
  "seiten": [
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sams|tag spielt wie|der Fürth.",
     "Das ist Le|ons Lieb|lings|ver|ein.",
     "Das Spiel be|ginnt um 13 Uhr.",
     "Es ist ein Heim|spiel in Fürth.",
     "Le|on ist ein gro|ßer Fan von Fürth."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🦁",
      "⚽"
     ],
     "leute": []
    },
    "zeilen": [
     "Der Geg|ner heißt Ein|tracht Braun|schweig.",
     "Auf ih|rem Wap|pen ist ein ro|ter Lö|we.",
     "Des|halb hei|ßen sie auch die Lö|wen.",
     "Aber die Für|ther wol|len stär|ker sein."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📺",
      "😟"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Das letz|te Spiel war in Ber|lin.",
     "Fürth hat dort 1:2 ver|lo|ren.",
     "Nur ein Tor hat ge|fehlt.",
     "Das war är|ger|lich für al|le Fans.",
     "Jetzt soll es end|lich wie|der klap|pen."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "📋",
      "🔢"
     ],
     "leute": []
    },
    "zeilen": [
     "Vor dem Spiel stand Fürth auf Platz 15.",
     "Vor dem Spiel hat|te Fürth 6 Punk|te.",
     "Für ei|nen Sieg gibt es 3 Punk|te.",
     "Dann hät|te Fürth schon 9 Punk|te.",
     "Ein Sieg wä|re al|so sehr wich|tig."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Vor|mit|tag spielt Le|on selbst.",
     "Er hat ein Tur|nier in Nürn|berg.",
     "Erst Fuß|ball spie|len, dann an Fürth den|ken?",
     "Das wä|re ein rich|ti|ger Fuß|ball|tag!"
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🍀",
      "💚"
     ],
     "leute": []
    },
    "zeilen": [
     "Fürth spielt in Grün und Weiß.",
     "Das Zei|chen von Fürth ist ein Klee|blatt.",
     "Des|halb hei|ßen die Spie|ler Klee|blät|ter.",
     "Ein Klee|blatt soll Glück brin|gen."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "📣",
      "🎶"
     ],
     "leute": []
    },
    "zeilen": [
     "Die Fans sin|gen und klat|schen laut.",
     "Sie wol|len ihr Team an|feu|ern.",
     "Das hilft den Spie|lern auf dem Ra|sen.",
     "Viel|leicht schießt Fürth dies|mal zwei To|re.",
     "Man hört die Fans im gan|zen Sta|di|on."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🤞",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on drückt Fürth fest die Dau|men.",
     "Wer wird das Spiel ge|win|nen?",
     "Das wis|sen wir erst am Sams|tag.",
     "Hof|fent|lich ju|belt Le|on am En|de."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Um wie viel Uhr beginnt das Spiel?",
    "richtig": "um 13 Uhr",
    "falsch": [
     "um 8 Uhr",
     "um 20 Uhr"
    ],
    "seite": 1
   },
   {
    "frage": "Wie heißt der Gegner von Fürth?",
    "richtig": "Eintracht Braunschweig",
    "falsch": [
     "Hertha BSC",
     "Bayern München"
    ],
    "seite": 2
   },
   {
    "frage": "Auf welchem Platz stand Fürth vor dem Spiel?",
    "richtig": "Platz 15",
    "falsch": [
     "Platz 2",
     "Platz 7"
    ],
    "seite": 4
   },
   {
    "frage": "Wo hat Leon am Vormittag ein Turnier?",
    "richtig": "in Nürnberg",
    "falsch": [
     "in Berlin",
     "in Bamberg"
    ],
    "seite": 5
   },
   {
    "frage": "Was ist das Zeichen von Fürth?",
    "richtig": "ein Kleeblatt",
    "falsch": [
     "ein Löwe",
     "ein Adler"
    ],
    "seite": 6
   }
  ]
 },
 {
  "id": "w42-familienabend",
  "titel": "Film und Sandwich",
  "bild": "🥪",
  "ereignis": "2026-10-16",
  "zeigenAb": "2026-10-17",
  "zeigenBis": "2026-10-19",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🏠",
      "🌙"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Frei|tag|a|bend war Fa|mi|li|en|a|bend.",
     "Drau|ßen wur|de es schon dun|kel.",
     "Drin|nen war es warm und hell.",
     "Le|on hat|te sich da|rauf ge|freut.",
     "Was wür|de es heu|te ge|ben?"
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍞",
      "🧀"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Zu|erst ging es in die Kü|che.",
     "Dort ha|ben sie Sand|wich ge|macht.",
     "Da|zu braucht man zwei Schei|ben Brot.",
     "Da|zwi|schen kommt, was man gern mag.",
     "Je|der durf|te sei|nes selbst be|le|gen."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥒",
      "🍅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on über|leg|te gut.",
     "Was soll|te auf sein Sand|wich?",
     "Viel|leicht Kä|se, viel|leicht ei|ne Gur|ke.",
     "Zum Schluss kam die zwei|te Schei|be drauf.",
     "Fer|tig war das Sand|wich!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🛋️",
      "📺"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Dann gin|gen sie zum Fern|se|her.",
     "Der Film hieß „Vi|vo – Vol|ler Le|ben“.",
     "Al|le mach|ten es sich be|quem.",
     "Ei|ne De|cke lag auf dem So|fa.",
     "Le|on ku|schel|te sich hi|nein."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🥪",
      "🎬"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Der Film fing an. Es wur|de still.",
     "Le|on biss in sein Sand|wich.",
     "Es schmeck|te ihm rich|tig gut.",
     "Kau|en und gu|cken geht gut zu|sam|men.",
     "Nur nicht zu viel krü|meln!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "😮",
      "😄"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Vi|vo ist ein klei|ner Wi|ckel|bär.",
     "Er liebt Mu|sik und singt gern.",
     "Le|on schau|te ganz ge|nau hin.",
     "Er woll|te nichts ver|pas|sen.",
     "Wie geht die Ge|schich|te wohl wei|ter?"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎬",
      "⭐"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Dann war der Film zu En|de.",
     "Wie fand Le|on ihn wohl?",
     "Ein Film zu|sam|men ist schö|ner als al|lein.",
     "Man kann da|nach da|rü|ber re|den.",
     "Was war die bes|te Stel|le?"
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🌙",
      "🛏️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Spä|ter ging Le|on ins Bett.",
     "Sein Bauch war satt.",
     "Er dach|te noch an den Film.",
     "Am Sams|tag war|te|te schon das Tur|nier.",
     "Das war ein ge|müt|li|cher A|bend!"
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wann war der Familienabend?",
    "richtig": "am Freitagabend",
    "falsch": [
     "am Montagmorgen",
     "am Sonntagmittag"
    ],
    "seite": 1
   },
   {
    "frage": "Was haben sie in der Küche gemacht?",
    "richtig": "Sandwich",
    "falsch": [
     "Pizza",
     "Kuchen"
    ],
    "seite": 2
   },
   {
    "frage": "Wie viele Scheiben Brot braucht ein Sandwich?",
    "richtig": "zwei",
    "falsch": [
     "eine",
     "fünf"
    ],
    "seite": 2
   },
   {
    "frage": "Wie hieß der Film?",
    "richtig": "Vivo",
    "falsch": [
     "Ice Age",
     "Kung Fu Panda"
    ],
    "seite": 4
   },
   {
    "frage": "Was liebt Vivo?",
    "richtig": "Musik",
    "falsch": [
     "Schnee",
     "Autos"
    ],
    "seite": 6
   }
  ]
 },
 {
  "id": "w42-turnier-zweiter",
  "titel": "Zweiter beim Turnier",
  "bild": "🥈",
  "ereignis": "2026-10-17",
  "zeigenAb": "2026-10-17",
  "zeigenBis": "2026-10-20",
  "seiten": [
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🏟️",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sams|tag war das Tur|nier.",
     "Es fand beim ESV Flü|gel|rad statt.",
     "Vier Mann|schaf|ten wa|ren da.",
     "Le|on spiel|te für den ASC Box|dorf.",
     "End|lich ging es los!"
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "🏃"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hat|te zwei Auf|ga|ben.",
     "Mal stand er im Tor.",
     "Dann trug er sei|ne Hand|schu|he.",
     "Mal spiel|te er drau|ßen mit.",
     "Dann lief er dem Ball hin|ter|her."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🥅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Im Tor muss man gut auf|pas|sen.",
     "Wo ist der Ball ge|ra|de?",
     "Drau|ßen muss man viel ren|nen.",
     "Man spielt den Ball zu den an|de|ren.",
     "Bei|des ist wich|tig für die Mann|schaft."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🥅",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am En|de gab es ein Elf|me|ter|schie|ßen.",
     "Da|bei schießt ein Spie|ler al|lein aufs Tor.",
     "Nur der Tor|wart steht da|vor.",
     "Le|on stand im Tor.",
     "Er mach|te sich ganz groß."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "😮"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Ein Spie|ler nach dem an|de|ren lief an.",
     "Le|on schau|te ge|nau auf den Ball.",
     "In wel|che E|cke fliegt er wohl?",
     "Das Herz klopf|te ganz schnell.",
     "Es war sehr span|nend."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🥅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Ganz am En|de kam et|was Be|son|de|res.",
     "Le|on durf|te auch selbst schie|ßen.",
     "Er leg|te den Ball auf den Punkt.",
     "Er lief an und schoss.",
     "Tor! Der Ball war drin!"
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🎉",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hat|te sich mit ei|nem Tor be|lohnt.",
     "Er war Tor|wart und Tor|schüt|ze zu|gleich.",
     "Das schafft nicht je|der.",
     "Da darf man rich|tig stolz sein.",
     "Was für ein Mo|ment!"
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🥈",
      "🏆"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Dann stand das Er|geb|nis fest.",
     "Le|ons Mann|schaft wur|de Zwei|ter.",
     "Nur ei|ne Mann|schaft war noch bes|ser.",
     "Von vier Mann|schaf|ten ist das toll.",
     "Zu|sam|men hat|ten sie gut ge|kämpft."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was machte Leon, wenn er nicht im Tor stand?",
    "richtig": "draußen mitspielen",
    "falsch": [
     "Eis essen",
     "schlafen"
    ],
    "seite": 2
   },
   {
    "frage": "Wo stand Leon beim Elfmeterschießen?",
    "richtig": "im Tor",
    "falsch": [
     "auf der Bank",
     "im Bus"
    ],
    "seite": 4
   },
   {
    "frage": "Was durfte Leon ganz am Ende machen?",
    "richtig": "selbst schießen",
    "falsch": [
     "pfeifen",
     "nach Hause gehen"
    ],
    "seite": 6
   },
   {
    "frage": "Was passierte bei Leons Schuss?",
    "richtig": "Tor",
    "falsch": [
     "daneben",
     "an die Latte"
    ],
    "seite": 6
   },
   {
    "frage": "Der Wievielte wurde Leons Mannschaft?",
    "richtig": "Zweiter",
    "falsch": [
     "Erster",
     "Vierter"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "w42-fuerth-sieg-badewanne",
  "titel": "Fürth gewinnt – und Leon sitzt in der Wanne",
  "bild": "🛁",
  "ereignis": "2026-10-17",
  "zeigenAb": "2026-10-18",
  "zeigenBis": "2026-10-20",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🛁",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sams|tag spiel|te Fürth zu Hau|se.",
     "Der Geg|ner war Ein|tracht Braun|schweig.",
     "Le|on woll|te das Spiel se|hen.",
     "Aber wo hat er zu|ge|schaut?",
     "In der Ba|de|wan|ne!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🛁",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die Ba|de|wan|ne war in Klee|blatt|far|ben.",
     "Grün und Weiß, wie bei Fürth.",
     "Le|on saß im war|men Was|ser.",
     "So ein Platz ist sel|ten.",
     "Ein ech|ter Fan schaut über|all zu."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🏟️"
     ],
     "leute": []
    },
    "zeilen": [
     "Das Spiel fing an.",
     "Bei|de Mann|schaf|ten woll|ten ge|win|nen.",
     "Die Für|ther lie|fen viel.",
     "Le|on schau|te ge|nau hin.",
     "Wann fällt end|lich ein Tor?"
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🥅"
     ],
     "leute": []
    },
    "zeilen": [
     "In der 32. Mi|nu|te war es so weit.",
     "Ein Spie|ler na|mens Klaus schoss ins Tor.",
     "Jetzt stand es 1:0 für Fürth.",
     "Le|on ju|bel|te in der Wan|ne.",
     "Das Was|ser schwapp|te ein biss|chen."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⏱️",
      "⚽"
     ],
     "leute": []
    },
    "zeilen": [
     "Dann war Halb|zeit.",
     "Die Spie|ler ruh|ten sich kurz aus.",
     "Da|nach ging es wei|ter.",
     "Braun|schweig woll|te den Aus|gleich.",
     "Aber Fürth hielt da|ge|gen."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🎉"
     ],
     "leute": []
    },
    "zeilen": [
     "In der 63. Mi|nu|te kam das nächs|te Tor.",
     "Wie|der hat|te Klaus ge|trof|fen.",
     "Jetzt stand es 2:0.",
     "Zwei To|re von ei|nem Spie|ler!",
     "So et|was nennt man ei|nen Dop|pel|pack."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🏆",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am En|de ge|wann Fürth 2:0.",
     "Vor|her war Fürth auf Platz 15.",
     "Am Sams|tag stand Fürth da|nach auf Platz 9.",
     "Das ist ein gro|ßer Sprung nach o|ben.",
     "Le|on freu|te sich sehr."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚽",
      "🥈"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Es war ein Tag nach Le|ons Ge|schmack.",
     "Am Mor|gen wur|de er beim Tur|nier Zwei|ter.",
     "Am Nach|mit|tag ge|wann sein Ver|ein.",
     "Das nächs|te Spiel ist in Os|na|brück.",
     "Le|on drückt schon jetzt die Dau|men."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wo schaute Leon das Spiel?",
    "richtig": "in der Badewanne",
    "falsch": [
     "im Stadion",
     "im Auto"
    ],
    "seite": 1
   },
   {
    "frage": "Welche Farben haben die Kleeblätter?",
    "richtig": "Grün und Weiß",
    "falsch": [
     "Rot und Gelb",
     "Blau und Schwarz"
    ],
    "seite": 2
   },
   {
    "frage": "Wer schoss das erste Tor für Fürth?",
    "richtig": "Klaus",
    "falsch": [
     "Leon",
     "der Torwart"
    ],
    "seite": 4
   },
   {
    "frage": "Wie viele Tore schoss Klaus?",
    "richtig": "zwei",
    "falsch": [
     "eins",
     "drei"
    ],
    "seite": 6
   },
   {
    "frage": "Auf welchem Platz stand Fürth am Samstag?",
    "richtig": "Platz 9",
    "falsch": [
     "Platz 4",
     "Platz 20"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "w43-training",
  "titel": "Training nach dem Turnier",
  "bild": "⚽",
  "lang": true,
  "ereignis": "2026-10-21",
  "zeigenAb": "2026-10-20",
  "zeigenBis": "2026-10-21",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Mitt|woch ist wie|der Trai|ning.",
     "Le|on packt sei|ne Fuß|ball|sa|chen.",
     "Schu|he, Stut|zen, Schien|bein|scho|ner.",
     "Und na|tür|lich sei|ne Tor|wart|hand|schu|he.",
     "Er freut sich schon den gan|zen Tag."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🥈",
      "💭"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sams|tag war ein Tur|nier.",
     "Le|ons Mann|schaft wur|de Zwei|ter.",
     "Le|on war mal im Tor.",
     "Und mal hat er im Feld ge|spielt.",
     "Das war ein tol|ler Tag."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am En|de gab es ein Elf|me|ter|schie|ßen.",
     "Da stand Le|on im Tor.",
     "Zum Schluss durf|te er selbst schie|ßen.",
     "Und er hat ge|trof|fen!",
     "Da|rauf ist er im|mer noch stolz."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🕔",
      "🚗"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Das Trai|ning ist beim ASC Box|dorf.",
     "Es fängt um fünf Uhr an.",
     "Um halb sie|ben ist es zu En|de.",
     "Le|on spielt bei den F-Ju|ni|o|ren.",
     "Da spie|len die jun|gen Kin|der."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "💃",
      "🎶"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Auch Paul hat am Mitt|woch et|was vor.",
     "Er geht in die Tanz|schu|le.",
     "Um halb fünf be|ginnt sein Kurs.",
     "Der Kurs heißt Kids-Dance.",
     "Da tan|zen Kin|der zu flot|ter Mu|sik."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚽",
      "💃"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Le|on spielt Fuß|ball, Paul tanzt.",
     "Bei|des ist Sport.",
     "Bei|des braucht schnel|le Fü|ße.",
     "Und bei|des macht rich|tig Spaß.",
     "Nur der Ball fehlt beim Tan|zen."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "👟"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auf dem Platz sind schon die an|de|ren.",
     "Al|le lau|fen sich warm.",
     "Le|on rennt ei|ne Run|de mit.",
     "Sei|ne Bei|ne sind ganz schnell.",
     "Dann holt je|des Kind ei|nen Ball."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🏃",
      "🔥"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Warm|lau|fen ist wich|tig.",
     "Da|bei wer|den die Mus|keln warm.",
     "War|me Mus|keln ver|let|zen sich nicht so leicht.",
     "Dann kann das Trai|ning rich|tig los|ge|hen."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🔺"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Oft gibt es zu|erst ei|ne Ü|bung mit Hüt|chen.",
     "Die Kin|der drib|beln um die Hüt|chen he|rum.",
     "Der Ball soll da|bei nah am Fuß blei|ben.",
     "Das ist gar nicht so leicht.",
     "A|ber mit Ü|bung klappt es im|mer bes|ser."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🥅",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Was übt Le|on heu|te wohl?",
     "Viel|leicht hält er wie|der Bäl|le.",
     "Viel|leicht schießt er auch auf das Tor.",
     "Bei|des macht ihm gro|ßen Spaß.",
     "Am liebs|ten steht er a|ber im Tor."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Als Tor|wart muss man mu|tig sein.",
     "Man springt nach dem Ball.",
     "Man fängt ihn mit bei|den Hän|den.",
     "Und man hält ihn ganz fest.",
     "Le|on kann das schon rich|tig gut."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🎯",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Beim Schuss aufs Tor zielt man ge|nau.",
     "Am bes|ten in ei|ne E|cke.",
     "Da kommt der Tor|wart schwer hin.",
     "Le|on kennt das von bei|den Sei|ten.",
     "Mal schießt er, mal hält er."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🏃"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am En|de vom Trai|ning gibt es oft ein Spiel.",
     "Zwei Mann|schaf|ten spie|len ge|gen|ein|an|der.",
     "Je|der will ein Tor schie|ßen.",
     "Da wird viel ge|lacht und ge|ru|fen.",
     "Al|le ru|fen: „Hier, zu mir!“"
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "💪"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Nach dem Tur|nier ist Le|on stolz.",
     "A|ber er will noch bes|ser wer|den.",
     "Da|rum geht er gern zum Trai|ning.",
     "Wer übt, wird im|mer bes|ser.",
     "Das weiß Le|on ge|nau."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🥤",
      "😅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Nach dem Trai|ning hat Le|on gro|ßen Durst.",
     "Er trinkt sei|ne Fla|sche fast leer.",
     "Sei|ne Wan|gen sind ganz rot.",
     "Das war an|stren|gend, a|ber schön.",
     "Dann geht es nach Hau|se."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌙",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am A|bend ist Le|on mü|de.",
     "Sei|ne Fü|ße tun ein biss|chen weh.",
     "A|ber er ist glück|lich.",
     "Im Bett denkt er an das nächs|te Spiel.",
     "Fuß|ball ist ein|fach das Bes|te!"
    ]
   }
  ],
  "fragen": [
   {
    "frage": "An welchem Tag ist das Training?",
    "richtig": "am Mittwoch",
    "falsch": [
     "am Sonntag",
     "am Montag"
    ],
    "seite": 1
   },
   {
    "frage": "Was hat Leon zum Schluss beim Turnier gemacht?",
    "richtig": "Er hat geschossen und getroffen.",
    "falsch": [
     "Er hat geweint.",
     "Er ist nach Hause gegangen."
    ],
    "seite": 3
   },
   {
    "frage": "Wann ist das Training zu Ende?",
    "richtig": "um halb sieben",
    "falsch": [
     "um acht Uhr",
     "um zwölf Uhr"
    ],
    "seite": 4
   },
   {
    "frage": "Wohin geht Paul am Mittwoch?",
    "richtig": "in die Tanzschule",
    "falsch": [
     "ins Schwimmbad",
     "in die Bücherei"
    ],
    "seite": 5
   },
   {
    "frage": "Wer übt, wird ...",
    "richtig": "immer besser",
    "falsch": [
     "immer müder",
     "immer kleiner"
    ],
    "seite": 14
   }
  ]
 },
 {
  "id": "w43-maria",
  "titel": "Maria feiert im Monkey Town",
  "bild": "🐒",
  "lang": true,
  "ereignis": "2026-10-23",
  "zeigenAb": "2026-10-21",
  "zeigenBis": "2026-10-23",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎉",
      "💌"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Frei|tag hat Ma|ri|a Ge|burts|tag.",
     "Sie fei|ert ei|ne Par|ty.",
     "Und Le|on ist ein|ge|la|den!",
     "Da|rü|ber freut er sich sehr.",
     "Er zählt schon die Ta|ge."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🐒",
      "🏠"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die Par|ty ist im Mon|key Town in Fürth.",
     "Das ist ein gro|ßer Spiel|platz.",
     "Er ist a|ber nicht drau|ßen.",
     "Er ist in ei|ner Hal|le.",
     "Da ist es auch bei Re|gen schön."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🐒",
      "🔤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Mon|key Town ist Eng|lisch.",
     "Mon|key heißt Af|fe.",
     "Town heißt Stadt.",
     "Al|so ist es ei|ne Af|fen|stadt!",
     "Le|on muss la|chen."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🛝",
      "🧗"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Was gibt es dort wohl al|les?",
     "Le|on stellt sich lan|ge Rut|schen vor.",
     "Viel|leicht gibt es auch Klet|ter|net|ze.",
     "Und viel|leicht ein Bad mit bun|ten Bäl|len.",
     "Le|on kann es kaum er|war|ten."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🏊",
      "🔴"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Ein Bäl|le|bad ist ein Be|cken vol|ler Bäl|le.",
     "Statt Was|ser sind da tau|send bun|te Bäl|le.",
     "Man springt hi|nein und ver|sinkt fast.",
     "Nur der Kopf schaut noch he|raus.",
     "Das kit|zelt ü|ber|all!"
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🐒",
      "🌴"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "In ei|ner Af|fen|stadt darf man klet|tern.",
     "Ge|nau wie ein Af|fe im Ur|wald.",
     "Hoch hi|nauf und schnell wie|der run|ter.",
     "Le|on klet|tert für sein Le|ben gern.",
     "Da ist er selbst fast ein klei|ner Af|fe."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🕝",
      "📅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die Par|ty fängt um halb drei an.",
     "Sie geht bis halb sechs.",
     "Das sind drei gan|ze Stun|den.",
     "Da ist viel Zeit zum Spie|len.",
     "Le|on will kei|ne Mi|nu|te ver|pas|sen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📝",
      "🏫"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Am Frei|tag|mor|gen schreibt Paul sei|ne Deutsch|pro|be.",
     "Am Nach|mit|tag geht Le|on zur Par|ty.",
     "Für bei|de ist es ein vol|ler Tag.",
     "A|ber Le|ons Teil ist ein|deu|tig lus|ti|ger.",
     "Pro|be o|der Par|ty? Le|on weiß, was er lie|ber mag."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎁",
      "💭"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zu ei|nem Ge|burts|tag ge|hört ein Ge|schenk.",
     "Was wünscht sich Ma|ri|a wohl?",
     "Le|on denkt lan|ge nach.",
     "Viel|leicht malt er ihr noch ei|ne Kar|te.",
     "Ei|ne Kar|te macht im|mer Freu|de."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🖍️",
      "🎈"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auf die Kar|te könn|te ein Af|fe kom|men.",
     "Ein Af|fe mit ei|nem Luft|bal|lon.",
     "Da|zu schreibt Le|on: Al|les Gu|te!",
     "Das kann er schon ganz al|lein.",
     "In der zwei|ten Klas|se lernt man so was."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🛝",
      "😄"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on mag es, wild zu to|ben.",
     "Er rennt gern und klet|tert gern.",
     "Auf ei|nem Spiel|platz ist er schnell.",
     "Im Mon|key Town kann er das al|les.",
     "Da wird er be|stimmt ganz ver|schwitzt."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🔄",
      "🏃"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Viel|leicht spie|len die Kin|der Fan|gen.",
     "Ei|ner ist der Fän|ger.",
     "Die an|de|ren ren|nen weg.",
     "Wer ge|fan|gen wird, ist jetzt der Fän|ger.",
     "Le|on ist schnell und schwer zu fan|gen."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🧦",
      "👟"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auf so ei|nem Spiel|platz trägt man oft Stop|per|so|cken.",
     "Die ha|ben klei|ne Nop|pen un|ten dran.",
     "Da|mit rutscht man nicht aus.",
     "Le|on fin|det die Nop|pen wit|zig.",
     "Sie se|hen aus wie klei|ne Punk|te."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🎂",
      "🕯️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Bei ei|ner Par|ty gibt es oft Ku|chen.",
     "Al|le sin|gen dann ein Lied.",
     "Das Ge|burts|tags|kind pus|tet die Ker|zen aus.",
     "Le|on singt be|stimmt laut mit.",
     "Viel|leicht be|kommt er ein Stück Ku|chen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🤝",
      "😊"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auf ei|ner Par|ty trifft man vie|le Kin|der.",
     "Man|che kennt man schon.",
     "Man|che lernt man neu ken|nen.",
     "Beim Spie|len wer|den sie schnell zu Freun|den.",
     "Spie|len geht ganz o|hne Wor|te."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎈",
      "🎂"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Und am Tag da|nach?",
     "Da hat Le|on selbst Ge|burts|tag!",
     "Was für ei|ne Wo|che!",
     "Erst Ma|ri|as Par|ty, dann sein ei|ge|ner Tag.",
     "Le|on ist rich|tig ge|spannt."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wer hat am Freitag Geburtstag?",
    "richtig": "Maria",
    "falsch": [
     "Paul",
     "Omi"
    ],
    "seite": 1
   },
   {
    "frage": "Was heißt Monkey?",
    "richtig": "Affe",
    "falsch": [
     "Hund",
     "Baum"
    ],
    "seite": 3
   },
   {
    "frage": "Wann fängt die Party an?",
    "richtig": "um halb drei",
    "falsch": [
     "um acht Uhr",
     "um Mitternacht"
    ],
    "seite": 7
   },
   {
    "frage": "Was könnte auf Leons Karte kommen?",
    "richtig": "ein Affe mit einem Luftballon",
    "falsch": [
     "ein Auto",
     "ein Schneemann"
    ],
    "seite": 10
   },
   {
    "frage": "Wer hat am Tag danach Geburtstag?",
    "richtig": "Leon",
    "falsch": [
     "Maria",
     "Mama"
    ],
    "seite": 16
   }
  ]
 },
 {
  "id": "w43-leon-acht",
  "titel": "Leon wird acht",
  "bild": "🎂",
  "lang": true,
  "ereignis": "2026-10-24",
  "zeigenAb": "2026-10-22",
  "zeigenBis": "2026-10-24",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "🎈"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sams|tag ist ein ganz be|son|de|rer Tag.",
     "Da hat Le|on Ge|burts|tag!",
     "Er wird acht Jah|re alt.",
     "Le|on kann es kaum glau|ben.",
     "Acht Jah|re, das ist schon rich|tig viel."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "7️⃣",
      "8️⃣"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Jetzt ist Le|on noch sie|ben.",
     "Bald ist er schon acht.",
     "Das ist ein Jahr mehr.",
     "Le|on fühlt sich schon ganz groß.",
     "Groß und ein biss|chen stolz."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "✋",
      "🤚"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on zeigt die Acht mit den Fin|gern.",
     "An ei|ner Hand zeigt er fünf.",
     "An der an|de|ren Hand zeigt er drei.",
     "Fünf und drei sind acht.",
     "Das kann er schon gut rech|nen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📏",
      "🌱"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "In ei|nem Jahr ist Le|on ge|wach|sen.",
     "Sei|ne Schu|he sind grö|ßer ge|wor|den.",
     "Er kann jetzt viel mehr le|sen.",
     "Und im Tor hält er schon vie|le Bäl|le."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥐",
      "🍳"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sams|tag gibt es ei|nen Brunch zu Hau|se.",
     "Brunch ist ein lus|ti|ges Wort.",
     "Es ist Früh|stück und Mit|tag|es|sen zu|sam|men.",
     "Man isst spät am Mor|gen und lan|ge.",
     "Das passt gut zu ei|nem Fest|tag."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍽️",
      "👨"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Die Fa|mi|lie fei|ert mit Le|on.",
     "Auch Pa|pa freut sich schon sehr.",
     "Am Ge|burts|tag sitzt man lan|ge am Tisch.",
     "Man re|det, lacht und isst.",
     "So ein Tag geht nie zu schnell vor|bei."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚪",
      "🔔"
     ],
     "leute": [
      "Leon",
      "Steffi"
     ]
    },
    "zeilen": [
     "Es kom|men auch Gäs|te.",
     "Tan|te Stef|fi kommt.",
     "Stef|fi ist Le|ons Tan|te.",
     "Le|on freut sich, wenn sie kommt.",
     "Sie um|armt ihn be|stimmt ganz fest."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚗",
      "🔔"
     ],
     "leute": [
      "Robert",
      "Marianne"
     ]
    },
    "zeilen": [
     "Auch Ro|bert kommt.",
     "Ro|bert ist Le|ons Tauf|pa|te.",
     "Er bringt Ma|ri|an|ne mit.",
     "Bei|de wol|len Le|on gra|tu|lie|ren.",
     "Le|on wird ganz schön oft um|armt."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "👶",
      "💧"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Was ist ei|gent|lich ein Tauf|pa|te?",
     "Als Le|on ein Ba|by war, wur|de er ge|tauft.",
     "Ro|bert war da|bei und ist sein Pa|te.",
     "Ein Pa|te ist ein Be|glei|ter fürs Le|ben.",
     "Das fin|det Le|on schön."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "👦",
      "👦"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Paul ist schon zehn Jah|re alt.",
     "Er ist Le|ons gro|ßer Bru|der.",
     "Paul bleibt im|mer der Äl|te|re.",
     "A|ber Le|on holt ein biss|chen auf.",
     "Das fin|det er lus|tig."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🎂",
      "🕯️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auf ei|nen Ku|chen für acht Jah|re ...",
     "... pas|sen acht Ker|zen.",
     "Acht klei|ne Flam|men in ei|ner Rei|he!",
     "Le|on möch|te sie al|le auf ein|mal aus|pus|ten.",
     "Da|zu muss er tief Luft ho|len."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎶",
      "🥳"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Be|stimmt singt dann je|mand ein Lied.",
     "Hoch soll er le|ben!",
     "Viel|leicht sin|gen al|le mit.",
     "Le|on wird da|bei ganz rot.",
     "A|ber in|nen drin freut er sich sehr."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎁",
      "💭"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hat vie|le Wün|sche.",
     "Am liebs|ten mag er Fuß|ball.",
     "Und na|tür|lich die Klee|blät|ter aus Fürth.",
     "Was er wohl be|kommt?",
     "Das bleibt noch ein Ge|heim|nis."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🔴",
      "🌙"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am A|bend spielt so|gar der Club.",
     "Ge|gen Kai|sers|lau|tern, um halb neun.",
     "Das ist spät für ein Ge|burts|tags|kind.",
     "Das Er|geb|nis kann Le|on am Sonn|tag le|sen.",
     "Am Sonn|tag spielt dann Fürth."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎉",
      "📅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Und das Bes|te kommt noch.",
     "Am Sonn|tag fei|ert Le|on wei|ter.",
     "Dann ist sein Kin|der|ge|burts|tag.",
     "Zwei Fes|te hin|ter|ein|an|der!",
     "Das gibt es nicht oft."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌙",
      "⭐"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am A|bend vor|her ist Le|on auf|ge|regt.",
     "Er kann gar nicht rich|tig ein|schla|fen.",
     "Mor|gen bin ich acht, denkt er.",
     "Dann lä|chelt er und schließt die Au|gen.",
     "Bald ist es so weit."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie alt wird Leon?",
    "richtig": "acht Jahre",
    "falsch": [
     "sechs Jahre",
     "zehn Jahre"
    ],
    "seite": 1
   },
   {
    "frage": "Was ist ein Brunch?",
    "richtig": "Frühstück und Mittagessen zusammen",
    "falsch": [
     "ein Fußballspiel",
     "ein Haustier"
    ],
    "seite": 5
   },
   {
    "frage": "Wer ist Leons Tante?",
    "richtig": "Steffi",
    "falsch": [
     "Marianne",
     "Maria"
    ],
    "seite": 7
   },
   {
    "frage": "Wer ist Leons Taufpate?",
    "richtig": "Robert",
    "falsch": [
     "Paul",
     "Klaus"
    ],
    "seite": 8
   },
   {
    "frage": "Wie viele Kerzen passen auf den Kuchen?",
    "richtig": "acht",
    "falsch": [
     "zwei",
     "zwanzig"
    ],
    "seite": 11
   }
  ]
 },
 {
  "id": "w43-uhr",
  "titel": "Eine Stunde geschenkt",
  "bild": "🕒",
  "lang": true,
  "ereignis": "2026-10-25",
  "zeigenAb": "2026-10-23",
  "zeigenBis": "2026-10-25",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🕒",
      "❓"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "In der Nacht zum Sonn|tag pas|siert et|was.",
     "Die Uhr wird um|ge|stellt.",
     "Le|on run|zelt die Stirn.",
     "Wie stellt man denn ei|ne Uhr um?",
     "Er fragt sich das den gan|zen Tag."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🕒",
      "🌙"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Um drei Uhr nachts ist es so weit.",
     "Dann springt die Uhr zu|rück.",
     "Aus drei Uhr wird zwei Uhr.",
     "Die Stun|de gibt es al|so zwei|mal.",
     "Ko|misch, o|der?"
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "😴",
      "🛏️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Da schla|fen fast al|le Men|schen.",
     "Auch Le|on liegt in sei|nem Bett.",
     "Er merkt von al|lem nichts.",
     "A|ber er darf ei|ne Stun|de län|ger schla|fen!",
     "Das ist die ge|schenk|te Stun|de."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "📱",
      "⏰"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Vie|le Uh|ren stel|len sich selbst um.",
     "Das Han|dy macht es ganz al|lein.",
     "Ei|ne al|te Wand|uhr kann das nicht.",
     "Bei ihr muss man selbst dre|hen.",
     "Man dreht den Zei|ger ei|ne Stun|de zu|rück."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "📱",
      "📡"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Wo|her weiß das Han|dy, dass die Zeit wech|selt?",
     "Es be|kommt ein Sig|nal.",
     "Dann stellt es sich in der Nacht um.",
     "Ganz von al|lein, wie von Zau|ber|hand."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🕰️",
      "🔍"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on schaut sich ei|ne Uhr ge|nau an.",
     "Sie hat ei|nen kur|zen und ei|nen lan|gen Zei|ger.",
     "Der kur|ze Zei|ger zeigt die Stun|den.",
     "Der lan|ge Zei|ger zeigt die Mi|nu|ten.",
     "Das hat Le|on in der Schu|le ge|lernt."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🕰️",
      "⬅️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Bei der Um|stel|lung wan|dert der kur|ze Zei|ger.",
     "Er geht ei|ne Zahl zu|rück.",
     "Von der Drei auf die Zwei.",
     "Der lan|ge Zei|ger bleibt, wo er ist.",
     "Ganz ein|fach ei|gent|lich."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "☀️",
      "🍂"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Jetzt be|ginnt die Win|ter|zeit.",
     "Am Mor|gen wird es frü|her hell.",
     "Am A|bend wird es frü|her dun|kel.",
     "Das ist im Herbst und Win|ter so.",
     "Die Ta|ge wer|den kür|zer."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🌆",
      "🍂"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Nach der Schu|le kommt bald die Dun|kel|heit.",
     "Dann ge|hen die La|ter|nen frü|her an.",
     "Le|on fin|det das ein biss|chen ge|müt|lich.",
     "Drin|nen ist es warm und hell.",
     "Dann kann man gut ku|scheln und le|sen."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🐿️",
      "🌰"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auch die Tie|re mer|ken den Herbst.",
     "Die Eich|hörn|chen sam|meln Nüs|se.",
     "Vie|le Vö|gel flie|gen in den Sü|den.",
     "Für die Tie|re gibt es kei|ne Uhr.",
     "Sie rich|ten sich nach der Son|ne."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🐿️",
      "🍂"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Man|che Tie|re hal|ten so|gar Win|ter|schlaf.",
     "Der Sie|ben|schlä|fer ge|hört da|zu.",
     "Er schläft ganz vie|le Mo|na|te lang.",
     "Da ist ei|ne Stun|de mehr gar nichts!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌸",
      "🕒"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Im Früh|ling geht es an|ders|he|rum.",
     "Dann wird die Uhr vor|ge|stellt.",
     "Dann fehlt ei|ne Stun|de Schlaf.",
     "Das mag Le|on gar nicht so gern.",
     "Im Herbst ist es zum Glück an|ders."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧠",
      "💡"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on merkt sich ei|nen Trick.",
     "Im Herbst stellt man die Gar|ten|mö|bel zu|rück.",
     "Und die Uhr auch.",
     "Im Früh|ling stellt man sie wie|der vor.",
     "So ver|gisst man es nie."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚽",
      "🕜"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sonn|tag spielt Fürth um halb zwei.",
     "Das ist schon die neu|e Zeit.",
     "Le|on muss sich die Uhr gut an|se|hen.",
     "Sonst ver|passt er noch den An|pfiff!",
     "Das wä|re wirk|lich scha|de."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎂",
      "🕒"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die|se Nacht kommt nach Le|ons Ge|burts|tag.",
     "Er hat al|so ei|ne lan|ge Nacht.",
     "Erst ein schö|ner Tag, dann lan|ger Schlaf.",
     "Bes|ser geht es fast nicht!",
     "Gu|te Nacht, Le|on!"
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was passiert in der Nacht zum Sonntag?",
    "richtig": "Die Uhr wird umgestellt.",
    "falsch": [
     "Es schneit.",
     "Die Schule fängt an."
    ],
    "seite": 1
   },
   {
    "frage": "Was wird aus drei Uhr?",
    "richtig": "zwei Uhr",
    "falsch": [
     "vier Uhr",
     "zwölf Uhr"
    ],
    "seite": 2
   },
   {
    "frage": "Was zeigt der kurze Zeiger?",
    "richtig": "die Stunden",
    "falsch": [
     "die Tage",
     "das Wetter"
    ],
    "seite": 6
   },
   {
    "frage": "Wonach richten sich die Tiere?",
    "richtig": "nach der Sonne",
    "falsch": [
     "nach dem Handy",
     "nach dem Fernseher"
    ],
    "seite": 10
   },
   {
    "frage": "Wann spielt Fürth am Sonntag?",
    "richtig": "um halb zwei",
    "falsch": [
     "um sieben Uhr",
     "um Mitternacht"
    ],
    "seite": 14
   }
  ]
 },
 {
  "id": "w43-fuerth-osnabrueck",
  "titel": "Fürth fährt nach Osnabrück",
  "bild": "🍀",
  "lang": true,
  "ereignis": "2026-10-25",
  "zeigenAb": "2026-10-24",
  "zeigenBis": "2026-10-25",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🍀",
      "📅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sonn|tag spielt Fürth wie|der.",
     "Der Geg|ner heißt VfL Os|na|brück.",
     "Das Spiel be|ginnt um halb zwei.",
     "Le|on hat sich die Zeit ge|merkt.",
     "Er ist schon ganz ge|spannt."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚌",
      "🗺️"
     ],
     "leute": []
    },
    "zeilen": [
     "Die|ses Mal spielt Fürth nicht zu Hau|se.",
     "Os|na|brück liegt weit im Nor|den.",
     "Die Spie|ler müs|sen weit rei|sen.",
     "Von Fürth aus dau|ert das Stun|den.",
     "Das ist ei|ne gro|ße Rei|se."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🗺️",
      "🌳"
     ],
     "leute": []
    },
    "zeilen": [
     "Os|na|brück liegt in Nie|der|sach|sen.",
     "Fürth liegt in Bay|ern.",
     "Da|zwi|schen lie|gen vie|le Fel|der und Wäl|der.",
     "Mit dem Au|to dau|ert die Fahrt fast fünf Stun|den."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🏟️"
     ],
     "leute": []
    },
    "zeilen": [
     "Ein Spiel in ei|ner frem|den Stadt ...",
     "... nennt man ein Aus|wärts|spiel.",
     "Dort ju|beln die meis|ten Fans für den Geg|ner.",
     "Das ist für Fürth nicht leicht.",
     "Zu Hau|se spielt es sich leich|ter."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🍀",
      "📣"
     ],
     "leute": []
    },
    "zeilen": [
     "A|ber ei|ni|ge Für|ther Fans fah|ren mit.",
     "Sie sin|gen und fei|ern ihr Team.",
     "Sie tra|gen Grün und Weiß.",
     "So sind die Spie|ler nicht al|lein.",
     "Sie hö|ren ih|re Fans sin|gen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚽",
      "🥅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on denkt an das letz|te Spiel.",
     "Da hat Fürth zwei zu null ge|won|nen.",
     "Klaus hat bei|de To|re ge|schos|sen.",
     "Viel|leicht trifft er ja wie|der?",
     "Das wä|re su|per."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🍀",
      "👕"
     ],
     "leute": []
    },
    "zeilen": [
     "Die Für|ther spie|len in Grün und Weiß.",
     "Os|na|brück spielt in Li|la und Weiß.",
     "Auf dem Platz kann man sie gut un|ter|schei|den.",
     "So weiß je|der, wer zu wem ge|hört."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📋",
      "🔟"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on schaut noch ein|mal auf die Ta|bel|le.",
     "Vor dem Spiel stand Fürth auf Platz zehn.",
     "Fürth hat|te neun Punk|te.",
     "Os|na|brück hat|te acht Punk|te.",
     "Das ist nur ei|ner we|ni|ger."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚖️",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Bei|de Mann|schaf|ten sind al|so fast gleich gut.",
     "Das macht das Spiel be|son|ders span|nend.",
     "Je|der Punkt ist wich|tig.",
     "Wer ge|winnt, klet|tert in der Ta|bel|le.",
     "Wer ver|liert, rutscht nach un|ten."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "😕"
     ],
     "leute": []
    },
    "zeilen": [
     "Os|na|brück hat zu|letzt in Bie|le|feld ge|spielt.",
     "Dort hat Os|na|brück ver|lo|ren.",
     "Es ging zwei zu eins für Bie|le|feld aus.",
     "Jetzt will Os|na|brück zu Hau|se ge|win|nen.",
     "Fürth muss al|so gut auf|pas|sen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🔢",
      "🏆"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Für ei|nen Sieg gibt es drei Punk|te.",
     "Dann hät|te Fürth zwölf Punk|te.",
     "Neun und drei sind zwölf.",
     "Le|on rech|net gern mit Fuß|ball.",
     "Fuß|ball und Ma|the pas|sen gut zu|sam|men."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🤝",
      "🔢"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Und bei ei|nem Un|ent|schie|den?",
     "Dann gibt es für je|den ei|nen Punkt.",
     "Fürth hät|te dann zehn Punk|te.",
     "Das wä|re auch nicht schlecht.",
     "Bei ei|ner Nie|der|la|ge gibt es kei|nen Punkt."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📺",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on stellt sich das Spiel vor.",
     "Ein Pass, noch ein Pass, dann ein Schuss.",
     "Tor für Fürth!",
     "So soll es am Sonn|tag sein."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🕒",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Vor dem Spiel wird nachts die Uhr um|ge|stellt.",
     "Le|on darf ei|ne Stun|de län|ger schla|fen.",
     "So ist er beim An|pfiff rich|tig wach.",
     "Das passt doch gut!",
     "Gut ge|schla|fen schaut es sich bes|ser zu."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎂",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sams|tag hat Le|on Ge|burts|tag.",
     "Am Sonn|tag spielt sein Ver|ein.",
     "Ein Sieg wä|re wie ein Ge|schenk.",
     "Das wünscht sich Le|on sehr.",
     "Ein Tor von Klaus wä|re das Größ|te."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🤞",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on drückt fest die Dau|men.",
     "„Auf geht's, Klee|blät|ter!“, ruft er.",
     "Ob Fürth ge|winnt?",
     "Das weiß noch nie|mand.",
     "Ge|nau das macht Fuß|ball so span|nend."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie heißt der Gegner von Fürth?",
    "richtig": "VfL Osnabrück",
    "falsch": [
     "Eintracht Braunschweig",
     "Bayern München"
    ],
    "seite": 1
   },
   {
    "frage": "Wie nennt man ein Spiel in einer fremden Stadt?",
    "richtig": "Auswärtsspiel",
    "falsch": [
     "Heimspiel",
     "Training"
    ],
    "seite": 4
   },
   {
    "frage": "Wie viele Punkte hatte Osnabrück vor dem Spiel?",
    "richtig": "acht",
    "falsch": [
     "zwei",
     "zwanzig"
    ],
    "seite": 8
   },
   {
    "frage": "Wie viele Punkte gibt es für einen Sieg?",
    "richtig": "drei",
    "falsch": [
     "sieben",
     "hundert"
    ],
    "seite": 11
   },
   {
    "frage": "Was ruft Leon?",
    "richtig": "Auf geht's, Kleeblätter!",
    "falsch": [
     "Gute Nacht!",
     "Ich will nach Hause!"
    ],
    "seite": 16
   }
  ]
 },
 {
  "id": "w43-club",
  "titel": "Der Club spielt am Abend",
  "bild": "📺",
  "lang": true,
  "ereignis": "2026-10-24",
  "zeigenAb": "2026-10-23",
  "zeigenBis": "2026-10-24",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🍀",
      "🔴"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on ist ein Fan von Fürth.",
     "Ganz in der Nä|he liegt Nürn|berg.",
     "Dort spielt der 1. FC Nürn|berg.",
     "Al|le nen|nen ihn nur den Club.",
     "Das ist ein kur|zer Na|me."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚔️",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Fürth und der Club sind Ri|va|len.",
     "So nennt man zwei Geg|ner, die sich gut ken|nen.",
     "Spie|len sie ge|gen|ein|an|der, ist es laut.",
     "Das ist ein ganz be|son|de|res Spiel.",
     "Man nennt es auch Fran|ken|der|by."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚋",
      "🗺️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Fürth und Nürn|berg lie|gen ganz dicht bei|ein|an|der.",
     "Man kann mit der U-Bahn hin|fah|ren.",
     "Die Städ|te sind wie Nach|barn.",
     "Nur beim Fuß|ball sind sie Geg|ner.",
     "Da|nach ver|tra|gen sie sich wie|der."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📋",
      "2️⃣"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on schaut auf die Ta|bel|le.",
     "Am Frei|tag stand der Club auf Platz zwei.",
     "Er hat|te schon acht|zehn Punk|te.",
     "Fürth hat|te neun Punk|te.",
     "Der Club hat dop|pelt so vie|le."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🥇",
      "🏆"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Wer ist ei|gent|lich Ers|ter?",
     "Das ist Her|tha BSC aus Ber|lin.",
     "Her|tha hat|te zwei|und|zwan|zig Punk|te.",
     "Der Club ist al|so knapp da|hin|ter.",
     "Vier Punk|te Ab|stand wa|ren nicht viel."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🤝"
     ],
     "leute": []
    },
    "zeilen": [
     "Am Frei|tag hat der Club in Cott|bus ge|spielt.",
     "Das Spiel ging eins zu eins aus.",
     "Das nennt man Un|ent|schie|den.",
     "Bei|de Mann|schaf|ten be|ka|men ei|nen Punkt.",
     "Für den Club war es kein Sieg."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🏟️",
      "🌙"
     ],
     "leute": []
    },
    "zeilen": [
     "Am Sams|tag spielt der Club wie|der.",
     "Der Geg|ner kommt aus Kai|sers|lau|tern.",
     "Das Spiel be|ginnt erst um halb neun.",
     "Da ist es drau|ßen schon dun|kel.",
     "Die meis|ten Kin|der schla|fen dann schon."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "💡",
      "🏟️"
     ],
     "leute": []
    },
    "zeilen": [
     "Im Dun|keln spielt man mit Flut|licht.",
     "Das sind rie|si|ge Lam|pen am Sta|di|on.",
     "Sie ma|chen den Ra|sen ganz hell.",
     "Fast so hell wie am Tag.",
     "Das sieht im Fern|se|hen toll aus."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📋",
      "4️⃣"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Kai|sers|lau|tern ist auch ziem|lich gut.",
     "Am Frei|tag stand sie auf Platz vier.",
     "Sie hat|te fünf|zehn Punk|te.",
     "Das sind drei we|ni|ger als beim Club.",
     "Am letz|ten Spiel|tag hat Kai|sers|lau|tern ge|won|nen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "😈",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die Spie|ler aus Kai|sers|lau|tern ha|ben ei|nen Spitz|na|men.",
     "Man nennt sie die Ro|ten Teu|fel.",
     "Das klingt ge|fähr|lich.",
     "Da|bei sind es ganz nor|ma|le Fuß|ball|spie|ler."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🔢",
      "➕"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on rech|net nach.",
     "Ge|winnt der Club, hat er ein|und|zwan|zig Punk|te.",
     "Ge|winnt Kai|sers|lau|tern, hat es acht|zehn Punk|te.",
     "Dann hät|ten bei|de gleich viel.",
     "Das wä|re dann ein en|ges Ren|nen."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🔴",
      "📣"
     ],
     "leute": []
    },
    "zeilen": [
     "Im Sta|di|on in Nürn|berg wird es voll.",
     "Vie|le Fans tra|gen Rot und Schwarz.",
     "Das sind die Far|ben vom Club.",
     "Sie sin|gen das gan|ze Spiel lang.",
     "Das hört man bis drau|ßen."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🧣",
      "🎶"
     ],
     "leute": []
    },
    "zeilen": [
     "Fans ha|ben oft ei|nen Schal da|bei.",
     "Den hal|ten sie hoch, wenn ihr Team ein|läuft.",
     "Dann sieht das Sta|di|on aus wie ein Far|ben|meer.",
     "Das ist ein tol|ler An|blick."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎂",
      "🛏️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Halb neun ist spät für ein Kind.",
     "Und am Sams|tag hat Le|on Ge|burts|tag.",
     "Da ist er am A|bend be|stimmt mü|de.",
     "Viel|leicht schläft er dann schon.",
     "Ein Ge|burts|tag macht näm|lich mü|de."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "📰",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Das Er|geb|nis kann man spä|ter le|sen.",
     "Es steht im In|ter|net und in der Zei|tung.",
     "So er|fährt Le|on es am Sonn|tag.",
     "Dann kennt er die neu|e Ta|bel|le.",
     "Ob der Club dann im|mer noch Zwei|ter ist?"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🍀",
      "💚"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Für wen ist Le|on wohl?",
     "Na klar, er bleibt ein Klee|blatt!",
     "Sein Herz schlägt für Grün und Weiß.",
     "Am Sonn|tag ist dann Fürth dran.",
     "Da|rauf freut er sich am meis|ten."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie nennen alle den 1. FC Nürnberg?",
    "richtig": "den Club",
    "falsch": [
     "die Löwen",
     "die Kleeblätter"
    ],
    "seite": 1
   },
   {
    "frage": "Wie nennt man zwei Gegner, die sich gut kennen?",
    "richtig": "Rivalen",
    "falsch": [
     "Zwillinge",
     "Lehrer"
    ],
    "seite": 2
   },
   {
    "frage": "Wann beginnt das Spiel am Samstag?",
    "richtig": "um halb neun",
    "falsch": [
     "um acht Uhr morgens",
     "um zwölf Uhr"
    ],
    "seite": 7
   },
   {
    "frage": "Was macht den Rasen im Dunkeln hell?",
    "richtig": "das Flutlicht",
    "falsch": [
     "der Mond",
     "eine Taschenlampe"
    ],
    "seite": 8
   },
   {
    "frage": "Auf welchem Platz stand Kaiserslautern am Freitag?",
    "richtig": "Platz vier",
    "falsch": [
     "Platz zehn",
     "Platz eins"
    ],
    "seite": 9
   }
  ]
 },
 {
  "id": "w43-fussball-montag",
  "titel": "Fußball-Montag: Fürth und der Club",
  "bild": "⚽",
  "lang": true,
  "ereignis": "2026-10-19",
  "zeigenAb": "2026-10-19",
  "zeigenBis": "2026-10-21",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Heu|te ist Mon|tag.",
     "Am Mon|tag schaut Le|on auf den Fuß|ball.",
     "Was ist am Wo|chen|en|de pas|siert?",
     "Wie ste|hen sei|ne Ver|ei|ne in der Ta|bel|le?",
     "Und wann spie|len sie wie|der?"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🍀",
      "🔴"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hat zwei Ver|ei|ne im Blick.",
     "Sein Lieb|lings|ver|ein ist Greu|ther Fürth.",
     "Die Spie|ler hei|ßen auch die Klee|blät|ter.",
     "Der zwei|te Ver|ein ist der 1. FC Nürn|berg.",
     "Al|le nen|nen ihn nur den Club."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🍀",
      "🏟️"
     ],
     "leute": []
    },
    "zeilen": [
     "Zu|erst kommt Fürth dran.",
     "Am Sams|tag hat Fürth zu Hau|se ge|spielt.",
     "Der Geg|ner war Ein|tracht Braun|schweig.",
     "Das Spiel be|gann um ein Uhr mit|tags.",
     "Die Klee|blät|ter spiel|ten im ei|ge|nen Sta|di|on."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🥅"
     ],
     "leute": []
    },
    "zeilen": [
     "In der 32. Mi|nu|te fiel das ers|te Tor.",
     "Ge|schos|sen hat es Klaus.",
     "Jetzt stand es eins zu null für Fürth.",
     "Die Fans im Sta|di|on ju|bel|ten laut.",
     "Das war noch vor der Halb|zeit."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🎉"
     ],
     "leute": []
    },
    "zeilen": [
     "In der 63. Mi|nu|te traf Klaus noch ein|mal.",
     "Nun stand es zwei zu null.",
     "So ging das Spiel auch zu En|de.",
     "Fürth hat ge|won|nen!",
     "Ein Spie|ler mit zwei To|ren, toll!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚽",
      "📖"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zwei To|re von ei|nem Spie|ler.",
     "Das gibt es nicht in je|dem Spiel.",
     "Le|on merkt sich den Na|men gut.",
     "Klaus ist ein kur|zer Na|me.",
     "Den kann Le|on leicht le|sen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🔢",
      "➕"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Für ei|nen Sieg gibt es drei Punk|te.",
     "Vor|her hat|te Fürth sechs Punk|te.",
     "Sechs und drei sind neun.",
     "Da|nach hat|te Fürth al|so neun Punk|te.",
     "Le|on rech|net das ganz schnell im Kopf."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📋",
      "🔟"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on schaut auf die Ta|bel|le.",
     "Am Mon|tag stand Fürth auf Platz zehn.",
     "Am Sams|tag war es noch Platz neun.",
     "Am Sonn|tag ha|ben an|de|re Mann|schaf|ten ge|won|nen.",
     "Da|rum ist Fürth ei|nen Platz ge|rutscht."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📋",
      "🤏"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Di|rekt vor Fürth stand Ener|gie Cott|bus.",
     "Cott|bus hat|te auch neun Punk|te.",
     "A|ber Cott|bus hat mehr To|re ge|schos|sen.",
     "Di|rekt hin|ter Fürth stand Dy|na|mo Dres|den.",
     "Dres|den hat|te acht Punk|te."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🔴",
      "🚌"
     ],
     "leute": []
    },
    "zeilen": [
     "Jetzt kommt der Club.",
     "Er hat schon am Frei|tag ge|spielt.",
     "Das Spiel war am A|bend in Cott|bus.",
     "Die Mann|schaft muss|te weit fah|ren.",
     "Cott|bus liegt weit im Os|ten."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "😮"
     ],
     "leute": []
    },
    "zeilen": [
     "Lan|ge stand es null zu null.",
     "Dann schoss But|ler ein Tor für Cott|bus.",
     "Das war in der 56. Mi|nu|te.",
     "Jetzt lag der Club hin|ten.",
     "Für den Club sah es nicht gut aus."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🤝"
     ],
     "leute": []
    },
    "zeilen": [
     "Doch in der 79. Mi|nu|te kam der Aus|gleich.",
     "Der Tor|schüt|ze hat ei|nen schwe|ren Na|men: Mkrtchyan.",
     "Am En|de stand es eins zu eins.",
     "Das nennt man Un|ent|schie|den.",
     "Je|de Mann|schaft be|kam ei|nen Punkt."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📋",
      "2️⃣"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Der Club stand auf Platz zwei.",
     "Er hat|te schon acht|zehn Punk|te.",
     "Das sind dop|pelt so vie|le wie bei Fürth.",
     "Nur Her|tha BSC aus Ber|lin ist noch bes|ser.",
     "Her|tha hat|te zwei|und|zwan|zig Punk|te."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🌙",
      "🏟️"
     ],
     "leute": []
    },
    "zeilen": [
     "Und wann spielt der Club wie|der?",
     "Am Sams|tag, um halb neun am A|bend.",
     "Dann kommt Kai|sers|lau|tern nach Nürn|berg.",
     "Kai|sers|lau|tern stand auf Platz vier.",
     "Das wird ein star|ker Geg|ner."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🍀",
      "📅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Und wann spielt Fürth?",
     "Fürth spielt am Sonn|tag um halb zwei.",
     "Dann fährt die Mann|schaft nach Os|na|brück.",
     "Os|na|brück hat|te acht Punk|te.",
     "Das ist ei|ner we|ni|ger als Fürth."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎂",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sams|tag hat Le|on auch noch Ge|burts|tag.",
     "Was für ein Wo|chen|en|de!",
     "Erst sein Ge|burts|tag, dann spielt der Club.",
     "Und am Sonn|tag sind die Klee|blät|ter dran.",
     "Le|on drückt Fürth ganz fest die Dau|men."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Gegen wen hat Fürth am Samstag gespielt?",
    "richtig": "gegen Eintracht Braunschweig",
    "falsch": [
     "gegen Hertha BSC",
     "gegen Bayern München"
    ],
    "seite": 3
   },
   {
    "frage": "Wer hat beide Tore für Fürth geschossen?",
    "richtig": "Klaus",
    "falsch": [
     "Butler",
     "Hertha"
    ],
    "seite": 5
   },
   {
    "frage": "Wie viele Punkte hatte Fürth am Montag?",
    "richtig": "neun",
    "falsch": [
     "zwei",
     "dreißig"
    ],
    "seite": 7
   },
   {
    "frage": "Wie ging das Spiel vom Club in Cottbus aus?",
    "richtig": "eins zu eins",
    "falsch": [
     "drei zu null",
     "null zu fünf"
    ],
    "seite": 12
   },
   {
    "frage": "Wann spielt Fürth in Osnabrück?",
    "richtig": "am Sonntag um halb zwei",
    "falsch": [
     "am Montag um acht",
     "am Freitag um elf"
    ],
    "seite": 15
   }
  ]
 },
 {
  "id": "w43-paul-matheprobe",
  "titel": "Paul schreibt eine Matheprobe",
  "bild": "✏️",
  "lang": true,
  "ereignis": "2026-10-19",
  "zeigenAb": "2026-10-19",
  "zeigenBis": "2026-10-19",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "✏️"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Heu|te ist Mon|tag.",
     "Für Paul ist das ein gro|ßer Tag.",
     "Paul schreibt heu|te ei|ne Pro|be in Ma|the.",
     "Sie fängt gleich am Mor|gen an.",
     "Um acht Uhr geht es los."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📖",
      "🤔"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Wenn Le|on das liest, ist sie viel|leicht schon vor|bei.",
     "Dann hat Paul die Pro|be schon ge|schrie|ben.",
     "O|der er sitzt ge|ra|de noch da|ran.",
     "Le|on denkt an sei|nen gro|ßen Bru|der.",
     "Hof|fent|lich läuft al|les gut."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "📝",
      "❓"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Was ist ei|gent|lich ei|ne Pro|be?",
     "In ei|ner Pro|be zeigt man, was man kann.",
     "Al|le Kin|der be|kom|men ein Blatt mit Auf|ga|ben.",
     "Je|des Kind rech|net ganz al|lein.",
     "Ab|schrei|ben ist nicht er|laubt."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🤫",
      "⏳"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "In der Klas|se ist es dann ganz still.",
     "Man hört nur die Stif|te auf dem Pa|pier.",
     "Nie|mand re|det.",
     "Je|der denkt an sei|ne ei|ge|nen Auf|ga|ben.",
     "Das hilft beim Nach|den|ken."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "✖️",
      "➗"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Paul ist in der vier|ten Klas|se.",
     "Er rech|net viel mit dem Ein|mal|eins.",
     "Und er teilt Zah|len in glei|che Tei|le.",
     "Das hat er in den letz|ten Wo|chen ge|übt.",
     "Mal|neh|men und Tei|len ge|hö|ren zu|sam|men."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📱",
      "⭐"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Paul hat viel ge|übt.",
     "Auch in sei|ner Lern|welt hat er ge|rech|net.",
     "Im|mer wie|der ein paar Auf|ga|ben.",
     "So wird man im|mer si|che|rer.",
     "Und die Auf|ga|ben wer|den leich|ter."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧮",
      "💡"
     ],
     "leute": [
      "Paul",
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on kann auch schon rech|nen.",
     "Er ist in der zwei|ten Klas|se.",
     "Er übt ge|ra|de das Ein|mal|eins.",
     "Paul kann ihm be|stimmt ein paar Tricks zei|gen.",
     "Zwei Brü|der, zwei Re|chen|pro|fis!"
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "✏️",
      "🔍"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Bei ei|ner Pro|be hilft ein Trick.",
     "Am En|de schaut man al|les noch ein|mal an.",
     "Stimmt je|des Er|geb|nis?",
     "Hat man kei|ne Auf|ga|be ver|ges|sen?",
     "So fin|det man klei|ne Feh|ler."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "📄",
      "🗂️"
     ],
     "leute": []
    },
    "zeilen": [
     "Nach der Pro|be sam|melt die Leh|re|rin die Blät|ter ein.",
     "Dann nimmt sie die Blät|ter mit.",
     "Sie schaut je|de Auf|ga|be ge|nau an.",
     "Das dau|ert ein paar Ta|ge.",
     "Erst dann gibt sie die Pro|ben zu|rück."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "❓",
      "🗓️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Das Er|geb|nis kennt al|so noch nie|mand.",
     "Auch Paul weiß es noch nicht.",
     "Er muss ein biss|chen war|ten.",
     "War|ten ist manch|mal ganz schön schwer.",
     "Das kennt Le|on: Er war|tet auf sei|nen Ge|burts|tag."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🤞",
      "💚"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on drückt Paul ganz fest die Dau|men.",
     "Er fin|det, Paul hat sich toll vor|be|rei|tet.",
     "E|gal, was he|raus|kommt.",
     "Ge|übt hat Paul auf je|den Fall.",
     "Und Ü|ben macht stark."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍎",
      "🥤"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Nach ei|ner Pro|be ist man oft mü|de.",
     "Der Kopf hat ja viel ge|ar|bei|tet.",
     "Dann tut ei|ne Pau|se rich|tig gut.",
     "Viel|leicht ein Ap|fel und et|was zu trin|ken.",
     "Da|nach denkt man an et|was an|de|res."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "📚"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Die|se Wo|che hat Paul so|gar zwei Pro|ben.",
     "Am Frei|tag schreibt er noch ei|ne.",
     "Dann geht es um Deutsch.",
     "A|ber jetzt ist erst ein|mal Ma|the dran.",
     "Ein Schritt nach dem an|de|ren."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚽",
      "📖"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hat sei|ne ei|ge|nen Auf|ga|ben.",
     "Er liest gern ei|ne Ge|schich|te.",
     "So wie die|se hier.",
     "Le|sen ist ein biss|chen wie Trai|ning.",
     "Je mehr man übt, des|to leich|ter geht es."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌙",
      "💬"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Viel|leicht fragt Le|on spä|ter:",
     "„Paul, wie war die Pro|be?“",
     "Und Paul er|zählt ihm da|von.",
     "Brü|der hal|ten e|ben zu|sam|men.",
     "Das ist das Wich|tigs|te."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Um wie viel Uhr fängt die Probe an?",
    "richtig": "um acht Uhr",
    "falsch": [
     "um zwölf Uhr",
     "um drei Uhr"
    ],
    "seite": 1
   },
   {
    "frage": "Was ist in einer Probe nicht erlaubt?",
    "richtig": "Abschreiben",
    "falsch": [
     "Rechnen",
     "Nachdenken"
    ],
    "seite": 3
   },
   {
    "frage": "In welcher Klasse ist Paul?",
    "richtig": "in der vierten Klasse",
    "falsch": [
     "in der ersten Klasse",
     "in der achten Klasse"
    ],
    "seite": 5
   },
   {
    "frage": "Wer schaut jede Aufgabe genau an?",
    "richtig": "die Lehrerin",
    "falsch": [
     "der Hausmeister",
     "Leon"
    ],
    "seite": 9
   },
   {
    "frage": "Was macht Leon für Paul?",
    "richtig": "Er drückt ganz fest die Daumen.",
    "falsch": [
     "Er schreibt die Probe für ihn.",
     "Er schläft ein."
    ],
    "seite": 11
   }
  ]
 },
 {
  "id": "w43-friseur",
  "titel": "Paul und Leon gehen zum Friseur",
  "bild": "💇",
  "lang": true,
  "ereignis": "2026-10-20",
  "zeigenAb": "2026-10-19",
  "zeigenBis": "2026-10-20",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "✂️"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Am Diens|tag steht et|was Be|son|de|res an.",
     "Paul und Le|on ge|hen zum Fri|seur.",
     "Bei|de Brü|der kom|men dran.",
     "Le|on fasst sich in die Haa|re.",
     "Wie lang sie wohl in|zwi|schen sind?"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🪞",
      "💭"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on schaut in den Spie|gel.",
     "Haa|re wach|sen näm|lich je|den Tag.",
     "Im|mer nur ein win|zi|ges Stück.",
     "Man merkt es nicht so|fort.",
     "Ir|gend|wann müs|sen sie wie|der kür|zer wer|den."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "💇",
      "❓"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Wie sol|len die Haa|re wer|den?",
     "Kurz o|der ein biss|chen län|ger?",
     "Das be|spricht man vor|her mit dem Fri|seur.",
     "Der Fri|seur hat oft gu|te I|de|en."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "💈",
      "🚪"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Ein Fri|seur schnei|det Haa|re.",
     "Da|für hat er ei|nen ei|ge|nen La|den.",
     "Dort ste|hen gro|ße Stüh|le vor gro|ßen Spie|geln.",
     "Es riecht nach Sham|poo und Haar|spray.",
     "Ü|ber|all lie|gen Käm|me und Bürs|ten."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🪑",
      "⏳"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Oft muss man erst ein biss|chen war|ten.",
     "Dann setzt man sich auf ei|ne Bank.",
     "Wer kommt wohl zu|erst dran?",
     "Paul ist der Gro|ße.",
     "A|ber viel|leicht darf Le|on an|fan|gen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🪑",
      "⬆️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Der Stuhl beim Fri|seur ist be|son|ders.",
     "Man kann ihn hoch und run|ter pum|pen.",
     "Für Kin|der geht er ganz weit nach o|ben.",
     "Dann sieht der Fri|seur gut auf den Kopf.",
     "Le|on fühlt sich da o|ben wie ein Kö|nig."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧥",
      "🙂"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zu|erst be|kommt man ei|nen Um|hang.",
     "Der Um|hang reicht bis zu den Fü|ßen.",
     "Nur der Kopf schaut o|ben he|raus.",
     "So fal|len kei|ne Haa|re auf den Pul|li.",
     "Le|on sieht da|rin aus wie ein klei|ner Su|per|held."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "💧",
      "🪮"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Manch|mal sprüht der Fri|seur Was|ser auf die Haa|re.",
     "Das fühlt sich kühl an.",
     "Dann kämmt er die Haa|re glatt.",
     "Nas|se Haa|re kann man gut schnei|den.",
     "So wird der Schnitt schön ge|ra|de."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "✂️",
      "🎶"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Jetzt kommt die Sche|re.",
     "Schnipp, schnapp, macht sie ganz lei|se.",
     "Klei|ne Haar|bü|schel fal|len he|run|ter.",
     "Le|on hält ganz still.",
     "Nur nicht wa|ckeln!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🐝",
      "✂️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Manch|mal nimmt der Fri|seur ei|ne Ma|schi|ne.",
     "Sie brummt wie ei|ne klei|ne Bie|ne.",
     "Am Na|cken kit|zelt das ein biss|chen.",
     "Le|on muss da|bei ki|chern.",
     "Still|hal|ten ist jetzt gar nicht so leicht."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🪞",
      "👀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zum Schluss hält der Fri|seur ei|nen Spie|gel hoch.",
     "So kann man sich von hin|ten se|hen.",
     "Das sieht lus|tig aus.",
     "Den ei|ge|nen Hin|ter|kopf sieht man sonst nie!",
     "Le|on dreht den Kopf hin und her."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧹",
      "💇"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Dann pin|selt der Fri|seur die Haa|re vom Hals.",
     "Der Pin|sel ist ganz weich.",
     "Der Um|hang kommt ab.",
     "Auf dem Bo|den liegt ein klei|ner Haar|berg.",
     "Gleich wird er weg|ge|fegt."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "👦",
      "✂️"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Dann ist der an|de|re Bru|der dran.",
     "Paul setzt sich auf den gro|ßen Stuhl.",
     "Er be|kommt auch ei|nen Um|hang.",
     "Paul ist schon groß und hält gut still.",
     "Le|on schaut ihm da|bei zu."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "👦",
      "👦"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Paul und Le|on schau|en sich an.",
     "Bei|de se|hen ganz an|ders aus.",
     "Ir|gend|wie fri|scher.",
     "Der Kopf fühlt sich leicht an.",
     "Fast so, als wä|re ein Hut weg."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎂",
      "📸"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Der Ter|min passt gut.",
     "Am Sams|tag hat Le|on näm|lich Ge|burts|tag.",
     "Dann sind be|stimmt al|le da und ma|chen Fo|tos.",
     "Mit fri|schen Haa|ren sieht Le|on rich|tig schick aus.",
     "Das passt zu ei|nem Ge|burts|tags|kind."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧢",
      "🤔"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zu Hau|se fährt Le|on sich durch die Haa|re.",
     "Sie füh|len sich ganz neu an.",
     "Ob die Freun|de es mor|gen mer|ken?",
     "Le|on ist ge|spannt.",
     "Ein neu|er Haar|schnitt ist im|mer auf|re|gend."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wohin gehen Paul und Leon am Dienstag?",
    "richtig": "zum Friseur",
    "falsch": [
     "zum Zahnarzt",
     "ins Kino"
    ],
    "seite": 1
   },
   {
    "frage": "Was bekommt man zuerst um?",
    "richtig": "einen Umhang",
    "falsch": [
     "eine Mütze",
     "einen Schal"
    ],
    "seite": 7
   },
   {
    "frage": "Wie klingt die Maschine?",
    "richtig": "wie eine kleine Biene",
    "falsch": [
     "wie ein Hund",
     "wie ein Auto"
    ],
    "seite": 10
   },
   {
    "frage": "Was liegt am Ende auf dem Boden?",
    "richtig": "ein kleiner Haarberg",
    "falsch": [
     "ein Ball",
     "ein Buch"
    ],
    "seite": 12
   },
   {
    "frage": "Was hat Leon am Samstag?",
    "richtig": "Geburtstag",
    "falsch": [
     "ein Turnier",
     "eine Probe"
    ],
    "seite": 15
   }
  ]
 },
 {
  "id": "w43-paul-deutschprobe",
  "titel": "Paul hat eine Deutschprobe",
  "bild": "📝",
  "lang": true,
  "ereignis": "2026-10-23",
  "zeigenAb": "2026-10-21",
  "zeigenBis": "2026-10-23",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "📝"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Am Frei|tag hat Paul wie|der ei|ne Pro|be.",
     "Am Mon|tag war Ma|the dran.",
     "Jetzt geht es um Deutsch.",
     "Die Pro|be be|ginnt um acht Uhr mor|gens.",
     "Da sind al|le noch ganz frisch."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🔤",
      "🔍"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "In der Pro|be geht es um zwei Sa|chen.",
     "Die ers|te heißt Sprach|un|ter|su|chung.",
     "Was für ein lan|ges Wort!",
     "Le|on liest es gleich noch ein|mal.",
     "Sprach|un|ter|su|chung. Ge|schafft!"
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🔍",
      "📄"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Bei der Sprach|un|ter|su|chung schaut man ge|nau hin.",
     "Man sucht in Sät|zen nach be|stimm|ten Wör|tern.",
     "Wie ein De|tek|tiv mit ei|ner Lu|pe.",
     "Nur dass man nach Wör|tern sucht.",
     "Das kann rich|tig Spaß ma|chen."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🐶",
      "🏃"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Es gibt zum Bei|spiel No|men.",
     "Das sind Na|men für Din|ge, Tie|re und Men|schen.",
     "Hund, Ball und Schu|le sind No|men.",
     "No|men schreibt man im|mer groß.",
     "Auch Fürth ist ein No|men."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🏃",
      "⚽"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Dann gibt es Ver|ben.",
     "Ver|ben sa|gen, was je|mand tut.",
     "Lau|fen, schie|ßen und la|chen sind Ver|ben.",
     "Le|on fin|det: Fuß|ball ist voll mit Ver|ben!",
     "Ren|nen, schie|ßen, hal|ten, ju|beln."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🌈",
      "🐘"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Und es gibt Ad|jek|ti|ve.",
     "Sie sa|gen, wie et|was ist.",
     "Groß, klein, schnell und bunt sind Ad|jek|ti|ve.",
     "Ein E|le|fant ist groß.",
     "Ei|ne Maus ist klein."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "✍️",
      "✅"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Die zwei|te Sa|che heißt Recht|schrei|bung.",
     "Da geht es da|rum, Wör|ter rich|tig zu schrei|ben.",
     "Mit al|len Buch|sta|ben am rich|ti|gen Platz.",
     "Das ist manch|mal ganz schön knif|fe|lig.",
     "Da hilft nur gut hin|schau|en."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🔤",
      "🤔"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Schreibt man Fahr|rad mit ei|nem r o|der zwei?",
     "Kommt ein h hin|ein o|der nicht?",
     "Sol|che Fra|gen gibt es im Deut|schen viel.",
     "Paul muss gut auf|pas|sen.",
     "Je|des Wort ist ein klei|nes Rät|sel."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "👂",
      "🗣️"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Ein Trick hilft beim Schrei|ben.",
     "Man spricht das Wort lang|sam vor sich hin.",
     "Sil|be für Sil|be.",
     "Dann hört man vie|le Buch|sta|ben ge|nau.",
     "Le|on macht das beim Le|sen ge|nau|so."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📖",
      "🔤"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Ein an|de|rer Trick ist das Ver|län|gern.",
     "Hört man am En|de ein t o|der ein d?",
     "Bei Hund sagt man: die Hun|de.",
     "Jetzt hört man das d ganz deut|lich."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📚",
      "⏰"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Vor ei|ner Pro|be hilft Ü|ben.",
     "Man schreibt Wör|ter auf und prüft sie.",
     "Ein biss|chen je|den Tag hilft am meis|ten.",
     "So bleibt es im Kopf."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "👦",
      "📖"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Le|on kennt das Ü|ben auch.",
     "In der zwei|ten Klas|se schreibt er schon Wör|ter.",
     "Und er liest gern Ge|schich|ten.",
     "Le|sen hilft auch beim Schrei|ben.",
     "Wer viel liest, sieht vie|le Wör|ter."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "❓",
      "😄"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hat ei|ne lus|ti|ge I|dee.",
     "Er sucht in die|ser Ge|schich|te No|men.",
     "Paul ist ei|nes, Pro|be ist ei|nes.",
     "Und Le|on ist na|tür|lich auch ei|nes!",
     "Le|on fin|det noch mehr: Wo|che, Frei|tag, Kopf."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🤫",
      "✏️"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Am Frei|tag in der Klas|se ist es dann still.",
     "Je|des Kind liest die Auf|ga|ben ge|nau.",
     "Man schreibt or|dent|lich und in Ru|he.",
     "Am En|de schaut man al|les noch ein|mal an.",
     "Den Trick kennt Paul ja schon von Ma|the."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🤞",
      "💚"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on drückt Paul die Dau|men.",
     "Ganz fest, mit bei|den Hän|den.",
     "Da ist sich Le|on ganz si|cher:",
     "Zwei Pro|ben in ei|ner Wo|che sind viel.",
     "Paul schafft das!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎉",
      "🛝"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Nach der Pro|be fängt das Wo|chen|en|de bald an.",
     "Am Frei|tag geht Le|on noch zu ei|ner Par|ty.",
     "Und am Sams|tag hat Le|on Ge|burts|tag.",
     "Da ist die Pro|be schnell ver|ges|sen.",
     "Und das Wo|chen|en|de kann kom|men."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Um welches Fach geht es am Freitag?",
    "richtig": "um Deutsch",
    "falsch": [
     "um Mathe",
     "um Sport"
    ],
    "seite": 1
   },
   {
    "frage": "Welches lange Wort liest Leon gleich noch einmal?",
    "richtig": "Sprachuntersuchung",
    "falsch": [
     "Turnstunde",
     "Pausenhof"
    ],
    "seite": 2
   },
   {
    "frage": "Wie schreibt man Nomen?",
    "richtig": "immer groß",
    "falsch": [
     "immer klein",
     "nur rückwärts"
    ],
    "seite": 4
   },
   {
    "frage": "Was hilft beim Schreiben?",
    "richtig": "das Wort langsam sprechen",
    "falsch": [
     "ganz schnell schreiben",
     "die Augen zumachen"
    ],
    "seite": 9
   },
   {
    "frage": "Was sucht Leon in der Geschichte?",
    "richtig": "Nomen",
    "falsch": [
     "Kekse",
     "Fehler"
    ],
    "seite": 13
   }
  ]
 },
 {
  "id": "w43-kindergeburtstag",
  "titel": "Noch ein Fest: der Kindergeburtstag",
  "bild": "🎈",
  "lang": true,
  "ereignis": "2026-10-25",
  "zeigenAb": "2026-10-24",
  "zeigenBis": "2026-10-25",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎈",
      "📅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sams|tag hat Le|on Ge|burts|tag.",
     "Dann wird er acht.",
     "A|ber das ist noch nicht al|les.",
     "Am Sonn|tag gibt es noch ein Fest!",
     "Le|on freut sich dop|pelt."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎉",
      "🧒"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sonn|tag fei|ert Le|on sei|nen Kin|der|ge|burts|tag.",
     "Das ist ei|ne Fei|er mit an|de|ren Kin|dern.",
     "Da wird ge|spielt, ge|lacht und ge|tobt.",
     "Le|on freut sich rie|sig.",
     "Das ist sein ei|ge|nes Fest."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "❓",
      "🤫"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Wie wird der Kin|der|ge|burts|tag wohl?",
     "Die|se Ge|schich|te ver|rät es nicht.",
     "Le|on wird es selbst er|le|ben.",
     "Das ist doch das Schöns|te!",
     "Ü|ber|ra|schun|gen ma|chen ein Fest erst rich|tig schön."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎈",
      "🎀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zu ei|nem Fest ge|hö|ren oft Luft|bal|lons.",
     "Man bläst sie auf, bis sie rund sind.",
     "Dann kno|tet man sie zu.",
     "Manch|mal platzt ei|ner mit ei|nem lau|ten Knall.",
     "Dann er|schre|cken sich al|le und la|chen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "💭",
      "🎲"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on denkt an an|de|re Fes|te.",
     "Auf Kin|der|ge|burts|ta|gen gibt es oft Spie|le.",
     "Zum Bei|spiel Topf|schla|gen.",
     "O|der ei|ne Schatz|su|che.",
     "Man|che Spie|le gibt es schon sehr lan|ge."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🥄",
      "🙈"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Beim Topf|schla|gen sind die Au|gen zu.",
     "Man hat ei|nen Löf|fel in der Hand.",
     "Man klopft auf den Bo|den und sucht ei|nen Topf.",
     "Die an|de|ren ru|fen: Heiß! O|der: Kalt!",
     "Heiß heißt: Du bist ganz nah dran."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🗺️",
      "💎"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Bei ei|ner Schatz|su|che folgt man Hin|wei|sen.",
     "Ein Hin|weis führt zum nächs|ten.",
     "Am En|de fin|det man den Schatz.",
     "Das ist be|son|ders auf|re|gend.",
     "Al|le su|chen zu|sam|men."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🪑",
      "🎶"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Es gibt auch die Rei|se nach Je|ru|sa|lem.",
     "Da lau|fen al|le um Stüh|le he|rum.",
     "Hört die Mu|sik auf, setzt sich je|der schnell.",
     "Ein Stuhl fehlt im|mer!",
     "Wer kei|nen Stuhl fin|det, ist drau|ßen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧊",
      "🎶"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Ein an|de|res Spiel heißt Stopp|tanz.",
     "Al|le tan|zen zur Mu|sik.",
     "Hört die Mu|sik auf, bleibt je|der ste|hen.",
     "Wer wa|ckelt, hat ver|lo|ren.",
     "Da muss man rich|tig gut zu|hö|ren."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🎂",
      "🕯️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zu ei|nem Fest ge|hört oft ein Ku|chen.",
     "Mit Ker|zen da|rauf.",
     "Viel|leicht darf Le|on wie|der pus|ten.",
     "Das wä|re zwei|mal pus|ten in zwei Ta|gen!",
     "Das schaf|fen nicht vie|le Kin|der."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎁",
      "🤝"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Frei|tag war Le|on bei Ma|ri|a ein|ge|la|den.",
     "Da war er der Gast.",
     "Jetzt ist es um|ge|kehrt.",
     "Jetzt ist Le|on das Ge|burts|tags|kind.",
     "Das fühlt sich ganz an|ders an."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "👑",
      "😊"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Ein Ge|burts|tags|kind fühlt sich wie ein Kö|nig.",
     "Al|le gra|tu|lie|ren.",
     "Al|le sin|gen.",
     "Le|on wird da|bei be|stimmt ein biss|chen rot.",
     "A|ber das macht gar nichts."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎁",
      "🙏"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Gäs|te brin|gen oft ein Ge|schenk mit.",
     "Le|on sagt dann Dan|ke.",
     "Das ge|hört sich so.",
     "Und er freut sich ü|ber je|des Ge|schenk."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚽",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sonn|tag spielt auch noch Fürth.",
     "Um halb zwei geht es in Os|na|brück los.",
     "Was für ein vol|ler Tag!",
     "Le|on hofft auf ein Tor zum Ge|burts|tag.",
     "Am bes|ten gleich zwei!"
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🕒",
      "😴"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "In der Nacht da|vor wird die Uhr um|ge|stellt.",
     "Le|on darf ei|ne Stun|de län|ger schla|fen.",
     "Das ist gut.",
     "Für so ein Fest braucht man viel Kraft.",
     "Und gu|te Lau|ne."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌙",
      "🎈"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am A|bend ist Le|on be|stimmt mü|de.",
     "Und satt und glück|lich.",
     "Zwei Ta|ge Ge|burts|tag!",
     "Mit acht Jah|ren fängt das gut an.",
     "Was für ein Wo|chen|en|de!"
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wann feiert Leon seinen Kindergeburtstag?",
    "richtig": "am Sonntag",
    "falsch": [
     "am Montag",
     "am Mittwoch"
    ],
    "seite": 2
   },
   {
    "frage": "Was ist beim Topfschlagen zu?",
    "richtig": "die Augen",
    "falsch": [
     "die Tür",
     "der Mund"
    ],
    "seite": 6
   },
   {
    "frage": "Wem folgt man bei einer Schatzsuche?",
    "richtig": "Hinweisen",
    "falsch": [
     "einem Hund",
     "einem Bus"
    ],
    "seite": 7
   },
   {
    "frage": "Wo war Leon am Freitag eingeladen?",
    "richtig": "bei Maria",
    "falsch": [
     "bei Omi",
     "im Kino"
    ],
    "seite": 11
   },
   {
    "frage": "Wann spielt Fürth am Sonntag?",
    "richtig": "um halb zwei",
    "falsch": [
     "um acht Uhr",
     "um Mitternacht"
    ],
    "seite": 14
   }
  ]
 },
 {
  "id": "w43-paul-stadtmuseum",
  "titel": "Paul geht ins Stadtmuseum",
  "bild": "🏛️",
  "lang": true,
  "ereignis": "2026-10-22",
  "zeigenAb": "2026-10-20",
  "zeigenBis": "2026-10-22",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🏛️",
      "🎒"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Le|on hat ei|nen gro|ßen Bru|der.",
     "Paul geht in die vier|te Klas|se.",
     "Am Don|ners|tag macht Pauls Klas|se ei|nen Aus|flug.",
     "Sie ge|hen am Vor|mit|tag ins Stadt|mu|seum.",
     "Das Stadt|mu|seum ist bei uns in Fürth."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🤔",
      "🏺"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on ist neu|gie|rig.",
     "Was gibt es in so ei|nem Mu|seum?",
     "In ei|nem Mu|seum lie|gen al|te Sa|chen.",
     "Man darf sie ganz ge|nau an|schau|en.",
     "Sie er|zäh|len, wie es frü|her war."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🏫",
      "📚"
     ],
     "leute": []
    },
    "zeilen": [
     "Das Stadt|mu|seum ist et|was Be|son|de|res.",
     "Es ist in ei|nem al|ten Schul|haus.",
     "Frü|her hieß es die Ot|to|schu|le.",
     "Dort ha|ben frü|her vie|le Kin|der ge|lernt.",
     "Heu|te ste|hen dort Bil|der und al|te Din|ge."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🕰️",
      "🔔"
     ],
     "leute": []
    },
    "zeilen": [
     "Das Haus ist aus Sand|stein ge|baut.",
     "O|ben am Haus ist ei|ne Uhr.",
     "Und ein klei|nes Türm|chen mit ei|ner Glo|cke.",
     "Ge|baut wur|de es vor ü|ber 150 Jah|ren.",
     "Pauls Klas|se be|sucht al|so ei|ne al|te Schu|le!"
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🌊",
      "👣"
     ],
     "leute": []
    },
    "zeilen": [
     "Im Mu|seum geht es um Fürth.",
     "Fürth ist ei|ne sehr al|te Stadt.",
     "Der Na|me Fürth kommt von ei|ner Furt.",
     "Ei|ne Furt ist ei|ne fla|che Stel|le im Fluss.",
     "Dort kann man durch das Was|ser ge|hen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📜",
      "👑"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Vor ü|ber tau|send Jah|ren leb|te ein Kö|nig.",
     "Er hieß Hein|rich.",
     "Er hat den Ort Fürth ver|schenkt.",
     "Das steht in ei|ner al|ten Ur|kun|de.",
     "Dort steht Fürth zum ers|ten Mal ge|schrie|ben."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📜",
      "🔢"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Das war im Jahr 1007.",
     "Le|on rech|net nach.",
     "Das ist mehr als tau|send Jah|re her!",
     "Ei|ne al|te Sa|ge er|zählt so|gar noch mehr.",
     "Kai|ser Karl der Gro|ße soll hier ge|we|sen sein."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🍀",
      "🛡️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Jetzt kommt et|was für Le|on.",
     "Fürth hat ein Wap|pen.",
     "Auf dem Wap|pen ist ein Klee|blatt!",
     "Das gibt es schon ü|ber 200 Jah|re.",
     "Wie bei sei|nen Klee|blät|tern im Sta|di|on!"
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚂",
      "💨"
     ],
     "leute": []
    },
    "zeilen": [
     "Im Mu|seum geht es auch um die Ei|sen|bahn.",
     "Die ers|te Ei|sen|bahn in Deutsch|land fuhr hier.",
     "Sie fuhr von Nürn|berg nach Fürth.",
     "Das war im Jahr 1835.",
     "Die Lok hieß Ad|ler."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚂",
      "🇬🇧"
     ],
     "leute": []
    },
    "zeilen": [
     "Der Ad|ler kam aus Eng|land.",
     "Auch der Lok|füh|rer kam von dort.",
     "Am 7. De|zem|ber fuhr der Zug zum ers|ten Mal.",
     "Le|on staunt.",
     "Die ers|te Ei|sen|bahn fuhr zu uns nach Fürth!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧸",
      "🪞"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "In Fürth wur|de frü|her viel Spiel|zeug ge|macht.",
     "Das ist bis heu|te so.",
     "Auch Spie|gel und Bril|len ka|men aus Fürth.",
     "Wer hät|te das ge|dacht?",
     "Le|on setzt im Kopf ei|ne Bril|le auf."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "👃",
      "🥽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Im Mu|seum gibt es auch Duft|sta|ti|o|nen.",
     "Da darf man an Sa|chen rie|chen.",
     "Und es gibt ei|ne be|son|de|re Bril|le.",
     "Mit ihr sieht man Bil|der wie in echt.",
     "Ob Paul die Bril|le auf|set|zen darf?"
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "✒️",
      "📜"
     ],
     "leute": []
    },
    "zeilen": [
     "Das Mu|seum hat Füh|run|gen für vier|te Klas|sen.",
     "Manch|mal schrei|ben die Kin|der mit Fe|der und Tu|sche.",
     "Sie schrei|ben in ei|ner ur|al|ten Schrift.",
     "Was Pauls Klas|se dort macht, weiß Le|on nicht.",
     "Das will er Paul fra|gen."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍽️",
      "💬"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hat schon ei|nen Plan.",
     "Beim Abend|es|sen will er Paul aus|fra|gen.",
     "Er ü|ber|legt sich schon jetzt sei|ne Fra|gen.",
     "Dann kann er rich|tig mit|re|den.",
     "Denn Le|on weiß jetzt auch schon ei|ni|ges."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "❓",
      "🍀"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Das sind Le|ons Fra|gen für Paul:",
     "Hast du das Klee|blatt im Wap|pen ge|fun|den?",
     "Hast du mit Fe|der und Tu|sche ge|schrie|ben?",
     "Was hast du ü|ber den Ad|ler ge|hört?",
     "Und hast du an et|was ge|ro|chen?"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "😊",
      "🚂"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Le|on freut sich auf Pauls Ge|schich|ten.",
     "Paul weiß im|mer so viel.",
     "Und dies|mal weiß Le|on auch et|was.",
     "Viel|leicht fragt Paul so|gar zu|rück.",
     "Wie hieß die ers|te Lok? Le|on weiß es!"
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wohin geht Pauls Klasse am Donnerstag?",
    "richtig": "ins Stadtmuseum",
    "falsch": [
     "in den Zoo",
     "ins Schwimmbad"
    ],
    "seite": 1
   },
   {
    "frage": "Was war das Haus vom Museum früher?",
    "richtig": "ein altes Schulhaus",
    "falsch": [
     "ein Bahnhof",
     "eine Bäckerei"
    ],
    "seite": 3
   },
   {
    "frage": "Was ist auf dem Wappen von Fürth?",
    "richtig": "ein Kleeblatt",
    "falsch": [
     "ein Löwe",
     "ein Fußball"
    ],
    "seite": 8
   },
   {
    "frage": "Wie hieß die erste Lok?",
    "richtig": "Adler",
    "falsch": [
     "Blitz",
     "Rakete"
    ],
    "seite": 9
   },
   {
    "frage": "Womit schreiben die Kinder manchmal im Museum?",
    "richtig": "mit Feder und Tusche",
    "falsch": [
     "mit Kreide",
     "mit einem Tablet"
    ],
    "seite": 13
   }
  ]
 },
 {
  "id": "w43-oma-opa-zurueck",
  "titel": "Oma und Opa fliegen nach Hause",
  "bild": "✈️",
  "lang": true,
  "ereignis": "2026-10-19",
  "zeigenAb": "2026-10-20",
  "zeigenBis": "2026-10-22",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "✈️",
      "🧳"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "O|ma und O|pa wa|ren ver|reist.",
     "Le|on hat sie schon ver|misst.",
     "Am Mon|tag ka|men sie wie|der nach Hau|se.",
     "Sie ka|men mit dem Flug|zeug.",
     "Das ist doch span|nend!"
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🌅",
      "✈️"
     ],
     "leute": [
      "Oma",
      "Opa"
     ]
    },
    "zeilen": [
     "Am Mon|tag ging es schon früh los.",
     "Zu|erst flo|gen sie nach Frank|furt.",
     "Frank|furt hat ei|nen rie|si|gen Flug|ha|fen.",
     "Dort lan|de|ten sie am Mor|gen.",
     "Al|les klapp|te ge|nau nach Plan."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🔁",
      "✈️"
     ],
     "leute": [
      "Oma",
      "Opa"
     ]
    },
    "zeilen": [
     "In Frank|furt muss|ten sie um|stei|gen.",
     "Das heißt: Sie neh|men ein an|de|res Flug|zeug.",
     "Da|zu gin|gen sie durch den gro|ßen Flug|ha|fen.",
     "Dann war|te|ten sie auf den Wei|ter|flug.",
     "Der Wei|ter|flug ging nach Nürn|berg."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📱",
      "💬"
     ],
     "leute": [
      "Opa"
     ]
    },
    "zeilen": [
     "O|pa schrieb ei|ne Nach|richt an die Fa|mi|lie.",
     "Wir sind gut in Frank|furt an|ge|kom|men!",
     "Das Flug|zeug soll|te um fünf nach zehn star|ten.",
     "So wuss|ten al|le Be|scheid.",
     "Sie konn|ten sich kei|ne Sor|gen ma|chen."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "👫",
      "✈️"
     ],
     "leute": [
      "Robert",
      "Marianne"
     ]
    },
    "zeilen": [
     "O|ma und O|pa wa|ren nicht al|lein.",
     "Ro|bert und Ma|ri|an|ne ka|men auch mit.",
     "Ro|bert ist Le|ons Tauf|pa|te.",
     "Ro|bert und Ma|ri|an|ne ge|hö|ren zu|sam|men.",
     "Jetzt wa|ren es al|so vier Leu|te."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚗",
      "⏰"
     ],
     "leute": [
      "Papa"
     ]
    },
    "zeilen": [
     "Wer soll|te die vier in Nürn|berg ab|ho|len?",
     "Pa|pa!",
     "Er hat|te in der Grup|pe ge|schrie|ben: Ich kom|me.",
     "Am Mor|gen war|te|te er schon am Flug|ha|fen.",
     "Er schrieb: Gu|te Rei|se und bis gleich!"
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🛫",
      "💨"
     ],
     "leute": []
    },
    "zeilen": [
     "Um zwan|zig nach zehn schrieb O|pa noch mal.",
     "Wir rol|len ge|ra|de zur Start|bahn.",
     "Ei|ne Start|bahn ist ei|ne sehr lan|ge Stra|ße.",
     "Dort wird das Flug|zeug im|mer schnel|ler.",
     "Dann hebt es ab und fliegt los."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "☁️",
      "✈️"
     ],
     "leute": []
    },
    "zeilen": [
     "Flug|zeu|ge flie|gen oft ü|ber den Wol|ken.",
     "Von o|ben sieht al|les win|zig aus.",
     "Häu|ser sind so klein wie Spiel|zeug.",
     "Au|tos se|hen aus wie klei|ne Kä|fer.",
     "Le|on wür|de gern mal hin|un|ter|schau|en."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🛬",
      "✈️"
     ],
     "leute": []
    },
    "zeilen": [
     "Dann kam das Flug|zeug in Nürn|berg an.",
     "Die Rä|der setz|ten auf der Bahn auf.",
     "Das ru|ckelt im|mer ein biss|chen.",
     "Dann roll|te das Flug|zeug lang|sam wei|ter.",
     "Jetzt wa|ren O|ma und O|pa fast da."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧳",
      "🔄"
     ],
     "leute": []
    },
    "zeilen": [
     "Nun fehl|ten nur noch die Kof|fer.",
     "O|pa hat|te ge|schrie|ben: Erst die Kof|fer ho|len!",
     "Am Flug|ha|fen kom|men die Kof|fer auf ein Band.",
     "Das Band dreht sich im|mer im Kreis.",
     "Je|der sucht dort sei|nen ei|ge|nen Kof|fer."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚗",
      "🧳"
     ],
     "leute": [
      "Papa"
     ]
    },
    "zeilen": [
     "Mit den Kof|fern geht es nach drau|ßen.",
     "Pa|pa woll|te dann mit dem Au|to vor|fah|ren.",
     "Die Kof|fer kom|men hin|ten in das Au|to.",
     "Und al|le stei|gen ein.",
     "So ein Rei|se|tag ist ganz schön lang!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🏠",
      "😊"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Jetzt sind O|ma und O|pa wie|der zu Hau|se.",
     "Le|on freut sich dar|über.",
     "Er hat ganz vie|le Fra|gen.",
     "Wie war es im Flug|zeug?",
     "Habt ihr aus dem Fens|ter ge|schaut?"
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🎂",
      "🎈"
     ],
     "leute": [
      "Leon",
      "Robert",
      "Marianne"
     ]
    },
    "zeilen": [
     "Und bald ist schon Sams|tag.",
     "Dann wird Le|on acht Jah|re alt.",
     "Ro|bert und Ma|ri|an|ne kom|men zum Brunch.",
     "Ein Brunch ist ein gro|ßes Früh|stück am Vor|mit|tag.",
     "Le|on kann es kaum er|war|ten."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "❓",
      "🗺️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Viel|leicht er|zäh|len sie dann von der Rei|se.",
     "Le|on will al|les ganz ge|nau wis|sen.",
     "Wie groß ist der Flug|ha|fen in Frank|furt?",
     "Und wie lan|ge dau|ert so ein Flug?",
     "Das fragt er bei der nächs|ten Ge|le|gen|heit."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "✈️",
      "❤️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on schaut zum Him|mel hin|auf.",
     "Da fliegt ge|ra|de ein Flug|zeug vor|bei.",
     "Viel|leicht fliegt er auch mal mit.",
     "Dann winkt er aus dem Fens|ter.",
     "Jetzt ist er froh: O|ma und O|pa sind da!"
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Womit kamen Oma und Opa nach Hause?",
    "richtig": "mit dem Flugzeug",
    "falsch": [
     "mit dem Zug",
     "mit dem Schiff"
    ],
    "seite": 1
   },
   {
    "frage": "Wo mussten sie umsteigen?",
    "richtig": "in Frankfurt",
    "falsch": [
     "in München",
     "in Berlin"
    ],
    "seite": 3
   },
   {
    "frage": "Wer kam mit Oma und Opa mit?",
    "richtig": "Robert und Marianne",
    "falsch": [
     "Steffi und Paul",
     "Omi und Opi"
    ],
    "seite": 5
   },
   {
    "frage": "Wer wartete am Flughafen in Nürnberg?",
    "richtig": "Papa",
    "falsch": [
     "Mama",
     "Paul"
    ],
    "seite": 6
   },
   {
    "frage": "Wohin kommen am Flughafen die Koffer?",
    "richtig": "auf ein Band",
    "falsch": [
     "in einen Korb",
     "auf das Dach"
    ],
    "seite": 10
   }
  ]
 },
 {
  "id": "w44-herbst-disco",
  "titel": "Die Herbst-Disco",
  "bild": "🪩",
  "lang": true,
  "ereignis": "2026-10-30",
  "zeigenAb": "2026-10-29",
  "zeigenBis": "2026-10-30",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🍂",
      "🏫"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Es ist Herbst.",
     "Die Blät|ter sind bunt.",
     "In der Schu|le gibt es ei|ne Neu|ig|keit.",
     "Am Frei|tag, dem 30. Ok|to|ber, ist Herbst-Dis|co.",
     "Al|le Klas|sen ma|chen mit!"
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🪩",
      "🎶"
     ],
     "leute": []
    },
    "zeilen": [
     "Ei|ne Dis|co ist ein Fest mit Mu|sik.",
     "Man kann tan|zen und la|chen.",
     "Die Dis|co ist in der vier|ten Stun|de.",
     "Das ist mit|ten im Schul|tag!",
     "Das ist et|was Be|son|de|res."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🤔",
      "🎭"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on denkt nach.",
     "Man darf sich ver|klei|den.",
     "A|ber man muss nicht.",
     "Je|der darf selbst ent|schei|den.",
     "Das fin|det Le|on gut."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🦸",
      "🐯"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Als was geht Le|on?",
     "Viel|leicht als Fuß|ball|spie|ler?",
     "O|der als Su|per|held?",
     "O|der als Ti|ger?",
     "Le|on hat vie|le I|de|en."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🚫",
      "🎃"
     ],
     "leute": []
    },
    "zeilen": [
     "Ei|ne Re|gel gibt es.",
     "Die Ko|stü|me dür|fen nicht gru|se|lig sein.",
     "Hor|ror|mas|ken blei|ben zu Hau|se."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚽",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on fin|det: Lus|tig ist bes|ser als gru|se|lig.",
     "Ein Klee|blatt-Tri|kot wä|re ei|ne I|de|e.",
     "O|der ein Schal in Grün und Weiß."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🎧",
      "🔊"
     ],
     "leute": []
    },
    "zeilen": [
     "Auch für die Mu|sik ist ge|sorgt.",
     "Herr Wes|te vom El|tern|bei|rat macht die Mu|sik.",
     "So gibt es ei|ne ech|te Dis|co!"
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "👭",
      "👬"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "In der Dis|co sind al|le Klas|sen da.",
     "Auch die gro|ßen Kin|der.",
     "Paul geht ja in die vier|te Klas|se.",
     "Viel|leicht sieht Le|on Paul beim Tan|zen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "😊",
      "🪩"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on weiß: Am Frei|tag ist Dis|co.",
     "Er freut sich da|rauf.",
     "Tan|zen, la|chen, Mu|sik.",
     "Und ein lus|ti|ges Ko|stüm.",
     "Nur gru|se|lig darf es nicht sein!"
    ]
   }
  ],
  "fragen": [
   {
    "frage": "In welcher Stunde ist die Herbst-Disco?",
    "richtig": "in der vierten Stunde",
    "falsch": [
     "in der ersten Stunde",
     "in der letzten Stunde"
    ],
    "seite": 2
   },
   {
    "frage": "Muss man sich verkleiden?",
    "richtig": "Nein, jeder entscheidet selbst",
    "falsch": [
     "Ja, alle müssen",
     "Nur die Großen müssen"
    ],
    "seite": 3
   },
   {
    "frage": "Was bleibt zu Hause?",
    "richtig": "die Horrormasken",
    "falsch": [
     "die Schals",
     "die Fußbälle"
    ],
    "seite": 5
   },
   {
    "frage": "Wer macht die Musik?",
    "richtig": "Herr Weste",
    "falsch": [
     "Leon",
     "Paul"
    ],
    "seite": 7
   },
   {
    "frage": "Wer geht in die vierte Klasse?",
    "richtig": "Paul",
    "falsch": [
     "Leon",
     "Herr Weste"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "w44-fussball-montag",
  "titel": "Fußball-Montag: zwei Niederlagen",
  "bild": "⚽",
  "lang": true,
  "ereignis": "2026-10-26",
  "zeigenAb": "2026-10-26",
  "zeigenBis": "2026-10-28",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Mon|tag, der 26. Ok|to|ber.",
     "Am Mon|tag schaut Le|on auf den Fuß|ball.",
     "Was ist am Wo|chen|en|de pas|siert?"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🍀",
      "🔴"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Sein Lieb|lings|ver|ein ist Greu|ther Fürth.",
     "Der zwei|te Ver|ein ist der 1. FC Nürn|berg.",
     "Al|le nen|nen ihn nur den Club.",
     "Bei bei|den gab es dies|mal kein Glück."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🍀",
      "🚌"
     ],
     "leute": []
    },
    "zeilen": [
     "Fürth war am Sonn|tag zu Gast in Os|na|brück.",
     "In der 37. Mi|nu|te fiel das ers|te Tor.",
     "Ky|e|reh hat es für Os|na|brück ge|schos|sen.",
     "Mei|ßner traf in der 39. Mi|nu|te für Os|na|brück."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "😔"
     ],
     "leute": []
    },
    "zeilen": [
     "Zur Pau|se stand es zwei zu null.",
     "In der 75. Mi|nu|te kam noch ein Tor.",
     "Bad|jie schoss das drit|te Tor für Os|na|brück.",
     "Das Spiel en|de|te drei zu null.",
     "Fürth hat lei|der ver|lo|ren."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📋",
      "1️⃣"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Mon|tag stand Fürth auf Platz zwölf.",
     "Fürth hat|te neun Punk|te.",
     "Das war in der Mit|te der Ta|bel|le."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🔴",
      "🏟️"
     ],
     "leute": []
    },
    "zeilen": [
     "Der Club hat am Sams|tag ge|spielt.",
     "Der Geg|ner war Kai|sers|lau|tern.",
     "Yar|dim|ci traf in der 58. Mi|nu|te.",
     "Das Spiel en|de|te null zu eins.",
     "Der Club hat al|so ver|lo|ren."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📋",
      "2️⃣"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Der Club stand noch im|mer auf Platz zwei.",
     "Er hat|te acht|zehn Punk|te.",
     "Ganz o|ben stand Her|tha BSC.",
     "Her|tha hat|te fünf|und|zwan|zig Punk|te."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "🍀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Sonn|tag, 1. No|vem|ber, spie|len bei|de.",
     "Fürth spielt zu Hau|se ge|gen Hol|stein Kiel.",
     "Der Club spielt beim FC St. Pau|li.",
     "Le|on drückt bei|den die Dau|men."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie ging das Spiel von Fürth in Osnabrück aus?",
    "richtig": "0:3",
    "falsch": [
     "3:0 für Fürth",
     "1:1"
    ],
    "seite": 4
   },
   {
    "frage": "Auf welchem Platz stand Fürth am Montag?",
    "richtig": "auf Platz zwölf",
    "falsch": [
     "auf Platz zehn",
     "auf Platz zwei"
    ],
    "seite": 5
   },
   {
    "frage": "Gegen wen hat der Club verloren?",
    "richtig": "gegen Kaiserslautern",
    "falsch": [
     "gegen Osnabrück",
     "gegen Hertha"
    ],
    "seite": 6
   },
   {
    "frage": "Wie viele Punkte hatte der Club am Montag?",
    "richtig": "achtzehn",
    "falsch": [
     "neun",
     "zwölf"
    ],
    "seite": 7
   },
   {
    "frage": "Gegen wen spielt Fürth am 1. November?",
    "richtig": "gegen Holstein Kiel",
    "falsch": [
     "gegen den Club",
     "gegen Kaiserslautern"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "w44-leon-training-mittwoch",
  "titel": "Leons Fußballtraining",
  "bild": "👟",
  "lang": true,
  "ereignis": "2026-10-28",
  "zeigenAb": "2026-10-27",
  "zeigenBis": "2026-10-28",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "👟"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Mitt|woch, der 28. Ok|to|ber.",
     "Mitt|woch ist Trai|nings|tag!",
     "Le|on spielt bei den F-Ju|ni|o|ren.",
     "Sein Ver|ein heißt ASC Box|dorf."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎒",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Mitt|woch packt Le|on sei|ne Ta|sche.",
     "Die Fuß|ball|schu|he kom|men hin|ein.",
     "Da|zu die Schien|bein|schüt|zer.",
     "Und ei|ne Fla|sche mit Was|ser."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🏟️",
      "🌿"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Der Sport|platz liegt in Box|dorf.",
     "Das ist ein Stadt|teil von Nürn|berg.",
     "Um fünf Uhr geht es los.",
     "Das Trai|ning dau|ert ei|ne Stun|de."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🤝",
      "😀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zu|erst be|grü|ßen sich al|le.",
     "Le|on kennt vie|le Na|men schon.",
     "Er freut sich auf sei|ne Freun|de."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🏃",
      "🔥"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Dann kommt das Auf|wär|men.",
     "Al|le lau|fen ein paar Run|den.",
     "Sie hüp|fen und stre|cken sich.",
     "So ver|letzt sich kei|ner."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "⚽",
      "👣"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Als Nächs|tes ü|ben sie mit dem Ball.",
     "Sie dribb|eln um klei|ne Hüt|chen.",
     "Der Ball bleibt na|he am Fuß."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🥅",
      "🎯"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Dann wird auf das Tor ge|schos|sen.",
     "Zie|len ist gar nicht leicht.",
     "Manch|mal fliegt der Ball weit dar|über.",
     "Beim nächs|ten Ver|such klappt es.",
     "Das Tor ist ein tol|les Ge|fühl."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "👥",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zum Schluss gibt es ein klei|nes Spiel.",
     "Die Kin|der tei|len sich in zwei Grup|pen.",
     "Al|le ren|nen, pas|sen und schie|ßen."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🥤",
      "😮‍💨"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Um sechs Uhr ist das Trai|ning aus.",
     "Le|on ist mü|de, a|ber glück|lich.",
     "Beim Es|sen er|zählt Le|on vom Trai|ning.",
     "Wer übt, wird im|mer si|che|rer."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "An welchem Tag hat Leon Training?",
    "richtig": "am Mittwoch",
    "falsch": [
     "am Montag",
     "am Sonntag"
    ],
    "seite": 1
   },
   {
    "frage": "Wie heißt Leons Verein?",
    "richtig": "ASC Boxdorf",
    "falsch": [
     "SpVgg Greuther Fürth",
     "1. FC Nürnberg"
    ],
    "seite": 1
   },
   {
    "frage": "Wann beginnt das Training?",
    "richtig": "um fünf Uhr",
    "falsch": [
     "um zwei Uhr",
     "um acht Uhr"
    ],
    "seite": 3
   },
   {
    "frage": "Was kommt zuerst im Training?",
    "richtig": "das Aufwärmen",
    "falsch": [
     "das Spiel",
     "das Essen"
    ],
    "seite": 5
   },
   {
    "frage": "Was gibt es zum Schluss?",
    "richtig": "ein kleines Spiel",
    "falsch": [
     "ein Eis",
     "ein Lied"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "w44-torwart-freitag",
  "titel": "Torwarttraining mit Papa",
  "bild": "🧤",
  "lang": true,
  "ereignis": "2026-10-30",
  "zeigenAb": "2026-10-29",
  "zeigenBis": "2026-10-30",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Am Frei|tag ist ein be|son|de|rer Tag.",
     "Am 30. Ok|to|ber ist Tor|wart|trai|ning.",
     "Pa|pa ist dies|mal da|bei!",
     "Le|on freut sich schon."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🥅",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Ein Tor|wart steht im Tor.",
     "Er darf den Ball mit den Hän|den fan|gen.",
     "Da|für trägt er Hand|schu|he.",
     "Die Hand|schu|he hal|ten den Ball fest."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "⏰",
      "🏟️"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Um vier Uhr be|ginnt das Trai|ning.",
     "Es ist am Sport|platz in Box|dorf.",
     "Es dau|ert ei|ne Stun|de.",
     "Dann kommt gleich das nor|ma|le Trai|ning.",
     "Das ist um fünf Uhr."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🤲",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Zu|erst übt Le|on das Fan|gen.",
     "Pa|pa wirft ihm den Ball zu.",
     "Le|on hält die Hän|de wie ei|ne Scha|le.",
     "Der Ball lan|det dar|in."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🦘",
      "💪"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Dann kommt der Hecht|sprung.",
     "Der Ball fliegt zur Sei|te.",
     "Le|on springt hin|ter|her.",
     "Das macht rich|tig Spaß!"
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🥅",
      "🥳"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Jetzt schießt Pa|pa auf das Tor.",
     "Der Ball fliegt nach links.",
     "Le|on springt und hält ihn!",
     "Pa|pa klatscht und lacht."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "😅",
      "🙌"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Nicht je|der Ball wird ge|hal|ten.",
     "Ein Ball rollt ins Netz.",
     "Das ist nicht schlimm.",
     "Le|on steht gleich wie|der be|reit."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "👥",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Um fünf Uhr kom|men die an|de|ren Kin|der.",
     "Nun be|ginnt das nor|ma|le Trai|ning.",
     "Le|on trifft sei|ne Freun|de.",
     "Er er|zählt, was er ge|lernt hat."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🛌",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Spä|ter liegt Le|on im Bett.",
     "Er denkt an die Hecht|sprün|ge.",
     "Ein gu|ter Tag!"
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wann beginnt das Torwarttraining?",
    "richtig": "um vier Uhr",
    "falsch": [
     "um zehn Uhr",
     "um acht Uhr"
    ],
    "seite": 3
   },
   {
    "frage": "Wer trainiert mit Leon?",
    "richtig": "Papa",
    "falsch": [
     "Opa",
     "Paul"
    ],
    "seite": 1
   },
   {
    "frage": "Was tragen Torwarte an den Händen?",
    "richtig": "Handschuhe",
    "falsch": [
     "Mützen",
     "Schals"
    ],
    "seite": 2
   },
   {
    "frage": "Was kommt nach dem Torwarttraining?",
    "richtig": "das normale Training",
    "falsch": [
     "das Mittagessen",
     "die Schule"
    ],
    "seite": 3
   },
   {
    "frage": "Wann beginnt das normale Training?",
    "richtig": "um fünf Uhr",
    "falsch": [
     "um drei Uhr",
     "um sieben Uhr"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "w44-paul-kids-dance",
  "titel": "Paul geht zum Tanzen",
  "bild": "🕺",
  "lang": true,
  "ereignis": "2026-10-28",
  "zeigenAb": "2026-10-27",
  "zeigenBis": "2026-10-28",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📅",
      "🕺"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Am Mitt|woch hat Paul ei|nen Ter|min.",
     "Paul geht zum Kids-Dance.",
     "Das ist ein Tanz|kurs für Kin|der.",
     "Er be|ginnt um halb fünf."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎶",
      "🧢"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Der Kurs heißt Hip-Hop-Grund|la|gen.",
     "Hip-Hop ist ei|ne Mu|sik mit ei|nem star|ken Takt.",
     "Da|zu gibt es be|son|de|re Tän|ze.",
     "Paul fin|det das span|nend."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🏫",
      "📍"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die Tanz|schu|le heißt Streng.",
     "Sie liegt in der The|a|ter|stra|ße in Fürth.",
     "Der Kurs ist für Kin|der ab acht.",
     "Paul ist schon zehn."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "👟",
      "🎒"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Paul packt sei|ne Ta|sche.",
     "Be|que|me Ho|se, gu|te Schu|he.",
     "Und ei|ne Fla|sche mit Was|ser.",
     "Beim Tan|zen wird man warm."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🤔",
      "💭"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on fragt sich et|was.",
     "Wie lernt man ei|nen Tanz?",
     "Man macht ihn Schritt für Schritt nach.",
     "Da|bei zählt man mit: eins, zwei, drei, vier.",
     "Das ist wie beim Ein|mal|eins."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "⏰",
      "🕟"
     ],
     "leute": [
      "Paul"
     ]
    },
    "zeilen": [
     "Der Kurs dau|ert ei|ne Drei|vier|tel|stun|de.",
     "Er geht von halb fünf bis Vier|tel nach fünf.",
     "Das sind fünf|und|vier|zig Mi|nu|ten."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "👀",
      "🙂"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on möch|te das spä|ter se|hen.",
     "Paul zeigt viel|leicht ei|nen Schritt.",
     "Dann pro|biert Le|on ihn auch.",
     "Das wä|re be|stimmt lus|tig."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚽",
      "🕺"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on denkt an sein Fuß|ball|trai|ning.",
     "Auch beim Fuß|ball braucht man gu|te Fü|ße.",
     "Bei|des ist Be|we|gung."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌙",
      "🥤"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Am A|bend sind al|le zu Hau|se.",
     "Paul er|zählt vom Tan|zen.",
     "Le|on hört ge|nau zu.",
     "Dann tanzt Paul ei|nen klei|nen Schritt vor."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wann beginnt der Tanzkurs?",
    "richtig": "um halb fünf",
    "falsch": [
     "um zwei Uhr",
     "um acht Uhr"
    ],
    "seite": 1
   },
   {
    "frage": "Wie heißt der Kurs?",
    "richtig": "Hip-Hop-Grundlagen",
    "falsch": [
     "Ballett für alle",
     "Walzer"
    ],
    "seite": 2
   },
   {
    "frage": "Ab welchem Alter ist der Kurs?",
    "richtig": "ab acht Jahren",
    "falsch": [
     "ab drei Jahren",
     "ab sechzehn Jahren"
    ],
    "seite": 3
   },
   {
    "frage": "Wie lange dauert der Kurs?",
    "richtig": "eine Dreiviertelstunde",
    "falsch": [
     "fünf Stunden",
     "zehn Minuten"
    ],
    "seite": 6
   },
   {
    "frage": "Woran erinnert das Zählen beim Tanzen Leon?",
    "richtig": "ans Einmaleins",
    "falsch": [
     "ans Schwimmen",
     "ans Backen"
    ],
    "seite": 5
   }
  ]
 },
 {
  "id": "c2-leo-traut-sich",
  "titel": "Leo traut sich",
  "bild": "🎈",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "🔔"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Es ist gro|ße Pau|se.",
     "Le|on spielt mit ei|nem Ball auf dem Pau|sen|hof.",
     "Am Rand steht ein klei|ner Jun|ge.",
     "Das ist der klei|ne Le|o.",
     "Er geht in die ers|te Klas|se."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "🎒"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Le|o ist noch ganz neu an der Schu|le.",
     "Er schaut dem Ball nach.",
     "„Willst du mit|spie|len?“, fragt Le|on.",
     "Le|o schüt|telt den Kopf.",
     "„Der Ball ist so hart“, sagt Le|o lei|se."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🤝",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Le|on denkt kurz nach.",
     "„Das ist gar nicht schlimm“, sagt Le|on.",
     "„Ich bin Tor|wart und ken|ne mich aus.“",
     "„Wir fan|gen ganz lang|sam an.“",
     "Le|o nickt ein biss|chen vor|sich|tig."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎈",
      "📦"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Le|on holt ei|nen an|de|ren Ball aus der Kis|te.",
     "Der Ball ist leicht und bunt.",
     "„Fühl mal!“, sagt Le|on.",
     "Le|o drückt den Ball mit bei|den Hän|den.",
     "„Der ist ja ganz weich!“, ruft er."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎈",
      "👍"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Le|on rollt den Ball lang|sam zu Le|o.",
     "Le|o hält ihn mit bei|den Hän|den fest.",
     "„Su|per!“, lobt Le|on.",
     "Dann rollt Le|o den Ball zu|rück.",
     "Das ma|chen sie ganz oft."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎈",
      "😆"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Jetzt wirft Le|on den Ball ein biss|chen.",
     "Le|o macht vor Schreck die Au|gen zu.",
     "Der Ball plumpst auf sei|nen Bauch.",
     "Le|o ki|chert.",
     "„Das tut ja gar nicht weh!“, sagt er."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎈",
      "👀"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "„Schau im|mer auf den Ball“, sagt Le|on.",
     "Le|o schaut ganz ge|nau hin.",
     "Le|on wirft noch ein|mal.",
     "Le|o streckt die Ar|me weit aus.",
     "Er fängt den Ball!"
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎈",
      "🔔"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "„Du hast dich ge|traut!“, ruft Le|on.",
     "Le|o lacht laut und hüpft.",
     "„Mor|gen ü|ben wir wie|der“, sagt Le|o.",
     "Da klin|gelt die Schul|glo|cke.",
     "Le|on und Le|o win|ken sich zu."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "In welche Klasse geht der kleine Leo?",
    "richtig": "in die erste Klasse",
    "falsch": [
     "in die zweite Klasse",
     "in die vierte Klasse"
    ],
    "seite": 1
   },
   {
    "frage": "Warum will Leo erst nicht mitspielen?",
    "richtig": "Der Ball ist so hart.",
    "falsch": [
     "Er ist zu müde.",
     "Er hat keine Zeit."
    ],
    "seite": 2
   },
   {
    "frage": "Wie ist der andere Ball?",
    "richtig": "leicht und bunt",
    "falsch": [
     "schwer und braun",
     "klein und weiß"
    ],
    "seite": 4
   },
   {
    "frage": "Wohin plumpst der Ball?",
    "richtig": "auf Leos Bauch",
    "falsch": [
     "auf Leos Kopf",
     "in die Kiste"
    ],
    "seite": 6
   },
   {
    "frage": "Was sagt Leo am Ende?",
    "richtig": "Morgen üben wir wieder.",
    "falsch": [
     "Der Ball ist so hart.",
     "Ich spiele lieber allein."
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "b3-kastanien-sammeln",
  "titel": "Kastanien sammeln",
  "bild": "🌰",
  "seiten": [
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🍂",
      "🌳"
     ],
     "leute": [
      "Leon",
      "Elisabeth",
      "Helena"
     ]
    },
    "zeilen": [
     "Es ist ein son|ni|ger Tag im Ok|to|ber.",
     "Le|on geht mit E|li|sa|beth in den Park.",
     "Ih|re Toch|ter He|le|na kommt auch mit.",
     "Die Blät|ter sind gelb, rot und braun.",
     "Sie ra|scheln laut bei je|dem Schritt."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🌰",
      "🌳"
     ],
     "leute": [
      "Leon",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "Un|ter ei|nem gro|ßen Baum lie|gen vie|le Kas|ta|ni|en.",
     "Sie glän|zen braun in der Son|ne.",
     "E|li|sa|beth hat ei|nen Korb für die Kas|ta|ni|en da|bei.",
     "„Wer fin|det die schöns|ten?“, fragt sie.",
     "Le|on bückt sich so|fort und sucht."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🌰",
      "👟"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "Man|che Kas|ta|ni|en ste|cken noch in der Scha|le.",
     "Die Scha|le ist grün und sta|che|lig.",
     "„Vor|sicht, die Scha|le pikst!“, sagt He|le|na.",
     "Vor|sich|tig drückt sie die Scha|le mit dem Schuh auf.",
     "Drin|nen liegt ei|ne glat|te Kas|ta|nie."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🌰",
      "👖"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "Le|on sam|melt ganz schnell ei|ne nach der an|de|ren.",
     "Bald sind sei|ne Ho|sen|ta|schen voll.",
     "He|le|na zählt ih|re Kas|ta|ni|en laut.",
     "„Ich ha|be schon zwölf!“, sagt sie.",
     "Le|on zählt auch und kommt auf neun Stück."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🐿️",
      "🌳"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Plötz|lich ra|schelt es laut im Laub.",
     "Le|on bleibt ganz still und lei|se ste|hen.",
     "Ein Eich|hörn|chen sitzt vor dem Baum!",
     "Es hat ei|ne Kas|ta|nie im Mund.",
     "Dann saust es flink den Stamm hin|auf."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🐿️",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Elisabeth",
      "Helena"
     ]
    },
    "zeilen": [
     "„Das Eich|hörn|chen sam|melt auch“, sagt E|li|sa|beth.",
     "„Es legt sich Fut|ter für den Win|ter an.“",
     "Le|on schaut in sei|ne vol|len Ho|sen|ta|schen.",
     "Dann legt er drei Kas|ta|ni|en un|ter den Baum.",
     "„Die sind für dich!“, ruft er laut nach o|ben."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🪵",
      "🌰"
     ],
     "leute": [
      "Leon",
      "Elisabeth",
      "Helena"
     ]
    },
    "zeilen": [
     "Auf ei|ner Bank ma|chen sie ei|ne Pau|se.",
     "E|li|sa|beth holt klei|ne Holz|stäb|chen aus der Ta|sche.",
     "Da|mit bau|en sie klei|ne Fi|gu|ren aus Kas|ta|ni|en.",
     "He|le|na baut ei|nen Mann mit lan|gen Bei|nen.",
     "Le|on baut ei|nen Tor|wart mit gro|ßen Hän|den."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "😄",
      "🌰"
     ],
     "leute": [
      "Leon",
      "Elisabeth",
      "Helena"
     ]
    },
    "zeilen": [
     "Das Tor ist aus zwei klei|nen Stö|cken.",
     "Le|on rollt ei|ne klei|ne Kas|ta|nie auf das Tor zu.",
     "Der Tor|wart kippt um und hält sie trotz|dem.",
     "E|li|sa|beth, He|le|na und Le|on la|chen laut.",
     "„Das ist ein mu|ti|ger Tor|wart!“, sagt He|le|na."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie viele Kastanien hat Helena?",
    "richtig": "zwölf",
    "falsch": [
     "neun",
     "drei"
    ],
    "seite": 4
   },
   {
    "frage": "Was hat das Eichhörnchen im Mund?",
    "richtig": "eine Kastanie",
    "falsch": [
     "ein Blatt",
     "einen Stock"
    ],
    "seite": 5
   },
   {
    "frage": "Warum sammelt das Eichhörnchen?",
    "richtig": "Futter für den Winter",
    "falsch": [
     "als Spielzeug für sich",
     "als Geschenk für Leon"
    ],
    "seite": 6
   },
   {
    "frage": "Was baut Leon auf der Bank?",
    "richtig": "einen Torwart",
    "falsch": [
     "einen Mann mit langen Beinen",
     "ein Eichhörnchen"
    ],
    "seite": 7
   },
   {
    "frage": "Woraus ist das Tor?",
    "richtig": "aus zwei kleinen Stöcken",
    "falsch": [
     "aus Kastanien",
     "aus Blättern"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "a4-paul-hat-hausaufgaben",
  "titel": "Paul hat Hausaufgaben",
  "bild": "✏️",
  "seiten": [
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🎒",
      "☀️"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Es ist Nach|mit|tag, und die Schu|le ist aus.",
     "Le|on hat sei|nen Ball schon un|ter dem Arm.",
     "„Paul, komm, wir spie|len Fuß|ball!“, ruft er.",
     "A|ber Paul sitzt am Kü|chen|tisch.",
     "Vor ihm liegt ein di|ckes Ma|the|heft."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "📓",
      "😩"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Ich muss erst mei|ne Haus|auf|ga|ben ma|chen“, sagt Paul.",
     "Paul geht schon in die vier|te Klas|se.",
     "Da gibt es ganz schön viel zu tun.",
     "Le|on stöhnt ganz laut und lässt die Schul|tern hän|gen.",
     "„Das dau|ert ja e|wig!“"
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "⚽",
      "⏰"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Papa"
     ]
    },
    "zeilen": [
     "Da kommt Pa|pa in die Kü|che.",
     "„Paul braucht jetzt Ru|he“, sagt Pa|pa.",
     "„Kannst du noch ein biss|chen war|ten?“",
     "Le|on legt den Ball in die E|cke.",
     "„Na gut, ich war|te“, sagt er lei|se."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "📓",
      "🤫"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Le|on setzt sich ne|ben Paul an den Tisch.",
     "Paul will die nächs|te Auf|ga|be schrei|ben.",
     "A|ber sein Blei|stift ist ganz stumpf.",
     "Le|on holt den Spit|zer aus dem Fe|der|mäpp|chen.",
     "Er spitzt den Stift ganz lei|se an."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "📏",
      "🤫"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Jetzt sucht Paul sein Li|ne|al un|ter den Hef|ten.",
     "Le|on fin|det es und gibt es ihm.",
     "Dann ist Le|on wie|der ganz, ganz still.",
     "Er malt ein Tor auf ein Blatt Pa|pier.",
     "Paul rech|net und rech|net und rech|net."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "✔️",
      "📓"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Nur noch zwei Auf|ga|ben“, sagt Paul.",
     "Le|on hält ihm die Sei|te fest.",
     "Paul schreibt die letz|te Zahl ganz sau|ber hin.",
     "Dann klappt er das Heft zu.",
     "„End|lich fer|tig!“, ruft Paul und springt auf."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "😊"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Dan|ke, du warst ein gu|ter Hel|fer“, sagt Paul.",
     "„Und du hast so lan|ge ge|war|tet!“",
     "Le|on ist rich|tig stolz auf sich.",
     "Paul packt sei|ne Sa|chen in den Ran|zen.",
     "Dann ren|nen die bei|den schnell raus in den Gar|ten."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "🥅",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Le|on stellt sich mit Hand|schu|hen ins Tor.",
     "Paul schießt, und Le|on hält den Ball.",
     "Pa|pa schaut aus dem Fens|ter und klatscht.",
     "„Das War|ten hat sich ge|lohnt!“, ruft Le|on.",
     "Sie spie|len bis zum A|bend|es|sen."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was liegt vor Paul auf dem Tisch?",
    "richtig": "ein dickes Matheheft",
    "falsch": [
     "ein Fußball",
     "ein Lineal"
    ],
    "seite": 1
   },
   {
    "frage": "In welche Klasse geht Paul?",
    "richtig": "in die vierte Klasse",
    "falsch": [
     "in die zweite Klasse",
     "in die fünfte Klasse"
    ],
    "seite": 2
   },
   {
    "frage": "Was holt Leon aus dem Federmäppchen?",
    "richtig": "den Spitzer",
    "falsch": [
     "das Lineal",
     "den Bleistift"
    ],
    "seite": 4
   },
   {
    "frage": "Was malt Leon auf das Blatt?",
    "richtig": "ein Tor",
    "falsch": [
     "einen Ball",
     "ein Heft"
    ],
    "seite": 5
   },
   {
    "frage": "Wer schaut am Ende aus dem Fenster?",
    "richtig": "Papa",
    "falsch": [
     "Paul",
     "Mama"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "c4-paul-und-leon-bauen-ein-tor",
  "titel": "Paul und Leon bauen ein Tor",
  "bild": "📦",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📦"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Heu|te reg|net es drau|ßen den gan|zen Mor|gen.",
     "Le|on und Paul sit|zen im Zim|mer.",
     "„Mir ist so lang|wei|lig“, sagt Le|on.",
     "Paul schaut sich im Zim|mer um.",
     "In der E|cke steht ein gro|ßer lee|rer Kar|ton."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📦",
      "💡"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Ich hab ei|ne I|dee!“, ruft Paul.",
     "„Wir bau|en ein Fuß|ball|tor aus dem Kar|ton!“",
     "Le|on springt so|fort vom Bo|den auf.",
     "„Und ich bin der Tor|wart!“, ruft er.",
     "Die bei|den ho|len Kle|be|band und ei|ne Sche|re."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "✂️",
      "📦"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Paul schnei|det vor|sich|tig ei|ne Sei|te auf.",
     "Le|on hält den Kar|ton gut fest.",
     "Dann kle|ben sie die E|cken mit Kle|be|band.",
     "Das Kle|be|band klebt an Le|ons Fin|gern.",
     "Bei|de la|chen laut und kle|ben wei|ter."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🖍️",
      "📦"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Jetzt malt Le|on das Tor an.",
     "Er nimmt zwei Stif|te in zwei Far|ben.",
     "„Grün und weiß wie die Klee|blät|ter!“, sagt er.",
     "Paul malt ein Netz aus vie|len Stri|chen.",
     "Jetzt ist das Tor wirk|lich fer|tig!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🥅",
      "🙌"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Paul rollt ein Paar So|cken zu ei|nem Ball.",
     "„Ein So|cken|ball macht nichts ka|putt“, sagt er.",
     "Le|on stellt sich mit|ten vor das Tor.",
     "Paul schießt den So|cken|ball.",
     "Le|on fängt ihn mit ei|nem Sprung!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "☀️",
      "📦"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Nach ei|ner Wei|le hört der Re|gen auf.",
     "Die Son|ne scheint wie|der durch das Fens|ter.",
     "Am Him|mel ist so|gar ein Re|gen|bo|gen.",
     "„Wir tra|gen das Tor in den Gar|ten!“, ruft Paul.",
     "Zu|sam|men tra|gen sie den Kar|ton nach drau|ßen."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🥅",
      "⚽",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Im Gar|ten lie|gen schon ro|te und gel|be Blät|ter.",
     "Sie stel|len das Tor ins Gras.",
     "Jetzt darf Paul mit dem ech|ten Ball schie|ßen.",
     "Er schießt ganz flach in die E|cke.",
     "Le|on wirft sich ins Gras und hält!"
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🥅",
      "😄"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Das Tor wa|ckelt bei je|dem Schuss ein biss|chen.",
     "A|ber es bleibt tap|fer ste|hen.",
     "„Un|ser Tor hält!“, ruft Paul stolz.",
     "„Und dein Tor|wart auch!“, lacht Le|on.",
     "Die bei|den spie|len noch lan|ge im Gar|ten."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie ist das Wetter am Anfang?",
    "richtig": "Es regnet.",
    "falsch": [
     "Die Sonne scheint.",
     "Es schneit."
    ],
    "seite": 1
   },
   {
    "frage": "In welchen Farben malt Leon das Tor an?",
    "richtig": "grün und weiß",
    "falsch": [
     "rot und weiß",
     "blau und gelb"
    ],
    "seite": 4
   },
   {
    "frage": "Woraus macht Paul einen Ball?",
    "richtig": "aus Socken",
    "falsch": [
     "aus Klebeband",
     "aus Karton"
    ],
    "seite": 5
   },
   {
    "frage": "Was ist am Himmel zu sehen?",
    "richtig": "ein Regenbogen",
    "falsch": [
     "ein Drachen",
     "viele Sterne"
    ],
    "seite": 6
   },
   {
    "frage": "Was ruft Paul am Ende stolz?",
    "richtig": "Unser Tor hält!",
    "falsch": [
     "Mir ist so langweilig!",
     "Ich bin der Torwart!"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "a5-helena-kann-englisch",
  "titel": "Helena kann Englisch",
  "bild": "📘",
  "seiten": [
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "☀️",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "Es ist Sams|tag, und die Son|ne scheint.",
     "He|le|na sitzt mit ei|nem Buch auf der Gar|ten|bank.",
     "He|le|na ist schon zwölf Jah|re alt.",
     "Sie geht in die sieb|te Klas|se.",
     "Le|on kommt mit sei|nem Ball an|ge|lau|fen."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "📘",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "„Was liest du denn da?“, fragt Le|on neu|gie|rig.",
     "„Das ist mein Eng|lisch|buch für die Schu|le“, sagt He|le|na.",
     "„Ich ler|ne Eng|lisch und Fran|zö|sisch.“",
     "Le|on staunt und macht gro|ße Au|gen.",
     "„Kannst du mir auch Eng|lisch bei|brin|gen?“"
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "💬"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "He|le|na lacht und legt das Buch zur Sei|te.",
     "„Gern, am bes|ten mit Fuß|ball|wör|tern!“",
     "Sie zeigt mit dem Fin|ger auf Le|ons Ball.",
     "„Ball heißt auf Eng|lisch ball.“",
     "„Das ist ja fast gleich!“, ruft Le|on."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🥅",
      "💬"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "Dann zeigt He|le|na auf das klei|ne Tor.",
     "„Tor heißt auf Eng|lisch goal.“",
     "„Man spricht es fast wie Gohl mit lan|gem O.“",
     "Le|on schießt den Ball mit Schwung ins Tor.",
     "„Goal!“, ruft er ganz laut."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "💬",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "„Und was heißt Tor|wart auf Eng|lisch?“, fragt Le|on.",
     "„Tor|wart heißt kee|per“, sagt He|le|na.",
     "„Man spricht es un|ge|fähr wie Kie|per.“",
     "Le|on zieht schnell sei|ne Hand|schu|he an.",
     "„Ich bin der kee|per!“, ruft er stolz."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "He|le|na schießt, und Le|on hält.",
     "Bei je|dem Schuss ruft sie ein eng|li|sches Wort.",
     "Le|on sagt das Wort dann auf Deutsch.",
     "„Goal!“, ruft He|le|na.",
     "„Tor!“, ruft Le|on und fängt den Ball."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "👏",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Helena",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "E|li|sa|beth kommt mit Ap|fel|saft in den Gar|ten.",
     "„Was spielt ihr zwei denn da Schö|nes?“, fragt sie.",
     "„Ich kann jetzt Eng|lisch!“, ruft Le|on.",
     "„Ball, goal und kee|per!“, zählt er auf.",
     "E|li|sa|beth klatscht in die Hän|de."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "😊",
      "📘"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "„Du hast dir al|les ge|merkt“, sagt He|le|na.",
     "„Du hast dich rich|tig an|ge|strengt.“",
     "Le|on trinkt sei|nen Ap|fel|saft in gro|ßen Schlu|cken aus.",
     "Mor|gen will er Pa|pa die Wör|ter bei|brin|gen.",
     "Dann ist Le|on selbst mal der Leh|rer."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie alt ist Helena?",
    "richtig": "zwölf Jahre",
    "falsch": [
     "sieben Jahre",
     "zehn Jahre"
    ],
    "seite": 1
   },
   {
    "frage": "Welche Sprachen lernt Helena?",
    "richtig": "Englisch und Französisch",
    "falsch": [
     "Deutsch und Französisch",
     "Englisch und Italienisch"
    ],
    "seite": 2
   },
   {
    "frage": "Was heißt Tor auf Englisch?",
    "richtig": "goal",
    "falsch": [
     "ball",
     "keeper"
    ],
    "seite": 4
   },
   {
    "frage": "Was zieht Leon schnell an?",
    "richtig": "seine Handschuhe",
    "falsch": [
     "seine Jacke",
     "seine Schuhe"
    ],
    "seite": 5
   },
   {
    "frage": "Was bringt Elisabeth mit?",
    "richtig": "Apfelsaft",
    "falsch": [
     "Kekse",
     "ein Buch"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "v-reporter",
  "titel": "Leon wird Reporter",
  "bild": "🎤",
  "lang": true,
  "zeigenAb": "2026-11-01",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎤",
      "📝"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hat ein Mi|kro|fon aus Pap|pe ge|bas|telt.",
     "O|ben|drauf klebt ei|ne Ku|gel aus Pa|pier.",
     "„Ich bin jetzt Re|por|ter“, sagt Le|on.",
     "„Ich fra|ge Paul ganz vie|le Sa|chen.“",
     "Er nimmt Block und Stift mit."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎤",
      "🚀"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Paul sitzt am Tisch und baut.",
     "Le|on hält ihm das Mi|kro|fon hin.",
     "„Hal|lo, hier ist Re|por|ter Le|on. Was baust du da?“",
     "„Ein Raum|schiff“, sagt Paul.",
     "Es ist aus vie|len bun|ten Bau|stei|nen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🚀",
      "🍫"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Wo|hin fliegt dein Raum|schiff?“, fragt Le|on.",
     "Paul ü|ber|legt kurz.",
     "„Zu ei|nem Pla|ne|ten aus Scho|ko|la|de.“",
     "Le|on lacht und schreibt al|les auf."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎤",
      "📝"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Wer fliegt mit?“, fragt Le|on wei|ter.",
     "„Ein Hund mit ei|ner Bril|le“, sagt Paul.",
     "„Er ist der Ka|pi|tän.“",
     "Le|on lacht so sehr, dass sein Stift wa|ckelt."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🍕",
      "📝"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Was isst der Hund im Raum|schiff?“, fragt Le|on.",
     "Paul grinst.",
     "„Piz|za mit Scho|ko|la|de o|ben|drauf.“",
     "„I|gitt!“, ruft Le|on.",
     "Er schreibt das Wort Piz|za auf."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎤",
      "🔄"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Dan|ke für das Ge|spräch!“, sagt Le|on.",
     "Da nimmt Paul das Mi|kro|fon.",
     "„Jetzt bin ich der Re|por|ter“, sagt er.",
     "„Und du bist dran, Le|on.“"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎤",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Was ist dein größ|ter Wunsch?“, fragt Paul.",
     "Le|on muss nicht lan|ge über|le|gen.",
     "„Ich will auch mit dem Raum|schiff flie|gen.“",
     "„Zum Pla|ne|ten aus Scho|ko|la|de?“, fragt Paul.",
     "„Na klar!“, ruft Le|on."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📝",
      "😊"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Und was wünschst du dir jetzt so|fort?“",
     "Le|on reibt sich den Bauch.",
     "„Ei|nen Nach|tisch!“, ruft er.",
     "Paul lacht und schreibt es in Le|ons Block.",
     "Das war ein gu|tes Ge|spräch."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Woraus ist Leons Mikrofon?",
    "richtig": "aus Pappe",
    "falsch": [
     "aus Holz",
     "aus Metall"
    ],
    "seite": 1
   },
   {
    "frage": "Was baut Paul?",
    "richtig": "ein Raumschiff",
    "falsch": [
     "ein Auto",
     "eine Burg"
    ],
    "seite": 2
   },
   {
    "frage": "Wer ist der Kapitän im Raumschiff?",
    "richtig": "ein Hund mit einer Brille",
    "falsch": [
     "ein Bär mit einem Hut",
     "Leon"
    ],
    "seite": 4
   },
   {
    "frage": "Was isst der Hund im Raumschiff?",
    "richtig": "Pizza mit Schokolade",
    "falsch": [
     "Nudeln mit Käse",
     "Suppe mit Brot"
    ],
    "seite": 5
   },
   {
    "frage": "Was wünscht sich Leon jetzt sofort?",
    "richtig": "einen Nachtisch",
    "falsch": [
     "ein neues Buch",
     "einen Ball"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "v-sockenball",
  "titel": "Der Ball aus Socken",
  "bild": "🧦",
  "lang": true,
  "zeigenAb": "2026-11-03",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧦",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Le|on will Fuß|ball spie|len.",
     "A|ber ein ech|ter Ball ist für drin|nen zu hart.",
     "Paul hat ei|ne I|dee.",
     "Er rollt drei So|cken zu ei|ner Ku|gel."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧦",
      "🙂"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Das ist un|ser So|cken|ball“, sagt Paul.",
     "Le|on nimmt den Ball in die Hand.",
     "Er ist ganz weich und leicht.",
     "„Der macht nichts ka|putt“, sagt Le|on."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🪑",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Jetzt brau|chen sie noch ein Tor.",
     "Paul stellt zwei Stüh|le auf.",
     "Zwi|schen den Stüh|len ist das Tor.",
     "Le|on stellt sich mit|ten ins Tor.",
     "Er brei|tet die Ar|me weit aus."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧦",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Paul legt den So|cken|ball auf den Tep|pich.",
     "Er nimmt zwei Schrit|te An|lauf.",
     "Dann schießt er nach links.",
     "Le|on springt und fängt den Ball.",
     "„Ge|hal|ten!“, ruft Le|on."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧦",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Paul schießt noch ein|mal.",
     "Dies|mal schießt er ganz hoch.",
     "Der Ball fliegt an Le|ons Hän|den vor|bei.",
     "„Tor!“, ju|belt Paul und hüpft."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🔄",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Dann tau|schen die bei|den.",
     "Paul stellt sich ins Tor.",
     "Le|on klatscht in die Hän|de und lacht.",
     "„Jetzt bin ich der Schüt|ze!“"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧦",
      "😂"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Le|on schießt ganz flach.",
     "Der So|cken|ball rollt zwi|schen den Stüh|len durch.",
     "Paul wirft sich auf den Bo|den.",
     "Doch der Ball ist schon hin|ter ihm.",
     "Bei|de la|chen laut."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧦",
      "🧺"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Wer hat ge|won|nen?“, fragt Le|on.",
     "„Wir ha|ben gar nicht ge|zählt“, sagt Paul.",
     "„Das ist auch e|gal“, sagt Le|on.",
     "Dann rol|len sie den Ball wie|der aus|ei|nan|der.",
     "Die So|cken kom|men zu|rück in den Korb."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Woraus ist der Ball?",
    "richtig": "aus Socken",
    "falsch": [
     "aus Papier",
     "aus Plastik"
    ],
    "seite": 1
   },
   {
    "frage": "Woraus baut Paul das Tor?",
    "richtig": "aus zwei Stühlen",
    "falsch": [
     "aus zwei Kissen",
     "aus zwei Schuhen"
    ],
    "seite": 3
   },
   {
    "frage": "Wohin schießt Paul beim ersten Mal?",
    "richtig": "nach links",
    "falsch": [
     "nach rechts",
     "in die Mitte"
    ],
    "seite": 4
   },
   {
    "frage": "Wie schießt Leon?",
    "richtig": "ganz flach",
    "falsch": [
     "ganz hoch",
     "mit dem Kopf"
    ],
    "seite": 7
   },
   {
    "frage": "Wohin kommen die Socken am Ende?",
    "richtig": "in den Korb",
    "falsch": [
     "in den Schrank",
     "in die Tasche"
    ],
    "seite": 8
   }
  ]
 }
];
