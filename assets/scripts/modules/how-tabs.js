/**
 * "How it works" tabs.
 * Switches the [data-active] attribute on .how section
 * based on the clicked .how-tab[data-tab="..."].
 */
export function initHowTabs() {
    const howSection = document.querySelector('.how');
    const tabs = document.querySelectorAll('.how-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => {
                const active = t === tab;
                t.classList.toggle('is-active', active);
                t.setAttribute('aria-selected', String(active));
            });
            if (howSection) howSection.setAttribute('data-active', target);
        });
    });
}
