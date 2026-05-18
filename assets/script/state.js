export const state = {
    hex: "",
    rgb: { r: 0, g: 0, b: 0 },
    hsl: { h: 0, s: 0, l: 0 },
    cmyk: { c: 0, m: 0, y: 0, k: 0 },
    oklch: { l: 0, c: 0, h: 0 },
    oklab: { l: 0, a: 0, b: 0 },
    palette: JSON.parse(localStorage.getItem('saved_palette') || '[]'),
    history: JSON.parse(localStorage.getItem('color_history') || '[]'),
    activeHex: localStorage.getItem('active_hex') || "624E9A",
    currentLang: localStorage.getItem('app_lang') || 'en',
    customContrastBg: "FFFFFF",
    customContrastFg: "000000",
    advancedPreviewActive: false
};

export const dom = {}; // Populated in app.js after DOMContentLoaded
