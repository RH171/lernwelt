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
  [...js.matchAll(/(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\()/g)].forEach(m => definiert.add(m[1]));
  // Auch Parameter zaehlen als definiert - sonst gilt jede Rueckruffunktion,
  // die als Argument hereinkommt, faelschlich als fehlend.
  for (const m of js.matchAll(/function\s*[A-Za-z_$\w]*\s*\(([^)]*)\)/g))
    m[1].split(",").map(x => x.trim()).filter(Boolean).forEach(x => definiert.add(x));

  // Aufrufe nur ausserhalb von Zeichenketten suchen: sonst meldet jedes
  // "rgba(" und "scale(" aus eingebettetem CSS einen Fehler.
  const ohneText = js.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g, '""');
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
