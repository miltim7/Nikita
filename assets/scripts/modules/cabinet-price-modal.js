import { closeModalLayer, openModalLayer } from './modal-transition.js';

const PRICE_ROWS = [
    ['Абхазия', '26,57'],
    ['Азербайджан', '44,50'],
    ['Германия', '26,57'],
    ['Грузия', '44,50'],
    ['Израиль', '44,50'],
    ['Индия', '26,57'],
    ['Италия', '26,57'],
    ['Казахстан (Altel)', '22,17'],
    ['Казахстан (Beeline)', '24,08'],
    ['Казахстан (Kcell)', '23,41'],
    ['Казахстан (Tele2)', '22,17'],
    ['Китай', '15,27'],
    ['Кыргызстан (Beeline)', 'Рекламный - 3,04\nСервисный - 1,67\nТранзакционный - 1,45', true],
    ['Кыргызстан (MegaCom)', '1,30'],
    ['Кыргызстан (O!)', '1,66'],
    ['ОАЭ', '26,57'],
    ['Россия', '33,78'],
    ['США и Канада', '15,27'],
    ['Таджикистан', '44,50'],
    ['Турция', '26,57'],
    ['Узбекистан', '44,50'],
    ['Украина', '18,53'],
    ['Швейцария', '44,50'],
    ['Швеция', '15,27'],
];

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderPrice(value) {
    const lines = String(value).split('\n');
    if (lines.length === 1) {
        return escapeHtml(value);
    }

    return `<span class="cabinet-price-modal__price-lines">${lines.map((line) => `<span>${escapeHtml(line)}</span>`).join('')}</span>`;
}

function renderRows() {
    return PRICE_ROWS.map(([country, price, isTall]) => `
        <tr${isTall ? ' class="is-tall"' : ''}>
            <td>${escapeHtml(country)}</td>
            <td>${renderPrice(price)}</td>
        </tr>
    `).join('');
}

function createPriceModal() {
    const modal = document.createElement('div');
    modal.className = 'cabinet-modal cabinet-price-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'cabinetPriceModalTitle');
    modal.setAttribute('data-cabinet-price-modal', '');

    modal.innerHTML = `
        <section class="cabinet-price-modal__dialog" role="document" tabindex="-1">
            <div class="cabinet-price-modal__head">
                <h2 class="cabinet-price-modal__title" id="cabinetPriceModalTitle">Стоимость SMS <br class="cabinet-price-modal__mobile-break">(валюта расчётов: сом)</h2>
                <button class="cabinet-price-modal__close" type="button" aria-label="Закрыть" data-cabinet-price-close>
                    <svg class="cabinet-icon" aria-hidden="true"><use href="assets/images/cabinet-icons.svg#icon-modal-close"></use></svg>
                </button>
            </div>
            <div class="cabinet-price-modal__table-wrap">
                <table class="cabinet-price-modal__table" aria-label="Стоимость SMS по странам">
                    <thead>
                        <tr>
                            <th scope="col">
                                <span class="cabinet-price-modal__th-content">Страна <svg class="cabinet-price-modal__sort" aria-hidden="true"><use href="assets/images/cabinet-icons.svg#icon-table-sort"></use></svg></span>
                            </th>
                            <th scope="col">
                                <span class="cabinet-price-modal__th-content">Стоимость <svg class="cabinet-price-modal__sort" aria-hidden="true"><use href="assets/images/cabinet-icons.svg#icon-table-sort"></use></svg></span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderRows()}
                    </tbody>
                </table>
            </div>
            <div class="cabinet-price-modal__actions">
                <button class="cabinet-price-modal__button cabinet-price-modal__button--secondary" type="button" data-cabinet-price-change>Сменить тариф</button>
                <button class="cabinet-price-modal__button cabinet-price-modal__button--primary" type="button" data-cabinet-price-close>Закрыть</button>
            </div>
        </section>
    `;

    document.body.append(modal);
    return modal;
}

export function initCabinetPriceModal() {
    const triggers = document.querySelectorAll('[data-cabinet-price-open]');
    if (!triggers.length) return;

    const modal = document.querySelector('[data-cabinet-price-modal]') || createPriceModal();
    const dialog = modal.querySelector('.cabinet-price-modal__dialog');
    const changeButton = modal.querySelector('[data-cabinet-price-change]');
    let activeTrigger = null;

    const getFocusable = () => Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter((node) => node.offsetParent !== null || node === document.activeElement);

    const closeModal = () => {
        const trigger = activeTrigger;
        document.removeEventListener('keydown', handleKeydown);

        closeModalLayer(modal, {
            afterClose: () => {
                document.body.classList.remove('is-cabinet-modal-open');
                trigger?.focus?.({ preventScroll: true });
                activeTrigger = null;
            }
        });
    };

    const openModal = (trigger) => {
        activeTrigger = trigger;
        document.body.classList.add('is-cabinet-modal-open');
        openModalLayer(modal);
        document.addEventListener('keydown', handleKeydown);
        dialog?.focus({ preventScroll: true });
    };

    function handleKeydown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
            return;
        }

        if (event.key !== 'Tab') return;

        const focusable = getFocusable();
        if (!focusable.length) {
            event.preventDefault();
            dialog?.focus({ preventScroll: true });
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    triggers.forEach((trigger) => {
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            openModal(trigger);
        });
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.closest('[data-cabinet-price-close]')) {
            event.preventDefault();
            closeModal();
        }
    });

    changeButton?.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('cabinet:set-section', {
            detail: { section: 'billing' },
        }));
        closeModal();
    });

    if (window.location.hash === '#sms-price') {
        openModal(triggers[0]);
    }
}
