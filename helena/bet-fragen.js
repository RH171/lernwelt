/* Fragen für die BET-Fragerunden (Englisch, Jahrgangsstufentest 7, Bayern).
 *
 * Denny am 20.09.2026: "Baue doch hier verschiedene Quizze ein, bei denen sie
 * immer einzelne Fragen beantworten muss und nicht einen 50-minütigen Test
 * machen soll. ... erst mal einzelne Fragespiele oder einzelne Fragerunden ...
 * Gerne per Multiple Choice, damit sie sich einfach tut."
 *
 * Warum die Fragen HIER fest stehen und nicht aus /api/quiz kommen:
 * Der BET prüft den Stoff aus Klasse 5 UND 6 - einen festen, abgeschlossenen
 * Kanon. Es gibt nichts nachzubauen, nichts kostet Geld, nichts hängt am
 * Speicherkontingent, und die Runde startet ohne eine Sekunde Warten.
 * Der Preis ist, dass die Fragen sich wiederholen - genau das ist beim Üben
 * auf einen Test aber der Sinn, anders als beim täglichen Lernquiz.
 *
 * Die richtige Antwort steht IMMER an Stelle 0. Gemischt wird beim Anzeigen.
 * "merkmal" ist das Lernziel - danach wird wiederholt, nicht nach der Frage.
 *
 * Quelle für Aufbau und Niveau: ISB Bayern, Jahrgangsstufenarbeiten Englisch 7
 * (Hörverstehen, Leseverstehen, Wortschatz/Grammatik, Textproduktion).
 * Hörverstehen fehlt hier mit Absicht: Das braucht echtes Audio, und
 * Gerätestimmen sind in diesem Projekt zweimal durchgefallen (19.09.2026).
 * Dafür stehen unten auf der BET-Seite die Original-Hörtexte des ISB.
 */
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
    antworten: ["watches", "watch", "is watching", "watched"], richtig: 0,
    erklaerung: "every evening = present simple. Nach -ch kommt -es: watches.",
    merkmal: "present simple – 3. Person -s" },

  { frage: "Look at the clouds! It ___ rain.",
    antworten: ["is going to", "will be", "rains", "is raining"], richtig: 0,
    erklaerung: "Du siehst ein Anzeichen dafür (die Wolken) – dann nimmt man going to.",
    merkmal: "going to future" },

  { frage: "We ___ a party next Saturday. Everything is planned.",
    antworten: ["are going to have", "have", "had", "will having"], richtig: 0,
    erklaerung: "Etwas ist geplant – going to. 'will having' gibt es nicht.",
    merkmal: "going to future" },

  { frage: "While I was reading, the phone ___.",
    antworten: ["rang", "was ringing", "rings", "has rung"], richtig: 0,
    erklaerung: "Der lange Vorgang steht im past progressive (was reading), das kurze Ereignis mittendrin im simple past.",
    merkmal: "past progressive + simple past" },

  { frage: "They ___ football when it started to rain.",
    antworten: ["were playing", "played", "play", "have played"], richtig: 0,
    erklaerung: "Das Spiel lief schon, als der Regen anfing – past progressive.",
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
    antworten: ["have lost", "lose", "am losing", "was losing"], richtig: 0,
    erklaerung: "Das Ergebnis zählt jetzt noch (die Tür geht nicht auf) – present perfect.",
    merkmal: "present perfect" }
]},

/* ------------------------------------------------------------------ */
{ k: "fragen", n: "Fragen & Verneinung", ic: "❓", unter: "do/does/did, can, must, Steigerung",
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
    antworten: ["didn't", "doesn't", "isn't", "wasn't"], richtig: 0,
    erklaerung: "Verneinung im past: didn't + Grundform (didn't come, nicht didn't came).",
    merkmal: "Verneinung im simple past" },

  { frage: "You ___ wear a helmet when you ride a bike. It's the law.",
    antworten: ["must", "can", "needn't", "may"], richtig: 0,
    erklaerung: "must = müssen, es ist Pflicht. needn't wäre genau das Gegenteil.",
    merkmal: "Modalverben" },

  { frage: "I'm sorry, I ___ help you. I'm too busy.",
    antworten: ["can't", "mustn't", "don't can", "couldn't be"], richtig: 0,
    erklaerung: "can't = ich kann nicht. mustn't hieße 'ich darf nicht'.",
    merkmal: "Modalverben" },

  { frage: "There ___ a lot of people at the concert.",
    antworten: ["were", "was", "is", "has"], richtig: 0,
    erklaerung: "people ist Mehrzahl → there were.",
    merkmal: "there is / there are" },

  { frage: "How ___ milk do we need?",
    antworten: ["much", "many", "lot", "some"], richtig: 0,
    erklaerung: "milk kann man nicht zählen → how much. Zählbares: how many.",
    merkmal: "much / many" },

  { frage: "She is ___ than her brother.",
    antworten: ["taller", "more tall", "tallest", "the taller"], richtig: 0,
    erklaerung: "Kurze Adjektive steigert man mit -er: tall – taller – tallest.",
    merkmal: "Steigerung der Adjektive" },

  { frage: "This is the ___ film I've ever seen.",
    antworten: ["best", "better", "goodest", "more good"], richtig: 0,
    erklaerung: "good ist unregelmäßig: good – better – best.",
    merkmal: "Steigerung der Adjektive" },

  { frage: "If it rains tomorrow, we ___ at home.",
    antworten: ["will stay", "stay", "would stay", "stayed"], richtig: 0,
    erklaerung: "Bedingungssatz Typ 1: if + present simple, dann will + Grundform.",
    merkmal: "if-Sätze Typ 1" },

  { frage: "This book is ___ interesting than that one.",
    antworten: ["more", "much", "the most", "interestinger"], richtig: 0,
    erklaerung: "Lange Adjektive steigert man mit more: more interesting.",
    merkmal: "Steigerung der Adjektive" },

  { frage: "___ there any milk in the fridge?",
    antworten: ["Is", "Are", "Has", "Does"], richtig: 0,
    erklaerung: "milk ist Einzahl (nicht zählbar) → Is there …?",
    merkmal: "there is / there are" }
]},

/* ------------------------------------------------------------------ */
{ k: "woerter", n: "Wortschatz", ic: "🔤", unter: "Schule, Zuhause, Essen, Freizeit",
  fragen: [
  { frage: "Your mother's brother is your ___.",
    antworten: ["uncle", "cousin", "nephew", "aunt"], richtig: 0,
    erklaerung: "uncle = Onkel. cousin = Cousin/Cousine, aunt = Tante.",
    merkmal: "Wortschatz Familie" },

  { frage: "Where do you buy bread?",
    antworten: ["at the baker's", "at the butcher's", "at the chemist's", "at the newsagent's"], richtig: 0,
    erklaerung: "baker = Bäcker. butcher = Metzger, chemist = Drogerie/Apotheke.",
    merkmal: "Wortschatz Einkaufen" },

  { frage: "The opposite of 'expensive' is ___.",
    antworten: ["cheap", "boring", "heavy", "early"], richtig: 0,
    erklaerung: "expensive = teuer, cheap = billig.",
    merkmal: "Wortschatz Gegenteile" },

  { frage: "Breakfast, lunch and ___.",
    antworten: ["dinner", "brunch", "dessert", "snack"], richtig: 0,
    erklaerung: "Die drei Mahlzeiten am Tag: breakfast – lunch – dinner.",
    merkmal: "Wortschatz Essen" },

  { frage: "In which room do you usually cook?",
    antworten: ["in the kitchen", "in the bathroom", "in the bedroom", "in the garage"], richtig: 0,
    erklaerung: "kitchen = Küche.",
    merkmal: "Wortschatz Zuhause" },

  { frage: "It's very cold outside. Put on your ___.",
    antworten: ["coat", "swimsuit", "sandals", "sunglasses"], richtig: 0,
    erklaerung: "coat = Mantel. Der Rest gehört in den Sommer.",
    merkmal: "Wortschatz Kleidung" },

  { frage: "This person works in a hospital and helps the doctor: a ___.",
    antworten: ["nurse", "waiter", "teacher", "farmer"], richtig: 0,
    erklaerung: "nurse = Krankenpfleger/Krankenschwester.",
    merkmal: "Wortschatz Berufe" },

  { frage: "Which one is a school subject?",
    antworten: ["geography", "carpet", "cousin", "kitchen"], richtig: 0,
    erklaerung: "geography = Erdkunde. carpet = Teppich.",
    merkmal: "Wortschatz Schule" },

  { frage: "Where do you borrow books?",
    antworten: ["at the library", "at the bookshop", "at the office", "at the museum"], richtig: 0,
    erklaerung: "borrow = ausleihen → library (Bücherei). Im bookshop kauft man sie.",
    merkmal: "Wortschatz Orte" },

  { frage: "The month after July is ___.",
    antworten: ["August", "June", "September", "April"], richtig: 0,
    erklaerung: "June – July – August – September.",
    merkmal: "Wortschatz Monate" },

  { frage: "What time is it? 7:45",
    antworten: ["a quarter to eight", "a quarter past eight", "half past eight", "ten to eight"], richtig: 0,
    erklaerung: "45 Minuten = 15 Minuten vor der nächsten vollen Stunde: a quarter to eight.",
    merkmal: "Uhrzeit auf Englisch" },

  { frage: "Which word does NOT belong to 'weather'?",
    antworten: ["kitchen", "cloudy", "windy", "foggy"], richtig: 0,
    erklaerung: "cloudy, windy und foggy beschreiben das Wetter – kitchen nicht.",
    merkmal: "Wortschatz Wetter" }
]},

/* ------------------------------------------------------------------ */
{ k: "lesen", n: "Leseverstehen", ic: "📖", unter: "kurze Texte mit Fragen",
  fragen: [
  { text: "Hi Emma,\n\nlast weekend was great! On Saturday my dad and I went to the lake. We took our bikes and it was only half an hour. The water was really cold, but I swam anyway. On Sunday it rained all day, so we stayed at home and played board games with my little brother.\n\nSee you on Monday,\nLucy",
    frage: "How did Lucy get to the lake?",
    antworten: ["By bike.", "By car.", "By bus.", "She walked."], richtig: 0,
    erklaerung: "„We took our bikes“ – sie sind mit dem Rad gefahren.",
    merkmal: "Leseverstehen – Detail finden" },

  { text: "Hi Emma,\n\nlast weekend was great! On Saturday my dad and I went to the lake. We took our bikes and it was only half an hour. The water was really cold, but I swam anyway. On Sunday it rained all day, so we stayed at home and played board games with my little brother.\n\nSee you on Monday,\nLucy",
    frage: "Why didn't they go out on Sunday?",
    antworten: ["Because of the rain.", "Because they were tired.", "Because the lake was closed.", "Because her brother was ill."], richtig: 0,
    erklaerung: "„it rained all day, so we stayed at home“.",
    merkmal: "Leseverstehen – Grund erkennen" },

  { text: "Hi Emma,\n\nlast weekend was great! On Saturday my dad and I went to the lake. We took our bikes and it was only half an hour. The water was really cold, but I swam anyway. On Sunday it rained all day, so we stayed at home and played board games with my little brother.\n\nSee you on Monday,\nLucy",
    frage: "What does Lucy say about the water?",
    antworten: ["It was cold, but she went in.", "It was warm and nice.", "She didn't go into the water.", "It was too dirty for swimming."], richtig: 0,
    erklaerung: "„The water was really cold, but I swam anyway.“ – anyway heißt: trotzdem.",
    merkmal: "Leseverstehen – Detail finden" },

  { text: "SCHOOL TRIP – YEAR 7\n\nWhen: Friday, 16th October\nWhere: Science Museum, Manchester\nMeet: 7.30 a.m. at the school gate (the bus leaves at 7.45!)\nBack: about 5 p.m.\nBring: a packed lunch, a rain jacket and £5 for the museum shop.\nYou do NOT need to bring a book.",
    frage: "What time does the bus leave?",
    antworten: ["At 7.45 a.m.", "At 7.30 a.m.", "At 5 p.m.", "At 8 a.m."], richtig: 0,
    erklaerung: "Um 7.30 trifft man sich, der Bus fährt um 7.45. Genau lesen – das ist der Trick der Aufgabe.",
    merkmal: "Leseverstehen – Detail finden" },

  { text: "SCHOOL TRIP – YEAR 7\n\nWhen: Friday, 16th October\nWhere: Science Museum, Manchester\nMeet: 7.30 a.m. at the school gate (the bus leaves at 7.45!)\nBack: about 5 p.m.\nBring: a packed lunch, a rain jacket and £5 for the museum shop.\nYou do NOT need to bring a book.",
    frage: "What do you have to bring?",
    antworten: ["Lunch, a rain jacket and £5.", "A book and £5.", "Only money.", "Lunch and a swimsuit."], richtig: 0,
    erklaerung: "„Bring: a packed lunch, a rain jacket and £5“ – ein Buch braucht man ausdrücklich nicht.",
    merkmal: "Leseverstehen – Detail finden" },

  { text: "SCHOOL TRIP – YEAR 7\n\nWhen: Friday, 16th October\nWhere: Science Museum, Manchester\nMeet: 7.30 a.m. at the school gate (the bus leaves at 7.45!)\nBack: about 5 p.m.\nBring: a packed lunch, a rain jacket and £5 for the museum shop.\nYou do NOT need to bring a book.",
    frage: "Where does the trip go?",
    antworten: ["To a science museum.", "To a castle.", "To the zoo.", "To a swimming pool."], richtig: 0,
    erklaerung: "„Where: Science Museum, Manchester“.",
    merkmal: "Leseverstehen – Hauptinformation" },

  { text: "Ben is twelve and he lives in a small town near Bristol. Three times a week he gets up at half past five, because he trains with his swimming club before school. He doesn't really like getting up so early, but he loves being in the water. His best friend Sam thinks Ben is crazy — Sam prefers playing computer games in the evening.",
    frage: "How often does Ben train before school?",
    antworten: ["Three times a week.", "Every day.", "Twice a week.", "Only at the weekend."], richtig: 0,
    erklaerung: "„Three times a week he gets up at half past five“.",
    merkmal: "Leseverstehen – Detail finden" },

  { text: "Ben is twelve and he lives in a small town near Bristol. Three times a week he gets up at half past five, because he trains with his swimming club before school. He doesn't really like getting up so early, but he loves being in the water. His best friend Sam thinks Ben is crazy — Sam prefers playing computer games in the evening.",
    frage: "How does Ben feel about getting up early?",
    antworten: ["He doesn't like it, but he does it for the swimming.", "He loves getting up early.", "He never gets up early.", "He is angry with his club."], richtig: 0,
    erklaerung: "„He doesn't really like getting up so early, but he loves being in the water.“",
    merkmal: "Leseverstehen – Gefühle und Haltung" },

  { text: "Ben is twelve and he lives in a small town near Bristol. Three times a week he gets up at half past five, because he trains with his swimming club before school. He doesn't really like getting up so early, but he loves being in the water. His best friend Sam thinks Ben is crazy — Sam prefers playing computer games in the evening.",
    frage: "What do we learn about Sam?",
    antworten: ["He would rather play computer games.", "He swims with Ben.", "He lives in Bristol.", "He gets up at half past five too."], richtig: 0,
    erklaerung: "„Sam prefers playing computer games“ – prefer heißt: lieber mögen.",
    merkmal: "Leseverstehen – Detail finden" }
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
    merkmal: "unregelmäßige Mehrzahl" }
]},

/* ------------------------------------------------------------------ */
{ k: "sagen", n: "Was sagst du?", ic: "💬", unter: "Alltagssituationen",
  fragen: [
  { frage: "Du willst im Laden wissen, was etwas kostet. Was sagst du?",
    antworten: ["How much is it?", "How many is it?", "What costs it?", "How much it is?"], richtig: 0,
    erklaerung: "How much is it? oder How much does it cost?",
    merkmal: "Sprachhandlung – einkaufen" },

  { frage: "Du hast jemanden nicht verstanden. Was sagst du?",
    antworten: ["Sorry, could you say that again, please?", "I don't know you.", "Say it!", "What you said?"], richtig: 0,
    erklaerung: "Höflich nachfragen: Sorry, could you say that again, please? oder Pardon?",
    merkmal: "Sprachhandlung – nachfragen" },

  { frage: "Du kommst zu spät zum Unterricht. Was sagst du?",
    antworten: ["I'm sorry I'm late.", "I have too late.", "Excuse, I am too late come.", "Sorry, I am lately."], richtig: 0,
    erklaerung: "late = zu spät. I'm sorry I'm late.",
    merkmal: "Sprachhandlung – sich entschuldigen" },

  { frage: "Jemand sagt: „Thank you very much.“ Wie antwortest du?",
    antworten: ["You're welcome.", "Please.", "Yes, of course you are.", "Not at all, thank me."], richtig: 0,
    erklaerung: "You're welcome. oder That's all right. 'Bitte' heißt hier nicht please.",
    merkmal: "Sprachhandlung – reagieren" },

  { frage: "Du fragst nach dem Weg zum Bahnhof. Was sagst du?",
    antworten: ["Excuse me, how do I get to the station?", "Where goes the station?", "Please, the station where is?", "Can you say me the station?"], richtig: 0,
    erklaerung: "Excuse me, how do I get to …? ist die übliche Frage nach dem Weg.",
    merkmal: "Sprachhandlung – nach dem Weg fragen" },

  { frage: "Du bestellst im Café eine heiße Schokolade. Was sagst du?",
    antworten: ["I'd like a hot chocolate, please.", "I want hot chocolate.", "Give me a hot chocolate.", "I will have hot chocolate, yes?"], richtig: 0,
    erklaerung: "I'd like … , please ist die höfliche Bestellung. 'I want' klingt unhöflich.",
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
    merkmal: "Sprachhandlung – Uhrzeit erfragen" }
]}

];
