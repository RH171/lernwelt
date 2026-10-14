/* Rechenkaestchen im Lernquiz (13.10.2026).
 *
 * Anlass: Paul hatte "Rechne schriftlich: 794 − 283 = ?" mit vier Antworten
 * vor sich. Im Kopf schwer, am iPad gibt es kein Papier daneben. Gezaehlt:
 * 10 von 35 Mathe-Blaettern in seinem Heft sind schriftliches Rechnen.
 * Denny per Klickfrage: "A · Rechenkaestchen".
 *
 * Was es ist: ein Schmierblatt in Kaestchen, wie im Heft. Stellenwert-Spalten,
 * Zahlen rechtsbuendig untereinander, Rechenzeichen links, Strich, darunter
 * leere Ergebniskaestchen, ueber dem Strich kleine Uebertragskaestchen.
 *
 * Was es NICHT ist: eine Pruefung. Es vergleicht nichts, markiert nichts,
 * verraet nichts. Paul waehlt danach selbst seine Antwort. Es wird nichts
 * gespeichert und nichts gemeldet (keine Schreibvorgaenge).
 *
 * Wann es erscheint: nur, wenn im Fragetext "schriftlich" steht (NICHT
 * "halbschriftlich" - das ist ein anderer Rechenweg) UND genau eine saubere
 * Plus- oder Minusaufgabe drinsteht. Erkennt es nichts Sauberes, gibt es kein
 * Feld - lieber keins als eins mit falschen Zahlen.
 * Malnehmen und Teilen sind bewusst nicht dabei: schriftliches Teilen hat ein
 * ganz anderes Bild, und beim Malnehmen haengt die Schreibweise der
 * Ergebniszeile an der Klasse - eine falsche Vorlage waere schlimmer als keine.
 *
 *   window.Rechenkaestchen.erkenne(text) -> { op, zahlen } | null
 *   window.Rechenkaestchen.malen(huelle, text)  -> true, wenn ein Feld steht
 */
(function () {
  "use strict";

  var STELLEN = ["E", "Z", "H", "T", "ZT", "HT", "M"];
  var STELLEN_LANG = ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender", "Hunderttausender", "Millionen"];

  /* Eine Zahl: 794 · 1245 · 1.245 · 12 345 (Tausenderpunkt oder -luecke). */
  var ZAHL = "\\d{1,3}(?:[.\\u00a0\\u202f ]\\d{3})+(?!\\d)|\\d+";
  var KETTE = new RegExp("(" + ZAHL + ")((?:\\s*[+-]\\s*(?:" + ZAHL + "))+)", "g");

  function erkenne(text) {
    var t = String(text || "");
    // "schriftlich", aber nicht "halbschriftlich".
    if (!/(^|[^a-zäöüß])schriftlich/i.test(t)) return null;
    // Minuszeichen vereinheitlichen: − (U+2212), – (Halbgeviert), — (Geviert).
    t = t.replace(/[−–—]/g, "-");

    var treffer = [], m;
    KETTE.lastIndex = 0;
    while ((m = KETTE.exec(t))) treffer.push({ text: m[0], von: m.index, bis: m.index + m[0].length });
    if (treffer.length !== 1) return null;           // keine oder mehrere Rechnungen: unklar
    var k = treffer[0];

    // Davor darf kein Rechenzeichen, keine Ziffer und kein Komma stehen
    // ("3 · 4 + 5" ist keine Plusaufgabe), dahinter kein Mal-/Geteiltzeichen
    // und keine Kommazahl.
    var vor = t.slice(0, k.von).replace(/\s+$/, "");
    var nach = t.slice(k.bis).replace(/^\s+/, "");
    // Ein Doppelpunkt davor ist Satzzeichen ("Rechne schriftlich: 794 − 283"),
    // nach einer Zahl aber ein Geteiltzeichen ("12 : 3 + 4").
    if (/[\d,+\-·×*÷\/]$/.test(vor) || /\d\s*:$/.test(vor)) return null;
    if (/^([·×*:÷\/]|,\d|\.\d)/.test(nach)) return null;
    if (/[·×*÷]/.test(t)) return null;                 // eine Mal-/Geteiltaufgabe daneben

    var teile = k.text.split(/\s*([+-])\s*/);
    var zahlen = [], ops = [];
    for (var i = 0; i < teile.length; i++) {
      if (i % 2) ops.push(teile[i]);
      else zahlen.push(teile[i].replace(/[.   ]/g, ""));
    }
    var op = ops[0];
    if (ops.some(function (o) { return o !== op; })) return null;   // gemischt: kein Spaltenrechnen
    if (zahlen.some(function (z) { return !/^\d{1,6}$/.test(z); })) return null;
    zahlen = zahlen.map(function (z) { return String(Number(z)); }); // fuehrende Nullen weg
    if (op === "+" && (zahlen.length < 2 || zahlen.length > 4)) return null;
    if (op === "-") {
      if (zahlen.length !== 2) return null;
      if (Number(zahlen[0]) < Number(zahlen[1])) return null;       // kein Minus unter null
    }
    return { op: op, zahlen: zahlen };
  }

  /* ---------- Anzeige ---------- */

  var feld = null;   // der Zustand des gerade gezeigten Feldes

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* opts (14.10.2026, Rechenweg im Probenstoff): { ohneBlock, ohneTasten } – die Seite hat
     schon einen Ziffernblock und lenkt die Ziffern selbst über tippe()/loesche() hierher. */
  function malen(huelle, text, opts) {
    opts = opts || {};
    if (!huelle) return false;
    huelle.innerHTML = "";
    feld = null;
    var a = erkenne(text);
    if (!a) { huelle.classList.add("verborgen"); return false; }

    var laengste = Math.max.apply(null, a.zahlen.map(function (z) { return z.length; }));
    // Plus kann eine Stelle mehr ergeben (999 + 1 = 1000). Bei mehreren
    // Summanden mehr: das Ergebnis hat hoechstens so viele Stellen wie die
    // groesstmoegliche Summe.
    var stellen = a.op === "+"
      ? String(a.zahlen.reduce(function (s) { return s + (Math.pow(10, laengste) - 1); }, 0)).length
      : laengste;
    var spalten = stellen + 1;                        // Spalte 0: Rechenzeichen

    huelle.classList.remove("verborgen");
    huelle.setAttribute("data-spalten", String(spalten));

    var knopf = el("button", "rk-auf", "");
    knopf.type = "button";
    knopf.setAttribute("aria-expanded", "true");
    knopf.innerHTML = '✏️ Untereinander rechnen <span class="rk-pfeil" aria-hidden="true">▴</span>';
    huelle.appendChild(knopf);

    var koerper = el("div", "rk-koerper");
    huelle.appendChild(koerper);

    var gitter = el("div", "rk-gitter");
    gitter.style.setProperty("--rk-spalten", String(spalten));
    gitter.setAttribute("role", "group");
    gitter.setAttribute("aria-label", "Rechenkästchen zum Untereinander-Rechnen");
    koerper.appendChild(gitter);

    // Kopfzeile: Stellenwerte, rechts die Einer.
    gitter.appendChild(el("div", "rk-kopf rk-zeichen", ""));
    for (var s = stellen - 1; s >= 0; s--) {
      var kz = el("div", "rk-kopf", STELLEN[s]);
      kz.title = STELLEN_LANG[s];
      gitter.appendChild(kz);
    }

    // Die Zahlen, rechtsbuendig. Die erste ohne Zeichen.
    a.zahlen.forEach(function (z, zi) {
      gitter.appendChild(el("div", "rk-zelle rk-zeichen", zi ? (a.op === "-" ? "−" : "+") : ""));
      for (var sp = stellen - 1; sp >= 0; sp--) {
        var ziffer = sp < z.length ? z.charAt(z.length - 1 - sp) : "";
        var c = el("div", "rk-zelle rk-ziffer", ziffer);
        c.setAttribute("data-stelle", STELLEN[sp]);
        c.setAttribute("data-zeile", String(zi));
        gitter.appendChild(c);
      }
    });

    // Uebertragskaestchen ueber dem Strich (unter der letzten Zahl).
    var uebertrag = [], ergebnis = [];
    gitter.appendChild(el("div", "rk-zelle rk-zeichen rk-uezeile", ""));
    for (var su = stellen - 1; su >= 0; su--) {
      var u = el("button", "rk-ue");
      u.type = "button";
      u.setAttribute("data-stelle", STELLEN[su]);
      u.setAttribute("aria-label", "Übertrag " + STELLEN_LANG[su]);
      u.appendChild(el("span", "rk-ue-k", ""));
      if (su === 0) u.disabled = true;               // zu den Einern kommt nie ein Uebertrag
      uebertrag[su] = u;
      gitter.appendChild(u);
    }

    // Strich und Ergebniszeile.
    gitter.appendChild(el("div", "rk-strich"));
    gitter.appendChild(el("div", "rk-zelle rk-zeichen", ""));
    for (var se = stellen - 1; se >= 0; se--) {
      var e = el("button", "rk-erg", "");
      e.type = "button";
      e.setAttribute("data-stelle", STELLEN[se]);
      e.setAttribute("aria-label", "Ergebnis " + STELLEN_LANG[se]);
      ergebnis[se] = e;
      gitter.appendChild(e);
    }

    // Ziffernblock statt Bildschirmtastatur - die wuerde das Feld verdecken.
    var block = el("div", "rk-block");
    block.setAttribute("role", "group");
    block.setAttribute("aria-label", "Ziffern");
    [1, 2, 3, 4, 5, 6, 7, 8, 9, "weg", 0].forEach(function (w) {
      var b = el("button", "rk-taste" + (w === "weg" ? " rk-weg" : ""), w === "weg" ? "⌫" : String(w));
      b.type = "button";
      if (w === "weg") b.setAttribute("aria-label", "Löschen");
      b.addEventListener("click", function () { if (w === "weg") loeschen(); else tippen(String(w)); });
      block.appendChild(b);
    });
    if (!opts.ohneBlock) koerper.appendChild(block);

    feld = { ohneTasten: !!opts.ohneTasten, huelle: huelle, ergebnis: ergebnis, uebertrag: uebertrag, aktiv: null, stellen: stellen };

    ergebnis.forEach(function (b, i) { b.addEventListener("click", function () { waehle("erg", i); }); });
    uebertrag.forEach(function (b, i) { b.addEventListener("click", function () { waehle("ue", i); }); });
    knopf.addEventListener("click", function () {
      var zu = !huelle.classList.contains("rk-zu");
      huelle.classList.toggle("rk-zu", zu);
      knopf.setAttribute("aria-expanded", zu ? "false" : "true");
    });

    waehle("erg", 0);                                 // es geht bei den Einern los
    return true;
  }

  function kaestchen(art, i) {
    if (!feld) return null;
    return (art === "erg" ? feld.ergebnis : feld.uebertrag)[i] || null;
  }

  function waehle(art, i) {
    if (!feld) return;
    var k = kaestchen(art, i);
    if (!k || k.disabled) return;
    if (feld.aktiv) { var alt = kaestchen(feld.aktiv.art, feld.aktiv.i); if (alt) alt.classList.remove("an"); }
    feld.aktiv = { art: art, i: i };
    k.classList.add("an");
  }

  function setze(k, z) {
    if (k.classList.contains("rk-ue")) k.firstChild.textContent = z;
    else k.textContent = z;
    k.classList.toggle("voll", !!z);
  }
  function inhalt(k) { return k.classList.contains("rk-ue") ? k.firstChild.textContent : k.textContent; }

  /* Eintippen: Ergebnis von rechts nach links. Nach einem Uebertrag geht es
     in dieselbe Spalte darunter - der Uebertrag gehoert zu der Spalte, die
     als naechste gerechnet wird. */
  function tippen(z) {
    if (!feld || !feld.aktiv) return;
    var a = feld.aktiv, k = kaestchen(a.art, a.i);
    if (!k) return;
    setze(k, z);
    if (a.art === "ue") waehle("erg", a.i);
    else if (a.i + 1 < feld.stellen) waehle("erg", a.i + 1);
  }

  /* Loeschen: das aktive Kaestchen leeren. War es schon leer, eins nach
     rechts zuruecklaufen und das leeren - wie die Ruecktaste. */
  function loeschen() {
    if (!feld || !feld.aktiv) return;
    var a = feld.aktiv, k = kaestchen(a.art, a.i);
    if (!k) return;
    if (inhalt(k)) { setze(k, ""); return; }
    if (a.art === "erg" && a.i > 0) {
      waehle("erg", a.i - 1);
      setze(kaestchen("erg", a.i - 1), "");
    }
  }

  // Am Laptop auch mit der Tastatur. Nur solange ein Feld sichtbar ist.
  document.addEventListener("keydown", function (e) {
    if (!feld || feld.ohneTasten || !feld.huelle.isConnected || feld.huelle.classList.contains("verborgen") ||
        feld.huelle.classList.contains("rk-zu") || !feld.huelle.offsetParent) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e["key"];
    if (/^[0-9]$/.test(t)) { tippen(t); e.preventDefault(); }
    else if (t === "Backspace" || t === "Delete") { loeschen(); e.preventDefault(); }
  });

  /* Was in den Ergebniskaestchen steht, als Zahl-Text (leer, wenn nichts drin).
     Prueft nichts: die Seite entscheidet, was sie damit macht. */
  function wert() {
    if (!feld) return "";
    var s = "";
    for (var i = feld.stellen - 1; i >= 0; i--) s += inhalt(feld.ergebnis[i]) || "";
    return s.replace(/^0+(?=\d)/, "");
  }

  window.Rechenkaestchen = { erkenne: erkenne, malen: malen, tippe: tippen, loesche: loeschen, wert: wert };
})();
