// Prüft Pauls Spiele: Sind alle Skriptblöcke syntaktisch heil, ist die
// Mitschrift eingebunden, und meldet das Spiel auch Ergebnisse?
const fs = require("fs");
let kaputt = 0;
for (const datei of process.argv.slice(2)) {
  const h = fs.readFileSync(datei, "utf8");
  const name = datei.split("/").pop();
  const bloecke = [...h.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)];
  const fehler = [];
  bloecke.forEach((b, i) => {
    try { new Function(b[1]); } catch (e) { fehler.push(`Block ${i + 1}: ${e.message.slice(0, 60)}`); }
  });
  const eingebunden = h.includes('src="/lernstand.js"');
  const meldet = /lernstand\s*&&\s*window\.lernstand\.antwort|lernstand\.antwort\(/.test(h);
  if (fehler.length) kaputt++;
  console.log(
    (fehler.length ? "✗ " : "✓ ") + name.padEnd(48) +
    (eingebunden ? "Zeit " : "OHNE  ") +
    (meldet ? "+ Ergebnisse" : "(nur Zeit)  ") +
    (fehler.length ? "  " + fehler.join(" | ") : "")
  );
}
process.exit(kaputt ? 1 : 0);
