/* Belegprüfung für Pauls Quizfragen (27.10.2026, Dennys Entscheidung, Kapitel 147).
 *
 * Denny, 26.10.2026: „Alles, was du hier reinschreibst, steht definitiv auch klar
 * auf seinen Heften, Büchern oder in allem, was wir abfotografiert haben. Du
 * erfindest nichts neu oder recherchierst auch nichts.“
 *
 * Bis hierher prüfte frageBelegt() nur die richtige ANTWORT. Erklärung, Merksatz
 * und Tipp liefen ungeprüft durch - und genau dort stand am 26.10.2026 „Nach ei
 * nur ein s“, obwohl in Pauls Heft „Fleiß“ und „heiß“ stehen, und zu „733 + 4“
 * eine Erklärung mit Minus. Eine Bitte im Auftrag ist keine Prüfung (dieselbe
 * Lehre wie bei den Namen, beim Rechnen und bei den Fragen vom Blatt).
 *
 * Was hier geprüft wird (nur Paul, gerufen aus fragenAusTatsachen und dem
 * Alt-Pfad von nachschubBauen in quiz.js):
 *
 *  1. WORTABDECKUNG. Jedes Sachwort eines Textes muss in einer Schulquelle
 *     stehen: Pauls Blätter desselben Fachs (`inhalt`) und die Vorlagen der
 *     Lehrerin dazu („Aufgabe: Antwort“). Füllwörter zählen nicht, gebeugte
 *     Formen und Abkürzungen ab vier gleichen Anfangsbuchstaben schon
 *     („eigenen“ ~ „eigene“), Zahlwörter gelten als Ziffern („erster“ = „1.“).
 *  2. KURZE SACHWÖRTER ZUSAMMEN. Wörter mit höchstens drei Buchstaben, die kein
 *     Füllwort sind („ei“, „s“, „ß“, „ie“), müssen GEMEINSAM in EINER Quellzeile
 *     stehen. Sonst wäre „Nach ei nur ein s“ durch eine Zeile mit „ei“ und eine
 *     andere mit „s-Laut“ gedeckt. Genau sie tragen Rechtschreibregeln.
 *  3. ZAHLEN. Jede Zahl steht in der Quelle, in der Frage oder in der Lösung -
 *     oder sie entsteht in einer Rechnung des Textes, die stimmt und an eine
 *     bekannte Zahl anschließt.
 *  4. MATHE. Jede Rechnung „a op b = c“ in Erklärung, Merksatz und Tipp wird
 *     nachgerechnet und muss zu GENAU dieser Aufgabe passen: dasselbe
 *     Rechenzeichen wie die Aufgabe. Die Umkehraufgabe gilt nur als Probe, also
 *     nur, wenn sie das Ergebnis der Aufgabe enthält.
 *  5. KEIN „weil“, KEINE Warum-Frage in Erklärung, Merksatz und Tipp.
 *
 * Folge: Ein Text ohne Beleg wird auf seine belegten Teile gekürzt (Sätze, dann
 * Stichpunkte zwischen Kommas). Bleibt von der Erklärung nichts, fällt die Frage
 * weg. Bleibt vom Merksatz oder Tipp nichts, fällt nur dieses Feld weg.
 *
 * Ohne node-Anteil, läuft im Cloudflare-Worker. Prüfung von Hand:
 * node pruefe-belegpruefung.mjs (Projektwurzel). */

/* ---------- Wörter ---------- */

/* Füllwörter: tragen keine Sachaussage. Bewusst ohne „nur“, „immer“, „nie“,
   „groß“, „klein“: Die verändern eine Regel und müssen belegt sein. */
const FUELL = new Set((
  "der die das den dem des ein eine einen einem einer eines kein keine keinen keinem keiner " +
  "und oder aber sondern sowie denn doch auch noch schon so wie als dass daß ob wenn dann da " +
  "in im ins an am auf aus bei beim mit nach von vom vor zu zum zur über ueber unter um für fuer " +
  "gegen ohne durch bis seit hinter neben zwischen " +
  "ist sind war waren sein bin bist wird werden wurde wurden worden hat haben hatte hatten hast " +
  "kann können koennen konnte muss müssen muessen darf soll sollte will gibt gab " +
  "es er sie ihr ihre ihren ihrem ihrer ihn ihm man du dich dir dein deine deinen deinem deiner " +
  "ich mich mir mein meine wir uns unser unsere sich sein seine seinen seinem seiner " +
  "dies diese dieser dieses diesen diesem jede jeder jedes jeden jedem alle allen " +
  "hier dort heute mal einmal sehr ganz genau etwa ungefähr ungefaehr circa ca rund " +
  "was wer wo wie welche welcher welches welchen welchem " +
  "heißt heisst nennt nennen nennt steht stehen stand liegt liegen ja nein also zwar " +
  "richtig richtige richtigen merke merk tipp denk denke schau schaue achte lies " +
  "schreibt schreiben schreibst geschrieben schreib wort wörter woerter " +
  "beispiel zum z b zb usw " +
  /* Verben und Bindewörter ohne eigene Sachaussage (Trockenlauf 27.10.2026). */
  "fängt fangen anfangen beginnt beginnen gehört gehören gehoert kommt kommen macht machen geht gehen " +
  "fürs fuers ans aufs beim darum deshalb daher dabei davon dazu damit darauf dafür etwas viel viele vielen " +
  "andere anderen anderes anderer findest finden findet suchst suche " +
  /* Auflage 2 vom 27.10.2026: Verben und Ortswörter, die in den gekürzten Fragen am
     häufigsten wegfielen, ohne eine Sachaussage zu tragen (Zählung im Befund
     2026-10-27-belegpruefung-auflagen.md). Bewusst NICHT: „kurz“, „fällt“, „nicht“. */
  "bekommen bekam bekommt bekommst bekomme sagt sagen passt überleg überlege ueberleg ueberlege " +
  "beide beiden wieder davor dahinter daran dran darin steckt musst einfach herum heraus hinein " +
  "gesucht gesuchte gesuchten hin hör hoer geh sag gib hol"
).split(/\s+/).filter(Boolean));

/* Rechenwörter: in Mathe Teil der Aufgabe, nicht des Stoffs. */
const RECHENWORT = new Set((
  "rechne rechnen rechnest gerechnet plus minus mal geteilt durch ergibt ergeben ergebnis gleich zuerst danach " +
  "erst zahl zahlen aufgabe aufgaben schritt schritte zusammen nimm nehme dazu weg übrig uebrig bleibt bleiben " +
  "mehr weniger ziehst ziehe abziehen addierst addiere stelle stellen rechts links unten oben"
).split(/\s+/));

const ZAHLWORT = {
  null: "0", eins: "1", zwei: "2", drei: "3", vier: "4", fünf: "5", fuenf: "5", sechs: "6",
  sieben: "7", acht: "8", neun: "9", zehn: "10", elf: "11", zwölf: "12", zwoelf: "12",
  zwanzig: "20", hundert: "100", tausend: "1000",
};
const ORDINAL = [
  [/^erst(e|er|es|en|em)$/, "1"], [/^zweit(e|er|es|en|em)$/, "2"], [/^dritt(e|er|es|en|em)$/, "3"],
  [/^viert(e|er|es|en|em)$/, "4"], [/^fünft(e|er|es|en|em)$/, "5"], [/^fuenft(e|er|es|en|em)$/, "5"],
];

/* Tausenderpunkt und Dezimalkomma bleiben eine Zahl: "132.000" -> "132000", "1,20" -> "1,20". */
function zahlenZusammen(t) {
  return String(t == null ? "" : t)
    .replace(/(\d)\.(?=\d{3}\b)/g, "$1")
    .replace(/(\d),(\d)/g, "$1zqkommaqz$2");
}

/* Der Marker für das Dezimalkomma ist ein Kunstwort: Bis 27.10.2026 hieß er
   „KOMMA“ und machte so auch aus dem echten Wort „Komma“ ein „,“. */
export function woerter(t) {
  return zahlenZusammen(t).toLowerCase()
    .replace(/[^a-zäöüß0-9]+/g, " ").trim().split(/\s+/).filter(Boolean)
    .map((w) => w.replace(/zqkommaqz/g, ","))
    .map((w) => ZAHLWORT[w] || (ORDINAL.find(([re]) => re.test(w)) || [null, w])[1]);
}

const istZahl = (w) => /^\d+(,\d+)?$/.test(w);

function sachwoerter(t, mathe) {
  return woerter(t).filter((w) => !FUELL.has(w) && !(mathe && RECHENWORT.has(w)));
}

/* Steht das Wort im Vorrat? (Auflage 2 vom 27.10.2026: Fehlkürzungen.)
   Gedeckt ist ein Wort, wenn es in der Quelle steht als
   - dasselbe Wort,
   - gebeugte Form mit demselben Stamm ab 4 Buchstaben („wohnst“ ~ „wohnen“,
     „berät“ ~ „beraten“, „Stühle“ ~ „Stuhl“); ein Umlautwechsel im Stamm erst ab
     5 Buchstaben, damit „Burg“ nicht an „Bürger“ hängt,
   - Abkürzung/Verlängerung mit gemeinsamem Anfang ab 4 Buchstaben (wie bisher),
   - Partizip mit ge- („gebaut“ ~ „bauen“, „abgestimmt“ ~ „abstimmen“),
   - Zusammensetzung aus zwei oder drei belegten Teilen, Fugen-s erlaubt
     („Stadtverwaltung“, „Falschparkern“); Teile mit 3 Buchstaben nur genau,
   - Abschreibvariante: ein Buchstabe mehr oder weniger ab 7 Buchstaben, gleicher
     Anfang - nicht in Deutsch, dort ist die Schreibung der Stoff.
   NIE gedeckt: dasselbe Wort in anderer Schreibung (ß/ss, ä/ae, ä/a bei gleicher
   Endung): „Fleiss“ ist nicht „Fleiß“. Zahlen nur genau. */
const ENDUNGEN = ["innen", "eten", "ern", "est", "ete", "ten", "en", "er", "es", "em", "et", "te", "st", "e", "n", "s", "t"];
const falten = (w) => w.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss");
function staemme(w) {
  const aus = new Set([w]);
  for (const e of ENDUNGEN) if (w.length - e.length >= 3 && w.endsWith(e)) aus.add(w.slice(0, -e.length));
  return [...aus];
}
const VORSILBE = /^(zurueck|zurück|durch|fest|nach|ab|an|auf|aus|ein|mit|vor|zu|weg|her|hin|um|los)?ge(.{3,}?)(et|t|en)$/;

/* Nachschlag-Index über einen Wortvorrat: gefaltete Stämme -> Originalwörter. */
function indexVon(liste) {
  const stamm = new Map(), genau = new Set(liste);
  for (const y of liste) {
    if (istZahl(y) || y.length < 3) continue;
    for (const st of staemme(y)) {
      const k = falten(st);
      if (!stamm.has(k)) stamm.set(k, []);
      stamm.get(k).push({ y, st });
    }
  }
  return { stamm, genau, liste };
}

function stammGedeckt(w, idx, min) {
  for (const st of staemme(w)) {
    if (st.length < min) continue;
    for (const { y, st: yst } of idx.stamm.get(falten(st)) || []) {
      if (falten(y) === falten(w) && y !== w) continue;     /* nur andere Schreibung */
      /* Umlautwechsel unter 5 Buchstaben nur, wenn der Umlaut im geprüften Wort
         steht („berät“ ~ „beraten“), nicht in der Quelle („Burg“ !~ „Bürger“). */
      if (yst !== st && st.length < 5 && !/[äöü]/.test(st)) continue;
      return true;
    }
  }
  return false;
}

function teilGedeckt(x, idx) {
  if (x.length < 3) return false;
  if (idx.genau.has(x)) return true;
  return x.length >= 4 && stammGedeckt(x, idx, 4);
}

/* Mathe: Zweierreihe, Sechserreihe ... - das Heft schreibt "60er-Reihe". */
const ZAHL_ER = /^(zwei|drei|vier|fünf|fuenf|sechs|sieben|acht|neun|zehn)er$/;
function zusammenGedeckt(w, idx, tiefe, mathe) {
  for (let i = 3; i <= w.length - 3; i++) {
    const a = w.slice(0, i), b = w.slice(i);
    const aOk = teilGedeckt(a, idx) || (mathe && ZAHL_ER.test(a)) || (/(s|es|n|en)$/.test(a) && [a.replace(/(es|en|s|n)$/, "")].some((x) => teilGedeckt(x, idx)));
    if (!aOk) continue;
    if (teilGedeckt(b, idx)) return true;
    if (tiefe < 2 && b.length >= 6 && zusammenGedeckt(b, idx, tiefe + 1, mathe)) return true;
  }
  return false;
}

function abstandEins(a, b) {
  if (Math.abs(a.length - b.length) !== 1) return false;
  const [k, l] = a.length < b.length ? [a, b] : [b, a];
  let i = 0; while (i < k.length && k[i] === l[i]) i++;
  return k.slice(i) === l.slice(i + 1);
}

function gedeckt(w, idx, fach) {
  if (idx.genau.has(w)) return true;
  if (istZahl(w) || w.length < 4) return false;
  if (stammGedeckt(w, idx, 4)) return true;
  for (const y of idx.liste) {
    if (istZahl(y) || y.length < 4) continue;
    if (y.slice(0, 4) === w.slice(0, 4) && (y.startsWith(w) || w.startsWith(y)) &&
        Math.abs(y.length - w.length) <= 3) return true;
  }
  const p = VORSILBE.exec(w);
  if (p) {
    const kern = (p[1] || "") + p[2];
    for (const { y } of idx.stamm.get(falten(kern)) || []) if (/(en|t|te)$/.test(y)) return true;
    /* Verben auf -eln/-ern: gesammelt <- sammeln, gewandert <- wandern */
    if (/(el|er)$/.test(kern) && idx.genau.has(kern + "n")) return true;
  }
  if (w.length >= 7 && zusammenGedeckt(w, idx, 1, /^mathe/i.test(String(fach || "")))) return true;
  if (w.length >= 7 && !/^deutsch/i.test(String(fach || ""))) {
    for (const y of idx.liste) if (y.length >= 6 && y.slice(0, 2) === w.slice(0, 2) && abstandEins(w, y)) return true;
  }
  return false;
}

/* ---------- Quellen ---------- */

/* Eine Quellzeile, so wie sie als Beleg taugt: ohne Marken, und ohne Pauls
   eigene falsche Fassung ("Kind schrieb X, richtig: Y" belegt nur Y). */
export function quellZeile(z) {
  let s = String(z == null ? "" : z).replace(/^\s*✍\s*/, "");
  s = s.replace(/\[[^\]]*\]/g, " ");
  s = s.replace(/\(?\bKind\s+(?:schrieb|hat\s+geschrieben|trug\s+ein|schreibt)\b:?\s*.*?,\s*richtig(?:\s+ist)?:\s*/i, "");
  return s.replace(/\s+/g, " ").trim();
}

/* Alle Quellzeilen zu einer Frage: zuerst ihr Blatt und jede Vorlage der
   Lehrerin zu diesem Blatt, dann die übrigen Blätter desselben Fachs und ALLE
   Vorlagen dieses Fachs - auch die ohne Blatt-Zuordnung (Auflage 1 vom
   27.10.2026: Nachweis ist alles von der Schule; bis dahin kamen Vorlagen nur
   über vorlageFuer(blattId), die drei Pinnwandblätter ohne Heftblatt fehlten).
   blaetter: alle sichtbaren Einträge des Fachs; vorlageFuer(blattId) liefert die
   (erste) Vorlage eines Blattes; vorlagen: KV lehrervorlagen:paul .vorlagen. */
export function vorlageZeilen(v) {
  return v ? (v.zeilen || []).filter((vz) => vz && !vz.unsicher)
    .map((vz) => String(vz.aufgabe || "") + ": " + String(vz.antwort || "") +
                 ((vz.gleich || []).length ? " (" + vz.gleich.join(", ") + ")" : "")) : [];
}

export function quellenFuer(blattId, fach, blaetter, vorlageFuer, vorlagen) {
  const eigen = [], fachweit = [];
  const fachVon = (x) => String(x || "").toLowerCase();
  const gleichesFach = (x) => fach && fachVon(x) === fachVon(fach);
  const vListe = Array.isArray(vorlagen) ? vorlagen.filter(Boolean) : [];
  const genommen = new Set();
  const vorlageNehmen = (v, ziel) => {
    if (!v) return;
    const k = v.id || JSON.stringify(v.zeilen || []).slice(0, 200);
    if (genommen.has(k)) return;
    genommen.add(k); ziel.push(...vorlageZeilen(v));
  };
  for (const b of blaetter || []) {
    if (!b) continue;
    const zeilen = (Array.isArray(b.inhalt) ? b.inhalt : []).map(quellZeile).filter(Boolean);
    if (b.id === blattId) {
      eigen.push(...zeilen);
      if (vorlageFuer) vorlageNehmen(vorlageFuer(b.id), eigen);
      for (const v of vListe) if ((v.blaetter || []).includes(b.id)) vorlageNehmen(v, eigen);
    } else if (gleichesFach(b.fach)) {
      fachweit.push(...zeilen);
      if (vorlageFuer) vorlageNehmen(vorlageFuer(b.id), fachweit);
    }
  }
  /* Vorlagen des Fachs, die bis hierher nicht über ein Blatt kamen. Eine Vorlage
     ohne Fachangabe zählt, wenn eines ihrer Blätter zu diesem Fach gehört. */
  const fachDerBlaetter = new Map((blaetter || []).filter(Boolean).map((b) => [b.id, fachVon(b.fach)]));
  for (const v of vListe) {
    const vf = v.fach ? fachVon(v.fach) : ((v.blaetter || []).map((id) => fachDerBlaetter.get(id)).find(Boolean) || "");
    if (gleichesFach(vf)) vorlageNehmen(v, fachweit);
  }
  return { eigen, alle: eigen.concat(fachweit) };
}

/* ---------- Rechnungen ---------- */

const OP = { "+": "+", "-": "-", "−": "-", "–": "-", "·": "*", "*": "*", "×": "*", "x": "*", ":": "/", "÷": "/", "/": "/" };
const UMKEHR = { "+": "-", "-": "+", "*": "/", "/": "*" };
const ZAHL = "\\d+(?:[.,]\\d+)?";
const OPZ = "[+\\-−–·*×x:÷/]";

const num = (s) => Number(String(s).replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));

function auswerten(werte, ops) {
  const w = werte.slice(), o = ops.slice();
  for (let i = 0; i < o.length;) {
    if (o[i] === "*" || o[i] === "/") {
      if (o[i] === "/" && w[i + 1] === 0) return null;
      w.splice(i, 2, o[i] === "*" ? w[i] * w[i + 1] : w[i] / w[i + 1]); o.splice(i, 1);
    } else i++;
  }
  let e = w[0];
  for (let i = 0; i < o.length; i++) e = o[i] === "+" ? e + w[i + 1] : e - w[i + 1];
  return e;
}

/* Alle Gleichungen "a op b (op c …) = d" eines Textes. Der Doppelpunkt ist im
   Fließtext auch Satzzeichen ("Rechne: 7 + 3 = 10") - stimmt die Lesart als
   Geteilt nicht, gilt der Teil hinter dem letzten Doppelpunkt. */
export function rechnungen(text) {
  const t = String(text || "");
  const re = new RegExp(`(${ZAHL}(?:[ \\t]*${OPZ}[ \\t]*${ZAHL})+)[ \\t]*=[ \\t]*(${ZAHL})`, "g");
  const aus = [];
  let m;
  while ((m = re.exec(t))) {
    const lesen = (ausdruck) => {
      const teile = ausdruck.split(new RegExp(`[ \\t]*(${OPZ})[ \\t]*(?=\\d)`));
      const werte = [], ops = [];
      for (let i = 0; i < teile.length; i++) {
        if (i % 2 === 0) { if (!new RegExp(`^${ZAHL}$`).test(teile[i].trim())) return null; werte.push(num(teile[i].trim())); }
        else ops.push(OP[teile[i]]);
      }
      return werte.length >= 2 && ops.every(Boolean) ? { werte, ops } : null;
    };
    const ergebnis = num(m[2]);
    let r = lesen(m[1]);
    let ok = r && Math.abs(auswerten(r.werte, r.ops) - ergebnis) < 1e-6;
    if (!ok && m[1].includes(":")) {
      const hinten = m[1].slice(m[1].lastIndexOf(":") + 1);
      const r2 = /\d/.test(hinten) ? lesen(hinten.trim()) : null;
      if (r2 && r2.werte.length >= 2) { r = r2; ok = Math.abs(auswerten(r2.werte, r2.ops) - ergebnis) < 1e-6; }
    }
    if (r) aus.push({ text: m[0].trim(), werte: r.werte, ops: r.ops, ergebnis, stimmt: !!ok });
  }
  return aus;
}

/* Die Aufgabe aus der Frage: die erste Rechnung "a op b", mit oder ohne "= ?". */
export function aufgabeAusFrage(frage) {
  const t = String(frage || "");
  const m = new RegExp(`(${ZAHL})[ \\t]*(${OPZ})[ \\t]*(${ZAHL}|_{2,})`).exec(t);
  if (!m || !OP[m[2]]) return null;
  if (m[2] === ":" && !/\d\s*:\s*\d/.test(m[0])) return null;
  const auf = { op: OP[m[2]], a: num(m[1]), b: /_/.test(m[3]) ? null : num(m[3]), ops: [OP[m[2]]], werte: [] };
  /* Die ganze Kette ab der ersten Zahl ("8 · 90 − 38", "9 · 6 − 3 · 4"):
     alle Rechenzeichen gehören zur Aufgabe, Punkt vor Strich. */
  const kette = new RegExp(`${ZAHL}(?:[ \\t]*${OPZ}[ \\t]*(?:${ZAHL}|_{2,}))+`).exec(t.slice(m.index));
  if (kette) {
    const teile = kette[0].split(new RegExp(`[ \\t]*(${OPZ})[ \\t]*(?=\\d|_)`));
    const ops = [], werte = [];
    for (let i = 0; i < teile.length; i++) {
      if (i % 2) ops.push(OP[teile[i]]); else werte.push(/_/.test(teile[i]) ? null : num(teile[i].trim()));
    }
    if (ops.every(Boolean) && ops.length >= 1) { auf.ops = ops; auf.werte = werte; }
  }
  return auf;
}

/* ---------- Ein Text ---------- */

/* Wortvorrat einer Frage, einmal gebaut und am ctx gemerkt (textGrund läuft je
   Satz und Teil mehrfach). */
function vorratVon(ctx) {
  if (ctx._vorrat && ctx._vorrat.quellen === ctx.quellen) return ctx._vorrat;
  const qWoerter = woerter(ctx.quellen.alle.join("\n"));
  /* Auf den Blättern heißt sie „Lehrkraft“ (104 Zeilen am 27.10.2026). */
  if (qWoerter.includes("lehrkraft")) qWoerter.push("lehrerin");
  /* Frage und richtige Lösung decken lange Wörter mit ab - sie stehen ohnehin
     da, und die Lösung ist schon belegt (frageBelegt). Kurze Sachwörter und
     Regeln müssen aus der QUELLE kommen. */
  const fWoerter = woerter(ctx.frage).concat(woerter(ctx.richtig));
  const v = {
    quellen: ctx.quellen, qWoerter, fWoerter,
    quellGenau: new Set(qWoerter),
    idxMitFrage: indexVon([...new Set(qWoerter.concat(fWoerter))]),
    zeilen: ctx.quellen.alle.map((z) => new Set(woerter(z))),
  };
  Object.defineProperty(ctx, "_vorrat", { value: v, enumerable: false, configurable: true, writable: true });
  return v;
}

/* Warum der Text nicht belegt ist ("" = belegt).
   ctx: { quellen: {eigen, alle}, frage, richtig, mathe, aufgabe, ergebnis } */
export function textGrund(text, ctx) {
  const t = String(text || "").trim();
  if (!t) return "";
  if (/\bweil\b/i.test(t)) return "„weil“";
  if (/\b(warum|wieso|weshalb)\b/i.test(t)) return "Warum-Frage";

  const v = vorratVon(ctx);
  const qWoerter = v.qWoerter, fWoerter = v.fWoerter;

  const sw = sachwoerter(t, ctx.mathe);
  const zahlen = sw.filter(istZahl);
  const worte = sw.filter((w) => !istZahl(w));

  for (const w of worte.filter((x) => x.length >= 4)) {
    if (!gedeckt(w, v.idxMitFrage, ctx.fach)) return "„" + w + "“ steht in keiner Quelle";
  }
  /* Kurze Wörter: mit drei Buchstaben und Selbstlaut („Hof“, „tun“, „Ort“) muss
     das Wort selbst in der Quelle stehen. Was kürzer ist oder keinen Selbstlaut
     hat („ei“, „s“, „ß“, „ck“) trägt Rechtschreibregeln und muss GEMEINSAM in
     einer Quellzeile stehen (Auflage 2 vom 27.10.2026; vorher galt die
     gemeinsame Zeile für alle unter 4 Buchstaben und strich so echte Wörter). */
  /* Die Regel gilt je Satz (27.10.2026, Nachbesserung): „Doppellaute: äu, eu, ei.
     Buchstabengruppen: ch, sch.“ sind zwei Zeilen desselben Blattes, nicht eine. */
  for (const s of saetze(t)) {
    const kurz = sachwoerter(s, ctx.mathe).filter((w) => !istZahl(w) && w.length < 4);
    const regel = kurz.filter((x) => !(x.length === 3 && /[aeiouäöüy]/.test(x)));
    if (regel.length) {
      /* Steht eine Regel-Silbe im Satz, gilt: ALLE kurzen Wörter in einer Zeile
         („Nach ei nur ein s“ braucht ei, nur, s zusammen). */
      if (v.zeilen.some((z) => kurz.every((w) => z.has(w)))) continue;
      /* Oder die Silben stecken in einem Wortpaar, das GENAU SO auf einer Zeile
         gegenübersteht („groß – größer – am größten: das ß bleibt“, „der Apfel –
         die Äpfel: mit Ä“): mindestens zwei lange Wörter des Satzes in einer
         Quellzeile, jede Silbe steckt in einem davon, die übrigen kurzen Wörter
         stehen in der Zeile selbst. Eine Herleitung über zwei Blätter („erklären
         kommt von klar – a wird zu ä“) bleibt draußen. */
      const lang = woerter(s).filter((w) => w.length >= 4);
      const paar = v.zeilen.some((z) => {
        const da = lang.filter((w) => z.has(w));
        if (da.length < 2) return false;
        return kurz.every((w) => z.has(w) || (regel.includes(w) && da.some((x) => x.includes(w))));
      });
      if (!paar) return "„" + kurz.join(" ") + "“ steht so in keiner Quellzeile";
    } else {
      for (const w of kurz) if (!v.quellGenau.has(w)) return "„" + w + "“ steht in keiner Quelle";
    }
  }

  /* Zahlen und Rechnungen. */
  const bekannt = new Set(qWoerter.filter(istZahl).concat(fWoerter.filter(istZahl)));
  /* Stellenwerte einer bekannten Zahl sind errechenbar: 733 -> 7, 3, 700, 30. */
  for (const z of [...bekannt]) {
    if (!/^\d+$/.test(z) || z.length > 7) continue;
    for (let i = 0; i < z.length; i++) {
      if (z[i] === "0") continue;
      bekannt.add(z[i]); bekannt.add(z[i] + "0".repeat(z.length - 1 - i));
    }
  }
  const norm = (x) => String(Math.round(x * 1e6) / 1e6).replace(".", ",");
  const rs = rechnungen(t);
  for (const r of rs) {
    if (!r.stimmt) return "„" + r.text + "“ stimmt nicht";
    if (ctx.mathe && ctx.aufgabe) {
      const aufOps = new Set(ctx.aufgabe.ops || [ctx.aufgabe.op]);
      const umOps = new Set([...aufOps].map((o) => UMKEHR[o]));
      /* Teilen mit Rest: die Probe ist "9 · 7 = 63" und "63 + 6 = 69". */
      if (aufOps.has("/") && /\bR\s*\d/.test(String(ctx.richtig || ""))) umOps.add("+");
      const passt = r.ops.every((o) => aufOps.has(o));
      /* Probe: Umkehrzeichen, und die Rechnung enthält ein Ergebnis oder eine
         Lösungszahl ("6 · 5 = 30" bei 34 : 5 = 6 R4, "619 − 56 = 563"). */
      const loesung = (ctx.loesungen || []).concat(ctx.ergebnis != null ? [ctx.ergebnis] : []);
      const probe = r.ops.every((o) => aufOps.has(o) || umOps.has(o)) && (ctx.umkehr ||
                    r.werte.concat([r.ergebnis]).some((x) => loesung.some((l) => Math.abs(x - l) < 1e-6)));
      /* Zerlegen ("700 + 30 + 7 = 737") ist bei Plus- und Minusaufgaben ein Rechenweg. */
      const zerlegt = (ctx.aufgabe.op === "+" || ctx.aufgabe.op === "-") && r.ops.every((o) => o === "+");
      if (!passt && !probe && !zerlegt) return "„" + r.text + "“ passt nicht zur Aufgabe";
    }
  }
  /* Eine Rechnung, die stimmt und an eine bekannte Zahl anschließt, macht
     ihre Zahlen bekannt (Zwischenergebnisse, Zerlegung) - in mehreren Runden,
     damit auch Ketten gehen. */
  for (let runde = 0; runde < 4; runde++) {
    for (const r of rs) {
      const z = r.werte.concat([r.ergebnis]).map(norm);
      if (z.some((x) => bekannt.has(x))) z.forEach((x) => bekannt.add(x));
    }
  }
  if (ctx.mathe && ctx.aufgabe && rs.length) {
    /* Mathe: Mindestens eine Rechnung muss an die Zahlen dieser Aufgabe anschließen. */
    /* Schriftlich gerechnet wird Stelle für Stelle: Ziffern und Stellenwerte
       der Aufgabe gehören dazu ("5 + 6 = 11" bei 875 + 96). */
    const eigene = [];
    for (const x of [ctx.aufgabe.a, ctx.aufgabe.b, ctx.ergebnis].concat(ctx.aufgabe.werte || [], ctx.loesungen || []).filter((x) => x != null)) {
      const z = norm(x); eigene.push(z);
      if (/^\d+$/.test(z)) for (let i = 0; i < z.length; i++) if (z[i] !== "0") eigene.push(z[i], z[i] + "0".repeat(z.length - 1 - i));
    }
    if (!rs.some((r) => r.werte.concat([r.ergebnis]).map(norm).some((x) => eigene.includes(x))))
      return "Rechnung gehört zu einer anderen Aufgabe";
  }
  for (const z of zahlen) if (!bekannt.has(z)) return "Zahl " + z + " steht in keiner Quelle";
  return "";
}

/* ---------- Kürzen (Auflage 2 vom 27.10.2026) ----------
   Denny: Kürzen darf knapper machen, aber der Kern muss vollständig bleiben -
   „Stadt erster Klasse, eigene Verwaltung und Polizei“, nicht nur „Stadt erster
   Klasse“. Bis dahin wurden belegte Stücke neu zusammengeklebt („1818 wurde Fürth
   Stadt 1. Klasse, Polizei.“) und übrig blieben Rümpfe wie „Deshalb ist das
   Bauamt zuständig.“ oder „Denk an Dinge.“ Jetzt gilt:
   - Ein Satz bleibt ganz, oder er verliert nur sein ENDE: die belegten Teile
     vom Satzanfang bis zum ersten unbelegten Teil, im Originalwortlaut.
     Getrennt wird an Komma, Semikolon, Doppelpunkt und Gedankenstrich, nicht an
     „und“ („Eine Schule zu bauen und zu erhalten ist teuer“ ist EIN Teil).
   - Der Satz fällt ganz, wenn sein erster Teil unbelegt ist, wenn er mit einem
     Nebensatz beginnt, wenn der erste unbelegte Teil ein Nebensatz oder
     Relativsatz ist (er gehört zum Teil davor), oder wenn vom Satz kein Teil mit
     mindestens drei Wörtern bleibt.
   - Ein Satz mit Rückbezug („Deshalb …“, „Dort …“, „Er …“) fällt, wenn der Satz
     davor gefallen oder gekürzt ist.
   - Was übrig bleibt, braucht mindestens zwei Sachwörter und eines, das nicht
     schon in der Antwort steht (Mathe: oder eine richtige Rechnung).
     Sonst ist es ein Rumpf und gilt als leer: Erklärung leer -> Frage verworfen,
     Merksatz/Tipp leer -> Feld fällt weg.
   Der Satztrenner schneidet nicht mehr hinter römischen Zahlen und Abkürzungen
   („Heinrich II.“, „z. B.“, „Nr.“). */
const ABK = /(?:^|[\s(])(?:[IVXLC]{1,4}|z|B|d|h|u|a|o|Nr|bzw|St|ca|usw|vgl|ggf|evtl|Jh|Jhd|Dr|Fr|Hr|Std|Min|Mio|Mrd|Str|etc|Abb|bspw)\.$/;
export function saetze(text) {
  const aus = [];
  for (const s of String(text || "").split(/(?<=[^\d][.!?])\s+/)) {
    if (aus.length && ABK.test(aus[aus.length - 1])) aus[aus.length - 1] += " " + s;
    else aus.push(s);
  }
  return aus.map((x) => x.trim()).filter(Boolean);
}

const NEBENSATZ_ANFANG = /^(?:wenn|weil|da|dass|daß|ob|als|obwohl|damit|nachdem|bevor|während|falls|sobald|solange|indem|sodass|um|wer|was|wo|wie|je)\b/i;
/* Fällt einer dieser Teile weg, fällt der ganze Satz: Relativsätze bestimmen
   das Wort davor („Denk an Dinge, die …“), Bedingungen („…, wenn …“) und
   dass/wie/ob-Sätze sind Teil der Aussage. Ein Begründungs- oder Zwecksatz
   (weil, damit, um … zu, obwohl) darf wegfallen, der Hauptsatz stimmt ohne ihn. */
const ABHAENGIG = /^(?:das|die|der|dem|den|denen|deren|dessen|welche[mnrs]?|wo|wohin|woher|womit|wofür|worauf|worin|wie|dass|daß|wenn|falls|sofern|ob|obwohl|obgleich|bis|bevor|sobald|solange|indem|(?:in|an|auf|mit|bei|von|zu|für|aus|nach|über|unter|vor|durch|gegen|ohne)\s+(?:dem|der|denen|den|die|das|deren|dessen|welche[mnrs]?))\b/i;
const RUECKBEZUG = /^(?:deshalb|darum|daher|deswegen|dabei|dann|dort|dorthin|da|so|also|dies\w*|er|sie|es|ihn|ihm|dazu|dafür|damit|davon|danach|darauf|trotzdem|außerdem|ebenso|genauso)\b/i;
/* „und“/„sowie“ trennen nur, wenn danach ein neuer Satzteil mit eigenem Verb
   anfängt („… 1. Klasse und bekam …“, „… und hatte 13000 Einwohner“): kleines
   Wort ab 3 Buchstaben, kein Artikel, kein „zu“. „Verwaltung und Polizei“ und
   „zu bauen und zu erhalten“ bleiben zusammen. */
const TRENNER = /\s*[,;](?!\d)\s*|(?<![\d\s]):\s+|(?<!\d)\s+[–—-]\s+(?!\d)|\s+(?:und|sowie)\s+(?=(?!(?:zu|der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines|in|im|an|am|auf|mit|von|vom|bei|beim|für|aus|nach|so|auch|noch|nicht|kein|keine|dann|zum|zur)\b)[a-zäöüß]{3,})/g;

function ausgeglichen(s) {
  const n = (re) => (s.match(re) || []).length;
  return n(/„/g) === n(/[“”]/g) && n(/\(/g) === n(/\)/g) && n(/"/g) % 2 === 0;
}

/* Ein unbelegter Satz -> sein belegter Anfang im Originalwortlaut, oder "". */
const VERBERST = /^[A-ZÄÖÜa-zäöüß]+\s+(man|du|ihr|wir|er|sie|es)\b/;
function satzKuerzen(s, ctx) {
  const ende = /[?]\s*$/.test(s) ? "?" : /!\s*$/.test(s) ? "!" : ".";
  const kern = s.replace(/[.!?]+\s*$/, "");
  if (NEBENSATZ_ANFANG.test(kern)) return "";
  const teile = [];
  let last = 0, m;
  TRENNER.lastIndex = 0;
  while ((m = TRENNER.exec(kern))) { teile.push({ text: kern.slice(last, m.index), von: last, bis: m.index, trenner: m[0] }); last = TRENNER.lastIndex; }
  teile.push({ text: kern.slice(last), von: last, bis: kern.length, trenner: "" });
  const grundVon = (tl) => { const x = tl.text.replace(/^(und|oder|aber|sowie|also|denn)\s+/i, "").trim(); return x ? textGrund(x, ctx) : ""; };
  /* Ein kurzes Etikett vor dem Doppelpunkt („Probe:“, „Punkt vor Strich:“) darf
     wegfallen, der Satz beginnt dann dahinter. */
  let start = 0;
  if (teile.length > 1 && /:/.test(teile[0].trenner) && teile[0].text.trim().split(/\s+/).length <= 3 && grundVon(teile[0])) start = 1;
  /* Mathe: ein unbelegter Vorsatz vor dem Doppelpunkt („Nur die Hunderter ändern
     sich: 8 H minus 2 H …“) darf wegfallen, wenn dahinter eine richtige Rechnung
     steht - die Rechnung belegt sich selbst, der Vorsatz fällt ganz weg. */
  else if (ctx.mathe && teile.length > 1 && /:/.test(teile[0].trenner) && textGrund(teile[0].text.trim(), ctx) &&
           !/stimmt nicht|passt nicht|anderen Aufgabe/.test(textGrund(teile[0].text.trim(), ctx)) &&
           rechnungen(kern.slice(teile[1].von)).some((r) => r.stimmt)) start = 1;
  let n = start;
  while (n < teile.length && !grundVon(teile[n])) n++;
  if (n === start || n === teile.length && start === 0) return "";
  if (n < teile.length && ABHAENGIG.test(teile[n].text.replace(/^(und|sowie)\s+/i, "").trim())) return "";
  /* Bedingung mit dem Verb vorn („Hängt man -heit an neu, entsteht …“): fällt
     der Hauptsatz, bleibt sonst eine Bedingung ohne Folge stehen. */
  if (n < teile.length && ende !== "?" && VERBERST.test(teile[start].text.trim())) return "";
  /* Schnitt an „und“ hinter einem Satzteil aus drei Wörtern („Die Stadt baut
     und repariert die Straßen“): Subjekt und Verb ohne ihr Ziel - fällt ganz. */
  if (n < teile.length && /^\s+(und|sowie)\s+$/.test(teile[n - 1].trenner) &&
      teile[n - 1].text.trim().split(/\s+/).length <= 3) return "";
  const genommen = teile.slice(start, n);
  if (!genommen.some((tl) => tl.text.trim().split(/\s+/).length >= 3) &&
      !(ctx.mathe && genommen.some((tl) => rechnungen(tl.text).some((r) => r.stimmt)))) return "";
  const behalten = kern.slice(teile[start].von, teile[n - 1].bis).replace(/[\s,;:–—-]+$/, "").trim();
  if (!behalten || !ausgeglichen(behalten)) return "";
  return behalten + ende;
}

/* Rumpf ohne Aussage? "" = trägt eine Aussage. */
export function rumpf(text, ctx) {
  if (ctx.mathe && rechnungen(text).some((r) => r.stimmt)) return "";
  const sw = sachwoerter(text, ctx.mathe).filter((w) => !istZahl(w));
  if (sw.length < 2) return "weniger als zwei Sachwörter";
  const fa = new Set(woerter(ctx.richtig));
  if (!sw.some((w) => !fa.has(w))) return "sagt nur die Antwort nach";
  return "";
}

/* Auf die belegten Sätze und Satzanfänge kürzen. Liefert "", wenn nichts
   Belegtes mit eigener Aussage bleibt. */
export function kuerzen(text, ctx) {
  const t = String(text || "").trim();
  if (!t) return t;
  const grund = textGrund(t, ctx);
  if (!grund) return t;
  /* Eine falsche oder fremde Rechnung wird nicht zurechtgestutzt: Wer sich
     verrechnet hat, dessen Rest ist auch nicht verlässlich. */
  if (/stimmt nicht|passt nicht zur Aufgabe|anderen Aufgabe/.test(grund)) return "";
  const behalten = [];
  let vorigWeg = false;
  for (const s of saetze(t)) {
    if (!textGrund(s, ctx)) {
      if (vorigWeg && RUECKBEZUG.test(s)) continue;
      behalten.push(s); vorigWeg = false; continue;
    }
    const k = satzKuerzen(s, ctx);
    if (k && !(vorigWeg && RUECKBEZUG.test(k))) behalten.push(k);
    vorigWeg = true;
  }
  const aus = behalten.join(" ").trim();
  if (!aus || textGrund(aus, ctx) || rumpf(aus, ctx)) return "";
  return aus.charAt(0).toUpperCase() + aus.slice(1);
}

/* ---------- Der Fragetext (27.10.2026, Dennys Auflage 1) ----------
   Bis hierher deckte die Frage ihre eigenen Wörter mit ab (fWoerter) - so kamen
   Fachwörter aus dem Lehrplan („Umlaut“) unbemerkt durch. Jetzt muss jedes
   Sachwort der FRAGE ab 4 Buchstaben in einer Schulquelle stehen (Blatt, Heft
   oder Vorlage der Lehrerin) oder in der richtigen Lösung, die ihrerseits
   belegt ist. Die Lehrerin ist maßgeblich. Frei sind nur die Wörter, mit denen
   man überhaupt fragt (FRAGEWORT) - kein Fachwort steht darin. Nur Paul. */
export const FRAGEWORT = new Set(("heißt heissen heißen nennt nennen nennt schreibt schreiben " +
  "schreibst richtig richtige richtigen falsch welche welcher welches welchen welchem " +
  "findest finden passt passen passende passenden gehört gehören fehlt fehlen fehlende " +
  "ergänze ergänzen lücke satz satzes sätze wort wörter wortes frage fragen antwort " +
  "beschreibt beschreiben bedeutet bedeuten meint gemeint steht stehen sagt sagen " +
  "zeigt zeigen macht machen gibt geben kommt kommen bekommt bekommen hast habe " +
  "nimmt nehmen bildet bilden bildest form richtige stimmt stimmen lautet lauten " +
  "dieser diese dieses diesem diesen zwei drei vier fünf sechs sieben acht neun zehn " +
  "erste ersten zweite zweiten dritte dritten nächste nächsten zuerst zuletzt " +
  "beiden beide mehr weniger " +
  "gleich gleiche ungefähr zusammen genau immer heute jetzt früher vorher nachher " +
  "rechne rechnest ergebnis aufgabe zahl zahlen " +
  /* Fragewörter und Allerweltswörter aus der Messung am 27.10.2026 (2.243 Fragen) */
  "womit wohin woher wobei wofür worüber wozu worum wessen wodurch woran worauf wovon " +
  "direkt machst sagst lässt endet folgt gilt erhält passiert sucht kamen taten machte " +
  "nutzen dürfen statt jeweils ganzen ganze höchstens paar dreimal zweimal gleichen teil " +
  "sache sachen pauls bevor hoch langer gerade").split(/\s+/).filter(Boolean));

function abstand(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99;
  let v = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const n = [i];
    for (let j = 1; j <= b.length; j++) n[j] = Math.min(v[j] + 1, n[j - 1] + 1, v[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    v = n;
  }
  return v[b.length];
}

export function frageWoerterGrund(q, ctx) {
  const richtig = String((q.antworten || [])[q.richtig || 0] || "");
  const mathe = /^mathe/i.test(String(q.fach || ""));
  const quellen = ctx.quellen || quellenFuer(ctx.blattId || q.blatt || "", q.fach, ctx.blaetter, ctx.vorlageFuer, ctx.vorlagen);
  if (!quellen.alle.length) return "keine Schulquelle zu diesem Fach";
  const qw = woerter(quellen.alle.join("\n"));
  if (qw.includes("lehrkraft")) qw.push("lehrerin");
  /* Die Überschrift eines Blattes steht auch auf dem Blatt („So schreibe ich ins
     Deutschheft“) - für den Fragetext zählt sie mit, gleiches Fach. */
  const fachVon = (x) => String(x || "").toLowerCase();
  for (const b of ctx.blaetter || []) if (b && fachVon(b.fach) === fachVon(q.fach) && b.titel) qw.push(...woerter(b.titel));
  const idx = indexVon([...new Set(qw.concat(woerter(richtig)))]);
  let ablenkerGrund = "";
  /* Wörter der Lösung und der Frage: ein Ablenker, der nur eine Verschreibung
     oder falsche Form davon ist („guter“ zu „gut“), bringt nichts Fremdes. */
  const rWoerter = woerter(richtig + " " + String(q.frage || "")).filter((w) => w.length >= 3);
  for (const w of sachwoerter(String(q.frage || ""), mathe)) {
    if (istZahl(w) || w.length < 4 || FRAGEWORT.has(w)) continue;
    if (!gedeckt(w, idx, q.fach)) return "„" + w + "“ steht in keiner Schulquelle";
  }
  /* Auch die falschen Antworten (27.10.2026, Gegenprüfung: Ablenker „Laternen
     und Gehweg“ – „Gehweg“ steht auf keinem Blatt). Ein Ablenker darf falsch
     sein, aber keine fremden Sachwörter einführen. Falsch geschriebene Wörter
     („die Äpfeln“) deckt gedeckt() über den Abstand eins. */
  /* Die Frage ist an dieser Stelle schon belegt; ihre Wörter decken die
     Ablenker mit („gut“ -> Ablenker „guter“). */
  const idxA = indexVon([...new Set(qw.concat(woerter(richtig), woerter(String(q.frage || ""))))]);
  (q.antworten || []).forEach((a, i) => {
    if (i === (q.richtig || 0) || ablenkerGrund) return;
    for (const w of sachwoerter(String(a || ""), mathe)) {
      if (istZahl(w) || w.length < 4 || FRAGEWORT.has(w)) continue;
      /* Rechtschreib-Ablenker („erkleren“ zu „erklären“, „Febuar“) sind
         Verschreibungen der Lösung, keine fremden Wörter. */
      if (rWoerter.some((r) => abstand(w, r) <= Math.max(2, Math.floor(r.length / 4)))) continue;
      /* Falsche Wortbildung aus einem Wort der Frage („süßung“, „dunkligkeit“
         bei „Welches Nomen bildet man aus dunkel?“). */
      /* Mit falschem Umlaut („güter“ zu „gut“) zählt es genauso. */
      const ohneUmlaut = (x) => x.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u");
      if (rWoerter.some((r) => r.length >= 3 && ohneUmlaut(w).startsWith(ohneUmlaut(r.slice(0, Math.max(3, r.length - 2)))))) continue;
      if (!gedeckt(w, idxA, q.fach)) { ablenkerGrund = "Ablenker: „" + w + "“ steht in keiner Schulquelle"; return; }
    }
  });
  return ablenkerGrund;
}

/* Der belegte Heftsatz zu einer Frage (27.10.2026, Dennys Auflage 2 zu den
   406 Fragen mit unbelegter Erklärung): eine Zeile aus Pauls Blatt oder einer
   Vorlage der Lehrerin, die die richtige Lösung enthält, selbst als belegt
   durchgeht und eine eigene Aussage trägt (kein Rumpf). Zuerst das eigene
   Blatt, dann das Fach; bei mehreren die mit den meisten Wörtern der Frage.
   Mathe: die Zeile muss auch eine Zahl der Aufgabe enthalten. "" = keiner. */
export function heftsatzFuer(q, c) {
  const richtig = String(c.richtig || "").trim();
  if (richtig.length < 2) return "";
  const norm = (x) => String(x || "").toLowerCase().replace(/\s+/g, " ");
  const r = norm(richtig);
  const fw = new Set(woerter(String(q.frage || "")).filter((w) => w.length >= 4));
  const zahlenFrage = (String(q.frage || "").match(/\d+(?:[.,]\d+)?/g) || []);
  let best = "", bestPunkte = -1;
  for (const [liste, bonus] of [[c.quellen.eigen, 100], [c.quellen.alle, 0]]) {
    for (const z0 of liste || []) {
      const z = String(z0 || "").trim();
      if (z.length < 8 || z.length > 220) continue;
      if (!norm(z).includes(r)) continue;
      if (c.mathe && zahlenFrage.length && !zahlenFrage.some((n) => z.includes(n))) continue;
      if (/\bweil\b/i.test(z) || textGrund(z, c) || rumpf(z, c)) continue;
      const punkte = bonus + woerter(z).filter((w) => fw.has(w)).length;
      if (punkte > bestPunkte) { best = z; bestPunkte = punkte; }
    }
    if (best) break;
  }
  return best ? best.charAt(0).toUpperCase() + best.slice(1) : "";
}

/* ---------- Eine Frage ---------- */

/* Prüft Erklärung, Merksatz und Tipp eines fertigen Quizeintrags q.
   Rückgabe: { q, gekuerzt: [felder], grund } - q === null heißt verwerfen.
   ctx: { blaetter, vorlageFuer, vorlagen, blattId } - vorlagen: alle Vorlagen
   der Lehrerin (KV lehrervorlagen:paul), auch ohne Blatt-Zuordnung. */
export function frageTexteBelegen(q, ctx) {
  const richtig = String((q.antworten || [])[q.richtig || 0] || "");
  const mathe = /^mathe/i.test(String(q.fach || ""));
  const quellen = quellenFuer(ctx.blattId || q.blatt || "", q.fach, ctx.blaetter, ctx.vorlageFuer, ctx.vorlagen);
  if (!quellen.alle.length) return { q: null, gekuerzt: [], grund: "keine Schulquelle zu diesem Fach" };
  const aufgabe = mathe ? aufgabeAusFrage(q.frage) : null;
  let ergebnis = null;
  if (aufgabe && aufgabe.b != null) {
    ergebnis = auswerten([aufgabe.a, aufgabe.b], [aufgabe.op]);
    /* Ganze Kette ohne Lücke: Ergebnis nach Punkt vor Strich. */
    if (aufgabe.werte && aufgabe.werte.length > 2 && aufgabe.werte.every((x) => x != null)) {
      const e = auswerten(aufgabe.werte, aufgabe.ops);
      if (e != null) ergebnis = e;
    }
    /* Steht eine reine Zahl als Lösung da, muss sie das Ergebnis sein - es sei
       denn, die Frage fragt nach etwas anderem (Platzhalter, Probe, Fehler). */
    const rz = /^\s*\d+(?:[.,]\d+)?\s*$/.test(richtig) ? num(richtig) : null;
    const nurRechnen = new RegExp(`^\\s*(?:rechne:?\\s*)?${ZAHL}\\s*${OPZ}\\s*${ZAHL}\\s*=\\s*\\?*\\s*$`, "i").test(String(q.frage || ""));
    if (nurRechnen && rz != null && Math.abs(rz - ergebnis) > 1e-6)
      return { q: null, gekuerzt: [], grund: "Lösung " + richtig + " stimmt nicht: " + ergebnis };
  } else if (aufgabe && aufgabe.b == null && /^\s*\d+(?:[.,]\d+)?\s*$/.test(richtig)) {
    /* Platzhalteraufgabe "895 - ___ = 695": das gesuchte Glied ist die Lösung,
       das Ergebnis steht hinter dem "=". */
    const m = /=\s*(\d+(?:[.,]\d+)?)/.exec(String(q.frage || ""));
    if (m) { ergebnis = num(m[1]); aufgabe.b = num(richtig); }
  }
  /* Fragt die Aufgabe selbst nach der Umkehraufgabe oder Probe, darf die Erklärung umkehren. */
  const umkehr = /umkehr|probe/i.test(String(q.frage || ""));
  /* Zahlen der Lösung ("6 R4" -> 6 und 4) gelten für die Probe als Ergebnis. */
  const loesungen = (String(richtig).match(/\d+(?:[.,]\d+)?/g) || []).map(num);
  /* Das Ergebnis hinter dem "=" der Frage ("4 · 40 + ___ = 175") ebenso. */
  const nachGleich = /=\s*(\d+(?:[.,]\d+)?)/.exec(String(q.frage || ""));
  if (nachGleich) loesungen.push(num(nachGleich[1]));
  const c = { quellen, fach: q.fach, frage: q.frage, richtig, mathe, aufgabe, ergebnis, umkehr, loesungen };
  const neu = { ...q };
  const gekuerzt = [];

  if (q.erklaerung) {
    const k = kuerzen(q.erklaerung, c);
    /* Ein „weil“ in der Erklärung (die Lehrerin erlaubt es nicht) ersetzt sie
       vor der Ausgabe ebenso, statt die ganze Frage auszublenden. */
    const weil = /\bweil\b/i.test(q.erklaerung);
    if ((k !== q.erklaerung || weil) && ctx.ausgabe) {
      /* Vor der Ausgabe an Paul (27.10.2026, Dennys Auflage 2): Statt die
         Frage zu verwerfen, tritt der belegte Heftsatz an die Stelle der
         Erklärung - gibt es keinen, entfällt die Erklärung. Auch eine nur
         gekürzte Erklärung zählt als unbelegt: „„bunt“ ist ein Wiewort.“ ohne
         den Specht wäre der halbe Inhalt (gemessen 27.10.2026, 92 Fälle). */
      const h = heftsatzFuer(q, c);
      if (h) { neu.erklaerung = h; gekuerzt.push("erklaerung-heft"); }
      else { delete neu.erklaerung; gekuerzt.push("erklaerung-weg"); }
    } else if (!k) return { q: null, gekuerzt, grund: "Erklärung: " + textGrund(q.erklaerung, c) };
    else if (k !== q.erklaerung) { neu.erklaerung = k; gekuerzt.push("erklaerung"); }
  }
  for (const feld of ["merke", "tipp"]) {
    if (!q[feld]) continue;
    const k = kuerzen(q[feld], c);
    /* Vor der Ausgabe an Paul kein halber Merksatz oder Tipp: ganz oder gar nicht. */
    if (!k || (ctx.ausgabe && (k !== q[feld] || /\bweil\b/i.test(q[feld])))) { delete neu[feld]; gekuerzt.push(feld); }
    else if (k !== q[feld]) { neu[feld] = k; gekuerzt.push(feld); }
  }
  return { q: neu, gekuerzt, grund: "" };
}
