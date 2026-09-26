import { ColorUtils } from '../assets/script/utils.js';
import { translations } from '../assets/script/config.js';
import { initLayout, layoutState } from '../assets/script/shared/layout.js';
import { ProjectManager } from '../assets/script/projects.js';

const urlParams = new URLSearchParams(window.location.search);
const urlBg = urlParams.get('bg');
const urlFg = urlParams.get('fg');

const state = {
    bg: (urlBg && /^[0-9A-F]{6}$/i.test(urlBg)) ? urlBg.toUpperCase() : "FFFFFF",
    fg: (urlFg && /^[0-9A-F]{6}$/i.test(urlFg)) ? urlFg.toUpperCase() : (localStorage.getItem('active_hex') || "624E9A")
};

const dom = {};

document.addEventListener('DOMContentLoaded', () => {
    initLayout('contrast');
    
    bindDOM();
    attachEvents();
    
    // Initial calculation
    updateCustomContrast();
});

// Watch language changes from shared layout
window.addEventListener('langchange', () => {
    updateCustomContrast();
});

function bindDOM() {
    Object.assign(dom, {
        bgHex: document.getElementById('custom-bg-hex'),
        fgHex: document.getElementById('custom-fg-hex'),
        bgPicker: document.getElementById('custom-bg-picker'),
        fgPicker: document.getElementById('custom-fg-picker'),
        swapBtn: document.getElementById('swap-contrast-btn'),
        preview: document.getElementById('custom-contrast-preview'),
        ratio: document.getElementById('custom-contrast-ratio'),
        badges: document.getElementById('custom-contrast-badges'),
        apcaRatio: document.getElementById('custom-apca-ratio'),
        apcaBadge: document.getElementById('custom-apca-badge'),
        bgEyeDropper: document.getElementById('bg-eyedropper-btn'),
        fgEyeDropper: document.getElementById('fg-eyedropper-btn'),
        autofixContainer: document.getElementById('autofix-container'),
        autofixAaBtn: document.getElementById('autofix-aa-btn'),
        autofixAaaBtn: document.getElementById('autofix-aaa-btn'),
        saveProjectBtn: document.getElementById('save-pair-to-project-btn'),
        shareBtn: document.getElementById('share-contrast-btn'),
        toast: document.getElementById('toast')
    });

    if (dom.bgHex) dom.bgHex.value = state.bg;
    if (dom.fgHex) dom.fgHex.value = state.fg;
    if (dom.bgPicker) dom.bgPicker.value = `#${state.bg}`;
    if (dom.fgPicker) dom.fgPicker.value = `#${state.fg}`;

    if ('EyeDropper' in window) {
        if (dom.bgEyeDropper) dom.bgEyeDropper.style.display = 'flex';
        if (dom.fgEyeDropper) dom.fgEyeDropper.style.display = 'flex';
    }
}

function attachEvents() {
    const onInput = (inputEl, pickerEl, stateKey) => {
        inputEl.addEventListener('input', (e) => {
            let val = e.target.value.replace('#', '');
            if (val.length === 3) val = val.split('').map(c => c + c).join('');
            if (/^[0-9A-F]{6}$/i.test(val)) {
                state[stateKey] = val.toUpperCase();
                pickerEl.value = `#${state[stateKey]}`;
                updateCustomContrast();
            }
        });
        
        pickerEl.addEventListener('input', (e) => {
            const val = e.target.value.replace('#', '').toUpperCase();
            state[stateKey] = val;
            inputEl.value = val;
            updateCustomContrast();
        });
    };

    onInput(dom.bgHex, dom.bgPicker, 'bg');
    onInput(dom.fgHex, dom.fgPicker, 'fg');

    const setupEyeDropper = (btnEl, inputEl, pickerEl, stateKey) => {
        if (!btnEl) return;
        btnEl.style.display = 'flex';
        btnEl.addEventListener('click', async () => {
            if (!('EyeDropper' in window)) {
                const toast = document.getElementById('toast');
                if (toast) {
                    toast.textContent = translations[layoutState.currentLang]?.eyedropper_not_supported || 'EyeDropper is not supported in this browser.';
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3000);
                }
                return;
            }
            try {
                const eyeDropper = new EyeDropper();
                const result = await eyeDropper.open();
                if (result && result.sRGBHex) {
                    const hex = result.sRGBHex.replace('#', '').toUpperCase();
                    state[stateKey] = hex;
                    inputEl.value = hex;
                    pickerEl.value = `#${hex}`;
                    updateCustomContrast();
                }
            } catch (err) {
                if (err && err.name === 'AbortError') return;
                console.warn('EyeDropper failed:', err);
            }
        });
    };

    setupEyeDropper(dom.bgEyeDropper, dom.bgHex, dom.bgPicker, 'bg');
    setupEyeDropper(dom.fgEyeDropper, dom.fgHex, dom.fgPicker, 'fg');

    dom.swapBtn.addEventListener('click', () => {
        const temp = state.bg;
        state.bg = state.fg;
        state.fg = temp;
        
        dom.bgHex.value = state.bg;
        dom.fgHex.value = state.fg;
        dom.bgPicker.value = `#${state.bg}`;
        dom.fgPicker.value = `#${state.fg}`;
        
        updateCustomContrast();
    });

    if (dom.autofixAaBtn) {
        dom.autofixAaBtn.addEventListener('click', () => {
            const newFg = calculateAutoFixColor(4.5);
            if (newFg) {
                state.fg = newFg;
                dom.fgHex.value = state.fg;
                dom.fgPicker.value = `#${state.fg}`;
                updateCustomContrast();
                showToast(translations[layoutState.currentLang]?.auto_fix_applied || 'Adjusted color for accessibility!');
            }
        });
    }

    if (dom.autofixAaaBtn) {
        dom.autofixAaaBtn.addEventListener('click', () => {
            const newFg = calculateAutoFixColor(7.0);
            if (newFg) {
                state.fg = newFg;
                dom.fgHex.value = state.fg;
                dom.fgPicker.value = `#${state.fg}`;
                updateCustomContrast();
                showToast(translations[layoutState.currentLang]?.auto_fix_applied || 'Adjusted color for accessibility!');
            }
        });
    }

    if (dom.saveProjectBtn) {
        dom.saveProjectBtn.addEventListener('click', () => {
            ProjectManager.addColorToActiveProject(state.bg);
            ProjectManager.addColorToActiveProject(state.fg);
            showToast(translations[layoutState.currentLang]?.saved_to_project_success || 'Saved colors to project!');
        });
    }

    if (dom.shareBtn) {
        dom.shareBtn.addEventListener('click', () => {
            const shareUrl = `${window.location.origin}${window.location.pathname}?bg=${state.bg}&fg=${state.fg}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                showToast(translations[layoutState.currentLang]?.contrast_shared_copied || 'Share link copied to clipboard!');
            });
        });
    }
}

function updateCustomContrast() {
    if (!dom.bgHex || !dom.fgHex) return;

    const bgRgb = ColorUtils.hexToRgb(state.bg);
    const fgRgb = ColorUtils.hexToRgb(state.fg);
    
    const ratio = ColorUtils.getContrastRatio(bgRgb, fgRgb);
    
    dom.ratio.textContent = `${ratio.toFixed(1)}:1`;
    dom.preview.style.backgroundColor = `#${state.bg}`;
    dom.preview.style.color = `#${state.fg}`;
    
    renderCustomWCAGBadges(dom.badges, ratio);

    // Auto-Fix Box Visibility
    if (dom.autofixContainer) {
        if (ratio < 4.5) {
            dom.autofixContainer.style.display = 'block';
            if (dom.autofixAaBtn) dom.autofixAaBtn.style.display = 'inline-flex';
            if (dom.autofixAaaBtn) dom.autofixAaaBtn.style.display = 'inline-flex';
        } else if (ratio < 7.0) {
            dom.autofixContainer.style.display = 'block';
            if (dom.autofixAaBtn) dom.autofixAaBtn.style.display = 'none';
            if (dom.autofixAaaBtn) dom.autofixAaaBtn.style.display = 'inline-flex';
        } else {
            dom.autofixContainer.style.display = 'none';
        }
    }

    // Keep URL parameter in sync
    const newUrl = `${window.location.pathname}?bg=${state.bg}&fg=${state.fg}`;
    window.history.replaceState(null, '', newUrl);

    // APCA
    const apcaVal = ColorUtils.getAPCAContrast(fgRgb, bgRgb);
    dom.apcaRatio.textContent = `Lc ${Math.round(apcaVal)}`;
    
    const absScore = Math.abs(apcaVal);
    dom.apcaBadge.className = 'badge large-badge';
    
    if (absScore >= 75) {
        dom.apcaBadge.classList.add('badge-pass');
        dom.apcaBadge.textContent = 'Lc 75+ (Body)';
        dom.apcaBadge.style.backgroundColor = '';
        dom.apcaBadge.style.color = '';
    } else if (absScore >= 60) {
        dom.apcaBadge.classList.add('badge-pass');
        dom.apcaBadge.textContent = 'Lc 60+ (Large)';
        dom.apcaBadge.style.backgroundColor = 'var(--md-sys-color-primary)';
        dom.apcaBadge.style.color = 'var(--md-sys-color-on-primary)';
    } else if (absScore >= 45) {
        dom.apcaBadge.classList.add('badge-pass');
        dom.apcaBadge.textContent = 'Lc 45+ (Heading)';
        dom.apcaBadge.style.backgroundColor = 'var(--md-sys-color-secondary)';
        dom.apcaBadge.style.color = 'var(--md-sys-color-on-secondary)';
    } else {
        dom.apcaBadge.classList.add('badge-fail');
        dom.apcaBadge.textContent = `Lc ${Math.round(apcaVal)} (Fail)`;
        dom.apcaBadge.style.backgroundColor = '';
        dom.apcaBadge.style.color = '';
    }
}

function calculateAutoFixColor(targetRatio) {
    const bgRgb = ColorUtils.hexToRgb(state.bg);
    const fgRgb = ColorUtils.hexToRgb(state.fg);
    const currentRatio = ColorUtils.getContrastRatio(bgRgb, fgRgb);
    if (currentRatio >= targetRatio) return null;

    const bgLum = ColorUtils.getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const fgOklch = ColorUtils.rgbToOklch(fgRgb.r, fgRgb.g, fgRgb.b);

    const shouldDarken = bgLum > 0.4;
    let bestHex = null;

    const startL = Math.round(fgOklch.l * 2) / 2;
    if (shouldDarken) {
        for (let testL = startL; testL >= 0; testL -= 0.5) {
            const chromaFactor = Math.min(1, testL / 25);
            const testRgb = ColorUtils.oklchToRgb(testL, fgOklch.c * chromaFactor, fgOklch.h);
            const ratio = ColorUtils.getContrastRatio(bgRgb, testRgb);
            if (ratio >= targetRatio) {
                bestHex = ColorUtils.rgbToHex(testRgb.r, testRgb.g, testRgb.b);
                break;
            }
        }
    } else {
        for (let testL = startL; testL <= 100; testL += 0.5) {
            const chromaFactor = Math.min(1, (100 - testL) / 25);
            const testRgb = ColorUtils.oklchToRgb(testL, fgOklch.c * chromaFactor, fgOklch.h);
            const ratio = ColorUtils.getContrastRatio(bgRgb, testRgb);
            if (ratio >= targetRatio) {
                bestHex = ColorUtils.rgbToHex(testRgb.r, testRgb.g, testRgb.b);
                break;
            }
        }
    }

    if (!bestHex) {
        bestHex = shouldDarken ? "000000" : "FFFFFF";
    }

    return bestHex;
}

function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2500);
}

function renderCustomWCAGBadges(container, ratio) {
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
