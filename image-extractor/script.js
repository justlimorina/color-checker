import { ColorUtils } from '../assets/script/utils.js';
import { translations } from '../assets/script/config.js';
import { initLayout, layoutState } from '../assets/script/shared/layout.js';
import { ProjectManager } from '../assets/script/projects.js';

// Global references
let currentImage = null;
let activePins = []; // Array of { x, y, hex }
let activePinIndex = 0;
let numColors = 5;
let presets = []; // Array of 5 presets [Vibrant, Muted, Light, Dark, Balanced]
const presetKeys = ['palette_vibrant', 'palette_muted', 'palette_light', 'palette_dark', 'palette_balanced'];
const presetNames = ['Vibrant', 'Muted', 'Light', 'Dark', 'Balanced'];

// DOM references
let dropZone, fileInput, canvas, ctx, workspace, pinsOverlay, paletteContainer, slider, sliderLabelName, btnAddColor, btnRemoveColor, resetBtn, exportBtn, saveProjectBtn, toast, sampleGallery, imageSourceName;
let loupeEl, loupeCanvas, loupeCtx, loupeLabel, proportionBar, flowGradBtn, flowThemeBtn, copyAllPinsBtn, sortHueBtn, sortLightBtn, exportPhotoCardBtn, flowContrastBtn, flowMatrixBtn, swatchesGrid, pinsCountBadge;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Layout
    initLayout('image');

    // Bind DOM elements
    dropZone = document.getElementById('image-drop-zone');
    fileInput = document.getElementById('image-upload');
    canvas = document.getElementById('image-canvas');
    workspace = document.getElementById('image-extractor-workspace');
    pinsOverlay = document.getElementById('image-pins-overlay');
    paletteContainer = document.getElementById('image-extracted-palette');
    slider = document.getElementById('picked-palettes-slider');
    sliderLabelName = document.getElementById('picked-palette-name');
    btnAddColor = document.getElementById('palette-add-color');
    btnRemoveColor = document.getElementById('palette-remove-color');
    resetBtn = document.getElementById('reset-image-btn');
    exportBtn = document.getElementById('export-extracted-palette-btn');
    saveProjectBtn = document.getElementById('save-palette-to-project-btn');
    toast = document.getElementById('toast');
    sampleGallery = document.getElementById('sample-gallery');
    imageSourceName = document.getElementById('image-source-name');
    
    loupeEl = document.getElementById('magnifier-loupe');
    loupeCanvas = document.getElementById('loupe-canvas');
    if (loupeCanvas) loupeCtx = loupeCanvas.getContext('2d');
    loupeLabel = document.getElementById('loupe-label');
    proportionBar = document.getElementById('color-proportion-bar');
    flowGradBtn = document.getElementById('flow-gradient-btn');
    flowThemeBtn = document.getElementById('flow-theme-btn');
    copyAllPinsBtn = document.getElementById('copy-all-pins-btn');
    sortHueBtn = document.getElementById('sort-pins-hue-btn');
    sortLightBtn = document.getElementById('sort-pins-light-btn');
    exportPhotoCardBtn = document.getElementById('export-photo-card-btn');
    flowContrastBtn = document.getElementById('flow-contrast-btn');
    flowMatrixBtn = document.getElementById('flow-matrix-btn');
    swatchesGrid = document.getElementById('extracted-swatches-grid');
    pinsCountBadge = document.getElementById('pins-count-badge');

    if (canvas) {
        ctx = canvas.getContext('2d');
    }

    // Attach events
    attachEvents();
});

// Watch language changes to translate slider label
window.addEventListener('langchange', () => {
    if (slider) {
        updateSliderLabel(parseInt(slider.value));
    }
});

function attachEvents() {
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
            if (sampleGallery) sampleGallery.style.display = 'block';
            if (workspace) workspace.style.display = 'none';
            fileInput.value = '';
            currentImage = null;
            activePins = [];
            presets = [];
            if (imageSourceName) imageSourceName.textContent = '';
        };
    }

    if (saveProjectBtn) {
        saveProjectBtn.onclick = () => {
            if (!activePins || activePins.length === 0) return;
            let count = 0;
            activePins.forEach(pin => {
                if (ProjectManager.addColorToActiveProject(pin.hex)) {
                    count++;
                }
            });
            showToast(translations[layoutState.currentLang]?.saved_to_project_success || 'Saved colors to project!');
        };
    }

    // Clipboard Paste support
    window.addEventListener('paste', (e) => {
        const items = (e.clipboardData || window.clipboardData)?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    processImage(file);
                    showToast(translations[layoutState.currentLang]?.paste_from_clipboard || 'Image pasted!');
                    break;
                }
            }
        }
    });

    // Sample Images Gallery clicks
    document.querySelectorAll('.sample-img-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            loadSampleImage(btn.dataset.sampleSrc, btn.dataset.sampleName);
        });
    });

    if (slider) {
        slider.oninput = (e) => {
            const value = parseInt(e.target.value);
            updateSliderLabel(value);
            loadPreset(value);
        };
    }

    if (flowGradBtn) {
        flowGradBtn.onclick = () => {
            if (!activePins || activePins.length === 0) return;
            const hexes = activePins.map(p => p.hex).join(',');
            window.location.href = `../css-gradient-generator/?colors=${hexes}`;
        };
    }

    if (flowThemeBtn) {
        flowThemeBtn.onclick = () => {
            const hex = activePins[activePinIndex]?.hex || (activePins[0]?.hex || '624E9A');
            window.location.href = `../md3-theme-creator/?seed=${hex}`;
        };
    }

    if (btnAddColor) {
        btnAddColor.onclick = () => {
            if (activePins.length >= 10) return;
            
            // Find next distinct color in the image
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
                        
                        let minDist = Infinity;
                        activePins.forEach(pin => {
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

    if (btnRemoveColor) {
        btnRemoveColor.onclick = () => {
            if (activePins.length <= 2) return;
            activePins.splice(activePinIndex, 1);
            numColors = activePins.length;
            if (activePinIndex >= activePins.length) {
                activePinIndex = activePins.length - 1;
            }
            renderWorkspace();
            if (activePins[activePinIndex]) {
                updateColorState(activePins[activePinIndex].hex, false);
            }
        };
    }

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

function processImage(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!file || !allowedTypes.includes(file.type)) {
        showToast('Please choose a JPG, PNG, or WebP image.');
        return;
    }
    if (file.size > 15 * 1024 * 1024) {
        showToast('Please choose an image smaller than 15 MB.');
        return;
    }
    const objectUrl = URL.createObjectURL(file);
    loadImageSource(objectUrl, file.name || 'Uploaded image', () => URL.revokeObjectURL(objectUrl));
}

function loadSampleImage(src, name) {
    loadImageSource(src, name);
}

function loadImageSource(src, name, cleanup = null) {
    const img = new Image();
    img.onload = () => {
        currentImage = img;
        dropZone.style.display = 'none';
        if (sampleGallery) sampleGallery.style.display = 'none';
        if (workspace) workspace.style.display = 'flex';
        if (imageSourceName) imageSourceName.textContent = name;

        const MAX_DIMENSION = 1200;
        const MAX_PIXELS = 1_800_000;
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight), Math.sqrt(MAX_PIXELS / (img.naturalWidth * img.naturalHeight)));
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        cleanup?.();

        generatePresets(width, height);
        if (slider) {
            slider.value = 4;
            updateSliderLabel(4);
        }
        loadPreset(4);
    };
    img.onerror = () => {
        cleanup?.();
        showToast('This image could not be loaded. Please try another one.');
    };
    img.src = src;
}

function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function updateSliderLabel(value) {
    if (sliderLabelName) {
        const key = presetKeys[value];
        sliderLabelName.textContent = translations[layoutState.currentLang]?.[key] || presetNames[value];
    }
    document.querySelectorAll('.mood-preset-chip').forEach(chip => {
        chip.classList.toggle('active', parseInt(chip.dataset.idx) === value);
    });
}

function generatePresets(width, height) {
    const marginX = Math.max(16, Math.floor(width * 0.04));
    const marginY = Math.max(16, Math.floor(height * 0.04));
    const stepX = Math.max(1, Math.floor((width - marginX * 2) / 25));
    const stepY = Math.max(1, Math.floor((height - marginY * 2) / 25));
    const pool = [];
    
    try {
        const imageData = ctx.getImageData(0, 0, width, height).data;
        for (let y = marginY; y <= height - marginY; y += stepY) {
            for (let x = marginX; x <= width - marginX; x += stepX) {
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
        pool.push({ x: Math.floor(width/2), y: Math.floor(height/2), r: 98, g: 78, b: 154, h: 256, s: 33, l: 45, hex: "624E9A" });
    }

    function pickDistinct(sortedPool) {
        const selected = [];
        const minDistance = 45;
        
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

        while (selected.length < 10 && sortedPool.length > 0) {
            const item = sortedPool[selected.length % sortedPool.length];
            selected.push({
                x: Math.min(width - 16, Math.max(16, Math.floor(item.x + (Math.random() - 0.5) * 40))),
                y: Math.min(height - 16, Math.max(16, Math.floor(item.y + (Math.random() - 0.5) * 40))),
                r: item.r, g: item.g, b: item.b, h: item.h, s: item.s, l: item.l, hex: item.hex
            });
        }
        
        return selected;
    }

    presets[0] = pickDistinct([...pool].sort((a, b) => b.s - a.s)); // Vibrant
    presets[1] = pickDistinct([...pool].sort((a, b) => a.s - b.s)); // Muted
    presets[2] = pickDistinct([...pool].sort((a, b) => b.l - a.l)); // Light
    presets[3] = pickDistinct([...pool].sort((a, b) => a.l - b.l)); // Dark

    const counts = {};
    pool.forEach(p => {
        const key = `${Math.round(p.r/20)*20},${Math.round(p.g/20)*20},${Math.round(p.b/20)*20}`;
        counts[key] = (counts[key] || 0) + 1;
    });
    presets[4] = pickDistinct([...pool].sort((a, b) => {
        const keyA = `${Math.round(a.r/20)*20},${Math.round(a.g/20)*20},${Math.round(a.b/20)*20}`;
        const keyB = `${Math.round(b.r/20)*20},${Math.round(b.g/20)*20},${Math.round(b.b/20)*20}`;
        return counts[keyB] - counts[keyA];
    })); // Balanced
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
    
    // Update count badge
    if (pinsCountBadge) {
        pinsCountBadge.textContent = activePins.length === 1 ? '1 color' : `${activePins.length} colors`;
    }

    // 1. Render Palette Ribbon
    paletteContainer.innerHTML = '';
    const swatches = [];
    
    activePins.forEach((pin, i) => {
        const swatch = document.createElement('div');
        swatch.className = 'extracted-swatch';
        swatch.style.backgroundColor = `#${pin.hex}`;
        swatch.title = `#${pin.hex} - ${ColorUtils.getColorName(pin.hex)}`;
        if (i === activePinIndex) {
            swatch.classList.add('active');
        }
        
        swatch.onclick = () => {
            activePinIndex = i;
            renderWorkspace();
            updateColorState(pin.hex, true);
        };

        paletteContainer.appendChild(swatch);
        swatches.push(swatch);
    });

    if (btnAddColor) btnAddColor.disabled = activePins.length >= 10;
    if (btnRemoveColor) btnRemoveColor.disabled = activePins.length <= 2;

    // 2. Render Swatches List (mirrors #grad-stops-list in gradient-generator)
    if (swatchesGrid) {
        swatchesGrid.innerHTML = '';
        activePins.forEach((pin, i) => {
            const row = document.createElement('div');
            row.className = `extractor-swatch-row ${i === activePinIndex ? 'active' : ''}`;
            row.id = `pin-row-${i}`;

            const colorName = ColorUtils.getColorName(pin.hex);

            row.innerHTML = `
                <div class="swatch-circle-badge" style="background-color: #${pin.hex};">${i + 1}</div>
                <div class="hex-wrapper" style="width: 86px; height: 30px; margin: 0; padding: 0 6px;">
                    <span>#</span>
                    <input type="text" readonly value="${pin.hex}" style="width: 58px; font-size: 0.88rem; font-family: 'Roboto Mono', monospace; font-weight: 700; background: transparent; border: none; color: inherit; cursor: pointer;">
                </div>
                <span style="flex: 1; font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-left: 2px;">${colorName}</span>
                <button type="button" class="icon-button small-btn copy-pin-btn" title="Copy HEX" style="border: none; background: transparent; cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: var(--md-sys-color-on-surface-variant);">
                    <span class="material-symbols-rounded" style="font-size: 16px;">content_copy</span>
                </button>
                <button type="button" class="icon-button small-btn del-pin-btn" title="Delete Pin" style="border: none; background: transparent; cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: ${activePins.length <= 2 ? 'var(--md-sys-color-outline)' : 'var(--md-sys-color-error)'};" ${activePins.length <= 2 ? 'disabled' : ''}>
                    <span class="material-symbols-rounded" style="font-size: 16px;">delete</span>
                </button>
            `;

            const copyBtn = row.querySelector('.copy-pin-btn');
            if (copyBtn) {
                copyBtn.onclick = (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`#${pin.hex}`);
                    showToast(`${translations[layoutState.currentLang]?.copied_hex || 'Copied'} #${pin.hex}`);
                };
            }

            const delBtn = row.querySelector('.del-pin-btn');
            if (delBtn) {
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (activePins.length <= 2) return;
                    activePins.splice(i, 1);
                    numColors = activePins.length;
                    if (activePinIndex >= activePins.length) {
                        activePinIndex = activePins.length - 1;
                    }
                    renderWorkspace();
                    if (activePins[activePinIndex]) {
                        updateColorState(activePins[activePinIndex].hex, false);
                    }
                };
            }

            row.onclick = () => {
                activePinIndex = i;
                renderWorkspace();
                updateColorState(pin.hex, true);
            };

            swatchesGrid.appendChild(row);
        });
    }

    // 3. Render Pins with high-contrast numbers
    pinsOverlay.innerHTML = '';
    activePins.forEach((pin, i) => {
        const pinEl = document.createElement('div');
        pinEl.className = 'image-pin';
        pinEl.style.left = `${(pin.x / canvas.width) * 100}%`;
        pinEl.style.top = `${(pin.y / canvas.height) * 100}%`;
        pinEl.style.backgroundColor = `#${pin.hex}`;
        pinEl.innerHTML = `<span class="pin-number">${i + 1}</span>`;
        
        if (i === activePinIndex) {
            pinEl.classList.add('active');
        }

        // Dragging support
        let isDragging = false;
        
        const startDrag = (e) => {
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;
            activePinIndex = i;
            
            document.querySelectorAll('.image-pin').forEach((p, idx) => {
                p.classList.toggle('active', idx === i);
            });
            document.querySelectorAll('.extracted-swatch').forEach((s, idx) => {
                s.classList.toggle('active', idx === i);
            });
            document.querySelectorAll('.extractor-swatch-row').forEach((c, idx) => {
                c.classList.toggle('active', idx === i);
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
            
            const pinRadius = 13;
            clientXRel = Math.max(pinRadius, Math.min(rect.width - pinRadius, clientXRel));
            clientYRel = Math.max(pinRadius, Math.min(rect.height - pinRadius, clientYRel));
            
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
                
                if (swatches[i]) {
                    swatches[i].style.backgroundColor = `#${hex}`;
                    swatches[i].title = `#${hex} - ${ColorUtils.getColorName(hex)}`;
                }
                
                if (swatchesGrid && swatchesGrid.children[i]) {
                    const r = swatchesGrid.children[i];
                    const b = r.querySelector('.swatch-circle-badge');
                    if (b) b.style.backgroundColor = `#${hex}`;
                    const inp = r.querySelector('input');
                    if (inp) inp.value = hex;
                    const nameEl = r.querySelector('span:nth-of-type(1)');
                    if (nameEl) nameEl.textContent = ColorUtils.getColorName(hex);
                }

                updateLoupe(pixelX, pixelY, hex);
                updateColorState(hex, true);
            } catch (err) {
                console.error("Error reading pixel on drag:", err);
            }
        };

        const stopDrag = () => {
            if (isDragging) {
                isDragging = false;
                hideLoupe();
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', stopDrag);
                document.removeEventListener('touchmove', onDrag);
                document.removeEventListener('touchend', stopDrag);
                updateColorState(pin.hex, false);
                updateProportionBar();
            }
        };

        pinEl.addEventListener('mousedown', startDrag);
        pinEl.addEventListener('touchstart', startDrag, { passive: false });
        
        pinEl.addEventListener('click', (e) => {
            e.stopPropagation();
            activePinIndex = i;
            renderWorkspace();
            updateColorState(pin.hex, true);
        });

        pinsOverlay.appendChild(pinEl);
    });

    if (activePins[activePinIndex]) {
        updateColorState(activePins[activePinIndex].hex, true);
    }

    updateProportionBar();
}

function updateLoupe(pixelX, pixelY, hex) {
    if (!loupeEl || !loupeCanvas || !loupeCtx || !canvas) return;
    loupeEl.style.display = 'block';
    loupeEl.style.left = `${(pixelX / canvas.width) * 100}%`;
    loupeEl.style.top = `${(pixelY / canvas.height) * 100}%`;

    const cropSize = 20; // 20x20 pixel area for 5x zoom into 100x100 canvas
    const sx = Math.max(0, Math.min(canvas.width - cropSize, pixelX - cropSize / 2));
    const sy = Math.max(0, Math.min(canvas.height - cropSize, pixelY - cropSize / 2));

    loupeCtx.imageSmoothingEnabled = false;
    loupeCtx.clearRect(0, 0, 100, 100);
    loupeCtx.drawImage(canvas, sx, sy, cropSize, cropSize, 0, 0, 100, 100);

    if (loupeLabel) {
        loupeLabel.textContent = `#${hex}`;
    }
}

function hideLoupe() {
    if (loupeEl) loupeEl.style.display = 'none';
}

function updateProportionBar() {
    if (!proportionBar || !activePins || activePins.length === 0 || !canvas || !ctx) return;
    
    // Sample pixels across image to determine dominant color proportions
    const counts = new Array(activePins.length).fill(0);
    let totalSamples = 0;
    
    try {
        const step = Math.max(4, Math.floor(canvas.width / 40));
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const pinRgbs = activePins.map(p => ColorUtils.hexToRgb(p.hex));
        
        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                const idx = (y * canvas.width + x) * 4;
                if (imgData[idx + 3] < 128) continue;
                const r = imgData[idx];
                const g = imgData[idx + 1];
                const b = imgData[idx + 2];
                
                let minD = Infinity;
                let bestPin = 0;
                for (let i = 0; i < pinRgbs.length; i++) {
                    const d = Math.pow(r - pinRgbs[i].r, 2) + Math.pow(g - pinRgbs[i].g, 2) + Math.pow(b - pinRgbs[i].b, 2);
                    if (d < minD) {
                        minD = d;
                        bestPin = i;
                    }
                }
                counts[bestPin]++;
                totalSamples++;
            }
        }
    } catch (err) {
        console.warn('Error calculating proportions:', err);
    }
    
    if (totalSamples === 0) {
        counts.fill(1);
        totalSamples = counts.length;
    }
    
    proportionBar.innerHTML = '';
    activePins.forEach((pin, i) => {
        const pct = Math.max(5, Math.round((counts[i] / totalSamples) * 100));
        const seg = document.createElement('div');
        seg.className = 'color-proportion-seg';
        seg.style.flex = `${pct}`;
        seg.style.backgroundColor = `#${pin.hex}`;
        seg.title = `#${pin.hex} (${pct}%)`;
        
        seg.addEventListener('click', () => {
            activePinIndex = i;
            renderWorkspace();
            updateColorState(pin.hex, true);
        });
        
        proportionBar.appendChild(seg);
    });
}

// Keep active color and history in sync with localStorage
function updateColorState(hex, skipHistory = false) {
    hex = hex.toUpperCase();
    localStorage.setItem('active_hex', hex);
    
    if (!skipHistory) {
        let history = JSON.parse(localStorage.getItem('color_history') || '[]');
        if (history.length === 0 || history[0] !== hex) {
            const idx = history.indexOf(hex);
            if (idx > -1) history.splice(idx, 1);
            history.unshift(hex);
            if (history.length > 30) history.pop();
            localStorage.setItem('color_history', JSON.stringify(history));
        }
    }
}

function sortPins(criterion) {
    if (!activePins || activePins.length < 2) return;
    const sortedHexes = ColorUtils.sortHexes(activePins.map(p => p.hex), criterion);
    activePins.sort((a, b) => sortedHexes.indexOf(a.hex) - sortedHexes.indexOf(b.hex));
    renderWorkspace();
    showToast(translations[layoutState.currentLang]?.sorted_success || `Sorted by ${criterion}`);
}

function exportPhotoPaletteCard() {
    if (!canvas || !activePins || activePins.length === 0) return;

    const exportW = 1200;
    const padding = 40;
    
    // Calculate photo aspect
    const photoW = exportW - padding * 2;
    const aspect = canvas.height / canvas.width;
    const photoH = Math.min(750, Math.round(photoW * aspect));
    
    const swatchH = 110;
    const footerH = 60;
    const exportH = padding + photoH + 32 + swatchH + footerH + padding;

    const c = document.createElement('canvas');
    c.width = exportW;
    c.height = exportH;
    const cx = c.getContext('2d');

    const isDark = layoutState.theme === 'dark';
    cx.fillStyle = isDark ? '#1C1B1F' : '#F4F2F7';
    cx.fillRect(0, 0, exportW, exportH);

    // Draw photo with rounded corners
    cx.save();
    cx.beginPath();
    cx.roundRect(padding, padding, photoW, photoH, 16);
    cx.clip();
    cx.drawImage(canvas, 0, 0, canvas.width, canvas.height, padding, padding, photoW, photoH);
    cx.restore();

    // Draw swatches
    const swatchY = padding + photoH + 32;
    const count = activePins.length;
    const gap = 14;
    const swatchW = (photoW - (count - 1) * gap) / count;

    activePins.forEach((pin, i) => {
        const sx = padding + i * (swatchW + gap);

        // Swatch block
        cx.fillStyle = `#${pin.hex}`;
        cx.beginPath();
        cx.roundRect(sx, swatchY, swatchW, swatchH - 36, 12);
        cx.fill();
        cx.strokeStyle = 'rgba(128,128,128,0.2)';
        cx.lineWidth = 1;
        cx.stroke();

        // Hex Code
        cx.fillStyle = isDark ? '#E6E1E5' : '#1C1B1F';
        cx.font = 'bold 15px "Roboto Mono", monospace';
        cx.textAlign = 'center';
        cx.fillText(`#${pin.hex}`, sx + swatchW / 2, swatchY + swatchH - 16);

        // Color Name
        const name = ColorUtils.getColorName(pin.hex);
        cx.fillStyle = isDark ? '#CAC4D0' : '#49454F';
        cx.font = '12px "Roboto", sans-serif';
        cx.fillText(name.length > 15 ? name.slice(0, 13) + '...' : name, sx + swatchW / 2, swatchY + swatchH + 2);
    });

    // Branding Footer
    const footerY = exportH - padding;
    cx.fillStyle = isDark ? '#938F99' : '#79747E';
    cx.font = '500 14px "Roboto", sans-serif';
    cx.textAlign = 'left';
    cx.fillText('Limorina Color Checker • Photo Palette Card', padding, footerY);

    cx.textAlign = 'right';
    const seed = activePins[0]?.hex || '624E9A';
    cx.fillText(`Seed: #${seed}`, exportW - padding, footerY);

    const link = document.createElement('a');
    link.download = `photo-palette-card-${Date.now()}.png`;
    link.href = c.toDataURL('image/png');
    link.click();
    showToast(translations[layoutState.currentLang]?.download_success || 'Card exported!');
}
