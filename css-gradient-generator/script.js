import { ColorUtils } from '../assets/script/utils.js';
import { translations } from '../assets/script/config.js';
import { initLayout, layoutState } from '../assets/script/shared/layout.js';

const state = {
    hex1: localStorage.getItem('active_hex') || "624E9A",
    hex2: "EADDFF",
    type: "linear",
    angle: 90
};

const dom = {};

document.addEventListener('DOMContentLoaded', () => {
    initLayout('gradient');
    
    // Compute second color dynamically from first
    const rgb1 = ColorUtils.hexToRgb(state.hex1);
    const hsl1 = ColorUtils.rgbToHsl(rgb1.r, rgb1.g, rgb1.b);
    const h2 = (hsl1.h + 45) % 360;
    const rgb2 = ColorUtils.hslToRgb(h2, hsl1.s, hsl1.l);
    state.hex2 = ColorUtils.rgbToHex(rgb2.r, rgb2.g, rgb2.b).toUpperCase();

    bindDOM();
    attachEvents();
    
    updateGradient();
});

// Watch language changes from shared layout
window.addEventListener('langchange', () => {
    // No language-specific dynamic renders inside the gradient container, but handled by translation engine
});

function bindDOM() {
    Object.assign(dom, {
        btnTabs: document.getElementById('gradient-tabs'),
        btnLinear: document.getElementById('grad-linear'),
        btnRadial: document.getElementById('grad-radial'),
        angleSlider: document.getElementById('grad-angle'),
        angleVal: document.getElementById('grad-angle-val'),
        angleGroup: document.getElementById('grad-angle-group'),
        color1: document.getElementById('grad-color-1'),
        color2: document.getElementById('grad-color-2'),
        hex1: document.getElementById('grad-hex-1'),
        hex2: document.getElementById('grad-hex-2'),
        preview: document.getElementById('gradient-preview'),
        code: document.getElementById('gradient-code'),
        copyBtn: document.getElementById('copy-gradient-btn'),
        toast: document.getElementById('toast'),
        eyedropperBtn1: document.getElementById('eyedropper-btn-1'),
        eyedropperBtn2: document.getElementById('eyedropper-btn-2')
    });

    if (dom.hex1) dom.hex1.value = state.hex1;
    if (dom.hex2) dom.hex2.value = state.hex2;
    if (dom.color1) dom.color1.value = `#${state.hex1}`;
    if (dom.color2) dom.color2.value = `#${state.hex2}`;

    if ('EyeDropper' in window) {
        if (dom.eyedropperBtn1) dom.eyedropperBtn1.style.display = 'flex';
        if (dom.eyedropperBtn2) dom.eyedropperBtn2.style.display = 'flex';
    }
}

function attachEvents() {
    if (dom.btnTabs) {
        dom.btnTabs.addEventListener('change', () => {
            const activeTab = dom.btnTabs.activeTab;
            if (activeTab === dom.btnLinear) {
                state.type = 'linear';
                dom.angleGroup.style.display = 'block';
            } else {
                state.type = 'radial';
                dom.angleGroup.style.display = 'none';
            }
            updateGradient();
        });
    }

    if (dom.angleSlider) {
        dom.angleSlider.addEventListener('input', (e) => {
            state.angle = e.target.value;
            dom.angleVal.textContent = state.angle;
            updateGradient();
        });
    }

    const onColorInput = (inputEl, pickerEl, stateKey) => {
        pickerEl.addEventListener('input', (e) => {
            const val = e.target.value.replace('#', '').toUpperCase();
            state[stateKey] = val;
            inputEl.value = val;
            updateGradient();
        });

        inputEl.addEventListener('input', (e) => {
            let val = e.target.value.replace('#', '');
            if (val.length === 3) val = val.split('').map(c => c + c).join('');
            if (/^[0-9A-F]{6}$/i.test(val)) {
                state[stateKey] = val.toUpperCase();
                pickerEl.value = `#${state[stateKey]}`;
                updateGradient();
            }
        });
    };

    onColorInput(dom.hex1, dom.color1, 'hex1');
    onColorInput(dom.hex2, dom.color2, 'hex2');

    const setupEyeDropper = (btnEl, inputEl, pickerEl, stateKey) => {
        if (!btnEl) return;
        btnEl.style.display = 'flex';
        btnEl.addEventListener('click', async () => {
            if (!('EyeDropper' in window)) {
                if (dom.toast) {
                    dom.toast.textContent = translations[layoutState.currentLang]?.eyedropper_not_supported || 'EyeDropper is not supported in this browser.';
                    dom.toast.classList.add('show');
                    setTimeout(() => dom.toast.classList.remove('show'), 3000);
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
                    updateGradient();
                }
            } catch (err) {
                if (err && err.name === 'AbortError') return;
                console.warn('EyeDropper failed:', err);
            }
        });
    };

    setupEyeDropper(dom.eyedropperBtn1, dom.hex1, dom.color1, 'hex1');
    setupEyeDropper(dom.eyedropperBtn2, dom.hex2, dom.color2, 'hex2');

    if (dom.copyBtn) {
        dom.copyBtn.addEventListener('click', () => {
            if (dom.code) {
                navigator.clipboard.writeText(dom.code.textContent).then(showToast);
            }
        });
    }
}

function updateGradient() {
    if (!dom.preview || !dom.code) return;
    
    const c1 = `#${state.hex1}`;
    const c2 = `#${state.hex2}`;
    
    let css = '';
    if (state.type === 'linear') {
        css = `background: linear-gradient(${state.angle}deg, ${c1}, ${c2});`;
    } else {
        css = `background: radial-gradient(circle, ${c1}, ${c2});`;
    }
    
    dom.preview.style.cssText = `${css} width: 100%; height: 300px; border-radius: 24px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);`;
    dom.code.textContent = css;
}

function showToast() {
    if (!dom.toast) return;
    dom.toast.textContent = translations[layoutState.currentLang].copied || 'Copied!';
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2000);
}
