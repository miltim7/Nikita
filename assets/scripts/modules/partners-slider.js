export function initPartnersSlider() {
    const slider = document.querySelector('.why__partners');
    const track = slider?.querySelector('.why__partners-track');

    if (!slider || !track) return;

    const centerSlider = () => {
        if (!window.matchMedia('(max-width: 767.98px)').matches) {
            slider.scrollLeft = 0;
            return;
        }

        const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
        slider.scrollLeft = maxScrollLeft > 0 ? maxScrollLeft / 2 : 0;
    };

    const scheduleCentering = () => {
        centerSlider();
        requestAnimationFrame(centerSlider);
        requestAnimationFrame(() => requestAnimationFrame(centerSlider));
        window.setTimeout(centerSlider, 100);
        window.setTimeout(centerSlider, 300);
    };

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;

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
        if (slider.hasPointerCapture(event.pointerId)) {
            slider.releasePointerCapture(event.pointerId);
        }
    };

    slider.addEventListener('pointerup', stopDragging);
    slider.addEventListener('pointercancel', stopDragging);
    track.querySelectorAll('img').forEach((image) => {
        if (!image.complete) image.addEventListener('load', scheduleCentering, { once: true });
        if (!image.complete) image.addEventListener('error', scheduleCentering, { once: true });
    });

    window.addEventListener('resize', scheduleCentering);
    window.addEventListener('load', scheduleCentering, { once: true });
    scheduleCentering();
}
