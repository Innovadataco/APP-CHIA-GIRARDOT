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

// ARCHITECT COCKPIT V3 - Side Navigation Generator
async function renderEOVQuickNav(activeId) {
    const eovs = await itsDb.getAll('eov');
    const navList = document.getElementById('eov-quicknav');
    if (!navList) return;

    navList.innerHTML = `
        <div class="cn-header">
            <div class="cn-title">Quick Navigation</div>
        </div>
        <div class="cn-list">
            ${eovs.map(e => `
                <div class="cn-item ${e.id === activeId ? 'active' : ''}" onclick="showEOV('${e.id}')">
                    <div class="cn-ico">${e.ico}</div>
                    <div class="cn-body">
                        <div class="cn-id">${e.id}</div>
                        <div class="cn-name">${e.name}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// EOV detail renderer (COCKPIT V3)
async function showEOV(id) {
    let rawEov = await itsDb.get('eov', id);
    if (!rawEov) return;
    
    const e = await itsDb.queryRelationships(rawEov);
    const typeLabel = e.type === 'p' ? 'Prioritario' : e.type === 'c' ? 'Complementario' : 'Futuro';
    const tclr = e.type === 'p' ? 'var(--accent)' : e.type === 'c' ? 'var(--green)' : 'var(--purple)';

    // Update QuickNav
    await renderEOVQuickNav(id);

    const mkCheck = (arr) => Array.isArray(arr) ? arr.map(x => `<div class="val-check"><i>✓</i><div class="val-txt">${x}</div></div>`).join('') : '';
    const mkMini = (arr, cls) => Array.isArray(arr) && arr.length ? arr.map(x => `<div class="mini-card ${cls}">${x.replace(/\n/g, '<br>')}</div>`).join('') : '<div class="no-data">[PENDIENTE]</div>';
    const esc = (s) => (s || '').toString().replace(/'/g, "\\'").replace(/\n/g, ' ');

    const cockpitHtml = `
    <div class="stage-anim">
        <!-- ── BLUEPRINT HEADER (HUD) ── -->
        <header class="hud-header">
            <div class="hud-l">
                 <span class="hud-ey">SCENARIO_VALIDATION_MODULE // V1.0.5</span>
                 <h1 class="hud-h1">${e.id}: ${e.name}</h1>
                 <div style="margin-top:10px; display:flex; gap:10px;">
                    <span class="card-code">${typeLabel}</span>
                    <span class="card-code" style="background:rgba(255,255,255,0.05); color:#94a3b8; border-color:rgba(255,255,255,0.1)">Estandar ARC-IT</span>
                 </div>
            </div>
            <div class="hud-r">
                <div class="hud-kpi">
                    <span class="hud-kv">${e.km || '306'} km</span>
                    <span class="hud-kl">Cobertura Vial</span>
                </div>
                <div class="hud-kpi">
                    <span class="hud-kv">100%</span>
                    <span class="hud-kl">Fidelidad Datos</span>
                </div>
                <div onclick="go('eov-list')" class="back-btn" style="margin:0; height:fit-content; align-self:center;">✕ Cerrar Cockpit</div>
            </div>
        </header>

        <!-- ── LAYER 01: BLUEPRINT META ── -->
        <section class="bp-meta-grid">
            <div class="bp-card">
                <h4>Contexto Operativo</h4>
                <p>${e.ctx || 'Sin descripción de contexto registrada.'}</p>
            </div>
            <div class="bp-card">
                <h4>Justificación Técnica</h4>
                <p>${e.just || 'Sin justificación técnica disponible.'}</p>
            </div>
            <div class="bp-card">
                <h4>Estrategia Despliegue</h4>
                <p>${e.desp || 'Definición de despliegue en proceso.'}</p>
            </div>
        </section>

        <!-- ── LAYER 02: ARCHITECTURE CONNECT ── -->
        <section class="blueprint-panel">
            <div class="cn-title" style="margin-bottom:30px; opacity:0.6">Arquitectura Sistemática (Modelo de Capas ARC-IT)</div>
            <div class="blueprint-flow">
                <div class="blueprint-node">
                    <div class="bp-icon">🏛️</div>
                    <div class="bp-info">
                        <div class="bp-lbl">E1: Estratégico</div>
                        <div class="bp-val">${e.e1 || '...'}</div>
                    </div>
                    <div class="bp-line"></div>
                </div>
                <div class="blueprint-node">
                    <div class="bp-icon">📄</div>
                    <div class="bp-info">
                        <div class="bp-lbl">E2: Operacional</div>
                        <div class="bp-val">${e.e2 || '...'}</div>
                    </div>
                    <div class="bp-line"></div>
                </div>
                <div class="blueprint-node">
                    <div class="bp-icon">🖥️</div>
                    <div class="bp-info">
                        <div class="bp-lbl">E3: Lógico</div>
                        <div class="bp-val">${e.e3 || '...'}</div>
                    </div>
                    <div class="bp-line"></div>
                </div>
                <div class="blueprint-node">
                    <div class="bp-icon">⚙️</div>
                    <div class="bp-info">
                        <div class="bp-lbl">E4: Sistémico</div>
                        <div class="bp-val">${e.e4 || '...'}</div>
                    </div>
                    <div class="bp-line"></div>
                </div>
                <div class="blueprint-node">
                    <div class="bp-icon">📡</div>
                    <div class="bp-info">
                        <div class="bp-lbl">E5: Físico</div>
                        <div class="bp-val">${e.e5 || '...'}</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── LAYER 03: CONTROL & VALIDATION ── -->
        <section class="cockpit-footer">
            <div class="cf-card">
                <div class="cn-title" style="margin-bottom:20px; opacity:0.6">Seguridad y Continuidad</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <div>
                        <div class="bp-lbl">Alertas de Sistema</div>
                        <div class="mini-grid">${mkMini(e.alertas, 'alert-card')}</div>
                    </div>
                    <div>
                        <div class="bp-lbl">Protocolo Contingencia</div>
                        <div class="mini-grid">${mkMini(e.contingencia, 'cont-card')}</div>
                    </div>
                </div>
            </div>
            <div class="cf-card">
                 <div class="cn-title" style="margin-bottom:20px; opacity:0.6">Criterios de Aceptación</div>
                 <div class="v-checks">${mkCheck(e.criterios)}</div>
            </div>
        </section>
    </div>
    `;

    document.getElementById('eov-d-body').innerHTML = cockpitHtml;
    
    // UI Transitions
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
