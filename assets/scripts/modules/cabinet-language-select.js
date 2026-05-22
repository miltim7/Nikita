import { closeModalLayer, openModalLayer } from './modal-transition.js';

const ASSET_PATH = 'assets/images/cabinet-modals/';

const LANGUAGES = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'ky', label: 'Кыргыз тили', short: 'KG' },
    { code: 'ru', label: 'Русский', short: 'RU' },
];

function createLanguagePopover() {
    const popover = document.createElement('div');
    popover.className = 'cabinet-language-popover';
    popover.hidden = true;
    popover.setAttribute('role', 'listbox');
    popover.setAttribute('aria-label', 'Выбор языка');
    popover.setAttribute('data-cabinet-language-popover', '');

    popover.innerHTML = LANGUAGES.map((language) => `
        <button class="cabinet-language-popover__item${language.code === 'ky' ? ' is-active' : ''}" type="button" role="option" data-cabinet-language-option="${language.code}" aria-selected="${language.code === 'ky'}">
            <span class="cabinet-language-popover__flag cabinet-language-popover__flag--${language.code}" aria-hidden="true">
                <img class="cabinet-language-popover__flag-img" src="${ASSET_PATH}flag-${language.code}.png" alt="">
            </span>
            <span>${language.label}</span>
        </button>
    `).join('');

    document.body.append(popover);
    return popover;
}

export function initCabinetLanguageSelect() {
    const triggers = document.querySelectorAll('[data-cabinet-language-open]');
    if (!triggers.length) return;

    const popover = document.querySelector('[data-cabinet-language-popover]') || createLanguagePopover();
    let activeTrigger = null;

    const setPosition = () => {
        if (!activeTrigger || popover.hidden) return;

        const triggerRect = activeTrigger.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const viewportPadding = 8;
        const left = Math.max(
            viewportPadding,
            Math.min(triggerRect.left, window.innerWidth - popoverRect.width - viewportPadding),
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

    const setLanguage = (code) => {
        const language = LANGUAGES.find((item) => item.code === code);
        if (!language) return;

        document.querySelectorAll('[data-cabinet-language-open]').forEach((trigger) => {
            trigger.querySelector('[data-cabinet-language-label]').textContent = language.short;
            trigger.querySelector('[data-cabinet-language-flag]').dataset.cabinetLanguageFlag = code;
        });

        popover.querySelectorAll('[data-cabinet-language-option]').forEach((option) => {
            const isCurrent = option.dataset.cabinetLanguageOption === code;
            option.classList.toggle('is-active', isCurrent);
            option.setAttribute('aria-selected', String(isCurrent));
        });
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
        trigger.setAttribute('aria-haspopup', 'listbox');
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
        const option = event.target.closest('[data-cabinet-language-option]');
        if (!option) return;

        event.preventDefault();
        setLanguage(option.dataset.cabinetLanguageOption);
        closePopover(true);
    });
}
