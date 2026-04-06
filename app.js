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
                title = row[2];
                desc = row[4];
                tag = row[1]; // Sigla
            } else if (type === 'CC') {
                desc = row[3];
                tag = row[1]; // Sigla
            }

            card.onclick = () => {
                if (type === 'FN' || type === 'CC') {
                    showReverseLookup(code, title, type);
                }
            };

            card.innerHTML = `
                <div class="card-header">
                    <span class="card-code">${code}</span>
                    <span class="card-icon">${getIcon(title + ' ' + desc, code)}</span>
                </div>
                <div class="card-title">${title}</div>
                <div class="card-desc">${desc}</div>
                <div class="card-footer">
                    <span class="card-tag">${tag}</span>
                    <span class="card-btn">Ver Detalle <span style="font-size:12px">→</span></span>
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
    buildGrid('sub-grid', subs.map(r => [r.cod, r.sigla, r.name, r.fn, r.desc]), 'SUB');
    buildGrid('fn-grid', fns.map(r => [r.id || r.cod, r.name, r.desc]), 'FN');
    buildGrid('cc-grid', ccs.map(r => [r.id || r.cod, r.name, r.name, r.cap]), 'CC');

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

    const mkRow = (k, v) => `<div class="detail-row"><div class="detail-label">${k}</div><div class="detail-value">${(v && v !== 'N/A') ? v.toString().replace(/\n/g, '<br>') : `<span style="color:var(--red); font-style:italic; opacity:0.7">[PENDIENTE VALIDACIÓN]</span>`}</div></div>`;
    const mkRibbon = (num, title) => `<div class="section-ribbon"><div class="ribbon-num">${num}</div><div class="ribbon-title">${title}</div><div class="ribbon-line"></div></div>`;
    const mkMini = (arr, cls) => Array.isArray(arr) && arr.length ? arr.map(x => `<div class="mini-card ${cls}">${x.replace(/\n/g, '<br>')}</div>`).join('') : `<div style="color:var(--red); font-size:10px; font-style:italic; padding:10px; border:1px dashed var(--red); border-radius:6px">[PENDIENTE VALIDACIÓN]</div>`;
    const mkCheck = (arr) => Array.isArray(arr) ? arr.map(x => `<div class="val-check"><i>✓</i><div class="val-txt">${x}</div></div>`).join('') : '';
    const esc = (s) => (s || '').toString().replace(/'/g, "\\'").replace(/\n/g, ' ');

    const renderHierarchy6 = (e) => {
        const levels = [
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
    
    <div class="premium-container">
        <!-- ── HEADER ── -->
        <div class="premium-card" style="border-left: 6px solid var(--accent); padding-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <span class="nl-badge" style="margin-bottom: 15px; display: block;">Escenario Operativo de Validación</span>
                    <h2 style="font-family: 'Syne',sans-serif; font-size: 38px; line-height: 1; margin: 0;">${e.id} <span style="color:var(--text); font-weight:400; font-size:24px; margin-left:14px;">${e.name}</span></h2>
                </div>
                <div style="font-size: 60px; line-height: 1;">${e.ico}</div>
            </div>
        </div>

        <!-- ── 01. DEFINICIÓN ── -->
        <div class="premium-card">
            ${mkRibbon('01', 'Definición y Enfoque Operativo')}
            ${mkRow('Contexto', e.ctx)}
            ${mkRow('Motivación', e.mot)}
            ${mkRow('¿Qué es?', e.que)}
            ${mkRow('¿Para qué sirve?', e.para)}
            ${mkRow('¿En dónde ocurre?', e.donde)}
            ${mkRow('¿Cuándo ocurre?', e.cuando)}
            ${mkRow('Justificación Técnica', e.just)}
            ${mkRow('Estrategia de Despliegue', e.desp)}
            ${mkRow('Beneficio Social/Económico', e.beneficio)}
            ${mkRow('Actores Implicados', e.actores)}
            ${mkRow('Grupo de Interés Principal', e.grupo)}
        </div>

        <!-- ── 02. ARQUITECTURA ── -->
        <div class="premium-card">
            ${mkRibbon('02', 'Arquitectura ITS y Referencia')}
            <div style="margin-bottom: 24px;">
                ${renderHierarchy6(e)}
            </div>
            ${mkRow('Estándares y Protocolos', e.std)}
            ${mkRow('Marco Normativo', e.marco)}
            ${mkRow('Ciberseguridad del Nodo', e.cyber)}
        </div>

        <!-- ── 03. FLUJO E1-E5 ── -->
        <div class="premium-card">
            ${mkRibbon('03', 'Flujo Sistemático (Modelo ARC-IT)')}
            <div class="flow-wrap" style="max-width: 800px; margin: 0 auto;">
                <div class="flow-level fl1"><div class="flow-lnum">1</div><div class="flow-lbody"><div class="fl-label">Estratégico</div><div class="fl-val" style="${!e.e1 ? 'color:var(--red); font-style:italic' : ''}">${e.e1 || '[PENDIENTE VALIDACIÓN]'}</div></div></div>
                <div class="flow-connector-v"></div>
                <div class="flow-level fl2"><div class="flow-lnum">2</div><div class="flow-lbody"><div class="fl-label">Operacional</div><div class="fl-val" style="${!e.e2 ? 'color:var(--red); font-style:italic' : ''}">${e.e2 || '[PENDIENTE VALIDACIÓN]'}</div></div></div>
                <div class="flow-connector-v"></div>
                <div class="flow-level fl3"><div class="flow-lnum">3</div><div class="flow-lbody"><div class="fl-label">Lógico</div><div class="fl-val" style="${!e.e3 ? 'color:var(--red); font-style:italic' : ''}">${e.e3 || '[PENDIENTE VALIDACIÓN]'}</div></div></div>
                <div class="flow-connector-v"></div>
                <div class="flow-level fl4"><div class="flow-lnum">4</div><div class="flow-lbody"><div class="fl-label">Sistémico</div><div class="fl-val" style="${!e.e4 ? 'color:var(--red); font-style:italic' : ''}">${e.e4 || '[PENDIENTE VALIDACIÓN]'}</div></div></div>
                <div class="flow-connector-v"></div>
                <div class="flow-level fl5"><div class="flow-lnum">5</div><div class="flow-lbody"><div class="fl-label">Físico</div><div class="fl-val" style="${!e.e5 ? 'color:var(--red); font-style:italic' : ''}">${e.e5 || '[PENDIENTE VALIDACIÓN]'}</div></div></div>
            </div>
        </div>

        <!-- ── 04. TRANSACCIONAL ── -->
        <div class="premium-card">
            ${mkRibbon('04', 'Interacción y Estado Transaccional')}
            ${mkRow('Reflejo (Centro de Control)', e.reflejo)}
            ${mkRow('Conciencia (BIM/Digital Twin)', e.conciencia)}
            ${mkRow('Estadio de Operación', e.estadio)}
        </div>

        <!-- ── 05. ALERTAS ── -->
        <div class="premium-card">
            ${mkRibbon('05', 'Alertas de Validación del Sistema')}
            <div class="mini-grid">
                ${mkMini(e.alertas, 'alert-card')}
            </div>
        </div>

        <!-- ── 06. USUARIO ── -->
        <div class="premium-card">
            ${mkRibbon('06', 'Información al Usuario y Difusión')}
            ${mkRow('Protocolo de Publicación', e.publicacion)}
            ${mkRow('Canales Digitales Habilitados', e.canales)}
        </div>

        <!-- ── 07. CONTINGENCIA ── -->
        <div class="premium-card">
            ${mkRibbon('07', 'Continuidad y Protocolos de Contingencia')}
            <div class="mini-grid">
                ${mkMini(e.contingencia, 'cont-card')}
            </div>
        </div>

        <!-- ── 08. CRITERIOS ── -->
        <div class="premium-card cyber-panel">
            ${mkRibbon('08', 'Criterios de Aceptación de Referencia')}
            <div style="margin-top:20px; display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="v-checks">${mkCheck(e.criterios)}</div>
                <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:12px; border:1px solid var(--border)">
                    <div class="perf-status" style="margin-bottom:10px">Certificación Técnica</div>
                    <p style="font-size:12px; color:var(--muted); line-height:1.6">Este escenario cumple con los requisitos de interoperabilidad exigidos por la Res. 20223040028675 y el estándar ARC-IT.</p>
                </div>
            </div>
        </div>

        <!-- ── 09. EVOLUCIÓN ── -->
        <div class="premium-card">
            ${mkRibbon('09', 'Future-Proof (Evolución Tecnológica)')}
            <div class="mini-grid">
                ${mkMini(e.evolucion, 'evol-card')}
            </div>
        </div>

        <!-- ── 10. KPIs ── -->
        <div class="premium-card">
            ${mkRibbon('10', 'Indicadores Clave de Desempeño (KPIs)')}
            <div class="mini-grid">
                ${mkMini(e.kpis, 'kpi-card')}
            </div>
        </div>
    </div>`;

    if (bodyEl) bodyEl.innerHTML = bodyHtml;
    document.querySelectorAll('.nav-eov-btn').forEach(b => b.classList.remove('active'));
    const nb = document.getElementById('nav-' + id);
    if (nb) nb.classList.add('active');
    go('eov-detail');
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
