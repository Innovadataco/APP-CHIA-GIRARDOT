/**
 * @file app.js
 * @description Architect Cockpit v6.0 Core Logic
 * @author InnovaDataCo - Engineering Team
 * @license PMBOK-Compliant Governance
 */

/**
 * @typedef {Object} EOV
 * @property {string} id
 * @property {string} name
 * @property {string} ctx
 * @property {string[]} kpis
 */

/** @type {EOV|null} Current Scenario under audit */
let currentAuditEov = null;
/** @type {string} Current Active Dimension */
let activeAuditSection = 'eov_sum';

// ── SECURITY & UTILITIES ──
// Handled by DOMService in dom-service.js

const safeHTML = DOMService.safeHTML;
const renderChips = DOMService.renderChips;
// Global ANIMATIONS is provided by sim-config.js via window.ANIMATIONS

/**
 * Natural sort for alphanumeric strings
 * @param {Array} arr 
 */
const naturalSort = (arr) => arr.sort((a, b) => 
    String(a.cod || a.id || '').localeCompare(String(b.cod || b.id || ''), undefined, {numeric: true, sensitivity: 'base'})
);

// ── DATABASE INITIALIZATION ──

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await itsDb.init();
        await initialRender();
    } catch (err) {
        console.error('[CRITICAL] Database init failure:', err);
    }
});

/**
 * Initial dashboard load logic
 */
async function initialRender() {
    const data = {
        eovs: await itsDb.getAll('eov'),
        doms: await itsDb.getAll('dom'),
        ass: await itsDb.getAll('as'),
        ses: await itsDb.getAll('se'),
        subs: await itsDb.getAll('sub'),
        fns: await itsDb.getAll('fn'),
        ccs: await itsDb.getAll('cc'),
        nos: await itsDb.getAll('no')
    };

    Object.values(data).forEach(naturalSort);

    // Render Navigation & Lists
    renderNavBadges(data.nos.length);
    renderEOVQuickSelectors(data.eovs);
    renderEOVGrid(data.eovs);

    // Build Matrices
    buildGrid('no-grid', data.nos.map(r => [r.cod, r.name, r.desc]), 'NO');
    buildGrid('dom-grid', data.doms.map(r => [r.cod, r.name, r.desc]), 'DOM');
    buildGrid('as-grid', data.ass.map(r => [r.cod, r.name, r.desc]), 'AS');
    buildGrid('se-grid', data.ses.map(r => [r.cod, r.name, r.desc, r.cat]), 'SE');
    buildGrid('sub-grid', data.subs.map(r => [r.cod, r.sigla, r.name, r.desc]), 'SUB');
    buildGrid('fn-grid', data.fns.map(r => [r.id || r.cod, r.name, r.desc]), 'FN');
    buildGrid('cc-grid', data.ccs.map(r => [r.id || r.cod, r.sigla, r.name, r.cap]), 'CC');

    // Store globally for title resolution
    window.PLATFORM_DATA = { campo: data.ccs, operativo: data.nos, tecnico: data.fns, gestion: [] };

    animCnt();
}

// ── UI UI COMPONENTS ──

function renderNavBadges(noCount) {
    const badge = document.getElementById('nav-no-badge');
    if (badge) badge.textContent = noCount;
}

function renderEOVQuickSelectors(eovs) {
    const navGrid = document.getElementById('nav-eov-grid');
    if (!navGrid) return;
    const html = eovs.map(e => `
        <div class="nav-eov-btn" id="nav-${DOMService.safeHTML(e.id)}" onclick="showEOV('${DOMService.safeHTML(e.id)}')">
            ${DOMService.safeHTML(e.id.replace('EOV-', ''))}
        </div>
    `).join('');
    DOMService.update(navGrid, html);
}

function renderEOVGrid(eovs) {
    const container = document.getElementById('eov-cards-home');
    if (!container) return;
    const html = eovs.map(e => {
        const typeClass = e.type === 'p' ? 'tp' : e.type === 'c' ? 'tc' : 'tf';
        const typeLabel = e.type === 'p' ? 'Prioritario' : e.type === 'c' ? 'Complementario' : 'Futuro';
        return `
            <div class="data-card animable ${typeClass}" onclick="showEOV('${DOMService.safeHTML(e.id)}')">
                <div class="card-header">
                    <span class="card-code ${typeClass}">${DOMService.safeHTML(e.id)}</span>
                    <span class="card-icon material-symbols-outlined">${DOMService.safeHTML(e.ico)}</span>
                </div>
                <div class="card-title">${DOMService.safeHTML(e.name)}</div>
                <div class="card-desc" style="font-size:12px; height: 3.2em; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${DOMService.safeHTML(e.ctx || '')}</div>
                <div class="card-footer" style="justify-content: flex-start;">
                    <span class="card-tag ${typeClass}">${typeLabel}</span>
                </div>
            </div>
        `;
    }).join('');
    DOMService.update(container, html);
}

// ── GRID SYSTEM ──

/**
 * High-performance grid builder for matrices
 */
window.buildGrid = function(containerId, data, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const html = data.map(row => {
        let [code, title, desc] = row;
        let tag = type || 'DATO';
        let searchTerms = title + ' ' + desc;

        if (type === 'SUB' || type === 'CC') {
            const sigla = row[1] || '';
            searchTerms += ' ' + sigla;
            title = `${DOMService.safeHTML(row[2])} <span style="color:var(--accent2); font-size:12px; margin-left:6px">[${DOMService.safeHTML(sigla)}]</span>`;
            desc = row[3];
            tag = `Sigla: ${sigla}`;
        } else if (type === 'SE') {
            tag = `Categoría: ${row[3] || ''}`;
        }

        const icon = getIcon(searchTerms, code);
        const isAnimable = (type === 'CC' && typeof ANIMATIONS !== 'undefined' && ANIMATIONS[code]);
        const clickAction = isAnimable ? `onclick="showFunctionalAnim('${DOMService.safeHTML(code)}')"` : '';
        const playBtn = ''; // isAnimable ? `<span class="material-symbols-outlined card-play-trigger" style="font-size: 18px; color: var(--accent); margin-left: 10px; cursor: pointer;">play_circle</span>` : '';

        return `
            <div class="data-card ${isAnimable ? 'animable' : ''}" ${clickAction}>
                <div class="card-header">
                    <div style="display:flex; align-items:center;">
                        <span class="card-code">${DOMService.safeHTML(code)}</span>
                        ${playBtn}
                    </div>
                    <span class="card-icon material-symbols-outlined">${icon}</span>
                </div>
                <div class="card-title">${title}</div>
                <div class="card-desc">${DOMService.safeHTML(desc)}</div>
                <div class="card-footer" style="justify-content: flex-start;">
                    <span class="card-tag">${DOMService.safeHTML(tag)}</span>
                </div>
            </div>`;
    }).join('');

    DOMService.update(container, html);

    const el = document.getElementById(containerId.replace('-grid', '-cnt'));
    if (el) el.textContent = `${data.length} registros`;
};

const getIcon = (txt, code) => {
    if (code === 'CC-09') return '&#xe396;';
    if (code === 'CC-15') return '&#xe94e;';
    if (code === 'CC-34') return '&#xef6a;';

    const exactIcons = {
        'cctv': 'videocam', 'aid': 'warning', 'dms': 'info', 'vms': 'info', 'sos': 'sos', 'ecs': 'sos',
        'vds': 'road', 'tds': 'road', 'ess': 'thermostat', 'rwis': 'thermostat', 'wim': 'monitor_weight', 
        'gms': 'landscape', 'gms-i': 'landscape', 'sms': 'bridge', 'sbt': 'bridge', 'wls': 'water_drop', 
        'avi': 'toll', 'etc': 'toll', 'alpr': 'badge', 'lpr': 'badge', 'spd': 'speed', 'vsl': 'timer', 
        'tcs': 'tunnel', 'evcs': 'ev_station', 'pas': 'campaign', 'bcs': 'directions_bike', 'vru': 'directions_bike', 
        'uas': 'flight', 'uav': 'flight', 'vis': 'lightbulb', 'lgs': 'lightbulb', 'csg': 'security', 
        'psv': 'local_police', 'foc': 'settings_input_component', 'rcs': 'radio', 'sme': 'smartphone', 
        'rsu': 'settings_input_antenna', 'avl': 'directions_bus', 'obu': 'directions_bus', 'pgs': 'local_parking',
        'slp': 'wb_sunny', 'lhd': 'local_fire_department', 'aqm': 'air', 'war': 'business',
        'lcs': 'traffic', 'sig': 'traffic', 'pss': 'vertical_shivers', 'ups': 'battery_charging_full', 
        'eps': 'battery_charging_full', 'v2x': 'directions_car', 'v2x-h': 'directions_car',
        'wda': 'pets', 'ads': 'rocket_launch', 'msg': 'electrical_services', 'd-twn': 'public',
        'e-log': 'construction', 'sat-b': 'satellite_alt'
    };

    const t = (txt + ' ' + code).toLowerCase();
    for (const [sigla, icon] of Object.entries(exactIcons)) {
        if (new RegExp(`\\b${sigla}\\b`, 'i').test(t) || t.includes(`-${sigla}`) || t.includes(`${sigla}-`)) {
            return icon;
        }
    }

    const fallbackIcons = {
        'directions_bike': ['ciclistas', 'bicicleta'],
        'flight': ['drones'],
        'lightbulb': ['iluminación', 'solar', 'luz'],
        'security': ['ciberseguridad', 'ciudadana', 'seguridad', 'segurid'],
        'settings_input_component': ['fibra', 'óptica'],
        'radio': ['radial', 'radio'],
        'smartphone': ['sociales', 'app', 'usuario'],
        'settings_input_antenna': ['conectividad', 'comunicación'],
        'directions_bus': ['flota', 'carga'],
        'local_parking': ['parqueaderos', 'parqueo'],
        'traffic': ['carril', 'semaforo', 'semáforo'],
        'pets': ['fauna', 'animal'],
        'public': ['gemelo', 'digital'],
        'air': ['calidad', 'aire'],
        'business': ['centro', 'control', 'sala', 'crisis']
    };
    for (const [icon, keys] of Object.entries(fallbackIcons)) {
        if (keys.some(k => new RegExp(`\\b${k}\\b`, 'i').test(t))) return icon;
    }
    return 'description';
};

// ── COCKPIT V6.0 RENDERER ──

const AuditRenderer = {
    mkHeader: (id, title, subtitle) => `
        <header class="hud-header stage-anim" style="margin-bottom:40px; border-bottom: 2px solid rgba(255,255,255,0.03); padding-bottom:20px">
            <div>
                <h1 class="hud-h1" style="font-size:32px">${DOMService.safeHTML(title)}</h1>
                <p style="color:var(--muted); margin-top:8px; font-size:13px">${DOMService.safeHTML(subtitle)}</p>
            </div>
        </header>`,

    mkCard: (idTag, title, content) => {
        let renderedContent = '<span style="color:var(--red); opacity:0.5; font-style:italic">[DATO NO VINCULADO]</span>';
        if (content) {
            renderedContent = Array.isArray(content) ? DOMService.renderChips(content) : DOMService.safeHTML(content);
        }
        return `
        <div class="data-card stage-anim" style="will-change: transform, opacity; padding: 20px;">
            <div class="card-header" style="margin-bottom:12px">
                <span class="card-code">${DOMService.safeHTML(idTag)}</span>
                <span class="card-icon material-symbols-outlined" style="color:var(--accent); font-size:20px">layers</span>
            </div>
            <div class="card-title" style="font-size:15px; margin-bottom:8px; color:#fff !important">${DOMService.safeHTML(title)}</div>
            <div class="card-desc" style="font-size:12px; margin-bottom:0; color:#cbd5e1 !important; line-height:1.5">${renderedContent}</div>
        </div>`;
    }
};

function renderAuditTabs() {
    const eovNum = currentAuditEov ? (currentAuditEov.id.split('-')[1] || '01') : '01';
    const categories = [
        { id: 'eov_sum', num: eovNum, lbl: 'ESCENARIO OPERATIVO DE VALIDACIÓN', icon: 'dashboard' },
        { id: 'ref', num: '02', lbl: 'INFORMACIÓN DE REFERENCIA', icon: 'menu_book' },
        { id: 'flujo', num: '03', lbl: 'FLUJO SISTEMÁTICO', icon: 'account_tree' },
        { id: 'trans', num: '04', lbl: 'INTERACCIÓN TRANSACCIONAL', icon: 'hub' },
        { id: 'alertas', num: '05', lbl: 'ALERTAS DEL SISTEMA', icon: 'notification_important' },
        { id: 'usuario', num: '06', lbl: 'INFORMACIÓN AL USUARIO', icon: 'person' },
        { id: 'cont', num: '07', lbl: 'CONTINGENCIA', icon: 'emergency' },
        { id: 'acept', num: '08', lbl: 'CRITERIO DE ACEPTACIÓN', icon: 'checklist' },
        { id: 'evol', num: '09', lbl: 'EVOLUCIÓN TECNOLÓGICA', icon: 'rocket_launch' },
        { id: 'kpi', num: '10', lbl: 'INDICADORES DE DESEMPEÑO KPI', icon: 'bar_chart' }
    ];

    const container = document.getElementById('eov-quicknav');
    if (!container || !currentAuditEov) return;

    container.className = 'audit-top-nav';
    const html = `
        <div class="audit-header">
            <div class="audit-eov-name">
                <span style="color:var(--accent); margin-right:15px; font-family:var(--font-t)">${DOMService.safeHTML(currentAuditEov.id)}</span>
                ${DOMService.safeHTML(currentAuditEov.name.toUpperCase())}
            </div>
            <div onclick="go('eov-list')" class="back-btn" style="margin:0; font-size:9px">✕ CERRAR</div>
        </div>
        <div class="audit-tabs">
            ${categories.map(cat => `
                <div class="audit-tab-item ${activeAuditSection === cat.id ? 'active' : ''}" onclick="switchAuditSection('${DOMService.safeHTML(cat.id)}')">
                    <span class="audit-tab-num">${DOMService.safeHTML(cat.num)}</span>
                    <span class="hud-tab-ico material-symbols-outlined" style="font-size:18px">${DOMService.safeHTML(cat.icon)}</span>
                    <span class="audit-tab-lbl">${DOMService.safeHTML(cat.lbl)}</span>
                </div>
            `).join('')}
        </div>
    `;
    DOMService.update(container, html);
}

async function showEOV(id) {
    const raw = await itsDb.get('eov', id);
    if (!raw) return;
    currentAuditEov = await itsDb.queryRelationships(raw);
    activeAuditSection = 'eov_sum';
    switchAuditSection('eov_sum');
    go('eov-detail');
}

function switchAuditSection(sectionId) {
    activeAuditSection = sectionId;
    renderAuditTabs();
    
    const e = currentAuditEov;
    const stage = document.getElementById('eov-d-body');
    if (!stage || !e) return;

    let html = '';
    const R = AuditRenderer;

    switch(sectionId) {
        case 'eov_sum':
            const petals = [
                { tag: 'COD', l: 'Código', v: e.id, i: 'tag', ga: '1/1' },
                { tag: 'NOM', l: 'Nombre', v: e.name, i: 'title', ga: '1/2' },
                { tag: 'MOT', l: 'Motivación', v: e.mot, i: 'psychology', ga: '1/3' },
                { tag: 'QUE', l: '¿Qué es?', v: e.que, i: 'help', ga: '1/4' },
                { tag: 'PAR', l: '¿Para qué sirve?', v: e.para, i: 'verified', ga: '2/4' },
                { tag: 'DON', l: '¿En dónde ocurre?', v: e.donde, i: 'location_on', ga: '3/4' },
                { tag: 'CUA', l: '¿Cuándo ocurre?', v: e.cuando, i: 'schedule', ga: '4/4' },
                { tag: 'JUS', l: 'Justificación Operativa', v: e.just, i: 'gavel', ga: '4/3' },
                { tag: 'DES', l: 'Despliegue', v: e.desp, i: 'account_tree', ga: '4/2' },
                { tag: 'BEN', l: 'Beneficio Social', v: e.beneficio || e.impacto, i: 'social_distance', ga: '4/1' },
                { tag: 'ACT', l: 'Actores Estratégicos Involucrados', v: e.actores, i: 'groups', ga: '3/1' },
                { tag: 'GRP', l: 'Grupo de interés principal', v: e.grupo, i: 'person_search', ga: '2/1' }
            ];
            
            html = `
                <div class="focus-container" style="padding-top:0; margin-top:-30px">
                    ${R.mkHeader(sectionId, 'ESCENARIO OPERATIVO DE VALIDACIÓN', '')}
                    <div class="sunflower-grid">
                        <div class="sun-core stage-anim">
                            <div class="sun-ico material-symbols-outlined" style="font-size:32px; color:var(--accent)">hub</div>
                            <div class="sun-ttl" style="font-size:16px; margin: 10px 0; border:none">Contexto</div>
                            <div class="sun-val" style="font-size:12px; line-height:1.7; max-width:85%; opacity:0.9; text-align: justify; margin: 0 auto; hyphens: auto;">${DOMService.safeHTML(e.ctx)}</div>
                        </div>
                        ${petals.map((p, idx) => `
                            <div class="sun-petal-v11 stage-anim" style="grid-area: ${p.ga}; animation-delay: ${idx * 0.05}s;">
                                <div class="petal-head">
                                    <span class="petal-ico material-symbols-outlined">${p.i}</span>
                                    <span class="petal-ttl">${p.l}</span>
                                </div>
                                <div class="petal-body">${DOMService.safeHTML(p.v)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
            break;

        case 'ref':
            const coreLevels = [
                { l: 'L1', ttl: 'Dominios', v: e.dominio, i: 'account_balance' },
                { l: 'L2', ttl: 'Áreas de Servicio', v: e.area, i: 'dashboard_customize' },
                { l: 'L3', ttl: 'Subsistemas', v: e.sub, i: 'settings_input_component' },
                { l: 'L4', ttl: 'Servicios Estratégicos', v: e.se, i: 'military_tech' },
                { l: 'L5', ttl: 'Funciones Mínimas Técnicas', v: e.fn, i: 'settings_suggest' },
                { l: 'L6', ttl: 'Componente de campo', v: e.cc, i: 'layers' }
            ];

            const supportPillars = [
                { ttl: 'Estándares/ protocolos / lineamientos', v: e.std, i: 'verified_user' },
                { ttl: 'Ciberseguridad', v: e.cyber, i: 'security' },
                { ttl: 'Marco Normativo', v: e.marco, i: 'gavel' }
            ];
            
            html = `
                <div class="focus-container" style="padding-top:0; margin-top:-30px">
                    ${R.mkHeader(sectionId, 'INFORMACIÓN DE REFERENCIA', '')}
                    
                    <div class="h-ladder">
                        ${coreLevels.map((lvl, idx) => `
                            <div class="h-step stage-anim" style="animation-delay: ${idx * 0.05}s">
                                <div class="h-hex-wrap">
                                    <div class="h-hex">${lvl.l}</div>
                                </div>
                                <div class="h-card">
                                    <div class="h-head">
                                        <span class="h-ico material-symbols-outlined">${lvl.i}</span>
                                        <span class="h-ttl">${lvl.ttl}</span>
                                    </div>
                                    <div class="h-val">${DOMService.safeHTML(lvl.v)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="support-base">
                        ${supportPillars.map((p, idx) => `
                            <div class="support-pillar stage-anim" style="animation-delay: ${0.4 + (idx * 0.1)}s">
                                <span class="support-ico material-symbols-outlined">${p.i}</span>
                                <div class="h-ttl" style="margin-bottom:10px; color:var(--accent)">${p.ttl}</div>
                                <div class="h-val" style="font-size:11px">${DOMService.safeHTML(p.v)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
            break;

        case 'flujo':
            const monoLevels = [
                { id: 'E.1', lbl: 'Estratégico', v: e.e1, y: 30 },
                { id: 'E.2', lbl: 'Operacional', v: e.e2, y: 85 },
                { id: 'E.3', lbl: 'Lógico', v: e.e3, y: 140 },
                { id: 'E.4', lbl: 'Sistémico', v: e.e4, y: 195 },
                { id: 'E.5', lbl: 'Físico', v: e.e5, y: 250 }
            ];

            html = `
                <div class="focus-container" style="padding-top:0">
                    ${R.mkHeader(sectionId, 'FLUJO SISTEMÁTICO', '')}
                    <div class="dual-pane" id="its-dual-pane">
                        <div id="arrow-container"></div>
                        <div class="holo-stage stage-anim" onclick="window.RP_ITS(event)">
                            <div class="floor-grid"></div>
                            <div id="ripple-wrap"></div>
                            <div class="elevator-beam"></div>
                            <svg class="monolith-svg" viewBox="0 0 400 450">
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent)" />
                                    </marker>
                                </defs>
                                ${monoLevels.map((lvl, idx) => `
                                    <g class="m-floor-grp stage-anim" data-id="${lvl.id}" style="animation-delay: ${idx * 0.1}s" onclick="window.HL_ITS('${lvl.id}', event)">
                                        <rect class="m-floor" x="100" y="${lvl.y}" width="200" height="50" rx="2" />
                                        <path class="m-floor" d="M100,${lvl.y} L140,${lvl.y-20} L340,${lvl.y-20} L300,${lvl.y} Z" opacity="0.3" />
                                        <path class="m-floor" d="M300,${lvl.y} L340,${lvl.y-20} L340,${lvl.y+30} L300,${lvl.y+50} Z" opacity="0.2" />
                                        <text x="200" y="${lvl.y + 20}" text-anchor="middle" class="m-label">${lvl.id}</text>
                                        <text x="200" y="${lvl.y + 35}" text-anchor="middle" class="m-value" style="font-size:10px">${lvl.lbl}</text>
                                    </g>
                                `).join('')}
                            </svg>
                        </div>
                        <div class="p-text-col">
                            ${monoLevels.map((lvl, idx) => `
                                <div class="long-layer stage-anim" data-e="${lvl.id}" style="animation-delay: ${0.4 + (idx * 0.1)}s" onclick="window.HL_ITS('${lvl.id}', event)">
                                    <div class="long-id">
                                        <span class="long-e">${lvl.id}</span>
                                        <span class="long-lbl" style="font-size:9px">${lvl.lbl}</span>
                                    </div>
                                    <div class="long-val" style="font-size:11px">${DOMService.safeHTML(lvl.v)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>`;
            
            // Define Global Handlers V27.0
            window.RP_ITS = (ev) => {
                const wrap = document.getElementById('ripple-wrap');
                if(!wrap) return;
                const rip = document.createElement('div');
                rip.className = 'ripple-circle ripple-active';
                rip.style.left = ev.offsetX + 'px';
                rip.style.top = ev.offsetY + 'px';
                wrap.appendChild(rip);
                setTimeout(() => rip.remove(), 800);
            };

            window.HL_ITS = (id, ev) => {
                if(ev) ev.stopPropagation();
                document.querySelectorAll('.m-floor-grp, .long-layer').forEach(el => el.classList.remove('active'));
                
                const g = document.querySelector(`.m-floor-grp[data-id="${id}"]`);
                const t = document.querySelector(`.long-layer[data-e="${id}"]`);
                if(g) g.classList.add('active');
                if(t) t.classList.add('active');

                const container = document.getElementById('arrow-container');
                const pane = document.getElementById('its-dual-pane');
                if(!container || !pane || !g || !t) return;
                
                const gRect = g.getBoundingClientRect();
                const tRect = t.getBoundingClientRect();
                const pRect = pane.getBoundingClientRect();

                const x1 = gRect.right - pRect.left - 30;
                const y1 = gRect.top - pRect.top + gRect.height / 2;
                const x2 = tRect.left - pRect.left - 5;
                const y2 = tRect.top - pRect.top + tRect.height / 2;

                container.innerHTML = `
                    <svg width="100%" height="100%" style="overflow:visible">
                        <path class="holo-arrow" d="M${x1},${y1} L${x2},${y2}" stroke-dasharray="10,5">
                            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
                        </path>
                        <circle cx="${x1}" cy="${y1}" r="4" fill="var(--accent)" />
                        <circle cx="${x2}" cy="${y2}" r="4" fill="var(--accent)" />
                    </svg>`;
            };
            break;

        case 'trans':
            const transLevels = [
                { id: 'FLD', lbl: 'Componentes en campo', v: 'Fuentes primarias: CCTV, VIM y CDMS/VMS capturando telemetría.', ico: 'sensors' },
                { id: 'CCO', lbl: 'CCO', v: 'Centro de Control Operativo: Integración y mando.', ico: 'settings_remote' },
                { id: 'BIM', lbl: 'BIM', v: 'Modelado de Información: Gestión técnica.', ico: 'layers' },
                { id: 'TWIN', lbl: 'Gemelo Digital Vía inteligentes', v: 'Representación visual operativa de alta fidelidad.', ico: 'videocam' }
            ];

            html = `
                <div class="focus-container" style="padding-top:0">
                    <div class="hud-meta">
                        <div class="hud-badge active-glow" style="border-color:#00ffcc; color:#00ffcc">HOLOGRAPHIC CORE: ACTIVE</div>
                        <div class="hud-badge gold active-glow">ITS-V46: STAND-BY</div>
                    </div>
                    ${R.mkHeader(sectionId, 'TRANSMISIÓN DE VALOR ITS', 'Arquitectura de Operación: Campo ➜ CCO ➜ BIM ➜ Gemelo Digital.')}
                    
                    <div class="trans-stage holographic-table" id="trans-stage" style="gap:15px; align-items: stretch; margin-top:20px;">
                        <div id="synapse-container"></div>
                        
                        <!-- BLOCK 1: FIELD COMPONENTS -->
                        <div class="v44-block" style="flex:1;">
                            <div class="v44-b-title">Componentes en campo</div>
                            <div class="v44-b-body" style="display:flex; flex-direction:column; gap:15px; justify-content:center;">
                                ${[
                                    {id:'CCTV', ico:'videocam'},
                                    {id:'VIM', ico:'edit_road'},
                                    {id:'CDMS / VMS', ico:'database'}
                                ].map(s => `
                                    <div class="source-node stage-anim v44-src" data-id="${s.id}" style="padding:12px 16px;">
                                        <div class="v44-src-ico"><span class="material-symbols-outlined" style="font-size:24px;">${s.ico}</span></div>
                                        <div style="display:flex; flex-direction:column;">
                                            <span style="font-size:11px; font-weight:800;">${s.id}</span>
                                            <span style="font-size:8px; opacity:0.6; letter-spacing:1px;">ONLINE</span>
                                        </div>
                                        <div class="status-dot-v46"></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- BLOCK 2: CCO -->
                        <div class="v44-block" style="flex:0.8;">
                            <div class="v44-b-title">CCO</div>
                            <div class="v44-b-body cco-integrator">
                                <svg viewBox="0 0 100 100" class="v44-hub-svg">
                                    <defs>
                                        <pattern id="gridCCO" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,255,204,0.15)" stroke-width="0.5"/>
                                        </pattern>
                                    </defs>
                                    <circle cx="50" cy="50" r="38" fill="url(#gridCCO)" stroke="#00ffcc" stroke-width="1.5" class="v46-hub-core" />
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="#fff" stroke-width="0.5" opacity="0.3" stroke-dasharray="2,2" />
                                    <text x="50" y="54" text-anchor="middle" class="v44-hub-lbl" style="font-size:12px; fill:#fff; font-weight:900;">CCO</text>
                                </svg>
                            </div>
                        </div>

                        <!-- BLOCK 3: BIM -->
                        <div class="v44-block" style="flex:0.8;">
                            <div class="v44-b-title">BIM</div>
                            <div class="v44-b-body bim-processor">
                                <svg viewBox="0 0 100 100" class="v44-hub-svg">
                                    <circle cx="50" cy="50" r="38" fill="url(#gridCCO)" stroke="#00ffcc" stroke-width="1.5" class="v46-hub-core" />
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="#fff" stroke-width="0.5" opacity="0.3" stroke-dasharray="2,2" />
                                    <text x="50" y="54" text-anchor="middle" class="v44-hub-lbl" style="font-size:12px; fill:#fff; font-weight:900;">BIM</text>
                                </svg>
                            </div>
                        </div>

                        <!-- BLOCK 4: GEMELO DIGITAL -->
                        <div class="v44-block" style="flex:2.8; overflow:hidden;">
                            <div class="v44-b-title">Gemelo Digital Vía inteligentes</div>
                            <div class="v44-b-body gemelo-infra-holo">
                                <svg viewBox="0 0 400 300" id="gemelo-svg-v45" style="width:100%; height:100%;">
                                    <defs>
                                        <filter id="holoGlowV47">
                                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                        <linearGradient id="holoBase" x1="0" y1="1" x2="0" y2="0">
                                            <stop offset="0%" stop-color="rgba(0,255,204,0.4)"/>
                                            <stop offset="100%" stop-color="rgba(0,255,204,0)"/>
                                        </linearGradient>
                                    </defs>
                                    
                                    <!-- HOLOGRAPHIC PROJECTION BASE -->
                                    <ellipse cx="200" cy="240" rx="140" ry="20" fill="url(#holoBase)" opacity="0.5" />

                                    <!-- DETAILED CABLE-STAYED BRIDGE (HOLOGRAPHIC) -->
                                    <g class="v45-bridge-hologram" style="filter:url(#holoGlowV47)">
                                        <!-- Roadbed -->
                                        <path d="M40,200 L120,100 L280,100 L360,200 Z" fill="none" stroke="#00ffcc" stroke-width="1.8" opacity="0.7" />
                                        
                                        <!-- Main Towers (Pylons) -->
                                        <g class="pylons">
                                            <path d="M140,110 L140,40 M260,110 L260,40" stroke="#00ffcc" stroke-width="4" opacity="0.95" />
                                        </g>

                                        <!-- Cables (Stay cables) -->
                                        <g class="cables" stroke="#00ffcc" stroke-width="1" opacity="0.6">
                                            <path d="M140,45 L60,200 M140,55 L80,200 M140,65 L100,200" />
                                            <path d="M140,45 L220,100 M140,55 L200,100 M140,65 L180,100" />
                                            <path d="M260,45 L180,100 M260,55 L200,100 M260,65 L220,100" />
                                            <path d="M260,45 L340,200 M260,55 L320,200 M260,65 L300,200" />
                                        </g>
                                    </g>

                                    <!-- SCANNING UI WAVE -->
                                    <rect x="0" y="0" width="400" height="300" fill="url(#scanV44)" class="scan-wave-v45" />

                                    <!-- SYNC HUB (HOLOGRAPHIC) -->
                                    <g id="v45-target-node" class="hologram-sync">
                                        <circle cx="200" cy="100" r="14" fill="none" stroke="#fff" stroke-width="2" />
                                        <text x="200" y="104" text-anchor="middle" style="fill:#fff; font-size:7px; font-weight:900; letter-spacing:1px">SYNC</text>
                                        <circle cx="200" cy="100" r="20" fill="none" stroke="#00ffcc" stroke-width="1" opacity="0.5">
                                            <animate attributeName="r" values="14;35" dur="1s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
                                        </circle>
                                    </g>
                                </svg>
                            </div>
                        </div>

                        <!-- STANDARDIZED DASHBOARD PANEL (RIGHT) -->
                        <div class="trans-table-col" style="flex:1.5; gap:15px;">
                            ${transLevels.map(lvl => `
                                <div class="data-card stage-anim" style="padding:15px; background:rgba(15,23,42,0.6);">
                                    <div class="card-header" style="margin-bottom:8px;">
                                        <span class="card-code" style="background:rgba(0,255,204,0.1); color:#00ffcc;">INFRA-CORE</span>
                                        <span class="card-icon material-symbols-outlined" style="color:#00ffcc; font-size:18px;">${lvl.ico}</span>
                                    </div>
                                    <div class="card-title" style="font-size:11px; font-weight:900; color:#fff !important; text-transform:uppercase;">${lvl.lbl}</div>
                                    <div class="card-desc" style="font-size:10.5px; color:#cbd5e1 !important; line-height:1.4;">${lvl.v}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>`;
            
            if(window.its_trans_timer) clearInterval(window.its_trans_timer);
            window.its_trans_timer = setInterval(() => {
                if(activeAuditSection !== 'trans') return clearInterval(window.its_trans_timer);
                window.HL_TRANS_PIPELINE_V44();
            }, 4000);

            window.HL_TRANS_PIPELINE_V44 = () => {
                const src = document.querySelector('.v44-src'); 
                const cco = document.querySelector('.cco-integrator svg');
                const bim = document.querySelector('.bim-processor svg');
                const gem = document.getElementById('v45-target-node');
                const container = document.getElementById('synapse-container');
                if(!src || !cco || !bim || !gem || !container) return;

                const cRect = container.getBoundingClientRect();
                const refs = [src, cco, bim, gem].map(el => el.getBoundingClientRect());

                const drawBolt = (r1, r2, callback) => {
                    const bolt = document.createElement('div');
                    bolt.className = 'v45-bolt';
                    const x1 = r1.left + r1.width/2 - cRect.left;
                    const y1 = r1.top + r1.height/2 - cRect.top;
                    const x2 = r2.left + r2.width/2 - cRect.left;
                    const y2 = r2.top + r2.height/2 - cRect.top;
                    
                    const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
                    const angle = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI;

                    bolt.style.cssText = `position:absolute; width:${dist}px; height:2px; left:${x1}px; top:${y1}px; transform-origin: 0 50%; transform: rotate(${angle}deg); z-index: 1000; opacity:0;`;
                    container.appendChild(bolt);

                    bolt.animate([
                        { opacity: 0, background: '#fff', transform: `rotate(${angle}deg) scaleX(0)`, boxShadow: '0 0 15px #fff' },
                        { opacity: 1, background: '#fff', transform: `rotate(${angle}deg) scaleX(1)`, offset: 0.1, boxShadow: '0 0 20px #fff' },
                        { opacity: 0.8, background: '#00ffcc', transform: `rotate(${angle}deg) scaleX(1)`, offset: 0.7, boxShadow: '0 0 15px #00ffcc' },
                        { opacity: 0, background: '#00ffcc', transform: `rotate(${angle}deg) scaleX(1.1)`, offset: 1, boxShadow: '0 0 10px #00ffcc' }
                    ], { duration: 450, easing: 'ease-out' }).onfinish = () => {
                        bolt.remove();
                        if(callback) callback();
                        // Spark effect
                        const spark = document.createElement('div');
                        spark.style.cssText = `position:absolute; left:${x2}px; top:${y2}px; width:45px; height:45px; border:3px solid #fff; border-radius:50%; transform: translate(-50%, -50%); pointer-events:none; box-shadow: 0 0 20px #00ffcc;`;
                        container.appendChild(spark);
                        spark.animate([{transform:'translate(-50%,-50%) scale(0)', opacity:1}, {transform:'translate(-50%,-50%) scale(1.8)', opacity:0}], 350).onfinish = () => spark.remove();
                    };
                };

                // Sequence: 1->2, then 2->3, then 3->4
                drawBolt(refs[0], refs[1], () => {
                    drawBolt(refs[1], refs[2], () => {
                        drawBolt(refs[2], refs[3], null);
                    });
                });
            };
            break;

        case 'alertas':
            html = `
                <div class="focus-container">
                    ${R.mkHeader(sectionId, 'ALERTAS DEL SISTEMA', 'Diagnóstico preventivo.')}
                    <div class="bp-grid-v4">
                        ${(e.alertas || []).map(a => `<div class="alert-g-item">${DOMService.safeHTML(a)}</div>`).join('')}
                    </div>
                </div>`;
            break;

        case 'kpi':
            html = `
                <div class="focus-container">
                    ${R.mkHeader(sectionId, 'INDICADORES DE DESEMPEÑO KPI', 'Indicadores de desempeño.')}
                    <div class="bp-grid-v4">
                        ${(e.kpis || []).map(k => {
                            const idx = k.indexOf(':');
                            const l = idx >= 0 ? k.substring(0, idx) : k;
                            const v = idx >= 0 ? k.substring(idx + 1) : '';
                            return `<div class="hud-kpi">
                                        <span class="hud-kl">${DOMService.safeHTML(l.trim())}</span>
                                        <span class="hud-kv" style="color:var(--accent)">${DOMService.safeHTML(v.trim())}</span>
                                    </div>`;
                        }).join('')}
                    </div>
                </div>`;
            break;

        case 'usuario':
            html = `
                <div class="focus-container">
                    ${R.mkHeader(sectionId, 'INFORMACIÓN AL USUARIO', 'Canales y publicación de información.')}
                    <div class="bp-grid-v4">
                        ${e.publicacion ? R.mkCard('PUB', 'Publicación', e.publicacion) : ''}
                        ${e.canales ? R.mkCard('CAN', 'Canales', e.canales) : ''}
                    </div>
                </div>`;
            break;
            
        case 'cont':
            html = `
                <div class="focus-container">
                    ${R.mkHeader(sectionId, 'CONTINGENCIA', 'Procedimientos ante fallas.')}
                    <ul class="hud-list">${(e.contingencia || []).map(c => `<li>${DOMService.safeHTML(c)}</li>`).join('')}</ul>
                </div>`;
            break;
            
        case 'acept':
            html = `
                <div class="focus-container">
                    ${R.mkHeader(sectionId, 'CRITERIO DE ACEPTACIÓN', 'Criterios para validar la funcionalidad.')}
                    <ul class="hud-list">${(e.criterios || []).map(c => `<li>${DOMService.safeHTML(c)}</li>`).join('')}</ul>
                </div>`;
            break;
            
        case 'evol':
            html = `
                <div class="focus-container">
                    ${R.mkHeader(sectionId, 'EVOLUCIÓN TECNOLÓGICA', 'Mapeo de tecnologías futuras.')}
                    <ul class="hud-list">${(e.evolucion || []).map(c => `<li>${DOMService.safeHTML(c)}</li>`).join('')}</ul>
                </div>`;
            break;

        default:
            html = `<div class="hud-panel">Sección [${DOMService.safeHTML(sectionId)}] en proceso de Hardening...</div>`;
    }

    DOMService.update(stage, html);
}

// ── NAVIGATION & FILTERS ──

window.filterTable = (gridId, q) => {
    const lq = q.toLowerCase();
    let vis = 0;
    document.querySelectorAll(`#${gridId} .data-card`).forEach(card => {
        const match = !lq || card.textContent.toLowerCase().includes(lq);
        card.style.display = match ? '' : 'none';
        if (match) vis++;
    });
    const el = document.getElementById(gridId.replace('-grid', '-cnt'));
    if (el) el.textContent = `${vis} registros`;
};

window.go = (id) => {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const sec = document.getElementById(`sec-${id}`);
    if (sec) sec.classList.add('active');
    window.scrollTo(0, 0);
};

window.toggleNav = () => {
    document.querySelector('.nav').classList.toggle('active');
    document.querySelector('.nav-overlay').classList.toggle('active');
};

window.filterSE = (cat, btn) => {
    document.querySelectorAll('#se-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const grid = document.getElementById('se-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.data-card');
    let vis = 0;

    cards.forEach(card => {
        const tagEl = card.querySelector('.card-tag');
        if (!tagEl) return;
        const tag = tagEl.textContent;
        let show = false;
        if (cat === 'all') show = true;
        else if (cat === 'PMITS') show = tag.includes('PMITS');
        else if (cat === 'ISO') show = tag.includes('ISO');
        
        card.style.display = show ? '' : 'none';
        if (show) vis++;
    });
    
    const el = document.getElementById('se-cnt');
    if (el) el.textContent = `${vis} registros`;
};

window.animCnt = () => {
    document.querySelectorAll('.cnt-up').forEach(el => {
        const t = parseInt(el.dataset.t);
        let s = 0;
        const interval = setInterval(() => {
            s += 5;
            el.textContent = Math.min(t, Math.round(t * (s / 100)));
            if (s >= 100) clearInterval(interval);
        }, 30);
    });
};


window.showFunctionalAnim = function(id) {
    const config = ANIMATIONS[id];
    if (!config) return;

    let compTitle = id;
    if (window.PLATFORM_DATA) {
        const allComps = [...(window.PLATFORM_DATA.campo||[]), ...(window.PLATFORM_DATA.operativo||[]), ...(window.PLATFORM_DATA.tecnico||[]), ...(window.PLATFORM_DATA.gestion||[])];
        const match = allComps.find(c => (c.codigo === id || c.id === id || c.cod === id));
        if (match) compTitle = `${id} - ${match.nombre || match.name}`;
    }

    const modal = document.getElementById('anim-modal');
    const title = document.getElementById('anim-title');
    const stage = document.getElementById('anim-stage');

    title.textContent = `Simulación 3D - ${compTitle}`;
    modal.classList.add('active');
    
    if (config.is3D) {
        currentSimulator = new ThreeEngine(config.steps, stage, id);
        currentSimulator.goToStep(0);
    } else {
        startAnimSequence(config.steps, stage);
    }
};

let currentSimulator = null; 

window.changeStep = function(dir) {
    if (currentSimulator) {
        let newIdx = currentSimulator.currentStepIdx + dir;
        if (newIdx >= 0 && newIdx < currentSimulator.steps.length) {
            currentSimulator.goToStep(newIdx);
        }
    }
};

window.closeAnim = function() {
    const modal = document.getElementById('anim-modal');
    if (modal) {
        modal.classList.remove('active');
        if (currentSimulator && currentSimulator.isAutoplay) {
             currentSimulator.toggleAutoplay(); 
        }
        currentSimulator = null;
    }
};

function startAnimSequence(steps, container) {
    const html = `<div class="anim-step-box">
        <div id="svg-stage" class="svg-container"></div>
        <div id="anim-txt" class="anim-txt"></div>
        <div id="anim-meta" class="anim-meta"></div>
    </div>`;
    DOMService.update(container, html);
}
