// Prüft eine Spielseite auf die Fehler, die beim Umbauen entstehen:
// aufgerufene, aber nirgends definierte Funktionen; Skript-IDs ohne
// HTML-Element; kaputte Syntax. Aufruf: node pruefe-seite.js <datei...>
const fs = require("fs");
const path = require("path");

const EINGEBAUT = new Set(["if","for","while","switch","catch","return","typeof","new","function",
  "parseInt","parseFloat","Number","String","Array","Object","Math","Date","JSON","fetch","setTimeout",
  "setInterval","clearInterval","clearTimeout","encodeURIComponent","decodeURIComponent","isNaN",
  "Promise","RegExp","requestAnimationFrame","FileReader","Image","Blob","URL","SpeechSynthesisUtterance",
  "confirm","alert","escape2","atob","btoa","Set","Map","Error"]);

// Ein kleiner Abtaster: Zustand fuer Zustand durch die Datei. Mit einzelnen
// Regeln ging es schief - ein /"/g riss den Zeichenketten-Filter auf, und
// Blockkommentare mit Klammern sahen aus wie Funktionsaufrufe.
function nurCode(q) {
  let raus = "", i = 0, letzter = "";
  const leer = (n) => { for (let k = 0; k < n; k++) raus += " "; };
  while (i < q.length) {
    const c = q[i], d = q[i + 1];
    if (c === "/" && d === "/") { const e = q.indexOf("\n", i); const bis = e < 0 ? q.length : e; leer(bis - i); i = bis; continue; }
    if (c === "/" && d === "*") { const e = q.indexOf("*/", i + 2); const bis = e < 0 ? q.length : e + 2;
      for (let k = i; k < bis; k++) raus += q[k] === "\n" ? "\n" : " "; i = bis; continue; }
    if (c === '"' || c === "'" || c === "`") {
      let k = i + 1;
      while (k < q.length && q[k] !== c) { if (q[k] === "\\") k++; k++; }
      leer(k - i + 1); i = k + 1; letzter = "x"; continue;
    }
    // Regex oder Division? Nach Name, Zahl, ) ] } ist es eine Division.
    if (c === "/" && !/[\w$)\]}]/.test(letzter)) {
      let k = i + 1, klasse = false;
      while (k < q.length && (klasse || q[k] !== "/")) {
        if (q[k] === "\\") k++;
        else if (q[k] === "[") klasse = true;
        else if (q[k] === "]") klasse = false;
        else if (q[k] === "\n") break;
        k++;
      }
      if (q[k] === "/") { while (k + 1 < q.length && /[gimsuy]/.test(q[k + 1])) k++; leer(k - i + 1); i = k + 1; letzter = "x"; continue; }
    }
    raus += c;
    if (!/\s/.test(c)) letzter = c;
    i++;
  }
  return raus;
}

let fehlerGesamt = 0;
for (const datei of process.argv.slice(2)) {
  const h = fs.readFileSync(datei, "utf8");
  // Inline-Skript und ausgelagerte Dateien zusammen betrachten: seit Helenas
  // Trainer in trainer.js liegt, steht der Code nicht mehr in der Seite. Wer
  // nur inline prueft, prueft ab da nichts mehr - und merkt es nicht.
  let js = "";
  for (const m of h.matchAll(/<script>([\s\S]*?)<\/script>/g)) js += m[1] + "\n";
  for (const m of h.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)) {
    const pfad = m[1].startsWith("/") ? m[1].slice(1) : path.join(path.dirname(datei), m[1]);
    if (!fs.existsSync(pfad)) { console.log(`${datei}: ${m[1]} gibt es nicht`); fehlerGesamt++; continue; }
    js += fs.readFileSync(pfad, "utf8") + "\n";
  }
  if (!js.trim()) { console.log(`${datei}: kein Skript gefunden`); continue; }
  const fehler = [];

  try { new Function(js); } catch (e) { fehler.push("Syntaxfehler: " + e.message); }

  const definiert = new Set([...js.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]));
  // auch "const iso = d => ..." und "var f = function(){}"
  [...js.matchAll(/(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:function|\(|[A-Za-z_$][\w$]*\s*=>)/g)].forEach(m => definiert.add(m[1]));
  // Auch Parameter zaehlen als definiert - sonst gilt jede Rueckruffunktion,
  // die als Argument hereinkommt, faelschlich als fehlend.
  for (const m of js.matchAll(/function\s*[A-Za-z_$\w]*\s*\(([^)]*)\)/g))
    m[1].split(",").map(x => x.trim()).filter(Boolean).forEach(x => definiert.add(x));

  // Aufrufe nur ausserhalb von Zeichenketten suchen: sonst meldet jedes
  // "rgba(" und "scale(" aus eingebettetem CSS einen Fehler.
  // Nur den echten Code betrachten. Kommentare, Zeichenketten und
  // Regex-Literale werden durch Leerzeichen ersetzt - sonst meldet jedes
  // "rgba(" aus eingebettetem CSS und jedes "(Foto)" aus einem Kommentar
  // einen Fehler, und die echten Treffer gehen im Rauschen unter.
  const ohneText = nurCode(js);
  const ohneRegex = ohneText;
  const aufgerufen = new Set([...ohneText.matchAll(/(?<![.\w$])([a-zA-Z_$][\w$]*)\s*\(/g)].map(m => m[1]));
  for (const name of aufgerufen) {
    if (!definiert.has(name) && !EINGEBAUT.has(name) && !/^[A-Z]/.test(name)) {
      // Nur melden, wenn es wie ein echter Aufruf aussieht (nicht in Kommentar/String)
      const zeile = ohneText.split("\n").find(z => new RegExp("(?<![.\\w$])" + name + "\\s*\\(").test(z) && !z.trim().startsWith("//"));
      if (zeile) fehler.push(`ruft "${name}()" auf, aber nirgends definiert`);
    }
  }

  // IDs aus der Seite UND aus den Vorlagen im Skript: vieles entsteht erst
  // zur Laufzeit per innerHTML und steht darum nirgends im HTML.
  const imHtml = new Set([...h.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  for (const m of js.matchAll(/id=\\?["']([\w-]+)\\?["']/g)) imHtml.add(m[1]);
  // $("#name") - die Raute gehoert zum Selektor, nicht zur ID.
  for (const m of js.matchAll(/\$\("#([\w-]+)"\)/g)) {
    if (!imHtml.has(m[1])) fehler.push(`greift auf #${m[1]} zu, aber kein solches Element im HTML`);
  }

  const einmalig = [...new Set(fehler)];
  fehlerGesamt += einmalig.length;
  console.log(`${datei}: ${einmalig.length ? "\n  - " + einmalig.join("\n  - ") : "in Ordnung"}`);
}
process.exit(fehlerGesamt ? 1 : 0);
