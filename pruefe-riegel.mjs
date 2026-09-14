// Prueft die Sparmassnahme im Riegel: Eine erfolgreiche Anmeldung darf keinen
// Schreibvorgang mehr kosten, solange es gar keinen Fehlversuch zu loeschen gibt.
import { fehlversucheLoeschen, zuVieleFehlversuche, fehlversuchZaehlen }
  from "./functions/api/_riegel.js";

function kvBauen() {
  const daten = new Map();
  const zaehler = { get: 0, put: 0, delete: 0 };
  return { zaehler, daten,
    async get(k){ zaehler.get++; return daten.has(k) ? daten.get(k) : null; },
    async put(k,v){ zaehler.put++; daten.set(k,String(v)); },
    async delete(k){ zaehler.delete++; daten.delete(k); } };
}
const anfrage = (ip="1.2.3.4") => ({ headers: { get: (n) => n.toLowerCase()==="cf-connecting-ip" ? ip : null } });

let fehler = 0;
const pruefe = (name, bed) => { console.log((bed?"  ok   ":"  FEHL ")+name); if(!bed) fehler++; };

console.log("Anmeldung ohne Fehlversuch");
{
  const kv = kvBauen();
  await fehlversucheLoeschen(anfrage(), { PAUL_KV: kv });
  pruefe("kostet keinen Schreibvorgang", kv.zaehler.delete === 0 && kv.zaehler.put === 0);
  pruefe("hat aber nachgeschaut", kv.zaehler.get === 1);
}

console.log("Anmeldung nach Fehlversuchen");
{
  const kv = kvBauen();
  const env = { PAUL_KV: kv };
  await fehlversuchZaehlen(anfrage(), env);
  await fehlversuchZaehlen(anfrage(), env);
  pruefe("Zaehler steht auf 2", kv.daten.get("fehlversuche:1.2.3.4") === "2");
  await fehlversucheLoeschen(anfrage(), env);
  pruefe("wird wirklich geloescht", kv.zaehler.delete === 1);
  pruefe("Bremse ist geloest", !(await zuVieleFehlversuche(anfrage(), env)));
}

console.log("Bremse greift weiter");
{
  const kv = kvBauen(); const env = { PAUL_KV: kv };
  for (let i=0;i<8;i++) await fehlversuchZaehlen(anfrage("9.9.9.9"), env);
  pruefe("ab 8 Fehlversuchen zu", await zuVieleFehlversuche(anfrage("9.9.9.9"), env));
  pruefe("andere Absender ungestoert", !(await zuVieleFehlversuche(anfrage("1.1.1.1"), env)));
}

console.log("Ohne Speicher stuerzt nichts ab");
{
  await fehlversucheLoeschen(anfrage(), {});
  const kaputt = { async get(){ throw new Error("KV put() limit exceeded for the day."); },
                   async delete(){ throw new Error("nope"); } };
  await fehlversucheLoeschen(anfrage(), { PAUL_KV: kaputt });
  pruefe("kein Absturz", true);
}

console.log(fehler ? `\n${fehler} Fehler.` : "\nAlles sauber.");
process.exit(fehler ? 1 : 0);
