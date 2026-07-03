#!/usr/bin/env node
/*
 * build.js — Generiert die Lernspiele-Galerie.
 *
 * Scannt spiele/ *.html (außer _*.html), liest die lernspiel:*-Meta-Tags
 * und erzeugt games.json + index.html. Keine Dependencies.
 *
 * Aufruf:  node build.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SPIELE_DIR = path.join(ROOT, "spiele");

// GoatCounter-Code (Subdomain): Dashboard = https://<CODE>.goatcounter.com
// Account anlegen auf https://www.goatcounter.com — dort unter Einstellungen
// "Allow adding visitor counts on your website" aktivieren (für die Rangliste).
const GOATCOUNTER_CODE = "lernspiele";

const FELDER = ["titel", "thema", "stufe", "fach", "beschreibung"];

// ---- Statistik-Snippet (wird in jede Spieldatei injiziert) ---------------
// Zählt den Seitenaufruf (= Klick) und meldet Spielzeit-Meilensteine als
// Events (zeit/<spiel>/<n>min). GoatCounter dedupliziert pro Session & Pfad,
// daher Meilensteine statt Heartbeats: jede Session zählt pro Stufe 1×.
const STATS_START = "<!-- lernspiele:stats-start -->";
const STATS_END = "<!-- lernspiele:stats-end -->";

function statsSnippet(gameId) {
  return `${STATS_START}
<script>
(function () {
  var h = location.hostname;
  if (location.protocol === "file:" || h === "localhost" || h === "127.0.0.1") return;
  var CODE = ${JSON.stringify(GOATCOUNTER_CODE)};
  var GAME = ${JSON.stringify(gameId)};
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", "https://" + CODE + ".goatcounter.com/count");
  document.head.appendChild(s);
  // Spielzeit: sichtbare Sekunden zählen, bei Meilensteinen je 1 Event senden.
  var MEILENSTEINE = [1, 3, 5, 10, 15, 20]; // Minuten
  var sichtbar = 0, gesendet = 0;
  setInterval(function () {
    if (document.visibilityState !== "visible") return;
    sichtbar += 10;
    while (gesendet < MEILENSTEINE.length && sichtbar >= MEILENSTEINE[gesendet] * 60) {
      var min = MEILENSTEINE[gesendet++];
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({
          path: "zeit/" + GAME + "/" + min + "min",
          title: "Spielzeit " + GAME + ": " + min + " min",
          event: true
        });
      }
    }
  }, 10000);
})();
</script>
${STATS_END}`;
}

/** Fügt das Statistik-Snippet vor </body> ein bzw. ersetzt einen vorhandenen Block. */
function injectStats(html, gameId) {
  const snippet = statsSnippet(gameId);
  const blockRe = /<!-- lernspiele:stats-start -->[\s\S]*?<!-- lernspiele:stats-end -->/;
  if (blockRe.test(html)) return html.replace(blockRe, snippet);
  const idx = html.lastIndexOf("</body>");
  if (idx === -1) {
    console.warn(`⚠  ${gameId}: kein </body> gefunden — Statistik-Snippet nicht eingefügt.`);
    return html;
  }
  return html.slice(0, idx) + snippet + "\n" + html.slice(idx);
}

/** Liest content eines <meta name="lernspiel:FELD"> aus HTML. */
function readMeta(html, feld) {
  const re = new RegExp(
    `<meta\\s+name=["']lernspiel:${feld}["']\\s+content=["']([\\s\\S]*?)["']\\s*/?>`,
    "i"
  );
  const m = html.match(re);
  return m ? m[1].trim() : "";
}

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---- 1. Spiele einlesen -------------------------------------------------
if (!fs.existsSync(SPIELE_DIR)) {
  console.error("✗ Ordner 'spiele/' nicht gefunden.");
  process.exit(1);
}

const dateien = fs
  .readdirSync(SPIELE_DIR)
  .filter((f) => f.toLowerCase().endsWith(".html") && !f.startsWith("_"))
  .sort();

const spiele = [];
for (const datei of dateien) {
  const dateiPfad = path.join(SPIELE_DIR, datei);
  let html = fs.readFileSync(dateiPfad, "utf8");

  // Statistik-Snippet injizieren/aktualisieren (idempotent)
  const gameId = datei.replace(/\.html$/i, "");
  const mitStats = injectStats(html, gameId);
  if (mitStats !== html) {
    fs.writeFileSync(dateiPfad, mitStats, "utf8");
    html = mitStats;
  }

  const eintrag = { datei: "spiele/" + datei };
  for (const feld of FELDER) eintrag[feld] = readMeta(html, feld);

  if (!eintrag.titel) {
    eintrag.titel = datei.replace(/\.html$/i, "");
    console.warn(`⚠  ${datei}: kein lernspiel:titel — nutze Dateiname "${eintrag.titel}".`);
  }
  if (!eintrag.thema) console.warn(`⚠  ${datei}: kein lernspiel:thema gesetzt.`);
  if (!eintrag.stufe) console.warn(`⚠  ${datei}: kein lernspiel:stufe gesetzt.`);

  spiele.push(eintrag);
}

// ---- 2. games.json schreiben -------------------------------------------
fs.writeFileSync(
  path.join(ROOT, "games.json"),
  JSON.stringify(spiele, null, 2) + "\n",
  "utf8"
);

// ---- 3. index.html rendern ---------------------------------------------
const themen = [...new Set(spiele.map((s) => s.thema).filter(Boolean))].sort();
// Mehrere Stufen pro Spiel möglich: kommagetrennt in lernspiel:stufe
const stufen = [...new Set(
  spiele.flatMap((s) => (s.stufe || "").split(",").map((x) => x.trim()))
).values()].filter(Boolean).sort();

const chip = (gruppe, wert) =>
  `<button class="chip" data-group="${gruppe}" data-value="${htmlEscape(wert)}">${htmlEscape(wert)}</button>`;

const themenChips = themen.map((t) => chip("thema", t)).join("\n        ");
const stufenChips = stufen.map((s) => chip("stufe", s)).join("\n        ");

const indexHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lernspiele</title>
  <meta name="description" content="Sammlung interaktiver Lernspiele — gefiltert nach Thema und Schulstufe.">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <p class="kicker">Spielerisch lernen</p>
      <h1>Lernspiele</h1>
      <p class="lead">Interaktive Übungen für die Klasse und für daheim — wähle Thema oder Schulstufe.</p>
    </div>
    <span class="board-track" aria-hidden="true"></span>
  </header>

  <section class="controls">
    <div class="search-wrap">
      <input id="search" type="search" placeholder="🔍  Spiel suchen (Titel, Thema, Fach)…" autocomplete="off">
    </div>
    <div class="filter-group">
      <h3>Thema</h3>
      <div class="chips" id="filter-thema">
        <button class="chip active" data-group="thema" data-value="">Alle</button>
        ${themenChips}
      </div>
    </div>
    <div class="filter-group">
      <h3>Schulstufe</h3>
      <div class="chips" id="filter-stufe">
        <button class="chip active" data-group="stufe" data-value="">Alle</button>
        ${stufenChips}
      </div>
    </div>
    <div class="filter-group" id="sort-group" hidden>
      <h3>Sortierung</h3>
      <div class="chips" id="filter-sort">
        <button class="chip active" data-group="sort" data-value="">A–Z</button>
        <button class="chip" data-group="sort" data-value="beliebt">🔥 Beliebteste zuerst</button>
      </div>
    </div>
  </section>

  <section class="top-games" id="top-games" hidden>
    <h3>🏆 Top-Spiele</h3>
    <div class="top-list" id="top-list"></div>
  </section>

  <p class="count" id="count"></p>
  <main class="grid" id="grid"></main>
  <p class="empty" id="empty" hidden>Keine Spiele gefunden. Filter zurücksetzen?</p>

  <footer class="site-footer">
    Erstellt mit ♥ · neue Spiele: Datei in <code>spiele/</code> legen &amp; <code>node build.js</code> ausführen.
  </footer>

  <script>
    const SPIELE = ${JSON.stringify(spiele)};
    const GOATCOUNTER_CODE = ${JSON.stringify(GOATCOUNTER_CODE)};
    const state = { thema: "", stufe: "", q: "", sort: "" };
    const grid = document.getElementById("grid");
    const empty = document.getElementById("empty");
    const count = document.getElementById("count");

    function card(s) {
      const badges = [];
      if (s.thema) badges.push('<span class="badge thema">' + esc(s.thema) + '</span>');
      if (s.stufe) s.stufe.split(",").forEach(st => badges.push('<span class="badge stufe">' + esc(st.trim()) + '</span>'));
      if (s.fach)  badges.push('<span class="badge fach">' + esc(s.fach) + '</span>');
      if (s.klicks >= 10) badges.push('<span class="badge hot">🔥 ' + s.klicks.toLocaleString("de-AT") + '× gespielt</span>');
      return '<a class="card" href="' + esc(s.datei) + '" target="_blank" rel="noopener">' +
        '<div class="badges">' + badges.join("") + '</div>' +
        '<h2>' + esc(s.titel) + '</h2>' +
        (s.beschreibung ? '<p>' + esc(s.beschreibung) + '</p>' : '') +
        '<span class="play">Spielen →</span></a>';
    }
    function esc(t) {
      return String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    }
    function render() {
      const q = state.q.toLowerCase();
      const list = SPIELE.filter(s =>
        (!state.thema || s.thema === state.thema) &&
        (!state.stufe || (s.stufe || "").split(",").map(x => x.trim()).includes(state.stufe)) &&
        (!q || (s.titel + " " + s.thema + " " + s.fach + " " + s.beschreibung).toLowerCase().includes(q))
      );
      if (state.sort === "beliebt") list.sort((a, b) => (b.klicks || 0) - (a.klicks || 0));
      grid.innerHTML = list.map(card).join("");
      empty.hidden = list.length > 0;
      count.textContent = list.length + (list.length === 1 ? " Spiel" : " Spiele");
    }
    document.querySelectorAll(".chip").forEach(btn => {
      btn.addEventListener("click", () => {
        const g = btn.dataset.group;
        state[g] = btn.dataset.value;
        document.querySelectorAll('.chip[data-group="' + g + '"]').forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        render();
      });
    });
    document.getElementById("search").addEventListener("input", e => {
      state.q = e.target.value; render();
    });
    render();

    // ---- Rangliste: Klickzahlen von GoatCounter laden --------------------
    async function ladeStatistiken() {
      const medaillen = ["🥇", "🥈", "🥉"];
      const ergebnisse = await Promise.all(SPIELE.map(async s => {
        try {
          const pfad = new URL(s.datei, location.href).pathname;
          const res = await fetch("https://" + GOATCOUNTER_CODE + ".goatcounter.com/counter/" + pfad + ".json");
          if (!res.ok) return 0;
          const j = await res.json();
          return parseInt(String(j.count).replace(/[^0-9]/g, ""), 10) || 0;
        } catch (e) { return 0; }
      }));
      ergebnisse.forEach((n, i) => { SPIELE[i].klicks = n; });
      const top = SPIELE.filter(s => s.klicks > 0).sort((a, b) => b.klicks - a.klicks).slice(0, 3);
      if (!top.length) return; // GoatCounter nicht erreichbar / noch keine Daten
      document.getElementById("top-list").innerHTML = top.map((s, i) =>
        '<a class="top-card" href="' + esc(s.datei) + '" target="_blank" rel="noopener">' +
        '<span class="medal">' + medaillen[i] + '</span>' +
        '<span class="top-titel">' + esc(s.titel) + '</span>' +
        '<span class="top-klicks">' + s.klicks.toLocaleString("de-AT") + '× gespielt</span></a>'
      ).join("");
      document.getElementById("top-games").hidden = false;
      document.getElementById("sort-group").hidden = false;
      render(); // Badges auf den Karten aktualisieren
    }
    ladeStatistiken();
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, "index.html"), indexHtml, "utf8");

console.log(`✓ ${spiele.length} Spiel(e) verarbeitet → games.json + index.html`);
console.log(`  Themen: ${themen.length} · Schulstufen: ${stufen.length}`);
