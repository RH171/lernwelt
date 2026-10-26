/* Heft gegen die Lehrerin anzeigen (13.10.2026)
 *
 * Denny: "die Einträge in seinem Heft mit dem Hochladen der Lehrerin zu
 * verifizieren und gegebenenfalls auf Fehler direkt hinzuweisen. Natürlich
 * zählt das Hochladen oder der rote Stift der Lehrerin."
 *
 * Diese Datei enthält KEINE Daten der Lehrerin - sie holt sie über
 * /api/lehrervorlagen (nur mit Ausweis) und malt sie. Benutzt von
 * paul/schulstoff.html (Großansicht, Schild auf der Karte) und
 * eltern/index.html (Karte "Heft und Lehrerin").
 *
 *   LWLehrer.holen("paul").then(function(d){ ... d.vergleiche[blattId] ... })
 *   LWLehrer.kasten(vergleich, "kind" | "eltern")  -> HTML oder ""
 *   LWLehrer.schild(vergleich)                     -> HTML oder "" (für die Blattkarte)
 */
(function () {
  "use strict";
  var cache = {};
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function holen(kind) {
    if (cache[kind]) return cache[kind];
    cache[kind] = fetch("/api/lehrervorlagen?kind=" + encodeURIComponent(kind), { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        /* Ein Server ohne diesen Weg (oder eine Attrappe) antwortet womöglich
           nur {ok:true} - dann gibt es eben nichts zu zeigen. */
        if (!j || !j.ok || typeof j.vergleiche !== "object" || !j.vergleiche) return { ok: false, vergleiche: {}, medien: [] };
        return j;
      })
      .catch(function () { return { ok: false, vergleiche: {}, medien: [] }; });
    return cache[kind];
  }
  function neu(kind) { delete cache[kind]; return holen(kind); }

  function anzahl(v) {
    if (!v) return 0;
    return (v.abweichungen || []).length + (v.schreibweise || []).length + (v.rot || []).length;
  }

  /* Wie = "kind": du-Form für Paul. "eltern": sachlich. */
  function kasten(v, wie) {
    if (!v) return "";
    var du = wie !== "eltern";
    var ab = v.abweichungen || [], sw = v.schreibweise || [], gl = v.gleichwertig || [], rot = v.rot || [];
    if (!v.vorlage && !rot.length) return "";
    var h = '<div class="lwl" data-lwl="1">';
    h += '<div class="lwl-kopf">✍️ ' + (v.vorlage ? (du ? "Mit deiner Lehrerin verglichen" : "Mit der Vorlage der Lehrerin verglichen") : (du ? "Deine Lehrerin hat verbessert" : "Rote Verbesserungen der Lehrerin")) + "</div>";
    if (v.vorlage) {
      h += '<div class="lwl-unter">Vorlage: „' + esc(v.vorlage.titel) + '“ · ' + v.richtig + " von " + v.geprueft + " wie bei der Lehrerin</div>";
    }
    ab.forEach(function (x) {
      /* Heft-Hinweis (26.10.2026): der Server liefert nur am Foto bestätigte Abweichungen. Für Paul
         derselbe Wortlaut wie im Prüf-Reiter. */
      h += '<div class="lwl-zeile lwl-ab" data-lwl-art="abweichung"><b>' + esc(x.aufgabe) + "</b><br>" +
        (du ? "In deinem Heft steht: <span>" + esc(x.paul || "") + "</span> · Auf dem Blatt der Lehrerin steht: <strong>" +
              esc(x.lehrerin) + "</strong><br>Schau es dir mit Papa an."
            : "Lehrerin: <strong>" + esc(x.lehrerin) + "</strong> · Paul: <span>" + esc(x.paul || "") + "</span>") + "</div>";
    });
    sw.forEach(function (x) {
      h += '<div class="lwl-zeile lwl-sw" data-lwl-art="schreibweise">✏️ <b>Schreibweise</b> – ' + esc(x.aufgabe) + ": " +
        (du ? "deine Lehrerin schreibt " : "Lehrerin ") + "„<strong>" + esc(x.lehrerin) + "</strong>“, " +
        (du ? "du hast " : "Paul ") + "„" + esc(x.paul || "") + "“</div>";
    });
    gl.forEach(function (x) {
      h += '<div class="lwl-zeile lwl-gl" data-lwl-art="gleichwertig">✅ ' + esc(x.aufgabe) + ": „" + esc(x.paul) + "“ und „" +
        esc(x.lehrerin) + "“ meinen dasselbe – passt.</div>";
    });
    rot.forEach(function (z) {
      h += '<div class="lwl-zeile lwl-rot" data-lwl-art="rot">✍️ ' + esc(z) + "</div>";
    });
    /* 26.10.2026: noch nicht am Foto bestätigte Abweichungen zeigt der Server nicht - nur ihre Zahl, nur für die Eltern. */
    if (!du && v.ungeprueft > 0) {
      h += '<div class="lwl-zeile lwl-offen" data-lwl-art="ungeprueft">⏳ ' + v.ungeprueft +
        (v.ungeprueft === 1 ? " Stelle wartet" : " Stellen warten") + " noch auf die Gegenprobe am Foto (Paul sieht sie erst danach).</div>";
    }
    if (v.vorlage && !ab.length && !sw.length && !(v.ungeprueft > 0)) {
      h += '<div class="lwl-zeile lwl-gut" data-lwl-art="gut">✅ ' + (du ? "Alles wie bei deiner Lehrerin." : "Alles wie bei der Lehrerin.") + "</div>";
    }
    return h + "</div>";
  }

  function schild(v) {
    var n = v ? (v.abweichungen || []).length : 0;
    if (!n) return "";
    return '<span class="lwl-schild" title="Weicht von der Vorlage der Lehrerin ab">✍️ ' + n + "</span>";
  }

  /* Einmal das Aussehen - hell und dunkel, ohne Rot (Rot ist die Lehrerin,
     und ein roter Kasten sieht aus wie ein Fehler des Kindes). */
  if (!document.getElementById("lwl-stil")) {
    var st = document.createElement("style");
    st.id = "lwl-stil";
    st.textContent =
      ".lwl{background:#fffbeb;color:#1f2937;border:1.5px solid #f59e0b;border-radius:16px;padding:12px 14px;margin:10px 0;font-size:15.5px;line-height:1.45;text-align:left}" +
      ".lwl-kopf{font-weight:800;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#92400e}" +
      ".lwl-unter{font-size:13.5px;color:#57534e;margin:2px 0 6px}" +
      ".lwl-zeile{padding:7px 0;border-top:1px solid #fde68a}" +
      ".lwl-ab strong{color:#065f46}.lwl-ab span{text-decoration:line-through;text-decoration-color:#b45309}" +
      ".lwl-gut,.lwl-gl{color:#065f46}" +
      ".lwl-schild{position:absolute;bottom:58px;right:8px;background:#b45309;color:#fff;border-radius:999px;padding:3px 9px;font:700 12.5px ui-rounded,system-ui,sans-serif}" +
      "html[data-theme=\"dark\"] .lwl{background:#2a2414;color:#f5f5f4;border-color:#b45309}" +
      "html[data-theme=\"dark\"] .lwl-kopf{color:#fcd34d}html[data-theme=\"dark\"] .lwl-unter{color:#d6d3d1}" +
      "html[data-theme=\"dark\"] .lwl-zeile{border-top-color:#57452a}" +
      "html[data-theme=\"dark\"] .lwl-ab strong,html[data-theme=\"dark\"] .lwl-gut,html[data-theme=\"dark\"] .lwl-gl{color:#6ee7b7}";
    (document.head || document.documentElement).appendChild(st);
  }

  window.LWLehrer = { holen: holen, neu: neu, kasten: kasten, schild: schild, anzahl: anzahl, esc: esc };
})();
