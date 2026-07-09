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
    if (dom.advancedPreviewToggle) {
        dom.advancedPreviewToggle.selected = state.advancedPreviewActive;
    }
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
    
    // New workspace and control elements
    const workspace = document.getElementById('image-extractor-workspace');
    const pinsOverlay = document.getElementById('image-pins-overlay');
    const paletteContainer = document.getElementById('image-extracted-palette');
    const slider = document.getElementById('picked-palettes-slider');
    const sliderLabelName = document.getElementById('picked-palette-name');
    const btnAddColor = document.getElementById('palette-add-color');
    const btnRemoveColor = document.getElementById('palette-remove-color');
    const resetBtn = document.getElementById('reset-image-btn');
    const exportBtn = document.getElementById('export-extracted-palette-btn');
    
    // Add file trigger for clicking anywhere in workspace dropZone or button
    const browseImageBtn = document.getElementById('browse-image-btn');
    if (browseImageBtn) {
        browseImageBtn.onclick = () => fileInput.click();
    }

    if (!dropZone) return;

    dropZone.onclick = () => fileInput.click();
    
    dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    };
    dropZone.ondragleave = () => dropZone.classList.remove('dragover');
    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processImage(e.dataTransfer.files[0]);
        }
    };

    fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processImage(e.target.files[0]);
        }
    };

    if (resetBtn) {
        resetBtn.onclick = () => {
            dropZone.style.display = 'flex';
            if (workspace) workspace.style.display = 'none';
            fileInput.value = '';
            // Clear current image logic states
            currentImage = null;
            activePins = [];
            presets = [];
        };
    }

    // Interactive Image Extractor State
    let currentImage = null;
    let activePins = []; // Array of { x, y, hex }
    let activePinIndex = 0;
    let numColors = 5;
    let presets = []; // Array of 5 presets [Vibrant, Muted, Light, Dark, Balanced]
    const presetKeys = ['palette_vibrant', 'palette_muted', 'palette_light', 'palette_dark', 'palette_balanced'];
    const presetNames = ['Vibrant', 'Muted', 'Light', 'Dark', 'Balanced'];

    function processImage(file) {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                dropZone.style.display = 'none';
                if (workspace) workspace.style.display = 'flex';
                
                const MAX_WIDTH = 500;
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Analyze colors & pre-generate presets
                generatePresets(width, height);
                
                // Load initial preset (Balanced is index 4, or Vibrant 0. Let's load Balanced 4 by default)
                if (slider) {
                    slider.value = 4;
                    updateSliderLabel(4);
                }
                loadPreset(4);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function updateSliderLabel(value) {
        if (sliderLabelName) {
            const key = presetKeys[value];
            sliderLabelName.textContent = translations[state.currentLang][key] || presetNames[value];
        }
    }

    if (slider) {
        slider.oninput = (e) => {
            const value = parseInt(e.target.value);
            updateSliderLabel(value);
            loadPreset(value);
        };
    }

    function generatePresets(width, height) {
        // Sample pixels on a grid
        const stepX = Math.max(1, Math.floor(width / 25));
        const stepY = Math.max(1, Math.floor(height / 25));
        const pool = [];
        
        try {
            const imageData = ctx.getImageData(0, 0, width, height).data;
            for (let y = 0; y < height; y += stepY) {
                for (let x = 0; x < width; x += stepX) {
                    const idx = (y * width + x) * 4;
                    const r = imageData[idx];
                    const g = imageData[idx + 1];
                    const b = imageData[idx + 2];
                    const a = imageData[idx + 3];
                    if (a < 128) continue;
                    
                    const hex = ColorUtils.rgbToHex(r, g, b);
                    const hsl = ColorUtils.rgbToHsl(r, g, b);
                    pool.push({ x, y, r, g, b, h: hsl.h, s: hsl.s, l: hsl.l, hex });
                }
            }
        } catch (e) {
            console.error("Error sampling pixels:", e);
        }

        if (pool.length === 0) {
            // Fallback pool in case of error
            pool.push({ x: Math.floor(width/2), y: Math.floor(height/2), r: 103, g: 80, b: 164, h: 256, s: 34, l: 48, hex: "6750A4" });
        }

        // Helper: pick up to 10 distinct colors for a preset
        function pickDistinct(sortedPool) {
            const selected = [];
            const minDistance = 45; // Minimum RGB Euclidean distance
            
            for (const item of sortedPool) {
                let tooClose = false;
                for (const sel of selected) {
                    const d = Math.sqrt(Math.pow(item.r - sel.r, 2) + Math.pow(item.g - sel.g, 2) + Math.pow(item.b - sel.b, 2));
                    if (d < minDistance) {
                        tooClose = true;
                        break;
                    }
                }
                if (!tooClose) {
                    selected.push(item);
                    if (selected.length >= 10) break;
                }
            }
            
            // If not enough colors, relax distance requirement
            if (selected.length < 10 && sortedPool.length > selected.length) {
                for (const item of sortedPool) {
                    if (selected.includes(item)) continue;
                    let tooClose = false;
                    for (const sel of selected) {
                        const d = Math.sqrt(Math.pow(item.r - sel.r, 2) + Math.pow(item.g - sel.g, 2) + Math.pow(item.b - sel.b, 2));
                        if (d < 15) {
                            tooClose = true;
                            break;
                        }
                    }
                    if (!tooClose) {
                        selected.push(item);
                        if (selected.length >= 10) break;
                    }
                }
            }

            // Still not enough? Fill with duplicates from sortedPool
            while (selected.length < 10 && sortedPool.length > 0) {
                const item = sortedPool[selected.length % sortedPool.length];
                selected.push({
                    x: Math.min(width - 1, Math.max(0, Math.floor(item.x + (Math.random() - 0.5) * 40))),
                    y: Math.min(height - 1, Math.max(0, Math.floor(item.y + (Math.random() - 0.5) * 40))),
                    r: item.r, g: item.g, b: item.b, h: item.h, s: item.s, l: item.l, hex: item.hex
                });
            }
            
            return selected;
        }

        // 1. Vibrant (high saturation)
        const vibrantPool = [...pool].sort((a, b) => b.s - a.s);
        presets[0] = pickDistinct(vibrantPool);

        // 2. Muted (low saturation)
        const mutedPool = [...pool].sort((a, b) => a.s - b.s);
        presets[1] = pickDistinct(mutedPool);

        // 3. Light (high lightness)
        const lightPool = [...pool].sort((a, b) => b.l - a.l);
        presets[2] = pickDistinct(lightPool);

        // 4. Dark (low lightness)
        const darkPool = [...pool].sort((a, b) => a.l - b.l);
        presets[3] = pickDistinct(darkPool);

        // 5. Balanced (Representative clustering)
        // Sort pool by frequency density
        const counts = {};
        pool.forEach(p => {
            const key = `${Math.round(p.r/20)*20},${Math.round(p.g/20)*20},${Math.round(p.b/20)*20}`;
            counts[key] = (counts[key] || 0) + 1;
        });
        const balancedPool = [...pool].sort((a, b) => {
            const keyA = `${Math.round(a.r/20)*20},${Math.round(a.g/20)*20},${Math.round(a.b/20)*20}`;
            const keyB = `${Math.round(b.r/20)*20},${Math.round(b.g/20)*20},${Math.round(b.b/20)*20}`;
            return counts[keyB] - counts[keyA];
        });
        presets[4] = pickDistinct(balancedPool);
    }

    function loadPreset(index) {
        const preset = presets[index] || [];
        activePins = [];
        for (let i = 0; i < numColors; i++) {
            if (preset[i]) {
                activePins.push({
                    x: preset[i].x,
                    y: preset[i].y,
                    hex: preset[i].hex
                });
            }
        }
        activePinIndex = 0;
        renderWorkspace();
    }

    function renderWorkspace() {
        if (!paletteContainer || !pinsOverlay) return;
        
        // 1. Render Palette Swatches
        paletteContainer.innerHTML = '';
        const swatches = [];
        
        activePins.forEach((pin, i) => {
            const swatch = document.createElement('div');
            swatch.className = 'extracted-swatch';
            swatch.style.backgroundColor = `#${pin.hex}`;
            swatch.title = `#${pin.hex}`;
            if (i === activePinIndex) {
                swatch.classList.add('active');
            }
            
            swatch.onclick = () => {
                activePinIndex = i;
                // Highlight corresponding pin
                document.querySelectorAll('.image-pin').forEach((p, idx) => {
                    if (idx === i) p.classList.add('active');
                    else p.classList.remove('active');
                });
                
                // Redraw palette to move active class
                document.querySelectorAll('.extracted-swatch').forEach((s, idx) => {
                    if (idx === i) s.classList.add('active');
                    else s.classList.remove('active');
                });
                
                // Update app color state
                updateColorState(pin.hex, true);
            };

            paletteContainer.appendChild(swatch);
            swatches.push(swatch);
        });

        // Update add/remove button states
        if (btnAddColor) btnAddColor.disabled = activePins.length >= 10;
        if (btnRemoveColor) btnRemoveColor.disabled = activePins.length <= 2;

        // 2. Render Pins Overlay
        pinsOverlay.innerHTML = '';
        activePins.forEach((pin, i) => {
            const pinEl = document.createElement('div');
            pinEl.className = 'image-pin';
            pinEl.style.left = `${(pin.x / canvas.width) * 100}%`;
            pinEl.style.top = `${(pin.y / canvas.height) * 100}%`;
            pinEl.style.backgroundColor = `#${pin.hex}`;
            
            if (i === activePinIndex) {
                pinEl.classList.add('active');
            }

            // Drag event handling
            let isDragging = false;
            
            const startDrag = (e) => {
                e.preventDefault();
                isDragging = true;
                activePinIndex = i;
                
                // Highlight active
                document.querySelectorAll('.image-pin').forEach((p, idx) => {
                    if (idx === i) p.classList.add('active');
                    else p.classList.remove('active');
                });
                document.querySelectorAll('.extracted-swatch').forEach((s, idx) => {
                    if (idx === i) s.classList.add('active');
                    else s.classList.remove('active');
                });
                
                document.addEventListener('mousemove', onDrag);
                document.addEventListener('mouseup', stopDrag);
                document.addEventListener('touchmove', onDrag, { passive: false });
                document.addEventListener('touchend', stopDrag);
            };

            const onDrag = (e) => {
                if (!isDragging) return;
                e.preventDefault();
                
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                
                const rect = canvas.getBoundingClientRect();
                let clientXRel = clientX - rect.left;
                let clientYRel = clientY - rect.top;
                
                // Clamp
                clientXRel = Math.max(0, Math.min(rect.width, clientXRel));
                clientYRel = Math.max(0, Math.min(rect.height, clientYRel));
                
                const pctX = clientXRel / rect.width;
                const pctY = clientYRel / rect.height;
                
                const pixelX = Math.min(canvas.width - 1, Math.floor(pctX * canvas.width));
                const pixelY = Math.min(canvas.height - 1, Math.floor(pctY * canvas.height));
                
                try {
                    const pixel = ctx.getImageData(pixelX, pixelY, 1, 1).data;
                    const hex = ColorUtils.rgbToHex(pixel[0], pixel[1], pixel[2]);
                    
                    pin.x = pixelX;
                    pin.y = pixelY;
                    pin.hex = hex;
                    
                    pinEl.style.left = `${pctX * 100}%`;
                    pinEl.style.top = `${pctY * 100}%`;
                    pinEl.style.backgroundColor = `#${hex}`;
                    
                    swatches[i].style.backgroundColor = `#${hex}`;
                    swatches[i].title = `#${hex}`;
                    
                    updateColorState(hex, true); // update app state without creating history spam
                } catch (err) {
                    console.error("Error reading pixel on drag:", err);
                }
            };

            const stopDrag = () => {
                if (isDragging) {
                    isDragging = false;
                    document.removeEventListener('mousemove', onDrag);
                    document.removeEventListener('mouseup', stopDrag);
                    document.removeEventListener('touchmove', onDrag);
                    document.removeEventListener('touchend', stopDrag);
                    
                    // Add finalized color to history
                    updateColorState(pin.hex, false);
                }
            };

            pinEl.addEventListener('mousedown', startDrag);
            pinEl.addEventListener('touchstart', startDrag, { passive: false });
            
            // Also select on click
            pinEl.addEventListener('click', (e) => {
                e.stopPropagation();
                activePinIndex = i;
                renderWorkspace();
                updateColorState(pin.hex, true);
            });

            pinsOverlay.appendChild(pinEl);
        });

        // Set active app color to the currently active pin's color
        if (activePins[activePinIndex]) {
            updateColorState(activePins[activePinIndex].hex, true);
        }
    }

    // Add Color Button
    if (btnAddColor) {
        btnAddColor.onclick = () => {
            if (activePins.length >= 10) return;
            
            // Find next distinct color in the image
            // We search a grid to find the pixel whose color has the maximum distance from existing pin colors
            let bestX = Math.floor(canvas.width / 2);
            let bestY = Math.floor(canvas.height / 2);
            let bestHex = "FFFFFF";
            let maxMinDist = -1;
            
            try {
                const step = 20;
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                
                for (let y = 10; y < canvas.height; y += step) {
                    for (let x = 10; x < canvas.width; x += step) {
                        const idx = (y * canvas.width + x) * 4;
                        const r = imageData[idx];
                        const g = imageData[idx + 1];
                        const b = imageData[idx + 2];
                        const a = imageData[idx + 3];
                        if (a < 128) continue;
                        
                        // Min distance to any active pin
                        let minDist = Infinity;
                        activePins.forEach(pin => {
                            // Read pixel at pin position
                            const pxIdx = (pin.y * canvas.width + pin.x) * 4;
                            const pr = imageData[pxIdx];
                            const pg = imageData[pxIdx + 1];
                            const pb = imageData[pxIdx + 2];
                            const d = Math.sqrt(Math.pow(r - pr, 2) + Math.pow(g - pg, 2) + Math.pow(b - pb, 2));
                            if (d < minDist) minDist = d;
                        });
                        
                        if (minDist > maxMinDist) {
                            maxMinDist = minDist;
                            bestX = x;
                            bestY = y;
                            bestHex = ColorUtils.rgbToHex(r, g, b);
                        }
                    }
                }
            } catch (e) {
                console.error("Error finding distinct color to add:", e);
            }
            
            activePins.push({
                x: bestX,
                y: bestY,
                hex: bestHex
            });
            numColors = activePins.length;
            activePinIndex = activePins.length - 1;
            renderWorkspace();
            updateColorState(bestHex, false);
        };
    }

    // Remove Color Button
    if (btnRemoveColor) {
        btnRemoveColor.onclick = () => {
            if (activePins.length <= 2) return;
            activePins.splice(activePinIndex, 1);
            numColors = activePins.length;
            // Adjust active index
            if (activePinIndex >= activePins.length) {
                activePinIndex = activePins.length - 1;
            }
            renderWorkspace();
            if (activePins[activePinIndex]) {
                updateColorState(activePins[activePinIndex].hex, false);
            }
        };
    }

    // Export Palette Image
    if (exportBtn) {
        exportBtn.onclick = () => {
            const canvasExp = document.createElement('canvas');
            const colorCount = activePins.length;
            const stripWidth = Math.max(150, 600 / colorCount);
            canvasExp.width = stripWidth * colorCount;
            canvasExp.height = 300;
            const ctxExp = canvasExp.getContext('2d');

            ctxExp.fillStyle = '#FFFFFF';
            ctxExp.fillRect(0, 0, canvasExp.width, canvasExp.height);

            activePins.forEach((pin, i) => {
                ctxExp.fillStyle = `#${pin.hex}`;
                ctxExp.fillRect(i * stripWidth, 0, stripWidth, 230);
                
                // Draw color hex code
                ctxExp.fillStyle = '#333333';
                ctxExp.font = 'bold 20px "Roboto Slab", serif';
                ctxExp.textAlign = 'center';
                ctxExp.fillText(`#${pin.hex}`, i * stripWidth + stripWidth / 2, 270);
            });
            
            const link = document.createElement('a');
            link.download = `extracted-palette.png`;
            link.href = canvasExp.toDataURL();
            link.click();
        };
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
        angleGroup.style.display = 'block';
        updateGradient();
    };
    
    btnRadial.onclick = () => {
        type = 'radial';
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
    
    const tokenPairs = [
        { bg: '--md-sys-color-primary', fg: '--md-sys-color-on-primary' },
        { bg: '--md-sys-color-on-primary', fg: '--md-sys-color-primary' },
        { bg: '--md-sys-color-primary-container', fg: '--md-sys-color-on-primary-container' },
        { bg: '--md-sys-color-on-primary-container', fg: '--md-sys-color-primary-container' },
        { bg: '--md-sys-color-secondary', fg: '--md-sys-color-on-secondary' },
        { bg: '--md-sys-color-on-secondary', fg: '--md-sys-color-secondary' },
        { bg: '--md-sys-color-secondary-container', fg: '--md-sys-color-on-secondary-container' },
        { bg: '--md-sys-color-on-secondary-container', fg: '--md-sys-color-secondary-container' },
        { bg: '--md-sys-color-tertiary', fg: '--md-sys-color-on-tertiary' },
        { bg: '--md-sys-color-on-tertiary', fg: '--md-sys-color-tertiary' },
        { bg: '--md-sys-color-tertiary-container', fg: '--md-sys-color-on-tertiary-container' },
        { bg: '--md-sys-color-on-tertiary-container', fg: '--md-sys-color-tertiary-container' },
        { bg: '--md-sys-color-error', fg: '--md-sys-color-on-error' },
        { bg: '--md-sys-color-on-error', fg: '--md-sys-color-error' },
        { bg: '--md-sys-color-error-container', fg: '--md-sys-color-on-error-container' },
        { bg: '--md-sys-color-on-error-container', fg: '--md-sys-color-error-container' },
        { bg: '--md-sys-color-background', fg: '--md-sys-color-on-background' },
        { bg: '--md-sys-color-on-background', fg: '--md-sys-color-background' },
        { bg: '--md-sys-color-surface', fg: '--md-sys-color-on-surface' },
        { bg: '--md-sys-color-on-surface', fg: '--md-sys-color-surface' },
        { bg: '--md-sys-color-surface-variant', fg: '--md-sys-color-on-surface-variant' },
        { bg: '--md-sys-color-on-surface-variant', fg: '--md-sys-color-surface-variant' },
        { bg: '--md-sys-color-outline', fg: '--md-sys-color-surface' },
        { bg: '--md-sys-color-outline-variant', fg: '--md-sys-color-on-surface' },
        { bg: '--md-sys-color-inverse-surface', fg: '--md-sys-color-inverse-on-surface' },
        { bg: '--md-sys-color-inverse-on-surface', fg: '--md-sys-color-inverse-surface' },
        { bg: '--md-sys-color-inverse-primary', fg: '--md-sys-color-primary' },
        { bg: '--md-sys-color-surface-container-lowest', fg: '--md-sys-color-on-surface' },
        { bg: '--md-sys-color-surface-container-low', fg: '--md-sys-color-on-surface' },
        { bg: '--md-sys-color-surface-container', fg: '--md-sys-color-on-surface' },
        { bg: '--md-sys-color-surface-container-high', fg: '--md-sys-color-on-surface' },
        { bg: '--md-sys-color-surface-container-highest', fg: '--md-sys-color-on-surface' }
    ];
    
    grid.innerHTML = '';
    
    tokenPairs.forEach(pair => {
        const computed = window.getComputedStyle(document.documentElement);
        let val = computed.getPropertyValue(pair.bg).trim();
        if(!val) return;
        
        const item = document.createElement('div');
        item.style.backgroundColor = `var(${pair.bg})`;
        item.style.color = `var(${pair.fg})`;
        item.style.padding = '12px';
        item.style.borderRadius = '16px';
        item.style.border = '1px solid rgba(128,128,128,0.2)';
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.justifyContent = 'space-between';
        item.style.height = '110px';
        item.title = `${pair.bg}: ${val}`;
        
        const nameSpan = document.createElement('span');
        nameSpan.style.fontSize = '12px';
        nameSpan.style.fontWeight = '700';
        nameSpan.style.wordBreak = 'break-word';
        nameSpan.textContent = pair.bg.replace('--md-sys-color-', '');
        
        const valSpan = document.createElement('span');
        valSpan.style.fontSize = '11px';
        valSpan.style.opacity = '0.8';
        valSpan.textContent = val;
        
        item.appendChild(nameSpan);
        item.appendChild(valSpan);
        
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

export function syncGradientColors() {
    const color1 = document.getElementById('grad-color-1');
    const hex1 = document.getElementById('grad-hex-1');
    const color2 = document.getElementById('grad-color-2');
    const hex2 = document.getElementById('grad-hex-2');
    const preview = document.getElementById('gradient-preview');
    const code = document.getElementById('gradient-code');
    const angleSlider = document.getElementById('grad-angle');
    const btnRadial = document.getElementById('grad-radial');
    
    if (!color1) return;
    
    color1.value = `#${state.hex}`;
    if (hex1) hex1.value = state.hex.toUpperCase();
    
    const h1 = (state.hsl.h + 45) % 360;
    const rgb1 = ColorUtils.hslToRgb(h1, state.hsl.s, state.hsl.l);
    const hexVal2 = ColorUtils.rgbToHex(rgb1.r, rgb1.g, rgb1.b).toUpperCase();
    color2.value = `#${hexVal2}`;
    if (hex2) hex2.value = hexVal2;
    
    const isRadial = btnRadial && (btnRadial.active || btnRadial.hasAttribute('active'));
    const angle = angleSlider ? angleSlider.value : 90;
    
    let css = '';
    if(!isRadial) {
        css = `background: linear-gradient(${angle}deg, #${state.hex}, #${hexVal2});`;
    } else {
        css = `background: radial-gradient(circle, #${state.hex}, #${hexVal2});`;
    }
    
    if (preview) {
        preview.style.cssText = `${css} width: 100%; height: 300px; border-radius: 24px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);`;
    }
    if (code) {
        code.textContent = css;
    }
}
