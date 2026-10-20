
const MOOD_PALETTES = {
    cyberpunk: ['F72585', '7209B7', '3A0CA3', '4361EE', '4CC9F0'],
    nordic: ['264653', '2A9D8F', 'E9C46A', 'F4A261', 'E76F51'],
    autumn: ['6F1D1B', 'BB9457', '43281C', '99582A', 'FFE6A7'],
    matcha: ['386641', '6A994E', 'A7C957', 'F2E8CF', 'BC4749'],
    saas: ['0F172A', '2563EB', '38BDF8', 'F8FAFC', '64748B'],
    sunset: ['FFAAA6', 'FF8B94', 'FFD3B6', 'DCEDC1', 'A8E6CF'],
    retro: ['FF007F', '7928CA', '00F5D4', 'FEE440', '00BBF9'],
    oled: ['000000', '1A1A2E', '16213E', '0F3460', 'E94560']
};

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
    originalRgb: null,
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
    renderColorScaleBlender();

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

        // OKLCH Interactive Sliders
        oklchSliders: {
            l: document.getElementById('oklch-l-slider'),
            c: document.getElementById('oklch-c-slider'),
            h: document.getElementById('oklch-h-slider')
        },
        oklchValLabels: {
            l: document.getElementById('oklch-l-val'),
            c: document.getElementById('oklch-c-val'),
            h: document.getElementById('oklch-h-val')
        },
        oklchGamutBadge: document.getElementById('oklch-gamut-badge'),
        oklchDeltaEVal: document.getElementById('oklch-delta-e-val'),

        // Smart Palette
        generatorRuleSelect: document.getElementById('generator-rule-select'),
        generatorGenerateBtn: document.getElementById('generator-generate-btn'),
        generatorSaveBtn: document.getElementById('generator-save-btn'),
        exportShowcaseBtn: document.getElementById('export-showcase-btn'),
        generatorShowcaseBtn: document.getElementById('generator-showcase-btn'),
        openUiSandboxBtn: document.getElementById('open-ui-sandbox-btn'),
        closeUiSandboxBtn: document.getElementById('close-ui-sandbox-btn'),
        uiSandboxModal: document.getElementById('ui-sandbox-modal'),
        sandboxViewport: document.getElementById('sandbox-viewport'),
        sandboxViewToggle: document.getElementById('sandbox-view-toggle'),
        sandboxCbSelect: document.getElementById('sandbox-cb-select'),
        sandboxThemeToggle: document.getElementById('sandbox-theme-toggle'),
        sandboxThemeIcon: document.getElementById('sandbox-theme-icon'),
        blendColor1Hex: document.getElementById('blend-color-1-hex'),
        blendColor1Picker: document.getElementById('blend-color-1-picker'),
        blendColor2Hex: document.getElementById('blend-color-2-hex'),
        blendColor2Picker: document.getElementById('blend-color-2-picker'),
        blendStepsSlider: document.getElementById('blend-steps-slider'),
        blendStepsLabel: document.getElementById('blend-steps-label'),
        blendStepsContainer: document.getElementById('blend-steps-container'),
        saveBlendBtn: document.getElementById('save-blend-to-project'),
        copyBlendBtn: document.getElementById('copy-blend-steps'),
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
            Math.max(0, Math.min(100, l)),
            Math.max(0, Math.min(0.4, c)),
            Math.max(0, Math.min(360, h))
        );
        updateColorState(ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b), true);
    });

    // OKLCH Range Sliders Event Listeners
    if (dom.oklchSliders) {
        ['l', 'c', 'h'].forEach(key => {
            const slider = dom.oklchSliders[key];
            if (slider) {
                slider.addEventListener('input', () => {
                    const l = parseFloat(dom.oklchSliders.l.value || 0);
                    const c = parseFloat(dom.oklchSliders.c.value || 0);
                    const h = parseFloat(dom.oklchSliders.h.value || 0);
                    const rgb = ColorUtils.oklchToRgb(l, c, h);
                    updateColorState(ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b), true);
                });
            }
        });
    }

    attachMixer(['lab_l', 'lab_a', 'lab_b'], ([l, a, b]) => {
        const rgb = ColorUtils.oklabToRgb(
            Math.max(0, Math.min(100, l)),
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

    // Export Tokens Modal Logic
    const exportTokensBtn = document.getElementById('export-tokens-btn');
    const tokensModal = document.getElementById('project-tokens-modal');
    const closeTokensBtn = document.getElementById('close-tokens-modal-btn');
    const tokensCodePreview = document.getElementById('tokens-code-preview');
    const copyTokensBtn = document.getElementById('copy-tokens-code-btn');
    const downloadTokensBtn = document.getElementById('download-tokens-code-btn');
    const tokenTabBtns = document.querySelectorAll('.token-tab-btn');

    let currentTokenFormat = 'dtcg';

    const renderTokensCode = () => {
        const active = ProjectManager.getActiveProject();
        if (!active || active.colors.length === 0) {
            if (tokensCodePreview) tokensCodePreview.textContent = '// No colors saved in active project.';
            return;
        }
        const code = ProjectManager.exportProjectTokens(active.id, currentTokenFormat);
        if (tokensCodePreview) tokensCodePreview.textContent = code;
    };

    window.addEventListener('themechange', () => {
        if (tokensModal && tokensModal.style.display !== 'none') {
            renderTokensCode();
        }
    });

    if (exportTokensBtn && tokensModal) {
        exportTokensBtn.addEventListener('click', () => {
            tokensModal.style.display = 'flex';
            renderTokensCode();
        });
    }

    if (closeTokensBtn && tokensModal) {
        closeTokensBtn.addEventListener('click', () => tokensModal.style.display = 'none');
        tokensModal.addEventListener('click', (e) => {
            if (e.target === tokensModal) tokensModal.style.display = 'none';
        });
    }

    tokenTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tokenTabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.border = '1px solid var(--md-sys-color-outline)';
                b.style.background = 'transparent';
                b.style.color = 'var(--md-sys-color-on-surface)';
                b.style.fontWeight = '500';
            });
            btn.classList.add('active');
            btn.style.border = '1px solid var(--md-sys-color-primary)';
            btn.style.background = 'var(--md-sys-color-primary-container)';
            btn.style.color = 'var(--md-sys-color-on-primary-container)';
            btn.style.fontWeight = '700';

            currentTokenFormat = btn.dataset.format;
            renderTokensCode();
        });
    });

    if (copyTokensBtn && tokensCodePreview) {
        copyTokensBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(tokensCodePreview.textContent).then(showToast);
        });
    }

    if (downloadTokensBtn && tokensCodePreview) {
        downloadTokensBtn.addEventListener('click', () => {
            const active = ProjectManager.getActiveProject();
            const projName = (active ? active.name : 'tokens').toLowerCase().replace(/\s+/g, '-');
            const extMap = { dtcg: 'json', css: 'css', scss: 'scss', tailwind: 'css' };
            const ext = extMap[currentTokenFormat] || 'txt';
            const blob = new Blob([tokensCodePreview.textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${projName}-tokens.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
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

    // Bulk Import Logic
    const bulkTrigger = document.getElementById('bulk-import-trigger');
    const bulkModal = document.getElementById('bulk-import-modal');
    const closeBulkBtn = document.getElementById('close-bulk-modal-btn');
    const confirmBulkBtn = document.getElementById('confirm-bulk-import-btn');
    const bulkTextarea = document.getElementById('bulk-import-textarea');

    if (bulkTrigger && bulkModal) {
        bulkTrigger.addEventListener('click', () => {
            bulkModal.style.display = 'flex';
            if (bulkTextarea) bulkTextarea.focus();
        });
    }

    if (closeBulkBtn && bulkModal) {
        closeBulkBtn.addEventListener('click', () => {
            bulkModal.style.display = 'none';
        });
        bulkModal.addEventListener('click', (e) => {
            if (e.target === bulkModal) bulkModal.style.display = 'none';
        });
    }

    if (confirmBulkBtn && bulkTextarea) {
        confirmBulkBtn.addEventListener('click', () => {
            const text = bulkTextarea.value;
            const count = ProjectManager.importBulkColors(text);
            if (count > 0) {
                showToast(`Imported ${count} color${count === 1 ? '' : 's'}!`);
                renderSavedPalette();
                bulkTextarea.value = '';
                if (bulkModal) bulkModal.style.display = 'none';
            } else {
                showToast('No valid HEX colors found');
            }
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

    // Export Showcase Cards
    if (dom.exportShowcaseBtn) {
        dom.exportShowcaseBtn.addEventListener('click', () => {
            const colors = [state.hex];
            const harm = ColorUtils.hslToRgb;
            // Generate full harmony set for showcase
            const rgb = ColorUtils.hexToRgb(state.hex);
            const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const compHsl = { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l };
            const compRgb = ColorUtils.hslToRgb(compHsl.h, compHsl.s, compHsl.l);
            colors.push(ColorUtils.rgbToHex(compRgb.r, compRgb.g, compRgb.b));
            const analogous1 = ColorUtils.hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l);
            colors.push(ColorUtils.rgbToHex(analogous1.r, analogous1.g, analogous1.b));
            const analogous2 = ColorUtils.hslToRgb((hsl.h + 330) % 360, hsl.s, hsl.l);
            colors.push(ColorUtils.rgbToHex(analogous2.r, analogous2.g, analogous2.b));
            const triadic = ColorUtils.hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l);
            colors.push(ColorUtils.rgbToHex(triadic.r, triadic.g, triadic.b));
            exportShowcaseCard(colors, `#${state.hex} Harmony Showcase`);
        });
    }

    if (dom.generatorShowcaseBtn) {
        dom.generatorShowcaseBtn.addEventListener('click', () => {
            if (state.generatorColors && state.generatorColors.length > 0) {
                exportShowcaseCard(state.generatorColors, 'Smart Palette Showcase');
            }
        });
    }

    // Mood Presets Chips
    document.querySelectorAll('.mood-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const mood = chip.getAttribute('data-mood');
            if (MOOD_PALETTES[mood]) {
                state.generatorColors = [...MOOD_PALETTES[mood]];
                state.generatorLocks = [false, false, false, false, false];
                renderSmartPalette();
                showToast(`Loaded ${chip.textContent.trim()} palette`);
            }
        });
    });

    // Color Scale Blender events
    const onBlendChange = () => {
        let hex1 = dom.blendColor1Hex.value.replace('#', '').toUpperCase();
        let hex2 = dom.blendColor2Hex.value.replace('#', '').toUpperCase();
        if (/^[0-9A-F]{6}$/i.test(hex1) && /^[0-9A-F]{6}$/i.test(hex2)) {
            renderColorScaleBlender();
        }
    };

    if (dom.blendColor1Picker) {
        dom.blendColor1Picker.addEventListener('input', (e) => {
            dom.blendColor1Hex.value = e.target.value.replace('#', '').toUpperCase();
            onBlendChange();
        });
    }
    if (dom.blendColor1Hex) {
        dom.blendColor1Hex.addEventListener('input', (e) => {
            let val = e.target.value.replace('#', '');
            if (/^[0-9A-F]{6}$/i.test(val)) {
                dom.blendColor1Picker.value = `#${val}`;
                onBlendChange();
            }
        });
    }
    if (dom.blendColor2Picker) {
        dom.blendColor2Picker.addEventListener('input', (e) => {
            dom.blendColor2Hex.value = e.target.value.replace('#', '').toUpperCase();
            onBlendChange();
        });
    }
    if (dom.blendColor2Hex) {
        dom.blendColor2Hex.addEventListener('input', (e) => {
            let val = e.target.value.replace('#', '');
            if (/^[0-9A-F]{6}$/i.test(val)) {
                dom.blendColor2Picker.value = `#${val}`;
                onBlendChange();
            }
        });
    }
    if (dom.blendStepsSlider) {
        dom.blendStepsSlider.addEventListener('input', (e) => {
            if (dom.blendStepsLabel) dom.blendStepsLabel.textContent = `${e.target.value} steps`;
            renderColorScaleBlender();
        });
    }

    if (dom.saveBlendBtn) {
        dom.saveBlendBtn.addEventListener('click', () => {
            const steps = getCurrentBlendSteps();
            let count = 0;
            steps.forEach(h => {
                if (ProjectManager.addColorToActiveProject(h)) count++;
            });
            showToast(`Saved ${count} blend steps to project!`);
        });
    }

    if (dom.copyBlendBtn) {
        dom.copyBlendBtn.addEventListener('click', () => {
            const steps = getCurrentBlendSteps();
            navigator.clipboard.writeText(steps.map(h => `#${h}`).join(', ')).then(() => {
                showToast('Copied blend steps!');
            });
        });
    }

    // Live UI Sandbox Modal events
    let currentSandboxView = 'saas';
    let sandboxThemeMode = layoutState.theme || 'light';

    if (dom.openUiSandboxBtn && dom.uiSandboxModal) {
        dom.openUiSandboxBtn.addEventListener('click', () => {
            dom.uiSandboxModal.style.display = 'flex';
            renderSandboxView(currentSandboxView, sandboxThemeMode);
        });
    }

    if (dom.closeUiSandboxBtn && dom.uiSandboxModal) {
        dom.closeUiSandboxBtn.addEventListener('click', () => {
            dom.uiSandboxModal.style.display = 'none';
        });
    }

    if (dom.sandboxViewToggle) {
        dom.sandboxViewToggle.querySelectorAll('.segment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                dom.sandboxViewToggle.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSandboxView = btn.getAttribute('data-view') || 'saas';
                renderSandboxView(currentSandboxView, sandboxThemeMode);
            });
        });
    }

    if (dom.sandboxCbSelect && dom.sandboxViewport) {
        dom.sandboxCbSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'none') {
                dom.sandboxViewport.style.filter = 'none';
            } else {
                dom.sandboxViewport.style.filter = `url(#cb-filter-${val})`;
            }
        });
    }

    if (dom.sandboxThemeToggle) {
        dom.sandboxThemeToggle.addEventListener('click', () => {
            sandboxThemeMode = sandboxThemeMode === 'dark' ? 'light' : 'dark';
            if (dom.sandboxThemeIcon) {
                dom.sandboxThemeIcon.textContent = sandboxThemeMode === 'dark' ? 'light_mode' : 'dark_mode';
            }
            renderSandboxView(currentSandboxView, sandboxThemeMode);
        });
    }

    // Keyboard shortcut C to copy active color
    window.addEventListener('keydown', (e) => {
        if (e.key === 'c' || e.key === 'C') {
            const activeTag = document.activeElement ? document.activeElement.tagName : '';
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            navigator.clipboard.writeText(`#${state.hex}`).then(() => {
                showToast(`Copied #${state.hex}`);
            });
        }
    });


    // Clear History
    dom.clearHistoryBtn.addEventListener('click', () => {
        state.history = [];
        localStorage.setItem('color_history', JSON.stringify(state.history));
        renderHistory();
    });

    // Spacebar shortcut for Smart Palette generator
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            const activeTag = document.activeElement ? document.activeElement.tagName : '';
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
                return;
            }
            const smartTab = document.getElementById('tab-smart');
            if (smartTab && smartTab.classList.contains('active')) {
                e.preventDefault();
                runPaletteGeneration();
            }
        }
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
    
    if (!skipHistory || !state.originalRgb) {
        state.originalRgb = { ...state.rgb };
    }

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

    updateOklchCardStatus();
}

function updateOklchCardStatus() {
    if (!dom.oklchSliders || !dom.oklchSliders.l) return;
    
    // Sync slider values
    dom.oklchSliders.l.value = state.oklch.l;
    dom.oklchSliders.c.value = state.oklch.c;
    dom.oklchSliders.h.value = state.oklch.h;

    // Sync labels
    if (dom.oklchValLabels.l) dom.oklchValLabels.l.textContent = `${Math.round(state.oklch.l)}%`;
    if (dom.oklchValLabels.c) dom.oklchValLabels.c.textContent = state.oklch.c.toFixed(2);
    if (dom.oklchValLabels.h) dom.oklchValLabels.h.textContent = `${Math.round(state.oklch.h)}°`;

    // sRGB Gamut check
    const inGamut = ColorUtils.isOklchInSRGB(state.oklch.l, state.oklch.c, state.oklch.h);
    if (dom.oklchGamutBadge) {
        dom.oklchGamutBadge.className = `badge ${inGamut ? 'badge-pass' : 'badge-fail'}`;
        const key = inGamut ? 'srgb_in_gamut' : 'srgb_out_gamut';
        const currentLang = (typeof layoutState !== 'undefined' && layoutState.currentLang) || 'en';
        dom.oklchGamutBadge.textContent = (translations[currentLang] && translations[currentLang][key]) || (inGamut ? 'sRGB In-Gamut' : 'Out of sRGB Gamut (Clamped)');
    }

    // Delta E Readout
    if (dom.oklchDeltaEVal) {
        if (!state.originalRgb) {
            state.originalRgb = { ...state.rgb };
        }
        const deltaE = ColorUtils.getDeltaEOK(state.originalRgb, state.rgb);
        let qual = 'Identical';
        if (deltaE > 5) qual = 'Distinct';
        else if (deltaE > 2) qual = 'Noticeable';
        else if (deltaE > 0.5) qual = 'Slight';

        dom.oklchDeltaEVal.textContent = `${deltaE.toFixed(2)} (${qual})`;
    }

    // Update Track Gradients
    updateOklchSliderTracks();
}

function updateOklchSliderTracks() {
    const l = state.oklch.l;
    const c = state.oklch.c;
    const h = state.oklch.h;

    // Lightness slider track gradient: L=0 to L=100
    const rgbL0 = ColorUtils.oklchToRgb(0, c, h);
    const rgbL50 = ColorUtils.oklchToRgb(50, c, h);
    const rgbL100 = ColorUtils.oklchToRgb(100, c, h);
    const lTrack = `linear-gradient(to right, rgb(${rgbL0.r},${rgbL0.g},${rgbL0.b}), rgb(${rgbL50.r},${rgbL50.g},${rgbL50.b}), rgb(${rgbL100.r},${rgbL100.g},${rgbL100.b}))`;
    if (dom.oklchSliders.l) dom.oklchSliders.l.style.setProperty('--l-track-bg', lTrack);

    // Chroma slider track gradient: C=0 to C=0.35
    const rgbC0 = ColorUtils.oklchToRgb(l, 0, h);
    const rgbC15 = ColorUtils.oklchToRgb(l, 0.15, h);
    const rgbC35 = ColorUtils.oklchToRgb(l, 0.35, h);
    const cTrack = `linear-gradient(to right, rgb(${rgbC0.r},${rgbC0.g},${rgbC0.b}), rgb(${rgbC15.r},${rgbC15.g},${rgbC15.b}), rgb(${rgbC35.r},${rgbC35.g},${rgbC35.b}))`;
    if (dom.oklchSliders.c) dom.oklchSliders.c.style.setProperty('--c-track-bg', cTrack);

    // Hue slider track rainbow gradient: H=0 to 360
    const rainbowStops = [0, 60, 120, 180, 240, 300, 360].map(hue => {
        const rgb = ColorUtils.oklchToRgb(l, Math.min(c, 0.2), hue);
        return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    }).join(', ');
    const hTrack = `linear-gradient(to right, ${rainbowStops})`;
    if (dom.oklchSliders.h) dom.oklchSliders.h.style.setProperty('--h-track-bg', hTrack);
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
    const selectHint = translations[layoutState.currentLang]?.click_to_select || 'Click to select';

    const genRow = (row, targetColor) => {
        if (!row) return;
        row.innerHTML = '';
        weights.forEach(w => {
            const mixed = ColorUtils.mixColors(state.rgb, targetColor, w);
            const mixedHex = ColorUtils.rgbToHex(mixed.r, mixed.g, mixed.b);
            const box = document.createElement('div');
            box.className = 'variant-box';
            box.style.backgroundColor = `#${mixedHex}`;
            box.style.cursor = 'pointer';
            box.innerHTML = `<span class="label-tiny" style="color: ${ColorUtils.getLuminance(mixed.r, mixed.g, mixed.b) > 0.5 ? 'black' : 'white'}">${w}%</span>`;
            box.title = `#${mixedHex} (${selectHint})`;
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
    box.style.cursor = 'pointer';
    const selectHint = translations[layoutState.currentLang]?.click_to_select || 'Click to select';
    box.title = `#${hex} (${selectHint})`;
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

// --- Color Scale Blender Helpers ---
function getCurrentBlendSteps() {
    const hex1 = dom.blendColor1Hex ? dom.blendColor1Hex.value.replace('#', '').toUpperCase() : '624E9A';
    const hex2 = dom.blendColor2Hex ? dom.blendColor2Hex.value.replace('#', '').toUpperCase() : 'FF5722';
    const stepsCount = dom.blendStepsSlider ? parseInt(dom.blendStepsSlider.value, 10) : 5;
    return ColorUtils.interpolateOklch(hex1, hex2, stepsCount);
}

function renderColorScaleBlender() {
    if (!dom.blendStepsContainer) return;
    const steps = getCurrentBlendSteps();
    dom.blendStepsContainer.innerHTML = '';

    steps.forEach((hex, i) => {
        const item = document.createElement('div');
        item.style.backgroundColor = `#${hex}`;
        item.style.height = '64px';
        item.style.borderRadius = '12px';
        item.style.display = 'flex';
        item.style.alignItems = 'flex-end';
        item.style.justifyContent = 'center';
        item.style.padding = '6px';
        item.style.cursor = 'pointer';
        item.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
        item.title = `#${hex} (Click to set as active)`;

        const rgb = ColorUtils.hexToRgb(hex);
        const whiteRatio = ColorUtils.getContrastRatio(rgb, { r: 255, g: 255, b: 255 });
        const blackRatio = ColorUtils.getContrastRatio(rgb, { r: 0, g: 0, b: 0 });
        const textColor = whiteRatio > blackRatio ? '#FFFFFF' : '#000000';

        const span = document.createElement('span');
        span.style.fontFamily = 'monospace';
        span.style.fontSize = '10px';
        span.style.fontWeight = '700';
        span.style.color = textColor;
        span.textContent = `#${hex}`;

        item.appendChild(span);

        item.onmouseenter = () => {
            item.style.transform = 'translateY(-3px) scale(1.04)';
            item.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
        };
        item.onmouseleave = () => {
            item.style.transform = 'none';
            item.style.boxShadow = 'none';
        };

        item.onclick = () => {
            updateColorState(hex, false);
            showToast(`Selected #${hex}`);
        };

        dom.blendStepsContainer.appendChild(item);
    });
}

// --- Live UI Sandbox Renderer ---
function renderSandboxView(view = 'saas', theme = 'light') {
    if (!dom.sandboxViewport) return;
    const isDark = theme === 'dark';
    
    // Choose colors from active palette or smart palette
    const p1 = state.hex || '624E9A';
    const p2 = (state.generatorColors && state.generatorColors[1]) ? state.generatorColors[1] : 'EADDFF';
    const p3 = (state.generatorColors && state.generatorColors[2]) ? state.generatorColors[2] : '381E72';
    const p4 = (state.generatorColors && state.generatorColors[3]) ? state.generatorColors[3] : '49454F';
    const p5 = (state.generatorColors && state.generatorColors[4]) ? state.generatorColors[4] : 'CAC4D0';

    const bg = isDark ? '#121116' : '#FAF8FD';
    const surface = isDark ? '#1E1B24' : '#FFFFFF';
    const onSurface = isDark ? '#E6E1E5' : '#1C1B1F';
    const onSurfaceVariant = isDark ? '#CAC4D0' : '#49454F';
    const outline = isDark ? '#49454F' : '#E0E0E0';

    if (view === 'saas') {
        dom.sandboxViewport.innerHTML = `
            <div style="width: 100%; max-width: 900px; background: ${bg}; border-radius: 20px; border: 1px solid ${outline}; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.15); transition: all 0.3s ease;">
                <!-- Navbar -->
                <div style="padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${outline}; background: ${surface};">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 28px; height: 28px; border-radius: 8px; background: #${p1}; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 14px;">L</div>
                        <span style="font-weight: 700; color: ${onSurface}; font-size: 16px;">Limorina Cloud</span>
                    </div>
                    <div style="display: flex; gap: 20px; align-items: center;">
                        <span style="font-size: 13px; color: ${onSurfaceVariant}; font-weight: 500; cursor: pointer;">Features</span>
                        <span style="font-size: 13px; color: ${onSurfaceVariant}; font-weight: 500; cursor: pointer;">Pricing</span>
                        <span style="font-size: 13px; color: ${onSurfaceVariant}; font-weight: 500; cursor: pointer;">Changelog</span>
                        <button style="padding: 8px 16px; border-radius: 20px; border: none; background: #${p1}; color: #ffffff; font-weight: 600; font-size: 13px; cursor: pointer;">Get Started</button>
                    </div>
                </div>

                <!-- Hero Section -->
                <div style="padding: 60px 40px; text-align: center; position: relative; background: radial-gradient(circle at 50% 20%, #${p2}40 0%, transparent 60%);">
                    <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 30px; background: #${p2}33; border: 1px solid #${p1}55; color: #${p1}; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
                        <span class="material-symbols-rounded" style="font-size: 15px;">auto_awesome</span>
                        <span>Powered by Material You Theme</span>
                    </div>
                    <h1 style="font-size: 2.8rem; font-weight: 800; color: ${onSurface}; margin: 0 0 16px; letter-spacing: -0.02em; line-height: 1.15;">
                        Design Seamless Interfaces with <span style="color: #${p1};">Harmonious Color</span>
                    </h1>
                    <p style="font-size: 1.05rem; color: ${onSurfaceVariant}; max-width: 580px; margin: 0 auto 32px; line-height: 1.5;">
                        Craft accessible, beautiful user experiences in real-time. Perfectly balanced palettes meeting WCAG AAA and modern perceptual standards.
                    </p>
                    <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
                        <button style="padding: 12px 28px; border-radius: 24px; border: none; background: #${p1}; color: #ffffff; font-weight: 600; font-size: 15px; cursor: pointer; box-shadow: 0 4px 14px #${p1}55;">Start Building Now</button>
                        <button style="padding: 12px 24px; border-radius: 24px; border: 1px solid ${outline}; background: ${surface}; color: ${onSurface}; font-weight: 600; font-size: 15px; cursor: pointer;">Explore Documentation</button>
                    </div>

                    <!-- Hero Preview Surface Card -->
                    <div style="margin: 48px auto 0; max-width: 650px; background: ${surface}; border: 1px solid ${outline}; border-radius: 16px; padding: 24px; text-align: left; box-shadow: 0 16px 32px rgba(0,0,0,0.08); display: flex; gap: 20px; align-items: center;">
                        <div style="width: 54px; height: 54px; border-radius: 14px; background: #${p1}22; border: 1px solid #${p1}44; display: flex; align-items: center; justify-content: center; color: #${p1};">
                            <span class="material-symbols-rounded" style="font-size: 28px;">bolt</span>
                        </div>
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 4px; color: ${onSurface}; font-size: 16px; font-weight: 600;">Automated Color Accessibility Engine</h4>
                            <p style="margin: 0; color: ${onSurfaceVariant}; font-size: 13px;">Real-time APCA and WCAG 2.1 compliance checking with sub-millisecond calculation latency.</p>
                        </div>
                        <div style="padding: 6px 12px; border-radius: 12px; background: #${p1}; color: #fff; font-size: 12px; font-weight: bold;">99.8%</div>
                    </div>
                </div>
            </div>
        `;
    } else if (view === 'dashboard') {
        dom.sandboxViewport.innerHTML = `
            <div style="width: 100%; max-width: 900px; background: ${bg}; border-radius: 20px; border: 1px solid ${outline}; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.15); padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div>
                        <h3 style="margin: 0 0 4px; color: ${onSurface}; font-size: 20px; font-weight: 700;">Performance & Analytics</h3>
                        <p style="margin: 0; color: ${onSurfaceVariant}; font-size: 13px;">Overview of key performance metrics for the active quarter.</p>
                    </div>
                    <button style="padding: 8px 18px; border-radius: 20px; border: none; background: #${p1}; color: #ffffff; font-weight: 600; font-size: 13px; cursor: pointer;">Download Report</button>
                </div>

                <!-- Stats 3 Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="background: ${surface}; border: 1px solid ${outline}; border-radius: 16px; padding: 18px; position: relative;">
                        <span style="font-size: 12px; color: ${onSurfaceVariant}; font-weight: 600; text-transform: uppercase;">Total Revenue</span>
                        <div style="font-size: 26px; font-weight: 800; color: ${onSurface}; margin: 8px 0 4px;">$48,290.00</div>
                        <span style="font-size: 12px; font-weight: 600; color: #10B981; background: #10B98122; padding: 2px 8px; border-radius: 8px;">+14.8% vs last month</span>
                    </div>
                    <div style="background: ${surface}; border: 1px solid ${outline}; border-radius: 16px; padding: 18px; position: relative;">
                        <span style="font-size: 12px; color: ${onSurfaceVariant}; font-weight: 600; text-transform: uppercase;">Active Designers</span>
                        <div style="font-size: 26px; font-weight: 800; color: #${p1}; margin: 8px 0 4px;">12,840</div>
                        <span style="font-size: 12px; font-weight: 600; color: #${p1}; background: #${p1}22; padding: 2px 8px; border-radius: 8px;">+28.4% growth</span>
                    </div>
                    <div style="background: ${surface}; border: 1px solid ${outline}; border-radius: 16px; padding: 18px; position: relative;">
                        <span style="font-size: 12px; color: ${onSurfaceVariant}; font-weight: 600; text-transform: uppercase;">Contrast Pass Rate</span>
                        <div style="font-size: 26px; font-weight: 800; color: ${onSurface}; margin: 8px 0 4px;">98.4%</div>
                        <span style="font-size: 12px; font-weight: 600; color: #10B981; background: #10B98122; padding: 2px 8px; border-radius: 8px;">WCAG AAA Ready</span>
                    </div>
                </div>

                <!-- Chart + Table Row -->
                <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px;">
                    <div style="background: ${surface}; border: 1px solid ${outline}; border-radius: 16px; padding: 20px;">
                        <h4 style="margin: 0 0 16px; color: ${onSurface}; font-size: 15px; font-weight: 600;">Weekly Activity Trends</h4>
                        <!-- SVG Bar Chart -->
                        <svg viewBox="0 0 400 160" style="width: 100%; height: auto;">
                            <rect x="20" y="40" width="30" height="100" rx="6" fill="#${p1}" />
                            <rect x="75" y="65" width="30" height="75" rx="6" fill="#${p2}" />
                            <rect x="130" y="25" width="30" height="115" rx="6" fill="#${p1}" />
                            <rect x="185" y="80" width="30" height="60" rx="6" fill="#${p2}" />
                            <rect x="240" y="35" width="30" height="105" rx="6" fill="#${p1}" />
                            <rect x="295" y="50" width="30" height="90" rx="6" fill="#${p2}" />
                            <rect x="350" y="15" width="30" height="125" rx="6" fill="#${p1}" />
                        </svg>
                        <div style="display: flex; justify-content: space-around; margin-top: 8px; font-size: 11px; color: ${onSurfaceVariant};">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>

                    <div style="background: ${surface}; border: 1px solid ${outline}; border-radius: 16px; padding: 20px;">
                        <h4 style="margin: 0 0 14px; color: ${onSurface}; font-size: 15px; font-weight: 600;">Active Design Projects</h4>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid ${outline};">
                                <div>
                                    <div style="font-size: 13px; font-weight: 600; color: ${onSurface};">Mobile Banking App</div>
                                    <div style="font-size: 11px; color: ${onSurfaceVariant};">Design Tokens System</div>
                                </div>
                                <span style="font-size: 11px; font-weight: 700; color: #${p1}; background: #${p1}22; padding: 3px 8px; border-radius: 8px;">Active</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid ${outline};">
                                <div>
                                    <div style="font-size: 13px; font-weight: 600; color: ${onSurface};">E-Commerce Redesign</div>
                                    <div style="font-size: 11px; color: ${onSurfaceVariant};">Accessible Cart Flow</div>
                                </div>
                                <span style="font-size: 11px; font-weight: 700; color: #10B981; background: #10B98122; padding: 3px 8px; border-radius: 8px;">Passed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (view === 'mobile') {
        dom.sandboxViewport.innerHTML = `
            <div style="width: 340px; background: ${bg}; border: 8px solid ${isDark ? '#2D2930' : '#E0DDE6'}; border-radius: 40px; box-shadow: 0 20px 48px rgba(0,0,0,0.25); overflow: hidden; position: relative;">
                <!-- Phone Top Island Notch -->
                <div style="height: 30px; background: ${surface}; display: flex; justify-content: space-between; align-items: center; padding: 0 16px;">
                    <span style="font-size: 11px; font-weight: 700; color: ${onSurface};">9:41</span>
                    <div style="width: 60px; height: 14px; background: ${isDark ? '#000' : '#1C1B1F'}; border-radius: 10px;"></div>
                    <span style="font-size: 11px; font-weight: 700; color: ${onSurface};">100%</span>
                </div>

                <!-- Mobile Header -->
                <div style="padding: 16px; background: ${surface}; border-bottom: 1px solid ${outline}; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: #${p1}; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 14px;">L</div>
                        <div>
                            <div style="font-size: 13px; font-weight: 700; color: ${onSurface};">Limorina Mobile</div>
                            <div style="font-size: 10px; color: ${onSurfaceVariant};">Color Explorer Pro</div>
                        </div>
                    </div>
                    <div style="width: 28px; height: 28px; border-radius: 50%; background: #${p1}22; display: flex; align-items: center; justify-content: center; color: #${p1};">
                        <span class="material-symbols-rounded" style="font-size: 16px;">notifications</span>
                    </div>
                </div>

                <!-- Mobile Content Feed -->
                <div style="padding: 16px; display: flex; flex-direction: column; gap: 14px;">
                    <!-- Product Card -->
                    <div style="background: ${surface}; border: 1px solid ${outline}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                        <div style="height: 120px; background: linear-gradient(135deg, #${p1}, #${p2}); display: flex; align-items: center; justify-content: center; color: #fff;">
                            <span class="material-symbols-rounded" style="font-size: 44px;">headphones</span>
                        </div>
                        <div style="padding: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h5 style="margin: 0; font-size: 14px; font-weight: 700; color: ${onSurface};">Studio Pro Audio</h5>
                                <span style="font-size: 13px; font-weight: 800; color: #${p1};">$249</span>
                            </div>
                            <p style="margin: 4px 0 10px; font-size: 11px; color: ${onSurfaceVariant};">Active noise cancelling with spatial audio acoustics.</p>
                            <button style="width: 100%; padding: 8px; border-radius: 12px; border: none; background: #${p1}; color: #ffffff; font-weight: 700; font-size: 12px; cursor: pointer;">Add to Cart</button>
                        </div>
                    </div>

                    <!-- Chat Message bubble -->
                    <div style="display: flex; gap: 8px; align-items: flex-end;">
                        <div style="width: 24px; height: 24px; border-radius: 50%; background: #${p2};"></div>
                        <div style="background: #${p1}; color: #ffffff; padding: 10px 14px; border-radius: 16px 16px 16px 4px; font-size: 12px; max-width: 200px;">
                            The contrast ratios look stunning on this theme!
                        </div>
                    </div>
                </div>

                <!-- Mobile Bottom Nav -->
                <div style="height: 56px; background: ${surface}; border-top: 1px solid ${outline}; display: flex; justify-content: space-around; align-items: center; padding: 0 10px;">
                    <div style="color: #${p1}; display: flex; align-items: center;"><span class="material-symbols-rounded" style="font-size: 22px;">home</span></div>
                    <div style="color: ${onSurfaceVariant}; display: flex; align-items: center;"><span class="material-symbols-rounded" style="font-size: 22px;">palette</span></div>
                    <div style="color: ${onSurfaceVariant}; display: flex; align-items: center;"><span class="material-symbols-rounded" style="font-size: 22px;">analytics</span></div>
                    <div style="color: ${onSurfaceVariant}; display: flex; align-items: center;"><span class="material-symbols-rounded" style="font-size: 22px;">settings</span></div>
                </div>
            </div>
        `;
    }
}

// --- Showcase Card Generator (1200x675 Dribbble/Social format) ---
function exportShowcaseCard(colors = [], title = 'Palette Showcase') {
    if (!colors || colors.length === 0) return;

    const exportW = 1200;
    const exportH = 675; // 16:9 aspect
    const c = document.createElement('canvas');
    c.width = exportW;
    c.height = exportH;
    const cx = c.getContext('2d');

    const isDark = layoutState.theme === 'dark';
    cx.fillStyle = isDark ? '#141218' : '#FAF8FD';
    cx.fillRect(0, 0, exportW, exportH);

    // Ambient radial glows in background
    const p1 = colors[0];
    const p2 = colors[1] || p1;
    const g1 = cx.createRadialGradient(200, 200, 50, 200, 200, 450);
    g1.addColorStop(0, `#${p1}25`);
    g1.addColorStop(1, 'transparent');
    cx.fillStyle = g1;
    cx.fillRect(0, 0, exportW, exportH);

    const g2 = cx.createRadialGradient(1000, 450, 50, 1000, 450, 450);
    g2.addColorStop(0, `#${p2}20`);
    g2.addColorStop(1, 'transparent');
    cx.fillStyle = g2;
    cx.fillRect(0, 0, exportW, exportH);

    // Top Header
    cx.fillStyle = isDark ? '#E6E1E5' : '#1C1B1F';
    cx.font = 'bold 24px "Roboto", sans-serif';
    cx.textAlign = 'left';
    cx.fillText('LIMORINA COLOR CHECKER', 60, 70);

    cx.fillStyle = isDark ? '#CAC4D0' : '#49454F';
    cx.font = '14px "Roboto Mono", monospace';
    cx.fillText(title.toUpperCase(), 60, 95);

    // Date / Link top right
    cx.textAlign = 'right';
    cx.font = '13px "Roboto", sans-serif';
    cx.fillText('justlimorina.github.io/color-checker', exportW - 60, 70);
    cx.fillText(new Date().toLocaleDateString(), exportW - 60, 95);

    // Swatches Layout (cards in the middle)
    const swatchCount = colors.length;
    const paddingX = 60;
    const gap = 16;
    const totalGap = (swatchCount - 1) * gap;
    const cardW = (exportW - paddingX * 2 - totalGap) / swatchCount;
    const cardY = 135;
    const cardH = 460;

    colors.forEach((hex, i) => {
        const x = paddingX + i * (cardW + gap);
        const rgb = ColorUtils.hexToRgb(hex);
        const oklch = ColorUtils.rgbToOklch(rgb.r, rgb.g, rgb.b);
        const name = ColorUtils.getColorName(hex);
        const whiteRatio = ColorUtils.getContrastRatio(rgb, { r: 255, g: 255, b: 255 });
        const blackRatio = ColorUtils.getContrastRatio(rgb, { r: 0, g: 0, b: 0 });
        const textChoice = whiteRatio > blackRatio ? '#FFFFFF' : '#000000';

        // Outer card with shadow
        cx.save();
        cx.shadowColor = 'rgba(0,0,0,0.12)';
        cx.shadowBlur = 18;
        cx.shadowOffsetY = 6;
        cx.fillStyle = isDark ? '#211F26' : '#FFFFFF';
        cx.beginPath();
        cx.roundRect(x, cardY, cardW, cardH, 20);
        cx.fill();
        cx.restore();

        // Main color block
        const colorH = 260;
        cx.save();
        cx.beginPath();
        cx.roundRect(x, cardY, cardW, colorH, [20, 20, 0, 0]);
        cx.fillStyle = `#${hex}`;
        cx.fill();

        // Hex overlay inside color block
        cx.fillStyle = textChoice;
        cx.font = 'bold 20px "Roboto Mono", monospace';
        cx.textAlign = 'center';
        cx.fillText(`#${hex}`, x + cardW / 2, cardY + colorH - 24);
        cx.restore();

        // Info below color block
        const textBaseY = cardY + colorH + 34;
        cx.fillStyle = isDark ? '#E6E1E5' : '#1C1B1F';
        cx.font = 'bold 16px "Roboto", sans-serif';
        cx.textAlign = 'center';
        cx.fillText(name.length > 13 ? name.slice(0, 11) + '..' : name, x + cardW / 2, textBaseY);

        cx.fillStyle = isDark ? '#CAC4D0' : '#49454F';
        cx.font = '12px "Roboto Mono", monospace';
        cx.fillText(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, x + cardW / 2, textBaseY + 28);
        cx.fillText(`OKLCH(${Math.round(oklch.l)}% ${oklch.c.toFixed(2)})`, x + cardW / 2, textBaseY + 50);

        // Contrast badge pill
        const bestRatio = Math.max(whiteRatio, blackRatio).toFixed(1);
        cx.fillStyle = isDark ? '#2B2930' : '#F0EDF5';
        cx.beginPath();
        cx.roundRect(x + cardW / 2 - 40, textBaseY + 70, 80, 24, 12);
        cx.fill();

        cx.fillStyle = isDark ? '#D0BCFF' : '#6750A4';
        cx.font = 'bold 11px "Roboto", sans-serif';
        cx.fillText(`${bestRatio}:1 ${bestRatio >= 4.5 ? 'AA' : 'Fail'}`, x + cardW / 2, textBaseY + 86);
    });

    const link = document.createElement('a');
    link.download = `showcase-card-${Date.now()}.png`;
    link.href = c.toDataURL('image/png');
    link.click();
    showToast('Showcase Card exported!');
}
