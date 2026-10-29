/* Nachrechnen: jede Rechnung eines Matheblattes einzeln (14.10.2026)
 *
 * Anlass, Denny am 14.10.2026, 17:43 Uhr, mit Foto von Pauls Blatt „Durch
 * Zehnerzahlen dividieren“, Aufgabe 3c (Tabelle „:“, Spalten 60 und 6):
 * „Hier stimmt doch beides nicht … aber du markierst nur eins.“ Beim Einlesen
 * war die Tabelle zu EINER Zeile zusammengefasst worden. Dennys Wahl: „Alle
 * Blätter nachrechnen“. Dazu die Regel vom selben Abend: „Ungenauigkeit,
 * halbfertiges Lesen darf nicht passieren. Es muss vollständig gelesen werden,
 * geprüft werden und verifiziert werden.“
 *
 * Drei Schritte, nur der erste und der dritte fragen das Modell:
 *   1. ABSCHREIBEN (abschreibAuftrag/abschriftLesen): Das Modell meldet zuerst
 *      je Aufgabe, wie viele Felder es sieht (SOLL, Tabellen als Zeilen x
 *      Spalten), und schreibt dann JEDES Feld als eigene Zeile ab - was das
 *      Kind geschrieben hat in [ ], und was nach dem Rotstift dasteht.
 *      Der Code zählt nach (sollIst): fehlt etwas, heißt das Blatt
 *      „unvollständig nachgerechnet“ - laut, im Elternbereich und im Werkzeug.
 *   2. NACHRECHNEN (auswerten): deterministisch hier im Code, nie im Modell.
 *   3. GEGENLESEN (gegenAuftrag/gegenLesen): Jedes Feld, das ein Fehler wäre,
 *      wird ein zweites Mal gelesen - anders gefragt: nur dieses eine Feld, mit
 *      leerer Klammer statt der ersten Lesung („Welche Zahl steht hier?“).
 *      Nur wenn beide Lesungen dieselbe Zahl ergeben, wird es ein Fehler.
 *      Sonst „ungeprüft“ - Paul sieht es nicht, die Eltern schon.
 *
 * Ein unlesbares Feld ([4?]) oder ein leeres ([]) ist NIE ein Fehler.
 * Fehlalarme sind schlimmer als ein übersehener Fehler (Kapitel 015).
 *
 * Gespeichert wird am Blatt selbst (`nachgerechnet`), im Schreibvorgang des
 * Durchlesens oder - wenn der nicht reicht - in genau einem eigenen:
 *   { v:1, am, z: [Zeilen der Abschrift], g: { <feld>: "<Lesung 2>" },
 *     u: [ein, aus], f?: "<Fehlergrund>" }
 * Die Auswertung entsteht beim Lesen neu - so wirkt eine bessere Regel auch
 * auf alte Blätter, ohne neuen Modellaufruf.
 */

import { belegGilt } from "./_belege.js";
export const MODELL = "claude-opus-5-5";
export const VERSION = 1;

const OP = { "·": "*", "x": "*", "×": "*", "*": "*", ":": "/", "÷": "/", "+": "+", "-": "-", "−": "-", "–": "-" };
export const OP_ZEIGEN = { "*": "·", "/": ":", "+": "+", "-": "−" };

/* ---------- Der Auftrag ans Modell ---------- */

/* opt.kind (28.10.2026, nur Paul, Dennys Wahl 4): Zahlenreihen bekommen eine DRUCK-Zeile mit den
   gedruckten Gliedern. Leon und Helena bekommen den Auftrag Wort für Wort wie vorher. */
export function abschreibAuftrag(masse, opt) {
  const m = Array.isArray(masse) ? masse : [masse];
  const druck = !!(opt && opt.kind === "paul");
  return (m.length > 1 ? "Das sind " + m.length + " Fotos (Seiten) von einem Mathe-Blatt" : "Das ist ein Foto von einem Mathe-Blatt") +
    " eines Kindes der 4. Klasse. Schreibe JEDES Feld ab, in das das Kind eine Zahl eintragen sollte – Feld für Feld, " +
    "nichts zusammenfassen, nichts auslassen.\n\n" +
    "ZUERST zählen: Für jede Aufgabe mit Rechenfeldern eine Zeile\n" +
    "SOLL | <Nr> | <Anzahl Felder>\n" +
    "Bei einer Tabelle schreibst du Zeilen x Spalten der Eintragsfelder, z. B. SOLL | 3c | 2x2. " +
    "Mehrere Tabellen oder Teile einer Aufgabe bekommen je eine eigene Nr (3a, 3b …).\n\n" +
    "DANN je Feld genau eine Zeile:\n" +
    "<Nr> | <Rechnung> | rot [<Zahl>]\n" +
    "Regeln:\n" +
    "- Rechnung mit + − · : und =. Gedruckte Zahlen ohne Klammern. Was das Kind mit der Hand geschrieben hat, in eckigen " +
    "Klammern: 180 : 60 = [3] oder [490] : 10 = 49. Mit Rest: 47 : 5 = [9] R [2].\n" +
    "- Tabelle: Zeilenkopf, das Rechenzeichen aus der Ecke, Spaltenkopf = Feld. Tabelle mit „:“ in der Ecke, Zeile 180, " +
    "Spalte 60: 180 : 60 = [Feld]. Jedes Feld eine eigene Zeile. Prüfe bei jedem Feld genau, in welcher Zeile und Spalte es steht.\n" +
    (druck ? "- Tabelle mit Rechenzeichen im SPALTENKOPF (z. B. Köpfe „· 7 | · 10 | · 70“): Eine Spalte wie „· 10“ wird auf " +
      "das Feld LINKS daneben gerechnet, nicht auf den Zeilenkopf. Zeile 3, Feld links [21], Spalte „· 10“: 21 · 10 = [210] – " +
      "nicht 3 · 10 = [210]. Nur die erste Spalte rechnet mit dem Zeilenkopf (3 · 7 = [21]). Steht über der Spalte die " +
      "Gesamtrechnung (z. B. „· 70“), rechnest du sie mit dem Zeilenkopf: 3 · 70 = [210].\n" : "") +
    "- Rechenketten, Zahlenmauern, Umkehraufgaben: jeden Schritt als eigene Rechnung.\n" +
    (druck ? "- Zahlenreihen („Zähle weiter“, „Setze die Reihe fort“, Zahlenstrahl): ZUERST eine eigene Zeile mit den GEDRUCKTEN " +
      "Zahlen der Reihe, genau so, wie sie vorgedruckt dastehen, in ihrer Reihenfolge: <Nr> | DRUCK | 450, 460. Nur Gedrucktes, " +
      "nichts vom Kind, nichts ausgerechnet. Die DRUCK-Zeile zählt NICHT im SOLL. Der Abstand der Reihe ist meist nicht gedruckt: " +
      "Du leitest ihn aus den gedruckten Zahlen ab, er steht deshalb nur in den Rechnungen. Danach jedes Glied als eigene " +
      "Rechnung, z. B. 460 + 10 = [470], [470] + 10 = [480] – die Zahlen des Kindes genau so, wie sie dastehen, auch wenn " +
      "das Kind mit einem anderen Abstand gezählt hat.\n" : "") +
    "- Halbschriftliche Zwischenschritte als eigene Zeilen mit ~ hinter der Nr (4a~). Sie zählen NICHT im SOLL.\n" +
    "- Schriftliche Rechnungen: nur Aufgabe und Ergebnis, ohne Überträge.\n" +
    "- Schreib die Ziffern des Kindes GENAU so ab, wie sie dastehen, auch wenn sie falsch sind. Rechne NICHT selbst nach " +
    "und verbessere NICHTS.\n" +
    "- Hat die Lehrerin mit ROT etwas verändert (Ziffer durchgestrichen, Ziffer ergänzt, Zahl neu geschrieben): In die " +
    "Klammer kommt, was das Kind ursprünglich geschrieben hat, und am Ende „| rot [Zahl]“ = was nach der roten Änderung " +
    "in diesem Feld steht. Ein roter Haken ist keine Änderung – dann ohne rot.\n" +
    "- Kannst du eine Ziffer nicht sicher lesen: Fragezeichen dahinter, [4?]. Leeres Feld: [].\n" +
    "- Nur ganze Zahlen. Einheiten (€, kg, m, cm) weglassen. Aufgaben mit Komma, Überschlag (≈), Vergleiche (<, >) und " +
    "Textantworten lässt du ganz weg (auch kein SOLL).\n" +
    "- Teiler: „<Nr> | Alle Teiler von 36 = [1, 2, …]“ nur wenn ALLE Teiler gesucht sind, sonst „Teiler von 36 = […]“. " +
    "Vielfache: „Vielfache von 7 = [7, 14, …]“. Eine solche Liste ist ein Feld.\n" +
    "- Vorgedruckte Beispiele ohne Eintrag des Kindes weglassen.\n\n" +
    "Antworte NUR mit den Zeilen (erst alle SOLL, dann die Felder), ohne weiteren Text. Gibt es kein Feld: keine";
}

/* Zweiter, anders gebauter Zugriff: nur die verdächtigen Felder, die eigene
   Zahl ist durch [ ] ersetzt - die erste Lesung erfährt das Modell nicht. */
export function gegenAuftrag(fragen, seitenZahl) {
  return (seitenZahl > 1 ? "Das sind Fotos von einem Mathe-Blatt eines Kindes. " : "Das ist ein Foto von einem Mathe-Blatt eines Kindes. ") +
    "Schau dir nur die folgenden Felder an. Lies jeweils GENAU ab, welche Zahl das Kind (blau oder Bleistift) in das Feld " +
    "[ ] geschrieben hat – Ziffer für Ziffer, auch wenn sie falsch ist. Rechne nicht selbst. Hat die Lehrerin dort mit Rot " +
    "etwas geändert (Ziffer gestrichen, ergänzt, neu geschrieben), nenne zusätzlich, was nach der roten Änderung dasteht.\n\n" +
    fragen.map((f, i) => "Feld " + (i + 1) + ": " + f.text).join("\n") +
    "\n\nAntworte NUR mit einer Zeile je Feld, genau so:\n" +
    "Feld 1 | [<Zahl des Kindes>] | rot [<Zahl nach Rot>]\n" +
    "Ohne rote Änderung lässt du „| rot …“ weg. Bei Rest: [9] R [2]. Bei einer Liste: [1, 2, 3]. " +
    "Kannst du es nicht sicher lesen: Feld 1 | ?";
}

/* ---------- Lesen der Abschrift ---------- */

function klammerLesen(s) {
  /* "[40]" -> {wert:40}, "[4?]" -> {unsicher}, "[]" -> {leer}, "40" -> gedruckt */
  const t = String(s || "").trim();
  const k = /^\[\s*([^\]]*?)\s*\]$/.exec(t);
  if (!k) return /^\d{1,7}$/.test(t) ? { wert: +t, kind: false } : null;
  const inn = k[1];
  if (!inn) return { kind: true, leer: true };
  if (/\?/.test(inn)) return { kind: true, unsicher: true };
  if (!/^\d{1,7}$/.test(inn)) return { kind: true, unsicher: true };
  return { wert: +inn, kind: true };
}
function listeLesenK(s) {
  const k = /^\[\s*([^\]]*?)\s*\]$/.exec(String(s || "").trim());
  if (!k) return null;
  if (!k[1]) return { leer: true };
  if (/\?/.test(k[1])) return { unsicher: true };
  const z = k[1].split(/\s*[,;]\s*/).filter(Boolean);
  if (!z.length || z.some((x) => !/^\d{1,5}$/.test(x))) return { unsicher: true };
  return { liste: z.map(Number) };
}
/* Ein Operand: Zahl, [Kindzahl], oder gemischt aus Ziffern, [Kindziffer] und
   leeren Kästchen (□ ■) - Ziffernrätsel wie 4[5]3 oder 2□[]. */
function operandLesen(t) {
  t = String(t || "").trim();
  if (/^\d{1,7}$/.test(t) || /^\[[^\]]*\]$/.test(t)) return klammerLesen(t);
  if (!/^(?:\d|\[[^\]]*\]|[□■_])+$/.test(t)) return null;
  const teile = t.match(/\d|\[[^\]]*\]|[□■_]/g) || [];
  let ziffern = "", kind = false, leer = false, unsicher = false;
  for (const x of teile) {
    if (/^[□■_]$/.test(x)) { leer = true; continue; }
    if (x[0] === "[") {
      kind = true;
      const inn = x.slice(1, -1).trim();
      if (!inn) leer = true; else if (!/^\d+$/.test(inn)) unsicher = true; else ziffern += inn;
    } else ziffern += x;
  }
  if (leer) return { kind: true, leer: true, ziffer: true };
  if (unsicher) return { kind: true, unsicher: true, ziffer: true };
  return { wert: +ziffern, kind, ziffer: true };
}
const OPS_RE = /\s*([·x×*:÷+\-−–])\s*/;
/* "20 + 4 · 6" -> { terme: [operand…], ops: ["+","*"] } oder null. */
function ausdruckLesen(t) {
  const roh = String(t || "").trim();
  if (!roh || /[A-Za-zÄÖÜäöüß]/.test(roh.replace(/(?<=\d|\])\s*x\s*(?=\d|\[)/g, "·"))) return null;
  const teile = roh.replace(/(?<=\d|\])\s*x\s*(?=\d|\[)/g, " · ").split(OPS_RE).map((x) => x.trim());
  if (teile.length % 2 !== 1) return null;
  const terme = [], ops = [];
  for (let i = 0; i < teile.length; i++) {
    if (i % 2) { const o = OP[teile[i]]; if (!o) return null; ops.push(o); }
    else { const o = operandLesen(teile[i]); if (!o) return null; terme.push(o); }
  }
  return { terme, ops };
}

/* Eine Zeile der Abschrift -> Feld oder null (null nur für Zeilen ohne "Nr | …").
   Was sich nicht rechnen lässt (Tausenderbuch, „Die Zahl ist [50]“), wird ein
   Feld der Art "text": abgeschrieben, zählt im Soll gegen Ist, wird aber nicht
   nachgerechnet. */
export function feldLesen(zeile) {
  const teile = String(zeile || "").split("|").map((x) => x.trim());
  if (teile.length < 2 || !teile[1]) return null;
  const nrRoh = teile[0].replace(/^Aufgabe\s*/i, "").replace(/\s+/g, "");
  if (/^SOLL$/i.test(nrRoh) || !nrRoh || nrRoh.length > 12) return null;
  /* DRUCK-Zeile (28.10.2026, nur Pauls Auftrag): gedruckte Glieder einer Reihe - kein Feld,
     zählt nicht im SOLL, bleibt aber in den Zeilen (kettenFinden liest sie). */
  if (/^DRUCK$/i.test(teile[1])) return null;
  const zwischen = /~$/.test(nrRoh);
  const nr = nrRoh.replace(/~$/, "") || "-";
  const rech = teile[1].replace(/\s+/g, " ").trim();
  const rotRoh = (teile.slice(2).join("|").match(/rot\s*(.*)$/i) || [])[1] || "";
  const f = { nr, zwischen, roh: String(zeile).trim().slice(0, 160) };
  const l = /^(Alle\s+)?(Teiler|Vielfache)\s+von\s+(\d{1,4})\s*=\s*(\[[^\]]*\])$/i.exec(rech);
  if (l) {
    f.typ = /^t/i.test(l[2]) ? (l[1] ? "teiler" : "teilerTeil") : "vielfache";
    f.n = +l[3];
    f.paul = listeLesenK(l[4]);
    if (rotRoh) f.rot = listeLesenK((rotRoh.match(/\[[^\]]*\]/) || [""])[0]);
    return f.paul ? f : { ...f, typ: "text" };
  }
  const rk = rotRoh ? (rotRoh.match(/\[[^\]]*\]/g) || []).map(klammerLesen) : null;
  const seiten = rech.split("=");
  if (seiten.length !== 2) return { ...f, typ: "text" };
  let links = seiten[0].trim(), rechts = seiten[1].trim();
  /* Rest: "47 : 5 = [9] R [2]" */
  const rr = /^(\S+)\s*R\s*(\S+)$/.exec(rechts);
  if (rr) {
    const A = ausdruckLesen(links), q = operandLesen(rr[1]), r = operandLesen(rr[2]);
    if (!A || !q || !r || A.terme.length !== 2 || A.ops[0] !== "/" || A.terme.some((x) => x.ziffer) || q.ziffer || r.ziffer) return { ...f, typ: "text" };
    f.typ = "rest"; f.op = "/";
    f.teil = { a: A.terme[0], b: A.terme[1], c: q, r };
    if (rk) f.rot = rk;
    return f;
  }
  let A = ausdruckLesen(links), E = operandLesen(rechts);
  /* Umgedreht: "240 = 60 · [4]" */
  if ((!A || !E) || (A.terme.length === 1 && E && !A.ops.length)) {
    const A2 = ausdruckLesen(rechts), E2 = operandLesen(links);
    if (A2 && E2 && A2.terme.length >= 2) { A = A2; E = E2; f.umgedreht = true; }
  }
  if (!A || !E || A.terme.length < 2) return { ...f, typ: "text" };
  if (A.terme.length === 2 && !A.terme.some((x) => x.ziffer) && !E.ziffer) {
    f.typ = "gleichung"; f.op = A.ops[0];
    f.teil = { a: A.terme[0], b: A.terme[1], c: E };
  } else {
    f.typ = "ausdruck"; f.ops = A.ops; f.terme = A.terme; f.erg = E;
  }
  if (rk) f.rot = rk;
  return f;
}

/* Die ganze Antwort -> { soll: {nr: n}, felder: [...], zeilen: [roh] } */
export function abschriftLesen(text) {
  const soll = {}, felder = [], zeilen = [];
  for (const z0 of String(text || "").split("\n")) {
    const z = z0.replace(/^[-*•]\s*/, "").trim();
    if (!z || /^keine\.?$/i.test(z)) continue;
    const s = /^SOLL\s*\|\s*(?:Aufgabe\s*)?([^|]+?)\s*\|\s*(\d{1,3})\s*(?:[x×*]\s*(\d{1,3}))?\s*$/i.exec(z);
    if (s) {
      const nr = s[1].replace(/\s+/g, "");
      soll[nr] = (soll[nr] || 0) + (s[3] ? +s[2] * +s[3] : +s[2]);
      zeilen.push(z.slice(0, 160));
      continue;
    }
    const f = feldLesen(z);
    if (f) felder.push(f);
    /* Jede Zeile bleibt in der Abschrift - auch eine, die heute niemand lesen
       kann. Eine bessere Regel wirkt dann später ohne neuen Modellaufruf. */
    zeilen.push(z.slice(0, 160));
  }
  return { soll, felder, zeilen };
}

/* Soll gegen Ist: je Aufgabe so viele Feldzeilen (ohne Zwischenschritte), wie
   gemeldet. Gibt { voll, soll, ist, fehlt: ["3c: 1 von 4", …] }. */
export function sollIst(ab) {
  const ist = {};
  for (const f of ab.felder) if (!f.zwischen) ist[f.nr] = (ist[f.nr] || 0) + 1;
  const fehlt = [];
  let s = 0, i = 0;
  for (const nr of Object.keys(ab.soll)) {
    s += ab.soll[nr];
    i += Math.min(ab.soll[nr], ist[nr] || 0);
    if ((ist[nr] || 0) !== ab.soll[nr]) fehlt.push(nr + ": " + (ist[nr] || 0) + " von " + ab.soll[nr]);
  }
  for (const nr of Object.keys(ist)) if (!(nr in ab.soll)) fehlt.push(nr + ": " + ist[nr] + " ohne SOLL");
  return { voll: !fehlt.length, soll: s, ist: i, fehlt };
}

/* ---------- Nachrechnen (deterministisch) ---------- */

export function stimmt(g) {
  if (g.op === "*") return g.a * g.b === g.c;
  if (g.op === "+") return g.a + g.b === g.c;
  if (g.op === "-") return g.a - g.b === g.c;
  if (g.op === "/") return g.b !== 0 && g.a === g.b * g.c;
  return false;
}
/* Die richtige Zahl für eine Lücke - oder null, wenn es keine ganze gibt
   (dann ist eher falsch gelesen als falsch gerechnet). */
export function loesen(g, l) {
  let v = null;
  const { a, b, c, op } = g;
  if (l === "c") v = op === "*" ? a * b : op === "+" ? a + b : op === "-" ? a - b : (b ? a / b : null);
  else if (l === "a") v = op === "*" ? (b ? c / b : null) : op === "+" ? c - b : op === "-" ? c + b : b * c;
  else if (l === "b") v = op === "*" ? (a ? c / a : null) : op === "+" ? c - a : op === "-" ? a - c : (c ? a / c : null);
  return v != null && Number.isInteger(v) && v >= 0 ? v : null;
}
function teilerVon(n) { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; }

/* Der Schlüssel einer Aufgabe - gleiche Aufgabe = gleiche Stelle, egal ob sie
   aus „Kind schrieb …“ oder aus der Abschrift kommt. Die Lücke ist "?". */
export function aufgabeSchluessel(g, luecke) {
  const f = (p) => (p === luecke ? "?" : String(g[p]));
  return f("a") + OP_ZEIGEN[g.op] + f("b") + "=" + f("c");
}
export function zeigen(g, luecke) {
  const f = (p) => (p === luecke ? "?" : String(g[p]));
  return f("a") + " " + OP_ZEIGEN[g.op] + " " + f("b") + " = " + f("c");
}

/* Ein Feld -> Urteil.
   { urteil: "richtig"|"falsch"|"leer"|"unsicher"|"ohneKind"|"unklar", key, final, … } */
/* Ausdruck mit Punkt vor Strich, nur ganze Zahlen; null, wenn etwas nicht aufgeht. */
export function rechnen(werte, ops) {
  const w = werte.slice(), o = ops.slice();
  for (let i = 0; i < o.length;) {
    if (o[i] === "*" || o[i] === "/") {
      let v;
      if (o[i] === "*") v = w[i] * w[i + 1];
      else { if (!w[i + 1] || w[i] % w[i + 1] !== 0) return null; v = w[i] / w[i + 1]; }
      w.splice(i, 2, v); o.splice(i, 1);
    } else i++;
  }
  let v = w[0];
  for (let i = 0; i < o.length; i++) v = o[i] === "+" ? v + w[i + 1] : v - w[i + 1];
  return Number.isFinite(v) ? v : null;
}
export function ausdruckZeigen(terme, ops, erg, luecke) {
  let t = "";
  terme.forEach((x, i) => { t += (i ? " " + OP_ZEIGEN[ops[i - 1]] + " " : "") + (luecke === i ? "?" : String(x)); });
  return t + " = " + (luecke === "e" ? "?" : String(erg));
}

export function feldUrteil(f) {
  if (f.typ === "text") return { urteil: "nichtRechenbar" };
  if (f.typ === "ausdruck") {
    const alle = f.terme.concat([f.erg]);
    const pos = alle.map((x, i) => (x.kind ? i : -1)).filter((i) => i >= 0);
    if (!pos.length) return { urteil: "ohneKind" };
    if (pos.some((i) => alle[i].leer)) return { urteil: "leer" };
    if (pos.some((i) => alle[i].unsicher)) return { urteil: "unsicher" };
    const rot = Array.isArray(f.rot) ? f.rot : [];
    if (rot.length && (rot.length !== pos.length || rot.some((x) => !x || x.wert == null))) return { urteil: "unsicher" };
    const w = alle.map((x) => x.wert), paul = w.slice();
    pos.forEach((i, k) => { if (rot[k]) w[i] = rot[k].wert; });
    const n = f.terme.length;
    const ziel = pos.length === 1 ? pos[0] : pos.includes(n) ? n : -1;
    const luecke = ziel === n ? "e" : ziel;
    const key = ausdruckZeigen(w.slice(0, n), f.ops, w[n], luecke).replace(/\s+/g, "");
    const v = rechnen(w.slice(0, n), f.ops);
    if (v != null && v === w[n]) return { urteil: "richtig", key, final: String(w[ziel >= 0 ? ziel : n]) };
    /* Ziffernrätsel und mehrdeutige Lücken: kein Fehler für Paul, lieber still. */
    if (ziel < 0 || alle.some((x) => x.ziffer)) return { urteil: "unklar", key };
    let soll = null;
    if (luecke === "e") soll = v;
    else {
      const treffer = [];
      for (let x = 0; x <= 99999 && treffer.length < 2; x++) {
        const t = w.slice(0, n); t[ziel] = x;
        if (rechnen(t, f.ops) === w[n]) treffer.push(x);
      }
      soll = treffer.length === 1 ? treffer[0] : null;
    }
    if (soll == null || soll < 0 || !Number.isInteger(soll)) return { urteil: "unklar", key };
    return { urteil: "falsch", key, final: String(w[ziel]), aus: { terme: w.slice(0, n), ops: f.ops, erg: w[n] }, luecke, soll,
             rotDa: rot.length > 0, paulGut: rot.length ? rechnen(paul.slice(0, n), f.ops) === paul[n] : null, paulWert: paul[ziel] };
  }
  if (f.typ === "teiler" || f.typ === "teilerTeil" || f.typ === "vielfache") {
    const key = (f.typ === "vielfache" ? "V" : "T") + f.n;
    if (f.paul.leer) return { urteil: "leer", key };
    if (f.paul.unsicher || (f.rot && (f.rot.unsicher || f.rot.leer))) return { urteil: "unsicher", key };
    const ist = (f.rot && f.rot.liste) || f.paul.liste;
    if (!f.n || f.n > 1000) return { urteil: "unklar", key };
    const doppelt = ist.length !== new Set(ist).size;
    let gut;
    if (f.typ === "teiler") { const D = teilerVon(f.n); gut = !doppelt && ist.length === D.length && D.every((x) => ist.includes(x)); }
    else if (f.typ === "teilerTeil") gut = !doppelt && ist.every((x) => x > 0 && f.n % x === 0);
    else gut = !doppelt && ist.every((x) => x > 0 && x % f.n === 0);
    return { urteil: gut ? "richtig" : "falsch", key, final: ist.join(","), ist, rotDa: !!(f.rot && f.rot.liste),
             paulGut: f.rot && f.rot.liste ? feldUrteil({ ...f, rot: null }).urteil === "richtig" : null };
  }
  const t = f.teil;
  const pos = Object.keys(t).filter((p) => t[p].kind);
  if (!pos.length) return { urteil: "ohneKind" };
  if (pos.some((p) => t[p].leer)) return { urteil: "leer" };
  if (pos.some((p) => t[p].unsicher)) return { urteil: "unsicher" };
  const rot = Array.isArray(f.rot) ? f.rot : [];
  if (rot.length && (rot.length !== pos.length || rot.some((x) => !x || x.unsicher || x.leer || x.wert == null)))
    return { urteil: "unsicher" };
  const wert = {}, paul = {};
  for (const p of Object.keys(t)) wert[p] = paul[p] = t[p].wert;
  pos.forEach((p, i) => { if (rot[i]) wert[p] = rot[i].wert; });
  if (f.typ === "rest") {
    const { a, b } = wert;
    if (!b) return { urteil: "unklar" };
    const key = a + ":" + b + "=?R?";
    const q = Math.floor(a / b), r = a % b;
    const gut = wert.c === q && wert.r === r;
    const pg = paul.c === q && paul.r === r;
    return { urteil: gut ? "richtig" : "falsch", key, final: wert.c + "R" + wert.r, g: { a, b, q: wert.c, r: wert.r },
             soll: { q, r }, rotDa: rot.length > 0, paulGut: rot.length ? pg : null };
  }
  const g = { a: wert.a, op: f.op, b: wert.b, c: wert.c };
  if (pos.length > 1 && !pos.includes("c")) return { urteil: "unklar" };
  const luecke = pos.length === 1 ? pos[0] : "c";
  const key = aufgabeSchluessel(g, luecke);
  if (stimmt(g)) return { urteil: "richtig", key, final: String(g[luecke]), luecke };
  const soll = loesen(g, luecke);
  if (soll == null) return { urteil: "unklar", key };
  /* Mit mehreren Kind-Feldern (Kette: der vordere Wert ist Pauls eigener): nur,
     wenn sich mit dem vorderen Wert eindeutig die hintere Zahl ergibt. */
  const pgG = { a: paul.a, op: f.op, b: paul.b, c: paul.c };
  return { urteil: "falsch", key, final: String(g[luecke]), g, luecke, soll,
           rotDa: rot.length > 0, paulGut: rot.length ? stimmt(pgG) : null, paulWert: paul[luecke] };
}

/* Feld-Kennung für die zweite Lesung: Aufgabe + Schlüssel. */
export function feldId(f, u) { return (f.nr || "-") + (f.zwischen ? "~" : "") + "|" + (u.key || ""); }

/* Frage für die zweite Lesung: die Rechnung mit [ ] statt Pauls Zahl. */
export function gegenFrage(f) {
  const wo = f.nr && f.nr !== "-" ? "Aufgabe " + f.nr + (f.zwischen ? " (Zwischenschritt)" : "") + ": " : "";
  if (f.typ === "teiler" || f.typ === "teilerTeil" || f.typ === "vielfache")
    return wo + (f.typ === "vielfache" ? "Vielfache von " : "Teiler von ") + f.n + " = [ ]  (die ganze Liste des Kindes)";
  if (f.typ === "ausdruck") {
    const z = (x) => (x.kind ? "[ ]" : String(x.wert));
    let txt = "";
    f.terme.forEach((x, i) => { txt += (i ? " " + OP_ZEIGEN[f.ops[i - 1]] + " " : "") + z(x); });
    return wo + txt + " = " + z(f.erg);
  }
  const t = f.teil;
  const z = (p) => (t[p].kind ? "[ ]" : String(t[p].wert));
  return wo + z("a") + " " + OP_ZEIGEN[f.op] + " " + z("b") + " = " + z("c") + (t.r ? " R " + z("r") : "");
}

/* Antwort der zweiten Lesung -> { <feldId>: "<final>" | "?" } */
export function gegenLesen(text, fragen) {
  const aus = {};
  for (const z0 of String(text || "").split("\n")) {
    const m = /^\s*[-*]?\s*Feld\s*(\d{1,3})\s*\|\s*(.*)$/i.exec(z0);
    if (!m) continue;
    const f = fragen[+m[1] - 1];
    if (!f) continue;
    const rest = m[2].trim();
    if (/^\?/.test(rest)) { aus[f.id] = "?"; continue; }
    const teile = rest.split("|").map((x) => x.trim());
    const rotT = (teile.slice(1).join("|").match(/rot\s*(.*)$/i) || [])[1] || "";
    const nimm = rotT && /\[/.test(rotT) ? rotT : teile[0];
    const kl = nimm.match(/\[[^\]]*\]/g) || [];
    if (!kl.length) { aus[f.id] = "?"; continue; }
    if (f.liste) {
      const l = listeLesenK(kl[0]);
      aus[f.id] = l && l.liste ? l.liste.join(",") : "?";
    } else {
      const w = kl.map(klammerLesen);
      if (w.some((x) => !x || x.wert == null)) { aus[f.id] = "?"; continue; }
      aus[f.id] = f.rest ? (w.length === 2 ? w[0].wert + "R" + w[1].wert : "?") : String(w[0].wert);
    }
  }
  return aus;
}

/* ---------- Ein Blatt auswerten (ohne Modell, aus dem Gespeicherten) ----------
   n = blatt.nachgerechnet. Gibt { voll, soll, ist, fehlt, felder, fehler:
   [{ f, u, id, bestaetigt: true|false|null }] }. */
/* Ganz vom Kind geschriebene Rechnung (15.10.2026, Leons „15 + 4 = 11“ bei „kleine und große Aufgabe“):
   Die Abschrift trägt dieselbe Rechnung mehrmals, je mit einem anderen Feld des Kindes. Dann ist offen,
   WELCHE Zahl falsch ist - lieber still als die falsche Stelle anstreichen. */
function mehrdeutigeFelder(ab) {
  /* Gleichung a op b = c: Schlüssel aus Aufgabe, Rechenzeichen, a und b (c kann unsicher ohne Wert sein). */
  const teile = (f) => f.typ === "gleichung" ? [f.teil.a, f.teil.b, f.teil.c] : f.typ === "ausdruck" ? f.terme.concat([f.erg]) : null;
  const sig = (f) => f.typ === "gleichung" ? (f.nr || "-") + "|g|" + f.op + "|" + f.teil.a.wert + "|" + f.teil.b.wert
    : (f.nr || "-") + "|a|" + (f.ops || []).join("") + "|" + f.terme.map((x) => x.wert).join(",");
  const pos = (f) => teile(f).map((x, i) => (x && x.kind ? i : -1)).filter((i) => i >= 0).join(",");
  const je = {};
  for (const f of ab.felder) if (teile(f)) (je[sig(f)] = je[sig(f)] || new Set()).add(pos(f));
  return new Set(ab.felder.filter((f) => teile(f) && je[sig(f)].size > 1));
}
/* ---------- Spaltenregel (29.10.2026, Dennys Entscheidung 4, nur Paul) ----------
   Anlass: Blatt 8tv8tshw4c „Malnehmen mit Zehnerzahlen“, Tabelle 2a/2b. Spaltenköpfe „· 7 | · 10 | · 70“:
   „· 10“ wird auf das Feld LINKS gerechnet (21 · 10 = 210), nicht auf den Zeilenkopf. Die Abschrift trug
   „3 · 10 = [210]“, das Nachrechnen fand 8 Fehler, die keine waren (die Lehrerin hakte alle ab).
   Erkannt wird: gleiche Aufgabe, direkt davor ein Feld mit demselben Zeilenkopf, Spalte · 10/100/1000,
   und Pauls Zahl = Feld links · Spalte. Dann ist das Feld richtig gerechnet (ein Fehler im Feld links
   wird dort gemeldet, nicht noch einmal hier). */
const SPALTE = [10, 100, 1000];
export function spaltenFolge(ab) {
  const aus = new Set();
  let vor = null;
  for (const f of ab.felder) {
    if (f.zwischen) continue;
    const gl = (x) => x && x.typ === "gleichung" && x.op === "*" && !x.umgedreht && x.teil.c.kind && !x.teil.a.kind &&
      !x.teil.c.unsicher && !x.teil.c.leer && x.teil.c.wert != null;
    if (vor && vor.nr === f.nr && gl(f) && gl(vor) && !f.teil.b.kind && !f.rot && SPALTE.includes(f.teil.b.wert) &&
        vor.teil.a.wert === f.teil.a.wert && f.teil.a.wert * f.teil.b.wert !== f.teil.c.wert &&
        vor.teil.c.wert * f.teil.b.wert === f.teil.c.wert) aus.add(f);
    vor = f;
  }
  return aus;
}

/* ---------- Zwei Lesungen (29.10.2026, Dennys Entscheidung 5, nur Paul) ----------
   Ein Fehler zählt nur, wenn das unabhängige Durchlesen (`inhalt`, eigener Modellaufruf ohne Abschrift)
   dieselbe Aufgabe mit DERSELBEN Zahl des Kindes nennt. Anlass: 6 · 700 – Paul schrieb 4200, die Abschrift
   las 4100, die zweite Lesung (gleiches Bild, gleiche Frage) bestätigte 4100; `inhalt` hatte 4200.
   Ergebnis je Fehler: "ja" (gleiche Zahl), "anders" (gleiche Aufgabe, andere Zahl), "fehlt" (nicht genannt).
   Gelesen werden nur Zeilen des Kindes: Beispiel- und Lehrkraft-Zeilen nicht, bei „Kind schrieb X, richtig: Y“
   nur X. */
const IN_OP = { "·": "*", "x": "*", "×": "*", "*": "*", ":": "/", "÷": "/", "+": "+", "-": "-", "−": "-", "–": "-" };
const IN_RE = /(\d{1,7}(?:\s*[·x×*:÷+\-−–]\s*\d{1,7})+)\s*=\s*(\d{1,7})(?:\s*(?:R|Rest)\s*(\d{1,6}))?/g;
export function inhaltRechnungen(inhalt) {
  const aus = [];
  for (const z0 of Array.isArray(inhalt) ? inhalt : []) {
    let z = String(z0 || "");
    if (/^\s*(✍|Beispiel|Lehrkraft|Lehrerin|Stempel|Überschrift)/i.test(z)) continue;
    z = z.replace(/,?\s*richtig\s*:.*$/i, "");
    for (const m of z.matchAll(IN_RE)) {
      const teile = m[1].split(/\s*([·x×*:÷+\-−–])\s*/);
      const terme = [], ops = [];
      teile.forEach((t, i) => { if (i % 2) ops.push(IN_OP[t]); else terme.push(+t); });
      aus.push({ terme, ops, erg: +m[2], r: m[3] == null ? null : +m[3] });
    }
  }
  return aus;
}
/* Pauls eigene Werte des Feldes (ohne Rot) als { terme, ops, erg, r } mit der Stelle des Kindes. */
function paulRechnung(f) {
  if (f.typ === "gleichung" || f.typ === "rest") {
    const t = f.teil;
    if (["a", "b", "c"].some((p) => t[p].wert == null)) return null;
    return { terme: [t.a.wert, t.b.wert], ops: [f.op], erg: t.c.wert, r: f.typ === "rest" ? (t.r && t.r.wert != null ? t.r.wert : null) : null,
             kind: ["a", "b", "c", "r"].filter((p) => t[p] && t[p].kind) };
  }
  if (f.typ === "ausdruck") {
    if (f.terme.some((x) => x.wert == null) || f.erg.wert == null) return null;
    const kind = f.terme.map((x, i) => (x.kind ? i : -1)).filter((i) => i >= 0);
    if (f.erg.kind) kind.push("e");
    return { terme: f.terme.map((x) => x.wert), ops: f.ops.slice(), erg: f.erg.wert, r: null, kind };
  }
  return null;
}
function gleicheFolge(a, b) { return a.length === b.length && a.every((x, i) => x === b[i]); }
export function inhaltUrteil(f, rechnungen) {
  const p = paulRechnung(f);
  if (!p) return "fehlt";
  const tausch = p.terme.length === 2 && (p.ops[0] === "*" || p.ops[0] === "+");
  let anders = false;
  for (const q of rechnungen) {
    if (!gleicheFolge(q.ops, p.ops) || q.terme.length !== p.terme.length) continue;
    const varianten = [q.terme];
    if (tausch) varianten.push([q.terme[1], q.terme[0]]);
    for (const qt of varianten) {
      /* Gedruckte Teile müssen gleich sein, sonst ist es eine andere Aufgabe. */
      let gedrucktGleich = true, kindGleich = true;
      p.terme.forEach((x, i) => {
        const vomKind = p.kind.includes(i) || (p.terme.length === 2 && p.kind.includes(["a", "b"][i]));
        if (x === qt[i]) return;
        if (vomKind) kindGleich = false; else gedrucktGleich = false;
      });
      const ergKind = p.kind.includes("c") || p.kind.includes("e");
      if (ergKind) { if (q.erg !== p.erg) kindGleich = false; } else if (q.erg !== p.erg) gedrucktGleich = false;
      if (p.r != null || q.r != null) { if ((q.r == null ? 0 : q.r) !== (p.r == null ? 0 : p.r)) kindGleich = false; }
      if (!gedrucktGleich) continue;
      if (kindGleich) return "ja";
      anders = true;
    }
  }
  return anders ? "anders" : "fehlt";
}

/* Reihe: nennt das Durchlesen Pauls erstes falsches Glied als Zahl in einer Zeile des Kindes? */
export function inhaltNenntZahl(inhalt, zahl) {
  if (zahl == null) return false;
  const re = new RegExp("(^|[^\\d])" + zahl + "(?!\\d)");
  return (Array.isArray(inhalt) ? inhalt : []).some((z0) => {
    const z = String(z0 || "");
    if (/^\s*(✍|Beispiel|Lehrkraft|Lehrerin|Stempel|Überschrift)/i.test(z)) return false;
    return re.test(z.replace(/,?\s*richtig\s*:.*$/i, ""));
  });
}

export function auswerten(n, opt) {
  if (!n || !Array.isArray(n.z)) return null;
  const ab = abschriftLesen(n.z.join("\n"));
  const si = sollIst(ab);
  const g = n.g || {};
  const fehler = [];
  const zaehl = { richtig: 0, falsch: 0, leer: 0, unsicher: 0, ohneKind: 0, unklar: 0, nichtRechenbar: 0 };
  const gesehen = new Set();
  const mehr = mehrdeutigeFelder(ab);
  const spalte = opt && opt.spalten ? spaltenFolge(ab) : new Set();
  const inh = opt && opt.inhalt ? inhaltRechnungen(opt.inhalt) : null;
  for (const f of ab.felder) {
    const u = mehr.has(f) ? { urteil: "unklar" } : spalte.has(f) ? { urteil: "richtig", spalte: true } : feldUrteil(f);
    zaehl[u.urteil] = (zaehl[u.urteil] || 0) + 1;
    if (u.urteil !== "falsch") continue;
    const id = feldId(f, u);
    if (gesehen.has(id)) continue;
    gesehen.add(id);
    const zweite = g[id];
    const x = { f, u, id, bestaetigt: zweite == null ? null : zweite === u.final };
    if (inh) {
      /* Listen (Teiler, Vielfache) nennt das Durchlesen nicht als Rechnung: die bleiben wie bisher. */
      x.inhalt = f.typ === "gleichung" || f.typ === "rest" || f.typ === "ausdruck" ? inhaltUrteil(f, inh) : "liste";
      x.lesung1 = x.bestaetigt;
      /* Rot der Lehrerin ist ein eigener Beleg (und „Rot ist fertig“): dort bleibt es wie bisher. */
      if (x.bestaetigt === true && !u.rotDa && x.inhalt !== "ja" && x.inhalt !== "liste") { x.bestaetigt = false; x.nachsehen = true; }
    }
    /* Zweiter Beleg (29.10.2026, Dennys Entscheidung A, nur Paul, _belege.js): am Foto einzeln bestätigt
       oder Dennys Klick im Elternbereich. Gilt nur für genau dieses Feld und genau Pauls Zahl. */
    const beleg = opt && opt.belege ? belegGilt(opt.belege, id, u.final) : null;
    if (beleg && beleg.urteil === "fehler") { x.bestaetigt = true; x.nachsehen = false; x.beleg = beleg; }
    else if (beleg && beleg.urteil === "richtig") { x.bestaetigt = false; x.nachsehen = false; x.richtigBeleg = beleg; }
    fehler.push(x);
  }
  if (spalte.size) zaehl.spalte = spalte.size;
  /* opt.ketten (28.10.2026, nur Paul): die Zahlenreihen mit denselben Feld-Objekten wie `fehler`. */
  if (opt && opt.ketten) return { ...si, felder: ab.felder.length, zaehl, fehler, abgebrochen: !!n.f, ketten: kettenFinden(n, ab) };
  return { ...si, felder: ab.felder.length, zaehl, fehler, abgebrochen: !!n.f };
}

/* Welche Felder brauchen die zweite Lesung? */
export function gegenFragen(ab) {
  const fragen = [], ids = new Set();
  const mehr = mehrdeutigeFelder(ab);
  for (const f of ab.felder) {
    const u = mehr.has(f) ? { urteil: "unklar" } : feldUrteil(f);
    if (u.urteil !== "falsch") continue;
    const id = feldId(f, u);
    if (ids.has(id)) continue;
    ids.add(id);
    fragen.push({ id, text: gegenFrage(f), liste: f.typ !== "gleichung" && f.typ !== "rest", rest: f.typ === "rest" });
  }
  return fragen;
}

/* Ist das Gespeicherte noch gültig? Ein neues Foto macht es alt. */
export function aktuell(blatt) {
  const n = blatt && blatt.nachgerechnet;
  if (!n || n.v !== VERSION || !Array.isArray(n.z) || typeof n.am !== "string") return false;
  /* Neues oder dazugelegtes Foto (seiteNeu, fotoNeu): dann neu nachrechnen. */
  const foto = blatt.fotoNeu && typeof blatt.fotoNeu === "object" ? Object.values(blatt.fotoNeu) : [];
  if (typeof blatt.seiteNeu === "string") foto.push(blatt.seiteNeu);
  return !foto.some((t) => typeof t === "string" && t > n.am);
}
export function brauchtNachrechnen(blatt, kind) {
  if (!blatt || blatt.fach !== "mathe" || blatt.sichtbar === false) return false;
  if (!aktuell(blatt)) return true;
  /* Gezieltes Nachlesen (28.10.2026, nur Paul): eine Reihe mit Fehlern, deren Abstand kein gedrucktes
     Glied belegt, wird EINMAL mit der DRUCK-Regel neu abgeschrieben (Marker d). Keine VERSION-Erhöhung -
     die hätte alle Matheblätter neu lesen lassen. */
  if (kind === "paul" && !blatt.nachgerechnet.d) {
    const k = kettenFinden(blatt.nachgerechnet);
    return k.some((x) => !x.belegt && !x.druck && x.feldFalsch > 0);
  }
  return false;
}

/* ---------- Zahlenreihen (28.10.2026, nur Paul) ----------
   Anlass: Blatt g503ypea2c, Aufgabe 2d „Zähle richtig weiter“. Gedruckt stehen 1977 und 1990, Paul zählte
   mit +23 weiter. Die Abschrift trug den Abstand 13, den das Modell selbst abgeleitet hatte, und feldUrteil
   rechnete jedes Folgeglied aus Pauls eigenem Vorwert: 6 Karten, und Karte 2 hätte 2026 als richtig
   angenommen (Befund befunde/2026-10-28-paul-folgefehler-2d.md). Dennys Wahl 1 und 2 vom 28.10.2026:
   - Das Soll kommt NIE aus Pauls Vorwert, sondern aus der gedruckten Reihe: mindestens zwei gedruckte
     Glieder (DRUCK-Zeile), gleicher Abstand, nachgerechnet; das letzte gedruckte Glied ist die Startzahl.
   - Eine Kette = eine Karte; Folgefehler werden nicht einzeln gemeldet.
   Eine Kette: gleiche Nr, Rechenzeichen + oder −, dieselbe Zahl b in jedem Glied, Ergebnis vom Kind, und ab
   dem zweiten Glied ist die vordere Zahl Pauls Ergebnis davor. Mindestens zwei Glieder.
   Gibt je Kette { nr, glieder, op, b, start, druck, belegt, grund, schritt, soll, paul, falsch, feldFalsch,
   rot, bestaetigt, paulSchritt }. */
export function druckLesen(zeilen) {
  const aus = {};
  for (const z of zeilen || []) {
    const t = String(z || "").split("|").map((x) => x.trim());
    if (t.length < 3 || !/^DRUCK$/i.test(t[1])) continue;
    const nr = t[0].replace(/^Aufgabe\s*/i, "").replace(/\s+/g, "");
    const zahlen = t.slice(2).join(",").split(/[,;\s]+/).filter(Boolean);
    if (!nr || !zahlen.length || zahlen.some((x) => !/^\d{1,7}$/.test(x))) { aus[nr] = { unlesbar: true }; continue; }
    aus[nr] = { zahlen: zahlen.map(Number) };
  }
  return aus;
}
export function kettenFinden(n, ab0) {
  if (!n || !Array.isArray(n.z)) return [];
  const ab = ab0 || abschriftLesen(n.z.join("\n"));
  const druck = druckLesen(n.z);
  const g = n.g || {};
  const istGlied = (f) => f.typ === "gleichung" && !f.zwischen && (f.op === "+" || f.op === "-") &&
    !f.teil.b.kind && f.teil.b.wert != null && f.teil.c.kind;
  const ketten = [];
  let lauf = null;
  const ab_ = () => { if (lauf && lauf.glieder.length >= 2) ketten.push(lauf); lauf = null; };
  for (const f of ab.felder) {
    if (!istGlied(f)) { ab_(); continue; }
    const vorne = lauf && lauf.glieder[lauf.glieder.length - 1];
    const haengt = vorne && vorne.nr === f.nr && f.op === lauf.op && f.teil.b.wert === lauf.b && f.teil.a.kind &&
      f.teil.a.wert != null && vorne.teil.c.wert != null && f.teil.a.wert === vorne.teil.c.wert;
    if (haengt) { lauf.glieder.push(f); continue; }
    ab_();
    /* Erstes Glied: die vordere Zahl ist gedruckt (sonst wäre es kein Anfang, sondern ein loses Feld). */
    if (!f.teil.a.kind && f.teil.a.wert != null) lauf = { nr: f.nr, op: f.op, b: f.teil.b.wert, glieder: [f] };
  }
  ab_();
  return ketten.map((k) => {
    const start = k.glieder[0].teil.a.wert;
    const paul = k.glieder.map((f) => (f.teil.c.leer || f.teil.c.unsicher || f.teil.c.wert == null ? null : f.teil.c.wert));
    const rot = k.glieder.some((f) => Array.isArray(f.rot) && f.rot.length);
    const urteile = k.glieder.map((f) => feldUrteil(f));
    const feldFalsch = urteile.filter((u) => u.urteil === "falsch").length;
    /* Pauls eigener Abstand: nur wenn er überall gleich ist (Startzahl, dann seine Glieder). */
    let paulSchritt = null;
    const ende = paul.indexOf(null);
    const r = [start].concat(ende < 0 ? paul : paul.slice(0, ende));
    const dd = r.slice(1).map((x, i) => x - r[i]);
    if (dd.length >= 2 && dd.every((x) => x === dd[0]) && dd[0]) paulSchritt = dd[0];
    const o = { nr: k.nr, glieder: k.glieder, op: k.op, b: k.b, start, paul, rot, feldFalsch, paulSchritt,
                druck: null, belegt: false, grund: "", schritt: null, soll: null, falsch: [], bestaetigt: null };
    const dz = druck[k.nr];
    if (!dz) { o.grund = "keine gedruckten Glieder abgeschrieben"; return o; }
    if (dz.unlesbar) { o.grund = "gedruckte Glieder unlesbar"; return o; }
    o.druck = dz.zahlen;
    if (dz.zahlen.length < 2) { o.grund = "nur ein gedrucktes Glied"; return o; }
    const d = dz.zahlen.slice(1).map((x, i) => x - dz.zahlen[i]);
    if (!d.every((x) => x === d[0]) || !d[0]) { o.grund = "gedruckte Glieder haben keinen gleichen Abstand"; return o; }
    if ((k.op === "+" ? d[0] : -d[0]) !== k.b) { o.grund = "Abstand der gedruckten Glieder (" + Math.abs(d[0]) + ") passt nicht zur Abschrift (" + k.b + ")"; return o; }
    if (dz.zahlen[dz.zahlen.length - 1] !== start) { o.grund = "letztes gedrucktes Glied ist nicht die Startzahl"; return o; }
    o.belegt = true; o.schritt = d[0];
    o.soll = k.glieder.map((f, i) => start + (i + 1) * d[0]);
    o.falsch = paul.map((x, i) => (x != null && x !== o.soll[i] ? i : -1)).filter((i) => i >= 0);
    if (o.falsch.length) {
      /* Zweite Lesung des ersten falschen Glieds: dessen vordere Zahl stimmt (gedruckt oder richtig gezählt),
         also hat feldUrteil es als falsch gefragt. */
      const i = o.falsch[0], u = urteile[i];
      if (u.urteil === "falsch") { const z = g[feldId(k.glieder[i], u)]; o.bestaetigt = z == null ? null : z === u.final; }
    }
    return o;
  });
}

/* ---------- Modellaufrufe ---------- */

async function frage(key, bilder, text, opt) {
  const o = opt || {};
  const abbruch = typeof AbortController !== "undefined" ? new AbortController() : null;
  const uhr = abbruch ? setTimeout(() => abbruch.abort(), o.grenze || 90000) : null;
  try {
    const r = await (o.fetch || fetch)("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: abbruch ? abbruch.signal : undefined,
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODELL,
        /* Opus 5.5 denkt von selbst, die Denk-Tokens zählen in max_tokens (Kapitel 029);
           kein erzwungenes tool_choice. */
        max_tokens: o.max || 12000,
        thinking: { type: "adaptive" },
        output_config: { effort: o.effort || "low" },
        messages: [{ role: "user", content: bilder.map((b) => ({ type: "image", source: {
            type: "base64", media_type: (/^data:([^;]+);/.exec(b) || [])[1] || "image/jpeg", data: b.slice(b.indexOf(",") + 1) } }))
          .concat([{ type: "text", text }]) }],
      }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j) return { fehler: "HTTP " + r.status, usage: j && j.usage };
    if (j.stop_reason === "max_tokens") return { fehler: "max_tokens", usage: j.usage };
    return { text: (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join(""), usage: j.usage };
  } catch (e) {
    return { fehler: String(e && e.name || e) };
  } finally { if (uhr) clearTimeout(uhr); }
}

/* Ein Blatt nachrechnen: Abschrift, Zählung, zweite Lesung der Verdächtigen.
   bilder = data:-URLs (eine je Seite, höchstens 4). Wirft nie.
   Stimmt die Zählung nicht (Soll gegen Ist), gibt es EINEN zweiten Anlauf mit mehr
   Denkzeit und dem Hinweis, was fehlte. Bleibt es unvollständig, wird es trotzdem
   gespeichert - als „unvollständig nachgerechnet“ (auswerten().voll = false).
   Gibt { ok, nachgerechnet, usage: {ein, aus}, aufrufe } oder { ok:false, fehler }.
   ok:false = nichts speichern (nächster Aufruf versucht es wieder).
   vorher = schon gespeicherte Abschrift: dann nur nachholen, was fehlt
   (unvollständig -> zweiter Anlauf; fehlende zweite Lesungen). */
export async function nachrechnen(key, bilder, opt, vorher) {
  const o = opt || {};
  const liste = (Array.isArray(bilder) ? bilder : [bilder]).slice(0, 4).map(String);
  const usage = { ein: 0, aus: 0 };
  const plus = (u) => { if (u) { usage.ein += u.input_tokens || 0; usage.aus += u.output_tokens || 0; } };
  let aufrufe = 0, roh = "";
  let zeilen = vorher && Array.isArray(vorher.z) ? vorher.z : null;
  const g = { ...((vorher && vorher.g) || {}) };
  let versuche = (vorher && vorher.w) || 0;
  if (!zeilen) {
    const r1 = await frage(key, liste, abschreibAuftrag(liste.map(() => null), { kind: o.kind }), o);
    aufrufe++; plus(r1.usage);
    if (r1.fehler) return { ok: false, fehler: r1.fehler, usage, aufrufe };
    roh = r1.text; zeilen = abschriftLesen(r1.text).zeilen; versuche = 1;
  }
  let si = sollIst(abschriftLesen(zeilen.join("\n")));
  if (!si.voll && versuche < 2 && o.zweiterAnlauf !== false) {
    const hinweis = "\n\nACHTUNG: Ein erster Durchgang hat sich verzählt (" + si.fehlt.slice(0, 8).join("; ") +
      "). Zähle die Felder jeder Aufgabe noch einmal genau und schreibe JEDES Feld ab – SOLL und Feldzeilen müssen übereinstimmen.";
    const r1b = await frage(key, liste, abschreibAuftrag(liste.map(() => null), { kind: o.kind }) + hinweis, { ...o, effort: "medium", max: 16000 });
    aufrufe++; plus(r1b.usage); versuche = 2;
    if (!r1b.fehler) {
      const z2 = abschriftLesen(r1b.text).zeilen, si2 = sollIst(abschriftLesen(z2.join("\n")));
      if (si2.voll || (si2.soll && si2.ist / si2.soll > (si.soll ? si.ist / si.soll : 0))) { zeilen = z2; si = si2; roh = r1b.text; for (const k of Object.keys(g)) delete g[k]; }
    }
  }
  const fragen = gegenFragen(abschriftLesen(zeilen.join("\n"))).filter((f) => !(f.id in g));
  if (fragen.length) {
    const r2 = await frage(key, liste, gegenAuftrag(fragen, liste.length), { ...o, max: 6000 });
    aufrufe++; plus(r2.usage);
    if (r2.fehler) return { ok: false, fehler: "Gegenlesen: " + r2.fehler, usage, aufrufe };
    Object.assign(g, gegenLesen(r2.text, fragen));
    for (const f of fragen) if (!(f.id in g)) g[f.id] = "?";
  }
  const am = o.jetzt || new Date().toISOString();
  const alt = (vorher && vorher.u) || [0, 0];
  return { ok: true, aufrufe, usage, roh,
           nachgerechnet: { v: VERSION, am: vorher && vorher.am && !roh ? vorher.am : am, z: zeilen.slice(0, 400), g, w: versuche,
                            u: [alt[0] + usage.ein, alt[1] + usage.aus],
                            /* d (28.10.2026): mit DRUCK-Regel abgeschrieben (nur Paul) - kein zweites gezieltes Nachlesen. */
                            ...(o.kind === "paul" && (roh || (vorher && vorher.d)) ? { d: 1 } : {}) } };
}

/* Opus 5.5: 4 $ je Mio. Eingabe, 20 $ je Mio. Ausgabe (Anthropic-Preisliste 09/2026). */
export function kostenEuro(usage, eurJeUsd) {
  if (!usage) return 0;
  return ((usage.ein || 0) * 4e-6 + (usage.aus || 0) * 20e-6) * (eurJeUsd || 0.86);
}
