import { closeModalLayer, openModalLayer } from './modal-transition.js';

const ASSET_PATH = 'assets/images/cabinet-modals/';
const MANAGER_POPOVER_OFFSET = 24;

const TELEGRAM_ICON = `
    <span class="cabinet-manager-popover__social-icon" aria-hidden="true">
        <img class="cabinet-manager-popover__social-icon-base" src="${ASSET_PATH}support-telegram-bg.svg" alt="">
        <img class="cabinet-manager-popover__social-icon-mark cabinet-manager-popover__social-icon-mark--telegram" src="${ASSET_PATH}support-telegram-mark.svg" alt="">
    </span>
`;

const WHATSAPP_ICON = `
    <span class="cabinet-manager-popover__social-icon" aria-hidden="true">
        <img class="cabinet-manager-popover__social-icon-base" src="${ASSET_PATH}support-whatsapp-bg.svg" alt="">
        <img class="cabinet-manager-popover__social-icon-mark cabinet-manager-popover__social-icon-mark--whatsapp" src="${ASSET_PATH}support-whatsapp-mark.svg" alt="">
    </span>
`;

const PHONE_ICON = `
    <img class="cabinet-manager-popover__phone-svg" src="${ASSET_PATH}support-phone.svg" alt="" aria-hidden="true">
`;

function createManagerPopover() {
    const popover = document.createElement('div');
    popover.className = 'cabinet-manager-popover';
    popover.hidden = true;
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Есть вопросы?');
    popover.setAttribute('data-cabinet-manager-popover', '');

    popover.innerHTML = `
        <div class="cabinet-manager-popover__head">
            <strong>Есть вопросы?</strong>
            <button class="cabinet-manager-popover__close" type="button" aria-label="Закрыть" data-cabinet-manager-close>
                <img class="cabinet-manager-popover__close-icon" src="${ASSET_PATH}support-close.svg" alt="" aria-hidden="true">
            </button>
        </div>
        <p class="cabinet-manager-popover__text">Обратитесь к специалисту<br>технической поддержки:</p>
        <a class="cabinet-manager-popover__social cabinet-manager-popover__social--telegram" href="https://t.me/" target="_blank" rel="noopener">
            ${TELEGRAM_ICON}
            <span>Через Telegram</span>
        </a>
        <a class="cabinet-manager-popover__social cabinet-manager-popover__social--whatsapp" href="https://wa.me/996700892188" target="_blank" rel="noopener">
            ${WHATSAPP_ICON}
            <span>Через WhatsApp</span>
        </a>
        <p class="cabinet-manager-popover__text">или позвоните:</p>
        <a class="cabinet-manager-popover__phone" href="tel:+996700892188">
            <span class="cabinet-manager-popover__phone-icon">
                ${PHONE_ICON}
            </span>
            <span>+996 (700) 892-188</span>
        </a>
    `;

    document.body.append(popover);
    return popover;
}

export function initCabinetManagerPopover() {
    const triggers = document.querySelectorAll('[data-cabinet-manager-open]');
    if (!triggers.length) return;

    const popover = document.querySelector('[data-cabinet-manager-popover]') || createManagerPopover();
    let activeTrigger = null;

    const setPosition = () => {
        if (!activeTrigger || popover.hidden) return;

        const triggerRect = activeTrigger.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const viewportPadding = 8;
        const desiredLeft = triggerRect.left - 12;
        const maxLeft = window.innerWidth - popoverRect.width - viewportPadding;
        const left = Math.max(viewportPadding, Math.min(desiredLeft, maxLeft));
        const top = Math.min(
            triggerRect.bottom + MANAGER_POPOVER_OFFSET,
            window.innerHeight - popoverRect.height - viewportPadding,
        );

        popover.style.left = `${left}px`;
        popover.style.top = `${Math.max(viewportPadding, top)}px`;
    };

    const closePopover = (restoreFocus = false) => {
        if (popover.hidden && !popover.classList.contains('is-open')) return;

        const trigger = activeTrigger;
        document.removeEventListener('click', handleDocumentClick);
        document.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('resize', setPosition);
        window.removeEventListener('scroll', setPosition, true);

        activeTrigger = null;
        closeModalLayer(popover, {
            afterClose: () => {
                if (restoreFocus) trigger?.focus?.({ preventScroll: true });
            },
        });
    };

    const openPopover = (trigger) => {
        activeTrigger = trigger;
        popover.hidden = false;
        setPosition();
        openModalLayer(popover);
        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('keydown', handleKeydown);
        window.addEventListener('resize', setPosition);
        window.addEventListener('scroll', setPosition, true);
    };

    function handleDocumentClick(event) {
        if (popover.contains(event.target) || activeTrigger?.contains(event.target)) return;
        closePopover();
    }

    function handleKeydown(event) {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        closePopover(true);
    }

    triggers.forEach((trigger) => {
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.addEventListener('click', (event) => {
            event.preventDefault();

            if (!popover.hidden && activeTrigger === trigger) {
                closePopover(true);
                return;
            }

            openPopover(trigger);
        });
    });

    popover.addEventListener('click', (event) => {
        if (event.target.closest('[data-cabinet-manager-close]')) {
            event.preventDefault();
            closePopover(true);
        }
    });
}
