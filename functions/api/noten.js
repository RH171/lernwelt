/* Noten je Kind - lesen, eintragen, korrigieren, und ein Blatt auslesen lassen.
 *
 * Alles hier braucht den ELTERNAUSWEIS. Die Kinder sehen ihre Auswertung
 * nicht: Denny am 20.09.2026 zum Noten-Manager - "sie müssen nicht unbedingt
 * sehen, wo die Defizite waren". Eine einzelne Note bekommt das Kind im
 * Hausaufgaben-Heft unkommentiert bestaetigt, mehr nicht.
 *
 *   GET    /api/noten?kind=helena            -> Auswertung je Fach
 *   POST   /api/noten  {kind, note:{...}}    -> anlegen oder aendern (gleiche id)
 *   DELETE /api/noten?kind=helena&id=abc     -> loeschen
 *   POST   /api/noten  {kind, termin:{datum,fach,thema}} / {kind, terminWeg:{datum,fach}}
 *                       {kind, terminAlt:{datum,fach}, termin:{...}}  -> aendern in einem Schreibvorgang
 *          Seit 13.10.2026 auch mit dem KINDERAUSWEIS - nur fuer sich selbst und nur
 *          Termine (kindTermin unten, Grenzen in _probentermine.js).
 *   POST   /api/noten  {kind, kindNote:{fach, note, datum, anlass, id?}}  (15.10.2026)
 *          Mit dem KINDERAUSWEIS: eine zurueckbekommene Note fuer sich selbst
 *          eintragen oder eine geschriebene Probe ("Note kommt noch") ergaenzen.
 *          Neu dazu, alte Seiten senden es nie (kindNoteSetzen unten).
 *   POST   /api/noten  {kind, blatt:"data:…"} -> Notenstand auslesen (kostet Geld,
 *                                               speichert NICHTS, schlaegt nur vor)
 */

import { ausweisGueltig, geheimFuer, besuchIstEltern } from "./_riegel.js";
import { notenLesen, notenSchreiben, notePruefen, auswertung, RECHNUNG, neueId, LN_ARTEN, SCHULAUFGABEN,
         ohneDoppelte, schonDa, vonWem } from "./_noten.js";
import { termineLesen, terminSetzen, terminWeg, terminPruefen, kuenftige, berlinHeute,
         kindSchreiben, terminAendern } from "./_probentermine.js";

const KINDER = ["paul", "leon", "helena"];
const MODELL = "claude-opus-5-5";
const MAX_BLATT = 4 * 1024 * 1024;

const json = (status, daten) =>
  new Response(JSON.stringify(daten), { status, headers: { "content-type": "application/json; charset=utf-8" } });

async function eltern(request, env) {
  // Ohne ELTERN_CODE bleibt der Elternweg zu (dieselbe Pruefung wie im GET).
  const g = geheimFuer(env, "eltern");
  return !!g && ausweisGueltig(request, g, env);
}

/* Das Kind traegt seine angekuendigten Proben selbst ein (13.10.2026).
 * Nur Termine, nur fuer das Kind, dessen Ausweis gilt. Sitzt ein Erwachsener
 * mit dem Hauptschluessel im Kinderbereich (signiertes lw_besuch-Cookie),
 * gelten dieselben Grenzen, der Eintrag heisst dann aber von:"eltern". */
async function kindTermin(request, env, kind, daten) {
  const g = geheimFuer(env, kind);
  if (!g || !(await ausweisGueltig(request, g, env))) return json(401, { ok: false, fehler: "Bitte melde dich an." });
  let besuch = false;
  try { besuch = await besuchIstEltern(request, g); } catch (e) {}
  const heute = berlinHeute();
  let neu = null, alt = null;
  if (daten.termin) {
    const p = terminPruefen(daten.termin, { themaOptional: true });
    if (p.fehler) return json(400, { ok: false, fehler: p.fehler });
    neu = p.termin;
  }
  const altRoh = daten.terminWeg || daten.terminAlt;
  if (altRoh) {
    alt = { datum: String(altRoh.datum || ""), fach: String(altRoh.fach || "").toLowerCase() };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(alt.datum) || !alt.fach) return json(400, { ok: false, fehler: "Welche Probe denn?" });
  }
  if (daten.terminWeg) neu = null;
  try {
    const r = await kindSchreiben(env, kind, { neu, alt, von: besuch ? "eltern" : kind }, heute);
    if (r.fehler) return json(r.status || 400, { ok: false, fehler: r.fehler });
    const termine = kuenftige(r.termine, heute);
    return json(200, { ok: true, geschrieben: r.geschrieben, termine });
  } catch (e) {
    return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Die Probe ist NICHT gespeichert." });
  }
}

/* Die nackten Noten, so wie das Kind sie sieht - keine Auswertung.
 * offen:true = geschrieben, Note kommt noch (15.10.2026). id und von braucht
 * Pauls Eintrag, um eine offene Probe zu ergaenzen. "was" faellt auf den
 * Anlass zurueck, ausser er ist nur der Platzhalter "Leistungsnachweis". */
function eigeneNoten(noten) {
  /* Doppelte (26.10.2026, Kapitel 146): Dieselbe Probe zweimal eingetragen
     zaehlt einmal - auch im Zeugnisplaner und in Helenas Hochrechnung, die
     beide genau diese Liste mitteln. */
  return ohneDoppelte(noten)
    .map((n) => {
      const was = n.was || (n.anlass && n.anlass !== "Leistungsnachweis" ? n.anlass : "");
      const e = { fach: n.fach, note: n.note, datum: n.datum, was };
      if (n.offen && (n.note === undefined || n.note === null)) e.offen = true;
      if (n.id) e.id = n.id;
      if (n.von) e.von = n.von;
      /* Fuer Helenas Hochrechnung (19.10.2026): ob gross oder klein, die Art
         und das doppelte Gewicht (BET). Das sind Angaben zur Note, keine
         Auswertung - gerechnet wird nur auf ihrer eigenen Seite. Fehlen sie,
         steht nichts da (alte Seiten lesen sie nicht). */
      if (n.art === "gross") e.art = "gross";
      if (n.lnArt) e.lnArt = n.lnArt;
      if (n.gewicht === 2) e.gewicht = 2;
      return e;
    })
    .sort((x, y) => String(y.datum || "").localeCompare(String(x.datum || "")));
}

const KIND_FAECHER = ["mathe", "deutsch", "hsu", "englisch", "rel", "musik"];
/* Helena (19.10.2026): ihre Faecher mit den Heft-Schluesseln, wie im Schulheft
   und bei den Pruefungsterminen (Abschnitt "Faecher gegen den Stundenplan"). */
const KIND_FAECHER_JE = {
  helena: ["deutsch", "mathe", "englisch", "franz", "geschichte", "geo", "info", "rel", "musik"],
};
const KIND_NOTEN_TAG = 3;     // hoechstens drei eigene Eintraege am Tag
const KIND_NOTEN_TAG_JE = { helena: 6 };  // Helena: Noten vom Halbjahresanfang nachtragen
const KIND_NOTEN_ZURUECK = 120;

/* Datum einer Note muss im letzten Jahr liegen (28.10.2026). Anlass: Die
 * Mathe-Probe vom 19.10.2026 kam vom Foto als 2016-10-19 herein; die Pruefung
 * sah nur die Form, und die Vorschlagsliste im Elternbereich zeigte nur Tag
 * und Monat. Liegt ein Datum in der Zukunft oder mehr als 365 Tage zurueck,
 * wird derselbe Tag im passenden Jahr gesucht; gibt es keinen, null. */
const NOTE_ZURUECK_TAGE = 365;
function tageVor(heute, tage) {
  return new Date(Date.UTC(+heute.slice(0, 4), +heute.slice(5, 7) - 1, +heute.slice(8, 10) - tage, 12))
    .toISOString().slice(0, 10);
}
function datumImJahr(datum, heute) {
  const frueh = tageVor(heute, NOTE_ZURUECK_TAGE);
  if (datum <= heute && datum >= frueh) return { datum };
  const md = datum.slice(4);
  for (const j of [+heute.slice(0, 4), +heute.slice(0, 4) - 1]) {
    const d = j + md;
    if (d <= heute && d >= frueh && !isNaN(Date.parse(d + "T12:00:00Z"))) return { datum: d, gelesen: datum };
  }
  return null;
}

/* Paul traegt eine zurueckbekommene Note selbst ein (15.10.2026). Grenzen:
 * nur fuer sich selbst, ganze Noten 1-6, Datum heute oder bis 120 Tage
 * zurueck, hoechstens drei Eintraege am Tag. Er darf eine offene Probe
 * ("Note kommt noch") ergaenzen, auch wenn Mama oder Papa sie angelegt
 * haben, und seine EIGENEN Eintraege aendern - eine Note der Eltern nie. */
async function kindNoteSetzen(request, env, kind, roh) {
  const g = geheimFuer(env, kind);
  if (!g || !(await ausweisGueltig(request, g, env))) return json(401, { ok: false, fehler: "Bitte melde dich an." });
  let besuch = false;
  try { besuch = await besuchIstEltern(request, g); } catch (e) {}
  const von = besuch ? "eltern" : kind;

  const fach = String(roh.fach || "").toLowerCase();
  if (!(KIND_FAECHER_JE[kind] || KIND_FAECHER).includes(fach)) return json(400, { ok: false, fehler: "Tipp zuerst auf ein Fach." });
  // Art (19.10.2026, Helena). Freiwillig: Pauls Seite schickt keine.
  const lnArt = LN_ARTEN.includes(String(roh.art || "")) ? String(roh.art) : "";
  const note = Number(roh.note);
  if (!Number.isInteger(note) || note < 1 || note > 6) return json(400, { ok: false, fehler: "Eine Note geht von 1 bis 6." });
  const heute = berlinHeute();
  const datum = String(roh.datum || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) return json(400, { ok: false, fehler: "Wann hast du die Probe geschrieben?" });
  const frueh = new Date(Date.UTC(+heute.slice(0, 4), +heute.slice(5, 7) - 1, +heute.slice(8, 10) - KIND_NOTEN_ZURUECK, 12))
    .toISOString().slice(0, 10);
  if (datum > heute) return json(400, { ok: false, fehler: "Dieser Tag kommt erst noch." });
  if (datum < frueh) return json(400, { ok: false, fehler: "So lange her geht es nicht – frag Mama oder Papa." });
  const anlass = String(roh.anlass || "").slice(0, 40).trim();

  const noten = await notenLesen(env, kind);
  if (noten === null) return json(503, { ok: false, fehler: "Der Speicher antwortet gerade nicht. Die Note ist NICHT gespeichert." });

  const id = String(roh.id || "").replace(/[^a-z0-9]/gi, "").slice(0, 12);
  let i = id ? noten.findIndex((n) => n.id === id) : -1;
  if (id && i < 0) return json(404, { ok: false, fehler: "Diese Probe gibt es nicht (mehr)." });
  if (i >= 0) {
    const n = noten[i];
    const offen = n.offen && (n.note === undefined || n.note === null);
    if (!offen && n.von !== kind) return json(403, { ok: false, fehler: "Diese Note haben Mama oder Papa eingetragen." });
  }
  /* Doppelt (26.10.2026): Ohne id, aber dieselbe Probe steht schon da. Ist sie
     offen ("Note kommt noch"), ergaenzt das Kind sie - wie mit id. Sonst
     kommt die Warnung, ausser es sagt ausdruecklich "trotzdem". */
  if (i < 0) {
    const vorhanden = roh.trotzdem === true ? null
      : schonDa(noten, { fach, note, datum, art: lnArt ? (lnArt === "schulaufgabe" ? "gross" : "klein") : undefined });
    if (vorhanden && vorhanden.offen && (vorhanden.note === undefined || vorhanden.note === null)) {
      i = noten.indexOf(vorhanden);
    } else if (vorhanden) {
      return doppeltAntwort(vorhanden, true);
    }
  }
  const heuteEigene = noten.filter((n) => n.von === kind && String(n.kindAm || "") === heute).length;
  if (heuteEigene >= (KIND_NOTEN_TAG_JE[kind] || KIND_NOTEN_TAG) && von === kind)
    return json(429, { ok: false, fehler: "Für heute ist genug eingetragen. Mama oder Papa können helfen." });

  if (i >= 0) {
    const n = { ...noten[i], fach, note, datum };
    if (anlass) n.anlass = anlass;
    if (lnArt) { n.lnArt = lnArt; n.art = lnArt === "schulaufgabe" ? "gross" : "klein"; }
    delete n.offen;
    if (!n.von) n.von = von;
    n.kindAm = heute;
    noten[i] = n;
  } else {
    const p = notePruefen({ fach, note, datum, anlass: anlass || (kind === "helena" ? "Prüfung" : "Probe"), quelle: "heft",
      art: lnArt === "schulaufgabe" ? "gross" : "klein" });
    if (p.fehler) return json(400, { ok: false, fehler: p.fehler });
    const neu = { ...p.note, von, kindAm: heute };
    if (roh.trotzdem === true) neu.eigeneProbe = true;
    // Eine Schulaufgabe ist nie zentral - notePruefen stellt den BET selbst auf klein und doppelt.
    if (lnArt && !p.note.zentral) neu.lnArt = lnArt;
    else if (lnArt) neu.lnArt = lnArt === "schulaufgabe" ? "test" : lnArt;
    noten.push(neu);
  }
  try { await notenSchreiben(env, kind, noten); }
  catch (e) { return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Die Note ist NICHT gespeichert." }); }
  return json(200, { ok: true, noten: eigeneNoten(noten) });
}

/* "Diese Probe ist schon da" - fuer Eltern und Kind derselbe Kern, nur die
   Anrede ist anders. Die Antwort ist 409 mit {doppelt:{...}}, damit die Seite
   "Trotzdem speichern" anbieten kann (dann {trotzdem:true}). Alte Seiten
   kennen das Feld nicht und zeigen einfach den Text. */
function doppeltAntwort(vorhanden, fuerKind) {
  const tag = String(vorhanden.datum || "").split("-").reverse().join(".");
  const am = String(vorhanden.kindAm || vorhanden.angelegt || "").slice(0, 10).split("-").reverse().join(".");
  const fehler = fuerKind
    ? "Diese Probe ist schon da, eingetragen von " + vonWem(vorhanden, true) + (am ? " am " + am : "") + ". "
      + "War es eine andere Probe am selben Tag? Dann können Mama oder Papa sie eintragen."
    : "Diese Probe ist schon da (" + vorhanden.fach + ", " + tag + "), eingetragen von " + vonWem(vorhanden, false) + (am ? " am " + am : "") + ".";
  return json(409, { ok: false, fehler, doppelt: {
    id: vorhanden.id, fach: vorhanden.fach, datum: vorhanden.datum, note: vorhanden.note,
    punkte: vorhanden.punkte, anlass: vorhanden.anlass, offen: !!vorhanden.offen,
    von: vorhanden.von || "eltern", angelegt: vorhanden.angelegt } });
}

function kindAus(url, daten) {
  const k = String((daten && daten.kind) || url.searchParams.get("kind") || "").toLowerCase();
  return KINDER.includes(k) ? k : null;
}

/* Wie viele Proben ein Kind im Schuljahr schreibt.
 *
 * Aus der Elterninformation der Grundschule Seeackerstrasse (Scan in
 * unterlagen/, Januar 2026): 18 schriftliche Leistungsnachweise in der
 * 4. Klasse, dazu drei Rueckmeldungen statt eines Zwischenzeugnisses.
 * Die Termine stehen dort als REGEL, nicht als Datum - fuer 2026/27
 * ausgerechnet, siehe eltern/probearbeiten.html.
 */
const PROBEN = {
  paul: {
    gesamt: 18,
    /* Was in jedem Fach geprueft wird - Denny am 23.09.2026, mit einem Bild
     * von Pauls Proben-Seite: "Paul sollte hier auf die Faecher klicken
     * koennen. Sprich, die Reiter muessen ein bisschen groesser werden, damit
     * er auch sieht, was dann in den Faechern gefragt wird. Das war ja auf dem
     * Blatt relativ deutlich ausgefuehrt. Er soll wissen, was auf ihn zukommt."
     *
     * Quelle ist die Elterninformation der Grundschule Seeackerstrasse, wie sie
     * unter /eltern/probearbeiten.html steht. Die Lernbereiche sind woertlich
     * von dort uebernommen, nur die Sprache ist auf einen Viertklaessler
     * gedreht: "Sprachgebrauch und Sprache untersuchen" sagt ihm nichts,
     * "Grammatik und Rechtschreiben" schon.
     *
     * ERGAENZT am 24.09.2026 um "themen": Was in DIESEM Schuljahr wirklich
     * drankommt. Quelle sind die drei Folien des Elternabends der 4bG vom
     * 23.09.2026 (HSU, Mathematik, Deutsch), von Denny fotografiert. Die
     * "bereiche" sind die Kategorien, in denen benotet wird; die "themen"
     * sind der Stoff. Beides steht nebeneinander, weil beides eine andere
     * Frage beantwortet: "Worin werde ich geprueft?" und "Was kommt dran?".
     *
     * Das ist die Lernzielliste des Schuljahrs - genau das, was die
     * Lehrer-Gegenpruefung "die Probe, in Worten" genannt hat.
     *
     * Wer die Elterninformation aendert, aendert BEIDE Stellen - hier steht
     * bewusst eine eigene Fassung und kein Verweis, weil Paul die Elternseite
     * nicht aufrufen darf. */
    faecher: {
      deutsch: { anzahl: 8, bereiche: [
        "Sprechen und Zuhören – Referat, Gedicht vortragen, Buch vorstellen",
        "Lesen – einen Text verstehen und damit umgehen",
        "Schreiben – einen Text planen, schreiben und überarbeiten",
        "Grammatik und Rechtschreiben",
      ], themen: [
        "Sprache untersuchen: Satzglieder, die 4 Fälle, Zeitformen, Wortarten",
        "Richtig schreiben: Strategien und Lernwörter, diktierte Sätze (gemischte Probe)",
        "Dein Fehlerwortschatzheft – damit übst du genau deine Wörter",
        "Lesen: Erzählung und Sachtext, dazu der Lesepass",
        "Schreiben: erzählend und sachlich · 1 Probe",
        "Zuhören: Hörspiel und Podcast · 1 Probe",
      ] },
      mathe: { anzahl: 5, bereiche: [
        "Zahlen und Rechnen",
        "Raum und Form – Figuren, Körper, Zeichnen",
        "Größen und Messen – Länge, Gewicht, Zeit, Geld",
        "Daten und Zufall – Tabellen, Diagramme, Wahrscheinlichkeit",
      ], ziel: "Die 4 Grundrechenarten sicher beherrschen", themen: [
        "Plus und minus bis 1000 wiederholen",
        "Das Einmaleins – zu Hause üben!",
        "Der Zahlenraum bis 1 000 000: erschließen und darin rechnen",
        "Halbschriftlich mal und geteilt",
        "Schriftlich mal · schriftlich geteilt",
        "Sachrechnen",
        "Größen: Hohlmaße",
        "Raumvorstellung und geometrische Körper",
        "Mit dem Zirkel zeichnen (nach dem Übertritt)",
      ] },
      hsu: { anzahl: 5, bereiche: [
        "Demokratie und Gesellschaft",
        "Körper und Gesundheit",
        "Natur und Umwelt",
        "Zeit und Wandel",
        "Raum und Mobilität",
        "dazu ein Referat, eine Präsentation oder ein Erklärvideo",
      ], themen: [
        "Rad fahren: Theorie und Praxis – Prüfung nach den Pfingstferien, zu Hause üben!",
        "Stadt Fürth → Landkreis → Mittelfranken → Bayern → Deutschland → Europa",
        "Wasser: Wasserkreislauf, Wetter, Wasserversorgung",
        "Wie der Mensch sich entwickelt (nach dem Übertritt)",
        "Ein Referat mit digitaler Präsentation – das macht ihr in der Schule",
      ] },
    },
    zeugnisse: [
      { was: "Zwischeninformation", datum: "2027-01-22" },
      { was: "Übertrittszeugnis",   datum: "2027-05-03" },
      { was: "Jahreszeugnis",       datum: "2027-07-30" },
    ],
    keinZwischenzeugnis: true,
  },
};

/* Das Kind darf SEINEN eigenen Stand sehen - Noten und wie viele Proben noch
 * kommen. NICHT die Defizit-Auswertung: Denny am 20.09.2026 zum
 * Noten-Manager - "sie müssen nicht unbedingt sehen, wo die Defizite waren".
 *
 * Am 23.09.2026 hat er dazu ergaenzt: "Paul hat derzeit noch nichts zu seinen
 * Noten, und somit hat er auch keine Informationen, wie viele Prüfungen er
 * schreiben muss. Das sollten wir auf jeden Fall bei ihm auch noch mit
 * einbauen. Das interessiert ihn natürlich."
 *
 * Also: Zahlen und Termine ja, Schwaechenanalyse nein.
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });

  const url0 = new URL(request.url);
  if (url0.searchParams.get("eigene") === "1") {
    const k = String(url0.searchParams.get("kind") || "").toLowerCase();
    if (!KINDER.includes(k)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
    const g = geheimFuer(env, k);
    const alsEltern = geheimFuer(env, "eltern") && (await eltern(request, env));
    if (!alsEltern && !(g && (await ausweisGueltig(request, g, env)))) {
      return json(401, { ok: false, fehler: "Bitte melde dich an." });
    }
    const noten = await notenLesen(env, k);
    if (noten === null) return json(503, { ok: false, fehler: "Ich komme gerade nicht an deine Noten." });

    // Nur die nackten Noten mit Fach und Datum - keine Auswertung, kein
    // "hier bist du schwach".
    const meine = eigeneNoten(noten);
    // Probentermine (04.10.2026): nur heutige und kuenftige. Antwortet der
    // Speicher nicht, steht null da - nie eine leere Liste, sonst hiesse
    // "kein Termin" in Wahrheit "weiss ich nicht".
    const alle = await termineLesen(env, k);
    const termine = alle === null ? null : kuenftige(alle, berlinHeute());
    const antwort = { ok: true, noten: meine, proben: PROBEN[k] || null, termine };
    // Helena (19.10.2026): Zahl der Schulaufgaben je Fach fuer ihre Hochrechnung.
    if (SCHULAUFGABEN[k]) antwort.schulaufgaben = SCHULAUFGABEN[k];
    return json(200, antwort);
  }

  if (!(await eltern(request, env))) return json(401, { ok: false, fehler: "Nur mit Elternausweis." });

  const url = new URL(request.url);
  const kind = kindAus(url, null);
  const kinder = {};
  for (const k of kind ? [kind] : KINDER) {
    const noten = await notenLesen(env, k);
    if (noten === null) {
      // Derselbe Grundsatz wie beim Anwesenheitsband: Ein Speicherfehler ist
      // KEINE leere Notenliste. Sonst stuende da "noch keine Noten", obwohl
      // welche da sind.
      kinder[k] = { kaputt: true, faecher: [] };
      continue;
    }
    kinder[k] = { faecher: auswertung(k, noten), regel: RECHNUNG[k] || null, anzahl: noten.length };
  }
  return json(200, { ok: true, kinder });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.PAUL_KV) return json(500, { ok: false, fehler: "Der Speicher ist nicht eingerichtet." });
  const alsEltern = await eltern(request, env);

  let daten = {};
  try { daten = await request.json(); } catch (e) {
    return json(alsEltern ? 400 : 401, { ok: false, fehler: alsEltern ? "Ich konnte die Anfrage nicht lesen." : "Nur mit Elternausweis." });
  }

  const url = new URL(request.url);
  const kind = kindAus(url, daten);
  if (!alsEltern) {
    // Ohne Elternausweis geht NUR ein Probentermin des eigenen Kindes -
    // oder seit 15.10.2026 seine eigene zurueckbekommene Note.
    if (kind && daten && daten.kindNote && !daten.note && !daten.blatt && !daten.termin && !daten.terminWeg)
      return kindNoteSetzen(request, env, kind, daten.kindNote);
    const nurTermin = daten && (daten.termin || daten.terminWeg) && !daten.note && !daten.blatt;
    if (!kind || !nurTermin) return json(401, { ok: false, fehler: "Nur mit Elternausweis." });
    return kindTermin(request, env, kind, daten);
  }
  if (!kind) return json(400, { ok: false, fehler: "Welches Kind denn?" });

  // Aendern in einem Schreibvorgang (13.10.2026, Elternbereich): von bleibt dran.
  if (daten.terminAlt && daten.termin) {
    const g = terminPruefen(daten.termin, { themaOptional: true });
    if (g.fehler) return json(400, { ok: false, fehler: g.fehler });
    const alt = { datum: String(daten.terminAlt.datum || ""), fach: String(daten.terminAlt.fach || "").toLowerCase() };
    try {
      const r = await terminAendern(env, kind, alt, g.termin);
      if (!r.gefunden) return json(404, { ok: false, fehler: "Diesen Termin gibt es nicht (mehr).", termine: r.termine });
      return json(200, { ok: true, geschrieben: true, termine: r.termine });
    } catch (e) {
      return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Nichts geändert." });
    }
  }

  // Probentermin setzen oder wegnehmen (04.10.2026), nur mit Elternausweis.
  if (daten.termin) {
    const g = terminPruefen(daten.termin, { themaOptional: true });
    if (g.fehler) return json(400, { ok: false, fehler: g.fehler });
    try {
      const r = await terminSetzen(env, kind, g.termin);
      return json(200, { ok: true, geschrieben: r.geschrieben, termine: r.termine });
    } catch (e) {
      return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Der Termin ist NICHT gespeichert." });
    }
  }
  if (daten.terminWeg) {
    const datum = String(daten.terminWeg.datum || "");
    const fach = String(daten.terminWeg.fach || "").toLowerCase();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) return json(400, { ok: false, fehler: "Datum bitte als JJJJ-MM-TT." });
    try {
      const r = await terminWeg(env, kind, datum, fach);
      if (!r.gefunden) return json(404, { ok: false, fehler: "Diesen Termin gibt es nicht (mehr).", termine: r.termine });
      return json(200, { ok: true, geschrieben: true, termine: r.termine });
    } catch (e) {
      return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Nichts geloescht." });
    }
  }

  // Ein Blatt auslesen lassen - es wird NICHTS gespeichert, nur vorgeschlagen.
  if (daten.blatt) return blattLesen(env, kind, daten.blatt);

  const gepruef = notePruefen(daten.note || {});
  if (gepruef.fehler) return json(400, { ok: false, fehler: gepruef.fehler });

  const noten = await notenLesen(env, kind);
  if (noten === null) return json(503, { ok: false, fehler: "Der Speicher antwortet gerade nicht. Bitte gleich noch einmal." });

  let i = noten.findIndex((n) => n.id === gepruef.note.id);
  /* Doppelt (26.10.2026): Eine NEUE Note, die es als Probe schon gibt. Ist die
     vorhandene offen und die neue hat eine Note, wird die offene ergaenzt
     (ihre id bleibt, damit Verweise aus der Zurueckbekommen-Liste halten).
     Sonst 409 - ausser trotzdem:true, dann zaehlt sie als eigene Probe. */
  if (i < 0) {
    // Neue Note nur mit Datum im letzten Jahr (28.10.2026); bestehende bleiben unberuehrt.
    if (!gepruef.note.offen || gepruef.note.datum) {
      const imJahr = datumImJahr(gepruef.note.datum, berlinHeute());
      if (!imJahr || imJahr.gelesen) {
        const t = gepruef.note.datum.split("-").reverse().join(".");
        return json(400, { ok: false, fehler: "Das Datum " + t + " liegt nicht im letzten Jahr. Bitte prüfen." });
      }
    }
    const vorhanden = daten.trotzdem === true ? null : schonDa(noten, gepruef.note);
    if (vorhanden && vorhanden.offen && (vorhanden.note === undefined || vorhanden.note === null)
        && (gepruef.note.note !== undefined || gepruef.note.punkte)) {
      i = noten.indexOf(vorhanden);
      gepruef.note.id = vorhanden.id;
      gepruef.note.angelegt = vorhanden.angelegt || gepruef.note.angelegt;
    } else if (vorhanden) {
      return doppeltAntwort(vorhanden, false);
    }
    if (daten.trotzdem === true) gepruef.note.eigeneProbe = true;
  }
  if (i >= 0) noten[i] = { ...noten[i], ...gepruef.note };
  else noten.push(gepruef.note);
  // Kommt zu einer offenen Probe die Note, ist sie nicht mehr offen (15.10.2026).
  if (i >= 0 && (noten[i].note !== undefined || noten[i].punkte) && !gepruef.note.offen) delete noten[i].offen;

  try { await notenSchreiben(env, kind, noten); }
  catch (e) { return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Die Note ist NICHT gespeichert." }); }

  return json(200, { ok: true, note: gepruef.note, faecher: auswertung(kind, noten) });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!(await eltern(request, env))) return json(401, { ok: false, fehler: "Nur mit Elternausweis." });
  const url = new URL(request.url);
  const kind = kindAus(url, null);
  const id = String(url.searchParams.get("id") || "").replace(/[^a-z0-9]/gi, "");
  if (!kind || !id) return json(400, { ok: false, fehler: "Welche Note denn?" });

  const noten = await notenLesen(env, kind);
  if (noten === null) return json(503, { ok: false, fehler: "Der Speicher antwortet gerade nicht." });
  const rest = noten.filter((n) => n.id !== id);
  if (rest.length === noten.length) return json(404, { ok: false, fehler: "Diese Note gibt es nicht (mehr)." });

  try { await notenSchreiben(env, kind, rest); }
  catch (e) { return json(503, { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Nichts geloescht." }); }
  return json(200, { ok: true, faecher: auswertung(kind, rest) });
}

/* Ein Notenblatt auslesen. Denny am 21.09.2026: "Helena bekommt jeden Monat
   einen Notendurchschnitt mitgeteilt. Den kann ich dir dann auch entsprechend
   hochladen." Das Ergebnis wird NICHT gespeichert - es kommt als Vorschlag
   zurueck, und erst Dennys Klick legt es an. Ein falsch gelesener Notenstand
   waere schlimmer als gar keiner. */
async function blattLesen(env, kind, blatt) {
  if (typeof blatt !== "string" || blatt.length > MAX_BLATT)
    return json(400, { ok: false, fehler: "Das Blatt ist zu groß (höchstens 4 MB)." });
  if (!env.ANTHROPIC_API_KEY) return json(500, { ok: false, fehler: "Kein Zugang zum Auslesen hinterlegt." });

  const istPdf = /^data:application\/pdf;base64,/.test(blatt);
  const istBild = /^data:image\/(png|jpe?g|webp|gif);base64,/.test(blatt);
  if (!istPdf && !istBild) return json(400, { ok: false, fehler: "Das kann ich nicht lesen – Foto oder PDF." });

  const kopf = blatt.slice(5, blatt.indexOf(";"));
  const roh = blatt.split(",", 2)[1];
  const auftrag =
`Du liest einen Notenstand aus, den eine Schule den Eltern geschickt hat.
Gib NUR JSON zurück, ohne Fließtext, in dieser Form:
{"noten":[{"fach":"englisch","note":2,"anlass":"Schulaufgabe 1","datum":"2026-10-14","art":"gross","gewicht":1,"sicher":true}]}

Regeln:
- "fach" klein geschrieben, ausgeschrieben ("mathematik", "englisch", "deutsch").
- "note" ist 1 bis 6, halbe Noten erlaubt. Steht nur eine Punktzahl da, nimm
  "punkte" als Text und lass "note" weg - rechne NIE selbst eine Note aus.
- "art": "gross" bei Schulaufgabe oder Klausur, sonst "klein".
- "gewicht": 2 nur, wenn auf dem Blatt ausdrücklich eine doppelte Wertung steht
  (z. B. Jahrgangsstufentest), sonst 1.
- "datum" im Format JJJJ-MM-TT; steht keines da, lass das Feld weg.
- "sicher": false, wenn du eine Ziffer nicht eindeutig lesen kannst. Lieber
  false als eine falsche Zahl - jemand prüft das nach.
- Ist auf dem Blatt ein Durchschnitt angegeben, gib ihn als "durchschnitt" je
  Fach mit an: {"faecher":[{"fach":"englisch","durchschnitt":2.5}]}
- Steht dort keine einzige Note, antworte {"noten":[]}.`;

  try {
    const a = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        // Opus 5.5 denkt von selbst, das Denken zaehlt in max_tokens (24.09.2026).
        model: MODELL, max_tokens: 8000,
        thinking: { type: "adaptive" }, output_config: { effort: "low" },
        messages: [{ role: "user", content: [
          { type: "text", text: auftrag },
          istPdf ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: roh } }
                 : { type: "image", source: { type: "base64", media_type: kopf, data: roh } },
        ] }],
      }),
    });
    if (!a.ok) return json(502, { ok: false, fehler: "Das Auslesen hat nicht geklappt. Versuch es noch einmal." });
    const j = await a.json();
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("").trim();
    const klammer = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    let gelesen = null;
    try { gelesen = JSON.parse(klammer); } catch (e) { return json(502, { ok: false, fehler: "Die Antwort war nicht lesbar." }); }

    // Jede vorgeschlagene Note durch dieselbe Pruefung wie eine getippte.
    const vorschlaege = [];
    for (const n of (gelesen.noten || []).slice(0, 60)) {
      const p = notePruefen({ ...n, quelle: "blatt", id: neueId() });
      if (p.fehler) continue;
      // Gelesenes Datum ausserhalb des letzten Jahres: auf das passende Jahr
      // setzen, als unsicher markieren und das Gelesene mitgeben (28.10.2026).
      const imJahr = datumImJahr(p.note.datum, berlinHeute());
      if (!imJahr) { p.note.sicher = false; p.note.datumFraglich = true; }
      else if (imJahr.gelesen) { p.note.datum = imJahr.datum; p.note.datumGelesen = imJahr.gelesen; p.note.sicher = false; }
      vorschlaege.push(p.note);
    }
    return json(200, { ok: true, vorschlaege, faecherDurchschnitt: gelesen.faecher || [], gespeichert: false });
  } catch (e) {
    return json(502, { ok: false, fehler: "Beim Auslesen ist etwas schiefgegangen." });
  }
}
