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
  /* ---- Auftrag 209 (Nachbesserung 4, 05.11.2026), alles nur im Pfad schalter:aktuell = neu ---- */
  /* R7: Blaetter, die sich am Geraet nicht ueben lassen (interne Stufe "nichtUebbar", Paul sieht sie nie):
     Handwerk (probenstoff:false am Blatt - die sechs Lineatur-, Schreibschrift- und Heftregel-Blaetter) und
     Blaetter ohne eine einzige Frage (weder Quizfrage im bereinigten Vorrat noch gueltige Fundkarte). Nie offen,
     nie Vorrang. Bekommt ein Blatt spaeter Fragen, ist es von selbst wieder uebbar. */
  nichtUebbar: true,
  /* R8/R9: Deckel je Fach in FRAGEN = normalSek / Median der Antwortzeit des Fachs (Pauls echte Antworten,
     lernstand:paul, nur lesen; bei jedem Abruf neu gerechnet). Unter minAntworten Antworten gilt der feste
     Ausweichwert (Messung Do 05.11.2026, 10:35 Uhr MEZ, Spiegel; unterlagen/aktuell-2026-11-05/ergebnis.md).
     Ausfalltag je Fach (Pause des Fachs >= 1 Tag): hoechstens ausfallFaktor x normale Menge, nie ueber
     ausfallSek (15 Min), nie multipliziert. */
  fragenDeckel: { normalSek: 600, ausfallSek: 900, ausfallFaktor: 1.5, minAntworten: 30,
                  ausweich: { mathe: 37.4, hsu: 14.2, deutsch: 11.6, englisch: 7.4, standard: 22.4 },
    /* Nachbesserung 5 (Denny 05.11.2026, 10:45 Uhr MEZ): Absicherung je Fach. Bis ein Fach mindestens
       minAntworten gemessene Antworten hat (n aus medianJeFach), gilt min(Median-Deckel, hoechst); ab
       minAntworten automatisch der Median-Deckel. Ausfalltag (R9) bei Absicherung: hoechstens
       floor(ausfallFaktor x hoechst) = 45 und nie ueber 15 Minuten (⚠️ Vorschlag, Rueckfrage an Denny offen). */
    absicherung: { minAntworten: 200, hoechst: 30 },
    /* Nachbesserung 5: Deckel je Antwortart (aw: k angekreuzt, l Luecke, s selbst geschrieben; gespeichert seit
       04.11.2026). Aktiv je Fach nur, wenn mindestens minJeArt Antworten "k" UND eine Art "l" oder "s" mit
       mindestens minJeArt Antworten deren Median >= faktor x Median "k" hat. Dann verbraucht jede geplante
       Frage im 600-s-Budget (900 s am Ausfalltag) Fach-Median x (Median ihrer Art / Median aller Arten);
       Arten unter minJeArt Antworten rechnen mit dem Fach-Median (Faktor 1). */
    art: { an: true, minJeArt: 20, faktor: 1.5 } },
  /* R11: vorlaeufige Proben (ohne Probenfoto, Deutsch und HSU) - "abgefragt (vorlaeufig)" gilt wie abgeschlossen,
     nur Auffuellen; die Blaetter der letzten fensterTage Tage vor dem angekuendigten Termin bleiben offen. */
  vorlaeufigSchliesst: true,
  fensterTage: 5,
  /* R10: Neues hat immer Vorrang - im neu-Pfad ohne den Neues-Anteil (neuAnteil 0,5, neuJeRunde 9) aus Schritt 4.
     Der Fragendeckel aus R8/R9 bleibt die Obergrenze, der Deckel 3 Karten je Blatt (wiederholung4) bleibt. */
  neuFrei: true,
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

/* =====================================================================================================
   Auftrag 209 (Nachbesserung 4, 05.11.2026, Dennys Wortlaut in unterlagen/aktuell-2026-11-05/auftrag-209.md).
   Alles rein (ohne Speicher) und nur im Pfad schalter:aktuell = neu aufgerufen (quiz.js aktuellDazu, neu-Pfad).
   ===================================================================================================== */

const TAG_MS = 86400000;
const tagPlus = (d, n) => new Date(Date.parse(d + "T12:00:00Z") + n * TAG_MS).toISOString().slice(0, 10);

/* R11: Fenster "letzte fensterTage Tage vor dem angekuendigten Termin" einer Probe ([von, bis], beide einschliesslich).
   Steht in der Vorschlagsdatei ein Fenster, gilt es; sonst probeDatum - fensterTage bis probeDatum - 1. */
export function probenFenster(p, k) {
  const K = k || AKTUELL;
  if (p && Array.isArray(p.fenster) && p.fenster.length === 2) return [String(p.fenster[0]), String(p.fenster[1])];
  const pd = String((p && p.probeDatum) || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pd)) return null;
  return [tagPlus(pd, -(Number(K.fensterTage) || 5)), tagPlus(pd, -1)];
}

/* R11: vorlaeufige Proben (Deutsch, HSU ohne Probenfoto) als Abschluss-Eintraege, gesetzt 0 (jeder Abschluss aus dem
   Speicher gilt danach, juengste Stufe je Kennung). Nur Stufen, die schliessen, und nur ausserhalb des Fensters vor
   dem Termin; alles andere bleibt offen ("nicht abgefragt", "unsicher", Fenster). Rueckgabe [Eintraege], jeder mit
   vorlaeufig: true. Die Probendaten bleiben unbestaetigt; mit dem Probenfoto ordnet aktuell-vorschlag.py neu zu. */
export function vorlaeufigBasis(kind, blattNach, k) {
  const K = k || AKTUELL;
  if (!K.vorlaeufigSchliesst) return [];
  const raus = [];
  for (const p of ((VORSCHLAG && VORSCHLAG[kind] && VORSCHLAG[kind].proben) || [])) {
    if (!p || !p.vorlaeufig || p.bestaetigt) continue;
    const fe = probenFenster(p, K);
    const stufen = {};
    for (const b of p.blaetter || []) {
      if (!b || !STUFEN.includes(b.stufe)) continue;
      const bl = blattNach && blattNach[String(b.blattId)];
      if (!bl) continue;
      if (!SCHLIESST.has(b.stufe)) { stufen[String(b.blattId)] = b.stufe; continue; }   // "nicht abgefragt"/"unsicher": offen, markiert
      const sd = schuldatum(bl).datum;
      if (fe && sd && sd >= fe[0] && sd <= fe[1]) continue;   // letzte Tage vor dem Termin: offen
      stufen[String(b.blattId)] = "abgefragt";
    }
    raus.push({ fach: p.fach, probe: String(p.probe || ""), probeDatum: String(p.probeDatum || ""), gesetzt: 0, basis: true, vorlaeufig: true, stufen });
  }
  return raus;
}

/* Kennungen, die nur ueber eine vorlaeufige Probe geschlossen sind (kein Abschluss aus dem Speicher nennt sie). */
export function vorlaeufigZu(vBasis, abschluss, geschlossen) {
  const kv = new Set();
  for (const a of (abschluss && abschluss.abschluesse) || []) {
    for (const id of Object.keys((a && a.stufen) || {})) kv.add(String(id));
    for (const id of (a && a.ids) || []) kv.add(String(id));
  }
  const raus = new Set();
  for (const e of vBasis || []) for (const id of Object.keys(e.stufen || {})) {
    const zu = geschlossen && geschlossen[fachNorm(e.fach)];
    if (!kv.has(id) && zu && zu.has(id)) raus.add(id);
  }
  return raus;
}

/* R7: nicht am Geraet uebbar = Handwerk (probenstoff:false) oder ohne eine einzige Frage in W (weder Quizfrage im
   bereinigten Vorrat noch gueltige Fundkarte; wiederholung4 legt fuer jedes Blatt mit Fragen einen Eintrag an). */
export function nichtUebbarIds(blattNach, wSchluessel, k) {
  const K = k || AKTUELL;
  const raus = new Set();
  if (!K.nichtUebbar) return raus;
  for (const id of Object.keys(blattNach || {})) {
    const b = blattNach[id];
    if (!b || b.sichtbar === false) continue;
    if (b.probenstoff === false || !((wSchluessel && wSchluessel[id]) || []).length) raus.add(id);
  }
  return raus;
}

/* R8: Median der Antwortzeit je Fach aus Pauls echten Antworten (lernstand:paul, Liste der Sitzungen).
   Messweg wie Vorab-Pruefung 04.11.2026 (Abschnitt 3): nur Quiz-Sitzungen ohne nurBesuch, nur Sitzungen mit genau
   einem Fach (jede Antwort mit Lernpunkt, alle im selben Fach); Zeit je Antwort = aktive Sekunden der Sitzung
   geteilt durch ihre Antworten. fachVon(p) liefert das Fach eines Lernpunkts ("" = unbekannt).
   art "mittel" = Mittelwert statt Median (nur fuer den Vergleich in der Pruefung).
   Rueckgabe { fach: { median, n } }. */
export function medianJeFach(liste, fachVon, art) {
  const je = {};
  for (const s of Array.isArray(liste) ? liste : []) {
    if (!s || s.spielId !== "quiz" || s.nurBesuch) continue;
    const a = Array.isArray(s.aufgaben) ? s.aufgaben : [];
    const sek = Number(s.sekunden) || 0;
    if (!a.length || sek <= 0) continue;
    const f = new Set(a.map((x) => (x && x.p ? fachVon(String(x.p)) || "" : "")));
    if (f.size !== 1 || f.has("")) continue;
    const fach = [...f][0];
    const t = sek / a.length;
    (je[fach] = je[fach] || []).push(...a.map(() => t));
  }
  const raus = {};
  for (const f of Object.keys(je)) {
    const l = je[f].slice().sort((x, y) => x - y), n = l.length;
    const m = art === "mittel" ? l.reduce((x, y) => x + y, 0) / n : n % 2 ? l[(n - 1) / 2] : (l[n / 2 - 1] + l[n / 2]) / 2;
    raus[f] = { median: Math.round(m * 10) / 10, n };
  }
  return raus;
}

/* R8/R9: Deckel je Fach in Fragen. mediane = medianJeFach(...). Rueckgabe { fach: { sek, quelle, n, deckel, ausfallDeckel,
   deckelMedian, ausfallMedian, abgesichert } }, quelle "gemessen" (ab minAntworten Antworten) oder "ausweich" (fester Wert
   aus fragenDeckel.ausweich). Nachbesserung 5: abgesichert = weniger als absicherung.minAntworten gemessene Antworten
   (auch bei "ausweich"); dann deckel = min(Median-Deckel, hoechst), ausfallDeckel = min(15-Min-Deckel,
   floor(ausfallFaktor x hoechst)). Ab minAntworten gilt der Median-Deckel unveraendert. */
export function deckelJeFach(faecher, mediane, k) {
  const D = (k || AKTUELL).fragenDeckel;
  const S = D.absicherung;
  const raus = {};
  for (const f of faecher) {
    const m = mediane && mediane[f];
    const gemessen = !!(m && m.n >= D.minAntworten && m.median > 0);
    const sek = gemessen ? m.median : Number(D.ausweich[f]) || Number(D.ausweich.standard);
    const n = m ? m.n : 0;
    const deckelMedian = Math.max(1, Math.floor(D.normalSek / sek)), ausfallMedian = Math.max(1, Math.floor(D.ausfallSek / sek));
    const abgesichert = !!(S && n < S.minAntworten);
    raus[f] = { sek, quelle: gemessen ? "gemessen" : "ausweich", n, deckelMedian, ausfallMedian, abgesichert,
                deckel: abgesichert ? Math.min(deckelMedian, S.hoechst) : deckelMedian,
                ausfallDeckel: abgesichert ? Math.min(ausfallMedian, Math.floor(D.ausfallFaktor * S.hoechst)) : ausfallMedian };
  }
  return raus;
}

/* Nachbesserung 5: Antwortzeit je Antwortart (aw) und Fach. Zeit je Antwort = Abstand ihres Zeitstempels t zur
   vorigen Antwort derselben Quiz-Sitzung (die erste Antwort einer Sitzung hat keinen Abstand und zaehlt nicht;
   Sitzungen mit gemischten Arten zaehlen mit, darum nicht der Sitzungsweg aus R8). Nur Antworten mit aw und t.
   Rueckgabe { fach: { k: {median, n}, l: {...}, s: {...}, alle: {median, n}, mitArt } } - mitArt = Antworten mit aw
   (auch ohne Abstand). Rein, liest nur. */
export function artZeitenJeFach(liste, fachVon) {
  const je = {}, mit = {};
  const med = (l) => { l = l.slice().sort((x, y) => x - y); const n = l.length; return n % 2 ? l[(n - 1) / 2] : (l[n / 2 - 1] + l[n / 2]) / 2; };
  for (const s of Array.isArray(liste) ? liste : []) {
    if (!s || s.spielId !== "quiz" || s.nurBesuch) continue;
    const a = Array.isArray(s.aufgaben) ? s.aufgaben : [];
    for (let i = 0; i < a.length; i++) {
      const x = a[i];
      if (!x || !x.aw || !x.p) continue;
      const f = fachVon(String(x.p)) || "";
      if (!f) continue;
      mit[f] = (mit[f] || 0) + 1;
      const v = a[i - 1];
      if (!v || !v.t || !x.t) continue;
      const d = (Date.parse(x.t) - Date.parse(v.t)) / 1000;
      if (!(d >= 0)) continue;
      const j = (je[f] = je[f] || { k: [], l: [], s: [] });
      if (j[x.aw]) j[x.aw].push(d);
    }
  }
  const raus = {};
  for (const f of new Set([...Object.keys(je), ...Object.keys(mit)])) {
    const j = je[f] || { k: [], l: [], s: [] }, o = { mitArt: mit[f] || 0 };
    const alle = [...j.k, ...j.l, ...j.s];
    for (const [n, l] of [["k", j.k], ["l", j.l], ["s", j.s], ["alle", alle]]) o[n] = { median: l.length ? Math.round(med(l) * 10) / 10 : null, n: l.length };
    raus[f] = o;
  }
  return raus;
}

/* Nachbesserung 5: Faktoren je Art. Aktiv nur bei deutlichem Unterschied (siehe fragenDeckel.art). Rueckgabe
   { fach: { aktiv, faktor: { k, l, s }, grund } }; inaktiv heisst Faktor 1 fuer alle (Fach-Median). */
export function artFaktoren(faecher, artZeiten, k) {
  const C = (k || AKTUELL).fragenDeckel.art;
  const raus = {};
  for (const f of faecher) {
    const z = artZeiten && artZeiten[f];
    const eins = { aktiv: false, faktor: { k: 1, l: 1, s: 1 } };
    if (!C || !C.an) { raus[f] = { ...eins, grund: "aus" }; continue; }
    if (!z || !z.k || z.k.n < C.minJeArt || !(z.k.median > 0)) { raus[f] = { ...eins, grund: "Ankreuzen unter " + C.minJeArt }; continue; }
    const deutlich = ["l", "s"].filter((a) => z[a] && z[a].n >= C.minJeArt && z[a].median >= C.faktor * z.k.median);
    if (!deutlich.length) {
      const genug = ["l", "s"].some((a) => z[a] && z[a].n >= C.minJeArt);
      raus[f] = { ...eins, grund: genug ? "Unterschied unter " + C.faktor + "x" : "Luecke und Tippen unter " + C.minJeArt }; continue;
    }
    const basis = z.alle && z.alle.median > 0 ? z.alle.median : z.k.median;
    const faktor = {};
    for (const a of ["k", "l", "s"]) faktor[a] = z[a] && z[a].n >= C.minJeArt && z[a].median > 0 ? z[a].median / basis : 1;
    raus[f] = { aktiv: true, faktor, grund: "deutlich: " + deutlich.join(",") };
  }
  return raus;
}

/* Nachbesserung 5: geschaetzte Antwortart je Karte der Reihe (Tippstufen, Kapitel 156): Fundkarten (#k:), mathe# und
   lesen# = "k"; Quizkarten nach dem eigenen Lernpunkt w = r - ab: 0 -> k, 1 -> l, >= 2 -> s, mit den Rundengrenzen
   (hoechstens frei Mal "s", luecken Mal "l", sonst die leichtere Art). ⚠️ Annahme: ohne Geschwister-Formen, Zahlen
   und den Schalter "Selbst schreiben" - wirkt nur, wenn artFaktoren aktiv ist. */
export function artSchaetzen(keys, punkte, grenzen) {
  const g = grenzen || { frei: 2, luecken: 3 };
  let s = 0, l = 0;
  return (keys || []).map((key) => {
    const k = String(key);
    if (k.indexOf("#k:") > 0 || k.indexOf("mathe#") === 0 || k.indexOf("lesen#") === 0) return "k";
    const p = punkte && punkte[k];
    const w = p ? Math.max(0, (Number(p.r) || 0) - (Number(p.ab) || 0)) : 0;
    if (w >= 2 && s < g.frei) { s++; return "s"; }
    if (w >= 1 && l < g.luecken) { l++; return "l"; }
    return "k";
  });
}

/* Nachbesserung 5: Deckel in Fragen ueber das Sekunden-Budget. arten = artSchaetzen(Reihe), sek = Fach-Median,
   faktor = artFaktoren(...)[fach].faktor. Zaehlt die Karten der Reihe, solange die Summe der Kosten das Budget
   nicht ueberschreitet; reicht die Reihe nicht, rechnen die restlichen Fragen mit dem Fach-Median weiter.
   Nie unter 1. */
export function deckelNachArt(arten, sek, faktor, budgetSek) {
  let summe = 0, n = 0;
  for (const a of arten || []) {
    const c = sek * ((faktor && faktor[a]) || 1);
    if (summe + c > budgetSek + 1e-9) return Math.max(1, n);
    summe += c; n++;
  }
  return Math.max(1, n + Math.floor((budgetSek - summe + 1e-9) / sek));
}

/* R8/R9: Menge je Fach. bedarf = bedarfAktuell(...)[fach].gesamt; pause = Pause je Fach (volle Tage ohne Antwort).
   Normaltag: min(Bedarf, Deckel). Ausfalltag des Fachs (Pause >= 1): min(Bedarf, floor(1,5 x Normalmenge), Ausfall-Deckel)
   - nie multipliziert (der Faktor gilt einmal, egal wie lang die Pause war). Nie unter 1 (0 hiesse auf der Seite
   "volle Tagesmenge"). Rueckgabe { menge, normal, ausfall }. */
export function mengeJeFach(faecher, bedarf, deckel, pause, k) {
  const D = (k || AKTUELL).fragenDeckel;
  const menge = {}, normal = {}, ausfall = {};
  for (const f of faecher) {
    const b = Math.max(0, Number(bedarf && bedarf[f]) || 0);
    const d = deckel[f];
    const nm = Math.min(b, d.deckel);
    const af = (Number(pause && pause[f]) || 0) >= 1;
    normal[f] = Math.max(1, nm);
    menge[f] = Math.max(1, af ? Math.min(b, Math.floor(nm * D.ausfallFaktor), d.ausfallDeckel) : nm);
    ausfall[f] = af;
  }
  return { menge, normal, ausfall };
}

/* R10 Gruppe eines offenen Blattes fuer "bei vollem Deckel": 0 juengste Blaetter nach der Probe (oder Fach ohne Probe),
   1 unsichere vor dem Termin (Stufe "nicht abgefragt"/"unsicher" oder im Fenster vor dem Termin), 2 der Rest. */
export function gruppeBlatt(blatt, zuF, probe) {
  const sd = schuldatum(blatt).datum;
  const pd = probe && probe.probeDatum;
  if (!pd || (sd && sd >= pd)) return 0;
  const id = String(blatt.id);
  if (zuF && zuF.markiert && zuF.markiert.has(id)) return 1;
  const fe = probe.fenster;
  if (fe && sd && sd >= fe[0] && sd <= fe[1]) return 1;
  return 2;
}

/* Probendatum und Fenster je Fach: juengste Probe der Vorschlagsdatei (bestaetigt oder vorlaeufig), sonst das
   Probendatum aus den Abschluessen. Rueckgabe { fach: { probeDatum, fenster } }. */
export function probeJeFach(kind, geschlossen, k) {
  const raus = {};
  for (const p of ((VORSCHLAG && VORSCHLAG[kind] && VORSCHLAG[kind].proben) || [])) {
    const f = fachNorm(p && p.fach), pd = String((p && p.probeDatum) || "");
    if (!f || !/^\d{4}-\d{2}-\d{2}$/.test(pd)) continue;
    if (!raus[f] || pd > raus[f].probeDatum) raus[f] = { probeDatum: pd, fenster: probenFenster(p, k) };
  }
  for (const f of Object.keys(geschlossen || {})) {
    const pd = geschlossen[f].probeDatum;
    if (pd && (!raus[f] || pd > raus[f].probeDatum)) raus[f] = { probeDatum: pd, fenster: probenFenster({ probeDatum: pd }, k) };
  }
  return raus;
}

/* R8/R10: Bedarf je Fach in Fragen, getrennt nach offen (davon neu) und Auffuellen.
   offen       Karten offener Blaetter in W: nie gespielt (Neues) oder heute dran/faellig nach der Leiter, je Blatt
               hoechstens so viele, wie das Blatt Karten in W hat; ein offenes Blatt ohne heutige und faellige Karte
               zaehlt 1 (R10: jedes offene Blatt taeglich mindestens 1 Frage).
   auffuellen  faellige oder heute beantwortete Karten in W der uebrigen Blaetter (abgeschlossen, vorlaeufig
               abgeschlossen) - nur zum Auffuellen, ohne Vorrang.
   istDran(s, p): heute beantwortet oder faellig. Rueckgabe { fach: { offen, neu, auffuellen, gesamt } }. */
export function bedarfAktuell(wSchluessel, wZahl, blattNach, punkte, offen, istDran) {
  const raus = {};
  for (const id of Object.keys(wSchluessel || {})) {
    const b = blattNach && blattNach[id];
    if (!b) continue;
    const f = fachNorm(b.fach);
    const z = raus[f] || (raus[f] = { offen: 0, neu: 0, auffuellen: 0, gesamt: 0 });
    const cap = wZahl && wZahl[id] ? Number(wZahl[id].w) || 0 : (wSchluessel[id] || []).length;
    let neu = 0, dran = 0;
    for (const s of wSchluessel[id]) {
      const p = punkte && punkte[s];
      if (!p || !p.z) neu++; else if (istDran(s, p)) dran++;
    }
    if (offen && offen.has(id)) {
      const n = Math.min(cap, neu + dran);
      const nNeu = Math.min(neu, n);
      const ges = Math.max(1, n);
      z.offen += ges; z.neu += nNeu;
    } else z.auffuellen += Math.min(cap, dran);
  }
  for (const f of Object.keys(raus)) raus[f].gesamt = raus[f].offen + raus[f].auffuellen;
  return raus;
}

/* R10: Reihenfolge der Karten eines Fachs. items: [{ key, blatt, p, offen, nie, faellig }] - nur Karten in W.
   blattInfo(id) -> { gruppe, datum }; heuteBlatt: Set der offenen Blaetter, die heute schon eine Frage hatten.
     1. Pflicht: je offenes Blatt ohne heutige Frage EINE Karte (nie gespielt: die erste neue; sonst die unsicherste,
        bei gleichem Rang die am laengsten nicht gefragte). Blaetter reihum: letzter Fragetag zuerst (nie gefragt
        vorn), dann Gruppe (juengste nach der Probe, unsichere vor dem Termin, Rest), dann das juengste Schuldatum.
     2. Neues der offenen Blaetter (Gruppe, juengstes Blatt zuerst) - Neues hat immer Vorrang.
     3. Faellige offener Blaetter: zuletzt falsch zuerst, dann Gruppe, dann die unsicherste, dann die aelteste Antwort.
     4. Auffuellen: faellige Karten der uebrigen Blaetter, zuletzt falsch zuerst, dann am laengsten nicht gefragt.
   Rueckgabe { liste: [item mit .teil "pflicht"|"neu"|"offen"|"auffuellen"], pflicht: [Blatt-ids in Reihenfolge] }. */
export function ordneAktuell(items, blattInfo, heuteBlatt, k) {
  const z = (c) => (c.p && Number(c.p.z)) || 0;
  const tagNr = (c) => (z(c) ? berlinTagNr(z(c)) : 0);
  const stabil = (l, cmp) => l.map((c, i) => ({ c, i })).sort((a, b) => cmp(a.c, b.c) || (a.i - b.i)).map((y) => y.c);
  const info = (id) => blattInfo(id) || { gruppe: 2, datum: "" };
  const nachDatum = (a, b) => (info(a).datum < info(b).datum ? 1 : info(a).datum > info(b).datum ? -1 : 0);
  const jeBlatt = new Map();
  for (const c of items) if (c.offen) { if (!jeBlatt.has(c.blatt)) jeBlatt.set(c.blatt, []); jeBlatt.get(c.blatt).push(c); }
  const pflichtC = [];
  const letzter = {};
  for (const [id, l] of jeBlatt) {
    letzter[id] = Math.max(0, ...l.map(tagNr));
    if (heuteBlatt && heuteBlatt.has(id)) continue;
    const gespielt = l.filter((c) => z(c));
    const c = gespielt.length ? taeglichWaehlen(gespielt, k) : l.find((x) => x.nie) || l[0];
    if (c) pflichtC.push(c);
  }
  const pflicht = stabil(pflichtC, (a, b) => (letzter[a.blatt] - letzter[b.blatt]) || (info(a.blatt).gruppe - info(b.blatt).gruppe) || nachDatum(a.blatt, b.blatt));
  const genommen = new Set(pflicht);
  const neu = stabil(items.filter((c) => c.offen && c.nie && !genommen.has(c)), (a, b) => (info(a.blatt).gruppe - info(b.blatt).gruppe) || nachDatum(a.blatt, b.blatt));
  const offenF = stabil(items.filter((c) => c.offen && !c.nie && c.faellig && !genommen.has(c)), (a, b) =>
    ((b.p && b.p.f ? 1 : 0) - (a.p && a.p.f ? 1 : 0)) || (info(a.blatt).gruppe - info(b.blatt).gruppe) ||
    (unsicherRang(a.p, k) - unsicherRang(b.p, k)) || (z(a) - z(b)));
  const auf0 = stabil(items.filter((c) => !c.offen && !c.nie && c.faellig), (a, b) => ((b.p && b.p.f ? 1 : 0) - (a.p && a.p.f ? 1 : 0)) || (z(a) - z(b)));
  /* Regel 5 (3b) bleibt: im Auffuellen Grundlagen und andere Karten im Verhaeltnis g : 1, getrennt fuer
     "zuletzt falsch" und den Rest; ohne Grundlagen-Kennung unveraendert. */
  const g = Math.max(1, Number((k || AKTUELL).grundlageGewicht) || 1);
  const mischen = (l) => {
    if (g <= 1 || !l.some((c) => c.grundlage)) return l;
    const G = l.filter((c) => c.grundlage), O = l.filter((c) => !c.grundlage), aus = [];
    let i = 0, j = 0;
    while (i < G.length && j < O.length) aus.push(i < g * (j + 1) ? G[i++] : O[j++]);
    return aus.concat(G.slice(i), O.slice(j));
  };
  const istF = (c) => !!(c.p && c.p.f);
  const auf = mischen(auf0.filter(istF)).concat(mischen(auf0.filter((c) => !istF(c))));
  const liste = pflicht.map((c) => ({ ...c, teil: "pflicht" })).concat(neu.map((c) => ({ ...c, teil: "neu" })),
    offenF.map((c) => ({ ...c, teil: "offen" })), auf.map((c) => ({ ...c, teil: "auffuellen" })));
  return { liste, pflicht: pflicht.map((c) => c.blatt) };
}
