/* Eine Seite in der aktuellen Fenstergröße durchmessen.
 *
 * Wird im Browser ausgeführt (javascript_tool) und gibt einen Bericht zurück.
 * Der Sinn: dieselbe Prüfung jedes Mal, damit ein Vergleich möglich ist -
 * nicht jedes Mal ein anderer Blick.
 *
 *     layoutMessen()              die Seite, wie sie gerade dasteht
 *     layoutMessen({still:true})  ohne Töne (setzt Web-Audio stumm)
 *
 * Gemessen wird, was ein Kind merkt:
 *  - muss es scrollen, um weiterzukommen?
 *  - trifft der Finger die Knöpfe? (44 Pixel, Apple- und Google-Richtwert)
 *  - rutscht etwas seitlich aus dem Bild?
 *  - ist Schrift zu klein zum Lesen?
 */
function layoutMessen(opt) {
  opt = opt || {};

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

  var tippbar = document.querySelectorAll(
    "button, a[href], input, select, textarea, summary, [role='button'], .choice, .opt, .thema");
  Array.prototype.forEach.call(tippbar, function (el) {
    if (!sichtbar(el)) return;
    var r = el.getBoundingClientRect();
    if (r.height < 44) zuKlein.push(text(el) + " · " + Math.round(r.height) + "px hoch");
    if (r.width  < 44 && r.height < 44) zuSchmal.push(text(el) + " · " + Math.round(r.width) + "px breit");
    // Ein Knopf, den man nur nach Scrollen erreicht, unterbricht den Fluss.
    if (r.top >= H) unterDemRand.push(text(el) + " · " + Math.round(r.top - H) + "px darunter");
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
    sauber: !(doc.scrollWidth > W + 1) && !zuKlein.length && !unterDemRand.length && !winzigeSchrift.length
  };
}
