import { ColorUtils } from '../assets/script/utils.js';
import { translations } from '../assets/script/config.js';
import { initLayout, layoutState } from '../assets/script/shared/layout.js';

const PRESET_MAP = {
    sunset: [
        { id: 1, hex: 'FF512F', pos: 0 },
        { id: 2, hex: 'DD2476', pos: 50 },
        { id: 3, hex: '7B1E7A', pos: 100 }
    ],
    ocean: [
        { id: 1, hex: '2E3192', pos: 0 },
        { id: 2, hex: '00C6FF', pos: 55 },
        { id: 3, hex: '1BFFFF', pos: 100 }
    ],
    cosmic: [
        { id: 1, hex: '624E9A', pos: 0 },
        { id: 2, hex: '9C27B0', pos: 50 },
        { id: 3, hex: 'EADDFF', pos: 100 }
    ],
    aurora: [
        { id: 1, hex: '00B09B', pos: 0 },
        { id: 2, hex: '96C93D', pos: 60 },
        { id: 3, hex: 'CBF3D2', pos: 100 }
    ],
    cyberpunk: [
        { id: 1, hex: 'F72585', pos: 0 },
        { id: 2, hex: '7209B7', pos: 50 },
        { id: 3, hex: '4CC9F0', pos: 100 }
    ],
    amber: [
        { id: 1, hex: 'F2994A', pos: 0 },
        { id: 2, hex: 'F2C94C', pos: 55 },
        { id: 3, hex: 'FFE494', pos: 100 }
    ]
};

const state = {
    type: "linear",
    angle: 90,
    position: "center",
    interpolation: "srgb",
    format: "css",
    stops: [
        { id: 1, hex: localStorage.getItem('active_hex') || "624E9A", pos: 0 },
        { id: 2, hex: "EADDFF", pos: 100 }
    ],
    activeStopId: 1
};

let nextStopId = 3;
const dom = {};

document.addEventListener('DOMContentLoaded', () => {
    initLayout('gradient');
    
    parseUrlParams();
    bindDOM();
    attachEvents();
    
    renderStops();
    updateGradient();
});

function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const colorsParam = params.get('colors') || params.get('c');
    if (colorsParam) {
        const hexList = colorsParam.split(',').map(c => c.replace('#', '').trim().toUpperCase()).filter(c => /^[0-9A-F]{6}$/i.test(c));
        if (hexList.length >= 2) {
            state.stops = hexList.slice(0, 8).map((hex, i) => ({
                id: i + 1,
                hex,
                pos: Math.round((i / (hexList.length - 1)) * 100)
            }));
            nextStopId = state.stops.length + 1;
        }
    } else {
        const c1 = params.get('c1');
        const c2 = params.get('c2');
        const c3 = params.get('c3');
        if (c1 && c2) {
            state.stops = [
                { id: 1, hex: c1.replace('#', '').toUpperCase(), pos: 0 },
                ...(c3 ? [{ id: 2, hex: c2.replace('#', '').toUpperCase(), pos: 50 }, { id: 3, hex: c3.replace('#', '').toUpperCase(), pos: 100 }] : [{ id: 2, hex: c2.replace('#', '').toUpperCase(), pos: 100 }])
            ];
            nextStopId = state.stops.length + 1;
        }
    }
}

function bindDOM() {
    Object.assign(dom, {
        tabs: document.getElementById('gradient-tabs'),
        tabLinear: document.getElementById('grad-linear'),
        tabRadial: document.getElementById('grad-radial'),
        tabConic: document.getElementById('grad-conic'),
        angleGroup: document.getElementById('grad-angle-group'),
        angleSlider: document.getElementById('grad-angle'),
        angleVal: document.getElementById('grad-angle-val'),
        posGroup: document.getElementById('grad-pos-group'),
        posSelect: document.getElementById('grad-position-select'),
        interpToggle: document.getElementById('grad-interp-toggle'),
        trackWrapper: document.getElementById('grad-track-wrapper'),
        track: document.getElementById('grad-track'),
        trackPins: document.getElementById('grad-track-pins'),
        stopsList: document.getElementById('grad-stops-list'),
        addStopBtn: document.getElementById('add-stop-btn'),
        swapBtn: document.getElementById('swap-grad-btn'),
        presetsBar: document.getElementById('gradient-presets-bar'),
        preview: document.getElementById('gradient-preview'),
        formatToggle: document.getElementById('grad-format-toggle'),
        code: document.getElementById('gradient-code'),
        copyBtn: document.getElementById('copy-gradient-btn'),
        copyBtnLabel: document.getElementById('copy-btn-label'),
        downloadPngBtn: document.getElementById('download-png-btn'),
        toast: document.getElementById('toast')
    });
}

function attachEvents() {
    // Tabs Linear / Radial / Conic
    if (dom.tabs) {
        dom.tabs.addEventListener('change', () => {
            const active = dom.tabs.activeTab;
            if (active === dom.tabLinear) {
                state.type = 'linear';
                dom.angleGroup.style.display = 'block';
                dom.posGroup.style.display = 'none';
            } else if (active === dom.tabRadial) {
                state.type = 'radial';
                dom.angleGroup.style.display = 'none';
                dom.posGroup.style.display = 'block';
            } else if (active === dom.tabConic) {
                state.type = 'conic';
                dom.angleGroup.style.display = 'block';
                dom.posGroup.style.display = 'block';
            }
            updateGradient();
        });
    }

    if (dom.angleSlider) {
        dom.angleSlider.addEventListener('input', (e) => {
            state.angle = parseInt(e.target.value);
            dom.angleVal.textContent = state.angle;
            updateGradient();
        });
    }

    if (dom.posSelect) {
        dom.posSelect.addEventListener('change', (e) => {
            state.position = e.target.value;
            updateGradient();
        });
    }

    if (dom.interpToggle) {
        dom.interpToggle.querySelectorAll('.segment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                dom.interpToggle.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.interpolation = btn.getAttribute('data-interp') || 'srgb';
                updateGradient();
            });
        });
    }

    if (dom.formatToggle) {
        dom.formatToggle.querySelectorAll('.segment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                dom.formatToggle.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.format = btn.getAttribute('data-fmt') || 'css';
                updateGradient();
            });
        });
    }

    // Add Stop Button
    if (dom.addStopBtn) {
        dom.addStopBtn.addEventListener('click', () => {
            addNewStop();
        });
    }

    // Click on track to add stop
    if (dom.track) {
        dom.track.addEventListener('click', (e) => {
            const rect = dom.track.getBoundingClientRect();
            const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            const pct = Math.round((clickX / rect.width) * 100);
            addNewStop(pct);
        });
    }

    // Swap / Reverse stops
    if (dom.swapBtn) {
        dom.swapBtn.addEventListener('click', () => {
            state.stops.reverse();
            state.stops.forEach((s, i) => {
                s.pos = 100 - s.pos;
            });
            state.stops.sort((a, b) => a.pos - b.pos);
            renderStops();
            updateGradient();
        });
    }

    // Presets
    if (dom.presetsBar) {
        dom.presetsBar.querySelectorAll('.grad-preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const presetKey = chip.getAttribute('data-preset');
                if (PRESET_MAP[presetKey]) {
                    state.stops = JSON.parse(JSON.stringify(PRESET_MAP[presetKey]));
                    state.activeStopId = state.stops[0].id;
                    renderStops();
                    updateGradient();
                }
            });
        });
    }

    // Copy Code Button
    if (dom.copyBtn) {
        dom.copyBtn.addEventListener('click', () => {
            if (dom.code) {
                navigator.clipboard.writeText(dom.code.textContent).then(showToast);
            }
        });
    }

    // Download PNG Button
    if (dom.downloadPngBtn) {
        dom.downloadPngBtn.addEventListener('click', downloadGradientPNG);
    }
}

function addNewStop(targetPos) {
    if (state.stops.length >= 8) {
        showToast('Maximum 8 stops allowed');
        return;
    }

    state.stops.sort((a, b) => a.pos - b.pos);
    let pos = typeof targetPos === 'number' ? targetPos : 50;
    
    // Choose color interpolated or distinct
    let newHex = "FFFFFF";
    if (state.stops.length >= 2) {
        // Find segment
        for (let i = 0; i < state.stops.length - 1; i++) {
            if (pos >= state.stops[i].pos && pos <= state.stops[i + 1].pos) {
                const rgbA = ColorUtils.hexToRgb(state.stops[i].hex);
                const rgbB = ColorUtils.hexToRgb(state.stops[i + 1].hex);
                const t = (pos - state.stops[i].pos) / (state.stops[i + 1].pos - state.stops[i].pos || 1);
                const r = Math.round(rgbA.r + (rgbB.r - rgbA.r) * t);
                const g = Math.round(rgbA.g + (rgbB.g - rgbA.g) * t);
                const b = Math.round(rgbA.b + (rgbB.b - rgbA.b) * t);
                newHex = ColorUtils.rgbToHex(r, g, b).toUpperCase();
                break;
            }
        }
    }

    const newStop = {
        id: nextStopId++,
        hex: newHex,
        pos
    };

    state.stops.push(newStop);
    state.stops.sort((a, b) => a.pos - b.pos);
    state.activeStopId = newStop.id;

    renderStops();
    updateGradient();
}

function removeStop(id) {
    if (state.stops.length <= 2) {
        showToast('At least 2 color stops are required');
        return;
    }
    state.stops = state.stops.filter(s => s.id !== id);
    if (state.activeStopId === id) {
        state.activeStopId = state.stops[0].id;
    }
    renderStops();
    updateGradient();
}

function renderStops() {
    if (!dom.stopsList || !dom.trackPins) return;

    state.stops.sort((a, b) => a.pos - b.pos);

    // 1. Render Track Pins
    dom.trackPins.innerHTML = '';
    state.stops.forEach(stop => {
        const pin = document.createElement('div');
        pin.className = `grad-track-pin ${stop.id === state.activeStopId ? 'active' : ''}`;
        pin.style.left = `${stop.pos}%`;
        pin.style.backgroundColor = `#${stop.hex}`;
        pin.title = `#${stop.hex} (${stop.pos}%)`;

        // Draggable pin behavior
        let isDragging = false;

        const onMove = (e) => {
            if (!isDragging) return;
            const rect = dom.track.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const relX = Math.max(0, Math.min(rect.width, clientX - rect.left));
            stop.pos = Math.round((relX / rect.width) * 100);
            pin.style.left = `${stop.pos}%`;
            pin.title = `#${stop.hex} (${stop.pos}%)`;

            // Sync with stop row input
            const posInput = document.getElementById(`stop-pos-${stop.id}`);
            const posSlider = document.getElementById(`stop-slider-${stop.id}`);
            if (posInput) posInput.value = stop.pos;
            if (posSlider) posSlider.value = stop.pos;

            updateGradient();
        };

        const onUp = () => {
            if (isDragging) {
                isDragging = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onUp);
                renderStops();
                updateGradient();
            }
        };

        pin.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isDragging = true;
            state.activeStopId = stop.id;
            highlightActiveStop();
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        pin.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            isDragging = true;
            state.activeStopId = stop.id;
            highlightActiveStop();
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onUp);
        }, { passive: false });

        dom.trackPins.appendChild(pin);
    });

    // 2. Render Stops List
    dom.stopsList.innerHTML = '';
    state.stops.forEach((stop, index) => {
        const row = document.createElement('div');
        row.className = `grad-stop-item ${stop.id === state.activeStopId ? 'active' : ''}`;
        row.id = `stop-row-${stop.id}`;

        row.innerHTML = `
            <input type="color" id="stop-color-${stop.id}" value="#${stop.hex}" style="width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer; padding: 0; background: none; flex-shrink: 0;">
            <div class="hex-wrapper" style="width: 100px; margin-top: 0; height: 34px; padding: 0 8px;">
                <span>#</span>
                <input type="text" id="stop-hex-${stop.id}" value="${stop.hex}" maxlength="6" style="width: 68px; font-size: 0.95rem; font-family: 'Roboto Mono', monospace; font-weight: 700;">
            </div>
            <button id="stop-eyedropper-${stop.id}" class="icon-button small-btn" title="Pick Color" style="border: none; background: transparent; cursor: pointer; display: none; width: 28px; height: 28px; align-items: center; justify-content: center; color: var(--md-sys-color-on-surface); flex-shrink: 0;">
                <span class="material-symbols-rounded" style="font-size: 18px;">colorize</span>
            </button>
            <input type="range" id="stop-slider-${stop.id}" min="0" max="100" value="${stop.pos}" style="flex: 1; min-width: 60px; height: 6px; cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 2px;">
                <input type="number" id="stop-pos-${stop.id}" class="grad-stop-pos" min="0" max="100" value="${stop.pos}">
                <span class="label-small">%</span>
            </div>
            <button id="stop-del-${stop.id}" class="icon-button small-btn" title="Delete Stop" style="border: none; background: transparent; cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: ${state.stops.length <= 2 ? 'var(--md-sys-color-outline)' : 'var(--md-sys-color-error)'}; flex-shrink: 0;" ${state.stops.length <= 2 ? 'disabled' : ''}>
                <span class="material-symbols-rounded" style="font-size: 18px;">delete</span>
            </button>
        `;

        dom.stopsList.appendChild(row);

        // Bind events for this stop
        const colorInput = row.querySelector(`#stop-color-${stop.id}`);
        const hexInput = row.querySelector(`#stop-hex-${stop.id}`);
        const sliderInput = row.querySelector(`#stop-slider-${stop.id}`);
        const posInput = row.querySelector(`#stop-pos-${stop.id}`);
        const eyeBtn = row.querySelector(`#stop-eyedropper-${stop.id}`);
        const delBtn = row.querySelector(`#stop-del-${stop.id}`);

        if ('EyeDropper' in window && eyeBtn) {
            eyeBtn.style.display = 'flex';
            eyeBtn.addEventListener('click', async () => {
                try {
                    const ed = new EyeDropper();
                    const res = await ed.open();
                    if (res && res.sRGBHex) {
                        const h = res.sRGBHex.replace('#', '').toUpperCase();
                        stop.hex = h;
                        hexInput.value = h;
                        colorInput.value = `#${h}`;
                        updateGradient();
                        renderTrack();
                    }
                } catch (e) {}
            });
        }

        colorInput.addEventListener('input', (e) => {
            const h = e.target.value.replace('#', '').toUpperCase();
            stop.hex = h;
            hexInput.value = h;
            state.activeStopId = stop.id;
            highlightActiveStop();
            updateGradient();
            renderTrack();
        });

        hexInput.addEventListener('input', (e) => {
            let val = e.target.value.replace('#', '');
            if (val.length === 3) val = val.split('').map(c => c + c).join('');
            if (/^[0-9A-F]{6}$/i.test(val)) {
                stop.hex = val.toUpperCase();
                colorInput.value = `#${stop.hex}`;
                state.activeStopId = stop.id;
                highlightActiveStop();
                updateGradient();
                renderTrack();
            }
        });

        sliderInput.addEventListener('input', (e) => {
            stop.pos = parseInt(e.target.value);
            posInput.value = stop.pos;
            state.activeStopId = stop.id;
            highlightActiveStop();
            updateGradient();
            renderTrack();
        });

        posInput.addEventListener('input', (e) => {
            let val = parseInt(e.target.value);
            if (!isNaN(val)) {
                val = Math.max(0, Math.min(100, val));
                stop.pos = val;
                sliderInput.value = val;
                state.activeStopId = stop.id;
                highlightActiveStop();
                updateGradient();
                renderTrack();
            }
        });

        delBtn.addEventListener('click', () => {
            removeStop(stop.id);
        });

        row.addEventListener('click', () => {
            state.activeStopId = stop.id;
            highlightActiveStop();
        });
    });

    renderTrack();
}

function highlightActiveStop() {
    document.querySelectorAll('.grad-stop-item').forEach(el => {
        const id = parseInt(el.id.replace('stop-row-', ''));
        el.classList.toggle('active', id === state.activeStopId);
    });
    document.querySelectorAll('.grad-track-pin').forEach((pin, i) => {
        if (state.stops[i]) {
            pin.classList.toggle('active', state.stops[i].id === state.activeStopId);
        }
    });
}

function renderTrack() {
    if (!dom.track) return;
    const sorted = [...state.stops].sort((a, b) => a.pos - b.pos);
    const stopsStr = sorted.map(s => `#${s.hex} ${s.pos}%`).join(', ');
    dom.track.style.background = `linear-gradient(to right, ${stopsStr})`;
}

function buildGradientCss(formatType) {
    const sorted = [...state.stops].sort((a, b) => a.pos - b.pos);
    const stopsStr = sorted.map(s => `#${s.hex} ${s.pos}%`).join(', ');
    const isOklch = state.interpolation === 'oklch';

    let fallbackRule = '';
    let modernRule = '';

    if (state.type === 'linear') {
        fallbackRule = `background: linear-gradient(${state.angle}deg, ${stopsStr});`;
        modernRule = `background: linear-gradient(in oklch ${state.angle}deg, ${stopsStr});`;
    } else if (state.type === 'radial') {
        fallbackRule = `background: radial-gradient(circle at ${state.position}, ${stopsStr});`;
        modernRule = `background: radial-gradient(in oklch circle at ${state.position}, ${stopsStr});`;
    } else if (state.type === 'conic') {
        fallbackRule = `background: conic-gradient(from ${state.angle}deg at ${state.position}, ${stopsStr});`;
        modernRule = `background: conic-gradient(in oklch from ${state.angle}deg at ${state.position}, ${stopsStr});`;
    }

    if (formatType === 'css') {
        if (isOklch) {
            return `${fallbackRule}\n${modernRule}`;
        }
        return fallbackRule;
    } else if (formatType === 'tailwind') {
        let gradExp = '';
        if (state.type === 'linear') {
            gradExp = `linear-gradient(${state.angle}deg,${sorted.map(s => `#${s.hex}_${s.pos}%`).join(',')})`;
        } else if (state.type === 'radial') {
            gradExp = `radial-gradient(circle_at_${state.position.replace(/\s+/g, '_')},${sorted.map(s => `#${s.hex}_${s.pos}%`).join(',')})`;
        } else {
            gradExp = `conic-gradient(from_${state.angle}deg_at_${state.position.replace(/\s+/g, '_')},${sorted.map(s => `#${s.hex}_${s.pos}%`).join(',')})`;
        }
        return `bg-[${gradExp}]`;
    } else if (formatType === 'svg') {
        const stopsSvg = sorted.map(s => `    <stop offset="${s.pos}%" stop-color="#${s.hex}" />`).join('\n');
        if (state.type === 'radial') {
            return `<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <radialGradient id="grad" cx="50%" cy="50%" r="50%">\n${stopsSvg}\n    </radialGradient>\n  </defs>\n  <rect width="100%" height="100%" fill="url(#grad)" />\n</svg>`;
        }
        const rad = (state.angle - 90) * (Math.PI / 180);
        const x1 = Math.round(50 - Math.cos(rad) * 50);
        const y1 = Math.round(50 - Math.sin(rad) * 50);
        const x2 = Math.round(50 + Math.cos(rad) * 50);
        const y2 = Math.round(50 + Math.sin(rad) * 50);
        return `<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <linearGradient id="grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">\n${stopsSvg}\n    </linearGradient>\n  </defs>\n  <rect width="100%" height="100%" fill="url(#grad)" />\n</svg>`;
    }
}

function updateGradient() {
    if (!dom.preview || !dom.code) return;

    const sorted = [...state.stops].sort((a, b) => a.pos - b.pos);
    const stopsStr = sorted.map(s => `#${s.hex} ${s.pos}%`).join(', ');

    let previewCss = '';
    if (state.type === 'linear') {
        previewCss = state.interpolation === 'oklch'
            ? `linear-gradient(in oklch ${state.angle}deg, ${stopsStr})`
            : `linear-gradient(${state.angle}deg, ${stopsStr})`;
    } else if (state.type === 'radial') {
        previewCss = state.interpolation === 'oklch'
            ? `radial-gradient(in oklch circle at ${state.position}, ${stopsStr})`
            : `radial-gradient(circle at ${state.position}, ${stopsStr})`;
    } else {
        previewCss = state.interpolation === 'oklch'
            ? `conic-gradient(in oklch from ${state.angle}deg at ${state.position}, ${stopsStr})`
            : `conic-gradient(from ${state.angle}deg at ${state.position}, ${stopsStr})`;
    }

    dom.preview.style.background = previewCss;
    dom.code.textContent = buildGradientCss(state.format);

    if (dom.copyBtnLabel) {
        if (state.format === 'tailwind') dom.copyBtnLabel.textContent = 'Copy Tailwind Class';
        else if (state.format === 'svg') dom.copyBtnLabel.textContent = 'Copy SVG Code';
        else dom.copyBtnLabel.textContent = 'Copy CSS';
    }

    renderTrack();
}

function downloadGradientPNG() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    const sorted = [...state.stops].sort((a, b) => a.pos - b.pos);

    if (state.type === 'linear') {
        const rad = (state.angle - 90) * (Math.PI / 180);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const len = Math.sqrt(cx * cx + cy * cy);
        const x0 = cx - Math.cos(rad) * len;
        const y0 = cy - Math.sin(rad) * len;
        const x1 = cx + Math.cos(rad) * len;
        const y1 = cy + Math.sin(rad) * len;
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        sorted.forEach(s => grad.addColorStop(s.pos / 100, `#${s.hex}`));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (state.type === 'radial') {
        let cx = canvas.width / 2;
        let cy = canvas.height / 2;
        if (state.position.includes('top')) cy = 0;
        if (state.position.includes('bottom')) cy = canvas.height;
        if (state.position.includes('left')) cx = 0;
        if (state.position.includes('right')) cx = canvas.width;
        const r = Math.max(canvas.width, canvas.height);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        sorted.forEach(s => grad.addColorStop(s.pos / 100, `#${s.hex}`));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (state.type === 'conic') {
        let cx = canvas.width / 2;
        let cy = canvas.height / 2;
        if (state.position.includes('top')) cy = 0;
        if (state.position.includes('bottom')) cy = canvas.height;
        if (state.position.includes('left')) cx = 0;
        if (state.position.includes('right')) cx = canvas.width;
        const startAngle = (state.angle * Math.PI) / 180;
        if (ctx.createConicGradient) {
            const grad = ctx.createConicGradient(startAngle, cx, cy);
            sorted.forEach(s => grad.addColorStop(s.pos / 100, `#${s.hex}`));
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            // Fallback for older canvas engines
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            sorted.forEach(s => grad.addColorStop(s.pos / 100, `#${s.hex}`));
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    const a = document.createElement('a');
    a.download = `gradient-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToast('Gradient PNG downloaded!');
}

function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = typeof msg === 'string' ? msg : (translations[layoutState.currentLang]?.copied || 'Copied!');
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2200);
}
