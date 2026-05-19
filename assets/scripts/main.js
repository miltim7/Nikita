/**
 * Nikita CRM — main landing entry point.
 * Initializes all interactive modules on DOMContentLoaded.
 * Loaded as an ES module from index.html.
 */
import { initMobileMenu }    from './modules/mobile-menu.js';
import { initHowTabs }       from './modules/how-tabs.js';
import { initCasesCarousel } from './modules/cases-carousel.js';

function init() {
    initMobileMenu();
    initHowTabs();
    initCasesCarousel();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
