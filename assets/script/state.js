export const state = {
    hex: "",
    rgb: { r: 0, g: 0, b: 0 },
    hsl: { h: 0, s: 0, l: 0 },
    cmyk: { c: 0, m: 0, y: 0, k: 0 },
    oklch: { l: 0, c: 0, h: 0 },
    oklab: { l: 0, a: 0, b: 0 },
    palette: JSON.parse(localStorage.getItem('saved_palette') || '[]'),
    history: JSON.parse(localStorage.getItem('color_history') || '[]'),
    activeHex: (() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlColor = urlParams.get('color');
        if (urlColor && /^[0-9A-F]{6}$/i.test(urlColor)) {
            return urlColor.toUpperCase();
        }
        return localStorage.getItem('active_hex') || "624E9A";
    })(),
    currentLang: localStorage.getItem('app_lang') || 'en',
    customContrastBg: "FFFFFF",
    customContrastFg: "000000",
    advancedPreviewActive: false,
    generatorColors: [],
    generatorLocks: [false, false, false, false, false],
    generatorRule: "complementary",
    matrixMode: "wcag",
    MAX_PALETTE_SIZE: 10
};

export const dom = {}; // Populated in app.js after DOMContentLoaded
