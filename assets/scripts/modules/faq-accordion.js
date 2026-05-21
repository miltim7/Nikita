/**
 * Smooth FAQ details animation.
 * Keeps native <details> semantics while animating the answer area height.
 */
export function initFaqAccordion() {
    const items = Array.from(document.querySelectorAll('.faq-item'));
    if (!items.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    items.forEach(item => {
        const summary = item.querySelector('.faq-item__summary');
        const body = item.querySelector('.faq-item__body');
        if (!summary || !body) return;

        if (!item.open) {
            body.hidden = true;
            body.style.height = '0px';
            body.style.opacity = '0';
        }

        summary.addEventListener('click', event => {
            event.preventDefault();
            if (item.classList.contains('is-animating')) return;

            if (item.open) {
                closeItem(item, body);
            } else {
                openItem(item, body);
            }
        });
    });
}

function openItem(item, body) {
    item.open = true;
    body.hidden = false;
    item.classList.add('is-animating');

    body.style.overflow = 'hidden';
    body.style.height = '0px';
    body.style.opacity = '0';
    body.offsetHeight;

    body.style.height = `${body.scrollHeight}px`;
    body.style.opacity = '1';

    finishAnimation(body, () => {
        body.style.height = '';
        body.style.overflow = '';
        body.style.opacity = '';
        item.classList.remove('is-animating');
    });
}

function closeItem(item, body) {
    item.classList.add('is-animating');

    body.style.overflow = 'hidden';
    body.style.height = `${body.scrollHeight}px`;
    body.style.opacity = '1';
    body.offsetHeight;

    body.style.height = '0px';
    body.style.opacity = '0';

    finishAnimation(body, () => {
        item.open = false;
        body.hidden = true;
        body.style.height = '';
        body.style.overflow = '';
        body.style.opacity = '';
        item.classList.remove('is-animating');
    });
}

function finishAnimation(body, callback) {
    const onEnd = event => {
        if (event.target !== body || event.propertyName !== 'height') return;
        body.removeEventListener('transitionend', onEnd);
        callback();
    };

    body.addEventListener('transitionend', onEnd);
}
