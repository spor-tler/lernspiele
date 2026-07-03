# Lernspiele 🎲

Eine kleine, statische Galerie für interaktive HTML-Lernspiele — gefiltert nach
**Thema** und **Schulstufe**. Gehostet via GitHub Pages.

🔗 **Live:** https://spor-tler.github.io/lernspiele/

---

## Neues Spiel hinzufügen (3 Schritte)

1. **Datei anlegen.** Kopiere `spiele/_vorlage.html` und benenne sie sinnvoll, z. B.
   `spiele/rechtschreibung-ie.html`. Baue dein Spiel hinein (am besten alles inline =
   eine self-contained Datei).

   Trage oben im `<head>` die Beschriftung ein:
   ```html
   <meta name="lernspiel:titel"        content="Das große Einmaleins">
   <meta name="lernspiel:thema"        content="Einmaleins / Multiplikation">
   <meta name="lernspiel:stufe"        content="3. Klasse">
   <meta name="lernspiel:fach"         content="Mathematik">           <!-- optional -->
   <meta name="lernspiel:beschreibung" content="Kurztext für die Karte"> <!-- optional -->
   ```
   Pflicht sind `titel`, `thema`, `stufe`. Dateien, deren Name mit `_` beginnt,
   werden ignoriert (Vorlagen).

2. **Galerie neu generieren:**
   ```bash
   node build.js
   ```
   Das aktualisiert `index.html` + `games.json` und erzeugt automatisch passende
   Filter-Chips aus den vorkommenden Themen und Schulstufen.

3. **Veröffentlichen:**
   ```bash
   git add .
   git commit -m "Neues Spiel: <Thema>"
   git push
   ```
   GitHub Pages aktualisiert die Seite nach ~1–2 Minuten.

---

## Lokal testen

```bash
node build.js
python3 -m http.server      # dann http://localhost:8000 öffnen
```

## Struktur

```
index.html      ← generierte Galerie (nicht von Hand bearbeiten)
games.json      ← generiertes Manifest (nicht von Hand bearbeiten)
build.js        ← Generator (Node, ohne Dependencies)
spiele/         ← deine Lernspiele (eine .html pro Spiel)
  _vorlage.html ← Kopiervorlage (wird ignoriert)
assets/         ← style.css + Fonts
```

## Statistiken & Rangliste 📊

Die Galerie zählt via [GoatCounter](https://www.goatcounter.com) (kostenlos, ohne
Cookies, DSGVO-freundlich — kein Cookie-Banner nötig), welche Spiele wie oft
geöffnet und wie lange gespielt werden.

**Wie es funktioniert:**
- `node build.js` injiziert automatisch ein kleines Statistik-Snippet in jede
  Spieldatei (zwischen `<!-- lernspiele:stats-start/end -->` — nicht von Hand
  bearbeiten, wird bei jedem Build aktualisiert).
- Jeder Spielaufruf zählt als Klick. Spielzeit wird über Meilenstein-Events
  gemeldet (`zeit/<spiel>/<n>min` bei 1/3/5/10/15/20 Min. sichtbarer Spielzeit).
- Die Galerie zeigt daraus eine 🏆-Top-3-Leiste, 🔥-Badges (ab 10 Aufrufen) und
  die Sortierung „Beliebteste zuerst".
- Lokal (`file://`, `localhost`) wird nichts gezählt — Testen verfälscht nichts.

**Einrichtung (einmalig):**
1. Account auf https://www.goatcounter.com anlegen, Code (`GOATCOUNTER_CODE` in `build.js`, aktuell `spor-tler`) wählen
   (bei anderem Code: `GOATCOUNTER_CODE` in `build.js` anpassen + neu builden).
2. In den GoatCounter-Einstellungen **„Allow adding visitor counts on your
   website"** aktivieren (sonst bleibt die Top-Leiste leer).
3. Dashboard mit allen Details: https://spor-tler.goatcounter.com
   — Klick-Ranking unter `/spiele/…`, Spielzeit unter `zeit/…`.
