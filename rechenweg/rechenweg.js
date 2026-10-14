/* Rechenweg-Hilfe (14.10.2026) – reine Logik, für Browser und Node.
 *
 * Anlass: Denny am 14.10.2026, 20:04 Uhr, Foto von Pauls iPad im Probenstoff Mathe,
 * „50 − 9 · 4 = ?“: „Es wäre hilfreich, eine Möglichkeit zum Rechnen zu haben. So was kann
 * Paul noch nicht im Kopf.“ Diese Datei zerlegt eine Aufgabe mit mehreren Rechenzeichen in
 * Zwischenschritte, so wie Paul sie auf dem Blatt aufschreibt:
 *   50 − 9 · 4   →  1. Punkt zuerst: 9 · 4 = 36   2. 50 − 36 = 14
 *   (12 + 8) · 3 →  1. Klammer zuerst: 12 + 8 = 20   2. 20 · 3 = 60
 * Reihenfolge: innerste Klammer zuerst, darin Punkt vor Strich, sonst von links nach rechts.
 *
 * Die Hinweise zu einem falschen Zwischenergebnis kommen in Stufen (Kapitel 044): erst der
 * Denkfehler, wenn er sich erkennen lässt, dann ein Tipp ohne Ergebnis, ab dem zweiten
 * Fehlversuch ein Rechenweg mit offener Lücke, ab dem vierten das Zwischenergebnis zum
 * Abtippen, damit Paul nie feststeckt. Kein w-e-i-l, keine Frage nach dem Grund (Frau Sy).
 *
 *   RW.zerlege("50 − 9 · 4")   -> { schritte:[…], loesung:14 } | null
 *   RW.stimmt(schritt, "36")   -> true/false
 *   RW.hinweis(schritt, versuche, eingabe) -> Satz
 *   RW.schriftlich(schritt)    -> true, wenn untereinander rechnen passt (Plus/Minus, große Zahlen)
 */
(function (wurzel) {
  "use strict";

  var ANZEIGE = { "+": "+", "-": "−", "*": "·", "/": ":" };

  function lexen(text) {
    var t = String(text || "").replace(/[−–—]/g, "-").replace(/[·×⋅]/g, "*").replace(/[:÷]/g, "/")
      .replace(/=\s*\?.*$/, "").replace(/=\s*$/, "");
    var out = [], m, re = /\s*(\d+|[-+*\/()])\s*/y;
    re.lastIndex = 0;
    while (re.lastIndex < t.length) {
      var pos = re.lastIndex;
      m = re.exec(t);
      if (!m || re.lastIndex === pos) { if (/^\s*$/.test(t.slice(pos))) break; return null; }
      var z = m[1];
      out.push(/^\d+$/.test(z) ? { n: +z } : z === "(" || z === ")" ? { k: z } : { o: z });
    }
    return out;
  }
  function gueltig(tok) {
    // Zahl (op Zahl)*, Klammern ausgeglichen, keine leeren Klammern.
    var tiefe = 0, erwarteZahl = true;
    for (var i = 0; i < tok.length; i++) {
      var t = tok[i];
      if (erwarteZahl) {
        if (t.k === "(") { tiefe++; continue; }
        if (t.n == null) return false;
        erwarteZahl = false;
      } else {
        if (t.k === ")") { if (--tiefe < 0) return false; continue; }
        if (!t.o) return false;
        erwarteZahl = true;
      }
    }
    return tiefe === 0 && !erwarteZahl;
  }
  function rechne(a, o, b) {
    if (o === "+") return a + b;
    if (o === "-") return a - b;
    if (o === "*") return a * b;
    if (b === 0) return NaN;
    return a / b;
  }
  function text(tok) {
    var s = "";
    tok.forEach(function (t, i) {
      if (t.k === "(") { s += (s && !/\($/.test(s) ? " " : "") + "("; return; }
      if (t.k === ")") { s += ")"; return; }
      var w = t.n != null ? String(t.n) : ANZEIGE[t.o];
      s += (s && !/\($/.test(s) ? " " : "") + w;
    });
    return s;
  }

  /* Zerlegt in Schritte. Jeder Schritt:
   *   vorher: Tokens vor dem Schritt ({n, von} = Zahl, von = Index des Schritts, der sie lieferte)
   *   von, bis: Tokenbereich der Teilaufgabe in vorher (für die Markierung)
   *   a, o, b, wert, art ("klammer" | "punkt" | "strich"), teil ("9 · 4"), aVon/bVon (Herkunft)
   * Nur, wenn mindestens zwei Rechenzeichen vorkommen, alle Zwischenergebnisse ganze Zahlen
   * ab 0 sind (Klasse 4) und das Ganze sauber lesbar ist. Lieber keine Zerlegung als eine falsche. */
  function zerlege(eingabe) {
    var tok = lexen(eingabe);
    if (!tok || !tok.length || !gueltig(tok)) return null;
    var ops = tok.filter(function (t) { return t.o; }).length;
    if (ops < 2) return null;
    var schritte = [], schutz = 0;
    while (tok.filter(function (t) { return t.o; }).length && schutz++ < 20) {
      // Bereich: innerste Klammer, sonst alles.
      var lo = 0, hi = tok.length, inKlammer = false;
      for (var i = 0; i < tok.length; i++) {
        if (tok[i].k === "(") lo = i + 1;
        if (tok[i].k === ")") { hi = i; inKlammer = true; break; }
      }
      if (!inKlammer) { lo = 0; hi = tok.length; }
      var p = -1;
      for (var j = lo; j < hi; j++) if (tok[j].o === "*" || tok[j].o === "/") { p = j; break; }
      if (p < 0) for (var j2 = lo; j2 < hi; j2++) if (tok[j2].o) { p = j2; break; }
      if (p < 0) {
        // Klammer um eine einzelne Zahl: Klammer weg, kein Schritt.
        tok.splice(hi, 1); tok.splice(lo - 1, 1); continue;
      }
      var A = tok[p - 1], O = tok[p].o, B = tok[p + 1];
      var w = rechne(A.n, O, B.n);
      if (!isFinite(w) || w !== Math.floor(w) || w < 0) return null;
      var art = inKlammer ? "klammer" : (O === "*" || O === "/") && ops > 1 && hatStrich(tok) ? "punkt" : "strich";
      schritte.push({
        vorher: tok.map(function (t) { return Object.assign({}, t); }), von: p - 1, bis: p + 1,
        a: A.n, o: O, b: B.n, aVon: A.von, bVon: B.von, wert: w, art: art,
        teil: A.n + " " + ANZEIGE[O] + " " + B.n, zeichen: ANZEIGE[O]
      });
      tok.splice(p - 1, 3, { n: w, von: schritte.length - 1 });
      // Klammer um eine einzelne Zahl gleich auflösen.
      for (var k = 1; k < tok.length - 1; k++) {
        if (tok[k - 1].k === "(" && tok[k].n != null && tok[k + 1].k === ")") { tok.splice(k + 1, 1); tok.splice(k - 1, 1); k = 0; }
      }
    }
    if (tok.length !== 1 || tok[0].n == null) return null;
    schritte.forEach(function (s, i) { s.nr = i; s.letzter = i === schritte.length - 1; s.ganz = s.von === 0 && s.bis === s.vorher.length - 1; });
    return { schritte: schritte, loesung: tok[0].n, text: text(lexen(eingabe)) };
  }
  function hatStrich(tok) { return tok.some(function (t) { return t.o === "+" || t.o === "-"; }); }

  function titel(s) {
    if (s.art === "klammer") return "Klammer zuerst";
    if (s.art === "punkt") return "Punkt zuerst";
    return s.letzter ? "Jetzt das Ergebnis" : "Von links nach rechts";
  }

  function zahlOder(e) { var t = String(e == null ? "" : e).replace(/\D/g, ""); return t === "" ? null : +t; }
  function stimmt(s, e) { var v = zahlOder(e); return v != null && v === s.wert; }
  function nullen(n) { var z = 0; while (n && n % 10 === 0) { n /= 10; z++; } return z; }
  function reihe(d, bis) { var z = []; for (var i = 1; i * d <= bis && i <= 12; i++) z.push(i * d); return z.join(", "); }

  function denkfehler(s, v) {
    if (v == null) return "";
    if (s.o === "*" && v === s.a + s.b) return "Hier wird malgenommen, nicht plus gerechnet.";
    if (s.o === "+" && v === s.a * s.b && s.a * s.b !== s.a + s.b) return "Hier wird plus gerechnet, nicht malgenommen.";
    if (s.o === "-" && v === s.a + s.b) return "Hier wird minus gerechnet, nicht plus.";
    if (s.o === "+" && v === Math.abs(s.a - s.b)) return "Hier wird plus gerechnet, nicht minus.";
    if (s.o === "/" && v * s.b !== s.a) return "Mach die Probe: " + v + " · " + s.b + " = " + (v * s.b) + ". Das ist nicht " + s.a + ".";
    if (s.o === "*" && nullen(s.a) + nullen(s.b) > 0) {
      var z = nullen(s.a) + nullen(s.b), klein = (s.a / Math.pow(10, nullen(s.a))) * (s.b / Math.pow(10, nullen(s.b)));
      if (v === klein) return z === 1 ? "Die Null fehlt noch." : "Die Nullen fehlen noch.";
      if (v === s.wert * 10) return "Da ist eine Null zu viel.";
    }
    if ((s.o === "+" || s.o === "-") && Math.abs(v - s.wert) === 10) return "Knapp daneben: Schau noch einmal auf die Zehner.";
    if ((s.o === "+" || s.o === "-") && Math.abs(v - s.wert) === 100) return "Knapp daneben: Schau noch einmal auf die Hunderter.";
    return "";
  }
  function stufe1(s) {
    var a = s.a, b = s.b;
    if (s.o === "*") {
      var z = nullen(a) + nullen(b);
      if (z) return "Nullentrick: Rechne erst " + (a / Math.pow(10, nullen(a))) + " · " + (b / Math.pow(10, nullen(b))) + ". Dann hängst du " + (z === 1 ? "die Null" : "die " + z + " Nullen") + " an.";
      var k = Math.min(a, b), g = Math.max(a, b);
      return g <= 10 ? "Denk an die " + k + "er-Reihe." : "Zerlege " + g + " in Zehner und Einer und nimm beide mal " + k + ".";
    }
    if (s.o === "/") {
      if (nullen(a) && nullen(b)) return "Streiche bei beiden Zahlen eine Null. Dann rechnest du " + (a / 10) + " : " + (b / 10) + ".";
      if (nullen(a) && a / 10 % b === 0) return "Rechne erst " + (a / 10) + " : " + b + ". Dann hängst du die Null an.";
      return "Wie oft passt " + b + " in " + a + "? Denk an die " + b + "er-Reihe.";
    }
    if (b < 10) return s.o === "-" ? "Zähl von " + a + " aus " + b + " zurück." : "Zähl von " + a + " aus " + b + " weiter.";
    var hz = b - b % 10, e = b % 10;
    if (b >= 100) return "Rechne Schritt für Schritt: erst die Hunderter, dann die Zehner, dann die Einer. Oder rechne untereinander.";
    return e ? "Rechne in zwei Schritten: erst " + a + " " + s.zeichen + " " + hz + ", dann noch " + s.zeichen + " " + e + "."
      : "Rechne mit den Zehnern: " + (a % 10 === 0 ? (a / 10) + " " + s.zeichen + " " + (b / 10) + ", dann die Null dran." : "Zähl in Zehnerschritten.");
  }
  function stufe2(s) {
    var a = s.a, b = s.b, t = " Tipp es jetzt selbst ein.";
    if (s.o === "*") {
      var za = nullen(a), zb = nullen(b), ka = a / Math.pow(10, za), kb = b / Math.pow(10, zb);
      if (za + zb) return "Schau: " + ka + " · " + kb + " = " + (ka * kb) + ". Jetzt " + (za + zb === 1 ? "die Null" : "die Nullen") + " dran." + t;
      var k = Math.min(a, b), g = Math.max(a, b);
      if (g <= 10) return "Schau: " + (g - 1) + " · " + k + " = " + ((g - 1) * k) + ". Dazu noch einmal " + k + "." + t;
      var gz = g - g % 10, ge = g % 10;
      return "Schau: " + gz + " · " + k + " = " + (gz * k) + " und " + ge + " · " + k + " = " + (ge * k) + ". Zähl beides zusammen." + t;
    }
    if (s.o === "/") {
      if (nullen(a) && nullen(b)) return "Schau: " + (b / 10) + "er-Reihe: " + reihe(b / 10, a / 10) + ". Die wievielte Zahl ist " + (a / 10) + "?" + t;
      if (nullen(a) && a / 10 % b === 0) return "Schau: " + (a / 10) + " : " + b + " = " + (a / 10 / b) + ". Jetzt die Null dran." + t;
      return "Schau: " + b + "er-Reihe: " + reihe(b, a) + ". Die wievielte Zahl ist " + a + "?" + t;
    }
    if (b < 10) {
      var z1 = s.o === "-" ? a - a % 10 : a + (10 - a % 10);
      if (z1 !== a && Math.abs(z1 - a) < b) return "Schau: " + a + " " + s.zeichen + " " + Math.abs(z1 - a) + " = " + z1 + ". Dann noch " + s.zeichen + " " + (b - Math.abs(z1 - a)) + "." + t;
      return "Schau: Zähl in Einerschritten von " + a + " aus." + t;
    }
    var hz = b - b % 10, e = b % 10, zw = s.o === "-" ? a - hz : a + hz;
    if (b >= 100 && b % 100 === 0) {
      if (a % 100 === 0) return "Schau: Rechne mit den Hundertern: " + (a / 100) + " " + s.zeichen + " " + (b / 100) + ". Dann hängst du zwei Nullen an." + t;
      return "Schau: Rechne erst " + a + " " + s.zeichen + " 100. Das machst du " + (b / 100) + "-mal." + t;
    }
    if (b >= 100) {
      var h = b - b % 100, zh = s.o === "-" ? a - h : a + h;
      return "Schau: " + a + " " + s.zeichen + " " + h + " = " + zh + ". Dann noch " + s.zeichen + " " + (b - h) + "." + t;
    }
    if (!e) return a % 10 === 0 ? "Schau: Rechne mit den Zehnern: " + (a / 10) + " " + s.zeichen + " " + (b / 10) + ". Dann hängst du die Null an." + t
      : "Schau: Zähl in Zehnerschritten von " + a + " aus, " + (b / 10) + "-mal." + t;
    return "Schau: " + a + " " + s.zeichen + " " + hz + " = " + zw + ". Dann " + zw + " " + s.zeichen + " " + e + " = ?" + t;
  }
  /* versuche = Zahl der Fehlversuche in diesem Schritt (1 nach dem ersten falschen). */
  function hinweis(s, versuche, e) {
    if (versuche >= 4) return "Das Zwischenergebnis ist " + s.wert + ". Tipp es ein, dann geht es weiter.";
    var d = denkfehler(s, zahlOder(e)), h = versuche >= 2 ? stufe2(s) : stufe1(s);
    return (d ? d + " " : "") + h;
  }
  /* Untereinander rechnen passt bei Plus und Minus mit großen Zahlen (eine dreistellig,
     die andere mindestens zweistellig). Mal und Teilen sind im Probenstoff Zehnerzahlen:
     dort hilft der Nullentrick, kein schriftliches Verfahren. */
  function schriftlich(s) {
    return (s.o === "+" || s.o === "-") && Math.max(s.a, s.b) >= 100 && Math.min(s.a, s.b) >= 10;
  }

  var VERBOTEN = /\bweil\b|warum|begründ/i;

  var RW = { zerlege: zerlege, stimmt: stimmt, hinweis: hinweis, titel: titel, schriftlich: schriftlich,
    text: text, ANZEIGE: ANZEIGE, VERBOTEN: VERBOTEN, zahlOder: zahlOder };
  if (typeof module !== "undefined" && module.exports) module.exports = RW;
  else wurzel.Rechenweg = RW;
})(typeof window !== "undefined" ? window : this);
