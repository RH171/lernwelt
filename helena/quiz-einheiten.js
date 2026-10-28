/* Feste Übungseinheiten im Lernquiz – nur Helena (28.10.2026).
 *
 * "Deine Ex nochmal": Quelle ist AUSSCHLIESSLICH das Foto ihrer Französisch-Ex
 * vom 15.10.2026 (1. Stegreifaufgabe, Aufgabe 1, 14 Lücken, 7/14) mit den
 * roten Verbesserungen. Jede richtige Form steht so auf dem Foto, jeder
 * Ablenker auch (meist Helenas eigene falsche Form). Von Hand geschrieben,
 * keine KI, keine Kosten. Gelesen und ausgewertet: befunde/2026-10-28-bau-helena-ex.md.
 *
 * Bewusst NICHT drin:
 *   - Lücke 7 (lire): die richtige Form steht nirgends auf dem Foto.
 *   - Lücke 6 (ils vont): nur rot unterstrichen, keine rote Lösung; dieselbe
 *     Form wie Lücke 1.
 *   - "sont" (Lücke 1): die Lehrerin schrieb "vont /sont", also kein Ablenker.
 *   - Formen, die im Satz auch richtig wären (peut, a, prennent bei Lücke 5).
 *
 * Der Motor (/quiz/motor.js) liest window.QUIZ_EINHEITEN. Paul und Leon laden
 * diese Datei nicht und sehen nichts davon.
 */
(function () {
  "use strict";
  var LISTE = "Acheter – prendre – aller – vouloir – pouvoir – boire – lire – écrire – avoir – manger – préférer";
  var T = "Ex 15.10., Aufgabe 1, Lücke ";

  function luecke(id, nr, satz, richtig, falsch, tipp, erkl, merkmal, beleg) {
    return {
      id: id, fach: "franz", form: "luecke",
      frage: "Setze die richtige Verbform ein: " + satz,
      antworten: [richtig].concat(falsch), richtig: 0,
      tipp: tipp, erklaerung: erkl, merkmal: merkmal,
      beleg: { herkunft: beleg[0], zeile: beleg[1], titel: T + nr + beleg[2], abgehakt: beleg[0] === "eingetragen" || undefined }
    };
  }

  var fragen = [
    // ---- Zuerst die Lücken, die auf der Ex rot verbessert sind ----
    luecke("ex1510-01", 1, "Le matin, Julie et Paul ___ à la FNAC.", "vont", ["ont", "veulent"],
      "Gesucht ist eine Form von aller – das Verb steht in der Liste oben auf deiner Ex.",
      "Auf deiner Ex hat die Lehrerin ont rot unterstrichen und vont danebengeschrieben.",
      "aller: ils vont", ["lehrerin", "vont", " · du hattest: ont"]),
    luecke("ex1510-02", 8, "À midi, les amis ___ faim.", "ont", ["vont", "mangent"],
      "Gesucht ist eine Form von avoir – das Verb steht in der Liste oben auf deiner Ex.",
      "Auf deiner Ex hat die Lehrerin vont rot unterstrichen und ont danebengeschrieben.",
      "avoir: ils ont", ["lehrerin", "ont", " · du hattest: vont"]),
    luecke("ex1510-03", 4, "Dans un magasin, elle ___ un t-shirt bleu.", "prend", ["prends", "prendre"],
      "Achte auf den letzten Buchstaben. Bei elle hat die Lehrerin auf deiner Ex einen Buchstaben gestrichen.",
      "Du hattest prends. Die Lehrerin hat das s am Ende rot gestrichen: elle prend.",
      "prendre: elle prend", ["lehrerin", "prend", " · du hattest: prends"]),
    luecke("ex1510-04", 5, "Après le shopping, les amis Paul et Julie ___ un jus d'orange.", "boivent", ["mangent", "mange"],
      "Einen Saft isst man nicht. Gesucht ist eine Form von boire aus der Liste oben auf deiner Ex.",
      "Du hattest mangent. Die Lehrerin hat es rot unterstrichen, über der Zeile steht boivent mit rotem oi.",
      "boire: ils boivent", ["lehrerin", "boivent", " · du hattest: mangent"]),
    luecke("ex1510-05", 11, "L'après-midi, Julie est à la maison. Elle ___ une lettre à son amie française.", "écrit", ["écris", "écrire"],
      "Achte auf den letzten Buchstaben. Bei elle hat die Lehrerin auf deiner Ex einen Buchstaben ausgetauscht.",
      "Du hattest écris. Die Lehrerin hat ein rotes t über das s geschrieben: elle écrit.",
      "écrire: elle écrit", ["lehrerin", "écrit", " · du hattest: écris"]),
    {
      id: "ex1510-06", fach: "franz", form: "umgekehrt",
      frage: "Zu welchem Verb aus der Liste deiner Ex gehört die Form ont?",
      antworten: ["avoir", "aller", "vouloir"], richtig: 0,
      tipp: "Denk an Lücke 8: À midi, les amis ont faim.",
      erklaerung: "ont gehört zu avoir: ils ont. Auf deiner Ex stand dort vont, und die Lehrerin hat ont verbessert.",
      merkmal: "avoir: ils ont",
      beleg: { herkunft: "vorlage", zeile: LISTE, titel: T + "8 · Verbliste oben auf der Ex" }
    },
    // ---- Dazwischen, was du richtig hattest (abgehakt) ----
    luecke("ex1510-07", 12, "Avant de rentrer, Julie et Paul ___ le bus pour rentrer chez eux.", "prennent", ["prends", "prendre"],
      "Julie et Paul sind zwei, also ils. Gesucht ist eine Form von prendre.",
      "Das hattest du auf deiner Ex richtig: Julie et Paul prennent.",
      "prendre: ils prennent", ["eingetragen", "prennent", " · abgehakt"]),
    luecke("ex1510-08", 2, "Ils ___ faire du shopping.", "veulent", ["veut", "voulons"],
      "Bei ils endet die Form auf -ent. Gesucht ist eine Form von vouloir.",
      "Das hattest du auf deiner Ex richtig, nachdem du vont gestrichen hattest: ils veulent.",
      "vouloir: ils veulent", ["eingetragen", "veulent", " · abgehakt"]),
    {
      id: "ex1510-09", fach: "franz", form: "umgekehrt",
      frage: "Zu welchem Verb aus der Liste deiner Ex gehört die Form vont?",
      antworten: ["aller", "avoir", "vouloir"], richtig: 0,
      tipp: "Denk an Lücke 1: Le matin, Julie et Paul vont à la FNAC.",
      erklaerung: "vont gehört zu aller: ils vont. Auf deiner Ex stand dort ont, und die Lehrerin hat vont verbessert.",
      merkmal: "aller: ils vont",
      beleg: { herkunft: "vorlage", zeile: LISTE, titel: T + "1 · Verbliste oben auf der Ex" }
    },
    luecke("ex1510-10", 9, "Ils ___ une pizza ensemble.", "mangent", ["mange", "manger"],
      "Bei ils endet die Form auf -ent. Gesucht ist eine Form von manger.",
      "Das hattest du auf deiner Ex richtig: ils mangent.",
      "manger: ils mangent", ["eingetragen", "mangent", " · abgehakt"]),
    luecke("ex1510-11", 3, "Julie ___ acheter un nouveau T-shirt.", "veut", ["veulent", "voulez"],
      "Julie ist eine Person, also elle. Gesucht ist eine Form von vouloir.",
      "Das hattest du auf deiner Ex richtig, nachdem du zweimal gestrichen hattest: Julie veut.",
      "vouloir: elle veut", ["eingetragen", "veut", " · abgehakt"]),
    luecke("ex1510-12", 10, "Julie aime les pizzas, mais Paul ___ les hamburgers.", "préfère", ["préférer", "mangent"],
      "Paul ist eine Person, also il. Gesucht ist eine Form von préférer.",
      "Das hattest du auf deiner Ex richtig: Paul préfère.",
      "préférer: il préfère", ["eingetragen", "préfère", " · abgehakt"]),
    luecke("ex1510-13", 13, "Est-ce que vous ___ aller au cinéma avec moi ?", "voulez", ["voulons", "veulent"],
      "Bei vous endet die Form auf -ez. Gesucht ist eine Form von vouloir.",
      "Das hattest du auf deiner Ex richtig: vous voulez.",
      "vouloir: vous voulez", ["eingetragen", "voulez", " · abgehakt"])
  ];

  window.QUIZ_EINHEITEN = window.QUIZ_EINHEITEN || {};
  window.QUIZ_EINHEITEN["ex-franz-1510"] = {
    titel: "Deine Ex nochmal",
    unter: "Französisch-Ex vom 15.10. · " + fragen.length + " Fragen · zuerst, was verbessert wurde",
    fach: "franz",
    fragen: fragen
  };
})();
