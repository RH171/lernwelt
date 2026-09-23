/* Pauls Tagesaufnahme: was er in der Schule gemacht hat, Tag fuer Tag.
 *
 * Denny am 22.09.2026: "Es geht nicht darum, direkt ein Spiel rumzubauen,
 * sondern erst mal darum, zu erkennen, worum es geht, wo Paul gegebenenfalls
 * Schwaechen hat, und daraus das taegliche Quiz zu gestalten ... Dieser
 * Menuepunkt zaehlt erst mal darum, den aktuellen Tages- oder Wochenbestand
 * von seinen schulischen Aktivitaeten zu sehen."
 *
 * Das Spiel ist also NACHGELAGERT. Hier kommen die Daten herein.
 *
 * WAS HIER NIE PASSIERT: ein Bild verschwindet.
 * Denny, gleicher Tag: "Alles, was er fotografiert und hochlaedt, bitte
 * speichere weg, sodass es nicht geloescht werden kann. Er kann das aus
 * seiner Ansicht herausnehmen." Also drei Zustaende statt zwei:
 *
 *   sichtbar   - steht in seiner Woche
 *   versteckt  - er hat es aus der Ansicht genommen (ein Tipp, umkehrbar)
 *   weg        - er hat zweimal bestaetigt; der EINTRAG ist aus der Liste,
 *                das BILD bleibt liegen und ist ueber seine Nummer weiter
 *                lesbar. Daraus werden spaeter die Pruefungsfragen gebaut.
 *
 * Sparsam gespeichert, weil KV nur 1000 Schreibvorgaenge am Tag hat
 * (14.09.2026: Kontingent leer, nichts ging mehr): EIN Schluessel je Kind und
 * Monat fuer die Liste, dazu je Seite ein Bild. Drei Eintraege am Tag mit je
 * zwei Seiten sind neun Schreibvorgaenge - das traegt.
 */

export const KINDER = ["paul", "leon", "helena"];

/* Aus Pauls echtem Stundenplan (Klasse 4bG, geprueft 22.09.2026 gegen
 * paul/stundenplan.html). Kunst, Werken/Gestalten, Sport und Schwimmen stehen
 * NICHT dabei: dort entsteht kein Eintrag, den man ueben koennte. Wer doch
 * etwas mitbringt, nimmt "anderes". */
export const FAECHER = {
  mathe:    "Mathematik",
  deutsch:  "Deutsch",
  hsu:      "Heimat- und Sachunterricht (HSU)",
  englisch: "Englisch",
  rel:      "Religion oder Ethik",
  musik:    "Musik",
  anderes:  "einem anderen Fach",
};

/* Die beiden Arten eines Eintrags. Bewusst nur zwei (Denny, 23.09.2026):
   eine dritte Kachel waere ein dritter Gedanke bei jedem Hochladen. */
export const ARTEN = {
  heft:   "in meinem Schulheft",
  uebung: "ein Übungsblatt",
};

const LISTE  = (kind, monat) => "stoff:" + kind + ":" + monat;
const BILD   = (id, nr) => "stoffbild:" + id + ":" + nr;
const MONATE_ZURUECK = 14;          // gut ein Schuljahr

const ZEIT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit",
});

/* Deutscher Tag, nicht UTC: "heute" meint Pauls Tag, nicht den der Maschine. */
export function heuteBerlin(ms) {
  const d = new Date(ms == null ? Date.now() : ms);
  if (isNaN(d.getTime())) return null;
  const t = {};
  for (const p of ZEIT.formatToParts(d)) t[p.type] = p.value;
  return t.year + "-" + t.month + "-" + t.day;
}

export function monatVon(tag) { return String(tag || "").slice(0, 7); }

export function kindOk(kind) { return KINDER.includes(String(kind || "").toLowerCase()); }

/* Ein Datum ist nur dann eines, wenn es eines IST.
 *
 * Geprueft wird die Form, der Kalender (der 31.02. ist kein Tag) und die
 * Spanne. Zukunft faellt raus - ein Blatt von morgen gibt es nicht, und eine
 * verstellte Geraeteuhr wuerde sonst den ganzen Bestand durcheinanderbringen.
 * Ein Tag Luft bleibt, weil das Geraet in einer anderen Zeitzone stehen kann. */
export function datumOk(tag, heute) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(tag || ""))) return false;
  const d = new Date(tag + "T12:00:00Z");
  if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== tag) return false;
  const h = heute || heuteBerlin();
  if (tag > naechsterTag(h)) return false;
  const grenze = new Date(h + "T12:00:00Z");
  grenze.setUTCFullYear(grenze.getUTCFullYear() - 2);
  return tag >= grenze.toISOString().slice(0, 10);
}

function naechsterTag(tag) {
  const d = new Date(tag + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/* Aus einem Blatt gelesenes Datum in Form bringen.
 *
 * Auf einem Schulblatt steht "17.9.2026", "17.09.26" oder "17. September".
 * Das Jahr fehlt oft ganz - dann gilt das Schuljahr um "heute" herum, nicht
 * stur das laufende Kalenderjahr: Im Januar ist ein Blatt vom "12.12." aus
 * dem Vorjahr, nicht aus dem naechsten. */
const MONATSNAMEN = ["januar","februar","maerz","märz","april","mai","juni","juli",
                     "august","september","oktober","november","dezember"];

/* Wie weit darf ein Blatt-Datum zurueckliegen - und ab wann wird gefragt?
 *
 * In der Nacht vom 22. auf den 23.09.2026 hat das Modell in Pauls
 * Handschrift "22.9.26" als "22.9.25" gelesen - ein Jahr daneben. Der
 * Eintrag wanderte in den September 2025 und war aus seinem Heft
 * verschwunden, weil die Ansicht nur drei Monate zurueckschaut.
 *
 * Erster Versuch war eine stumme Schranke bei 60 Tagen. Denny hat es besser
 * entschieden: "Bei einer Anomalie von mehr als 14 Tagen kommt von dir eine
 * Rueckfrage, und du laesst ihr das Datum noch mal bestaetigen."
 *
 * Damit kommt auch ein echt altes Blatt durch - es wird nur nicht mehr
 * stillschweigend uebernommen.
 */
export const BLATT_OHNE_FRAGE_TAGE = 14;

/* Wie viele Tage liegt das Blatt-Datum vor dem Bezugstag?
 * Negativ heisst: es liegt in der Zukunft. null bei Unsinn. */
export function tageDavor(datum, bezug) {
  if (!datum || !bezug) return null;
  const a = new Date(datum + "T12:00:00Z"), b = new Date(bezug + "T12:00:00Z");
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
  return Math.round((b - a) / 86400000);
}

/* Drei Ausgaenge:
 *   "nehmen"  - nah genug, wird still uebernommen
 *   "fragen"  - mehr als 14 Tage her: das Kind bestaetigt es
 *   "nein"    - in der Zukunft oder gar kein gueltiges Datum
 */
export function datumPruefen(datum, bezug) {
  const t = tageDavor(datum, bezug);
  if (t === null) return "nein";
  if (t < -1) return "nein";                       // ein Blatt von uebermorgen
  return t <= BLATT_OHNE_FRAGE_TAGE ? "nehmen" : "fragen";
}

export function blattDatum(text, heute) {
  const h = heute || heuteBerlin();
  const roh = String(text || "").trim().toLowerCase();
  if (!roh) return "";
  let t = 0, m = 0, j = 0;

  let tr = roh.match(/\b(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{2,4})\b/);
  if (tr) { t = +tr[1]; m = +tr[2]; j = +tr[3]; }
  if (!t) {
    tr = roh.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (tr) { j = +tr[1]; m = +tr[2]; t = +tr[3]; }
  }
  if (!t) {
    tr = roh.match(/\b(\d{1,2})\s*\.?\s*([a-zä]{3,9})\.?\s*(\d{4})?\b/);
    if (tr) {
      const i = MONATSNAMEN.findIndex((n) => n.startsWith(tr[2].slice(0, 3)));
      if (i >= 0) { t = +tr[1]; m = (i >= 3 ? i : i + 1); j = tr[3] ? +tr[3] : 0; }
    }
  }
  if (!t) {
    tr = roh.match(/\b(\d{1,2})\s*\.\s*(\d{1,2})\s*\.?(?!\d)/);
    if (tr) { t = +tr[1]; m = +tr[2]; }
  }
  if (!t || !m || m > 12 || t > 31) return "";

  if (!j) {
    // Ohne Jahr: das Jahr nehmen, mit dem das Datum NICHT in der Zukunft liegt.
    j = +h.slice(0, 4);
    const versuch = fest(j, m, t);
    if (versuch > naechsterTag(h)) j = j - 1;
  } else if (j < 100) {
    j = 2000 + j;
  }
  const fertig = fest(j, m, t);
  return datumOk(fertig, h) ? fertig : "";
}

function fest(j, m, t) {
  return String(j).padStart(4, "0") + "-" + String(m).padStart(2, "0") + "-" + String(t).padStart(2, "0");
}

/* Der Monatsblock, so wie er im Speicher steht - und was zu tun ist, wenn er
 * NICHT lesbar ist. Derselbe Satz wie beim Anwesenheitsband: "nichts gefunden"
 * darf nur dann "es gibt nichts" heissen, wenn der Speicher geantwortet hat.
 * Sonst faelscht ein Speicherfehler Pauls Woche zu einer leeren Woche. */
export const KAPUTT = Symbol("unlesbar");

export function listeLesen(roh) {
  if (roh == null) return [];
  try {
    const d = JSON.parse(roh);
    return Array.isArray(d) ? d.filter((e) => e && typeof e === "object" && e.id) : KAPUTT;
  } catch (e) { return KAPUTT; }
}

/* Der Fingerabdruck eines Bildes - damit dasselbe Blatt auffaellt.
 *
 * Denny am 22.09.2026: "Er hat nun zwei Heft-Einträge in HSU. Das sind zwei
 * Doppelte." Gewaehlt hat er "warnen, nicht sperren": Zwei Seiten koennen
 * sich aehneln, und ein zweites Foto vom VERBESSERTEN Blatt ist gewollt.
 *
 * SHA-256 ueber die Bilddaten, auf 16 Zeichen gekuerzt - das reicht bei ein
 * paar hundert Blaettern bei weitem und haelt den Eintrag klein. Es trifft
 * nur bei WIRKLICH derselben Datei; zwei getrennte Fotos desselben Blattes
 * erkennt erst der Vergleich ueber Titel, Fach und Datum (siehe schulstoff.js). */
export async function fingerabdruck(seite) {
  const roh = String(seite || "");
  const komma = roh.indexOf(",");
  const daten = komma >= 0 ? roh.slice(komma + 1) : roh;
  if (!daten) return "";
  try {
    const b = new TextEncoder().encode(daten);
    const h = await crypto.subtle.digest("SHA-256", b);
    return Array.from(new Uint8Array(h)).slice(0, 8)
      .map((x) => x.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    return "";
  }
}

/* Liegt so ein Blatt schon im Heft?
 *
 * Zwei Wege, beide nur ein HINWEIS - entschieden wird nichts:
 *   1. derselbe Fingerabdruck  -> sicher dieselbe Datei
 *   2. gleicher Titel + Fach + Datum -> sehr wahrscheinlich dasselbe Blatt,
 *      auch wenn zweimal fotografiert wurde
 * Der zweite Weg braucht den Titel und laeuft deshalb erst, nachdem das
 * Bild gelesen wurde. */
export async function schonDa(env, kind, { abdruck, titel, fach, datum, ausser }) {
  const e = await stoffLesen(env, kind, 3);
  if (!e.ok) return null;
  const alle = e.eintraege.filter((x) => x.id !== ausser);

  if (abdruck) {
    const t = alle.filter((x) => x.abdruck === abdruck)[0];
    if (t) return { id: t.id, titel: t.titel || "", datum: t.datum, wie: "gleiches Bild" };
  }
  if (titel && fach) {
    const t = alle.filter((x) =>
      x.titel && x.titel.toLowerCase() === String(titel).toLowerCase() &&
      (x.fach || "") === (fach || "") && x.datum === datum)[0];
    if (t) return { id: t.id, titel: t.titel, datum: t.datum, wie: "gleicher Titel am selben Tag" };
  }
  return null;
}

export function neueId() {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

/* Einen Eintrag ablegen. Gibt {ok, id} oder {ok:false, fehler}. */
export async function stoffAblegen(env, kind, eintrag, seiten) {
  if (!kindOk(kind)) return { ok: false, fehler: "Unbekanntes Kind." };
  if (!env || !env.PAUL_KV) return { ok: false, fehler: "Der Speicher ist gerade nicht da." };

  const heute = heuteBerlin();
  const datum = datumOk(eintrag.datum, heute) ? eintrag.datum : heute;
  const id = neueId();
  const monat = monatVon(datum);
  const schluessel = LISTE(kind, monat);

  // Erst die Bilder, dann die Liste: Bricht es dazwischen ab, liegt ein Bild
  // ohne Eintrag herum (harmlos). Andersherum staende ein Eintrag ohne Bild in
  // seiner Woche und er tippt ins Leere.
  /* JEDER Speicherzugriff wird gefangen.
   *
   * Am 14.09.2026 war das KV-Tageskontingent leer, und Wege ohne try/catch
   * haben dem Kind die nackte Cloudflare-Seite "error code: 1101" gezeigt -
   * es wusste nicht, ob sein Foto angekommen ist. Hier kommt stattdessen ein
   * ehrlicher Satz zurueck, und der sagt NICHT "gespeichert".
   * Gefunden hat das der Selbsttest pruefe-schulstoff.mjs, nicht ich. */
  const bilder = (seiten || []).slice(0, 6);
  for (let i = 0; i < bilder.length; i++) {
    if (!bilder[i]) continue;
    try {
      await env.PAUL_KV.put(BILD(id, i), bilder[i]);   // KEINE Ablaufzeit: bleibt liegen
    } catch (e) {
      return { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Bitte später nochmal." };
    }
  }

  let roh;
  try {
    roh = await env.PAUL_KV.get(schluessel);
  } catch (e) {
    return { ok: false, fehler: "Ich komme gerade nicht an dein Heft. Bitte später nochmal." };
  }
  const gelesen = listeLesen(roh);
  if (gelesen === KAPUTT) return { ok: false, fehler: "Dein Heft ist gerade nicht lesbar." };
  const liste = gelesen;

  liste.unshift({
    id,
    datum,
    fach: FAECHER[eintrag.fach] ? eintrag.fach : "",
    /* Wo das Blatt stand: im Schulheft oder auf einem Uebungsblatt.
       Dennys Entwurf vom 23.09.2026, zwei Kacheln nach der Fachwahl. Grundlage
       ist die Ansage der Lehrerin am Elternabend: "Es wird das gefragt, was im
       Heft enthalten ist." Aus "heft" wird abgefragt, aus "uebung" geuebt.
       Leer heisst: vor dieser Unterscheidung abgelegt - dann gilt nichts
       davon, und es wird wie bisher behandelt. */
    art: ARTEN[eintrag.art] ? eintrag.art : "",
    thema: String(eintrag.thema || "").slice(0, 160),
    titel: String(eintrag.titel || "").slice(0, 120),
    notiz: String(eintrag.notiz || "").slice(0, 400),
    seiten: bilder.length,
    // Fingerabdruck der ersten Seite - daran faellt dasselbe Blatt auf.
    ...(eintrag.abdruck ? { abdruck: eintrag.abdruck } : {}),
    // Wo das Datum herkommt - Paul soll sehen koennen, ob es geraten ist.
    datumVon: eintrag.datumVonBlatt ? "blatt" : "kind",
    angelegt: new Date().toISOString(),
    sichtbar: true,
    ...(eintrag.spiel ? { spiel: String(eintrag.spiel).slice(0, 40) } : {}),
  });

  try {
    await env.PAUL_KV.put(schluessel, JSON.stringify(liste.slice(0, 300)));
  } catch (e) {
    // Die Bilder liegen schon - der Eintrag fehlt. Das ist die harmlosere
    // Haelfte, aber das Kind muss es trotzdem erfahren.
    return { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Bitte später nochmal." };
  }
  return { ok: true, id, datum };
}

/* Die letzten Monate lesen. Liefert {ok, eintraege} oder {ok:false} -
 * NIE eine leere Liste als Ersatz fuer einen Speicherfehler. */
export async function stoffLesen(env, kind, monate) {
  if (!kindOk(kind)) return { ok: false, fehler: "Unbekanntes Kind." };
  if (!env || !env.PAUL_KV) return { ok: false, fehler: "Der Speicher ist gerade nicht da." };

  const heute = heuteBerlin();
  const wieViele = Math.min(MONATE_ZURUECK, Math.max(1, Number(monate) || 3));
  const alle = [];
  for (let i = 0; i < wieViele; i++) {
    const d = new Date(heute + "T12:00:00Z");
    d.setUTCMonth(d.getUTCMonth() - i);
    let rohMonat;
    try {
      rohMonat = await env.PAUL_KV.get(LISTE(kind, d.toISOString().slice(0, 7)));
    } catch (e) {
      return { ok: false, fehler: "Ich komme gerade nicht an dein Heft. Bitte später nochmal." };
    }
    const gelesen = listeLesen(rohMonat);
    if (gelesen === KAPUTT) return { ok: false, fehler: "Dein Heft ist gerade nicht lesbar." };
    alle.push(...gelesen);
  }
  alle.sort((a, b) => (b.datum || "").localeCompare(a.datum || "") ||
                      (b.angelegt || "").localeCompare(a.angelegt || ""));
  return { ok: true, heute, eintraege: alle };
}

/* Welche Faecher hat das Kind IN DIESEM SCHULJAHR im Heft?
 *
 * Denny am 23.09.2026 zum Lernquiz: "Prinzipiell sollte dort nur das Fach
 * auftauchen, was er auch [in] der Zeit, in der er was hochgeladen hat" - und
 * ausdruecklich: "ich würde dann auch beim Lernquiz Musik noch nicht anzeigen,
 * sondern nur, wenn du im Heft-Eintrag auch was hast."
 *
 * AUSGEBLENDETE zaehlen nicht mit. Denny, als "HSU · 2 Blätter" dastand:
 * "Es müsste derzeit nur noch ein Blatt sein" - er hatte eines aus der
 * Ansicht genommen. Was Paul weggelegt hat, soll ihn nicht abfragen.
 *
 * Das Schuljahr beginnt am 1. September. Ein Blatt vom Juni gehoert zum
 * vorigen und zaehlt nicht mehr.
 */
export function schuljahrStart(heute) {
  const h = heute || heuteBerlin();
  const jahr = Number(h.slice(0, 4));
  // Vor September gehoert man noch zum Schuljahr, das im Vorjahr begann.
  return (Number(h.slice(5, 7)) >= 9 ? jahr : jahr - 1) + "-09-01";
}

export async function faecherImHeft(env, kind) {
  const e = await stoffLesen(env, kind, 13);       // gut ein Schuljahr
  if (!e.ok) return { ok: false, fehler: e.fehler };
  const ab = schuljahrStart(e.heute);

  const zahl = {};
  e.eintraege.forEach((x) => {
    if (x.sichtbar === false) return;              // weggelegt zaehlt nicht
    if (!x.datum || x.datum < ab) return;          // voriges Schuljahr
    const f = x.fach || "";
    if (!f || !FAECHER[f]) return;                 // ohne Fach nichts abfragen
    zahl[f] = (zahl[f] || 0) + 1;
  });

  const faecher = Object.keys(zahl)
    .map((f) => ({ fach: f, blaetter: zahl[f] }))
    .sort((a, b) => b.blaetter - a.blaetter || a.fach.localeCompare(b.fach));
  return { ok: true, ab, faecher };
}

/* Die Blaetter eines Fachs - damit Paul selbst aussuchen kann, welches
 * abgefragt wird. Denny am 23.09.2026: "Das gibt ihm schon ein Stück weit
 * Entscheidungsgewalt, anstatt dass ein Quiz erstellt wird über etwas, was er
 * gerade gar nicht abgefragt werden möchte." */
export async function blaetterImFach(env, kind, fach) {
  const e = await stoffLesen(env, kind, 13);
  if (!e.ok) return { ok: false, fehler: e.fehler };
  const ab = schuljahrStart(e.heute);
  const liste = e.eintraege.filter((x) =>
    x.sichtbar !== false && x.datum >= ab && (x.fach || "") === fach);
  return { ok: true, blaetter: liste };
}

export async function stoffBild(env, id, nr) {
  if (!/^[a-z0-9]{6,20}$/.test(String(id || ""))) return null;
  if (!env || !env.PAUL_KV) return null;
  try {
    return await env.PAUL_KV.get(BILD(id, Math.max(0, Math.min(5, Number(nr) || 0))));
  } catch (e) {
    return null;
  }
}

/* Den Titel nachtragen, den das Modell vom Bild gelesen hat.
 *
 * Laeuft NACH der Antwort (waitUntil), damit das Ablegen bei 1,4 Sekunden
 * bleibt. Kostet einen Schreibvorgang - der vierte je Eintrag, bei 1000 am
 * Tag traegt das. Findet sich der Eintrag nicht mehr (Paul hat ihn in der
 * Zwischenzeit weggeraeumt), passiert nichts. */
/* Was auf dem Blatt STEHT - Stichwortzeilen, wie sie blattLesen() liefert.
 *
 * Denny am 23.09.2026, mit einem Bild aus Pauls Lernquiz: "Wir haben doch
 * vorhin ganz klar als Regel festgehalten, dass die Frage nur aus dem Blatt
 * hervorkommen kann. … Diese Frage kommt auf dem Blatt nicht einmal hervor."
 * Gefragt worden war nach "300 ml aus der Regnitz-Probe" - auf seinem
 * Stadtporträt von Fürth steht davon kein Wort.
 *
 * Der Grund war nicht ein zu schwacher Riegel, sondern eine UNMOEGLICHE BITTE:
 * /api/quiz gab dem Modell nur den TITEL des Blattes mit ("Stadtporträt von
 * Fürth") und verlangte im selben Atemzug, ausschliesslich nach dem Blatt zu
 * fragen. Es hat das Blatt nie gesehen. Also hat es aus dem Titel geraten, und
 * das sah plausibel aus.
 *
 * Getrennt von titelSetzen(), weil das beim ersten gesetzten Titel aufhoert -
 * sonst liesse sich zu einem alten Blatt nie ein Inhalt nachtragen. */
/* Der Inhalt UND die Fundkarten wandern in EINEM Schreibvorgang an den
 * Eintrag. Schreibvorgaenge sind hier die knappe Zahl (1000 am Tag), nicht
 * der Platz - zwei Felder gehoeren deshalb in einen Schluessel, nicht in
 * zwei. */
export async function inhaltSetzen(env, kind, id, inhalt, karten) {
  if (!kindOk(kind) || !env || !env.PAUL_KV) return { ok: false };
  const zeilen = (Array.isArray(inhalt) ? inhalt : [])
    .map((z) => String(z || "").trim().slice(0, 90))
    .filter(Boolean)
    .slice(0, 14);
  const hatKarten = Array.isArray(karten) && karten.length > 0;
  if (!zeilen.length && !hatKarten) return { ok: true, nichts: true };

  const heute = heuteBerlin();
  for (let i = 0; i < 4; i++) {
    const d = new Date(heute + "T12:00:00Z");
    d.setUTCMonth(d.getUTCMonth() - i);
    const monat = d.toISOString().slice(0, 7);
    let roh;
    try { roh = await env.PAUL_KV.get(LISTE(kind, monat)); } catch (e) { return { ok: false }; }
    const liste = listeLesen(roh);
    if (liste === KAPUTT) return { ok: false };
    const treffer = liste.findIndex((e) => e.id === id);
    if (treffer < 0) continue;
    liste[treffer].inhalt = zeilen;
    if (Array.isArray(karten) && karten.length) liste[treffer].karten = karten.slice(0, 8);
    try { await env.PAUL_KV.put(LISTE(kind, monat), JSON.stringify(liste)); }
    catch (e) { return { ok: false }; }
    return { ok: true, zeilen: zeilen.length };
  }
  return { ok: false, fehlt: true };
}

export async function titelSetzen(env, kind, id, titel, warum) {
  if (!kindOk(kind) || !env || !env.PAUL_KV) return { ok: false };
  const heute = heuteBerlin();
  for (let i = 0; i < 2; i++) {          // dieser und der Vormonat reichen
    const d = new Date(heute + "T12:00:00Z");
    d.setUTCMonth(d.getUTCMonth() - i);
    const monat = d.toISOString().slice(0, 7);
    let roh;
    try { roh = await env.PAUL_KV.get(LISTE(kind, monat)); } catch (e) { return { ok: false }; }
    const liste = listeLesen(roh);
    if (liste === KAPUTT) return { ok: false };
    const treffer = liste.findIndex((e) => e.id === id);
    if (treffer < 0) continue;
    // Nur setzen, wenn noch keiner dasteht - ein von Hand geschriebener
    // Titel gewinnt immer gegen einen geratenen.
    if (liste[treffer].titel) return { ok: true, schon: true };
    if (titel) liste[treffer].titel = String(titel).slice(0, 60);
    /* Warum kein Titel dasteht, gehoert in den Eintrag - sonst sucht man
       beim naechsten Mal wieder von vorn. Der Schaukasten zeigt es nicht,
       nur werkstatt.sh und der Elternbereich koennen es lesen. */
    else if (warum) liste[treffer].titelWarum = String(warum).slice(0, 100);
    else return { ok: true, nichts: true };
    try { await env.PAUL_KV.put(LISTE(kind, monat), JSON.stringify(liste)); }
    catch (e) { return { ok: false }; }
    return { ok: true };
  }
  return { ok: false };
}

/* Das Datum nachtragen, das auf dem Blatt stand.
 *
 * Denny am 22.09.2026, nachdem er absichtlich ein falsches gewaehlt hatte:
 * "Du müsstest aber das Datum oben rechts oder oben links sehen." Und: "am
 * Ende hilft es natürlich der Zuordnung."
 *
 * Der Eintrag WANDERT dabei unter Umstaenden in einen anderen Monat - die
 * Liste ist nach Monat geschluesselt. Deshalb: aus der alten nehmen, in die
 * neue legen. Was das Kind gewaehlt hatte, bleibt als datumGewaehlt stehen;
 * ein stillschweigend getauschtes Datum waere schlimmer als ein falsches. */
export async function datumSetzen(env, kind, id, neuesDatum, altesDatum) {
  if (!kindOk(kind) || !env || !env.PAUL_KV) return { ok: false };
  if (!datumOk(neuesDatum)) return { ok: false };
  const altMonat = monatVon(altesDatum || heuteBerlin());
  const neuMonat = monatVon(neuesDatum);

  let roh;
  try { roh = await env.PAUL_KV.get(LISTE(kind, altMonat)); } catch (e) { return { ok: false }; }
  const liste = listeLesen(roh);
  if (liste === KAPUTT) return { ok: false };
  const treffer = liste.findIndex((e) => e.id === id);
  if (treffer < 0) return { ok: false };

  const eintrag = liste[treffer];
  eintrag.datumGewaehlt = eintrag.datum;     // was das Kind angegeben hatte
  eintrag.datum = neuesDatum;
  eintrag.datumVon = "blatt";

  if (altMonat === neuMonat) {
    liste.sort((x, y) => (y.datum || "").localeCompare(x.datum || ""));
    try { await env.PAUL_KV.put(LISTE(kind, altMonat), JSON.stringify(liste)); }
    catch (e) { return { ok: false }; }
    return { ok: true };
  }

  // Ueber die Monatsgrenze: erst in die neue Liste, dann aus der alten.
  // Andersherum waere der Eintrag bei einem Abbruch dazwischen weg.
  let roh2;
  try { roh2 = await env.PAUL_KV.get(LISTE(kind, neuMonat)); } catch (e) { return { ok: false }; }
  const liste2 = listeLesen(roh2);
  if (liste2 === KAPUTT) return { ok: false };
  liste2.unshift(eintrag);
  liste2.sort((x, y) => (y.datum || "").localeCompare(x.datum || ""));
  try { await env.PAUL_KV.put(LISTE(kind, neuMonat), JSON.stringify(liste2.slice(0, 300))); }
  catch (e) { return { ok: false }; }

  liste.splice(treffer, 1);
  try { await env.PAUL_KV.put(LISTE(kind, altMonat), JSON.stringify(liste)); }
  catch (e) { return { ok: true, doppelt: true }; }   // steht jetzt zweimal - beim naechsten Lesen sichtbar
  return { ok: true, verschoben: true };
}

/* Den offenen Datums-Vorschlag am Eintrag vermerken (oder loeschen).
 *
 * Damit kann das Kind spaeter GENAU dieses Datum bestaetigen - und kein
 * anderes. Ein leerer Wert raeumt die Frage weg. */
export async function vorschlagSetzen(env, kind, id, datum) {
  if (!kindOk(kind) || !env || !env.PAUL_KV) return { ok: false };
  const heute = heuteBerlin();
  for (let i = 0; i < 3; i++) {
    const d = new Date(heute + "T12:00:00Z");
    d.setUTCMonth(d.getUTCMonth() - i);
    const monat = d.toISOString().slice(0, 7);
    let roh;
    try { roh = await env.PAUL_KV.get(LISTE(kind, monat)); } catch (e) { return { ok: false }; }
    const liste = listeLesen(roh);
    if (liste === KAPUTT) return { ok: false };
    const treffer = liste.findIndex((e) => e.id === id);
    if (treffer < 0) continue;
    if (datum) liste[treffer].datumVorschlag = String(datum).slice(0, 10);
    else delete liste[treffer].datumVorschlag;
    try { await env.PAUL_KV.put(LISTE(kind, monat), JSON.stringify(liste)); }
    catch (e) { return { ok: false }; }
    return { ok: true };
  }
  return { ok: false };
}

/* Die Art eines Eintrags nachtragen: Schulheft oder Uebungsblatt.
 *
 * Gebraucht fuer die Blaetter, die VOR der Unterscheidung abgelegt wurden -
 * bei ihnen steht art auf "". Denny am 23.09.2026 zum HSU-Blatt im Schaukasten:
 * "Das ist ja ein Hefteintrag, und ich finde, das sollte man hier auch
 * erkennen ... Jedenfalls musst du das Blatt dann auch dementsprechend
 * verschieben."
 *
 * NUR mit Eltern-Ausweis, wie beim Datum: Was das Kind beim Hochladen gewaehlt
 * hat, ist seine Antwort auf "Wo stand das?" - und die entscheidet, ob daraus
 * spaeter gefragt wird. Sie soll nicht nebenbei umgestellt werden koennen. */
export async function artSetzen(env, kind, id, art) {
  if (!kindOk(kind)) return { ok: false, fehler: "Unbekanntes Kind." };
  if (!env || !env.PAUL_KV) return { ok: false, fehler: "Der Speicher ist gerade nicht da." };
  if (!ARTEN[art]) return { ok: false, fehler: "Das kenne ich nicht." };

  const heute = heuteBerlin();
  for (let i = 0; i < MONATE_ZURUECK; i++) {
    const d = new Date(heute + "T12:00:00Z");
    d.setUTCMonth(d.getUTCMonth() - i);
    const monat = d.toISOString().slice(0, 7);
    let roh;
    try {
      roh = await env.PAUL_KV.get(LISTE(kind, monat));
    } catch (e) {
      return { ok: false, fehler: "Ich komme gerade nicht an dein Heft. Bitte später nochmal." };
    }
    const liste = listeLesen(roh);
    if (liste === KAPUTT) return { ok: false, fehler: "Dein Heft ist gerade nicht lesbar." };
    const treffer = liste.findIndex((e) => e.id === id);
    if (treffer < 0) continue;

    const vorher = liste[treffer].art || "";
    liste[treffer].art = art;
    // Erst lesen, dann schreiben: ein put mit demselben Wert kostet genauso
    // viel wie ein echtes, und das Tageskontingent ist die knappe Zahl.
    const neu = JSON.stringify(liste);
    if (neu !== roh) {
      try {
        await env.PAUL_KV.put(LISTE(kind, monat), neu);
      } catch (e) {
        return { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Bitte später nochmal." };
      }
    }
    return { ok: true, von: vorher, auf: art };
  }
  return { ok: false, fehler: "Das finde ich nicht mehr." };
}

/* Verstecken und Wiederholen - ein Tipp, umkehrbar, das Bild bleibt.
 * "weg" nimmt nur den Eintrag aus der Liste; die Bilder liegen weiter da. */
export async function stoffAendern(env, kind, id, was) {
  if (!kindOk(kind)) return { ok: false, fehler: "Unbekanntes Kind." };
  if (!env || !env.PAUL_KV) return { ok: false, fehler: "Der Speicher ist gerade nicht da." };
  if (!["verstecken", "zeigen", "weg"].includes(was)) return { ok: false, fehler: "Das kenne ich nicht." };

  const heute = heuteBerlin();
  for (let i = 0; i < MONATE_ZURUECK; i++) {
    const d = new Date(heute + "T12:00:00Z");
    d.setUTCMonth(d.getUTCMonth() - i);
    const monat = d.toISOString().slice(0, 7);
    let roh;
    try {
      roh = await env.PAUL_KV.get(LISTE(kind, monat));
    } catch (e) {
      return { ok: false, fehler: "Ich komme gerade nicht an dein Heft. Bitte später nochmal." };
    }
    const liste = listeLesen(roh);
    if (liste === KAPUTT) return { ok: false, fehler: "Dein Heft ist gerade nicht lesbar." };
    const treffer = liste.findIndex((e) => e.id === id);
    if (treffer < 0) continue;

    if (was === "weg") liste.splice(treffer, 1);
    else liste[treffer].sichtbar = (was === "zeigen");

    // Vor dem Schreiben pruefen, ob sich wirklich etwas aendert: ein put, das
    // denselben Wert schreibt, kostet genauso viel wie ein echtes.
    const neu = JSON.stringify(liste);
    if (neu !== roh) {
      try {
        await env.PAUL_KV.put(LISTE(kind, monat), neu);
      } catch (e) {
        return { ok: false, fehler: "Der Speicher nimmt gerade nichts an. Bitte später nochmal." };
      }
    }
    return { ok: true, was };
  }
  return { ok: false, fehler: "Das finde ich nicht mehr." };
}
