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
const MAX_ANTWORT = 700;

const KINDER = {
  paul:   { name: "Paul",   alter: "10 Jahre, 4. Klasse Grundschule" },
  leon:   { name: "Leon",   alter: "7 Jahre, 2. Klasse Grundschule" },
  helena: { name: "Helena", alter: "12 Jahre, 7. Klasse Gymnasium" },
};

const REGELN = `Du bist "die Werkstatt" in einer Lern-App, die ein Vater für seine drei Kinder gebaut hat.
Ein Kind hat gerade auf den Melde-Knopf gedrückt und dir geschrieben. Antworte SOFORT und PERSÖNLICH.

SO ANTWORTEST DU:
- Deutsch, warm, direkt an das Kind, mit seinem Namen. Duzen.
- KURZ: höchstens 120 Wörter. Kein Fließtext-Block, lieber kurze Sätze.
- Altersgerecht. Bei einem Siebenjährigen einfacher als bei einer Zwölfjährigen.
- Beginne damit, dass du zeigst, dass du VERSTANDEN hast, was das Kind meint.
  Wiederhole es mit deinen Worten - dann weiß es, dass es angekommen ist.
- Danke ihm. Wer einen Fehler meldet, hilft.

WAS DU NIE TUST:
- Nie behaupten, etwas sei repariert oder werde gleich repariert. Du kannst
  nichts am Programm ändern. Sag ehrlich: "Ich gebe das weiter" / "Das schaut
  sich jemand an."
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

Am Ende ein Satz, wie es weitergeht: dass du die Meldung im Blick behältst und
dass es hier im selben Faden weiterschreiben kann.

Antworte NUR mit dem Text für das Kind. Keine Anrede-Zeile wie "Antwort:",
keine Erklärung an mich, keine Aufzählungszeichen am Zeilenanfang.`;

export async function antwortErzeugen(env, { kind, text, bild, seite, geraet, verlauf }) {
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
  if (bild && /^data:image\/(png|jpe?g|webp|gif);base64,/.test(bild)) {
    const [kopf, daten] = bild.split(",", 2);
    const typ = kopf.slice(5, kopf.indexOf(";"));
    inhalt.push({ type: "image", source: { type: "base64", media_type: typ, data: daten } });
  }

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
        max_tokens: MAX_ANTWORT,
        system: REGELN,
        messages: [{ role: "user", content: inhalt }],
      }),
    });
    if (!a.ok) return null;
    const j = await a.json();
    const stueck = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
    return stueck || null;
  } catch (e) {
    return null;
  }
}
