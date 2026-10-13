/* Vorlagen der Lehrerin (13.10.2026)
 *
 * Anlass: Pauls Klassenpinnwand (TaskCards der Medienzentrale Nürnberg,
 * Klasse 4bG) trägt in der Spalte "HSU Hefteinträge" die von der Lehrerin
 * AUSGEFÜLLTEN Vorlagen. Beleg: "Ämter im Rathaus (3)" hat bei "Klasse 4
 * besucht den Bürgermeister" das Bürgermeisteramt, Paul hat "Bürgeramt".
 *
 * Dennys Wahl (Klickfrage 13.10.2026, 21:30 Uhr): "A · Quiz prüft gegen die
 * Lehrerin", "C · Lernvideos im Quiz" und wörtlich: "die Einträge in seinem
 * Heft mit dem Hochladen der Lehrerin zu verifizieren und gegebenenfalls auf
 * Fehler direkt hinzuweisen. Natürlich zählt das Hochladen oder der rote
 * Stift der Lehrerin."
 *
 * WO DIE DATEN LIEGEN: im Speicher unter `lehrervorlagen:<kind>` (nur Paul),
 * eingespielt mit werkzeuge/lehrervorlagen-laden.py. NIE als Datei in
 * lernwelt/ - alles dort steht ohne Anmeldung im Netz, und die Bilder und
 * Antworten sind Material der Lehrerin. Ausgeliefert wird nur über die API,
 * hinter dem Ausweis des Kindes oder der Eltern.
 *
 * Form des Speicherwerts:
 *   { stand, vorlagen: [{ id, titel, fach, blaetter: [heftId], zeilen: [
 *       { nr, aufgabe, suche: [..], antwort, gleich?: [..], unsicher?, quiz?, frei?, liste? } ] }],
 *     medien: [{ titel, art: "Video"|"Übung", url, anbieter, fach, muster: [[regex, ..], ..] }] }
 *
 * Prüfen ohne Server: node pruefe-lehrervorlagen.mjs
 */

export const SCHLUESSEL = (kind) => "lehrervorlagen:" + kind;
export const KINDER_MIT_VORLAGE = ["paul"];

/* Gleichwertige Namen: zählen als richtig, werden aber genannt. Bewusst klein,
 * nur Paare aus dem Bestand. Dazu kommen je Zeile die `gleich`-Einträge. */
export const GLEICHWERTIG = [
  ["Fundbüro", "Fundamt"],
  ["Kindergärten", "Kindergarten"],
  ["U-Bahnanschluss", "U-Bahn-Anschluss"],
];

const HAND = /^✍\s*/;

/* klein, Umlaute und ß gefaltet, Bindestriche und Leerraum vereinheitlicht -
 * für das SUCHEN. Verglichen wird zweistufig (siehe zeileVergleichen). */
export function falten(s) {
  return String(s || "").toLowerCase()
    .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss")
    .replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}
const leer = (s) => String(s || "").replace(/\s+/g, " ").trim();

export function levenshtein(a, b) {
  a = String(a); b = String(b);
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let vor = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const neu = [i];
    for (let j = 1; j <= n; j++) {
      neu[j] = Math.min(vor[j] + 1, neu[j - 1] + 1, vor[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    vor = neu;
  }
  return vor[n];
}

/* "Kind schrieb X, richtig: Y" - X ist, was Paul geschrieben hat, Y das
 * Urteil des Lesehelfers (NICHT der Lehrerin, siehe _herkunft.js). */
const KIND_SCHRIEB = /\(?\s*Kind\s+schrieb\s+(.+?),\s*richtig(?: ist)?:\s*([^()]+?)\s*(?:\)|(?=\s*\()|$)/i;

export function kindSchrieb(zeile) {
  const m = KIND_SCHRIEB.exec(String(zeile || ""));
  if (!m) return null;
  return { x: m[1].trim(), y: m[2].trim().replace(/[.]$/, ""), ganz: m[0] };
}

/* Was Paul in dieser Zeile tatsächlich stehen hat: das Urteil fliegt raus,
 * seine eigene Schreibung bleibt. */
export function paulText(zeile) {
  const z = String(zeile || "").replace(HAND, "");
  const k = kindSchrieb(z);
  if (!k) return leer(z);
  return leer(z.replace(k.ganz, " " + k.x + " "));
}

function passtSuche(zeile, suche) {
  const roh = String(zeile || "").replace(HAND, "");
  const f = falten(roh);
  return (suche || []).every((w) => {
    const s = falten(w);
    if (s.startsWith("^")) return f.startsWith(s.slice(1)) || f.startsWith(s.slice(1).trim() + ":");
    return f.includes(s);
  });
}

function gleichwertigeVon(wort, extra) {
  const n = falten(wort);
  const aus = [];
  for (const g of GLEICHWERTIG) if (g.some((x) => falten(x) === n)) aus.push(...g.filter((x) => falten(x) !== n));
  for (const x of extra || []) if (falten(x) !== n) aus.push(x);
  return aus;
}

/* Steht `wort` als ganzes Wort (bzw. Wortfolge) in `text`? */
function enthaeltWort(text, wort, faltenJa) {
  const t = faltenJa ? falten(text) : leer(text);
  const w = faltenJa ? falten(wort) : leer(wort);
  if (!w) return false;
  const esc = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("(^|[^\\p{L}\\p{N}])" + esc + "($|[^\\p{L}\\p{N}])", "u").test(t);
}

/* Kleine Schreibabweichung? Höchstens 3 Zeichen und höchstens ein Viertel. */
function knapp(a, b) {
  const x = falten(a), y = falten(b);
  if (!x || !y) return false;
  const d = levenshtein(x, y);
  return d > 0 && d <= 3 && d / Math.max(x.length, y.length) <= 0.25;
}

/* Die beste Kandidatin für eine Schreibabweichung im Text: ganzer Wert nach
 * dem Doppelpunkt, einzelne Wörter, Wortpaare. */
function knappIrgendwo(text, antwort) {
  const wert = String(text || "").split(":").pop();
  const woerter = wert.split(/[\s,;()]+/).filter(Boolean);
  const kand = [wert.trim()].concat(woerter);
  for (let i = 0; i + 1 < woerter.length; i++) kand.push(woerter[i] + " " + woerter[i + 1]);
  for (const k of kand) if (knapp(k, antwort)) return k.trim();
  return "";
}

/* Welche Heftzeile gehört zu dieser Vorlagenzeile?
 *  1. eine "Kind schrieb"-Zeile, die die Suchwörter trägt
 *  2. eine "Kind schrieb"-Zeile ohne eigenen Zusammenhang ("Kind schrieb
 *     Ämten, richtig: Ämtern"), deren Urteil zur Antwort der Lehrerin passt
 *  3. sonst die erste Zeile mit allen Suchwörtern */
export function zeileFinden(inhalt, vz) {
  const zeilen = (inhalt || []).map((z) => String(z || ""));
  const mitUrteil = zeilen.filter((z) => kindSchrieb(z));
  let z = mitUrteil.find((x) => passtSuche(x, vz.suche));
  if (!z) {
    z = mitUrteil.find((x) => /^\s*(?:✍\s*)?\(?\s*Kind\s+schrieb/i.test(x) &&
      (falten(kindSchrieb(x).y) === falten(vz.antwort) || enthaeltWort(kindSchrieb(x).y, vz.antwort, true)));
  }
  if (!z) z = zeilen.find((x) => passtSuche(x, vz.suche));
  return z || "";
}

/* Vergleicht eine Vorlagenzeile mit Pauls Blatt.
 * status: richtig | gleichwertig | schreibweise | abweichung | offen | unsicher | frei */
export function zeileVergleichen(inhalt, vz) {
  const grund = { nr: vz.nr, aufgabe: vz.aufgabe, lehrerin: vz.antwort };
  if (vz.unsicher) return { ...grund, status: "unsicher" };
  const z = zeileFinden(inhalt, vz);
  if (!z) return { ...grund, status: "offen" };
  const k = kindSchrieb(z);
  const t = paulText(z);
  const out = { ...grund, zeile: t.slice(0, 200) };

  if (vz.frei) return { ...out, status: "frei" };

  if (vz.liste) {
    /* Eine Liste: handschriftliche Nachträge (✍-Zeilen) gehören dazu. Was
       fehlt, wird NICHT gemeldet (der Lesehelfer kürzt Listen) - nur, was
       bei Paul steht und bei der Lehrerin nicht. */
    const soll = vz.antwort.split(",").map((x) => x.trim()).filter(Boolean);
    const wert = t.split(":").pop();
    const hand = (inhalt || []).filter((x) => HAND.test(String(x))).map((x) => String(x).replace(HAND, ""));
    const ist = wert.split(",").concat(hand).map((x) => x.trim()).filter(Boolean);
    const fremd = ist.filter((x) => !soll.some((s) => falten(s) === falten(x) || knapp(s, x)) && !hand.includes(x));
    if (fremd.length) return { ...out, status: "abweichung", paul: fremd.join(", ") };
    const schreib = ist.find((x) => !soll.some((s) => falten(s) === falten(x)) && soll.some((s) => knapp(s, x)));
    if (schreib) return { ...out, status: "schreibweise", paul: schreib, lehrerin: soll.find((s) => knapp(s, schreib)) };
    return { ...out, status: "richtig" };
  }

  const gl = gleichwertigeVon(vz.antwort, vz.gleich);
  /* 1. Steht die Antwort der Lehrerin in Pauls Zeile? */
  if (enthaeltWort(t, vz.antwort, true)) {
    /* Nur bei einer "Kind schrieb"-Zeile wissen wir, wie Paul es GENAU
       geschrieben hat - dann zählt auch Groß/klein. Sonst hat der
       Lesehelfer die Schreibung womöglich selbst geglättet. */
    if (k && !enthaeltWort(t, vz.antwort, false)) return { ...out, status: "schreibweise", paul: k.x };
    return { ...out, status: "richtig" };
  }
  const g = gl.find((x) => enthaeltWort(t, x, true));
  if (g) return { ...out, status: "gleichwertig", paul: g };
  /* 2. Kleine Schreibabweichung? */
  const knp = knappIrgendwo(t, vz.antwort);
  if (knp) return { ...out, status: "schreibweise", paul: knp };
  /* 3. Abweichung: Pauls Wert (nach dem Doppelpunkt bzw. das, was er schrieb). */
  const paul = k ? k.x : (t.includes(":") ? t.split(":").pop().trim() : t);
  return { ...out, status: "abweichung", paul: paul.slice(0, 80) };
}

/* Rote Verbesserungen der Lehrerin auf dem Blatt (nur "Lehrkraft" mit
 * Verbesserung - "✍" allein heißt nur "handgeschrieben", Kapitel 119). */
export function rotVonLehrerin(inhalt) {
  return (inhalt || []).map((z) => String(z || "")).filter((z) => {
    const s = z.replace(HAND, "");
    if (/Lehrkraft\s+schrieb\b[^,]*,\s*richtig/i.test(s)) return false;   // Urteil des Lesehelfers
    if (!/\bLehrkraft\b|\bLehrerin\b/i.test(s)) return false;
    return /verbess|korrig|richtig|durchgestrichen|ergänzt|ergaenzt|statt|Kind schrieb|✗|falsch|noch mal/i.test(s);
  }).map((z) => z.replace(HAND, "").replace(/\bLehrkraft\b/g, "Lehrerin").slice(0, 200));
}

/* Ein ganzes Blatt gegen seine Vorlage. Liefert nur, was zu zeigen ist. */
export function blattVergleichen(blatt, vorlage) {
  const inhalt = Array.isArray(blatt && blatt.inhalt) ? blatt.inhalt : [];
  const rot = rotVonLehrerin(inhalt);
  if (!vorlage) return rot.length ? { rot, zeilen: [], vorlage: null } : null;
  const zeilen = (vorlage.zeilen || []).map((vz) => zeileVergleichen(inhalt, vz));
  const zaehle = (s) => zeilen.filter((x) => x.status === s).length;
  return {
    vorlage: { id: vorlage.id, titel: vorlage.titel },
    geprueft: zeilen.filter((x) => !["offen", "unsicher", "frei"].includes(x.status)).length,
    richtig: zaehle("richtig") + zaehle("gleichwertig"),
    abweichungen: zeilen.filter((x) => x.status === "abweichung"),
    schreibweise: zeilen.filter((x) => x.status === "schreibweise"),
    gleichwertig: zeilen.filter((x) => x.status === "gleichwertig"),
    rot,
  };
}

export function vorlageFuerBlatt(daten, blattId) {
  return ((daten && daten.vorlagen) || []).find((v) => (v.blaetter || []).includes(blattId)) || null;
}

/* Speicher lesen. Fehlt der Wert oder ist er kaputt: null - dann läuft
 * alles wie vorher. Nie ein Schreibvorgang. */
export async function vorlagenLesen(env, kind) {
  if (!KINDER_MIT_VORLAGE.includes(String(kind || "")) || !env || !env.PAUL_KV) return null;
  try {
    const roh = await env.PAUL_KV.get(SCHLUESSEL(kind));
    if (!roh) return null;
    const d = JSON.parse(roh);
    return d && Array.isArray(d.vorlagen) ? d : null;
  } catch (e) { return null; }
}

/* ---------- Quiz ---------- */

/* Welche Vorlagenzeilen meint diese Frage? Alle Suchwörter stehen in der
 * Frage. Steht die Antwort der Lehrerin SELBST in der Frage, fragt sie nach
 * einer anderen Lücke derselben Zeile ("Für wen übernimmt die Gemeinde viele
 * wichtige Aufgaben?" ist nicht die Lücke "Aufgaben"). Anker-Zeilen ("^3 ")
 * und Listen nie. */
export function zeilenZurFrage(f, vorlage) {
  if (!f || !vorlage) return [];
  const text = String(f.frage || "");
  return (vorlage.zeilen || []).filter((vz) => {
    if (vz.quiz === false || vz.unsicher || vz.frei || vz.liste) return false;
    if ((vz.suche || []).some((w) => String(w).startsWith("^"))) return false;
    if (enthaeltWort(text, vz.antwort, true)) return false;
    return passtSuche(text, vz.suche);
  });
}

function antwortPasst(r, vz) {
  const gl = [vz.antwort].concat(gleichwertigeVon(vz.antwort, vz.gleich));
  return gl.some((a) => falten(a) === falten(r) || enthaeltWort(r, a, true) ||
                      (falten(r).length >= 4 && enthaeltWort(a, r, true)) || knapp(a, r));
}

/* Stimmt die richtige Antwort einer Frage mit der Lehrerin überein?
 *   { zeile, passt: true }   -> Beleg "So steht es bei deiner Lehrerin"
 *   { zeile, passt: false }  -> Frage widerspricht der Vorlage: unterdrücken
 *   null                     -> keine passende Vorlagenzeile
 * Passt EINE der gefundenen Zeilen, gilt die Frage als belegt - ein
 * Widerspruch nur, wenn keine passt. */
export function frageGegenVorlage(f, vorlage) {
  const kand = zeilenZurFrage(f, vorlage);
  if (!kand.length) return null;
  const r = String((f.antworten || [])[f.richtig || 0] || "");
  const gut = kand.find((vz) => antwortPasst(r, vz));
  return gut ? { zeile: gut, passt: true } : { zeile: kand[0], passt: false };
}

export function belegAusVorlage(vorlage, vz) {
  return {
    titel: String(vorlage.titel || "").slice(0, 80),
    zeile: (leer(vz.aufgabe) + ": " + leer(vz.antwort)).slice(0, 200),
    herkunft: "vorlage",
  };
}

/* ---------- Lernvideos und Übungen der Lehrerin ---------- */

/* `muster` ist eine Liste von Alternativen, jede eine Liste von Regeln, die
 * ALLE passen müssen. Text = Frage + Belegzeile + Blatttitel + Thema. */
export function medienFuer(f, blatt, medien, hoechstens) {
  const fach = String((f && f.fach) || (blatt && blatt.fach) || "");
  const text = [f && f.frage, f && f.zeile, f && f.beleg && f.beleg.zeile, blatt && blatt.titel, blatt && blatt.thema]
    .filter(Boolean).join(" \n ");
  const aus = [];
  for (const m of medien || []) {
    if (m.fach && m.fach !== fach) continue;
    const ok = (m.muster || []).some((alt) => (alt || []).every((r) => {
      try { return new RegExp(r, "iu").test(text); } catch (e) { return false; }
    }));
    if (ok && /^https:\/\//.test(String(m.url || ""))) aus.push({ titel: m.titel, art: m.art, url: m.url, anbieter: m.anbieter || "" });
  }
  /* Videos zuerst, dann Übungen; höchstens zwei Knöpfe. */
  aus.sort((a, b) => (a.art === "Video" ? 0 : 1) - (b.art === "Video" ? 0 : 1));
  return aus.slice(0, hoechstens || 2);
}
