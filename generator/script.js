import { ColorUtils } from '../assets/script/utils.js';
import { translations } from '../assets/script/config.js';
import { initLayout, layoutState, applyColorTheme } from '../assets/script/shared/layout.js';
import { ProjectManager } from '../assets/script/projects.js';

// --- Page Specific State ---
const state = {
    hex: "",
    rgb: { r: 0, g: 0, b: 0 },
    hsl: { h: 0, s: 0, l: 0 },
    cmyk: { c: 0, m: 0, y: 0, k: 0 },
    oklch: { l: 0, c: 0, h: 0 },
    oklab: { l: 0, a: 0, b: 0 },
    palette: JSON.parse(localStorage.getItem('saved_palette') || '[]'),
    history: JSON.parse(localStorage.getItem('color_history') || '[]'),
    activeHex: (() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlColor = urlParams.get('color');
        if (urlColor && /^[0-9A-F]{6}$/i.test(urlColor)) {
            return urlColor.toUpperCase();
        }
        return localStorage.getItem('active_hex') || "624E9A";
    })(),
    advancedPreviewActive: false,
    generatorColors: [],
    generatorLocks: [false, false, false, false, false],
    generatorRule: "complementary",
    MAX_PALETTE_SIZE: 10
};

// DOM references
const dom = {};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Layout
    initLayout('generator');

    // Bind DOM
    bindDOM();

    // Attach Event Listeners
    attachEvents();

    // Load Initial Color
    updateColorState(state.activeHex, true);

    // Initialize Smart Palette Generator tab if needed
    if (!state.generatorColors || state.generatorColors.length === 0) {
        state.generatorColors = generatePaletteColors(state.hex, state.generatorRule);
    }
    renderPaletteGenerator();
    renderHistory();
});

// Watch language changes from shared layout
window.addEventListener('langchange', () => {
    renderAll();
    renderPaletteGenerator();
});

function bindDOM() {
    Object.assign(dom, {
        hexInput: document.getElementById('hex-input'),
        eyedropperBtn: document.getElementById('eyedropper-btn'),
        colorPicker: document.getElementById('color-picker'),
        preview: document.getElementById('color-preview'),
        rgbOutput: document.getElementById('rgb-output'),
        hslOutput: document.getElementById('hsl-output'),
        cmykOutput: document.getElementById('cmyk-output'),
        oklchOutput: document.getElementById('oklch-output'),
        colorNameDisplay: document.getElementById('color-name-display'),
        tintsRow: document.getElementById('tints-row'),
        shadesRow: document.getElementById('shades-row'),
        tonesRow: document.getElementById('tones-row'),
        harmoniesContainer: document.getElementById('harmonies-container'),
        wcagWhiteRatio: document.getElementById('wcag-white-ratio'),
        wcagBlackRatio: document.getElementById('wcag-black-ratio'),
        wcagWhiteBadges: document.getElementById('wcag-white-badges'),
        wcagBlackBadges: document.getElementById('wcag-black-badges'),
        bestTextColor: document.getElementById('best-text-color'),
        paletteContainer: document.getElementById('palette-colors'),
        saveBtn: document.getElementById('save-to-palette'),
        exportImageBtn: document.getElementById('export-image-btn'),
        shareBtn: document.getElementById('share-link-btn'),
        cbSimulator: document.getElementById('cb-simulator'),
        toast: document.getElementById('toast'),
        advancedPreviewToggle: document.getElementById('advanced-preview-toggle'),
        uiSamplesCard: document.getElementById('ui-samples-card'),
        
        // Mixer Inputs
        mixerInputs: {
            r: document.getElementById('rgb-r'),
            g: document.getElementById('rgb-g'),
            b: document.getElementById('rgb-b'),
            h: document.getElementById('hsl-h'),
            s: document.getElementById('hsl-s'),
            l: document.getElementById('hsl-l'),
            oklch_l: document.getElementById('oklch-l'),
            oklch_c: document.getElementById('oklch-c'),
            oklch_h: document.getElementById('oklch-h'),
            lab_l: document.getElementById('lab-l'),
            lab_a: document.getElementById('lab-a'),
            lab_b: document.getElementById('lab-b')
        },

        // Smart Palette
        generatorRuleSelect: document.getElementById('generator-rule-select'),
        generatorGenerateBtn: document.getElementById('generator-generate-btn'),
        generatorSaveBtn: document.getElementById('generator-save-btn'),
        generatorSwatches: document.getElementById('generator-swatches'),

        // History
        historyContainer: document.getElementById('history-container'),
        clearHistoryBtn: document.getElementById('clear-history-btn'),

        // Project Manager DOM
        projectSelect: document.getElementById('project-select'),
        newProjBtn: document.getElementById('new-proj-btn'),
        renameProjBtn: document.getElementById('rename-proj-btn'),
        deleteProjBtn: document.getElementById('delete-proj-btn'),
        sharePaletteBtn: document.getElementById('share-palette-btn'),
        exportGplBtn: document.getElementById('export-gpl-btn'),
        exportJsonBtn: document.getElementById('export-json-btn'),
        importJsonTrigger: document.getElementById('import-json-trigger'),
        importJsonFile: document.getElementById('import-json-file'),
        quickPaletteContainer: document.getElementById('quick-palette-colors'),
        goToProjectsBtn: document.getElementById('go-to-projects-tab')
    });

    // Handle Eyedropper visibility
    if (dom.eyedropperBtn) {
        dom.eyedropperBtn.style.display = 'flex';
    }
}

function attachEvents() {
    // Tab switching logic
    document.querySelectorAll('.tab-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.getAttribute('data-tab');
            
            document.querySelectorAll('.tab-trigger').forEach(btn => btn.classList.remove('active'));
            trigger.classList.add('active');

            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.toggle('active', panel.id === targetId);
            });

            // Re-render Smart Palette if switching to it
            if (targetId === 'tab-smart') {
                renderPaletteGenerator();
            } else if (targetId === 'tab-history') {
                renderHistory();
            }
        });
    });

    // HEX Input
    dom.hexInput.addEventListener('input', (e) => {
        let val = e.target.value.replace('#', '');
        if (val.length === 3) {
            val = val.split('').map(c => c + c).join('');
        }
        if (/^[0-9A-F]{6}$/i.test(val)) {
            updateColorState(val);
        }
    });

    // Native Color Picker
    dom.colorPicker.addEventListener('input', (e) => {
        updateColorState(e.target.value.replace('#', ''));
    });

    // EyeDropper
    if (dom.eyedropperBtn) {
        dom.eyedropperBtn.addEventListener('click', async () => {
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
                    updateColorState(result.sRGBHex.replace('#', ''));
                }
            } catch (err) {
                if (err && err.name === 'AbortError') return;
                console.warn("EyeDropper failed:", err);
            }
        });
    }

    // Mixer Event Listeners (RGB, HSL, OKLCH, LAB)
    const attachMixer = (ids, callback) => {
        ids.forEach(id => {
            const el = dom.mixerInputs[id];
            if (el) {
                el.addEventListener('input', () => {
                    const values = ids.map(x => parseFloat(dom.mixerInputs[x].value || 0));
                    callback(values);
                });
            }
        });
    };

    attachMixer(['r', 'g', 'b'], ([r, g, b]) => {
        updateColorState(ColorUtils.rgbToHex(
            Math.max(0, Math.min(255, r)),
            Math.max(0, Math.min(255, g)),
            Math.max(0, Math.min(255, b))
        ));
    });

    attachMixer(['h', 's', 'l'], ([h, s, l]) => {
        const rgb = ColorUtils.hslToRgb(
            Math.max(0, Math.min(360, h)),
            Math.max(0, Math.min(100, s)),
            Math.max(0, Math.min(100, l))
        );
        updateColorState(ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b));
    });

    attachMixer(['oklch_l', 'oklch_c', 'oklch_h'], ([l, c, h]) => {
        const rgb = ColorUtils.oklchToRgb(
            Math.max(0, Math.min(100, l)) / 100,
            Math.max(0, Math.min(0.4, c)),
            Math.max(0, Math.min(360, h))
        );
        updateColorState(ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b));
    });

    attachMixer(['lab_l', 'lab_a', 'lab_b'], ([l, a, b]) => {
        const rgb = ColorUtils.oklabToRgb(
            Math.max(0, Math.min(100, l)) / 100,
            Math.max(-0.4, Math.min(0.4, a)),
            Math.max(-0.4, Math.min(0.4, b))
        );
        updateColorState(ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b));
    });

    // Save To Palette
    dom.saveBtn.addEventListener('click', saveToPalette);

    // Export Palette Image
    dom.exportImageBtn.addEventListener('click', exportPaletteImage);

    // Share Link (URL parse on load already handles ?color=)
    dom.shareBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(`${location.origin}${location.pathname}?color=${state.hex}`).then(showToast);
    });

    // Project Manager Event Listeners
    if (dom.projectSelect) {
        dom.projectSelect.addEventListener('change', (e) => {
            ProjectManager.setActiveProjectId(e.target.value);
            renderSavedPalette();
        });
    }

    if (dom.newProjBtn) {
        dom.newProjBtn.addEventListener('click', () => {
            const name = prompt(translations[layoutState.currentLang].new_project || 'New Project Name:', 'Project Palette');
            if (name !== null) {
                ProjectManager.createProject(name);
                renderSavedPalette();
            }
        });
    }

    if (dom.renameProjBtn) {
        dom.renameProjBtn.addEventListener('click', () => {
            const active = ProjectManager.getActiveProject();
            if (!active) return;
            const newName = prompt(translations[layoutState.currentLang].rename_project || 'Rename Project:', active.name);
            if (newName && newName.trim()) {
                ProjectManager.renameProject(active.id, newName);
                renderSavedPalette();
            }
        });
    }

    if (dom.deleteProjBtn) {
        dom.deleteProjBtn.addEventListener('click', () => {
            const active = ProjectManager.getActiveProject();
            if (!active) return;
            if (confirm(`Delete project "${active.name}"?`)) {
                if (!ProjectManager.deleteProject(active.id)) {
                    alert('Cannot delete the last remaining project.');
                } else {
                    renderSavedPalette();
                }
            }
        });
    }

    if (dom.sharePaletteBtn) {
        dom.sharePaletteBtn.addEventListener('click', () => {
            const active = ProjectManager.getActiveProject();
            if (!active || active.colors.length === 0) {
                alert(translations[layoutState.currentLang].no_colors_saved || 'No colors in palette.');
                return;
            }
            const url = ProjectManager.getSharedURL(active.colors);
            navigator.clipboard.writeText(url).then(showToast);
        });
    }

    if (dom.exportGplBtn) {
        dom.exportGplBtn.addEventListener('click', () => {
            ProjectManager.exportProjectGPL(ProjectManager.getActiveProjectId());
        });
    }

    if (dom.exportJsonBtn) {
        dom.exportJsonBtn.addEventListener('click', () => {
            ProjectManager.exportProjectsJSON();
        });
    }

    if (dom.importJsonTrigger && dom.importJsonFile) {
        dom.importJsonTrigger.addEventListener('click', () => dom.importJsonFile.click());
        dom.importJsonFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                const res = ProjectManager.importProjectsJSON(evt.target.result);
                if (res.success) {
                    showToast();
                    renderSavedPalette();
                } else {
                    alert('Import failed: ' + res.message);
                }
                dom.importJsonFile.value = '';
            };
            reader.readAsText(file);
        });
    }

    if (dom.goToProjectsBtn) {
        dom.goToProjectsBtn.addEventListener('click', () => {
            const trigger = document.querySelector('.tab-trigger[data-tab="tab-projects"]');
            if (trigger) trigger.click();
        });
    }

    window.addEventListener('projectschange', renderSavedPalette);

    // Advanced UI Preview switch
    if (dom.advancedPreviewToggle) {
        dom.advancedPreviewToggle.addEventListener('change', (e) => {
            state.advancedPreviewActive = Boolean(e.target.selected !== undefined ? e.target.selected : e.target.checked);
            updateUISamples();
        });
    }

    // Copy action buttons on HEX displays
    dom.preview.addEventListener('click', () => {
        navigator.clipboard.writeText(`#${state.hex}`).then(showToast);
    });

    // Copy event delegation for general code snippets
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const el = document.getElementById(targetId);
            if (el) {
                navigator.clipboard.writeText(el.textContent).then(showToast);
            }
        });
    });

    // Smart Palette Event Listeners
    dom.generatorRuleSelect.addEventListener('change', () => {
        state.generatorRule = dom.generatorRuleSelect.value;
        runPaletteGeneration();
    });

    dom.generatorGenerateBtn.addEventListener('click', runPaletteGeneration);
    dom.generatorSaveBtn.addEventListener('click', saveGeneratorPalette);

    // Clear History
    dom.clearHistoryBtn.addEventListener('click', () => {
        state.history = [];
        localStorage.setItem('color_history', JSON.stringify(state.history));
        renderHistory();
    });
}

// --- State and UI Updates ---
export function updateColorState(hex, skipHistory = false) {
    if (!/^[0-9A-F]{6}$/i.test(hex)) return;
    state.activeHex = hex.toUpperCase();
    state.hex = state.activeHex;
    state.rgb = ColorUtils.hexToRgb(state.hex);
    state.hsl = ColorUtils.rgbToHsl(state.rgb.r, state.rgb.g, state.rgb.b);
    state.cmyk = ColorUtils.rgbToCmyk(state.rgb.r, state.rgb.g, state.rgb.b);
    state.oklch = ColorUtils.rgbToOklch(state.rgb.r, state.rgb.g, state.rgb.b);
    state.oklab = ColorUtils.rgbToOklab(state.rgb.r, state.rgb.g, state.rgb.b);
    
    localStorage.setItem('active_hex', state.hex);
    window.history.replaceState(null, '', `?color=${state.hex}`);
    
    if (!skipHistory) {
        addToHistory(state.hex);
    }
    
    renderAll();
}

function renderAll() {
    if (!dom.preview) return;

    dom.preview.style.backgroundColor = `#${state.hex}`;
    dom.hexInput.value = state.hex;
    dom.colorPicker.value = `#${state.hex}`;
    dom.rgbOutput.textContent = `rgb(${state.rgb.r}, ${state.rgb.g}, ${state.rgb.b})`;
    dom.hslOutput.textContent = `${Math.round(state.hsl.h)}°, ${Math.round(state.hsl.s)}%, ${Math.round(state.hsl.l)}%`;
    dom.cmykOutput.textContent = `${state.cmyk.c}, ${state.cmyk.m}, ${state.cmyk.y}, ${state.cmyk.k}`;
    dom.oklchOutput.textContent = `oklch(${Math.round(state.oklch.l)}% ${state.oklch.c.toFixed(2)} ${Math.round(state.oklch.h)})`;

    // Fetch and display nearest name
    const colorName = ColorUtils.getColorName(state.hex);
    dom.colorNameDisplay.textContent = colorName;

    updateMixerInputs();
    updateDynamicTheme();
    updateUISamples();
    renderVariations();
    renderHarmonies();
    updateWCAG();
    updateBestText();
    renderSavedPalette();
    renderColorBlindness();
}

function updateMixerInputs() {
    dom.mixerInputs.r.value = state.rgb.r;
    dom.mixerInputs.g.value = state.rgb.g;
    dom.mixerInputs.b.value = state.rgb.b;
    dom.mixerInputs.h.value = Math.round(state.hsl.h);
    dom.mixerInputs.s.value = Math.round(state.hsl.s);
    dom.mixerInputs.l.value = Math.round(state.hsl.l);
    dom.mixerInputs.oklch_l.value = Math.round(state.oklch.l);
    dom.mixerInputs.oklch_c.value = state.oklch.c.toFixed(2);
    dom.mixerInputs.oklch_h.value = Math.round(state.oklch.h);
    dom.mixerInputs.lab_l.value = Math.round(state.oklab.l);
    dom.mixerInputs.lab_a.value = state.oklab.a.toFixed(2);
    dom.mixerInputs.lab_b.value = state.oklab.b.toFixed(2);
}

function updateDynamicTheme() {
    applyColorTheme(state.hex);
}

function updateUISamples() {
    if (dom.advancedPreviewToggle) {
        if ('selected' in dom.advancedPreviewToggle) {
            dom.advancedPreviewToggle.selected = Boolean(state.advancedPreviewActive);
        } else if ('checked' in dom.advancedPreviewToggle) {
            dom.advancedPreviewToggle.checked = Boolean(state.advancedPreviewActive);
        }
    }

    const rgb = state.rgb || ColorUtils.hexToRgb(state.hex || '624E9A');
    const isLight = ColorUtils.getLuminance(rgb.r, rgb.g, rgb.b) > 0.5;

    const container = dom.uiSamplesCard;

    if (state.advancedPreviewActive) {
        // Advanced M3 Design Tokens System
        if (container) {
            container.style.backgroundColor = 'var(--md-sys-color-surface-container-low)';
            container.style.borderColor = 'var(--md-sys-color-outline-variant)';
        }
        document.querySelectorAll('.sample-btn-primary').forEach(el => {
            el.style.backgroundColor = 'var(--md-sys-color-primary)';
            el.style.color = 'var(--md-sys-color-on-primary)';
            el.style.borderColor = 'transparent';
        });
        document.querySelectorAll('.sample-btn-tonal').forEach(el => {
            el.style.backgroundColor = 'var(--md-sys-color-primary-container)';
            el.style.color = 'var(--md-sys-color-on-primary-container)';
            el.style.borderColor = 'transparent';
        });
        document.querySelectorAll('.sample-btn-outline').forEach(el => {
            el.style.borderColor = 'var(--md-sys-color-outline)';
            el.style.color = 'var(--md-sys-color-primary)';
            el.style.backgroundColor = 'transparent';
        });
        document.querySelectorAll('.sample-card').forEach(el => {
            el.style.backgroundColor = 'var(--md-sys-color-secondary-container)';
            el.style.color = 'var(--md-sys-color-on-secondary-container)';
            el.style.borderColor = 'var(--md-sys-color-outline-variant)';
        });
        document.querySelectorAll('.sample-dot').forEach(el => {
            el.style.backgroundColor = 'var(--md-sys-color-primary)';
        });
        document.querySelectorAll('.sample-text').forEach(el => {
            el.style.color = 'var(--md-sys-color-primary)';
        });
        document.querySelectorAll('.sample-subtext').forEach(el => {
            el.style.color = 'var(--md-sys-color-on-surface-variant)';
        });
    } else {
        // Direct Input Color Mode
        if (container) {
            container.style.backgroundColor = '';
            container.style.borderColor = '';
        }
        const tonalBg = `#${ColorUtils.mixColors(rgb, isLight ? {r:0,g:0,b:0} : {r:255,g:255,b:255}, 15)}`;
        const cardBg = `#${ColorUtils.mixColors(rgb, isLight ? {r:255,g:255,b:255} : {r:0,g:0,b:0}, 90)}`;

        document.querySelectorAll('.sample-btn-primary').forEach(el => {
            el.style.backgroundColor = `#${state.hex}`;
            el.style.color = isLight ? '#000000' : '#FFFFFF';
            el.style.borderColor = 'transparent';
        });
        document.querySelectorAll('.sample-btn-tonal').forEach(el => {
            el.style.backgroundColor = tonalBg;
            el.style.color = `#${state.hex}`;
            el.style.borderColor = 'transparent';
        });
        document.querySelectorAll('.sample-btn-outline').forEach(el => {
            el.style.borderColor = `#${state.hex}`;
            el.style.color = `#${state.hex}`;
            el.style.backgroundColor = 'transparent';
        });
        document.querySelectorAll('.sample-card').forEach(el => {
            el.style.backgroundColor = cardBg;
            el.style.color = `#${state.hex}`;
            el.style.borderColor = `#${state.hex}40`;
        });
        document.querySelectorAll('.sample-dot').forEach(el => el.style.backgroundColor = `#${state.hex}`);
        document.querySelectorAll('.sample-text').forEach(el => el.style.color = `#${state.hex}`);
        document.querySelectorAll('.sample-subtext').forEach(el => el.style.color = 'var(--md-sys-color-on-surface-variant)');
    }
}

function renderColorBlindness() {
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
        const label = translations[layoutState.currentLang][t.key] || t.key;

        const item = document.createElement('div');
        item.className = 'cb-item';
        item.innerHTML = `
            <div class="cb-preview" style="background-color: #${hex}"></div>
            <span class="label-tiny">${label}</span>
        `;
        dom.cbSimulator.appendChild(item);
    });
}

function updateBestText() {
    const whiteRatio = ColorUtils.getContrastRatio(state.rgb, { r: 255, g: 255, b: 255 });
    const blackRatio = ColorUtils.getContrastRatio(state.rgb, { r: 0, g: 0, b: 0 });
    
    const best = whiteRatio > blackRatio ? 'white' : 'black';
    dom.bestTextColor.style.backgroundColor = best === 'white' ? '#FFFFFF' : '#000000';
    dom.bestTextColor.style.color = `#${state.hex}`;
    dom.bestTextColor.textContent = `${best === 'white' ? 'White' : 'Black'} (${Math.max(whiteRatio, blackRatio).toFixed(1)}:1)`;
}

function renderSavedPalette() {
    if (!dom.paletteContainer) return;
    
    // Update Project Dropdown
    if (dom.projectSelect) {
        const projects = ProjectManager.getProjects();
        const activeId = ProjectManager.getActiveProjectId();
        dom.projectSelect.innerHTML = '';
        projects.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (${p.colors.length})`;
            if (p.id === activeId) opt.selected = true;
            dom.projectSelect.appendChild(opt);
        });
    }

    const activeProject = ProjectManager.getActiveProject();
    const colors = activeProject ? activeProject.colors : [];
    state.palette = colors;

    const createPaletteItem = (hex, index) => {
        const item = document.createElement('div');
        item.className = 'palette-item';
        item.style.backgroundColor = `#${hex}`;
        item.title = `#${hex}`;
        item.onclick = (e) => {
            if (e.target.classList.contains('remove-btn')) return;
            updateColorState(hex);
        };

        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-btn material-symbols-rounded';
        removeBtn.textContent = 'close';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            removeFromPalette(index);
        };

        item.appendChild(removeBtn);
        return item;
    };

    if (dom.paletteContainer) {
        dom.paletteContainer.innerHTML = '';
        colors.forEach((hex, index) => {
            dom.paletteContainer.appendChild(createPaletteItem(hex, index));
        });
    }

    if (dom.quickPaletteContainer) {
        dom.quickPaletteContainer.innerHTML = '';
        colors.forEach((hex, index) => {
            dom.quickPaletteContainer.appendChild(createPaletteItem(hex, index));
        });
    }
}

function saveToPalette() {
    if (ProjectManager.addColorToActiveProject(state.hex)) {
        renderSavedPalette();
        showToast();
    } else {
        showToast();
    }
}

function removeFromPalette(index) {
    ProjectManager.removeColorFromActiveProject(index);
    renderSavedPalette();
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

    // APCA scores
    const apcaWhite = ColorUtils.getAPCAContrast(state.rgb, white);
    const apcaBlack = ColorUtils.getAPCAContrast(state.rgb, black);

    const apcaWhiteEl = document.getElementById('apca-white-ratio');
    const apcaBlackEl = document.getElementById('apca-black-ratio');
    const apcaWhiteBadgeEl = document.getElementById('apca-white-badge');
    const apcaBlackBadgeEl = document.getElementById('apca-black-badge');

    if (apcaWhiteEl) apcaWhiteEl.textContent = `Lc ${Math.round(apcaWhite)}`;
    if (apcaBlackEl) apcaBlackEl.textContent = `Lc ${Math.round(apcaBlack)}`;

    updateAPCABadge(apcaWhiteBadgeEl, apcaWhite);
    updateAPCABadge(apcaBlackBadgeEl, apcaBlack);
}

function updateAPCABadge(badgeEl, score) {
    if (!badgeEl) return;
    const absScore = Math.abs(score);
    badgeEl.className = 'badge';
    if (absScore >= 75) {
        badgeEl.classList.add('badge-pass');
        badgeEl.textContent = 'Lc 75+ (Body)';
    } else if (absScore >= 60) {
        badgeEl.classList.add('badge-pass');
        badgeEl.textContent = 'Lc 60+ (Large)';
        badgeEl.style.backgroundColor = 'var(--md-sys-color-primary)';
        badgeEl.style.color = 'var(--md-sys-color-on-primary)';
    } else if (absScore >= 45) {
        badgeEl.classList.add('badge-pass');
        badgeEl.textContent = 'Lc 45+ (Heading)';
        badgeEl.style.backgroundColor = 'var(--md-sys-color-secondary)';
        badgeEl.style.color = 'var(--md-sys-color-on-secondary)';
    } else {
        badgeEl.classList.add('badge-fail');
        badgeEl.textContent = `Lc ${Math.round(score)} (Fail)`;
    }
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
        if (!row) return;
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
    if (!dom.harmoniesContainer) return;
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
        const label = translations[layoutState.currentLang][type.name] || type.name;
        group.innerHTML = `<div class="harmony-header"><span class="label-large">${label}</span></div>`;

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



function exportPaletteImage() {
    const canvas = document.createElement('canvas');
    const colors = state.palette.length > 0 ? state.palette : [state.hex];
    const colorCount = colors.length;
    const stripWidth = Math.max(150, 600 / colorCount);
    canvas.width = stripWidth * colorCount;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    colors.forEach((hex, i) => {
        ctx.fillStyle = `#${hex}`;
        ctx.fillRect(i * stripWidth, 0, stripWidth, 230);
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 20px "Roboto Slab", serif';
        ctx.textAlign = 'center';
        ctx.fillText(`#${hex}`, i * stripWidth + stripWidth / 2, 270);
    });

    const link = document.createElement('a');
    link.download = `palette-export.png`;
    link.href = canvas.toDataURL();
    link.click();
}

function showToast() {
    if (!dom.toast) return;
    dom.toast.textContent = translations[layoutState.currentLang].copied || 'Copied!';
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2000);
}

// --- History Feature Functions ---
function addToHistory(hex) {
    if (!/^[0-9A-F]{6}$/i.test(hex)) return;
    hex = hex.toUpperCase();
    if (state.history.length > 0 && state.history[0] === hex) return;

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

function renderHistory() {
    if (!dom.historyContainer) return;
    dom.historyContainer.innerHTML = '';
    
    state.history.forEach((hex) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.style.backgroundColor = `#${hex}`;
        item.title = `#${hex}`;
        item.onclick = () => {
            updateColorState(hex);
            // Switch back to single checker tab
            const firstTabTrigger = document.querySelector('.tab-trigger[data-tab="tab-single"]');
            if (firstTabTrigger) firstTabTrigger.click();
        };

        const label = document.createElement('div');
        label.className = 'history-hex-label';
        label.textContent = `#${hex}`;
        item.appendChild(label);

        dom.historyContainer.appendChild(item);
    });
}

// --- Smart Palette Generator Functions ---
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

function renderPaletteGenerator() {
    if (!dom.generatorSwatches) return;
    dom.generatorSwatches.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const hex = state.generatorColors[i] || 'FFFFFF';
        const isLocked = state.generatorLocks[i];
        
        const swatch = document.createElement('div');
        swatch.className = 'generator-swatch';
        
        // Swatch Preview
        const preview = document.createElement('div');
        preview.className = 'generator-swatch-preview';
        preview.style.backgroundColor = `#${hex}`;
        
        // Lock button
        const lockBtn = document.createElement('button');
        lockBtn.className = `lock-badge ${isLocked ? 'locked' : ''}`;
        lockBtn.innerHTML = `<span class="material-symbols-rounded">${isLocked ? 'lock' : 'lock_open'}</span>`;
        lockBtn.title = isLocked ? 'Locked (Click to unlock)' : 'Unlocked (Click to lock)';
        lockBtn.onclick = (e) => {
            e.stopPropagation();
            state.generatorLocks[i] = !state.generatorLocks[i];
            renderPaletteGenerator();
        };
        preview.appendChild(lockBtn);
        
        // Clicking preview sets as active color
        preview.onclick = () => {
            updateColorState(hex);
            showToast();
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
        
        dom.generatorSwatches.appendChild(swatch);
    }
}

function runPaletteGeneration() {
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

function saveGeneratorPalette() {
    state.generatorColors.forEach(hex => {
        if (!state.palette.includes(hex)) {
            state.palette.push(hex);
        }
    });
    if (state.palette.length > state.MAX_PALETTE_SIZE) {
        state.palette = state.palette.slice(-state.MAX_PALETTE_SIZE);
    }
    localStorage.setItem('saved_palette', JSON.stringify(state.palette));
    renderSavedPalette();
    showToast();
}
