import { ColorUtils } from '../assets/script/utils.js';
import { translations } from '../assets/script/config.js';
import { initLayout, layoutState, applyColorTheme } from '../assets/script/shared/layout.js';

const state = {
    hex: localStorage.getItem('active_hex') || "624E9A",
    rgb: {},
    hsl: {},
    palette: JSON.parse(localStorage.getItem('saved_palette') || '[]'),
};

const dom = {};

document.addEventListener('DOMContentLoaded', () => {
    initLayout('theme');
    
    // Resolve states
    state.rgb = ColorUtils.hexToRgb(state.hex);
    state.hsl = ColorUtils.rgbToHsl(state.rgb.r, state.rgb.g, state.rgb.b);

    bindDOM();
    attachEvents();

    renderAll();
});

// Watch language changes from shared layout
window.addEventListener('langchange', () => {
    renderAll();
});

function bindDOM() {
    Object.assign(dom, {
        grid: document.getElementById('theme-colors-grid'),
        exportTabs: document.getElementById('export-tabs'),
        copyExportBtn: document.getElementById('copy-export'),
        toast: document.getElementById('toast')
    });
}

function attachEvents() {
    // Export Hub Tabs
    if (dom.exportTabs) {
        dom.exportTabs.addEventListener('change', () => {
            const activeTab = dom.exportTabs.activeTab;
            const tabName = activeTab ? activeTab.getAttribute('data-tab') : 'css';
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = content.id === `export-content-${tabName}` ? 'block' : 'none';
            });
        });
    }

    // Export Hub Copy Active Template
    if (dom.copyExportBtn) {
        dom.copyExportBtn.addEventListener('click', () => {
            const activeTab = dom.exportTabs.activeTab;
            const tabName = activeTab ? activeTab.getAttribute('data-tab') : 'css';
            const codeEl = document.getElementById(`code-${tabName}`);
            if (codeEl) {
                navigator.clipboard.writeText(codeEl.textContent).then(showToast);
            }
        });
    }
}

function renderAll() {
    updateDynamicTheme();
    renderThemeBuilder();
    updateExportContent();
}

function updateDynamicTheme() {
    applyColorTheme(state.hex);
}

function renderThemeBuilder() {
    if (!dom.grid) return;
    
    const tokenPairs = [
        { bg: '--md-sys-color-primary', fg: '--md-sys-color-on-primary' },
        { bg: '--md-sys-color-on-primary', fg: '--md-sys-color-primary' },
        { bg: '--md-sys-color-primary-container', fg: '--md-sys-color-on-primary-container' },
        { bg: '--md-sys-color-on-primary-container', fg: '--md-sys-color-primary-container' },
        { bg: '--md-sys-color-secondary', fg: '--md-sys-color-on-secondary' },
        { bg: '--md-sys-color-on-secondary', fg: '--md-sys-color-secondary' },
        { bg: '--md-sys-color-secondary-container', fg: '--md-sys-color-on-secondary-container' },
        { bg: '--md-sys-color-on-secondary-container', fg: '--md-sys-color-secondary-container' },
        { bg: '--md-sys-color-tertiary', fg: '--md-sys-color-on-tertiary' },
        { bg: '--md-sys-color-on-tertiary', fg: '--md-sys-color-tertiary' },
        { bg: '--md-sys-color-tertiary-container', fg: '--md-sys-color-on-tertiary-container' },
        { bg: '--md-sys-color-on-tertiary-container', fg: '--md-sys-color-tertiary-container' },
        { bg: '--md-sys-color-error', fg: '--md-sys-color-on-error' },
        { bg: '--md-sys-color-on-error', fg: '--md-sys-color-error' },
        { bg: '--md-sys-color-error-container', fg: '--md-sys-color-on-error-container' },
        { bg: '--md-sys-color-on-error-container', fg: '--md-sys-color-error-container' },
        { bg: '--md-sys-color-background', fg: '--md-sys-color-on-background' },
        { bg: '--md-sys-color-on-background', fg: '--md-sys-color-background' },
        { bg: '--md-sys-color-surface', fg: '--md-sys-color-on-surface' },
        { bg: '--md-sys-color-on-surface', fg: '--md-sys-color-surface' },
        { bg: '--md-sys-color-surface-variant', fg: '--md-sys-color-on-surface-variant' },
        { bg: '--md-sys-color-on-surface-variant', fg: '--md-sys-color-surface-variant' },
        { bg: '--md-sys-color-outline', fg: '--md-sys-color-surface' },
        { bg: '--md-sys-color-outline-variant', fg: '--md-sys-color-on-surface' },
        { bg: '--md-sys-color-inverse-surface', fg: '--md-sys-color-inverse-on-surface' },
        { bg: '--md-sys-color-inverse-on-surface', fg: '--md-sys-color-inverse-surface' },
        { bg: '--md-sys-color-inverse-primary', fg: '--md-sys-color-primary' },
        { bg: '--md-sys-color-surface-container-lowest', fg: '--md-sys-color-on-surface' },
        { bg: '--md-sys-color-surface-container-low', fg: '--md-sys-color-on-surface' },
        { bg: '--md-sys-color-surface-container', fg: '--md-sys-color-on-surface' },
        { bg: '--md-sys-color-surface-container-high', fg: '--md-sys-color-on-surface' },
        { bg: '--md-sys-color-surface-container-highest', fg: '--md-sys-color-on-surface' }
    ];
    
    dom.grid.innerHTML = '';
    
    tokenPairs.forEach(pair => {
        const computed = window.getComputedStyle(document.documentElement);
        let val = computed.getPropertyValue(pair.bg).trim();
        if(!val) return;
        
        const item = document.createElement('div');
        item.style.backgroundColor = `var(${pair.bg})`;
        item.style.color = `var(${pair.fg})`;
        item.style.padding = '12px';
        item.style.borderRadius = '16px';
        item.style.border = '1px solid rgba(128,128,128,0.2)';
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.justifyContent = 'space-between';
        item.style.height = '110px';
        item.title = `${pair.bg}: ${val}`;
        
        const nameSpan = document.createElement('span');
        nameSpan.style.fontSize = '12px';
        nameSpan.style.fontWeight = '700';
        nameSpan.style.wordBreak = 'break-word';
        nameSpan.textContent = pair.bg.replace('--md-sys-color-', '');
        
        const valSpan = document.createElement('span');
        valSpan.style.fontSize = '11px';
        valSpan.style.opacity = '0.8';
        valSpan.textContent = val;
        
        item.appendChild(nameSpan);
        item.appendChild(valSpan);
        
        dom.grid.appendChild(item);
    });
}

function updateExportContent() {
    const weights = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    const tints = weights.map(w => ColorUtils.rgbToHex(...Object.values(ColorUtils.mixColors(state.rgb, {r:255,g:255,b:255}, w))));
    const shades = weights.map(w => ColorUtils.rgbToHex(...Object.values(ColorUtils.mixColors(state.rgb, {r:0,g:0,b:0}, w))));

    // CSS
    let css = `:root {\n  --primary: #${state.hex};\n`;
    tints.forEach((h, i) => css += `  --primary-tint-${(i+1)*10}: #${h};\n`);
    shades.forEach((h, i) => css += `  --primary-shade-${(i+1)*10}: #${h};\n`);
    css += `\n  /* Material Design 3 Theme Colors */\n`;
    
    const computed = window.getComputedStyle(document.documentElement);
    const tokenPairs = [
        '--md-sys-color-primary', '--md-sys-color-on-primary',
        '--md-sys-color-primary-container', '--md-sys-color-on-primary-container',
        '--md-sys-color-secondary', '--md-sys-color-on-secondary',
        '--md-sys-color-secondary-container', '--md-sys-color-on-secondary-container',
        '--md-sys-color-tertiary', '--md-sys-color-on-tertiary',
        '--md-sys-color-tertiary-container', '--md-sys-color-on-tertiary-container',
        '--md-sys-color-error', '--md-sys-color-on-error',
        '--md-sys-color-error-container', '--md-sys-color-on-error-container',
        '--md-sys-color-background', '--md-sys-color-on-background',
        '--md-sys-color-surface', '--md-sys-color-on-surface',
        '--md-sys-color-surface-variant', '--md-sys-color-on-surface-variant',
        '--md-sys-color-outline', '--md-sys-color-outline-variant',
        '--md-sys-color-inverse-surface', '--md-sys-color-inverse-on-surface',
        '--md-sys-color-inverse-primary'
    ];
    tokenPairs.forEach(t => {
        css += `  ${t}: ${computed.getPropertyValue(t).trim()};\n`;
    });
    css += `}`;
    const cssCodeEl = document.getElementById('code-css');
    if (cssCodeEl) cssCodeEl.textContent = css;

    // Tailwind
    let tailwind = `@theme {\n  --color-brand: #${state.hex};\n`;
    tints.forEach((h, i) => tailwind += `  --color-brand-tint-${(i+1)*10}: #${h};\n`);
    shades.forEach((h, i) => tailwind += `  --color-brand-shade-${(i+1)*10}: #${h};\n`);
    tailwind += `}`;
    const twCodeEl = document.getElementById('code-tailwind');
    if (twCodeEl) twCodeEl.textContent = tailwind;

    // Figma Tokens (W3C Standard)
    const figmaTokens = {
        color: {
            brand: {
                base: { "$value": `#${state.hex}`, "$type": "color" },
                tints: Object.fromEntries(tints.map((h, i) => [`tint-${(i+1)*10}`, { "$value": `#${h}`, "$type": "color" }])),
                shades: Object.fromEntries(shades.map((h, i) => [`shade-${(i+1)*10}`, { "$value": `#${h}`, "$type": "color" }]))
            }
        }
    };
    const figmaCodeEl = document.getElementById('code-figma');
    if (figmaCodeEl) figmaCodeEl.textContent = JSON.stringify(figmaTokens, null, 2);

    // Flutter / Dart
    let flutter = `import 'package:flutter/material.dart';\n\nclass AppTheme {\n  static const Color primarySeed = Color(0xFF${state.hex});\n\n  static final ColorScheme lightColorScheme = ColorScheme.fromSeed(\n    seedColor: primarySeed,\n    brightness: Brightness.light,\n  );\n\n  static final ColorScheme darkColorScheme = ColorScheme.fromSeed(\n    seedColor: primarySeed,\n    brightness: Brightness.dark,\n  );\n}\n`;
    const flutterCodeEl = document.getElementById('code-flutter');
    if (flutterCodeEl) flutterCodeEl.textContent = flutter;

    // SCSS Map
    let scss = `$brand-color: (\n  base: #${state.hex},\n  tints: (\n`;
    tints.forEach((h, i) => scss += `    ${(i+1)*10}: #${h},\n`);
    scss += `  ),\n  shades: (\n`;
    shades.forEach((h, i) => scss += `    ${(i+1)*10}: #${h},\n`);
    scss += `  )\n);`;
    const scssCodeEl = document.getElementById('code-scss');
    if (scssCodeEl) scssCodeEl.textContent = scss;

    // Android XML
    let android = `<!-- res/values/colors.xml -->\n<resources>\n  <color name="brand_color">#FF${state.hex}</color>\n`;
    tints.forEach((h, i) => android += `  <color name="brand_color_tint_${(i+1)*10}">#FF${h}</color>\n`);
    shades.forEach((h, i) => android += `  <color name="brand_color_shade_${(i+1)*10}">#FF${h}</color>\n`);
    android += `</resources>\n\n// Jetpack Compose Kotlin Colors\nimport androidx.compose.ui.graphics.Color\n\nobject BrandColors {\n  val Base = Color(0xFF${state.hex})\n`;
    tints.forEach((h, i) => android += `  val Tint${(i+1)*10} = Color(0xFF${h})\n`);
    shades.forEach((h, i) => android += `  val Shade${(i+1)*10} = Color(0xFF${h})\n`);
    android += `}`;
    const androidCodeEl = document.getElementById('code-android');
    if (androidCodeEl) androidCodeEl.textContent = android;

    // SwiftUI
    const hexToSwiftColor = (hexStr) => {
        const rgb = ColorUtils.hexToRgb(hexStr);
        return `Color(red: ${(rgb.r / 255).toFixed(3)}, green: ${(rgb.g / 255).toFixed(3)}, blue: ${(rgb.b / 255).toFixed(3)})`;
    };
    let swift = `// SwiftUI Color Extension\nimport SwiftUI\n\nextension Color {\n  static let brandColor = ${hexToSwiftColor(state.hex)} // #${state.hex}\n\n  struct BrandTints {\n`;
    tints.forEach((h, i) => swift += `    static let tint${(i+1)*10} = ${hexToSwiftColor(h)} // #${h}\n`);
    swift += `  }\n\n  struct BrandShades {\n`;
    shades.forEach((h, i) => swift += `    static let shade${(i+1)*10} = ${hexToSwiftColor(h)} // #${h}\n`);
    swift += `  }\n}`;
    const swiftCodeEl = document.getElementById('code-swiftui');
    if (swiftCodeEl) swiftCodeEl.textContent = swift;

    // JSON
    const data = {
        hex: state.hex,
        rgb: state.rgb,
        hsl: state.hsl,
        name: ColorUtils.getColorName(state.hex),
        tints: tints.map(h => `#${h}`),
        shades: shades.map(h => `#${h}`)
    };
    const jsonCodeEl = document.getElementById('code-json');
    if (jsonCodeEl) jsonCodeEl.textContent = JSON.stringify(data, null, 2);

    // Python
    const pythonCode = `# Code template for materialyoucolor-python\n# Install: pip install materialyoucolor\n\nfrom materialyoucolor.theme import Theme\nfrom materialyoucolor.rgba import RGBA\n\n# Initialize dynamic theme using active color: #${state.hex}\ntheme = Theme(RGBA(${state.rgb.r}, ${state.rgb.g}, ${state.rgb.b}, 255))\n\n# Retrieve dynamic colors for Light & Dark schemes\nlight = theme.schemes.light\ndark = theme.schemes.dark\n\nprint("=== LIGHT SYSTEM COLORS ===")\nprint(f"Primary:           {light.primary}")\nprint(f"On Primary:        {light.onPrimary}")\nprint(f"Primary Container: {light.primaryContainer}")\nprint(f"Surface:           {light.surface}")\n\nprint("\\n=== DARK SYSTEM COLORS ===")\nprint(f"Primary:           {dark.primary}")\nprint(f"On Primary:        {dark.onPrimary}")\nprint(f"Primary Container: {dark.primaryContainer}")\nprint(f"Surface:           {dark.surface}")\n`;
    const pythonCodeEl = document.getElementById('code-python');
    if (pythonCodeEl) pythonCodeEl.textContent = pythonCode;
}

function showToast() {
    if (!dom.toast) return;
    dom.toast.textContent = translations[layoutState.currentLang].copied || 'Copied!';
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2000);
}
