// Namen in Leons Spielen richten.
//
// Leon am 09.09.2026 (Meldungen c75z9z49k5, fqhdfzd8ij): Ein Torwart mit Namen
// heisst Leon, ein zweiter heisst Theo. Das stand nur als Bitte im Auftrag an
// Claude - und am 14.09.2026 stand trotzdem "Tom" im Tor. Eine Bitte ist keine
// Pruefung. Deshalb wird hier nachgezogen, und zwar an zwei Stellen:
//   - beim Bauen (spiel-bauen.js), bevor ein neues Spiel gespeichert wird
//   - beim Ausliefern (spiele.js), damit auch die alten Spiele stimmen
// Beides ist dieselbe Funktion und aendert nichts, was schon richtig ist.
//
// Denny am 14.09.2026: Paul (Bruder), Helena (Schwester) und Xaver (Nachbar)
// sollen als Figuren vorkommen - sie ersetzen die ausgedachten Kindernamen.

export const TORHUETER = ["Leon", "Theo"];
const JUNGEN_FELD = ["Paul", "Xaver"];
const MAEDCHEN_FELD = ["Helena"];

// Kindernamen, die Claude gern erfindet. Bewusst ohne Woerter, die im Deutschen
// auch etwas anderes bedeuten (Jan = Januar, Mark, Martin, Nikolaus, Rose).
const JUNGEN = ("Tom Tim Timo Max Ben Finn Fynn Jonas Lukas Luca Luka Noah Elias Felix Emil " +
  "Anton Jakob Moritz Julian David Leo Niklas Nico Niko Ole Mats Lars Erik Samuel Simon Oskar " +
  "Karl Henri Henry Linus Mika Milan Luis Louis Philipp Florian Tobias Kilian Robin Marco Mario " +
  "Kevin Lennard Lennart Jannik Hannes Johannes Fritz Otto Bruno Levi Liam Matteo Emilio " +
  "Vincent Valentin Jonathan Benedikt Sven Lasse Malte Nils Till Leopold Konrad Aaron Adrian " +
  "Fabian Dominik Daniel Lenny Jona Joshua Mattis Hugo Carlo Ludwig").split(" ");
const MAEDCHEN = ("Mia Emma Lena Anna Hannah Hanna Lea Leonie Marie Sophie Sofia Lina Ella " +
  "Clara Klara Ida Emilia Lara Laura Lisa Sarah Sara Julia Nele Paula Frieda Greta Maja Mila " +
  "Luisa Johanna Amelie Charlotte Pia Lotta Ronja Jana Nina Zoe Lilly Lilli Mathilda Emely " +
  "Marlene Merle Finja Carla Luna Elif Selin Alina Tina Katja Svenja Kim").split(" ");

const VOR_ERWACHSEN = /(Trainer|Trainerin|Schiedsrichter|Schiedsrichterin|Coach|Herr|Frau|Opa|Oma|Onkel|Tante|Papa|Mama|Kapitän|Kapitänin|Zeugwart|Platzwart)\s+$/;

const B = "(?<![\\p{L}\\p{N}])";          // davor kein Buchstabe
const E = "(?![\\p{L}\\p{N}])";           // danach kein Buchstabe
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TORWORT = "(?:Torwart|Torhüter|Torhueter|Torfrau|Torwärtin|Keeper)(?:in)?";
const HALTEN = "(?:hält|hielt|halten|hielten|pariert|parierte|hütet|hütete|wehrt|wehrte|fängt|fing|steht im Tor|stand im Tor|ist Torwart|ist im Tor|ist unser Torwart|im Tor)";

function nameRe(n) { return new RegExp(B + esc(n) + "(s)?" + E, "gu"); }

function istTorwart(text, n) {
  const N = esc(n) + "s?";
  const muster = [
    TORWORT + "\\s+" + N + E,                                   // Torwart Tom
    B + N + "\\s*,?\\s*(?:der|die|unser|unsere|ein|eine)?\\s*" + TORWORT,  // Tom, der Torwart
    B + N + "\\s+" + HALTEN + E,                                // Tom hält
    B + N + "\\s+(?:hat|hatte)\\s+[^.!?\\n]{0,40}?(?:gehalten|pariert|abgewehrt|gefangen)", // Tom hat 5 Bälle gehalten
    B + N + "\\s+(?:gehaltene|Paraden)",
    "(?:hält|hielt|pariert|parierte)\\s+" + N + E,              // Wie viele Bälle hält Tom?
  ];
  return muster.some((m) => new RegExp(m, "u").test(text));
}

// Liefert fuer einen Text die Kindernamen, die dort vorkommen (ohne Erwachsene).
function kindernamen(text, liste) {
  const gefunden = [];
  for (const n of liste) {
    const re = nameRe(n);
    let m;
    while ((m = re.exec(text))) {
      if (VOR_ERWACHSEN.test(text.slice(Math.max(0, m.index - 20), m.index))) continue;
      if (!gefunden.includes(n)) gefunden.push(n);
    }
  }
  return gefunden;
}

function ersetzen(text, von, nach) {
  return String(text).replace(nameRe(von), (treffer, gen, pos, ganz) => {
    if (VOR_ERWACHSEN.test(ganz.slice(Math.max(0, pos - 20), pos))) return treffer;
    return nach + (gen ? (/[sxz]$/.test(nach) ? "'" : "s") : "");
  });
}

// Alle Texte einer Aufgabe, als Liste von [objekt, schluessel].
function felder(a) {
  const f = [];
  for (const k of ["frage", "richtig", "erklaerung", "merke", "weg"]) if (typeof a[k] === "string") f.push([a, k]);
  (a.antworten || []).forEach((_, i) => f.push([a.antworten, i]));
  (a.diagnosen || []).forEach((d) => { if (d) { f.push([d, "antwort"]); f.push([d, "hinweis"]); } });
  (a.teilschritte || []).forEach((s) => { if (s) { f.push([s, "frage"]); f.push([s, "richtig"]); } });
  return f.filter(([o, k]) => typeof o[k] === "string");
}

function richteGruppe(liste, protokoll, wo) {
  const text = liste.map(([o, k]) => o[k]).join("\n");
  const plan = [];
  const belegt = new Set([...TORHUETER, ...JUNGEN_FELD, ...MAEDCHEN_FELD]
    .filter((n) => new RegExp(B + n + "s?" + E, "u").test(text)));

  const fremde = [
    ...kindernamen(text, JUNGEN).map((n) => [n, "m"]),
    ...kindernamen(text, MAEDCHEN).map((n) => [n, "w"]),
  ];
  // Torhueter zuerst verteilen, damit Leon an den ersten geht.
  fremde.sort((x, y) => Number(istTorwart(text, y[0])) - Number(istTorwart(text, x[0])));

  for (const [n, geschlecht] of fremde) {
    const tor = istTorwart(text, n);
    const vorrat = tor ? TORHUETER : (geschlecht === "w" ? MAEDCHEN_FELD : JUNGEN_FELD);
    const nach = vorrat.find((x) => !belegt.has(x));
    if (!nach) { protokoll.push({ wo, von: n, nach: null, torwart: tor }); continue; }
    belegt.add(nach);
    plan.push([n, nach]);
    protokoll.push({ wo, von: n, nach, torwart: tor });
  }
  if (!plan.length) return;
  for (const [o, k] of liste) {
    let t = o[k];
    for (const [von, nach] of plan) t = ersetzen(t, von, nach);
    o[k] = t;
  }
}

// Richtet das Spiel an Ort und Stelle und gibt zurueck, was geaendert wurde.
export function namenRichten(spiel) {
  const protokoll = [];
  if (!spiel || typeof spiel !== "object") return protokoll;
  (spiel.aufgaben || []).forEach((a, i) => { if (a) richteGruppe(felder(a), protokoll, "Aufgabe " + (i + 1)); });
  const kopf = ["titel", "begruessung"].filter((k) => typeof spiel[k] === "string").map((k) => [spiel, k]);
  if (kopf.length) richteGruppe(kopf, protokoll, "Kopf");
  return protokoll;
}
