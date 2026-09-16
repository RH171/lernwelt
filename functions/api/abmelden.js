// Meldet NUR dieses eine Geraet ab. Danach faellt der Riegel sofort wieder zu
// und Pauls Bereich verlangt den Code.
//
// Paul am 16.09.2026 (Meldung 4rq8ghes95): Er will, dass der Code jedes Mal
// abgefragt wird, wenn jemand in seinen Bereich geht. Das Sitzungs-Cookie
// (siehe ausweisKopfzeile in _riegel.js) erledigt das, sobald der Browser
// zugeht - nur geht ein Browser auf dem iPad selten wirklich zu. Mit diesem
// Weg kann Paul selbst abschliessen, wenn er das Geraet aus der Hand gibt.
//
// Unterschied zu /api/alle-abmelden:
//   - dort wird ein Stichtag im KV gesetzt, also ein SCHREIBvorgang (davon
//     gibt es nur 1000 am Tag), und ALLE Geraete fliegen raus, auch Leons.
//   - hier wird nur das eigene Cookie weggeraeumt. Kein Speicherzugriff,
//     kein Schreibvorgang, niemand sonst ist betroffen.
//
// Kein Ausweis noetig: Sich selbst abzumelden darf jeder, der die Seite
// offen hat. Schlimmstenfalls raeumt jemand sein eigenes Cookie weg.

import { abmeldeKopfzeile } from "./_riegel.js";

export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true, hinweis: "Dieses Geraet ist abgemeldet." }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "set-cookie": abmeldeKopfzeile(),
    },
  });
}
