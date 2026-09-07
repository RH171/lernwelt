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

2. **Messen, nicht anschauen.** `pruefung/layout-messen.js` in die Seite laden
   und für jede Größe aus `../pruefung-geraete.json` aufrufen:

       const q = await fetch('/pruefung/layout-messen.js').then(r=>r.text());
       window.__mess = new Function(q + '; return layoutMessen;')();
       await window.__mess({still:true, beruehrung:true});

   `sauber: true` heißt: kein Tippziel unter 44 px, kein Hauptknopf unter dem
   Rand, nichts seitlich raus, keine Schrift unter 12 px.

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
