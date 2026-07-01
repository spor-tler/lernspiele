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

const FELDER = ["titel", "thema", "stufe", "fach", "beschreibung"];

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
  const html = fs.readFileSync(path.join(SPIELE_DIR, datei), "utf8");
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
const stufen = [...new Set(spiele.map((s) => s.stufe).filter(Boolean))].sort();

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
  </section>

  <p class="count" id="count"></p>
  <main class="grid" id="grid"></main>
  <p class="empty" id="empty" hidden>Keine Spiele gefunden. Filter zurücksetzen?</p>

  <footer class="site-footer">
    Erstellt mit ♥ · neue Spiele: Datei in <code>spiele/</code> legen &amp; <code>node build.js</code> ausführen.
  </footer>

  <script>
    const SPIELE = ${JSON.stringify(spiele)};
    const state = { thema: "", stufe: "", q: "" };
    const grid = document.getElementById("grid");
    const empty = document.getElementById("empty");
    const count = document.getElementById("count");

    function card(s) {
      const badges = [];
      if (s.thema) badges.push('<span class="badge thema">' + esc(s.thema) + '</span>');
      if (s.stufe) badges.push('<span class="badge stufe">' + esc(s.stufe) + '</span>');
      if (s.fach)  badges.push('<span class="badge fach">' + esc(s.fach) + '</span>');
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
        (!state.stufe || s.stufe === state.stufe) &&
        (!q || (s.titel + " " + s.thema + " " + s.fach + " " + s.beschreibung).toLowerCase().includes(q))
      );
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
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, "index.html"), indexHtml, "utf8");

console.log(`✓ ${spiele.length} Spiel(e) verarbeitet → games.json + index.html`);
console.log(`  Themen: ${themen.length} · Schulstufen: ${stufen.length}`);
