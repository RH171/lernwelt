/* Wiedervorlage: ein Lernpunkt kommt wieder dran - als ANGEBOT, nie als Pflicht.
 *
 * ================================================================
 *  WARUM ES DAS GIBT (24.09.2026)
 * ================================================================
 * Die Gegenpruefung durch einen frischen Gedaechtnisforscher hat gemessen:
 * `quiz.js` schloss jede gestellte Frage DAUERHAFT aus
 * (`filter(f => !gestellt.has(f.id))`), und `grep` auf
 * "abstand|intervall|faellig|wiedervorlage" fand in quiz.js, quiz/motor.js
 * und _schwaechen.js NULL Treffer.
 *
 * Gerechnet: 7 Fragen x 180 Schultage = 1260 Fragen im Jahr. Bei 500 Blaettern
 * x 14 Zeilen sind das 7000 Lernpunkte - also 0,18 Fragen JE LERNPUNKT. Drei
 * Viertel wurden nie gefragt, der Rest genau einmal.
 *
 * Die ganze zitierte Literatur (Abrufuebung, verteiltes Ueben, successive
 * relearning) misst den Nutzen von WIEDERHOLUNG ueber Wochen. Ohne
 * Wiedervorlage belegte sie eine Funktion, die es nicht gab.
 *
 * ================================================================
 *  DENNYS GRENZE (24.09.2026) - die wiegt schwerer als die Literatur
 * ================================================================
 * "Paul soll doch selber entscheiden, wann er lernen will und welchen Bereich.
 *  Wenn er heute die Stadt Fuerth lernen will, morgen Mittelfranken und am
 *  naechsten Tag Bayern, dann ist das so. Wenn er das dreimal wiederholen
 *  will, weil er dort Schwaechen gezeigt hat, dann machen wir das."
 *
 * Daraus folgt, und daran wird nicht gedreht:
 *   - Die Faelligkeit SORTIERT nur. Sie schliesst nie etwas aus, sperrt nie
 *     und verlangt nie etwas.
 *   - Kein Pflichtpensum, keine rote Zahl fuer Uebersprungenes, kein
 *     "du hast X verpasst".
 *   - Kornell & Bjork 2008 ("wer selbst Karten weglegen darf, lernt
 *     schlechter") wird hier NICHT als Bauargument verwendet - die Arbeit hat
 *     Studierende untersucht, und Dennys Entscheidung gilt.
 *
 * ================================================================
 *  ALLES EINSTELLBAR (Dennys Auflage vom 24.09.2026)
 * ================================================================
 * "Baue es doch so, dass wir hier flexibel sind und jederzeit Aenderungen
 *  vornehmen koennen."
 *
 * Deshalb steht JEDE Entscheidung unten in EINSTELLUNGEN - eine Zahl aendern,
 * ausrollen, fertig. Kein Umbau, keine zweite Stelle. Was die SEITE davon
 * braucht, geht ueber `fuerDieSeite()` mit; `quiz/motor.js` liest es dort
 * und hat KEINE eigene Kopie.
 */

/* ---------------------------------------------------------------- *
 *  DIE SCHALTER. Hier und nur hier wird gedreht.                    *
 * ---------------------------------------------------------------- */
export const EINSTELLUNGEN = {
  /* An/Aus. false = alles verhaelt sich wie vor dem 24.09.2026:
     eine gestellte Frage kommt nie wieder. */
  an: true,

  /* Nach wie vielen TAGEN ein Lernpunkt wieder faellig wird.
     7 ist die einzige Zahl, die Mawson & Kang 2025 als durchgaengig positiv
     ausweisen ("fixed intervals of seven days ... most consistently positive
     and significant effects"), und sie deckt sich mit Sobel, Cepeda & Kapler
     2011 (5. Klasse, massiert gegen 1 Woche, Test nach 5 Wochen).
     WACHSENDE Abstaende (Leitner, Anki) sind hier bewusst NICHT gebaut -
     dieselbe Metaanalyse findet sie kleiner und teils negativ. Wer sie doch
     will, aendert `abstandTage` in eine Funktion; siehe `wiederAb()`. */
  abstandTage: 7,

  /* Ein Punkt, der beim ersten Versuch FALSCH war, kommt frueher wieder.
     Kein Zwang - er steht nur weiter oben. null = kein Unterschied. */
  abstandTageNachFehler: 2,

  /* Wie oft ein Punkt richtig beantwortet sein muss, bis er seltener kommt.
     Rawson & Dunlosky 2022 (berichtigt 24.09.2026): 3x richtig in der ERSTEN
     Sitzung, danach 1x je weiterer Sitzung. Hier zaehlt nur das zweite,
     weil es hier keine "erste Sitzung" mit Kriterium gibt.
     ⚠️ Bei einem Fehler faellt der Zaehler NICHT auf null zurueck - das waere
     ein Karteikasten mit Strafe. Er geht genau einen Schritt zurueck. */
  sitzt: 3,

  /* Abstand, sobald ein Punkt `sitzt`-mal richtig war (Erhaltungsdosis). */
  abstandTageWennSitzt: 28,

  /* Wie viele Punkte je Lauf hoechstens aus der Wiedervorlage kommen duerfen.
     Der Rest sind neue Fragen. Damit bleibt es eine Mischung und wird nie
     zu einem Abarbeitungsstapel.
     null = keine Grenze. */
  hoechstensWiederJeLauf: 4,

  /* ---- Was Paul SIEHT. Alles davon ist Anzeige, nichts davon zwingt. ---- */
  anzeige: {
    /* Steht die Zahl der wartenden Punkte an einem Blatt?
       "zahl"  - "3 warten auf dich"
       "punkt" - nur ein unauffaelliger Punkt, ohne Zahl
       "aus"   - gar nichts, nur die Reihenfolge aendert sich

       ⚠️ Der Grund, warum das ueberhaupt ein Schalter ist: Eine Zahl hilft
       beim Waehlen, kann fuer ein Kind aber wie eine Schuld aussehen -
       besonders wenn 40 Punkte "warten". Deshalb faellt sie oberhalb von
       `zahlBis` von selbst weg, statt zu wachsen. */
    wartend: "zahl",

    /* Ab dieser Zahl wird aus "12" ein schlichtes "viele" - eine grosse Zahl
       ist eine Mahnung, keine Hilfe. 0 = nie umschalten. */
    zahlBis: 9,

    /* Wie die Zahl heisst. {n} wird ersetzt. */
    textEins: "1 wartet auf dich",
    textMehr: "{n} warten auf dich",
    textViele: "viele warten auf dich",

    /* Stellt die Faelligkeit Blaetter in der Auswahl nach oben?
       Die Sorte (Lernziele/Heft/Uebung) entscheidet weiterhin ZUERST -
       die Faelligkeit sortiert nur innerhalb gleicher Sorte. */
    sortiert: true,

    /* Wird gesagt, dass eine Frage schon einmal dran war?
       true  - "Die hattest du schon einmal" beim Aufdecken
       false - gar nichts; sie kommt einfach wieder */
    sagenDassWiederholt: true,
    textWiederholt: "Die hattest du vor {tage} Tagen schon einmal.",
  },
};

/* Schluessel im KV. Ein Eintrag je Kind - nicht je Punkt, sonst waeren es
   tausende Leseabfragen. */
export const PUNKTE = (kind) => "quiz-punkte:" + kind;

/* Hoechstzahl gemerkter Punkte. Bei 500 Blaettern x 14 Zeilen waeren es 7000;
   als JSON mit vier Feldern je Punkt sind das rund 400 KB - der KV-Wert darf
   25 MB. Der Deckel schuetzt trotzdem vor einem Ausreisser, und er wirft die
   AELTESTEN zuerst weg (die sind am laengsten nicht dran gewesen und damit
   ohnehin faellig - sie kommen als "neu" wieder). */
export const PUNKTE_MAX = 4000;

const TAG = 86400000;

/* Der Lernpunkt: Blatt + Zeilennummer. Mechanisch erzeugt, vom Modell
   unabhaengig - anders als `merkmal`, das je Lauf neu erfunden wird.
   Ohne Blatt oder ohne Zeilennummer gibt es keinen stabilen Punkt; dann
   faellt die Frage einfach aus der Wiedervorlage heraus (sie verhaelt sich
   wie vorher). */
export function punktSchluessel(frage) {
  const blatt = String((frage && frage.blatt) || "").trim();
  /* Fundkarten (Such-Spiel, 25.09.2026): Sie haben keine Zeilennummer, aber
     eine feste Antwort. "blatt#k:<antwort>" haelt auch ein Neulesen des
     Blattes aus, solange die Antwort gleich bleibt. Das "k:" trennt sie von
     den Quiz-Punkten "blatt#<nr>" - wartendJeBlatt() zaehlt sie nicht mit. */
  if (frage && frage.fund) {
    const k = String(frage.fund).toLowerCase().replace(/[^a-z0-9äöüß]+/g, "").slice(0, 40);
    return blatt && k ? blatt + "#k:" + k : "";
  }
  const nr = Number(frage && frage.belegNr);
  if (!blatt || !Number.isFinite(nr) || nr < 1) return "";
  return blatt + "#" + Math.floor(nr);
}

/* Wann ein Punkt wieder faellig ist. Gibt einen Zeitstempel zurueck. */
export function wiederAb(p, e) {
  const ein = e || EINSTELLUNGEN;
  const zuletzt = Number(p && p.z) || 0;
  if (!zuletzt) return 0;
  let tage = ein.abstandTage;
  if ((Number(p.r) || 0) >= ein.sitzt) tage = ein.abstandTageWennSitzt;
  else if (p.f && ein.abstandTageNachFehler != null) tage = ein.abstandTageNachFehler;
  return zuletzt + tage * TAG;
}

export function istFaellig(p, jetzt, e) {
  const ab = wiederAb(p, e);
  return ab > 0 && (jetzt || Date.now()) >= ab;
}

/* Die Sortierung, die den alten Ausschluss ersetzt.
 *
 * Reihenfolge:
 *   1. noch nie gefragt        (das Neue zuerst - es ist der Stoff von heute)
 *   2. faellig, am laengsten her
 *   3. noch nicht faellig      (kommt nur dran, wenn sonst nichts da ist)
 *
 * Nichts wird entfernt. Wer sein Blatt zum vierten Mal ueben will, bekommt
 * es - dann greift Stufe 3.
 */
export function nachFaelligkeit(fragen, punkte, jetzt, e) {
  const ein = e || EINSTELLUNGEN;
  const nun = jetzt || Date.now();
  /* ⚠️ Der Schalter muss GANZ abschalten, nicht nur den Rang. Bis zum
     24.09.2026 gab `rang()` bei an:false zwar ueberall 0 zurueck - der
     zweite Schluessel `her` sortierte aber weiter, und die Reihenfolge kam
     trotzdem umgestellt heraus. Gefunden hat das nicht der Selbsttest,
     sondern Gegenprobe G: Seine Pruefdaten standen schon in
     Faelligkeitsreihenfolge, er konnte den Fehler gar nicht erreichen. */
  if (!ein.an) return (fragen || []).slice();
  const rang = (f) => {
    const s = punktSchluessel(f);
    const p = s && punkte ? punkte[s] : null;
    if (!p || !p.z) return 0;
    return istFaellig(p, nun, ein) ? 1 : 2;
  };
  const her = (f) => {
    const s = punktSchluessel(f);
    const p = s && punkte ? punkte[s] : null;
    return p && p.z ? p.z : 0;
  };
  return fragen
    .map((f, i) => ({ f, i, rang: rang(f), her: her(f) }))
    .sort((a, b) => (a.rang - b.rang) || (a.her - b.her) || (a.i - b.i))
    .map((x) => x.f);
}

/* Wie viele Punkte je Blatt warten. Fuer die Anzeige in der Blattauswahl. */
export function wartendJeBlatt(fragen, punkte, jetzt, e) {
  const ein = e || EINSTELLUNGEN;
  const nun = jetzt || Date.now();
  const raus = {};
  if (!ein.an) return raus;
  const gezaehlt = new Set();
  for (const f of fragen || []) {
    const s = punktSchluessel(f);
    if (!s || gezaehlt.has(s)) continue;
    const p = punkte ? punkte[s] : null;
    if (!p || !p.z || !istFaellig(p, nun, ein)) continue;
    gezaehlt.add(s);
    const blatt = String(f.blatt || "");
    raus[blatt] = (raus[blatt] || 0) + 1;
  }
  return raus;
}

/* Faellige Fundkarten je Blatt: { blatt: ["blatt#k:...", ...] }.
   Nur was schon einmal gespielt wurde und wieder dran ist - eine nie
   gespielte Karte "wartet" nicht, sie ist einfach neu. */
export function fundFaelligJeBlatt(punkte, jetzt, e) {
  const ein = e || EINSTELLUNGEN;
  const raus = {};
  if (!ein.an) return raus;
  const nun = jetzt || Date.now();
  for (const s of Object.keys(punkte || {})) {
    const i = s.indexOf("#k:");
    if (i < 1 || !istFaellig(punkte[s], nun, ein)) continue;
    (raus[s.slice(0, i)] = raus[s.slice(0, i)] || []).push(s);
  }
  return raus;
}

/* Der Stand JEDER gespielten Fundkarte, fuer die Tagesrunde (25.09.2026):
   { "blatt#k:...": { r, f, faellig, tage } }. Nur lesen - die Seite waehlt
   daraus die Mischung, der Server entscheidet dabei nichts.
   r = richtig in Folge · f = zuletzt falsch · tage = seit dem letzten Mal. */
export function fundStandJeKarte(punkte, jetzt, e) {
  const ein = e || EINSTELLUNGEN;
  const raus = {};
  if (!ein.an) return raus;
  const nun = jetzt || Date.now();
  for (const s of Object.keys(punkte || {})) {
    if (s.indexOf("#k:") < 1) continue;
    const p = punkte[s] || {};
    raus[s] = { r: Number(p.r) || 0, f: p.f ? 1 : 0,
                faellig: istFaellig(p, nun, ein) ? 1 : 0,
                tage: p.z ? Math.floor((nun - p.z) / TAG) : null };
  }
  return raus;
}

/* Eine Antwort verbuchen.
 *
 * `richtig` ist der ERSTE Versuch - wer erst mit Tipp und Blatt daraufkommt,
 * hat es noch nicht gewusst (dieselbe Regel wie `stimmtEcht` im Motor).
 *
 * Gespeichert wird so kurz wie moeglich, weil der ganze Bestand in EINEN
 * KV-Wert geht:  z = zuletzt (ms) · r = richtig in Folge · f = zuletzt falsch
 */
export function punktVerbuchen(punkte, frage, richtig, jetzt, e) {
  const ein = e || EINSTELLUNGEN;
  const s = punktSchluessel(frage);
  if (!s) return punkte;
  const p = punkte[s] || { z: 0, r: 0 };
  p.z = jetzt || Date.now();
  if (richtig) {
    p.r = Math.min((Number(p.r) || 0) + 1, ein.sitzt);
    delete p.f;
  } else {
    /* ⚠️ NICHT auf null - das waere ein Karteikasten mit Strafe.
       Genau einen Schritt zurueck. */
    p.r = Math.max((Number(p.r) || 0) - 1, 0);
    p.f = 1;
  }
  punkte[s] = p;
  return punkte;
}

/* Deckel: die aeltesten fliegen zuerst. Sie sind ohnehin laengst faellig und
   kommen als "noch nie gefragt" wieder - kein Verlust, nur ein Neuanfang. */
export function punkteKuerzen(punkte, max) {
  const grenze = max || PUNKTE_MAX;
  const schluessel = Object.keys(punkte || {});
  if (schluessel.length <= grenze) return punkte;
  schluessel.sort((a, b) => (punkte[b].z || 0) - (punkte[a].z || 0));
  const raus = {};
  for (const s of schluessel.slice(0, grenze)) raus[s] = punkte[s];
  return raus;
}

export async function punkteLesen(env, kind) {
  try {
    const roh = await env.PAUL_KV.get(PUNKTE(kind));
    const d = roh ? JSON.parse(roh) : null;
    if (d && typeof d === "object" && !Array.isArray(d)) return d;
  } catch (e) {}
  return {};
}

/* Schreibt nur, wenn sich wirklich etwas geaendert hat - Schreibvorgaenge
   sind hier die knappe Zahl (1000/Tag), nicht der Platz. Dieselbe Regel wie
   in `_riegel.js` und `artSetzen()`.
   Gibt zurueck, OB geschrieben wurde - der Selbsttest zaehlt das mit. */
export async function punkteSchreiben(env, kind, punkte, vorher) {
  const neu = JSON.stringify(punkteKuerzen(punkte));
  if (vorher !== undefined && neu === JSON.stringify(vorher)) return false;
  try {
    await env.PAUL_KV.put(PUNKTE(kind), neu);
    return true;
  } catch (e) {
    /* Voller Speicher darf keine Lernrunde abbrechen. Die Antworten sind
       gezaehlt, nur die Wiedervorlage merkt sich diesen Lauf nicht.
       ⚠️ Es wird NICHT "gespeichert" gemeldet - dieselbe Lehre wie am
       14.09.2026, als ein Kind "error code: 1101" zu sehen bekam. */
    return false;
  }
}

/* Was die Seite braucht. Damit hat `quiz/motor.js` KEINE eigene Kopie der
   Einstellungen - wer hier etwas dreht, dreht es auch dort. */
export function fuerDieSeite(e) {
  const ein = e || EINSTELLUNGEN;
  return { an: !!ein.an, anzeige: ein.anzeige };
}

/* Der fertige Text fuer "n warten auf dich" - nach denselben Schaltern.
   Steht hier und nicht im Motor, damit Server und Seite nie auseinanderlaufen. */
export function wartendText(n, e) {
  const a = (e || EINSTELLUNGEN).anzeige;
  if (!n || a.wartend === "aus") return "";
  if (a.wartend === "punkt") return "·";
  if (a.zahlBis && n > a.zahlBis) return a.textViele;
  return (n === 1 ? a.textEins : a.textMehr).replace("{n}", String(n));
}
