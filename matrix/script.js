import { ColorUtils } from '../assets/script/utils.js';
import { translations } from '../assets/script/config.js';
import { initLayout, layoutState } from '../assets/script/shared/layout.js';
import { ProjectManager } from '../assets/script/projects.js';

const state = {
    matrixMode: "wcag"
};

const dom = {};

document.addEventListener('DOMContentLoaded', () => {
    initLayout('matrix');
    
    bindDOM();
    attachEvents();
    
    renderContrastMatrix();
});

// Watch language & projects changes
window.addEventListener('langchange', renderContrastMatrix);
window.addEventListener('projectschange', renderContrastMatrix);

function bindDOM() {
    Object.assign(dom, {
        table: document.getElementById('matrix-table'),
        modeToggle: document.getElementById('matrix-mode-toggle')
    });
}

function attachEvents() {
    if (dom.modeToggle) {
        dom.modeToggle.querySelectorAll('.segment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                dom.modeToggle.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                state.matrixMode = btn.getAttribute('data-mode');
                renderContrastMatrix();
            });
        });
    }
}

function renderContrastMatrix() {
    if (!dom.table) return;
    
    const activeProj = ProjectManager.getActiveProject();
    const palette = activeProj ? activeProj.colors : [];

    if (palette.length === 0) {
        const noColorsLabel = translations[layoutState.currentLang].no_colors_saved || "No colors in palette. Save some colors first!";
        dom.table.innerHTML = `<tr><td style="padding: 32px; text-align: center;">${noColorsLabel}</td></tr>`;
        return;
    }
    
    const colors = ['FFFFFF', '000000', ...palette];
    
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
            if (bg === fg) {
                html += `<td style="background-color: #${bg}; border: 1px solid rgba(128,128,128,0.2); text-align: center; opacity: 0.5;"> - </td>`;
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
                if (pass) badgeHtml = '<span style="color: #2e7d32; font-weight: bold;">AA</span>';
                else if (passLarge) badgeHtml = '<span style="color: #ed6c02; font-weight: bold;">AA (Large)</span>';
                else badgeHtml = '<span style="color: #d32f2f; font-weight: bold;">Fail</span>';
            }
            
            html += `<td style="background-color: #${bg}; color: #${fg}; border: 1px solid rgba(128,128,128,0.2);">
                <div class="matrix-cell" style="display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px;">
                    <strong>${displayVal}</strong>
                    ${badgeHtml}
                </div>
            </td>`;
        });
        html += '</tr>';
    });
    
    dom.table.innerHTML = html;
}
