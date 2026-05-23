export function initCabinetTemplatesPage() {
    const moduleRoot = document.querySelector('[data-cabinet-templates-root]');
    const root = moduleRoot?.querySelector('[data-cabinet-templates-page]') || document.querySelector('[data-cabinet-templates-page]');
    if (!moduleRoot && !root) return;

    const sizeToggle = root.querySelector('[data-templates-page-size-toggle]');
    const sizeValue = root.querySelector('[data-templates-page-size-value]');
    const sizeList = root.querySelector('[data-templates-page-size-list]');
    const sizeOptions = Array.from(root.querySelectorAll('[data-templates-page-size-option]'));
    const tableScroll = root.querySelector('[data-templates-table-scroll]');
    const scrollbar = root.querySelector('[data-templates-scrollbar]');
    const scrollbarThumb = root.querySelector('[data-templates-scrollbar-thumb]');
    const tabRoot = moduleRoot || document;
    const tabs = Array.from(document.querySelectorAll('[data-templates-tab]'));
    const panels = Array.from(tabRoot.querySelectorAll('[data-templates-panel]'));
    const availableTabs = new Set(panels.map((panel) => panel.dataset.templatesPanel).filter(Boolean));
    const testingRoot = tabRoot.querySelector('[data-templates-testing]');
    const testingForm = testingRoot?.querySelector('[data-templates-testing-form]');
    const testingShowButton = testingRoot?.querySelector('[data-templates-testing-show]');
    const testingClearButton = testingRoot?.querySelector('[data-templates-testing-clear]');
    const testingResult = testingRoot?.querySelector('[data-templates-testing-result]');
    const testingSelects = Array.from(testingRoot?.querySelectorAll('[data-templates-testing-select]') || []);
    let userSelectedSize = false;

    const setSize = (value) => {
        if (!sizeValue) return;
        sizeValue.textContent = value;

        sizeOptions.forEach((option) => {
            const isActive = option.dataset.templatesPageSizeOption === value;
            option.classList.toggle('is-active', isActive);
            option.setAttribute('aria-selected', String(isActive));
        });
    };

    const getResponsiveSize = () => {
        if (!sizeToggle) return '10';
        return window.matchMedia('(max-width: 767.98px)').matches
            ? sizeToggle.dataset.mobileValue || '50'
            : sizeToggle.dataset.desktopValue || '10';
    };

    const closeSizeList = () => {
        if (!sizeToggle || !sizeList) return;
        sizeList.hidden = true;
        sizeToggle.setAttribute('aria-expanded', 'false');
    };

    const openSizeList = () => {
        if (!sizeToggle || !sizeList) return;
        sizeList.hidden = false;
        sizeToggle.setAttribute('aria-expanded', 'true');
    };

    const syncScrollbar = () => {
        if (!tableScroll || !scrollbarThumb) return;

        const maxScroll = tableScroll.scrollWidth - tableScroll.clientWidth;
        if (maxScroll <= 0) {
            if (scrollbar) scrollbar.hidden = true;
            scrollbarThumb.style.transform = 'translateX(0)';
            return;
        }

        if (scrollbar) scrollbar.hidden = false;

        const progress = tableScroll.scrollLeft / maxScroll;
        const trackWidth = tableScroll.clientWidth;
        const thumbWidth = trackWidth * 0.375;
        const travel = Math.max(0, trackWidth - thumbWidth);

        scrollbarThumb.style.width = '37.5%';
        scrollbarThumb.style.transform = `translateX(${progress * travel}px)`;
    };

    const getCurrentTab = () => {
        const hash = window.location.hash.replace('#', '');
        return availableTabs.has(hash) ? hash : 'templates';
    };

    const setActiveTab = (tabName, shouldUpdateUrl = false) => {
        if (!availableTabs.has(tabName)) return;

        panels.forEach((panel) => {
            panel.hidden = panel.dataset.templatesPanel !== tabName;
        });

        tabs.forEach((tab) => {
            const isActive = tab.dataset.templatesTab === tabName;
            tab.classList.toggle('is-active', isActive);
            if (isActive) {
                tab.setAttribute('aria-current', 'page');
            } else {
                tab.removeAttribute('aria-current');
            }
        });

        if (shouldUpdateUrl) {
            const nextUrl = tabName === 'templates'
                ? `${window.location.pathname}${window.location.search}`
                : `#${tabName}`;
            window.history.pushState(null, '', nextUrl);
        }

        if (tabName === 'templates') {
            window.requestAnimationFrame(syncScrollbar);
        }
    };

    const closeTestingSelects = (except = null) => {
        testingSelects.forEach((select) => {
            if (select === except) return;
            const toggle = select.querySelector('[data-templates-testing-select-toggle]');
            const menu = select.querySelector('[data-templates-testing-select-menu]');
            if (menu) menu.hidden = true;
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
    };

    const setTestingResult = (isVisible) => {
        if (!testingRoot || !testingResult || !testingShowButton) return;
        testingRoot.classList.toggle('is-result', isVisible);
        testingResult.hidden = !isVisible;
        testingShowButton.disabled = isVisible;
        testingShowButton.setAttribute('aria-disabled', String(isVisible));
    };

    if (sizeToggle && sizeList) {
        sizeToggle.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (sizeList.hidden) {
                openSizeList();
            } else {
                closeSizeList();
            }
        });

        sizeOptions.forEach((option) => {
            option.addEventListener('click', () => {
                userSelectedSize = true;
                setSize(option.dataset.templatesPageSizeOption || option.textContent.trim());
                closeSizeList();
            });
        });

        document.addEventListener('click', (event) => {
            if (sizeList.hidden) return;
            if (sizeToggle.contains(event.target) || sizeList.contains(event.target)) return;
            closeSizeList();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeSizeList();
        });
    }

    const applyResponsiveSize = () => {
        if (!userSelectedSize) setSize(getResponsiveSize());
    };

    tabs.forEach((tab) => {
        const tabName = tab.dataset.templatesTab;
        if (!availableTabs.has(tabName)) return;

        tab.addEventListener('click', (event) => {
            event.preventDefault();
            setActiveTab(tabName, true);
        });
    });

    testingForm?.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    testingShowButton?.addEventListener('click', () => {
        setTestingResult(true);
        closeTestingSelects();
    });

    testingClearButton?.addEventListener('click', () => {
        setTestingResult(false);
        closeTestingSelects();
    });

    testingSelects.forEach((select) => {
        const toggle = select.querySelector('[data-templates-testing-select-toggle]');
        const menu = select.querySelector('[data-templates-testing-select-menu]');
        const options = Array.from(select.querySelectorAll('[role="option"]'));

        toggle?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const willOpen = menu?.hidden;
            closeTestingSelects(select);
            if (!menu) return;
            menu.hidden = !willOpen;
            toggle.setAttribute('aria-expanded', String(willOpen));
        });

        options.forEach((option) => {
            option.addEventListener('click', (event) => {
                event.preventDefault();
                option.setAttribute('aria-selected', 'true');
                if (menu) menu.hidden = true;
                toggle?.setAttribute('aria-expanded', 'false');
            });
        });
    });

    document.addEventListener('click', (event) => {
        if (!testingRoot?.contains(event.target)) closeTestingSelects();
    });

    window.addEventListener('hashchange', () => setActiveTab(getCurrentTab()));
    window.addEventListener('popstate', () => setActiveTab(getCurrentTab()));

    setTestingResult(false);
    setActiveTab(getCurrentTab());
    applyResponsiveSize();
    window.addEventListener('resize', applyResponsiveSize);

    tableScroll?.addEventListener('scroll', syncScrollbar, { passive: true });
    window.addEventListener('resize', syncScrollbar);
    syncScrollbar();
}
