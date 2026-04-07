/**
 * App Logic for ITS Chía-Girardot
 * High-performance modular transformation
 */

document.addEventListener('DOMContentLoaded', async () => {
    // ── INITIALIZE DATABASE ──
    try {
        await itsDb.init();
        await initialRender();
    } catch (err) {
        console.error('Failed to initialize database:', err);
        // Fallback or error UI could go here
    }
});

/* ══════════════════════════════════════════════════════
   RENDER INITIALIZATION
   ══════════════════════════════════════════════════════ */

async function initialRender() {
    const eovs = await itsDb.getAll('eov');
    const doms = await itsDb.getAll('dom');
    const ass = await itsDb.getAll('as');
    const ses = await itsDb.getAll('se');
    const subs = await itsDb.getAll('sub');
    const fns = await itsDb.getAll('fn');
    const ccs = await itsDb.getAll('cc');
    const nos = await itsDb.getAll('no');

    const naturalSort = (arr) => arr.sort((a, b) => String(a.cod || a.id || '').localeCompare(String(b.cod || b.id || ''), undefined, {numeric: true, sensitivity: 'base'}));
    [eovs, doms, ass, ses, subs, fns, ccs, nos].forEach(naturalSort);

    // Update navigation badge for NO
    const badgeNo = document.getElementById('nav-no-badge');
    if (badgeNo) badgeNo.textContent = nos.length;

    // Nav EOV buttons
    const navEovGrid = document.getElementById('nav-eov-grid');
    if (navEovGrid) {
        navEovGrid.innerHTML = '';
        eovs.forEach(e => {
            const b = document.createElement('div');
            b.className = 'nav-eov-btn';
            b.id = 'nav-' + e.id;
            b.textContent = e.id.replace('EOV-', '');
            b.onclick = () => showEOV(e.id);
            navEovGrid.appendChild(b);
        });
    }

    // EOV cards in list view
    const eovCards = document.getElementById('eov-cards-home');
    if (eovCards) {
        eovCards.innerHTML = '';
        eovs.forEach(e => {
            const tc = e.type;
            const d = document.createElement('div');
            d.className = `eov-card ${tc === 'p' ? 'tp' : tc === 'c' ? 'tc' : 'tf'}`;
            d.onclick = () => showEOV(e.id);
            d.innerHTML = `<div class="ec-num">${e.id}</div>
                <span class="ec-ico">${e.ico}</span>
                <h4>${e.name}</h4>
                <span class="ec-tag ${tc === 'p' ? 'tp' : tc === 'c' ? 'tc' : 'tf'}">${tc === 'p' ? 'Prioritario' : tc === 'c' ? 'Complementario' : 'Futuro'}</span>`;
            eovCards.appendChild(d);
        });
    }

    // Icon Mapping for Grid Cards
    const getIcon = (txt, code) => {
        const t = (txt + ' ' + code).toLowerCase();
        if (t.includes('cctv') || t.includes('video')) return '📹';
        if (t.includes('wim') || t.includes('pesaje')) return '⚖️';
        if (t.includes('sos') || t.includes('postes')) return '🆘';
        if (t.includes('vms') || t.includes('paneles')) return '📟';
        if (t.includes('alpr') || t.includes('placas')) return '🆔';
        if (t.includes('radar') || t.includes('velocidad')) return '📡';
        if (t.includes('ess') || t.includes('clima')) return '🌡️';
        if (t.includes('rsu') || t.includes('conectividad')) return '📶';
        if (t.includes('daim') || t.includes('incidentes')) return '🚨';
        if (t.includes('fibra') || t.includes('comunic')) return '🧵';
        if (t.includes('centro') || t.includes('control')) return '🏢';
        if (t.includes('pago') || t.includes('peaje')) return '💳';
        if (t.includes('iluminac')) return '💡';
        if (t.includes('asistenc')) return '🚑';
        if (t.includes('segurid')) return '🛡️';
        if (t.includes('usuario')) return '👤';
        return '📑';
    };

    // Modern Grid Builder (Replaces buildTable)
    window.buildGrid = function(containerId, data, type) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        
        data.forEach(row => {
            const card = document.createElement('div');
            card.className = 'data-card';
            
            // Logic based on Matrix Type
            let code = row[0] || 'N/A';
            let title = row[1] || 'N/A';
            let desc = row[2] || 'N/A';
            let tag = type || 'DATO';
            
            if (type === 'SUB') {
                const sigla = row[1] || '';
                title = `${row[2]} <span style="color:var(--accent2); font-size:12px; margin-left:6px">[${sigla}]</span>`;
                desc = row[3];
                tag = `Sigla: ${sigla}`;
            } else if (type === 'CC') {
                const sigla = row[1] || '';
                title = `${row[2]} <span style="color:var(--accent2); font-size:12px; margin-left:6px">[${sigla}]</span>`;
                desc = row[3];
                tag = `Sigla: ${sigla}`;
            } else if (type === 'SE') {
                const cat = row[2] || '';
                tag = `Categoría: ${cat}`;
            }

            card.onclick = () => {
                if (type === 'FN' || type === 'CC') {
                    showReverseLookup(code, title.split('<')[0].trim(), type);
                }
            };

            card.innerHTML = `
                <div class="card-header">
                    <span class="card-code">${code}</span>
                    <span class="card-icon">${getIcon(title + ' ' + desc, code)}</span>
                </div>
                <div class="card-title">${title}</div>
                <div class="card-desc">${desc}</div>
                <div class="card-footer" style="justify-content: flex-start;">
                    <span class="card-tag">${tag}</span>
                </div>
            `;
            container.appendChild(card);
        });

        // Update counts
        const cntId = containerId.replace('-body', '-cnt').replace('-grid', '-cnt');
        const el = document.getElementById(cntId);
        if (el) el.textContent = `${data.length} registros`;
    };

    // Initial Database Load
    buildGrid('no-grid', nos.map(r => [r.cod, r.name, r.desc]), 'NO');
    buildGrid('dom-grid', doms.map(r => [r.cod, r.name, r.desc]), 'DOM');
    buildGrid('as-grid', ass.map(r => [r.cod, r.name, r.desc]), 'AS');
    buildGrid('se-grid', ses.map(r => [r.cod, r.name, r.cat]), 'SE');
    buildGrid('sub-grid', subs.map(r => [r.cod, r.sigla, r.name, r.desc]), 'SUB');
    buildGrid('fn-grid', fns.map(r => [r.id || r.cod, r.name, r.desc]), 'FN');
    buildGrid('cc-grid', ccs.map(r => [r.id || r.cod, r.sigla, r.name, r.cap]), 'CC');

    animCnt();
}

/* ══════════════════════════════════════════════════════
   CORE FUNCTIONS
   ══════════════════════════════════════════════════════ */

// ARCHITECT COCKPIT V5.1 - ENGINEERING AUDIT MODE
let currentAuditEov = null;
let activeAuditSection = 'ref';

function renderAuditSidebar() {
    const categories = [
        { id: 'ref', num: '01', lbl: 'INFORMACIÓN DE REFERENCIA', icon: '📝' },
        { id: 'flujo', num: '02', lbl: 'FLUJO SISTEMÁTICO', icon: '🪜' },
        { id: 'trans', num: '03', lbl: 'INTERACCIÓN TRANSACCIONAL', icon: '⚡' },
        { id: 'alertas', num: '04', lbl: 'ALERTAS DEL SISTEMA', icon: '🚨' },
        { id: 'usuario', num: '05', lbl: 'INFORMACIÓN AL USUARIO', icon: '👤' },
        { id: 'cont', num: '06', lbl: 'CONTINGENCIA', icon: '🛡️' },
        { id: 'acept', num: '07', lbl: 'CRITERIOS DE ACEPTACIÓN DE REFERENCIA', icon: '✅' },
        { id: 'evol', num: '08', lbl: 'EVOLUCIÓN TECNOLÓGICA', icon: '🚀' },
        { id: 'kpi', num: '09', lbl: 'INDICADORES DE DESEMPEÑO (KPI)', icon: '📊' }
    ];

    const sidebar = document.getElementById('eov-quicknav');
    if (!sidebar) return;

    sidebar.className = 'audit-side';
    sidebar.innerHTML = `
        <div class="as-header">
            <div class="as-title">Audit Management</div>
        </div>
        <div class="as-menu">
            ${categories.map(c => `
                <div class="as-item ${c.id === activeAuditSection ? 'active' : ''}" 
                     onclick="switchAuditSection('${c.id}')">
                    <div class="as-num">${c.num}</div>
                    <div class="as-lbl">${c.lbl}</div>
                    <div style="margin-left:auto; opacity:0.6">${c.icon}</div>
                </div>
            `).join('')}
        </div>
        <div style="padding:20px; border-top:1px solid rgba(255,255,255,0.06)">
             <div onclick="go('eov-list')" class="back-btn" style="margin:0; width:100%; text-align:center">✕ VISTA GENERAL</div>
        </div>
    `;
}

async function showEOV(id) {
    let rawEov = await itsDb.get('eov', id);
    if (!rawEov) return;
    
    currentAuditEov = await itsDb.queryRelationships(rawEov);
    activeAuditSection = 'ref'; // Reset to default on new EOV
    
    // Update Sidebar
    renderAuditSidebar();
    
    // Initial Section
    switchAuditSection('ref');
    
    go('eov-detail');
}

async function switchAuditSection(sectionId) {
    activeAuditSection = sectionId;
    renderAuditSidebar();
    
    const e = currentAuditEov;
    const stage = document.getElementById('eov-d-body');
    if (!stage) return;

    let content = '';

    // Helpers
    const mkHeader = (title, subtitle) => `
        <header class="hud-header" style="margin-bottom:40px">
            <div>
                <span class="hud-ey">AUDIT_SESSION // SECTION_${sectionId.toUpperCase()}</span>
                <h1 class="hud-h1">${title}</h1>
                <p style="color:var(--muted); margin-top:10px; font-weight:600">${subtitle}</p>
            </div>
            <div class="hud-r">
                <div class="hud-kpi">
                    <span class="hud-kv">${e.id}</span>
                    <span class="hud-kl">Active Scenario</span>
                </div>
            </div>
        </header>`;

    const mkCard = (idTag, title, content) => `
        <div class="bp-card-v4">
            <span class="card-id">${idTag}</span>
            <div class="card-tt">${title}</div>
            <div class="card-tx">${content || '[PENDIENTE DE VINCULACIÓN]'}</div>
        </div>`;

    switch(sectionId) {
        case 'ref':
            content = `
                ${mkHeader('Información de Referencia', 'Contextualización y núcleo operativo del escenario.')}
                <div class="bp-grid-v4">
                    ${mkCard('CONTEXTO', 'Entorno del Escenario', e.ctx)}
                    ${mkCard('MOTIVACIÓN', 'Necesidad del Negocio', e.mot)}
                    ${mkCard('JUSTIFICACIÓN', 'Sustento Técnico', e.just)}
                    ${mkCard('QUÉ ES', 'Definición Funcional', e.que)}
                    ${mkCard('PARA QUÉ', 'Propósito del Servicio', e.para)}
                    ${mkCard('BENEFICIO', 'Impacto en el Corredor', e.beneficio)}
                    ${mkCard('ACTORES', 'Stakeholders', e.actores)}
                    ${mkCard('DESPLIEGUE', 'Estrategia', e.desp)}
                </div>`;
            break;

        case 'flujo':
            content = `
                ${mkHeader('Flujo Sistemático', 'Jerarquía de arquitectura en 7 niveles de integración.')}
                <div class="hud-panel">
                    <div class="ladder-v4">
                        ${[
                            { l: 'Dominio ITS', v: e._dominio, i: '🌐' },
                            { l: 'Area de Servicio', v: e._area, i: '📍' },
                            { l: 'Subsistema', v: e._sub, i: '⚙️' },
                            { l: 'Servicio Estratégico', v: e._se, i: '🛡️' },
                            { l: 'Función Técnica', v: e._fn, i: '🧠' },
                            { l: 'Componente de Campo', v: e._cc, i: '📡' },
                            { l: 'Normativa', v: e.marco, i: '⚖️' }
                        ].map((lvl, idx) => `
                            <div class="ladder-v4-step">
                                <div class="ladder-v4-num">${idx + 1}</div>
                                <div class="ladder-v4-lbl">${lvl.l}</div>
                                <div class="ladder-v4-val">${lvl.v || '[DATO TÉCNICO NO ENCONTRADO]'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
            break;

        case 'trans':
            content = `
                ${mkHeader('Interacción Transaccional', 'Visualización de flujos ARC-IT y capacidad digital.')}
                <div class="blueprint-panel" style="margin-bottom:30px">
                    <div class="blueprint-flow">
                        ${['🏢 E1: Estratégico', '📋 E2: Operacional', '🧠 E3: Lógico', '⚙️ E4: Sistémico', '📡 E5: Físico'].map((n, i) => `
                            <div class="blueprint-node">
                                <div class="bp-icon" style="border-color:var(--accent)">${n.split(' ')[0]}</div>
                                <div class="bp-lbl">${n.split(' ')[1]}</div>
                                <div class="bp-val" style="font-size:11px">${e['e' + (i + 1)] || '...'}</div>
                                ${i < 4 ? '<div class="bp-line" style="opacity:1; background:var(--accent); animation: datapulse 2s infinite"></div>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="bp-grid-v4">
                    ${mkCard('REFLEJO DIGITAL', 'Sincronización CCO', e.reflejo)}
                    ${mkCard('CONCIENCIA', 'Fidelidad Twin', e.conciencia)}
                    ${mkCard('ESTADIO', 'Madurez Proceso', e.estadio)}
                    ${mkCard('CANALES', 'Distribución Datos', e.canales)}
                </div>`;
            break;

        case 'alertas':
            content = `
                ${mkHeader('Alertas del Sistema', 'Diagnóstico preventivo y notificaciones de estado.')}
                <div class="cg-grid">
                    <div class="hud-panel" style="grid-column: span 2">
                        <div class="cg-title">Monitor de Estados Pulsantes</div>
                        ${(e.alertas || []).map(a => `
                            <div class="alert-g-item" style="animation: hudIn 0.5s ease backwards">
                                <div class="alert-g-ico">🚨</div>
                                <div class="alert-g-txt">${a}</div>
                            </div>
                        `).join('') || '<div class="no-data">Sin alertas críticas detectadas.</div>'}
                    </div>
                    <div class="cg-panel">
                        <div class="cg-title">Protocolos Activos</div>
                        <p style="font-size:12px; opacity:0.6; margin-bottom:15px">Notificación automática hacia centro de control.</p>
                        <div style="width:100%; height:150px; background:rgba(239, 68, 68, 0.1); border-radius:100%; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden">
                             <div style="width:80%; height:80%; border:2px dashed rgba(239, 68, 68, 0.3); border-radius:100%; animation: radar 4s linear infinite"></div>
                             <div style="font-size:24px">⚠️</div>
                        </div>
                    </div>
                </div>`;
            break;

        case 'usuario':
            content = `
                ${mkHeader('Información al Usuario', 'Canales de comunicación y beneficios directos al ciudadano.')}
                <div class="bp-grid-v4">
                    ${mkCard('OBJETIVO USUARIO', 'Propósito del Escenario', e.para)}
                    ${mkCard('CANALES DIGITALES', 'Medios de Información', e.canales)}
                    ${mkCard('BENEFICIO SOCIAL', 'Impacto en Seguridad', e.beneficio)}
                    ${mkCard('STAKEHOLDERS', 'Actores Clave', e.actores)}
                </div>`;
            break;

        case 'cont':
            content = `
                ${mkHeader('Contingencia', 'Procedimientos de respaldo ante fallos y desastres.')}
                <div class="hud-panel">
                    <div class="cg-title">Plan de Respuesta Inmediata</div>
                    <div class="bp-grid-v4">
                        ${(e.contingencia || []).map(c => `
                            <div class="bp-card-v4" style="border-left: 4px solid var(--accent)">
                                <div class="card-tt">Procedimiento</div>
                                <div class="card-tx">${c}</div>
                            </div>
                        `).join('') || '<div class="no-data">Continuidad garantizada por diseño tolerante a fallos.</div>'}
                    </div>
                </div>`;
            break;

        case 'acept':
            content = `
                ${mkHeader('Criterios de Aceptación', 'Requisitos base para la validación del escenario operativo.')}
                <div class="cg-panel" style="max-width:800px; margin:0 auto">
                    <div class="cg-title">Checklist de Conformidad Técnica</div>
                    ${(e.criterios || []).map(x => `
                        <div class="val-check" style="padding:15px; background:rgba(255,255,255,0.02); margin-bottom:10px; border-radius:10px">
                            <i>✓</i><div class="val-txt" style="font-size:14px; color:#fff">${x}</div>
                        </div>
                    `).join('') || '<div class="no-data">Pendiente definición de criterios.</div>'}
                </div>`;
            break;

        case 'evol':
            content = `
                ${mkHeader('Evolución Tecnológica', 'Hoja de ruta para la escalabilidad y modernización futura.')}
                <div class="bp-grid-v4">
                    ${(e.evolucion || []).map(ev => `
                        <div class="evol-g-item">
                            <div class="evol-g-ico">🚀</div>
                            <div class="evol-g-txt" style="font-size:14px; font-weight:600">${ev}</div>
                        </div>
                    `).join('') || '<div class="no-data">Escenario optimizado en versión actual.</div>'}
                </div>`;
            break;

        case 'kpi':
            content = `
                ${mkHeader('Indicadores de Desempeño (KPI)', 'Métricas de cobertura, fidelidad y eficiencia del sistema.')}
                <div class="cg-grid">
                    <div class="hud-kpi" style="height:250px; justify-content:center">
                        <span class="hud-kv" style="font-size:48px">${e.km || '306'}</span>
                        <span class="hud-kl" style="font-size:12px">Km Cobertura</span>
                    </div>
                    <div class="hud-kpi" style="height:250px; justify-content:center">
                        <span class="hud-kv" style="font-size:48px">100%</span>
                        <span class="hud-kl" style="font-size:12px">Fidelidad Datos</span>
                    </div>
                    <div class="hud-kpi" style="height:250px; justify-content:center">
                        <span class="hud-kv" style="font-size:48px">${e.type === 'p' ? 'A+' : 'A'}</span>
                        <span class="hud-kl" style="font-size:12px">Nivel Prioridad</span>
                    </div>
                </div>`;
            break;
    }

    stage.innerHTML = `<div class="stage-anim">${content}</div>`;
}

// Note: buildTable was replaced by buildGrid for the Modern Card interface.

// Filter Grid Cards
window.filterTable = function(gridId, q) {
    const lq = q.toLowerCase();
    let vis = 0;
    document.querySelectorAll('#' + gridId + ' .data-card').forEach(card => {
        const m = lq === '' || card.textContent.toLowerCase().includes(lq);
        card.style.display = m ? '' : 'none';
        if (m) vis++;
    });
    const cntId = gridId.replace('-grid', '-cnt');
    const el = document.getElementById(cntId);
    if (el) el.textContent = vis + ' registros';
};

// Filter SE by type (Modern)
window.filterSE = function(type, btn) {
    document.querySelectorAll('#se-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    let vis = 0;
    document.querySelectorAll('#se-grid .data-card').forEach(card => {
        const cat = card.querySelector('.card-tag')?.textContent || '';
        const m = type === 'all' || (type === 'PMITS' && cat.includes('PMITS')) || (type === 'ISO' && cat.includes('ISO'));
        card.style.display = m ? '' : 'none';
        if (m) vis++;
    });
    const cntEl = document.getElementById('se-cnt');
    if (cntEl) cntEl.textContent = vis + ' registros';
};

// Toggle Nav
window.toggleNav = function() {
    document.body.classList.toggle('nav-open');
}

// Navigate
window.go = function(id, h) {
    document.body.classList.remove('nav-open');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const sec = document.getElementById('sec-' + id);
    if (sec) sec.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (id === 'home') {
        const homeNav = document.querySelector('.nav-item');
        if (homeNav) homeNav.classList.add('active');
    }
    
    const secMap = {'eov-list': 'eov-list', 'mat-no': 'mat-no', 'mat-dom': 'mat-dom', 'mat-as': 'mat-as', 'mat-se': 'mat-se', 'mat-sub': 'mat-sub', 'mat-fn': 'mat-fn', 'mat-cc': 'mat-cc'};
    if (secMap[id]) {
        document.querySelectorAll('.nav-item').forEach(n => {
            if (n.getAttribute('onclick')?.includes("'" + id + "'")) n.classList.add('active');
        });
    }
    
    if (!h && sec) {
        const inp = sec.querySelector('.s-inp');
        if (inp) { inp.value = ''; }
        sec.querySelectorAll('tbody tr').forEach(r => {
            r.style.display = '';
            r.classList.remove('row-highlight');
        });
        const tbl = sec.querySelector('table');
        if (tbl) {
            const cntId = tbl.id.split('-')[0] + '-cnt';
            const cntEl = document.getElementById(cntId);
            const total = sec.querySelectorAll('tbody tr').length;
            if (cntEl && total) cntEl.textContent = total + ' registros';
        }
    }
    
    window.scrollTo(0, 0);
    if (id === 'home') animCnt();
};

// goFilter
window.goFilter = function(secId, tblId, rawText) {
    if (!rawText || rawText.trim() === '') return;
    const codePattern = /\b(DOM-\d+|AS-\d+|SE-ITS-\d+|SUB-\d+|F-\d+|CC-\d+)\b/gi;
    const codes = rawText.match(codePattern) || [];
    go(secId, true);
    
    setTimeout(() => {
        const rows = document.querySelectorAll('#' + tblId + ' tbody tr');
        let vis = 0;
        if (codes.length > 0) {
            rows.forEach(r => {
                const cellCode = (r.cells[0]?.textContent || '').trim().toUpperCase();
                const match = codes.some(c => cellCode === c.toUpperCase());
                r.style.display = match ? '' : 'none';
                if (match) { vis++; r.classList.add('row-highlight'); }
            });
        }
        const inp = document.querySelector('#sec-' + secId + ' .s-inp');
        if (inp) inp.value = codes.length > 0 ? codes.join(' / ') : rawText.substring(0, 30);
        const cntId = tblId.split('-')[0] + '-cnt';
        const cntEl = document.getElementById(cntId);
        if (cntEl) cntEl.textContent = vis + ' de ' + rows.length + ' registros (filtrado por EOV)';
    }, 150);
};

// Reverse Lookup
window.closeModal = function() {
    const modal = document.getElementById('modal-rev');
    if (modal) modal.classList.remove('active');
}

async function showReverseLookup(code, name, type) {
    const eovs = await itsDb.getAll('eov');
    const results = eovs.filter(e => {
        const searchArea = type === 'FN' ? e.fn : e.cc;
        return searchArea.includes(code);
    });
    
    const titleEl = document.getElementById('rev-title');
    if (titleEl) titleEl.textContent = `${code} en Escenarios EOV`;
    
    const bodyEl = document.getElementById('rev-body');
    if (bodyEl) {
        bodyEl.innerHTML = results.length > 0 
            ? results.map(e => `
                <div class="rel-eov" onclick="closeModal(); showEOV('${e.id}')">
                    <span class="rel-ico">${e.ico}</span>
                    <span class="rel-name">${e.id}: ${e.name}</span>
                    <span class="rel-arr">→</span>
                </div>`).join('')
            : `<div style="text-align:center; padding:20px; color:var(--muted)">No se encontraron escenarios vinculados directamente en el mapeo técnico.</div>`;
    }
    const modal = document.getElementById('modal-rev');
    if (modal) modal.classList.add('active');
}

// Export
window.exportEOVs = async function() {
    const eovs = await itsDb.getAll('eov');
    const headers = ['ID', 'Nombre', 'Tipo', 'Para', 'Donde', 'Cuando', 'Justificación', 'Despliegue', 'Beneficio', 'Actores', 'Dominio', 'Área', 'Subsistema', 'Servicio', 'Función', 'Campo', 'Std', 'Cyber', 'E1', 'E2', 'E3', 'E4', 'E5'];
    const rows = eovs.map(e => [
        e.id, e.name, e.type, e.para, e.donde, e.cuando, e.just, e.desp, e.beneficio, e.actores, e.dominio, e.area, e.sub, e.se, e.fn, e.cc, e.std, e.cyber, e.e1, e.e2, e.e3, e.e4, e.e5
    ]);
    let csv = "\ufeff" + headers.join(';') + "\n";
    rows.forEach(r => {
        csv += r.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(';') + "\n";
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "ITS_CHIA_GIRARDOT_CONSOLIDADO_EOV.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Count Animation
window.animCnt = function() {
    document.querySelectorAll('.cnt-up').forEach(el => {
        const t = parseInt(el.dataset.t);
        let s = 0;
        const st = 40;
        const ti = setInterval(() => {
            s++;
            el.textContent = Math.round(t * (s / st));
            if (s >= st) {
                el.textContent = t;
                clearInterval(ti);
            }
        }, 1000 / st);
    });
}

// Scroll Handler
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.top-nav');
    if (nav) {
        if (window.scrollY > 20) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    }
});
