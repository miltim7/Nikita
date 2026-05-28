const COPY_LABELS = {
    ru: {
        success: 'Скопировано',
        failure: 'Не скопировано',
    },
    en: {
        success: 'Copied',
        failure: 'Not copied',
    },
    ky: {
        success: 'Көчүрүлдү',
        failure: 'Көчүрүлгөн жок',
    },
};

function getCurrentLocale() {
    const path = window.location.pathname;
    if (path.includes('/en/')) return 'en';
    if (path.includes('/ky/')) return 'ky';
    return document.documentElement.lang || 'ru';
}

function getCopyLabels() {
    return COPY_LABELS[getCurrentLocale()] || COPY_LABELS.ru;
}

function setButtonState(button, label) {
    const previous = button.textContent;
    button.textContent = label;
    window.setTimeout(() => {
        button.textContent = previous;
    }, 1800);
}

async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
}

function initScriptExampleCopy() {
    const buttons = document.querySelectorAll('[data-script-copy]');

    buttons.forEach((button) => {
        button.addEventListener('click', async () => {
            const target = document.getElementById(button.dataset.scriptCopy);
            if (!target) return;

            try {
                await copyText(target.textContent.trim());
                setButtonState(button, getCopyLabels().success);
            } catch (error) {
                setButtonState(button, getCopyLabels().failure);
            }
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScriptExampleCopy, { once: true });
} else {
    initScriptExampleCopy();
}
