export function initCabinetMailingsPage() {
    const page = document.querySelector('[data-cabinet-mailings-page]');
    if (!page) return;

    const filter = page.querySelector('[data-mailings-filter]');
    const filterToggle = page.querySelector('[data-mailings-filter-toggle]');
    const selectAll = page.querySelector('[data-mailings-select-all]');
    let rowChecks = Array.from(page.querySelectorAll('[data-mailing-row-check]'));
    const deleteSelected = page.querySelector('[data-mailings-delete]');
    const pageSize = page.querySelector('[data-mailings-page-size]');
    const pageSizeToggle = page.querySelector('[data-mailings-page-size-toggle]');
    const pageSizeValue = page.querySelector('[data-mailings-page-size-value]');
    const pageSizeList = page.querySelector('[data-mailings-page-size-list]');
    const pageSizeOptions = Array.from(page.querySelectorAll('[data-mailings-page-size-option]'));
    const tableScroll = page.querySelector('.cabinet-mailings__table-scroll');
    const scrollbarThumb = page.querySelector('.cabinet-mailings__scrollbar-thumb');
    const scrollbarKnob = page.querySelector('.cabinet-mailings__scrollbar-knob');

    const updateSelectAll = () => {
        if (!selectAll) return;

        const activeChecks = rowChecks.filter((checkbox) => checkbox.closest('[data-mailing-row]'));
        const checkedCount = activeChecks.filter((checkbox) => checkbox.checked).length;

        selectAll.checked = checkedCount === activeChecks.length && activeChecks.length > 0;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < activeChecks.length;
    };

    const setFilterOpen = (open) => {
        page.classList.toggle('is-filter-open', open);
        filterToggle?.setAttribute('aria-expanded', String(open));
        filterToggle?.setAttribute('aria-label', open ? 'Закрыть фильтр' : 'Открыть фильтр');
    };

    filterToggle?.addEventListener('click', () => {
        setFilterOpen(!page.classList.contains('is-filter-open'));
    });

    filter?.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    filter?.addEventListener('reset', () => {
        window.setTimeout(() => {
            filter.querySelectorAll('select').forEach((select) => {
                select.selectedIndex = 0;
            });
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
                checkbox.closest('[data-mailing-row]')?.remove();
            });

        rowChecks = Array.from(page.querySelectorAll('[data-mailing-row-check]'));
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
            const value = option.dataset.mailingsPageSizeOption;

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

    const updateScrollbar = () => {
        if (!tableScroll || !scrollbarThumb || !scrollbarKnob) return;

        const maxScroll = tableScroll.scrollWidth - tableScroll.clientWidth;
        const progress = maxScroll > 0 ? tableScroll.scrollLeft / maxScroll : 0;
        const available = 62.5;
        const offset = progress * available;

        scrollbarThumb.style.left = `${offset}%`;
        scrollbarKnob.style.left = `${offset}%`;
    };

    tableScroll?.addEventListener('scroll', updateScrollbar, { passive: true });
    window.addEventListener('resize', updateScrollbar);

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
    updateScrollbar();
}
