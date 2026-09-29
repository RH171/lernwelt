/* Holt das Durchlesen nach, das beim Ablegen gescheitert ist.
 *
 * Denny am 29.09.2026, mit einem Bild aus Pauls Lernquiz: "Warum hat Paul
 * sein neues Blatt weder einen Titel noch die Suchfunktion? Das hat er jetzt
 * schon seit ca. 15 Minuten eingescannt."
 *
 * Schritt 2 (POST /api/schulstoff?lesen=1) war einmal mit HTTP 503 der
 * Schnittstelle gescheitert. Die Seite sagte "das hole ich nach" - und nichts
 * hat es nachgeholt. Zwei Blaetter vom 28.09.2026 lagen aus demselben Grund
 * seit einem Tag ungelesen da.
 *
 * Jede Seite, die den Heftbestand laedt, reicht ihn hier durch:
 *   if (window.LWNachlesen) LWNachlesen(kind, eintraege, nachher);
 *
 * Kosten: Der Server liest ein Blatt, das schon Inhalt hat, nie ein zweites
 * Mal (schonGelesen). Hier wird zusaetzlich je Blatt hoechstens alle zehn
 * Minuten und je Aufruf hoechstens drei Blaetter versucht. */
(function () {
  var PAUSE = 10 * 60 * 1000;   // je Blatt ein Versuch in zehn Minuten
  var FRISCH = 2 * 60 * 1000;   // gerade abgelegt: Schritt 2 laeuft vermutlich noch
  var JE_AUFRUF = 3;
  var laeuft = false;

  function schonVersucht(id) {
    try {
      var t = Number(sessionStorage.getItem("lw-nachlesen-" + id) || 0);
      return t && (Date.now() - t) < PAUSE;
    } catch (e) { return false; }
  }
  function merke(id) {
    try { sessionStorage.setItem("lw-nachlesen-" + id, String(Date.now())); } catch (e) {}
  }

  function ungelesen(e) {
    if (!e || !e.id || e.sichtbar === false) return false;
    if (e.titel || (Array.isArray(e.inhalt) && e.inhalt.length)) return false;
    if (!(Number(e.seiten) > 0)) return false;
    var t = Date.parse(e.angelegt || "");
    if (!isFinite(t) || (Date.now() - t) < FRISCH) return false;
    return !schonVersucht(e.id);
  }

  window.LWNachlesen = function (kind, eintraege, nachher) {
    if (laeuft || !kind) return;
    var offen = (eintraege || []).filter(ungelesen).slice(0, JE_AUFRUF);
    if (!offen.length) return;
    laeuft = true;
    var gelesen = 0;
    function naechstes(i) {
      if (i >= offen.length) {
        laeuft = false;
        if (gelesen && typeof nachher === "function") { try { nachher(gelesen); } catch (e) {} }
        return;
      }
      var id = offen[i].id;
      merke(id);
      fetch("/api/schulstoff?lesen=1", {
        method: "POST", credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: kind, id: id })
      })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.ok && (j.titel || j.schonGelesen || (j.karten || []).length)) gelesen++; })
      .catch(function () {})
      .then(function () { naechstes(i + 1); });
    }
    naechstes(0);
  };
})();
