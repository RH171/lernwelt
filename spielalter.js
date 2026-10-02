/* Neueste Spiele nach vorn (Denny, 02.10.2026: "die aktuellen Spiele immer
 * ganz vorne"). Die Daten schreibt spielalter.mjs beim Autosync nach
 * /<kind>/spiele-alter.json: Datei -> Zeitpunkt des ersten Commits.
 *
 *   LWAlter.laden("leon").then(function(alter){ … })
 *   LWAlter.sortieren(liste, alter)   // Kinder von <liste> neu ordnen
 *
 * Einträge ohne Datum (Schmiede, Fremdes) bleiben vorn in ihrer Reihenfolge,
 * danach das Neueste zuerst. Sortiert wird einmal beim Laden. */
(function(){
  function datei(href){ return String(href || "").split("?")[0].split("#")[0].split("/").pop()
    .replace(/\.html$/, "") + ".html"; }
  function wert(alter, el){
    var a = el.matches && el.matches("a[href]") ? el : (el.querySelector && el.querySelector("a[href]"));
    var t = a ? alter[datei(a.getAttribute("href"))] : null;
    return t ? Date.parse(t) || 0 : 0;
  }
  window.LWAlter = {
    datei: datei,
    laden: function(kind){
      return fetch("/" + kind + "/spiele-alter.json", { cache: "no-store" })
        .then(function(r){ return r.ok ? r.json() : {}; })
        .catch(function(){ return {}; });
    },
    zeit: function(alter, href){ var t = alter[datei(href)]; return t ? Date.parse(t) || 0 : 0; },
    // Gibt die Elemente in neuer Reihenfolge zurück, ohne das DOM anzufassen.
    ordnen: function(el, alter){
      el = Array.prototype.slice.call(el);
      el.forEach(function(x, i){ x.__platz = i; });
      return el.sort(function(a, b){
        var za = wert(alter || {}, a), zb = wert(alter || {}, b);
        if (!za || !zb) return (za ? 1 : 0) - (zb ? 1 : 0) || a.__platz - b.__platz;
        return zb - za || a.__platz - b.__platz;
      });
    },
    sortieren: function(liste, alter){
      if (!liste || !alter) return;
      var el = Array.prototype.filter.call(liste.children, function(x){ return x.tagName !== "SCRIPT"; });
      LWAlter.ordnen(el, alter).forEach(function(x){ liste.appendChild(x); });
    }
  };
})();
