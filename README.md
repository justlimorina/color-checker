# 🎨 Limorina Color Checker

> **English** | [Tiếng Việt](README_vi.md)

A modern, professional-grade color analysis, theme generation, and palette workstation built with Material Design 3 and Material You dynamic theming principles. Fully installable as a Progressive Web App (PWA) with offline support. Create harmonized palettes, check WCAG & APCA accessibility, simulate color blindness, extract colors from images, and export production-ready code across 9 platforms — all directly in your browser.

---

## 🌟 Suite Overview

Limorina Color Checker is structured as a unified modular suite comprising 6 dedicated tools and a central hub:

| Tool | Route | Description |
|---|---|---|
| **Hub / Landing Page** | `/index.html` | Animated hero showcase and quick launchpad for all utilities. |
| **Generator & Palette** | `/generator/` | Multi-tab workstation: Single Color Checker, Project Palettes, Smart Harmonizer & History. |
| **Image Extractor** | `/image-extractor/` | Drag-and-drop image color extractor with draggable canvas pins and preset sliders. |
| **MD3 Theme Builder** | `/md3-theme-creator/` | Material Design 3 dynamic token generator with a 9-target multi-language Export Hub. |
| **Contrast Checker** | `/contrast-checker/` | Freestyle foreground/background contrast tester with WCAG 2.1 & APCA Lc scores. |
| **Contrast Matrix** | `/matrix/` | Cross-comparison matrix evaluating all saved palette colors against each other. |
| **CSS Gradient Generator** | `/css-gradient-generator/` | Visual linear & radial gradient creator with custom angles and instant CSS export. |

---

## ✨ Features by Module

### 1. 🎨 Generator & Palette Workstation (`/generator/`)
A 4-in-1 workspace equipped with tabbed navigation:

- **Tab 1: Single Color Checker & Mixer**
  - **Multi-Format Synchronized Input:** Real-time bi-directional conversion across **HEX**, **RGB** (0–255), **HSL** (0–360, 0–100%), **OKLCH** (Lightness, Chroma, Hue), and **Oklab** (L\*, a\*, b\*).
  - **Native EyeDropper:** Pick any color directly from your desktop screen via the browser EyeDropper API.
  - **Color Name Identification:** Instant nearest color matching powered by a curated subset of 4,900+ names from `color-name-list`.
  - **Color Code Outputs:** Quick copy cards for RGB, HSL, OKLCH, and **CMYK** (0–100%).
  - **Tints, Shades & Tones:** 9-step variation strips mixed with pure White (Tints), Black (Shades), and Neutral Grey (Tones).
  - **Color Harmonies:** Instant calculation for Complementary, Analogous, Triadic, Tetradic, and Monochromatic palettes.
  - **WCAG & APCA Contrast:** Live contrast validation on White and Black backgrounds featuring WCAG 2.1 AA/AAA compliance badges and W3C APCA Beta (Lc perceptual score).
  - **Best Text Color:** Automatic recommendation for optimal text legibility (White vs. Black).
  - **UI Prototype Preview:** Interactive mock UI with Primary Button, Tonal Button, Outline Button, Surface Card, and Typography preview. Includes an **Advanced Mode** toggle for a full mock application layout.
  - **Color Blindness Simulator:** Accurate matrix simulations for 4 common color vision deficiencies:
    - Protanopia (Red-blind)
    - Deuteranopia (Green-blind)
    - Tritanopia (Blue-blind)
    - Achromatopsia (Monochromacy / Total color blindness)
  - **Quick Actions:** Save to active palette, generate a shareable URL (`?color=HEX`), and export as a PNG palette strip.

- **Tab 2: Project Palettes Manager**
  - **Multi-Project Organization:** Create, rename, delete, and switch between named color projects persisted in `localStorage`.
  - **Swatches Management:** Add, inspect, copy, or remove swatches in your active project.
  - **GPL Palette Export:** Export palette files (`.gpl`) compatible with GIMP, Inkscape, and Adobe Photoshop.
  - **JSON Backup & Restore:** Export project data as structured JSON or import existing JSON palette files.
  - **Shareable Palette Link:** Generate sharable URLs encoded with palette colors (`?palette=HEX1,HEX2...`).

- **Tab 3: Smart Palette Generator**
  - Generate cohesive 5-color palettes using 6 harmony rules: **Complementary**, **Analogous**, **Triadic**, **Tetradic**, **Monochromatic**, and **Freestyle (Random)**.
  - **Color Locking:** Independently lock/unlock individual swatches to anchor desired colors while randomizing the rest.
  - One-click action to set any generated swatch as the active color or save the whole 5-color set to your project.

- **Tab 4: Color History**
  - Automatically records recently explored colors into a visual grid with one-click cleanup.

---

### 2. 🖼️ Interactive Image Extractor (`/image-extractor/`)
- **Drag-and-Drop / File Upload:** Drop image files directly onto the drop zone or browse your local storage.
- **Interactive Canvas Pinning:** Color extraction markers (pins) render directly over the image canvas. Drag pins anywhere on the image to resample specific colors in real time.
- **Palette Presets Slider:** Switch algorithmic color extraction modes on the fly:
  - *Muted*
  - *Soft*
  - *Pastel*
  - *Vibrant*
  - *Balanced*
- **Dynamic Swatch Count:** Dynamically add (`+`) or remove (`-`) color sampling pins.
- **Export Extracted Palette:** Export your extracted image palette as a formatted PNG color strip or copy hex values.

---

### 3. 🎨 Material Design 3 Theme Builder & Export Hub (`/md3-theme-creator/`)
- **Full MD3 Token Generation:** Computes a full suite of standard Material Design 3 color tokens (Primary, Secondary, Tertiary, Surface, Surface Containers Lowest–Highest, Outline, Error, and all associated On-colors) using the official `@material/material-color-utilities` HCT algorithm.
- **Responsive Token Grid:** Visualizes token relationships with live background and text contrast pairs.
- **Production Export Hub:** 9 export targets with syntax-highlighted preview, line counts, one-click copy, and file download:
  1. **CSS Variables (`theme.css`):** Ready-to-use `:root` custom properties.
  2. **Tailwind CSS v4 (`theme.tailwind.css`):** `@theme` block utilizing OKLCH color values.
  3. **Figma Tokens (`tokens.json`):** W3C Design Tokens Community Group (DTCG) standard format.
  4. **Flutter (`app_theme.dart`):** Dart `ColorScheme.fromSeed` and `ThemeData` setup.
  5. **SCSS (`_colors.scss`):** Sass `$brand-color` map and individual color variables.
  6. **Android (`colors.xml`):** Android XML color resources alongside Jetpack Compose Kotlin color definitions.
  7. **SwiftUI (`AppTheme.swift`):** Swift `Color` struct extensions with normalized RGB scaling.
  8. **JSON (`palette.json`):** Comprehensive JSON object with all color spaces and shade mappings.
  9. **Python (`theme_colors.py`):** Programmatic theme reconstruction snippet using `materialyoucolor`.

---

### 4. ♿ Custom Contrast Checker (`/contrast-checker/`)
- **Freestyle Pairings:** Test any foreground text color against any background color.
- **Integrated EyeDroppers:** Sample screen colors directly into background or foreground inputs.
- **Quick Swap:** One-click button (`sync_alt`) to invert foreground and background colors.
- **Dual Accessibility Standards:**
  - **WCAG 2.1:** Contrast ratio calculation with AA / AAA compliance badges for both Normal and Large text.
  - **W3C APCA Beta (Lc Score):** Perceptually uniform contrast scoring with visual Pass/Fail badges.

---

### 5. 📊 Contrast Matrix (`/matrix/`)
- **Full Palette Cross-Comparison:** Automatically generates an N×N matrix table comparing all colors in your active project palette against each other, as well as against pure White and Black.
- **Dual View Modes:** Toggle seamlessly between **WCAG 2.1 ratios** and **APCA (Lc) scores**.
- **Visual Accessibility Badges:** Color-coded pass/fail badges for rapid audit of entire design system palettes.

---

### 6. 🌈 CSS Gradient Generator (`/css-gradient-generator/`)
- **Gradient Types:** Seamlessly switch between **Linear** and **Radial** gradients.
- **Angle Controller:** 0° to 360° interactive slider with real-time numeric degree readout.
- **Dual Color Controls:** Edit gradient stop colors via HEX inputs, native color pickers, or desktop eyedroppers.
- **Live Preview & Copy:** Real-time CSS gradient preview with single-click CSS rule copy (`background: linear-gradient(...)`).

---

### 📱 Responsive Shell & Layout Architecture
- **Desktop Navigation Rail:** Clean, collapsible side rail featuring icon shortcuts, dynamic active states, and quick tooltips.
- **Mobile Top App Bar & Drawer:** Modal Navigation Drawer with backdrop blur (`backdrop-filter`) and smooth transition animations.
- **Mobile Bottom Navigation Bar:** Compact icon-only bottom navigation designed for thumb-friendly mobile navigation.
- **Dynamic Theme Engine:** Real-time Material You dynamic theming that retints the entire interface (navigation, surfaces, buttons, highlights) to match the active primary color in both Light and Dark modes.
- **User Guide Modal:** Built-in cheat sheet explaining color formats (HEX, RGB, HSL, OKLCH, LAB), variations (Tints, Shades, Tones), and WCAG compliance standards.
- **Multi-Language Support:** Instant runtime language switching across 4 languages:
  - 🇬🇧 English
  - 🇻🇳 Tiếng Việt
  - 🇯🇵 日本語
  - 🇨🇳 简体中文
- **Progressive Web App (PWA):** Installable to homescreen/desktop, offline-capable via Service Worker caching (`sw.js`), and synchronized with system status bar colors.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | Semantic HTML5 & Multi-Page Modular Architecture |
| **Styling** | Vanilla CSS3 with Material Design 3 Design Tokens & Typography Hierarchy |
| **Logic** | Vanilla JavaScript (ES Modules, ES2020+) |
| **Color Science** | Official `@material/material-color-utilities` (HCT Color Space) |
| **Components** | Official `@material/web` Web Components |
| **Accessibility Engines** | WCAG 2.1 relative luminance & W3C APCA Beta 0.1.9 algorithms |
| **Screen Color Sampling** | Native Browser EyeDropper API |
| **Offline & PWA** | Service Worker (`sw.js`) & Web App Manifest (`manifest.json`) |
| **Typography** | Google Fonts (*Roboto*, *Roboto Slab*, *Roboto Mono*, *Material Symbols Rounded*) |

---

## 📂 Project Structure

```
color-checker/
├── index.html                  # Landing page & tool hub
├── CNAME                       # Custom domain routing
├── LICENSE                     # MIT License
├── manifest.json               # Web App Manifest for PWA installation
├── sw.js                       # Service Worker for offline asset caching
├── README.md                   # English documentation (this file)
├── README_vi.md                # Vietnamese documentation
├── generator/                  # Generator & Palette Workstation
│   ├── index.html              # Multi-tab layout (Single, Projects, Smart, History)
│   └── script.js               # Color mixer, harmonies, WCAG, and UI preview logic
├── image-extractor/            # Image Palette Extractor
│   ├── index.html              # Image drop-zone & canvas workspace
│   └── script.js               # Interactive canvas pins & extraction presets
├── md3-theme-creator/          # Material Design 3 Theme Builder
│   ├── index.html              # Token grid & Export Hub interface
│   └── script.js               # HCT token generator & 9 export templates
├── contrast-checker/           # Custom Contrast Checker
│   ├── index.html              # Freestyle foreground/background tester
│   └── script.js               # Live WCAG 2.1 & APCA scoring logic
├── matrix/                     # Contrast Matrix Cross-Comparison
│   ├── index.html              # Matrix table layout with mode toggle
│   └── script.js               # Matrix calculation engine (WCAG & APCA)
├── css-gradient-generator/     # CSS Gradient Generator
│   ├── index.html              # Linear & radial gradient designer
│   └── script.js               # Gradient angle slider & CSS code generator
└── assets/                     # Shared static resources
    ├── images/                 # SVG logos and icons
    │   ├── amelia_logo.svg     # Favicon & brand mark
    │   ├── logo-black.svg      # Navigation logo (light theme)
    │   └── logo-white.svg      # Navigation logo (dark theme)
    ├── styles.css              # Global MD3 design tokens, components & responsive styles
    └── script/                 # Shared JavaScript modules
        ├── config.js           # Multi-language localization dictionaries (EN, VI, JA, ZH)
        ├── colornames.bestof.js# Curated 4,900+ color names dataset
        ├── projects.js         # Multi-project manager, GPL/JSON import/export, URL sharing
        ├── utils.js            # Color math (HEX, RGB, HSL, CMYK, OKLCH, OKLab, WCAG, APCA)
        └── shared/
            └── layout.js       # Responsive shell (Nav Rail, Drawer, Bottom Nav, Theming)
```

---

## 🖥️ Getting Started

### Local Development

Because the project utilizes native ES Modules (`import`/`export`) and Web Components, run it through a local HTTP server:

```bash
# 1. Clone the repository
git clone https://github.com/justlimorina/color-checker.git
cd color-checker

# 2. Start a local server (choose any option below)
# Option A: Python 3
python3 -m http.server 5500

# Option B: Node.js (npx serve)
npx serve .

# Option C: VS Code Live Server extension
# Right-click index.html -> "Open with Live Server"

# 3. Open in browser
# Navigate to http://localhost:5500
```

> [!NOTE]
> Opening `index.html` directly via `file:///` protocol may cause browser security policies (CORS) to block ES Module imports and Web Component assets. Always serve via `http://` or `https://`.

---

## 🔗 URL Parameters & Integration

You can deep-link into the application and share specific color states using URL parameters:

- **Single Color:**  
  `https://justlimorina.github.io/color-checker/generator/?color=624E9A`
- **Shared Palette:**  
  `https://justlimorina.github.io/color-checker/generator/?palette=624E9A,EADDFF,381E72,49454F,CAC4D0`

---

## 📣 Third-Party Attributions

- **[color-name-list](https://github.com/meodai/color-names):** Curated `bestOf` color dataset by David Aerne ([@meodai](https://github.com/meodai)) under the [MIT License](https://github.com/meodai/color-names/blob/master/LICENSE).
- **[@material/material-color-utilities](https://github.com/material-foundation/material-color-utilities):** Official Google Material Design 3 HCT color algorithms under the Apache-2.0 License.
- **[@material/web](https://github.com/material-components/material-web):** Google Material Design 3 Web Components under the Apache-2.0 License.
- **[APCA (Advanced Perceptual Contrast Algorithm)](https://github.com/Myndex/apca-w3):** W3C Silver/WCAG3 perceptual contrast algorithm by Andrew Somers (Myndex Research).

---

## ⚖️ License

Released under the **[MIT License](LICENSE)**.  
&copy; 2024 – Present **Limorina**. All rights reserved.
