# 🎨 Limorina Color Checker

> **English** | [Tiếng Việt](README_vi.md)

A professional-grade color analysis and design tool built with Material Design 3 and Material You dynamic theming principles. Analyze colors, check accessibility, simulate color blindness, and export palettes — all in your browser, no installation required.

---

## ✨ Features

### 🖌️ Color Input & Mixer
- **HEX input** with live color picker.
- **RGB inputs** (0–255) and **HSL inputs** (H: 0–360, S/L: 0–100%) synchronized in real time.
- **Modern Color Spaces:** Direct input and real-time synchronization for **OKLCH** and **LAB** color spaces.
- All input formats update each other automatically.

### 🎭 Dynamic Theme Tinting (Material You)
- **Contextual Light Mode:** Subtly tints all background surfaces (`surface`, `surface-container-low/high/highest`) and active buttons (`secondary-container`) using a micro-blend (2% - 15%) of the selected primary color.
- **Vibrant Dark Mode:** Tinted dark surfaces and active containers create an elegant, glowing, uniform aesthetic.
- **Interactive SVG Logo:** A beautifully curved 8-pointed star in the header dynamically changes its color to match the selected theme and rotates 45° on hover.

### 🏷️ Color Name Identification
- Automatically identifies the nearest named color (e.g. *"Butterfly Bush"*, *"Deep Indigo"*) using the **ntc.js** Name That Color library (2,500+ named colors).

### 🌈 Tints, Shades & Tones
- 9-step gradients mixed with **White** (Tints), **Black** (Shades), and **Grey** (Tones).
- **Responsive Layout:** Automatically displays as a swipeable row on desktop, and transitions into a clean 5-column grid wrap on mobile to fit the viewport perfectly.

### 🎼 Color Harmonies
- **Complementary**, **Analogous**, **Triadic**, **Tetradic**, **Monochromatic**.
- Click any harmony swatch to instantly switch to that color.

### ♿ WCAG Accessibility & Freestyle Contrast
- Contrast ratios against **White** and **Black** backgrounds.
- **Freestyle Contrast Page:** A standalone page to analyze contrast between custom foreground and background colors with WCAG pass/fail badges.
- Automatic **Best Text Color** recommendation (White or Black).

### 👁️ Color Blindness Simulator
- Simulates 4 types of color vision deficiency using transformation matrices:
  - Protanopia (no red)
  - Deuteranopia (no green)
  - Tritanopia (no blue)
  - Achromatopsia (total color blindness)

### 🖥️ UI Prototype Preview & Advanced View
- See how your color looks on real UI components (Solid & Outline buttons, Surface cards, Typography).
- **Advanced Mode:** Toggle to inspect your theme in a comprehensive mock interface layout.

### 💾 Saved Palette & History
- **Saved Palette:** Save up to **10 colors** persisted via `localStorage`.
- **Color History Page:** Automatically tracks and displays recently browsed colors in a dedicated history grid.

### 🖼️ Simplified Palette Image Export
- Exports a clean, horizontal color strip (palette strip) with clearly labeled HEX values below each swatch, adjusting its width dynamically based on your palette size.

### 📤 Export Hub
- Export color data as:
  - **CSS custom properties** (`:root` variables)
  - **Tailwind v4** `@theme` block using OKLCH values
  - **JSON** object with all color formats

### 🌐 Multi-language Support
- Floating language menu supporting:
  - 🇬🇧 English | 🇻🇳 Tiếng Việt | 🇯🇵 日本語 | 🇨🇳 简体中文

### 📱 100% Mobile Optimized (Boxed Layout)
- Zero horizontal overflow (`overflow-x: hidden`). All layout containers dynamically stack on smaller viewports.
- **Logo Transition:** The header text automatically hides on mobile screens, leaving the dynamic SVG star logo as the sole brand anchor.
- **Sidebar Backdrop:** A beautiful modal Navigation Drawer on mobile with a blurred backdrop overlay.

---

## 🖥️ Getting Started

Simply open `index.html` in any modern browser.

```bash
git clone https://github.com/justlimorina/color-checker.git
cd color-checker
# Open index.html in your browser
```

Or serve locally to allow ESM imports:
```bash
python3 -m http.server 5500
# Then visit http://localhost:5500
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Logic | Modular Vanilla JavaScript (ES2020+) |
| Styling | Vanilla CSS with MD3 design tokens |
| Design System | Material Design 3 (Material You Dynamic Theme) |
| Logo | Embedded SVG (Vector Path) |

---

## 📂 Project Structure

The project uses a highly modular and organized structure:

```
color-checker/
├── index.html            # Application shell & SPA page wrappers
├── LICENSE               # CC BY 4.0
├── README.md             # English README
├── README_vi.md          # Vietnamese README
└── assets/               # Assets directory
    ├── logo.svg          # 8-pointed star SVG file
    ├── styles.css        # CSS variable tokens & layout styling
    └── script/           # Modular JS scripts
        ├── app.js        # Core app initialization & state controller
        ├── config.js     # Shared configuration (e.g., translation data)
        ├── events.js     # DOM event listeners
        ├── features.js   # Contrast checker & advanced preview logic
        ├── navigation.js # SPA router and sidebar navigation
        ├── ntc.js        # Third-party: Name That Color library
        ├── sidebar.js    # Sidebar Drawer toggle logic
        ├── state.js      # Global state variables & DOM cache
        ├── ui.js         # UI updates, image exporter, & dynamic tinting
        └── utils.js      # Color conversions & accessibility formulas
```

---

## ⚖️ License

Released under the **Creative Commons Attribution 4.0 International (CC BY 4.0)**.  
See [LICENSE](LICENSE) for the full text.

---

## 📣 Third-Party Attributions

### ntc.js — Name That Color
- **Author:** Chirag Mehta — [http://chir.ag/projects/ntc](http://chir.ag/projects/ntc)
- **License:** [Creative Commons Attribution 2.5](https://creativecommons.org/licenses/by/2.5/)
- **Usage:** Used to identify the nearest human-readable name for any RGB color value. The original copyright header is preserved in `ntc.js` as required.

> Per the Creative Commons Attribution 2.5 license, credit must be given to the original creator. This notice fulfills that requirement.

---

## 🙏 Acknowledgements

- [Material Design 3](https://m3.material.io/) — Design system guidelines
- [Google Fonts](https://fonts.google.com/) — Outfit & Roboto typefaces
- [Material Symbols](https://fonts.google.com/icons) — Icon set
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) — Accessibility contrast standards
- [OKLCH color space](https://oklch.com/) — Perceptually uniform color for Tailwind v4 export
