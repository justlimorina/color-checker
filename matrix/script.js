import { ColorUtils } from '../assets/script/utils.js';
import { translations } from '../assets/script/config.js';
import { initLayout, layoutState } from '../assets/script/shared/layout.js';
import { ProjectManager } from '../assets/script/projects.js';

const state = {
    matrixMode: "wcag",
    passOnly: false,
    inspectBg: "FFFFFF",
    inspectFg: "000000"
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
        modeToggle: document.getElementById('matrix-mode-toggle'),
        passFilter: document.getElementById('matrix-pass-filter'),
        exportCsvBtn: document.getElementById('export-matrix-csv'),
        copyMdBtn: document.getElementById('copy-matrix-md'),
        inspectModal: document.getElementById('matrix-inspect-modal'),
        inspectScrim: document.getElementById('matrix-inspect-scrim'),
        closeInspectBtn: document.getElementById('close-inspect-modal'),
        inspectBgSwatch: document.getElementById('inspect-bg-swatch'),
        inspectBgHex: document.getElementById('inspect-bg-hex'),
        inspectFgSwatch: document.getElementById('inspect-fg-swatch'),
        inspectFgHex: document.getElementById('inspect-fg-hex'),
        inspectSampleBox: document.getElementById('inspect-sample-box'),
        inspectWcagVal: document.getElementById('inspect-wcag-val'),
        inspectApcaVal: document.getElementById('inspect-apca-val'),
        inspectOpenBtn: document.getElementById('inspect-open-btn'),
        toast: document.getElementById('toast')
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

    if (dom.passFilter) {
        dom.passFilter.addEventListener('change', (e) => {
            state.passOnly = e.target.checked;
            renderContrastMatrix();
        });
    }

    // Modal Close
    if (dom.closeInspectBtn) {
        dom.closeInspectBtn.addEventListener('click', closeInspectModal);
    }
    if (dom.inspectScrim) {
        dom.inspectScrim.addEventListener('click', closeInspectModal);
    }

    // Inspect Open in Contrast Checker
    if (dom.inspectOpenBtn) {
        dom.inspectOpenBtn.addEventListener('click', () => {
            window.location.href = `../contrast-checker/?bg=${state.inspectBg}&fg=${state.inspectFg}`;
        });
    }

    // Export CSV
    if (dom.exportCsvBtn) {
        dom.exportCsvBtn.addEventListener('click', exportMatrixCSV);
    }

    // Copy Markdown
    if (dom.copyMdBtn) {
        dom.copyMdBtn.addEventListener('click', copyMatrixMarkdown);
    }
}

function openInspectModal(bg, fg) {
    state.inspectBg = bg;
    state.inspectFg = fg;

    const bgRgb = ColorUtils.hexToRgb(bg);
    const fgRgb = ColorUtils.hexToRgb(fg);
    const ratio = ColorUtils.getContrastRatio(bgRgb, fgRgb);
    const apca = ColorUtils.getAPCAContrast(fgRgb, bgRgb);

    if (dom.inspectBgSwatch) dom.inspectBgSwatch.style.backgroundColor = `#${bg}`;
    if (dom.inspectBgHex) dom.inspectBgHex.textContent = `#${bg}`;
    if (dom.inspectFgSwatch) dom.inspectFgSwatch.style.backgroundColor = `#${fg}`;
    if (dom.inspectFgHex) dom.inspectFgHex.textContent = `#${fg}`;

    if (dom.inspectSampleBox) {
        dom.inspectSampleBox.style.backgroundColor = `#${bg}`;
        dom.inspectSampleBox.style.color = `#${fg}`;
    }

    if (dom.inspectWcagVal) {
        dom.inspectWcagVal.textContent = `${ratio.toFixed(1)}:1`;
        dom.inspectWcagVal.style.color = ratio >= 4.5 ? '#2e7d32' : (ratio >= 3.0 ? '#ed6c02' : '#d32f2f');
    }

    if (dom.inspectApcaVal) {
        dom.inspectApcaVal.textContent = `Lc ${Math.round(apca)}`;
        dom.inspectApcaVal.style.color = Math.abs(apca) >= 60 ? '#2e7d32' : '#d32f2f';
    }

    if (dom.inspectModal && dom.inspectScrim) {
        dom.inspectModal.style.display = 'block';
        dom.inspectScrim.style.display = 'block';
    }
}

function closeInspectModal() {
    if (dom.inspectModal && dom.inspectScrim) {
        dom.inspectModal.style.display = 'none';
        dom.inspectScrim.style.display = 'none';
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
    
    let html = '<thead><tr><th>Bg \\ Fg</th>';
    colors.forEach(c => {
        const rgb = ColorUtils.hexToRgb(c);
        const l = ColorUtils.getLuminance(rgb.r, rgb.g, rgb.b);
        html += `<th style="background-color: #${c}; color: ${l < 0.5 ? '#fff' : '#000'}; border: 1px solid rgba(128,128,128,0.2); font-family: monospace;">#${c}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    const isApca = state.matrixMode === 'apca';
    
    colors.forEach(bg => {
        const bgRgb = ColorUtils.hexToRgb(bg);
        const bgL = ColorUtils.getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
        html += `<tr><th style="background-color: #${bg}; color: ${bgL < 0.5 ? '#fff' : '#000'}; border: 1px solid rgba(128,128,128,0.2); font-family: monospace;">#${bg}</th>`;
        
        colors.forEach(fg => {
            if (bg === fg) {
                html += `<td style="background-color: #${bg}; border: 1px solid rgba(128,128,128,0.2); text-align: center; opacity: 0.4;"> - </td>`;
                return;
            }
            
            let displayVal = '';
            let badgeHtml = '';
            let isPass = false;
            
            if (isApca) {
                const score = ColorUtils.getAPCAContrast(ColorUtils.hexToRgb(fg), bgRgb);
                displayVal = `Lc ${Math.round(score)}`;
                const absScore = Math.abs(score);
                if (absScore >= 75) {
                    badgeHtml = '<span style="color: #2e7d32; font-weight: bold;">Body</span>';
                    isPass = true;
                } else if (absScore >= 60) {
                    badgeHtml = '<span style="color: var(--md-sys-color-primary); font-weight: bold;">Large</span>';
                    isPass = true;
                } else if (absScore >= 45) {
                    badgeHtml = '<span style="color: #ed6c02; font-weight: bold;">Hdng</span>';
                    isPass = false;
                } else {
                    badgeHtml = '<span style="color: #d32f2f; font-weight: bold;">Fail</span>';
                    isPass = false;
                }
            } else {
                const ratio = ColorUtils.getContrastRatio(bgRgb, ColorUtils.hexToRgb(fg));
                displayVal = `${ratio.toFixed(1)}:1`;
                if (ratio >= 7.0) {
                    badgeHtml = '<span style="color: #2e7d32; font-weight: bold;">AAA</span>';
                    isPass = true;
                } else if (ratio >= 4.5) {
                    badgeHtml = '<span style="color: #2e7d32; font-weight: bold;">AA</span>';
                    isPass = true;
                } else if (ratio >= 3.0) {
                    badgeHtml = '<span style="color: #ed6c02; font-weight: bold;">AA Large</span>';
                    isPass = false;
                } else {
                    badgeHtml = '<span style="color: #d32f2f; font-weight: bold;">Fail</span>';
                    isPass = false;
                }
            }
            
            const dimmedClass = (state.passOnly && !isPass) ? 'fail-dimmed' : '';

            html += `<td class="matrix-cell-interactive" data-bg="${bg}" data-fg="${fg}" style="background-color: #${bg}; color: #${fg}; border: 1px solid rgba(128,128,128,0.2);">
                <div class="matrix-cell ${dimmedClass}" style="display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px;">
                    <strong>${displayVal}</strong>
                    ${badgeHtml}
                </div>
            </td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody>';
    dom.table.innerHTML = html;

    // Attach click events on cells
    dom.table.querySelectorAll('.matrix-cell-interactive').forEach(cell => {
        cell.addEventListener('click', () => {
            const bg = cell.getAttribute('data-bg');
            const fg = cell.getAttribute('data-fg');
            if (bg && fg) openInspectModal(bg, fg);
        });
    });
}

function exportMatrixCSV() {
    const activeProj = ProjectManager.getActiveProject();
    const palette = activeProj ? activeProj.colors : [];
    if (palette.length === 0) return;

    const colors = ['FFFFFF', '000000', ...palette];
    let csv = 'Background HEX,Foreground HEX,Contrast Ratio,WCAG AA Normal (4.5),WCAG AAA (7.0),APCA Lc Score\n';

    colors.forEach(bg => {
        const bgRgb = ColorUtils.hexToRgb(bg);
        colors.forEach(fg => {
            if (bg === fg) return;
            const fgRgb = ColorUtils.hexToRgb(fg);
            const ratio = ColorUtils.getContrastRatio(bgRgb, fgRgb);
            const apca = ColorUtils.getAPCAContrast(fgRgb, bgRgb);
            const aa = ratio >= 4.5 ? 'PASS' : 'FAIL';
            const aaa = ratio >= 7.0 ? 'PASS' : 'FAIL';
            csv += `#${bg},#${fg},${ratio.toFixed(2)}:1,${aa},${aaa},${Math.round(apca)}\n`;
        });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contrast-matrix-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast(translations[layoutState.currentLang]?.copied_csv || 'CSV file downloaded!');
}

function copyMatrixMarkdown() {
    const activeProj = ProjectManager.getActiveProject();
    const palette = activeProj ? activeProj.colors : [];
    if (palette.length === 0) return;

    const colors = ['FFFFFF', '000000', ...palette];
    let md = `| Bg \\ Fg | ${colors.map(c => `#${c}`).join(' | ')} |\n`;
    md += `| --- | ${colors.map(() => '---').join(' | ')} |\n`;

    colors.forEach(bg => {
        const bgRgb = ColorUtils.hexToRgb(bg);
        let row = `| **#${bg}** |`;
        colors.forEach(fg => {
            if (bg === fg) {
                row += ' - |';
            } else {
                const fgRgb = ColorUtils.hexToRgb(fg);
                const ratio = ColorUtils.getContrastRatio(bgRgb, fgRgb);
                const badge = ratio >= 4.5 ? '✓ AA' : (ratio >= 3.0 ? '~ Lrg' : '× Fail');
                row += ` ${ratio.toFixed(1)}:1 (${badge}) |`;
            }
        });
        md += `${row}\n`;
    });

    navigator.clipboard.writeText(md).then(() => {
        showToast(translations[layoutState.currentLang]?.copied_markdown || 'Copied Markdown table to clipboard!');
    });
}

function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2200);
}
