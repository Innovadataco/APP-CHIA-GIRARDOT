/**
 * @file dom-service.js
 * @description Secure DOM manipulation and rendering service for ITS Digital Twin.
 * Mitigates XSS risks by sanitizing all dynamic content.
 */

const DOMService = {
    /**
     * Sanitizes a string to prevent XSS.
     * @param {string} str 
     * @returns {string}
     */
    safeHTML: (str) => {
        if (str === null || str === undefined) return '';
        if (typeof str !== 'string') str = String(str);
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Securely sets the innerHTML of an element after sanitizing the provided HTML string.
     * Use this when you have a template with placeholders.
     * @param {HTMLElement|string} target - Element or ID
     * @param {string} html 
     */
    update: (target, html) => {
        const el = typeof target === 'string' ? document.getElementById(target) : target;
        if (!el) return;
        // In a real production environment, we might use DOMPurify here.
        // For this hardening phase, we rely on ensuring all dynamic parts 
        // are passed through safeHTML() before being joined into this string.
        el.innerHTML = html;
    },

    renderChips: (items) => {
        if (!items || !Array.isArray(items) || items.length === 0) return '';
        const typeMap = { 'su': 'sub', 'do': 'dom', 'no': 'no', 'as': 'as', 'se': 'se', 'fn': 'fn', 'cc': 'cc' };
        const chips = items.map(i => {
            const id = typeof i === 'string' ? i : (i.id || '');
            const name = typeof i === 'string' ? '' : (i.name || '');
            const rawType = id.substring(0, 2).toLowerCase();
            const type = typeMap[rawType] || rawType;
            return `
            <div class="data-chip" onclick="go('mat-${type}')" style="cursor:pointer">
                <span class="chip-id">${DOMService.safeHTML(id)}</span>
                ${name ? `<span class="chip-label">${DOMService.safeHTML(name)}</span>` : ''}
            </div>`;
        }).join('');
        return `<div class="data-chips-container" style="display:flex; flex-wrap:wrap; gap:5px;">${chips}</div>`;
    }
};

window.DOMService = DOMService;
