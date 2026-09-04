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

export async function ausweisBauen(geheim) {
  const bis = Date.now() + TAGE * 86400000;
  return `${bis}.${await signieren(String(bis), geheim)}`;
}

export async function ausweisGueltig(request, geheim) {
  const roh = request.headers.get("cookie") || "";
  const treffer = roh.match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]+)"));
  if (!treffer) return false;
  const [bis, sig] = decodeURIComponent(treffer[1]).split(".");
  if (!bis || !sig) return false;
  if (Number(bis) < Date.now()) return false;
  return gleich(sig, await signieren(String(Number(bis)), geheim));
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
