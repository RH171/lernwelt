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
    thema: String(eintrag.thema || "").slice(0, 160),
    titel: String(eintrag.titel || "").slice(0, 120),
    notiz: String(eintrag.notiz || "").slice(0, 400),
    seiten: bilder.length,
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
