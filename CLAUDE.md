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

   `sauber: true` heißt: kein Tippziel unter 44 px, kein Hauptknopf unter dem
   Rand, nichts seitlich raus, keine Schrift unter 12 px.

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

## Was ich nicht anfasse

`paul-sync.js`, `functions/api/progress.js`, `games.json` von Hand, und die
Mail-Records der Domain. `functions/_middleware.js` nur nach Rückfrage.
Geheimnisse kommen nie in `localStorage` — der Sync verteilt alles an alle
Geräte — und nie in einen Chat: Codes liegen im Schlüsselbund, `werkstatt.sh`
holt sie sich selbst.
