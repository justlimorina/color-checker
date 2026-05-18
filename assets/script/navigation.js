import { dom } from './state.js';
import { closeSidebar } from './sidebar.js';

export function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPageId = item.getAttribute('data-page');
            
            // Update active state in nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update active state in pages
            pages.forEach(page => {
                if (page.id === targetPageId) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });

            // Close sidebar on mobile after navigating
            if (window.innerWidth <= 1280) {
                closeSidebar();
            }
        });
    });
}
