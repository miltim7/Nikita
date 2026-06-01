(function () {
    var storageKey = 'nikita:cabinet-theme';
    var theme = 'light';

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
}());
