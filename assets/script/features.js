import { state, dom } from './state.js';
import { ColorUtils } from './utils.js';
import { updateColorState } from './app.js';

export function addToHistory(hex) {
    if (!/^[0-9A-F]{6}$/i.test(hex)) return;
    hex = hex.toUpperCase();
    
    // Don't add if it's the exact same as the most recent one
    if (state.history.length > 0 && state.history[0] === hex) return;
    
    // Remove if it exists elsewhere to move it to top
    const existingIndex = state.history.indexOf(hex);
    if (existingIndex > -1) {
        state.history.splice(existingIndex, 1);
    }
    
    state.history.unshift(hex);
    if (state.history.length > 20) {
        state.history.pop();
    }
    
    localStorage.setItem('color_history', JSON.stringify(state.history));
    renderHistory();
}

export function renderHistory() {
    if (!dom.historyContainer) return;
    dom.historyContainer.innerHTML = '';
    
    state.history.forEach((hex) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.style.backgroundColor = `#${hex}`;
        item.title = `#${hex}`;
        item.onclick = () => {
            updateColorState(hex);
            // Switch back to home page to see result
            const homeBtn = document.querySelector('[data-page="page-home"]');
            if(homeBtn) homeBtn.click();
        };

        const label = document.createElement('div');
        label.className = 'history-hex-label';
        label.textContent = `#${hex}`;
        item.appendChild(label);

        dom.historyContainer.appendChild(item);
    });
}

export function updateCustomContrast() {
    if (!dom.customBgHex || !dom.customFgHex) return;
    
    let bgHex = dom.customBgHex.value.replace('#', '');
    let fgHex = dom.customFgHex.value.replace('#', '');
    
    if (bgHex.length === 3) bgHex = bgHex.split('').map(c => c + c).join('');
    if (fgHex.length === 3) fgHex = fgHex.split('').map(c => c + c).join('');
    
    if (!/^[0-9A-F]{6}$/i.test(bgHex)) bgHex = "FFFFFF";
    if (!/^[0-9A-F]{6}$/i.test(fgHex)) fgHex = "000000";
    
    state.customContrastBg = bgHex.toUpperCase();
    state.customContrastFg = fgHex.toUpperCase();
    
    const bgRgb = ColorUtils.hexToRgb(state.customContrastBg);
    const fgRgb = ColorUtils.hexToRgb(state.customContrastFg);
    
    const ratio = ColorUtils.getContrastRatio(bgRgb, fgRgb);
    
    dom.customContrastRatio.textContent = `${ratio.toFixed(1)}:1`;
    dom.customContrastPreview.style.backgroundColor = `#${state.customContrastBg}`;
    dom.customContrastPreview.style.color = `#${state.customContrastFg}`;
    
    renderCustomWCAGBadges(dom.customContrastBadges, ratio);
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

export function toggleAdvancedPreview() {
    state.advancedPreviewActive = !state.advancedPreviewActive;
    dom.advancedPreviewToggle.classList.toggle('active', state.advancedPreviewActive);
    applyAdvancedPreview();
}

export function applyAdvancedPreview() {
    if (!dom.uiSamplesCard) return;
    
    if (state.advancedPreviewActive) {
        dom.uiSamplesCard.style.backgroundColor = `#${state.hex}`;
        
        const isDark = ColorUtils.getLuminance(state.rgb.r, state.rgb.g, state.rgb.b) < 0.5;
        const textColor = isDark ? '#FFFFFF' : '#000000';
        
        dom.uiSamplesCard.style.color = textColor;
        dom.uiSamplesCard.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
        
        document.querySelectorAll('.sample-btn-primary').forEach(el => {
            el.style.backgroundColor = textColor;
            el.style.color = `#${state.hex}`;
        });
        document.querySelectorAll('.sample-btn-outline').forEach(el => {
            el.style.borderColor = textColor;
            el.style.color = textColor;
        });
        document.querySelectorAll('.sample-dot').forEach(el => el.style.backgroundColor = textColor);
        document.querySelectorAll('.sample-text').forEach(el => el.style.color = textColor);
    } else {
        dom.uiSamplesCard.style.backgroundColor = '';
        dom.uiSamplesCard.style.color = '';
        dom.uiSamplesCard.style.borderColor = '';
        
        // Reset to normal
        document.querySelectorAll('.sample-btn-primary').forEach(el => {
            el.style.backgroundColor = `#${state.hex}`;
            el.style.color = '';
        });
        document.querySelectorAll('.sample-btn-outline').forEach(el => {
            el.style.borderColor = `#${state.hex}`;
            el.style.color = `#${state.hex}`;
        });
        document.querySelectorAll('.sample-dot').forEach(el => el.style.backgroundColor = `#${state.hex}`);
        document.querySelectorAll('.sample-text').forEach(el => el.style.color = `#${state.hex}`);
    }
}
