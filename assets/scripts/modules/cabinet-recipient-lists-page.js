import { closeModalLayer, openModalLayer } from './modal-transition.js';

export function initCabinetRecipientListsPage() {
    const page = document.querySelector('[data-cabinet-recipient-lists-page]');
    if (!page) return;

    const filter = page.querySelector('[data-recipient-lists-filter]');
    const filterToggle = page.querySelector('[data-recipient-lists-filter-toggle]');
    const blacklist = page.querySelector('[data-recipient-lists-blacklist]');
    const select = page.querySelector('[data-recipient-lists-select]');
    const selectToggle = page.querySelector('[data-recipient-lists-select-toggle]');
    const selectLabel = page.querySelector('[data-recipient-lists-select-label]');
    const selectList = page.querySelector('[data-recipient-lists-select-list]');
    const selectOptions = Array.from(page.querySelectorAll('[data-recipient-lists-select-option]'));
    const selectAll = page.querySelector('[data-recipient-lists-select-all]');
    let rowChecks = Array.from(page.querySelectorAll('[data-recipient-list-row-check]'));
    const deleteSelected = page.querySelector('[data-recipient-lists-delete-selected]');
    const deleteList = page.querySelector('[data-recipient-lists-delete-list]');
    const pageSize = page.querySelector('[data-recipient-lists-page-size]');
    const pageSizeToggle = page.querySelector('[data-recipient-lists-page-size-toggle]');
    const pageSizeValue = page.querySelector('[data-recipient-lists-page-size-value]');
    const pageSizeList = page.querySelector('[data-recipient-lists-page-size-list]');
    const pageSizeOptions = Array.from(page.querySelectorAll('[data-recipient-lists-page-size-option]'));
    const actionControls = Array.from(page.querySelectorAll('[data-recipient-lists-action-control]'));
    const addRecipientModal = document.querySelector('[data-recipient-lists-add-modal]');
    const addRecipientDialog = addRecipientModal?.querySelector('.cabinet-recipient-lists-modal__dialog');
    const addRecipientForm = addRecipientModal?.querySelector('[data-recipient-lists-add-form]');
    const addRecipientOpen = page.querySelector('[data-recipient-lists-add-manual]');
    const addRecipientClose = addRecipientModal?.querySelectorAll('[data-recipient-lists-add-close]');
    const modalSelects = Array.from(addRecipientModal?.querySelectorAll('[data-recipient-lists-modal-select]') ?? []);
    const tableScroll = page.querySelector('.cabinet-recipient-lists__table-scroll');
    const scrollbarThumb = page.querySelector('.cabinet-recipient-lists__scrollbar-thumb');
    const scrollbarKnob = page.querySelector('.cabinet-recipient-lists__scrollbar-knob');
    let activeAddRecipientTrigger = null;

    const refreshRows = () => {
        rowChecks = Array.from(page.querySelectorAll('[data-recipient-list-row-check]'));
    };

    const updateSelectAll = () => {
        if (!selectAll) return;

        const activeChecks = rowChecks.filter((checkbox) => checkbox.closest('[data-recipient-list-row]'));
        const checkedCount = activeChecks.filter((checkbox) => checkbox.checked).length;

        selectAll.checked = checkedCount === activeChecks.length && activeChecks.length > 0;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < activeChecks.length;
    };

    const setFilterOpen = (open) => {
        page.classList.toggle('is-filter-open', open);
        filterToggle?.setAttribute('aria-expanded', String(open));
        filterToggle?.setAttribute('aria-label', open ? 'Закрыть фильтр' : 'Открыть фильтр');
    };

    const setSelectOpen = (open) => {
        if (!selectToggle || !selectList) return;

        selectList.hidden = !open;
        selectToggle.setAttribute('aria-expanded', String(open));
    };

    const setPageSizeOpen = (open) => {
        if (!pageSizeToggle || !pageSizeList) return;

        pageSizeList.hidden = !open;
        pageSizeToggle.setAttribute('aria-expanded', String(open));
    };

    const setActionMenuOpen = (control, open) => {
        const toggle = control?.querySelector('[data-recipient-lists-action-toggle]');
        const menu = control?.querySelector('[data-recipient-lists-action-menu]');
        if (!toggle || !menu) return;

        control.classList.toggle('is-open', open);
        menu.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
    };

    const closeActionMenus = (except = null) => {
        actionControls.forEach((control) => {
            if (control !== except) {
                setActionMenuOpen(control, false);
            }
        });
    };

    const closeModalSelects = (except = null) => {
        modalSelects.forEach((select) => {
            if (select !== except) {
                select.classList.remove('is-open');
                select.querySelector('[data-recipient-lists-modal-select-toggle]')?.setAttribute('aria-expanded', 'false');
            }
        });
    };

    const resetModalSelects = () => {
        modalSelects.forEach((select) => {
            const value = select.querySelector('[data-recipient-lists-modal-select-value]');
            const input = select.querySelector('[data-recipient-lists-modal-select-input]');

            if (value) {
                value.textContent = 'Не выбран';
                value.classList.add('is-placeholder');
            }

            if (input) {
                input.value = '';
            }

            select.querySelectorAll('[data-recipient-lists-modal-select-option]').forEach((option) => {
                option.classList.remove('is-active');
                option.setAttribute('aria-selected', 'false');
            });
        });
    };

    const setModalSelectOpen = (select, open) => {
        if (!select) return;

        select.classList.toggle('is-open', open);
        select.querySelector('[data-recipient-lists-modal-select-toggle]')?.setAttribute('aria-expanded', String(open));
    };

    const escapeHtml = (value) => String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    const isAddRecipientModalOpen = () => Boolean(addRecipientModal && !addRecipientModal.hidden && addRecipientModal.classList.contains('is-open'));

    const openAddRecipientModal = (trigger = document.activeElement) => {
        if (!addRecipientModal) return;

        activeAddRecipientTrigger = trigger;
        closeActionMenus();
        setSelectOpen(false);
        setPageSizeOpen(false);
        document.body.classList.add('is-cabinet-modal-open');
        openModalLayer(addRecipientModal);
        addRecipientDialog?.focus({ preventScroll: true });
    };

    const closeAddRecipientModal = () => {
        if (!addRecipientModal || !isAddRecipientModalOpen()) return;

        closeModalSelects();
        closeModalLayer(addRecipientModal, {
            afterClose: () => {
                document.body.classList.remove('is-cabinet-modal-open');
                activeAddRecipientTrigger?.focus?.({ preventScroll: true });
                activeAddRecipientTrigger = null;
            },
        });
    };

    const createRecipientRow = (formData) => {
        const head = page.querySelector('.cabinet-recipient-lists-table__row--head');
        if (!head) return;

        const phone = formData.get('phone')?.trim() || '+996 XXX - XXX - XXX';
        const birth = formData.get('birth')?.trim() || '30.12.2014';
        const gender = formData.get('gender') || 'М';
        const name = formData.get('fullname')?.trim()
            || `${formData.get('lastName')?.trim() || 'Фамилия'} ${formData.get('firstName')?.trim()?.charAt(0) || 'И'}...`;
        const extra1 = formData.get('extra1')?.trim() || '256 984.40';
        const extra2 = formData.get('extra2')?.trim() || 'Значение 001';
        const extra3 = formData.get('extra3')?.trim() || 'Value-01';

        const row = document.createElement('div');
        row.className = 'cabinet-recipient-lists-table__row';
        row.setAttribute('role', 'row');
        row.setAttribute('data-recipient-list-row', '');
        row.innerHTML = `
            <div class="cabinet-recipient-lists-table__cell cabinet-recipient-lists-table__cell--phone" role="cell"><input class="cabinet-recipient-lists-table__checkbox" type="checkbox" aria-label="Выбрать получателя ${escapeHtml(phone)}" data-recipient-list-row-check><span>${escapeHtml(phone)}</span></div>
            <div class="cabinet-recipient-lists-table__cell cabinet-recipient-lists-table__cell--name" role="cell">${escapeHtml(name)}</div>
            <div class="cabinet-recipient-lists-table__cell cabinet-recipient-lists-table__cell--birth" role="cell">${escapeHtml(birth)}</div>
            <div class="cabinet-recipient-lists-table__cell cabinet-recipient-lists-table__cell--gender" role="cell">${escapeHtml(gender)}</div>
            <div class="cabinet-recipient-lists-table__cell cabinet-recipient-lists-table__cell--region" role="cell">Кыргызстан</div>
            <div class="cabinet-recipient-lists-table__cell cabinet-recipient-lists-table__cell--operator" role="cell">Operator 001</div>
            <div class="cabinet-recipient-lists-table__cell cabinet-recipient-lists-table__cell--timezone" role="cell">GMT +3</div>
            <div class="cabinet-recipient-lists-table__cell cabinet-recipient-lists-table__cell--extra cabinet-recipient-lists-table__cell--numeric" role="cell">${escapeHtml(extra1)}</div>
            <div class="cabinet-recipient-lists-table__cell cabinet-recipient-lists-table__cell--extra" role="cell">${escapeHtml(extra2)}</div>
            <div class="cabinet-recipient-lists-table__cell cabinet-recipient-lists-table__cell--extra" role="cell">${escapeHtml(extra3)}</div>
            <div class="cabinet-recipient-lists-table__cell cabinet-recipient-lists-table__cell--more" role="cell"><button class="cabinet-recipient-lists-table__more" type="button" aria-label="Действия получателя"><img src="assets/images/cabinet-recipient-lists/row-more-desktop.svg" alt=""></button></div>
        `;

        head.after(row);
        row.querySelector('[data-recipient-list-row-check]')?.addEventListener('change', updateSelectAll);
        refreshRows();
        updateSelectAll();
        updateScrollbar();
    };

    const updateScrollbar = () => {
        if (!tableScroll || !scrollbarThumb || !scrollbarKnob) return;

        const maxScroll = tableScroll.scrollWidth - tableScroll.clientWidth;
        const progress = maxScroll > 0 ? tableScroll.scrollLeft / maxScroll : 0;
        const available = 62.5;
        const offset = progress * available;

        scrollbarThumb.style.left = `${offset}%`;
        scrollbarKnob.style.left = `${offset}%`;
    };

    filterToggle?.addEventListener('click', () => {
        setFilterOpen(!page.classList.contains('is-filter-open'));
    });

    blacklist?.addEventListener('click', () => {
        const isActive = blacklist.getAttribute('aria-pressed') !== 'true';
        blacklist.setAttribute('aria-pressed', String(isActive));
        blacklist.classList.toggle('is-active', isActive);
    });

    selectToggle?.addEventListener('click', (event) => {
        event.stopPropagation();
        setPageSizeOpen(false);
        closeActionMenus();
        setSelectOpen(selectList?.hidden ?? true);
    });

    selectOptions.forEach((option) => {
        option.addEventListener('click', () => {
            const value = option.dataset.recipientListsSelectOption;

            if (selectLabel && value) {
                selectLabel.textContent = value;
            }

            selectOptions.forEach((item) => {
                const isCurrent = item === option;
                item.classList.toggle('is-active', isCurrent);
                item.setAttribute('aria-selected', String(isCurrent));
            });

            setSelectOpen(false);
        });
    });

    filter?.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    filter?.addEventListener('reset', () => {
        window.setTimeout(() => {
            if (selectLabel) {
                selectLabel.textContent = 'Выбрать список';
            }

            selectOptions.forEach((option) => {
                option.classList.remove('is-active');
                option.setAttribute('aria-selected', 'false');
            });

            blacklist?.setAttribute('aria-pressed', 'false');
            blacklist?.classList.remove('is-active');
            setSelectOpen(false);
        }, 0);
    });

    selectAll?.addEventListener('change', () => {
        rowChecks.forEach((checkbox) => {
            checkbox.checked = selectAll.checked;
        });
        updateSelectAll();
    });

    rowChecks.forEach((checkbox) => {
        checkbox.addEventListener('change', updateSelectAll);
    });

    deleteSelected?.addEventListener('click', () => {
        rowChecks
            .filter((checkbox) => checkbox.checked)
            .forEach((checkbox) => {
                checkbox.closest('[data-recipient-list-row]')?.remove();
            });

        refreshRows();
        updateSelectAll();
        updateScrollbar();
    });

    deleteList?.addEventListener('click', () => {
        page.querySelectorAll('[data-recipient-list-row]').forEach((row) => {
            row.remove();
        });

        refreshRows();
        updateSelectAll();
        updateScrollbar();
    });

    pageSizeToggle?.addEventListener('click', (event) => {
        event.stopPropagation();
        setSelectOpen(false);
        closeActionMenus();
        setPageSizeOpen(pageSizeList?.hidden ?? true);
    });

    pageSizeOptions.forEach((option) => {
        option.addEventListener('click', () => {
            const value = option.dataset.recipientListsPageSizeOption;

            if (pageSizeValue && value) {
                pageSizeValue.textContent = value;
            }

            pageSizeOptions.forEach((item) => {
                const isCurrent = item === option;
                item.classList.toggle('is-active', isCurrent);
                item.setAttribute('aria-selected', String(isCurrent));
            });

            setPageSizeOpen(false);
        });
    });

    actionControls.forEach((control) => {
        const toggle = control.querySelector('[data-recipient-lists-action-toggle]');
        const menu = control.querySelector('[data-recipient-lists-action-menu]');

        toggle?.addEventListener('click', (event) => {
            event.stopPropagation();
            const shouldOpen = menu?.hidden ?? true;

            setSelectOpen(false);
            setPageSizeOpen(false);
            closeActionMenus(control);
            setActionMenuOpen(control, shouldOpen);
        });

        menu?.addEventListener('click', (event) => {
            if (!event.target.closest('[role="menuitem"]')) return;
            setActionMenuOpen(control, false);
        });
    });

    addRecipientOpen?.addEventListener('click', (event) => {
        event.stopPropagation();
        openAddRecipientModal(addRecipientOpen);
    });

    addRecipientClose?.forEach((button) => {
        button.addEventListener('click', closeAddRecipientModal);
    });

    modalSelects.forEach((select) => {
        const toggle = select.querySelector('[data-recipient-lists-modal-select-toggle]');
        const value = select.querySelector('[data-recipient-lists-modal-select-value]');
        const input = select.querySelector('[data-recipient-lists-modal-select-input]');

        toggle?.addEventListener('click', (event) => {
            event.stopPropagation();
            const shouldOpen = !select.classList.contains('is-open');
            closeModalSelects(select);
            setModalSelectOpen(select, shouldOpen);
        });

        select.querySelectorAll('[data-recipient-lists-modal-select-option]').forEach((option) => {
            option.addEventListener('click', () => {
                const optionValue = option.dataset.recipientListsModalSelectOption || option.textContent.trim();

                if (value) {
                    value.textContent = optionValue;
                    value.classList.remove('is-placeholder');
                }

                if (input) {
                    input.value = optionValue;
                }

                select.querySelectorAll('[data-recipient-lists-modal-select-option]').forEach((item) => {
                    const isCurrent = item === option;
                    item.classList.toggle('is-active', isCurrent);
                    item.setAttribute('aria-selected', String(isCurrent));
                });

                setModalSelectOpen(select, false);
            });
        });
    });

    addRecipientModal?.addEventListener('click', (event) => {
        if (event.target === addRecipientModal) {
            closeAddRecipientModal();
            return;
        }

        if (!event.target.closest('[data-recipient-lists-modal-select]')) {
            closeModalSelects();
        }
    });

    addRecipientForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        createRecipientRow(new FormData(addRecipientForm));
        addRecipientForm.reset();
        resetModalSelects();
        closeAddRecipientModal();
    });

    tableScroll?.addEventListener('scroll', updateScrollbar, { passive: true });
    window.addEventListener('resize', updateScrollbar);

    document.addEventListener('click', (event) => {
        if (!select || !select.contains(event.target)) {
            setSelectOpen(false);
        }

        if (!pageSize || !pageSize.contains(event.target)) {
            setPageSizeOpen(false);
        }

        if (!actionControls.some((control) => control.contains(event.target))) {
            closeActionMenus();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (isAddRecipientModalOpen()) {
                closeAddRecipientModal();
                return;
            }

            setSelectOpen(false);
            setPageSizeOpen(false);
            closeActionMenus();
        }
    });

    updateSelectAll();
    updateScrollbar();
}
