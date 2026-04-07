const fs = require('fs');
const data = JSON.parse(fs.readFileSync('official_data.json'));

const getIcon = (txt, code) => {
    const exactIcons = {
        'cctv': '📹', 'aid': '🚨', 'dms': '📟', 'vms': '📟', 'sos': '🆘', 'ecs': '🆘',
        'vds': '📊', 'tds': '📊', 'ess': '🌡️', 'rwis': '🌡️', 'wim': '⚖️', 'gms': '��️', 'gms-i': '🏔️',
        'sms': '🏗️', 'sbt': '🏗️', 'pss': '🏗️', 'wls': '💧', 'avi': '💳', 'etc': '💳', 'alpr': '🆔', 'lpr': '🆔',
        'spd': '📡', 'vsl': '📡', 'tcs': '🚇', 'evcs': '⚡', 'ups': '⚡', 'eps': '⚡', 'msg': '⚡',
        'pas': '��', 'bcs': '🚲', 'vru': '🚲', 'uas': '🚁', 'uav': '🚁', 'ads': '🚁', 
        'vis': '💡', 'lgs': '��', 'slp': '💡', 'csg': '🛡️', 'psv': '🛡️',
        'foc': '🧵', 'rcs': '📻', 'sme': '📱', 'pgs': '🅿️',
        'rsu': '📶', 'v2x': '📶', 'sat': '📶', 'sat-b': '📶',
        'avl': '🚚', 'obu': '🚚', 'e-log': '🚚',
        'lcs': '🚦', 'sig': '🚦', 'wda': '🦌', 'd-twn': '🌐', 'aqm': '🌫️', 'war': '🏢'
    };

    const codeLower = String(code || txt).toLowerCase();
    for (const [sigla, icon] of Object.entries(exactIcons)) {
        if (new RegExp(`\\b${sigla}\\b`, 'i').test(codeLower) || codeLower.includes(`-${sigla}`) || codeLower.includes(`${sigla}-`)) {
            return icon;
        }
    }

    const t = (txt + ' ' + code).toLowerCase();
    const icons = {
        '📹': ['video', 'vigilancia'],
        '🚨': ['incidentes', 'incendio'],
        '📟': ['mensajería', 'paneles', 'panel'],
        '🆘': ['emergencia'],
        '📊': ['contadores', 'tráfico'],
        '🌡️': ['ambientales', 'clima'],
        '⚖️': ['pesaje'],
        '🏔️': ['inclinometría', 'geotécnica', 'geo'],
        '🏗️': ['estructuras', 'postes'],
        '💧': ['hídrico', 'agua'],
        '💳': ['peaje', 'pago'],
        '🆔': ['placas'],
        '📡': ['velocidad', 'radar'],
        '🚇': ['túneles', 'túnel'],
        '⚡': ['electrolineras', 'energ'],
        '📢': ['megafonía', 'audio'],
        '🚲': ['ciclistas', 'bicicleta'],
        '🚁': ['drones'],
        '💡': ['iluminación', 'solar', 'luz'],
        '🛡️': ['ciberseguridad', 'ciudadana', 'seguridad', 'segurid'],
        '🧵': ['fibra', 'óptica'],
        '📻': ['radial', 'radio'],
        '📱': ['sociales', 'app', 'usuario'],
        '📶': ['conectividad', 'comunicación'],
        '🚚': ['flota', 'carga'],
        '🅿️': ['parqueaderos', 'parqueo'],
        '🚦': ['carril', 'semaforo', 'semáforo'],
        '🦌': ['fauna', 'animal'],
        '🌐': ['gemelo', 'digital'],
        '🌫️': ['calidad', 'aire'],
        '🏢': ['centro', 'control', 'sala', 'crisis']
    };
    for (const [icon, keys] of Object.entries(icons)) {
        if (keys.some(k => new RegExp(`\\b${k}\\b`, 'i').test(t))) return icon;
    }
    return '📑';
};

const res = {};
data.cc.forEach(r => {
    let title = r.name;
    let desc = r.cap;
    let code = r.id;
    let sigla = r.sigla;
    let icon = getIcon(title + ' ' + desc, sigla || code);
    if (!res[icon]) res[icon] = [];
    res[icon].push(`${r.sigla}`);
});

console.log(res);
