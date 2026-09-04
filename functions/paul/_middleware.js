// Schützt ALLES unter /paul/ mit Pauls Code.
//
// Die bestehende Middleware in functions/_middleware.js bleibt unangetastet -
// Cloudflare Pages verkettet Middleware von oben nach unten, diese hier läuft
// zusätzlich und nur für /paul/.
//
// Wer kein gültiges Cookie hat, bekommt statt der Seite eine Anmeldung.
// Geprüft wird dasselbe signierte Cookie wie in der Werkstatt.

import { ausweisGueltig } from "../api/_riegel.js";

export async function onRequest(context) {
  const { request, next, env } = context;

  // Ohne hinterlegten Code niemanden aussperren - sonst wäre die Lernwelt
  // unerreichbar, falls das Secret einmal fehlt.
  if (!env.PAUL_CODE) return next();

  if (await ausweisGueltig(request, env.PAUL_CODE)) return next();

  return new Response(anmeldeSeite(), {
    status: 401,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function anmeldeSeite() {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Pauls Lernwelt</title>
<style>
  :root{
    --bg:#eef1f7; --card:#fff; --ink:#1b1c22; --muted:#71768a; --line:#e4e7f0;
    --paul:#4f46e5; --schlecht:#f04438;
    --font:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",system-ui,sans-serif;
    --rund:ui-rounded,"SF Pro Rounded",-apple-system,system-ui,sans-serif;
  }
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html,body{margin:0;padding:0;height:100%}
  body{
    font-family:var(--font);color:var(--ink);
    background:radial-gradient(1100px 560px at 82% -12%,#f3efff 0,rgba(243,239,255,0) 55%),
               radial-gradient(900px 460px at -8% 2%,#e9f3ff 0,rgba(233,243,255,0) 52%),var(--bg);
    display:flex;align-items:center;justify-content:center;padding:22px;
  }
  .karte{
    background:var(--card);border:1px solid var(--line);border-radius:26px;
    box-shadow:0 1px 2px rgba(20,22,40,.05),0 14px 38px rgba(20,22,40,.1);
    padding:38px 30px;max-width:400px;width:100%;text-align:center;
  }
  .schloss{font-size:46px;line-height:1}
  h1{font-family:var(--rund);font-size:25px;margin:14px 0 6px;letter-spacing:-.01em}
  p{color:var(--muted);font-size:15.5px;line-height:1.55;margin:0}
  input{
    width:100%;max-width:210px;margin:24px auto 0;display:block;text-align:center;
    font-family:var(--rund);font-size:32px;letter-spacing:.22em;
    padding:15px 12px;border:2px solid var(--line);border-radius:16px;
    background:#fbfcff;color:var(--ink);
  }
  input:focus{outline:none;border-color:var(--paul)}
  .fehler{color:var(--schlecht);font-size:15px;margin-top:12px;min-height:22px}
  button{
    width:100%;margin-top:8px;border:none;border-radius:17px;padding:17px;
    background:var(--paul);color:#fff;font-family:var(--rund);font-size:18px;font-weight:700;
    cursor:pointer;box-shadow:0 8px 20px rgba(79,70,229,.3);
  }
  button:active{transform:scale(.985)}
  button:disabled{opacity:.5}
</style>
</head>
<body>
  <div class="karte">
    <div class="schloss">&#128274;</div>
    <h1>Pauls Lernwelt</h1>
    <p>Hier lernt Paul. Wenn du seinen Code kennst, kannst du rein.</p>
    <input id="code" type="password" inputmode="numeric" autocomplete="off" maxlength="12" aria-label="Code">
    <div class="fehler" id="fehler"></div>
    <button id="los">Rein damit</button>
  </div>
<script>
(function(){
  var feld = document.getElementById("code");
  var knopf = document.getElementById("los");
  var fehler = document.getElementById("fehler");
  feld.focus();

  function anmelden(){
    var code = feld.value.trim();
    if (!code){ fehler.textContent = "Bitte gib den Code ein."; return; }
    knopf.disabled = true; fehler.textContent = "";
    fetch("/api/code-pruefen", {
      method:"POST", credentials:"same-origin",
      headers:{"content-type":"application/json"},
      body: JSON.stringify({code: code})
    })
    .then(function(r){ return r.json(); })
    .then(function(a){
      knopf.disabled = false;
      if (a && a.ok){ location.reload(); return; }
      feld.value = ""; feld.focus();
      fehler.textContent = (a && a.fehler) ? a.fehler : "Das hat nicht geklappt.";
    })
    .catch(function(){
      knopf.disabled = false;
      fehler.textContent = "Ich konnte den Server nicht erreichen.";
    });
  }
  knopf.addEventListener("click", anmelden);
  feld.addEventListener("keydown", function(e){ if (e.key === "Enter") anmelden(); });
})();
<\/script>
</body>
</html>`;
}
