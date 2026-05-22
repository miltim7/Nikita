import { closeModalLayer, openModalLayer } from './modal-transition.js';

/**
 * Mobile menu toggle (header burger + fullscreen menu overlay).
 * Toggles aria-expanded, hidden attribute, and body lock class.
 */
export function initMobileMenu() {
    const burger = document.querySelector('.header__burger');
    const menu = document.getElementById('mobileMenu');
    if (!burger || !menu) return;

    const close = () => {
        if (menu.hidden && !menu.classList.contains('is-open')) {
            document.body.classList.remove('is-menu-open');
            return;
        }

        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Меню');
        closeModalLayer(menu, {
            afterClose: () => {
                document.body.classList.remove('is-menu-open');
            },
        });
    };

    burger.addEventListener('click', event => {
        event.stopPropagation();
        const open = !menu.classList.contains('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Меню');
        if (open) {
            document.body.classList.add('is-menu-open');
            openModalLayer(menu);
            return;
        }

        close();
    });

    document.addEventListener('click', event => {
        if (!menu.classList.contains('is-open')) return;
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
