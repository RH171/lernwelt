/* Eine Seite in der aktuellen Fenstergröße durchmessen.
 *
 * Wird im Browser ausgeführt (javascript_tool) und gibt einen Bericht zurück.
 * Der Sinn: dieselbe Prüfung jedes Mal, damit ein Vergleich möglich ist -
 * nicht jedes Mal ein anderer Blick.
 *
 *     await layoutMessen()                     die Seite, wie sie gerade dasteht
 *     await layoutMessen({still:true})         ohne Töne
 *     await layoutMessen({beruehrung:true})    mit den Touch-Regeln
 *
 * ZUR BERÜHRUNG: Der Testbrowser meldet bei iPad-Breite kein
 * "pointer: coarse", die Regeln aus beruehrung.css greifen dort also nicht -
 * auf Pauls echtem iPad sehr wohl. Ohne {beruehrung:true} meldet die Messung
 * darum Tippziele als zu klein, die in Wirklichkeit stimmen. Bei jedem
 * Touch-Gerät aus geraete.json also IMMER mit.
 *
 * Gemessen wird, was ein Kind merkt:
 *  - muss es scrollen, um weiterzukommen?
 *  - trifft der Finger die Knöpfe? (44 Pixel, Apple- und Google-Richtwert)
 *  - rutscht etwas seitlich aus dem Bild?
 *  - ist Schrift zu klein zum Lesen?
 */
async function layoutMessen(opt) {
  opt = opt || {};

  // Die Touch-Regeln ohne ihre Bedingung einspielen - dann sieht die Messung,
  // was das Kind auf seinem Gerät wirklich sieht.
  if (opt.beruehrung && !document.getElementById("mess-beruehrung")) {
    try {
      var css = await fetch("/beruehrung.css").then(function (r) { return r.text(); });
      var auf = css.indexOf("{", css.indexOf("@media"));
      var zu  = css.lastIndexOf("}");
      var st = document.createElement("style");
      st.id = "mess-beruehrung";
      st.textContent = css.slice(auf + 1, zu);
      document.head.appendChild(st);
      await new Promise(function (r) { setTimeout(r, 60); });
    } catch (e) {}
  }

  if (opt.still) {
    try {
      var A = window.AudioContext || window.webkitAudioContext;
      if (A && !window.__stumm) {
        window.__stumm = true;
        var alt = A.prototype.createOscillator;
        A.prototype.createOscillator = function () {
          var o = alt.call(this), g = this.createGain();
          g.gain.value = 0;
          var v = o.connect.bind(o);
          o.connect = function () { return v(g); };
          g.connect(this.destination);
          return o;
        };
      }
      if (window.speechSynthesis) window.speechSynthesis.speak = function () {};
    } catch (e) {}
  }

  var W = window.innerWidth, H = window.innerHeight;
  var doc = document.documentElement;
  var text = function (el) {
    return (el.getAttribute("aria-label") || el.textContent || el.id || el.tagName)
             .trim().replace(/\s+/g, " ").slice(0, 32);
  };
  var sichtbar = function (el) {
    var s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || s.opacity === "0") return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  var zuKlein = [], unterDemRand = [], zuSchmal = [], winzigeSchrift = [];

  // Was das Kind drücken MUSS, um weiterzukommen.
  var HAUPTKNOPF = ".next, .start, .schicken, .weiter, #weiter, #startBtn, #chk, #again," +
                   " [type='submit'], button.primaer, .cta";

  var tippbar = document.querySelectorAll(
    "button, a[href], input, select, textarea, summary, [role='button'], .choice, .opt, .thema");
  Array.prototype.forEach.call(tippbar, function (el) {
    if (!sichtbar(el)) return;
    var r = el.getBoundingClientRect();
    if (r.height < 44) zuKlein.push(text(el) + " · " + Math.round(r.height) + "px hoch");
    if (r.width  < 44 && r.height < 44) zuSchmal.push(text(el) + " · " + Math.round(r.width) + "px breit");
    // Nur die HAUPTknöpfe zählen. Dass eine Spieleliste weiterscrollt, ist
    // normal; dass "Weiter" oder "Los geht's" unter dem Rand liegt, nicht.
    if (r.top >= H && el.matches(HAUPTKNOPF))
      unterDemRand.push(text(el) + " · " + Math.round(r.top - H) + "px darunter");
  });

  Array.prototype.forEach.call(document.querySelectorAll("p, li, small, .hint, .tipp, .foot"), function (el) {
    if (!sichtbar(el)) return;
    var g = parseFloat(getComputedStyle(el).fontSize);
    if (g && g < 12) winzigeSchrift.push(text(el) + " · " + g.toFixed(1) + "px");
  });

  var einmalig = function (a) { return Array.from(new Set(a)); };

  return {
    fenster: W + "x" + H,
    seitenhoehe: doc.scrollHeight,
    mussScrollen: doc.scrollHeight > H + 1,
    seitlichUeber: Math.max(0, doc.scrollWidth - W),
    tippzieleZuNiedrig: einmalig(zuKlein),
    tippzieleZuSchmal: einmalig(zuSchmal),
    knoepfeUnterDemRand: einmalig(unterDemRand),
    schriftUnter12px: einmalig(winzigeSchrift),
    beruehrungGeprueft: !!opt.beruehrung,
    sauber: !(doc.scrollWidth > W + 1) && !zuKlein.length && !unterDemRand.length && !winzigeSchrift.length
  };
}
