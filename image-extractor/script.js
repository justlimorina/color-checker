import { ColorUtils } from '../assets/script/utils.js';
import { translations } from '../assets/script/config.js';
import { initLayout, layoutState } from '../assets/script/shared/layout.js';

// Global references
let currentImage = null;
let activePins = []; // Array of { x, y, hex }
let activePinIndex = 0;
let numColors = 5;
let presets = []; // Array of 5 presets [Vibrant, Muted, Light, Dark, Balanced]
const presetKeys = ['palette_vibrant', 'palette_muted', 'palette_light', 'palette_dark', 'palette_balanced'];
const presetNames = ['Vibrant', 'Muted', 'Light', 'Dark', 'Balanced'];

// DOM references
let dropZone, fileInput, canvas, ctx, workspace, pinsOverlay, paletteContainer, slider, sliderLabelName, btnAddColor, btnRemoveColor, resetBtn, exportBtn;

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
            if (workspace) workspace.style.display = 'none';
            fileInput.value = '';
            currentImage = null;
            activePins = [];
            presets = [];
        };
    }

    if (slider) {
        slider.oninput = (e) => {
            const value = parseInt(e.target.value);
            updateSliderLabel(value);
            loadPreset(value);
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

            generatePresets(width, height);
            
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
        sliderLabelName.textContent = translations[layoutState.currentLang][key] || presetNames[value];
    }
}

function generatePresets(width, height) {
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
                x: Math.min(width - 1, Math.max(0, Math.floor(item.x + (Math.random() - 0.5) * 40))),
                y: Math.min(height - 1, Math.max(0, Math.floor(item.y + (Math.random() - 0.5) * 40))),
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
            document.querySelectorAll('.image-pin').forEach((p, idx) => {
                p.classList.toggle('active', idx === i);
            });
            document.querySelectorAll('.extracted-swatch').forEach((s, idx) => {
                s.classList.toggle('active', idx === i);
            });
            updateColorState(pin.hex, true);
        };

        paletteContainer.appendChild(swatch);
        swatches.push(swatch);
    });

    if (btnAddColor) btnAddColor.disabled = activePins.length >= 10;
    if (btnRemoveColor) btnRemoveColor.disabled = activePins.length <= 2;

    // 2. Render Pins
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

        // Dragging support
        let isDragging = false;
        
        const startDrag = (e) => {
            e.preventDefault();
            isDragging = true;
            activePinIndex = i;
            
            document.querySelectorAll('.image-pin').forEach((p, idx) => {
                p.classList.toggle('active', idx === i);
            });
            document.querySelectorAll('.extracted-swatch').forEach((s, idx) => {
                s.classList.toggle('active', idx === i);
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
                
                updateColorState(hex, true);
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
                updateColorState(pin.hex, false);
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
