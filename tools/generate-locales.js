const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const HTML_FILES = fs.readdirSync(ROOT).filter((file) => file.endsWith('.html')).sort();
const LOCALES = {
    en: { label: 'English' },
    ky: { label: 'Кыргызча' },
};
const CACHE_FILE = path.join(ROOT, 'tools', 'translation-cache.json');
const DICTIONARY_FILE = path.join(ROOT, 'assets', 'scripts', 'modules', 'i18n-dictionary.js');
const RUNTIME_FILE = path.join(ROOT, 'assets', 'scripts', 'modules', 'i18n-runtime.js');
const TRANSLATABLE_ATTRS = [
    'title',
    'content',
    'placeholder',
    'aria-label',
    'alt',
    'value',
];
const SKIP_TAGS = new Set(['script', 'style', 'svg']);
const CYRILLIC_RE = /[А-Яа-яЁё]/;
const OVERRIDES = {
    en: {
        'СОМ': 'SOM',
        'Пол': 'Gender',
        'Пол:': 'Gender:',
        'М / Ж': 'M / F',
        'М': 'M',
        'Ж': 'F',
        'Доп.1': 'Extra 1',
        'Доп.2': 'Extra 2',
        'Доп.3': 'Extra 3',
        'Доп.1:': 'Extra 1:',
        'Доп.2:': 'Extra 2:',
        'Доп.3:': 'Extra 3:',
        'Подсказка': 'Hint',
        'Описание': 'Description',
    },
    ky: {
        'СОМ': 'сом',
        'Пол': 'Жынысы',
        'Пол:': 'Жынысы:',
        'М / Ж': 'Э / А',
        'М': 'Э',
        'Ж': 'А',
        'Доп.1': 'Кош. 1',
        'Доп.2': 'Кош. 2',
        'Доп.3': 'Кош. 3',
        'Доп.1:': 'Кош. 1:',
        'Доп.2:': 'Кош. 2:',
        'Доп.3:': 'Кош. 3:',
        'Подсказка': 'Кеңеш',
        'Описание': 'Сүрөттөмө',
    },
};

const cache = fs.existsSync(CACHE_FILE)
    ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
    : {};

function normalize(value) {
    return value.replace(/\s+/g, ' ').trim();
}

function preserveSpace(original, translated) {
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    return `${leading}${translated}${trailing}`;
}

function addString(strings, value) {
    const normalized = normalize(value);
    if (!normalized || !CYRILLIC_RE.test(normalized)) return;
    if (/^[{}()[\]\d\s.,:+\-–—/%"'«»№&;]+$/.test(normalized)) return;
    strings.add(normalized);
}

function collectHtmlStrings(source, strings) {
    let activeSkipTag = null;
    const tokens = source.split(/(<[^>]+>)/g);

    for (const token of tokens) {
        if (!token) continue;

        if (token.startsWith('<')) {
            const close = token.match(/^<\/\s*([a-z0-9-]+)/i);
            if (close && activeSkipTag === close[1].toLowerCase()) {
                activeSkipTag = null;
            }

            const open = token.match(/^<\s*([a-z0-9-]+)/i);
            if (open && SKIP_TAGS.has(open[1].toLowerCase()) && !token.startsWith('</')) {
                activeSkipTag = open[1].toLowerCase();
            }

            for (const attr of TRANSLATABLE_ATTRS) {
                const attrRe = new RegExp(`(${attr}=)(["'])([^"']*[А-Яа-яЁё][^"']*)\\2`, 'gi');
                for (const match of token.matchAll(attrRe)) {
                    addString(strings, match[3]);
                }
            }
            continue;
        }

        if (!activeSkipTag) {
            addString(strings, token);
        }
    }
}

function collectJsStrings(source, strings) {
    const literalRe = /`([^`]*[А-Яа-яЁё][^`]*)`|'([^']*[А-Яа-яЁё][^']*)'|"([^"]*[А-Яа-яЁё][^"]*)"/g;

    for (const match of source.matchAll(literalRe)) {
        const literal = match[1] || match[2] || match[3] || '';
        if (literal.includes('<')) {
            collectHtmlStrings(literal, strings);
        } else if (!literal.includes('[data-') && !literal.includes('.')) {
            addString(strings, literal.replace(/\$\{[^}]+\}/g, '{}'));
        }
    }
}

function collectStrings() {
    const strings = new Set();

    for (const file of HTML_FILES) {
        collectHtmlStrings(fs.readFileSync(path.join(ROOT, file), 'utf8'), strings);
    }

    const scriptDir = path.join(ROOT, 'assets', 'scripts');
    const scripts = [];
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.startsWith('i18n-')) {
                scripts.push(full);
            }
        }
    };
    walk(scriptDir);

    for (const file of scripts) {
        collectJsStrings(fs.readFileSync(file, 'utf8'), strings);
    }

    return [...strings].sort((a, b) => b.length - a.length);
}

async function translate(text, locale) {
    cache[locale] ||= {};

    if (cache[locale][text]) {
        return cache[locale][text];
    }

    const url = new URL('https://translate.googleapis.com/translate_a/single');
    url.searchParams.set('client', 'gtx');
    url.searchParams.set('sl', 'ru');
    url.searchParams.set('tl', locale);
    url.searchParams.set('dt', 't');
    url.searchParams.set('q', text);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Translate ${locale} failed ${response.status}: ${text.slice(0, 80)}`);
    }

    const data = await response.json();
    const translated = (data[0] || []).map((item) => item[0]).join('');
    cache[locale][text] = translated || text;

    if (Object.keys(cache[locale]).length % 25 === 0) {
        fs.writeFileSync(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`);
    }

    return cache[locale][text];
}

async function buildDictionary(strings) {
    const dictionary = {};
    const concurrency = 8;

    for (const [locale] of Object.entries(LOCALES)) {
        dictionary[locale] = {};
        let completed = 0;
        let cursor = 0;

        const worker = async () => {
            while (cursor < strings.length) {
                const source = strings[cursor];
                cursor += 1;
                dictionary[locale][source] = await translate(source, locale);
                completed += 1;

                if (completed % 50 === 0) {
                    console.log(`${locale}: ${completed}/${strings.length}`);
                }
            }
        };

        await Promise.all(Array.from({ length: concurrency }, () => worker()));
        Object.assign(dictionary[locale], OVERRIDES[locale]);
        Object.assign(cache[locale], OVERRIDES[locale]);
    }

    fs.writeFileSync(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`);
    return dictionary;
}

function translateHtmlSource(source, dictionary, locale) {
    let activeSkipTag = null;
    const tokens = source.split(/(<[^>]+>)/g);

    return tokens.map((token) => {
        if (!token) return token;

        if (token.startsWith('<')) {
            const close = token.match(/^<\/\s*([a-z0-9-]+)/i);
            if (close && activeSkipTag === close[1].toLowerCase()) {
                activeSkipTag = null;
            }

            let next = token.replace(/<html\s+lang="ru"/i, `<html lang="${locale}"`);

            for (const attr of TRANSLATABLE_ATTRS) {
                const attrRe = new RegExp(`(${attr}=)(["'])([^"']*[А-Яа-яЁё][^"']*)\\2`, 'gi');
                next = next.replace(attrRe, (full, name, quote, value) => {
                    const key = normalize(value);
                    return `${name}${quote}${dictionary[locale][key] || value}${quote}`;
                });
            }

            next = next
                .replace(/((?:href|src)=["'])assets\//gi, `$1../assets/`)
                .replace(/(url\(["']?)assets\//gi, '$1../assets/')
                .replace(/href=(["'])\/\1/gi, 'href=$1index.html$1');

            const open = token.match(/^<\s*([a-z0-9-]+)/i);
            if (open && SKIP_TAGS.has(open[1].toLowerCase()) && !token.startsWith('</')) {
                activeSkipTag = open[1].toLowerCase();
            }

            return next;
        }

        if (activeSkipTag || !CYRILLIC_RE.test(token)) {
            return token;
        }

        const key = normalize(token);
        const translated = dictionary[locale][key];
        return translated ? preserveSpace(token, translated) : token;
    }).join('');
}

function writeLocalizedHtml(dictionary) {
    for (const [locale] of Object.entries(LOCALES)) {
        const localeDir = path.join(ROOT, locale);
        fs.mkdirSync(localeDir, { recursive: true });

        for (const file of HTML_FILES) {
            const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
            const localized = translateHtmlSource(source, dictionary, locale);
            fs.writeFileSync(path.join(localeDir, file), localized);
        }
    }
}

function writeDictionaryModule(dictionary) {
    const compact = {};

    for (const [locale] of Object.entries(LOCALES)) {
        compact[locale] = {};
        for (const [source, translated] of Object.entries(dictionary[locale])) {
            if (source !== translated) {
                compact[locale][source] = translated;
            }
        }
    }

    fs.writeFileSync(
        DICTIONARY_FILE,
        `export const I18N_DICTIONARY = ${JSON.stringify(compact, null, 2)};\n`,
    );
}

function writeRuntimeModule() {
    const source = `import { I18N_DICTIONARY } from './i18n-dictionary.js';

const ATTRS = ['title', 'content', 'placeholder', 'aria-label', 'alt', 'value'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG']);

function normalize(value) {
    return value.replace(/\\s+/g, ' ').trim();
}

function preserveSpace(original, translated) {
    const leading = original.match(/^\\s*/)?.[0] || '';
    const trailing = original.match(/\\s*$/)?.[0] || '';
    return \`\${leading}\${translated}\${trailing}\`;
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
        node.nodeValue = translateValue(node.nodeValue, dictionary);
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
                current.nodeValue = translateValue(current.nodeValue, dictionary);
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
        attributeFilter: ATTRS,
    });
}
`;

    fs.writeFileSync(RUNTIME_FILE, source);
}

async function main() {
    const strings = collectStrings();
    console.log(`Collected ${strings.length} strings`);
    const dictionary = await buildDictionary(strings);
    writeLocalizedHtml(dictionary);
    writeDictionaryModule(dictionary);
    writeRuntimeModule();
}

main().catch((error) => {
    fs.writeFileSync(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`);
    console.error(error);
    process.exit(1);
});
