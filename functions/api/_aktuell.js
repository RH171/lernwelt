/* Schalter "aktuell" (Auftrag 207, 04.11.2026, nur Paul, Kapitel 164 im Entwurf)
 *
 * Wiederholung fuer junge Blaetter dichter machen. Alles hier ist rein (ohne Speicher), ausser
 * aktuellAn() und abschlussLesen(), die NUR lesen. Geschrieben wird der Abschluss-Schluessel
 * ausschliesslich von functions/api/aktuell-abschluss.js (Elternbereich).
 *
 * Standard AUS: Nur der KV-Wert schalter:aktuell = "neu" schaltet ein. Fehlt der Wert, steht
 * etwas anderes darin oder wirft der Speicher, bleibt alles genau wie vor dem 04.11.2026
 * (gepruefte Gegenprobe in pruefe-aktuell.mjs).
 *   einschalten: npx wrangler kv key put "schalter:aktuell" "neu" --namespace-id b0c17f5eabaa4a4da3212117a236dae2 --remote
 *   aus:         npx wrangler kv key put "schalter:aktuell" "alt" --namespace-id b0c17f5eabaa4a4da3212117a236dae2 --remote
 *
 * Regeln (Dennys Wortlaut in unterlagen/aktuell-2026-11-04/auftrag-207.md):
 *   A  Ein Blatt ist offen, bis Denny es im Elternbereich als "abgefragt" bestaetigt. Keine Tagesgrenze,
 *      kein Datumsschnitt, keine Ersatzregel (Dennys Beschluss 04.11.2026, 12:55 Uhr: "nur bestaetigte
 *      Stufe abgefragt schliesst"; im Zweifel offen).
 *   B  Offene Blaetter: junge Karten taeglich, bis sie sitzen; dann 3 Tage, dann 1, 2, 3, 5 Tage,
 *      nie 7 oder mehr. Jedes offene Blatt taeglich mindestens eine Karte, die unsicherste
 *      zuerst, sichere im Wechsel. Deckel 3 je Blatt bleibt (wiederholung4), Fehler immer.
 *   C  5-10 Minuten je Fach nach Bedarf, nach einem Ausfalltag x1,5 (hoechstens 15),
 *      geschafftes Fach 2 Minuten. Minuten -> Fragen ueber Sekunden je Frage.
 *   D  Nur als Mechanik: bis kniffligJeTag "knifflige" Karten aus abgeschlossenen Blaettern.
 *   E  Altbestand in freier Zeit: zuletzt falsch zuerst, dann am laengsten nicht gefragt.
 *   F  Abschluss nur im Elternbereich (aktuell-abschluss.js), eigener KV-Schluessel. Je Blatt eine Stufe:
 *      "abgefragt" (abgeschlossen), "nicht abgefragt" (offen), "unsicher" (offen, ein Satz Begruendung),
 *      "probenzeitraum" (Probenzeitraum, nicht abgefragt: abgeschlossen ohne Abfrage, Regel 3 von Auftrag 208).
 *   Auftrag 208 (04.11.2026): bestaetigte Proben aus _aktuell-vorschlag.js gelten als Grundstand (basis, nie im KV,
 *      AKTUELL.vorschlagBasis); Grundlagen-Blaetter bekommen im Altbestand E einen hoeheren Anteil (AKTUELL.grundlageGewicht, Nachbesserung 3b).
 */
import { berlinTagNr, istSicher4, fachNorm } from "./_wiedervorlage.js";
import { VORSCHLAG, GRUNDLAGE } from "./_aktuell-vorschlag.js";

export const AKTUELL = {
  /* Eine Karte "sitzt" (Regel B), sobald die laufende Richtig-Folge zwei Berliner Kalendertage
     umfasst: erstes Richtig der Folge (t1) und letzte Antwort (z) mindestens sitztTage auseinander.
     1 = "richtig an zwei Tagen hintereinander". Vorschlag, Denny entscheidet. */
  sitztTage: 1,
  /* Abstaende nach dem Sitzen, in Kalendertagen ab dem Tag, an dem sie sass: 3, dann 1, 2, 3, 5;
     der letzte Wert wiederholt sich. Nie mehr als hoechstTage (Dennys "nie 7 oder mehr"). */
  stufenTage: [3, 1, 2, 3, 5],
  hoechstTage: 5,
  /* Jedes offene Blatt bekommt taeglich so viele Karten dazu, wenn heute noch keine dran war
     und keine faellig ist (Regel B, "ein paar Fragen"). */
  offenJeBlattTaeglich: 1,
  /* Regel C. bedarfJeMinute: so viele faellige Karten rechtfertigen eine Minute (Annahme). */
  minuten: { min: 5, max: 10, geschafft: 2, ausfallFaktor: 1.5, deckel: 15 },
  bedarfJeMinute: 3,
  /* Sekunden je Frage je Fach (gemessen, Vorab-Pruefung 04.11.2026, unterlagen/aktuell-2026-11-04/vorab.md,
     Median ueber die Sitzungsdauer): Mathe 37 s, HSU 16,5 s, Deutsch 12-23 s mit Planungswert 20 s.
     Englisch und alles andere: standard 20 s (⚠️ Annahme, keine eigene Messung). */
  sekundenJeFrage: { mathe: 37, hsu: 16.5, deutsch: 20, standard: 20 },
  /* Wann ein offenes Blatt "gefestigt" ist (Denny 04.11.2026: mindestens 70 % der Karten zuletzt richtig,
     an mindestens 2 Tagen). Nur Anzeige, steuert nichts. Wort "gefestigt", weil "sitzt" schon belegt ist
     (Tagesbericht "sitzt gut" = ab 5 Aufgaben in 7 Tagen, "Mein Heft" "sitzt" = beim letzten Mal gewusst).
     Nach der Messung am 12.11.2026 fragen, ob verschaerft wird (Beschluss 04.11.2026). */
  blattGefestigt: { anteil: 0.7, tage: 2 },
  /* VORSCHLAG (nicht bestaetigt, Standard AUS): Vorrang nur fuer offene Blaetter nach der letzten
     bestaetigten Probe des Fachs plus Blaetter mit Stufe "nicht abgefragt" oder "unsicher". Offene
     Blaetter davor ohne Stufe bleiben offen (nie abgeschlossen), ueben aber wie der Altbestand (Regel E).
     Faecher ohne bestaetigte Probe: alles Offene hat Vorrang. false = alle offenen Blaetter haben Vorrang. */
  vorrangGrenze: false,
  /* Regel D, nur Mechanik: hoechstens so viele knifflige Karten aus abgeschlossenen Blaettern je
     Runde, ohne Mindestzeit. "Knifflig" = frueher schon einmal falsch (fz oder f) - ⚠️ Annahme (Einstellwert, Denny bestaetigt 04.11.2026 noch nicht). */
  kniffligJeTag: 3,
  /* Regel 5 (Auftrag 208, 04.11.2026): Grundlagen-Blaetter (Feld "grundlage" in proben-stufen.json, GRUNDLAGE in
     _aktuell-vorschlag.js) bekommen nach dem Abschluss einen hoeheren Anteil im Altbestand (Regel E).
     Seit Nachbesserung 3b (04.11.2026) als ANTEIL, an zwei Stellen, beide nur im Pfad schalter:aktuell = neu:
       1. Auswahl: quiz.js gibt quizReihe4 grundlageFaktor = grundlageGewicht; Altbestand-Karten OHNE Grundlage wiegen
          dort 1/Faktor (Grundlagen und offene Blaetter unveraendert).
       2. Reihenfolge im freien Ueben (freiAktuell): Grundlagen und andere Altbestand-Karten im Verhaeltnis g : 1 gemischt,
          bei den Kniffligen (D, vor dem Abschneiden) und in E getrennt fuer "zuletzt falsch" und den Rest.
     "Zuletzt falsch zuerst" bleibt das erste Merkmal, E steht weiter hinter allen offenen unsicheren Karten -
     kein Vorrang vor offenen Blaettern. 1 = aus (wie vor Auftrag 208). 2 = Vorschlag (⚠️ Annahme, Claudes Wahl). */
  grundlageGewicht: 2,
  /* Auftrag 208: Proben mit "bestaetigt" in der Vorschlagsdatei (Mathe 19.10.2026, Denny im Chat 04.11.2026) gelten als
     Grundstand, ohne KV-Schreiben. Jeder Abschluss von der Elternseite gilt vorrangig (juengste Stufe je Kennung).
     false = nur Abschluesse aus dem Speicher (Stand vor Auftrag 208). */
  vorschlagBasis: true,
};

export const ABSCHLUSS = (kind) => "aktuell-abschluss:" + kind;
export const SCHALTER = "schalter:aktuell";

/* Nur "neu" schaltet ein. Wirft nie. */
export async function aktuellAn(env) {
  try {
    const roh = env && env.PAUL_KV ? await env.PAUL_KV.get(SCHALTER) : null;
    return roh != null && String(roh).trim().replace(/^["']|["']$/g, "").trim().toLowerCase() === "neu";
  } catch (e) { return false; }
}

const TAGFORMAT = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" });

/* Schuldatum eines Blattes - EINE Stelle fuer alles in diesem Modul.
   Blattdatum mit Herkunft (Kapitel 150): datumVon "blatt" oder "kind" mit gueltigem Datum ->
   dieses Datum; sonst ("ohne", leer) der Tag des Hochladens (angelegt, Berliner Tag).
   Rueckgabe { datum: "JJJJ-MM-TT" | "", von: "blatt" | "kind" | "upload" | "", unsicher? } */
export function schuldatum(blatt) {
  if (!blatt) return { datum: "", von: "" };
  const d = String(blatt.datum || "").slice(0, 10);
  const gueltig = /^\d{4}-\d{2}-\d{2}$/.test(d);
  const a = Date.parse(blatt.angelegt || "");
  /* Pauls unsicheres Datum (datumVon "kind", datumUnsicher): der spaetere Tag von Blattdatum und
     Hochladen (Vorschlag Vorab-Pruefung 04.11.2026) - ein Blatt gilt so eher als jung als zu alt. */
  if (gueltig && blatt.datumVon === "kind" && blatt.datumUnsicher && Number.isFinite(a)) {
    const up = TAGFORMAT.format(new Date(a));
    return up > d ? { datum: up, von: "upload", unsicher: true, blattdatum: d } : { datum: d, von: "kind", unsicher: true };
  }
  if (gueltig && (blatt.datumVon === "blatt" || blatt.datumVon === "kind"))
    return { datum: d, von: blatt.datumVon, ...(blatt.datumUnsicher ? { unsicher: true } : {}) };
  if (blatt.datumVon === "ohne" && Number.isFinite(a)) return { datum: TAGFORMAT.format(new Date(a)), von: "upload" };
  /* Altbestand ohne datumVon: Blattdatum, aber als unsicher markiert; ohne Datum der Upload. */
  if (gueltig && blatt.datumVon == null) return { datum: d, von: "blatt", unsicher: true };
  if (Number.isFinite(a)) return { datum: TAGFORMAT.format(new Date(a)), von: "upload" };
  return { datum: "", von: "" };
}

/* "probenzeitraum" = Probenzeitraum, nicht abgefragt (Regel 3, Auftrag 208): schliesst wie "abgefragt". */
export const STUFEN = ["abgefragt", "nicht abgefragt", "unsicher", "probenzeitraum"];
export const SCHLIESST = new Set(["abgefragt", "probenzeitraum"]);
export const STUFE_LESBAR = { "abgefragt": "abgefragt", "nicht abgefragt": "nicht abgefragt", "unsicher": "unsicher", "probenzeitraum": "Probenzeitraum, nicht abgefragt" };

/* Bestaetigte Proben aus der Vorschlagsdatei als Abschluss-Eintraege (gesetzt 0: jeder gespeicherte Abschluss gilt danach). */
export function basisAusVorschlag(kind, k) {
  const K = k || AKTUELL;
  if (!K.vorschlagBasis) return [];
  return ((VORSCHLAG && VORSCHLAG[kind] && VORSCHLAG[kind].proben) || []).filter((p) => p && p.bestaetigt && !p.vorlaeufig).map((p) => ({
    fach: p.fach, probe: String(p.probe || ""), probeDatum: String(p.probeDatum || ""), gesetzt: 0, basis: true,
    bestaetigt: p.bestaetigt, stufen: Object.fromEntries((p.blaetter || []).filter((b) => STUFEN.includes(b.stufe)).map((b) => [String(b.blattId), b.stufe])),
  }));
}

/* Grundlagen je Kind: Set der Blatt-Kennungen (Regel 5). */
export function grundlageIds(kind) {
  return new Set(Object.keys((GRUNDLAGE && GRUNDLAGE[kind]) || {}));
}
export function grundlageText(kind, id) {
  return String(((GRUNDLAGE && GRUNDLAGE[kind]) || {})[String(id)] || "");
}

/* Abschluss-Stand lesen. Wirft nie; kaputt oder leer = keine Abschluesse.
   { v: 2, abschluesse: [{ fach, probe, probeDatum, stufen: { blattId: Stufe }, begruendungen: { blattId: Satz }, gesetzt }] }
   (v1-Eintraege mit ids gab es nur im Bau; sie gelten als "abgefragt" fuer genau diese Kennungen.) */
export async function abschlussLesen(env, kind) {
  /* fehler: true = Speicher nicht lesbar oder Inhalt kaputt. Lesende Wege rechnen dann ohne Abschluss
     weiter; die Elternseite schreibt in diesem Fall NICHT (sonst waeren alle Abschluesse weg). */
  /* basis: bestaetigte Proben aus der Vorschlagsdatei (nie geschrieben, gilt auch bei Lesefehler). */
  const basis = basisAusVorschlag(kind);
  let roh = null;
  try { roh = env && env.PAUL_KV ? await env.PAUL_KV.get(ABSCHLUSS(kind)) : null; }
  catch (e) { return { v: 1, abschluesse: [], basis, fehler: true }; }
  if (roh == null || roh === "") return { v: 1, abschluesse: [], basis };
  try {
    const d = JSON.parse(roh);
    if (d && Array.isArray(d.abschluesse))
      return { v: 2, abschluesse: d.abschluesse.filter((a) => a && a.fach && (Array.isArray(a.ids) || (a.stufen && typeof a.stufen === "object"))), basis };
  } catch (e) {}
  return { v: 1, abschluesse: [], basis, fehler: true };
}

/* Stufen je Fach (Regel A/F, Nachbesserung 2, 04.11.2026):
   { fach: Set der Kennungen mit Stufe "abgefragt",
     .markiert  Set der Kennungen mit "nicht abgefragt" oder "unsicher",
     .probeDatum juengstes Probendatum eines Abschlusses dieses Fachs mit mindestens einem "abgefragt" }.
   Abschluesse werden nach "gesetzt" angewandt; die juengste Stufe einer Kennung gilt. */
export function geschlossenJeFach(abschluss) {
  const raus = {};
  const liste = ((abschluss && abschluss.basis) || []).concat((abschluss && abschluss.abschluesse) || []).sort((x, y) => (Number(x.gesetzt) || 0) - (Number(y.gesetzt) || 0));
  const stufe = {};
  for (const a of liste) {
    const f = fachNorm(a.fach);
    if (!f) continue;
    if (!stufe[f]) stufe[f] = {};
    const st = a.stufen && typeof a.stufen === "object" ? a.stufen : {};
    for (const id of Object.keys(st)) if (STUFEN.includes(st[id])) stufe[f][String(id)] = st[id];
    if (Array.isArray(a.ids)) for (const id of a.ids) stufe[f][String(id)] = "abgefragt";
    const abgefragt = Object.values(st).some((x) => SCHLIESST.has(x)) || (Array.isArray(a.ids) && a.ids.length > 0);
    const pd = String(a.probeDatum || a.probe || "");
    if (!raus[f]) { raus[f] = new Set(); raus[f].markiert = new Set(); raus[f].probeDatum = ""; raus[f].stufe = {}; }
    if (abgefragt && /^\d{4}-\d{2}-\d{2}$/.test(pd) && pd > raus[f].probeDatum) raus[f].probeDatum = pd;
  }
  for (const f of Object.keys(stufe)) for (const id of Object.keys(stufe[f])) {
    raus[f].stufe[id] = stufe[f][id];
    if (SCHLIESST.has(stufe[f][id])) raus[f].add(id); else raus[f].markiert.add(id);
  }
  return raus;
}

/* Geschlossen = Stufe "abgefragt" bestaetigt. zuF = geschlossenJeFach(...)[fach]. */
export function istGeschlossen(blatt, zuF) {
  return !!(blatt && zuF && zuF.has(String(blatt.id)));
}

/* Regel A: offen = sichtbar und nicht als "abgefragt" bestaetigt. Kein Datum schliesst. */
export function offenesBlatt(blatt, geschlossen) {
  if (!blatt || blatt.sichtbar === false) return false;
  return !istGeschlossen(blatt, geschlossen && geschlossen[fachNorm(blatt.fach)]);
}

/* VORSCHLAG Vorrang (AKTUELL.vorrangGrenze): offen UND (Fach ohne bestaetigte Probe ODER Stufe
   "nicht abgefragt"/"unsicher" ODER Schuldatum am/nach der letzten bestaetigten Probe ODER ohne Datum). */
export function vorrangBlatt(blatt, geschlossen, k) {
  if (!offenesBlatt(blatt, geschlossen)) return false;
  const K = k || AKTUELL;
  if (!K.vorrangGrenze) return true;
  const zuF = geschlossen && geschlossen[fachNorm(blatt.fach)];
  if (!zuF || !zuF.probeDatum) return true;
  if (zuF.markiert && zuF.markiert.has(String(blatt.id))) return true;
  const sd = schuldatum(blatt).datum;
  return !sd || sd >= zuF.probeDatum;
}

/* Die Blaetter, die dicht wiederholt werden (Regel B): alle offenen, mit Vorschlag nur die mit Vorrang. */
export function offeneIds(blattNach, geschlossen, k) {
  const s = new Set();
  for (const id of Object.keys(blattNach || {})) if (vorrangBlatt(blattNach[id], geschlossen, k)) s.add(id);
  return s;
}

export function blattVonSchluessel(s) {
  const i = String(s || "").indexOf("#");
  return i > 0 ? s.slice(0, i) : "";
}

/* Regel B: Abstand in Kalendertagen bis zur naechsten Faelligkeit einer Karte eines offenen
   Blattes, gerechnet ab dem Tag der letzten Antwort. 0 = nie gespielt.
   Nicht sitzend (zuletzt falsch, keine Richtig-Folge, Folge nur an einem Tag) -> 1 (taeglich).
   Sitzend: Marken ab dem ersten Richtig der Folge (t1): sitztTage, dann + 3, 1, 2, 3, 5, 5 ...;
   Abstand = naechste Marke nach der heutigen Spanne, begrenzt auf 1..hoechstTage. */
export function abstandAktuell(p, k) {
  const K = k || AKTUELL;
  if (!p || !p.z) return 0;
  if (p.f || !p.t1) return 1;
  const spanne = berlinTagNr(Number(p.z)) - berlinTagNr(Number(p.t1));
  if (spanne < K.sitztTage) return 1;
  let marke = K.sitztTage, i = 0;
  while (marke <= spanne && i < 1000) { marke += K.stufenTage[Math.min(i, K.stufenTage.length - 1)]; i++; }
  return Math.max(1, Math.min(K.hoechstTage, marke - spanne));
}

export function sitztAktuell(p, k) {
  const K = k || AKTUELL;
  if (!p || !p.z || p.f || !p.t1) return false;
  return berlinTagNr(Number(p.z)) - berlinTagNr(Number(p.t1)) >= K.sitztTage;
}

/* Faellig nach der Leiter (Kalendertage, Berlin). Nie gespielt = nicht "faellig" (das ist Neues). */
export function faelligAktuell(p, jetzt, k) {
  const a = abstandAktuell(p, k);
  if (!a) return false;
  return berlinTagNr(jetzt || Date.now()) >= berlinTagNr(Number(p.z)) + a;
}

/* Wie unsicher eine Karte ist - kleiner = unsicherer (Regel B: die unsichersten zuerst).
   0 zuletzt falsch · 1 frueher falsch, nicht sitzend · 2 nicht sitzend · 3 sitzt · 4 sicher (3c). */
export function unsicherRang(p, k) {
  if (!p || !p.z) return 2;
  if (p.f) return 0;
  if (istSicher4(p)) return 4;
  if (sitztAktuell(p, k)) return 3;
  return p.fz ? 1 : 2;
}

/* Durchwechseln im Deckel (Kernbefund Vorab-Pruefung 04.11.2026: von 155 Karten offener Blaetter
   waren nur 38 je gefragt - je Blatt immer dieselben 3). Fuer offene Blaetter ordnet wiederholung4()
   die Karten unter dem Deckel (nach den geschuetzten Fehlerkarten) mit diesem Rang, kleiner zuerst:
     0 gespielt, sitzt noch nicht   - bleibt drin, bis sie sitzt (1-2 Tage)
     1 nie gespielt                 - kommt nach, sobald ein Platz frei wird
     2 sitzt und ist faellig        - Leiter 3/1/2/3/5
     3 sitzt, nicht faellig         - rotiert: die am laengsten nicht gefragte zuerst
   Bei gleichem Rang die aelteste letzte Antwort zuerst (Rang 1: alte Reihenfolge). */
export function rangOffen(p, jetzt, k) {
  if (!p || !p.z) return 1;
  if (!sitztAktuell(p, k) && !istSicher4(p)) return 0;
  return faelligAktuell(p, jetzt, k) ? 2 : 3;
}

/* Wie weit ein offenes Blatt gefestigt ist (Einstellwert blattGefestigt, nur Anzeige): Anteil der W-Karten,
   die zuletzt richtig sind und deren Richtig-Folge mindestens blattGefestigt.tage Kalendertage umfasst.
   wSchluessel: Lernpunkt-Schluessel des Blattes (mehrere je Tatsache moeglich - gezaehlt je Schluessel
   mit Punkt; ungespielte zaehlen als nicht gefestigt). Rueckgabe { anteil, gefestigt }. */
export function blattGefestigtAnteil(keys, punkte, k) {
  const K = k || AKTUELL;
  const G = K.blattGefestigt || {};
  const tage = Math.max(1, Number(G.tage) || 2);
  let n = 0, gut = 0;
  for (const s of keys || []) {
    n++;
    const p = punkte && punkte[s];
    if (p && p.z && !p.f && p.t1 && berlinTagNr(Number(p.z)) - berlinTagNr(Number(p.t1)) >= tage - 1) gut++;
  }
  const anteil = n ? gut / n : 0;
  return { anteil: Math.round(anteil * 100) / 100, gefestigt: n > 0 && anteil >= (Number(G.anteil) || 0.7) };
}

/* Regel B, "jedes offene Blatt taeglich": offene Blaetter, deren Karten in der Wiederholung (W)
   heute noch nicht dran waren und von denen keine faellig ist. Blaetter ganz ohne gespielte
   Karte fehlen (deren Karten kommen als Neues). wSchluessel = wiederholung4().schluessel. */
export function blaetterOhneHeute(offen, wSchluessel, punkte, jetzt, k) {
  const heute = berlinTagNr(jetzt || Date.now());
  const raus = new Set();
  for (const id of offen || []) {
    const keys = (wSchluessel && wSchluessel[id]) || [];
    let gespielt = false, heuteDa = false, faellig = false;
    for (const s of keys) {
      const p = punkte && punkte[s];
      if (!p || !p.z) continue;
      gespielt = true;
      if (berlinTagNr(Number(p.z)) === heute || Number(p.h) === heute) heuteDa = true;
      if (faelligAktuell(p, jetzt, k)) faellig = true;
    }
    if (gespielt && !heuteDa && !faellig) raus.add(id);
  }
  return raus;
}

/* Aus Kandidaten eines Blattes die eine fuer "taeglich" waehlen: unsicherste zuerst, bei gleichem
   Rang die am laengsten nicht gefragte (so wechseln sich die sicheren ab). liste: [{ p, ... }]. */
export function taeglichWaehlen(liste, k) {
  let best = null;
  for (const c of liste || []) {
    if (!c || !c.p || !c.p.z) continue;
    if (!best) { best = c; continue; }
    const a = unsicherRang(c.p, k), b = unsicherRang(best.p, k);
    if (a < b || (a === b && Number(c.p.z) < Number(best.p.z))) best = c;
  }
  return best;
}

/* Sekunden je Frage fuer ein Fach (Zahl oder { fach, standard }). */
export function sekundenFuer(fach, k) {
  const S = (k || AKTUELL).sekundenJeFrage;
  if (typeof S === "number") return S;
  return Number(S && S[fach]) || Number(S && S.standard) || 20;
}

/* Regel C: Minuten und Fragen je Fach.
   bedarf  { fach: Zahl der faelligen Karten in W (Leiter fuer offene, sonst wie bisher) }
   offen   { fach: Zahl offener Blaetter }  - ein Fach mit offenen Blaettern ist nie "geschafft"
           unter 2 Minuten; offene Blaetter ohne Bedarf bekommen die geschafft-Minuten.
   ausfall true = gestern nichts geuebt (Pause ueber alle Faecher >= 1 Tag).
   Rueckgabe { minuten: {fach}, fragen: {fach} }. */
export function minutenJeFach(faecher, bedarf, ausfall, k) {
  const K = k || AKTUELL;
  const M = K.minuten;
  const minuten = {}, fragen = {};
  for (const f of faecher) {
    const b = Number((bedarf || {})[f]) || 0;
    let m;
    if (b <= 0) m = M.geschafft;
    else {
      m = Math.min(M.max, Math.max(M.min, Math.ceil(b / K.bedarfJeMinute)));
      if (ausfall) m = Math.min(M.deckel, Math.round(m * M.ausfallFaktor * 10) / 10);
    }
    minuten[f] = m;
    fragen[f] = Math.max(1, Math.round((m * 60) / sekundenFuer(f, K)));
  }
  return { minuten, fragen };
}

/* Bedarf je Fach aus den Lernpunkten: faellige Karten in W, je Blatt hoechstens so viele, wie
   das Blatt Karten in W hat (eine Tatsache kann mehrere Formen-Schluessel haben).
   faelligFn(s, p) entscheidet je Schluessel (Leiter oder bisherige Regel). zusatz = Blaetter aus
   blaetterOhneHeute (zaehlen je eine Karte). */
export function bedarfJeFach(wSchluessel, wZahl, blattNach, punkte, faelligFn, zusatz) {
  const raus = {};
  for (const id of Object.keys(wSchluessel || {})) {
    const b = blattNach && blattNach[id];
    if (!b) continue;
    const f = fachNorm(b.fach);
    let n = 0;
    for (const s of wSchluessel[id]) { const p = punkte && punkte[s]; if (p && p.z && faelligFn(s, p)) n++; }
    const deckel = wZahl && wZahl[id] ? Number(wZahl[id].w) || n : n;
    n = Math.min(n, deckel) + (zusatz && zusatz.has(id) ? 1 : 0);
    if (n) raus[f] = (raus[f] || 0) + n;
  }
  return raus;
}

/* Regeln D und E: das freie Ueben hinter dem geschuetzten Kopf neu ordnen.
   frei: [{ f, p, blatt, offen }] in der Reihenfolge von quizReihe4.
   Reihenfolge: offene unsichere (unsicherste zuerst) · D bis kniffligJeTag knifflige aus
   abgeschlossenen Blaettern (frueher falsch, am laengsten nicht gefragt zuerst) · E abgeschlossene:
   zuletzt falsch zuerst, dann am laengsten nicht gefragt (nie gefragt = am laengsten) ·
   offene, die sitzen · der Rest in alter Reihenfolge. Nichts faellt weg. */
export function freiAktuell(frei, k, jetzt) {
  const K = k || AKTUELL;
  const z = (c) => (c.p && Number(c.p.z)) || 0;
  /* Regel 6: nie gefragt (z 0) vorn, sonst die am laengsten nicht gefragte zuerst. */
  const g = Math.max(1, Number(K.grundlageGewicht) || 1);
  const alter = (c) => (!z(c) ? Infinity : jetzt ? jetzt - z(c) : -z(c));
  const stabil = (l, cmp) => l.map((c, i) => ({ c, i })).sort((a, b) => cmp(a.c, b.c) || (a.i - b.i)).map((y) => y.c);
  const offenUnsicher = [], offenSitzt = [], alt = [], rest = [];
  for (const c of frei || []) {
    if (!c.blatt) rest.push(c);
    else if (c.offen) (unsicherRang(c.p, K) >= 3 ? offenSitzt : offenUnsicher).push(c);
    else alt.push(c);
  }
  const a1 = stabil(offenUnsicher, (x, y) => unsicherRang(x.p, K) - unsicherRang(y.p, K));
  const knifflig = (c) => !!(c.p && c.p.z && (c.p.fz || c.p.f || c.p.fn));
  /* Regel 5 (Nachbesserung 3b, 04.11.2026): ANTEIL statt Reihenfolge. Nur mit jetzt (quiz.js im neu-Pfad) und
     grundlageGewicht > 1 werden im Altbestand Grundlagen und andere Karten im Verhaeltnis g : 1 gemischt
     (je Art bleibt die Ordnung): bei den Kniffligen (D) vor dem Abschneiden auf kniffligJeTag, in E getrennt
     fuer "zuletzt falsch" und den Rest. Offene unsichere Karten (a1) stehen weiter vor allem - kein Vorrang. */
  const mischt = !!jetzt && g > 1;
  const mischen = (l) => {
    if (!mischt) return l;
    const G = l.filter((c) => c.grundlage), O = l.filter((c) => !c.grundlage), aus = [];
    let i = 0, j = 0;
    while (i < G.length && j < O.length) aus.push(i < g * (j + 1) ? G[i++] : O[j++]);
    return aus.concat(G.slice(i), O.slice(j));
  };
  const d = mischen(stabil(alt.filter(knifflig), (x, y) => z(x) - z(y))).slice(0, Math.max(0, Number(K.kniffligJeTag) || 0));
  const dSet = new Set(d);
  const vgl = (x, y) => { const ax = alter(x), ay = alter(y); return ax === ay ? 0 : ax > ay ? -1 : 1; };
  const e0 = stabil(alt.filter((c) => !dSet.has(c)), (x, y) => ((y.p && y.p.f ? 1 : 0) - (x.p && x.p.f ? 1 : 0)) || vgl(x, y));
  const istF = (c) => !!(c.p && c.p.f);
  const e = mischt ? mischen(e0.filter(istF)).concat(mischen(e0.filter((c) => !istF(c)))) : e0;
  return { liste: a1.concat(d, e, offenSitzt, rest), zaehl: { offenUnsicher: a1.length, knifflig: d.length, alt: e.length, offenSitzt: offenSitzt.length, rest: rest.length,
    grundlage: e.filter((c) => c.grundlage).length, grundlageKnifflig: d.filter((c) => c.grundlage).length } };
}

/* Regel F (Nachbesserung 2): Vorschau fuer einen Abschluss - die GANZE Liste der sichtbaren Blaetter
   des Fachs, je Blatt Titel, Schuldatum und eine vorgeschlagene Stufe mit Begruendung.
   vorschlag: Eintraege aus _aktuell-vorschlag.js fuer diese Probe ({ blattId, stufe, begruendung }).
   Ohne Vorschlag entscheidet nur das Datum, und auch das nie auf "abgefragt" (im Zweifel offen):
     Schuldatum vor dem Probentag -> "unsicher" ("nur nach Datum"), ab dem Probentag -> "nicht abgefragt",
     ohne Datum -> "unsicher".
   schonZu = geschlossenJeFach(...)[fach]: bisherige Stufe steht als "bisher" dabei.
   Sortiert nach Schuldatum (ohne Datum ans Ende), dann angelegt, dann Kennung.
   Rueckgabe { ok, liste: [{ id, titel, thema, datum, von, unsicher?, gleicherTitel?, stufe, begruendung, quelle, bisher? }] } */
export function abschlussVorschau(blaetter, fach, probeDatum, vorschlag, schonZu) {
  const f = fachNorm(fach);
  if (!f) return { ok: false, fehler: "Bitte ein Fach wählen.", liste: [] };
  const pd = /^\d{4}-\d{2}-\d{2}$/.test(String(probeDatum || "")) ? String(probeDatum) : "";
  const vs = {};
  for (const v of vorschlag || []) if (v && v.blattId && STUFEN.includes(v.stufe)) vs[String(v.blattId)] = v;
  const ord = (blaetter || []).filter((b) => b && b.id && b.sichtbar !== false && fachNorm(b.fach) === f)
    .map((b) => ({ b, sd: schuldatum(b) }))
    .sort((x, y) => ((x.sd.datum ? 0 : 1) - (y.sd.datum ? 0 : 1)) ||
      (x.sd.datum < y.sd.datum ? -1 : x.sd.datum > y.sd.datum ? 1 : 0) ||
      String(x.b.angelegt || "").localeCompare(String(y.b.angelegt || "")) || String(x.b.id).localeCompare(String(y.b.id)));
  const liste = ord.map((x) => {
    const id = String(x.b.id);
    const v = vs[id];
    let stufe, begruendung, quelle;
    if (v) { stufe = v.stufe; begruendung = String(v.begruendung || ""); quelle = "vorschlag"; }
    else if (!x.sd.datum || !pd) { stufe = "unsicher"; begruendung = "Kein Schuldatum oder kein Probendatum, Inhalt nicht geprüft."; quelle = "datum"; }
    else if (x.sd.datum < pd) { stufe = "unsicher"; begruendung = "Nur nach Datum vor der Probe, Inhalt nicht geprüft."; quelle = "datum"; }
    else { stufe = "nicht abgefragt"; begruendung = "Schuldatum am oder nach dem Probentag."; quelle = "datum"; }
    const bisher = schonZu && schonZu.stufe && schonZu.stufe[id] ? STUFE_LESBAR[schonZu.stufe[id]] || schonZu.stufe[id]
      : schonZu ? (schonZu.has(id) ? "abgefragt" : schonZu.markiert && schonZu.markiert.has(id) ? "offen markiert" : "") : "";
    const grundlage = v && v.grundlage ? String(v.grundlage) : grundlageText("paul", id);
    const widerspruch = v && v.widerspruch ? String(v.widerspruch) : "";
    return { id, titel: String(x.b.titel || x.b.thema || "(ohne Titel)"), thema: String(x.b.thema || ""),
             datum: x.sd.datum, von: x.sd.von, angelegt: String(x.b.angelegt || ""), ...(x.sd.unsicher ? { unsicher: true } : {}),
             stufe, begruendung, quelle, ...(bisher ? { bisher } : {}), ...(grundlage ? { grundlage } : {}), ...(widerspruch ? { widerspruch } : {}),
             ...(v && v.regel ? { regel: v.regel } : {}) };
  });
  const zahl = {};
  for (const e of liste) zahl[e.titel] = (zahl[e.titel] || 0) + 1;
  const n = {};
  for (const e of liste) if (zahl[e.titel] > 1) { n[e.titel] = (n[e.titel] || 0) + 1; e.gleicherTitel = n[e.titel] + " von " + zahl[e.titel]; }
  return { ok: true, liste };
}
