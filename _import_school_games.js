#!/usr/bin/env node
/* Einmal-Import: kopiert die School-Games-HTMLs nach spiele/ und injiziert die
 * lernspiel:* Meta-Tags. Danach `node build.js` ausfuehren. */
const fs = require("fs");
const path = require("path");

const SRC = "/Users/fabian/Desktop/Agentic Workflows/School Games";
const DEST = path.join(__dirname, "spiele");
const FACH = "Englisch (Grammatik)";

// [quelle, ziel-slug, titel, thema, stufe, beschreibung]
const MAP = [
  // 5. Schulstufe
  ["some-any-baseball-game_überarbeitet.html", "some-any-baseball.html",
    "Some/Any Baseball", "Some / Any", "5. Schulstufe",
    "Schlage den Ball mit der richtigen Wahl zwischen some und any."],
  ["elfmeter-quiz_possesives_question_with_who.html", "elfmeter-possessives.html",
    "Elfmeter-Quiz: Possessives & Who", "Possessives & Fragen mit who", "5. Schulstufe",
    "Triff ins Tor, indem du Possessivbegleiter und who-Fragen richtig löst."],

  // 6. Schulstufe
  ["past-simple-snake-game.html", "past-simple-snake.html",
    "Past Simple Snake", "Past Simple", "6. Schulstufe",
    "Steuere die Schlange zur richtigen Vergangenheitsform der Verben."],
  ["motox-past-tense.html", "motox-past-tense.html",
    "MotoX Past Tense", "Past Tense", "6. Schulstufe",
    "Fahr über die Strecke und wähle die korrekte Past-Tense-Form."],
  ["tennis-past-tense.html", "tennis-past-tense.html",
    "Tennis Past Tense", "Past Tense", "6. Schulstufe",
    "Returniere den Ball mit der richtigen Vergangenheitsform."],
  ["moorhuhn-blaster.html", "moorhuhn-past-tense.html",
    "Moorhuhn Blaster: Past Tense", "Past Tense (Irregular)", "6. Schulstufe",
    "Schieße die Moorhühner mit der richtigen unregelmäßigen Vergangenheitsform ab."],
  ["city-surfer_irregular_verbs.html", "city-surfer-irregular-verbs.html",
    "City Surfer: Irregular Verbs", "Irregular Verbs", "6. Schulstufe",
    "Surf durch die Stadt und meistere die unregelmäßigen Verben."],
  ["verb-dash-irregular-regular.html", "verb-dash.html",
    "Verb Dash", "Regular & Irregular Verbs", "6. Schulstufe",
    "Renn los und unterscheide regelmäßige von unregelmäßigen Verben."],

  // 7. Schulstufe
  ["present-perfect-hero.html", "present-perfect-hero.html",
    "Present Perfect Hero", "Present Perfect", "7. Schulstufe",
    "Werde zum Helden des Present Perfect — have/has + Partizip."],
  ["present-perfect-vs-past-hero.html", "present-perfect-vs-past-hero.html",
    "Present Perfect vs Past Hero", "Present Perfect vs Past Simple", "7. Schulstufe",
    "Entscheide blitzschnell zwischen Present Perfect und Past Simple."],
  ["flappy-grammar-past-vs-present-perfect.html", "flappy-grammar.html",
    "Flappy Grammar", "Past vs Present Perfect", "7. Schulstufe",
    "Flieg durch die Lücken mit der richtigen Zeitform: Past oder Present Perfect."],
  ["active-passive-super-hero.html", "active-passive-hero.html",
    "Active/Passive Super Hero", "Aktiv / Passiv", "7. Schulstufe",
    "Verwandle Sätze zwischen Aktiv und Passiv und rette den Tag."],
  ["austria-free-kick-game_active_passive.html", "austria-free-kick-passive.html",
    "Austria Free Kick: Passive", "Aktiv / Passiv", "7. Schulstufe",
    "Schieß den Freistoß und beherrsche den Wechsel zwischen Aktiv und Passiv."],
  ["freikick-hero-present-perfect-progressive.html", "freikick-hero-ppp.html",
    "Free Kick Hero: Present Perfect Progressive", "Present Perfect Progressive", "7. Schulstufe",
    "Trainiere have/has been + -ing beim Freistoß."],
  ["freikick-hero.html", "freikick-hero.html",
    "Free Kick Hero", "Present Perfect Progressive", "7. Schulstufe",
    "Freistoß-Variante zum Present Perfect Progressive."],

  // 8. Schulstufe
  ["conditional-hero.html", "conditional-hero.html",
    "Conditional Hero", "Conditionals (If-Sätze)", "8. Schulstufe",
    "Meistere die If-Sätze (Type 1–3) als Conditional Hero."],
  ["city-surfer_conditionals.html", "city-surfer-conditionals.html",
    "City Surfer: Conditionals", "Conditionals (If-Sätze)", "8. Schulstufe",
    "Surf durch die Stadt und vervollständige die richtigen If-Sätze."],
];

function metaBlock(titel, thema, stufe, beschreibung) {
  const esc = (s) => String(s).replace(/"/g, "&quot;");
  return [
    `  <meta name="lernspiel:titel"        content="${esc(titel)}">`,
    `  <meta name="lernspiel:thema"        content="${esc(thema)}">`,
    `  <meta name="lernspiel:stufe"        content="${esc(stufe)}">`,
    `  <meta name="lernspiel:fach"         content="${esc(FACH)}">`,
    `  <meta name="lernspiel:beschreibung" content="${esc(beschreibung)}">`,
  ].join("\n");
}

let ok = 0;
for (const [src, slug, titel, thema, stufe, beschreibung] of MAP) {
  const srcPath = path.join(SRC, src);
  if (!fs.existsSync(srcPath)) { console.error(`✗ fehlt: ${src}`); continue; }
  let html = fs.readFileSync(srcPath, "utf8");

  // evtl. vorhandene lernspiel:* Tags entfernen (idempotent)
  html = html.replace(/^\s*<meta\s+name=["']lernspiel:[^>]*>\s*$/gim, "");

  const block = metaBlock(titel, thema, stufe, beschreibung);
  const viewportRe = /(<meta\s+name=["']viewport["'][^>]*>)/i;
  if (viewportRe.test(html)) {
    html = html.replace(viewportRe, `$1\n\n${block}`);
  } else {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n${block}`);
  }

  fs.writeFileSync(path.join(DEST, slug), html, "utf8");
  ok++;
  console.log(`✓ ${stufe.padEnd(15)} ${slug}`);
}
console.log(`\n${ok}/${MAP.length} Spiele importiert.`);
