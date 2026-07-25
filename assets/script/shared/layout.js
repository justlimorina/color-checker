import { translations } from '../config.js';
import { themeFromSourceColor, argbFromHex, hexFromArgb } from 'https://esm.sh/@material/material-color-utilities';
import { ColorUtils } from '../utils.js';

const BRAND_HEX = '624E9A';

export const layoutState = {
    theme: localStorage.getItem('theme_mode') || 'light',
    currentLang: localStorage.getItem('app_lang') || 'en',
    activePageKey: ''
};

function getPathPrefix() {
    const path = window.location.pathname;
    if (path.includes('/generator/') || 
        path.includes('/image-extractor/') || 
        path.includes('/md3-theme-creator/') || 
        path.includes('/contrast-checker/') || 
        path.includes('/matrix/') || 
        path.includes('/css-gradient-generator/')) {
        return '../';
    }
    return '';
}

export function initLayout(activePageKey) {
    layoutState.activePageKey = activePageKey;
    const prefix = getPathPrefix();

    // 1. Inject CSS and Material Symbols Rounded if not already present
    if (!document.querySelector('link[href*="material-symbols-rounded"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
        document.head.appendChild(link);
    }
    
    // 2. Setup Scrim Overlay (mobile backdrop)
    let scrim = document.getElementById('drawerScrim');
    if (!scrim) {
        scrim = document.createElement('div');
        scrim.id = 'drawerScrim';
        scrim.className = 'md-scrim';
        scrim.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(scrim, document.body.firstChild);
    }
    
    // 3. Setup Desktop Nav Rail
    let rail = document.getElementById('navRail');
    if (!rail) {
        rail = document.createElement('aside');
        rail.id = 'navRail';
        rail.className = 'md-nav-rail';
        document.body.insertBefore(rail, scrim.nextSibling);
    }
    rail.innerHTML = `
        <div class="md-nav-rail__top">
            <a href="${prefix}index.html" class="md-nav-rail__logo-wrapper" aria-label="Limorina's Personal Page">
                <img src="${prefix}assets/images/logo-black.svg" class="md-logo md-logo--light" alt="Limorina Logo">
                <img src="${prefix}assets/images/logo-white.svg" class="md-logo md-logo--dark" alt="Limorina Logo">
            </a>
        </div>

        <div class="md-nav-rail__destinations">
            <a href="${prefix}index.html" class="md-rail-item ${activePageKey === 'landing' ? 'active' : ''}" id="rail-home" title="Home">
                <div class="md-rail-item__icon-container">
                    <md-ripple></md-ripple>
                    <md-icon class="md-rail-item__icon">home</md-icon>
                </div>
            </a>
            <a href="${prefix}generator/" class="md-rail-item ${activePageKey === 'generator' ? 'active' : ''}" id="rail-generator" title="Generator & Palette">
                <div class="md-rail-item__icon-container">
                    <md-ripple></md-ripple>
                    <md-icon class="md-rail-item__icon">auto_awesome</md-icon>
                </div>
            </a>
            <a href="${prefix}image-extractor/" class="md-rail-item ${activePageKey === 'image' ? 'active' : ''}" id="rail-image" title="Image Extractor">
                <div class="md-rail-item__icon-container">
                    <md-ripple></md-ripple>
                    <md-icon class="md-rail-item__icon">image_search</md-icon>
                </div>
            </a>
            <a href="${prefix}md3-theme-creator/" class="md-rail-item ${activePageKey === 'theme' ? 'active' : ''}" id="rail-theme" title="MD3 Theme Builder">
                <div class="md-rail-item__icon-container">
                    <md-ripple></md-ripple>
                    <md-icon class="md-rail-item__icon">palette</md-icon>
                </div>
            </a>
            <a href="${prefix}contrast-checker/" class="md-rail-item ${activePageKey === 'contrast' ? 'active' : ''}" id="rail-contrast" title="Contrast Checker">
                <div class="md-rail-item__icon-container">
                    <md-ripple></md-ripple>
                    <md-icon class="md-rail-item__icon">contrast</md-icon>
                </div>
            </a>
            <a href="${prefix}matrix/" class="md-rail-item ${activePageKey === 'matrix' ? 'active' : ''}" id="rail-matrix" title="Contrast Matrix">
                <div class="md-rail-item__icon-container">
                    <md-ripple></md-ripple>
                    <md-icon class="md-rail-item__icon">grid_on</md-icon>
                </div>
            </a>
            <a href="${prefix}css-gradient-generator/" class="md-rail-item ${activePageKey === 'gradient' ? 'active' : ''}" id="rail-gradient" title="Gradient Generator">
                <div class="md-rail-item__icon-container">
                    <md-ripple></md-ripple>
                    <md-icon class="md-rail-item__icon">gradient</md-icon>
                </div>
            </a>
        </div>

        <div class="md-nav-rail__bottom">
            <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                <md-icon-button id="help-btn" title="User Guide">
                    <md-icon>help</md-icon>
                </md-icon-button>
                <div class="dropdown">
                    <md-icon-button id="lang-btn" title="Switch Language">
                        <md-icon>language</md-icon>
                    </md-icon-button>
                    <div id="lang-menu" class="dropdown-menu dropdown-menu--rail">
                        <button class="menu-item" data-lang="en">English</button>
                        <button class="menu-item" data-lang="vi">Tiếng Việt</button>
                        <button class="menu-item" data-lang="ja">日本語</button>
                        <button class="menu-item" data-lang="zh">简体中文</button>
                    </div>
                </div>
                <md-icon-button id="theme-toggle" aria-label="Toggle dark mode">
                    <md-icon>dark_mode</md-icon>
                </md-icon-button>
            </div>
        </div>
    `;

    // 4. Setup Mobile Top App Bar
    let header = document.querySelector('header.md-top-app-bar');
    if (!header) {
        header = document.createElement('header');
        header.className = 'md-top-app-bar';
        document.body.insertBefore(header, rail.nextSibling);
    }
    header.innerHTML = `
        <div class="md-top-app-bar__leading">
            <md-icon-button id="sidebar-toggle-btn" title="Open Navigation">
                <md-icon>menu</md-icon>
            </md-icon-button>
        </div>
        <div class="md-top-app-bar__title-container" style="cursor: pointer;" onclick="window.location.href='${prefix}index.html'">
            <img src="${prefix}assets/images/logo-black.svg" class="md-logo md-logo--light" alt="Limorina Logo">
            <img src="${prefix}assets/images/logo-white.svg" class="md-logo md-logo--dark" alt="Limorina Logo">
            <span class="md-top-app-bar__title" data-i18n="app_title">Color Checker</span>
        </div>
        <div class="md-top-app-bar__trailing">
            <md-icon-button id="theme-toggle-mobile" aria-label="Toggle dark mode">
                <md-icon>dark_mode</md-icon>
            </md-icon-button>
        </div>
    `;

    // 5. Setup Mobile Nav Drawer
    let drawer = document.getElementById('navDrawer');
    if (!drawer) {
        drawer = document.createElement('nav');
        drawer.id = 'navDrawer';
        drawer.className = 'md-nav-drawer';
        drawer.setAttribute('aria-label', 'Site navigation');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('role', 'dialog');
        document.body.insertBefore(drawer, header.nextSibling);
    }
    drawer.innerHTML = `
        <div class="md-nav-drawer__header">
            <md-icon-button id="closeDrawerBtn" aria-label="Close navigation">
                <md-icon>menu_open</md-icon>
            </md-icon-button>
            <span style="font-size:16px; font-weight:500; color:var(--md-sys-color-on-surface); margin-left:4px;">
                Limorina Color Checker
            </span>
        </div>

        <md-divider></md-divider>

        <div class="md-nav-drawer__content">
            <p class="md-nav-drawer__headline" data-i18n="menu">Navigation</p>
            <md-list class="md-nav-drawer__list">
                <md-list-item type="link" href="${prefix}index.html" class="md-nav-item ${activePageKey === 'landing' ? 'active' : ''}" id="nav-home">
                    <md-icon slot="start">home</md-icon>
                    <div slot="headline" data-i18n="nav_home">Home</div>
                </md-list-item>
                <md-list-item type="link" href="${prefix}generator/" class="md-nav-item ${activePageKey === 'generator' ? 'active' : ''}" id="nav-generator">
                    <md-icon slot="start">auto_awesome</md-icon>
                    <div slot="headline" data-i18n="smart_palette">Generator & Palette</div>
                </md-list-item>
                <md-list-item type="link" href="${prefix}image-extractor/" class="md-nav-item ${activePageKey === 'image' ? 'active' : ''}" id="nav-image">
                    <md-icon slot="start">image_search</md-icon>
                    <div slot="headline" data-i18n="image_extractor">Image Extractor</div>
                </md-list-item>
                <md-list-item type="link" href="${prefix}md3-theme-creator/" class="md-nav-item ${activePageKey === 'theme' ? 'active' : ''}" id="nav-theme">
                    <md-icon slot="start">palette</md-icon>
                    <div slot="headline" data-i18n="theme_builder">MD3 Theme Builder</div>
                </md-list-item>
                <md-list-item type="link" href="${prefix}contrast-checker/" class="md-nav-item ${activePageKey === 'contrast' ? 'active' : ''}" id="nav-contrast">
                    <md-icon slot="start">contrast</md-icon>
                    <div slot="headline" data-i18n="custom_contrast">Custom Contrast Checker</div>
                </md-list-item>
                <md-list-item type="link" href="${prefix}matrix/" class="md-nav-item ${activePageKey === 'matrix' ? 'active' : ''}" id="nav-matrix">
                    <md-icon slot="start">grid_on</md-icon>
                    <div slot="headline" data-i18n="contrast_matrix">Contrast Matrix</div>
                </md-list-item>
                <md-list-item type="link" href="${prefix}css-gradient-generator/" class="md-nav-item ${activePageKey === 'gradient' ? 'active' : ''}" id="nav-gradient">
                    <md-icon slot="start">gradient</md-icon>
                    <div slot="headline" data-i18n="gradient_generator">Gradient Generator</div>
                </md-list-item>
            </md-list>

            <md-divider style="margin: 16px 0;"></md-divider>

            <p class="md-nav-drawer__headline" data-i18n="settings">Settings & Support</p>
            <md-list class="md-nav-drawer__list">
                <md-list-item id="help-btn-drawer" class="md-nav-item" style="cursor: pointer;">
                    <md-icon slot="start">help</md-icon>
                    <div slot="headline" data-i18n="help_title">User Guide</div>
                </md-list-item>
            </md-list>

            <div style="padding: 12px 16px 24px;">
                <p style="font-size: 12px; font-weight: 500; color: var(--md-sys-color-on-surface-variant); margin-bottom: 8px;" data-i18n="language">Language</p>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="menu-item drawer-lang-btn" data-lang="en" style="border-radius: 8px; width: auto; padding: 6px 14px;">English</button>
                    <button class="menu-item drawer-lang-btn" data-lang="vi" style="border-radius: 8px; width: auto; padding: 6px 14px;">Tiếng Việt</button>
                    <button class="menu-item drawer-lang-btn" data-lang="ja" style="border-radius: 8px; width: auto; padding: 6px 14px;">日本語</button>
                    <button class="menu-item drawer-lang-btn" data-lang="zh" style="border-radius: 8px; width: auto; padding: 6px 14px;">简体中文</button>
                </div>
            </div>
        </div>
    `;

    // 6. Clean up old monolithic headers & sidebars if present
    const oldHeader = document.querySelector('header.top-app-bar');
    if (oldHeader && oldHeader !== header) oldHeader.remove();
    const oldSidebar = document.querySelector('aside.sidebar');
    if (oldSidebar) oldSidebar.remove();

    // 7. Inject Help Modal if not present
    if (!document.getElementById('help-modal')) {
        const modal = document.createElement('div');
        modal.id = 'help-modal';
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-card">
                <div class="modal-header">
                    <h2 class="headline-small" data-i18n="help_title">User Guide</h2>
                    <button id="close-help" class="icon-button small-btn">
                        <span class="material-symbols-rounded">close</span>
                    </button>
                </div>
                <div class="modal-body guide-body">
                    <section class="guide-section">
                        <h3 class="title-small" data-i18n="guide_color_formats_title">1. Color Formats</h3>
                        <p class="body-medium" data-i18n="guide_color_formats_desc">Different ways to represent color in digital design.</p>
                        <ul class="guide-list">
                            <li><strong>HEX:</strong> <span data-i18n="desc_hex">Standard web format.</span></li>
                            <li><strong>RGB:</strong> <span data-i18n="desc_rgb">Screen-based format.</span></li>
                            <li><strong>HSL:</strong> <span data-i18n="desc_hsl">Human-centric format.</span></li>
                            <li><strong>OKLCH:</strong> <span data-i18n="oklch_desc">Modern web color space.</span></li>
                            <li><strong>LAB:</strong> <span data-i18n="lab_desc">Perceptual uniform color space.</span></li>
                        </ul>
                    </section>
                    <section class="guide-section mt-m">
                        <h3 class="title-small" data-i18n="guide_variations_title">2. Color Variations</h3>
                        <ul class="guide-list">
                            <li><strong>Tints:</strong> <span data-i18n="desc_tints">Mix with White.</span></li>
                            <li><strong>Shades:</strong> <span data-i18n="desc_shades">Mix with Black.</span></li>
                            <li><strong>Tones:</strong> <span data-i18n="desc_tones">Mix with Grey.</span></li>
                        </ul>
                    </section>
                    <section class="guide-section mt-m">
                        <h3 class="title-small" data-i18n="guide_wcag_title">3. Accessibility (WCAG)</h3>
                        <p class="body-medium" data-i18n="guide_wcag_desc">Ensuring readability for everyone.</p>
                        <ul class="guide-list">
                            <li><strong>AA:</strong> <span data-i18n="desc_aa">Recommended standard.</span></li>
                            <li><strong>AAA:</strong> <span data-i18n="desc_aaa">Enhanced readability.</span></li>
                        </ul>
                    </section>
                </div>
                 <div class="modal-footer">
                     <md-filled-button id="close-help-confirm">
                         <span data-i18n="got_it">Got it!</span>
                     </md-filled-button>
                 </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // 8. Setup Layout Event Listeners
    setupLayoutEvents();

    // 9. Initial translations and themes
    applyTheme(layoutState.theme);
    setLanguage(layoutState.currentLang);

    // 10. Initial Color Theme (landing uses brand color, sub-pages use local storage)
    const isLanding = activePageKey === 'landing';
    const activeHex = isLanding ? BRAND_HEX : (localStorage.getItem('active_hex') || BRAND_HEX);
    applyColorTheme(activeHex);
}

export function applyColorTheme(hex) {
    const isDark = document.body.classList.contains('dark-mode') || document.body.classList.contains('dark-theme') || document.documentElement.classList.contains('dark-mode') || document.documentElement.classList.contains('dark-theme');
    const sourceArgb = argbFromHex(`#${hex}`);
    const theme = themeFromSourceColor(sourceArgb);
    const scheme = isDark ? theme.schemes.dark : theme.schemes.light;
    const palettes = theme.palettes;

    const setProp = (name, val) => {
        document.documentElement.style.setProperty(name, val);
    };
    
    // Set base hex
    setProp('--primary', `#${hex}`);
    
    // Generate and set tints and shades
    const rgb = ColorUtils.hexToRgb(hex);
    const weights = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    weights.forEach(w => {
        const tintRgb = ColorUtils.mixColors(rgb, {r:255,g:255,b:255}, w);
        const shadeRgb = ColorUtils.mixColors(rgb, {r:0,g:0,b:0}, w);
        setProp(`--primary-tint-${w}`, `#${ColorUtils.rgbToHex(tintRgb.r, tintRgb.g, tintRgb.b)}`);
        setProp(`--primary-shade-${w}`, `#${ColorUtils.rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b)}`);
    });

    // Set M3 System Colors
    setProp('--md-sys-color-primary', hexFromArgb(scheme.primary));
    setProp('--md-sys-color-on-primary', hexFromArgb(scheme.onPrimary));
    setProp('--md-sys-color-primary-container', hexFromArgb(scheme.primaryContainer));
    setProp('--md-sys-color-on-primary-container', hexFromArgb(scheme.onPrimaryContainer));
    
    setProp('--md-sys-color-secondary', hexFromArgb(scheme.secondary));
    setProp('--md-sys-color-on-secondary', hexFromArgb(scheme.onSecondary));
    setProp('--md-sys-color-secondary-container', hexFromArgb(scheme.secondaryContainer));
    setProp('--md-sys-color-on-secondary-container', hexFromArgb(scheme.onSecondaryContainer));

    setProp('--md-sys-color-tertiary', hexFromArgb(scheme.tertiary));
    setProp('--md-sys-color-on-tertiary', hexFromArgb(scheme.onTertiary));
    setProp('--md-sys-color-tertiary-container', hexFromArgb(scheme.tertiaryContainer));
    setProp('--md-sys-color-on-tertiary-container', hexFromArgb(scheme.onTertiaryContainer));

    setProp('--md-sys-color-error', hexFromArgb(scheme.error));
    setProp('--md-sys-color-on-error', hexFromArgb(scheme.onError));
    setProp('--md-sys-color-error-container', hexFromArgb(scheme.errorContainer));
    setProp('--md-sys-color-on-error-container', hexFromArgb(scheme.onErrorContainer));

    setProp('--md-sys-color-background', hexFromArgb(scheme.background));
    setProp('--md-sys-color-on-background', hexFromArgb(scheme.onBackground));
    setProp('--md-sys-color-surface', hexFromArgb(scheme.surface));
    setProp('--md-sys-color-on-surface', hexFromArgb(scheme.onSurface));
    setProp('--md-sys-color-surface-variant', hexFromArgb(scheme.surfaceVariant));
    setProp('--md-sys-color-on-surface-variant', hexFromArgb(scheme.onSurfaceVariant));

    setProp('--md-sys-color-outline', hexFromArgb(scheme.outline));
    setProp('--md-sys-color-outline-variant', hexFromArgb(scheme.outlineVariant));
    setProp('--md-sys-color-inverse-surface', hexFromArgb(scheme.inverseSurface));
    setProp('--md-sys-color-inverse-on-surface', hexFromArgb(scheme.inverseOnSurface));
    setProp('--md-sys-color-inverse-primary', hexFromArgb(scheme.inversePrimary));

    if (!isDark) {
        setProp('--md-sys-color-surface-container-lowest', hexFromArgb(palettes.neutral.tone(100)));
        setProp('--md-sys-color-surface-container-low', hexFromArgb(palettes.neutral.tone(96)));
        setProp('--md-sys-color-surface-container', hexFromArgb(palettes.neutral.tone(94)));
        setProp('--md-sys-color-surface-container-high', hexFromArgb(palettes.neutral.tone(92)));
        setProp('--md-sys-color-surface-container-highest', hexFromArgb(palettes.neutral.tone(90)));
    } else {
        setProp('--md-sys-color-surface-container-lowest', hexFromArgb(palettes.neutral.tone(4)));
        setProp('--md-sys-color-surface-container-low', hexFromArgb(palettes.neutral.tone(10)));
        setProp('--md-sys-color-surface-container', hexFromArgb(palettes.neutral.tone(12)));
        setProp('--md-sys-color-surface-container-high', hexFromArgb(palettes.neutral.tone(17)));
        setProp('--md-sys-color-surface-container-highest', hexFromArgb(palettes.neutral.tone(22)));
    }
}

function applyTheme(theme) {
    layoutState.theme = theme;
    localStorage.setItem('theme_mode', theme);
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    document.documentElement.classList.toggle('dark-mode', theme === 'dark');
    document.documentElement.classList.toggle('light-mode', theme === 'light');
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('dark-mode', theme === 'dark');
    document.body.classList.toggle('light-mode', theme === 'light');
    
    // Update theme toggle icons
    document.querySelectorAll('#theme-toggle md-icon, #theme-toggle-mobile md-icon').forEach(icon => {
        icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    });
    
    // Re-apply color theme to refresh dynamic colors under new light/dark mode
    const isLanding = layoutState.activePageKey === 'landing';
    const activeHex = isLanding ? BRAND_HEX : (localStorage.getItem('active_hex') || BRAND_HEX);
    applyColorTheme(activeHex);
}

export function setLanguage(lang) {
    layoutState.currentLang = lang;
    localStorage.setItem('app_lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-target]').forEach(el => {
        const key = el.getAttribute('data-i18n-target');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Update active class in language dropdown items and drawer language buttons
    document.querySelectorAll('[data-lang]').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-lang') === lang);
    });

    // Dispatch a custom event so the page-specific script can re-render if needed
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

function setupLayoutEvents() {
    const drawer = document.getElementById('navDrawer');
    const scrim = document.getElementById('drawerScrim');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const closeBtn = document.getElementById('closeDrawerBtn');
    
    const helpModal = document.getElementById('help-modal');
    const closeHelp = document.getElementById('close-help');
    const closeHelpConfirm = document.getElementById('close-help-confirm');
    
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    
    const langBtn = document.getElementById('lang-btn');
    const langMenu = document.getElementById('lang-menu');

    // Sidebar Drawer Toggles
    if (toggleBtn && drawer && scrim) {
        toggleBtn.addEventListener('click', () => {
            drawer.classList.add('is-open');
            scrim.classList.add('is-visible');
            drawer.removeAttribute('aria-hidden');
            if (window.innerWidth < 1200) {
                document.body.style.overflow = 'hidden';
            }
        });
    }

    const hideSidebar = () => {
        if (drawer && scrim) {
            drawer.classList.remove('is-open');
            scrim.classList.remove('is-visible');
            drawer.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    };

    if (closeBtn) closeBtn.addEventListener('click', hideSidebar);
    if (scrim) scrim.addEventListener('click', hideSidebar);

    // Help Modal Triggers (Desktop Rail, Mobile Drawer)
    document.querySelectorAll('#help-btn, #help-btn-drawer').forEach(btn => {
        btn.addEventListener('click', () => {
            hideSidebar();
            if (helpModal) helpModal.classList.add('show');
        });
    });

    const hideHelp = () => {
        if (helpModal) helpModal.classList.remove('show');
    };
    if (closeHelp) closeHelp.addEventListener('click', hideHelp);
    if (closeHelpConfirm) closeHelpConfirm.addEventListener('click', hideHelp);
    if (helpModal) {
        helpModal.addEventListener('click', (event) => {
            if (event.target === helpModal) hideHelp();
        });
    }
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') hideHelp();
    });

    // Theme Toggle (Dual)
    const onThemeClick = () => {
        const nextTheme = layoutState.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
    };
    if (themeToggle) themeToggle.addEventListener('click', onThemeClick);
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', onThemeClick);

    // Language Dropdown Toggles (Desktop Nav Rail)
    const toggleDropdown = (menu, e) => {
        e.stopPropagation();
        const isShow = menu.classList.contains('show');
        if (langMenu) langMenu.classList.remove('show');
        if (!isShow) menu.classList.add('show');
    };

    if (langBtn && langMenu) {
        langBtn.addEventListener('click', (e) => toggleDropdown(langMenu, e));
    }

    document.addEventListener('click', () => {
        if (langMenu) langMenu.classList.remove('show');
    });

    // Language Selection (All elements with data-lang)
    document.querySelectorAll('[data-lang]').forEach(item => {
        item.addEventListener('click', () => {
            const lang = item.getAttribute('data-lang');
            setLanguage(lang);
            hideSidebar();
        });
    });
}
