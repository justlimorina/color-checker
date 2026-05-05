# 🎨 Limorina Color Checker

> **English** | [Tiếng Việt](README_vi.md)

A professional-grade color analysis and design tool built with Material Design 3. Analyze colors, check accessibility, simulate color blindness, and export palettes — all in your browser, no installation required.

---

## ✨ Features

### 🖌️ Color Input & Mixer
- **HEX input** with live color picker
- **RGB inputs** (0–255) synchronized in real time
- **HSL inputs** (H: 0–360, S/L: 0–100%) synchronized in real time
- All input formats update each other automatically

### 🏷️ Color Name Identification
- Automatically identifies the nearest named color (e.g. *"Butterfly Bush"*, *"Deep Indigo"*)
- Powered by the **ntc.js** Name That Color library (2,500+ named colors)

### 🌈 Tints, Shades & Tones
- 9-step gradients mixed with **White** (Tints), **Black** (Shades), and **Grey** (Tones)
- Scrollable row with a styled scrollbar; click any swatch to select that color

### 🎼 Color Harmonies
- **Complementary**, **Analogous**, **Triadic**, **Tetradic**, **Monochromatic**
- Click any harmony swatch to instantly switch to that color

### ♿ WCAG Accessibility
- Contrast ratios against **White** and **Black** backgrounds
- **AA Large**, **AA Normal**, and **AAA** pass/fail badges
- Automatic **Best Text Color** recommendation (White or Black)

### 👁️ Color Blindness Simulator
- Simulates 4 types of color vision deficiency using transformation matrices:
  - Protanopia (no red)
  - Deuteranopia (no green)
  - Tritanopia (no blue)
  - Achromatopsia (total color blindness)

### 🖥️ UI Prototype Preview
- See how your color looks on real UI components:
  - Solid & Outline buttons
  - Surface cards
  - Body and heading text

### 💾 Saved Palette
- Save up to **10 colors** to a local palette
- Click a saved swatch to load it; remove individual colors
- Palette persists across browser sessions via `localStorage`

### 🖼️ Export Palette Image
- Generate and download a **PNG image** of your main color + up to 5 saved palette colors, including hex codes and color name

### 📤 Export Hub
- Export color data as:
  - **CSS custom properties** (`:root` variables)
  - **Tailwind v4** `@theme` block using OKLCH values
  - **JSON** object with all color formats

### 🌐 Multi-language Support
- Floating language menu with 4 languages:
  - 🇬🇧 English
  - 🇻🇳 Tiếng Việt
  - 🇯🇵 日本語
  - 🇨🇳 简体中文
- Language preference saved automatically

### 🌙 Dark Mode
- Full Material Design 3 dark theme toggle

---

## 🖥️ Getting Started

No build step required. Simply open `index.html` in any modern browser.

```bash
git clone https://github.com/justlimorina/color-checker.git
cd color-checker
# Open index.html in your browser
```

Or serve locally:
```bash
python3 -m http.server 5500
# Then visit http://localhost:5500
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Logic | Vanilla JavaScript (ES2020+) |
| Styling | Vanilla CSS with MD3 design tokens |
| Design System | Material Design 3 |
| Fonts | Google Fonts (Outfit, Roboto) |
| Icons | Material Symbols Outlined |

---

## 📂 Project Structure

```
color-checker/
├── index.html        # Application shell & layout
├── app.js            # All logic: state, rendering, i18n, events
├── styles.css        # MD3 design system & component styles
├── ntc.js            # Third-party: Name That Color library
├── LICENSE           # CC BY 4.0
├── README.md         # This file (English)
└── README_vi.md      # Vietnamese README
```

---

## ⚖️ License

This project is released under the **Creative Commons Attribution 4.0 International (CC BY 4.0)**.  
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
