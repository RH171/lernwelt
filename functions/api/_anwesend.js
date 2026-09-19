// Wer war wann da? - das Anwesenheitsband.
//
// Denny am 19.09.2026, nachdem ich auf die Frage "War Helena nicht ein
// einziges Mal da?" ehrlich antworten musste, dass ich das nicht sicher sagen
// kann: "haettest Du in Zukunft die Moeglichkeit das besser zu loggen".
//
// Vorher gab es nur den Puls (aktiv:<kind>): ein einzelner Zeitstempel mit
// kurzer Haltbarkeit, der nur beantwortet "ist JETZT jemand da?". Er wird
// nirgends mitgeschrieben und ist nach acht Minuten Stille verfallen. Eine
// Frage wie "war Helena heute ueberhaupt in der Lernwelt?" war damit nicht zu
// beantworten - und die Lernrunden helfen dabei nicht, weil sie drei Luecken
// haben: Runden unter 30 Sekunden werden verworfen, das Quiz-Duell zaehlt
// bewusst gar nicht mit, und Helenas Trainer legt nicht gesendete Runden auf
// ihrem Handy ab und schickt sie erst spaeter nach.
//
// Das Band beantwortet nur EINE Frage - war jemand da - und zwar unabhaengig
// davon, ob eine Runde zustande kam. Es ist ausdruecklich KEINE Lernzeit:
// Dagesessen ist nicht gelernt. Wer Lernzeit will, nimmt /api/statistik.
//
// ---------------------------------------------------------------------------
// Warum Viertelstunden und nicht Zeitstempel
//
// Schreibvorgaenge sind hier die knappe Groesse, nicht der Platz: 1000 am Tag
// fuer die ganze Lernwelt, und am 14.09.2026 war das Kontingent schon einmal
// leer (siehe CLAUDE.md). Ein Band aus 96 Viertelstunden je Tag wird nur dann
// geschrieben, wenn eine NEUE Viertelstunde dazukommt. Ein Kind, das zwei
// Stunden spielt, kostet damit neun Schreibvorgaenge statt achtzig - der Puls
// selbst laeuft alle 90 Sekunden und wuerde sonst jedes Mal mitschreiben.
//
// ---------------------------------------------------------------------------
// Warum deutsche Zeit und nicht UTC
//
// Cloudflare-Worker laufen in UTC. tagSchluessel() in statistik.js nimmt
// getFullYear()/getMonth()/getDate() und bekommt damit den UTC-Tag: Zwischen
// Mitternacht und 2 Uhr deutscher Sommerzeit zaehlt dort noch der Vortag. Fuer
// die Statistik faellt das nicht auf, weil um die Zeit niemand spielt. Hier
// waere es ein echter Fehler, denn die Frage lautet "war jemand HEUTE da" und
// heute meint Dennys Tag, nicht den des Servers. Darum Europe/Berlin.
//
// ---------------------------------------------------------------------------
// Warum ein Schluessel je MONAT und Quelle (Pruefrunde 02, 19.09.2026)
//
// Die zweite Fassung legte einen Schluessel je Tag UND Quelle an. Lesen kostete
// damit 85 KV-Abfragen fuer die 14 Tage, die der Elternbereich holt, und 271
// fuer 45 Tage - nacheinander, also knapp zehn Sekunden Ladezeit. Ein Monat je
// Quelle kostet stattdessen hoechstens 18 Abfragen fuer denselben Zeitraum.
//
// Der Wettlauf zwischen zwei SCHREIBERN wird davon nicht schlimmer: Beide
// lesen denselben Ausgangsstand und schreiben ihn mit je einem zusaetzlichen
// Block zurueck - verloren geht der Block des Langsameren, nicht der ganze
// Monat. Das gilt fuer Tag, Woche und Monat gleichermassen.
//
// ANDERS beim LOESCHEN (Pruefrunde 03): anwesendLoeschen() schreibt den Monat
// als Vollbild zurueck. Faellt ein Puls genau zwischen dessen get und put,
// koennen ganze fremde Tage mit verschwinden - oder ein haengender Schreiber
// stellt einen gerade geloeschten Monat wieder her. Das ist bewusst in Kauf
// genommen: Geloescht wird nur von Hand, von Denny, wenn ein falscher Eintrag
// aufgefallen ist - also selten und mit Blick darauf, was hinterher dasteht.
// Wer das Loeschen jemals automatisiert, muss diese Stelle vorher loesen.
//
// ---------------------------------------------------------------------------
// Warum je Quelle ein eigener Schluessel (Pruefrunde 01, 19.09.2026)
//
// Anfangs standen Lernwelt- und Duell-Bloecke in EINEM Eintrag. Weil ein
// Schreibvorgang im KV den ganzen Tag als Vollbild ersetzt, nahmen sich zwei
// gleichzeitige Pulse gegenseitig Bloecke weg - im Test verschwanden 45
// Minuten, nicht die eine Viertelstunde, die ich angenommen hatte. Getrennte
// Schluessel kosten keinen Schreibvorgang mehr (geschrieben wird ohnehin nur
// die eigene Quelle) und nehmen dem Wettlauf den haeufigsten Fall: Lernwelt-
// und Duell-Puls desselben Kindes koennen sich nicht mehr ueberschreiben.
// Was bleibt, sind zwei Geraete derselben Quelle in derselben Sekunde - dann
// fehlt eine Viertelstunde, und der naechste Puls darin holt sie zurueck.

const TAKT_MINUTEN = 15;
export const BLOECKE_PRO_TAG = (24 * 60) / TAKT_MINUTEN;   // 96
/* Wie lange ein Monatsblock im Speicher bleibt, und wie weit zurueck darum
   ueberhaupt gefragt werden darf. Die beiden Zahlen gehoeren zusammen: Ein
   Block wird beim LETZTEN Schreibvorgang aufgefrischt, im ungueenstigsten Fall
   also am Monatsersten. Wer 71 Tage zurueckfragt, kann damit gerade noch alles
   sehen; darueber verfiele der aelteste Monat still - und "still verfallen"
   sieht in dieser Anzeige genauso aus wie "war nicht da" (Pruefrunde 03).
   TAGE_MAX in anwesend.js leitet sich daraus ab, statt eine eigene Zahl zu
   raten. */
const HALTBAR_TAGE = 100;
export const BAND_HAELT_TAGE = HALTBAR_TAGE - 31 + 2;   // = 71, sicher abgedeckt
const HALTBAR_SEKUNDEN = HALTBAR_TAGE * 24 * 3600;
export const KINDER = ["paul", "leon", "helena"];
const QUELLEN = ["lernwelt", "duell"];

/* Wie viele Viertelstunden eine Quelle an einem Tag hoechstens eintragen darf.
 *
 * Grund: Die Duell-Meldung wird seit Dennys Entscheidung vom 19.09.2026 OHNE
 * Ausweis angenommen. Jeder, der die Adresse kennt, koennte damit
 * Schreibvorgaenge verbrennen - und davon gibt es nur 1000 am Tag fuer die
 * ganze Lernwelt. Ist das Kontingent leer, speichert fuer die Kinder gar
 * nichts mehr (so geschehen am 14.09.2026). Ohne Deckel waeren es bis zu 96 je
 * Kind und Quelle, also 288 allein ueber diesen offenen Weg (Pruefrunde 03).
 *
 * 32 Viertelstunden sind acht Stunden am Tag. Kein Kind spielt so lange Quiz;
 * fuer die Anzeige "war jemand da" ist die Frage nach der 33. Viertelstunde
 * ohnehin beantwortet. Der offene Weg kostet damit hoechstens 96 statt 288. */
/* Ohne Anmeldung hereingekommen: 64 Viertelstunden, also sechzehn Stunden.
 *
 * Erst waren es 32 (acht Stunden) - gedacht als "kein Kind spielt so lange".
 * Das stimmt fuer das Quizduell, trifft aber Helena voll: Ihr Bereich hat als
 * einziger keinen Riegel, ihre Pulse gelten darum immer als "offen". Ein Tag
 * von 9 bis 20 Uhr sind 44 Viertelstunden - ab 16:45 waere sie unsichtbar
 * gewesen, und zwar ausgerechnet das Kind, fuer das dieses Werkzeug gebaut
 * wurde (Pruefrunde 05).
 *
 * 16 Stunden deckt jeden wachen Tag ab. Der Missbrauchsschutz bleibt: statt
 * 288 moeglicher Schreibvorgaenge ueber die offenen Wege sind es hoechstens
 * 192 von 1000 - genug Luft, damit fuer die Kinder nichts stehen bleibt. */
const BLOECKE_OFFEN = 64;
const BLOECKE_ANGEMELDET = 96; // volle Tagesbreite

/* Schluessel: da:<kind>:<jjjj-mm>:<quelle>, Inhalt {"<tag>":[bloecke]}.
   Der Tag steht als Zahl ohne fuehrende Null darin ("19"), der Monat im
   Schluessel. Haltbarkeit grosszuegig ueber den Monat hinaus, damit ein am
   Monatsanfang angelegter Eintrag nicht mitten in der Anzeigespanne verfaellt. */
const SCHLUESSEL = (kind, monat, quelle) => "da:" + kind + ":" + monat + ":" + quelle;
const MONAT = (tag) => String(tag).slice(0, 7);
const TAG_IM_MONAT = (tag) => String(Number(String(tag).slice(8, 10)));

// hourCycle h23 erzwingt 00-23. Ohne die Angabe liefern manche Umgebungen bei
// hour12:false eine 24 fuer Mitternacht - daraus wuerde Block 96 und damit ein
// Eintrag ausserhalb des Tages.
const ZEIT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

// Millisekunden -> {tag:"2026-09-19", block:0..95} in deutscher Zeit.
export function berlinZeit(ms) {
  if (ms != null && typeof ms !== "number") return null;   // kein ISO-String als "jetzt" durchwinken
  const d = new Date(ms == null ? Date.now() : ms);
  if (isNaN(d.getTime())) return null;
  const t = {};
  for (const p of ZEIT.formatToParts(d)) t[p.type] = p.value;
  const stunde = Number(t.hour), minute = Number(t.minute);
  if (!Number.isFinite(stunde) || !Number.isFinite(minute)) return null;
  const block = Math.floor(((stunde % 24) * 60 + minute) / TAKT_MINUTEN);
  return {
    tag: t.year + "-" + t.month + "-" + t.day,
    block: Math.min(BLOECKE_PRO_TAG - 1, Math.max(0, block)),
  };
}

/* Eine Viertelstunde zurueck in "8:15".
 *
 * Block 96 gibt es nicht als Zeitpunkt, wohl aber als ENDE des letzten Blocks:
 * Wer von 23:45 bis Mitternacht da war, war "23:45 bis 24:00" da. Die erste
 * Fassung deckelte hier auf 95 und schrieb damit "23:45 bis 23:45" - das las
 * sich wie "gar nicht" und hob genau die Absicht auf, die zwei Zeilen weiter
 * im Aufrufer stand (Pruefrunde 01). */
export function blockUhrzeit(block) {
  const n = Math.min(BLOECKE_PRO_TAG, Math.max(0, Number(block) || 0));
  const minuten = n * TAKT_MINUTEN;
  return Math.floor(minuten / 60) + ":" + String(minuten % 60).padStart(2, "0");
}

// Blockliste einlesen und dabei jeden Unsinn abfangen, der im Speicher stehen
// koennte (alte Formate, halb geschriebene Werte, true/false - Number(true)
// waere sonst Block 1 und damit erfundene Anwesenheit um 0:15).
function bloeckeSaeubern(liste) {
  if (!Array.isArray(liste)) return [];
  const raus = [];
  for (const x of liste) {
    // typeof pruefen, nicht nur Number(): Number(true) waere 1 und damit
    // erfundene Anwesenheit um 0:15 (Pruefrunde 01).
    if (typeof x !== "number" && typeof x !== "string") continue;
    const n = Number(x);
    if (Number.isInteger(n) && n >= 0 && n < BLOECKE_PRO_TAG && !raus.includes(n)) raus.push(n);
  }
  return raus.sort((a, b) => a - b);
}

// Einen Monatseintrag einlesen: {"19":[34,35], "20":[10]} -> dasselbe, gesaeubert.
/* Gibt {} zurueck, wenn nichts dasteht - und wirft KAPUTT, wenn etwas dasteht,
   das sich nicht lesen laesst. Der Unterschied ist wichtig: "nichts gespeichert"
   heisst "war nicht da", "unlesbar" heisst "ich weiss es nicht". Die erste
   Fassung machte aus einem halb geschriebenen Wert still ein leeres Band und
   meldete unsicher:false - also genau die falsche Auskunft, gegen die dieses
   Modul gebaut ist (Pruefrunde 05). */
export const KAPUTT = Symbol("unlesbar");

export function monatLesen(roh) {
  if (roh == null || roh === "") return {};
  let d = null;
  try { d = JSON.parse(roh); } catch (e) { return KAPUTT; }
  if (!d || typeof d !== "object" || Array.isArray(d)) return KAPUTT;
  const raus = {};
  for (const [tag, liste] of Object.entries(d)) {
    if (!/^([1-9]|[12]\d|3[01])$/.test(tag)) continue;
    const b = bloeckeSaeubern(liste);
    if (b.length) raus[tag] = b;
  }
  return raus;
}

// Die Bloecke eines einzelnen Tages aus einem Monatseintrag.
export function bloeckeLesen(roh, tag) {
  const m = monatLesen(roh);
  if (m === KAPUTT) return [];
  return m[TAG_IM_MONAT(tag)] || [];
}

function kindOk(kind) { return KINDER.includes(String(kind || "").toLowerCase()); }

/* Eine Viertelstunde vermerken.
 *
 * Gibt zurueck, ob geschrieben wurde und ob dabei etwas schiefging. Der
 * Aufrufer darf einen Fehler NICHT als "war nicht da" deuten - siehe
 * anwesendLesen().
 */
/* `offen` sagt, ob hier ein Ausweis geprueft wurde. Wird es vergessen, gilt
   der STRENGERE Deckel - nicht der laxere. Die erste Fassung war fail-open:
   ein Aufruf ohne das fuenfte Argument bekam volle 96 Bloecke, also genau die
   Nachsicht, die der Deckel verhindern soll (Pruefrunde 05). */
export async function anwesendVermerken(env, kind, quelle, jetztMs, offen = true) {
  if (!env || !env.PAUL_KV) return { geschrieben: false, fehler: "kein Speicher" };
  // Ein unbekannter Kindname wuerde einen Muell-Schluessel anlegen, der 45 Tage
  // im Speicher steht (Pruefrunde 01).
  if (!kindOk(kind)) return { geschrieben: false, fehler: "unbekanntes Kind" };
  const z = berlinZeit(jetztMs);
  if (!z) return { geschrieben: false, fehler: "unbrauchbare Zeit" };

  const feld = QUELLEN.includes(quelle) ? quelle : "lernwelt";
  const schluessel = SCHLUESSEL(String(kind).toLowerCase(), MONAT(z.tag), feld);
  const tagImMonat = TAG_IM_MONAT(z.tag);

  let monat;
  try { monat = monatLesen(await env.PAUL_KV.get(schluessel)); }
  catch (e) { return { geschrieben: false, fehler: "Speicher antwortet nicht" }; }
  // Unlesbares NICHT ueberschreiben - darin koennten echte Tage stecken.
  if (monat === KAPUTT) return { geschrieben: false, fehler: "Eintrag ist unlesbar" };

  const bloecke = monat[tagImMonat] || [];
  if (bloecke.includes(z.block)) return { geschrieben: false, tag: z.tag, block: z.block };
  /* Der Deckel haengt daran, OB jemand angemeldet war - nicht daran, aus
     welcher Ecke die Meldung kam. Die erste Fassung deckelte nur
     quelle==="duell" und liess damit genau den anderen offenen Weg frei:
     Helenas Bereich hat keinen Riegel, ein Puls {"kind":"helena"} kommt ohne
     Cookie durch, landete im Lernwelt-Band mit Deckel 96 und setzte obendrein
     den Puls (Pruefrunde 04). */
  /* Was der Deckel kostet, und warum es trotzdem so bleibt (Pruefrunde 04):
     Sind die 32 Plaetze voll, wird auch ECHTE Anwesenheit nicht mehr
     vermerkt - wer den Tag mit 32 fremden Bloecken zustellt, macht den Abend
     unsichtbar. Der Preis fuer die andere Richtung waere hoeher: Ohne Deckel
     kann derselbe offene Weg 288 der 1000 Tagesschreibvorgaenge verbrennen,
     und ist das Kontingent leer, speichert fuer die Kinder GAR NICHTS mehr -
     keine Runde, keine Meldung, kein Hausaufgabenfoto (14.09.2026).
     Eine Luecke in einer Anzeige wiegt weniger als ein stehendes System -
     deshalb steht der Deckel bei 16 Stunden und nicht bei acht: hoch genug,
     dass er keinen echten Tag abschneidet.
     Der Aufrufer bekommt den Grund gesagt und kann ihn weiterreichen. */
  if (bloecke.length >= (offen ? BLOECKE_OFFEN : BLOECKE_ANGEMELDET))
    return { geschrieben: false, tag: z.tag, block: z.block, fehler: "Tagesdeckel erreicht" };
  bloecke.push(z.block);
  bloecke.sort((a, b) => a - b);
  monat[tagImMonat] = bloecke;

  try {
    await env.PAUL_KV.put(schluessel, JSON.stringify(monat),
                          { expirationTtl: HALTBAR_SEKUNDEN });
  } catch (e) {
    // Voller Speicher darf den Puls nicht abwuergen - der hat die wichtigere
    // Aufgabe (kein Ausrollen, waehrend ein Kind spielt).
    return { geschrieben: false, tag: z.tag, block: z.block, fehler: "Speicher nimmt nichts an" };
  }
  return { geschrieben: true, tag: z.tag, block: z.block };
}

/* Das Band eines Kindes fuer einen Tag holen.
 *
 * `unsicher` ist der wichtigste Teil der Antwort. Die erste Fassung gab bei
 * einem Speicherfehler still ein leeres Band zurueck - der Elternbereich
 * druckte daraufhin "In den letzten 14 Tagen nicht da" als Tatsache. Damit
 * haette ausgerechnet dieses Werkzeug Dennys Frage ("kannst Du das sicher
 * sagen?") falsch beantwortet, und zwar mit demselben ruhigen Gesicht wie bei
 * einer echten Auskunft. Ein Ausfall muss sichtbar sein (Pruefrunde 01).
 */
export async function anwesendLesen(env, kind, tag) {
  const monate = await monateLesen(env, kind, [MONAT(tag)]);
  return monatTag(monate, tag);
}

/* Mehrere Monate auf einmal holen - so liest der Elternbereich.
 *
 * 14 Tage kosten damit hoechstens 12 Abfragen (3 Kinder x 2 Quellen x 2
 * Monate) statt 85 (Pruefrunde 02). Die Quellen eines Monats gehen parallel
 * raus, nicht nacheinander.
 */
export async function monateLesen(env, kind, monate) {
  const raus = { unsicher: false, monate: {} };
  if (!env || !env.PAUL_KV) { raus.unsicher = true; return raus; }
  if (!kindOk(kind)) return raus;
  const k = String(kind).toLowerCase();
  const auftraege = [];
  for (const m of monate) for (const q of QUELLEN) auftraege.push({ m, q });
  const antworten = await Promise.all(auftraege.map(async ({ m, q }) => {
    try {
      const daten = monatLesen(await env.PAUL_KV.get(SCHLUESSEL(k, m, q)));
      if (daten === KAPUTT) return { m, q, fehler: true };
      return { m, q, daten };
    } catch (e) { return { m, q, fehler: true }; }
  }));
  for (const a of antworten) {
    if (a.fehler) { raus.unsicher = true; continue; }
    if (!raus.monate[a.m]) raus.monate[a.m] = {};
    raus.monate[a.m][a.q] = a.daten;
  }
  return raus;
}

// Aus dem Ergebnis von monateLesen einen einzelnen Tag herausziehen.
export function monatTag(gelesen, tag) {
  const m = (gelesen.monate || {})[MONAT(tag)] || {};
  const d = TAG_IM_MONAT(tag);
  return {
    lernwelt: (m.lernwelt || {})[d] || [],
    duell: (m.duell || {})[d] || [],
    unsicher: !!gelesen.unsicher,
  };
}

// Welche Monate deckt diese Tagesliste ab?
export function monateFuer(tage) {
  const raus = [];
  for (const t of tage) { const m = MONAT(t); if (!raus.includes(m)) raus.push(m); }
  return raus;
}

/* Die letzten n Tage als Liste "2026-09-19", "2026-09-18", … (heute zuerst).
 *
 * Gerechnet wird im KALENDER, nicht in Millisekunden. Feste 24-Stunden-Schritte
 * gehen ueber die Zeitumstellung falsch: Der 29.03.2026 hat nur 23 Stunden und
 * fiel damit zwischen 00:00 und 01:00 deutscher Zeit ganz aus der Liste - bei
 * weiterhin sieben Eintraegen, es sah also nichts kaputt aus. Nach der
 * Rueckstellung im Oktober kam ein Tag zu wenig zurueck (Pruefrunde 01).
 */
export function letzteTage(anzahl, jetztMs) {
  const heute = berlinZeit(typeof jetztMs === "number" ? jetztMs : Date.now());
  if (!heute) return [];
  const n = Math.max(1, Math.trunc(Number(anzahl) || 1));
  const anker = new Date(heute.tag + "T00:00:00Z");
  if (isNaN(anker.getTime())) return [];
  const raus = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(anker.getTime());
    d.setUTCDate(d.getUTCDate() - i);
    raus.push(d.toISOString().slice(0, 10));
  }
  return raus;
}

/* Einen Tag aus dem Band entfernen.
 *
 * Gebraucht wird das, seit die Duell-Meldung ohne Ausweis angenommen wird
 * (Dennys Entscheidung vom 19.09.2026): Wer die Adresse kennt, kann einen
 * Eintrag fuer ein fremdes Kind erzeugen, und ein Gast, der sich "Leon" nennt,
 * erzeugt ihn sogar versehentlich. Ohne einen Weg, so etwas wieder wegzuraeumen,
 * waere die Anzeige auf Dauer nicht mehr zu glauben - und dann waere das ganze
 * Werkzeug wertlos. Auch meine eigenen Testeintraege sind so entstanden.
 *
 * Geloescht wird immer ein ganzer Tag einer Quelle, nicht einzelne
 * Viertelstunden: feiner waere schwerer zu erklaeren als es hilft.
 */
export async function anwesendLoeschen(env, kind, tag, quelle) {
  if (!env || !env.PAUL_KV) return { ok: false, fehler: "kein Speicher" };
  if (!kindOk(kind)) return { ok: false, fehler: "unbekanntes Kind" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(tag || ""))) return { ok: false, fehler: "unbrauchbarer Tag" };
  const k = String(kind).toLowerCase();
  /* Nur eine WEGGELASSENE Quelle heisst "beide". Ein Tippfehler ("Duell",
     "duel") raeumte vorher still auch das echte, angemeldete Lernwelt-Band mit
     weg - beim einzigen unwiderruflichen Vorgang, den es hier gibt, und
     ausgerechnet dann, wenn der Anlass ein falscher Duell-Eintrag war
     (Pruefrunde 04). */
  if (quelle && !QUELLEN.includes(quelle))
    return { ok: false, fehler: "unbekannte Quelle: " + String(quelle).slice(0, 20) };
  const welche = quelle ? [quelle] : QUELLEN;
  let entfernt = 0;
  const probleme = [];
  for (const q of welche) {
    const schluessel = SCHLUESSEL(k, MONAT(tag), q);
    let monat;
    try {
      monat = monatLesen(await env.PAUL_KV.get(schluessel));
      if (monat === KAPUTT) { probleme.push(q + ": Eintrag ist unlesbar"); continue; }
    }
    // Nicht sofort aussteigen: Die zweite Quelle soll trotzdem geraeumt
    // werden, und der Aufrufer soll erfahren, was gelang und was nicht.
    // Vorher meldete ein Fehler bei der zweiten Quelle schlicht "Fehler",
    // obwohl die erste schon weg war (Pruefrunde 03).
    catch (e) { probleme.push(q + ": Speicher antwortet nicht"); continue; }
    const d = TAG_IM_MONAT(tag);
    if (!monat[d]) continue;                       // nichts da, nichts schreiben
    const wieviele = monat[d].length;
    delete monat[d];
    try {
      // Ist der Monat danach leer, den Schluessel ganz wegnehmen.
      if (Object.keys(monat).length) {
        await env.PAUL_KV.put(schluessel, JSON.stringify(monat), { expirationTtl: HALTBAR_SEKUNDEN });
      } else {
        await env.PAUL_KV.delete(schluessel);
      }
      entfernt += wieviele;
    } catch (e) { probleme.push(q + ": Speicher nimmt nichts an"); }
  }
  if (probleme.length && !entfernt) return { ok: false, fehler: probleme.join("; ") };
  return { ok: true, entfernt, unvollstaendig: probleme.length ? probleme.join("; ") : undefined };
}
