/**
 * Nikita CRM — main landing entry point.
 * Initializes all interactive modules on DOMContentLoaded.
 * Loaded as an ES module from index.html.
 */
import { initMobileMenu }    from './modules/mobile-menu.js';
import { initHowTabs }       from './modules/how-tabs.js';
import { initCasesCarousel } from './modules/cases-carousel.js';
import { initCasesExSlider } from './modules/cases-ex-slider.js';
import { initPartnersSlider } from './modules/partners-slider.js';
import { initRecommendSlider } from './modules/recommend-slider.js';

function init() {
    initMobileMenu();
    initHowTabs();
    initCasesCarousel();
    initCasesExSlider();
    initPartnersSlider();
    initRecommendSlider();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
