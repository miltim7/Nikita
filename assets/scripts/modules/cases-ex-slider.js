export function initCasesExSlider() {
    const slider = document.querySelector('.cases-ex__list');
    const initialCard = slider?.querySelector('[data-cases-initial]');
    const scrollbar = document.querySelector('.cases-ex__scrollbar');
    const thumb = scrollbar?.querySelector('.cases-ex__scrollbar-thumb');

    if (!slider || !initialCard) return;

    let hasUserInteracted = false;
    let isDragging = false;
    let isScrollbarDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let wheelTarget = 0;
    let wheelFrame = 0;
    let thumbStartX = 0;
    let thumbStartScrollLeft = 0;

    const getCenteredScrollLeft = (card) => (
        card.offsetLeft - ((slider.clientWidth - card.offsetWidth) / 2)
    );

    const setInitialPosition = (behavior = 'auto') => {
        if (hasUserInteracted) return;

        const scrollBehavior = ['auto', 'smooth', 'instant'].includes(behavior) ? behavior : 'auto';
        const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
        const nextLeft = Math.max(0, Math.min(getCenteredScrollLeft(initialCard), maxScrollLeft));
        slider.scrollTo({ left: nextLeft, behavior: scrollBehavior });
        wheelTarget = nextLeft;
        updateScrollbar();
    };

    const updateScrollbar = () => {
        if (!scrollbar || !thumb) return;

        const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
        const trackWidth = scrollbar.clientWidth;
        const thumbWidth = maxScrollLeft > 0
            ? Math.max(34, trackWidth * (slider.clientWidth / slider.scrollWidth))
            : trackWidth;
        const progress = maxScrollLeft > 0 ? slider.scrollLeft / maxScrollLeft : 0;
        const thumbX = (trackWidth - thumbWidth) * progress;

        thumb.style.width = `${thumbWidth}px`;
        thumb.style.transform = `translateX(${thumbX}px)`;
        scrollbar.hidden = maxScrollLeft <= 0;
    };

    const scheduleInitialPosition = () => {
        setInitialPosition();
        requestAnimationFrame(() => setInitialPosition());
        requestAnimationFrame(() => requestAnimationFrame(() => setInitialPosition()));
        window.setTimeout(setInitialPosition, 100);
    };

    slider.addEventListener('pointerdown', (event) => {
        if (slider.scrollWidth <= slider.clientWidth) return;

        window.cancelAnimationFrame(wheelFrame);
        hasUserInteracted = true;
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
        wheelTarget = slider.scrollLeft;

        if (slider.hasPointerCapture(event.pointerId)) {
            slider.releasePointerCapture(event.pointerId);
        }
    };

    slider.addEventListener('pointerup', stopDragging);
    slider.addEventListener('pointercancel', stopDragging);
    slider.addEventListener('lostpointercapture', stopDragging);

    const animateWheelScroll = () => {
        const distance = wheelTarget - slider.scrollLeft;

        if (Math.abs(distance) < 0.5) {
            slider.scrollLeft = wheelTarget;
            wheelFrame = 0;
            return;
        }

        slider.scrollLeft += distance * 0.22;
        wheelFrame = window.requestAnimationFrame(animateWheelScroll);
    };

    slider.addEventListener('wheel', (event) => {
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (Math.abs(delta) < 1) return;
        if (slider.scrollWidth <= slider.clientWidth) return;

        const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
        hasUserInteracted = true;
        wheelTarget = Math.max(0, Math.min((wheelFrame ? wheelTarget : slider.scrollLeft) + delta, maxScrollLeft));

        if (!wheelFrame) {
            wheelFrame = window.requestAnimationFrame(animateWheelScroll);
        }

        event.preventDefault();
    }, { passive: false });

    slider.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

        hasUserInteracted = true;
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const cardStep = initialCard.offsetWidth + parseFloat(getComputedStyle(slider).gap || 0);
        slider.scrollBy({ left: direction * cardStep, behavior: 'smooth' });
        wheelTarget = slider.scrollLeft + (direction * cardStep);
        event.preventDefault();
    });

    if (scrollbar && thumb) {
        scrollbar.addEventListener('pointerdown', (event) => {
            if (slider.scrollWidth <= slider.clientWidth) return;

            event.preventDefault();
            hasUserInteracted = true;
            isScrollbarDragging = true;
            thumbStartX = event.clientX;
            thumbStartScrollLeft = slider.scrollLeft;
            scrollbar.setPointerCapture(event.pointerId);

            if (event.target !== thumb) {
                const rect = scrollbar.getBoundingClientRect();
                const thumbWidth = thumb.offsetWidth;
                const progress = (event.clientX - rect.left - (thumbWidth / 2)) / (rect.width - thumbWidth);
                slider.scrollTo({
                    left: Math.max(0, Math.min(progress, 1)) * (slider.scrollWidth - slider.clientWidth),
                    behavior: 'smooth',
                });
            }
        });

        scrollbar.addEventListener('pointermove', (event) => {
            if (!isScrollbarDragging) return;

            event.preventDefault();
            const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
            const maxThumbLeft = scrollbar.clientWidth - thumb.offsetWidth;
            const scrollRatio = maxThumbLeft > 0 ? maxScrollLeft / maxThumbLeft : 0;
            slider.scrollLeft = thumbStartScrollLeft + ((event.clientX - thumbStartX) * scrollRatio);
        });

        const stopScrollbarDragging = (event) => {
            if (!isScrollbarDragging) return;

            isScrollbarDragging = false;
            wheelTarget = slider.scrollLeft;

            if (scrollbar.hasPointerCapture(event.pointerId)) {
                scrollbar.releasePointerCapture(event.pointerId);
            }
        };

        scrollbar.addEventListener('pointerup', stopScrollbarDragging);
        scrollbar.addEventListener('pointercancel', stopScrollbarDragging);
    }

    slider.addEventListener('scroll', updateScrollbar, { passive: true });
    window.addEventListener('resize', scheduleInitialPosition);
    window.addEventListener('load', scheduleInitialPosition, { once: true });
    scheduleInitialPosition();
    updateScrollbar();
}
