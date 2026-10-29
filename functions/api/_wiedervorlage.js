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
 *     ⚠️ EINE Ausnahme seit 19.10.2026, NUR fuer "Alle Fragen (N)" im
 *     Lernquiz: Was schon sicher sitzt (siehe `gekonnteTatsachen()`), bleibt
 *     dort weg. Denny per Klickfrage, Montag 19.10.2026 ~17:40 Uhr,
 *     "Gekonntes weglassen, abschaltbar" - Anlass: Paul beantwortete in HSU
 *     "Alle Blaetter, alle Fragen" ueber 100 Fragen am Stueck, die meisten
 *     konnte er schon; Ziel "dass Paul alles kann, aber vom Lernen nicht
 *     gelangweilt ist". Paul holt es mit dem Schalter "Auch Gekonntes"
 *     zurueck, nichts ist gesperrt. Feste Fragenzahlen (5/10/20/25), die
 *     Fach-Tagesrunde und das Such-Spiel sortieren weiter nur.
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

  /* "Alle Fragen (N)" laesst Gekonntes weg (Denny, 19.10.2026: "Gekonntes
     weglassen, abschaltbar"). false = "Alle Fragen" heisst wieder ALLE, wie
     bis zum 19.10.2026. Was "gekonnt" heisst, steht in gekonnteTatsachen(). */
  alleOhneGekonntes: true,

  /* Schritt 3 (Denny, 29.10.2026, NUR Paul - erkennbar am Feld v:3 im Punkt, das nur
     punktVerbuchen(..., { paul: true }) setzt; Leon und Helena bekommen es nie):
     3b - "Eine falsch beantwortete Karte kommt nach etwa einem Tag wieder, bei erneutem
     Fehler nach zwei bis drei Tagen." Index = Fehler in Folge (fn) - 1, ab dem dritten
     bleibt es beim letzten Wert. Grund: Proben nach vier Wochen und unangekuendigte Exen. */
  paulFehlerTage: [1, 2, 3],

  /* 3c - "sicher" = an zwei verschiedenen Tagen richtig, mindestens so viele Kalendertage
     (Berlin) auseinander. Vorlaeufig; gemessen an den echten Daten am 29.10.2026
     (3 Tage: Rueckfall 12 %, 6 Tage: 10 %, aber 12 statt 6 Tage bis sicher), neu gezaehlt
     am 18.11.2026 (offener Punkt 823). Ersetzt bei Paul `sitzt` (3x richtig, auch an EINEM
     Tag moeglich: 26 von 57, gemessen 28.10.2026). */
  sicherAbstandTage: 3,

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
       die Faelligkeit sortiert nur innerhalb gleicher Sorte.
       Seit 16.10.2026 aus: Denny zu einem Blatt vom 28.9. ganz oben ueber den
       Blaettern vom 16.10.: "Das erste Blatt ist nicht nach dem Datum sortiert."
       Jetzt neueste zuerst; "viele warten auf dich" steht weiter am Blatt. */
    sortiert: false,

    /* Wird gesagt, dass eine Frage schon einmal dran war?
       true  - "Die hattest du schon einmal" beim Aufdecken
       false - gar nichts; sie kommt einfach wieder */
    sagenDassWiederholt: true,
    textWiederholt: "Die hattest du vor {tage} Tagen schon einmal.",
  },
};

/* ---- Schritt 4 (Denny, 29.10.2026): Gewichtung und Tagesmenge, NUR Paul ----
   Alle Werte sind vorlaeufig und stehen nur hier. Die Seite (tagesrunde.js) bekommt sie
   ueber /api/quiz?nurWartend=1 (Feld schritt4.k) - es gibt keine zweite Kopie.
   Kapitel anleitung/152-schritt4-gewichtung.md. */
export const SCHRITT4 = {
  an: true,
  /* Gewicht je Stufe. Grenze alt/neu = Probendatum des Fachs (Blattdatum gegen Probendatum).
     neu          Blatt ab dem Probendatum, ohne Fehler
     frischFehler Fehler auf einem neuen Blatt
     altFehler    Fehler auf einem alten Blatt, bis er nach Schritt 3 sicher ist
     altRichtig   altes Blatt, (noch) ohne Fehler, nicht sicher - auch nie gefragt (Annahme)
     sicher       sicher nach Schritt 3 (3c) */
  gewicht: { neu: 10, frischFehler: 4, altFehler: 4, altRichtig: 2, sicher: 0.5 },
  altRichtigJeRunde: 1,
  neuJeRunde: 9,
  /* Angekuendigte Probe (Pauls eingetragene Proben): in den letzten probeTage Tagen davor
     zaehlen Karten dieses Fachs probeFaktor-fach. */
  probeFaktor: 2,
  probeTage: 7,
  /* Wiederholung je Fach: Normaltag, nach 1 Tag Pause, nach 2 und mehr Tagen Pause. */
  tagesmenge: [8, 12, 15],
};

/* Heft-Schluessel eines Fachs: "mathematik" (Noten) = "mathe", "deutsch-lesen" = "deutsch". */
export function fachNorm(f) {
  let x = String(f || "").toLowerCase().trim();
  const i = x.indexOf("-");
  if (i > 0) x = x.slice(0, i);
  return x === "mathematik" ? "mathe" : x;
}

/* Sicher im Sinn von Schritt 3: v:3 mit s; alte Punkte ohne v:3 nach dem alten Deckel. */
export function istSicher4(p, e) {
  const ein = e || EINSTELLUNGEN;
  if (!p || !p.z) return false;
  if (p.v === 3) return !!p.s;
  return (Number(p.r) || 0) >= ein.sitzt && !p.f;
}

/* Die Stufe eines Lernpunkts. f = zuletzt falsch, fz = frueher falsch und seitdem richtig:
   Beides bleibt "Fehler", bis der Punkt sicher ist (Dennys "bis Paul sie nach der
   Schritt-3-Regel kann"). */
export function stufe4(p, blattNeu, e) {
  if (istSicher4(p, e)) return "sicher";
  if (p && p.z && (p.f || p.fz)) return blattNeu ? "frischFehler" : "altFehler";
  return blattNeu ? "neu" : "altRichtig";
}

export function gewicht4(stufe, probeNah, k) {
  const K = k || SCHRITT4;
  return (Number(K.gewicht[stufe]) || 0) * (probeNah ? K.probeFaktor : 1);
}

/* Pause = volle Kalendertage (Berlin) ohne Antwort zwischen dem letzten Antworttag VOR heute
   und heute. Gestern geuebt = 0, vorgestern = 1. Nie geuebt = 0 (Normaltag, Annahme). */
export function pauseTage(letzterTagNr, heuteNr) {
  if (!letzterTagNr || !heuteNr || letzterTagNr >= heuteNr) return 0;
  return Math.max(0, heuteNr - letzterTagNr - 1);
}

export function tagesmenge4(pause, k) {
  const t = (k || SCHRITT4).tagesmenge;
  return pause >= 2 ? t[2] : pause === 1 ? t[1] : t[0];
}

/* Probenlage aus Pauls eingetragenen Proben (proben-termine) und den Noten:
     grenze  { fach: Datum der juengsten Probe bis heute }   - die Grenze alt/neu
     nah     { fach: Datum der naechsten Probe in 0..probeTage Tagen }
   heute = "JJJJ-MM-TT" (Berlin). Reine Funktion. */
export function probenLage(termine, noten, heute, k) {
  const K = k || SCHRITT4;
  const grenze = {}, nah = {};
  const tag = (d) => Date.parse(String(d).slice(0, 10) + "T12:00:00Z");
  const h = tag(heute);
  const alle = [].concat(termine || [], (noten || []).map((n) => ({ datum: n && n.datum, fach: n && n.fach })));
  for (const t of alle) {
    if (!t || !/^\d{4}-\d{2}-\d{2}/.test(String(t.datum || ""))) continue;
    const f = fachNorm(t.fach), d = String(t.datum).slice(0, 10);
    if (!f) continue;
    const abstand = Math.round((tag(d) - h) / TAG);
    if (abstand <= 0) { if (!grenze[f] || d > grenze[f]) grenze[f] = d; }
    if (abstand >= 0 && abstand <= K.probeTage) { if (!nah[f] || d < nah[f]) nah[f] = d; }
  }
  return { grenze, nah };
}

/* Ist das Blatt neu (ab dem Probendatum seines Fachs)? Ohne Probe im Fach ist alles neu.
   Blatt ohne Datum ("ohne") oder mit unsicherem Datum gilt als alt - wie Schritt 2. */
export function blattNeu4(blatt, grenze) {
  if (!blatt) return false;
  const g = grenze && grenze[fachNorm(blatt.fach)];
  if (!g) return true;
  if (blatt.datumUnsicher || blatt.datumVon === "ohne") return false;
  const d = String(blatt.datum || "").slice(0, 10);
  return !!d && d >= g;
}

/* Pause je Fach aus den Lernpunkten: letzter Antworttag vor heute je Fach.
   fachVon(schluessel) -> Fach oder "". Rueckgabe { fach: pauseTage }. */
export function pauseJeFach(punkte, fachVon, jetzt) {
  const heute = berlinTagNr(jetzt || Date.now());
  const letzter = {};
  for (const s of Object.keys(punkte || {})) {
    const p = punkte[s];
    const f = fachVon(s);
    if (!f || !p || !p.z) continue;
    const t = berlinTagNr(p.z);
    if (t < heute && (!letzter[f] || t > letzter[f])) letzter[f] = t;
  }
  const raus = {};
  for (const f of Object.keys(letzter)) raus[f] = pauseTage(letzter[f], heute);
  return raus;
}

/* Gewichtetes Ziehen ohne Zuruecklegen (Efraimidis-Spirakis): Schluessel u^(1/w), groesster
   zuerst. Gewicht 0 kommt nie vor Gewicht > 0. Rueckgabe: die ganze Liste in Ziehreihenfolge. */
export function gewichtetZiehen(liste, gewichtFn, zufall) {
  const z = zufall || Math.random;
  return (liste || []).map((x, i) => {
    const w = Number(gewichtFn(x)) || 0;
    const u = Math.min(Math.max(z(), 1e-12), 1);
    return { x, i, k: w > 0 ? Math.log(u) / w : -Infinity };
  }).sort((a, b) => (b.k - a.k) || (a.i - b.i)).map((y) => y.x);
}

/* Die Reihenfolge einer Quizrunde fuer Paul (Schritt 4). Rein, ohne Speicher.
   kand: [{ f, stufe, faellig, fach, probeNah }] - eine je Tatsache.
   menge: { fach: Tagesmenge } (fehlt ein Fach: tagesmenge[0]).
   Rueckgabe { fragen (geordnet), einstieg (Frage oder null), wieder, zaehl }.
     1. Einstieg: EINE sichere, noch nicht faellige Karte, zufaellig (wechselt je Runde).
     2. Wiederholung: faellige Karten, gewichtet gezogen, je Fach hoechstens die Tagesmenge.
     3. Freies Ueben: der Rest gewichtet, hoechstens neuJeRunde neue und altRichtigJeRunde
        alt-richtige in der ganzen Runde (inkl. Wiederholung).
     4. Auffuellen: was die Deckel zurueckhielten, gewichtet - Paul hat die Fragenzahl gewaehlt,
        lieber Altes als ein leeres Quiz (Regel vom 24.09.2026). Ueberzaehlige Faellige zuletzt. */
export function quizReihe4(kand, menge, zufall, k) {
  const K = k || SCHRITT4;
  const z = zufall || Math.random;
  const w = (c) => gewicht4(c.stufe, c.probeNah, K);
  const zaehl = { einstieg: 0, wieder: 0, frei: 0, auffuellen: 0, neu: 0, altRichtig: 0 };
  const rest = (kand || []).slice();
  let einstieg = null;
  const sichere = rest.filter((c) => c.stufe === "sicher" && !c.faellig);
  if (sichere.length) {
    einstieg = sichere[Math.floor(z() * sichere.length) % sichere.length];
    rest.splice(rest.indexOf(einstieg), 1);
    zaehl.einstieg = 1;
  }
  const reihe = [];
  const jeFach = {};
  const ueber = [];
  let neu = 0, altR = 0;
  const darf = (c) => (c.stufe === "neu" ? neu < K.neuJeRunde : c.stufe === "altRichtig" ? altR < K.altRichtigJeRunde : true);
  const nimm = (c) => { reihe.push(c); if (c.stufe === "neu") neu++; if (c.stufe === "altRichtig") altR++; };
  const faellige = gewichtetZiehen(rest.filter((c) => c.faellig), w, z);
  const sonst = rest.filter((c) => !c.faellig);
  const zurueck = [];
  for (const c of faellige) {
    const m = menge && menge[c.fach] != null ? menge[c.fach] : K.tagesmenge[0];
    if ((jeFach[c.fach] || 0) >= m) { ueber.push(c); continue; }
    if (!darf(c)) { zurueck.push(c); continue; }
    jeFach[c.fach] = (jeFach[c.fach] || 0) + 1;
    nimm(c); zaehl.wieder++;
  }
  for (const c of gewichtetZiehen(sonst, w, z)) {
    if (!darf(c)) { zurueck.push(c); continue; }
    nimm(c); zaehl.frei++;
  }
  for (const c of gewichtetZiehen(zurueck, w, z).concat(gewichtetZiehen(ueber, w, z))) {
    reihe.push(c); zaehl.auffuellen++;
  }
  zaehl.neu = neu; zaehl.altRichtig = altR;
  const fragen = (einstieg ? [einstieg] : []).concat(reihe).map((c) => c.f);
  return { fragen, einstieg: einstieg ? einstieg.f : null, wieder: zaehl.wieder, zaehl };
}

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
  if (blatt && Number.isFinite(nr) && nr >= 1) return blatt + "#" + Math.floor(nr);
  /* Ersatz-Lernpunkt (29.09.2026): Bis dahin hatte KEINE der 414 Quizfragen
     eine belegNr - das Feld stand nicht in `required`, das Modell lieferte es
     nie, und das Quiz wiederholte nichts. Die Frage-id ist im Vorrat stabil;
     "blatt#f:<id>" haelt die Frage, bis sie aus dem Vorrat faellt. */
  const id = String((frage && (frage.id || frage.frageId)) || "").trim().slice(0, 24);
  return blatt && id ? blatt + "#f:" + id : "";
}

/* Kalendertag in Berlin als fortlaufende Zahl - fuer "an zwei verschiedenen Tagen,
   mindestens 3 Tage auseinander" (3c). Montag 18 Uhr und Donnerstag 8 Uhr sind 3 Tage. */
const TAGFORMAT = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" });
export function berlinTagNr(ms) {
  if (!ms) return 0;
  return Math.round(Date.parse(TAGFORMAT.format(new Date(ms)) + "T00:00:00Z") / TAG);
}

/* Punkte, die nach Schritt 3 gefuehrt werden (nur Paul, Feld v:3). Mathe- und
   Lese-Wiederholung haben ihre eigene Leiter 2/4/7/28 (Kapitel 142, 149) und bleiben aussen vor. */
export function schritt3Punkt(s) {
  return !!s && s.indexOf("mathe#") !== 0 && s.indexOf("lesen#") !== 0;
}

/* Wann ein Punkt wieder faellig ist. Gibt einen Zeitstempel zurueck. */
export function wiederAb(p, e) {
  const ein = e || EINSTELLUNGEN;
  const zuletzt = Number(p && p.z) || 0;
  if (!zuletzt) return 0;
  /* Schritt 3, nur Paul (v:3): sicher -> 28 Tage, falsch -> 1/2/3 Tage nach Fehlern in
     Folge, sonst 7 Tage wie bisher. */
  if (p.v === 3) {
    const ft = ein.paulFehlerTage || [ein.abstandTageNachFehler];
    const fn = Math.max(1, Number(p.fn) || 1);
    const t = p.s ? ein.abstandTageWennSitzt
      : p.f ? ft[Math.min(fn, ft.length) - 1]
      : ein.abstandTage;
    return zuletzt + t * TAG;
  }
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

/* Was "gekonnt" heisst (19.10.2026, fuer "Alle Fragen" ohne Gekonntes).
 *
 * Kein neuer Begriff, sondern die vorhandene Stufe `sitzt`: ein Lernpunkt,
 * der `sitzt`-mal (3) richtig war, bekommt den langen Abstand
 * `abstandTageWennSitzt` (28 Tage). Gekonnt ist eine TATSACHE (Kapitel 132),
 * wenn
 *   1. die Summe von `r` ueber die Lernpunkte ALLER ihrer Formen >= `sitzt`
 *      ist - dieselbe Zaehlung wie `richtigZahl()` in _fragerichtung.js;
 *   2. ihr juengster Lernpunkt (groesstes z) NICHT zuletzt falsch war und
 *   3. NICHT faellig ist. Ist der Erhaltungsabstand um, kommt sie wieder mit
 *      - "mit Abstand richtig" bleibt so eine Wiedervorlage, kein Verschwinden.
 * `r` steigt hoechstens einmal je Lernrunde und faellt nach einem Fehler einen
 * Schritt zurueck - drei Treffer heisst drei Runden.
 *
 *   fragen       der Vorrat (alle Formen; die Gruppe muss vollstaendig sein)
 *   tatsache     Schluessel-Funktion, normalerweise tatsacheVon
 * Rueckgabe: Set der gekonnten Tatsachen-Schluessel. Leer, wenn abgeschaltet. */
export function gekonnteTatsachen(fragen, punkte, jetzt, tatsache, e) {
  const ein = e || EINSTELLUNGEN;
  const raus = new Set();
  if (!ein.an || !ein.alleOhneGekonntes || !punkte) return raus;
  const nun = jetzt || Date.now();
  const schl = tatsache || ((f) => "f:" + String((f && f.id) || ""));
  const gruppe = new Map();
  for (const f of fragen || []) {
    const t = schl(f);
    const s = punktSchluessel(f);
    if (!t || !s) continue;
    if (!gruppe.has(t)) gruppe.set(t, new Set());
    gruppe.get(t).add(s);
  }
  for (const [t, schluessel] of gruppe) {
    /* Schritt 3, nur Paul: gekonnt = sicher nach 3c ueber ALLE Formen der Tatsache
       (die Formen wechseln, also traegt kaum ein einzelner Punkt zwei Tage). */
    if ([...schluessel].some((s) => punkte[s] && punkte[s].v === 3)) {
      if (tatsacheSicher([...schluessel].map((s) => punkte[s]), nun, ein)) raus.add(t);
      continue;
    }
    let summe = 0, juengster = null;
    for (const s of schluessel) {
      const p = punkte[s];
      if (!p || !p.z) continue;
      summe += Number(p.r) || 0;
      if (!juengster || (Number(p.z) || 0) > (Number(juengster.z) || 0)) juengster = p;
    }
    if (!juengster || summe < ein.sitzt) continue;
    if (juengster.f || istFaellig(juengster, nun, ein)) continue;
    raus.add(t);
  }
  return raus;
}

/* 3c ueber mehrere Formen einer Tatsache (nur Paul): die Folge beginnt nach dem
   juengsten Fehler irgendeiner Form; sicher, wenn darin zwei richtige Tage mindestens
   `sicherAbstandTage` auseinanderliegen - oder eine Form selbst schon sicher ist.
   Zuletzt falsch oder faellig heisst nie gekonnt. */
export function tatsacheSicher(liste, jetzt, e) {
  const ein = e || EINSTELLUNGEN;
  const ps = (liste || []).filter((p) => p && p.z);
  if (!ps.length) return false;
  const juengster = ps.reduce((a, b) => ((Number(b.z) || 0) > (Number(a.z) || 0) ? b : a));
  if (juengster.f || istFaellig(juengster, jetzt || Date.now(), ein)) return false;
  const fehler = Math.max(0, ...ps.filter((p) => p.f).map((p) => Number(p.z) || 0));
  let anfang = Infinity, ende = 0;
  for (const p of ps) {
    if (p.f) continue;
    if (p.s && (Number(p.z) || 0) > fehler) return true;
    const z = Number(p.z) || 0, t1 = Number(p.t1) || 0;
    if (z <= fehler) continue;
    anfang = Math.min(anfang, t1 > fehler ? t1 : z);
    ende = Math.max(ende, z);
  }
  return anfang < Infinity && berlinTagNr(ende) - berlinTagNr(anfang) >= ein.sicherAbstandTage;
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
    /* Mathe-Wiederholung (26.10.2026, nur Paul): Die Seite rechnet ihre
       2/4/7/28 Tage und die 3-Tage-Pause in KALENDERtagen (Ortszeit) - dafuer
       braucht sie den Zeitpunkt selbst. Nur fuer "mathe#k:" und (28.10.2026, Kapitel 149)
       "lesen#k:", sonst unveraendert. */
    if ((s.indexOf("mathe#k:") === 0 || s.indexOf("lesen#k:") === 0) && p.z) raus[s].z = Number(p.z);
    /* Schritt 3 (nur Paul): "sicher" nach 3c - die Tagesrunde nimmt es statt r. */
    if (p.v === 3) raus[s].s = p.s ? 1 : 0;
    /* Schritt 4 (nur Paul, v:3): frueher falsch und seitdem richtig - bleibt "Fehler" bis sicher. */
    if (p.v === 3 && p.fz) raus[s].fz = 1;
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
export function punktVerbuchen(punkte, frage, richtig, jetzt, e, opt) {
  const ein = e || EINSTELLUNGEN;
  const s = punktSchluessel(frage);
  if (!s) return punkte;
  const p = punkte[s] || { z: 0, r: 0 };
  const vorher = Number(p.z) || 0;
  p.z = jetzt || Date.now();
  /* Schritt 3 (29.10.2026), NUR mit opt.paul: fn = Fehler in Folge (3b),
     t1 = erstes Richtig der laufenden Folge, s = sicher (3c), v:3 = nach Schritt 3 gefuehrt.
     Ohne opt.paul (Leon, Helena) entsteht keines dieser Felder. */
  /* Schritt 4 (nur Paul): Eine sichere Karte, die vor ihrer Faelligkeit richtig beantwortet
     wird (Einstiegskarte, oder im freien Ueben gezogen), aendert nichts - der 28-Tage-Takt
     bleibt. Falsch laeuft weiter unten wie Schritt 3: nicht mehr sicher, wieder nach 1 Tag. */
  if (opt && opt.paul && SCHRITT4.an && richtig && schritt3Punkt(s) && p.v === 3 && p.s && vorher &&
      !istFaellig({ ...p, z: vorher }, jetzt || Date.now(), ein)) {
    p.z = vorher;
    return punkte;
  }
  if (opt && opt.paul && schritt3Punkt(s)) {
    p.v = 3;
    if (richtig) {
      delete p.fn;
      if (!p.t1 || p.f) p.t1 = p.z;
      if (berlinTagNr(p.z) - berlinTagNr(p.t1) >= ein.sicherAbstandTage) p.s = 1;
    } else {
      p.fn = Math.min((Number(p.fn) || 0) + 1, 9);
      delete p.t1; delete p.s;
    }
  }
  if (richtig) {
    p.r = Math.min((Number(p.r) || 0) + 1, ein.sitzt);
    /* fz = wann er zuletzt danebenlag (29.09.2026, Kreise fuellen). Damit
       weiss "Deine Woche" auch bei alten Runden ohne Lernpunkt, dass an
       diesem Tag ein Kreis spaeter geschafft wurde. */
    if (p.f && vorher) p.fz = vorher;
    delete p.f;
  } else {
    /* ⚠️ NICHT auf null - das waere ein Karteikasten mit Strafe.
       Genau einen Schritt zurueck. */
    p.r = Math.max((Number(p.r) || 0) - 1, 0);
    p.f = 1;
    delete p.fz;
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
