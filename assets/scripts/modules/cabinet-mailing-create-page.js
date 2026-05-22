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

    const steps = Array.from(page.querySelectorAll('[data-mailing-create-step]'));
    const form = page.querySelector('[data-mailing-create-form]');
    const nameInput = page.querySelector('[data-mailing-create-name]');
    const senderSelect = page.querySelector('[data-mailing-create-sender]');
    const status = page.querySelector('[data-mailing-create-status]');
    const helpButton = page.querySelector('[data-mailing-create-help]');
    const helpTooltip = page.querySelector('[data-mailing-create-help-tooltip]');

    steps.forEach((step) => {
        step.addEventListener('click', () => {
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
    helpButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!helpTooltip) return;

        const isOpen = !helpTooltip.hidden;
        helpTooltip.hidden = isOpen;
        helpButton.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', (event) => {
        if (!helpTooltip || helpTooltip.hidden) return;
        if (helpTooltip.contains(event.target) || helpButton?.contains(event.target)) return;

        helpTooltip.hidden = true;
        helpButton?.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !helpTooltip || helpTooltip.hidden) return;

        helpTooltip.hidden = true;
        helpButton?.setAttribute('aria-expanded', 'false');
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

        setActiveStep(steps, 2);
        if (status) {
            status.textContent = 'Параметры рассылки сохранены. Открыт шаг списка получателей.';
        }
    });
}
