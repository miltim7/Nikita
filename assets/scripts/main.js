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
import { initServiceTabs } from './modules/service-tabs.js';
import { initPaymentTabs } from './modules/payment-tabs.js?v=payment-tabs';
import { initSecurityTabs } from './modules/security-tabs.js';
import { initFaqAccordion } from './modules/faq-accordion.js';
import { initSpeedTestWidget } from './modules/speed-test-widget.js';
import { initTopbarLanguageSelect } from './modules/topbar-language-select.js';
import { initI18n } from './modules/i18n-runtime.js';
import { initPublicAuth } from './modules/public-auth.js';

function init() {
    initI18n();
    initPublicAuth();
    initMobileMenu();
    initTopbarLanguageSelect();
    initSpeedTestWidget();
    initHowTabs();
    initCasesCarousel();
    initCasesExSlider();
    initPartnersSlider();
    initRecommendSlider();
    initServiceTabs();
    initPaymentTabs();
    initSecurityTabs();
    initFaqAccordion();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
