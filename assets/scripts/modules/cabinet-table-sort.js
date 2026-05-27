const SORT_ICON_SELECTOR = [
    '[class*="table__sort"]',
    '[class*="__head-sort"]',
    '[data-profile-sender-sort]',
].join(',');

const INTERACTIVE_SELECTOR = [
    'a',
    'button',
    'input',
    'select',
    'textarea',
    '[role="button"]',
    '[role="menuitem"]',
].join(',');

const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
});

const getDirectRows = (table) => {
    if (table instanceof HTMLTableElement) {
        const bodyRows = Array.from(table.tBodies).flatMap((body) => Array.from(body.rows));
        return bodyRows.length ? bodyRows : Array.from(table.rows).filter((row) => row.cells.length);
    }

    const rows = Array.from(table.children).flatMap((child) => {
        if (child.getAttribute('role') === 'row') return [child];
        if (child.getAttribute('role') === 'rowgroup') {
            return Array.from(child.children).filter((row) => row.getAttribute('role') === 'row');
        }
        return [];
    });

    return rows.length ? rows : Array.from(table.querySelectorAll('[role="row"]'));
};

const getRowCells = (row) => Array.from(row.children).filter((child) => {
    const role = child.getAttribute('role');
    return child.matches('td, th') || role === 'cell' || role === 'gridcell' || role === 'columnheader';
});

const getSortableRows = (table) => getDirectRows(table).filter((row) => {
    if (row.hidden || row.getAttribute('aria-hidden') === 'true') return false;
    if (row.querySelector('[role="columnheader"], th')) return false;
    return getRowCells(row).some((cell) => cell.getAttribute('role') === 'cell' || cell.matches('td'));
});

const getSortableContainer = (rows) => {
    if (!rows.length) return null;
    const parent = rows[0].parentElement;
    return rows.every((row) => row.parentElement === parent) ? parent : null;
};

const parseDate = (value) => {
    const match = value.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (!match) return null;

    const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = match;
    const timestamp = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
        Number(seconds),
    ).getTime();

    return Number.isNaN(timestamp) ? null : timestamp;
};

const parseNumber = (value) => {
    const compactValue = value
        .replace(/\s+/g, '')
        .replace(',', '.');

    if (!/^[+-]?\d+(?:\.\d+)?$/.test(compactValue)) return null;

    const number = Number(compactValue);
    return Number.isNaN(number) ? null : number;
};

const getCellText = (row, columnIndex) => {
    const cell = getRowCells(row)[columnIndex];
    if (!cell) return '';

    const clone = cell.cloneNode(true);
    clone.querySelectorAll('input, button, select, textarea, svg, img').forEach((node) => node.remove());

    return clone.textContent.trim().replace(/\s+/g, ' ');
};

const getSortValue = (row, columnIndex) => {
    const text = getCellText(row, columnIndex);
    const dateValue = parseDate(text);
    if (dateValue !== null) return { type: 'number', value: dateValue };

    const numberValue = parseNumber(text);
    if (numberValue !== null) return { type: 'number', value: numberValue };

    return { type: 'text', value: text };
};

const compareValues = (rowA, rowB, columnIndex) => {
    const valueA = getSortValue(rowA, columnIndex);
    const valueB = getSortValue(rowB, columnIndex);

    if (valueA.type === 'number' && valueB.type === 'number') {
        return valueA.value - valueB.value;
    }

    return collator.compare(String(valueA.value), String(valueB.value));
};

const resetHeaderStates = (table, activeHeader, direction) => {
    table.querySelectorAll('[role="columnheader"], th').forEach((header) => {
        const isActive = header === activeHeader;
        header.classList.toggle('is-sorted-asc', isActive && direction === 'ascending');
        header.classList.toggle('is-sorted-desc', isActive && direction === 'descending');
        header.setAttribute('aria-sort', isActive ? direction : 'none');
    });
};

const sortTable = (table, header) => {
    const headerRow = header.closest('[role="row"], tr');
    const columnIndex = getRowCells(headerRow).indexOf(header);
    const rows = getSortableRows(table);
    const container = getSortableContainer(rows);

    if (columnIndex < 0 || rows.length < 2 || !container) return;

    const direction = header.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
    const sortedRows = rows
        .map((row, index) => ({ row, index }))
        .sort((itemA, itemB) => {
            const result = compareValues(itemA.row, itemB.row, columnIndex);
            const stableResult = result || itemA.index - itemB.index;
            return direction === 'ascending' ? stableResult : -stableResult;
        })
        .map((item) => item.row);

    resetHeaderStates(table, header, direction);
    sortedRows.forEach((row) => container.append(row));
    table.dispatchEvent(new CustomEvent('cabinet:table-sort', { bubbles: true }));
};

const makeHeaderSortable = (header) => {
    const table = header.closest('[role="table"], table');
    const existingButton = header.querySelector('[data-profile-sender-sort]');
    if (!table || header.dataset.cabinetTableSortReady === 'true' || existingButton) return;

    header.dataset.cabinetTableSortReady = 'true';
    header.classList.add('is-sortable');
    header.tabIndex = header.tabIndex >= 0 ? header.tabIndex : 0;
    header.setAttribute('aria-sort', header.getAttribute('aria-sort') || 'none');

    header.addEventListener('click', (event) => {
        if (event.target.closest(INTERACTIVE_SELECTOR)) return;
        sortTable(table, header);
    });

    header.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        sortTable(table, header);
    });
};

export function initCabinetTableSort() {
    document.querySelectorAll('[role="columnheader"], th').forEach((header) => {
        if (!header.querySelector(SORT_ICON_SELECTOR)) return;
        makeHeaderSortable(header);
    });
}
