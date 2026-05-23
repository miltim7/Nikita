function clampValue(value, min, max) {
    if (Number.isFinite(min) && value < min) {
        return min;
    }

    if (Number.isFinite(max) && value > max) {
        return max;
    }

    return value;
}

function setStepperValue(stepper, value) {
    const input = stepper.querySelector('[data-otp-stepper-value]');
    const min = Number(stepper.dataset.min);
    const max = Number(stepper.dataset.max);

    if (value === '') {
        if (input) {
            input.value = '';
        }

        return;
    }

    const numericValue = Number(value);
    const nextValue = clampValue(Number.isFinite(numericValue) ? numericValue : 0, min, max);

    if (input) {
        input.value = String(nextValue);
    }
}

function initSteppers(page) {
    page.querySelectorAll('[data-otp-stepper]').forEach((stepper) => {
        const input = stepper.querySelector('[data-otp-stepper-value]');
        const decrement = stepper.querySelector('[data-otp-stepper-decrement]');
        const increment = stepper.querySelector('[data-otp-stepper-increment]');
        const step = Number(stepper.dataset.step || 1);

        decrement?.addEventListener('click', () => {
            setStepperValue(stepper, Number(input?.value || 0) - step);
        });

        increment?.addEventListener('click', () => {
            setStepperValue(stepper, Number(input?.value || 0) + step);
        });
    });
}

function closeSelect(select) {
    const button = select.querySelector('[data-otp-select-button]');
    const menu = select.querySelector('[data-otp-select-menu]');

    select.classList.remove('is-open');
    button?.setAttribute('aria-expanded', 'false');

    if (menu) {
        window.setTimeout(() => {
            if (!select.classList.contains('is-open')) {
                menu.hidden = true;
            }
        }, 180);
    }
}

function initSenderSelect(page) {
    const select = page.querySelector('[data-otp-select]');

    if (!select) {
        return;
    }

    const button = select.querySelector('[data-otp-select-button]');
    const label = select.querySelector('[data-otp-select-label]');
    const menu = select.querySelector('[data-otp-select-menu]');

    button?.addEventListener('click', () => {
        const isOpen = select.classList.toggle('is-open');

        if (menu) {
            menu.hidden = false;
        }

        button.setAttribute('aria-expanded', String(isOpen));

        if (!isOpen) {
            closeSelect(select);
        }
    });

    menu?.querySelectorAll('[data-otp-select-option]').forEach((option) => {
        option.addEventListener('click', () => {
            if (label) {
                label.textContent = option.textContent?.trim() || 'Не выбрано';
            }

            menu.querySelectorAll('[aria-selected="true"]').forEach((selected) => {
                selected.setAttribute('aria-selected', 'false');
            });
            option.setAttribute('aria-selected', 'true');
            closeSelect(select);
        });
    });

    document.addEventListener('click', (event) => {
        if (!select.contains(event.target)) {
            closeSelect(select);
        }
    });
}

function initCopy(page) {
    const copyButton = page.querySelector('[data-otp-copy]');
    const source = page.querySelector('[data-otp-code]');

    copyButton?.addEventListener('click', async () => {
        const value = source?.value || '%code%';

        try {
            await navigator.clipboard?.writeText(value);
        } catch {
            source?.select?.();
            document.execCommand?.('copy');
        }

        copyButton.classList.add('is-copied');
        window.setTimeout(() => copyButton.classList.remove('is-copied'), 1200);
    });
}

function initFormActions(page) {
    const form = page.querySelector('[data-cabinet-otp-form]');
    const resetButton = page.querySelector('[data-otp-reset]');
    const selectLabel = page.querySelector('[data-otp-select-label]');
    const selectMenu = page.querySelector('[data-otp-select-menu]');

    resetButton?.addEventListener('click', () => {
        form?.reset();
        page.querySelectorAll('[data-otp-stepper]').forEach((stepper) => {
            const initial = stepper.dataset.initial ?? '';
            setStepperValue(stepper, initial);
        });

        if (selectLabel) {
            selectLabel.textContent = 'Не выбрано';
        }

        selectMenu?.querySelectorAll('[data-otp-select-option]').forEach((option, index) => {
            option.setAttribute('aria-selected', String(index === 0));
        });
    });

    form?.addEventListener('submit', (event) => {
        event.preventDefault();
    });
}

export function initCabinetOtpPage() {
    const page = document.querySelector('[data-cabinet-otp-page]');

    if (!page) {
        return;
    }

    initSteppers(page);
    initSenderSelect(page);
    initCopy(page);
    initFormActions(page);
}
