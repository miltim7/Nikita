const PHONE_DIGITS = 9;
const SPEED_TEST_ICON = new URL('../../images/speed-test-icon.svg', import.meta.url).href;

function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, PHONE_DIGITS);
    const operator = digits.slice(0, 3);
    const first = digits.slice(3, 6);
    const second = digits.slice(6, 9);

    if (digits.length <= 3) return operator ? `(${operator}` : '';
    if (digits.length <= 6) return `(${operator}) ${first}`;
    return `(${operator}) ${first}-${second}`;
}

function renderWidget() {
    const widget = document.createElement('aside');
    widget.className = 'speed-test-widget';
    widget.id = 'speedTestWidget';
    widget.setAttribute('aria-label', 'Бесплатный тест SMS');
    widget.innerHTML = `
        <form class="speed-test-widget__panel" data-speed-test-form aria-hidden="true" novalidate>
            <h2 class="speed-test-widget__title">БЕСПЛАТНЫЙ ТЕСТ</h2>
            <label class="speed-test-widget__label" for="speedTestPhone">Укажите ваш телефон:</label>
            <div class="speed-test-widget__field">
                <span class="speed-test-widget__prefix">+996</span>
                <input class="speed-test-widget__input" id="speedTestPhone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="(XXX) XXX-XXX" aria-describedby="speedTestStatus" data-speed-test-input>
            </div>
            <button class="speed-test-widget__submit" type="submit" data-speed-test-submit>
                <span data-speed-test-submit-text>Отправить сообщение</span>
            </button>
            <p class="speed-test-widget__sr" id="speedTestStatus" aria-live="polite" data-speed-test-status></p>
        </form>
        <div class="speed-test-widget__tab">
            <button class="speed-test-widget__tab-button" type="button" aria-controls="speedTestWidget" aria-expanded="false" data-speed-test-toggle>
                <span class="speed-test-widget__tab-inner">
                    <img class="speed-test-widget__tab-icon" src="${SPEED_TEST_ICON}" alt="" aria-hidden="true">
                    <span class="speed-test-widget__tab-text">
                        <span class="speed-test-widget__tab-title">Отправить SMS</span>
                        <span class="speed-test-widget__tab-subtitle">Проверь скорость доставки</span>
                    </span>
                </span>
                <span class="speed-test-widget__sr">Открыть бесплатный тест SMS</span>
            </button>
        </div>
    `;

    return widget;
}

export function initSpeedTestWidget() {
    if (document.getElementById('speedTestWidget')) return;
    const triggers = Array.from(document.querySelectorAll('[data-speed-test-trigger]'));

    if (!triggers.length) return;

    const widget = renderWidget();
    document.body.append(widget);

    const toggle = widget.querySelector('[data-speed-test-toggle]');
    const input = widget.querySelector('[data-speed-test-input]');
    const form = widget.querySelector('[data-speed-test-form]');
    const submit = widget.querySelector('[data-speed-test-submit]');
    const submitText = widget.querySelector('[data-speed-test-submit-text]');
    const status = widget.querySelector('[data-speed-test-status]');
    let lastTrigger = null;

    const setTriggerState = (isOpen) => {
        widget.setAttribute('aria-hidden', String(!isOpen));
        toggle.setAttribute('aria-expanded', String(isOpen));
        form.setAttribute('aria-hidden', String(!isOpen));
        input.tabIndex = isOpen ? 0 : -1;
        submit.tabIndex = isOpen ? 0 : -1;

        triggers.forEach((trigger) => {
            trigger.setAttribute('aria-controls', 'speedTestWidget');
            trigger.setAttribute('aria-expanded', String(isOpen));
        });
    };

    const openWidget = (focusInput = false) => {
        widget.classList.add('is-open');
        setTriggerState(true);
        if (focusInput) input.focus({ preventScroll: true });
    };

    const closeWidget = () => {
        widget.classList.remove('is-open');
        setTriggerState(false);
        if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    };

    setTriggerState(false);

    toggle.addEventListener('click', () => {
        lastTrigger = toggle;
        if (widget.classList.contains('is-open')) {
            closeWidget();
        } else {
            openWidget(true);
        }
    });

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            event.preventDefault();
            lastTrigger = trigger;
            openWidget(true);
        });
    });

    input.addEventListener('input', () => {
        input.value = formatPhone(input.value);
        input.setCustomValidity('');
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const digits = input.value.replace(/\D/g, '');
        if (digits.length !== PHONE_DIGITS) {
            input.setCustomValidity('Введите 9 цифр номера после +996');
            input.reportValidity();
            return;
        }

        input.setCustomValidity('');
        status.textContent = 'Номер принят для тестового сообщения.';
        submit.disabled = true;
        submitText.textContent = 'Номер принят';

        window.setTimeout(() => {
            submit.disabled = false;
            submitText.textContent = 'Отправить сообщение';
            status.textContent = '';
        }, 1800);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && widget.classList.contains('is-open')) {
            closeWidget();
        }
    });

    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;

        if (!widget.classList.contains('is-open')) return;
        if (target && (widget.contains(target) || target.closest('[data-speed-test-trigger]'))) return;
        closeWidget();
    });
}
