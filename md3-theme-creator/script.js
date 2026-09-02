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

// Watch language & theme mode changes from shared layout
window.addEventListener('langchange', () => {
    renderAll();
});

window.addEventListener('themechange', () => {
    renderAll();
});

const FORMAT_META = {
    css: {
        filename: 'theme.css',
        badge: 'CSS',
        icon: 'css',
        mime: 'text/css'
    },
    tailwind: {
        filename: 'theme.tailwind.css',
        badge: 'Tailwind v4',
        icon: 'style',
        mime: 'text/css'
    },
    figma: {
        filename: 'tokens.json',
        badge: 'Figma W3C',
        icon: 'token',
        mime: 'application/json'
    },
    flutter: {
        filename: 'app_theme.dart',
        badge: 'Flutter',
        icon: 'smartphone',
        mime: 'text/plain'
    },
    scss: {
        filename: '_colors.scss',
        badge: 'SCSS',
        icon: 'code',
        mime: 'text/x-scss'
    },
    android: {
        filename: 'colors.xml',
        badge: 'Android',
        icon: 'android',
        mime: 'application/xml'
    },
    swiftui: {
        filename: 'AppTheme.swift',
        badge: 'SwiftUI',
        icon: 'phone_iphone',
        mime: 'text/plain'
    },
    json: {
        filename: 'palette.json',
        badge: 'JSON',
        icon: 'data_object',
        mime: 'application/json'
    },
    python: {
        filename: 'theme_colors.py',
        badge: 'Python',
        icon: 'terminal',
        mime: 'text/x-python'
    }
};

function bindDOM() {
    Object.assign(dom, {
        grid: document.getElementById('theme-colors-grid'),
        exportSelect: document.getElementById('export-format-select'),
        downloadExportBtn: document.getElementById('download-export-btn'),
        copyExportBtn: document.getElementById('copy-export'),
        exportHeaderIcon: document.getElementById('export-header-icon'),
        exportFilenameBadge: document.getElementById('export-filename-badge'),
        exportFormatBadge: document.getElementById('export-format-badge'),
        exportLineCount: document.getElementById('export-line-count'),
        toast: document.getElementById('toast')
    });
}

function attachEvents() {
    // Export Hub Floating Select
    if (dom.exportSelect) {
        dom.exportSelect.addEventListener('change', () => {
            const format = dom.exportSelect.value || 'css';
            switchExportFormat(format);
        });
    }

    // Export Download Button
    if (dom.downloadExportBtn) {
        dom.downloadExportBtn.addEventListener('click', downloadExportFile);
    }

    // Export Hub Copy Active Template
    if (dom.copyExportBtn) {
        dom.copyExportBtn.addEventListener('click', () => {
            const format = dom.exportSelect ? (dom.exportSelect.value || 'css') : 'css';
            const codeEl = document.getElementById(`code-${format}`);
            if (codeEl) {
                navigator.clipboard.writeText(codeEl.textContent).then(() => {
                    showToast(translations[layoutState.currentLang].copied || 'Copied to clipboard!');
                });
            }
        });
    }
}

function switchExportFormat(format) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = content.id === `export-content-${format}` ? 'block' : 'none';
    });

    const meta = FORMAT_META[format] || { filename: 'export.txt', badge: format.toUpperCase(), icon: 'code', mime: 'text/plain' };
    if (dom.exportHeaderIcon) dom.exportHeaderIcon.textContent = meta.icon;
    if (dom.exportFilenameBadge) dom.exportFilenameBadge.textContent = meta.filename;
    if (dom.exportFormatBadge) dom.exportFormatBadge.textContent = meta.badge;

    updateActiveLineCount(format);
}

function updateActiveLineCount(format) {
    const activeFormat = format || (dom.exportSelect ? (dom.exportSelect.value || 'css') : 'css');
    const codeEl = document.getElementById(`code-${activeFormat}`);
    if (codeEl && dom.exportLineCount) {
        const lines = codeEl.textContent.trim() ? codeEl.textContent.trim().split('\n').length : 0;
        dom.exportLineCount.textContent = `${lines} ${lines === 1 ? 'line' : 'lines'}`;
    }
}

function downloadExportFile() {
    const format = dom.exportSelect ? (dom.exportSelect.value || 'css') : 'css';
    const codeEl = document.getElementById(`code-${format}`);
    if (!codeEl) return;

    const meta = FORMAT_META[format] || { filename: 'export.txt', mime: 'text/plain' };
    const blob = new Blob([codeEl.textContent], { type: meta.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = meta.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(translations[layoutState.currentLang].download_success || 'File downloaded!');
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

    const isDark = document.body.classList.contains('dark-mode') || document.body.classList.contains('dark-theme') || document.documentElement.classList.contains('dark-mode') || document.documentElement.classList.contains('dark-theme');
    const modeName = isDark ? 'Dark' : 'Light';
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

    // CSS
    let css = `:root {\n  /* Active Mode: ${modeName} */\n  --primary: #${state.hex};\n`;
    tints.forEach((h, i) => css += `  --primary-tint-${(i+1)*10}: #${h};\n`);
    shades.forEach((h, i) => css += `  --primary-shade-${(i+1)*10}: #${h};\n`);
    css += `\n  /* Material Design 3 Theme Colors (${modeName} Mode) */\n`;
    tokenPairs.forEach(t => {
        css += `  ${t}: ${computed.getPropertyValue(t).trim()};\n`;
    });
    css += `}`;
    const cssCodeEl = document.getElementById('code-css');
    if (cssCodeEl) cssCodeEl.textContent = css;

    // Tailwind v4
    let tailwind = `@theme {\n  /* Active Mode: ${modeName} */\n  --color-brand: #${state.hex};\n`;
    tints.forEach((h, i) => tailwind += `  --color-brand-tint-${(i+1)*10}: #${h};\n`);
    shades.forEach((h, i) => tailwind += `  --color-brand-shade-${(i+1)*10}: #${h};\n`);
    tailwind += `\n  /* Material Design 3 System Colors (${modeName} Mode) */\n`;
    tokenPairs.forEach(t => {
        const cleanKey = t.replace('--md-sys-color-', '');
        tailwind += `  --color-sys-${cleanKey}: ${computed.getPropertyValue(t).trim()};\n`;
    });
    tailwind += `}`;
    const twCodeEl = document.getElementById('code-tailwind');
    if (twCodeEl) twCodeEl.textContent = tailwind;

    // Figma Tokens (W3C DTCG Standard)
    const oklch = ColorUtils.rgbToOklch(state.rgb.r, state.rgb.g, state.rgb.b);
    const colorName = ColorUtils.getColorName(state.hex);
    const whiteRatio = ColorUtils.getContrastRatio(state.rgb, {r:255,g:255,b:255});
    const blackRatio = ColorUtils.getContrastRatio(state.rgb, {r:0,g:0,b:0});

    const sysTokens = {};
    tokenPairs.forEach(t => {
        const cleanKey = t.replace('--md-sys-color-', '');
        const val = computed.getPropertyValue(t).trim();
        sysTokens[cleanKey] = {
            "$value": val,
            "$type": "color",
            "$description": `MD3 System ${cleanKey} (${modeName} Mode)`
        };
    });

    const figmaTokens = {
        "$schema": "https://design-tokens.github.io/community-group/format/",
        mode: modeName.toLowerCase(),
        color: {
            brand: {
                base: { 
                    "$value": `#${state.hex}`, 
                    "$type": "color",
                    "$description": `${colorName} - OKLCH(${Math.round(oklch.l)}% ${oklch.c.toFixed(2)} ${Math.round(oklch.h)})`,
                    "$extensions": {
                        "com.limorina.color": {
                            "name": colorName,
                            "oklch": `oklch(${Math.round(oklch.l)}% ${oklch.c.toFixed(3)} ${Math.round(oklch.h)})`,
                            "contrast": {
                                "onWhite": `${whiteRatio.toFixed(1)}:1`,
                                "onBlack": `${blackRatio.toFixed(1)}:1`
                            }
                        }
                    }
                },
                tints: Object.fromEntries(tints.map((h, i) => {
                    const r = ColorUtils.hexToRgb(h);
                    const ok = ColorUtils.rgbToOklch(r.r, r.g, r.b);
                    return [`tint-${(i+1)*10}`, { 
                        "$value": `#${h}`, 
                        "$type": "color",
                        "$description": `Tint ${(i+1)*10}% - OKLCH(${Math.round(ok.l)}% ${ok.c.toFixed(2)} ${Math.round(ok.h)})`
                    }];
                })),
                shades: Object.fromEntries(shades.map((h, i) => {
                    const r = ColorUtils.hexToRgb(h);
                    const ok = ColorUtils.rgbToOklch(r.r, r.g, r.b);
                    return [`shade-${(i+1)*10}`, { 
                        "$value": `#${h}`, 
                        "$type": "color",
                        "$description": `Shade ${(i+1)*10}% - OKLCH(${Math.round(ok.l)}% ${ok.c.toFixed(2)} ${Math.round(ok.h)})`
                    }];
                }))
            },
            sys: sysTokens
        }
    };
    const figmaCodeEl = document.getElementById('code-figma');
    if (figmaCodeEl) figmaCodeEl.textContent = JSON.stringify(figmaTokens, null, 2);

    // Flutter / Dart
    let flutter = `import 'package:flutter/material.dart';\n\nclass AppTheme {\n  static const Color primarySeed = Color(0xFF${state.hex});\n\n  static final ColorScheme lightColorScheme = ColorScheme.fromSeed(\n    seedColor: primarySeed,\n    brightness: Brightness.light,\n  );\n\n  static final ColorScheme darkColorScheme = ColorScheme.fromSeed(\n    seedColor: primarySeed,\n    brightness: Brightness.dark,\n  );\n}\n`;
    const flutterCodeEl = document.getElementById('code-flutter');
    if (flutterCodeEl) flutterCodeEl.textContent = flutter;

    // SCSS Map
    let scss = `// Material Design 3 SCSS Tokens (${modeName} Mode)\n$brand-color: (\n  base: #${state.hex},\n  tints: (\n`;
    tints.forEach((h, i) => scss += `    ${(i+1)*10}: #${h},\n`);
    scss += `  ),\n  shades: (\n`;
    shades.forEach((h, i) => scss += `    ${(i+1)*10}: #${h},\n`);
    scss += `  )\n);\n\n$md-sys-color: (\n  mode: "${modeName.toLowerCase()}",\n`;
    tokenPairs.forEach(t => {
        const cleanKey = t.replace('--md-sys-color-', '');
        scss += `  "${cleanKey}": ${computed.getPropertyValue(t).trim()},\n`;
    });
    scss += `);`;
    const scssCodeEl = document.getElementById('code-scss');
    if (scssCodeEl) scssCodeEl.textContent = scss;

    // Android XML
    let android = `<!-- res/values/colors.xml (${modeName} Mode) -->\n<resources>\n  <color name="brand_color">#FF${state.hex}</color>\n`;
    tints.forEach((h, i) => android += `  <color name="brand_color_tint_${(i+1)*10}">#FF${h}</color>\n`);
    shades.forEach((h, i) => android += `  <color name="brand_color_shade_${(i+1)*10}">#FF${h}</color>\n`);
    android += `</resources>\n\n// Jetpack Compose Kotlin Colors (${modeName} Mode)\nimport androidx.compose.ui.graphics.Color\n\nobject BrandColors {\n  val Base = Color(0xFF${state.hex})\n`;
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
    let swift = `// SwiftUI Color Extension (${modeName} Mode)\nimport SwiftUI\n\nextension Color {\n  static let brandColor = ${hexToSwiftColor(state.hex)} // #${state.hex}\n\n  struct BrandTints {\n`;
    tints.forEach((h, i) => swift += `    static let tint${(i+1)*10} = ${hexToSwiftColor(h)} // #${h}\n`);
    swift += `  }\n\n  struct BrandShades {\n`;
    shades.forEach((h, i) => swift += `    static let shade${(i+1)*10} = ${hexToSwiftColor(h)} // #${h}\n`);
    swift += `  }\n}`;
    const swiftCodeEl = document.getElementById('code-swiftui');
    if (swiftCodeEl) swiftCodeEl.textContent = swift;

    // Enriched JSON Export
    const sysTokensMap = {};
    tokenPairs.forEach(t => {
        const cleanKey = t.replace('--md-sys-color-', '');
        sysTokensMap[cleanKey] = computed.getPropertyValue(t).trim();
    });

    const data = {
        mode: modeName.toLowerCase(),
        name: colorName,
        hex: `#${state.hex}`,
        rgb: `rgb(${state.rgb.r}, ${state.rgb.g}, ${state.rgb.b})`,
        hsl: `hsl(${Math.round(state.hsl.h)}deg ${Math.round(state.hsl.s)}% ${Math.round(state.hsl.l)}%)`,
        oklch: `oklch(${Math.round(oklch.l)}% ${oklch.c.toFixed(3)} ${Math.round(oklch.h)})`,
        contrast: {
            onWhite: `${whiteRatio.toFixed(1)}:1`,
            onBlack: `${blackRatio.toFixed(1)}:1`,
            suggestedText: whiteRatio > blackRatio ? '#FFFFFF' : '#000000'
        },
        systemColors: sysTokensMap,
        tints: tints.map(h => `#${h}`),
        shades: shades.map(h => `#${h}`)
    };
    const jsonCodeEl = document.getElementById('code-json');
    if (jsonCodeEl) jsonCodeEl.textContent = JSON.stringify(data, null, 2);

    // Python
    const pythonCode = `# Code template for materialyoucolor-python\n# Install: pip install materialyoucolor\n\nfrom materialyoucolor.theme import Theme\nfrom materialyoucolor.rgba import RGBA\n\n# Initialize dynamic theme using active color: #${state.hex}\ntheme = Theme(RGBA(${state.rgb.r}, ${state.rgb.g}, ${state.rgb.b}, 255))\n\n# Retrieve dynamic colors for Light & Dark schemes\nlight = theme.schemes.light\ndark = theme.schemes.dark\n\nprint("=== LIGHT SYSTEM COLORS ===")\nprint(f"Primary:           {light.primary}")\nprint(f"On Primary:        {light.onPrimary}")\nprint(f"Primary Container: {light.primaryContainer}")\nprint(f"Surface:           {light.surface}")\n\nprint("\\n=== DARK SYSTEM COLORS ===")\nprint(f"Primary:           {dark.primary}")\nprint(f"On Primary:        {dark.onPrimary}")\nprint(f"Primary Container: {dark.primaryContainer}")\nprint(f"Surface:           {dark.surface}")\n`;
    const pythonCodeEl = document.getElementById('code-python');
    if (pythonCodeEl) pythonCodeEl.textContent = pythonCode;

    // Refresh active format header and line count
    const activeFormat = dom.exportSelect ? (dom.exportSelect.value || 'css') : 'css';
    switchExportFormat(activeFormat);
}

function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = msg || (translations[layoutState.currentLang].copied || 'Copied!');
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2000);
}
