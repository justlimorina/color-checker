import { ColorUtils } from '../assets/script/utils.js';
import { translations } from '../assets/script/config.js';
import { initLayout, layoutState } from '../assets/script/shared/layout.js';
import { themeFromSourceColor, argbFromHex, hexFromArgb, TonalPalette } from 'https://esm.sh/@material/material-color-utilities';

const urlParams = new URLSearchParams(window.location.search);
const urlSeed = urlParams.get('seed') || urlParams.get('primary') || urlParams.get('color');

const state = {
    hex: (urlSeed && /^[0-9A-F]{6}$/i.test(urlSeed)) ? urlSeed.toUpperCase() : (localStorage.getItem('active_hex') || "624E9A"),
    customSeeds: false,
    secondary: "605B71",
    tertiary: "7D5260",
    contrast: "standard",
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
        primaryHex: document.getElementById('theme-primary-hex'),
        primaryPicker: document.getElementById('theme-primary-picker'),
        independentToggle: document.getElementById('theme-independent-seeds-toggle'),
        independentSeedsRow: document.getElementById('independent-seeds-row'),
        secondaryHex: document.getElementById('theme-secondary-hex'),
        secondaryPicker: document.getElementById('theme-secondary-picker'),
        tertiaryHex: document.getElementById('theme-tertiary-hex'),
        tertiaryPicker: document.getElementById('theme-tertiary-picker'),
        contrastToggle: document.getElementById('theme-contrast-toggle'),
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

    if (dom.primaryHex) dom.primaryHex.value = state.hex;
    if (dom.primaryPicker) dom.primaryPicker.value = `#${state.hex}`;
    if (dom.secondaryHex) dom.secondaryHex.value = state.secondary;
    if (dom.secondaryPicker) dom.secondaryPicker.value = `#${state.secondary}`;
    if (dom.tertiaryHex) dom.tertiaryHex.value = state.tertiary;
    if (dom.tertiaryPicker) dom.tertiaryPicker.value = `#${state.tertiary}`;
}

function attachEvents() {
    // Primary Seed
    const onPrimaryChange = (val) => {
        state.hex = val.toUpperCase();
        state.rgb = ColorUtils.hexToRgb(state.hex);
        state.hsl = ColorUtils.rgbToHsl(state.rgb.r, state.rgb.g, state.rgb.b);
        localStorage.setItem('active_hex', state.hex);
        renderAll();
    };

    if (dom.primaryPicker) {
        dom.primaryPicker.addEventListener('input', (e) => {
            const h = e.target.value.replace('#', '');
            if (dom.primaryHex) dom.primaryHex.value = h.toUpperCase();
            onPrimaryChange(h);
        });
    }

    if (dom.primaryHex) {
        dom.primaryHex.addEventListener('input', (e) => {
            let val = e.target.value.replace('#', '');
            if (val.length === 3) val = val.split('').map(c => c + c).join('');
            if (/^[0-9A-F]{6}$/i.test(val)) {
                if (dom.primaryPicker) dom.primaryPicker.value = `#${val}`;
                onPrimaryChange(val);
            }
        });
    }

    // Independent Seeds Toggle
    if (dom.independentToggle) {
        dom.independentToggle.addEventListener('change', (e) => {
            state.customSeeds = e.target.checked;
            if (dom.independentSeedsRow) {
                dom.independentSeedsRow.style.display = state.customSeeds ? 'flex' : 'none';
            }
            renderAll();
        });
    }

    // Secondary Seed
    const onSecondaryChange = (val) => {
        state.secondary = val.toUpperCase();
        renderAll();
    };
    if (dom.secondaryPicker) {
        dom.secondaryPicker.addEventListener('input', (e) => {
            const h = e.target.value.replace('#', '');
            if (dom.secondaryHex) dom.secondaryHex.value = h.toUpperCase();
            onSecondaryChange(h);
        });
    }
    if (dom.secondaryHex) {
        dom.secondaryHex.addEventListener('input', (e) => {
            let val = e.target.value.replace('#', '');
            if (val.length === 3) val = val.split('').map(c => c + c).join('');
            if (/^[0-9A-F]{6}$/i.test(val)) {
                if (dom.secondaryPicker) dom.secondaryPicker.value = `#${val}`;
                onSecondaryChange(val);
            }
        });
    }

    // Tertiary Seed
    const onTertiaryChange = (val) => {
        state.tertiary = val.toUpperCase();
        renderAll();
    };
    if (dom.tertiaryPicker) {
        dom.tertiaryPicker.addEventListener('input', (e) => {
            const h = e.target.value.replace('#', '');
            if (dom.tertiaryHex) dom.tertiaryHex.value = h.toUpperCase();
            onTertiaryChange(h);
        });
    }
    if (dom.tertiaryHex) {
        dom.tertiaryHex.addEventListener('input', (e) => {
            let val = e.target.value.replace('#', '');
            if (val.length === 3) val = val.split('').map(c => c + c).join('');
            if (/^[0-9A-F]{6}$/i.test(val)) {
                if (dom.tertiaryPicker) dom.tertiaryPicker.value = `#${val}`;
                onTertiaryChange(val);
            }
        });
    }

    // Contrast Toggle
    if (dom.contrastToggle) {
        dom.contrastToggle.querySelectorAll('.segment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                dom.contrastToggle.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.contrast = btn.getAttribute('data-contrast') || 'standard';
                renderAll();
            });
        });
    }

    // Export Hub Floating Select
    if (dom.exportSelect) {
        const onSelectChange = () => {
            const format = dom.exportSelect.value || 'css';
            switchExportFormat(format);
        };
        dom.exportSelect.addEventListener('change', onSelectChange);
        dom.exportSelect.addEventListener('input', onSelectChange);
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
    const primaryArgb = argbFromHex('#' + state.hex);
    const theme = themeFromSourceColor(primaryArgb);
    const isDark = layoutState.theme === 'dark';

    // Check independent seeds
    let secPalette = theme.palettes.secondary;
    let terPalette = theme.palettes.tertiary;

    if (state.customSeeds) {
        try {
            secPalette = TonalPalette.fromInt(argbFromHex('#' + state.secondary));
            terPalette = TonalPalette.fromInt(argbFromHex('#' + state.tertiary));
        } catch (e) {
            console.warn('Could not parse independent seeds:', e);
        }
    }

    const priPalette = theme.palettes.primary;
    const neutralPalette = theme.palettes.neutral;
    const neutralVariant = theme.palettes.neutralVariant;
    const errorPalette = theme.palettes.error;

    // Contrast adjustments
    let toneOffset = 0;
    if (state.contrast === 'medium') toneOffset = isDark ? 8 : -8;
    if (state.contrast === 'high') toneOffset = isDark ? 16 : -16;

    const setProp = (name, val) => {
        document.documentElement.style.setProperty(name, val);
        document.body.style.setProperty(name, val);
    };

    if (!isDark) {
        setProp('--md-sys-color-primary', hexFromArgb(priPalette.tone(Math.max(10, Math.min(90, 40 + toneOffset)))));
        setProp('--md-sys-color-on-primary', hexFromArgb(priPalette.tone(100)));
        setProp('--md-sys-color-primary-container', hexFromArgb(priPalette.tone(90)));
        setProp('--md-sys-color-on-primary-container', hexFromArgb(priPalette.tone(10)));

        setProp('--md-sys-color-secondary', hexFromArgb(secPalette.tone(Math.max(10, Math.min(90, 40 + toneOffset)))));
        setProp('--md-sys-color-on-secondary', hexFromArgb(secPalette.tone(100)));
        setProp('--md-sys-color-secondary-container', hexFromArgb(secPalette.tone(90)));
        setProp('--md-sys-color-on-secondary-container', hexFromArgb(secPalette.tone(10)));

        setProp('--md-sys-color-tertiary', hexFromArgb(terPalette.tone(Math.max(10, Math.min(90, 40 + toneOffset)))));
        setProp('--md-sys-color-on-tertiary', hexFromArgb(terPalette.tone(100)));
        setProp('--md-sys-color-tertiary-container', hexFromArgb(terPalette.tone(90)));
        setProp('--md-sys-color-on-tertiary-container', hexFromArgb(terPalette.tone(10)));

        setProp('--md-sys-color-error', hexFromArgb(errorPalette.tone(40)));
        setProp('--md-sys-color-on-error', hexFromArgb(errorPalette.tone(100)));
        setProp('--md-sys-color-error-container', hexFromArgb(errorPalette.tone(90)));
        setProp('--md-sys-color-on-error-container', hexFromArgb(errorPalette.tone(10)));

        setProp('--md-sys-color-background', hexFromArgb(neutralPalette.tone(98)));
        setProp('--md-sys-color-on-background', hexFromArgb(neutralPalette.tone(10)));
        setProp('--md-sys-color-surface', hexFromArgb(neutralPalette.tone(98)));
        setProp('--md-sys-color-on-surface', hexFromArgb(neutralPalette.tone(10)));
        setProp('--md-sys-color-surface-variant', hexFromArgb(neutralVariant.tone(90)));
        setProp('--md-sys-color-on-surface-variant', hexFromArgb(neutralVariant.tone(30)));
        setProp('--md-sys-color-outline', hexFromArgb(neutralVariant.tone(50)));
        setProp('--md-sys-color-outline-variant', hexFromArgb(neutralVariant.tone(80)));

        setProp('--md-sys-color-surface-container-lowest', hexFromArgb(neutralPalette.tone(100)));
        setProp('--md-sys-color-surface-container-low', hexFromArgb(neutralPalette.tone(96)));
        setProp('--md-sys-color-surface-container', hexFromArgb(neutralPalette.tone(94)));
        setProp('--md-sys-color-surface-container-high', hexFromArgb(neutralPalette.tone(92)));
        setProp('--md-sys-color-surface-container-highest', hexFromArgb(neutralPalette.tone(90)));
    } else {
        setProp('--md-sys-color-primary', hexFromArgb(priPalette.tone(Math.max(10, Math.min(90, 80 + toneOffset)))));
        setProp('--md-sys-color-on-primary', hexFromArgb(priPalette.tone(20)));
        setProp('--md-sys-color-primary-container', hexFromArgb(priPalette.tone(30)));
        setProp('--md-sys-color-on-primary-container', hexFromArgb(priPalette.tone(90)));

        setProp('--md-sys-color-secondary', hexFromArgb(secPalette.tone(Math.max(10, Math.min(90, 80 + toneOffset)))));
        setProp('--md-sys-color-on-secondary', hexFromArgb(secPalette.tone(20)));
        setProp('--md-sys-color-secondary-container', hexFromArgb(secPalette.tone(30)));
        setProp('--md-sys-color-on-secondary-container', hexFromArgb(secPalette.tone(90)));

        setProp('--md-sys-color-tertiary', hexFromArgb(terPalette.tone(Math.max(10, Math.min(90, 80 + toneOffset)))));
        setProp('--md-sys-color-on-tertiary', hexFromArgb(terPalette.tone(20)));
        setProp('--md-sys-color-tertiary-container', hexFromArgb(terPalette.tone(30)));
        setProp('--md-sys-color-on-tertiary-container', hexFromArgb(terPalette.tone(90)));

        setProp('--md-sys-color-error', hexFromArgb(errorPalette.tone(80)));
        setProp('--md-sys-color-on-error', hexFromArgb(errorPalette.tone(20)));
        setProp('--md-sys-color-error-container', hexFromArgb(errorPalette.tone(30)));
        setProp('--md-sys-color-on-error-container', hexFromArgb(errorPalette.tone(90)));

        setProp('--md-sys-color-background', hexFromArgb(neutralPalette.tone(6)));
        setProp('--md-sys-color-on-background', hexFromArgb(neutralPalette.tone(90)));
        setProp('--md-sys-color-surface', hexFromArgb(neutralPalette.tone(6)));
        setProp('--md-sys-color-on-surface', hexFromArgb(neutralPalette.tone(90)));
        setProp('--md-sys-color-surface-variant', hexFromArgb(neutralVariant.tone(30)));
        setProp('--md-sys-color-on-surface-variant', hexFromArgb(neutralVariant.tone(80)));
        setProp('--md-sys-color-outline', hexFromArgb(neutralVariant.tone(60)));
        setProp('--md-sys-color-outline-variant', hexFromArgb(neutralVariant.tone(30)));

        setProp('--md-sys-color-surface-container-lowest', hexFromArgb(neutralPalette.tone(4)));
        setProp('--md-sys-color-surface-container-low', hexFromArgb(neutralPalette.tone(10)));
        setProp('--md-sys-color-surface-container', hexFromArgb(neutralPalette.tone(12)));
        setProp('--md-sys-color-surface-container-high', hexFromArgb(neutralPalette.tone(17)));
        setProp('--md-sys-color-surface-container-highest', hexFromArgb(neutralPalette.tone(22)));
    }
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
        if (!val) return;
        
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
        valSpan.style.fontFamily = 'monospace';
        valSpan.style.opacity = '0.9';
        valSpan.textContent = val;
        
        item.appendChild(nameSpan);
        item.appendChild(valSpan);
        dom.grid.appendChild(item);
    });
}

function updateExportContent() {
    const isDark = layoutState.theme === 'dark';
    const modeName = isDark ? 'Dark' : 'Light';
    const computed = window.getComputedStyle(document.documentElement);
    
    const tokenPairs = [
        '--md-sys-color-primary',
        '--md-sys-color-on-primary',
        '--md-sys-color-primary-container',
        '--md-sys-color-on-primary-container',
        '--md-sys-color-secondary',
        '--md-sys-color-on-secondary',
        '--md-sys-color-secondary-container',
        '--md-sys-color-on-secondary-container',
        '--md-sys-color-tertiary',
        '--md-sys-color-on-tertiary',
        '--md-sys-color-tertiary-container',
        '--md-sys-color-on-tertiary-container',
        '--md-sys-color-error',
        '--md-sys-color-on-error',
        '--md-sys-color-error-container',
        '--md-sys-color-on-error-container',
        '--md-sys-color-background',
        '--md-sys-color-on-background',
        '--md-sys-color-surface',
        '--md-sys-color-on-surface',
        '--md-sys-color-surface-variant',
        '--md-sys-color-on-surface-variant',
        '--md-sys-color-outline',
        '--md-sys-color-outline-variant',
        '--md-sys-color-surface-container-lowest',
        '--md-sys-color-surface-container-low',
        '--md-sys-color-surface-container',
        '--md-sys-color-surface-container-high',
        '--md-sys-color-surface-container-highest'
    ];

    // CSS Variables (:root)
    let css = `/* Material Design 3 Generated Theme (${modeName} Mode) */\n:root {\n  --brand-primary: #${state.hex};\n`;
    if (state.customSeeds) {
        css += `  --brand-secondary: #${state.secondary};\n  --brand-tertiary: #${state.tertiary};\n`;
    }
    tokenPairs.forEach(t => {
        css += `  ${t}: ${computed.getPropertyValue(t).trim()};\n`;
    });
    css += `}`;
    const cssCodeEl = document.getElementById('code-css');
    if (cssCodeEl) cssCodeEl.textContent = css;

    // Tailwind CSS v4 (@theme)
    let tailwind = `@theme {\n  /* Active Mode: ${modeName} */\n  --color-brand-primary: #${state.hex};\n`;
    if (state.customSeeds) {
        tailwind += `  --color-brand-secondary: #${state.secondary};\n  --color-brand-tertiary: #${state.tertiary};\n`;
    }
    tokenPairs.forEach(t => {
        const cleanKey = t.replace('--md-sys-color-', '');
        tailwind += `  --color-sys-${cleanKey}: ${computed.getPropertyValue(t).trim()};\n`;
    });
    tailwind += `}`;
    const twCodeEl = document.getElementById('code-tailwind');
    if (twCodeEl) twCodeEl.textContent = tailwind;

    // Figma Tokens
    const figmaSys = {};
    tokenPairs.forEach(t => {
        const cleanKey = t.replace('--md-sys-color-', '');
        figmaSys[cleanKey] = {
            "$value": computed.getPropertyValue(t).trim(),
            "$type": "color"
        };
    });
    const figmaTokens = {
        "$schema": "https://design-tokens.github.io/community-group/format/",
        mode: modeName.toLowerCase(),
        seeds: {
            primary: `#${state.hex}`,
            secondary: state.customSeeds ? `#${state.secondary}` : 'auto',
            tertiary: state.customSeeds ? `#${state.tertiary}` : 'auto'
        },
        color: {
            sys: figmaSys
        }
    };
    const figmaCodeEl = document.getElementById('code-figma');
    if (figmaCodeEl) figmaCodeEl.textContent = JSON.stringify(figmaTokens, null, 2);

    // Flutter / Dart
    let flutter = `import 'package:flutter/material.dart';\n\nclass AppTheme {\n  static const Color primarySeed = Color(0xFF${state.hex});\n`;
    if (state.customSeeds) {
        flutter += `  static const Color secondarySeed = Color(0xFF${state.secondary});\n  static const Color tertiarySeed = Color(0xFF${state.tertiary});\n`;
    }
    flutter += `\n  static final ColorScheme lightColorScheme = ColorScheme.fromSeed(\n    seedColor: primarySeed,\n    brightness: Brightness.light,\n  );\n\n  static final ColorScheme darkColorScheme = ColorScheme.fromSeed(\n    seedColor: primarySeed,\n    brightness: Brightness.dark,\n  );\n}\n`;
    const flutterCodeEl = document.getElementById('code-flutter');
    if (flutterCodeEl) flutterCodeEl.textContent = flutter;

    // SCSS Map & Variables
    let scss = `// Material Design 3 SCSS Tokens (${modeName} Mode)\n`;
    scss += `$brand-primary: #${state.hex};\n`;
    if (state.customSeeds) {
        scss += `$brand-secondary: #${state.secondary};\n$brand-tertiary: #${state.tertiary};\n`;
    }
    scss += `\n$md-sys-color: (\n  "mode": "${modeName.toLowerCase()}",\n`;
    tokenPairs.forEach(t => {
        const cleanKey = t.replace('--md-sys-color-', '');
        scss += `  "${cleanKey}": ${computed.getPropertyValue(t).trim()},\n`;
    });
    scss += `);\n\n// Helper function to access tokens\n@function md-sys-color($token) {\n  @return map-get($md-sys-color, $token);\n}\n`;
    const scssCodeEl = document.getElementById('code-scss');
    if (scssCodeEl) scssCodeEl.textContent = scss;

    // Android (XML & Jetpack Compose)
    const toPascalCase = (str) => str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    let android = `<!-- res/values/colors.xml (${modeName} Mode) -->\n<resources>\n  <!-- Brand Seeds -->\n  <color name="brand_primary">#FF${state.hex.toUpperCase()}</color>\n`;
    if (state.customSeeds) {
        android += `  <color name="brand_secondary">#FF${state.secondary.toUpperCase()}</color>\n  <color name="brand_tertiary">#FF${state.tertiary.toUpperCase()}</color>\n`;
    }
    android += `\n  <!-- MD3 System Tokens -->\n`;
    tokenPairs.forEach(t => {
        const cleanKey = t.replace('--md-sys-color-', '').replace(/-/g, '_');
        const val = computed.getPropertyValue(t).trim().replace('#', '').toUpperCase();
        android += `  <color name="md_theme_${cleanKey}">#FF${val}</color>\n`;
    });
    android += `</resources>\n\n// Jetpack Compose Kotlin Colors (${modeName} Mode)\npackage com.example.ui.theme\n\nimport androidx.compose.ui.graphics.Color\n\nobject MD3ThemeColors {\n  val BrandPrimary = Color(0xFF${state.hex.toUpperCase()})\n`;
    if (state.customSeeds) {
        android += `  val BrandSecondary = Color(0xFF${state.secondary.toUpperCase()})\n  val BrandTertiary = Color(0xFF${state.tertiary.toUpperCase()})\n`;
    }
    android += `\n  // MD3 System Tokens\n`;
    tokenPairs.forEach(t => {
        const cleanKey = t.replace('--md-sys-color-', '');
        const pascalKey = toPascalCase(cleanKey);
        const val = computed.getPropertyValue(t).trim().replace('#', '').toUpperCase();
        android += `  val ${pascalKey} = Color(0xFF${val})\n`;
    });
    android += `}\n`;
    const androidCodeEl = document.getElementById('code-android');
    if (androidCodeEl) androidCodeEl.textContent = android;

    // SwiftUI (iOS Extension)
    const toCamelCase = (str) => str.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('');
    const hexToSwiftColor = (hexStr) => {
        const rgb = ColorUtils.hexToRgb(hexStr.replace('#', ''));
        return `Color(red: ${(rgb.r / 255).toFixed(3)}, green: ${(rgb.g / 255).toFixed(3)}, blue: ${(rgb.b / 255).toFixed(3)})`;
    };
    let swift = `// SwiftUI Color Extension (${modeName} Mode)\n// Generated from Material Design 3 Theme Builder\nimport SwiftUI\n\nextension Color {\n  // Brand Seeds\n  static let brandPrimary = ${hexToSwiftColor(state.hex)} // #${state.hex}\n`;
    if (state.customSeeds) {
        swift += `  static let brandSecondary = ${hexToSwiftColor(state.secondary)} // #${state.secondary}\n  static let brandTertiary = ${hexToSwiftColor(state.tertiary)} // #${state.tertiary}\n`;
    }
    swift += `\n  // MD3 System Color Tokens\n  struct MD3 {\n`;
    tokenPairs.forEach(t => {
        const cleanKey = t.replace('--md-sys-color-', '');
        const camelKey = toCamelCase(cleanKey);
        const val = computed.getPropertyValue(t).trim();
        swift += `    static let ${camelKey} = ${hexToSwiftColor(val)} // ${val}\n`;
    });
    swift += `  }\n}\n`;
    const swiftCodeEl = document.getElementById('code-swiftui');
    if (swiftCodeEl) swiftCodeEl.textContent = swift;

    // JSON Palette Data
    const jsonTokens = {
        theme: "Material Design 3",
        mode: modeName.toLowerCase(),
        contrast: state.contrast,
        seeds: {
            primary: `#${state.hex}`,
            secondary: state.customSeeds ? `#${state.secondary}` : 'auto',
            tertiary: state.customSeeds ? `#${state.tertiary}` : 'auto'
        },
        schemes: {},
        cssTokens: {}
    };
    tokenPairs.forEach(t => {
        const cleanKey = t.replace('--md-sys-color-', '');
        const camelKey = toCamelCase(cleanKey);
        const val = computed.getPropertyValue(t).trim();
        jsonTokens.schemes[camelKey] = val;
        jsonTokens.cssTokens[t] = val;
    });
    const jsonCodeEl = document.getElementById('code-json');
    if (jsonCodeEl) jsonCodeEl.textContent = JSON.stringify(jsonTokens, null, 2);

    // Python (Material You)
    let python = `# Code template for materialyoucolor-python (${modeName} Mode)\n# Install: pip install materialyoucolor\n\nfrom materialyoucolor.theme import Theme\nfrom materialyoucolor.rgba import RGBA\n\n# Initialize dynamic theme using primary seed: #${state.hex}\nprimary_seed = RGBA(${state.rgb.r}, ${state.rgb.g}, ${state.rgb.b}, 255)\ntheme = Theme(primary_seed)\n\n# Precomputed MD3 System Color Tokens (${modeName} Mode)\nMD3_SYSTEM_COLORS = {\n`;
    tokenPairs.forEach(t => {
        const cleanKey = t.replace('--md-sys-color-', '').replace(/-/g, '_');
        const val = computed.getPropertyValue(t).trim();
        python += `    "${cleanKey}": "${val}",\n`;
    });
    python += `}\n\n# Retrieve dynamic scheme object\nscheme = theme.schemes.${modeName.toLowerCase()}\nprint(f"Primary:           {scheme.primary}")\nprint(f"Primary Container: {scheme.primaryContainer}")\nprint(f"Surface:           {scheme.surface}")\n`;
    const pythonCodeEl = document.getElementById('code-python');
    if (pythonCodeEl) pythonCodeEl.textContent = python;

    // Refresh active format display
    const activeFormat = dom.exportSelect ? (dom.exportSelect.value || 'css') : 'css';
    switchExportFormat(activeFormat);
}

function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = msg || (translations[layoutState.currentLang].copied || 'Copied!');
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2000);
}
