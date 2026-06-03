(function () {
    var storageKey = 'nikita:cabinet-theme';
    var routeBootKey = 'nikita:cabinet-route-boot';
    var theme = 'light';
    var bootFinishScheduled = false;
    var paintHoldStyle = null;
    var cabinetPageFiles = {
        'agreement.html': true,
        'api.html': true,
        'cabinet-demo.html': true,
        'cabinet.html': true,
        'lists.html': true,
        'mailing-create-recipients.html': true,
        'mailing-create.html': true,
        'mailings.html': true,
        'notifications.html': true,
        'otp.html': true,
        'profile.html': true,
        'reports.html': true,
        'templates.html': true
    };
    var isFirefox = /\bFirefox\//.test(window.navigator.userAgent);

    document.documentElement.classList.add('cabinet-booting');

    function getPageFile(url) {
        var parts = url.pathname.split('/');
        return parts[parts.length - 1] || 'cabinet.html';
    }

    function isCabinetPageUrl(url) {
        return url.origin === window.location.origin && cabinetPageFiles[getPageFile(url)] === true;
    }

    function isSameDocumentUrl(url) {
        return url.origin === window.location.origin
            && url.pathname === window.location.pathname
            && url.search === window.location.search;
    }

    function consumeRouteBootFlag() {
        try {
            var shouldHold = window.sessionStorage.getItem(routeBootKey) === '1';
            window.sessionStorage.removeItem(routeBootKey);
            return shouldHold;
        } catch (error) {
            return false;
        }
    }

    function markRouteBoot(event) {
        var link;
        var target = event.target;
        var url;

        if (!document.body || !document.body.classList.contains('cabinet-page')) return;
        if (event.defaultPrevented || (typeof event.button === 'number' && event.button !== 0)) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        if (target && typeof target.closest !== 'function') {
            target = target.parentElement;
        }

        link = target && typeof target.closest === 'function' ? target.closest('a[href]') : null;
        if (!link || link.target && link.target !== '_self' || link.hasAttribute('download')) return;

        url = new URL(link.getAttribute('href'), window.location.href);
        if (!isCabinetPageUrl(url) || isSameDocumentUrl(url)) return;

        try {
            window.sessionStorage.setItem(routeBootKey, '1');
        } catch (error) {
            // Session storage is optional; navigation should continue normally.
        }
    }

    function markPageExit() {
        if (!isFirefox || !document.body || !document.body.classList.contains('cabinet-page')) return;

        try {
            window.sessionStorage.setItem(routeBootKey, '1');
        } catch (error) {
            // Session storage is optional; navigation should continue normally.
        }
    }

    function holdFirefoxPaint() {
        if (!isFirefox || !consumeRouteBootFlag()) return;

        document.documentElement.classList.add('cabinet-hold-paint');
        paintHoldStyle = document.createElement('style');
        paintHoldStyle.setAttribute('data-cabinet-paint-hold', '');
        paintHoldStyle.textContent = [
            'html.cabinet-hold-paint{background:#fff;}',
            'html.cabinet-hold-paint[data-cabinet-theme="dark"]{background:#0D0D0D;}',
            'html.cabinet-hold-paint body.cabinet-page{visibility:hidden!important;}'
        ].join('');
        document.head.appendChild(paintHoldStyle);
    }

    function finishBoot() {
        if (bootFinishScheduled) return;
        bootFinishScheduled = true;

        var clearBooting = function () {
            document.documentElement.classList.remove('cabinet-booting');
            document.documentElement.classList.remove('cabinet-hold-paint');
            if (paintHoldStyle) {
                paintHoldStyle.remove();
                paintHoldStyle = null;
            }
        };

        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(function () {
                window.requestAnimationFrame(clearBooting);
            });
        } else {
            window.setTimeout(clearBooting, 0);
        }
    }

    function supportsCssZoom() {
        if (!window.CSS || !window.CSS.supports || !window.CSS.supports('zoom', '1')) {
            return false;
        }

        var probe = document.createElement('div');
        probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:10px;height:10px;zoom:2;';
        document.documentElement.appendChild(probe);
        var supported = Math.round(probe.getBoundingClientRect().width) === 20;
        probe.remove();

        return supported;
    }

    try {
        var storedTheme = window.localStorage.getItem(storageKey);
        if (storedTheme === 'dark') {
            theme = 'dark';
        }
    } catch (error) {
        theme = 'light';
    }

    document.documentElement.dataset.cabinetTheme = theme;
    document.documentElement.style.colorScheme = theme;
    holdFirefoxPaint();
    document.addEventListener('click', markRouteBoot, true);
    window.addEventListener('pagehide', markPageExit);

    if (!supportsCssZoom()) {
        document.documentElement.classList.add('no-css-zoom');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', finishBoot, { once: true });
    } else {
        finishBoot();
    }

    window.addEventListener('load', finishBoot, { once: true });
}());
