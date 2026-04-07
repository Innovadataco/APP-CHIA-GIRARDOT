const fs = require('fs');
const data = JSON.parse(fs.readFileSync('official_data.json'));
const fns = data.fn.map(r => [r.id || r.cod, r.name, r.desc]);
const ccs = data.cc.map(r => [r.id || r.cod, r.sigla, r.name, r.cap]);
console.log("FNS count:", fns.length, "| Example:", fns[0]);
console.log("CCS count:", ccs.length, "| Example:", ccs[0]);

const kpis = data.eov[0].kpis.map(k => {
    const idx = k.indexOf(':');
    const l = idx >= 0 ? k.substring(0, idx) : k;
    const v = idx >= 0 ? k.substring(idx + 1) : '';
    return [l.trim(), v.trim()];
});
console.log("KPI Example:", kpis[0]);
