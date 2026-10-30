/* Blatt aufrecht (Auftrag 178, 30.10.2026) - nur auf Pauls Seiten eingebunden.
 *
 * Denny: „Die App muss selbst erkennen, wie das Blatt liegt, und es aufrecht anzeigen.
 *  a) Beim Aufnehmen eines Blatts: Schriftrichtung erkennen, drehen und aufrecht speichern.
 *  c) Pauls Seite bekommt einen kleinen Knopf "Drehen" am Bild, falls die Erkennung einmal
 *     danebenliegt.“
 *
 * LWDrehen.aufrichten(kind, urls)  -> Promise<urls>  vor dem Hochladen: kleine Fassung an
 *     POST /api/schulstoff?drehung=1, das Modell sagt die Laufrichtung der Zeilen, gedreht wird
 *     im Browser (Canvas). Klappt etwas nicht, geht das Foto unverändert hoch - nie verloren.
 * LWDrehen.drehen(url, grad)       -> Promise<url>   im Uhrzeigersinn, JPEG.
 * LWDrehen.knopf(ort, opt)         -> Knopf "↻ Drehen". opt: kind, wer() -> {id, nr, img},
 *     fertig(url, grad). Jeder Tipp dreht die Anzeige um 90 Grad weiter; nach kurzer Ruhe geht
 *     EIN Auftrag an POST /api/schulstoff?drehen=1 - viermal tippen kostet nichts.
 */
(function (global) {
  "use strict";
  var ERKENNEN_GRENZE = 16000;   // länger wartet Paul beim Ablegen nicht auf die Erkennung
  var RUHE = 1200;               // so lange nach dem letzten Tipp, dann wird gespeichert

  function bildLaden(url) {
    return new Promise(function (ok, nein) {
      var im = new Image();
      im.onload = function () { ok(im); };
      im.onerror = nein;
      im.src = url;
    });
  }

  function drehen(url, grad, max) {
    grad = ((Math.round(Number(grad) / 90) * 90) % 360 + 360) % 360;
    if (!grad && !max) return Promise.resolve(url);
    return bildLaden(url).then(function (im) {
      var w = im.naturalWidth, h = im.naturalHeight;
      var f = max ? Math.min(1, max / Math.max(w, h)) : 1;
      w = Math.round(w * f); h = Math.round(h * f);
      var quer = grad === 90 || grad === 270;
      var c = document.createElement("canvas");
      c.width = quer ? h : w; c.height = quer ? w : h;
      var g = c.getContext("2d");
      g.translate(c.width / 2, c.height / 2);
      g.rotate(grad * Math.PI / 180);
      g.drawImage(im, -w / 2, -h / 2, w, h);
      return c.toDataURL("image/jpeg", 0.85);
    });
  }

  function erkennen(kind, url) {
    if (String(url).indexOf("data:image/") !== 0) return Promise.resolve(0);
    var uhr;
    var zeit = new Promise(function (ok) { uhr = setTimeout(function () { ok(0); }, ERKENNEN_GRENZE); });
    var frage = drehen(url, 0, 640).then(function (klein) {
      return fetch("/api/schulstoff?drehung=1", {
        method: "POST", credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: kind, bild: klein })
      });
    }).then(function (r) { return r.json(); })
      .then(function (j) { return j && j.ok ? Number(j.grad) || 0 : 0; })
      .catch(function () { return 0; });
    return Promise.race([frage, zeit]).then(function (g) { clearTimeout(uhr); return g; });
  }

  function aufrichten(kind, urls) {
    return Promise.all((urls || []).map(function (u) {
      return erkennen(kind, u).then(function (g) {
        return g ? drehen(u, g).catch(function () { return u; }) : u;
      });
    }));
  }

  function knopf(ort, opt) {
    if (!ort || !opt || typeof opt.wer !== "function") return null;
    var b = document.createElement("button");
    b.type = "button";
    b.className = (opt.klasse || "lwd-drehen");
    b.textContent = "↻ Drehen";
    b.title = "Das Blatt um eine Vierteldrehung drehen";
    b.setAttribute("aria-label", "Blatt drehen");
    var offen = 0, uhr = null, ziel = null, laeuft = false;

    function anzeigen(img, g) {
      img.style.transition = "transform .2s";
      img.style.transform = g ? "rotate(" + g + "deg)" : "";
    }
    function speichern() {
      var z = ziel, g = offen % 360;
      offen = 0; ziel = null;
      if (!z || !g) { if (z) anzeigen(z.img, 0); return; }
      laeuft = true; b.disabled = true; b.textContent = "Ich drehe …";
      drehen(z.img.src, g).then(function (neu) {
        return fetch("/api/schulstoff?drehen=1", {
          method: "POST", credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ kind: opt.kind, id: z.id, nr: z.nr, grad: g, bild: neu })
        }).then(function (r) { return r.json(); }).then(function (j) {
          if (!j || !j.ok) throw new Error((j && j.fehler) || "nein");
          z.img.style.transition = "none";
          anzeigen(z.img, 0);
          z.img.src = neu;
          if (opt.fertig) { try { opt.fertig(neu, g, z); } catch (e) {} }
        });
      }).catch(function () {
        anzeigen(z.img, 0);
        b.textContent = "Ging gerade nicht";
        setTimeout(function () { b.textContent = "↻ Drehen"; }, 2500);
      }).then(function () {
        laeuft = false; b.disabled = false;
        if (b.textContent === "Ich drehe …") b.textContent = "↻ Drehen";
      });
    }
    b.addEventListener("click", function (ev) {
      ev.stopPropagation();
      if (laeuft) return;
      var w = opt.wer();
      if (!w || !w.img || !w.img.src || !w.id) return;
      if (ziel && ziel.img !== w.img) { anzeigen(ziel.img, 0); offen = 0; }
      ziel = w;
      offen += 90;
      anzeigen(w.img, offen % 360 === 0 ? 0 : offen);
      clearTimeout(uhr);
      uhr = setTimeout(speichern, RUHE);
    });
    ort.appendChild(b);
    return b;
  }

  global.LWDrehen = { aufrichten: aufrichten, drehen: drehen, erkennen: erkennen, knopf: knopf };
})(window);
