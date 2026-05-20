export function initRecommendSlider() {
    const slider = document.querySelector('.recommend__marquee');
    const track = slider?.querySelector('.recommend__track');

    if (!slider || !track) return;

    let hasUserInteracted = false;
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    const getInitialScrollLeft = () => {
        const viewportWidth = window.innerWidth;

        if (window.matchMedia('(max-width: 767.98px)').matches) {
            return 331 + ((834 - viewportWidth) / 2);
        }

        if (window.matchMedia('(max-width: 1199.98px)').matches) {
            return 439 - ((viewportWidth - 834) / 2);
        }

        return 132;
    };

    const setInitialPosition = () => {
        if (hasUserInteracted) return;
        slider.scrollLeft = Math.min(getInitialScrollLeft(), slider.scrollWidth - slider.clientWidth);
    };

    const scheduleInitialPosition = () => {
        setInitialPosition();
        requestAnimationFrame(setInitialPosition);
        requestAnimationFrame(() => requestAnimationFrame(setInitialPosition));
        window.setTimeout(setInitialPosition, 100);
        window.setTimeout(setInitialPosition, 300);
    };

    slider.addEventListener('pointerdown', (event) => {
        if (slider.scrollWidth <= slider.clientWidth) return;

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

        if (slider.hasPointerCapture(event.pointerId)) {
            slider.releasePointerCapture(event.pointerId);
        }
    };

    slider.addEventListener('pointerup', stopDragging);
    slider.addEventListener('pointercancel', stopDragging);

    track.querySelectorAll('img').forEach((image) => {
        if (!image.complete) image.addEventListener('load', scheduleInitialPosition, { once: true });
        if (!image.complete) image.addEventListener('error', scheduleInitialPosition, { once: true });
    });

    window.addEventListener('resize', scheduleInitialPosition);
    window.addEventListener('load', scheduleInitialPosition, { once: true });
    scheduleInitialPosition();
}
