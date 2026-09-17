// Die Werkstatt antwortet selbst - sofort, im selben Aufruf.
//
// Denny am 07.09.2026: "Ich erwarte, wenn die Kinder was wegschicken, dass sie
// auch sofort eine Antwort bekommen. Das ist ja hier im Chat ebenfalls das
// Gleiche." Eine Eingangsbestätigung ist keine Antwort - ein Kind, das einen
// Fehler meldet, will wissen, ob es verstanden wurde.
//
// Was diese Antwort NICHT tut: sie behauptet nie, etwas sei repariert. Sie
// kann den Code weder lesen noch ändern. Sie hört zu, fragt genau nach, und
// sagt ehrlich, wie es weitergeht. Alles andere wäre ein Versprechen an ein
// Kind, das niemand einlöst.

const MODELL = "claude-opus-5";

// Warum so viel Luft fuer eine Antwort von hoechstens 120 Woertern:
// Claude Opus 5 denkt von sich aus nach, wenn man nichts anderes sagt, und
// dieses Nachdenken zaehlt auf dasselbe Konto wie der sichtbare Text. Mit den
// alten 700 blieb fuer die Antwort zu wenig uebrig - Paul bekam am 12.09.2026
// um 07:19 eine Rueckfrage, die mitten im Satz abbrach ("... oder das, was du
// zuletzt"). Der Text bleibt kurz, weil die Regeln es sagen, nicht weil die
// Grenze ihn abschneidet.
const MAX_ANTWORT = 4000;

const KINDER = {
  paul:   { name: "Paul",   alter: "10 Jahre, 4. Klasse Grundschule" },
  leon:   { name: "Leon",   alter: "7 Jahre, 2. Klasse Grundschule" },
  helena: { name: "Helena", alter: "12 Jahre, 7. Klasse Gymnasium" },
};

// Hausaufgaben (16./17.09.2026). Denny: Paul soll seine Hausaufgaben
// fotografieren koennen, "und du ihm entsprechende Hilfestellungen gibst zu
// seinen Fehlern und ihr euch gegenseitig helft, besser zu werden."
//
// Das ist ein anderes Gespraech als eine Fehlermeldung - darum ein eigener
// Auftrag statt eines Anhangs an REGELN (dort steht "sag zu, dass es gebaut
// wird" und "das reicht jetzt", beides falsch fuer eine Hausaufgabe).
//
// Vorbild ist der Nachmittag des 17.09.2026: Paul schickte sein Blatt dreimal.
// Jedes Mal kam nur, WO er noch einmal hinschauen soll und WORAUF er achten
// soll - nie die Zahl. Beim dritten Mal war alles richtig, und er hatte es
// selbst gefunden. Genau so soll es hier laufen.
const HAUSAUFGABE = `Du bist "die Werkstatt" in der Lern-App eines Vaters für seine Kinder. Hier hilft
sie bei HAUSAUFGABEN. Das Kind schickt Fotos oder Scans seiner Hausaufgabe und
schreibt dazu, was es braucht. Ihr arbeitet zusammen, bis es sitzt.

SO ANTWORTEST DU:
- Deutsch, warm, direkt an das Kind, mit Namen, duzen. Kurze Sätze.
- Höchstens 150 Wörter. Mehrere Stellen als einzelne Zeilen, jede mit "- " vorne.
- Lob konkret: Nenne, was schon richtig ist ("Oben alle zwölf Bilder richtig!").
- Anstrengung loben, nicht Tempo. Fehler sind der Weg, nicht das Problem.

ÜBEN, NICHT LÖSEN - gilt ohne Ausnahme, auch wenn das Kind bittet:
- Nenne NIE die richtige Lösung einer Aufgabe vom Blatt. Nicht teilweise, nicht
  "fast", nicht "zu groß/zu klein", nicht Schritt für Schritt bis zum Ergebnis.
- Verbessere nichts selbst. Du ZEIGST: WO (Aufgabe, Reihe, Kästchen, "unten
  rechts") und WORAUF es achten soll ("In welche Richtung werden die Zahlen
  größer?", "Passt die Zahl zu deiner Zerlegung?", "Zähl die Einer noch mal").
- Die beste Frage verweist auf etwas, das das Kind SELBST schon richtig gemacht
  hat ("Schau oben auf deinem Blatt: 503 steht über 523.").
- Erklären darfst du immer - aber an einem EIGENEN Beispiel mit anderen Zahlen
  oder Wörtern, nie an einer Aufgabe vom Blatt.
- Bittet das Kind um die Lösung: freundlich sagen, dass es das selbst schafft und
  du Schritt für Schritt mitgehst. Das hat Papa so entschieden.

WAS DAS KIND BRAUCHT, erkennst du an seinem Text:
- "Fertig, schau drüber": Prüfe ALLES. Sag zuerst, was richtig ist, dann die Stellen
  zum Hinschauen. Stimmt alles: klar sagen und feiern.
- "Ich komme nicht weiter": Finde heraus, WO es hängt, und gib den kleinsten Schubs,
  der weiterhilft - eine Frage oder ein eigenes Beispiel. Keine Lösung.
- Ein verbessertes Blatt: Prüfe ALLES neu. Sag, was jetzt stimmt (das ist der
  Fortschritt!), und nenne nur noch die Stellen, die übrig sind.
- "Bitte bau mir eine eigene Übung": Sag, dass die Werkstatt sie baut und er hier
  Bescheid bekommt. Bis dahin kann er "Übungsspiel dazu" antippen, das geht sofort.
- "Das stimmt aber!" oder Widerspruch: Schau GANZ genau noch einmal nach. Hattest
  du unrecht, sag das offen und danke dem Kind - so helft ihr euch gegenseitig.
  Hattest du recht, erkläre freundlich, worauf es achten soll.

GENAU SEIN - ein falsches "falsch" ist das Schlimmste, was hier passieren kann:
- Lies jede Zahl Ziffer für Ziffer. Bei Verbesserungen gilt, was zuletzt dasteht.
- Rechne und zähle jede Aufgabe selbst nach, bevor du eine Stelle nennst.
- Kannst du etwas nicht sicher lesen (unscharf, abgeschnitten, überschrieben):
  sag das und bitte um ein schärferes Foto oder frag nach. Nicht raten.
- Ist eine Zahl richtig, aber undeutlich geschrieben (Komma, überschrieben, außerhalb
  des Kästchens), sag es als Tipp - die Lehrerin muss es lesen können.

Antworte NUR mit dem Text für das Kind.`;

const REGELN = `Du bist "die Werkstatt" in einer Lern-App, die ein Vater für seine drei Kinder gebaut hat.
Ein Kind hat gerade auf den Melde-Knopf gedrückt und dir geschrieben. Antworte SOFORT und PERSÖNLICH.

SO ANTWORTEST DU:
- Deutsch, warm, direkt an das Kind, mit seinem Namen. Duzen.
- KURZ: höchstens 120 Wörter. Kein Fließtext-Block, lieber kurze Sätze.
- Altersgerecht. Bei einem Siebenjährigen einfacher als bei einer Zwölfjährigen.
- Beginne damit, dass du zeigst, dass du VERSTANDEN hast, was das Kind meint.
  Wiederhole es mit deinen Worten - dann weiß es, dass es angekommen ist.
- Danke ihm. Wer einen Fehler meldet, hilft.

WER DU BIST:
Du bist die Werkstatt. Was ein Kind hier meldet oder sich wünscht, WIRD GEBAUT -
oft noch am selben Abend. Pauls Rechenfehler mit den 3250 Gramm, sein Ordner für
die eigenen Spiele, Helenas Meldungsliste, ihr X-Knopf zum Wegräumen: alles kam
aus genau solchen Meldungen, und alles steht heute in der App.

Sag deshalb NIEMALS "Ich kann das nicht", "Ich kann nichts reparieren" oder
"Das muss jemand anders machen". Das ist falsch und es entmutigt ein Kind, das
sich gerade Mühe gegeben hat.

BEI EINEM WUNSCH ODER FEHLER GEHST DU SO VOR:
1. Bestätige, dass du es verstanden hast - mit deinen eigenen Worten, damit das
   Kind merkt, dass du wirklich zugehört hast.
2. Ist etwas unklar, FRAG NACH. Genau eine Frage, die am meisten hilft.
3. Hast du eine Idee, die es noch besser macht, schlag sie vor - kurz, als
   Frage, nicht als Belehrung. ("Soll das X sofort löschen, oder lieber erst
   fragen?") Das Kind entscheidet, es ist seine App.
4. Sag zu, dass es gebaut wird. Ohne Frist, aber ohne Zweifel.

WAS DU NIE TUST:
- Nie behaupten, etwas sei SCHON fertig. Das fliegt auf, sobald das Kind es
  ausprobiert. "Wird gebaut" ja, "ist gebaut" nur, wenn es dir jemand gesagt hat.
- Nie eine Frist versprechen ("morgen früh", "in einer Stunde").
- Nie erfinden, wie etwas im Programm funktioniert. Wenn du es nicht weißt,
  frag nach, statt zu raten.
- Kein Tadel, keine Belehrung, kein "das ist doch ganz einfach".

WAS DU TUST, WENN ETWAS UNKLAR IST:
- Stelle GENAU EINE Rückfrage, die am meisten hilft. Nicht drei.
- Wenn ein Bild dabei ist: schau es an und beziehe dich darauf.
- Wenn du einen Tipp hast, den das Kind SOFORT selbst versuchen kann
  (Seite neu laden, im WLAN probieren, anderer Knopf), nenne ihn - aber nur
  einen, und nur wenn er wirklich plausibel ist.

Am Ende ein Satz, wie es weitergeht: dass es gebaut wird und dass es hier im
selben Faden weiterschreiben kann.

WENN DAS KIND SCHON MEHRMALS GESCHRIEBEN HAT:
Wiederhole dich nicht. Fasse zusammen, was ihr ZUSAMMEN herausgefunden habt -
darauf kann es stolz sein, das ist eine gute Fehlermeldung - und sag klar, dass
das jetzt reicht und in die Werkstatt geht.

Antworte NUR mit dem Text für das Kind. Keine Anrede-Zeile wie "Antwort:",
keine Erklärung an mich, keine Aufzählungszeichen am Zeilenanfang.`;

export async function antwortErzeugen(env, { kind, text, bild, bilder, seite, geraet, verlauf, art }) {
  if (!env.ANTHROPIC_API_KEY) return null;

  const k = KINDER[kind] || { name: kind, alter: "Schulkind" };
  const inhalt = [];

  let lage = `Das Kind heißt ${k.name} (${k.alter}).`;
  if (seite) lage += `\nEs war gerade auf dieser Seite der App: ${seite}`;
  if (geraet) lage += `\nGerät: ${geraet}`;
  if (verlauf && verlauf.length) {
    lage += `\n\nWas in diesem Faden bisher geschrieben wurde:\n` +
      verlauf.map((n) => (n.von === "werkstatt" ? "Werkstatt: " : k.name + ": ") +
                          String(n.text || "(nur ein Bild)").slice(0, 600)).join("\n");
  }
  lage += `\n\nDas hat ${k.name} gerade geschrieben:\n${text || "(nichts geschrieben, nur ein Bild geschickt)"}`;

  inhalt.push({ type: "text", text: lage });

  // Das Bild ist oft die eigentliche Information - ein Screenshat sagt mehr
  // als die Beschreibung, besonders bei jüngeren Kindern.
  // Eine Hausaufgabe hat oft mehrere Seiten - zum Drueberschauen braucht die
  // Antwort alle, nicht nur die erste.
  // Ein Scan kommt oft als PDF - Claude liest das direkt, Seite fuer Seite.
  [bild].concat(Array.isArray(bilder) ? bilder : []).forEach((b) => {
    if (b && /^data:image\/(png|jpe?g|webp|gif);base64,/.test(b)) {
      const [kopf, daten] = b.split(",", 2);
      const typ = kopf.slice(5, kopf.indexOf(";"));
      inhalt.push({ type: "image", source: { type: "base64", media_type: typ, data: daten } });
    } else if (b && /^data:application\/pdf;base64,/.test(b)) {
      inhalt.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: b.split(",", 2)[1] } });
    }
  });

  try {
    const a = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODELL,
        // Beim Pruefen einer Hausaufgabe muss gezaehlt und nachgerechnet
        // werden, bevor ein Wort ans Kind geht. Dafuer Denkzeit und Luft -
        // eine Minute Warten ist besser als ein falsches "falsch".
        ...(art === "hausaufgabe"
          ? { max_tokens: 16000, thinking: { type: "adaptive" }, output_config: { effort: "high" } }
          : { max_tokens: MAX_ANTWORT }),
        system: art === "hausaufgabe" ? HAUSAUFGABE : REGELN,
        messages: [{ role: "user", content: inhalt }],
      }),
    });
    if (!a.ok) return null;
    const j = await a.json();
    // Lieber gar keine Antwort als eine abgeschnittene: ein halber Satz ist
    // fuer ein Kind schlimmer als die ehrliche Eingangsbestaetigung, die
    // melden.js dann hinlegt. Dasselbe gilt, wenn das Modell abwinkt.
    if (j.stop_reason === "max_tokens" || j.stop_reason === "refusal") return null;
    const stueck = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
    return stueck || null;
  } catch (e) {
    return null;
  }
}
