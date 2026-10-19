/* Vokabel-Logik: Datenmodell und Abfragelogik fuer Helenas Vokabeltrainer
 * (19.10.2026). Sprachunabhaengig, reine Funktionen, keine Oberflaeche,
 * kein Speichern. Im Browser window.VokabelLogik, in Node require().
 *
 * Anlass: Dennys Anforderungsliste vom 19.10.2026 (befunde/2026-10-19-
 * helena-vokabeltrainer-anforderungen.md) und die Antworten auf die
 * Rueckfragen (befunde/2026-10-19-helena-vokabeltrainer-antworten.md,
 * 20:58 Uhr). Denny will die Logik erst erklaert bekommen, bevor die
 * Oberflaeche umgebaut wird - trainer.js benutzt dieses Modul noch nicht.
 *
 * ENTSCHIEDEN (Denny, 19.10.2026):
 *   - Wertung ueberall streng. Jeder Tippfehler, jeder Akzent ist falsch.
 *     Kein Fehler: Leerzeichen vorn/hinten/doppelt, Apostroph-Zeichen, eine
 *     von mehreren Uebersetzungen, Klammerinhalt im Soll, "to " vor
 *     englischen Verben. Gross/klein nur, wo das Soll gross ist. Artikel-
 *     und Akzentfehler haben eigene Arten. /toleranz.js gilt hier NICHT.
 *     Die Fehlerstelle wird neutral markiert (unterstrichen, gelb), nie rot.
 *   - Abstaende: die bisherigen Faecher 1/3/7/16/35 Tage sind "Normal",
 *     "Intensiv" 0,6-fach, "Entspannt" 1,4-fach (gerundet), eigene Werte
 *     hoechstens 60. Nach dem letzten Fach bleibt der letzte Abstand, die
 *     Wiederholung endet nie.
 *   - Ein Wort darf in EINER Sitzung von Stufe 1 bis "gelernt" kommen;
 *     einzige Bedingung: mindestens 3 andere Abfragen dazwischen. X-mal
 *     Stufe 3 in Folge zaehlt ueber Sitzungen, jeder Fehler setzt auf 0.
 *   - Fehler im Ordner: Stufe 2, raus aus dem Ordner. Fehler in Stufe 2:
 *     Stufe 1, beide Richtungen offen. Endet die Sitzung vor Richtung b,
 *     kommt b in der naechsten Sitzung bevorzugt.
 *   - Sitzung: ein Upload wird in Pakete zu etwa 10 Woertern geteilt, jedes
 *     Paket laeuft durch alle Stufen. Neuester Upload zuerst, faellige
 *     Wiederholungen etwa jede 4. Abfrage. Nach einem Fehler eine leichtere
 *     Abfrage, Stufe 3 nie zweimal direkt hintereinander. Ohne neuen Upload
 *     12 Abfragen aus faelligen Woertern und Woertern in Arbeit. Keine
 *     Obergrenze fuer neue Woerter.
 *   - Pruefung: alle Stoffwoerter, Ordner-Abstand min(normal, T/3) mit
 *     T = Tage bis zur Pruefung - 1, jedes Wort in den letzten 2 Tagen noch
 *     einmal, neue Woerter je Tag nur als Empfehlung, Reihenfolge in Arbeit,
 *     neu, Ordner. Eine Pause gilt fuer Pruefungswoerter nicht.
 *   - Pause: alle offenen Faelligkeiten ruecken um die Pausenlaenge.
 *   - Grundwortschatz: kein Datum, Quelle "grundwortschatz", in der Pruefung
 *     nur ausdruecklich als Quelle waehlbar.
 *
 * Datenmodell je Vokabel (in P-wissen, Schluessel "unitId|fremdwort"):
 *   alt (bleibt):  fach, faellig (Tageszahl), richtig, falsch, zuletzt
 *   neu (v:2):     stufe 1|2|3|"ordner", r1a, r1b (Stufe 1 Richtung a/b
 *                  geschafft), folge, ordnerSchritt, abstand, planTag, tag,
 *                  t (ms), fehler {art:n}, letztFalsch (Tag), gelernt (Tag), fv
 */
(function (wurzel) {
  "use strict";

  /* ================= Einstellungen ================= */

  /* Die bisherigen Faecher (FACH_TAGE in trainer.js: 0/1/3/7/16/35, Fach 0
     = heute) sind "Normal". Die anderen leiten sich davon ab. */
  var NORMAL = [1, 3, 7, 16, 35];
  function abgeleitet(faktor) {
    var r = [];
    for (var i = 0; i < NORMAL.length; i++) {
      var n = Math.max(1, Math.round(NORMAL[i] * faktor));
      if (i && n <= r[i - 1]) n = r[i - 1] + 1;
      r.push(n);
    }
    return r;
  }
  var RHYTHMEN = { intensiv: abgeleitet(0.6), normal: NORMAL.slice(), entspannt: abgeleitet(1.4) };

  var STANDARD = {
    rhythmus: "normal",            // intensiv | normal | entspannt | eigene
    abstaende: null,               // nur bei "eigene": 5 Werte, steigend, hoechstens 60
    hoechstAbstand: 60,            // Grenze NUR fuer eigene Werte
    gelerntNach: 3,                // X-mal Stufe 3 in Folge (3 bis 5)
    versatz: 3,                    // mindestens so viele andere Abfragen zwischen zwei desselben Wortes
    paketGroesse: 10,              // ein Upload in Pakete zu etwa 10 Woertern
    wdhJede: 4,                    // faellige Wiederholung etwa jede 4. Abfrage
    sitzungGroesse: 12,            // ohne neuen Upload: 12 Abfragen
    maxUeberfaellig: 15,           // hoechstens 15 Wiederholungen je Sitzung, Rest an den Folgetagen
    stufe1Zuerst: "a",             // erst Deutsch -> Fremd (a), dann Fremd -> Deutsch (b)
    auswahlAnzahl: 4,              // Stufe 1: vier Antworten
    falscherArtikelAblenker: true, // "la livre" neben "le livre"
    nochmalOhneStrafe: false,      // Tippfehler einmal neu tippen ohne Wertung (aus: streng)
    lueckenAnteil: 0.4,            // Stufe 2: 30-50 % der Buchstaben fehlen
    pruefungLetzteTage: 2,         // jedes Pruefungswort in den letzten 2 Tagen noch einmal
    pruefungKnappAb: 20,           // ab so vielen Woertern je Tag ein sachlicher Hinweis beim Anlegen
    deArtikelPflicht: false,       // Richtung -> Deutsch: Artikel darf fehlen, ein falscher ist ein Fehler
    satzzeichenFrei: true,         // ". ! ?" am Ende und "..." duerfen fehlen, Satzanfang darf klein sein
    tippfehlerGrenze: [[8, 2], [3, 1]] // nur fuer die ART "tippfehler" (falsch ist es immer)
  };

  function kopie(o) {
    if (o === null || typeof o !== "object") return o;
    if (Object.prototype.toString.call(o) === "[object Array]") {
      var a = []; for (var i = 0; i < o.length; i++) a.push(kopie(o[i])); return a;
    }
    var r = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) r[k] = kopie(o[k]);
    return r;
  }

  /* Leitplanken fuer eigene Werte: so viele wie Faecher, jede laenger als
     die vorige, hoechstens 60 Tage. */
  function abstaendePruefen(a, hoechst) {
    hoechst = hoechst || 60;
    if (!a || a.length !== NORMAL.length) return { ok: false, fehler: "Bitte genau " + NORMAL.length + " Abstände." };
    for (var i = 0; i < a.length; i++) {
      var n = a[i];
      if (typeof n !== "number" || n !== Math.floor(n) || n < 1) return { ok: false, fehler: "Abstände sind ganze Tage ab 1." };
      if (n > hoechst) return { ok: false, fehler: "Höchstens " + hoechst + " Tage." };
      if (i && n <= a[i - 1]) return { ok: false, fehler: "Jede Stufe muss länger sein als die vorige." };
    }
    return { ok: true };
  }

  function einstellungen(roh) {
    var e = kopie(STANDARD), r = roh || {};
    for (var k in r) if (Object.prototype.hasOwnProperty.call(r, k) && k in STANDARD) e[k] = kopie(r[k]);
    if (r.zufall) e.zufall = r.zufall;
    e.gelerntNach = Math.max(3, Math.min(5, parseInt(e.gelerntNach, 10) || 3));
    e.sitzungGroesse = Math.max(10, Math.min(15, parseInt(e.sitzungGroesse, 10) || 12));
    e.paketGroesse = Math.max(5, Math.min(20, parseInt(e.paketGroesse, 10) || 10));
    e.wdhJede = Math.max(2, parseInt(e.wdhJede, 10) || 4);
    e.versatz = Math.max(1, parseInt(e.versatz, 10) || 3);
    e.lueckenAnteil = Math.max(0.3, Math.min(0.5, Number(e.lueckenAnteil) || 0.4));
    e.pruefungLetzteTage = Math.max(1, Math.min(3, parseInt(e.pruefungLetzteTage, 10) || 2));
    if (!RHYTHMEN[e.rhythmus] && e.rhythmus !== "eigene") e.rhythmus = "normal";
    if (e.rhythmus === "eigene" && !abstaendePruefen(e.abstaende, e.hoechstAbstand).ok) e.rhythmus = "normal";
    return e;
  }

  function abstaendeVon(e) {
    return e.rhythmus === "eigene" ? e.abstaende.slice() : RHYTHMEN[e.rhythmus].slice();
  }
  /* ================= Sprachregeln =================
     Eine neue Sprache = ein Eintrag hier. Nichts anderes im Modul kennt
     "en" oder "fr" beim Namen. */
  var SPRACHEN = {
    en: { name: "Englisch", artikel: ["the", "an", "a"], artikelPflicht: true,
          verbVorsatz: "to", tasten: [], faecher: ["englisch", "engl", "en", "e"] },
    fr: { name: "Französisch", artikel: ["les", "le", "la", "l'", "une", "un", "des", "du"], artikelPflicht: true,
          tauschArtikel: { le: "la", la: "le", un: "une", une: "un" },
          stummeEnden: "estxdzp", akzente: "éèêëàâäîïôöùûüÿçœæ",
          tasten: ["é", "è", "ê", "à", "â", "ç", "ô", "û", "ù", "ë", "ï", "œ"],
          faecher: ["franzoesisch", "französisch", "franz", "fr", "f"] },
    es: { name: "Spanisch", artikel: ["los", "las", "el", "la", "unos", "unas", "un", "una"], artikelPflicht: true,
          tauschArtikel: { el: "la", la: "el", un: "una", una: "un" }, akzente: "áéíóúüñ",
          tasten: ["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"], faecher: ["spanisch", "span", "es"] },
    de: { name: "Deutsch", artikel: ["der", "die", "das", "den", "dem", "des", "ein", "eine", "einen"],
          artikelPflicht: false, tasten: ["ä", "ö", "ü", "ß"], faecher: ["deutsch"] }
  };
  function regel(sprache) { return SPRACHEN[sprache] || { name: sprache, artikel: [], artikelPflicht: false, tasten: [], faecher: [] }; }

  /* ================= Zeit: Tage in Ortszeit ================= */
  function tagVon(ms) {
    var d = new Date(ms);
    return Math.floor((ms - d.getTimezoneOffset() * 60000) / 86400000);
  }
  function tagAusIso(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
    if (!m) return null;
    return Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000);
  }
  function isoAusTag(tag) { return new Date(tag * 86400000).toISOString().slice(0, 10); }

  /* ================= Zufall ================= */
  function zufallMitSaat(saat) {
    var a = (saat >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul ? Math.imul(t ^ (t >>> 15), t | 1) : ((t ^ (t >>> 15)) * (t | 1)) >>> 0;
      t ^= t + (Math.imul ? Math.imul(t ^ (t >>> 7), t | 61) : ((t ^ (t >>> 7)) * (t | 61)) >>> 0);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function mischen(a, z) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(z() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ================= Text: vorbereiten, Varianten ================= */
  var BUCHSTABE = /[A-Za-zÀ-ÖØ-öø-ÿŒœÆæ]/;
  var GENUS = /^\s*(m|f|n|pl|m\/f|f\/m|m,\s*pl|f,\s*pl|m\.|f\.)\s*$/i;

  function ohneAkzent(s) {
    var t = String(s).replace(/œ/g, "oe").replace(/Œ/g, "Oe").replace(/æ/g, "ae").replace(/Æ/g, "Ae");
    try { t = t.normalize("NFD").replace(/[̀-ͯ]/g, ""); }
    catch (e) {
      var von = "àáâãäåèéêëìíîïòóôõöùúûüýÿçñÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝÇÑ",
          nach = "aaaaaaeeeeiiiiooooouuuuyycnAAAAAAEEEEIIIIOOOOOUUUUYCN";
      t = t.replace(/[^\u0000-\u007f]/g, function (c) { var i = von.indexOf(c); return i < 0 ? c : nach[i]; });
    }
    return t;
  }

  /* Was nie ein Fehler ist: Apostroph-Zeichen, Leerzeichen, (bei
     satzzeichenFrei) Satzzeichen am Ende, "..." als Platzhalter,
     Leerzeichen vor ? ! : ; (franzoesisch "ça va ?"). */
  function glatt(s, frei) {
    var t = String(s == null ? "" : s).replace(/[\u2019\u2018\u0060\u00b4\u02bc]/g, "'").replace(/ /g, " ");
    if (frei) t = t.replace(/\.\.\.|…/g, " ");
    t = t.replace(/\s+([?!:;])/g, "$1");
    if (frei) t = t.replace(/[\s.!?]+$/, "");
    return t.replace(/\s+/g, " ").trim();
  }

  /* Eingabe: Klammern, die das Kind selbst getippt hat, sind kein Fehler -
     "groß (Person)" fuer "groß (Person)". Eigenstaendige Klammern fallen weg,
     angehaengte werden aufgeloest ("allé(e)" -> "allée"). */
  function eingabeGlatt(s, frei) {
    var t = String(s == null ? "" : s).replace(/(^|\s)\([^)]*\)(?=\s|$)/g, " ").replace(/[()]/g, "");
    return glatt(t, frei);
  }

  /* Ein Soll-Teil ohne Trenner -> alle erlaubten Schreibweisen.
     " (m)", " (Person)"  -> faellt weg (Erklaerung, Genus)
     "(to) run"           -> "run", "to run"
     "allé(e)"            -> "allé", "allée"
     "das (Schul-)Fach"   -> "das Fach", "das Schul-Fach", "das Schulfach" */
  function klammerFormen(teil) {
    var t = String(teil);
    t = t.replace(/\s+\([^)]*\)(?=\s|$|[?!.])/g, function (m) {
      return /^\s*\(\s*to\s*\)/i.test(m) ? m : "";
    });
    var formen = [t];
    var guard = 0;
    while (guard++ < 6) {
      var neu = [], hatte = false;
      for (var i = 0; i < formen.length; i++) {
        var f = formen[i], m = /\(([^()]*)\)/.exec(f);
        if (!m) { neu.push(f); continue; }
        hatte = true;
        var vor = f.slice(0, m.index), nach = f.slice(m.index + m[0].length), inhalt = m[1];
        if (GENUS.test(inhalt)) { neu.push(vor + nach); continue; }
        neu.push(vor + nach);
        neu.push(vor + inhalt + nach);
        if (/-$/.test(inhalt) && /^[a-zäöüß]/i.test(nach)) neu.push(vor + inhalt.slice(0, -1) + nach.charAt(0).toLowerCase() + nach.slice(1));
      }
      formen = neu;
      if (!hatte) break;
    }
    var raus = [];
    for (var j = 0; j < formen.length; j++) {
      var g = formen[j].replace(/\s+/g, " ").trim();
      if (g && raus.indexOf(g) < 0) raus.push(g);
    }
    return raus;
  }

  /* An / , ; trennen, aber nie in Klammern ("l'élève (m/f)"). */
  function teilen(s) {
    var teile = [], stueck = "", tiefe = 0, str = String(s);
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      if (c === "(") tiefe++;
      if (c === ")") tiefe = Math.max(0, tiefe - 1);
      if (!tiefe && (c === "/" || c === "," || c === ";")) { teile.push(stueck); stueck = ""; }
      else stueck += c;
    }
    teile.push(stueck);
    var raus = [];
    for (var j = 0; j < teile.length; j++) { var t = teile[j].replace(/\s+/g, " ").trim(); if (t) raus.push(t); }
    return raus;
  }

  function artikelAb(s, sprache) {
    var R = regel(sprache), low = s.toLowerCase();
    for (var i = 0; i < R.artikel.length; i++) {
      var a = R.artikel[i];
      if (a.charAt(a.length - 1) === "'") {
        if (low.indexOf(a) === 0 && low.length > a.length) return { artikel: a, rest: s.slice(a.length), sep: "" };
      } else if (low.indexOf(a + " ") === 0 && low.length > a.length + 1) {
        return { artikel: a, rest: s.slice(a.length + 1), sep: " " };
      }
    }
    return { artikel: "", rest: s, sep: "" };
  }

  /* Sind die Teile Formen desselben Wortes (m/f: "gentil / gentille",
     "le copain / la copine", "cher, chère")? Dann reicht einer. */
  function formenVoneinander(teile, sprache) {
    if (teile.length < 2) return false;
    var stamm = function (x) { return ohneAkzent(artikelAb(klammerFormen(x)[0] || x, sprache).rest).toLowerCase(); };
    var a = stamm(teile[0]);
    for (var i = 1; i < teile.length; i++) {
      var b = stamm(teile[i]), n = 0;
      while (n < a.length && n < b.length && a.charAt(n) === b.charAt(n)) n++;
      if (n < 3) return false;
    }
    return true;
  }

  /* Ein PAAR ("oui / non" = "ja / nein", "un, deux, trois") verlangt alle
     Teile in dieser Reihenfolge. Sonst sind die Teile Alternativen. */
  function istPaar(p, sprache) {
    var f = teilen(p.en), d = teilen(p.de);
    return f.length > 1 && f.length === d.length && !formenVoneinander(f, sprache);
  }

  function variantenVon(soll, sprache, paar) {
    var R = regel(sprache), roh = String(soll == null ? "" : soll);
    var alternativen = paar ? [roh] : teilen(roh);
    if (!alternativen.length) alternativen = [roh];
    var raus = [];
    function dazu(x) { if (x && raus.indexOf(x) < 0) raus.push(x); }
    for (var i = 0; i < alternativen.length; i++) {
      var formen = klammerFormen(alternativen[i]);
      for (var j = 0; j < formen.length; j++) {
        dazu(formen[j]);
        if (R.verbVorsatz) {
          var v = R.verbVorsatz + " ";
          if (formen[j].toLowerCase().indexOf(v) === 0) dazu(formen[j].slice(v.length));
        }
      }
    }
    return raus;
  }

  /* ================= Strenger Vergleich ================= */

  function gleichMitRegel(g, r, satzanfangFrei) {
    if (g.length !== r.length) return false;
    for (var i = 0; i < r.length; i++) {
      var a = g.charAt(i), b = r.charAt(i);
      if (a === b) continue;
      if (b === b.toLowerCase() && a.toLowerCase() === b) continue;   // gross getippt, wo klein steht: egal
      if (i === 0 && satzanfangFrei && a.toLowerCase() === b.toLowerCase()) continue;
      return false;
    }
    return true;
  }

  function abstand(a, b) {
    if (a === b) return 0;
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
      if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1))
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[a.length][b.length];
  }

  /* Markierung wie LWToleranz.unterschied: [[zeichen, 0|1], ...] fuer die
     Eingabe (1 = zu viel/falsch) und fuers Soll (1 = fehlt/anders). Ein
     Akzent- oder Grossbuchstabenfehler ist eine markierte Stelle. */
  function markieren(gegeben, richtig, satzanfangFrei) {
    var a = String(gegeben), b = String(richtig), n = a.length, m = b.length, i, j;
    var eq = function (x, y, pos) {
      if (x === y) return true;
      if (y === y.toLowerCase() && x.toLowerCase() === y) return true;
      return pos === 0 && satzanfangFrei && x.toLowerCase() === y.toLowerCase();
    };
    var T = [];
    for (i = 0; i <= n; i++) { T[i] = []; for (j = 0; j <= m; j++) T[i][j] = 0; }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--)
      T[i][j] = eq(a.charAt(i), b.charAt(j), j) ? T[i + 1][j + 1] + 1 : Math.max(T[i + 1][j], T[i][j + 1]);
    var ga = [], ra = [];
    i = 0; j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && eq(a.charAt(i), b.charAt(j), j)) { ga.push([a.charAt(i), 0]); ra.push([b.charAt(j), 0]); i++; j++; }
      else if (j < m && (i >= n || T[i][j + 1] >= T[i + 1][j])) { ra.push([b.charAt(j), 1]); j++; }
      else { ga.push([a.charAt(i), 1]); i++; }
    }
    return { gegeben: ga, richtig: ra };
  }

  var RANG = { ok: 0, artikel: 1, akzent: 2, tippfehler: 3, falsch: 4 };
  function schwerste(arten) {
    var best = "ok";
    for (var i = 0; i < arten.length; i++) if (RANG[arten[i]] > RANG[best]) best = arten[i];
    return best;
  }

  function grenzeFuer(n, e) {
    var g = (e && e.tippfehlerGrenze) || STANDARD.tippfehlerGrenze;
    for (var i = 0; i < g.length; i++) if (n >= g[i][0]) return g[i][1];
    return 0;
  }

  /* Eine Eingabe gegen EINE erlaubte Schreibweise. */
  function gegenEine(g, r, sprache, e) {
    var R = regel(sprache), frei = e.satzzeichenFrei;
    var satzFrei = frei && /[.!?]\s*$/.test(r.roh || "");
    var rs = r.text;
    if (g === rs || gleichMitRegel(g, rs, satzFrei)) return { art: "ok", arten: [], d: 0 };
    var arten = [];
    var ga = artikelAb(g, sprache), ra = artikelAb(rs, sprache);
    var restG = ga.rest, restR = ra.rest;
    if (ga.artikel !== ra.artikel) {
      var nurFehlt = !ga.artikel && ra.artikel;
      var pflicht = sprache === "de" ? e.deArtikelPflicht : R.artikelPflicht;
      if (nurFehlt && !pflicht) { /* fehlender Artikel erlaubt */ }
      else arten.push("artikel");
    }
    var satzRest = satzFrei && !ra.artikel;
    if (!gleichMitRegel(restG, restR, satzRest)) {
      var aG = ohneAkzent(restG), aR = ohneAkzent(restR);
      if (gleichMitRegel(aG, aR, satzRest)) arten.push("akzent");
      else {
        var lg = aG.toLowerCase(), lr = aR.toLowerCase();
        var d = abstand(lg, lr);
        if (d === 0) arten.push("tippfehler");            // nur Gross/klein
        else if (d <= grenzeFuer(lr.replace(/ /g, "").length, e)) {
          arten.push("tippfehler");
          if (ohneAkzent(restR) !== restR && abstand(restG.toLowerCase(), restR.toLowerCase()) > d) arten.push("akzent");
        }
        else arten.push("falsch");
      }
    }
    if (!arten.length) return { art: "ok", arten: [], d: 0 };   // z. B. "Insel" fuer "die Insel"
    var dd = abstand(ohneAkzent(g).toLowerCase(), ohneAkzent(rs).toLowerCase());
    return { art: schwerste(arten), arten: arten, d: dd };
  }

  /* werte(gegeben, soll, opt) - der strenge Vergleich fuer freies Schreiben
     und Lueckenwort. opt: { sprache, paar (bool), nurGenau (Lueckenwort:
     nur diese eine Form), einst }.
     -> { richtig, art: ok|tippfehler|akzent|artikel|falsch, arten, treffer,
          eingabe, markierung } */
  function werteText(gegeben, soll, opt) {
    opt = opt || {};
    var e = opt.einst || einstellungen();
    var sp = opt.sprache || "en", frei = e.satzzeichenFrei;
    var g = eingabeGlatt(gegeben, frei);
    if (!g) return { richtig: false, art: "falsch", arten: ["leer"], treffer: variantenVon(soll, sp, opt.paar)[0] || String(soll), eingabe: "", markierung: null };

    if (opt.paar && !opt.nurGenau) {
      var sollTeile = teilen(soll), gTeile = teilen(g);
      if (sollTeile.length > 1) {
        if (gTeile.length !== sollTeile.length) {
          var ziel = sollTeile.map(function (t) { return klammerFormen(t)[0]; }).join(" / ");
          return { richtig: false, art: "falsch", arten: ["falsch"], treffer: ziel, eingabe: g, markierung: markieren(g, ziel, false) };
        }
        var arten = [], treffer = [], mg = [], mr = [];
        for (var i = 0; i < sollTeile.length; i++) {
          var t = werteText(gTeile[i], sollTeile[i], { sprache: sp, paar: false, einst: e });
          arten = arten.concat(t.arten);
          treffer.push(t.treffer);
          if (i) { mg.push([" ", 0], ["/", 0], [" ", 0]); mr.push([" ", 0], ["/", 0], [" ", 0]); }
          var mk = t.markierung || markieren(gTeile[i], t.treffer, false);
          mg = mg.concat(mk.gegeben); mr = mr.concat(mk.richtig);
        }
        var art = schwerste(arten);
        return { richtig: art === "ok", art: art, arten: art === "ok" ? [] : arten, treffer: treffer.join(" / "),
                 eingabe: g, markierung: art === "ok" ? null : { gegeben: mg, richtig: mr } };
      }
    }

    var varianten = opt.nurGenau ? [String(soll)] : variantenVon(soll, sp, opt.paar);
    var best = null;
    for (var k = 0; k < varianten.length; k++) {
      var roh = varianten[k];
      var r = { text: glatt(roh, frei), roh: roh };
      var v = gegenEine(g, r, sp, e);
      v.treffer = r.text; v.roh = roh;
      if (v.art === "ok") return { richtig: true, art: "ok", arten: [], treffer: r.text, eingabe: g, markierung: null };
      if (!best || RANG[v.art] < RANG[best.art] || (RANG[v.art] === RANG[best.art] && v.d < best.d)) best = v;
    }
    var satzFrei = frei && /[.!?]\s*$/.test(best.roh || "");
    return { richtig: false, art: best.art, arten: best.arten, treffer: best.treffer, eingabe: g,
             markierung: markieren(g, best.treffer, satzFrei) };
  }

  /* ================= Woerter: Stamm, Wortart, Genus ================= */

  function genusVon(p) {
    var m = /\(([^)]*)\)/.exec(String(p.en || ""));
    if (p.genus) return { genus: p.genus, plural: !!p.plural };
    if (!m || !GENUS.test(m[1])) return null;
    var g = m[1].toLowerCase();
    return { genus: /m\/f|f\/m/.test(g) ? "m/f" : (/^f/.test(g) ? "f" : (/^m/.test(g) ? "m" : "")), plural: /pl/.test(g) };
  }

  function wortartVon(p, sprache) {
    if (p.wortart) return p.wortart;
    var f = String(p.en || ""), d = String(p.de || ""), R = regel(sprache);
    if (R.verbVorsatz && f.toLowerCase().indexOf(R.verbVorsatz + " ") === 0) return "verb";
    if (artikelAb(klammerFormen(teilen(f)[0] || f)[0] || f, sprache).artikel) return "nomen";
    if (/^(der|die|das)\s/i.test(d)) return "nomen";
    if (f.split(" ").length >= 3 || /[?!]/.test(f)) return "satz";
    if (/^[a-zäöü]+(en|ern|eln)\b/.test(d) && d.split(" ").length <= 3) return "verb";
    return "";
  }

  function wortSchluessel(unitId, p) { return unitId + "|" + p.en; }

  /* ================= Einheiten: Herkunft, Upload-Datum ================= */

  function einheitInfo(u) {
    var hoch = u.hochgeladen || null, herkunft = u.herkunft || "";
    var m = /^u(\d{12,14})$/.exec(String(u.id || ""));
    if (!hoch && m) hoch = new Date(+m[1]).toISOString().slice(0, 10);
    if (hoch && /^\d{12,}$/.test(String(hoch))) hoch = new Date(+hoch).toISOString().slice(0, 10);
    if (!herkunft) herkunft = m ? "eigene" : "grundwortschatz";
    return { hochgeladen: hoch ? String(hoch).slice(0, 10) : null, herkunft: herkunft };
  }

  /* Fuer die Oberflaeche: eine neue Einheit aus Foto oder Text. Das Datum
     ist Pflicht (Frage 13); der Grundwortschatz hat keins. */
  function einheitNeu(name, paare, jetzt, herkunft, sprache, seiten) {
    var heute = new Date(jetzt);
    var iso = heute.getFullYear() + "-" + ("0" + (heute.getMonth() + 1)).slice(-2) + "-" + ("0" + heute.getDate()).slice(-2);
    var u = { id: "u" + jetzt, name: name, pairs: paare, hochgeladen: iso,
              herkunft: herkunft === "text" ? "text" : "foto", sprache: sprache };
    if (seiten && seiten.length) u.seiten = seiten;
    return u;
  }

  /* ================= Zustand je Vokabel, Migration ================= */

  function fachAusStufe(e) {
    if (e.stufe === "ordner") return 5;
    if (e.stufe === 3) return Math.min(5, 2 + (e.folge || 0));
    return e.stufe === 2 ? 1 : 0;
  }

  /* Liest einen Eintrag als v2. Alte Eintraege (ohne v) und solche, die eine
     alte offene Seite nach uns veraendert hat (fach != fv), werden aus dem
     Fach neu eingestuft. Das Original bleibt unberuehrt. */
  function lesen(roh, tag) {
    if (!roh || typeof roh !== "object") return null;
    var e = kopie(roh);
    var veraltet = e.v === 2 && typeof e.fv === "number" && e.fv !== e.fach;
    if (e.v === 2 && !veraltet) return e;
    var fach = Math.max(0, parseInt(e.fach, 10) || 0);
    e.v = 2;
    if (fach <= 0) { e.stufe = 1; e.folge = 0; }
    else if (fach === 1) { e.stufe = 2; e.folge = 0; }
    else { e.stufe = 3; e.folge = fach - 2; }
    e.r1a = false; e.r1b = false;
    e.folgeTage = e.folge; e.folgeTag = null;
    e.ordnerSchritt = null; e.abstand = null;
    e.fehler = e.fehler || {};
    if (e.tag == null && e.zuletzt) e.tag = tagAusIso(e.zuletzt);
    e.planTag = e.tag != null ? e.tag : null;
    e.mig = tag != null ? tag : null;
    e.fv = fach;
    return e;
  }

  /* Einmal je Sprache. Gibt denselben Stand zurueck, wenn nichts zu tun ist
     (geaendert 0) - dann schreibt der Aufrufer NICHT (1 Schreibvorgang). */
  function migration(wissen, jetzt) {
    var tag = tagVon(jetzt), neu = {}, n = 0;
    for (var k in wissen) if (Object.prototype.hasOwnProperty.call(wissen, k)) {
      var alt = wissen[k];
      var veraltet = alt && alt.v === 2 && typeof alt.fv === "number" && alt.fv !== alt.fach;
      if (alt && alt.v === 2 && !veraltet) { neu[k] = alt; continue; }
      var e = lesen(alt, tag);
      if (e) { neu[k] = e; n++; } else neu[k] = alt;
    }
    return { zustand: n ? neu : wissen, geaendert: n };
  }

  /* ================= Faelligkeit, Pause, Pruefung ================= */

  function pausenFuer(pausen, sprache) {
    var raus = [];
    (pausen || []).forEach(function (p) {
      if (!p || !p.von || !p.bis) return;
      if (p.sprachen && p.sprachen.length && p.sprachen.indexOf(sprache) < 0) return;
      var v = tagAusIso(p.von), b = tagAusIso(p.bis);
      if (v != null && b != null && b >= v) raus.push({ von: v, bis: b });
    });
    return raus.sort(function (a, b) { return a.von - b.von; });
  }
  function inPause(tag, pausen) {
    for (var i = 0; i < pausen.length; i++) if (tag >= pausen[i].von && tag <= pausen[i].bis) return pausen[i];
    return null;
  }
  /* Ab Pausenbeginn ruecken alle offenen Faelligkeiten um die Pausenlaenge -
     nicht nur die in der Pause, sonst staut sich alles am ersten Tag danach.
     Beim Lesen berechnet, nichts wird umgeschrieben. */
  function effFaellig(e, pausen) {
    var f = e.faellig;
    if (f == null) return null;
    var basis = e.planTag != null ? e.planTag : -Infinity;
    for (var i = 0; i < pausen.length; i++) {
      var p = pausen[i];
      if (basis < p.von && f >= p.von) f += (p.bis - p.von + 1);
    }
    return f;
  }

  /* Pruefung aus Helenas Probeneintrag: [{datum, fach, thema}] -> die
     naechste fuer diese Sprache, oder null. */
  function pruefungAusTerminen(termine, sprache, jetzt) {
    var R = regel(sprache), heute = tagVon(jetzt), best = null;
    (termine || []).forEach(function (t) {
      if (!t || !t.datum) return;
      var f = String(t.fach || "").toLowerCase();
      if (R.faecher.indexOf(f) < 0) return;
      var d = tagAusIso(t.datum);
      if (d == null || d <= heute) return;
      if (!best || d < tagAusIso(best.termin)) best = { termin: String(t.datum).slice(0, 10), thema: t.thema || "", stoff: t.stoff || null };
    });
    return best;
  }

  /* Stoff: Upload-Zeitraum {von, bis}, Einheiten, Lektionen oder
     ausdruecklich die Quelle "grundwortschatz". Der Grundwortschatz hat kein
     Datum und faellt deshalb nie in einen Zeitraum. */
  function imStoff(u, p, stoff) {
    if (!stoff) return false;
    var info = einheitInfo(u);
    if (stoff.quellen && stoff.quellen.indexOf(info.herkunft) >= 0) return true;
    if (stoff.einheiten && stoff.einheiten.indexOf(u.id) >= 0) return true;
    if (stoff.lektionen && stoff.lektionen.length) {
      var l = p.lektion || u.lektion;
      if (l != null && stoff.lektionen.indexOf(String(l)) >= 0) return true;
    }
    if (stoff.von || stoff.bis) {
      var h = info.hochgeladen;
      if (h && (!stoff.von || h >= stoff.von) && (!stoff.bis || h <= stoff.bis)) return true;
    }
    return false;
  }

  function aktivePruefungen(pruefungen, tag) {
    return (pruefungen || []).filter(function (p) {
      var T = p && tagAusIso(p.termin);
      return T != null && T > tag && p.stoff && p.aktiv !== false;
    }).sort(function (a, b) { return a.termin < b.termin ? -1 : 1; });
  }

  /* Faelligkeit eines Ordner-Worts im Pruefungsstoff: Abstand
     min(normal, floor(T/3)), mindestens 1 Tag, T = Tage bis zur Pruefung - 1
     (vom Tag der letzten Planung aus). Dazu einmal in den letzten 2 Tagen. */
  function pruefOrdnerFaellig(e, P, ein) {
    var basis = e.planTag != null ? e.planTag : (e.tag != null ? e.tag : P - 1);
    var T = P - basis - 1;
    var kurz = Math.max(1, Math.floor(T / 3));
    var f = Math.min(e.faellig != null ? e.faellig : basis, basis + kurz);
    var fenster = P - ein.pruefungLetzteTage;
    if (!(e.tag != null && e.tag >= fenster)) f = Math.min(f, fenster);
    else if (f < e.tag + 1) f = e.tag + 1;
    return f >= P ? null : f;
  }

  /* ================= Bestand einsammeln ================= */

  function stufeForm(e) {
    if (!e || e.stufe === 1) return "auswahl";
    if (e.stufe === 2) return "luecke";
    return "schreiben";
  }

  function sammeln(zustand, units, tag, ein, opt) {
    var sprache = opt.sprache, pausen = pausenFuer(opt.pausen, sprache);
    var pause = inPause(tag, pausen);
    var pr = aktivePruefungen(opt.pruefungen, tag);
    var liste = [], nach = {};
    (units || []).forEach(function (u, ui) {
      var info = einheitInfo(u);
      (u.pairs || []).forEach(function (p, pi) {
        var schl = wortSchluessel(u.id, p);
        var e = lesen(zustand[schl], tag);
        var w = { schl: schl, unit: u, unitId: u.id, info: info, p: p, e: e, ui: ui, pi: pi, pruefung: null };
        for (var i = 0; i < pr.length; i++) if (imStoff(u, p, pr[i].stoff)) { w.pruefung = pr[i]; break; }
        if (!e) w.klasse = "neu";
        else if (e.stufe === "ordner") {
          w.klasse = "ordner";
          if (w.pruefung) {
            w.faellig = pruefOrdnerFaellig(e, tagAusIso(w.pruefung.termin), ein);
            if (w.faellig == null) w.faellig = e.faellig;      // letzte Wiederholung schon kurz vor dem Termin
            w.istFaellig = w.faellig <= tag;                    // Pause gilt fuer Pruefungswoerter nicht
          } else {
            w.faellig = effFaellig(e, pausen);
            w.istFaellig = !pause && w.faellig != null && w.faellig <= tag;
          }
        } else {
          w.klasse = "arbeit";
          w.offenB = e.stufe === 1 && !!e.r1a && !e.r1b;
        }
        liste.push(w); nach[schl] = w;
      });
    });
    return { liste: liste, nach: nach, pause: pause, pausen: pausen, pruefungen: pr };
  }

  /* ================= Abfragen bauen ================= */

  function sollFremd(p) { return String(p.en); }

  function lueckenwort(ziel, sprache, ein, z) {
    var R = regel(sprache), t = String(ziel);
    var start = 0, a = artikelAb(t, sprache);
    if (a.artikel) start = t.length - a.rest.length;
    if (R.verbVorsatz && t.toLowerCase().indexOf(R.verbVorsatz + " ") === 0) start = R.verbVorsatz.length + 1;
    var pos = [];
    for (var i = start; i < t.length; i++) if (BUCHSTABE.test(t.charAt(i))) pos.push(i);
    if (!pos.length) return { anzeige: t, stellen: [], ziel: t, buchstaben: [] };
    var k = Math.max(1, Math.min(pos.length - (pos.length > 2 ? 1 : 0), Math.round(pos.length * ein.lueckenAnteil)));
    var low = t.toLowerCase();
    var punkte = pos.map(function (i) {
      var c = low.charAt(i), s = z();
      var wortStart = i === 0 || !BUCHSTABE.test(t.charAt(i - 1));
      var wortEnde = i === t.length - 1 || !BUCHSTABE.test(t.charAt(i + 1));
      if (ohneAkzent(c) !== c) s += 5;                                     // Akzentbuchstaben
      if (low.charAt(i - 1) === c || low.charAt(i + 1) === c) s += 4;      // Doppelbuchstaben
      if (wortEnde && R.stummeEnden && R.stummeEnden.indexOf(c) >= 0 && !wortStart) s += 3; // stumme Endung
      if (/[aeiouy]/.test(c) && /[aeiouy]/.test(low.charAt(i + 1) + low.charAt(i - 1))) s += 2; // ou, ai, ea, ie
      if (sprache === "en") {
        if (c === "k" && low.charAt(i + 1) === "n" && wortStart) s += 4;   // knife
        if (c === "w" && low.charAt(i + 1) === "r" && wortStart) s += 4;   // write
        if ((c === "g" && low.charAt(i + 1) === "h") || (c === "h" && low.charAt(i - 1) === "g")) s += 3;
        if (c === "e" && wortEnde && !wortStart) s += 2;
      }
      if (c === "c" || c === "q" || c === "y") s += 1;
      if (wortStart && ohneAkzent(c) === c) s -= 2;
      return { i: i, s: s };
    }).sort(function (x, y) { return y.s - x.s; });
    var stellen = punkte.slice(0, k).map(function (x) { return x.i; }).sort(function (x, y) { return x - y; });
    var anzeige = t.split(""), buchstaben = [];
    stellen.forEach(function (i) { buchstaben.push(t.charAt(i)); anzeige[i] = "_"; });
    return { anzeige: anzeige.join(""), stellen: stellen, ziel: t, buchstaben: buchstaben };
  }

  /* Die Form, die beim Lueckenwort gezeigt wird: erste Alternative, ohne
     Genus-Klammer ("l'âge (m)" -> "l'âge"), bei einem PAAR das Ganze. */
  function lueckenZiel(p, sprache) {
    if (istPaar(p, sprache)) return teilen(p.en).map(function (t) { return klammerFormen(t)[0]; }).join(" / ");
    var t = teilen(p.en)[0] || p.en;
    return klammerFormen(t)[0] || t;
  }

  /* Plausible Ablenker. Ist die Wortart bekannt (vom Foto-Import oder
     sicher am Artikel bzw. "to" erkennbar), zaehlt sie zuerst. Ist sie
     unklar: Woerter aus derselben Lektion mit aehnlicher Laenge. Im
     Franzoesischen dazu der gleiche Artikel und das Wort mit falschem
     Artikel. Nie die Loesung doppelt, nie eine andere richtige Schreibweise. */
  function ablenker(w, feld, alle, ein, z, sprache) {
    var loes = String(w.p[feld]), anzahl = Math.max(2, ein.auswahlAnzahl) - 1;
    var sp = feld === "de" ? "de" : sprache;
    var wa = wortartVon(w.p, sprache);
    var lowL = loes.toLowerCase();
    var art = artikelAb(loes, sp).artikel;
    var verbotenFormen = variantenVon(loes, sp, false).map(function (x) { return glatt(x, true).toLowerCase(); });
    var raus = [], gesehen = {};
    gesehen[lowL] = 1;
    if (feld === "en" && ein.falscherArtikelAblenker) {
      var R = regel(sprache);
      if (R.tauschArtikel && art && R.tauschArtikel[art] && !istPaar(w.p, sprache)) {
        var falsch = R.tauschArtikel[art] + " " + artikelAb(loes, sp).rest;
        raus.push(falsch); gesehen[falsch.toLowerCase()] = 1;
      }
    }
    var kandidaten = [];
    alle.forEach(function (o) {
      if (o.schl === w.schl) return;
      var txt = String(o.p[feld] || ""), low = txt.toLowerCase();
      if (!txt || gesehen[low]) return;
      var formen = variantenVon(txt, sp, false).map(function (y) { return glatt(y, true).toLowerCase(); });
      for (var i = 0; i < formen.length; i++) if (verbotenFormen.indexOf(formen[i]) >= 0) return;
      var s = z();
      var owa = wortartVon(o.p, sprache);
      var naehe = Math.min(4, Math.abs(txt.length - loes.length) / 2);
      if (wa) { if (owa === wa) s += 6; if (o.unitId === w.unitId) s += 2; s -= naehe / 2; }
      else { if (o.unitId === w.unitId) s += 4; s -= Math.min(6, Math.abs(txt.length - loes.length) / 1.5); }
      if (art && artikelAb(txt, sp).artikel === art) s += 3;
      if ((txt.split(" ").length > 1) === (loes.split(" ").length > 1)) s += 1;
      kandidaten.push({ txt: txt, s: s });
    });
    kandidaten.sort(function (a, b) { return b.s - a.s; });
    for (var k = 0; k < kandidaten.length && raus.length < anzahl; k++) {
      var c = kandidaten[k].txt;
      if (gesehen[c.toLowerCase()]) continue;
      gesehen[c.toLowerCase()] = 1; raus.push(c);
    }
    return mischen(raus.slice(0, anzahl).concat([loes]), z);
  }

  var nrZaehler = 0;
  function abfrageBauen(w, form, richtung, alle, ein, z, sprache, grund) {
    var a = { nr: ++nrZaehler, schl: w.schl, unitId: w.unitId, paar: { en: w.p.en, de: w.p.de, ex: w.p.ex || "" },
              sprache: sprache, form: form, richtung: richtung, grund: grund,
              stufe: w.e ? w.e.stufe : 1 };
    if (form === "auswahl") {
      var zuFremd = richtung === "a";
      a.frage = zuFremd ? w.p.de : w.p.en;
      a.loesung = zuFremd ? w.p.en : w.p.de;
      a.antwortSprache = zuFremd ? sprache : "de";
      a.optionen = ablenker(w, zuFremd ? "en" : "de", alle, ein, z, sprache);
    } else if (form === "luecke") {
      a.frage = w.p.de;
      a.luecke = lueckenwort(lueckenZiel(w.p, sprache), sprache, ein, z);
      a.loesung = a.luecke.ziel;
      a.antwortSprache = sprache;
    } else {
      a.frage = w.p.de;
      a.loesung = sollFremd(w.p);
      a.antwortSprache = sprache;
    }
    if (w.pruefung) a.pruefung = w.pruefung.termin;
    if (grund === "extra") a.extra = true;
    return a;
  }

  function richtungFuer(e, ein) {
    var erst = ein.stufe1Zuerst === "b" ? "b" : "a", dann = erst === "a" ? "b" : "a";
    if (!e) return erst;
    return e["r1" + erst] ? dann : erst;
  }

  /* ================= Sitzung =================
     Eine Sitzung ist ein kleiner Plan, der sich nach jeder Antwort
     fortschreibt (naechsteAbfrage). Gespeichert wird nur das Paket und der
     Verlauf - damit ist sie nach einem Abbruch fortsetzbar. */

  /* Ein Upload in Pakete zu etwa paketGroesse Woertern, gleich gross. */
  function paketeVon(woerter, groesse) {
    var n = woerter.length, k = Math.max(1, Math.round(n / groesse)), raus = [];
    for (var i = 0; i < k; i++) raus.push(woerter.slice(Math.floor(i * n / k), Math.floor((i + 1) * n / k)));
    return raus;
  }

  /* sitzungStarten(zustand, units, jetzt, einst, opt)
     opt: { sprache, pruefungen:[{termin, stoff}], pausen:[{von,bis,sprachen}],
            einheit (direkt nach dem Upload: "Jetzt lernen"), zufall }
     Rangfolge: 1. ausdruecklich gewaehlte Einheit, 2. aktive Pruefung mit
     Stoff, der noch nicht im Ordner ist (in Arbeit, dann neu), 3. neuester
     Upload mit offenen Woertern, 4. Runde aus faelligen Woertern und Woertern
     in Arbeit, 5. naechste Einheit des Grundwortschatzes (Annahme), 6. leer. */
  function sitzungStarten(zustand, units, jetzt, einstRoh, opt) {
    opt = opt || {};
    var ein = einstellungen(einstRoh), tag = tagVon(jetzt), sprache = opt.sprache || "en";
    var S = sammeln(zustand || {}, units, tag, ein, opt);
    var s = { v: 3, sprache: sprache, tag: tag, start: jetzt, modus: "leer", quelle: null,
              paket: [], paketNr: 0, pakete: 0, verlauf: [], anzahl: 0, wdh: 0 };
    function ausEinheit(u, art) {
      var woerter = S.liste.filter(function (w) { return w.unitId === u.id; });
      var teile = paketeVon(woerter, ein.paketGroesse);
      for (var i = 0; i < teile.length; i++) {
        if (teile[i].some(function (w) { return w.klasse !== "ordner"; })) {
          s.modus = "paket"; s.quelle = { art: art, id: u.id, name: u.name };
          s.paket = teile[i].map(function (w) { return w.schl; });
          s.paketNr = i + 1; s.pakete = teile.length;
          return true;
        }
      }
      return false;
    }
    if (opt.einheit) {
      var gew = (units || []).filter(function (u) { return u.id === opt.einheit; })[0];
      if (gew && ausEinheit(gew, einheitInfo(gew).herkunft)) return s;
    }
    if (S.pruefungen.length) {
      var P = S.pruefungen[0];
      var stoff = S.liste.filter(function (w) { return w.pruefung === P; });
      var offen = stoff.filter(function (w) { return w.klasse !== "ordner"; });
      if (offen.length) {
        offen.sort(function (a, b) {
          var ka = a.klasse === "arbeit" ? (a.offenB ? 0 : 1) : 2, kb = b.klasse === "arbeit" ? (b.offenB ? 0 : 1) : 2;
          if (ka !== kb) return ka - kb;                      // in Arbeit, dann neu
          return a.ui - b.ui || a.pi - b.pi;
        });
        s.modus = "paket"; s.quelle = { art: "pruefung", termin: P.termin, thema: P.thema || "" };
        s.paket = offen.slice(0, ein.paketGroesse).map(function (w) { return w.schl; });
        s.pakete = Math.max(1, Math.ceil(stoff.length / ein.paketGroesse));
        s.paketNr = Math.min(s.pakete, Math.floor((stoff.length - offen.length) / ein.paketGroesse) + 1);
        return s;
      }
    }
    var uploads = (units || []).filter(function (u) { return einheitInfo(u).herkunft !== "grundwortschatz"; });
    uploads.sort(function (a, b) {
      var ha = einheitInfo(a).hochgeladen || "", hb = einheitInfo(b).hochgeladen || "";
      if (ha !== hb) return ha < hb ? 1 : -1;                 // neuester Upload zuerst
      return String(a.id) < String(b.id) ? 1 : -1;
    });
    for (var i = 0; i < uploads.length; i++) if (ausEinheit(uploads[i], einheitInfo(uploads[i]).herkunft)) return s;
    if (S.liste.some(function (w) { return w.klasse === "arbeit" || (w.klasse === "ordner" && w.istFaellig); })) {
      s.modus = "runde"; s.quelle = { art: "runde" };
      return s;
    }
    var gws = (units || []).filter(function (u) { return einheitInfo(u).herkunft === "grundwortschatz"; });
    for (var j = 0; j < gws.length; j++) if (ausEinheit(gws[j], "grundwortschatz")) return s;
    return s;
  }

  var SCHWERE = { auswahl: 1, luecke: 2, schreiben: 3 };

  /* naechsteAbfrage(sitzung, zustand, units, jetzt, einst, opt)
     -> { abfrage } oder { ende: { art: "paket"|"runde"|"leer", paketNr, pakete, text } }
     Regeln: mindestens "versatz" andere Abfragen zwischen zwei desselben
     Wortes; nach einem Fehler eine leichtere Abfrage; Stufe 3 nie zweimal
     direkt hintereinander; im Paket etwa jede 4. eine faellige Wiederholung. */
  function naechsteAbfrage(s, zustand, units, jetzt, einstRoh, opt) {
    opt = opt || {};
    var ein = einstellungen(einstRoh), z = opt.zufall || ein.zufall || Math.random;
    var tag = tagVon(jetzt), sprache = s.sprache;
    var S = sammeln(zustand || {}, units, tag, ein, { sprache: sprache, pruefungen: opt.pruefungen, pausen: opt.pausen });
    var verlauf = s.verlauf || [], letzte = verlauf[verlauf.length - 1] || null;
    var kuerzlich = {};
    for (var i = Math.max(0, verlauf.length - ein.versatz); i < verlauf.length; i++) kuerzlich[verlauf[i].schl] = 1;
    var zuletztBei = {};
    verlauf.forEach(function (v, k) { zuletztBei[v.schl] = k; });
    var spaet = function (w) { return zuletztBei[w.schl] == null ? -1 : zuletztBei[w.schl]; };

    var wdh = s.wdh < ein.maxUeberfaellig ? S.liste.filter(function (w) { return w.klasse === "ordner" && w.istFaellig; })
      .sort(function (a, b) { return a.faellig - b.faellig; }) : [];
    wdh.forEach(function (w) { w.grund = w.pruefung ? "pruefung" : "wiederholung"; });
    var arbeit = S.liste.filter(function (w) { return w.klasse === "arbeit"; }).sort(function (a, b) {
      if (a.offenB !== b.offenB) return a.offenB ? -1 : 1;    // offene Richtung b zuerst
      var fa = a.e.letztFalsch != null ? a.e.letztFalsch : -1e9, fb = b.e.letztFalsch != null ? b.e.letztFalsch : -1e9;
      if (fa !== fb) return fb - fa;
      return spaet(a) - spaet(b) || ((a.e.tag != null ? a.e.tag : -1e9) - (b.e.tag != null ? b.e.tag : -1e9));
    });
    arbeit.forEach(function (w) { w.grund = "arbeit"; });
    var reihe = [], ende = null;

    if (s.modus === "paket") {
      var paket = s.paket.map(function (k) { return S.nach[k]; }).filter(function (w) { return w && w.klasse !== "ordner"; });
      if (!paket.length) {
        ende = { art: "paket", paketNr: s.paketNr, pakete: s.pakete,
                 text: s.pakete > 1 ? "Paket " + s.paketNr + " von " + s.pakete + " geschafft" : "Paket geschafft" };
      } else {
        paket.sort(function (a, b) {
          if (a.offenB !== b.offenB) return a.offenB ? -1 : 1;
          return spaet(a) - spaet(b) || s.paket.indexOf(a.schl) - s.paket.indexOf(b.schl);
        });
        paket.forEach(function (w) { w.grund = w.pruefung ? "pruefung" : "paket"; });
        var wdhPlatz = (s.anzahl % ein.wdhJede) === ein.wdhJede - 1;
        reihe = wdhPlatz ? wdh.concat(paket) : paket.concat(wdh);
      }
    } else if (s.modus === "runde") {
      if (s.anzahl >= ein.sitzungGroesse) ende = { art: "runde", text: "Runde geschafft" };
      else {
        var offenB = arbeit.filter(function (w) { return w.offenB; });
        reihe = offenB.concat(wdh, arbeit.filter(function (w) { return !w.offenB; }));
        if (!reihe.length) ende = { art: "leer", text: "Gerade ist nichts dran" };
      }
    } else ende = { art: "leer", text: "Gerade ist nichts dran" };
    if (ende) return { ende: ende };

    // Fueller, falls der Abstand sonst nicht reicht: andere Woerter in Arbeit,
    // nicht faellige Ordnerwoerter (Extra-Ueben, der Abstand bleibt).
    var drin = {}; reihe.forEach(function (w) { drin[w.schl] = 1; });
    var fueller = arbeit.filter(function (w) { return !drin[w.schl]; })
      .concat(S.liste.filter(function (w) { return w.klasse === "ordner" && !w.istFaellig; })
        .sort(function (a, b) { return a.faellig - b.faellig; })
        .map(function (w) { w.grund = "extra"; return w; }));

    function passt(w, streng) {
      if (kuerzlich[w.schl]) return false;
      var f = stufeForm(w.e);
      if (streng >= 2 && letzte && !letzte.richtig) {
        if (letzte.form === "auswahl" ? SCHWERE[f] !== 1 : SCHWERE[f] >= SCHWERE[letzte.form]) return false;
      }
      if (streng >= 1 && letzte && letzte.form === "schreiben" && f === "schreiben") return false;
      return true;
    }
    var gewaehlt = null, zwischen = null, alleK = reihe.concat(fueller), a;
    for (a = 0; a < alleK.length && !gewaehlt; a++) if (passt(alleK[a], 2)) gewaehlt = alleK[a];
    if (!gewaehlt && letzte) {
      /* Kein Wort steht in einer passenden Stufe (z. B. am Paketende sind
         alle in Stufe 3): dann eine Zwischenfrage in leichterer Form. Sie
         zaehlt fuer den Lernstand nicht, haelt aber die Regel ein. */
      var bedarf = !letzte.richtig ? (letzte.form === "schreiben" ? "luecke" : "auswahl")
                 : (letzte.form === "schreiben" ? "luecke" : null);
      // Zuerst ein Fueller (nicht aus dem Paket), damit die Paketwoerter fuer
      // echte Abfragen frei bleiben.
      var zwK = fueller.concat(reihe);
      if (bedarf) for (a = 0; a < zwK.length && !gewaehlt; a++) {
        var w0 = zwK[a];
        if (kuerzlich[w0.schl]) continue;
        if (SCHWERE[stufeForm(w0.e)] > SCHWERE[bedarf]) { gewaehlt = w0; zwischen = bedarf; }
      }
    }
    for (var st = 1; st >= 0 && !gewaehlt; st--)
      for (a = 0; a < alleK.length && !gewaehlt; a++) if (passt(alleK[a], st)) gewaehlt = alleK[a];
    var verletzt = false;
    if (!gewaehlt) {                    // zu wenige Woerter in der Sprache: das am laengsten nicht gefragte
      gewaehlt = reihe.slice().sort(function (x, y) { return spaet(x) - spaet(y); })[0];
      verletzt = true;
    }
    var form = zwischen || stufeForm(gewaehlt.e);
    var ab = abfrageBauen(gewaehlt, form, form === "auswahl" && !zwischen ? richtungFuer(gewaehlt.e, ein) : "a", S.liste, ein, z, sprache, gewaehlt.grund);
    if (zwischen) ab.zwischen = true;
    if (verletzt) ab.versatzVerletzt = true;
    return { abfrage: ab };
  }

  /* ================= Werten ================= */

  /* werten(abfrage, antwort, einst) -> { richtig, art, arten, treffer,
     eingabe, markierung }. Auswahl: genau die Loesung; ein Knopf, der sich
     nur im Artikel unterscheidet, zaehlt als Art "artikel". */
  function werten(a, antwort, einstRoh) {
    var ein = einstellungen(einstRoh);
    if (a.form === "auswahl") {
      var gewaehlt = String(antwort == null ? "" : antwort);
      if (gewaehlt === a.loesung) return { richtig: true, art: "ok", arten: [], treffer: a.loesung, eingabe: gewaehlt, markierung: null };
      var sp = a.antwortSprache, ga = artikelAb(gewaehlt, sp), ra = artikelAb(a.loesung, sp);
      var art = (ga.artikel && ra.artikel && ga.artikel !== ra.artikel && ga.rest === ra.rest) ? "artikel" : "falsch";
      return { richtig: false, art: art, arten: [art], treffer: a.loesung, eingabe: gewaehlt, markierung: null };
    }
    var paar = istPaar(a.paar, a.sprache);
    if (a.form === "luecke") {
      var text = antwort;
      if (Object.prototype.toString.call(antwort) === "[object Array]") {
        var z = a.luecke.ziel.split("");
        a.luecke.stellen.forEach(function (i, k) { z[i] = antwort[k] == null ? "" : String(antwort[k]); });
        text = z.join("");
      }
      return werteText(text, a.luecke.ziel, { sprache: a.sprache, paar: paar, nurGenau: true, einst: ein });
    }
    var soll = a.richtung === "b" ? a.paar.de : a.paar.en;
    var sp2 = a.richtung === "b" ? "de" : a.sprache;
    return werteText(antwort, soll, { sprache: sp2, paar: paar, einst: ein });
  }

  /* ================= Anwenden: Auf- und Abstieg ================= */

  function neuerEintrag() {
    return { v: 2, stufe: 1, r1a: false, r1b: false, folge: 0, ordnerSchritt: null, abstand: null,
             fehler: {}, fach: 0, faellig: 0, richtig: 0, falsch: 0 };
  }

  /* anwenden(zustand, abfrage, ergebnis, jetzt, einst)
     -> { zustand (neues Objekt, das alte bleibt), eintrag, ereignis:
          { von, nach, aufgestiegen, abgestiegen, gelernt, extra, nochmal } } */
  function anwenden(zustand, a, erg, jetzt, einstRoh) {
    var ein = einstellungen(einstRoh), tag = tagVon(jetzt);
    var alt = zustand || {}, ereignis = { von: null, nach: null, aufgestiegen: false, abgestiegen: false, gelernt: false, extra: false, nochmal: false };
    if (!a) return { zustand: alt, eintrag: null, ereignis: ereignis };
    if (a.zwischen) { ereignis.zwischen = true; return { zustand: alt, eintrag: alt[a.schl] || null, ereignis: ereignis }; }
    if (ein.nochmalOhneStrafe && !erg.richtig && !a.zweiterVersuch &&
        (erg.art === "tippfehler" || erg.art === "akzent" || erg.art === "artikel") && a.form !== "auswahl") {
      ereignis.nochmal = true;
      return { zustand: alt, eintrag: alt[a.schl] || null, ereignis: ereignis };
    }
    var e = lesen(alt[a.schl], tag) || neuerEintrag();
    var abst = abstaendeVon(ein);
    ereignis.von = e.stufe;

    if (!erg.richtig) {
      e.fehler = e.fehler || {};
      (erg.arten && erg.arten.length ? erg.arten : [erg.art]).forEach(function (x) { if (x && x !== "ok") e.fehler[x] = (e.fehler[x] || 0) + 1; });
      e.letztFalsch = tag;
      e.folge = 0;                                        // jeder Fehler setzt den Zaehler auf 0
    }
    // Extra-Ueben: ein Ordnerwort, das (auch nach Pruefungsregel) nicht dran ist.
    var extra = e.stufe === "ordner" && (a.extra || (!a.pruefung && !(e.faellig <= tag)));

    if (erg.richtig) {
      e.richtig = (e.richtig || 0) + 1;
      if (e.stufe === 1) {
        e["r1" + (a.richtung === "b" ? "b" : "a")] = true;
        if (e.r1a && e.r1b) { e.stufe = 2; e.r1a = e.r1b = false; }
      } else if (e.stufe === 2) {
        e.stufe = 3; e.folge = 0;
      } else if (e.stufe === 3) {
        e.folge = (e.folge || 0) + 1;                     // ueber Sitzungen hinweg, auch am selben Tag
        if (e.folge >= ein.gelerntNach) {
          e.stufe = "ordner"; e.ordnerSchritt = 0; e.abstand = abst[0];
          e.faellig = tag + abst[0]; e.planTag = tag;
          e.gelernt = tag; e.gelerntMal = (e.gelerntMal || 0) + 1;
          ereignis.gelernt = true;
        }
      } else if (e.stufe === "ordner") {
        if (extra) ereignis.extra = true;                 // Abstand bleibt
        else {
          // naechster, laengerer Abstand; nach dem letzten bleibt der letzte.
          var s = Math.min((e.ordnerSchritt == null ? 0 : e.ordnerSchritt) + 1, abst.length - 1);
          e.ordnerSchritt = s; e.abstand = abst[s]; e.faellig = tag + abst[s]; e.planTag = tag;
        }
      }
    } else {
      e.falsch = (e.falsch || 0) + 1;
      if (e.stufe === 1) {
        e["r1" + (a.richtung === "b" ? "b" : "a")] = false;
      } else if (e.stufe === 2) {
        e.stufe = 1; e.r1a = e.r1b = false;               // beide Richtungen wieder offen
      } else if (e.stufe === 3) {
        e.stufe = 2;
      } else if (e.stufe === "ordner") {
        e.stufe = 2; e.ordnerSchritt = null; e.abstand = null;   // raus aus dem Ordner
      }
    }
    if (e.stufe !== "ordner") { e.faellig = tag; e.planTag = tag; }

    e.tag = tag; e.t = jetzt;
    var d = new Date(jetzt);
    e.zuletzt = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    e.fach = fachAusStufe(e); e.fv = e.fach;          // alte Felder fuer eine alte offene Seite
    ereignis.nach = e.stufe;
    var rang = function (x) { return x === "ordner" ? 4 : x; };
    ereignis.aufgestiegen = rang(e.stufe) > rang(ereignis.von);
    ereignis.abgestiegen = rang(e.stufe) < rang(ereignis.von);

    var neu = {};
    for (var k in alt) if (Object.prototype.hasOwnProperty.call(alt, k)) neu[k] = alt[k];
    neu[a.schl] = e;
    return { zustand: neu, eintrag: e, ereignis: ereignis };
  }

  /* Nach jeder Antwort: Verlauf der Sitzung fortschreiben (fuer Abstand,
     "leichter nach Fehler", Zusammenfassung und Fortsetzen). */
  function nachAntwort(s, a, erg, ergebnis) {
    var n = kopie(s);
    n.verlauf.push({ schl: a.schl, form: a.form, richtung: a.richtung, grund: a.grund, richtig: !!erg.richtig,
                     art: erg.art, arten: erg.arten || [], ereignis: ergebnis ? ergebnis.ereignis : null });
    n.anzahl = (n.anzahl || 0) + 1;
    if (a.grund === "wiederholung" || (a.grund === "pruefung" && a.stufe === "ordner")) n.wdh = (n.wdh || 0) + 1;
    return n;
  }

  /* Fortsetzbar am selben Tag (Busfahrt, Netzabbruch, Neuladen). */
  function sitzungGueltig(s, jetzt) {
    return !!(s && s.v === 3 && s.modus !== "leer" && s.tag === tagVon(jetzt));
  }

  function zusammenfassung(s) {
    var r = { abfragen: 0, richtig: 0, falsch: 0, aufgestiegen: 0, abgestiegen: 0, gelernt: 0, akzent: 0, artikel: 0, tippfehler: 0 };
    (s.verlauf || []).forEach(function (x) {
      r.abfragen++;
      if (x.richtig) r.richtig++; else r.falsch++;
      (x.arten || []).forEach(function (a) { if (a === "akzent" || a === "artikel" || a === "tippfehler") r[a]++; });
      if (x.ereignis) {
        if (x.ereignis.aufgestiegen) r.aufgestiegen++;
        if (x.ereignis.abgestiegen) r.abgestiegen++;
        if (x.ereignis.gelernt) r.gelernt++;
      }
    });
    return r;
  }

  /* ================= Uebersicht ================= */

  function inTagenText(n) { return n <= 0 ? "heute" : n === 1 ? "morgen" : "in " + n + " Tagen"; }

  function pruefungZahlen(S, P, tag) {
    var T = tagAusIso(P.termin), stoff = 0, sicher = 0, neu = 0, arbeit = 0;
    S.liste.forEach(function (w) {
      if (w.pruefung !== P) return;
      stoff++;
      if (w.klasse === "ordner") sicher++; else if (w.klasse === "neu") neu++; else arbeit++;
    });
    var tage = T - tag, t = Math.max(1, tage - 1);
    return { termin: P.termin, thema: P.thema || "", inTagen: tage, text: inTagenText(tage), stoff: stoff, sicher: sicher,
             inArbeit: arbeit, neu: neu, neuProTag: neu ? Math.ceil(neu / t) : 0, offenProTag: Math.ceil((neu + arbeit) / t),
             pauseIgnoriert: !!S.pause };
  }

  function uebersicht(zustand, units, jetzt, einstRoh, opt) {
    opt = opt || {};
    var ein = einstellungen(einstRoh), tag = tagVon(jetzt);
    var S = sammeln(zustand || {}, units, tag, ein, opt);
    var r = { stufe1: 0, stufe2: 0, stufe3: 0, ordner: 0, inArbeit: 0, neu: 0, faellig: 0, ueberfaellig: 0,
              fehler: {}, jeEinheit: [], pruefung: null, pause: null, sprache: opt.sprache || "en" };
    var je = {};
    S.liste.forEach(function (w) {
      var u = je[w.unitId] || (je[w.unitId] = { id: w.unitId, name: w.unit.name, hochgeladen: w.info.hochgeladen,
        herkunft: w.info.herkunft, woerter: 0, neu: 0, inArbeit: 0, ordner: 0 });
      u.woerter++;
      if (w.klasse === "neu") { r.neu++; u.neu++; return; }
      var e = w.e;
      for (var f in (e.fehler || {})) r.fehler[f] = (r.fehler[f] || 0) + e.fehler[f];
      if (w.klasse === "ordner") {
        r.ordner++; u.ordner++;
        if (w.istFaellig) { r.faellig++; if (w.faellig < tag) r.ueberfaellig++; }
      } else { r.inArbeit++; u.inArbeit++; r["stufe" + e.stufe]++; }
    });
    for (var k in je) {
      var x = je[k];
      x.pakete = Math.max(1, Math.round(x.woerter / ein.paketGroesse));
      r.jeEinheit.push(x);
    }
    if (S.pruefungen.length) r.pruefung = pruefungZahlen(S, S.pruefungen[0], tag);
    if (S.pause) r.pause = { von: isoAusTag(S.pause.von), bis: isoAusTag(S.pause.bis) };
    return r;
  }

  /* Was die Startseite liest (helena-vokabelstand-en/-fr). Klein halten. */
  function kurzStand(u, jetzt) {
    return { faellig: u.faellig, neu: u.neu, inArbeit: u.inArbeit, sprache: u.sprache,
             pruefungTage: u.pruefung ? u.pruefung.inTagen : null, pause: u.pause ? u.pause.bis : null, stand: jetzt };
  }

  /* Pruefung anlegen (Termin aus dem Probeneintrag, Stoff von Helena).
     Hinweise kommen genau hier einmal - sachlich, ohne Druck: ein knapper
     Termin ("Das sind etwa 30 Wörter pro Tag.") und eine laufende Pause. */
  function pruefungAnlegen(zustand, units, roh, jetzt, einstRoh, opt) {
    opt = opt || {};
    var ein = einstellungen(einstRoh), tag = tagVon(jetzt);
    var termin = String(roh && roh.termin || "").slice(0, 10), T = tagAusIso(termin);
    if (T == null || T <= tag) return { fehler: "Der Termin muss in der Zukunft liegen." };
    var stoff = roh.stoff || {};
    var pr = { termin: termin, thema: roh.thema || "", stoff: stoff, aktiv: true, angelegt: isoAusTag(tag) };
    var S = sammeln(zustand || {}, units, tag, ein, { sprache: opt.sprache, pruefungen: [pr], pausen: opt.pausen });
    var z = pruefungZahlen(S, S.pruefungen[0], tag), hinweise = [];
    if (!z.stoff) return { fehler: "In diesem Stoff liegen keine Wörter." };
    if (z.offenProTag >= ein.pruefungKnappAb) hinweise.push({ art: "knapp", text: "Das sind etwa " + z.offenProTag + " Wörter pro Tag." });
    if (S.pause) hinweise.push({ art: "pause", text: "Gerade ist eine Pause eingestellt. Die Wörter dieser Prüfung werden trotzdem abgefragt.", knopf: "OK" });
    return { pruefung: pr, zahlen: z, hinweise: hinweise };
  }

  /* ================= Sparsam speichern =================
     paul-sync macht aus jedem localStorage.setItem nach 1,5 s einen
     KV-Schreibvorgang (1000 am Tag fuer alle Kinder). Der Sammler haelt den
     Stand waehrend der Sitzung im sessionStorage (synct nicht, ueberlebt
     Neuladen im selben Tab) und schreibt localStorage nur beim
     Sitzungsende und beim Verlassen (pagehide, visibilitychange) - also
     1 bis 2 Schreibvorgaenge je Sitzung statt einem je Antwort. */
  function sammler(opt) {
    var ls = opt.local, ss = opt.session, schl = opt.schluessel, puffer = schl + ":puffer", offen = false, aktuell = null;
    function lies() {
      try { var p = ss && ss.getItem(puffer); if (p) { aktuell = JSON.parse(p); offen = true; return aktuell; } } catch (e) {}
      try { aktuell = JSON.parse((ls && ls.getItem(schl)) || "{}") || {}; } catch (e2) { aktuell = {}; }
      return aktuell;
    }
    function merken(z) {
      aktuell = z; offen = true;
      try { if (ss) ss.setItem(puffer, JSON.stringify(z)); } catch (e) {}
    }
    function sichern() {
      if (!offen || !aktuell) return false;
      try { ls.setItem(schl, JSON.stringify(aktuell)); } catch (e) { return false; }
      offen = false;
      try { if (ss) ss.removeItem(puffer); } catch (e2) {}
      return true;
    }
    if (opt.fenster) {
      opt.fenster.addEventListener("pagehide", sichern);
      opt.fenster.addEventListener("visibilitychange", function () {
        try { if (opt.fenster.document.visibilityState === "hidden") sichern(); } catch (e) {}
      });
    }
    return { lies: lies, merken: merken, sichern: sichern, offen: function () { return offen; } };
  }

  /* Speicherschluessel - je Sprache getrennt ueber das Praefix. P-einstellung
     ueberschreibt die alte Seite komplett, deshalb liegt der Lernplan in
     einem EIGENEN Schluessel. */
  function schluessel(praefix) {
    return { wissen: praefix + "-wissen", einheiten: praefix + "-custom-units", plan: praefix + "-lernplan",
             pruefung: praefix + "-pruefung", sitzung: praefix + "-sitzung", pause: "helena-sprachen-pause" };
  }

  var VokabelLogik = {
    STANDARD: STANDARD, RHYTHMEN: RHYTHMEN, SPRACHEN: SPRACHEN,
    einstellungen: einstellungen, abstaendePruefen: abstaendePruefen, abstaendeVon: abstaendeVon,
    tagVon: tagVon, tagAusIso: tagAusIso, isoAusTag: isoAusTag, zufallMitSaat: zufallMitSaat,
    varianten: variantenVon, istPaar: istPaar, werteText: werteText, markieren: markieren,
    genusVon: genusVon, wortartVon: wortartVon, wortSchluessel: wortSchluessel,
    einheitInfo: einheitInfo, einheitNeu: einheitNeu,
    lesen: lesen, migration: migration, fachAusStufe: fachAusStufe,
    pruefungAusTerminen: pruefungAusTerminen, pruefungAnlegen: pruefungAnlegen, effFaellig: effFaellig,
    lueckenwort: lueckenwort, lueckenZiel: lueckenZiel, paketeVon: paketeVon,
    sitzungStarten: sitzungStarten, naechsteAbfrage: naechsteAbfrage, werten: werten, anwenden: anwenden,
    nachAntwort: nachAntwort, sitzungGueltig: sitzungGueltig, zusammenfassung: zusammenfassung,
    uebersicht: uebersicht, kurzStand: kurzStand, sammler: sammler, schluessel: schluessel
  };
  if (typeof module !== "undefined" && module.exports) module.exports = VokabelLogik;
  else wurzel.VokabelLogik = VokabelLogik;
})(typeof window !== "undefined" ? window : this);
