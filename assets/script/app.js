import { state, dom } from './state.js';
import { ColorUtils } from './utils.js';
import { renderAll, setLanguage, renderSavedPalette } from './ui.js';
import { attachEvents } from './events.js';
import { addToHistory, renderHistory } from './features.js';
import { initNavigation } from './navigation.js';

export function updateColorState(hex, skipHistory = false) {
    if (!/^[0-9A-F]{6}$/i.test(hex)) return;
    state.activeHex = hex.toUpperCase();
    state.hex = state.activeHex;
    state.rgb = ColorUtils.hexToRgb(state.hex);
    state.hsl = ColorUtils.rgbToHsl(state.rgb.r, state.rgb.g, state.rgb.b);
    state.cmyk = ColorUtils.rgbToCmyk(state.rgb.r, state.rgb.g, state.rgb.b);
    state.oklch = ColorUtils.rgbToOklch(state.rgb.r, state.rgb.g, state.rgb.b);
    state.oklab = ColorUtils.rgbToOklab(state.rgb.r, state.rgb.g, state.rgb.b);
    
    localStorage.setItem('active_hex', state.hex);
    window.history.replaceState(null, '', `?color=${state.hex}`);
    
    if (!skipHistory) {
        addToHistory(state.hex);
    }
    
    renderAll();
}

export function saveToPalette() {
    if (state.palette.includes(state.hex)) return;
    if (state.palette.length >= 10) state.palette.shift();
    state.palette.push(state.hex);
    localStorage.setItem('saved_palette', JSON.stringify(state.palette));
    renderSavedPalette();
    import('./ui.js').then(ui => ui.showToast());
}

export function removeFromPalette(index) {
    state.palette.splice(index, 1);
    localStorage.setItem('saved_palette', JSON.stringify(state.palette));
    renderSavedPalette();
}

document.addEventListener('DOMContentLoaded', () => {
    // Populate DOM elements
    Object.assign(dom, {
        hexInput: document.getElementById('hex-input'),
        colorPicker: document.getElementById('color-picker'),
        preview: document.getElementById('color-preview'),
        rgbOutput: document.getElementById('rgb-output'),
        hslOutput: document.getElementById('hsl-output'),
        cmykOutput: document.getElementById('cmyk-output'),
        tintsRow: document.getElementById('tints-row'),
        shadesRow: document.getElementById('shades-row'),
        tonesRow: document.getElementById('tones-row'),
        harmoniesContainer: document.getElementById('harmonies-container'),
        themeToggle: document.getElementById('theme-toggle'),
        langBtn: document.getElementById('lang-btn'),
        langMenu: document.getElementById('lang-menu'),
        helpBtn: document.getElementById('help-btn'),
        helpModal: document.getElementById('help-modal'),
        closeHelp: document.getElementById('close-help'),
        closeHelpConfirm: document.getElementById('close-help-confirm'),
        copyExportBtn: document.getElementById('copy-export'),
        appTitle: document.getElementById('app-title'),
        toast: document.getElementById('toast'),
        wcagWhiteRatio: document.getElementById('wcag-white-ratio'),
        wcagBlackRatio: document.getElementById('wcag-black-ratio'),
        wcagWhiteBadges: document.getElementById('wcag-white-badges'),
        wcagBlackBadges: document.getElementById('wcag-black-badges'),
        oklchOutput: document.getElementById('oklch-output'),
        colorNameDisplay: document.getElementById('color-name-display'),
        bestTextColor: document.getElementById('best-text-color'),
        saveBtn: document.getElementById('save-to-palette'),
        paletteContainer: document.getElementById('palette-colors'),
        exportImageBtn: document.getElementById('export-image-btn'),
        cbSimulator: document.getElementById('cb-simulator'),
        
        mainContainer: document.querySelector('.main-container'),
        sidebar: document.getElementById('sidebar'),
        sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
        closeSidebarBtn: document.getElementById('close-sidebar-btn'),
        
        historyContainer: document.getElementById('history-container'),
        customBgHex: document.getElementById('custom-bg-hex'),
        customFgHex: document.getElementById('custom-fg-hex'),
        customBgPicker: document.getElementById('custom-bg-picker'),
        customFgPicker: document.getElementById('custom-fg-picker'),
        customContrastRatio: document.getElementById('custom-contrast-ratio'),
        customContrastPreview: document.getElementById('custom-contrast-preview'),
        customContrastBadges: document.getElementById('custom-contrast-badges'),
        
        advancedPreviewToggle: document.getElementById('advanced-preview-toggle'),
        uiSamplesCard: document.getElementById('ui-samples-card'),

        mixerInputs: {
            r: document.getElementById('rgb-r'),
            g: document.getElementById('rgb-g'),
            b: document.getElementById('rgb-b'),
            h: document.getElementById('hsl-h'),
            s: document.getElementById('hsl-s'),
            l: document.getElementById('hsl-l'),
            oklch_l: document.getElementById('oklch-l'),
            oklch_c: document.getElementById('oklch-c'),
            oklch_h: document.getElementById('oklch-h'),
            lab_l: document.getElementById('lab-l'),
            lab_a: document.getElementById('lab-a'),
            lab_b: document.getElementById('lab-b')
        }
    });

    attachEvents();
    initNavigation();
    
    // Init
    updateColorState(state.activeHex, true);
    setLanguage(state.currentLang);
    dom.hexInput.value = state.activeHex;
    dom.colorPicker.value = `#${state.activeHex}`;
    renderHistory();
});
