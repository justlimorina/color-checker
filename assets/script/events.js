import { dom, state } from './state.js';
import { updateColorState, saveToPalette } from './app.js';
import { setLanguage, updateExportContent, showToast, exportPaletteImage, updateDynamicTheme } from './ui.js';
import { ColorUtils } from './utils.js';
import { toggleSidebar, closeSidebar } from './sidebar.js';
import { updateCustomContrast, toggleAdvancedPreview, renderContrastMatrix } from './features.js';
import { initImageExtractor, initContrastMatrix, initGradientGenerator, initThemeBuilder, initPaletteGenerator, runPaletteGeneration, saveGeneratorPalette } from './features.js';

export function attachEvents() {
    initRipple();
    initImageExtractor();
    initContrastMatrix();
    initPaletteGenerator();
    initGradientGenerator();
    initThemeBuilder();
    dom.hexInput.oninput = (e) => updateColorState(e.target.value);
    dom.colorPicker.oninput = (e) => updateColorState(e.target.value.substring(1));
    
    dom.themeToggle.onclick = () => {
        document.body.classList.toggle('dark-mode');
        dom.themeToggle.children[0].textContent = document.body.classList.contains('dark-mode') ? 'light_mode' : 'dark_mode';
        updateDynamicTheme();
    };
    
    dom.langBtn.onclick = (e) => {
        e.stopPropagation();
        dom.langMenu.classList.toggle('show');
    };

    document.addEventListener('click', (e) => {
        dom.langMenu.classList.remove('show');
        // Close sidebar if clicked outside when open, ignoring clicks on toggle button
        if (dom.sidebar.classList.contains('open') && 
            !dom.sidebar.contains(e.target) && 
            !dom.sidebarToggleBtn.contains(e.target)) {
            closeSidebar();
        }
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        item.onclick = () => {
            setLanguage(item.getAttribute('data-lang'));
            dom.langMenu.classList.remove('show');
        };
    });
    
    dom.saveBtn.onclick = saveToPalette;
    dom.exportImageBtn.onclick = exportPaletteImage;

    // Mixer Input Listeners
    const handleMixerInput = (key) => {
        let hex;
        if (['r', 'g', 'b'].includes(key)) {
            hex = ColorUtils.rgbToHex(
                parseInt(dom.mixerInputs.r.value) || 0,
                parseInt(dom.mixerInputs.g.value) || 0,
                parseInt(dom.mixerInputs.b.value) || 0
            );
        } else if (['h', 's', 'l'].includes(key)) {
            const rgb = ColorUtils.hslToRgb(
                parseInt(dom.mixerInputs.h.value) || 0,
                parseInt(dom.mixerInputs.s.value) || 0,
                parseInt(dom.mixerInputs.l.value) || 0
            );
            hex = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
        } else if (key.startsWith('oklch')) {
            const rgb = ColorUtils.oklchToRgb(
                parseFloat(dom.mixerInputs.oklch_l.value) || 0,
                parseFloat(dom.mixerInputs.oklch_c.value) || 0,
                parseFloat(dom.mixerInputs.oklch_h.value) || 0
            );
            hex = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
        } else if (key.startsWith('lab')) {
            const rgb = ColorUtils.oklabToRgb(
                parseFloat(dom.mixerInputs.lab_l.value) || 0,
                parseFloat(dom.mixerInputs.lab_a.value) || 0,
                parseFloat(dom.mixerInputs.lab_b.value) || 0
            );
            hex = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
        }
        if(hex) {
            updateColorState(hex);
            dom.hexInput.value = hex;
            dom.colorPicker.value = `#${hex}`;
        }
    };

    Object.keys(dom.mixerInputs).forEach(key => {
        if(dom.mixerInputs[key]) {
            dom.mixerInputs[key].oninput = () => handleMixerInput(key);
        }
    });

    dom.exportHubBtn.onclick = () => {
        updateExportContent();
        dom.exportModal.classList.add('show');
    };

    dom.closeModal.onclick = () => dom.exportModal.classList.remove('show');

    dom.helpBtn.onclick = () => dom.helpModal.classList.add('show');
    dom.closeHelp.onclick = dom.closeHelpConfirm.onclick = () => dom.helpModal.classList.remove('show');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`export-content-${btn.getAttribute('data-tab')}`).classList.add('active');
        };
    });

    dom.copyExportBtn.onclick = () => {
        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        const text = document.getElementById(`code-${activeTab}`).textContent;
        navigator.clipboard.writeText(text).then(showToast);
    };

    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.getAttribute('data-target');
            const text = document.getElementById(targetId).textContent;
            navigator.clipboard.writeText(text).then(showToast);
        };
    });
    
    // Sidebar Events
    if (dom.sidebarToggleBtn) {
        dom.sidebarToggleBtn.onclick = toggleSidebar;
    }
    if (dom.closeSidebarBtn) {
        dom.closeSidebarBtn.onclick = closeSidebar;
    }

    // Custom Contrast Events
    if (dom.customBgHex && dom.customFgHex) {
        dom.customBgHex.oninput = updateCustomContrast;
        dom.customFgHex.oninput = updateCustomContrast;
    }
    
    if (dom.customBgPicker && dom.customFgPicker) {
        dom.customBgPicker.oninput = (e) => { dom.customBgHex.value = e.target.value.substring(1).toUpperCase(); updateCustomContrast(); };
        dom.customFgPicker.oninput = (e) => { dom.customFgHex.value = e.target.value.substring(1).toUpperCase(); updateCustomContrast(); };
    }

    // Advanced Preview Toggle
    if (dom.advancedPreviewToggle) {
        dom.advancedPreviewToggle.onclick = toggleAdvancedPreview;
    }

    // Contrast Matrix Toggle
    const matrixToggle = document.getElementById('matrix-mode-toggle');
    if (matrixToggle) {
        matrixToggle.querySelectorAll('.segment-btn').forEach(btn => {
            btn.onclick = () => {
                matrixToggle.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.matrixMode = btn.getAttribute('data-mode');
                renderContrastMatrix();
            };
        });
    }

    // Smart Palette Generator Control Listeners
    const generatorRuleSelect = document.getElementById('generator-rule-select');
    if (generatorRuleSelect) {
        generatorRuleSelect.onchange = (e) => {
            state.generatorRule = e.target.value;
            runPaletteGeneration();
        };
    }

    const generatorGenerateBtn = document.getElementById('generator-generate-btn');
    if (generatorGenerateBtn) {
        generatorGenerateBtn.onclick = runPaletteGeneration;
    }

    const generatorSaveBtn = document.getElementById('generator-save-btn');
    if (generatorSaveBtn) {
        generatorSaveBtn.onclick = saveGeneratorPalette;
    }
}

function initRipple() {
    document.addEventListener('mousedown', function (e) {
        const target = e.target.closest('button, .nav-item');
        if (!target) return;
        
        const style = window.getComputedStyle(target);
        if (style.position === 'static') {
            target.style.position = 'relative';
        }
        target.style.overflow = 'hidden';

        const circle = document.createElement('span');
        const diameter = Math.max(target.clientWidth, target.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - target.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${e.clientY - target.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');

        const existingRipple = target.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }

        target.appendChild(circle);
        
        setTimeout(() => {
            circle.remove();
        }, 600);
    });
}
