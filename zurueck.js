/* "Zurückbekommen" - EINMAL gebaut, von drei Lernwelten benutzt.
 *
 * Helena am 05.10.2026: "Wir haben den BET zurückbekommen. Wo soll ich das
 * hinschicken?" Hier ist der Ort.
 *
 * Dieselbe Regel wie beim Ferien-Band, beim Spielmotor und beim Blatt
 * aufnehmen: Der Ablauf steht an EINER Stelle. Wer hier etwas ändert, ändert
 * es für alle drei Kinder - und misst alle drei.
 *
 * Gebraucht wird:
 *   <script src="/strom.js"></script>        (verkleinert die Fotos)
 *   <script src="/zurueck.js"></script>
 *   <script>LWZurueck.einbauen(document.getElementById("hier"), {kind:"helena"});</script>
 *
 * Fächer, Anlässe und ob es ein Notenfeld gibt, sagt der Server
 * (/api/zurueck?kind=...). Nichts davon steht hier doppelt.
 */
(function (global) {
  "use strict";

  var MAX_SEITEN = 4;

  /* Was eine Arbeit sein kann. Die Wörter sind die, die die Kinder benutzen -
     der Server macht daraus keine Note, also darf das hier locker bleiben.
     "grossNamen" entscheidet nur, was der Elternbereich als Schulaufgabe
     vorschlägt. */
  var ANLAESSE = {
    helena: ["Schulaufgabe", "Stegreifaufgabe", "Kurzarbeit", "Test", "BET", "Referat", "mündliche Note"],
    paul:   ["Probe", "Test", "Referat", "Diktat", "Lesen vortragen"],
    leon:   ["Probe", "Test", "Diktat", "Lesen vortragen"]
  };

  var STIL = [
    ".lwz{background:var(--karte,#fff);border-radius:22px;padding:18px;margin-bottom:12px;",
    "  box-shadow:0 1px 2px rgba(20,22,40,.05),0 10px 28px rgba(20,22,40,.07)}",
    ".lwz h2{font:800 20px var(--rund,inherit);margin:0 0 4px;color:var(--ink,#1b1c22)}",
    ".lwz .u{color:var(--muted,#6b7280);font-size:15px;margin:0 0 14px;line-height:1.5}",
    ".lwz .frage{font:600 16.5px var(--rund,inherit);margin-top:16px;color:var(--ink,#1b1c22)}",
    ".lwz .reihe{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px;align-items:center}",
    ".lwz button,.lwz .chip{appearance:none;border:1.5px solid var(--line,#e4e7f0);",
    "  background:var(--karte,#fff);color:var(--ink,#1b1c22);border-radius:999px;",
    "  padding:10px 14px;font:600 15.5px inherit;cursor:pointer;min-height:44px}",
    ".lwz .chip.an{background:var(--paul,#4f46e5);border-color:var(--paul,#4f46e5);color:#fff}",
    ".lwz input,.lwz textarea{font:600 16.5px inherit;padding:11px 13px;border-radius:14px;",
    "  border:1.5px solid var(--line,#e4e7f0);background:var(--feld,#fbfaff);",
    "  color:var(--ink,#1b1c22);min-height:46px;width:100%;box-sizing:border-box}",
    ".lwz textarea{min-height:70px;font-weight:500}",
    ".lwz .punktreihe{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:9px}",
    ".lwz .punktreihe input{width:88px;min-width:88px}",
    ".lwz .punktreihe span{color:var(--muted,#6b7280);font-size:15.5px}",
    ".lwz .knopf{border:2px dashed var(--line,#cdd3e4);border-radius:16px;padding:15px 8px;text-align:center;",
    "  font:600 15px inherit;cursor:pointer;background:transparent;min-height:60px;width:100%;",
    "  color:var(--ink,#1b1c22)}",
    ".lwz .knopf .z{display:block;font-size:24px;margin-bottom:5px}",
    ".lwz .seiten{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}",
    /* 92 px statt 78, damit das Kreuz darin 44x44 sein kann - das Mindestmass
       fuer einen Finger (WCAG 2.2, 2.5.8). Mit 28 px hat die Messung am
       05.10.2026 auf ALLEN Touch-Geraeten angeschlagen. Drei Vorschauen
       nebeneinander brauchen 294 px und passen auf Helenas 360er-Handy. */
    ".lwz .seite{position:relative;width:92px;height:92px;border-radius:12px;overflow:hidden;",
    "  background:var(--vertief,#f1f4fa)}",
    ".lwz .seite img{width:100%;height:100%;object-fit:cover}",
    ".lwz .seite .weg{position:absolute;top:0;right:0;width:44px;height:44px;min-height:44px;",
    "  border-bottom-left-radius:14px;background:rgba(20,22,40,.72);color:#fff;border:none;",
    "  font-size:17px;line-height:1;cursor:pointer;padding:0;display:flex;align-items:center;",
    "  justify-content:center}",
    ".lwz .los{width:100%;margin-top:18px;border:none;border-radius:16px;",
    "  background:var(--paul,#4f46e5);color:#fff;padding:15px;font:700 17.5px var(--rund,inherit);",
    "  cursor:pointer;min-height:54px}",
    ".lwz .los[disabled]{opacity:.55;cursor:default}",
    ".lwz .melde{margin-top:12px;font-size:15.5px;line-height:1.5;color:var(--muted,#6b7280)}",
    ".lwz .melde.gut{color:var(--gut,#15803d);font-weight:700}",
    ".lwz .melde.schlecht{color:#b91c1c;font-weight:700}",
    ".lwz .trenn{height:1px;background:var(--line,#e4e7f0);margin:20px -18px 0}",
    /* Die Liste der Rückläufer */
    ".lwz .eintrag{display:flex;gap:12px;align-items:flex-start;border:1.5px solid var(--line,#e4e7f0);",
    "  background:var(--vertief,#f7f8fc);border-radius:16px;padding:13px 14px;margin-top:10px}",
    ".lwz .eintrag .vor{width:52px;height:52px;border-radius:10px;overflow:hidden;flex:0 0 auto;",
    "  background:var(--karte,#fff);display:flex;align-items:center;justify-content:center;font-size:24px}",
    ".lwz .eintrag .vor img{width:100%;height:100%;object-fit:cover}",
    ".lwz .eintrag .mitte{flex:1;min-width:0}",
    ".lwz .eintrag b{display:block;font:700 16.5px var(--rund,inherit);color:var(--ink,#1b1c22)}",
    ".lwz .eintrag small{display:block;color:var(--muted,#6b7280);font-size:14px;line-height:1.45;margin-top:2px}",
    ".lwz .eintrag .note{flex:0 0 auto;font:800 24px var(--rund,inherit);color:var(--paul,#4f46e5);",
    "  min-width:34px;text-align:right}",
    ".lwz .leer{color:var(--muted,#6b7280);font-size:15px;margin-top:12px;line-height:1.5}"
  ].join("");

  function stilEinmal() {
    if (document.getElementById("lwz-stil")) return;
    var s = document.createElement("style");
    s.id = "lwz-stil";
    s.textContent = STIL;
    document.head.appendChild(s);
  }

  function el(tag, klasse, text) {
    var d = document.createElement(tag);
    if (klasse) d.className = klasse;
    if (text !== undefined) d.textContent = text;
    return d;
  }

  function heute() {
    var j = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    return j.toISOString().slice(0, 10);
  }

  function datumSchoen(d) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(d || ""))) return "";
    var t = String(d).split("-");
    return t[2] + "." + t[1] + "." + t[0];
  }

  function einbauen(wohin, opt) {
    if (!wohin) return;
    stilEinmal();
    var kind = String((opt && opt.kind) || "").toLowerCase();
    var zustand = { fach: "", anlass: "", seiten: [], faecher: [], mitNote: false, liste: null, laeuft: false };

    var karte = el("div", "lwz");
    var listKarte = el("div", "lwz");
    wohin.appendChild(karte);
    wohin.appendChild(listKarte);

    /* ---------- Formular ---------- */
    karte.appendChild(el("h2", null, "Eine Arbeit zurückbekommen"));
    var unter = el("p", "u");
    unter.textContent = "Fotografiere sie, sag mir, was es war, und trag ein, was draufsteht. "
      + "Dann ist sie aufgehoben, und deine Eltern sehen sie auch.";
    karte.appendChild(unter);

    karte.appendChild(el("div", "frage", "In welchem Fach?"));
    var fachReihe = el("div", "reihe");
    karte.appendChild(fachReihe);

    karte.appendChild(el("div", "frage", "Was war das?"));
    var anlassReihe = el("div", "reihe");
    karte.appendChild(anlassReihe);
    var anlassFeld = el("input");
    anlassFeld.type = "text";
    anlassFeld.placeholder = "zum Beispiel: BET 7 oder 1. Schulaufgabe";
    anlassFeld.style.marginTop = "9px";
    anlassFeld.setAttribute("aria-label", "Was war das?");
    karte.appendChild(anlassFeld);
    (ANLAESSE[kind] || ANLAESSE.paul).forEach(function (a) {
      var c = el("button", "chip", a);
      c.type = "button";
      c.addEventListener("click", function () {
        anlassFeld.value = a;
        pruefen();
        anlassFeld.focus();
      });
      anlassReihe.appendChild(c);
    });

    karte.appendChild(el("div", "frage", "Wann war die Arbeit?"));
    var datumFeld = el("input");
    datumFeld.type = "date";
    datumFeld.value = heute();
    datumFeld.max = heute();
    datumFeld.style.marginTop = "9px";
    datumFeld.setAttribute("aria-label", "Wann war die Arbeit?");
    karte.appendChild(datumFeld);

    // Punkte und Note - das Notenfeld nur, wenn das Kind schon Noten bekommt.
    var punkteFrage = el("div", "frage", "Was steht drauf?");
    karte.appendChild(punkteFrage);
    var pReihe = el("div", "punktreihe");
    var pFeld = el("input"), pMax = el("input"), nFeld = el("input");
    [pFeld, pMax, nFeld].forEach(function (f) { f.type = "text"; f.inputMode = "decimal"; });
    pFeld.placeholder = "34";  pFeld.setAttribute("aria-label", "erreichte Punkte");
    pMax.placeholder = "60";   pMax.setAttribute("aria-label", "mögliche Punkte");
    nFeld.placeholder = "3";   nFeld.setAttribute("aria-label", "Note");
    pReihe.appendChild(pFeld);
    pReihe.appendChild(el("span", null, "von"));
    pReihe.appendChild(pMax);
    pReihe.appendChild(el("span", null, "Punkten"));
    var noteStueck = el("span", null, "· Note");
    noteStueck.style.marginLeft = "4px";
    karte.appendChild(pReihe);

    var hinweisP = el("p", "melde");
    hinweisP.textContent = "Steht keine Punktzahl drauf, lass die Felder einfach leer.";
    karte.appendChild(hinweisP);

    karte.appendChild(el("div", "frage", "Fotos (bis zu " + MAX_SEITEN + ")"));
    var datei = el("input");
    datei.type = "file";
    datei.accept = "image/*";
    datei.multiple = true;
    datei.style.display = "none";
    karte.appendChild(datei);
    var fotoKnopf = el("button", "knopf");
    fotoKnopf.type = "button";
    fotoKnopf.innerHTML = '<span class="z">📷</span>Foto von der Arbeit';
    fotoKnopf.addEventListener("click", function () { datei.click(); });
    var fotoHuelle = el("div");
    fotoHuelle.style.marginTop = "9px";
    fotoHuelle.appendChild(fotoKnopf);
    karte.appendChild(fotoHuelle);
    var seitenReihe = el("div", "seiten");
    karte.appendChild(seitenReihe);

    karte.appendChild(el("div", "frage", "Willst du noch etwas dazu sagen?"));
    var notizFeld = el("textarea");
    notizFeld.placeholder = "zum Beispiel: Beim Hörverstehen lief es gut, beim Schreiben nicht.";
    notizFeld.style.marginTop = "9px";
    notizFeld.setAttribute("aria-label", "Willst du noch etwas dazu sagen?");
    karte.appendChild(notizFeld);

    var losKnopf = el("button", "los", "Abschicken");
    losKnopf.type = "button";
    karte.appendChild(losKnopf);
    var melde = el("p", "melde");
    karte.appendChild(melde);

    function sagen(text, art) {
      melde.className = "melde" + (art ? " " + art : "");
      melde.textContent = text || "";
    }

    function pruefen() {
      var gut = !!zustand.fach && anlassFeld.value.trim().length > 0 && !zustand.laeuft;
      losKnopf.disabled = !gut;
    }

    anlassFeld.addEventListener("input", pruefen);

    /* ---------- Fotos ---------- */
    function seitenMalen() {
      seitenReihe.innerHTML = "";
      zustand.seiten.forEach(function (url, i) {
        var s = el("div", "seite");
        var b = el("img");
        b.src = url;
        b.alt = "Seite " + (i + 1);
        s.appendChild(b);
        var weg = el("button", "weg", "✕");
        weg.type = "button";
        weg.setAttribute("aria-label", "Seite " + (i + 1) + " wegnehmen");
        weg.addEventListener("click", function () {
          zustand.seiten.splice(i, 1);
          seitenMalen();
        });
        s.appendChild(weg);
        seitenReihe.appendChild(s);
      });
      fotoKnopf.style.display = zustand.seiten.length >= MAX_SEITEN ? "none" : "";
    }

    datei.addEventListener("change", function () {
      var dateien = Array.prototype.slice.call(datei.files || []);
      datei.value = "";
      if (!dateien.length) return;
      var platz = MAX_SEITEN - zustand.seiten.length;
      if (platz <= 0) return;
      dateien.slice(0, platz).forEach(function (f) {
        var leser = new FileReader();
        leser.onload = function () {
          zustand.seiten.push(String(leser.result));
          seitenMalen();
          sagen("");
        };
        leser.onerror = function () { sagen("Das Foto konnte ich nicht lesen. Versuch es noch einmal.", "schlecht"); };
        leser.readAsDataURL(f);
      });
    });

    /* ---------- Abschicken ---------- */
    losKnopf.addEventListener("click", function () {
      if (zustand.laeuft) return;
      zustand.laeuft = true;
      pruefen();
      sagen("Ich speichere das …");

      var eintrag = {
        fach: zustand.fach,
        anlass: anlassFeld.value.trim(),
        datum: datumFeld.value || heute(),
        punkte: pFeld.value.trim(),
        maxpunkte: pMax.value.trim(),
        notiz: notizFeld.value.trim()
      };
      if (zustand.mitNote) eintrag.note = nFeld.value.trim();

      var kleiner = (global.LWStrom && global.LWStrom.kleinerMachen)
        ? global.LWStrom.kleinerMachen(zustand.seiten)
        : Promise.resolve(zustand.seiten);

      kleiner.then(function (seiten) {
        return fetch("/api/zurueck", {
          method: "POST", credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ kind: kind, eintrag: eintrag, seiten: seiten })
        });
      }).then(function (r) { return r.json(); }).then(function (j) {
        zustand.laeuft = false;
        if (!j || !j.ok) throw new Error((j && j.fehler) || "Das ging gerade nicht.");
        zustand.liste = j.liste || [];
        zustand.seiten = [];
        anlassFeld.value = ""; pFeld.value = ""; pMax.value = ""; nFeld.value = ""; notizFeld.value = "";
        seitenMalen();
        pruefen();
        sagen("Gespeichert. Das ist jetzt aufgehoben.", "gut");
        listeMalen();
      }).catch(function (e) {
        zustand.laeuft = false;
        pruefen();
        sagen(e.message || "Das ging gerade nicht.", "schlecht");
      });
    });

    /* ---------- Liste ---------- */
    function listeMalen() {
      listKarte.innerHTML = "";
      listKarte.appendChild(el("h2", null, "Was du schon zurückhast"));
      if (zustand.liste === null) {
        listKarte.appendChild(el("p", "leer", "Ich komme gerade nicht an deine Arbeiten. Versuch es später noch einmal."));
        return;
      }
      if (!zustand.liste.length) {
        listKarte.appendChild(el("p", "leer", "Noch nichts. Sobald du eine Arbeit zurückbekommst, kommt sie hierher."));
        return;
      }
      zustand.liste.forEach(function (e) {
        var z = el("div", "eintrag");
        var vor = el("div", "vor");
        if (e.seiten > 0) {
          var b = el("img");
          b.alt = "";
          b.loading = "lazy";
          vor.appendChild(b);
          fetch("/api/zurueck?kind=" + encodeURIComponent(kind) + "&bild=" + encodeURIComponent(e.id + ":0"),
                { credentials: "same-origin" })
            .then(function (r) { return r.json(); })
            .then(function (j) { if (j && j.ok && j.bild) b.src = j.bild; })
            .catch(function () {});
        } else {
          vor.textContent = "📄";
        }
        z.appendChild(vor);

        var m = el("div", "mitte");
        m.appendChild(el("b", null, e.anlass));
        var teile = [];
        var fach = zustand.faecher.filter(function (f) { return f.schluessel === e.fach; })[0];
        teile.push(fach ? fach.text : e.fach);
        if (e.datum) teile.push(datumSchoen(e.datum));
        if (e.punkte !== undefined && e.maxpunkte !== undefined) {
          teile.push(e.punkte + " von " + e.maxpunkte + " Punkten");
        } else if (e.punkte !== undefined) {
          teile.push(e.punkte + " Punkte");
        }
        m.appendChild(el("small", null, teile.join(" · ")));
        if (e.notiz) m.appendChild(el("small", null, "„" + e.notiz + "“"));
        z.appendChild(m);

        if (typeof e.note === "number") {
          z.appendChild(el("div", "note", String(e.note).replace(".", ",")));
        }
        listKarte.appendChild(z);
      });
    }

    /* ---------- Laden ---------- */
    fetch("/api/zurueck?kind=" + encodeURIComponent(kind), { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) throw new Error((j && j.fehler) || "");
        zustand.faecher = j.faecher || [];
        zustand.mitNote = !!j.mitNote;
        zustand.liste = j.liste || [];
        if (zustand.mitNote) {
          pReihe.appendChild(noteStueck);
          pReihe.appendChild(nFeld);
          nFeld.style.width = "70px";
          nFeld.style.minWidth = "70px";
        }
        zustand.faecher.forEach(function (f) {
          var c = el("button", "chip", f.text);
          c.type = "button";
          c.addEventListener("click", function () {
            zustand.fach = f.schluessel;
            Array.prototype.forEach.call(fachReihe.children, function (x) { x.classList.remove("an"); });
            c.classList.add("an");
            pruefen();
          });
          fachReihe.appendChild(c);
        });
        pruefen();
        listeMalen();
      })
      .catch(function () {
        zustand.liste = null;
        sagen("Ich komme gerade nicht an deine Sachen. Lade die Seite noch einmal.", "schlecht");
        listeMalen();
      });

    seitenMalen();
    pruefen();
  }

  global.LWZurueck = { einbauen: einbauen };
})(window);
