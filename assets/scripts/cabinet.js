import { initCabinetNavigation, initCabinetSidepanel, initCabinetTabbarModal, initCabinetThemeToggle } from './modules/cabinet-navigation.js';
import { initCabinetActionModals } from './modules/cabinet-action-modals.js';
import { initCabinetTableScrollbars } from './modules/cabinet-table-scrollbars.js';
import { initCabinetDatepickers } from './modules/cabinet-datepicker.js';
import { initCabinetHelpTooltips } from './modules/cabinet-help-tooltips.js';
import { initCabinetLanguageSelect } from './modules/cabinet-language-select.js';
import { initCabinetMailingCreatePage } from './modules/cabinet-mailing-create-page.js';
import { initCabinetMailingRecipientsPage } from './modules/cabinet-mailing-recipients-page.js';
import { initCabinetMailingsPage } from './modules/cabinet-mailings-page.js';
import { initCabinetManagerPopover } from './modules/cabinet-manager-popover.js';
import { initCabinetNotificationsPage } from './modules/cabinet-notifications-page.js';
import { initCabinetNotificationsPopover } from './modules/cabinet-notifications-popover.js';
import { initCabinetOtpPage } from './modules/cabinet-otp-page.js';
import { initCabinetPriceModal } from './modules/cabinet-price-modal.js';
import { initCabinetProfilePage } from './modules/cabinet-profile-page.js';
import { initCabinetRecipientListsPage } from './modules/cabinet-recipient-lists-page.js';
import { initCabinetRegistrationPage } from './modules/cabinet-registration-page.js';
import { initCabinetReportsPage } from './modules/cabinet-reports-page.js';
import { initCabinetTableSort } from './modules/cabinet-table-sort.js';
import { initCabinetTemplatesPage } from './modules/cabinet-templates-page.js';
import { initI18n } from './modules/i18n-runtime.js';

function init() {
    initI18n();
    initCabinetSidepanel();
    initCabinetTabbarModal();
    initCabinetTableScrollbars();
    initCabinetNavigation();
    initCabinetActionModals();
    initCabinetDatepickers();
    initCabinetHelpTooltips();
    initCabinetLanguageSelect();
    initCabinetMailingCreatePage();
    initCabinetMailingRecipientsPage();
    initCabinetMailingsPage();
    initCabinetManagerPopover();
    initCabinetNotificationsPage();
    initCabinetNotificationsPopover();
    initCabinetOtpPage();
    initCabinetPriceModal();
    initCabinetProfilePage();
    initCabinetRecipientListsPage();
    initCabinetRegistrationPage();
    initCabinetReportsPage();
    initCabinetTableSort();
    initCabinetTemplatesPage();
    initCabinetThemeToggle();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
