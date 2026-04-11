const translations = {
    en: {
        app_title: "Limorina Color Checker",
        input_color: "Input Color",
        variations: "Tints, Shades & Tones",
        tints: "Tints (Mix with White)",
        shades: "Shades (Mix with Black)",
        tones: "Tones (Mix with Grey)",
        harmonies: "Color Harmonies",
        copied: "Copied to clipboard!",
        complementary: "Complementary",
        analogous: "Analogous",
        triadic: "Triadic",
        tetradic: "Tetradic",
        monochromatic: "Monochromatic",
        accessibility: "WCAG Accessibility",
        on_white: "On White",
        on_black: "On Black",
        export_hub: "Export Hub",
        copy_all: "Copy All Template",
        help_title: "User Guide & Glossary",
        guide_color_formats_title: "1. Color Formats",
        guide_color_formats_desc: "How color is represented in code.",
        desc_hex: "6-digit code (e.g. #6750A4). Standard for web design.",
        desc_rgb: "Red, Green, Blue (0-255). Used for screen displays.",
        desc_hsl: "Hue (color), Saturation (intensity), Lightness (brightness). Great for designers.",
        desc_cmyk: "Cyan, Magenta, Yellow, Black (0-100%). Used for physical printing.",
        guide_variations_title: "2. Color Variations",
        desc_tints: "Colors mixed with White. Increases light.",
        desc_shades: "Colors mixed with Black. Decreases light.",
        desc_tones: "Colors mixed with Grey. Mutes the color.",
        guide_wcag_title: "3. Accessibility (WCAG)",
        guide_wcag_desc: "WCAG ensures colors are readable for everyone, including those with visual impairments.",
        desc_ratio: "Brightness difference. Higher is better.",
        desc_aa: "Standard compliance (4.5:1 ratio). Recommended for all websites.",
        desc_aaa: "Enhanced compliance (7:1 ratio). Highest accessibility tier.",
        guide_harmonies_title: "4. Color Harmonies",
        guide_harmonies_desc: "Predefined rules for picking colors that look good together based on the color wheel.",
        got_it: "Got it!"
    },
    vi: {
        app_title: "Limorina Color Checker",
        input_color: "Nhập mã màu",
        variations: "Sắc độ & Sắc thái",
        tints: "Sắc sáng (Pha với trắng)",
        shades: "Sắc tối (Pha với đen)",
        tones: "Sắc trung (Pha với xám)",
        harmonies: "Nguyên tắc phối màu",
        copied: "Đã sao chép!",
        complementary: "Phối màu Bổ túc",
        analogous: "Phối màu Tương đồng",
        triadic: "Phối màu Tam giác",
        tetradic: "Phối màu Chữ nhật",
        monochromatic: "Phối màu Đơn sắc",
        accessibility: "Độ tương phản WCAG",
        on_white: "Trên nền Trắng",
        on_black: "Trên nền Đen",
        export_hub: "Cổng xuất dữ liệu",
        copy_all: "Sao chép tất cả",
        help_title: "Hướng dẫn & Giải nghĩa",
        guide_color_formats_title: "1. Định dạng màu",
        guide_color_formats_desc: "Cách màu sắc được biểu diễn trong mã nguồn.",
        desc_hex: "Mã 6 ký tự (VD: #6750A4). Tiêu chuẩn thiết kế web.",
        desc_rgb: "Đỏ, Xanh lá, Xanh dương (0-255). Dùng cho màn hình.",
        desc_hsl: "Sắc màu, Độ bão hòa, Độ sáng. Rất trực quan cho thiết kế.",
        desc_cmyk: "Lục lam, Hồng sẫm, Vàng, Đen (0-100%). Dùng cho in ấn thực tế.",
        guide_variations_title: "2. Biến thể màu sắc",
        desc_tints: "Màu pha với Trắng. Làm màu sáng hơn.",
        desc_shades: "Màu pha với Đen. Làm màu tối đi.",
        desc_tones: "Màu pha với Xám. Làm màu đục/dịu hơn.",
        guide_wcag_title: "3. Độ tương phản (WCAG)",
        guide_wcag_desc: "Tiêu chuẩn giúp nội dung dễ đọc cho tất cả mọi người, kể cả người khiếm thị.",
        desc_ratio: "Sự khác biệt độ sáng. Càng cao càng dễ đọc.",
        desc_aa: "Mức tiêu chuẩn (tỉ lệ 4.5:1). Khuyên dùng cho mọi web.",
        desc_aaa: "Mức cao nhất (tỉ lệ 7:1). Khả năng tiếp cận tối đa.",
        guide_harmonies_title: "4. Nguyên tắc phối màu",
        guide_harmonies_desc: "Các quy luật chọn màu sắc hài hòa dựa trên vòng tròn màu sắc.",
        got_it: "Đã hiểu!"
    }
};

let currentLang = 'en';

// --- Color Utilities ---
const ColorUtils = {
    hexToRgb(hex) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return { r, g, b };
    },

    rgbToHex(r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    },

    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) h = s = 0;
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    },

    hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        };
    },

    rgbToCmyk(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const k = 1 - Math.max(r, g, b);
        if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);
        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    },

    mixColors(rgb1, rgb2, weight) {
        const w = weight / 100;
        return {
            r: Math.round(rgb1.r * (1 - w) + rgb2.r * w),
            g: Math.round(rgb1.g * (1 - w) + rgb2.g * w),
            b: Math.round(rgb1.b * (1 - w) + rgb2.b * w)
        };
    },

    getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    },

    getContrastRatio(rgb1, rgb2) {
        const L1 = ColorUtils.getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const L2 = ColorUtils.getLuminance(rgb2.r, rgb2.g, rgb2.b);
        return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    }
};

// --- App State & UI ---
const state = {
    hex: "6750A4",
    rgb: { r: 103, g: 80, b: 164 },
    hsl: { h: 256, s: 34, l: 48 },
    cmyk: { c: 37, m: 51, y: 0, k: 36 }
};

const dom = {
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
    langToggle: document.getElementById('lang-toggle'),
    exportHubBtn: document.getElementById('export-hub-btn'),
    exportModal: document.getElementById('export-modal'),
    helpBtn: document.getElementById('help-btn'),
    helpModal: document.getElementById('help-modal'),
    closeHelp: document.getElementById('close-help'),
    closeHelpConfirm: document.getElementById('close-help-confirm'),
    closeModal: document.getElementById('close-modal'),
    copyExportBtn: document.getElementById('copy-export'),
    appTitle: document.getElementById('app-title'),
    toast: document.getElementById('toast'),
    wcagWhiteRatio: document.getElementById('wcag-white-ratio'),
    wcagBlackRatio: document.getElementById('wcag-black-ratio'),
    wcagWhiteBadges: document.getElementById('wcag-white-badges'),
    wcagBlackBadges: document.getElementById('wcag-black-badges')
};

function updateColorState(hex) {
    if (!/^[0-9A-F]{6}$/i.test(hex)) return;
    state.hex = hex.toUpperCase();
    state.rgb = ColorUtils.hexToRgb(state.hex);
    state.hsl = ColorUtils.rgbToHsl(state.rgb.r, state.rgb.g, state.rgb.b);
    state.cmyk = ColorUtils.rgbToCmyk(state.rgb.r, state.rgb.g, state.rgb.b);
    renderAll();
}

function renderAll() {
    // 1. Update Columns 1
    dom.preview.style.backgroundColor = `#${state.hex}`;
    dom.hexInput.value = state.hex;
    dom.colorPicker.value = `#${state.hex}`;
    dom.rgbOutput.textContent = `rgb(${state.rgb.r}, ${state.rgb.g}, ${state.rgb.b})`;
    dom.hslOutput.textContent = `${Math.round(state.hsl.h)}°, ${Math.round(state.hsl.s)}%, ${Math.round(state.hsl.l)}%`;
    dom.cmykOutput.textContent = `${state.cmyk.c}, ${state.cmyk.m}, ${state.cmyk.y}, ${state.cmyk.k}`;

    // Update dynamic theme color
    document.documentElement.style.setProperty('--md-sys-color-primary', `#${state.hex}`);

    // 2. Column 2: Variations
    renderVariations();

    // 3. Column 3: Harmonies
    renderHarmonies();

    // 4. Update WCAG
    updateWCAG();
}

function updateWCAG() {
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

function renderVariations() {
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

function renderHarmonies() {
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
        group.innerHTML = `<div class="harmony-header"><span class="label-large">${translations[currentLang][type.name]}</span></div>`;

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

// --- Localization ---
function toggleLang() {
    currentLang = currentLang === 'en' ? 'vi' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = translations[currentLang][key];
    });
    dom.appTitle.textContent = translations[currentLang].app_title;
    renderAll();
}

// --- Clipboard ---
function showToast() {
    dom.toast.textContent = translations[currentLang].copied;
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2000);
}

// --- Export Hub ---
function updateExportContent() {
    const weights = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    const tints = weights.map(w => ColorUtils.rgbToHex(...Object.values(ColorUtils.mixColors(state.rgb, {r:255,g:255,b:255}, w))));
    const shades = weights.map(w => ColorUtils.rgbToHex(...Object.values(ColorUtils.mixColors(state.rgb, {r:0,g:0,b:0}, w))));

    // CSS
    let css = `:root {\n  --primary: #${state.hex};\n`;
    tints.forEach((h, i) => css += `  --primary-tint-${(i+1)*10}: #${h};\n`);
    shades.forEach((h, i) => css += `  --primary-shade-${(i+1)*10}: #${h};\n`);
    css += `}`;
    document.getElementById('code-css').textContent = css;

    // Tailwind
    let tw = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n        brand: {\n          DEFAULT: '#${state.hex}',\n`;
    tints.forEach((h, i) => tw += `          '${(i+1)*10}0': '#${h}',\n`);
    shades.forEach((h, i) => tw += `          'shade-${(i+1)*10}0': '#${h}',\n`);
    tw += `        }\n      }\n    }\n  }\n}`;
    document.getElementById('code-tailwind').textContent = tw;

    // JSON
    const data = {
        hex: state.hex,
        rgb: state.rgb,
        hsl: state.hsl,
        tints: tints.map(h => `#${h}`),
        shades: shades.map(h => `#${h}`)
    };
    document.getElementById('code-json').textContent = JSON.stringify(data, null, 2);
}

// --- Events ---
dom.hexInput.oninput = (e) => updateColorState(e.target.value);
dom.colorPicker.oninput = (e) => updateColorState(e.target.value.substring(1));
dom.themeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
    dom.themeToggle.children[0].textContent = document.body.classList.contains('dark-mode') ? 'light_mode' : 'dark_mode';
};
dom.langToggle.onclick = toggleLang;

dom.exportHubBtn.onclick = () => {
    updateExportContent();
    dom.exportModal.classList.add('show');
};

dom.closeModal.onclick = () => dom.exportModal.classList.remove('show');

dom.helpBtn.onclick = () => dom.helpModal.classList.add('show');
dom.closeHelp.onclick = dom.closeHelpConfirm.onclick = () => dom.helpModal.classList.remove('show');

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`export-content-${btn.getAttribute('data-tab')}`).classList.add('active');
    };
});

dom.copyExportBtn.onclick = () => {
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    const text = document.getElementById(`code-${activeTab}`).textContent;
    navigator.clipboard.writeText(text).then(showToast);
};

document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.onclick = () => {
        const targetId = btn.getAttribute('data-target');
        const text = document.getElementById(targetId).textContent;
        navigator.clipboard.writeText(text).then(showToast);
    };
});

// Init
updateColorState("6750A4");
