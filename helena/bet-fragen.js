/* Fragen für die BET-Fragerunden (Englisch, Jahrgangsstufentest 7, Bayern).
 *
 * Denny am 20.09.2026: "Baue doch hier verschiedene Quizze ein, bei denen sie
 * immer einzelne Fragen beantworten muss und nicht einen 50-minütigen Test
 * machen soll. ... Gerne per Multiple Choice, damit sie sich einfach tut."
 *
 * Warum die Fragen HIER fest stehen und nicht aus /api/quiz kommen:
 * Der BET prüft den Stoff aus Klasse 5 UND 6 - einen festen, abgeschlossenen
 * Kanon. Es gibt nichts nachzubauen, nichts kostet Geld, nichts hängt am
 * Speicherkontingent, und die Runde startet ohne eine Sekunde Warten.
 *
 * Die richtige Antwort steht IMMER an Stelle 0. Gemischt wird beim Anzeigen.
 * "merkmal" ist das Lernziel - danach wird wiederholt, nicht nach der Frage.
 *
 * Quelle für Aufbau und Niveau: ISB Bayern, Jahrgangsstufenarbeiten Englisch 7
 * (Hörverstehen, Leseverstehen, Wortschatz/Grammatik, Textproduktion).
 * Hörverstehen fehlt hier mit Absicht: Das braucht echtes Audio, und
 * Gerätestimmen sind in diesem Projekt zweimal durchgefallen (19.09.2026).
 * Textproduktion fehlt ebenfalls mit Absicht: Einen eigenen Text schreibt man
 * nicht per Multiple Choice. Beides steht als Originaltest auf der BET-Seite.
 *
 * DIE WICHTIGSTE REGEL BEIM DAZUSCHREIBEN (gelernt am 20.09.2026 in einer
 * Gegenprüfung): Keine der drei falschen Antworten darf für sich genommen
 * richtiges Englisch sein. "While I was reading, the phone was ringing" ist
 * tadellos - als Distraktor hätte es sie für gutes Englisch bestraft.
 * Ebenso: keine Frage, die nebenbei eine falsche Tatsache behauptet
 * (es gibt keine Helmpflicht fürs Radfahren).
 */

/* Die Lesetexte stehen EINMAL hier und werden über textId geholt. Vorher
   stand jeder Text dreimal wortgleich in der Datei - wer einen ändert,
   vergisst die dritte Kopie. */
window.BET_TEXTE = {
  lucy: "Hi Emma,\n\nlast weekend was great! On Saturday my dad and I went to the lake. We took our bikes and it was only half an hour. The water was really cold, but I swam anyway. On Sunday it rained all day, so we stayed at home and played board games with my little brother.\n\nSee you on Monday,\nLucy",

  trip: "SCHOOL TRIP – YEAR 7\n\nWhen: Friday, 16th October\nWhere: Science Museum, Manchester\nMeet: 7.30 a.m. at the school gate (the bus leaves at 7.45!)\nBack: about 5 p.m.\nBring: a packed lunch, a rain jacket and £5 for the museum shop.\nYou do NOT need to bring a book.",

  ben: "Ben is twelve and he lives in a small town near Bristol. Three times a week he gets up at half past five, because he trains with his swimming club before school. He doesn't really like getting up so early, but he loves being in the water. His best friend Sam thinks Ben is crazy — Sam prefers playing computer games in the evening. Last winter Ben was ill for four weeks and couldn't swim at all. He says those weeks were awful, and since then he has never complained about the early mornings again."
};

window.BET_RUNDEN = [

/* ------------------------------------------------------------------ */
{ k: "zeiten", n: "Zeiten", ic: "⏱", unter: "present simple, progressive, past, going to",
  fragen: [
  { frage: "She ___ to school every day.",
    antworten: ["goes", "go", "is going", "went"], richtig: 0,
    erklaerung: "every day = present simple. Bei he/she/it kommt ein -s ans Verb.",
    merkmal: "present simple – 3. Person -s" },

  { frage: "Look! The dog ___ with the ball.",
    antworten: ["is playing", "plays", "played", "play"], richtig: 0,
    erklaerung: "Look! heißt: gerade jetzt. Das ist present progressive: am/is/are + -ing.",
    merkmal: "present progressive" },

  { frage: "I can't come now. I ___ my homework.",
    antworten: ["am doing", "do", "did", "does"], richtig: 0,
    erklaerung: "Es passiert in diesem Moment – am/is/are + -ing.",
    merkmal: "present progressive" },

  { frage: "Yesterday we ___ a great film.",
    antworten: ["watched", "watch", "are watching", "watches"], richtig: 0,
    erklaerung: "yesterday = simple past. Regelmäßige Verben bekommen -ed.",
    merkmal: "simple past – regelmäßige Verben" },

  { frage: "Last summer they ___ to Italy.",
    antworten: ["went", "goed", "gone", "go"], richtig: 0,
    erklaerung: "go ist unregelmäßig: go – went – gone. 'goed' gibt es nicht.",
    merkmal: "simple past – unregelmäßige Verben" },

  { frage: "He ___ TV every evening.",
    antworten: ["watches", "watch", "watching", "watchs"], richtig: 0,
    erklaerung: "every evening = present simple. Nach -ch kommt -es: watches.",
    merkmal: "present simple – 3. Person -s" },

  { frage: "Look at the clouds! It ___ rain in a minute.",
    antworten: ["is going to", "will be", "rains", "rained"], richtig: 0,
    erklaerung: "Du siehst ein Anzeichen dafür (die Wolken) – dann nimmt man going to.",
    merkmal: "going to future" },

  { frage: "We ___ a party next Saturday. We've already sent the invitations.",
    antworten: ["are going to have", "having", "have had", "will having"], richtig: 0,
    erklaerung: "Etwas ist geplant und vorbereitet – going to.",
    merkmal: "going to future" },

  { frage: "While I was reading, the phone ___ three times.",
    antworten: ["rang", "ringing", "has rung", "were ringing"], richtig: 0,
    erklaerung: "Der lange Vorgang steht im past progressive (was reading), das kurze Ereignis mittendrin im simple past.",
    merkmal: "past progressive + simple past" },

  { frage: "They ___ football when it suddenly started to rain.",
    antworten: ["were playing", "was playing", "have played", "are playing"], richtig: 0,
    erklaerung: "Das Spiel lief schon, als der Regen anfing – past progressive, und they → were.",
    merkmal: "past progressive + simple past" },

  { frage: "She ___ born in 2013.",
    antworten: ["was", "is", "were", "has been"], richtig: 0,
    erklaerung: "Geboren werden steht im past: I was born, she was born, they were born.",
    merkmal: "was/were" },

  { frage: "___ you ever been to London?",
    antworten: ["Have", "Did", "Are", "Do"], richtig: 0,
    erklaerung: "ever/never + Erfahrung = present perfect: have/has + 3. Form.",
    merkmal: "present perfect" },

  { frage: "I ___ my keys, so I can't open the door.",
    antworten: ["have lost", "am losing", "was losing", "have lose"], richtig: 0,
    erklaerung: "Das Ergebnis zählt jetzt noch (die Tür geht nicht auf) – present perfect.",
    merkmal: "present perfect" }
]},

/* ------------------------------------------------------------------ */
{ k: "fragen", n: "Fragen & Verneinung", ic: "❓", unter: "do/does/did, can, must, there is, Steigerung, if-Sätze",
  fragen: [
  { frage: "___ she like pizza?",
    antworten: ["Does", "Do", "Is", "Has"], richtig: 0,
    erklaerung: "Frage im present simple mit she → does. Das Verb bleibt dann ohne -s: Does she like …?",
    merkmal: "Fragen mit do/does" },

  { frage: "Where ___ you go last Saturday?",
    antworten: ["did", "do", "are", "have"], richtig: 0,
    erklaerung: "last Saturday = past. Die Frage bildet man mit did + Grundform.",
    merkmal: "Fragen im simple past" },

  { frage: "He ___ come to the party yesterday.",
    antworten: ["didn't", "doesn't", "isn't", "don't"], richtig: 0,
    erklaerung: "Verneinung im past: didn't + Grundform (didn't come, nicht didn't came).",
    merkmal: "Verneinung im simple past" },

  { frage: "You ___ wear a seat belt in a car. It's the law.",
    antworten: ["must", "needn't", "may", "could"], richtig: 0,
    erklaerung: "must = müssen, es ist Pflicht. needn't wäre genau das Gegenteil.",
    merkmal: "Modalverben" },

  { frage: "I'm sorry, I ___ help you. I'm too busy.",
    antworten: ["can't", "don't can", "amn't able", "cannot to"], richtig: 0,
    erklaerung: "can't = ich kann nicht. Nach can steht immer die Grundform ohne to.",
    merkmal: "Modalverben" },

  { frage: "There ___ a lot of people at the concert last night.",
    antworten: ["were", "was", "is", "has"], richtig: 0,
    erklaerung: "people ist Mehrzahl und der Satz steht im past → there were.",
    merkmal: "there is / there are" },

  { frage: "How ___ milk do we need?",
    antworten: ["much", "many", "lot", "long"], richtig: 0,
    erklaerung: "milk kann man nicht zählen → how much. Zählbares: how many.",
    merkmal: "much / many" },

  { frage: "She is ___ than her brother.",
    antworten: ["taller", "more tall", "tallest", "taller as"], richtig: 0,
    erklaerung: "Kurze Adjektive steigert man mit -er, und der Vergleich läuft mit than.",
    merkmal: "Steigerung der Adjektive" },

  { frage: "This is the ___ film I've ever seen.",
    antworten: ["best", "goodest", "more good", "most good"], richtig: 0,
    erklaerung: "good ist unregelmäßig: good – better – best.",
    merkmal: "Steigerung der Adjektive" },

  { frage: "If it rains tomorrow, we ___ at home.",
    antworten: ["will stay", "would stay", "will stayed", "would have stayed"], richtig: 0,
    erklaerung: "Bedingungssatz Typ 1: if + present simple, dann will + Grundform.",
    merkmal: "if-Sätze Typ 1" },

  { frage: "This book is ___ interesting than that one.",
    antworten: ["more", "much", "interestinger", "most"], richtig: 0,
    erklaerung: "Lange Adjektive steigert man mit more: more interesting.",
    merkmal: "Steigerung der Adjektive" },

  { frage: "___ there any milk in the fridge?",
    antworten: ["Is", "Are", "Has", "Does"], richtig: 0,
    erklaerung: "milk ist Einzahl (nicht zählbar) → Is there …?",
    merkmal: "there is / there are" }
]},

/* ------------------------------------------------------------------ */
/* Dieses Paket kam am 20.09.2026 aus einer Gegenprüfung dazu: Präpositionen,
   some/any, Pronomen, Adjektiv/Adverb und Wortstellung stehen in praktisch
   jedem Jahrgangsstufentest und fehlten vorher komplett. */
{ k: "kleine", n: "Kleine Wörter", ic: "🧩", unter: "in/on/at, some/any, mein/dein, Wortstellung",
  fragen: [
  { frage: "My birthday is ___ May.",
    antworten: ["in", "on", "at", "to"], richtig: 0,
    erklaerung: "Monate und Jahre: in May, in 2026. Tage: on Monday. Uhrzeiten: at six.",
    merkmal: "Präpositionen der Zeit" },

  { frage: "The test starts ___ half past eight.",
    antworten: ["at", "in", "on", "by"], richtig: 0,
    erklaerung: "Bei Uhrzeiten steht at: at eight, at half past eight, at midnight.",
    merkmal: "Präpositionen der Zeit" },

  { frage: "We meet ___ Friday afternoon.",
    antworten: ["on", "in", "at", "since"], richtig: 0,
    erklaerung: "Wochentage und Daten bekommen on – auch on Friday afternoon.",
    merkmal: "Präpositionen der Zeit" },

  { frage: "There's a nice café ___ the corner of our street.",
    antworten: ["on", "in", "under", "about"], richtig: 0,
    erklaerung: "on the corner = an der Ecke. In the corner wäre in einer Zimmerecke.",
    merkmal: "Präpositionen des Ortes" },

  { frage: "I haven't got ___ money with me.",
    antworten: ["any", "some", "a", "much of"], richtig: 0,
    erklaerung: "In verneinten Sätzen und Fragen steht any, im bejahten Satz some.",
    merkmal: "some / any" },

  { frage: "Would you like ___ tea?",
    antworten: ["some", "any", "a", "many"], richtig: 0,
    erklaerung: "Beim höflichen Angebot steht some, obwohl es eine Frage ist.",
    merkmal: "some / any" },

  { frage: "This bag isn't mine. Is it ___?",
    antworten: ["yours", "your", "you", "your's"], richtig: 0,
    erklaerung: "Ohne Nomen dahinter: mine, yours, his, hers, ours, theirs. 'your's' gibt es nicht.",
    merkmal: "Possessivpronomen" },

  { frage: "That's ___ new bike.",
    antworten: ["Peter's", "Peters", "Peter", "of Peter"], richtig: 0,
    erklaerung: "Bei Personen zeigt 's, wem etwas gehört: Peter's bike.",
    merkmal: "Genitiv mit 's" },

  { frage: "I saw ___ at the bus stop this morning.",
    antworten: ["her", "she", "hers", "herself"], richtig: 0,
    erklaerung: "Nach dem Verb steht die Objektform: me, you, him, her, us, them.",
    merkmal: "Objektpronomen" },

  { frage: "He speaks English very ___.",
    antworten: ["well", "good", "goodly", "better as"], richtig: 0,
    erklaerung: "Wie jemand etwas tut, sagt das Adverb: good → well.",
    merkmal: "Adjektiv oder Adverb" },

  { frage: "She opened the door ___ because the baby was asleep.",
    antworten: ["quietly", "quiet", "quietlier", "more quiet"], richtig: 0,
    erklaerung: "Das Adverb beschreibt das Verb: quiet → quietly.",
    merkmal: "Adjektiv oder Adverb" },

  { frage: "Welcher Satz hat die richtige Wortstellung?",
    antworten: ["She often goes to the cinema.", "She goes often to the cinema.",
                "Often she goes to the cinema on Fridays with her friends and her brother.",
                "She goes to the cinema often on Fridays and she is often there."], richtig: 0,
    erklaerung: "Häufigkeitswörter (often, always, never, sometimes) stehen vor dem Vollverb.",
    merkmal: "Wortstellung – Häufigkeitsadverbien" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["We played football in the park yesterday.", "We played in the park football yesterday.",
                "We played yesterday football in the park.", "Yesterday played we football in the park."], richtig: 0,
    erklaerung: "Englische Reihenfolge: Was – Wo – Wann. Erst football, dann in the park, dann yesterday.",
    merkmal: "Wortstellung – Ort vor Zeit" }
]},

/* ------------------------------------------------------------------ */
{ k: "woerter", n: "Wortschatz", ic: "🔤", unter: "Alltag, Schule, Wege, Verwechslungsgefahr",
  fragen: [
  { frage: "Your mother's brother is your ___.",
    antworten: ["uncle", "cousin", "nephew", "aunt"], richtig: 0,
    erklaerung: "uncle = Onkel. cousin = Cousin/Cousine, aunt = Tante, nephew = Neffe.",
    merkmal: "Wortschatz Familie" },

  { frage: "Where do you buy bread?",
    antworten: ["at the baker's", "at the butcher's", "at the chemist's", "at the newsagent's"], richtig: 0,
    erklaerung: "baker = Bäcker. butcher = Metzger, chemist = Drogerie, newsagent = Zeitungsladen.",
    merkmal: "Wortschatz Einkaufen" },

  { frage: "The opposite of 'expensive' is ___.",
    antworten: ["cheap", "boring", "heavy", "early"], richtig: 0,
    erklaerung: "expensive = teuer, cheap = billig.",
    merkmal: "Wortschatz Gegenteile" },

  { frage: "Can you ___ me five pounds until tomorrow?",
    antworten: ["lend", "borrow", "owe", "rent"], richtig: 0,
    erklaerung: "lend = jemandem etwas geben, borrow = sich etwas holen. I lend you money, you borrow money from me.",
    merkmal: "lend / borrow" },

  { frage: "Can you ___ me what happened?",
    antworten: ["tell", "say", "speak", "talk"], richtig: 0,
    erklaerung: "tell braucht eine Person dahinter (tell me), say nicht (say something).",
    merkmal: "say / tell" },

  { frage: "I have to ___ my homework before dinner.",
    antworten: ["do", "make", "work", "give"], richtig: 0,
    erklaerung: "do the homework, do the washing-up – aber make a cake, make a mistake.",
    merkmal: "make / do" },

  { frage: "It's very cold outside. Put on your ___.",
    antworten: ["coat", "swimsuit", "sandals", "sunglasses"], richtig: 0,
    erklaerung: "coat = Mantel. Der Rest gehört in den Sommer.",
    merkmal: "Wortschatz Kleidung" },

  { frage: "This person looks after patients in a hospital: a ___.",
    antworten: ["nurse", "waiter", "lawyer", "farmer"], richtig: 0,
    erklaerung: "nurse = Krankenpfleger/Krankenschwester. look after = sich kümmern um.",
    merkmal: "Wortschatz Berufe" },

  { frage: "Which one is a school subject?",
    antworten: ["geography", "carpet", "cousin", "saucepan"], richtig: 0,
    erklaerung: "geography = Erdkunde. carpet = Teppich, saucepan = Kochtopf.",
    merkmal: "Wortschatz Schule" },

  { frage: "Where do you borrow books?",
    antworten: ["at the library", "at the bookshop", "at the office", "at the museum"], richtig: 0,
    erklaerung: "borrow = ausleihen → library (Bücherei). Im bookshop kauft man sie.",
    merkmal: "Wortschatz Orte" },

  { frage: "I've got a bad ___. I can't hear you very well.",
    antworten: ["earache", "stomach ache", "toothache", "sore foot"], richtig: 0,
    erklaerung: "ear = Ohr, also earache = Ohrenschmerzen.",
    merkmal: "Wortschatz Gesundheit" },

  { frage: "What time is it? 7.45",
    antworten: ["a quarter to eight", "a quarter past eight", "half past eight", "ten to eight"], richtig: 0,
    erklaerung: "45 Minuten = 15 Minuten vor der nächsten vollen Stunde: a quarter to eight.",
    merkmal: "Uhrzeit auf Englisch" },

  { frage: "We went to Scotland. It was a wonderful ___.",
    antworten: ["trip", "travel", "way", "voyage"], richtig: 0,
    erklaerung: "Eine einzelne Reise ist a trip oder a journey. travel ist das Reisen allgemein.",
    merkmal: "trip / travel" }
]},

/* ------------------------------------------------------------------ */
{ k: "lesen", n: "Leseverstehen", ic: "📖", unter: "Texte: Einzelheiten, Wortbedeutung, Hauptaussage",
  fragen: [
  { textId: "lucy", frage: "How did Lucy get to the lake?",
    antworten: ["By bike.", "By car.", "By bus.", "She walked."], richtig: 0,
    erklaerung: "„We took our bikes“ – sie sind mit dem Rad gefahren.",
    merkmal: "Leseverstehen – Detail finden" },

  { textId: "lucy", frage: "Why didn't they go out on Sunday?",
    antworten: ["Because of the rain.", "Because they were tired.", "Because the lake was closed.", "Because her brother was ill."], richtig: 0,
    erklaerung: "„it rained all day, so we stayed at home“.",
    merkmal: "Leseverstehen – Grund erkennen" },

  { textId: "lucy", frage: "What does 'anyway' mean in „The water was really cold, but I swam anyway“?",
    antworten: ["trotzdem", "sofort", "beinahe", "selten"], richtig: 0,
    erklaerung: "Das 'but' davor ist der Hinweis: Es war kalt – und sie ist trotzdem hinein.",
    merkmal: "Leseverstehen – Wortbedeutung erschließen" },

  { textId: "trip", frage: "What time does the bus leave?",
    antworten: ["At 7.45 a.m.", "At 7.30 a.m.", "At 5 p.m.", "At 8 a.m."], richtig: 0,
    erklaerung: "Um 7.30 trifft man sich, der Bus fährt um 7.45. Genau lesen – das ist der Trick der Aufgabe.",
    merkmal: "Leseverstehen – Detail finden" },

  { textId: "trip", frage: "What do you have to bring?",
    antworten: ["Lunch, a rain jacket and £5.", "A book and £5.", "Only money.", "Lunch and a swimsuit."], richtig: 0,
    erklaerung: "„Bring: a packed lunch, a rain jacket and £5“ – ein Buch braucht man ausdrücklich nicht.",
    merkmal: "Leseverstehen – Detail finden" },

  { textId: "trip", frage: "„The trip costs £5.“ – Richtig, falsch, oder steht das nicht im Text?",
    antworten: ["Das steht nicht im Text.", "Richtig.", "Falsch.", "Richtig, aber nur für Jahrgang 7."], richtig: 0,
    erklaerung: "Die £5 sind für den Museumsladen. Was die Fahrt kostet, sagt der Text nirgends – das ist etwas anderes als 'falsch'.",
    merkmal: "Leseverstehen – richtig/falsch/nicht im Text" },

  { textId: "ben", frage: "How often does Ben train before school?",
    antworten: ["Three times a week.", "Every day.", "Twice a week.", "Only at the weekend."], richtig: 0,
    erklaerung: "„Three times a week he gets up at half past five“.",
    merkmal: "Leseverstehen – Detail finden" },

  { textId: "ben", frage: "How does Ben feel about getting up early?",
    antworten: ["He doesn't like it, but he does it for the swimming.", "He loves getting up early.", "He never gets up early.", "He is angry with his club."], richtig: 0,
    erklaerung: "„He doesn't really like getting up so early, but he loves being in the water.“",
    merkmal: "Leseverstehen – Gefühle und Haltung" },

  { textId: "ben", frage: "What do we learn about Sam?",
    antworten: ["He would rather play computer games.", "He swims with Ben.", "He lives in Bristol.", "He gets up at half past five too."], richtig: 0,
    erklaerung: "„Sam prefers playing computer games“ – prefer heißt: lieber mögen.",
    merkmal: "Leseverstehen – Detail finden" },

  { textId: "ben", frage: "What does 'awful' mean in „those weeks were awful“?",
    antworten: ["schrecklich", "ruhig", "kurz", "lustig"], richtig: 0,
    erklaerung: "Er war krank und konnte nicht schwimmen – und beschwert sich seitdem nicht mehr. Also waren die Wochen schlimm.",
    merkmal: "Leseverstehen – Wortbedeutung erschließen" },

  { textId: "ben", frage: "What is the text mainly about?",
    antworten: ["Why Ben accepts getting up early.", "How to join a swimming club.",
                "Life in a small town near Bristol.", "Why computer games are popular."], richtig: 0,
    erklaerung: "Alles im Text dreht sich darum, warum er das frühe Aufstehen auf sich nimmt – die anderen Punkte kommen nur nebenbei vor.",
    merkmal: "Leseverstehen – Hauptaussage" },

  { textId: "ben", frage: "„Ben has stopped swimming.“ – Richtig, falsch, oder steht das nicht im Text?",
    antworten: ["Falsch.", "Richtig.", "Das steht nicht im Text.", "Richtig, seit letztem Winter."], richtig: 0,
    erklaerung: "Er konnte vier Wochen lang nicht schwimmen, weil er krank war – aufgehört hat er nicht. Der Text sagt das Gegenteil.",
    merkmal: "Leseverstehen – richtig/falsch/nicht im Text" }
]},

/* ------------------------------------------------------------------ */
{ k: "fehler", n: "Fehler finden", ic: "🔍", unter: "Welcher Satz ist richtig?",
  fragen: [
  { frage: "Welcher Satz ist richtig?",
    antworten: ["He doesn't like fish.", "He don't like fish.", "He doesn't likes fish.", "He not like fish."], richtig: 0,
    erklaerung: "he/she/it → doesn't, und danach steht die Grundform ohne -s.",
    merkmal: "Verneinung im present simple" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["I saw him yesterday.", "I have seen him yesterday.", "I have saw him yesterday.", "I did saw him yesterday."], richtig: 0,
    erklaerung: "Mit yesterday steht das simple past. Present perfect und yesterday passen nie zusammen.",
    merkmal: "simple past statt present perfect" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["She is nicer than her sister.", "She is more nice than her sister.", "She is nicer as her sister.", "She is the nicer than her sister."], richtig: 0,
    erklaerung: "Kurzes Adjektiv → -er, und der Vergleich läuft mit than, nicht mit as.",
    merkmal: "Steigerung der Adjektive" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["We were at home.", "We was at home.", "We been at home.", "We are at home yesterday."], richtig: 0,
    erklaerung: "we/you/they → were. Nur I/he/she/it bekommen was.",
    merkmal: "was/were" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["There are many cars in the street.", "There is many cars in the street.", "There are much cars in the street.", "It are many cars in the street."], richtig: 0,
    erklaerung: "cars ist Mehrzahl → there are, und zählbar → many.",
    merkmal: "there is / there are" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["I go to school by bus every day.", "I am going to school by bus every day.", "I goes to school by bus every day.", "I am go to school by bus every day."], richtig: 0,
    erklaerung: "every day = Gewohnheit → present simple, nicht progressive.",
    merkmal: "present simple vs. progressive" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["He can swim very well.", "He can to swim very well.", "He cans swim very well.", "He can swims very well."], richtig: 0,
    erklaerung: "Nach can steht die Grundform – ohne to und ohne -s.",
    merkmal: "Modalverben" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["How many books do you have?", "How much books do you have?", "How many books you have?", "How many book do you have?"], richtig: 0,
    erklaerung: "books kann man zählen → how many, und die Frage braucht do.",
    merkmal: "much / many" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["Yesterday I went to the cinema.", "Yesterday I go to the cinema.", "Yesterday I have gone to the cinema.", "Yesterday I goed to the cinema."], richtig: 0,
    erklaerung: "go – went – gone. Mit yesterday: went.",
    merkmal: "simple past – unregelmäßige Verben" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["The children are playing outside.", "The childs are playing outside.", "The children is playing outside.", "The childrens are playing outside."], richtig: 0,
    erklaerung: "child – children ist eine unregelmäßige Mehrzahl, und children ist Plural → are.",
    merkmal: "unregelmäßige Mehrzahl" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["My brother is good at maths.", "My brother is well at maths.", "My brother is good in maths.", "My brother is a good in maths."], richtig: 0,
    erklaerung: "be good at something – nach be steht das Adjektiv, und die Präposition ist at.",
    merkmal: "Adjektiv oder Adverb" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["I'm looking forward to the holidays.", "I'm looking forward the holidays.", "I look forward on the holidays.", "I'm looking forward for the holidays."], richtig: 0,
    erklaerung: "look forward to something – das 'to' gehört fest dazu.",
    merkmal: "feste Wendungen" }
]},

/* ------------------------------------------------------------------ */
{ k: "sagen", n: "Was sagst du?", ic: "💬", unter: "Alltagssituationen",
  fragen: [
  { frage: "Du willst im Laden wissen, was etwas kostet. Was sagst du?",
    antworten: ["How much is it?", "How many is it?", "What costs it?", "How much it is?"], richtig: 0,
    erklaerung: "How much is it? oder How much does it cost?",
    merkmal: "Sprachhandlung – einkaufen" },

  { frage: "Du hast jemanden nicht verstanden. Was sagst du?",
    antworten: ["Sorry, could you say that again, please?", "I don't know you.", "Say it again!", "What you said?"], richtig: 0,
    erklaerung: "Höflich nachfragen: Sorry, could you say that again, please? oder Pardon?",
    merkmal: "Sprachhandlung – nachfragen" },

  { frage: "Du kommst zu spät zum Unterricht. Was sagst du?",
    antworten: ["I'm sorry I'm late.", "I have too late.", "Excuse, I am too late come.", "Sorry, I am lately."], richtig: 0,
    erklaerung: "late = zu spät. I'm sorry I'm late.",
    merkmal: "Sprachhandlung – sich entschuldigen" },

  { frage: "Jemand sagt: „Thank you very much.“ Wie antwortest du?",
    antworten: ["You're welcome.", "Please.", "Yes, of course you are.", "Thank me, too."], richtig: 0,
    erklaerung: "You're welcome. oder That's all right. 'Bitte' heißt hier nicht please.",
    merkmal: "Sprachhandlung – reagieren" },

  { frage: "Du fragst nach dem Weg zum Bahnhof. Was sagst du?",
    antworten: ["Excuse me, how do I get to the station?", "Where goes the station?", "Please, the station where is?", "Can you say me the station?"], richtig: 0,
    erklaerung: "Excuse me, how do I get to …? ist die übliche Frage nach dem Weg.",
    merkmal: "Sprachhandlung – nach dem Weg fragen" },

  { frage: "Du bestellst im Café höflich eine heiße Schokolade. Was sagst du?",
    antworten: ["I'd like a hot chocolate, please.", "Give me a hot chocolate.", "I will have hot chocolate, yes?", "Make me one hot chocolate."], richtig: 0,
    erklaerung: "I'd like … , please ist die höfliche Bestellung.",
    merkmal: "Sprachhandlung – bestellen" },

  { frage: "Du möchtest fragen, ob du das Fenster öffnen darfst.",
    antworten: ["May I open the window?", "Must I open the window?", "I open the window?", "Do I can open the window?"], richtig: 0,
    erklaerung: "May I …? oder Can I …? fragt nach Erlaubnis. Must wäre 'muss ich'.",
    merkmal: "Sprachhandlung – um Erlaubnis fragen" },

  { frage: "Jemand fragt: „How are you?“ Was passt?",
    antworten: ["I'm fine, thanks. And you?", "I'm twelve, thanks.", "Yes, I am.", "How do you do it?"], richtig: 0,
    erklaerung: "How are you? fragt nach dem Befinden – und man fragt zurück: And you?",
    merkmal: "Sprachhandlung – small talk" },

  { frage: "Du stellst deine Freundin Anna vor. Was sagst du?",
    antworten: ["This is my friend Anna.", "Here stands Anna.", "She is called Anna, my friend.", "That there is Anna."], richtig: 0,
    erklaerung: "Beim Vorstellen: This is … .",
    merkmal: "Sprachhandlung – vorstellen" },

  { frage: "Du willst wissen, wie spät es ist.",
    antworten: ["What time is it, please?", "How late is it, please?", "What clock is it?", "How much is the time?"], richtig: 0,
    erklaerung: "What time is it? – 'How late is it?' ist wörtlich aus dem Deutschen übersetzt und falsch.",
    merkmal: "Sprachhandlung – Uhrzeit erfragen" },

  { frage: "Du möchtest deiner Freundin einen Vorschlag machen: ins Schwimmbad gehen.",
    antworten: ["Let's go to the swimming pool!", "We go to the swimming pool, yes?", "Shall we going to the swimming pool?", "Do we go to the swimming pool!"], richtig: 0,
    erklaerung: "Vorschlag: Let's … oder Shall we go …? – immer mit der Grundform.",
    merkmal: "Sprachhandlung – Vorschlag machen" },

  { frage: "Du rufst an und möchtest mit Tom sprechen. Was sagst du?",
    antworten: ["Hello, this is Helena. Can I speak to Tom, please?", "Hello, here is Helena. I want Tom.",
                "Hello, I am Helena. Give me Tom.", "Hello, here speaks Helena for Tom."], richtig: 0,
    erklaerung: "Am Telefon sagt man this is …, nicht 'here is'. Und Can I speak to …, please?",
    merkmal: "Sprachhandlung – telefonieren" }
]}

];
