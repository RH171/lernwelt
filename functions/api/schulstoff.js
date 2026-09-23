/* Der Schaukasten: was ein Kind heute in der Schule gemacht hat.
 *
 * Denny am 22.09.2026: "Es wird ein digitaler Schaukasten seiner täglichen
 * Schularbeiten, selektiert nach Fach. Hier baust du im Hintergrund eine
 * Datenbank auf. Daraus können wir dann arbeiten und alles Mögliche bauen."
 *
 * Und vorher, am selben Tag: "Lass doch das Spiel erst mal weg - es geht
 * doch erst mal darum, dass Paul seine Daten hochladen kann."
 *
 * Deshalb macht dieser Weg NICHTS ausser aufbewahren. Kein Modell, kein
 * Geld, keine 90 Sekunden Warten: Foto rein, in zwei Sekunden fertig. Was
 * daraus gebaut wird - Übungen, Quiz, Prüfungsvorbereitung - kommt später
 * und liest aus demselben Bestand.
 *
 *   POST   /api/schulstoff         legt einen Eintrag ab   {fach, datum, notiz, seiten[]}
 *   GET    /api/schulstoff         liest den Bestand       ?monate=3
 *   GET    /api/schulstoff?bild=<id>:<nr>   ein Bild
 *   PATCH  /api/schulstoff         verstecken/zeigen/weg   {id, was}
 *
 * Der Ausweis des Kindes reicht - es ist sein eigenes Heft. Der Eltern-Code
 * kommt überall hinein.
 */
import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { fehlerJeFach } from "./_schwaechen.js";
import {
  FAECHER, kindOk, datumOk, heuteBerlin, blattDatum,
  stoffAblegen, stoffLesen, stoffBild, stoffAendern, titelSetzen, datumSetzen,
  inhaltSetzen,
  fingerabdruck, schonDa, datumPruefen, tageDavor, BLATT_OHNE_FRAGE_TAGE, vorschlagSetzen,
  faecherImHeft, blaetterImFach, schuljahrStart,
} from "./_schulstoff.js";

function json(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

// Bis hierher darf ein Bild gehen. Ein Handyfoto kommt verkleinert an
// (strom.js bringt es auf 1800 px, rund 280 KB) - 2 MB sind reichlich Luft.
const MAX_BILD = 2 * 1024 * 1024;
/* Hoechstens ZWEI Seiten je Eintrag - Vorder- und Rueckseite eines Blattes.
 *
 * Denny am 23.09.2026, nachdem gerechnet war, was ein Heft in einem Schwung
 * kostet: "Ich wuerde das auch so anlegen, dass Paul maximal ein Blatt
 * hochladen kann, gegebenenfalls Vorder- und Rueckseite. Hat den Vorteil, dass
 * er selber gar nicht durcheinanderkommt ... Damit minimiert sich auch das
 * Risiko von Verlust. Wenn man 25 Seiten liest, kann sicher was untergehen,
 * bei ein bis zwei Seiten nicht. Auch fuer Paul ist das viel einfacher als die
 * Frustration, eine ganze Woche nachzufragen."
 *
 * Stand vorher 6. Die Grenze ist damit KEIN technischer Deckel mehr, sondern
 * eine Entscheidung ueber den Ablauf: ein Blatt, ein Eintrag, ein Thema. */
const MAX_SEITEN = 2;
/* So viele Inhaltszeilen behaelt EIN Eintrag, ueber alle seine Seiten zusammen.
   Je Seite liest blattLesen() bis zu 14, und der Quiz-Auftrag traegt den
   ganzen Inhalt mit (quiz.js, letzterUnterricht).
   Bei den erlaubten zwei Seiten sind es hoechstens 28 - der Deckel greift
   also nur, wenn beide Seiten randvoll sind. */
const INHALT_MAX = 28;

async function darfRein(request, env, kind) {
  if (geheimFuer(env, "eltern") && (await ausweisGueltig(request, geheimFuer(env, "eltern"), env))) return true;
  const g = geheimFuer(env, kind);
  return !!g && (await ausweisGueltig(request, g, env));
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    if (new URL(request.url).searchParams.get("nachtragen") === "1") {
      return await nachtragen(context);
    }
  } catch (e) {}

  let d;
  try { d = await request.json(); } catch (e) { return json(400, { ok: false, fehler: "Die Anfrage war kein gültiges JSON." }); }

  const kind = String(d.kind || "").toLowerCase();
  if (!kindOk(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });

  const seitenRoh = Array.isArray(d.seiten) ? d.seiten : [];
  const seiten = seitenRoh.slice(0, MAX_SEITEN);
  /* Wegwerfen ohne ein Wort waere das Gegenteil dessen, wofuer das Schulheft
     gebaut ist ("was Paul hochlaedt, verschwindet nicht"). Wer mehr schickt,
     erfaehrt es - die Werkstatt schickt bis zu 20 Seiten und wuesste sonst
     nichts davon. */
  const zuViel = seitenRoh.length - seiten.length;
  if (!seiten.length) return json(400, { ok: false, fehler: "Da war kein Bild dabei." });
  for (const s of seiten) {
    if (typeof s !== "string" || !s.startsWith("data:")) {
      return json(400, { ok: false, fehler: "Eine der Seiten war unvollständig." });
    }
    if (s.length > MAX_BILD * 1.37) {   // base64 ist gut ein Drittel größer
      return json(400, { ok: false, fehler: "Ein Bild ist zu groß. Mach es bitte etwas kleiner." });
    }
  }

  /* Das Datum: zuerst das, was auf dem Blatt steht, dann Pauls Angabe, sonst
     heute. Denny am 22.09.2026: "Die Blätter, die Paul fotografiert, werden
     ein Datum haben … Solltest du auf dem Foto keines finden, bitte frage
     Paul danach." Gelesen wird es hier NICHT aus dem Bild - das kann nur das
     Modell, und das läuft erst beim Bauen. Schickt die Seite eines mit
     (blattText), wird es ausgewertet. */
  const heute = heuteBerlin();
  const vomBlatt = blattDatum(d.blattText || "", heute);
  const datum = vomBlatt || (datumOk(d.datum, heute) ? d.datum : heute);

  const abdruck = await fingerabdruck(seiten[0]);

  const e = await stoffAblegen(env, kind, {
    datum,
    abdruck,
    fach: String(d.fach || ""),
    // Schulheft oder Uebungsblatt - siehe ARTEN in _schulstoff.js.
    art: String(d.art || ""),
    thema: d.thema,
    titel: d.titel,
    notiz: d.notiz,
    datumVonBlatt: !!vomBlatt,
  }, seiten);

  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });

  /* Der Titel wird DIREKT geholt, nicht im Hintergrund.
   *
   * Der erste Entwurf nutzte context.waitUntil() - und nichts kam an, kein
   * Titel und nicht einmal ein Grund. Dieselbe Grenze wie beim Spielbau am
   * selben Tag: "waitUntil() can extend execution for up to 30 seconds after
   * the response is sent" (Cloudflare Workers Limits, 22.09.2026), und was
   * danach passiert, sieht niemand mehr.
   *
   * Also lieber ein paar Sekunden warten. Haiku mit einem verkleinerten Bild
   * braucht wenige Sekunden; nach GRENZE ist Schluss und es wird ohne Titel
   * abgelegt. Das Ablegen bleibt damit weit unter den 90 Sekunden, um die es
   * hier eigentlich ging - und der Eintrag liegt ohnehin schon sicher im
   * Speicher, bevor dieser Aufruf startet. */
  let titel = "", vomBlattGelesen = "", weichtAb = false, nachgefragt = null;
  let karten = [], kartenWarum = "", genauer = 0;
  if (env.ANTHROPIC_API_KEY) {
    try {
      /* ALLE Seiten auslesen, nicht nur die erste.
       *
       * Denny am 23.09.2026, nachdem die Lehrerin am Elternabend gesagt hatte
       * "es wird gefragt, was im Heft steht": "Paul oder ich werden alles
       * fotografieren, was in diesem Heft ist." Bis dahin las diese Stelle
       * blattLesen(env, seiten[0]) - bei sechs hochgeladenen Heftseiten kannte
       * das System den Inhalt EINER davon, die anderen fuenf lagen als Bild da
       * und waren fuer Quiz und Beleg-Riegel unsichtbar.
       *
       * Parallel, nicht nacheinander: sechs Seiten der Reihe nach waeren rund
       * zwoelf Sekunden, nebeneinander sind es zwei bis drei. Jeder Aufruf hat
       * ohnehin seine eigene Abbruchgrenze (TITEL_GRENZE).
       *
       * Titel, Datum und Fundkarten kommen weiter NUR von Seite 1:
       * - Titel und Datum stehen oben auf der ersten Seite,
       * - eine Fundkarte traegt Bildkoordinaten, und fundkarten.js holt dazu
       *   immer Seite 0. Eine Karte von Seite 4 wuerde den Ausschnitt aus dem
       *   falschen Bild zeigen.
       * Der INHALT dagegen wird ueber alle Seiten aneinandergehaengt. Die
       * beleg_nr des Quiz zaehlt einfach weiter - am Riegel aendert sich
       * dadurch nichts. */
      const alle = await Promise.all(
        seiten.map((s) => blattLesen(env, s).catch(() => null))
      );
      const gelesen = alle[0] || { titel: "", datum: "", inhalt: [], karten: [] };
      /* Zeilen der Folgeseiten anhaengen, doppelte weglassen: Ein Merkkasten,
         den das Kind auf zwei Seiten fotografiert hat, soll nicht zweimal
         abgefragt werden. */
      gelesen.inhalt = inhalteZusammen(alle);
      titel = gelesen.titel;
      /* Das Datum vom Blatt gilt - es weiss besser, wann das Blatt entstanden
         ist, als eine Voreinstellung. ABER es wird nicht stillschweigend
         getauscht: Weicht es von dem ab, was das Kind gewaehlt hat, steht das
         in der Antwort, und die Seite sagt es ihm. Denny: "am Ende hilft es
         natuerlich der Zuordnung" - ein heimlich geaendertes Datum hilft
         niemandem. */
      const geprueft = blattDatum(gelesen.datum, heute);
      /* Drei Ausgaenge (Denny, 23.09.2026): nah dran -> still nehmen, mehr
         als 14 Tage her -> das Kind fragen, Zukunft -> gar nicht. Das Modell
         hatte sich in einer handgeschriebenen Jahreszahl verlesen (26 -> 25)
         und der Eintrag war aus dem Heft verschwunden. */
      const urteil = geprueft ? datumPruefen(geprueft, heute) : "nein";
      if (urteil === "nehmen") {
        vomBlattGelesen = geprueft;
        weichtAb = geprueft !== e.datum;
      } else if (urteil === "fragen" && geprueft !== e.datum) {
        // NICHT setzen - erst bestaetigen lassen. Der Vorschlag wird am
        // Eintrag vermerkt, damit nur genau dieses Datum bestaetigt werden
        // kann (siehe PATCH weiter unten).
        nachgefragt = { gelesen: geprueft, gewaehlt: e.datum, tage: tageDavor(geprueft, heute) };
        await titelSetzen(env, kind, e.id, titel, "Datum unbestätigt: " + geprueft);
        await vorschlagSetzen(env, kind, e.id, geprueft);
      }
      if ((titel || vomBlattGelesen) && !nachgefragt) {
        await titelSetzen(env, kind, e.id, titel,
                          vomBlattGelesen && !weichtAb ? "Datum vom Blatt bestätigt" : "");
      }
      if (weichtAb) await datumSetzen(env, kind, e.id, vomBlattGelesen, e.datum);

      /* Was auf dem Blatt steht, gehoert an den Eintrag - sonst kann das
         Lernquiz spaeter nur aus dem Titel raten (siehe inhaltSetzen). Das
         laeuft unabhaengig vom Datums-Urteil: Ein Blatt mit unklarem Datum
         hat trotzdem einen Inhalt. */
      karten = gelesen.karten || [];
      kartenWarum = gelesen.kartenWarum || "";
      genauer = gelesen.genauer || 0;
      if ((gelesen.inhalt && gelesen.inhalt.length) || karten.length) {
        await inhaltSetzen(env, kind, e.id, gelesen.inhalt, karten);
      }
    } catch (err) {
      // Der Grund gehoert in den Eintrag, nicht in einen stillen catch.
      try { await titelSetzen(env, kind, e.id, "", String(err && err.message || err).slice(0, 80)); }
      catch (e2) {}
    }
  }

  /* Warnen, nicht sperren (Dennys Entscheidung vom 22.09.2026).
   *
   * Das Blatt liegt zu diesem Zeitpunkt SCHON im Heft - nichts geht
   * verloren, wenn die Pruefung schiefgeht. Findet sich ein Zwilling, sagt
   * die Seite es Paul und bietet an, das neue wieder wegzunehmen. Er
   * entscheidet: Ein zweites Foto vom verbesserten Blatt ist gewollt. */
  let zwilling = null;
  try {
    zwilling = await schonDa(env, kind, {
      abdruck, titel,
      fach: String(d.fach || ""),
      datum: weichtAb ? vomBlattGelesen : e.datum,
      ausser: e.id,
    });
  } catch (err) {}

  return json(200, {
    ok: true, id: e.id,
    ...(zwilling ? { schonDa: zwilling } : {}),
    /* Wurden Seiten abgeschnitten, steht das hier - nie stillschweigend.
       Seit dem 23.09.2026 nimmt ein Eintrag nur noch zwei Seiten (MAX_SEITEN),
       die Werkstatt schickt aber bis zu zwanzig. */
    ...(zuViel > 0 ? { seitenAbgeschnitten: zuViel, seitenMax: MAX_SEITEN } : {}),
    // Das Datum, das jetzt wirklich im Heft steht.
    datum: weichtAb ? vomBlattGelesen : e.datum,
    datumVonBlatt: !!(vomBlatt || vomBlattGelesen),
    ...(titel ? { titel } : {}),
    // Nur wenn es abweicht - die Seite sagt es dem Kind dann ausdrücklich.
    ...(weichtAb ? { datumGeaendert: { von: e.datum, auf: vomBlattGelesen } } : {}),
    /* Mehr als 14 Tage Abstand: Das Kind bestätigt es selbst. */
    ...(nachgefragt ? { datumFrage: nachgefragt } : {}),
    /* Die Fundkarten fuer den Bildschirm direkt danach (Denny, 23.09.2026).
       Sie gehen in DIESER Antwort mit - ein zweiter Aufruf waere eine zweite
       Wartezeit, und genau die soll hier nicht entstehen. */
    karten,
    // Warum keine da sind, steht drin. Kein stiller catch - derselbe Grund
    // wie bei titelWarum: sonst steht man vor einem leeren Feld ohne Hinweis.
    ...(kartenWarum ? { kartenWarum } : {}),
    // Wie viele Baender der zweite Blick genauer gesetzt hat.
    ...(karten.length ? { genauer } : {}),
  });
}

const TITEL_MODELL = "claude-haiku-4-5-20251001";
// Nach so vielen Sekunden wird ohne Titel abgelegt. Lieber kein Titel als
// ein Kind, das vor dem Ladebalken sitzt.
/* 9 s reichten fuer Titel und Datum. Der Inhalt braucht laenger, weil das
 * Modell das ganze Blatt lesen muss - gemessen 23.09.2026: 6-11 s. */
const TITEL_GRENZE = 15000;
/* Der zweite Blick liest nur Zeilenanfaenge - das geht schneller als das
 * ganze Blatt zu verstehen. Reisst er die Grenze, bleibt die Schaetzung
 * aus dem ersten Aufruf; die Karte faellt nie deswegen weg. */
const POSITION_GRENZE = 12000;
const POSITION_MODELL = "claude-sonnet-5";

/* ⚠️ AUS - und zwar nach vier Live-Messungen an Pauls Stadtportraet
 * (23.09.2026), nicht nach Gefuehl:
 *
 *   ohne zweiten Blick    7,3 s   4 Karten   2 von 4 Baendern treffen
 *   + Haiku              13,5 s   3 Karten   1 von 3
 *   + Sonnet             13,3 s   2 Karten   2 von 2
 *   + Sonnet + Rettung   15,9 s   4 Karten   2 von 4  (er lieferte NICHTS)
 *
 * Er verdoppelt die Wartezeit und liefert unzuverlaessig: einmal alles,
 * einmal gar nichts. Eine Stelle in einem Foto zu verorten koennen die
 * Modelle heute nicht gut genug - weder in Prozent noch in Streifen, weder
 * nebenbei noch als eigene Frage.
 *
 * Der Code bleibt stehen, weil die Messung ihn belegt und weil ein
 * spaeteres Modell es koennen kann. Wer ihn wieder einschaltet, misst die
 * vier Zeilen dieser Tabelle nach - sonst ist es ein Rueckschritt mit
 * gutem Gefuehl. */
const ZWEITER_BLICK = false;

/* EIN Blick aufs Bild - Titel und Datum zusammen.
 *
 * Denny am 22.09.2026: "Ich habe jetzt absichtlich ein falsches Datum
 * gewählt. Du müsstest aber das Datum oben rechts oder oben links sehen."
 * Und: "Da schon abgesehen, wird das Datum nicht so relevant sein, aber am
 * Ende hilft es natürlich der Zuordnung."
 *
 * Der Aufruf lief ohnehin schon fuer den Titel - das Datum kostet nichts
 * dazu. Auf einem Schulblatt steht es oben links oder oben rechts, oft
 * abgekuerzt ("22.9.26").
 */
/* ---------------------------------------------------------------------------
 * Fundkarten: der Bildschirm direkt nach dem Hochladen (Denny, 23.09.2026).
 *
 * "Sie koennen verifizieren, was Sie sehen und geschrieben haben, und dann
 * selber beantworten, in dem Sie es selber noch mal gesehen haben."
 *
 * Eine Karte zeigt einen AUSSCHNITT aus Pauls eigenem Foto und fragt danach.
 * Die Antwort ist auf dem Ausschnitt zu sehen - es geht ums Hinschauen, nicht
 * ums Auswendigwissen. Deshalb duerfen die Ablenker nah dran sein: gerade das
 * zwingt zum genauen Lesen der Ziffern.
 *
 * Der Auftrag BITTET das Modell um all das. Eine Bitte im Auftrag ist keine
 * Pruefung - dieselbe Lehre wie bei den Namen, beim Fachfremden, beim Rechnen
 * und beim Beleg-Riegel. Also prueft karteOk() es mechanisch nach.
 * --------------------------------------------------------------------------- */

/* Zum Vergleichen: Gross/klein, Punkte, Leerzeichen und Bindestriche weg.
 * "132.000" und "132000" sind damit dasselbe - genau das soll nie als
 * zwei verschiedene Antworten nebeneinander stehen (Dennys Fund vom
 * 22.09.2026: "132.000 UND 132000" standen beide zur Wahl). */
export function knapp(s) {
  return String(s == null ? "" : s).toLowerCase()
    .replace(/[\s.,''\u2019\u201a\u00b4`\-\u2013\u2014]/g, "")
    .trim();
}

function istZahl(s) {
  return /^[0-9][0-9.,\s]*$/.test(String(s || "").trim());
}

/* Einen Ablenker aus der richtigen Antwort bauen - nur bei Zahlen, und nur
 * als Rettung, wenn das Modell einen unbrauchbaren geliefert hat.
 *
 * Live gemessen am 23.09.2026: Von vier Karten fielen zwei durch, weil das
 * Modell zweimal dieselbe Zahl als Ablenker nannte ("0911" gegen "0911").
 * Uebrig blieben zwei - zu wenig fuer einen Stapel, und damit waere der
 * ganze Bildschirm ausgefallen. Dieselbe Lehre wie beim Fachfremden: Eine
 * Karte, die man reparieren kann, braucht kein Wegwerfen.
 *
 * Gebaut wird ein ZAHLENDREHER, und das ist kein Zufall - genau daran ist
 * Paul am 17.09.2026 haengengeblieben (siehe klasse3-mathe-dreher-jagd).
 * Wer "90765" von "90756" unterscheiden will, muss die Ziffern lesen.
 */
export function dreher(wert, nummer) {
  const s = String(wert || "");
  const ziffern = [];
  for (let i = 0; i < s.length; i++) if (s[i] >= "0" && s[i] <= "9") ziffern.push(i);
  if (ziffern.length < 2) return "";
  /* Von hinten tauschen: Die letzten Stellen sind die, die man ueberliest.
   * nummer waehlt das Paar, damit zwei Ablenker verschieden ausfallen. */
  for (let n = 0; n < ziffern.length - 1; n++) {
    const k = (nummer + n) % (ziffern.length - 1);
    const a = ziffern[ziffern.length - 2 - k], b = ziffern[ziffern.length - 1 - k];
    if (s[a] === s[b]) continue;          // ein Tausch, der nichts aendert
    const z = s.split("");
    const hin = z[a]; z[a] = z[b]; z[b] = hin;
    const neu = z.join("");
    if (neu !== s) return neu;
  }
  return "";
}

/* Versucht, die Ablenker einer Karte brauchbar zu machen. Gibt die Karte
 * zurueck, wenn es gelungen ist - sonst null. */
export function karteRetten(k, inhalt) {
  if (!k || !k.richtig) return null;
  const gut = [];
  const schon = new Set([knapp(k.richtig)]);
  for (const f of (k.falsch || [])) {
    const probe = Object.assign({}, k, { falsch: [f, f === gut[0] ? "" : (gut[0] || f)] });
    const fk = knapp(f);
    if (!fk || schon.has(fk)) continue;
    // Steht er selbst auf dem Blatt, taugt er nicht.
    let aufBlatt = false;
    for (const z of (inhalt || [])) {
      const teil = String(z).split(":").slice(1).join(":").trim() || String(z);
      if (knapp(teil) === fk) { aufBlatt = true; break; }
    }
    if (aufBlatt) continue;
    gut.push(f);
    schon.add(fk);
  }
  // Auffuellen, solange die Antwort eine Zahl ist.
  for (let n = 0; gut.length < 2 && n < 6; n++) {
    const d = dreher(k.richtig, n);
    if (!d || schon.has(knapp(d))) continue;
    gut.push(d);
    schon.add(knapp(d));
  }
  if (gut.length < 2) return null;
  const neu = Object.assign({}, k, { falsch: gut.slice(0, 2) });
  return karteOk(neu, inhalt) ? null : neu;
}

/* Gibt "" zurueck, wenn die Karte in Ordnung ist - sonst den Grund.
 * inhalt ist die Stichwortliste desselben Blattes. */
export function karteOk(k, inhalt) {
  if (!k) return "leer";
  const frage = String(k.frage || "").trim();
  const richtig = String(k.richtig || "").trim();
  const falsch = (k.falsch || []).map((x) => String(x || "").trim()).filter(Boolean);

  if (frage.length < 8) return "keine Frage";
  if (!richtig) return "keine Antwort";
  if (falsch.length !== 2) return "nicht genau zwei Ablenker";

  /* Keine Verneinungsfragen - dieselbe Regel wie im Lernquiz. Ein Kind, das
     eine Zeile liest, soll sie wiederfinden, nicht ausschliessen. */
  if (/\b(nicht|kein|keine|keinen|ausser|außer)\b/i.test(frage)) return "Verneinungsfrage";

  const rk = knapp(richtig);
  if (!rk) return "Antwort leer";
  for (const f of falsch) {
    if (knapp(f) === rk) return "Ablenker ist dieselbe Antwort: " + f;
  }
  if (knapp(falsch[0]) === knapp(falsch[1])) return "beide Ablenker gleich";

  /* Ein Ablenker, der selbst auf dem Blatt steht, macht die Karte unloesbar:
     beide Antworten waeren dann "richtig gelesen", nur an anderer Stelle. */
  for (const f of falsch) {
    const fk = knapp(f);
    if (fk.length < 2) return "Ablenker zu kurz: " + f;
    for (const z of (inhalt || [])) {
      const teil = String(z).split(":").slice(1).join(":").trim() || String(z);
      if (knapp(teil) === fk) return "Ablenker steht selbst auf dem Blatt: " + f;
    }
  }

  /* "Zu einer Zahl gehoeren Zahlen" - Dennys Fund vom 22.09.2026, als neben
     einer Zaehlfrage "dreiblaettriges Kleeblatt" zur Wahl stand. */
  const rz = istZahl(richtig);
  for (const f of falsch) {
    if (istZahl(f) !== rz) return "Ablenker passt nicht zur Art der Antwort: " + f;
  }

  const von = Number(k.von), bis = Number(k.bis);
  if (!isFinite(von) || !isFinite(bis)) return "keine Position";
  if (von < 0 || bis > 100 || von >= bis) return "Position unmoeglich: " + von + "-" + bis;
  if (bis - von < 2) return "Ausschnitt zu schmal";
  /* Mehr als ein Viertel des Blattes ist kein Ausschnitt mehr, sondern das
     halbe Blatt - dann steht die Antwort nicht mehr sichtbar heraus. */
  if (bis - von > 34) return "Ausschnitt zu hoch";
  return "";
}

/* Liest den KARTEN-Block und laesst nur durch, was karteOk() bestehen kann. */
export function kartenLesen(roh, inhalt) {
  const nach = String(roh || "").split(/^\s*KARTEN\s*:/mi)[1] || "";
  const karten = [];
  const verworfen = [];
  for (const z of nach.split("\n")) {
    const zeile = z.trim();
    if (!/^[-\u2022*]\s+/.test(zeile)) continue;
    const f = zeile.replace(/^[-\u2022*]\s+/, "").split("|").map((x) => x.trim());
    if (f.length < 7) { verworfen.push(zeile.slice(0, 40) + " (nur " + f.length + " Felder)"); continue; }
    const k = {
      stichwort: f[0].slice(0, 30),
      von: parseFloat(f[1]),
      bis: parseFloat(f[2]),
      frage: f[3].slice(0, 120),
      richtig: f[4].slice(0, 60),
      falsch: [f[5].slice(0, 60), f[6].slice(0, 60)],
    };
    let fertig = k;
    const grund = karteOk(k, inhalt);
    if (grund) {
      /* Erst retten, dann wegwerfen. Eine Karte weniger heisst bei vier
         Karten, dass der ganze Stapel ausfaellt (er braucht drei). */
      const gerettet = karteRetten(k, inhalt);
      if (!gerettet) { verworfen.push(k.stichwort + ": " + grund); continue; }
      fertig = gerettet;
      verworfen.push(k.stichwort + ": " + grund + " (Ablenker ersetzt)");
    }
    karten.push(fertig);
    if (karten.length >= 8) break;
  }
  return { karten, verworfen };
}

/* Der zweite Blick: wo steht die Zeile wirklich?
 *
 * Gemessen am 23.09.2026 an Pauls Stadtportraet: Der erste Aufruf liefert
 * die Positionen nur nebenbei, und der Fehler ist systematisch - je weiter
 * unten die Zeile steht, desto weiter oben schaetzt das Modell. Von vier
 * Baendern sassen zwei richtig; das Band zur Postleitzahl zeigte die
 * Eingemeindung, 15 Prozentpunkte daneben.
 *
 * Deshalb ein zweiter, eng umrissener Aufruf - und er fragt BEWUSST NICHT
 * nach Prozent:
 *
 *   - Das Blatt wird in 20 gleich hohe Streifen gedacht. Eine Streifennummer
 *     ist eine Auswahl aus zwanzig Moeglichkeiten, ein Prozentwert eine
 *     Schaetzung aus hundert.
 *   - Das Modell listet ALLE Zeilen von oben nach unten auf, nicht nur die
 *     gesuchten. Damit ist die Reihenfolge ein Anker, an dem sich jede
 *     einzelne Angabe messen laesst - und Ausreisser fallen mechanisch auf.
 *   - Es nennt zu jeder Zeile ihren Anfang. Wer den abschreiben muss, hat
 *     hingesehen.
 *
 * Schlaegt der zweite Blick fehl, bleibt die Schaetzung aus dem ersten.
 * Lieber ein ungefaehres Band als gar keine Karte.
 */
const STREIFEN = 20;

/* Gibt {stichwort: [von, bis]} in Prozent zurueck - oder {} wenn nichts
 * Brauchbares kam. Exportiert, damit es pruefbar ist. */
export function streifenLesen(roh, stichworte) {
  const zeilen = [];
  for (const z of String(roh || "").split("\n")) {
    const m = z.trim().match(/^[-\u2022*]?\s*(\d{1,2})\s*\|\s*(.+)$/);
    if (!m) continue;
    const nr = parseInt(m[1], 10);
    if (!(nr >= 1 && nr <= STREIFEN)) continue;
    zeilen.push({ nr, text: m[2].trim().slice(0, 60) });
  }
  if (zeilen.length < 2) return {};

  /* Die Zeilen eines Blattes gehen von oben nach unten. Steigt die Liste
   * nicht, hat das Modell nicht gelesen, sondern geraten - dann ist die
   * ganze Antwort wertlos, nicht nur die eine Zeile. */
  for (let i = 1; i < zeilen.length; i++) {
    if (zeilen[i].nr < zeilen[i - 1].nr) return {};
  }

  const raus = {};
  for (const s of (stichworte || [])) {
    const sk = knapp(s);
    if (!sk) continue;
    /* Der Treffer muss die Zeile sein, die das Stichwort ENTHAELT. Ein
     * Teiltreffer in beide Richtungen, weil "Postleitzahl" und
     * "Postleitzahlen" dieselbe Zeile sind. */
    const tr = zeilen.filter((z) => {
      const zk = knapp(z.text);
      return zk.indexOf(sk) >= 0 || (sk.length >= 5 && sk.indexOf(zk) >= 0);
    });
    if (tr.length !== 1) continue;        // nicht gefunden oder mehrdeutig
    const nr = tr[0].nr;
    // Streifen n von 20 deckt (n-1)*5 bis n*5 Prozent ab; ein Streifen
    // nach oben und unten dazu, weil eine Zeile auf einer Grenze liegen kann.
    raus[s] = [Math.max(0, (nr - 2) * 100 / STREIFEN),
               Math.min(100, (nr + 1) * 100 / STREIFEN)];
  }
  return raus;
}

async function positionenHolen(env, seite, stichworte) {
  if (!stichworte || !stichworte.length) return {};
  const komma = String(seite || "").indexOf(",");
  if (komma < 0) return {};
  const typ = String(seite).slice(5, String(seite).indexOf(";"));
  if (typ.indexOf("image/") !== 0) return {};

  const abbruch = new AbortController();
  const uhr = setTimeout(() => abbruch.abort(), POSITION_GRENZE);
  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: abbruch.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        /* NICHT das Haiku-Modell des ersten Aufrufs. Live gemessen am
           23.09.2026: Mit Haiku traf der zweite Blick 1 von 3 Baendern -
           schlechter als die Schaetzung nebenbei (2 von 4) und doppelt so
           langsam. Eine Stelle im Bild zu verorten ist eine andere Aufgabe
           als ein Blatt zu lesen. */
        model: POSITION_MODELL,
        max_tokens: 700,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: typ, data: String(seite).slice(komma + 1) } },
            { type: "text", text:
              "Teile dieses Blatt gedanklich in " + STREIFEN + " gleich hohe waagrechte " +
              "Streifen. Streifen 1 ist ganz oben am Bildrand, Streifen " + STREIFEN +
              " ganz unten am Bildrand.\n\n" +
              "Geh das Blatt von OBEN nach UNTEN durch und schreib JEDE Textzeile auf, " +
              "die du siehst - auch Ueberschriften und was von Hand dazugeschrieben " +
              "wurde. Eine Zeile je Ausgabezeile, in dieser Form:\n" +
              "<Streifennummer> | <die ersten Woerter der Zeile>\n\n" +
              "Nichts anderes ausgeben, keine Ueberschrift, keine Erklaerung. Die " +
              "Streifennummern muessen von oben nach unten groesser werden.\n\n" +
              "Beispiel:\n4 | Einwohner 132.000\n5 | Oberbuergermeister Dr. Thomas Jung\n" +
              "15 | Postleitzahlen 90762-90768" },
          ],
        }],
      }),
    });
  } catch (e) {
    return {};
  } finally {
    clearTimeout(uhr);
  }
  if (!r.ok) return {};
  const d = await r.json().catch(() => null);
  if (!d) return {};
  const roh = ((d.content || []).filter((c) => c.type === "text")[0] || {}).text || "";
  return streifenLesen(roh, stichworte);
}

/* Die Inhaltszeilen aller Seiten eines Eintrags zu einer Liste.
 *
 * Eigene Funktion, damit sie ohne Modellaufruf pruefbar ist (pruefe-schulstoff.mjs).
 * Reihenfolge bleibt die der Seiten - die beleg_nr des Quiz zaehlt darueber
 * einfach weiter, am Riegel aendert sich nichts.
 *
 * Doppelte fallen weg: Ein Merkkasten, den das Kind auf zwei Seiten
 * fotografiert hat, soll nicht zweimal abgefragt werden. Verglichen wird
 * ohne Gross-/Kleinschreibung und ohne Randleerzeichen - mehr nicht, denn
 * zwei aehnliche Zeilen koennen zwei verschiedene Tatsachen sein.
 */
export function inhalteZusammen(alle) {
  const raus = [];
  const da = new Set();
  for (const seite of Array.isArray(alle) ? alle : []) {
    for (const z of (seite && Array.isArray(seite.inhalt) ? seite.inhalt : [])) {
      const k = String(z == null ? "" : z).trim().toLowerCase();
      if (!k || da.has(k)) continue;
      da.add(k);
      raus.push(z);
      /* Der Deckel gilt fuer den ganzen Eintrag, nicht je Seite - sonst
         waechst der Quiz-Auftrag mit jeder Seite ins Unbezahlbare. */
      if (raus.length >= INHALT_MAX) return raus;
    }
  }
  return raus;
}

async function blattLesen(env, seite) {
  const komma = String(seite || "").indexOf(",");
  if (komma < 0) throw new Error("kein Bild dabei");
  const typ = String(seite).slice(5, String(seite).indexOf(";"));
  if (typ.indexOf("image/") !== 0) return { titel: "", datum: "" };

  const abbruch = new AbortController();
  const uhr = setTimeout(() => abbruch.abort(), TITEL_GRENZE);
  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: abbruch.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: TITEL_MODELL,
        max_tokens: 1600,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: typ, data: String(seite).slice(komma + 1) } },
            { type: "text", text:
              "Das ist ein Blatt aus dem Unterricht eines Grundschulkindes. Antworte NUR mit zwei " +
              "Zeilen, ohne weiteren Text:\n" +
              "TITEL: eine kurze Überschrift, worum es geht - höchstens fünf Wörter, deutsch, " +
              "ohne Anführungszeichen. Erkennst du es nicht sicher: unklar\n" +
              "DATUM: das Datum, das auf dem Blatt steht - meist oben links oder oben rechts, " +
              "oft abgekürzt wie 22.9.26. Schreib es genau so ab, wie es dasteht. " +
              "Steht keines da: keins\n" +
              "INHALT: danach eine Zeile je Tatsache, die auf dem Blatt steht - auch " +
              "das, was das Kind selbst hineingeschrieben hat. Jede Zeile beginnt mit " +
              "\"- \". Hoechstens 14 Zeilen, hoechstens 12 Woerter je Zeile. Schreib " +
              "Zahlen und Namen genau ab. Erfinde NICHTS dazu: Was nicht auf dem Blatt " +
              "steht, steht auch hier nicht.\n" +
              "KARTEN: danach eine Zeile je Fundkarte, ebenfalls mit \"- \" beginnend, " +
              "sieben Felder mit | getrennt:\n" +
              "Stichwort | von | bis | Frage | richtige Antwort | falsch1 | falsch2\n" +
              "* Stichwort: ein bis zwei Woerter, worum es geht (z. B. Einwohner).\n" +
              "* von und bis: wo diese Stelle auf dem Blatt steht, als Prozent der " +
              "BILDHOEHE von oben - 0 ist der obere Rand, 100 der untere. Zwei ganze " +
              "Zahlen, von kleiner als bis. Nimm den Bereich etwas grosszuegig, damit " +
              "die ganze Zeile darin liegt, aber hoechstens ein Viertel des Blattes.\n" +
              "* Frage: eine kurze Frage an das Kind, die genau mit diesem Wert " +
              "beantwortet wird. Keine Verneinung.\n" +
              "* richtige Antwort: genau der Wert, wie er auf dem Blatt steht.\n" +
              "* falsch1 und falsch2: zwei falsche Antworten. Sie muessen zur richtigen " +
              "PASSEN - Zahl zu Zahl, Name zu Name, aehnliche Laenge - und nah dran " +
              "sein: vertauschte Ziffern, ein anderes Jahrzehnt, ein aehnlicher Name. " +
              "Sie duerfen NICHT selbst auf dem Blatt stehen und nie eine andere " +
              "Schreibweise der richtigen Antwort sein.\n" +
              "Hoechstens 8 Karten, nur fuer Stellen mit einem klaren kurzen Wert.\n" +
              "Beispiel:\nTITEL: Stadtporträt von Fürth\nDATUM: 22.9.26\n" +
              "INHALT:\n- Einwohner: 132.000\n- Oberbürgermeister: Dr. Thomas Jung\n" +
              "KARTEN:\n" +
              "- Einwohner | 22 | 27 | Wie viele Menschen wohnen in Fürth? | 132.000 | 312.000 | 123.000\n" +
              "- Oberbürgermeister | 26 | 31 | Wie heißt der Oberbürgermeister? | Dr. Thomas Jung | Dr. Tobias Jung | Dr. Thomas Jungwirth" },
          ],
        }],
      }),
    });
  } finally {
    clearTimeout(uhr);
  }

  if (!r.ok) {
    const roh = await r.text().catch(() => "");
    let art = "";
    try { const j = JSON.parse(roh); art = String((j.error && (j.error.type || j.error.message)) || ""); } catch (e) {}
    throw new Error("HTTP " + r.status + (art ? " " + art.slice(0, 60) : ""));
  }

  const d = await r.json();
  const roh = ((d.content || []).filter((c) => c.type === "text")[0] || {}).text || "";

  const zeile = (name) => {
    const m = roh.match(new RegExp("^\\s*" + name + "\\s*:\\s*(.+)$", "mi"));
    return m ? m[1].trim().replace(/^["'„]|["'"]$/g, "") : "";
  };
  const titel = zeile("TITEL").slice(0, 60);
  const datumRoh = zeile("DATUM").slice(0, 40);

  /* Der Inhalt steht als Liste HINTER "INHALT:" - deshalb nicht ueber zeile(),
   * die nur bis zum Zeilenende liest. Was nicht mit "-" beginnt, faellt weg;
   * so kommt kein Fliesstext ins Feld, wenn das Modell doch etwas dazusagt. */
  /* ⚠️ Und VOR "KARTEN:" abschneiden. Die Kartenzeilen beginnen ebenfalls
   * mit "- " und landeten sonst im Inhalt - gemessen am 23.09.2026 in Pauls
   * Stadtportraet: zwei der vierzehn Zeilen waren Fundkarten. Das faelscht
   * den Beleg-Riegel, gegen den jede Quizfrage geprueft wird, und verdraengt
   * echte Blattzeilen aus dem Deckel. */
  const nachInhalt = (roh.split(/^\s*INHALT\s*:/mi)[1] || "").split(/^\s*KARTEN\s*:/mi)[0];
  const inhalt = nachInhalt.split("\n")
    .map((z) => z.trim())
    .filter((z) => /^[-•*]\s+/.test(z))
    .map((z) => z.replace(/^[-•*]\s+/, "").slice(0, 90))
    .filter((z) => z && !/^(unklar|nichts|keine)$/i.test(z))
    .slice(0, 14);

  const kk = kartenLesen(roh, inhalt);

  /* Die Positionen aus dem ersten Aufruf sind nur eine Schaetzung nebenbei.
     Der zweite Blick schaut gezielt nach - und ueberschreibt nur, was er
     wirklich gefunden hat. */
  let genauer = 0;
  if (ZWEITER_BLICK && kk.karten.length) {
    try {
      const pos = await positionenHolen(env, seite, kk.karten.map((k) => k.stichwort));
      for (const k of kk.karten) {
        const p = pos[k.stichwort];
        if (!p) continue;
        const probe = Object.assign({}, k, { von: p[0], bis: p[1] });
        // Auch der zweite Blick muss durch den Riegel.
        if (karteOk(probe, inhalt)) continue;
        k.von = p[0]; k.bis = p[1]; k.genau = true;
        genauer++;
      }
    } catch (e) {}
  }

  return {
    inhalt,
    genauer,
    karten: kk.karten,
    /* Auch wenn Karten da sind: Was verworfen wurde, gehoert in die Antwort.
       Sonst weiss niemand, ob das Modell nur vier lieferte oder vier durch
       den Riegel gefallen sind - genau davor stand ich am 23.09.2026. */
    kartenWarum: kk.verworfen.length ? kk.verworfen.slice(0, 4).join(" · ")
                                     : (kk.karten.length ? "" : "keine geliefert"),
    // "unklar" ist eine ehrliche Antwort - dann steht lieber nichts da als
    // etwas Erfundenes.
    titel: (!titel || /^unklar$/i.test(titel)) ? "" : titel,
    datum: (!datumRoh || /^(keins|kein|keines|unklar)$/i.test(datumRoh)) ? "" : datumRoh,
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  let p;
  try { p = new URL(request.url).searchParams; } catch (e) { return json(400, { ok: false, fehler: "Kaputte Adresse." }); }

  const kind = String(p.get("kind") || "").toLowerCase();
  if (!kindOk(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });

  // Ein einzelnes Bild: /api/schulstoff?kind=paul&bild=<id>:<nr>
  const bild = p.get("bild");
  if (bild) {
    const [id, nr] = String(bild).split(":");
    const daten = await stoffBild(env, id, nr);
    if (!daten) return json(404, { ok: false, fehler: "Das Bild finde ich nicht." });
    // Als data-URL zurück, damit die Seite es direkt in ein <img> hängen kann.
    return json(200, { ok: true, bild: daten });
  }

  /* Welche Faecher liegen im Heft? Das Lernquiz fragt danach, damit es nur
     anbietet, wozu Paul auch etwas hochgeladen hat (Denny, 23.09.2026). */
  if (p.get("faecher") === "1") {
    const f = await faecherImHeft(env, kind);
    if (!f.ok) return json(503, { ok: false, fehler: f.fehler });

    /* "Was oft schiefging, zuerst" (Denny, 23.09.2026 - "Kann man probieren,
       und ich warte auf sein Feedback").
       Sortiert wird nach Fehlerquote, aber NUR wo genug Runden vorliegen:
       Bei drei Aufgaben ist eine falsche Antwort keine Schwaeche, sondern
       Zufall. Ohne Daten bleibt die Reihenfolge nach Blaetterzahl. */
    let quote = {};
    try { quote = await fehlerJeFach(env, kind); } catch (e) {}
    const anteil = (fach) => {
      const q = quote[fach];
      return (q && q.gesamt >= 8) ? q.falsch / q.gesamt : -1;
    };
    const faecher = f.faecher.slice().sort((x, y) => {
      const a2 = anteil(x.fach), b2 = anteil(y.fach);
      if (a2 !== b2) return b2 - a2;              // mehr Fehler zuerst
      return y.blaetter - x.blaetter || x.fach.localeCompare(y.fach);
    }).map((x) => {
      const q = quote[x.fach];
      return (q && q.gesamt >= 8)
        ? Object.assign({}, x, { falsch: q.falsch, gesamt: q.gesamt })
        : x;
    });
    return json(200, { ok: true, ab: f.ab, faecher, namen: FAECHER });
  }

  /* Die Blaetter EINES Fachs - Paul sucht selbst aus, was abgefragt wird. */
  const nurFach = p.get("fach");
  if (nurFach) {
    const b = await blaetterImFach(env, kind, nurFach);
    return b.ok ? json(200, { ok: true, blaetter: b.blaetter })
                : json(503, { ok: false, fehler: b.fehler });
  }

  const e = await stoffLesen(env, kind, Number(p.get("monate") || 3));
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });
  return json(200, { ok: true, heute: e.heute, faecher: FAECHER, eintraege: e.eintraege });
}

/* Verstecken, wieder zeigen, wegräumen.
 *
 * Denny: "Er kann das aus seiner Ansicht herausnehmen. Die alten
 * Fotografien aber erst nach einem wiederholten Fragen, ob er es wirklich
 * löschen möchte, weil du darauf am Ende gegebenenfalls prüfungsvorbereitende
 * Fragen erarbeiten sollst."
 *
 * Deshalb: "verstecken" ist ein Tipp und umkehrbar. "weg" nimmt den Eintrag
 * aus der Liste - DAS BILD BLEIBT LIEGEN und ist über seine Nummer weiter
 * lesbar. Nichts, was ein Kind fotografiert hat, verschwindet wirklich.
 */
/* Fehlende Titel nachtragen.
 *
 * Denny am 22.09.2026 zu einem Blatt, das vor der Titel-Funktion abgelegt
 * wurde: "Es heisst nur 'HSU ansehen'. Es hat aber keinen Titel gekommen bis
 * jetzt." Ein Eintrag von gestern soll deshalb nicht fuer immer namenlos
 * bleiben.
 *
 *   POST /api/schulstoff?nachtragen=1   {kind}
 *
 * Nur mit ELTERN-Ausweis - es kostet Geld (ein Haiku-Blick je Blatt, Bruch-
 * teile eines Cents) und soll nicht versehentlich von einem Kind ausgeloest
 * werden, das die Seite neu laedt. Hoechstens 12 auf einmal, damit der
 * Aufruf in der Zeit bleibt; wer mehr hat, ruft nochmal.
 */
async function nachtragen(context) {
  const { request, env } = context;
  let d;
  try { d = await request.json(); } catch (e) { d = {}; }
  const kind = String(d.kind || "").toLowerCase();
  if (!kindOk(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });

  if (!geheimFuer(env, "eltern") || !(await ausweisGueltig(request, geheimFuer(env, "eltern"), env))) {
    return json(401, { ok: false, fehler: "Dafür braucht es den Eltern-Code." });
  }
  if (!env.ANTHROPIC_API_KEY) return json(503, { ok: false, fehler: "Auf dem Server fehlt der Schlüssel." });

  const e = await stoffLesen(env, kind, 6);
  if (!e.ok) return json(503, { ok: false, fehler: e.fehler });

  /* Offen ist, wem der Titel fehlt ODER dessen Datum noch nie am Blatt
     geprueft wurde. Sonst bliebe ein Eintrag, der gestern nur den Titel
     bekommen hat, fuer immer falsch einsortiert. */
  /* Offen ist jetzt auch, wem der INHALT fehlt. Blaetter aus der Zeit vor dem
     23.09.2026 tragen nur Titel und Datum - und genau daran ist Pauls
     Lernquiz gescheitert: Ohne Inhalt kann es nur aus dem Titel raten. */
  const offen = e.eintraege
    .filter((x) => !x.titel || x.datumVon !== "blatt" ||
                   !(Array.isArray(x.inhalt) && x.inhalt.length))
    .slice(0, 12);
  const getan = [];
  for (const x of offen) {
    const seite = await stoffBild(env, x.id, 0);
    if (!seite) { getan.push({ id: x.id, warum: "kein Bild" }); continue; }
    try {
      const gelesen = await blattLesen(env, seite);
      /* Auch das DATUM nachtragen.
       *
       * Denny am 22.09.2026 mit einem Bild aus der Grossansicht: Oben stand
       * "Montag, 21. September 2026", auf dem Blatt aber deutlich "22.9.26".
       * Der Nachtrag hat das Datum gelesen und weggeworfen - dabei liefert
       * blattLesen() es gratis mit. Ein Blatt, das sein Datum zeigt, soll
       * auch nachtraeglich richtig einsortiert werden: "am Ende hilft es
       * natuerlich der Zuordnung". */
      const jetzt = heuteBerlin();
      const ausBlatt = blattDatum(gelesen.datum, jetzt);
      // Dieselbe Schranke wie beim Ablegen - sie ist hier sogar wichtiger,
      // weil ein Nachtrag viele Blaetter auf einmal anfasst.
      const datumNeu = (ausBlatt && ausBlatt !== x.datum && nahGenug(ausBlatt, jetzt))
        ? ausBlatt : "";

      if (gelesen.titel) await titelSetzen(env, kind, x.id, gelesen.titel);
      else await titelSetzen(env, kind, x.id, "", "nicht erkannt");
      /* Die Fundkarten wandern auch beim Nachtrag mit - sonst haetten alte
         Blaetter nie welche, und zwei Wege wuerden auseinanderlaufen. */
      if ((gelesen.inhalt && gelesen.inhalt.length) || (gelesen.karten || []).length) {
        await inhaltSetzen(env, kind, x.id, gelesen.inhalt, gelesen.karten);
      }
      if (datumNeu) await datumSetzen(env, kind, x.id, datumNeu, x.datum);

      getan.push({
        id: x.id,
        ...(gelesen.titel ? { titel: gelesen.titel } : { warum: "Titel nicht erkannt" }),
        ...(datumNeu ? { datum: { von: x.datum, auf: datumNeu } } : {}),
      });
    } catch (err) {
      getan.push({ id: x.id, warum: String(err && err.message || err).slice(0, 60) });
    }
  }
  return json(200, {
    ok: true,
    offen: e.eintraege.filter((x) => !x.titel || x.datumVon !== "blatt").length,
    getan,
  });
}

export async function onRequestPatch(context) {
  const { request, env } = context;
  let d;
  try { d = await request.json(); } catch (e) { return json(400, { ok: false, fehler: "Die Anfrage war kein gültiges JSON." }); }

  const kind = String(d.kind || "").toLowerCase();
  if (!kindOk(kind)) return json(400, { ok: false, fehler: "Unbekanntes Kind." });
  if (!(await darfRein(request, env, kind))) return json(401, { ok: false, fehler: "Bitte melde dich an." });

  /* Ein verlesenes Datum von Hand richtigstellen.
   *
   * In der Nacht auf den 23.09.2026 hat das Modell "22.9.26" als "22.9.25"
   * gelesen; der Eintrag lag danach im Vorjahr. Die Schranke verhindert das
   * kuenftig - ein schon verschobener Eintrag braucht trotzdem einen Weg
   * zurueck. NUR mit Eltern-Ausweis: Ein Kind soll seine Blaetter nicht
   * umdatieren koennen. */
  /* Das Kind bestätigt das gelesene Datum.
   *
   * Denny am 23.09.2026: "Bei einer Anomalie von mehr als 14 Tagen kommt von
   * dir eine Rückfrage, und du lässt ihr das Datum noch mal bestätigen."
   *
   * Übernommen wird ausschliesslich der Vorschlag, den der Server selbst am
   * Eintrag vermerkt hat - kein frei gewähltes Datum. Damit kann ein Kind
   * seine Blätter nicht umdatieren, aber den Lesefehler bestätigen oder
   * ablehnen. */
  if (String(d.was || "") === "datum-bestaetigen" || String(d.was || "") === "datum-ablehnen") {
    const bestand = await stoffLesen(env, kind, 14);
    if (!bestand.ok) return json(503, { ok: false, fehler: bestand.fehler });
    const x = bestand.eintraege.filter((y) => y.id === String(d.id || ""))[0];
    if (!x) return json(404, { ok: false, fehler: "Das finde ich nicht mehr." });
    if (!x.datumVorschlag) return json(400, { ok: false, fehler: "Dazu gibt es keine offene Frage." });

    if (String(d.was) === "datum-ablehnen") {
      await vorschlagSetzen(env, kind, x.id, "");
      return json(200, { ok: true, datum: x.datum });
    }
    const r2 = await datumSetzen(env, kind, x.id, x.datumVorschlag, x.datum);
    if (!r2.ok) return json(503, { ok: false, fehler: "Das hat nicht geklappt." });
    await vorschlagSetzen(env, kind, x.id, "");
    return json(200, { ok: true, datum: x.datumVorschlag });
  }

  if (String(d.was || "") === "datum") {
    if (!geheimFuer(env, "eltern") || !(await ausweisGueltig(request, geheimFuer(env, "eltern"), env))) {
      return json(401, { ok: false, fehler: "Dafür braucht es den Eltern-Code." });
    }
    const ziel = String(d.datum || "");
    if (!datumOk(ziel, heuteBerlin())) return json(400, { ok: false, fehler: "Das Datum ist unbrauchbar." });
    const bestand = await stoffLesen(env, kind, 14);
    if (!bestand.ok) return json(503, { ok: false, fehler: bestand.fehler });
    const x = bestand.eintraege.filter((y) => y.id === String(d.id || ""))[0];
    if (!x) return json(404, { ok: false, fehler: "Das finde ich nicht mehr." });
    const r2 = await datumSetzen(env, kind, x.id, ziel, x.datum);
    return r2.ok ? json(200, { ok: true, von: x.datum, auf: ziel })
                 : json(503, { ok: false, fehler: "Das hat nicht geklappt." });
  }

  const e = await stoffAendern(env, kind, String(d.id || ""), String(d.was || ""));
  if (!e.ok) return json(e.fehler === "Das finde ich nicht mehr." ? 404 : 503, { ok: false, fehler: e.fehler });
  return json(200, { ok: true, was: e.was });
}
