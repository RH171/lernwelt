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
// Stunden spielt, kostet damit acht Schreibvorgaenge statt vierzig - der Puls
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
// heute meint Dennys Tag, nicht den des Servers. Darum Europe/Berlin, und
// damit stimmt es auch ueber die Zeitumstellung hinweg.

const TAKT_MINUTEN = 15;                       // Laenge einer Viertelstunde
export const BLOECKE_PRO_TAG = (24 * 60) / TAKT_MINUTEN;   // 96
export const BAND_HAELT_TAGE = 45;             // so lange bleibt ein Tag lesbar

const SCHLUESSEL = (kind, tag) => "da:" + kind + ":" + tag;

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
  const d = new Date(typeof ms === "number" ? ms : Date.now());
  if (isNaN(d.getTime())) return null;
  const t = {};
  for (const p of ZEIT.formatToParts(d)) t[p.type] = p.value;
  const stunde = Number(t.hour), minute = Number(t.minute);
  if (!Number.isFinite(stunde) || !Number.isFinite(minute)) return null;
  // Guertel und Hosentraeger: selbst wenn hourCycle einmal nicht greift,
  // bleibt der Block im Tag.
  const block = Math.floor(((stunde % 24) * 60 + minute) / TAKT_MINUTEN);
  return {
    tag: t.year + "-" + t.month + "-" + t.day,
    block: Math.min(BLOECKE_PRO_TAG - 1, Math.max(0, block)),
  };
}

// Eine Viertelstunde zurueck in "8:15" - fuer die Anzeige im Elternbereich.
export function blockUhrzeit(block) {
  const n = Math.min(BLOECKE_PRO_TAG - 1, Math.max(0, Number(block) || 0));
  const minuten = n * TAKT_MINUTEN;
  return Math.floor(minuten / 60) + ":" + String(minuten % 60).padStart(2, "0");
}

// Ein gespeichertes Band einlesen und dabei jeden Unsinn abfangen, der im
// Speicher stehen koennte (alte Formate, halb geschriebene Werte).
export function bandLesen(roh) {
  const leer = { lernwelt: [], duell: [] };
  if (!roh) return leer;
  let d = null;
  try { d = JSON.parse(roh); } catch (e) { return leer; }
  if (!d || typeof d !== "object") return leer;
  const saubern = (liste) => {
    if (!Array.isArray(liste)) return [];
    const raus = [];
    for (const x of liste) {
      const n = Number(x);
      if (Number.isInteger(n) && n >= 0 && n < BLOECKE_PRO_TAG && !raus.includes(n)) raus.push(n);
    }
    return raus.sort((a, b) => a - b);
  };
  return { lernwelt: saubern(d.l), duell: saubern(d.d) };
}

function bandSchreibenText(band) {
  return JSON.stringify({ l: band.lernwelt, d: band.duell });
}

/* Eine Viertelstunde vermerken.
 *
 * Gibt zurueck, ob wirklich geschrieben wurde - der Aufrufer kann das
 * mitzaehlen. Geschrieben wird nur, wenn der Block neu ist.
 *
 * Bewusst KEINE Sperre gegen gleichzeitige Schreiber: Zwei Pulse in derselben
 * Sekunde koennten sich gegenseitig einen Block wegnehmen. Der Schaden waere
 * eine fehlende Viertelstunde in einer Anzeige, die nur "war jemand da"
 * beantwortet - und der naechste Puls derselben Viertelstunde holt sie zurueck.
 * Eine Sperre wuerde zusaetzliche Schreibvorgaenge kosten, und die sind hier
 * das knappe Gut.
 */
export async function anwesendVermerken(env, kind, quelle, jetztMs) {
  if (!env || !env.PAUL_KV) return { geschrieben: false };
  const z = berlinZeit(jetztMs);
  if (!z) return { geschrieben: false };
  const feld = quelle === "duell" ? "duell" : "lernwelt";
  const schluessel = SCHLUESSEL(kind, z.tag);

  let band;
  try { band = bandLesen(await env.PAUL_KV.get(schluessel)); }
  catch (e) { return { geschrieben: false }; }

  if (band[feld].includes(z.block)) return { geschrieben: false, tag: z.tag, block: z.block };
  band[feld].push(z.block);
  band[feld].sort((a, b) => a - b);

  try {
    await env.PAUL_KV.put(schluessel, bandSchreibenText(band),
                          { expirationTtl: BAND_HAELT_TAGE * 24 * 3600 });
  } catch (e) {
    // Voller Speicher darf den Puls nicht abwuergen - der hat die wichtigere
    // Aufgabe (kein Ausrollen, waehrend ein Kind spielt).
    return { geschrieben: false, tag: z.tag, block: z.block };
  }
  return { geschrieben: true, tag: z.tag, block: z.block };
}

// Das Band eines Kindes fuer einen Tag holen.
export async function anwesendLesen(env, kind, tag) {
  if (!env || !env.PAUL_KV) return { lernwelt: [], duell: [] };
  try { return bandLesen(await env.PAUL_KV.get(SCHLUESSEL(kind, tag))); }
  catch (e) { return { lernwelt: [], duell: [] }; }
}

// Die letzten n Tage als Liste "2026-09-19", "2026-09-18", … (heute zuerst),
// gerechnet in deutscher Zeit.
export function letzteTage(anzahl, jetztMs) {
  const jetzt = typeof jetztMs === "number" ? jetztMs : Date.now();
  const raus = [];
  for (let i = 0; i < anzahl; i++) {
    const z = berlinZeit(jetzt - i * 24 * 3600 * 1000);
    if (z && !raus.includes(z.tag)) raus.push(z.tag);
  }
  return raus;
}
