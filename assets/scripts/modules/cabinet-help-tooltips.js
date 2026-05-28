import { closeModalLayer, openModalLayer } from './modal-transition.js';

const VIEWPORT_PADDING = 12;

const FINANCE_TOOLTIP_TEXT = {
    ru: 'Текущий отчётный период, за который отображаются данные счёта.',
    en: 'The current reporting period used for account data.',
    ky: 'Эсеп маалыматтары көрсөтүлгөн учурдагы отчеттук мезгил.',
};

function getCurrentLocale() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.includes('en')) return 'en';
    if (segments.includes('ky')) return 'ky';
    return 'ru';
}

function createTooltip(id) {
    const tooltip = document.createElement('div');
    tooltip.className = 'cabinet-help-tooltip';
    tooltip.id = id;
    tooltip.hidden = true;
    tooltip.setAttribute('role', 'tooltip');
    document.body.append(tooltip);
    return tooltip;
}

function positionTooltip(trigger, tooltip) {
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const preferredLeft = triggerRect.right - tooltipRect.width;
    const maxLeft = window.innerWidth - tooltipRect.width - VIEWPORT_PADDING;
    const left = Math.max(VIEWPORT_PADDING, Math.min(preferredLeft, maxLeft));
    const belowTop = triggerRect.bottom + 8;
    const aboveTop = triggerRect.top - tooltipRect.height - 8;
    const preferredTop = belowTop + tooltipRect.height <= window.innerHeight - VIEWPORT_PADDING
        ? belowTop
        : aboveTop;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.max(VIEWPORT_PADDING, preferredTop)}px`;
}

function bindFloatingHelpTooltips({
    triggerSelector,
    tooltipId,
    contentGetter,
    prepareTrigger = null,
}) {
    const triggers = Array.from(document.querySelectorAll(triggerSelector));
    if (!triggers.length) return;

    let tooltip = null;
    let activeTrigger = null;
    let isPinned = false;
    let closeTimer = null;

    const getTooltip = () => {
        tooltip = tooltip || document.getElementById(tooltipId) || createTooltip(tooltipId);
        return tooltip;
    };

    const clearCloseTimer = () => {
        if (!closeTimer) return;
        window.clearTimeout(closeTimer);
        closeTimer = null;
    };

    const closeTooltip = ({ restoreFocus = false } = {}) => {
        const currentTooltip = getTooltip();
        if (currentTooltip.hidden && !currentTooltip.classList.contains('is-open')) return;

        clearCloseTimer();
        isPinned = false;

        const trigger = activeTrigger;
        activeTrigger = null;
        trigger?.classList.remove('is-active');
        trigger?.setAttribute('aria-expanded', 'false');

        closeModalLayer(currentTooltip, {
            afterClose: () => {
                currentTooltip.textContent = '';
            },
        });

        if (restoreFocus) trigger?.focus?.({ preventScroll: true });
    };

    const scheduleClose = () => {
        clearCloseTimer();
        if (isPinned) return;

        closeTimer = window.setTimeout(() => {
            closeTooltip();
        }, 120);
    };

    const openTooltip = (trigger, { pinned = false } = {}) => {
        const content = contentGetter(trigger);
        if (!content) return;

        clearCloseTimer();

        const currentTooltip = getTooltip();

        if (activeTrigger && activeTrigger !== trigger) {
            activeTrigger.classList.remove('is-active');
            activeTrigger.setAttribute('aria-expanded', 'false');
        }

        activeTrigger = trigger;
        isPinned = pinned;
        currentTooltip.textContent = content;
        currentTooltip.hidden = false;
        positionTooltip(trigger, currentTooltip);
        openModalLayer(currentTooltip);

        trigger.classList.add('is-active');
        trigger.setAttribute('aria-expanded', 'true');
    };

    const repositionActiveTooltip = () => {
        if (!activeTrigger || !tooltip || tooltip.hidden) return;
        positionTooltip(activeTrigger, tooltip);
    };

    triggers.forEach((trigger) => {
        prepareTrigger?.(trigger, tooltipId);

        trigger.addEventListener('mouseenter', () => {
            if (isPinned && activeTrigger !== trigger) return;
            openTooltip(trigger);
        });

        trigger.addEventListener('mouseleave', scheduleClose);

        trigger.addEventListener('focus', () => {
            if (isPinned && activeTrigger !== trigger) return;
            openTooltip(trigger);
        });

        trigger.addEventListener('blur', scheduleClose);

        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            openTooltip(trigger, { pinned: true });
        });

        trigger.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            openTooltip(trigger, { pinned: true });
        });
    });

    const currentTooltip = getTooltip();
    currentTooltip.addEventListener('mouseenter', clearCloseTimer);
    currentTooltip.addEventListener('mouseleave', scheduleClose);

    document.addEventListener('click', (event) => {
        if (currentTooltip.hidden) return;
        if (currentTooltip.contains(event.target) || activeTrigger?.contains(event.target)) return;
        closeTooltip();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !activeTrigger) return;
        closeTooltip({ restoreFocus: true });
    });

    document.addEventListener('cabinet:close-floating-help-tooltips', () => {
        closeTooltip();
    });

    window.addEventListener('resize', repositionActiveTooltip);
    window.addEventListener('scroll', repositionActiveTooltip, true);
}

function initFinanceHelpTooltips() {
    const locale = getCurrentLocale();

    bindFloatingHelpTooltips({
        triggerSelector: '.cabinet-finance__help',
        tooltipId: 'cabinetFinanceHelpTooltip',
        contentGetter: () => FINANCE_TOOLTIP_TEXT[locale] || FINANCE_TOOLTIP_TEXT.ru,
        prepareTrigger: (trigger, tooltipId) => {
            trigger.removeAttribute('aria-hidden');
            trigger.setAttribute('role', 'button');
            trigger.setAttribute('tabindex', '0');
            trigger.setAttribute('aria-label', FINANCE_TOOLTIP_TEXT[locale] || FINANCE_TOOLTIP_TEXT.ru);
            trigger.setAttribute('aria-expanded', 'false');
            trigger.setAttribute('aria-describedby', tooltipId);
        },
    });
}

function initMailingMessageHelpTooltips() {
    bindFloatingHelpTooltips({
        triggerSelector: '[data-mailing-message-help], [data-mailing-message-tag-help]',
        tooltipId: 'cabinetMailingMessageHelpTooltip',
        contentGetter: (trigger) => trigger.getAttribute('aria-label')?.trim() || '',
        prepareTrigger: (trigger, tooltipId) => {
            trigger.setAttribute('aria-expanded', 'false');
            trigger.setAttribute('aria-describedby', tooltipId);
        },
    });
}

export function initCabinetHelpTooltips() {
    initFinanceHelpTooltips();
    initMailingMessageHelpTooltips();
}
