/* „💡 Trick“ im Lernquiz (16.10.2026, Kapitel 128). Nur Paul, nur Mathe.
 *
 * Denny, Foto von „Was ergibt 55 : 3?“: „Paul hätte hier gerne Hilfe beim Rechenweg – kleine
 * Stützen oder Tricks. Für ihn ist das alles neu und bekanntlich führen viele Wege ans Ziel.“
 *
 * Regeln statt Modellaufruf: Für jede Aufgabenform, die das Quiz bei Mathe wirklich stellt,
 * baut eine Regel zwei bis drei Wege aus den Zahlen der Frage. Jede Regel rechnet die Lösung
 * selbst aus und vergleicht sie mit der richtigen Antwort des Quiz – passt sie nicht, gibt es
 * keinen Trick. Danach prüft `pruefe()` mechanisch:
 *   - keine Lösungszahl und kein „R …“ in den Wegen (nur Zahlen, die schon in der Frage stehen),
 *   - jede ausgeschriebene Rechnung „a = b + c“ oder „a · b = c“ stimmt,
 *   - kein w-e-i-l und keine Warum-Frage.
 * Fällt ein Weg durch, fliegt er raus; bleibt keiner, gibt es keinen Knopf. Lieber nichts als Unsinn.
 *
 * Browser: window.QuizTrick.erkenne(frage, richtigeAntwort) -> {form, wege:[{titel, zeilen}], probe, auch} | null
 * Node:    module.exports = dasselbe (für pruefe-quiztrick.mjs).
 */
(function (wurzel) {
  "use strict";

  var REIHE = { 2: "Zweier", 3: "Dreier", 4: "Vierer", 5: "Fünfer", 6: "Sechser", 7: "Siebener", 8: "Achter", 9: "Neuner", 10: "Zehner" };
  function reihe(b) { return REIHE[b] ? REIHE[b] + "reihe" : b + "er-Reihe"; }
  function stueck(b) { return REIHE[b] ? REIHE[b] : b + "er"; }

  /* Schreibweisen angleichen: Minuszeichen, Malpunkt, Tausenderpunkt. */
  function norm(t) {
    return String(t || "")
      .replace(/[−–—]/g, "-")
      .replace(/[×⋅∙*]/g, "·")
      .replace(/(\d)\.(\d{3})(?!\d)/g, "$1$2")
      .replace(/\s+/g, " ")
      .trim();
  }
  function zahl(s) { return parseInt(String(s).replace(/\./g, ""), 10); }

  /* Die richtige Antwort lesen: „18 R 1“, „5 R2“, „21 €“, „760“. */
  function antwortLesen(a) {
    var t = norm(a);
    var m = /^(\d+)\s*R\s*(\d+)$/i.exec(t);
    if (m) return { q: zahl(m[1]), r: zahl(m[2]) };
    m = /^(\d+)(\s*(€|Euro|cm|m|kg|g|Stück))?$/i.exec(t);
    if (m) return { wert: zahl(m[1]) };
    return null;
  }

  /* Rechnung mit Punkt vor Strich, nur ganze Zahlen, ohne Klammern. */
  function rechne(ausdruck) {
    var tok = norm(ausdruck).match(/\d+|[+\-·:]/g);
    if (!tok || tok.length % 2 === 0) return null;
    var z = [], o = [];
    for (var i = 0; i < tok.length; i++) {
      if (i % 2 === 0) { if (!/^\d+$/.test(tok[i])) return null; z.push(zahl(tok[i])); }
      else { if (!/^[+\-·:]$/.test(tok[i])) return null; o.push(tok[i]); }
    }
    // erst Punkt
    var zs = [z[0]], os = [];
    for (var k = 0; k < o.length; k++) {
      if (o[k] === "·") zs[zs.length - 1] *= z[k + 1];
      else if (o[k] === ":") { if (z[k + 1] === 0 || zs[zs.length - 1] % z[k + 1]) return null; zs[zs.length - 1] /= z[k + 1]; }
      else { os.push(o[k]); zs.push(z[k + 1]); }
    }
    var e = zs[0];
    for (var j = 0; j < os.length; j++) e = os[j] === "+" ? e + zs[j + 1] : e - zs[j + 1];
    return e;
  }

  function stellen(n) { // [Einer, Zehner, Hunderter, ...]
    var s = String(n).split("").reverse().map(Number);
    return s;
  }
  function teile(n) { // 252 -> [200, 50, 2] ohne Nullen
    var s = String(n), r = [];
    for (var i = 0; i < s.length; i++) { var w = +s[i] * Math.pow(10, s.length - 1 - i); if (w) r.push(w); }
    return r;
  }
  function rund(n, auf) { return Math.round(n / auf) * auf; }

  /* Fragen, deren Kern ein Begriff oder eine Regel ist: kein Trick. „Was rechnest du zuerst?“
     würde sonst genau die Antwort als Trick zeigen. */
  var BEGRIFF = /wie schreibt man|welche stelle|womit|wohin|was bedeutet|wie hei(ß|ss)t (das|der|die) (ergebnis|zahl beim|fachwort)|wie hei(ß|ss)t das ergebnis|zuerst\?|was machst du|schritt beim|wofür|woran|welche ziffer fehlt|quersumme|tausenderbuch|zahlenkette|nachfolger|vorgänger|nachbar|welche malaufgabe|quadratzahl|primzahl|wie viele teiler|welche teiler hat/i;

  /* ---------- Die Regeln, je Aufgabenform ---------- */

  var REGELN = [];

  /* Umkehraufgabe mit Rest: „? : 8 = 4 R7“, „___ : 6 = 4 R 3“. */
  REGELN.push({ form: "umkehr-rest", bau: function (t, A) {
    var m = /(\?|_{2,})\s*:\s*(\d+)\s*=\s*(\d+)\s*R\s*(\d+)/i.exec(t);
    if (!m) return null;
    var b = zahl(m[2]), q = zahl(m[3]), r = zahl(m[4]), x = q * b + r;
    if (!A || A.wert !== x || r >= b) return null;
    return {
      wege: [
        { titel: "Rückwärts rechnen", zeilen: ["Fang beim Ergebnis an: Rechne " + q + " · " + b + ".", "Leg dann den Rest " + r + " dazu."] },
        { titel: "Die Probe umdrehen", zeilen: ["Beim Teilen gilt immer: Ergebnis mal Teiler plus Rest.", "Setz die Zahlen aus der Aufgabe ein."] }
      ],
      probe: "Prüfe: Deine Zahl : " + b + ". Kommt " + q + " Rest " + r + " heraus?",
      auch: q + " · " + b + " = " + (q * b) + " und " + (q * b) + " + " + r + " = " + x + "."
    };
  } });

  /* Platzhalter beim Malnehmen und Teilen: „720 = 9 · ?“, „5 mal welche Zahl ergibt 50?“,
     „Welche Zahl geteilt durch 10 ergibt 49?“ */
  REGELN.push({ form: "platzhalter", bau: function (t, A) {
    var m, a, b, x, art;
    if ((m = /(\d+)\s*=\s*(\d+)\s*·\s*(\?|_{2,})/.exec(t)) || (m = /(\d+)\s*=\s*(\?|_{2,})\s*·\s*(\d+)/.exec(t))) {
      a = zahl(m[1]); b = zahl(/\d/.test(m[2]) ? m[2] : m[3]); art = "mal";
    } else if ((m = /(\d+)\s*mal welche zahl ergibt\s*(\d+)/i.exec(t))) {
      b = zahl(m[1]); a = zahl(m[2]); art = "mal";
    } else if ((m = /(\d+)\s*·\s*(\?|_{2,})\s*=\s*(\d+)/.exec(t)) || (m = /(\?|_{2,})\s*·\s*(\d+)\s*=\s*(\d+)/.exec(t))) {
      b = zahl(/\d/.test(m[1]) ? m[1] : m[2]); a = zahl(m[3]); art = "mal";
    } else if ((m = /welche zahl geteilt durch\s*(\d+)\s*ergibt\s*(\d+)/i.exec(t)) || (m = /(\?|_{2,})\s*:\s*(\d+)\s*=\s*(\d+)(?!\s*R)/i.exec(t))) {
      b = zahl(/\d/.test(m[1]) ? m[1] : m[2]); a = zahl(/\d/.test(m[1]) ? m[2] : m[3]); art = "teil";
    } else return null;
    if (art === "mal") {
      if (!b || a % b) return null; x = a / b;
      if (!A || A.wert !== x) return null;
      var wege = [{ titel: "Umkehraufgabe", zeilen: ["Malnehmen und Teilen sind Freunde.", "Rechne " + a + " : " + b + "."] }];
      if (a % 10 === 0 && b % 10 !== 0 && (a / 10) % b === 0 && a >= 100)
        wege.push({ titel: "Nullentrick", zeilen: ["Denk an die kleine Aufgabe: Welche Zahl mal " + b + " ergibt " + (a / 10) + "?", "Häng dann die Null an."] });
      else if (a % 10 === 0 && b % 10 === 0 && (a / 10) % (b / 10) === 0 && b >= 20)
        wege.push({ titel: "Nullentrick", zeilen: ["Streich bei beiden Zahlen eine Null weg.", "Welche Zahl mal " + (b / 10) + " ergibt " + (a / 10) + "?"] });
      else if (b <= 10)
        wege.push({ titel: "Reihe aufsagen", zeilen: ["Sag die " + reihe(b) + " auf, bis du bei " + a + " bist.", "Zähle mit, wie viele Schritte es waren."] });
      return { wege: wege, probe: "Prüfe: Setz deine Zahl ein. Ergibt " + b + " · Zahl genau " + a + "?",
        auch: a + " : " + b + " = " + x + ", denn " + b + " · " + x + " = " + a + "." };
    }
    x = a * b;
    if (!A || A.wert !== x) return null;
    return {
      wege: [
        { titel: "Umkehraufgabe", zeilen: ["Teilen rückwärts ist Malnehmen.", "Rechne " + a + " · " + b + "."] },
        b === 10 ? { titel: "Nullentrick", zeilen: ["Mal 10 heißt: Häng an " + a + " eine Null an."] }
                 : { titel: "Kleine Aufgabe", zeilen: ["Rechne erst die kleine Malaufgabe mit " + a + " und " + b + " im Kopf."] }
      ],
      probe: "Prüfe: Deine Zahl : " + b + ". Kommt " + a + " heraus?",
      auch: a + " · " + b + " = " + x + ", und " + x + " : " + b + " = " + a + "."
    };
  } });

  /* Teilen: „Was ergibt 55 : 3?“ (mit Rest) und „Was ergibt 180 : 6?“ (glatt). */
  REGELN.push({ form: "teilen", bau: function (t, A) {
    var m = /(?:^|[^\d·:+\-])(\d+)\s*:\s*(\d+)\s*(?:=\s*\?)?\s*\??\s*$/.exec(t.replace(/^(was ergibt|wie viel ist|rechne( im kopf)?:?)\s*/i, " "));
    if (!m || /[+\-·]/.test(t.replace(/\d+\s*:\s*\d+/, ""))) return null;
    var a = zahl(m[1]), b = zahl(m[2]);
    if (!b || b === 1) return null;
    var q = Math.floor(a / b), r = a % b;
    if (r) return restTrick(a, b, q, r, A);
    return glattTrick(a, b, q, A);
  } });

  function restTrick(a, b, q, r, A) {
    if (!A || A.q !== q || A.r !== r) return null;
    var wege = [], auch = "";
    var nullen = a % 10 === 0 && b % 10 === 0;
    if (nullen) {
      wege.push({ titel: "Nullentrick", zeilen: ["Beide Zahlen enden auf 0. Streich bei beiden eine Null weg: " + (a / 10) + " : " + (b / 10) + ".",
        "Das Ergebnis bleibt gleich. Nur der Rest bekommt seine Null zurück."] });
    }
    var m = q >= 10 ? Math.floor(q / 10) * 10 : 0;
    if (m && m !== q && !nullen) {
      var bleibt = a - m * b;
      wege.push({ titel: "Mit der Zehnerzahl starten", zeilen: [m + " · " + b + " = " + (m * b) + ". Das passt sicher hinein.",
        "Es bleiben noch " + a + " - " + (m * b) + " = " + bleibt + ". Wie viele " + stueck(b) + " passen in " + bleibt + "?"] });
      wege.push({ titel: "Zerlegen in leichte Teile", zeilen: [a + " = " + (m * b) + " + " + bleibt + ".",
        "Nimm erst " + (m * b) + " : " + b + ". Teile dann " + bleibt + " durch " + b + ". Was bleibt übrig?"] });
      auch = a + " = " + (m * b) + " + " + bleibt + ". Dann " + (m * b) + " : " + b + " = " + m + " und " + bleibt + " : " + b + " = " + (q - m) + " R " + r +
        ". Zusammen " + q + " R " + r + ".";
    }
    if (b <= 10) {
      wege.push({ titel: "Nächste Malaufgabe suchen", zeilen: ["Welche Zahl mal " + b + " kommt nah an " + a + ", aber nicht drüber?",
        q < 10 ? "Sag die " + reihe(b) + " auf und hör vor " + a + " auf." : "Der Abstand bis " + a + " ist der Rest."] });
    } else {
      wege.push({ titel: "Nächste Malaufgabe suchen", zeilen: ["Welche Zahl mal " + b + " kommt nah an " + a + ", aber nicht drüber?",
        "Der Abstand bis " + a + " ist der Rest."] });
    }
    if (q < 10 && a <= 60)
      wege.push({ titel: "Mit Plättchen", zeilen: ["Mal " + a + " Punkte und kreise immer " + b + " ein.", "Zähle die Kreise. Was übrig bleibt, ist der Rest."] });
    if (!auch) auch = q + " · " + b + " = " + (q * b) + ", und " + (q * b) + " + " + r + " = " + a + ". Also " + q + " R " + r + ".";
    return { wege: wege.slice(0, 3), probe: "Prüfe: Ergebnis · " + b + " + Rest = " + a + "? Der Rest muss kleiner als " + b + " sein.", auch: auch };
  }

  function glattTrick(a, b, q, A) {
    if (!A || A.wert !== q) return null;
    var wege = [], auch = "";
    if (b === 10 && a % 10 === 0) {
      wege.push({ titel: "Nullentrick", zeilen: ["Durch 10 teilen heißt: Streich die Null am Ende weg."] });
      auch = "Null weg: " + a + " : 10 = " + q + ".";
    } else if (a % 10 === 0 && b % 10 === 0) {
      wege.push({ titel: "Nullentrick", zeilen: ["Streich bei beiden Zahlen eine Null weg.", "Rechne dann " + (a / 10) + " : " + (b / 10) + "."] });
      auch = (a / 10) + " : " + (b / 10) + " = " + q + ", also auch " + a + " : " + b + " = " + q + ".";
    } else if (a % 10 === 0 && a >= 100 && (a / 10) % b === 0) {
      wege.push({ titel: "Kleine Aufgabe", zeilen: ["Denk an die kleine Aufgabe " + (a / 10) + " : " + b + ".", "Häng an das Ergebnis die Null wieder an."] });
      auch = (a / 10) + " : " + b + " = " + (q / 10) + ", mit der Null " + q + ".";
    }
    wege.push({ titel: "Umkehraufgabe", zeilen: ["Frag andersherum: Welche Zahl mal " + b + " ergibt " + a + "?"] });
    if (b <= 10 && a <= 100)
      wege.push({ titel: "Reihe aufsagen", zeilen: ["Sag die " + reihe(b) + " auf, bis du bei " + a + " bist.", "Zähle mit, wie viele Schritte es waren."] });
    if (!auch) auch = b + " · " + q + " = " + a + ", also " + a + " : " + b + " = " + q + ".";
    return { wege: wege.slice(0, 3), probe: "Prüfe: Ergebnis · " + b + " = " + a + "?", auch: auch };
  }

  /* Malnehmen: „Wie viel ist 7 · 8?“, „7 · 80“, „3 · 400“. */
  REGELN.push({ form: "mal", bau: function (t, A) {
    var s = t.replace(/^(was ergibt|wie viel ist|rechne( im kopf)?:?|was ist)\s*/i, "");
    var m = /^(\d+)\s*·\s*(\d+)\s*(=\s*\?)?\s*\??$/.exec(s);
    if (!m) return null;
    var a = zahl(m[1]), b = zahl(m[2]), p = a * b;
    if (!A || A.wert !== p || a < 2 || b < 2) return null;
    var wege = [], auch = "";
    var gross = Math.max(a, b), klein = Math.min(a, b);
    if (gross > 10 && gross % 10 === 0 && klein <= 10) {
      var nul = String(gross).match(/0+$/)[0].length, kern = gross / Math.pow(10, nul);
      if (kern <= 10) {
        var ka = a === gross ? kern + " · " + b : a + " · " + kern;
        wege.push({ titel: "Nullentrick", zeilen: ["Rechne die kleine Aufgabe " + ka + ".", nul === 1 ? "Häng dann die Null an." : "Häng dann " + (nul === 2 ? "zwei" : "drei") + " Nullen an."] });
        wege.push({ titel: "In Zehnern denken", zeilen: [klein + " · " + gross + " heißt: " + klein + " mal " + kern + (nul === 1 ? " Zehner." : nul === 2 ? " Hunderter." : " Tausender."),
          "Wie viele " + (nul === 1 ? "Zehner" : nul === 2 ? "Hunderter" : "Tausender") + " sind das zusammen?"] });
        auch = ka + " = " + (klein * kern) + ", Null" + (nul > 1 ? "en" : "") + " dran: " + p + ".";
        return { wege: wege, probe: "Prüfe: Ergebnis : " + klein + " = " + gross + "?", auch: auch };
      }
      return null;
    }
    if (a <= 10 && b <= 10) {
      // x ist der Faktor, der zerlegt wird; y bleibt stehen.
      var x = a >= b ? a : b, y = a >= b ? b : a;
      if (x === 10 || y === 1 || x <= 3) return null;
      if (x > 5) {
        wege.push({ titel: "Zerlegen", zeilen: [a + " · " + b + " = 5 · " + y + " + " + (x - 5) + " · " + y + ".", "Rechne beide Teile und zähle sie zusammen."] });
        auch = "5 · " + y + " = " + (5 * y) + " und " + (x - 5) + " · " + y + " = " + ((x - 5) * y) + ", zusammen " + p + ".";
      }
      if (x % 2 === 0 && x >= 4) {
        wege.push({ titel: "Verdoppeln", zeilen: [x + " · " + y + " ist das Doppelte von " + (x / 2) + " · " + y + ".", "Rechne " + (x / 2) + " · " + y + " und verdopple das Ergebnis."] });
        if (!auch) auch = (x / 2) + " · " + y + " = " + (x / 2 * y) + ", verdoppelt " + p + ".";
      }
      if (x === 9) wege.push({ titel: "Nachbaraufgabe", zeilen: ["Rechne 10 · " + y + ". Das ist leicht.", "Nimm dann einmal " + y + " weg."] });
      else wege.push({ titel: "Nachbaraufgabe", zeilen: ["Rechne " + (x - 1) + " · " + y + ".", "Leg dann noch einmal " + y + " dazu."] });
      if (!auch) auch = (x - 1) + " · " + y + " = " + ((x - 1) * y) + ", und " + ((x - 1) * y) + " + " + y + " = " + p + ".";
      return { wege: wege.slice(0, 3), probe: "Prüfe mit der Umkehraufgabe: Ergebnis : " + y + " = " + x + "?", auch: auch };
    }
    if (klein <= 10 && gross < 1000) {
      var tl = teile(gross);
      if (tl.length < 2) return null;
      wege.push({ titel: "Zerlegen", zeilen: [gross + " = " + tl.join(" + ") + ".", "Nimm jeden Teil mal " + klein + " und zähle zusammen."] });
      wege.push({ titel: "Schritt für Schritt", zeilen: ["Fang mit dem größten Teil an: " + klein + " · " + tl[0] + ".", "Dann den nächsten Teil mal " + klein + "."] });
      auch = tl.map(function (z) { return klein + " · " + z + " = " + (klein * z); }).join(", ") + ", zusammen " + p + ".";
      return { wege: wege, probe: "Prüfe mit Überschlag: " + klein + " · " + rund(gross, gross >= 100 ? 100 : 10) + " liegt nah dran.", auch: auch };
    }
    return null;
  } });

  /* Punkt vor Strich: „Was ergibt 8 · 90 − 38?“ */
  REGELN.push({ form: "punkt-vor-strich", bau: function (t, A) {
    var s = t.replace(/^(was ergibt|wie viel ist|rechne( im kopf)?:?)\s*/i, "").replace(/\s*(=\s*\?)?\s*\??$/, "");
    if (!/^\d+(\s*[+\-·:]\s*\d+){2,}$/.test(s) || !/[·:]/.test(s) || !/[+\-]/.test(s)) return null;
    var w = rechne(s);
    if (w === null || !A || A.wert !== w) return null;
    // Die Punktaufgaben herausziehen
    var pkt = s.match(/\d+(\s*[·:]\s*\d+)+/g) || [];
    var erst = pkt.map(function (p) { return p.replace(/\s+/g, " "); });
    var wege = [
      { titel: "Punkt vor Strich", zeilen: ["Mal und Geteilt kommen zuerst dran: " + erst.join(" und ") + ".", "Danach rechnest du Plus und Minus von links nach rechts."] },
      { titel: "Päckchen machen", zeilen: ["Mal einen Bogen um jede Punktaufgabe. Das ist ein Päckchen.", "Rechne erst die Päckchen aus, dann den Rest."] }
    ];
    var zehner = /(\d+)\s*·\s*(\d+0)\b/.exec(erst[0] || "");
    if (zehner && zahl(zehner[1]) <= 10 && zahl(zehner[2]) % 10 === 0 && zahl(zehner[2]) / 10 <= 10)
      wege.push({ titel: "Nullentrick in der Mitte", zeilen: ["Bei " + zehner[0] + " hilft die kleine Aufgabe " + zehner[1] + " · " + (zahl(zehner[2]) / 10) + ". Häng die Null an.", "Mit diesem Ergebnis rechnest du weiter."] });
    var auch = erst.map(function (p) { return p + " = " + rechne(p); }).join(", ") + ". Dann " +
      s.replace(/\d+(\s*[·:]\s*\d+)+/g, function (p) { return String(rechne(p)); }) + " = " + w + ".";
    return { wege: wege, probe: "Prüfe: Hast du zuerst " + erst.join(" und ") + " gerechnet?", auch: auch };
  } });

  /* Ergänzen: „240 + ? = 1000“, „Welche Zahl ergänzt 846 auf 1000?“ */
  REGELN.push({ form: "ergaenzen", bau: function (t, A) {
    var m = /(\d+)\s*\+\s*(\?|_{2,})\s*=\s*(\d+)/.exec(t) || /ergänzt\s*(\d+)\s*(zu|auf)\s*(\d+)/i.exec(t);
    if (!m) return null;
    var a = zahl(m[1]), z = zahl(m[3]), x = z - a;
    if (x <= 0 || !A || A.wert !== x) return null;
    var naechster = Math.ceil((a + 1) / 100) * 100, zehn = Math.ceil((a + 1) / 10) * 10;
    var wege = [];
    if (a % 10 && zehn < naechster)
      wege.push({ titel: "In Sprüngen", zeilen: ["Spring erst von " + a + " zum nächsten Zehner: " + zehn + ".", "Dann weiter bis " + naechster + ", dann bis " + z + ". Zähle alle Sprünge zusammen."] });
    else if (naechster < z)
      wege.push({ titel: "In Sprüngen", zeilen: ["Spring erst von " + a + " bis zum nächsten Hunderter: " + naechster + ".", "Dann von " + naechster + " bis " + z + ". Zähle beide Sprünge zusammen."] });
    wege.push({ titel: "Umkehraufgabe", zeilen: ["Ergänzen ist Minus andersherum.", "Rechne " + z + " - " + a + "."] });
    return { wege: wege, probe: "Prüfe: " + a + " + Ergebnis = " + z + "?", auch: a + " + " + x + " = " + z + ", also fehlen " + x + "." };
  } });

  /* Plus und Minus mit zwei Zahlen, im Kopf oder schriftlich. */
  REGELN.push({ form: "plusminus", bau: function (t, A) {
    var schr = /schriftlich/i.test(t);
    var s = t.replace(/^.*?(rechne( im kopf| schriftlich| geschickt)?:|wie viel ist|was ist richtig:|was ergibt)\s*/i, "").replace(/\s*(=\s*\?)?\s*\??$/, "");
    var m = /^(\d+)\s*([+\-])\s*(\d+)$/.exec(s);
    if (!m) return null;
    var a = zahl(m[1]), op = m[2], b = zahl(m[3]), w = op === "+" ? a + b : a - b;
    if (w < 0 || !A || A.wert !== w) return null;
    var wort = op === "+" ? "plus" : "minus";
    var wege = [];
    var ea = stellen(a), eb = stellen(b), tl = teile(b);
    var untereinander = { titel: "Untereinander", zeilen: ["Schreib die Zahlen untereinander: Einer unter Einer, Zehner unter Zehner.", "Fang bei den Einern an und geh nach links."] };
    if (schr) {
      wege.push(untereinander);
      if (op === "+" && ea[0] + eb[0] >= 10)
        wege.push({ titel: "Übertrag merken", zeilen: ["Bei den Einern: " + ea[0] + " + " + eb[0] + " ist mehr als 9.", "Schreib den Übertrag klein über die Zehner und zähl ihn dort mit."] });
      else if (op === "-" && ea[0] < eb[0])
        wege.push({ titel: "Entbündeln", zeilen: ["Bei den Einern: " + ea[0] + " - " + eb[0] + " geht nicht.", "Hol dir einen Zehner. Dann hast du 10 Einer mehr."] });
      else if (op === "-" && (ea[1] || 0) < (eb[1] || 0))
        wege.push({ titel: "Entbündeln", zeilen: ["Bei den Zehnern: " + (ea[1] || 0) + " - " + (eb[1] || 0) + " geht nicht.", "Hol dir einen Hunderter. Dann hast du 10 Zehner mehr."] });
      else if (op === "+" && (ea[1] || 0) + (eb[1] || 0) >= 10)
        wege.push({ titel: "Übertrag merken", zeilen: ["Bei den Zehnern wird es mehr als 9.", "Schreib den Übertrag klein über die Hunderter und zähl ihn dort mit."] });
      var auf = Math.max(a, b) >= 100 ? 100 : 10, ra = rund(a, auf), rb = rund(b, auf);
      if (rb > 0 && (ra !== a || rb !== b) && (op === "+" || ra - rb > 0))
        wege.push({ titel: "Überschlag", zeilen: ["Runde zuerst: " + a + " ist ungefähr " + ra + ", " + b + " ist ungefähr " + rb + ".",
          "Rechne " + ra + " " + (op === "+" ? "+" : "-") + " " + rb + ". Das Ergebnis liegt nah dabei."] });
    } else {
      // Kopfrechnen
      if (b % 100 === 99 || b % 100 === 98 || (b % 10 === 9 && b < 100) || (b % 10 === 8 && b < 100 && b > 10)) {
        var r = b % 100 === 99 || (b % 10 === 9 && b < 100) ? b + 1 : b + 2;
        var d = r - b;
        wege.push({ titel: "Nachbaraufgabe", zeilen: [b + " ist fast " + r + ". Rechne " + wort + " " + r + ".",
          op === "+" ? "Nimm dann " + d + " wieder weg." : "Leg dann " + d + " wieder dazu."] });
      }
      if (a % 100 === 0 && b % 100 === 0 && tl.length === 1)
        wege.push({ titel: "In Hundertern denken", zeilen: [a + " sind " + (a / 100) + " Hunderter, " + b + " sind " + (b / 100) + " Hunderter.",
          "Rechne " + (a / 100) + " " + (op === "+" ? "+" : "-") + " " + (b / 100) + " Hunderter."] });
      if (tl.length >= 2)
        wege.push({ titel: "Schritt für Schritt", zeilen: ["Zerlege " + b + " = " + tl.join(" + ") + ".", "Rechne erst " + wort + " " + tl[0] + ", dann " + wort + " " + tl.slice(1).join(", dann " + wort + " ") + "."] });
      if (tl.length === 1) {
        var stelle = String(b).length - 1, namen = ["Einer", "Zehner", "Hunderter"], einh = Math.pow(10, stelle + 1);
        var ohne = (op === "+" && (ea[stelle] || 0) + eb[stelle] < 10) || (op === "-" && (ea[stelle] || 0) >= eb[stelle]);
        if (stelle <= 2 && ohne && !(a % 100 === 0 && b % 100 === 0))
          wege.push({ titel: "Nur eine Stelle", zeilen: ["Bei " + b + " ändern sich nur die " + namen[stelle] + ".", "Rechne " + (ea[stelle] || 0) + " " + (op === "+" ? "+" : "-") + " " + eb[stelle] + " " + namen[stelle] + ". Der Rest bleibt stehen."] });
        else if (stelle <= 1 && !ohne) {
          var glatt = op === "+" ? Math.ceil((a + 1) / einh) * einh : Math.floor((a - 1) / einh) * einh;
          if (glatt > 0 && glatt !== a)
            wege.push({ titel: stelle === 0 ? "Bis zum Zehner" : "Bis zum Hunderter", zeilen: ["Spring erst von " + a + " bis " + glatt + ".",
              "Den Rest von " + b + (op === "+" ? " legst du danach dazu." : " nimmst du danach weg.")] });
        }
      }
      if (a >= 100 && b >= 100 && tl.length >= 2) wege.push(untereinander);
      if (!wege.length) return null;
      if (wege.length < 3) wege.push({ titel: "Umkehraufgabe", zeilen: [op === "+" ? "Du kannst auch rückwärts denken: Ergebnis minus " + b + " muss " + a + " geben." : "Frag andersherum: " + b + " plus wie viel ergibt " + a + "?"] });
    }
    var probe = op === "+" ? "Prüfe mit Minus: Ergebnis - " + b + " = " + a + "?" : "Prüfe mit Plus: Ergebnis + " + b + " = " + a + "?";
    var tlb = tl;
    var auch = tlb.length >= 2 && !schr
      ? a + " " + op + " " + tlb[0] + " = " + (op === "+" ? a + tlb[0] : a - tlb[0]) + ", dann " + op + " " + tlb.slice(1).join(" " + op + " ") + " = " + w + "."
      : op === "+" ? w + " - " + b + " = " + a + ". Die Probe geht auf." : w + " + " + b + " = " + a + ". Die Probe geht auf.";
    return { wege: wege.slice(0, 3), probe: probe, auch: auch };
  } });

  /* Drei und mehr Zahlen plus: „Rechne geschickt: 78 + 569 + 12“. */
  REGELN.push({ form: "plus-kette", bau: function (t, A) {
    var s = t.replace(/^.*?(rechne( im kopf| schriftlich| geschickt)?:|wie viel ist|was ergibt)\s*/i, "").replace(/\s*(=\s*\?)?\s*\??$/, "");
    if (!/^\d+(\s*\+\s*\d+){2,3}$/.test(s)) return null;
    var z = s.split(/\s*\+\s*/).map(zahl), w = z.reduce(function (x, y) { return x + y; }, 0);
    if (!A || A.wert !== w) return null;
    var wege = [], paar = null;
    for (var i = 0; i < z.length && !paar; i++) for (var j = i + 1; j < z.length; j++) if ((z[i] + z[j]) % 10 === 0) { paar = [z[i], z[j]]; break; }
    if (paar) wege.push({ titel: "Freunde suchen", zeilen: [paar[0] + " + " + paar[1] + " ergibt eine glatte Zahl.", "Rechne die beiden zuerst. Dann den Rest dazu."] });
    wege.push({ titel: "Schritt für Schritt", zeilen: ["Rechne erst " + z[0] + " + " + z[1] + ".", "Leg dann " + z.slice(2).join(" und dann ") + " dazu. Schreib dir das Zwischenergebnis auf."] });
    wege.push({ titel: "Untereinander", zeilen: ["Schreib alle Zahlen untereinander, Einer unter Einer.", "Zähl jede Spalte zusammen, fang bei den Einern an."] });
    var auch = paar ? paar[0] + " + " + paar[1] + " = " + (paar[0] + paar[1]) + ", dazu der Rest: " + w + "."
                    : z[0] + " + " + z[1] + " = " + (z[0] + z[1]) + ", dann weiter bis " + w + ".";
    return { wege: wege.slice(0, 3), probe: "Prüfe mit Überschlag: " + z.map(function (x) { return rund(x, 10); }).join(" + ") + " liegt nah dran.", auch: auch };
  } });

  /* Zahlenrätsel rückwärts: „Meine Zahl minus 300, dann plus 60, ergibt 200.“ */
  var OPWORT = [
    [/^plus\s*(\d+)$/i, "+"], [/^minus\s*(\d+)$/i, "-"], [/^(?:mal|·)\s*(\d+)$/i, "·"],
    [/^(?:durch|:)\s*(\d+)(?:\s*geteilt)?$/i, ":"], [/^verdoppelt$/i, "·2"], [/^halbiert$/i, ":2"]
  ];
  function opLesen(s) {
    s = s.trim();
    for (var i = 0; i < OPWORT.length; i++) {
      var m = OPWORT[i][0].exec(s);
      if (m) {
        var o = OPWORT[i][1];
        if (o === "·2") return { o: "·", z: 2, wort: "verdoppelt" };
        if (o === ":2") return { o: ":", z: 2, wort: "halbiert" };
        return { o: o, z: zahl(m[1]) };
      }
    }
    return null;
  }
  var UMKEHR = { "+": "-", "-": "+", "·": ":", ":": "·" };
  var OPNAME = { "+": "plus", "-": "minus", "·": "mal", ":": "geteilt durch" };
  function anwenden(x, o, z) { return o === "+" ? x + z : o === "-" ? x - z : o === "·" ? x * z : (x % z ? NaN : x / z); }

  REGELN.push({ form: "raetsel-rueckwaerts", bau: function (t, A) {
    var m = /meine zahl\s+(.+?),\s*ergibt\s*(\d+)/i.exec(t);
    var ops, ziel;
    if (m) {
      ops = m[1].split(/,\s*dann\s*/i).map(opLesen);
      ziel = zahl(m[2]);
    } else {
      m = /eine zahl,\s*um\s*(\d+)\s*(verkleinert|vergrößert),\s*ergibt\s*(das doppelte|das dreifache|das vierfache|die hälfte)?\s*(?:von\s*)?(\d+)/i.exec(t);
      if (!m) return null;
      ops = [{ o: /verkleinert/i.test(m[2]) ? "-" : "+", z: zahl(m[1]) }];
      var f = { "das doppelte": 2, "das dreifache": 3, "das vierfache": 4 }[String(m[3] || "").toLowerCase()];
      ziel = zahl(m[4]);
      var zielText = m[3] ? m[3] + " von " + ziel : null;
      if (f) ziel = ziel * f; else if (/hälfte/i.test(m[3] || "")) { if (ziel % 2) return null; ziel = ziel / 2; }
    }
    if (ops.some(function (o) { return !o; })) return null;
    var x = ziel;
    for (var i = ops.length - 1; i >= 0; i--) x = anwenden(x, UMKEHR[ops[i].o], ops[i].z);
    if (!isFinite(x) || x < 0 || !A || A.wert !== x) return null;
    var vor = x; ops.forEach(function (o) { vor = anwenden(vor, o.o, o.z); });
    if (vor !== ziel) return null;
    var rueck = ops.slice().reverse().map(function (o) { return OPNAME[UMKEHR[o.o]] + " " + o.z; });
    var wege = [];
    if (zielText) wege.push({ titel: "Erst das Ziel ausrechnen", zeilen: ["Rechne zuerst aus, was herauskommen soll: " + zielText + ".", "Mit dieser Zahl rechnest du dann rückwärts."] });
    wege.push({ titel: "Rückwärts mit Umkehraufgaben", zeilen: ["Fang hinten an" + (zielText ? "" : ": bei " + ziel) + ". Mach jeden Schritt andersherum.",
      "Also " + rueck.join(", dann ") + "."] });
    wege.push({ titel: "Antworten ausprobieren", zeilen: ["Nimm eine Antwort und rechne damit vorwärts: " + ops.map(function (o) { return o.wort || OPNAME[o.o] + " " + o.z; }).join(", dann ") + ".",
      "Kommt " + (zielText || ziel) + " heraus, hast du sie."] });
    var schritte = [], y = ziel;
    ops.slice().reverse().forEach(function (o) { var n = anwenden(y, UMKEHR[o.o], o.z); schritte.push(y + " " + (UMKEHR[o.o] === ":" ? ":" : UMKEHR[o.o]) + " " + o.z + " = " + n); y = n; });
    return { wege: wege.slice(0, 3), probe: "Prüfe: Setz deine Zahl vorne ein und rechne vorwärts. Kommt " + (zielText || ziel) + " heraus?",
      auch: (zielText ? zielText.charAt(0).toUpperCase() + zielText.slice(1) + " ist " + ziel + ". " : "") + "Rückwärts: " + schritte.join(", ") + "." };
  } });

  /* Zahlenrätsel vorwärts: „Verdopple 111 und addiere dann 333.“, „Rechne 25 + 3 und teile das
     Ergebnis durch 7.“, „Bilde den Unterschied von 801 und 563 und addiere 347.“ */
  REGELN.push({ form: "raetsel-vorwaerts", bau: function (t, A) {
    var teil = t.replace(/\s*(was kommt heraus|welche zahl kommt heraus)\s*\??\s*$/i, "").replace(/[.?]\s*$/, "").split(/\s+und\s+(?:dann\s+)?(?=(?:addiere|subtrahiere|teile|dividiere)\b)|,\s*dann\s+/i);
    var x, start, m, s0 = teil[0].trim(), worte = [];
    if ((m = /^verdopple\s*(\d+)$/i.exec(s0))) { x = zahl(m[1]) * 2; worte.push("Verdoppeln heißt mal 2: " + m[1] + " · 2."); start = m[1] + " · 2"; }
    else if ((m = /^halbiere\s*(\d+)$/i.exec(s0))) { if (zahl(m[1]) % 2) return null; x = zahl(m[1]) / 2; worte.push("Halbieren heißt durch 2: " + m[1] + " : 2."); start = m[1] + " : 2"; }
    else if ((m = /^rechne\s*(\d+\s*[+\-·:]\s*\d+)$/i.exec(s0))) { x = rechne(m[1]); start = m[1]; worte.push("Zuerst steht die Rechnung schon da: " + m[1] + "."); }
    else if ((m = /^addiere\s*(?:zu\s*(\d+)\s*die zahl\s*(\d+)|(\d+)\s*zu\s*(\d+))$/i.exec(s0))) {
      var p = m[1] ? [m[1], m[2]] : [m[4], m[3]]; x = zahl(p[0]) + zahl(p[1]); start = p[0] + " + " + p[1]; worte.push("Addieren heißt plus: " + start + ".");
    }
    else if ((m = /^bilde den unterschied von\s*(\d+)\s*und\s*(\d+)$/i.exec(s0))) { x = zahl(m[1]) - zahl(m[2]); start = m[1] + " - " + m[2]; worte.push("Unterschied heißt minus: " + start + "."); }
    else return null;
    if (x === null || x < 0) return null;
    var schritte = [start + " = " + x];
    for (var i = 1; i < teil.length; i++) {
      var s = teil[i].trim(), n;
      if ((m = /^addiere\s*(?:dann\s*)?(\d+)$/i.exec(s))) { n = x + zahl(m[1]); worte.push("Addieren heißt plus " + m[1] + "."); schritte.push(x + " + " + m[1] + " = " + n); }
      else if ((m = /^subtrahiere\s*(?:dann\s*)?(\d+)$/i.exec(s))) { n = x - zahl(m[1]); worte.push("Subtrahieren heißt minus " + m[1] + "."); schritte.push(x + " - " + m[1] + " = " + n); }
      else if ((m = /^(?:teile|dividiere)\s*(?:das ergebnis\s*)?durch\s*(\d+)$/i.exec(s))) { if (x % zahl(m[1])) return null; n = x / zahl(m[1]); worte.push("Teilen heißt durch " + m[1] + "."); schritte.push(x + " : " + m[1] + " = " + n); }
      else return null;
      x = n;
    }
    if (!A || A.wert !== x) return null;
    return {
      wege: [
        { titel: "Wörter übersetzen", zeilen: worte },
        { titel: "Schritt für Schritt", zeilen: ["Rechne nur den ersten Teil und schreib das Zwischenergebnis auf.", "Mit diesem Zwischenergebnis machst du den nächsten Schritt."] }
      ],
      probe: "Prüfe: Hast du jeden Schritt aus der Aufgabe genau einmal gerechnet?",
      auch: schritte.join(", ") + "."
    };
  } });

  /* Teiler und Vielfache, eine Antwort aus vier: „Welche dieser Zahlen ist ein Teiler von 18?“ */
  REGELN.push({ form: "teiler-vielfache", bau: function (t, A, antworten) {
    var m = /welche (?:dieser )?zahl(?:en)? ist ein (teiler|vielfaches) von\s*(\d+)/i.exec(t);
    var w = /welches vielfache von\s*(\d+)\s*kommt nach\s*(\d+)/i.exec(t);
    if (w) {
      var b = zahl(w[1]), v = zahl(w[2]);
      if (v % b || !A || A.wert !== v + b) return null;
      return { wege: [
        { titel: "Einen Schritt weiter", zeilen: ["Vielfache von " + b + " sind die Zahlen der " + reihe(b) + ".", "Geh von " + v + " einen Schritt weiter in der Reihe."] },
        { titel: "Malaufgabe", zeilen: [v + " ist " + (v / b) + " · " + b + ".", "Nimm einmal " + b + " mehr."] }
      ], probe: "Prüfe: Ergebnis : " + b + " geht ohne Rest auf?", auch: v + " + " + b + " = " + (v + b) + "." };
    }
    if (!m || !A) return null;
    var n = zahl(m[2]), art = m[1].toLowerCase();
    var passt = function (z) { return art === "teiler" ? z > 0 && n % z === 0 : z % n === 0; };
    if (!passt(A.wert)) return null;
    var zahlen = (antworten || []).map(function (x) { var a = antwortLesen(x); return a && a.wert; }).filter(function (z) { return typeof z === "number"; });
    if (zahlen.filter(passt).length !== 1) return null;  // genau eine richtige, sonst kein Trick
    if (art === "teiler") return { wege: [
      { titel: "Jede Antwort ausprobieren", zeilen: ["Nimm eine Antwort und rechne " + n + " : Zahl.", "Geht es ohne Rest auf, ist sie ein Teiler."] },
      { titel: "Paare suchen", zeilen: ["Teiler kommen als Paare: Zwei Zahlen mal genommen ergeben " + n + ".", "Welche Antwort findet so einen Partner?"] }
    ], probe: "Prüfe: Deine Zahl · Partner = " + n + "?", auch: n + " : " + A.wert + " = " + (n / A.wert) + ", ohne Rest." };
    var wege = [
      { titel: "Reihe aufsagen", zeilen: ["Vielfache von " + n + " stehen in der " + reihe(n) + ".", "Welche Antwort kommt in der Reihe vor?"] },
      { titel: "Jede Antwort teilen", zeilen: ["Teile jede Antwort durch " + n + ".", "Geht es ohne Rest auf, ist es ein Vielfaches."] }
    ];
    if (n % 10 === 0 && n <= 100) wege[0] = { titel: "Nullentrick", zeilen: ["Vielfache von " + n + " sind Vielfache von " + (n / 10) + " mit einer Null hinten.", "Streich bei jeder Antwort die Null und schau in die " + reihe(n / 10) + "."] };
    return { wege: wege, probe: "Prüfe: Deine Zahl : " + n + " geht ohne Rest auf?", auch: (A.wert / n) + " · " + n + " = " + A.wert + "." };
  } });

  /* Sachaufgaben: keine Zahlen im Trick, nur die drei Fragen und das Signalwort. */
  var EINHEIT = /€|euro|cent|stunde|minute|kinder|stück|kg\b|gramm|meter|\bcm\b|\bkm\b|liter|bonbons|kisten|gruppen|äpfel|hefte|tage\b|wochen|karten|seiten|sticker|murmeln|flaschen|bücher|schüler/i;
  REGELN.push({ form: "sachaufgabe", bau: function (t, A) {
    var zahlen = t.match(/\d+/g) || [];
    if (zahlen.length < 2 || t.length < 35 || !EINHEIT.test(t) || !/\?\s*$/.test(t) || !/[.!]\s+\S/.test(t)) return null;
    if (!A || typeof A.wert !== "number") return null;
    var sig = [];
    if (/\b(eine?|einen|1)\s+(stunde|minute|stück|kind|heft|kiste|tag|woche|flasche|karte)\b/i.test(t.split(/[.!]\s+/).pop()) && /kost|zahl|wieg/i.test(t)) sig.push(["teilen", "Von vielen auf eins schließen heißt teilen."]);
    if (/\bje\b|\bjede[rsnm]?\b/i.test(t)) sig.push(["mal", "„je“ und „jede“ heißen oft: malnehmen."]);
    if (/übrig|bleibt|zurück|weniger/i.test(t)) sig.push(["minus", "„übrig“ und „bleibt“ heißen oft: minus."]);
    if (/verteil|gerecht|gruppen|aufgeteilt/i.test(t)) sig.push(["teilen", "„verteilen“ heißt teilen."]);
    var arten = sig.map(function (s) { return s[0]; }).filter(function (x, i, l) { return l.indexOf(x) === i; });
    var wege = [{ titel: "Drei Fragen", zeilen: ["1. Was weißt du? Such alle Zahlen und was sie bedeuten.", "2. Was ist gesucht? Lies den Fragesatz am Ende.", "3. Welche Rechenart passt?"] }];
    if (arten.length >= 1 && arten.length <= 2) wege.push({ titel: "Signalwort", zeilen: sig.map(function (s) { return s[1]; }).filter(function (x, i, l) { return l.indexOf(x) === i; }) });
    wege.push({ titel: "Skizze", zeilen: ["Mal dir die Aufgabe als kleines Bild oder als Strich-Liste.", "Dann siehst du, ob es mehr oder weniger wird."] });
    return { wege: wege.slice(0, 3), probe: "Prüfe: Passt deine Antwort zur Frage? Schreib einen Antwortsatz mit Einheit.", auch: "" };
  } });

  /* ---------- Mechanische Prüfung ---------- */

  function alleTexte(tr) {
    var t = [];
    (tr.wege || []).forEach(function (w) { t.push(w.titel); (w.zeilen || []).forEach(function (z) { t.push(z); }); });
    if (tr.probe) t.push(tr.probe);
    return t;
  }

  /* Jede ausgeschriebene Gleichung nachrechnen: „55 = 30 + 25“, „10 · 3 = 30“, „55 - 30 = 25“,
     auch mehrere hintereinander. Gibt die falschen zurück. */
  function falscheRechnungen(text) {
    var falsch = [];
    /* Wörter (Ergebnis, Zahl, Rest, dann …) werden zu X: Eine Kette mit X ist keine Rechnung,
       die man nachrechnen kann („Ergebnis − 287 = 419“). „18 R 1“ zählt als ein Wert. */
    var t = norm(text).replace(/\d+\s*R\s*\d+/g, "X").replace(/[A-Za-zÄÖÜäöüß€]+/g, "X");
    var term = "(?:\\d+|X)", op = "\\s*[+\\-·:]\\s*";
    var re = new RegExp(term + "(?:" + op + term + ")*(?:\\s*=\\s*" + term + "(?:" + op + term + ")*)+", "g"), m;
    while ((m = re.exec(t))) {
      if (/X/.test(m[0])) continue;
      var seiten = m[0].split(/\s*=\s*/);
      if (seiten.length < 2) continue;
      var werte = seiten.map(rechne);
      for (var i = 1; i < werte.length; i++) if (werte[i] === null || werte[i - 1] === null || werte[i] !== werte[i - 1]) { falsch.push(m[0]); break; }
    }
    return falsch;
  }

  function pruefe(tr, frage, antwort) {
    var maengel = [];
    var A = antwortLesen(antwort), fz = {};
    (norm(frage).match(/\d+/g) || []).forEach(function (z) { fz[zahl(z)] = 1; });
    var verboten = [];
    if (A && typeof A.q === "number") verboten.push(A.q);
    if (A && typeof A.wert === "number") verboten.push(A.wert);
    var texte = alleTexte(tr);
    texte.forEach(function (s) {
      var n = norm(s);
      if (/\bw\s*e\s*i\s*l\b/i.test(n)) maengel.push("weil: " + s);
      if (/\bwarum\b|\bwieso\b|\bweshalb\b|begründe/i.test(n)) maengel.push("Warum-Frage: " + s);
      (n.match(/\d+/g) || []).forEach(function (z) {
        if (verboten.indexOf(zahl(z)) >= 0 && !fz[zahl(z)]) maengel.push("verrät " + z + ": " + s);
      });
      if (A && typeof A.r === "number" && /\bR\s*\d+/i.test(n)) maengel.push("Rest-Ergebnis: " + s);
      if (A && typeof A.r === "number" && new RegExp("rest\\s*" + A.r + "\\b", "i").test(n) && !new RegExp("rest\\s*" + A.r + "\\b", "i").test(norm(frage))) maengel.push("Rest verraten: " + s);
      falscheRechnungen(s).forEach(function (r) { maengel.push("falsch gerechnet: " + r); });
    });
    // Auch der Satz nach dem Antworten muss stimmen (er darf die Lösung zeigen).
    if (tr.auch) {
      if (/\bw\s*e\s*i\s*l\b|\bwarum\b/i.test(tr.auch)) maengel.push("weil/warum nach dem Antworten: " + tr.auch);
      falscheRechnungen(tr.auch.replace(/(\d+)\s*R\s*(\d+)/g, "$1R$2")).forEach(function (r) { maengel.push("falsch gerechnet (danach): " + r); });
    }
    return maengel;
  }

  /* Ein Weg, der durch die Prüfung fällt, fliegt raus. Bleibt keiner: null. */
  function erkenne(frage, antwort, antworten) {
    var t = norm(frage);
    if (!t || BEGRIFF.test(t)) return null;
    var A = antwortLesen(antwort);
    for (var i = 0; i < REGELN.length; i++) {
      var tr;
      try { tr = REGELN[i].bau(t, A, antworten); } catch (e) { tr = null; }
      if (!tr) continue;
      tr.form = REGELN[i].form;
      tr.wege = (tr.wege || []).filter(function (w) {
        return w && w.zeilen && w.zeilen.length && !pruefe({ wege: [w] }, frage, antwort).length;
      });
      if (!tr.wege.length) return null;
      if (tr.probe && pruefe({ wege: [], probe: tr.probe }, frage, antwort).length) tr.probe = "";
      if (tr.auch && pruefe({ wege: [], auch: tr.auch }, frage, antwort).length) tr.auch = "";
      // Minus wird für das Kind wieder mit dem richtigen Zeichen geschrieben.
      var schoen = function (s) { return String(s).replace(/(\d|\s)-(\s|\d)/g, "$1−$2"); };
      tr.wege.forEach(function (w) { w.zeilen = w.zeilen.map(schoen); });
      tr.probe = schoen(tr.probe || ""); tr.auch = schoen(tr.auch || "");
      return tr;
    }
    return null;
  }

  var QT = { erkenne: erkenne, pruefe: pruefe, rechne: rechne, antwortLesen: antwortLesen, falscheRechnungen: falscheRechnungen };
  if (typeof module !== "undefined" && module.exports) module.exports = QT;
  else wurzel.QuizTrick = QT;
})(typeof window !== "undefined" ? window : this);
