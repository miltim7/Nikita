import { closeModalLayer, openModalLayer } from './modal-transition.js';

const POPOVER_ID = 'registrationHelpPopover';
const SUCCESS_PARAM = 'success';
const VIEWPORT_PADDING = 12;
const HELP_POPOVER_LABELS = {
    ru: 'Подсказка',
    en: 'Hint',
    ky: 'Кеңеш',
};

let helpPopover = null;
let activeHelpTrigger = null;
let isHelpPinned = false;
let helpCloseTimer = null;
let activeActivationModalTrigger = null;

function shouldShowSuccessView() {
    const params = new URLSearchParams(window.location.search);
    return params.get(SUCCESS_PARAM) === '1' || window.location.hash === '#success';
}

function setRegistrationView(page, showSuccess) {
    const formView = page.querySelector('[data-registration-form-view]');
    const successView = page.querySelector('[data-registration-success-view]');

    if (!formView || !successView) return;

    formView.hidden = showSuccess;
    successView.hidden = !showSuccess;
    page.classList.toggle('is-registration-success', showSuccess);
}

function updateSuccessUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set(SUCCESS_PARAM, '1');
    url.hash = '';
    window.history.pushState(null, '', url);
}

function initRegistrationViews(page) {
    const form = page.querySelector('[data-registration-form]');
    setRegistrationView(page, shouldShowSuccessView());

    form?.addEventListener('submit', (event) => {
        if (!form.checkValidity()) return;

        event.preventDefault();
        setRegistrationView(page, true);
        updateSuccessUrl();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('popstate', () => {
        setRegistrationView(page, shouldShowSuccessView());
    });
}

function createHelpPopover() {
    const locale = document.documentElement.lang || 'ru';
    const popover = document.createElement('div');
    popover.className = 'registration-help-popover';
    popover.id = POPOVER_ID;
    popover.hidden = true;
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', HELP_POPOVER_LABELS[locale] || HELP_POPOVER_LABELS.ru);
    popover.setAttribute('data-registration-help-popover', '');
    popover.innerHTML = '<div class="registration-help-popover__content" data-registration-help-content></div>';
    document.body.append(popover);
    return popover;
}

function getHelpPopover() {
    helpPopover = helpPopover || document.getElementById(POPOVER_ID) || createHelpPopover();
    return helpPopover;
}

function getHelpContent(button) {
    const hint = button.closest('.registration-field')?.querySelector('.registration-hint');
    return hint?.innerHTML.trim() || '';
}

function clearHelpCloseTimer() {
    if (!helpCloseTimer) return;

    window.clearTimeout(helpCloseTimer);
    helpCloseTimer = null;
}

function positionHelpPopover(button, popover) {
    const triggerRect = button.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const preferredLeft = triggerRect.right - popoverRect.width;
    const maxLeft = window.innerWidth - popoverRect.width - VIEWPORT_PADDING;
    const left = Math.max(VIEWPORT_PADDING, Math.min(preferredLeft, maxLeft));
    const top = Math.min(
        triggerRect.bottom + 8,
        window.innerHeight - popoverRect.height - VIEWPORT_PADDING,
    );

    popover.style.left = `${left}px`;
    popover.style.top = `${Math.max(VIEWPORT_PADDING, top)}px`;
}

function closeHelpPopover({ restoreFocus = false } = {}) {
    const popover = getHelpPopover();
    if (popover.hidden && !popover.classList.contains('is-open')) return;

    clearHelpCloseTimer();
    isHelpPinned = false;
    popover.classList.remove('is-pinned');

    const trigger = activeHelpTrigger;
    activeHelpTrigger = null;
    trigger?.classList.remove('is-active');
    trigger?.setAttribute('aria-expanded', 'false');

    closeModalLayer(popover, {
        afterClose: () => {
            popover.querySelector('[data-registration-help-content]').innerHTML = '';
        },
    });

    if (restoreFocus) trigger?.focus();
}

function scheduleHelpPopoverClose() {
    clearHelpCloseTimer();

    if (isHelpPinned) return;

    helpCloseTimer = window.setTimeout(() => {
        closeHelpPopover();
    }, 120);
}

function openHelpPopover(button, { pinned = false } = {}) {
    const content = getHelpContent(button);
    if (!content) return;

    clearHelpCloseTimer();

    const popover = getHelpPopover();
    const contentNode = popover.querySelector('[data-registration-help-content]');

    if (activeHelpTrigger && activeHelpTrigger !== button) {
        activeHelpTrigger.classList.remove('is-active');
        activeHelpTrigger.setAttribute('aria-expanded', 'false');
    }

    activeHelpTrigger = button;
    isHelpPinned = pinned;
    contentNode.innerHTML = content;
    popover.hidden = false;
    positionHelpPopover(button, popover);
    openModalLayer(popover);
    popover.classList.toggle('is-pinned', isHelpPinned);

    button.classList.add('is-active');
    button.setAttribute('aria-expanded', 'true');
}

function repositionActivePopover() {
    if (!activeHelpTrigger || !helpPopover || helpPopover.hidden) return;
    positionHelpPopover(activeHelpTrigger, helpPopover);
}

function initHelpButtons(page) {
    const helpButtons = Array.from(page.querySelectorAll('[data-registration-help]'));
    if (!helpButtons.length) return;

    getHelpPopover();

    helpButtons.forEach((button) => {
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-controls', POPOVER_ID);

        button.addEventListener('mouseenter', () => {
            if (isHelpPinned && activeHelpTrigger !== button) return;
            openHelpPopover(button);
        });

        button.addEventListener('mouseleave', scheduleHelpPopoverClose);

        button.addEventListener('focus', () => {
            if (isHelpPinned && activeHelpTrigger !== button) return;
            openHelpPopover(button);
        });

        button.addEventListener('blur', scheduleHelpPopoverClose);

        button.addEventListener('click', (event) => {
            event.stopPropagation();
            openHelpPopover(button, { pinned: true });
        });
    });

    const popover = getHelpPopover();

    popover.addEventListener('mouseenter', clearHelpCloseTimer);
    popover.addEventListener('mouseleave', scheduleHelpPopoverClose);
    popover.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.addEventListener('click', (event) => {
        if (popover.hidden) return;
        if (popover.contains(event.target) || activeHelpTrigger?.contains(event.target)) return;

        closeHelpPopover();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !activeHelpTrigger) return;
        closeHelpPopover({ restoreFocus: true });
    });

    window.addEventListener('resize', repositionActivePopover);
    window.addEventListener('scroll', repositionActivePopover, true);
}

function initActivationModal(page) {
    const modal = document.querySelector('[data-registration-activation-modal]');
    if (!modal) return;

    const openButtons = Array.from(page.querySelectorAll('[data-registration-activation-open]'));
    const closeButtons = Array.from(modal.querySelectorAll('[data-registration-activation-close]'));
    const firstCloseButton = closeButtons[0] || null;
    const isOpen = () => !modal.hidden && modal.classList.contains('is-open');

    const openActivationModal = (trigger) => {
        if (isOpen()) return;

        activeActivationModalTrigger = trigger;
        document.body.classList.add('is-cabinet-modal-open');
        openModalLayer(modal);
        firstCloseButton?.focus({ preventScroll: true });
    };

    const closeActivationModal = ({ restoreFocus = false } = {}) => {
        if (!isOpen()) return;

        const trigger = activeActivationModalTrigger;
        activeActivationModalTrigger = null;

        closeModalLayer(modal, {
            afterClose: () => {
                document.body.classList.remove('is-cabinet-modal-open');
                if (restoreFocus) trigger?.focus({ preventScroll: true });
            },
        });
    };

    openButtons.forEach((button) => {
        button.addEventListener('click', () => {
            openActivationModal(button);
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            closeActivationModal({ restoreFocus: true });
        });
    });

    modal.addEventListener('click', (event) => {
        if (event.target !== modal) return;
        closeActivationModal({ restoreFocus: true });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !isOpen()) return;
        closeActivationModal({ restoreFocus: true });
    });
}

export function initCabinetRegistrationPage() {
    const page = document.querySelector('.registration-page, .cabinet-page--registration');
    if (!page) return;

    initRegistrationViews(page);
    initActivationModal(page);
    initHelpButtons(page);
}
