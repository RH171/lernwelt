/* Zugänge zum Elternbereich je Person (Auftrag 195, Phase 1, 03.11.2026).
 *
 * Denny: Der Elternbereich bekommt Zugänge nur per Passwort, ohne Benutzername,
 * an derselben Adresse. Das Passwort bestimmt die Rolle und damit die Kinder:
 *   elisabeth -> helena · julia -> paul, leon · denny -> paul, leon
 *   verwalter -> alle drei, mit Ablaufdatum und eigenem Abschalter.
 *
 * Wo die Zugänge liegen: im Pages-Secret ELTERN_ZUGAENGE (JSON), gesetzt nur mit
 * werkzeuge/elternzugang.py (Projektwurzel). Nie im Code, nie im KV, nie in Git.
 *   { "v": 1, "pfeffer": "<hex>",
 *     "rollen": { "<rolle>": { "salz": "<hex>", "hash": "<hex>", "runden": 100000,
 *                               "kennung": "<16 hex>", "kinder": ["paul"], "bis": "<ISO>"? } } }
 * hash    = PBKDF2-SHA-256(passwort, salz, runden, 32 Byte)   (Workers: höchstens 100.000 Runden)
 * kennung = HMAC-SHA-256(pfeffer, passwort), erste 16 Zeichen. Sie sagt nur, WELCHE Rolle
 *           zu prüfen ist, damit je Anmeldung genau eine PBKDF2-Rechnung läuft statt vier.
 *           Entscheidend bleibt der PBKDF2-Hash mit eigenem Salz je Zugang.
 *
 * Der Ausweis ist dasselbe Cookie wie bisher (lw_werkstatt), nur in eigenem Format:
 *   p1.<rolle>.<ausgestellt>.<bis>.<sig>
 * sig = HMAC-SHA-256(ELTERN_CODE + "\nrolle:" + rolle, "p1.<rolle>.<ausgestellt>.<bis>.<hash[0:16]>")
 * Der Hash-Anfang steckt in der Unterschrift: Ein neues Passwort macht alle alten Ausweise
 * dieser Rolle ungültig. Abmelden räumt dasselbe Cookie weg wie bisher (abmelden.js).
 *
 * Rückweg: KV schalter:elternzugang. Standard "alt" = alles wie vor dem 03.11.2026, ein
 * Personen-Ausweis gilt dann nirgends. Nur "neu" schaltet die Zugänge frei.
 * Verwalter zusätzlich: KV schalter:eltern-verwalter = "aus" sperrt ihn sofort (Standard "an").
 */

export const ROLLEN = ["elisabeth", "julia", "denny", "verwalter"];
export const KINDER = ["paul", "leon", "helena"];
const COOKIE = "lw_werkstatt";            // dasselbe wie in _riegel.js
const STICHTAG = "werkstatt:abmelde-stichtag";
export const TAGE = 30;
const MAX_RUNDEN = 100000;

/* ---------- Schalter ---------- */

const SCHALTER = {
  "elternzugang":     { werte: ["alt", "neu"], standard: "alt" },
  "eltern-verwalter": { werte: ["an", "aus"],  standard: "an" },
  /* 03.11.2026: alter Eltern-Code und Hauptschluessel oeffnen den Elternbereich nicht mehr,
     nur noch der Maschinenwert ELTERN_MASCHINE der Werkzeuge (siehe elternMaschineAktiv in _riegel.js). */
  "eltern-maschinenwert": { werte: ["alt", "neu"], standard: "alt" },
};

export async function schalterLesen(env, name) {
  const s = SCHALTER[name];
  if (!s) return null;
  try {
    const roh = env && env.PAUL_KV ? await env.PAUL_KV.get("schalter:" + name) : null;
    if (roh == null) return s.standard;
    const w = String(roh).trim().replace(/^["']|["']$/g, "").trim().toLowerCase();
    return s.werte.includes(w) ? w : s.standard;
  } catch (e) { return s.standard; }      // Lesefehler: sichere Seite (alt bzw. an)
}

/* ---------- Zugänge ---------- */

export function zugaengeLesen(env) {
  try {
    const d = JSON.parse(String((env && env.ELTERN_ZUGAENGE) || ""));
    if (!d || typeof d !== "object" || !d.rollen || typeof d.rollen !== "object") return null;
    return d;
  } catch (e) { return null; }
}

function kinderVon(z) {
  return Array.isArray(z && z.kinder) ? KINDER.filter((k) => z.kinder.includes(k)) : [];
}

function bisVon(z) {
  if (!z || !z.bis) return null;
  const t = Date.parse(z.bis);
  return isNaN(t) ? 0 : t;                // kaputtes Datum = abgelaufen
}

/* ---------- Rechnen ---------- */

const enc = new TextEncoder();

export function normalisieren(pw) {
  return String(pw || "").normalize("NFC").toLowerCase()
    .replace(/[\s\-_.,;:+]+/g, "-").replace(/^-+|-+$/g, "");
}

function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function vonHex(h) {
  const s = String(h || "");
  const a = new Uint8Array(Math.floor(s.length / 2));
  for (let i = 0; i < a.length; i++) a[i] = parseInt(s.substr(i * 2, 2), 16) || 0;
  return a;
}

async function hmacHex(schluessel, text) {
  const key = await crypto.subtle.importKey("raw", typeof schluessel === "string" ? enc.encode(schluessel) : schluessel,
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
}

async function pbkdf2Hex(pw, salzHex, runden) {
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: vonHex(salzHex), iterations: runden }, key, 256);
  return hex(bits);
}

export function gleich(a, b) {
  const x = String(a || ""), y = String(b || "");
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}

/* Welche Rolle gehört zu diesem Passwort? Genau eine PBKDF2-Rechnung je Versuch,
   auch bei unbekanntem Passwort (gegen einen Platzhalter) - die Laufzeit verrät nichts. */
export async function rolleZuPasswort(env, passwort) {
  const d = zugaengeLesen(env);
  const pw = normalisieren(passwort);
  if (!d || !pw) return null;
  const kennung = (await hmacHex(vonHex(d.pfeffer), pw)).slice(0, 16);
  let treffer = null;
  for (const r of ROLLEN) {
    const z = d.rollen[r];
    if (z && z.kennung && gleich(z.kennung, kennung)) { treffer = r; break; }
  }
  const z = treffer ? d.rollen[treffer] : null;
  const runden = Math.min(MAX_RUNDEN, Math.max(1000, Number(z && z.runden) || MAX_RUNDEN));
  const ist = await pbkdf2Hex(pw, z ? z.salz : "00000000000000000000000000000000", runden);
  if (!z || !gleich(ist, String(z.hash || ""))) return null;
  return treffer;
}

/* ---------- Ausweis ---------- */

function cookieWert(request) {
  const roh = request.headers.get("cookie") || "";
  const t = roh.match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]+)"));
  if (!t) return null;
  try { return decodeURIComponent(t[1]); } catch (e) { return null; }
}

export function istPersonenAusweis(wert) {
  return typeof wert === "string" && wert.startsWith("p1.");
}

export function personenCookieDa(request) {
  return istPersonenAusweis(cookieWert(request));
}

async function unterschrift(env, rolle, ausgestellt, bis, z) {
  return hmacHex(String(env.ELTERN_CODE) + "\nrolle:" + rolle,
    `p1.${rolle}.${ausgestellt}.${bis}.${String(z.hash || "").slice(0, 16)}`);
}

/* Baut den Ausweis. Verwalter höchstens bis zu seinem Ablaufdatum. */
export async function personenAusweisBauen(env, rolle) {
  const d = zugaengeLesen(env);
  const z = d && d.rollen[rolle];
  if (!z || !env.ELTERN_CODE) return null;
  const jetzt = Date.now();
  let bis = jetzt + TAGE * 86400000;
  const zb = bisVon(z);
  if (zb !== null) bis = Math.min(bis, zb);
  if (bis <= jetzt) return null;
  return { wert: `p1.${rolle}.${jetzt}.${bis}.${await unterschrift(env, rolle, jetzt, bis, z)}`, bis };
}

export function personenKopfzeile(ausweis) {
  const sek = Math.max(0, Math.floor((ausweis.bis - Date.now()) / 1000));
  return `${COOKIE}=${encodeURIComponent(ausweis.wert)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${sek}`;
}

/* Prüft den Personen-Ausweis vollständig: Schalter, Format, Unterschrift, Ablauf,
   Verwalter-Schalter, Abmelde-Stichtag. Ergebnis { rolle, kinder, bis } oder null. */
export async function personPruefen(request, env) {
  const wert = cookieWert(request);
  if (!istPersonenAusweis(wert) || !env || !env.ELTERN_CODE) return null;
  if ((await schalterLesen(env, "elternzugang")) !== "neu") return null;
  const teile = wert.split(".");
  if (teile.length !== 5) return null;
  const [, rolle, a, b, sig] = teile;
  if (!ROLLEN.includes(rolle)) return null;
  const ausgestellt = Number(a), bis = Number(b);
  const jetzt = Date.now();
  if (!ausgestellt || !bis || bis < jetzt || ausgestellt > jetzt + 60000) return null;
  const d = zugaengeLesen(env);
  const z = d && d.rollen[rolle];
  if (!z) return null;
  if (!gleich(sig, await unterschrift(env, rolle, ausgestellt, bis, z))) return null;
  const zb = bisVon(z);
  if (zb !== null && jetzt > zb) return null;                    // Zugang abgelaufen (auch wenn verkürzt)
  if (rolle === "verwalter" && (await schalterLesen(env, "eltern-verwalter")) === "aus") return null;
  if (env.PAUL_KV) {
    try {
      const st = Number(await env.PAUL_KV.get(STICHTAG)) || 0;
      if (st && ausgestellt < st) return null;
    } catch (e) {}
  }
  const kinder = kinderVon(z);
  if (!kinder.length) return null;
  return { rolle, kinder, bis: zb !== null ? Math.min(bis, zb) : bis };
}

/* Welche Seite unter /eltern/ gehört zu welchem Kind. Unbekanntes: verboten. */
const SEITEN = {
  "": null, "index": null,                      // Übersicht: jedes erlaubte Kind
  "pruefungen-helena": "helena",
  "probearbeiten": "paul", "tagesrechnen": "paul", "einmaleinswoche": "paul",
  "probenvergleich": "?kind",
};

export function seiteErlaubt(url, kinder) {
  const m = url.pathname.match(/^\/eltern(?:\/(.*))?$/);
  if (!m) return false;
  const name = String(m[1] || "").replace(/\/+$/, "").replace(/\.html$/, "");
  if (!Object.prototype.hasOwnProperty.call(SEITEN, name)) return false;
  const k = SEITEN[name];
  if (k === null) return kinder.length > 0;
  if (k === "?kind") return kinder.includes(String(url.searchParams.get("kind") || "paul").toLowerCase());
  return kinder.includes(k);
}

/* Aufruf aus ausweisGueltig() (_riegel.js) - nur für Cookies im Personen-Format.
   Gilt ausschließlich für den Eltern-Geheimschlüssel, nie für einen Kinderbereich,
   und außerhalb von /api/ nur für die Elternseiten dieses Zugangs. */
export async function personenAusweisGilt(request, geheim, env) {
  if (!env || !env.ELTERN_CODE || !geheim || geheim !== env.ELTERN_CODE) return false;
  for (const n of ["PAUL_CODE", "LEON_CODE", "HELENA_CODE"]) if (env[n] && env[n] === env.ELTERN_CODE) return false;
  const ich = await personPruefen(request, env);
  if (!ich) return false;
  let url;
  try { url = new URL(request.url); } catch (e) { return false; }
  if (url.pathname.startsWith("/api/")) return true;      // die Kindergrenze zieht functions/api/_middleware.js
  return seiteErlaubt(url, ich.kinder);
}

/* ---------- Fehlversuch-Sperre: 5 falsche -> 15 Minuten je Absender ---------- */

const SPERRE_MAX = 5, SPERRE_SEK = 900;
const sperrSchluessel = (request) => "eltern-fehlversuche:" + (request.headers.get("cf-connecting-ip") || "unbekannt");

export async function gesperrt(request, env) {
  try {
    if (!env.PAUL_KV) return false;
    return (parseInt((await env.PAUL_KV.get(sperrSchluessel(request))) || "0", 10) || 0) >= SPERRE_MAX;
  } catch (e) { return false; }
}

export async function fehlversuch(request, env) {
  try {
    if (!env.PAUL_KV) return 0;
    const k = sperrSchluessel(request);
    const n = (parseInt((await env.PAUL_KV.get(k)) || "0", 10) || 0) + 1;
    await env.PAUL_KV.put(k, String(n), { expirationTtl: SPERRE_SEK });
    return n;
  } catch (e) { return 0; }
}

/* Erst nachsehen, dann löschen: ein delete zählt als Schreibvorgang (1.000 je Tag). */
export async function fehlversucheWeg(request, env) {
  try {
    if (!env.PAUL_KV) return;
    const k = sperrSchluessel(request);
    if (!(await env.PAUL_KV.get(k))) return;
    await env.PAUL_KV.delete(k);
  } catch (e) {}
}

export const SPERRE = { max: SPERRE_MAX, sek: SPERRE_SEK };
