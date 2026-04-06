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

    // Build Matriz tables
    buildTable('no-body', nos.map(r => [r.cod, r.name, r.desc]), ['cod', 'name', 'desc'], 'no-cnt');
    buildTable('dom-body', doms.map(r => [r.cod, r.name, r.desc]), ['cod', 'name', 'desc'], 'dom-cnt');
    buildTable('as-body', ass.map(r => [r.cod, r.name, r.desc]), ['cod', 'name', 'desc'], 'as-cnt');
    buildTable('se-body', ses.map(r => [r.cod, r.name, r.cat]), ['cod', 'name', 'desc'], 'se-cnt');
    buildTable('sub-body', subs.map(r => [r.cod, r.sigla, r.name, r.fn, r.desc]), ['cod', 'name', 'name', 'desc', 'cap'], 'sub-cnt');
    buildTable('fn-body', fns.map(r => [r.cod, r.name, r.desc]), ['cod', 'name', 'desc'], 'fn-cnt', 'FN');
    buildTable('cc-body', ccs.map(r => [r.cod, r.name, r.name, r.cap]), ['cod', 'name', 'name', 'cap'], 'cc-cnt', 'CC');

    animCnt();
}

/* ══════════════════════════════════════════════════════
   CORE FUNCTIONS
   ══════════════════════════════════════════════════════ */

// EOV detail renderer
async function showEOV(id) {
    let rawEov = await itsDb.get('eov', id);
    if (!rawEov) return;
    
    // Enrich with database relationships
    const e = await itsDb.queryRelationships(rawEov);
    
    const typeLabel = e.type === 'p' ? 'Prioritario' : e.type === 'c' ? 'Complementario' : 'Futuro';
    const tclr = e.type === 'p' ? 'var(--accent)' : e.type === 'c' ? 'var(--green)' : 'var(--purple)';
    
    const titleEl = document.getElementById('eov-d-title');
    const subEl = document.getElementById('eov-d-sub');
    const bodyEl = document.getElementById('eov-d-body');
    
    if (titleEl) titleEl.innerHTML = `${e.ico} ${e.id} · ${e.name}`;
    if (subEl) subEl.innerHTML = `<span style="color:${tclr}; font-weight:700">${typeLabel}</span> · ${e.ctx || 'Escenario Operativo'}`;

    const mkRow = (k, v) => {
        const isMissing = !v || v === 'N/A' || v === 'N/A ' || (typeof v === 'string' && v.trim() === '');
        const val = isMissing ? `<span style="color:var(--red); font-style:italic; opacity:0.7">[PENDIENTE VALIDACIÓN]</span>` : v;
        return `<div class="eov-kv"><span class="ek">${k}</span><span class="ev">${val}</span></div>`;
    };
    const esc = (s) => (s || '').replace(/'/g, "\\'").replace(/\n/g, ' ');
    const mkMini = (items, cls) => (items || []).map((it, i) => `<div class="mini-card ${cls}"><div class="mc-lbl">${String(i + 1).padStart(2, '0')}</div><div class="mc-val">${it}</div></div>`).join('');
    const mkCheck = (items) => (items || []).map(it => `<div class="val-check"><i>✓</i><div class="val-txt">${it}</div></div>`).join('');

    const renderHierarchy7 = (e) => {
        const levels = [
            { l: 'Necesidades operaciones', v: e.ctx },
            { l: 'Dominio ITS', v: e._dominio, s: 'mat-dom', r: e.dominio },
            { l: 'Area de Servicio ITS', v: e._area, s: 'mat-as', r: e.area },
            { l: 'Subsistema ITS', v: e._sub, s: 'mat-sub', r: e.sub },
            { l: 'Servicio Estratégico ITS', v: e._se, s: 'mat-se', r: e.se },
            { l: 'Funciones Tecnica ITS', v: e._fn, s: 'mat-fn', r: e.fn },
            { l: 'Componentes de campo  ITS', v: e._cc, s: 'mat-cc', r: e.cc }
        ];
        return `<div class="ladder-wrap">
            ${levels.map((lvl, index) => `
                <div class="ladder-step" ${lvl.v && lvl.s && !String(lvl.v).includes('[PENDIENTE') ? `onclick="goFilter('${lvl.s}','${lvl.s.split('-')[1] + '-tbl'}','${esc(lvl.r)}'); event.stopPropagation()"` : ''}>
                    <div class="ladder-num">${index + 1}</div>
                    <div class="ladder-body">
                        <div class="ladder-label">${lvl.l}</div>
                        <div class="ladder-val" style="${(!lvl.v || lvl.v === 'N/A' || lvl.v === '') ? 'color:var(--red); font-style:italic; opacity:0.7' : ''}">
                            ${(lvl.v && lvl.v !== 'N/A' && lvl.v !== '') ? lvl.v : '[PENDIENTE VALIDACIÓN]'}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    };

    const bodyHtml = `
    <div onclick="go('eov-list')" class="back-btn">← Volver al Listado</div>
    <div class="eov-detail-grid">
        <div class="stack-l">
            <div class="eov-info-card glass">
                <h5>🏗️ Arquitectura ITS (Jerarquía de 7 Niveles)</h5>
                <p style="font-size:11px; color:var(--muted); margin-bottom:15px">Validación sistemática de la capacidad tecnológica desde la necesidad hasta el hardware.</p>
                ${renderHierarchy7(e)}
            </div>
            
            <div class="eov-info-card glass" style="margin-top:20px">
                <h5>🛡️ Soberanía, Interoperabilidad y Resiliencia</h5>
                <div class="sov-tag">Control Estatal Crítico</div>
                ${mkRow('Soberanía del Dato', e.cyber || '<span style="color:var(--red); font-style:italic">[PENDIENTE VALIDACIÓN]</span>')}
                ${mkRow('Interoperabilidad', e.std || '<span style="color:var(--red); font-style:italic">[PENDIENTE VALIDACIÓN]</span>')}
                <div style="margin-top:15px">
                    <h6 style="color:var(--accent2); font-size:10px; text-transform:uppercase; margin-bottom:8px">Protocolos de Contingencia</h6>
                    <div class="mini-grid">${mkMini(e.contingencia, 'cont-card')}</div>
                </div>
            </div>

            <div class="eov-info-card glass" style="margin-top:20px">
                <h5>📋 Definición y Justificación</h5>
                ${mkRow('Contexto', e.ctx)}${mkRow('Motivación', e.mot)}${mkRow('¿Qué es?', e.que)}
                ${mkRow('¿Para qué sirve?', e.para)}${mkRow('¿Dónde ocurre?', e.donde)}${mkRow('¿Cuándo ocurre?', e.cuando)}
                ${mkRow('Justificación Técnica', e.just)}${mkRow('Estrategia de Despliegue', e.desp)}
                ${mkRow('Beneficio Social/Económico', e.beneficio)}${mkRow('Actores Implicados', e.actores)}
            </div>
        </div>

        <div class="stack-r">
            <div class="eov-info-card glass cyber-panel">
                <div class="perf-header">
                    <div class="perf-title">Estándar de Desempeño</div>
                    <div class="perf-status">Validado</div>
                </div>
                <div style="margin-bottom:20px">
                    ${e.criterios ? mkCheck(e.criterios) : `<div style="color:var(--red); font-size:11px; font-style:italic; padding:10px; border:1px dashed var(--red); border-radius:6px; opacity:0.8">[PENDIENTE VALIDACIÓN DE CRITERIOS TÉCNICOS EN V0]</div>`}
                </div>
                <h6>📈 Indicadores de Control (KPI)</h6>
                <div class="mini-grid" style="margin-top:10px">
                    ${e.kpis ? mkMini(e.kpis, 'kpi-card') : `<div style="color:var(--red); font-size:10px; font-style:italic">[PENDIENTE VALIDACIÓN KPI]</div>`}
                </div>
            </div>

            <div class="eov-info-card glass" style="margin-top:20px">
                <h5>🔄 Flujo Sistemático (Niveles E1-E5)</h5>
                <div class="flow-wrap">
                    <div class="flow-level fl1"><div class="flow-lnum">1</div><div class="flow-lbody"><div class="fl-label">Estratégico</div><div class="fl-val" style="${!e.e1 ? 'color:var(--red); font-style:italic' : ''}">${e.e1 || '[PENDIENTE VALIDACIÓN E1]'}</div></div></div>
                    <div class="flow-arr">↓</div>
                    <div class="flow-level fl2"><div class="flow-lnum">2</div><div class="flow-lbody"><div class="fl-label">Operacional</div><div class="fl-val" style="${!e.e2 ? 'color:var(--red); font-style:italic' : ''}">${e.e2 || '[PENDIENTE VALIDACIÓN E2]'}</div></div></div>
                    <div class="flow-arr">↓</div>
                    <div class="flow-level fl3"><div class="flow-lnum">3</div><div class="flow-lbody"><div class="fl-label">Lógico</div><div class="fl-val" style="${!e.e3 ? 'color:var(--red); font-style:italic' : ''}">${e.e3 || '[PENDIENTE VALIDACIÓN E3]'}</div></div></div>
                    <div class="flow-arr">↓</div>
                    <div class="flow-level fl4"><div class="flow-lnum">4</div><div class="flow-lbody"><div class="fl-label">Sistémico</div><div class="fl-val" style="${!e.e4 ? 'color:var(--red); font-style:italic' : ''}">${e.e4 || '[PENDIENTE VALIDACIÓN E4]'}</div></div></div>
                    <div class="flow-arr">↓</div>
                    <div class="flow-level fl5"><div class="flow-lnum">5</div><div class="flow-lbody"><div class="fl-label">Físico</div><div class="fl-val" style="${!e.e5 ? 'color:var(--red); font-style:italic' : ''}">${e.e5 || '[PENDIENTE VALIDACIÓN E5]'}</div></div></div>
                </div>
            </div>

            <div class="eov-info-card glass" style="margin-top:20px">
                <h5>🚀 Evolución Tecnológica y Alertas</h5>
                <div class="pill-wrap">
                    <div class="pill">Reflejo: ${e.reflejo}</div>
                    <div class="pill">Conciencia: ${e.conciencia}</div>
                    <div class="pill">Estadio: ${e.estadio}</div>
                </div>
                <div style="margin-top:15px">
                    <h6>🚨 Alertas de Validación</h6>
                    <div class="mini-grid">${mkMini(e.alertas, 'alert-card')}</div>
                </div>
                <div style="margin-top:15px">
                    <h6>Future-Proof (Evolución)</h6>
                    <div class="mini-grid">${mkMini(e.evol, 'evol-card')}</div>
                </div>
            </div>
        </div>
    </div>`;

    if (bodyEl) bodyEl.innerHTML = bodyHtml;
    document.querySelectorAll('.nav-eov-btn').forEach(b => b.classList.remove('active'));
    const nb = document.getElementById('nav-' + id);
    if (nb) nb.classList.add('active');
    go('eov-detail');
}

// Build Matriz tables
window.buildTable = function(bodyId, data, cols, cntId, type) {
    const labels = {
        'dom-body': ['Código', 'Dominio ITS', 'Descripción'],
        'as-body': ['Código', 'Área de Servicio', 'Descripción'],
        'se-body': ['Código', 'Servicio Estratégico', 'Categoría'],
        'sub-body': ['Código', 'Sigla', 'Subsistema', 'Función', 'Descripción'],
        'fn-body': ['Código', 'Función', 'Descripción'],
        'cc-body': ['Código', 'Sigla', 'Componente', 'Capacidad']
    }[bodyId] || [];

    const tbody = document.getElementById(bodyId);
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        if (type === 'FN' || type === 'CC') {
            tr.onclick = (e) => {
                if (e.target.classList.contains('lnk')) return;
                showReverseLookup(row[0], row[1], type);
            };
        }
        tr.innerHTML = cols.map((c, i) => `<td class="${c}" data-label="${labels[i] || ''}">${row[i] || ''}</td>`).join('');
        tbody.appendChild(tr);
    });
    if (cntId) {
        const el = document.getElementById(cntId);
        if (el) el.textContent = `${data.length} registros`;
    }
};

// Filter tables
window.filterTable = function(tblId, q) {
    const lq = q.toLowerCase();
    let vis = 0;
    document.querySelectorAll('#' + tblId + ' tbody tr').forEach(tr => {
        tr.classList.remove('row-highlight');
        const m = lq === '' || tr.textContent.toLowerCase().includes(lq);
        tr.style.display = m ? '' : 'none';
        if (m) vis++;
    });
    const id = tblId.split('-')[0] + '-cnt';
    const el = document.getElementById(id);
    if (el) el.textContent = vis + ' registros';
};

// Filter SE by type
window.filterSE = function(type, btn) {
    document.querySelectorAll('#se-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    let vis = 0;
    document.querySelectorAll('#se-tbl tbody tr').forEach(tr => {
        const cat = tr.cells[2]?.textContent || '';
        const m = type === 'all' || (type === 'PMITS' && cat.includes('PMITS')) || (type === 'ISO' && cat.includes('ISO'));
        tr.style.display = m ? '' : 'none';
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
