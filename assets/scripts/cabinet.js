import { initCabinetNavigation, initCabinetSidepanel, initCabinetTabbarModal, initCabinetThemeToggle } from './modules/cabinet-navigation.js';

function init() {
    initCabinetSidepanel();
    initCabinetTabbarModal();
    initCabinetNavigation();
    initCabinetThemeToggle();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
