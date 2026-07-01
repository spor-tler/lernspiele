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
- **Hero-Bild:** `assets/img/header-retro.jpg` — originelle, KI-generierte Retro-Gaming-Szene
  (CRT-TV, Arcade-Automat, Konsolen, Controller, Joystick, Würfel, Pixel-Herzen) exakt in
  der Markenpalette. Rein generisch — **keine** geschützten Figuren/Marken/Logos.
- **Verlauf-Overlay:** dunkler Tannengrün-Gradient (oben & unten stärker, Mitte transparent),
  damit der Titel lesbar bleibt und die Bildmitte sichtbar ist.
- **Titel:** Caveat-Kicker (leicht schräg) + Anton-`UPPERCASE`-H1, mit Textschatten.
- **Board-Pfad:** gepunktete Messing-Linie als Trenner zum Body.
- Header ist `min-height: 380px`, Bild `background-size: cover`.

Bild-Erzeugung lief über die **kie.ai 4o-Image-API** (`gpt4o-image/generate`, Seitenverhältnis 3:2),
danach mit `sips` zu JPEG (~430 KB) optimiert. Neues Motiv → gleiche Palette & Prompt-Regel
(„original/generisch, keine Marken") beibehalten.

## Icon-/Deko-Sprache

Kleinere Deko als Inline-**SVG** in den Markenfarben (keine Icon-Fonts). Motive aus der
analogen Spielwelt: Würfel, Spielfiguren, Spielbrett-Pfade, Funken. Das große Hero-Bild
ist die Ausnahme (Raster), muss aber der Palette folgen.

---

## Regeln beim Erweitern

1. **Nur Tokens verwenden** — Farben/Radien/Schatten aus `:root`, keine Magic-Values.
2. **Keine neuen Fonts** — Anton / Caveat / Inter genügen.
3. **Keine externen Assets/CDNs** — alles lokal, muss per `file://` laufen.
4. **`prefers-reduced-motion` immer respektieren.**
5. Header-Markup lebt im **Template in `build.js`**, nicht in `index.html`
   (die wird generiert). Nach Änderungen: `node build.js`.
