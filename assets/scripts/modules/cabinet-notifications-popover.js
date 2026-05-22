import { closeModalLayer, openModalLayer } from './modal-transition.js';

const ASSET_PATH = 'assets/images/cabinet-modals/';

const NOTIFICATIONS = [
    {
        type: 'success',
        time: '12:00',
        text: 'Пример уведомления об успешно завершённом процесса, пример ',
        link: 'ссылки',
        after: ' в уведомдении',
    },
    {
        type: 'error',
        time: '12:00',
        text: 'Пример уведомления об ошибке',
    },
    {
        type: 'info',
        time: '12:00',
        text: 'Пример нейтрального уведомления',
    },
    {
        type: 'success',
        time: '12:00',
        text: 'Пример уведомления об успешно завершённом процесса, пример ',
        link: 'ссылки',
        after: ' в уведомдении',
    },
    {
        type: 'error',
        time: '12:00',
        text: 'Пример уведомления об ошибке',
    },
];

const ICONS = {
    success: `<img class="cabinet-notifications-popover__icon-svg" src="${ASSET_PATH}notification-success.svg" alt="" aria-hidden="true">`,
    error: `<img class="cabinet-notifications-popover__icon-svg" src="${ASSET_PATH}notification-error.svg" alt="" aria-hidden="true">`,
    info: `<img class="cabinet-notifications-popover__icon-svg" src="${ASSET_PATH}notification-info.svg" alt="" aria-hidden="true">`,
};

function createNotificationItem(item) {
    const link = item.link
        ? `<a class="cabinet-notifications-popover__link" href="notifications.html">${item.link}</a><span>${item.after}</span>`
        : '';

    return `
        <div class="cabinet-notifications-popover__item cabinet-notifications-popover__item--${item.type}">
            <span class="cabinet-notifications-popover__icon">${ICONS[item.type]}</span>
            <span class="cabinet-notifications-popover__body">
                <span class="cabinet-notifications-popover__time">${item.time}</span>
                <span class="cabinet-notifications-popover__text"><span>${item.text}</span>${link}</span>
            </span>
        </div>
    `;
}

function createNotificationsPopover() {
    const popover = document.createElement('div');
    popover.className = 'cabinet-notifications-popover';
    popover.hidden = true;
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Уведомления');
    popover.setAttribute('data-cabinet-notifications-popover', '');

    popover.innerHTML = `
        <div class="cabinet-notifications-popover__list">
            ${NOTIFICATIONS.map(createNotificationItem).join('')}
        </div>
        <div class="cabinet-notifications-popover__footer">
            <a class="cabinet-notifications-popover__all" href="notifications.html">
                <span>Все уведомления</span>
                <span class="cabinet-notifications-popover__arrow-frame" aria-hidden="true">
                    <img class="cabinet-notifications-popover__arrow" src="${ASSET_PATH}notification-arrow.svg" alt="">
                </span>
            </a>
        </div>
    `;

    document.body.append(popover);
    return popover;
}

export function initCabinetNotificationsPopover() {
    const triggers = document.querySelectorAll('[data-cabinet-notifications-open]');
    if (!triggers.length) return;

    const popover = document.querySelector('[data-cabinet-notifications-popover]') || createNotificationsPopover();
    let activeTrigger = null;

    const setPosition = () => {
        if (!activeTrigger || popover.hidden) return;

        const triggerRect = activeTrigger.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const viewportPadding = 8;
        const desiredLeft = triggerRect.right - popoverRect.width;
        const left = Math.max(
            viewportPadding,
            Math.min(desiredLeft, window.innerWidth - popoverRect.width - viewportPadding),
        );
        const top = Math.min(
            triggerRect.bottom + 8,
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
        if (!event.target.closest('.cabinet-notifications-popover__all')) return;
        closePopover();
    });
}
