import { bindHorizontalScrollbarDrag, syncHorizontalScrollbar } from './horizontal-scrollbar.js';

const boundScrollElements = new WeakSet();

function bindScrollbar({
    scrollElement,
    scrollbarElement,
    thumbElement,
    knobElement = null,
    hideWhenNoOverflow = false,
    useTransform = false,
}) {
    if (!scrollElement || !thumbElement || boundScrollElements.has(scrollElement)) return;

    const sync = () => syncHorizontalScrollbar({
        scrollElement,
        thumbElement,
        knobElement,
        scrollbarElement,
        hideWhenNoOverflow,
        useTransform,
    });

    boundScrollElements.add(scrollElement);
    scrollElement.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    bindHorizontalScrollbarDrag({
        scrollElement,
        thumbElement,
        knobElement,
        scrollbarElement,
        hideWhenNoOverflow,
        useTransform,
    });
    window.requestAnimationFrame(sync);
}

function bindBlockScrollbar({ scrollSelector, scrollbarSelector, thumbSelector, knobSelector = null, scopeSelector = null }) {
    document.querySelectorAll(scrollSelector).forEach((scrollElement) => {
        const scope = scopeSelector ? scrollElement.closest(scopeSelector) : scrollElement.parentElement;
        const scrollbarElement = scope?.querySelector(scrollbarSelector);

        bindScrollbar({
            scrollElement,
            scrollbarElement,
            thumbElement: scrollbarElement?.querySelector(thumbSelector),
            knobElement: knobSelector ? scrollbarElement?.querySelector(knobSelector) : null,
        });
    });
}

export function initCabinetTableScrollbars() {
    bindBlockScrollbar({
        scrollSelector: '.cabinet-recipient-lists__table-scroll',
        scrollbarSelector: '.cabinet-recipient-lists__scrollbar',
        thumbSelector: '.cabinet-recipient-lists__scrollbar-thumb',
        knobSelector: '.cabinet-recipient-lists__scrollbar-knob',
        scopeSelector: '.cabinet-recipient-lists__grid',
    });

    bindBlockScrollbar({
        scrollSelector: '.cabinet-mailings__table-scroll',
        scrollbarSelector: '.cabinet-mailings__scrollbar',
        thumbSelector: '.cabinet-mailings__scrollbar-thumb',
        knobSelector: '.cabinet-mailings__scrollbar-knob',
        scopeSelector: '.cabinet-mailings__grid',
    });

    bindBlockScrollbar({
        scrollSelector: '.cabinet-reports__table-scroll',
        scrollbarSelector: '.cabinet-reports__scrollbar',
        thumbSelector: '.cabinet-reports__scrollbar-thumb',
        knobSelector: '.cabinet-reports__scrollbar-knob',
        scopeSelector: '.cabinet-reports__grid',
    });

    document.querySelectorAll('.cabinet-templates__table-scroll').forEach((scrollElement) => {
        const scope = scrollElement.closest('.cabinet-templates__table-wrap');
        const scrollbarElement = scope?.querySelector('.cabinet-templates__scrollbar');

        bindScrollbar({
            scrollElement,
            scrollbarElement,
            thumbElement: scrollbarElement?.querySelector('.cabinet-templates__scrollbar-thumb'),
            hideWhenNoOverflow: true,
        });
    });

    [
        ['[data-mailing-recipients-table-scroll]', '[data-mailing-recipients-table-slider]', '[data-mailing-recipients-table-thumb]'],
        ['[data-mailing-file-table-scroll]', '[data-mailing-file-table-slider]', '[data-mailing-file-table-thumb]'],
        ['[data-mailing-message-table-scroll]', '[data-mailing-message-table-slider]', '[data-mailing-message-table-thumb]'],
    ].forEach(([scrollSelector, scrollbarSelector, thumbSelector]) => {
        document.querySelectorAll(scrollSelector).forEach((scrollElement) => {
            const page = scrollElement.closest('[data-cabinet-mailing-recipients-page]');
            const scrollbarElement = page?.querySelector(scrollbarSelector);

            bindScrollbar({
                scrollElement,
                scrollbarElement,
                thumbElement: scrollbarElement?.querySelector(thumbSelector),
                useTransform: true,
            });
        });
    });
}
