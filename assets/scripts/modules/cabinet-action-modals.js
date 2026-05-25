import { closeModalLayer, openModalLayer } from './modal-transition.js';

const ASSET_PATH = new URL('../../images/cabinet-modals/', import.meta.url).href;
const ICON_SPRITE = new URL('../../images/cabinet-icons.svg', import.meta.url).href;

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

const ACTION_MODAL_I18N = {
    ru: {
        quickSmsTitle: 'Быстрая отправка SMS',
        paymentTitle: 'Пополнение счёта',
        paymentMethodLabel: 'Выберите способ оплаты:',
        from: 'От кого:',
        addName: 'Добавить имя',
        senderHelp: 'Подсказка об имени отправителя',
        senderTooltip: 'Имя отправителя отображается у получателя вместо номера. Новое имя нужно добавить и дождаться согласования.',
        selectSender: 'Выберите имя отправителя',
        to: 'Кому:',
        recipientPlaceholder: 'Укажите получателя',
        messageText: 'Введите текст сообщения:',
        characters: 'Символов:',
        smsParts: 'Частей SMS:',
        smsPlaceholder: 'Введите текст SMS',
        translit: 'Перевести в транслит',
        clear: 'Очистить',
        cancel: 'Отменить',
        send: 'Отправить',
        cashless: 'Безналичный расчёт',
        bankCards: 'Банковские карты',
        mbank: 'Оплата через Мбанк',
        elqr: 'Оплата через ELQR',
        pay24: 'Оплата через терминалы Pay24',
        elsom: 'Оплата через электронный кошелек ЭЛСОМ',
        close: 'Закрыть',
        phoneLabel: 'Введите номер телефона:',
        back: 'Назад',
        confirm: 'Подтвердить',
        paymentSelected: 'Выбран способ оплаты:',
        paymentConfirmText: 'Подтвердите выбор способа оплаты, чтобы продолжить пополнение счёта.',
        senderNameTitle: 'Добавить имя отправителя',
        senderNameLabel: 'Имя отправителя:',
        senderNamePlaceholder: 'Введите имя отправителя',
        senderNameNote: 'Имя будет добавлено в список отправителей для быстрой отправки SMS.',
        save: 'Сохранить',
        confirmActionTitle: 'Подтвердите действие <br class="cabinet-action-modal__mobile-only">на smspro.nikita.kg',
        confirmActionText: 'Вы не указали имя отправителя рассылки.<br>Создать новое имя можно в разделе <a class="cabinet-confirm-action__profile-link" href="profile.html" data-cabinet-profile-link>“Мой профиль”</a>',
        demoTitle: 'Тестовый режим',
        demoMassMailings: 'Массовые рассылки',
        demoDisabled: 'Отключены',
        demoQuickSms: 'Отправка SMS <br>в разделе <b>“Быстрая отправка SMS”</b>',
        demoLimited: 'Ограничена <small>(отправка SMS только на номер, указанный в профиле</small>',
        demoApi: 'Работа <br class="cabinet-action-modal__mobile-only">по API/SMPP',
        demoText: 'Для перехода в рабочий режим <strong>заполните форму</strong> <br class="cabinet-action-modal__desktop-only">на согласование имени отправителя',
        downloadForm: 'Скачать форму',
    },
    en: {
        quickSmsTitle: 'Fast SMS sending',
        paymentTitle: 'Balance top-up',
        paymentMethodLabel: 'Choose a payment method:',
        from: 'From:',
        addName: 'Add name',
        senderHelp: 'Sender name hint',
        senderTooltip: 'The sender name is shown to the recipient instead of a number. Add the new name and wait for approval.',
        selectSender: 'Select sender name',
        to: 'To:',
        recipientPlaceholder: 'Enter recipient',
        messageText: 'Enter message text:',
        characters: 'Characters:',
        smsParts: 'SMS parts:',
        smsPlaceholder: 'Enter SMS text',
        translit: 'Transliterate',
        clear: 'Clear',
        cancel: 'Cancel',
        send: 'Send',
        cashless: 'Cashless payment',
        bankCards: 'Bank cards',
        mbank: 'Payment via Mbank',
        elqr: 'Payment via ELQR',
        pay24: 'Payment via Pay24 terminals',
        elsom: 'Payment via ELSOM e-wallet',
        close: 'Close',
        phoneLabel: 'Enter phone number:',
        back: 'Back',
        confirm: 'Confirm',
        paymentSelected: 'Selected payment method:',
        paymentConfirmText: 'Confirm the selected payment method to continue topping up the balance.',
        senderNameTitle: 'Add sender name',
        senderNameLabel: 'Sender name:',
        senderNamePlaceholder: 'Enter sender name',
        senderNameNote: 'The name will be added to the sender list for fast SMS sending.',
        save: 'Save',
        confirmActionTitle: 'Confirm action <br class="cabinet-action-modal__mobile-only">on smspro.nikita.kg',
        confirmActionText: 'You have not specified a mailing sender name.<br>You can create a new name in <a class="cabinet-confirm-action__profile-link" href="profile.html" data-cabinet-profile-link>“My profile”</a>',
        demoTitle: 'Test mode',
        demoMassMailings: 'Bulk mailings',
        demoDisabled: 'Disabled',
        demoQuickSms: 'SMS sending <br>in <b>“Fast SMS sending”</b>',
        demoLimited: 'Limited <small>(SMS sending only to the number specified in the profile</small>',
        demoApi: 'API/SMPP <br class="cabinet-action-modal__mobile-only">operation',
        demoText: 'To switch to live mode, <strong>fill out the form</strong> <br class="cabinet-action-modal__desktop-only">for sender name approval',
        downloadForm: 'Download form',
    },
    ky: {
        quickSmsTitle: 'Ыкчам SMS жөнөтүү',
        paymentTitle: 'Эсепти толуктоо',
        paymentMethodLabel: 'Төлөм ыкмасын тандаңыз:',
        from: 'Кимден:',
        addName: 'Ат кошуу',
        senderHelp: 'Жөнөтүүчү аты боюнча кеңеш',
        senderTooltip: 'Жөнөтүүчүнүн аты алуучуга номердин ордуна көрсөтүлөт. Жаңы атты кошуп, макулдашууну күтүңүз.',
        selectSender: 'Жөнөтүүчү атын тандаңыз',
        to: 'Кимге:',
        recipientPlaceholder: 'Алуучуну көрсөтүңүз',
        messageText: 'Билдирүүнүн текстин киргизиңиз:',
        characters: 'Белгилер:',
        smsParts: 'SMS бөлүктөрү:',
        smsPlaceholder: 'SMS текстин киргизиңиз',
        translit: 'Транслитке өткөрүү',
        clear: 'Тазалоо',
        cancel: 'Жокко чыгаруу',
        send: 'Жөнөтүү',
        cashless: 'Накталай эмес төлөм',
        bankCards: 'Банк карталары',
        mbank: 'Мбанк аркылуу төлөө',
        elqr: 'ELQR аркылуу төлөө',
        pay24: 'Pay24 терминалдары аркылуу төлөө',
        elsom: 'ЭЛСОМ электрондук капчыгы аркылуу төлөө',
        close: 'Жабуу',
        phoneLabel: 'Телефон номерин киргизиңиз:',
        back: 'Артка',
        confirm: 'Ырастоо',
        paymentSelected: 'Тандалган төлөм ыкмасы:',
        paymentConfirmText: 'Эсепти толуктоону улантуу үчүн төлөм ыкмасын ырастаңыз.',
        senderNameTitle: 'Жөнөтүүчүнүн атын кошуу',
        senderNameLabel: 'Жөнөтүүчүнүн аты:',
        senderNamePlaceholder: 'Жөнөтүүчүнүн атын киргизиңиз',
        senderNameNote: 'Ат SMSти ыкчам жөнөтүү үчүн жөнөтүүчүлөр тизмесине кошулат.',
        save: 'Сактоо',
        confirmActionTitle: 'smspro.nikita.kg сайтында <br class="cabinet-action-modal__mobile-only">аракетти ырастаңыз',
        confirmActionText: 'Сиз рассылка жөнөтүүчүнүн атын көрсөткөн жоксуз.<br>Жаңы атты <a class="cabinet-confirm-action__profile-link" href="profile.html" data-cabinet-profile-link>“Менин профилим”</a> бөлүмүндө түзсө болот',
        demoTitle: 'Тест режими',
        demoMassMailings: 'Массалык рассылкалар',
        demoDisabled: 'Өчүрүлгөн',
        demoQuickSms: 'SMS жөнөтүү <br><b>“Ыкчам SMS жөнөтүү”</b> бөлүмүндө',
        demoLimited: 'Чектелген <small>(SMS профилде көрсөтүлгөн номерге гана жөнөтүлөт</small>',
        demoApi: 'API/SMPP <br class="cabinet-action-modal__mobile-only">аркылуу иштөө',
        demoText: 'Иш режимине өтүү үчүн жөнөтүүчүнүн атын макулдашуу формасын <strong>толтуруңуз</strong>',
        downloadForm: 'Форманы жүктөө',
    },
};

function getCurrentLocale() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.includes('en')) return 'en';
    if (segments.includes('ky')) return 'ky';
    return 'ru';
}

function modalText(key) {
    const locale = getCurrentLocale();
    return ACTION_MODAL_I18N[locale]?.[key] || ACTION_MODAL_I18N.ru[key] || key;
}

function setText(node, value) {
    if (node) node.textContent = value;
}

function setHtml(node, value) {
    if (node) node.innerHTML = value;
}

function localizeActionModal(modal, id) {
    if (getCurrentLocale() === 'ru') return;

    modal.querySelector('[data-cabinet-action-close]')?.setAttribute('aria-label', modalText('close'));

    if (id === 'payment-method') {
        setText(modal.querySelector('.cabinet-action-modal__title'), modalText('paymentTitle'));
        setText(modal.querySelector('.cabinet-payment-method__label'), modalText('paymentMethodLabel'));

        const cards = modal.querySelectorAll('.cabinet-payment-method__card');
        const keys = ['cashless', 'bankCards', 'mbank', 'elqr', 'pay24', 'elsom'];
        cards.forEach((card, index) => {
            const label = card.querySelector(':scope > span:last-child');
            const text = modalText(keys[index]);
            setText(label, text);
            card.setAttribute('title', text);
            card.dataset.paymentTitle = text;
        });
    }

    if (id === 'payment-phone' || id === 'payment-confirm') {
        setText(modal.querySelector('.cabinet-action-modal__title'), modalText('paymentTitle'));
    }

    if (id === 'payment-phone') {
        setText(modal.querySelector('.cabinet-payment-phone__field .cabinet-action-label'), modalText('phoneLabel'));
        const actionButtons = modal.querySelectorAll('.cabinet-payment-phone__actions .cabinet-modal-button');
        setText(actionButtons[0]?.querySelector(':scope > span:last-child'), modalText('back'));
        setText(actionButtons[1]?.querySelector(':scope > span:first-child'), modalText('confirm'));
    }

    if (id === 'payment-confirm') {
        setText(modal.querySelector('[data-payment-confirm-title]'), modalText('cashless'));
        setText(modal.querySelector('.cabinet-payment-confirm__body .cabinet-action-label'), modalText('paymentSelected'));
        setText(modal.querySelector('.cabinet-payment-confirm__body p'), modalText('paymentConfirmText'));
        const actionLabels = modal.querySelectorAll('.cabinet-payment-confirm__actions .cabinet-modal-button > span:last-child');
        setText(actionLabels[0], modalText('back'));
        setText(actionLabels[1], modalText('confirm'));
    }

    if (id === 'quick-sms') {
        setText(modal.querySelector('.cabinet-action-modal__title'), modalText('quickSmsTitle'));
        setText(modal.querySelector('label[for="cabinetQuickSender"]'), modalText('from'));
        setText(modal.querySelector('[data-cabinet-sender-value]'), modalText('selectSender'));
        setText(modal.querySelector('.cabinet-quick-sms__add-name span'), modalText('addName'));
        modal.querySelector('[data-cabinet-sender-help]')?.setAttribute('aria-label', modalText('senderHelp'));
        setText(modal.querySelector('[data-cabinet-sender-help-tooltip]'), modalText('senderTooltip'));

        const recipientField = modal.querySelector('input[name="recipient"]');
        setText(recipientField?.closest('label')?.querySelector('.cabinet-action-label'), modalText('to'));
        recipientField?.setAttribute('placeholder', modalText('recipientPlaceholder'));

        setText(modal.querySelector('label[for="cabinetQuickMessage"]'), modalText('messageText'));
        const counters = modal.querySelectorAll('.cabinet-quick-sms__counter span');
        setHtml(counters[0], `${modalText('characters')} <b>0</b>`);
        setHtml(counters[1], `${modalText('smsParts')} <b>1</b>`);
        modal.querySelector('#cabinetQuickMessage')?.setAttribute('placeholder', modalText('smsPlaceholder'));

        const toolLabels = modal.querySelectorAll('.cabinet-quick-sms__tools button span');
        setText(toolLabels[0], modalText('translit'));
        setText(toolLabels[1], modalText('clear'));

        const actionButtons = modal.querySelectorAll('.cabinet-action-modal__actions .cabinet-modal-button');
        setText(actionButtons[0], modalText('cancel'));
        setText(actionButtons[1], modalText('send'));
    }

    if (id === 'sender-name') {
        setText(modal.querySelector('.cabinet-action-modal__title'), modalText('senderNameTitle'));
        setText(modal.querySelector('.cabinet-sender-name__field .cabinet-action-label'), modalText('senderNameLabel'));
        modal.querySelector('input[name="senderName"]')?.setAttribute('placeholder', modalText('senderNamePlaceholder'));
        setText(modal.querySelector('.cabinet-sender-name__note'), modalText('senderNameNote'));
        const actionButtons = modal.querySelectorAll('.cabinet-sender-name__actions .cabinet-modal-button');
        setText(actionButtons[0], modalText('cancel'));
        setText(actionButtons[1], modalText('save'));
    }

    if (id === 'confirm-action') {
        setHtml(modal.querySelector('.cabinet-action-modal__title'), modalText('confirmActionTitle'));
        setHtml(modal.querySelector('.cabinet-confirm-action__body p'), modalText('confirmActionText'));
        setText(modal.querySelector('.cabinet-confirm-action__actions .cabinet-modal-button'), modalText('confirm'));
    }

    if (id === 'demo-mode') {
        setText(modal.querySelector('.cabinet-action-modal__title'), modalText('demoTitle'));
        const rows = modal.querySelectorAll('.cabinet-demo-mode__row');
        setText(rows[0]?.querySelector('span'), modalText('demoMassMailings'));
        setText(rows[0]?.querySelector('strong'), modalText('demoDisabled'));
        setHtml(rows[1]?.querySelector('span'), modalText('demoQuickSms'));
        setHtml(rows[1]?.querySelector('strong'), modalText('demoLimited'));
        setHtml(rows[2]?.querySelector('span'), modalText('demoApi'));
        setHtml(rows[2]?.querySelector('strong'), modalText('demoLimited'));
        setHtml(modal.querySelector('.cabinet-demo-mode__actions p'), modalText('demoText'));
        setText(modal.querySelector('.cabinet-demo-mode__download span'), modalText('downloadForm'));
    }
}

function spriteIcon(symbol, className = '') {
    return `<svg class="cabinet-action-modal__sprite ${className}" aria-hidden="true"><use href="${ICON_SPRITE}#${symbol}"></use></svg>`;
}

function closeButton() {
    return `
        <button class="cabinet-action-modal__close" type="button" aria-label="Закрыть" data-cabinet-action-close>
            <svg class="cabinet-icon" aria-hidden="true"><use href="${ICON_SPRITE}#icon-modal-close"></use></svg>
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
                    <div class="cabinet-quick-sms__add-wrap">
                        <button class="cabinet-quick-sms__add-name" type="button" data-cabinet-modal-open="sender-name">
                            ${spriteIcon('icon-action-plus', 'cabinet-quick-sms__plus')}
                            <span>Добавить имя</span>
                        </button>
                        <button class="cabinet-quick-sms__help-button" type="button" aria-label="Подсказка об имени отправителя" aria-expanded="false" aria-describedby="cabinetQuickSenderHint" data-cabinet-sender-help>
                            ${spriteIcon('icon-action-help', 'cabinet-quick-sms__help')}
                        </button>
                        <span class="cabinet-quick-sms__tooltip" id="cabinetQuickSenderHint" role="tooltip" hidden data-cabinet-sender-help-tooltip>Имя отправителя отображается у получателя вместо номера. Новое имя нужно добавить и дождаться согласования.</span>
                    </div>
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
                        <span>Символов: <b>0</b></span>
                        <span>Частей SMS: <b>1</b></span>
                    </div>
                </div>
                <textarea class="cabinet-action-input cabinet-action-input--textarea" id="cabinetQuickMessage" name="message" placeholder="Введите текст SMS"></textarea>
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
            <p>Вы не указали имя отправителя рассылки.<br>Создать новое имя можно в разделе <a class="cabinet-confirm-action__profile-link" href="profile.html" data-cabinet-profile-link>“Мой профиль”</a></p>
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
        localizeActionModal(modal, id);

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
        closeSenderHelp(modal);
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

    const closeSenderHelp = (root = activeModal, restoreFocus = false) => {
        const tooltip = root?.querySelector('[data-cabinet-sender-help-tooltip]:not([hidden])');
        const button = root?.querySelector('[data-cabinet-sender-help]');
        if (!tooltip || !button) return false;

        tooltip.hidden = true;
        tooltip.classList.remove('is-open');
        button.classList.remove('is-active');
        button.setAttribute('aria-expanded', 'false');
        if (restoreFocus) button.focus({ preventScroll: true });
        return true;
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

            if (closeSenderHelp(activeModal, true)) {
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

            const senderHelp = event.target.closest('[data-cabinet-sender-help]');

            if (senderHelp) {
                event.preventDefault();
                const tooltip = modal.querySelector('[data-cabinet-sender-help-tooltip]');
                if (!tooltip) return;

                const shouldOpen = tooltip.hidden;
                tooltip.hidden = !shouldOpen;
                tooltip.classList.toggle('is-open', shouldOpen);
                senderHelp.classList.toggle('is-active', shouldOpen);
                senderHelp.setAttribute('aria-expanded', String(shouldOpen));
                return;
            }

            if (!event.target.closest('[data-cabinet-sender-help-tooltip]')) {
                closeSenderHelp(modal);
            }

            const profileLink = event.target.closest('[data-cabinet-profile-link]');

            if (profileLink) {
                if (profileLink.pathname && profileLink.pathname !== window.location.pathname) return;
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
