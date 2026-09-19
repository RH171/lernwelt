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
// Der Wettlauf wird davon NICHT schlimmer: Zwei gleichzeitige Schreiber lesen
// denselben Ausgangsstand und schreiben ihn mit je einem zusaetzlichen Block
// zurueck - verloren geht der Block des Langsameren, nicht der ganze Monat.
// Das gilt fuer Tag, Woche und Monat gleichermassen.
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
export const BAND_HAELT_TAGE = 45;      // so weit zurueck wird angezeigt
const HALTBAR_SEKUNDEN = 100 * 24 * 3600;  // Monatsblock: Anzeigespanne plus Puffer
export const KINDER = ["paul", "leon", "helena"];
const QUELLEN = ["lernwelt", "duell"];

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
export function monatLesen(roh) {
  if (!roh) return {};
  let d = null;
  try { d = JSON.parse(roh); } catch (e) { return {}; }
  if (!d || typeof d !== "object" || Array.isArray(d)) return {};
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
  return m[TAG_IM_MONAT(tag)] || [];
}

function kindOk(kind) { return KINDER.includes(String(kind || "").toLowerCase()); }

/* Eine Viertelstunde vermerken.
 *
 * Gibt zurueck, ob geschrieben wurde und ob dabei etwas schiefging. Der
 * Aufrufer darf einen Fehler NICHT als "war nicht da" deuten - siehe
 * anwesendLesen().
 */
export async function anwesendVermerken(env, kind, quelle, jetztMs) {
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

  const bloecke = monat[tagImMonat] || [];
  if (bloecke.includes(z.block)) return { geschrieben: false, tag: z.tag, block: z.block };
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
    try { return { m, q, daten: monatLesen(await env.PAUL_KV.get(SCHLUESSEL(k, m, q))) }; }
    catch (e) { return { m, q, fehler: true }; }
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
