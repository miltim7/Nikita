import { closeModalLayer, openModalLayer } from './modal-transition.js';

const LABELS = {
    ru: {
        login: 'Войти',
        registerTopbar: 'Регистрация',
        register: 'Зарегистрироваться',
        modalTitle: 'Вход в кабинет',
        modalLead: 'Введите логин и пароль от SMSPRO.NIKITA.KG.',
        loginLabel: 'Логин',
        loginPlaceholder: 'mail@example.com',
        passwordLabel: 'Пароль',
        passwordPlaceholder: 'Пароль',
        submit: 'Войти',
        forgot: 'Напомнить пароль',
        registerHint: 'Нет аккаунта?',
        registerLink: 'Зарегистрироваться',
        close: 'Закрыть',
        forgotTitle: 'Напомнить пароль',
        forgotLead: 'Выберите, куда отправить данные для восстановления доступа.',
        byEmail: 'Отправить на Email',
        bySms: 'Отправить SMS на телефон',
        emailLabel: 'Email',
        phoneLabel: 'Телефон',
        emailPlaceholder: 'mail@example.com',
        phonePlaceholder: '+996 700 000 000',
        send: 'Отправить',
        back: 'Назад ко входу',
        loginError: 'Введите логин и пароль.',
        forgotError: 'Укажите email или телефон.',
        forgotSuccess: 'Заявка принята. Если данные есть в системе, инструкция будет отправлена.',
    },
    en: {
        login: 'Login',
        registerTopbar: 'Register',
        register: 'Register',
        modalTitle: 'Account login',
        modalLead: 'Enter your SMSPRO.NIKITA.KG login and password.',
        loginLabel: 'Login',
        loginPlaceholder: 'mail@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Password',
        submit: 'Login',
        forgot: 'Remind password',
        registerHint: 'No account?',
        registerLink: 'Register',
        close: 'Close',
        forgotTitle: 'Remind password',
        forgotLead: 'Choose where to send access recovery details.',
        byEmail: 'Send to Email',
        bySms: 'Send SMS to phone',
        emailLabel: 'Email',
        phoneLabel: 'Phone',
        emailPlaceholder: 'mail@example.com',
        phonePlaceholder: '+996 700 000 000',
        send: 'Send',
        back: 'Back to login',
        loginError: 'Enter login and password.',
        forgotError: 'Enter email or phone.',
        forgotSuccess: 'Request accepted. If the data exists, instructions will be sent.',
    },
    ky: {
        login: 'Кирүү',
        registerTopbar: 'Каттоо',
        register: 'Каттоо',
        modalTitle: 'Кабинетке кирүү',
        modalLead: 'SMSPRO.NIKITA.KG логиниңизди жана сырсөзүңүздү киргизиңиз.',
        loginLabel: 'Логин',
        loginPlaceholder: 'mail@example.com',
        passwordLabel: 'Сырсөз',
        passwordPlaceholder: 'Сырсөз',
        submit: 'Кирүү',
        forgot: 'Сырсөздү эске салуу',
        registerHint: 'Аккаунтуңуз жокпу?',
        registerLink: 'Каттоо',
        close: 'Жабуу',
        forgotTitle: 'Сырсөздү эске салуу',
        forgotLead: 'Кирүүнү калыбына келтирүү маалыматын кайда жөнөтүүнү тандаңыз.',
        byEmail: 'Emailге жөнөтүү',
        bySms: 'Телефонго SMS жөнөтүү',
        emailLabel: 'Email',
        phoneLabel: 'Телефон',
        emailPlaceholder: 'mail@example.com',
        phonePlaceholder: '+996 700 000 000',
        send: 'Жөнөтүү',
        back: 'Кирүүгө кайтуу',
        loginError: 'Логин жана сырсөздү киргизиңиз.',
        forgotError: 'Email же телефонду көрсөтүңүз.',
        forgotSuccess: 'Сурам кабыл алынды. Маалымат системада болсо, нускама жөнөтүлөт.',
    },
};

function getCurrentLocale() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.includes('en')) return 'en';
    if (segments.includes('ky')) return 'ky';
    return 'ru';
}

function createAuthControls(sourceLink, labels) {
    const registerHref = sourceLink.getAttribute('href') || 'registration.html';
    const group = document.createElement('div');
    group.className = 'topbar__auth';
    group.innerHTML = `
        <button class="topbar__auth-button topbar__auth-button--login" type="button" data-auth-open>
            <img src="${sourceLink.querySelector('img')?.getAttribute('src') || 'assets/images/header-icon-login.svg'}" alt="" aria-hidden="true">
            <span>${labels.login}</span>
        </button>
        <a class="topbar__auth-button topbar__auth-button--register" href="${registerHref}">
            <span>${labels.registerTopbar || labels.register}</span>
        </a>
    `;
    sourceLink.replaceWith(group);
    return group;
}

function getAuthControls(labels) {
    const existingControls = document.querySelector('.topbar__auth');
    if (existingControls) {
        const registerHref = existingControls
            .querySelector('.topbar__auth-button--register[href]')
            ?.getAttribute('href') || 'registration.html';

        return { controls: existingControls, registerHref };
    }

    const sourceLink = document.querySelector('.topbar__login');
    if (!sourceLink) return null;

    const registerHref = sourceLink.getAttribute('href') || 'registration.html';
    return {
        controls: createAuthControls(sourceLink, labels),
        registerHref,
    };
}

function createAuthModal(labels, registerHref) {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.hidden = true;
    modal.setAttribute('data-auth-modal', '');
    modal.innerHTML = `
        <div class="auth-modal__backdrop" data-auth-close></div>
        <section class="auth-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
            <div class="auth-modal__head">
                <div>
                    <h2 class="auth-modal__title" id="authModalTitle">${labels.modalTitle}</h2>
                    <p class="auth-modal__lead" data-auth-lead>${labels.modalLead}</p>
                </div>
                <button class="auth-modal__close" type="button" aria-label="${labels.close}" data-auth-close></button>
            </div>

            <form class="auth-form auth-form--login" action="https://smspro.nikita.kg/kg/" method="post" data-auth-login-form>
                <label class="auth-form__field">
                    <span>${labels.loginLabel}</span>
                    <input class="auth-form__input" type="text" name="login" autocomplete="username" placeholder="${labels.loginPlaceholder}">
                </label>
                <label class="auth-form__field">
                    <span>${labels.passwordLabel}</span>
                    <input class="auth-form__input" type="password" name="password" autocomplete="current-password" placeholder="${labels.passwordPlaceholder}">
                </label>
                <p class="auth-form__message" data-auth-login-message aria-live="polite"></p>
                <div class="auth-form__actions">
                    <button class="auth-form__submit" type="submit">${labels.submit}</button>
                    <button class="auth-form__link" type="button" data-auth-forgot>${labels.forgot}</button>
                </div>
                <p class="auth-form__register">${labels.registerHint} <a href="${registerHref}">${labels.registerLink}</a></p>
            </form>

            <form class="auth-form auth-form--forgot" hidden data-auth-forgot-form>
                <div class="auth-form__options">
                    <label class="auth-form__radio">
                        <input type="radio" name="restore-channel" value="email" checked>
                        <span>${labels.byEmail}</span>
                    </label>
                    <label class="auth-form__radio">
                        <input type="radio" name="restore-channel" value="sms">
                        <span>${labels.bySms}</span>
                    </label>
                </div>
                <label class="auth-form__field">
                    <span data-auth-restore-label>${labels.emailLabel}</span>
                    <input class="auth-form__input" type="email" name="restore" autocomplete="email" placeholder="${labels.emailPlaceholder}" data-auth-restore-input>
                </label>
                <p class="auth-form__message" data-auth-forgot-message aria-live="polite"></p>
                <div class="auth-form__actions">
                    <button class="auth-form__submit" type="submit">${labels.send}</button>
                    <button class="auth-form__secondary" type="button" data-auth-back>${labels.back}</button>
                </div>
            </form>
        </section>
    `;
    document.body.append(modal);
    return modal;
}

export function initPublicAuth() {
    const labels = LABELS[getCurrentLocale()] || LABELS.ru;
    const authControls = getAuthControls(labels);
    if (!authControls) return;

    const { controls, registerHref } = authControls;
    const modal = createAuthModal(labels, registerHref);
    const dialog = modal.querySelector('.auth-modal__dialog');
    const title = modal.querySelector('[id="authModalTitle"]');
    const lead = modal.querySelector('[data-auth-lead]');
    const loginForm = modal.querySelector('[data-auth-login-form]');
    const forgotForm = modal.querySelector('[data-auth-forgot-form]');
    const loginMessage = modal.querySelector('[data-auth-login-message]');
    const forgotMessage = modal.querySelector('[data-auth-forgot-message]');
    const restoreLabel = modal.querySelector('[data-auth-restore-label]');
    const restoreInput = modal.querySelector('[data-auth-restore-input]');
    let lastFocused = null;

    const showLogin = () => {
        loginForm.hidden = false;
        forgotForm.hidden = true;
        title.textContent = labels.modalTitle;
        lead.textContent = labels.modalLead;
        loginMessage.textContent = '';
        forgotMessage.textContent = '';
    };

    const showForgot = () => {
        loginForm.hidden = true;
        forgotForm.hidden = false;
        title.textContent = labels.forgotTitle;
        lead.textContent = labels.forgotLead;
        loginMessage.textContent = '';
        forgotMessage.textContent = '';
        restoreInput.focus({ preventScroll: true });
    };

    const close = () => {
        closeModalLayer(modal, {
            afterClose: () => lastFocused?.focus?.({ preventScroll: true }),
        });
        document.removeEventListener('keydown', handleKeydown);
    };

    const open = () => {
        lastFocused = document.activeElement;
        showLogin();
        openModalLayer(modal);
        document.addEventListener('keydown', handleKeydown);
        window.requestAnimationFrame(() => {
            loginForm.querySelector('input')?.focus({ preventScroll: true });
        });
    };

    function handleKeydown(event) {
        if (event.key === 'Escape') close();
        if (event.key !== 'Tab' || !modal.classList.contains('is-open')) return;

        const focusable = Array.from(dialog.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled)'))
            .filter(element => !element.closest('[hidden]'));
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    controls.querySelector('[data-auth-open]')?.addEventListener('click', open);
    modal.querySelectorAll('[data-auth-close]').forEach(button => button.addEventListener('click', close));
    modal.querySelector('[data-auth-forgot]')?.addEventListener('click', showForgot);
    modal.querySelector('[data-auth-back]')?.addEventListener('click', showLogin);

    forgotForm.querySelectorAll('input[name="restore-channel"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const isSms = radio.value === 'sms' && radio.checked;
            restoreLabel.textContent = isSms ? labels.phoneLabel : labels.emailLabel;
            restoreInput.type = isSms ? 'tel' : 'email';
            restoreInput.placeholder = isSms ? labels.phonePlaceholder : labels.emailPlaceholder;
            restoreInput.value = '';
            forgotMessage.textContent = '';
        });
    });

    loginForm.addEventListener('submit', event => {
        const login = loginForm.elements.login.value.trim();
        const password = loginForm.elements.password.value.trim();
        if (login && password) return;

        event.preventDefault();
        loginMessage.textContent = labels.loginError;
    });

    forgotForm.addEventListener('submit', event => {
        event.preventDefault();
        if (!restoreInput.value.trim()) {
            forgotMessage.textContent = labels.forgotError;
            return;
        }

        forgotMessage.textContent = labels.forgotSuccess;
    });
}
