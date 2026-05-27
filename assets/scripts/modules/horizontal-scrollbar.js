const MIN_THUMB_WIDTH = 40;
const boundDragThumbs = new WeakSet();

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function getScrollbarMetrics({ scrollElement, thumbElement, trackElement = null, scrollbarElement = null }) {
    const trackRoot = trackElement || scrollbarElement || thumbElement?.parentElement;
    const trackRect = trackRoot?.getBoundingClientRect();
    const thumbRect = thumbElement?.getBoundingClientRect();
    const trackWidth = trackRect?.width || 0;
    const thumbWidth = thumbRect?.width || 0;
    const maxScroll = scrollElement.scrollWidth - scrollElement.clientWidth;
    const maxThumbLeft = trackWidth - thumbWidth;

    return {
        trackRoot,
        trackRect,
        thumbRect,
        trackWidth,
        thumbWidth,
        maxScroll,
        maxThumbLeft,
        canScroll: maxScroll > 0 && maxThumbLeft > 0,
    };
}

export function syncHorizontalScrollbar({
    scrollElement,
    thumbElement,
    knobElement = null,
    trackElement = null,
    scrollbarElement = null,
    hideWhenNoOverflow = false,
    useTransform = false,
} = {}) {
    if (!scrollElement || !thumbElement) return false;

    const trackWidth = trackElement?.clientWidth
        || scrollbarElement?.clientWidth
        || thumbElement.parentElement?.clientWidth
        || scrollElement.clientWidth;
    const scrollbarRoot = scrollbarElement || thumbElement.parentElement;
    const maxScroll = scrollElement.scrollWidth - scrollElement.clientWidth;
    const hasScrollableDistance = maxScroll > 0 && trackWidth > 0 && scrollElement.scrollWidth > 0;

    scrollbarRoot?.classList.toggle('is-scrollable', hasScrollableDistance);

    if (hideWhenNoOverflow && scrollbarElement) {
        scrollbarElement.hidden = !hasScrollableDistance;
    }

    if (!hasScrollableDistance) {
        thumbElement.style.width = '100%';
        if (!useTransform) {
            thumbElement.style.left = '0';
        }
        thumbElement.style.transform = useTransform ? 'translateY(-50%)' : '';

        if (knobElement) {
            knobElement.style.left = '50%';
        }

        return false;
    }

    const thumbWidth = Math.min(
        trackWidth,
        Math.max(MIN_THUMB_WIDTH, (scrollElement.clientWidth / scrollElement.scrollWidth) * trackWidth)
    );
    const progress = scrollElement.scrollLeft / maxScroll;
    const thumbLeft = progress * (trackWidth - thumbWidth);

    if (useTransform) {
        thumbElement.style.width = `${thumbWidth}px`;
        thumbElement.style.transform = `translate(${thumbLeft}px, -50%)`;
    } else {
        thumbElement.style.width = `${(thumbWidth / trackWidth) * 100}%`;
        thumbElement.style.left = `${(thumbLeft / trackWidth) * 100}%`;
        thumbElement.style.transform = '';
    }

    if (knobElement) {
        const knobWidth = knobElement.offsetWidth || 0;
        const knobLeft = Math.min(
            trackWidth - knobWidth,
            Math.max(0, thumbLeft + (thumbWidth / 2) - (knobWidth / 2))
        );
        knobElement.style.left = `${(knobLeft / trackWidth) * 100}%`;
    }

    return true;
}

export function bindHorizontalScrollbarDrag({
    scrollElement,
    thumbElement,
    knobElement = null,
    trackElement = null,
    scrollbarElement = null,
    hideWhenNoOverflow = false,
    useTransform = false,
} = {}) {
    if (!scrollElement || !thumbElement || boundDragThumbs.has(thumbElement)) return;

    const scrollbarRoot = scrollbarElement || thumbElement.parentElement;
    if (!scrollbarRoot) return;

    let dragState = null;

    const sync = () => syncHorizontalScrollbar({
        scrollElement,
        thumbElement,
        knobElement,
        trackElement,
        scrollbarElement,
        hideWhenNoOverflow,
        useTransform,
    });

    const setScrollFromThumbLeft = (thumbLeft, metrics) => {
        const progress = metrics.maxThumbLeft > 0
            ? clamp(thumbLeft, 0, metrics.maxThumbLeft) / metrics.maxThumbLeft
            : 0;

        scrollElement.scrollLeft = progress * metrics.maxScroll;
        sync();
    };

    const onPointerMove = (event) => {
        if (!dragState) return;
        event.preventDefault();

        const metrics = getScrollbarMetrics({
            scrollElement,
            thumbElement,
            trackElement,
            scrollbarElement,
        });

        if (!metrics.canScroll) return;

        const nextThumbLeft = event.clientX - metrics.trackRect.left - dragState.pointerOffset;
        setScrollFromThumbLeft(nextThumbLeft, metrics);
    };

    const endDrag = () => {
        if (!dragState) return;

        try {
            scrollbarRoot.releasePointerCapture?.(dragState.pointerId);
        } catch (error) {
            // Pointer capture can already be released by the browser.
        }

        dragState = null;
        scrollbarRoot.classList.remove('is-dragging');
        document.body?.classList.remove('is-horizontal-scrollbar-dragging');
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', endDrag);
        document.removeEventListener('pointercancel', endDrag);
    };

    const onPointerDown = (event) => {
        if (event.button !== undefined && event.button !== 0) return;

        sync();

        const metrics = getScrollbarMetrics({
            scrollElement,
            thumbElement,
            trackElement,
            scrollbarElement,
        });

        if (!metrics.canScroll) return;

        event.preventDefault();

        const isThumbTarget = thumbElement.contains(event.target) || Boolean(knobElement?.contains(event.target));
        const pointerOffset = isThumbTarget
            ? event.clientX - metrics.thumbRect.left
            : metrics.thumbWidth / 2;

        if (!isThumbTarget) {
            const targetThumbLeft = event.clientX - metrics.trackRect.left - pointerOffset;
            setScrollFromThumbLeft(targetThumbLeft, metrics);
        }

        dragState = {
            pointerId: event.pointerId,
            pointerOffset,
        };

        scrollbarRoot.classList.add('is-dragging');
        document.body?.classList.add('is-horizontal-scrollbar-dragging');
        scrollbarRoot.setPointerCapture?.(event.pointerId);
        document.addEventListener('pointermove', onPointerMove, { passive: false });
        document.addEventListener('pointerup', endDrag);
        document.addEventListener('pointercancel', endDrag);
    };

    boundDragThumbs.add(thumbElement);
    scrollbarRoot.addEventListener('pointerdown', onPointerDown);
}
