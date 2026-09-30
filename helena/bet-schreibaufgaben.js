/*
  Aufgaben fuer Teil III des Jahrgangsstufentests Englisch 7 (BET).
  Zusammengetragen am 30.09.2026, einen Tag vor Helenas Test.

  QUELLE: die vier Aufgabenhefte des ISB Bayern, im Volltext gelesen am
  30.09.2026 (JT_2025_E7_Aufgaben.pdf, JT_2024_E7_Aufgaben.pdf,
  JT_2023_E7_Aufgaben.pdf, 2022_7_e_aufgaben.pdf). Die Situationen und
  Auftraege stehen WOERTLICH so in den Heften - nichts davon ist ausgedacht.

  WAS DIE AUSZAEHLUNG ERGEBEN HAT (alle vier Jahre, nicht geschaetzt):
  - Es ist jedes Mal eine E-Mail an einen englischen Freund oder eine
    Austauschpartnerin, immer "ca. 140 Woerter".
  - Es sind jedes Mal mehrere Auftraege: 2022 drei, 2023 drei, 2024 zwei
    (der erste enthaelt zwei Auftraege), 2025 drei.
  - In ALLEN VIER Jahren war einer davon eine Erzaehlung in der
    VERGANGENHEIT ("deine letzte Fahrradtour", "dein letzter Sommerurlaub",
    "deiner letzten Bergtour", "im letzten Jahr").
  - Bewertung immer: (Inhalt max. 4 BE + Sprache max. 6 BE) x 2 = 20 BE.

  WARUM AUCH ZWEI EIGENE AUFGABEN DABEISTEHEN: Bei 2022, 2023 und 2024
  gehoert ein BILD zur Aufgabe (Karte, Ticket mit Ideenliste,
  Wettervorhersage). Das steht im PDF und laesst sich hier nicht zeigen.
  Die beiden eigenen Aufgaben sind nach demselben Muster gebaut, brauchen
  aber kein Bild - damit auf dem Handy wirklich geschrieben werden kann.
  Sie sind ausdruecklich als "selbst gebaut" gekennzeichnet.

  WAS HIER NICHT STEHT: kein Mustertext, keine fertigen Saetze zum
  Abschreiben. Die Loesungshefte enthalten fuer Teil III auch keinen -
  nur das Bewertungsraster. Wer den Text vorgesagt bekommt, uebt nichts.
*/
window.BET_SCHREIBEN = {
  ziel: 140,

  /* Die Endkontrolle. Die ersten fuenf Punkte sind KEINE allgemeine
     Fehlerliste, sondern genau die Stellen, an denen Helena im Faden
     hup7ep8mdp am 30.09.2026 selbst haengengeblieben ist. */
  kontrolle: [
    { t: "Nach <b>didn't</b> steht die Grundform", d: "I didn't see – nicht didn't saw" },
    { t: "Nationalitäten und Sprachen groß", d: "an Australian boy, in English" },
    { t: "<b>people</b> statt persons", d: "many people were there" },
    { t: "<b>a lot of</b> oder <b>lots of</b>", d: "nicht a lots of" },
    { t: "<b>than</b> beim Vergleichen", d: "better than – nicht better as" },
    { t: "Jeder Auftrag hat einen eigenen Absatz", d: "oben abhaken, keinen vergessen" },
    { t: "Anrede und Gruß sind da", d: "Hi … / See you soon, … – es ist eine E-Mail" }
  ],

  aufgaben: [
    {
      id: "e-schulfest",
      jahr: "selbst gebaut",
      eigen: true,
      kurz: "Schulfest",
      situation: "Dein englischer Brieffreund Ben wohnt für zwei Wochen bei euch. " +
        "Am Samstag ist an deiner Schule ein Sommerfest. Schreibe Ben eine E-Mail " +
        "(ca. 140 Wörter) auf Englisch und …",
      auftraege: [
        "erzähle ihm, was es auf dem Fest gibt (zwei Sachen),",
        "schreibe, worauf du dich am meisten freust und warum, und",
        "erzähle ihm von dem Schulfest im letzten Jahr, bei dem es geregnet hat."
      ],
      material: null
    },
    {
      id: "e-geburtstag",
      jahr: "selbst gebaut",
      eigen: true,
      kurz: "Geburtstag",
      situation: "Deine englische Austauschpartnerin Ruby hat dich zu ihrem Geburtstag " +
        "nach London eingeladen. Du kannst leider nicht kommen. Schreibe Ruby eine " +
        "E-Mail (ca. 140 Wörter) auf Englisch und …",
      auftraege: [
        "erkläre ihr, warum du nicht kommen kannst,",
        "schlage vor, wann ihr euch stattdessen sehen könntet, und begründe deinen Vorschlag, und",
        "erzähle ihr von deinem eigenen letzten Geburtstag."
      ],
      material: null
    },
    {
      id: "jt2025",
      jahr: "Test 2025",
      kurz: "Keltenfestival",
      situation: "Im Oktober wird Jack aus England in deiner Klasse zu Besuch sein. " +
        "Alle zusammen wollt ihr einen Ausflug zum Keltenfestival machen. Informiere " +
        "Jack in einer E-Mail (ca. 140 Wörter) auf Englisch über den bevorstehenden " +
        "Ausflug und …",
      auftraege: [
        "stelle mit Hilfe des Flyers die beiden Workshops auf dem Festival kurz vor;",
        "schreibe, warum du einen der beiden Workshops besonders gut findest;",
        "erzähle ihm von einem aufregenden Ereignis bei deinem Besuch des Keltenfestivals im letzten Jahr."
      ],
      material: {
        titel: "Keltenfestival · Freitag, 17. Oktober 2025",
        zeilen: [
          "<b>Kochen wie die Kelten</b> – Echte keltische Gerichte wie Keltenbrot oder " +
          "Keltenwürstchen mit einfachen Zutaten aus der Natur! Zubereitet und probiert am offenen Feuer!",
          "<b>Keltische Kostüme</b> – Gestalte magische und farbenfrohe Kleider aus der " +
          "Vergangenheit und werde zur keltischen Heldin oder zum keltischen Helden! Als Preis " +
          "für das schönste Kostüm kannst du einen Tag für dich und deine Familie im Keltenmuseum gewinnen.",
          "<i>Word bank: die Kelten – the Celts · keltisch – Celtic</i>"
        ]
      }
    },
    {
      id: "jt2024",
      jahr: "Test 2024",
      kurz: "Bergtour",
      situation: "Deine englische Austauschpartnerin Jane kommt dich am kommenden " +
        "Wochenende besuchen. Sie würde gerne eine Bergtour in den Alpen machen, " +
        "allerdings soll das Wetter schlecht werden. Schreibe Jane eine E-Mail " +
        "(ca. 140 Wörter) auf Englisch und …",
      auftraege: [
        "berichte ihr von der Wettervorhersage; erzähle ihr auch kurz von deiner letzten Bergtour, bei der du und deine Eltern in schlechtes Wetter geraten seid, und",
        "schlage vor, stattdessen gemeinsam an dem Kunstworkshop im Museum „Kunterbunt“ teilzunehmen, und versuche Jane davon zu begeistern."
      ],
      material: {
        titel: "Museum „Kunterbunt“",
        zeilen: [
          "Du willst Farbe in dein Leben bringen? Komm zu uns! Wir bieten Kunst-Workshops für Jugendliche.",
          "<b>Wann:</b> jeden Samstagnachmittag von 14–17 Uhr · <b>Preis:</b> 20 Euro",
          "„Die Workshops sind einfach genial. Bilder malen, Skulpturen schaffen oder auch mal " +
          "in die Stadt gehen, um Fotos zu machen. Das macht richtig Spaß.“",
          "<i>Die Wettervorhersage steht als Bild im Original-PDF – denk dir hier einfach schlechtes Wetter aus.</i>"
        ]
      }
    },
    {
      id: "jt2023",
      jahr: "Test 2023",
      kurz: "London",
      situation: "Du bist Alex Kramer und möchtest in den bevorstehenden Herbstferien " +
        "deine englische Brieffreundin Charlotte in London besuchen. Schreibe ihr in " +
        "einer englischen E-Mail (ca. 140 Wörter), …",
      auftraege: [
        "wann und wo sie dich bitte abholen soll (Details siehe Ticket),",
        "welche zwei Aktivitäten von deiner Ideenliste du für London planst (jeweils mit Begründung) und frage Charlotte nach ihrer Meinung dazu,",
        "wie dein letzter Sommerurlaub auf einem Bauernhof war (mit Begründung)."
      ],
      material: {
        titel: "Ticket und Ideenliste",
        zeilen: [
          "<i>Beides steht als Bild im Original-PDF. Denk dir hier eine Ankunftszeit und " +
          "zwei Aktivitäten aus – geübt wird das Schreiben, nicht das Ablesen.</i>"
        ]
      }
    },
    {
      id: "jt2022",
      jahr: "Test 2022",
      kurz: "Fahrradmarathon",
      situation: "Dein englischer Freund Dylan verbringt seine Ferien in Deutschland bei " +
        "seiner Tante. Nächste Woche findet ein Fahrradmarathon für einen guten Zweck " +
        "statt. Du möchtest zusammen mit Dylan an dieser Wohltätigkeitsveranstaltung " +
        "teilnehmen. Leider spricht er nicht sehr gut Deutsch, deswegen verfasst du die " +
        "E-Mail (ca. 140 Wörter) auf Englisch. Du …",
      auftraege: [
        "erzählst ihm von der Veranstaltung und warum du gemeinsam mit ihm dort teilnehmen möchtest (zwei Aspekte),",
        "beschreibst Dylan den Weg von seiner Tante dorthin (nutze hierfür die Karte) und",
        "erzählst ihm von deiner letzten Fahrradtour, die für dich leider beim Arzt endete."
      ],
      material: {
        titel: "Karte",
        zeilen: [
          "<i>Die Karte steht als Bild im Original-PDF. Denk dir hier einen Weg aus " +
          "(links abbiegen, geradeaus, an der Kirche vorbei …).</i>",
          "<i>Word bank: spenden – to donate</i>"
        ]
      }
    }
  ]
};
