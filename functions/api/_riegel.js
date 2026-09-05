// Gemeinsamer Zugangsriegel für Pauls Werkstatt.
//
// Der Code selbst liegt als Cloudflare-Secret PAUL_CODE und verlässt den
// Server nie. Nach richtiger Eingabe bekommt der Browser ein signiertes
// HttpOnly-Cookie. Das ist wichtig: Ein Wert im localStorage würde von
// paul-sync.js eingesammelt und über KV an ALLE Geräte verteilt - der Code
// wäre damit öffentlich. Ein Cookie fasst der Sync nicht an.

const COOKIE = "lw_werkstatt";
const TAGE = 30;

async function signieren(text, geheim) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(geheim),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Vergleich mit fester Laufzeit - die Dauer verrät nichts über den Inhalt.
export function gleich(a, b) {
  const x = String(a || ""), y = String(b || "");
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

// Welches Geheimnis gilt fuer welches Kind.
// Solange fuer ein Kind kein eigener Code hinterlegt ist, gilt PAUL_CODE -
// so sperrt ein fehlendes Secret niemanden aus. Sobald Denny z. B. LEON_CODE
// bei Cloudflare setzt, hat Leon seinen eigenen Zugang und seine eigene
// Anmeldung; Pauls Ausweis gilt dann dort nicht mehr.
const CODE_NAMEN = { paul: "PAUL_CODE", leon: "LEON_CODE", helena: "HELENA_CODE" };

export function geheimFuer(env, kind) {
  const name = CODE_NAMEN[String(kind || "").toLowerCase()];
  return (name && env[name]) || env.PAUL_CODE;
}

export async function ausweisBauen(geheim) {
  const bis = Date.now() + TAGE * 86400000;
  return `${bis}.${await signieren(String(bis), geheim)}`;
}

// env ist optional - ohne env wird der Stichtag nicht geprüft.
export async function ausweisGueltig(request, geheim, env) {
  const roh = request.headers.get("cookie") || "";
  const treffer = roh.match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]+)"));
  if (!treffer) return false;
  const [bis, sig] = decodeURIComponent(treffer[1]).split(".");
  if (!bis || !sig) return false;
  if (Number(bis) < Date.now()) return false;
  if (!gleich(sig, await signieren(String(Number(bis)), geheim))) return false;

  // "Alle abmelden": Wurde dieser Ausweis vor dem Stichtag ausgestellt,
  // gilt er nicht mehr - auf allen Geräten gleichzeitig.
  if (env && env.PAUL_KV) {
    try {
      const stichtag = Number(await env.PAUL_KV.get(STICHTAG)) || 0;
      if (stichtag) {
        const ausgestellt = Number(bis) - TAGE * 86400000;
        if (ausgestellt < stichtag) return false;
      }
    } catch (e) {}
  }
  return true;
}

export const STICHTAG = "werkstatt:abmelde-stichtag";

// Setzt den Stichtag auf jetzt - danach muss sich jedes Gerät neu anmelden.
export async function alleAbmelden(env) {
  if (!env.PAUL_KV) return false;
  await env.PAUL_KV.put(STICHTAG, String(Date.now()));
  return true;
}

export function ausweisKopfzeile(ausweis) {
  const maxAlter = TAGE * 86400;
  return `${COOKIE}=${encodeURIComponent(ausweis)}; Path=/; Max-Age=${maxAlter}; HttpOnly; Secure; SameSite=Lax`;
}

// Bremse gegen Durchprobieren: höchstens 8 Fehlversuche je Stunde und Absender.
export async function zuVieleFehlversuche(request, env) {
  const wer = request.headers.get("cf-connecting-ip") || "unbekannt";
  try {
    if (!env.PAUL_KV) return false;
    const n = parseInt((await env.PAUL_KV.get("fehlversuche:" + wer)) || "0", 10) || 0;
    return n >= 8;
  } catch (e) { return false; }
}

export async function fehlversuchZaehlen(request, env) {
  const wer = request.headers.get("cf-connecting-ip") || "unbekannt";
  try {
    if (!env.PAUL_KV) return 0;
    const k = "fehlversuche:" + wer;
    const n = (parseInt((await env.PAUL_KV.get(k)) || "0", 10) || 0) + 1;
    await env.PAUL_KV.put(k, String(n), { expirationTtl: 3600 });
    return n;
  } catch (e) { return 0; }
}

export async function fehlversucheLoeschen(request, env) {
  const wer = request.headers.get("cf-connecting-ip") || "unbekannt";
  try { if (env.PAUL_KV) await env.PAUL_KV.delete("fehlversuche:" + wer); } catch (e) {}
}


// Wie der jeweilige Bereich sich vorstellt.
const BEREICHE = {
  paul: { name: "Pauls Lernwelt", satz: "Hier lernt Paul. Wenn du seinen Code kennst, kannst du rein.",
          farbe: "#4f46e5", rgb: "79,70,229" },
  leon: { name: "Leons Lernwelt", satz: "Hier lernt Leon. Wenn du seinen Code kennst, kannst du rein.",
          farbe: "#16a34a", rgb: "22,163,74" },
};

// Die Seite, die statt des Bereichs erscheint, solange niemand angemeldet ist.
export function anmeldeSeite(kind) {
  const wer = String(kind || "paul").toLowerCase();
  const b = BEREICHE[wer] || BEREICHE.paul;
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${b.name}</title>
<style>
  :root{
    --bg:#eef1f7; --card:#fff; --ink:#1b1c22; --muted:#71768a; --line:#e4e7f0;
    --paul:${b.farbe}; --schlecht:#f04438;
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
    cursor:pointer;box-shadow:0 8px 20px rgba(${b.rgb},.3);
  }
  button:active{transform:scale(.985)}
  button:disabled{opacity:.5}
</style>
</head>
<body>
  <div class="karte">
    <div class="schloss">&#128274;</div>
    <h1>${b.name}</h1>
    <p>${b.satz}</p>
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
      body: JSON.stringify({code: code, kind: "${wer}"})
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
