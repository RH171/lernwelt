// Prueft die Sparmassnahme im Riegel: Eine erfolgreiche Anmeldung darf keinen
// Schreibvorgang mehr kosten, solange es gar keinen Fehlversuch zu loeschen gibt.
// Und seit dem 16.09.2026 (Meldung 4rq8ghes95, Paul): wie lange die Anmeldung
// auf dem Geraet liegen bleibt. Das ist der Riegel vor den Bereichen aller drei
// Kinder - wer hier danebengreift, sperrt sie aus oder laesst die Tuer offen.
import { fehlversucheLoeschen, zuVieleFehlversuche, fehlversuchZaehlen,
         ausweisKopfzeile, abmeldeKopfzeile, ausweisBauen, ausweisGueltig, STICHTAG }
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

const mitKeks = (keks) => ({ headers: { get: (n) => n.toLowerCase()==="cookie" ? keks : null } });
const keksAus = (kopfzeile) => kopfzeile.split(";")[0];

console.log("Wie lange die Anmeldung liegen bleibt");
{
  const paul  = ausweisKopfzeile("abc", "paul");
  const leon  = ausweisKopfzeile("abc", "leon");
  const ohne  = ausweisKopfzeile("abc");
  // Pauls Wunsch: beim naechsten Reingehen wieder den Code. Ein Cookie ohne
  // Max-Age wirft der Browser weg, sobald er zugeht.
  pruefe("Paul bekommt ein Sitzungs-Cookie (kein Max-Age)", !/Max-Age/i.test(paul));
  pruefe("Leon behaelt seine 30 Tage", /Max-Age=2592000/.test(leon));
  pruefe("ohne Angabe gilt weiter 30 Tage", /Max-Age=2592000/.test(ohne));
  // Ein Cookie ohne HttpOnly/Secure waere von jedem Skript lesbar.
  for (const [wer, k] of [["Paul", paul], ["Leon", leon]]) {
    pruefe(wer + ": HttpOnly, Secure, SameSite bleiben", /HttpOnly/.test(k) && /Secure/.test(k) && /SameSite=Lax/.test(k));
  }
  pruefe("Abmelden raeumt das Cookie weg", /^lw_werkstatt=;/.test(abmeldeKopfzeile()) && /Max-Age=0/.test(abmeldeKopfzeile()));
}

console.log("Der Ausweis selbst bleibt unveraendert gueltig");
{
  const geheim = "1234";
  const keks = keksAus(ausweisKopfzeile(encodeURIComponent(await ausweisBauen(geheim)), "paul"));
  pruefe("frisch ausgestellt: gueltig", await ausweisGueltig(mitKeks(keks), geheim));
  pruefe("falsches Geheimnis: abgewiesen", !(await ausweisGueltig(mitKeks(keks), "9999")));
  pruefe("kein Cookie: abgewiesen", !(await ausweisGueltig(mitKeks(""), geheim)));
  pruefe("verbogene Unterschrift: abgewiesen",
         !(await ausweisGueltig(mitKeks(keks.slice(0, -2) + "00"), geheim)));

  // Die Falle: Der signierte Stichtag im Ausweis MUSS bei 30 Tagen bleiben.
  // ausweisGueltig rechnet daraus zurueck, wann er ausgestellt wurde. Wer die
  // Gueltigkeit verkuerzt, ohne diese Rechnung anzufassen, sperrt Paul nach
  // einem "Alle abmelden" komplett aus - die Anmeldung wuerde jedes Mal
  // sofort wieder verfallen.
  const kv = kvBauen();
  const env = { PAUL_KV: kv };
  await kv.put(STICHTAG, String(Date.now() - 60000));   // vorhin abgemeldet
  const frisch = keksAus(ausweisKopfzeile(encodeURIComponent(await ausweisBauen(geheim)), "paul"));
  pruefe("nach 'Alle abmelden' kommt Paul mit frischem Ausweis rein",
         await ausweisGueltig(mitKeks(frisch), geheim, env));
  await kv.put(STICHTAG, String(Date.now() + 60000));   // Stichtag liegt danach
  pruefe("ein Ausweis von vor dem Stichtag gilt nicht mehr",
         !(await ausweisGueltig(mitKeks(frisch), geheim, env)));
}

console.log(fehler ? `\n${fehler} Fehler.` : "\nAlles sauber.");
process.exit(fehler ? 1 : 0);
