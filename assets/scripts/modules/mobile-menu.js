/**
 * Mobile menu toggle (header burger + fullscreen menu overlay).
 * Toggles aria-expanded, hidden attribute, and body lock class.
 */
export function initMobileMenu() {
    const burger = document.querySelector('.header__burger');
    const menu = document.getElementById('mobileMenu');
    if (!burger || !menu) return;

    const close = () => {
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Меню');
        menu.hidden = true;
        document.body.classList.remove('is-menu-open');
    };

    burger.addEventListener('click', event => {
        event.stopPropagation();
        const open = burger.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Меню');
        menu.hidden = !open;
        document.body.classList.toggle('is-menu-open', open);
    });

    document.addEventListener('click', event => {
        if (menu.hidden) return;
        if (menu.contains(event.target) || burger.contains(event.target)) return;
        close();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') close();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1280) close();
    });

    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', close);
    });
}
