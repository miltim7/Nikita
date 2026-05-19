/**
 * Cases carousel: horizontal scroll-snap track + prev/next arrows + dots.
 * Gap between cards is 24px (must match .cases__track gap in CSS).
 */
const GAP = 24;

export function initCasesCarousel() {
    const track = document.querySelector('.cases__track');
    const prev = document.querySelector('.cases__arrow--prev');
    const next = document.querySelector('.cases__arrow--next');
    const dotsHost = document.querySelector('.cases__dots');
    if (!track || !prev || !next) return;

    const scrollStep = () => {
        const card = track.querySelector('.case-card');
        return card ? card.getBoundingClientRect().width + GAP : 320;
    };

    prev.addEventListener('click', () => track.scrollBy({ left: -scrollStep(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left:  scrollStep(), behavior: 'smooth' }));

    if (!dotsHost) return;

    const slides = track.querySelectorAll('.case-card');
    slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Слайд ${i + 1}`);
        if (i === 0) b.classList.add('is-active');
        b.addEventListener('click', () => {
            track.scrollTo({ left: i * scrollStep(), behavior: 'smooth' });
        });
        dotsHost.appendChild(b);
    });

    track.addEventListener('scroll', () => {
        const idx = Math.round(track.scrollLeft / scrollStep());
        dotsHost.querySelectorAll('button').forEach((b, i) =>
            b.classList.toggle('is-active', i === idx));
    }, { passive: true });
}
