export function initSecurityTabs() {
    const tablist = document.querySelector('[data-security-tabs]');
    if (!tablist) return;

    const tabs = Array.from(tablist.querySelectorAll('.security-tabs__item[href^="#"]'));
    if (!tabs.length) return;

    const setActiveTab = nextTab => {
        tabs.forEach(tab => {
            const isActive = tab === nextTab;
            tab.classList.toggle('security-tabs__item--active', isActive);
            if (isActive) {
                tab.setAttribute('aria-current', 'true');
            } else {
                tab.removeAttribute('aria-current');
            }
        });

        const targetScroll = nextTab.offsetLeft - (tablist.clientWidth - nextTab.offsetWidth) / 2;
        tablist.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    };

    const getTabFromHash = () => tabs.find(tab => tab.getAttribute('href') === window.location.hash);
    setActiveTab(getTabFromHash() || tabs[0]);

    tabs.forEach(tab => {
        tab.addEventListener('click', event => {
            event.preventDefault();
            setActiveTab(tab);

            const hash = tab.getAttribute('href');
            const target = hash ? document.querySelector(hash) : null;
            if (hash && window.location.hash !== hash) {
                history.pushState(null, '', hash);
            }
            target?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        });
    });

    const syncFromHash = () => {
        const tabFromHash = getTabFromHash();
        if (tabFromHash) setActiveTab(tabFromHash);
    };

    window.addEventListener('popstate', syncFromHash);
    window.addEventListener('hashchange', syncFromHash);
}
