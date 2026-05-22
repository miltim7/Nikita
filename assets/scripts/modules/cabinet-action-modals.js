import { closeModalLayer, openModalLayer } from './modal-transition.js';

const ASSET_PATH = 'assets/images/cabinet-modals/';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

const MODAL_HASHES = {
    '#demo-mode': 'demo-mode',
    '#quick-sms': 'quick-sms',
    '#payment': 'payment-method',
    '#payment-method': 'payment-method',
    '#payment-phone': 'payment-phone',
    '#payment-confirm': 'payment-confirm',
    '#sender-name': 'sender-name',
    '#confirm-action': 'confirm-action',
};

function spriteIcon(symbol, className = '') {
    return `<svg class="cabinet-action-modal__sprite ${className}" aria-hidden="true"><use href="assets/images/cabinet-icons.svg#${symbol}"></use></svg>`;
}

function closeButton() {
    return `
        <button class="cabinet-action-modal__close" type="button" aria-label="Закрыть" data-cabinet-action-close>
            <svg class="cabinet-icon" aria-hidden="true"><use href="assets/images/cabinet-icons.svg#icon-modal-close"></use></svg>
        </button>
    `;
}

function modalShell(id, title, body, options = {}) {
    const titleId = `cabinetActionModalTitle-${id}`;
    const indicator = options.indicator ? '<span class="cabinet-action-modal__indicator" aria-hidden="true"></span>' : '';

    return `
        <section class="cabinet-action-modal__dialog cabinet-action-modal__dialog--${id}" role="document" tabindex="-1">
            <div class="cabinet-action-modal__head">
                <div class="cabinet-action-modal__title-wrap">
                    ${indicator}
                    <h2 class="cabinet-action-modal__title" id="${titleId}">${title}</h2>
                </div>
                ${closeButton()}
            </div>
            ${body}
        </section>
    `;
}

function demoModeTemplate() {
    return modalShell('demo-mode', 'Тестовый режим', `
        <div class="cabinet-demo-mode__rows">
            <div class="cabinet-demo-mode__row">
                <span>Массовые рассылки</span>
                <strong>Отключены</strong>
            </div>
            <div class="cabinet-demo-mode__row cabinet-demo-mode__row--tall">
                <span>Отправка SMS <br>в разделе <b>“Быстрая отправка SMS”</b></span>
                <strong>Ограничена <small>(отправка SMS только на номер, указанный в профиле</small></strong>
            </div>
            <div class="cabinet-demo-mode__row cabinet-demo-mode__row--tall">
                <span>Работа <br class="cabinet-action-modal__mobile-only">по API/SMPP</span>
                <strong>Ограничена <small>(отправка SMS только на номер, указанный в профиле</small></strong>
            </div>
        </div>
        <div class="cabinet-demo-mode__actions">
            <p>Для перехода в рабочий режим <strong>заполните форму</strong> <br class="cabinet-action-modal__desktop-only">на согласование имени отправителя</p>
            <button class="cabinet-modal-button cabinet-modal-button--primary cabinet-demo-mode__download" type="button">
                ${spriteIcon('icon-action-download', 'cabinet-action-modal__asset--button')}
                <span>Скачать форму</span>
            </button>
        </div>
    `);
}

function quickSmsTemplate() {
    return modalShell('quick-sms', 'Быстрая отправка SMS', `
        <form class="cabinet-quick-sms" action="#" method="post" data-cabinet-quick-form>
            <div class="cabinet-quick-sms__field cabinet-quick-sms__field--sender">
                <div class="cabinet-quick-sms__sender-top">
                    <label class="cabinet-action-label" for="cabinetQuickSender">От кого:</label>
                    <button class="cabinet-quick-sms__add-name" type="button" data-cabinet-modal-open="sender-name">
                        ${spriteIcon('icon-action-plus', 'cabinet-quick-sms__plus')}
                        <span>Добавить имя</span>
                        ${spriteIcon('icon-action-help', 'cabinet-quick-sms__help')}
                    </button>
                </div>
                <div class="cabinet-action-select" data-cabinet-sender-select>
                    <button class="cabinet-action-input cabinet-action-input--select" id="cabinetQuickSender" type="button" aria-expanded="false" aria-controls="cabinetQuickSenderMenu" data-cabinet-sender-toggle>
                        <span data-cabinet-sender-value>Выберите имя отправителя</span>
                        ${spriteIcon('icon-chevron', 'cabinet-action-input__chevron')}
                    </button>
                    <div class="cabinet-action-select__menu" id="cabinetQuickSenderMenu" role="listbox" hidden>
                        <button type="button" role="option" data-cabinet-sender-option="Nikita">Nikita</button>
                        <button type="button" role="option" data-cabinet-sender-option="SMSPRO">SMSPRO</button>
                        <button type="button" role="option" data-cabinet-sender-option="Nikita.kg">Nikita.kg</button>
                    </div>
                </div>
            </div>
            <label class="cabinet-quick-sms__field">
                <span class="cabinet-action-label">Кому:</span>
                <input class="cabinet-action-input" type="tel" name="recipient" placeholder="Укажите получателя">
            </label>
            <div class="cabinet-quick-sms__field cabinet-quick-sms__field--message">
                <div class="cabinet-quick-sms__message-head">
                    <label class="cabinet-action-label" for="cabinetQuickMessage">Введите текст сообщения:</label>
                    <div class="cabinet-quick-sms__counter">
                        <span>Символов: <b>11</b></span>
                        <span>Частей SMS: <b>1</b></span>
                    </div>
                </div>
                <textarea class="cabinet-action-input cabinet-action-input--textarea" id="cabinetQuickMessage" name="message">Добрый день! </textarea>
                <div class="cabinet-quick-sms__tools">
                    <button type="button" data-cabinet-translit-message>
                        ${spriteIcon('icon-action-translit')}
                        <span>Перевести в транслит</span>
                    </button>
                    <button type="button" data-cabinet-clear-message>
                        ${spriteIcon('icon-action-clear')}
                        <span>Очистить</span>
                    </button>
                </div>
            </div>
            <div class="cabinet-action-modal__actions">
                <button class="cabinet-modal-button cabinet-modal-button--secondary" type="button" data-cabinet-action-close>Отменить</button>
                <button class="cabinet-modal-button cabinet-modal-button--primary" type="submit">Отправить</button>
            </div>
        </form>
    `);
}

function paymentCard({ label, title, iconSymbol, imageFile, tall = false, nextModal = 'payment-confirm' }) {
    const media = imageFile
        ? `<img class="cabinet-payment-method__logo" src="${ASSET_PATH}${imageFile}" alt="">`
        : spriteIcon(iconSymbol, 'cabinet-payment-method__icon');
    const nextAttr = nextModal ? ` data-payment-next="${nextModal}"` : '';

    return `
        <button class="cabinet-payment-method__card${tall ? ' cabinet-payment-method__card--tall' : ''}" type="button" data-payment-method-card data-payment-title="${title}" aria-pressed="false"${nextAttr}>
            <span class="cabinet-payment-method__media">${media}</span>
            <span>${label}</span>
        </button>
    `;
}

function paymentMethodTemplate() {
    return modalShell('payment-method', 'Пополнение счёта', `
        <div class="cabinet-payment-method">
            <p class="cabinet-payment-method__label">Выберите способ оплаты:</p>
            <div class="cabinet-payment-method__grid">
                ${paymentCard({ label: 'Безналичный<br>расчёт', title: 'Безналичный расчёт', iconSymbol: 'icon-payment-bank' })}
                ${paymentCard({ label: 'Банковские<br>карты', title: 'Банковские карты', iconSymbol: 'icon-payment-card' })}
                ${paymentCard({ label: 'Оплата через<br>Мбанк', title: 'Оплата через Мбанк', imageFile: 'logo-mbank.png', nextModal: 'payment-phone' })}
                ${paymentCard({ label: 'Оплата через ELQR', title: 'Оплата через ELQR', imageFile: 'logo-elqr.png', tall: true })}
                ${paymentCard({ label: 'Оплата<br>через терминалы Pay24', title: 'Оплата через терминалы Pay24', imageFile: 'logo-pay24.png', tall: true })}
                ${paymentCard({ label: 'Оплата через<br>электронный кошелек ЭЛСОМ', title: 'Оплата через электронный кошелек ЭЛСОМ', imageFile: 'logo-elsom.png', tall: true })}
            </div>
        </div>
    `);
}

function paymentPhoneTemplate() {
    return modalShell('payment-phone', 'Пополнение счёта', `
        <form class="cabinet-payment-phone" action="#" method="post" data-cabinet-payment-phone-form>
            <label class="cabinet-payment-phone__field">
                <span class="cabinet-action-label">Введите номер телефона:</span>
                <span class="cabinet-action-input cabinet-action-input--phone">
                    <span class="cabinet-action-input__phone-frame">
                        ${spriteIcon('icon-payment-phone', 'cabinet-action-input__phone')}
                    </span>
                    <input type="tel" name="phone" placeholder="+996 (XXX) XXX-XXX">
                </span>
            </label>
            <div class="cabinet-action-modal__actions cabinet-payment-phone__actions">
                <button class="cabinet-modal-button cabinet-modal-button--secondary" type="button" data-cabinet-modal-open="payment-method">
                    <span class="cabinet-action-modal__icon-frame cabinet-action-modal__icon-frame--arrow">
                        ${spriteIcon('icon-action-arrow-left', 'cabinet-action-modal__asset--button')}
                    </span>
                    <span>Назад</span>
                </button>
                <button class="cabinet-modal-button cabinet-modal-button--primary" type="submit">
                    <span>Подтвердить</span>
                    <span class="cabinet-action-modal__icon-frame cabinet-action-modal__icon-frame--arrow">
                        ${spriteIcon('icon-action-arrow-left', 'cabinet-action-modal__asset--button cabinet-action-modal__asset--arrow-right')}
                    </span>
                </button>
            </div>
        </form>
    `);
}

function paymentConfirmTemplate() {
    return modalShell('payment-confirm', 'Пополнение счёта', `
        <form class="cabinet-payment-confirm" action="#" method="post" data-cabinet-payment-confirm-form>
            <div class="cabinet-payment-confirm__body">
                <span class="cabinet-action-label">Выбран способ оплаты:</span>
                <strong data-payment-confirm-title>Безналичный расчёт</strong>
                <p>Подтвердите выбор способа оплаты, чтобы продолжить пополнение счёта.</p>
            </div>
            <div class="cabinet-action-modal__actions cabinet-payment-confirm__actions">
                <button class="cabinet-modal-button cabinet-modal-button--secondary" type="button" data-cabinet-modal-open="payment-method">
                    <span class="cabinet-action-modal__icon-frame cabinet-action-modal__icon-frame--arrow">
                        ${spriteIcon('icon-action-arrow-left', 'cabinet-action-modal__asset--button')}
                    </span>
                    <span>Назад</span>
                </button>
                <button class="cabinet-modal-button cabinet-modal-button--primary" type="submit">
                    <span>Подтвердить</span>
                </button>
            </div>
        </form>
    `);
}

function senderNameTemplate() {
    return modalShell('sender-name', 'Добавить имя отправителя', `
        <form class="cabinet-sender-name" action="#" method="post" data-cabinet-add-sender-form>
            <label class="cabinet-sender-name__field">
                <span class="cabinet-action-label">Имя отправителя:</span>
                <input class="cabinet-action-input" type="text" name="senderName" placeholder="Введите имя отправителя" maxlength="11" autocomplete="off" required>
            </label>
            <p class="cabinet-sender-name__note">Имя будет добавлено в список отправителей для быстрой отправки SMS.</p>
            <div class="cabinet-action-modal__actions cabinet-sender-name__actions">
                <button class="cabinet-modal-button cabinet-modal-button--secondary" type="button" data-cabinet-action-close>Отменить</button>
                <button class="cabinet-modal-button cabinet-modal-button--primary" type="submit">Сохранить</button>
            </div>
        </form>
    `);
}

function confirmActionTemplate() {
    return modalShell('confirm-action', 'Подтвердите действие <br class="cabinet-action-modal__mobile-only">на smspro.nikita.kg', `
        <div class="cabinet-confirm-action__body">
            <p>Вы не указали имя отправителя рассылки.<br>Создать новое имя можно в разделе <a class="cabinet-confirm-action__profile-link" href="#profile" data-cabinet-profile-link>“Мой профиль”</a></p>
        </div>
        <div class="cabinet-confirm-action__actions">
            <button class="cabinet-modal-button cabinet-modal-button--primary" type="button">Подтвердить</button>
        </div>
    `, { indicator: true });
}

const MODAL_TEMPLATES = {
    'demo-mode': demoModeTemplate,
    'quick-sms': quickSmsTemplate,
    'payment-method': paymentMethodTemplate,
    'payment-phone': paymentPhoneTemplate,
    'payment-confirm': paymentConfirmTemplate,
    'sender-name': senderNameTemplate,
    'confirm-action': confirmActionTemplate,
};

const TRANSLIT_MAP = {
    А: 'A',
    Б: 'B',
    В: 'V',
    Г: 'G',
    Д: 'D',
    Е: 'E',
    Ё: 'Yo',
    Ж: 'Zh',
    З: 'Z',
    И: 'I',
    Й: 'Y',
    К: 'K',
    Л: 'L',
    М: 'M',
    Н: 'N',
    О: 'O',
    П: 'P',
    Р: 'R',
    С: 'S',
    Т: 'T',
    У: 'U',
    Ф: 'F',
    Х: 'Kh',
    Ц: 'Ts',
    Ч: 'Ch',
    Ш: 'Sh',
    Щ: 'Sch',
    Ъ: '',
    Ы: 'Y',
    Ь: '',
    Э: 'E',
    Ю: 'Yu',
    Я: 'Ya',
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'kh',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
};

function transliterate(value) {
    return value.replace(/[А-Яа-яЁё]/g, (letter) => TRANSLIT_MAP[letter] ?? letter);
}

export function initCabinetActionModals() {
    const triggers = document.querySelectorAll('[data-cabinet-modal-open]');
    const shouldOpenFromHash = MODAL_HASHES[window.location.hash];

    if (!triggers.length && !shouldOpenFromHash) return;

    const modals = new Map();
    let activeModal = null;
    let activeTrigger = null;
    let paymentNextTimer = null;
    let selectedPaymentTitle = 'Безналичный расчёт';

    const ensureModal = (id) => {
        if (!MODAL_TEMPLATES[id]) return null;
        if (modals.has(id)) return modals.get(id);

        const modal = document.createElement('div');
        modal.className = `cabinet-modal cabinet-action-modal cabinet-action-modal--${id}`;
        modal.hidden = true;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `cabinetActionModalTitle-${id}`);
        modal.setAttribute('data-cabinet-action-modal', id);
        modal.innerHTML = MODAL_TEMPLATES[id]();

        document.body.append(modal);
        bindModal(modal);
        modals.set(id, modal);
        return modal;
    };

    const getFocusable = (modal) => Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter((node) => node.offsetParent !== null || node === document.activeElement);

    const closeModal = ({
        restoreFocus = true,
        keepBodyLocked = false,
    } = {}) => {
        if (!activeModal) return;

        const modal = activeModal;
        const trigger = activeTrigger;
        window.clearTimeout(paymentNextTimer);
        closeSenderSelects(modal);
        activeModal = null;
        document.removeEventListener('keydown', handleKeydown);

        closeModalLayer(modal, {
            afterClose: () => {
                if (!keepBodyLocked && !activeModal) {
                    document.body.classList.remove('is-cabinet-modal-open');
                }

                if (restoreFocus) {
                    trigger?.focus?.({ preventScroll: true });
                }
            },
        });

        activeTrigger = null;
    };

    const openModal = (id, trigger = null) => {
        const modal = ensureModal(id);
        if (!modal) return;

        if (activeModal && activeModal !== modal) {
            closeModal({ restoreFocus: false, keepBodyLocked: true });
        }

        activeModal = modal;
        activeTrigger = trigger;
        document.body.classList.add('is-cabinet-modal-open');
        openModalLayer(modal);
        document.addEventListener('keydown', handleKeydown);
        modal.querySelector('.cabinet-action-modal__dialog')?.focus({ preventScroll: true });
    };

    const closeSenderSelect = (select) => {
        if (!select) return;

        select.classList.remove('is-open');

        const toggle = select.querySelector('[data-cabinet-sender-toggle]');
        const menu = select.querySelector('.cabinet-action-select__menu');

        toggle?.setAttribute('aria-expanded', 'false');
        if (menu) menu.hidden = true;
    };

    const closeSenderSelects = (root = activeModal, except = null) => {
        if (!root) return;

        root.querySelectorAll('[data-cabinet-sender-select].is-open').forEach((select) => {
            if (select !== except) closeSenderSelect(select);
        });
    };

    const updateQuickCounter = (form) => {
        const textarea = form?.querySelector('#cabinetQuickMessage');
        const counter = form?.querySelector('.cabinet-quick-sms__counter');
        if (!textarea || !counter) return;

        const length = textarea.value.length;
        const hasUnicode = /[^\x00-\x7F]/.test(textarea.value);
        const limit = hasUnicode ? 70 : 160;
        const parts = Math.max(1, Math.ceil(length / limit));
        const values = counter.querySelectorAll('b');

        if (values[0]) values[0].textContent = String(length);
        if (values[1]) values[1].textContent = String(parts);
    };

    const selectPaymentCard = (card) => {
        const grid = card.closest('.cabinet-payment-method__grid');
        if (!grid) return;

        grid.querySelectorAll('[data-payment-method-card]').forEach((item) => {
            const isCurrent = item === card;
            item.classList.toggle('is-active', isCurrent);
            item.setAttribute('aria-pressed', String(isCurrent));
        });
    };

    const updatePaymentConfirm = () => {
        const modal = ensureModal('payment-confirm');
        const title = modal?.querySelector('[data-payment-confirm-title]');
        if (title) title.textContent = selectedPaymentTitle;
    };

    const setQuickSenderValue = (value) => {
        const quickModal = ensureModal('quick-sms');
        const select = quickModal?.querySelector('[data-cabinet-sender-select]');
        const valueNode = quickModal?.querySelector('[data-cabinet-sender-value]');
        const menu = quickModal?.querySelector('#cabinetQuickSenderMenu');
        if (!select || !valueNode || !menu) return;

        let option = Array.from(menu.querySelectorAll('[data-cabinet-sender-option]'))
            .find((item) => item.dataset.cabinetSenderOption === value);

        if (!option) {
            option = document.createElement('button');
            option.type = 'button';
            option.setAttribute('role', 'option');
            option.dataset.cabinetSenderOption = value;
            option.textContent = value;
            menu.append(option);
        }

        select.dataset.value = value;
        select.classList.add('has-value');
        valueNode.textContent = value;

        menu.querySelectorAll('[data-cabinet-sender-option]').forEach((item) => {
            item.setAttribute('aria-selected', String(item === option));
        });
    };

    function handleKeydown(event) {
        if (!activeModal) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            if (activeModal.querySelector('[data-cabinet-sender-select].is-open')) {
                closeSenderSelects();
                return;
            }

            closeModal();
            return;
        }

        if (event.key !== 'Tab') return;

        const focusable = getFocusable(activeModal);
        if (!focusable.length) return;

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

    function bindModal(modal) {
        modal.addEventListener('click', (event) => {
            const senderToggle = event.target.closest('[data-cabinet-sender-toggle]');

            if (senderToggle) {
                event.preventDefault();

                const select = senderToggle.closest('[data-cabinet-sender-select]');
                const menu = select?.querySelector('.cabinet-action-select__menu');
                const shouldOpen = !select?.classList.contains('is-open');

                closeSenderSelects(modal, select);
                select?.classList.toggle('is-open', shouldOpen);
                senderToggle.setAttribute('aria-expanded', String(shouldOpen));
                if (menu) menu.hidden = !shouldOpen;
                return;
            }

            const senderOption = event.target.closest('[data-cabinet-sender-option]');

            if (senderOption) {
                event.preventDefault();

                const select = senderOption.closest('[data-cabinet-sender-select]');
                const value = senderOption.dataset.cabinetSenderOption;
                const valueNode = select?.querySelector('[data-cabinet-sender-value]');
                const toggle = select?.querySelector('[data-cabinet-sender-toggle]');

                if (select && value) {
                    select.dataset.value = value;
                    select.classList.add('has-value');
                }

                if (valueNode && value) valueNode.textContent = value;

                select?.querySelectorAll('[data-cabinet-sender-option]').forEach((option) => {
                    option.setAttribute('aria-selected', String(option === senderOption));
                });

                closeSenderSelect(select);
                toggle?.focus({ preventScroll: true });
                return;
            }

            if (!event.target.closest('[data-cabinet-sender-select]')) {
                closeSenderSelects(modal);
            }

            const profileLink = event.target.closest('[data-cabinet-profile-link]');

            if (profileLink) {
                document.dispatchEvent(new CustomEvent('cabinet:set-section', {
                    detail: { section: 'profile' },
                }));
                return;
            }

            const paymentMethodCard = event.target.closest('[data-payment-method-card]');

            if (paymentMethodCard) {
                event.preventDefault();
                window.clearTimeout(paymentNextTimer);
                selectPaymentCard(paymentMethodCard);
                selectedPaymentTitle = paymentMethodCard.dataset.paymentTitle || selectedPaymentTitle;

                if (paymentMethodCard.dataset.paymentNext) {
                    openModal(paymentMethodCard.dataset.paymentNext, paymentMethodCard);
                    if (paymentMethodCard.dataset.paymentNext === 'payment-confirm') {
                        updatePaymentConfirm();
                    }
                }

                return;
            }

            const nestedTrigger = event.target.closest('[data-cabinet-modal-open]');

            if (nestedTrigger) {
                event.preventDefault();
                openModal(nestedTrigger.dataset.cabinetModalOpen, nestedTrigger);
                return;
            }

            if (event.target.closest('[data-cabinet-action-close]')) {
                event.preventDefault();
                closeModal();
            }
        });

        modal.addEventListener('submit', (event) => {
            if (event.target.matches('[data-cabinet-quick-form]')) {
                event.preventDefault();
                const senderSelect = event.target.querySelector('[data-cabinet-sender-select]');

                if (!senderSelect?.dataset.value) {
                    openModal('confirm-action', event.submitter);
                    return;
                }

                closeModal();
            }

            if (event.target.matches('[data-cabinet-payment-phone-form]')) {
                event.preventDefault();
                closeModal();
            }

            if (event.target.matches('[data-cabinet-payment-confirm-form]')) {
                event.preventDefault();
                closeModal();
            }

            if (event.target.matches('[data-cabinet-add-sender-form]')) {
                event.preventDefault();

                const input = event.target.elements.senderName;
                const value = input?.value.trim();
                if (!value) {
                    input?.focus();
                    return;
                }

                setQuickSenderValue(value);
                input.value = '';
                openModal('quick-sms', event.submitter);
            }
        });

        modal.addEventListener('click', (event) => {
            const quickForm = event.target.closest('[data-cabinet-quick-form]');

            if (event.target.closest('[data-cabinet-translit-message]')) {
                const textarea = modal.querySelector('#cabinetQuickMessage');
                if (textarea) {
                    textarea.value = transliterate(textarea.value);
                    updateQuickCounter(quickForm);
                }
            }

            if (event.target.closest('[data-cabinet-clear-message]')) {
                const textarea = modal.querySelector('#cabinetQuickMessage');
                if (textarea) {
                    textarea.value = '';
                    updateQuickCounter(quickForm);
                }
            }
        });

        modal.addEventListener('input', (event) => {
            if (event.target.matches('#cabinetQuickMessage')) {
                updateQuickCounter(event.target.closest('[data-cabinet-quick-form]'));
            }
        });
    }

    const handleTriggerClick = (event) => {
        const trigger = event.currentTarget;
        event.preventDefault();
        openModal(trigger.dataset.cabinetModalOpen, trigger);
    };

    triggers.forEach((trigger) => {
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.addEventListener('click', handleTriggerClick);

        if (!/^(a|button)$/i.test(trigger.tagName)) {
            trigger.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                openModal(trigger.dataset.cabinetModalOpen, trigger);
            });
        }
    });

    if (shouldOpenFromHash) {
        openModal(shouldOpenFromHash);
    }
}
