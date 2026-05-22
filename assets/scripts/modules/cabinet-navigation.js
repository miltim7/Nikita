import { closeModalLayer, openModalLayer } from './modal-transition.js';

const CABINET_SECTIONS = {
    dashboard: { label: 'Главная', icon: 'icon-nav-widget' },
    mailings: { label: 'Рассылки', icon: 'icon-nav-email' },
    lists: { label: 'Списки', icon: 'icon-nav-docs' },
    api: { label: 'API-интеграция', icon: 'icon-nav-sliders' },
    reports: { label: 'Отчёты', icon: 'icon-nav-stats' },
    otp: { label: 'Сервис OTP', icon: 'icon-nav-verify' },
    templates: { label: 'Шаблоны', icon: 'icon-nav-template' },
    billing: { label: 'Условия и цены', icon: 'icon-nav-money' },
    memory: { label: 'Технические возможности', icon: 'icon-nav-memory' },
    security: { label: 'Надёжность и безопасность', icon: 'icon-nav-protect' },
    help: { label: 'Вопросы и ответы', icon: 'icon-nav-question' },
    contacts: { label: 'Контакты', icon: 'icon-nav-phone' },
    support: { label: 'Техподдержка', icon: 'icon-support' },
    manager: { label: 'Менеджер', icon: 'icon-chat' },
    referral: { label: 'Реферальная программа', icon: 'icon-referral' },
    profile: { label: 'Мой профиль', icon: 'icon-nav-widget' },
    notifications: { label: 'Уведомления', icon: 'icon-bell' },
    menu: { label: 'Меню', icon: 'icon-nav-burger' },
};

function normalizeSection(section) {
    return CABINET_SECTIONS[section] ? section : 'dashboard';
}

function getSectionFromHash() {
    return normalizeSection(window.location.hash.replace('#', ''));
}

function getInitialSection() {
    return document.body.dataset.cabinetCurrentSection
        ? normalizeSection(document.body.dataset.cabinetCurrentSection)
        : getSectionFromHash();
}

function isSamePageLink(item) {
    const url = new URL(item.href, window.location.href);
    return url.pathname === window.location.pathname && url.search === window.location.search;
}

export function initCabinetNavigation() {
    const navItems = document.querySelectorAll('[data-cabinet-nav]');
    if (!navItems.length) return;

    const dashboard = document.querySelector('[data-cabinet-panel="dashboard"]');
    const placeholder = document.querySelector('[data-cabinet-placeholder]');

    const setActiveSection = (section) => {
        const current = normalizeSection(section);

        navItems.forEach((item) => {
            const isCurrent = item.dataset.section === current;
            item.classList.toggle('is-active', isCurrent);
            if (isCurrent) {
                item.setAttribute('aria-current', 'page');
            } else {
                item.removeAttribute('aria-current');
            }
        });
    };

    navItems.forEach((item) => {
        item.addEventListener('click', (event) => {
            if (!isSamePageLink(item)) return;

            if (item.hasAttribute('data-cabinet-price-open')) {
                event.preventDefault();
                return;
            }

            event.preventDefault();
            setActiveSection(item.dataset.section);
        });
    });

    document.addEventListener('cabinet:set-section', (event) => {
        setActiveSection(event.detail?.section);
    });

    if (dashboard) {
        dashboard.hidden = false;
    }

    if (placeholder) {
        placeholder.hidden = true;
    }

    setActiveSection(getInitialSection());
}

export function initCabinetSidepanel() {
    const sidepanel = document.querySelector('[data-cabinet-sidepanel]');
    const toggle = document.querySelector('[data-cabinet-sidepanel-toggle]');
    if (!sidepanel || !toggle) return;

    const top = sidepanel.querySelector('.cabinet-sidepanel__top');
    const bottom = sidepanel.querySelector('.cabinet-sidepanel__bottom');

    const setExpanded = (expanded) => {
        sidepanel.classList.toggle('cabinet-sidepanel--full', expanded);
        sidepanel.classList.toggle('cabinet-sidepanel--full-short', !expanded);
        document.body.classList.toggle('is-cabinet-sidepanel-open', expanded);

        top?.classList.toggle('cabinet-sidepanel__top--expanded', expanded);
        top?.classList.toggle('cabinet-sidepanel__top--short', !expanded);
        bottom?.classList.toggle('cabinet-sidepanel__bottom--full', expanded);
        bottom?.classList.toggle('cabinet-sidepanel__bottom--full-short', !expanded);

        toggle.classList.toggle('cabinet-sidepanel__toggle--wide', expanded);
        toggle.classList.toggle('cabinet-sidepanel__toggle--short', !expanded);
        toggle.classList.toggle('cabinet-sidepanel__toggle--collapse', expanded);
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.setAttribute('aria-label', expanded ? 'Свернуть меню' : 'Развернуть меню');
    };

    toggle.addEventListener('click', () => {
        setExpanded(!sidepanel.classList.contains('cabinet-sidepanel--full'));
    });

    setExpanded(sidepanel.classList.contains('cabinet-sidepanel--full'));
}

export function initCabinetTabbarModal() {
    const modal = document.querySelector('[data-cabinet-tabbar-modal]');
    const toggle = document.querySelector('[data-cabinet-tabbar-toggle]');
    if (!modal || !toggle) return;

    const closeButtons = modal.querySelectorAll('[data-cabinet-tabbar-close]');

    const isOpen = () => !modal.hidden && modal.classList.contains('is-open');

    const setOpen = (open) => {
        if (open) {
            openModalLayer(modal);
        } else {
            closeModalLayer(modal);
        }

        toggle.classList.toggle('is-active', open);
        toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(!isOpen());
    });

    closeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setOpen(false);
        });
    });

    modal.addEventListener('click', (event) => {
        if (event.target.closest('[data-cabinet-nav]')) {
            setOpen(false);
        }
    });

    document.addEventListener('click', (event) => {
        if (!isOpen()) return;
        if (modal.contains(event.target) || toggle.contains(event.target)) return;
        setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setOpen(false);
        }
    });
}

export function initCabinetThemeToggle() {
    const buttons = document.querySelectorAll('[data-theme-toggle], [data-cabinet-theme-button]');
    if (!buttons.length) return;

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const group = button.closest('[role="group"]') ?? document;
            const groupButtons = group.querySelectorAll('[data-theme-toggle], [data-cabinet-theme-button]');

            groupButtons.forEach((item) => {
                const isCurrent = item === button;
                item.classList.toggle('is-active', isCurrent);
                item.setAttribute('aria-pressed', String(isCurrent));
            });
        });
    });
}
