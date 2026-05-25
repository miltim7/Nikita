import { closeModalLayer, openModalLayer } from './modal-transition.js';

const ASSET_PATH = new URL('../../images/cabinet-modals/', import.meta.url).href;

const LANGUAGES = [
    { code: 'ru', short: 'RU', label: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439' },
    { code: 'ky', short: 'KG', label: '\u041a\u044b\u0440\u0433\u044b\u0437\u0447\u0430' },
    { code: 'en', short: 'EN', label: 'English' },
];
const POPOVER_LABELS = {
    ru: '\u0412\u044b\u0431\u043e\u0440 \u044f\u0437\u044b\u043a\u0430',
    en: 'Language selection',
    ky: '\u0422\u0438\u043b \u0442\u0430\u043d\u0434\u043e\u043e',
};

function getCurrentLocale() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.includes('en')) return 'en';
    if (segments.includes('ky')) return 'ky';
    return 'ru';
}

function getCurrentPageName() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const last = segments.at(-1);
    return last && last.endsWith('.html') ? last : 'index.html';
}

function getLocaleHref(code) {
    const current = getCurrentLocale();
    const page = getCurrentPageName();
    const suffix = `${window.location.search}${window.location.hash}`;

    if (code === current) return null;
    if (current === 'ru') return `${code}/${page}${suffix}`;
    if (code === 'ru') return `../${page}${suffix}`;
    return `../${code}/${page}${suffix}`;
}

function createLanguagePopover() {
    const currentLocale = getCurrentLocale();
    const popover = document.createElement('div');
    popover.className = 'topbar-language-popover';
    popover.hidden = true;
    popover.setAttribute('role', 'listbox');
    popover.setAttribute('aria-label', POPOVER_LABELS[currentLocale]);
    popover.setAttribute('data-topbar-language-popover', '');

    popover.innerHTML = LANGUAGES.map((language) => `
        <button class="topbar-language-popover__item${language.code === currentLocale ? ' is-active' : ''}" type="button" role="option" data-topbar-language-option="${language.code}" aria-selected="${language.code === currentLocale}">
            <span class="topbar-language-popover__flag" aria-hidden="true">
                <img src="${ASSET_PATH}flag-${language.code}.png" alt="">
            </span>
            <span>${language.label}</span>
        </button>
    `).join('');

    document.body.append(popover);
    return popover;
}

function getTriggerLabel(trigger) {
    return Array.from(trigger.children).find((child) => (
        child.tagName === 'SPAN' && !child.classList.contains('topbar__flag')
    ));
}

function setTriggerFlag(trigger, code) {
    const flag = trigger.querySelector('.topbar__flag');
    if (!flag) return;

    flag.dataset.topbarLanguageFlag = code;
}

export function initTopbarLanguageSelect() {
    const triggers = document.querySelectorAll('.topbar__lang');
    if (!triggers.length) return;

    const popover = document.querySelector('[data-topbar-language-popover]') || createLanguagePopover();
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
        trigger?.setAttribute('aria-expanded', 'false');
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

        triggers.forEach((trigger) => {
            const label = getTriggerLabel(trigger);
            if (label) label.textContent = language.short;
            setTriggerFlag(trigger, code);
        });

        popover.querySelectorAll('[data-topbar-language-option]').forEach((option) => {
            const isCurrent = option.dataset.topbarLanguageOption === code;
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
        trigger.setAttribute('aria-expanded', 'false');
        setLanguage(getCurrentLocale());

        trigger.addEventListener('click', (event) => {
            event.preventDefault();

            if (!popover.hidden && activeTrigger === trigger) {
                trigger.setAttribute('aria-expanded', 'false');
                closePopover(true);
                return;
            }

            triggers.forEach((item) => item.setAttribute('aria-expanded', 'false'));
            trigger.setAttribute('aria-expanded', 'true');
            openPopover(trigger);
        });
    });

    popover.addEventListener('click', (event) => {
        const option = event.target.closest('[data-topbar-language-option]');
        if (!option) return;

        event.preventDefault();
        const href = getLocaleHref(option.dataset.topbarLanguageOption);
        if (href) {
            window.location.href = href;
            return;
        }

        triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
        closePopover(true);
    });
}
