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

   **Den Ruhezustand zu messen reicht nicht.** `../mess-schritte.js` sagt, wohin
   die Messung laufen soll — beim Wiege-Meister bis zu einem Waage-Kunden, zur
   beladenen Waage, ins leere und ins volle Markt-Tagebuch. Eine Etappe mit
   `neu: true` bekommt vorher einen frischen Seitenaufruf; `__saat(name)` legt
   dafür den Speicherstand hin. Für eine andere Seite diese Datei umschreiben —
   ohne sie wird nur gemessen, wie die Seite aufgeht.

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

## Was ich nicht anfasse

`paul-sync.js`, `functions/api/progress.js`, `games.json` von Hand, und die
Mail-Records der Domain. `functions/_middleware.js` nur nach Rückfrage.
Geheimnisse kommen nie in `localStorage` — der Sync verteilt alles an alle
Geräte — und nie in einen Chat: Codes liegen im Schlüsselbund, `werkstatt.sh`
holt sie sich selbst.
