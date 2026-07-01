# Design-System — Lernspiele-Galerie

**Stil: „Forest & Brass"** — ein warmer, analoger Brettspiel-Look. Cremiges Papier,
Tannengrün, Messing-Gold und Salbei. Kein grelles Weiß, keine Neon-Farben.
Dieser Stil ist **verbindlich** für die Galerie-Seite (`index.html` + `assets/style.css`).

> Hinweis: Dieses Design gilt für die **Galerie-Rahmenseite**. Die einzelnen Spiele
> bringen ihren eigenen (bunteren) Look mit — das ist gewollt.

---

## Farben (CSS-Variablen in `:root`)

| Variable        | Hex        | Verwendung                                   |
|-----------------|------------|----------------------------------------------|
| `--cream`       | `#EEE9DD`  | Seiten-Hintergrund, Text auf dunklem Grund   |
| `--forest`      | `#233028`  | Header-Grund, Headings, `stufe`-Badge        |
| `--brass`       | `#C99A3A`  | Akzent: aktive Chips, Links, Ränder, Deko    |
| `--sage`        | `#8A9A6B`  | sekundärer Akzent, Deko-Würfel               |
| `--body-dark`   | `#3A423A`  | Fließtext                                     |
| `--muted-dark`  | `#74796D`  | Sekundärtext, Labels                         |
| `--card-bg`     | `#FFFFFF`  | Karten, Suchfeld, Chips                      |
| `--line`        | `rgba(35,48,40,.10)` | feine Rahmen                         |

Kontrast: mindestens WCAG AA (4.5:1) für Text.

## Fonts (lokal in `assets/fonts/`, kein CDN)

| Font     | Einsatz                                   | Merkmal                        |
|----------|-------------------------------------------|--------------------------------|
| **Anton**  | H1, Karten-Titel (`h2`)                 | Display, `UPPERCASE`, gestaucht |
| **Caveat** | Kicker, „Spielen →"-Link                | handschriftlich, verspielt      |
| **Inter**  | Fließtext, Chips, Buttons, Suchfeld     | variabel 100–900, neutral       |

## Form & Abstand

- **Radius:** Karten `16px` (`--radius`), Chips/Suchfeld/Badges `999px` (Pille).
- **Schatten:** `--shadow` normal, `--shadow-hover` bei Hover.
- **Hover-Karten:** `translateY(-4px)` + Messing-Rand.
- **Abstände:** Vielfache von `4/8px`. Content-Breite max. `1080px`.

## Header (Analog-Games)

Der Header ist der Signature-Block. Bausteine:
- **Board-Textur:** dezentes 44px-Raster + zwei radiale Glows (Messing oben, Salbei unten) auf Tannengrün.
- **Emblem:** kreisförmiges Medaillon mit Messing-Ring und Würfel (Augenzahl 5), Mitte-Pip in Messing.
- **Deko-Spielsteine:** Salbei-Würfel, Messing-Spielfigur (Pawn), zwei Funken/Sparkles — absolut positioniert, dezent, auf Mobil ausgeblendet.
- **Board-Pfad:** gepunktete Messing-Linie als Trenner zum Body.
- **Bewegung:** sanftes Schweben/Twinkling — **nur** unter `@media (prefers-reduced-motion: no-preference)`.

## Icon-/Deko-Sprache

Inline-**SVG** in den Markenfarben (keine externen Bilder, keine Icon-Fonts).
Motive aus der analogen Spielwelt: Würfel, Spielfiguren, Spielbrett-Pfade, Funken.

---

## Regeln beim Erweitern

1. **Nur Tokens verwenden** — Farben/Radien/Schatten aus `:root`, keine Magic-Values.
2. **Keine neuen Fonts** — Anton / Caveat / Inter genügen.
3. **Keine externen Assets/CDNs** — alles lokal, muss per `file://` laufen.
4. **`prefers-reduced-motion` immer respektieren.**
5. Header-Markup lebt im **Template in `build.js`**, nicht in `index.html`
   (die wird generiert). Nach Änderungen: `node build.js`.
