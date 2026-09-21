/* Leons Lesegeschichten - eine je Tag, in dieser Reihenfolge (lesegeschichte.html).
   Stand 21.09.2026: 54 Geschichten (Mitschueler aus der 2bG und der ASC Boxdorf -
   Denny: Termine gehoeren in den Inhalt, nicht als Banner in die App), von Hand geschrieben und geprüft. Neue hinten
   anhängen, nie eine id ändern - der Lesepass merkt sich die id.

   Geprueft wird mit `node pruefe-geschichten.mjs` (Seitenzahl, Satzlaenge,
   Wortzahl, Silbentrennung, ob jede Antwort wirklich auf ihrer Seite steht).
   Am 21.09.2026 kamen h1 bis h12 dazu: Leon hatte am Wochenende fuenf
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
  "id": "b5-drachen-steigen",
  "titel": "Drachen steigen",
  "bild": "🪁",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "💨",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Papa"
     ]
    },
    "zeilen": [
     "Heu|te weht drau|ßen ein star|ker Herbst|wind.",
     "Die bun|ten Blät|ter flie|gen am Fens|ter vor|bei.",
     "„Heu|te ist Dra|chen|wet|ter!“, ruft Pa|pa.",
     "Paul holt den gro|ßen ro|ten Dra|chen.",
     "Er hat ei|nen lan|gen Schwanz aus Pa|pier."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🍂",
      "🌳"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Papa"
     ]
    },
    "zeilen": [
     "Sie ge|hen zu|sam|men auf die gro|ße Wie|se im Park.",
     "Dort ist viel Platz und kein Baum im Weg.",
     "Der Wind zerrt an Le|ons Ja|cke.",
     "Pa|pa gibt Paul zu|erst die Schnur.",
     "„Du fängst an, Paul“, sagt er."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🪁",
      "💨"
     ],
     "leute": [
      "Paul",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa hält den Dra|chen hoch.",
     "Paul rennt ganz schnell ü|ber die Wie|se.",
     "Der Dra|chen steigt ein klei|nes Stück.",
     "Plötz|lich dreht er sich im Kreis.",
     "Dann fällt er plumps ins wei|che Gras."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🪁",
      "🌾"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Papa"
     ]
    },
    "zeilen": [
     "Paul ist ein biss|chen trau|rig.",
     "„Das pas|siert beim ers|ten Mal oft“, sagt Pa|pa.",
     "„Du bist rich|tig toll ge|rannt!“",
     "Paul ver|sucht es noch zwei|mal ganz tap|fer.",
     "Beim drit|ten Mal fliegt der Dra|chen schon viel hö|her."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🙋",
      "🧵"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Darf ich auch mal?“, fragt Le|on.",
     "Paul gibt ihm so|fort die Schnur.",
     "Le|on hält sie mit bei|den Hän|den ganz fest.",
     "Er hat ein biss|chen Angst vor dem star|ken Wind.",
     "A|ber er will es un|be|dingt ver|su|chen."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🪁",
      "💨"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Papa"
     ]
    },
    "zeilen": [
     "Nun hält Paul den Dra|chen für Le|on hoch.",
     "„Eins, zwei, drei, los!“, ruft Pa|pa.",
     "Le|on rennt ganz schnell ge|gen den Wind.",
     "Er spürt ei|nen star|ken Ruck an der Schnur.",
     "Der Dra|chen steigt hö|her und hö|her!"
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🪁",
      "☁️"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Bald ist der Dra|chen hoch o|ben am Him|mel.",
     "Er tanzt ne|ben den wei|ßen Wol|ken.",
     "Sein lan|ger Schwanz flat|tert hin und her.",
     "Le|on zieht ganz vor|sich|tig an der Schnur.",
     "„Das hast du mu|tig ge|macht!“, lobt Pa|pa."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🪁",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Papa"
     ]
    },
    "zeilen": [
     "Nun hal|ten Paul und Le|on die Schnur zu|sam|men.",
     "Sie las|sen den Dra|chen noch lan|ge flie|gen.",
     "Pa|pa holt den Dra|chen vor|sich|tig he|run|ter.",
     "„Ge|hen wir mor|gen wie|der?“, fragt Le|on.",
     "Paul und Pa|pa ni|cken und la|chen."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Welche Farbe hat der Drachen?",
    "richtig": "rot",
    "falsch": [
     "grün",
     "gelb"
    ],
    "seite": 1
   },
   {
    "frage": "Wer rennt zuerst mit dem Drachen los?",
    "richtig": "Paul",
    "falsch": [
     "Leon",
     "Papa"
    ],
    "seite": 3
   },
   {
    "frage": "Wie oft versucht Paul es noch?",
    "richtig": "noch zweimal",
    "falsch": [
     "noch einmal",
     "noch fünfmal"
    ],
    "seite": 4
   },
   {
    "frage": "Wovor hat Leon ein bisschen Angst?",
    "richtig": "vor dem starken Wind",
    "falsch": [
     "vor dem großen Drachen",
     "vor der großen Wiese"
    ],
    "seite": 5
   },
   {
    "frage": "Wer holt den Drachen am Ende herunter?",
    "richtig": "Papa",
    "falsch": [
     "Paul",
     "Leon"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "c5-der-traum-vom-grossen-tor",
  "titel": "Der Traum vom großen Tor",
  "bild": "🌙",
  "seiten": [
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "⭐",
      "🧣"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Es ist ein küh|ler A|bend im Ok|to|ber.",
     "Le|on schaut aus dem Fens|ter in den Him|mel.",
     "Der Mond ist rund und hell.",
     "Ne|ben dem Bett liegt sein grü|ner Schal.",
     "Dann schläft Le|on ganz schnell ein."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🏟️",
      "🎶"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on träumt in der Nacht ei|nen tol|len Traum.",
     "Er steht in ei|nem rie|si|gen Sta|di|on.",
     "Vie|le Leu|te sin|gen und klat|schen laut.",
     "Ü|ber|all sind grü|ne und wei|ße Fah|nen.",
     "Le|on trägt ein grü|nes Tri|kot."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "🧤",
      "🥅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Er steht im Tor der Klee|blät|ter!",
     "Sei|ne Hand|schu|he sind groß und weich.",
     "Da kommt ein Spie|ler mit dem Ball ge|lau|fen.",
     "Er schießt ganz hoch in die E|cke.",
     "Le|on fliegt durch die Luft wie ein Vo|gel."
    ]
   },
   {
    "szene": {
     "ort": "stadion",
     "dinge": [
      "⚽",
      "🎉"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Er hält den Ball fest in den Hän|den.",
     "Das gan|ze gro|ße Sta|di|on ju|belt laut.",
     "„Le|on, Le|on!“, ru|fen die Leu|te.",
     "Le|on winkt al|len zu und lacht.",
     "Da klin|gelt plötz|lich ein We|cker."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🛏️",
      "☀️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on macht die Au|gen auf.",
     "Er liegt in sei|nem Bett.",
     "Das Sta|di|on ist weg.",
     "„Das war nur ein Traum“, sagt er lei|se.",
     "Doch der Traum macht ihm gro|ße Lust auf Fuß|ball."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Heu|te ist Sams|tag und schul|frei.",
     "Le|on zieht schnell sei|ne Hand|schu|he an.",
     "Im Gar|ten war|tet schon Xa|ver mit dem Ball.",
     "Xa|ver geht in die fünf|te Klas|se am Gym|na|si|um.",
     "„Komm, wir trai|nie|ren wie die Klee|blät|ter!“, ruft Xa|ver."
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
      "Xaver"
     ]
    },
    "zeilen": [
     "Xa|ver schießt flach und dann hoch.",
     "Le|on hält fast je|den Ball mit bei|den Hän|den.",
     "Ein|mal rollt der Ball an ihm vor|bei.",
     "„Nicht schlimm, gleich noch mal!“, sagt Xa|ver.",
     "Le|on macht wei|ter und gibt nicht auf."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "💪"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Beim nächs|ten Schuss fliegt Le|on wie im Traum.",
     "Er fängt den Ball ganz hoch o|ben.",
     "„Das war ein Su|per|sprung!“, ruft Xa|ver.",
     "Le|on er|zählt Xa|ver ganz stolz von sei|nem Traum.",
     "„Du hast heu|te toll ge|übt“, sagt Xa|ver."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie sieht der Mond aus?",
    "richtig": "rund und hell",
    "falsch": [
     "klein und rot",
     "halb und dunkel"
    ],
    "seite": 1
   },
   {
    "frage": "Welche Farbe hat Leons Trikot im Traum?",
    "richtig": "grün",
    "falsch": [
     "weiß",
     "blau"
    ],
    "seite": 2
   },
   {
    "frage": "Was klingelt plötzlich?",
    "richtig": "ein Wecker",
    "falsch": [
     "das Telefon",
     "die Schulglocke"
    ],
    "seite": 4
   },
   {
    "frage": "In welche Klasse geht Xaver?",
    "richtig": "in die fünfte Klasse",
    "falsch": [
     "in die zweite Klasse",
     "in die siebte Klasse"
    ],
    "seite": 6
   },
   {
    "frage": "Was sagt Xaver ganz am Ende?",
    "richtig": "Du hast heute toll geübt.",
    "falsch": [
     "Das war nur ein Traum.",
     "Komm, wir gehen nach Hause."
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "a6-der-regentag",
  "titel": "Der Regentag",
  "bild": "🌧️",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌧️",
      "☔"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Heu|te reg|net es schon den gan|zen Tag.",
     "Die Trop|fen klop|fen laut an das Fens|ter.",
     "Le|on sitzt auf dem So|fa und seufzt.",
     "Drau|ßen im Gar|ten ist al|les nass und grau.",
     "So kann er nicht drau|ßen Fuß|ball spie|len."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌧️",
      "😞"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Da kommt Pa|pa ins Wohn|zim|mer her|ein.",
     "„Was ist denn los, Le|on?“, fragt er freund|lich.",
     "„Mir ist so lang|wei|lig“, sagt Le|on.",
     "„Ich will ins Tor, a|ber es reg|net.“",
     "Pa|pa schaut aus dem Fens|ter und denkt nach."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "💡",
      "🙂"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Da hat Pa|pa auf ein|mal ei|ne gu|te I|dee.",
     "Er holt ein Paar al|te So|cken aus dem Schrank.",
     "Er rollt sie ganz fest zu|sam|men.",
     "Jetzt sieht es aus wie ein klei|ner Ball.",
     "„Das ist un|ser So|cken|ball!“, sagt Pa|pa."
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
      "Papa"
     ]
    },
    "zeilen": [
     "„Und wo ist hier das Tor?“, fragt Le|on.",
     "Pa|pa legt zwei Kis|sen auf den Tep|pich.",
     "Da|zwi|schen ist jetzt ein wei|ches Tor.",
     "Le|on kniet sich so|fort in das Tor.",
     "Er zieht so|gar sei|ne Hand|schu|he an."
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
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa wirft den So|cken|ball in die E|cke.",
     "Le|on springt zur Sei|te und fängt ihn.",
     "Der So|cken|ball ist ganz weich und leicht.",
     "Da|rum macht das Hin|fal|len gar nichts.",
     "Le|on hält fünf Wür|fe hin|ter|ein|an|der."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧺",
      "🧦"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Dann tau|schen sie die Rol|len.",
     "Jetzt ist der Wä|sche|korb das Tor.",
     "Pa|pa hält die Hän|de vor den Korb.",
     "Le|on zielt lan|ge und ganz ge|nau.",
     "Der So|cken|ball fliegt mit|ten in den Korb!"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎉",
      "🧦"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "„Tor!“, ruft Le|on und hüpft her|um.",
     "Pa|pa lacht und klatscht in die Hän|de.",
     "„Das war ein su|per Wurf!“, sagt er.",
     "Sie spie|len im|mer wei|ter und la|chen viel.",
     "Bald lie|gen ü|ber|all Kis|sen auf dem Bo|den."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌈",
      "🧦"
     ],
     "leute": [
      "Leon",
      "Papa",
      "Mama"
     ]
    },
    "zeilen": [
     "Plötz|lich hört der Re|gen auf.",
     "Le|on läuft schnell zum Fens|ter und schaut hi|naus.",
     "Auf der an|de|ren Stra|ßen|sei|te winkt Ma|ma.",
     "Le|on winkt mit bei|den Ar|men zu|rück.",
     "„Pa|pa, der Re|gen|tag war rich|tig toll!“, ruft Le|on."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wo sitzt Leon am Anfang?",
    "richtig": "auf dem Sofa",
    "falsch": [
     "am Fenster",
     "auf dem Teppich"
    ],
    "seite": 1
   },
   {
    "frage": "Woher holt Papa die alten Socken?",
    "richtig": "aus dem Schrank",
    "falsch": [
     "aus dem Wäschekorb",
     "aus der Küche"
    ],
    "seite": 3
   },
   {
    "frage": "Was ist das erste Tor?",
    "richtig": "zwei Kissen",
    "falsch": [
     "der Wäschekorb",
     "zwei Stühle"
    ],
    "seite": 4
   },
   {
    "frage": "Wie viele Würfe hält Leon?",
    "richtig": "fünf",
    "falsch": [
     "drei",
     "sieben"
    ],
    "seite": 5
   },
   {
    "frage": "Was macht Mama am Ende?",
    "richtig": "sie winkt",
    "falsch": [
     "sie ruft",
     "sie klatscht"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "b6-in-der-buecherei",
  "titel": "In der Bücherei",
  "bild": "📚",
  "seiten": [
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "📚",
      "🙂"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Heu|te geht Le|ons Klas|se in die Schul|bü|che|rei.",
     "„Je|des Kind darf ein Buch aus|lei|hen“, sagt Herr Ce|lis.",
     "Le|on hat schon ei|ne I|dee.",
     "Er will ein Buch ü|ber Tor|war|te.",
     "Dar|auf freut er sich schon den gan|zen Mor|gen."
    ]
   },
   {
    "szene": {
     "ort": "buecherei",
     "dinge": [
      "📚",
      "🔍"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "In der Bü|che|rei ste|hen vie|le Re|ga|le.",
     "Es gibt Bü|cher ü|ber Tie|re, Au|tos und Ster|ne.",
     "Le|on sucht und sucht und sucht.",
     "A|ber er fin|det kein ein|zi|ges Fuß|ball|buch.",
     "„Wo sind nur die Fuß|ball|bü|cher?“, fragt er lei|se."
    ]
   },
   {
    "szene": {
     "ort": "buecherei",
     "dinge": [
      "📚",
      "😃"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Herr Ce|lis zeigt auf das un|ters|te Brett.",
     "Ganz un|ten steht ein di|ckes grü|nes Buch.",
     "Vor|ne ist ein Tor|wart mit Hand|schu|hen.",
     "Der Tor|wart fliegt quer durch das gan|ze Bild.",
     "„Das neh|me ich!“, ruft Le|on glück|lich."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "📖",
      "🍎"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "In der Pau|se setzt sich Le|on auf ei|ne Bank.",
     "Ne|ben ihm sitzt der klei|ne Le|o.",
     "Er ist ganz neu in der ers|ten Klas|se.",
     "Er kennt hier noch kaum je|man|den.",
     "Er schaut neu|gie|rig auf Le|ons Buch."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "📖",
      "🔤"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "„Kannst du schon le|sen?“, fragt Le|on.",
     "Le|o schüt|telt den Kopf.",
     "„Ich ken|ne nur ein paar Buch|sta|ben“, sagt er lei|se.",
     "„Dann le|se ich dir vor“, sagt Le|on.",
     "Le|o rutscht ganz nah an Le|on he|ran."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "📖",
      "👏"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Le|on liest ganz lang|sam und ge|nau vor.",
     "„Ein Tor|wart braucht gu|te Hand|schu|he.“",
     "„Er muss mu|tig sein und gut auf|pas|sen.“",
     "Bei ei|nem ganz lan|gen Wort stockt Le|on kurz.",
     "Dann klatscht er die Sil|ben und schafft es."
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
     "„Bist du auch ein Tor|wart?“, fragt Le|o.",
     "„Ja, das bin ich“, sagt Le|on stolz.",
     "„Mein Freund The|o ist auch ein Tor|wart.“",
     "Da wer|den Le|os Au|gen ganz groß.",
     "„Das will ich auch mal ma|chen!“, ruft er."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🔔",
      "📖"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Da klin|gelt laut die Schul|glo|cke.",
     "Die Pau|se ist lei|der schon vor|bei.",
     "„Liest du mir mor|gen wei|ter vor?“, fragt Le|o.",
     "„Klar, gleich in der ers|ten Pau|se!“, sagt Le|on.",
     "Froh läuft Le|o zu|rück in sei|ne Klas|se."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Worüber will Leon ein Buch?",
    "richtig": "über Torwarte",
    "falsch": [
     "über Tiere",
     "über Sterne"
    ],
    "seite": 1
   },
   {
    "frage": "Welche Farbe hat das Buch?",
    "richtig": "grün",
    "falsch": [
     "blau",
     "rot"
    ],
    "seite": 3
   },
   {
    "frage": "In welche Klasse geht der kleine Leo?",
    "richtig": "in die erste Klasse",
    "falsch": [
     "in die zweite Klasse",
     "in die vierte Klasse"
    ],
    "seite": 4
   },
   {
    "frage": "Was macht Leon bei einem langen Wort?",
    "richtig": "Er klatscht die Silben.",
    "falsch": [
     "Er fragt Herrn Celis.",
     "Er macht das Buch zu."
    ],
    "seite": 6
   },
   {
    "frage": "Wann liest Leon wieder vor?",
    "richtig": "morgen in der ersten Pause",
    "falsch": [
     "heute nach der Schule",
     "morgen im Klassenzimmer"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "c6-das-picknick-im-park",
  "titel": "Das Picknick im Park",
  "bild": "🧺",
  "seiten": [
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🧺",
      "☀️"
     ],
     "leute": [
      "Papa",
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Heu|te ist ein son|ni|ger Sonn|tag im Sep|tem|ber.",
     "Pa|pa packt ei|nen gro|ßen Korb.",
     "Im Korb sind Bro|te, Trau|ben und Ap|fel|saft.",
     "Le|on und Paul tra|gen die De|cke.",
     "Sie ge|hen zu|sam|men in den gro|ßen Park."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🧺",
      "👋"
     ],
     "leute": [
      "Elisabeth",
      "Helena",
      "Leon"
     ]
    },
    "zeilen": [
     "Im Park war|ten schon E|li|sa|beth und He|le|na.",
     "„Hal|lo, ihr bei|den!“, ruft He|le|na und winkt.",
     "Sie brei|ten die De|cke auf der Wie|se aus.",
     "Die Blät|ter an den Bäu|men sind schon bunt.",
     "Al|le set|zen sich und fan|gen an zu es|sen."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🥪",
      "🍇"
     ],
     "leute": [
      "Papa",
      "Elisabeth",
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on isst ein gro|ßes Kä|se|brot mit Gur|ke.",
     "E|li|sa|beth reicht ihm die Trau|ben.",
     "„Die sind a|ber süß!“, sagt Le|on.",
     "Pa|pa gießt al|len Saft ein.",
     "Paul hat schon zwei gan|ze Bro|te ge|ges|sen."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "⚽",
      "💡"
     ],
     "leute": [
      "Paul",
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "Nach dem Es|sen holt Paul den Ball.",
     "„Wir ma|chen ein Elf|me|ter|schie|ßen!“, ruft er.",
     "Pa|pa legt zwei Ja|cken als Tor ins Gras.",
     "Le|on stellt sich so|fort ins Tor.",
     "He|le|na und Paul dür|fen schie|ßen."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "⚽",
      "🧤"
     ],
     "leute": [
      "Helena",
      "Leon"
     ]
    },
    "zeilen": [
     "He|le|na zählt auf Eng|lisch bis drei.",
     "Dann läuft sie an und schießt mit Schwung.",
     "Der Ball rollt in die lin|ke E|cke.",
     "Le|on wirft sich hin und hält ihn fest!",
     "„Du bist ja schnell!“, staunt He|le|na."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "⚽",
      "🥅"
     ],
     "leute": [
      "Paul",
      "Leon"
     ]
    },
    "zeilen": [
     "Jetzt ist Paul mit dem Schie|ßen dran.",
     "Er schießt ganz hoch in die rech|te E|cke.",
     "Le|on springt hoch in die Luft.",
     "Der Ball fliegt knapp ü|ber sei|ne Fin|ger.",
     "„Tor!“, ruft Paul und hüpft vor Freu|de."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "👏",
      "⚽"
     ],
     "leute": [
      "Papa",
      "Elisabeth",
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on holt den Ball aus dem Gras.",
     "„Was für ein Sprung!“, ruft Pa|pa.",
     "E|li|sa|beth klatscht in die Hän|de.",
     "Le|on lacht und stellt sich wie|der ins Tor.",
     "„Noch ein|mal, bit|te!“, ruft er fröh|lich."
    ]
   },
   {
    "szene": {
     "ort": "park",
     "dinge": [
      "🍂",
      "🧺"
     ],
     "leute": [
      "Papa",
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Sie spie|len noch lan|ge auf der Wie|se.",
     "Le|on hält noch ganz vie|le Bäl|le.",
     "Dann wird es lang|sam kühl.",
     "Al|le pa|cken die De|cke und den Korb ein.",
     "„Das war ein schö|ner Tag!“, sagt Le|on mü|de."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was ist im Korb?",
    "richtig": "Brote, Trauben und Apfelsaft",
    "falsch": [
     "Kuchen, Äpfel und Wasser",
     "Brezeln, Bananen und Milch"
    ],
    "seite": 1
   },
   {
    "frage": "Wie sind die Blätter an den Bäumen?",
    "richtig": "schon bunt",
    "falsch": [
     "noch ganz grün",
     "alle schon weg"
    ],
    "seite": 2
   },
   {
    "frage": "Was ist das Tor beim Elfmeterschießen?",
    "richtig": "zwei Jacken im Gras",
    "falsch": [
     "zwei Bäume im Park",
     "der Korb und die Decke"
    ],
    "seite": 4
   },
   {
    "frage": "In welcher Sprache zählt Helena bis drei?",
    "richtig": "auf Englisch",
    "falsch": [
     "auf Französisch",
     "auf Spanisch"
    ],
    "seite": 5
   },
   {
    "frage": "Wohin schießt Paul den Ball?",
    "richtig": "hoch in die rechte Ecke",
    "falsch": [
     "flach in die linke Ecke",
     "genau in Leons Hände"
    ],
    "seite": 6
   }
  ]
 },
 {
  "id": "a7-herr-celis-bringt-etwas-mit",
  "titel": "Herr Celis bringt etwas mit",
  "bild": "🌰",
  "seiten": [
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🏫",
      "❓"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Es ist Diens|tag|mor|gen in der Klas|se.",
     "Herr Ce|lis kommt mit ei|ner gro|ßen Tü|te her|ein.",
     "Die Tü|te ist ganz dick und schwer.",
     "„Ich ha|be euch et|was mit|ge|bracht“, sagt er.",
     "„Es ist ei|ne Ü|ber|ra|schung für die gan|ze Klas|se.“"
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "❓",
      "🤔"
     ],
     "leute": [
      "Leon",
      "Theo",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Al|le Kin|der wer|den ganz neu|gie|rig.",
     "Le|on flüs|tert lei|se mit sei|nem Freund The|o.",
     "„Sind da Bäl|le drin?“, fragt Le|on.",
     "„O|der viel|leicht Sü|ßig|kei|ten?“, fragt The|o.",
     "Herr Ce|lis lä|chelt nur und sagt nichts."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🌰",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Theo",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Dann schüt|tet er die Tü|te auf den Tisch.",
     "Es pol|tert und rollt in al|le Rich|tun|gen.",
     "Ganz vie|le brau|ne Kas|ta|ni|en lie|gen da!",
     "Sie sind glatt und glän|zen schön.",
     "„Die ha|be ich im Park ge|sam|melt“, sagt Herr Ce|lis."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🌰",
      "✋"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "„Heu|te bas|teln wir Fi|gu|ren“, sagt Herr Ce|lis.",
     "In je|der Kas|ta|nie ist schon ein klei|nes Loch.",
     "Da|zu gibt es Zahn|sto|cher für Ar|me und Bei|ne.",
     "„Steckt sie vor|sich|tig hi|nein“, sagt er.",
     "Je|des Kind holt sich drei Kas|ta|ni|en."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🌰",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Le|on hat so|fort ei|ne I|dee.",
     "Er baut ei|nen klei|nen Tor|wart.",
     "Der Tor|wart be|kommt be|son|ders lan|ge Ar|me.",
     "Da|mit kann er je|den Ball hal|ten.",
     "The|o baut na|tür|lich auch ei|nen Tor|wart."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🌰",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Da|nach bas|telt The|o noch ei|nen Ball.",
     "Da|für nimmt er die kleins|te Kas|ta|nie.",
     "Le|on malt sei|nem Tor|wart mit Filz|stift ein grü|nes Hemd.",
     "„Grün wie die Klee|blät|ter!“, sagt Le|on.",
     "The|o fin|det das Hemd rich|tig schön."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🌰",
      "🪟"
     ],
     "leute": [
      "Leon",
      "Theo",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Bald ist die gan|ze Klas|se fer|tig.",
     "Da gibt es Hun|de, Männ|chen und so|gar ei|ne Gi|raf|fe.",
     "Herr Ce|lis stellt al|le Fi|gu|ren auf die Fens|ter|bank.",
     "Er schaut sich je|de Fi|gur ge|nau an.",
     "„Ihr habt euch toll an|ge|strengt“, sagt er."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🌰",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Theo",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Le|ons Tor|wart steht ne|ben The|os Tor|wart.",
     "Da|zwi|schen liegt der klei|ne Kas|ta|ni|en|ball.",
     "„Zwei Tor|war|te, ein Ball!“, ruft The|o.",
     "Le|on und The|o la|chen zu|sam|men.",
     "Mor|gen sam|melt Le|on mit Pa|pa im Park Kas|ta|ni|en."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Womit kommt Herr Celis herein?",
    "richtig": "mit einer großen Tüte",
    "falsch": [
     "mit einem Korb",
     "mit einem Ball"
    ],
    "seite": 1
   },
   {
    "frage": "Woran denkt Theo bei der Tüte?",
    "richtig": "an Süßigkeiten",
    "falsch": [
     "an Bälle",
     "an Kastanien"
    ],
    "seite": 2
   },
   {
    "frage": "Wo hat Herr Celis die Kastanien gesammelt?",
    "richtig": "im Park",
    "falsch": [
     "im Garten",
     "auf dem Pausenhof"
    ],
    "seite": 3
   },
   {
    "frage": "Welche Farbe hat das Hemd von Leons Torwart?",
    "richtig": "grün",
    "falsch": [
     "rot",
     "braun"
    ],
    "seite": 6
   },
   {
    "frage": "Wohin stellt Herr Celis die Figuren?",
    "richtig": "auf die Fensterbank",
    "falsch": [
     "auf den Tisch",
     "in den Schrank"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "b7-xaver-hat-viel-zu-tun",
  "titel": "Xaver hat viel zu tun",
  "bild": "🎨",
  "seiten": [
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "⚽",
      "🔔"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Nach der Schu|le nimmt Le|on sei|nen Ball.",
     "Er will mit Xa|ver Fuß|ball spie|len.",
     "Das ma|chen die bei|den fast je|den Tag.",
     "Le|on klin|gelt bei Xa|ver an der Tür.",
     "Nach ei|nem Mo|ment macht Xa|ver die Tür auf."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "📚",
      "✏️"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Xa|ver hat noch ei|nen Stift in der Hand.",
     "„Heu|te kann ich nicht“, sagt er.",
     "„Ich ha|be so vie|le Haus|auf|ga|ben.“",
     "Xa|ver geht in die fünf|te Klas|se.",
     "Am Gym|na|si|um gibt es viel zu ler|nen."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "⚽",
      "🙂"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Le|on ist erst ein biss|chen trau|rig.",
     "Dann sagt er: „Das ist gar nicht schlimm.“",
     "„Ich ü|be heu|te ein|fach al|lein Fan|gen.“",
     "Xa|ver lä|chelt ihn an.",
     "„Mor|gen ha|be ich wie|der Zeit“, ver|spricht er."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "🧱"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Le|on geht zu der gro|ßen Wand im Gar|ten.",
     "Pa|pa sitzt in der Nä|he und liest Zei|tung.",
     "Le|on wirft den Ball ge|gen die Wand.",
     "Der Ball prallt zu|rück zu Le|on.",
     "Le|on fängt ihn mit bei|den Hän|den."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "🧱"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Er wirft den Ball im|mer fes|ter.",
     "Ein|mal hüpft der Ball ganz schräg weg.",
     "Le|on springt hin|ter|her und lan|det weich im Gras.",
     "A|ber er hat den Ball fest in den Hän|den!",
     "„Su|per ge|fan|gen!“, ruft Pa|pa."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "🧤"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Jetzt zählt Le|on laut mit.",
     "Er fängt den Ball zehn|mal hin|ter|ein|an|der.",
     "Beim elf|ten Mal rutscht er ihm aus den Fin|gern.",
     "„Das war schon sehr gut“, denkt Le|on.",
     "Er ist ganz schön mü|de, a|ber stolz."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🖍️",
      "📄"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Da hat Le|on plötz|lich ei|ne gu|te I|dee.",
     "Er holt ein Blatt Pa|pier und sei|ne Bunt|stif|te.",
     "Er malt Xa|ver und sich auf dem Fuß|ball|platz.",
     "Da|zu malt er ei|ne gro|ße gel|be Son|ne.",
     "O|ben schreibt er: „Für Xa|ver“."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🖼️",
      "😊"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Am A|bend bringt Le|on das Bild zu Xa|ver.",
     "Xa|ver ist jetzt end|lich mit den Haus|auf|ga|ben fer|tig.",
     "Er schaut das Bild lan|ge und ge|nau an.",
     "„Das ist ein wun|der|schö|nes Bild!“, sagt er.",
     "„Mor|gen spie|len wir wie|der zu|sam|men Fuß|ball!“"
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Warum kann Xaver heute nicht spielen?",
    "richtig": "Er hat viele Hausaufgaben.",
    "falsch": [
     "Er ist zu müde.",
     "Er malt ein Bild."
    ],
    "seite": 2
   },
   {
    "frage": "Was macht Papa in der Nähe?",
    "richtig": "Er liest Zeitung.",
    "falsch": [
     "Er malt ein Bild.",
     "Er wirft den Ball."
    ],
    "seite": 4
   },
   {
    "frage": "Wie oft fängt Leon den Ball hintereinander?",
    "richtig": "zehnmal",
    "falsch": [
     "elfmal",
     "dreimal"
    ],
    "seite": 6
   },
   {
    "frage": "Was malt Leon noch dazu?",
    "richtig": "eine große gelbe Sonne",
    "falsch": [
     "einen großen Ball",
     "ein kleines Haus"
    ],
    "seite": 7
   },
   {
    "frage": "Wann spielen Leon und Xaver wieder zusammen?",
    "richtig": "morgen",
    "falsch": [
     "heute Abend",
     "am Sonntag"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "c7-ein-brief-fuer-mama",
  "titel": "Ein Brief für Mama",
  "bild": "✉️",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "💡",
      "🪑"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on sitzt am Tisch und hat ei|ne I|dee.",
     "„Ich schrei|be Ma|ma ei|nen Brief!“, sagt er.",
     "Er holt ein Blatt und ei|nen Stift.",
     "Dann ü|ber|legt er lan|ge.",
     "Was soll in dem Brief ste|hen?"
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "✏️",
      "📄"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on schreibt lang|sam und ganz or|dent|lich.",
     "„Lie|be Ma|ma!“, schreibt er o|ben hin.",
     "„Heu|te ha|be ich im Tor drei Bäl|le ge|hal|ten.“",
     "„Ich ha|be dich sehr lieb.“",
     "Zum Schluss schreibt er sei|nen Na|men."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🖍️",
      "📄"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Da|ne|ben malt er ein Tor und ei|nen Ball.",
     "Da kommt Paul ins Zim|mer.",
     "„Was machst du da?“, fragt Paul.",
     "„Ei|nen Brief für Ma|ma“, sagt Le|on stolz.",
     "„Der ist ja wun|der|schön!“, sagt Paul."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "✉️"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Le|on fal|tet den Brief vor|sich|tig zwei|mal.",
     "Er steckt ihn in ei|nen Um|schlag.",
     "Auf den Um|schlag malt er ein gro|ßes Herz.",
     "„Komm, wir brin|gen ihn Ma|ma so|fort!“, ruft Paul.",
     "Ma|ma wohnt auf der an|de|ren Stra|ßen|sei|te."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🧥",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Die bei|den zie|hen ih|re Ja|cken an.",
     "Drau|ßen weht ein küh|ler Herbst|wind.",
     "Am Rand vom Geh|weg blei|ben sie ste|hen.",
     "Paul nimmt Le|on an die Hand.",
     "„Erst schau|en wir nach links und rechts“, sagt Paul."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "👀",
      "✋"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Von links kommt ein ro|tes Au|to.",
     "Sie war|ten ge|dul|dig am Rand vom Geh|weg.",
     "Das Au|to fährt lang|sam an ih|nen vor|bei.",
     "Jetzt schau|en sie noch ein|mal nach links und rechts.",
     "Nun ist die Stra|ße ganz frei."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚶",
      "🔔"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "Hand in Hand ge|hen sie ru|hig ü|ber die Stra|ße.",
     "Sie ren|nen nicht und pas|sen gut auf.",
     "Le|on drückt bei Ma|ma auf die Klin|gel.",
     "Nach ei|nem Mo|ment macht Ma|ma die Tür auf.",
     "„Oh, mei|ne bei|den Gro|ßen!“, ruft sie fröh|lich."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "✉️",
      "🤗"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Mama"
     ]
    },
    "zeilen": [
     "Le|on gibt Ma|ma den Brief.",
     "Ma|ma öff|net ihn und liest ihn lang|sam.",
     "Sie schaut sich das Tor und den Ball an.",
     "Dann lä|chelt sie und drückt Le|on ganz fest.",
     "„Das ist der schöns|te Brief der Welt!“, sagt Ma|ma."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was holt Leon für den Brief?",
    "richtig": "ein Blatt und einen Stift",
    "falsch": [
     "ein Heft und eine Schere",
     "einen Umschlag und Klebeband"
    ],
    "seite": 1
   },
   {
    "frage": "Wie viele Bälle hat Leon heute gehalten?",
    "richtig": "drei",
    "falsch": [
     "zwei",
     "fünf"
    ],
    "seite": 2
   },
   {
    "frage": "Was malt Leon auf den Umschlag?",
    "richtig": "ein großes Herz",
    "falsch": [
     "ein Tor",
     "einen Ball"
    ],
    "seite": 4
   },
   {
    "frage": "Welche Farbe hat das Auto?",
    "richtig": "rot",
    "falsch": [
     "blau",
     "grün"
    ],
    "seite": 6
   },
   {
    "frage": "Was macht Mama ganz am Ende?",
    "richtig": "Sie lächelt und drückt Leon.",
    "falsch": [
     "Sie winkt Paul und lacht.",
     "Sie schreibt einen Brief zurück."
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "e1-der-schulweg-im-nebel",
  "titel": "Der Schulweg im Nebel",
  "bild": "🌫️",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌫️",
      "🪟"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Mor|gen ist drau|ßen al|les ganz weiß.",
     "Le|on schaut lan|ge aus dem gro|ßen Fens|ter.",
     "Er sieht den Gar|ten fast gar nicht.",
     "Vor dem Haus liegt di|cker Ne|bel.",
     "„Paul, komm mal schnell her!“, ruft Le|on."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍞",
      "🧥"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Paul kommt schnell in die Kü|che ge|lau|fen.",
     "„Das ist Ne|bel“, sagt Paul ru|hig.",
     "„Der kommt im Herbst ganz oft.“",
     "Die bei|den es|sen schnell ihr Brot auf.",
     "Dann zie|hen sie ih|re di|cken Ja|cken an."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🌫️",
      "🎒"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Drau|ßen ist die Luft kühl und nass.",
     "Der Ne|bel hängt tief ü|ber der Stra|ße.",
     "Le|on sieht nur bis zum nächs|ten Baum.",
     "„Al|les sieht heu|te an|ders aus“, sagt er.",
     "Paul nimmt Le|on an die Hand."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚗",
      "💡"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Am Rand vom Geh|weg blei|ben sie ste|hen.",
     "„Bei Ne|bel se|hen uns die Au|tos schlecht“, sagt Paul.",
     "Sie schau|en nach links und nach rechts.",
     "Ein Au|to fährt ganz lang|sam vor|bei.",
     "Es hat so|gar am Tag die Lich|ter an."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🌳",
      "👤"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Dann ge|hen die bei|den ganz ru|hig wei|ter.",
     "Vor|ne steht ein gro|ßer grau|er Schat|ten.",
     "Le|on bleibt kurz ste|hen und schaut.",
     "Doch es ist nur der di|cke Baum.",
     "Da muss Le|on ü|ber sich selbst la|chen."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "👣",
      "👋"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Auf ein|mal hö|ren sie lei|se Schrit|te.",
     "A|ber sie se|hen dort gar nie|man|den.",
     "„Wer ist denn das?“, flüs|tert Le|on.",
     "Da kommt ei|ne Frau aus dem Ne|bel.",
     "„Gu|ten Mor|gen, ihr zwei!“, sagt sie freund|lich."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🏫",
      "🌫️"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Bald se|hen die bei|den das gro|ße Schul|tor.",
     "Die Schu|le sieht heu|te ganz an|ders aus.",
     "Auf dem Pau|sen|hof ist es ganz still.",
     "Die an|de|ren Kin|der kom|men aus dem Ne|bel.",
     "Nach und nach wird der Hof voll."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "☀️",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "In der gro|ßen Pau|se scheint die Son|ne.",
     "Der di|cke Ne|bel ist ein|fach weg.",
     "Jetzt sieht Le|on wie|der den gan|zen Hof.",
     "„Der Weg im Ne|bel war toll!“, ruft Le|on.",
     "Paul lacht und holt schnell den Ball."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was liegt vor dem Haus?",
    "richtig": "dicker Nebel",
    "falsch": [
     "dicker Schnee",
     "viel Regen"
    ],
    "seite": 1
   },
   {
    "frage": "Was essen die beiden schnell?",
    "richtig": "ihr Brot",
    "falsch": [
     "einen Apfel",
     "einen Kuchen"
    ],
    "seite": 2
   },
   {
    "frage": "Wo bleiben Leon und Paul stehen?",
    "richtig": "am Rand vom Gehweg",
    "falsch": [
     "auf der Straße",
     "unter dem Baum"
    ],
    "seite": 4
   },
   {
    "frage": "Was ist der graue Schatten?",
    "richtig": "der dicke Baum",
    "falsch": [
     "eine Frau",
     "ein Auto"
    ],
    "seite": 5
   },
   {
    "frage": "Wie ist das Wetter in der Pause?",
    "richtig": "Die Sonne scheint.",
    "falsch": [
     "Es regnet.",
     "Es ist neblig."
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "e2-das-tor-aus-blaettern",
  "titel": "Das Tor aus Blättern",
  "bild": "🍂",
  "seiten": [
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🍂",
      "🌬️"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Es ist ein küh|ler Tag im Ok|to|ber.",
     "Le|on und Xa|ver sind wie|der im Gar|ten.",
     "Ü|ber|all lie|gen bun|te Blät|ter im Gras.",
     "Der Wind hat sie vom Baum ge|weht.",
     "Le|on schiebt sie mit dem Fuß zu|sam|men."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "💡",
      "🍁"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "„Wir bau|en ein Tor aus Blät|tern!“, ruft Xa|ver.",
     "Xa|ver geht in die fünf|te Klas|se.",
     "Er hat oft rich|tig gu|te I|de|en.",
     "Le|on fin|det den Plan so|fort rich|tig toll.",
     "Die bei|den ho|len zwei Re|chen aus dem Schup|pen."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🍂",
      "👣"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Sie re|chen die Blät|ter zu zwei Hau|fen.",
     "Die zwei Hau|fen sind jetzt die Pfos|ten.",
     "Le|on misst mit gro|ßen Schrit|ten da|zwi|schen.",
     "„Fünf Schrit|te sind ge|nau gut“, sagt Le|on.",
     "Xa|ver schiebt den zwei|ten Hau|fen et|was wei|ter."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🧤",
      "🍁"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Das tro|cke|ne Laub ra|schelt bei je|dem Schritt.",
     "Es riecht nach Herbst und nas|ser Er|de.",
     "Le|ons Hän|de wer|den lang|sam ganz kalt.",
     "Er reibt sie ganz schnell an|ein|an|der.",
     "Dann zieht er schnell sei|ne Hand|schu|he an."
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
      "Xaver"
     ]
    },
    "zeilen": [
     "Jetzt ist das gro|ße Tor end|lich fer|tig.",
     "Le|on stellt sich ge|nau in die Mit|te.",
     "„Schieß, ich hal|te al|les!“, ruft er.",
     "Xa|ver legt den Ball vor|sich|tig ins Gras.",
     "Dann nimmt er ei|nen kur|zen An|lauf."
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
      "Xaver"
     ]
    },
    "zeilen": [
     "Der ers|te Schuss fliegt flach nach links.",
     "Le|on wirft sich in den Blät|ter|hau|fen.",
     "Bun|te Blät|ter flie|gen hoch in die Luft.",
     "A|ber der Ball liegt in Le|ons Hän|den.",
     "„Su|per ge|hal|ten, Le|on!“, ruft Xa|ver laut."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "😅",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Beim zwei|ten Schuss ist Le|on zu lang|sam.",
     "Der Ball rollt ge|nau zwi|schen die Hau|fen.",
     "„Ein Tor für mich!“, lacht Xa|ver.",
     "„Das nächs|te Mal hal|te ich“, sagt Le|on.",
     "Er klopft die Blät|ter von der Ho|se."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🌙",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Sie spie|len noch lan|ge im kal|ten Gar|ten.",
     "Am En|de steht es drei zu drei.",
     "Von den Pfos|ten ist nicht viel üb|rig.",
     "Le|on hat so|gar Blät|ter in den Haa|ren.",
     "„Mor|gen bau|en wir ein neu|es Tor“, sagt Xa|ver."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "In welchem Monat spielen die beiden?",
    "richtig": "im Oktober",
    "falsch": [
     "im Juli",
     "im Januar"
    ],
    "seite": 1
   },
   {
    "frage": "Woraus sind die Pfosten?",
    "richtig": "aus Blättern",
    "falsch": [
     "aus Karton",
     "aus Stöcken"
    ],
    "seite": 3
   },
   {
    "frage": "Wie viele Schritte sind zwischen den Pfosten?",
    "richtig": "fünf Schritte",
    "falsch": [
     "drei Schritte",
     "zehn Schritte"
    ],
    "seite": 3
   },
   {
    "frage": "Was zieht Leon an?",
    "richtig": "seine Handschuhe",
    "falsch": [
     "eine Mütze",
     "seine Jacke"
    ],
    "seite": 4
   },
   {
    "frage": "Wie geht das Spiel aus?",
    "richtig": "drei zu drei",
    "falsch": [
     "eins zu null",
     "fünf zu zwei"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "e3-theo-ist-krank",
  "titel": "Theo ist krank",
  "bild": "💌",
  "seiten": [
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "📚",
      "🪑"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Es ist Mitt|woch|mor|gen in der Klas|se.",
     "Le|on legt sein Heft auf den Tisch.",
     "Der Platz ne|ben ihm bleibt heu|te leer.",
     "„The|o ist heu|te krank“, sagt Herr Ce|lis.",
     "Le|on schaut lan|ge auf den lee|ren Stuhl."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "✏️",
      "🙁"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on ist heu|te ein biss|chen trau|rig.",
     "The|o ist sein bes|ter Freund in der Klas|se.",
     "Bei|de sind Tor|wart und ü|ben oft zu|sam|men.",
     "Oh|ne The|o ist die Pau|se ganz an|ders.",
     "„Wer|de schnell wie|der ge|sund“, denkt Le|on."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🔔",
      "🥅"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Dann klin|gelt es zur gro|ßen Pau|se.",
     "Die Kin|der ren|nen so|fort zum Fuß|ball|tor.",
     "Heu|te steht Le|on ganz al|lein im Tor.",
     "Sonst wech|selt er sich mit The|o ab.",
     "Jetzt muss er ganz al|lein je|den Ball hal|ten."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "🌿"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Der ers|te Schuss fliegt in die E|cke.",
     "Le|on springt und hält den Ball fest.",
     "Der zwei|te Ball rollt an ihm vor|bei.",
     "Le|on holt ihn schnell aus der He|cke.",
     "Er gibt nicht auf und macht wei|ter."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "📣",
      "😊"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Am Rand des Ho|fes steht der klei|ne Le|o.",
     "Le|o geht in die ers|te Klas|se.",
     "„Los, Le|on, du schaffst das!“, ruft er.",
     "Das macht Le|on rich|tig viel Mut.",
     "Er stellt sich ganz breit ins Tor."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "👏"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Ein gro|ßes Kind schießt ganz fest aufs Tor.",
     "Der Ball fliegt hoch in die Luft.",
     "Le|on streckt bei|de Ar|me nach o|ben.",
     "Er fängt den Ball mit den Fin|ger|spit|zen.",
     "Al|le Kin|der auf dem Hof klat|schen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🖍️",
      "💌"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Nach|mit|tag sitzt Le|on an sei|nem Tisch.",
     "Er malt ei|ne schö|ne Kar|te für The|o.",
     "Dar|auf malt er zwei star|ke Tor|war|te.",
     "Da|zu schreibt er: „Wer|de schnell ge|sund!“",
     "Die Kar|te steckt er in sei|nen Ran|zen."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "💌",
      "😄"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Am nächs|ten Mor|gen ist The|o wie|der da.",
     "Le|on gibt ihm gleich die bun|te Kar|te.",
     "The|o schaut sie lan|ge an und lacht.",
     "„Zwei Tor|war|te in ei|nem Tor!“, sagt er.",
     "„In der Pau|se tau|schen wir wie|der“, sagt Le|on."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wer fehlt heute in der Klasse?",
    "richtig": "Theo",
    "falsch": [
     "Leon",
     "der kleine Leo"
    ],
    "seite": 1
   },
   {
    "frage": "Wo steht Leon in der Pause?",
    "richtig": "allein im Tor",
    "falsch": [
     "neben Theo",
     "am Rand"
    ],
    "seite": 3
   },
   {
    "frage": "Woher holt Leon den zweiten Ball?",
    "richtig": "aus der Hecke",
    "falsch": [
     "aus dem Tor",
     "von der Bank"
    ],
    "seite": 4
   },
   {
    "frage": "Wer ruft Leon Mut zu?",
    "richtig": "der kleine Leo",
    "falsch": [
     "Theo",
     "Herr Celis"
    ],
    "seite": 5
   },
   {
    "frage": "Was malt Leon auf die Karte?",
    "richtig": "zwei Torwarte",
    "falsch": [
     "einen Ball",
     "eine Sonne"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "e4-helena-zeigt-franzoesisch",
  "titel": "Helena zeigt Französisch",
  "bild": "📕",
  "seiten": [
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "📕",
      "☀️"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "Es ist Sams|tag|nach|mit|tag und die Son|ne scheint.",
     "He|le|na sitzt drau|ßen auf der Gar|ten|bank.",
     "Vor ihr liegt ein di|ckes blau|es Buch.",
     "Da kommt Le|on mit sei|nem Ball an|ge|lau|fen.",
     "„Lernst du schon wie|der Eng|lisch?“, fragt er."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "📕",
      "🙂"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "„Heu|te nicht“, sagt He|le|na und lacht kurz.",
     "„Heu|te ler|ne ich lie|ber Fran|zö|sisch.“",
     "„Das ist noch ei|ne ganz an|de|re Spra|che.“",
     "Le|on setzt sich ne|ben sie auf die Bank.",
     "„Kannst du mir et|was zei|gen?“, fragt er."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "☝️",
      "📕"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "He|le|na hält ei|nen Fin|ger in die Luft.",
     "„Die Eins heißt auf Fran|zö|sisch un.“",
     "„Man spricht das fast wie öng aus.“",
     "Le|on hält auch gleich ei|nen Fin|ger hoch.",
     "„Un!“, ruft Le|on dann ganz laut."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "✌️",
      "😄"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "Dann hält He|le|na zwei Fin|ger hoch.",
     "„Die Zwei heißt auf Fran|zö|sisch deux.“",
     "„Man spricht das ein|fach wie dö aus.“",
     "Le|on lacht laut ü|ber das lus|ti|ge Wort.",
     "„Dö!“, ruft er gleich noch ein|mal."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🤟",
      "👏"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "„Und die Drei heißt trois“, sagt He|le|na.",
     "„Man spricht das un|ge|fähr wie troa aus.“",
     "Le|on sagt al|le drei Wör|ter hin|ter|ein|an|der auf.",
     "Beim drit|ten Mal kann er sie schon.",
     "Da klatscht He|le|na laut in die Hän|de."
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
     "„Jetzt ma|chen wir ein Spiel“, sagt He|le|na.",
     "Sie schießt die Bäl|le auf Le|ons Tor.",
     "Vor je|dem Schuss zählt sie lei|se mit.",
     "„Un, deux, trois!“, ruft He|le|na laut.",
     "Dann fliegt der Ball auch schon los."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🧤",
      "🍎"
     ],
     "leute": [
      "Leon",
      "Helena",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "Le|on hält zwei von den drei Bäl|len.",
     "Da kommt E|li|sa|beth in den son|ni|gen Gar|ten.",
     "„Was ruft ihr denn da?“, fragt sie.",
     "„Wir zäh|len auf Fran|zö|sisch!“, sagt Le|on stolz.",
     "E|li|sa|beth staunt und lacht mit ih|nen."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "📕",
      "😊"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "„Du hast dir al|les ge|merkt“, lobt He|le|na.",
     "„Und du hast rich|tig gut ge|übt.“",
     "Le|on zählt noch ein|mal ganz lang|sam mit.",
     "„Un, deux, trois“, sagt er lei|se.",
     "Mor|gen will er es sei|nem Bru|der Paul bei|brin|gen."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Welche Sprache lernt Helena heute?",
    "richtig": "Französisch",
    "falsch": [
     "Englisch",
     "Deutsch"
    ],
    "seite": 2
   },
   {
    "frage": "Was heißt zwei auf Französisch?",
    "richtig": "deux",
    "falsch": [
     "un",
     "trois"
    ],
    "seite": 4
   },
   {
    "frage": "Wann kann Leon die drei Wörter?",
    "richtig": "beim dritten Mal",
    "falsch": [
     "beim ersten Mal",
     "gar nicht"
    ],
    "seite": 5
   },
   {
    "frage": "Wie viele von drei Bällen hält Leon?",
    "richtig": "zwei von drei",
    "falsch": [
     "alle drei",
     "keinen einzigen"
    ],
    "seite": 7
   },
   {
    "frage": "Wem will Leon die Wörter beibringen?",
    "richtig": "Paul",
    "falsch": [
     "Theo",
     "Xaver"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "e5-der-igel-im-garten",
  "titel": "Der Igel im Garten",
  "bild": "🦔",
  "seiten": [
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🔦",
      "🌙"
     ],
     "leute": [
      "Leon",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "Es ist A|bend und schon fast dun|kel.",
     "Le|on holt sei|nen Ball aus dem Gar|ten.",
     "E|li|sa|beth kommt mit ei|ner Ta|schen|lam|pe mit.",
     "Die Luft riecht nach nas|sem Gras und Laub.",
     "Ir|gend|wo ra|schelt es lei|se im Laub."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🔦",
      "🦔"
     ],
     "leute": [
      "Leon",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "Le|on bleibt so|fort ganz still ste|hen.",
     "„Hörst du das auch?“, flüs|tert er.",
     "E|li|sa|beth macht schnell die Ta|schen|lam|pe an.",
     "Sie leuch|tet ganz vor|sich|tig un|ter die He|cke.",
     "Dort sitzt ein klei|ner I|gel im Laub."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🦔",
      "👀"
     ],
     "leute": [
      "Leon",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "Der klei|ne I|gel hat vie|le brau|ne Sta|cheln.",
     "Sei|ne klei|ne Na|se ist spitz und schwarz.",
     "Er schnup|pert und macht ganz lei|se Ge|räu|sche.",
     "„Der ist ja win|zig!“, flüs|tert Le|on.",
     "„Wir blei|ben ganz ru|hig hier ste|hen“, sagt E|li|sa|beth."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "✋",
      "🦔"
     ],
     "leute": [
      "Leon",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "„Darf ich ihn strei|cheln?“, fragt Le|on.",
     "„Nein, lie|ber nicht“, sagt E|li|sa|beth lei|se.",
     "„I|gel sind wild und sehr scheu.“",
     "„Und die Sta|cheln piek|sen ganz schön.“",
     "Le|on nickt und lässt die Hän|de un|ten."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🪣",
      "🦔"
     ],
     "leute": [
      "Leon",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "Der I|gel will ü|ber den Weg lau|fen.",
     "Doch da ste|hen ein Ei|mer und ein Re|chen.",
     "Der klei|ne I|gel dreht sich wie|der um.",
     "Er weiß nicht, wo|hin er soll.",
     "„Wir ma|chen ihm ein|fach Platz“, sagt E|li|sa|beth."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🧹",
      "🦔"
     ],
     "leute": [
      "Leon",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "Le|on stellt den Ei|mer an die Wand.",
     "E|li|sa|beth legt den Re|chen un|ter die Bank.",
     "Jetzt ist der gan|ze Weg end|lich frei.",
     "Der I|gel schnup|pert wie|der in die Luft.",
     "Dann trip|pelt er ganz lang|sam los."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🌿",
      "🦔"
     ],
     "leute": [
      "Leon",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "Der I|gel läuft lang|sam bis zur He|cke.",
     "Dort ist ein klei|nes Loch im Zaun.",
     "Er passt ge|nau durch das Loch.",
     "Noch ein|mal ra|schelt es ganz laut.",
     "Dann ist der klei|ne I|gel weg."
    ]
   },
   {
    "szene": {
     "ort": "nacht",
     "dinge": [
      "🍂",
      "😊"
     ],
     "leute": [
      "Leon",
      "Elisabeth"
     ]
    },
    "zeilen": [
     "Le|on schaut noch ganz lan|ge zur He|cke.",
     "„Wo schläft er denn jetzt?“, fragt er.",
     "„I|gel schla|fen gern un|ter dem al|ten Laub.“",
     "Zu|sam|men tra|gen sie Laub in die E|cke.",
     "„Das ist jetzt sein Bett“, sagt Le|on froh."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was hat Elisabeth dabei?",
    "richtig": "eine Taschenlampe",
    "falsch": [
     "einen Rechen",
     "einen Eimer"
    ],
    "seite": 1
   },
   {
    "frage": "Wo sitzt der Igel?",
    "richtig": "unter der Hecke",
    "falsch": [
     "unter der Bank",
     "an der Wand"
    ],
    "seite": 2
   },
   {
    "frage": "Warum darf Leon den Igel nicht streicheln?",
    "richtig": "Igel sind wild.",
    "falsch": [
     "Er ist zu klein.",
     "Er schläft schon."
    ],
    "seite": 4
   },
   {
    "frage": "Was stellt Leon an die Wand?",
    "richtig": "den Eimer",
    "falsch": [
     "den Rechen",
     "die Lampe"
    ],
    "seite": 6
   },
   {
    "frage": "Was tragen sie am Ende in die Ecke?",
    "richtig": "Laub",
    "falsch": [
     "Steine",
     "Blumen"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "e6-papas-pfannkuchen",
  "titel": "Papas Pfannkuchen",
  "bild": "🥞",
  "seiten": [
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥞",
      "👃"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Am Sonn|tag riecht es toll in der Kü|che.",
     "Pa|pa steht schon lan|ge am Herd.",
     "„Heu|te gibt es Pfann|ku|chen zum Es|sen“, sagt er.",
     "Le|on rennt so|fort in die Kü|che.",
     "„Darf ich dir hel|fen?“, fragt er."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥚",
      "🥣"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa gibt ihm gleich die gro|ße Schüs|sel.",
     "Le|on schlägt zwei gro|ße Ei|er hi|nein.",
     "Dann kom|men noch Mehl und Milch da|zu.",
     "Le|on rührt al|les lan|ge mit dem Schnee|be|sen.",
     "Der Teig wird glatt und gelb."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🔥",
      "🧈"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa macht die gro|ße Pfan|ne heiß.",
     "Ein Stück But|ter zischt lei|se in der Pfan|ne.",
     "„Bleib bit|te ein Stück weg“, sagt Pa|pa.",
     "„Die Pfan|ne ist näm|lich sehr heiß.“",
     "Le|on stellt sich lie|ber ne|ben den Tisch."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥞",
      "🍳"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa gießt den Teig in die Pfan|ne.",
     "Der Pfann|ku|chen wird rund und gol|den.",
     "Nach ei|ner Wei|le hebt Pa|pa die Pfan|ne.",
     "Er wirft den Pfann|ku|chen in die Luft.",
     "Dann fängt er ihn si|cher wie|der auf."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "😲",
      "🍳"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "„Oh, das ist toll!“, ruft Le|on.",
     "„Das will ich auch ein|mal kön|nen!“",
     "Pa|pa lacht und hält die Pfan|ne fest.",
     "Le|on stellt sich schnell auf ei|nen Ho|cker.",
     "Pa|pas Hand bleibt da|bei im|mer am Griff."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🥞",
      "⬆️"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "„Eins, zwei, drei!“, zählt Pa|pa laut.",
     "Zu|sam|men wer|fen sie den Pfann|ku|chen ganz hoch.",
     "Er fliegt viel zu weit nach o|ben.",
     "Fast klebt er o|ben an der De|cke!",
     "Le|on macht da|bei ganz gro|ße Au|gen."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍳",
      "😂"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Der Pfann|ku|chen fällt lang|sam wie|der he|run|ter.",
     "Pa|pa hält die Pfan|ne ganz schnell hin.",
     "Platsch, da liegt er wie|der drin!",
     "„Ge|hal|ten wie ein Tor|wart!“, ruft Le|on.",
     "Bei|de la|chen ganz laut in der Kü|che."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍽️",
      "😄"
     ],
     "leute": [
      "Leon",
      "Papa",
      "Paul"
     ]
    },
    "zeilen": [
     "Da kommt Paul in die Kü|che.",
     "„Wa|rum lacht ihr denn so?“, fragt er.",
     "„Un|ser Pfann|ku|chen war fast an der De|cke“, sagt Le|on.",
     "Dann es|sen die drei zu|sam|men am Tisch.",
     "Le|on isst am En|de vier Pfann|ku|chen mit Ap|fel|mus."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was gibt es am Sonntag?",
    "richtig": "Pfannkuchen",
    "falsch": [
     "Apfelkuchen",
     "Nudeln"
    ],
    "seite": 1
   },
   {
    "frage": "Wie viele Eier schlägt Leon hinein?",
    "richtig": "zwei",
    "falsch": [
     "drei",
     "sechs"
    ],
    "seite": 2
   },
   {
    "frage": "Womit rührt Leon den Teig?",
    "richtig": "mit dem Schneebesen",
    "falsch": [
     "mit dem Löffel",
     "mit der Hand"
    ],
    "seite": 2
   },
   {
    "frage": "Wohin fliegt der Pfannkuchen fast?",
    "richtig": "an die Decke",
    "falsch": [
     "auf den Boden",
     "aus dem Fenster"
    ],
    "seite": 6
   },
   {
    "frage": "Wie viele Pfannkuchen isst Leon?",
    "richtig": "vier",
    "falsch": [
     "zwei",
     "zehn"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "e7-die-spiele-in-der-pause",
  "titel": "Die Spiele in der Pause",
  "bild": "⭐",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🪢",
      "⭕"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "In der Pau|se steht Herr Ce|lis drau|ßen.",
     "Er hat ein Seil und drei Rei|fen da|bei.",
     "„Heu|te ma|chen wir klei|ne Spie|le!“, ruft er.",
     "Vie|le Kin|der kom|men so|fort zu ihm an|ge|rannt.",
     "Le|on ist gleich ganz vor|ne da|bei."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "👦",
      "🤝"
     ],
     "leute": [
      "Leon",
      "Herr Celis",
      "Leo"
     ]
    },
    "zeilen": [
     "„Im|mer zwei Kin|der spie|len zu|sam|men“, sagt er.",
     "Le|on schaut sich auf dem Hof um.",
     "Am Rand steht der klei|ne Le|o al|lein.",
     "Le|o geht in die ers|te Klas|se.",
     "„Komm, wir zwei ma|chen mit!“, ruft Le|on."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🏃",
      "👏"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Das ers|te Spiel ist ein Wett|lauf.",
     "Le|on läuft zu|erst die kur|ze Stre|cke.",
     "Dann schlägt er die Hand von Le|o ab.",
     "Le|o rennt los, so schnell er kann.",
     "Sei|ne Bei|ne sind noch ganz kurz."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "😄",
      "🏃"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Die bei|den wer|den heu|te nicht Ers|ter.",
     "A|ber Le|o strahlt ü|ber das gan|ze Ge|sicht.",
     "„So schnell bin ich noch nie ge|rannt!“",
     "„Du warst rich|tig schnell“, lobt ihn Le|on.",
     "Dann geht es wei|ter zum nächs|ten Spiel."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⭕",
      "🐸"
     ],
     "leute": [
      "Leon",
      "Leo",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Jetzt müs|sen al|le durch drei Rei|fen hüp|fen.",
     "Herr Ce|lis legt sie al|le ins Gras.",
     "Le|on hüpft mit bei|den Bei|nen zu|gleich.",
     "Le|o hüpft wie ein klei|ner Frosch.",
     "Al|le Kin|der la|chen und klat|schen laut."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🪣",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Beim drit|ten Spiel geht es ums Wer|fen.",
     "Je|des Kind wirft drei Bäl|le in ei|nen Ei|mer.",
     "Le|on trifft zwei|mal in den Ei|mer.",
     "Le|o a|ber trifft so|gar drei|mal!",
     "„Du bist ein gu|ter Wer|fer!“, staunt Le|on."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⭐",
      "🙌"
     ],
     "leute": [
      "Leon",
      "Leo",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Am En|de zählt Herr Ce|lis die Punk|te.",
     "Le|on und Le|o sind Zwei|ter ge|wor|den.",
     "Herr Ce|lis gibt je|dem Kind ei|nen Auf|kle|ber.",
     "Le|on be|kommt ei|nen schö|nen grü|nen Stern.",
     "Le|o be|kommt ei|nen ro|ten Stern da|zu."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🔔",
      "⭐"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "Da klin|gelt es lei|der schon wie|der.",
     "„Das hat rich|tig Spaß ge|macht!“, sagt Le|o.",
     "Le|on klebt sei|nen Stern an den Ran|zen.",
     "„Mor|gen spie|len wir wie|der zu|sam|men“, sagt Le|on.",
     "Le|o nickt und rennt in sei|ne Klas|se."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was bringt Herr Celis in die Pause mit?",
    "richtig": "ein Seil und Reifen",
    "falsch": [
     "einen Korb und Bälle",
     "ein Tor und Netze"
    ],
    "seite": 1
   },
   {
    "frage": "Mit wem spielt Leon zusammen?",
    "richtig": "mit dem kleinen Leo",
    "falsch": [
     "mit Theo",
     "mit Paul"
    ],
    "seite": 2
   },
   {
    "frage": "Was ist das erste Spiel?",
    "richtig": "ein Wettlauf",
    "falsch": [
     "ein Wurfspiel",
     "ein Hüpfspiel"
    ],
    "seite": 3
   },
   {
    "frage": "Wie oft trifft Leo in den Eimer?",
    "richtig": "dreimal",
    "falsch": [
     "viermal",
     "einmal"
    ],
    "seite": 6
   },
   {
    "frage": "Welche Farbe hat Leons Stern?",
    "richtig": "grün",
    "falsch": [
     "rot",
     "gelb"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "e8-der-starke-wind",
  "titel": "Der starke Wind",
  "bild": "💨",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "💨",
      "🪟"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Am Mor|gen rüt|telt der Wind am Fens|ter.",
     "Die Bäu|me im Gar|ten bie|gen sich weit.",
     "Bun|te Blät|ter flie|gen quer ü|ber die Stra|ße.",
     "„Heu|te ist ein Sturm“, sagt Paul.",
     "Drau|ßen kann man heu|te nicht Fuß|ball spie|len."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌬️",
      "🌳"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa schaut lan|ge aus dem Fens|ter.",
     "„Wir blei|ben heu|te lie|ber drin|nen“, sagt er.",
     "„Bei Sturm fal|len manch|mal Äs|te he|run|ter.“",
     "Le|on schaut ganz trau|rig auf sei|nen Ball.",
     "„Und was ma|chen wir dann?“, fragt er."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "💡",
      "🛋️"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Paul schaut sich lan|ge im Zim|mer um.",
     "„Wir bau|en ei|ne Höh|le!“, ruft er.",
     "Le|on springt so|fort vom wei|chen So|fa auf.",
     "„Ei|ne rich|tig gro|ße Höh|le?“, fragt er.",
     "„Die größ|te von al|len!“, sagt Paul."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🪑",
      "🧺"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Sie schie|ben zu|erst zwei Stüh|le zu|sam|men.",
     "Da|zwi|schen stel|len sie den gro|ßen Wä|sche|korb.",
     "Paul holt ei|ne gro|ße De|cke aus dem Schrank.",
     "Die De|cke liegt nun ü|ber al|lem.",
     "Schon ist die gro|ße Höh|le fer|tig."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🔦",
      "🛏️"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "In|nen ist es dun|kel und schön warm.",
     "Le|on legt zwei Kis|sen auf den Bo|den.",
     "Paul holt noch ei|ne klei|ne Lam|pe da|zu.",
     "Jetzt leuch|tet es in|nen ganz ge|müt|lich.",
     "Drau|ßen heult der Wind im|mer wei|ter."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📖",
      "🌬️"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Die bei|den lie|gen ge|müt|lich in der Höh|le.",
     "Paul liest Le|on aus ei|nem Buch vor.",
     "Le|on hört ihm ganz ge|nau zu.",
     "Manch|mal klap|pert drau|ßen ein Fens|ter|la|den laut.",
     "A|ber in der Höh|le ist es si|cher."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "☕",
      "😄"
     ],
     "leute": [
      "Leon",
      "Paul",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa bringt ih|nen zwei Be|cher war|men Ka|ka|o.",
     "Er schaut in die Höh|le hi|nein.",
     "„Darf ich auch kurz hi|nein?“, fragt er.",
     "„Pa|pa, du bist viel zu groß!“, lacht Le|on.",
     "Da setzt sich Pa|pa ein|fach vor die Höh|le."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🍂",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Am Nach|mit|tag wird der Wind end|lich lei|ser.",
     "Im Gar|ten lie|gen vie|le Äs|te und Blät|ter.",
     "Le|on und Paul sam|meln al|les zu|sam|men auf.",
     "Da|nach stel|len sie das Tor wie|der hin.",
     "„Mor|gen hal|te ich wie|der je|den Ball!“, ruft Le|on."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie ist das Wetter am Morgen?",
    "richtig": "Es ist ein Sturm.",
    "falsch": [
     "Es regnet.",
     "Die Sonne scheint."
    ],
    "seite": 1
   },
   {
    "frage": "Warum bleiben alle drinnen?",
    "richtig": "Es fallen Äste herunter.",
    "falsch": [
     "Es ist zu kalt.",
     "Sie sind zu müde."
    ],
    "seite": 2
   },
   {
    "frage": "Was stellen sie zwischen die Stühle?",
    "richtig": "den Wäschekorb",
    "falsch": [
     "eine Lampe",
     "zwei Kissen"
    ],
    "seite": 4
   },
   {
    "frage": "Was macht Paul in der Höhle?",
    "richtig": "Er liest vor.",
    "falsch": [
     "Er schläft.",
     "Er malt."
    ],
    "seite": 6
   },
   {
    "frage": "Was bringt Papa?",
    "richtig": "zwei Becher Kakao",
    "falsch": [
     "eine große Decke",
     "ein Buch"
    ],
    "seite": 7
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
  "id": "f3-majas-neue-schule",
  "titel": "Majas neue Schule",
  "bild": "🏫",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎒"
     ],
     "leute": [
      "Leon",
      "Jannik"
     ]
    },
    "zeilen": [
     "Nach der Schu|le war|tet Le|on am Schul|tor.",
     "Ne|ben ihm steht sein Mit|schü|ler Jan|nik.",
     "Jan|nik war|tet heu|te auf sei|ne Schwes|ter.",
     "Sei|ne gro|ße Schwes|ter heißt Ma|ja.",
     "„Da hin|ten kommt sie schon!“, ruft Jan|nik."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🎒"
     ],
     "leute": [
      "Leon",
      "Jannik",
      "Maja"
     ]
    },
    "zeilen": [
     "Ma|ja ist ei|nen gan|zen Kopf grö|ßer.",
     "Sie hat ei|nen schwe|ren Ruck|sack auf dem Rü|cken.",
     "„Hal|lo, ich bin Ma|ja“, sagt sie.",
     "„Und du bist be|stimmt Le|on.“",
     "Le|on nickt und wird ein biss|chen rot."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🏫"
     ],
     "leute": [
      "Leon",
      "Maja",
      "Jannik"
     ]
    },
    "zeilen": [
     "„Gehst du auch in un|se|re Schu|le?“, fragt Le|on.",
     "„Nein, ich bin jetzt auf der Re|al|schu|le.“",
     "„Ich ge|he dort in die fünf|te Klas|se.“",
     "Le|on macht gro|ße Au|gen.",
     "Das klingt für ihn ganz auf|re|gend."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽"
     ],
     "leute": [
      "Leon",
      "Maja",
      "Paul"
     ]
    },
    "zeilen": [
     "Zu Hau|se war|tet Paul schon im Gar|ten.",
     "Paul kennt Ma|ja schon ei|ne Wei|le.",
     "Die bei|den spie|len öf|ter zu|sam|men.",
     "„Er|zähl uns von dei|ner neu|en Schu|le!“, bit|tet Paul.",
     "Al|le set|zen sich ins küh|le Gras."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "📚"
     ],
     "leute": [
      "Leon",
      "Maja",
      "Paul"
     ]
    },
    "zeilen": [
     "„Mein Schul|haus ist rie|sig groß“, sagt Ma|ja.",
     "„Es hat drei Stock|wer|ke und vie|le Trep|pen.“",
     "„Am An|fang ha|be ich mich oft ver|lau|fen.“",
     "Le|on staunt und hört ganz ge|nau zu.",
     "Paul lacht und nickt da|zu."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "📒"
     ],
     "leute": [
      "Maja",
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Wir ha|ben auch vie|le Leh|rer“, er|zählt Ma|ja.",
     "„Für je|des Fach kommt ein an|de|rer Leh|rer.“",
     "„Das ist am An|fang ganz schön viel.“",
     "„Warst du auf|ge|regt?“, fragt Le|on lei|se.",
     "„Ja, am ers|ten Tag sehr“, sagt Ma|ja."
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
      "Maja",
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "„Jetzt ge|fällt es mir dort rich|tig gut“, sagt Ma|ja.",
     "„Ich ha|be schon zwei neu|e Freun|din|nen.“",
     "Le|on ist froh ü|ber die|sen Satz.",
     "Dann holt Paul den Ball aus dem Schup|pen.",
     "„Komm, wir spie|len noch ein biss|chen!“, ruft er."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Maja",
      "Paul"
     ]
    },
    "zeilen": [
     "Le|on stellt sich schnell in sein Tor.",
     "Ma|ja schießt den Ball flach nach links.",
     "Le|on wirft sich hin und hält ihn fest.",
     "„Du bist ja ein rich|ti|ger Tor|wart!“, ruft Ma|ja.",
     "Le|on freut sich rie|sig ü|ber das Lob."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Auf wen wartet Jannik nach der Schule?",
    "richtig": "auf seine Schwester",
    "falsch": [
     "auf seinen Bruder",
     "auf Herrn Celis"
    ],
    "seite": 1
   },
   {
    "frage": "Auf welche Schule geht Maja jetzt?",
    "richtig": "auf die Realschule",
    "falsch": [
     "auf das Gymnasium",
     "auf die Grundschule"
    ],
    "seite": 3
   },
   {
    "frage": "Wie viele Stockwerke hat Majas Schulhaus?",
    "richtig": "drei",
    "falsch": [
     "zwei",
     "fünf"
    ],
    "seite": 5
   },
   {
    "frage": "Warum hat Maja so viele Lehrer?",
    "richtig": "Für jedes Fach ein Lehrer.",
    "falsch": [
     "Die Schule ist sehr groß.",
     "Sie hat viele Freundinnen."
    ],
    "seite": 6
   },
   {
    "frage": "Was hält Leon am Ende fest?",
    "richtig": "den Ball",
    "falsch": [
     "den Rucksack",
     "das Buch"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "f4-mias-turnbeutel",
  "titel": "Mias Turnbeutel",
  "bild": "👟",
  "seiten": [
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "👟"
     ],
     "leute": [
      "Leon",
      "Mia"
     ]
    },
    "zeilen": [
     "Heu|te hat Le|ons Klas|se ei|ne Sport|stun|de.",
     "Al|le Kin|der ho|len schnell ih|re Turn|beu|tel.",
     "Le|on nimmt sei|nen Beu|tel vom Ha|ken.",
     "Ne|ben ihm steht Mi|a ganz still da.",
     "Ihr Ha|ken an der Wand ist ganz leer."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🎒"
     ],
     "leute": [
      "Leon",
      "Mia"
     ]
    },
    "zeilen": [
     "„Mein Turn|beu|tel ist weg“, sagt Mi|a lei|se.",
     "Ih|re Au|gen wer|den ganz feucht.",
     "„Wir su|chen ihn zu|sam|men“, sagt Le|on.",
     "Er legt sei|nen Beu|tel auf den Tisch.",
     "Dann schau|en die bei|den un|ter al|le Bän|ke."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "✏️"
     ],
     "leute": [
      "Leon",
      "Mia",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Un|ter den Bän|ken liegt nur ein Stift.",
     "Herr Ce|lis kommt zu den bei|den.",
     "„Ü|ber|legt mal ganz in Ru|he“, sagt er.",
     "„Wo wart ihr heu|te schon ü|ber|all?“",
     "Mi|a denkt ganz scharf nach und nickt."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🍂"
     ],
     "leute": [
      "Leon",
      "Mia"
     ]
    },
    "zeilen": [
     "Zu|erst ge|hen die bei|den auf den Hof.",
     "Dort steht Mi|as Lieb|lings|bank am Baum.",
     "Un|ter der Bank lie|gen nur bun|te Blät|ter.",
     "Le|on schaut so|gar hin|ter den Baum.",
     "Doch der Turn|beu|tel ist auch hier nicht."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "📚"
     ],
     "leute": [
      "Leon",
      "Mia"
     ]
    },
    "zeilen": [
     "„Wo warst du denn in der ers|ten Stun|de?“",
     "Mi|a ü|ber|legt ei|nen kur|zen Mo|ment.",
     "„Wir wa|ren doch in der Bü|che|rei!“",
     "„Da ha|be ich ein Buch aus|ge|sucht.“",
     "„Dann schau|en wir dort nach!“, ruft Le|on."
    ]
   },
   {
    "szene": {
     "ort": "buecherei",
     "dinge": [
      "📚"
     ],
     "leute": [
      "Leon",
      "Mia"
     ]
    },
    "zeilen": [
     "In der Bü|che|rei ist es ganz still.",
     "Vie|le Bü|cher ste|hen in ho|hen Re|ga|len.",
     "Mi|a geht so|fort zu ih|rem Platz.",
     "Le|on sucht am Bo|den zwi|schen den Stüh|len.",
     "Plötz|lich ruft Le|on ganz laut."
    ]
   },
   {
    "szene": {
     "ort": "buecherei",
     "dinge": [
      "👟"
     ],
     "leute": [
      "Leon",
      "Mia"
     ]
    },
    "zeilen": [
     "Un|ter ei|nem Stuhl liegt der Turn|beu|tel.",
     "Er ist rot und hat wei|ße Strei|fen.",
     "Mi|a nimmt ihn und drückt ihn fest.",
     "„Dan|ke, Le|on!“, ruft sie ganz froh.",
     "Dann ren|nen die bei|den zu|rück zur Klas|se."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "👟",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Mia",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "In der Klas|se war|tet schon Herr Ce|lis.",
     "„Ihr habt zu|sam|men ge|sucht“, sagt er.",
     "„Das habt ihr wirk|lich gut ge|macht.“",
     "Mi|a hängt den Beu|tel an den Ha|ken.",
     "Dann geht die gan|ze Klas|se zum Sport."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was hat Mia verloren?",
    "richtig": "ihr Turnbeutel",
    "falsch": [
     "ihr Buch",
     "ihre Jacke"
    ],
    "seite": 2
   },
   {
    "frage": "Was liegt unter den Bänken?",
    "richtig": "nur ein Stift",
    "falsch": [
     "nur Blätter",
     "ein dickes Buch"
    ],
    "seite": 3
   },
   {
    "frage": "Wo war Mia in der ersten Stunde?",
    "richtig": "in der Bücherei",
    "falsch": [
     "im Garten",
     "in der Klasse"
    ],
    "seite": 5
   },
   {
    "frage": "Welche Farbe hat der Turnbeutel?",
    "richtig": "rot mit weißen Streifen",
    "falsch": [
     "blau mit Punkten",
     "ganz grün"
    ],
    "seite": 7
   },
   {
    "frage": "Wohin hängt Mia den Beutel?",
    "richtig": "an den Haken",
    "falsch": [
     "auf den Tisch",
     "in den Ranzen"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "f5-luka-haelt-den-ball-hoch",
  "titel": "Luka hält den Ball hoch",
  "bild": "🤹",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽"
     ],
     "leute": [
      "Leon",
      "Luka"
     ]
    },
    "zeilen": [
     "In der gro|ßen Pau|se ist es warm.",
     "Le|on läuft wie im|mer zum Tor.",
     "Da sieht er Lu|ka auf dem Hof.",
     "Lu|ka hält ei|nen Ball mit dem Fuß hoch.",
     "Der Ball fällt gar nicht he|run|ter."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽"
     ],
     "leute": [
      "Leon",
      "Luka"
     ]
    },
    "zeilen": [
     "Le|on bleibt ste|hen und schaut ge|nau hin.",
     "Lu|ka zählt lei|se bei je|dem Mal mit.",
     "„Sechs, sie|ben, acht!“, zählt er laut.",
     "Dann fängt er den Ball mit den Hän|den.",
     "„Wie machst du das bloß?“, fragt Le|on."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "👟"
     ],
     "leute": [
      "Leon",
      "Luka"
     ]
    },
    "zeilen": [
     "„Das ist gar nicht so schwer“, sagt Lu|ka.",
     "„Der Fuß muss ganz flach blei|ben.“",
     "„Und der Ball darf nicht zu hoch flie|gen.“",
     "Le|on nimmt den Ball und pro|biert es.",
     "Doch der Ball fällt so|fort ins Gras."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽"
     ],
     "leute": [
      "Leon",
      "Luka",
      "Theo"
     ]
    },
    "zeilen": [
     "Le|on ver|sucht es gleich noch ein|mal.",
     "Wie|der plumpst der Ball auf den Bo|den.",
     "Von der Bank ruft sein Freund The|o.",
     "„Nicht auf|ge|ben, Le|on, du schaffst das!“",
     "Le|on holt tief Luft und macht wei|ter."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽"
     ],
     "leute": [
      "Leon",
      "Luka"
     ]
    },
    "zeilen": [
     "Beim nächs|ten Mal klappt es end|lich.",
     "Der Ball hüpft ein|mal auf Le|ons Fuß.",
     "„Das war ein|mal!“, ruft Le|on ganz stolz.",
     "Lu|ka klatscht laut in bei|de Hän|de.",
     "„Sehr gut, jetzt kommt das zwei|te Mal.“"
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽"
     ],
     "leute": [
      "Leon",
      "Luka"
     ]
    },
    "zeilen": [
     "Le|on übt wie|der und wie|der und wie|der.",
     "Manch|mal rollt der Ball ganz weit weg.",
     "Dann holt Lu|ka ihn schnell für ihn zu|rück.",
     "Le|on wird lang|sam ein biss|chen mü|de.",
     "A|ber er will es un|be|dingt noch schaf|fen."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "⭐"
     ],
     "leute": [
      "Leon",
      "Luka",
      "Theo"
     ]
    },
    "zeilen": [
     "Dann kommt der gro|ße Au|gen|blick.",
     "Der Ball hüpft ein|mal auf sei|nem Fuß.",
     "Er hüpft ein zwei|tes und ein drit|tes Mal.",
     "„Drei|mal!“, ju|belt The|o von der Bank.",
     "Le|on fängt den Ball und hüpft her|um."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "🔔"
     ],
     "leute": [
      "Leon",
      "Luka",
      "Theo"
     ]
    },
    "zeilen": [
     "Doch dann klin|gelt es lei|der schon.",
     "„Du hast rich|tig lan|ge ge|übt“, sagt Lu|ka.",
     "„Da|für hast du es auch ge|schafft.“",
     "Le|on gibt Lu|ka schnell die Hand.",
     "„Mor|gen schaf|fe ich vier|mal!“, ruft Le|on."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was macht Luka mit dem Ball?",
    "richtig": "Er hält ihn hoch.",
    "falsch": [
     "Er wirft ihn weg.",
     "Er schießt aufs Tor."
    ],
    "seite": 1
   },
   {
    "frage": "Bis wie viel zählt Luka?",
    "richtig": "bis acht",
    "falsch": [
     "bis drei",
     "bis zehn"
    ],
    "seite": 2
   },
   {
    "frage": "Wie muss der Fuß bleiben?",
    "richtig": "ganz flach",
    "falsch": [
     "ganz weich",
     "ganz steif"
    ],
    "seite": 3
   },
   {
    "frage": "Wer ruft von der Bank?",
    "richtig": "Theo",
    "falsch": [
     "Luka",
     "Paul"
    ],
    "seite": 4
   },
   {
    "frage": "Wie oft schafft Leon es am Ende?",
    "richtig": "dreimal",
    "falsch": [
     "zweimal",
     "viermal"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "f6-minas-idee-fuer-die-pause",
  "titel": "Minas Idee für die Pause",
  "bild": "💡",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🔔"
     ],
     "leute": [
      "Leon",
      "Mina"
     ]
    },
    "zeilen": [
     "End|lich klin|gelt es zur gro|ßen Pau|se.",
     "Al|le Kin|der lau|fen schnell auf den Hof.",
     "Le|on will heu|te wie|der ins Tor.",
     "Am Rand sitzt Mi|na auf der Bank.",
     "Sie ü|ber|legt schon den gan|zen Mor|gen."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "💡"
     ],
     "leute": [
      "Leon",
      "Mina"
     ]
    },
    "zeilen": [
     "„Was machst du denn da?“, fragt Le|on.",
     "„Ich ha|be ei|ne I|dee für die Pau|se.“",
     "„Ich ken|ne ein Spiel für al|le Kin|der.“",
     "Le|on setzt sich schnell ne|ben Mi|na.",
     "„Er|zähl mal, wie geht das denn?“, fragt er."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎨"
     ],
     "leute": [
      "Leon",
      "Mina"
     ]
    },
    "zeilen": [
     "„Mein Spiel heißt Far|ben|fan|gen“, sagt Mi|na stolz.",
     "„Ei|ner ruft ganz laut ei|ne Far|be.“",
     "„Dann su|chen al|le die|se Far|be.“",
     "„Al|le fas|sen die|se Far|be schnell an.“",
     "Le|on fin|det die|ses Spiel so|fort gut."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "📒"
     ],
     "leute": [
      "Leon",
      "Mina",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Zu|sam|men ge|hen sie zu Herrn Ce|lis.",
     "Mi|na er|klärt ihm das gan|ze Spiel.",
     "Herr Ce|lis hört ihr ganz ge|nau zu.",
     "„Das ist ei|ne rich|tig gu|te I|dee“, sagt er.",
     "„Pro|biert es gleich in der Pau|se aus!“"
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎨"
     ],
     "leute": [
      "Mina",
      "Leon"
     ]
    },
    "zeilen": [
     "Vie|le Kin|der stel|len sich im Kreis auf.",
     "Mi|na steht ganz in der Mit|te.",
     "„Rot!“, ruft sie ganz laut.",
     "Al|le Kin|der ren|nen los und su|chen.",
     "Le|on fasst schnell ei|ne ro|te Ja|cke an."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🌿"
     ],
     "leute": [
      "Leon",
      "Mina"
     ]
    },
    "zeilen": [
     "„Grün!“, ruft Mi|na beim nächs|ten Mal.",
     "Le|on schaut sich ganz schnell um.",
     "Er sieht nichts Grü|nes in der Nä|he.",
     "Dann legt er sich ein|fach ins Gras.",
     "Al|le Kin|der la|chen und ma|chen es nach."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🍂"
     ],
     "leute": [
      "Leon",
      "Mina",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Im|mer mehr Kin|der ma|chen nun auch mit.",
     "So|gar Herr Ce|lis spielt ein biss|chen mit.",
     "Bei Gelb rennt er zu den Blät|tern.",
     "Al|le Kin|der la|chen und ru|fen laut.",
     "Mi|na ruft im|mer neu|e Far|ben."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "💡",
      "🔔"
     ],
     "leute": [
      "Mina",
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Viel zu schnell ist die Pau|se vor|bei.",
     "„Dein Spiel war rich|tig toll“, sagt Le|on.",
     "Herr Ce|lis lobt Mi|na vor der Klas|se.",
     "„Mor|gen spie|len wir wie|der Far|ben|fan|gen“, sagt er.",
     "Mi|na freut sich rie|sig da|rü|ber."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wo sitzt Mina in der Pause?",
    "richtig": "auf der Bank",
    "falsch": [
     "im Tor",
     "auf dem Gras"
    ],
    "seite": 1
   },
   {
    "frage": "Wie heißt Minas Spiel?",
    "richtig": "Farbenfangen",
    "falsch": [
     "Fußball",
     "Wettlauf"
    ],
    "seite": 3
   },
   {
    "frage": "Welche Farbe ruft Mina zuerst?",
    "richtig": "Rot",
    "falsch": [
     "Grün",
     "Gelb"
    ],
    "seite": 5
   },
   {
    "frage": "Was macht Leon bei Grün?",
    "richtig": "Er legt sich ins Gras.",
    "falsch": [
     "Er fasst eine Jacke an.",
     "Er rennt zum Tor."
    ],
    "seite": 6
   },
   {
    "frage": "Wer lobt Mina vor der Klasse?",
    "richtig": "Herr Celis",
    "falsch": [
     "Leon",
     "Paul"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "f7-der-tafeldienst",
  "titel": "Der Tafeldienst",
  "bild": "🧽",
  "seiten": [
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "📒"
     ],
     "leute": [
      "Leon",
      "Joko",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Am Mon|tag liest Herr Ce|lis die Diens|te vor.",
     "Je|de Wo|che sind an|de|re Kin|der dran.",
     "„Le|on und Jo|ko ha|ben Ta|fel|dienst“, sagt er.",
     "Die bei|den schau|en sich froh an.",
     "Ei|ne gan|ze Wo|che sind sie dran."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🧽"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "Herr Ce|lis zeigt ih|nen al|les ge|nau.",
     "Die Ta|fel muss nach je|der Stun|de sau|ber sein.",
     "Der Schwamm ge|hört in den klei|nen Ei|mer.",
     "Die Krei|de liegt in ei|ner Scha|le.",
     "„Das schaf|fen wir!“, sagt Jo|ko mu|tig."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🧽"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "Nach der ers|ten Stun|de geht Le|on los.",
     "Er nimmt den Schwamm und wischt drauf|los.",
     "Doch auf der Ta|fel blei|ben wei|ße Strei|fen.",
     "Der Schwamm war lei|der viel zu tro|cken.",
     "Le|on schaut ein biss|chen trau|rig hin."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "💧",
      "🧽"
     ],
     "leute": [
      "Joko",
      "Leon"
     ]
    },
    "zeilen": [
     "Jo|ko lacht ihn gar nicht aus.",
     "„Ich zei|ge dir ei|nen Trick“, sagt er.",
     "Er macht den Schwamm am Wasch|be|cken nass.",
     "Dann drückt er ihn or|dent|lich aus.",
     "Jetzt wischt Le|on die Ta|fel ganz sau|ber."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "✏️"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "Am Diens|tag ist die Krei|de fast al|le.",
     "Nur noch ein win|zi|ges Stück liegt da.",
     "„Wir ho|len neu|e Krei|de“, sagt Le|on.",
     "Im Schrank steht ei|ne gro|ße Schach|tel.",
     "Die bei|den fül|len die Scha|le wie|der auf."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🧽",
      "🔔"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "Am Mitt|woch sind sie schon rich|tig schnell.",
     "Le|on wischt o|ben und Jo|ko wischt un|ten.",
     "Sie sind vor dem Klin|geln fer|tig.",
     "Da|nach ha|ben sie noch Zeit zum Spie|len.",
     "Auf dem Hof war|tet schon der Ball."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🧽"
     ],
     "leute": [
      "Leon",
      "Joko",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Am Frei|tag glänzt die Ta|fel rich|tig.",
     "Kein ein|zi|ger Strei|fen ist mehr zu se|hen.",
     "Herr Ce|lis kommt in die Klas|se.",
     "Er bleibt ste|hen und schaut lan|ge hin.",
     "„So sau|ber war sie noch nie“, staunt er."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "⭐"
     ],
     "leute": [
      "Leon",
      "Joko",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "„Ihr habt euch die gan|ze Wo|che an|ge|strengt.“",
     "„Dar|auf könnt ihr rich|tig stolz sein.“",
     "Am Mon|tag sind dann an|de|re Kin|der dran.",
     "Le|on und Jo|ko klat|schen sich ab.",
     "„Nächs|tes Mal sind wir noch schnel|ler“, lacht Jo|ko."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Welchen Dienst bekommen Leon und Joko?",
    "richtig": "den Tafeldienst",
    "falsch": [
     "den Blumendienst",
     "den Hofdienst"
    ],
    "seite": 1
   },
   {
    "frage": "Wohin gehört der Schwamm?",
    "richtig": "in den kleinen Eimer",
    "falsch": [
     "in den Schrank",
     "auf den Tisch"
    ],
    "seite": 2
   },
   {
    "frage": "Warum bleiben Streifen auf der Tafel?",
    "richtig": "Der Schwamm war zu trocken.",
    "falsch": [
     "Die Kreide war zu hart.",
     "Leon war viel zu schnell."
    ],
    "seite": 3
   },
   {
    "frage": "Was ist am Dienstag fast alle?",
    "richtig": "die Kreide",
    "falsch": [
     "der Schwamm",
     "das Wasser"
    ],
    "seite": 5
   },
   {
    "frage": "Was sagt Herr Celis am Freitag?",
    "richtig": "So sauber war sie nie.",
    "falsch": [
     "Die Tafel ist noch schmutzig.",
     "Ihr müsst schneller wischen."
    ],
    "seite": 7
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
  "id": "g1-mittwoch-ist-trainingstag",
  "titel": "Mittwoch ist Trainingstag",
  "bild": "🎽",
  "seiten": [
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "⏰",
      "🎒"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Heu|te ist end|lich wie|der Mitt|woch.",
     "Le|on freut sich schon den gan|zen Mor|gen.",
     "Denn am Mitt|woch hat er im|mer Trai|ning.",
     "Herr Ce|lis schreibt noch Zah|len an die Ta|fel.",
     "Le|on rech|net schnell und schaut zur Uhr."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🎒",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Nach der Schu|le läuft Le|on nach Hau|se.",
     "Pa|pa war|tet schon an der Haus|tür.",
     "„Wir müs|sen gleich los“, sagt Pa|pa.",
     "Le|on nickt und rennt in sein Zim|mer.",
     "Die Sport|ta|sche liegt dort noch ganz leer."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧤",
      "👕"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zu|erst packt Le|on sei|ne Hand|schu|he ein.",
     "Dann kommt das grü|ne Tri|kot da|zu.",
     "Die Fuß|ball|schu|he steckt er auch hin|ein.",
     "O|ben|drauf legt er die Was|ser|fla|sche.",
     "„Fer|tig!“, ruft Le|on ganz laut."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍎",
      "⏰"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "In der Kü|che holt Le|on ei|nen Ap|fel.",
     "Er isst ihn in sechs gro|ßen Bis|sen.",
     "Pa|pa lacht und schaut auf die Uhr.",
     "„Um fünf geht es los“, sagt er.",
     "Le|on schnappt sei|ne Ta|sche und rennt."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚗",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa fährt mit Le|on zum ASC Box|dorf.",
     "Der Weg dau|ert nur we|ni|ge Mi|nu|ten.",
     "Le|on trom|melt lei|se auf sei|ne Ta|sche.",
     "Am Zaun hän|gen schon vie|le bun|te Blät|ter.",
     "Dann sieht er schon den grü|nen Platz."
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
     "Auf dem Platz war|tet schon Trai|ner Jens.",
     "Er hat die Bäl|le in ei|nem gro|ßen Netz.",
     "„Hal|lo Le|on!“, ruft Trai|ner Jens.",
     "„Heu|te ü|ben wir viel im Tor.“",
     "Schnell zieht Le|on sei|ne Hand|schu|he an."
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
     "Zu|erst lau|fen al|le ein|mal um den Platz.",
     "Dann stellt sich Le|on zwi|schen die Pfos|ten.",
     "Trai|ner Jens schießt flach auf das Tor.",
     "Le|on hält den Ball mit bei|den Hän|den.",
     "„Su|per ge|macht!“, ruft Trai|ner Jens."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🌙",
      "🎒"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Um halb sie|ben ist das Trai|ning zu En|de.",
     "Drau|ßen wird es schon ein biss|chen dun|kel.",
     "Pa|pa steht am Zaun und winkt.",
     "„Am Frei|tag kom|me ich wie|der!“, ruft Le|on.",
     "Trai|ner Jens hebt den Dau|men und lacht."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "An welchem Tag ist immer Training?",
    "richtig": "am Mittwoch",
    "falsch": [
     "am Montag",
     "am Sonntag"
    ],
    "seite": 1
   },
   {
    "frage": "Was packt Leon zuerst ein?",
    "richtig": "seine Handschuhe",
    "falsch": [
     "den Apfel",
     "den Ball"
    ],
    "seite": 3
   },
   {
    "frage": "Was sieht Leon am Ende der Fahrt?",
    "richtig": "den grünen Platz",
    "falsch": [
     "das Stadion",
     "die Schule"
    ],
    "seite": 5
   },
   {
    "frage": "Wie heißt der Trainer?",
    "richtig": "Jens",
    "falsch": [
     "Jonas",
     "Jakob"
    ],
    "seite": 6
   },
   {
    "frage": "Wann ist das Training zu Ende?",
    "richtig": "um halb sieben",
    "falsch": [
     "um fünf Uhr",
     "am Abend"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "g2-leons-neue-handschuhe",
  "titel": "Leons neue Handschuhe",
  "bild": "🤲",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧤",
      "📦"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Am Mitt|woch bringt Pa|pa ein Pa|ket mit.",
     "Le|on macht es ganz schnell auf.",
     "Da|rin lie|gen zwei neu|e Tor|wart|hand|schu|he.",
     "Sie sind grün und füh|len sich weich an.",
     "„Die sind für dein Trai|ning“, sagt Pa|pa."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🎒",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Kurz vor fünf ge|hen die bei|den los.",
     "Le|on trägt die Ta|sche ganz al|lein.",
     "Die Blät|ter am Weg sind schon gelb.",
     "„Zwei|mal in der Wo|che ist Trai|ning“, sagt Pa|pa.",
     "„Mitt|woch und Frei|tag“, ruft Le|on stolz."
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
     "Auf dem Platz steht schon Trai|ner Jens.",
     "Er zählt lang|sam al|le Kin|der durch.",
     "Dann lau|fen al|le zwei Run|den um den Platz.",
     "Le|on wird warm und zieht die Ja|cke aus.",
     "„Heu|te ü|ben wir das Hech|ten“, sagt Jens."
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
     "„Hech|ten ist ein Sprung zum Ball“, sagt Jens.",
     "Jens legt den Ball auf das Gras.",
     "Er zeigt den Sprung ganz lang|sam vor.",
     "Sei|ne Ar|me stre|cken sich weit nach vorn.",
     "Le|on schaut ge|nau auf sei|ne Hän|de."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🌿"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Jetzt darf Le|on selbst ins Tor.",
     "Jens rollt den Ball nach links.",
     "Le|on springt und fällt ins wei|che Gras.",
     "Der Ball rollt knapp an ihm vor|bei.",
     "„Fast!“, ruft Jens und klatscht."
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
     "„Sprin|ge frü|her los“, sagt Trai|ner Jens.",
     "Le|on nickt und stellt sich wie|der hin.",
     "Die|ses Mal springt er viel schnel|ler.",
     "Sei|ne Fin|ger be|rüh|ren den Ball ganz kurz.",
     "„Das war schon viel bes|ser!“, ruft Jens."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🎉"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Beim drit|ten Mal rollt der Ball nach rechts.",
     "Le|on hech|tet und streckt sich ganz weit.",
     "Er hält den Ball fest an sei|nem Bauch.",
     "Die an|de|ren Kin|der klat|schen laut.",
     "Le|on liegt im Gras und strahlt."
    ]
   },
   {
    "szene": {
     "ort": "platz",
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
     "Um halb sie|ben pfeift Jens zum Schluss.",
     "Le|ons neu|e Hand|schu|he sind vol|ler Gras.",
     "Pa|pa war|tet schon hin|ter dem Zaun.",
     "„Du hast rich|tig mu|tig ge|übt“, sagt Pa|pa.",
     "„Am Frei|tag hech|te ich noch wei|ter!“, sagt Le|on."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was liegt in dem Paket?",
    "richtig": "zwei neue Handschuhe",
    "falsch": [
     "ein Ball",
     "ein Buch"
    ],
    "seite": 1
   },
   {
    "frage": "Wann ist Training in der Woche?",
    "richtig": "Mittwoch und Freitag",
    "falsch": [
     "Montag und Dienstag",
     "nur am Samstag"
    ],
    "seite": 2
   },
   {
    "frage": "Was ist Hechten?",
    "richtig": "ein Sprung zum Ball",
    "falsch": [
     "ein schneller Lauf",
     "ein harter Schuss"
    ],
    "seite": 4
   },
   {
    "frage": "Wohin rollt der erste Ball?",
    "richtig": "nach links",
    "falsch": [
     "nach rechts",
     "nach oben"
    ],
    "seite": 5
   },
   {
    "frage": "Was macht Leon beim dritten Mal?",
    "richtig": "Er hält den Ball fest.",
    "falsch": [
     "Er fällt ins Gras.",
     "Er schießt ein Tor."
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "g3-training-im-regen",
  "titel": "Training im Regen",
  "bild": "💧",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌧️",
      "🪟"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Es ist ein grau|er Frei|tag|nach|mit|tag.",
     "Le|on schaut trau|rig aus dem Fens|ter.",
     "Drau|ßen reg|net es in di|cken Trop|fen.",
     "Die Stra|ße glänzt ganz nass.",
     "„Und heu|te ist Trai|ning“, sagt Le|on lei|se."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧥",
      "🎒"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "„Fällt das Trai|ning jetzt aus?“, fragt Le|on.",
     "Pa|pa schüt|telt den Kopf und lacht.",
     "„Wir spie|len auch im Re|gen“, sagt er.",
     "Le|on holt sei|ne Re|gen|ja|cke aus dem Schrank.",
     "Die Hand|schu|he steckt er in die Ta|sche."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "☔",
      "👟"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Der Weg zum Platz ist voll mit Pfüt|zen.",
     "Le|on springt mit bei|den Bei|nen hin|ein.",
     "Das Was|ser spritzt bis an die Ja|cke.",
     "Pa|pa hält den Schirm ü|ber sie bei|de.",
     "Bei|de la|chen den gan|zen Weg lang."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🌧️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Platz steht schon die gan|ze Mann|schaft.",
     "Kein ein|zi|ges Kind ist zu Hau|se ge|blie|ben.",
     "Al|le tra|gen Ja|cken mit Ka|pu|ze.",
     "Trai|ner Jens hat ei|ne Müt|ze auf.",
     "„Ihr seid al|le rich|tig tap|fer!“, ruft er."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "💦"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Der Ball ist nass und ganz schwer.",
     "Le|on stellt sich zwi|schen die Pfos|ten.",
     "Das Was|ser läuft ihm ü|ber das Ge|sicht.",
     "Trotz|dem schaut er ge|nau auf den Ball.",
     "Dann fliegt der ers|te Schuss auf ihn zu."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "😄"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on hech|tet in die lin|ke E|cke.",
     "Er fängt den Ball und rutscht durch das Gras.",
     "Sei|ne Ho|se ist jetzt braun und nass.",
     "Le|on steht auf und lacht ganz laut.",
     "„Das hat Spaß ge|macht!“, ruft er."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🍵",
      "🧣"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Um halb sie|ben ist das Trai|ning vor|bei.",
     "Al|le Kin|der sind nass bis auf die Haut.",
     "Da holt Jens ei|ne gro|ße Kan|ne.",
     "Da|rin ist hei|ßer Tee mit Ho|nig.",
     "Je|des Kind be|kommt ei|nen war|men Be|cher."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "☕",
      "🤝"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Le|on nimmt den Be|cher in bei|de Hän|de.",
     "Der Tee wärmt sei|ne kal|ten Fin|ger.",
     "Pa|pa kommt mit ei|nem tro|cke|nen Hand|tuch.",
     "„Ihr habt heu|te durch|ge|hal|ten“, sagt Jens.",
     "Le|on freut sich schon auf den Mitt|woch."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Welcher Tag ist es?",
    "richtig": "Freitag",
    "falsch": [
     "Mittwoch",
     "Samstag"
    ],
    "seite": 1
   },
   {
    "frage": "Was holt Leon aus dem Schrank?",
    "richtig": "seine Regenjacke",
    "falsch": [
     "seine Mütze",
     "seinen Schirm"
    ],
    "seite": 2
   },
   {
    "frage": "Wie viele Kinder bleiben zu Hause?",
    "richtig": "kein einziges",
    "falsch": [
     "fünf Kinder",
     "die halbe Mannschaft"
    ],
    "seite": 4
   },
   {
    "frage": "Wohin hechtet Leon?",
    "richtig": "in die linke Ecke",
    "falsch": [
     "in die rechte Ecke",
     "nach oben"
    ],
    "seite": 6
   },
   {
    "frage": "Was bekommt jedes Kind zum Schluss?",
    "richtig": "heißen Tee",
    "falsch": [
     "kalte Milch",
     "warmen Kakao"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "g4-joko-kommt-zum-training",
  "titel": "Joko kommt zum Training",
  "bild": "👋",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "🎒"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "In der Pau|se sitzt Le|on ne|ben Jo|ko.",
     "Jo|ko schaut neu|gie|rig in Le|ons gro|ße Ta|sche.",
     "Da|rin lie|gen zwei grü|ne Hand|schu|he.",
     "„Ich bin Tor|wart im Ver|ein“, sagt Le|on.",
     "Jo|kos Au|gen wer|den auf ein|mal ganz groß."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🥅",
      "🙂"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "„Darf ich da auch ein|mal mit|kom|men?“, fragt Jo|ko.",
     "„Klar, komm ein|fach mit!“, ruft Le|on so|fort.",
     "„Wir trai|nie|ren mitt|wochs und frei|tags.“",
     "„Von fünf bis halb sie|ben“, sagt Le|on.",
     "Jo|ko nickt und freut sich rie|sig."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚗",
      "🎒"
     ],
     "leute": [
      "Leon",
      "Joko",
      "Papa"
     ]
    },
    "zeilen": [
     "Am Mitt|woch klin|gelt Jo|ko an der Tür.",
     "Er hat ei|ne blau|e Ta|sche da|bei.",
     "Pa|pa fährt die bei|den zum Platz.",
     "Jo|ko ist ein biss|chen auf|ge|regt und still.",
     "„Al|le sind dort wirk|lich nett“, sagt Le|on."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🤝",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "Trai|ner Jens gibt Jo|ko die Hand.",
     "„Heu|te schnup|perst du ein|fach bei uns mit!“",
     "Jo|ko be|kommt ein Leib|chen in Gelb.",
     "Dann lau|fen al|le ei|ne gro|ße Run|de.",
     "Jo|ko bleibt da|bei im|mer ne|ben Le|on."
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
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "Zu|erst ü|ben al|le Kin|der das Pas|sen.",
     "Jo|ko trifft den Ball nicht rich|tig.",
     "Er wird ein biss|chen rot im Ge|sicht.",
     "„Das geht mir auch oft so“, sagt Le|on.",
     "Trai|ner Jens zeigt ihm den rich|ti|gen Fuß."
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
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "Dann stellt sich Le|on wie|der ins Tor.",
     "Jo|ko darf drei|mal auf ihn schie|ßen.",
     "Den ers|ten Ball hält Le|on ganz leicht.",
     "Der zwei|te fliegt weit ü|ber das Tor.",
     "Beim drit|ten Mal trifft Jo|ko ge|nau."
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
      "Joko"
     ]
    },
    "zeilen": [
     "Der Ball rollt ganz lang|sam in die E|cke.",
     "Le|on springt und kommt doch zu spät.",
     "„Su|per Schuss!“, ruft Le|on laut.",
     "Jo|ko lacht und hebt bei|de Ar|me.",
     "Al|le an|de|ren Kin|der klat|schen mit."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🌙",
      "🤝"
     ],
     "leute": [
      "Leon",
      "Joko",
      "Papa"
     ]
    },
    "zeilen": [
     "Um halb sie|ben ist das Trai|ning aus.",
     "Jo|ko gibt Trai|ner Jens die Hand.",
     "„Am Frei|tag kom|me ich wie|der!“, sagt er.",
     "Le|on freut sich ü|ber den neu|en Mit|spie|ler.",
     "Pa|pa bringt die bei|den wie|der nach Hau|se."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was liegt in Leons großer Tasche?",
    "richtig": "zwei grüne Handschuhe",
    "falsch": [
     "ein Buch",
     "eine Trinkflasche"
    ],
    "seite": 1
   },
   {
    "frage": "Wann trainiert Leon?",
    "richtig": "mittwochs und freitags",
    "falsch": [
     "jeden Tag",
     "am Wochenende"
    ],
    "seite": 2
   },
   {
    "frage": "Was bekommt Joko auf dem Platz?",
    "richtig": "ein Leibchen in Gelb",
    "falsch": [
     "eine grüne Mütze",
     "neue Handschuhe"
    ],
    "seite": 4
   },
   {
    "frage": "Wie oft darf Joko auf Leon schießen?",
    "richtig": "dreimal",
    "falsch": [
     "einmal",
     "fünfmal"
    ],
    "seite": 6
   },
   {
    "frage": "Was ruft Leon nach dem Schuss?",
    "richtig": "Super Schuss!",
    "falsch": [
     "Nicht schon wieder!",
     "Das war Pech."
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "g5-das-erste-spiel-am-samstag",
  "titel": "Das erste Spiel am Samstag",
  "bild": "👏",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚽",
      "🛏️"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Heu|te ist Sams|tag und Le|on ist schon wach.",
     "Sonst ist nur mitt|wochs und frei|tags Trai|ning.",
     "A|ber heu|te gibt es ein Spiel.",
     "Paul sitzt schon auf dem Bett und gähnt.",
     "„Ich kom|me mit und schau|e zu“, sagt Paul."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🚗",
      "🧤"
     ],
     "leute": [
      "Leon",
      "Papa",
      "Paul"
     ]
    },
    "zeilen": [
     "Um neun fah|ren al|le drei zum Platz.",
     "Le|on hält die Hand|schu|he auf dem Schoß.",
     "Sein Bauch kit|zelt ein biss|chen.",
     "„Du hast so oft ge|übt“, sagt Pa|pa.",
     "Das macht Le|on ein biss|chen ru|hi|ger."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🎽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auf dem Platz war|tet schon die an|de|re Mann|schaft.",
     "Die Kin|der tra|gen blau|e Tri|kots.",
     "Le|ons Mann|schaft spielt in Grün.",
     "Trai|ner Jens klatscht laut in die Hän|de.",
     "„Habt ein|fach Spaß da|bei!“, ruft er."
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
     "Le|on stellt sich zwi|schen die Pfos|ten.",
     "Er zupft sei|ne Hand|schu|he zu|recht.",
     "Dann pfeift Trai|ner Jens das Spiel an.",
     "So|fort lau|fen al|le Kin|der los.",
     "Le|on schaut nur noch auf den Ball."
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
     "Ein Kind in Blau schießt von links.",
     "Der Ball fliegt flach auf das Tor.",
     "Le|on hech|tet und fängt ihn fest.",
     "Sei|ne Mann|schaft ju|belt ganz laut.",
     "Le|on wirft den Ball schnell nach vorn."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "😔"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Dann rollt ein Ball von rechts he|ran.",
     "Le|on springt und be|kommt ihn nicht.",
     "Der Ball rollt lang|sam ins Tor.",
     "Le|on setzt sich ganz kurz ins Gras.",
     "Sei|ne Au|gen wer|den ein biss|chen feucht."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🤝",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Da läuft Trai|ner Jens zu ihm hin.",
     "„Kein Tor|wart hält je|den Ball“, sagt er.",
     "Nie|mand schimpft und nie|mand lacht ihn aus.",
     "Le|on steht auf und holt tief Luft.",
     "Beim nächs|ten Schuss hält er den Ball wie|der."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "👏",
      "🍎"
     ],
     "leute": [
      "Leon",
      "Papa",
      "Paul"
     ]
    },
    "zeilen": [
     "Nach dem Spiel klat|schen bei|de Mann|schaf|ten.",
     "Al|le Kin|der be|kom|men ein Stück Ap|fel.",
     "Paul hebt bei|de Dau|men für Le|on.",
     "„Du warst so mu|tig“, sagt Pa|pa lei|se.",
     "Am Mitt|woch geht Le|on wie|der zum Trai|ning."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Welcher Tag ist heute?",
    "richtig": "Samstag",
    "falsch": [
     "Mittwoch",
     "Freitag"
    ],
    "seite": 1
   },
   {
    "frage": "Welche Farbe tragen die anderen Kinder?",
    "richtig": "blau",
    "falsch": [
     "gelb",
     "rot"
    ],
    "seite": 3
   },
   {
    "frage": "Was macht Leon mit dem ersten Ball?",
    "richtig": "Er fängt ihn fest.",
    "falsch": [
     "Er rollt ihn weg.",
     "Er lässt ihn los."
    ],
    "seite": 5
   },
   {
    "frage": "Was passiert mit dem zweiten Ball?",
    "richtig": "Er rollt ins Tor.",
    "falsch": [
     "Leon hält ihn.",
     "Er fliegt weit weg."
    ],
    "seite": 6
   },
   {
    "frage": "Was sagt Trainer Jens zu Leon?",
    "richtig": "Kein Torwart hält jeden Ball.",
    "falsch": [
     "Du musst schneller springen.",
     "Der Ball war zu schnell."
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "h1-die-laterne-aus-papier",
  "titel": "Die Laterne aus Papier",
  "bild": "🏮",
  "seiten": [
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "✂️",
      "📄"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Herr Ce|lis legt bun|tes Pa|pier auf den Tisch.",
     "„Heu|te bas|teln wir un|se|re La|ter|nen“, sagt er.",
     "Le|on sucht sich ein gel|bes Blatt aus.",
     "Ne|ben ihm sitzt Ro|mi|na mit ro|tem Pa|pier.",
     "Auf dem Tisch liegt ein gro|ßer Kle|be|stift."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "✏️",
      "📏"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Zu|erst malt Le|on ei|nen gro|ßen Stern.",
     "Der Stern hat fünf spit|ze Za|cken.",
     "Dann schnei|det er ihn vor|sich|tig aus.",
     "Die Sche|re knirscht bei je|der Ecke.",
     "Ro|mi|na malt lie|ber ei|nen run|den Mond."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "😟",
      "📄"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Auf ein|mal reißt der Stern in der Mit|te.",
     "Le|on hält bei|de Tei|le in der Hand.",
     "Sein Mund wird ganz schmal.",
     "Er will noch ein|mal von vorn an|fan|gen.",
     "Doch das gel|be Pa|pier ist fast auf|ge|braucht."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🩹",
      "😊"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Herr Ce|lis setzt sich ne|ben Le|on.",
     "„Hier hilft ein Strei|fen Kle|be|band“, sagt er.",
     "Er klebt den Riss von hin|ten zu.",
     "Von vor|ne sieht man gar nichts mehr.",
     "Le|on at|met tief aus."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🖍️",
      "⭐"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Jetzt malt Le|on den Stern rich|tig aus.",
     "Er nimmt Gelb und ein biss|chen O|ran|ge.",
     "Ro|mi|na klebt sil|ber|ne Punk|te auf den Mond.",
     "„Dei|ner leuch|tet be|stimmt am hells|ten“, sagt sie.",
     "Le|on malt noch ei|nen Rand da|rum."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🏮",
      "🕯️"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Am En|de rollt Le|on das Pa|pier zu|sam|men.",
     "Dar|aus wird ein rich|ti|ger La|ter|nen|bauch.",
     "Herr Ce|lis steckt ein klei|nes Licht hi|nein.",
     "Dann macht er die Vor|hän|ge zu.",
     "Im Zim|mer wird es lang|sam dun|kel."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "✨",
      "🏮"
     ],
     "leute": [
      "Leon",
      "Romina",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "In der dunk|len Klas|se leuch|ten al|le La|ter|nen.",
     "Le|ons Stern wirft Schat|ten an die Wand.",
     "Die Kin|der wer|den ganz lei|se.",
     "Nie|mand will et|was sa|gen.",
     "Nur die klei|nen Lich|ter zit|tern ein biss|chen."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🏮",
      "🎒"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Nach der Schu|le trägt Le|on die La|ter|ne heim.",
     "Er hält sie mit bei|den Hän|den fest.",
     "Kein Wind soll sie um|wer|fen.",
     "Zu Hau|se stellt er sie ans Fens|ter.",
     "Dort kann sie je|der von drau|ßen se|hen."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was bastelt die Klasse?",
    "richtig": "Laternen",
    "falsch": [
     "Drachen",
     "Bilder"
    ],
    "seite": 1
   },
   {
    "frage": "Was malt Leon auf sein Papier?",
    "richtig": "einen Stern",
    "falsch": [
     "einen Mond",
     "ein Herz"
    ],
    "seite": 2
   },
   {
    "frage": "Was passiert mit dem Stern?",
    "richtig": "Er reißt in der Mitte.",
    "falsch": [
     "Er fällt herunter.",
     "Er wird nass."
    ],
    "seite": 3
   },
   {
    "frage": "Womit hilft Herr Celis?",
    "richtig": "mit Klebeband",
    "falsch": [
     "mit einer Schere",
     "mit neuem Papier"
    ],
    "seite": 4
   },
   {
    "frage": "Wohin stellt Leon die Laterne zu Hause?",
    "richtig": "ans Fenster",
    "falsch": [
     "auf den Tisch",
     "unter das Bett"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "h2-rominas-roller-streikt",
  "titel": "Rominas Roller streikt",
  "bild": "🛴",
  "seiten": [
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🛴",
      "🌫️"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Es ist noch früh und et|was neb|lig.",
     "Le|on und Ro|mi|na fah|ren zur Schu|le.",
     "Ih|re Rol|ler rol|len über den nas|sen Weg.",
     "Die Blät|ter kle|ben am Bo|den fest.",
     "Man sieht nur bis zur nächs|ten La|ter|ne."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🛴",
      "❗"
     ],
     "leute": [
      "Romina"
     ]
    },
    "zeilen": [
     "Plötz|lich macht Ro|mi|nas Rol|ler ein Ge|räusch.",
     "Es klingt wie ein lei|ses Krat|zen.",
     "Dann bleibt das Vor|der|rad ein|fach ste|hen.",
     "Ro|mi|na rutscht fast vom Brett.",
     "Sie stellt bei|de Fü|ße auf den Bo|den."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🔍",
      "🍂"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Le|on bremst und läuft zu|rück.",
     "Bei|de ge|hen vor dem Rol|ler in die Ho|cke.",
     "Im Rad steckt ein di|cker Ast.",
     "Er hat sich zwi|schen Rad und Blech ge|klemmt.",
     "Ein paar nas|se Blät|ter hän|gen auch da|ran."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "💪",
      "🌿"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on zieht vor|sich|tig an dem Ast.",
     "Beim ers|ten Mal pas|siert gar nichts.",
     "Dann dreht er das Rad ein Stück zu|rück.",
     "Auf ein|mal ist der Ast frei.",
     "Er fliegt in ho|hem Bo|gen ins Gras."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "⏰",
      "🎒"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "„Wir sind viel zu spät“, sagt Ro|mi|na.",
     "Le|on schaut zur Kir|chen|uhr.",
     "Es ist erst zehn vor acht.",
     "„Wir schaf|fen es noch“, sagt er."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🛴",
      "💨"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Jetzt fah|ren bei|de rich|tig schnell.",
     "Der Ne|bel fliegt an ih|ren Oh|ren vor|bei.",
     "An der Am|pel war|ten sie kurz.",
     "Dann geht es die letz|te Stra|ße hi|nun|ter.",
     "Schon steht die Schu|le vor ih|nen."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🔔",
      "🏫"
     ],
     "leute": [
      "Leon",
      "Romina"
     ]
    },
    "zeilen": [
     "Sie stel|len die Rol|ler an den Stän|der.",
     "Ge|nau da klin|gelt es zum Un|ter|richt.",
     "Ro|mi|na lacht und hält sich den Bauch.",
     "„Das war ganz knapp“, sagt sie."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "😊",
      "✏️"
     ],
     "leute": [
      "Leon",
      "Romina",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "In der Klas|se sind sie noch au|ßer A|tem.",
     "Herr Ce|lis schaut kurz über sei|ne Bril|le.",
     "„Ihr seid genau recht|zei|tig“, sagt er.",
     "Le|on setzt sich zu|frie|den hin.",
     "Den Ast hebt er nach|her aus dem Gras."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie ist das Wetter am Morgen?",
    "richtig": "neblig",
    "falsch": [
     "sonnig",
     "sehr heiß"
    ],
    "seite": 1
   },
   {
    "frage": "Was steckt in Rominas Rad?",
    "richtig": "ein dicker Ast",
    "falsch": [
     "ein Stein",
     "eine Schnur"
    ],
    "seite": 3
   },
   {
    "frage": "Wie bekommt Leon den Ast heraus?",
    "richtig": "Er dreht das Rad zurück.",
    "falsch": [
     "Er tritt dagegen.",
     "Er holt Herrn Celis."
    ],
    "seite": 4
   },
   {
    "frage": "Wie spät ist es an der Kirchenuhr?",
    "richtig": "zehn vor acht",
    "falsch": [
     "kurz nach acht",
     "halb neun"
    ],
    "seite": 5
   },
   {
    "frage": "Was passiert, als sie die Roller abstellen?",
    "richtig": "Es klingelt zum Unterricht.",
    "falsch": [
     "Es fängt an zu regnen.",
     "Die Pause beginnt."
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "h3-leon-liest-leo-etwas-vor",
  "titel": "Leon liest Leo etwas vor",
  "bild": "📖",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "📖",
      "☀️"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "In der Pau|se sitzt Le|o auf der Bank.",
     "Er hat ein di|ckes Buch auf dem Schoß.",
     "Sei|ne Stirn liegt in klei|nen Fal|ten.",
     "Le|on setzt sich ne|ben ihn.",
     "Das Buch hat vie|le klei|ne Bil|der."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "📖",
      "😕"
     ],
     "leute": [
      "Leo"
     ]
    },
    "zeilen": [
     "„Die Wör|ter sind so lang“, sagt Le|o.",
     "Er ist erst seit kur|zem in der Schu|le.",
     "In der ers|ten Klas|se übt man noch Buch|sta|ben.",
     "Le|o macht das Buch wie|der zu.",
     "Sei|ne Schul|tern hän|gen ein biss|chen."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "📖",
      "👉"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "„Soll ich dir vor|le|sen?“, fragt Le|on.",
     "Le|o nickt so|fort und öff|net das Buch.",
     "Le|on legt den Fin|ger un|ter die ers|te Zei|le.",
     "So sieht Le|o je|des Wort mit.",
     "Le|o rutscht ganz nah an ihn he|ran."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🦊",
      "🌲"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "In der Ge|schich|te geht es um ei|nen Fuchs.",
     "Der Fuchs sucht sei|nen Weg durch den Wald.",
     "Über|all ras|celt und knackt es.",
     "Le|on liest lang|sam und ganz deut|lich.",
     "Bei je|dem Punkt macht er ei|ne Pau|se."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🔤",
      "😊"
     ],
     "leute": [
      "Leo"
     ]
    },
    "zeilen": [
     "Bei ei|nem kur|zen Wort stoppt Le|on.",
     "„Das kannst du be|stimmt“, sagt er.",
     "Le|o schaut ge|nau hin und liest: „Baum“.",
     "Sei|ne Au|gen wer|den ganz groß.",
     "„Das war ich!“, ruft er."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "📖",
      "🔔"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "So le|sen die bei|den noch drei Sei|ten.",
     "Le|o darf im|mer die kur|zen Wör|ter sa|gen.",
     "Dann klin|gelt es viel zu früh.",
     "Le|o hält das Buch ganz fest.",
     "Er will noch gar nicht auf|hö|ren."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🤝",
      "📖"
     ],
     "leute": [
      "Leon",
      "Leo"
     ]
    },
    "zeilen": [
     "„Mor|gen wie|der?“, fragt Le|o lei|se.",
     "Le|on über|legt nicht lan|ge.",
     "„Klar, im|mer in der gro|ßen Pau|se.“",
     "Bei|de klat|schen kurz ab.",
     "Dann rennt Le|o zu sei|ner Klas|se."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "📖",
      "💡"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Im Un|ter|richt denkt Le|on noch da|ran.",
     "Vor|le|sen macht ihm mehr Spaß als ge|dacht.",
     "Er nimmt sich et|was vor.",
     "Mor|gen bringt er sein ei|ge|nes Buch mit.",
     "Das mit den Tor|wart-Bil|dern viel|leicht."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wo sitzt Leo in der Pause?",
    "richtig": "auf der Bank",
    "falsch": [
     "auf der Treppe",
     "im Sandkasten"
    ],
    "seite": 1
   },
   {
    "frage": "Warum fällt Leo das Lesen schwer?",
    "richtig": "Die Wörter sind so lang.",
    "falsch": [
     "Das Buch ist zu schwer.",
     "Er hat seine Brille vergessen."
    ],
    "seite": 2
   },
   {
    "frage": "Was macht Leon beim Vorlesen mit dem Finger?",
    "richtig": "Er legt ihn unter die Zeile.",
    "falsch": [
     "Er zeigt auf die Bilder.",
     "Er hält die Seite fest."
    ],
    "seite": 3
   },
   {
    "frage": "Welches Wort liest Leo selbst?",
    "richtig": "Baum",
    "falsch": [
     "Fuchs",
     "Wald"
    ],
    "seite": 5
   },
   {
    "frage": "Was nimmt Leon sich vor?",
    "richtig": "Er bringt sein eigenes Buch mit.",
    "falsch": [
     "Er leiht sich ein Buch aus.",
     "Er fragt Herrn Celis."
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "h4-netze-im-nebel",
  "titel": "Netze im Nebel",
  "bild": "🕸️",
  "seiten": [
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🌫️",
      "🌱"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Am Mor|gen liegt Ne|bel über dem Gar|ten.",
     "Al|les sieht ein biss|chen grau aus.",
     "Pa|pa und Le|on ge|hen nach drau|ßen.",
     "Das Gras ist kalt und nass.",
     "Le|ons Schu|he wer|den so|fort feucht."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🕸️",
      "💧"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Am Zaun ent|deckt Le|on et|was Rundes.",
     "Es glänzt wie ein klei|nes Rad.",
     "Über|all hän|gen win|zi|ge Trop|fen da|ran.",
     "Es ist ein Spin|nen|netz.",
     "So et|was hat Le|on noch nie ge|se|hen."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🕷️",
      "🕸️"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "„Schau mal ganz oben“, sagt Pa|pa lei|se.",
     "Dort sitzt die Spin|ne und war|tet.",
     "Sie be|wegt sich über|haupt nicht.",
     "Le|on geht ei|nen Schritt zu|rück.",
     "Die Spin|ne ist klei|ner als sein Dau|men."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🧵",
      "🕸️"
     ],
     "leute": [
      "Papa"
     ]
    },
    "zeilen": [
     "„Sie baut das Netz je|de Nacht neu“, sagt Pa|pa.",
     "Die Fä|den sind dün|ner als ein Haar.",
     "Trotz|dem hal|ten sie ei|ne gan|ze Flie|ge.",
     "Le|on staunt über die vie|len Krei|se.",
     "Er zählt neun Rin|ge von in|nen nach au|ßen."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🕸️",
      "🌫️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on sucht wei|ter im Gar|ten.",
     "Am Busch hängt ein zwei|tes Netz.",
     "Hin|ter der Bank fin|det er ein drit|tes.",
     "Er zählt am En|de sie|ben Stück.",
     "Je|des sieht ein biss|chen an|ders aus."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "📷",
      "💧"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Pa|pa holt sein Han|dy aus der Ja|cke.",
     "Er macht ein Fo|to von dem größ|ten Netz.",
     "Auf dem Bild sieht man je|den Trop|fen.",
     "„Das schi|cken wir Ma|ma“, sagt Le|on.",
     "Sie mag sol|che Bil|der sehr gern."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "☀️",
      "🕸️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Lang|sam kommt die Son|ne durch.",
     "Der Ne|bel wird dün|ner und dün|ner.",
     "Die Trop|fen ver|schwin|den ein|fach.",
     "Jetzt sieht man die Net|ze fast nicht mehr.",
     "Nur die Spin|ne sitzt im|mer noch da."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🍫",
      "📷"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "In der Kü|che gibt es war|men Ka|kao.",
     "Le|on hält die Tas|se mit bei|den Hän|den.",
     "Er schaut sich das Fo|to noch ein|mal an.",
     "Mor|gen früh will er wie|der nach|schau|en.",
     "Viel|leicht sind es dann noch mehr."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wie sieht der Garten am Morgen aus?",
    "richtig": "neblig und grau",
    "falsch": [
     "hell und sonnig",
     "weiß vom Schnee"
    ],
    "seite": 1
   },
   {
    "frage": "Was entdeckt Leon am Zaun?",
    "richtig": "ein Spinnennetz",
    "falsch": [
     "ein Vogelnest",
     "einen Ball"
    ],
    "seite": 2
   },
   {
    "frage": "Wie oft baut die Spinne ihr Netz?",
    "richtig": "jede Nacht neu",
    "falsch": [
     "einmal im Jahr",
     "nur im Sommer"
    ],
    "seite": 4
   },
   {
    "frage": "Wie viele Netze findet Leon?",
    "richtig": "sieben",
    "falsch": [
     "drei",
     "zehn"
    ],
    "seite": 5
   },
   {
    "frage": "Was passiert, als die Sonne kommt?",
    "richtig": "Die Tropfen verschwinden.",
    "falsch": [
     "Die Spinne läuft weg.",
     "Das Netz reißt."
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "h5-mias-kastanien-tiere",
  "titel": "Mias Kastanien-Tiere",
  "bild": "🌰",
  "seiten": [
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🌰",
      "🎒"
     ],
     "leute": [
      "Leon",
      "Mia"
     ]
    },
    "zeilen": [
     "Mi|a stellt ei|ne Do|se auf den Tisch.",
     "In|nen klap|pern brau|ne Kas|ta|ni|en.",
     "„Die ha|be ich ges|tern ge|sam|melt“, sagt sie.",
     "Die gan|ze Klas|se kommt nä|her.",
     "Je|der will ein|mal hi|nein|schau|en."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🌰",
      "🦔"
     ],
     "leute": [
      "Mia"
     ]
    },
    "zeilen": [
     "Mi|a holt ein klei|nes Tier he|raus.",
     "Es hat vier Bei|ne aus Streich|höl|zern.",
     "Auf dem Rü|cken ste|cken vie|le Zahn|sto|cher.",
     "„Das ist mein I|gel“, sagt sie stolz.",
     "Der I|gel steht fest auf dem Tisch."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🔨",
      "🌰"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Herr Ce|lis holt ei|nen klei|nen Boh|rer.",
     "Da|mit macht er win|zi|ge Lö|cher.",
     "Je|des Kind be|kommt zwei Kas|ta|ni|en.",
     "Le|on über|legt, was er bau|en will.",
     "Ein Tier soll es auf je|den Fall sein."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🌰",
      "🐛"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on steckt vier Streich|höl|zer in die Kas|ta|nie.",
     "Dann setzt er ei|ne zwei|te dar|auf.",
     "Sein Tier hat jetzt ei|nen Kopf.",
     "Nur die Bei|ne ste|hen ein biss|chen schief.",
     "Le|on dreht das Tier ein|mal he|rum."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "😅",
      "🌰"
     ],
     "leute": [
      "Leon",
      "Mia"
     ]
    },
    "zeilen": [
     "Das Tier kippt beim ers|ten Ver|such um.",
     "Mi|a schaut sich die Bei|ne ge|nau an.",
     "„Sie müs|sen gleich lang sein“, sagt sie.",
     "Le|on schiebt zwei Höl|zer wei|ter hi|nein.",
     "Jetzt sind al|le vier gleich lang."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🌰",
      "👀"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Jetzt steht das Tier ganz al|lein.",
     "Le|on malt zwei Punk|te als Au|gen auf.",
     "„Das ist ein Tor|wart-Kä|fer“, sagt er.",
     "Die Kin|der um ihn he|rum la|chen.",
     "Mi|a fin|det den Na|men rich|tig gut."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "🖼️",
      "🌰"
     ],
     "leute": [
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Al|le Tie|re kom|men auf das Fens|ter|brett.",
     "Dort ste|hen jetzt I|gel, Hun|de und Kä|fer.",
     "Herr Ce|lis zählt zwan|zig Stück.",
     "„Ein gan|zer Zoo“, sagt er.",
     "Die Son|ne scheint auf die brau|nen Rü|cken."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🌰",
      "🎒"
     ],
     "leute": [
      "Leon",
      "Mia"
     ]
    },
    "zeilen": [
     "Nach der Schu|le zeigt Mi|a ih|ren Weg.",
     "Un|ter den Bäu|men lie|gen noch vie|le Kas|ta|ni|en.",
     "Le|on steckt sich drei in die Ho|sen|ta|sche.",
     "Mor|gen baut er ein zwei|tes Tier.",
     "Dies|mal wird es ein Hund mit Schwanz."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was bringt Mia mit?",
    "richtig": "eine Dose mit Kastanien",
    "falsch": [
     "eine Tüte mit Nüssen",
     "einen Korb mit Äpfeln"
    ],
    "seite": 1
   },
   {
    "frage": "Was hat Mias Igel auf dem Rücken?",
    "richtig": "Zahnstocher",
    "falsch": [
     "Blätter",
     "Federn"
    ],
    "seite": 2
   },
   {
    "frage": "Warum kippt Leons Tier um?",
    "richtig": "Die Beine sind nicht gleich lang.",
    "falsch": [
     "Der Kopf ist zu schwer.",
     "Der Tisch wackelt."
    ],
    "seite": 5
   },
   {
    "frage": "Wie nennt Leon sein Tier?",
    "richtig": "Torwart-Käfer",
    "falsch": [
     "Kastanien-Igel",
     "Streichholz-Hund"
    ],
    "seite": 6
   },
   {
    "frage": "Wie viele Tiere stehen am Fenster?",
    "richtig": "zwanzig",
    "falsch": [
     "zehn",
     "fünfzig"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "h6-der-ball-hinter-dem-zaun",
  "titel": "Der Ball hinter dem Zaun",
  "bild": "⚽",
  "seiten": [
   {
    "szene": {
     "ort": "garten",
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
     "Le|on und The|o spie|len im Gar|ten.",
     "Zwei Ja|cken lie|gen als Tor im Gras.",
     "The|o schießt und Le|on hech|tet hin|ter|her.",
     "Der Ball fliegt über sei|ne Hand.",
     "„Knapp da|ne|ben“, ruft The|o."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🌳",
      "❗"
     ],
     "leute": [
      "Leon",
      "Theo"
     ]
    },
    "zeilen": [
     "Der Ball rollt bis zur He|cke.",
     "Dann ver|schwin|det er ein|fach da|hin|ter.",
     "Bei|de lau|fen so|fort hi|nter|her.",
     "Die He|cke ist dicht und sehr hoch.",
     "Durch|schau|en kann man kaum."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "👀",
      "🌳"
     ],
     "leute": [
      "Theo"
     ]
    },
    "zeilen": [
     "The|o schaut durch ei|ne klei|ne Lü|cke.",
     "„Da liegt er“, sagt er lei|se.",
     "Der Ball liegt im Nach|bar|gar|ten.",
     "Dort wohnt Xa|ver mit sei|nen El|tern.",
     "Der Ball liegt mit|ten im Beet."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "😟",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on wird ein biss|chen still.",
     "Ein|fach hin|über|klet|tern geht ja nicht.",
     "Frem|de Gär|ten sind frem|de Gär|ten.",
     "Er über|legt kurz, was rich|tig ist.",
     "The|o war|tet und sagt nichts."
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
      "Theo"
     ]
    },
    "zeilen": [
     "Die bei|den ge|hen um das Haus he|rum.",
     "Le|on drückt auf die Klin|gel.",
     "Sein Herz klopft ein biss|chen schnel|ler.",
     "Dann geht die Tür auf.",
     "Drin|nen riecht es nach Ku|chen."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "😊",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Xaver"
     ]
    },
    "zeilen": [
     "Xa|ver steht in der Tür und grinst.",
     "„Ich hab ihn schon ge|hört“, sagt er.",
     "Er hat den Ball be|reits in der Hand.",
     "„Beim nächs|ten Mal ein|fach klin|geln.“",
     "Le|on wird ein biss|chen rot."
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
      "Theo",
      "Xaver"
     ]
    },
    "zeilen": [
     "Xa|ver kommt gleich mit in den Gar|ten.",
     "Er geht in der fünf|ten Klas|se.",
     "Trotz|dem spielt er ger|ne mit.",
     "Jetzt steht The|o im Tor.",
     "Le|on und Xa|ver schie|ßen ab|wech|selnd."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "🌆",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Sie spie|len, bis es dun|kel wird.",
     "Kein Ball fliegt noch ein|mal über die He|cke.",
     "Le|on merkt sich et|was Wich|ti|ges.",
     "Fra|gen ist leich|ter als klet|tern.",
     "Und es dau|ert auch nicht län|ger."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was benutzen Leon und Theo als Tor?",
    "richtig": "zwei Jacken",
    "falsch": [
     "zwei Eimer",
     "zwei Stühle"
    ],
    "seite": 1
   },
   {
    "frage": "Wohin fliegt der Ball?",
    "richtig": "in den Nachbargarten",
    "falsch": [
     "auf die Straße",
     "auf das Dach"
    ],
    "seite": 3
   },
   {
    "frage": "Warum klettert Leon nicht hinüber?",
    "richtig": "Es ist ein fremder Garten.",
    "falsch": [
     "Die Hecke ist zu hoch.",
     "Er hat keine Zeit."
    ],
    "seite": 4
   },
   {
    "frage": "Was macht Leon stattdessen?",
    "richtig": "Er klingelt an der Tür.",
    "falsch": [
     "Er ruft laut.",
     "Er holt Papa."
    ],
    "seite": 5
   },
   {
    "frage": "Wer steht am Ende im Tor?",
    "richtig": "Theo",
    "falsch": [
     "Leon",
     "Xaver"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "h7-der-trick-von-trainer-jens",
  "titel": "Der Trick von Trainer Jens",
  "bild": "🧤",
  "seiten": [
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
     "Mitt|woch ist Trai|ning beim ASC Box|dorf.",
     "Um fünf Uhr geht es los.",
     "Le|on zieht sei|ne Hand|schu|he an.",
     "Der Platz riecht nach nas|sem Gras.",
     "Die Flut|lich|ter sind schon an."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "😔"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zu|erst üben al|le Schüs|se aufs Tor.",
     "Drei Bäl|le hält Le|on ganz si|cher.",
     "Beim vier|ten rutscht ihm der Ball weg.",
     "Er fällt aus den Hän|den ins Tor.",
     "Le|on schüt|telt kurz den Kopf."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "🧤",
      "👐"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Trai|ner Jens pfeift ein|mal kurz.",
     "„Zeig mir mal dei|ne Hän|de“, sagt er.",
     "Le|on hält bei|de Hän|de nach vorn.",
     "Die Dau|men zei|gen nach au|ßen.",
     "Zwi|schen den Hän|den ist ei|ne Lü|cke."
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
     "„Stell die Dau|men zu|sam|men“, sagt der Trai|ner.",
     "Dann ent|steht ein klei|nes Drei|eck.",
     "„Da|rin fängt sich je|der Ball.“",
     "Le|on pro|biert es gleich in der Luft.",
     "Es fühlt sich erst ganz un|ge|wohnt an."
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
     "Der nächs|te Schuss kommt hoch.",
     "Le|on macht das Drei|eck mit den Hän|den.",
     "Der Ball klatscht fest hi|nein.",
     "Er rutscht kein biss|chen mehr weg.",
     "Le|on presst ihn an den Bauch."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "⚽",
      "🔟"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Jetzt schießt ein Kind nach dem an|de|ren.",
     "Le|on hält acht Bäl|le hin|ter|ein|an|der.",
     "Beim neun|ten muss er weit sprin|gen.",
     "Auch den fängt er fest.",
     "Sei|ne Ho|se ist jetzt voll Schlamm."
    ]
   },
   {
    "szene": {
     "ort": "platz",
     "dinge": [
      "👏",
      "😊"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Die Mann|schaft klatscht laut in die Hän|de.",
     "Trai|ner Jens hebt den Dau|men.",
     "„Sie|ben Wo|chen ge|übt, heu|te sitzt es.“",
     "Le|on grinst un|ter sei|nen nas|sen Haa|ren.",
     "Das Lob macht ihn ganz warm."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🧤",
      "🛏️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Zu Hau|se legt Le|on die Hand|schu|he weg.",
     "Vor dem Spie|gel macht er noch ein|mal das Drei|eck.",
     "Sei|ne Dau|men be|rüh|ren sich ge|nau.",
     "Frei|tag will er es wie|der zei|gen.",
     "Bis da|hin übt er je|den Tag."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "An welchem Tag ist das Training?",
    "richtig": "Mittwoch",
    "falsch": [
     "Samstag",
     "Montag"
    ],
    "seite": 1
   },
   {
    "frage": "Was passiert beim vierten Ball?",
    "richtig": "Er rutscht Leon weg.",
    "falsch": [
     "Leon hält ihn fest.",
     "Er fliegt über das Tor."
    ],
    "seite": 2
   },
   {
    "frage": "Was soll Leon mit den Daumen machen?",
    "richtig": "Die Daumen zusammenstellen.",
    "falsch": [
     "Die Daumen nach außen drehen.",
     "Die Handschuhe ausziehen."
    ],
    "seite": 4
   },
   {
    "frage": "Wie viele Bälle hält Leon hintereinander?",
    "richtig": "acht",
    "falsch": [
     "drei",
     "zwölf"
    ],
    "seite": 6
   },
   {
    "frage": "Was macht Leon zu Hause vor dem Spiegel?",
    "richtig": "das Dreieck mit den Händen",
    "falsch": [
     "Er wirft einen Ball.",
     "Er zieht die Handschuhe an."
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "h8-helena-uebt-fuer-den-test",
  "titel": "Helena übt für den Test",
  "bild": "📚",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📚",
      "✏️"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "He|le|na sitzt am Schreib|tisch und lernt.",
     "Vor ihr lie|gen Blät|ter und ein Buch.",
     "Sie geht in die sieb|te Klas|se.",
     "Mor|gen schreibt sie ei|nen Test.",
     "Der Stift kratzt lei|se über das Pa|pier."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⚽",
      "🚪"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on kommt mit sei|nem Ball he|rein.",
     "Er will un|be|dingt ei|nen Trick zei|gen.",
     "He|le|na schaut kurz hoch.",
     "„Bit|te spä|ter“, sagt sie lei|se.",
     "Ih|re Au|gen blei|ben auf dem Blatt."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "😕",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on geht wie|der hi|naus.",
     "Erst ist er ein biss|chen ent|täuscht.",
     "Dann fällt ihm et|was ein.",
     "Er kann ja hel|fen statt stö|ren.",
     "Le|on geht lei|se die Trep|pe hi|nun|ter."
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
      "Leon"
     ]
    },
    "zeilen": [
     "In der Kü|che schnei|det Le|on ei|nen Ap|fel.",
     "Er legt die Stü|cke auf ei|nen Tel|ler.",
     "Da|zu stellt er ein Glas Was|ser.",
     "Al|les trägt er vor|sich|tig nach o|ben.",
     "Kein Trop|fen schwappt über den Rand."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🍎",
      "😊"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "Lei|se stellt er den Tel|ler auf den Tisch.",
     "He|le|na schaut über|rascht auf.",
     "„Das ist lieb von dir“, sagt sie.",
     "Le|on zieht die Tür hin|ter sich zu.",
     "Ganz lang|sam, da|mit es nicht knallt."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🎧",
      "⚽"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Un|ten spielt Le|on ganz oh|ne Ball.",
     "Er macht sei|ne Fang-Ü|bung in der Luft.",
     "Da|bei zählt er im Kopf bis zwan|zig.",
     "Es bleibt fast ganz still im Haus.",
     "Nur die Uhr in der Kü|che tickt."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📚",
      "👏"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "Nach ei|ner Stun|de kommt He|le|na he|run|ter.",
     "„Ich bin durch“, sagt sie zu|frie|den.",
     "„Und jetzt zeig mir dei|nen Trick.“",
     "Le|on springt so|fort auf.",
     "Sein Ball liegt schon an der Tür."
    ]
   },
   {
    "szene": {
     "ort": "garten",
     "dinge": [
      "⚽",
      "🌆"
     ],
     "leute": [
      "Leon",
      "Helena"
     ]
    },
    "zeilen": [
     "Im Gar|ten schießt He|le|na ihm Bäl|le zu.",
     "Le|on fängt sie mit dem Dau|men-Drei|eck.",
     "He|le|na staunt über je|den Ball.",
     "Bei|de blei|ben, bis es dun|kel wird.",
     "Der Tel|ler steht noch o|ben im Zim|mer."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Warum lernt Helena?",
    "richtig": "Sie schreibt morgen einen Test.",
    "falsch": [
     "Sie hat Hausaufgaben vergessen.",
     "Sie liest ein Buch zu Ende."
    ],
    "seite": 1
   },
   {
    "frage": "Was will Leon Helena zeigen?",
    "richtig": "einen Trick",
    "falsch": [
     "sein Zeugnis",
     "ein Bild"
    ],
    "seite": 2
   },
   {
    "frage": "Was bringt Leon in ihr Zimmer?",
    "richtig": "Apfelstücke und Wasser",
    "falsch": [
     "Kakao und Kekse",
     "sein Buch"
    ],
    "seite": 4
   },
   {
    "frage": "Was macht Leon, während Helena lernt?",
    "richtig": "Er übt ohne Ball.",
    "falsch": [
     "Er schaut fern.",
     "Er geht zum Training."
    ],
    "seite": 6
   },
   {
    "frage": "Was passiert nach einer Stunde?",
    "richtig": "Helena kommt herunter.",
    "falsch": [
     "Papa ruft zum Essen.",
     "Leon geht ins Bett."
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "h9-jokos-brotdose",
  "titel": "Jokos Brotdose",
  "bild": "🥪",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🎒",
      "🥪"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "In der Pau|se packt Jo|ko sei|ne Ta|sche aus.",
     "Er sucht und sucht in je|der E|cke.",
     "Sei|ne Brot|do|se ist nicht da.",
     "Jo|ko setzt sich auf die Trep|pe.",
     "Sei|ne Ta|sche liegt of|fen ne|ben ihm."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "😔",
      "🎒"
     ],
     "leute": [
      "Joko"
     ]
    },
    "zeilen": [
     "„Ich ha|be sie zu Hau|se ver|ges|sen“, sagt er.",
     "Sein Bauch knurrt ganz laut.",
     "Bis Mit|tag ist es noch lan|ge hin.",
     "Jo|ko schaut auf sei|ne Schu|he.",
     "Die an|de|ren Kin|der es|sen schon."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🥪",
      "✂️"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on holt sein Brot aus der Do|se.",
     "Es ist ein gro|ßes Kä|se|brot.",
     "Er bricht es ge|nau in der Mit|te durch.",
     "Bei|de Hälf|ten sind fast gleich groß.",
     "Ein paar Krü|mel fal|len ins Gras."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🤝",
      "🥪"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "„Hier, nimm die|se Hälf|te“, sagt Le|on.",
     "Jo|ko schaut ihn kurz an.",
     "„Sicher?“, fragt er lei|se.",
     "Le|on nickt und hält es ihm hin.",
     "Jo|ko nimmt es mit bei|den Hän|den."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🍎",
      "🥕"
     ],
     "leute": [
      "Leon",
      "Joko",
      "Mia"
     ]
    },
    "zeilen": [
     "Mi|a hat al|les mit|be|kom|men.",
     "Sie legt ei|nen Ap|fel da|zu.",
     "Ro|mi|na bringt zwei Ka|rot|ten mit.",
     "Auf ein|mal ist es ein rich|ti|ges Pick|nick.",
     "Al|les liegt auf ei|ner Ser|vi|et|te."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "😊",
      "☀️"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "Al|le sit|zen auf der war|men Trep|pe.",
     "Jo|ko kaut und lacht wie|der.",
     "„Mor|gen brin|ge ich et|was mit“, sagt er.",
     "„Ver|spro|chen.“",
     "Le|on klopft ihm auf die Schul|ter."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "📦",
      "💡"
     ],
     "leute": [
      "Leon",
      "Herr Celis"
     ]
    },
    "zeilen": [
     "Herr Ce|lis hat da|von ge|hört.",
     "Er stellt ei|ne Kis|te ne|ben die Tür.",
     "Wer will, legt et|was hi|nein.",
     "„Für Ta|ge oh|ne Brot“, sagt er.",
     "Nie|mand muss et|was da|zu sa|gen."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🥪",
      "📦"
     ],
     "leute": [
      "Leon",
      "Joko"
     ]
    },
    "zeilen": [
     "Am nächs|ten Tag steht Jo|ko früh da.",
     "Er legt zwei Rie|gel in die Kis|te.",
     "Le|on legt ei|nen Ap|fel da|zu.",
     "Die Kis|te wird je|den Tag vol|ler.",
     "Und manch|mal wird sie auch leer."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was fehlt Joko in der Pause?",
    "richtig": "seine Brotdose",
    "falsch": [
     "sein Turnbeutel",
     "sein Heft"
    ],
    "seite": 1
   },
   {
    "frage": "Was macht Leon mit seinem Brot?",
    "richtig": "Er bricht es in der Mitte durch.",
    "falsch": [
     "Er gibt es ganz her.",
     "Er isst es schnell auf."
    ],
    "seite": 3
   },
   {
    "frage": "Was bringt Mia dazu?",
    "richtig": "einen Apfel",
    "falsch": [
     "eine Karotte",
     "einen Riegel"
    ],
    "seite": 5
   },
   {
    "frage": "Was stellt Herr Celis neben die Tür?",
    "richtig": "eine Kiste",
    "falsch": [
     "einen Korb mit Büchern",
     "einen Stuhl"
    ],
    "seite": 7
   },
   {
    "frage": "Was legt Joko am nächsten Tag hinein?",
    "richtig": "zwei Riegel",
    "falsch": [
     "ein Brot",
     "eine Banane"
    ],
    "seite": 8
   }
  ]
 },
 {
  "id": "h10-die-grosse-pfuetze",
  "titel": "Die große Pfütze",
  "bild": "🌧️",
  "seiten": [
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🌧️",
      "☂️"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Es reg|net schon den gan|zen Vor|mit|tag.",
     "Le|on und Pa|pa ge|hen zum Bä|cker.",
     "Pa|pa hält den gro|ßen Schirm.",
     "Die Trop|fen trom|meln lei|se da|rauf.",
     "Die Stra|ße glänzt wie ein Spie|gel."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "💧",
      "👞"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Vor dem Zaun liegt ei|ne rie|si|ge Pfüt|ze.",
     "Sie geht fast über den gan|zen Weg.",
     "Le|on bleibt da|vor ste|hen.",
     "Sei|ne Gum|mi|stie|fel sind ganz neu.",
     "Sie sind grün und noch ganz sau|ber."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "😃",
      "💧"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "„Darf ich?“, fragt Le|on vor|sich|tig.",
     "Pa|pa schaut auf die Stie|fel.",
     "Dann lacht er und nickt.",
     "„Da|für sind sie ja da.“",
     "Le|on nimmt vor|her noch An|lauf."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "💦",
      "😄"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on springt mit bei|den Bei|nen hi|nein.",
     "Das Was|ser spritzt bis zum Zaun.",
     "Ein paar Trop|fen tref|fen Pa|pas Ho|se.",
     "Bei|de la|chen ganz laut.",
     "Ein Hund auf der an|de|ren Sei|te bellt."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🦆",
      "💧"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "In der Pfüt|ze schwim|men bun|te Blät|ter.",
     "Le|on schiebt ei|nes mit dem Stie|fel an.",
     "Es dreht sich lang|sam im Kreis.",
     "„Das ist mein Boot“, sagt er.",
     "Das Blatt treibt bis zum Rand."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "🥖",
      "☂️"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Beim Bä|cker kau|fen sie zwei Bröt|chen.",
     "Die Ver|käu|fe|rin schaut auf Le|ons Stie|fel.",
     "„Du warst wohl in der Pfüt|ze“, sagt sie.",
     "Le|on nickt stolz.",
     "Sie legt zwei war|me Bröt|chen in die Tü|te."
    ]
   },
   {
    "szene": {
     "ort": "strasse",
     "dinge": [
      "💧",
      "🥖"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Auf dem Rück|weg kommt die Pfüt|ze wie|der.",
     "Die|ses Mal springt Pa|pa zu|erst.",
     "Le|on kreischt und springt hin|ter|her.",
     "Der Schirm hilft jetzt gar nichts mehr.",
     "Bei|de sind bis zu den Kni|en nass."
    ]
   },
   {
    "szene": {
     "ort": "kueche",
     "dinge": [
      "🧦",
      "🥖"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Zu Hau|se ste|hen die Stie|fel an der Hei|zung.",
     "Le|on zieht tro|cke|ne So|cken an.",
     "Auf dem Tisch lie|gen die war|men Bröt|chen.",
     "Reg|net es mor|gen wie|der?",
     "Le|on hofft ein biss|chen da|rauf."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wohin gehen Leon und Papa?",
    "richtig": "zum Bäcker",
    "falsch": [
     "zum Training",
     "in die Schule"
    ],
    "seite": 1
   },
   {
    "frage": "Was liegt vor dem Zaun?",
    "richtig": "eine riesige Pfütze",
    "falsch": [
     "ein Ast",
     "ein Haufen Blätter"
    ],
    "seite": 2
   },
   {
    "frage": "Was sagt Papa zu dem Sprung?",
    "richtig": "Er nickt und lacht.",
    "falsch": [
     "Er sagt Nein.",
     "Er geht weiter."
    ],
    "seite": 3
   },
   {
    "frage": "Was nennt Leon sein Boot?",
    "richtig": "ein Blatt",
    "falsch": [
     "einen Stock",
     "einen Stein"
    ],
    "seite": 5
   },
   {
    "frage": "Wer springt auf dem Rückweg zuerst?",
    "richtig": "Papa",
    "falsch": [
     "Leon",
     "die Verkäuferin"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "h11-luka-will-ins-tor",
  "titel": "Luka will ins Tor",
  "bild": "🥅",
  "seiten": [
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Luka"
     ]
    },
    "zeilen": [
     "In der Pau|se spie|len al|le Fuß|ball.",
     "Zwei Ran|zen sind das Tor.",
     "Lu|ka stellt sich zwi|schen die Ran|zen.",
     "„Heu|te bin ich Tor|wart“, sagt er.",
     "Le|on spielt aus|nahms|wei|se im Feld."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "😕"
     ],
     "leute": [
      "Luka"
     ]
    },
    "zeilen": [
     "Der ers|te Ball rollt an ihm vor|bei.",
     "Beim zwei|ten dreht er sich zu spät.",
     "Lu|ka wird ganz rot im Ge|sicht.",
     "„Ich kann das nicht“, sagt er.",
     "Er will schon aus dem Tor ge|hen."
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
      "Luka"
     ]
    },
    "zeilen": [
     "Le|on geht zu ihm ins Tor.",
     "„Am An|fang ging das bei mir auch so.“",
     "Lu|ka schaut ihn zwei|felnd an.",
     "„Wirk|lich?“, fragt er.",
     "Le|on nickt und stellt sich ne|ben ihn."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "👣",
      "🥅"
     ],
     "leute": [
      "Leon",
      "Luka"
     ]
    },
    "zeilen": [
     "„Steh nicht auf der Li|nie“, sagt Le|on.",
     "Er stellt Lu|ka ei|nen Schritt nach vorn.",
     "„Und die Kni|e im|mer ein biss|chen beu|gen.“",
     "Lu|ka pro|biert es so|fort aus.",
     "Sei|ne Bei|ne wa|ckeln noch ein biss|chen."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "⚽",
      "💪"
     ],
     "leute": [
      "Luka"
     ]
    },
    "zeilen": [
     "Der nächs|te Schuss kommt flach.",
     "Lu|ka geht in die Kni|e und hält ihn.",
     "Der Ball bleibt in sei|nen Ar|men lie|gen.",
     "Er strahlt über das gan|ze Ge|sicht.",
     "„Hast du das ge|se|hen?“, ruft er."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "👐",
      "⚽"
     ],
     "leute": [
      "Leon",
      "Luka"
     ]
    },
    "zeilen": [
     "Le|on zeigt ihm noch das Dau|men-Drei|eck.",
     "Lu|ka stellt die Dau|men zu|sam|men.",
     "Der hoh|e Ball klatscht fest hi|nein.",
     "„Das fühlt sich gut an“, sagt er.",
     "Sei|ne Hän|de brum|men ein we|nig."
    ]
   },
   {
    "szene": {
     "ort": "pausenhof",
     "dinge": [
      "🔔",
      "😊"
     ],
     "leute": [
      "Leon",
      "Luka"
     ]
    },
    "zeilen": [
     "Dann klin|gelt es zum Un|ter|richt.",
     "Lu|ka hat fünf Bäl|le ge|hal|ten.",
     "Er zählt sie noch ein|mal auf.",
     "Le|on freut sich fast mehr als er.",
     "Bei|de tra|gen die Ran|zen zu|rück."
    ]
   },
   {
    "szene": {
     "ort": "klasse",
     "dinge": [
      "⚽",
      "💬"
     ],
     "leute": [
      "Leon",
      "Luka"
     ]
    },
    "zeilen": [
     "Auf dem Weg in die Klas|se fragt Lu|ka et|was.",
     "„Kommst du mor|gen wie|der ins Tor?“",
     "„Nur wenn du auch rein|gehst“, sagt Le|on.",
     "Lu|ka schlägt so|fort ein.",
     "Mor|gen wech|seln sie sich wie|der ab."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Was ist in der Pause das Tor?",
    "richtig": "zwei Ranzen",
    "falsch": [
     "zwei Jacken",
     "zwei Bänke"
    ],
    "seite": 1
   },
   {
    "frage": "Wie geht es Luka nach den ersten Bällen?",
    "richtig": "Er glaubt, er kann es nicht.",
    "falsch": [
     "Er ist stolz.",
     "Er geht nach Hause."
    ],
    "seite": 2
   },
   {
    "frage": "Wo soll Luka stehen?",
    "richtig": "einen Schritt vor der Linie",
    "falsch": [
     "genau auf der Linie",
     "neben dem Tor"
    ],
    "seite": 4
   },
   {
    "frage": "Was zeigt Leon ihm danach?",
    "richtig": "das Daumen-Dreieck",
    "falsch": [
     "einen weiten Abschlag",
     "wie man schießt"
    ],
    "seite": 6
   },
   {
    "frage": "Wie viele Bälle hält Luka?",
    "richtig": "fünf",
    "falsch": [
     "zwei",
     "acht"
    ],
    "seite": 7
   }
  ]
 },
 {
  "id": "h12-taschenlampe-unter-der-decke",
  "titel": "Die Taschenlampe unter der Decke",
  "bild": "🔦",
  "seiten": [
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🛏️",
      "🌙"
     ],
     "leute": [
      "Leon",
      "Paul"
     ]
    },
    "zeilen": [
     "Es ist schon spät und al|le lie|gen im Bett.",
     "Le|on ist noch gar nicht mü|de.",
     "Im Zim|mer ne|ben|an hus|tet Paul.",
     "Drau|ßen ist es ganz still.",
     "Nur ein Au|to fährt lang|sam vor|bei."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🔦",
      "📖"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on holt sei|ne Ta|schen|lam|pe he|raus.",
     "Sie liegt im|mer un|ter dem Kopf|kis|sen.",
     "Da|zu nimmt er sein Fuß|ball-Buch.",
     "Dann zieht er die De|cke über den Kopf.",
     "Sein Kis|sen stopft er da|vor."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🔦",
      "📖"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Un|ter der De|cke ist es warm und hell.",
     "Das Licht macht ei|nen klei|nen Kreis.",
     "Le|on liest über ei|nen be|rühm|ten Tor|wart.",
     "Der hat frü|her auch in der F-Ju|gend an|ge|fan|gen.",
     "Le|on liest den Satz zwei|mal."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🚪",
      "👀"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "Plötz|lich geht die Tür lei|se auf.",
     "Le|on macht die Lam|pe schnell aus.",
     "Er hält die Luft an.",
     "Pa|pa bleibt in der Tür ste|hen.",
     "Man hört nur die Uhr im Flur."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "😊",
      "🔦"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "„Ich se|he das Licht“, sagt Pa|pa ru|hig.",
     "Le|on schiebt die De|cke wie|der weg.",
     "Er rech|net mit Är|ger.",
     "Doch Pa|pa setzt sich aufs Bett.",
     "Das Bett knarrt ein biss|chen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "📖",
      "💬"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "„Was liest du denn da?“, fragt er.",
     "Le|on zeigt ihm die Sei|te mit dem Tor|wart.",
     "Pa|pa liest die Über|schrift laut vor.",
     "„Den kann|te ich frü|her auch.“",
     "Pa|pa er|zählt kurz von ei|nem Spiel."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "⏰",
      "📖"
     ],
     "leute": [
      "Leon",
      "Papa"
     ]
    },
    "zeilen": [
     "„Noch zehn Mi|nu|ten“, sagt Pa|pa.",
     "„Aber bei Licht, nicht un|ter der De|cke.“",
     "Er macht die klei|ne Lam|pe an.",
     "Dann geht er wie|der hi|naus.",
     "Die Tür lässt er ein Stück of|fen."
    ]
   },
   {
    "szene": {
     "ort": "zimmer",
     "dinge": [
      "🌙",
      "📖"
     ],
     "leute": [
      "Leon"
     ]
    },
    "zeilen": [
     "Le|on liest die Sei|te zu En|de.",
     "Dann legt er das Buch auf den Bo|den.",
     "Die Ta|schen|lam|pe bleibt heu|te aus.",
     "Im Traum hält er je|den Ball.",
     "So|gar den letz|ten aus der E|cke."
    ]
   }
  ],
  "fragen": [
   {
    "frage": "Wo liegt Leons Taschenlampe immer?",
    "richtig": "unter dem Kopfkissen",
    "falsch": [
     "im Schrank",
     "auf dem Tisch"
    ],
    "seite": 2
   },
   {
    "frage": "Worüber liest Leon?",
    "richtig": "über einen berühmten Torwart",
    "falsch": [
     "über einen Fuchs",
     "über ein Spiel von morgen"
    ],
    "seite": 3
   },
   {
    "frage": "Was macht Leon, als die Tür aufgeht?",
    "richtig": "Er macht die Lampe aus.",
    "falsch": [
     "Er ruft nach Papa.",
     "Er versteckt das Buch."
    ],
    "seite": 4
   },
   {
    "frage": "Was macht Papa, statt zu schimpfen?",
    "richtig": "Er setzt sich aufs Bett.",
    "falsch": [
     "Er nimmt das Buch weg.",
     "Er macht das Licht aus."
    ],
    "seite": 5
   },
   {
    "frage": "Wie lange darf Leon noch lesen?",
    "richtig": "zehn Minuten",
    "falsch": [
     "eine Stunde",
     "bis das Buch aus ist"
    ],
    "seite": 7
   }
  ]
 }
];
