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
// Seit 18.09.2026 gibt es keinen Countdown mehr, sobald jemand richtig geantwortet
// hat: Tempo bringt keine Punkte, also darf auch niemand gehetzt werden.
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
      gesehen: Array.isArray(m.gesehen) ? m.gesehen.filter((x) => typeof x === "string").slice(-400) : (alt.gesehen || []),
      // Fragen, die dieses Kind zuletzt falsch hatte - wie eine Vokabelbox.
      // Denny am 18.09.2026: "immer da, wo falsche Antworten waren, diese Frage
      // wiederholen ... wie Vokabeltraining, nur mit offenen Fragen für Kinder."
      falsch: Array.isArray(m.falsch) ? m.falsch.filter((x) => typeof x === "string").slice(-150) : (alt.falsch || [])
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
      id, name: sp.name, avatar: sp.avatar, klasse: sp.klasse, alter: sp.alter, punkte: sp.punkte, serie: sp.serie || 0, online: online.has(id)
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

    // Was jemand in der Runde zuletzt falsch hatte, kommt bevorzugt noch einmal.
    const falsch = new Set();
    Object.values(this.s.spieler).forEach((sp) => (sp.falsch || []).forEach((k) => falsch.add(k)));

    const passend = FRAGEN.map((f, i) => ({ f, i })).filter(({ f }) => f[0] <= stufe);
    // Ungesehene zuerst, dann der Rest - beides gemischt
    const pool = mische(passend.filter(({ i }) => !gesehen.has("f" + i))).concat(mische(passend.filter(({ i }) => gesehen.has("f" + i))));
    const n = this.s.anzahl;
    const rechnenAnzahl = Math.round(n * 0.3);
    const wissen = [];
    // Erst die Wiederholungen: hoechstens ein Drittel der Wissensfragen.
    const wiederholen = mische(passend.filter(({ i }) => falsch.has("f" + i)))
      .slice(0, Math.max(1, Math.round((n - rechnenAnzahl) / 3)));
    wiederholen.forEach((e) => { e.wiederholung = true; wissen.push(e); });
    let letzteKat = "";
    // Abwechslung: nicht zweimal hintereinander dieselbe Kategorie
    for (let durchgang = 0; durchgang < 2 && wissen.length < n - rechnenAnzahl; durchgang++) {
      for (const eintrag of pool) {
        if (wissen.length >= n - rechnenAnzahl) break;
        if (wissen.includes(eintrag) || wiederholen.includes(eintrag)) continue;
        if (durchgang === 0 && eintrag.f[1] === letzteKat) continue;
        wissen.push(eintrag); letzteKat = eintrag.f[1];
      }
    }
    const liste = mische(wissen).map(({ f, i, wiederholung }) => ({ f, key: "f" + i, wiederholung: !!wiederholung }));
    for (let r = 0; r < rechnenAnzahl; r++) liste.splice(Math.floor(Math.random() * (liste.length + 1)), 0, { f: rechenFrage(stufe), key: null });

    const fragen = liste.slice(0, n).map(({ f, key, wiederholung }) => {
      const antworten = mische(f[4].slice());
      return { key, wiederholung: !!wiederholung, kat: f[1], bild: f[2], text: f[3], sprechen: f[6] ? f[6] + "?" : f[3], antworten, richtig: antworten.indexOf(f[4][0]), info: f[5],
               // Fragen aus dem Klexikon (CC BY-SA 4.0) nennen ihren Artikel.
               quelle: f[7] ? "Klexikon: " + f[7] : "" };
    });

    for (const sp of Object.values(this.s.spieler)) { sp.punkte = 0; sp.msSumme = 0; sp.msAnzahl = 0; sp.serie = 0; }
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
    /* Lesezeit: je laenger Frage UND Antworten, desto spaeter geht es los - fuer
       alle gleich. Spielt ein Zweitklaessler mit, wird sie deutlich laenger.
       Vorbild ist Kahoots "dynamic question time" (mindestens fuenf Sekunden,
       Laenge nach Lesegeschwindigkeit); Leon liest langsamer als 180 Woerter je
       Minute, darum hier grosszuegiger. Die Antworten erscheinen erst nach
       ANTWORTEN_AB - vorher kann niemand sie lesen und vorklicken. */
    const zeichen = f.text.length + f.antworten.join(" ").length;
    const klein = r.stufe <= 2;
    const lesen = klein
      ? Math.max(6000, Math.min(15000, 2500 + zeichen * 80))
      : Math.max(3000, Math.min(9000, 1500 + zeichen * 45));
    /* Wie lange zum Antworten? Seit dem 19.09.2026 sehr grosszuegig.
     *
     * Denny an dem Tag, mit zwei Bildern aus einem Spiel gegen Paul: "Es sollte
     * doch nicht mehr der gewinnen, der am schnellsten ist." Punkte fuer Tempo
     * gab es da schon lange nicht mehr - aber das Zeitlimit war der Tempo-
     * Wettbewerb durch die Hintertuer: Wer die Antwort wusste und 21 Sekunden
     * brauchte, bekam trotzdem nichts, und der Schnellere zog davon.
     *
     * Jetzt entscheidet die Uhr praktisch nicht mehr. Sobald ALLE geantwortet
     * haben, geht es sofort weiter (siehe alleDa unten) - im Normalfall wartet
     * also niemand. Die 90 Sekunden sind nur der Notausstieg fuer den Fall,
     * dass jemand aufsteht und das Spiel sonst haengen bliebe.
     *
     * Passt zu Dennys Satz vom 18.09.2026: "Lieber gibt es am Ende ein
     * Unentschieden - und das haben alle richtig." */
    const dauer = 90000;
    r.frage = { freiAb: jetzt + lesen, antwortenAb: jetzt + Math.round(lesen * 0.55),
                bis: jetzt + lesen + dauer, antworten: {}, ersterRichtig: null, schlussUm: null };
    this.s.phase = "frage";
    await this.sichern();
    await this.weckerStellen();
    this.alleSenden(this.frageBild());
  }

  frageBild() {
    const r = this.s.runde, f = r.fragen[r.n], q = r.frage;
    return { t: "frage", n: r.n + 1, von: r.fragen.length, kat: f.kat, bild: f.bild, text: f.text, sprechen: f.sprechen, wiederholung: !!f.wiederholung,
      antworten: f.antworten, freiIn: Math.max(0, q.freiAb - Date.now()), zeit: Math.max(0, q.bis - Date.now()),
      antwortenIn: Math.max(0, (q.antwortenAb || q.freiAb) - Date.now()),
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
    // Punkte: NUR richtig zaehlt, Tempo gar nicht mehr. Denny am 18.09.2026:
    // "Wer am schnellsten gedrückt hat - das hätte ich gerne weg. Lieber gibt es
    // am Ende ein Unentschieden ... und das haben alle richtig."
    // Darum auch kein Countdown mehr, sobald jemand richtig liegt: Wer langsamer
    // liest, soll in Ruhe zu Ende denken koennen.
    /* Serien-Bonus (Denny, 18.09.2026): "Wenn man drei Mal richtig hintereinander
       geantwortet hat, bekommt man einen Zusatzpunkt, und bei fünf Mal
       hintereinander zwei." Ab der dritten richtigen Antwort in Folge also +1,
       ab der fuenften +2 - solange die Serie haelt. Belohnt wird Dranbleiben,
       nicht Tempo. */
    const spieler = this.s.spieler[id];
    if (richtig) {
      spieler.serie = (spieler.serie || 0) + 1;
      const bonus = spieler.serie >= 5 ? 2 : (spieler.serie >= 3 ? 1 : 0);
      spieler.punkte += 3 + bonus;
      q.antworten[id].bonus = bonus;
      q.antworten[id].serie = spieler.serie;
      if (!q.ersterRichtig) q.ersterRichtig = id;   // nur fuer die Anzeige "als Erster"
    } else {
      spieler.serie = 0;
    }
    // Wie lange hat wer gebraucht? Am Ende sieht es jeder von sich selbst.
    spieler.msSumme = (spieler.msSumme || 0) + ms;
    spieler.msAnzahl = (spieler.msAnzahl || 0) + 1;
    const online = this.verbundeneIds();
    const alleDa = [...online].filter((sid) => this.s.spieler[sid]).every((sid) => q.antworten[sid]);
    await this.sichern();
    if (alleDa) return this.aufloesen();
    await this.weckerStellen();
    // Allen zeigen, wer schon getippt hat (nicht, was) - und ob schon jemand richtig lag
    this.alleSenden({ t: "stand", beantwortet: Object.keys(q.antworten), ersterDa: false, schlussIn: null });
  }

  async aufloesen() {
    // Wer gar nicht getippt hat, dessen Serie ist auch zu Ende.
    const q0 = this.s.runde && this.s.runde.frage;
    if (q0) for (const [id, sp] of Object.entries(this.s.spieler)) if (!q0.antworten[id]) sp.serie = 0;
    this.s.phase = "aufloesung";
    this.s.runde.aufloesungBis = Date.now() + AUFLOESUNG_MS;
    await this.sichern();
    await this.weckerStellen();
    this.alleSenden(this.aufloesungBild());
  }

  aufloesungBild() {
    const r = this.s.runde, f = r.fragen[r.n], q = r.frage;
    const antworten = Object.entries(q.antworten).map(([id, a]) => ({ id, wahl: a.wahl, ms: a.ms, richtig: a.richtig,
      bonus: a.bonus || 0, serie: a.serie || 0 }));
    return { t: "aufloesung", n: r.n + 1, von: r.fragen.length, richtig: f.richtig, info: f.info, quelle: f.quelle || "", erster: q.ersterRichtig,
      antworten, punkte: Object.fromEntries(Object.entries(this.s.spieler).map(([id, sp]) => [id, sp.punkte])),
      weiterIn: Math.max(0, (r.aufloesungBis || Date.now()) - Date.now()), frageKey: f.key };
  }

  async ende() {
    this.s.phase = "ende";
    const tabelle = Object.entries(this.s.spieler).map(([id, sp]) => ({ id, name: sp.name, avatar: sp.avatar, punkte: sp.punkte,
      schnitt: sp.msAnzahl ? Math.round(sp.msSumme / sp.msAnzahl / 100) / 10 : null }))
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

    /* Geht jemand mitten in einer Frage, kann auf ihn niemand mehr warten.
     *
     * Solange die Antwortzeit 20 Sekunden war, fiel das kaum auf. Seit sie am
     * 19.09.2026 auf 90 Sekunden steht ("Es sollte doch nicht mehr der
     * gewinnen, der am schnellsten ist"), saessen die Uebrigen anderthalb
     * Minuten vor einer beantworteten Frage - eine Verschlechterung, die aus
     * genau der Aenderung entstand, die es besser machen sollte
     * (Pruefrunde 04). Haben alle Verbliebenen geantwortet, wird jetzt sofort
     * aufgeloest.
     */
    if (this.s.phase === "frage" && this.s.runde && this.s.runde.frage) {
      const q = this.s.runde.frage;
      const daIds = [...online].filter((sid) => this.s.spieler[sid]);
      if (daIds.length && daIds.every((sid) => q.antworten[sid])) return this.aufloesen();
    }
  }

  alleSenden(obj) {
    const text = JSON.stringify(obj);
    for (const w of this.ctx.getWebSockets()) { try { w.send(text); } catch (e) {} }
  }
}
