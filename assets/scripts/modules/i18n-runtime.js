import { I18N_DICTIONARY } from './i18n-dictionary.js';

const ATTRS = ['title', 'content', 'placeholder', 'aria-label', 'alt', 'value'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG']);

function normalize(value) {
    return value.replace(/\s+/g, ' ').trim();
}

function preserveSpace(original, translated) {
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    return `${leading}${translated}${trailing}`;
}

function translateValue(value, dictionary) {
    const translated = dictionary[normalize(value)];
    return translated ? preserveSpace(value, translated) : value;
}

function translateElement(element, dictionary) {
    if (!element || SKIP_TAGS.has(element.tagName)) return;

    for (const attr of ATTRS) {
        if (!element.hasAttribute(attr)) continue;
        const current = element.getAttribute(attr);
        const next = translateValue(current, dictionary);
        if (next !== current) {
            element.setAttribute(attr, next);
        }
    }
}

function translateNode(node, dictionary) {
    if (node.nodeType === Node.TEXT_NODE) {
        if (!node.parentElement || SKIP_TAGS.has(node.parentElement.tagName)) return;
        const current = node.nodeValue;
        const next = translateValue(current, dictionary);
        if (next !== current) {
            node.nodeValue = next;
        }
        return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    translateElement(node, dictionary);

    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
        acceptNode(current) {
            if (current.nodeType === Node.ELEMENT_NODE && SKIP_TAGS.has(current.tagName)) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        },
    });

    while (walker.nextNode()) {
        const current = walker.currentNode;
        if (current.nodeType === Node.TEXT_NODE) {
            if (current.parentElement && !SKIP_TAGS.has(current.parentElement.tagName)) {
                const currentValue = current.nodeValue;
                const nextValue = translateValue(currentValue, dictionary);
                if (nextValue !== currentValue) {
                    current.nodeValue = nextValue;
                }
            }
        } else {
            translateElement(current, dictionary);
        }
    }
}

export function getCurrentLocale() {
    const path = window.location.pathname;
    if (path.includes('/en/')) return 'en';
    if (path.includes('/ky/')) return 'ky';
    return document.documentElement.lang || 'ru';
}

export function initI18n() {
    const locale = getCurrentLocale();
    const dictionary = I18N_DICTIONARY[locale];
    if (!dictionary) return;

    translateNode(document.documentElement, dictionary);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'characterData') {
                translateNode(mutation.target, dictionary);
                return;
            }

            mutation.addedNodes.forEach((node) => translateNode(node, dictionary));

            if (mutation.type === 'attributes') {
                translateElement(mutation.target, dictionary);
            }
        });
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
        attributeFilter: ATTRS,
    });
}
