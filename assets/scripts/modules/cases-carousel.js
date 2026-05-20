export function initCasesCarousel() {
    const section = document.querySelector('.cases');
    const slider = section?.querySelector('.cases__carousel');
    const track = slider?.querySelector('.cases__track');
    const prev = section?.querySelector('.cases__arrow--prev');
    const next = section?.querySelector('.cases__arrow--next');
    const dotsHost = section?.querySelector('.cases__dots');

    if (!slider || !track || !dotsHost) return;

    const dotsCount = 4;
    let activeDot = 2;
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let scrollFrame = 0;

    const getCards = () => Array.from(track.querySelectorAll('.case-card'))
        .filter(card => card.offsetParent !== null)
        .sort((a, b) => a.offsetLeft - b.offsetLeft);

    const getMaxScrollLeft = () => Math.max(0, slider.scrollWidth - slider.clientWidth);

    const getScrollLeftForCard = (card) => {
        if (!card) return 0;
        return card.offsetLeft - ((slider.clientWidth - card.offsetWidth) / 2);
    };

    const setActiveDot = (index) => {
        activeDot = Math.max(0, Math.min(index, dotsCount - 1));
        dotsHost.querySelectorAll('button').forEach((dot, dotIndex) => {
            const active = dotIndex === activeDot;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-selected', String(active));
            dot.setAttribute('tabindex', active ? '0' : '-1');
        });
    };

    const updateActiveDotByScroll = () => {
        const maxScrollLeft = getMaxScrollLeft();
        if (!maxScrollLeft) {
            setActiveDot(0);
            return;
        }

        setActiveDot(Math.ceil((slider.scrollLeft / maxScrollLeft) * (dotsCount - 1)));
    };

    const scheduleDotUpdate = () => {
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(() => {
            scrollFrame = 0;
            updateActiveDotByScroll();
        });
    };

    const scrollToLeft = (left, behavior = 'smooth') => {
        const nextLeft = Math.max(0, Math.min(left, getMaxScrollLeft()));
        if (behavior === 'auto') {
            slider.scrollLeft = nextLeft;
            updateActiveDotByScroll();
            return;
        }

        slider.scrollTo({ left: nextLeft, behavior });
    };

    const getInitialScrollLeft = () => {
        const maxScrollLeft = getMaxScrollLeft();
        if (!maxScrollLeft) return 0;

        if (window.matchMedia('(max-width: 767.98px)').matches) {
            const mobileActiveCard = track.querySelector('[data-mobile-active]');
            return getScrollLeftForCard(mobileActiveCard);
        }

        return maxScrollLeft / 2;
    };

    const scheduleInitialPosition = () => {
        const setInitial = () => scrollToLeft(getInitialScrollLeft(), 'auto');
        setInitial();
        requestAnimationFrame(setInitial);
        requestAnimationFrame(() => requestAnimationFrame(setInitial));
        window.setTimeout(setInitial, 100);
        window.setTimeout(setInitial, 300);
        window.setTimeout(setInitial, 600);
        window.setTimeout(setInitial, 1000);
        window.setTimeout(setInitial, 1600);

        let attempts = 0;
        const intervalId = window.setInterval(() => {
            attempts += 1;
            setInitial();
            if (attempts >= 8) window.clearInterval(intervalId);
        }, 250);
    };

    const getStep = () => {
        const cards = getCards();
        if (cards.length < 2) return cards[0]?.offsetWidth || 0;
        return Math.abs(cards[1].offsetLeft - cards[0].offsetLeft);
    };

    const scrollByStep = (direction) => {
        scrollToLeft(slider.scrollLeft + (getStep() * direction));
    };

    dotsHost.innerHTML = '';
    for (let index = 0; index < dotsCount; index += 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Слайд ${index + 1}`);
        dot.addEventListener('click', () => {
            const maxScrollLeft = getMaxScrollLeft();
            scrollToLeft(maxScrollLeft * (index / (dotsCount - 1)));
        });
        dotsHost.append(dot);
    }
    setActiveDot(activeDot);

    prev?.addEventListener('click', () => scrollByStep(-1));
    next?.addEventListener('click', () => scrollByStep(1));

    slider.addEventListener('pointerdown', (event) => {
        if (slider.scrollWidth <= slider.clientWidth) return;

        isDragging = true;
        startX = event.clientX;
        startScrollLeft = slider.scrollLeft;
        slider.classList.add('is-dragging');
        slider.setPointerCapture(event.pointerId);
    });

    slider.addEventListener('pointermove', (event) => {
        if (!isDragging) return;
        event.preventDefault();
        slider.scrollLeft = startScrollLeft - (event.clientX - startX);
    });

    const stopDragging = (event) => {
        if (!isDragging) return;

        isDragging = false;
        slider.classList.remove('is-dragging');
        updateActiveDotByScroll();

        if (slider.hasPointerCapture(event.pointerId)) {
            slider.releasePointerCapture(event.pointerId);
        }
    };

    slider.addEventListener('pointerup', stopDragging);
    slider.addEventListener('pointercancel', stopDragging);
    slider.addEventListener('scroll', scheduleDotUpdate, { passive: true });

    slider.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            scrollByStep(-1);
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            scrollByStep(1);
        }
    });

    track.querySelectorAll('img').forEach((image) => {
        if (!image.complete) image.addEventListener('load', scheduleInitialPosition, { once: true });
        if (!image.complete) image.addEventListener('error', scheduleInitialPosition, { once: true });
    });

    window.addEventListener('resize', scheduleInitialPosition);
    window.addEventListener('load', scheduleInitialPosition, { once: true });
    scheduleInitialPosition();
}
