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
