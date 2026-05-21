export function initServiceTabs() {
    const tablist = document.querySelector('[data-service-tabs]');
    if (!tablist) return;

    const tabs = Array.from(tablist.querySelectorAll('[data-service-tab]'));
    const panels = Array.from(document.querySelectorAll('[data-service-panel]'));
    if (!tabs.length || !panels.length) return;

    const setActiveTab = (nextTab, shouldFocus = false, shouldUpdateHash = false) => {
        const target = nextTab.dataset.serviceTab;
        const nextPanel = panels.find(panel => panel.dataset.servicePanel === target);
        if (!target || !nextPanel) return;

        tabs.forEach(tab => {
            const isActive = tab === nextTab;
            tab.classList.toggle('service-tabs__item--active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        panels.forEach(panel => {
            const isActive = panel === nextPanel;
            panel.hidden = !isActive;
            panel.classList.toggle('service-tabpanel--active', isActive);
        });

        const targetScroll = nextTab.offsetLeft - (tablist.clientWidth - nextTab.offsetWidth) / 2;
        tablist.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
        if (shouldUpdateHash) {
            const nextHash = nextTab.getAttribute('href');
            if (nextHash && window.location.hash !== nextHash) {
                history.pushState(null, '', nextHash);
            }
        }
        if (shouldFocus) nextTab.focus();
    };

    const getTabFromHash = () => tabs.find(tab => tab.getAttribute('href') === window.location.hash);
    const activeFromHash = getTabFromHash();
    setActiveTab(activeFromHash || tabs[0]);
    if (activeFromHash) {
        requestAnimationFrame(() => tablist.closest('.service-page')?.scrollIntoView({ block: 'start' }));
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', event => {
            event.preventDefault();
            setActiveTab(tab, false, true);
        });

        tab.addEventListener('keydown', event => {
            const lastIndex = tabs.length - 1;
            let nextIndex = index;

            if (event.key === 'ArrowRight') {
                nextIndex = index === lastIndex ? 0 : index + 1;
            } else if (event.key === 'ArrowLeft') {
                nextIndex = index === 0 ? lastIndex : index - 1;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = lastIndex;
            } else {
                return;
            }

            event.preventDefault();
            setActiveTab(tabs[nextIndex], true, true);
        });
    });

    const syncFromHash = () => {
        const tabFromHash = getTabFromHash();
        setActiveTab(tabFromHash || tabs[0]);
    };

    window.addEventListener('popstate', syncFromHash);
    window.addEventListener('hashchange', syncFromHash);
}
