/* Schmierblatt (14.10.2026) – Nebenrechnungen mit dem Finger, wie auf dem Probenblatt.
 *
 * Für die Generalprobe Mathe: In der echten Probe darf Paul auf dem Blatt Nebenrechnungen
 * machen. Eine Zerlegung in Schritte oder ein Prüfen der Zwischenergebnisse gäbe es dort nicht,
 * deshalb hier nur eine freie Fläche zum Schreiben. Sie prüft nichts, verrät nichts,
 * speichert nichts (kein Schreibvorgang, kein localStorage) und ist beim nächsten Teil wieder leer.
 *
 *   window.Schmierblatt.malen(huelle)  -> legt Knopf und Fläche in die Hülle
 *
 * Rechnen-Knopf im Lernquiz (30.10.2026, Auftrag 179, nur Paul): dieselbe Fläche, mit opts:
 *   window.Schmierblatt.malen(huelle, { knopf: "✏️ Rechnen", werkzeug: true, auf: fn })
 *   werkzeug: Stiftfarben, Radierer, "Alles löschen" (statt "Leeren"); ein Stift (Apple Pencil)
 *   hat Vorrang vor der Hand: Hat die Fläche einmal einen Stift gesehen, zeichnet ein Finger
 *   nicht mehr mit (Handballen). Ohne opts ist alles wie vorher (Generalprobe Mathe).
 *
 * Lineal (02.11.2026, Auftrag 192, nur Paul, nur mit werkzeug und lineal: true): Paul: "Ohne Lineal
 * und so will ich die leere Hand nicht haben." Zwei Knöpfe kommen dazu, zuerst versteckt:
 *   "📏 Lineal": an/aus. An = Finger oder Stift ansetzen, ziehen, loslassen gibt eine gerade Linie,
 *     beim Ziehen als Vorschau. Anfang und Ende rasten an den Kästchenecken ein, unter 8 Grad
 *     Abweichung wird die Linie waagerecht oder senkrecht. Farbe wie gewählt; der Stift bleibt frei.
 *   "↶ Zurück": nimmt den letzten Strich zurück (Stift, Lineal, Radierer, "Alles löschen").
 * huelle.sbLineal(true) zeigt die Knöpfe (rechenflaeche.js nach dem Schalter "lineal").
 *
 * Zeichnen | Tippen (03.11.2026, nur Paul, nur mit werkzeug und tippen: true): Paul spielt am Mac
 * mit der Maus: „… wenn ich da schriftlich rechnen könnte … Sonst müsste ich das jetzt mit meiner
 * Maus in der Tabelle machen.“ Ein Umschalter „✏️ Zeichnen | ⌨️ Tippen“ kommt über die Leiste,
 * zuerst versteckt. Tippen = großes Textfeld in Festbreitenschrift, damit Zahlen untereinander
 * stehen wie im Heft. Erlaubt: Ziffern, Leerzeichen, Zeilen, + - − · × : ÷ = , . (* wird ·, / wird :).
 * Standard: Tippen nur an einem reinen Maus-Gerät (kein Touch: maxTouchPoints 0 UND any-pointer
 * nicht coarse), sonst Zeichnen. Pauls Wahl wird je Gerät gemerkt (localStorage, nur nach einem
 * Klick auf den Umschalter). Der Text wird nirgends gespeichert und zählt nirgends.
 * huelle.sbTippen(true) zeigt den Umschalter (rechenflaeche.js nach dem Schalter "rechentippen").
 *
 * Rechentabelle im Tippen-Teil (05.11.2026, Auftrag 210, nur Paul): Paul tippte 610 − 322 ins freie
 * Textfeld und musste jede Stelle mit Leerzeichen selbst ausrichten („dafür 5 Minuten gebraucht“).
 * Sein Wunsch: „dass das halt sich von selber gerade stellt“. huelle.sbTafel(true, fragetext) legt
 * vor das Textfeld eine Stellentafel: Kopf T H Z E (so viele Stellen wie die Aufgabe braucht, sonst 4),
 * Rechenzeichen vorgegeben (aus der Frage, antippen wechselt + / −), je Zahl eine Zeile mit festen
 * Kästchen - die Ziffern rücken von rechts ein, die Einer stehen immer unter den Einern -, darunter
 * kleine Übertragskästchen, Strich und Ergebniskästchen, die nach jeder Ziffer eins nach links springen.
 * Malnehmen und Teilen haben ein anderes Bild: Dort (und auf Wunsch immer) bleibt „📝 Freies Feld“.
 * Die Tafel prüft nichts, verrät nichts, speichert nichts (kein localStorage, kein Server).
 */
(function () {
  "use strict";
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  var FARBEN = [["Schwarz", "#1f2937"], ["Blau", "#1d4ed8"], ["Grün", "#047857"]];

  /* Zeichnen oder Tippen: Pauls letzte Wahl auf diesem Gerät, sonst nach dem Gerät.
     ⚠️ pointer:coarse allein taugt nicht (Kapitel 003): Das iPad meldet sich als Mac, und ein
     Testbrowser in iPad-Breite meldet ohne Touch-Nachbildung "fine". Verlässlich ist
     maxTouchPoints (iPad 5, Mac 0); any-pointer: coarse fängt Geräte mit Maus UND Touchschirm. */
  var MODUS = "lw-rechenflaeche-modus-paul";
  function modusGemerkt() {
    try { var m = window.localStorage.getItem(MODUS); return m === "tippen" || m === "zeichnen" ? m : null; } catch (e) { return null; }
  }
  function modusMerken(m) { try { window.localStorage.setItem(MODUS, m); } catch (e) {} }
  function nurMaus() {
    var touch = 0, grob = false;
    try { touch = Number(navigator.maxTouchPoints) || 0; } catch (e) {}
    try { grob = !!(window.matchMedia && window.matchMedia("(any-pointer: coarse)").matches); } catch (e) {}
    return touch === 0 && !grob;
  }
  function modusStandard() { return modusGemerkt() || (nurMaus() ? "tippen" : "zeichnen"); }
  /* Was im Textfeld stehen darf. */
  function textSaeubern(t) {
    return String(t).replace(/\*/g, "\u00B7").replace(/\//g, ":").replace(/[^0-9 \n+\-\u2212\u00B7\u00D7:\u00F7=.,]/g, "");
  }

  /* ---------- Rechentabelle (Stellentafel) ---------- */
  var STELLE = ["E", "Z", "H", "T", "ZT", "HT", "M"];
  var STELLE_LANG = ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender", "Hunderttausender", "Millionen"];
  /* Was steht in der Frage? Nur die erste saubere Rechnung zählt: "610 − 322", "347 + 285 + 19".
     Ergebnis: { op: "+"|"-"|"mal"|"geteilt"|null, stellen } - die Zahlen selbst trägt Paul ein. */
  function tafelAus(text) {
    var t = String(text || "").replace(/[−–—]/g, "-").replace(/(\d)[.   ](?=\d{3}(?!\d))/g, "$1");
    var m = /(\d+)\s*([+\-·×*:÷])\s*(\d+)((?:\s*\2\s*\d+)*)/.exec(t);
    if (!m) return { op: null, stellen: 4 };
    var zeichen = m[2], zahlen = (m[1] + " " + m[3] + " " + (m[4] || "").replace(/[^\d ]/g, " ")).trim().split(/\s+/);
    var op = zeichen === "+" ? "+" : zeichen === "-" ? "-" : /[:÷]/.test(zeichen) ? "geteilt" : "mal";
    var laengste = Math.max.apply(null, zahlen.map(function (z) { return String(Number(z)).length; }));
    var stellen = laengste + (op === "+" && zahlen.length > 1 ? 1 : 0);
    if (op === "+" && zahlen.length > 1) {
      var summe = zahlen.reduce(function (s, z) { return s + Number(z); }, 0);
      stellen = Math.max(laengste, String(summe).length);
    }
    return { op: op, stellen: Math.min(7, Math.max(3, stellen)), anzahl: Math.min(4, Math.max(2, zahlen.length)) };
  }
  function tafelBauen(ziel, text) {
    var a = tafelAus(text);
    var st = { stellen: a.stellen, op: a.op === "-" ? "-" : "+", zeilen: a.op === "+" ? a.anzahl : 2 };
    var wurzel = el("div", "sb-tafel-innen");
    ziel.innerHTML = ""; ziel.appendChild(wurzel);
    var leiste = el("div", "sb-tafelleiste");
    var zeichenKnopf = el("button", "sb-tafel-op");
    zeichenKnopf.type = "button";
    var mehr = el("button", "sb-tafel-zeile", "＋ Zahl"); mehr.type = "button";
    var weniger = el("button", "sb-tafel-zeile", "− Zahl"); weniger.type = "button";
    var stelleDazu = el("button", "sb-tafel-stelle", "＋ Stelle"); stelleDazu.type = "button";
    var tLeeren = el("button", "sb-text-leeren", "Alles löschen"); tLeeren.type = "button";
    [zeichenKnopf, mehr, weniger, stelleDazu, tLeeren].forEach(function (b) { leiste.appendChild(b); });
    var gitter = el("div", "sb-tafel");
    gitter.setAttribute("role", "group");
    gitter.setAttribute("aria-label", "Rechentabelle: Zahlen untereinander, die Einer stehen rechts");
    wurzel.appendChild(leiste); wurzel.appendChild(gitter);

    var zahlen = [], ue = [], erg = [];          // zahlen: Text je Zeile; ue/erg: Ziffer je Stelle (0 = Einer)
    function nur(z) { return String(z || "").replace(/\D/g, ""); }
    function feld(cls, label, gross) {
      var f = el("input", cls);
      f.type = "text"; f.setAttribute("inputmode", "numeric"); f.setAttribute("pattern", "[0-9]*");
      f.setAttribute("autocomplete", "off"); f.setAttribute("autocorrect", "off"); f.setAttribute("autocapitalize", "off");
      f.setAttribute("spellcheck", "false"); f.setAttribute("enterkeyhint", "next");
      f.setAttribute("aria-label", label);
      if (!gross) f.maxLength = 1;
      ["keydown", "keyup", "keypress", "beforeinput"].forEach(function (art) {
        f.addEventListener(art, function (e) { e.stopPropagation(); });
      });
      f.addEventListener("focus", function () {
        try { f.scrollIntoView({ block: "nearest" }); } catch (x) {}
      });
      return f;
    }
    function bauen() {
      var n = st.stellen, spalten = n + 1;
      gitter.innerHTML = "";
      gitter.style.setProperty("--sb-spalten", String(spalten));
      gitter.setAttribute("data-stellen", String(n));
      zeichenKnopf.textContent = "Rechenzeichen: " + (st.op === "-" ? "−" : "+");
      zeichenKnopf.setAttribute("aria-label", "Rechenzeichen " + (st.op === "-" ? "minus" : "plus") + ", antippen zum Wechseln");
      mehr.hidden = st.op !== "+" || st.zeilen >= 4;
      weniger.hidden = st.op !== "+" || st.zeilen <= 2;
      stelleDazu.hidden = n >= 7;
      while (zahlen.length < st.zeilen) zahlen.push("");
      zahlen.length = st.zeilen;
      // Kopf: Stellenwerte, rechts die Einer.
      gitter.appendChild(el("div", "sb-tk", ""));
      for (var s = n - 1; s >= 0; s--) { var k = el("div", "sb-tk", STELLE[s]); k.title = STELLE_LANG[s]; gitter.appendChild(k); }
      // Zahlenzeilen: ein Eingabefeld über festen Kästchen, die Ziffern rücken von rechts ein.
      zahlen.forEach(function (wert, zi) {
        gitter.appendChild(el("div", "sb-tz sb-tz-zahl", zi ? (st.op === "-" ? "−" : "+") : ""));
        var zeile = el("div", "sb-tzeile");
        zeile.style.gridColumn = "2 / span " + n;
        var kaesten = [];
        for (var sp = n - 1; sp >= 0; sp--) { var c = el("div", "sb-tzelle"); c.setAttribute("data-stelle", STELLE[sp]); zeile.appendChild(c); kaesten[sp] = c; }
        var f = feld("sb-tzahl", (zi + 1) + ". Zahl eintippen, die Einer stehen rechts", true);
        f.maxLength = n;
        f.value = wert;
        function zeigen() {
          var v = nur(f.value).slice(0, n);
          if (v !== f.value) f.value = v;
          zahlen[zi] = v;
          for (var i = 0; i < n; i++) kaesten[i].textContent = i < v.length ? v.charAt(v.length - 1 - i) : "";
        }
        f.addEventListener("input", function (e) { e.stopPropagation(); zeigen(); });
        f.addEventListener("focus", function () { zeile.classList.add("an"); });
        f.addEventListener("blur", function () { zeile.classList.remove("an"); });
        f.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); var nx = gitter.querySelectorAll(".sb-tzahl")[zi + 1] || ergFelder[0]; if (nx) nx.focus(); }
        });
        zeile.appendChild(f);
        gitter.appendChild(zeile);
        zeigen();
      });
      // Übertrag: kleine Kästchen unter der letzten Zahl, zu den Einern kommt keiner.
      gitter.appendChild(el("div", "sb-tz sb-tz-ue", ""));
      var ueFelder = [], ergFelder = [];
      for (var su = n - 1; su >= 0; su--) {
        var zelle = el("div", "sb-tue-zelle");
        if (su > 0) {
          var u = feld("sb-tue", "Übertrag " + STELLE_LANG[su]);
          u.value = ue[su] || ""; u.dataset.i = String(su);
          zelle.appendChild(u); ueFelder[su] = u;
        }
        gitter.appendChild(zelle);
      }
      gitter.appendChild(el("div", "sb-tstrich"));
      gitter.appendChild(el("div", "sb-tz", ""));
      for (var se = n - 1; se >= 0; se--) {
        var e = feld("sb-terg", "Ergebnis " + STELLE_LANG[se]);
        e.value = erg[se] || ""; e.dataset.i = String(se);
        gitter.appendChild(e); ergFelder[se] = e;
      }
      // Ergebnis: Ziffer rein -> eins nach links; leer und Rücktaste -> eins nach rechts.
      ergFelder.forEach(function (f, i) {
        f.addEventListener("input", function (ev) {
          ev.stopPropagation();
          var v = nur(f.value);
          if (v.length > 1) {                       // mehrere Ziffern auf einmal: von rechts verteilen
            for (var j = 0; j < v.length && i + j < n; j++) { ergFelder[i + j].value = v.charAt(v.length - 1 - j); erg[i + j] = ergFelder[i + j].value; }
            var weiter = ergFelder[Math.min(n - 1, i + v.length)]; if (weiter) weiter.focus();
            return;
          }
          f.value = v; erg[i] = v;
          if (v && i + 1 < n) ergFelder[i + 1].focus();
        });
        f.addEventListener("keydown", function (ev) {
          if (ev.key === "Backspace" && !f.value && i > 0) { ev.preventDefault(); ergFelder[i - 1].value = ""; erg[i - 1] = ""; ergFelder[i - 1].focus(); }
          else if (ev.key === "ArrowLeft" && i + 1 < n) { ev.preventDefault(); ergFelder[i + 1].focus(); }
          else if (ev.key === "ArrowRight" && i > 0) { ev.preventDefault(); ergFelder[i - 1].focus(); }
        });
      });
      // Übertrag: Ziffer rein -> weiter ins Ergebnis derselben Spalte (die wird als nächste gerechnet).
      ueFelder.forEach(function (f, i) {
        if (!f) return;
        f.addEventListener("input", function (ev) {
          ev.stopPropagation();
          var v = nur(f.value).slice(-1); f.value = v; ue[i] = v;
          if (v && ergFelder[i]) ergFelder[i].focus();
        });
      });
      ue = ue.slice(0, n); erg = erg.slice(0, n);
    }
    leiste.addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("button") : null;
      if (!b) return;
      if (b === zeichenKnopf) { st.op = st.op === "-" ? "+" : "-"; if (st.op === "-") st.zeilen = 2; }
      else if (b === mehr) st.zeilen = Math.min(4, st.zeilen + 1);
      else if (b === weniger) st.zeilen = Math.max(2, st.zeilen - 1);
      else if (b === stelleDazu) st.stellen = Math.min(7, st.stellen + 1);
      else if (b === tLeeren) { zahlen = []; ue = []; erg = []; }
      bauen();
      if (b === tLeeren) { var f0 = gitter.querySelector(".sb-tzahl"); if (f0) f0.focus(); }
    });
    bauen();
    return {
      erste: function () { return gitter.querySelector(".sb-tzahl"); },
      art: a.op,
      stand: function () { return { stellen: st.stellen, op: st.op, zahlen: zahlen.slice(), ue: ue.slice(), erg: erg.slice() }; }
    };
  }

  function malen(huelle, opts) {
    if (!huelle) return;
    opts = opts || {};
    var wz = !!opts.werkzeug;
    huelle.innerHTML = "";
    huelle.classList.add("sb", "sb-zu");
    var knopf = el("button", "sb-auf", opts.knopf || "✏️ Schmierblatt für Nebenrechnungen");
    knopf.type = "button";
    knopf.setAttribute("aria-expanded", "false");
    var koerper = el("div", "sb-koerper");
    var flaeche = el("canvas", "sb-flaeche");
    flaeche.setAttribute("aria-label", wz ? "Rechenfläche: hier mit Stift oder Finger rechnen" : "Schmierblatt: hier mit dem Finger rechnen");
    var leeren = el("button", "sb-leeren", wz ? "Alles löschen" : "Leeren");
    leeren.type = "button";
    var farbe = null, radiert = false, leiste = null, lineal = false, linKnopf = null, zurueck = null;
    var modusLeiste = null, tippTeil = null, textFeld = null, modus = "zeichnen";
    var artLeiste = null, tafelTeil = null, freiTeil = null, tafel = null, art = "frei";
    if (wz) {
      leiste = el("div", "sb-leiste");
      FARBEN.forEach(function (f, n) {
        var b = el("button", "sb-farbe" + (n === 0 ? " an" : ""));
        b.type = "button";
        b.setAttribute("aria-label", "Stift " + f[0]);
        b.setAttribute("aria-pressed", n === 0 ? "true" : "false");
        b.dataset.farbe = f[1];
        b.appendChild(el("i")).style.background = f[1];
        leiste.appendChild(b);
      });
      var rad = el("button", "sb-radierer", "Radierer");
      rad.type = "button"; rad.setAttribute("aria-pressed", "false");
      leiste.appendChild(rad);
      if (opts.lineal) {
        linKnopf = el("button", "sb-lineal", "📏 Lineal");
        linKnopf.type = "button"; linKnopf.setAttribute("aria-pressed", "false"); linKnopf.hidden = true;
        zurueck = el("button", "sb-zurueck", "↶ Zurück");
        zurueck.type = "button"; zurueck.hidden = true; zurueck.disabled = true;
        leiste.appendChild(linKnopf); leiste.appendChild(zurueck);
      }
      leiste.appendChild(leeren);
      farbe = FARBEN[0][1];
      leiste.addEventListener("click", function (ev) {
        var b = ev.target.closest ? ev.target.closest("button") : null;
        if (!b || b === leeren || b === zurueck) return;
        if (b === linKnopf) {
          /* Lineal an/aus; vom Radierer aus geht es mit der letzten Farbe weiter. */
          lineal = radiert ? true : !lineal; radiert = false;
        } else {
          radiert = b === rad;
          if (!radiert) farbe = b.dataset.farbe;
        }
        [].forEach.call(leiste.querySelectorAll(".sb-farbe,.sb-radierer"), function (x) {
          var an = radiert ? x === rad : (x !== rad && x.dataset.farbe === farbe);
          x.classList.toggle("an", an); x.setAttribute("aria-pressed", an ? "true" : "false");
        });
        if (linKnopf) {
          var la = lineal && !radiert;
          linKnopf.classList.toggle("an", la); linKnopf.setAttribute("aria-pressed", la ? "true" : "false");
        }
      });
      if (opts.tippen) {
        /* Zeichnen | Tippen: zuerst versteckt (huelle.sbTippen). */
        modusLeiste = el("div", "sb-modus");
        modusLeiste.setAttribute("role", "group");
        modusLeiste.setAttribute("aria-label", "Zeichnen oder Tippen");
        modusLeiste.hidden = true;
        [["zeichnen", "✏️ Zeichnen"], ["tippen", "⌨️ Tippen"]].forEach(function (m) {
          var b = el("button", "sb-modus-" + m[0], m[1]);
          b.type = "button"; b.dataset.modus = m[0]; b.setAttribute("aria-pressed", "false");
          modusLeiste.appendChild(b);
        });
        koerper.appendChild(modusLeiste);
        tippTeil = el("div", "sb-tippen");
        tippTeil.hidden = true;
        var tl = el("div", "sb-tippleiste");
        ["+", "\u2212", "\u00B7", ":", "="].forEach(function (z) {
          var b = el("button", "sb-zeichen", z);
          b.type = "button"; b.dataset.zeichen = z; b.setAttribute("aria-label", "Zeichen " + z + " einfügen");
          tl.appendChild(b);
        });
        var tLeeren = el("button", "sb-text-leeren", "Alles löschen");
        tLeeren.type = "button";
        tl.appendChild(tLeeren);
        textFeld = el("textarea", "sb-text");
        textFeld.setAttribute("aria-label", "Rechenfeld zum Tippen: Zahlen untereinander schreiben");
        textFeld.setAttribute("spellcheck", "false"); textFeld.spellcheck = false;
        textFeld.setAttribute("autocomplete", "off");
        textFeld.setAttribute("autocorrect", "off");
        textFeld.setAttribute("autocapitalize", "off");
        textFeld.setAttribute("inputmode", "text");
        textFeld.setAttribute("wrap", "off");
        textFeld.placeholder = "  347\n+ 285\n-----\n  632";
        /* Rechentabelle | Freies Feld (05.11.2026): zuerst versteckt, huelle.sbTafel zeigt sie. */
        artLeiste = el("div", "sb-art");
        artLeiste.setAttribute("role", "group");
        artLeiste.setAttribute("aria-label", "Rechentabelle oder freies Feld");
        artLeiste.hidden = true;
        [["tafel", "🔢 Rechentabelle"], ["frei", "📝 Freies Feld"]].forEach(function (m) {
          var b = el("button", "sb-art-" + m[0], m[1]);
          b.type = "button"; b.dataset.art = m[0]; b.setAttribute("aria-pressed", "false");
          artLeiste.appendChild(b);
        });
        tafelTeil = el("div", "sb-tafelteil");
        tafelTeil.hidden = true;
        freiTeil = el("div", "sb-frei");
        freiTeil.appendChild(tl);
        freiTeil.appendChild(textFeld);
        tippTeil.appendChild(artLeiste);
        tippTeil.appendChild(tafelTeil);
        tippTeil.appendChild(freiTeil);
        /* Tasten bleiben im Feld: Rechenkästchen und Rechenspiele hören am Dokument auf Ziffern. */
        ["keydown", "keyup", "keypress", "beforeinput"].forEach(function (art) {
          textFeld.addEventListener(art, function (e) { e.stopPropagation(); });
        });
        textFeld.addEventListener("input", function (e) {
          e.stopPropagation();
          var v = textFeld.value, sauber = textSaeubern(v);
          if (sauber === v) return;
          var pos = textFeld.selectionStart || 0;
          var vorn = textSaeubern(v.slice(0, pos)).length;
          textFeld.value = sauber;
          try { textFeld.setSelectionRange(vorn, vorn); } catch (x) {}
        });
        tl.addEventListener("click", function (ev) {
          var b = ev.target.closest ? ev.target.closest("button") : null;
          if (!b) return;
          if (b === tLeeren) { textFeld.value = ""; textFeld.focus(); return; }
          var z = b.dataset.zeichen; if (!z) return;
          var a = textFeld.selectionStart, en = textFeld.selectionEnd, v = textFeld.value;
          if (typeof a !== "number") { a = en = v.length; }
          textFeld.value = v.slice(0, a) + z + v.slice(en);
          textFeld.focus();
          try { textFeld.setSelectionRange(a + z.length, a + z.length); } catch (x) {}
        });
      }
      koerper.appendChild(leiste);
      koerper.appendChild(flaeche);
      if (tippTeil) koerper.appendChild(tippTeil);
    } else {
      koerper.appendChild(flaeche);
      koerper.appendChild(leeren);
    }
    huelle.appendChild(knopf);
    huelle.appendChild(koerper);

    var ctx = null, zieht = false, letzter = null, stiftDa = false, aktiv = null;
    var verlauf = [], linStart = null, linBild = null, linEnde = null;
    function linealAn() { return !!(linKnopf && !linKnopf.hidden && lineal && !radiert); }
    function merken() {
      if (!zurueck || zurueck.hidden || !ctx) return;
      try { verlauf.push(ctx.getImageData(0, 0, flaeche.width, flaeche.height)); } catch (e) { return; }
      if (verlauf.length > 20) verlauf.shift();
      zurueck.disabled = false;
    }
    /* Kästchengitter: 24 px, die Linien liegen im Inhaltsbereich (innerhalb des Rahmens). Die
       Zeichenfläche ist auf die volle Breite samt Rahmen gerechnet - deshalb umrechnen, damit
       eine Lineal-Linie genau auf einer Kästchenlinie liegt. */
    var GITTER = 24;
    function gitterPunkt(e) {
      var r = flaeche.getBoundingClientRect();
      var cw = flaeche.clientWidth || r.width, ch = flaeche.clientHeight || r.height;
      var sx = Math.min(Math.max(e.clientX - r.left - flaeche.clientLeft, 0), cw);
      var sy = Math.min(Math.max(e.clientY - r.top - flaeche.clientTop, 0), ch);
      return { sx: sx, sy: sy, kx: r.width / cw, ky: r.height / ch, cw: cw, ch: ch };
    }
    function rasten(v, max) { var g = Math.round(v / GITTER) * GITTER; return Math.min(Math.max(g, 0), Math.floor(max / GITTER) * GITTER); }
    function linieRechnen(a, b) {
      var x1 = rasten(a.sx, a.cw), y1 = rasten(a.sy, a.ch), x2, y2;
      var dx = b.sx - a.sx, dy = b.sy - a.sy;
      var w = Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI;
      if (w < 8) { x2 = rasten(b.sx, b.cw); y2 = y1; }
      else if (w > 82) { x2 = x1; y2 = rasten(b.sy, b.ch); }
      else { x2 = rasten(b.sx, b.cw); y2 = rasten(b.sy, b.ch); }
      /* +0.5: die Kästchenlinie ist 1 px breit und liegt am Anfang jedes Kästchens. */
      return { x1: (x1 + 0.5) * a.kx, y1: (y1 + 0.5) * a.ky, x2: (x2 + 0.5) * a.kx, y2: (y2 + 0.5) * a.ky, laenge: Math.hypot(x2 - x1, y2 - y1) };
    }
    function linieZeigen(endeEv) {
      if (linBild) ctx.putImageData(linBild, 0, 0);
      var l = linieRechnen(linStart, gitterPunkt(endeEv)); linEnde = l;
      if (!l.laenge) return;
      ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
    }
    function stil() {
      if (!ctx || !wz) return;
      ctx.globalCompositeOperation = radiert ? "destination-out" : "source-over";
      ctx.lineWidth = radiert ? 22 : 3;
      ctx.strokeStyle = farbe; ctx.fillStyle = farbe;
    }
    function groesse() {
      var r = flaeche.getBoundingClientRect(), d = window.devicePixelRatio || 1;
      if (!r.width) return;
      var alt = null;
      if (flaeche.width) { try { alt = ctx.getImageData(0, 0, flaeche.width, flaeche.height); } catch (e) {} }
      flaeche.width = Math.round(r.width * d); flaeche.height = Math.round(r.height * d);
      ctx = flaeche.getContext("2d");
      if (alt) ctx.putImageData(alt, 0, 0);
      if (alt && (alt.width !== flaeche.width || alt.height !== flaeche.height)) { verlauf = []; if (zurueck) zurueck.disabled = true; }
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 3;
      ctx.strokeStyle = getComputedStyle(flaeche).color || "#172033";
    }
    function punkt(e) { var r = flaeche.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    flaeche.addEventListener("pointerdown", function (e) {
      if (!ctx) groesse(); if (!ctx) return;
      if (wz) {
        if (e.pointerType === "pen") stiftDa = true;
        else if (stiftDa && e.pointerType === "touch") { e.preventDefault(); return; }   // Handballen
        if (zieht && aktiv !== e.pointerId) return;                                      // zweiter Finger
        aktiv = e.pointerId; stil();
        merken();
        if (linealAn()) {
          zieht = true; linStart = gitterPunkt(e); linEnde = null;
          try { linBild = ctx.getImageData(0, 0, flaeche.width, flaeche.height); } catch (x) { linBild = null; }
          try { flaeche.setPointerCapture(e.pointerId); } catch (x) {}
          e.preventDefault(); return;
        }
      }
      linStart = null;
      zieht = true; letzter = punkt(e);
      try { flaeche.setPointerCapture(e.pointerId); } catch (x) {}
      ctx.beginPath(); ctx.arc(letzter.x, letzter.y, wz && radiert ? 11 : 1.5, 0, 6.3); if (!wz) ctx.fillStyle = ctx.strokeStyle; ctx.fill();
      e.preventDefault();
    });
    flaeche.addEventListener("pointermove", function (e) {
      if (!zieht || !ctx) return;
      if (wz && aktiv !== e.pointerId) return;
      if (linStart) { linieZeigen(e); e.preventDefault(); return; }
      var p = punkt(e);
      ctx.beginPath(); ctx.moveTo(letzter.x, letzter.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      letzter = p; e.preventDefault();
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) { flaeche.addEventListener(n, function (e) {
      if (wz && aktiv !== null && e.pointerId !== aktiv) return;
      if (linStart && zieht) {
        /* Abgebrochen oder nur getippt: nichts stehen lassen und den Zurück-Schritt wieder wegnehmen. */
        if (e.type === "pointercancel" || !linEnde || !linEnde.laenge) {
          if (linBild) ctx.putImageData(linBild, 0, 0);
          if (verlauf.length) verlauf.pop();
          if (zurueck) zurueck.disabled = !verlauf.length;
        } else linieZeigen(e);
        linStart = null; linBild = null;
      }
      zieht = false; aktiv = null;
    }); });
    leeren.addEventListener("click", function () { if (ctx) { merken(); ctx.clearRect(0, 0, flaeche.width, flaeche.height); } });
    if (zurueck) zurueck.addEventListener("click", function () {
      if (!ctx || !verlauf.length) return;
      ctx.putImageData(verlauf.pop(), 0, 0);
      zurueck.disabled = !verlauf.length;
    });
    huelle.sbLineal = function (zeigen) {
      if (!linKnopf) return;
      linKnopf.hidden = zurueck.hidden = !zeigen;
      if (!zeigen) { lineal = false; linKnopf.classList.remove("an"); linKnopf.setAttribute("aria-pressed", "false"); verlauf = []; zurueck.disabled = true; }
    };
    function modusSetzen(m) {
      modus = m === "tippen" && tippTeil && modusLeiste && !modusLeiste.hidden ? "tippen" : "zeichnen";
      var tippt = modus === "tippen";
      if (tippTeil) tippTeil.hidden = !tippt;
      if (leiste) leiste.hidden = tippt;
      flaeche.hidden = tippt;
      huelle.classList.toggle("sb-tippt", tippt);
      if (modusLeiste) [].forEach.call(modusLeiste.querySelectorAll("button"), function (b) {
        var an = b.dataset.modus === modus;
        b.classList.toggle("an", an); b.setAttribute("aria-pressed", an ? "true" : "false");
      });
      /* Zurück zum Zeichnen: die Fläche war versteckt, also ohne Größe - jetzt nachmessen. */
      if (!tippt && !huelle.classList.contains("sb-zu")) { zieht = false; aktiv = null; groesse(); stil(); }
    }
    if (modusLeiste) modusLeiste.addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("button") : null;
      if (!b || !b.dataset.modus) return;
      modusMerken(b.dataset.modus);
      modusSetzen(b.dataset.modus);
      if (modus === "tippen") tippFokus();
    });
    huelle.sbTippen = function (zeigen) {
      if (!modusLeiste) return;
      modusLeiste.hidden = !zeigen;
      modusSetzen(zeigen ? modusStandard() : "zeichnen");
    };
    huelle.sbModus = function () { return modus; };
    function artSetzen(m) {
      art = m === "tafel" && tafel && artLeiste && !artLeiste.hidden ? "tafel" : "frei";
      if (tafelTeil) tafelTeil.hidden = art !== "tafel";
      if (freiTeil) freiTeil.hidden = art === "tafel";
      huelle.classList.toggle("sb-tafelt", art === "tafel");
      if (artLeiste) [].forEach.call(artLeiste.querySelectorAll("button"), function (b) {
        var an = b.dataset.art === art;
        b.classList.toggle("an", an); b.setAttribute("aria-pressed", an ? "true" : "false");
      });
    }
    function tippFokus() {
      var z = art === "tafel" && tafel ? tafel.erste() : textFeld;
      if (z) try { z.focus({ preventScroll: true }); } catch (e) {}
    }
    if (artLeiste) artLeiste.addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("button") : null;
      if (!b || !b.dataset.art) return;
      artSetzen(b.dataset.art);
      tippFokus();
    });
    /* Rechentabelle zeigen (rechenflaeche.js nach dem Schalter "rechentafel"). Malnehmen und Teilen
       haben ein anderes Bild - dort steht das freie Feld vorn, die Tabelle bleibt einen Tipp entfernt. */
    huelle.sbTafel = function (zeigen, text) {
      if (!artLeiste) return;
      if (!zeigen) { artLeiste.hidden = true; tafel = null; if (tafelTeil) tafelTeil.innerHTML = ""; artSetzen("frei"); return; }
      tafel = tafelBauen(tafelTeil, text);
      artLeiste.hidden = false;
      artSetzen(tafel.art === "mal" || tafel.art === "geteilt" ? "frei" : "tafel");
    };
    huelle.sbArt = function () { return art; };
    huelle.sbTafelStand = function () { return tafel ? tafel.stand() : null; };
    knopf.addEventListener("click", function () {
      var zu = !huelle.classList.contains("sb-zu");
      huelle.classList.toggle("sb-zu", zu);
      knopf.setAttribute("aria-expanded", zu ? "false" : "true");
      if (!zu) {
        if (modus === "zeichnen") { groesse(); stil(); }
        if (opts.auf) opts.auf(huelle);
        if (modus === "tippen") tippFokus();
      }
    });
  }
  window.Schmierblatt = { malen: malen };
})();
