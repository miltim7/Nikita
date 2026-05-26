export function initCabinetReportsPage() {
    const page = document.querySelector('[data-cabinet-reports-page]');
    if (!page) return;

    const tabs = Array.from(document.querySelectorAll('[data-reports-tab]'));
    const panels = Array.from(page.querySelectorAll('[data-reports-panel]'));
    const filters = Array.from(page.querySelectorAll('[data-reports-filter]'));
    const filterToggles = Array.from(page.querySelectorAll('[data-reports-filter-toggle]'));
    const pageSizeControls = Array.from(page.querySelectorAll('[data-reports-page-size]'));
    const actionControls = Array.from(page.querySelectorAll('[data-reports-action-control]'));
    const tableScrolls = Array.from(page.querySelectorAll('.cabinet-reports__table-scroll'));
    const responsiveSelects = Array.from(page.querySelectorAll('select[data-desktop-value][data-compact-value]'));
    const responsivePageSizeToggles = Array.from(page.querySelectorAll('[data-reports-page-size-toggle][data-desktop-value][data-mobile-value]'));

    const supportedTabs = new Set(['current', 'periods', 'traffic', 'payments']);

    const getTabFromHash = () => {
        const hashTab = window.location.hash.replace('#', '');
        return supportedTabs.has(hashTab) ? hashTab : 'current';
    };

    const updateScrollbars = () => {
        tableScrolls.forEach((tableScroll) => {
            const panel = tableScroll.closest('[data-reports-panel]');
            if (panel?.hidden) return;

            const scrollbarThumb = panel?.querySelector('.cabinet-reports__scrollbar-thumb');
            const scrollbarKnob = panel?.querySelector('.cabinet-reports__scrollbar-knob');
            if (!scrollbarThumb || !scrollbarKnob) return;

            const maxScroll = tableScroll.scrollWidth - tableScroll.clientWidth;
            const progress = maxScroll > 0 ? tableScroll.scrollLeft / maxScroll : 0;
            const isMobilePeriods = window.matchMedia('(max-width: 767.98px)').matches
                && panel?.dataset.reportsPanel === 'periods';
            const visibleRatio = isMobilePeriods
                ? 0.375
                : (tableScroll.scrollWidth > 0 ? tableScroll.clientWidth / tableScroll.scrollWidth : 1);
            const thumbWidth = Math.min(100, Math.max(18, visibleRatio * 100));
            const available = Math.max(0, 100 - thumbWidth);
            const offset = progress * available;

            scrollbarThumb.style.width = `${thumbWidth}%`;
            scrollbarThumb.style.left = `${offset}%`;
            scrollbarKnob.style.left = `${offset}%`;
        });
    };

    const syncResponsiveDefaults = () => {
        const isCompact = window.matchMedia('(max-width: 1199.98px)').matches;
        const isMobile = window.matchMedia('(max-width: 767.98px)').matches;

        responsiveSelects.forEach((select) => {
            const nextValue = isCompact ? select.dataset.compactValue : select.dataset.desktopValue;
            if (nextValue && select.value !== nextValue) {
                select.value = nextValue;
            }
        });

        responsivePageSizeToggles.forEach((toggle) => {
            const nextValue = isMobile ? toggle.dataset.mobileValue : toggle.dataset.desktopValue;
            const control = toggle.closest('[data-reports-page-size]');
            const valueNode = toggle.querySelector('[data-reports-page-size-value]');
            const options = Array.from(control?.querySelectorAll('[data-reports-page-size-option]') ?? []);

            if (!nextValue || !valueNode) return;

            valueNode.textContent = nextValue;
            options.forEach((option) => {
                const isCurrent = option.dataset.reportsPageSizeOption === nextValue;
                option.classList.toggle('is-active', isCurrent);
                option.setAttribute('aria-selected', String(isCurrent));
            });
        });
    };

    const setActiveTab = (tabName) => {
        const activeTab = supportedTabs.has(tabName) ? tabName : 'current';
        document.body.dataset.reportsTab = activeTab;

        panels.forEach((panel) => {
            const isCurrent = panel.dataset.reportsPanel === activeTab;
            panel.hidden = !isCurrent;
            panel.classList.toggle('is-active', isCurrent);
        });

        tabs.forEach((tab) => {
            const isCurrent = tab.dataset.reportsTab === activeTab;
            const icon = tab.querySelector('[data-reports-tab-icon]');

            tab.classList.toggle('is-active', isCurrent);
            if (isCurrent) {
                const tabsList = tab.closest('.cabinet-reports-tabs');
                if (tabsList) {
                    const mobileTabOffset = window.matchMedia('(max-width: 767.98px)').matches
                        ? ({ traffic: 102, payments: 235 }[activeTab] ?? null)
                        : null;
                    const targetScroll = mobileTabOffset === null
                        ? tab.offsetLeft - tabsList.clientWidth + tab.offsetWidth + 16
                        : tab.offsetLeft - mobileTabOffset;
                    tabsList.scrollTo({ left: Math.max(0, targetScroll), behavior: 'auto' });
                }
            }
            if (isCurrent) {
                tab.setAttribute('aria-current', 'page');
            } else {
                tab.removeAttribute('aria-current');
            }

            if (icon) {
                icon.src = isCurrent ? icon.dataset.activeSrc : icon.dataset.inactiveSrc;
            }
        });

        page.classList.remove('is-filter-open');
        filterToggles.forEach((toggle) => {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Открыть фильтр');
        });

        syncResponsiveDefaults();
        window.requestAnimationFrame(updateScrollbars);
    };

    const setFilterOpen = (open) => {
        page.classList.toggle('is-filter-open', open);
        filterToggles.forEach((toggle) => {
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Закрыть фильтр' : 'Открыть фильтр');
        });
    };

    const setActionMenuOpen = (control, open) => {
        const toggle = control?.querySelector('[data-reports-action-toggle]');
        const menu = control?.querySelector('[data-reports-action-menu]');
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

    tabs.forEach((tab) => {
        tab.addEventListener('click', (event) => {
            const tabName = tab.dataset.reportsTab;
            if (!supportedTabs.has(tabName)) return;

            event.preventDefault();
            const nextUrl = tabName === 'current' ? window.location.pathname.split('/').pop() || 'reports.html' : `#${tabName}`;
            window.history.pushState(null, '', nextUrl);
            setActiveTab(tabName);
        });
    });

    filterToggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            setFilterOpen(!page.classList.contains('is-filter-open'));
        });
    });

    filters.forEach((filter) => {
        filter.addEventListener('submit', (event) => {
            event.preventDefault();
        });

        filter.addEventListener('reset', () => {
            window.setTimeout(() => {
                filter.querySelectorAll('select').forEach((select) => {
                    select.selectedIndex = 0;
                });
            }, 0);
        });
    });

    const closePageSizeControls = (exceptControl = null) => {
        pageSizeControls.forEach((control) => {
            if (control === exceptControl) return;
            const toggle = control.querySelector('[data-reports-page-size-toggle]');
            const list = control.querySelector('[data-reports-page-size-list]');
            if (!toggle || !list) return;

            list.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        });
    };

    pageSizeControls.forEach((control) => {
        const toggle = control.querySelector('[data-reports-page-size-toggle]');
        const valueNode = control.querySelector('[data-reports-page-size-value]');
        const list = control.querySelector('[data-reports-page-size-list]');
        const options = Array.from(control.querySelectorAll('[data-reports-page-size-option]'));

        const setOpen = (open) => {
            if (!toggle || !list) return;

            list.hidden = !open;
            toggle.setAttribute('aria-expanded', String(open));
        };

        toggle?.addEventListener('click', (event) => {
            event.stopPropagation();
            closeActionMenus();
            closePageSizeControls(control);
            setOpen(list?.hidden ?? true);
        });

        options.forEach((option) => {
            option.addEventListener('click', () => {
                const value = option.dataset.reportsPageSizeOption;

                if (valueNode && value) {
                    valueNode.textContent = value;
                }

                options.forEach((item) => {
                    const isCurrent = item === option;
                    item.classList.toggle('is-active', isCurrent);
                    item.setAttribute('aria-selected', String(isCurrent));
                });

                setOpen(false);
            });
        });
    });

    actionControls.forEach((control) => {
        const toggle = control.querySelector('[data-reports-action-toggle]');
        const menu = control.querySelector('[data-reports-action-menu]');

        toggle?.addEventListener('click', (event) => {
            event.stopPropagation();
            const shouldOpen = menu?.hidden ?? true;

            closePageSizeControls();
            closeActionMenus(control);
            setActionMenuOpen(control, shouldOpen);
        });

        menu?.addEventListener('click', (event) => {
            if (!event.target.closest('[role="menuitem"]')) return;
            setActionMenuOpen(control, false);
        });
    });

    tableScrolls.forEach((tableScroll) => {
        tableScroll.addEventListener('scroll', updateScrollbars, { passive: true });
    });

    window.addEventListener('resize', () => {
        syncResponsiveDefaults();
        updateScrollbars();
    });
    window.addEventListener('hashchange', () => setActiveTab(getTabFromHash()));
    window.addEventListener('popstate', () => setActiveTab(getTabFromHash()));

    document.addEventListener('click', (event) => {
        if (pageSizeControls.some((control) => control.contains(event.target))) return;
        if (actionControls.some((control) => control.contains(event.target))) return;
        closePageSizeControls();
        closeActionMenus();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closePageSizeControls();
            closeActionMenus();
            setFilterOpen(false);
        }
    });

    setActiveTab(getTabFromHash());
}
