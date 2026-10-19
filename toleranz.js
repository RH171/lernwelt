/* Toleranter Antwortvergleich fuer freie Eingaben (18.10.2026).
 *
 * Anlass: Denny am 18.10.2026 - Helenas inhaltlich richtige Antworten wurden
 * als falsch gewertet, weil Wortlaut oder Schreibweise abwichen. In "Uebung
 * zum Blatt" ist das seitdem geloest (foto-uebung.js + Sinnpruefung). Der
 * Vokabeltrainer, das Hausaufgaben-Heft und das Uebungsspiel verglichen
 * weiter Buchstabe fuer Buchstabe. Diese Datei ist EINE Regel fuer alle drei.
 *
 *   LWToleranz.pruefen(gegeben, soll, opt)
 *     -> { stufe: "gut" | "fast" | "schlecht" | "offen", treffer, grund }
 *        "fast" zaehlt als richtig, die Seite zeigt aber die richtige
 *        Schreibweise deutlich (LWToleranz.zeigen).
 *
 *   opt.sprache   "en" | "fr" | "de" (Kurzformen nur en, Artikelregel je Sprache)
 *   opt.trennen   "alle"  -> "/", ",", ";" und "oder" trennen Loesungen
 *                 "wenig" -> nur "/", ";" und "oder" (Standard)
 *                 "keine" -> nichts trennen (Paare wie "sur / sous" = "auf / unter"),
 *                 Klammerteile bleiben trotzdem freiwillig
 *                 Zwischen Ziffern wird nie getrennt ("3/4", "3,5").
 *   opt.verboten  Liste von Antworten, die sicher FALSCH sind (die anderen
 *                 Auswahlknoepfe, bekannte Fehler, die Falschform, die
 *                 verbessert werden soll). Liegt die Eingabe naeher an einer
 *                 davon, gibt es kein "fast".
 *   opt.tippfehler false schaltet die Tippfehler-Stufe ab.
 *   opt.artikelPflicht  hat das Soll einen Artikel, muss genau dieser dastehen
 *                 (Hausaufgaben-Verbesserung: "den Hund" ist dort der Lernpunkt).
 *   opt.artikelEgal  (nicht fr) auch ein ANDERER Artikel ist egal - so hielt
 *                 es der Vokabeltrainer schon immer ("the apple" = "an apple"); dort zaehlt
 *                 auch "to" vor Verben als Artikel ("run" = "to run").
 *   opt.zusatzWorte  die Loesung steht vollstaendig in der Eingabe, drumherum
 *                 bis zu drei weitere Woerter ("nutzung der reichskirche" fuer
 *                 "Reichskirche", Helena 18.10.2026) -> "fast". Nur in
 *                 Sachfaechern einschalten; im Vokabeltrainer waere
 *                 "I see a sheep" fuer "sheep" zu grosszuegig.
 *
 * Was bleibt falsch (mit Absicht):
 *   - ein falscher Artikel, wenn beide einen haben ("die Hund", "la garçon")
 *   - in Franzoesisch ein fehlender Artikel, wenn das Soll einen hat
 *   - andere Ziffern ("1998" statt "1999"), andere Verneinung ("eine"/"keine")
 *   - ein anderer erster Buchstabe ("possible" statt "impossible")
 * NICHT benutzt in den BET-Korrekturtexten: Teil II ahndet Rechtschreibung.
 */
(function (wurzel) {
  "use strict";

  var ARTIKEL_DE_EN = ["der", "die", "das", "den", "dem", "des", "ein", "eine", "einen",
    "einem", "einer", "eines", "the", "a", "an"];
  var ARTIKEL_FR = ["le", "la", "les", "l", "un", "une", "des", "du", "de la", "de l"];
  var VERNEINUNG = { nicht: 1, kein: 1, keine: 1, keinen: 1, keinem: 1, keiner: 1, keines: 1,
    nie: 1, niemals: 1, not: 1, no: 1, never: 1, ne: 1, pas: 1, jamais: 1, n: 1 };
  /* Woerter, die neben der Loesung alles umdrehen oder eine zweite Antwort
     anhaengen. Steht eines davon zusaetzlich da, zaehlt die Antwort nicht:
     "Hausmacht statt Reichskirche", "geistliche oder weltliche", "Ring und
     Stab" sind keine Antwort auf EINE Frage (18.10.2026). */
  var GEGENSATZ = { statt: 1, anstatt: 1, oder: 1, sondern: 1, ausser: 1, entweder: 1,
    weder: 1, vielleicht: 1, eventuell: 1, evtl: 1, bzw: 1, beziehungsweise: 1, und: 1,
    or: 1, and: 1, instead: 1, either: 1, maybe: 1, et: 1, ou: 1 };

  /* Kurzformen (nur Englisch). "can't", "cannot" und "can not" sind gleich. */
  var KURZ = [
    [/\bcan't\b/g, "can not"], [/\bcannot\b/g, "can not"], [/\bwon't\b/g, "will not"],
    [/\bshan't\b/g, "shall not"], [/\bain't\b/g, "is not"],
    [/\b(do|does|did|is|are|was|were|has|have|had|could|would|should|must|need|might)n't\b/g, "$1 not"],
    [/\bi'm\b/g, "i am"], [/\b(you|we|they|who|what)'re\b/g, "$1 are"],
    [/\b(i|you|we|they|who)'ve\b/g, "$1 have"],
    [/\b(i|you|he|she|it|we|they|that|there|who)'ll\b/g, "$1 will"],
    [/\blet's\b/g, "let us"]
  ];
  /* Ohne Apostroph getippt ("dont", "im") - nur wenn sicher Englisch geuebt
     wird, sonst waere das deutsche "im" ploetzlich "i am". */
  var KURZ_OHNE = [
    [/\b(do|does|did|is|are|was|were|has|have|had|could|would|should|must)nt\b/g, "$1 not"],
    [/\bcant\b/g, "can not"], [/\bim\b/g, "i am"], [/\bive\b/g, "i have"],
    [/\byoure\b/g, "you are"], [/\btheyre\b/g, "they are"]
  ];
  /* 's und 'd sind mehrdeutig (is/has, would/had): beide Lesarten gelten. */
  function kurzformen(s, sprache) {
    var t = s;
    KURZ.forEach(function (k) { t = t.replace(k[0], k[1]); });
    if (sprache === "en") KURZ_OHNE.forEach(function (k) { t = t.replace(k[0], k[1]); });
    var raus = [t];
    if (/\b(he|she|it|that|there|what|who|where|here)'s\b/.test(t)) {
      raus = [t.replace(/\b(he|she|it|that|there|what|who|where|here)'s\b/g, "$1 is"),
              t.replace(/\b(he|she|it|that|there|what|who|where|here)'s\b/g, "$1 has")];
    }
    var mitD = [];
    raus.forEach(function (x) {
      if (/\b(i|you|he|she|it|we|they)'d\b/.test(x)) {
        mitD.push(x.replace(/\b(i|you|he|she|it|we|they)'d\b/g, "$1 would"));
        mitD.push(x.replace(/\b(i|you|he|she|it|we|they)'d\b/g, "$1 had"));
      } else mitD.push(x);
    });
    return mitD;
  }

  function grund(s) {
    return String(s == null ? "" : s).toLowerCase()
      .replace(/[’‘`´]/g, "'")
      .replace(/\s+/g, " ").trim();
  }
  /* Satzzeichen weg; der Apostroph wird im Franzoesischen zur Luecke
     ("l'élève" = "l élève"), sonst faellt er weg ("Tom's" = "Toms"). */
  function schlicht(s, sprache) {
    return grund(s)
      .replace(/'/g, sprache === "fr" ? " " : "")
      .replace(/[.,;:!?"„“”»«()\[\]¿¡]/g, " ")
      .replace(/\s+/g, " ").trim();
  }
  function ohneAkzent(s) {
    var t = s;
    try { t = t.normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) {}
    return t;
  }
  /* ä = ae, ö = oe, ü = ue, ß = ss gilt im Deutschen als richtig geschrieben
     (Paul, 07.09.2026: die Tastatur hatte keine Umlaute). */
  function umschrift(s) {
    return s.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
  }

  function artikelAb(s, sprache, mitTo) {
    var liste = sprache === "fr" ? ARTIKEL_FR : (mitTo ? ARTIKEL_DE_EN.concat(["to"]) : ARTIKEL_DE_EN);
    for (var i = 0; i < liste.length; i++) {
      var a = liste[i] + " ";
      if (s.indexOf(a) === 0 && s.length > a.length) return [liste[i], s.slice(a.length)];
    }
    return ["", s];
  }

  /* Loesungen aufteilen: "(to) run / to race" -> run, to run, to race. */
  function varianten(soll, opt) {
    var roh = String(soll == null ? "" : soll).trim();
    if (!roh) return [];
    /* Trennzeichen von Hand suchen statt mit Lookbehind - aeltere Safari
       (iPad) kennen (?<!...) nicht, und dann liefe die ganze Datei nicht. */
    /* In Klammern wird nie getrennt: "les vacances (f, pl)" bleibt ganz. */
    var zeichen = opt.trennen === "alle" ? ";,/" : opt.trennen === "keine" ? "" : ";/";
    var teile = [roh], stueck = "", k, c, tiefe = 0;
    for (k = 0; k < roh.length; k++) {
      c = roh[k];
      if (c === "(") tiefe++;
      if (c === ")") tiefe = Math.max(0, tiefe - 1);
      var zifferUm = /\d/.test(roh[k - 1] || "") && /\d/.test(roh[k + 1] || "");
      if (zeichen && zeichen.indexOf(c) >= 0 && !zifferUm && !tiefe) { teile.push(stueck); stueck = ""; }
      else stueck += c;
    }
    teile.push(stueck);
    if (opt.trennen !== "keine")
      teile = teile.reduce(function (acc, t) { return acc.concat(String(t).split(/\s+oder\s+/)); }, []);
    var raus = [];
    teile.forEach(function (t) {
      t = String(t || "").trim();
      if (!t) return;
      if (/\(.*\)/.test(t)) {
        raus.push(t.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim());
        raus.push(t.replace(/[()]/g, "").replace(/\s+/g, " ").trim());
      } else raus.push(t);
    });
    return raus.filter(function (t, i) { return t && raus.indexOf(t) === i; });
  }

  function abstand(a, b) {
    if (a === b) return 0;
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) d[i] = [i];
    for (j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      /* Zwei vertauschte Buchstaben ("recieve") sind EIN Tippfehler. */
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[a.length][b.length];
  }
  function erlaubt(soll) {
    var n = soll.replace(/ /g, "").length;
    return n >= 8 ? 2 : n >= 4 ? 1 : 0;
  }
  function ziffern(s) { return (s.match(/\d+/g) || []).join(" "); }
  function verneinung(s) {
    return s.split(" ").filter(function (w) { return VERNEINUNG[w]; }).sort().join(" ");
  }

  /* Ist die Loesung nur eine Zahl ("19.", "12", "3,5"), zaehlt nur die Zahl:
     "19. Jahrhundert", "19.Jahundert", "3,5 kg" sind richtig. Stehen zwei
     Zahlen da, bleibt es falsch - sonst ginge "18 oder 19" durch. */
  function nurZahl(s) {
    var m = String(s == null ? "" : s).trim().match(/^(\d+(?:[.,]\d+)?)\.?$/);
    return m ? Number(m[1].replace(",", ".")) : null;
  }
  function zahlenIn(s) {
    return (String(s == null ? "" : s).match(/\d+(?:[.,]\d+)?/g) || [])
      .map(function (z) { return Number(z.replace(",", ".")); });
  }

  /* Alle Lesarten einer Eingabe, fertig zum Vergleichen. */
  function formen(s, sprache) {
    var g = grund(s);
    var liste = (sprache === "fr" || sprache === "de") ? [g] : kurzformen(g, sprache);
    return liste.map(function (x) {
      var t = schlicht(x, sprache);
      if (sprache !== "fr") t = umschrift(t);
      return t;
    });
  }

  function vergleicheEins(gegeben, soll, opt) {
    var sp = opt.sprache || "";
    var gf = formen(gegeben, sp), sf = formen(soll, sp);
    var i, j, g, r, ga, ra, best = null;
    for (i = 0; i < gf.length; i++) for (j = 0; j < sf.length; j++) {
      g = gf[i]; r = sf[j];
      if (g === r) return { stufe: "gut", grund: "gleich" };
      ga = artikelAb(g, sp, opt.artikelEgal); ra = artikelAb(r, sp, opt.artikelEgal);
      /* Artikel: in de/en ist ein fehlender oder zusaetzlicher Artikel kein
         Fehler, ein ANDERER schon. In fr gehoert der Artikel zum Wort. */
      var artikelOk;
      if (sp === "fr" || opt.artikelPflicht) artikelOk = ra[0] ? ga[0] === ra[0] : true;
      else if (opt.artikelEgal) artikelOk = true;
      else artikelOk = !ga[0] || !ra[0] || ga[0] === ra[0];
      if (!artikelOk) continue;
      if (ga[1] === ra[1]) return { stufe: "gut", grund: "artikel" };
      var ka = ohneAkzent(ga[1]), kr = ohneAkzent(ra[1]);
      if (ka === kr) best = best || { stufe: "fast", grund: "akzent" };
      else if (opt.tippfehler !== false && ka && kr && ka[0] === kr[0] &&
               ziffern(ka) === ziffern(kr) && verneinung(ka) === verneinung(kr)) {
        var d = abstand(ka, kr);
        if (d > 0 && d <= erlaubt(kr) && (!best || best.d > d)) best = { stufe: "fast", grund: "tippfehler", d: d };
      }
    }
    return best;
  }

  /* ---------- Ein Wort dazugeschrieben ----------
     Helena am 18.10.2026: "Dort das rote / das falsche ist doch eigentlich
     richtig, sowas passiert oefter wenn ich ein Wort dazu schreibe." Sie
     hatte "nutzung der reichskirche" getippt, gesucht war "Reichskirche".
     Steht die Loesung vollstaendig als Wortfolge in der Eingabe und stehen
     hoechstens drei weitere Woerter drumherum, ist das dieselbe Antwort.
     Es bleibt falsch, wenn eines der zusaetzlichen Woerter den Sinn dreht
     oder eine zweite Antwort anhaengt (GEGENSATZ, VERNEINUNG), wenn eine
     Zahl dazukommt, oder wenn eine sicher falsche Antwort (opt.verboten)
     mit in der Eingabe steht. */
  function stelleIm(gw, rw) {
    for (var i = 0; i + rw.length <= gw.length; i++) {
      var passt = true;
      for (var j = 0; j < rw.length; j++) if (gw[i + j] !== rw[j]) { passt = false; break; }
      if (passt) return i;
    }
    return -1;
  }
  function zusatzTreffer(gegeben, alle, opt) {
    var sp = opt.sprache || "", k, i;
    var gf = formen(gegeben, sp);
    var verboten = (opt.verboten || []).filter(function (v) { return v != null && String(v).trim(); });
    for (k = 0; k < alle.length; k++) {
      var rf = formen(alle[k], sp);
      for (i = 0; i < rf.length; i++) {
        var rw = ohneAkzent(rf[i]).split(" ").filter(Boolean);
        if (!rw.length || rw.join("").length < 4) continue;
        for (var m = 0; m < gf.length; m++) {
          var gw = ohneAkzent(gf[m]).split(" ").filter(Boolean);
          var stelle = stelleIm(gw, rw);
          if (stelle < 0) continue;
          var extra = gw.slice(0, stelle).concat(gw.slice(stelle + rw.length));
          if (!extra.length || extra.length > 3) continue;
          var schlimm = extra.some(function (w) {
            return VERNEINUNG[w] || GEGENSATZ[w] || /\d/.test(w);
          });
          if (schlimm) continue;
          /* Steht eine sicher falsche Antwort mit in der Eingabe, hat das
             Kind zwei Moeglichkeiten genannt statt sich zu entscheiden. */
          var auchFalsch = verboten.some(function (v) {
            if (alle.some(function (a) { return schlicht(a, sp) === schlicht(v, sp); })) return false;
            return formen(v, sp).some(function (y) {
              var vw = ohneAkzent(y).split(" ").filter(Boolean);
              return vw.length && vw.join("").length >= 3 && stelleIm(gw, vw) >= 0;
            });
          });
          if (auchFalsch) continue;
          return alle[k];
        }
      }
    }
    return null;
  }

  function pruefen(gegeben, soll, opt) {
    opt = opt || {};
    if (!schlicht(gegeben, opt.sprache)) return { stufe: "offen", treffer: String(soll == null ? "" : soll), grund: "" };
    var alle = varianten(soll, opt);
    var i, e, fast = null;

    var zSoll = alle.map(nurZahl).filter(function (z) { return z !== null; });
    if (zSoll.length) {
      var hat = zahlenIn(gegeben);
      if (hat.length === 1 && zSoll.indexOf(hat[0]) >= 0)
        return { stufe: "gut", treffer: String(soll), grund: "zahl" };
    }
    for (i = 0; i < alle.length; i++) {
      e = vergleicheEins(gegeben, alle[i], opt);
      if (e && e.stufe === "gut") return { stufe: "gut", treffer: alle[i], grund: e.grund };
      if (e && (!fast || (e.d || 0) < (fast.d || 0))) { fast = e; fast.treffer = alle[i]; }
    }
    if (!fast) {
      var z = opt.zusatzWorte ? zusatzTreffer(gegeben, alle, opt) : null;
      if (z) return { stufe: "fast", treffer: z, grund: "zusatz" };
      return { stufe: "schlecht", treffer: String(soll == null ? "" : soll), grund: "" };
    }

    /* Liegt die Eingabe genauso nah oder naeher an einer sicher falschen
       Antwort (anderer Knopf, bekannter Fehler, die Falschform selbst),
       ist sie kein Tippfehler, sondern genau dieser Fehler. */
    var verboten = (opt.verboten || []).filter(function (v) { return v != null && String(v).trim(); });
    if (verboten.length) {
      var sp = opt.sprache || "";
      var gk = formen(gegeben, sp).map(function (x) { return ohneAkzent(artikelAb(x, sp)[1]); });
      var dSoll = Math.min.apply(null, gk.map(function (x) {
        return Math.min.apply(null, formen(fast.treffer, sp).map(function (y) { return abstand(x, ohneAkzent(artikelAb(y, sp)[1])); }));
      }));
      for (i = 0; i < verboten.length; i++) {
        var v = verboten[i];
        var gleichSoll = alle.some(function (a) { return schlicht(a, sp) === schlicht(v, sp); });
        if (gleichSoll) continue;
        var dV = Math.min.apply(null, gk.map(function (x) {
          return Math.min.apply(null, formen(v, sp).map(function (y) { return abstand(x, ohneAkzent(artikelAb(y, sp)[1])); }));
        }));
        if (dV <= dSoll) return { stufe: "schlecht", treffer: String(soll), grund: "verboten" };
      }
    }
    return { stufe: "fast", treffer: fast.treffer, grund: fast.grund };
  }

  /* ---------- Unterschied sichtbar machen ----------
     Wie unterschied() in foto-uebung.js: Buchstaben, die in der richtigen
     Antwort fehlen, stehen fett, groesser, unterstrichen und GROSS da
     ("HerrschaftSrechte"); zu viele in "Du hattest" durchgestrichen. Bei
     reinen Akzenten ohne Grossbuchstaben (sonst stuende "ÉlÈve" da).
     Nur bei Verschreibern (hoechstens 2 Zeichen daneben), sonst null. */
  function unterschied(gegeben, richtig) {
    var a = String(gegeben || "").trim(), b = String(richtig || "").trim();
    var al = a.toLowerCase(), bl = b.toLowerCase();
    var n = al.length, m = bl.length;
    if (!n || !m || n > 80 || m > 80) return null;
    if (abstand(al, bl) > 2) return null;
    var T = [], i, j;
    for (i = 0; i <= n; i++) T.push(new Array(m + 1).fill(0));
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--)
      T[i][j] = al[i] === bl[j] ? T[i + 1][j + 1] + 1 : Math.max(T[i + 1][j], T[i][j + 1]);
    var ga = [], ra = [];
    i = 0; j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && al[i] === bl[j]) { ga.push([a[i], 0]); ra.push([b[j], 0]); i++; j++; }
      else if (j < m && (i >= n || T[i][j + 1] >= T[i + 1][j])) { ra.push([b[j], 1]); j++; }
      else { ga.push([a[i], 1]); i++; }
    }
    return { gegeben: ga, richtig: ra };
  }

  var STIL = ".lwt-neu{font-weight:900;font-size:1.3em;text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:3px}" +
    ".lwt-zuviel{text-decoration:line-through;text-decoration-thickness:2px;opacity:.85}" +
    ".lwt-box{margin-top:12px;font-size:18px;line-height:1.45;font-weight:600;text-align:left}" +
    ".lwt-zeile{display:block;margin-top:4px}.lwt-wo{display:block;font-size:15px;font-weight:700;opacity:.8}";
  function stilEinmal(doc) {
    if (!doc || doc.getElementById("lwt-stil")) return;
    var s = doc.createElement("style");
    s.id = "lwt-stil";
    s.textContent = STIL;
    (doc.head || doc.documentElement).appendChild(s);
  }
  function malen(doc, teile, klasse, gross) {
    var f = doc.createDocumentFragment(), puffer = "";
    function raus() { if (puffer) { f.appendChild(doc.createTextNode(puffer)); puffer = ""; } }
    teile.forEach(function (t) {
      if (!t[1] || t[0] === " ") { puffer += t[0]; return; }
      raus();
      var sp = doc.createElement("span");
      sp.className = klasse;
      sp.textContent = gross ? t[0].toUpperCase() : t[0];
      f.appendChild(sp);
    });
    raus();
    return f;
  }
  /* Haengt "Du hattest: … / So schreibt man es: …" an ein Element.
     Farben erbt der Kasten - hell und dunkel bleiben, wie sie sind. */
  function zeigen(ziel, gegeben, richtig, opt) {
    opt = opt || {};
    var doc = ziel.ownerDocument;
    stilEinmal(doc);
    var box = doc.createElement("div");
    box.className = "lwt-box";
    var u = unterschied(gegeben, richtig);
    var nurAkzent = ohneAkzent(String(gegeben).toLowerCase().trim()) === ohneAkzent(String(richtig).toLowerCase().trim());
    function zeile(wo, inhalt) {
      var z = doc.createElement("span");
      z.className = "lwt-zeile";
      var w = doc.createElement("span");
      w.className = "lwt-wo";
      w.textContent = wo;
      z.appendChild(w);
      if (typeof inhalt === "string") z.appendChild(doc.createTextNode(inhalt));
      else z.appendChild(inhalt);
      box.appendChild(z);
    }
    zeile("Du hattest:", u ? malen(doc, u.gegeben, "lwt-zuviel", false) : String(gegeben));
    zeile(opt.wo || "So schreibt man es:", u ? malen(doc, u.richtig, "lwt-neu", !nurAkzent) : String(richtig));
    ziel.appendChild(box);
    return box;
  }

  var LWToleranz = { pruefen: pruefen, varianten: varianten, unterschied: unterschied,
    zeigen: zeigen, abstand: abstand };
  if (typeof module !== "undefined" && module.exports) module.exports = LWToleranz;
  else wurzel.LWToleranz = LWToleranz;
})(typeof window !== "undefined" ? window : this);
