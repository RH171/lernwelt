// Prüft eine Spielseite auf die Fehler, die beim Umbauen entstehen:
// aufgerufene, aber nirgends definierte Funktionen; Skript-IDs ohne
// HTML-Element; kaputte Syntax. Aufruf: node pruefe-seite.js <datei...>
const fs = require("fs");

const EINGEBAUT = new Set(["if","for","while","switch","catch","return","typeof","new","function",
  "parseInt","parseFloat","Number","String","Array","Object","Math","Date","JSON","fetch","setTimeout",
  "setInterval","clearInterval","clearTimeout","encodeURIComponent","decodeURIComponent","isNaN",
  "Promise","RegExp","requestAnimationFrame","FileReader","Image","Blob","URL","SpeechSynthesisUtterance",
  "confirm","alert","escape2","atob","btoa","Set","Map","Error"]);

let fehlerGesamt = 0;
for (const datei of process.argv.slice(2)) {
  const h = fs.readFileSync(datei, "utf8");
  const treffer = h.match(/<script>\n\(function\(\)\{[\s\S]*?\n<\/script>/);
  if (!treffer) { console.log(`${datei}: kein Skriptblock gefunden`); continue; }
  const js = treffer[0].replace(/<\/?script>/g, "");
  const fehler = [];

  try { new Function(js); } catch (e) { fehler.push("Syntaxfehler: " + e.message); }

  const definiert = new Set([...js.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]));
  [...js.matchAll(/(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\()/g)].forEach(m => definiert.add(m[1]));
  const aufgerufen = new Set([...js.matchAll(/(?<![.\w$])([a-zA-Z_$][\w$]*)\s*\(/g)].map(m => m[1]));
  for (const name of aufgerufen) {
    if (!definiert.has(name) && !EINGEBAUT.has(name) && !/^[A-Z]/.test(name)) {
      // Nur melden, wenn es wie ein echter Aufruf aussieht (nicht in Kommentar/String)
      const zeile = js.split("\n").find(z => new RegExp("(?<![.\\w$])" + name + "\\s*\\(").test(z) && !z.trim().startsWith("//"));
      if (zeile) fehler.push(`ruft "${name}()" auf, aber nirgends definiert`);
    }
  }

  const imHtml = new Set([...h.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  for (const m of js.matchAll(/\$\("([^"]+)"\)/g)) {
    if (!imHtml.has(m[1])) fehler.push(`greift auf #${m[1]} zu, aber kein solches Element im HTML`);
  }

  const einmalig = [...new Set(fehler)];
  fehlerGesamt += einmalig.length;
  console.log(`${datei}: ${einmalig.length ? "\n  - " + einmalig.join("\n  - ") : "in Ordnung"}`);
}
process.exit(fehlerGesamt ? 1 : 0);
