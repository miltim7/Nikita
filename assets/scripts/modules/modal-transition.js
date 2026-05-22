const activeTimers = new WeakMap();

function parseTime(value) {
    const trimmed = value.trim();
    if (!trimmed) return 0;

    if (trimmed.endsWith('ms')) {
        return Number.parseFloat(trimmed);
    }

    if (trimmed.endsWith('s')) {
        return Number.parseFloat(trimmed) * 1000;
    }

    return 0;
}

function getTransitionDuration(element) {
    const styles = window.getComputedStyle(element);
    const durations = styles.transitionDuration.split(',').map(parseTime);
    const delays = styles.transitionDelay.split(',').map(parseTime);
    const count = Math.max(durations.length, delays.length);
    let max = 0;

    for (let index = 0; index < count; index += 1) {
        const duration = durations[index] ?? durations[durations.length - 1] ?? 0;
        const delay = delays[index] ?? delays[delays.length - 1] ?? 0;
        max = Math.max(max, duration + delay);
    }

    return max;
}

function clearLayerTimer(element) {
    const timer = activeTimers.get(element);
    if (!timer) return;

    window.clearTimeout(timer);
    activeTimers.delete(element);
}

export function openModalLayer(element, openClass = 'is-open') {
    clearLayerTimer(element);
    element.hidden = false;
    element.offsetWidth;
    element.classList.add(openClass);
}

export function closeModalLayer(element, {
    openClass = 'is-open',
    afterClose = null,
} = {}) {
    clearLayerTimer(element);
    element.classList.remove(openClass);

    const delay = getTransitionDuration(element);
    const finish = () => {
        activeTimers.delete(element);

        if (!element.classList.contains(openClass)) {
            element.hidden = true;
            afterClose?.();
        }
    };

    if (delay <= 0) {
        window.requestAnimationFrame(finish);
        return;
    }

    activeTimers.set(element, window.setTimeout(finish, delay + 40));
}
