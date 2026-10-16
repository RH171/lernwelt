/* Probenstoff Mathe: Stoff aus Pauls neuen Matheblättern (16.10.2026, Kapitel 121)
 *
 * Denny am 16.10.2026, 18:33 Uhr: „Passt sich der aber zu den aktuellen Blättern an?“
 * Bis dahin kamen Themen und die 8 Saat-Stellen der Kiste fest aus dem Code (Stand 13.10.2026).
 * Dieses Modul liest die Feld-für-Feld-Abschrift (`nachgerechnet`, _nachrechnen.js) jedes
 * Matheblattes im Probenzeitraum und macht daraus Aufgaben-Schlüssel für /probenstoff/motor.js:
 *
 *   stellen  Pauls Fehler – NUR mit Beleg: rot von der Lehrerin verbessert, oder von der zweiten
 *            Lesung bestätigt (wie im Prüf-Reiter). „Kind schrieb X, richtig: Y“ aus dem Durchlesen
 *            zählt NICHT (das ist der Lesehelfer, nicht die Lehrerin). Fehlalarme sind schlimmer.
 *   quellen  Aufgaben vom Blatt (richtig gerechnete auch), als Vorlage für „Geschwister“ mit neuen Zahlen.
 *
 * Grenze (was zur Probe „Einmaleins und Teilen“ gehört):
 *   - Fach Mathe, sichtbar, Datum ab VON (05.10.2026, Probenstoff seit diesem Tag), bis heute.
 *   - Das Blatt hat rechenbare Felder MIT Mal, Geteilt, Rest, Teiler oder Vielfache – ODER es ist ein
 *     Übungsblatt der Lehrerin (art "uebung") mit rechenbaren Feldern.
 *   - Blätter ohne ein einziges rechenbares Feld (etwa ein falsch einsortiertes Deutschblatt) bleiben draußen.
 *   - Je Feld nur Formen, die der Motor kennt (mal, malp, teil, teilp, rest, pkt, rech, raet, tl, vf).
 * Rein lesend, kein Schreibvorgang, kein Modellaufruf. Der Motor prüft jeden Schlüssel noch einmal.
 */
import { abschriftLesen, feldUrteil, feldId, rechnen, sollIst } from "./_nachrechnen.js";

export const VON = "2026-10-05";
const MAX_STELLEN = 12, MAX_QUELLEN = 40;
const OPZ = { "*": "*", "/": "/", "+": "+", "-": "-" };

function nullen(n) { let z = 0; while (n && n % 10 === 0) { n /= 10; z++; } return z; }
function teilerVon(n) { const t = []; for (let i = 1; i <= n; i++) if (n % i === 0) t.push(i); return t; }
const ganz = (v) => Number.isInteger(v) && v >= 0 && v <= 10000;

/* Schlüssel für eine RICHTIGE Aufgabe aus dem Feld (Werte schon berichtigt).
   g: {a, op, b, c} (Gleichung) mit luecke a|b|c, oder Ausdruck {terme, ops, erg} mit luecke e|i. */
export function schluessel(f, w) {
  if (f.typ === "rest") {
    const { a, b } = w;
    if (!b || a < b || a > 1000) return null;
    return "rest:" + a + ":" + b;
  }
  if (f.typ === "teiler") return f.n >= 4 && f.n <= 100 ? "tl:" + f.n : null;
  if (f.typ === "vielfache") return f.n >= 2 && f.n <= 12 ? "vf:" + f.n : null;
  if (f.typ === "gleichung") {
    const { a, b, c, op, luecke } = w;
    if (![a, b, c].every(ganz)) return null;
    if (op === "*") {
      if (luecke === "c") return nullen(a) + nullen(b) ? "mal:" + a + "x" + b : "rech:" + a + "*" + b;
      if (c % 10 || !a || !b) return null;
      return luecke === "a" ? "malp:" + c + "=?x" + b : "malp:" + c + "=" + a + "x?";
    }
    if (op === "/") {
      if (luecke === "c") return b && a % b === 0 ? "teil:" + a + ":" + b : null;
      if (luecke === "a" && b === 10) return "teilp:?:10=" + c;
      return null;
    }
    if (op === "+" || op === "-") {
      if (luecke === "c") return "rech:" + a + op + b;
      if (op === "-" && luecke === "a") return "raet:m:" + b + ":" + c;       // ? − 18 = 50
      if (op === "+") return luecke === "a" ? "raet:p:" + b + ":" + c : "raet:p:" + a + ":" + c;   // ? + 56 = 100
      if (op === "-" && luecke === "b") return "raet:w:" + a + ":" + c;       // 801 − ? = 238
    }
    return null;
  }
  if (f.typ === "ausdruck") {
    const { terme, ops, luecke } = w;
    if (luecke !== "e" || terme.length < 2 || terme.length > 4 || !terme.every(ganz)) return null;
    const v = rechnen(terme, ops);
    if (v == null || !ganz(v)) return null;
    let s = "";
    terme.forEach((t, i) => { s += (i ? OPZ[ops[i - 1]] : "") + t; });
    const punkt = ops.map((o) => o === "*" || o === "/");
    if (terme.length === 3 && punkt[0] !== punkt[1]) return "pkt:" + s;
    return "rech:" + s;
  }
  return null;
}

/* Werte eines Feldes, mit dem Rotstift berichtigt (für die richtige Aufgabe) und Pauls eigene. */
function werte(f) {
  if (f.typ === "rest" || f.typ === "gleichung") {
    const t = f.teil, pos = Object.keys(t).filter((p) => t[p].kind);
    const rot = Array.isArray(f.rot) ? f.rot : [];
    const w = {}, paul = {};
    for (const p of Object.keys(t)) w[p] = paul[p] = t[p].wert;
    pos.forEach((p, i) => { if (rot[i] && rot[i].wert != null) w[p] = rot[i].wert; });
    return { w, paul, pos, rot };
  }
  return null;
}

/* Ein Feld -> { k, fehler: bool, vertauscht?: bool } oder null. */
export function feldStoff(f, g) {
  if (!f || f.zwischen || f.typ === "text") return null;
  /* Teiler: Pauls Liste ist oft mit „1?“ gelesen (unsicher). Mit roter Liste der Lehrerin zählt:
     fehlt in Pauls Liste (ohne Fragezeichen) ein echter Teiler, ist es eine Fehlerstelle. */
  if (f.typ === "teiler" || f.typ === "teilerTeil") {
    const n = f.n, D = teilerVon(n || 0);
    const roh = (/=\s*\[([^\]]*)\]/.exec(f.roh || "") || [])[1] || "";
    const paul = roh.split(/[,;]\s*/).map((x) => x.replace(/\?/g, "").trim()).filter((x) => /^\d+$/.test(x)).map(Number);
    const rotL = f.rot && f.rot.liste;
    const k = schluessel({ typ: "teiler", n });
    if (!k) return null;
    const rotVoll = rotL && D.every((x) => rotL.includes(x)) && rotL.every((x) => D.includes(x));
    const fehlt = D.some((x) => !paul.includes(x));
    if (rotVoll && fehlt && paul.length) return { k, fehler: true, beleg: "rot" };
    if (f.typ === "teiler" && !f.paul.unsicher) {
      const u = feldUrteil({ ...f, rot: null });
      if (u.urteil === "falsch" && g[feldId(f, u)] === u.final) return { k, fehler: true, beleg: "zweitlesung" };
    }
    return { k, fehler: false };
  }
  if (f.typ === "vielfache") {
    const k = schluessel(f);
    return k ? { k, fehler: false } : null;
  }
  /* Zahlenhäuser „[3] · [4] = 12“: beide Faktoren vom Kind – das ist „Malaufgaben zu einer Zahl“,
     also Teiler-Paare. Nur als Vorlage, nie als Fehler. */
  if (f.typ === "gleichung" && f.op === "*" && f.teil.a.kind && f.teil.b.kind && !f.teil.c.kind && f.teil.c.wert != null) {
    const k = schluessel({ typ: "teiler", n: f.teil.c.wert });
    return k ? { k, fehler: false } : null;
  }
  const uPaul = feldUrteil({ ...f, rot: null });
  const uEnd = feldUrteil(f);
  if (["leer", "unsicher", "unklar", "ohneKind", "nichtRechenbar"].includes(uPaul.urteil)) return null;
  let k = null;
  if (f.typ === "rest" || f.typ === "gleichung") {
    const v = werte(f);
    if (f.typ === "rest") {
      const { a, b } = v.w;
      /* „5 : 18 = 3 R 3“: Zahlen vertauscht, gerechnet aber richtig (Pauls Blatt vom 16.10.2026). */
      if (a < b && b && Math.floor(b / a) === v.paul.c && b % a === v.paul.r) return { k: "rest:" + b + ":" + a, fehler: false, vertauscht: true };
      k = schluessel(f, { a, b });
    } else {
      const luecke = v.pos.length === 1 ? v.pos[0] : "c";
      const w = { ...v.w, op: f.op, luecke };
      if (uPaul.urteil === "falsch" && uEnd.urteil !== "richtig") w[luecke] = uPaul.soll;   // ohne Rotstift: nachgerechnet
      k = schluessel(f, w);
    }
  } else if (f.typ === "ausdruck") {
    const alle = f.terme.concat([f.erg]), n = f.terme.length;
    const pos = alle.map((x, i) => (x.kind ? i : -1)).filter((i) => i >= 0);
    if (pos.length !== 1) return null;
    const luecke = pos[0] === n ? "e" : pos[0];
    const w = alle.map((x) => x.wert);
    const rot = Array.isArray(f.rot) ? f.rot : [];
    if (rot[0] && rot[0].wert != null) w[pos[0]] = rot[0].wert;
    if (uPaul.urteil === "falsch" && uEnd.urteil !== "richtig" && luecke === "e") w[n] = uPaul.soll;
    k = schluessel(f, { terme: w.slice(0, n), ops: f.ops, luecke });
  }
  if (!k) return null;
  if (uPaul.urteil !== "falsch") return { k, fehler: false };
  /* Beleg: rot verbessert UND danach stimmt es – oder die zweite Lesung bestätigt Pauls Zahl. */
  const rotDa = Array.isArray(f.rot) && f.rot.length > 0;
  if (rotDa && uEnd.urteil === "richtig") return { k, fehler: true, beleg: "rot" };
  if (!rotDa && g[feldId(f, uPaul)] === uPaul.final) return { k, fehler: true, beleg: "zweitlesung" };
  return { k, fehler: false, ungeprueft: true };
}

export function malTeilSchluessel(k) {
  if (/^(mal|malp|teil|teilp|rest|pkt|tl|vf):/.test(k)) return true;
  return /^rech:/.test(k) && /[*\/]/.test(k.slice(5));
}

/* Gehört das Blatt zum Probenstoff? */
export function blattDrin(b, felder) {
  const rechenbar = felder.filter((f) => f.typ !== "text" && !f.zwischen);
  if (!rechenbar.length) return { drin: false, warum: "keine Rechenfelder" };
  const malTeil = rechenbar.some((f) => f.typ === "rest" || f.typ === "teiler" || f.typ === "teilerTeil" || f.typ === "vielfache" ||
    (f.typ === "gleichung" && (f.op === "*" || f.op === "/")) || (f.typ === "ausdruck" && f.ops.some((o) => o === "*" || o === "/")));
  if (malTeil) return { drin: true, warum: "Mal/Geteilt/Rest/Teiler" };
  if (b.art === "uebung") return { drin: true, warum: "Übungsblatt der Lehrerin" };
  return { drin: false, warum: "nur Plus/Minus, kein Übungsblatt" };
}

/* Alle Blätter -> { stellen, quellen, blaetter }. eintraege wie aus stoffLesen (neueste zuerst). */
export function blattStoff(eintraege, opt) {
  const von = (opt && opt.von) || VON, bis = (opt && opt.bis) || "9999-12-31";
  const stellen = [], quellen = [], blaetter = [], schonS = new Set(), schonQ = new Set();
  const liste = (eintraege || []).filter((b) => b && String(b.fach || "").toLowerCase().startsWith("mat") && b.sichtbar !== false &&
    String(b.datum || "") >= von && String(b.datum || "") <= bis)
    .sort((x, y) => String(y.datum).localeCompare(String(x.datum)) || String(y.angelegt || "").localeCompare(String(x.angelegt || "")));
  for (const b of liste) {
    const n = b.nachgerechnet;
    const info = { id: b.id, datum: b.datum, titel: String(b.titel || "").slice(0, 60), art: b.art || "" };
    if (!n || !Array.isArray(n.z)) { blaetter.push({ ...info, drin: false, warum: "noch nicht nachgerechnet" }); continue; }
    const ab = abschriftLesen(n.z.join("\n")), si = sollIst(ab);
    const d = blattDrin(b, ab.felder);
    const zahl = { felder: ab.felder.filter((f) => !f.zwischen).length, stoff: 0, fehler: 0, vertauscht: 0, ungeprueft: 0, nichtUebernommen: 0 };
    if (d.drin) {
      for (const f of ab.felder) {
        if (f.zwischen) continue;
        const s = feldStoff(f, n.g || {});
        if (!s) { if (f.typ !== "text") zahl.nichtUebernommen++; continue; }
        /* Auf Mal/Geteilt-Blättern nur Mal/Geteilt-Stoff; Plus/Minus nur von Übungsblättern der Lehrerin. */
        if (d.warum !== "Übungsblatt der Lehrerin" && b.art !== "uebung" && !malTeilSchluessel(s.k)) { zahl.nichtUebernommen++; continue; }
        zahl.stoff++;
        if (s.vertauscht) zahl.vertauscht++;
        if (s.ungeprueft) zahl.ungeprueft++;
        if (s.fehler) {
          zahl.fehler++;
          if (!schonS.has(s.k) && stellen.length < MAX_STELLEN) { schonS.add(s.k); stellen.push({ k: s.k, blatt: b.id, datum: b.datum, beleg: s.beleg }); }
        }
        if (!schonQ.has(s.k) && quellen.length < MAX_QUELLEN) { schonQ.add(s.k); quellen.push({ k: s.k, blatt: b.id, datum: b.datum }); }
      }
    }
    blaetter.push({ ...info, drin: d.drin, warum: d.warum, soll: si.soll, ist: si.ist, voll: si.voll, ...zahl });
  }
  return { stellen, quellen, blaetter };
}
