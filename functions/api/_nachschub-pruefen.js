/* Geschichten-Nachschub fuer Pauls Generalprobe "D | Lesen" (05.10.2026).
 *
 * Hier stehen der Auftrag an die Werkstatt und die MECHANISCHE Pruefung einer
 * neu geschriebenen Geschichte. Beides liegt in einer eigenen Datei (Unterstrich
 * = keine Adresse), damit pruefe-nachschub.mjs genau dieselbe Pruefung testet,
 * die der Server benutzt.
 *
 * Eine Geschichte, die auch nur eine Regel reisst, wird verworfen - nicht
 * repariert. Eine Bitte im Auftrag ist keine Pruefung.
 */

export const MODELL = "claude-opus-5-5";
export const WOERTER_MIN = 182;
export const WOERTER_MAX = 204;
export const ARTEN = ["frage", "reihenfolge", "anfang", "kreuz", "unterstreichen", "einsetzen", "meinung"];

/* Pauls Lehrerin erlaubt keine Weil-Antworten (04.10.2026): keine Aufgabe darf
 * nach "warum" fragen, "weil" verlangen oder "begruenden" lassen. */
const VERBOTEN_IN_AUFGABEN = /\b(weil|warum|wieso|weshalb|begr[uü]nde\w*|begruende\w*)\b/i;
/* Text von Pauls echtem Uebungsblatt "Der Brief" darf nicht vorkommen. */
const VERBOT_BLATT = ["nuschi", "bibibitsch", "bibibisch", "bibbitisch", "rühreier", "schraubenzieher",
  "ärgere dich nicht", "nachttischlampe", "ruck-pauqu", "geheult", "traurig ohne dich", "der brief"];

export const AUFTRAG =
  "Du schreibst Uebungsgeschichten fuer einen Viertklaessler (Grundschule Bayern), der fuer eine Probe 'Lesen' uebt. " +
  "Schreibe GENAU EINE neue, selbst erfundene Geschichte aus dem Alltag von Kindern (Schule, Familie, Nachbarschaft, Tiere, Natur, Freizeit). " +
  "Freundlich, nicht gruselig, keine Markennamen, keine echten Personen, alle Namen erfunden; NIE die Namen Paul, Leon oder Helena. " +
  "Waehle ein Thema, das zu keinem der schon vorhandenen Titel passt (auch kein aehnliches Tier, keinen aehnlichen Ort). " +
  "LAENGE: 188 bis 198 Woerter, 18 bis 22 Zeilen, JEDE Zeile ist GENAU EIN Satz. Woerter einfach, Saetze kurz. " +
  "Dazu GENAU SIEBEN Aufgaben in genau dieser Reihenfolge und Form:\n" +
  "1 frage: {\"art\":\"frage\",\"frage\":\"W-Frage (Wer/Wo/Was/Wann/Wie)\",\"zeilen\":[Zeile(n) mit der Antwort],\"hinweis\":[von,bis]} - die Antwortzeilen liegen im Hinweis-Bereich.\n" +
  "2 reihenfolge: {\"art\":\"reihenfolge\",\"ereignisse\":[5 Eintraege {\"text\":\"kurzer Satz im Praesens\",\"zeile\":n}]} - in der Reihenfolge des Textes, jeder Text teilt ein Sachwort mit seiner Zeile.\n" +
  "3 anfang: {\"art\":\"anfang\",\"auftrag\":\"Figur schreibt jemandem ... Ergänze den ersten Satz!\",\"anfang\":\"Liebe/Lieber Name,\"} - anfang hoechstens 25 Zeichen.\n" +
  "4 kreuz: {\"art\":\"kreuz\",\"frage\":\"Wie heißt ...?\",\"optionen\":[3 aehnlich klingende Namen],\"richtig\":Index,\"hinweis\":[von,bis]} - nur die Loesung steht im Text, die Ablenker NICHT.\n" +
  "5 unterstreichen: {\"art\":\"unterstreichen\",\"auftrag\":\"Tippe die Sätze an, die verraten, dass ...\",\"zeilen\":[2 Zeilen],\"hinweis\":[von,bis]}\n" +
  "6 einsetzen: {\"art\":\"einsetzen\",\"satz\":\"Satz aus dem Text, ein Wort durch ein Wort mit gleicher Bedeutung ersetzt und mit <u>…</u> markiert\",\"wort\":\"das Originalwort aus dem Text\",\"zeile\":n}\n" +
  "7 meinung: {\"art\":\"meinung\",\"frage\":\"Ja/Nein- oder Was-findest-du-Frage ... Schreibe deine Meinung in einem ganzen Satz.\"}\n" +
  "STRENG VERBOTEN in allen Aufgaben: die Woerter 'warum', 'wieso', 'weshalb', 'weil' und 'begruende'. Die Lehrerin erlaubt keine Weil-Antworten. " +
  "Zeilen zaehlen ab 1. Pruefe jede Zeilenangabe gegen deinen Text. " +
  "Antworte NUR mit JSON: {\"titel\":\"...\",\"zeilen\":[\"...\"],\"aufgaben\":[...]}";

/* Ein Beispiel fuer das Format: die erste feste Geschichte ("drachen", Stand
 * 05.10.2026). Steht hier als Kopie, weil der Server die Browser-Datei
 * generalprobe-geschichten.js nicht laden kann. */
const BEISPIEL = {"titel":"Der Drachen auf dem Garagendach","zeilen":["Am Samstag wehte ein kräftiger Wind über die Siedlung.","Jonas holte seinen roten Drachen aus dem Keller.","Seine Schwester Merle wollte unbedingt mitkommen.","Auf der Wiese hinter den Garagen ließen sie die Schnur langsam laufen.","Der Drachen stieg höher und höher.","Plötzlich kam eine starke Böe von der Seite.","Die Schnur rutschte Jonas aus der Hand.","Der Drachen trudelte und landete auf dem Dach der letzten Garage.","„So ein Mist!“, rief Jonas und stampfte mit dem Fuß auf.","Merle sah sich um und entdeckte Herrn Brodersen in seinem Garten.","Herr Brodersen wohnte neben den Garagen und hatte eine lange Leiter.","Merle klingelte an seinem Tor, obwohl ihr Herz ein bisschen klopfte.","Herr Brodersen lachte und holte sofort die Leiter aus dem Schuppen.","Vorsichtig stieg er hinauf und reichte den Drachen herunter.","Eine Ecke war eingerissen, aber sonst war alles heil.","Zu Hause klebten die Kinder das Loch mit buntem Klebeband zu.","Am Abend bastelte Merle eine kleine Karte für den Nachbarn.","Sie malte einen roten Drachen mit einem bunten Pflaster darauf.","Jonas schrieb darunter mit seiner schönsten Schrift: „Danke für die Rettung!“","Am nächsten Morgen steckten sie die Karte in seinen Briefkasten.","Seitdem winkt Herr Brodersen jedes Mal, wenn der Drachen am Himmel steht."],"aufgaben":[{"art":"frage","frage":"Wer holte den Drachen vom Dach?","zeilen":[13,14],"hinweis":[10,14]},{"art":"reihenfolge","ereignisse":[{"text":"Jonas holt den Drachen aus dem Keller.","zeile":2},{"text":"Die Schnur rutscht Jonas aus der Hand.","zeile":7},{"text":"Merle klingelt beim Nachbarn.","zeile":12},{"text":"Die Kinder kleben das Loch zu.","zeile":16},{"text":"Die Kinder stecken die Karte in den Briefkasten.","zeile":20}]},{"art":"anfang","auftrag":"Merle schreibt Herrn Brodersen ein paar Zeilen auf die Karte. Wie könnte sie anfangen? Ergänze den ersten Satz!","anfang":"Lieber Herr Brodersen,"},{"art":"kreuz","frage":"Wie heißt der Nachbar?","optionen":["Herr Brodersen","Herr Brodmann","Herr Broderich"],"richtig":0,"hinweis":[10,11]},{"art":"unterstreichen","auftrag":"Tippe die Sätze an, die verraten, dass der Wind stark war.","zeilen":[1,6],"hinweis":[1,6]},{"art":"einsetzen","satz":"Der Drachen <u>fiel</u> auf das Dach der letzten Garage.","wort":"landete","zeile":8},{"art":"meinung","frage":"War es richtig, dass Merle beim Nachbarn geklingelt hat? Schreibe deine Meinung in einem ganzen Satz."}]};

/* Der Aufruf an die Werkstatt. titelBekannt = alle Titel, die Paul schon hat.
 * Kein erzwungenes tool_choice (Opus 5.5 lehnt es ab), das Denken zaehlt in
 * max_tokens (24.09.2026), deshalb effort low und reichlich Luft. */
export function anfrageBauen(titelBekannt = []) {
  const frage = "Beispiel fuer das Format (NICHT nacherzaehlen, neues Thema, neue Namen!):\n" + JSON.stringify(BEISPIEL) +
    "\n\nDiese Titel gibt es schon, waehle ein anderes Thema: " + titelBekannt.slice(-40).map((t) => String(t).slice(0, 60)).join(" · ") +
    "\n\nSchreibe jetzt die neue Geschichte.";
  return { model: MODELL, max_tokens: 8000, output_config: { effort: "low" }, system: AUFTRAG,
    messages: [{ role: "user", content: frage }] };
}

const woerter = (s) => (String(s).toLowerCase().match(/[a-zäöüß]+/g) || []);
export const wortzahl = (zeilen) => zeilen.join(" ").split(/\s+/).filter(Boolean).length;

/* Liest das JSON aus der Modellantwort. null, wenn keins drin ist. */
export function geschichteAusText(text) {
  try {
    const m = String(text).match(/\{[\s\S]*\}/);
    const g = JSON.parse(m ? m[0] : "");
    return g && typeof g === "object" ? g : null;
  } catch (e) { return null; }
}

/* Liefert die Liste der gerissenen Regeln. Leer = die Geschichte darf zu Paul. */
export function pruefeGeschichte(g, titelBekannt = []) {
  const f = [];
  const fehl = (b, text) => { if (!b) f.push(text); return b; };
  if (!fehl(g && typeof g.titel === "string" && g.titel.trim() && g.titel.length <= 60, "Titel fehlt")) return f;
  if (!fehl(Array.isArray(g.zeilen) && g.zeilen.every((z) => typeof z === "string" && z.trim()), "Zeilen fehlen")) return f;
  if (!fehl(Array.isArray(g.aufgaben), "Aufgaben fehlen")) return f;
  const n = g.zeilen.length;
  fehl(n >= 16 && n <= 24, "16-24 Zeilen (" + n + ")");
  fehl(g.zeilen.every((z) => z.length <= 160), "eine Zeile ist zu lang");
  const wz = wortzahl(g.zeilen);
  fehl(wz >= WOERTER_MIN && wz <= WOERTER_MAX, WOERTER_MIN + "-" + WOERTER_MAX + " Wörter (" + wz + ")");
  const ganz = (g.titel + " " + g.zeilen.join(" ")).toLowerCase();
  for (const v of VERBOT_BLATT) fehl(!ganz.includes(v), "Wort aus Pauls Blatt: " + v);
  // Pauls eigener Name (und die seiner Geschwister) gehoert nicht in eine Uebungsgeschichte.
  fehl(!/\b(paul|leon|helena)s?\b/i.test(g.titel + " " + g.zeilen.join(" ")), "Name eines der Kinder im Text");
  fehl(!titelBekannt.map((t) => String(t).toLowerCase()).includes(g.titel.trim().toLowerCase()), "Titel gibt es schon");
  if (!fehl(g.aufgaben.length === 7, "genau 7 Aufgaben (" + g.aufgaben.length + ")")) return f;
  if (!fehl(g.aufgaben.map((a) => a && a.art).join() === ARTEN.join(), "Arten in fester Reihenfolge")) return f;

  const zeileOk = (z) => Number.isInteger(z) && z >= 1 && z <= n;
  const spanneOk = (h) => Array.isArray(h) && h.length === 2 && zeileOk(h[0]) && zeileOk(h[1]) && h[0] <= h[1];
  for (const a of g.aufgaben) {
    // Alles, was Paul als Aufgabe liest, ohne weil/warum/begruende.
    const lesbar = [a.frage, a.auftrag, a.satz, a.anfang].concat((a.ereignisse || []).map((e) => e && e.text),
      a.optionen || []).filter((x) => x != null).join(" ");
    fehl(!VERBOTEN_IN_AUFGABEN.test(lesbar), a.art + ": weil/warum/begründe in der Aufgabe");
    if ("hinweis" in a) fehl(spanneOk(a.hinweis), a.art + ": Hinweis-Zeilen außerhalb");
    if (a.art === "frage") {
      fehl(typeof a.frage === "string" && a.frage.endsWith("?"), "frage: keine Frage");
      fehl(spanneOk(a.hinweis), "frage: Hinweis fehlt");
      if (fehl(Array.isArray(a.zeilen) && a.zeilen.length && a.zeilen.every(zeileOk), "frage: Antwortzeile außerhalb"))
        fehl(spanneOk(a.hinweis) && a.zeilen.every((z) => z >= a.hinweis[0] && z <= a.hinweis[1]), "frage: Antwortzeile nicht im Hinweis");
    }
    if (a.art === "reihenfolge") {
      const e = a.ereignisse;
      if (!fehl(Array.isArray(e) && e.length >= 4 && e.length <= 5, "reihenfolge: 4-5 Ereignisse")) continue;
      if (!fehl(e.every((x) => x && typeof x.text === "string" && zeileOk(x.zeile)), "reihenfolge: Zeile außerhalb")) continue;
      fehl(e.every((x, i) => i === 0 || e[i - 1].zeile < x.zeile), "reihenfolge: nicht in Textreihenfolge");
      for (const x of e) {
        const zw = woerter(g.zeilen[x.zeile - 1]).filter((w) => w.length >= 5).map((w) => w.slice(0, 4));
        const ew = woerter(x.text).filter((w) => w.length >= 5).map((w) => w.slice(0, 4));
        fehl(ew.some((w) => zw.includes(w)), "reihenfolge: Ereignis passt nicht zu Zeile " + x.zeile);
      }
    }
    if (a.art === "anfang") {
      fehl(typeof a.auftrag === "string" && a.auftrag.trim(), "anfang: Auftrag fehlt");
      fehl(typeof a.anfang === "string" && a.anfang.trim() && a.anfang.length < 30, "anfang: Anfang fehlt oder zu lang");
    }
    if (a.art === "kreuz") {
      if (!fehl(Array.isArray(a.optionen) && a.optionen.length === 3 && a.optionen.every((o) => typeof o === "string" && o.trim())
        && Number.isInteger(a.richtig) && a.optionen[a.richtig], "kreuz: drei Optionen mit Lösung")) continue;
      fehl(new Set(a.optionen).size === 3, "kreuz: Option doppelt");
      fehl(spanneOk(a.hinweis), "kreuz: Hinweis fehlt");
      const r = a.optionen[a.richtig];
      fehl(ganz.includes(r.toLowerCase()), "kreuz: Lösung steht nicht im Text");
      for (const o of a.optionen) if (o !== r) {
        const re = new RegExp("(^|[^a-zäöüß])" + o.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^a-zäöüß])");
        fehl(!re.test(ganz), "kreuz: Ablenker steht im Text (" + o + ")");
      }
    }
    if (a.art === "unterstreichen") {
      fehl(typeof a.auftrag === "string" && a.auftrag.trim(), "unterstreichen: Auftrag fehlt");
      if (fehl(Array.isArray(a.zeilen) && a.zeilen.length >= 1 && a.zeilen.length <= 3 && a.zeilen.every(zeileOk), "unterstreichen: Zeile außerhalb"))
        fehl(new Set(a.zeilen).size === a.zeilen.length, "unterstreichen: Zeile doppelt");
    }
    if (a.art === "einsetzen") {
      if (!fehl(zeileOk(a.zeile) && typeof a.wort === "string" && typeof a.satz === "string", "einsetzen: Zeile außerhalb")) continue;
      fehl(woerter(g.zeilen[a.zeile - 1]).includes(a.wort.toLowerCase()), "einsetzen: Lösungswort steht nicht in seiner Zeile");
      const alt = (a.satz.match(/<u>(.*?)<\/u>/) || [])[1];
      fehl(!!alt && (a.satz.match(/<u>/g) || []).length === 1, "einsetzen: kein unterstrichenes Wort");
      fehl(alt && alt.toLowerCase() !== a.wort.toLowerCase(), "einsetzen: unterstrichenes Wort ist schon die Lösung");
      // Ausser <u> kein HTML: der Satz landet in der Seite.
      fehl(!/<(?!\/?u>)/.test(a.satz), "einsetzen: fremdes HTML");
    }
    if (a.art === "meinung") {
      fehl(typeof a.frage === "string" && /ganzen satz/i.test(a.frage), "meinung: verlangt keinen ganzen Satz");
    }
  }
  return f;
}

/* Nur die Felder, die die Seite braucht - nichts Fremdes aus der Modellantwort. */
export function saeubern(g, id) {
  const zahl = (x) => Number(x);
  const spanne = (h) => [zahl(h[0]), zahl(h[1])];
  return {
    id, titel: g.titel.trim(), zeilen: g.zeilen.map((z) => z.trim()),
    aufgaben: g.aufgaben.map((a) => {
      switch (a.art) {
        case "frage": return { art: a.art, frage: a.frage, zeilen: a.zeilen.map(zahl), hinweis: spanne(a.hinweis) };
        case "reihenfolge": return { art: a.art, ereignisse: a.ereignisse.map((e) => ({ text: e.text, zeile: zahl(e.zeile) })) };
        case "anfang": return { art: a.art, auftrag: a.auftrag, anfang: a.anfang };
        case "kreuz": return { art: a.art, frage: a.frage, optionen: a.optionen.slice(), richtig: zahl(a.richtig), hinweis: spanne(a.hinweis) };
        case "unterstreichen": { const o = { art: a.art, auftrag: a.auftrag, zeilen: a.zeilen.map(zahl) }; if (a.hinweis) o.hinweis = spanne(a.hinweis); return o; }
        case "einsetzen": return { art: a.art, satz: a.satz, wort: a.wort, zeile: zahl(a.zeile) };
        default: return { art: "meinung", frage: a.frage };
      }
    }),
  };
}
