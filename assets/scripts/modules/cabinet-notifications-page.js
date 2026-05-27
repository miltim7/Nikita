export function initCabinetNotificationsPage() {
    const page = document.querySelector('[data-cabinet-notifications-page]');
    if (!page) return;

    const selectAll = page.querySelector('[data-notifications-select-all]');
    const rowChecks = Array.from(page.querySelectorAll('[data-notification-row-check]'));
    const markRead = page.querySelector('[data-notifications-mark-read]');
    const deleteSelected = page.querySelector('[data-notifications-delete]');
    const pageSize = page.querySelector('[data-notifications-page-size]');
    const pageSizeToggle = page.querySelector('[data-notifications-page-size-toggle]');
    const pageSizeValue = page.querySelector('[data-notifications-page-size-value]');
    const pageSizeList = page.querySelector('[data-notifications-page-size-list]');
    const pageSizeOptions = Array.from(page.querySelectorAll('[data-notifications-page-size-option]'));

    const isVisible = (element) => Boolean(element?.getClientRects().length);
    const getVisibleRowChecks = () => rowChecks.filter((checkbox) => isVisible(checkbox.closest('[data-notification-row]')));

    const updateSelectAll = () => {
        if (!selectAll) return;

        const visibleChecks = getVisibleRowChecks();
        const checkedCount = visibleChecks.filter((checkbox) => checkbox.checked).length;
        selectAll.checked = checkedCount === visibleChecks.length && visibleChecks.length > 0;
        selectAll.indeterminate = false;
    };

    selectAll?.addEventListener('change', () => {
        getVisibleRowChecks().forEach((checkbox) => {
            checkbox.checked = selectAll.checked;
        });
        updateSelectAll();
    });

    rowChecks.forEach((checkbox) => {
        checkbox.addEventListener('change', updateSelectAll);
    });

    markRead?.addEventListener('click', () => {
        getVisibleRowChecks().forEach((checkbox) => {
            checkbox.checked = false;
        });
        updateSelectAll();
    });

    deleteSelected?.addEventListener('click', () => {
        getVisibleRowChecks()
            .filter((checkbox) => checkbox.checked)
            .forEach((checkbox) => {
                checkbox.closest('[data-notification-row]')?.remove();
            });

        rowChecks.splice(0, rowChecks.length, ...page.querySelectorAll('[data-notification-row-check]'));
        updateSelectAll();
    });

    const setPageSizeOpen = (open) => {
        if (!pageSizeToggle || !pageSizeList) return;

        pageSizeList.hidden = !open;
        pageSizeToggle.setAttribute('aria-expanded', String(open));
    };

    pageSizeToggle?.addEventListener('click', (event) => {
        event.stopPropagation();
        setPageSizeOpen(pageSizeList?.hidden ?? true);
    });

    pageSizeOptions.forEach((option) => {
        option.addEventListener('click', () => {
            const value = option.dataset.notificationsPageSizeOption;

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

    document.addEventListener('click', (event) => {
        if (!pageSize || pageSize.contains(event.target)) return;
        setPageSizeOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setPageSizeOpen(false);
        }
    });

    updateSelectAll();
}
