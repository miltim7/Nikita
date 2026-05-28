function setActiveStep(steps, nextStep) {
    steps.forEach((step) => {
        const isCurrent = step.dataset.mailingCreateStep === String(nextStep);

        step.classList.toggle('is-active', isCurrent);
        if (isCurrent) {
            step.setAttribute('aria-current', 'step');
        } else {
            step.removeAttribute('aria-current');
        }
    });
}

function setInvalid(control, invalid) {
    if (!control) return;

    if (invalid) {
        control.setAttribute('aria-invalid', 'true');
    } else {
        control.removeAttribute('aria-invalid');
    }
}

export function initCabinetMailingCreatePage() {
    const page = document.querySelector('[data-cabinet-mailing-create-page]');
    if (!page) return;

    const recipientsUrl = 'mailing-create-recipients.html';
    const steps = Array.from(page.querySelectorAll('[data-mailing-create-step]'));
    const form = page.querySelector('[data-mailing-create-form]');
    const nameInput = page.querySelector('[data-mailing-create-name]');
    const senderSelect = page.querySelector('[data-mailing-create-sender]');
    const status = page.querySelector('[data-mailing-create-status]');
    const helpButton = page.querySelector('[data-mailing-create-help]');
    const helpTooltip = page.querySelector('[data-mailing-create-help-tooltip]');
    let isHelpPinned = false;
    let helpCloseTimer = null;

    const clearHelpCloseTimer = () => {
        if (!helpCloseTimer) return;
        window.clearTimeout(helpCloseTimer);
        helpCloseTimer = null;
    };

    const setHelpTooltipOpen = (open, { pinned = false } = {}) => {
        if (!helpTooltip || !helpButton) return;

        clearHelpCloseTimer();
        isHelpPinned = open && pinned;
        helpTooltip.hidden = !open;
        helpButton.classList.toggle('is-active', open);
        helpButton.setAttribute('aria-expanded', String(open));
    };

    const scheduleHelpTooltipClose = () => {
        clearHelpCloseTimer();
        if (isHelpPinned) return;

        helpCloseTimer = window.setTimeout(() => {
            setHelpTooltipOpen(false);
        }, 120);
    };

    steps.forEach((step) => {
        step.addEventListener('click', () => {
            if (step.dataset.mailingCreateStep === '2') {
                form?.requestSubmit();
                return;
            }

            setActiveStep(steps, step.dataset.mailingCreateStep);
        });
    });

    nameInput?.addEventListener('input', () => {
        if (nameInput.value.trim()) {
            setInvalid(nameInput, false);
        }
    });

    senderSelect?.addEventListener('change', () => {
        if (senderSelect.value) {
            setInvalid(senderSelect, false);
        }
    });

    helpButton?.setAttribute('aria-expanded', 'false');
    helpButton?.addEventListener('mouseenter', () => {
        if (isHelpPinned) return;
        setHelpTooltipOpen(true);
    });
    helpButton?.addEventListener('mouseleave', scheduleHelpTooltipClose);
    helpButton?.addEventListener('focus', () => {
        if (isHelpPinned) return;
        setHelpTooltipOpen(true);
    });
    helpButton?.addEventListener('blur', scheduleHelpTooltipClose);
    helpButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        document.dispatchEvent(new CustomEvent('cabinet:close-floating-help-tooltips'));
        setHelpTooltipOpen(true, { pinned: true });
    });
    helpTooltip?.addEventListener('mouseenter', clearHelpCloseTimer);
    helpTooltip?.addEventListener('mouseleave', scheduleHelpTooltipClose);
    helpTooltip?.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.addEventListener('click', (event) => {
        if (!helpTooltip || helpTooltip.hidden) return;
        if (helpTooltip.contains(event.target) || helpButton?.contains(event.target)) return;

        setHelpTooltipOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !helpTooltip || helpTooltip.hidden) return;

        setHelpTooltipOpen(false);
        helpButton?.focus();
    });

    form?.addEventListener('submit', (event) => {
        event.preventDefault();

        const emptyName = !nameInput?.value.trim();
        const emptySender = !senderSelect?.value;

        setInvalid(nameInput, emptyName);
        setInvalid(senderSelect, emptySender);

        if (emptyName || emptySender) {
            const firstInvalid = emptyName ? nameInput : senderSelect;
            firstInvalid?.focus();
            if (status) {
                status.textContent = 'Заполните название рассылки и имя отправителя.';
            }
            return;
        }

        try {
            window.sessionStorage.setItem('nikitaMailingDraft', JSON.stringify({
                name: nameInput.value.trim(),
                sender: senderSelect.options[senderSelect.selectedIndex]?.textContent?.trim() || senderSelect.value
            }));
        } catch (error) {
            // Session storage is optional; navigation should not depend on it.
        }

        setActiveStep(steps, 2);
        if (status) {
            status.textContent = 'Параметры рассылки сохранены. Открыт шаг списка получателей.';
        }
        window.location.href = recipientsUrl;
    });
}
