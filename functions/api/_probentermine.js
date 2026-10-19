/* Probentermine je Kind (04.10.2026).
 *
 * Denny: Paul schreibt am Freitag, 09.10.2026 die Probe "D | Lesen". Die
 * Lernwelt soll das wissen und eine passende Uebung oben anbieten.
 *
 * Ein Schluessel je Kind: proben-termine:<kind> = { termine: [{datum, fach, thema}] }.
 * Gesetzt wird nur mit Elternausweis (noten.js), gelesen vom Kind ueber
 * GET /api/noten?eigene=1 - dort nur heutige und kuenftige Termine.
 *
 * Schreibvorgaenge sind die knappe Zahl (1000 am Tag): vor jedem put erst
 * get, ein gleicher Termin wird nicht noch einmal geschrieben, ein Loeschen
 * ohne Treffer schreibt nichts.
 */

export const TERMIN_SCHLUESSEL = (kind) => "proben-termine:" + kind;
export const TERMINE_MAX = 40;
export const TERMIN_ARTEN = ["schulaufgabe", "kurzarbeit", "ex", "muendlich", "test"];

/* "Heute" in deutscher Zeit - der Worker laeuft in UTC, bis 2 Uhr waere es
 * sonst noch gestern (dieselbe Falle wie am 30.09.2026 im Elternbereich). */
export function berlinHeute(jetzt = new Date()) {
  return jetzt.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

export function terminPruefen(roh, optionen = {}) {
  const t = roh || {};
  const datum = String(t.datum || "").trim();
  const fach = String(t.fach || "").trim().toLowerCase();
  const thema = String(t.thema || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) return { fehler: "Datum bitte als JJJJ-MM-TT." };
  const d = new Date(datum + "T12:00:00Z");
  if (isNaN(d) || d.toISOString().slice(0, 10) !== datum) return { fehler: "Dieses Datum gibt es nicht." };
  if (!/^[a-z][a-z-]{1,19}$/.test(fach)) return { fehler: "Fach bitte als kurzes Wort, z. B. deutsch." };
  if ((!thema && !optionen.themaOptional) || thema.length > 40) return { fehler: "Thema fehlt oder ist zu lang (höchstens 40 Zeichen)." };
  /* Art der Pruefung (19.10.2026, Helena: Schulaufgabe, Kurzarbeit, Ex,
     muendlich, Test). Freiwillig - alte Seiten schicken keine, dann bleibt
     der Termin wie bisher {datum, fach, thema}. Unbekanntes faellt still weg. */
  const art = String(t.art || "").trim().toLowerCase();
  if (TERMIN_ARTEN.includes(art)) return { termin: { datum, fach, thema, art } };
  return { termin: { datum, fach, thema } };
}

/* null heisst: der Speicher hat nicht geantwortet. Ein leeres Array heisst:
 * es gibt keine Termine. Beides darf nie verwechselt werden. */
export async function termineLesen(env, kind) {
  try {
    const roh = await env.PAUL_KV.get(TERMIN_SCHLUESSEL(kind));
    if (!roh) return [];
    const d = JSON.parse(roh);
    return Array.isArray(d && d.termine) ? d.termine : [];
  } catch (e) {
    return null;
  }
}

// Der Tageszaehler des Kindes (siehe unten) geht bei Eltern-Schreibvorgaengen nicht verloren.
const mitZaehler = (inhalt, dok) => (dok && dok.kindSchreib ? { ...inhalt, kindSchreib: dok.kindSchreib } : inhalt);
const gleich = (a, b) => a.datum === b.datum && a.fach === b.fach;
const ordnen = (liste) => liste.slice().sort((a, b) =>
  a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : a.fach < b.fach ? -1 : 1);

/* Setzt oder ersetzt einen Termin (gleicher Tag + gleiches Fach = derselbe).
 * Wirft bei Speicherfehler - der Aufrufer meldet es ehrlich. */
export async function terminSetzen(env, kind, termin) {
  const dok = await dokLesen(env, kind);
  if (dok === null) throw new Error("lesen");
  const liste = dok.termine;
  const alt = liste.find((t) => gleich(t, termin));
  if (alt && alt.thema === termin.thema && (alt.art || "") === (termin.art || "")) return { geschrieben: false, termine: ordnen(liste) };
  const neu = ordnen(liste.filter((t) => !gleich(t, termin)).concat([termin])).slice(-TERMINE_MAX);
  await env.PAUL_KV.put(TERMIN_SCHLUESSEL(kind), JSON.stringify(mitZaehler({ termine: neu }, dok)));
  return { geschrieben: true, termine: neu };
}

export async function terminWeg(env, kind, datum, fach) {
  const dok = await dokLesen(env, kind);
  if (dok === null) throw new Error("lesen");
  const liste = dok.termine;
  const rest = liste.filter((t) => !(t.datum === datum && (!fach || t.fach === fach)));
  if (rest.length === liste.length) return { geschrieben: false, gefunden: false, termine: ordnen(liste) };
  await env.PAUL_KV.put(TERMIN_SCHLUESSEL(kind), JSON.stringify(mitZaehler({ termine: rest }, dok)));
  return { geschrieben: true, gefunden: true, termine: ordnen(rest) };
}

/* Nur heutige und kuenftige Termine, nach Datum. */
export function kuenftige(liste, heute) {
  return ordnen((liste || []).filter((t) => t && typeof t.datum === "string" && t.datum >= heute));
}


/* ===========================================================================
   Das Kind traegt selbst ein (13.10.2026, Dennys Wahl per Klickfrage).

   Paul bekommt Proben in der Schule angekuendigt und soll sie selbst
   eintragen koennen. Der Speicher bleibt derselbe (proben-termine:<kind>),
   der Eintrag traegt von:"<kind>". Grenzen gegen Unfug und gegen das
   KV-Kontingent (1000 Schreibvorgaenge am Tag fuer ALLES):
     - nur eigenes Kind, nur heute bis heute+60 Tage, nie Samstag/Sonntag
     - hoechstens 10 kuenftige Termine
     - hoechstens 5 Schreibvorgaenge des Kindes am Tag (Setzen, Aendern,
       Loeschen zusammen). Der Zaehler steht IM SELBEN Dokument
       ({termine, kindSchreib:{tag, n}}) und kostet keinen eigenen put.
     - aendern und loeschen nur eigene Eintraege (von === kind), die noch
       nicht vorbei sind. Was die Eltern eingetragen haben, bleibt.
   Die Eltern duerfen weiter alles (noten.js).
   =========================================================================== */
export const KIND_TAGE_VORAUS = 60;
export const KIND_KUENFTIG_MAX = 10;
export const KIND_SCHREIB_MAX = 5;

/* Helena (19.10.2026, Denny: "Prüfungen eintragen"): Am Gymnasium stehen die
   Schulaufgaben oft schon zu Beginn des Halbjahrs fest, und es sind in den vier
   Hauptfaechern 15 im Jahr. Deshalb darf sie weiter voraus (150 Tage, bis zum
   Halbjahr), mehr kuenftige (20) und an einem Tag mehr (10) eintragen - ein
   Schulaufgabenplan auf einmal. Paul und Leon bleiben bei den Werten oben. */
export const KIND_GRENZEN = {
  helena: { voraus: 150, kuenftig: 20, schreib: 10 },
};
export function kindGrenzen(kind) {
  const g = KIND_GRENZEN[kind] || {};
  return { voraus: g.voraus || KIND_TAGE_VORAUS, kuenftig: g.kuenftig || KIND_KUENFTIG_MAX, schreib: g.schreib || KIND_SCHREIB_MAX };
}

export function plusTage(iso, n) {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function istWochenende(iso) {
  const w = new Date(iso + "T12:00:00Z").getUTCDay();
  return w === 0 || w === 6;
}

async function dokLesen(env, kind) {
  try {
    const roh = await env.PAUL_KV.get(TERMIN_SCHLUESSEL(kind));
    if (!roh) return { termine: [] };
    const d = JSON.parse(roh) || {};
    return { termine: Array.isArray(d.termine) ? d.termine : [], kindSchreib: d.kindSchreib };
  } catch (e) {
    return null;
  }
}

/* Ein Schreibvorgang des Kindes: {neu, alt} - neu = Termin (oder null beim
 * Loeschen), alt = {datum, fach} des Eintrags, der ersetzt/geloescht wird.
 * Rueckgabe {fehler, status} oder {geschrieben, termine}. Wirft bei
 * Speicherfehler beim Schreiben. von ist "eltern", wenn ein Erwachsener mit
 * dem Hauptschluessel am Kinder-Geraet eintraegt - dann darf das Kind ihn nicht aendern. */
export async function kindSchreiben(env, kind, { neu, alt, von = kind }, heute = berlinHeute()) {
  const dok = await dokLesen(env, kind);
  if (dok === null) throw new Error("lesen");
  const liste = dok.termine;
  const grenze = kindGrenzen(kind);
  const bis = plusTage(heute, grenze.voraus);

  let altEintrag = null;
  if (alt) {
    altEintrag = liste.find((t) => t.datum === alt.datum && t.fach === alt.fach) || null;
    const w = kind === "helena" ? "Prüfung" : "Probe";
    if (!altEintrag) return { status: 404, fehler: "Diese " + w + " gibt es nicht (mehr)." };
    if (altEintrag.von !== kind) return { status: 403, fehler: "Diese " + w + " hat ein Erwachsener eingetragen. Ändern können sie nur Mama oder Papa." };
    if (altEintrag.datum < heute) return { status: 403, fehler: "Diese " + w + " ist schon vorbei." };
  }
  if (neu) {
    if (neu.datum < heute) return { status: 400, fehler: "Dieser Tag ist schon vorbei." };
    if (neu.datum > bis) return { status: 400, fehler: grenze.voraus === KIND_TAGE_VORAUS
      ? "So weit voraus geht es nicht – höchstens zwei Monate."
      : "So weit voraus geht es nicht – höchstens " + grenze.voraus + " Tage." };
    if (istWochenende(neu.datum)) return { status: 400, fehler: "Das ist ein Wochenende – da ist keine Schule." };
    const fremd = liste.find((t) => gleich(t, neu) && t !== altEintrag);
    if (fremd && fremd.von !== kind) return { status: 409, fehler: (kind === "helena" ? "Diese Prüfung" : "Diese Probe") + " steht schon drin." };
  }

  let rest = liste.filter((t) => t !== altEintrag);
  if (neu) {
    const schonGleich = rest.find((t) => gleich(t, neu));
    if (!altEintrag && schonGleich && schonGleich.thema === neu.thema && (schonGleich.art || "") === (neu.art || "")) return { geschrieben: false, termine: ordnen(liste) };
    rest = rest.filter((t) => !gleich(t, neu));
    const kuenftigOhne = rest.filter((t) => t.datum >= heute).length;
    if (kuenftigOhne >= grenze.kuenftig) return { status: 400, fehler: "Es stehen schon " + grenze.kuenftig + (kind === "helena" ? " Prüfungen" : " Proben") + " drin. Lösch erst eine alte." };
    rest = rest.concat([{ ...neu, von, am: heute }]);
  }

  const z = dok.kindSchreib && dok.kindSchreib.tag === heute ? dok.kindSchreib.n : 0;
  if (z >= grenze.schreib) return { status: 429, fehler: "Für heute hast du genug eingetragen. Morgen geht es wieder – oder frag Mama oder Papa." };

  const termine = ordnen(rest).slice(-TERMINE_MAX);
  await env.PAUL_KV.put(TERMIN_SCHLUESSEL(kind), JSON.stringify({ termine, kindSchreib: { tag: heute, n: z + 1 } }));
  return { geschrieben: true, termine };
}

/* Eltern aendern einen Eintrag (Datum, Thema, Fach) in EINEM Schreibvorgang.
 * von bleibt erhalten - "von Paul" steht weiter dran. */
export async function terminAendern(env, kind, alt, neu) {
  const dok = await dokLesen(env, kind);
  if (dok === null) throw new Error("lesen");
  const altEintrag = dok.termine.find((t) => t.datum === alt.datum && t.fach === alt.fach);
  if (!altEintrag) return { gefunden: false, geschrieben: false, termine: ordnen(dok.termine) };
  const ersatz = { ...neu };
  if (altEintrag.von) ersatz.von = altEintrag.von;
  if (altEintrag.am) ersatz.am = altEintrag.am;
  const rest = dok.termine.filter((t) => t !== altEintrag && !gleich(t, neu)).concat([ersatz]);
  const termine = ordnen(rest).slice(-TERMINE_MAX);
  await env.PAUL_KV.put(TERMIN_SCHLUESSEL(kind), JSON.stringify(mitZaehler({ termine }, dok)));
  return { gefunden: true, geschrieben: true, termine };
}
