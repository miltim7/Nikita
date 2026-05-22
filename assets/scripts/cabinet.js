import { initCabinetNavigation, initCabinetSidepanel, initCabinetTabbarModal, initCabinetThemeToggle } from './modules/cabinet-navigation.js';
import { initCabinetActionModals } from './modules/cabinet-action-modals.js';
import { initCabinetLanguageSelect } from './modules/cabinet-language-select.js';
import { initCabinetMailingCreatePage } from './modules/cabinet-mailing-create-page.js';
import { initCabinetMailingsPage } from './modules/cabinet-mailings-page.js';
import { initCabinetManagerPopover } from './modules/cabinet-manager-popover.js';
import { initCabinetNotificationsPage } from './modules/cabinet-notifications-page.js';
import { initCabinetNotificationsPopover } from './modules/cabinet-notifications-popover.js';
import { initCabinetPriceModal } from './modules/cabinet-price-modal.js';

function init() {
    initCabinetSidepanel();
    initCabinetTabbarModal();
    initCabinetNavigation();
    initCabinetActionModals();
    initCabinetLanguageSelect();
    initCabinetMailingCreatePage();
    initCabinetMailingsPage();
    initCabinetManagerPopover();
    initCabinetNotificationsPage();
    initCabinetNotificationsPopover();
    initCabinetPriceModal();
    initCabinetThemeToggle();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
