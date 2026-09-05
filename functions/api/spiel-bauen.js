// Foto oder Datei rein -> Lernspiel raus.
//
// POST /api/spiel-bauen
//   { kind: "paul", seiten: [{ media_type, data }, ...], wunsch?: "..." }
//
// Der Schlüssel liegt als Cloudflare-Secret ANTHROPIC_API_KEY und taucht
// weder im Code noch in einer Antwort auf.
//
// Zurück kommen SPIELDATEN, kein fertiges HTML: Inhalt und Darstellung sind
// getrennt. Dieselben Daten kann eine feste Bauform füllen oder ein frei
// erfundenes Spiel - das entscheidet die Werkstatt, nicht der Server.

import { ausweisGueltig, geheimFuer } from "./_riegel.js";
import { spielSichern } from "./spiele.js";

const MODELL = "claude-opus-5";

// Welches Kind lernt nach welchem Lehrplan.
const KINDER = {
  paul:   { datei: "grundschule-3-4.json", stufe: "4. Klasse Grundschule", alter: 9 },
  leon:   { datei: "grundschule-1-2.json", stufe: "2. Klasse Grundschule", alter: 7,
            interessen: "Fußball, und zwar die SpVgg Greuther Fürth - das Kleeblatt, zu Hause im Ronhof. Leon lebt in Fürth und kennt sich damit richtig gut aus." },
  helena: { datei: "gymnasium-7.json",     stufe: "7. Klasse Gymnasium",   alter: 12 },
};

// Grenzen der Claude-API: 32 MB und 600 Seiten pro Anfrage.
const MAX_BYTES = 24 * 1024 * 1024;   // Sicherheitsabstand zu den 32 MB
const MAX_SEITEN = 20;                // Werkstatt-Grenze; Bücher kommen später

// Die Bauformen, die die Werkstatt darstellen kann.
const SPIELARTEN = ["quiz", "zuordnen", "luecken", "karteikarten", "sammeln"];


export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.PAUL_CODE) {
    return fehler(500, "Auf dem Server fehlt der Zugangscode. Denny muss ihn bei Cloudflare als PAUL_CODE hinterlegen.");
  }
  if (!env.ANTHROPIC_API_KEY) {
    return fehler(500, "Der Schlüssel fehlt auf dem Server. Denny muss ihn bei Cloudflare als ANTHROPIC_API_KEY hinterlegen.");
  }

  let auftrag;
  try {
    auftrag = await request.json();
  } catch (e) {
    return fehler(400, "Die Anfrage war kein gültiges JSON.");
  }

  const kind = KINDER[auftrag.kind] ? auftrag.kind : "paul";

  // Erst jetzt pruefen: jedes Kind hat sein eigenes Geheimnis. Bis Denny fuer
  // ein Kind einen eigenen Code hinterlegt, gilt PAUL_CODE (siehe _riegel.js).
  if (!(await ausweisGueltig(request, geheimFuer(env, kind), env))) {
    return fehler(401, "Hier darfst du nur mit deinem Code bauen. Bitte melde dich an.");
  }
  const seiten = Array.isArray(auftrag.seiten) ? auftrag.seiten : [];

  const wunsch = String(auftrag.wunsch || "").trim().slice(0, 600);
  const quelle = String(auftrag.quelle || "").trim().slice(0, 40);
  if (seiten.length === 0 && !wunsch) {
    return fehler(400, "Schreib mir, was du dir wünschst – oder schick ein Foto mit.");
  }
  if (seiten.length > MAX_SEITEN) return fehler(400, `Das sind ${seiten.length} Seiten. Mehr als ${MAX_SEITEN} auf einmal kann die Werkstatt noch nicht.`);

  let bytes = 0;
  for (const s of seiten) {
    if (!s || typeof s.data !== "string" || typeof s.media_type !== "string") {
      return fehler(400, "Eine der Seiten war unvollständig.");
    }
    bytes += Math.floor(s.data.length * 0.75); // base64 -> echte Bytes
  }
  if (bytes > MAX_BYTES) {
    return fehler(400, `Zusammen ${(bytes / 1048576).toFixed(1)} MB - das ist zu viel für einen Rutsch. Bitte weniger oder kleinere Seiten.`);
  }

  // Lehrplan des Kindes holen (liegt als statische Datei neben der Seite).
  let lehrplan;
  try {
    const url = new URL("/lehrplan/" + KINDER[kind].datei, request.url);
    const r = await fetch(url.toString());
    if (!r.ok) throw new Error("HTTP " + r.status);
    lehrplan = await r.json();
  } catch (e) {
    return fehler(500, "Der Lehrplan konnte nicht geladen werden.");
  }

  const inhalt = [];
  for (const s of seiten) {
    inhalt.push(
      s.media_type === "application/pdf"
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: s.data } }
        : { type: "image",    source: { type: "base64", media_type: s.media_type,      data: s.data } }
    );
  }
  if (seiten.length && wunsch) {
    inhalt.push({ type: "text", text: `Das ist mein Schulstoff. Dazu mein Wunsch: ${wunsch}` });
  } else if (seiten.length) {
    inhalt.push({ type: "text", text: "Das ist mein Schulstoff. Bau mir ein Spiel daraus." });
  } else {
    inhalt.push({ type: "text", text: `Ich habe kein Bild dabei. Bau mir ein Spiel nach diesem Wunsch: ${wunsch}` });
  }

  const antwort = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODELL,
      // 20000 statt 16000: Seit die Aufgaben ein Bild-Feld tragen, sind die
      // Antworten laenger. Ein abgeschnittenes Ergebnis kommt als leeres
      // Spiel zurueck - einmal beobachtet am 06.09.2026.
      max_tokens: 20000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: [{ type: "text", text: systemtext(kind, lehrplan), cache_control: { type: "ephemeral" } }],
      tools: [WERKZEUG],
      tool_choice: { type: "tool", name: "spiel_bauen" },
      messages: [{ role: "user", content: inhalt }],
    }),
  });

  if (!antwort.ok) {
    const text = await antwort.text().catch(() => "");
    // Nie den Schlüssel oder rohe API-Fehler nach außen geben.
    if (antwort.status === 401 || antwort.status === 403) return fehler(500, "Der Server darf gerade nicht bei Claude anfragen. Denny muss den Schlüssel prüfen.");
    if (antwort.status === 429) return fehler(503, "Gerade ist zu viel los. Bitte in einer Minute nochmal.");
    if (text.includes("credit") || text.includes("billing")) return fehler(503, "Das Guthaben ist aufgebraucht oder das Monatslimit erreicht. Denny muss nachsehen.");
    return fehler(502, "Claude hat nicht geantwortet. Bitte nochmal versuchen.");
  }

  const daten = await antwort.json();
  const block = (daten.content || []).find((b) => b.type === "tool_use");
  if (!block || !block.input) return fehler(502, "Es kam kein brauchbares Spiel zurück. Bitte nochmal versuchen.");

  const spiel = block.input;

  // Bevor irgendetwas gespeichert oder ausgeliefert wird: Taugt das Spiel?
  // Am 06.09.2026 kam ein Spiel mit einer einzigen Aufgabe zurueck - fuer ein
  // Kind ist das kein Spiel. Lieber ein ehrlicher Fehler als Murks im Regal.
  const maengel = pruefeSpiel(spiel);
  if (maengel.length) {
    return fehler(502, "Das Spiel kam unvollständig zurück (" + maengel[0] + "). Bitte nochmal versuchen.");
  }

  spiel.erzeugt = new Date().toISOString();
  spiel.kind = kind;

  // Aufheben, damit Paul es wiederfindet und daraus weitere Spiele ableiten kann.
  // Ein Fehler beim Speichern darf das fertige Spiel nicht kosten.
  try {
    if (env.PAUL_KV) spiel.id = await spielSichern(env, spiel, seiten, kind, quelle);
  } catch (e) {
    spiel.nichtGespeichert = true;
  }

  return new Response(JSON.stringify({ ok: true, spiel, verbrauch: daten.usage || null }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

// Was ein Spiel mindestens erfuellen muss, damit es ein Kind vorgesetzt bekommt.
const MIN_AUFGABEN = 5;

function pruefeSpiel(spiel) {
  const m = [];
  const auf = (spiel && spiel.aufgaben) || [];
  if (auf.length < MIN_AUFGABEN) {
    m.push(`nur ${auf.length} statt mindestens ${MIN_AUFGABEN} Aufgaben`);
  }
  auf.forEach((a, i) => {
    const nr = i + 1;
    if (!a.frage || !String(a.frage).trim()) m.push(`Aufgabe ${nr} ohne Frage`);
    if (a.richtig === undefined || a.richtig === null || String(a.richtig).trim() === "")
      m.push(`Aufgabe ${nr} ohne Lösung`);
    if ((a.art || "wahl") === "wahl") {
      const antw = a.antworten || [];
      if (antw.length < 2) m.push(`Aufgabe ${nr} hat zu wenige Antworten`);
      else if (antw.indexOf(a.richtig) < 0) m.push(`bei Aufgabe ${nr} fehlt die richtige Antwort in der Auswahl`);
    }
    if ((a.art || "") === "teilschritte" && !(a.teilschritte || []).length)
      m.push(`Aufgabe ${nr} ist eine Schrittkette ohne Schritte`);
  });
  return m;
}

function fehler(status, text) {
  return new Response(JSON.stringify({ ok: false, fehler: text }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function systemtext(kind, lehrplan) {
  const k = KINDER[kind];
  const faecher = lehrplan.faecher.map((f) => {
    const pfad = (f.lernpfad || f.lernpfad_annahme || []).map((t) => `${t.nr}. ${t.thema}`).join(" -> ");
    const lb = f.lernbereiche.map((l) => `${l.id} ${l.titel}`).join("; ");
    return `FACH ${f.name} (${f.kuerzel})\n  Lernbereiche: ${lb}\n  Übliche Reihenfolge: ${pfad}`;
  }).join("\n\n");

  return `Du baust Lernspiele für ein Kind. Du bekommst ein Foto oder eine Datei aus dem Schulalltag und machst daraus ein Spiel.

DAS KIND
${kind.charAt(0).toUpperCase() + kind.slice(1)}, ${k.alter} Jahre, ${k.stufe}, Bayern.${k.interessen ? "\nWoran sein Herz hängt: " + k.interessen : ""}

DER LEHRPLAN (LehrplanPLUS Bayern)
${faecher}

DEINE REGELN
0. OHNE BILD. Kommt kein Foto, sondern nur ein Wunsch in Worten, dann ist der Wunsch die ganze Vorlage. Erkenne daraus Fach und Thema und suche den passenden Lernbereich im Lehrplan. Ist das Thema unklar oder zu weit ("mach was mit Mathe"), wähle das, was laut übliches Reihenfolge gerade dran wäre, und sag es im Begrüßungssatz: "Ich hab mal was zum schriftlichen Malnehmen gebaut - das übt ihr gerade." Wünscht sich das Kind eine Welt oder ein Thema (Fußball, Weltraum, Minecraft-artige Klötzchen), nimm genau das als Einkleidung - der Lernstoff bleibt trotzdem der aus dem Lehrplan.

1. ORDNE EIN. Erkenne, um welches Fach und welchen Lernbereich es geht. Passt nichts, setze lernbereich auf "unbekannt" - rate nicht.
2. SCHREIBE NICHTS AB. Das Bild sagt dir, WORUM es geht, nicht WAS gefragt wird. Erfinde eigene Aufgaben zum selben Thema und Niveau. Übernimm niemals die Aufgaben vom Blatt - weder Zahlen noch Formulierungen.
3. VORGRIFF NUR STREIFEN. Schau in der üblichen Reihenfolge, was nach dem erkannten Thema kommt, und lass es beiläufig auftauchen - als Name, Bild, Sammelobjekt oder Nebensatz. NIEMALS als Aufgabe, die gelöst werden muss. Das Kind soll es später wiedererkennen, nicht daran scheitern.
4. PASSENDE HÜRDE. Lösbar, aber nicht geschenkt. Bei Fehlern hilft die Erklärung weiter, statt nur "falsch" zu sagen.
5. WECHSLE DIE AUFGABENART. Nicht zwölfmal dasselbe. Jede Aufgabe hat ein Feld "art":
   - "wahl": vier Antworten zum Antippen. Gut für Verstehensfragen, Fehlersuche, Begriffe. Fülle "antworten" und "richtig", "teilschritte" bleibt leer.
   - "eingabe": das Kind tippt die Zahl selbst. Kein Raten möglich. Fülle nur "richtig", "antworten" und "teilschritte" bleiben leer.
   - "teilschritte": eine Kette kleiner Fragen, die zusammen den Rechenweg gehen. Fülle "teilschritte", "antworten" bleibt leer, "richtig" ist das Endergebnis.
   Mische etwa so: die Hälfte "wahl", ein Drittel "eingabe", der Rest "teilschritte". Beginne mit einer leichten "wahl"-Aufgabe zum Aufwärmen.

   WANN "teilschritte" - und wann NICHT:
   Zerlege nur, wenn die Aufgabe für das Kind ZU GROSS ist, um sie am Stück zu rechnen. Bei 217 · 8 ja. Bei 9 · 8 NEIN - das gehört zum kleinen Einmaleins und ist auswendig da; ein Umweg macht es dann schwerer statt leichter. Faustregel Jahrgangsstufe 4: alles innerhalb des kleinen Einmaleins (bis 10 · 10) wird NICHT zerlegt.

   ZU "teilschritte" - das ist das Wichtigste für Kinder, die eine große Rechnung noch nicht am Stück können:
   Zerlege so, dass JEDER Teilschritt in dem liegt, was das Kind schon sicher kann. Beispiel für 217 · 8 in Jahrgangsstufe 4, wo oft nur das kleine Einmaleins sitzt:
     Schritt 1: "Wie viel ist 8 · 7?"        -> 56
     Schritt 2: "Und 8 · 10?"                 -> 80
     Schritt 3: "Und 8 · 200?"                -> 1600
     Schritt 4: "Zähl alles zusammen: 1600 + 80 + 56" -> 1736
   So rechnet das Kind wirklich selbst, ohne an einer zu großen Zahl zu scheitern.
   Zwei bis fünf Teilschritte. Jeder Schritt eine kurze Frage und eine Zahl als Antwort.

   WECHSLE AUCH DEN WEG. Zum selben Ergebnis führen mehrere Wege, und das Kind soll merken, dass es wählen darf - genau das meint der Lehrplan mit "Rechenstrategien nutzen und erklären". Nimm nicht immer dieselbe Zerlegung:
     - nach Stellenwerten:   8 · 217 = 8·200 + 8·10 + 8·7
     - über eine glatte Zahl: 8 · 197 = 8·200 minus 8·3
     - halbieren und verdoppeln: 16 · 50 = 8 · 100
     - Nachbaraufgabe:       8 · 7 = 8·8 minus 8
     - Tauschen:             4 · 25 ist leichter als 25 · 4 zu denken
   SAG DEN WEG VORHER AN. Das Feld "weg" steht über den Teilschritten und erklärt in EINEM Satz, was jetzt kommt. Ohne das steht plötzlich "Wie viel ist 10 · 8?" da, obwohl die Aufgabe 9 · 8 lautet - das verwirrt ein Kind, statt ihm zu helfen.
     Gut:    "Wir gehen über die 10er-Aufgabe, die ist leichter - und ziehen danach wieder ab."
     Gut:    "Wir zerlegen 217 in 200, 10 und 7 und rechnen die Stücke einzeln."
     Falsch: gar nichts sagen und einfach mit einer fremd wirkenden Zahl anfangen.

6. SAG, WAS SCHIEFGELAUFEN IST. Falsche Antworten sind keine Zufallszahlen, sondern typische Denkfehler - und jeder verrät, wo es hakt. Fülle deshalb "diagnosen": zu jeder falschen Antwort EIN Satz, der benennt, was das Kind vermutlich gedacht hat.
   Beispiel für 134 · 6 = 804:
     704 -> "Du hast den Uebertrag vergessen: 6 · 3 = 18, plus die 2 aus dem Uebertrag sind 20."
     824 -> "Den Uebertrag nur einmal dazuzählen - hier ist er doppelt drin."
      84 -> "Da fehlt eine Stelle: die Hunderter sind unter den Tisch gefallen."
   Regeln dafür:
   - Sprich das Kind an ("Du hast..."), nie über es. Nie tadeln, nie "leider".
   - Benenne den Fehler, gib nicht die Lösung - die kommt sowieso in der Erklaerung.
   - Bei art=wahl: für JEDE falsche Antwort eine Diagnose.
   - Bei art=eingabe: die zwei bis drei WAHRSCHEINLICHSTEN Fehleingaben vorhersagen und diagnostizieren.
   - Bei art=teilschritte: leer lassen, dort hilft schon der einzelne Schritt.

7. DIE ERKLÄRUNG WIRD GEGLIEDERT, NICHT AM STÜCK GESCHRIEBEN. Ein Kind, das sich schwertut, steigt bei einer Textwurst aus. Deshalb:
   - Schreibe den Rechenweg in EINZELNE SCHRITTE, jeder in einer eigenen Zeile, getrennt durch \n. Ein Schritt pro Zeile, kurz.
   - Richtig ist zum Beispiel:
     6 · 4 = 24  →  4 hin, 2 im Übertrag\n6 · 3 = 18 + 2 = 20  →  0 hin, 2 im Übertrag\n6 · 1 = 6 + 2 = 8\nErgebnis: 804
   - FALSCH wäre, dasselbe als einen langen Satz mit Kommas zu schreiben.
   - Bei Aufgaben ohne Rechenweg (Sprache, Sachfragen) gliedere trotzdem: erst die Antwort, dann in neuer Zeile die Begründung.
   - Höchstens fünf Zeilen. Keine Aufzählungszeichen, keine Nummerierung - die Zeile allein reicht.

8. DIE MERKHILFE KOMMT INS EIGENE FELD "merke". Sie steht NICHT in der Erklärung. Nimm, WO ES PASST, genau eines von beidem:
   - ein RECHENTRICK für den Fall, dass das Auswendige gerade weg ist: "8 · 7 vergessen? 8 · 8 = 64, davon eine 8 weg macht 56." Auch: mal 9 ist mal 10 minus die Zahl selbst; mal 5 ist die Hälfte von mal 10; mal 2 ist verdoppeln.
   - das SIGNALWORT der Aufgabe, wenn eines drinsteckt: "Das Wort 'je' ist dein Signal: hier wird malgenommen." Ebenso "pro" und "jeder" fürs Malnehmen, "insgesamt" und "zusammen" fürs Zusammenzählen, "übrig" und "Rest" fürs Abziehen oder Teilen. In anderen Fächern die Merkfrage: "Wer oder was?" fragt nach dem Subjekt.
   Das Signalwort ist mehr wert als der Trick, weil es bei JEDER solchen Aufgabe hilft. Passt weder das eine noch das andere, lass "merke" leer - lieber nichts als eine Floskel.
   EIN Satz, höchstens zwei. Nie beides zugleich.

9. RICHTIGES DEUTSCH - das ist wichtig. Schreibe durchgängig korrekte deutsche Rechtschreibung mit echten Umlauten (ä, ö, ü, Ä, Ö, Ü) und ß. Schreibe NIEMALS Ersatzformen wie ae, oe, ue oder ss statt ß. Also "Übertrag", nicht "Uebertrag". "Aufwärmen", nicht "Aufwärmen". "Äpfel", nicht "Aepfel". Das Kind lernt lesen - es darf nie falsch geschriebene Wörter sehen. Das gilt auch dann, wenn auf dem Foto selbst Ersatzformen stehen.
10. SPRACHE. ${k.alter <= 8 ? "Sehr einfach, kurze Sätze, alles muss vorlesbar sein - das Kind liest noch nicht sicher." : k.alter >= 12 ? "Jugendlich und sachlich. Keine Kindersprache, kein Grundschul-Ton." : "Einfach und klar, wie man mit einem Viertklässler spricht. Freundlich, nie belehrend."}
11. LOBE DIE ANSTRENGUNG, nicht die Begabung. Konkret statt Floskel.
12. RECHNE NACH. Jedes Ergebnis muss stimmen, und die richtige Antwort muss in der Auswahl stehen. Prüfe jede Aufgabe, bevor du sie abgibst.

DIE WELT
Wähle eine Einkleidung, die zum Thema passt und Spaß macht - Weltraum, Fußball, Klötzchen-Welt, Tiefsee, Werkstatt, Detektiv, was passt. Eigene Figuren und Ideen, niemals geschützte Spielfiguren oder Markenwelten.

14. ZEIG ES, STATT ES ZU BESCHREIBEN. Im Feld "bild" kannst du ein Bild anfordern. Du zeichnest es nicht selbst - du sagst nur, was zu sehen sein soll; gezeichnet wird es sauber im Browser. Nutze es überall dort, wo ein Kind sonst etwas im Kopf zusammenbauen müsste:
    - "uhr:3:30" bei JEDER Uhrzeit-Aufgabe. Die Zeiger stehen dann genau so, wie es die Aufgabe sagt. Schreib dann NICHT mehr "der große Zeiger steht auf der 12" - man sieht es ja. Frag stattdessen schlicht "Wie spät ist es?".
    - "strichliste:12" bei Strichlisten, statt die Striche im Text aufzuzählen.
    - "menge:7:ball" wenn etwas abgezählt werden soll (ball, tor, spieler, stern, apfel, punkt, muenze, schuh).
    - "form:dreieck" bei Formen. Frag "Wie heißt diese Form?", statt sie zu beschreiben.
    - "zahlenstrahl:0:100:47" beim Einordnen von Zahlen, bei Nachbarzahlen, beim Vergleichen.
    Passt nichts davon, lass "bild" leer (""). Erfinde keine anderen Formate. Und ein Bild ersetzt die Frage nicht: Der Text muss weiterhin sagen, was zu tun ist.

13. NIMM, WAS DAS KIND SCHON VERSTEHT. Steht oben unter DAS KIND ein Steckenpferd, dann kleide einen guten Teil der Aufgaben darin ein. Wer Fußball versteht, versteht auch Tore zählen, Trikotnummern, Spielminuten, Zuschauer auf den Rängen, Punkte in der Tabelle, Eckbälle, Auswechslungen. Das ist kein Zuckerguss, sondern ein Anker: Das Kind rechnet mit Dingen, die es sich sofort vorstellen kann, und muss nicht erst die Geschichte entschlüsseln.
    ABER ERFINDE KEINE TATSACHEN über echte Vereine oder echte Menschen. Keine erfundenen Spielernamen, die wie echte klingen, keine erfundenen Ergebnisse, Tabellenplätze, Rekorde oder Vereinsgeschichten. Ausgedachte Figuren sind genau richtig ("Torwart Tom", "die Nummer 7 von Leons Mannschaft"). Der Verein selbst, sein Spitzname, sein Stadion und die Heimatstadt dürfen als Kulisse vorkommen - mehr nicht.
    Und nicht jedes Spiel muss dasselbe Thema haben. Abwechslung hält es frisch: mal das Stadion, mal die Tiefsee, mal die Werkstatt.

Gib genau ein Spiel über das Werkzeug zurück.`;
}

const WERKZEUG = {
  name: "spiel_bauen",
  description: "Liefert das fertige Lernspiel als Daten.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      titel: { type: "string", description: "Kurzer Spieltitel, kindgerecht - mit korrekten Umlauten." },
      fach: { type: "string", description: "Kürzel des Fachs, z. B. mathe, deutsch, hsu, englisch." },
      lernbereich: { type: "string", description: "ID des Lernbereichs aus dem Lehrplan, oder 'unbekannt'." },
      thema: { type: "string", description: "Das erkannte Thema in wenigen Worten." },
      naechstes_thema: { type: "string", description: "Was laut Reihenfolge als Nächstes kommt, oder leer." },
      welt: { type: "string", description: "Die gewählte Einkleidung, z. B. weltraum, fussball, tiefsee." },
      spielart: { type: "string", enum: SPIELARTEN, description: "Welche Bauform passt." },
      begruessung: { type: "string", description: "Ein Satz zum Start, der Lust macht." },
      aufgaben: {
        type: "array",
        description: "8 bis 12 Aufgaben, selbst erfunden, nie vom Blatt abgeschrieben. In der ART ABWECHSELN (siehe Regel 5). Durchgängig korrektes Deutsch mit Umlauten.",
        items: {
          type: "object",
          properties: {
            art: { type: "string", enum: ["wahl", "eingabe", "teilschritte"], description: "Welche Aufgabenart - siehe Regel 5. Abwechseln!" },
            frage: { type: "string" },
            antworten: { type: "array", items: { type: "string" }, description: "NUR bei art=wahl: die vier Auswahlmöglichkeiten, die richtige MUSS dabei sein. Sonst leeres Array." },
            diagnosen: {
              type: "array",
              description: "Zu jeder falschen Antwort ein Satz, was das Kind vermutlich gedacht hat (siehe Regel 6). Bei art=teilschritte leeres Array.",
              items: {
                type: "object",
                properties: {
                  antwort: { type: "string", description: "Die falsche Antwort, um die es geht." },
                  hinweis: { type: "string", description: "Ein Satz: was ist hier passiert? Das Kind ansprechen, nicht tadeln." },
                },
                required: ["antwort", "hinweis"],
                additionalProperties: false,
              },
            },
            weg: { type: "string", description: "NUR bei art=teilschritte: EIN Satz, der vorher ansagt, welchen Rechenweg wir gehen. Sonst leerer String." },
            teilschritte: {
              type: "array",
              description: "NUR bei art=teilschritte: zwei bis fünf kleine Rechenschritte, die zusammen zum Ergebnis führen. Sonst leeres Array.",
              items: {
                type: "object",
                properties: {
                  frage: { type: "string", description: "Kurze Frage, z. B. 'Wie viel ist 8 · 7?'" },
                  richtig: { type: "string", description: "Die Antwort als Zahl." },
                },
                required: ["frage", "richtig"],
                additionalProperties: false,
              },
            },
            richtig: { type: "string", description: "Die richtige Antwort. Bei art=teilschritte das Endergebnis." },
            erklaerung: { type: "string", description: "Der Weg zur Lösung, GEGLIEDERT: ein Schritt pro Zeile, getrennt durch \\n, höchstens fünf Zeilen. Kein Fließtext. Ohne Merkhilfe - die kommt ins Feld merke." },
            merke: { type: "string", description: "EIN Rechentrick ODER EIN Signalwort der Aufgabe (siehe Regel 8). Leer lassen, wenn nichts wirklich passt." },
            bild: { type: "string", description: 'Ein Bild zur Aufgabe, oder "" wenn keins hilft. NUR diese Formen: "uhr:STUNDE:MINUTE" (z. B. uhr:3:30), "strichliste:ANZAHL", "menge:ANZAHL:WAS" (was: ball, tor, spieler, stern, apfel, punkt, muenze, schuh), "form:NAME" (kreis, dreieck, quadrat, rechteck, fuenfeck, sechseck), "zahlenstrahl:VON:BIS:MARKE" (z. B. zahlenstrahl:0:100:47). Nichts anderes - andere Formate werden nicht gezeichnet.' },
          },
          required: ["art", "frage", "antworten", "diagnosen", "weg", "teilschritte", "richtig", "erklaerung", "merke", "bild"],
          additionalProperties: false,
        },
      },
    },
    required: ["titel", "fach", "lernbereich", "thema", "naechstes_thema", "welt", "spielart", "begruessung", "aufgaben"],
    additionalProperties: false,
  },
};
