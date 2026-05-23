import { state, dom } from './state.js';
import { ColorUtils } from './utils.js';
import { translations } from './config.js';
import { updateColorState, removeFromPalette } from './app.js';
import { applyAdvancedPreview, updateCustomContrast } from './features.js';

export function renderAll() {
    // 1. Update Columns 1
    dom.preview.style.backgroundColor = `#${state.hex}`;
    dom.hexInput.value = state.hex;
    dom.colorPicker.value = `#${state.hex}`;
    dom.rgbOutput.textContent = `rgb(${state.rgb.r}, ${state.rgb.g}, ${state.rgb.b})`;
    dom.hslOutput.textContent = `${Math.round(state.hsl.h)}°, ${Math.round(state.hsl.s)}%, ${Math.round(state.hsl.l)}%`;
    dom.cmykOutput.textContent = `${state.cmyk.c}, ${state.cmyk.m}, ${state.cmyk.y}, ${state.cmyk.k}`;
    dom.oklchOutput.textContent = `${Math.round(state.oklch.l)}%, ${state.oklch.c.toFixed(2)}, ${Math.round(state.oklch.h)}`;

    // Update Color Name
    const colorName = ColorUtils.getColorName(state.hex);
    dom.colorNameDisplay.textContent = colorName;

    // Update Mixer Inputs
    updateMixerInputs();

    // Update dynamic theme colors
    updateDynamicTheme();

    // Update UI Samples
    updateUISamples();

    // 2. Column 2: Variations
    renderVariations();

    // 3. Column 3: Harmonies
    renderHarmonies();

    // 4. Update WCAG & Best Text
    updateWCAG();
    updateBestText();

    // 5. Saved Palette
    renderSavedPalette();

    // 6. Color Blindness
    renderColorBlindness();
    
    // 7. Custom Contrast
    if(state.customContrastBg === "FFFFFF" && state.customContrastFg === "000000") {
        if(dom.customBgHex) dom.customBgHex.value = "FFFFFF";
        if(dom.customFgHex) dom.customFgHex.value = state.hex;
        updateCustomContrast();
    }
}

export function updateMixerInputs() {
    dom.mixerInputs.r.value = state.rgb.r;
    dom.mixerInputs.g.value = state.rgb.g;
    dom.mixerInputs.b.value = state.rgb.b;
    dom.mixerInputs.h.value = Math.round(state.hsl.h);
    dom.mixerInputs.s.value = Math.round(state.hsl.s);
    dom.mixerInputs.l.value = Math.round(state.hsl.l);
    
    // OKLCH and LAB
    if(dom.mixerInputs.oklch_l) dom.mixerInputs.oklch_l.value = Math.round(state.oklch.l);
    if(dom.mixerInputs.oklch_c) dom.mixerInputs.oklch_c.value = state.oklch.c.toFixed(2);
    if(dom.mixerInputs.oklch_h) dom.mixerInputs.oklch_h.value = Math.round(state.oklch.h);
    
    if(dom.mixerInputs.lab_l) dom.mixerInputs.lab_l.value = Math.round(state.oklab.l);
    if(dom.mixerInputs.lab_a) dom.mixerInputs.lab_a.value = state.oklab.a.toFixed(2);
    if(dom.mixerInputs.lab_b) dom.mixerInputs.lab_b.value = state.oklab.b.toFixed(2);
}

export function updateUISamples() {
    if (state.advancedPreviewActive) {
        applyAdvancedPreview();
    } else {
        document.querySelectorAll('.sample-btn-primary').forEach(el => el.style.backgroundColor = `#${state.hex}`);
        document.querySelectorAll('.sample-btn-outline').forEach(el => {
            el.style.borderColor = `#${state.hex}`;
            el.style.color = `#${state.hex}`;
        });
        document.querySelectorAll('.sample-dot').forEach(el => el.style.backgroundColor = `#${state.hex}`);
        document.querySelectorAll('.sample-text').forEach(el => el.style.color = `#${state.hex}`);
    }
}

export function renderColorBlindness() {
    const types = [
        { key: 'cb_protanopia', type: 'protanopia' },
        { key: 'cb_deuteranopia', type: 'deuteranopia' },
        { key: 'cb_tritanopia', type: 'tritanopia' },
        { key: 'cb_achromatopsia', type: 'achromatopsia' }
    ];

    dom.cbSimulator.innerHTML = '';
    types.forEach(t => {
        const transformed = ColorUtils.simulateBlindness(state.rgb, t.type);
        const hex = ColorUtils.rgbToHex(transformed.r, transformed.g, transformed.b);
        const label = translations[state.currentLang][t.key];

        const item = document.createElement('div');
        item.className = 'cb-item';
        item.innerHTML = `
            <div class="cb-preview" style="background-color: #${hex}"></div>
            <span class="label-tiny">${label}</span>
        `;
        dom.cbSimulator.appendChild(item);
    });
}

export function updateDynamicTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    document.documentElement.style.setProperty('--md-sys-color-primary', `#${state.hex}`);
    
    const primary = state.rgb;
    
    // Set Gradient Colors
    document.documentElement.style.setProperty('--gradient-color-1', `#${state.hex}`);
    const mixColorForGrad = isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
    const mixedGrad = ColorUtils.mixColors(primary, mixColorForGrad, 40);
    document.documentElement.style.setProperty('--gradient-color-2', `#${ColorUtils.rgbToHex(mixedGrad.r, mixedGrad.g, mixedGrad.b)}`);
    const h1 = (state.hsl.h + 45) % 360;
    const rgb1 = ColorUtils.hslToRgb(h1, state.hsl.s, state.hsl.l);
    document.documentElement.style.setProperty('--gradient-color-3', `#${ColorUtils.rgbToHex(rgb1.r, rgb1.g, rgb1.b)}`);

    if (!isDark) {
        const white = { r: 255, g: 255, b: 255 };
        const mixHex = (w, alpha = 0.85) => {
            const m = ColorUtils.mixColors(primary, white, w);
            return `rgba(${m.r}, ${m.g}, ${m.b}, ${alpha})`;
        };

        // Tint surfaces with primary color
        document.documentElement.style.setProperty('--md-sys-color-surface', mixHex(98, 0.9));
        document.documentElement.style.setProperty('--md-sys-color-surface-container-low', mixHex(96));
        document.documentElement.style.setProperty('--md-sys-color-surface-container', mixHex(94));
        document.documentElement.style.setProperty('--md-sys-color-surface-container-high', mixHex(92));
        document.documentElement.style.setProperty('--md-sys-color-surface-container-highest', mixHex(90));
        document.documentElement.style.setProperty('--md-sys-color-surface-variant', mixHex(85));
        
        // Tint containers
        document.documentElement.style.setProperty('--md-sys-color-primary-container', mixHex(80));
        document.documentElement.style.setProperty('--md-sys-color-secondary-container', mixHex(85));
        document.documentElement.style.setProperty('--md-sys-color-on-primary-container', `#${ColorUtils.rgbToHex(...Object.values(ColorUtils.mixColors(primary, white, 10)))}`);
        document.documentElement.style.setProperty('--md-sys-color-on-secondary-container', `#${ColorUtils.rgbToHex(...Object.values(ColorUtils.mixColors(primary, white, 20)))}`);
    } else {
        const black = { r: 0, g: 0, b: 0 };
        const mixHex = (w, alpha = 0.85) => {
            const m = ColorUtils.mixColors(primary, black, w);
            return `rgba(${m.r}, ${m.g}, ${m.b}, ${alpha})`;
        };

        // Tint dark surfaces with primary color
        document.documentElement.style.setProperty('--md-sys-color-surface', mixHex(95, 0.9));
        document.documentElement.style.setProperty('--md-sys-color-surface-container-low', mixHex(93));
        document.documentElement.style.setProperty('--md-sys-color-surface-container', mixHex(90));
        document.documentElement.style.setProperty('--md-sys-color-surface-container-high', mixHex(85));
        document.documentElement.style.setProperty('--md-sys-color-surface-container-highest', mixHex(80));
        document.documentElement.style.setProperty('--md-sys-color-surface-variant', mixHex(75));

        // Tint dark containers
        document.documentElement.style.setProperty('--md-sys-color-primary-container', mixHex(60));
        document.documentElement.style.setProperty('--md-sys-color-secondary-container', mixHex(70));
        
        // Dark mode text on containers should be light
        const whiteMixHex = (w) => {
            const m = ColorUtils.mixColors(primary, { r: 255, g: 255, b: 255 }, w);
            return `#${ColorUtils.rgbToHex(m.r, m.g, m.b)}`;
        };
        document.documentElement.style.setProperty('--md-sys-color-on-primary-container', whiteMixHex(90));
        document.documentElement.style.setProperty('--md-sys-color-on-secondary-container', whiteMixHex(85));
    }
}

export function updateBestText() {
    const whiteRatio = ColorUtils.getContrastRatio(state.rgb, { r: 255, g: 255, b: 255 });
    const blackRatio = ColorUtils.getContrastRatio(state.rgb, { r: 0, g: 0, b: 0 });
    
    const best = whiteRatio > blackRatio ? 'white' : 'black';
    dom.bestTextColor.style.backgroundColor = best === 'white' ? '#FFFFFF' : '#000000';
    dom.bestTextColor.style.color = `#${state.hex}`;
    dom.bestTextColor.textContent = `${best === 'white' ? 'White' : 'Black'} (${Math.max(whiteRatio, blackRatio).toFixed(1)}:1)`;
}

export function renderSavedPalette() {
    dom.paletteContainer.innerHTML = '';
    state.palette.forEach((hex, index) => {
        const item = document.createElement('div');
        item.className = 'palette-item';
        item.style.backgroundColor = `#${hex}`;
        item.onclick = (e) => {
            if (e.target.classList.contains('remove-btn')) return;
            updateColorState(hex);
        };

        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-btn material-symbols-outlined';
        removeBtn.textContent = 'close';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            removeFromPalette(index);
        };

        item.appendChild(removeBtn);
        dom.paletteContainer.appendChild(item);
    });
}

export function updateWCAG() {
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    
    const whiteRatio = ColorUtils.getContrastRatio(state.rgb, white);
    const blackRatio = ColorUtils.getContrastRatio(state.rgb, black);

    dom.wcagWhiteRatio.textContent = `${whiteRatio.toFixed(1)}:1`;
    dom.wcagBlackRatio.textContent = `${blackRatio.toFixed(1)}:1`;

    renderWCAGBadges(dom.wcagWhiteBadges, whiteRatio);
    renderWCAGBadges(dom.wcagBlackBadges, blackRatio);
}

function renderWCAGBadges(container, ratio) {
    container.innerHTML = '';
    const checks = [
        { label: 'AA Large', threshold: 3 },
        { label: 'AA Normal', threshold: 4.5 },
        { label: 'AAA', threshold: 7 }
    ];
    checks.forEach(c => {
        const badge = document.createElement('span');
        const pass = ratio >= c.threshold;
        badge.className = `badge ${pass ? 'badge-pass' : 'badge-fail'}`;
        badge.textContent = `${c.label} ${pass ? '✓' : '×'}`;
        container.appendChild(badge);
    });
}

export function renderVariations() {
    const weights = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    const grey = { r: 128, g: 128, b: 128 };

    const genRow = (row, targetColor) => {
        row.innerHTML = '';
        weights.forEach(w => {
            const mixed = ColorUtils.mixColors(state.rgb, targetColor, w);
            const mixedHex = ColorUtils.rgbToHex(mixed.r, mixed.g, mixed.b);
            const box = document.createElement('div');
            box.className = 'variant-box';
            box.style.backgroundColor = `#${mixedHex}`;
            box.innerHTML = `<span class="label-tiny" style="color: ${ColorUtils.getLuminance(mixed.r, mixed.g, mixed.b) > 0.5 ? 'black' : 'white'}">${w}%</span>`;
            box.title = `#${mixedHex}`;
            box.onclick = () => updateColorState(mixedHex);
            row.appendChild(box);
        });
    };

    genRow(dom.tintsRow, white);
    genRow(dom.shadesRow, black);
    genRow(dom.tonesRow, grey);
}

export function renderHarmonies() {
    const h = state.hsl.h;
    const s = state.hsl.s;
    const l = state.hsl.l;

    const harmonyTypes = [
        { name: 'complementary', angles: [(h + 180) % 360] },
        { name: 'analogous', angles: [(h + 30) % 360, (h - 30 + 360) % 360] },
        { name: 'triadic', angles: [(h + 120) % 360, (h + 240) % 360] },
        { name: 'tetradic', angles: [(h + 90) % 360, (h + 180) % 360, (h + 270) % 360] },
        { name: 'monochromatic', adjustments: [[0, -20], [0, 20], [-20, 0], [20, 0]] }
    ];

    dom.harmoniesContainer.innerHTML = '';
    harmonyTypes.forEach(type => {
        const group = document.createElement('div');
        group.className = 'harmony-group';
        group.innerHTML = `<div class="harmony-header"><span class="label-large">${translations[state.currentLang][type.name]}</span></div>`;

        const colorsDiv = document.createElement('div');
        colorsDiv.className = 'harmony-colors';

        const baseBox = createHarmonyBox(state.rgb.r, state.rgb.g, state.rgb.b);
        colorsDiv.appendChild(baseBox);

        if (type.angles) {
            type.angles.forEach(angle => {
                const rgb = ColorUtils.hslToRgb(angle, s, l);
                colorsDiv.appendChild(createHarmonyBox(rgb.r, rgb.g, rgb.b));
            });
        } else if (type.adjustments) {
            type.adjustments.forEach(([ds, dl]) => {
                const ns = Math.max(0, Math.min(100, s + ds));
                const nl = Math.max(0, Math.min(100, l + dl));
                const rgb = ColorUtils.hslToRgb(h, ns, nl);
                colorsDiv.appendChild(createHarmonyBox(rgb.r, rgb.g, rgb.b));
            });
        }

        group.appendChild(colorsDiv);
        dom.harmoniesContainer.appendChild(group);
    });
}

function createHarmonyBox(r, g, b) {
    const hex = ColorUtils.rgbToHex(r, g, b);
    const box = document.createElement('div');
    box.className = 'harmony-box';
    box.style.backgroundColor = `#${hex}`;
    box.title = `#${hex}`;
    box.onclick = () => updateColorState(hex);
    return box;
}

export function setLanguage(lang) {
    state.currentLang = lang;
    localStorage.setItem('app_lang', state.currentLang);
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[state.currentLang][key]) el.textContent = translations[state.currentLang][key];
    });

    document.querySelectorAll('[data-i18n-target]').forEach(el => {
        const key = el.getAttribute('data-i18n-target');
        if (translations[state.currentLang][key]) el.textContent = translations[state.currentLang][key];
    });

    dom.appTitle.textContent = translations[state.currentLang].app_title;
    
    // Update active state in menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-lang') === lang);
    });

    // Re-render dynamic elements that depend on language
    if (state.hex) {
        renderColorBlindness();
        renderHarmonies();
    }
}

export function updateExportContent() {
    const weights = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    const tints = weights.map(w => ColorUtils.rgbToHex(...Object.values(ColorUtils.mixColors(state.rgb, {r:255,g:255,b:255}, w))));
    const shades = weights.map(w => ColorUtils.rgbToHex(...Object.values(ColorUtils.mixColors(state.rgb, {r:0,g:0,b:0}, w))));

    // CSS
    let css = `:root {\n  --primary: #${state.hex};\n`;
    tints.forEach((h, i) => css += `  --primary-tint-${(i+1)*10}: #${h};\n`);
    shades.forEach((h, i) => css += `  --primary-shade-${(i+1)*10}: #${h};\n`);
    css += `}`;
    document.getElementById('code-css').textContent = css;

    // Tailwind v4
    let tw = `/* Tailwind v4 config (CSS-first) */\n@theme {\n  --color-brand: oklch(${state.oklch.l.toFixed(1)}% ${state.oklch.c.toFixed(3)} ${state.oklch.h.toFixed(1)});\n`;
    tints.forEach((h, i) => {
        const lch = ColorUtils.rgbToOklch(...Object.values(ColorUtils.hexToRgb(h)));
        tw += `  --color-brand-${(i+1)*10}0: oklch(${lch.l.toFixed(1)}% ${lch.c.toFixed(3)} ${lch.h.toFixed(1)});\n`;
    });
    shades.forEach((h, i) => {
        const lch = ColorUtils.rgbToOklch(...Object.values(ColorUtils.hexToRgb(h)));
        tw += `  --color-brand-shade-${(i+1)*10}0: oklch(${lch.l.toFixed(1)}% ${lch.c.toFixed(3)} ${lch.h.toFixed(1)});\n`;
    });
    tw += `}`;
    document.getElementById('code-tailwind').textContent = tw;

    // JSON
    const data = {
        hex: state.hex,
        rgb: state.rgb,
        hsl: state.hsl,
        oklch: state.oklch,
        name: ColorUtils.getColorName(state.hex),
        tints: tints.map(h => `#${h}`),
        shades: shades.map(h => `#${h}`)
    };
    document.getElementById('code-json').textContent = JSON.stringify(data, null, 2);
}

export function showToast() {
    dom.toast.textContent = translations[state.currentLang].copied;
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2000);
}

export function exportPaletteImage() {
    const canvas = document.createElement('canvas');
    const colors = state.palette.length > 0 ? state.palette : [state.hex];
    const colorCount = colors.length;
    
    // Set responsive width based on color count, max height 300
    const stripWidth = Math.max(150, 600 / colorCount);
    canvas.width = stripWidth * colorCount;
    canvas.height = 300;
    
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    colors.forEach((hex, i) => {
        // Color block
        ctx.fillStyle = `#${hex}`;
        ctx.fillRect(i * stripWidth, 0, stripWidth, 230);
        
        // Hex text
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 20px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`#${hex}`, i * stripWidth + stripWidth / 2, 270);
    });

    const link = document.createElement('a');
    link.download = `palette-export.png`;
    link.href = canvas.toDataURL();
    link.click();
}
