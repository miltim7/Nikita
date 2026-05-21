/**
 * Payment method tabs switcher
 * Switches between payment method panels based on clicked buttons
 */
export function initPaymentTabs() {
    const tablist = document.querySelector('.payment-tab__methods[role="tablist"]');
    if (!tablist) return;

    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = Array.from(document.querySelectorAll('[data-payment-panel]'));
    if (!tabs.length || !panels.length) return;

    const setActiveTab = (nextTab, shouldFocus = false) => {
        const target = nextTab.id.replace('-control', '-panel');
        const nextPanel = panels.find(panel => panel.id === target);
        if (!nextPanel) return;

        tabs.forEach(tab => {
            const isActive = tab === nextTab;
            tab.classList.toggle('payment-tab-card--active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        panels.forEach(panel => {
            panel.hidden = panel !== nextPanel;
        });

        if (shouldFocus) nextTab.focus();
    };

    const activeFromMarkup = tabs.find(tab => tab.classList.contains('payment-tab-card--active'));
    setActiveTab(activeFromMarkup || tabs[0]);

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => setActiveTab(tab));

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
            setActiveTab(tabs[nextIndex], true);
        });
    });
}
