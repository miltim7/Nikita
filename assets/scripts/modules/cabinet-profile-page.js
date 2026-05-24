import { closeModalLayer, openModalLayer } from './modal-transition.js';

let profileToastTimer = null;
let passwordModal = null;
let activePasswordTrigger = null;
let senderPopoverTimer = null;
let activeSenderTrigger = null;

function getSwitchVisual(control) {
    if (control.classList.contains('cabinet-profile-switch')) return control;
    return control.querySelector('.cabinet-profile-switch');
}

function setSwitchState(control, enabled) {
    const visual = getSwitchVisual(control);
    if (!visual) return;

    visual.classList.toggle('is-on', enabled);
    visual.setAttribute('aria-checked', String(enabled));

    if (control !== visual) {
        control.setAttribute('aria-pressed', String(enabled));
        if (control.getAttribute('role') === 'switch') {
            control.setAttribute('aria-checked', String(enabled));
        }
    }
}

function isSwitchOn(control) {
    return Boolean(getSwitchVisual(control)?.classList.contains('is-on'));
}

function setCheckboxState(button, checked) {
    button.classList.toggle('is-checked', checked);
    button.setAttribute('aria-checked', String(checked));
}

function getHelpTooltip(button) {
    const tooltipId = button.getAttribute('aria-describedby');
    if (!tooltipId) return null;

    return document.getElementById(tooltipId);
}

function setHelpTooltipState(button, open) {
    const tooltip = getHelpTooltip(button);
    if (!tooltip) return;

    tooltip.hidden = !open;
    button.classList.toggle('is-active', open);
    button.setAttribute('aria-expanded', String(open));
}

function closeHelpTooltips(page, exceptButton = null) {
    page.querySelectorAll('[data-profile-help]').forEach((button) => {
        if (button === exceptButton) return;
        setHelpTooltipState(button, false);
    });
}

function updateSettingsExpandedState(settings) {
    const hasExpandedSection = Boolean(settings.querySelector('.cabinet-profile-section.is-expanded'));
    settings.classList.toggle('has-expanded-section', hasExpandedSection);
}

function finishPanelTransition(panel, callback) {
    let done = false;

    const finish = () => {
        if (done) return;
        done = true;
        panel.removeEventListener('transitionend', onTransitionEnd);
        callback();
    };

    const onTransitionEnd = (event) => {
        if (event.target !== panel || event.propertyName !== 'height') return;
        finish();
    };

    panel.addEventListener('transitionend', onTransitionEnd);
    window.setTimeout(finish, 280);
}

function setSectionExpanded(section, expanded, { animate = false } = {}) {
    const panel = section.querySelector('[data-profile-panel]');
    const toggle = section.querySelector('[data-profile-toggle]');
    const label = section.querySelector('[data-profile-toggle-label]');
    const icon = section.querySelector('[data-profile-toggle-icon]');
    const settings = section.closest('[data-profile-settings]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    section.classList.toggle('is-expanded', expanded);

    if (toggle) toggle.setAttribute('aria-expanded', String(expanded));
    if (label) label.textContent = expanded ? 'Свернуть' : 'Развернуть';
    if (icon) {
        icon.src = expanded
            ? 'assets/images/cabinet-profile/chevron-up.svg'
            : 'assets/images/cabinet-profile/chevron-down.svg';
    }

    if (!panel) {
        if (settings) updateSettingsExpandedState(settings);
        return;
    }

    if (!animate || reduceMotion) {
        panel.hidden = !expanded;
        panel.style.height = expanded ? 'auto' : '';
        panel.style.opacity = expanded ? '1' : '';
        if (settings) updateSettingsExpandedState(settings);
        return;
    }

    if (expanded) {
        panel.hidden = false;
        panel.style.height = '0px';
        panel.style.opacity = '0';
        panel.getBoundingClientRect();

        window.requestAnimationFrame(() => {
            panel.style.height = `${panel.scrollHeight}px`;
            panel.style.opacity = '1';
        });

        finishPanelTransition(panel, () => {
            panel.style.height = 'auto';
            panel.style.opacity = '1';
        });
    } else {
        panel.style.height = `${panel.scrollHeight}px`;
        panel.style.opacity = '1';
        panel.getBoundingClientRect();

        window.requestAnimationFrame(() => {
            panel.style.height = '0px';
            panel.style.opacity = '0';
        });

        finishPanelTransition(panel, () => {
            panel.hidden = true;
            panel.style.height = '';
            panel.style.opacity = '';
        });
    }

    if (settings) updateSettingsExpandedState(settings);
}

function ensureToast() {
    let toast = document.querySelector('[data-profile-toast]');
    if (toast) return toast;

    toast = document.createElement('div');
    toast.className = 'cabinet-profile-toast';
    toast.hidden = true;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('data-profile-toast', '');
    document.body.append(toast);
    return toast;
}

function showProfileToast(message, type = 'info') {
    const toast = ensureToast();

    window.clearTimeout(profileToastTimer);
    toast.className = `cabinet-profile-toast cabinet-profile-toast--${type}`;
    toast.textContent = message;
    toast.hidden = false;
    toast.getBoundingClientRect();
    toast.classList.add('is-open');

    profileToastTimer = window.setTimeout(() => {
        toast.classList.remove('is-open');
        window.setTimeout(() => {
            if (!toast.classList.contains('is-open')) toast.hidden = true;
        }, 240);
    }, 3200);
}

function setInvalid(control, invalid) {
    if (!control) return;

    if (invalid) {
        control.setAttribute('aria-invalid', 'true');
    } else {
        control.removeAttribute('aria-invalid');
    }
}

function validateProfile(page) {
    const requiredFields = [
        ['organization', 'Введите название организации.'],
        ['full_name', 'Введите ФИО.'],
        ['email', 'Введите корректный email.'],
        ['phone', 'Введите телефон.'],
    ];

    let firstInvalid = null;
    let message = '';

    page.querySelectorAll('[aria-invalid="true"]').forEach((control) => setInvalid(control, false));

    requiredFields.forEach(([name, error]) => {
        const control = page.querySelector(`[name="${name}"]`);
        const invalid = !control?.value.trim() || (control.type === 'email' && !control.validity.valid);

        setInvalid(control, invalid);
        if (invalid && !firstInvalid) {
            firstInvalid = control;
            message = error;
        }
    });

    const deliveryUrl = page.querySelector('[name="delivery_url"]');
    if (deliveryUrl?.value.trim() && !deliveryUrl.validity.valid && !firstInvalid) {
        setInvalid(deliveryUrl, true);
        firstInvalid = deliveryUrl;
        message = 'Введите корректный URL скрипта доставки.';
    }

    return { valid: !firstInvalid, firstInvalid, message };
}

function getProfileState(page) {
    const fields = {};
    const switches = {};
    const checkboxes = {};
    const steppers = {};

    page.querySelectorAll('input[name], textarea[name], select[name]').forEach((control) => {
        fields[control.name] = control.value;
    });

    page.querySelectorAll('[data-profile-switch-control]').forEach((control) => {
        switches[control.dataset.profileSwitchControl] = isSwitchOn(control);
    });

    page.querySelectorAll('[data-profile-checkbox-control]').forEach((control) => {
        checkboxes[control.dataset.profileCheckboxControl] = control.classList.contains('is-checked');
    });

    page.querySelectorAll('[data-profile-stepper-control]').forEach((control) => {
        const value = control.querySelector('[data-profile-stepper-value]');
        steppers[control.dataset.profileStepperControl] = value?.textContent.trim() ?? '0';
    });

    return { fields, switches, checkboxes, steppers };
}

function restoreProfileState(page, state) {
    Object.entries(state.fields).forEach(([name, value]) => {
        const control = page.querySelector(`[name="${name}"]`);
        if (control) {
            control.value = value;
            setInvalid(control, false);
        }
    });

    Object.entries(state.switches).forEach(([name, enabled]) => {
        const control = page.querySelector(`[data-profile-switch-control="${name}"]`);
        if (control) setSwitchState(control, enabled);
    });

    Object.entries(state.checkboxes).forEach(([name, checked]) => {
        const control = page.querySelector(`[data-profile-checkbox-control="${name}"]`);
        if (control) setCheckboxState(control, checked);
    });

    Object.entries(state.steppers).forEach(([name, value]) => {
        const control = page.querySelector(`[data-profile-stepper-control="${name}"]`);
        const target = control?.querySelector('[data-profile-stepper-value]');
        if (target) target.textContent = value;
    });
}

function syncPasswordSwitches(page, changedControl) {
    const all = page.querySelector('[data-profile-switch-control="password_all"]');
    const cabinet = page.querySelector('[data-profile-switch-control="password_cabinet"]');
    const api = page.querySelector('[data-profile-switch-control="password_api"]');

    if (!all || !cabinet || !api) return;

    if (changedControl === all) {
        const enabled = isSwitchOn(all);
        setSwitchState(cabinet, enabled);
        setSwitchState(api, enabled);
        return;
    }

    setSwitchState(all, isSwitchOn(cabinet) && isSwitchOn(api));
}

function getPasswordTargets(page) {
    const cabinet = page.querySelector('[data-profile-switch-control="password_cabinet"]');
    const api = page.querySelector('[data-profile-switch-control="password_api"]');
    const targets = [];

    if (cabinet && isSwitchOn(cabinet)) targets.push('Личный кабинет');
    if (api && isSwitchOn(api)) targets.push('API/SMPP');

    return targets;
}

function createPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'cabinet-modal cabinet-profile-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'profilePasswordModalTitle');
    modal.setAttribute('data-profile-password-modal', '');
    modal.innerHTML = `
        <section class="cabinet-profile-modal__dialog" role="document" tabindex="-1">
            <div class="cabinet-profile-modal__head">
                <h2 class="cabinet-profile-modal__title" id="profilePasswordModalTitle">Изменить пароль</h2>
                <button class="cabinet-profile-modal__close" type="button" aria-label="Закрыть" data-profile-password-close>
                    <svg class="cabinet-icon" aria-hidden="true"><use href="assets/images/cabinet-icons.svg#icon-modal-close"></use></svg>
                </button>
            </div>
            <form class="cabinet-profile-modal__form" data-profile-password-form>
                <p class="cabinet-profile-modal__target">Пароль будет изменён для: <strong data-profile-password-targets></strong></p>
                <label class="cabinet-profile-field">
                    <span class="cabinet-profile-field__label">Текущий пароль:</span>
                    <input class="cabinet-profile-input" type="password" name="current_password" autocomplete="current-password" required>
                </label>
                <label class="cabinet-profile-field">
                    <span class="cabinet-profile-field__label">Новый пароль:</span>
                    <input class="cabinet-profile-input" type="password" name="new_password" autocomplete="new-password" required minlength="8">
                </label>
                <label class="cabinet-profile-field">
                    <span class="cabinet-profile-field__label">Повторите новый пароль:</span>
                    <input class="cabinet-profile-input" type="password" name="confirm_password" autocomplete="new-password" required minlength="8">
                </label>
                <p class="cabinet-profile-modal__error" role="alert" hidden data-profile-password-error></p>
                <div class="cabinet-profile-modal__actions">
                    <button class="cabinet-modal-button cabinet-modal-button--secondary" type="button" data-profile-password-close>Отменить</button>
                    <button class="cabinet-modal-button cabinet-modal-button--primary" type="submit">Сохранить пароль</button>
                </div>
            </form>
        </section>
    `;

    document.body.append(modal);
    bindPasswordModal(modal);
    return modal;
}

function closePasswordModal() {
    if (!passwordModal) return;

    closeModalLayer(passwordModal, {
        afterClose: () => {
            document.body.classList.remove('is-cabinet-modal-open');
            activePasswordTrigger?.focus();
            activePasswordTrigger = null;
        },
    });
}

function showPasswordError(modal, message) {
    const error = modal.querySelector('[data-profile-password-error]');
    if (!error) return;

    error.textContent = message;
    error.hidden = false;
}

function bindPasswordModal(modal) {
    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.closest('[data-profile-password-close]')) {
            closePasswordModal();
        }
    });

    modal.addEventListener('submit', (event) => {
        event.preventDefault();

        const form = event.target;
        const current = form.elements.current_password;
        const next = form.elements.new_password;
        const confirm = form.elements.confirm_password;

        form.querySelector('[data-profile-password-error]')?.setAttribute('hidden', '');
        [current, next, confirm].forEach((control) => setInvalid(control, false));

        if (!current.value.trim()) {
            setInvalid(current, true);
            showPasswordError(modal, 'Введите текущий пароль.');
            current.focus();
            return;
        }

        if (next.value.length < 8) {
            setInvalid(next, true);
            showPasswordError(modal, 'Новый пароль должен быть не короче 8 символов.');
            next.focus();
            return;
        }

        if (next.value !== confirm.value) {
            setInvalid(confirm, true);
            showPasswordError(modal, 'Пароли не совпадают.');
            confirm.focus();
            return;
        }

        const targetText = modal.querySelector('[data-profile-password-targets]')?.textContent.trim() || 'выбранных разделов';
        form.reset();
        closePasswordModal();
        showProfileToast(`Пароль изменён для: ${targetText}.`, 'success');
    });
}

function openPasswordModal(page, trigger) {
    const targets = getPasswordTargets(page);

    if (!targets.length) {
        showProfileToast('Выберите, где нужно изменить пароль.', 'warning');
        return;
    }

    passwordModal = passwordModal || createPasswordModal();
    activePasswordTrigger = trigger;

    const form = passwordModal.querySelector('[data-profile-password-form]');
    const target = passwordModal.querySelector('[data-profile-password-targets]');
    const error = passwordModal.querySelector('[data-profile-password-error]');

    form?.reset();
    form?.querySelectorAll('[aria-invalid="true"]').forEach((control) => setInvalid(control, false));
    if (target) target.textContent = targets.join(' и ');
    if (error) {
        error.textContent = '';
        error.hidden = true;
    }

    document.body.classList.add('is-cabinet-modal-open');
    openModalLayer(passwordModal);
    passwordModal.querySelector('.cabinet-profile-modal__dialog')?.focus({ preventScroll: true });
}

function handleAltegioConnect(button) {
    if (button.classList.contains('is-pending')) {
        showProfileToast('Заявка на подключение Altegio уже отправлена.', 'info');
        return;
    }

    button.classList.add('is-pending');
    button.setAttribute('aria-disabled', 'true');
    button.querySelector('span:last-child').textContent = 'Заявка отправлена';
    showProfileToast('Заявка на подключение Altegio отправлена.', 'success');
}

function setActiveProfileTab(page, tabName) {
    const activeTab = tabName === 'senders' ? 'senders' : 'settings';

    document.querySelectorAll('[data-profile-tab-button]').forEach((button) => {
        const isActive = button.dataset.profileTabButton === activeTab;

        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', String(isActive));

        if (isActive) {
            button.setAttribute('aria-current', 'page');
        } else {
            button.removeAttribute('aria-current');
        }
    });

    page.querySelectorAll('[data-profile-tab-panel]').forEach((panel) => {
        const isActive = panel.dataset.profileTabPanel === activeTab;

        panel.hidden = !isActive;
        panel.classList.toggle('is-active', isActive);
    });

    if (activeTab !== 'senders') {
        closeSenderPopover(page, { restoreFocus: false });
    }

    closeHelpTooltips(page);
}

function getInitialProfileTab(params) {
    if (
        params.get('tab') === 'senders' ||
        window.location.hash === '#profile-senders' ||
        window.location.hash === '#senders' ||
        window.location.hash === '#sender-new' ||
        window.location.hash === '#senders-new'
    ) {
        return 'senders';
    }

    return 'settings';
}

function getSenderPopover(page) {
    return page.querySelector('[data-profile-sender-popover]');
}

function clearSenderError(popover) {
    const input = popover?.querySelector('[data-profile-sender-input]');
    const error = popover?.querySelector('[data-profile-sender-error]');

    setInvalid(input, false);

    if (error) {
        error.textContent = '';
        error.hidden = true;
    }
}

function showSenderError(popover, message) {
    const input = popover?.querySelector('[data-profile-sender-input]');
    const error = popover?.querySelector('[data-profile-sender-error]');

    setInvalid(input, true);

    if (error) {
        error.textContent = message;
        error.hidden = false;
    }

    input?.focus();
}

function openSenderPopover(page, trigger) {
    const popover = getSenderPopover(page);
    if (!popover) return;

    window.clearTimeout(senderPopoverTimer);
    activeSenderTrigger = trigger || null;

    clearSenderError(popover);
    popover.hidden = false;
    popover.getBoundingClientRect();

    window.requestAnimationFrame(() => {
        popover.classList.add('is-open');
        const input = popover.querySelector('[data-profile-sender-input]');
        input?.focus({ preventScroll: true });
        input?.select();
    });
}

function closeSenderPopover(page, { restoreFocus = true } = {}) {
    const popover = getSenderPopover(page);
    if (!popover || popover.hidden) return;

    popover.classList.remove('is-open');
    window.clearTimeout(senderPopoverTimer);

    senderPopoverTimer = window.setTimeout(() => {
        if (!popover.classList.contains('is-open')) {
            popover.hidden = true;
            clearSenderError(popover);
            if (restoreFocus) activeSenderTrigger?.focus();
            activeSenderTrigger = null;
        }
    }, 280);
}

function downloadSenderApplication() {
    const text = [
        'Заявка на согласование имени отправителя',
        '',
        'Имя отправителя:',
        'Организация:',
        'Лицевой счёт:',
        'Контактное лицо:',
        'Телефон:',
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'sender-name-application.txt';
    document.body.append(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showProfileToast('Форма заявки подготовлена к скачиванию.', 'success');
}

function senderNameExists(page, name) {
    const normalizedName = name.toLocaleLowerCase('ru-RU');

    return Array.from(page.querySelectorAll('[data-profile-sender-row]')).some((row) => {
        return row.dataset.name?.toLocaleLowerCase('ru-RU') === normalizedName;
    });
}

function refreshSenderRowStripes(body) {
    Array.from(body.querySelectorAll('[data-profile-sender-row]')).forEach((row, index) => {
        row.classList.toggle('is-muted', index % 2 === 0);
    });
}

function appendSenderRow(page, name) {
    const body = page.querySelector('[data-profile-senders-body]');
    if (!body) return;

    const row = document.createElement('div');
    row.className = 'cabinet-profile-senders-table__row is-muted';
    row.setAttribute('role', 'row');
    row.setAttribute('data-profile-sender-row', '');
    row.dataset.name = name;
    row.dataset.status = 'pending';
    row.dataset.statusOrder = '1';
    row.innerHTML = `
        <div class="cabinet-profile-senders-table__cell cabinet-profile-senders-table__cell--name" role="cell">
            <span class="cabinet-profile-senders-table__name" data-profile-sender-row-name></span>
        </div>
        <div class="cabinet-profile-senders-table__cell cabinet-profile-senders-table__cell--status" role="cell">
            <span class="cabinet-profile-senders-status cabinet-profile-senders-status--pending">
                <span class="cabinet-profile-senders-status__line"><strong>На согласовании</strong></span>
                <span class="cabinet-profile-senders-status__meta">Ожидает подтверждения</span>
            </span>
        </div>
    `;

    const nameTarget = row.querySelector('[data-profile-sender-row-name]');
    if (nameTarget) nameTarget.textContent = name;

    body.append(row);
    refreshSenderRowStripes(body);
}

function handleSenderSubmit(page, form) {
    const popover = getSenderPopover(page);
    const input = form.elements.sender_name;
    const name = input.value.trim();
    const namePattern = /^[\p{L}\p{N}._-]{2,11}$/u;

    clearSenderError(popover);

    if (!name) {
        showSenderError(popover, 'Введите имя отправителя.');
        return;
    }

    if (!namePattern.test(name)) {
        showSenderError(popover, 'Используйте 2-11 символов: буквы, цифры, точка, дефис или подчёркивание.');
        return;
    }

    if (senderNameExists(page, name)) {
        showSenderError(popover, 'Такое имя уже есть в списке.');
        return;
    }

    appendSenderRow(page, name);
    closeSenderPopover(page, { restoreFocus: true });
    showProfileToast(`Имя отправителя ${name} отправлено на согласование.`, 'success');
}

function sortSenderRows(page, button) {
    const key = button.dataset.profileSenderSort;
    const body = page.querySelector('[data-profile-senders-body]');
    if (!key || !body) return;

    const currentDirection = button.dataset.sortDirection === 'asc' ? 'desc' : 'asc';
    const rows = Array.from(body.querySelectorAll('[data-profile-sender-row]'));

    rows.sort((rowA, rowB) => {
        const valueA = key === 'status' ? Number(rowA.dataset.statusOrder || 0) : rowA.dataset.name || '';
        const valueB = key === 'status' ? Number(rowB.dataset.statusOrder || 0) : rowB.dataset.name || '';
        const result = typeof valueA === 'number'
            ? valueA - valueB
            : String(valueA).localeCompare(String(valueB), 'ru', { sensitivity: 'base' });

        return currentDirection === 'asc' ? result : -result;
    });

    page.querySelectorAll('[data-profile-sender-sort]').forEach((sortButton) => {
        sortButton.dataset.sortDirection = '';
        sortButton.closest('[role="columnheader"]')?.setAttribute('aria-sort', 'none');
    });

    button.dataset.sortDirection = currentDirection;
    button.closest('[role="columnheader"]')?.setAttribute('aria-sort', currentDirection === 'asc' ? 'ascending' : 'descending');
    rows.forEach((row) => body.append(row));
    refreshSenderRowStripes(body);
}

export function initCabinetProfilePage() {
    const page = document.querySelector('[data-cabinet-profile-page]');
    if (!page) return;

    const settings = page.querySelector('[data-profile-settings]');
    const params = new URLSearchParams(window.location.search);
    const initialTab = getInitialProfileTab(params);
    const shouldOpenSettings = params.get('state') === 'open' || window.location.hash === '#profile-open';
    let savedState = getProfileState(page);

    setActiveProfileTab(page, initialTab);

    document.querySelectorAll('[data-profile-tab-button]').forEach((button) => {
        button.addEventListener('click', () => {
            setActiveProfileTab(page, button.dataset.profileTabButton);
        });
    });

    if (settings) {
        settings.querySelectorAll('[data-profile-section]').forEach((section) => {
            setSectionExpanded(section, shouldOpenSettings || section.classList.contains('is-expanded'));
        });

        settings.querySelectorAll('[data-profile-toggle]').forEach((toggle) => {
            const section = toggle.closest('[data-profile-section]');
            if (!section) return;

            toggle.addEventListener('click', () => {
                setSectionExpanded(section, !section.classList.contains('is-expanded'), { animate: true });
            });
        });
    }

    page.querySelectorAll('[data-profile-switch-control]').forEach((control) => {
        setSwitchState(control, isSwitchOn(control));
        control.addEventListener('click', () => {
            setSwitchState(control, !isSwitchOn(control));
            if (control.dataset.profilePasswordScope) {
                syncPasswordSwitches(page, control);
            }
        });
    });

    page.querySelectorAll('[data-profile-checkbox]').forEach((button) => {
        setCheckboxState(button, button.classList.contains('is-checked'));
        button.addEventListener('click', () => {
            setCheckboxState(button, !button.classList.contains('is-checked'));
        });
    });

    page.querySelectorAll('[data-profile-help]').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();

            const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
            closeHelpTooltips(page, button);
            setHelpTooltipState(button, shouldOpen);
        });
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('[data-profile-sender-popover], [data-profile-sender-add-open]')) {
            closeSenderPopover(page, { restoreFocus: false });
        }

        if (!event.target.closest('[data-profile-help], [data-profile-tooltip]')) {
            closeHelpTooltips(page);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        if (passwordModal && !passwordModal.hidden) {
            closePasswordModal();
            return;
        }

        if (getSenderPopover(page)?.classList.contains('is-open')) {
            closeSenderPopover(page, { restoreFocus: true });
            return;
        }

        const activeHelp = page.querySelector('[data-profile-help][aria-expanded="true"]');
        closeHelpTooltips(page);
        activeHelp?.focus();
    });

    page.querySelectorAll('[data-profile-stepper]').forEach((stepper) => {
        const value = stepper.querySelector('[data-profile-stepper-value]');
        const min = Number(stepper.dataset.min ?? 0);
        const step = Number(stepper.dataset.step ?? 1);

        stepper.addEventListener('click', (event) => {
            const button = event.target.closest('[data-profile-stepper-action]');
            if (!button || !value) return;

            const current = Number(value.textContent.trim()) || 0;
            const direction = button.dataset.profileStepperAction === 'increase' ? 1 : -1;
            value.textContent = String(Math.max(min, current + direction * step));
        });
    });

    page.querySelector('[data-profile-cancel]')?.addEventListener('click', () => {
        restoreProfileState(page, savedState);
        showProfileToast('Правки отменены.', 'info');
    });

    page.querySelector('[data-profile-save]')?.addEventListener('click', () => {
        const result = validateProfile(page);

        if (!result.valid) {
            showProfileToast(result.message, 'warning');
            result.firstInvalid?.focus();
            return;
        }

        savedState = getProfileState(page);
        showProfileToast('Изменения профиля сохранены.', 'success');
    });

    page.querySelector('[data-profile-password-open]')?.addEventListener('click', (event) => {
        openPasswordModal(page, event.currentTarget);
    });

    page.querySelector('[data-profile-altegio]')?.addEventListener('click', (event) => {
        handleAltegioConnect(event.currentTarget);
    });

    page.querySelector('[data-profile-sender-application]')?.addEventListener('click', () => {
        downloadSenderApplication();
    });

    page.querySelector('[data-profile-sender-add-open]')?.addEventListener('click', (event) => {
        event.stopPropagation();
        setActiveProfileTab(page, 'senders');
        openSenderPopover(page, event.currentTarget);
    });

    page.querySelectorAll('[data-profile-sender-close]').forEach((button) => {
        button.addEventListener('click', () => {
            closeSenderPopover(page, { restoreFocus: true });
        });
    });

    page.querySelector('[data-profile-sender-form]')?.addEventListener('submit', (event) => {
        event.preventDefault();
        handleSenderSubmit(page, event.currentTarget);
    });

    page.querySelectorAll('[data-profile-sender-sort]').forEach((button) => {
        button.addEventListener('click', () => {
            sortSenderRows(page, button);
        });
    });

    if (initialTab === 'senders' && (params.get('sender') === 'new' || window.location.hash === '#sender-new' || window.location.hash === '#senders-new')) {
        openSenderPopover(page, page.querySelector('[data-profile-sender-add-open]'));
    }
}
