// Quiz-Duell: ein Spielraum pro 4-stelligem Code (14.09.2026).
//
// Denny: "Waere es technisch moeglich, dass alle drei Kinder gegeneinander
// spielen? ... Wer als Erster die Antwort hat, hat gewonnen." Dazu: "als neue
// Kachel, wo mehrere Kinder gegeneinander spielen koennen. Sie geben ihr Alter
// und Klasse ein." Und: "gemischte Aufgaben (aber die gleichen), was auch
// 2.-Klaessler beantworten kann".
//
// So spielt es sich:
//  - Alle bekommen DIESELBE Frage. Sie richtet sich nach dem JUENGSTEN.
//  - Die Antworten werden fuer alle gleichzeitig freigeschaltet - erst nach
//    einer Lesezeit, damit ein Zweitklaessler mitlesen (oder zuhoeren) kann.
//  - Die Zeit misst DIESER Dienst, nicht das Geraet. Niemand kann sich
//    schneller rechnen, als er getippt hat.
//  - Wer zuerst richtig tippt: 3 Punkte. Wer danach noch richtig tippt: 1.
//    Falsch kostet nichts, aber pro Frage gibt es nur einen Versuch.
//  - Nach der ersten richtigen Antwort bleiben den anderen noch 3 Sekunden.
//
// Namen werden nur im Raum gehalten und mit dem Raum geloescht (Regel "Namen
// nur nach Login": nichts davon steht irgendwo offen).

import { FRAGEN } from "../../duell/fragen.js";
import { rechenFrage } from "../../duell/rechnen.js";

const MAX_SPIELER = 8;
const NACH_ERSTEM_MS = 3000;
const AUFLOESUNG_MS = 7000;
const AUFRAEUMEN_MS = 2 * 60 * 60 * 1000;

export default {
  // Direkter Zugang (zum Testen). In der Lernwelt geht es ueber /api/duell.
  async fetch(request, env) {
    const url = new URL(request.url);
    const code = (url.searchParams.get("raum") || "").replace(/\D/g, "");
    if (code.length !== 4) return new Response("Raum-Code fehlt", { status: 400 });
    return env.DUELL.get(env.DUELL.idFromName(code)).fetch(request);
  }
};

function mische(f) { for (let i = f.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [f[i], f[j]] = [f[j], f[i]]; } return f; }
function sauber(t, n) { return String(t || "").replace(/[<>"'`\\]/g, "").replace(/\s+/g, " ").trim().slice(0, n); }

export class DuellRaum {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.s = null;
    ctx.blockConcurrencyWhile(async () => {
      this.s = (await ctx.storage.get("zustand")) || null;
    });
  }

  leer(code) {
    return { code, phase: "lobby", host: null, anzahl: 10, spieler: {}, runde: null, erstellt: Date.now() };
  }

  async sichern() { await this.ctx.storage.put("zustand", this.s); }

  async fetch(request) {
    const url = new URL(request.url);
    const code = (url.searchParams.get("raum") || "").replace(/\D/g, "");
    if (!this.s) this.s = this.leer(code);

    if (request.headers.get("Upgrade") !== "websocket") {
      // Kurzinfo fuer "gibt es den Raum schon?" - ohne Namen
      const sockets = this.ctx.getWebSockets().length;
      return Response.json({ ok: true, phase: this.s.phase, spieler: Object.keys(this.s.spieler).length, verbunden: sockets },
        { headers: { "cache-control": "no-store", "access-control-allow-origin": "*" } });
    }
    if (this.ctx.getWebSockets().length >= MAX_SPIELER * 2) return new Response("Raum voll", { status: 429 });

    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  // ---------- Nachrichten ----------
  async webSocketMessage(ws, roh) {
    if (typeof roh !== "string" || roh.length > 4000) return;
    let m; try { m = JSON.parse(roh); } catch (e) { return; }
    const id = ws.deserializeAttachment()?.id;

    if (m.t === "hallo") return this.hallo(ws, m);
    if (!id || !this.s.spieler[id]) return;
    if (m.t === "einstellung" && id === this.s.host && this.s.phase === "lobby") {
      const n = +m.anzahl; if ([5, 10, 15].includes(n)) this.s.anzahl = n;
      await this.sichern(); return this.alleSenden(this.raumBild());
    }
    if (m.t === "start" && id === this.s.host && (this.s.phase === "lobby" || this.s.phase === "ende")) return this.start();
    if (m.t === "antwort") return this.antwort(id, m);
    if (m.t === "zurLobby" && id === this.s.host && this.s.phase === "ende") {
      this.s.phase = "lobby"; this.s.runde = null;
      for (const sp of Object.values(this.s.spieler)) sp.punkte = 0;
      await this.sichern(); return this.alleSenden(this.raumBild());
    }
  }

  async hallo(ws, m) {
    const id = sauber(m.id, 40);
    if (!id) return;
    const neu = !this.s.spieler[id];
    if (neu && Object.keys(this.s.spieler).length >= MAX_SPIELER) {
      ws.send(JSON.stringify({ t: "fehler", text: "Der Raum ist voll – höchstens " + MAX_SPIELER + " Spieler." }));
      return ws.close(4000, "voll");
    }
    const klasse = Math.max(0, Math.min(13, parseInt(m.klasse, 10) || 0));
    const alter = Math.max(3, Math.min(99, parseInt(m.alter, 10) || 7));
    const alt = this.s.spieler[id] || { punkte: 0 };
    this.s.spieler[id] = {
      name: sauber(m.name, 14) || "Spieler", avatar: sauber(m.avatar, 8) || "🙂",
      klasse, alter, punkte: alt.punkte || 0,
      gesehen: Array.isArray(m.gesehen) ? m.gesehen.filter((x) => typeof x === "string").slice(-80) : (alt.gesehen || [])
    };
    if (!this.s.host || !this.s.spieler[this.s.host]) this.s.host = id;
    ws.serializeAttachment({ id });
    await this.sichern();
    await this.ctx.storage.deleteAlarm().catch(() => {});
    if (this.s.phase === "frage" || this.s.phase === "aufloesung") await this.weckerStellen();
    ws.send(JSON.stringify({ t: "du", id }));
    this.alleSenden(this.raumBild());
    // Wer mitten in einer Frage (wieder) reinkommt, sieht sie sofort
    if (this.s.phase === "frage") ws.send(JSON.stringify(this.frageBild()));
    if (this.s.phase === "aufloesung") ws.send(JSON.stringify(this.aufloesungBild()));
  }

  verbundeneIds() {
    return new Set(this.ctx.getWebSockets().map((w) => w.deserializeAttachment()?.id).filter(Boolean));
  }

  raumBild() {
    const online = this.verbundeneIds();
    const liste = Object.entries(this.s.spieler).map(([id, sp]) => ({
      id, name: sp.name, avatar: sp.avatar, klasse: sp.klasse, alter: sp.alter, punkte: sp.punkte, online: online.has(id)
    }));
    return { t: "raum", code: this.s.code, phase: this.s.phase, host: this.s.host, anzahl: this.s.anzahl,
      stufe: this.stufe(), spieler: liste };
  }

  // Die Fragen richten sich nach dem juengsten verbundenen Mitspieler.
  stufe() {
    const online = this.verbundeneIds();
    const klassen = Object.entries(this.s.spieler).filter(([id]) => online.has(id)).map(([, sp]) => sp.klasse);
    if (!klassen.length) return 1;
    return Math.max(1, Math.min(...klassen));
  }

  // ---------- Spiel ----------
  async start() {
    const stufe = this.stufe();
    const gesehen = new Set();
    Object.values(this.s.spieler).forEach((sp) => (sp.gesehen || []).forEach((g) => gesehen.add(g)));

    const passend = FRAGEN.map((f, i) => ({ f, i })).filter(({ f }) => f[0] <= stufe);
    // Ungesehene zuerst, dann der Rest - beides gemischt
    const pool = mische(passend.filter(({ i }) => !gesehen.has("f" + i))).concat(mische(passend.filter(({ i }) => gesehen.has("f" + i))));
    const n = this.s.anzahl;
    const rechnenAnzahl = Math.round(n * 0.3);
    const wissen = [];
    let letzteKat = "";
    // Abwechslung: nicht zweimal hintereinander dieselbe Kategorie
    for (let durchgang = 0; durchgang < 2 && wissen.length < n - rechnenAnzahl; durchgang++) {
      for (const eintrag of pool) {
        if (wissen.length >= n - rechnenAnzahl) break;
        if (wissen.includes(eintrag)) continue;
        if (durchgang === 0 && eintrag.f[1] === letzteKat) continue;
        wissen.push(eintrag); letzteKat = eintrag.f[1];
      }
    }
    const liste = wissen.map(({ f, i }) => ({ f, key: "f" + i }));
    for (let r = 0; r < rechnenAnzahl; r++) liste.splice(Math.floor(Math.random() * (liste.length + 1)), 0, { f: rechenFrage(stufe), key: null });

    const fragen = liste.slice(0, n).map(({ f, key }) => {
      const antworten = mische(f[4].slice());
      return { key, kat: f[1], bild: f[2], text: f[3], sprechen: f[6] ? f[6] + "?" : f[3], antworten, richtig: antworten.indexOf(f[4][0]), info: f[5] };
    });

    for (const sp of Object.values(this.s.spieler)) sp.punkte = 0;
    this.s.runde = { fragen, n: -1, stufe };
    this.s.phase = "frage";
    await this.naechsteFrage();
  }

  async naechsteFrage() {
    const r = this.s.runde;
    r.n++;
    if (r.n >= r.fragen.length) return this.ende();
    const f = r.fragen[r.n];
    const jetzt = Date.now();
    // Lesezeit: je laenger die Frage, desto spaeter geht es los - fuer alle gleich
    const lesen = Math.max(2200, Math.min(5500, 1400 + f.text.length * 45));
    const dauer = (r.stufe <= 2 ? 25000 : 20000);
    r.frage = { freiAb: jetzt + lesen, bis: jetzt + lesen + dauer, antworten: {}, ersterRichtig: null, schlussUm: null };
    this.s.phase = "frage";
    await this.sichern();
    await this.weckerStellen();
    this.alleSenden(this.frageBild());
  }

  frageBild() {
    const r = this.s.runde, f = r.fragen[r.n], q = r.frage;
    return { t: "frage", n: r.n + 1, von: r.fragen.length, kat: f.kat, bild: f.bild, text: f.text, sprechen: f.sprechen,
      antworten: f.antworten, freiIn: Math.max(0, q.freiAb - Date.now()), zeit: Math.max(0, q.bis - Date.now()),
      beantwortet: Object.keys(q.antworten), ersterDa: !!q.ersterRichtig };
  }

  async antwort(id, m) {
    const r = this.s.runde;
    if (this.s.phase !== "frage" || !r || +m.n !== r.n + 1) return;
    const q = r.frage, jetzt = Date.now();
    if (jetzt < q.freiAb || q.antworten[id]) return;
    const wahl = parseInt(m.wahl, 10);
    const f = r.fragen[r.n];
    if (!(wahl >= 0 && wahl < f.antworten.length)) return;
    const richtig = wahl === f.richtig;
    const ms = jetzt - q.freiAb;
    q.antworten[id] = { wahl, ms, richtig };
    if (richtig) {
      if (!q.ersterRichtig) {
        q.ersterRichtig = id;
        this.s.spieler[id].punkte += 3;
        q.schlussUm = Math.min(q.bis, jetzt + NACH_ERSTEM_MS);
      } else {
        this.s.spieler[id].punkte += 1;
      }
    }
    const online = this.verbundeneIds();
    const alleDa = [...online].filter((sid) => this.s.spieler[sid]).every((sid) => q.antworten[sid]);
    await this.sichern();
    if (alleDa) return this.aufloesen();
    await this.weckerStellen();
    // Allen zeigen, wer schon getippt hat (nicht, was) - und ob schon jemand richtig lag
    this.alleSenden({ t: "stand", beantwortet: Object.keys(q.antworten), ersterDa: !!q.ersterRichtig,
      schlussIn: q.schlussUm ? Math.max(0, q.schlussUm - jetzt) : null });
  }

  async aufloesen() {
    this.s.phase = "aufloesung";
    this.s.runde.aufloesungBis = Date.now() + AUFLOESUNG_MS;
    await this.sichern();
    await this.weckerStellen();
    this.alleSenden(this.aufloesungBild());
  }

  aufloesungBild() {
    const r = this.s.runde, f = r.fragen[r.n], q = r.frage;
    const antworten = Object.entries(q.antworten).map(([id, a]) => ({ id, wahl: a.wahl, ms: a.ms, richtig: a.richtig }));
    return { t: "aufloesung", n: r.n + 1, von: r.fragen.length, richtig: f.richtig, info: f.info, erster: q.ersterRichtig,
      antworten, punkte: Object.fromEntries(Object.entries(this.s.spieler).map(([id, sp]) => [id, sp.punkte])),
      weiterIn: Math.max(0, (r.aufloesungBis || Date.now()) - Date.now()), frageKey: f.key };
  }

  async ende() {
    this.s.phase = "ende";
    const tabelle = Object.entries(this.s.spieler).map(([id, sp]) => ({ id, name: sp.name, avatar: sp.avatar, punkte: sp.punkte }))
      .sort((a, b) => b.punkte - a.punkte);
    const keys = this.s.runde.fragen.map((f) => f.key).filter(Boolean);
    await this.sichern();
    await this.ctx.storage.deleteAlarm().catch(() => {});
    this.alleSenden({ t: "ende", tabelle, gesehen: keys });
    this.alleSenden(this.raumBild());
  }

  // ---------- Wecker ----------
  async weckerStellen() {
    let wann = null;
    if (this.s.phase === "frage") { const q = this.s.runde.frage; wann = q.schlussUm ? Math.min(q.schlussUm, q.bis) : q.bis; }
    if (this.s.phase === "aufloesung") wann = this.s.runde.aufloesungBis;
    if (wann) await this.ctx.storage.setAlarm(wann);
  }

  async alarm() {
    if (!this.s) this.s = (await this.ctx.storage.get("zustand")) || null;
    if (!this.s) return;
    const jetzt = Date.now();
    if (this.s.phase === "frage") {
      const q = this.s.runde.frage;
      const schluss = q.schlussUm ? Math.min(q.schlussUm, q.bis) : q.bis;
      if (jetzt + 50 >= schluss) return this.aufloesen();
      return this.weckerStellen();
    }
    if (this.s.phase === "aufloesung") {
      if (jetzt + 50 >= this.s.runde.aufloesungBis) { this.s.phase = "frage"; return this.naechsteFrage(); }
      return this.weckerStellen();
    }
    // Aufraeumen: niemand mehr da
    if (this.ctx.getWebSockets().length === 0 && jetzt - (this.s.zuletzt || 0) >= AUFRAEUMEN_MS - 1000) {
      await this.ctx.storage.deleteAll();
      this.s = null;
    }
  }

  async webSocketClose(ws) { await this.weg(ws); }
  async webSocketError(ws) { await this.weg(ws); }

  async weg(ws) {
    try { ws.close(1000, "tschuess"); } catch (e) {}
    if (!this.s) return;
    this.s.zuletzt = Date.now();
    const uebrig = this.ctx.getWebSockets().filter((w) => w !== ws && w.readyState === 1);
    if (uebrig.length === 0 && (this.s.phase === "lobby" || this.s.phase === "ende")) {
      await this.sichern();
      await this.ctx.storage.setAlarm(Date.now() + AUFRAEUMEN_MS);
      return;
    }
    // Der Gastgeber ist weg? Dann uebernimmt der naechste, der noch da ist.
    const online = new Set(uebrig.map((w) => w.deserializeAttachment()?.id).filter(Boolean));
    if (this.s.host && !online.has(this.s.host)) {
      const neu = [...online].find((id) => this.s.spieler[id]);
      if (neu) this.s.host = neu;
    }
    await this.sichern();
    for (const w of uebrig) { try { w.send(JSON.stringify(this.raumBild())); } catch (e) {} }
  }

  alleSenden(obj) {
    const text = JSON.stringify(obj);
    for (const w of this.ctx.getWebSockets()) { try { w.send(text); } catch (e) {} }
  }
}
