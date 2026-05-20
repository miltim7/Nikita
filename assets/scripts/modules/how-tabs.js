/**
 * "How it works" tabs.
 * Switches the [data-active] attribute on .how section
 * based on the clicked .how-tab[data-tab="..."].
 */
export function initHowTabs() {
    const howSection = document.querySelector('.how');
    const tabs = Array.from(document.querySelectorAll('.how-tab'));
    if (!tabs.length) return;

    const setActiveTab = (tab, shouldFocus = false) => {
        const target = tab.dataset.tab;
        if (!target) return;

        tabs.forEach(item => {
            const active = item === tab;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-selected', String(active));
            item.setAttribute('tabindex', active ? '0' : '-1');
        });

        if (howSection) howSection.setAttribute('data-active', target);
        if (shouldFocus) tab.focus();
    };

    const activeFromMarkup = tabs.find(tab => tab.classList.contains('is-active'));
    const activeFromSection = tabs.find(tab => tab.dataset.tab === howSection?.dataset.active);
    setActiveTab(activeFromSection || activeFromMarkup || tabs[0]);

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => setActiveTab(tab));

        tab.addEventListener('keydown', (event) => {
            const lastIndex = tabs.length - 1;
            let nextIndex = index;

            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                nextIndex = index === lastIndex ? 0 : index + 1;
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
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
