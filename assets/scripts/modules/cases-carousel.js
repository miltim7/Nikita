export function initCasesCarousel() {
    const section = document.querySelector('.cases');
    const slider = section?.querySelector('.cases__carousel');
    const track = slider?.querySelector('.cases__track');
    const prev = section?.querySelector('.cases__arrow--prev');
    const next = section?.querySelector('.cases__arrow--next');
    const dotsHost = section?.querySelector('.cases__dots');

    if (!slider || !track || !dotsHost) return;

    let activeIndex = 0;
    let hasUserInteracted = false;
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let lastX = 0;
    let lastTime = 0;
    let lastScrollLeft = 0;
    let scrollVelocity = 0;
    let scrollFrame = 0;
    let momentumFrame = 0;

    const getCards = () => Array.from(track.querySelectorAll('.case-card'))
        .filter(card => card.offsetParent !== null)
        .sort((a, b) => a.offsetLeft - b.offsetLeft);

    const getMaxScrollLeft = () => Math.max(0, slider.scrollWidth - slider.clientWidth);

    const getScrollLeftForCard = (card) => {
        if (!card) return 0;
        return card.offsetLeft - ((slider.clientWidth - card.offsetWidth) / 2);
    };

    const setActiveIndex = (index) => {
        const cards = getCards();
        activeIndex = Math.max(0, Math.min(index, Math.max(0, cards.length - 1)));
        const dots = Array.from(dotsHost.querySelectorAll('button'));

        dots.forEach((dot, dotIndex) => {
            const active = dotIndex === activeIndex;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-selected', String(active));
            dot.setAttribute('tabindex', active ? '0' : '-1');
        });

        const activeDot = dots[activeIndex];
        if (activeDot) {
            dotsHost.style.setProperty('--cases-dot-active-left', `${activeDot.offsetLeft}px`);
        }

        const atStart = activeIndex === 0;
        const atEnd = activeIndex === Math.max(0, cards.length - 1);
        prev?.classList.toggle('is-disabled', atStart);
        next?.classList.toggle('is-disabled', atEnd);
    };

    const updateActiveIndexByScroll = () => {
        const cards = getCards();
        if (!cards.length) {
            setActiveIndex(0);
            return;
        }

        const maxScrollLeft = getMaxScrollLeft();
        if (!maxScrollLeft) {
            setActiveIndex(0);
            return;
        }

        setActiveIndex(Math.round((slider.scrollLeft / maxScrollLeft) * (cards.length - 1)));
    };

    const scheduleActiveUpdate = () => {
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(() => {
            scrollFrame = 0;
            updateActiveIndexByScroll();
        });
    };

    const scrollToLeft = (left, behavior = 'smooth') => {
        if (momentumFrame) {
            cancelAnimationFrame(momentumFrame);
            momentumFrame = 0;
        }

        const nextLeft = Math.max(0, Math.min(left, getMaxScrollLeft()));
        if (behavior === 'auto') {
            slider.scrollLeft = nextLeft;
            updateActiveIndexByScroll();
            return;
        }

        slider.scrollTo({ left: nextLeft, behavior });
    };

    const scrollToCard = (index, behavior = 'smooth') => {
        const cards = getCards();
        const card = cards[Math.max(0, Math.min(index, cards.length - 1))];
        if (!card) return;
        scrollToLeft(getScrollLeftForCard(card), behavior);
    };

    const scrollToProgress = (index, behavior = 'smooth') => {
        const cards = getCards();
        const nextIndex = Math.max(0, Math.min(index, Math.max(0, cards.length - 1)));
        const denominator = Math.max(1, cards.length - 1);
        scrollToLeft(getMaxScrollLeft() * (nextIndex / denominator), behavior);
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
        const setInitial = () => {
            if (hasUserInteracted) return;
            scrollToLeft(getInitialScrollLeft(), 'auto');
        };

        setInitial();
        requestAnimationFrame(setInitial);
        requestAnimationFrame(() => requestAnimationFrame(setInitial));
        window.setTimeout(setInitial, 120);
        window.setTimeout(setInitial, 360);
    };

    const scrollByStep = (direction) => {
        hasUserInteracted = true;
        scrollToProgress(activeIndex + direction);
    };

    const stopMomentum = () => {
        if (!momentumFrame) return;
        cancelAnimationFrame(momentumFrame);
        momentumFrame = 0;
    };

    const runMomentum = () => {
        stopMomentum();

        const friction = 0.92;
        const minVelocity = 0.02;

        const step = () => {
            const maxScrollLeft = getMaxScrollLeft();
            const nextLeft = Math.max(0, Math.min(slider.scrollLeft + (scrollVelocity * 16), maxScrollLeft));
            const hitEdge = nextLeft === 0 || nextLeft === maxScrollLeft;

            slider.scrollLeft = nextLeft;
            scrollVelocity *= hitEdge ? 0 : friction;
            updateActiveIndexByScroll();

            if (Math.abs(scrollVelocity) > minVelocity && !hitEdge) {
                momentumFrame = requestAnimationFrame(step);
            } else {
                momentumFrame = 0;
            }
        };

        if (Math.abs(scrollVelocity) > minVelocity) {
            momentumFrame = requestAnimationFrame(step);
        }
    };

    dotsHost.innerHTML = '';
    getCards().forEach((card, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Слайд ${index + 1}`);
        dot.addEventListener('click', () => {
            hasUserInteracted = true;
            scrollToProgress(index);
        });
        dotsHost.append(dot);
    });
    setActiveIndex(activeIndex);

    prev?.addEventListener('click', () => scrollByStep(-1));
    next?.addEventListener('click', () => scrollByStep(1));

    slider.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'touch') return;
        if (slider.scrollWidth <= slider.clientWidth) return;

        stopMomentum();
        hasUserInteracted = true;
        isDragging = true;
        startX = event.clientX;
        startScrollLeft = slider.scrollLeft;
        lastX = event.clientX;
        lastTime = performance.now();
        lastScrollLeft = slider.scrollLeft;
        scrollVelocity = 0;
        slider.classList.add('is-dragging');
        slider.setPointerCapture(event.pointerId);
    });

    slider.addEventListener('pointermove', (event) => {
        if (!isDragging) return;
        event.preventDefault();
        slider.scrollLeft = startScrollLeft - (event.clientX - startX);

        const now = performance.now();
        const deltaTime = Math.max(1, now - lastTime);
        scrollVelocity = (slider.scrollLeft - lastScrollLeft) / deltaTime;
        lastX = event.clientX;
        lastTime = now;
        lastScrollLeft = slider.scrollLeft;
    });

    const stopDragging = (event) => {
        if (!isDragging) return;

        isDragging = false;
        slider.classList.remove('is-dragging');
        updateActiveIndexByScroll();
        runMomentum();

        if (slider.hasPointerCapture(event.pointerId)) {
            slider.releasePointerCapture(event.pointerId);
        }
    };

    slider.addEventListener('pointerup', stopDragging);
    slider.addEventListener('pointercancel', stopDragging);
    slider.addEventListener('scroll', scheduleActiveUpdate, { passive: true });
    slider.addEventListener('wheel', stopMomentum, { passive: true });

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

    window.addEventListener('resize', () => {
        if (hasUserInteracted) scrollToProgress(activeIndex, 'auto');
        else scheduleInitialPosition();
    });
    window.addEventListener('load', scheduleInitialPosition, { once: true });
    scheduleInitialPosition();
}
