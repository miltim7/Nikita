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
        menu.hidden = true;
        document.body.classList.remove('is-menu-open');
    };

    burger.addEventListener('click', () => {
        const open = burger.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', String(open));
        menu.hidden = !open;
        document.body.classList.toggle('is-menu-open', open);
    });

    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', close);
    });
}
