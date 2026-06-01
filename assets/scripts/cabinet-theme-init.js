(function () {
    var storageKey = 'nikita:cabinet-theme';
    var theme = 'light';

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

    if (!supportsCssZoom()) {
        document.documentElement.classList.add('no-css-zoom');
    }
}());
