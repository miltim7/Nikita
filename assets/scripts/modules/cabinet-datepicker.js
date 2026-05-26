const LOCALES = {
    ru: {
        months: [
            'Январь',
            'Февраль',
            'Март',
            'Апрель',
            'Май',
            'Июнь',
            'Июль',
            'Август',
            'Сентябрь',
            'Октябрь',
            'Ноябрь',
            'Декабрь',
        ],
        weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        dialogLabel: 'Выбор даты',
        prevMonth: 'Предыдущий месяц',
        nextMonth: 'Следующий месяц',
        monthLabel: 'Месяц',
        yearLabel: 'Год',
        openCalendar: 'Открыть календарь',
    },
    en: {
        months: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ],
        weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dialogLabel: 'Choose date',
        prevMonth: 'Previous month',
        nextMonth: 'Next month',
        monthLabel: 'Month',
        yearLabel: 'Year',
        openCalendar: 'Open calendar',
    },
    ky: {
        months: [
            'Январь',
            'Февраль',
            'Март',
            'Апрель',
            'Май',
            'Июнь',
            'Июль',
            'Август',
            'Сентябрь',
            'Октябрь',
            'Ноябрь',
            'Декабрь',
        ],
        weekdays: ['Дш', 'Шш', 'Шр', 'Бш', 'Жм', 'Иш', 'Жк'],
        dialogLabel: 'Күндү тандоо',
        prevMonth: 'Мурунку ай',
        nextMonth: 'Кийинки ай',
        monthLabel: 'Ай',
        yearLabel: 'Жыл',
        openCalendar: 'Календарды ачуу',
    },
};

const DATE_INPUT_SELECTOR = 'input[type="text"][inputmode="numeric"]';
const DATE_VALUE_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const DATE_NAME_PATTERN = /(^|_)(date|period|birth)(_|$)/i;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

let activeInput = null;
let activeMonth = null;
let picker = null;
let suppressFocusOpen = false;

function getLocale() {
    const lang = document.documentElement.lang?.toLowerCase() || 'ru';
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('ky')) return 'ky';
    return 'ru';
}

function getLabels() {
    return LOCALES[getLocale()] || LOCALES.ru;
}

function padDatePart(value) {
    return String(value).padStart(2, '0');
}

function formatDate(date) {
    return `${padDatePart(date.getDate())}.${padDatePart(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function parseDate(value) {
    const match = value.trim().match(DATE_VALUE_PATTERN);
    if (!match) return null;

    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    const date = new Date(year, month, day);

    if (
        date.getFullYear() !== year
        || date.getMonth() !== month
        || date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

function isDateInput(input) {
    const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
    const dataKeys = Object.keys(input.dataset).join('-');
    const name = input.name || '';

    return placeholder.includes('гггг')
        || placeholder.includes('yyyy')
        || DATE_NAME_PATTERN.test(name)
        || DATE_NAME_PATTERN.test(dataKeys);
}

function formatTypedDate(input) {
    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
    input.value = parts.join('.');
}

function clampYear(year) {
    return Math.min(MAX_YEAR, Math.max(MIN_YEAR, Number(year) || new Date().getFullYear()));
}

function clampToMonthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function createPicker() {
    const labels = getLabels();
    const element = document.createElement('div');

    element.className = 'cabinet-datepicker';
    element.hidden = true;
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-label', labels.dialogLabel);
    element.innerHTML = `
        <div class="cabinet-datepicker__head">
            <button class="cabinet-datepicker__nav" type="button" aria-label="${labels.prevMonth}" data-datepicker-prev></button>
            <label class="cabinet-datepicker__control">
                <span class="visually-hidden">${labels.monthLabel}</span>
                <select class="cabinet-datepicker__select" data-datepicker-month></select>
            </label>
            <label class="cabinet-datepicker__control cabinet-datepicker__control--year">
                <span class="visually-hidden">${labels.yearLabel}</span>
                <input class="cabinet-datepicker__year" type="number" min="${MIN_YEAR}" max="${MAX_YEAR}" step="1" data-datepicker-year>
            </label>
            <button class="cabinet-datepicker__nav cabinet-datepicker__nav--next" type="button" aria-label="${labels.nextMonth}" data-datepicker-next></button>
        </div>
        <div class="cabinet-datepicker__weekdays" aria-hidden="true"></div>
        <div class="cabinet-datepicker__grid" role="grid"></div>
    `;

    element.querySelector('[data-datepicker-month]').innerHTML = labels.months
        .map((month, index) => `<option value="${index}">${month}</option>`)
        .join('');
    element.querySelector('.cabinet-datepicker__weekdays').innerHTML = labels.weekdays
        .map((day) => `<span>${day}</span>`)
        .join('');
    document.body.append(element);

    element.querySelector('[data-datepicker-prev]').addEventListener('click', () => {
        activeMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1);
        renderPicker();
    });

    element.querySelector('[data-datepicker-next]').addEventListener('click', () => {
        activeMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1);
        renderPicker();
    });

    element.querySelector('[data-datepicker-month]').addEventListener('change', (event) => {
        activeMonth = new Date(activeMonth.getFullYear(), Number(event.target.value), 1);
        renderPicker();
    });

    element.querySelector('[data-datepicker-year]').addEventListener('change', (event) => {
        activeMonth = new Date(clampYear(event.target.value), activeMonth.getMonth(), 1);
        renderPicker();
    });

    return element;
}

function getPicker() {
    picker = picker || createPicker();
    return picker;
}

function setInputDate(input, date) {
    input.value = formatDate(date);
    input.setAttribute('aria-invalid', 'false');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

function renderPicker() {
    if (!picker || !activeInput || !activeMonth) return;

    const selectedDate = parseDate(activeInput.value);
    const today = new Date();
    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - startOffset);
    const monthSelect = picker.querySelector('[data-datepicker-month]');
    const yearInput = picker.querySelector('[data-datepicker-year]');
    const grid = picker.querySelector('.cabinet-datepicker__grid');

    monthSelect.value = String(month);
    yearInput.value = String(year);
    grid.innerHTML = '';

    for (let index = 0; index < 42; index += 1) {
        const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
        const isCurrentMonth = date.getMonth() === month;
        const isToday = formatDate(date) === formatDate(today);
        const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
        const button = document.createElement('button');

        button.className = 'cabinet-datepicker__day';
        button.type = 'button';
        button.textContent = String(date.getDate());
        button.dataset.date = formatDate(date);
        button.setAttribute('role', 'gridcell');
        button.setAttribute('aria-label', formatDate(date));
        button.classList.toggle('is-muted', !isCurrentMonth);
        button.classList.toggle('is-today', isToday);
        button.classList.toggle('is-selected', Boolean(isSelected));
        button.setAttribute('aria-selected', String(Boolean(isSelected)));
        button.addEventListener('click', () => {
            setInputDate(activeInput, date);
            closeDatepicker({ restoreFocus: true });
        });
        grid.append(button);
    }
}

function positionPicker(input) {
    const element = getPicker();
    const rect = input.getBoundingClientRect();
    const gap = 8;
    const pickerWidth = 320;
    const pickerHeight = 336;
    const viewportPadding = 12;
    const left = Math.min(
        window.innerWidth - pickerWidth - viewportPadding,
        Math.max(viewportPadding, rect.left),
    );
    const shouldOpenAbove = rect.bottom + gap + pickerHeight > window.innerHeight
        && rect.top > pickerHeight + gap;
    const top = shouldOpenAbove
        ? rect.top - pickerHeight - gap
        : rect.bottom + gap;

    element.style.left = `${left}px`;
    element.style.top = `${Math.max(viewportPadding, top)}px`;
}

function openDatepicker(input) {
    activeInput = input;
    activeMonth = clampToMonthStart(parseDate(input.value) || new Date());

    const element = getPicker();
    element.hidden = false;
    element.classList.add('is-open');
    positionPicker(input);
    renderPicker();
}

function closeDatepicker({ restoreFocus = false } = {}) {
    if (!picker || picker.hidden) return;

    picker.classList.remove('is-open');
    picker.hidden = true;

    if (restoreFocus) {
        suppressFocusOpen = true;
        activeInput?.focus({ preventScroll: true });
        window.requestAnimationFrame(() => {
            suppressFocusOpen = false;
        });
    }

    activeInput = null;
    activeMonth = null;
}

function bindDateInput(input) {
    if (input.dataset.cabinetDatepicker === 'ready') return;

    input.dataset.cabinetDatepicker = 'ready';
    input.autocomplete = 'off';
    input.maxLength = 10;
    input.setAttribute('aria-haspopup', 'dialog');

    const icon = input.parentElement?.querySelector('img, [class*="icon"]');
    if (icon) {
        icon.removeAttribute('aria-hidden');
        icon.setAttribute('role', 'button');
        icon.setAttribute('tabindex', '0');
        icon.setAttribute('aria-label', getLabels().openCalendar);
        icon.dataset.cabinetDatepickerTrigger = 'true';
        icon.addEventListener('click', (event) => {
            event.preventDefault();
            openDatepicker(input);
        });
        icon.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            openDatepicker(input);
        });
    }

    input.addEventListener('input', () => {
        formatTypedDate(input);
        input.removeAttribute('aria-invalid');
    });

    input.addEventListener('focus', () => {
        if (suppressFocusOpen) return;
        openDatepicker(input);
    });
    input.addEventListener('click', () => openDatepicker(input));
    input.addEventListener('blur', () => {
        if (!input.value || parseDate(input.value)) {
            input.removeAttribute('aria-invalid');
            return;
        }

        input.setAttribute('aria-invalid', 'true');
    });
}

export function initCabinetDatepickers() {
    const inputs = Array.from(document.querySelectorAll(DATE_INPUT_SELECTOR)).filter(isDateInput);
    if (!inputs.length) return;

    inputs.forEach(bindDateInput);

    document.addEventListener('pointerdown', (event) => {
        if (!picker || picker.hidden) return;
        if (picker.contains(event.target) || event.target === activeInput) return;
        if (event.target.closest('[data-cabinet-datepicker-trigger]')) return;
        closeDatepicker();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDatepicker({ restoreFocus: true });
        }
    });

    window.addEventListener('resize', () => {
        if (activeInput && picker && !picker.hidden) {
            positionPicker(activeInput);
        }
    });

    window.addEventListener('scroll', () => {
        if (activeInput && picker && !picker.hidden) {
            positionPicker(activeInput);
        }
    }, true);
}
