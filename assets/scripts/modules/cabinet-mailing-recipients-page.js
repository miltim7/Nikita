import { closeModalLayer, openModalLayer } from './modal-transition.js';
import { bindHorizontalScrollbarDrag, syncHorizontalScrollbar } from './horizontal-scrollbar.js';

const MAP_SELECT_CHEVRON = new URL('../../images/cabinet-mailing-recipients/modal-select-chevron.svg', import.meta.url).href;
const MAP_SELECT_CHEVRON_ACTIVE = new URL('../../images/cabinet-mailing-recipients/modal-select-chevron-active.svg', import.meta.url).href;
const MESSAGE_MORE_ICON = new URL('../../images/cabinet-mailing-recipients/message-more.svg', import.meta.url).href;
const TABLE_DELETE_ICON = new URL('../../images/cabinet-mailing-recipients/table-delete.svg', import.meta.url).href;

function setInvalid(control, invalid) {
    if (!control) return;

    if (invalid) {
        control.setAttribute('aria-invalid', 'true');
    } else {
        control.removeAttribute('aria-invalid');
    }
}

function getStoredDraft() {
    try {
        return JSON.parse(window.sessionStorage.getItem('nikitaMailingDraft') || '{}');
    } catch (error) {
        return {};
    }
}

function updateDraftSummary(page) {
    const draft = getStoredDraft();
    const values = page.querySelectorAll('.cabinet-mailing-recipients__summary-value');

    if (draft.name && values[0]) {
        values[0].textContent = draft.name;
    }

    if (draft.sender && values[1]) {
        values[1].textContent = draft.sender;
    }
}

function clampAge(value) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return 0;
    return Math.min(120, Math.max(0, parsed));
}

function formatRecipientsCount(count) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    const formatted = String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    if (mod10 === 1 && mod100 !== 11) {
        return `${formatted} получатель`;
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return `${formatted} получателя`;
    }

    return `${formatted} получателей`;
}

function formatMailingsCount(count) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    const formatted = String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    if (mod10 >= 1 && mod10 <= 4 && (mod100 < 11 || mod100 > 14)) {
        return `${formatted} рассылки`;
    }

    return `${formatted} рассылок`;
}

function formatListsCount(count) {
    const formatted = String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return count === 1 ? `${formatted} списка` : `${formatted} списков`;
}

function formatPhone(code, value) {
    const trimmed = value.trim();
    const digits = trimmed.replace(/\D/g, '');

    if (digits.length === 9) {
        return `${code} (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    return `${code} ${trimmed}`;
}

function parseDateValue(value) {
    const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!match) return null;
    return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime();
}

export function initCabinetMailingRecipientsPage() {
    const page = document.querySelector('[data-cabinet-mailing-recipients-page]');
    if (!page) return;

    const resetPageHorizontalScroll = () => {
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
        window.scrollTo(0, window.scrollY);
    };

    const stabilizePageHorizontalScroll = () => {
        resetPageHorizontalScroll();
        [50, 150, 350, 700].forEach((delay) => {
            window.setTimeout(resetPageHorizontalScroll, delay);
        });
    };

    const form = page.querySelector('[data-mailing-recipients-form]');
    const tabs = Array.from(page.querySelectorAll('[data-mailing-recipients-tab]'));
    const steps = Array.from(page.querySelectorAll('[data-mailing-create-step]'));
    const nameInput = page.querySelector('[data-mailing-recipient-name]');
    const phoneInput = page.querySelector('[data-mailing-recipient-phone]');
    const codeSelect = page.querySelector('[data-mailing-recipient-code]');
    const genderSelect = page.querySelector('[data-mailing-recipient-gender]');
    const birthdayInput = page.querySelector('[data-mailing-recipient-birthday]');
    const ageInput = page.querySelector('[data-mailing-recipient-age]');
    const ageMinus = page.querySelector('[data-mailing-recipient-age-minus]');
    const agePlus = page.querySelector('[data-mailing-recipient-age-plus]');
    const addButton = page.querySelector('[data-mailing-recipient-add]');
    const emptyState = page.querySelector('[data-mailing-recipients-empty]');
    const selectedState = page.querySelector('[data-mailing-recipients-selected]');
    const tableBody = page.querySelector('[data-mailing-recipients-table-body]');
    const tableScroll = page.querySelector('[data-mailing-recipients-table-scroll]');
    const tableSlider = page.querySelector('[data-mailing-recipients-table-slider]');
    const tableThumb = page.querySelector('[data-mailing-recipients-table-thumb]');
    const selectedCount = page.querySelector('[data-mailing-recipients-count]');
    const sourcePanel = page.querySelector('[data-mailing-source-panel]');
    const sourceRows = Array.from(page.querySelectorAll('[data-mailing-source-row]'));
    const sourceChecks = Array.from(page.querySelectorAll('[data-mailing-source-row-check]'));
    const sourceSelectAll = page.querySelector('[data-mailing-source-select-all]');
    const sourceSearch = page.querySelector('[data-mailing-source-search]');
    const sourceDateFrom = page.querySelector('[data-mailing-source-date-from]');
    const sourceDateTo = page.querySelector('[data-mailing-source-date-to]');
    const sourceAgeFrom = page.querySelector('[data-mailing-source-age-from]');
    const sourceAgeTo = page.querySelector('[data-mailing-source-age-to]');
    const sourceAgeFromMinus = page.querySelector('[data-mailing-source-age-from-minus]');
    const sourceAgeFromPlus = page.querySelector('[data-mailing-source-age-from-plus]');
    const sourceAgeToMinus = page.querySelector('[data-mailing-source-age-to-minus]');
    const sourceAgeToPlus = page.querySelector('[data-mailing-source-age-to-plus]');
    const sourceGender = page.querySelector('[data-mailing-source-gender]');
    const sourceReset = page.querySelector('[data-mailing-source-reset]');
    const sourceRefresh = page.querySelector('[data-mailing-source-refresh]');
    const sourceCountBadge = page.querySelector('[data-mailing-source-count-badge]');
    const sourceRecipientCount = page.querySelector('[data-mailing-source-recipient-count]');
    const sourceMailingCount = page.querySelector('[data-mailing-source-mailing-count]');
    const sourceTableScroll = sourcePanel?.querySelector('.cabinet-mailing-source-table');
    const sourceTableSlider = page.querySelector('[data-mailing-source-table-slider]');
    const sourceTableThumb = page.querySelector('[data-mailing-source-table-thumb]');
    const sourceTableKnob = page.querySelector('[data-mailing-source-table-knob]');
    const listPanel = page.querySelector('[data-mailing-list-panel]');
    const listRows = Array.from(page.querySelectorAll('[data-mailing-list-row]'));
    const listChecks = Array.from(page.querySelectorAll('[data-mailing-list-row-check]'));
    const listSelectAll = page.querySelector('[data-mailing-list-select-all]');
    const listRegion = page.querySelector('[data-mailing-list-region]');
    const listOperator = page.querySelector('[data-mailing-list-operator]');
    const listGender = page.querySelector('[data-mailing-list-gender]');
    const listReset = page.querySelector('[data-mailing-list-reset]');
    const listRefresh = page.querySelector('[data-mailing-list-refresh]');
    const listCountBadge = page.querySelector('[data-mailing-list-count-badge]');
    const listRecipientCount = page.querySelector('[data-mailing-list-recipient-count]');
    const listsCount = page.querySelector('[data-mailing-list-count]');
    const listTableScroll = listPanel?.querySelector('.cabinet-mailing-source-table');
    const listTableSlider = page.querySelector('[data-mailing-list-table-slider]');
    const listTableThumb = page.querySelector('[data-mailing-list-table-thumb]');
    const listTableKnob = page.querySelector('[data-mailing-list-table-knob]');
    const filePanel = page.querySelector('[data-mailing-file-panel]');
    const fileInput = page.querySelector('[data-mailing-file-input]');
    const fileName = page.querySelector('[data-mailing-file-name]');
    const fileNameBadge = page.querySelector('[data-mailing-file-name-badge]');
    const fileEmptyBadge = page.querySelector('[data-mailing-file-empty-badge]');
    const fileSelectedBadge = page.querySelector('[data-mailing-file-selected-badge]');
    const fileSelectedCount = page.querySelector('[data-mailing-file-selected-count]');
    const fileLoadedNameBadge = page.querySelector('[data-mailing-file-loaded-name-badge]');
    const fileLoadedName = page.querySelector('[data-mailing-file-loaded-name]');
    const fileRows = Array.from(page.querySelectorAll('.cabinet-mailing-file-table__row:not(.cabinet-mailing-file-table__row--head)'));
    const fileTableScroll = page.querySelector('[data-mailing-file-table-scroll]');
    const fileTableSlider = page.querySelector('[data-mailing-file-table-slider]');
    const fileTableThumb = page.querySelector('[data-mailing-file-table-thumb]');
    const fileCustom = page.querySelector('[data-mailing-file-custom]');
    const fileRules = page.querySelector('[data-mailing-file-rules]');
    const uploadModals = Array.from(page.querySelectorAll('[data-mailing-upload-modal]'));
    const rulesModal = page.querySelector('[data-mailing-upload-modal="rules"]');
    const customModal = page.querySelector('[data-mailing-upload-modal="custom"]');
    const customCancel = page.querySelector('[data-mailing-custom-cancel]');
    const customSave = page.querySelector('[data-mailing-custom-save]');
    const customChoose = page.querySelector('[data-mailing-custom-file-choose]');
    const mapSelects = Array.from(page.querySelectorAll('[data-mailing-map-select]'));
    const status = page.querySelector('[data-mailing-recipients-status]');
    const continueButton = page.querySelector('[data-mailing-recipients-continue]');
    const recipientsIntro = page.querySelector('[data-mailing-recipients-intro]');
    const recipientsActions = page.querySelector('[data-mailing-recipients-actions]');
    const messageCountRow = page.querySelector('[data-mailing-message-count-row]');
    const messageRecipientCount = page.querySelector('[data-mailing-message-recipient-count]');
    const messageForm = page.querySelector('[data-mailing-message-form]');
    const messageActions = page.querySelector('[data-mailing-message-actions]');
    const messageBack = page.querySelector('[data-mailing-message-back]');
    const messageDone = page.querySelector('[data-mailing-message-done]');
    const messageDate = page.querySelector('[data-mailing-message-date]');
    const messageTime = page.querySelector('[data-mailing-message-time]');
    const messageHours = page.querySelector('[data-mailing-message-hours]');
    const messageHoursMinus = page.querySelector('[data-mailing-message-hours-minus]');
    const messageHoursPlus = page.querySelector('[data-mailing-message-hours-plus]');
    const messageText = page.querySelector('[data-mailing-message-text]');
    const messageCharCount = page.querySelector('[data-mailing-message-char-count]');
    const messageSmsCount = page.querySelector('[data-mailing-message-sms-count]');
    const messageTranslit = page.querySelector('[data-mailing-message-translit]');
    const messageClear = page.querySelector('[data-mailing-message-clear]');
    const messageReset = page.querySelector('[data-mailing-message-reset]');
    const messageAdd = page.querySelector('[data-mailing-message-add]');
    const messageSettings = page.querySelector('[data-mailing-message-settings]');
    const messageSettingsPanel = page.querySelector('[data-mailing-message-settings-panel]');
    const messageHelpButtons = Array.from(page.querySelectorAll('[data-mailing-message-help], [data-mailing-message-tag-help]'));
    const messageEmpty = page.querySelector('[data-mailing-message-empty]');
    const messageList = page.querySelector('[data-mailing-message-list]');
    const messageTableBody = page.querySelector('[data-mailing-message-table-body]');
    const messageTableScroll = page.querySelector('[data-mailing-message-table-scroll]');
    const messageTableSlider = page.querySelector('[data-mailing-message-table-slider]');
    const messageTableThumb = page.querySelector('[data-mailing-message-table-thumb]');
    const messageRowMenu = page.querySelector('[data-mailing-message-row-menu]');
    const messageRowMenuEdit = page.querySelector('[data-mailing-message-row-edit]');
    const messageRowMenuDelete = page.querySelector('[data-mailing-message-row-delete]');
    const messageConfirmModal = page.querySelector('[data-mailing-confirm-modal]');
    const messageConfirmName = page.querySelector('[data-mailing-confirm-name]');
    const messageConfirmRecipients = page.querySelector('[data-mailing-confirm-recipients]');
    const messageConfirmClose = page.querySelector('[data-mailing-confirm-close]');
    const messageConfirmCancel = page.querySelector('[data-mailing-confirm-cancel]');
    const messageConfirmSubmit = page.querySelector('[data-mailing-confirm-submit]');
    let currentMode = 'manual';
    let isFileLoaded = false;
    let activeUploadModal = null;
    let lastUploadModalTrigger = null;
    let activeConfirmModal = null;
    let lastConfirmModalTrigger = null;
    let activeMessageRowMenuRow = null;
    let activeMessageRowMenuTrigger = null;
    let editingMessageRow = null;
    const messageAddDefaultText = messageAdd?.textContent.trim() || 'Добавить сообщение в рассылку';

    const mapOptions = [
        '-------',
        'Номер телефона',
        'ФИО полностью',
        'Пол (М или Ж)',
        'Дата рождения (дд.мм.гггг)',
        'Имя',
        'Отчество',
        'Фамилия',
        'Доп.1',
        'Доп.2',
        'Доп.3',
    ];

    updateDraftSummary(page);
    if (messageRowMenu && messageRowMenu.parentElement !== document.body) {
        document.body.append(messageRowMenu);
    }

    const formatNumber = (number) => new Intl.NumberFormat('ru-RU').format(number);
    const getRows = () => Array.from(page.querySelectorAll('[data-mailing-recipient-row]'));
    const getSelectedSourceRows = () => sourceRows.filter((row) => row.querySelector('[data-mailing-source-row-check]')?.checked);
    const getSelectedListRows = () => listRows.filter((row) => row.querySelector('[data-mailing-list-row-check]')?.checked);
    const clampHours = (value) => Math.min(72, Math.max(1, Number.parseInt(value, 10) || 12));

    const updateTableSlider = () => {
        syncHorizontalScrollbar({
            scrollElement: tableScroll,
            thumbElement: tableThumb,
            scrollbarElement: tableSlider,
            useTransform: true,
        });
    };

    const updateFileTableSlider = () => {
        syncHorizontalScrollbar({
            scrollElement: fileTableScroll,
            thumbElement: fileTableThumb,
            scrollbarElement: fileTableSlider,
            useTransform: true,
        });
    };

    const updateMessageTableSlider = () => {
        syncHorizontalScrollbar({
            scrollElement: messageTableScroll,
            thumbElement: messageTableThumb,
            scrollbarElement: messageTableSlider,
            useTransform: true,
        });
    };

    const updateSourceTableSlider = () => {
        if (sourceTableSlider) {
            sourceTableSlider.hidden = false;
        }

        syncHorizontalScrollbar({
            scrollElement: sourceTableScroll,
            thumbElement: sourceTableThumb,
            knobElement: sourceTableKnob,
            scrollbarElement: sourceTableSlider,
            hideWhenNoOverflow: true,
            useTransform: true,
        });
    };

    const updateListTableSlider = () => {
        if (listTableSlider) {
            listTableSlider.hidden = false;
        }

        syncHorizontalScrollbar({
            scrollElement: listTableScroll,
            thumbElement: listTableThumb,
            knobElement: listTableKnob,
            scrollbarElement: listTableSlider,
            hideWhenNoOverflow: true,
            useTransform: true,
        });
    };

    const closeMessageRowMenu = () => {
        if (!messageRowMenu) return;

        messageRowMenu.classList.remove('is-open');
        messageRowMenu.hidden = true;

        if (activeMessageRowMenuTrigger?.isConnected) {
            activeMessageRowMenuTrigger.setAttribute('aria-expanded', 'false');
        }

        activeMessageRowMenuRow = null;
        activeMessageRowMenuTrigger = null;
    };

    const positionMessageRowMenu = () => {
        if (!messageRowMenu || !activeMessageRowMenuTrigger) return;

        const triggerRect = activeMessageRowMenuTrigger.getBoundingClientRect();
        const menuRect = messageRowMenu.getBoundingClientRect();
        const menuWidth = Math.min(menuRect.width || 180, window.innerWidth - 24);
        const menuHeight = menuRect.height || 132;
        const left = Math.min(
            window.innerWidth - menuWidth - 12,
            Math.max(12, triggerRect.right - menuWidth + 4)
        );
        const top = Math.min(
            window.innerHeight - menuHeight - 12,
            Math.max(12, triggerRect.bottom + 10)
        );

        messageRowMenu.style.width = `${menuWidth}px`;
        messageRowMenu.style.left = `${left}px`;
        messageRowMenu.style.top = `${top}px`;
    };

    const openMessageRowMenu = (trigger, row) => {
        if (!messageRowMenu || !trigger || !row) return;

        if (activeMessageRowMenuTrigger === trigger && !messageRowMenu.hidden) {
            closeMessageRowMenu();
            return;
        }

        closeMessageRowMenu();
        activeMessageRowMenuRow = row;
        activeMessageRowMenuTrigger = trigger;
        trigger.setAttribute('aria-expanded', 'true');
        messageRowMenu.hidden = false;
        positionMessageRowMenu();
        window.requestAnimationFrame(() => {
            messageRowMenu.classList.add('is-open');
        });
    };

    const setFileLoaded = (selectedFile) => {
        const isLoaded = Boolean(selectedFile);
        const selectedFileName = selectedFile?.name || 'List_2026.xls';

        isFileLoaded = isLoaded;
        form?.classList.toggle('is-file-loaded', isLoaded);

        if (fileName) {
            fileName.textContent = isLoaded ? selectedFileName : 'Файл не выбран';
        }

        if (fileLoadedName) {
            fileLoadedName.textContent = selectedFileName;
        }

        if (fileSelectedCount) {
            fileSelectedCount.textContent = formatRecipientsCount(fileRows.length);
        }

        if (fileEmptyBadge) fileEmptyBadge.hidden = isLoaded;
        if (fileNameBadge) fileNameBadge.hidden = isLoaded;
        if (fileSelectedBadge) fileSelectedBadge.hidden = !isLoaded;
        if (fileLoadedNameBadge) fileLoadedNameBadge.hidden = !isLoaded;

        window.requestAnimationFrame(updateFileTableSlider);
    };

    const showDemoFileLoaded = () => {
        setFileLoaded({ name: 'List_2026.xls' });
        if (status) {
            status.textContent = `Файл List_2026.xls выбран. Добавлено ${formatRecipientsCount(fileRows.length)}.`;
        }
    };

    const ensureMapSelectMenu = (select) => {
        if (select.querySelector('[data-mailing-map-select-menu]')) return;

        const menu = document.createElement('div');
        menu.className = 'cabinet-mailing-map-select__menu';
        menu.dataset.mailingMapSelectMenu = '';
        mapOptions.forEach((option) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.mailingMapSelectOption = '';
            button.textContent = option;
            menu.append(button);
        });
        select.append(menu);
    };

    const setMapSelectOpen = (select, open) => {
        const icon = select?.querySelector('[data-mailing-map-select-toggle] img');
        select?.classList.toggle('is-open', open);
        if (icon) {
            icon.src = open ? MAP_SELECT_CHEVRON_ACTIVE : MAP_SELECT_CHEVRON;
        }
    };

    const closeMapSelects = (except = null) => {
        mapSelects.forEach((select) => {
            if (select !== except) {
                setMapSelectOpen(select, false);
            }
        });
    };

    const openUploadModal = (modal, trigger = document.activeElement) => {
        if (!modal) return;

        if (activeUploadModal && activeUploadModal !== modal) {
            closeModalLayer(activeUploadModal);
        }

        lastUploadModalTrigger = trigger;
        activeUploadModal = modal;
        document.body.classList.add('is-cabinet-modal-open');

        if (modal === customModal) {
            closeMapSelects();
            const lastSelect = mapSelects.at(-1);
            if (window.matchMedia('(min-width: 768px)').matches && lastSelect) {
                setMapSelectOpen(lastSelect, true);
            }
        }

        openModalLayer(modal);
        modal.querySelector('.cabinet-mailing-upload-modal__dialog')?.focus({ preventScroll: true });
    };

    const closeUploadModal = ({ restoreFocus = true, keepCustom = true } = {}) => {
        const modal = activeUploadModal;
        if (!modal) return;

        closeMapSelects();
        closeModalLayer(modal, {
            afterClose: () => {
                if (activeUploadModal === modal) {
                    activeUploadModal = null;
                }
                document.body.classList.remove('is-cabinet-modal-open');
                if (!keepCustom && fileCustom) {
                    fileCustom.checked = false;
                }
                if (restoreFocus && lastUploadModalTrigger?.isConnected) {
                    lastUploadModalTrigger.focus({ preventScroll: true });
                }
            },
        });
    };

    const hasPendingManualRecipient = () => Boolean(
        phoneInput?.value.trim()
        || nameInput?.value.trim()
        || birthdayInput?.value.trim()
        || (ageInput?.value && ageInput.value !== '24')
    );

    const getPreparedRecipientCount = () => {
        if (currentMode === 'mailing') {
            return updateSourceCount().recipientsCount;
        }

        if (currentMode === 'list') {
            return updateListCount().recipientsCount;
        }

        if (currentMode === 'file' && isFileLoaded) {
            return fileRows.length;
        }

        return getRows().length;
    };

    const openConfirmModal = (trigger = document.activeElement) => {
        if (!messageConfirmModal) return;

        lastConfirmModalTrigger = trigger;
        activeConfirmModal = messageConfirmModal;
        document.body.classList.add('is-cabinet-modal-open');

        const draft = getStoredDraft();
        if (messageConfirmName) {
            messageConfirmName.textContent = draft.name || 'Тестовая рассылка';
        }
        if (messageConfirmRecipients) {
            const recipientsCount = getPreparedRecipientCount() || 1;
            const smsCount = Math.max(1, messageTableBody?.children.length || 1);
            messageConfirmRecipients.textContent = `${recipientsCount} (${smsCount}SMS)`;
        }

        openModalLayer(messageConfirmModal);
        messageConfirmModal.querySelector('.cabinet-mailing-confirm-modal__dialog')?.focus({ preventScroll: true });
    };

    const closeConfirmModal = ({ restoreFocus = true } = {}) => {
        const modal = activeConfirmModal;
        if (!modal) return;

        closeModalLayer(modal, {
            afterClose: () => {
                if (activeConfirmModal === modal) {
                    activeConfirmModal = null;
                }
                document.body.classList.remove('is-cabinet-modal-open');
                if (restoreFocus && lastConfirmModalTrigger?.isConnected) {
                    lastConfirmModalTrigger.focus({ preventScroll: true });
                }
            },
        });
    };

    const setCreateStep = (stepName) => {
        const isMessageStepActive = stepName === 'message';
        const messageStep = steps.find((step) => step.dataset.mailingCreateStep === '3');

        page.classList.toggle('is-message-step', isMessageStepActive);
        if (form) form.hidden = isMessageStepActive;
        if (recipientsIntro) recipientsIntro.hidden = isMessageStepActive;
        if (recipientsActions) recipientsActions.hidden = isMessageStepActive;
        if (messageForm) messageForm.hidden = !isMessageStepActive;
        if (messageActions) messageActions.hidden = !isMessageStepActive;
        if (messageCountRow) messageCountRow.hidden = !isMessageStepActive;

        steps.forEach((step) => {
            const stepId = step.dataset.mailingCreateStep;
            const isActive = isMessageStepActive ? stepId === '3' : stepId === '2';
            const isComplete = isMessageStepActive ? stepId !== '3' : stepId === '1';

            step.classList.toggle('is-active', isActive);
            step.classList.toggle('is-complete', isComplete);
            if (isActive) {
                step.setAttribute('aria-current', 'step');
            } else {
                step.removeAttribute('aria-current');
            }
        });

        if (isMessageStepActive && messageRecipientCount) {
            messageRecipientCount.textContent = formatNumber(getPreparedRecipientCount() || 127);
        }

        const activeStep = isMessageStepActive
            ? messageStep
            : steps.find((step) => step.dataset.mailingCreateStep === '2');

        activeStep?.focus({ preventScroll: true });
        activeStep?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };

    const completeRecipientsStep = () => {
        try {
            window.sessionStorage.setItem('nikitaMailingRecipientsSaved', 'true');
        } catch (error) {
            // Session storage is optional; visual step transition should still work.
        }

        setCreateStep('message');

        if (status) {
            status.textContent = 'Список получателей сохранён. Открыт шаг сообщения в рассылке.';
        }
    };

    const updateSelectedCount = () => {
        const count = getRows().length;
        if (selectedCount) {
            selectedCount.textContent = formatRecipientsCount(count);
        }

        if (count === 0) {
            if (selectedState) selectedState.hidden = true;
            if (emptyState) emptyState.hidden = false;
            form?.classList.remove('is-selected');
        }

        window.requestAnimationFrame(updateTableSlider);
        return count;
    };

    const showSelectedState = () => {
        if (emptyState) emptyState.hidden = true;
        if (selectedState) selectedState.hidden = false;
        form?.classList.add('is-selected');
        updateSelectedCount();
    };

    const updateSourceCount = () => {
        const selectedRows = getSelectedSourceRows();
        const mailingsCount = selectedRows.length;
        const recipientsCount = selectedRows.reduce((sum, row) => sum + Number(row.dataset.sourceRecipients || 0), 0);

        if (sourceRecipientCount) {
            sourceRecipientCount.textContent = formatRecipientsCount(recipientsCount);
        }

        if (sourceMailingCount) {
            sourceMailingCount.textContent = formatMailingsCount(mailingsCount);
        }

        if (sourceCountBadge) {
            sourceCountBadge.hidden = mailingsCount === 0;
        }

        if (sourceSelectAll) {
            const visibleChecks = sourceRows
                .filter((row) => !row.hidden)
                .map((row) => row.querySelector('[data-mailing-source-row-check]'))
                .filter(Boolean);
            const checkedVisible = visibleChecks.filter((check) => check.checked);
            sourceSelectAll.checked = visibleChecks.length > 0 && checkedVisible.length === visibleChecks.length;
            sourceSelectAll.indeterminate = checkedVisible.length > 0 && checkedVisible.length < visibleChecks.length;
        }

        return { mailingsCount, recipientsCount };
    };

    const updateListCount = () => {
        const selectedRows = getSelectedListRows();
        const selectedListsCount = selectedRows.length;
        const recipientsCount = selectedRows.reduce((sum, row) => sum + Number(row.dataset.listRecipients || 0), 0);

        if (listRecipientCount) {
            listRecipientCount.textContent = formatRecipientsCount(recipientsCount);
        }

        if (listsCount) {
            listsCount.textContent = formatListsCount(selectedListsCount);
        }

        if (listCountBadge) {
            listCountBadge.hidden = selectedListsCount === 0;
        }

        if (listSelectAll) {
            const visibleChecks = listRows
                .filter((row) => !row.hidden)
                .map((row) => row.querySelector('[data-mailing-list-row-check]'))
                .filter(Boolean);
            const checkedVisible = visibleChecks.filter((check) => check.checked);
            listSelectAll.checked = visibleChecks.length > 0 && checkedVisible.length === visibleChecks.length;
            listSelectAll.indeterminate = checkedVisible.length > 0 && checkedVisible.length < visibleChecks.length;
        }

        return { listsCount: selectedListsCount, recipientsCount };
    };

    const updateMessageCounters = () => {
        if (!messageText) return;

        const symbolsCount = messageText.value.replace(/\s/g, '').length;
        const smsParts = Math.max(1, Math.ceil(symbolsCount / 70));

        if (messageCharCount) {
            messageCharCount.textContent = String(symbolsCount);
        }

        if (messageSmsCount) {
            messageSmsCount.textContent = String(smsParts);
        }
    };

    const transliterateMessage = (text) => {
        const map = {
            а: 'a',
            б: 'b',
            в: 'v',
            г: 'g',
            д: 'd',
            е: 'e',
            ё: 'e',
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
            х: 'h',
            ц: 'c',
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

        return text.replace(/[А-Яа-яЁё]/g, (letter) => {
            const lower = letter.toLowerCase();
            const value = map[lower] ?? letter;
            return letter === lower ? value : value.charAt(0).toUpperCase() + value.slice(1);
        });
    };

    const updateMessageReadyState = () => {
        const hasMessages = Boolean(messageTableBody?.children.length);
        if (messageEmpty) messageEmpty.hidden = hasMessages;
        if (messageList) messageList.hidden = !hasMessages;
        messageForm?.classList.toggle('has-ready-messages', hasMessages);
        window.requestAnimationFrame(updateMessageTableSlider);
    };

    const createMessageCell = (value, modifier = '') => {
        const cell = document.createElement('td');
        if (modifier) {
            cell.className = `cabinet-mailing-message-table__${modifier}`;
        }
        cell.textContent = value;
        return cell;
    };

    const setEditingMessageRow = (row = null) => {
        if (editingMessageRow?.isConnected) {
            editingMessageRow.classList.remove('is-editing');
        }

        editingMessageRow = row?.isConnected ? row : null;

        if (editingMessageRow) {
            editingMessageRow.classList.add('is-editing');
        }

        if (messageAdd) {
            messageAdd.textContent = editingMessageRow ? 'Сохранить изменения' : messageAddDefaultText;
        }
    };

    const renderMessageRow = (row, messageData) => {
        row.dataset.messageText = messageData.text;
        row.dataset.messageParts = messageData.parts;
        row.dataset.messageDate = messageData.date;
        row.dataset.messageTime = messageData.time;
        row.dataset.messageConditions = messageData.conditions;
        row.dataset.messageGradual = String(messageData.sendGradual);
        row.dataset.messageHours = String(messageData.hours);
        row.replaceChildren(
            createMessageCell(messageData.text, 'text'),
            createMessageCell(messageData.parts, 'sms'),
            createMessageCell(messageData.date, 'date'),
            createMessageCell(messageData.time, 'time'),
            createMessageCell(messageData.conditions, 'conditions')
        );

        const actionCell = document.createElement('td');
        actionCell.className = 'cabinet-mailing-message-table__action';

        const menuToggle = document.createElement('button');
        menuToggle.className = 'cabinet-mailing-message-table__more';
        menuToggle.type = 'button';
        menuToggle.dataset.mailingMessageMenuToggle = '';
        menuToggle.setAttribute('aria-label', 'Действия с сообщением');
        menuToggle.setAttribute('aria-haspopup', 'menu');
        menuToggle.setAttribute('aria-expanded', 'false');
        const menuIcon = document.createElement('img');
        menuIcon.src = MESSAGE_MORE_ICON;
        menuIcon.alt = '';
        menuToggle.append(menuIcon);

        actionCell.append(menuToggle);
        row.append(actionCell);
    };

    const fillMessageFormFromRow = (row) => {
        if (!row) return;

        if (messageText) {
            messageText.value = row.dataset.messageText || '';
            setInvalid(messageText, false);
        }
        if (messageDate) {
            messageDate.value = row.dataset.messageDate || '';
        }
        if (messageTime) {
            messageTime.value = row.dataset.messageTime || '';
        }
        if (messageHours) {
            messageHours.value = row.dataset.messageHours || '12';
        }

        const gradual = page.querySelector('[data-mailing-message-gradual]');
        if (gradual) {
            gradual.checked = row.dataset.messageGradual === 'true';
        }

        setEditingMessageRow(row);
        updateMessageCounters();
        messageText?.focus();
        messageText?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };

    const addReadyMessage = () => {
        if (!messageText || !messageTableBody) return false;

        const text = messageText.value.trim();
        if (!text) {
            setInvalid(messageText, true);
            messageText.focus();
            if (status) {
                status.textContent = 'Введите текст сообщения.';
            }
            return false;
        }

        setInvalid(messageText, false);

        const sendGradual = Boolean(page.querySelector('[data-mailing-message-gradual]')?.checked);
        const parts = messageSmsCount?.textContent?.trim() || '1';
        const date = messageDate?.value.trim() || '12.05.2026';
        const time = messageTime?.value.trim() || '12:00';
        const hours = clampHours(messageHours?.value || 12);
        const conditions = sendGradual ? `Разослать постепенно за ${hours} часов` : '-';
        const item = editingMessageRow?.isConnected ? editingMessageRow : document.createElement('tr');
        const isEditing = item === editingMessageRow;

        item.dataset.mailingMessageItem = '';
        renderMessageRow(item, {
            text,
            parts,
            date,
            time,
            conditions,
            sendGradual,
            hours,
        });

        if (!isEditing) {
            messageTableBody.append(item);
        }
        setEditingMessageRow(null);
        updateMessageReadyState();

        if (status) {
            status.textContent = isEditing ? 'Сообщение обновлено.' : 'Сообщение добавлено в рассылку.';
        }

        return true;
    };

    const resetMessageForm = () => {
        if (messageDate) messageDate.value = '';
        if (messageTime) messageTime.value = '';
        if (messageHours) messageHours.value = '12';
        if (messageText) {
            messageText.value = 'Добрый день!';
            setInvalid(messageText, false);
        }
        page.querySelector('[data-mailing-message-send-now]')?.removeAttribute('checked');
        page.querySelector('[data-mailing-message-gradual]')?.removeAttribute('checked');
        const sendNow = page.querySelector('[data-mailing-message-send-now]');
        const gradual = page.querySelector('[data-mailing-message-gradual]');
        if (sendNow) sendNow.checked = false;
        if (gradual) gradual.checked = false;
        setEditingMessageRow(null);
        updateMessageCounters();
    };

    const setMode = (mode) => {
        currentMode = mode;
        const isSource = mode === 'mailing';
        const isList = mode === 'list';
        const isFile = mode === 'file';
        const isCatalogMode = isSource || isList || isFile;

        if (sourcePanel) {
            sourcePanel.hidden = !isSource;
        }

        if (listPanel) {
            listPanel.hidden = !isList;
        }

        if (filePanel) {
            filePanel.hidden = !isFile;
        }

        form?.classList.toggle('is-source-mode', isSource);
        form?.classList.toggle('is-list-mode', isList);
        form?.classList.toggle('is-file-mode', isFile);

        if (isCatalogMode) {
            if (emptyState) emptyState.hidden = true;
            if (selectedState) selectedState.hidden = true;
            form?.classList.remove('is-selected');
            if (isSource) {
                updateSourceCount();
                window.requestAnimationFrame(updateSourceTableSlider);
            } else if (isList) {
                updateListCount();
                window.requestAnimationFrame(updateListTableSlider);
            } else if (isFile) {
                updateFileTableSlider();
            }
        } else {
            if (sourcePanel) sourcePanel.hidden = true;
            if (listPanel) listPanel.hidden = true;
            if (filePanel) filePanel.hidden = true;
            if (sourceCountBadge) sourceCountBadge.hidden = true;
            if (listCountBadge) listCountBadge.hidden = true;
            form?.classList.remove('is-source-mode');
            form?.classList.remove('is-list-mode');
            form?.classList.remove('is-file-mode');
            updateSelectedCount();
        }
    };

    const createTableCell = (value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        return cell;
    };

    const createRecipientRow = ({ phone, phoneKey, name, birthday, age, gender }) => {
        const row = document.createElement('tr');
        row.dataset.mailingRecipientRow = '';
        row.dataset.recipientPhone = phoneKey;

        row.append(
            createTableCell(phone),
            createTableCell(name),
            createTableCell(birthday),
            createTableCell(age),
            createTableCell(gender),
        );

        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.className = 'cabinet-mailing-recipients-table__delete';
        deleteButton.type = 'button';
        deleteButton.dataset.mailingRecipientDelete = '';
        deleteButton.setAttribute('aria-label', `Удалить получателя ${name}`);

        const deleteIcon = document.createElement('img');
        deleteIcon.src = TABLE_DELETE_ICON;
        deleteIcon.alt = '';

        deleteButton.append(deleteIcon);
        actionCell.append(deleteButton);
        row.append(actionCell);

        return row;
    };

    steps.forEach((step) => {
        step.addEventListener('click', () => {
            if (step.dataset.mailingCreateStep === '1') {
                window.location.href = 'mailing-create.html';
                return;
            }

            if (step.dataset.mailingCreateStep === '2') {
                setCreateStep('recipients');
                if (status) {
                    status.textContent = 'Открыт список получателей.';
                }
                return;
            }

            if (step.dataset.mailingCreateStep === '3') {
                continueButton?.click();
            }
        });
    });

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((item) => {
                const isActive = item === tab;
                item.classList.toggle('is-active', isActive);
                item.setAttribute('aria-selected', String(isActive));
            });

            const tabMode = tab.dataset.mailingRecipientsTab;
            setMode(tabMode === 'mailing' || tabMode === 'list' || tabMode === 'file' ? tabMode : 'manual');

            if (status) {
                status.textContent = `Выбран способ загрузки: ${tab.textContent.trim()}.`;
            }
        });
    });

    phoneInput?.addEventListener('input', () => {
        if (phoneInput.value.trim()) {
            setInvalid(phoneInput, false);
        }
    });

    birthdayInput?.addEventListener('input', () => {
        const digits = birthdayInput.value.replace(/\D/g, '').slice(0, 8);
        const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
        birthdayInput.value = parts.join('.');
    });

    [sourceDateFrom, sourceDateTo].forEach((control) => {
        control?.addEventListener('input', () => {
            const digits = control.value.replace(/\D/g, '').slice(0, 8);
            const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
            control.value = parts.join('.');
        });
    });

    messageDate?.addEventListener('input', () => {
        const digits = messageDate.value.replace(/\D/g, '').slice(0, 8);
        const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
        messageDate.value = parts.join('.');
    });

    messageTime?.addEventListener('input', () => {
        const digits = messageTime.value.replace(/\D/g, '').slice(0, 4);
        const parts = [digits.slice(0, 2), digits.slice(2, 4)].filter(Boolean);
        messageTime.value = parts.join(':');
    });

    messageHoursMinus?.addEventListener('click', () => {
        if (!messageHours) return;
        messageHours.value = String(clampHours(clampHours(messageHours.value) - 1));
    });

    messageHoursPlus?.addEventListener('click', () => {
        if (!messageHours) return;
        messageHours.value = String(clampHours(clampHours(messageHours.value) + 1));
    });

    messageHours?.addEventListener('change', () => {
        messageHours.value = String(clampHours(messageHours.value));
    });

    messageText?.addEventListener('input', () => {
        setInvalid(messageText, false);
        updateMessageCounters();
    });

    messageTranslit?.addEventListener('click', () => {
        if (!messageText) return;
        messageText.value = transliterateMessage(messageText.value);
        updateMessageCounters();
        if (status) {
            status.textContent = 'Текст сообщения переведён в транслит.';
        }
    });

    messageClear?.addEventListener('click', () => {
        if (!messageText) return;
        messageText.value = '';
        updateMessageCounters();
        messageText.focus();
        if (status) {
            status.textContent = 'Текст сообщения очищен.';
        }
    });

    messageReset?.addEventListener('click', () => {
        resetMessageForm();
        if (status) {
            status.textContent = 'Параметры сообщения сброшены.';
        }
    });

    messageAdd?.addEventListener('click', addReadyMessage);

    messageSettings?.addEventListener('click', () => {
        const isExpanded = messageSettings.getAttribute('aria-expanded') === 'true';
        messageSettings.setAttribute('aria-expanded', String(!isExpanded));
        messageSettings.classList.toggle('is-open', !isExpanded);
        if (messageSettingsPanel) {
            messageSettingsPanel.hidden = isExpanded;
        }
        if (status) {
            status.textContent = !isExpanded ? 'Открыты дополнительные настройки сообщения.' : 'Дополнительные настройки сообщения закрыты.';
        }
    });

    messageHelpButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (status) {
                status.textContent = 'Подсказка относится к настройкам текущего сообщения.';
            }
        });
    });

    messageList?.addEventListener('click', (event) => {
        const menuToggle = event.target.closest('[data-mailing-message-menu-toggle]');
        if (!menuToggle) return;

        openMessageRowMenu(menuToggle, menuToggle.closest('[data-mailing-message-item]'));
    });

    messageRowMenuEdit?.addEventListener('click', () => {
        fillMessageFormFromRow(activeMessageRowMenuRow);
        closeMessageRowMenu();
        if (status) {
            status.textContent = 'Сообщение открыто для редактирования.';
        }
    });

    messageRowMenuDelete?.addEventListener('click', () => {
        const row = activeMessageRowMenuRow;
        closeMessageRowMenu();
        row?.remove();
        if (editingMessageRow === row) {
            setEditingMessageRow(null);
        }
        updateMessageReadyState();
        if (status) {
            status.textContent = 'Сообщение удалено из рассылки.';
        }
    });

    messageTableScroll?.addEventListener('scroll', () => {
        updateMessageTableSlider();
        closeMessageRowMenu();
    }, { passive: true });

    window.addEventListener('resize', () => {
        resetPageHorizontalScroll();
        updateMessageTableSlider();
        closeMessageRowMenu();
    });

    messageForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        addReadyMessage();
    });

    messageBack?.addEventListener('click', () => {
        setCreateStep('recipients');
        if (status) {
            status.textContent = 'Открыт список получателей.';
        }
    });

    messageDone?.addEventListener('click', () => {
        if (!messageTableBody?.children.length && !addReadyMessage()) return;
        openConfirmModal(messageDone);
    });

    messageConfirmClose?.addEventListener('click', () => {
        closeConfirmModal();
    });

    messageConfirmCancel?.addEventListener('click', () => {
        closeConfirmModal();
    });

    messageConfirmSubmit?.addEventListener('click', () => {
        window.location.href = 'mailings.html';
    });

    updateMessageCounters();
    updateMessageReadyState();

    ageMinus?.addEventListener('click', () => {
        if (!ageInput) return;
        ageInput.value = String(clampAge(ageInput.value) - 1 < 0 ? 0 : clampAge(ageInput.value) - 1);
    });

    agePlus?.addEventListener('click', () => {
        if (!ageInput) return;
        ageInput.value = String(Math.min(120, clampAge(ageInput.value) + 1));
    });

    ageInput?.addEventListener('change', () => {
        ageInput.value = String(clampAge(ageInput.value));
    });

    const bindSourceAge = (button, input, delta) => {
        button?.addEventListener('click', () => {
            if (!input) return;
            input.value = String(clampAge(clampAge(input.value) + delta));
        });
    };

    bindSourceAge(sourceAgeFromMinus, sourceAgeFrom, -1);
    bindSourceAge(sourceAgeFromPlus, sourceAgeFrom, 1);
    bindSourceAge(sourceAgeToMinus, sourceAgeTo, -1);
    bindSourceAge(sourceAgeToPlus, sourceAgeTo, 1);

    [sourceAgeFrom, sourceAgeTo].forEach((input) => {
        input?.addEventListener('change', () => {
            input.value = String(clampAge(input.value));
        });
    });

    selectedState?.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('[data-mailing-recipient-delete]');
        if (!deleteButton) return;

        deleteButton.closest('[data-mailing-recipient-row]')?.remove();
        const count = updateSelectedCount();
        if (status) {
            status.textContent = count > 0 ? `В списке осталось ${formatRecipientsCount(count)}.` : 'Все получатели удалены из списка.';
        }
    });

    tableScroll?.addEventListener('scroll', updateTableSlider, { passive: true });
    fileTableScroll?.addEventListener('scroll', updateFileTableSlider, { passive: true });
    sourceTableScroll?.addEventListener('scroll', updateSourceTableSlider, { passive: true });
    listTableScroll?.addEventListener('scroll', updateListTableSlider, { passive: true });
    window.addEventListener('resize', updateTableSlider);
    window.addEventListener('resize', updateFileTableSlider);
    window.addEventListener('resize', updateSourceTableSlider);
    window.addEventListener('resize', updateListTableSlider);
    bindHorizontalScrollbarDrag({
        scrollElement: sourceTableScroll,
        thumbElement: sourceTableThumb,
        knobElement: sourceTableKnob,
        scrollbarElement: sourceTableSlider,
        hideWhenNoOverflow: true,
        useTransform: true,
    });
    bindHorizontalScrollbarDrag({
        scrollElement: listTableScroll,
        thumbElement: listTableThumb,
        knobElement: listTableKnob,
        scrollbarElement: listTableSlider,
        hideWhenNoOverflow: true,
        useTransform: true,
    });
    mapSelects.forEach(ensureMapSelectMenu);

    const applySourceFilters = () => {
        const query = sourceSearch?.value.trim().toLowerCase() || '';
        const dateFrom = parseDateValue(sourceDateFrom?.value.trim() || '');
        const dateTo = parseDateValue(sourceDateTo?.value.trim() || '');

        sourceRows.forEach((row) => {
            const rowDate = parseDateValue(row.dataset.sourceDate || '');
            const nameMatches = !query || (row.dataset.sourceName || '').toLowerCase().includes(query);
            const fromMatches = !dateFrom || (rowDate && rowDate >= dateFrom);
            const toMatches = !dateTo || (rowDate && rowDate <= dateTo);
            row.hidden = !(nameMatches && fromMatches && toMatches);
        });

        updateSourceCount();
        window.requestAnimationFrame(updateSourceTableSlider);
    };

    const applyListFilters = () => {
        const region = listRegion?.value || 'all';
        const operator = listOperator?.value || 'all';
        const gender = listGender?.value || 'all';

        listRows.forEach((row) => {
            const regionMatches = region === 'all' || row.dataset.listRegion === region;
            const operatorMatches = operator === 'all' || row.dataset.listOperator === operator;
            const genderMatches = gender === 'all' || row.dataset.listGender === gender || row.dataset.listGender === 'all';
            row.hidden = !(regionMatches && operatorMatches && genderMatches);
        });

        updateListCount();
        window.requestAnimationFrame(updateListTableSlider);
    };

    sourceChecks.forEach((check) => {
        check.addEventListener('change', () => {
            const count = updateSourceCount();
            if (status) {
                status.textContent = count.mailingsCount > 0
                    ? `Выбрано ${formatRecipientsCount(count.recipientsCount)} из ${formatMailingsCount(count.mailingsCount)}.`
                    : 'Рассылки не выбраны.';
            }
        });
    });

    sourceSelectAll?.addEventListener('change', () => {
        sourceRows.forEach((row) => {
            if (row.hidden) return;
            const check = row.querySelector('[data-mailing-source-row-check]');
            if (check) check.checked = sourceSelectAll.checked;
        });
        updateSourceCount();
    });

    sourceRefresh?.addEventListener('click', applySourceFilters);

    sourceReset?.addEventListener('click', () => {
        if (sourceSearch) sourceSearch.value = '';
        if (sourceDateFrom) sourceDateFrom.value = '';
        if (sourceDateTo) sourceDateTo.value = '';
        if (sourceAgeFrom) sourceAgeFrom.value = '18';
        if (sourceAgeTo) sourceAgeTo.value = '30';
        if (sourceGender) sourceGender.value = 'all';
        sourceRows.forEach((row) => {
            row.hidden = false;
        });
        updateSourceCount();
        window.requestAnimationFrame(updateSourceTableSlider);
    });

    listChecks.forEach((check) => {
        check.addEventListener('change', () => {
            const count = updateListCount();
            if (status) {
                status.textContent = count.listsCount > 0
                    ? `Выбрано ${formatRecipientsCount(count.recipientsCount)} из ${formatListsCount(count.listsCount)}.`
                    : 'Списки не выбраны.';
            }
        });
    });

    listSelectAll?.addEventListener('change', () => {
        listRows.forEach((row) => {
            if (row.hidden) return;
            const check = row.querySelector('[data-mailing-list-row-check]');
            if (check) check.checked = listSelectAll.checked;
        });
        updateListCount();
    });

    listRefresh?.addEventListener('click', applyListFilters);

    listReset?.addEventListener('click', () => {
        if (listRegion) listRegion.value = 'all';
        if (listOperator) listOperator.value = 'all';
        if (listGender) listGender.value = 'all';
        listRows.forEach((row) => {
            row.hidden = false;
        });
        updateListCount();
        window.requestAnimationFrame(updateListTableSlider);
    });

    fileInput?.addEventListener('change', () => {
        const selectedFile = fileInput.files?.[0];
        setFileLoaded(selectedFile);
        if (status) {
            status.textContent = selectedFile ? `Файл ${selectedFile.name} выбран.` : 'Файл не выбран.';
        }
    });

    fileInput?.addEventListener('click', () => {
        window.setTimeout(() => {
            if (!isFileLoaded && !fileInput.files?.length) {
                showDemoFileLoaded();
            }
        }, 300);
    });

    fileLoadedNameBadge?.addEventListener('click', () => {
        if (fileInput) {
            fileInput.value = '';
        }
        setFileLoaded(null);
        if (status) {
            status.textContent = 'Файл удалён из загрузки.';
        }
    });

    fileCustom?.addEventListener('change', () => {
        if (fileCustom.checked) {
            openUploadModal(customModal, fileCustom);
            if (status) {
                status.textContent = 'Открыта настраиваемая загрузка файла.';
            }
            return;
        }

        if (status) {
            status.textContent = 'Настраиваемая загрузка выключена.';
        }
    });

    fileRules?.addEventListener('click', () => {
        openUploadModal(rulesModal, fileRules);
        if (status) {
            status.textContent = 'Открыты правила заполнения файла.';
        }
    });

    uploadModals.forEach((modal) => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal || event.target.closest('[data-mailing-upload-modal-close]')) {
                closeUploadModal({
                    keepCustom: modal !== customModal || fileCustom?.checked === true,
                });
                return;
            }

            const selectToggle = event.target.closest('[data-mailing-map-select-toggle]');
            if (selectToggle) {
                const select = selectToggle.closest('[data-mailing-map-select]');
                const willOpen = !select?.classList.contains('is-open');
                closeMapSelects(select);
                setMapSelectOpen(select, willOpen);
                return;
            }

            const option = event.target.closest('[data-mailing-map-select-option]');
            if (option) {
                const select = option.closest('[data-mailing-map-select]');
                const value = select?.querySelector('[data-mailing-map-select-toggle] span');
                if (value) {
                    value.textContent = option.textContent.trim();
                }
                setMapSelectOpen(select, false);
            }
        });
    });

    messageConfirmModal?.addEventListener('click', (event) => {
        if (event.target === messageConfirmModal) {
            closeConfirmModal();
        }
    });

    document.addEventListener('click', (event) => {
        if (activeMessageRowMenuTrigger && !event.target.closest('[data-mailing-message-row-menu]') && !event.target.closest('[data-mailing-message-menu-toggle]')) {
            closeMessageRowMenu();
        }

        if (!activeUploadModal) return;
        if (event.target.closest('[data-mailing-map-select]')) return;
        closeMapSelects();
    });

    document.addEventListener('keydown', (event) => {
        if (activeMessageRowMenuTrigger && event.key === 'Escape') {
            closeMessageRowMenu();
            return;
        }

        if (activeConfirmModal && event.key === 'Escape') {
            closeConfirmModal();
            return;
        }

        if (!activeUploadModal || event.key !== 'Escape') return;
        closeUploadModal({
            keepCustom: activeUploadModal !== customModal || fileCustom?.checked === true,
        });
    });

    customChoose?.addEventListener('click', () => {
        showDemoFileLoaded();
    });

    customCancel?.addEventListener('click', () => {
        closeUploadModal({ keepCustom: false });
        if (status) {
            status.textContent = 'Настраиваемая загрузка отменена.';
        }
    });

    customSave?.addEventListener('click', () => {
        if (fileCustom) {
            fileCustom.checked = true;
        }
        showDemoFileLoaded();
        closeUploadModal();
        if (status) {
            status.textContent = 'Настройки загрузки файла сохранены.';
        }
    });

    const addRecipient = () => {
        const phone = phoneInput?.value.trim() || '';
        const emptyPhone = !phone;

        setInvalid(phoneInput, emptyPhone);

        if (emptyPhone) {
            phoneInput?.focus();
            if (status) {
                status.textContent = 'Укажите телефон получателя.';
            }
            return false;
        }

        const code = codeSelect?.value || '+996';
        const phoneKey = `${code}${phone.replace(/\D/g, '') || phone}`;
        const existingRecipient = getRows().find((row) => row.dataset.recipientPhone === phoneKey);

        if (existingRecipient) {
            setInvalid(phoneInput, true);
            showSelectedState();
            if (status) {
                status.textContent = 'Такой получатель уже добавлен.';
            }
            return false;
        }

        setInvalid(phoneInput, false);
        const recipientName = nameInput?.value.trim() || 'Получатель';
        const birthday = birthdayInput?.value.trim() || '';
        const age = ageInput?.value ? String(clampAge(ageInput.value)) : '';
        const gender = genderSelect?.selectedOptions?.[0]?.textContent?.trim() || '';
        const recipientRow = createRecipientRow({
            phone: formatPhone(code, phone),
            phoneKey,
            name: recipientName,
            birthday,
            age,
            gender,
        });

        tableBody?.append(recipientRow);
        showSelectedState();
        form?.reset();
        if (ageInput) {
            ageInput.value = '24';
        }

        if (status) {
            status.textContent = 'Получатель добавлен в рассылку.';
        }

        return true;
    };

    addButton?.addEventListener('click', (event) => {
        if (currentMode !== 'manual') return;

        event.preventDefault();
        addRecipient();
    });

    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        if (currentMode === 'mailing') {
            applySourceFilters();
            return;
        }
        if (currentMode === 'list') {
            applyListFilters();
            return;
        }
        if (currentMode === 'file') {
            showDemoFileLoaded();
            return;
        }
        addRecipient();
    });

    continueButton?.addEventListener('click', () => {
        if (currentMode === 'mailing') {
            const { mailingsCount } = updateSourceCount();
            if (mailingsCount === 0) {
                if (status) {
                    status.textContent = 'Выберите рассылку для добавления получателей.';
                }
                return;
            }
        }
        if (currentMode === 'list') {
            const { listsCount } = updateListCount();
            if (listsCount === 0) {
                if (status) {
                    status.textContent = 'Выберите список для добавления получателей.';
                }
                return;
            }
        }
        if (currentMode === 'file' && !isFileLoaded) {
            showDemoFileLoaded();
            return;
        }

        if (currentMode !== 'mailing' && currentMode !== 'list' && currentMode !== 'file') {
            const hasRecipient = selectedState && !selectedState.hidden && getRows().length > 0;
            if (hasPendingManualRecipient() && !addRecipient()) return;
            if (!hasRecipient && getRows().length === 0 && !addRecipient()) return;
        }

        completeRecipientsStep();
    });

    if (window.location.hash === '#message') {
        setCreateStep('message');
    }

    window.requestAnimationFrame(stabilizePageHorizontalScroll);
}
