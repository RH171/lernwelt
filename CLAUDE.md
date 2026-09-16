# Arbeitsweise in der Lernwelt

## Fester Schritt vor jedem Ausrollen: gegen die echten Geräte prüfen

Denny am 07.09.2026: *„Baue als festen Aufgabenteil ein, dass du prüfst, mit
welchen Endgeräten die Kinder spielen, und dass sie jedes Mal auf ihrem
Endgerät das Beste sehen, damit die Spielbereitschaft bestehen bleibt."*

Die Kinder spielen nicht auf meinem Bildschirm. Was am Laptop gut aussieht,
kann auf Pauls iPad oder Helenas Handy unbrauchbar sein — und dann hört ein
Kind auf, statt sich zu beschweren.

**Bei jeder Änderung an einer Seite, die ein Kind sieht:**

1. **Geräte nachsehen — nicht raten.** Jede gespielte Runde trägt ihr Gerät mit.

       ./werkstatt.sh geraete

   Taucht ein Gerät auf, das nicht in `../pruefung-geraete.json` steht: eintragen,
   mit Beleg, und ab dann mitprüfen. Die Datei liegt bewusst **ausserhalb** des
   Web-Ordners — sie verbindet Kindernamen mit Gerätemodellen und hätte sonst
   offen im Netz gestanden.

2. **Messen, nicht anschauen.** Das macht ein Aufruf, seit dem 08.09.2026:

       node geraete-messen.js /paul/klasse3-mathe-gewichte-wiegespiel.html paul

   `../geraete-messen.js` fährt jede Größe aus `../pruefung-geraete.json` durch
   und ruft dort `pruefung/layout-messen.js` auf. Es braucht **kein npm-Paket**:
   ein eigener kleiner Webserver, Chrome mit `--headless=new` und dem
   DevTools-Protokoll, gesteuert über das in Node eingebaute `WebSocket`.
   Rückgabe 0 = alles sauber, 2 = es hakt. Das zweite Wort wählt die Geräte
   aus, auf denen dieses Kind wirklich spielt.

   `sauber: true` heißt: kein Tippziel unter dem Mindestmaß, kein Hauptknopf
   unter dem Rand, nichts seitlich raus, keine Schrift unter 12 px.

   **Das Mindestmaß hängt davon ab, womit gezielt wird** (seit 14.09.2026
   abends): **44 px für den Finger, 24 px für die Maus** (WCAG 2.2, 2.5.8).
   Vorher galten überall 44 — und weil `beruehrung.css` ausdrücklich nur bei
   `pointer: coarse` greift, meldete jeder Laptop-Durchlauf lauter Knöpfe, die
   dort völlig in Ordnung sind. Helenas Vokabeltrainer kam so auf 18 „Fehler"
   je Etappe, alle unecht. Wer so eine Liste dreimal liest, liest sie beim
   vierten Mal nicht mehr — und übersieht den echten Befund darin. Bei ihr war
   das eine 16 px hohe Aufklappzeile („＋ Neue Einheit aus Foto"), genau der
   Weg, den sie mit dem Buch in der Hand treffen soll.

   **Der Bericht sagt jetzt auch, WO das Ding sitzt:** `× (button.loeschen)`
   statt nur `×`. Ohne das steht man mit einem Kreuz da und sucht es in drei
   Dateien — am 14.09.2026 zweimal erfolglos versucht. Es war ein 19 px breiter
   Knopf in Pauls Werkstatt, der ein Spiel wegwirft.

   **Den Ruhezustand zu messen reicht nicht.** Eine Schritt-Datei sagt, wohin
   die Messung laufen soll — beim Wiege-Meister bis zu einem Waage-Kunden, zur
   beladenen Waage, ins leere und ins volle Markt-Tagebuch. Eine Etappe mit
   `neu: true` bekommt vorher einen frischen Seitenaufruf; `__saat(name)` legt
   dafür den Speicherstand hin.

   **Jede Seite hat ihre eigene Schritt-Datei**, benannt hinter dem Kind:

       node geraete-messen.js /leon/ leon mess-schritte-leon.js

   Ohne dritte Angabe gilt `../mess-schritte.js` (der Wiege-Meister). Vorher gab
   es nur diese eine Datei, und wer eine andere Seite messen wollte, musste sie
   umschreiben und riss dabei die Schritte der ersten ein.

   Holt eine Seite ihre Inhalte erst vom Server — Leons Seite tut das —, kommt
   man mit Schritten allein nicht ans Ziel: Der Messrechner fährt nur einen
   Dateiserver ohne API hoch. Dafür gibt es `__vorLaden()`. Was dort steht,
   läuft bei **jedem** Seitenaufruf noch **vor** dem Skript der Seite;
   `mess-schritte-leon.js` schiebt darin `fetch` ein Probespiel unter. Gemessen
   wird damit die echte Seite mit echten Aufgaben, nur ohne Netz.

   Wer beim Bauen einen Chrome abwürgt, lässt einen Prozess auf Port 9222
   stehen; der nächste Lauf hängt sich dann stumm an den alten.
   `pkill -f "remote-debugging-port=922"` räumt das auf.

3. **`beruehrung: true` ist bei jedem Touch-Gerät Pflicht.** Der Testbrowser
   meldet bei iPad-Breite kein `pointer: coarse`, die Regeln aus
   `beruehrung.css` greifen dort also nicht — auf dem echten iPad sehr wohl.
   Ohne die Angabe meldet die Messung Fehler, die keine sind. Genau das ist mir
   am 07.09.2026 passiert.

4. **Den schlimmsten Moment mitprüfen**, nicht nur den Ruhezustand: 390×430
   steht für „Handy mit offener Tastatur". Dort lag Helenas „Weiter" vorher
   142 px unter dem Rand — sie hätte nach jedem Wort scrollen müssen.

5. **Ton beim Testen stumm schalten** (`{still:true}`). Automatisch
   durchgespielte Runden haben sonst über Dennys Lautsprecher gedudelt.

## Ausrollen nur, wenn niemand spielt

    ./ausrollen-frei.sh && git -C lernwelt push

Cloudflare Pages rollt jeden Push sofort aus. Wer mitten in einer Aufgabe
steckt, bekäme die Seite unter den Fingern weggetauscht. Der Puls dafür kommt
aus `lernstand.js`; `functions/api/aktiv.js` beantwortet die Frage.

### Im Fenster steht, woran gebaut wurde

Paul am 08.09.2026 über die Frage „Darf ich kurz?": *„da will ich gerne wissen,
was du da überhaupt machst"* — und auf die Rückfrage, ob ein grober Satz reicht:
*„Ich will was genaueres"*.

Deshalb schickt `ausrollen-frei.sh` den Satz mit, wenn es nachfragt. Er kommt
**aus den Commits, die gleich hochgehen**: Auto-Uploads fallen raus, vom Rest
fällt das `Meldung <id> (Kind): ` davor weg. Damit steht im Fenster genau das,
was gebaut wurde — und nichts Ausgedachtes. **Ein schlecht formulierter Commit
ist ab jetzt ein Text, den ein Kind liest.**

Von Hand geht es auch:

    ./werkstatt.sh bauzettel "Ich repariere den Fehler mit den 3250 Gramm"

Den Satz nimmt der Server nur mit Elternausweis an (`werkstatt.sh` holt ihn sich
selbst aus dem Schlüsselbund). Die Frage, *ob* etwas bereitliegt, bleibt weiter
offen beantwortbar — sie verrät nichts. Ohne Ausweis fällt es still auf das alte
„Es liegt eine Verbesserung bereit" zurück; gefragt wird auf jeden Fall.

## Wünsche der Kinder stehen in der Kinder-Tabelle

Sagt ein Kind, wie seine Spiele sein sollen, gehört das nicht in eine Antwort im
Faden, sondern in `functions/api/spiel-bauen.js` unter `KINDER[<kind>].wuensche`
— eine Liste von Sätzen, die als eigener Block **WAS DAS KIND SICH SELBST
GEWÜNSCHT HAT** direkt unter „DAS KIND" in den Auftrag geht. Wo sie greifen,
gehen sie der eigenen Idee des Baumeisters vor.

Getrennt von `interessen`, und das mit Absicht: `interessen` ist eine
Beobachtung *über* das Kind, `wuensche` ist eine Ansage *vom* Kind. Die wiegt
schwerer und darf nicht mit ihr verschwimmen.

Beim Schreiben eines Wunsches gehört dazu:

- **Das Zitat als Kommentar darüber**, mit Datum und Meldungskennung. Sonst weiß
  in vier Wochen niemand mehr, ob das jemand ausgedacht oder ein Kind gesagt hat.
- **Die Grenze mitschreiben.** Leons Torwart-Wunsch (09.09.2026, `c75z9z49k5`)
  hat als letzten Punkt „nur wenn ein Torwart vorkommt" — ohne den hätte jedes
  Spiel im Stadion gespielt und die Abwechslung wäre weg.
- **Auf die Regeln verweisen**, gegen die der Wunsch sonst läuft (Zahlenraum,
  keine erfundenen echten Personen), damit der Baumeister nicht raten muss.

## Themenfelder haben Paul und Leon, und ihre Schlüssel sind fest

Seit dem 05.09.2026 bei Leon, seit dem 14.09.2026 (Meldung `8fcenvfnsh`) auch
bei Paul in `paul/werkstatt.html`: grosse Felder, ein Fingertipp baut ein Spiel
zum Thema. Der `schluessel` des Feldes wandert als `quelle` mit ins gespeicherte
Spiel; daran erkennt das Feld beim nächsten Mal, dass schon etwas bereitliegt,
und startet es sofort statt 90 Sekunden zu bauen.

**Ein einmal vergebener Schlüssel wird nie wieder umbenannt.** Sonst findet das
Feld seine gebauten Spiele nicht mehr und das Kind wartet umsonst. Und erkannt
wird **nur** über `quelle` — bei Leon hat ein Raten über den Thementext einmal
das falsche Spiel geliefert.

Ein Feld vorfüllen oder eines zum Prüfen bauen geht von hier aus, mit dem
Eltern-Code und für echtes Geld (rund 0,07 $):

    ./werkstatt.sh bauen paul m-mal "Mathematik, Lernbereich M3/4 1.2: …"

Gemessen wird Pauls Werkstatt mit `mess-schritte-paul-werkstatt.js` — die Datei
schiebt der Seite über `__vorLaden` eine Anmeldung und drei Spiele unter, sonst
stünde dort nur der Anmeldeschirm.

Ein Wunsch wirkt erst im **nächsten gebauten** Spiel. Fertige Spiele bleiben
liegen, wie sie sind — die Themenfelder spielen sie ohne Warten und ohne Kosten
sofort an. Dem Kind also sagen, wie es ein frisches bekommt („Ein ganz neues
Spiel dazu bauen" am Ende einer Runde), sonst sucht es die Änderung im alten
Spiel und findet sie nicht.

## Die Schmiede gibt es dreimal – der Motor liegt EINMAL in /schmiede/

Seit dem 16.09.2026 (Leon: in seiner Lernwelt fehlte, was Paul hat; Denny:
„auch gleich für Helena") steht der Spielmotor in `schmiede/motor.js`, das
Aussehen in `schmiede/schmiede.css`. `paul/schmiede.html`,
`leon/schmiede.html` und `helena/schmiede.html` enthalten nur noch
`window.SCHMIEDE` (Kind, Texte, Fächer, Themen, Vorauswahl) — die Liste der
Felder steht oben in `motor.js`. **Wer am Motor etwas ändert, ändert es für
alle drei und misst alle drei:**

    node geraete-messen.js /paul/schmiede.html paul mess-schritte-schmiede.js
    node geraete-messen.js /leon/schmiede.html leon mess-schritte-leon-schmiede.js
    node geraete-messen.js /helena/schmiede.html helena mess-schritte-helena-schmiede.js

- **Leon** (7): Themen aus `leon/themen.js` — dieselbe Datei nutzt seine
  Startseite, damit die Schlüssel nie auseinanderlaufen. Jede Aufgabe wird von
  selbst vorgelesen, „Von allein rennen" ist vorgewählt, Figur „Torwart Leon".
- **Helena** (12): eigene Themen `g7-/e7-/f7-/d7-/w7-`, am Rätsel-Tor dürfen
  Wörter die Lösung sein (`textAntworten`). Anmeldung mit **HELENA_CODE**
  (Dennys Entscheidung 16.09.2026) — nur die Schmiede, ihre Trainer bleiben offen.

## Pauls Spiel-Schmiede: derselbe Lernstoff, ein anderer Darsteller

Paul am 14.09.2026 (Meldung `8fcenvfnsh`), nachdem er dreimal richtiggestellt
hat, was er meint: *„Ich rede mit dir gerade die ganze Zeit darüber, dass ich in
der Lernwerkstatt selber ein Spiel bauen kann, ein größeres."* Und auf die
Frage, wie er gefragt werden will: *„Schritt für Schritt, bitte."*

`paul/schmiede.html` fragt ihn fünf Dinge — Welt, Figur, Steuerung, Töne,
Thema — und spielt die Aufgaben dann als Jump-'n'-Run statt als Quiz. Erreichbar
aus `paul/werkstatt.html` (Kachel unter den Themenfeldern) und aus dem Fenster
„Lust auf ein eigenes Spiel?" in `paul/index.html`, das ihn bis dahin an Denny
verwiesen hatte — genau dieses Fenster hatte er fotografiert.

**Es wird kein Programmtext erzeugt und ausgeführt.** Der Motor steht fertig in
der Datei, Paul stellt ihn ein. Das ist der Unterschied zwischen „ein Kind baut
sich ein Spiel" und „eine Seite führt aus, was ihr jemand hinschreibt" — und der
Grund, warum das überhaupt unbeaufsichtigt gebaut werden durfte.

**Der Lernstoff kommt aus demselben Weg wie in der Werkstatt** (`/api/spiel-bauen`),
und **die Themenschlüssel sind dieselben**. Liegt zu einem Thema schon ein Spiel
im Regal, spielt die Schmiede es sofort an: kein Warten, keine Kosten. Wer einen
Schlüssel in einer der beiden Dateien ändert, trennt die zwei Regale
voneinander — siehe den Abschnitt über die Themenfelder.

**Was der Motor kann und was nicht:** Aufgaben mit `art: "wahl"` werden zu
Ballons zum Anspringen. Alles andere (`eingabe`, `teilschritte`) wird zu einem
Rätsel-Tor mit Eingabefeld — anspringen kann man eine Zahl nicht, die man
tippen muss. **3D kann er nicht**, und das steht auch so in Pauls Antwort;
sein eigener Prädikat-Springer 3D bringt Three.js mit, der Motor hier nicht.

**Gemessen wird mit zwei Schritt-Dateien** — und zwar nicht nur der
Ruhezustand, sondern das laufende Spiel mit allen drei Tafeln:

    node geraete-messen.js /paul/schmiede.html paul mess-schritte-schmiede.js
    node geraete-messen.js /paul/schmiede.html paul mess-schritte-schmiede-fliegen.js
    node geraete-messen.js /paul/ paul mess-schritte-paul-hub.js

**Warum zwei:** `mess-schritte-schmiede.js` wählt „Von allein rennen", weil die
Figur dort ohne Tastendrücke bis zu den Tafeln läuft — bequem zu messen. Genau
diese Steuerung ist aber die **einzige ohne die Pfeile ◀ ▶** unten links. Die
Messung hat deshalb nie gesehen, dass „Fliegen" und „Laufen und springen" ohne
sie auf einem Gerät ohne Tastatur unspielbar waren. Die zweite Datei fährt in
„Fliegen" **mit den Pfeilen**, prüft, dass sie da und 44 px groß sind, dass sie
links vom FLIEGEN-Knopf sitzen — und kommt nur ans Ziel, wenn sie wirklich
tragen. **Beim nächsten Spielmotor gilt das wieder:** Wer nur die bequemste
Steuerung misst, misst die Steuerung, die keine Knöpfe braucht.

Zwei Dinge, die dabei gelernt wurden und beim nächsten Spielmotor wieder
gelten:

- **Der Messbrowser schafft nur rund 23 Bilder je Sekunde**, nicht 60. Eine
  Figur, die auf dem echten Gerät in zweieinhalb Sekunden am Ziel ist, braucht
  dort das Dreifache. Wer zu knapp wartet, misst den falschen Zustand — und
  bekommt trotzdem „alles sauber" gemeldet.
- **Deshalb wirft die Schritt-Datei, wenn eine Etappe nicht wirklich erreicht
  wurde.** „Sauber gemessen" heißt sonst nur „das Standbild war in Ordnung",
  nicht „das Spiel läuft". Genau so ist der erste Durchlauf grün gewesen,
  obwohl die Figur am Tor stand und nicht weiterkam.
- **Das Fenster ist auf dem iPad keine feste Größe.** Safaris Leiste fährt
  beim Spielen ein und aus; `window.innerHeight` springt dabei um bis zu 80 px.
  Wer eine Welt einmal in absoluten Bildpunkten hinstellt und den Boden später
  neu berechnet, reißt beides auseinander. Der Figur fällt es nie auf — sie
  wird in jedem Bild neu auf den Boden gesetzt —, allen anderen schon. So
  steckten Pauls Gegner im Boden (Meldung `9ytvhx394e`, 15.09.2026).
  `weltMitnehmen(dy)` in `paul/schmiede.html` nimmt jetzt bei jeder
  Größenänderung alles um dieselbe Strecke mit. **Gemessen wird das nicht von
  `geraete-messen.js`**: Das fährt jede Größe einzeln an und ändert sie nie
  *während* gespielt wird — genau dort lag der Fehler. Wer einen Spielmotor
  baut, ändert beim Prüfen einmal mitten im Spiel die Fenstergröße.

Der Fehler, den diese Prüfung gefunden hat: In der Steuerung „von allein
rennen" hält das Tor die Figur vorne fest, während die Antwort-Ballons hinter
ihr liegen — und umkehren kann sie nicht. Sie pendelt jetzt zwischen erstem
Ballon und Tor, bis die Aufgabe gelöst ist. Am Rätsel-Tor **nicht** pendeln:
dort muss sie anstoßen, sonst geht die Tafel nie auf.

Der Fehler, den sie **nicht** gefunden hat, weil sie ihn nicht messen konnte:
Die Pfeile wurden nur in „Laufen und springen" eingeblendet
(`zeigen($("gruppe-laufen"), wahl.steuerung === "laufen")`). In „Fliegen" gab
es also nur den FLIEGEN-Knopf, und `held.vx` wird dort aus `TASTE.links` und
`TASTE.rechts` gesetzt — ohne Knöpfe nie wahr. Paul stand am linken Rand, die
Antwort-Ballons hingen rechts, er kam nie hin (Meldung `9ytvhx394e`,
16.09.2026, mit Foto). Mit Tastatur fiel es nicht auf: Pfeiltasten und A/D
gehen weiter, unabhängig von den Knöpfen. **Merksatz für den nächsten
Spielmotor:** Am Laptop wird geprüft, ob etwas funktioniert — auf dem iPad, ob
man es überhaupt auslösen kann.

## Eine Grid-Spalte ist so breit wie ihr breitester Inhalt

Paul am 15.09.2026 (Meldung `jjrd622c6f`, mit Foto): *„ich will das es nicht
aus der zeile raus geht sondern das es halt dan zwei zeilen sind"*. Auf dem
Bild standen seine Spiele-Zeilen rechts aus ihrer Liste heraus, dahinter grauer
Hintergrund und unten eine waagrechte Bildlaufleiste.

In `paul/werkstatt.html` stand `.liste{display:grid}` und in den Zeilen
`white-space:nowrap`. **Eine Grid-Spalte ohne `grid-template-columns` ist so
breit wie der breiteste Inhalt** — und bei `nowrap` ist das die volle
Textlänge. Nachgemessen mit Pauls echten 17 Spielen: Liste 706 px breit,
jede Zeile 947 px, also **241 px heraus**.

Derselbe Fehler zeigt sich in **zwei Gestalten**, je nachdem, wie voll das
Regal ist — und beide Male sind es dieselben 241 px:

- **Viele Spiele:** die Spalte wird breiter als ihr Kasten, die Zeilen stehen
  heraus, die Seite lässt sich seitlich schieben. Das hat Paul fotografiert.
- **Wenige Spiele:** die Spalte bleibt im Rahmen, dafür schneidet
  `text-overflow:ellipsis` den Text ab. Nichts steht heraus — es fehlt nur
  Text, und das fällt kaum auf.

Repariert mit `grid-template-columns:minmax(0,1fr)` (deckelt die Spalte auf
die Kastenbreite), `min-width:0` an `.eintrag` und — Pauls eigentlichem
Wunsch — `line-clamp:2` statt `nowrap`: **höchstens zwei Zeilen, dann erst
die Pünktchen.**

**Der Probebestand in `mess-schritte-paul-werkstatt.js` hatte drei kurze
Titel** — damit war jede Messung grün, während es bei Paul seit Tagen
herausstand. Jetzt liegt dort als viertes sein längstes echtes Spiel („Die
Schreibwerkstatt von Meister Kuno", 103 Zeichen Thema), und die Etappe
„Spieleliste" misst drei Dinge nach: nichts steht aus der Liste heraus, nichts
braucht mehr als zwei Zeilen, nichts wird seitlich abgeschnitten. **In beide
Richtungen belegt** — mit dem alten CSS meldet sie „ts wird um 241px
abgeschnitten statt umzubrechen", mit dem neuen ist sie still.

**Die Lehre fürs nächste Mal: Probedaten müssen den Extremfall enthalten.**
Drei kurze Titel messen nur, dass kurze Titel passen. Dasselbe Muster wie bei
den vorgebauten Spielen: eine Prüfung, die den Fehler nicht erreichen kann,
ist keine Prüfung.

## Der Ferien-Reporter schreibt nicht für Paul — auch nicht beim Kürzen

Oben in `paul/klasse3-deutsch-ferien-reporter.html` steht seit dem 15.09.2026:
*„Hier schreibt NIEMAND für Paul. Keine KI, kein Vorschlagstext."* Am selben
Tag kam Meldung `st3sqbq8tc`: *„ich will das du mir denn satz kürzer in 20
wörter umwandelst"*, mit einem Foto seines Schweiz-Textes.

Der naheliegende Knopf — Text an `/api/spiel-bauen` schicken, gekürzte Fassung
zurück — wäre genau das gewesen, was die Zeile verbietet. Und zwar an der
schlechtesten Stelle: **Kürzen ist der Lernstoff**, nicht das Drumherum
(LehrplanPLUS D4 4.4, „Texte überarbeiten"). Ein Knopf, der es abnimmt, nimmt
ihm die Übung und lässt ihm nur das Abschreiben. Das ist dieselbe Regel wie
„der Wert liegt darin, dass er die Spiele **baut**".

Gebaut wurde deshalb ein **Werkzeug**: Der Text wird in Sätze und Wörter
zerlegt, jedes Wort ist ein Knopf zum Wegtippen, ganze Sätze gehen auf einmal,
ein Zähler sagt „noch 28 zu viel", und die Füllwörter (`FUELLWOERTER`) sind
gestrichelt markiert. Das Ziel ist einstellbar (20/50/100, Voreinstellung 20,
gemerkt in `d.kuerzenZiel`). **Was herauskommt, sind ausschließlich Pauls
eigene Wörter in seiner Reihenfolge** — nur weniger davon.

Drei Dinge, an denen so ein Werkzeug sonst heimlich doch zum Schreiber wird,
und wie es hier gelöst ist:

- **Keinen Punkt dazusetzen, den er nicht geschrieben hat.** Nur ein Satzende,
  das an einem weggetippten Wort klebte, wird gerettet.
- **Großschreibung nur zurechtrücken, wenn erst das Wegtippen sie zerstört
  hat** — begann der Satz im Original groß und fängt er jetzt klein an, wird
  der erste Buchstabe groß. Sonst nichts. Seine eigene Schreibweise (er
  schreibt „der tag wo ich…") bleibt, wie sie ist; sie zu korrigieren wäre
  Aufgabe seiner Lehrerin, und für ihn wäre sein Fehler unsichtbar geworden.
- **Rückweg lassen.** Nach dem Übernehmen steht „↩ doch wieder lang" da.

### Ein Punkt ist nicht immer ein Satzende

In Pauls Text stand „**ca. 600.000 bis 700.000 Liter**". Der erste Entwurf
machte daraus **sechs Sätze**, und beim Zusammenbauen stand hinterher
„600. 000" da — sein Text wäre kaputtgegangen, ohne dass er etwas falsch
gemacht hätte. `zerlegen()` sperrt darum Punkte hinter Ziffern, hinter
Einzelbuchstaben (`z. B.`) und hinter einer Liste von Abkürzungen weg, trennt
erst dann und holt sie danach zurück. **Wer am Trennen dreht, prüft mit
`/tmp`-Proben gegen genau diesen Satz.**

### Beim Schreiben steht die Tastatur offen — das ist der Maßstab

`pruefung-geraete.json` hat seit dem 15.09.2026 „**Pauls iPhone mit offener
Tastatur**" (375×360). Der Ferien-Reporter ist seine einzige Seite zum
Schreiben; dort ist das kein Ausnahmefall, sondern der Normalzustand. Beim
ersten Lauf lag „Nächste Frage" **229 px unter dem Rand** — er hätte nach
jedem Feld hochscrollen müssen, und das war schon vorher so, nur ungemessen.

Repariert mit `@media (max-height:520px)`: Der Denk-Hinweis tritt zurück (er
ist wieder da, sobald die Tastatur zugeht), Mikro, Kartenränder und Schreibfeld
werden flacher, und der Filmstreifen steht vierspaltig in **einer** Reihe statt
zweispaltig in zwei — das allein sind rund 100 px, und es sieht dem echten
Arbeitsblatt sogar ähnlicher. **Kein Knopf wurde dabei verschoben oder
festgeklebt**; eine klebende Knopfzeile hätte im offenen Kürzen-Kasten
„So übernehmen" verdeckt.

### Was `geraete-messen.js` hier nicht sieht

Es prüft gegen das **Fenster**. Der Kürzen-Kasten ist aber schmaler als das
Fenster, und seine zwei Knöpfe hingen auf dem iPhone 8 px aus seinem eigenen
Rand heraus — gemeldet hat das niemand. `mess-schritte-ferien.js` misst deshalb
zusätzlich jedes Kind-Element gegen den Kasten. **Wer einen Kasten in einem
Kasten baut, misst ihn gegen den inneren Rand, nicht gegen den Bildschirm.**
Dieselbe Etappe prüft auch fachlich nach (48 Wörter, 3 Sätze, „28 zu viel",
`600.000` heil), nicht nur das Aussehen.

## Vorgebaute Spiele werden gelesen, nicht nur gezählt

`pruefeSpiel` prüft die Form (Anzahl, Lösung in der Auswahl, Zahlentastatur).
Ob eine Aufgabe fachlich stimmt und zum Fach gehört, prüft nur, wer sie liest.
Am 14.09.2026 standen in sieben frisch gebauten Deutsch-/HSU-Spielen für Leon
Rechenaufgaben, ein Grammatikfehler und eine dreifarbige Fußgängerampel.

    ./werkstatt.sh spiele leon                  # Liste
    ./werkstatt.sh spiel-roh leon <id>          # ein Spiel als JSON
    ./werkstatt.sh spiel-ersetzen leon <datei>  # {"id":…,"aufgaben":[…]} zurückschreiben

Nachbessern geht nur mit Eltern-Code; Foto, Herkunft und Spielstatistik bleiben.
Was dabei auffällt, gehört zusätzlich als Regel in den Bauauftrag.

### Der ganze Bestand lässt sich in einem Rutsch nachprüfen

    ./pruefe-bestand.sh            # leon und paul, 0 = sauber, 1 = es hakt

`pruefeSpiel` läuft nur beim **Bauen**. Ein Spiel, das im September gebaut
wurde, kennt die Regel vom Oktober nie — es liegt im Regal und wird nicht
wieder angeschaut. Deshalb ist die Funktion aus `spiel-bauen.js` exportiert,
und `../pruefe-bestand.sh` hält jedes gespeicherte Spiel noch einmal dagegen.
Es liest nur: kein Schreibvorgang, kein Geld.

Am 14.09.2026 abends kamen so vier Spiele heraus, die ein Kind nicht lösen
kann: dreimal eine getippte Lösung, die ein Wort ist (`Ball`, `Tore`, `Pokal`)
— **Leons Eingabefeld zeigt nur Ziffern**, er kommt dort gar nicht weiter —
und einmal ein Deutsch-Spiel über das Prädikat mit vier Rechenaufgaben darin
(`psu4ydv39g`, hieß außerdem „x"). Die Regel dagegen stand seit dem Morgen im
Auftrag (D11) und hat nicht gereicht.

**Daraus die Regel: Eine Bitte im Auftrag ist keine Prüfung.** Dieselbe Lehre
wie bei den Namen (`namenRichten`). Seitdem findet `fachfremd()` in
`spiel-bauen.js` Rechenaufgaben in Deutsch- und HSU-Spielen mechanisch —
über das Merkmal (`zusammenzaehlen`, `verdoppeln`, `mengen zaehlen`, …), über
eine Rechnung in der Frage und über `art: "teilschritte"`, die D1 für
Leseanfänger ohnehin verbietet. **Nicht** über das nackte Wort „zählen":
`silben zaehlen` und `buchstaben zaehlen` sind Deutsch und müssen bleiben.
Geprüft mit `node pruefe-fachfremd.mjs`, und zwar in beide Richtungen —
gefundene Treffer *und* das, was stehenbleiben muss.

Gefunden wird beim Bauen, und dann wird **die einzelne Aufgabe entfernt, nicht
das ganze Spiel weggeworfen**: erst der ohnehin vorhandene zweite Anlauf, und
wenn der auch danebenliegt, fliegen nur die fachfremden Aufgaben raus. Ein
Deutsch-Spiel mit neun Aufgaben ist besser als eine Fehlermeldung nach
neunzig Sekunden Warten. Bleiben weniger als fünf übrig, ist es wieder ein
Mangel — dann ist der ehrliche Fehler richtig.

### Die Form stimmt noch lange nicht die Zahl

`pruefeSpiel` sagt, ob die Lösung **in der Auswahl steht** — nicht, ob sie
**stimmt**. In Pauls „Marktbude am Hafen" stand seit dem 13.09.2026:

> Ein Marktbrötchen kostet 1,20 €. Was kosten 6 Brötchen? → **7**

und im Rechenweg der Satz **„120 ct = 1 €"**. Richtig sind 7,20 € und 1,20 €.
Zwölf Aufgaben, elf davon einwandfrei, und die zwölfte bringt einem
Viertklässler bei, dass 120 Cent ein Euro sind. Gefunden hat sie niemand, weil
niemand nachgerechnet hat — der Auftrag *bittet* den Baumeister seit jeher,
richtig zu rechnen. **Eine Bitte im Auftrag ist keine Prüfung**, dieselbe Lehre
wie bei den Namen und beim Fachfremden.

`functions/api/_rechnung.js` rechnet deshalb mechanisch nach:

- **Einheiten-Gleichungen** im Text (`120 ct = 1 €`, `1 kg = 100 g`),
- **ausgerechnete Zeilen** im Rechenweg (`6 · 5 + 4 = 54`),
- „**kostet P €, was kosten N Stück**" gegen die Lösung,
- „**N … mit je M …**" gegen die Lösung,
- der **letzte Teilschritt** gegen die Gesamtlösung.

Es läuft an **beiden** Enden: beim Bauen in `pruefeSpiel` (Marke
`rechnet falsch: `, die einzelne Aufgabe fliegt raus wie eine fachfremde, das
Spiel bleibt) und über den Bestand:

    node lernwelt/pruefe-rechnung.mjs --selbsttest
    ./pruefe-bestand.sh                 # ruft es als zweiten Teil mit auf

**Warum es so wenig prüft, und warum das richtig ist.** Ein Fehlalarm wirft
hier eine *richtige* Aufgabe aus einem fertigen Spiel — der kostet mehr als
eine Lücke. Gemeldet wird darum nur, was eindeutig ist. Der erste Entwurf war
großzügiger und meldete 26 Fälle, davon **25 unecht**: der deutsche Doppelpunkt
als Geteiltzeichen gelesen (`Zerlege die 6 in 3 und 3: 7 + 3 = 10`), Gleichungen
über einen Zeilenumbruch hinweg (`4 · 5 = 5 + 5 + 5 + 5\n= 20`), abgeschnittenes
Weiterrechnen (`8 · 50 = 4 · 100`), zusammengesetzte Lösungen (`88 und 90`,
`5 Euro 70 Cent`) und „je"-Aufgaben mit einem zweiten Schritt (`4 Reihen mit je
10 Schrauben und nimmt danach 7 weg`). Aufgaben, die mit Absicht eine falsche
Rechnung **zeigen** („Was ist bei 246 · 3 = 638 schiefgegangen?"), sind
ausgenommen. Seitdem: **52 Spiele, ein Treffer, und der war echt.** Wer die
Prüfung erweitert, misst sich an dieser Zahl und am Selbsttest — der prüft in
beide Richtungen, gefundene Fehler *und* das, was stehenbleiben muss.

## Wenn nichts mehr gespeichert wird: erst messen, dann suchen

Am 14.09.2026 gegen 14 Uhr UTC hat der KV-Speicher aufgehört, Schreibvorgänge
anzunehmen. **Lesen ging die ganze Zeit weiter** — deshalb sah die Lernwelt von
außen gesund aus, während in Wahrheit keine Meldung, keine Runde und kein
Fortschritt mehr ankam. Wer da an der falschen Stelle sucht, verliert Stunden.

**Der Test dauert zehn Sekunden:**

    curl -s -o /dev/null -w "lesen  %{http_code}\n" "https://lernwelt.rh171.de/api/aktiv"
    curl -s -o /dev/null -w "schreiben %{http_code}\n" -X POST \
      "https://lernwelt.rh171.de/api/aktiv" -H "content-type: application/json" \
      -d '{"kind":"helena"}'

Lesen 200 und Schreiben 500 heißt: Der Speicher nimmt nichts an, und **kein
Fehler im eigenen Code** ist die Ursache. `/api/aktiv` eignet sich dafür, weil
dort der einzige Schreibvorgang *nicht* in einem `try/catch` steckt — die
meisten anderen schlucken den Fehler und melden trotzdem Erfolg
(`./werkstatt.sh bauzettel` sagt dann "Zettel haengt", obwohl nichts ankam).

**Seit dem 14.09.2026 abends ist dieser Test nicht mehr zuverlässig:** Der Puls
schreibt nur noch, wenn der letzte länger als `PULS_MINDESTABSTAND` (90 s)
zurückliegt. Hat dasselbe Kind gerade gepulst, kommt 200 zurück, ohne dass
geschrieben wurde. Nimm `./werkstatt.sh speicher` — das ist ohnehin der bessere
Weg, weil es den Grund im Klartext nennt.

**Besser als der Test oben: den Server selbst fragen.** Er nennt den Grund im
Klartext, statt nur "500" zu sagen:

    ./werkstatt.sh speicher

Dahinter steht `functions/api/speicher-pruefen.js` (Elternausweis nötig, damit
niemand Fremdes darüber Schreibvorgänge verbrennt). Es versucht **einen**
winzigen Schreibvorgang, fängt den Fehler und reicht die Meldung von Cloudflare
unverändert durch.

**Am 14.09.2026 war die Antwort:** `KV put() limit exceeded for the day.` Also
die Tagesgrenze des Freikontingents — **1000 Schreibvorgänge**, neu ab 00:00 UTC
(2 Uhr deutscher Sommerzeit). Das musste niemand raten und niemand im
Cloudflare-Konto nachsehen.

**Behoben ist eine echte Verschwendung — sie erklärt aber nicht den 14.09.**
`delete` ist im KV ein **Schreib**vorgang. `fehlversucheLoeschen()` in
`_riegel.js` löschte nach *jeder* erfolgreichen Anmeldung den Fehlversuch-Zähler
— auch wenn es gar keinen gab, was der Normalfall ist. Angemeldet wird sich
ständig, weil sich jedes Werkzeug pro Aufruf neu anmeldet. `antworten-
nachreichen.sh` allein (drei offene Antworten, alle fünf Minuten) käme so auf
**~860 Schreibvorgänge am Tag** und hätte das Kontingent für sich verbraucht.
Dasselbe Muster steckte in `aktiv.js` beim `wunsch=0` nach jedem Ausrollen.
Beides ist gefixt.

**Ehrlich bleiben:** Nachgezählt lief vor 13:54 UTC nur wenig davon — 22
Ausrollvorgänge und 2 Wächter-Läufe. Die ~1000 des 14.09. sind damit **nicht**
erklärt. Wer hier weitersucht, fängt nicht wieder bei den Anmeldungen an.

### Was in derselben Nacht noch dazukam — und was es gekostet hat

Es gibt **nicht den einen Schuldigen**. Es sind viele kleine Schreiber, und drei
davon lagen offen herum:

1. **Der Bauzettel, jede Minute neu.** `ausrollen-frei.sh` ruft
   `/api/aktiv?wunsch=1` **jede Minute**, solange ein Kind spielt und etwas zum
   Ausrollen bereitliegt — und schrieb dabei jedes Mal denselben Satz neu.
   Nachgezählt im `lernwelt-autosync.log` vom 14.09.: acht solcher Sperren vor
   13:54 UTC, zusammen **rund 75 Minuten und damit 75 Schreibvorgänge** für eine
   Frage, die sich kein einziges Mal geändert hat. Jetzt wird erst gelesen und
   nur neu geschrieben, wenn sich der Satz ändert oder der Eintrag seinem Ablauf
   nahekommt (`WUNSCH_AUFFRISCHEN`): aus 75 werden 2.

2. **Jeder Seitenwechsel, zweimal.** `pagehide` meldete das Kind ab (ein
   `delete`), die nächste Seite meldete es sofort wieder an (ein `put`) — zwei
   Schreibvorgänge dafür, dass sich nichts geändert hat. Ein Kind, das sich
   durch sein Spielemenü klickt, verbraucht so Dutzende. `lernstand.js` merkt
   sich jetzt einen Klick auf einen Link **innerhalb** der Lernwelt und meldet
   sich dann gar nicht erst ab; `aktiv.js` schreibt den Puls nur noch, wenn der
   letzte über 90 s zurückliegt.

3. **`delete` ohne vorheriges `get`** stand noch in `aktiv.js` (`weg`,
   `updateOk`) — dieselbe Falle, die in `_riegel.js` schon behoben war.

**Der grösste Schreiber ist damit immer noch nicht angefasst:** `paul-sync.js` →
`functions/api/progress.js`. Am 14.09. haben die drei Kinder zusammen **406
Aufgaben** beantwortet (Statistik: Paul 152, Leon 194, Helena 60), und jede
gespeicherte Kleinigkeit schickt den **kompletten** Schnappschuss neu. Das ist
die Grössenordnung, die neben allem anderen den Rest der 1000 erklärt. Die
Dateien gehören Denny — **nicht nachts allein umbauen.**

**Gezählt statt geschätzt:** `node pruefe-sparsam.mjs` fährt die häufigsten
Abläufe durch ein mitzählendes KV und hält fest, was jeder kostet. Wer am Puls
oder am Bauzettel dreht, sieht dort sofort, was er sich einhandelt.

**Der nächste Verdacht — und er liegt in den gesperrten Dateien:**
`paul-sync.js` hängt sich an `localStorage.setItem` und schickt **bei jeder
Änderung** (1,5 s Sammelzeit) den **kompletten** Schnappschuss an
`/api/progress` — `paket()` vergleicht nicht mit dem zuletzt Gesendeten. Jede
gespeicherte Kleinigkeit in jedem Spiel ist damit ein voller KV-Schreibvorgang.
Beim Spielen ist das der mit Abstand häufigste Schreiber. `paul-sync.js` und
`functions/api/progress.js` tragen den Fortschritt aller drei Kinder — **nicht
nachts allein umbauen, das gehört Denny.** Der Hebel wäre klein: den zuletzt
gesendeten Text merken und bei Gleichheit nicht senden.

**Daraus wird eine Regel:** Vor einem `delete` (und vor einem `put`, das
denselben Wert schreibt) **erst `get`**. Lesen zählt praktisch nicht, Schreiben
schon. Geprüft wird das mit `node pruefe-riegel.mjs`.

**Was daraus folgt, wenn man etwas baut:** Schreibvorgänge sind hier die knappe
Zahl, nicht der Platz. Zwei Zähler gehören in **einen** Schlüssel, nicht in
zwei. Und jeder Weg, den ein Kind anfasst, braucht eine ehrliche Antwort für
den Fall, dass der Speicher streikt — vorher bekam es die nackte
Cloudflare-Seite "error code: 1101" zu sehen und wusste nicht, ob seine Meldung
angekommen ist.

**Fertige Antworten gehen nicht verloren:** `antworten-offen/<id>.txt` ablegen
und `./antworten-nachreichen.sh &` starten. Das Skript versucht es alle fünf
Minuten weiter und schiebt jede Antwort nach dem Absenden nach
`antworten-gesendet/` — jede geht also höchstens einmal raus.

Dasselbe für nachgebesserte Spiele: `spiele-nachbessern/<spiel-id>.json` ablegen
und `./spiele-nachbessern.sh &` starten. Auch hier wandert jede Datei nach dem
Absenden weiter (`spiele-nachgebessert/`), geht also höchstens einmal raus.

**Und: `/api/spiele` wirft bei vollem Speicher nicht mehr den Worker ab.** Bis
zum 14.09.2026 abends standen dort drei ungefangene Schreibvorgänge — beim
Wegwerfen eines Spiels, beim Mitschreiben einer Runde und beim Nachbessern. Das
Kind bekam die nackte Seite „error code: 1101" zu sehen; in Pauls Werkstatt
passierte sogar gar nichts, weil die Oberfläche nur den Erfolgsfall auswertete.
Jetzt kommt 503 mit einem ehrlichen Satz, und der sagt NICHT „gespeichert".
Geprüft mit `node pruefe-spiele-speicher.mjs`.

## Was ich nicht anfasse

`paul-sync.js`, `functions/api/progress.js`, `games.json` von Hand, und die
Mail-Records der Domain. `functions/_middleware.js` nur nach Rückfrage.
Geheimnisse kommen nie in `localStorage` — der Sync verteilt alles an alle
Geräte — und nie in einen Chat: Codes liegen im Schlüsselbund, `werkstatt.sh`
holt sie sich selbst.
