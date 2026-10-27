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
  "andere anderen anderes anderer findest finden findet suchst suche"
).split(/\s+/).filter(Boolean));

/* Rechenwörter: in Mathe Teil der Aufgabe, nicht des Stoffs. */
const RECHENWORT = new Set((
  "rechne rechnen rechnest gerechnet plus minus mal geteilt durch ergibt ergebnis gleich zuerst danach " +
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
    .replace(/(\d),(\d)/g, "$1KOMMA$2");
}

export function woerter(t) {
  return zahlenZusammen(t).toLowerCase()
    .replace(/[^a-zäöüß0-9]+/g, " ").trim().split(/\s+/).filter(Boolean)
    .map((w) => w.replace(/komma/g, ","))
    .map((w) => ZAHLWORT[w] || (ORDINAL.find(([re]) => re.test(w)) || [null, w])[1]);
}

const istZahl = (w) => /^\d+(,\d+)?$/.test(w);

function sachwoerter(t, mathe) {
  return woerter(t).filter((w) => !FUELL.has(w) && !(mathe && RECHENWORT.has(w)));
}

/* Steht das Wort im Vorrat? Gleich, oder gebeugt/abgekürzt mit gemeinsamem
   Anfang ab vier Buchstaben, oder ein Zusammengesetztes aus zwei belegten
   Teilen ("Stadtverwaltung" aus "Stadt" und "Verwaltung"). Zahlen nur genau. */
function gedeckt(w, vorrat, liste) {
  if (vorrat.has(w)) return true;
  if (istZahl(w) || w.length < 4) return false;
  for (const y of liste) {
    if (istZahl(y) || y.length < 4) continue;
    if (y.slice(0, 4) === w.slice(0, 4) && (y.startsWith(w) || w.startsWith(y)) &&
        Math.abs(y.length - w.length) <= 3) return true;
  }
  for (let i = 4; i <= w.length - 4; i++) {
    const a = w.slice(0, i), b = w.slice(i);
    const teil = (x) => vorrat.has(x) || liste.some((y) => y.length >= 4 && (y === x || (y.startsWith(x) && y.length - x.length <= 2) || (x.startsWith(y) && x.length - y.length <= 2)));
    if (teil(a) && teil(b)) return true;
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

/* Alle Quellzeilen zu einer Frage: zuerst ihr Blatt (und dessen Vorlage),
   dann die übrigen Blätter desselben Fachs mit ihren Vorlagen.
   blaetter: schule.blaetter aus quiz.js; vorlagen: KV lehrervorlagen:paul
   (oder null); vorlageFuer(blattId) liefert die Vorlage eines Blattes. */
export function quellenFuer(blattId, fach, blaetter, vorlageFuer) {
  const eigen = [], fachweit = [];
  const vorlagenZeilen = (b) => {
    const v = vorlageFuer ? vorlageFuer(b.id) : null;
    return v ? (v.zeilen || []).filter((vz) => !vz.unsicher)
      .map((vz) => String(vz.aufgabe || "") + ": " + String(vz.antwort || "") +
                   ((vz.gleich || []).length ? " (" + vz.gleich.join(", ") + ")" : "")) : [];
  };
  const fachVon = (x) => String(x || "").toLowerCase();
  for (const b of blaetter || []) {
    if (!b) continue;
    const zeilen = (Array.isArray(b.inhalt) ? b.inhalt : []).map(quellZeile).filter(Boolean)
      .concat(vorlagenZeilen(b));
    if (b.id === blattId) eigen.push(...zeilen);
    else if (fach && fachVon(b.fach) === fachVon(fach)) fachweit.push(...zeilen);
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

/* Warum der Text nicht belegt ist ("" = belegt).
   ctx: { quellen: {eigen, alle}, frage, richtig, mathe, aufgabe, ergebnis } */
export function textGrund(text, ctx) {
  const t = String(text || "").trim();
  if (!t) return "";
  if (/\bweil\b/i.test(t)) return "„weil“";
  if (/\b(warum|wieso|weshalb)\b/i.test(t)) return "Warum-Frage";

  const quellText = ctx.quellen.alle.join("\n");
  const qWoerter = woerter(quellText);
  /* Auf den Blättern heißt sie „Lehrkraft“ (104 Zeilen am 27.10.2026). */
  if (qWoerter.includes("lehrkraft")) qWoerter.push("lehrerin");
  const vorrat = new Set(qWoerter);
  /* Frage und richtige Lösung decken lange Wörter mit ab - sie stehen ohnehin
     da, und die Lösung ist schon belegt (frageBelegt). Kurze Sachwörter und
     Regeln müssen aus der QUELLE kommen. */
  const fWoerter = woerter(ctx.frage).concat(woerter(ctx.richtig));
  const vorratMitFrage = new Set(qWoerter.concat(fWoerter));
  const listeMitFrage = [...vorratMitFrage];

  const sw = sachwoerter(t, ctx.mathe);
  const zahlen = sw.filter(istZahl);
  const worte = sw.filter((w) => !istZahl(w));

  for (const w of worte.filter((x) => x.length >= 4)) {
    if (!gedeckt(w, vorratMitFrage, listeMitFrage)) return "„" + w + "“ steht in keiner Quelle";
  }
  const kurz = worte.filter((x) => x.length < 4);
  if (kurz.length) {
    const zeilen = ctx.quellen.alle.map((z) => new Set(woerter(z)));
    if (!zeilen.some((z) => kurz.every((w) => z.has(w))))
      return "„" + kurz.join(" ") + "“ steht so in keiner Quellzeile";
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

/* Auf die belegten Teile kürzen: erst Sätze, dann Stichpunkte zwischen
   Kommas/Semikolons. Liefert "" , wenn nichts Belegtes bleibt. */
export function kuerzen(text, ctx) {
  const t = String(text || "").trim();
  if (!t) return t;
  const grund = textGrund(t, ctx);
  if (!grund) return t;
  /* Eine falsche oder fremde Rechnung wird nicht zurechtgestutzt: Wer sich
     verrechnet hat, dessen Rest ist auch nicht verlässlich. */
  if (/stimmt nicht|passt nicht zur Aufgabe|anderen Aufgabe/.test(grund)) return "";
  const saetze = t.split(/(?<=[^\d][.!?])\s+/).filter((s) => s.trim());
  const behalten = [];
  for (const s of saetze) {
    if (!textGrund(s, ctx)) { behalten.push(s.trim()); continue; }
    const teile = s.replace(/[.!?]+\s*$/, "").split(/\s*[,;](?!\d)\s*|(?<![\d\s]):\s+|(?<!\d)\s+[–—-]\s+(?!\d)|\s+(?:und|sowie)\s+/)
      .map((x) => x.replace(/^(und|oder|aber|sowie|also|denn)\s+/i, "").trim()).filter(Boolean);
    const gut = teile.filter((x) => sachwoerter(x, ctx.mathe).length && !textGrund(x, ctx));
    if (gut.length) behalten.push(gut.join(", ") + ".");
  }
  const aus = behalten.join(" ").trim();
  if (!aus || textGrund(aus, ctx)) return "";
  return aus.charAt(0).toUpperCase() + aus.slice(1);
}

/* ---------- Eine Frage ---------- */

/* Prüft Erklärung, Merksatz und Tipp eines fertigen Quizeintrags q.
   Rückgabe: { q, gekuerzt: [felder], grund } - q === null heißt verwerfen.
   ctx: { blaetter, vorlageFuer, blattId } */
export function frageTexteBelegen(q, ctx) {
  const richtig = String((q.antworten || [])[q.richtig || 0] || "");
  const mathe = /^mathe/i.test(String(q.fach || ""));
  const quellen = quellenFuer(ctx.blattId || q.blatt || "", q.fach, ctx.blaetter, ctx.vorlageFuer);
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
  const c = { quellen, frage: q.frage, richtig, mathe, aufgabe, ergebnis, umkehr, loesungen };
  const neu = { ...q };
  const gekuerzt = [];

  if (q.erklaerung) {
    const k = kuerzen(q.erklaerung, c);
    if (!k) return { q: null, gekuerzt, grund: "Erklärung: " + textGrund(q.erklaerung, c) };
    if (k !== q.erklaerung) { neu.erklaerung = k; gekuerzt.push("erklaerung"); }
  }
  for (const feld of ["merke", "tipp"]) {
    if (!q[feld]) continue;
    const k = kuerzen(q[feld], c);
    if (!k) { delete neu[feld]; gekuerzt.push(feld); }
    else if (k !== q[feld]) { neu[feld] = k; gekuerzt.push(feld); }
  }
  return { q: neu, gekuerzt, grund: "" };
}
