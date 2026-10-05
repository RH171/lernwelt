/* "Übung zum Blatt" - EINMAL gebaut, von drei Lernwelten benutzt.
 *
 * Helena am 05.10.2026 (Meldung uhpehqypar): "wo ich einen knopf auch habe
 * ... dann ein foto machen kann und mir du mir dazu übungen stellst" - und
 * auf die Rückfrage, wann kontrolliert wird: "Alle zusammen am ende. Und
 * soll auswählbar sein wie viele fragen".
 *
 * Genau das steht hier: Foto, Anzahl wählen, alle Aufgaben lösen, EINMAL am
 * Ende prüfen. Kein Sofort-Richtig-Falsch, kein Zeitdruck, keine Note.
 *
 * Dieselbe Regel wie beim Ferien-Band, beim Spielmotor und bei "Zurück-
 * bekommen": Der Ablauf steht an EINER Stelle. Wer hier etwas ändert, ändert
 * es für alle drei Kinder - und misst alle drei.
 *
 * Gebraucht wird:
 *   <script src="/strom.js"></script>          (verkleinert die Fotos)
 *   <script src="/lernstand.js"></script>      (Uhr und Melde-Knopf)
 *   <script src="/foto-uebung.js"></script>
 *   <script>LWFotoUebung.einbauen(document.getElementById("hier"), {kind:"helena"});</script>
 */
(function (global) {
  "use strict";

  var MAX_SEITEN = 4;
  var ANZAHLEN = [5, 10, 15, 20];

  /* Je Kind ein eigener Ton. Dieselbe Seite, andere Worte - wie bei
     HEFT_START und QUIZ.kreiseWorte, nicht über Kopien. */
  var WORTE = {
    paul: {
      titel: "Mach ein Foto von deinem Blatt",
      unter: "Ich stelle dir dann eigene Aufgaben zum selben Stoff. Dein Blatt löst du selbst – hier übst du nur.",
      fotoKnopf: "Foto von deinem Blatt",
      los: "Aufgaben holen",
      fertig: "Fertig – alles prüfen",
      wunschBeispiel: "Zum Beispiel: schriftlich mal rechnen – oder nur die Aufgaben mit Übertrag."
    },
    leon: {
      titel: "Fotografiere dein Blatt",
      unter: "Dann bekommst du eigene Aufgaben dazu. Dein Blatt machst du selbst.",
      fotoKnopf: "Foto machen",
      los: "Aufgaben holen",
      fertig: "Fertig – alles anschauen",
      wunschBeispiel: "Zum Beispiel: plus rechnen bis 100."
    },
    helena: {
      titel: "Foto vom Blatt, Übungen dazu",
      unter: "Du wählst, wie viele Aufgaben du willst. Geprüft wird erst am Ende, wenn du alle hast.",
      fotoKnopf: "Foto vom Arbeitsblatt",
      los: "Übungen holen",
      fertig: "Fertig – alles prüfen",
      wunschBeispiel: "Zum Beispiel: nur die Verbformen – oder ganze Sätze statt Lücken."
    }
  };

  /* Das Fach kommt vom Modell als deutsches Wort zurück. Für die
     Lernstatistik braucht es den Schlüssel, den _schulstoff.js kennt. */
  var FACHMUSTER = [
    [/mathe|mathematik|rechn/i, "mathe"],
    [/deutsch|lesen|rechtschreib/i, "deutsch"],
    [/hsu|heimat|sachunterricht|sachkunde/i, "hsu"],
    [/englisch|english/i, "englisch"],
    [/franz/i, "franz"],
    [/geschichte/i, "geschichte"],
    [/geogra|erdkunde/i, "geo"],
    [/informatik|digital/i, "info"],
    [/religion|ethik/i, "rel"],
    [/musik/i, "musik"]
  ];
  function fachSchluessel(text) {
    for (var i = 0; i < FACHMUSTER.length; i++) {
      if (FACHMUSTER[i][0].test(String(text || ""))) return FACHMUSTER[i][1];
    }
    return "anderes";
  }

  var STIL = [
    ".lwf{background:var(--karte,var(--card,#fff));border:1px solid var(--line,#e4e7f0);",
    "  border-radius:20px;padding:18px;margin-bottom:12px;color:var(--ink,#1b1c22)}",
    ".lwf h2{font:800 20px var(--rund,inherit);margin:0 0 4px}",
    ".lwf .u{color:var(--muted,#6b7280);font-size:15px;line-height:1.5;margin:6px 0 0}",
    ".lwf .frage{font:600 16.5px var(--rund,inherit);margin-top:18px}",
    ".lwf .reihe{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center}",
    ".lwf .chip{appearance:none;border:2px solid var(--line,#e4e7f0);background:var(--karte,var(--card,#fff));",
    "  color:var(--ink,#1b1c22);border-radius:999px;padding:10px 18px;font:700 15.5px inherit;",
    "  cursor:pointer;min-height:44px}",
    ".lwf .chip.an{border-color:var(--akzent,var(--paul,#4f46e5));",
    "  background:var(--akzent-hell,rgba(79,70,229,.12));color:var(--akzent-text,var(--ink,#1b1c22))}",
    ".lwf .knopf{border:2px dashed var(--line,#cdd3e4);border-radius:16px;padding:15px 8px;text-align:center;",
    "  font:600 15px inherit;cursor:pointer;background:transparent;min-height:60px;width:100%;",
    "  color:var(--ink,#1b1c22);margin-top:10px}",
    ".lwf .knopf .z{display:block;font-size:24px;margin-bottom:5px}",
    ".lwf .seiten{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}",
    /* 92 px, damit das Kreuz darin 44x44 sein kann - Mindestmass fuer einen
       Finger (WCAG 2.2, 2.5.8), wie bei "Zurueckbekommen" am 05.10.2026. */
    ".lwf .seite{position:relative;width:92px;height:92px;border-radius:12px;overflow:hidden;",
    "  background:var(--vertief,#f1f4fa)}",
    ".lwf .seite img{width:100%;height:100%;object-fit:cover}",
    ".lwf .seite .weg{position:absolute;top:0;right:0;width:44px;height:44px;border:none;padding:0;",
    "  background:transparent;color:#fff;font-size:17px;cursor:pointer;display:grid;place-items:center}",
    ".lwf .seite .weg i{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;",
    "  background:rgba(20,22,40,.72);font-style:normal}",
    ".lwf textarea{font:500 16.5px inherit;padding:11px 13px;border-radius:14px;width:100%;",
    "  border:1.5px solid var(--line,#e4e7f0);background:var(--feld,#fbfaff);color:var(--ink,#1b1c22);",
    "  min-height:62px;box-sizing:border-box;margin-top:10px}",
    ".lwf .los{width:100%;margin-top:18px;border:none;border-radius:16px;",
    "  background:var(--akzent,var(--paul,#4f46e5));color:#fff;padding:15px;",
    "  font:700 17.5px var(--rund,inherit);cursor:pointer;min-height:52px}",
    ".lwf .los[disabled]{opacity:.5;cursor:default}",
    ".lwf .still{background:transparent;color:var(--ink,#1b1c22);border:2px solid var(--line,#e4e7f0)}",
    ".lwf .melde{margin-top:12px;font-size:15.5px;line-height:1.5;min-height:1px}",
    ".lwf .melde.schlecht{color:var(--schlecht,#b42318)}",
    ".lwf .melde.gut{color:var(--gut,#067647)}",
    /* ---- Warten ---- */
    ".lwf .laedt{display:flex;align-items:center;gap:11px;margin-top:6px;color:var(--muted,#6b7280);font-size:15.5px}",
    ".lwf .laedt i{width:20px;height:20px;border-radius:50%;flex:none;",
    "  border:3px solid var(--line,#e4e7f0);border-top-color:var(--akzent,var(--paul,#4f46e5));",
    "  animation:lwfdreh 1s linear infinite}",
    "@keyframes lwfdreh{to{transform:rotate(360deg)}}",
    "@media (prefers-reduced-motion:reduce){.lwf .laedt i{animation:none}}",
    /* ---- Aufgaben ---- */
    ".lwf .aufg{border-top:1px solid var(--line,#e4e7f0);padding-top:16px;margin-top:16px}",
    ".lwf .aufg:first-of-type{border-top:none;padding-top:4px;margin-top:10px}",
    ".lwf .aufg .nr{font:700 13px var(--rund,inherit);color:var(--muted,#6b7280);letter-spacing:.04em}",
    ".lwf .aufg .t{font:600 17px/1.45 var(--rund,inherit);margin:4px 0 0;overflow-wrap:anywhere}",
    ".lwf .aufg input{font:600 17px inherit;padding:12px 14px;border-radius:14px;width:100%;",
    "  border:2px solid var(--line,#e4e7f0);background:var(--feld,#fbfaff);color:var(--ink,#1b1c22);",
    "  min-height:48px;box-sizing:border-box;margin-top:10px}",
    ".lwf .aufg input:focus{outline:none;border-color:var(--akzent,var(--paul,#4f46e5))}",
    ".lwf .tippknopf{appearance:none;border:none;background:transparent;cursor:pointer;",
    "  color:var(--akzent,var(--paul,#4f46e5));font:600 15px inherit;padding:10px 0;min-height:44px}",
    ".lwf .tipptext{margin:2px 0 0;font-size:15px;line-height:1.5;color:var(--muted,#6b7280)}",
    ".lwf .sagt{margin-top:10px;border-radius:14px;padding:11px 13px;font-size:15.5px;line-height:1.5}",
    ".lwf .sagt.gut{background:var(--gut-hell,#e7f8f1);color:var(--gut-text,#067647)}",
    ".lwf .sagt.fast{background:var(--vertief,#fff7e6);color:var(--ink,#1b1c22)}",
    ".lwf .sagt.offen{background:var(--vertief,#f1f4fa);color:var(--ink,#1b1c22)}",
    ".lwf .sagt.schlecht{background:var(--schlecht-hell,#fff1f0);color:var(--schlecht-text,#a3251c)}",
    ".lwf .sagt b{display:block;font:700 15.5px var(--rund,inherit);margin-bottom:2px}",
    ".lwf .aufg.fertig input{border-color:var(--line,#e4e7f0);opacity:.85}",
    ".lwf .zahl{font:800 40px/1 var(--rund,inherit);color:var(--akzent,var(--paul,#4f46e5));margin:8px 0 2px}",
    ".lwf .knoepfe{display:grid;gap:10px;margin-top:16px}",
    "html[data-theme=\"dark\"] .lwf .knopf{border-color:#3a3e52}",
    "html[data-theme=\"dark\"] .lwf .seite{background:#262a38}"
  ].join("");

  function stilEinmal() {
    if (document.getElementById("lwf-stil")) return;
    var s = document.createElement("style");
    s.id = "lwf-stil";
    s.textContent = STIL;
    document.head.appendChild(s);
  }

  function el(tag, klasse, text) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- Vergleichen ----------
     Ein Kind soll nicht an einem Komma scheitern. Verglichen wird ohne
     Satzzeichen, ohne doppelte Leerzeichen und ohne Gross-/Kleinschreibung.
     Akzente sind eine EIGENE Stufe: "fast" statt falsch - in Französisch
     gehören sie dazu, aber sie sind kein Grund für ein rotes Kreuz. */
  function schlicht(s) {
    return String(s == null ? "" : s)
      .replace(/[.,;:!?"'`´„“”»«()\[\]]/g, " ")
      .replace(/\s+/g, " ").trim().toLowerCase();
  }
  function ohneAkzent(s) {
    var t = schlicht(s);
    try { t = t.normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) {}
    return t;
  }
  function vergleich(gegeben, aufgabe) {
    if (!schlicht(gegeben)) return "offen";
    var alle = [aufgabe.antwort].concat(aufgabe.auch || []);
    var i;
    for (i = 0; i < alle.length; i++) if (schlicht(gegeben) === schlicht(alle[i])) return "gut";
    for (i = 0; i < alle.length; i++) if (ohneAkzent(gegeben) === ohneAkzent(alle[i])) return "fast";
    return "schlecht";
  }

  /* ---------- Die Leitung offen halten ----------
     Derselbe Weg wie in /strom.js: Cloudflare bricht eine stille Leitung nach
     gut 100 Sekunden ab, der Server schickt deshalb alle fünf Sekunden eine
     Zeile. Hier wird sie gelesen. */
  var ABRISS = "Die Verbindung ist mittendrin abgerissen. Dein Foto ist noch da – tipp nochmal auf den Knopf.";

  function holen(auftrag, melder) {
    return fetch("/api/uebung-foto", {
      method: "POST", credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(auftrag)
    }).then(function (r) {
      var typ = r.headers.get("content-type") || "";
      if (r.ok && r.body && r.body.getReader && typ.indexOf("ndjson") >= 0) return strom(r, melder);
      return r.json().then(function (j) {
        if (r.status === 401) throw new Error("Bitte melde dich nochmal an.");
        if (!r.ok || !j || !j.ok || !j.uebung) {
          throw new Error((j && j.fehler) || "Da ist etwas schiefgegangen. Bitte nochmal versuchen.");
        }
        return j.uebung;
      });
    });
  }

  function strom(r, melder) {
    var leser = r.body.getReader(), decoder = new TextDecoder(), rest = "", letzte = null;
    function zeile(t) {
      t = String(t || "").trim();
      if (!t) return;
      try { letzte = JSON.parse(t); } catch (e) { return; }
      if (letzte.status === "laeuft" && melder && typeof letzte.seit === "number") {
        try { melder(letzte.seit); } catch (e) {}
      }
    }
    function weiter() {
      return leser.read().then(function (st) {
        if (st.done) { zeile(rest); rest = ""; return letzte || { status: "fehler", fehler: ABRISS }; }
        rest += decoder.decode(st.value, { stream: true });
        var teile = rest.split("\n");
        rest = teile.pop();
        teile.forEach(zeile);
        return weiter();
      });
    }
    return weiter().then(function (t) {
      if (t && t.status === "fertig" && t.uebung) return t.uebung;
      if (t && t.warum) { try { console.warn("Übung abgebrochen:", t.warum); } catch (x) {} }
      throw new Error((t && t.fehler) || ABRISS);
    });
  }

  /* ---------- Die Seite ---------- */
  function einbauen(wohin, opt) {
    opt = opt || {};
    var kind = opt.kind || "paul";
    var W = WORTE[kind] || WORTE.paul;
    stilEinmal();

    var zustand = { seiten: [], anzahl: 10, laeuft: false, uebung: null, felder: [], gestartet: 0 };

    function leeren() { while (wohin.firstChild) wohin.removeChild(wohin.firstChild); }

    /* ===== Schritt 1: Foto und Anzahl ===== */
    function startZeigen(vorbelegt) {
      leeren();
      var karte = el("div", "lwf");
      karte.appendChild(el("h2", null, W.titel));
      karte.appendChild(el("p", "u", W.unter));

      karte.appendChild(el("div", "frage", "Dein Blatt (bis zu " + MAX_SEITEN + " Fotos)"));
      var datei = el("input");
      datei.type = "file";
      datei.accept = "image/*";
      datei.multiple = true;
      datei.style.display = "none";
      karte.appendChild(datei);
      var fotoKnopf = el("button", "knopf");
      fotoKnopf.type = "button";
      fotoKnopf.innerHTML = '<span class="z">📷</span>' + W.fotoKnopf;
      fotoKnopf.addEventListener("click", function () { datei.click(); });
      karte.appendChild(fotoKnopf);
      var seitenReihe = el("div", "seiten");
      karte.appendChild(seitenReihe);

      karte.appendChild(el("div", "frage", "Wie viele Aufgaben?"));
      var anzahlReihe = el("div", "reihe");
      ANZAHLEN.forEach(function (n) {
        var c = el("button", "chip" + (n === zustand.anzahl ? " an" : ""), String(n));
        c.type = "button";
        c.setAttribute("aria-pressed", n === zustand.anzahl ? "true" : "false");
        c.addEventListener("click", function () {
          zustand.anzahl = n;
          Array.prototype.forEach.call(anzahlReihe.children, function (x) {
            var an = x === c;
            x.className = "chip" + (an ? " an" : "");
            x.setAttribute("aria-pressed", an ? "true" : "false");
          });
        });
        anzahlReihe.appendChild(c);
      });
      karte.appendChild(anzahlReihe);

      karte.appendChild(el("div", "frage", "Willst du etwas dazu sagen? (freiwillig)"));
      var wunsch = el("textarea");
      wunsch.placeholder = W.wunschBeispiel;
      wunsch.setAttribute("aria-label", "Willst du etwas dazu sagen?");
      if (vorbelegt) wunsch.value = vorbelegt;
      karte.appendChild(wunsch);

      var los = el("button", "los", W.los);
      los.type = "button";
      karte.appendChild(los);
      var melde = el("p", "melde");
      karte.appendChild(melde);
      wohin.appendChild(karte);

      function sagen(t, art) { melde.className = "melde" + (art ? " " + art : ""); melde.textContent = t || ""; }
      function pruefen() { los.disabled = !zustand.seiten.length || zustand.laeuft; }

      function seitenMalen() {
        seitenReihe.innerHTML = "";
        zustand.seiten.forEach(function (url, i) {
          var s = el("div", "seite");
          var b = el("img");
          b.src = url;
          b.alt = "Seite " + (i + 1);
          s.appendChild(b);
          var weg = el("button", "weg");
          weg.type = "button";
          weg.innerHTML = "<i>✕</i>";
          weg.setAttribute("aria-label", "Seite " + (i + 1) + " wegnehmen");
          weg.addEventListener("click", function () { zustand.seiten.splice(i, 1); seitenMalen(); pruefen(); });
          s.appendChild(weg);
          seitenReihe.appendChild(s);
        });
        fotoKnopf.style.display = zustand.seiten.length >= MAX_SEITEN ? "none" : "";
      }

      datei.addEventListener("change", function () {
        var dateien = Array.prototype.slice.call(datei.files || []);
        datei.value = "";
        var platz = MAX_SEITEN - zustand.seiten.length;
        if (!dateien.length || platz <= 0) return;
        dateien.slice(0, platz).forEach(function (f) {
          var leser = new FileReader();
          leser.onload = function () { zustand.seiten.push(String(leser.result)); seitenMalen(); pruefen(); sagen(""); };
          leser.onerror = function () { sagen("Das Foto konnte ich nicht lesen. Versuch es noch einmal.", "schlecht"); };
          leser.readAsDataURL(f);
        });
      });

      los.addEventListener("click", function () {
        if (zustand.laeuft || !zustand.seiten.length) return;
        losGehen(wunsch.value.trim(), sagen, pruefen);
      });

      seitenMalen();
      pruefen();
    }

    /* ===== Schritt 2: warten ===== */
    function losGehen(wunsch, sagen, pruefen) {
      zustand.laeuft = true;
      pruefen();
      sagen("");

      var warte = el("div", "lwf");
      warte.appendChild(el("h2", null, "Ich schaue mir dein Blatt an …"));
      var zeile = el("p", "laedt");
      zeile.appendChild(el("i"));
      var text = el("span", null, "Das dauert ungefähr eine Minute.");
      zeile.appendChild(text);
      warte.appendChild(zeile);
      warte.appendChild(el("p", "u", "Lass die Seite so lange offen."));
      leeren();
      wohin.appendChild(warte);

      var bilder = (global.LWStrom && global.LWStrom.kleinerMachen)
        ? global.LWStrom.kleinerMachen(zustand.seiten)
        : Promise.resolve(zustand.seiten);

      bilder.then(function (urls) {
        var seiten = urls.map(function (u) {
          var komma = String(u).indexOf(",");
          return { media_type: String(u).slice(5, String(u).indexOf(";")), data: String(u).slice(komma + 1) };
        });
        return holen({ kind: kind, seiten: seiten, anzahl: zustand.anzahl, wunsch: wunsch, strom: true },
          function (sek) {
            text.textContent = sek < 25 ? "Ich lese dein Blatt … (" + sek + " s)"
                             : sek < 70 ? "Ich denke mir Aufgaben aus … (" + sek + " s)"
                                        : "Gleich fertig … (" + sek + " s)";
          });
      }).then(function (uebung) {
        zustand.laeuft = false;
        zustand.uebung = uebung;
        zustand.gestartet = Date.now();
        if (global.lernstand && global.lernstand.uhrZuruecksetzen) global.lernstand.uhrZuruecksetzen();
        aufgabenZeigen();
      }).catch(function (e) {
        zustand.laeuft = false;
        startZeigen(wunsch);
        var m = wohin.querySelector(".melde");
        if (m) { m.className = "melde schlecht"; m.textContent = e.message || "Das ging gerade nicht."; }
      });
    }

    /* ===== Schritt 3: alle Aufgaben, geprüft wird am Ende ===== */
    function aufgabenZeigen() {
      var u = zustand.uebung;
      leeren();
      zustand.felder = [];

      var kopf = el("div", "lwf");
      kopf.appendChild(el("h2", null, u.thema || "Deine Übung"));
      if (u.einleitung) kopf.appendChild(el("p", "u", u.einleitung));
      kopf.appendChild(el("p", "u", u.aufgaben.length + " Aufgaben. Mach alle in Ruhe – geprüft wird erst am Ende."));
      wohin.appendChild(kopf);

      var karte = el("div", "lwf");
      u.aufgaben.forEach(function (a, i) {
        var block = el("div", "aufg");
        block.appendChild(el("div", "nr", "AUFGABE " + (i + 1)));
        block.appendChild(el("p", "t", a.frage));
        var feld = el("input");
        feld.type = "text";
        feld.autocapitalize = "off";
        feld.autocomplete = "off";
        feld.spellcheck = false;
        feld.placeholder = "Deine Antwort";
        feld.setAttribute("aria-label", "Antwort zu Aufgabe " + (i + 1));
        /* Mit der Eingabetaste ins nächste Feld - sonst muss das Kind auf dem
           Handy nach jeder Antwort die Tastatur zuklappen und wieder tippen. */
        feld.addEventListener("keydown", function (ev) {
          if (ev.key !== "Enter") return;
          ev.preventDefault();
          var n = zustand.felder[i + 1];
          if (n) n.focus(); else feld.blur();
        });
        block.appendChild(feld);
        zustand.felder.push(feld);

        if (a.tipp) {
          var tk = el("button", "tippknopf", "💡 Tipp");
          tk.type = "button";
          tk.setAttribute("aria-expanded", "false");
          var tt = el("p", "tipptext", a.tipp);
          tt.style.display = "none";
          tk.addEventListener("click", function () {
            var auf = tt.style.display === "none";
            tt.style.display = auf ? "" : "none";
            tk.setAttribute("aria-expanded", auf ? "true" : "false");
            tk.textContent = auf ? "💡 Tipp verbergen" : "💡 Tipp";
          });
          block.appendChild(tk);
          block.appendChild(tt);
        }
        karte.appendChild(block);
      });

      var fertig = el("button", "los", W.fertig);
      fertig.type = "button";
      fertig.addEventListener("click", function () { pruefenUndZeigen(); });
      karte.appendChild(fertig);
      wohin.appendChild(karte);
    }

    /* ===== Schritt 4: alles auf einmal prüfen ===== */
    function pruefenUndZeigen() {
      var u = zustand.uebung;
      var ergebnisse = u.aufgaben.map(function (a, i) {
        var gegeben = zustand.felder[i] ? zustand.felder[i].value : "";
        return { a: a, gegeben: gegeben, stand: vergleich(gegeben, a) };
      });
      var gut = ergebnisse.filter(function (e) { return e.stand === "gut"; }).length;
      var fast = ergebnisse.filter(function (e) { return e.stand === "fast"; }).length;
      var offen = ergebnisse.filter(function (e) { return e.stand === "offen"; }).length;

      melden(u, ergebnisse);

      leeren();
      var kopf = el("div", "lwf");
      kopf.appendChild(el("h2", null, "Das ist dein Ergebnis"));
      kopf.appendChild(el("div", "zahl", gut + " von " + ergebnisse.length));
      var satz = gut === ergebnisse.length ? "Alles richtig. Das sitzt."
               : gut >= Math.ceil(ergebnisse.length * 0.7) ? "Der größte Teil sitzt schon."
               : "Ein paar davon schauen wir uns gleich nochmal an.";
      if (fast) satz += " " + (fast === 1 ? "Eine Antwort war fast richtig." : fast + " Antworten waren fast richtig.");
      if (offen) satz += " " + (offen === 1 ? "Eine hast du leer gelassen." : offen + " hast du leer gelassen.");
      kopf.appendChild(el("p", "u", satz));
      wohin.appendChild(kopf);

      var karte = el("div", "lwf");
      ergebnisse.forEach(function (e, i) {
        var block = el("div", "aufg fertig");
        block.appendChild(el("div", "nr", "AUFGABE " + (i + 1)));
        block.appendChild(el("p", "t", e.a.frage));

        var sagt = el("div", "sagt " + e.stand);
        if (e.stand === "gut") {
          sagt.appendChild(el("b", null, "✅ Richtig"));
          sagt.appendChild(el("span", null, e.gegeben));
        } else if (e.stand === "fast") {
          sagt.appendChild(el("b", null, "➖ Fast – schau auf die Zeichen"));
          sagt.appendChild(el("span", null, "Du hattest: " + e.gegeben + " · So wird es geschrieben: " + e.a.antwort));
        } else if (e.stand === "offen") {
          sagt.appendChild(el("b", null, "➖ Die hast du leer gelassen"));
          sagt.appendChild(el("span", null, "Richtig wäre: " + e.a.antwort));
        } else {
          sagt.appendChild(el("b", null, "✗ Noch nicht"));
          sagt.appendChild(el("span", null, "Du hattest: " + e.gegeben + " · Richtig ist: " + e.a.antwort));
        }
        block.appendChild(sagt);
        if (e.a.erklaerung) block.appendChild(el("p", "tipptext", e.a.erklaerung));
        karte.appendChild(block);
      });

      var knoepfe = el("div", "knoepfe");
      var nochmal = el("button", "los", "Noch eine Runde zum selben Blatt");
      nochmal.type = "button";
      nochmal.addEventListener("click", function () {
        /* Dasselbe Foto, neue Aufgaben - das Blatt liegt noch da, und ein
           zweiter Durchgang ist genau das, was Wiederholen ausmacht. */
        startZeigen("");
        var m = wohin.querySelector(".melde");
        if (m) { m.className = "melde gut"; m.textContent = "Dein Foto ist noch da. Tipp auf „" + W.los + "“."; }
      });
      knoepfe.appendChild(nochmal);
      var neu = el("button", "los still", "Ein anderes Blatt");
      neu.type = "button";
      neu.addEventListener("click", function () { zustand.seiten = []; zustand.uebung = null; startZeigen(""); });
      knoepfe.appendChild(neu);
      karte.appendChild(knoepfe);
      wohin.appendChild(karte);

      window.scrollTo(0, 0);
    }

    /* Die Runde geht an die Lernstatistik - mit Fach und Thema vom Blatt,
       nicht aus dem Dateinamen (der hieße hier "uebung-foto"). Deshalb
       trägt die Seite LERNSTAND_SCHREIBT_SELBST. */
    function melden(u, ergebnisse) {
      try {
        var LS = global.lernstand || null;
        var sek = LS && LS.aktiveSekunden ? LS.aktiveSekunden()
                : Math.round((Date.now() - zustand.gestartet) / 1000);
        var runde = {
          spielId: "uebung-foto",
          titel: "Übung zum Blatt" + (u.thema ? ": " + u.thema : ""),
          quelle: "uebung-foto",
          fach: fachSchluessel(u.fach),
          thema: u.thema || "",
          lernbereich: "",
          sekunden: sek,
          pause: LS && LS.wanduhrSekunden ? Math.max(0, LS.wanduhrSekunden() - sek) : 0,
          zeitart: "lernen",
          geraet: LS && LS.geraet ? LS.geraet() : undefined,
          aufgaben: ergebnisse.map(function (e) {
            return {
              merkmal: String(u.thema || "").slice(0, 40).toLowerCase(),
              art: "uebung",
              stimmt: e.stand === "gut" || e.stand === "fast",
              nachspielzeit: false,
              sekunden: 0,
              gegeben: e.stand === "gut" ? "" : String(e.gegeben).slice(0, 30),
              richtig: String(e.a.antwort).slice(0, 30)
            };
          })
        };
        fetch("/api/statistik", {
          method: "POST", credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ kind: kind, runde: runde })
        }).catch(function () {});
      } catch (e) {}
    }

    startZeigen("");
  }

  global.LWFotoUebung = { einbauen: einbauen, vergleich: vergleich, fachSchluessel: fachSchluessel };
})(window);
