import { dom } from './state.js';

export function toggleSidebar() {
    dom.sidebar.classList.toggle('open');
    const isOpen = dom.sidebar.classList.contains('open');
    if (isOpen) {
        dom.mainContainer.classList.add('sidebar-active');
        document.body.classList.add('sidebar-open');
    } else {
        dom.mainContainer.classList.remove('sidebar-active');
        document.body.classList.remove('sidebar-open');
    }
}

export function closeSidebar() {
    dom.sidebar.classList.remove('open');
    dom.mainContainer.classList.remove('sidebar-active');
    document.body.classList.remove('sidebar-open');
}
