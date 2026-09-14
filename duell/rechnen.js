// Rechenfragen fuer das Quiz-Duell - passend zur Klasse des JUENGSTEN Mitspielers.
// Denny, 14.09.2026: "5x3, 6+6". Falsche Antworten sind typische Fehler
// (um eins verzaehlt, plus statt mal, Zehner verrutscht), keine Zufallszahlen.

function z(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }

function ablenker(r, extra){
  var k = (extra || []).concat([r + 1, r - 1, r + 2, r - 2, r + 10, r - 10]);
  var gut = [];
  // Negative Ablenker nur, wenn auch das Ergebnis negativ ist - sonst waeren es nur drei Antworten (gefunden beim Pruefen am 14.09.2026)
  k.forEach(function(x){ if ((x >= 0 || r < 0) && x !== r && gut.indexOf(x) < 0 && gut.length < 3) gut.push(x); });
  return gut;
}

export function rechenFrage(klasse){
  var k = Math.max(1, Math.min(klasse || 1, 7)), a, b, r, text, sprich, extra = [], info;
  var art = Math.random();
  if (k === 1){
    if (art < .5){ a = z(2, 9); b = z(1, 10 - a); r = a + b; text = a + " + " + b; sprich = a + " plus " + b; }
    else { a = z(5, 10); b = z(1, a - 1); r = a - b; text = a + " − " + b; sprich = a + " minus " + b; extra = [a + b]; }
    info = "Tipp: Rechne mit den Fingern – bis 10 reichen zwei Hände.";
  } else if (k === 2){
    if (art < .3){ a = z(4, 9); b = z(11 - a, 9); r = a + b; text = a + " + " + b; sprich = a + " plus " + b; info = "Über die 10: " + a + " + " + (10 - a) + " = 10, dann noch " + (b - (10 - a)) + "."; }
    else if (art < .5){ a = z(11, 18); b = z(a - 9, 9); r = a - b; text = a + " − " + b; sprich = a + " minus " + b; extra = [a + b]; info = "Erst bis zur 10 zurück, dann weiter."; }
    else if (art < .8){ a = [2, 5, 10][z(0, 2)]; b = z(2, 10); r = a * b; text = b + " × " + a; sprich = b + " mal " + a; extra = [a + b, r + a]; info = b + " × " + a + " heißt: " + b + "-mal die " + a + "."; }
    else { a = z(3, 12); r = a + a; text = a + " + " + a; sprich = a + " plus " + a; info = "Das ist das Doppelte von " + a + "."; }
  } else if (k === 3){
    if (art < .5){ a = z(3, 9); b = z(3, 9); r = a * b; text = a + " × " + b; sprich = a + " mal " + b; extra = [a + b, r + a, r - b]; info = "Einmaleins: " + a + " × " + b + " = " + r + "."; }
    else if (art < .75){ b = z(2, 9); r = z(2, 9); a = b * r; text = a + " : " + b; sprich = a + " geteilt durch " + b; extra = [r + 1, a - b]; info = "Umkehraufgabe: " + r + " × " + b + " = " + a + "."; }
    else { a = z(21, 68); b = z(11, 99 - a); r = a + b; text = a + " + " + b; sprich = a + " plus " + b; extra = [r + 10, r - 10]; info = "Erst die Zehner, dann die Einer."; }
  } else if (k === 4){
    if (art < .4){ a = z(6, 12); b = z(6, 12); r = a * b; text = a + " × " + b; sprich = a + " mal " + b; extra = [r + a, r - b]; info = a + " × " + b + " = " + r + "."; }
    else if (art < .7){ a = z(12, 48) * 10; b = z(11, 45) * 10; r = a + b; text = a + " + " + b; sprich = a + " plus " + b; extra = [r + 100, r - 100]; info = "Mit Zehnern rechnen wie mit Einern."; }
    else { a = z(2, 9); b = [10, 100][z(0, 1)]; r = a * b * z(1, 9); a = r / b; text = a + " × " + b; sprich = a + " mal " + b; extra = [r * 10, r / 10 | 0]; info = "Mal " + b + ": " + (b === 10 ? "eine Null" : "zwei Nullen") + " anhängen."; }
  } else {
    if (art < .35){ a = [50, 25, 10][z(0, 2)]; b = z(2, 20) * (a === 25 ? 4 : a === 10 ? 10 : 2); r = b * a / 100; text = a + " % von " + b; sprich = a + " Prozent von " + b; extra = [b - r, r * 2]; info = a + " % sind " + (a === 50 ? "die Hälfte" : a === 25 ? "ein Viertel" : "ein Zehntel") + "."; }
    else if (art < .7){ a = z(-9, -1); b = z(2, 12); r = a + b; text = "(" + a + ") + " + b; sprich = "minus " + (-a) + " plus " + b; extra = [-(r), b - a]; info = "Auf dem Zahlenstrahl von " + a + " um " + b + " nach rechts."; }
    else { a = z(11, 19); r = a * a; text = a + "²"; sprich = a + " hoch 2"; extra = [a * 2, r + a]; info = a + "² = " + a + " × " + a + "."; }
  }
  var falsch = ablenker(r, extra);
  return [k, "rechnen", "🔢", text + " = ?", [String(r)].concat(falsch.map(String)), info, sprich];
}
