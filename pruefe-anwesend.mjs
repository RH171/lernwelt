// Selbsttest fuer das Anwesenheitsband (19.09.2026).
//
//   node lernwelt/pruefe-anwesend.mjs
//
// Laeuft ohne Netz, ohne Cloudflare und ohne echten Speicher: Der KV wird durch
// eine Attrappe ersetzt, die jeden Schreibvorgang mitzaehlt. Damit laesst sich
// genau das pruefen, worauf es hier ankommt - dass NICHT staendig geschrieben
// wird. Schreibvorgaenge sind in dieser Lernwelt die knappe Groesse (1000 am
// Tag), nicht der Platz.
//
// Rueckgabe 0 = alles sauber, 1 = es hakt.

import { berlinZeit, blockUhrzeit, bloeckeLesen, anwesendVermerken, anwesendLesen,
         letzteTage, BLOECKE_PRO_TAG } from "./functions/api/_anwesend.js";

let fehler = 0;
const pruefe = (name, bedingung, zusatz) => {
  if (bedingung) return;
  fehler++;
  console.log("  FEHLT: " + name + (zusatz ? "  (" + zusatz + ")" : ""));
};

// Ein KV, der mitzaehlt. put/delete sind Schreibvorgaenge, get nicht.
function kvAttrappe() {
  const inhalt = new Map();
  const zaehler = { get: 0, put: 0 };
  return {
    zaehler, inhalt,
    env: {
      PAUL_KV: {
        async get(k) { zaehler.get++; return inhalt.has(k) ? inhalt.get(k) : null; },
        async put(k, v) { zaehler.put++; inhalt.set(k, v); },
        async delete(k) { zaehler.put++; inhalt.delete(k); },
      },
    },
  };
}

// Ein fester Zeitpunkt in deutscher Sommerzeit: 19.09.2026, 08:37 Ortszeit.
const MS = (iso) => new Date(iso).getTime();

console.log("Zeitrechnung");
{
  const z = berlinZeit(MS("2026-09-19T06:37:00Z"));   // = 08:37 Berlin (MESZ)
  pruefe("Sommerzeit: richtiger Tag", z.tag === "2026-09-19", z.tag);
  pruefe("Sommerzeit: 08:37 -> Block 34", z.block === 34, String(z.block));

  // Winterzeit: UTC+1. 07:37 UTC = 08:37 Berlin.
  const w = berlinZeit(MS("2026-12-19T07:37:00Z"));
  pruefe("Winterzeit: 08:37 -> Block 34", w.block === 34, String(w.block));

  // Der Grund fuer die ganze Zeitzonen-Rechnerei: Um 00:30 deutscher
  // Sommerzeit ist es in UTC noch der Vortag. "Heute" muss Dennys Tag sein.
  const n = berlinZeit(MS("2026-09-19T22:30:00Z"));   // = 20.09. 00:30 Berlin
  pruefe("Nach Mitternacht zaehlt der deutsche Tag", n.tag === "2026-09-20", n.tag);
  pruefe("00:30 -> Block 2", n.block === 2, String(n.block));

  // Mitternacht selbst darf nicht Block 96 werden (hourCycle-Falle).
  const m = berlinZeit(MS("2026-09-18T22:00:00Z"));   // = 19.09. 00:00 Berlin
  pruefe("Mitternacht -> Block 0", m.block === 0, String(m.block));
  pruefe("Block bleibt im Tag", m.block >= 0 && m.block < BLOECKE_PRO_TAG);

  pruefe("Unsinn gibt null", berlinZeit(NaN) === null);
}

console.log("Uhrzeit einer Viertelstunde");
{
  pruefe("Block 0 = 0:00", blockUhrzeit(0) === "0:00", blockUhrzeit(0));
  pruefe("Block 34 = 8:30", blockUhrzeit(34) === "8:30", blockUhrzeit(34));
  pruefe("Block 95 = 23:45", blockUhrzeit(95) === "23:45", blockUhrzeit(95));
  /* Pruefrunde 01: Block 96 gibt es als ENDE des Tages. Wer von 23:45 bis
     Mitternacht da war, war "23:45 bis 24:00" da - vorher stand dort
     "23:45 bis 23:45", was sich wie "gar nicht" liest. */
  pruefe("Block 96 = 24:00 (Tagesende)", blockUhrzeit(96) === "24:00", blockUhrzeit(96));
  pruefe("zu grosser Block wird auf 24:00 gedeckelt", blockUhrzeit(999) === "24:00", blockUhrzeit(999));
}

console.log("Gespeichertes einlesen");
{
  pruefe("leer", bloeckeLesen(null).length === 0);
  pruefe("kaputtes JSON wirft nicht", bloeckeLesen("{nicht json").length === 0);
  pruefe("fremdes Format wirft nicht", bloeckeLesen('"text"').length === 0);
  pruefe("altes Objektformat wirft nicht", bloeckeLesen('{"l":[3],"d":[4]}').length === 0);
  const b = bloeckeLesen('[5,3,3,999,-1,"7"]');
  pruefe("sortiert und entdoppelt", JSON.stringify(b) === "[3,5,7]", JSON.stringify(b));
  pruefe("Bloecke ausserhalb fliegen raus", !b.includes(999) && !b.includes(-1));
  // Pruefrunde 01: Number(true) ist 1 - das waere erfundene Anwesenheit um 0:15.
  pruefe("true/false sind keine Bloecke", bloeckeLesen("[true,false]").length === 0,
         JSON.stringify(bloeckeLesen("[true,false]")));
}

console.log("Sparsamkeit - das Wichtigste");
{
  const k = kvAttrappe();
  const start = MS("2026-09-19T06:37:00Z");           // 08:37 Berlin, Block 34

  // Ein Kind spielt zwei Stunden. lernstand.js pulst alle 3 Minuten, dazu
  // kommt jeder Seitenwechsel - nehmen wir 90 Sekunden Abstand, also 80 Pulse.
  for (let i = 0; i < 80; i++)
    await anwesendVermerken(k.env, "leon", "lernwelt", start + i * 90000);

  /* Zwei Stunden ab 08:37 beruehren NEUN Viertelstunden, nicht acht: Die erste
     (08:30-08:45) ist angebrochen, die letzte (10:30-10:45) auch. Genau diese
     Erwartung hatte ich beim ersten Lauf falsch - der Code hatte recht.
     Worauf es ankommt, ist die Groessenordnung: 9 statt 80. */
  pruefe("zwei Stunden kosten 9 Schreibvorgaenge, nicht 80",
         k.zaehler.put === 9, k.zaehler.put + " Schreibvorgaenge");

  const band = await anwesendLesen(k.env, "leon", "2026-09-19");
  pruefe("neun Viertelstunden vermerkt", band.lernwelt.length === 9, String(band.lernwelt.length));
  pruefe("endet bei 10:30 -> Block 42", band.lernwelt[band.lernwelt.length - 1] === 42,
         String(band.lernwelt[band.lernwelt.length - 1]));
  pruefe("beginnt bei 08:37 -> Block 34", band.lernwelt[0] === 34, String(band.lernwelt[0]));

  // Derselbe Block noch einmal schreibt nicht.
  const vorher = k.zaehler.put;
  await anwesendVermerken(k.env, "leon", "lernwelt", start);
  pruefe("gleiche Viertelstunde schreibt nicht erneut", k.zaehler.put === vorher);
}

console.log("Lernwelt und Duell bleiben getrennt");
{
  const k = kvAttrappe();
  const t = MS("2026-09-19T06:37:00Z");
  await anwesendVermerken(k.env, "paul", "lernwelt", t);
  await anwesendVermerken(k.env, "paul", "duell", t);
  const b = await anwesendLesen(k.env, "paul", "2026-09-19");
  pruefe("beide Quellen im selben Block", b.lernwelt.includes(34) && b.duell.includes(34),
         JSON.stringify(b));
  pruefe("zwei Quellen = zwei Schreibvorgaenge", k.zaehler.put === 2, String(k.zaehler.put));

  // Unbekannte Quelle zaehlt als Lernwelt, nicht als drittes Feld.
  const k2 = kvAttrappe();
  await anwesendVermerken(k2.env, "paul", "irgendwas", t);
  const b2 = await anwesendLesen(k2.env, "paul", "2026-09-19");
  pruefe("unbekannte Quelle -> Lernwelt", b2.lernwelt.includes(34) && b2.duell.length === 0);
}

console.log("Kinder haben getrennte Baender");
{
  const k = kvAttrappe();
  const t = MS("2026-09-19T06:37:00Z");
  await anwesendVermerken(k.env, "leon", "lernwelt", t);
  const helena = await anwesendLesen(k.env, "helena", "2026-09-19");
  pruefe("Helena erbt nichts von Leon", helena.lernwelt.length === 0, JSON.stringify(helena));
}

console.log("Voller Speicher wuergt nichts ab");
{
  const env = { PAUL_KV: {
    async get() { return null; },
    async put() { throw new Error("KV put() limit exceeded for the day."); },
  } };
  let geflogen = false;
  try { await anwesendVermerken(env, "leon", "lernwelt", Date.now()); }
  catch (e) { geflogen = true; }
  pruefe("Schreibfehler wird gefangen", !geflogen);

  // Auch ein kaputter get darf den Puls nicht mitreissen.
  const env2 = { PAUL_KV: { async get() { throw new Error("weg"); }, async put() {} } };
  let geflogen2 = false;
  try { await anwesendVermerken(env2, "leon", "lernwelt", Date.now()); }
  catch (e) { geflogen2 = true; }
  pruefe("Lesefehler wird gefangen", !geflogen2);

  pruefe("ohne Speicher passiert nichts",
         (await anwesendVermerken({}, "leon", "lernwelt", Date.now())).geschrieben === false);
}

console.log("Die letzten Tage");
{
  const t = letzteTage(7, MS("2026-09-19T10:00:00Z"));
  pruefe("sieben Tage", t.length === 7, String(t.length));
  pruefe("heute zuerst", t[0] === "2026-09-19", t[0]);
  pruefe("gestern danach", t[1] === "2026-09-18", t[1]);
  pruefe("keine Doppelten", new Set(t).size === t.length);

  // Ueber die Zeitumstellung hinweg (25.10.2026, Rueckstellung) darf kein Tag
  // fehlen oder doppelt vorkommen.
  const u = letzteTage(5, MS("2026-10-26T10:00:00Z"));
  pruefe("Zeitumstellung: fuenf verschiedene Tage", new Set(u).size === 5, JSON.stringify(u));
  pruefe("Zeitumstellung: lueckenlos",
         JSON.stringify(u) === '["2026-10-26","2026-10-25","2026-10-24","2026-10-23","2026-10-22"]',
         JSON.stringify(u));
}

/* ---------------------------------------------------------------------------
   Was Pruefrunde 01 (19.09.2026) gefunden hat. Jeder dieser Tests ist ohne die
   zugehoerige Reparatur rot - sonst waere er keine Pruefung. */

console.log("Zeitumstellung: kein Tag darf verschwinden");
{
  // Der 29.03.2026 hat nur 23 Stunden. Mit festen 24-Stunden-Schritten fiel er
  // zwischen 00:00 und 01:00 deutscher Zeit ganz aus der Liste - bei weiterhin
  // sieben Eintraegen, es sah also nichts kaputt aus.
  const v = letzteTage(3, MS("2026-03-29T22:30:00Z"));   // 30.03. 00:30 Berlin
  pruefe("29.03. fehlt nicht",
         JSON.stringify(v) === '["2026-03-30","2026-03-29","2026-03-28"]', JSON.stringify(v));

  // Achtung beim Umrechnen: Am 25.10. wird zurueckgestellt, ab 03:00 gilt
  // wieder UTC+1. 22:00 UTC ist also erst 23:00 Berlin - noch derselbe Tag.
  // Fuer Mitternacht Berlin braucht es 23:00 UTC. (Diese Erwartung hatte ich
  // beim ersten Lauf falsch; der Code hatte recht.)
  const r = letzteTage(3, MS("2026-10-25T23:00:00Z"));   // 26.10. 00:00 Berlin
  pruefe("nach der Rueckstellung drei Tage",
         JSON.stringify(r) === '["2026-10-26","2026-10-25","2026-10-24"]', JSON.stringify(r));

  // Ein ganzes Jahr stuendlich durchfahren: nie eine Luecke, nie eine Doppelte,
  // immer die verlangte Anzahl.
  let schief = 0;
  for (let h = 0; h < 366 * 24; h++) {
    const l = letzteTage(7, MS("2026-01-01T00:00:00Z") + h * 3600000);
    if (l.length !== 7 || new Set(l).size !== 7) { schief++; continue; }
    for (let i = 1; i < l.length; i++) {
      const a = new Date(l[i - 1] + "T00:00:00Z"), b = new Date(l[i] + "T00:00:00Z");
      if ((a - b) !== 86400000) { schief++; break; }
    }
  }
  pruefe("ein Jahr stuendlich: immer sieben lueckenlose Tage", schief === 0, schief + " Ausreisser");
}

console.log("Kein Muell im Speicher");
{
  const k = kvAttrappe();
  const t = MS("2026-09-19T06:37:00Z");
  // Ein unbekannter Kindname legte vorher einen Schluessel an, der 45 Tage steht.
  for (const falsch of ["", null, undefined, "eltern", "a:b", "LEON "]) {
    await anwesendVermerken(k.env, falsch, "lernwelt", t);
  }
  pruefe("unbekannte Kinder schreiben nichts", k.zaehler.put === 0,
         k.zaehler.put + " Schreibvorgaenge, Schluessel: " + JSON.stringify([...k.inhalt.keys()]));

  // Grossschreibung soll aber gehen - dasselbe Kind, nicht ein zweites Band.
  await anwesendVermerken(k.env, "LEON", "lernwelt", t);
  const b = await anwesendLesen(k.env, "leon", "2026-09-19");
  pruefe("LEON und leon sind dasselbe Kind", b.lernwelt.includes(34), JSON.stringify(b));

  // Ein ISO-String wurde vorher still als "jetzt" gedeutet - der Eintrag landete
  // dann im falschen Tag, ohne dass jemand etwas merkt.
  const k2 = kvAttrappe();
  const a = await anwesendVermerken(k2.env, "leon", "lernwelt", "2026-09-19T06:37:00Z");
  pruefe("ISO-String wird abgewiesen, nicht als jetzt gedeutet",
         !a.geschrieben && k2.zaehler.put === 0, JSON.stringify(a));
}

console.log("Ein Speicherfehler ist keine Abwesenheit");
{
  // Der schwerste Fund: Vorher gab ein kaputter Speicher ein leeres Band
  // zurueck, und der Elternbereich druckte "war nicht da" als Tatsache.
  const env = { PAUL_KV: { async get() { throw new Error("weg"); }, async put() {} } };
  const b = await anwesendLesen(env, "leon", "2026-09-19");
  pruefe("Lesefehler wird als unsicher gemeldet", b.unsicher === true, JSON.stringify(b));

  const k = kvAttrappe();
  const gut = await anwesendLesen(k.env, "leon", "2026-09-19");
  pruefe("ohne Fehler ist nichts unsicher", gut.unsicher === false, JSON.stringify(gut));

  pruefe("ohne Speicher ist es unsicher",
         (await anwesendLesen({}, "leon", "2026-09-19")).unsicher === true);

  // Auch beim Schreiben muss der Grund durchkommen.
  const envVoll = { PAUL_KV: {
    async get() { return null; },
    async put() { throw new Error("KV put() limit exceeded for the day."); } } };
  const s = await anwesendVermerken(envVoll, "leon", "lernwelt", Date.now());
  pruefe("voller Speicher meldet den Grund", !!s.fehler, JSON.stringify(s));
}

console.log("Der Wettlauf trifft nicht mehr beide Quellen");
{
  // Vorher stand der ganze Tag in EINEM Eintrag: Lernwelt- und Duell-Puls
  // ueberschrieben sich gegenseitig, im Test verschwanden 45 Minuten.
  const k = kvAttrappe();
  const t = MS("2026-09-19T06:37:00Z");
  for (let i = 0; i < 4; i++) await anwesendVermerken(k.env, "leon", "lernwelt", t + i * 900000);
  await anwesendVermerken(k.env, "leon", "duell", t);
  const b = await anwesendLesen(k.env, "leon", "2026-09-19");
  pruefe("Duell-Puls loescht die Lernwelt-Bloecke nicht",
         b.lernwelt.length === 4 && b.duell.length === 1, JSON.stringify(b));
  pruefe("getrennte Schluessel je Quelle",
         [...k.inhalt.keys()].some((x) => x.endsWith(":lernwelt")) &&
         [...k.inhalt.keys()].some((x) => x.endsWith(":duell")),
         JSON.stringify([...k.inhalt.keys()]));
}

console.log("Duell: wer ist gemeint?");
{
  /* welchesKind() steckt in duell/index.html in einer IIFE und ist von aussen
     nicht aufrufbar. Statt die Logik hier nachzubauen - was nur eine Kopie
     pruefen wuerde - wird die echte Funktion aus der Datei geholt und
     ausgefuehrt. Findet sie sich nicht mehr, ist das selbst ein Fehler. */
  const { readFileSync } = await import("node:fs");
  const quelle = readFileSync(new URL("./duell/index.html", import.meta.url), "utf8");
  const m = quelle.match(/var KINDERNAMEN = \[[^\]]*\];[\s\S]*?\n  \}/);
  pruefe("welchesKind ist in duell/index.html auffindbar", !!m);
  if (m) {
    const welchesKind = new Function(m[0] + "; return welchesKind;")();
    // Was gehen muss:
    pruefe('"Torwart Leon" -> leon', welchesKind("Torwart Leon") === "leon");
    pruefe('"Leon" -> leon', welchesKind("Leon") === "leon");
    pruefe('"paul" -> paul', welchesKind("paul") === "paul");
    pruefe('"Helena 12" -> helena', welchesKind("Helena 12") === "helena");
    pruefe('"Leon, der Beste" -> leon', welchesKind("Leon, der Beste") === "leon");
    /* Und was NICHT gehen darf. Die erste Fassung nahm indexOf und machte aus
       jedem dieser Gaeste ein Kind in Dennys Anzeige (Pruefrunde 01). Die
       Regel lautet: lieber eine Luecke als ein falscher Name. */
    for (const fremd of ["Leonie", "Napoleon", "Chamäleon", "Paula", "Pauline", "Helenas Freundin"]) {
      const r = welchesKind(fremd);
      pruefe('"' + fremd + '" ist kein Kind', r === null, "wurde zu " + r);
    }
    pruefe("leerer Name gibt null", welchesKind("") === null);
    pruefe("null gibt null", welchesKind(null) === null);
  }
}

console.log(fehler ? "\n" + fehler + " Punkt(e) stimmen nicht." : "\nAlles sauber.");
process.exit(fehler ? 1 : 0);
