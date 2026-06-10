import { state, dom } from './state.js';
import { ColorUtils } from './utils.js';
import { updateColorState } from './app.js';
import { translations } from './config.js';

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
    if (state.history.length > 30) {
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

    // APCA Custom Contrast
    const apcaVal = ColorUtils.getAPCAContrast(fgRgb, bgRgb);
    const apcaRatioEl = document.getElementById('custom-apca-ratio');
    const apcaBadgeEl = document.getElementById('custom-apca-badge');
    if (apcaRatioEl) apcaRatioEl.textContent = `Lc ${Math.round(apcaVal)}`;
    
    if (apcaBadgeEl) {
        const absScore = Math.abs(apcaVal);
        apcaBadgeEl.className = 'badge large-badge';
        if (absScore >= 75) {
            apcaBadgeEl.classList.add('badge-pass');
            apcaBadgeEl.textContent = 'Lc 75+ (Body)';
            apcaBadgeEl.style.backgroundColor = '';
            apcaBadgeEl.style.color = '';
        } else if (absScore >= 60) {
            apcaBadgeEl.classList.add('badge-pass');
            apcaBadgeEl.textContent = 'Lc 60+ (Large)';
            apcaBadgeEl.style.backgroundColor = 'var(--md-sys-color-primary)';
            apcaBadgeEl.style.color = 'var(--md-sys-color-on-primary)';
        } else if (absScore >= 45) {
            apcaBadgeEl.classList.add('badge-pass');
            apcaBadgeEl.textContent = 'Lc 45+ (Heading)';
            apcaBadgeEl.style.backgroundColor = 'var(--md-sys-color-secondary)';
            apcaBadgeEl.style.color = 'var(--md-sys-color-on-secondary)';
        } else {
            apcaBadgeEl.classList.add('badge-fail');
            apcaBadgeEl.textContent = `Lc ${Math.round(apcaVal)} (Fail)`;
            apcaBadgeEl.style.backgroundColor = '';
            apcaBadgeEl.style.color = '';
        }
    }
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

export function initImageExtractor() {
    const dropZone = document.getElementById('image-drop-zone');
    const fileInput = document.getElementById('image-upload');
    const canvas = document.getElementById('image-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const paletteContainer = document.getElementById('extracted-palette');
    const resetBtn = document.getElementById('reset-image-btn');
    const actionBtns = document.getElementById('image-action-buttons');
    const exportBtn = document.getElementById('export-extracted-palette-btn');

    if(!dropZone) return;

    dropZone.onclick = () => fileInput.click();
    
    dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    };
    dropZone.ondragleave = () => dropZone.classList.remove('dragover');
    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if(e.dataTransfer.files && e.dataTransfer.files[0]) {
            processImage(e.dataTransfer.files[0]);
        }
    };

    fileInput.onchange = (e) => {
        if(e.target.files && e.target.files[0]) {
            processImage(e.target.files[0]);
        }
    };

    if(resetBtn) {
        resetBtn.onclick = () => {
            dropZone.style.display = 'flex';
            canvas.style.display = 'none';
            paletteContainer.style.display = 'none';
            if (actionBtns) actionBtns.style.display = 'none';
            else resetBtn.style.display = 'none';
            fileInput.value = '';
        };
    }

    function processImage(file) {
        if(!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                dropZone.style.display = 'none';
                canvas.style.display = 'block';
                paletteContainer.style.display = 'grid';
                if(actionBtns) actionBtns.style.display = 'flex';
                else if(resetBtn) resetBtn.style.display = 'flex';
                
                const MAX_WIDTH = 500;
                let width = img.width;
                let height = img.height;
                if(width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                extractPalette(ctx, width, height);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function extractPalette(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height).data;
        const colorCounts = {};
        
        for(let i=0; i<imageData.length; i+=16) { 
            const r = Math.round(imageData[i]/16)*16;
            const g = Math.round(imageData[i+1]/16)*16;
            const b = Math.round(imageData[i+2]/16)*16;
            const a = imageData[i+3];
            if(a < 128) continue; 
            const rgb = `${r},${g},${b}`;
            colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
        }

        const sorted = Object.keys(colorCounts).sort((a,b) => colorCounts[b] - colorCounts[a]);
        
        const palette = [];
        for(const rgbStr of sorted) {
            const [r,g,b] = rgbStr.split(',').map(Number);
            let tooClose = false;
            for(const p of palette) {
                const dist = Math.sqrt(Math.pow(p.r-r,2) + Math.pow(p.g-g,2) + Math.pow(p.b-b,2));
                if(dist < 50) { tooClose = true; break; }
            }
            if(!tooClose) {
                palette.push({r,g,b});
                if(palette.length >= 6) break;
            }
        }

        paletteContainer.innerHTML = '';
        import('./utils.js').then(({ColorUtils}) => {
            if (exportBtn) {
                exportBtn.onclick = () => {
                    const canvasExp = document.createElement('canvas');
                    const colorCount = palette.length;
                    const stripWidth = Math.max(150, 600 / colorCount);
                    canvasExp.width = stripWidth * colorCount;
                    canvasExp.height = 300;
                    const ctxExp = canvasExp.getContext('2d');
        
                    ctxExp.fillStyle = '#FFFFFF';
                    ctxExp.fillRect(0, 0, canvasExp.width, canvasExp.height);
        
                    palette.forEach((c, i) => {
                        const hex = ColorUtils.rgbToHex(c.r, c.g, c.b);
                        ctxExp.fillStyle = `#${hex}`;
                        ctxExp.fillRect(i * stripWidth, 0, stripWidth, 230);
                        ctxExp.fillStyle = '#333333';
                        ctxExp.font = 'bold 20px Outfit, sans-serif';
                        ctxExp.textAlign = 'center';
                        ctxExp.fillText(`#${hex}`, i * stripWidth + stripWidth / 2, 270);
                    });
                    const link = document.createElement('a');
                    link.download = `extracted-palette.png`;
                    link.href = canvasExp.toDataURL();
                    link.click();
                };
            }

            import('./app.js').then(({updateColorState}) => {
                palette.forEach(c => {
                    const hex = ColorUtils.rgbToHex(c.r, c.g, c.b);
                    const item = document.createElement('div');
                    item.className = 'palette-item';
                    item.style.backgroundColor = `#${hex}`;
                    item.title = `#${hex}`;
                    
                    const label = document.createElement('div');
                    label.className = 'history-hex-label';
                    label.textContent = `#${hex}`;
                    item.appendChild(label);
                    
                    item.onclick = () => {
                        updateColorState(hex);
                        const homeBtn = document.querySelector('[data-page="page-home"]');
                        if(homeBtn) homeBtn.click();
                    };
                    paletteContainer.appendChild(item);
                });
            });
        });
    }
}

export function initContrastMatrix() {
    const matrixBtn = document.querySelector('[data-page="page-matrix"]');
    if(matrixBtn) {
        matrixBtn.addEventListener('click', renderContrastMatrix);
    }
}

export function renderContrastMatrix() {
    const table = document.getElementById('matrix-table');
    if(!table) return;
    
    if(state.palette.length === 0) {
        table.innerHTML = `<tr><td style="padding: 32px;">${translations[state.currentLang].no_colors_saved || "No colors in palette. Save some colors first!"}</td></tr>`;
        return;
    }
    
    const colors = ['FFFFFF', '000000', ...state.palette.map(p => typeof p === 'string' ? p : p.hex)];
    
    let html = '<tr><th>Bg \\ Fg</th>';
    colors.forEach(c => {
        const rgb = ColorUtils.hexToRgb(c);
        const l = ColorUtils.getLuminance(rgb.r, rgb.g, rgb.b);
        html += `<th style="background-color: #${c}; color: ${l < 0.5 ? '#fff' : '#000'}; border: 1px solid rgba(128,128,128,0.2);">#${c}</th>`;
    });
    html += '</tr>';
    
    const isApca = state.matrixMode === 'apca';
    
    colors.forEach(bg => {
        const bgRgb = ColorUtils.hexToRgb(bg);
        const bgL = ColorUtils.getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
        html += `<tr><th style="background-color: #${bg}; color: ${bgL < 0.5 ? '#fff' : '#000'}; border: 1px solid rgba(128,128,128,0.2);">#${bg}</th>`;
        
        colors.forEach(fg => {
            if(bg === fg) {
                html += `<td style="background-color: #${bg}; border: 1px solid rgba(128,128,128,0.2);"> - </td>`;
                return;
            }
            
            let displayVal = '';
            let badgeHtml = '';
            
            if (isApca) {
                const score = ColorUtils.getAPCAContrast(ColorUtils.hexToRgb(fg), bgRgb);
                displayVal = `Lc ${Math.round(score)}`;
                const absScore = Math.abs(score);
                if (absScore >= 75) badgeHtml = '<span style="color: #2e7d32; font-weight: bold;">Body</span>';
                else if (absScore >= 60) badgeHtml = '<span style="color: var(--md-sys-color-primary); font-weight: bold;">Large</span>';
                else if (absScore >= 45) badgeHtml = '<span style="color: #ed6c02; font-weight: bold;">Hdng</span>';
                else badgeHtml = '<span style="color: #d32f2f; font-weight: bold;">Fail</span>';
            } else {
                const ratio = ColorUtils.getContrastRatio(bgRgb, ColorUtils.hexToRgb(fg));
                displayVal = `${ratio.toFixed(1)}:1`;
                const pass = ratio >= 4.5;
                const passLarge = ratio >= 3.0;
                if(pass) badgeHtml = '<span style="color: #2e7d32; font-weight: bold;">AA</span>';
                else if(passLarge) badgeHtml = '<span style="color: #ed6c02; font-weight: bold;">AA (Large)</span>';
                else badgeHtml = '<span style="color: #d32f2f; font-weight: bold;">Fail</span>';
            }
            
            html += `<td style="background-color: #${bg}; color: #${fg}; border: 1px solid rgba(128,128,128,0.2);">
                <div class="matrix-cell">
                    <strong>${displayVal}</strong>
                    ${badgeHtml}
                </div>
            </td>`;
        });
        html += '</tr>';
    });
    
    table.innerHTML = html;
}

export function initGradientGenerator() {
    let type = 'linear';
    let angle = 90;
    
    const btnLinear = document.getElementById('grad-linear');
    const btnRadial = document.getElementById('grad-radial');
    const angleSlider = document.getElementById('grad-angle');
    const angleVal = document.getElementById('grad-angle-val');
    const angleGroup = document.getElementById('grad-angle-group');
    const color1 = document.getElementById('grad-color-1');
    const color2 = document.getElementById('grad-color-2');
    const hex1 = document.getElementById('grad-hex-1');
    const hex2 = document.getElementById('grad-hex-2');
    const preview = document.getElementById('gradient-preview');
    const code = document.getElementById('gradient-code');
    const copyBtn = document.getElementById('copy-gradient-btn');
    
    if(!btnLinear) return;
    
    function updateGradient() {
        const c1 = color1.value;
        const c2 = color2.value;
        
        let css = '';
        if(type === 'linear') {
            css = `background: linear-gradient(${angle}deg, ${c1}, ${c2});`;
        } else {
            css = `background: radial-gradient(circle, ${c1}, ${c2});`;
        }
        
        preview.style.cssText = `${css} width: 100%; height: 300px; border-radius: 24px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);`;
        code.textContent = css;
    }
    
    btnLinear.onclick = () => {
        type = 'linear';
        btnLinear.classList.add('active');
        btnRadial.classList.remove('active');
        angleGroup.style.display = 'block';
        updateGradient();
    };
    
    btnRadial.onclick = () => {
        type = 'radial';
        btnRadial.classList.add('active');
        btnLinear.classList.remove('active');
        angleGroup.style.display = 'none';
        updateGradient();
    };
    
    angleSlider.oninput = (e) => {
        angle = e.target.value;
        angleVal.textContent = angle;
        updateGradient();
    };
    
    color1.oninput = (e) => {
        if (hex1) hex1.value = e.target.value.substring(1).toUpperCase();
        updateGradient();
    };
    
    color2.oninput = (e) => {
        if (hex2) hex2.value = e.target.value.substring(1).toUpperCase();
        updateGradient();
    };
    
    if (hex1) {
        hex1.oninput = (e) => {
            let val = e.target.value.replace('#', '');
            if (val.length === 3) val = val.split('').map(c => c + c).join('');
            if (/^[0-9A-F]{6}$/i.test(val)) {
                color1.value = `#${val.toUpperCase()}`;
                updateGradient();
            }
        };
    }
    
    if (hex2) {
        hex2.oninput = (e) => {
            let val = e.target.value.replace('#', '');
            if (val.length === 3) val = val.split('').map(c => c + c).join('');
            if (/^[0-9A-F]{6}$/i.test(val)) {
                color2.value = `#${val.toUpperCase()}`;
                updateGradient();
            }
        };
    }
    
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(code.textContent).then(() => {
            import('./ui.js').then(({showToast}) => showToast());
        });
    };
    
    color1.value = `#${state.hex}`;
    if (hex1) hex1.value = state.hex.toUpperCase();
    const h1 = (state.hsl.h + 45) % 360;
    const rgb1 = ColorUtils.hslToRgb(h1, state.hsl.s, state.hsl.l);
    const hexVal2 = ColorUtils.rgbToHex(rgb1.r, rgb1.g, rgb1.b).toUpperCase();
    color2.value = `#${hexVal2}`;
    if (hex2) hex2.value = hexVal2;
    updateGradient();
}

export function initThemeBuilder() {
    const themeBtn = document.querySelector('[data-page="page-theme"]');
    if(themeBtn) {
        themeBtn.addEventListener('click', renderThemeBuilder);
    }
}

export function renderThemeBuilder() {
    const grid = document.getElementById('theme-colors-grid');
    if(!grid) return;
    
    const tokens = [
        '--md-sys-color-primary', '--md-sys-color-on-primary',
        '--md-sys-color-primary-container', '--md-sys-color-on-primary-container',
        '--md-sys-color-secondary', '--md-sys-color-on-secondary',
        '--md-sys-color-secondary-container', '--md-sys-color-on-secondary-container',
        '--md-sys-color-tertiary', '--md-sys-color-on-tertiary',
        '--md-sys-color-error', '--md-sys-color-on-error',
        '--md-sys-color-background', '--md-sys-color-on-background',
        '--md-sys-color-surface', '--md-sys-color-on-surface',
        '--md-sys-color-surface-variant', '--md-sys-color-on-surface-variant',
        '--md-sys-color-outline',
        '--md-sys-color-surface-container-low',
        '--md-sys-color-surface-container',
        '--md-sys-color-surface-container-high',
        '--md-sys-color-surface-container-highest'
    ];
    
    grid.innerHTML = '';
    
    tokens.forEach(token => {
        const computed = window.getComputedStyle(document.documentElement);
        let val = computed.getPropertyValue(token).trim();
        if(!val) return;
        
        const item = document.createElement('div');
        item.style.backgroundColor = `var(${token})`;
        item.style.padding = '8px';
        item.style.borderRadius = '12px';
        item.style.border = '1px solid rgba(128,128,128,0.2)';
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.height = '100px';
        item.title = `${token}: ${val}`;
        
        item.innerHTML = `<span style="font-size:10px; opacity:0.9; background:rgba(0,0,0,0.4); color:#fff; padding:2px 4px; border-radius:4px; margin-top:auto; word-break:break-all;">${token.replace('--md-sys-color-', '')}</span>`;
        
        grid.appendChild(item);
    });
}

export function initPaletteGenerator() {
    const generatorBtn = document.querySelector('[data-page="page-generator"]');
    if (generatorBtn) {
        generatorBtn.addEventListener('click', () => {
            if (!state.generatorColors || state.generatorColors.length === 0) {
                state.generatorColors = generatePaletteColors(state.hex, state.generatorRule);
            }
            const select = document.getElementById('generator-rule-select');
            if (select) {
                select.value = state.generatorRule;
            }
            renderPaletteGenerator();
        });
    }
}

function generatePaletteColors(seedHex, rule) {
    const rgb = ColorUtils.hexToRgb(seedHex);
    const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const h = hsl.h;
    const s = hsl.s;
    const l = hsl.l;
    
    let colors = [];
    const hslToHexStr = (hue, sat, lit) => {
        sat = Math.max(0, Math.min(100, sat));
        lit = Math.max(0, Math.min(100, lit));
        const rgbColor = ColorUtils.hslToRgb(hue, sat, lit);
        return ColorUtils.rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
    };
    
    switch (rule) {
        case 'complementary':
            colors = [
                seedHex,
                hslToHexStr(h, s, l - 15),
                hslToHexStr(h, s, l + 15),
                hslToHexStr((h + 180) % 360, s, l),
                hslToHexStr((h + 180) % 360, s, l + 15)
            ];
            break;
        case 'analogous':
            colors = [
                hslToHexStr((h - 30 + 360) % 360, s, l),
                hslToHexStr((h - 15 + 360) % 360, s, l),
                seedHex,
                hslToHexStr((h + 15) % 360, s, l),
                hslToHexStr((h + 30) % 360, s, l)
            ];
            break;
        case 'triadic':
            colors = [
                seedHex,
                hslToHexStr(h, s, l - 15),
                hslToHexStr((h + 120) % 360, s, l),
                hslToHexStr((h + 120) % 360, s, l + 15),
                hslToHexStr((h + 240) % 360, s, l)
            ];
            break;
        case 'tetradic':
            colors = [
                seedHex,
                hslToHexStr((h + 90) % 360, s, l),
                hslToHexStr((h + 180) % 360, s, l),
                hslToHexStr((h + 270) % 360, s, l),
                hslToHexStr(h, s, l - 20)
            ];
            break;
        case 'monochromatic':
            colors = [
                hslToHexStr(h, s, l - 30),
                hslToHexStr(h, s, l - 15),
                seedHex,
                hslToHexStr(h, s, l + 15),
                hslToHexStr(h, s, l + 30)
            ];
            break;
        case 'freestyle':
        default:
            colors = [seedHex];
            for (let i = 1; i < 5; i++) {
                const randH = Math.random() * 360;
                const randS = 50 + Math.random() * 30;
                const randL = 40 + Math.random() * 30;
                colors.push(hslToHexStr(randH, randS, randL));
            }
            break;
    }
    return colors.map(c => c.toUpperCase());
}

export function renderPaletteGenerator() {
    const container = document.getElementById('generator-swatches');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const hex = state.generatorColors[i] || 'FFFFFF';
        const isLocked = state.generatorLocks[i];
        
        const swatch = document.createElement('div');
        swatch.className = 'generator-swatch';
        
        // Swatch Preview Color Block
        const preview = document.createElement('div');
        preview.className = 'generator-swatch-preview';
        preview.style.backgroundColor = `#${hex}`;
        
        // Lock button
        const lockBtn = document.createElement('button');
        lockBtn.className = `lock-badge ${isLocked ? 'locked' : ''}`;
        lockBtn.innerHTML = `<span class="material-symbols-outlined">${isLocked ? 'lock' : 'lock_open'}</span>`;
        lockBtn.title = isLocked ? 'Locked (Click to unlock)' : 'Unlocked (Click to lock)';
        lockBtn.onclick = (e) => {
            e.stopPropagation();
            state.generatorLocks[i] = !state.generatorLocks[i];
            renderPaletteGenerator();
        };
        preview.appendChild(lockBtn);
        
        // Allow clicking the swatch preview to set as active state color
        preview.onclick = () => {
            updateColorState(hex);
            import('./ui.js').then(ui => ui.showToast());
        };
        
        // Controls under preview
        const controls = document.createElement('div');
        controls.className = 'generator-swatch-controls';
        
        const hexWrapper = document.createElement('div');
        hexWrapper.className = 'hex-wrapper';
        
        const hashSpan = document.createElement('span');
        hashSpan.textContent = '#';
        
        const hexInput = document.createElement('input');
        hexInput.type = 'text';
        hexInput.value = hex;
        hexInput.maxLength = 6;
        hexInput.oninput = (e) => {
            let val = e.target.value.replace('#', '').toUpperCase();
            if (/^[0-9A-F]{6}$/i.test(val)) {
                state.generatorColors[i] = val;
                preview.style.backgroundColor = `#${val}`;
                colorPicker.value = `#${val}`;
            }
        };
        
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = `#${hex}`;
        colorPicker.oninput = (e) => {
            const val = e.target.value.substring(1).toUpperCase();
            state.generatorColors[i] = val;
            hexInput.value = val;
            preview.style.backgroundColor = `#${val}`;
        };
        
        hexWrapper.appendChild(hashSpan);
        hexWrapper.appendChild(hexInput);
        hexWrapper.appendChild(colorPicker);
        
        controls.appendChild(hexWrapper);
        swatch.appendChild(preview);
        swatch.appendChild(controls);
        
        container.appendChild(swatch);
    }
}

export function runPaletteGeneration() {
    let seedHex = state.hex;
    const firstLockedIdx = state.generatorLocks.indexOf(true);
    if (firstLockedIdx > -1) {
        seedHex = state.generatorColors[firstLockedIdx] || state.hex;
    }
    
    const candidates = generatePaletteColors(seedHex, state.generatorRule);
    
    for (let i = 0; i < 5; i++) {
        if (!state.generatorLocks[i]) {
            state.generatorColors[i] = candidates[i];
        }
    }
    
    renderPaletteGenerator();
}

export function saveGeneratorPalette() {
    state.generatorColors.forEach(hex => {
        if (!state.palette.includes(hex)) {
            state.palette.push(hex);
        }
    });
    if (state.palette.length > state.MAX_PALETTE_SIZE) {
        state.palette = state.palette.slice(-state.MAX_PALETTE_SIZE);
    }
    localStorage.setItem('saved_palette', JSON.stringify(state.palette));
    import('./ui.js').then(ui => {
        ui.renderSavedPalette();
        ui.showToast();
    });
}
