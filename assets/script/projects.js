// Project and Multi-Palette Manager for Limorina Color Checker

const PROJECTS_KEY = 'color_projects';
const ACTIVE_PROJECT_KEY = 'active_project_id';
const OLD_SAVED_PALETTE_KEY = 'saved_palette';

export const ProjectManager = {
    init() {
        let projects = this.getProjects();
        if (!projects || projects.length === 0) {
            // Migrate legacy saved_palette if available
            const legacyPalette = JSON.parse(localStorage.getItem(OLD_SAVED_PALETTE_KEY) || '[]');
            const defaultProject = {
                id: 'proj-' + Date.now(),
                name: 'Default Palette',
                colors: legacyPalette.length > 0 ? legacyPalette : ['624E9A', 'E7E0EC', '49454F'],
                updatedAt: Date.now()
            };
            projects = [defaultProject];
            this.saveProjects(projects);
            this.setActiveProjectId(defaultProject.id);
        }

        let activeId = localStorage.getItem(ACTIVE_PROJECT_KEY);
        if (!activeId || !projects.find(p => p.id === activeId)) {
            activeId = projects[0].id;
            this.setActiveProjectId(activeId);
        }

        // Parse URL Hash or Search Params for shared palette/color
        this.parseURLHash();
    },

    getProjects() {
        try {
            return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
        } catch (e) {
            return [];
        }
    },

    saveProjects(projects) {
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
        // Keep saved_palette synced with active project for legacy compatibility
        const active = this.getActiveProject();
        if (active) {
            localStorage.setItem(OLD_SAVED_PALETTE_KEY, JSON.stringify(active.colors));
        }
        window.dispatchEvent(new CustomEvent('projectschange'));
    },

    getActiveProjectId() {
        return localStorage.getItem(ACTIVE_PROJECT_KEY);
    },

    setActiveProjectId(id) {
        localStorage.setItem(ACTIVE_PROJECT_KEY, id);
        const active = this.getActiveProject();
        if (active) {
            localStorage.setItem(OLD_SAVED_PALETTE_KEY, JSON.stringify(active.colors));
        }
        window.dispatchEvent(new CustomEvent('projectschange'));
    },

    getActiveProject() {
        const projects = this.getProjects();
        const activeId = this.getActiveProjectId();
        return projects.find(p => p.id === activeId) || projects[0] || null;
    },

    createProject(name) {
        const projects = this.getProjects();
        const newProj = {
            id: 'proj-' + Date.now(),
            name: name.trim() || `Project ${projects.length + 1}`,
            colors: [],
            updatedAt: Date.now()
        };
        projects.push(newProj);
        this.saveProjects(projects);
        this.setActiveProjectId(newProj.id);
        return newProj;
    },

    renameProject(id, newName) {
        const projects = this.getProjects();
        const proj = projects.find(p => p.id === id);
        if (proj && newName.trim()) {
            proj.name = newName.trim();
            proj.updatedAt = Date.now();
            this.saveProjects(projects);
        }
    },

    deleteProject(id) {
        let projects = this.getProjects();
        if (projects.length <= 1) {
            // Cannot delete the last remaining project
            return false;
        }
        projects = projects.filter(p => p.id !== id);
        this.saveProjects(projects);
        if (this.getActiveProjectId() === id) {
            this.setActiveProjectId(projects[0].id);
        }
        return true;
    },

    addColorToActiveProject(hex) {
        hex = hex.toUpperCase().replace('#', '');
        const active = this.getActiveProject();
        if (!active) return false;
        if (!active.colors.includes(hex)) {
            active.colors.push(hex);
            active.updatedAt = Date.now();
            const projects = this.getProjects();
            const idx = projects.findIndex(p => p.id === active.id);
            if (idx !== -1) projects[idx] = active;
            this.saveProjects(projects);
            return true;
        }
        return false;
    },

    removeColorFromActiveProject(index) {
        const active = this.getActiveProject();
        if (!active) return;
        active.colors.splice(index, 1);
        active.updatedAt = Date.now();
        const projects = this.getProjects();
        const idx = projects.findIndex(p => p.id === active.id);
        if (idx !== -1) projects[idx] = active;
        this.saveProjects(projects);
    },

    exportProjectsJSON() {
        const data = {
            version: '1.0',
            app: 'Limorina Color Checker',
            exportedAt: new Date().toISOString(),
            projects: this.getProjects()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `color-projects-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    exportProjectGPL(projectId) {
        const projects = this.getProjects();
        const proj = projects.find(p => p.id === projectId) || this.getActiveProject();
        if (!proj) return;

        let gpl = `GIMP Palette\nName: ${proj.name}\nColumns: 5\n# Exported from Limorina Color Checker\n#\n`;
        proj.colors.forEach(hex => {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            gpl += `${String(r).padStart(3, ' ')} ${String(g).padStart(3, ' ')} ${String(b).padStart(3, ' ')}  #${hex}\n`;
        });

        const blob = new Blob([gpl], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${proj.name.toLowerCase().replace(/\s+/g, '-')}.gpl`;
        a.click();
        URL.revokeObjectURL(url);
    },

    exportProjectTokens(projectId, format = 'dtcg') {
        const projects = this.getProjects();
        const proj = projects.find(p => p.id === projectId) || this.getActiveProject();
        if (!proj || !proj.colors || proj.colors.length === 0) return null;

        if (format === 'dtcg') {
            return JSON.stringify(ColorUtils.formatDTCGTokens(proj.name, proj.colors), null, 2);
        } else if (format === 'css') {
            let css = `/* ${proj.name} - Generated Design Tokens */\n:root {\n`;
            proj.colors.forEach((hex, i) => {
                const rgb = ColorUtils.hexToRgb(hex);
                const oklch = ColorUtils.rgbToOklch(rgb.r, rgb.g, rgb.b);
                css += `  --color-${i + 1}: #${hex}; /* OKLCH(${Math.round(oklch.l)}% ${oklch.c.toFixed(2)} ${Math.round(oklch.h)}) */\n`;
            });
            css += `}`;
            return css;
        } else if (format === 'scss') {
            let scss = `// ${proj.name} - SCSS Token Map\n$${proj.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-palette: (\n`;
            proj.colors.forEach((hex, i) => {
                scss += `  "color-${i + 1}": #${hex},\n`;
            });
            scss += `);`;
            return scss;
        } else if (format === 'tailwind') {
            let tw = `/* ${proj.name} - Tailwind v4 Theme Tokens */\n@theme {\n`;
            proj.colors.forEach((hex, i) => {
                tw += `  --color-${i + 1}: #${hex};\n`;
            });
            tw += `}`;
            return tw;
        }
        return null;
    },

    importProjectsJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            const importedProjects = data.projects || (Array.isArray(data) ? data : null);
            if (!importedProjects || !Array.isArray(importedProjects)) {
                return { success: false, message: 'Invalid format' };
            }

            const currentProjects = this.getProjects();
            let addedCount = 0;

            importedProjects.forEach(imp => {
                if (imp.name && Array.isArray(imp.colors)) {
                    currentProjects.push({
                        id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                        name: imp.name + ' (Imported)',
                        colors: imp.colors.map(c => c.replace('#', '').toUpperCase()),
                        updatedAt: Date.now()
                    });
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                this.saveProjects(currentProjects);
                return { success: true, count: addedCount };
            }
            return { success: false, message: 'No valid projects found' };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },

    importBulkColors(rawText) {
        if (!rawText || typeof rawText !== 'string') return 0;
        const matches = rawText.match(/#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g);
        if (!matches || matches.length === 0) return 0;
        
        let count = 0;
        matches.forEach(m => {
            let hex = m.replace('#', '').toUpperCase();
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            if (this.addColorToActiveProject(hex)) {
                count++;
            }
        });
        return count;
    },

    getSharedURL(hexOrPalette) {
        const origin = window.location.origin + window.location.pathname;
        if (Array.isArray(hexOrPalette)) {
            return `${origin}#palette=${hexOrPalette.join('-')}`;
        }
        return `${origin}?color=${hexOrPalette}`;
    },

    parseURLHash() {
        const hash = window.location.hash;
        if (hash.includes('palette=')) {
            const hexes = hash.split('palette=')[1].split('-').map(c => c.trim().toUpperCase()).filter(c => /^[0-9A-F]{6}$/i.test(c));
            if (hexes.length > 0) {
                const projects = this.getProjects();
                const sharedProj = {
                    id: 'proj-shared-' + Date.now(),
                    name: 'Shared Palette (' + new Date().toLocaleDateString() + ')',
                    colors: hexes,
                    updatedAt: Date.now()
                };
                projects.unshift(sharedProj);
                this.saveProjects(projects);
                this.setActiveProjectId(sharedProj.id);
            }
        }
    }
};

// Auto initialize on import
ProjectManager.init();
