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
/* Teil II B des echten Tests ist genau das hier: ein zusammenhaengender
   Text, und zu jeder Luecke gibt es drei Moeglichkeiten zur Auswahl
   (belegt am ISB-Originaltest 2025, "Being offline", 10 von 60 BE).
   Die Fehlertypen sind dem Original nachgebaut: Konnektoren, Zeitform,
   want sb to do, too much/many, phrasal verbs, Apostroph. */
{ k: "luecken", n: "Lückentext", ic: "📝", unter: "wie Teil II im echten Test",
  fragen: [
  { text: "MY WEEK WITHOUT A PHONE\n\nLast week I left my phone at home ___ I wanted to see what happens.",
    frage: "Welches Wort passt in die Lücke?",
    antworten: ["because", "although", "so that", "however"], richtig: 0,
    erklaerung: "because nennt den Grund. although wäre ein Gegensatz, so that eine Absicht.",
    merkmal: "Konnektoren – because/although/so that" },

  { text: "MY WEEK WITHOUT A PHONE\n\nI didn't get bored, ___ I had thought it would be terrible.",
    frage: "Welches Wort passt in die Lücke?",
    antworten: ["although", "because", "so that", "if"], richtig: 0,
    erklaerung: "although = obwohl. Es steht ein Gegensatz zwischen den beiden Satzteilen.",
    merkmal: "Konnektoren – because/although/so that" },

  { text: "MY WEEK WITHOUT A PHONE\n\nI took a book with me ___ I wouldn't be bored on the bus.",
    frage: "Welches Wort passt in die Lücke?",
    antworten: ["so that", "because", "although", "while"], richtig: 0,
    erklaerung: "so that nennt die Absicht: damit mir nicht langweilig wird.",
    merkmal: "Konnektoren – because/although/so that" },

  { text: "MY WEEK WITHOUT A PHONE\n\nThe number of people without a smartphone ___ much in the last years.",
    frage: "Welche Form passt in die Lücke?",
    antworten: ["hasn't grown", "doesn't grow", "didn't grew", "isn't growing"], richtig: 0,
    erklaerung: "in the last years reicht bis heute → present perfect (has/have + 3. Form).",
    merkmal: "Zeitform in der Lücke" },

  { text: "MY WEEK WITHOUT A PHONE\n\nMy mum ___ me to try it for seven days.",
    frage: "Welche Form passt in die Lücke?",
    antworten: ["wanted", "wanted that", "want", "wants that"], richtig: 0,
    erklaerung: "want somebody to do something: She wanted me to try. 'wanted that I try' gibt es im Englischen nicht.",
    merkmal: "want somebody to do something" },

  { text: "MY WEEK WITHOUT A PHONE\n\n___ I said goodbye to my phone, I checked it about fifty times a day.",
    frage: "Welches Wort passt in die Lücke?",
    antworten: ["Before", "After", "While", "Until"], richtig: 0,
    erklaerung: "Das Checken war vorher – also before. after wäre danach.",
    merkmal: "before / while / after" },

  { text: "MY WEEK WITHOUT A PHONE\n\nI think many of us are online ___ .",
    frage: "Welcher Ausdruck passt in die Lücke?",
    antworten: ["too often", "too many", "too much people", "too strong"], richtig: 0,
    erklaerung: "Wie oft etwas passiert: too often. too many braucht ein zählbares Nomen dahinter.",
    merkmal: "too much / too many / too often" },

  { text: "MY WEEK WITHOUT A PHONE\n\nWithout a map on my phone I had to ___ the way to the station on my own.",
    frage: "Welcher Ausdruck passt in die Lücke?",
    antworten: ["look for", "look after", "look at", "look up to"], richtig: 0,
    erklaerung: "look for = suchen. look after = sich kümmern um, look at = anschauen.",
    merkmal: "Phrasal verbs – look for/after/at" },

  { text: "MY WEEK WITHOUT A PHONE\n\nMy little sister wanted me to ___ her bike while she was at her friend's house.",
    frage: "Welcher Ausdruck passt in die Lücke?",
    antworten: ["look after", "look for", "look at", "look out"], richtig: 0,
    erklaerung: "look after = auf etwas aufpassen.",
    merkmal: "Phrasal verbs – look for/after/at" },

  { text: "MY WEEK WITHOUT A PHONE\n\nAll my ___ numbers were on that phone, so I couldn't call anyone.",
    frage: "Welche Form passt in die Lücke?",
    antworten: ["friends'", "friend's", "friends", "friends's"], richtig: 0,
    erklaerung: "Mehrere Freunde → Apostroph hinter dem -s: my friends' numbers.",
    merkmal: "Apostroph – friend's / friends'" },

  { text: "MY WEEK WITHOUT A PHONE\n\nMy grandma is going to ___ me how to read a real map.",
    frage: "Welches Wort passt in die Lücke?",
    antworten: ["teach", "learn", "study", "make"], richtig: 0,
    erklaerung: "teach = beibringen, learn = selbst lernen. Sie bringt es mir bei.",
    merkmal: "teach / learn" },

  { text: "MY WEEK WITHOUT A PHONE\n\nTry it yourself: stay offline for ___ two hours a day.",
    frage: "Welcher Ausdruck passt in die Lücke?",
    antworten: ["at least", "not less", "a few of", "at last"], richtig: 0,
    erklaerung: "at least = mindestens. at last heißt 'endlich' und passt hier nicht.",
    merkmal: "at least / at last" }
]},

/* ------------------------------------------------------------------ */
/* Ausgezaehlt ueber die Loesungshefte 2022-2025: Das ISB nennt zu jedem
   der 20 Items in Teil II das geprüfte Lernziel ("Focus on"). Der mit
   Abstand haeufigste Eintrag ist "L1 interference" - der typisch deutsche
   Fehler: 13 von 80 Items in vier Jahren. Genau die stehen hier. */
{ k: "deutsch", n: "Typisch deutsch", ic: "🇩🇪", unter: "die Fehler, die der Test am häufigsten prüft",
  fragen: [
  { frage: "„In der Klinik gibt es elf Koalas.“ Wie heißt das auf Englisch?",
    antworten: ["There are eleven koalas in the clinic.", "It gives eleven koalas in the clinic.",
                "There gives eleven koalas in the clinic.", "It are eleven koalas in the clinic."], richtig: 0,
    erklaerung: "„Es gibt“ heißt there is (Einzahl) oder there are (Mehrzahl) – nie 'it gives'. Genau dieser Fehler stand 2022 im Test.",
    merkmal: "typisch deutsch – es gibt" },

  { frage: "„Die Arbeit mit den Koalas macht Spaß.“ Wie sagt man das?",
    antworten: ["Working with the koalas is fun.", "Working with the koalas makes fun.",
                "The work with the koalas makes fun.", "It makes fun to work with the koalas."], richtig: 0,
    erklaerung: "'to make fun' heißt sich über jemanden lustig machen. Spaß machen = to be fun oder to enjoy something.",
    merkmal: "typisch deutsch – Spaß machen" },

  { frage: "„Sie steht früh auf.“ Wie heißt das auf Englisch?",
    antworten: ["She gets up early.", "She stands up early.", "She stands early up.", "She is standing up early."], richtig: 0,
    erklaerung: "get up = aufstehen (aus dem Bett). stand up heißt: sich hinstellen.",
    merkmal: "typisch deutsch – aufstehen" },

  { frage: "„Am Nachmittag hilft sie mit.“ Welche Präposition?",
    antworten: ["In the afternoon she helps.", "At the afternoon she helps.",
                "On the afternoon she helps.", "To the afternoon she helps."], richtig: 0,
    erklaerung: "in the morning, in the afternoon, in the evening – aber at night.",
    merkmal: "typisch deutsch – in the afternoon" },

  { frage: "„Sie sorgt dafür, dass es den Koalas gut geht und sie glücklich sind.“",
    antworten: ["… that they are well and happy.", "… that they are well and lucky.",
                "… that they are good and lucky.", "… that they are healthy and luck."], richtig: 0,
    erklaerung: "happy = glücklich im Gefühl. lucky = Glück gehabt. Der Test hat genau das 2022 abgefragt.",
    merkmal: "typisch deutsch – happy / lucky" },

  { frage: "„Sie hat eine eigene Internet-Show.“",
    antworten: ["She has her own internet show.", "She has an own internet show.",
                "She has a own internet show.", "She has an own internet-show of her."], richtig: 0,
    erklaerung: "Vor 'own' steht immer ein Possessivbegleiter: my own, her own, their own – nie 'an own'.",
    merkmal: "typisch deutsch – her own" },

  { frage: "„Die meisten Leute denken das.“",
    antworten: ["Most people think so.", "The most people think so.",
                "Most of people think so.", "The most of people think so."], richtig: 0,
    erklaerung: "Allgemein: most people. Mit 'the' nur, wenn eine bestimmte Gruppe gemeint ist: most of the people in my class.",
    merkmal: "typisch deutsch – most people" },

  { frage: "„Die Kinder waren an seinen Geschichten interessiert.“",
    antworten: ["The kids were interested in his stories.", "The kids were interesting in his stories.",
                "The kids were interested on his stories.", "The kids were interest in his stories."], richtig: 0,
    erklaerung: "Ich bin interested (das Gefühl), die Sache ist interesting (sie macht das Gefühl). Und: interested IN.",
    merkmal: "interested / interesting" },

  { frage: "„Ich war so aufgeregt!“",
    antworten: ["I was so excited!", "I was so exciting!", "I was so exciting about it!", "I was such exciting!"], richtig: 0,
    erklaerung: "Dieselbe Regel wie bei interested: Die Person ist excited, die Sache ist exciting.",
    merkmal: "excited / exciting" },

  { frage: "„Meine Mutter wollte, dass ich es versuche.“",
    antworten: ["My mum wanted me to try it.", "My mum wanted that I try it.",
                "My mum wanted, that I tried it.", "My mum wanted me that I try it."], richtig: 0,
    erklaerung: "want somebody to do something. Einen 'dass'-Satz gibt es nach want nicht.",
    merkmal: "typisch deutsch – want somebody to" },

  { frage: "„Meine Oma bringt mir Kartenlesen bei.“",
    antworten: ["My grandma teaches me how to read a map.", "My grandma learns me how to read a map.",
                "My grandma learns me map reading.", "My grandma studies me how to read a map."], richtig: 0,
    erklaerung: "teach = beibringen, learn = selbst lernen. Im Deutschen klingt 'lernen' nach beidem – im Englischen nicht.",
    merkmal: "teach / learn" },

  { frage: "„Wir schauen abends fern.“",
    antworten: ["We watch TV in the evening.", "We look TV in the evening.",
                "We see TV in the evening.", "We are looking TV at the evening."], richtig: 0,
    erklaerung: "watch TV, aber look at a picture und see a film at the cinema.",
    merkmal: "watch / look / see" },

  { frage: "„Ich lernte ihn kennen, während ich in London war.“",
    antworten: ["I met him while I was in London.", "I met him during I was in London.",
                "I met him while my stay in London.", "I met him during was I in London."], richtig: 0,
    erklaerung: "while + ganzer Satz, during + Nomen (during my stay).",
    merkmal: "while / during" },

  { frage: "„Wenn ich älter bin, arbeite ich mit Tieren.“",
    antworten: ["When I'm older, I'll work with animals.", "If I'm older, I'll work with animals.",
                "When I'll be older, I work with animals.", "If I will be older, I work with animals."], richtig: 0,
    erklaerung: "Älter wird sie sicher – dann when. if heißt: nur falls es passiert. Und nach when/if steht kein will.",
    merkmal: "when / if" }
]},

/* ------------------------------------------------------------------ */
/* Zweithaeufigstes Thema der Loesungshefte 2022-2025: Vergleichen und
   Steigern, 10 von 80 Items. Die Testfehler hiessen: more good, famousest,
   popularest, more easy, not so lazy like, as strong like. */
{ k: "steigern", n: "Steigern & vergleichen", ic: "📊", unter: "as … as, than, better, the most",
  fragen: [
  { frage: "Welcher Satz ist richtig?",
    antworten: ["These doughnuts are better than the ones from the shop.",
                "These doughnuts are more good than the ones from the shop.",
                "These doughnuts are gooder than the ones from the shop.",
                "These doughnuts are better as the ones from the shop."], richtig: 0,
    erklaerung: "good – better – best, und verglichen wird mit than.",
    merkmal: "Steigerung – unregelmäßig (good)" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["He was the most famous kid in town.", "He was the famousest kid in town.",
                "He was the most famousest kid in town.", "He was the more famous kid in town."], richtig: 0,
    erklaerung: "Zweisilbige Adjektive, die nicht auf -y enden, steigern mit more / the most: famous – more famous – the most famous.",
    merkmal: "Steigerung – lange Adjektive" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["The chocolate one is the most popular doughnut.", "The chocolate one is the popularest doughnut.",
                "The chocolate one is the more popular doughnut.", "The chocolate one is the popularst doughnut."], richtig: 0,
    erklaerung: "popular hat drei Silben → the most popular.",
    merkmal: "Steigerung – lange Adjektive" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["After a while it got easier.", "After a while it got more easy.",
                "After a while it got easyer.", "After a while it got more easier."], richtig: 0,
    erklaerung: "Zweisilbige Adjektive auf -y: y wird zu i und dann -er. easy – easier – easiest.",
    merkmal: "Steigerung – Adjektive auf -y" },

  { frage: "„Die Koalas sind nicht so faul, wie alle denken.“",
    antworten: ["The koalas aren't as lazy as everybody thinks.", "The koalas aren't so lazy like everybody thinks.",
                "The koalas aren't as lazy like everybody thinks.", "The koalas aren't so lazy as like everybody thinks."], richtig: 0,
    erklaerung: "Gleichheit: as … as. 'like' ist der deutsche Denkfehler und wird im Test regelmäßig versteckt.",
    merkmal: "Vergleich – as … as" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["She had the best personality of all.", "She had the most good personality of all.",
                "She had the better personality of all.", "She had the goodest personality of all."], richtig: 0,
    erklaerung: "good – better – best. Der Superlativ bekommt 'the'.",
    merkmal: "Steigerung – unregelmäßig (good)" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["This film is worse than the first one.", "This film is more bad than the first one.",
                "This film is badder than the first one.", "This film is worser than the first one."], richtig: 0,
    erklaerung: "bad – worse – worst, ebenfalls unregelmäßig.",
    merkmal: "Steigerung – unregelmäßig (bad)" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["He is one of the youngest people to walk the trail.",
                "He is one from the youngest people to walk the trail.",
                "He is one of the youngest person to walk the trail.",
                "He is one of youngest people to walk the trail."], richtig: 0,
    erklaerung: "one OF the … und danach die Mehrzahl. 'one from' ist aus dem Deutschen übersetzt.",
    merkmal: "one of the …" },

  { frage: "„Er ist genauso groß wie sein Bruder.“",
    antworten: ["He is as tall as his brother.", "He is as tall like his brother.",
                "He is so tall as his brother.", "He is as taller as his brother."], richtig: 0,
    erklaerung: "as + Grundform + as. Gesteigert wird dabei nicht.",
    merkmal: "Vergleich – as … as" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["It was the coldest day of the year.", "It was the most cold day of the year.",
                "It was the colder day of the year.", "It was the coldst day of the year."], richtig: 0,
    erklaerung: "Kurzes Adjektiv → -est, und der Superlativ bekommt 'the'.",
    merkmal: "Steigerung – kurze Adjektive" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["I have never been happier.", "I was never happier in my life until now.",
                "I have never been happyer.", "I am never happier been."], richtig: 0,
    erklaerung: "Bis jetzt und immer noch → present perfect. Und happy wird zu happier.",
    merkmal: "present perfect statt simple past" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["Her room is bigger than mine.", "Her room is more big than mine.",
                "Her room is biger than mine.", "Her room is bigger as mine."], richtig: 0,
    erklaerung: "Kurzes Adjektiv mit einem Vokal: Der Endkonsonant wird verdoppelt – big – bigger – biggest.",
    merkmal: "Steigerung – kurze Adjektive" }
]},

/* ------------------------------------------------------------------ */
/* Drittes grosses Thema: unregelmaessige Vergangenheitsformen, 8 von 80
   Items. Die Testfehler waren gived, buyed, choosed, heared, tryed - immer
   die regelmaessige Form da, wo eine unregelmaessige hingehoert. */
{ k: "verbformen", n: "Verbformen", ic: "🔁", unter: "gave statt gived – und der Rest der Stolpersteine",
  fragen: [
  { frage: "Welche Form ist richtig? „His brothers ___ the doughnuts a thumbs up.“",
    antworten: ["gave", "gived", "gaved", "given"], richtig: 0,
    erklaerung: "give – gave – given.",
    merkmal: "unregelmäßige Verbformen" },

  { frage: "Welche Form ist richtig? „Her mother ___ an animal clinic years ago.“",
    antworten: ["bought", "buyed", "buought", "boughted"], richtig: 0,
    erklaerung: "buy – bought – bought.",
    merkmal: "unregelmäßige Verbformen" },

  { frage: "Welche Form ist richtig? „Then we ___ to try something new.“",
    antworten: ["chose", "choosed", "choosen", "chosed"], richtig: 0,
    erklaerung: "choose – chose – chosen.",
    merkmal: "unregelmäßige Verbformen" },

  { frage: "Welche Form ist richtig? „Have you ever ___ of Harvey Sutton?“",
    antworten: ["heard", "heared", "hear", "hearing"], richtig: 0,
    erklaerung: "hear – heard – heard. Geschrieben ohne e, gesprochen kurz.",
    merkmal: "unregelmäßige Verbformen" },

  { frage: "Welche Form ist richtig? „He really ___ hard to do his best.“",
    antworten: ["tried", "tryed", "tryied", "trys"], richtig: 0,
    erklaerung: "Verben auf Konsonant + y: y wird zu i, dann -ed. try – tried.",
    merkmal: "Rechtschreibung – tried / studied" },

  { frage: "Welche Form ist richtig? „Last summer the walks ___ longer and longer.“",
    antworten: ["became", "becomed", "becames", "have became"], richtig: 0,
    erklaerung: "become – became – become. Mit last summer steht das simple past.",
    merkmal: "unregelmäßige Verbformen" },

  { frage: "Welche Form ist richtig? „I ___ that coming.“ (Verneinung)",
    antworten: ["didn't see", "didn't saw", "don't saw", "didn't seen"], richtig: 0,
    erklaerung: "Nach didn't steht immer die Grundform – auch bei unregelmäßigen Verben.",
    merkmal: "Verneinung im simple past" },

  { frage: "„Ich musste meine Familie um Hilfe bitten.“",
    antworten: ["I had to ask my family for help.", "I musted ask my family for help.",
                "I must asked my family for help.", "I have must ask my family for help."], richtig: 0,
    erklaerung: "must hat keine Vergangenheitsform – dafür steht had to.",
    merkmal: "Modalverben – Ersatzformen" },

  { frage: "„Ich durfte es nicht mehr allein machen.“",
    antworten: ["I wasn't allowed to do it on my own any more.", "I couldn't allowed to do it on my own any more.",
                "I mustn't to do it on my own any more.", "I didn't allowed to do it on my own any more."], richtig: 0,
    erklaerung: "Für eine einzelne Situation in der Vergangenheit nimmt man wasn't allowed to. (could gibt es auch – aber für etwas, das allgemein erlaubt war.)",
    merkmal: "Modalverben – Ersatzformen" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["Last week he went to school for the first time.",
                "Last week he has gone to school for the first time.",
                "Last week he is gone to school for the first time.",
                "Last week he had gone to school for the first time."], richtig: 0,
    erklaerung: "Mit einer abgeschlossenen Zeitangabe (last week) steht das simple past.",
    merkmal: "present perfect vs. simple past" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["She has already seen koalas fighting.", "She already saw koalas fighting.",
                "She has already saw koalas fighting.", "She is already seeing koalas fighting."], richtig: 0,
    erklaerung: "already ohne Zeitangabe → present perfect: has/have + 3. Form. Im amerikanischen Englisch hört man auch das simple past – im Test gilt die britische Regel.",
    merkmal: "present perfect vs. simple past" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["If everything goes as planned, he will open a second shop.",
                "If everything go as planned, he will open a second shop.",
                "If everything goes as planned, he will opens a second shop.",
                "If everything will go as planned, he will open a second shop."], richtig: 0,
    erklaerung: "Nach if steht das present simple – mit -s bei everything – und im Hauptsatz will.",
    merkmal: "if-Sätze Typ 1" }
]},

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
{ k: "lesen", n: "Texte verstehen", ic: "📖", unter: "hilft bei Teil II – Einzelheiten, Wortbedeutung, Hauptaussage",
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
    merkmal: "feste Wendungen" },

  /* Ab hier die Fehlertypen aus dem echten Teil II A (ISB-Originaltest 2025,
     "Not an easy task!"): there/their, who/which, as ... as, Apostroph im
     Plural, Fragebildung im past, unregelmaessige Verben, Steigerung. */
  { frage: "Welcher Satz ist richtig?",
    antworten: ["They turned off their phones.", "They turned off there phones.", "They turned off they're phones.", "They turned off thier phones."], richtig: 0,
    erklaerung: "their = ihr/ihre. there = dort, they're = they are.",
    merkmal: "their / there / they're" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["She knows which spider is the most dangerous.", "She knows who spider is the most dangerous.", "She knows what spider is the most dangerousest.", "She knows which is the more dangerous spider of all."], richtig: 0,
    erklaerung: "who steht für Menschen, which für Tiere und Dinge.",
    merkmal: "who / which" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["He isn't as strong as his brother.", "He isn't as strong like his brother.", "He isn't so strong as like his brother.", "He isn't as stronger as his brother."], richtig: 0,
    erklaerung: "Gleichheit: as … as. Mit 'like' wird daraus ein Fehler, den der Test gern versteckt.",
    merkmal: "as ... as" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["We learned a lot about our kids' talents.", "We learned a lot about our kids talents.", "We learned a lot about our kid's talents, both of them.", "We learned a lot about our kids's talents."], richtig: 0,
    erklaerung: "Mehrere Kinder → Apostroph hinter dem -s: our kids' talents.",
    merkmal: "Apostroph – friend's / friends'" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["Did she play her favourite game that week?", "Played she her favourite game that week?", "Did she played her favourite game that week?", "She did play her favourite game that week?"], richtig: 0,
    erklaerung: "Frage im past: did + Person + Grundform. Die deutsche Wortstellung 'Spielte sie …' gibt es nicht.",
    merkmal: "Fragen im simple past" },

  { frage: "Welcher Satz ist richtig?",
    antworten: ["Then we chose to try new things and it got easier.", "Then we choosed to try new things and it got more easy.", "Then we chosed to try new things and it got easier.", "Then we choose to try new things and it got easyer."], richtig: 0,
    erklaerung: "choose – chose – chosen, und easy wird zu easier (nicht 'more easy').",
    merkmal: "simple past – unregelmäßige Verben" }
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
]},

/* ------------------------------------------------------------------ */
/* Teil III ist ein Drittel der Punkte (20 von 60 BE): eine E-Mail von rund
   140 Woertern, bewertet mit Inhalt 4 BE + Sprache 6 BE, mal zwei.
   Schreiben selbst geht nicht per Multiple Choice - die Bausteine schon:
   Anrede, Aufbau, Verknuepfen, Zeitform im Erlebnisteil, Schluss. */
{ k: "email", n: "E-Mail schreiben", ic: "✉️", unter: "Teil III – Bausteine für deinen Text",
  fragen: [
  { frage: "Du schreibst eine E-Mail an Jack, einen Austauschschüler. Wie fängst du an?",
    antworten: ["Hi Jack,", "Dear Sir or Madam,", "Hello Mr Jack!", "Good day Jack."], richtig: 0,
    erklaerung: "An jemanden in deinem Alter: Hi Jack, oder Dear Jack,. 'Dear Sir or Madam' ist für Briefe an Fremde in einer Firma.",
    merkmal: "E-Mail – Anrede" },

  { frage: "Nach der Anrede „Hi Jack,“ geht es in der nächsten Zeile weiter. Wie?",
    antworten: ["I'm writing to tell you about our trip.", "i'm writing to tell you about our trip.",
                "- I'm writing to tell you about our trip.", "Hi again, I'm writing to tell you about our trip."], richtig: 0,
    erklaerung: "Im Englischen geht es nach der Anrede GROSS weiter – anders als im Deutschen, wo man klein weiterschreibt.",
    merkmal: "E-Mail – Aufbau" },

  { frage: "Der erste Satz soll sagen, warum du schreibst. Was passt?",
    antworten: ["I'm writing to tell you about our school trip next month.",
                "I write you for saying about the trip.",
                "This mail is for the information of the trip.",
                "I want that you know about the trip."], richtig: 0,
    erklaerung: "I'm writing to tell you about … ist die Standardeinleitung und zeigt sofort das Thema.",
    merkmal: "E-Mail – Einleitung" },

  { frage: "Du erzählst von einem Erlebnis vom LETZTEN Jahr. In welcher Zeit schreibst du?",
    antworten: ["im simple past", "im present simple", "im present perfect", "im will-future"], richtig: 0,
    erklaerung: "Ein abgeschlossenes Erlebnis mit Zeitangabe (last year) steht im simple past.",
    merkmal: "E-Mail – Zeitform im Erlebnisteil" },

  { frage: "Du schreibst über den Ausflug, der noch kommt. Was passt?",
    antworten: ["We are going to visit the festival on Friday.",
                "We visit the festival last Friday.",
                "We have visited the festival on Friday.",
                "We will visiting the festival on Friday."], richtig: 0,
    erklaerung: "Etwas Geplantes in der Zukunft: are going to + Grundform.",
    merkmal: "E-Mail – Zeitform für Geplantes" },

  { frage: "Welches Wort verknüpft zwei Gedanken am besten: „I liked the music workshop ___ I love playing the guitar.“",
    antworten: ["because", "although", "but", "so that"], richtig: 0,
    erklaerung: "Du nennst den Grund, warum du ihn magst → because.",
    merkmal: "E-Mail – verknüpfen" },

  { frage: "Was macht deinen Text besser?",
    antworten: ["Wörter wie first, then, after that, finally",
                "möglichst viele Ausrufezeichen",
                "jeden Satz mit 'and' beginnen",
                "alles in einem einzigen langen Satz"], richtig: 0,
    erklaerung: "Verknüpfungswörter zeigen die Reihenfolge – dafür gibt es in der Bewertung Punkte bei 'Sprache'.",
    merkmal: "E-Mail – verknüpfen" },

  { frage: "In der Aufgabe stehen drei Punkte (z. B. vorstellen, begründen, erzählen). Was tust du?",
    antworten: ["Alle drei bearbeiten – jeder Punkt bringt Inhaltspunkte.",
                "Den ersten Punkt sehr ausführlich, die anderen weglassen.",
                "Nur den Punkt, den du am besten kannst.",
                "Die Punkte abschreiben und dann frei schreiben."], richtig: 0,
    erklaerung: "Die Inhaltspunkte werden einzeln gezählt. Ein fehlender Punkt kostet sicher Punkte, ein kurzer Absatz dazu bringt welche.",
    merkmal: "E-Mail – alle Aufgabenpunkte" },

  { frage: "Wie beendest du die E-Mail an Jack?",
    antworten: ["See you soon,\nHelena", "Yours faithfully,\nHelena", "With friendly greetings,\nHelena", "Goodbye and thank you for reading my mail."], richtig: 0,
    erklaerung: "Unter Freunden: See you soon, / Best wishes, / Love,. 'Yours faithfully' gehört in einen förmlichen Brief.",
    merkmal: "E-Mail – Schluss" },

  { frage: "Gefordert sind ungefähr 140 Wörter. Was ist richtig?",
    antworten: ["Ungefähr so viele schreiben – deutlich weniger kostet Punkte.",
                "So viel wie möglich, mindestens 300.",
                "Genau 140, keines mehr und keines weniger.",
                "Die Zahl ist nur ein Vorschlag, 50 reichen auch."], richtig: 0,
    erklaerung: "„ca. 140“ heißt: ein bisschen mehr oder weniger ist in Ordnung – aber wer die Hälfte schreibt, kann die Inhaltspunkte nicht abdecken.",
    merkmal: "E-Mail – Länge" },

  { frage: "Du hast zehn Minuten übrig. Was bringt die meisten Punkte?",
    antworten: ["Den Text auf -s bei he/she/it, Zeitformen und Rechtschreibung durchlesen.",
                "Noch zwei Sätze anhängen.",
                "Den Text schöner abschreiben.",
                "Die Aufgabenstellung noch einmal lesen und nichts ändern."], richtig: 0,
    erklaerung: "6 von 10 Punkten sind Sprache. Ein gefundener Fehler ist sicherer Gewinn, ein neuer Satz ist neues Risiko.",
    merkmal: "E-Mail – nachlesen" },

  { frage: "Welcher Satz ist in einer E-Mail am besten?",
    antworten: ["I hope you can come – it's going to be great!",
                "I hope you can coming, it is will be great!",
                "I hope that you can to come, it becomes great!",
                "I hope you can came, it will be great!"], richtig: 0,
    erklaerung: "Nach can steht die Grundform, und 'es wird toll' heißt it's going to be great – nicht 'it becomes'.",
    merkmal: "E-Mail – typische Fehler" },

  /* In allen vier Tests 2022-2025 musste eine Angabe aus einem Ticket, einer
     Karte oder einem Flyer in die E-Mail uebernommen werden, und immer war
     einer der drei Punkte ein Erlebnis aus der Vergangenheit. */
  { frage: "In der Aufgabe liegt ein Ticket mit Ankunftszeit und Bahnhof. Was tust du?",
    antworten: ["Die Angaben in eigenen Sätzen in die E-Mail einbauen.",
                "Das Ticket abschreiben, Zeile für Zeile.",
                "Die Angaben weglassen – sie stehen ja schon im Ticket.",
                "Eine eigene Uhrzeit erfinden, das merkt keiner."], richtig: 0,
    erklaerung: "Das ist die Aufgabe: die Angaben aus dem Bild in deinen Text übertragen. Abschreiben bringt keine Sprachpunkte, Weglassen kostet Inhaltspunkte.",
    merkmal: "E-Mail – Angaben aus Ticket oder Flyer" },

  { frage: "Du sollst den Weg vom Haus zur Veranstaltung beschreiben. Was passt?",
    antworten: ["Go straight on, then turn left at the church. It's next to the park.",
                "You go always straight and then left by the church, near from the park.",
                "Walk always gerade out and turn on the left at the church.",
                "You must going straight, after turn you left at the church."], richtig: 0,
    erklaerung: "go straight on, turn left/right, next to, opposite, between – das sind die Bausteine für eine Wegbeschreibung.",
    merkmal: "E-Mail – Weg beschreiben" },

  { frage: "Du sollst Charlotte nach ihrer Meinung fragen. Was passt?",
    antworten: ["What do you think about that?", "What thinks you about that?",
                "How do you mean that?", "What is your meaning about that?"], richtig: 0,
    erklaerung: "What do you think …? oder Do you like the idea? – 'meaning' heißt Bedeutung, nicht Meinung. „How do you mean that?“ ist zwar richtiges Englisch, fragt aber: Wie ist das gemeint?",
    merkmal: "E-Mail – nach der Meinung fragen" }
]}

];
